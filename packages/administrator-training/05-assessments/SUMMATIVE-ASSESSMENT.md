# Summative Assessment — Nexara IMS Administrator Training

**Type**: Scored — determines certificate grade
**Part A**: 40 MCQ (1 mark each) — 45 minutes timed
**Part B**: 3 scenario questions (5 marks each) — 15 minutes
**Total marks**: 55
**Pass threshold**: 75% (42 marks) — Nexara Certified Platform Administrator
**Distinction threshold**: 90% (50 marks) — with Distinction

*Individual work. No collaboration. No reference materials.*

---

# PART A — Multiple Choice (40 Questions, 45 minutes)

*Circle or select one answer per question.*

---

## User Management & SCIM (Q1–8)

**Q1.** What SCIM endpoint is used to create a new user?

a) GET `/scim/v2/Users`
b) POST `/scim/v2/Users`
c) PUT `/scim/v2/Users`
d) PATCH `/scim/v2/Users`

---

**Q2.** A user in "Pending" state has existed for 96 hours. What has likely happened?

a) They were manually deactivated
b) The invitation email expired (valid for 72 hours) and they never accepted
c) Their SCIM provisioning failed
d) Their account was soft-deleted

---

**Q3.** What is the maximum recommended validity period for a SCIM bearer token?

a) 30 days
b) 90 days
c) 365 days
d) Tokens should never expire

---

**Q4.** You receive a SCIM provisioning alert with HTTP 422 for a new user. The most likely cause is:

a) The SCIM token has expired
b) A required field is missing or contains an invalid value
c) The email already exists in the system
d) The IMS is temporarily unavailable

---

**Q5.** Which provisioning method is most appropriate for a company with 1,200 employees using Azure AD?

a) Manual creation via admin console
b) CSV bulk import
c) SCIM 2.0 auto-provisioning
d) API batch create script

---

**Q6.** A leaver deprovisioned via SCIM will have their account state changed to:

a) Deleted
b) Suspended
c) Inactive
d) Pending

---

**Q7.** Your SCIM configuration was working for 6 months. This morning, all new provisioning attempts fail with HTTP 401. What should you check first?

a) The SCIM endpoint URL
b) The SCIM bearer token (may have expired or been rotated)
c) The group-to-role mapping
d) The attribute mapping configuration

---

**Q8.** Which of the following is a security risk with shared admin accounts?

a) Shared accounts run faster than individual accounts
b) The audit trail cannot attribute actions to a specific person
c) Shared accounts cannot be assigned SCIM groups
d) Shared accounts bypass the rate limiter

---

## Roles & Permissions (Q9–16)

**Q9.** How many predefined roles exist in the Nexara IMS?

a) 17
b) 28
c) 39
d) 44

---

**Q10.** A user needs to view records in the health_safety namespace but must never be able to create, edit, or delete them. Which permission level should they have?

a) NONE (0)
b) VIEW (1)
c) COMMENT (2)
d) CREATE (3)

---

**Q11.** The AUDITOR role grants which of the following?

a) ADMIN on the compliance namespace only
b) VIEW on all 17 namespaces plus audit log export rights
c) EDIT on all namespaces except platform
d) ADMIN on the audit namespace only

---

**Q12.** A SUPER_ADMIN has what scope of access?

a) All modules within a single organisation
b) The platform namespace only
c) All organisations, all modules, all operations
d) All modules within all organisations (read-only)

---

**Q13.** When should a custom role be created instead of using a predefined role?

a) Whenever a new employee joins
b) Only when no predefined role provides the exact permission combination required and the use case is justified
c) For all contractor and external users
d) When SUPER_ADMIN decides a new role is needed

---

**Q14.** A user has Role A (finance: EDIT, hr: VIEW) and Role B (finance: VIEW, hr: ADMIN). What are their effective permissions?

a) finance: VIEW, hr: VIEW
b) finance: EDIT, hr: ADMIN
c) finance: ADMIN, hr: ADMIN
d) finance: EDIT, hr: VIEW

---

**Q15.** Temporary Access Grants are automatically:

a) Promoted to permanent roles after 30 days
b) Revoked at the specified expiry time
c) Logged only when manually revoked
d) Applied to all users in the same department

---

**Q16.** When conducting a quarterly least-privilege audit, which finding is the highest severity?

a) 3 users with COMMENT permission on the quality namespace
b) SUPER_ADMIN assigned to 6 users including junior IT staff
c) A contractor with VIEW access to inventory records
d) A module admin with EDIT on their own module

---

## Module Activation (Q17–22)

**Q17.** A module in ERROR state means:

