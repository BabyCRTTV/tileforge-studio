// Drafts use structured storage so binary originals and undo entries stay intact.
const database=()=>new Promise((resolve,reject)=>{
 const request=indexedDB.open('tileforge-studio',1);
 request.onupgradeneeded=()=>request.result.createObjectStore('drafts');
 request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
});
export const DRAFT_LIMIT=10;
export const DRAFT_LIMIT_MESSAGE='All 10 draft slots are full. Delete a draft from Load → Saved drafts, then try again. Your open work is still available to export.';
// A single read/write transaction enforces capacity across concurrent tabs too.
async function mutateDraft(key,change){
 const db=await database();
 try{await new Promise((resolve,reject)=>{
  const tx=db.transaction('drafts','readwrite'),store=tx.objectStore('drafts');let failure=null;
  const fail=error=>{failure=error;tx.abort();};
  const read=store.get(key);read.onsuccess=()=>{
   const previous=read.result,wasActive=previous&&!previous.deletedAt,value=change(previous);if(!value)return;
   if(value.deletedAt||wasActive){store.put(value,key);return;}
   let active=0;const cursor=store.openCursor();cursor.onsuccess=()=>{const current=cursor.result;if(current){if(!current.value.deletedAt)active++;current.continue();return;}
    if(active>=DRAFT_LIMIT){const error=Error(DRAFT_LIMIT_MESSAGE);error.code='DRAFT_LIMIT';fail(error);}else store.put(value,key);
   };
  };
  tx.oncomplete=resolve;tx.onerror=()=>reject(failure||tx.error);tx.onabort=()=>reject(failure||tx.error||Error('Draft save interrupted'));
 });}finally{db.close();}
}
export const putDraft=(key,value)=>mutateDraft(key,()=>value);
export async function getDraft(key){
 const db=await database();
 try{return await new Promise((resolve,reject)=>{const r=db.transaction('drafts').objectStore('drafts').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
 finally{db.close();}
}
export async function listDrafts(deleted=false){
 const db=await database();
 try{return await new Promise((resolve,reject)=>{
  const rows=[],r=db.transaction('drafts').objectStore('drafts').openCursor();
  r.onsuccess=()=>{const cursor=r.result;if(!cursor){resolve(rows.sort((a,b)=>b.savedAt-a.savedAt));return;}
   const v=cursor.value;if(!!v.deletedAt!==deleted){cursor.continue();return;}rows.push({key:cursor.key,name:v.name||v.romName||v.source?.name||'Saved source project',kind:v.kind||'source',savedAt:v.savedAt||0,layout:v.layout,changes:v.changes});cursor.continue();};
  r.onerror=()=>reject(r.error);
 });}finally{db.close();}
}

// Soft deletion keeps a normal recovery path, including baseline and undo history.
async function trashState(key,deleted){return mutateDraft(key,value=>{if(!value)return null;if(deleted)value.deletedAt=Date.now();else delete value.deletedAt;return value;});}
export const deleteDraft=key=>trashState(key,true);
export const restoreDraft=key=>trashState(key,false);
