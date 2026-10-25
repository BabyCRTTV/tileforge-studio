import {test} from 'node:test';import assert from 'node:assert/strict';import {usableViewport} from '../dist/viewport.mjs';
const viewport=(w,h,pad,v)=>usableViewport({innerWidth:w,innerHeight:h,visualViewport:v,getComputedStyle:()=>({paddingLeft:'0px',paddingTop:'0px',paddingRight:'0px',paddingBottom:'0px',...pad})},{body:{}});
test('safe viewport excludes portrait status/navigation bars and landscape side cutouts',()=>{
 assert.deepEqual(viewport(370,585,{paddingTop:'28px',paddingBottom:'48px'}),{left:0,top:28,right:370,bottom:537,width:370,height:509});
 assert.deepEqual(viewport(844,390,{paddingLeft:'48px',paddingTop:'24px',paddingRight:'24px',paddingBottom:'32px'}),{left:48,top:24,right:820,bottom:358,width:772,height:334});
});
test('keyboard and visual viewport intersect safe areas without adding the same bottom inset twice',()=>{
 assert.deepEqual(viewport(412,840,{paddingTop:'30px',paddingBottom:'34px'},{offsetLeft:0,offsetTop:0,width:412,height:500}),{left:0,top:30,right:412,bottom:500,width:412,height:470});
 assert.deepEqual(viewport(412,840,{paddingTop:'30px'},{offsetLeft:8,offsetTop:70,width:380,height:420}),{left:8,top:70,right:388,bottom:490,width:380,height:420});
});
test('already inset native/desktop viewports retain their full available rectangle',()=>{
 assert.deepEqual(viewport(980,700,{}),{left:0,top:0,right:980,bottom:700,width:980,height:700});
});
