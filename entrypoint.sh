#!/bin/sh
set -e

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Running database migrations..."

ls -al /app/prisma

mkdir -p /app/prisma
chmod -R 777 /app/prisma

chown -R node:node /app/prisma

npx -y prisma migrate deploy 2>&1

if [ $? -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Database migration completed successfully"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting application server..."
    exec node server.js
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Database migration failed"
    exit 1
fi