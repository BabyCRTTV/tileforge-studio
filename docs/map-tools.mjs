// Independently implemented area brushes. Map words retain their original field masks.
export function rectBetween(a,b,width,height){
 const x=Math.max(0,Math.min(a.x,b.x)),y=Math.max(0,Math.min(a.y,b.y));
 return {x,y,w:Math.max(0,Math.min(width-1,Math.max(a.x,b.x))-x+1),h:Math.max(0,Math.min(height-1,Math.max(a.y,b.y))-y+1)};
}
export function pairKey(layout,sets){return JSON.stringify([layout?.layout_version||'emerald',...sets.map(s=>[s.symbol,s.metatiles,s.image])]);}
export function captureArea(cells,width,height,r,key,name='Selection'){
 if(![r.x,r.y,r.w,r.h].every(Number.isInteger)||r.x<0||r.y<0||r.w<1||r.h<1||r.w>64||r.h>64||r.x+r.w>width||r.y+r.h>height||cells.length!==width*height)throw Error('Select an area inside the map, up to 64 × 64 tiles.');
 const words=[];for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++)words.push(cells[(r.y+y)*width+r.x+x]);
 return {name:String(name).slice(0,60),w:r.w,h:r.h,key,words};
}
export function validStamp(s){return !!s&&typeof s.key==='string'&&s.key.length<2048&&typeof s.name==='string'&&s.name.length<=60&&Number.isInteger(s.w)&&s.w>0&&s.w<=64&&Number.isInteger(s.h)&&s.h>0&&s.h<=64&&Array.isArray(s.words)&&s.words.length===s.w*s.h&&s.words.every(v=>Number.isInteger(v)&&v>=0&&v<=65535);}
export function stampArea(cells,width,height,stamp,x,y,mode,key){
 if(!validStamp(stamp)||!Number.isInteger(x)||!Number.isInteger(y)||cells.length!==width*height)throw Error('Invalid area brush.');
 const mask={art:0x03ff,movement:0xfc00,all:0xffff}[mode];if(!mask)throw Error('Choose what the stamp should copy.');
 if(mode!=='movement'&&stamp.key!==key)throw Error('This stamp needs its original tileset pair. Switch to that pair or copy movement only.');
 let changed=0,placed=0;for(let sy=0;sy<stamp.h;sy++)for(let sx=0;sx<stamp.w;sx++){
  const dx=x+sx,dy=y+sy;if(dx<0||dy<0||dx>=width||dy>=height)continue;
  const i=dy*width+dx,value=(cells[i]&~mask)|(stamp.words[sy*stamp.w+sx]&mask);placed++;if(cells[i]!==value){cells[i]=value;changed++;}
 }return {changed,placed,clipped:stamp.words.length-placed};
}
export function rulerDistance(a,b){const dx=b.x-a.x,dy=b.y-a.y;return {dx,dy,steps:Math.abs(dx)+Math.abs(dy),width:Math.abs(dx)+1,height:Math.abs(dy)+1};}

