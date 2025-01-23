#!/bin/sh
set -e

echo "Waiting for database to be ready..."
if npx -y prisma migrate deploy 2>&1; then
    echo "Database migration completed successfully"
else
    echo "Database migration failed.
    exit 1
fi

echo "Starting application..."
exec node server.js