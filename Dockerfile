# --- deps ---
FROM node:20-alpine AS deps
WORKDIR /app

# Install security updates and ca-certificates
RUN apk add --no-cache ca-certificates tzdata

COPY package.json package-lock.json ./
RUN HUSKY=0 npm ci --no-audit --no-fund

# --- builder ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install ca-certificates for build
RUN apk add --no-cache ca-certificates

COPY --from=deps /app/node_modules ./node_modules

# Copy source (excluding .env.local via .dockerignore)
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# --- runner ---
FROM node:20-alpine AS runner
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    wget \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

ENV NODE_ENV=production
ENV PORT=3000
ENV TZ=UTC

# 1) server.js + minimal node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 2) static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# 3) server manifests
COPY --from=builder --chown=nextjs:nodejs /app/.next/server ./.next/server
# 4) public
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check using /api/healthz endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/healthz || exit 1

CMD ["node", "server.js"]
