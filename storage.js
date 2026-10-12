import { EMPTY, validateState } from './core.js';
const KEY = 'kelvani-tab.v1';
export const extensionMode = Boolean(globalThis.chrome?.runtime?.id && globalThis.chrome?.storage?.local);
export async function load() {
  const data = extensionMode ? (await chrome.storage.local.get(KEY))[KEY] : JSON.parse(localStorage.getItem(KEY) || 'null');
  return validateState(data ?? structuredClone(EMPTY));
}
export async function update(change) {
  if (!navigator.locks) throw new Error('Dieser Browser unterstützt keine sichere Speicherung. Bitte Chrome oder Edge aktualisieren.');
  return navigator.locks.request(KEY, async () => {
    const next = validateState(await change(await load()));
    if (extensionMode) await chrome.storage.local.set({ [KEY]: next });
    else localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  });
}
