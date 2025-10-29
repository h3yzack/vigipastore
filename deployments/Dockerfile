# ---------------------------
# Stage 1: Build Frontend
# ---------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --silent

# Install Python and dependencies for key generation
RUN apk add --no-cache python3 py3-pip && \
    pip install --break-system-packages cryptography

# Copy the key generation script
COPY backend/generate-keys.py /app/generate-keys.py

# Generate keys and append VITE_SERVER_PUBLIC_KEY to .env.production.local
RUN python3 /app/generate-keys.py > /tmp/keys.env && \
    grep VITE_SERVER_PUBLIC_KEY /tmp/keys.env >> /app/frontend/.env.production.local

COPY frontend/ .

RUN npm run build


# ================================================
# Stage 2: Setup Python backend with PostgreSQL client
# ================================================
FROM python:3.11-slim AS final
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql postgresql-contrib \
    supervisor nginx \
    curl \
    ca-certificates \
    build-essential \
    libpq-dev \
    libopaque-dev \
    libopaque0 \
    libopaque-bin \
    && rm -rf /var/lib/apt/lists/*


# Copy backend code & requirements
COPY backend /app/backend
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

RUN rm -f /app/backend/.env

# Copy Alembic config
COPY backend/alembic.ini /app/backend/alembic.ini
COPY backend/alembic /app/backend/alembic

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Generate dynamic keys and inject into frontend/backend
RUN python3 /app/backend/generate-keys.py > /tmp/keys.env && \
    grep -E "SERVER_KEY|API_SECRET_KEY" /tmp/keys.env >> /app/backend/.env


# Copy configs
COPY deployments/nginx.conf /etc/nginx/conf.d/default.conf
COPY deployments/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY deployments/start.sh /start.sh
RUN chmod +x /start.sh

# Environment defaults (user can override)
ENV DB_HOST=localhost \
    DB_PORT=5432 \
    DB_USER=postgres \
    DB_PASS=postgres \
    DB_NAME=vigipastore \
    APP_VERSION=1.0.0

EXPOSE 8080
CMD ["/start.sh"]