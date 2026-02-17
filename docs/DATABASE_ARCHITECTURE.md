# IMS Database Architecture

## Overview

The IMS system is designed to support both monolithic (single database) and microservices (database-per-service) architectures. This document outlines the database structure and migration path.

## Current Architecture (Monolithic)

Currently, all services share a single PostgreSQL database with a unified Prisma schema:

```
┌─────────────────────────────────────────────────────┐
│                   PostgreSQL                         │
│                   (ims database)                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ Users, Sessions, Audit, Risks, Incidents,       ││
│  │ Actions, Training, Quality, Environment,        ││
│  │ Inventory, HR, Payroll, Workflows, AI,          ││
│  │ Project Management                              ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

**Configuration:**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/ims
```

## Target Architecture (Database Per Service)

For production-scale deployments, each microservice should have its own database:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   ims_core   │  │    ims_hr    │  │  ims_payroll │
│  - Users     │  │  - Employees │  │  - Runs      │
│  - Sessions  │  │  - Depts     │  │  - Payslips  │
│  - Audit     │  │  - Positions │  │  - Deductions│
│  - API Keys  │  │  - Leave     │  │  - Benefits  │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  ims_quality │  │ims_health_   │  │ims_environ   │
│              │  │   safety     │  │   ment       │
│  - NCRs      │  │  - Incidents │  │  - Aspects   │
│  - CAPAs     │  │  - Hazards   │  │  - Impacts   │
│  - Audits    │  │  - Risk Asmt │  │  - Compliance│
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ims_inventory │  │ims_workflows │  │ims_ai_       │
│              │  │              │  │  analysis    │
│  - Items     │  │  - Templates │  │  - Analyses  │
│  - Stock     │  │  - Instances │  │  - Insights  │
│  - Movements │  │  - Tasks     │  │  - Metrics   │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ims_project_  │  │ims_automotive│  │  ims_medical │
│  management  │  │  - APQP      │  │  - DHF       │
│  - Projects  │  │  - PPAP      │  │  - DMR       │
│  - Tasks     │  │  - FMEA      │  │  - Complaints│
│  - Sprints   │  │  - SPC       │  │  - PMS       │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ims_aerospace │  │ ims_finance  │  │   ims_crm    │
│  - FAI       │  │  - Accounts  │  │  - Contacts  │
│  - ConfigMgmt│  │  - Budgets   │  │  - Opportun. │
│  - WorkOrders│  │  - Invoices  │  │  - Campaigns │
│  - OASIS     │  │  - Transact. │  │  - Pipelines │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ims_infosec  │  │   ims_esg    │  │  ims_cmms    │
│  - Controls  │  │  - Environ.  │  │  - Assets    │
│  - Risks     │  │  - Social    │  │  - WorkOrders│
│  - Incidents │  │  - Governance│  │  - Maint.    │
│  - Assets    │  │  - Metrics   │  │  - Inventory │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  ims_portal  │  │ims_food_     │  │  ims_energy  │
│  - PortalUser│  │   safety     │  │  - Baselines │
│  - Documents │  │  - HACCP     │  │  - Meters    │
│  - Tickets   │  │  - Hazards   │  │  - EnPIs     │
│  - Invites   │  │  - Audits    │  │  - Actions   │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ims_analytics │  │ims_field_    │  │ims_iso42001  │
│  - Dashboards│  │   service    │  │  - AISystem  │
│  - Reports   │  │  - WorkOrders│  │  - RiskAsmt  │
│  - Datasets  │  │  - Dispatch  │  │  - Controls  │
│  - Widgets   │  │  - Technician│  │  - Audits    │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐
│ims_iso37001  │
│  - BriberyRsk│
│  - DueDilig. │
│  - Controls  │
│  - Reports   │
└──────────────┘
```

## Database Schemas

### Core Schema (`packages/database/prisma/schemas/core.prisma`)

The core schema contains authentication and shared entities:

- **User** - User accounts and authentication
- **Session** - Active user sessions
- **AuditLog** - System-wide audit trail
- **ApiKey** - Service-to-service API keys

**Database:** `ims_core`

```env
CORE_DATABASE_URL=postgresql://user:pass@localhost:5432/ims_core
```

### Domain Schemas

Each microservice has its own schema file:

| Service | Schema File | Database | Key Models |
|---------|-------------|----------|------------|
| HR | `hr.prisma` | `ims_hr` | Employee, Department, Position, Leave, Training |
| Payroll | `payroll.prisma` | `ims_payroll` | PayrollRun, Payslip, Deduction, Benefit |
| Quality | `quality.prisma` | `ims_quality` | QualInterestedParty, QualIssue, QualRisk, QualOpportunity, QualProcess, QualNonConformance, QualAction, QualDocument, QualCapa, QualCapaAction, QualLegal, QualFmea, QualFmeaRow, QualImprovement, QualSupplier, QualChange, QualObjective, QualMilestone (18 models, 50+ enums) |
| Health & Safety | `health-safety.prisma` | `ims_health_safety` | Incident, Hazard, RiskAssessment |
| Environment | `environment.prisma` | `ims_environment` | EnvAspect, EnvEvent, EnvLegal, EnvObjective, EnvMilestone, EnvAction, EnvCapa, EnvCapaAction, WasteRecord, MonitoringData, EnvironmentalMetric |
| Inventory | `inventory.prisma` | `ims_inventory` | Item, Stock, Movement |
| Workflows | `workflows.prisma` | `ims_workflows` | Definition, Instance, Task |
| AI Analysis | `ai.prisma` | `ims_ai_analysis` | Analysis, Insight, Metric |
| Project Management | `project-management.prisma` | `ims_project_management` | Project, ProjectTask, ProjectMilestone, ProjectRisk, ProjectIssue, ProjectChange, ProjectResource, ProjectStakeholder, ProjectDocument, ProjectSprint, ProjectUserStory, ProjectTimesheet, ProjectExpense, ProjectStatusReport (14 models) |
| Automotive | `automotive.prisma` | `ims_automotive` | APQP, PPAP, FMEA, ControlPlan, MSA, SPC, LPA, CSR (18 models) |
| Medical | `medical.prisma` | `ims_medical` | DHF, DMR, DHR, Complaint, PMS, RiskMgmt, UDI, SoftwareValidation (27 models) |
| Aerospace | `aerospace.prisma` | `ims_aerospace` | FAI, ConfigMgmt, WorkOrder, HumanFactors, OASIS (11 models) |
| Finance | `finance.prisma` | `ims_finance` | Accounts, Transactions, Budgets, Invoices (23 models) |
| CRM | `crm.prisma` | `ims_crm` | Contacts, Opportunities, Campaigns (17 models) |
| InfoSec | `infosec.prisma` | `ims_infosec` | ISO 27001 controls, risks, incidents (14 models) |
| ESG | `esg.prisma` | `ims_esg` | Environmental, Social, Governance metrics (15 models) |
| CMMS | `cmms.prisma` | `ims_cmms` | Work orders, Assets, Maintenance (16 models) |
| Portal | `portal.prisma` | `ims_portal` | Portal users, Documents (12 models) |
| Food Safety | `food-safety.prisma` | `ims_food_safety` | HACCP, hazard analysis (14 models) |
| Energy | `energy.prisma` | `ims_energy` | ISO 50001, energy baselines (12 models) |
| Analytics | `analytics.prisma` | `ims_analytics` | Dashboards, Reports, Datasets (10 models) |
| Field Service | `field-service.prisma` | `ims_field_service` | Work orders, Dispatch (14 models) |
| ISO 42001 | `iso42001.prisma` | `ims_iso42001` | AI Management System (7 models) |
| ISO 37001 | `iso37001.prisma` | `ims_iso37001` | Anti-Bribery (6 models) |
| Marketing | `marketing.prisma` | `ims_marketing` | Leads, partners, campaigns (13 models) |
| Risk (ERM) | `risk.prisma` | `ims_risk` | ISO 31000:2018 — registers, controls, KRIs, bow-tie, appetite (10 models) |
| Training | `training.prisma` | `ims_training` | Courses, records, competencies (5 models) |
| Suppliers | `suppliers.prisma` | `ims_suppliers` | Suppliers, scorecards (4 models) |
| Assets | `assets.prisma` | `ims_assets` | Register, work orders, calibration (4 models) |
| Documents | `documents.prisma` | `ims_documents` | Documents, versions, approvals (4 models) |
| Complaints | `complaints.prisma` | `ims_complaints` | Complaints, actions (3 models) |
| Contracts | `contracts.prisma` | `ims_contracts` | Contracts, approvals, clauses (4 models) |
| PTW | `ptw.prisma` | `ims_ptw` | Permits, method statements (3 models) |
| Reg Monitor | `reg-monitor.prisma` | `ims_reg_monitor` | Regulatory changes, obligations (3 models) |
| Incidents | `incidents.prisma` | `ims_incidents` | Incident management (1 model, 30+ fields) |
| Audits | `audits.prisma` | `ims_audits` | Audits, findings, checklists (4 models) |
| Mgmt Review | `mgmt-review.prisma` | `ims_mgmt_review` | Management reviews (1 model) |
| Wizard | `wizard.prisma` | `ims_wizard` | Setup wizard state (2 models) |
| Partner Portal | `partner-portal.prisma` | `ims_partner_portal` | Referrals, commission, support (4 models) |
| Chemicals | `chemicals.prisma` | `ims_chemicals` | COSHH, SDS, GHS, inventory (10 models) |
| Emergency | `emergency.prisma` | `ims_emergency` | FRA, BCP, PEEP, wardens, drills (16 models) |

**Total: 43 schemas, 585+ models across all domains.**

## Migration Strategy

### Phase 1: Schema Split (Complete)

1. Create separate schema files for each domain
2. Schema files are in `packages/database/prisma/schemas/`
3. Each generates its own Prisma client

**Available Schemas:**
- `core.prisma` - Users, Sessions, Audit, API Keys
- `hr.prisma` - Employees, Departments, Leave, Training
- `payroll.prisma` - PayrollRuns, Payslips, Benefits, Loans
- `quality.prisma` - 18 Qual-prefixed models (Parties, Issues, Risks, Opportunities, Processes, NCRs, Actions, Documents, CAPAs, Legal, FMEA, Improvements, Suppliers, Changes, Objectives + Milestones + CAPA Actions + FMEA Rows)
- `health-safety.prisma` - Incidents, Risks, Hazards, Permits
- `environment.prisma` - Aspects, Events, Legal, Objectives, Milestones, Actions, CAPA, CapaActions, Waste, Monitoring, Metrics (11 models, 30+ enums)
- `inventory.prisma` - Products, Warehouses, Stock, POs
- `workflows.prisma` - Definitions, Instances, Tasks
- `ai.prisma` - Analyses, Insights, Embeddings
- `project-management.prisma` - Projects, Tasks, Milestones, Risks, Issues, Changes, Resources, Stakeholders, Documents, Sprints, User Stories, Timesheets, Expenses, Reports (14 models)
- `automotive.prisma` - APQP, PPAP, FMEA, ControlPlan, MSA, SPC, LPA, CSR (18 models)
- `medical.prisma` - DHF, DMR, DHR, Complaint, PMS, RiskMgmt, UDI, SoftwareValidation (27 models)
- `aerospace.prisma` - FAI, ConfigMgmt, WorkOrder, HumanFactors, OASIS (11 models)
- `finance.prisma` - Accounts, Transactions, Budgets, Invoices (23 models)
- `crm.prisma` - Contacts, Opportunities, Campaigns (17 models)
- `infosec.prisma` - ISO 27001 controls, risks, incidents (14 models)
- `esg.prisma` - Environmental, Social, Governance metrics (15 models)
- `cmms.prisma` - Work orders, Assets, Maintenance (16 models)
- `portal.prisma` - Portal users, Documents (12 models)
- `food-safety.prisma` - HACCP, hazard analysis (14 models)
- `energy.prisma` - ISO 50001, energy baselines (12 models)
- `analytics.prisma` - Dashboards, Reports, Datasets (10 models)
- `field-service.prisma` - Work orders, Dispatch (14 models)
- `iso42001.prisma` - AI Management System (7 models)
- `iso37001.prisma` - Anti-Bribery (6 models)

### Phase 2: Database Creation (Complete)

Run the database creation script:

```bash
./scripts/create-databases.sh
```

This creates:
- `ims_core`
- `ims_hr`
- `ims_payroll`
- `ims_quality`
- `ims_health_safety`
- `ims_environment`
- `ims_inventory`
- `ims_workflows`
- `ims_ai_analysis`
- `ims_project_management`
- `ims_automotive`
- `ims_medical`
- `ims_aerospace`
- `ims_finance`
- `ims_crm`
- `ims_infosec`
- `ims_esg`
- `ims_cmms`
- `ims_portal`
- `ims_food_safety`
- `ims_energy`
- `ims_analytics`
- `ims_field_service`
- `ims_iso42001`
- `ims_iso37001`

### Phase 3: Data Migration (Complete)

**Generate all Prisma clients:**
```bash
cd packages/database
pnpm generate:all
```

**Or generate individual clients:**
```bash
pnpm generate:core
pnpm generate:hr
pnpm generate:payroll
# etc.
```

**Push schemas to databases:**
```bash
pnpm push:all
```

**Migrate data from monolithic database:**
```bash
./scripts/migrate-data.sh all    # Migrate all services
./scripts/migrate-data.sh hr     # Migrate HR only
./scripts/migrate-data.sh quality # Migrate Quality only
```

### Phase 4: Service Updates (In Progress)

Update each microservice to use its specific database:

```typescript
// apps/api-hr/src/index.ts
import { PrismaClient } from '@ims/database/generated/hr';

