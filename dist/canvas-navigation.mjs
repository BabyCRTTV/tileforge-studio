// Two-finger navigation cancels any in-progress one-finger edit before zooming.
export const clampZoom=z=>Math.max(1/16,Math.min(32,z));
export function touchGeometry(points){const [a,b]=points;return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))};}
export function createTouchNavigation({wrap,canvas,getZoom,setZoom,cancelEdit,enabled=()=>true}){
 const touches=new Map();let pinch=null,blocked=false;
 function start(){const g=touchGeometry([...touches.values()]),r=canvas.getBoundingClientRect();pinch={...g,zoom:getZoom(),px:(g.x-r.left)/getZoom(),py:(g.y-r.top)/getZoom()};}
 function stop(e){e.preventDefault();e.stopImmediatePropagation();}
 wrap.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch'||!enabled())return;
  touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(touches.size>=2){stop(e);if(!blocked){blocked=true;cancelEdit();}wrap.setPointerCapture(e.pointerId);start();}
 },true);
 wrap.addEventListener('pointermove',e=>{
  if(!touches.has(e.pointerId))return;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(!blocked)return;stop(e);if(touches.size<2||!pinch)return;
  const g=touchGeometry([...touches.values()]);setZoom(clampZoom(pinch.zoom*g.distance/pinch.distance));
  // Measure after zoom: auto-centering and the scroll bounds may also have changed.
  const r=canvas.getBoundingClientRect();wrap.scrollLeft+=r.left+pinch.px*getZoom()-g.x;wrap.scrollTop+=r.top+pinch.py*getZoom()-g.y;
 },true);
 function end(e){if(!touches.has(e.pointerId))return;touches.delete(e.pointerId);if(blocked){stop(e);if(touches.size>=2)start();else pinch=null;if(!touches.size)blocked=false;}}
 for(const type of ['pointerup','pointercancel'])wrap.addEventListener(type,end,true);
 // Captures may be lost on app switching. Do not resume a paint with the remaining finger.
 wrap.addEventListener('lostpointercapture',e=>{if(touches.has(e.pointerId)){touches.delete(e.pointerId);pinch=null;if(!touches.size)blocked=false;}},true);
 window.addEventListener('blur',()=>{if(touches.size)cancelEdit();touches.clear();pinch=null;blocked=false;});
}
