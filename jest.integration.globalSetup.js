// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Global setup: create and populate separate per-schema integration test DBs.
// Uses separate databases to avoid enum conflicts between schemas.
'use strict';

const { execSync } = require('child_process');
const path = require('path');

const SCHEMAS_DIR = path.join(__dirname, 'packages/database/prisma/schemas');

// Each schema gets its own database to avoid enum conflicts between schemas
// that share the same enum names with different values (e.g. PaymentStatus).
const SCHEMA_DB_MAP = [
  { file: 'core.prisma',         envVar: 'CORE_DATABASE_URL',         db: 'ims_test_core'         },
  { file: 'quality.prisma',      envVar: 'QUALITY_DATABASE_URL',      db: 'ims_test_quality'      },
  { file: 'health-safety.prisma',envVar: 'HEALTH_SAFETY_DATABASE_URL',db: 'ims_test_health_safety'},
  { file: 'hr.prisma',           envVar: 'HR_DATABASE_URL',           db: 'ims_test_hr'           },
  { file: 'workflows.prisma',    envVar: 'WORKFLOWS_DATABASE_URL',    db: 'ims_test_workflows'    },
  { file: 'inventory.prisma',    envVar: 'INVENTORY_DATABASE_URL',    db: 'ims_test_inventory'    },
  { file: 'payroll.prisma',      envVar: 'PAYROLL_DATABASE_URL',      db: 'ims_test_payroll'      },
];

const PG_HOST     = process.env.PG_HOST     || 'localhost';
const PG_PORT     = process.env.PG_PORT     || '5432';
const PG_USER     = process.env.PG_USER     || 'postgres';
const PG_PASS     = process.env.PG_PASS     || 'ims_secure_password_2026';

function pgUrl(db) {
  return `postgresql://${PG_USER}:${encodeURIComponent(PG_PASS)}@${PG_HOST}:${PG_PORT}/${db}`;
}

function psql(sql, db = 'postgres') {
  execSync(
    `PGPASSWORD="${PG_PASS}" psql -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d ${db} -c "${sql}" --no-psqlrc`,
    { stdio: 'pipe' }
  );
}

module.exports = async function globalSetup() {
  console.log('\n[Integration Setup] Creating per-schema test databases...');

  for (const { file, envVar, db } of SCHEMA_DB_MAP) {
    const schemaPath = path.join(SCHEMAS_DIR, file);
    const dbUrl = pgUrl(db);

    // Set env var so tests pick up the correct DB
    process.env[envVar] = dbUrl;

    // Drop + create the database fresh
    try { psql(`DROP DATABASE IF EXISTS ${db}`); } catch (_) {}
    try { psql(`CREATE DATABASE ${db}`); } catch (_) {}

    // Apply schema via migrate diff (from-empty → only CREATE statements)
    try {
      const sql = execSync(
        `npx prisma@5.22.0 migrate diff --from-empty --to-schema-datamodel="${schemaPath}" --script`,
        { env: { ...process.env, [envVar]: dbUrl }, stdio: ['pipe', 'pipe', 'pipe'] }
      ).toString();

      execSync(
        `PGPASSWORD="${PG_PASS}" psql -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d ${db} -v ON_ERROR_STOP=0 --no-psqlrc`,
        { input: sql, stdio: ['pipe', 'pipe', 'pipe'] }
      );

      console.log(`  ✓ ${file} → ${db}`);
    } catch (err) {
      const msg = (err.stderr || err.stdout || err.message || String(err)).toString().slice(0, 300);
      console.warn(`  ⚠ ${file}: ${msg}`);
    }
  }

  console.log('[Integration Setup] All schemas applied.\n');
};
