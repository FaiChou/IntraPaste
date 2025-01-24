#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

load_env() {
    if [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
    fi
}

start_services() {
    echo -e "${YELLOW}Starting IntraPaste services...${NC}"
    docker compose up -d
    echo -e "${GREEN}Services started successfully!${NC}"
    echo "Web UI: http://localhost:3210"
}

main() {
    check_requirements
    load_env
    start_services
}

main