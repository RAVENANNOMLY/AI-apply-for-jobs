FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_LINK_MODE=copy

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project 

COPY cv_editing_react_app/backend ./cv_editing_react_app/backend

WORKDIR /app/cv_editing_react_app/backend
ENV PATH="/app/.venv/bin:$PATH" \
    DATABASE_URL="sqlite:////data/jobs.db"

RUN mkdir -p /data rendered_pdf ../job_listings

EXPOSE 8000
CMD ["uvicorn", "api.server:app", "--host", "0.0.0.0", "--port", "8000"]