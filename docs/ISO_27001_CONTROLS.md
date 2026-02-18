# ISO 27001 Information Security Controls

This document maps ISO/IEC 27001:2022 Annex A controls to the IMS (Integrated Management System) implementation. It covers access control, cryptography, operations security, incident management, and compliance.

---

## A.5 Information Security Policies

| Control | Title                             | Status      | Implementation Evidence                                                                                     |
| ------- | --------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| A.5.1   | Policies for information security | IMPLEMENTED | `docs/SECURITY.md`; Helmet CSP headers; CORS origin allowlist; rate limiting policies                       |
| A.5.2   | Review of policies                | IMPLEMENTED | Automated startup secret validation (`validateStartupSecrets`); security header middleware reviewed in code |

---

## A.6 Organisation of Information Security

| Control | Title                          | Status      | Implementation Evidence                                                            |
| ------- | ------------------------------ | ----------- | ---------------------------------------------------------------------------------- |
| A.6.1   | Internal organisation          | IMPLEMENTED | RBAC with 4 roles (ADMIN, MANAGER, AUDITOR, USER); `requireRole` middleware        |
| A.6.2   | Mobile devices and teleworking | IMPLEMENTED | JWT bearer tokens support stateless mobile access; no server-side session required |

---

## A.9 Access Control

### A.9.1 Business Requirements of Access Control

| Control | Title                                   | Status      | Implementation Evidence                                                                                                                 |
| ------- | --------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| A.9.1.1 | Access control policy                   | IMPLEMENTED | Role-based access: ADMIN > MANAGER > AUDITOR > USER. See RBAC matrix below.                                                             |
| A.9.1.2 | Access to networks and network services | IMPLEMENTED | CORS allowlist (configurable via `ALLOWED_ORIGINS`); API rate limiting (100 req/15min general, strict for AI); Docker network isolation |

### A.9.2 User Access Management

| Control | Title                                           | Status      | Implementation Evidence                                                                   |
| ------- | ----------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| A.9.2.1 | User registration and de-registration           | IMPLEMENTED | `POST /api/v1/auth/register`; soft-delete on users (`deletedAt` field)                    |
| A.9.2.2 | User access provisioning                        | IMPLEMENTED | Role assignment via ADMIN-only user management endpoints (`PUT /api/v1/users/:id`)        |
| A.9.2.3 | Privileged access management                    | IMPLEMENTED | `requireRole('ADMIN')` middleware on sensitive routes; ADMIN-only user/session management |
| A.9.2.4 | Management of secret authentication information | IMPLEMENTED | bcrypt password hashing with auto-generated salt; JWT signed with HMAC-SHA256             |
| A.9.2.5 | Review of user access rights                    | IMPLEMENTED | Session management endpoints; automated session cleanup job (runs hourly)                 |
| A.9.2.6 | Removal of access rights                        | IMPLEMENTED | User deactivation (`isActive=false`); session revocation (`DELETE /api/v1/sessions/:id`)  |

### A.9.3 User Responsibilities

| Control | Title                                    | Status      | Implementation Evidence                                                           |
| ------- | ---------------------------------------- | ----------- | --------------------------------------------------------------------------------- |
| A.9.3.1 | Use of secret authentication information | IMPLEMENTED | Password complexity validation at registration; token expiry enforcement (1h JWT) |

### A.9.4 System and Application Access Control

| Control | Title                          | Status      | Implementation Evidence                                                                          |
| ------- | ------------------------------ | ----------- | ------------------------------------------------------------------------------------------------ |
| A.9.4.1 | Information access restriction | IMPLEMENTED | Ownership-scoped queries via `scopeToUser` and `checkOwnership` middleware (`@ims/service-auth`) |
| A.9.4.2 | Secure log-on procedures       | IMPLEMENTED | Rate-limited login endpoint; audit logging of all authentication events (LOGIN, LOGOUT)          |
| A.9.4.3 | Password management system     | IMPLEMENTED | bcrypt with configurable cost factor; minimum length validation                                  |

### RBAC Matrix

