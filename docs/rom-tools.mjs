// Raw binary navigation only: no game profile, automatic repointing or source writes.
export function parsePattern(text,mode='hex'){
 if(mode==='ascii'){if(!text.length||text.length>256||/[^\x20-\x7e]/.test(text))throw Error('Use 1–256 printable ASCII characters. Pokémon dialogue uses a different encoding.');return [...text].map(c=>c.charCodeAt(0));}
 const compact=text.replace(/\s+/g,'');if(!compact.length||compact.length%2||compact.length>512||!/^(?:[\da-f]{2}|\?\?)+$/i.test(compact))throw Error('Use hex byte pairs such as 00 AB ?? 08 (up to 256 bytes).');
 const result=compact.match(/../g).map(s=>s==='??'?null:parseInt(s,16));if(result.every(b=>b===null))throw Error('Include at least one fixed byte.');return result;
}
export function findBytes(bytes,pattern,{start=0,end=bytes.length,step=1,limit=200}={}){
 if(!Array.isArray(pattern)||!pattern.length||pattern.length>256||pattern.some(b=>b!==null&&(!Number.isInteger(b)||b<0||b>255))||!Number.isInteger(start)||start<0||!Number.isInteger(end)||end>bytes.length||end<start||![1,4].includes(step)||!Number.isInteger(limit)||limit<1)throw Error('Invalid search range or pattern.');
 const offsets=[];for(let i=start;i<=end-pattern.length;i+=step){let match=true;for(let j=0;j<pattern.length;j++)if(pattern[j]!==null&&bytes[i+j]!==pattern[j]){match=false;break;}if(match){if(offsets.length===limit)return {offsets,truncated:true};offsets.push(i);}}
 return {offsets,truncated:false};
}
export function readPointer(bytes,offset){
 if(!Number.isInteger(offset)||offset<0||offset+4>bytes.length)return null;const address=(bytes[offset]|bytes[offset+1]<<8|bytes[offset+2]<<16|bytes[offset+3]<<24)>>>0;
 return address>=0x08000000&&address<0x0a000000&&address-0x08000000<bytes.length?address-0x08000000:null;
}
export function pointerPattern(offset,length){if(!Number.isInteger(offset)||offset<0||offset>=length||offset>=0x2000000)throw Error('Choose an in-range GBA ROM offset.');const a=offset+0x08000000;return [a&255,a>>>8&255,a>>>16&255,a>>>24&255];}
export function normalizeBookmarks(values,length){return Array.isArray(values)?values.filter(v=>v&&typeof v.name==='string'&&v.name.trim().length&&v.name.length<=60&&Number.isInteger(v.offset)&&v.offset>=0&&v.offset<length).slice(0,100).map(v=>({name:v.name,offset:v.offset})):[];}