export function createMapTools({S,C,$,tool,render,record,queueDraft,status,toast,download,task}){
 let stamps=[],active=null,selection=null,gesture=null,layoutId=null,ruler=null,hover=null;
 const currentKey=()=>pairKey(S.layout,S.sets),inMap=p=>S.cells&&p.x>=0&&p.y>=0&&p.x<S.layout.width&&p.y<S.layout.height;
 function preview(canvas,s){const unit=Math.max(1,Math.min(16,Math.floor(160/Math.max(s.w,s.h))));canvas.width=s.w*unit;canvas.height=s.h*unit;const cx=canvas.getContext('2d');cx.imageSmoothingEnabled=false;for(let i=0;i<s.words.length;i++){const tile=S.tiles.get(s.words[i]&1023);if(tile)cx.drawImage(tile,i%s.w*unit,Math.floor(i/s.w)*unit,unit,unit);}}
 function sync(){
  if(layoutId!==S.layout?.id){selection=null;ruler=null;hover=null;layoutId=S.layout?.id;$('rulerReadout').textContent='Ruler: drag between two cells to measure tile steps.';}
  $('areaState').textContent=({select:'Select',stamp:'Stamp',ruler:'Ruler'})[S.tool]||'';
  $('areaSelection').textContent=selection?`${selection.w} × ${selection.h} at ${selection.x}, ${selection.y}`:'Select a region with a drag, or enter its coordinates.';
  $('areaCopy').disabled=!selection;$('areaSave').disabled=!active;$('areaStamp').disabled=!active;
  $('areaActive').textContent=active?`${active.name} · ${active.w} × ${active.h}${active.key!==currentKey()?' · different tileset pair; movement only':''}`:'No area copied yet';
  if(active&&active.key===currentKey()){preview($('areaPreview'),active);$('areaPreview').hidden=false;}else $('areaPreview').hidden=true;
  const list=$('stampList'),q=$('stampSearch').value.trim().toLowerCase();list.replaceChildren();let shown=0;
  for(const [i,s]of stamps.entries())if(s.key===currentKey()&&s.name.toLowerCase().includes(q)){
   shown++;const row=document.createElement('div');row.className='stamp-row';const b=document.createElement('button'),cv=document.createElement('canvas');preview(cv,s);b.append(cv,document.createTextNode(s.name+' · '+s.w+' × '+s.h));b.onclick=()=>{active=structuredClone(s);useTool('stamp');};
   const del=document.createElement('button');del.textContent='Delete';del.setAttribute('aria-label','Delete stamp '+s.name);del.onclick=()=>{stamps.splice(i,1);queueDraft();sync();};row.append(b,del);list.append(row);
  }
  $('stampCount').textContent=shown+' matching / '+stamps.length+' saved';
 }
 function useTool(t){if(t==='stamp'&&!active){toast('Select and copy an area first.');return;}tool(t);$('eventsPanel').open=false;$('areaPanel').open=false;$('canvasTip').textContent=t==='select'?'Drag a rectangle to select. Copy it from Areas & stamps.':t==='stamp'?'Tap to stamp from its top-left corner. Undo restores the whole placement.':'Drag between two cells to measure tile distance.';sync();}
 function copy(){active=captureArea(S.cells,S.layout.width,S.layout.height,selection,currentKey());$('stampName').value='';sync();toast('Area copied. Choose Stamp or save it for reuse.');}
 $('areaSelect').onclick=()=>useTool('select');$('areaRuler').onclick=()=>useTool('ruler');$('areaStamp').onclick=()=>useTool('stamp');$('areaCopy').onclick=()=>task(copy);
 $('areaCoordinates').onclick=()=>task(()=>{const r={};for(const k of ['x','y','w','h'])r[k]=Number($('area'+k.toUpperCase()).value);captureArea(S.cells,S.layout.width,S.layout.height,r,currentKey());selection=r;sync();render();});
 $('areaSave').onclick=()=>task(()=>{if(!active)throw Error('Copy an area first.');if(stamps.length>=64)throw Error('You can save 64 stamps per project. Delete an unused one first.');const name=$('stampName').value.trim();if(!name)throw Error('Give your stamp a name first.');stamps.push({...structuredClone(active),name:name.slice(0,60)});queueDraft();sync();toast('Stamp saved in this project and its drafts.');});
 $('stampSearch').oninput=sync;$('areaClear').onclick=()=>{selection=null;ruler=null;hover=null;$('rulerReadout').textContent='Ruler: drag between two cells to measure tile steps.';sync();render();};
 $('mapImageExport').onclick=()=>task(async()=>{
  const cv=document.createElement('canvas');cv.width=S.layout.width*16;cv.height=S.layout.height*16;if(cv.width*cv.height>16777216)throw Error('This map is too large for a single image export.');
  const cx=cv.getContext('2d');for(let i=0;i<S.cells.length;i++){const tile=S.tiles.get(S.cells[i]&1023);if(tile)cx.drawImage(tile,i%S.layout.width*16,Math.floor(i/S.layout.width)*16);else{cx.fillStyle='#ff00ff';cx.fillRect(i%S.layout.width*16,Math.floor(i/S.layout.width)*16,16,16);}}
  const blob=await new Promise(resolve=>cv.toBlob(resolve,'image/png'));if(!blob)throw Error('Image export failed.');download((S.layout.name||'map')+'.png',new Uint8Array(await blob.arrayBuffer()),'image/png');
 });
 function pointerDown(e,p){if(S.view!=='map'||!['select','stamp','ruler'].includes(S.tool))return false;e.preventDefault();if(!inMap(p))return true;$('canvas').setPointerCapture(e.pointerId);gesture={pointer:e.pointerId,tool:S.tool,start:p,end:p,sx:e.clientX,sy:e.clientY,distance:0};if(S.tool==='select')selection=rectBetween(p,p,S.layout.width,S.layout.height);if(S.tool==='ruler')ruler={a:p,b:p};hover=p;sync();render();return true;}
 function pointerMove(e,p){if(S.view!=='map')return;hover=p;if(!gesture||gesture.pointer!==e.pointerId){if(S.tool==='stamp')render();return;}
  gesture.end={x:Math.max(0,Math.min(S.layout.width-1,p.x)),y:Math.max(0,Math.min(S.layout.height-1,p.y))};gesture.distance=Math.max(gesture.distance,Math.hypot(e.clientX-gesture.sx,e.clientY-gesture.sy));
  if(gesture.tool==='select')selection=rectBetween(gesture.start,gesture.end,S.layout.width,S.layout.height);if(gesture.tool==='ruler')ruler={a:gesture.start,b:gesture.end};render();
 }
 function pointerEnd(e){if(!gesture||gesture.pointer!==e.pointerId)return false;const g=gesture;gesture=null;
  if(e.type!=='pointerup'){if(g.tool==='select')selection=null;if(g.tool==='ruler')ruler=null;sync();render();return true;}
  if(g.tool==='stamp'&&g.distance<=6&&active){try{const mode=$('stampMode').value;if(mode!=='movement'&&active.words.some(word=>!S.tiles.has(word&1023)))throw Error('This stamp contains metatiles missing from the current pair.');const path=S.layout.blockdata_filepath,before=S.files.get(path).slice(),result=stampArea(S.cells,S.layout.width,S.layout.height,active,g.start.x,g.start.y,mode,currentKey());if(result.changed){const after=C.encodeBlocks(S.cells);S.files.set(path,after);record(path,before,after);}status(`Stamp: ${result.changed} cells changed${result.clipped?' · '+result.clipped+' outside map skipped':''}.`);}catch(error){toast(error.message);}}
  if(selection&&g.tool==='select'){for(const k of ['x','y','w','h'])$('area'+k.toUpperCase()).value=selection[k];status(`${selection.w} × ${selection.h} selected. Open Areas & stamps to copy it.`);}
  sync();render();return true;
 }
 function draw(cx){if(S.view!=='map')return;const r=S.tool==='stamp'&&active&&hover?{x:hover.x,y:hover.y,w:active.w,h:active.h}:selection;
  if(r){cx.fillStyle='#f6bc4938';cx.fillRect(r.x*16,r.y*16,r.w*16,r.h*16);cx.strokeStyle='#fff5a4';cx.lineWidth=1.5;cx.strokeRect(r.x*16+.5,r.y*16+.5,r.w*16-1,r.h*16-1);}
  if(ruler){const {a,b}=ruler,d=rulerDistance(a,b);cx.strokeStyle='#fff5a4';cx.lineWidth=2;cx.beginPath();cx.moveTo(a.x*16+8,a.y*16+8);cx.lineTo(b.x*16+8,b.y*16+8);cx.stroke();$('rulerReadout').textContent=`ΔX ${d.dx}, ΔY ${d.dy} · ${d.steps} tile steps · ${d.width} × ${d.height} cells`;}
 }
 return {sync,draw,pointerDown,pointerMove,pointerEnd,cancelGesture(){if(gesture?.tool==='select')selection=null;if(gesture?.tool==='ruler')ruler=null;gesture=null;hover=null;sync();},serialize:()=>({stamps}),reset(meta={}){stamps=Array.isArray(meta?.stamps)?meta.stamps.filter(validStamp).slice(0,64).map(s=>structuredClone(s)):[];active=null;selection=null;ruler=null;gesture=null;layoutId=null;},brushChosen(){if(S.tool==='stamp')tool('pencil');}};
}
