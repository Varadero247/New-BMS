# NEXARA IMS PLATFORM — DATABASE SCHEMA REFERENCE

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---

## Complete Model & Field Documentation

**Document Version:** 1.0
**Last Updated:** February 21, 2026
**Database:** PostgreSQL 16
**ORM:** Prisma 5.22.0
**Total:** 44 schemas · 606 models · 781 enums

---

## UNIVERSAL PATTERNS

Every model in every schema follows these conventions:

```
id            String    @id @default(cuid()) or @default(uuid())
orgId         String?                         # Multi-tenancy
createdAt     DateTime  @default(now())
updatedAt     DateTime  @updatedAt
deletedAt     DateTime?                       # Soft delete
createdBy     String?                         # User ID/email
updatedBy     String?                         # User ID/email
referenceNumber String  @unique               # Human-readable ID (e.g. NCR-2026-001)
```

**Soft Delete Pattern:**
- All operational records use `deletedAt DateTime?`
- Queries filter `WHERE deletedAt IS NULL`
- Hard deletes only used for cascade children
- `@@index([deletedAt])` on all soft-delete models

**Multi-Tenancy:**
- `orgId String?` on every model
- `@@index([orgId])` for per-tenant query performance
- Gateway injects `orgId` from JWT; downstream services scope all queries

**ID Generation:**
- `@default(cuid())` — most operational records (shorter, URL-safe)
- `@default(uuid())` — Prisma-migrated models (globally unique)

**Binary Targets (all schemas):**
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
  output        = "../../generated/<domain>"
}
```

---

## TABLE OF CONTENTS

| Schema | Service | Models | Enums |
|--------|---------|--------|-------|
| [core](#core-schema) | api-gateway | 26 | 20 |
| [quality](#quality-schema) | api-quality | 44 | 95 |
| [health-safety](#health-safety-schema) | api-health-safety | 18 | 31 |
| [environment](#environment-schema) | api-environment | 25 | 52 |
| [automotive](#automotive-schema) | api-automotive | 23 | 26 |
| [medical](#medical-schema) | api-medical | 31 | 44 |
| [aerospace](#aerospace-schema) | api-aerospace | 24 | 54 |
| [finance](#finance-schema) | api-finance | 27 | 18 |
| [hr](#hr-schema) | api-hr | 27 | 33 |
| [analytics](#analytics-schema) | api-analytics | 40 | 22 |
| [workflows](#workflows-schema) | api-workflows | 17 | 29 |
| [crm](#crm-schema) | api-crm | 17 | 16 |
| [esg](#esg-schema) | api-esg | 17 | 18 |
| [cmms](#cmms-schema) | api-cmms | 16 | 16 |
| [emergency](#emergency-schema) | api-emergency | 16 | 10 |
| [food-safety](#food-safety-schema) | api-food-safety | 14 | 22 |
| [field-service](#field-service-schema) | api-field-service | 14 | 12 |
| [infosec](#infosec-schema) | api-infosec | 14 | 26 |
| [marketing](#marketing-schema) | api-marketing | 13 | 9 |
| [energy](#energy-schema) | api-energy | 12 | 17 |
| [portal](#portal-schema) | api-portal | 12 | 17 |
| [inventory](#inventory-schema) | api-inventory | 12 | 12 |
| [ai](#ai-schema) | api-ai-analysis | 11 | 11 |
| [payroll](#payroll-schema) | api-payroll | 15 | 20 |
| [project-management](#project-management-schema) | api-project-management | 16 | 35 |
| [risk](#risk-schema) | api-risk | 10 | 16 |
| [iso42001](#iso42001-schema) | api-iso42001 | 10 | 18 |
| [platform](#platform-schema) | shared | 23 | 0 |
| [chemicals](#chemicals-schema) | api-chemicals | 9 | 17 |
| [iso37001](#iso37001-schema) | api-iso37001 | 7 | 15 |
| [training](#training-schema) | api-training | 5 | 5 |
| [assets](#assets-schema) | api-assets | 4 | 5 |
| [documents](#documents-schema) | api-documents | 4 | 3 |
| [contracts](#contracts-schema) | api-contracts | 4 | 4 |
| [audits](#audits-schema) | api-audits | 4 | 4 |
| [suppliers](#suppliers-schema) | api-suppliers | 4 | 4 |
| [partner-portal](#partner-portal-schema) | api-partners | 4 | 5 |
| [marketplace](#marketplace-schema) | api-gateway | 4 | 3 |
| [complaints](#complaints-schema) | api-complaints | 3 | 4 |
| [ptw](#ptw-schema) | api-ptw | 3 | 3 |
| [reg-monitor](#reg-monitor-schema) | api-reg-monitor | 3 | 3 |
| [incidents](#incidents-schema) | api-incidents | 1 | 4 |
| [mgmt-review](#mgmt-review-schema) | api-mgmt-review | 1 | 1 |
| [wizard](#wizard-schema) | api-setup-wizard | 2 | 2 |

---

## CORE SCHEMA

**File:** `packages/database/prisma/schemas/core.prisma`
**Env var:** `DATABASE_URL`
**Table prefix:** none (plain table names)
**Service:** api-gateway

### User

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  passwordHash      String
  firstName         String
  lastName          String
  role              String    // legacy string role
  isActive          Boolean   @default(true)
  mfaEnabled        Boolean   @default(false)
  mfaSecret         String?
  lastLoginAt       DateTime?
  passwordChangedAt DateTime?
  emailVerifiedAt   DateTime?
  orgId             String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime?
}
```

### Session

```prisma
model Session {
  id           String   @id @default(cuid())
  userId       String
  refreshToken String   @unique
  expiresAt    DateTime
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime @default(now())
}
```

### AuditLog

```prisma
model AuditLog {
  id           String   @id @default(cuid())
  userId       String?
  userEmail    String?
  action       String   // CREATE | UPDATE | DELETE | LOGIN | LOGOUT | VIEW
  resource     String   // e.g. "nonconformance", "user"
  resourceId   String?
  details      Json?
  ipAddress    String?
  userAgent    String?
  orgId        String?
  createdAt    DateTime @default(now())
}
```

### EnhancedAuditTrail (tamper-evident)

```prisma
model EnhancedAuditTrail {
  id          String   @id @default(uuid())
  eventType   String
  actorId     String
  actorEmail  String?
  targetType  String
  targetId    String
  changes     Json?
  metadata    Json?
  ipAddress   String?
  hash        String   // SHA-256 of previous record hash + content (chain integrity)
  orgId       String?
  createdAt   DateTime @default(now())
}
```

### ESignature (21 CFR Part 11)

```prisma
model ESignature {
  id            String   @id @default(uuid())
  documentId    String
  documentType  String
  signerId      String
  signerEmail   String
  signerName    String
  meaning       String   // "I approve", "I reviewed", etc.
  signedAt      DateTime @default(now())
  ipAddress     String?
  hash          String   // Document hash at time of signing
  certificate   String?  // PKI certificate
  orgId         String?
  createdAt     DateTime @default(now())
}
```

### ApiKey (Prisma-backed)

