# Testing Kelvani Tab

Automated: `npm test` with Node.js 22+. Tests exercise real domain logic without third-party dependencies.

Before a stable release, load the unpacked extension in both Chrome and Edge and check:

1. New tabs display the dashboard, with a ticking local clock.
2. Add a fictional HTTP(S) favorite; open another new tab and verify it persists. Remove it and check storage again.
3. Save a fictional note, wait for GESPEICHERT, then reopen a new tab.
4. Change theme and search engine, reopen and verify persistence.
5. Export and re-import a backup. Cancel a replacement and confirm existing state stays unchanged.
6. Reject a backup with executable URLs, invalid schema, duplicate IDs or oversized data.
7. Test keyboard navigation, screen reader labels and narrow windows.
8. Verify browser console has no CSP errors and the Network tab has no startup requests to third parties.

The HTTP preview exercises the UI fallback, not extension installation or chrome.storage.local. Do not describe a preview test as a native extension test.
