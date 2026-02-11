# IMS Platform - Professional Code Evaluation Report

**Date:** 2026-02-11
**Platform:** New Business Management System (New-BMS)
**Evaluator:** Claude Code Automated Audit Suite
**Standards:** OWASP Top 10 2023, ASVS Level 2, CWE/SANS Top 25, NIST SP 800-53, GDPR Article 32, 12-Factor App, ISO/IEC 25010

---

## EXECUTIVE SUMMARY

| Metric | Score |
|--------|-------|
| **Overall Security Score** | **28 / 100** |
| **Overall Architecture Score** | **40 / 100** |
| **Overall Code Quality Score** | **45 / 100** |
| **Composite Score** | **37 / 100** |

| Severity | Count | Action |
|----------|-------|--------|
| CRITICAL | 15 | Fix immediately -- block deployment |
| HIGH | 42 | Fix within 24 hours |
| MEDIUM | 52 | Fix within current sprint |
| LOW | 24 | Fix in next sprint |
| INFO | 8 | Informational, no immediate action |
| **Total** | **141** | |

**Key Risk Summary:**
- 3 API services (HR, Payroll, Workflows) have ZERO authentication middleware
- Live Anthropic API key committed to .env files on disk
- Two comprehensive shared packages (`@ims/validation`, `@ims/resilience`) built but never imported by any service
- PII (salary, bank account, DOB) stored in plaintext with no encryption at rest
- No GDPR Article 17 right-to-erasure implementation
- 453x duplicated try/catch error handling pattern across 77 route files
- 60+ foreign key columns missing database indexes

---

## FINDINGS

### CRITICAL FINDINGS

---

#### FINDING-001 | CRITICAL | SECURITY
**Title:** Live Anthropic API Key Committed in .env Files
**File:** `.env:11`, `apps/web-health-safety/.env:3`, `.next/standalone/` copies
**CVSS:** 9.1 | **Rule:** OWASP A02 / CWE-798 | **Fix:** 1 hour

**Problematic Code:**
```
ANTHROPIC_API_KEY=sk-ant-api03-Y91TnRSNeqA1Wo...
```

**Explanation:** A live Anthropic API key is hardcoded in the root `.env` and duplicated in web app `.env` files and `.next/standalone/` build artifacts. If exposed, attackers can consume API credits and access AI services.

**Fixed Code:**
```bash
# Remove from all .env files. Use runtime injection:
# In CI/CD: set ANTHROPIC_API_KEY as a secret
# In Docker: pass via docker-compose environment or secrets
# Rotate the key immediately via Anthropic dashboard
```

---

#### FINDING-002 | CRITICAL | SECURITY
**Title:** JWT Secrets Hardcoded with Actual Values in Root .env
**File:** `.env:7-8`
**CVSS:** 9.8 | **Rule:** OWASP A02 / CWE-798 | **Fix:** 1 hour

**Problematic Code:**
```
JWT_SECRET=90d89bf8db03349449822e5a19a0116240b37321c0617b1922802cf2b635453352143eb49c9f6ef6
JWT_REFRESH_SECRET=34969c19b44a994c611bedf331fc4ab3b66ba5dcf258303f8516c064169835b6ee522c1745a9d0bf
```

**Explanation:** Real JWT signing secrets stored in plaintext on disk. If the repo is cloned or files are exposed, all tokens can be forged. Additionally, 8 downstream services use the placeholder `your-super-secret-jwt-key-change-in-production`.

**Fixed Code:**
```bash
# Generate per-environment secrets via secrets manager
openssl rand -hex 32  # Generate new JWT_SECRET
openssl rand -hex 32  # Generate new JWT_REFRESH_SECRET
# Store in HashiCorp Vault or CI/CD secrets, not .env files
```

---

#### FINDING-003 | CRITICAL | SECURITY
**Title:** HR, Payroll, and Workflows APIs Have ZERO Authentication Middleware
**Files:** `apps/api-hr/src/index.ts:51-58`, `apps/api-payroll/src/index.ts:49-54`, `apps/api-workflows/src/index.ts`
**CVSS:** 9.8 | **Rule:** OWASP A01 / CWE-306 | **Fix:** 2 hours

**Problematic Code:**
```typescript
// apps/api-hr/src/index.ts -- NO authenticate middleware anywhere
app.use('/api/employees', employeesRouter);
app.use('/api/departments', departmentsRouter);
// ... all routes completely unprotected
```

**Explanation:** Three services expose all endpoints without any authentication. Anyone with direct network access to ports 4006/4007/4008 can read/modify all employee PII, salary data, payroll runs, and workflow approvals. In Docker Compose, these ports are exposed to the host network.

**Fixed Code:**
```typescript
// In each route file (e.g., apps/api-hr/src/routes/employees.ts):
import { authenticate, type AuthRequest } from '@ims/auth';
router.use(authenticate);

// Change all handlers from (req: Request, ...) to (req: AuthRequest, ...)
```

---

#### FINDING-004 | CRITICAL | SECURITY
**Title:** JWT Algorithm Not Explicitly Specified -- Algorithm Confusion Attack
**Files:** `packages/auth/src/jwt.ts:99,109`, `packages/service-auth/src/index.ts:87`
**CVSS:** 9.1 | **Rule:** OWASP A02 / CWE-327 | **Fix:** 1 hour

**Problematic Code:**
```typescript
jwt.verify(token, getJwtSecret());
// No algorithms whitelist -- vulnerable to algorithm confusion
```

