# File Studio Professional Roles & Signature Update

- CV target roles accept multiple titles separated by new lines, semicolons or vertical bars and render as a tidy role stack. Portfolio headlines support the same format.
- Business & Document AI refinement has a premium four-step review interface. It still requires a secure server-side AI endpoint and account-credit integration; no provider credentials belong in browser code.
- PDF signing supports either a typed name or a pointer/touch-drawn visual signature. Neither option is a certificate-backed cryptographic digital signature.
- Presentation and 3D headers include File Studio and Workspace navigation. The File Studio overview removes its redundant self-link.
- OCR and Smart Vault do not inherently need AI: OCR extracts text using a local OCR engine; Vault encryption, key derivation and local storage are deterministic security functions. AI may be optional for semantic summaries, classification or natural-language search, but should never replace encryption or be required to unlock/decrypt. Tesseract.js runs in browser workers and is not itself a PDF parser.

## Translation status
The existing five-language selector is retained. The current translation catalogue is partial; this release does not claim 100% translation across every page, dynamic control, validation message, accessibility label or generated preview. A full audited translation pass requires reviewing every workspace string and testing all five locales, including Arabic RTL.
