# KelvaniTab 0.3.0 — Validation

## Automated checks

42 Node.js tests cover URL validation/normalized-length limits, backups, failed writes, concurrent transactions, old-data migration, groups, tasks, note conflicts, grid bounds/collisions, all twelve catalogue widgets, hiding without data loss, arithmetic without eval, leap-year calendars, timer deadlines and weather response validation.

## HTTP browser preview

Each widget was visually inspected and its relevant controls exercised: calendar navigation, calculator results/errors, focus pause/resume and reload, time zone persistence, countdown editing, catalogue toggles, background presets and local image upload/reload. Existing link/task/note flows also have previous preview checks and storage tests.

Actual mouse dragging to a free cell, occupied-cell rejection, keyboard movement, rejected colliding resize and persistence after reload were checked. Grips ignore clicks without movement. Drag positioning follows scrolling; automatic edge scrolling is implemented but sustained edge dragging still needs native testing. No console errors in the final preview.

Compact preview was inspected at an observed 433 CSS px window: single-column cards, no horizontal document overflow. Desktop card overflow was checked and refined. Preview content is fictional. Berlin was a test city, not an inferred user location. Actual Open-Meteo search/forecast and timestamped cache persistence were exercised.

## Native Chrome / Edge release gate — pending

1. Load unpacked in each browser; verify new-tab override, address-bar focus and CSP/resource loading.
2. Inspect network: no third-party startup requests. Test optional weather permission grant/denial, offline errors and refresh.
3. Exercise all widgets, pointer dragging/edge scrolling, keyboard movement, sizes and persistence across extension tabs.
4. Edit notes concurrently; preserve conflict drafts. Restore layout/photo backups and test quota failures without false success.
5. Import invalid, oversized and old backups; cancel preview and confirm no changes.
6. Complete screenreader, 200% text and 320 CSS px checks, including dialog focus return.

Native installation, Chrome/Edge permission prompts, full screenreader audit, store review and WCAG conformance have not yet been validated. Preview checks do not imply those checks passed.
