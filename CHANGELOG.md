# 0.4.0

Layout presets and reversible layout edits.

## 0.3.9

K-Logo für alle Erweiterungssymbole. Transparenter Namensbereich; Plus und Zahnrad statt beschrifteter Toolbar-Buttons.

# UI release 0.3.8

Text-Wortmarke ohne Logo; Toolbar-Buttons verwenden Widget-Transparenz und Glass-Farben.

# UI release 0.3.7

Gemeinsame Controls und Dialoge; Widget-Raster und Hintergründe beibehalten.

Gemeinsame Quelle: work/kelvani-ui. Siehe assets/ui/README.md.

# Changelog

## 0.3.5 — 2026-10-13

- Refresh the calendar at local midnight, including month/year rollover, without resetting a deliberately browsed month.
- Persist valid focus-duration edits immediately. Protect running/paused sessions from duration changes and explain how to reset them.
- Save note drafts before search/link navigation; warn before closing while a note write is still pending.
- Use a nighttime greeting before 05:00 and from 23:00, in German and English.
- 57 automated tests and isolated HTTP UI checks; native Chrome/Edge installation remains pending.

## 0.3.4 - 2026-10-12

- Remove the dashboard footer label and redundant appearance button. Background settings and photo credits remain in Settings.

## 0.3.3 - 2026-10-12

- Add the owner-provided blue K symbol as square PNG extension/action icons in 16, 24, 32, 48 and 128 px, plus a page favicon.
- Preserve the original proportions and white background; no dashboard logo is reintroduced.

## 0.3.2 - 2026-10-12

- Replace the header logo/tagline with a right-aligned wordmark and 50 original bilingual random thoughts.
- Add a compact Settings menu for widgets, layout, appearance and general preferences.
- Add persistent German/English UI, localized dates and six color schemes; keep user-written content unchanged.
- Expose 0–100% widget transparency with a percentage readout.
- Dismiss saved notices after two seconds without reserving layout space; retain undo/error handling.
- Expand preference and migration regressions to 55 tests total.

## 0.3.1 - 2026-10-12

- Make occupied grid positions usable: equal cards swap; resize and other moves push affected neighbours down.
- Replace the top size menu with a lower-right pointer/keyboard resize grip and live raster feedback.
- Enable compact-window pointer/keyboard reordering; use document-level pointer listeners.
- Bundle five Pixabay backgrounds with individual photographer/source credits and a separate asset license notice.
- Document eight future widget ideas and add six reflow/background regressions: 48 tests total.

## 0.3.0 - 2026-10-12

- Replace the fixed page with twelve widgets and a persistent, collision-checked 12-column grid.
- Add pointer/keyboard movement, validated sizes, widget catalogue and responsive reading layouts.
- Add analog clock, calendar, persistent focus timer, world clock, safe arithmetic, countdown and original daily thoughts.
- Add explicit opt-in Open-Meteo weather, optional host permissions and timestamped cached readings.
- Add original Aurora/mountain backgrounds, local photo upload and card opacity.
- Preserve previous data/backups and reject URLs exceeding the limit after normalization.
- Expand regression coverage to 42 tests.

## 0.2.0 - 2026-10-12

- Implement Kelvani brandbook v3 with original logo and local Inter fonts.
- Replace the clock-led layout with a new-tab search and shortcut grid; add groups, edit/reorder/undo, tasks, widget preferences and note-conflict handling.
- Add backup preview, light/dark/system themes and preserve v0.1 data.
- Add domain and storage regression tests; document remaining native release checks.

## 0.1.0

Initial standalone extension prototype.