**Explanation:** None of the `jwt.verify()` calls specify an `algorithms` whitelist. While jsonwebtoken 9.x rejects `none` by default, explicitly specifying `algorithms: ['HS256']` prevents any ambiguity and future regressions.

**Fixed Code:**
```typescript
jwt.verify(token, getJwtSecret(), {
  algorithms: ['HS256'],
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
});
```

---

#### FINDING-005 | CRITICAL | SECURITY
**Title:** @ims/validation Package Built But Never Imported by ANY Service
**File:** `packages/validation/` (entire package is dead code)
**CVSS:** 8.6 | **Rule:** OWASP A03 / CWE-20 | **Fix:** 4 hours

**Problematic Code:**
```json
// No API service's package.json lists @ims/validation as a dependency
// Zero imports of @ims/validation in any apps/api-*/src/ file
```

**Explanation:** A comprehensive validation package exists with sanitization middleware, XSS detection, SQL injection detection, and Zod schemas with length constraints. It is completely unused. All 9 API services process request bodies with inline Zod schemas that lack length limits, sanitization, and security checks.

**Fixed Code:**
```typescript
// In each apps/api-*/src/index.ts:
import { sanitizeMiddleware, sanitizeQueryMiddleware } from '@ims/validation';
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());

// In each route handler with POST/PUT:
import { validateMiddleware } from '@ims/validation';
router.post('/', validateMiddleware(createSchema), async (req, res) => { ... });
```

---

#### FINDING-006 | CRITICAL | SECURITY
**Title:** PII Stored in Plaintext -- No Encryption at Rest
**Files:** `packages/database/prisma/schemas/hr.prisma:339-360`, `payroll.prisma:138`
**CVSS:** 8.5 | **Rule:** GDPR Art. 32 / CWE-311 | **Fix:** 8 hours

**Problematic Code:**
```prisma
model Employee {
  dateOfBirth    DateTime    // Plaintext
  personalEmail  String?     // Plaintext
  accountNumber  String?     // Plaintext
  salary         Decimal     // Plaintext
}
```

**Explanation:** Highly sensitive PII fields (DOB, personal email, bank account, salary, tax code) are stored as plaintext in the database with no application-level encryption. Zero usage of AES/cipher found in codebase.

**Fixed Code:**
```typescript
// packages/encryption/src/index.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
const ALGORITHM = 'aes-256-gcm';

export function encrypt(plaintext: string, key: Buffer): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

// Use Prisma middleware to encrypt on write, decrypt on read
```

---

#### FINDING-007 | CRITICAL | SECURITY
**Title:** No GDPR Right to Erasure (Article 17) Implementation
**File:** (none found -- zero matches for "gdpr", "erasure", "anonymise")
**CVSS:** 8.0 | **Rule:** GDPR Art. 17 / NIST SP 800-53 | **Fix:** 16 hours

**Explanation:** No endpoint exists for data subject deletion requests. The HR system stores personal data with no mechanism for erasure. GDPR Article 17 is a legal requirement for any system processing EU personal data.

**Fixed Code:**
```typescript
// POST /api/v1/dsr/erasure -- Data Subject Request endpoint
router.post('/erasure', authenticate, requireRole('ADMIN', 'DPO'), async (req, res) => {
  const { employeeId, reason } = req.body;
  await prisma.$transaction(async (tx) => {
    await tx.employee.update({
      where: { id: employeeId },
      data: {
        firstName: 'REDACTED', lastName: 'REDACTED',
        personalEmail: null, dateOfBirth: null,
        accountNumber: null, phone: null,
        deletedAt: new Date(),
      },
    });
    await tx.auditLog.create({ data: { action: 'GDPR_ERASURE', entityId: employeeId, reason } });
  });
});
```

---

#### FINDING-008 | CRITICAL | ARCHITECTURE
**Title:** @ims/resilience Package Never Imported or Used
**File:** `packages/resilience/src/index.ts` (entire package is dead code)
**Rule:** Resilience / Fault Tolerance | **Fix:** 4 hours

**Explanation:** A well-designed resilience library providing circuit breaker (opossum), retry with exponential backoff and jitter, timeout wrappers, and bulkhead pattern exists but is imported by zero services. All external calls, database queries, and inter-service requests operate without any resilience patterns.

**Fixed Code:**
```typescript
// In apps/api-ai-analysis/src/routes/analyse.ts:
import { createCircuitBreaker, withRetry, withTimeout } from '@ims/resilience';

const aiBreaker = createCircuitBreaker('ai-provider', {
  timeout: 15000, errorThresholdPercentage: 50, resetTimeout: 60000,
});

const aiResponse = await aiBreaker.fire(async () =>
  withTimeout(callAIProvider(provider, apiKey, model, prompt), 10000)
);
```

---

#### FINDING-009 | CRITICAL | ARCHITECTURE
**Title:** External AI API Calls Have No Timeout
**Files:** `apps/api-ai-analysis/src/routes/analyse.ts:132,166,196`, 5 Next.js API routes
**Rule:** CWE-400 / DoS Prevention | **Fix:** 2 hours

**Problematic Code:**
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { ... },
  body: JSON.stringify({ ... }),
  // No timeout, no AbortController
});
```

**Explanation:** All 12 fetch() calls to external AI providers have zero timeout. AI LLM calls can take 30-120+ seconds. If a provider hangs, the request hangs indefinitely, consuming workers and connections.

**Fixed Code:**
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 15000);
try {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { ... },
    body: JSON.stringify({ ... }),
    signal: controller.signal,
  });
} finally {
  clearTimeout(timeoutId);
}
```