export function createRomTools({S,$,task,toast,queueDraft,readHex,parseOffset,loadRomGraphics}){
 let bookmarks=[],back=[],forward=[],results=[],index=-1,searchToken=0;
 const hex=n=>n.toString(16).padStart(6,'0').toUpperCase(),offset=()=>parseOffset('hexOffset');
 function go(n,history=true){if(!S.rom||!Number.isInteger(n)||n<0||n>=S.rom.length)throw Error('Offset exceeds this ROM.');const old=offset();if(history&&old!==n){back.push(old);if(back.length>100)back.shift();forward=[];}$('hexOffset').value=hex(n);readHex();sync();queueDraft();}
 function sync(){if(!S.rom)return;const n=offset(),pointer=readPointer(S.rom,n);$('pointerInfo').textContent=pointer===null?'No in-range 08/09 ROM pointer in these four bytes.':'Candidate ROM pointer → 0x'+hex(pointer);$('followPointer').disabled=pointer===null;$('hexBack').disabled=!back.length;$('hexForward').disabled=!forward.length;
  const q=$('bookmarkSearch').value.toLowerCase(),list=$('bookmarkList');list.replaceChildren();for(const [i,b]of bookmarks.entries())if((b.name+' '+hex(b.offset)).toLowerCase().includes(q)){const row=document.createElement('div');row.className='bookmark-row';const jump=document.createElement('button');jump.textContent=b.name+' · 0x'+hex(b.offset);jump.onclick=()=>task(()=>go(b.offset));const del=document.createElement('button');del.textContent='Delete';del.setAttribute('aria-label','Delete bookmark '+b.name);del.onclick=()=>{bookmarks.splice(i,1);queueDraft();sync();};row.append(jump,del);list.append(row);}
 }
 function showResults(offsets,truncated,label){results=offsets;index=-1;$('romSearchStatus').textContent=offsets.length?`${label}: ${truncated?'first ':''}${offsets.length} matches${truncated?' (result limit)':''}. Tap an offset to inspect.`:label+': no matches.';const list=$('romSearchResults');list.replaceChildren();for(const [i,n]of offsets.entries()){const b=document.createElement('button');b.textContent='0x'+hex(n);b.onclick=()=>task(()=>{index=i;go(n);});list.append(b);}$('romFindNext').disabled=$('romFindPrevious').disabled=!offsets.length;}
 async function search(references=false){if(!S.rom)throw Error('Open a ROM first.');const token=++searchToken,rom=S.rom,pattern=references?pointerPattern(offset(),rom.length):parsePattern($('romSearchText').value,$('romSearchMode').value),step=references&&!$('unalignedPointers').checked?4:1,all=[];let truncated=false;
  $('romSearchStatus').textContent='Searching…';$('romSearchResults').replaceChildren();$('romFindNext').disabled=$('romFindPrevious').disabled=true;
  // Overlap chunks by pattern length without repeating start positions; yield for UI responsiveness.
  for(let start=0;start<rom.length;start+=262144){if(token!==searchToken||S.rom!==rom)return;const stop=Math.min(rom.length,start+262144),r=findBytes(rom,pattern,{start,end:Math.min(rom.length,stop+pattern.length-1),step,limit:201-all.length});all.push(...r.offsets);if(all.length>200||r.truncated){truncated=true;break;}await new Promise(resolve=>setTimeout(resolve,0));}
  if(token===searchToken&&S.rom===rom)showResults(all.slice(0,200),truncated,references?'Raw pointer candidates':'Search');
 }
 $('romFind').onclick=()=>task(()=>search());$('findReferences').onclick=()=>task(()=>search(true));
 for(const [id,d]of [['romFindNext',1],['romFindPrevious',-1]])$(id).onclick=()=>task(()=>{if(!results.length)return;index=index<0?(d>0?0:results.length-1):(index+d+results.length)%results.length;go(results[index]);$('romSearchStatus').textContent=`Match ${index+1} / ${results.length} · 0x${hex(results[index])}`;});
 $('followPointer').onclick=()=>task(()=>{const p=readPointer(S.rom,offset());if(p===null)throw Error('These bytes are not an in-range ROM pointer.');go(p);});
 $('hexBack').onclick=()=>task(()=>{const n=back.pop();if(n===undefined)return;forward.push(offset());go(n,false);});$('hexForward').onclick=()=>task(()=>{const n=forward.pop();if(n===undefined)return;back.push(offset());go(n,false);});
 $('hexPagePrevious').onclick=()=>task(()=>go(Math.max(0,offset()-256)));$('hexPageNext').onclick=()=>task(()=>go(Math.min(S.rom.length-1,offset()+256)));
 $('hexAsGraphics').onclick=()=>task(()=>{$('romOffset').value=hex(offset());loadRomGraphics();});
 $('bookmarkAdd').onclick=()=>task(()=>{if(bookmarks.length>=100)throw Error('Delete an unused bookmark before adding more (100 maximum).');const name=$('bookmarkName').value.trim();if(!name)throw Error('Name the bookmark first.');bookmarks.push({name:name.slice(0,60),offset:offset()});$('bookmarkName').value='';queueDraft();sync();toast('Bookmark saved with this ROM draft.');});$('bookmarkSearch').oninput=sync;
 return {sync,invalidate(){searchToken++;showResults([],false,'Search changed; run again');},serialize:()=>({bookmarks,offset:(()=>{try{const n=offset();return n<S.rom.length?n:0;}catch{return 0;}})()}),reset(meta={}){searchToken++;bookmarks=normalizeBookmarks(meta.bookmarks,S.rom?.length||0);back=[];forward=[];results=[];index=-1;$('hexOffset').value=hex(Number.isInteger(meta.offset)&&meta.offset>=0&&meta.offset<S.rom?.length?meta.offset:0);$('romSearchText').value='';$('bookmarkSearch').value='';showResults([],false,'Search');sync();}};
}
