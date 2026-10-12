export const $ = selector => document.querySelector(selector);
export function el(tag, text = '', className = '') { const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; return node; }
export function button(text, action, className = 'secondary') { const node = el('button', text, className); node.type = 'button'; if (action) node.addEventListener('click', action); return node; }
export function notify(message, error = false, undo = null) { const box = $('#status'); box.replaceChildren(el('span', message)); box.classList.toggle('error', error); box.setAttribute('role', error ? 'alert' : 'status'); if (undo) box.append(button('Rückgängig', undo, 'text-button')); }
export function showDialog(selector) { const dialog = $(selector), trigger = document.activeElement; dialog.addEventListener('close', () => trigger?.isConnected && trigger.focus(), { once: true }); dialog.showModal(); }
export function download(data, filename) { const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); const anchor = el('a'); anchor.href = url; anchor.download = filename; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
export async function readBackup(file, validate) { if (!file || file.size > 2e6) throw new Error('Bitte ein JSON-Backup unter 2 MB auswählen.'); return validate(JSON.parse(await file.text())); }
export function wireDialogs() { document.querySelectorAll('[data-close]').forEach(node => node.addEventListener('click', () => node.closest('dialog').close())); }
