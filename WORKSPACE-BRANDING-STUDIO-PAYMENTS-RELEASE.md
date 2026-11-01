# TAMPslat workspace identity and studio release

- Normalised logo sizing through `assets/brand-system.css` across HTML pages.
- Repaired favicon references to the existing `assets/favicon.svg` (some pages pointed at a missing PNG).
- Created dedicated standalone engine pages for ZIP, PDF, Spreadsheet and Batch by embedding the File Studio engine and selecting each module on its own URL. These are independent page documents, sharing the same underlying engine implementation.
- Restored a Design Studio on Business & Document Operations: generate content first, review the original output, apply one of four design themes, then optionally ask AI to refine. AI proposal remains reviewable before applying.
- Added Flutterwave and Paddle provider selection to the homepage checkout modal. Checkout remains disabled until secure server-side session creation and webhook verification are configured.
- Existing OCR & Smart Vault Design/AI section retained.

Validation performed: ZIP integrity, static script syntax checks. Not performed: live browser interaction tests, provider sandbox tests, backend payment verification, production deployment.
