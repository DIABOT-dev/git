#!/bin/bash
# ===================================================================
# DIABOT Viettel Cloud VPS Initial Setup Script
# ===================================================================
# Version: 0.9.0
# Date: 2025-10-06
# Usage: ./setup-viettel-vps.sh
# Description: Installs Docker, configures firewall, and prepares VPS
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

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}DIABOT VPS Initial Setup${NC}"
echo -e "${BLUE}Viettel Cloud VPS Configuration${NC}"
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

# Display system information
print_info "System Information:"
echo "  Hostname: $(hostname)"
echo "  OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "  Kernel: $(uname -r)"
echo "  IP Address: $(hostname -I | awk '{print $1}')"
echo ""

# Update system packages
print_info "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
print_success "System packages updated"

# Install required packages
print_info "Installing required packages..."
apt-get install -y -qq \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    ufw \
    git \
    wget \
    vim \
    htop \
    net-tools \
    jq
print_success "Required packages installed"

# Install Docker
if command -v docker &> /dev/null; then
    print_warning "Docker is already installed"
    docker --version
else
    print_info "Installing Docker..."
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    sh /tmp/get-docker.sh
    rm /tmp/get-docker.sh
    print_success "Docker installed successfully"
    docker --version
fi

# Install Docker Compose (standalone)
if command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose is already installed"
    docker-compose --version
else
    print_info "Installing Docker Compose..."
    apt-get install -y -qq docker-compose
    print_success "Docker Compose installed successfully"
    docker-compose --version
fi

# Enable and start Docker service
print_info "Enabling Docker service..."
systemctl enable docker
systemctl start docker
print_success "Docker service is running"

# Configure firewall
print_info "Configuring UFW firewall..."
ufw --force reset > /dev/null 2>&1 || true

# Allow SSH (critical - do this first!)
ufw allow 22/tcp
print_success "Allowed SSH (port 22)"

# Allow HTTP and HTTPS
ufw allow 80/tcp
print_success "Allowed HTTP (port 80)"

ufw allow 443/tcp
print_success "Allowed HTTPS (port 443)"

# Enable firewall
ufw --force enable
print_success "UFW firewall enabled"

# Show firewall status
print_info "Firewall status:"
ufw status numbered

# Create application directory
print_info "Creating application directory..."
mkdir -p "$APP_DIR"
cd "$APP_DIR"
print_success "Application directory created: $APP_DIR"

# Set proper permissions
chmod 755 "$APP_DIR"

# Display Docker info
print_info "Docker system information:"
docker info | grep -E "Server Version|Operating System|Total Memory|CPUs"

# Create directory structure
print_info "Creating directory structure..."
mkdir -p "$APP_DIR/logs"
mkdir -p "$APP_DIR/backups"
print_success "Directory structure created"

# Install Node.js (for QA scripts)
if command -v node &> /dev/null; then
    print_warning "Node.js is already installed"
    node --version
else
    print_info "Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y -qq nodejs
    print_success "Node.js installed successfully"
    node --version
    npm --version
fi

# System optimization for production
print_info "Applying system optimizations..."

# Increase file descriptor limits
cat >> /etc/security/limits.conf << EOF
*                soft    nofile          65536
*                hard    nofile          65536
root             soft    nofile          65536
root             hard    nofile          65536
EOF

# Configure sysctl for network performance
cat >> /etc/sysctl.conf << EOF

# DIABOT Production Optimizations
net.core.somaxconn = 4096
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.ip_local_port_range = 1024 65535
net.core.netdev_max_backlog = 5000
EOF

sysctl -p > /dev/null 2>&1
print_success "System optimizations applied"

# Configure log rotation for Docker
print_info "Configuring Docker log rotation..."
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

systemctl restart docker
print_success "Docker log rotation configured"

# Display summary
echo ""
echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}VPS Setup Complete!${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""
echo "Summary:"
echo "  ✓ Docker installed and running"
echo "  ✓ Docker Compose installed"
echo "  ✓ UFW firewall configured (ports 22, 80, 443)"
echo "  ✓ Application directory: $APP_DIR"
echo "  ✓ System optimizations applied"
echo "  ✓ Node.js installed for QA scripts"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Transfer DIABOT application files to $APP_DIR"
echo "  2. Ensure the following files are present:"
echo "     - Dockerfile"
echo "     - docker-compose.production.yml"
echo "     - .env.production"
echo "     - package.json and package-lock.json"
echo "     - All source code in src/"
echo "  3. Run: cd $APP_DIR && ./deploy-viettel.sh"
echo ""
print_info "Current directory: $(pwd)"
print_info "Ready for deployment!"
echo ""
