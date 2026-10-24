import {friendly,readDialogue} from './project.mjs?v=0.11.0';

const missing=v=>v==null||v==='';
const source=v=>missing(v)?'Not specified':String(v);
const noScript=v=>missing(v)||['0','0x0','NULL'].includes(String(v));
const types={npc:'NPC',sign:'Sign',trigger:'Trigger',warp:'Warp'};
export const editableEvent=(kind,event)=>kind==='warp'||kind==='npc'&&event.type!=='clone'||kind==='sign'&&event.type==='sign'||kind==='trigger'&&event.type==='trigger';

// Summarize stored facts only. A script name is not a description of its full logic.
export function summarizeEvent(kind,index,event,mapName,scripts=null){
 if(!types[kind]||!event||!Number.isInteger(index)||index<0)throw Error('This event is no longer available.');
 const specialized=kind==='npc'&&event.type==='clone'?'Clone NPC':kind==='sign'&&event.type!=='sign'?'Background event':kind==='trigger'&&event.type!=='trigger'?'Coordinate event':types[kind];
 const result={title:specialized+' '+(index+1),lead:'',rows:[],dialogue:null,editable:editableEvent(kind,event)};
 const row=(name,value)=>result.rows.push([name,source(value)]);
 row('Map',friendly(mapName));row('Position','X '+source(event.x)+' · Y '+source(event.y)+' · elevation '+source(event.elevation??0));
 if(kind==='npc'){
  result.lead=event.type==='clone'?'A character copied from another map placement.':'A character placed on this map.';
  if(event.graphics_id)row('Appearance',friendly(String(event.graphics_id)));
  if(event.movement_type)row('Movement',friendly(String(event.movement_type)));
  if(event.movement_range_x!=null||event.movement_range_y!=null)row('Movement range','X '+source(event.movement_range_x??0)+' · Y '+source(event.movement_range_y??0));
  row('Visibility',missing(event.flag)||['0','0x0','FLAG_NONE'].includes(String(event.flag))?'No hide flag assigned':'Hide flag: '+source(event.flag));
  if(event.trainer_type&&!['TRAINER_TYPE_NONE','0'].includes(String(event.trainer_type)))row('Trainer type',event.trainer_type);
  if(event.local_id)row('NPC ID',event.local_id);
 }else if(kind==='warp'){
  result.lead='A map transition. Stepping onto this warp can move the player to another location.';
  row('Destination map',event.dest_map);
  row('Destination warp',source(event.dest_warp_id)+' (source index, starting at 0)');
  if(['MAP_DYNAMIC','MAP_NONE','MAP_UNDEFINED'].includes(event.dest_map)||['255','0xFF','-1'].includes(String(event.dest_warp_id)))row('Destination note','Special engine destination; the final location depends on runtime logic.');
 }else if(kind==='trigger'){
  result.lead=event.type==='trigger'?'A step-on event with a source condition.':'A specialized event attached to a map coordinate.';
  if(event.var!=null)row('Source condition',source(event.var)+' = '+source(event.var_value));
 }else{
  result.lead=event.type==='sign'?'A reading or interaction point, such as a sign.':'A specialized background event, such as a hidden item or weather interaction.';
  row('Event type',event.type);
  if(event.player_facing_dir)row('Read from',friendly(String(event.player_facing_dir)));
  if(event.item!=null)row('Item',event.item);
  if(event.flag!=null)row('Event flag',event.flag);
  if(event.weather!=null)row('Weather',event.weather);
 }
 if(kind!=='warp'){
  row('Interaction',noScript(event.script)?'No interaction script assigned':event.script);
  if(scripts&&!noScript(event.script)&&/^[A-Za-z_]\w*$/.test(String(event.script)))try{result.dialogue=readDialogue(scripts,event.script);}catch{}
 }
 return result;
}

// Preserve Move's drag behavior; cancelled/captured gestures never inspect an event.
export function isEventTap(stroke,event){
 return !!stroke?.pan&&event.type==='pointerup'&&(stroke.distance||0)<=6&&Math.hypot(event.clientX-stroke.sx,event.clientY-stroke.sy)<=6;
}