const prisma = new PrismaClient();
```

## Cross-Service Communication

When services need data from other domains:

### Option 1: API Calls (Recommended)

```typescript
// HR service needs user info
const user = await fetch('http://api-gateway/api/v1/users/123', {
  headers: { 'X-Service-Token': serviceToken }
});
```

### Option 2: Event-Driven

```typescript
// Publish event when employee created
await eventBus.publish('employee.created', { employeeId, userId });

// Core service subscribes to sync user data
eventBus.subscribe('employee.created', async (event) => {
  await syncUserDepartment(event.userId, event.departmentId);
});
```

### Option 3: Shared Read Replicas

For high-volume read scenarios, use read replicas:

```env
CORE_DATABASE_READ_URL=postgresql://user:pass@read-replica:5432/ims_core
```

## User ID References

Domain databases store `userId` as a string reference to the core database:

```prisma
model Employee {
  id     String @id
  userId String @unique // Reference to User in ims_core
  // ... other fields
}
```

Validation happens at the API layer:

```typescript
// Before creating employee
const user = await coreClient.user.findUnique({ where: { id: userId } });
if (!user) throw new Error('User not found');

// Create employee with userId reference
await hrClient.employee.create({ data: { userId, ... } });
```

## Environment Configuration

### Development (Single Database)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ims
```

