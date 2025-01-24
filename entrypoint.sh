#!/bin/sh
set -e

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Running database migrations..."

if [ ! -w /app/prisma/dev.db ]; then
    echo "Error: Database file is not writable by current user ($(id -u):$(id -g))"
    echo "Please ensure the file permissions are correct"
    exit 1
fi

npx -y prisma migrate deploy 2>&1

if [ $? -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Database migration completed successfully"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting application server..."
    exec node server.js
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Database migration failed"
    exit 1
fi