import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeEvent,isEventTap} from '../dist/event-summary.mjs';
import {writeDialogue} from '../dist/project.mjs';
import {strToU8} from '../dist/core.mjs';
test('NPC summary preserves source data and previews only owned dialogue',()=>{
 const event={type:'object',local_id:'LOCALID_BIRCH',graphics_id:'OBJ_EVENT_GFX_BIRCH',x:2,y:3,elevation:4,movement_type:'MOVEMENT_TYPE_FACE_DOWN',flag:'FLAG_HIDE_BIRCH',script:'Town_TileForge_Event_0',trainer_type:'TRAINER_TYPE_NORMAL',custom:{story:7}},copy=structuredClone(event);
 const script=writeDialogue(strToU8('Other_EventScript::\n\tend\n'),'Town_TileForge_Event_0','Hello! This is my town.');
 const summary=summarizeEvent('npc',0,event,'TestTown',script);
 assert.equal(summary.title,'NPC 1');assert.equal(summary.dialogue,'Hello! This is my town.');assert(summary.editable);assert(summary.rows.some(([k,v])=>k==='Visibility'&&v==='Hide flag: FLAG_HIDE_BIRCH'));assert.deepEqual(event,copy);
 const external=summarizeEvent('npc',0,{...event,script:'Give_All_Story_Rewards'},'Town',script);assert.equal(external.dialogue,null);assert(!external.lead.includes('reward'));assert(external.rows.some(([k,v])=>k==='Interaction'&&v==='Give_All_Story_Rewards'));
});
test('warp and trigger summaries keep destination indices and source conditions exact',()=>{
 const warp=summarizeEvent('warp',2,{x:0,y:8,elevation:0,dest_map:'MAP_PETALBURG_CITY',dest_warp_id:'1'},'Town');
 assert.equal(warp.title,'Warp 3');assert(warp.rows.some(([k,v])=>k==='Destination map'&&v==='MAP_PETALBURG_CITY'));assert(warp.rows.some(([k,v])=>k==='Destination warp'&&v.startsWith('1 (source index')));
 const trigger=summarizeEvent('trigger',0,{type:'trigger',x:1,y:2,var:'VAR_STORY',var_value:'6',script:'EventScript_Story'},'Town');assert(trigger.rows.some(([k,v])=>k==='Source condition'&&v==='VAR_STORY = 6'));
 const special=summarizeEvent('warp',0,{dest_map:'MAP_DYNAMIC',dest_warp_id:'255'},'Town');assert(special.rows.some(([k])=>k==='Destination note'));
});
test('specialized source events can be inspected without exposing unsupported editing',()=>{
 for(const[kind,event]of [['npc',{type:'clone'}],['sign',{type:'hidden_item',item:'ITEM_POTION',flag:'FLAG_HIDDEN'}],['sign',{type:'weather',weather:'WEATHER_RAIN'}],['trigger',{type:'special'}]]){
  const s=summarizeEvent(kind,0,event,'Town');assert.equal(s.editable,false);assert(s.lead);assert.equal(s.dialogue,null);
 }
 const sign=summarizeEvent('sign',0,{type:'sign',script:'0x0',player_facing_dir:'BG_EVENT_PLAYER_FACING_UP'},'Town');assert(sign.editable);assert(sign.rows.some(([k,v])=>k==='Interaction'&&v==='No interaction script assigned'));
});
test('Move inspects a tap but never a drag, an out-and-back gesture, or cancellation',()=>{
 const s={pan:true,sx:100,sy:80};assert(isEventTap(s,{type:'pointerup',clientX:100,clientY:80}));assert(isEventTap(s,{type:'pointerup',clientX:103,clientY:82}));
 assert(!isEventTap(s,{type:'pointerup',clientX:120,clientY:80}));assert(!isEventTap({...s,distance:15},{type:'pointerup',clientX:100,clientY:80}));
 for(const type of ['pointercancel','lostpointercapture'])assert(!isEventTap(s,{type,clientX:100,clientY:80}));assert(!isEventTap({...s,pan:false},{type:'pointerup',clientX:100,clientY:80}));
});
