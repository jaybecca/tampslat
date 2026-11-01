# TAMPslat Design Engine & AI Refinement Upgrade

## Included
- Shared design controls across all nine File Studio workspaces: font family, size, weight, text/heading/accent/background colours and surface treatments.
- File Studio module-level design controls and a preview-first AI refinement workflow.
- Spreadsheet style settings are carried into the styled XLSX export (font, text colour, header colour and row fill); CSV remains plain text by specification.
- Standalone document, ebook, font, presentation, 3D and batch workspaces receive the shared design/AI panel.
- Business & Document Operations has expanded CV, portfolio and statement-of-purpose forms with optional fields for profile, links, achievements, projects, case studies, certifications, references, research interests, programme fit and impact.
- Business & Document AI now requires a user prompt, returns a reviewable preview, and only replaces the current document after explicit acceptance.
- PDF print styling follows the selected typography and colour controls.

## AI connection contract
The UI uses `engines/ai-refinement-client.js`. Configure `window.TAMPSLAT_CONFIG.aiRefinementEndpoint` to a same-origin authenticated server endpoint. The endpoint must accept the client request and return `{ "status": "preview", "preview": { "artifact": { "html": "..." } } }` or an artifact containing `text`. Provider credentials must remain server-side. Without a configured endpoint, the interface reports that AI is not connected and does not fabricate a result.

## Scope and limitations
- Design controls style the active preview; only exporters that explicitly read the design settings preserve those styles in downloaded files. The styled XLSX exporter does. CSV cannot retain formatting.
- Presentation and 3D engines have distinct canvas/scene models; the shared controls style their preview surface, not every individual object in the scene. Their native object-level editors remain authoritative.
- AI output is a preview and requires user acceptance. The client sanitizes HTML where DOMPurify is available. The server must additionally authenticate, rate-limit, validate output, and enforce content/file-size limits.
- CV, portfolio and SOP fields are optional; users decide which details to provide. The tool does not invent employment, qualifications, dates, metrics or references.
