# Competency Framework — Nexara IMS Administrator Training

**Framework Version**: 1.0
**Assessment Mapping**: Each competency maps to at least one assessment item and one lab task.

---

## Framework Overview

The Nexara IMS Administrator Competency Framework defines seven administration domains. Each domain contains observable behaviours at three proficiency levels:

| Level | Label | Description |
|-------|-------|-------------|
| 1 | **Developing** | Can perform tasks with guidance; understands concepts but requires support |
| 2 | **Proficient** | Can perform tasks independently; applies knowledge correctly in standard scenarios |
| 3 | **Advanced** | Can perform tasks in complex/novel situations; coaches others; identifies improvements |

**Certification target**: Participants must demonstrate Level 2 across all domains to pass; Level 3 in ≥ 4 domains for Distinction.

---

## Domain 1 — User Lifecycle Management

**Definition**: The ability to configure, maintain, and govern user accounts across the full lifecycle from provisioning to deprovisioning.

### Observable Behaviours

| Behaviour | Level |
|-----------|-------|
| Creates individual user accounts with correct profile fields and initial role assignment | 1 |
| Executes bulk user import via CSV with field mapping and error correction | 2 |
| Configures SCIM 2.0 provisioning with an external IdP end-to-end | 2 |
| Diagnoses SCIM provisioning failures using HTTP codes and event logs | 3 |
| Designs an organisation-wide user governance policy covering naming, groups, and deprovisioning | 3 |

### Assessment Mapping
- Pre-assessment: Q1–4
- Day 1 Formative: Q1–3
- Summative MCQ: Q1–8
- Lab sign-off: LAB-01

---

## Domain 2 — Role-Based Access Control

**Definition**: The ability to design, implement, and audit role and permission configurations that enforce least-privilege across all IMS modules.

### Observable Behaviours

| Behaviour | Level |
|-----------|-------|
| Assigns predefined roles to users from the 39-role library | 1 |
| Explains how the 7 permission levels interact and the effect of multiple role assignments | 2 |
| Constructs a custom role matrix meeting a stated organisational security policy | 2 |
| Identifies least-privilege violations in an existing role assignment | 3 |
| Resolves permission conflicts using override and inheritance rules | 3 |

### Assessment Mapping
- Pre-assessment: Q5–8
- Day 1 Formative: Q4–6
- Summative MCQ: Q9–16
- Summative Scenario B: Privilege escalation response
- Lab sign-off: LAB-02

---

## Domain 3 — Module Configuration & Governance

**Definition**: The ability to activate, configure, and manage the dependency graph of IMS modules across a deployment.

### Observable Behaviours

| Behaviour | Level |
|-----------|-------|
| Activates a single IMS module through the admin console | 1 |
| Identifies module activation dependencies and plans a safe sequence | 2 |
| Configures all organisation-level and module-level parameters for three modules | 2 |
| Diagnoses an activation failure using event logs and the dependency checker | 3 |
| Creates a full activation plan for a 44-module deployment | 3 |

### Assessment Mapping
- Pre-assessment: Q9–11
- Day 1 Formative: Q7–9
- Summative MCQ: Q17–22
- Lab sign-off: LAB-03

---

## Domain 4 — Integration & API Governance

**Definition**: The ability to create, configure, and audit all integration touchpoints including API keys, OAuth clients, SAML SSO, and webhooks.

### Observable Behaviours

| Behaviour | Level |
|-----------|-------|
| Generates an API key with a defined scope and expiry | 1 |
| Configures an OAuth 2.0 client with correct redirect URIs and scopes | 2 |
| Implements SAML 2.0 SSO with metadata exchange and attribute mapping | 2 |
| Registers and validates a webhook with HMAC-SHA256 verification | 2 |
| Audits the integration inventory and remediates expired or overly-scoped credentials | 3 |

### Assessment Mapping
- Pre-assessment: Q12–14
- Day 1 Formative: Q10–12
- Summative MCQ: Q23–28
- Summative Scenario A: SCIM outage investigation
- Lab sign-off: LAB-04

---

## Domain 5 — Audit & Compliance Monitoring

**Definition**: The ability to navigate, filter, interpret, and export audit log data for compliance and incident investigation purposes.

### Observable Behaviours

| Behaviour | Level |
|-----------|-------|
| Navigates to the audit log and applies basic date and user filters | 1 |
| Classifies an audit event using the IMS event taxonomy | 2 |
| Filters and exports audit data for a compliance report | 2 |
| Investigates a security incident using only audit log data | 3 |
| Configures audit log alerting rules and SIEM export | 3 |

### Assessment Mapping
- Pre-assessment: Q15–17
- Day 2 (embedded in Module 5 checks)
- Summative MCQ: Q29–34
- Summative Scenario B: Privilege escalation investigation
- Lab sign-off: LAB-05

---

## Domain 6 — Data Protection & Disaster Recovery

**Definition**: The ability to execute backup procedures, verify integrity, perform restores, and follow the disaster recovery runbook.

### Observable Behaviours

| Behaviour | Level |
|-----------|-------|
| Identifies where backups are stored and when the last backup ran | 1 |
| Executes a manual pg_dump backup and verifies the output checksum | 2 |
| Configures an automated backup schedule with retention and offsite replication | 2 |
| Performs a restore from a named backup file into a target environment | 2 |
| Evaluates a backup audit report for gaps and proposes remediation | 3 |

### Assessment Mapping
- Pre-assessment: Q18–19
- Summative MCQ: Q35–38
- Summative Scenario C: Failed update rollback / DR scenario
- Lab sign-off: LAB-06

---

## Domain 7 — Change & Update Management

**Definition**: The ability to plan, execute, monitor, and if necessary, roll back platform updates using Nexara's documented change management process.

### Observable Behaviours

| Behaviour | Level |
|-----------|-------|
| Describes the update lifecycle stages and their gate criteria | 1 |
| Executes a pre-update checklist before applying a patch | 2 |
| Monitors an update deployment using health checks and error dashboards | 2 |
| Executes an emergency rollback within the 30-minute SLA | 3 |
| Manages feature flags to enable/disable capabilities per organisation | 3 |

### Assessment Mapping
- Pre-assessment: Q20
- Summative MCQ: Q39–40
- Summative Scenario C: Failed update rollback
- Lab sign-off: LAB-07

---

## Competency Sign-Off Process

Competencies are signed off by the facilitator during lab sessions using the `COMPETENCY-CHECKLIST.md`. Each observable behaviour is rated as:

- **✓ Demonstrated** — participant performed without prompting
- **P Prompted** — participant needed one facilitator prompt
- **✗ Not demonstrated** — participant could not perform; remediation required

A minimum of **5 out of 7 domains at Level 2** with no domain rated below Level 1 is required to sit the summative assessment.

---

*Framework aligned to ISO 30400 (Human Resource Management terminology) and ISO 10015 (Quality Management — Guidelines for competence development). Last reviewed: February 2026.*
