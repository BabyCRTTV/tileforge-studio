import {strFromU8,strToU8} from './core.mjs?v=0.4.1';
export const CATEGORIES=['Cliffs','Water','Signs','Buildings & doors','Stairs & bridges','Trees & plants','Ground & paths','Rocks & caves','Furniture & interiors','Fences & edges','Other'];
export const layoutFormat=l=>['frlg','firered'].includes(l?.layout_version)?'frlg':'emerald';
export const friendly=s=>String(s).replace(/^gTileset_|^OBJ_EVENT_GFX_|^MOVEMENT_TYPE_|_Layout$/g,'').replace(/_/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2');
export function defaultLayout(layouts,selectedId){return layouts.find(l=>l.id===selectedId)||layouts.find(l=>/^LittlerootTown(?:_Layout)?$/i.test(l.name||''))||layouts[0];}
export function tileIdentity(format,info){return [format,info.sourceSymbol,info.localId].join(':');}
export function tilesetChoices(layouts,active,field){
 const format=layoutFormat(active),seen=new Map();
 for(const l of layouts){if(layoutFormat(l)!==format)continue;const value=String(l[field]??'0');if(!seen.has(value))seen.set(value,{value,label:value==='0'?'No secondary':friendly(value),locations:[]});const locations=seen.get(value).locations,name=friendly(l.name||l.id);if(!locations.includes(name))locations.push(name);}
 return [...seen.values()].map(c=>{c.locations.sort((a,b)=>a.localeCompare(b));c.detail=c.value==='0'?'No secondary tiles': 'Used in '+c.locations.slice(0,3).join(', ')+(c.locations.length>3?' +'+(c.locations.length-3)+' more':'');return c;}).sort((a,b)=>a.label.localeCompare(b.label));
}
export function jsonBytes(value,original){const text=original?strFromU8(original):'',crlf=text.includes('\r\n');let out=JSON.stringify(value,null,2)+'\n';if(crlf)out=out.replace(/\n/g,'\r\n');return strToU8(out);}
export function changeTilesets(original,id,primary,secondary){const doc=JSON.parse(strFromU8(original));const layout=doc.layouts.find(l=>l.id===id);if(!layout)throw Error('Layout not found');for(const [field,value]of [['primary_tileset',primary],['secondary_tileset',secondary]]){if(!tilesetChoices(doc.layouts,layout,field).some(c=>c.value===String(value)))throw Error('Choose a compatible '+field.replace('_',' '));}if(String(layout.primary_tileset)===String(primary)&&String(layout.secondary_tileset??'0')===String(secondary))return {doc,layout,bytes:original};layout.primary_tileset=primary;layout.secondary_tileset=secondary;return {doc,layout,bytes:jsonBytes(doc,original)};}
export function missingTiles(cells,primaryCount,secondaryCount,format){const split=format==='frlg'?640:512;return [...cells].filter(c=>{const n=c&1023;return n<split?n>=Math.min(split,primaryCount):n-split>=Math.min(1024-split,secondaryCount);}).length;}
export function sourceConstants(text,prefix){return [...new Set((text.match(new RegExp('\\b'+prefix+'[A-Z0-9_]+\\b','g'))||[]))].sort();}
export function behaviorNames(text){
 const out=new Map(),values=new Map(),pending=[],clean=text.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
 const valueOf=expression=>{const m=expression.replace(/[()\s]/g,'').match(/^(0x[\da-f]+|\d+|MB_\w+)(?:([+-])(0x[\da-f]+|\d+))?$/i);if(!m)return null;const base=/^MB_/.test(m[1])?values.get(m[1]):Number(m[1]);return base==null?null:base+(m[2]==='-'?-1:1)*Number(m[3]||0);};
 const add=(name,n)=>{values.set(name,n);if(!out.has(n))out.set(n,name);};
 for(const block of clean.matchAll(/enum(?:\s+\w+)?\s*\{([\s\S]*?)\}/g)){let n=0;for(const token of block[1].split(',')){const m=token.trim().match(/^(MB_\w+)(?:\s*=\s*(.+))?$/);if(!m)continue;const value=m[2]?valueOf(m[2]):n;if(value!=null){add(m[1],value);n=value+1;}}}
 for(const m of clean.matchAll(/^\s*#define\s+(MB_\w+)\s+([^\n]+)/gm))pending.push([m[1],m[2]]);
 for(let pass=0;pass<pending.length;pass++){let changed=false;for(const [name,expression]of pending){if(values.has(name))continue;const n=valueOf(expression);if(n!=null){add(name,n);changed=true;}}if(!changed)break;}
 return out;
}
function semanticCategory(text){
 const s=text.replace(/([A-Z]+)([A-Z][a-z])/g,'$1 $2').replace(/([a-z\d])([A-Z])/g,'$1 $2').replace(/_/g,' ').toLowerCase();
 if(/sign|notice|poster|placard|braille/.test(s))return 'Signs';
 if(/stairs|staircase|ladder|bridge|escalator|elevator|slope/.test(s))return 'Stairs & bridges';
 if(/cliff|ledge|mountain|rock wall|rockwall|jump (?:north|south|east|west)/.test(s))return 'Cliffs';
 if(/water|ocean|pond|surf|puddle|shore|seaweed|current|whirlpool|lava/.test(s))return 'Water';
 if(/fence|railing|barrier|hedge|gate/.test(s))return 'Fences & edges';
 if(/door|roof|window|entrance|exit|wall|house/.test(s))return 'Buildings & doors';
 if(/tree|grass|flower|bush|plant|mushroom|vine|shrub|roots?/.test(s))return 'Trees & plants';
 if(/book|shelf|shelves|table|chair|desk|counter|bed|sofa|couch|rug|carpet|curtain|cushion|painting|picture|clock|\bpc\b|\btv\b|computer|television|machine|terminal|box|cabinet|fridge|sink|trash|decoration|ornament|doll/.test(s))return 'Furniture & interiors';
 if(/ground|floor|path|sand|dirt|road|snow|ash|ice|mowed|mud/.test(s))return 'Ground & paths';
 if(/cave|rock|boulder|stone|stalagmite|crystal/.test(s))return 'Rocks & caves';
 return 'Other';
}
export function tileCategory(name,behavior){const named=semanticCategory(name);return named==='Other'?semanticCategory(behavior):named;}
export function metatileInfo(files,sets,format){
 const labels=strFromU8(files.get('include/constants/metatile_labels.h')||new Uint8Array()),behaviors=behaviorNames(strFromU8(files.get('include/constants/metatile_behaviors.h')||new Uint8Array())),split=format==='frlg'?640:512,out=new Map();
 for(let si=0;si<sets.length;si++){
  const set=sets[si],symbol=set.symbol.replace(/^gTileset_/,''),labelNames=new Map(),prefixes=[symbol,...(set.labelNamespace?[set.labelNamespace]:[])].sort((a,b)=>b.length-a.length);
  for(const m of labels.matchAll(/#define\s+METATILE_(\w+)\s+\(?\s*(0x[\da-f]+|\d+)/gi)){
   const prefix=prefixes.find(p=>m[1].startsWith(p+'_'));if(!prefix)continue;const id=Number(m[2]),aliases=labelNames.get(id)||[];aliases.push({name:m[1],feature:m[1].slice(prefix.length+1)});labelNames.set(id,aliases);
  }
  const count=Math.min(si?1024-split:split,set.meta.length/16),stride=set.attr.length>=count*4&&count?4:2,v=new DataView(set.attr.buffer,set.attr.byteOffset,set.attr.byteLength);
  for(let i=0;i<count;i++){
   const id=i+(si?split:0),attr=i*stride+stride<=v.byteLength?(stride===4?v.getUint32(i*stride,true):v.getUint16(i*stride,true)):0,behavior=behaviors.get(attr&(stride===4?511:255))||'',aliases=labelNames.get(id)||[],named=aliases.find(a=>semanticCategory(a.feature)!=='Other')||aliases[0],name=aliases.map(a=>a.name).join(' / '),labelCategory=semanticCategory(named?.feature||''),category=tileCategory(named?.feature||'',behavior);
   out.set(id,{name,behavior,category,reason:labelCategory!=='Other'?'Source label':category!=='Other'?'Tile behavior':'No descriptive source label',sourceIndex:si,sourceSymbol:set.symbol,sourceName:friendly(set.symbol),localId:i});
  }
 }
 return out;
}
// An unlabeled tile is a sign only when every use on this map has a sign event.
export function mapCategoryHints(info,cells,width,map,name=''){
 const result=new Map(info),uses=new Map(),signs=new Map();
 for(const cell of cells||[]){const id=cell&1023;uses.set(id,(uses.get(id)||0)+1);}
 for(const event of map?.bg_events||[]){if(event.type!=='sign'||!Number.isInteger(event.x)||!Number.isInteger(event.y)||event.x<0||event.x>=width||event.y<0)continue;const index=event.y*width+event.x;if(index>=cells.length)continue;const id=cells[index]&1023,positions=signs.get(id)||new Set();positions.add(index);signs.set(id,positions);}
 for(const [id,positions]of signs){const current=info.get(id);if(current?.category==='Other'&&positions.size===uses.get(id))result.set(id,{...current,category:'Signs',reason:'Sign events'+(name?' · '+friendly(name):'')});}
 return result;
}
export function mapNames(files){const out=new Set();for(const[p,b]of files){const m=p.match(/^data\/maps\/([^/]+)\/map\.json$/);if(m)out.add(m[1]);if(p==='data/maps/map_groups.json'){const doc=JSON.parse(strFromU8(b));for(const [key,value]of Object.entries(doc))if(key!=='group_order'&&Array.isArray(value))for(const name of value)if(typeof name==='string'&&/^[\w-]+$/.test(name))out.add(name);}}return [...out].sort();}
export const EVENT_FIELDS={npc:'object_events',sign:'bg_events',trigger:'coord_events',warp:'warp_events'};
export function eventList(doc){return Object.entries(EVENT_FIELDS).flatMap(([kind,field])=>(doc[field]||[]).map((event,index)=>({kind,index,event})));}
export function changeEvent(original,kind,index,patch,width,height){const doc=JSON.parse(strFromU8(original)),field=EVENT_FIELDS[kind];if(!field)throw Error('Unsupported event type');const list=doc[field]||[];if(!Array.isArray(list)||index<0||index>list.length)throw Error('Event no longer exists');if(index===list.length&&list.length>=255)throw Error('This event list is full');for(const [key,max]of [['x',width-1],['y',height-1],['elevation',15]])if(!Number.isInteger(patch[key])||patch[key]<0||patch[key]>max)throw Error('Choose a valid '+key);const event={...(list[index]||{}),...patch};list[index]=event;doc[field]=list;return {doc,event,bytes:jsonBytes(doc,original)};}
export function dialogueLabel(map,index){if(!/^[A-Za-z_]\w*$/.test(map)||!Number.isInteger(index)||index<0)throw Error('Invalid dialogue identity');return map+'_TileForge_Event_'+index;}
export function writeDialogue(original,label,text,kind='npc'){if(!/^[A-Za-z_]\w*$/.test(label))throw Error('Invalid script label');if(!text.trim()||text.length>1500||/[^\x20-\x7e\n\r]|[$\\{}]/.test(text))throw Error('Dialogue needs standard letters and punctuation. $, backslash, braces and non-ASCII characters are reserved.');let lines=[];for(const para of text.replace(/\r/g,'').split('\n')){let line='';for(const word of para.split(/\s+/).filter(Boolean)){if(word.length>32)throw Error('Use dialogue words up to 32 characters');if(line.length+word.length+1>32){lines.push(line);line=word;}else line+=(line?' ':'')+word;}lines.push(line);}const escaped=lines.map(l=>l.replace(/"/g,'\\"')).map((l,i)=>(i?(i===1?'\\n':'\\l'):'')+l).join('');const begin='@ TILEFORGE-BEGIN '+label,end='@ TILEFORGE-END '+label,block=begin+'\n'+label+'::\n'+(kind==='npc'?'\tlock\n\tfaceplayer\n':'\tlockall\n')+'\tmsgbox '+label+'_Text, MSGBOX_DEFAULT\n'+(kind==='npc'?'\trelease\n':'\treleaseall\n')+'\tend\n\n'+label+'_Text:\n\t.string "'+escaped+'$"\n'+end+'\n';let source=strFromU8(original);const start=source.search(new RegExp('^'+begin+'\\r?$','m'));if(start>=0){const finish=source.indexOf(end,start);if(finish<0)throw Error('Incomplete TileForge dialogue block');source=source.slice(0,start)+block+source.slice(finish+end.length).replace(/^\r?\n/,'');}else{if(new RegExp('^'+label+'::?','m').test(source))throw Error('Script label already belongs to another script');source=source+(source.endsWith('\n')?'':'\n')+'\n'+block;}return strToU8(source);}
export function readDialogue(source,label){const text=strFromU8(source),start=text.search(new RegExp('^@ TILEFORGE-BEGIN '+label+'\\r?$','m'));if(start<0)return null;const b=text.slice(start,text.indexOf('@ TILEFORGE-END '+label,start));const m=b.match(/\.string "([\s\S]*?)\$"/);return m?m[1].replace(/\\[nl]/g,'\n').replace(/\\"/g,'"'):null;}
