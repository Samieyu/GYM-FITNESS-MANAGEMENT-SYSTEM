#!/usr/bin/env bash
# ==============================================================================
# SWEATBOX FITNESS - ORACLE CLOUD AUTOMATED DEPLOYMENT SCRIPT
# ==============================================================================
set -e

echo "🚀 Starting SWEATBOX Production Deployment on Oracle Cloud..."

# 1. Check if .env exists
if [ ! -f .env ]; then
  if [ -f .env.production.example ]; then
    echo "⚠️  .env file not found. Copying from .env.production.example..."
    cp .env.production.example .env
    echo "❗ Please edit .env with your real production secrets before running in production!"
  fi
fi

# 2. Pull latest images and build production containers
echo "📦 Building and starting containers..."
docker compose -f docker-compose.prod.yml down --remove-orphans || true
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# 3. Wait for database healthcheck
echo "⏳ Waiting for PostgreSQL database to become healthy..."
docker compose -f docker-compose.prod.yml exec -T postgres sh -c 'until pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do sleep 2; done'
echo "✅ Database is ready."

# 4. Run database migrations inside backend container
echo "🔄 Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T backend npm run migrate

# 5. Check if seed is desired (optional)
if [ "$1" == "--seed" ]; then
  echo "🌱 Seeding initial demo data and user accounts..."
  docker compose -f docker-compose.prod.yml exec -T backend npm run seed
fi

# 6. Verify container status
echo "📊 Checking active containers:"
docker compose -f docker-compose.prod.yml ps

echo "🎉 Deployment completed successfully!"
echo "👉 Open your browser at http://$(curl -s ifconfig.me || echo 'YOUR_SERVER_IP')"
