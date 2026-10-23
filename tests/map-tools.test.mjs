import test from 'node:test';import assert from 'node:assert/strict';
import {rectBetween,captureArea,pairKey,stampArea,validStamp,rulerDistance} from '../dist/map-tools.mjs';
import * as C from '../dist/core.mjs';
test('area selection normalizes reverse drags, clips map edges and captures an independent word copy',()=>{
 const cells=Uint16Array.from({length:30},(_,i)=>i|((i%4)<<10)|((i%16)<<12)),r=rectBetween({x:4,y:3},{x:2,y:1},6,5);
 assert.deepEqual(r,{x:2,y:1,w:3,h:3});const s=captureArea(cells,6,5,r,'pair');assert.deepEqual(s.words,[8,9,10,14,15,16,20,21,22].map(i=>cells[i]));cells[8]=0;assert.notEqual(s.words[0],0);assert(validStamp(s));
 assert.deepEqual(rectBetween({x:4,y:3},{x:99,y:99},6,5),{x:4,y:3,w:2,h:2});assert.throws(()=>captureArea(cells,6,5,{x:0,y:0,w:65,h:1},'pair'));
});
test('every block value preserves unselected fields during art and movement stamps',()=>{
 const s={name:'one',w:1,h:1,key:'pair',words:[0xabcd]},cells=new Uint16Array(1);
 for(let word=0;word<65536;word++){cells[0]=word;stampArea(cells,1,1,s,0,0,'art','pair');assert.equal(cells[0],(word&0xfc00)|(0xabcd&1023));cells[0]=word;stampArea(cells,1,1,s,0,0,'movement','different');assert.equal(cells[0],(word&1023)|(0xabcd&0xfc00));}
});
test('stamping clips edges without wrapping rows; full-word mode includes movement; incompatible art refuses all writes',()=>{
 const s={name:'two',w:2,h:2,key:'pair',words:[0xffff,0x4321,0x9876,0xabcd]},cells=new Uint16Array(6).fill(7),before=cells.slice();
 assert.throws(()=>stampArea(cells,3,2,s,1,0,'art','other'));assert.deepEqual(cells,before);
 assert.deepEqual(stampArea(cells,3,2,s,2,1,'all','pair'),{changed:1,placed:1,clipped:3});assert.deepEqual([...cells],[7,7,7,7,7,65535]);assert.throws(()=>stampArea(cells,3,2,{...s,words:[1]},0,0,'all','pair'));
});
test('stamp compatibility includes format, both source symbols and asset paths; ruler uses tile-step distance',()=>{
 const sets=[{symbol:'A',metatiles:'a.bin',image:'a.png'},{symbol:'B',metatiles:'b.bin',image:'b.png'}],key=pairKey({layout_version:'emerald'},sets);
 assert.notEqual(key,pairKey({layout_version:'frlg'},sets));assert.notEqual(key,pairKey({layout_version:'emerald'},[sets[0],{...sets[1],metatiles:'other.bin'}]));
 assert.deepEqual(rulerDistance({x:7,y:8},{x:3,y:10}),{dx:-4,dy:2,steps:6,width:5,height:3});
});
test('portable source ZIP retains stamp metadata independently from game block data and baseline',()=>{
 const words=Uint16Array.from([0x3001,0x7402,0xb803,0xfc04]),stamp=captureArea(words,2,2,{x:0,y:0,w:2,h:2},'pair','Corner');
 const meta={format:'tileforge-project',formatVersion:1,areas:{stamps:[stamp]},baseline:{'data/layouts/Test/map.bin':'unchanged-baseline'}},zip=C.zipSync({'data/layouts/layouts.json':C.strToU8('{"layouts":[]}'),'data/layouts/Test/map.bin':C.encodeBlocks(words),'tileforge-project.json':C.strToU8(JSON.stringify(meta))}),files=C.sourceZip(zip),saved=JSON.parse(C.strFromU8(files.get('tileforge-project.json')));
 assert.deepEqual(saved,meta);assert(validStamp(saved.areas.stamps[0]));assert.deepEqual(C.decodeBlocks(files.get('data/layouts/Test/map.bin'),2,2),words);
});
