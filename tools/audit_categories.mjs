// Read-only category inventory for a local source checkout. No game assets are bundled.
import fs from 'node:fs';
import path from 'node:path';
import * as C from '../dist/core.mjs';
import * as P from '../dist/project.mjs';
import {reviewedCategories} from '../dist/reviewed-categories.mjs';
const root=path.resolve(process.argv[2]||''),files=new Map();
if(!process.argv[2]||!fs.existsSync(path.join(root,'data/layouts/layouts.json')))throw Error('Usage: node tools/audit_categories.mjs /path/to/source [report.json]');
function read(p,optional=false){C.safePath(p);if(files.has(p))return files.get(p);const abs=path.resolve(root,p);if(!abs.startsWith(root+path.sep))throw Error('Path leaves source root');if(optional&&!fs.existsSync(abs))return null;const b=new Uint8Array(fs.readFileSync(abs));files.set(p,b);return b;}
function headers(dir){for(const e of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())headers(p);else if(e.name.endsWith('.h'))read(p);}}
headers('src/data/tilesets');for(const p of ['src/graphics.c','include/constants/metatile_labels.h','include/constants/metatile_behaviors.h'])read(p,true);
const layouts=JSON.parse(C.strFromU8(read('data/layouts/layouts.json'))).layouts,definitions=new Map(),seenPairs=new Set(),seenTiles=new Set(),rows=[],summary={},defaultPair=[];
function definition(symbol){if(!symbol||symbol==='0')return {symbol:'No secondary',meta:new Uint8Array(),attr:new Uint8Array()};if(!definitions.has(symbol)){const d=C.resolveTileset(files,symbol);definitions.set(symbol,{...d,meta:read(d.metatiles),attr:read(d.attributes)});}return definitions.get(symbol);}
for(const layout of layouts){
 const format=P.layoutFormat(layout),key=[format,layout.primary_tileset,layout.secondary_tileset].join(':');if(seenPairs.has(key))continue;seenPairs.add(key);
 const sets=[definition(layout.primary_tileset),definition(layout.secondary_tileset)];
 // Artwork reviews only need image bytes for their exact declared pair.
 for(const d of sets)if(d.image)read(d.image,true);
 const info=await reviewedCategories(P.metatileInfo(files,sets,format),files,sets,format);
 for(const [id,tile]of info){const identity=P.tileIdentity(format,tile);if(seenTiles.has(identity))continue;seenTiles.add(identity);const row={format,id,...tile};rows.push(row);summary[tile.category]=(summary[tile.category]||0)+1;}
 if(/^LittlerootTown(?:_Layout)?$/i.test(layout.name||''))defaultPair.push(...[...info].map(([id,tile])=>({id,...tile})));
}
const report={layouts:layouts.length,sourceSymbols:definitions.size,uniqueMetatileFiles:new Set([...definitions.values()].map(d=>d.metatiles)).size,pairs:seenPairs.size,sourceLocalIdentities:rows.length,summary,littleroot:defaultPair,rows,notes:'Each format/source/local ID is counted once using its first actual pair. Shared-file variants count separately. Map-event hints are not included. This is metadata inventory, not an assertion that every tile was visually reviewed.'};
if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,littleroot:undefined,rows:undefined},null,2));