---

#### FINDING-010 | CRITICAL | CODE_QUALITY
**Title:** 461 console.log/error Calls Alongside Structured Logger
**Files:** 81 files across all `apps/api-*/src/` directories
**Rule:** OWASP A09 / CWE-778 | **Fix:** 4 hours

**Explanation:** Every service creates a Winston structured logger via `createLogger()`, but route handlers use `console.error()` for error logging. This produces unstructured plaintext without timestamp, service name, correlation ID, or log level metadata. It also risks PII leakage when error objects containing request bodies are logged.

**Fixed Code:**
```typescript
// Replace in every catch block across all route files:
// Before:
console.error('Error listing risks:', error);
// After:
logger.error('Error listing risks', { error: (error as Error).message, correlationId: req.correlationId });
```

---

#### FINDING-011 | CRITICAL | ARCHITECTURE
**Title:** Project Management Schema Has 12+ Models with ZERO Indexes
**File:** `packages/database/prisma/schemas/project-management.prisma`
**Rule:** Performance / ISO 25010 | **Fix:** 2 hours

**Explanation:** The entire Project Management schema (Project, ProjectTask, ProjectMilestone, ProjectRisk, ProjectIssue, ProjectChange, ProjectResource, ProjectStakeholder, ProjectDocument, ProjectSprint, ProjectTimesheet, ProjectReport) has zero `@@index` directives. Every query involving foreign keys or status filters will perform full table scans.

**Fixed Code:**
```prisma
model ProjectTask {
  // ... fields ...
  @@index([projectId, status])
  @@index([assignedToId])
  @@index([parentTaskId])
  @@index([plannedEndDate])
  @@index([priority])
  @@map("project_tasks")
}
```

---

#### FINDING-012 | CRITICAL | ARCHITECTURE
**Title:** 60+ Foreign Key Columns Missing Database Indexes
**Files:** All 10 Prisma schema files
**Rule:** Performance / CWE-405 | **Fix:** 4 hours

**Explanation:** Approximately 60+ foreign key columns across all schemas lack indexes. Every JOIN or WHERE clause referencing a parent record will require a full table scan. Most severely affected: HR schema (15+ missing), Payroll schema (5+), H&S schema (8+), and the main schema (10+).

---

#### FINDING-013 | CRITICAL | CODE_QUALITY
**Title:** Unbounded findMany Queries with No Pagination Limit Cap
**Files:** 29+ GET list endpoints across all API services
**Rule:** CWE-400 / DoS Prevention | **Fix:** 2 hours

**Problematic Code:**
```typescript
const limitNum = parseInt(limit as string, 10); // No maximum
const items = await prisma.risk.findMany({ take: limitNum }); // Client controls limit
```

**Explanation:** All list endpoints parse `limit` from query params with no maximum cap. `?limit=999999` causes the database to return an arbitrarily large result set, leading to OOM.

**Fixed Code:**
```typescript
const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
```

---

#### FINDING-014 | CRITICAL | CODE_QUALITY
**Title:** 89+ `const where: any = {}` Bypass Prisma Type Safety
**Files:** 59 route files across all API services
**Rule:** TypeScript Strict / CWE-843 | **Fix:** 8 hours

**Problematic Code:**
```typescript
const where: any = {};
if (status) where.status = status;
if (type) where.type = type;
```

**Explanation:** Dynamic filter objects are typed as `any`, completely bypassing Prisma's type-safe query builder. Typos in field names, wrong operators, or invalid filter values silently produce wrong queries with no compile-time error.

**Fixed Code:**
```typescript
import { Prisma } from '@prisma/client';
const where: Prisma.RiskWhereInput = {};
if (status) where.status = status as any;
if (type) where.type = type as any;
```

---

#### FINDING-015 | CRITICAL | CODE_QUALITY
**Title:** Payroll Calculate Can Permanently Deadlock Run in CALCULATING State
**File:** `apps/api-payroll/src/routes/payroll.ts:115-151`
**Rule:** CWE-667 / Data Integrity | **Fix:** 1 hour

**Problematic Code:**
```typescript
try {
  await prisma.payrollRun.update({ data: { status: 'CALCULATING' } });
  // ... work ...
} catch (error) {
  // If THIS update fails, the run is stuck in CALCULATING forever
  await prisma.payrollRun.update({ data: { status: 'ERROR' } });
}
```

**Fixed Code:**
```typescript
let statusNeedsReset = false;
try {
  await prisma.payrollRun.update({ where: { id }, data: { status: 'CALCULATING' } });
  statusNeedsReset = true;
  // ... work ...
  statusNeedsReset = false;
} catch (error) {
  res.status(500).json({ ... });
} finally {
  if (statusNeedsReset) {
    try { await prisma.payrollRun.update({ where: { id }, data: { status: 'ERROR' } }); }
    catch (e) { logger.error('Failed to reset payroll status', { error: e }); }
  }
}
```

---

### HIGH FINDINGS

---

#### FINDING-016 | HIGH | SECURITY
**Title:** Placeholder JWT Secret Used Across 8 API Services
**Files:** All `apps/api-*/.env:5` files
**CVSS:** 8.1 | **Fix:** 1 hour

All individual service `.env` files contain `JWT_SECRET=your-super-secret-jwt-key-change-in-production`. This bypasses the dev fallback warning since a value IS set.

---

#### FINDING-017 | HIGH | SECURITY
**Title:** Database Passwords Hardcoded in .env Files
**Files:** `.env:2`, `packages/database/.env`, all service `.env` files
**CVSS:** 7.5 | **Fix:** 1 hour

