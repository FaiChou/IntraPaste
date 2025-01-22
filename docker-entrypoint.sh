#!/bin/sh
set -e

MAX_RETRIES=5
RETRY_DELAY=5

echo "Running database migrations..."
for i in $(seq 1 $MAX_RETRIES); do
    if npx prisma migrate deploy; then
        echo "Migration successful!"
        break
    else
        if [ $i -eq $MAX_RETRIES ]; then
            echo "Failed to run migrations after $MAX_RETRIES attempts"
            exit 1
        fi
        echo "Migration attempt $i failed. Retrying in $RETRY_DELAY seconds..."
        sleep $RETRY_DELAY
    fi
done

echo "Starting application..."
exec pm2-runtime start ecosystem.config.js --node-args="--experimental-loader=next/dist/compiled/babel-loader.js" 