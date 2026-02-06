#!/bin/bash

# Create separate databases for IMS microservices
# This script creates individual databases for each service domain

set -e

# Database connection (defaults to local development)
POSTGRES_HOST=${POSTGRES_HOST:-localhost}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}

export PGPASSWORD=$POSTGRES_PASSWORD

echo "Creating IMS databases on $POSTGRES_HOST:$POSTGRES_PORT..."

# Function to create database if it doesn't exist
create_db_if_not_exists() {
    local db_name=$1
    local db_owner=${2:-$POSTGRES_USER}

    if psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -lqt | cut -d \| -f 1 | grep -qw "$db_name"; then
        echo "  Database '$db_name' already exists"
    else
        echo "  Creating database '$db_name'..."
        psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -c "CREATE DATABASE $db_name OWNER $db_owner;"
    fi
}

# Core database (auth, users, sessions, audit)
create_db_if_not_exists "ims_core"

# Domain-specific databases
create_db_if_not_exists "ims_hr"
create_db_if_not_exists "ims_payroll"
create_db_if_not_exists "ims_quality"
create_db_if_not_exists "ims_health_safety"
create_db_if_not_exists "ims_environment"
create_db_if_not_exists "ims_inventory"
create_db_if_not_exists "ims_workflows"
create_db_if_not_exists "ims_ai_analysis"

echo ""
echo "All databases created successfully!"
echo ""
echo "Database URLs for your .env file:"
echo ""
echo "# Core database (auth, users, audit)"
echo "CORE_DATABASE_URL=postgresql://$POSTGRES_USER:YOUR_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/ims_core?schema=public"
echo ""
echo "# Service-specific databases"
echo "HR_DATABASE_URL=postgresql://$POSTGRES_USER:YOUR_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/ims_hr?schema=public"
echo "PAYROLL_DATABASE_URL=postgresql://$POSTGRES_USER:YOUR_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/ims_payroll?schema=public"
echo "QUALITY_DATABASE_URL=postgresql://$POSTGRES_USER:YOUR_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/ims_quality?schema=public"
echo "HEALTH_SAFETY_DATABASE_URL=postgresql://$POSTGRES_USER:YOUR_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/ims_health_safety?schema=public"
echo "ENVIRONMENT_DATABASE_URL=postgresql://$POSTGRES_USER:YOUR_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/ims_environment?schema=public"
echo "INVENTORY_DATABASE_URL=postgresql://$POSTGRES_USER:YOUR_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/ims_inventory?schema=public"
echo "WORKFLOWS_DATABASE_URL=postgresql://$POSTGRES_USER:YOUR_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/ims_workflows?schema=public"
echo "AI_DATABASE_URL=postgresql://$POSTGRES_USER:YOUR_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/ims_ai_analysis?schema=public"
