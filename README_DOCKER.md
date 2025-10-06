# DIABOT Docker Deployment Guide

Production-ready Docker configuration for DIABOT v0.9.0 with security hardening and Viettel Cloud integration support.

## Quick Start

### Local Development

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
# Then build and run
docker-compose up --build
```

The application will be available at http://localhost:3000

### Production Build

```bash
# Build production image
docker build -t diabot/app:0.9.0 .

# Run with environment file
docker run -d \
  --name diabot \
  -p 3000:3000 \
  --env-file .env.local \
  diabot/app:0.9.0
```

## Architecture

### Multi-Stage Build

The Dockerfile uses a 3-stage build process:

1. **deps**: Install dependencies with npm ci
2. **builder**: Build Next.js application with standalone output
3. **runner**: Minimal runtime image with security hardening

### Security Features

- Non-root user (nextjs:1001)
- Alpine Linux base (minimal attack surface)
- No sensitive files in image (.dockerignore)
- Health checks enabled
- TLS certificates included
- Read-only file system compatible

### Image Size

Target: < 300 MB
Typical: 200-250 MB

## Environment Variables

### Required Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Storage Configuration (Viettel Cloud S3)

```bash
# Set provider to enable storage
STORAGE_PROVIDER=viettel

# Viettel Cloud S3 credentials
S3_ENDPOINT=https://s3.viettelcloud.vn
S3_REGION=VN
S3_BUCKET=diabot-production
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
```

**Note**: Storage is optional. Set `STORAGE_PROVIDER=not_configured` to disable.

### Application Configuration

```bash
NODE_ENV=production
PORT=3000
APP_VERSION=0.9.0
TZ=UTC
```

See `.env.local.example` for complete configuration options.

## Health Checks

### Endpoints

- `/api/health` - Basic health check
- `/api/healthz` - Comprehensive health check with DB and storage status

### Docker Health Check

The Dockerfile includes a HEALTHCHECK directive:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/healthz || exit 1
```

Check container health:

```bash
docker inspect --format='{{.State.Health.Status}}' diabot
```

## QA Scripts

### Database Connectivity Test

```bash
node scripts/qa_db.mjs
```

Tests:
- Supabase connection
- Critical tables accessibility
- RLS policy verification

### Storage Connectivity Test

```bash
node scripts/qa_storage.mjs
```

Tests:
- Viettel S3 configuration validation
- Local file operations
- Presigned URL generation (mock)

## CI/CD Integration

### GitHub Actions Workflow

`.github/workflows/docker.yml` provides:

1. **Build & Push**: Multi-arch build with caching
2. **Security Scan**: Trivy vulnerability scanning
3. **Smoke Test**: Health check and endpoint validation
4. **Summary**: Build artifacts and status

### Triggering Builds

**Tagged Release**:
```bash
git tag v0.9.0
git push origin v0.9.0
```

**Manual Dispatch**:
- Go to Actions tab
- Select "Docker Production Build"
- Click "Run workflow"
- Specify version (optional)

### Registry

Images are published to GitHub Container Registry (GHCR):

```
ghcr.io/YOUR_ORG/diabot:0.9.0
ghcr.io/YOUR_ORG/diabot:latest
```

## Security Scanning

### Using Trivy

```bash
# Install Trivy (macOS)
brew install aquasecurity/trivy/trivy

# Scan image
bash scripts/docker_scan.sh diabot/app:0.9.0

# Generate JSON report
bash scripts/docker_scan.sh diabot/app:0.9.0 HIGH,CRITICAL json > security-report.json
```

### Using Docker Trivy

```bash
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image \
  --severity HIGH,CRITICAL \
  diabot/app:0.9.0
```

## Production Deployment

### Docker Compose (Recommended)

```yaml
version: "3.9"

services:
  diabot:
    image: ghcr.io/YOUR_ORG/diabot:0.9.0
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
```

### Kubernetes Deployment

See `DEPLOY_VIETTEL.md` for Kubernetes configuration examples.

## Troubleshooting

### Container Won't Start

Check logs:
```bash
docker logs diabot
```

Common issues:
- Missing environment variables
- Invalid Supabase credentials
- Port 3000 already in use

### Health Check Failing

Test endpoints manually:
```bash
docker exec diabot wget -qO- http://localhost:3000/api/healthz
```

Check specific components:
```bash
# Database
node scripts/qa_db.mjs

# Storage
node scripts/qa_storage.mjs
```

### Image Too Large

Check layer sizes:
```bash
docker history diabot/app:0.9.0
```

Optimize:
- Remove unused dependencies
- Use .dockerignore effectively
- Consider multi-arch builds

### Permission Issues

Verify user:
```bash
docker exec diabot whoami  # Should return: nextjs
docker exec diabot id      # uid=1001(nextjs) gid=1001(nodejs)
```

## Development Tips

### Faster Local Builds

Use BuildKit cache:
```bash
export DOCKER_BUILDKIT=1
docker build --cache-from diabot/app:latest -t diabot/app:dev .
```

### Debug Build

Add verbose logging:
```dockerfile
ENV NEXT_TELEMETRY_DISABLED=1
ENV DEBUG=*
```

### Shell Access

```bash
# Development
docker run -it --rm diabot/app:dev sh

# Production (running container)
docker exec -it diabot sh
```

## Migration from Existing Setup

### From Node.js Server

1. Copy environment variables to `.env.local`
2. Build Docker image
3. Test locally with docker-compose
4. Deploy to production

### From Other Docker Setup

1. Update Dockerfile if using custom base image
2. Migrate environment variables
3. Update health check endpoints
4. Test with QA scripts

## Support

For issues or questions:
- Check logs: `docker logs diabot`
- Run QA scripts: `node scripts/qa_*.mjs`
- Review health status: `curl http://localhost:3000/api/healthz`

## Next Steps

See `DEPLOY_VIETTEL.md` for Viettel Cloud VPS deployment instructions.
