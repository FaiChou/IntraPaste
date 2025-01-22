#!/bin/sh
set -e

# 设置数据库和日志目录权限
chown -R node:node /app/prisma /app/logs
chmod -R 777 /app/logs

# 等待数据库就绪
echo "Waiting for database to be ready..."
npx prisma migrate deploy

# 启动应用
echo "Starting application..."
exec node server.js