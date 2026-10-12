# Kelvani Tab

A calm, free, open-source new-tab dashboard for Chrome and Edge. Version 0.1 includes a clock, search engine selection, favorite links, automatically saved notes, light/dark themes and validated JSON backup import/export. The interface is German.

## Install for development

1. Download this repository as ZIP and extract it.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable Developer mode and choose **Load unpacked** / **Entpackt laden**.
4. Select the folder containing `manifest.json`.
5. Open a new tab and accept the browser's new-tab change prompt if shown.

This is an unpacked development release, not a store listing. Existing extensions that replace the new-tab page can conflict. Disable the other new-tab replacement if needed.

## Privacy and permissions

The only permission is `storage`. The app uses `chrome.storage.local` for links, notes and settings. No analytics, remote fonts, remote scripts or favicon services. Searches are sent to the search engine you select only when you submit the search; visiting your favorite links sends the normal request to those websites. The Kelvani branding link opens kelvani.net only when clicked; the app does not depend on that website being hosted.

Removing the extension removes its local data. Export a backup before uninstalling. Import replaces current data after an explicit prompt. Only HTTP(S) links without embedded credentials are allowed; executable and internal browser URLs are rejected. Treat backups as personal data because they include your notes and links.

## Development

No dependency installation or build step is needed. Node.js 22+:

```sh
npm test
```

Serve the repository using a static HTTP server for a UI preview; it uses localStorage in preview mode. Preview data is separate from extension storage, and the page displays a preview label. Opening HTML directly from disk is unsupported. The extension uses Web Locks to serialize same-origin storage changes; use a current browser.

## Validation and limits

Unit tests cover state validation, backups, safe URLs and encoded search queries. See TESTING.md for the native extension smoke test. Import limit: 2 MB; 100 links; 20,000 note characters. Notes save after a brief typing pause or on blur; check the saved indicator before closing the tab. Device synchronization and integration with KelvaniSwift are not included in 0.1.

## Contributing

Report a reproducible issue with browser version, expected and actual behavior. Do not include real notes, passwords or private URLs. Run the tests before proposing changes. Follow-up priorities: native extension smoke tests, keyboard-accessible backup controls, and explicit cross-tab note-conflict handling.

## Origin and license

Newly written for schlagskill's Kelvani project with OpenAI coding assistance. No copied repository history, third-party branding or donation links. MIT license, see LICENSE. Kelvani is a project brand; no company registration or trademark claim is implied.
