# Day 1 Schedule — Platform Foundations & User Governance

**Day**: Day 1 of 2
**Theme**: Platform Foundations & User Governance
**Total Contact Hours**: 7.5 hours (08:30–17:00)

---

## Full Timetable

| Start | End | Duration | Session | Notes |
|-------|-----|----------|---------|-------|
| 08:30 | 09:00 | 30 min | **Welcome & Pre-Assessment** | Room open from 08:00; coffee/tea available |
| 09:00 | 10:30 | 90 min | **Module 1**: User Management & SCIM Provisioning | Highest energy block |
| 10:30 | 10:45 | 15 min | ☕ Morning Break | |
| 10:45 | 12:15 | 90 min | **Module 2**: Role & Permission Configuration | Core RBAC concepts |
| 12:15 | 13:00 | 45 min | 🍽️ Lunch | |
| 13:00 | 14:30 | 90 min | **Module 3**: Module Activation & Configuration | Post-lunch — start with hands-on lab |
| 14:30 | 14:45 | 15 min | ☕ Afternoon Break | |
| 14:45 | 16:15 | 90 min | **Module 4**: Integration Management | Procedural content |
| 16:15 | 16:45 | 30 min | **Day 1 Formative Assessment** (15 Q) + Review | Scored; feedback triggers |
| 16:45 | 17:00 | 15 min | Wrap-up & Day 2 Preview | End on positive note |

---

## Session Breakdowns

### 08:30–09:00 — Welcome & Pre-Assessment (30 min)

**Facilitator actions:**
- 08:30–08:40: Welcome, housekeeping (fire exits, bathrooms, phone policy, breaks)
- 08:40–08:50: Round-table introductions — name, role, one thing they administer today
- 08:50–09:05: Pre-assessment (20 Q, unscored, diagnostic) — via training portal or printed form
- 09:05–09:15: Review pre-assessment results (facilitator-only visibility) to identify emphasis areas

**Energy note**: People are fresh. The intro round-table warms the room. Pre-assessment should feel low-stakes ("help us understand where we're starting from").

---

### 09:00–10:30 — Module 1: User Management & SCIM Provisioning (90 min)

**Structure:**
| Time | Activity | Format |
|------|----------|--------|
| 09:00–09:15 | Live demo: Create a user in the admin console | Demo |
| 09:15–09:45 | SCIM 2.0 architecture and IdP integration | Presentation |
| 09:45–10:15 | **LAB-01**: User creation, bulk import, SCIM config | Hands-on |
| 10:15–10:30 | Debrief, common errors, Q&A | Discussion |

**Content focus**: User lifecycle states, SCIM endpoints, IdP integration (Azure AD, Okta), bulk CSV import, account governance.

**Energy note**: High energy. Start with demo — watching something real engages the group before abstract concepts.

---

### 10:30–10:45 — Morning Break

Encourage participants to keep the pre-assessment in mind as a benchmark. Ask them to think: "What do you wish you'd known before starting here today?"

---

### 10:45–12:15 — Module 2: Role & Permission Configuration (90 min)

**Structure:**
| Time | Activity | Format |
|------|----------|--------|
| 10:45–11:10 | 39 roles overview, permission level mechanics | Presentation |
| 11:10–11:30 | Role inheritance and conflict resolution | Interactive Q&A |
| 11:30–12:00 | **LAB-02**: Role matrix design exercise | Group exercise |
| 12:00–12:15 | Group presentations + facilitator feedback | Discussion |

**Content focus**: 39 predefined roles, 7 permission levels, 17 module namespaces, least-privilege principle, role inheritance.

**Energy note**: Group exercise at 11:30 breaks the presentation rhythm at the right moment. Allow groups to present — this is a key learning consolidation point.

---

### 12:15–13:00 — Lunch

**Facilitator:** Eat with the group if possible. Informal conversations often surface the most useful questions.

---

### 13:00–14:30 — Module 3: Module Activation & Configuration (90 min)

**Structure:**
| Time | Activity | Format |
|------|----------|--------|
| 13:00–13:20 | **LAB-03 (Part 1)**: Activate a module immediately on return | Hands-on (re-energiser) |
| 13:20–13:45 | Module registry, dependency graph, activation states | Presentation |
| 13:45–14:15 | **LAB-03 (Part 2)**: Configure 3 modules end-to-end | Hands-on |
| 14:15–14:30 | Activation troubleshooting walkthrough | Demo |

**Content focus**: 44 modules, activation dependencies, configuration parameters, activation failure diagnosis.

**Energy note**: Start with hands-on lab immediately — don't let the post-lunch dip settle. The physical act of navigating the console re-engages.

---

### 14:30–14:45 — Afternoon Break

**Facilitator:** Check in with any participants who looked uncertain during the morning. Brief 1:1 re-orientation if needed.

---

### 14:45–16:15 — Module 4: Integration Management (90 min)

**Structure:**
| Time | Activity | Format |
|------|----------|--------|
| 14:45–15:05 | API keys: generation, scopes, rotation, revocation | Presentation |
| 15:05–15:25 | OAuth 2.0 and SAML 2.0 SSO configuration | Presentation + demo |
| 15:25–15:55 | **LAB-04**: API key lifecycle + webhook test | Hands-on |
| 15:55–16:15 | Integration audit: expired credentials, over-scoping | Discussion |

**Content focus**: API key lifecycle, OAuth 2.0 client credentials, SAML 2.0 attribute mapping, webhook registration, HMAC-SHA256 verification, integration audit.

**Energy note**: Procedural content suits this slot well. Lab gives concrete success (webhook fires = immediate gratification).

---

### 16:15–16:45 — Day 1 Formative Assessment + Review (30 min)

**Structure:**
| Time | Activity |
|------|----------|
| 16:15–16:30 | 15-question formative assessment (individual, via portal or printed) |
| 16:30–16:45 | Whole-group review of answers; focus on questions most answered incorrectly |

**Scoring:**
- ≥ 70% → "Advance" badge in training portal
- < 70% → Facilitator flags for additional attention in Day 2; no stigma

**Energy note**: Keep the review energetic — treat incorrect answers as "great learning moments" not "failures."

---

### 16:45–17:00 — Wrap-up & Day 2 Preview (15 min)

**Facilitator script:**
- "Today we covered the foundational layer — users, permissions, modules, integrations."
- "Tomorrow we go operational — audit logs, backups, and updates. This is where you'll feel most like the administrator you're becoming."
- Homework (optional): Read the Audit Log chapter in the participant handbook.
- Confirm start time: 08:30 tomorrow.

---

## Materials Required (Day 1)

- [ ] Printed participant handbooks (or digital access to web portal)
- [ ] Printed quick-reference cards
- [ ] Lab environment access credentials (one set per participant)
- [ ] Pre-assessment forms (if not using web portal)
- [ ] Day 1 formative assessment forms (if not using web portal)
- [ ] Whiteboard markers (at least 4 colours)
- [ ] Sticky notes and pens (for group exercise)
- [ ] Timer (visible to room — for assessment)

---

## Facilitator Energy Notes Summary

| Slot | Energy Level | Approach |
|------|-------------|----------|
| 08:30–09:00 | Building | Social, low-stakes |
| 09:00–10:30 | High | Demo first, then concept |
| 10:45–12:15 | High-medium | Group exercise to sustain |
| 13:00–14:30 | Low → recovering | Hands-on immediately |
| 14:45–16:15 | Medium | Procedural, lab reward |
| 16:15–17:00 | Winding down | Clear, positive close |
