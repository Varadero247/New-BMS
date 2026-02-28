# Pre-Assessment — Nexara IMS Administrator Training

**Type**: Diagnostic (unscored)
**Questions**: 20
**Time**: 15 minutes
**Purpose**: Baseline knowledge map — results visible to facilitator only

*Instructions: Answer each question honestly. There is no pass or fail. Your answers help the facilitator tailor the programme to your needs.*

---

## Section A: Identity & Access Management (Q1–4)

**Q1.** What does SCIM stand for?

a) Secure Configuration and Identity Management
b) System for Cross-domain Identity Management
c) Standard Cloud Identity Mechanism
d) Structured Credential and Integration Model

---

**Q2.** Which of the following best describes "deprovisioning"?

a) Adding a user to a new system
b) Removing a user's access when they leave an organisation
c) Resetting a user's password
d) Granting temporary elevated access

---

**Q3.** In RBAC, what does "least privilege" mean?

a) Users should have the minimum permissions needed to do their job
b) Junior staff should have fewer permissions than senior staff
c) All users should have read-only access by default
d) Permissions should be granted manually for each action

---

**Q4.** What is a JWT?

a) A type of database backup
b) A JSON-formatted token used for authentication
c) A webhook delivery format
d) A SAML assertion type

---

## Section B: Role-Based Access Control (Q5–8)

**Q5.** In a permission model with 6 levels (None through Admin), can a user have EDIT permission without also having VIEW?

a) Yes, permissions are independent
b) No, permissions are cumulative
c) Yes, if an admin explicitly grants EDIT only
d) Depends on the module

---

**Q6.** What is the most secure practice when assigning admin roles?

a) Share one admin account across the IT team
b) Give all IT staff admin access for convenience
c) Assign named individual accounts with minimum required permissions
d) Rotate admin access weekly

---

**Q7.** If a user has two roles: Role A grants View to Module X, Role B grants Edit to Module X. What is their effective access?

a) View (most restrictive wins)
b) Edit (most permissive wins)
c) Neither (conflicting roles cancel each other)
d) Depends on which role was assigned first

---

**Q8.** What is a "DENY override" in access control?

a) A role that blocks all access to the system
b) An explicit denial that overrides any role-granted permission
c) A temporary suspension of a user account
d) A failed permission check logged in the audit trail

---

## Section C: Integration Basics (Q9–12)

**Q9.** What is the purpose of an API key?

a) To encrypt database backups
b) To authenticate programmatic access to an API
c) To configure SAML SSO
d) To sign audit log entries

---

**Q10.** In SAML SSO, what is the Identity Provider (IdP)?

a) The system receiving the SAML assertion (e.g., Nexara IMS)
b) The system authenticating the user and issuing the assertion (e.g., Azure AD)
c) The certificate authority that signs the SAML assertion
d) The user's browser

---

**Q11.** What is a webhook?

a) A scheduled database query
b) An HTTP callback that pushes event notifications to an external endpoint
c) A type of API key with limited scope
d) A SCIM provisioning trigger

---

**Q12.** HMAC-SHA256 in webhook signatures is used to:

a) Encrypt the webhook payload
b) Compress the payload for faster delivery
c) Verify that the payload was sent by the expected sender and was not tampered with
d) Generate a unique event ID

---

## Section D: Audit & Compliance (Q13–16)

**Q13.** Why is an "append-only" audit log important?

a) It makes the log faster to write
b) It means past events cannot be modified or deleted, providing tamper-evidence
c) It reduces storage costs
d) It allows events to be replayed

---

**Q14.** Which of these is an authentication event in an audit log?

a) User created a risk record
b) User exported a report
c) User logged in
d) User changed module configuration

---

**Q15.** For how many years should audit logs typically be retained under ISO 27001?

a) 1 year
b) 3 years
c) 5 years
d) 7 years

---

**Q16.** What does it mean to "forward audit events to a SIEM"?

a) Archive the audit log to cold storage
b) Send real-time audit events to a security monitoring platform for analysis
c) Export the audit log to a spreadsheet for manual review
d) Delete old audit events after processing

---

## Section E: Backup & Operations (Q17–20)

**Q17.** What is pg_dump?

a) A PostgreSQL tool for restoring databases
b) A PostgreSQL tool for creating database backups
c) A monitoring command for checking database health
d) A migration tool for schema changes

---

**Q18.** What is Recovery Point Objective (RPO)?

a) The maximum time to restore a system after a failure
b) The maximum acceptable amount of data loss measured in time
c) The percentage of data that must be recovered
d) The time between backups

---

**Q19.** Which of the following is a "breaking change" in a software update?

a) A bug fix that doesn't affect APIs
b) A performance improvement
c) A new feature that is disabled by default
d) A change that removes a feature or modifies an API in a way that breaks existing integrations

---

**Q20.** What is a "feature flag"?

a) A warning icon in the admin console
b) A configuration toggle that enables or disables a feature independently of code deployment
c) A security certificate for a specific feature
d) A user permission for experimental features

---

*Thank you for completing the pre-assessment. Your facilitator will use your responses to focus on the areas where the group needs the most support.*
