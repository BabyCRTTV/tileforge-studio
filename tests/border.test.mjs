import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeBorder,repeatIndex,paintBorderCell} from '../dist/border.mjs';
import {encodeBlocks,decodeBlocks} from '../dist/core.mjs';
test('border paint preserves movement bits, other border cells and source dimensions',()=>{
 const values=new Uint16Array([0xfc02,0x7403,0x1804,0xa805,0x3006,0x4007]);
 const layout={border_width:3,border_height:2,border_filepath:'data/layouts/Test/border.bin'};
 const b=decodeBorder(encodeBlocks(values),layout),bytes=paintBorderCell(b,1,799),after=decodeBlocks(bytes,3,2);
 assert.equal(after[1],(values[1]&0xfc00)|799);assert.deepEqual([...after].filter((_,i)=>i!==1),[...values].filter((_,i)=>i!==1));
 assert.deepEqual(b.cells,values);assert.equal(b.width,3);assert.equal(b.height,2);
 assert.throws(()=>decodeBorder(new Uint8Array(8),layout),/size|length|match/i);
});
test('default Emerald borders are 2 by 2, and repeat correctly at negative map coordinates',()=>{
 const b=decodeBorder(new Uint8Array(8),{});assert.equal(b.width,2);assert.equal(b.height,2);
 assert.equal(repeatIndex(-1,-1,2,2),3);assert.equal(repeatIndex(-4,-4,2,2),0);
 assert.equal(repeatIndex(21,20,2,2),1);assert.equal(repeatIndex(-1,-3,3,2),5);
 assert.throws(()=>decodeBorder(new Uint8Array(),{border_width:0}),/dimensions/);
});
