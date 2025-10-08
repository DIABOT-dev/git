#!/usr/bin/env bash
set -euo pipefail
SSH_HOST="${SSH_HOST:-171.244.140.161}"
SSH_USER="${SSH_USER:-root}"
APP_DIR="${APP_DIR:-/opt/diabot}"
IMAGE="${IMAGE_ROLLBACK:-ghcr.io/diabot-dev/diabot:previous}"
PORT="${PORT:-3000}"

ssh ${SSH_USER}@${SSH_HOST} "docker rm -f diabot || true && docker pull ${IMAGE}"
ssh ${SSH_USER}@${SSH_HOST} "docker run -d --name diabot --restart=always -p ${PORT}:3000   --env-file ${APP_DIR}/.env -v /opt/diabot:/data ${IMAGE}"
echo "↩️ Rolled back to ${IMAGE}"
