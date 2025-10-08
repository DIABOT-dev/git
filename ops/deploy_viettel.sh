#!/usr/bin/env bash
set -euo pipefail
SSH_HOST="${SSH_HOST:-171.244.140.161}"
SSH_USER="${SSH_USER:-root}"
APP_DIR="${APP_DIR:-/opt/diabot}"
IMAGE="${IMAGE:-ghcr.io/diabot-dev/diabot:latest}"
PORT="${PORT:-3000}"

ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} <<'EOF'
set -euo pipefail
mkdir -p /opt/diabot /backup
EOF

ssh ${SSH_USER}@${SSH_HOST} "docker pull ${IMAGE}"
ssh ${SSH_USER}@${SSH_HOST} "docker rm -f diabot || true"
ssh ${SSH_USER}@${SSH_HOST} "docker run -d --name diabot   --restart=always   -p ${PORT}:3000   --env-file ${APP_DIR}/.env   -v /opt/diabot:/data   ${IMAGE} "
echo "✅ Deployed ${IMAGE} to ${SSH_HOST}:${PORT}"
