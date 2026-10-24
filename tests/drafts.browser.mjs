// Real IndexedDB + UI regression checks in an isolated browser profile.
// TILEFORGE_PLAYWRIGHT=/path/to/playwright-core/index.mjs
// TILEFORGE_CHROMIUM=/path/to/chrome-headless-shell node tests/drafts.browser.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.TILEFORGE_PLAYWRIGHT||'playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const server=http.createServer((req,res)=>{try{const name=new URL(req.url,'http://test').pathname,file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep))throw Error('Invalid path');res.setHeader('Content-Type',file.endsWith('.mjs')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 browser=await chromium.launch({executablePath:process.env.TILEFORGE_CHROMIUM,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:980,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(10000);await page.goto('http://127.0.0.1:'+server.address().port+'/editor.html');
 const checks=await page.evaluate(async()=>{
  const D=await import('./drafts.mjs'),out=[];
  const active={name:'Keep source',base:[['a',new Uint8Array([1,2])]],history:[{before:new Uint8Array([3])}],savedAt:1};
  await D.putDraft('active',active);await D.putDraft('one',{name:'One',deletedAt:1});await D.putDraft('two',{name:'Two',deletedAt:2});
  out.push((await D.permanentlyDeleteDraft('one')).join()==='one'&&!await D.getDraft('one')&&!!await D.getDraft('two'));
  try{await D.permanentlyDeleteDraft('active');out.push(false);}catch(e){out.push(e.code==='DRAFT_NOT_DELETED');}
  out.push((await D.getDraft('active')).base[0][1][1]===2&&(await D.getDraft('active')).history[0].before[0]===3);
  out.push((await D.permanentlyDeleteDraft('missing')).length===0);
  await D.restoreDraft('two');out.push((await D.clearDeletedDrafts(['two'])).length===0&&!((await D.getDraft('two')).deletedAt));
  await D.putDraft('reviewed',{name:'Reviewed',deletedAt:1});await D.putDraft('later',{name:'Deleted later',deletedAt:1});
  out.push((await D.clearDeletedDrafts(['reviewed','reviewed','active','two'])).join()==='reviewed'&&!!await D.getDraft('later')&&!!await D.getDraft('active'));
  await D.putDraft('abort-a',{deletedAt:1});await D.putDraft('abort-b',{deletedAt:1});
  const remove=IDBObjectStore.prototype.delete;IDBObjectStore.prototype.delete=function(key){const r=remove.call(this,key);this.transaction.abort();return r;};
  try{await D.clearDeletedDrafts(['abort-a','abort-b']);out.push(false);}catch{out.push(true);}finally{IDBObjectStore.prototype.delete=remove;}
  out.push(!!await D.getDraft('abort-a')&&!!await D.getDraft('abort-b'));
  await D.clearDeletedDrafts((await D.listDrafts(true)).map(r=>r.key));out.push((await D.listDrafts()).length===2&&(await D.listDrafts(true)).length===0);
  for(let i=2;i<10;i++)await D.putDraft('slot-'+i,{name:'Active '+i});await D.putDraft('full-trash',{deletedAt:1});await D.permanentlyDeleteDraft('full-trash');
  try{await D.putDraft('eleventh',{});out.push(false);}catch(e){out.push(e.code==='DRAFT_LIMIT'&&(await D.listDrafts()).length===10);}
  await new Promise((resolve,reject)=>{const r=indexedDB.deleteDatabase('tileforge-studio');r.onsuccess=resolve;r.onerror=reject;});return out;
 });assert(checks.every(Boolean),JSON.stringify(checks));
 // Start a real workspace, then delete its saved copy before purging it.
 await page.click('#helpBtn');await page.click('#startPractice');await page.waitForFunction(()=>document.querySelector('#draftLabel').textContent==='Draft saved');await page.click('#openBtn');await page.locator('.draft-delete').first().click();await page.click('#confirmDeleteDraft');await page.waitForFunction(()=>document.querySelectorAll('.draft-purge').length===1);
 await page.locator('#deletedDraftPanel summary').click();await page.locator('.draft-purge').click();assert(await page.locator('#purgeDraftWarning').textContent().then(s=>s.includes('cannot be restored')));await page.locator('#purgeDraftDialog [data-close]').last().click();assert.equal(await page.locator('.draft-purge').count(),1);
 await page.locator('.draft-purge').click();await page.click('#confirmPurgeDrafts');await page.waitForFunction(()=>document.querySelector('#deletedDraftPanel').hidden);await page.click('#returnStudio');await page.click('#saveDraftBtn');await page.waitForFunction(()=>document.querySelector('#draftLabel').textContent==='Draft saved');
 assert.equal(await page.locator('#changeCount').textContent(),'0');await page.click('#openBtn');assert.equal(await page.locator('.draft-delete').count(),1);
 // Fill active slots; permanent-delete actions must remain available at capacity.
 await page.evaluate(async()=>{const D=await import('./drafts.mjs');for(let i=1;i<10;i++)await D.putDraft('active-ui-'+i,{name:'Active '+i});for(let i=0;i<3;i++)await D.putDraft('trash-ui-'+i,{name:i===0?'Deleted ROM':'Deleted source '+i,kind:i===0?'rom':'source',deletedAt:1,savedAt:1});});await page.click('#openBtn');await page.waitForFunction(()=>document.querySelectorAll('.draft-purge').length===3);await page.evaluate(()=>document.querySelector('#deletedDraftPanel').open=true);
 assert.equal(await page.locator('.draft-restore:disabled').count(),3);assert.equal(await page.locator('.draft-purge:enabled').count(),3);
 await page.click('#clearDeletedDrafts');assert.equal(await page.locator('#purgeDraftNames li').count(),3);await page.locator('#purgeDraftDialog [data-close]').last().click();assert.equal(await page.locator('.draft-purge').count(),3);
 // The clear confirmation covers its reviewed list, not later deletions.
 await page.click('#clearDeletedDrafts');await page.evaluate(async()=>{const D=await import('./drafts.mjs');await D.deleteDraft('active-ui-1');await D.restoreDraft('trash-ui-0');await D.putDraft('new-trash',{name:'Later deletion',deletedAt:1});});await page.click('#confirmPurgeDrafts');await page.waitForFunction(()=>document.querySelectorAll('.draft-purge').length===2);assert(await page.evaluate(async()=>!(await (await import('./drafts.mjs')).getDraft('trash-ui-0')).deletedAt));assert((await page.locator('#deletedDraftList').textContent()).includes('Later deletion'));assert.equal(await page.locator('.draft-delete').count(),10);
 for(const[width,height]of [[320,640],[768,840],[844,390],[1920,1080]]){await page.setViewportSize({width,height});await page.evaluate(()=>document.querySelector('#deletedDraftPanel').open=true);await page.click('#clearDeletedDrafts');const box=await page.locator('#purgeDraftDialog').boundingBox();assert(box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=height+1);await page.locator('#purgeDraftDialog [data-close]').last().click();assert.equal(await page.evaluate(()=>document.body.scrollWidth>innerWidth),false);}
 await page.click('#clearDeletedDrafts');await page.click('#confirmPurgeDrafts');await page.waitForFunction(()=>document.querySelector('#deletedDraftPanel').hidden);await page.reload();await page.waitForFunction(()=>document.querySelectorAll('.draft-delete').length===10);assert(await page.locator('#deletedDraftPanel').isHidden());assert.deepEqual(errors,[]);
 console.log(JSON.stringify({storageChecks:checks.length,individualDelete:true,cancel:true,clearReviewedOnly:true,staleRestoreProtected:true,activeDraftsPreserved:10,openWorkspacePreserved:true,reloadPersistence:true,viewports:4}));
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