### Production (Multiple Databases)

```env
# Core
CORE_DATABASE_URL=postgresql://ims_core:pass@db-core.prod:5432/ims_core

# Services
HR_DATABASE_URL=postgresql://ims_hr:pass@db-hr.prod:5432/ims_hr
PAYROLL_DATABASE_URL=postgresql://ims_payroll:pass@db-payroll.prod:5432/ims_payroll
QUALITY_DATABASE_URL=postgresql://ims_quality:pass@db-quality.prod:5432/ims_quality
HEALTH_SAFETY_DATABASE_URL=postgresql://ims_hs:pass@db-hs.prod:5432/ims_health_safety
ENVIRONMENT_DATABASE_URL=postgresql://ims_env:pass@db-env.prod:5432/ims_environment
INVENTORY_DATABASE_URL=postgresql://ims_inv:pass@db-inv.prod:5432/ims_inventory
WORKFLOWS_DATABASE_URL=postgresql://ims_wf:pass@db-wf.prod:5432/ims_workflows
AI_DATABASE_URL=postgresql://ims_ai:pass@db-ai.prod:5432/ims_ai_analysis
PROJECT_MANAGEMENT_DATABASE_URL=postgresql://ims_pm:pass@db-pm.prod:5432/ims_project_management
AUTOMOTIVE_DATABASE_URL=postgresql://ims_auto:pass@db-auto.prod:5432/ims_automotive
MEDICAL_DATABASE_URL=postgresql://ims_med:pass@db-med.prod:5432/ims_medical
AEROSPACE_DATABASE_URL=postgresql://ims_aero:pass@db-aero.prod:5432/ims_aerospace
FINANCE_DATABASE_URL=postgresql://ims_fin:pass@db-fin.prod:5432/ims_finance
CRM_DATABASE_URL=postgresql://ims_crm:pass@db-crm.prod:5432/ims_crm
INFOSEC_DATABASE_URL=postgresql://ims_infosec:pass@db-infosec.prod:5432/ims_infosec
ESG_DATABASE_URL=postgresql://ims_esg:pass@db-esg.prod:5432/ims_esg
CMMS_DATABASE_URL=postgresql://ims_cmms:pass@db-cmms.prod:5432/ims_cmms
PORTAL_DATABASE_URL=postgresql://ims_portal:pass@db-portal.prod:5432/ims_portal
FOOD_SAFETY_DATABASE_URL=postgresql://ims_fs:pass@db-fs.prod:5432/ims_food_safety
ENERGY_DATABASE_URL=postgresql://ims_energy:pass@db-energy.prod:5432/ims_energy
ANALYTICS_DATABASE_URL=postgresql://ims_analytics:pass@db-analytics.prod:5432/ims_analytics
FIELD_SERVICE_DATABASE_URL=postgresql://ims_field:pass@db-field.prod:5432/ims_field_service
ISO42001_DATABASE_URL=postgresql://ims_iso42001:pass@db-iso42001.prod:5432/ims_iso42001
ISO37001_DATABASE_URL=postgresql://ims_iso37001:pass@db-iso37001.prod:5432/ims_iso37001
```

