# IMS API Reference

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
- Allowed origins: `http://localhost:3000` through `http://localhost:3009`
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
