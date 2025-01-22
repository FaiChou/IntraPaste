#!/bin/sh
set -e

# 配置
MAX_RETRIES=5
RETRY_DELAY=5
DB_PATH="/app/prisma/db"
MIGRATION_LOCK="/app/prisma/migration.lock"

# 确保数据库目录存在
mkdir -p "$DB_PATH"

# 等待数据库就绪
wait_for_db() {
    echo "Checking database directory..."
    until [ -w "$DB_PATH" ]; do
        echo "Waiting for database directory to become writable..."
        sleep 2
    done
}

# 运行数据库迁移
run_migrations() {
    echo "Running database migrations..."
    for i in $(seq 1 $MAX_RETRIES); do
        if npx prisma migrate deploy; then
            echo "Migration successful!"
            touch "$MIGRATION_LOCK"
            return 0
        else
            if [ $i -eq $MAX_RETRIES ]; then
                echo "Failed to run migrations after $MAX_RETRIES attempts"
                return 1
            fi
            echo "Migration attempt $i failed. Retrying in $RETRY_DELAY seconds..."
            sleep $RETRY_DELAY
        fi
    done
}

# 主流程
main() {
    wait_for_db
    
    if [ ! -f "$MIGRATION_LOCK" ]; then
        if ! run_migrations; then
            exit 1
        fi
    fi

    echo "Starting application..."
    exec pm2-runtime start ecosystem.config.js
}

main