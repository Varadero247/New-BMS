# Slide Deck Outline — Module 1: User Management & SCIM Provisioning

**Slides**: ~30
**Duration**: 90 minutes (slides support 45 min; 45 min for demo + lab)

---

## Slide Structure

| # | Slide Title | Type | Key Content | Speaker Notes |
|---|-------------|------|-------------|---------------|
| 1 | Module 1: User Management & SCIM Provisioning | Title | Module number, duration, objectives preview | "Before I explain anything, let me show you something..." |
| 2 | Live Demo: Creating a User | Demo screenshot | Annotated admin console screenshot: New User form | Run live demo first; use slide as backup |
| 3 | The User Lifecycle | Diagram | 5-state flow diagram: Pending → Active ↔ Suspended → Inactive → Deleted | Animate state transitions |
| 4 | User Account States | Table | State / Description / Who can set it | Emphasise: Deactivation ≠ Deletion |
| 5 | Provisioning Methods | 2×2 grid | Manual (≤10) / CSV (10-500) / API batch (500+) / SCIM (ongoing) | "Which does your organisation use today?" |
| 6 | Manual User Creation | Screenshot | Admin console form annotated: required vs optional fields | Password is never set by admin |
| 7 | CSV Import: Field Mapping | Code block | CSV format with header row | Live in lab; slide = reference |
| 8 | CSV Import: Validation Preview | Screenshot | Error highlighting: EMAIL_DUPLICATE, ROLE_NOT_FOUND | Common errors table |
| 9 | What is SCIM 2.0? | Explainer | One-line definition; RFC references; benefits list | "Imagine 50 starters joining on the same day..." |
| 10 | SCIM Architecture | Diagram | IdP ← → SCIM endpoints ← → IMS User DB | Keep it simple; avoid RFC complexity |
| 11 | IMS SCIM Endpoints | Table | GET/POST/PUT/PATCH/DELETE on /scim/v2/Users | Highlight: DELETE = Inactive, not hard-delete |
| 12 | SCIM Authentication | Code block | Bearer token header example | Token location: Admin Console → Integrations → SCIM |
| 13 | Configuring Azure AD SCIM | Step list | 6-step numbered list with screenshots | Most common IdP; call out config gotchas |
| 14 | Configuring Okta SCIM | Step list | 5-step numbered list | Note: field name differences from Azure AD |
| 15 | SCIM Attribute Mapping | Table | SAML/SCIM attribute → IMS field | This is where most failures happen |
| 16 | SCIM Event Logs | Screenshot | Audit log filtered to INTEGRATION/SCIM | Live demo: navigate to audit log now |
| 17 | Common SCIM Log Events | Table | Event name / Description (8 events) | |
| 18 | SCIM HTTP Response Codes | Traffic-light table | 200/201 (green), 4xx (amber/red), 5xx (red) | |
| 19 | Diagnosing SCIM Failures | Flowchart | Failure → check log → identify code → remediation | Walk through 3 common failure scenarios |
| 20 | Group-to-Role Mapping | Table | IdP Group → IMS Role (4 examples) | Additive: multiple groups = all roles combined |
| 21 | User Governance: Naming Conventions | Bullet list | Email format; no generic accounts; service account registry | |
| 22 | Deprovisioning SLA | Timeline graphic | Leaver: 24h / Role change: 48h / Stale account: quarterly | |
| 23 | Quarterly Account Audit | Checklist | Export → HR cross-reference → deactivate → validate | |
| 24 | Module 1: Key Takeaways | Summary table | 6 rows: State / SCIM / Endpoints / Auth / Groups / Governance | |
| 25 | LAB-01 Instructions | Lab slide | Scenario brief; 3 parts; 30 minutes | Hand over to lab; facilitator circulates |
| 26–30 | [Appendix] SCIM 2.0 Spec Reference | Reference | RFC 7642, 7643, 7644 summaries; IMS-specific extensions | Reference only; not presented |

---

## Design Notes

- **Colour scheme**: Deep navy (`#0B1E38`) background, white text, gold (`#B8860B`) accents
- **Diagrams**: Use flowchart style with rounded rectangles; state machine diagrams for lifecycle
- **Code blocks**: Monospace font, dark background, syntax highlighted
- **Screenshots**: Use production-quality screenshots from the training sandbox; annotate with numbered callouts
- **Avoid**: Dense bullet lists; walls of text; reading the slides verbatim
