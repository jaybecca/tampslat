FROM python:3.12-slim
WORKDIR /srv/font-compiler
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && useradd --system --uid 10002 appuser
COPY app.py .
USER appuser
ENV PORT=8790
EXPOSE 8790
CMD ["sh","-c","uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
