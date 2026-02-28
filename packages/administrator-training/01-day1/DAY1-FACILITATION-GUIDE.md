# Day 1 Facilitation Guide — Platform Foundations & User Governance

**For facilitators only. Do not distribute to participants.**

---

## Pre-Day Checklist

- [ ] Lab environment tested (all participant credentials working)
- [ ] Participant handbooks printed or digital access confirmed
- [ ] Quick-reference cards printed
- [ ] Assessment forms ready (portal or printed)
- [ ] Room/virtual room set up (projector, breakout rooms if virtual)
- [ ] Co-facilitator briefed (if applicable)
- [ ] Pre-assessment results mechanism ready (portal dashboard or manual tally)
- [ ] Timer visible to room

---

## 08:30–09:00 Welcome & Pre-Assessment

### Facilitator Script

"Good morning, everyone. Welcome to the Nexara IMS Administrator Training Programme. I'm [Name], and my role over these two days is to help you become confident, capable administrators of the Nexara platform. By Friday afternoon, you'll have a Nexara Certified Platform Administrator certificate — and more importantly, the knowledge to use it.

Before we dive in, a few housekeeping items: [fire exits, bathrooms, phones on silent, breaks, lunch].

Let's start with introductions. Go around the table — name, your role, and one thing you currently administer in your organisation. I'll start: [your intro]."

**[Round-table introductions — allow 1 minute per person max]**

"Brilliant. Now, to help me tailor the next two days, I'd like you to complete a short diagnostic questionnaire. This is completely unscored — it's not a test. It helps me understand where we're starting from so I can spend more time on the areas that matter most to you. 20 questions, 10 minutes."

**[Distribute pre-assessment / open portal assessment page]**

**[While participants complete — facilitator tallies response patterns]**

"Thank you. I'll refer to these results as we go through the day."

---

## 09:00–10:30 Module 1: User Management & SCIM

### Opening Hook

"Before I explain anything, let me show you something. [Open admin console.] I'm going to create a user from scratch in under 60 seconds. Watch what happens."

**[Live demo: create user, send invitation, show confirmation email preview]**

"Now — what questions does that raise? [Pause for responses.] Great. Those are exactly the questions we're going to answer in the next 90 minutes."

### Teaching Sequence

