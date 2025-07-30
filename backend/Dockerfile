FROM python:3.12 AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
WORKDIR /app

RUN python -m venv .venv
COPY pyproject.toml poetry.lock ./
COPY src/ ./src/
COPY wsgi.py ./
RUN .venv/bin/pip install poetry && .venv/bin/poetry install --no-root

FROM python:3.12-slim
WORKDIR /app

# Install system dependencies for psycopg
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/.venv .venv/
COPY . .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 50001

ENV FLASK_APP="wsgi"
ENV FLASK_ENV="development"
ENV FLASK_DEBUG="1"

CMD ["/app/.venv/bin/flask", "run", "--host=0.0.0.0"]