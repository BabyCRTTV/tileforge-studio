import {sha256} from './core.mjs?v=0.4.3';
// Independently reviewed category annotations, not bundled game artwork.
// Apply only to the exact artwork/metatile pair inspected in the audit.
export const REVIEWS=[{"name":"Legends 0.0.70 - General + Petalburg","format":"emerald","files":{"data/tilesets/legends_lights/general_metatiles.bin":"6b887ab9a12edb14c06689b56a41d10e68b6e4e802ac2191ad051ff7f9d0da92","data/tilesets/legends_lights/general_tiles.png":"fa7296b0c7ce15577f6fe81819742ae0b04ba9f3bac24bddedfba127e1bd2a9d","data/tilesets/legends_lights/petalburg_metatiles.bin":"d58f7e9645387c94b0e077f2d3124cfbd12bb5c444f324a5fa1db8e69b97f39b","data/tilesets/legends_lights/petalburg_tiles.png":"ff73b48f1f76f14722d14b68604cae92990ae51f2375b9c6d72ee30970f27e12"},"groups":{"Trees & plants":[[1,2],[4,7],[13,15],[21,23],[28,31],[37,39],[45,47],[53,55],[64,64],[69,71],[198,199],[206,206],[454,455],[462,466],[468,474],[476,482],[484,493],[498,501],[508,509],[513,519],[572,574],[580,582],[588,591],[596,598],[612,614],[624,627],[632,633],[648,651]],"Buildings & doors":[[8,12],[16,20],[24,26],[32,34],[56,59],[72,75],[80,83],[88,91],[93,99],[448,453],[456,461],[467,467],[520,522],[524,530],[532,538],[540,566],[568,571],[576,577],[584,587],[608,611],[616,622],[628,630],[636,639],[642,647],[655,655]],"Fences & edges":[[61,63],[77,79],[85,87],[101,103],[306,308],[312,314],[320,322],[328,330]],"Signs":[[27,27]],"Cliffs":[[68,68],[100,100],[104,160],[162,174],[180,183],[190,191],[211,215],[219,223],[227,231],[238,239],[248,248],[253,255],[259,263],[267,271],[275,279],[286,287],[294,295],[310,311],[315,316],[331,332],[350,351],[358,359],[366,367],[382,383],[399,399],[401,401],[413,413],[494,497],[506,507],[634,635],[640,641],[652,654]],"Water":[[40,41],[43,44],[48,52],[76,76],[84,84],[176,179],[184,188],[192,196],[200,203],[208,210],[216,218],[241,242],[244,245],[249,251],[592,593],[600,601]],"Ground & paths":[[256,258],[264,266],[272,274],[280,282],[284,284],[288,290],[292,292],[296,301],[317,318],[594,595],[603,606]],"Rocks & caves":[[189,189],[197,197],[204,205],[224,226],[396,396],[404,404],[504,505],[578,579]],"Stairs & bridges":[[175,175],[207,207],[236,237],[240,240],[243,243]]}}];
const hashes=new WeakMap();
function hash(bytes){if(!hashes.has(bytes))hashes.set(bytes,sha256(bytes));return hashes.get(bytes);}
export async function reviewedCategories(info,files,sets,format,profiles=REVIEWS){
 const active=new Set(sets.flatMap(s=>[s.image,s.metatiles]));let result=info;
 for(const profile of profiles){
  if(profile.format!==format||Object.keys(profile.files).some(p=>!active.has(p)||!files.has(p)))continue;
  const matches=await Promise.all(Object.entries(profile.files).map(async([p,expected])=>await hash(files.get(p))===expected));if(matches.some(v=>!v))continue;
  if(result===info)result=new Map(info);
  for(const [category,ranges]of Object.entries(profile.groups))for(const [start,end]of ranges)for(let id=start;id<=end;id++){
   const tile=result.get(id);if(tile?.category==='Other')result.set(id,{...tile,category,reason:'Reviewed artwork - '+profile.name});
  }
 }
 return result;
}
