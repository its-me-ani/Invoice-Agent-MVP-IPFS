#!/bin/bash

# ===========================================
# SocialCalc AWS EC2 Deployment Script
# One-command deployment for Docker
# ===========================================

set -e

echo "🚀 SocialCalc Docker Deployment Script"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Installing Docker...${NC}"
    
    # Install Docker on Amazon Linux 2 / Ubuntu
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        if [[ "$ID" == "amzn" ]]; then
            sudo yum update -y
            sudo yum install -y docker
            sudo systemctl start docker
            sudo systemctl enable docker
            sudo usermod -aG docker $USER
        elif [[ "$ID" == "ubuntu" ]]; then
            sudo apt-get update
            sudo apt-get install -y docker.io docker-compose
            sudo systemctl start docker
            sudo systemctl enable docker
            sudo usermod -aG docker $USER
        fi
    fi
    echo -e "${GREEN}✅ Docker installed successfully${NC}"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
fi

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.docker template...${NC}"
    if [ -f .env.docker ]; then
        cp .env.docker .env
        echo -e "${YELLOW}📝 Please edit .env file with your actual credentials before running again.${NC}"
        echo -e "${YELLOW}   Run: nano .env${NC}"
        exit 1
    else
        echo -e "${RED}❌ No .env.docker template found. Please create .env file manually.${NC}"
        exit 1
    fi
fi

# Function to use docker compose (v2) or docker-compose (v1)
docker_compose() {
    if docker compose version &> /dev/null; then
        docker compose "$@"
    else
        docker-compose "$@"
    fi
}

# Parse command line arguments
ACTION=${1:-up}

case $ACTION in
    up|start)
        echo -e "${GREEN}🐳 Starting SocialCalc containers...${NC}"
        docker_compose up -d --build
        echo ""
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        echo -e "${GREEN}🌐 Application is running at: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost'):80${NC}"
        echo ""
        echo "📊 View logs: ./deploy.sh logs"
        echo "🛑 Stop app:  ./deploy.sh stop"
        ;;
    down|stop)
        echo -e "${YELLOW}🛑 Stopping SocialCalc containers...${NC}"
        docker_compose down
        echo -e "${GREEN}✅ Containers stopped${NC}"
        ;;
    restart)
        echo -e "${YELLOW}🔄 Restarting SocialCalc containers...${NC}"
        docker_compose down
        docker_compose up -d --build
        echo -e "${GREEN}✅ Restart complete${NC}"
        ;;
    logs)
        echo -e "${GREEN}📜 Showing logs (Ctrl+C to exit)...${NC}"
        docker_compose logs -f
        ;;
    status)
        echo -e "${GREEN}📊 Container status:${NC}"
        docker_compose ps
        ;;
    clean)
        echo -e "${RED}🧹 Cleaning up all containers and volumes...${NC}"
        docker_compose down -v --rmi all
        echo -e "${GREEN}✅ Cleanup complete${NC}"
        ;;
    *)
        echo "Usage: ./deploy.sh [command]"
        echo ""
        echo "Commands:"
        echo "  up|start    Start the application (default)"
        echo "  down|stop   Stop the application"
        echo "  restart     Restart the application"
        echo "  logs        View application logs"
        echo "  status      Show container status"
        echo "  clean       Remove all containers, volumes, and images"
        ;;
esac
