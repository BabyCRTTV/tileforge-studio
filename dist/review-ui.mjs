import {reviewInputs,dependencies,reviewEvents,applyReviewFix,aiPrompt} from './event-review.mjs?v=0.19.0';
import {equal} from './core.mjs?v=0.19.0';
export function createReview({S,$,task,getFile,recordBatch,refresh,studio,toast}){
 let report=null,snapshot=null,worker=null,aiReady=false,aiBusy=false,aiTarget=null;
 const dialog=$('reviewDialog'),list=$('reviewFindings');
 const button=(text,action)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=action;return b;};
 function stale(){if(!snapshot)return true;for(const[p,b]of snapshot)if(!S.files.has(p)||!equal(b,S.files.get(p)))return true;return false;}
 async function inspect(){
  if(S.rom||!S.layout){toast('Open a source project to review map events.');return;}
  $('reviewStatus').textContent='Reading the current map and changed maps…';list.replaceChildren();
  if(!dialog.open)dialog.showModal();
  const active=await studio.reviewMap();
  const input=reviewInputs(S.files,S.base,S.layouts,active);
  if(!input.paths.length){$('reviewStatus').textContent='No source map events are loaded. Choose an Event map in NPCs & events, then review again.';report=null;return;}
  // Only read missing dependency files. Failed reads are disclosed as coverage limits.
  if(S.source.type==='github')for(const p of dependencies(S.files,input.paths))try{await getFile(p);}catch{}
  snapshot=new Map([...S.files].map(([p,b])=>[p,b.slice()]));
  report=reviewEvents({files:snapshot,base:S.base,layouts:S.layouts,...input});
  for(const issue of report.issues)issue.expected=snapshot.get(issue.path);
  $('reviewStatus').textContent=report.mapCount+' map'+(report.mapCount===1?'':'s')+' · '+report.eventCount+' events · '+report.issues.length+' finding'+(report.issues.length===1?'':'s')+'. '+(report.issues.length?'Review the advice below.':'No issues found by these checks.');
  $('reviewCoverage').textContent='Checks cover event bounds, IDs, changed placements and movement, loaded script labels, owned dialogue blocks, and loaded warp destinations. Custom story scripts, dynamic warps and in-game reachability still need playtesting.';
  $('reviewLimits').replaceChildren();for(const line of report.coverage){const li=document.createElement('li');li.textContent=line;$('reviewLimits').append(li);}
  $('reviewLimitsDetails').hidden=!report.coverage.length;
  render();
 }
 function render(){
  list.replaceChildren();if(!report)return;
  for(const issue of report.issues){
   const card=document.createElement('article');card.className='review-finding '+issue.severity;
   const tag=document.createElement('small');tag.textContent=issue.map+' · '+(issue.kind?issue.kind+' '+(issue.index+1):'source')+' · '+issue.severity;
   const title=document.createElement('h3');title.textContent=issue.title;
   const detail=document.createElement('p');detail.textContent=issue.detail;
   const solution=document.createElement('p');solution.className='review-solution';solution.textContent='Suggested action: '+issue.solution;
   const actions=document.createElement('div');actions.className='review-actions';
   if(issue.kind)actions.append(button('Open event',()=>task(async()=>{dialog.close();$('exportDialog').close();await studio.reviewOpen(issue);})));
   if(issue.fix)actions.append(button('Preview correction',()=>{
    if(stale()){toast('Files changed since this review. Run it again first.');return;}
    const preview=document.createElement('div');preview.className='review-correction';
    const p=document.createElement('p'),event=JSON.parse(new TextDecoder().decode(issue.expected))[issue.fix.field][issue.fix.index];
    p.textContent=Object.entries(issue.fix.patch).map(([k,v])=>k+': '+event[k]+' → '+v).join(' · ')+'. Only this event field changes. Undo is available.';
    preview.append(p,button('Apply this correction',()=>task(async()=>{if(stale())throw Error('Files changed. Run Review events again.');const change=applyReviewFix(S.files,issue);S.files.set(change.path,change.after);recordBatch([change]);await refresh();toast('Correction applied. Use Undo to restore the previous value.');await inspect();})),button('Cancel',()=>preview.remove()));
    actions.after(preview);
   }));
   const ai=button('Ask local AI',()=>explain(issue,card));ai.disabled=!aiReady||aiBusy;ai.dataset.ai='';actions.append(ai);
   card.append(tag,title,detail,solution,actions);list.append(card);
  }
 }
 function syncAI(){document.querySelectorAll('[data-ai]').forEach(b=>b.disabled=!aiReady||aiBusy);$('loadLocalAI').disabled=aiBusy||aiReady;$('stopLocalAI').hidden=!worker;$('clearLocalAI').disabled=aiBusy;}
 function stop(){worker?.terminate();worker=null;aiReady=false;aiBusy=false;aiTarget=null;$('localAIStatus').textContent='Local AI stopped. Source checks remain available.';$('loadLocalAI').textContent='Load local AI';syncAI();}
 function start(){
  if(worker)return;
  aiBusy=true;$('localAIStatus').textContent='Preparing download…';syncAI();
  worker=new Worker(new URL('./local-ai-worker.mjs?v=0.19.0',import.meta.url),{type:'module'});
  worker.onerror=()=>{stop();$('localAIStatus').textContent='Local AI could not start on this device. Source checks still work. Try a current browser or free memory.';};
  worker.onmessage=({data})=>{
   if(data.type==='progress')$('localAIStatus').textContent=data.text;
   if(data.type==='ready'){aiReady=true;aiBusy=false;$('loadLocalAI').textContent='Local AI loaded';$('loadLocalAI').disabled=true;$('localAIStatus').textContent='SmolLM2 is running on this device. Tap Ask local AI on a finding.';}
   if(data.type==='result'){aiBusy=false;if(aiTarget?.isConnected){const p=document.createElement('p');p.className='review-ai-output';p.textContent='Experimental AI suggestion: '+data.text;aiTarget.append(p);}aiTarget=null;$('localAIStatus').textContent='Suggestion ready. Verify it against the source checks and playtest.';}
   if(data.type==='error'){stop();$('localAIStatus').textContent='Local AI unavailable: '+data.text+'. Source checks still work.';}
   syncAI();
  };
  worker.postMessage({type:'load'});syncAI();
 }
 function explain(issue,card){if(!aiReady||aiBusy)return;if(stale()){toast('Run the review again after changing files.');return;}aiBusy=true;aiTarget=card;card.querySelector('.review-ai-output')?.remove();syncAI();worker.postMessage({type:'explain',messages:aiPrompt(issue)});}
 $('loadLocalAI').onclick=start;$('stopLocalAI').onclick=stop;
 $('clearLocalAI').onclick=async()=>{stop();try{await caches.delete('tileforge-local-ai-v1');$('localAIStatus').textContent='Downloaded AI assets removed. Loading AI again will download them.';}catch{$('localAIStatus').textContent='Could not remove AI downloads. Clear site data in device settings if needed.';}};
 for(const id of ['reviewEventsBtn','exportReviewEvents','runEventReview'])$(id).onclick=()=>task(inspect);
 return {inspect};
}