| Resource              | ADMIN | MANAGER | AUDITOR | USER     |
| --------------------- | ----- | ------- | ------- | -------- |
| Users                 | CRUD  | R       | R       | R(self)  |
| Sessions              | CRUD  | R(self) | R(self) | R(self)  |
| Risks                 | CRUD  | CRUD    | R       | CR       |
| Incidents             | CRUD  | CRUD    | R       | CR       |
| Actions               | CRUD  | CRUD    | R       | CRU(own) |
| Legal Requirements    | CRUD  | CRUD    | R       | R        |
| Objectives            | CRUD  | CRUD    | R       | R        |
| CAPA                  | CRUD  | CRUD    | R       | CR       |
| Documents             | CRUD  | CRUD    | R       | R        |
| Audit Logs            | R     | R       | R       | -        |
| AI Analysis           | CRUD  | CRUD    | R       | CR       |
| Compliance Calendar   | CRUD  | CRUD    | R       | R        |
| Security Controls     | R     | R       | R       | -        |
| GDPR Erasure Requests | CRUD  | R       | R       | C(self)  |
| Reports               | CRUD  | CR      | CR      | R        |

Legend:

- **CRUD** = Create, Read, Update, Delete
- **R** = Read only
- **CR** = Create + Read
- **CRU(own)** = Create, Read, Update own records only
- **R(self)** = Read own records only
- **-** = No access

---

## A.10 Cryptography

| Control  | Title                                       | Status      | Implementation Evidence                                                                                                                                                      |
| -------- | ------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A.10.1.1 | Policy on the use of cryptographic controls | IMPLEMENTED | JWT signed with HMAC-SHA256; bcrypt password hashing; SHA-256 checksums on `EnhancedAuditTrail` and `ESignature` records for tamper detection                                |
| A.10.1.2 | Key management                              | IMPLEMENTED | `JWT_SECRET` environment variable (validated at startup); service token rotation every 50 minutes (before 1-hour expiry); `INTER_SERVICE_SECRET` for service-to-service auth |

### Cryptographic Inventory

| Purpose               | Algorithm                    | Key Location                   |
| --------------------- | ---------------------------- | ------------------------------ |
| Password storage      | bcrypt (auto-generated salt) | N/A (one-way hash)             |
| JWT signing           | HMAC-SHA256                  | `JWT_SECRET` env var           |
| Audit trail integrity | SHA-256                      | Computed per record            |
| E-signature integrity | SHA-256                      | Computed per signature         |
| Inter-service auth    | JWT (HMAC-SHA256)            | `INTER_SERVICE_SECRET` env var |

---

## A.12 Operations Security

| Control  | Title                                   | Status      | Implementation Evidence                                                                                                                  |
| -------- | --------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| A.12.1.1 | Documented operating procedures         | IMPLEMENTED | `docs/DEPLOYMENT_CHECKLIST.md`; `scripts/startup.sh`; Docker Compose configurations                                                      |
| A.12.1.2 | Change management                       | IMPLEMENTED | Git version control; CI/CD pipeline (`.github/workflows/tests.yml`); `QualChange` module for formal change management                    |
| A.12.2.1 | Controls against malware                | IMPLEMENTED | Input validation (`express-validator`, `isValidId`); JSON schema validation; 1MB request size limit; Content-Type enforcement            |
| A.12.4.1 | Event logging                           | IMPLEMENTED | `AuditLog` model (basic logging); `EnhancedAuditTrail` model (21 CFR Part 11 compliant); Winston structured logging with correlation IDs |
| A.12.4.3 | Administrator and operator logs         | IMPLEMENTED | All actions logged with `userId`, IP address, user agent, correlation ID; admin operations fully traced                                  |
| A.12.6.1 | Management of technical vulnerabilities | IMPLEMENTED | Helmet security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options); dependency audit in CI                                     |
| A.12.6.2 | Restrictions on software installation   | IMPLEMENTED | Docker containers with minimal base images; pinned dependency versions                                                                   |

---

## A.13 Communications Security

| Control  | Title                         | Status      | Implementation Evidence                                                                              |
| -------- | ----------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| A.13.1.1 | Network controls              | IMPLEMENTED | Docker network isolation between services; inter-service authentication via `X-Service-Token` header |
| A.13.1.2 | Security of network services  | IMPLEMENTED | TLS termination at load balancer; strict CORS origin allowlist                                       |
| A.13.2.1 | Information transfer policies | IMPLEMENTED | JSON-only API; `Content-Type: application/json` enforcement; request size limits (1MB)               |

---

## A.16 Information Security Incident Management

