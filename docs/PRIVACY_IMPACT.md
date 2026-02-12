# Privacy Impact Assessment (PIA) — Integrated Management System

**Document Reference:** IMS-PIA-001
**Version:** 1.0
**Date:** 2026-02-12
**Classification:** Confidential

---

## 1. Overview

This Privacy Impact Assessment documents the personal data processing activities within the Integrated Management System (IMS). The IMS is a multi-module compliance platform spanning ISO 45001 (Health & Safety), ISO 14001 (Environment), ISO 9001 (Quality), IATF 16949 (Automotive), ISO 13485 (Medical), and AS9100D (Aerospace) management standards.

## 2. Personal Data Inventory

### 2.1 Core Module (Authentication & User Management)

| Field | Table | Purpose | Legal Basis |
|-------|-------|---------|-------------|
| email | users | Account identification and communication | Contract performance (Art 6(1)(b)) |
| firstName | users | User identification | Contract performance (Art 6(1)(b)) |
| lastName | users | User identification | Contract performance (Art 6(1)(b)) |
| phone | users | Contact information | Legitimate interest (Art 6(1)(f)) |
| department | users | Organizational assignment | Legitimate interest (Art 6(1)(f)) |
| jobTitle | users | Role identification | Legitimate interest (Art 6(1)(f)) |
| password | users | Authentication (stored as bcrypt hash) | Contract performance (Art 6(1)(b)) |
| avatar | users | User profile display | Consent (Art 6(1)(a)) |
| ipAddress | sessions | Security auditing and fraud prevention | Legitimate interest (Art 6(1)(f)) |
| userAgent | sessions | Security auditing and session management | Legitimate interest (Art 6(1)(f)) |

### 2.2 Audit Module

| Field | Table | Purpose | Legal Basis |
|-------|-------|---------|-------------|
| userId | audit_logs | Accountability and traceability | Legal obligation (Art 6(1)(c)) |
| ipAddress | audit_logs | Security auditing | Legitimate interest (Art 6(1)(f)) |
| userEmail | enhanced_audit_trail | 21 CFR Part 11 compliance | Legal obligation (Art 6(1)(c)) |
| userFullName | enhanced_audit_trail | 21 CFR Part 11 compliance | Legal obligation (Art 6(1)(c)) |
| userEmail | esignatures | Electronic signature verification | Legal obligation (Art 6(1)(c)) |
| userFullName | esignatures | Electronic signature verification | Legal obligation (Art 6(1)(c)) |

### 2.3 Health & Safety Module (ISO 45001)

| Field | Table | Purpose | Legal Basis |
|-------|-------|---------|-------------|
| reporterId | incidents | Incident accountability | Legal obligation (Art 6(1)(c)) |
| investigatorId | incidents | Investigation assignment | Legitimate interest (Art 6(1)(f)) |
| personsInvolved | incidents | Incident investigation details | Legal obligation (Art 6(1)(c)) |
| injuryType | incidents | Health & safety record keeping | Legal obligation (Art 6(1)(c)) |
| bodyPart | incidents | Health & safety record keeping | Legal obligation (Art 6(1)(c)) |
| daysLost | incidents | Lost time tracking | Legal obligation (Art 6(1)(c)) |

### 2.4 Environment Module (ISO 14001)

| Field | Table | Purpose | Legal Basis |
|-------|-------|---------|-------------|
| createdBy | env_aspects | Record ownership and accountability | Legitimate interest (Art 6(1)(f)) |
| assignedTo | env_actions | Task assignment and tracking | Legitimate interest (Art 6(1)(f)) |
| responsiblePerson | env_objectives | Objective ownership | Legitimate interest (Art 6(1)(f)) |

### 2.5 Quality Module (ISO 9001)

| Field | Table | Purpose | Legal Basis |
|-------|-------|---------|-------------|
| ownerId | actions | Action ownership | Legitimate interest (Art 6(1)(f)) |
| createdById | actions | Record accountability | Legitimate interest (Art 6(1)(f)) |

### 2.6 HR Module

| Field | Table | Purpose | Legal Basis |
|-------|-------|---------|-------------|
| Employee PII | hr_employees | Employment management | Contract performance (Art 6(1)(b)) |
| Training records | hr_training | Competency management | Legitimate interest (Art 6(1)(f)) |
| Performance data | hr_reviews | Performance management | Legitimate interest (Art 6(1)(f)) |

### 2.7 Payroll Module

| Field | Table | Purpose | Legal Basis |
|-------|-------|---------|-------------|
| Salary data | payroll_records | Compensation processing | Contract performance (Art 6(1)(b)) |
| Bank details | payroll_records | Payment processing | Contract performance (Art 6(1)(b)) |
| Tax information | payroll_records | Tax compliance | Legal obligation (Art 6(1)(c)) |

## 3. Data Categories and Retention Requirements

| Data Category | Module | Retention Period | Action at Expiry | Legal Basis |
|--------------|--------|-----------------|------------------|-------------|
| User accounts | Core | Duration of employment + 1 year | ANONYMIZE | Contract performance |
| Audit logs | Core/All | 7 years | ARCHIVE | Regulatory requirement (SOX, FDA 21 CFR Part 11) |
| Enhanced audit trail | Core | 7 years minimum | ARCHIVE | 21 CFR Part 11 requirement |
| Electronic signatures | Core | 7 years minimum | ARCHIVE | 21 CFR Part 11 requirement |
| Session logs | Core | 90 days | DELETE | Legitimate interest |
| Incident records | H&S | 40 years (injury records) | ARCHIVE | RIDDOR / OSHA requirements |
| Environmental records | Environment | 5 years | ARCHIVE | ISO 14001 / EPA requirements |
| Quality records | Quality | 7 years | ARCHIVE | ISO 9001 requirements |
| HR records | HR | Duration of employment + 6 years | ARCHIVE | Employment law |
| Payroll records | Payroll | 7 years | ARCHIVE | Tax regulations |
| Medical device records | Medical | Lifetime of device + 15 years | ARCHIVE | EU MDR / FDA 21 CFR 820 |
| Automotive quality records | Automotive | 15 years after end of production | ARCHIVE | IATF 16949 requirements |
| Aerospace records | Aerospace | Per contract + 10 years | ARCHIVE | AS9100D requirements |

