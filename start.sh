#!/bin/bash
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 创建必要目录并设置权限
prepare_directories() {
    echo -e "${YELLOW}Preparing directories...${NC}"
    
    # 获取当前用户的 UID 和 GID
    USER_ID=$(id -u)
    GROUP_ID=$(id -g)
    
    # 创建目录(如果不存在)
    mkdir -p prisma logs
    
    # 创建数据库文件(如果不存在)
    if [ ! -f prisma/dev.db ]; then
        touch prisma/dev.db
    fi
    
    # 设置目录和文件所有者为当前用户
    if [ -w "prisma" ] && [ -w "logs" ]; then
        # 如果目录可写,确保当前用户拥有
        chown -R $USER_ID:$GROUP_ID prisma logs 2>/dev/null || true
    fi
}

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
    # 使用当前用户的 UID 和 GID 启动容器
    USER_ID=$(id -u)
    GROUP_ID=$(id -g)
    DOCKER_COMPOSE_ARGS="-e USER_ID=$USER_ID -e GROUP_ID=$GROUP_ID"
    docker compose up -d app
    echo -e "${GREEN}Services started successfully!${NC}"
    echo "Web UI: http://localhost:3210"
}

# 主流程
main() {
    check_requirements
    prepare_directories
    load_env
    start_services
}

main