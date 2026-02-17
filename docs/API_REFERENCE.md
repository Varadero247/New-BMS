# IMS API Reference

> **Note:** This reference covers all 42 API services. See SYSTEM_STATE.md for the complete inventory.

## Base URL

All API requests go through the API Gateway:
```
http://localhost:4000
```

## Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@ims.local",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "admin@ims.local",
      "name": "Admin User",
      "role": "ADMIN"
    }
  }
}
```

### Using the Token

All authenticated requests must include the Bearer token:
```http
Authorization: Bearer <accessToken>
```

The frontend stores the token in `localStorage` as `token` and attaches it via an axios request interceptor.

### Token Refresh

On 401 response, the frontend clears `localStorage` and redirects to `/login`.

---

## CORS Configuration

### Requirements
- Gateway handles CORS for all services
- Allowed origins: `http://localhost:3000` through `http://localhost:3025`
- Credentials: enabled
- Methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- Allowed headers: `Content-Type, Authorization, X-CSRF-Token, X-Correlation-ID`

### Important Notes
- Do NOT set `CORS_ORIGIN` in `.env` — let the code use the hardcoded origins array
- Do NOT use `withCredentials: true` on axios — use Bearer token auth instead
- Gateway strips CORS headers from downstream services via `onProxyRes`
- `crossOriginResourcePolicy` is set to `cross-origin` in Helmet config

---

## Response Shapes

### Success (single item)
```json
{
  "success": true,
  "data": { ... }
}
```

