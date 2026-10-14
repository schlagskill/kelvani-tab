import { validateLayout } from './layout.js';

export const LAYOUT_PRESETS = {
  minimal: [{type:'clock',x:0,y:0,w:4,h:3},{type:'search',x:4,y:0,w:8,h:1},{type:'links',x:4,y:1,w:8,h:2}],
  study: [{type:'search',x:0,y:0,w:12,h:1},{type:'tasks',x:0,y:1,w:4,h:3},{type:'notes',x:4,y:1,w:4,h:3},{type:'calendar',x:8,y:1,w:4,h:3},{type:'focus',x:0,y:4,w:4,h:2},{type:'links',x:4,y:4,w:8,h:2}],
  work: [{type:'search',x:0,y:0,w:12,h:1},{type:'links',x:0,y:1,w:8,h:2},{type:'worldclock',x:8,y:1,w:4,h:2},{type:'tasks',x:0,y:3,w:4,h:3},{type:'notes',x:4,y:3,w:4,h:3},{type:'calendar',x:8,y:3,w:4,h:3}],
};
export function createLayoutHistory(limit = 20) {
  const entries = [];
  return {
    record(before, after) {
      if (JSON.stringify(before) === JSON.stringify(after)) return;
      entries.push({before:structuredClone(before), after:structuredClone(after)});
      if(entries.length > limit) entries.shift();
    },
    get available() {return entries.length > 0;},
    previous(current) {
      const entry = entries.at(-1);
      if(!entry) return null;
      if(JSON.stringify(current) !== JSON.stringify(entry.after)) throw Error('Das Layout wurde inzwischen geändert. Rückgängig ist dafür nicht verfügbar.');
      return validateLayout(structuredClone(entry.before));
    },
    consume() {entries.pop();},
  };
}
