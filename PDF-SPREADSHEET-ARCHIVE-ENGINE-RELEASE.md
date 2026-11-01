# TAMPslat PDF, Spreadsheet & Archive Engine Upgrade

## PDF Optimizer
- Multi-file endpoint: `POST /api/pdf/optimize` (`files[]`, `profile=screen|ebook|print`).
- Uses Ghostscript `pdfwrite` with profile presets to rebuild PDFs, downsample eligible images and recompress eligible image/font resources.
- Profile mapping: Screen `/screen`, E-book `/ebook`, Print `/printer`.
- Output is a reconstructed PDF, not an in-place object mutation. Signatures, forms, annotations, bookmarks, layers, attachments and metadata may be lost or changed. Never overwrite the source.
- PDF to DOCX is enabled through Ghostscript `docxwrite`; extraction is heuristic and not pixel-identical. Scanned image-only pages need OCR; complex tables/columns should be reviewed.

## Spreadsheet Studio
- The browser preview now virtualizes the visible window (60 rows plus overscan) so it does not create a DOM node for every row.
- Formula engine is a small lexer/parser/evaluator. Supported functions: SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, IF, AND, OR, NOT, basic VLOOKUP; arithmetic, comparisons, concatenation, cell refs and ranges are supported.
- Import still materializes the workbook into browser memory using SheetJS. Virtual DOM rendering is not a substitute for a server-backed/worker-backed columnar engine; extremely large 100k+ row workbooks may still be memory constrained. Advanced Excel functions, external links, array/dynamic formulas, date serial semantics, named ranges and full workbook calculation are not implemented.

## ZIP & Archive Studio
- ZIP creation/extraction runs in a Web Worker so CPU-heavy JSZip work does not block the page's main thread.
- Optional AES-256-GCM encrypted `.tampenc` container uses PBKDF2-HMAC-SHA256 (310,000 iterations), random 128-bit salt, 96-bit IV and authenticated encryption.
- `.tampenc` is a TAMPslat-specific encrypted ZIP wrapper, NOT the interoperable WinZip AES ZIP format. Password recovery is impossible. Keep the original files and password safe.
- Worker processing still buffers data in memory. Browser-only archive mode does not yet support LZMA, RAR, 7z, TAR or streaming very-large-file archives. Do not claim these formats are supported.

## Security / operations
- Converter and PDF engine defaults to a 50 MiB per-file limit. Public deployment needs TLS, authentication, rate limiting, request quotas, malware scanning, isolated temporary storage and strict origin allowlists.
- Ghostscript may alter fidelity; users must compare outputs before replacing originals.
