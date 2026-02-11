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

┌──────────────┐
│ims_project_  │
│  management  │
│  - Projects  │
│  - Tasks     │
│  - Sprints   │
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

## Database Tables

### Project Management
`projects`, `project_tasks`, `project_milestones`, `project_risks`, `project_issues`, `project_changes`, `project_resources`, `project_stakeholders`, `project_documents`, `project_sprints`, `project_user_stories`, `project_timesheets`, `project_expenses`, `project_status_reports`
