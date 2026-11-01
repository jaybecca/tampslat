FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends libreoffice-writer libreoffice-calc libreoffice-impress libreoffice-draw poppler-utils ghostscript qpdf python3 python3-venv fonts-liberation fonts-dejavu-core && rm -rf /var/lib/apt/lists/*
COPY requirements.txt /tmp/pdf-requirements.txt
RUN python3 -m venv /opt/pdfenv && /opt/pdfenv/bin/pip install --no-cache-dir -r /tmp/pdf-requirements.txt
WORKDIR /srv/tampslat-converter
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./
COPY pdf ./pdf
RUN useradd --system --uid 10001 --create-home appuser && mkdir -p /tmp/tampslat-convert && chown -R appuser:appuser /srv/tampslat-converter /tmp/tampslat-convert
USER appuser
ENV PORT=8788 MAX_UPLOAD_BYTES=52428800
EXPOSE 8788
CMD ["node","server.js"]
