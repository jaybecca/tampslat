# TAMPslat Smart Vault & Business Operations Release

## Workspace information architecture
- Overview now presents three clear destinations: File Studio, Business & Document Operations, and OCR & Smart Vault.
- File Studio remains the home of the nine specialist tools: ZIP & Archive, PDF Optimizer, Universal Document Converter, Spreadsheet, Ebook, Presentation, Font, 3D Web, and Batch.
- Spreadsheet routing is consolidated: `sheets.html` forwards to `file-studio.html#spreadsheet`; the old standalone `tools.html#sheets` route also forwards to the same module.
- Presentation and 3D Web are no longer duplicated in the main navigation; they remain accessible inside File Studio.

## OCR & Smart Vault
- New `vault-studio.html` page.
- Tesseract.js browser worker OCR for images and PDF pages rendered with PDF.js.
- Editable OCR text, suggested email/date/amount metadata tags.
- AES-GCM 256-bit encryption via Web Crypto, PBKDF2-SHA-256 (310,000 iterations), random 16-byte salt and 12-byte IV.
- Only encrypted payloads are persisted in IndexedDB. File contents, OCR text, extracted metadata and the record label are encrypted together. No raw password or unencrypted document is sent to a backend.
- Current browser-based ingestion limit: 25 MB.
- Searchable PDF export overlays OCR words at recognised page coordinates. It uses a standard PDF font, so validate complex scripts and alignment; this is not a guarantee of perfect OCR.

## Business & Document Operations
- New `business-operations-studio.html` page with seven guided output types:
  Resume, Cover Letter, Statement of Purpose, Invoice/Quotation, Digital Portfolio, Profit & Loss, and Operating Expense Tracker.
- JSON-schema-like field definitions drive the form renderer.
- Documents use structured HTML typography templates and export to HTML or browser-generated PDF.
- Invoice, P&L and OpEx outputs produce structured matrices and XLSX exports compatible with Spreadsheet Studio.

## Language and navigation
- Overview language toggle uses the existing five locales: English, French, Portuguese, Spanish and Arabic.
- Added shared language selectors to File Studio, Presentation Studio, 3D Web Studio, Smart Vault and Business Operations. Shared phrase translations cover the main module catalogue and common actions. This is a translation layer, not a certified full human translation of every dynamic text string; specialist tool instructions and user-entered content may remain in English.
- Avatar dropdown now includes profile/settings, plans/billing, help/support and public homepage links. Sign-out is intentionally not shown as the current static menu does not expose a verified session sign-out action.

## Verification boundaries
- JavaScript syntax checks and HTML parser checks are included in this release workflow.
- Browser OCR, cryptographic persistence, PDF text extraction across all scripts, real-world financial document rendering and large-file performance still require browser/device testing.
- The browser vault is local encrypted storage, not cloud backup or account-synchronised storage.
