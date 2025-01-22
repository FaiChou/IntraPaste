#!/bin/sh
set -e

echo "Initializing database..."
npx prisma migrate deploy

echo "Starting application..."
exec pm2-runtime start ecosystem.config.js