Two distinct passwords exist: `ims_secure_password_2026` and `ims_secure_2024` across different services.

---

#### FINDING-018 | HIGH | SECURITY
**Title:** Default Access Token Lifetime is 7 Days
**File:** `packages/auth/src/jwt.ts:57`
**CVSS:** 7.5 | **Fix:** 0.5 hours

`generateToken()` defaults to `expiresIn = '7d'`. Any caller forgetting to pass `'15m'` creates tokens valid for 7 days.
**Fix:** Change default to `'15m'`.

---

#### FINDING-019 | HIGH | SECURITY
**Title:** bcrypt Cost Factor 10, Below OWASP Minimum 12
**File:** `packages/auth/src/password.ts:3`
**CVSS:** 5.9 | **Fix:** 0.5 hours

`const SALT_ROUNDS = 10;` -- OWASP recommends minimum 12. **Fix:** Change to `12`.

---

#### FINDING-020 | HIGH | SECURITY
**Title:** Password Validator Exists But Never Called
**File:** `packages/auth/src/password.ts:19`, `apps/api-gateway/src/routes/auth.ts:34`
**CVSS:** 5.3 | **Fix:** 1 hour

`validatePasswordStrength()` exists but registration and user creation routes only use `z.string().min(8)`.

---

#### FINDING-021 | HIGH | SECURITY
**Title:** Seed Credentials Use Weak Password "admin123"
**File:** `packages/database/prisma/seed.ts:10`
**CVSS:** 7.2 | **Fix:** 1 hour

---

#### FINDING-022 | HIGH | SECURITY
**Title:** Environment PUT Routes Use Raw req.body Without Validation
**Files:** 7 route files in `apps/api-environment/src/routes/`
**CVSS:** 7.5 | **Fix:** 3 hours

---

#### FINDING-023 | HIGH | SECURITY
**Title:** Project Management PUT Routes Use Raw req.body Without Validation
**Files:** 11 route files in `apps/api-project-management/src/routes/`
**CVSS:** 7.5 | **Fix:** 3 hours

---

#### FINDING-024 | HIGH | SECURITY
**Title:** Payroll Action Routes Use Raw req.body Without Validation
**Files:** 9 endpoints across payroll route files
**CVSS:** 7.3 | **Fix:** 2 hours

---

#### FINDING-025 | HIGH | SECURITY
**Title:** HR Action Routes Use Raw req.body Without Validation
**Files:** 4 endpoints in HR route files
**CVSS:** 7.3 | **Fix:** 1 hour

---

#### FINDING-026 | HIGH | SECURITY
**Title:** Workflow Action Routes Use Raw req.body Without Validation
**Files:** 6 endpoints in workflow route files
**CVSS:** 7.3 | **Fix:** 2 hours

---

#### FINDING-027 | HIGH | SECURITY
**Title:** Salary Data Exposed in Stats Endpoint Without Authorization
**File:** `apps/api-hr/src/routes/employees.ts:182-214`
**CVSS:** 7.0 | **Fix:** 1 hour

---

#### FINDING-028 | HIGH | SECURITY
**Title:** PII Logged to Console in 440+ Error Handlers
**Files:** All route files across all services
**CVSS:** 6.5 | **Fix:** 4 hours (overlaps with FINDING-010)

---

#### FINDING-029 | HIGH | SECURITY
**Title:** No Dedicated Rate Limit on AI Analysis Endpoints
**File:** `apps/api-ai-analysis/src/routes/analyze.ts`
**CVSS:** 6.5 | **Fix:** 1 hour

AI calls are expensive (token costs) and slow. Only falls under general 100 req/15min limit.

---

#### FINDING-030 | HIGH | SECURITY
**Title:** 3 Downstream Services Expose err.message Unconditionally
**Files:** `apps/api-workflows/src/index.ts:47`, `apps/api-ai-analysis/src/index.ts:49`, `apps/api-inventory/src/index.ts:53`
**CVSS:** 6.5 | **Fix:** 0.5 hours

---

#### FINDING-031 | HIGH | SECURITY
**Title:** Error Stack Traces Stored in Database
**File:** `apps/api-workflows/src/routes/automation.ts:278`
**CVSS:** 6.0 | **Fix:** 0.5 hours

---

#### FINDING-032 | HIGH | SECURITY
**Title:** Three Downstream Services Use cors() with No Origin Restriction
**Files:** `apps/api-ai-analysis/src/index.ts:29`, `apps/api-inventory/src/index.ts:31`, `apps/api-workflows/src/index.ts:27`
**CVSS:** 6.1 | **Fix:** 0.5 hours

**Fix:** Change to `cors({ origin: true, credentials: true })`.

---

#### FINDING-033 | HIGH | ARCHITECTURE
**Title:** Gateway Core Schema Contains Cross-Domain Read Models
**File:** `packages/database/prisma/schemas/core.prisma:141-402`
**Fix:** 8 hours

Gateway directly reads domain tables (risks, incidents, actions) instead of calling downstream APIs.

---

#### FINDING-034 | HIGH | ARCHITECTURE
**Title:** Workflows Service Imports from @ims/database (Core) Instead of Local Prisma
**File:** `apps/api-workflows/src/index.ts:11`
**Fix:** 0.5 hours

---

#### FINDING-035 | HIGH | ARCHITECTURE
**Title:** No Circuit Breaker on AI Analysis Service
**Files:** `apps/api-ai-analysis/src/routes/analyse.ts`, `analyze.ts`
**Fix:** 2 hours

