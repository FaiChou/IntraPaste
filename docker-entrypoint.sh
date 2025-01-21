#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec pm2-runtime start ecosystem.config.js --node-args="--experimental-loader=next/dist/compiled/babel-loader.js" 