# TAMPslat File Studio — Principal Engineering Upgrade

## Added workspaces

### Universal Document Converter

A multi-file queue UI delegates conversion to LibreOffice. The service has a declared family matrix rather than claiming every possible cross-family conversion:

- Writer: DOC, DOCX, ODT, RTF, TXT, HTML -> Writer formats and PDF.
- Calc: XLS, XLSX, ODS, CSV -> Calc formats and PDF.
- Impress: PPT, PPTX, ODP -> Impress formats and PDF.
- PDF: PDF re-save and layout-aware TXT extraction.

PDF-to-editable-office conversion is intentionally excluded. Conversion can alter layout, formulas, charts, macros, embedded objects, animation and proprietary features.

### Ebook Studio

- Hierarchical chapters and sections with reading-order reordering.
- Semantic rich-text authoring with sanitization and XHTML serialization.
- Dublin Core metadata fields.
- Book-level CSS.
- Reflowable and pre-paginated rendition metadata.
- Image insertion, import from EPUB assets and resource packaging.
- Real OCF ZIP generation: first `mimetype` entry, `META-INF/container.xml`, `EPUB/package.opf`, EPUB 3 navigation document `EPUB/toc.xhtml`, XHTML spine documents, CSS and images.
- Post-build structural checks for ZIP CRC, first entry, required files, XML well-formedness, manifest resources and spine references.

The navigation document is the EPUB 3 `nav` document and is referenced by `properties="nav"`; `toc.xhtml` is the requested filename. The old EPUB 2 NCX file is not generated because it is not required for EPUB 3-only output.

### Font Studio

- Printable ASCII glyph matrix plus custom Unicode glyph slots.
- Pointer-driven vector path construction with line and cubic Bézier segments; existing anchors can be moved.
- SVG path import/export, advance width and side-bearing controls.
- Baseline, x-height, cap-height, ascender and descender guides.
- Kerning pair entry and export.
- Actual TrueType `glyf` binary output via FontTools service; output is reopened and checked for `glyf`, `cmap`, `hmtx` and `OS/2` tables.
- Actual CFF-based OpenType output via FontTools service; output is reopened and checked for `CFF `, `cmap`, `hmtx` and `OS/2` tables.

The font tool is a real vector font construction foundation, not yet a complete commercial type foundry. It does not implement full GPOS shaping, GSUB substitutions, anchors, mark positioning, variable-font axes, hinting tools, autotracing or complete language-specific glyph inventories. A production family requires those features and specialist QA.

## Validation performed

- HTML parser and JavaScript syntax checks passed for the workspace and all three new pages.
- Node syntax check passed for the LibreOffice API service.
- Python compilation passed for the FontTools service.
- FontTools smoke tests produced parseable TrueType `glyf` and CFF OpenType binaries with `.notdef`, A and V glyphs, OS/2 metrics and a kern table.
- Host LibreOffice smoke test converted a DOCX sample to a one-page PDF; `pdftotext` extracted its text.

## Not yet verified

- Docker image builds and live HTTP multipart API tests were not run in this environment.
- Browser interaction tests and actual EPUBCheck validation were not run.
- Browser interactions, remote compiler HTTP calls and installation tests on target desktop systems remain to be performed.
- Production services need authentication, TLS, rate limiting, malware scanning, strict CORS configuration, job isolation, resource quotas and monitoring before public deployment.
