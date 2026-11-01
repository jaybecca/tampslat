# TAMPslat Presentation, 3D and Workspace Orchestration Release

## Included

- Presentation Studio: Fabric.js object canvas using a fixed 1280×720 coordinate matrix (16:9), slide deck list, editable text/shapes/images, selection, object ordering, centre/edge snapping, keyboard nudging, PNG and multi-slide PDF export.
- Presentation timing: per-object entrance-delay metadata and a timeline surface. Full keyframe playback, transitions and a complete animation sequencer remain future work.
- 3D Web Studio: Three.js WebGL2 scene, scene hierarchy, orbit camera, transform gizmo, primitive/light creation, PBR material controls, asynchronous glTF/GLB import and GLB export.
- Workspace Orchestrator: File Virtual Machine metadata registry, bounded Web Worker pool, task queue, message events and transferable-buffer task protocol. Initial worker operations include file metadata analysis, FNV-1a content fingerprinting and Unicode text normalization.
- AI refinement client contract: accepts a server-side authenticated endpoint and validates preview responses. No model provider is configured in this release; the UI deliberately does not claim AI changes were made.
- Overview navigation/cards and a stronger typography weight hierarchy.

## Important scope and verification notes

This is an interactive front-end foundation, not a complete production distributed processing system. The current worker pool is a task substrate, not yet a universal binary pipeline for every specialist engine. Each operation must be migrated into worker-safe modules with format-specific libraries and resource limits. Some browser APIs (for example PDF libraries, DOM-based rendering and WebGL contexts) cannot be moved to a worker unchanged.

Presentation PDF export rasterizes each slide to an image in the PDF. The canvas model is vector-editable, but this first export path does not preserve vector text in the PDF. The timeline stores entrance-delay metadata but does not yet render timed playback. The stage uses fixed 1280×720 coordinates and scales through its responsive 16:9 wrapper.

The 3D studio requires WebGL 2 and a modern browser with module/CDN access. GPU rendering remains on the browser's graphics pipeline; scene parsing/export is asynchronous where supported. A low-power or unsupported browser may not run it.

AI refinement requires a same-origin authenticated backend endpoint. Provider keys must be stored as server secrets, never in HTML, JavaScript, localStorage or a public Cloudflare Pages variable. The endpoint must validate ownership, input size, file type, prompt safety, output schema, quotas and audit/retention rules. A preview/approve/revert flow should be enforced before replacing originals.

The orchestrator currently includes a bounded pool and a small sample task set. It does not yet guarantee that all existing PDF, font, EPUB, spreadsheet, archive and batch operations execute off the UI thread. Those engines need dedicated worker adapters and end-to-end tests before making that claim.

## Local run

```bash
npm run dev:site
```

Open:
- `http://127.0.0.1:5500/tools.html`
- `http://127.0.0.1:5500/presentation-studio.html`
- `http://127.0.0.1:5500/3d-web-studio.html`

External libraries are loaded from CDNs in this prototype. Pin/self-host dependencies and add CSP/SRI policy before production deployment.
