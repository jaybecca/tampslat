# TAMPslat — Digital and Ready

A polished, responsive, browser-based toolkit MVP for freelancers, consultants and small service businesses.

## Run locally

1. Unzip the project.
2. Open `index.html` in a modern browser. No package installation or server is required.
3. For best local development, serve this folder with any static server (for example, `python3 -m http.server 8000`) and visit `http://localhost:8000`.

## Included working features

- Responsive workspace with mobile navigation and light/dark appearance toggle.
- Interface language switch: English, French, Portuguese, Spanish and Arabic (RTL layout for Arabic).
- Proposal, quotation/invoice, client brief, client email and project completion document builders with live preview.
- Download document content as a `.txt` file and print/export the formatted document to PDF using the browser print dialog.
- Live pricing calculator with selectable NGN, USD, GBP and EUR currencies, costs and margin.
- Client tracker with add, search, status filter, delete and CSV export.
- Brand kit with editable business details and selectable accent colours.
- Recent work and business details saved locally in the browser using localStorage.

## Important MVP notes

- This is a front-end prototype. Data is stored only in the current browser/device; it is not synced to an account or cloud database.
- Generated documents are practical templates, not legal, tax or accounting advice. Have agreements and tax treatment reviewed for your jurisdiction.
- No paid APIs, backend, login, payment processing or external integrations are required for this version. The optional Google Fonts import needs an internet connection; system fonts remain as a fallback.
- The brand mark is a CSS/SVG interpretation of the supplied TAMPsocials-style reference; replace `assets/favicon.svg` and the inline SVG in `index.html` with final approved brand artwork if exact vector artwork becomes available.
- Native drag-and-drop reordering for the dashboard shortcut cards; order is saved locally.

## Public website and pricing (MVP update)

The project now opens on a separate public-facing homepage. The existing dashboard/workspace is available through **Open workspace**. The public site includes the pricing section, AI-credit estimator, support details, and starter Privacy, Terms, Refund and AI Use policy pages in English, French, Portuguese, Spanish and Arabic.

### Advertised pricing configured

| Plan | Nigeria | US | UK |
|---|---:|---:|---:|
| Free | ₦0 | $0 | £0 |
| Starter | ₦2,000/month | $2/month | £2/month |
| Pro | ₦5,000/month | $5/month | £5/month |
| Business | ₦10,000/month | $10/month | £10/month |

AI-credit estimator: ₦4 per credit, $0.50 per credit, and £0.37 per credit (indicative USD-to-GBP conversion). Quantity is editable and totals update immediately. These are displayed product prices, not verified payment transactions.

### Geolocation and currency

The page attempts IP-based country detection using `https://ipapi.co/json/` and defaults to NGN for Nigeria, GBP for the UK, and USD for the US/other locations. Users can override the currency manually. IP lookup requires an internet connection and may be unavailable; the currency selector remains usable without it. Browser language is not silently used as a substitute for reliable country detection.

### Payment and AI provider status

The checkout interface offers Paddle for international payments and Flutterwave for Nigerian/local payments, with the likely local provider shown first based on detected country. **Live checkout is not enabled.** Add merchant credentials only on a secure backend, create server-side checkout sessions, verify provider webhooks/signatures, and grant plans/credits only after verified payment. Never put secret keys in frontend JavaScript.

OpenAI and Google Gemini are identified as intended AI providers, but live AI generation and credit consumption are **not connected** in this static MVP. A production implementation needs a server-side API proxy, secret management, usage limits, error handling and server-side credit ledger.

### Before public launch

- Review the starter policies with a qualified adviser for Nigeria, the UK, the US and other target markets.
- Confirm tax, renewal/cancellation, refund and digital-content rules with Paddle/Flutterwave.
- Implement authentication, a database, account-based synchronisation, payment webhooks and server-side credit accounting if the product will be sold as a hosted SaaS.
- Test country detection, language changes, mobile layouts, policy links and all checkout states on real devices.


## Latest merged release
This package combines the public home, pricing, policy pages and workspace. It includes updated TAMPslat logo assets/favicon, workspace currency selector (USD, EUR, GBP, NGN, CAD), profile dropdown, multicolour overview cards, and sign-in/create-account UI pages. Authentication, Google OAuth, payments, cloud vault and live AI remain unconnected until provider credentials and backend services are configured.


## Updated release (27 October 2026)
- `index.html`: public home, pricing and policy links in the footer.
- `tools.html`: restored five-tool workspace (ZIP, PDF, Document & Business, Secure OCR & Smart Vault, Spreadsheet & Data).
- `login.html` and `signup.html`: refreshed responsive authentication screens; Google option remains UI-only until OAuth/backend setup.
- Brand assets are cropped from the supplied TAMPsocials reference for the original icon and TAMP lettering; `slat` is styled separately.
- Added a Cookie Policy starter page/section. Policy text must be reviewed for applicable law before launch.


