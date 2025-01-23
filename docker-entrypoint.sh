#!/bin/sh
set -e

echo "Waiting for database to be ready..."
if npx -y prisma migrate deploy 2>&1 | tee /app/logs/prisma-migrate.log; then
    echo "Database migration completed successfully"
else
    echo "Database migration failed. Check logs at /app/logs/prisma-migrate.log"
    cat /app/logs/prisma-migrate.log
    exit 1
fi

echo "Starting application..."
exec node server.js