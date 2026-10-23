// Runs entirely on the device. Downloads are model/runtime assets, never project data.
const RUNTIME='https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/';
const MODEL='onnx-community/SmolLM2-360M-Instruct-ONNX';
const REVISION='fe7c7db4c8921c9e3fa1c65cfd296fb3b1b1a8f9';
const CACHE='tileforge-local-ai-v1';
let generator;
async function cached(url){
 const cache=typeof caches==='undefined'?null:await caches.open(CACHE),existing=cache&&await cache.match(url);if(existing)return existing;
 const response=await fetch(url);if(!response.ok)throw Error('Local AI download failed ('+response.status+').');
 if(cache)await cache.put(url,response.clone());return response;
}
async function moduleAsset(url){const r=await cached(url);return URL.createObjectURL(new Blob([await r.text()],{type:'text/javascript'}));}
async function load(){
 if(generator)return generator;
 postMessage({type:'progress',text:'Preparing local AI runtime…'});
 const runtimeURL=await moduleAsset(RUNTIME+'transformers.min.js'),wasmURL=URL.createObjectURL(await(await cached(RUNTIME+'ort-wasm-simd-threaded.jsep.wasm')).blob()),moduleURL=await moduleAsset(RUNTIME+'ort-wasm-simd-threaded.jsep.mjs');
 const {pipeline,env}=await import(runtimeURL);
 env.allowLocalModels=false;env.useBrowserCache=false;
 env.useCustomCache=typeof caches!=='undefined';if(env.useCustomCache)env.customCache=await caches.open(CACHE);
 env.backends.onnx.wasm.numThreads=1;env.backends.onnx.wasm.proxy=false;
 env.backends.onnx.wasm.wasmPaths={wasm:wasmURL,mjs:moduleURL};
 env.cacheDir='tileforge-local-ai';
 generator=await pipeline('text-generation',MODEL,{revision:REVISION,device:'wasm',dtype:'q8',progress_callback:p=>{if(p.status==='progress')postMessage({type:'progress',text:'Downloading '+(p.file?.split('/').pop()||'model')+' · '+Math.round(p.progress||0)+'%'});}});
 postMessage({type:'ready'});return generator;
}
self.onmessage=async({data})=>{
 try{
  if(data.type==='load'){await load();return;}
  if(data.type!=='explain')return;
  const pipe=await load();postMessage({type:'progress',text:'Writing a local AI suggestion…'});
  const output=await pipe(data.messages,{max_new_tokens:140,do_sample:false,return_full_text:false,repetition_penalty:1.12});
  const generated=output[0].generated_text,text=typeof generated==='string'?generated:generated.at(-1).content;
  postMessage({type:'result',text});
 }catch(e){generator=null;postMessage({type:'error',text:e.message||String(e)});}
};
