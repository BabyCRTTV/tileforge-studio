import * as P from './project.mjs?v=0.19.0';

// A tile ID belongs to a map's primary/secondary pair, never to a global pool.
export function libraryGroups(layouts,active,files){
 const groups=new Map(),types=new Map();
 for(const [path,bytes] of files||[])if(/^data\/maps\/[^/]+\/map\.json$/.test(path))try{const m=JSON.parse(new TextDecoder().decode(bytes));if(!types.has(m.layout))types.set(m.layout,new Set());types.get(m.layout).add(m.map_type);}catch{}
 for(const l of layouts){if(P.layoutFormat(l)!==P.layoutFormat(active))continue;
  const key=JSON.stringify([l.primary_tileset,l.secondary_tileset||'0']);
  if(!groups.has(key))groups.set(key,{key,layout:l,locations:[],interior:false,exterior:false,shared:false});
  const g=groups.get(key);g.locations.push(P.friendly(l.name||l.id));
  const known=types.get(l.id),name=[l.name,l.primary_tileset,l.secondary_tileset].join(' ');
  if(known?.size){for(const type of known){if(type==='MAP_TYPE_INDOOR'||type==='MAP_TYPE_SECRET_BASE')g.interior=true;else if(['MAP_TYPE_ROUTE','MAP_TYPE_TOWN','MAP_TYPE_CITY','MAP_TYPE_UNDERWATER','MAP_TYPE_OCEAN_ROUTE'].includes(type))g.exterior=true;else g.shared=true;}}
  else if(/house|interior|indoor|pok[eé]moncenter|pok[eé]mart|laboratory|\blab\b|room|office|museum|gym|departmentstore/i.test(name))g.interior=true;
  else if(/town|city|route|outdoor|exterior|island|forest/i.test(name))g.exterior=true;
  else g.shared=true;
 }
 const current=JSON.stringify([active.primary_tileset,active.secondary_tileset||'0']);
 return [...groups.values()].sort((a,b)=>(b.key===current)-(a.key===current)||P.friendly(a.layout.secondary_tileset).localeCompare(P.friendly(b.layout.secondary_tileset)));
}
export function tileMatches(id,info,query,group){const text=[id,'#'+id.toString(16).padStart(3,'0'),'0x'+id.toString(16),info?.name,info?.behavior,info?.category,info?.sourceName,...group.locations,group.layout.primary_tileset,group.layout.secondary_tileset].join(' ').toLowerCase();return query.toLowerCase().trim().split(/\s+/).filter(Boolean).every(w=>text.includes(w));}

