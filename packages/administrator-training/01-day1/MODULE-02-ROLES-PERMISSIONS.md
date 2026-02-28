# Module 2 — Role & Permission Configuration

**Duration**: 90 minutes
**Position**: Day 1, 10:45–12:15
**CPD Hours**: 1.5

---

## Learning Objectives

1. Identify all 39 predefined IMS roles and their default permission sets
2. Explain the 7 permission levels and how they interact across module namespaces
3. Construct a custom role matrix for a given organisational security policy
4. Evaluate existing role assignments for least-privilege violations
5. Apply role inheritance and permission override rules to resolve access conflicts

---

## 1. RBAC Architecture

The IMS implements **Role-Based Access Control (RBAC)** with the following components:

```
User → Role(s) → Permissions
               → Module Namespace
               → Permission Level (None → Admin)
```

**Key principle**: A user's effective permission for a module is the **most permissive** level granted by any of their assigned roles, unless an explicit **DENY** override is set.

---

## 2. The 39 Predefined Roles

### Platform Roles (4)

| Role Identifier | Display Name | Scope |
|-----------------|--------------|-------|
| `SUPER_ADMIN` | Super Administrator | All organisations, all modules, all operations |
| `ORG_ADMIN` | Organisation Administrator | One organisation, all modules |
| `MODULE_ADMIN` | Module Administrator | Assigned modules only |
| `AUDITOR` | Auditor | Read-only, all modules; export; audit log access |

### Governance & Compliance Roles (6)

| Role Identifier | Display Name |
|-----------------|--------------|
| `COMPLIANCE_MANAGER` | Compliance Manager |
| `RISK_MANAGER` | Risk Manager |
| `QUALITY_MANAGER` | Quality Manager |
| `HS_MANAGER` | Health & Safety Manager |
| `ENV_MANAGER` | Environment Manager |
| `ESG_MANAGER` | ESG Manager |

### Operational Roles (10)

| Role Identifier | Display Name |
|-----------------|--------------|
| `OPERATIONS_MANAGER` | Operations Manager |
| `FINANCE_MANAGER` | Finance Manager |
| `HR_MANAGER` | HR Manager |
| `IT_MANAGER` | IT Manager |
| `PROCUREMENT_MANAGER` | Procurement Manager |
| `FACILITIES_MANAGER` | Facilities Manager |
| `MAINTENANCE_MANAGER` | Maintenance Manager |
| `PRODUCTION_MANAGER` | Production Manager |
| `LOGISTICS_MANAGER` | Logistics Manager |
| `SECURITY_MANAGER` | Security Manager |

### Specialist Roles (10)

| Role Identifier | Display Name |
|-----------------|--------------|
| `INCIDENT_INVESTIGATOR` | Incident Investigator |
| `AUDIT_LEAD` | Audit Lead |
| `DOCUMENT_CONTROLLER` | Document Controller |
| `TRAINING_COORDINATOR` | Training Coordinator |
| `CONTRACTOR_SUPERVISOR` | Contractor Supervisor |
| `CHEMICAL_OFFICER` | Chemical Officer |
| `EMERGENCY_COORDINATOR` | Emergency Coordinator |
| `ENERGY_ANALYST` | Energy Analyst |
| `DATA_ANALYST` | Data Analyst |
| `FIELD_ENGINEER` | Field Engineer |

### Viewer & External Roles (9)

| Role Identifier | Display Name |
|-----------------|--------------|
| `VIEWER` | Viewer (read-only, assigned modules) |
| `COMMENTER` | Commenter (read + comment) |
| `EMPLOYEE` | Employee (self-service: training, incidents) |
| `CONTRACTOR` | Contractor (limited task-based access) |
| `CUSTOMER` | Customer Portal User |
| `SUPPLIER` | Supplier Portal User |
| `PARTNER` | Partner Portal User |
| `REGULATOR` | Regulatory Observer (read-only, compliance modules) |
| `EXTERNAL_AUDITOR` | External Auditor (time-limited, audit trail only) |

---

## 3. The 7 Permission Levels

| Level | Identifier | Capabilities |
|-------|-----------|--------------|
| 0 | `NONE` | No access; module not visible |
| 1 | `VIEW` | Read-only access to records and dashboards |
| 2 | `COMMENT` | VIEW + add comments and notes |
| 3 | `CREATE` | COMMENT + create new records |
| 4 | `EDIT` | CREATE + modify existing records |
| 5 | `DELETE` | EDIT + archive and delete records |
| 6 | `ADMIN` | DELETE + configure module settings |

