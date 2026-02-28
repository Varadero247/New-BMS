# Version Control Guide — Nexara Training Materials

**Programme**: Nexara IMS Train-the-Trainer (T3)
**Version**: 1.0
**For**: Certified internal trainers

---

## 1. Overview

Nexara releases updated training materials on a quarterly cycle. As a certified internal trainer, you are responsible for implementing these updates within your organisation — using the correct version of materials, retiring outdated versions, and triggering retro-training when required. This guide tells you exactly what to do when an update arrives.

---

## 2. Nexara Version Numbering

Nexara materials use a `MAJOR.MINOR` version numbering system:

| Version Change | What It Means | Example |
|---------------|--------------|---------|
| **Minor** (1.0 → 1.1) | Editorial improvements, additional examples, minor clarifications — no change to participant behaviour or assessment answers | Adding a worked example to a module section |
| **Major** (1.x → 2.0) | Significant content change — typically driven by a Nexara platform update or regulatory change that requires participants to act differently | New mandatory field added to incident form; assessment question bank revised |

**Rule**: Minor updates do not require retro-training. Major updates MAY require retro-training — the update notification email specifies clearly.

---

## 3. The Quarterly Update Cycle

Nexara releases on a fixed quarterly schedule:

| Quarter | Release Month | Notification |
|---------|-------------|-------------|
| Q1 | January | Last week of January |
| Q2 | April | Last week of April |
| Q3 | July | Last week of July |
| Q4 | October | Last week of October |

**Interim releases**: Nexara may release an unscheduled update outside the quarterly cycle if a critical platform change or regulatory change requires immediate action. Interim releases are marked "URGENT" in the subject line and always have an implementation deadline of 10 business days or fewer.

---

## 4. What a Version Update Email Contains

When a Nexara update is released, you receive an email from training@nexara.io with the following structure:

```
Subject: Nexara Training Materials Update — [Quarter] [Year] — [Minor/Major]

Version: [Previous version] → [New version]
Affected packages: [End User Training / Module Owner Training — Days X, Y / Both]
Change summary: [Plain-language description of what changed]
Retro-training required: [YES / NO]
If YES: Retro-training window: [X weeks from today]
Implementation deadline: [Date — all new cohorts must use new version by this date]
Download: [Secure link]

Changes by file:
- [Filename]: [What changed]
- [Filename]: [What changed]
```

---

## 5. Your Obligations on Receiving an Update

| Action | Deadline |
|--------|---------|
| Download the updated files | Within 3 business days of receiving the email |
| Review the change summary and understand what changed | Within 3 business days |
| Update your organisation's materials folder with the new version | Before the implementation deadline |
| Retire the old version (archive; do not delete) | Before the implementation deadline |
| Schedule retro-training sessions (if flagged) | Within the retro-training window specified |
| Confirm implementation to Nexara | Reply to the update email: "Confirmed — [Org Name] — updated [date]" |
| Update your customised copies to incorporate changes | Before first cohort using new version |

---

## 6. Implementing the Update in Your Materials Folder

### Folder Structure Recommended

```
/nexara-materials/
├── /current/                    # Always the latest Nexara version
│   ├── /end-user-training/      # Latest End User Training files
│   └── /module-owner-training/  # Latest Module Owner Training files
├── /archive/
│   ├── /v1.0/                   # Archived on version update
│   │   ├── /end-user-training/
│   │   └── /module-owner-training/
│   └── /v1.1/                   # Next archive, when v1.2 arrives
└── /customised/                 # Your organisation's customised copies
    ├── /[ORG]-end-user-training-v1.1.md  # Your customised version (based on Nexara 1.1)
    └── /[ORG]-module-owner-day-a-v1.1.md
```

**Process**:
1. Move all files from `/current/` to `/archive/v[old-version]/`
2. Unzip the new package into `/current/`
3. Update your customised copies to incorporate changes from the new version (see Section 7)
4. Do not deliver from `/archive/` going forward — always deliver from `/current/` or your customised copies based on current