1. **User lifecycle states** (10 min): Use the whiteboard diagram from the module — draw it live, not from slides.
2. **Provisioning methods** (5 min): The four options; quick show of hands on what they currently use.
3. **SCIM 2.0 deep dive** (20 min): Walk through architecture; endpoint table; live demo of SCIM event log.
4. **LAB-01** (30 min): Circulate, observe, prompt (don't solve).
5. **Debrief** (15 min): Ask one person per table to share one thing they discovered or got wrong.

### Common Participant Questions

| Question | Answer |
|----------|--------|
| "What happens to a user's data when they're deleted?" | 90-day soft delete retention; then hard purge. GDPR erasure shortens to 30 days. |
| "Can we have shared admin accounts?" | Technically possible but strongly discouraged — audit trail becomes unusable. |
| "SCIM doesn't seem to work with our specific IdP" | Confirm SCIM 2.0 support in IdP; check attribute mapping; test with Postman first. |
| "How do we handle contractors with temporary access?" | Use the Temporary Access Grant feature; set explicit expiry date. |

---

## 10:45–12:15 Module 2: Roles & Permissions

### Opening Hook

"Hands up if anyone in your organisation has admin rights they probably shouldn't have anymore. [Usually everyone.] Exactly. Module 2 is about fixing that — systematically, defensibly, and permanently."

### Teaching Sequence

1. **39 roles overview** (15 min): Don't read the table. Use the question "If I gave every user ORG_ADMIN, what's the problem?" to open discussion.
2. **7 permission levels** (10 min): Draw the cumulative pyramid. Key insight: you can't have EDIT without CREATE, VIEW, COMMENT.
3. **Multi-role scenario** (10 min): "What happens when Alice has VIEWER on all namespaces AND HS_MANAGER? What are her effective permissions?" [Group answer — most permissive wins].
4. **LAB-02: Role matrix exercise** (25 min): Groups design a role matrix for a fictional 200-person manufacturing company. Provide the scenario brief (in LAB-02 file).
5. **Group presentations** (15 min): Each group presents their top 3 role decisions. Facilitator highlights tradeoffs.
6. **Least-privilege discussion** (15 min): Use real examples from participants' industries.

### Key Teaching Points

- The DENY override is powerful but creates invisible complexity — use sparingly and document every use.
- Super Admin should have max 2 holders in any organisation; ideally named backup account only.
- Custom roles must justify their existence in writing.

---

## 13:00–14:30 Module 3: Module Activation

### Re-energise Opening

"Right, phones down, laptops open. The first thing we're doing after lunch is activating a module. No slides yet — just do it. Open your admin console, go to Module Registry, find the Risk module, and let's activate it. Go."

**[LAB-03 Part 1 — immediate hands-on, 15 minutes]**

"Good. Now let's understand what just happened and why the sequence matters."

### Teaching Sequence

1. **Module registry overview** (10 min): Show the 44 modules in the console; categories.
2. **Dependency graph** (15 min): Draw the dependency chart on the whiteboard. Ask participants to identify which wave each module falls into.
3. **Activation states deep dive** (10 min): Live demo of an intentional activation failure (activate a dependent module before its parent).
4. **LAB-03 Part 2** (25 min): Configure 3 modules end-to-end.
5. **Activation troubleshooting walkthrough** (15 min): Walk through the audit log entry for an `ACTIVATION_FAILED` event.

---

## 14:45–16:15 Module 4: Integration Management

### Opening Hook

"Integrations are where administrators make the most expensive mistakes. A single overpermissioned API key with no expiry can sit in a SIEM alert backlog for six months. We're going to make sure that never happens in your organisation."

### Teaching Sequence

1. **API keys** (20 min): Scope table; live demo of key generation; show the audit log entry a key creates.
2. **OAuth 2.0** (20 min): Client credentials flow walk-through; live demo.
3. **SAML SSO** (20 min): Metadata exchange flow on whiteboard; focus on the attribute mapping gotchas.
4. **LAB-04** (25 min): API key lifecycle + webhook test.
5. **Integration audit** (5 min): Show the audit export and walk through the red flags.

### Common Mistakes to Highlight

- SAML attribute names differ between IdPs — always test with attribute mapping tool before go-live.
- Webhook secrets in plain text in environment files — use secrets manager.
- OAuth client secrets in URLs — always use Authorization header.

---

## 16:15–16:45 Day 1 Formative Assessment

### Administering the Assessment

"We're going to take 15 minutes for a short assessment covering today's content. 15 questions. This is scored — but the score is for your learning, not for judgment. If you score below 70%, that's genuinely useful feedback that tells us where to focus tomorrow."

**[Set timer for 15 minutes. Silence. No collaboration.]**

### Review Protocol

"Let's go through the answers. I'll read each question. If you answered correctly, stay quiet. If you answered incorrectly, raise your hand — that tells me where to spend more time tomorrow."

Work through all 15 questions. For any question where more than 2 participants got it wrong: "Good — this is exactly the kind of nuance that trips people up. Let me explain this differently."

---

## 16:45–17:00 Wrap-up & Day 2 Preview

"Today you built the foundation: users, permissions, modules, integrations. Tomorrow we go deeper into operations — audit logs, backups, and updates. These are the skills that protect your organisation's data.

Optional homework: read the Audit Log chapter in your participant handbook. See you at 08:30.

Any final questions? [Pause.] Great. See you tomorrow."

---

## Facilitator Debrief Notes (complete after Day 1)

- Pre-assessment results summary: [fill in]
- Lab difficulties observed: [fill in]
- Questions that indicate content gaps: [fill in]
- Participant energy/engagement notes: [fill in]
- Adjustments for Day 2: [fill in]
