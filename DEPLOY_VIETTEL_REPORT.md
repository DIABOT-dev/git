# DIABOT Viettel Cloud VPS Deployment Report

**Date:** 2025-10-06
**Version:** 0.9.0
**Environment:** Staging (Viettel Cloud VPS)
**Status:** Ready for Manual Deployment

---

## Executive Summary

The DIABOT application has been prepared for deployment to Viettel Cloud VPS staging environment at IP address `171.244.140.161`. Due to SSH authentication limitations, a complete deployment package has been created with automated scripts for manual execution on the VPS.

All required configuration files, Docker assets, and deployment automation scripts are ready. The deployment uses Docker containerization with health monitoring, Supabase database integration, and placeholder Viettel S3 configuration.

---

## Deployment Package Contents

### 1. Configuration Files Created

#### `.env.production`
- **Purpose:** Production environment configuration for VPS deployment
- **Supabase:** Uses existing instance (pabdrfkjhzyzdljtyjhs.supabase.co)
- **Storage:** Configured with placeholder Viettel S3 credentials
- **Feature Flags:** Conservative staging settings (demo AI, mock data)
- **Security:** File permissions should be set to 600 on VPS

#### `docker-compose.production.yml`
- **Purpose:** Production Docker Compose orchestration
- **Port Mapping:** 80 (external) → 3000 (internal)
- **Container Name:** diabot-staging
- **Health Check:** Configured via `/api/healthz` endpoint every 30s
- **Resource Limits:** 2 CPU, 2GB RAM limit; 0.5 CPU, 512MB reservation
- **Logging:** 10MB per file, max 3 files
- **Network:** Isolated bridge network `diabot-staging-network`

### 2. Deployment Scripts

#### `setup-viettel-vps.sh`
- **Purpose:** Initial VPS setup and configuration
- **Actions:**
  - System package updates
  - Docker and Docker Compose installation
  - UFW firewall configuration (ports 22, 80, 443)
  - Application directory creation at `/opt/diabot`
  - Node.js 20.x installation for QA scripts
  - System optimizations (file descriptors, network tuning)
  - Docker log rotation configuration
- **Execution:** Run once as root during initial VPS setup
- **Runtime:** ~5-10 minutes

#### `deploy-viettel.sh`
- **Purpose:** Automated application deployment
- **Actions:**
  - Validates required files and Docker installation
  - Stops existing containers
  - Builds Docker image with no cache
  - Starts container on port 80
  - Waits for health check confirmation (max 60s)
  - Tests `/api/healthz` endpoint
  - Displays deployment summary and useful commands
- **Execution:** Run from `/opt/diabot` directory as root
- **Runtime:** ~8-15 minutes (depends on build time)

---

## VPS Environment Specifications

**Provider:** Viettel Cloud
**IP Address:** 171.244.140.161
**User:** root
**Auth:** Password-based (provided separately)
**OS:** Ubuntu 22.04 LTS
**Connectivity:** Verified (189ms average ping latency)

### Network Status
```
PING 171.244.140.161 - SUCCESSFUL
3 packets transmitted, 3 received, 0% packet loss
Average latency: 189ms
```

---

## Docker Configuration

### Dockerfile Analysis
- **Base Image:** node:20-alpine (multi-stage build)
- **Build Stages:** deps → builder → runner
- **Output Mode:** Next.js standalone
- **Security:** Non-root user (nextjs:nodejs, UID 1001)
- **Health Check:** wget to `/api/healthz` every 30s
- **Port:** 3000 (internal)
- **Expected Size:** Target <300MB

### Next.js Configuration
- **Output:** Standalone mode (enabled in next.config.js)
- **Image Optimization:** Unoptimized (images.unoptimized: true)
- **Transpile Packages:** lucide-react
- **Build Timeout:** 120 seconds
- **SWC Minify:** Disabled

---

## Database Configuration

### Supabase Connection
- **URL:** https://pabdrfkjhzyzdljtyjhs.supabase.co
- **Authentication:** Anon key + Service role key configured
- **Status:** Active and accessible
- **Tables:** profiles, glucose_logs, meal_logs, water_logs, insulin_logs, weight_logs, bp_logs
- **RLS:** Enabled on all tables

### QA Script: `scripts/qa_db.mjs`
**Purpose:** Validates Supabase connectivity and table access

**Tests:**
1. Basic connectivity check
2. Critical tables existence validation
3. RLS policy verification

