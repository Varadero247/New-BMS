# Learning Objectives — Nexara IMS Administrator Training

**Bloom's Taxonomy Key**: R = Remember | U = Understand | A = Apply | AN = Analyse | E = Evaluate | C = Create

---

## Module 1 — User Management & SCIM Provisioning (90 min)

| # | Objective | Bloom's Level |
|---|-----------|---------------|
| 1.1 | **Describe** the full IMS user lifecycle from creation through deactivation, including SCIM 2.0 provisioning triggers | U |
| 1.2 | **Configure** bulk user import via CSV, including field mapping, validation rules, and error remediation | A |
| 1.3 | **Connect** an external Identity Provider (IdP) to the IMS using SCIM 2.0 endpoints and bearer token authentication | A |
| 1.4 | **Diagnose** common SCIM provisioning failures by interpreting event logs and HTTP response codes | AN |
| 1.5 | **Design** a user governance policy including account naming conventions, group membership, and deprovisioning triggers | C |

### Key Topics
- User account states: Active, Inactive, Suspended, Pending
- SCIM 2.0 endpoints: `/scim/v2/Users`, `/scim/v2/Groups`
- Bulk operations: CSV import, API batch create
- IdP integration: Azure AD, Okta, Google Workspace, OneLogin
- Password policy configuration
- Account deprovisioning: soft-delete vs hard-delete

---

## Module 2 — Role & Permission Configuration (90 min)

| # | Objective | Bloom's Level |
|---|-----------|---------------|
| 2.1 | **Identify** all 39 predefined IMS roles and their default permission sets across 17 modules | R |
| 2.2 | **Explain** the 7 permission levels (None, View, Comment, Create, Edit, Delete, Admin) and how they interact | U |
| 2.3 | **Construct** a custom role matrix that satisfies a given organisational security policy | C |
| 2.4 | **Evaluate** an existing role assignment for least-privilege violations and propose corrections | E |
| 2.5 | **Apply** role inheritance and permission override rules to resolve access conflicts | A |

### Key Topics
- 39 predefined roles: Super Admin, Org Admin, Module Admin, Auditor, Viewer, and 34 domain roles
- 7 permission levels and cumulative grant model
- 17 module permission namespaces
- Role inheritance hierarchy
- Temporary access grants and expiry
- Permission conflict resolution: most-permissive vs most-restrictive

---

## Module 3 — Module Activation & Configuration (90 min)

| # | Objective | Bloom's Level |
|---|-----------|---------------|
| 3.1 | **List** all 44 IMS modules and identify their activation dependencies | R |
| 3.2 | **Interpret** the module dependency graph to plan a safe activation sequence | AN |
| 3.3 | **Activate** and configure three IMS modules end-to-end including parameter settings and initial data setup | A |
| 3.4 | **Troubleshoot** a module activation failure using the event log and dependency checker | AN |
| 3.5 | **Create** a module activation plan for a new IMS deployment covering the full 44-module suite | C |

### Key Topics
- Module registry: 44 modules across 17 domains
- Activation states: Inactive, Activating, Active, Error, Suspended
- Module dependencies: hard (required) vs soft (recommended)
- Configuration parameters: organisation-level and module-level
- Module deactivation: data preservation and archive modes
- Activation rollback procedures

---

## Module 4 — Integration Management (90 min)

| # | Objective | Bloom's Level |
|---|-----------|---------------|
| 4.1 | **Generate** API keys with appropriate scope, expiry, and IP allow-list restrictions | A |
| 4.2 | **Configure** an OAuth 2.0 client application with correct redirect URIs and granted scopes | A |
| 4.3 | **Implement** SAML 2.0 SSO by exchanging metadata, mapping attributes, and testing the authentication flow | A |
| 4.4 | **Register** a webhook endpoint, select event types, and validate delivery using the test-fire mechanism | A |
| 4.5 | **Audit** the integration inventory for expired credentials, overly-scoped keys, and inactive webhooks | AN |