export function createTileLibrary({S,C,$,chooseTile,buildPalettes,rebuildTiles,changeTilesets,refreshChoices,task,render}){
 const host=$('projectTileLibrary'),inspector=document.querySelector('.inspector');
 let groups=[],files=null,layout=null,pair=null,environment='',generation=0,frame=0,queue=[],running=0,controller=new AbortController(),pending=null;
 const dialog=document.createElement('dialog');dialog.id='libraryApplyDialog';dialog.className='library-apply-dialog';dialog.innerHTML='<div class="dialog-head"><h2>Use these tilesets?</h2><button type="button" aria-label="Keep current tilesets">×</button></div><p id="libraryApplyNote"></p><div class="library-map-previews"><figure><figcaption>Current map</figcaption><canvas id="libraryBefore"></canvas></figure><figure><figcaption>With selected tilesets</figcaption><canvas id="libraryAfter"></canvas></figure></div><p id="libraryApplyWarning" role="status"></p><p class="studio-note">A map uses one primary and one secondary tileset. Apply changes this layout’s artwork references. Collision, elevation and source tileset artwork stay unchanged. Undo restores the pair.</p><div class="review-actions"><button id="libraryCancel" type="button" autofocus>Keep current tilesets</button><button id="libraryApply" type="button" class="primary">Apply & select tile</button></div>';document.body.append(dialog);
 const cancel=()=>{if(pending?.g.data){pending.g.data.tiles.clear();pending.g.range='';}pending=null;dialog.close();refreshChoices();schedule();};dialog.querySelector('.dialog-head button').onclick=$('libraryCancel').onclick=cancel;dialog.addEventListener('cancel',e=>{e.preventDefault();cancel();});
 const activeKey=()=>JSON.stringify([S.layout?.primary_tileset,S.layout?.secondary_tileset||'0']);
 const available=()=>S.view==='map'&&!S.movement&&!$('eventsPanel').open;
 const show=()=>$('showAllTilesets').checked||!!environment;
 function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(paintVisible);}
 function reset(){generation++;controller.abort();controller=new AbortController();queue=[];groups=[];host.replaceChildren();files=S.files;layout=S.layout;pair=activeKey();if(!layout)return;for(const g of libraryGroups(S.layouts,layout,files)){g.state='new';g.matches=[];g.node=document.createElement('section');g.node.className='library-group';const title=document.createElement('h3');title.textContent=P.friendly(g.layout.primary_tileset)+' + '+P.friendly(g.layout.secondary_tileset||'No secondary');const detail=document.createElement('p');detail.textContent=g.key===pair?'Active pair':g.locations.slice(0,3).join(' · ')+(g.locations.length>3?' · +'+(g.locations.length-3)+' locations':'');g.grid=document.createElement('div');g.grid.className='library-grid';g.grid.textContent='Scroll here to load tiles…';g.grid.style.minHeight='88px';g.node.append(title,detail,g.grid);host.append(g.node);groups.push(g);}filter();}
 function sync(){
  if(files!==S.files||layout!==S.layout||pair!==activeKey()||groups.some(g=>g.data&&[...g.data.dependencies].some(([p,b])=>files.get(p)!==b)))reset();
  const map=available();$('tileLibraryControls').hidden=!map;host.hidden=!map||!show();$('tilePalette').hidden=!map||show();$('paletteFilters').hidden=!map||show();$('brushQuickInfo').hidden=!map||show();
  if(map&&show()){$('tileTotal').textContent=groups.length+(groups.length===1?' pair':' pairs');$('paletteHeading').textContent='TILE PAINTER';$('paletteDescription').textContent='Browse project tilesets. Another pair opens a preview before Apply.';}if(map&&!show())$('libraryStatus').textContent='Active map pair · category, pin and recent filters below';if(!host.hidden)schedule();
 }
 function filter(){const q=$('librarySearch').value;let visible=0;
  for(const g of groups){g.node.hidden=!!environment&&!(g[environment]||g.shared);if(g.node.hidden)continue;visible++;
   if(g.data){g.matches=[...g.data.info.keys()].filter(id=>tileMatches(id,g.data.info.get(id),q,g));g.grid.style.minHeight='0px';}
   else if(q&&g.state==='new')enqueue(g);}
  $('libraryStatus').textContent=(environment?environment[0].toUpperCase()+environment.slice(1):'All project tilesets')+' · '+visible+(visible===1?' pair':' pairs')+' · shared sets may appear in both filters';schedule();
 }
 function enqueue(g){if(g.state!=='new')return;g.state='queued';queue.push({g,token:generation});pump();}
 function pump(){while(running<2&&queue.length){const job=queue.shift();if(job.token!==generation)continue;running++;load(job.g,job.token).finally(()=>{running--;pump();schedule();});}}
 async function load(g,token){
  const captured=files,baseline=S.base,source={...S.source},signal=controller.signal,dependencies=new Map();
  async function read(path){C.safePath(path);let b=captured.get(path);if(!b){if(source.type!=='github')throw Error('Missing '+path+'. Open a complete source pack.');const response=await fetch('https://raw.githubusercontent.com/BabyCRTTV/pokeemerald-emerald-legends/'+source.revision+'/'+path,{signal});if(!response.ok)throw Error('Could not load '+path+' ('+response.status+').');b=new Uint8Array(await response.arrayBuffer());if(token!==generation)throw Error('Library changed');if(!captured.has(path)){captured.set(path,b);baseline.set(path,b.slice());}b=captured.get(path);}dependencies.set(path,b);return b;}
  try{
   for(const [path,b] of captured)if(/^(?:src\/data\/tilesets\/|include\/constants\/metatile)/.test(path))dependencies.set(path,b);
   g.state='loading';g.grid.textContent='Loading tiles…';
   const primary=C.resolveTileset(captured,g.layout.primary_tileset),defs=[primary,g.layout.secondary_tileset&&g.layout.secondary_tileset!=='0'?C.resolveTileset(captured,g.layout.secondary_tileset):{...primary,symbol:'No secondary',empty:true}];
   await Promise.all(defs.flatMap(d=>[d.image,d.metatiles,d.attributes,...d.palettes].map(read)));
   if(token!==generation)return;
   const sets=defs.map(d=>({...d,png:C.decodePNG(captured.get(d.image)),meta:d.empty?new Uint8Array():captured.get(d.metatiles),attr:captured.get(d.attributes)}));
   if(sets.some(s=>s.meta.length%16))throw Error('Unsupported metatile format in this pair.');
   const data={layout:g.layout,sets,tiles:new Map(),dependencies};buildPalettes(data,captured);data.info=P.metatileInfo(captured,sets,P.layoutFormat(g.layout));g.data=data;g.state='ready';filter();
  }catch(e){if(token!==generation)return;g.state='error';g.grid.replaceChildren();const text=document.createElement('p');text.textContent=e.message;const retry=document.createElement('button');retry.textContent='Retry loading tiles';retry.onclick=()=>{g.state='new';enqueue(g);};g.grid.append(text,retry);}
 }
 function paintVisible(){if(host.hidden||!available())return;const viewport=inspector.getBoundingClientRect();
  for(const g of groups){if(g.node.hidden)continue;const r=g.grid.getBoundingClientRect(),near=r.bottom>=viewport.top-350&&r.top<=viewport.bottom+350;
   if(g.state==='new'&&near)enqueue(g);
   if(g.state!=='ready')continue;
   const cols=Math.max(1,Math.floor((g.grid.clientWidth+6)/62)),rowHeight=68,rows=Math.ceil(g.matches.length/cols);
   if(!near){g.grid.replaceChildren();g.grid.style.height=rows*rowHeight+'px';g.range='';g.data.tiles.clear();continue;}
   const start=Math.max(0,Math.floor((viewport.top-r.top-140)/rowHeight)),end=Math.min(rows,Math.ceil((viewport.bottom-r.top+140)/rowHeight));
   const range=[start,end,cols,$('librarySearch').value,g.matches.length,S.selected,pair].join(':');if(g.range===range)continue;g.range=range;g.grid.style.height=rows*rowHeight+'px';g.grid.style.gridTemplateColumns='repeat('+cols+',minmax(0,1fr))';g.grid.replaceChildren();
   const spacer=(height)=>{const d=document.createElement('div');d.style.cssText='grid-column:1/-1;height:'+height+'px';return d;};
   if(start)g.grid.append(spacer(start*rowHeight));
   const ids=g.matches.slice(start*cols,end*cols);rebuildTiles(g.data,new Set(ids));
   for(const id of ids){const info=g.data.info.get(id),b=document.createElement('button');b.type='button';b.dataset.libraryTile=id;b.className=g.key===pair&&id===S.selected?'active':'';b.title=(info.name||info.behavior||info.category)+' · '+info.sourceName+' · #'+id.toString(16).padStart(3,'0');b.setAttribute('aria-label',b.title);const cv=g.data.tiles.get(id);const label=document.createElement('small');label.textContent=(id<(P.layoutFormat(g.layout)==='frlg'?640:512)?'P':'S')+' #'+id.toString(16).padStart(3,'0').toUpperCase();if(cv)b.append(cv);b.append(label);b.onclick=()=>task(()=>select(g,id));g.grid.append(b);}
   if(end<rows)g.grid.append(spacer((rows-end)*rowHeight));
   if(!g.matches.length){const p=document.createElement('p');p.className='tile-empty';p.textContent='No matching tiles in this pair.';g.grid.append(p);g.grid.style.height='auto';}
  }
 }
 const finish=id=>{chooseTile(id);if($('paletteDialog').open)$('paletteDialog').close();schedule();};
 function preview(canvas,tiles){canvas.width=S.layout.width*16;canvas.height=S.layout.height*16;const cx=canvas.getContext('2d');cx.imageSmoothingEnabled=false;for(let i=0;i<S.cells.length;i++){const tile=tiles.get(S.cells[i]&1023),x=i%S.layout.width*16,y=Math.floor(i/S.layout.width)*16;if(tile)cx.drawImage(tile,x,y);else{cx.fillStyle='#ff00ff';cx.fillRect(x,y,16,16);}}}
 async function select(g,id){if(g.key===activeKey()){finish(id);return;}if(!g.data)return;
  rebuildTiles(g.data);preview($('libraryBefore'),S.tiles);preview($('libraryAfter'),g.data.tiles);
  const missing=P.missingTiles(S.cells,g.data.sets[0].meta.length/16,g.data.sets[1].meta.length/16,P.layoutFormat(S.layout));
  $('libraryApplyNote').textContent='Selected '+g.data.info.get(id).sourceName+' #'+id.toString(16).padStart(3,'0')+'. This tile needs the pair shown below. Compare the whole playable map before applying.';
  $('libraryApplyWarning').textContent=missing?missing+' map cells will have missing artwork (magenta). Repair these cells before exporting changes.':'All playable map cells have artwork in this pair. Border artwork also uses the selected pair; inspect it after Apply.';
  pending={g,id,files:S.files,layout:S.layout,json:S.files.get('data/layouts/layouts.json'),blocks:S.files.get(S.layout.blockdata_filepath),dependencies:new Map(g.data.dependencies)};dialog.showModal();$('libraryCancel').focus();
 }
 $('libraryApply').onclick=()=>task(async()=>{const p=pending;if(!p)return;if(p.files!==S.files||p.layout!==S.layout||p.json!==S.files.get('data/layouts/layouts.json')||p.blocks!==S.files.get(S.layout.blockdata_filepath)||[...p.dependencies].some(([path,bytes])=>S.files.get(path)!==bytes))throw Error('The map or artwork changed. Close this preview and select the tile again.');if(await changeTilesets(p.g.layout.primary_tileset,p.g.layout.secondary_tileset||'0')){dialog.close();pending=null;finish(p.id);render();}});
 $('showAllTilesets').onchange=()=>{environment='';for(const b of document.querySelectorAll('[data-library-environment]'))b.setAttribute('aria-pressed','false');filter();sync();};
 for(const b of document.querySelectorAll('[data-library-environment]'))b.onclick=()=>{environment=b.dataset.libraryEnvironment;$('showAllTilesets').checked=false;for(const t of document.querySelectorAll('[data-library-environment]'))t.setAttribute('aria-pressed',String(t===b));filter();sync();};
 $('librarySearch').oninput=filter;inspector.addEventListener('scroll',schedule,{passive:true});new ResizeObserver(schedule).observe(inspector);
 async function previewPair(primary,secondary){
  const key=JSON.stringify([primary,secondary||'0']);if(key===activeKey())return;
  let g=groups.find(g=>g.key===key);if(!g)g={key,layout:{...S.layout,primary_tileset:primary,secondary_tileset:secondary},locations:[P.friendly(S.layout.name||S.layout.id)],grid:document.createElement('div')};
  if(!g.data)await load(g,generation);if(!g.data)throw Error('Could not load this pair. Check the source pack and try again.');
  await select(g,g.data.info.has(S.selected)?S.selected:g.data.info.keys().next().value);
 }
 return {sync,reset,previewPair};
}
