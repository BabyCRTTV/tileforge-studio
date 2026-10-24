import {strFromU8,strToU8} from './core.mjs?v=0.15.0';
export const CATEGORIES=['Cliffs','Water','Signs','Buildings & doors','Stairs & bridges','Trees & plants','Ground & paths','Rocks & caves','Furniture & interiors','Fences & edges','Puzzles & switches','Warps & transitions','Other'];
export const layoutFormat=l=>['frlg','firered'].includes(l?.layout_version)?'frlg':'emerald';
export const friendly=s=>String(s).replace(/^gTileset_|^OBJ_EVENT_GFX_|^MOVEMENT_TYPE_|_Layout$/g,'').replace(/_/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2');
export function defaultLayout(layouts,selectedId){return layouts.find(l=>l.id===selectedId)||layouts.find(l=>/^LittlerootTown(?:_Layout)?$/i.test(l.name||''))||layouts[0];}
// Prefer a labelled plain-grass patch over trees or encounter grass.
export function defaultBrush(info,available){
 const ids=[...available.keys()],matches=test=>ids.find(id=>test(info.get(id)||{}));
 return matches(tile=>(tile.features||[]).some(feature=>/^(?:plain )?grass$/.test(words(feature))))??matches(tile=>tile.behavior==='MB_SHORT_GRASS')??ids[0]??0;
}
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
// Catalog source object sprites independently of map placements and terrain tilesets.
export function npcGraphicsCatalog(header,pointers='',placed=[]){
 const clean=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,''),text=clean(header),ids=new Set();
 for(const m of text.matchAll(/^\s*#define[ \t]+(OBJ_EVENT_GFX_[A-Z0-9_]+)(?=[ \t])/gm))ids.add(m[1]);
 for(const block of text.matchAll(/enum(?:\s+\w+)?\s*\{([^}]+)\}/g))for(const token of block[1].split(',')){const m=token.trim().match(/^(OBJ_EVENT_GFX_[A-Z0-9_]+)(?:\s*=|\s*$)/);if(m)ids.add(m[1]);}
 for(const m of clean(pointers).matchAll(/\[\s*(OBJ_EVENT_GFX_[A-Z0-9_]+)\s*\]\s*=\s*&\w+/g))ids.add(m[1]);
 for(const id of placed)if(/^OBJ_EVENT_GFX_[A-Z0-9_]+$/.test(id))ids.add(id);
 return [...ids].filter(id=>!/^OBJ_EVENT_GFX_(?:VAR_|VARS$|SPECIES(?:_|$))/.test(id)&&!/(?:^|_)(?:COUNT|START|END|FIRST|LAST|MAX)$/.test(id)).sort((a,b)=>friendly(a).localeCompare(friendly(b),undefined,{numeric:true}));
}
export function behaviorNames(text){
 const out=new Map(),values=new Map(),pending=[],clean=text.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
 const valueOf=expression=>{const m=expression.replace(/[()\s]/g,'').match(/^(0x[\da-f]+|\d+|MB_\w+)(?:([+-])(0x[\da-f]+|\d+))?$/i);if(!m)return null;const base=/^MB_/.test(m[1])?values.get(m[1]):Number(m[1]);return base==null?null:base+(m[2]==='-'?-1:1)*Number(m[3]||0);};
 const add=(name,n)=>{values.set(name,n);if(!out.has(n))out.set(n,name);};
 for(const block of clean.matchAll(/enum(?:\s+\w+)?\s*\{([\s\S]*?)\}/g)){let n=0;for(const token of block[1].split(',')){const m=token.trim().match(/^(MB_\w+)(?:\s*=\s*(.+))?$/);if(!m)continue;const value=m[2]?valueOf(m[2]):n;if(value!=null){add(m[1],value);n=value+1;}}}
 for(const m of clean.matchAll(/^\s*#define\s+(MB_\w+)\s+([^\n]+)/gm))pending.push([m[1],m[2]]);
 for(let pass=0;pass<pending.length;pass++){let changed=false;for(const [name,expression]of pending){if(values.has(name))continue;const n=valueOf(expression);if(n!=null){add(name,n);changed=true;}}if(!changed)break;}
 return out;
}
function words(text){return String(text).replace(/([A-Z]+)([A-Z][a-z])/g,'$1 $2').replace(/([a-z\d])([A-Z])/g,'$1 $2').replace(/([A-Za-z])(\d)/g,'$1 $2').replace(/(\d)([A-Za-z])/g,'$1 $2').replace(/_/g,' ').toLowerCase();}
function semanticCategory(text){
 const s=words(text),has=pattern=>pattern.test(s);
 if(has(/\b(?:signs?|signpost|notice|poster|placard|braille)\b/))return 'Signs';
 // These are water cells under a bridge, rather than the bridge deck.
 if(has(/\b(?:reflection under bridge|water under bridge)\b/))return 'Water';
 if(has(/\b(?:stairs?|staircase|ladder|bridge|escalator|elevator|slope|rails?)\b|\bpacifidlog (?:vertical|horizontal) log\b/))return 'Stairs & bridges';
 if(has(/\b(?:cliffs?|ledge|mountain|rock wall|rockwall|rock climb|jump (?:north|south|east|west|northeast|northwest|southeast|southwest))\b/))return 'Cliffs';
 if(has(/\b(?:fences?|railing|barrier|hedge|gate)\b/))return 'Fences & edges';
 if(has(/\b(?:doors?|roof|window|porthole|entrance|exit|houses?|tent)\b/))return 'Buildings & doors';
 if(has(/\b(?:books?|bookshelf|bookcase|shelf|shelves|table|chair|desk|counter|bed|sofa|couch|rug|carpet|curtain|cushion|painting|picture|clock|pc|tv|laptop|computer|television|machine|terminal|box|generator|cabinet|wardrobe|dresser|kitchen|fridge|sink|trash|decoration|ornament|doll|vase|cup|food|snacks|telephone|monitor|tools|blueprints?|region map|roulette|feeder|balloon|mat|scenery|video game|shield|ball)\b/))return 'Furniture & interiors';
 if(has(/\b(?:water|waterfall|ocean|pond|surf|surfacing|puddle|shore|seaweed|current|whirlpool|lava|hot springs)\b/))return 'Water';
 if(has(/\b(?:trees?|grass|ashgrass|flower|bush|plant|mushroom|vine|shrub|roots?)\b/))return 'Trees & plants';
 if(has(/\b(?:walls?)\b/))return 'Buildings & doors';
 if(has(/\b(?:ground|floor|path|sand|dirt|road|snow|ash|ice|mowed|mud|soil|footprints)\b/))return 'Ground & paths';
 if(has(/\b(?:cave|rocks?|boulder|stone|stalagmite|crystal)\b/))return 'Rocks & caves';
 if(has(/\b(?:switch|button|pressure plate|arrow|spin|spinning|walk|slide|beam)\b/))return 'Puzzles & switches';
 if(has(/\bwarp\b/))return 'Warps & transitions';
 return 'Other';
}
export function tileCategory(name,behavior){
 const named=semanticCategory(name);if(named!=='Other')return named;
 if(/^MB_(?:UNUSED|INVALID)(?:_|$)/.test(behavior))return 'Other';
 // Generic warp behavior describes a transition, not necessarily a doorway.
 const category=semanticCategory(behavior);return ['Other','Puzzles & switches'].includes(category)&&/\bwarp\b/.test(words(behavior))?'Warps & transitions':category;
}
export function metatileInfo(files,sets,format){
 const labels=strFromU8(files.get('include/constants/metatile_labels.h')||new Uint8Array()).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,''),behaviors=behaviorNames(strFromU8(files.get('include/constants/metatile_behaviors.h')||new Uint8Array())),split=format==='frlg'?640:512,out=new Map();
 const entries=[...labels.matchAll(/#define\s+METATILE_(\w+)\s+\(?\s*(0x[\da-f]+|\d+)\s*\)?\s*(?=\r?$)/gim)].map(m=>({name:m[1],id:Number(m[2])}));
 const namespaces=sets.map(set=>[...new Set([set.symbol.replace(/^gTileset_/,''),set.labelNamespace,...(set.labelNamespaces||[])].filter(Boolean))].sort((a,b)=>b.replace(/_/g,'').length-a.replace(/_/g,'').length));
 const matching=(entry,prefixes)=>{for(const prefix of prefixes){const pattern=prefix.replace(/_/g,'').split('').join('_?'),match=entry.name.match(new RegExp('^'+pattern+'_(.+)$','i'));if(match)return {name:entry.name,feature:match[1]};}return null;};
 for(let si=0;si<sets.length;si++){
  const set=sets[si],labelNames=new Map();
  // Primary namespaces may intentionally label secondary IDs (e.g. SecretBase).
  // The active source's own label wins over the inherited namespace.
  for(const entry of entries){const own=matching(entry,namespaces[si]),inherited=!own&&si?matching(entry,namespaces[0]):null,match=own||inherited;if(!match)continue;const aliases=labelNames.get(entry.id)||[];aliases.push({...match,inherited:!own});labelNames.set(entry.id,aliases);}
  const count=Math.min(si?1024-split:split,set.meta.length/16),stride=set.attr.length>=count*4&&count?4:2,v=new DataView(set.attr.buffer,set.attr.byteOffset,set.attr.byteLength);
  for(let i=0;i<count;i++){
   const id=i+(si?split:0),attr=i*stride+stride<=v.byteLength?(stride===4?v.getUint32(i*stride,true):v.getUint16(i*stride,true)):0,behavior=behaviors.get(attr&(stride===4?511:255))||'',allAliases=labelNames.get(id)||[],own=allAliases.filter(a=>!a.inherited),aliases=own.length?own:allAliases,named=aliases.find(a=>semanticCategory(a.feature)!=='Other')||aliases[0],name=aliases.map(a=>a.name).join(' / '),labelCategory=semanticCategory(named?.feature||''),category=tileCategory(named?.feature||'',behavior);
   out.set(id,{name,features:aliases.map(a=>a.feature),behavior,category,reason:labelCategory!=='Other'?(named?.inherited?'Shared primary label':'Source label'):category!=='Other'?'Tile behavior':'No descriptive source label',sourceIndex:si,sourceSymbol:set.symbol,sourceName:friendly(set.symbol),localId:i});
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
