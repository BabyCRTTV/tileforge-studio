// Native Android sizes the entire WebView inside its safe container. Browser
// and PWA overlays also respect CSS safe areas and the visible keyboard viewport.
export function usableViewport(win=window,doc=document){
 const style=win.getComputedStyle(doc.body),value=name=>Math.max(0,parseFloat(style[name])||0),v=win.visualViewport;
 const x=v?.offsetLeft||0,y=v?.offsetTop||0;
 const left=Math.max(value('paddingLeft'),x),top=Math.max(value('paddingTop'),y);
 const right=Math.max(left,Math.min(win.innerWidth-value('paddingRight'),x+(v?.width??win.innerWidth)));
 const bottom=Math.max(top,Math.min(win.innerHeight-value('paddingBottom'),y+(v?.height??win.innerHeight)));
 return {left,top,right,bottom,width:right-left,height:bottom-top};
}
export function createViewport(){
 let frame;const sync=()=>{const r=usableViewport(),style=document.documentElement.style;for(const[k,v]of Object.entries({top:r.top,left:r.left,right:innerWidth-r.right,bottom:innerHeight-r.bottom,width:r.width,height:r.height,'center-x':(r.left+r.right)/2}))style.setProperty('--usable-'+k,v+'px');window.dispatchEvent(new Event('usableviewportchange'));};
 const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(sync);};
 window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);sync();
 return {sync};
}
