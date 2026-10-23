import test from 'node:test';import assert from 'node:assert/strict';
import {parsePattern,findBytes,readPointer,pointerPattern,normalizeBookmarks} from '../dist/rom-tools.mjs';
test('ROM search validates byte wildcards and explicit literal ASCII without game-text assumptions',()=>{
 assert.deepEqual(parsePattern('00 AB ?? 08'),[0,171,null,8]);assert.deepEqual(parsePattern('ABA','ascii'),[65,66,65]);for(const x of ['?0','0','?? ??','GG',''])assert.throws(()=>parsePattern(x));assert.throws(()=>parsePattern('é','ascii'));
});
test('ROM search finds overlapping patterns, wildcard bytes and the final byte without mutation',()=>{
 const b=new Uint8Array([65,65,65,0,171,2,8]),before=b.slice();assert.deepEqual(findBytes(b,[65,65]),{offsets:[0,1],truncated:false});assert.deepEqual(findBytes(b,parsePattern('00 AB ?? 08')).offsets,[3]);assert.deepEqual(findBytes(b,[8]).offsets,[6]);assert.deepEqual(findBytes(b,[65],{limit:2}),{offsets:[0,1],truncated:true});assert.deepEqual(b,before);
});
test('chunked searching covers a cross-boundary pattern once and can restrict raw references to four-byte alignment',()=>{
 const b=new Uint8Array(524300),pattern=[0x44,0x55,0x66,0x77];b.set(pattern,262142);b.set(pattern,262148);const a=findBytes(b,pattern,{start:0,end:262147}),c=findBytes(b,pattern,{start:262144});assert.deepEqual([...a.offsets,...c.offsets],[262142,262148]);assert.deepEqual(findBytes(b,pattern,{step:4}).offsets,[262148]);
});
test('ROM pointers decode little-endian 08/09 ranges with EOF and malformed boundaries guarded',()=>{
 const b=new Uint8Array(0x1000008);b.set(pointerPattern(0x1000000,b.length),0);assert.equal(readPointer(b,0),0x1000000);b.set([0x08,0,0,0x09],4);assert.equal(readPointer(b,4),null);assert.equal(readPointer(b,b.length-3),null);b.set([0,0,0,0x02],0);assert.equal(readPointer(b,0),null);assert.throws(()=>pointerPattern(b.length,b.length));
});
test('draft bookmarks retain only bounded in-range names and offsets',()=>{assert.deepEqual(normalizeBookmarks([{name:'Tiles',offset:32},{name:'Bad',offset:-1},{name:'EOF',offset:64},{name:'',offset:0},null],64),[{name:'Tiles',offset:32}]);});