### Success (list)
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 123,
    "totalPages": 3
  }
}
```

### Error
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Frontend Access Pattern
```typescript
// Axios wraps response in .data, then API response has .data
const response = await api.get('/risks');
const risks = response.data.data; // array of risks
```

---

## Health & Safety API

All H&S endpoints are proxied: `GET /api/health-safety/*` → `api-health-safety:4001/api/*`

### Risk Register

#### List Risks
```http
GET /api/health-safety/risks
```

Query parameters:
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 50) |
| `search` | string | Search title/description |
| `status` | string | Filter by status |
| `riskLevel` | string | Filter by risk level |

#### Get Single Risk
```http
GET /api/health-safety/risks/:id
```

#### Create Risk
```http
POST /api/health-safety/risks
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "string (required)",
  "description": "string",
  "category": "string",
  "location": "string",
  "department": "string",
  "likelihood": 1-5,
  "severity": 1-5,
  "existingControls": "string",
  "status": "ACTIVE | MITIGATED | CLOSED | UNDER_REVIEW"
}
```

Risk score is auto-calculated: `likelihood × severity`.

#### Update Risk
```http
PATCH /api/health-safety/risks/:id
Authorization: Bearer <token>
```
Same body as POST (all fields optional).

#### Delete Risk
```http
DELETE /api/health-safety/risks/:id
Authorization: Bearer <token>
```

---

### Incident Register

#### List Incidents
```http
GET /api/health-safety/incidents
```

Query parameters:
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `search` | string | Search title/description |
| `type` | string | Filter by incident type |
| `severity` | string | Filter by severity |
| `status` | string | Filter by status |

#### Get Single Incident
```http
GET /api/health-safety/incidents/:id
```

#### Create Incident
```http
POST /api/health-safety/incidents
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "string (required) — NOT incidentTitle",
  "type": "INJURY | NEAR_MISS | DANGEROUS_OCCURRENCE | OCCUPATIONAL_ILLNESS | PROPERTY_DAMAGE | FIRST_AID | MEDICAL_TREATMENT | LOST_TIME",
  "severity": "MINOR | MODERATE | MAJOR | CRITICAL | CATASTROPHIC (uppercase)",
  "dateOccurred": "YYYY-MM-DD — NOT incidentDate",
  "location": "string",
  "department": "string",
  "description": "string",
  "reportedBy": "string",
  "immediateActions": "string",
  "injuredPersonName": "string (optional)",
  "injuredPersonRole": "string (optional)",
  "employmentType": "string (optional)",
  "lostTime": false,
  "witnesses": "string (optional)",
  "riddorReportable": false,
  "regulatoryReference": "string (optional)",
  "reportedToAuthority": false,
  "reportedToAuthorityDate": "YYYY-MM-DD (optional)",
  "investigationRequired": false,
  "investigationDueDate": "YYYY-MM-DD (optional)"
}
```

**Auto-generated fields:**
- Reference number: `INC-YYMM-XXXX` (e.g., `INC-2602-0001`)
- RIDDOR: Auto-set to `true` for `CRITICAL` or `MAJOR` severity
- Investigation required: Auto-set to `true` for `CRITICAL` or `MAJOR`
- Investigation due date: Auto-calculated — CRITICAL=24hrs, MAJOR=3days, MODERATE=7days

#### Update Incident
```http
PATCH /api/health-safety/incidents/:id
Authorization: Bearer <token>
```

#### Delete Incident
```http
DELETE /api/health-safety/incidents/:id
Authorization: Bearer <token>
```

---

### Legal Register

#### List Legal Requirements
```http
GET /api/health-safety/legal
```

Query parameters:
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `search` | string | Search title/description |
| `complianceStatus` | string | Filter by compliance status |
| `category` | string | Filter by category |

#### Get Single Requirement
```http
GET /api/health-safety/legal/:id
```

#### Create Legal Requirement
```http
POST /api/health-safety/legal
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "string (required)",
  "description": "string",
  "category": "PRIMARY_LEGISLATION | SUBORDINATE_LEGISLATION | ACOP | HSE_GUIDANCE | INTERNATIONAL_STANDARD | INDUSTRY_STANDARD | CONTRACTUAL | VOLUNTARY",
  "jurisdiction": "string",
  "legislationRef": "string",
  "section": "string",
  "effectiveDate": "YYYY-MM-DD",
  "reviewDate": "YYYY-MM-DD",
  "complianceStatus": "COMPLIANT | PARTIAL | NON_COMPLIANT | UNDER_REVIEW | NOT_ASSESSED",
  "complianceNotes": "string",
  "responsiblePerson": "string",
  "applicableAreas": "string",
  "status": "ACTIVE | UNDER_REVIEW | SUPERSEDED | ARCHIVED"
}
```

**Auto-generated fields:**
- Reference number: `LR-001`, `LR-002`, etc.

#### Update Requirement
```http
PATCH /api/health-safety/legal/:id
Authorization: Bearer <token>
```

#### Delete Requirement
```http
DELETE /api/health-safety/legal/:id
Authorization: Bearer <token>
```

---

### OHS Objectives

#### List Objectives
```http
GET /api/health-safety/objectives
```

Query parameters:
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `search` | string | Search title/description |
| `status` | string | Filter by status |
| `category` | string | Filter by category |

Response includes nested `milestones` array.

#### Get Single Objective
```http
GET /api/health-safety/objectives/:id
```

Includes milestones.

#### Create Objective
```http
POST /api/health-safety/objectives
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "string (required)",
  "objectiveStatement": "string",
  "category": "INCIDENT_REDUCTION | HAZARD_ELIMINATION | TRAINING | AUDIT | LEGAL_COMPLIANCE | HEALTH_WELLBEING | RISK_REDUCTION | CONTRACTOR_MANAGEMENT | OTHER",
  "ohsPolicyLink": "string",
  "department": "string",
  "owner": "string",
  "startDate": "YYYY-MM-DD",
  "targetDate": "YYYY-MM-DD",
  "kpiDescription": "string",
  "baselineValue": 0.0,
  "targetValue": 0.0,
  "currentValue": 0.0,
  "unit": "string",
  "monitoringFrequency": "string",
  "resourcesRequired": "string",
  "progressNotes": "string",
  "status": "ACTIVE | ON_TRACK | AT_RISK | BEHIND | ACHIEVED | CANCELLED",
  "milestones": [
    { "title": "string", "dueDate": "YYYY-MM-DD" }
  ]
}
```

**Auto-generated fields:**
- Reference number: `OBJ-001`, `OBJ-002`, etc.
- Progress percent: Auto-calculated from milestones completion

#### Update Objective
```http
PATCH /api/health-safety/objectives/:id
Authorization: Bearer <token>
```

#### Delete Objective
```http
DELETE /api/health-safety/objectives/:id
Authorization: Bearer <token>
```

Cascade deletes associated milestones.

#### Add Milestone
```http
POST /api/health-safety/objectives/:id/milestones
Authorization: Bearer <token>

{
  "title": "string",
  "dueDate": "YYYY-MM-DD"
}
```

#### Update Milestone
```http
PATCH /api/health-safety/objectives/:id/milestones/:mid
Authorization: Bearer <token>

{
  "completed": true
}
```

---

### CAPA Management

#### List CAPAs
```http
GET /api/health-safety/capa
```

Query parameters:
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `search` | string | Search title/description |
| `status` | string | Filter by status |
| `type` | string | Filter by CAPA type |
| `source` | string | Filter by source |
| `priority` | string | Filter by priority |

Response includes nested `actions` array.

#### Get Single CAPA
```http
GET /api/health-safety/capa/:id
```

Includes actions.

#### Create CAPA
```http
POST /api/health-safety/capa
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "string (required)",
  "capaType": "CORRECTIVE | PREVENTIVE | IMPROVEMENT",
  "source": "INCIDENT | NEAR_MISS | AUDIT | RISK_ASSESSMENT | LEGAL | MANAGEMENT_REVIEW | WORKER_SUGGESTION | OTHER",
  "sourceReference": "string",
  "priority": "CRITICAL | HIGH | MEDIUM | LOW",
  "raisedDate": "YYYY-MM-DD",
  "department": "string",
  "responsiblePerson": "string",
  "problemStatement": "string (min 30 chars)",
  "rootCauseAnalysis": "string",
  "containmentActions": "string",
  "successCriteria": "string",
  "verificationMethod": "string"
}
```

**Auto-generated fields:**
- Reference number: `CAPA-001`, `CAPA-002`, etc.
- Target completion date: Auto-set from priority — CRITICAL=7days, HIGH=14days, MEDIUM=30days, LOW=60days

#### Update CAPA
```http
PATCH /api/health-safety/capa/:id
Authorization: Bearer <token>
```

For closure, include: `status: "CLOSED"`, `closureNotes`, `effectivenessRating`.

#### Delete CAPA
```http
DELETE /api/health-safety/capa/:id
Authorization: Bearer <token>
```

Cascade deletes associated actions.

#### Add CAPA Action
```http
POST /api/health-safety/capa/:id/actions
Authorization: Bearer <token>

{
  "title": "string",
  "description": "string",
  "type": "IMMEDIATE | CORRECTIVE | PREVENTIVE",
  "owner": "string",
  "dueDate": "YYYY-MM-DD"
}
```

#### Update CAPA Action
```http
PATCH /api/health-safety/capa/:id/actions/:aid
Authorization: Bearer <token>

{
  "status": "OPEN | IN_PROGRESS | COMPLETED | VERIFIED | OVERDUE | CANCELLED"
}
```

---

## Environment API (ISO 14001:2015)

All Environment endpoints are proxied: `GET /api/environment/*` → `api-environment:4002/api/*`

### Aspects & Impacts (Clause 6.1.2)

#### List Aspects
```http
GET /api/environment/aspects
```

Query parameters:
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 50) |
| `search` | string | Search activity/aspect/impact/reference |
| `status` | string | Filter: `ACTIVE \| UNDER_REVIEW \| CONTROLLED \| CLOSED` |
| `significant` | string | Filter: `true \| false` |

#### Get Single Aspect
```http
GET /api/environment/aspects/:id
```

#### Create Aspect
```http
POST /api/environment/aspects
Content-Type: application/json
Authorization: Bearer <token>

{
  "activityProcess": "string (required)",
  "activityCategory": "ENERGY_USE | WATER_USE | WASTE_GENERATION | EMISSIONS_TO_AIR | DISCHARGES_TO_WATER | LAND_CONTAMINATION | RESOURCE_USE | NOISE_VIBRATION | BIODIVERSITY | TRANSPORT | PROCUREMENT | PRODUCT_DESIGN | OTHER",
  "department": "string (required)",
  "location": "string",
  "lifecyclePhases": ["string"],
  "operatingCondition": "NORMAL | ABNORMAL | EMERGENCY",
  "description": "string",
  "aspect": "string (required)",
  "impact": "string (required)",
  "impactDirection": "ADVERSE | BENEFICIAL",
  "environmentalMedia": ["string"],
  "scaleOfImpact": "LOCAL | REGIONAL | NATIONAL | GLOBAL",
  "scoreSeverity": 1-5,
  "scoreProbability": 1-5,
  "scoreDuration": 1-5,
  "scoreExtent": 1-5,
  "scoreReversibility": 1-5,
  "scoreRegulatory": 1-5,
  "scoreStakeholder": 1-5,
  "existingControls": "string",
  "controlHierarchy": "ELIMINATION | SUBSTITUTION | ENGINEERING | ADMINISTRATIVE | MONITORING",
  "residualScore": number,
  "targetScore": number,
  "responsiblePerson": "string",
  "reviewFrequency": "MONTHLY | QUARTERLY | ANNUALLY",
  "nextReviewDate": "YYYY-MM-DD",
  "status": "ACTIVE | UNDER_REVIEW | CONTROLLED | CLOSED"
}
```

**Auto-generated fields:**
- Reference number: `ENV-ASP-YYYY-NNN` (e.g., `ENV-ASP-2026-001`)
- Significance score: `severity*1.5 + probability*1.5 + duration + extent + reversibility + regulatory + stakeholder`
- `isSignificant`: `true` when score >= 15

#### Update Aspect
```http
PUT /api/environment/aspects/:id
Authorization: Bearer <token>
```

#### Delete Aspect
```http
DELETE /api/environment/aspects/:id
Authorization: Bearer <token>
```

---

### Environmental Events

#### List Events
```http
GET /api/environment/events
```

Query parameters:
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `search` | string | Search description/location/reference/reportedBy |
| `status` | string | Filter: `REPORTED \| UNDER_INVESTIGATION \| CONTAINED \| REMEDIATED \| CLOSED \| REGULATORY_REVIEW` |
| `eventType` | string | Filter by event type |
| `severity` | string | Filter: `MINOR \| MODERATE \| MAJOR \| CRITICAL \| CATASTROPHIC` |

#### Create Event
```http
POST /api/environment/events
Content-Type: application/json
Authorization: Bearer <token>

{
  "eventType": "SPILL_RELEASE | NEAR_MISS | REGULATORY_EXCEEDANCE | STAKEHOLDER_COMPLAINT | NON_CONFORMANCE | ENVIRONMENTAL_EMERGENCY | PERMIT_BREACH | WASTE_MISMANAGEMENT | NOISE_COMPLAINT | OTHER (required)",
  "severity": "MINOR | MODERATE | MAJOR | CRITICAL | CATASTROPHIC (required)",
  "dateOfEvent": "YYYY-MM-DD (required)",
  "location": "string (required)",
  "department": "string (required)",
  "reportedBy": "string (required)",
  "description": "string (required, min 10 chars)",
  "substanceInvolved": "string",
  "quantityReleased": number,
  "rcaMethod": "FIVE_WHY | FISHBONE | FAULT_TREE | BOWTIE | TIMELINE | BARRIER_ANALYSIS | OTHER",
  "rootCause": "string",
  "immediateActions": "string"
}
```

**Auto-generated fields:**
- Reference number: `ENV-EVT-YYYY-NNN`
- `closureDate` auto-set when status changes to `CLOSED`

---

### Legal Register (Clause 6.1.3)

#### List Legal Requirements
```http
GET /api/environment/legal
```

Query parameters:
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search title/description/reference/legislation |
| `complianceStatus` | string | `COMPLIANT \| PARTIALLY_COMPLIANT \| NON_COMPLIANT \| NOT_ASSESSED \| NOT_APPLICABLE` |
| `obligationType` | string | Filter by type |
| `jurisdiction` | string | `UK \| EU \| INTERNATIONAL \| LOCAL_AUTHORITY \| OTHER` |
| `status` | string | `ACTIVE \| REVIEW_DUE \| SUPERSEDED \| ARCHIVED` |

#### Create Legal Requirement
```http
POST /api/environment/legal
Content-Type: application/json
Authorization: Bearer <token>

{
  "obligationType": "LEGISLATION | REGULATION | PERMIT | LICENCE | PLANNING_CONDITION | INDUSTRY_STANDARD | VOLUNTARY_COMMITMENT | CONTRACTUAL | ACOP | GUIDANCE (required)",
  "title": "string (required)",
  "jurisdiction": "UK | EU | INTERNATIONAL | LOCAL_AUTHORITY | OTHER (required)",
  "regulatoryBody": "string (required)",
  "legislationReference": "string (required)",
  "description": "string (required)",
  "applicableActivities": "string (required)",
  "responsiblePerson": "string (required)",
  "effectiveDate": "YYYY-MM-DD",
  "reviewDate": "YYYY-MM-DD",
  "complianceStatus": "COMPLIANT | PARTIALLY_COMPLIANT | NON_COMPLIANT | NOT_ASSESSED | NOT_APPLICABLE"
}
```

**Auto-generated fields:**
- Reference number: `ENV-LEG-YYYY-NNN`

---

### Objectives & Targets (Clause 6.2)

#### List Objectives
```http
GET /api/environment/objectives
```

Response includes nested `milestones` array.

Query parameters:
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search title/statement/reference/owner |
| `status` | string | `NOT_STARTED \| ON_TRACK \| AT_RISK \| BEHIND \| ACHIEVED \| CANCELLED \| DEFERRED` |
| `category` | string | `ENERGY_REDUCTION \| WATER_REDUCTION \| WASTE_REDUCTION \| EMISSIONS_REDUCTION \| BIODIVERSITY \| POLLUTION_PREVENTION \| etc.` |

#### Create Objective
```http
POST /api/environment/objectives
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "string (required)",
  "objectiveStatement": "string (required)",
  "category": "ENERGY_REDUCTION | WATER_REDUCTION | WASTE_REDUCTION | EMISSIONS_REDUCTION | ... (required)",
  "targetDate": "YYYY-MM-DD (required)",
  "owner": "string (required)",
  "baselineValue": number,
  "targetValue": number,
  "currentValue": number,
  "milestones": [
    { "title": "string", "dueDate": "YYYY-MM-DD" }
  ]
}
```

**Auto-generated fields:**
- Reference number: `ENV-OBJ-YYYY-NNN`

#### Update Milestone
```http
PATCH /api/environment/objectives/:id/milestones/:milestoneId
Authorization: Bearer <token>

{
  "completed": true
}
```

Auto-sets `completedDate` when `completed` is `true`.

---

### Environmental Actions

#### List Actions
```http
GET /api/environment/actions
```

Query parameters:
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search title/description/reference/assignedTo |
| `status` | string | `OPEN \| IN_PROGRESS \| COMPLETED \| VERIFIED \| OVERDUE \| CANCELLED \| DEFERRED` |
| `priority` | string | `CRITICAL \| HIGH \| MEDIUM \| LOW` |
| `actionType` | string | Filter by type |
| `source` | string | Filter by source |

#### Create Action
```http
POST /api/environment/actions
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "string (required)",
  "actionType": "CORRECTIVE | PREVENTIVE | IMPROVEMENT | LEGAL_COMPLIANCE | OBJECTIVE_SUPPORT | ASPECT_CONTROL | EMERGENCY_RESPONSE | MONITORING (required)",
  "priority": "CRITICAL | HIGH | MEDIUM | LOW (required)",
  "source": "ASPECT_REGISTER | EVENT_REPORT | LEGAL_REGISTER | OBJECTIVE | AUDIT_FINDING | MANAGEMENT_REVIEW | STAKEHOLDER | REGULATORY_REQUIREMENT | OTHER (required)",
  "description": "string (required)",
  "assignedTo": "string (required)",
  "dueDate": "YYYY-MM-DD (required)"
}
```

**Auto-generated fields:**
- Reference number: `ENV-ACT-YYYY-NNN`
- `completionDate` auto-set when status changes to `COMPLETED`

---

### CAPA Management (Clause 10.2)

#### List CAPAs
```http
GET /api/environment/capa
```

Response includes nested `capaActions` array.

Query parameters:
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search title/description/reference |
| `status` | string | `INITIATED \| ROOT_CAUSE_ANALYSIS \| ACTIONS_DEFINED \| IMPLEMENTATION \| VERIFICATION \| CLOSED \| CANCELLED` |
| `capaType` | string | `CORRECTIVE \| PREVENTIVE \| IMPROVEMENT` |
| `severity` | string | `MINOR \| MODERATE \| MAJOR \| CRITICAL` |

#### Create CAPA
```http
POST /api/environment/capa
Content-Type: application/json
Authorization: Bearer <token>

{
  "capaType": "CORRECTIVE | PREVENTIVE | IMPROVEMENT (required)",
  "title": "string (required)",
  "severity": "MINOR | MODERATE | MAJOR | CRITICAL (required)",
  "triggerSource": "ENVIRONMENTAL_EVENT | LEGAL_NON_CONFORMANCE | INTERNAL_AUDIT | EXTERNAL_AUDIT | MANAGEMENT_REVIEW | ... (required)",
  "description": "string (required)",
  "initiatedBy": "string (required)",
  "responsiblePerson": "string (required)",
  "targetClosureDate": "YYYY-MM-DD (required)",
  "rcaMethod": "FIVE_WHY | FISHBONE | FAULT_TREE | BOWTIE | TIMELINE | BARRIER_ANALYSIS | OTHER",
  "why1": "string", "why2": "string", "why3": "string", "why4": "string", "why5": "string",
  "fishbonePeople": "string", "fishboneProcess": "string", "fishbonePlant": "string",
  "fishbonePolicy": "string", "fishboneEnvironment": "string", "fishboneMeasurement": "string",
  "capaActions": [
    { "description": "string", "assignedTo": "string", "dueDate": "YYYY-MM-DD", "priority": "HIGH" }
  ]
}
```

**Auto-generated fields:**
- Reference number: `ENV-CAPA-YYYY-NNN`

#### Add CAPA Action
```http
POST /api/environment/capa/:id/actions
Authorization: Bearer <token>

{
  "description": "string (required)",
  "assignedTo": "string (required)",
  "dueDate": "YYYY-MM-DD (required)",
  "priority": "CRITICAL | HIGH | MEDIUM | LOW"
}
```

#### Update CAPA Action
```http
PUT /api/environment/capa/:id/actions/:actionId
Authorization: Bearer <token>

{
  "status": "OPEN | IN_PROGRESS | COMPLETED | VERIFIED | OVERDUE | CANCELLED"
}
```

Auto-sets `completedDate` when status changes to `COMPLETED`.

---

## Quality API (ISO 9001:2015)

All Quality endpoints are proxied: `GET /api/quality/*` → `api-quality:4003/api/*`

### COTO Log (Context of the Organisation)

#### Interested Parties
```http
GET /api/quality/parties
POST /api/quality/parties
GET /api/quality/parties/:id
PUT /api/quality/parties/:id
DELETE /api/quality/parties/:id
```

#### Issues
```http
GET /api/quality/issues
POST /api/quality/issues
GET /api/quality/issues/:id
PUT /api/quality/issues/:id
DELETE /api/quality/issues/:id
```

#### Risks
```http
GET /api/quality/risks
POST /api/quality/risks
GET /api/quality/risks/:id
PUT /api/quality/risks/:id
DELETE /api/quality/risks/:id
```

Query parameters: `search`, `status` (OPEN|BEING_TREATED|MONITORED|CLOSED|ACCEPTED), `riskLevel`, `process`

**Auto-generated fields:**
- Reference number: `QMS-RSK-YYYY-NNN`
- Risk scoring: Probability Rating × Consequence Rating → risk level

#### Opportunities
```http
GET /api/quality/opportunities
POST /api/quality/opportunities
GET /api/quality/opportunities/:id
PUT /api/quality/opportunities/:id
DELETE /api/quality/opportunities/:id
```

### Core QMS

#### Processes
```http
GET /api/quality/processes
POST /api/quality/processes
GET /api/quality/processes/:id
PUT /api/quality/processes/:id
DELETE /api/quality/processes/:id
```

Turtle diagram fields: inputs, outputs, resources, competence, activities, controls, KPIs.

#### Non-Conformances
```http
GET /api/quality/nonconformances
POST /api/quality/nonconformances
GET /api/quality/nonconformances/:id
PUT /api/quality/nonconformances/:id
DELETE /api/quality/nonconformances/:id
```

Query parameters: `search`, `status` (OPEN|CONTAINED|RCA_IN_PROGRESS|CORRECTIVE_ACTION|PREVENTIVE_ACTION|VERIFICATION|CLOSED), `ncType`, `severity`, `source`

#### Actions
```http
GET /api/quality/actions
POST /api/quality/actions
GET /api/quality/actions/:id
PUT /api/quality/actions/:id
DELETE /api/quality/actions/:id
```

#### Documents
```http
GET /api/quality/documents
POST /api/quality/documents
GET /api/quality/documents/:id
PUT /api/quality/documents/:id
DELETE /api/quality/documents/:id
```

#### CAPA
```http
GET /api/quality/capa
POST /api/quality/capa
GET /api/quality/capa/:id
PUT /api/quality/capa/:id
DELETE /api/quality/capa/:id
POST /api/quality/capa/:id/actions
PUT /api/quality/capa/:id/actions/:actionId
DELETE /api/quality/capa/:id/actions/:actionId
```

Supports 5-Why, Fishbone (6M), and 8D (d0-d8) root cause analysis methods.

### Module Routes

#### Legal Register
```http
GET /api/quality/legal
POST /api/quality/legal
GET /api/quality/legal/:id
PUT /api/quality/legal/:id
DELETE /api/quality/legal/:id
```

#### FMEA
```http
GET /api/quality/fmea
POST /api/quality/fmea
GET /api/quality/fmea/:id
PUT /api/quality/fmea/:id
DELETE /api/quality/fmea/:id
POST /api/quality/fmea/:id/rows
PUT /api/quality/fmea/:id/rows/:rowId
DELETE /api/quality/fmea/:id/rows/:rowId
```

RPN calculation: Severity × Occurrence × Detection. Color-coded: green <80, amber 80-200, red >200.

#### Continual Improvement
```http
GET /api/quality/improvements
POST /api/quality/improvements
GET /api/quality/improvements/:id
PUT /api/quality/improvements/:id
DELETE /api/quality/improvements/:id
```

PDCA stage tracking (Plan/Do/Check/Act).

#### Supplier Quality
```http
GET /api/quality/suppliers
POST /api/quality/suppliers
GET /api/quality/suppliers/:id
PUT /api/quality/suppliers/:id
DELETE /api/quality/suppliers/:id
```

IMS Score calculation: Quality 50% + H&S 30% + Environmental 20%.

#### Change Management
```http
GET /api/quality/changes
POST /api/quality/changes
GET /api/quality/changes/:id
PUT /api/quality/changes/:id
DELETE /api/quality/changes/:id
```

Impact assessment grid: quality, customer, process, H&S, environmental, regulatory, financial.

#### Objectives
```http
GET /api/quality/objectives
POST /api/quality/objectives
GET /api/quality/objectives/:id
PUT /api/quality/objectives/:id
DELETE /api/quality/objectives/:id
POST /api/quality/objectives/:id/milestones
PUT /api/quality/objectives/:id/milestones/:milestoneId
DELETE /api/quality/objectives/:id/milestones/:milestoneId
```

KPI tracking with baseline/current/target values and nested milestones.

---

## Automotive API (IATF 16949)

All Automotive endpoints are proxied: `/api/automotive/*` → `api-automotive:4010/api/*`

### Routes
```http
GET|POST       /api/automotive/apqp
GET|PUT|DELETE  /api/automotive/apqp/:id

GET|POST       /api/automotive/ppap
GET|PUT|DELETE  /api/automotive/ppap/:id

GET|POST       /api/automotive/fmea
GET|PUT|DELETE  /api/automotive/fmea/:id

GET|POST       /api/automotive/control-plans
GET|PUT|DELETE  /api/automotive/control-plans/:id

GET|POST       /api/automotive/msa
GET|PUT|DELETE  /api/automotive/msa/:id

GET|POST       /api/automotive/spc
GET|PUT|DELETE  /api/automotive/spc/:id

GET|POST       /api/automotive/lpa
GET|PUT|DELETE  /api/automotive/lpa/:id

GET|POST       /api/automotive/csr
GET|PUT|DELETE  /api/automotive/csr/:id
```

---

## Medical API (ISO 13485)

All Medical endpoints are proxied: `/api/medical/*` → `api-medical:4011/api/*`

### Routes
```http
GET|POST       /api/medical/dhf
GET|PUT|DELETE  /api/medical/dhf/:id

GET|POST       /api/medical/dmr
GET|PUT|DELETE  /api/medical/dmr/:id

GET|POST       /api/medical/dhr
GET|PUT|DELETE  /api/medical/dhr/:id

GET|POST       /api/medical/complaints
GET|PUT|DELETE  /api/medical/complaints/:id

GET|POST       /api/medical/pms
GET|PUT|DELETE  /api/medical/pms/:id

GET|POST       /api/medical/risk-management
GET|PUT|DELETE  /api/medical/risk-management/:id

GET|POST       /api/medical/udi
GET|PUT|DELETE  /api/medical/udi/:id

GET|POST       /api/medical/software-validation
GET|PUT|DELETE  /api/medical/software-validation/:id
```

---

## Aerospace API (AS9100D)

All Aerospace endpoints are proxied: `/api/aerospace/*` → `api-aerospace:4012/api/*`

### Routes
```http
GET|POST       /api/aerospace/fai
GET|PUT|DELETE  /api/aerospace/fai/:id

GET|POST       /api/aerospace/configuration
GET|PUT|DELETE  /api/aerospace/configuration/:id

GET|POST       /api/aerospace/work-orders
GET|PUT|DELETE  /api/aerospace/work-orders/:id

GET|POST       /api/aerospace/human-factors
GET|PUT|DELETE  /api/aerospace/human-factors/:id

GET|POST       /api/aerospace/oasis
GET|PUT|DELETE  /api/aerospace/oasis/:id
```

---

## Project Management API (PMBOK/ISO 21502)

All PM endpoints are proxied: `GET /api/v1/project-management/*` → `api-project-management:4009/api/*`

### Projects
```http
GET /api/v1/project-management/projects
POST /api/v1/project-management/projects
GET /api/v1/project-management/projects/:id
PUT /api/v1/project-management/projects/:id
DELETE /api/v1/project-management/projects/:id
GET /api/v1/project-management/projects/stats
```

Query parameters: `search`, `status` (PLANNING|ACTIVE|ON_HOLD|COMPLETED|CANCELLED), `priority`, `methodology` (WATERFALL|AGILE|HYBRID)

### Tasks
```http
GET /api/v1/project-management/tasks
POST /api/v1/project-management/tasks
GET /api/v1/project-management/tasks/:id
PUT /api/v1/project-management/tasks/:id
DELETE /api/v1/project-management/tasks/:id
```

Query parameters: `search`, `status`, `priority`, `projectId`, `assigneeId`

### Milestones
```http
GET /api/v1/project-management/milestones
POST /api/v1/project-management/milestones
GET /api/v1/project-management/milestones/:id
PUT /api/v1/project-management/milestones/:id
DELETE /api/v1/project-management/milestones/:id
```

### Risks
```http
GET /api/v1/project-management/risks
POST /api/v1/project-management/risks
GET /api/v1/project-management/risks/:id
PUT /api/v1/project-management/risks/:id
DELETE /api/v1/project-management/risks/:id
```

Risk score: Probability × Impact (auto-calculated).

### Issues
```http
GET /api/v1/project-management/issues
POST /api/v1/project-management/issues
GET /api/v1/project-management/issues/:id
PUT /api/v1/project-management/issues/:id
DELETE /api/v1/project-management/issues/:id
```

### Changes
```http
GET /api/v1/project-management/changes
POST /api/v1/project-management/changes
GET /api/v1/project-management/changes/:id
PUT /api/v1/project-management/changes/:id
DELETE /api/v1/project-management/changes/:id
```

### Resources
```http
GET /api/v1/project-management/resources
POST /api/v1/project-management/resources
GET /api/v1/project-management/resources/:id
PUT /api/v1/project-management/resources/:id
DELETE /api/v1/project-management/resources/:id
```

### Stakeholders
```http
GET /api/v1/project-management/stakeholders
POST /api/v1/project-management/stakeholders
GET /api/v1/project-management/stakeholders/:id
PUT /api/v1/project-management/stakeholders/:id
DELETE /api/v1/project-management/stakeholders/:id
```

Power/Interest matrix: auto-categorized (MANAGE_CLOSELY|KEEP_SATISFIED|KEEP_INFORMED|MONITOR).

### Documents
```http
GET /api/v1/project-management/documents
POST /api/v1/project-management/documents
GET /api/v1/project-management/documents/:id
PUT /api/v1/project-management/documents/:id
DELETE /api/v1/project-management/documents/:id
```

### Sprints
```http
GET /api/v1/project-management/sprints
POST /api/v1/project-management/sprints
GET /api/v1/project-management/sprints/:id
PUT /api/v1/project-management/sprints/:id
DELETE /api/v1/project-management/sprints/:id
```

### Timesheets
```http
GET /api/v1/project-management/timesheets
POST /api/v1/project-management/timesheets
GET /api/v1/project-management/timesheets/:id
PUT /api/v1/project-management/timesheets/:id
DELETE /api/v1/project-management/timesheets/:id
```

Cost auto-calculated: `hours × costRate`.

### Reports
```http
GET /api/v1/project-management/reports
POST /api/v1/project-management/reports
GET /api/v1/project-management/reports/:id
PUT /api/v1/project-management/reports/:id
DELETE /api/v1/project-management/reports/:id
```

---

## Finance API

All Finance endpoints are proxied: `/api/finance/*` → `api-finance:4013/api/*`

### Routes
```http
GET|POST       /api/finance/accounts
GET|PUT|DELETE  /api/finance/accounts/:id

GET|POST       /api/finance/transactions
GET|PUT|DELETE  /api/finance/transactions/:id

GET|POST       /api/finance/budgets
GET|PUT|DELETE  /api/finance/budgets/:id

GET|POST       /api/finance/invoices
GET|PUT|DELETE  /api/finance/invoices/:id

GET|POST       /api/finance/journal-entries
GET|PUT|DELETE  /api/finance/journal-entries/:id

GET|POST       /api/finance/reports
GET|PUT|DELETE  /api/finance/reports/:id

GET|POST       /api/finance/tax
GET|PUT|DELETE  /api/finance/tax/:id
```

---

## CRM API

All CRM endpoints are proxied: `/api/crm/*` → `api-crm:4014/api/*`

### Routes
```http
GET|POST       /api/crm/contacts
GET|PUT|DELETE  /api/crm/contacts/:id

GET|POST       /api/crm/companies
GET|PUT|DELETE  /api/crm/companies/:id

GET|POST       /api/crm/opportunities
GET|PUT|DELETE  /api/crm/opportunities/:id

GET|POST       /api/crm/activities
GET|PUT|DELETE  /api/crm/activities/:id

GET|POST       /api/crm/campaigns
GET|PUT|DELETE  /api/crm/campaigns/:id

GET|POST       /api/crm/deals
GET|PUT|DELETE  /api/crm/deals/:id

GET|POST       /api/crm/pipelines
GET|PUT|DELETE  /api/crm/pipelines/:id

GET|POST       /api/crm/tasks
GET|PUT|DELETE  /api/crm/tasks/:id
```

---

## InfoSec API (ISO 27001)

All InfoSec endpoints are proxied: `/api/infosec/*` → `api-infosec:4015/api/*`

### Routes
```http
GET|POST       /api/infosec/controls
GET|PUT|DELETE  /api/infosec/controls/:id

GET|POST       /api/infosec/risks
GET|PUT|DELETE  /api/infosec/risks/:id

GET|POST       /api/infosec/incidents
GET|PUT|DELETE  /api/infosec/incidents/:id

GET|POST       /api/infosec/assets
GET|PUT|DELETE  /api/infosec/assets/:id

GET|POST       /api/infosec/policies
GET|PUT|DELETE  /api/infosec/policies/:id

GET|POST       /api/infosec/audits
GET|PUT|DELETE  /api/infosec/audits/:id

GET|POST       /api/infosec/vulnerabilities
GET|PUT|DELETE  /api/infosec/vulnerabilities/:id
```

---

## ESG API

All ESG endpoints are proxied: `/api/esg/*` → `api-esg:4016/api/*`

### Routes
```http
GET|POST       /api/esg/environmental-metrics
GET|PUT|DELETE  /api/esg/environmental-metrics/:id

GET|POST       /api/esg/social-metrics
GET|PUT|DELETE  /api/esg/social-metrics/:id

GET|POST       /api/esg/governance-metrics
GET|PUT|DELETE  /api/esg/governance-metrics/:id

GET|POST       /api/esg/reports
GET|PUT|DELETE  /api/esg/reports/:id

GET|POST       /api/esg/goals
GET|PUT|DELETE  /api/esg/goals/:id

GET|POST       /api/esg/frameworks
GET|PUT|DELETE  /api/esg/frameworks/:id

GET|POST       /api/esg/materiality
GET|PUT|DELETE  /api/esg/materiality/:id

GET|POST       /api/esg/disclosures
GET|PUT|DELETE  /api/esg/disclosures/:id

GET|POST       /api/esg/benchmarks
GET|PUT|DELETE  /api/esg/benchmarks/:id

GET|POST       /api/esg/initiatives
GET|PUT|DELETE  /api/esg/initiatives/:id

GET|POST       /api/esg/stakeholder-engagement
GET|PUT|DELETE  /api/esg/stakeholder-engagement/:id

GET|POST       /api/esg/supply-chain
GET|PUT|DELETE  /api/esg/supply-chain/:id

GET|POST       /api/esg/certifications
GET|PUT|DELETE  /api/esg/certifications/:id

GET|POST       /api/esg/training
GET|PUT|DELETE  /api/esg/training/:id
```

---

## CMMS API

All CMMS endpoints are proxied: `/api/cmms/*` → `api-cmms:4017/api/*`

### Routes
```http
GET|POST       /api/cmms/work-orders
GET|PUT|DELETE  /api/cmms/work-orders/:id

GET|POST       /api/cmms/assets
GET|PUT|DELETE  /api/cmms/assets/:id

GET|POST       /api/cmms/preventive-maintenance
GET|PUT|DELETE  /api/cmms/preventive-maintenance/:id

GET|POST       /api/cmms/parts
GET|PUT|DELETE  /api/cmms/parts/:id

GET|POST       /api/cmms/locations
GET|PUT|DELETE  /api/cmms/locations/:id

GET|POST       /api/cmms/meters
GET|PUT|DELETE  /api/cmms/meters/:id

GET|POST       /api/cmms/failures
GET|PUT|DELETE  /api/cmms/failures/:id

GET|POST       /api/cmms/vendors
GET|PUT|DELETE  /api/cmms/vendors/:id

GET|POST       /api/cmms/schedules
GET|PUT|DELETE  /api/cmms/schedules/:id

GET|POST       /api/cmms/checklists
GET|PUT|DELETE  /api/cmms/checklists/:id

GET|POST       /api/cmms/downtime
GET|PUT|DELETE  /api/cmms/downtime/:id

GET|POST       /api/cmms/labor
GET|PUT|DELETE  /api/cmms/labor/:id
```

---

## Portal API

All Portal endpoints are proxied: `/api/portal/*` → `api-portal:4018/api/*`

### Routes
```http
GET|POST       /api/portal/portal-users
GET|PUT|DELETE  /api/portal/portal-users/:id

GET|POST       /api/portal/documents
GET|PUT|DELETE  /api/portal/documents/:id

GET|POST       /api/portal/messages
GET|PUT|DELETE  /api/portal/messages/:id

GET|POST       /api/portal/orders
GET|PUT|DELETE  /api/portal/orders/:id

GET|POST       /api/portal/invoices
GET|PUT|DELETE  /api/portal/invoices/:id

GET|POST       /api/portal/tickets
GET|PUT|DELETE  /api/portal/tickets/:id

GET|POST       /api/portal/reviews
GET|PUT|DELETE  /api/portal/reviews/:id

GET|POST       /api/portal/certifications
GET|PUT|DELETE  /api/portal/certifications/:id

GET|POST       /api/portal/audits
GET|PUT|DELETE  /api/portal/audits/:id

GET|POST       /api/portal/ncrs
GET|PUT|DELETE  /api/portal/ncrs/:id

GET|POST       /api/portal/corrective-actions
GET|PUT|DELETE  /api/portal/corrective-actions/:id

GET|POST       /api/portal/performance
GET|PUT|DELETE  /api/portal/performance/:id

GET|POST       /api/portal/notifications
GET|PUT|DELETE  /api/portal/notifications/:id

GET|POST       /api/portal/announcements
GET|PUT|DELETE  /api/portal/announcements/:id

GET|POST       /api/portal/training
GET|PUT|DELETE  /api/portal/training/:id

GET|POST       /api/portal/self-service
GET|PUT|DELETE  /api/portal/self-service/:id
```

---

## Food Safety API (HACCP/ISO 22000)

All Food Safety endpoints are proxied: `/api/food-safety/*` → `api-food-safety:4019/api/*`

### Routes
```http
GET|POST       /api/food-safety/haccp-plans
GET|PUT|DELETE  /api/food-safety/haccp-plans/:id

GET|POST       /api/food-safety/hazard-analyses
GET|PUT|DELETE  /api/food-safety/hazard-analyses/:id

GET|POST       /api/food-safety/critical-control-points
GET|PUT|DELETE  /api/food-safety/critical-control-points/:id

GET|POST       /api/food-safety/monitoring
GET|PUT|DELETE  /api/food-safety/monitoring/:id

GET|POST       /api/food-safety/corrective-actions
GET|PUT|DELETE  /api/food-safety/corrective-actions/:id

GET|POST       /api/food-safety/verification
GET|PUT|DELETE  /api/food-safety/verification/:id

GET|POST       /api/food-safety/validation
GET|PUT|DELETE  /api/food-safety/validation/:id

GET|POST       /api/food-safety/prerequisites
GET|PUT|DELETE  /api/food-safety/prerequisites/:id

GET|POST       /api/food-safety/allergens
GET|PUT|DELETE  /api/food-safety/allergens/:id

GET|POST       /api/food-safety/recalls
GET|PUT|DELETE  /api/food-safety/recalls/:id

GET|POST       /api/food-safety/supplier-approval
GET|PUT|DELETE  /api/food-safety/supplier-approval/:id

GET|POST       /api/food-safety/audits
GET|PUT|DELETE  /api/food-safety/audits/:id

GET|POST       /api/food-safety/training
GET|PUT|DELETE  /api/food-safety/training/:id

GET|POST       /api/food-safety/documents
GET|PUT|DELETE  /api/food-safety/documents/:id
```

---

## Energy API (ISO 50001)

All Energy endpoints are proxied: `/api/energy/*` → `api-energy:4020/api/*`

### Routes
```http
GET|POST       /api/energy/baselines
GET|PUT|DELETE  /api/energy/baselines/:id

GET|POST       /api/energy/targets
GET|PUT|DELETE  /api/energy/targets/:id

GET|POST       /api/energy/meters
GET|PUT|DELETE  /api/energy/meters/:id

GET|POST       /api/energy/consumption
GET|PUT|DELETE  /api/energy/consumption/:id

GET|POST       /api/energy/audits
GET|PUT|DELETE  /api/energy/audits/:id

GET|POST       /api/energy/opportunities
GET|PUT|DELETE  /api/energy/opportunities/:id

GET|POST       /api/energy/action-plans
GET|PUT|DELETE  /api/energy/action-plans/:id

GET|POST       /api/energy/monitoring
GET|PUT|DELETE  /api/energy/monitoring/:id

GET|POST       /api/energy/reports
GET|PUT|DELETE  /api/energy/reports/:id

GET|POST       /api/energy/regulations
GET|PUT|DELETE  /api/energy/regulations/:id

GET|POST       /api/energy/training
GET|PUT|DELETE  /api/energy/training/:id

GET|POST       /api/energy/reviews
GET|PUT|DELETE  /api/energy/reviews/:id
```

---

## Analytics API

All Analytics endpoints are proxied: `/api/analytics/*` → `api-analytics:4021/api/*`

### Routes
```http
GET|POST       /api/analytics/dashboards
GET|PUT|DELETE  /api/analytics/dashboards/:id

GET|POST       /api/analytics/reports
GET|PUT|DELETE  /api/analytics/reports/:id

GET|POST       /api/analytics/datasets
GET|PUT|DELETE  /api/analytics/datasets/:id

GET|POST       /api/analytics/widgets
GET|PUT|DELETE  /api/analytics/widgets/:id

GET|POST       /api/analytics/queries
GET|PUT|DELETE  /api/analytics/queries/:id

GET|POST       /api/analytics/exports
GET|PUT|DELETE  /api/analytics/exports/:id

GET|POST       /api/analytics/schedules
GET|PUT|DELETE  /api/analytics/schedules/:id

GET|POST       /api/analytics/alerts
GET|PUT|DELETE  /api/analytics/alerts/:id

GET|POST       /api/analytics/benchmarks
GET|PUT|DELETE  /api/analytics/benchmarks/:id
```

---

## Field Service API

All Field Service endpoints are proxied: `/api/field-service/*` → `api-field-service:4022/api/*`

### Routes
```http
GET|POST       /api/field-service/work-orders
GET|PUT|DELETE  /api/field-service/work-orders/:id

GET|POST       /api/field-service/dispatch
GET|PUT|DELETE  /api/field-service/dispatch/:id

GET|POST       /api/field-service/technicians
GET|PUT|DELETE  /api/field-service/technicians/:id

GET|POST       /api/field-service/schedules
GET|PUT|DELETE  /api/field-service/schedules/:id

GET|POST       /api/field-service/parts
GET|PUT|DELETE  /api/field-service/parts/:id

GET|POST       /api/field-service/customers
GET|PUT|DELETE  /api/field-service/customers/:id

GET|POST       /api/field-service/invoices
GET|PUT|DELETE  /api/field-service/invoices/:id

GET|POST       /api/field-service/routes
GET|PUT|DELETE  /api/field-service/routes/:id

GET|POST       /api/field-service/inspections
GET|PUT|DELETE  /api/field-service/inspections/:id

GET|POST       /api/field-service/equipment
GET|PUT|DELETE  /api/field-service/equipment/:id

GET|POST       /api/field-service/timesheets
GET|PUT|DELETE  /api/field-service/timesheets/:id

GET|POST       /api/field-service/reports
GET|PUT|DELETE  /api/field-service/reports/:id

GET|POST       /api/field-service/sla
GET|PUT|DELETE  /api/field-service/sla/:id
```

---

## ISO 42001 API (AI Management)

All ISO 42001 endpoints are proxied: `/api/iso42001/*` → `api-iso42001:4023/api/*`

### Routes
```http
GET|POST       /api/iso42001/ai-systems
GET|PUT|DELETE  /api/iso42001/ai-systems/:id

GET|POST       /api/iso42001/risk-assessments
GET|PUT|DELETE  /api/iso42001/risk-assessments/:id

GET|POST       /api/iso42001/impact-assessments
GET|PUT|DELETE  /api/iso42001/impact-assessments/:id

GET|POST       /api/iso42001/controls
GET|PUT|DELETE  /api/iso42001/controls/:id

GET|POST       /api/iso42001/policies
GET|PUT|DELETE  /api/iso42001/policies/:id

GET|POST       /api/iso42001/audits
GET|PUT|DELETE  /api/iso42001/audits/:id

GET|POST       /api/iso42001/training
GET|PUT|DELETE  /api/iso42001/training/:id
```

---

## ISO 37001 API (Anti-Bribery)

All ISO 37001 endpoints are proxied: `/api/iso37001/*` → `api-iso37001:4024/api/*`

### Routes
```http
GET|POST       /api/iso37001/risk-assessments
GET|PUT|DELETE  /api/iso37001/risk-assessments/:id

GET|POST       /api/iso37001/due-diligence
GET|PUT|DELETE  /api/iso37001/due-diligence/:id

GET|POST       /api/iso37001/gifts-hospitality
GET|PUT|DELETE  /api/iso37001/gifts-hospitality/:id

GET|POST       /api/iso37001/policies
GET|PUT|DELETE  /api/iso37001/policies/:id

GET|POST       /api/iso37001/training
GET|PUT|DELETE  /api/iso37001/training/:id

GET|POST       /api/iso37001/whistleblowing
GET|PUT|DELETE  /api/iso37001/whistleblowing/:id
```

---

## Risk Management API (ISO 31000:2018)

Enterprise Risk Management service on port 4027. Gateway prefix: `/api/risk/*`

### Risks (Register)
```http
GET    /api/risk/risks                    # List risks (filter: ?category=, ?search=, ?status=, ?level=)
POST   /api/risk/risks                    # Create risk (auto-calculates scores, checks appetite)
GET    /api/risk/risks/register            # Full register with pagination & relations
GET    /api/risk/risks/heatmap             # 5×5 heatmap data (25 cells with risk counts)
GET    /api/risk/risks/overdue-review      # Risks with overdue reviews
GET    /api/risk/risks/exceeds-appetite    # Risks exceeding appetite thresholds
GET    /api/risk/risks/by-category         # Category breakdown with counts
GET    /api/risk/risks/aggregate           # Aggregate by category/status/level (?groupBy=)
GET    /api/risk/risks/:id                 # Get risk with controls, KRIs, actions, reviews, bowtie
PUT    /api/risk/risks/:id                 # Update risk (auto-recalculates scores)
DELETE /api/risk/risks/:id                 # Soft delete

POST   /api/risk/risks/from-coshh/:coshhId     # Create risk from COSHH assessment
POST   /api/risk/risks/from-fra/:fraId         # Create risk from Fire Risk Assessment
POST   /api/risk/risks/from-incident/:id       # Create risk from H&S incident
POST   /api/risk/risks/from-audit/:id          # Create risk from audit finding
```

### Controls
```http
GET    /api/risk/risks/:riskId/controls          # List controls for a risk
POST   /api/risk/risks/:riskId/controls          # Add control (auto-updates overall effectiveness)
PUT    /api/risk/risks/:riskId/controls/:id      # Update control
DELETE /api/risk/risks/:riskId/controls/:id      # Remove control
POST   /api/risk/risks/:riskId/controls/:id/test # Record control test result
```

### Key Risk Indicators (KRIs)
```http
GET    /api/risk/risks/:riskId/kri               # List KRIs for a risk
POST   /api/risk/risks/:riskId/kri               # Create KRI with thresholds
PUT    /api/risk/risks/:riskId/kri/:id           # Update KRI
DELETE /api/risk/risks/:riskId/kri/:id           # Remove KRI
POST   /api/risk/risks/:riskId/kri/:id/reading   # Record KRI reading (auto-evaluates status)
GET    /api/risk/risks/kri/breaches              # All KRIs in AMBER/RED status
GET    /api/risk/risks/kri/due                   # KRIs due for reading (next 7 days)
```

### Treatment Actions
```http
GET    /api/risk/risks/:riskId/actions           # List actions for a risk
POST   /api/risk/risks/:riskId/actions           # Create treatment action
PUT    /api/risk/risks/:riskId/actions/:id       # Update action
POST   /api/risk/risks/:riskId/actions/:id/complete  # Complete with evidence
GET    /api/risk/risks/actions/overdue           # All overdue actions
GET    /api/risk/risks/actions/due-soon          # Actions due within 14 days
```

### Bow-Tie Analysis
```http
GET    /api/risk/risks/:riskId/bowtie            # Get bow-tie for a risk
POST   /api/risk/risks/:riskId/bowtie            # Create/update bow-tie (HIGH+ risks only)
GET    /api/risk/risks/bowtie/all                # Library of all bow-ties
```

### Risk Appetite & Framework
```http
GET    /api/risk/risks/appetite                  # List appetite statements (all categories)
POST   /api/risk/risks/appetite                  # Upsert appetite for category
GET    /api/risk/risks/framework                 # Get organisation risk framework
PUT    /api/risk/risks/framework                 # Create/update framework config
```

### Analytics
```http
GET    /api/risk/risks/analytics/dashboard       # Full analytics (heatmap, KPIs, by-category, by-level, top risks, module breakdown)
GET    /api/risk/risks/analytics/by-module       # Risk count per source module
```

### Dashboard
```http
GET    /api/risk/dashboard/stats                 # 12 KPI metrics (totalRisks, criticalRisks, exceedsAppetite, overdueReviews, overdueActions, kriBreaches, kriWarnings, newThisMonth, openCapas, pendingReviews, avgRiskScore, totalCapas)
```

### Risk Scoring (5×5 Matrix)
| Score Range | Level | Colour |
|-------------|-------|--------|
| 1-3 | LOW | Green |
| 4-6 | MEDIUM | Yellow |
| 8-12 | HIGH | Amber |
| 15-19 | VERY_HIGH | Orange |
| 20-25 | CRITICAL | Red |

### Appetite Status
| Status | Meaning |
|--------|---------|
| WITHIN | Residual score ≤ acceptable residual score |
| AT_LIMIT | Residual score > acceptable but ≤ maximum tolerable |
| EXCEEDS | Residual score > maximum tolerable — mandatory escalation |

---

## AI Analysis Endpoints

AI analysis is provided by the central AI Analysis service (port 4004). Supports Claude, OpenAI, and Grok providers.

### Risk Controls Generation
```http
POST /api/risks/generate-controls
Content-Type: application/json

{
  "riskTitle": "string",
  "riskCategory": "string",
  "likelihood": 1-5,
  "severity": 1-5,
  "existingControls": "string"
}
```

**Response:**
```json
{
  "controls": {
    "elimination": "...",
    "substitution": "...",
    "engineering": "...",
    "administrative": "...",
    "ppe": "..."
  }
}
```

### Incident Root Cause Analysis
```http
POST /api/incidents/analyse
Content-Type: application/json

{
  "incidentType": "string",
  "severity": "string",
  "description": "string",
  "location": "string",
  "injuryType": "string"
}
```

**Response:**
```json
{
  "immediateCause": "...",
  "underlyingCause": "...",
  "rootCause": "...",
  "contributingFactors": "...",
  "recurrencePrevention": "..."
}
```

### Legal Compliance Assessment
```http
POST /api/legal/analyse
Content-Type: application/json

{
  "requirementTitle": "string",
  "referenceNumber": "string",
  "category": "string",
  "jurisdiction": "string"
}
```

**Response:**
```json
{
  "keyObligations": "...",
  "gapAnalysis": "...",
  "requiredActions": "...",
  "evidenceRequired": "...",
  "penaltyForNonCompliance": "..."
}
```

### Objective SMART Assist
```http
POST /api/objectives/assist
Content-Type: application/json

{
  "objectiveTitle": "string",
  "category": "string",
  "department": "string",
  "targetDate": "string"
}
```

**Response:**
```json
{
  "objectiveStatement": "...",
  "ohsPolicyLink": "...",
  "kpiDescription": "...",
  "resourcesRequired": "...",
  "suggestedMilestones": [
    { "title": "...", "dueDate": "YYYY-MM-DD" }
  ]
}
```

### CAPA Root Cause Analysis
```http
POST /api/capa/analyse
Content-Type: application/json

{
  "capaType": "string",
  "source": "string",
  "priority": "string",
  "problemStatement": "string"
}
```

**Response:**
```json
{
  "rootCauseAnalysis": "...",
  "containmentActions": "...",
  "correctiveActions": ["..."],
  "preventiveActions": ["..."],
  "successCriteria": "...",
  "verificationMethod": "..."
}
```

### AI Quick Analysis (Central Service)
```http
POST /api/ai/analyze
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "ANALYSIS_TYPE",
  "context": { ... }
}
```

**Available Analysis Types (23):**

| Type | Category | Description |
|------|----------|-------------|
| `LEGAL_REFERENCES` | H&S | Legal compliance lookup |
| `ENVIRONMENTAL_ASPECT` | Environment | Aspect analysis |
| `HR_JOB_DESCRIPTION` | HR | Generate job descriptions |
| `HR_PERFORMANCE_INSIGHTS` | HR | Performance review insights |
| `HR_LEAVE_ANALYSIS` | HR | Leave pattern analysis |
| `HR_EMPLOYEE_ONBOARDING` | HR | Onboarding checklist generation |
| `HR_CERTIFICATION_MONITOR` | HR | Certification tracking |
| `PAYROLL_VALIDATION` | Payroll | Validate payroll run calculations |
| `SALARY_BENCHMARK` | Payroll | Salary benchmarking suggestions |
| `EXPENSE_VALIDATION` | Payroll | Expense policy compliance |
| `LOAN_CALCULATOR` | Payroll | Loan repayment schedule |
| `PAYSLIP_ANOMALY` | Payroll | Payslip anomaly detection |
| `PROJECT_CHARTER` | PM | Generate project charter |
| `WBS_GENERATION` | PM | Work breakdown structure |
| `CRITICAL_PATH` | PM | Critical path analysis |
| `THREE_POINT_ESTIMATION` | PM | PERT estimation |
| `RESOURCE_LEVELING` | PM | Resource optimization |
| `PROJECT_RISK_ANALYSIS` | PM | Risk analysis |
| `EVM_ANALYSIS` | PM | Earned value management |
| `STAKEHOLDER_STRATEGY` | PM | Stakeholder engagement strategy |
| `PROJECT_HEALTH_CHECK` | PM | Overall health assessment |
| `SPRINT_PLANNING` | PM | Sprint planning assistance |
| `LESSONS_LEARNED` | PM | Lessons learned analysis |

---

## Gateway Endpoints

### Dashboard
```http
GET /api/dashboard/stats          # Aggregated dashboard statistics
GET /api/dashboard/compliance     # Compliance scores across modules
```

### CSRF Token
```http
GET /api/csrf-token               # Get CSRF token (double-submit cookie)
```

### Users
```http
GET /api/users                    # List users (admin only)
GET /api/users/:id                # Get user
POST /api/users                   # Create user
PATCH /api/users/:id              # Update user
DELETE /api/users/:id             # Delete user
```

### Sessions
```http
GET /api/sessions                 # List active sessions
DELETE /api/sessions/:id          # Revoke session
```

### Notifications (WebSocket)
```http
GET /api/notifications            # List notifications for current user
POST /api/notifications           # Create notification
PATCH /api/notifications/:id/read # Mark notification as read
PATCH /api/notifications/read-all # Mark all as read
DELETE /api/notifications/:id     # Delete notification
```

WebSocket endpoint: `ws://localhost:4000/ws` (authenticated via token query param)

### Roles & Access Log
```http
GET /api/roles                    # List all roles
POST /api/roles                   # Create role
GET /api/roles/:id                # Get role by ID
PUT /api/roles/:id                # Update role
DELETE /api/roles/:id             # Delete role
GET /api/roles/:id/permissions    # Get role permissions
PUT /api/roles/:id/permissions    # Update role permissions
GET /api/access-log               # View access audit log
```

### Organisations (MSP Mode)
```http
GET /api/organisations/msp-tenants      # List MSP tenants
POST /api/organisations/msp-tenants     # Create tenant
GET /api/organisations/msp-tenants/:id  # Get tenant
PUT /api/organisations/msp-tenants/:id  # Update tenant
DELETE /api/organisations/msp-tenants/:id # Delete tenant
GET /api/organisations/msp-dashboard    # MSP dashboard stats
```

### Compliance (Regulatory Feed)
```http
GET /api/compliance/regulations         # List regulations (with filters)
POST /api/compliance/regulations        # Create regulation
GET /api/compliance/regulations/:id     # Get regulation
PUT /api/compliance/regulations/:id     # Update regulation
DELETE /api/compliance/regulations/:id  # Delete regulation
```

Query parameters: `search`, `jurisdiction`, `standard`, `status`

---

## Health Checks

Every service exposes a health check endpoint:
```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "api-health-safety",
  "uptime": 12345,
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

| Service | URL |
|---------|-----|
| Gateway | `http://localhost:4000/health` |
| Health & Safety | `http://localhost:4001/health` |
| Environment | `http://localhost:4002/health` |
| Quality | `http://localhost:4003/health` |
| AI Analysis | `http://localhost:4004/health` |
| Inventory | `http://localhost:4005/health` |
| HR | `http://localhost:4006/health` |
| Payroll | `http://localhost:4007/health` |
| Workflows | `http://localhost:4008/health` |
| Project Management | `http://localhost:4009/health` |
| Automotive | `http://localhost:4010/health` |
| Medical | `http://localhost:4011/health` |
| Aerospace | `http://localhost:4012/health` |
| Finance | `http://localhost:4013/health` |
| CRM | `http://localhost:4014/health` |
| InfoSec | `http://localhost:4015/health` |
| ESG | `http://localhost:4016/health` |
| CMMS | `http://localhost:4017/health` |
| Portal | `http://localhost:4018/health` |
| Food Safety | `http://localhost:4019/health` |
| Energy | `http://localhost:4020/health` |
| Analytics | `http://localhost:4021/health` |
| Field Service | `http://localhost:4022/health` |
| ISO 42001 | `http://localhost:4023/health` |
| ISO 37001 | `http://localhost:4024/health` |

---

## Verification Script

```bash
# Full system health check
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ims.local","password":"admin123"}' | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['accessToken'])")

for endpoint in risks incidents legal objectives capa; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:4000/api/health-safety/$endpoint \
    -H "Authorization: Bearer $TOKEN" \
    -H "Origin: http://localhost:3001")
  echo "$endpoint: $CODE"
done

# Environment endpoints
for endpoint in aspects events legal objectives actions capa; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:4000/api/environment/$endpoint \
    -H "Authorization: Bearer $TOKEN" \
    -H "Origin: http://localhost:3002")
  echo "environment/$endpoint: $CODE"
done

# Quality endpoints
for endpoint in parties issues risks opportunities processes nonconformances \
  actions documents capa legal fmea improvements suppliers changes objectives; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:4000/api/quality/$endpoint \
    -H "Authorization: Bearer $TOKEN" \
    -H "Origin: http://localhost:3003")
  echo "quality/$endpoint: $CODE"
done

# Project Management endpoints
for endpoint in projects tasks milestones risks issues changes resources stakeholders documents sprints timesheets reports; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:4000/api/v1/project-management/$endpoint \
    -H "Authorization: Bearer $TOKEN" \
    -H "Origin: http://localhost:3009")
  echo "project-management/$endpoint: $CODE"
done

# CORS verification
curl -s -I http://localhost:4000/api/health-safety/incidents \
  -H "Origin: http://localhost:3001" | grep "Access-Control-Allow-Origin"
# Expected: Access-Control-Allow-Origin: http://localhost:3001
```

## New AI Endpoints (via gateway → api-ai-analysis:4004)

### Document Analysis
```http
POST /api/ai/documents/analyze
Content-Type: application/json

{
  "content": "string (up to 50,000 chars)",
  "analysisType": "SUMMARIZE | EXTRACT_KEY_TERMS | CLASSIFY | FULL_ANALYSIS"
}
```
Returns summary, key terms, classification, ISO standard relevance, and recommendations.

### Compliance Gap Analysis
```http
POST /api/ai/compliance/gap-analysis
Content-Type: application/json

{
  "standards": ["ISO 9001", "ISO 14001", "ISO 45001"],
  "currentEvidence": [
    { "clause": "4.1", "evidence": "Context analysis document exists", "status": "COMPLIANT" }
  ],
  "organisationContext": "Manufacturing company, 200 employees"
}
```
Returns per-standard scores, gaps with severity/recommendations, cross-standard synergies, and prioritized actions.

### Predictive Risk Scoring
```http
POST /api/ai/compliance/predictive-risk
Content-Type: application/json

{
  "historicalIncidents": [
    { "type": "Near miss", "severity": "MINOR", "date": "2025-12-01", "department": "Production", "rootCause": "Inadequate training" }
  ],
  "currentRisks": [{ "title": "Chemical exposure", "category": "HEALTH", "currentScore": 15 }],
  "timeframeMonths": 6
}
```
Returns predicted risks with probability/trend, seasonal patterns, and recommendations.

### Semantic Search
```http
POST /api/ai/compliance/search
Content-Type: application/json

{
  "query": "show me all overdue CAPA items related to chemical handling",
  "modules": ["quality", "chemicals"],
  "limit": 10
}
```
Returns interpreted search terms, relevant modules with endpoints, suggested filters, and related ISO clauses.

### AI Assistant (Welcome Discovery Wizard Q&A)
```http
POST /api/ai/assistant
Content-Type: application/json

{
  "question": "How do incidents connect to risk?",
  "context": "User is on wizard step 4 of 7"
}
```
Returns `{ answer, suggestedModules, relatedFeatures }`. Uses a 3-tier response strategy:
1. **FAQ lookup** — matches against hardcoded knowledge base (ISO standards, CAPA, modules, getting started)
2. **AI provider** — calls configured OpenAI/Anthropic/Grok provider with IMS system prompt and module knowledge
3. **Module KB fallback** — keyword-matches question against 33 module descriptions and returns relevant modules

## Marketplace Plugin API (gateway local routes)

### List Plugins
```http
GET /api/marketplace/plugins?category=INTEGRATION&search=slack&page=1&limit=20
```

### Register Plugin (admin only)
```http
POST /api/marketplace/plugins
Content-Type: application/json

{
  "name": "Slack Integration",
  "slug": "slack-integration",
  "description": "Send IMS notifications to Slack channels",
  "author": "IMS Team",
  "category": "COMMUNICATION",
  "permissions": ["notifications.read"],
  "webhookEvents": ["ncr.created", "audit.complete"]
}
```

### Install / Uninstall
```http
POST /api/marketplace/plugins/:id/install
DELETE /api/marketplace/plugins/:id/install
```

### Publish Version
```http
POST /api/marketplace/plugins/:id/versions
Content-Type: application/json

{
  "version": "1.0.0",
  "changelog": "Initial release",
  "manifest": { "name": "slack-integration", "entry": "index.js" }
}
```

### Register Webhook
```http
POST /api/marketplace/plugins/:id/webhooks
Content-Type: application/json

{
  "event": "ncr.created",
  "targetUrl": "https://hooks.slack.com/..."
}
```
Returns subscription with HMAC secret for payload verification.

---

## Inventory Management (Port 4005)

**Base path:** `/api/inventory`

| Route File | Endpoints |
|------------|-----------|
| `inventory.ts` | CRUD for inventory items |
| `products.ts` | Product catalogue management |
| `categories.ts` | Product categories |
| `warehouses.ts` | Warehouse/location management |
| `stock-levels.ts` | Real-time stock levels and alerts |
| `transactions.ts` | Stock movements (in/out/transfer) |
| `adjustments.ts` | Stock count adjustments |
| `suppliers.ts` | Inventory supplier links |
| `reports.ts` | Inventory reports and analytics |

---

## Human Resources (Port 4006)

**Base path:** `/api/hr`

| Route File | Endpoints |
|------------|-----------|
| `employees.ts` | Employee CRUD, profiles, status management |
| `departments.ts` | Department structure and hierarchy |
| `leave.ts` | Leave requests, approvals, balances |
| `attendance.ts` | Clock in/out, timesheets |
| `recruitment.ts` | Job postings, applications, pipeline |
| `training.ts` | Training records and assignments |
| `certifications.ts` | Professional certifications tracking |
| `performance.ts` | Performance reviews and ratings |
| `goals.ts` | Goal setting and tracking |
| `documents.ts` | Employee document management |
| `org-chart.ts` | Organisation chart data |

---

## Payroll (Port 4007)

**Base path:** `/api/payroll`

| Route File | Endpoints |
|------------|-----------|
| `payroll.ts` | Pay run CRUD, processing, approval |
| `salary.ts` | Salary structures and grades |
| `benefits.ts` | Employee benefits management |
| `tax.ts` | Tax configuration and calculations |
| `tax-calculator.ts` | Multi-jurisdiction tax calculator |
| `jurisdictions.ts` | Tax jurisdiction definitions (UK, US, EU, AU) |
| `expenses.ts` | Expense claims and reimbursements |
| `loans.ts` | Employee loan management |

---

## Workflows (Port 4008)

**Base path:** `/api/workflows`

| Route File | Endpoints |
|------------|-----------|
| `definitions.ts` | Workflow definition CRUD (visual builder) |
| `instances.ts` | Running workflow instances |
| `tasks.ts` | Task assignment and completion |
| `approvals.ts` | Approval chain management |
| `automation.ts` | Automated trigger configuration |
| `templates.ts` | Pre-built workflow templates (6 ISO templates) |
| `webhooks.ts` | External webhook integrations |

---

## Training & Development (Port 4028)

**Base path:** `/api/training`

| Route File | Endpoints |
|------------|-----------|
| `courses.ts` | Training course CRUD |
| `records.ts` | Individual training records |
| `matrix.ts` | Training needs matrix (role × competency) |
| `competencies.ts` | Competency framework definitions |
| `tna.ts` | Training needs analysis |
| `inductions.ts` | New starter induction tracking |
| `dashboard.ts` | Training KPIs and compliance metrics |

---

## Supplier Management (Port 4029)

**Base path:** `/api/suppliers`

| Route File | Endpoints |
|------------|-----------|
| `suppliers.ts` | Supplier CRUD, status management |
| `categories.ts` | Supplier categories and segmentation |
| `approval.ts` | Supplier approval workflow |
| `scorecards.ts` | Supplier performance scorecards |
| `documents.ts` | Supplier document management |
| `spend.ts` | Spend analytics and tracking |
| `portal.ts` | Supplier self-service portal endpoints |
| `dashboard.ts` | Supplier KPIs and risk indicators |

---

## Asset Management (Port 4030)

**Base path:** `/api/assets`

| Route File | Endpoints |
|------------|-----------|
| `assets.ts` | Asset register CRUD, lifecycle management |
| `locations.ts` | Asset location tracking |
| `inspections.ts` | Asset inspection scheduling and records |
| `calibrations.ts` | Calibration scheduling and certificates |
| `depreciation.ts` | Depreciation calculations and reporting |
| `work-orders.ts` | Maintenance work order management |
| `dashboard.ts` | Asset KPIs, upcoming maintenance |

---

## Document Management (Port 4031)

**Base path:** `/api/documents`

| Route File | Endpoints |
|------------|-----------|
| `documents.ts` | Document CRUD, upload, metadata |
| `versions.ts` | Version control (check-in/check-out) |
| `approvals.ts` | Document approval workflows |
| `read-receipts.ts` | Mandatory read tracking |
| `search.ts` | Full-text document search |
| `dashboard.ts` | Document compliance metrics |

---

## Complaints Management (Port 4032)

**Base path:** `/api/complaints`

| Route File | Endpoints |
|------------|-----------|
| `complaints.ts` | Complaint CRUD, status tracking |
| `actions.ts` | Corrective/preventive actions |
| `communications.ts` | Customer communication log |
| `sla.ts` | SLA monitoring and escalation |
| `regulatory.ts` | Regulatory reporting requirements |
| `public.ts` | Public complaint submission (unauthenticated) |
| `dashboard.ts` | Complaint KPIs and trends |

---

## Contract Management (Port 4033)

**Base path:** `/api/contracts`

| Route File | Endpoints |
|------------|-----------|
| `contracts.ts` | Contract CRUD, status lifecycle |
| `clauses.ts` | Contract clause library |
| `approvals.ts` | Contract approval chain |
| `renewals.ts` | Renewal tracking and alerts |
| `extraction.ts` | AI-powered clause extraction |
| `notices.ts` | Notice period management |
| `dashboard.ts` | Contract value and expiry metrics |

---

## Permit to Work (Port 4034)

**Base path:** `/api/ptw`

| Route File | Endpoints |
|------------|-----------|
| `permits.ts` | PTW CRUD, issue/close workflow |
| `method-statements.ts` | Method statement management |
| `toolbox-talks.ts` | Toolbox talk records |
| `conflicts.ts` | Permit conflict detection (overlapping work) |
| `dashboard.ts` | Active permits, upcoming expiry |

---

## Regulatory Monitoring (Port 4035)

**Base path:** `/api/reg-monitor`

| Route File | Endpoints |
|------------|-----------|
| `legal-register.ts` | Legal register CRUD |
| `obligations.ts` | Compliance obligation tracking |
| `changes.ts` | Regulatory change monitoring feed |
| `dashboard.ts` | Compliance status overview |

---

## Incident Management (Port 4036)

**Base path:** `/api/incidents`

| Route File | Endpoints |
|------------|-----------|
| `incidents.ts` | Incident CRUD, severity classification |
| `investigation.ts` | Root cause investigation management |
| `riddor.ts` | RIDDOR reportable incident handling |
| `timeline.ts` | Incident timeline and event log |
| `dashboard.ts` | Incident KPIs, trends, heatmap |

---

## Audit Management (Port 4037)

**Base path:** `/api/audits`

| Route File | Endpoints |
|------------|-----------|
| `audits.ts` | Audit CRUD, scheduling, assignment |
| `programmes.ts` | Annual audit programme management |
| `checklists.ts` | Audit checklist templates |
| `findings.ts` | Audit finding CRUD, severity, actions |
| `pre-audit.ts` | Pre-audit self-assessment |
| `dashboard.ts` | Audit programme KPIs |

---

## Management Review (Port 4038)

**Base path:** `/api/mgmt-review`

| Route File | Endpoints |
|------------|-----------|
| `reviews.ts` | Management review CRUD, minutes, actions |
| `agenda.ts` | Review agenda item management |
| `dashboard.ts` | Review schedule and action tracking |

---

## Setup Wizard (Port 4039)

**Base path:** `/api/setup-wizard`

| Route File | Endpoints |
|------------|-----------|
| `wizard.ts` | `GET /status` — Check setup progress |
| | `POST /init` — Initialize new organisation |
| | `POST /step` — Complete a setup step |
| | `POST /complete` — Finish setup |
| | `POST /skip` — Skip optional step |

---

## Marketing Automation (Port 4025)

**Base path:** `/api/marketing`

| Route File | Endpoints |
|------------|-----------|
| `roi.ts` | ROI calculator for ISO implementation |
| `leads.ts` | Lead capture and qualification |
| `chat.ts` | AI chatbot sessions and messages |
| `onboarding.ts` | Customer onboarding email sequences |
| `health-score.ts` | Customer health scoring |
| `expansion.ts` | Expansion opportunity detection |
| `prospect-research.ts` | Company research and enrichment |
| `linkedin-tracker.ts` | LinkedIn outreach tracking |
| `renewal.ts` | Renewal sequence management |
| `winback.ts` | Win-back campaign automation |
| `growth.ts` | Growth metrics and forecasting |
| `digest.ts` | Weekly digest email generation |
| `partner-onboarding.ts` | Partner onboarding sequence |
| `stripe-webhooks.ts` | Stripe payment webhook handlers |

---

## Partner Portal API (Port 4026)

**Base path:** `/api/partners`

| Route File | Endpoints |
|------------|-----------|
| `auth.ts` | Partner authentication (register, login, refresh) |
| `profile.ts` | Partner profile management |
| `deals.ts` | Deal registration and tracking |
| `payouts.ts` | Commission payout management |
| `referrals.ts` | Referral link generation and tracking |
| `commission.ts` | Commission tier configuration |
| `support.ts` | Partner support ticket management |
| `collateral.ts` | Marketing collateral downloads |

---

## Chemical Management (Port 4040)

**Base path:** `/api/chemicals`

| Route File | Endpoints |
|------------|-----------|
| `chemicals.ts` | Chemical register CRUD (GHS classification, hazards) |
| `sds.ts` | Safety Data Sheet management (ISO 11014) |
| `coshh.ts` | COSHH assessment CRUD (risk rating, controls) |
| `inventory.ts` | Chemical inventory and stock tracking |
| `monitoring.ts` | Exposure monitoring records (WEL/OEL) |
| `incidents.ts` | Chemical incident reporting |
| `disposal.ts` | Waste disposal records and manifests |
| `analytics.ts` | Chemical risk analytics and dashboards |

---

## Emergency & Fire Safety (Port 4041)

**Base path:** `/api/emergency`

| Route File | Endpoints |
|------------|-----------|
| `premises.ts` | Premises register, assembly points, evacuation routes |
| `fireRiskAssessment.ts` | Fire risk assessment CRUD (FSO 2005 compliant) |
| `incidents.ts` | Emergency incident declaration, decision log, timeline |
| `bcp.ts` | Business continuity plan CRUD and exercises |
| `wardens.ts` | Fire warden assignment and management |
| `peep.ts` | Personal Emergency Evacuation Plans |
| `equipment.ts` | Emergency equipment register (extinguishers, alarms, etc.) |
| `drills.ts` | Evacuation drill scheduling and records |
| `analytics.ts` | Emergency preparedness metrics |
