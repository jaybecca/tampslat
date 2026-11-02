# TAMPslat File Studio — Conversion and publishing engines

> **Package integrity note (2 November 2026):** The current ZIP includes the Document Converter and Font Studio browser interfaces, but does **not** include `services/document-converter/` or `services/font-compiler/`, even though `docker-compose.yml` references those build contexts. Consequently, the corresponding Docker services cannot be built from this ZIP. The converter engine and CFF OpenType compiler are not operational until those source folders are restored. Do not expose a substitute unauthenticated service publicly.

## Browser pages

- `document-converter.html`: conversion queue UI. It calls the separate LibreOffice service.
- `ebook-studio.html`: structural EPUB 3 authoring and package compiler. EPUB files are assembled locally in the browser with JSZip.
- `font-studio.html`: glyph-vector editor. TrueType glyf output and CFF-based OpenType output are compiled by the FontTools service. OpenType.js is used in the browser for font parsing and vector path rendering.

## Start local conversion engines

Requirements: Docker Desktop running.

```bash
docker compose up --build -d
curl http://127.0.0.1:8788/health
curl http://127.0.0.1:8790/health
```

Then run the static site from the project root, for example:

```bash
npm run dev:site
```

Open `http://127.0.0.1:5500/tools.html`. The document converter defaults to port 8788 and the OTF compiler to port 8790.

Stop services with:

```bash
docker compose down
```

## Supported document engine formats

LibreOffice input/output families include DOC/DOCX/ODT/RTF/TXT/HTML, XLS/XLSX/ODS/CSV, and PPT/PPTX/ODP, with PDF export. PDF input supports PDF re-save and layout-aware text extraction to TXT. Arbitrary PDF-to-editable-office conversion is deliberately not offered as a universal conversion because page layout, fonts, tables and vector elements cannot be reliably reconstructed in all cases.

Conversions may alter unsupported features, formulas, charts, macros, animations, embedded objects and layout. Keep originals and inspect converted outputs.

## EPUB 3 compiler

The authoring tool writes `mimetype`, `META-INF/container.xml`, `EPUB/package.opf`, `EPUB/toc.xhtml`, XHTML spine documents and a book CSS file. The navigation document is an EPUB 3 XHTML `nav` document referenced with `properties="nav"` in the OPF manifest. Reflowable and pre-paginated rendition metadata are supported. Images added in the editor are embedded in the EPUB package.

Before commercial distribution, run the generated file through the official EPUBCheck validator and test it in multiple reading systems. This project does not bundle EPUBCheck.

## Font compiler

- `.ttf`: FontTools TrueType `glyf` compiler.
- `.otf`: FontTools CFF OpenType compiler. These are separately generated binary formats, not extensions applied to the same file.
- The font editor currently provides an ASCII starter matrix and user-added Unicode glyphs. A professional production font still needs a complete glyph set, robust contours, hinting, anchors, GSUB/GPOS shaping features, language coverage and specialist QA. The current editor's kerning support writes legacy `kern` pairs; it does not implement the full GPOS feature model.

## Production deployment

These two engine services are not Cloudflare Workers. Deploy them to a secured container host or private service, configure HTTPS, authentication, rate limiting, strict CORS origins, request limits and malware scanning, then set the service URLs in the two studio pages. Do not expose the unauthenticated development endpoints directly to the public internet.
