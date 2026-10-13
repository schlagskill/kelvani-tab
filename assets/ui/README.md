# Kelvani UI · shared source

tokens.css, components.css and icons.js are the authoritative UI source for Tab, Swift and AdBlocker. Fonts are locally packaged Inter (SIL Open Font License in fonts/Inter-OFL.txt). Existing product colors and task-specific layout are local adapters, not independent component implementations.

Run `python work/implementation/sync_kelvani_ui.py` from the workspace root after any change. Run the same command with `--check` before packaging: it fails if any generated product copy differs. Product copies are generated artifacts, marked by provenance metadata. All three ZIPs include their self-contained generated assets; no cross-extension dependency or build runtime is needed after installation.

Controls: normal 36px, compact 32px, optional touch 44px; 8px control radius, 12px card radius, 16px dialog radius. Icons: original Kelvani line icons, 18px, stroke 1.75. Typography: Inter 400/600, body 14/1.5, secondary 12, section 20, page 28. Spacing: 4/8/12/16/24/32px.

Use primary for the main committing action, secondary for alternatives, text buttons for low-emphasis navigation and red danger text only for destructive actions. Product accents remain blue/purple/red. Disabled controls explain unavailable browser operations; previews are visibly identified. Focus: 2px accent outline, 3px offset. Errors must remain available long enough to correct; success notices are temporary. Dialogs retain existing focus-return and keyboard behavior.

Tab retains its dashboard layout, widget sizes and personalization. The family primitives apply to its toolbar, forms and dialogs. Swift organizes projects, templates and tab lists. AdBlocker has a compact per-site action popup and a separate preferences page. Neither shares a forced dashboard layout.

Append `?ui-review=grayscale` to a preview URL to render its actual UI in grayscale without changing settings. This is a review aid, not a user-facing product feature.
