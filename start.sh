#!/bin/bash
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查必要文件
check_requirements() {
    if [ ! -f .env ]; then
        echo -e "${RED}Error: .env file not found!${NC}"
        echo "Please copy .env.example to .env and configure it."
        exit 1
    fi

    if ! command -v docker compose &> /dev/null; then
        echo -e "${RED}Error: docker compose not found!${NC}"
        echo "Please install Docker and docker compose."
        exit 1
    fi
}

# 读取环境变量
load_env() {
    if [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
    fi
}

# 启动服务
start_services() {
    echo -e "${YELLOW}Starting IntraPaste services...${NC}"
    
    if [[ "${MINIO_ENDPOINT}" == "http://minio" ]]; then
        echo -e "${GREEN}Using built-in MinIO service...${NC}"
        docker compose --profile with-minio up -d
    else
        echo -e "${GREEN}Using external MinIO service at ${MINIO_ENDPOINT}${NC}"
        docker compose up -d app
    fi

    echo -e "${GREEN}Services started successfully!${NC}"
    echo "Web UI: http://localhost:3210"
    
    if [[ "${MINIO_ENDPOINT}" == "http://minio" ]]; then
        echo "MinIO Console: http://localhost:9002"
    fi
}

# 主流程
main() {
    check_requirements
    load_env
    start_services
}

main