```prisma
model ApiKey {
  id          String    @id @default(uuid())
  name        String
  keyHash     String    @unique
  keyPrefix   String    // First 8 chars (displayed to user)
  userId      String
  orgId       String?
  scopes      String[]  // ["quality:read", "quality:write", ...]
  expiresAt   DateTime?
  lastUsedAt  DateTime?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### SamlConfig (Prisma-backed, per-org)

```prisma
model SamlConfig {
  id               String   @id @default(uuid())
  orgId            String   @unique
  entryPoint       String   // IdP SSO URL
  issuer           String   // SP Entity ID
  certificate      String   // IdP public certificate
  signatureAlgorithm String @default("sha256")
  digestAlgorithm  String   @default("sha256")
  identifierFormat String?
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### SCIM Models (Prisma-backed)

```prisma
model ScimToken {
  id        String   @id @default(uuid())
  orgId     String   @unique
  tokenHash String   @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}

model ScimUser {
  id          String   @id @default(uuid())
  orgId       String
  externalId  String
  userName    String
  email       String
  firstName   String?
  lastName    String?
  active      Boolean  @default(true)
  imsUserId   String?  // linked User.id
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@unique([orgId, externalId])
}

model ScimGroup {
  id          String   @id @default(uuid())
  orgId       String
  externalId  String
  displayName String
  members     String[] // ScimUser.id array
  imsRoleId   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@unique([orgId, externalId])
}
```

### MspLink (Prisma-backed)

```prisma
model MspLink {
  id           String   @id @default(uuid())
  mspOrgId     String   // MSP's orgId
  tenantOrgId  String   // Managed tenant's orgId
  permissions  String[] // ["read", "write", "admin"]
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@unique([mspOrgId, tenantOrgId])
}
```

### UnifiedAuditPlan (Prisma-backed)

```prisma
model UnifiedAuditPlan {
  id          String   @id @default(uuid())
  orgId       String
  year        Int
  modules     String[] // ["quality", "environment", "health-safety"]
  status      String   @default("DRAFT")
  approvedBy  String?
  approvedAt  DateTime?
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Risk, Incident, Action (Core)

```prisma
model Risk {
  id          String   @id @default(cuid())
  title       String
  description String?
  likelihood  Int
  impact      Int
  score       Int
  orgId       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Incident {
  id          String   @id @default(cuid())
  title       String
  description String?
  severity    String
  status      String   @default("OPEN")
  orgId       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Action {
  id          String   @id @default(cuid())
  title       String
  description String?
  dueDate     DateTime?
  status      String   @default("OPEN")
  assigneeId  String?
  orgId       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Template Models

```prisma
model Template {
  id          String   @id @default(cuid())
  name        String
  category    String
  module      String
  content     String   // Template body (Handlebars/Mustache)
  isBuiltIn   Boolean  @default(false)
  orgId       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model TemplateVersion { ... }   // Version history for templates
model TemplateInstance { ... }  // Generated instances from templates
```

### Other Core Models

- `AIAnalysis` — AI analysis results cache
- `MonthlyTrend` — Cross-module monthly KPI trends
- `ComplianceScore` — Per-module compliance scoring
- `ComplianceEvent` — Compliance timeline events
- `DataRetentionPolicy` — GDPR data retention rules
- `ErasureRequest` — Right to erasure requests
- `GeneratedReport` — Report generation records
- `CustomRole` — Custom RBAC role definitions

---

## HEALTH-SAFETY SCHEMA

**File:** `packages/database/prisma/schemas/health-safety.prisma`
**Env var:** `HEALTH_SAFETY_DATABASE_URL`
**Table prefix:** `hs_`

### Incident (`hs_incidents`)

```prisma
model Incident {
  id                     String           @id @default(cuid())
  orgId                  String?
  referenceNumber        String           @unique  // HS-INC-2026-001
  title                  String
  description            String
  type                   IncidentType
  severity               IncidentSeverity @default(MINOR)
  category               String?
  location               String?
  dateOccurred           DateTime
  dateReported           DateTime         @default(now())
  reporterId             String
  investigatorId         String?
  personsInvolved        String?
  injuryType             String?
  bodyPart               String?
  daysLost               Int?
  treatmentType          String?          // FIRST_AID | MEDICAL | HOSPITAL
  immediateCause         String?
  rootCauses             String?
  contributingFactors    String?
  injuredPersonName      String?
  injuredPersonRole      String?
  employmentType         String?          // EMPLOYEE | CONTRACTOR | VISITOR | PUBLIC
  lostTime               Boolean          @default(false)
  witnesses              String?
  riddorReportable       Boolean          @default(false)
  regulatoryReference    String?
  reportedToAuthority    Boolean          @default(false)
  reportedToAuthorityDate DateTime?
  reportedBy             String?
  investigationRequired  Boolean          @default(false)
  investigationDueDate   DateTime?
  // AI-generated root cause
  aiImmediateCause       String?
  aiUnderlyingCause      String?
  aiRootCause            String?
  aiContributingFactors  String?
  aiRecurrencePrevention String?
  aiAnalysisGenerated    Boolean          @default(false)
  status                 IncidentStatus   @default(OPEN)
  closedAt               DateTime?
  createdAt              DateTime         @default(now())
  updatedAt              DateTime         @updatedAt
  deletedAt              DateTime?
  createdBy              String?
  updatedBy              String?
  riskId                 String?
  // Relations
  risk                   Risk?
  actions                HSAction[]
  fiveWhyAnalyses        FiveWhyAnalysis[]
  fishboneAnalyses       FishboneAnalysis[]
  capas                  Capa[]
}
```

**Enums:**
```
IncidentType:     INJURY | NEAR_MISS | DANGEROUS_OCCURRENCE | OCCUPATIONAL_ILLNESS |
                  PROPERTY_DAMAGE | FIRST_AID | MEDICAL_TREATMENT | LOST_TIME |
                  SECURITY_BREACH | DATA_BREACH | UNAUTHORIZED_ACCESS | PHISHING_ATTEMPT
IncidentSeverity: MINOR | MODERATE | MAJOR | CRITICAL | CATASTROPHIC
IncidentStatus:   OPEN | UNDER_INVESTIGATION | AWAITING_ACTIONS | ACTIONS_IN_PROGRESS |
                  VERIFICATION | CLOSED
```

### Risk (`hs_risks`)

```prisma
model Risk {
  id                      String      @id @default(cuid())
  orgId                   String?
  referenceNumber         String?     @unique
  title                   String
  description             String
  category                String?
  source                  String?
  whoAtRisk               String?
  // Pre-control assessment
  likelihood              Int         @default(1)  // 1-5
  severity                Int         @default(1)  // 1-5
  detectability           Int         @default(1)  // 1-5
  riskScore               Int?
  riskLevel               RiskLevel?
  // AI-generated hierarchy of controls
  existingControls        String?
  aiControlElimination    String?
  aiControlSubstitution   String?
  aiControlEngineering    String?
  aiControlAdministrative String?
  aiControlPPE            String?
  aiControlsGenerated     Boolean     @default(false)
  additionalControls      String?
  // Post-control residual
  residualLikelihood      Int?
  residualSeverity        Int?
  residualRiskScore       Int?
  residualRiskLevel       RiskLevel?
  residualRisk            Int?
  riskOwner               String?
  legalReference          String?
  responsible             String?
  createdBy               String?
  status                  RiskStatus  @default(ACTIVE)
  reviewDate              DateTime?
  lastReviewedAt          DateTime?
  createdAt               DateTime    @default(now())
  updatedAt               DateTime    @updatedAt
  deletedAt               DateTime?
}
```

**Enums:**
```
RiskLevel:  LOW | MEDIUM | HIGH | CRITICAL
RiskStatus: ACTIVE | UNDER_REVIEW | MITIGATED | CLOSED | ACCEPTED
```

### Hazard (`hs_hazards`)

```prisma
model Hazard {
  id                 String            @id @default(cuid())
  orgId              String?
  riskId             String?
  title              String
  description        String
  category           HazardCategory
  location           String?
  potentialSeverity  Int               @default(1)  // 1-5
  exposureFrequency  Int               @default(1)  // 1-5
  numberOfExposed    Int               @default(1)
  controlMeasures    String?
  controlHierarchy   ControlHierarchy?
  ppeRequired        String[]
  status             HazardStatus      @default(ACTIVE)
  reviewDate         DateTime?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt
  deletedAt          DateTime?
}
```

**Enums:**
```
HazardCategory:   PHYSICAL | CHEMICAL | BIOLOGICAL | ERGONOMIC | PSYCHOSOCIAL |
                  ELECTRICAL | FIRE | MECHANICAL | ENVIRONMENTAL | OTHER
ControlHierarchy: ELIMINATION | SUBSTITUTION | ENGINEERING | ADMINISTRATIVE | PPE
HazardStatus:     ACTIVE | CONTROLLED | ELIMINATED | UNDER_REVIEW
```

### HSAction (`hs_actions`)

```prisma
model HSAction {
  id                  String          @id @default(cuid())
  orgId               String?
  referenceNumber     String          @unique
  title               String
  description         String
  incidentId          String?
  riskId              String?
  type                ActionType
  priority            ActionPriority  @default(MEDIUM)
  ownerId             String
  createdById         String
  dueDate             DateTime
  completedAt         DateTime?
  verifiedAt          DateTime?
  verificationMethod  String?
  verificationNotes   String?
  effectivenessRating Int?            // 1-5
  status              ActionStatus    @default(OPEN)
  estimatedCost       Decimal?        @db.Decimal(14, 2)
  actualCost          Decimal?        @db.Decimal(14, 2)
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
  deletedAt           DateTime?
}
```

### Root Cause Analysis Models

```
FiveWhyAnalysis   — 5-Why fields: why1..why5, rootCause, conclusion
FishboneAnalysis  — 6M: manpower, method, machine, material, measurement, environment
BowTieAnalysis    — topEvent, threats(Json), consequences(Json),
                    preventiveControls(Json), mitigatingControls(Json)
```

### SafetyMetric (`hs_safety_metrics`)

```prisma
model SafetyMetric {
  id                      String   @id @default(cuid())
  orgId                   String?
  year                    Int
  month                   Int
  hoursWorked             Decimal  @default(0)
  lostTimeInjuries        Int      @default(0)
  totalRecordableInjuries Int      @default(0)
  daysLost                Int      @default(0)
  nearMisses              Int      @default(0)
  firstAidCases           Int      @default(0)
  ltifr                   Decimal?  // LTI Frequency Rate = LTI × 1M / hoursWorked
  trir                    Decimal?  // Total Recordable = TRI × 200K / hoursWorked
  severityRate            Decimal?
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  @@unique([year, month])
}
```

### SafetyPermit (`hs_safety_permits`)

```
PermitType:   HOT_WORK | CONFINED_SPACE | WORKING_AT_HEIGHT | EXCAVATION |
              ELECTRICAL | LOCKOUT_TAGOUT | GENERAL
PermitStatus: REQUESTED | APPROVED | ACTIVE | SUSPENDED | CLOSED | REJECTED | EXPIRED
```

### LegalRequirement (`hs_legal_requirements`)

Key fields: `category` (LegalCategory enum), `complianceStatus`, `aiKeyObligations`, `aiGapAnalysis`, `aiRequiredActions`, `aiPenaltyForNonCompliance`

```
LegalCategory:    PRIMARY_LEGISLATION | SUBORDINATE_LEGISLATION | ACOP |
                  HSE_GUIDANCE | INTERNATIONAL_STANDARD | INDUSTRY_STANDARD |
                  CONTRACTUAL | VOLUNTARY
ComplianceStatus: COMPLIANT | PARTIAL | NON_COMPLIANT | UNDER_REVIEW | NOT_ASSESSED
```

### OhsObjective + ObjectiveMilestone

```
ObjectiveCategory: INCIDENT_REDUCTION | HAZARD_ELIMINATION | TRAINING | AUDIT |
                   LEGAL_COMPLIANCE | HEALTH_WELLBEING | RISK_REDUCTION |
                   CONTRACTOR_MANAGEMENT | OTHER
ObjectiveStatus:   ACTIVE | ON_TRACK | AT_RISK | BEHIND | ACHIEVED | CANCELLED
```

### Capa + CapaAction

```
CapaSource:   INCIDENT | NEAR_MISS | AUDIT | RISK_ASSESSMENT | LEGAL |
              MANAGEMENT_REVIEW | WORKER_SUGGESTION | OTHER
CapaStatus:   OPEN | IN_PROGRESS | PENDING_VERIFICATION | CLOSED | OVERDUE
```

### HSManagementReview + HSMRAction

ISO 45001 Clause 9.3 mandatory inputs captured:
`prevActionStatus`, `ohsObjectivesProgress`, `legalComplianceStatus`,
`incidentStatistics`, `riskOpportunityReview`, `auditResults`,
`workerParticipation`, `externalCommunications`, `changesInIssues`

Mandatory outputs: `continualImprovement`, `resourceNeeds`, `systemChanges`

### HSCommunication

```
HSCommDirection: INTERNAL | EXTERNAL
HSCommType:      WORKER_CONSULTATION | MANAGEMENT_NOTIFICATION |
                 REGULATORY_COMMUNICATION | EXTERNAL_STAKEHOLDER |
                 CONTRACTOR_BRIEFING | TOOLBOX_TALK | COMMITTEE_MEETING
```

---

## QUALITY SCHEMA

**File:** `packages/database/prisma/schemas/quality.prisma`
**Env var:** `QUALITY_DATABASE_URL`
**Table prefix:** `qual_`
**44 models · 95 enums** — largest schema

### Core Quality Models

```prisma
model QualNonConformance {
  id              String      @id @default(cuid())
  referenceNumber String      @unique  // NCR-2026-001
  title           String
  description     String
  severity        NcrSeverity
  source          NcrSource
  type            NcrType
  departmentId    String?
  productId       String?
  quantityAffected Int?
  dateDetected    DateTime
  reporterId      String
  responsibleId   String?
  targetCloseDate DateTime?
  // Root cause
  rootCause       String?
  rootCauseMethod String?     // FIVE_WHY | FISHBONE | IS_IS_NOT | 8D
  // Containment
  immediateAction String?
  // Status workflow
  status          NcrStatus   @default(OPEN)
  closedAt        DateTime?
  verifiedAt      DateTime?
  // Financial
  estimatedCost   Decimal?
  actualCost      Decimal?
  organisationId  String
  createdBy       String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  deletedAt       DateTime?
  @@map("qual_nonconformances")
}
```

**NcrSeverity:** `MINOR | MAJOR | CRITICAL | OBSERVATION`
**NcrSource:** `INTERNAL | CUSTOMER | SUPPLIER | AUDIT | REGULATORY | FIELD`
**NcrStatus:** `OPEN | INVESTIGATING | ROOT_CAUSE_IDENTIFIED | CAPA_IN_PROGRESS | AWAITING_VERIFICATION | CLOSED | REJECTED`

```prisma
model QualCapa {
  id              String       @id @default(cuid())
  referenceNumber String       @unique  // CAPA-2026-001
  title           String
  type            CapaType     // CORRECTIVE | PREVENTIVE | IMPROVEMENT
  priority        CapaPriority // LOW | MEDIUM | HIGH | URGENT
  source          CapaSource   // NCR | AUDIT | COMPLAINT | MANAGEMENT_REVIEW | RISK | PROACTIVE
  sourceId        String?      // ID of linked source record
  rootCause       String?
  proposedAction  String
  expectedResult  String?
  targetDate      DateTime
  ownerId         String
  status          CapaStatus   @default(OPEN)
  verifiedAt      DateTime?
  verificationNotes String?
  effectivenessRating Int?
  organisationId  String
  createdBy       String
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  deletedAt       DateTime?
  actions         QualCapaAction[]
  @@map("qual_capas")
}

model QualCapaAction {
  id          String           @id @default(cuid())
  capaId      String
  title       String
  description String?
  ownerId     String?
  dueDate     DateTime?
  completedAt DateTime?
  status      QualCapaActionStatus @default(OPEN)
  sortOrder   Int              @default(0)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  @@map("qual_capa_actions")
}
```

```prisma
model QualDocument {
  id              String          @id @default(cuid())
  documentId      String          @unique  // DOC-QMS-001
  title           String
  type            DocumentType    // POLICY | PROCEDURE | WORK_INSTRUCTION | FORM | SPECIFICATION | DRAWING
  version         String          @default("1.0")
  status          DocumentStatus  // DRAFT | UNDER_REVIEW | APPROVED | CONTROLLED | OBSOLETE
  content         String?
  fileUrl         String?
  fileSize        Int?
  mimeType        String?
  authorId        String
  approverId      String?
  approvedAt      DateTime?
  reviewDate      DateTime?
  departmentId    String?
  tags            String[]
  accessLevel     String          @default("INTERNAL") // PUBLIC | INTERNAL | RESTRICTED | CONFIDENTIAL
  organisationId  String
  createdBy       String
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  deletedAt       DateTime?
  @@map("qual_documents")
}
```

### FMEA Models

```prisma
model QualFmea {
  id              String     @id @default(cuid())
  referenceNumber String     @unique  // FMEA-2026-001
  title           String
  type            FmeaType   // DFMEA | PFMEA | SYSTEM | FUNCTIONAL
  status          FmeaStatus
  productId       String?
  processId       String?
  revision        String     @default("A")
  ownerId         String
  reviewDate      DateTime?
  approvedAt      DateTime?
  organisationId  String
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  deletedAt       DateTime?
  rows            QualFmeaRow[]
  @@map("qual_fmea")
}

model QualFmeaRow {
  id               String  @id @default(cuid())
  fmeaId           String
  processFunction  String
  potentialFailure String
  potentialEffect  String
  severity         Int     // 1-10
  potentialCause   String
  occurrence       Int     // 1-10
  currentControls  String?
  detection        Int     // 1-10
  rpn              Int     // severity × occurrence × detection
  recommendedAction String?
  actionOwner      String?
  targetDate       DateTime?
  completedAction  String?
  newSeverity      Int?
  newOccurrence    Int?
  newDetection     Int?
  newRpn           Int?
  sortOrder        Int     @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  @@map("qual_fmea_rows")
}
```

### Customer Satisfaction Models

```prisma
model CustomerSurvey {
  id          String         @id @default(cuid())
  title       String
  description String?
  type        SurveyType     // NPS | CSAT | CES | CUSTOM
  status      SurveyStatus
  publicToken String         @unique  // for anonymous survey link
  customerId  String?
  closesAt    DateTime?
  organisationId String
  createdBy   String
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  deletedAt   DateTime?
  questions   SurveyQuestion[]
  responses   SurveyResponse[]
  @@map("qual_customer_surveys")
}
```

### Risk Register (ISO 9001 Clause 6.1)

```prisma
model QualRiskRegister {
  id                 String                 @id @default(cuid())
  referenceNumber    String                 @unique
  title              String
  description        String
  category           String?
  source             String?
  isoClause          String?               // e.g. "6.1"
  department         String?
  owner              String?
  likelihood         QualRiskLikelihood     @default(POSSIBLE)
  impact             QualRiskImpact         @default(MODERATE)
  riskScore          Int                    @default(0)
  residualLikelihood QualRiskLikelihood?
  residualImpact     QualRiskImpact?
  residualScore      Int?
  status             QualRiskRegisterStatus @default(OPEN)
  treatmentStrategy  String?
  controls           String?
  mitigationActions  String?
  reviewDate         DateTime?
  organisationId     String
  createdBy          String
  createdAt          DateTime               @default(now())
  updatedAt          DateTime               @updatedAt
  deletedAt          DateTime?
  @@map("qual_risk_register")
}
```

### Evidence Pack (Prisma-backed)

```prisma
model QualEvidencePack {
  id              String             @id @default(uuid())
  referenceNumber String             @unique
  organisationId  String
  standard        String             // "ISO 9001:2015"
  status          EvidencePackStatus @default(GENERATING)
  format          EvidencePackFormat @default(PDF)
  dateFrom        DateTime?
  dateTo          DateTime?
  sections        Json               @default("[]")  // EvidenceSection[]
  generatedAt     DateTime           @default(now())
  generatedBy     String
  totalDocuments  Int                @default(0)
  totalRecords    Int                @default(0)
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  @@map("qual_evidence_packs")
}
```

### Headstart Assessment (Prisma-backed)

```prisma
model QualHeadstartAssessment {
  id                       String   @id @default(uuid())
  referenceNumber          String   @unique
  organisationId           String
  organisationName         String?
  standards                Json     // string[] — ["ISO 9001:2015", "ISO 14001:2015"]
  industry                 String
  organisationSize         String   // MICRO | SMALL | MEDIUM | LARGE
  certificationStatus      String   // WORKING_TOWARDS | ALREADY_CERTIFIED | UPGRADING | MULTI_STANDARD
  standardPacks            Json     // complex nested roadmap per standard
  convergenceInfo          Json?    // multi-standard shared control savings
  totalDocuments           Int      @default(0)
  totalRisks               Int      @default(0)
  totalObjectives          Int      @default(0)
  totalAudits              Int      @default(0)
  overallCompletenessScore Int      @default(0)
  status                   String   @default("COMPLETE")
  generatedAt              DateTime @default(now())
  generatedBy              String
  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt
  @@map("qual_headstart_assessments")
}
```

### Additional Quality Models (abbreviated)

| Model | Table | Key Fields |
|-------|-------|-----------|
| `QualAudit` | `qual_audits` | type, status, leadAuditor, auditDate, scope, criteria, findings |
| `QualObjective` | `qual_objectives` | isoClause, kpi, target, baseline, current, progressPercent |
| `QualMilestone` | `qual_milestones` | objectiveId, title, dueDate, completed |
| `QualProcess` | `qual_processes` | name, owner, inputs, outputs, kpis, risks |
| `QualMetric` | `qual_metrics` | name, unit, target, actual, trend, frequency |
| `QualCalibration` | `qual_calibrations` | equipmentId, calibrationDate, nextDue, result, certificate |
| `QualCompetence` | `qual_competences` | employeeId, competence, level, achievedDate, expiryDate |
| `QualSupplier` | `qual_suppliers` | name, status, rating, approvalDate, nextReview |
| `QualChange` | `qual_changes` | changeType, impactAssessment, approvedBy, implementedAt |
| `QualInvestigation` | `qual_investigations` | method, rootCause, contributingFactors, lessonsLearned |
| `QualRaci` | `qual_raci` | process, responsible, accountable, consulted, informed |
| `QualImprovement` | `qual_improvements` | category, benefitType, estimatedSaving, status |
| `ProductRecall` | `qual_product_recalls` | recallNumber, severity, rootCause, affectedUnits, status |
| `CounterfeitReport` | `qual_counterfeit_reports` | partNumber, suspectSource, actionTaken |
| `QualDesignProject` | `qual_design_projects` | phase, inputs, outputs, reviewStatus |
| `QualGeneratedTemplate` | `qual_generated_templates` | category, isoStandard, isoClause, configJson, fileUrl |

---

## ENVIRONMENT SCHEMA

**File:** `packages/database/prisma/schemas/environment.prisma`
**Env var:** `ENVIRONMENT_DATABASE_URL`
**Table prefix:** `env_`
**25 models · 52 enums**

### EnvAspect (`env_aspects`)

```prisma
model EnvAspect {
  id                  String              @id @default(cuid())
  orgId               String?
  referenceNumber     String              @unique  // ENV-ASP-2026-001
  activityProcess     String
  activityCategory    EnvActivityCategory
  department          String
  location            String?
  lifecyclePhases     String[]
  operatingCondition  String?
  description         String?
  aspect              String
  impact              String
  impactDirection     EnvImpactDirection  // POSITIVE | NEGATIVE | NEUTRAL
  environmentalMedia  String[]            // AIR | WATER | SOIL | BIODIVERSITY | CLIMATE | HUMAN
  scaleOfImpact       EnvScale
  // Significance scoring (7 factors)
  scoreSeverity       Int       @default(1)  // 1-5 (× 1.5)
  scoreProbability    Int       @default(1)  // 1-5 (× 1.5)
  scoreDuration       Int       @default(1)  // 1-3
  scoreExtent         Int       @default(1)  // 1-3
  scoreReversibility  Int       @default(1)  // 1-3
  scoreRegulatory     Int       @default(1)  // 0 or 2
  scoreStakeholder    Int       @default(1)  // 0 or 2
  significanceScore   Int       @default(0)  // computed total
  isSignificant       Boolean   @default(false)  // score >= 15
  significanceOverride Boolean  @default(false)
  overrideReason      String?
  // Controls
  existingControls    String?
  controlHierarchy    EnvControlHierarchy?
  residualScore       Int?
  targetScore         Int?
  // References
  legalReferences     String?
  permitReference     String?
  applicableStandards String?
  responsiblePerson   String?
  reviewFrequency     EnvReviewFrequency?
  nextReviewDate      DateTime?
  status              EnvAspectStatus @default(ACTIVE)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?
  createdBy           String?
}
```

**Key Enums:**
```
EnvActivityCategory: PRODUCTION | MAINTENANCE | LOGISTICS | OFFICE | CONSTRUCTION |
                     WASTE_MANAGEMENT | WATER_USE | ENERGY_USE | CHEMICAL_USE | OTHER
EnvImpactDirection:  POSITIVE | NEGATIVE | NEUTRAL
EnvScale:            LOCAL | REGIONAL | NATIONAL | GLOBAL
EnvControlHierarchy: ELIMINATION | SUBSTITUTION | PROCESS_CHANGE | ENGINEERING |
                     ADMINISTRATIVE | MONITORING
EnvAspectStatus:     ACTIVE | UNDER_REVIEW | CLOSED | SUPERSEDED
```

### Other Environment Models

| Model | Table | Key Fields |
|-------|-------|-----------|
| `EnvEvent` | `env_events` | eventType, severity, media affected, responseActions, regulatoryNotification |
| `EnvLegal` | `env_legal_requirements` | legislation, clause, complianceStatus, nextReview |
| `EnvObjective` | `env_objectives` | target, baseline, kpi, progress, linkedAspectId |
| `EnvMilestone` | `env_milestones` | objectiveId, dueDate, completed |
| `EnvAction` | `env_actions` | source, priority, owner, dueDate, status |
| `EnvCapa` | `env_capas` | type, rootCause, targetDate, status, effectivenessRating |
| `EnvCapaAction` | `env_capa_actions` | capaId, title, owner, dueDate, status |

---

## FINANCE SCHEMA

**File:** `packages/database/prisma/schemas/finance.prisma`
**Env var:** `FINANCE_DATABASE_URL`
**Table prefix:** `fin_`
**27 models · 18 enums**

### Key Models

```prisma
// Chart of Accounts
model FinAccount {
  id           String         @id @default(cuid())
  code         String         @unique  // e.g. "4100"
  name         String
  type         FinAccountType // ASSET | LIABILITY | EQUITY | REVENUE | EXPENSE
  subType      String?
  normalBalance FinNormalBalance // DEBIT | CREDIT
  description  String?
  isActive     Boolean        @default(true)
  parentId     String?        // parent account (hierarchy)
  organisationId String
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

// Sales Invoice
model FinInvoice {
  id              String          @id @default(cuid())
  invoiceNumber   String          @unique
  customerId      String
  issueDate       DateTime
  dueDate         DateTime
  subtotal        Decimal         @db.Decimal(14, 2)
  taxAmount       Decimal         @db.Decimal(14, 2)
  total           Decimal         @db.Decimal(14, 2)
  amountPaid      Decimal         @default(0) @db.Decimal(14, 2)
  currency        String          @default("GBP")
  status          FinInvoiceStatus // DRAFT | SENT | PARTIALLY_PAID | PAID | OVERDUE | VOID
  lineItems       Json            // InvoiceLineItem[]
  notes           String?
  organisationId  String
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

// Journal Entry
model FinJournalEntry {
  id           String            @id @default(cuid())
  reference    String            @unique
  description  String
  date         DateTime
  status       FinJournalStatus  // DRAFT | POSTED | REVERSED
  lines        Json              // JournalLine[] { accountId, debit, credit, description }
  reversalId   String?           // If this is a reversal
  postedBy     String?
  postedAt     DateTime?
  organisationId String
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
}
```

**Finance Enums:**
```
FinAccountType:     ASSET | LIABILITY | EQUITY | REVENUE | EXPENSE
FinNormalBalance:   DEBIT | CREDIT
FinJournalStatus:   DRAFT | POSTED | REVERSED
FinInvoiceStatus:   DRAFT | SENT | PARTIALLY_PAID | PAID | OVERDUE | VOID | CREDIT_NOTE
FinPOStatus:        DRAFT | SENT | PARTIALLY_RECEIVED | RECEIVED | CANCELLED
FinBillStatus:      DRAFT | PENDING | PARTIALLY_PAID | PAID | OVERDUE | VOID
FinPaymentMethod:   BANK_TRANSFER | CARD | CHEQUE | CASH | DIRECT_DEBIT | BACS
FinBankAccountType: CURRENT | SAVINGS | CREDIT | FOREIGN_CURRENCY
FinTaxJurisdiction: UK | EU | US | AU | CA | GLOBAL
FinTaxReturnStatus: PENDING | SUBMITTED | ACCEPTED | AMENDED | OVERDUE
FinPeriodStatus:    OPEN | LOCKED | CLOSED
FinSyncDirection:   IMPORT | EXPORT | BIDIRECTIONAL
FinSyncStatus:      PENDING | SUCCESS | FAILED | PARTIAL
```

---

## HR SCHEMA

**File:** `packages/database/prisma/schemas/hr.prisma`
**Env var:** `HR_DATABASE_URL`
**Table prefix:** `hr_`
**27 models · 33 enums**

### Key Models

```prisma
model HrEmployee {
  id                String         @id @default(cuid())
  employeeNumber    String         @unique
  userId            String?        // linked User.id in core
  firstName         String
  lastName          String
  email             String         @unique
  phone             String?
  dateOfBirth       DateTime?
  gender            String?
  nationality       String?
  // Employment
  departmentId      String?
  jobTitle          String
  jobGrade          String?
  contractType      ContractType   // PERMANENT | FIXED_TERM | CONTRACTOR | CASUAL | APPRENTICE
  employmentStatus  EmploymentStatus // ACTIVE | ON_LEAVE | SUSPENDED | TERMINATED
  startDate         DateTime
  endDate           DateTime?
  probationEnd      DateTime?
  noticePeriod      Int?           // days
  // Compensation
  salary            Decimal?       @db.Decimal(14, 2)
  currency          String         @default("GBP")
  payFrequency      PayFrequency   // WEEKLY | BIWEEKLY | MONTHLY
  // Location
  location          String?
  workPattern       String?        // OFFICE | REMOTE | HYBRID
  // Emergency contact
  emergencyContact  String?
  emergencyPhone    String?
  organisationId    String
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  deletedAt         DateTime?
}

model HrLeaveRequest {
  id           String       @id @default(cuid())
  employeeId   String
  leaveType    LeaveType    // ANNUAL | SICK | PARENTAL | COMPASSIONATE | STUDY | OTHER
  startDate    DateTime
  endDate      DateTime
  days         Decimal      @db.Decimal(5, 2)
  status       LeaveStatus  // PENDING | APPROVED | REJECTED | CANCELLED
  reason       String?
  approvedById String?
  approvedAt   DateTime?
  comments     String?
  organisationId String
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}
```

---

## AUTOMOTIVE SCHEMA

**File:** `packages/database/prisma/schemas/automotive.prisma`
**Env var:** `AUTOMOTIVE_DATABASE_URL`
**Table prefix:** `auto_`
**23 models · 26 enums**

### Key Models

```prisma
model AutoApqp {
  id              String      @id @default(cuid())
  referenceNumber String      @unique
  projectName     String
  partNumber      String?
  customerId      String?
  launchDate      DateTime?
  status          ApqpStatus
  currentPhase    Int         @default(1)  // 1-5
  phases          Json        // Phase[] with deliverables and gate reviews
  teamMembers     String[]
  organisationId  String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  deletedAt       DateTime?
}

model AutoPpap {
  id              String      @id @default(cuid())
  referenceNumber String      @unique
  partNumber      String
  partName        String
  revision        String
  submissionLevel Int         // 1-5
  customerId      String?
  status          PpapStatus  // DRAFT | IN_PROGRESS | SUBMITTED | APPROVED | REJECTED | INTERIM
  elements        Json        // PpapElement[18] with status and document links
  pswSignedAt     DateTime?
  pswSignedBy     String?
  organisationId  String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  deletedAt       DateTime?
}

model AutoSpc {
  id              String    @id @default(cuid())
  referenceNumber String    @unique
  partNumber      String?
  characteristic  String    // what's being measured
  chartType       SpcChartType // XBAR_R | XBAR_S | IMR | P | NP | C | U
  ucl             Decimal?  // Upper Control Limit
  lcl             Decimal?  // Lower Control Limit
  usl             Decimal?  // Upper Spec Limit
  lsl             Decimal?  // Lower Spec Limit
  cpk             Decimal?  // Process Capability Index
  ppk             Decimal?  // Preliminary Capability
  inControl       Boolean   @default(true)
  dataPoints      Json      @default("[]")  // measurement history
  signals         Json      @default("[]")  // out-of-control signals
  organisationId  String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

**Automotive Enums:**
```
ApqpStatus:   PLANNING | DEVELOPMENT | VALIDATION | LAUNCH | COMPLETE
PpapStatus:   DRAFT | IN_PROGRESS | SUBMITTED | APPROVED | REJECTED | INTERIM_APPROVAL
SpcChartType: XBAR_R | XBAR_S | IMR | P | NP | C | U
FmeaType:     DFMEA | PFMEA | SYSTEM | FUNCTIONAL
```

---

## MEDICAL SCHEMA

**File:** `packages/database/prisma/schemas/medical.prisma`
**Env var:** `MEDICAL_DATABASE_URL`
**Table prefix:** `med_`
**31 models · 44 enums**

### Key Models

```prisma
model MedDeviceRecord {
  id              String       @id @default(cuid())
  deviceNumber    String       @unique
  deviceName      String
  modelNumber     String?
  partNumber      String?
  riskClass       DeviceClass  // CLASS_I | CLASS_IIA | CLASS_IIB | CLASS_III (EU)
                               // or CLASS_1 | CLASS_2 | CLASS_3 (FDA)
  intendedUse     String
  indications     String?
  contraindications String?
  regulatoryBasis String?      // MDR 2017/745, 21 CFR 820
  registrations   Json?        // Country-specific registrations
  status          DeviceStatus
  organisationId  String
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  deletedAt       DateTime?
}

model MedDesignControl {
  id              String              @id @default(cuid())
  deviceId        String
  phase           DesignPhase         // PLANNING | INPUTS | OUTPUTS | REVIEW |
                                      // VERIFICATION | VALIDATION | TRANSFER | CHANGE
  title           String
  description     String?
  status          DesignControlStatus
  approvedBy      String?
  approvedAt      DateTime?
  documents       Json?               // linked document references
  organisationId  String
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
}

model MedRiskManagement {
  id              String   @id @default(cuid())
  deviceId        String
  hazard          String
  hazardousSituation String
  harm            String
  severity        Int      // 1-5
  probability     Int      // 1-5
  initialRisk     Int      // severity × probability
  riskControls    Json     // control measures
  residualSeverity Int?
  residualProbability Int?
  residualRisk    Int?
  acceptable      Boolean  @default(false)
  standard        String   @default("ISO 14971")
  organisationId  String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model MedUdi {
  id              String   @id @default(cuid())
  deviceId        String
  udiDi           String   @unique  // Device Identifier
  udiPi           String?           // Production Identifier (lot/serial/date)
  issuer          String?  // GS1 | HIBCC | ICCBBA
  format          String?  // BARCODE | QR | RFID | LINEAR | 2D
  gtin            String?
  bundleSize      Int?
  organisationId  String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model MedSubmission {
  id              String           @id @default(cuid())
  deviceId        String
  submissionType  SubmissionType   // K510 | PMA | MDR | CE_MARKING | PMCF | OTHER
  submissionNumber String?
  submittedAt     DateTime?
  status          SubmissionStatus // PREPARING | SUBMITTED | UNDER_REVIEW | APPROVED |
                                   // REJECTED | WITHDRAWN | ADDITIONAL_INFO_REQUESTED
  authority       String?          // FDA | MHRA | EMA | TGA
  notes           String?
  organisationId  String
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
}
```

---

## ESG SCHEMA

**File:** `packages/database/prisma/schemas/esg.prisma`
**Env var:** `ESG_DATABASE_URL`
**Table prefix:** `esg_`
**17 models · 18 enums**

### Key Models

```prisma
model EsgEmission {
  id              String         @id @default(cuid())
  scope           EmissionScope  // SCOPE_1 | SCOPE_2_LOCATION | SCOPE_2_MARKET | SCOPE_3
  category        String?        // Scope 3 category (1-15)
  source          String         // "Natural gas combustion", "Grid electricity"
  activityData    Decimal        @db.Decimal(14, 4)
  activityUnit    String         // kWh, km, tonne, litres
  emissionFactor  Decimal        @db.Decimal(14, 6)
  efUnit          String         // kgCO2e per unit
  kgCo2e          Decimal        @db.Decimal(14, 4)  // calculated total
  tCo2e           Decimal        @db.Decimal(14, 6)  // in tonnes
  period          String         // "2026-01" (YYYY-MM)
  year            Int
  month           Int?
  defraFactorId   String?
  organisationId  String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model EsgTarget {
  id              String        @id @default(cuid())
  type            TargetType    // ABSOLUTE | INTENSITY | SCIENCE_BASED
  category        String        // "GHG Reduction", "Water", "Waste"
  baseline        Decimal       @db.Decimal(14, 4)
  baselineYear    Int
  targetValue     Decimal       @db.Decimal(14, 4)
  targetYear      Int
  currentValue    Decimal?      @db.Decimal(14, 4)
  unit            String
  framework       String?       // "SBTi", "CDP", "internal"
  status          TargetStatus  // ON_TRACK | AT_RISK | BEHIND | ACHIEVED | MISSED
  organisationId  String
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model EsgDefraFactor {
  id              String   @id @default(cuid())
  year            Int
  category        String   // "Fuels", "Grid electricity", "Business travel"
  subCategory     String
  unit            String
  kgCo2e          Decimal  @db.Decimal(14, 6)
  kgCo2           Decimal? @db.Decimal(14, 6)
  kgCh4           Decimal? @db.Decimal(14, 6)
  kgN2o           Decimal? @db.Decimal(14, 6)
  source          String   @default("DEFRA")
  createdAt       DateTime @default(now())
}
```

---

## ANALYTICS SCHEMA

**File:** `packages/database/prisma/schemas/analytics.prisma`
**Env var:** `ANALYTICS_DATABASE_URL`
**Table prefix:** `anlt_`
**40 models · 22 enums** — second-largest

### Key Models

```prisma
model AnltDashboard {
  id          String   @id @default(cuid())
  name        String
  description String?
  isDefault   Boolean  @default(false)
  layout      Json     // Widget positions and sizes
  widgets     AnltWidget[]
  ownerId     String
  isPublic    Boolean  @default(false)
  organisationId String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
}

model AnltWidget {
  id          String      @id @default(cuid())
  dashboardId String
  type        WidgetType  // LINE_CHART | BAR_CHART | PIE_CHART | TABLE | KPI_CARD | HEATMAP | MAP
  title       String
  config      Json        // data source, filters, display options
  position    Json        // { x, y, w, h }
  dataSource  String?
  refreshInterval Int?    // seconds
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model AnltKpi {
  id          String    @id @default(cuid())
  module      String    // "quality" | "health-safety" | etc.
  name        String
  description String?
  formula     String?   // calculation formula or SQL
  unit        String?
  target      Decimal?  @db.Decimal(14, 4)
  current     Decimal?  @db.Decimal(14, 4)
  trend       String?   // UP | DOWN | STABLE
  status      KpiStatus // GREEN | AMBER | RED
  frequency   String    // DAILY | WEEKLY | MONTHLY | QUARTERLY
  ownerId     String?
  organisationId String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model AnltReport {
  id          String       @id @default(cuid())
  name        String
  description String?
  type        ReportType   // SCHEDULED | ON_DEMAND | REGULATORY
  query       Json         // Report definition (data sources, filters, columns)
  schedule    Json?        // Cron expression + delivery config
  lastRunAt   DateTime?
  ownerId     String
  isPublic    Boolean      @default(false)
  organisationId String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  deletedAt   DateTime?
  runs        AnltReportRun[]
}

model AnltNlqHistory {
  id          String   @id @default(cuid())
  userId      String
  question    String   // Natural language question
  generatedSql String? // AI-generated SQL
  result      Json?    // Query result
  success     Boolean  @default(false)
  error       String?
  duration    Int?     // ms
  organisationId String
  createdAt   DateTime @default(now())
}
```

---

## WORKFLOWS SCHEMA

**File:** `packages/database/prisma/schemas/workflows.prisma`
**Env var:** `WORKFLOWS_DATABASE_URL`
**Table prefix:** `wf_`
**17 models · 29 enums**

### Key Models

```prisma
model WfDefinition {
  id          String            @id @default(cuid())
  name        String
  description String?
  version     Int               @default(1)
  isActive    Boolean           @default(true)
  trigger     WfTriggerType     // MANUAL | AUTOMATIC | SCHEDULED | EVENT
  triggerConfig Json?           // event type, schedule, conditions
  steps       Json              // WfStep[] - sequential + branching
  slaHours    Int?              // SLA for entire workflow
  category    String?
  tags        String[]
  organisationId String
  createdBy   String
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  deletedAt   DateTime?
  instances   WfInstance[]
}

model WfInstance {
  id           String          @id @default(cuid())
  definitionId String
  status       WfStatus        // PENDING | RUNNING | WAITING | COMPLETED | FAILED | CANCELLED
  currentStep  String?
  context      Json            // workflow variables/data payload
  startedAt    DateTime        @default(now())
  completedAt  DateTime?
  startedBy    String
  entityType   String?         // linked entity type (e.g. "ncr")
  entityId     String?         // linked entity ID
  organisationId String
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}

model WfTask {
  id           String      @id @default(cuid())
  instanceId   String
  stepId       String
  assigneeId   String?
  assigneeRole String?
  title        String
  description  String?
  dueDate      DateTime?
  status       WfTaskStatus // PENDING | IN_PROGRESS | COMPLETED | SKIPPED | FAILED
  outcome      String?
  notes        String?
  completedBy  String?
  completedAt  DateTime?
  organisationId String
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

model WfApproval {
  id           String          @id @default(cuid())
  instanceId   String
  stepId       String
  approvers    String[]        // user IDs required to approve
  approved     String[]        // user IDs who approved
  rejected     String[]        // user IDs who rejected
  requiredCount Int            @default(1)  // how many approvals needed
  status       WfApprovalStatus // PENDING | APPROVED | REJECTED | DELEGATED
  deadline     DateTime?
  comments     String?
  organisationId String
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}
```

**Workflow Enums:**
```
WfTriggerType:    MANUAL | AUTOMATIC | SCHEDULED | EVENT | WEBHOOK
WfStatus:         PENDING | RUNNING | WAITING | COMPLETED | FAILED | CANCELLED | SUSPENDED
WfTaskStatus:     PENDING | IN_PROGRESS | COMPLETED | SKIPPED | FAILED | EXPIRED
WfApprovalStatus: PENDING | APPROVED | REJECTED | DELEGATED | EXPIRED
```

---

## EMERGENCY SCHEMA

**File:** `packages/database/prisma/schemas/emergency.prisma`
**Env var:** `EMERGENCY_DATABASE_URL`
**Table prefix:** `fem_`
**16 models · 10 enums**

### Key Models

| Model | Purpose |
|-------|---------|
| `FemPremises` | Building/site register — address, floors, capacity, evacuation routes |
| `FemBcp` | Business Continuity Plans — recovery strategies, RTO/RPO, activation |
| `FemDrill` | Emergency drill records — type, participants, findings, effectiveness |
| `FemEquipment` | Emergency equipment register — type, location, inspection schedule, certifications |
| `FemWarden` | Fire warden register — training date, floor allocation, expiry |
| `FemPeep` | Personal Emergency Evacuation Plans — vulnerable persons, evacuation requirements |
| `FemFireRisk` | Fire Risk Assessments — hazards, actions, review dates |
| `FemIncident` | Emergency incidents — type, response level (GOLD/SILVER/BRONZE), timeline |
| `FemDecision` | Incident management decisions log |
| `FemResource` | Resources deployed during incident |
| `FemCommunication` | External communications during incident |
| `FemTimeline` | Incident timeline events |

---

## PAYROLL SCHEMA

**File:** `packages/database/prisma/schemas/payroll.prisma`
**Env var:** `PAYROLL_DATABASE_URL`
**Table prefix:** `payroll_`
**15 models · 20 enums**

### Key Models

```prisma
model PayrollRun {
  id           String        @id @default(cuid())
  period       String        // "2026-02" (YYYY-MM)
  status       PayrollStatus // DRAFT | PROCESSING | COMPLETED | LOCKED | REVERSED
  totalGross   Decimal       @db.Decimal(14, 2)
  totalTax     Decimal       @db.Decimal(14, 2)
  totalNi      Decimal       @db.Decimal(14, 2)
  totalNet     Decimal       @db.Decimal(14, 2)
  employeeCount Int
  processedAt  DateTime?
  processedBy  String?
  organisationId String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  payslips     PayrollPayslip[]
}

model PayrollPayslip {
  id            String   @id @default(cuid())
  runId         String
  employeeId    String
  period        String
  grossPay      Decimal  @db.Decimal(14, 2)
  incomeTax     Decimal  @db.Decimal(14, 2)
  employeeNi    Decimal  @db.Decimal(14, 2)
  employerNi    Decimal  @db.Decimal(14, 2)
  pensionEe     Decimal  @db.Decimal(14, 2)  // employee pension
  pensionEr     Decimal  @db.Decimal(14, 2)  // employer pension
  totalDeductions Decimal @db.Decimal(14, 2)
  netPay        Decimal  @db.Decimal(14, 2)
  taxCode       String?
  niCategory    String?
  ytdGross      Decimal  @db.Decimal(14, 2)
  ytdTax        Decimal  @db.Decimal(14, 2)
  breakdown     Json     // detailed earnings/deductions
  organisationId String
  createdAt     DateTime @default(now())
}

// Prisma-backed jurisdiction (migrated from in-memory Map)
model PayrollJurisdiction {
  id              String   @id @default(uuid())
  country         String
  region          String?
  taxYear         String   // "2025-26"
  incomeTaxBands  Json     // { from, to, rate }[]
  niRates         Json     // employee/employer rates
  pensionMinimum  Decimal? @db.Decimal(5, 4)
  currency        String
  payFrequencies  String[]
  rules           Json?    // jurisdiction-specific rules
  effectiveFrom   DateTime
  effectiveTo     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@unique([country, region, taxYear])
  @@map("payroll_jurisdictions")
}
```

---

## SMALLER SCHEMAS (Summary Reference)

### Complaints Schema
```
Model: Complaint — referenceNumber, type (CUSTOMER/REGULATORY/INTERNAL), severity,
       status workflow (RECEIVED→INVESTIGATING→RESOLVED→CLOSED), assignee, SLA deadline
Model: ComplaintAction — investigation steps, resolution actions
Model: ComplaintCommunication — correspondence with complainant
```

### Contracts Schema
```
Model: Contract — contractType, parties, value, startDate, endDate, noticePeriod, autoRenew
Model: ContractClause — clause library with standard/custom clauses
Model: ContractApproval — multi-signatory approval workflow
Model: ContractNotice — renewal/termination notices with deadlines
```

### Audits Schema
```
Model: Audit — type (INTERNAL/EXTERNAL/REGULATORY), standard, scope, findings
Model: AuditFinding — NC/observation/OFI with severity and action links
Model: AuditChecklist — checklist templates with pass/fail criteria
Model: AuditProgramme — annual audit schedule with coverage planning
```

### Documents Schema
```
Model: Document — title, type, version, status, fileUrl, approvedBy, reviewDate
Model: DocumentVersion — version history chain
Model: DocumentApproval — approval workflow per version
Model: DocumentReadReceipt — acknowledgement tracking
```

### Training Schema
```
Model: TrainingCourse — name, type, duration, provider, method (CLASSROOM/ONLINE/OJT)
Model: TrainingRecord — employee + course, date, result, certificate, expiry
Model: TrainingCompetency — required vs achieved competency levels
Model: TrainingMatrix — org-wide skills matrix
Model: TrainingTna — TNA analysis record
```

### Assets Schema
```
Model: Asset — assetNumber, category, location, purchaseDate, value, status, warrantyExpiry
Model: AssetWorkOrder — maintenance/repair work orders
Model: AssetCalibration — calibration records with certificates
Model: AssetInspection — periodic inspection records
```

### Incidents Schema (RIDDOR-specific)
```
Model: IncidentRecord — RIDDOR-focused: over7Day, specifiedInjury, dangerousOccurrence,
       f2508Generated, hseReference, workRelated, employerName, site
Enums: IncidentCategory, RiddorType, InvestigationOutcome, WorkType
```

### Risk Schema
```
Model: RiskEntry — inherent/residual risk matrix, treatment strategy, bow-tie link
Model: RiskCategory — category hierarchy with appetite levels
Model: RiskControl — control library with effectiveness ratings
Model: RiskTreatment — treatment plans with actions
Model: RiskReview — periodic review attestations
Model: RiskAction — treatment actions with owners
Model: RiskCapa — risk-linked CAPAs
Model: BowTieAnalysis — threats/consequences with barrier controls
Model: HeatMap — risk heat map configuration
Model: Kri — Key Risk Indicators with threshold alerts
```

### Chemicals Schema
```
Model: Chemical — CAS number, GHS classification, SDS reference, storage group, quantity
Model: Sds — Safety Data Sheet with 16 sections, version, expiry
Model: CoshhAssessment — substance + activity + controls + WEL comparison
Model: ChemicalInventory — location-based inventory with quantities
Model: ChemicalDisposal — waste disposal records with carrier details
Model: ExposureMonitoring — personal monitoring results with WEL comparison
Model: ChemicalIncident — spill/exposure incident records
Model: ChemicalMonitoring — scheduled monitoring tasks
Model: ChemicalAnalytics — computed summaries
```

### PTW Schema
```
Model: Permit — permitType, workDescription, hazards, controls, validFrom/To, status
Model: Isolation — electrical/mechanical isolation records with LOTO
Model: ToolboxTalk — pre-work safety briefing records
```

### Reg Monitor Schema
```
Model: RegChange — regulation, jurisdiction, changeType, effectiveDate, impact assessment
Model: LegalRegister — obligation register linked to regulatory changes
Model: Obligation — specific compliance obligations with owner and deadline
```

### ISO 42001 Schema (AI Management)
```
Models: AiSystem (register), AiRiskAssessment, AiControl (annex controls),
        AiImpactAssessment, AiPolicy, AiMonitoring, AiIncident,
        AiHumanReview, AiAuditLog, AiSelfDeclaration
```

### ISO 37001 Schema (Anti-Bribery)
```
Models: AbPolicy, AbRiskAssessment, AbDueDiligence (third-party),
        AbGiftsHospitality, AbInvestigation, AbCompliance, AbTraining
```

### Platform Schema
```
Key models: FeatureFlag (per-org toggles), WebhookEndpoint, WebhookDelivery,
            AutomationRule, AutomationExecution, DataProcessingAgreement,
            SsoConfig, IpAllowlistEntry, ComplianceCalendarEvent,
            NpsResponse, PresenceRecord, Comment, Task, ScheduledReport
```

### Partner Portal Schema
```
Models: MktPartnerAccount, MktPartnerSupportTicket,
        MktPartnerCollateral, MktPartnerReferral
```

### Wizard Schema
```
Models: SetupWizardSession (tracks onboarding progress, steps completed),
        SetupWizardStep (per-step data)
```

### Marketplace Schema
```
Models: MarketplaceIntegration (available integrations),
        MarketplaceInstallation (org-specific installs),
        MarketplaceCategory, MarketplaceReview
```

---

## DATABASE INDEXES (Performance Reference)

All models include these standard indexes:
```sql
-- Multi-tenancy + soft delete (most common query pattern)
@@index([orgId, deletedAt])
@@index([orgId])
@@index([deletedAt])

-- Status queries
@@index([status])

-- Date-based queries
@@index([createdAt])
@@index([updatedAt])

-- Foreign key relations
@@index([parentId])    -- hierarchical models
@@index([ownerId])     -- assignment
@@index([assigneeId])  -- task/action assignment
```

Domain-specific indexes (examples):
```sql
-- Health-Safety
@@index([type])          -- Incident.type for filtering
@@index([severity])      -- Incident.severity for alerting
@@index([dateOccurred])  -- Incident.dateOccurred for reporting
@@index([riskScore])     -- Risk.riskScore for heat map

-- Quality
@@index([isoClause])     -- for clause-based filtering
@@index([reviewDate])    -- for upcoming reviews
@@index([dueDate])       -- for overdue actions

-- Analytics
@@index([module])        -- KPI queries by module
@@index([period])        -- time-series aggregation
@@index([year, month])   -- monthly rollups (unique)
```

---

## MIGRATION & MAINTENANCE REFERENCE

### Safe Migration Commands
```bash
# Generate CREATE-only SQL (safe for multi-schema environment)
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel=packages/database/prisma/schemas/<domain>.prisma \
  --script \
  > /tmp/<domain>_migrate.sql

# Review before applying (ensure no DROP statements)
grep -i "drop" /tmp/<domain>_migrate.sql  # should return nothing

# Apply
PGPASSWORD=ims_secure_password_2026 psql \
  -h localhost -U postgres -d ims \
  -v ON_ERROR_STOP=0 \
  < /tmp/<domain>_migrate.sql

# Add column safely
ALTER TABLE <table> ADD COLUMN IF NOT EXISTS <col> <type> DEFAULT <default>;

# Extend enum safely
ALTER TYPE "<EnumName>" ADD VALUE IF NOT EXISTS '<NewValue>';

# Regenerate Prisma client
npx prisma@5.22.0 generate --schema=packages/database/prisma/schemas/<domain>.prisma
```

### Connection String Format
```
postgresql://postgres:<password>@localhost:5432/ims?connection_limit=1
```
`connection_limit=1` — each service maintains 1 connection (43+ services × 1 = 43+ total, within max_connections=100)

### Environment Variable Naming
```bash
# Each domain uses its own named var:
HEALTH_SAFETY_DATABASE_URL=postgresql://...
ENVIRONMENT_DATABASE_URL=postgresql://...
QUALITY_DATABASE_URL=postgresql://...
AUTOMOTIVE_DATABASE_URL=postgresql://...
MEDICAL_DATABASE_URL=postgresql://...
AEROSPACE_DATABASE_URL=postgresql://...
FINANCE_DATABASE_URL=postgresql://...
HR_DATABASE_URL=postgresql://...
PAYROLL_DATABASE_URL=postgresql://...
WORKFLOWS_DATABASE_URL=postgresql://...
# ... (one per service)
```

---

*Document generated: February 21, 2026*
*Database: PostgreSQL 16 · ORM: Prisma 5.22.0 · 44 schemas · 606 models · 781 enums*