**Cumulative grant model**: Each level includes all permissions of lower levels. There is no way to grant EDIT without also granting VIEW, COMMENT, and CREATE.

---

## 4. The 17 Module Permission Namespaces

Each module has its own permission namespace. Roles grant a permission level per namespace.

| # | Namespace | Module(s) |
|---|-----------|-----------|
| 1 | `health_safety` | Health & Safety |
| 2 | `environment` | Environment |
| 3 | `quality` | Quality Management |
| 4 | `inventory` | Inventory |
| 5 | `hr` | Human Resources, Payroll |
| 6 | `finance` | Finance, Financial Compliance |
| 7 | `crm` | CRM, Customer Portal |
| 8 | `infosec` | InfoSec, Cyber Security |
| 9 | `esg` | ESG, Sustainability |
| 10 | `cmms` | CMMS, Asset Management |
| 11 | `workflows` | Workflows, Project Management |
| 12 | `compliance` | Audit, Document Control, Legal Register |
| 13 | `risk` | Risk Register |
| 14 | `training` | Training & Competency |
| 15 | `supplier_portal` | Supplier Portal, Contractor Management |
| 16 | `operations` | Field Service, Marketing, Analytics |
| 17 | `platform` | Platform settings, Integrations (Admin only) |

---

## 5. Example: Role Permission Matrix

### HS_MANAGER Default Permissions

| Namespace | Level |
|-----------|-------|
| `health_safety` | ADMIN (6) |
| `training` | EDIT (4) |
| `compliance` | VIEW (1) |
| `risk` | EDIT (4) |
| All others | NONE (0) |

### AUDITOR Default Permissions

| Namespace | Level |
|-----------|-------|
| All 17 namespaces | VIEW (1) |
| Audit log access | Enabled |
| Export | Enabled |

---

## 6. Role Inheritance

Roles do not inherit from each other by default. However, a user with multiple roles receives the **union of their permissions** (most permissive wins, per namespace).

**Example:**
- User A has: `VIEWER` (all namespaces: VIEW) + `HS_MANAGER` (health_safety: ADMIN)
- Effective permissions: health_safety = ADMIN; all others = VIEW

---

## 7. Custom Role Creation

**Path**: Admin Console → Roles → New Role

**Fields:**
- `name` — display name (must be unique)
- `identifier` — slug (auto-generated, editable)
- `description` — for audit trail documentation
- Per-namespace permission levels (0–6)

**Best practice**: Create custom roles sparingly. Prefer using predefined roles. If a custom role is needed, document the business justification in the `description` field.

---

## 8. Temporary Access Grants

**Path**: Admin Console → Users → [User] → Temporary Access

- Grant elevated access for a defined period (hours, days)
- Auto-revocation at expiry (logged in audit trail)
- Use case: external auditor, incident investigation, project cover

---

## 9. Permission Conflict Resolution

When a user has roles that grant different levels to the same namespace:
1. **Most-permissive wins** (default behaviour)
2. **DENY override**: An explicit `DENY` set at the user level overrides all role grants
3. **Temporary grants**: Override standard roles for the grant duration

**DENY override path**: Admin Console → Users → [User] → Permissions → Add Denial

Use DENY overrides sparingly — they create complexity and must be documented.

---

## 10. Least-Privilege Audit

Perform quarterly:

1. Export role assignments: Admin Console → Reports → Role Matrix Export (CSV)
2. Filter users with `ADMIN` or `DELETE` on sensitive namespaces
3. Verify each elevated assignment against current job function
4. Downgrade or remove where no longer required
5. Document findings in the change management system

**Red flags:**
- SUPER_ADMIN assigned to more than 2 users
- ADMIN on `platform` namespace for non-IT roles
- External roles (CUSTOMER, SUPPLIER) with CREATE or higher

---

## Module 2 Summary

| Topic | Key Takeaway |
|-------|-------------|
| Roles | 39 predefined; create custom sparingly |
| Permission levels | 7 levels, cumulative (0=None, 6=Admin) |
| Namespaces | 17 module namespaces |
| Multi-role users | Most permissive wins |
| DENY override | User-level explicit denial |
| Governance | Quarterly least-privilege audit |

---

*Proceed to LAB-02 for the role matrix design exercise.*
