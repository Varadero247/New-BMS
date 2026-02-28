# Slide Deck Outline — Module 4: Integration Management

**Slides**: ~30
**Duration**: 90 minutes

---

## Slide Structure

| # | Slide Title | Type | Key Content |
|---|-------------|------|-------------|
| 1 | Module 4: Integration Management | Title | "Where admins make the most expensive mistakes" |
| 2 | Integration Types Overview | 2×2 grid | API Keys / OAuth 2.0 / SAML SSO / Webhooks |
| 3 | API Keys: What Are They? | Explainer | Bearer token; programmatic access; scope-limited |
| 4 | API Key Configuration Fields | Form screenshot | Name / Scope / Expiry / IP Allow List / Rate Limit |
| 5 | Available API Scopes | Table | Scope / Permission (full scope table) |
| 6 | API Key Best Practices | Checklist | 5 rules; minimum scope; set expiry; IP restrict; named; rotation documented |
| 7 | API Key Lifecycle | Flow diagram | Generate → Active → (expiry/rotate) → Revoked |
| 8 | Key Rotation Procedure | Numbered steps | 5-step rotation without downtime |
| 9 | OAuth 2.0: Supported Flows | Comparison | Client Credentials vs Authorization Code + PKCE |
| 10 | Creating an OAuth Client | Screenshot | Admin console form: fields and values |
| 11 | OAuth Token Endpoints | Table | /authorize, /token, /userinfo, /revoke |
| 12 | Client Credentials Example | Code block | curl command; JSON response |
| 13 | SAML 2.0 Architecture | Diagram | User → IdP → Assertion → SP (IMS) → Session |
| 14 | SAML Configuration: Step 1 | Screenshot | SP metadata export from IMS admin console |
| 15 | SAML Configuration: Steps 2–3 | Screenshot | IdP application setup; ACS URL; Entity ID |
| 16 | SAML Attribute Mapping | Table | SAML attribute → IMS field (6 mappings) |
| 17 | SAML Configuration: Steps 4–6 | Screenshot | Upload IdP metadata; group mapping; test SSO |
| 18 | Common SAML Gotchas | Warning list | Attribute name differences between IdPs; metadata expiry; clock skew |
| 19 | Webhooks: What Are They? | Explainer | Real-time event push; HTTP POST; HMAC-signed |
| 20 | Creating a Webhook | Screenshot | Form: name / URL / events / secret / retry policy |
| 21 | Available Webhook Events | Category table | Users / Incidents / Audits / Risk / Platform events |
| 22 | Webhook Payload Format | Code block | JSON payload structure with all fields |
| 23 | HMAC-SHA256 Verification | Code block | Node.js verification example |
| 24 | Webhook Delivery & Retry | Timeline | 200 → DELIVERED; 5xx → retry 1min/5min/30min → FAILED |
| 25 | Test Fire | Screenshot | Webhook receiver log showing test payload |
| 26 | Integration Audit: What to Look For | Red flag table | Expired keys / over-scoped / inactive webhooks |
| 27 | Quarterly Integration Audit Process | Checklist | Export CSV → review each red flag → remediate |
| 28 | Module 4: Key Takeaways | Summary | 5 takeaways |
| 29 | LAB-04 Instructions | Lab slide | API key lifecycle + webhook test; 25 minutes |
| 30 | [Appendix] Security Standards Reference | Reference | OAuth 2.0 RFC 6749; SAML 2.0 OASIS; SCIM RFC 7644 |
