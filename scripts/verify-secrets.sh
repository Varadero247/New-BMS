#!/bin/bash
#
# Verify secrets are configured correctly for IMS
# Usage: ./scripts/verify-secrets.sh [--production]
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PRODUCTION_MODE=false
if [ "$1" == "--production" ]; then
    PRODUCTION_MODE=true
fi

ERRORS=0
WARNINGS=0

pass() {
    echo -e "  ${GREEN}[PASS]${NC} $1"
}

fail() {
    echo -e "  ${RED}[FAIL]${NC} $1"
    ERRORS=$((ERRORS + 1))
}

warn() {
    echo -e "  ${YELLOW}[WARN]${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Load .env file if exists
if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
    info "Loaded .env file from $ENV_FILE"
else
    fail ".env file not found at $ENV_FILE"
    echo ""
    echo "Run ./scripts/generate-secrets.sh to create one."
    exit 1
fi

echo ""
echo "========================================="
echo "  IMS Secrets Verification"
if [ "$PRODUCTION_MODE" == "true" ]; then
    echo "  Mode: PRODUCTION (strict)"
else
    echo "  Mode: Development"
fi
echo "========================================="
echo ""

# Check .env file permissions
echo "File Security:"
if [ -f "$ENV_FILE" ]; then
    PERMS=$(stat -c '%a' "$ENV_FILE" 2>/dev/null || stat -f '%Lp' "$ENV_FILE" 2>/dev/null)
    if [ "$PERMS" == "600" ]; then
        pass ".env file has secure permissions (600)"
    else
        if [ "$PRODUCTION_MODE" == "true" ]; then
            fail ".env file permissions are $PERMS (should be 600)"
        else
            warn ".env file permissions are $PERMS (recommended: 600)"
        fi
    fi
fi

# Check .gitignore
echo ""
echo "Version Control:"
if grep -q "^\.env$" "$PROJECT_ROOT/.gitignore" 2>/dev/null; then
    pass ".env is in .gitignore"
else
    fail ".env is NOT in .gitignore - secrets may be committed!"
fi

# Function to check if secret looks like a placeholder
is_placeholder() {
    local secret="$1"
    if [[ "$secret" =~ ^(your|change|default|example|test|sample|placeholder|secret|password|xxx|replace)[-_]? ]]; then
        return 0
    fi
    return 1
}

echo ""
echo "JWT Secrets:"

# JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    fail "JWT_SECRET is not set"
else
    LEN=${#JWT_SECRET}
    if [ $LEN -ge 64 ]; then
        pass "JWT_SECRET length is $LEN chars (minimum 64)"
    else
        if [ "$PRODUCTION_MODE" == "true" ]; then
            fail "JWT_SECRET length is $LEN chars (minimum 64 required)"
        else
            warn "JWT_SECRET length is $LEN chars (minimum 64 recommended)"
        fi
    fi

    if is_placeholder "$JWT_SECRET"; then
        if [ "$PRODUCTION_MODE" == "true" ]; then
            fail "JWT_SECRET appears to be a placeholder value"
        else
            warn "JWT_SECRET appears to be a placeholder value"
        fi
    else
        pass "JWT_SECRET does not appear to be a placeholder"
    fi
fi

# JWT_REFRESH_SECRET
if [ -z "$JWT_REFRESH_SECRET" ]; then
    warn "JWT_REFRESH_SECRET is not set (optional)"
else
    LEN=${#JWT_REFRESH_SECRET}
    if [ $LEN -ge 64 ]; then
        pass "JWT_REFRESH_SECRET length is $LEN chars (minimum 64)"
    else
        warn "JWT_REFRESH_SECRET length is $LEN chars (minimum 64 recommended)"
    fi
fi

echo ""
echo "Database Secrets:"

# DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    fail "DATABASE_URL is not set"
else
    pass "DATABASE_URL is set"

    # Check for weak passwords in connection string
    if [[ "$DATABASE_URL" =~ :postgres@ ]] || [[ "$DATABASE_URL" =~ :password@ ]] || [[ "$DATABASE_URL" =~ :admin@ ]]; then
        if [ "$PRODUCTION_MODE" == "true" ]; then
            fail "DATABASE_URL contains a weak/default password"
        else
            warn "DATABASE_URL contains a weak/default password"
        fi
    else
        pass "DATABASE_URL does not contain obvious weak passwords"
    fi
fi

# POSTGRES_PASSWORD
if [ -z "$POSTGRES_PASSWORD" ]; then
    warn "POSTGRES_PASSWORD is not set (may be in DATABASE_URL)"
else
    LEN=${#POSTGRES_PASSWORD}
    if [ $LEN -ge 16 ]; then
        pass "POSTGRES_PASSWORD length is $LEN chars (minimum 16)"
    else
        if [ "$PRODUCTION_MODE" == "true" ]; then
            fail "POSTGRES_PASSWORD length is $LEN chars (minimum 16 required)"
        else
            warn "POSTGRES_PASSWORD length is $LEN chars (minimum 16 recommended)"
        fi
    fi
fi

echo ""
echo "Redis Secrets:"

# REDIS_PASSWORD
if [ -z "$REDIS_PASSWORD" ]; then
    warn "REDIS_PASSWORD is not set (Redis may be unsecured)"
else
    LEN=${#REDIS_PASSWORD}
    if [ $LEN -ge 16 ]; then
        pass "REDIS_PASSWORD length is $LEN chars (minimum 16)"
    else
        warn "REDIS_PASSWORD length is $LEN chars (minimum 16 recommended)"
    fi
fi

echo ""
echo "========================================="
echo "  Summary"
echo "========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}Passed with $WARNINGS warning(s)${NC}"
else
    echo -e "${RED}Failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
fi

echo ""
if [ "$PRODUCTION_MODE" == "true" ] && [ $ERRORS -gt 0 ]; then
    echo "Production deployment blocked due to security errors."
    exit 1
fi

exit 0
