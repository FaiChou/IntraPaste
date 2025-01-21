#!/bin/bash

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    exit 1
fi

# 读取 MINIO_ENDPOINT 配置，排除注释行
MINIO_ENDPOINT=$(grep -v '^#' .env | grep MINIO_ENDPOINT | cut -d '=' -f2)

# 根据 MINIO_ENDPOINT 决定启动模式
if [[ $MINIO_ENDPOINT == "http://minio" ]]; then
    echo "Using built-in MinIO service..."
    docker compose --profile with-minio up -d
else
    echo "Using external MinIO service at $MINIO_ENDPOINT"
    docker compose up -d app
fi 