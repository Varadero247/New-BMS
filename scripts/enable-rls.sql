-- =============================================================================
-- IMS: Row-Level Security (RLS) Policies
-- FINDING-026: Prevent cross-service table access via shared PostgreSQL DB
--              (NIST AC-3 / Least Privilege / Defense-in-Depth)
--
-- PREREQUISITES:
--   scripts/create-db-users.sql must have been run first to create the
--   per-service roles (ims_health_safety, ims_environment, etc.).
--
-- USAGE:
--   PGPASSWORD=ims_secure_password_2026 psql -h localhost -U postgres -d ims \
--     -f scripts/enable-rls.sql
--
-- WHAT THIS DOES:
--   1. Enables RLS on every table in the public schema.
--   2. Creates a permissive "FOR ALL" policy for each service role on the
--      tables it owns (matching the same prefix mappings as create-db-users.sql).
--   3. Tables that have no matching policy block all non-superuser access
--      (PostgreSQL default-deny semantics) — this is intentional.
--   4. The `postgres` superuser bypasses RLS by default (no action needed).
--   5. For future multi-tenant isolation, a commented-out section shows how to
--      add organisation-level policies on tables with an "orgId" column.
--
-- RE-RUNNING:
--   The script is idempotent — it uses CREATE POLICY ... IF NOT EXISTS and
--   ALTER TABLE ... ENABLE ROW LEVEL SECURITY (which is a no-op if already set).
--
-- REVERTING:
--   To disable RLS on all tables (e.g., for debugging):
--     DO $$ DECLARE t RECORD;
--     BEGIN FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' LOOP
--       EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', t.tablename);
--     END LOOP; END $$;
-- =============================================================================

-- =============================================================================
-- Step 1: Helper function — enable RLS and create service policy for a prefix
-- =============================================================================

CREATE OR REPLACE FUNCTION rls_policy_for_prefix(
    role_name  TEXT,
    tbl_prefix TEXT
) RETURNS VOID AS $$
DECLARE
    tbl         RECORD;
    policy_name TEXT;
BEGIN
    -- Skip if the role doesn't exist yet (run create-db-users.sql first in prod)
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
        RAISE NOTICE 'Role "%" not found — skipping policy creation for prefix "%" (run create-db-users.sql first)',
            role_name, tbl_prefix;
        RETURN;
    END IF;

    FOR tbl IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename LIKE tbl_prefix || '%'
    LOOP
        -- Enable RLS on the table (idempotent)
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl.tablename);

        -- Create a permissive "allow all rows" policy for this service role
        -- Policy name: svc_<role>  (truncated to fit pg 63-char limit if needed)
        policy_name := 'svc_' || role_name;

        -- CREATE POLICY doesn't have IF NOT EXISTS before PG 14 — use exception
        BEGIN
            EXECUTE format(
                'CREATE POLICY %I ON %I AS PERMISSIVE FOR ALL TO %I USING (true) WITH CHECK (true)',
                policy_name, tbl.tablename, role_name
            );
        EXCEPTION WHEN duplicate_object THEN
            -- Policy already exists — skip silently
            NULL;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Step 2: Enable RLS on ALL tables first (catches tables with no prefix match)
-- =============================================================================

DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl.tablename);
    END LOOP;
    RAISE NOTICE 'RLS enabled on all public schema tables.';
END $$;

-- =============================================================================
-- Step 3: Per-service policies (mirrors create-db-users.sql prefix mappings)
-- =============================================================================

-- Gateway — auth, sessions, audit, org tables
SELECT rls_policy_for_prefix('ims_gateway', 'users');
SELECT rls_policy_for_prefix('ims_gateway', 'sessions');
SELECT rls_policy_for_prefix('ims_gateway', 'audit_logs');
SELECT rls_policy_for_prefix('ims_gateway', 'password_reset');
SELECT rls_policy_for_prefix('ims_gateway', 'api_keys');
SELECT rls_policy_for_prefix('ims_gateway', 'custom_roles');
SELECT rls_policy_for_prefix('ims_gateway', 'feature_flags');
SELECT rls_policy_for_prefix('ims_gateway', 'organisations');
SELECT rls_policy_for_prefix('ims_gateway', 'template');
SELECT rls_policy_for_prefix('ims_gateway', 'enhanced_audit');
SELECT rls_policy_for_prefix('ims_gateway', 'esignatures');
SELECT rls_policy_for_prefix('ims_gateway', 'erasure');
SELECT rls_policy_for_prefix('ims_gateway', 'compliance');
SELECT rls_policy_for_prefix('ims_gateway', 'webhook');

-- Health & Safety (ISO 45001)
SELECT rls_policy_for_prefix('ims_health_safety', 'hs_');

-- Environment (ISO 14001)
SELECT rls_policy_for_prefix('ims_environment', 'env_');

