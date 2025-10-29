#!/usr/bin/env bash
set -euo pipefail

echo "=== Starting VigiPastore ==="

# Prepare PostgreSQL data
mkdir -p /var/lib/postgresql/data
chown -R postgres:postgres /var/lib/postgresql

# Detect PostgreSQL version and set bin path dynamically
PG_VERSION=$(ls /usr/lib/postgresql/ | head -1)
export PG_BIN_PATH="/usr/lib/postgresql/${PG_VERSION}/bin"
echo "Using PostgreSQL version: ${PG_VERSION}"

# Init PostgreSQL if not initialized
if [ ! -f "/var/lib/postgresql/data/PG_VERSION" ]; then
  echo "Initializing PostgreSQL..."
  su postgres -c "${PG_BIN_PATH}/initdb -D /var/lib/postgresql/data"
fi

# Ensure DB exists
su postgres -c "${PG_BIN_PATH}/pg_ctl -D /var/lib/postgresql/data -l /tmp/pg.log start"
sleep 2
su postgres -c "psql -U postgres -tc \"SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'\" | grep -q 1 || psql -U postgres -c \"CREATE DATABASE ${DB_NAME};\""

# Run Alembic migrations
export DATABASE_URL="postgresql+asyncpg://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}"
echo "Running Alembic migrations..."
cd /app/backend && alembic upgrade head || echo "Alembic skipped or no migrations."

su postgres -c "${PG_BIN_PATH}/pg_ctl -D /var/lib/postgresql/data stop"

# Launch supervisord (manages postgres, backend, nginx)
echo "Starting supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
