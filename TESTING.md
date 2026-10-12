# KelvaniTab 0.2.0 - Validation

## Verified automatically

Node.js unit tests: 20 tests. Domain validation, unsafe URLs, JSON backups, failed writes, concurrent transactions , v0.1 migration, groups, reorder, tasks and note conflicts.

## HTTP browser preview

Verified: startup without console errors, add links, add tasks, persist notes/links across reload, theme settings. Narrow layouts are visually checked. Preview data are fictional. No native extension result is inferred from this.

## Native Chrome / Edge release gate (still pending)

1. Load unpacked in each browser and check new-tab override and initial address-bar focus.
2. Check CSP/resource loading and no third-party startup requests.
3. Add/edit/reorder grouped links, tasks, widget visibility, notes, themes and search. Check persistence across new tabs.
4. Edit the same note concurrently in two extension tabs; preserve conflict drafts; export and restore a backup.
5. Import invalid, oversized and old-version backups. Cancel preview; ensure no changes. Test quota errors without false success.
6. Full keyboard navigation, dialog return focus, screenreader labels, 200% text and 320 CSS px.

Not yet validated: native Chrome/Edge installation, real tabs API behavior, a full screenreader audit, store review or WCAG conformance. No cloud sync or full Workona feature parity is claimed.
