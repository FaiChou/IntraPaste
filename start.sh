#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_requirements() {
    if ! command -v docker compose &> /dev/null; then
        echo -e "${RED}Error: docker compose not found!${NC}"
        echo "Please install Docker first."
        exit 1
    fi
}

start_services() {
    echo -e "${YELLOW}Starting IntraPaste services...${NC}"
    docker compose up -d
    echo -e "${GREEN}Services started successfully!${NC}"
    echo "Web UI: http://localhost:3210"
    echo "Admin: http://localhost:3210/admin (default password: admin)"
}

main() {
    start_time=$(date +%s)
    
    check_requirements
    start_services
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    echo -e "${GREEN}Total execution time: ${duration} seconds${NC}"
}

main