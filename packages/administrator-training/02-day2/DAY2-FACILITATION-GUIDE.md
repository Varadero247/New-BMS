# Day 2 Facilitation Guide — Operations, Security & Maintenance

**For facilitators only. Do not distribute to participants.**

---

## Pre-Day Checklist

- [ ] Summative assessment forms ready (portal or printed)
- [ ] Answer key printed and secure (FACILITATOR ONLY)
- [ ] Marking guide printed
- [ ] Certificates prepared (names pre-filled or portal-generated)
- [ ] Participant evaluation forms ready
- [ ] CPD certificate emails drafted and ready to send
- [ ] Post-training resource pack links confirmed
- [ ] Lab environments still accessible from Day 1
- [ ] Grafana / monitoring dashboard access (for Module 7 demo)

---

## 08:30–09:00 Day 1 Recap & Day 2 Objectives

### Opening

"Good morning. Before we start, I want to hear from you: what's one thing from yesterday that you've already thought about applying — or that you found yourself thinking about last night?"

**[Round-table — 1 sentence each. Don't linger. This is energising, not an extended debrief.]**

"Perfect. Let's do a quick knowledge check from yesterday. I'll ask questions — shout out the answers."

**Rapid-fire recap questions (verbal only):**
1. "What are the five user account states?" (Active, Inactive, Suspended, Pending, Deleted)
2. "How many predefined roles are in the IMS?" (39)
3. "What permission level do you need to delete a record?" (Level 5: DELETE)
4. "Name one hard dependency in module activation." (incidents requires health-safety, etc.)
5. "What does HMAC-SHA256 protect in webhooks?" (payload integrity / tamper detection)

**Assessment preview:**
"This afternoon at 14:15, you'll sit a 60-minute summative assessment. 40 multiple-choice questions, then 3 short scenario questions. I'll tell you more at 14:00. For now — let's build on yesterday."

---

## 09:00–10:30 Module 5: Audit Log Review

### Opening Hook

"I need a volunteer. Tell me: if I told you that someone in your organisation escalated their own privileges from Viewer to Super Admin at 11:47 PM last Tuesday — how would you find out who it was, what they accessed, and whether any data was compromised? [Pause.] By the end of this module, you'll be able to do exactly that in under 5 minutes."

### Teaching Sequence

1. **Audit architecture** (10 min): Draw the ingestion flow live. Emphasise: append-only, no admin can delete events.
2. **Event taxonomy** (10 min): Walk through the 5 categories; ask participants to classify 3 example scenarios.
3. **Live demo: filtering** (20 min):
   - "Find all failed logins in the last 24 hours"
   - "Find every action by user bob@example.com this week"
   - "Find all role assignments made by Super Admins"
4. **LAB-05: Mock incident investigation** (30 min): See LAB-05 for the full scenario brief.
5. **Debrief** (20 min): "What did you find? What was the smoking gun? Did everyone reach the same conclusion?"

### Facilitating LAB-05

The investigation scenario is intentionally layered:
- **Layer 1**: Obvious finding (the privilege escalation event)
- **Layer 2**: Context finding (the escalation enabled a data export)
- **Layer 3**: The suspicious entry (the IP address doesn't match)

Allow participants to discover these independently. Don't reveal Layer 2 or 3 in your instructions. During the debrief, ask: "Did anyone find something that surprised them?"

---

## 10:45–12:15 Module 6: Backup & Restore

### Opening

"You've already done the most important thing in backup management: activated SCIM and set up role governance. Those prevent disasters. Backup and restore is what you do when disaster happens anyway. Let's make sure you're ready."

### Teaching Sequence

1. **Backup architecture** (10 min): Three-level overview; RPO/RTO definitions.
2. **pg_dump live demo** (15 min): Run a backup live; show the checksum step; show how to verify.
3. **LAB-06** (35 min): Participants run a backup, verify integrity, and restore to a sandbox environment.
4. **DR runbook** (20 min): Walk through each step; ask "who in your organisation would do Step 4?" (surface gaps in responsibility).
5. **Q&A** (10 min).

### Key Teaching Points

- The most dangerous thing in backup management is **an unverified backup**. A file that looks complete may not restore correctly.
- Restore tests must be scheduled regularly. "We back up every day" is not the same as "we can restore."
- Two-person authorisation for production restores is non-negotiable. Establish this before you need it.

---

## 13:00–14:00 Module 7: Platform Updates

### Opening

"This module is 60 minutes because platform updates, done correctly, are boring. That's the goal. A calm, planned, monitored update is a good update."

### Teaching Sequence

1. **Update lifecycle and types** (15 min): Patch vs. minor vs. major. Ask: "Has anyone been through a major version update that went wrong? What happened?"
2. **Pre-update checklist** (15 min): Walk through all 12 points. Ask participants to identify which steps they don't currently do.
3. **LAB-07** (20 min): Update plan + rollback scenario exercise.
4. **Feature flags demo** (10 min): Live demo of enabling/disabling a flag; show audit log entry.

### Transition to Assessment

At 14:00:
"That wraps up Module 7 — and with it, all the technical content for the programme. You now have a 15-minute break. When you come back at 14:15, we'll go into the summative assessment. Here's what to expect: 40 multiple-choice questions (45 minutes, timed), then 3 short scenario questions (15 minutes). Everything you need is from these two days. No surprises. Take the break, clear your head, and I'll see you at 14:15."

---

## 14:15–15:15 Summative Assessment

### Administering Instructions (Read verbatim)

"Welcome back. The summative assessment has two parts:

Part A: 40 multiple-choice questions. You have 45 minutes. Work individually. No collaboration. [If portal:] Answer directly in the training portal. [If printed:] Write your answers on the answer sheet provided.

Part B: 3 scenario questions. You'll have the scenarios in front of you when Part A time is up. 15 minutes reading and writing time.

Your pass mark is 75%. A score of 90% or above is a Distinction.

You may not leave the room during the assessment. If you have a technical issue, raise your hand. Begin now — Part A."

**[Set timer. 45 minutes. Silence.]**

**[During Part A: facilitator begins marking Part A answer sheets as participants work on Part B, if printed. If portal: portal auto-marks Part A.]**

"Part A time. Put your pens down. [Pause.] Now turn to your Part B scenarios. You have 15 minutes."

**[During Part B: facilitator marks Part A using ANSWER-KEY.md if not auto-marked.]**

---

## 15:15–15:45 Debrief & Results

### Debrief (15 min)

"Let's go through Part A. I'll read each question number. If you got it right, stay quiet. If you got it wrong, raise your hand."

Work through all 40. For each question where more than 2 raise hands:
"Let me explain why the answer is [X]. The key insight here is..."

Focus extra time on the 5 most-missed questions.

### Announcing Results (15 min)

Mark Part B while participants complete the debrief self-review.

Announce results individually (pass a slip of paper to each participant, or call name + result to the room if participants consent).

**Format for group announcement:**
"[Name] — Nexara Certified Platform Administrator [with Distinction] / [Pass required] — congratulations."

---

## 15:45–16:15 Action Planning

**Facilitator prompt:**
"Before the ceremony, take 5 minutes. Write three things you will do in your organisation in the next 30 days as a direct result of this training. Be specific: not 'improve RBAC' but 'audit the SUPER_ADMIN role assignments and reduce to maximum 2 holders by March 15th.'"

**[5 minutes individual writing]**

**Round-table share:** Each participant shares their most important action.

**Facilitator captures on whiteboard and photographs the board.** (Share with participants via email if possible.)

**Next steps:**
- Certificate registration in Nexara Training Registry
- CPD certificate download from training portal
- Admin support: [support email]
- Changelog and release notes: Admin Console → Settings → Release Notes
- Return to training programme if colleagues need certification

---

## 16:15–16:30 Certificate Ceremony

Make it feel celebratory even if the group is small.

"It is my genuine pleasure to award the following certificates..."

[Call each participant's name. State their grade. Hand over certificate or display portal certificate on screen.]

"You came here on [Day 1 date] as platform users. You're leaving today as Nexara Certified Platform Administrators. What you've learned protects data, enables better decisions, and makes your organisation more resilient. Well done."

---

## Facilitator Post-Programme Checklist

- [ ] Complete facilitator debrief report (within 5 business days)
- [ ] Enter results in Nexara Training Registry
- [ ] Send CPD certificates to all participants
- [ ] Send feedback evaluation forms
- [ ] Note any content issues or outdated references for version update
- [ ] Share action plans (whiteboard photo) with participants
