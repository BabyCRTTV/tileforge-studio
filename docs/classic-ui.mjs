// Reuse the existing tools and transactions; each action has one visible home.
export function createClassicUI({S,$,movementMode,render}){
 document.body.classList.add('classic-studio');
 const tabs=document.querySelector('.tab-group'),mapTab=tabs.querySelector('[data-view=map]');mapTab.classList.add('return-map-tab');
 tabs.append($('metatileMode'),$('movementMode'));$('movementMode').textContent='Collision';
 const events=document.createElement('button');events.id='eventsMode';events.textContent='Events';events.type='button';tabs.append(events);
 const tasks=document.querySelector('.more-map-tools');tabs.append(tasks);tasks.querySelector('summary').textContent='Tools & tasks';
 for(const id of ['newCellBtn','linkWarpBtn'])$(id).hidden=true;
 const picker=$('mobileMapPicker').closest('.search-select')||$('mobileMapPicker');document.querySelector('.editor-heading').append(picker);picker.classList.add('classic-map-picker');
 const inspector=document.querySelector('.inspector');inspector.prepend($('eventsPanel'));
 $('borderPanel').before($('tileLibraryControls'));$('tileLibraryControls').after($('projectTileLibrary'));
 $('brushDetails').after($('borderPanel'));$('brushDetails').open=false;$('tileTagDetails').open=false;
 const advanced=document.createElement('details');advanced.id='advancedMovement';advanced.innerHTML='<summary>Advanced movement</summary><p class="studio-note">These controls replace the selected fields. Copy a working tile with Pick when matching stairs, water or bridges.</p><div id="advancedMovementFields" class="advanced-movement-fields"></div>';
 const raw=advanced.querySelector('#advancedMovementFields');for(const id of ['paintCollision','collisionValue','paintElevation','elevationValue']){const el=$(id);raw.append(el.closest('label')||el);}
 advanced.append(document.querySelector('.movement-levels'));$('movementPanel').append(advanced);
 const levelLabel=document.createElement('label');levelLabel.className='elevation-overlay';levelLabel.innerHTML='<input id="showElevation" type="checkbox"> Show elevation numbers';$('mapOptions').append(levelLabel);$('showElevation').onchange=render;
 document.querySelector('.movement-intro').textContent='Choose a brush, then Paint or Fill. Green allows passage; red marks blocked cells.';
 $('allowWalking').textContent='✓ Walkable';$('blockWalking').textContent='× Blocked';
 const quick=document.querySelector('.movement-quick');
 for(const [id,value]of [['allowWalking',0],['blockWalking',1]]){const col=document.createElement('section');col.className='elevation-column'+(value?' blocked':'');col.dataset.passage=value;const label=document.createElement('h3');label.textContent='Elevation level';const list=document.createElement('div');list.className='elevation-list';list.id=value?'blockedElevations':'walkableElevations';quick.append(col);col.append($(id),label,list);}
 document.querySelector('.movement-levels').hidden=true;
 quick.nextElementSibling.textContent='Choose an elevation below either passage option, then Paint or Fill. Keep existing changes passage only. Tile artwork stays the same; water and special tile behaviors still apply.';

 const copy=document.createElement('button');copy.type='button';copy.id='copyMovement';copy.textContent='⌖ Copy from map';copy.onclick=()=>document.querySelector('.toolbar [data-tool=pick]').click();document.querySelector('.movement-quick').after(copy);
 for(const id of ['displayPanel','tilesetPanel','areaPanel']){const panel=$(id),b=document.createElement('button');b.type='button';b.dataset.openPanel=id;const strong=document.createElement('strong');strong.textContent=panel.querySelector('.panel-head h3').textContent;const small=document.createElement('small');small.textContent=id==='displayPanel'?'Grid, movement overlay and elevation numbers.':id==='tilesetPanel'?'Preview and apply a different artwork pair.':'Copy areas, save stamps, measure or export a map picture.';b.append(strong,small);b.onclick=()=>{$('taskDialog').close();panel.open=true;};$('extraTasks').append(b);}
 const legends=$('legendsBtn');document.querySelector('.workspace-menu-options').append(legends);legends.addEventListener('click',()=>$('workspaceMenu').close());
 $('displayPanel').querySelector('summary').textContent='View options';$('displayPanel').querySelector('.panel-head h3').textContent='View options';
 let eventOpened=false;
 function sync(){const map=S.view==='map',isEvents=map&&$('eventsPanel').open;document.body.dataset.mapMode=map?(isEvents?'events':S.movement?'collision':'tiles'):'other';
  for(const id of ['metatileMode','movementMode','eventsMode'])$(id).hidden=!map;tasks.hidden=!map;mapTab.hidden=map;
  if(map&&S.movement)$('tileTotal').textContent='Passage + elevation';events.classList.toggle('active',isEvents);events.setAttribute('aria-pressed',String(isEvents));$('metatileMode').classList.toggle('active',map&&!isEvents&&!S.movement);$('movementMode').classList.toggle('active',map&&!isEvents&&S.movement);
  if(isEvents){$('tilePalette').hidden=true;$('movementPanel').hidden=true;$('paletteFilters').hidden=true;$('brushQuickInfo').hidden=true;$('tileTagControls').hidden=true;}
  $('brushDetails').hidden=map&&(isEvents||S.movement);$('borderPanel').hidden=!map||isEvents||S.movement;
  if(isEvents&&!eventOpened)inspector.scrollTop=0;
  if(isEvents&&!eventOpened&&matchMedia('(max-width:1100px)').matches&&!$('paletteDialog').open)$('brushToggle').click();eventOpened=isEvents;
  const next=$('nextStepButton');if(next)next.hidden=false;
 }
 $('metatileMode').addEventListener('click',()=>{$('eventsPanel').open=false;sync();});$('movementMode').addEventListener('click',()=>{$('eventsPanel').open=false;sync();});
 events.onclick=()=>{movementMode(false);$('eventsPanel').classList.remove('controls-tucked');$('eventsPanel').open=true;eventOpened=false;sync();};$('eventsPanel').addEventListener('toggle',()=>{if(!$('eventsPanel').open)eventOpened=false;sync();});
 new MutationObserver(sync).observe($('nextStepButton'),{childList:true,characterData:true,subtree:true});
 return {sync};
}
