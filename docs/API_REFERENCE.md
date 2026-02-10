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
- Allowed origins: `http://localhost:3000` through `http://localhost:3008`
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

## AI Analysis Endpoints

AI routes are Next.js API routes on the web-health-safety app (port 3001), calling Claude Sonnet 4.5.

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

# CORS verification
curl -s -I http://localhost:4000/api/health-safety/incidents \
  -H "Origin: http://localhost:3001" | grep "Access-Control-Allow-Origin"
# Expected: Access-Control-Allow-Origin: http://localhost:3001
```