## Frontend update — Batch Studio and standalone pricing
- `pricing.html` is a standalone pricing and AI-credit estimator page with Free, Starter, Pro and Business plan cards. Currency display and credit quantity calculations are frontend-only estimates.
- `tools.html` includes a frontend-only Batch Studio. It can extract readable ZIP archives, merge compatible PDFs, run OCR on supported images, trim whitespace/remove duplicate rows from CSV/Excel sheets, generate a document inventory, and package outputs plus a processing report into one results ZIP. DOC/DOCX/RTF files are inventoried rather than converted; scanned-PDF OCR and encrypted archives are not supported by this batch flow. Files are processed locally in the browser; no backend is configured. A CSV manifest can also be exported.
- The overview cards use more vivid contrasting gradients.
- No backend, authentication, payment, cloud-storage or AI provider integration has been added.

## Frontend polish update — October 2026
- Homepage Pricing navigation and “Find your plan” hero CTA now open the standalone `pricing.html` page.
- Removed the pricing / AI-credit link from the public footer; legal policy links remain there.
- Public and workspace logos link back to the homepage. Removed the redundant sidebar tagline beside the logo image.
- Added a functional profile dropdown in the tools workspace with homepage, pricing, sign-in, sign-up, admin preview and support links.
- Applied a brighter multicolour treatment to workspace tool cards and icons.
- Added `admin.html`, a frontend-only admin dashboard preview for country/region analytics, plan usage, free-account review signals and compliant lead research planning with CSV template export.
- Admin dashboard values are fabricated demo data. Authentication, admin permissions, live analytics, user-account checks, and live lead collection are not connected. Do not deploy the admin page publicly as a real admin console until server-side authentication and role-based access control are implemented.


## Additional frontend pages (preview)
- `support.html`: standalone support centre with tool FAQs and linked email/WhatsApp contact.
- `settings.html`: browser-persisted light/dark theme preference and account-setting shortcuts.
- `forgot-password.html` and `change-password.html`: frontend-only password recovery/update flows.
- Login and signup forms include show/hide password controls.

**Preview mode:** all eleven homepage studio entries can be explored in the browser, but features that require accounts, cloud storage, payments, or connected AI may not work as production services until backend setup is complete.

AI assistance is planned for document drafting/refinement, PDF summarisation and question-answering, OCR classification and extraction, spreadsheet explanation/cleaning suggestions, ZIP file categorisation, and Batch Studio workflow recommendations. Deterministic file processing remains handled by browser code.


## Workspace audit update
- Added OCR & Smart Vault and Spreadsheet Studio shortcuts from the main workspace to the six-tool workspace.
- Added contextual AI workflow-assistance panels across the tool pages and an overview AI workbench. These are local guidance previews, not live LLM calls.
- Live OpenAI/Gemini responses require secure server-side provider configuration and credit metering.
- Refined the TAMPslat wordmark into a single word with a full-width tagline and brightened icon assets.
- The workspace language selector is retained so users can switch the available interface languages; no extra language overview card is added.

## Brand, pricing and document studio refinement (2026-10-28)
- Rebuilt the TAMPslat wordmark using the original colorful TAMP mark, a restrained dark `slat` wordmark, and the more legible, letter-spaced `DIGITAL AND READY` tagline.
- Synced homepage currency selectors so the plan cards and AI credit estimate update together; filled out EUR/CAD display values and aligned EUR AI credit estimate with the standalone pricing page. Currency values remain illustrative, not live FX or final commercial pricing.
- Expanded the Documents Studio with a spacious six-part business-document requirements checklist and a quick-brief field, plus responsive card spacing for mobile and desktop.


## Backend foundation (October 2026)
The project now includes a Cloudflare Workers API and D1 schema. See `BACKEND-SETUP.md` for deployment steps and limitations. Implemented server features include account signup/sign-in with secure session cookies, server-side AI proxy and internal credit ledger, CSV quality analysis, optional Workers AI image OCR, and account-scoped work-item storage. The backend is not live until D1 is created, secrets are configured, and the Worker is deployed. Payments, email verification/reset, Google OAuth, and production admin controls remain unimplemented.

## File Studio expansion (October 2026)

Open `file-studio.html` from the File Studio link in `tools.html`. Supported browser-side modules in this release:

- ZIP create/extract and single-file GZIP compression/decompression.
- PDF structural re-save using pdf-lib (does not recompress embedded images; output may not be smaller).
- DOCX-to-HTML/TXT extraction and DOCX creation from text/HTML preview content.
- CSV/XLS/XLSX/JSON preview, duplicate removal, whitespace trimming, basic layout preparation and CSV/XLSX export.
- EPUB spine text extraction and HTML/TXT export.
- PPTX slide-text extraction to TXT/HTML (not a faithful slide renderer).
- Font preview and CSS/font kit packaging (no binary font transcoding).
- OBJ/STL/GLB/GLTF 3D preview (not a CAD conversion engine).

Files remain in the browser for these workflows. External browser libraries are loaded from CDNs, so first use requires an internet connection. Large files may exceed browser memory limits.

Not included as completed conversions: legacy DOC/ODT, Office-to-PDF fidelity conversion, MOBI/AZW3, RAR/7Z/TAR/ISO, font binary transcoding, STEP/IGES/FBX conversion, or faithful PPTX rendering. These need additional conversion engines and validation. Do not advertise them as supported until implemented and tested.

