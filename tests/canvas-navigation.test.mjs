import test from 'node:test';
import assert from 'node:assert/strict';
import {createTouchNavigation} from '../dist/canvas-navigation.mjs';
function fixture(){
 const handlers=new Map(),calls=[];let zoom=1;
 const wrap={scrollLeft:0,scrollTop:0,addEventListener(type,fn){handlers.set(type,fn);},setPointerCapture(id){calls.push(['capture',id]);}};
 const canvas={getBoundingClientRect:()=>({left:10-wrap.scrollLeft,top:20-wrap.scrollTop})};
 const old=globalThis.window;globalThis.window={addEventListener(type,fn){handlers.set(type,fn);}};
 createTouchNavigation({wrap,canvas,getZoom:()=>zoom,setZoom:z=>{calls.push(['zoom',z]);zoom=z;},cancelEdit:()=>calls.push(['cancel'])});globalThis.window=old;
 function send(type,id,x,y,pointerType='touch'){let stopped=false;handlers.get(type)({pointerId:id,clientX:x,clientY:y,pointerType,preventDefault(){},stopImmediatePropagation(){stopped=true;}});return stopped;}
 return {send,calls,wrap,get zoom(){return zoom;}};
}
test('a second finger cancels painting before zoom and suppresses the remaining finger until release',()=>{
 const f=fixture();assert(!f.send('pointerdown',1,50,50));assert(f.send('pointerdown',2,100,100));assert.equal(f.calls[0][0],'cancel');
 assert(f.send('pointermove',2,150,150));assert.equal(f.zoom,2);assert(f.send('pointerup',1,50,50));const n=f.calls.length;
 assert(f.send('pointermove',2,180,180));assert.equal(f.calls.length,n);assert(f.send('pointerup',2,180,180));assert(!f.send('pointerdown',3,60,60));
});
test('pinch anchor follows the midpoint and zoom stays bounded',()=>{
 const f=fixture();f.send('pointerdown',1,50,50);f.send('pointerdown',2,100,100);f.send('pointermove',2,150,150);
 assert.equal(f.wrap.scrollLeft,40);assert.equal(f.wrap.scrollTop,30);
 f.send('pointermove',2,10000,10000);assert.equal(f.zoom,32);
 f.send('pointermove',2,50,50);assert.equal(f.zoom,1/16);
});
test('pen and mouse retain their normal input; cancelled pinches and app switches do not resume painting',()=>{
 const f=fixture();assert(!f.send('pointerdown',1,50,50,'pen'));assert(!f.send('pointerdown',2,100,100,'mouse'));assert.deepEqual(f.calls,[]);
 f.send('pointerdown',3,50,50);f.send('pointerdown',4,100,100);assert(f.send('pointercancel',3,50,50));assert(f.send('pointerup',4,100,100));
 f.send('pointerdown',5,50,50);f.send('blur');assert.equal(f.calls.filter(c=>c[0]==='cancel').length,2);assert(!f.send('pointerdown',6,50,50));
});