## Benefits of Database Per Service

1. **Independent Scaling** - Each database can be scaled based on service needs
2. **Isolation** - Service failures don't cascade to other services
3. **Technology Choice** - Each service can use the best database for its needs
4. **Team Autonomy** - Teams can manage their schema independently
5. **Security** - Reduced blast radius for data breaches

## Trade-offs

1. **Complexity** - More databases to manage
2. **Cross-Service Queries** - Can't JOIN across databases
3. **Data Consistency** - Eventual consistency between services
4. **Operational Overhead** - More backups, monitoring, etc.

## Recommendations

1. **Start Monolithic** - Use single database for development and early production
2. **Split When Needed** - Migrate to multi-database when:
   - A service has significantly different scaling needs
   - Team boundaries require clear ownership
   - Compliance requires data isolation
3. **Core First** - Always split core (auth/users) first
4. **Gradual Migration** - Migrate one service at a time

## Soft Delete Indexes

All 41 domain schemas include `@@index([deletedAt])` on every model that supports soft deletes. There are 342 such indexes in total. These indexes ensure that the default query filter `WHERE "deletedAt" IS NULL` remains performant even on large tables.

Example from a schema:
```prisma
model RiskRegister {
  // ... fields ...
  deletedAt DateTime?

  @@index([deletedAt])
}
```

