import test from 'node:test'; import assert from 'node:assert/strict';
let stored, failWrites = false, queue = Promise.resolve();
globalThis.chrome = { runtime: { id: 'test-extension' }, storage: { local: { get: async key => ({[key]:structuredClone(stored)}), set: async data => { if(failWrites) throw new Error('quota exceeded'); stored=structuredClone(Object.values(data)[0]); } } } };
Object.defineProperty(navigator,'locks',{value:{request:(_name,action)=>{const next=queue.then(action); queue=next.catch(()=>{});return next;}},configurable:true});
const { load, update } = await import('../storage.js');
test('concurrent settings updates do not overwrite each other', async()=>{ stored=undefined; await Promise.all([update(s=>({...s,notes:'Eine Idee'})),update(s=>({...s,theme:'night'}))]); const value=await load();assert.equal(value.notes,'Eine Idee');assert.equal(value.theme,'night'); });
test('storage failure preserves the previous state',async()=>{const before=structuredClone(stored);failWrites=true;await assert.rejects(update(s=>({...s,notes:'Andere Idee'})),/quota/);failWrites=false;assert.deepEqual(stored,before);});
test('corrupt extension data is not silently overwritten',async()=>{stored={version:99};await assert.rejects(update(s=>({...s,notes:'test'})));assert.deepEqual(stored,{version:99});});
