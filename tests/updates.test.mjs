import test from 'node:test';
import assert from 'node:assert/strict';
import {newerVersion,releaseVersion,validateRelease,updateState,UPDATE_ROOT} from '../dist/updates.mjs';
const manifest=()=>({format:'tileforge-update',version:'0.8.0',versionCode:13,notes:['App updates'],android:{packageId:'com.eightbittrade.tileforge',url:UPDATE_ROOT+'downloads/TileForge-Studio-0.8.0.apk',size:174000,sha256:'a'.repeat(64)}});
test('update versions compare numeric components and never offer equal or older versions',()=>{
 assert(newerVersion('0.10.0','0.9.99'));assert(newerVersion('1.0.0','0.99.99'));assert(!newerVersion('0.8.0','0.8.0'));assert(!newerVersion('0.7.99','0.8.0'));
 for(const v of ['v0.8.0','0.8','0.8.0-beta','0.8.0/../','999999.0.0',null,{}])assert.throws(()=>releaseVersion(v));
});
test('release manifest binds the exact app, release filename, size and digest',()=>{
 assert.deepEqual(validateRelease(manifest()).android,manifest().android);
 const mutations=[m=>m.format='other',m=>m.versionCode=13.5,m=>m.android.packageId='other.app',m=>m.android.size=0,m=>m.android.size=101*1024*1024,m=>m.android.sha256='abc',m=>m.android.url+='?token=x',m=>m.android.url+='\n',m=>m.android.url=m.android.url.replace('https:','http:'),m=>m.android.url=m.android.url.replace('babycrttv.github.io','evil.invalid'),m=>m.android.url=m.android.url.replace('0.8.0.apk','0.9.0.apk')];
 for(const mutate of mutations){const m=manifest();mutate(m);assert.throws(()=>validateRelease(m));}
 const m=manifest();m.notes=[null,{} ,...Array(10).fill('x'.repeat(500))];const out=validateRelease(m);assert.equal(out.notes.length,8);assert.equal(out.notes[0].length,300);
});
test('native update snapshots keep bounded plain text and require explicit available/downloaded booleans',()=>{
 const s=updateState({status:'execute',installedVersion:'0.8.0',latestVersion:'<script>',progress:999,available:'true',downloaded:1,message:'x'.repeat(9999),notes:'y'.repeat(9999)});
 assert.equal(s.status,'idle');assert.equal(s.latestVersion,'');assert.equal(s.available,false);assert.equal(s.downloaded,false);assert.equal(s.progress,100);assert.equal(s.message.length,800);assert.equal(s.notes.length,2500);
 assert.equal(updateState({status:'downloading',progress:-3,available:true}).progress,0);
});
