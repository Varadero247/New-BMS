# Day A — Facilitation Guide: Quality & Non-Conformance

*Full facilitator script with timing, transition cues, and Q&A management. Read alongside the schedule.*

---

## Pre-Session Setup (08:00–08:30)

- Log in to facilitator dashboard at `/admin` with facilitator credentials
- Verify sandbox data is loaded (Greenfield Manufacturing sample company should appear)
- Test screen share — ensure participants can see both the portal and your facilitator notes simultaneously if needed
- Set up parking lot (physical or digital)
- Confirm participant count and print any additional handbooks if needed

---

## 08:30 — Welcome

**Script**: "Good morning everyone and welcome to Day A of the Nexara Module Owner Training Programme — Quality and Non-Conformance. My name is [name] and I'll be your facilitator today. Before we get into the content, let's do a quick round of introductions — name, organisation, your role, and one quality challenge that takes up a disproportionate amount of your time. I'll start..."

[Complete facilitator introduction — 2 min]

[Round table — ~30 seconds per participant — total ~12 min for 14 participants]

**Script after introductions**: "Thank you — what strikes me is how many of you mentioned [most common theme from introductions — typically 'chasing people for closure' or 'preparing for audits']. Today we're going to address exactly that. By 17:00, you'll have a qualification that proves you can use Nexara's Quality module at a proficient level, and you'll have generated the kind of evidence package that makes audit preparation a matter of hours, not days. Let's look at the day."

[Screen: Day schedule slide or portal page]

---

## 09:00 — Content Block 1 Intro

**Transition script**: "The first thing we need to cover is how quality records are structured in Nexara — because every module we look at today depends on you understanding the reference number system, the audit trail, and the approval workflow. Once you understand these, everything else is intuitive."

[Deliver Section 1 of MODULE-QUALITY-WORKFLOWS.md — 20 min]

**Check-in question** (after record architecture): "Before we move on — does anyone already use a different reference number scheme in their current QMS? How does it compare to what we just looked at?"

[Deliver Section 2 — Document Control — 25 min]

**Common question**: "What happens if I upload the wrong version of a document?"
**Answer**: "The portal keeps all uploaded versions — you can navigate to the document version history. If the wrong version was approved in error, a SUPER_ADMIN can revoke the approval and return the document to Draft. This should be rare — always confirm the version before submitting for approval."

[Deliver Section 3 — Approval Workflows — 20 min]

[Deliver Section 4 — Quality KPIs intro — 15 min]

**Closing this block**: "We've covered the architecture of quality records, how documents flow through approval, and what your KPI dashboard tells you at a glance. Take 15 minutes — when you come back we'll spend 90 minutes on the part of the system that most quality managers live in: non-conformance management."

---

## 10:45 — Content Block 2 Intro

**Transition script**: "Non-conformance management is the heart of any quality management system — and it's the area where quality managers spend the most time. The challenge most systems have is that the record is easy to raise, but then it sits in someone's inbox and nothing happens. Nexara solves this through the approval workflow, the escalation engine, and — crucially — the system constraint that prevents closure without a linked, effective CAPA. Let's walk through the full lifecycle."

[Deliver MODULE-NC-MANAGEMENT.md — Sections 1–5]

**After Section 1 (NC creation)**: "Before I move on — any questions about categorisation? This is the most common place where quality managers tell me they second-guess themselves. The key rule is: category reflects the source, not the root cause."

**After Section 3 (CAPA linkage)**: "The reason I keep emphasising creating CAPA from within the NC is that it's the system's way of creating an auditable relationship between the problem and the solution. An auditor looking at your ISO 9001 clause 10.2 evidence needs to see that NC → investigation → root cause → CAPA → effective. That chain only exists if you use the system's built-in linkage."

**Closing this block**: "After lunch, we'll look at how all of this data turns into management insight and audit evidence. Then you'll put it all together in the lab."

---

## 13:00 — Content Block 3 Intro

**Transition script**: "This afternoon we shift from data entry to data output. Most of the time you spend in Nexara's Quality module is entering records and managing workflows. But the output — the reports, the KPI dashboard, the ISO evidence packages — is what demonstrates to your leadership and your auditors that the system is working. Let's look at those outputs."

[Deliver deep-dive KPI content — 25 min]

[Deliver report configuration — 25 min]

[Deliver ISO clause mapping — 15 min]

[Deliver ISO evidence package — 10 min]

---

## 14:30 — Lab Introduction

**Script**: "Now we put everything together. You're going to work through a realistic quality scenario — Greenfield Manufacturing, a Tier 1 automotive supplier with a customer complaint about dimensional non-conformances. You'll raise the NC, investigate it, create a CAPA, and generate an ISO evidence package. Steps 1 and 2, we'll do together. Then I'll ask you to work independently from Step 3 onwards. I'll circulate and observe — I won't answer content questions during the independent section, but I'm available if you hit a technical issue."

[Walk through Steps 1–2 on facilitator screen]

[Participants work independently Steps 3–7]

**During circulation, observe**:
- Is the CAPA being created from within the NC or standalone? (If standalone, gently redirect)
- Are participants completing the root cause category field or leaving it blank?
- Is the containment action being confused with the corrective action?

**5 minutes before end of lab**: "Let's pause and come back together for our three debrief questions."

---

## 16:30 — Assessment Transition

**Script**: "We've covered a full day's worth of quality module capability — from record creation through to ISO evidence packages. The last 30 minutes are your assessment — 20 questions, 30 minutes, 75% to pass. The portal timer starts as soon as you click Begin. Work through each question individually; you can review and change answers before submitting."

[Participants navigate to `/module-owner/quality-nc/assessment`]

[Facilitator is silent during assessment; available for technical issues only]

**After all submissions**: [Review results privately; announce passes publicly]

**Certificate script**: "I'm delighted to present [Name] with the Nexara Certified Module Owner certificate in Quality and Non-Conformance. This recognises your proficiency in managing non-conformances, CAPA workflows, and quality evidence generation in Nexara IMS. Congratulations."

---

## Q&A Management

| Common Question | Recommended Answer |
|----------------|-------------------|
| "Can we import NCs from our old system?" | "Yes — bulk import via CSV is available in Settings → Data Import. Your Nexara admin configures this. For today's training, we use the manual entry method." |
| "What if a supplier raises the NC themselves?" | "Suppliers with Portal access can raise NCs directly in the Supplier module. These are automatically linked to the relevant supplier record and appear in your Quality NC list with source = Supplier Report." |
| "Can we customise the NC categories?" | "Category labels are configurable by your administrator in Settings → Quality Configuration → NC Categories. The ISO mapping is linked to the default categories — custom categories require mapping setup. Talk to your admin." |
| "How do we handle NCs raised against us by our customer?" | "Record as source = Customer Complaint, detection point = Customer. The rest of the workflow is identical." |