## Multi-Tenant Isolation (orgId)

301 models across all domain schemas now include an `orgId String?` field for multi-tenant isolation. When MSP mode is enabled, all queries are scoped by `orgId` to ensure tenants cannot access each other's data.

- The `orgId` field is nullable to maintain backward compatibility with single-tenant deployments
- Gateway middleware injects the tenant's `orgId` from the JWT token into request context
- Each downstream API service filters queries by `orgId` when present
- Indexes on `orgId` are included where necessary for query performance

## Database Backup Strategy

### Automated Daily Backups

The `docker-compose.yml` includes a `backup` service that runs `pg_dump` daily and stores compressed backups:

- **Schedule**: Daily at 02:00 UTC
- **Retention**: 30 days (older backups are automatically pruned)
- **Storage**: `/var/backups/ims/` on the Docker host (mounted volume)
- **Format**: Custom compressed format (`pg_dump -Fc`) for efficient storage and selective restore

### Manual Backup

```bash
./scripts/backup-db.sh
```

This creates an on-demand backup in the same location as automated backups. Useful before schema migrations or major deployments.

### Restore

```bash
pg_restore -h localhost -U postgres -d ims --clean --if-exists backup_file.dump
```

---

## Database Tables

### Project Management
`projects`, `project_tasks`, `project_milestones`, `project_risks`, `project_issues`, `project_changes`, `project_resources`, `project_stakeholders`, `project_documents`, `project_sprints`, `project_user_stories`, `project_timesheets`, `project_expenses`, `project_status_reports`
