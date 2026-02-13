#!/usr/bin/env bash
set -euo pipefail
echo "# Generated secrets — copy to .env.local or individual .env files"
echo "DB_PASSWORD=$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 40)"
echo "JWT_SECRET=$(openssl rand -base64 64 | tr -dc 'A-Za-z0-9' | head -c 80)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -dc 'A-Za-z0-9' | head -c 80)"
echo "SERVICE_AUTH_SECRET=$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 40)"
