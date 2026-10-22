// Keep the canvas usable as a foldable changes width, height or orientation.
export function createLayout({S,$,fit}) {
 const compact=matchMedia('(max-width: 1366px)');
 const panels=[...document.querySelectorAll('.studio-panels > details')];
 let frame;
 function reflow(){
  cancelAnimationFrame(frame);
  frame=requestAnimationFrame(()=>{if(S.autoFit&&!S.stroke)fit();});
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
 const anchor=document.createComment('tile palette position');inspector.before(anchor);
 function placePalette(){
  if(palette.open)palette.close();
  if(narrow.matches)palette.append(inspector);else anchor.parentNode.insertBefore(inspector,anchor.nextSibling);
  $('brushToggle').setAttribute('aria-expanded','false');reflow();
 }
 $('brushToggle').onclick=()=>{palette.showModal();$('brushToggle').setAttribute('aria-expanded','true');};
 palette.addEventListener('close',()=>{$('brushToggle').setAttribute('aria-expanded','false');});
 inspector.addEventListener('click',e=>{
  if(palette.open&&e.target.closest('#tilePalette button,#movementChoices button,#swatches button'))queueMicrotask(()=>palette.close());
 },true);
 narrow.addEventListener('change',placePalette);placePalette();
 sync();
}
