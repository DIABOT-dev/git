# DIABOT Viettel Cloud VPS Deployment Package

## Quick Start Guide

This deployment package contains everything needed to deploy DIABOT v0.9.0 to Viettel Cloud VPS.

### Package Contents

1. **`.env.production`** - Production environment configuration
2. **`docker-compose.production.yml`** - Docker orchestration for VPS
3. **`setup-viettel-vps.sh`** - Initial VPS setup script
4. **`deploy-viettel.sh`** - Application deployment script
5. **`DEPLOY_VIETTEL_REPORT.md`** - Complete deployment documentation

### Prerequisites

- Viettel Cloud VPS (Ubuntu 22.04)
- IP: 171.244.140.161
- Root SSH access
- Internet connectivity

### Deployment Steps

#### Step 1: Transfer Files to VPS

```bash
# From your local machine:
scp -r .env.production docker-compose.production.yml setup-viettel-vps.sh \
       deploy-viettel.sh root@171.244.140.161:/root/
```

Or use Git:
```bash
# On VPS:
git clone https://github.com/YOUR_ORG/diabot.git /opt/diabot
```

#### Step 2: Run VPS Setup (One-Time)

```bash
# On VPS:
cd /root
chmod +x setup-viettel-vps.sh
./setup-viettel-vps.sh
```

**Duration:** ~5-10 minutes

**Actions:**
- Installs Docker & Docker Compose
- Configures firewall (ports 22, 80, 443)
- Creates `/opt/diabot` directory
- Installs Node.js for QA scripts
- Applies system optimizations

#### Step 3: Deploy Application

```bash
# On VPS:
# Copy all project files to /opt/diabot
cp -r /root/diabot/* /opt/diabot/
cd /opt/diabot

# Set permissions
chmod 600 .env.production
chmod +x deploy-viettel.sh

# Run deployment
./deploy-viettel.sh
```

**Duration:** ~8-15 minutes (Docker build)

**Actions:**
- Validates required files
- Builds Docker image
- Starts container on port 80
- Runs health checks
- Tests API endpoints

#### Step 4: Verify Deployment

```bash
# On VPS:
docker ps -a --filter "name=diabot-staging"
curl http://localhost/api/healthz | jq .

# Run QA scripts:
docker exec diabot-staging node scripts/qa_db.mjs
docker exec diabot-staging node scripts/qa_storage.mjs
```

#### Step 5: Test from External Network

```bash
# From your local machine:
curl http://171.244.140.161/api/healthz

# Or open in browser:
# http://171.244.140.161
```

### Expected Results

✅ **Container Status:** Running on port 80
✅ **Health Check:** HTTP 200 with "healthy" status
✅ **Database QA:** All tests PASSED
✅ **Storage QA:** PASSED (not_configured is expected)
✅ **Homepage:** Accessible at http://171.244.140.161

### Useful Commands

```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart application
docker-compose -f docker-compose.production.yml restart

# Stop application
docker-compose -f docker-compose.production.yml down

# Access container shell
docker exec -it diabot-staging sh

# Check resource usage
docker stats diabot-staging
```

### Troubleshooting

**Container won't start:**
```bash
docker logs diabot-staging
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up
```

**Health check fails:**
```bash
docker exec diabot-staging node scripts/qa_db.mjs
docker exec diabot-staging wget -qO- http://localhost:3000/api/healthz
```

**Port 80 in use:**
```bash
netstat -tlnp | grep :80
# Stop conflicting service or change port in docker-compose.production.yml
```

### Next Steps

1. Monitor logs for 24 hours
2. Run full QA testing
3. Update Viettel S3 credentials when available
4. Install Nginx reverse proxy for HTTPS
5. Configure custom domain name

### Support

For detailed documentation, see **DEPLOY_VIETTEL_REPORT.md**

---

**Version:** 0.9.0
**Date:** 2025-10-06
**Status:** Ready for Deployment