**Expected Output:**
```
[DB-QA] Connection successful (< 100ms)
[DB-QA] Profiles count: N
[DB-QA] All critical tables accessible
[DB-QA] RLS policies active
[DB-QA] Test PASSED
```

---

## Storage Configuration

### Viettel Cloud S3 Status
- **Status:** NOT CONFIGURED (Placeholder values)
- **Provider:** `not_configured`
- **Endpoint:** https://s3.viettelcloud.vn
- **Region:** VN
- **Bucket:** diabot-staging
- **Credentials:** TO_BE_PROVIDED

### QA Script: `scripts/qa_storage.mjs`
**Purpose:** Validates storage configuration and local file operations

**Tests:**
1. Storage provider detection
2. Local file write/read operations
3. Presigned URL generation (mock)

**Expected Output:**
```
[STORAGE-QA] Provider: not_configured
[STORAGE-QA] Local file ops: PASSED
[STORAGE-QA] Presigned URLs: PASSED
[STORAGE-QA] NOTE: Storage not configured - expected before Viettel Cloud subscription
[STORAGE-QA] Overall: PASSED
```

---

## Health Check Endpoint

### `/api/healthz` Implementation
**File:** `src/app/api/healthz/route.ts`

**Health Checks:**
1. **Database:** Supabase connection and query latency
2. **Storage:** Provider configuration validation
3. **Environment:** Required environment variables presence

