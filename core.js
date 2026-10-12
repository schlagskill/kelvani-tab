export const EMPTY = { version: 1, theme: 'sand', engine: 'duckduckgo', links: [], notes: '' };
export function safeUrl(input) {
  const url = new URL(input);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Bitte einen Link mit http:// oder https:// ohne Zugangsdaten verwenden.');
  return url.href;
}
export function validateState(value) {
  if (!value || value.version !== 1 || !['sand', 'night'].includes(value.theme) || !['duckduckgo', 'google', 'bing'].includes(value.engine) || !Array.isArray(value.links) || value.links.length > 100 || typeof value.notes !== 'string' || value.notes.length > 20000) throw new Error('Ungültige Kelvani-Tab-Daten.');
  const ids = new Set();
  const links = value.links.map(link => {
    if (!link || typeof link.id !== 'string' || !link.id || link.id.length > 100 || ids.has(link.id) || typeof link.title !== 'string' || !link.title.trim() || link.title.length > 80 || typeof link.url !== 'string' || link.url.length > 4096) throw new Error('Ungültiger Lieblingslink.');
    ids.add(link.id);
    return { id: link.id, title: link.title.trim(), url: safeUrl(link.url) };
  });
  return { version: 1, theme: value.theme, engine: value.engine, links, notes: value.notes };
}
export function addLink(state, input, id) {
  return validateState({ ...state, links: [...state.links, { id, title: input.title, url: input.url }] });
}
export function searchUrl(query, engine) {
  if (typeof query !== 'string' || !query.trim()) throw new Error('Bitte einen Suchbegriff eingeben.');
  const endpoints = { duckduckgo: 'https://duckduckgo.com/?q=', google: 'https://www.google.com/search?q=', bing: 'https://www.bing.com/search?q=' };
  if (!endpoints[engine]) throw new Error('Unbekannte Suchmaschine.');
  return endpoints[engine] + encodeURIComponent(query.trim());
}
