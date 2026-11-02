# TAMPslat brand and standalone studio correction

## Correct brand icon
- Replaced the incorrect abstract `T` favicon artwork with the actual multicolour TAMPslat symbol taken from `assets/tampslat-mark.png`.
- Added root `favicon.ico`, SVG, PNG 16/32px, Apple touch icon and PWA 192/512px assets.
- Normalised favicon declarations across HTML pages and added a cache-busting version to SVG/PNG links.

## Standalone File Studio engines
- Corrected the standalone default module selection so ZIP, PDF, Spreadsheet and Batch pages open their own engine when loaded directly without query parameters.
- Each standalone page contains its own engine shell and selects the appropriate module on initial load; shared processing code remains in the same maintained engine implementation.
- Confirmed dedicated pages for all nine tools: ZIP, PDF, Spreadsheet, Batch, Document Converter, Ebook, Presentation, Font and 3D.

## Template navigation
- Added a consistent TAMPslat navigation header to all document templates and output design templates.
- Each header includes a return-to-Workspace link and File Studio link, with responsive styling.

## Validation
- ZIP integrity and static script syntax checks performed.
- Not a substitute for browser-based file processing, export, mobile or deployed favicon cache tests.
