import { addLink, searchUrl, validateState } from './core.js';
import { load, update, extensionMode } from './storage.js';
const $ = s => document.querySelector(s);
let state, noteTimer;
const status = (message, error = false) => { $('#status').textContent = message; $('#status').className = error ? 'error' : ''; };
function tick() { const now = new Date(); $('#clock').textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }); $('#date').textContent = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }); }
function render(notes = false) {
  document.body.dataset.theme = state.theme; $('#theme').value = state.theme; $('#engine').value = state.engine; $('#link-count').textContent = `${state.links.length} / 100`;
  if (notes) $('#notes').value = state.notes;
  $('#links').replaceChildren();
  if (!state.links.length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'Deine häufig besuchten Seiten bekommen hier ihren Platz.'; $('#links').append(p); }
  for (const link of state.links) {
    const card = document.createElement('div'); card.className = 'link-card';
    const anchor = document.createElement('a'); anchor.href = link.url; anchor.rel = 'noopener noreferrer';
    const symbol = document.createElement('span'); symbol.className = 'symbol'; symbol.textContent = link.title[0].toUpperCase();
    const title = document.createElement('span'); title.textContent = link.title; anchor.append(symbol, title);
    const remove = document.createElement('button'); remove.className = 'remove'; remove.textContent = '×'; remove.setAttribute('aria-label', `${link.title} entfernen`);
    remove.addEventListener('click', () => save(current => ({ ...current, links: current.links.filter(item => item.id !== link.id) }), 'Link entfernt.'));
    card.append(anchor, remove); $('#links').append(card);
  }
}
async function save(change, message = '') { try { state = await update(change); render(); if (message) status(message); return true; } catch (error) { status(`Speichern fehlgeschlagen: ${error.message}`, true); return false; } }
async function flushNotes() { clearTimeout(noteTimer); const notes = $('#notes').value; $('#note-state').textContent = 'SPEICHERT …'; const ok = await save(current => ({ ...current, notes })); $('#note-state').textContent = ok ? 'GESPEICHERT' : 'NICHT GESPEICHERT'; return ok; }
$('#demo').hidden = extensionMode;
tick(); setInterval(tick, 1000);
$('#search').addEventListener('submit', event => { event.preventDefault(); try { location.assign(searchUrl($('#query').value, $('#engine').value)); } catch (error) { status(error.message, true); } });
$('#theme').addEventListener('change', async () => { const theme = $('#theme').value; await save(current => ({ ...current, theme })); });
$('#engine').addEventListener('change', async () => { const engine = $('#engine').value; await save(current => ({ ...current, engine })); });
$('#link-form').addEventListener('submit', async event => { event.preventDefault(); const input = Object.fromEntries(new FormData(event.target)); if (await save(current => addLink(current, input, crypto.randomUUID()), 'Lieblingslink gespeichert.')) event.target.reset(); });
$('#notes').addEventListener('input', () => { clearTimeout(noteTimer); $('#note-state').textContent = 'UNGESPEICHERT'; noteTimer = setTimeout(flushNotes, 350); });
$('#notes').addEventListener('blur', flushNotes);
$('#export').addEventListener('click', async () => { if (!await flushNotes()) return; try { const data = await load(); const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'kelvani-tab-backup.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); status('Backup exportiert.'); } catch (error) { status(error.message, true); } });
$('#import').addEventListener('change', async event => {
  try { const file = event.target.files[0]; if (!file) return; if (file.size > 2e6) throw new Error('Backup ist größer als 2 MB.'); const incoming = validateState(JSON.parse(await file.text())); if (!confirm('Dieses Backup ersetzt deine Links, Notizen und Einstellungen. Vorher ein Backup exportieren? Abbrechen lässt deine Daten unverändert.')) return; clearTimeout(noteTimer); if (await save(() => incoming, 'Backup wiederhergestellt.')) render(true); } catch (error) { status(error.message, true); } finally { event.target.value = ''; }
});
try { state = await load(); render(true); } catch (error) { status(`Vorhandene Daten konnten nicht geladen werden: ${error.message}. Sie werden nicht überschrieben.`, true); $('#notes').disabled = true; }
