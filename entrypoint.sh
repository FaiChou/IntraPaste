#!/bin/sh
set -e

echo "Running database migrations..."
npx -y prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "Database migration completed successfully"
    exec node server.js
else
    echo "Database migration failed."
    exit 1
fi