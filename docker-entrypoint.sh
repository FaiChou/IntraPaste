#!/bin/sh
set -e

# 等待数据库就绪
echo "Waiting for database to be ready..."
npx prisma migrate deploy

# 启动应用
echo "Starting application..."
exec node server.js