a) The module was activated incorrectly and must be deleted
b) Activation failed partway through; the module is in a partial state requiring intervention
c) The module's license has expired
d) The module is updating

---

**Q18.** Which module has a hard dependency on the HR module?

a) Risk Register
b) Payroll
c) Audit Management
d) Document Control

---

**Q19.** In a Wave 1 (Foundation) activation, which modules are included?

a) Modules with hard dependencies on other modules
b) Portal and sector-specific modules
c) Modules with no activation dependencies
d) The most recently released modules

---

**Q20.** An administrator attempts to activate the Incidents module before Health & Safety. What happens?

a) Incidents activates but without incident categorisation
b) Incidents fails with a DEPENDENCY_NOT_MET error
c) Health & Safety is automatically activated first
d) Both modules activate together

---

**Q21.** Module data in ARCHIVED state is:

a) Permanently deleted after 90 days
b) Accessible to all users in read-only format
c) Preserved but inaccessible until restored; readable by admins only
d) Moved to cold storage but deletable on demand

---

**Q22.** How long does a typical IMS module activation take?

a) 1–5 seconds
b) 30–120 seconds
c) 5–10 minutes
d) 1 hour

---

## Integration Management (Q23–28)

**Q23.** Which OAuth 2.0 grant type is appropriate for a server-to-server integration with no user interaction?

a) Authorization Code
b) Implicit
c) Client Credentials
d) Device Code

---

**Q24.** In SAML SSO configuration, what is the Entity ID?

a) The SAML assertion's unique identifier
b) A unique identifier for the Service Provider (IMS instance) used in metadata
c) The user's employee ID in the IdP
d) The session identifier assigned after authentication

---

**Q25.** An API key with scope `read:incidents write:all` violates which best practice?

a) Keys should not combine read and write scopes
b) Keys should use the minimum required scopes (write:all is over-privileged)
c) Keys should not include module-specific scopes
d) This configuration is acceptable for data integration keys

---

**Q26.** A webhook delivery fails with HTTP 500. According to the IMS retry policy, what happens next?

a) The delivery is marked FAILED immediately
b) The IMS retries after 1 minute, then 5 minutes, then 30 minutes
c) The IMS retries every 5 minutes for 24 hours
d) An admin receives an email and manually retries

---

**Q27.** The `X-Nexara-Signature` header on a webhook delivery contains `sha256=abc123...`. What does `sha256=` prefix indicate?

a) The payload is encrypted with AES-256
b) The signature was computed using HMAC-SHA256
c) The payload format is JSON Schema v256
d) The delivery uses SHA-256 TLS certificate

---

**Q28.** You are auditing integrations and find an API key created 14 months ago with no expiry date and scope `admin:users`. The creating developer left the company 3 months ago. What is the correct action?

a) Leave it — it's working and changing it might break something
b) Reduce the scope to read-only
c) Immediately revoke the key; audit what it was used for; generate a replacement with proper configuration if still needed
d) Set an expiry date of 30 days from now

---

## Audit Log Review (Q29–34)

**Q29.** An audit event with category `ADMIN` and action `ROLE_ASSIGNED` means:

a) A user successfully logged in with admin privileges
b) An administrator granted a role to a user
c) A role was created in the system
d) A module admin activated a new module

---

**Q30.** The IMS audit log uses chained SHA-256 hashing. This means:

a) All events are encrypted using SHA-256
b) Modifying any past event would invalidate the hash of all subsequent events, making tampering detectable
c) The audit log cannot be exported until all hashes are verified
d) Only SUPER_ADMIN can read the hash values

---

**Q31.** You need to identify all actions taken by a specific user over the last 30 days. Which audit log filters should you apply?

a) Category = AUTH, Date range = last 30 days
b) Actor = [user email], Date range = last 30 days
c) Outcome = SUCCESS, Actor = [user email]
d) Event type = DATA_EXPORTED, Actor = [user email]

---

**Q32.** An audit event with outcome `FAILURE` indicates:

a) The IMS encountered a server error
b) The action was attempted but did not complete successfully (e.g., access denied, validation error)
c) The user was locked out of the system
d) The event was recorded but the underlying operation was rolled back

---

**Q33.** For ISO 27001 compliance, which audit log export would you use to demonstrate all privileged access changes over the past year?

a) Category = DATA, Date range = last year
b) Category = ADMIN, Event types = ROLE_ASSIGNED, ROLE_REMOVED, PERMISSION_OVERRIDE
c) Category = AUTH, Event types = AUTH_LOGIN_SUCCESS
d) Category = INTEGRATION, Date range = last year

---

**Q34.** The audit log integrity verification returns a "chain broken" error for events between 14:00 and 14:30 on a specific date. What does this indicate?

