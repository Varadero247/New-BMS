# Glossary — Nexara IMS Administrator Training

80+ terms covering SCIM, RBAC, JWT, audit events, integrations, and platform operations.

---

## A

**Access Control List (ACL)**
A list of permissions attached to an object specifying which users or system processes can access it and what operations they can perform.

**Active Directory (AD)**
Microsoft's directory service for Windows domain networks. Often used as the Identity Provider (IdP) for SAML SSO and SCIM provisioning to the IMS.

**API (Application Programming Interface)**
A set of rules and protocols allowing software systems to communicate. The IMS exposes REST APIs for all data and administrative operations.

**API Gateway**
The single entry point for all IMS API requests. Routes requests to the appropriate microservice. Handles authentication, rate limiting, and CORS. Runs on port 4000.

**API Key**
A credential (long random string) used to authenticate programmatic access to the IMS API. Should have defined scope, expiry, and IP restrictions.

**Append-Only Log**
A data structure where records can only be added, never modified or deleted. The IMS audit log is append-only to ensure tamper-evidence.

**Assertion (SAML)**
An XML document issued by an Identity Provider that asserts claims about an authenticated user. The IMS validates SAML assertions to establish user sessions.

**Audit Log**
The immutable, chronological record of all actions performed within the IMS. Used for compliance, security investigation, and change management.

**Authentication**
The process of verifying who a user is (identity). The IMS supports local username/password, SAML SSO, and OAuth 2.0.

**Authorisation**
The process of determining what an authenticated user is allowed to do (permissions). Implemented via RBAC in the IMS.

**ACS URL (Assertion Consumer Service URL)**
The SAML endpoint in the IMS where the IdP posts SAML assertions after successful authentication. Format: `https://{instance}.nexara.io/saml/callback`.

---

## B

**Backup**
A copy of data stored separately from the primary system, used to restore the system after data loss or corruption.

**Bearer Token**
An HTTP authentication scheme where the token holder (bearer) is granted access. Format: `Authorization: Bearer {token}`. Used for SCIM and API key authentication.

**Bloom's Taxonomy**
A classification framework for educational objectives across six cognitive levels: Remember, Understand, Apply, Analyse, Evaluate, Create. Used to structure module learning objectives.

---

## C

**Certificate (Digital)**
A document confirming a participant has passed the Nexara Administrator Training Programme. Issued in PDF (A4 landscape) and PNG (1920×1080) formats.

**Chain Hash**
A cryptographic technique where each record's hash includes the hash of the previous record, forming an unbreakable chain. Used in the audit log for tamper-evidence.

**Change Management**
The process for requesting, reviewing, approving, and documenting changes to IT systems. All IMS platform updates must be logged in the change management system.

**Client Credentials Flow (OAuth 2.0)**
An OAuth 2.0 grant type for server-to-server authentication where no user interaction is required. Used for automated data pipelines and dashboard integrations.

**CORS (Cross-Origin Resource Sharing)**
A browser security mechanism that controls which origins can make HTTP requests to the IMS API. Configured at the gateway level.

**CPD (Continuing Professional Development)**
Structured learning activities that professionals undertake to maintain and enhance their knowledge and skills. This programme awards 14 CPD hours.

**Custom Role**
An administrator-created role with bespoke permission settings. Should be created sparingly and documented with business justification.

---

## D

**Data Governance**
Policies, processes, and standards for ensuring data quality, security, and compliance. The IMS Data Governance module manages data classification, retention, and lineage.

**Deprovisioning**
The process of removing a user's access when they leave an organisation or change roles. The IMS supports manual deprovisioning, SCIM-triggered deprovisioning, and time-based auto-deprovisioning.

**DENY Override**
An explicit permission setting at the user level that overrides role-granted permissions. Prevents a user from accessing a module even if their role grants access.

**Disaster Recovery (DR)**
The process of restoring IT systems after a major failure. The IMS DR runbook specifies an 8-step process with RTO ≤ 4 hours.

**Docker Compose**
The container orchestration tool used to run IMS services in development and staging environments.

---

## E

