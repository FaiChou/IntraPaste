#!/bin/sh
set -e

echo "Ensuring database directory exists..."
mkdir -p prisma

echo "Initializing database..."
npx prisma migrate deploy

echo "Starting application..."
exec npm start