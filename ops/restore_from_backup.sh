#!/usr/bin/env bash
set -euo pipefail
FILE="${1:?Usage: restore_from_backup.sh <file.sql>}"
cat "$FILE" | docker exec -i diabot-postgres psql -U postgres -d diabot
echo "♻️ Restore done: $FILE"
