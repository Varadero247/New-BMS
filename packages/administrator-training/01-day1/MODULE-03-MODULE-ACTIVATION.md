# Module 3 — Module Activation & Configuration

**Duration**: 90 minutes
**Position**: Day 1, 13:00–14:30
**CPD Hours**: 1.5

---

## Learning Objectives

1. List all 44 IMS modules and identify their activation dependencies
2. Interpret the module dependency graph to plan a safe activation sequence
3. Activate and configure three IMS modules end-to-end
4. Troubleshoot a module activation failure using event logs
5. Create a module activation plan for a new IMS deployment

---

## 1. Module Registry Overview

The IMS hosts 44 functional modules across 17 operational domains. All modules share a single platform but are independently activatable.

**Activation model**: Modules must be purchased (licensed), then activated by an admin. Inactive modules are not accessible to users and do not consume processing resources.

---

## 2. Module Activation States

| State | Description |
|-------|-------------|
| `INACTIVE` | Not activated; not accessible |
| `ACTIVATING` | Activation in progress (database provisioning, config init) |
| `ACTIVE` | Fully activated and accessible to users |
| `ERROR` | Activation failed; partial state; requires intervention |
| `SUSPENDED` | Activated but temporarily disabled by platform admin |
| `ARCHIVED` | Deactivated; data preserved in read-only archive |

**Typical activation time**: 30–120 seconds (database schema provisioning, index creation, seed data)

---

## 3. The 44 IMS Modules

### Health, Safety & Environment (4)
| Module | Identifier | Port |
|--------|-----------|------|
| Health & Safety (ISO 45001) | `health-safety` | 3001 |
| Environment (ISO 14001) | `environment` | 3002 |
| Food Safety | `food-safety` | 3020 |
| Emergency Management | `emergency` | 3045 |

### Quality & Compliance (6)
| Module | Identifier | Port |
|--------|-----------|------|
| Quality Management (ISO 9001) | `quality` | 3003 |
| Audit Management | `audits` | 3042 |
| Document Control | `documents` | 3035 |
| Corrective Action | `corrective-action` | — |
| Complaints Management | `complaints` | 3036 |
| Management Review | `mgmt-review` | 3043 |

### Risk & Governance (5)
| Module | Identifier | Port |
|--------|-----------|------|
| Risk Register | `risk` | 3031 |
| Incident Management | `incidents` | 3041 |
| Permit to Work | `ptw` | 3039 |
| Legal & Regulatory Monitor | `reg-monitor` | 3040 |
| Business Continuity | `business-continuity` | — |

### People & Training (3)
| Module | Identifier | Port |
|--------|-----------|------|
| Human Resources | `hr` | 3006 |
| Payroll | `payroll` | 3007 |
| Training & Competency | `training` | 3032 |

### Operations & Maintenance (5)
| Module | Identifier | Port |
|--------|-----------|------|
| CMMS (Maintenance) | `cmms` | 3017 |
| Asset Management | `assets` | 3034 |
| Inventory | `inventory` | 3005 |
| Field Service | `field-service` | 3023 |
| Equipment Calibration | `calibration` | — |

### Finance & Strategy (4)
| Module | Identifier | Port |
|--------|-----------|------|
| Finance | `finance` | 3013 |
| Financial Compliance | `fin-compliance` | 3038 |
| ESG & Sustainability | `esg` | 3016 |
| Energy Management | `energy` | 3021 |

### Customer & Supplier Management (5)
| Module | Identifier | Port |
|--------|-----------|------|
| CRM | `crm` | 3014 |
| Customer Portal | `customer-portal` | 3018 |
| Supplier Portal | `supplier-portal` | 3019 |
| Supplier Evaluation | `suppliers` | 3033 |
| Contractor Management | `contractor-management` | — |

### IT & Security (5)
| Module | Identifier | Port |
|--------|-----------|------|
| InfoSec (ISO 27001) | `infosec` | 3015 |
| Cyber Security | `cyber-security` | — |
| ISO 42001 (AI Governance) | `iso42001` | 3024 |
| ISO 37001 (Anti-bribery) | `iso37001` | 3025 |
| Data Governance | `data-governance` | — |

### Analytics & Workflows (5)
| Module | Identifier | Port |
|--------|-----------|------|
| Analytics | `analytics` | 3022 |
| Workflows | `workflows` | 3008 |
| Project Management | `project-management` | 3009 |
| Marketing | `marketing` | 3030 |
| Partners Portal | `partners` | 3026 |

### Sector-Specific (2)
| Module | Identifier | Port |
|--------|-----------|------|
| Automotive (IATF 16949) | `automotive` | 3010 |
| Medical Devices (ISO 13485) | `medical` | 3011 |
| Aerospace (AS9100D) | `aerospace` | 3012 |

