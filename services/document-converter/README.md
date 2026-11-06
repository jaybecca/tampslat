# TAMPslat document conversion service

The source for the Universal Document Converter is included in this repository. It is a separate Docker service; it does not execute inside the Cloudflare Worker.

## Start locally

From the repository root:

```bash
docker compose up --build -d document-converter
docker compose ps
curl http://127.0.0.1:8788/health
```

The service uses LibreOffice for Office/OpenDocument conversions, Ghostscript and Poppler for PDF operations, and qpdf for AES-256 password protection. The default upload limit is 50 MiB.

## Connect TAMPslat

On a locally served development copy of TAMPslat, set the converter URL to `http://127.0.0.1:8788` and use **Check engine** before converting.

The production TAMPslat website is HTTPS. Browsers block calls from an HTTPS page to a plain HTTP localhost service, and a localhost address refers to each visitor's own device. For production use, deploy this container to a trusted container host behind HTTPS, authentication, rate limiting and resource limits, then enter that HTTPS service URL in the converter interface. Do not expose this container publicly without those controls.

The converter API is a separate service and is not automatically deployed by `npx wrangler deploy`.