### Retiring Old Versions

Old versions must be archived (not deleted) for at least 2 years. This preserves evidence for:
- Participants who completed training under an earlier version (can verify what they were trained on)
- Audit purposes (demonstrating that the correct version was in use at the time of each cohort)
- Dispute resolution (if a participant's knowledge gaps align with a known content deficiency in an earlier version)

---

## 7. Updating Your Customised Copies

When you have customised copies of Nexara source files and a Nexara update arrives:

**Step 1**: Open the update email and read the "Changes by file" section.

**Step 2**: For each changed file, compare the old Nexara version and the new Nexara version to identify the specific changes.

**Step 3**: Apply those changes to your customised copy:
- Content additions → add to your customised copy (after your supplementary content where relevant)
- Content corrections → update in your customised copy (check whether the correction affects any scenario descriptions you have modified)
- Assessment changes → if the assessment question bank has changed, update your participant-facing assessment file from the new source; do not attempt to merge manually — use the new source as the base and re-apply only your scenario name substitutions

**Step 4**: Update your version number and change log in the customised file:

```
**Your version**: v1.2 (based on Nexara v1.2; updated [date])
**Changes in this version**:
- Incorporated Nexara v1.2 changes: [describe from change summary]
- Retained organisation-specific additions: case study (Section 6), local regulatory references (Section 3)
```

**Step 5**: Verify that the updated customised file is correct before using it in your next cohort.

---

## 8. Retro-Training Protocol

### When Retro-Training Is Required

Retro-training is required when the update email explicitly flags it as "YES." This happens when:

- A new mandatory field has been added to the platform
- An existing field has been renamed in the UI (terminology mismatch)
- A process step has changed (e.g. NC classification workflow is different)
- A compliance requirement has been updated (e.g. new regulatory obligation)
- An assessment question bank has changed in a way that reflects a system behaviour change

### Planning Retro-Training

When retro-training is required:

1. **Identify the affected population**: Which previously certified participants need retro-training? This depends on which module changed.
   - End User update → retrain all End User certified participants
   - Module Owner Day B (HSE) update → retrain all Module Owner Day B certified participants
   - T3 material update → retrain all certified internal trainers (Nexara issues a refresher via the portal)

2. **Schedule retro-training sessions**: The update email specifies the retro-training window. Schedule all sessions to complete before the window closes.

3. **Retro-training format**: Retro-training is typically a short focused session (30–60 minutes), not a full programme repeat. You cover only the changed content. Nexara provides a "retro-training guide" for each flagged update — a summary of what changed and the specific slides/module sections to use.

4. **Record completion**: Mark retro-training completion in the Training Portal under the relevant participant's record. Submit to Nexara within 5 business days of completion.

### Retro-Training Scope Table

| Update type | Retro-training format | Duration |
|------------|----------------------|---------|
| New mandatory field (End User) | Focused session on affected module | 30 min |
| New mandatory field (Module Owner) | Focused session on affected day module | 45 min |
| UI terminology change | Briefing note + self-directed sandbox practice | 20 min self-paced |
| Process workflow change | Walkthrough session with sandbox | 45–60 min |
| Assessment question bank change | No retro-training required (future assessments only) | — |
| Full module content revision (major) | Repeat of the affected module only | 90 min |

---

## 9. Record Keeping

Maintain the following records for your version control activities:

| Record | Contents | Retention |
|--------|---------|----------|
| Version register (per update received) | Date received, version number, files updated, implementation date | 2 years |
| Retro-training records | Participant names, retro-training date, topic covered, attendance | 2 years |
| Cohort records per version | Which version was used for each cohort delivered | 2 years |
| Archive folder | Old Nexara source files and your old customised copies | 2 years |

---

*Nexara IMS Train-the-Trainer — Version Control Guide | Version 1.0 | February 2026*
