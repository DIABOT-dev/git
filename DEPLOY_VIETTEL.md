# DIABOT Viettel Cloud Deployment Guide

Step-by-step guide for deploying DIABOT to Viettel Cloud VPS with S3 storage integration.

## Prerequisites

### Required Services

1. **Viettel Cloud VPS** (recommended: 2 vCPU, 4GB RAM)
2. **Viettel Cloud S3** (optional, for file storage)
3. **Supabase Database** (existing setup)
4. **GitHub Container Registry** access

### Required Tools

- SSH client
- Docker & Docker Compose
- Git (optional, for code deployment)

## Phase 1: VPS Setup

### 1.1 Connect to VPS

```bash
ssh root@YOUR_VPS_IP
```

### 1.2 Install Docker

```bash
# Update system
apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get install -y docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 1.3 Create Application Directory

```bash
mkdir -p /opt/diabot
cd /opt/diabot
```

### 1.4 Configure Firewall

```bash
# Allow SSH (port 22)
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow Docker internal network
ufw allow from 172.16.0.0/12 to any

# Enable firewall
ufw --force enable

# Check status
ufw status
```

## Phase 2: Environment Configuration

### 2.1 Create Environment File

```bash
cd /opt/diabot
nano .env.production
```

Add the following configuration:

```bash
# Application
NODE_ENV=production
PORT=3000
APP_VERSION=0.9.0
TZ=Asia/Ho_Chi_Minh

# Supabase (replace with your credentials)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Storage (Viettel Cloud S3)
STORAGE_PROVIDER=viettel
S3_ENDPOINT=https://s3.viettelcloud.vn
S3_REGION=VN
S3_BUCKET=diabot-production
S3_ACCESS_KEY=YOUR_VIETTEL_ACCESS_KEY
S3_SECRET_KEY=YOUR_VIETTEL_SECRET_KEY

# Feature Flags (production settings)
NEXT_PUBLIC_AI_AGENT=live
NEXT_PUBLIC_REWARDS=true
NEXT_PUBLIC_BG_SYNC=true
NEXT_PUBLIC_REALTIME=true
NEXT_PUBLIC_CHART_USE_DEMO=false
NEXT_PUBLIC_CHART_FALLBACK=true
NEXT_PUBLIC_KILL_SWITCH=false

# Server-side flags
MEAL_MOCK_MODE=false
REMINDER_MOCK_MODE=false
AUTH_DEV_MODE=false
AI_CACHE_ENABLED=true
AI_BUDGET_ENABLED=true
AI_GATEWAY_ENABLED=true
```

Set secure permissions:
```bash
chmod 600 .env.production
```

### 2.2 Viettel Cloud S3 Setup

**Note**: This section requires active Viettel Cloud subscription. If credentials are not yet available, use `STORAGE_PROVIDER=not_configured`.

#### Create S3 Bucket

1. Login to Viettel Cloud Portal
2. Navigate to Object Storage > Buckets
3. Create new bucket: `diabot-production`
4. Set region: `VN`
5. Configure bucket policy (private by default)

#### Generate API Credentials

1. Navigate to IAM > API Keys
2. Create new key pair
3. Copy Access Key and Secret Key
4. Update `.env.production` with credentials

#### Test S3 Connectivity

```bash
# On VPS
docker run --rm \
  -e S3_ENDPOINT=https://s3.viettelcloud.vn \
  -e S3_ACCESS_KEY=your-key \
  -e S3_SECRET_KEY=your-secret \
  amazon/aws-cli s3 ls s3://diabot-production --endpoint-url=https://s3.viettelcloud.vn
```

## Phase 3: Docker Deployment

### 3.1 Login to GitHub Container Registry

```bash
# Generate GitHub Personal Access Token (PAT)
# Scopes: read:packages

# Login
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### 3.2 Create Docker Compose File

```bash
cd /opt/diabot
nano docker-compose.yml
```

```yaml
version: "3.9"

services:
  diabot:
    image: ghcr.io/YOUR_ORG/diabot:0.9.0
    container_name: diabot
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:3000/api/healthz"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 20s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - diabot-network

networks:
  diabot-network:
    driver: bridge
```

### 3.3 Pull and Start Application

```bash
# Pull latest image
docker-compose pull

# Start application
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f diabot
```

### 3.4 Verify Deployment

```bash
# Check health endpoint
curl http://localhost:3000/api/healthz

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2025-10-06T...",
#   "version": "0.9.0",
#   "checks": {
#     "database": { "status": "ok", "latency_ms": 45 },
#     "storage": { "status": "ok", "provider": "viettel" },
#     "environment": { "status": "ok" }
#   }
# }
```

## Phase 4: Reverse Proxy (Nginx)

