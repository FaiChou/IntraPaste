#!/bin/sh
set -e

# 设置数据库和日志目录权限
chown -R node:node /app/prisma /app/logs
chmod -R 777 /app/logs

# 等待数据库就绪并执行迁移
echo "Waiting for database to be ready..."
if NODE_ENV=production npx -y prisma migrate deploy 2>&1 | tee /app/logs/prisma-migrate.log; then
    echo "Database migration completed successfully"
else
    echo "Database migration failed. Check logs at /app/logs/prisma-migrate.log"
    cat /app/logs/prisma-migrate.log
    exit 1
fi

# 启动应用
echo "Starting application..."
exec node server.js