-- Quality (ISO 9001)
SELECT rls_policy_for_prefix('ims_quality', 'qual_');
SELECT rls_policy_for_prefix('ims_quality', 'customer_complaints');
SELECT rls_policy_for_prefix('ims_quality', 'product_spec');
SELECT rls_policy_for_prefix('ims_quality', 'approved_suppliers');
SELECT rls_policy_for_prefix('ims_quality', 'counterfeit');
SELECT rls_policy_for_prefix('ims_quality', 'quarantine');

-- AI Analysis
SELECT rls_policy_for_prefix('ims_ai', 'ai_');

-- Inventory
SELECT rls_policy_for_prefix('ims_inventory', 'product');
SELECT rls_policy_for_prefix('ims_inventory', 'inventory_');
SELECT rls_policy_for_prefix('ims_inventory', 'goods_');
SELECT rls_policy_for_prefix('ims_inventory', 'purchase_');
SELECT rls_policy_for_prefix('ims_inventory', 'stock_');
SELECT rls_policy_for_prefix('ims_inventory', 'warehouses');
SELECT rls_policy_for_prefix('ims_inventory', 'suppliers');

-- HR
SELECT rls_policy_for_prefix('ims_hr', 'hr_');

-- Payroll
SELECT rls_policy_for_prefix('ims_payroll', 'payroll_');

-- Workflows
SELECT rls_policy_for_prefix('ims_workflows', 'wf_');

-- Project Management
SELECT rls_policy_for_prefix('ims_project_management', 'project');
SELECT rls_policy_for_prefix('ims_project_management', 'benefit');

-- Automotive (IATF 16949 / APQP)
SELECT rls_policy_for_prefix('ims_automotive', 'apqp_');
SELECT rls_policy_for_prefix('ims_automotive', 'fmea_');
SELECT rls_policy_for_prefix('ims_automotive', 'ppap_');
SELECT rls_policy_for_prefix('ims_automotive', 'spc_');
SELECT rls_policy_for_prefix('ims_automotive', 'msa_');
SELECT rls_policy_for_prefix('ims_automotive', 'csr_');
SELECT rls_policy_for_prefix('ims_automotive', 'lpa_');
SELECT rls_policy_for_prefix('ims_automotive', 'control_');
SELECT rls_policy_for_prefix('ims_automotive', 'supplier_');
SELECT rls_policy_for_prefix('ims_automotive', 'customer_');
SELECT rls_policy_for_prefix('ims_automotive', 'eight_d');

-- Medical (ISO 13485 / FDA 21 CFR Part 820)
SELECT rls_policy_for_prefix('ims_medical', 'med_');
SELECT rls_policy_for_prefix('ims_medical', 'design_');
SELECT rls_policy_for_prefix('ims_medical', 'device_');
SELECT rls_policy_for_prefix('ims_medical', 'dhr_');
SELECT rls_policy_for_prefix('ims_medical', 'medical_');
SELECT rls_policy_for_prefix('ims_medical', 'udi_');
SELECT rls_policy_for_prefix('ims_medical', 'pms_');
SELECT rls_policy_for_prefix('ims_medical', 'regulatory_');
SELECT rls_policy_for_prefix('ims_medical', 'hazards_');
SELECT rls_policy_for_prefix('ims_medical', 'soup_');
SELECT rls_policy_for_prefix('ims_medical', 'software_');
SELECT rls_policy_for_prefix('ims_medical', 'traceability_');

-- Aerospace (AS9100)
SELECT rls_policy_for_prefix('ims_aerospace', 'aero_');
SELECT rls_policy_for_prefix('ims_aerospace', 'engineering_');
SELECT rls_policy_for_prefix('ims_aerospace', 'fatigue_');
SELECT rls_policy_for_prefix('ims_aerospace', 'oasis_');

-- Finance
SELECT rls_policy_for_prefix('ims_finance', 'fin_');

-- CRM
SELECT rls_policy_for_prefix('ims_crm', 'crm_');

-- InfoSec (ISO 27001)
SELECT rls_policy_for_prefix('ims_infosec', 'is_');

-- ESG
SELECT rls_policy_for_prefix('ims_esg', 'esg_');

-- CMMS
SELECT rls_policy_for_prefix('ims_cmms', 'cmms_');

-- Customer/Supplier Portal
SELECT rls_policy_for_prefix('ims_portal', 'portal_');

-- Food Safety (ISO 22000 / HACCP)
SELECT rls_policy_for_prefix('ims_food_safety', 'fs_');

-- Energy (ISO 50001)
SELECT rls_policy_for_prefix('ims_energy', 'energy_');

-- Analytics / BI
SELECT rls_policy_for_prefix('ims_analytics', 'analytics_');

-- Field Service
SELECT rls_policy_for_prefix('ims_field_service', 'field_service_');

-- ISO 42001 (AI Management)
SELECT rls_policy_for_prefix('ims_iso42001', 'ai42001_');
SELECT rls_policy_for_prefix('ims_iso42001', 'iso42001_');