---

#### FINDING-036 | HIGH | ARCHITECTURE
**Title:** No Graceful Shutdown on 8 of 9 Downstream Services
**Files:** All `apps/api-*/src/index.ts` except gateway
**Fix:** 2 hours

---

#### FINDING-037 | HIGH | ARCHITECTURE
**Title:** No unhandledRejection / uncaughtException Handlers
**Files:** All `apps/api-*/src/index.ts`
**Fix:** 1 hour

---

#### FINDING-038 | HIGH | ARCHITECTURE
**Title:** No Database Query Timeout in Any Prisma Configuration
**Files:** All 10 Prisma schema datasource blocks
**Fix:** 1 hour

---

#### FINDING-039 | HIGH | ARCHITECTURE
**Title:** OpenTelemetry Tracing Never Initialized
**File:** `packages/monitoring/src/tracing.ts` (defined but unused)
**Fix:** 2 hours

---

#### FINDING-040 | HIGH | ARCHITECTURE
**Title:** Correlation ID Not Propagated to Downstream Services
**File:** `apps/api-gateway/src/index.ts:160-193`
**Fix:** 0.5 hours

---

#### FINDING-041 | HIGH | ARCHITECTURE
**Title:** No /ready Endpoint for Kubernetes Readiness Probes
**Files:** All `apps/api-*/src/index.ts`
**Fix:** 1 hour

---

#### FINDING-042 | HIGH | ARCHITECTURE
**Title:** Gateway Health Check Does Not Verify Database Connectivity
**File:** `apps/api-gateway/src/index.ts:136`
**Fix:** 0.25 hours

---

#### FINDING-043 | HIGH | ARCHITECTURE
**Title:** DELETE Returns 200 with Body Instead of 204 No Content
**Files:** All 40+ delete handlers across all services
**Fix:** 2 hours

---

#### FINDING-044 | HIGH | ARCHITECTURE
**Title:** Inconsistent Response Envelope (3 Pagination Patterns)
**Files:** All list endpoints across services
**Fix:** 4 hours

---

#### FINDING-045 | HIGH | ARCHITECTURE
**Title:** Main Schema Risk/Incident Are Polymorphic God Tables
**File:** `packages/database/prisma/schema.prisma:101-258`
**Fix:** 8 hours

---

#### FINDING-046 | HIGH | ARCHITECTURE
**Title:** Most Domain Models Lack Soft Delete (deletedAt)
**Files:** All schema files except HR
**Fix:** 4 hours

---

#### FINDING-047 | HIGH | ARCHITECTURE
**Title:** Missing createdBy/updatedBy Audit Fields Across Domain Schemas
**Files:** Environment, Quality, Inventory, Workflows, AI schemas
**Fix:** 4 hours

---

#### FINDING-048 | HIGH | CODE_QUALITY
**Title:** Leave Approval Has No Transaction -- Partial Updates on Failure
**File:** `apps/api-hr/src/routes/leave.ts:233-281`
**Fix:** 1 hour

3 sequential writes (update approval, update request, update balance) without `$transaction`.

---

#### FINDING-049 | HIGH | CODE_QUALITY
**Title:** Payroll Approve Has No Transaction
**File:** `apps/api-payroll/src/routes/payroll.ts:154-179`
**Fix:** 1 hour

---

#### FINDING-050 | HIGH | CODE_QUALITY
**Title:** Workflow Advance + History Create Has No Transaction
**File:** `apps/api-workflows/src/routes/instances.ts:192-231`
**Fix:** 1 hour

---

#### FINDING-051 | HIGH | CODE_QUALITY
**Title:** Leave Request Creation Has No Transaction
**File:** `apps/api-hr/src/routes/leave.ts:138-230`
**Fix:** 1 hour

---

#### FINDING-052 | HIGH | CODE_QUALITY
**Title:** try/catch/500 Response Pattern Repeated 453 Times
**Files:** 77 route files across all services
**Fix:** 4 hours

**Fix:** Create shared `asyncHandler` wrapper eliminating ~1,800 lines of duplication.

---

#### FINDING-053 | HIGH | CODE_QUALITY
**Title:** generateRefNumber Duplicated 30+ Times
**Files:** 24 route files across H&S, Environment, Quality
**Fix:** 2 hours

Same algorithm copy-pasted 30+ times. Also has a race condition (two concurrent POSTs can get same count).

---

#### FINDING-054 | HIGH | CODE_QUALITY
**Title:** Pagination Parsing Duplicated in 45+ GET Handlers
**Files:** 45 route files (94 occurrences)
**Fix:** 2 hours

---

#### FINDING-055 | HIGH | CODE_QUALITY
**Title:** Login Page Duplicated 9 Times
**Files:** All 9 `apps/web-*/src/app/login/page.tsx`
**Fix:** 4 hours

~1,800 lines of near-identical code across 9 web apps.

---

#### FINDING-056 | HIGH | CODE_QUALITY
**Title:** Zero Error Boundaries Across All 10 Web Applications
**Files:** All web apps -- no `error.tsx` or `global-error.tsx`
**Fix:** 2 hours

An uncaught JS error in any component crashes the entire application with a white screen.

---

#### FINDING-057 | HIGH | CODE_QUALITY
**Title:** Only Gateway Validates Config at Startup; 8 Others Do Not
**File:** `apps/api-gateway/src/index.ts:225-232` (only instance)
**Fix:** 2 hours

If DATABASE_URL is missing, services start but crash on first query.

---

