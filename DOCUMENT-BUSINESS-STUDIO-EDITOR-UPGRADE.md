# TAMPslat Document & Business Studio / File Studio Upgrade

## Included
- Restored the 10 editable document/business HTML templates and exposed them as a visible template library in Document & Business Studio.
- Restored all 10 blank output-design templates and exposed them through an expandable design library and a 10-theme visual palette.
- Added heading/body font size controls, heading/body/page/accent colour pickers, bold, italic, underline, bulleted lists, hyperlinks, divider and highlight controls.
- Made the generated preview directly editable and added HTML, TXT, print/save-to-PDF and financial XLSX export options.
- Added an AI Improve action that calls `window.TAMPSLAT_AI_ENDPOINT` only when a secure endpoint is configured. Without that endpoint it clearly reports that AI is not connected; no fake AI processing is claimed.
- Fixed File Studio startup so opening `file-studio.html` displays the tool chooser and does not auto-launch ZIP. A specialist tool opens only after the user selects its card. Standalone ZIP/PDF/Spreadsheet/Batch routes continue to initialize their requested modules.

## Verification
- Confirmed exactly 10 files exist in `templates/` and exactly 10 in `output-templates/`.
- Confirmed all new editor controls and template links are present.
- JavaScript syntax checks passed for the changed inline scripts (excluding the import map, which is JSON rather than JavaScript).
- No live browser, PDF service, office-conversion service, or AI provider integration was run in this build environment.
- No GitHub push or deployment was performed.