**Response Format:**
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2025-10-06T...",
  "version": "0.9.0",
  "checks": {
    "database": {
      "status": "ok",
      "latency_ms": 45
    },
    "storage": {
      "status": "not_configured"
    },
    "environment": {
      "status": "ok"
    }
  }
}
```

**HTTP Status Codes:**
- `200 OK`: healthy or degraded
- `503 Service Unavailable`: unhealthy

**Status Determination:**
- **Healthy:** All critical checks pass
- **Degraded:** Storage not configured (acceptable for staging)
- **Unhealthy:** Database or environment check fails

---

## Deployment Instructions

### Phase 1: Initial VPS Setup (One-Time)

1. **Connect to VPS via SSH:**
   ```bash
   ssh root@171.244.140.161
   ```

2. **Create working directory:**
   ```bash
   mkdir -p /root/diabot-deploy
   cd /root/diabot-deploy
   ```

3. **Transfer deployment package to VPS:**
   - Option A: Using SCP
     ```bash
     # From your local machine:
     scp -r /path/to/diabot root@171.244.140.161:/root/diabot-deploy/
     ```

   - Option B: Using Git (if repository is accessible)
     ```bash
     # On VPS:
     cd /root/diabot-deploy
     git clone https://github.com/YOUR_ORG/diabot.git
     cd diabot
     ```

4. **Run VPS setup script:**
   ```bash
   cd /root/diabot-deploy/diabot
   chmod +x setup-viettel-vps.sh
   ./setup-viettel-vps.sh
   ```

   **Expected Duration:** 5-10 minutes

   **Script Actions:**
   - Updates system packages
   - Installs Docker and Docker Compose
   - Configures firewall (UFW)
   - Creates `/opt/diabot` directory
   - Installs Node.js 20.x
   - Applies system optimizations

5. **Verify setup completion:**
   ```bash
   docker --version          # Should show Docker version
   docker-compose --version  # Should show Docker Compose version
   ufw status               # Should show active firewall
   ls -la /opt/diabot       # Should show created directory
   ```

### Phase 2: Application Deployment

1. **Transfer application files to deployment directory:**
   ```bash
   cp -r /root/diabot-deploy/diabot/* /opt/diabot/
   cd /opt/diabot
   ```

2. **Verify required files are present:**
   ```bash
   ls -la /opt/diabot
   ```

   **Required files:**
   - Dockerfile
   - docker-compose.production.yml
   - .env.production
   - package.json
   - package-lock.json
   - next.config.js
   - src/ directory (entire source code)
   - public/ directory (static assets)

3. **Set environment file permissions:**
   ```bash
   chmod 600 /opt/diabot/.env.production
   ```

4. **Run deployment script:**
   ```bash
   cd /opt/diabot
   chmod +x deploy-viettel.sh
   ./deploy-viettel.sh
   ```

   **Expected Duration:** 8-15 minutes (Docker build takes most time)

   **Script Actions:**
   - Validates all required files
   - Stops existing containers (if any)
   - Builds Docker image with no cache
   - Starts container on port 80
   - Waits for health check
   - Tests `/api/healthz` endpoint
   - Displays deployment summary

5. **Monitor deployment progress:**
   ```bash
   # In another terminal:
   docker logs -f diabot-staging
   ```

### Phase 3: Validation and Testing

1. **Verify container is running:**
   ```bash
   docker ps -a --filter "name=diabot-staging"
   ```

   **Expected output:**
   ```
   CONTAINER ID   IMAGE              STATUS         PORTS
   xxxxxx         diabot/app:0.9.0   Up 2 minutes   0.0.0.0:80->3000/tcp
   ```

2. **Check health status:**
   ```bash
   curl http://localhost/api/healthz | jq .
   ```

   **Expected response:**
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-10-06T...",
     "version": "0.9.0",
     "checks": {
       "database": {"status": "ok", "latency_ms": 45},
       "storage": {"status": "not_configured"},
       "environment": {"status": "ok"}
     }
   }
   ```

3. **Run database QA script:**
   ```bash
   docker exec diabot-staging node scripts/qa_db.mjs
   ```

   **Expected output:** All tests PASSED

4. **Run storage QA script:**
   ```bash
   docker exec diabot-staging node scripts/qa_storage.mjs
   ```

   **Expected output:** PASSED (with note about not_configured storage)

5. **Test from external network:**
   ```bash
   # From your local machine:
   curl http://171.244.140.161/api/healthz
   ```

6. **Access application in browser:**
   - Open: http://171.244.140.161
   - Should display DIABOT homepage

---

## Post-Deployment Operations

### View Application Logs
```bash
cd /opt/diabot
docker-compose -f docker-compose.production.yml logs -f
```

### Restart Application
```bash
cd /opt/diabot
docker-compose -f docker-compose.production.yml restart
```

### Stop Application
```bash
cd /opt/diabot
docker-compose -f docker-compose.production.yml down
```

### Access Container Shell
```bash
docker exec -it diabot-staging sh
```

### Check Resource Usage
```bash
docker stats diabot-staging
```

### View Docker Image Size
```bash
docker images | grep diabot
```

---

## Feature Flags Configuration

### Client-Side Flags (Staging)
- `NEXT_PUBLIC_AI_AGENT=demo` - AI in demo mode
- `NEXT_PUBLIC_REWARDS=false` - Rewards disabled
- `NEXT_PUBLIC_BG_SYNC=false` - Background sync disabled
- `NEXT_PUBLIC_REALTIME=false` - Realtime features disabled
- `NEXT_PUBLIC_CHART_USE_DEMO=true` - Use demo chart data
- `NEXT_PUBLIC_CHART_FALLBACK=true` - Enable chart fallback
- `NEXT_PUBLIC_KILL_SWITCH=false` - Application active

### Server-Side Flags (Staging)
- `MEAL_MOCK_MODE=true` - Mock meal data
- `REMINDER_MOCK_MODE=true` - Mock reminders
- `AUTH_DEV_MODE=false` - Production auth mode
- `AI_CACHE_ENABLED=true` - AI response caching enabled
- `AI_GATEWAY_ENABLED=true` - AI gateway active
- `STORAGE_PROVIDER=not_configured` - Storage not configured

**Note:** To change client-side flags, update `.env.production` and rebuild Docker image.

---

## Security Configuration

### Firewall (UFW)
```bash
# View status:
ufw status numbered

# Expected rules:
[1] 22/tcp          ALLOW IN    Anywhere (SSH)
[2] 80/tcp          ALLOW IN    Anywhere (HTTP)
[3] 443/tcp         ALLOW IN    Anywhere (HTTPS)
```

### File Permissions
```bash
/opt/diabot/.env.production   → 600 (rw-------)
/opt/diabot/*.sh              → 755 (rwxr-xr-x)
/opt/diabot/                  → 755 (rwxr-xr-x)
```

### Docker Security
- Container runs as non-root user (nextjs:nodejs, UID 1001)
- Network isolation via bridge network
- Resource limits configured (2 CPU, 2GB RAM)
- Log rotation enabled (10MB × 3 files)

---

## Known Limitations and Future Work

### Current Limitations

1. **Storage Not Configured**
   - Viettel S3 credentials are placeholders
   - File upload features will not work
   - Action: Update `.env.production` when Viettel S3 subscription is active

2. **HTTP Only (No HTTPS)**
   - Currently serving on port 80 (HTTP)
   - SSL certificate not configured
   - Action: Install Nginx reverse proxy and Let's Encrypt certificate

3. **No Domain Name**
   - Accessible via IP address only (171.244.140.161)
   - Action: Configure DNS and update Nginx when domain is ready

4. **Demo/Mock Features**
   - AI agent in demo mode
   - Meal and reminder data mocked
   - Action: Enable production features after testing phase

### Next Steps

1. **Immediate (Post-Deployment):**
   - [ ] Monitor logs for 24 hours
   - [ ] Run full manual QA testing
   - [ ] Document any issues or errors
   - [ ] Test all API endpoints

2. **Short-Term (1-2 weeks):**
   - [ ] Obtain Viettel S3 credentials
   - [ ] Update `.env.production` with real S3 config
   - [ ] Test file upload functionality
   - [ ] Install Nginx reverse proxy
   - [ ] Configure SSL certificate

3. **Medium-Term (1 month):**
   - [ ] Configure custom domain name
   - [ ] Enable production feature flags
   - [ ] Implement monitoring and alerting
   - [ ] Set up automated backups
   - [ ] Load testing and performance optimization

4. **Long-Term (3+ months):**
   - [ ] Implement auto-scaling
   - [ ] Set up staging → production promotion pipeline
   - [ ] Configure CI/CD automation
   - [ ] Implement blue-green deployments

---

## Troubleshooting Guide

### Container Won't Start

**Symptoms:** Container exits immediately or shows "unhealthy" status

**Diagnosis:**
```bash
docker logs diabot-staging
docker inspect diabot-staging | jq '.State'
```

**Common Causes:**
1. Missing environment variables → Check `.env.production`
2. Port 80 already in use → Run `netstat -tlnp | grep :80`
3. Database connection failure → Check Supabase credentials
4. Build errors → Review Docker build logs

**Resolution:**
```bash
# Stop and remove container
docker-compose -f docker-compose.production.yml down

# Rebuild with verbose output
docker-compose -f docker-compose.production.yml build --no-cache

# Start and monitor logs
docker-compose -f docker-compose.production.yml up
```

### Health Check Fails

**Symptoms:** `/api/healthz` returns 503 or connection refused

**Diagnosis:**
```bash
curl -v http://localhost/api/healthz
docker exec diabot-staging wget -qO- http://localhost:3000/api/healthz
```

**Common Causes:**
1. Database unreachable → Test with `qa_db.mjs`
2. Environment variables missing → Check container env
3. Application crashed → Check logs

**Resolution:**
```bash
# Check database connectivity
docker exec diabot-staging node scripts/qa_db.mjs

# View environment variables
docker exec diabot-staging env | grep SUPABASE

# Restart container
docker-compose -f docker-compose.production.yml restart
```

### High Memory Usage

**Symptoms:** Container using excessive memory (>2GB)

**Diagnosis:**
```bash
docker stats diabot-staging
```

**Resolution:**
```bash
# Restart container to free memory
docker-compose -f docker-compose.production.yml restart

# Check for memory leaks in logs
docker logs diabot-staging | grep -i "memory\|heap"

# Reduce resource limits if needed (edit docker-compose.production.yml)
```

### Database Connection Timeout

**Symptoms:** Slow queries or connection timeouts

**Diagnosis:**
```bash
docker exec diabot-staging node scripts/qa_db.mjs
```

**Common Causes:**
1. Network latency to Supabase
2. Supabase service degradation
3. Incorrect credentials

**Resolution:**
- Check Supabase status: https://status.supabase.com
- Verify credentials in `.env.production`
- Test from VPS directly: `curl https://pabdrfkjhzyzdljtyjhs.supabase.co`

### Port 80 Already in Use

**Symptoms:** Docker fails to bind to port 80

**Diagnosis:**
```bash
netstat -tlnp | grep :80
lsof -i :80
```

**Resolution:**
```bash
# Stop conflicting service (e.g., Apache)
systemctl stop apache2

# Or change port in docker-compose.production.yml
# Change "80:3000" to "8080:3000"
```

---

## Performance Metrics (Expected)

### Container Resource Usage
- **CPU:** 5-15% idle, 30-60% under load
- **Memory:** 400-800MB idle, 1-1.5GB under load
- **Startup Time:** 20-40 seconds
- **Image Size:** 200-280MB

### Application Performance
- **Health Check Response:** <100ms
- **Database Query Latency:** 40-80ms (Singapore region)
- **Page Load Time:** <2s (first load), <500ms (cached)

### Network Performance
- **Latency to VPS:** ~190ms (from test location)
- **Latency to Supabase:** ~40-80ms (from VPS)

---

## Cost Estimation

### Viettel Cloud VPS (2 vCPU, 4GB RAM)
- **Monthly:** ~500,000 VND (~$20 USD)
- **Annual:** ~6,000,000 VND (~$240 USD)

### Viettel Cloud S3 (100GB storage)
- **Monthly:** ~200,000 VND (~$8 USD)
- **Transfer:** Usually included

### Total Estimated Monthly Cost
- **VPS + S3:** ~700,000 VND (~$28 USD)

### Supabase (Current Plan)
- **Database:** Free tier or existing subscription
- **No additional cost** for this deployment

---

## Support and Maintenance

### Log Locations
- **Application Logs:** `docker logs diabot-staging`
- **Nginx Logs:** `/var/log/nginx/` (if Nginx installed)
- **Docker Logs:** `/var/lib/docker/containers/`
- **System Logs:** `/var/log/syslog`

### Backup Strategy
1. **Database:** Managed by Supabase (automatic daily backups)
2. **Environment Files:** Backup `/opt/diabot/.env.production` regularly
3. **Docker Images:** Tag and push to registry before updates
4. **Application Files:** Not needed (rebuild from source)

### Monitoring Checklist
- [ ] Health check endpoint every 5 minutes
- [ ] Docker container status monitoring
- [ ] Disk space usage (keep >20% free)
- [ ] Memory usage (alert if >80%)
- [ ] CPU usage (alert if sustained >70%)
- [ ] Log file rotation working
- [ ] Database connection latency

### Update Procedure
1. Pull latest code to `/root/diabot-deploy/diabot`
2. Copy updates to `/opt/diabot`
3. Update `.env.production` if needed
4. Run `./deploy-viettel.sh`
5. Monitor logs for 15 minutes
6. Run QA scripts
7. Test key features manually

---

## Deployment Checklist

### Pre-Deployment
- [x] Dockerfile prepared
- [x] docker-compose.production.yml created
- [x] .env.production configured
- [x] Deployment scripts created (setup + deploy)
- [x] QA scripts verified
- [x] Health check endpoint tested locally
- [x] Supabase credentials validated

### VPS Setup
- [ ] SSH access confirmed
- [ ] setup-viettel-vps.sh executed successfully
- [ ] Docker and Docker Compose installed
- [ ] Firewall configured (ports 22, 80, 443)
- [ ] Application directory created
- [ ] Node.js installed

### Deployment
- [ ] Application files transferred to /opt/diabot
- [ ] File permissions set correctly
- [ ] deploy-viettel.sh executed successfully
- [ ] Container running and healthy
- [ ] Health check endpoint returns 200 OK
- [ ] Database QA script passes
- [ ] Storage QA script passes

### Validation
- [ ] Application accessible at http://171.244.140.161
- [ ] Homepage loads correctly
- [ ] API endpoints responding
- [ ] Logs show no critical errors
- [ ] Resource usage within limits
- [ ] External access confirmed

### Post-Deployment
- [ ] Monitoring configured
- [ ] Logs reviewed for 24 hours
- [ ] Manual QA testing completed
- [ ] Documentation updated
- [ ] Team notified of deployment
- [ ] Rollback plan documented

---

## Conclusion

The DIABOT application is fully prepared for deployment to Viettel Cloud VPS staging environment. All configuration files, deployment scripts, and documentation have been created to ensure a smooth and reliable deployment process.

The deployment package includes automated scripts that handle Docker installation, firewall configuration, application build, and health monitoring. The health check endpoint provides comprehensive system status including database connectivity and environment validation.

**Current Status:** Ready for manual deployment (SSH access required)

**Deployment Method:** Manual execution of provided scripts on VPS

**Expected Duration:**
- Initial setup: 5-10 minutes
- Application deployment: 8-15 minutes
- Total: ~15-25 minutes

**Next Action:** Connect to VPS at 171.244.140.161 and execute deployment scripts in order:
1. `./setup-viettel-vps.sh` (one-time VPS setup)
2. `./deploy-viettel.sh` (application deployment)

**Key Success Indicators:**
- ✓ Docker container running on port 80
- ✓ Health check endpoint returns HTTP 200 with "healthy" status
- ✓ Database QA script passes
- ✓ Application accessible at http://171.244.140.161

---

**Report Generated:** 2025-10-06
**DIABOT Version:** 0.9.0
**Document Version:** 1.0
**Prepared By:** DIABOT DevOps Team
**Next Review:** After successful deployment
