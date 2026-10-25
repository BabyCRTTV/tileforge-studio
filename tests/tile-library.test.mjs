import test from 'node:test';import assert from 'node:assert/strict';
import {libraryGroups,tileMatches} from '../dist/tile-library.mjs';
const bytes=x=>new TextEncoder().encode(JSON.stringify(x));
test('Project library retains compatible pairs, deduplicates locations and uses map type before name hints',()=>{
 const active={id:'A',name:'Town',primary_tileset:'gTileset_General',secondary_tileset:'gTileset_Town'};
 const layouts=[active,{...active,id:'B',name:'House',secondary_tileset:'gTileset_House'},{...active,id:'C',name:'AnotherHouse',secondary_tileset:'gTileset_House'},{...active,id:'D',name:'Odd',secondary_tileset:'gTileset_Unknown'},{...active,id:'F',layout_version:'frlg'}];
 const files=new Map([['data/maps/Town/map.json',bytes({layout:'A',map_type:'MAP_TYPE_INDOOR'})]]);
 const groups=libraryGroups(layouts,active,files);assert.equal(groups.length,3);assert.equal(groups[0].layout.id,'A');assert.equal(groups[0].interior,true);assert.equal(groups[0].exterior,false);const house=groups.find(g=>g.layout.id==='B');assert.equal(house.locations.length,2);assert.equal(house.interior,true);assert.equal(groups.find(g=>g.layout.id==='D').shared,true);
});
test('Library search includes actual source identity, names, locations, category and IDs',()=>{
 const group={locations:['Pale House'],layout:{primary_tileset:'gTileset_General',secondary_tileset:'gTileset_House'}};
 const info={name:'House_Table',category:'Furniture & interiors',sourceName:'House',behavior:'MB_NORMAL'};
 assert(tileMatches(512,info,'house table',group));assert(tileMatches(512,info,'#200',group));assert(tileMatches(512,info,'pale furniture',group));assert(!tileMatches(512,info,'water',group));
});
