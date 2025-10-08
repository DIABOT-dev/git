#!/usr/bin/env bash
set -euo pipefail
TS=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"
FILE="${BACKUP_DIR}/db_${TS}.sql"
mkdir -p "$BACKUP_DIR"
docker exec diabot-postgres pg_dump -U postgres diabot > "$FILE"

S3_BUCKET="${S3_BUCKET:-s3://diabot-backup}"
S3_ENDPOINT="${S3_ENDPOINT:-https://s3.viettelcloud.vn}"
aws s3 cp "$FILE" "$S3_BUCKET/" --endpoint-url "$S3_ENDPOINT"
echo "✅ Backup uploaded: ${S3_BUCKET}/$(basename "$FILE")"
