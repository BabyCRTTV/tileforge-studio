import {decodeBlocks,encodeBlocks,paintBlock} from './core.mjs?v=0.21.2';
export function decodeBorder(bytes,layout){
 const width=layout.border_width??2,height=layout.border_height??2;
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>32||height>32)throw Error('Unsupported border dimensions');
 return {width,height,cells:decodeBlocks(bytes,width,height),path:layout.border_filepath};
}
export function repeatIndex(x,y,width,height){return ((y%height+height)%height)*width+(x%width+width)%width;}
export function paintBorderCell(border,index,tile){
 if(!Number.isInteger(index)||index<0||index>=border.cells.length)throw Error('Invalid border cell');
 const cells=border.cells.slice();cells[index]=paintBlock(cells[index],tile,null,null);return encodeBlocks(cells);
}
export function createBorder({S,C,$,getFile,record,render,fit,status,paletteUI}){
 async function load(layout,files=S.files){
  if(!layout.border_filepath)return {error:'This layout has no border file.'};
  try{await getFile(layout.border_filepath);return decodeBorder(files.get(layout.border_filepath),layout);}catch(e){return {error:'Border unavailable: '+e.message};}
 }
 function margin(){return S.view==='map'&&$('borderToggle').checked&&S.border?.cells?{x:Math.ceil(4/S.border.width)*S.border.width,y:Math.ceil(4/S.border.height)*S.border.height}:{x:0,y:0};}
 function sync(){
  $('borderPanel').hidden=S.view!=='map';const b=S.border,grid=$('borderGrid');grid.replaceChildren();
  $('borderToggle').disabled=!b?.cells;$('borderInfo').textContent=b?.error|| (b?b.width+' × '+b.height+' repeating pattern. Choose a tile, then tap a border cell.':'Open a source map to edit its border.');
  if(!b?.cells)return;grid.style.gridTemplateColumns='repeat('+b.width+', 52px)';
  b.cells.forEach((value,index)=>{
   const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Border cell '+(index%b.width)+','+Math.floor(index/b.width));button.title='Metatile #'+(value&1023).toString(16).padStart(3,'0');
   const cv=document.createElement('canvas');cv.width=cv.height=16;const cx=cv.getContext('2d'),tile=S.tiles.get(value&1023);if(tile)cx.drawImage(tile,0,0);else{cx.fillStyle='#ff00ff';cx.fillRect(0,0,16,16);}button.append(cv);
   button.onclick=()=>{
    if(S.busy)return;if(S.tool==='pick'){S.selected=value&1023;paletteUI();return;}
    const before=S.files.get(b.path),after=paintBorderCell(b,index,S.selected);if(C.equal(before,after))return;
    S.files.set(b.path,after);S.border=decodeBorder(after,S.layout);record(b.path,before,after);render();status('Border tile saved · '+b.path);
   };grid.append(button);
  });
 }
 function draw(cx,m,state=S){
  const b=state.border;if(!b?.cells||!m.x)return;
  cx.globalAlpha=.72;
  for(let y=-m.y;y<state.layout.height+m.y;y++)for(let x=-m.x;x<state.layout.width+m.x;x++){
   if(x>=0&&x<state.layout.width&&y>=0&&y<state.layout.height)continue;
   const tile=state.tiles.get(b.cells[repeatIndex(x,y,b.width,b.height)]&1023);
   if(tile)cx.drawImage(tile,x*16,y*16);else{cx.fillStyle='#ff00ff';cx.fillRect(x*16,y*16,16,16);}
  }
  cx.globalAlpha=1;
 }
 $('borderToggle').onchange=()=>{render();if(S.autoFit)fit();};
 return {load,sync,margin,draw};
}