**Entity ID (SAML)**
A unique identifier for the SAML Service Provider. For the IMS: `https://{instance}.nexara.io/saml/metadata`.

**Event Taxonomy**
The classification system for audit log events. The IMS uses 5 categories (AUTH, DATA, ADMIN, INTEGRATION, SYSTEM) and 47 specific event types.

---

## F

**Feature Flag**
A configuration toggle that enables or disables a specific platform feature independently of code deployment. Used for gradual rollout and emergency disable.

**Full Backup**
A complete copy of the entire database. The IMS runs full pg_dump backups daily.

---

## G

**Grant Type (OAuth 2.0)**
The method by which an OAuth 2.0 client obtains an access token. Supported types: `authorization_code`, `client_credentials`.

**Group-to-Role Mapping**
A configuration that maps IdP groups (Azure AD, Okta) to IMS roles. Enables automatic role assignment during SCIM provisioning.

---

## H

**Hard Dependency (Module)**
A module activation dependency that is strictly required. A module cannot be activated until all hard dependencies are in `ACTIVE` state.

**HMAC-SHA256**
Hash-based Message Authentication Code using SHA-256. Used to sign webhook payloads so receivers can verify authenticity.

**HTTP 422 (Unprocessable Entity)**
An HTTP error response indicating the server understands the request but cannot process it due to semantic errors. Common in SCIM provisioning failures.

---

## I

**IdP (Identity Provider)**
A service that authenticates users and provides identity assertions to the IMS. Examples: Azure AD, Okta, Google Workspace, ADFS.

**Incremental Backup**
A backup containing only data changed since the last backup. The IMS runs schema-specific incremental backups every 4 hours.

**Integration Inventory**
The list of all active integrations (API keys, OAuth clients, SAML IdPs, webhooks). Should be audited quarterly.

---

## J

**JWT (JSON Web Token)**
A compact, URL-safe token format used for authentication in the IMS. Contains claims (user ID, roles, expiry) signed with a private key. Format: `header.payload.signature`.

---

## L

**Least Privilege**
A security principle stating that users should have only the minimum permissions required to perform their job. The basis of IMS RBAC design.

**Locale**
A language and regional formatting setting for a user's interface. Defaults to the organisation's configured locale if not specified per-user.

---

## M

**Major Update**
An IMS platform update that introduces breaking changes requiring migration or retraining. Requires 4 weeks' notice and may require co-delivery with Nexara training.

**Maintenance Window**
A scheduled period during which the IMS may be unavailable or degraded while updates or maintenance are performed. Must be communicated to users 24 hours in advance.

**MCQ (Multiple Choice Question)**
A question format with one correct answer from several options. Part A of the summative assessment contains 40 MCQ.

**Metadata (SAML)**
An XML document describing a SAML entity (IdP or SP). Exchanged between IdP and SP during SAML configuration to establish trust.

**Module Namespace**
A logical grouping of permissions for an IMS module or group of related modules. There are 17 namespaces in the IMS permission model.

**Module Registry**
The administrative interface listing all 44 IMS modules, their activation state, configuration, and dependencies.

---

## N

**Namespace (Permission)**
See *Module Namespace*.

**NPS (Net Promoter Score)**
A customer satisfaction metric. Post-course participant evaluation includes an NPS question.

---

## O

**OAuth 2.0**
An open authorisation framework that allows third-party applications to obtain limited access to the IMS on behalf of users or services.

**OrgAdmin**
Abbreviation for Organisation Administrator — the highest-privilege role within a single organisation's IMS deployment.

---

## P

**pg_dump**
The PostgreSQL command-line utility for creating database backups. The primary backup tool for the IMS.

**pg_restore**
The PostgreSQL command-line utility for restoring databases from pg_dump files.

**PITR (Point-in-Time Recovery)**
The ability to restore a database to any specific moment in time using WAL archive logs. Requires WAL archiving to be enabled.

**Permission Level**
One of 7 access tiers in the IMS RBAC model: None (0), View (1), Comment (2), Create (3), Edit (4), Delete (5), Admin (6).

**PKCE (Proof Key for Code Exchange)**
A security extension to the OAuth 2.0 Authorization Code flow that prevents authorisation code interception attacks. Required for browser-based OAuth clients.

