#!/usr/bin/env bash
set -euo pipefail
URL="${URL:-https://diabot.top/api/qa/selftest}"
LOG="${LOG:-/opt/diabot/health_fail.log}"
if curl -fsS "$URL" >/dev/null; then
  echo "OK $(date -Is)"
else
  echo "$(date -Is) Healthcheck failed: $URL" >> "$LOG"
  exit 1
fi
