# Day 1 Formative Assessment

**Type**: Scored (feedback triggers)
**Questions**: 15
**Time**: 15 minutes
**Pass signal**: ≥ 70% (11/15) → "Advance" badge; < 70% → facilitator review note
**Feedback**: Instant per-question feedback in web portal; whole-group review in facilitated delivery

*Cover Modules 1–4. Individual work. No collaboration.*

---

**Q1.** A user's SCIM provisioning is failing with HTTP 409. What is the most likely cause?

a) The SCIM bearer token has expired
b) A user with the same email address already exists in the system
c) The IdP group is not mapped to an IMS role
d) The SCIM endpoint URL is incorrect

---

**Q2.** What IMS audit event would you look for to confirm that a user was deprovisioned via SCIM?

a) `USER_DELETED`
b) `AUTH_LOGOUT`
c) `SCIM_USER_DEACTIVATE`
d) `USER_UPDATED`

---

**Q3.** A new employee's invitation email expired before they accepted it. What is their account status and what action should the administrator take?

a) Status: Active — no action needed
b) Status: Pending — resend invitation
c) Status: Inactive — reactivate the account
d) Status: Deleted — create a new account

---

**Q4.** An HS Manager needs to temporarily cover the Quality Manager role for two weeks while the QM is on leave. What is the CORRECT approach?

a) Assign the QUALITY_MANAGER role permanently (remove when QM returns)
b) Give the HS Manager a DENY override on all other namespaces
c) Use a Temporary Access Grant expiring in 14 days
d) Create a combined HS+Quality custom role

---

**Q5.** In the IMS RBAC model, a user has Role A (health_safety: EDIT) and Role B (health_safety: VIEW). What is their effective permission level for the health_safety namespace?

a) VIEW (most restrictive)
b) EDIT (most permissive)
c) ADMIN (combined)
d) NONE (conflict)

---

**Q6.** Which statement about DENY overrides is correct?

a) DENY overrides are automatically removed after 24 hours
b) An explicit DENY at the user level overrides all role-granted permissions
c) DENY overrides must be approved by SUPER_ADMIN
d) DENY overrides only affect modules with ADMIN permission

---

**Q7.** Module A cannot be activated because "dependency not met". Where would you look to identify which dependency is missing?

a) Admin Console → Users → All Users
b) Admin Console → Module Registry → [Module A] → Dependencies tab
c) Admin Console → Audit Log → Filter: AUTH
d) Admin Console → Integrations → API Keys

---

**Q8.** An administrator accidentally activated Module X before its hard dependency Module Y. Module X is now in ERROR state. What is the correct sequence of actions?

a) Delete Module X and start over
b) Activate Module Y, then wait for Module X to auto-recover
c) Reset Module X to INACTIVE, activate Module Y, then re-activate Module X
d) Contact Nexara Support immediately

---

**Q9.** What is the difference between a "hard dependency" and a "soft dependency" in module activation?

a) Hard dependencies are permanent; soft dependencies can be removed later
b) Hard dependencies are strictly required; soft dependencies are recommended but optional
c) Hard dependencies are set by Nexara; soft dependencies are set by the administrator
d) There is no functional difference

---

**Q10.** You generate an API key for a third-party analytics tool. Which of the following is the BEST configuration?

a) Scopes: `read:all`, expiry: none, IP: unrestricted
b) Scopes: `read:analytics`, expiry: 90 days, IP: analytics server CIDR
c) Scopes: `admin:integrations`, expiry: 365 days, IP: unrestricted
d) Scopes: `write:all`, expiry: 30 days, IP: analytics server CIDR

---

**Q11.** During SAML SSO configuration, what is the ACS URL used for?

a) It identifies the IMS to the Identity Provider
b) It is the endpoint in the IMS where the IdP posts SAML assertions after authentication
c) It is the URL users are sent to after logout
d) It is the IdP's metadata URL

---

**Q12.** You receive a webhook payload. The `X-Nexara-Signature` header contains `sha256=a3f2b...`. How do you verify this?

a) Decode the base64 payload and check for a valid JSON structure
b) Compute HMAC-SHA256 of the raw request body using your webhook secret and compare
c) Send the signature to Nexara for validation via the API
d) Check the audit log for the corresponding `WEBHOOK_FIRED` event

---

**Q13.** A developer on your team asks for an API key to "do everything they need". What is the correct response?

a) Generate a key with `write:all` scope — it covers everything
b) Ask for specifics: which endpoints, which modules, what operations — then grant minimum required scopes
c) Refuse API access; use the admin console instead
d) Generate a key with `admin:integrations` scope

---

**Q14.** How often should API keys be rotated as a minimum best practice?

a) Every 30 days
b) Every 90 days
c) Annually (or when suspected compromised)
d) Never — only revoke when compromised

---

**Q15.** A webhook configured to send to `https://partner-system.io/nexara-events` has a 35% failure rate over the last 7 days. What should you do first?

a) Increase the retry attempts to 10
b) Delete the webhook and recreate it
c) Check the delivery logs for the HTTP response codes returned by the endpoint
d) Contact Nexara Support to investigate the webhook service

---

## Scoring

15 questions × 1 mark each = 15 marks total

| Score | Outcome |
|-------|---------|
| 11–15 (73%+) | ✅ Advance — strong foundation for Day 2 |
| 8–10 (53–67%) | ⚠️ Review note — facilitator will reinforce key areas |
| 0–7 (< 53%) | ❗ Additional support — facilitator 1:1 check-in during Day 2 break |

*Facilitator: See ANSWER-KEY.md for full answers and per-question explanations.*