-- ISO 37001 (Anti-Bribery)
SELECT rls_policy_for_prefix('ims_iso37001', 'ab_');
SELECT rls_policy_for_prefix('ims_iso37001', 'iso37001_');

-- Marketing
SELECT rls_policy_for_prefix('ims_marketing', 'mkt_');

-- Partners
SELECT rls_policy_for_prefix('ims_partners', 'partner_');

-- Risk
SELECT rls_policy_for_prefix('ims_risk', 'risk_');

-- Training
SELECT rls_policy_for_prefix('ims_training', 'train_');

-- Suppliers (Supplier Management module)
SELECT rls_policy_for_prefix('ims_suppliers', 'supp_');

-- Assets
SELECT rls_policy_for_prefix('ims_assets', 'asset_');

-- Documents
SELECT rls_policy_for_prefix('ims_documents', 'doc_');

-- Complaints
SELECT rls_policy_for_prefix('ims_complaints', 'comp_');

-- Contracts
SELECT rls_policy_for_prefix('ims_contracts', 'cont_');

-- Permit-to-Work
SELECT rls_policy_for_prefix('ims_ptw', 'ptw_');

-- Regulatory Monitor
SELECT rls_policy_for_prefix('ims_reg_monitor', 'reg_');

-- Incidents
SELECT rls_policy_for_prefix('ims_incidents', 'inc_');

-- Audits
SELECT rls_policy_for_prefix('ims_audits', 'aud_');

-- Management Review
SELECT rls_policy_for_prefix('ims_mgmt_review', 'mgmt_');

-- Chemicals
SELECT rls_policy_for_prefix('ims_chemicals', 'chem_');

-- Emergency Management
SELECT rls_policy_for_prefix('ims_emergency', 'fem_');
SELECT rls_policy_for_prefix('ims_emergency', 'emergency_');

-- =============================================================================
-- Step 4: [OPTIONAL — Future Enhancement] Organisation-level row isolation
-- =============================================================================
-- Once per-service DB connections are rolled out (see create-db-users.sql),
-- the next tier of isolation is organisation-scoped row access for SaaS
-- multi-tenancy.  The application layer must SET LOCAL "app.org_id" = '<uuid>'
-- inside a transaction before running queries.
--
-- Example for hs_risks (and any other table with an "orgId" column):
--
--   CREATE POLICY org_isolation ON "hs_risks" AS RESTRICTIVE
--     USING (
--       "orgId" IS NULL  -- no org filter on system-level rows
--       OR "orgId" = current_setting('app.org_id', true)
--     );
--
-- The RESTRICTIVE qualifier means the policy is ANDed with any PERMISSIVE
-- policies — so the user must pass both service-level AND org-level checks.
--
-- Application-layer pattern (Express middleware, runs in Prisma $transaction):
--   await prisma.$executeRaw`SET LOCAL "app.org_id" = ${user.organisationId}`;
--
-- This is left as a future sprint item requiring:
--   1. Prisma $transaction wrapper in every route handler
--   2. Middleware to inject SET LOCAL before each query
--   3. Tables must have consistent "orgId" column presence verified
-- =============================================================================

-- =============================================================================
-- Step 5: Verification report
-- =============================================================================

DO $$
DECLARE
    rls_enabled      BIGINT;
    total_tables     BIGINT;
    policies_created BIGINT;
BEGIN
    SELECT COUNT(*) INTO total_tables
    FROM pg_tables
    WHERE schemaname = 'public';

    SELECT COUNT(*) INTO rls_enabled
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
      AND c.relrowsecurity = true;

    SELECT COUNT(*) INTO policies_created
    FROM pg_policies
    WHERE schemaname = 'public'
      AND policyname LIKE 'svc_%';

    RAISE NOTICE '=== RLS Enablement Summary ===';
    RAISE NOTICE 'Total public tables: %',       total_tables;
    RAISE NOTICE 'Tables with RLS enabled: %',   rls_enabled;
    RAISE NOTICE 'Service policies created: %',  policies_created;
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANT: Tables with RLS enabled but no matching policy';
    RAISE NOTICE '  → will be invisible to non-superuser roles (default deny).';
    RAISE NOTICE '  → postgres superuser bypasses RLS — dev/migrations unaffected.';
    RAISE NOTICE '';
    RAISE NOTICE 'To view all policies: SELECT * FROM pg_policies WHERE schemaname=''public'';';
    RAISE NOTICE 'To view uncovered tables (RLS on, no policy for a role):';
    RAISE NOTICE '  SELECT tablename FROM pg_tables t';
    RAISE NOTICE '  JOIN pg_class c ON c.relname = t.tablename';
    RAISE NOTICE '  WHERE t.schemaname=''public'' AND c.relrowsecurity=true';
    RAISE NOTICE '  AND t.tablename NOT IN (SELECT tablename FROM pg_policies WHERE schemaname=''public'');';
END $$;

-- Clean up helper function (kept for idempotent re-runs)
-- DROP FUNCTION IF EXISTS rls_policy_for_prefix(TEXT, TEXT);
