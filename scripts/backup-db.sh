#!/usr/bin/env bash
# Manual database backup script
set -euo pipefail
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"
DOCKER_API_VERSION=1.41 docker exec ims-postgres pg_dump -U postgres -d ims --no-owner --no-acl | gzip > "$BACKUP_DIR/ims_${TIMESTAMP}.sql.gz"
echo "Backup saved to $BACKUP_DIR/ims_${TIMESTAMP}.sql.gz"
# Cleanup: keep last 7 backups
ls -t "$BACKUP_DIR"/ims_*.sql.gz 2>/dev/null | tail -n +8 | xargs -r rm