a) The audit service was unavailable during that window
b) One or more events in that window were modified or deleted after being written
c) Events are stored in batches and the batch boundary is at 14:00
d) The hash algorithm was changed during that window

---

## Backup & Restore (Q35–38)

**Q35.** What is the purpose of `--format=custom` in a pg_dump command?

a) Dumps only the custom schemas in the database
b) Creates a binary, compressed, parallel-restorable backup file
c) Exports the database in a human-readable SQL format
d) Enables custom retention policies

---

**Q36.** After running a backup, you run `sha256sum --check ims_backup.sha256` and it fails. What should you do?

a) Use the backup anyway — checksum failures are usually false positives
b) Do not use this backup; investigate storage corruption; run a fresh backup immediately
c) Re-run sha256sum with the `--ignore-errors` flag
d) Restore the backup to verify it works

---

**Q37.** What is the Recovery Time Objective (RTO) for the IMS?

a) ≤ 5 minutes (with WAL archiving)
b) ≤ 1 hour for schema-level restore; ≤ 4 hours for full restore
c) ≤ 24 hours regardless of restore type
d) ≤ 30 minutes (matching the rollback SLA)

---

**Q38.** In the DR runbook, dual authorisation (two named administrators) is required for:

a) All backup jobs
b) All restore operations regardless of environment
c) Production environment restores only
d) Restore operations that exceed 10GB

---

## Platform Updates (Q39–40)

**Q39.** A platform update is automatically rolled back if:

a) Any user reports an error within 1 hour
b) The health check fails 3 consecutive times or error rate exceeds 5% for 2 consecutive minutes
c) The update takes longer than 60 minutes to complete
d) Any Grafana alert fires during the update window

---

**Q40.** A feature flag set to 50% rollout means:

a) The feature is 50% complete
b) 50% of the feature's functionality is enabled
c) 50% of eligible users see the new feature; 50% see the old behaviour
d) The feature will be fully released in 50 days

---

# PART B — Scenario Questions (3 Scenarios, 15 minutes)

*Write your answers in the space provided. 5 marks per scenario.*

---

## Scenario A: SCIM Outage (5 marks)

**Situation**: Your company uses Azure AD SCIM provisioning. This morning, the HR team reports that 12 new starters hired yesterday have not appeared in the IMS. The HR team confirms they were added to the `IMS-NewStarters` Azure AD group yesterday afternoon.

**Your task**: Diagnose the outage and outline the remediation steps.

**Marking criteria** (1 mark each):
1. Identifies the correct first diagnostic step (check IMS audit log for SCIM events)
2. Identifies the SCIM token as a likely cause of 401 failures (or identifies another plausible HTTP error code with correct explanation)
3. Describes how to verify the IdP connectivity from the Azure AD side
4. Outlines the correct remediation for the root cause identified
5. Describes how to provision the 12 affected users without waiting for the next automated cycle

*Write your answer here:*

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

## Scenario B: Privilege Escalation (5 marks)

**Situation**: Your SIEM fires an alert at 11:47 PM: "User `karen.booth@meridian.io` (Quality Manager) performed an HR data export containing 189 employee records. Karen's role is QUALITY_MANAGER which has no HR namespace access."

**Your task**: Investigate using audit log data (you can reference the event taxonomy) and outline the containment response.

**Marking criteria** (1 mark each):
1. Correctly identifies the audit events that would reveal how Karen gained HR access (ROLE_ASSIGNED or PERMISSION_OVERRIDE)
2. Determines whether this is a compromised account or insider action (and explains what evidence would distinguish them)
3. Lists the immediate containment steps (in correct priority order)
4. Identifies the data protection obligation triggered (GDPR: HR records = personal data; 72-hour notification window)
5. Describes the post-incident review actions

*Write your answer here:*

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

## Scenario C: Failed Update Rollback (5 marks)

**Situation**: You applied IMS v2.16.0 at 09:00 today. At 09:34, monitoring shows the health check returning DEGRADED on 2 of 3 pods, and the error rate has climbed to 6.2%. The auto-rollback did not trigger. It is now 09:36.

**Your task**: Execute the recovery within the 30-minute SLA.

**Marking criteria** (1 mark each):
1. Correct priority of first action (declare incident in change management + notify stakeholders)
2. Correctly identifies that auto-rollback did not trigger and manual intervention is required (and why the threshold may have been missed)
3. Lists the exact steps to initiate a manual rollback
4. Describes the post-rollback validation steps
5. Describes the post-mortem requirements and timeline

*Write your answer here:*

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

*End of assessment. Please hand your completed paper to the facilitator.*
*Results will be announced within 30 minutes.*
