#!/bin/bash
#
# Generate secure secrets for IMS
# Usage: ./scripts/generate-secrets.sh [--force]
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    error "openssl is required but not installed. Please install it first."
    exit 1
fi

# Check if .env already exists
if [ -f "$ENV_FILE" ] && [ "$1" != "--force" ]; then
    warn ".env file already exists at $ENV_FILE"
    warn "Use --force to overwrite existing secrets"
    echo ""
    read -p "Do you want to continue and overwrite? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Aborted. Existing .env file preserved."
        exit 0
    fi
fi

info "Generating secure secrets..."

# Generate secrets
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '\n' | tr '+/' '-_')
REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d '\n' | tr '+/' '-_')
SESSION_SECRET=$(openssl rand -base64 32 | tr -d '\n')

info "Creating .env file..."

cat > "$ENV_FILE" << EOF
# IMS Environment Configuration
# Generated on $(date -Iseconds)
# WARNING: This file contains secrets - never commit to version control!

# Application
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/ims?schema=public
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=ims

# Redis
REDIS_URL=redis://:${REDIS_PASSWORD}@localhost:6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# JWT Authentication
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Session
SESSION_SECRET=${SESSION_SECRET}

# CORS
CORS_ORIGIN=http://localhost:3000

# API Gateway
PORT=4000

# Service URLs (for development)
HEALTH_SAFETY_URL=http://localhost:4001
ENVIRONMENT_URL=http://localhost:4002
QUALITY_URL=http://localhost:4003
AI_ANALYSIS_URL=http://localhost:4004
INVENTORY_URL=http://localhost:4005
HR_URL=http://localhost:4006
PAYROLL_URL=http://localhost:4007
WORKFLOWS_URL=http://localhost:4008

# AI Services (add your keys here)
# OPENAI_API_KEY=
# ANTHROPIC_API_KEY=
EOF

# Set restrictive permissions (readable only by owner)
chmod 600 "$ENV_FILE"

info "Setting file permissions to 600 (owner read/write only)..."

# Create .env.example if it doesn't exist or is outdated
ENV_EXAMPLE="$PROJECT_ROOT/.env.example"
info "Updating .env.example..."

cat > "$ENV_EXAMPLE" << 'EOF'
# IMS Environment Configuration Example
# Copy this file to .env and fill in your values
# Run ./scripts/generate-secrets.sh to auto-generate secure secrets

# Application
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:YOUR_SECURE_PASSWORD@localhost:5432/ims?schema=public
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD
POSTGRES_DB=ims

# Redis
REDIS_URL=redis://:YOUR_REDIS_PASSWORD@localhost:6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD

# JWT Authentication
# IMPORTANT: These must be at least 64 characters in production
JWT_SECRET=YOUR_SECURE_JWT_SECRET_AT_LEAST_64_CHARS
JWT_REFRESH_SECRET=YOUR_SECURE_REFRESH_SECRET_AT_LEAST_64_CHARS
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Session
SESSION_SECRET=YOUR_SESSION_SECRET

# CORS
CORS_ORIGIN=http://localhost:3000

# API Gateway
PORT=4000

# Service URLs
HEALTH_SAFETY_URL=http://localhost:4001
ENVIRONMENT_URL=http://localhost:4002
QUALITY_URL=http://localhost:4003
AI_ANALYSIS_URL=http://localhost:4004
INVENTORY_URL=http://localhost:4005
HR_URL=http://localhost:4006
PAYROLL_URL=http://localhost:4007
WORKFLOWS_URL=http://localhost:4008

# AI Services
# OPENAI_API_KEY=
# ANTHROPIC_API_KEY=
EOF

echo ""
info "Secret generation complete!"
echo ""
echo "Generated secrets:"
echo "  - JWT_SECRET (${#JWT_SECRET} chars)"
echo "  - JWT_REFRESH_SECRET (${#JWT_REFRESH_SECRET} chars)"
echo "  - POSTGRES_PASSWORD (${#POSTGRES_PASSWORD} chars)"
echo "  - REDIS_PASSWORD (${#REDIS_PASSWORD} chars)"
echo "  - SESSION_SECRET (${#SESSION_SECRET} chars)"
echo ""
echo "Files created/updated:"
echo "  - $ENV_FILE (permissions: 600)"
echo "  - $ENV_EXAMPLE"
echo ""
warn "Remember: Never commit .env to version control!"
echo ""
info "Next steps:"
echo "  1. Update docker-compose: docker-compose up -d postgres redis"
echo "  2. Run database migrations: pnpm db:push"
echo "  3. Start services: pnpm start:all"
