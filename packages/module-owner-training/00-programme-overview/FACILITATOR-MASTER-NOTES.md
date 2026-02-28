# Module Owner Training — Facilitator Master Notes

*Read in full before delivering any of the five programmes. These notes apply to all days.*

---

## The Module Owner Mindset

Module owners are not system administrators — they do not configure users, activate modules, or manage integrations. They are operational professionals who need to trust the system to support their workflows, generate evidence for audits, and demonstrate compliance. Your job is to shift their mental model from "the system is IT's problem" to "the system is my evidence platform."

**Tone principle**: Treat participants as domain experts (they are). You are teaching them a tool, not their job. Ask questions, don't lecture. Use phrases like:

- "In your current process, where do you record this? Let's see how Nexara handles it."
- "What report would your auditor expect to see here? We'll generate that in the lab."
- "You already know the ISO requirement — here's where you prove you've met it."

**Avoid**: Talking about database schemas, API calls, or system architecture. If a participant asks how the system works internally, redirect: "Great question for your IT admin. For today, let's focus on what you can do with it."

---

## Audience Differences Across the Five Days

### Day A — Quality & NC (Most Analytical Group)
Quality managers and document controllers are typically rigorous and detail-oriented. They will probe edge cases ("What if a supplier NC doesn't fit any category?"). Prepare worked examples for ambiguous categorisations. Have an answer ready for ISO 9001 clause mapping questions — they will test your knowledge.

**Energy management**: High at the start (they are proud of their domain). Can dip after lunch during the reporting section — use the lab to re-energise.

### Day B — HSE (Most Emotionally Engaged Group)
HSE professionals take safety personally. Incident recording exercises can surface difficult real experiences. Acknowledge this: "We'll use a fictional scenario for the lab, but I know many of you have handled real incidents — that experience will make you very effective with this module." Never make incident scenarios feel trivial.

**Energy management**: Strong engagement throughout. The PTW section can feel procedural — keep it grounded with real-world consequences ("What happens if this step is skipped?").

### Day C — HR & Payroll (Most Privacy-Conscious Group)
HR professionals are acutely aware of GDPR and data sensitivity. They may initially resist recording employee data in a sandbox. Reassure them: "Sandbox data is entirely fictional and wiped weekly. We never use real employee data in training."

**Energy management**: Payroll section can feel dry. Use the audit trail walkthrough as a storytelling opportunity ("Here's how you'd prove to an auditor that payroll was processed correctly").

### Day D — Finance & Contracts (Most Process-Driven Group)
Finance and procurement professionals value precision and approval workflow integrity. They will ask about audit trails, approval logs, and what happens if someone bypasses the workflow. Have these answers ready.

**Energy management**: Contract lifecycle can feel repetitive (similar to HR lifecycle). Differentiate by focusing on the milestone alert and renewal pipeline — these are the "so what?" features that resonate.

### Day E — Advanced (Most Experienced Group)
Audit leads and management review secretaries typically have the most Nexara system exposure and the strongest understanding of ISO requirements. This group will challenge you on nuanced points. Lean into their experience: "How does this compare to how you currently manage your audit programme?"

**Energy management**: The management review section can feel abstract. Anchor it to the real output: "At the end of this, you're generating the pack that goes to the CEO. Let's make sure every input module is connected."

---

## Pacing Guidelines

### Morning Sessions (09:00–12:15)
- Keep content blocks to the scheduled 90 minutes. Start the first break on time — participants appreciate predictability.
- Use the last 10 minutes of each content block for questions and a "parking lot" for questions to address in the lab.
- Transition language: "We've covered [topic]. Before we break, let me set up what we'll do in the next block..."

### Afternoon Lab (14:30–15:45)
- The lab is the most important 75 minutes of the day. Participants who complete it correctly will pass the assessment.
- Walk through the first 2 steps together, then let participants work independently. Circulate and observe.
- Do not rescue participants too quickly — productive struggle deepens retention.
- If a participant finishes early, assign the extension task.
- 10 minutes before the end, debrief the lab questions as a group.

### Assessment Period (16:30–17:00)
- Participants take the 20 MCQ online (portal) or on paper. Timer: 30 minutes.
- Facilitator is quiet during the assessment but available for technical issues (not content questions).
- After submission, the portal shows immediate results. Facilitator confirms pass/fail and presents certificates to passing participants.
- For participants who do not pass: brief private conversation, register for retake. Do not announce results publicly.

---

## Common Facilitation Challenges

### "I already know how to do this in our old system"
Response: "Excellent — your domain knowledge will make this faster. The difference here is the evidence trail. Let me show you how Nexara timestamps and chains every action so you never have to rebuild your audit evidence from scratch."

### Participants completing lab steps incorrectly
Do not correct mid-step in front of the group. Wait for a natural pause, then ask: "What result did you get? Let's compare with the expected outcome." Use the difference as a learning point.

### Lab sandbox not loading or returning errors
Follow `08-delivery-guides/FACILITATION-TROUBLESHOOTING.md`. Have a pre-recorded screen capture of the lab walkthrough as a backup for each day.

### Assessment technology failure
If the online portal fails, switch to the printed paper version (always have 5 copies per group pre-printed). Mark manually using the answer key and issue certificates as normal.

### Time overrun
If a content block runs over, cut from the KPI dashboard section (15:45–16:30) — this content can be sent as a reference document. Never cut the lab or assessment. The lab is the learning, the assessment is the credential.

---

## Certification Ceremony

Keep it brief (5–10 minutes) but make it feel meaningful. Suggested script:

> "Before we close today, I want to recognise everyone who completed the assessment. [Name], you've earned the Nexara Certified Module Owner certificate in [programme]. This recognises your ability to manage [module group] in Nexara IMS to a certified standard. Congratulations."

Hand certificates individually. For group photos (client request), ensure consent is confirmed in advance.

For those who did not pass: issue a completion acknowledgement (attendance only) and confirm the retake process privately after the group has departed.
