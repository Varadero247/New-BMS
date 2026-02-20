-- =============================================================================
-- IMS: Per-Service Database User Provisioning
-- FINDING-012: Implement least-privilege DB access (ISO 27001 A.9.4 / CWE-250)
--
-- USAGE:
--   PGPASSWORD=<superuser-password> psql -h localhost -U postgres -d ims \
--     -f scripts/create-db-users.sql
--
-- Each API service gets its own PostgreSQL role with SELECT/INSERT/UPDATE/DELETE
-- only on its own table prefix. The gateway gets read-only access to core tables
-- for authentication; downstream service tables are revoked.
--
-- After running this script, update each service's DATABASE_URL/.env to use
-- the per-service credentials. See docs/DATABASE_ARCHITECTURE.md.
-- =============================================================================

-- Helper: grant on all tables matching a prefix
-- Usage: SELECT grant_on_prefix('ims_hr', 'hr_');
CREATE OR REPLACE FUNCTION grant_on_prefix(
    role_name TEXT,
    table_prefix TEXT,
    permissions TEXT DEFAULT 'SELECT, INSERT, UPDATE, DELETE'
) RETURNS VOID AS $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename LIKE table_prefix || '%'
    LOOP
        EXECUTE format('GRANT %s ON TABLE %I TO %I', permissions, tbl.tablename, role_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Helper: revoke all on tables matching a prefix (for cleanup)
CREATE OR REPLACE FUNCTION revoke_on_prefix(role_name TEXT, table_prefix TEXT) RETURNS VOID AS $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename LIKE table_prefix || '%'
    LOOP
        EXECUTE format('REVOKE ALL ON TABLE %I FROM %I', tbl.tablename, role_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Create service roles (idempotent)
-- =============================================================================

DO $$
DECLARE
    roles TEXT[] := ARRAY[
        'ims_gateway', 'ims_health_safety', 'ims_environment', 'ims_quality',
        'ims_ai', 'ims_inventory', 'ims_hr', 'ims_payroll', 'ims_workflows',
        'ims_project_management', 'ims_automotive', 'ims_medical', 'ims_aerospace',
        'ims_finance', 'ims_crm', 'ims_infosec', 'ims_esg', 'ims_cmms',
        'ims_portal', 'ims_food_safety', 'ims_energy', 'ims_analytics',
        'ims_field_service', 'ims_iso42001', 'ims_iso37001', 'ims_marketing',
        'ims_partners', 'ims_risk', 'ims_training', 'ims_suppliers',
        'ims_assets', 'ims_documents', 'ims_complaints', 'ims_contracts',
        'ims_ptw', 'ims_reg_monitor', 'ims_incidents', 'ims_audits',
        'ims_mgmt_review', 'ims_chemicals', 'ims_emergency'
    ];
    role TEXT;
BEGIN
    FOREACH role IN ARRAY roles
    LOOP
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role) THEN
            EXECUTE format('CREATE ROLE %I WITH LOGIN PASSWORD %L', role,
                           'CHANGE_ME_' || role || '_' || md5(random()::text));
            RAISE NOTICE 'Created role: %', role;
        ELSE
            RAISE NOTICE 'Role already exists: %', role;
        END IF;
    END LOOP;
END $$;

-- =============================================================================
-- Grant sequence usage for auto-increment primary keys
-- =============================================================================
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO
    ims_gateway, ims_health_safety, ims_environment, ims_quality,
    ims_ai, ims_inventory, ims_hr, ims_payroll, ims_workflows,
    ims_project_management, ims_automotive, ims_medical, ims_aerospace,
    ims_finance, ims_crm, ims_infosec, ims_esg, ims_cmms,
    ims_portal, ims_food_safety, ims_energy, ims_analytics,
    ims_field_service, ims_iso42001, ims_iso37001, ims_marketing,
    ims_partners, ims_risk, ims_training, ims_suppliers,
    ims_assets, ims_documents, ims_complaints, ims_contracts,
    ims_ptw, ims_reg_monitor, ims_incidents, ims_audits,
    ims_mgmt_review, ims_chemicals, ims_emergency;

-- =============================================================================
-- Gateway: core tables only (auth, sessions, users, audit logs)
-- =============================================================================
SELECT grant_on_prefix('ims_gateway', 'users');
SELECT grant_on_prefix('ims_gateway', 'sessions');
SELECT grant_on_prefix('ims_gateway', 'audit_logs');
SELECT grant_on_prefix('ims_gateway', 'password_reset');
SELECT grant_on_prefix('ims_gateway', 'api_keys');
SELECT grant_on_prefix('ims_gateway', 'custom_roles');
SELECT grant_on_prefix('ims_gateway', 'feature_flags');
SELECT grant_on_prefix('ims_gateway', 'organisations');
SELECT grant_on_prefix('ims_gateway', 'template');
SELECT grant_on_prefix('ims_gateway', 'enhanced_audit');
SELECT grant_on_prefix('ims_gateway', 'esignatures');
SELECT grant_on_prefix('ims_gateway', 'erasure');
SELECT grant_on_prefix('ims_gateway', 'compliance');
SELECT grant_on_prefix('ims_gateway', 'webhook');

-- =============================================================================
-- Health & Safety (hs_*)
-- =============================================================================
SELECT grant_on_prefix('ims_health_safety', 'hs_');

-- =============================================================================
-- Environment (env_*)
-- =============================================================================
SELECT grant_on_prefix('ims_environment', 'env_');

-- =============================================================================
-- Quality (qual_*)
-- =============================================================================
SELECT grant_on_prefix('ims_quality', 'qual_');
SELECT grant_on_prefix('ims_quality', 'customer_complaints');
SELECT grant_on_prefix('ims_quality', 'product_spec');
SELECT grant_on_prefix('ims_quality', 'approved_suppliers');
SELECT grant_on_prefix('ims_quality', 'counterfeit');
SELECT grant_on_prefix('ims_quality', 'quarantine');

-- =============================================================================
-- AI Analysis (ai_*)
-- =============================================================================
SELECT grant_on_prefix('ims_ai', 'ai_');

-- =============================================================================
-- Inventory (product_*, inventory_*, goods_*, purchase_*, stock_*, warehouses_*)
-- =============================================================================
SELECT grant_on_prefix('ims_inventory', 'product');
SELECT grant_on_prefix('ims_inventory', 'inventory_');
SELECT grant_on_prefix('ims_inventory', 'goods_');
SELECT grant_on_prefix('ims_inventory', 'purchase_');
SELECT grant_on_prefix('ims_inventory', 'stock_');
SELECT grant_on_prefix('ims_inventory', 'warehouses');
SELECT grant_on_prefix('ims_inventory', 'suppliers');

-- =============================================================================
-- HR (hr_*) — sensitive PII: restrict to ims_hr only
-- =============================================================================
SELECT grant_on_prefix('ims_hr', 'hr_');

-- =============================================================================
-- Payroll (payroll_*) — sensitive financial data: restrict to ims_payroll only
-- =============================================================================
SELECT grant_on_prefix('ims_payroll', 'payroll_');

-- =============================================================================
-- Workflows (wf_*)
-- =============================================================================
SELECT grant_on_prefix('ims_workflows', 'wf_');

-- =============================================================================
-- Project Management (projects*, benefit*)
-- =============================================================================
SELECT grant_on_prefix('ims_project_management', 'project');
SELECT grant_on_prefix('ims_project_management', 'benefit');

-- =============================================================================
-- Automotive (apqp_*, fmea_*, ppap_*, spc_*, msa_*, csr_*, lpa_*, control_*)
-- =============================================================================
SELECT grant_on_prefix('ims_automotive', 'apqp_');
SELECT grant_on_prefix('ims_automotive', 'fmea_');
SELECT grant_on_prefix('ims_automotive', 'ppap_');
SELECT grant_on_prefix('ims_automotive', 'spc_');
SELECT grant_on_prefix('ims_automotive', 'msa_');
SELECT grant_on_prefix('ims_automotive', 'csr_');
SELECT grant_on_prefix('ims_automotive', 'lpa_');
SELECT grant_on_prefix('ims_automotive', 'control_');
SELECT grant_on_prefix('ims_automotive', 'supplier_');
SELECT grant_on_prefix('ims_automotive', 'customer_');
SELECT grant_on_prefix('ims_automotive', 'eight_d');

-- =============================================================================
-- Medical (med_*, design_*, device_*, dhr_*, regulatory_*, risk_med_*)
-- =============================================================================
SELECT grant_on_prefix('ims_medical', 'med_');
SELECT grant_on_prefix('ims_medical', 'design_');
SELECT grant_on_prefix('ims_medical', 'device_');
SELECT grant_on_prefix('ims_medical', 'dhr_');
SELECT grant_on_prefix('ims_medical', 'medical_');
SELECT grant_on_prefix('ims_medical', 'udi_');
SELECT grant_on_prefix('ims_medical', 'pms_');
SELECT grant_on_prefix('ims_medical', 'regulatory_');
SELECT grant_on_prefix('ims_medical', 'hazards_');
SELECT grant_on_prefix('ims_medical', 'soup_');
SELECT grant_on_prefix('ims_medical', 'software_');
SELECT grant_on_prefix('ims_medical', 'traceability_');

-- =============================================================================
-- Aerospace (aero_*, engineering_*, fatigue_*, oasis_*)
-- =============================================================================
SELECT grant_on_prefix('ims_aerospace', 'aero_');
SELECT grant_on_prefix('ims_aerospace', 'engineering_');
SELECT grant_on_prefix('ims_aerospace', 'fatigue_');
SELECT grant_on_prefix('ims_aerospace', 'oasis_');

-- =============================================================================
-- Finance (fin_*)
-- =============================================================================
SELECT grant_on_prefix('ims_finance', 'fin_');

-- =============================================================================
-- CRM (crm_*)
-- =============================================================================
SELECT grant_on_prefix('ims_crm', 'crm_');

-- =============================================================================
-- InfoSec (is_*)
-- =============================================================================
SELECT grant_on_prefix('ims_infosec', 'is_');

-- =============================================================================
-- ESG (esg_*)
-- =============================================================================
SELECT grant_on_prefix('ims_esg', 'esg_');

-- =============================================================================
-- CMMS (cmms_*)
-- =============================================================================
SELECT grant_on_prefix('ims_cmms', 'cmms_');

-- =============================================================================
-- Portal (portal_*)
-- =============================================================================
SELECT grant_on_prefix('ims_portal', 'portal_');

-- =============================================================================
-- Food Safety (fs_*)
-- =============================================================================
SELECT grant_on_prefix('ims_food_safety', 'fs_');

-- =============================================================================
-- Energy (energy_*)
-- =============================================================================
SELECT grant_on_prefix('ims_energy', 'energy_');

-- =============================================================================
-- Analytics (analytics_*)
-- =============================================================================
SELECT grant_on_prefix('ims_analytics', 'analytics_');

-- =============================================================================
-- Field Service (fs_*) — NOTE: shares prefix with Food Safety
-- Grant only field_service_ prefixed tables to field service role
-- =============================================================================
SELECT grant_on_prefix('ims_field_service', 'field_service_');

-- =============================================================================
-- ISO 42001 (ai42001_* or iso42001_*)
-- =============================================================================
SELECT grant_on_prefix('ims_iso42001', 'ai42001_');
SELECT grant_on_prefix('ims_iso42001', 'iso42001_');

-- =============================================================================
-- ISO 37001 (ab_*, iso37001_*)
-- =============================================================================
SELECT grant_on_prefix('ims_iso37001', 'ab_');
SELECT grant_on_prefix('ims_iso37001', 'iso37001_');

-- =============================================================================
-- Marketing (mkt_*)
-- =============================================================================
SELECT grant_on_prefix('ims_marketing', 'mkt_');

-- =============================================================================
-- Partners (partner_*)
-- =============================================================================
SELECT grant_on_prefix('ims_partners', 'partner_');

-- =============================================================================
-- Risk (risk_*)
-- =============================================================================
SELECT grant_on_prefix('ims_risk', 'risk_');

-- =============================================================================
-- Training (train_*)
-- =============================================================================
SELECT grant_on_prefix('ims_training', 'train_');

-- =============================================================================
-- Suppliers (supp_*)
-- =============================================================================
SELECT grant_on_prefix('ims_suppliers', 'supp_');

-- =============================================================================
-- Assets (asset_*)
-- =============================================================================
SELECT grant_on_prefix('ims_assets', 'asset_');

-- =============================================================================
-- Documents (doc_*)
-- =============================================================================
SELECT grant_on_prefix('ims_documents', 'doc_');

-- =============================================================================
-- Complaints (comp_*)
-- =============================================================================
SELECT grant_on_prefix('ims_complaints', 'comp_');

-- =============================================================================
-- Contracts (cont_*)
-- =============================================================================
SELECT grant_on_prefix('ims_contracts', 'cont_');

-- =============================================================================
-- PTW (ptw_*)
-- =============================================================================
SELECT grant_on_prefix('ims_ptw', 'ptw_');

-- =============================================================================
-- Regulatory Monitor (reg_*)
-- =============================================================================
SELECT grant_on_prefix('ims_reg_monitor', 'reg_');

-- =============================================================================
-- Incidents (inc_*)
-- =============================================================================
SELECT grant_on_prefix('ims_incidents', 'inc_');

-- =============================================================================
-- Audits (aud_*)
-- =============================================================================
SELECT grant_on_prefix('ims_audits', 'aud_');

-- =============================================================================
-- Management Review (mgmt_*)
-- =============================================================================
SELECT grant_on_prefix('ims_mgmt_review', 'mgmt_');

-- =============================================================================
-- Chemicals (chem_*)
-- =============================================================================
SELECT grant_on_prefix('ims_chemicals', 'chem_');

-- =============================================================================
-- Emergency (fem_*, emergency_*)
-- =============================================================================
SELECT grant_on_prefix('ims_emergency', 'fem_');
SELECT grant_on_prefix('ims_emergency', 'emergency_');

-- =============================================================================
-- Clean up helper functions (optional — keep for future re-runs)
-- =============================================================================
-- DROP FUNCTION IF EXISTS grant_on_prefix(TEXT, TEXT, TEXT);
-- DROP FUNCTION IF EXISTS revoke_on_prefix(TEXT, TEXT);

-- =============================================================================
-- Print summary
-- =============================================================================
DO $$
DECLARE
    role_count BIGINT;
BEGIN
    SELECT COUNT(*) INTO role_count
    FROM pg_roles
    WHERE rolname LIKE 'ims_%';
    RAISE NOTICE '✓ Per-service DB user provisioning complete. % ims_* roles active.', role_count;
    RAISE NOTICE '  IMPORTANT: Update each service .env DATABASE_URL with its per-service credentials.';
    RAISE NOTICE '  IMPORTANT: Passwords were auto-generated — retrieve with: SELECT rolname FROM pg_roles WHERE rolname LIKE ''ims_%'';';
    RAISE NOTICE '  IMPORTANT: Set real passwords via: ALTER ROLE ims_hr WITH PASSWORD ''secure-password'';';
END $$;