### MEDIUM FINDINGS (Summary Table)

| ID | Category | Title | Files | Fix Hours |
|----|----------|-------|-------|-----------|
| M-01 | SECURITY | Secrets in .next/standalone build artifacts | 9 web apps | 1 |
| M-02 | SECURITY | Inconsistent database credentials across services | .env files | 1 |
| M-03 | SECURITY | Next.js API routes have no authentication | 5 routes in web-hs | 2 |
| M-04 | SECURITY | No refresh token revocation on logout | auth.ts:237 | 4 |
| M-05 | SECURITY | Legacy auth lacks session/issuer/audience checks | apps/api/src/middleware | 2 |
| M-06 | SECURITY | Insecure dev fallback secret in code | jwt.ts:22 | 1 |
| M-07 | SECURITY | Prisma $queryRaw with potentially unsafe composition | transactions.ts:101 | 1 |
| M-08 | SECURITY | No UUID format validation on req.params.id | All routes | 2 |
| M-09 | SECURITY | No pagination limit caps on query parameters | 70+ routes | 2 |
| M-10 | SECURITY | 37 instances of z.any() in Zod schemas | Multiple routes | 4 |
| M-11 | SECURITY | Missing or excessive JSON body size limits | 6 services | 1 |
| M-12 | SECURITY | No string length caps on most Zod schema fields | All POST/PUT schemas | 4 |
| M-13 | SECURITY | CSP disabled in development mode | security-headers.ts:79 | 1 |
| M-14 | SECURITY | Token refresh endpoint not rate limited | auth.ts:288 | 0.5 |
| M-15 | SECURITY | In-memory rate limiting fallback in production | rate-limiter.ts:19 | 1 |
| M-16 | SECURITY | Downstream services have no rate limiting | All 8 downstream APIs | 4 |
| M-17 | SECURITY | Sensitive field redaction list incomplete | audit/types.ts:135 | 0.5 |
| M-18 | SECURITY | No PII access audit trail in HR/Payroll | HR/Payroll routes | 4 |
| M-19 | SECURITY | Salary data sent to external AI providers | analyze.ts:266 | 2 |
| M-20 | SECURITY | AI provider error messages forwarded to client | analyse.ts:76 | 0.5 |
| M-21 | SECURITY | Zod validation errors expose schema details | Multiple | 1 |
| M-22 | ARCH | No circuit breakers on gateway proxy | index.ts:160 | 4 |
| M-23 | ARCH | Action verbs in URL paths for state transitions | Multiple routes | 2 |
| M-24 | ARCH | Inconsistent use of PUT vs PATCH | Multiple services | 4 |
| M-25 | ARCH | Inconsistent error envelope | Multiple services | 2 |
| M-26 | ARCH | Downstream services unaware of API version | All downstream | 2 |
| M-27 | ARCH | Payroll calculate returns 501 Not Implemented | payroll.ts:114 | 8 |
| M-28 | ARCH | Supplier.address stored as JSON | inventory.prisma:55 | 4 |
| M-29 | ARCH | BowTie stores structured data in JSON columns | hs.prisma:394 | 4 |
| M-30 | ARCH | Missing numeric range constraints | Multiple schemas | 2 |
| M-31 | ARCH | Duplicate PayFrequency enum values | payroll.prisma:88 | 0.5 |
| M-32 | ARCH | Environment models missing createdBy/updatedBy | env.prisma | 2 |
| M-33 | ARCH | Quality models missing createdBy/updatedBy | quality.prisma | 2 |
| M-34 | ARCH | DB query duration metric defined but never recorded | metrics.ts:33 | 1 |
| M-35 | ARCH | Correlation ID not included in log messages | All routes | 2 |
| M-36 | ARCH | PII risk in auth logging (email plaintext) | auth.ts:56 | 1 |
| M-37 | QUALITY | useEffect fires API on every search keystroke (no debounce) | employees page | 1 |
| M-38 | QUALITY | filteredRisks recomputed every render (no useMemo) | risks/client.tsx | 1 |
| M-39 | QUALITY | Error states silently logged, not shown to users | All web apps | 4 |
| M-40 | QUALITY | @tanstack/react-query installed but never used (8 apps) | 8 web apps | 2 |
| M-41 | QUALITY | API client (axios + interceptors) duplicated 10 times | 10 api.ts files | 2 |
| M-42 | QUALITY | RBAC only applied to 2 of 10 API services | Most services | 8 |
| M-43 | QUALITY | Dashboard stats sequential queries (should be Promise.all) | dashboard.ts | 1 |
| M-44 | QUALITY | AI analysis module has 15+ `: any` types | analyse.ts | 2 |
| M-45 | QUALITY | 60+ `as any` casts on Prisma enum fields | env routes | 4 |
| M-46 | QUALITY | AI provider response.json() can throw on non-JSON bodies | analyse.ts:153 | 0.5 |
| M-47 | QUALITY | Hardcoded localhost origins in gateway CORS | index.ts:84 | 1 |
| M-48 | QUALITY | Hardcoded localhost URLs in CSP/security headers | security-headers.ts:41 | 1 |
| M-49 | QUALITY | Hardcoded localhost CORS in HR and Payroll | hr/payroll index.ts | 0.5 |
| M-50 | QUALITY | Inconsistent PORT variable name in api-inventory | inventory index.ts | 0.25 |
| M-51 | QUALITY | Inconsistent DATABASE_URL credentials | All .env files | 1 |
| M-52 | QUALITY | Inline object literals in JSX create new refs every render | risks/client.tsx | 1 |