## 4. Data Subjects and Their Rights

### 4.1 Data Subjects

- **Employees**: System users, incident reporters, action owners, auditors
- **Contractors**: May have limited accounts for specific modules
- **External auditors**: Temporary access for certification audits
- **Incident witnesses**: Named in incident reports

### 4.2 Rights Under GDPR

| Right | Article | Implementation | Notes |
|-------|---------|---------------|-------|
| Right of access | Art 15 | GET /api/v1/gdpr/data-export/:userId | Automated JSON export |
| Right to rectification | Art 16 | PUT /api/v1/users/:id | Standard user update endpoints |
| Right to erasure | Art 17 | POST /api/v1/gdpr/erasure-request | Subject to legal retention requirements |
| Right to restriction | Art 18 | User deactivation (isActive: false) | Soft-delete pattern |
| Right to portability | Art 20 | GET /api/v1/gdpr/data-export/:userId | Machine-readable JSON format |
| Right to object | Art 21 | Manual process via DPO | Case-by-case assessment |

### 4.3 Limitations on Erasure

The right to erasure (Art 17) may be limited where processing is necessary for:

- **Legal obligations** (Art 17(3)(b)): Audit trails required by 21 CFR Part 11, RIDDOR, OSHA
- **Public health** (Art 17(3)(c)): Incident records required for safety analysis
- **Archiving in public interest** (Art 17(3)(d)): Quality and safety records
- **Legal claims** (Art 17(3)(e)): Records needed for ongoing or potential litigation

Where full erasure is not possible, data will be **anonymized** instead (removing identifying information while preserving statistical and compliance value).

## 5. Data Processing Activities

### 5.1 Automated Processing

- **Compliance scoring**: Aggregates data across modules to calculate compliance percentages
- **AI analysis**: Incident and risk data analyzed by AI for root cause analysis (data sent to external AI providers: OpenAI, Anthropic, Grok)
- **Report generation**: Automated compilation of KPI packs and management review reports
- **Session management**: Automatic session expiry and cleanup

### 5.2 Data Transfers

| Transfer | Destination | Safeguard |
|----------|------------|-----------|
| AI Analysis | OpenAI/Anthropic/Grok APIs | Data Processing Agreements, Standard Contractual Clauses |
| Email notifications | SMTP provider | TLS encryption |
| Database backups | Configured backup destination | Encryption at rest |

## 6. Cross-Border Transfer Considerations

- The IMS is deployed on-premises or in a single cloud region by default
- AI analysis may involve transfer to US-based providers (OpenAI, Anthropic)
- Standard Contractual Clauses (SCCs) or adequacy decisions should be in place for cross-border transfers
- Data minimization should be applied before sending data to AI providers (exclude PII where possible)

## 7. Security Measures

### 7.1 Technical Measures

- **Authentication**: JWT Bearer tokens with bcrypt password hashing
- **Authorization**: Role-based access control (ADMIN, MANAGER, AUDITOR, USER)
- **Encryption in transit**: HTTPS/TLS for all API communications
- **Encryption at rest**: PostgreSQL database encryption
- **Session management**: Automatic session expiry, cleanup jobs
- **Audit trail**: Comprehensive logging of all data access and modifications
- **Electronic signatures**: 21 CFR Part 11 compliant with tamper detection (SHA-256 checksums)
- **Rate limiting**: Redis-backed rate limiting to prevent abuse
- **CSRF protection**: Configurable CSRF middleware
- **Security headers**: Helmet.js with strict CSP, HSTS

### 7.2 Organizational Measures

- Admin-only access to GDPR endpoints
- Data retention policies configurable per module
- Erasure request workflow with approval chain
- Automated data export for subject access requests
- Privacy impact assessment documentation (this document)

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Unauthorized data access | Low | High | RBAC, JWT auth, audit logging |
| Data breach | Low | Critical | Encryption, security headers, rate limiting |
| Excessive data retention | Medium | Medium | Configurable retention policies, automated cleanup |
| Cross-border transfer non-compliance | Medium | High | SCCs, data minimization for AI |
| Incomplete erasure | Medium | Medium | Anonymization fallback, legal hold tracking |
| Audit trail tampering | Low | Critical | SHA-256 checksums, immutable append-only design |

## 9. GDPR API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/v1/gdpr/data-export/:userId | GET | Export all personal data for a user |
| /api/v1/gdpr/erasure-request | POST | Submit right-to-erasure request |
| /api/v1/gdpr/erasure-request | GET | List all erasure requests |
| /api/v1/gdpr/erasure-request/:id | PUT | Process/complete erasure request |
| /api/v1/gdpr/retention-policies | GET | List data retention policies |
| /api/v1/gdpr/retention-policies | POST | Create/update retention policy |
| /api/v1/gdpr/data-map | GET | Show personal data inventory |

## 10. Review Schedule

This PIA should be reviewed:

- Annually as part of the management review process
- When new modules are added to the IMS
- When data processing activities change significantly
- When new cross-border transfers are introduced
- After any data breach incident