| Control  | Title                                        | Status      | Implementation Evidence                                                                                                                                    |
| -------- | -------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A.16.1.1 | Responsibilities and procedures              | IMPLEMENTED | `IncidentType` enum includes `SECURITY_BREACH`, `DATA_BREACH`, `UNAUTHORIZED_ACCESS`, `PHISHING_ATTEMPT`; H&S incident workflow handles security incidents |
| A.16.1.2 | Reporting information security events        | IMPLEMENTED | Incident reporting via `POST /api/v1/health-safety/incidents` with security-specific types                                                                 |
| A.16.1.3 | Reporting information security weaknesses    | IMPLEMENTED | Near-miss reporting (`NEAR_MISS` incident type); anonymous reporting capability                                                                            |
| A.16.1.4 | Assessment of information security events    | IMPLEMENTED | 5-level severity classification (MINOR to CATASTROPHIC); AI-assisted root cause analysis                                                                   |
| A.16.1.5 | Response to information security incidents   | IMPLEMENTED | CAPA workflow for corrective/preventive actions; action tracking with due dates and verification                                                           |
| A.16.1.6 | Learning from information security incidents | IMPLEMENTED | Root cause analysis tools (5-Why, Fishbone, Bow-Tie); lessons learned fields; management review inputs                                                     |
| A.16.1.7 | Collection of evidence                       | IMPLEMENTED | `EnhancedAuditTrail` with SHA-256 checksums; `ESignature` records with tamper detection; comprehensive audit logging                                       |

### Security Incident Types

The `IncidentType` enum in the Health & Safety schema (`health-safety.prisma`) includes four security-specific types:

- **SECURITY_BREACH** - Unauthorized access to systems, data, or physical areas
- **DATA_BREACH** - Unauthorized disclosure, access, or loss of personal/sensitive data
- **UNAUTHORIZED_ACCESS** - Attempted or successful unauthorized access to systems or data
- **PHISHING_ATTEMPT** - Social engineering attacks targeting users via email, phone, or other channels

These types are supported across the full incident management lifecycle: reporting, investigation, root cause analysis, CAPA, and closure.

---

## A.18 Compliance

| Control  | Title                                           | Status      | Implementation Evidence                                                                                                                               |
| -------- | ----------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| A.18.1.1 | Identification of applicable legislation        | IMPLEMENTED | Legal requirement registers across H&S (`LegalRequirement`), Environment (`EnvLegal`), and Quality (`QualLegal`) modules                              |
| A.18.1.2 | Intellectual property rights                    | IMPLEMENTED | Document control module with version tracking, ownership, and access levels                                                                           |
| A.18.1.3 | Protection of records                           | IMPLEMENTED | Soft-delete pattern (never hard-deletes); `EnhancedAuditTrail` with SHA-256 checksums; `ESignature` model for regulatory compliance                   |
| A.18.1.4 | Privacy and PII protection                      | IMPLEMENTED | GDPR module: `DataRetentionPolicy` model (configurable retention periods); `ErasureRequest` model (right to be forgotten); data anonymization support |
| A.18.2.1 | Independent review of information security      | IMPLEMENTED | ISO audit engine (`packages/iso-checklists`); supports ISO 9001, ISO 14001, ISO 45001, IATF 16949, AS9100D, ISO 13485                                 |
| A.18.2.2 | Compliance with security policies and standards | IMPLEMENTED | Compliance calendar with automated tracking; management review workflows                                                                              |
| A.18.2.3 | Technical compliance review                     | IMPLEMENTED | Automated test suite (3,000+ tests); CI/CD pipeline; startup secret validation                                                                        |

### GDPR / Data Protection Controls

| Feature               | Model                 | Description                                                                                        |
| --------------------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| Retention policies    | `DataRetentionPolicy` | Configurable retention periods per data category and module, with ARCHIVE/DELETE/ANONYMIZE actions |
| Right to erasure      | `ErasureRequest`      | Tracks data subject erasure requests through PENDING > IN_PROGRESS > COMPLETED workflow            |
| Audit trail integrity | `EnhancedAuditTrail`  | Tamper-resistant audit records with SHA-256 checksums, user identification, IP tracking            |
| Electronic signatures | `ESignature`          | 21 CFR Part 11 compliant signatures with meaning, reason, and integrity verification               |

---

## API Endpoint

The security controls are exposed via the gateway API:

```
GET /api/v1/security-controls          # ISO 27001 control domains summary
GET /api/v1/security-controls/rbac-matrix  # RBAC matrix
GET /api/v1/security-controls/status       # Live security status
```

Access is restricted to ADMIN, MANAGER, and AUDITOR roles.
