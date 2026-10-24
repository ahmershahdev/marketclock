FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

RUN useradd --create-home --uid 10001 app
COPY --chown=app:app . .
USER app

EXPOSE 5000
CMD ["flask", "--app", "wsgi", "run", "--host", "0.0.0.0", "--port", "5000"]
