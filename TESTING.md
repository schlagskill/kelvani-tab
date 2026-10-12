# KelvaniTab 0.3.2 — Validation

## Automated checks

55 Node.js tests cover URL validation/normalized-length limits, backups, failed writes, concurrent transactions, old-data migration, groups, tasks, note conflicts, grid bounds/collisions, all twelve catalogue widgets, hiding without data loss, arithmetic without eval, leap-year calendars, timer deadlines and weather response validation.

## HTTP browser preview

Each widget was visually inspected and its relevant controls exercised: calendar navigation, calculator results/errors, focus pause/resume and reload, time zone persistence, countdown editing, catalogue toggles, background presets and local image upload/reload. Existing link/task/note flows also have previous preview checks and storage tests.

Actual mouse dragging onto an occupied, equally sized card swaps both positions. Dragging the lower-right clock resize grip enlarged it to eight columns/four rows; affected cards moved down without overlap and the new size survived reload. Compact pointer dragging reordered cards and survived reload. Document-level pointer listeners replace listeners attached only to the moving handle. Pointer capture remains supported; native Edge still needs retesting after update. Keyboard move/resize is supported. Automatic edge scrolling is implemented; sustained edge dragging needs native testing. No console errors in the final preview.

Compact preview was inspected in the previous 433 CSS px check and in the current two-column compact window: single-column cards, no horizontal document overflow. Desktop card overflow was checked and refined. Preview content is fictional. Berlin was a test city, not an inferred user location. Actual Open-Meteo search/forecast and timestamped cache persistence were exercised.

## Native Chrome / Edge release gate — pending

1. Load unpacked in each browser; verify new-tab override, address-bar focus and CSP/resource loading.
2. Inspect network: no third-party startup requests. Test optional weather permission grant/denial, offline errors and refresh.
3. Exercise all widgets, pointer dragging/edge scrolling, keyboard movement, sizes and persistence across extension tabs.
4. Edit notes concurrently; preserve conflict drafts. Restore layout/photo backups and test quota failures without false success.
5. Import invalid, oversized and old backups; cancel preview and confirm no changes.
6. Complete screenreader, 200% text and 320 CSS px checks, including dialog focus return.

Native installation, Chrome/Edge permission prompts, full screenreader audit, store review and WCAG conformance have not yet been validated. Preview checks do not imply those checks passed.

All five bundled Pixabay photos were inspected visually, selected in the browser and checked for the matching visible photographer/source. The Nebelwald selection survived reload. Grid regression tests cover swaps, resize cascades, atomic failures and compact repacking.

## 0.3.2 settings and language preview

Verified the compact Settings menu, all four entries, keyboard navigation/Escape, German-to-English and back, localized clock/calendar/countdown, translated widget controls and original user link/task/note content. Language survives reload.

All six color schemes were selected and their distinct rendered card colors checked. Transparency was changed to 40% and the rendered alpha was 0.6; settings persisted across reload. Saving toast disappeared with a 2000 ms timer (observed UI roundtrip including the click: approximately 2.2 s). It uses fixed positioning and creates no dashboard row. Errors and undo notices retain different handling.

Seven preference regressions cover 50 unique bilingual thoughts, random selection bounds, same thought across languages, migration, six palettes and full transparency backup roundtrips, invalid preferences, notice durations and UI string translations. Native Edge update still needs verification; no new permissions are required.