### 4.1 Install Nginx

```bash
apt-get install -y nginx
```

### 4.2 Configure Nginx

```bash
nano /etc/nginx/sites-available/diabot
```

```nginx
upstream diabot_app {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://diabot_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint (skip auth)
    location /api/healthz {
        proxy_pass http://diabot_app;
        access_log off;
    }

    # Static files cache
    location /_next/static {
        proxy_pass http://diabot_app;
        proxy_cache_valid 200 1d;
        add_header Cache-Control "public, max-age=86400, immutable";
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/diabot /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 4.3 SSL Certificate (Certbot)

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Generate certificate
certbot --nginx -d your-domain.com

# Auto-renewal (already configured by certbot)
certbot renew --dry-run
```

## Phase 5: Monitoring & Maintenance

### 5.1 Health Monitoring

Create monitoring script:
```bash
nano /opt/diabot/healthcheck.sh
```

```bash
#!/bin/bash
URL="http://localhost:3000/api/healthz"
SLACK_WEBHOOK="YOUR_SLACK_WEBHOOK_URL"

response=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ "$response" != "200" ]; then
    message="DIABOT Health Check FAILED (HTTP $response)"
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"$message\"}" \
        $SLACK_WEBHOOK
fi
```

Add to crontab:
```bash
chmod +x /opt/diabot/healthcheck.sh
crontab -e

# Add:
*/5 * * * * /opt/diabot/healthcheck.sh
```

### 5.2 Log Management

View logs:
```bash
# Application logs
docker-compose logs -f --tail=100 diabot

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

Rotate logs:
```bash
# Already configured via docker-compose logging options
# Check size: docker inspect diabot --format='{{.LogPath}}'
```

### 5.3 Backup Strategy

Database (Supabase):
- Managed by Supabase (automatic backups)
- Use Supabase Dashboard for manual exports

Storage (Viettel S3):
- S3 versioning enabled
- Cross-region replication (optional)

Application config:
```bash
# Backup environment
cp .env.production .env.production.backup.$(date +%Y%m%d)
```

## Phase 6: Updates & Rollback

### 6.1 Update to New Version

```bash
cd /opt/diabot

# Pull new image
docker-compose pull

# Restart with new image
docker-compose up -d

# Monitor logs
docker-compose logs -f diabot
```

### 6.2 Rollback

```bash
# Check previous versions
docker images | grep diabot

# Edit docker-compose.yml to use previous tag
nano docker-compose.yml  # Change to diabot:0.8.0

# Restart
docker-compose up -d
```

### 6.3 Zero-Downtime Deployment

```bash
# Use blue-green deployment
docker-compose -f docker-compose.blue.yml up -d
# Test at http://localhost:3001
# Swap nginx upstream
# Stop old container
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs diabot

# Check environment
docker-compose config

# Test database connection
docker-compose exec diabot node scripts/qa_db.mjs
```

### High Memory Usage

```bash
# Check resource usage
docker stats diabot

# Restart if needed
docker-compose restart diabot
```

### Storage Connection Issues

```bash
# Test S3 connectivity
docker-compose exec diabot node scripts/qa_storage.mjs

# Check credentials in .env.production
```

### SSL Certificate Issues

```bash
# Test renewal
certbot renew --dry-run

# Check Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx
```

## Security Checklist

- [ ] Firewall configured (ufw)
- [ ] SSH key-based authentication only
- [ ] Environment file permissions (600)
- [ ] SSL certificate installed
- [ ] Docker running as non-root
- [ ] Regular security updates scheduled
- [ ] Health monitoring configured
- [ ] Log rotation configured
- [ ] Backup strategy implemented

## Performance Optimization

### Docker Resource Limits

```yaml
services:
  diabot:
    # ... existing config
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Nginx Caching

Already configured for static assets. Monitor cache hit ratio:
```bash
grep "Cache-Control" /var/log/nginx/access.log | wc -l
```

## Cost Estimation (Viettel Cloud)

**VPS** (2 vCPU, 4GB RAM): ~500,000 VND/month
**S3 Storage** (100GB): ~200,000 VND/month
**Bandwidth** (1TB): Included
**Total**: ~700,000 VND/month (~$30 USD)

## Support Contacts

- Viettel Cloud Support: support@viettelcloud.vn
- DIABOT Technical: [Your contact]
- Emergency: [On-call number]

## Next Steps

1. Complete Viettel Cloud subscription
2. Generate S3 credentials
3. Deploy to staging VPS first
4. Run full QA checklist
5. Deploy to production
6. Monitor for 24 hours
7. Enable auto-scaling (optional)

---

**Last Updated**: 2025-10-06
**DIABOT Version**: 0.9.0
**Document Version**: 1.0
