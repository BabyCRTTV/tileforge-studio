// Keep the canvas usable as a foldable changes width, height or orientation.
export function createLayout({S,$,fit}) {
 const compact=matchMedia('(max-width: 1366px)');
 const panels=[...document.querySelectorAll('.studio-panels > details')];
 let frame;
 function reflow(){
  cancelAnimationFrame(frame);
  frame=requestAnimationFrame(()=>{
   // Long area/event controls must scroll within the space below their header.
   for(const panel of panels){const popover=panel.querySelector('.studio-popover');if(compact.matches&&panel.open&&!panel.classList.contains('controls-tucked'))popover.style.maxHeight=Math.max(80,Math.min(380,innerHeight-popover.getBoundingClientRect().top-12))+'px';else popover.style.removeProperty('max-height');}
   if(S.autoFit&&!S.stroke)fit();
  });
 }
 function sync(){
  // Desktop display controls are inline; compact controls open over the map.
  $('displayPanel').open=!compact.matches;
  $('tileTagDetails').open=!compact.matches;$('brushDetails').open=!compact.matches;
  for(const panel of panels)panel.classList.remove('controls-tucked');
  reflow();
 }
 for(const panel of panels){
  panel.querySelector('summary').addEventListener('click',e=>{
   if(compact.matches&&panel.open&&panel.classList.contains('controls-tucked')){
    e.preventDefault();for(const other of panels)if(other!==panel&&other.open)other.open=false;panel.classList.remove('controls-tucked');
   }
  });
  panel.addEventListener('toggle',()=>{
   if(!panel.open)panel.classList.remove('controls-tucked');
   if(compact.matches&&panel.open&&!panel.classList.contains('controls-tucked')){
    // Keep event mode active while browsing another tool panel.
    for(const other of panels)if(other!==panel&&other.open){
     if(other.id==='eventsPanel')other.classList.add('controls-tucked');
     else other.open=false;
    }
   }
   reflow();
  });
  panel.querySelector('.panel-done').onclick=()=>{
   if(panel.id==='eventsPanel')panel.classList.add('controls-tucked');
   else panel.open=false;
   panel.querySelector('summary').focus();
  };
 }
 // Placement needs an unobstructed canvas; tucking keeps NPC/event mode on.
 document.querySelectorAll('[data-add-event]').forEach(button=>button.addEventListener('click',()=>{
  if(compact.matches)$('eventsPanel').classList.add('controls-tucked');
 }));
 $('eventSelect').addEventListener('change',()=>{
  if(compact.matches)$('eventsPanel').classList.add('controls-tucked');
 });
 window.addEventListener('resize',reflow);
 const observer=new ResizeObserver(reflow);observer.observe($('canvasWrap'));
 compact.addEventListener('change',sync);
 const narrow=matchMedia('(max-width: 540px)'),inspector=document.querySelector('.inspector'),palette=$('paletteDialog');
 const resize=$('paletteResize'),workspace=document.querySelector('.workspace'),orientation=matchMedia('(orientation: portrait)');
 let resizing=null;const sizes={};
 try{Object.assign(sizes,JSON.parse(localStorage.getItem('tileforge-palette-sizes')||'{}'));}catch{}
 const sizeKey=()=>`${orientation.matches?'portrait':'landscape'}-${narrow.matches?'drawer':'panel'}`;
 function limits(){return narrow.matches?{min:220,max:Math.min(480,innerWidth-16)}:{min:160,max:Math.max(160,Math.min(480,innerWidth-(compact.matches?300:600)))};}
 function positionHandle(){const r=(narrow.matches?palette:inspector).getBoundingClientRect();resize.hidden=narrow.matches?!palette.open:!r.height||workspace.hidden;resize.style.left=(r.left-12)+'px';resize.style.top=(r.top+8)+'px';resize.style.height=Math.max(44,r.height-16)+'px';}
 function applyWidth(value,save=false){const l=limits(),fallback=narrow.matches?360:innerWidth<=800?168:innerWidth<=1366?200:260,width=Math.round(Math.max(l.min,Math.min(l.max,Number.isFinite(value)?value:fallback)));workspace.style.setProperty('--palette-width',width+'px');palette.style.setProperty('--palette-width',width+'px');resize.setAttribute('aria-valuemin',l.min);resize.setAttribute('aria-valuemax',l.max);resize.setAttribute('aria-valuenow',width);if(save){sizes[sizeKey()]=width;try{localStorage.setItem('tileforge-palette-sizes',JSON.stringify(sizes));}catch{}}positionHandle();reflow();}
 resize.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();resizing={pointer:e.pointerId,x:e.clientX,width:Number(resize.getAttribute('aria-valuenow'))};resize.setPointerCapture(e.pointerId);});
 resize.addEventListener('pointermove',e=>{if(resizing?.pointer===e.pointerId)applyWidth(resizing.width+resizing.x-e.clientX,true);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])resize.addEventListener(type,()=>resizing=null);
 resize.addEventListener('keydown',e=>{let width=Number(resize.getAttribute('aria-valuenow'));if(e.key==='ArrowLeft')width+=16;else if(e.key==='ArrowRight')width-=16;else if(e.key==='Home'){delete sizes[sizeKey()];width=undefined;}else return;e.preventDefault();applyWidth(width,true);});
 const paletteObserver=new ResizeObserver(positionHandle);paletteObserver.observe(inspector);paletteObserver.observe(workspace);
 orientation.addEventListener('change',()=>applyWidth(sizes[sizeKey()]));window.addEventListener('resize',()=>applyWidth(sizes[sizeKey()]));
 const anchor=document.createComment('tile palette position');inspector.before(anchor);
 function placePalette(){
  if(palette.open)palette.close();
  if(narrow.matches){palette.append(resize,inspector);}else{workspace.append(resize);anchor.parentNode.insertBefore(inspector,anchor.nextSibling);}applyWidth(sizes[sizeKey()]);
  $('brushToggle').setAttribute('aria-expanded','false');reflow();
 }
 $('brushToggle').onclick=()=>{palette.showModal();positionHandle();$('brushToggle').setAttribute('aria-expanded','true');};
 palette.addEventListener('close',()=>{positionHandle();$('brushToggle').setAttribute('aria-expanded','false');});
 inspector.addEventListener('click',e=>{
  if(palette.open&&e.target.closest('#tilePalette button,#movementChoices button,#swatches button'))queueMicrotask(()=>palette.close());
 },true);
 narrow.addEventListener('change',placePalette);placePalette();
 sync();
}
