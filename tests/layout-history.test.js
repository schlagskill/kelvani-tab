import test from 'node:test';
import assert from 'node:assert/strict';
import {createLayoutHistory,LAYOUT_PRESETS} from '../layout-history.js';
import {validateLayout} from '../layout.js';
test('presets fit the grid without collisions',()=>{for(const layout of Object.values(LAYOUT_PRESETS))assert.doesNotThrow(()=>validateLayout(layout));});
test('undo retains independent snapshots and rejects external layout changes',()=>{const h=createLayoutHistory();const before=structuredClone(LAYOUT_PRESETS.minimal),after=structuredClone(LAYOUT_PRESETS.study);h.record(before,after);before[0].x=8;assert.deepEqual(h.previous(after),LAYOUT_PRESETS.minimal);assert.throws(()=>h.previous(LAYOUT_PRESETS.work),/inzwischen/);h.consume();assert.equal(h.available,false);});
