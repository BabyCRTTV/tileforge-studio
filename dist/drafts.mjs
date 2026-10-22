// Drafts use structured storage so binary originals and undo entries stay intact.
const database=()=>new Promise((resolve,reject)=>{
 const request=indexedDB.open('tileforge-studio',1);
 request.onupgradeneeded=()=>request.result.createObjectStore('drafts');
 request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
});
export async function putDraft(key,value){
 const db=await database();
 try{await new Promise((resolve,reject)=>{
  const tx=db.transaction('drafts','readwrite');tx.objectStore('drafts').put(value,key);
  tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Draft save interrupted'));
 });}finally{db.close();}
}
export async function getDraft(key){
 const db=await database();
 try{return await new Promise((resolve,reject)=>{const r=db.transaction('drafts').objectStore('drafts').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
 finally{db.close();}
}
export async function listDrafts(){
 const db=await database();
 try{return await new Promise((resolve,reject)=>{
  const rows=[],r=db.transaction('drafts').objectStore('drafts').openCursor();
  r.onsuccess=()=>{const cursor=r.result;if(!cursor){resolve(rows.sort((a,b)=>b.savedAt-a.savedAt));return;}
   const v=cursor.value;rows.push({key:cursor.key,name:v.name||v.romName||v.source?.name||'Saved source project',kind:v.kind||'source',savedAt:v.savedAt||0,layout:v.layout,changes:v.changes});cursor.continue();};
  r.onerror=()=>reject(r.error);
 });}finally{db.close();}
}
