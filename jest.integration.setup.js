// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Per-file setup: configure env vars for integration tests.
'use strict';

const PG_HOST = process.env.PG_HOST || 'localhost';
const PG_PORT = process.env.PG_PORT || '5432';
const PG_USER = process.env.PG_USER || 'postgres';
const PG_PASS = process.env.PG_PASS || 'ims_secure_password_2026';

function pgUrl(db) {
  return `postgresql://${PG_USER}:${encodeURIComponent(PG_PASS)}@${PG_HOST}:${PG_PORT}/${db}`;
}

// Each schema gets its own database to avoid enum conflicts
const DB_MAP = {
  CORE_DATABASE_URL:          pgUrl('ims_test_core'),
  QUALITY_DATABASE_URL:       pgUrl('ims_test_quality'),
  HEALTH_SAFETY_DATABASE_URL: pgUrl('ims_test_health_safety'),
  HR_DATABASE_URL:            pgUrl('ims_test_hr'),
  WORKFLOWS_DATABASE_URL:     pgUrl('ims_test_workflows'),
  INVENTORY_DATABASE_URL:     pgUrl('ims_test_inventory'),
  PAYROLL_DATABASE_URL:       pgUrl('ims_test_payroll'),
};

for (const [key, url] of Object.entries(DB_MAP)) {
  if (!process.env[key]) process.env[key] = url;
}

// Auth and Redis
// REDIS_URL must be set externally for local runs against Docker Redis.
// CI (GitHub Actions) runs Redis without auth, so the plain URL is the safe default.
if (!process.env.JWT_SECRET)   process.env.JWT_SECRET   = 'integration-test-secret-at-least-32-chars';
if (!process.env.JWT_ISSUER)   process.env.JWT_ISSUER   = 'ims-api';
if (!process.env.JWT_AUDIENCE) process.env.JWT_AUDIENCE = 'ims-client';
if (!process.env.REDIS_URL)    process.env.REDIS_URL    = 'redis://localhost:6379';
