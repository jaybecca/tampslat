# TAMPslat File Studio — Audit and Upgrade

## Overview layout
- Updated the Overview tool cards to a 3–2–2 desktop arrangement.
- Batch Studio and File Studio now share the final row; existing narrow-screen stacking remains intact.

## Spreadsheet Studio
- Replaced the previous styling metadata-only operation (which SheetJS Community Edition did not export as visual Excel styling) with a designed in-browser table preview.
- Added ExcelJS-based XLSX export: purple header, alternating row bands, borders, adjusted column widths, autofilter, frozen header and readable alignment.
- CSV export remains plain data because CSV cannot store cell styling.
- The styled export is rebuilt from the active worksheet's displayed values. Macros, charts, pivot tables, formulas as formulas, and complex workbook features are not preserved by this styled export.

## File Studio batch preparation
- Implemented a multi-file queue with drag-and-drop, duplicate selection prevention, file-type and size summary, per-file removal, queue analysis, CSV manifest, clear queue, workflow selection, progress/status feedback and one ZIP download containing results plus a processing report.
- Workflows: prepare supported files, archive original files, extract ZIP archives, clean spreadsheets, structurally re-save PDFs, and create an inventory.
- Prepare workflow supports ZIP/GZIP processing, PDF structural re-save, DOCX text extraction, PPTX slide-text extraction, EPUB chapter-text extraction, spreadsheet whitespace trimming and duplicate/empty-row removal, and safe retention of preview-only/unsupported formats for review.
- Unsupported operations are reported; the batch workflow does not claim unsupported formats have been converted.

## Additional functional fixes
- ZIP extraction in Archive Studio now preserves folder paths and returns one extracted ZIP instead of triggering multiple flattened downloads.
- DOCX text export can extract text directly without requiring a separate preview click.
- DOCX creation no longer treats the untouched preview placeholder as document content.
- 3D Studio copy now matches its implemented support: OBJ, STL and GLB. GLTF is not advertised as enabled.
- 3D renderer animation/resources are cleaned up when switching modules to avoid accumulating render loops.

## Known limits (explicitly retained)
- PDF processing is a structural re-save, not image downsampling or guaranteed size reduction.
- DOCX conversion is text/HTML extraction and basic DOCX creation, not full-fidelity Office conversion.
- Presentation Studio extracts PPTX slide text only; it does not reproduce layouts, charts, animation or media.
- Font Studio previews selected formats and creates a CSS starter kit; it does not transcode font binaries.
- 3D Studio previews OBJ/STL/GLB; it does not convert CAD formats.
- RAR/7Z/TAR, MOBI/AZW3, legacy DOC/ODT, full-fidelity Office-to-PDF, STEP/IGES/FBX and advanced presentation rendering need specialist engines and remain unsupported.
- All current File Studio processing is client-side and subject to browser memory and file-size limits. External CDN libraries must load for the relevant operations.
