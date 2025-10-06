#!/bin/bash
# ===================================================================
# DIABOT Viettel Cloud VPS Deployment Script
# ===================================================================
# Version: 0.9.0
# Date: 2025-10-06
# Usage: ./deploy-viettel.sh
# ===================================================================

set -e  # Exit on any error

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/diabot"
APP_VERSION="0.9.0"
COMPOSE_FILE="docker-compose.production.yml"

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}DIABOT Deployment to Viettel VPS${NC}"
echo -e "${BLUE}Version: ${APP_VERSION}${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root"
    exit 1
fi

# Check if application directory exists
if [ ! -d "$APP_DIR" ]; then
    print_error "Application directory $APP_DIR does not exist"
    print_info "Please run setup-viettel-vps.sh first"
    exit 1
fi

cd "$APP_DIR"

# Check required files
print_info "Checking required files..."
REQUIRED_FILES=("Dockerfile" "$COMPOSE_FILE" ".env.production" "package.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file missing: $file"
        exit 1
    fi
    print_success "Found: $file"
done

# Check Docker installation
print_info "Verifying Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    print_info "Please run setup-viettel-vps.sh first"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed"
    print_info "Please run setup-viettel-vps.sh first"
    exit 1
fi
print_success "Docker is installed"

# Show Docker version
DOCKER_VERSION=$(docker --version)
print_info "Docker version: $DOCKER_VERSION"

# Stop existing container if running
print_info "Stopping existing containers..."
if docker ps -q --filter "name=diabot-staging" | grep -q .; then
    docker-compose -f "$COMPOSE_FILE" down
    print_success "Existing containers stopped"
else
    print_info "No existing containers running"
fi

# Build Docker image
print_info "Building Docker image..."
print_info "This may take 5-10 minutes..."
docker-compose -f "$COMPOSE_FILE" build --no-cache

# Check image size
IMAGE_SIZE=$(docker images diabot/app:0.9.0 --format "{{.Size}}")
print_info "Docker image size: $IMAGE_SIZE"

# Start container
print_info "Starting DIABOT container..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for container to be healthy
print_info "Waiting for container to be healthy (max 60 seconds)..."
RETRY_COUNT=0
MAX_RETRIES=12
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    sleep 5
    RETRY_COUNT=$((RETRY_COUNT + 1))

    HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' diabot-staging 2>/dev/null || echo "unknown")

    if [ "$HEALTH_STATUS" = "healthy" ]; then
        print_success "Container is healthy!"
        break
    elif [ "$HEALTH_STATUS" = "unhealthy" ]; then
        print_error "Container is unhealthy!"
        print_info "Showing last 20 lines of logs:"
        docker-compose -f "$COMPOSE_FILE" logs --tail=20
        exit 1
    else
        echo -ne "\r${BLUE}[INFO]${NC} Health check status: $HEALTH_STATUS (attempt $RETRY_COUNT/$MAX_RETRIES)"
    fi
done
echo ""

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    print_warning "Health check timeout - container may still be starting"
fi

# Show container status
print_info "Container status:"
docker ps -a --filter "name=diabot-staging" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Test healthz endpoint
print_info "Testing healthz endpoint..."
sleep 3
HEALTHZ_RESPONSE=$(curl -s http://localhost/api/healthz || echo "FAILED")

if echo "$HEALTHZ_RESPONSE" | grep -q "healthy"; then
    print_success "Healthz endpoint returned healthy status"
    echo "$HEALTHZ_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HEALTHZ_RESPONSE"
else
    print_error "Healthz endpoint test failed"
    echo "Response: $HEALTHZ_RESPONSE"
    print_info "Showing container logs:"
    docker-compose -f "$COMPOSE_FILE" logs --tail=30
    exit 1
fi

# Summary
echo ""
echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}Deployment Successful!${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""
echo -e "Application URL: ${BLUE}http://171.244.140.161${NC}"
echo -e "Health Check: ${BLUE}http://171.244.140.161/api/healthz${NC}"
echo -e "Container Name: ${BLUE}diabot-staging${NC}"
echo -e "Image Version: ${BLUE}$APP_VERSION${NC}"
echo ""
echo "Useful commands:"
echo "  View logs:     docker-compose -f $COMPOSE_FILE logs -f"
echo "  Restart:       docker-compose -f $COMPOSE_FILE restart"
echo "  Stop:          docker-compose -f $COMPOSE_FILE down"
echo "  Shell access:  docker exec -it diabot-staging sh"
echo ""
print_info "To run QA scripts:"
echo "  docker exec diabot-staging node scripts/qa_db.mjs"
echo "  docker exec diabot-staging node scripts/qa_storage.mjs"
echo ""