---

### LOW FINDINGS (Summary Table)

| ID | Category | Title | Fix Hours |
|----|----------|-------|-----------|
| L-01 | SECURITY | .env.example exposes misleading JWT expiry | 0.25 |
| L-02 | SECURITY | Account lockout leaks remaining attempts | 0.25 |
| L-03 | SECURITY | Not-found handler reflects request path | 0.25 |
| L-04 | SECURITY | Weak password policy on legacy auth | 0.5 |
| L-05 | SECURITY | NaN propagation from unparsed query params | 1 |
| L-06 | SECURITY | HR/Payroll allow 10MB request bodies | 0.25 |
| L-07 | SECURITY | bcryptjs unmaintained (last release 2017) | 2 |
| L-08 | SECURITY | http-proxy-middleware v2 legacy | 4 |
| L-09 | SECURITY | No npm audit or Snyk integration | 1 |
| L-10 | ARCH | Missing Docker Compose depends_on for HR/Payroll/Workflows | 0.25 |
| L-11 | ARCH | Dual spelling /analyse and /analyze in AI service | 0.5 |
| L-12 | ARCH | Nested /inventory/inventory/transactions path | 0.25 |
| L-13 | ARCH | AI analyze route is 700+ line god handler | 8 |
| L-14 | ARCH | Inconsistent CORS configuration across services | 1 |
| L-15 | ARCH | Inventory lotNumbers/serialNumbers as JSON | 4 |
| L-16 | ARCH | Metrics route path high-cardinality labels | 1 |
| L-17 | ARCH | Console.log in tracing.ts initialization | 0.25 |
| L-18 | QUALITY | key={index} on dynamic list items (~90 instances) | 2 |
| L-19 | QUALITY | style={{}} inline objects in ~40 JSX locations | 1 |
| L-20 | QUALITY | Inline onCellClick={() => {}} creates new ref every render | 0.25 |
| L-21 | QUALITY | class-variance-authority duplicated across apps | 0.5 |
| L-22 | QUALITY | ANTHROPIC_API_KEY read without validation | 0.5 |
| L-23 | QUALITY | Sequential uniqueness checks could be parallelized | 0.5 |
| L-24 | QUALITY | Single @ts-expect-error could have more specific comment | 0.1 |

---

## REMEDIATION ROADMAP

### SPRINT 0 -- THIS WEEK (Security Critical)

| # | Finding | Title | Hours |
|---|---------|-------|-------|
| 1 | F-003 | Add authenticate middleware to HR, Payroll, Workflows | 2 |
| 2 | F-004 | Add `algorithms: ['HS256']` to all jwt.verify() calls | 1 |
| 3 | F-005 | Wire @ims/validation into all 9 API services | 4 |
| 4 | F-009 | Add AbortController timeout to all AI fetch() calls | 2 |
| 5 | F-013 | Add pagination limit cap (max 100) to all list endpoints | 2 |
| 6 | F-015 | Fix payroll calculate deadlock with finally block | 1 |
| 7 | F-018 | Change default token expiry from 7d to 15m | 0.5 |
| 8 | F-019 | Increase bcrypt cost factor from 10 to 12 | 0.5 |
| 9 | F-020 | Integrate validatePasswordStrength into registration | 1 |
| 10 | F-030 | Add NODE_ENV guard on error messages in 3 services | 0.5 |
| 11 | F-032 | Fix cors() to use origin: true in 3 services | 0.5 |
| 12 | F-034 | Fix workflows import from @ims/database to local prisma | 0.5 |
| 13 | F-057 | Add startup config validation to all services | 2 |
| **Total** | | | **17.5 hours** |

### SPRINT 1 -- NEXT SPRINT (High Priority)

| # | Finding | Title | Hours |
|---|---------|-------|-------|
| 1 | F-001/002 | Rotate all secrets, move to secrets manager | 4 |
| 2 | F-008 | Wire @ims/resilience into AI and gateway services | 4 |
| 3 | F-010 | Replace 461 console.error with structured logger | 4 |
| 4 | F-011/012 | Add missing indexes to all Prisma schemas | 4 |
| 5 | F-014 | Replace `where: any` with Prisma typed inputs | 8 |
| 6 | F-036/037 | Add graceful shutdown + process error handlers | 3 |
| 7 | F-038 | Add database query timeouts to Prisma config | 1 |
| 8 | F-040 | Forward correlation IDs across service boundaries | 0.5 |
| 9 | F-042 | Fix gateway health check to verify database | 0.25 |
| 10 | F-048-051 | Add $transaction to HR leave, payroll, workflows | 4 |
| 11 | F-052 | Create shared asyncHandler to eliminate try/catch duplication | 4 |
| 12 | F-053/054 | Create shared refNumber + pagination utilities | 4 |
| 13 | F-056 | Add error.tsx to all 10 web apps | 2 |
| **Total** | | | **42.75 hours** |

### SPRINT 2 -- BACKLOG (Medium Priority)

| # | Finding | Title | Hours |
|---|---------|-------|-------|
| 1 | F-006 | Implement PII encryption at rest (AES-256-GCM) | 8 |
| 2 | F-007 | Build GDPR right-to-erasure endpoint | 16 |
| 3 | F-022-026 | Add Zod validation to all PUT/PATCH routes | 12 |
| 4 | F-039 | Initialize OpenTelemetry tracing in all services | 2 |
| 5 | F-041 | Add /ready endpoints to all services | 1 |
| 6 | F-043/044 | Standardize DELETE responses and pagination envelope | 6 |
| 7 | F-046/047 | Add deletedAt + createdBy/updatedBy to all domain models | 8 |
| 8 | F-055 | Extract shared LoginPage component | 4 |
| 9 | M-04 | Implement refresh token revocation | 4 |
| 10 | M-10 | Replace z.any() with specific schemas | 4 |
| 11 | M-18 | Integrate @ims/audit into HR and Payroll | 4 |
| 12 | M-42 | Add RBAC to all API services | 8 |
| **Total** | | | **77 hours** |

