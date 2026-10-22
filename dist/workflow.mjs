export function createWorkflow({S,$,task,openLegends,demo,readDraft,saveDraft,fit}){
 let ready=false;
 const workspace=document.querySelector('.workspace'),tabs=document.querySelector('.tabs');
 function load(){
  $('loadScreen').hidden=false;workspace.hidden=true;tabs.hidden=true;
  document.body.dataset.stage='load';$('stageLabel').textContent='1 · Load';
  $('returnStudio').hidden=!ready;$('openBtn').classList.add('current-step');
  $('exportBtn').classList.remove('current-step');readDraft().catch(()=>{$('draftList').textContent='Draft storage is unavailable. You can still open and export files.';});
 }
 function enter(){
  ready=true;$('loadScreen').hidden=true;workspace.hidden=false;tabs.hidden=false;
  document.body.dataset.stage='studio';$('stageLabel').textContent='2 · Studio';
  document.querySelector('.project-pill').hidden=false;
  $('exportBtn').disabled=false;$('saveDraftBtn').disabled=false;$('saveDraftBtn').hidden=false;
  $('openBtn').classList.remove('current-step');$('exportBtn').classList.remove('current-step');
  requestAnimationFrame(fit);
 }
 async function run(action,message){
  $('loadStatus').textContent=message;document.querySelectorAll('[data-load-action]').forEach(b=>b.disabled=true);
  try{await task(action);}finally{document.querySelectorAll('[data-load-action]').forEach(b=>b.disabled=false);$('loadStatus').textContent='Choose a project or continue a saved draft.';}
 }
 $('startLegends').onclick=()=>run(openLegends,'Loading the Legends source and map assets…');
 $('startFile').onclick=()=>$('fileInput').click();
 $('startPractice').onclick=()=>run(demo,'Preparing the practice island…');
 $('returnStudio').onclick=enter;$('openBtn').onclick=load;
 $('resumeBtn').onclick=load;
 $('saveDraftBtn').onclick=()=>task(saveDraft);
 $('exportSaveDraft').onclick=()=>task(saveDraft);
 function drafts(rows){
  $('draftList').replaceChildren();$('resumeBtn').hidden=!rows.length;
  if(!rows.length){const p=document.createElement('p');p.className='draft-empty';p.textContent='Your drafts will appear here after you start editing.';$('draftList').append(p);return;}
  for(const row of rows){const button=document.createElement('button');button.className='draft-row';button.type='button';
   const title=document.createElement('strong');title.textContent=row.name;
   const detail=document.createElement('small');detail.textContent=(row.kind==='rom'?'GBA workspace':'Source project')+(row.savedAt?' · '+new Date(row.savedAt).toLocaleString():' · Previous draft')+(row.changes!=null?' · '+row.changes+' changed file'+(row.changes===1?'':'s'):'');
   button.append(title,detail);button.onclick=()=>run(()=>readDraft(true,row.key),'Restoring your project and undo history…');$('draftList').append(button);
  }
 }
 function exportStage(){document.body.dataset.stage='export';$('stageLabel').textContent='3 · Export';$('exportBtn').classList.add('current-step');}
 for(const id of ['exportDialog','downloadDialog'])$(id).addEventListener('close',()=>{
  if(!$('exportDialog').open&&!$('downloadDialog').open&&ready){document.body.dataset.stage='studio';$('stageLabel').textContent='2 · Studio';$('exportBtn').classList.remove('current-step');}
 });
 $('exportBack').onclick=()=>$('exportDialog').close();
 function saving(){ $('draftLabel').textContent='Saving…';$('saveDraftBtn').classList.remove('draft-saved'); }
 function saved(at){$('draftLabel').textContent='Draft saved';$('saveDraftBtn').classList.add('draft-saved');$('saveDraftBtn').title='Saved on this device at '+new Date(at).toLocaleString()+'. Tap to save again.';}
 function failed(){ $('draftLabel').textContent='Retry draft';$('saveDraftBtn').classList.remove('draft-saved'); }
 return {load,enter,drafts,exportStage,saving,saved,failed,get ready(){return ready;}};
}
