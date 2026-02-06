#!/bin/bash

# Initialize HashiCorp Vault with IMS secrets
# This script should be run after starting Vault in dev mode

set -e

# Default values
VAULT_ADDR=${VAULT_ADDR:-"http://localhost:8200"}
VAULT_TOKEN=${VAULT_TOKEN:-"root-token-for-development"}

echo "Initializing Vault at $VAULT_ADDR..."

# Check if Vault is available
if ! curl -s "$VAULT_ADDR/v1/sys/health" > /dev/null 2>&1; then
    echo "Error: Vault is not accessible at $VAULT_ADDR"
    echo "Make sure Vault is running: docker-compose -f docker-compose.vault.yml up -d"
    exit 1
fi

export VAULT_ADDR
export VAULT_TOKEN

# Check if vault CLI is available
if ! command -v vault &> /dev/null; then
    echo "Warning: vault CLI not installed, using curl instead"

    # Generate secrets
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    SERVICE_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')

    # Store secrets using curl
    curl -s -X POST "$VAULT_ADDR/v1/secret/data/ims/config" \
        -H "X-Vault-Token: $VAULT_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"data\": {
                \"JWT_SECRET\": \"$JWT_SECRET\",
                \"JWT_REFRESH_SECRET\": \"$JWT_REFRESH_SECRET\",
                \"SERVICE_SECRET\": \"$SERVICE_SECRET\",
                \"POSTGRES_PASSWORD\": \"$POSTGRES_PASSWORD\",
                \"REDIS_PASSWORD\": \"$REDIS_PASSWORD\"
            }
        }" > /dev/null

    echo "Secrets stored in Vault at secret/ims/config"
else
    # Use vault CLI
    echo "Using vault CLI..."

    # Generate and store secrets
    vault kv put secret/ims/config \
        JWT_SECRET="$(openssl rand -base64 64 | tr -d '\n')" \
        JWT_REFRESH_SECRET="$(openssl rand -base64 64 | tr -d '\n')" \
        SERVICE_SECRET="$(openssl rand -base64 64 | tr -d '\n')" \
        POSTGRES_PASSWORD="$(openssl rand -base64 32 | tr -d '\n')" \
        REDIS_PASSWORD="$(openssl rand -base64 32 | tr -d '\n')"

    echo "Secrets stored in Vault"
fi

echo ""
echo "Vault initialized successfully!"
echo ""
echo "To use Vault secrets in your application, set these environment variables:"
echo "  export USE_VAULT=true"
echo "  export VAULT_ADDR=$VAULT_ADDR"
echo "  export VAULT_TOKEN=$VAULT_TOKEN"
echo ""
echo "Or add them to your .env file"
