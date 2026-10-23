import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../dist/core.mjs';
import {unpackPiece,packPiece,readMetatile,patchMetatile,sourceSplit,pieceSheet,palettePath,validatePieces,paletteRows,patchPalette,assertSnapshot,assetImpact} from '../dist/tileset-editor.mjs';

test('all 65536 piece words round-trip without losing tile, palette or flips',()=>{
 for(let word=0;word<65536;word++)assert.equal(packPiece(unpackPiece(word)),word);
 for(const tile of [-1,1024,1.1,NaN])assert.throws(()=>packPiece({tile,palette:0}));
 assert.throws(()=>packPiece({tile:0,palette:16}));
});
test('metatile editing changes only one chosen 16-byte entry, never its neighbors',()=>{
 const bytes=Uint8Array.from({length:64},(_,i)=>i*7&255),original=bytes.slice(),before=readMetatile(bytes,2);
 for(let piece=0;piece<8;piece++){
  const words=before.slice();words[piece]^=65535;const after=patchMetatile(bytes,2,words);
  assert.deepEqual(bytes,original);assert.deepEqual(readMetatile(after,2),words);
  for(let i=0;i<64;i++)if(i<32+piece*2||i>33+piece*2)assert.equal(after[i],bytes[i]);
 }
 assert.throws(()=>readMetatile(new Uint8Array(17),0));assert.throws(()=>readMetatile(bytes,4));assert.throws(()=>patchMetatile(bytes,0,[1]));
});
const png=(tiles)=>({w:128,h:Math.ceil(tiles/16)*8,pixels:new Uint8Array(128*Math.ceil(tiles/16)*8)});
const sets=[{png:png(512),palettes:Array.from({length:13},(_,i)=>'primary/'+i+'.pal')},{png:png(32),palettes:Array.from({length:13},(_,i)=>'secondary/'+i+'.pal')}];
test('Emerald and FRLG splits use declared palette paths and source sheet bounds',()=>{
 assert.deepEqual(sourceSplit('frlg'),{tiles:640,meta:640,pals:7});assert.throws(()=>sourceSplit('custom'));
 assert.equal(pieceSheet(sets,'emerald',512).local,0);assert.equal(pieceSheet(sets,'emerald',543).local,31);assert.throws(()=>pieceSheet(sets,'emerald',544));
 assert.throws(()=>pieceSheet(sets,'frlg',639));assert.equal(pieceSheet(sets,'frlg',640).source,1);
 assert.equal(palettePath(sets,'emerald',6),'secondary/6.pal');assert.equal(palettePath(sets,'frlg',6),'primary/6.pal');
 assert.throws(()=>palettePath(sets,'frlg',13));assert.equal(palettePath([sets[0],{...sets[1],swapPalettes:0x42}],'emerald',6),'secondary/6.pal'); // Legends flag selects alternate night palettes; daytime source mapping remains valid.
 const old=Array(8).fill(0xf3ff);validatePieces(old,old,sets,'emerald');
 const changed=old.slice();changed[0]=packPiece({tile:512,palette:6,xflip:true});validatePieces(old,changed,sets,'emerald');
 changed[0]=packPiece({tile:544,palette:6});assert.throws(()=>validatePieces(old,changed,sets,'emerald'));
 changed[0]=packPiece({tile:1,palette:13});assert.throws(()=>validatePieces(old,changed,sets,'emerald'));
});
test('palette editing preserves newline style, other RGB rows, extra colors and source bytes',()=>{
 for(const nl of ['\n','\r\n','\r']){
  const rows=['JASC-PAL','0100','32',...Array.from({length:32},(_,i)=>` ${i}  ${i+1}\t${i+2} `),''],source=C.strToU8(rows.join(nl)),copy=source.slice(),after=patchPalette(source,7,[31,0,16]),actual=C.strFromU8(after).split(nl);
  assert.deepEqual(source,copy);for(let i=0;i<rows.length;i++)if(i!==10)assert.equal(actual[i],rows[i]);
  assert.equal(actual[10],' 255 0 132 ');assert.deepEqual(paletteRows(after).colors[7],[255,0,132]);
  // The game converts stored RGB channels to 5 bits by shifting right three.
  for(let n=0;n<32;n++)assert.equal(paletteRows(patchPalette(source,0,[n,n,n])).colors[0][0]>>3,n);
 }
 assert.throws(()=>patchPalette(C.writePal(Array(16).fill([0,0,0])),16,[0,0,0]));
 assert.throws(()=>patchPalette(C.writePal(Array(16).fill([0,0,0])),0,[-1,0,0]));
 assert.throws(()=>paletteRows(C.strToU8('JASC-PAL\n0100\n16\n0 0 0')));
});
test('source snapshot rejects stale shared files before any write',()=>{
 const bytes=new Uint8Array([1,2,3]),snapshot=new Map([['asset',bytes.slice()]]),files=new Map([['asset',bytes.slice()]]);
 assertSnapshot(files,snapshot);files.get('asset')[2]=9;assert.throws(()=>assertSnapshot(files,snapshot),/Source changed/);assert.deepEqual(snapshot.get('asset'),bytes);
});
test('shared impact includes alias symbols resolving the same actual custom asset path',()=>{
 const def=name=>`const struct Tileset ${name} = { .tiles = gTiles, .palettes = gPals, .metatiles = gMeta, .metatileAttributes = gAttr };`;
 const files=new Map([['src/data/tilesets/test.h',C.strToU8('const u32 gTiles[] = INCGFX_U32("data/tilesets/custom/picture.png", ".4bpp");\nconst u16 gPals[][16] = { INCGFX_U16("data/tilesets/custom/day.pal", ".gbapal") };\nconst u16 gMeta[] = INCBIN_U16("data/tilesets/custom/shared.bin");\nconst u16 gAttr[] = INCBIN_U16("data/tilesets/custom/attr.bin");\n'+def('gTileset_A')+'\n'+def('gTileset_B'))]]);
 const layouts=[{id:'A',primary_tileset:'gTileset_A'},{id:'B',secondary_tileset:'gTileset_B'},{id:'C',primary_tileset:'gTileset_Missing'}];
 assert.deepEqual(assetImpact(files,layouts,'data/tilesets/custom/shared.bin'),{layouts:['A','B'],unresolved:['gTileset_Missing']});
});
test('composition and palette edits survive project ZIP with exact baseline and binary undo',()=>{
 const baseMeta=new Uint8Array(32),basePal=C.writePal(Array(16).fill([0,0,0])),originalMap=new Uint8Array([255,255,0,0]),attr=new Uint8Array([255,255]);
 const afterMeta=patchMetatile(baseMeta,1,[0,1,2,3,4,5,6,7]),afterPal=patchPalette(basePal,5,[31,7,0]);
 const files=new Map([['data/layouts/layouts.json',C.strToU8('{"layouts":[]}')],['data/layouts/Test/map.bin',originalMap],['data/tilesets/custom/metatiles.bin',afterMeta],['data/tilesets/custom/day.pal',afterPal],['data/tilesets/custom/attributes.bin',attr]]);
 const baseline=new Map(files);baseline.set('data/tilesets/custom/metatiles.bin',baseMeta);baseline.set('data/tilesets/custom/day.pal',basePal);
 const changed=C.changedFiles(baseline,files);assert.equal(changed.length,2);
 const decoded=C.sourceZip(C.zipSync(Object.fromEntries(files)));
 assert.deepEqual(decoded.get('data/tilesets/custom/metatiles.bin'),afterMeta);assert.deepEqual(decoded.get('data/tilesets/custom/day.pal'),afterPal);assert.deepEqual(decoded.get('data/layouts/Test/map.bin'),originalMap);assert.deepEqual(decoded.get('data/tilesets/custom/attributes.bin'),attr);
 for(const [path]of changed)decoded.set(path,baseline.get(path).slice());assert.equal(C.changedFiles(baseline,decoded).length,0);
});