**Predefined Role**
One of the 39 built-in IMS roles with default permission sets. Cannot be modified; use custom roles for variations.

**Provisioning**
The process of creating and configuring a user account. Manual provisioning is done by admins; automated provisioning uses SCIM.

---

## R

**RBAC (Role-Based Access Control)**
An access control model where permissions are assigned to roles, and users are assigned to roles. The IMS uses RBAC with 39 roles and 7 permission levels.

**Recovery Point Objective (RPO)**
The maximum acceptable amount of data loss measured in time. IMS RPO: ≤ 1 hour (4-hour incremental backup cycle).

**Recovery Time Objective (RTO)**
The maximum acceptable time to restore service after a failure. IMS RTO: ≤ 4 hours for full restore; ≤ 1 hour for schema-level restore.

**Role**
A named collection of permission settings. Users are assigned roles to grant access. The IMS has 39 predefined roles.

**Role Inheritance**
The cumulative grant of permissions when a user holds multiple roles. Most-permissive level wins per namespace.

**Rollback**
The process of reverting a platform update to the previous version. IMS rollback SLA: 30 minutes from incident confirmation.

**RPO / RTO** — See *Recovery Point Objective* / *Recovery Time Objective*.

---

## S

**SAML 2.0 (Security Assertion Markup Language)**
An XML-based open standard for exchanging authentication and authorisation data between an IdP and SP. Used for enterprise SSO to the IMS.

**SCIM 2.0 (System for Cross-domain Identity Management)**
An open standard protocol (RFC 7642-7644) for automating user provisioning between IdPs and service providers. The IMS supports SCIM 2.0 at `/scim/v2/`.

**Scope (API)**
A set of permissions granted to an API key or OAuth client. Examples: `read:all`, `write:incidents`, `admin:users`.

**SHA-256**
A cryptographic hash function producing a 256-bit output. Used in the IMS for backup integrity verification, audit log chaining, and webhook HMAC signing.

**SIEM (Security Information and Event Management)**
A system that aggregates and analyses security event data from multiple sources. The IMS can forward audit events to SIEMs via Syslog, webhook, or REST API.

**Soft Delete**
Marking a record as deleted in the database without physically removing it. The IMS uses soft delete with 90-day retention before hard purge.

**SP (Service Provider)**
The system that receives and processes SAML assertions. The IMS acts as the SP in SAML SSO configurations.

**SSO (Single Sign-On)**
An authentication method allowing users to access multiple systems with one login. The IMS supports SAML 2.0 SSO.

**Staging Environment**
A pre-production environment used to test updates before deploying to production. IMS updates must pass all automated tests and smoke tests on staging before production deployment.

---

## T

**Tamper-Evidence**
A property of the audit log whereby any modification to a past event can be detected through SHA-256 chain hash verification.

**Token Expiry**
The date/time after which an authentication token (JWT, API key, OAuth token) is no longer valid and must be renewed.

**Temporary Access Grant**
A time-limited role assignment that auto-revokes at expiry. Used for external auditors, contractors, and incident cover.

---

## U

**User Lifecycle**
The stages of a user account from creation to deletion: Pending → Active → Suspended/Inactive → Deleted.

**UUID (Universally Unique Identifier)**
A 128-bit identifier used to uniquely identify records in the IMS. Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.

---

## V

**WAL (Write-Ahead Log)**
PostgreSQL's mechanism for recording all database changes before they are applied, enabling crash recovery and point-in-time recovery.

**WAL Archiving**
Copying WAL files to offsite storage for point-in-time recovery. Enables RPO of ≤ 5 minutes when combined with base backups.

**Webhook**
An HTTP callback that the IMS uses to push event notifications to external endpoints in real time. Payloads are signed with HMAC-SHA256.

---

## Z

**Zero-Downtime Deployment**
An update strategy where the platform remains available to users throughout the update process. Used for all IMS patch and minor updates.

---

*This glossary covers terms introduced in the Nexara IMS Administrator Training Programme. For technical API documentation, see the IMS API Reference at `docs/API_REFERENCE.md`.*
