// Advisory source checks. No source is changed by running a review.
import {equal,strFromU8,strToU8} from './core.mjs?v=0.7.0';
export const FIELDS={npc:'object_events',sign:'bg_events',trigger:'coord_events',warp:'warp_events'};
const number=v=>typeof v==='number'?v:/^(?:\d+|0x[\da-f]+)$/i.test(String(v))?Number(v):NaN;
const scriptNull=v=>v==null||['0','0x0','NULL',''].includes(String(v));
const mapPath=p=>/^data\/maps\/[^/]+\/map\.json$/.test(p);
const json=b=>JSON.parse(strFromU8(b));
export function reviewInputs(files,base,layouts,activePath){
 const changed=new Set([...files].filter(([p,b])=>!base.has(p)||!equal(base.get(p),b)).map(([p])=>p));
 const paths=new Set(activePath?[activePath]:[]);
 for(const [p,b]of files){if(!mapPath(p))continue;try{const doc=json(b),layout=layouts.find(l=>l.id===doc.layout),prefix=p.slice(0,-8);if(changed.has(p)||changed.has(prefix+'scripts.inc')||layout&&changed.has(layout.blockdata_filepath))paths.add(p);}catch{if(changed.has(p))paths.add(p);}}
 return {paths:[...paths],changed};
}
export function dependencies(files,paths){
 const names=new Map();for(const[p,b]of files)if(mapPath(p)){try{names.set(json(b).id,p);}catch{}}
 try{const groups=json(files.get('data/maps/map_groups.json'));for(const group of groups.group_order||[])for(const name of groups[group]||[])names.set('MAP_'+name.replace(/([a-z])([A-Z])/g,'$1_$2').toUpperCase(),'data/maps/'+name+'/map.json');}catch{}
 const wanted=new Set();for(const path of paths){wanted.add(path.replace(/map\.json$/,'scripts.inc'));try{for(const warp of json(files.get(path)).warp_events||[]){const dest=names.get(warp.dest_map)||[...names].find(([id])=>id.replace(/_/g,'')===String(warp.dest_map).replace(/_/g,''))?.[1];if(dest)wanted.add(dest);}}catch{}}
 return [...wanted].filter(p=>!files.has(p));
}
export function reviewEvents({files,base=new Map(),layouts=[],paths=[],changed=new Set()}){
 const issues=[],coverage=[],maps=new Map(),labels=new Set(),duplicates=new Set();
 for(const[p,b]of files){if(mapPath(p)){try{const m=json(b);maps.set(m.id,{path:p,doc:m});}catch{}}if(/\.(inc|s)$/i.test(p))for(const m of strFromU8(b).matchAll(/^([A-Za-z_]\w*)::?/gm)){if(labels.has(m[1]))duplicates.add(m[1]);labels.add(m[1]);}}
 let eventCount=0;
 for(const path of paths){
  let doc;try{doc=json(files.get(path));}catch{issues.push({id:path+':json',path,severity:'error',title:'Map JSON cannot be read',detail:'The map file is not valid JSON.',solution:'Restore the file from your baseline or correct its JSON in the source project.'});continue;}
  const name=path.split('/')[2],layout=layouts.find(l=>l.id===doc.layout),scriptPath=path.replace(/map\.json$/,'scripts.inc');
  const add=(code,title,detail,solution,ref,extra={})=>issues.push({id:path+':'+code+':'+(ref?ref.kind+':'+ref.index:''),path,map:name,severity:'advice',title,detail,solution,...ref,...extra});
  if(!layout){add('layout','Layout is missing','No loaded layout matches '+doc.layout+'.','Import the matching layouts file before checking placements.',null,{severity:'error'});continue;}
  let original={};try{original=json(base.get(path));}catch{}
  const cells=files.get(layout.blockdata_filepath),oldCells=base.get(layout.blockdata_filepath),validCells=cells?.length===layout.width*layout.height*2;
  if(!validCells)coverage.push(name+': map collision/elevation data unavailable.');
  if(!files.has(scriptPath))coverage.push(name+': local scripts not loaded.');
  const entries=[],ids=new Map();
  for(const[kind,field]of Object.entries(FIELDS)){
   const list=doc[field]||[];if(!Array.isArray(list)){add('list-'+kind,'Invalid event list',field+' must be an array.','Correct the event list in the source project.',null,{severity:'error'});continue;}
   for(const[eIndex,e]of list.entries()){
    const ref={kind,index:eIndex};eventCount++;
    if(!e||typeof e!=='object'){add('invalid','Invalid event entry','Event '+(eIndex+1)+' is not an object.','Restore this event from your source baseline.',ref,{severity:'error'});continue;}
    if(kind==='npc'&&e.type==='clone')continue;
    const x=number(e.x),y=number(e.y),elevation=number(e.elevation??0),before=original[field]?.[eIndex],touched=!before||JSON.stringify(before)!==JSON.stringify(e);
    const fieldFix=(key,value,title,detail)=>add(key,title,detail,'Set '+key+' to '+value+'. Review the position after applying.',ref,{severity:'warning',fix:{field,index:eIndex,patch:{[key]:value}}});
    let inBounds=true;
    for(const[key,value,max]of [['x',x,layout.width-1],['y',y,layout.height-1],['elevation',elevation,15]])if(!Number.isInteger(value)||value<0||value>max){if(key!=='elevation')inBounds=false;if(Number.isFinite(value))fieldFix(key,Math.max(0,Math.min(max,Math.trunc(value))),'Event '+key+' is outside its range',String(e[key])+' is outside 0–'+max+'.');else add(key,'Unresolved event '+key,'Cannot resolve '+String(e[key])+'.','Choose a numeric value in 0–'+max+' in the event editor.',ref,{severity:'warning'});}
    if(kind==='npc'&&e.local_id){if(ids.has(e.local_id))add('local-id','Duplicate NPC local ID',e.local_id+' is also used by NPC '+(ids.get(e.local_id)+1)+'.','Assign distinct source local IDs and check scripts that refer to them. No automatic renumbering is safe.',ref,{severity:'warning'});else ids.set(e.local_id,eIndex);}
    if(inBounds){
     const offset=(y*layout.width+x)*2,cell=validCells?new DataView(cells.buffer,cells.byteOffset,cells.byteLength).getUint16(offset,true):null,was=oldCells?.length===cells?.length&&validCells?new DataView(oldCells.buffer,oldCells.byteOffset,oldCells.byteLength).getUint16(offset,true):cell;
     const relevant=touched||cell!==was;
     if(relevant&&cell!=null&&(kind==='npc'||kind==='trigger')&&elevation!==0&&elevation!==15&&cell>>>12!==0&&cell>>>12!==15&&elevation!==(cell>>>12))add('level','Check event elevation','The event is on level '+elevation+' while its map cell is level '+(cell>>>12)+'. This can prevent an interaction.','Compare the movement overlay. If they should meet, match the event elevation to '+(cell>>>12)+'.',ref,{fix:{field,index:eIndex,patch:{elevation:cell>>>12}}});
     if(relevant&&cell!=null&&kind==='npc'&&(cell>>>10&3))add('blocked','NPC stands on a blocked cell','Collision '+(cell>>>10&3)+' is set at '+x+', '+y+'. This may be intentional for a stationary character.','Check reachability and adjacent interaction space. Move the NPC or adjust collision only if appropriate.',ref);
     entries.push({kind,index:eIndex,event:e,x,y,elevation,touched:relevant});
     if(kind==='npc'&&touched&&/WANDER|WALK_(?:UP|DOWN|LEFT|RIGHT)_AND/.test(e.movement_type||''))for(const[key,max]of [['movement_range_x',Math.min(x,layout.width-1-x)],['movement_range_y',Math.min(y,layout.height-1-y)]]){const range=number(e[key]??0);if(range>max)add('range-'+key,'NPC movement reaches the map edge',key+' is '+range+'; only '+max+' tiles fit before an edge.','Reduce this range to '+max+' or move the NPC inward. Engine collision can also constrain movement.',ref,{fix:{field,index:eIndex,patch:{[key]:max}}});}
    }
    if(!scriptNull(e.script)){
     if(duplicates.has(e.script))add('duplicate-label','Script label is defined more than once',e.script+' occurs in multiple loaded definitions.','Keep one definition or rename the intended script and its references.',ref,{severity:'warning'});
     if(!labels.has(e.script)){
      if(files.has(scriptPath)&&String(e.script).startsWith(name+'_'))add('missing-script','Local interaction script is unresolved',e.script+' has no definition in the loaded source.','Restore its script, choose an existing script, or write new dialogue. Included/global files may still define it.',ref,{severity:'warning'});
      else coverage.push(name+': external script '+e.script+' was not resolved.');
     }
    }
    if(kind==='warp'){
     const target=maps.get(e.dest_map),warp=number(e.dest_warp_id);
     if(['MAP_DYNAMIC','MAP_NONE','MAP_UNDEFINED'].includes(e.dest_map)||warp===255||Number(e.dest_warp_id)===-1||/^(?:WARP_ID_|WARP_)/.test(String(e.dest_warp_id)))continue;
     if(!target){coverage.push(name+': destination '+e.dest_map+' is not loaded.');continue;}
     if(Number.isInteger(warp)&&(warp<0||warp>=(target.doc.warp_events||[]).length))add('warp-index','Destination warp does not exist',e.dest_map+' has '+(target.doc.warp_events||[]).length+' warps; index '+e.dest_warp_id+' is invalid.','Select the intended destination and a valid zero-based warp index in the event editor.',ref,{severity:'warning'});
    }
   }
  }
  for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
   const a=entries[i],b=entries[j];if(!a.touched&&!b.touched||a.x!==b.x||a.y!==b.y||a.elevation&&b.elevation&&a.elevation!==b.elevation)continue;
   if(a.kind==='sign'&&b.kind==='sign'&&a.event.player_facing_dir!==b.event.player_facing_dir)continue;
   if(a.kind==='trigger'&&b.kind==='trigger'&&(a.event.var!==b.event.var||a.event.var_value!==b.event.var_value))continue;
   if(a.kind==='sign'&&b.kind==='warp'||a.kind==='warp'&&b.kind==='sign')continue;
   add('overlap-'+a.kind+a.index,'Events share a position',a.kind+' '+(a.index+1)+' and '+b.kind+' '+(b.index+1)+' share '+a.x+', '+a.y+'. Flags, conditions or engine ordering may make this intentional.','Check both interactions in game. If unintended, move one event to a distinct cell. Keep story conditions intact.',{kind:b.kind,index:b.index});
  }
  if(changed.has(scriptPath)){
   const text=strFromU8(files.get(scriptPath)||new Uint8Array());
   for(const m of text.matchAll(/^@ TILEFORGE-BEGIN (\w+)\r?$/gm)){
    const end=text.indexOf('@ TILEFORGE-END '+m[1],m.index),block=end<0?'':text.slice(m.index,end);
    if(end<0||!/^\s*release(?:all)?\s*$/m.test(block)||!/^\s*end\s*$/m.test(block))add('owned-block-'+m[1],'Dialogue block needs attention',m[1]+' is incomplete or missing its release/end command.','Reopen this event and save its dialogue again, or restore the owned block from a backup.',null,{severity:'warning'});
   }
  }
 }
 return {issues,coverage:[...new Set(coverage)],mapCount:paths.length,eventCount,changedFiles:changed.size};
}
export function applyReviewFix(files,issue){
 if(!issue.fix)throw Error('This finding needs a manual review.');
 const before=files.get(issue.path);if(!before||!equal(before,issue.expected))throw Error('This map changed after review. Run Review events again.');
 const doc=json(before),{field,index,patch}=issue.fix;if(!Object.values(FIELDS).includes(field)||!doc[field]?.[index])throw Error('Event no longer exists. Run the review again.');
 doc[field][index]={...doc[field][index],...patch};
 return {path:issue.path,before:before.slice(),after:strToU8(JSON.stringify(doc,null,2)+'\n')};
}
export function aiPrompt(issue){
 return [{role:'system',content:'You explain game-editor warnings. Use only the supplied facts. Write a short explanation and suggest one manual in-game test. Do not invent code or IDs and do not claim to have tested anything.'},{role:'user',content:'Please explain this warning: '+issue.title+'. '+issue.detail+'\nThe suggested action is: '+issue.solution+'\nWhy might this matter, and what should I test in game?'}];
}
