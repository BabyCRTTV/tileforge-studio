import {DRAFT_LIMIT} from './drafts.mjs?v=0.14.0';
export function createWorkflow({S,$,task,openLegends,demo,readDraft,saveDraft,deleteDraft,restoreDraft,fit}){
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
 $('startPractice').onclick=()=>{$('helpDialog').close();run(demo,'Preparing the optional offline practice map…');};
 $('returnStudio').onclick=enter;$('openBtn').onclick=load;
 $('resumeBtn').onclick=load;
 $('saveDraftBtn').onclick=()=>task(saveDraft);
 $('exportSaveDraft').onclick=()=>task(saveDraft);
 function drafts(rows,deleted=[]){$('draftCapacity').textContent=rows.length+' / '+DRAFT_LIMIT+' drafts';$('draftCapacity').classList.toggle('at-capacity',rows.length>=DRAFT_LIMIT);
  $('deletedDraftList').replaceChildren();$('deletedDraftPanel').hidden=!deleted.length;$('deletedDraftCount').textContent=deleted.length;for(const row of deleted){const b=document.createElement('button');b.className='draft-row draft-restore';b.type='button';b.textContent='Restore '+row.name+' · '+new Date(row.savedAt).toLocaleString();b.disabled=rows.length>=DRAFT_LIMIT;b.title=b.disabled?'Delete an active draft to free a slot before restoring.':'Restore this draft';b.onclick=()=>task(()=>restoreDraft(row.key));$('deletedDraftList').append(b);}
  $('draftList').replaceChildren();$('resumeBtn').hidden=!rows.length;
  if(!rows.length){const p=document.createElement('p');p.className='draft-empty';p.textContent='Your drafts will appear here after you start editing.';$('draftList').append(p);return;}
  for(const row of rows){const entry=document.createElement('div');entry.className='draft-row';const button=document.createElement('button');button.className='draft-resume';button.type='button';
   const title=document.createElement('strong');title.textContent=row.name;
   const detail=document.createElement('small');detail.textContent=(row.kind==='rom'?'GBA workspace':'Source project')+(row.savedAt?' · '+new Date(row.savedAt).toLocaleString():' · Previous draft')+(row.changes!=null?' · '+row.changes+' changed file'+(row.changes===1?'':'s'):'');
   button.append(title,detail);button.onclick=()=>run(()=>readDraft(true,row.key),'Restoring your project and undo history…');const remove=document.createElement('button');remove.className='draft-delete';remove.type='button';remove.textContent='Delete';remove.setAttribute('aria-label','Delete draft '+row.name);remove.onclick=()=>{const dialog=$('deleteDraftDialog');$('deleteDraftName').textContent=row.name+' · '+(row.savedAt?new Date(row.savedAt).toLocaleString():'Previous draft');$('confirmDeleteDraft').onclick=()=>task(async()=>{await deleteDraft(row.key);dialog.close();});dialog.showModal();};entry.append(button,remove);$('draftList').append(entry);
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