### Key Topics
- API key lifecycle: generation, rotation, revocation
- Scopes and rate limiting
- OAuth 2.0: client credentials and authorisation code flows
- SAML 2.0: IdP-initiated and SP-initiated SSO
- Attribute mapping: email, displayName, groups → roles
- Webhooks: event selection, retry logic, HMAC-SHA256 verification
- Integration audit log

---

## Module 5 — Audit Log Review (90 min)

| # | Objective | Bloom's Level |
|---|-----------|---------------|
| 5.1 | **Describe** the IMS audit architecture including event ingestion, storage, retention, and tamper-evidence | U |
| 5.2 | **Classify** audit events using the IMS event taxonomy (Auth, Data, Admin, Integration, System) | AN |
| 5.3 | **Filter** audit logs to isolate a specific user's actions within a defined time window | A |
| 5.4 | **Investigate** a simulated security incident (privilege escalation) using only audit log data | AN |
| 5.5 | **Export** audit data in CSV and JSON formats for regulatory reporting and SIEM integration | A |

### Key Topics
- Audit event schema: timestamp, actor, action, target, outcome, ipAddress, sessionId
- Event taxonomy: 5 categories, 47 event types
- Retention policy: 7 years (GDPR/ISO 27001)
- Tamper-evidence: SHA-256 chained hashing
- Filtering: user, date range, event type, outcome
- Export formats and SIEM integration
- Compliance reports: ISO 27001, SOC 2, GDPR

---

## Module 6 — Backup & Restore Procedures (90 min)

| # | Objective | Bloom's Level |
|---|-----------|---------------|
| 6.1 | **Explain** the IMS backup architecture including full, incremental, and WAL-archive strategies | U |
| 6.2 | **Execute** a manual pg_dump backup and verify backup integrity | A |
| 6.3 | **Configure** automated backup schedules with retention policies and offsite replication | A |
| 6.4 | **Perform** a restore from backup into a target environment using the DR runbook | A |
| 6.5 | **Evaluate** a backup audit report and identify gaps in coverage or retention compliance | E |

### Key Topics
- pg_dump / pg_restore: full and schema-specific
- WAL archiving and point-in-time recovery (PITR)
- Backup schedule: hourly incremental, daily full, weekly offsite
- Retention tiers: 7 days hot, 30 days warm, 365 days cold
- Restore procedures: production, staging, DR environments
- Backup integrity verification: checksum and test-restore
- Disaster Recovery runbook steps

---

## Module 7 — Platform Update Management (60 min)

| # | Objective | Bloom's Level |
|---|-----------|---------------|
| 7.1 | **Describe** the Nexara IMS update lifecycle: release → staging → production gates | U |
| 7.2 | **Plan** a platform update using the pre-update checklist and change management process | A |
| 7.3 | **Monitor** an update deployment using health checks, smoke tests, and error dashboards | A |
| 7.4 | **Execute** an emergency rollback procedure within the 30-minute SLA | A |
| 7.5 | **Manage** feature flags to enable/disable new features independently of code deployment | A |

### Key Topics
- Update types: patch, minor, major; breaking-change signals
- Staging gate criteria: automated tests + manual sign-off
- Pre-update checklist: 12-point validation
- Zero-downtime deployment strategies
- Rollback triggers and SLA: 30 minutes from detection
- Feature flags: per-organisation, per-role, A/B testing
- Post-update validation checklist

---

## Cross-Module Objectives

| # | Objective | Bloom's Level |
|---|-----------|---------------|
| X.1 | **Articulate** the security implications of each administrative action | E |
| X.2 | **Document** administrative changes in the audit log and change management system | A |
| X.3 | **Apply** the principle of least privilege across all configuration decisions | A |
| X.4 | **Interpret** error messages and log entries to self-resolve common issues | AN |

---

*Objectives reviewed against Bloom's Revised Taxonomy (Anderson & Krathwohl, 2001). Last updated: February 2026.*
