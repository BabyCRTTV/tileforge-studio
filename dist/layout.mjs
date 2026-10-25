import {usableViewport} from './viewport.mjs?v=0.21.2';
// Keep the canvas usable as a foldable changes width, height or orientation.
export function createLayout({S,$,fit}) {
 const compact=matchMedia('(max-width: 1366px)');
 const panels=[...document.querySelectorAll('.studio-panels > details')];
 let frame;
 function reflow(){
  cancelAnimationFrame(frame);
  frame=requestAnimationFrame(()=>{
   // Short windows may have no room below the tool header. Float the panel
   // inside the safe viewport instead of clipping its buttons under system UI.
   for(const panel of panels){const popover=panel.querySelector('.studio-popover');
    if(panel.id!=='eventsPanel'&&panel.open&&!panel.classList.contains('controls-tucked')){
     const v=usableViewport(),anchor=panel.querySelector('summary').getBoundingClientRect(),width=Math.max(1,Math.min(740,v.width-24));
     Object.assign(popover.style,{position:'fixed',right:'auto',bottom:'auto',zIndex:'30',width:width+'px',maxHeight:Math.max(44,Math.min(380,v.height-24))+'px',left:Math.max(v.left+12,Math.min(anchor.left,v.right-width-12))+'px',top:(v.top+12)+'px'});
     const height=popover.getBoundingClientRect().height;if(document.body.classList.contains('classic-studio'))popover.style.left=Math.max(v.left+12,v.left+(v.width-width)/2)+'px';popover.style.top=Math.max(v.top+12,Math.min(anchor.bottom+5,v.bottom-height-12))+'px';
    }else for(const key of ['position','right','bottom','z-index','width','max-height','left','top'])popover.style.removeProperty(key);
   }
   if(S.autoFit&&!S.stroke)fit();
  });
 }
 function sync(){
  // Desktop display controls are inline; compact controls open over the map.
  $('displayPanel').open=false;
  $('tileTagDetails').open=false;$('brushDetails').open=false;
  for(const panel of panels)panel.classList.remove('controls-tucked');
  reflow();
 }
 for(const panel of panels){
  panel.querySelector('.panel-close').onclick=()=>requestClose(panel);
  panel.querySelector('summary').addEventListener('click',e=>{
   if(compact.matches&&panel.open&&panel.classList.contains('controls-tucked')){
    e.preventDefault();for(const other of panels)if(other!==panel&&other.open)other.open=false;panel.classList.remove('controls-tucked');
   }
  });
  panel.addEventListener('toggle',()=>{
   if(!panel.open)panel.classList.remove('controls-tucked');
   if(panel.id!=='eventsPanel'&&panel.open&&!panel.classList.contains('controls-tucked')){
    // Keep event mode active while browsing another tool panel.
    for(const other of panels)if(other!==panel&&other.open){
     if(other.id==='eventsPanel')other.classList.add('controls-tucked');
     else other.open=false;
    }
   }
   reflow();
  });
  panel.querySelector('.panel-done').onclick=()=>{
   if(panel.id==='eventsPanel'){panel.classList.add('controls-tucked');if($('paletteDialog').open)$('paletteDialog').close();}
   else panel.open=false;
   panel.querySelector('summary').focus();
  };
 }
 function closePanel(panel){
  panel.open=false;panel.classList.remove('controls-tucked');if(panel.id==='eventsPanel'&&$('paletteDialog').open)$('paletteDialog').close();
  (panel.id==='eventsPanel'?$('eventsMode'):document.querySelector('.more-map-tools>summary'))?.focus();
 }
 const closeDialog=$('closeMenuDialog');let pendingClose=null;
 function requestClose(panel){
  if(closeDialog.open)return;pendingClose=panel;
  $('closeMenuName').textContent=panel.querySelector('.panel-head h3').textContent;
  closeDialog.showModal();$('cancelCloseMenu').focus();
 }
 function cancelClose(){
  const panel=pendingClose;pendingClose=null;closeDialog.close();
  if(panel?.open)panel.querySelector('.panel-close').focus();
 }
 $('cancelCloseMenu').onclick=$('cancelCloseMenuX').onclick=cancelClose;
 closeDialog.addEventListener('cancel',e=>{e.preventDefault();cancelClose();});
 closeDialog.addEventListener('close',()=>{if(!closeDialog.open&&pendingClose)cancelClose();});
 $('confirmCloseMenu').onclick=()=>{
  const panel=pendingClose;pendingClose=null;closeDialog.close();
  if(panel)closePanel(panel);
 };
 document.addEventListener('keydown',e=>{
  if(e.key!=='Escape'||e.defaultPrevented||document.querySelector('dialog[open]'))return;
  const panel=panels.find(p=>p.open&&!p.classList.contains('controls-tucked')&&getComputedStyle(p.querySelector('.panel-close')).display!=='none');
  if(panel){e.preventDefault();requestClose(panel);}
 });
 // Placement needs an unobstructed canvas; tucking keeps NPC/event mode on.
 document.querySelectorAll('[data-add-event]').forEach(button=>button.addEventListener('click',()=>{
  if(compact.matches){$('eventsPanel').classList.add('controls-tucked');if($('paletteDialog').open)$('paletteDialog').close();}
 }));
 $('eventSelect').addEventListener('change',()=>{
  if(compact.matches){$('eventsPanel').classList.add('controls-tucked');if($('paletteDialog').open)$('paletteDialog').close();}
 });
 window.addEventListener('resize',reflow);
 window.visualViewport?.addEventListener('resize',reflow);window.addEventListener('usableviewportchange',reflow);
 const observer=new ResizeObserver(reflow);observer.observe($('canvasWrap'));
 compact.addEventListener('change',sync);
 const narrow=matchMedia('(max-width: 1100px)'),inspector=document.querySelector('.inspector'),palette=$('paletteDialog');
 const resize=$('paletteResize'),workspace=document.querySelector('.workspace'),orientation=matchMedia('(orientation: portrait)');
 let resizing=null;const sizes={};
 try{Object.assign(sizes,JSON.parse(localStorage.getItem('tileforge-palette-sizes')||'{}'));}catch{}
 const sizeKey=()=>`${orientation.matches?'portrait':'landscape'}-${narrow.matches?'drawer':'panel'}`;
 function limits(){return narrow.matches?{min:220,max:Math.min(480,usableViewport().width-24)}:{min:160,max:Math.max(160,Math.min(480,innerWidth-(compact.matches?300:600)))};}
 function positionHandle(){const r=(narrow.matches?palette:inspector).getBoundingClientRect();resize.hidden=narrow.matches?!palette.open:!r.height||workspace.hidden;const v=usableViewport();resize.style.left=Math.max(v.left,Math.min(v.right-24,r.left-12))+'px';resize.style.top=Math.max(v.top,r.top+8)+'px';resize.style.height=Math.max(0,Math.min(r.height-16,v.bottom-Math.max(v.top,r.top+8)))+'px';}
 function applyWidth(value,save=false){const l=limits(),fallback=narrow.matches?360:innerWidth<=800?168:300,width=Math.round(Math.max(l.min,Math.min(l.max,Number.isFinite(value)?value:fallback)));workspace.style.setProperty('--palette-width',width+'px');palette.style.setProperty('--palette-width',width+'px');resize.setAttribute('aria-valuemin',l.min);resize.setAttribute('aria-valuemax',l.max);resize.setAttribute('aria-valuenow',width);if(save){sizes[sizeKey()]=width;try{localStorage.setItem('tileforge-palette-sizes',JSON.stringify(sizes));}catch{}}positionHandle();reflow();}
 resize.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();resizing={pointer:e.pointerId,x:e.clientX,width:Number(resize.getAttribute('aria-valuenow'))};resize.setPointerCapture(e.pointerId);});
 resize.addEventListener('pointermove',e=>{if(resizing?.pointer===e.pointerId)applyWidth(resizing.width+resizing.x-e.clientX,true);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])resize.addEventListener(type,()=>resizing=null);
 resize.addEventListener('keydown',e=>{let width=Number(resize.getAttribute('aria-valuenow'));if(e.key==='ArrowLeft')width+=16;else if(e.key==='ArrowRight')width-=16;else if(e.key==='Home'){delete sizes[sizeKey()];width=undefined;}else return;e.preventDefault();applyWidth(width,true);});
 const paletteObserver=new ResizeObserver(positionHandle);paletteObserver.observe(inspector);paletteObserver.observe(workspace);
 orientation.addEventListener('change',()=>applyWidth(sizes[sizeKey()]));window.addEventListener('resize',()=>applyWidth(sizes[sizeKey()]));window.addEventListener('usableviewportchange',()=>applyWidth(sizes[sizeKey()]));
 const anchor=document.createComment('tile palette position');inspector.before(anchor);
 function placePalette(){
  if(palette.open)palette.close();
  if(narrow.matches){palette.append(resize,inspector);}else{workspace.append(resize);anchor.parentNode.insertBefore(inspector,anchor.nextSibling);}applyWidth(sizes[sizeKey()]);
  $('brushToggle').setAttribute('aria-expanded','false');reflow();
 }
 $('brushToggle').onclick=()=>{if(!palette.open)palette.showModal();positionHandle();$('brushToggle').setAttribute('aria-expanded','true');};
 palette.addEventListener('close',()=>{positionHandle();$('brushToggle').setAttribute('aria-expanded','false');});
 inspector.addEventListener('click',e=>{
  if(palette.open&&e.target.closest('#tilePalette button,#movementChoices button,#swatches button'))queueMicrotask(()=>palette.close());
 },true);
 narrow.addEventListener('change',placePalette);placePalette();
 sync();
}
