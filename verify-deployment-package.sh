#!/bin/bash
# ===================================================================
# DIABOT Deployment Package Verification Script
# ===================================================================
# Purpose: Verify all required files are present before deployment
# Usage: ./verify-deployment-package.sh
# ===================================================================

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}DIABOT Deployment Package Check${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""

# Function to check file existence
check_file() {
    local file=$1
    local description=$2

    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} Found: $file ($description)"
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $file ($description)"
        return 1
    fi
}

# Function to check directory
check_dir() {
    local dir=$1
    local description=$2

    if [ -d "$dir" ]; then
        local count=$(find "$dir" -type f | wc -l)
        echo -e "${GREEN}✓${NC} Found: $dir ($count files)"
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $dir ($description)"
        return 1
    fi
}

# Track failures
FAILURES=0

echo "Checking deployment configuration files..."
check_file ".env.production" "Production environment config" || FAILURES=$((FAILURES + 1))
check_file "docker-compose.production.yml" "Docker Compose config" || FAILURES=$((FAILURES + 1))
check_file "setup-viettel-vps.sh" "VPS setup script" || FAILURES=$((FAILURES + 1))
check_file "deploy-viettel.sh" "Deployment script" || FAILURES=$((FAILURES + 1))
check_file "DEPLOY_VIETTEL_REPORT.md" "Deployment documentation" || FAILURES=$((FAILURES + 1))
check_file "DEPLOYMENT_PACKAGE_README.md" "Quick start guide" || FAILURES=$((FAILURES + 1))
echo ""

echo "Checking Docker configuration..."
check_file "Dockerfile" "Docker build configuration" || FAILURES=$((FAILURES + 1))
check_file ".dockerignore" "Docker ignore rules" || FAILURES=$((FAILURES + 1))
echo ""

echo "Checking application files..."
check_file "package.json" "Node.js dependencies" || FAILURES=$((FAILURES + 1))
check_file "package-lock.json" "Locked dependencies" || FAILURES=$((FAILURES + 1))
check_file "next.config.js" "Next.js configuration" || FAILURES=$((FAILURES + 1))
check_file "tsconfig.json" "TypeScript configuration" || FAILURES=$((FAILURES + 1))
check_file "tailwind.config.ts" "Tailwind CSS config" || FAILURES=$((FAILURES + 1))
echo ""

echo "Checking source directories..."
check_dir "src" "Application source code" || FAILURES=$((FAILURES + 1))
check_dir "public" "Static assets" || FAILURES=$((FAILURES + 1))
check_dir "scripts" "QA and utility scripts" || FAILURES=$((FAILURES + 1))
check_dir "supabase/migrations" "Database migrations" || FAILURES=$((FAILURES + 1))
echo ""

echo "Checking critical source files..."
check_file "src/app/layout.tsx" "Root layout" || FAILURES=$((FAILURES + 1))
check_file "src/app/page.tsx" "Homepage" || FAILURES=$((FAILURES + 1))
check_file "src/app/api/healthz/route.ts" "Health check endpoint" || FAILURES=$((FAILURES + 1))
check_file "src/lib/supabase/client.ts" "Supabase client" || FAILURES=$((FAILURES + 1))
echo ""

echo "Checking QA scripts..."
check_file "scripts/qa_db.mjs" "Database QA script" || FAILURES=$((FAILURES + 1))
check_file "scripts/qa_storage.mjs" "Storage QA script" || FAILURES=$((FAILURES + 1))
echo ""

echo "Verifying file permissions..."
if [ -f "setup-viettel-vps.sh" ]; then
    if [ -x "setup-viettel-vps.sh" ]; then
        echo -e "${GREEN}✓${NC} setup-viettel-vps.sh is executable"
    else
        echo -e "${YELLOW}⚠${NC} setup-viettel-vps.sh is not executable (run: chmod +x setup-viettel-vps.sh)"
    fi
fi

if [ -f "deploy-viettel.sh" ]; then
    if [ -x "deploy-viettel.sh" ]; then
        echo -e "${GREEN}✓${NC} deploy-viettel.sh is executable"
    else
        echo -e "${YELLOW}⚠${NC} deploy-viettel.sh is not executable (run: chmod +x deploy-viettel.sh)"
    fi
fi
echo ""

echo "Checking environment configuration..."
if [ -f ".env.production" ]; then
    # Check for required variables
    REQUIRED_VARS=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "NODE_ENV"
        "PORT"
    )

    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" .env.production; then
            echo -e "${GREEN}✓${NC} Environment variable: $var"
        else
            echo -e "${RED}✗${NC} Missing environment variable: $var"
            FAILURES=$((FAILURES + 1))
        fi
    done
fi
echo ""

echo "Checking Docker configuration..."
if [ -f "next.config.js" ]; then
    if grep -q "output: 'standalone'" next.config.js; then
        echo -e "${GREEN}✓${NC} Next.js standalone mode enabled"
    else
        echo -e "${RED}✗${NC} Next.js standalone mode not enabled"
        FAILURES=$((FAILURES + 1))
    fi
fi
echo ""

# Summary
echo -e "${BLUE}=================================${NC}"
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    echo -e "${GREEN}Deployment package is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Transfer files to VPS: scp -r * root@171.244.140.161:/root/"
    echo "  2. Run setup: ssh root@171.244.140.161 'cd /root && ./setup-viettel-vps.sh'"
    echo "  3. Deploy app: ssh root@171.244.140.161 'cd /opt/diabot && ./deploy-viettel.sh'"
    echo ""
    exit 0
else
    echo -e "${RED}Found $FAILURES issues!${NC}"
    echo -e "${YELLOW}Please fix the issues above before deployment.${NC}"
    echo ""
    exit 1
fi
