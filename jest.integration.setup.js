// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Per-file setup: configure env vars for integration tests.
'use strict';

// Load .env.integration if present (local dev with Docker Redis/Postgres auth).
// CI sets env vars directly; this file is gitignored.
const fs = require('fs');
const path = require('path');
const envFile = path.join(__dirname, '.env.integration');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
}

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
// REDIS_URL takes precedence. If not set, build from REDIS_HOST/PORT/PASS.
// CI runs Redis without auth (plain redis://localhost:6379).
// Local Docker Redis requires a password — set REDIS_PASS or REDIS_URL in the environment.
if (!process.env.JWT_SECRET)   process.env.JWT_SECRET   = 'integration-test-secret-at-least-32-chars';
if (!process.env.JWT_ISSUER)   process.env.JWT_ISSUER   = 'ims-api';
if (!process.env.JWT_AUDIENCE) process.env.JWT_AUDIENCE = 'ims-client';
if (!process.env.REDIS_URL) {
  const rHost = process.env.REDIS_HOST || 'localhost';
  const rPort = process.env.REDIS_PORT || '6379';
  const rPass = process.env.REDIS_PASS || '';
  process.env.REDIS_URL = rPass
    ? `redis://:${encodeURIComponent(rPass)}@${rHost}:${rPort}`
    : `redis://${rHost}:${rPort}`;
}
