# File Studio routing and engine merge release

## Navigation audit and corrections

- Presentation Studio routes to `presentation-studio.html` (Fabric.js editor).
- 3D Web Studio routes to `3d-web-studio.html` (Three.js workspace).
- Spreadsheet Studio routes to `spreadsheet-studio.html`, which opens the current spreadsheet module in standalone mode. `sheets.html` is retained as a compatibility redirect.
- PDF Processing & Optimization routes to `pdf-studio.html`, opening the PDF processing module in standalone mode. Universal Office conversion remains available from `document-converter.html`; the PDF engine and converter are distinct operations and are not falsely described as one universal conversion matrix.
- ZIP & Archive routes to `zip-studio.html`, opening the current archive worker-backed module in standalone mode.
- Batch Processing routes to `batch-studio.html`, opening the batch workspace without the module catalogue.

The redundant fixed-position Presentation and 3D shortcut buttons were removed. Purple/blue accents now appear as restrained module indicators and workspace borders.

## Implementation boundary

The standalone pages intentionally reuse the canonical File Studio implementation through `file-studio.html?studio=...` rather than copying separate engine implementations. This prevents the standalone route and File Studio module from drifting apart. The PDF optimizer UI currently uses the browser-side PDF re-save operation in File Studio; the Ghostscript optimization endpoint remains part of the separately configured document-converter service and must be wired and deployed with authentication before being advertised as an active remote optimization path. The batch screen is the existing batch module; this routing release does not claim that every specialist operation has been migrated to workers.

## Verification

Run `node --check` on inline scripts and open each standalone route in a browser. Service-backed PDF optimization still requires the Docker converter service.