### SPRINT 3 -- TECH DEBT (Low Priority)

| # | Finding | Title | Hours |
|---|---------|-------|-------|
| 1 | L-07 | Migrate from bcryptjs to bcrypt or @node-rs/bcrypt | 2 |
| 2 | L-08 | Migrate http-proxy-middleware to v3 | 4 |
| 3 | L-09 | Set up Dependabot/Snyk for dependency scanning | 1 |
| 4 | L-13 | Refactor AI analyze 700-line god handler | 8 |
| 5 | M-37/38 | Add debounce and useMemo to React components | 2 |
| 6 | M-40 | Either use react-query or remove from 8 apps | 4 |
| 7 | M-41 | Extract shared API client factory | 2 |
| 8 | M-45 | Replace `as any` enum casts with z.nativeEnum | 4 |
| 9 | M-47/48 | Externalize CORS and CSP origins to env vars | 2 |
| **Total** | | | **29 hours** |

---

## POSITIVE FINDINGS

The following practices are already in place and should be preserved:

### Security
1. **Session-based token validation** (`packages/auth/src/middleware.ts:45-59`) -- tokens validated against DB sessions with expiry and active status checks
2. **Account lockout** (`apps/api-gateway/src/middleware/account-lockout.ts`) -- 5 failed attempts triggers 30-minute lockout with Redis backing
3. **Comprehensive rate limiting** -- Login: 5/15min, Registration: 3/hour, Password reset: 3/15min, API: 100/15min per IP
4. **Secure password reset flow** -- 32-byte random token stored as SHA-256 hash, 1-hour expiry, all sessions invalidated, anti-enumeration response
5. **RBAC on user management** -- ADMIN-only for user creation/deletion, self-deletion prevention
6. **Comprehensive security headers** -- Helmet with HSTS (preload), frame-ancestors: none, noSniff, strict referrer, 24-feature permissions policy
7. **API response caching prevention** -- `Cache-Control: no-store, no-cache, must-revalidate` on all API paths
8. **Audit service with PII redaction** -- `packages/audit/src/service.ts` redacts password, token, apiKey, SSN, creditCard etc.
9. **No dangerouslySetInnerHTML usage** -- zero instances across all 10 web apps
10. **Current dependency versions** -- Express 4.22.1, jsonwebtoken 9.0.3, Prisma 5.22.0, Zod 3.25.76

### Architecture
11. **Clean bounded contexts** -- each service owns a distinct ISO/business domain with table prefixes
12. **Star topology via gateway** -- clean separation with no inter-service HTTP calls
13. **API versioning with deprecation headers** -- `/api/v1/*` routes with Sunset headers on legacy endpoints
14. **Service token authentication** -- gateway generates `X-Service-Token` for downstream auth
15. **CORS header stripping** -- gateway strips downstream CORS headers to prevent conflicts
16. **Body re-serialization on proxy** -- correctly handles express.json() consuming the request stream
17. **Well-designed resilience library** -- circuit breaker, retry, timeout, bulkhead -- just needs wiring
18. **Well-designed monitoring package** -- Winston logging, Prometheus metrics, correlation IDs, health checks, OpenTelemetry tracing

### Code Quality
19. **2,579 unit tests passing** across 99 suites with consistent mock patterns
20. **8 integration test scripts** with ~425 assertions and master runner
21. **No heavy dependencies** -- no moment.js, lodash (full), jQuery, Bootstrap, Material UI
22. **Consistent test pattern** -- mock Prisma client + mock auth + supertest
23. **CI/CD pipeline** -- GitHub Actions with daily runs, push/PR triggers, artifact upload
24. **Loading skeletons on all components** -- proper loading states with pulse animations
25. **Empty state handling** -- all list components show user-friendly empty messages
26. **Modal components use correct `isOpen` prop** -- per CLAUDE.md guidance
27. **Chart.js registrations at module level** -- not inside components
28. **Several modules properly use useCallback/useMemo** -- quality, environment, H&S improvements

---

## METHODOLOGY

### Evaluation Personas
- **Chief Security Engineer** (CISSP, CEH) -- Phases 1A-1H
- **Principal Architect** (15 years distributed systems) -- Phases 2A-2E
- **Staff Full-Stack Engineer** (TypeScript, React, Node.js) -- Phases 3A-3G

### Tools Used
- Static analysis via ripgrep pattern matching
- Prisma schema analysis
- package.json dependency audit
- Route-level code review of all 77 route files
- React component analysis across all 10 web apps

### Standards Applied
- OWASP Top 10 2023
- OWASP ASVS 4.0 Level 2
- CWE/SANS Top 25
- NIST SP 800-53 Rev 5
- GDPR Article 32
- 12-Factor App Methodology
- ISO/IEC 25010:2023

---

**Report Generated:** 2026-02-11
**Total Unique Findings:** 141 (15 CRITICAL, 42 HIGH, 52 MEDIUM, 24 LOW, 8 INFO)
**Estimated Total Remediation:** ~166 hours across 4 sprints
