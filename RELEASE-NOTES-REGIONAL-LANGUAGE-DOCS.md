# TAMPslat frontend update

- Added compact language selectors to Pricing and Support, persisting the selected language and enabling Arabic RTL document direction. The current selectors do not translate all static page copy; full page localization remains a separate task.
- Tightened Pricing and Support logo width.
- Hardened workspace navigation event delegation for all `[data-page]` elements and corrected hash-based navigation to render the requested tool without recursively pushing history state.
- Added five selectable visual HTML export themes for career-document categories and upgraded the standalone HTML export styling for invoices.
- Added regional checkout selection scaffold: NGN routes to Flutterwave, other listed currencies to Paddle. Real checkout is intentionally not marked active; approved hosted checkout URLs and server-side verification are required.
- Updated standalone OCR and spreadsheet page links to open their corresponding workspace routes.

## Validation limits

JavaScript syntax and ZIP integrity are checked. No real-browser end-to-end test was performed. Payment providers are not live, and pricing/support selectors currently persist language preference but do not fully translate all static text.
