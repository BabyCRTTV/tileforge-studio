import {test} from 'node:test';
import assert from 'node:assert/strict';
import {npcGraphicsCatalog} from '../dist/project.mjs';

test('NPC catalog includes unplaced source sprites, aliases and custom pointer mappings',()=>{
 const header=`enum { OBJ_EVENT_GFX_TWIN, OBJ_EVENT_GFX_BOY_2 = 7, OBJ_EVENT_GFX_BOY_10, NUM_OBJ_EVENT_GFX };
#define OBJ_EVENT_GFX_CUSTOM OBJ_EVENT_GFX_TWIN
#define OBJ_EVENT_GFX_VAR_0 500
#define OBJ_EVENT_GFX_VARS 499
#define OBJ_EVENT_GFX_PLAYER_START 1000
#define OBJ_EVENT_GFX_SPECIES(name) (name + 100)
// #define OBJ_EVENT_GFX_REMOVED 1
/* enum { OBJ_EVENT_GFX_OBSOLETE }; */
#define OTHER OBJ_EVENT_GFX_REFERENCE_ONLY`;
 const result=npcGraphicsCatalog(header,'[OBJ_EVENT_GFX_SPECIAL] = &gInfo,',['OBJ_EVENT_GFX_TWIN','OBJ_EVENT_GFX_MOM','OBJ_EVENT_GFX_SPECIES(MEW)','OBJ_EVENT_GFX_VAR_1']);
 assert.deepEqual(result,['OBJ_EVENT_GFX_BOY_2','OBJ_EVENT_GFX_BOY_10','OBJ_EVENT_GFX_CUSTOM','OBJ_EVENT_GFX_MOM','OBJ_EVENT_GFX_SPECIAL','OBJ_EVENT_GFX_TWIN']);
 assert.deepEqual(npcGraphicsCatalog('','',[]),[]);
});