## Open the correct folder in VS Code

Open the project root folder (the folder containing `tools.html`, `file-studio.html` and `backend/`) using **File → Open Folder**. Project-specific Live Server settings in `.vscode/settings.json` pin the server root to the opened workspace and port 5500. Then open `tools.html` and choose **Open with Live Server**. The expected URL is `http://127.0.0.1:5500/tools.html`.

If the Live Server extension is not installed, VS Code will recommend `ritwickdey.LiveServer`. Do not open a nested `templates/` or `output-templates/` folder as the workspace root.

## File Studio — publishing and conversion engines

The File Studio collection now includes dedicated workspaces:

- `document-converter.html` — queue-based conversion UI backed by an isolated LibreOffice service. Supported families and conversion matrices are documented in `FILE-STUDIO-ENGINE-SETUP.md`.
- `ebook-studio.html` — structural EPUB 3 authoring with chapter/section hierarchy, semantic XHTML, Dublin Core metadata, custom book CSS, image packaging, reflowable/fixed-layout metadata, navigation generation and a real ZIP/OCF compiler.
- `font-studio.html` — glyph matrix and Bézier outline editor, metrics, legacy kerning pairs, TrueType compilation via opentype.js, and CFF OpenType compilation through FontTools.

### Start the local conversion engines

Run Docker Desktop, then from the project root:

```bash
docker compose up --build -d
```

The document engine health endpoint is `http://127.0.0.1:8788/health`; the CFF font compiler health endpoint is `http://127.0.0.1:8790/health`.

Run the static workspace on port 5500 (for example, `npm run dev:site`). Stop the services with `docker compose down`.

Read `FILE-STUDIO-ENGINE-SETUP.md` before exposing either service outside localhost. The development services are not authenticated and must not be publicly exposed as-is.

## PDF, Spreadsheet and Archive Studio engine update
See `PDF-SPREADSHEET-ARCHIVE-ENGINE-RELEASE.md` for the exact feature boundaries, setup and safety notes. PDF image optimization and PDF-to-DOCX require the document-converter Docker service. ZIP/GZIP operations run in a Web Worker; `.tampenc` is a TAMPslat-specific AES-256-GCM wrapper, not standard WinZip AES. The spreadsheet grid virtualizes rendered rows but still imports the workbook into browser memory; do not assume unbounded 100k+ row performance.


## Platform-wide audit update — 2 November 2026
- Homepage product catalogue expanded to 11 entries, including Document Converter Studio and Ebook Studio.
- The File Studio page contains nine selectable tools; selecting a module now scrolls the active workspace into view and updates its hash for direct linking.
- Login, signup and recovery pages now expose a five-language selector. Core studio pages use the shared language selector; translated coverage varies by page and some specialist controls remain English.
- The profile menu can show the authenticated credit balance and stores low-credit, renewal and three-day expiry alert preferences locally. These toggles do not yet deliver notifications; renewal dates and notification delivery require backend support.
- Nigeria checkout UI presents Flutterwave first and explains bank transfer, card and USSD methods where the provider supports them. Checkout remains disabled because provider checkout sessions and verified webhooks are not implemented.
- **Known engine gap:** this ZIP does not include `services/document-converter/` or `services/font-compiler/`, although `docker-compose.yml` references them. The dedicated document conversion service and CFF font compiler cannot be built until those source folders are restored.
- Account signup/sign-in and AI credit accounting have Worker routes, but password reset/change email delivery, Google OAuth, live subscriptions and payment entitlements are not fully configured.
- Privacy, Terms, Refund, AI Use and Cookie policies remain starter text and require qualified review for each market before paid launch.


## Product upgrade — 5 November 2026
- Added a 100-item editable template library across ten practical categories, with in-browser editing, colour themes, copy, text download and print/PDF export.
- Added 50 original SEO-focused business and digital-work articles in a crawlable static insights page, plus canonical metadata, structured ItemList data, robots.txt and sitemap.xml.
- Aligned Free, Starter, Pro and Business plan descriptions with monthly server-side action, AI request, OCR, CSV, export and saved-work allowances. Existing advertised base prices are retained.
- Added D1 monthly usage counters/events and the Usage & Limits account page. AI, OCR, CSV and saved-work endpoints reserve and record monthly usage. Browser-only operations must explicitly call the usage API to be metered.
- Added Flutterwave Standard checkout creation, webhook hash verification, server-side transaction verification, plan activation for 30 days, and AI credit top-ups. Nigeria is routed to NGN. Automatic recurring subscription renewal is not enabled.
- Added expanded support guidance and high-contrast dark-theme overrides for brand marks, navigation, buttons, forms and new content pages.
- **Before deployment:** apply `backend/migrations/0002_usage_payments.sql`, configure `FLW_SECRET_KEY` and `FLW_SECRET_HASH`, set `APP_ORIGIN`, and follow `PAYMENTS-USAGE-SETUP.md`. Test with Flutterwave test credentials before live payments.
