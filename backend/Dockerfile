FROM python:3.11-slim AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    DEBIAN_FRONTEND=noninteractive

# Fix for Hash Sum mismatch + WSL issues
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    echo 'Acquire::Retries "3";' > /etc/apt/apt.conf.d/80-retries && \
    echo 'Acquire::http::Pipeline-Depth "0";' > /etc/apt/apt.conf.d/99fixbadproxy && \
    echo 'Acquire::http::No-Cache "true";' >> /etc/apt/apt.conf.d/99fixbadproxy && \
    echo 'Acquire::BrokenProxy "true";' >> /etc/apt/apt.conf.d/99fixbadproxy && \
    apt-get update -o Acquire::CompressionTypes::Order::=gz && \
    apt-get install -y --no-install-recommends gcc libpq-dev curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /wheels -r requirements.txt

FROM python:3.11-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    DEBIAN_FRONTEND=noninteractive

# Same apt fixes for runtime stage
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    echo 'Acquire::Retries "3";' > /etc/apt/apt.conf.d/80-retries && \
    echo 'Acquire::http::Pipeline-Depth "0";' > /etc/apt/apt.conf.d/99fixbadproxy && \
    echo 'Acquire::http::No-Cache "true";' >> /etc/apt/apt.conf.d/99fixbadproxy && \
    apt-get update -o Acquire::CompressionTypes::Order::=gz && \
    apt-get install -y --no-install-recommends libpq5 curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && \
    rm -rf /wheels

COPY . .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--proxy-headers", "--forwarded-allow-ips", "*"]






# FROM python:3.11-slim AS builder

# WORKDIR /app

# ENV PYTHONDONTWRITEBYTECODE=1 \
#     PYTHONUNBUFFERED=1 \
#     PIP_NO_CACHE_DIR=1

# RUN apt-get update && \
#     apt-get install -y --no-install-recommends gcc libpq-dev curl && \
#     apt-get clean && \
#     rm -rf /var/lib/apt/lists/*

# COPY requirements.txt .
# RUN pip wheel --no-cache-dir --no-deps --wheel-dir /wheels -r requirements.txt

# FROM python:3.11-slim AS runtime

# WORKDIR /app

# ENV PYTHONDONTWRITEBYTECODE=1 \
#     PYTHONUNBUFFERED=1 \
#     PYTHONPATH=/app

# RUN apt-get update && \
#     apt-get install -y --no-install-recommends libpq-dev curl && \
#     apt-get clean && \
#     rm -rf /var/lib/apt/lists/*

# COPY --from=builder /wheels /wheels
# RUN pip install --no-cache-dir /wheels/* && \
#     rm -rf /wheels

# COPY . .

# EXPOSE 8000

# HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
#     CMD curl -f http://localhost:8000/health || exit 1

# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--proxy-headers", "--forwarded-allow-ips", "*"]
