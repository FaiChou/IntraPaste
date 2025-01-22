#!/bin/sh
set -e

echo "Ensuring database directory exists..."
mkdir -p prisma

echo "Checking database file status..."
if [ -f "prisma/dev.db" ]; then
    echo "Database file exists at prisma/dev.db"
    ls -l prisma/dev.db
else
    echo "Database file does not exist at prisma/dev.db"
    echo "Current prisma directory contents:"
    ls -la prisma/
fi

echo "Initializing database..."
npx prisma migrate deploy

echo "Starting application..."
exec npm start