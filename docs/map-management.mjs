import * as C from './core.mjs?v=0.21.2';
const read=(f,p)=>JSON.parse(C.strFromU8(f.get(p))),encode=o=>C.strToU8(JSON.stringify(o,null,2)+'\n');
export const PROPERTY_FIELDS={music:'MUS_',weather:'WEATHER_',map_type:'MAP_TYPE_',region_map_section:'MAPSEC_',battle_scene:'MAP_BATTLE_SCENE_'};
export const PROPERTY_FLAGS=['requires_flash','allow_running','allow_cycling','allow_escaping','show_map_name'];
export function planProperties(files,path,patch,allowed){
 const doc=read(files,path);for(const[k,v]of Object.entries(patch)){if(PROPERTY_FLAGS.includes(k)){if(typeof doc[k]!=='boolean'||typeof v!=='boolean')throw Error('This project does not expose '+k+' as a boolean.');}else if(k in PROPERTY_FIELDS){if(v!==doc[k]&&!allowed[k]?.includes(v))throw Error('Select a declared project value for '+k);}else throw Error('Unsupported map property');doc[k]=v;}
 return [{path,before:files.get(path),after:encode(doc)}];
}
export function replaceTiles(bytes,width,height,from,to){
 if(![from,to].every(n=>Number.isInteger(n)&&n>=0&&n<=1023))throw Error('Choose tile IDs from 0 to 1023.');const cells=C.decodeBlocks(bytes,width,height);let count=0;
 for(let i=0;i<cells.length;i++)if((cells[i]&1023)===from){cells[i]=C.paintBlock(cells[i],to,null,null);count++;}return {bytes:C.encodeBlocks(cells),count};
}
export function shiftMap(bytes,width,height,dx,dy){
 if(![dx,dy].every(n=>Number.isInteger(n)&&Math.abs(n)<=512))throw Error('Shift must be whole tile steps between -512 and 512.');const old=C.decodeBlocks(bytes,width,height),next=old.slice();for(let y=0;y<height;y++)for(let x=0;x<width;x++)next[((y+dy)%height+height)%height*width+((x+dx)%width+width)%width]=old[y*width+x];return C.encodeBlocks(next);
}
const reverse={up:'down',down:'up',left:'right',right:'left',dive:'emerge',emerge:'dive'};
export function connectionGeometry(source,destination,direction,offset){
 let x=0,y=0;if(direction==='up'){x=offset;y=-destination.height;}else if(direction==='down'){x=offset;y=source.height;}else if(direction==='left'){x=-destination.width;y=offset;}else if(direction==='right'){x=source.width;y=offset;}
 return {x,y,width:destination.width,height:destination.height};
}
export function planConnection(files,{sourcePath,destinationPath,direction,offset=0,mirror=true,remove=false}){
 if(sourcePath===destinationPath)throw Error('Choose a different destination map.');if(!reverse[direction]||!Number.isInteger(offset)||offset<-32768||offset>32767)throw Error('Choose a valid direction and whole-number offset.');if(['dive','emerge'].includes(direction))offset=0;
 const source=read(files,sourcePath),dest=read(files,destinationPath),layouts=read(files,'data/layouts/layouts.json').layouts,s=layouts.find(l=>l.id===source.layout),d=layouts.find(l=>l.id===dest.layout);if(!s||!d)throw Error('Both map layouts must be available.');
 if(!remove&&!['dive','emerge'].includes(direction)){const axis=['up','down'].includes(direction)?'width':'height';if(offset>=s[axis]||offset+d[axis]<=0)throw Error('The map edges do not overlap. Adjust the offset.');}
 const opposite=reverse[direction],list=source.connections||[],back=dest.connections||[];if(!Array.isArray(list)||!Array.isArray(back))throw Error('Unsupported connection table.');
 const matches=list.filter(c=>c.direction===direction&&c.map===dest.id),other=list.filter(c=>c.direction===direction&&c.map!==dest.id);if(matches.length>1)throw Error('Duplicate source connections need manual review.');
 if(remove&&!matches.length)throw Error('There is no matching connection to remove.');if(!remove&&!matches.length&&other.length)throw Error('Another map already uses this direction. Review/remove it first.');
 const backs=back.filter(c=>c.direction===opposite&&c.map===source.id);if(mirror&&(backs.length>1||!backs.length&&back.some(c=>c.direction===opposite)))throw Error('The destination edge already has a different or ambiguous connection.');
 if(remove&&mirror&&backs.length&&Number(backs[0].offset)!==-Number(matches[0].offset))throw Error('The return offset differs. Review that map before removing both sides.');
 source.connections=list.filter(c=>!matches.includes(c));if(!remove)source.connections.push({...matches[0],map:dest.id,direction,offset});if(!source.connections.length)source.connections=null;
 if(mirror){dest.connections=back.filter(c=>!backs.includes(c));if(!remove)dest.connections.push({...backs[0],map:source.id,direction:opposite,offset:-offset});if(!dest.connections.length)dest.connections=null;}
 return {source:s,destination:d,geometry:connectionGeometry(s,d,direction,offset),changes:[{path:sourcePath,before:files.get(sourcePath),after:encode(source)},...(mirror?[{path:destinationPath,before:files.get(destinationPath),after:encode(dest)}]:[])]};
}