---

## 4. Module Dependencies

Dependencies define which modules must be active before another can be activated.

### Hard Dependencies (Required)

| Module | Requires |
|--------|---------|
| `incidents` | `health-safety` |
| `corrective-action` | `quality` OR `incidents` |
| `mgmt-review` | `audits` |
| `fin-compliance` | `finance` |
| `supplier-portal` | `suppliers` |
| `customer-portal` | `crm` |
| `energy` | `environment` |
| `calibration` | `cmms` |
| `payroll` | `hr` |

### Soft Dependencies (Recommended)

| Module | Recommends |
|--------|-----------|
| `risk` | `health-safety`, `environment`, `quality` |
| `analytics` | Any 3 operational modules |
| `esg` | `environment`, `energy`, `hr` |

---

## 5. Recommended Activation Sequence (New Deployment)

**Wave 1 — Foundation** (no dependencies):
`quality`, `health-safety`, `environment`, `hr`, `finance`, `risk`, `infosec`

**Wave 2 — Dependent operational modules**:
`incidents`, `audits`, `documents`, `training`, `payroll`, `cmms`, `inventory`, `crm`

**Wave 3 — Advanced modules**:
`corrective-action`, `mgmt-review`, `assets`, `field-service`, `esg`, `energy`, `analytics`

**Wave 4 — Portals and sector-specific**:
`customer-portal`, `supplier-portal`, `partners`, `iso42001`, `iso37001`, `automotive`, `medical`, `aerospace`

---

## 6. Activation Procedure

**Path**: Admin Console → Module Registry → [Module] → Activate

**Steps:**
1. Verify all hard dependencies are in `ACTIVE` state
2. Review the configuration parameters checklist (shown before activation)
3. Click **Activate Module**
4. Monitor the activation status bar (refreshes every 5 seconds)
5. Confirm state transitions to `ACTIVE` (green indicator)
6. Configure organisation-level parameters
7. Assign module to relevant user groups/roles

---

## 7. Module Configuration Parameters

Each module has two layers of configuration:

### Organisation-Level Parameters
Applied at activation; affect all users in the organisation.

**Example (Health & Safety):**
- `incidentCategories`: comma-separated custom categories
- `riskMatrixSize`: `3x3`, `4x4`, or `5x5`
- `permitExpiryDays`: 1–365 (default: 30)
- `auditCycleDays`: frequency of mandatory internal audits

### Module-Level Parameters (per-instance)
Set within the module UI; vary per record type.

---

## 8. Troubleshooting Activation Failures

**Symptom**: Module stuck in `ACTIVATING` state for > 5 minutes

**Checklist:**
1. Check event log: Admin Console → Audit Log → Filter by Event: `MODULE_ACTIVATION_*`
2. Look for `MODULE_ACTIVATION_FAILED` event; expand to see error detail
3. Common errors:

| Error | Cause | Fix |
|-------|-------|-----|
| `DEPENDENCY_NOT_MET` | Hard dependency not active | Activate dependency first |
| `LICENSE_EXPIRED` | Module not licensed | Contact Nexara Account Manager |
| `DB_SCHEMA_ERROR` | Database provisioning failed | Contact Nexara Support; do not retry manually |
| `CONFIG_INVALID` | Invalid parameter value | Review configuration checklist |
| `TIMEOUT` | Activation took > 120 seconds | Retry; if persistent, contact support |

4. If state is `ERROR`, use **Reset to Inactive** (Admin Console → Module → Reset) before retrying

---

## 9. Module Deactivation

**Two modes:**

| Mode | Data handling | Reversible? |
|------|--------------|-------------|
| **Suspend** | Data live; module inaccessible | Yes — unsuspend immediately |
| **Archive** | Data compressed read-only; module removed | Yes — restore within 12 months |
| **Delete** | Data purged after 90-day retention | No |

**Warning**: Archiving a module that other modules depend on will trigger a cascade suspension of dependents. Always check the dependency graph before archiving.

---

## Module 3 Summary

| Topic | Key Takeaway |
|-------|-------------|
| Activation states | 6 states: INACTIVE → ACTIVATING → ACTIVE |
| Dependencies | Hard (required) vs soft (recommended) |
| Activation sequence | Wave-based: Foundation → Operational → Advanced → Portals |
| Configuration | Org-level (at activation) + module-level (within module) |
| Failure | Check audit log for `MODULE_ACTIVATION_FAILED`; Reset before retry |
| Deactivation | Suspend → Archive → Delete (escalating permanence) |

---

*Proceed to LAB-03 for hands-on module activation.*
