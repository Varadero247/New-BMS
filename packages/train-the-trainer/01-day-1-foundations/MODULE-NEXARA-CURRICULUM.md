# Module: Navigating the Nexara Curriculum

**Programme**: Nexara IMS Train-the-Trainer — Day 1
**Delivery time**: 13:00–14:15 (75 minutes)
**Bloom's level target**: Apply, Analyse

---

## Section 1: Curriculum File Structure — Guided Navigation

The Nexara training curriculum is organised in two primary source packages, both of which are handed over to certified internal trainers on programme completion. Understanding the structure of these packages is essential — you will use them every time you prepare a cohort.

### End User Training Package (`packages/end-user-training/`)

```
packages/end-user-training/
├── README.md                         # Programme overview, assessment criteria, delivery guidance
├── package.json                      # Package metadata
│
├── 00-programme-overview/            # Programme spec and learning objectives
├── 01-virtual-session/               # Live virtual delivery: Zoom/Teams; 4 hours; run by trainer
├── 02-elearning-modules/             # Self-paced e-learning: 6 modules; no trainer required
│   ├── MODULE-1-PLATFORM-OVERVIEW.md
│   ├── MODULE-2-INCIDENTS.md
│   ├── MODULE-3-TRAINING.md
│   ├── MODULE-4-PERMITS.md
│   ├── MODULE-5-OBSERVATIONS.md
│   └── MODULE-6-DASHBOARD.md
├── 03-assessment/                    # 20 MCQ assessment (participant-facing file)
│   └── ASSESSMENT.md
├── 04-answer-key/                    # FACILITATOR ONLY — do not share
│   └── ANSWER-KEY.md
└── 05-certificates/                  # Certificate spec and co-branding guide
```

**Key navigation rules**:
- `03-assessment/ASSESSMENT.md` is distributed to participants — questions and options only, no answers
- `04-answer-key/ANSWER-KEY.md` is **never** distributed to participants; you load it on the marking system only
- Module files are participant-facing content; you use them to prepare, not as slides
- `01-virtual-session/` contains your facilitation guide for live delivery; `02-elearning-modules/` is for self-paced delivery — different files, same content

---

### Module Owner Training Package (`packages/module-owner-training/`)

```
packages/module-owner-training/
├── README.md
├── 00-programme-overview/            # 5-day programme spec; facilitator master notes
├── 01-day-a-quality-nc/             # Quality & Non-Conformance programme (1 day)
│   ├── DAY-A-SCHEDULE.md
│   ├── DAY-A-FACILITATION-GUIDE.md
│   ├── MODULE-QUALITY-WORKFLOWS.md
│   ├── MODULE-NC-MANAGEMENT.md
│   ├── MODULE-CAPA-WORKFLOWS.md
│   ├── LAB-DAY-A.md
│   ├── ASSESSMENT-DAY-A.md          # Participant-facing (no answers)
│   └── ANSWER-KEY-DAY-A.md          # FACILITATOR ONLY
├── 02-day-b-hse/                    # Health, Safety & Environment programme
├── 03-day-c-hr-payroll/             # HR & Payroll programme
├── 04-day-d-finance-contracts/       # Finance & Contracts programme
├── 05-day-e-advanced/               # Audits, CAPA & Management Review programme
├── 06-participant-materials/         # Handbook, quick-reference cards, glossary
├── 07-certificates/                  # Certificate spec, co-branding guide, award criteria
└── 08-delivery-guides/              # Virtual and on-site delivery guides
```

**Key navigation rules**:
- Each `01-day-*` through `05-day-*` directory is a **complete, independent one-day programme** — you can deliver Day B without Day A
- The `FACILITATION-GUIDE.md` in each day directory is for the trainer only; do not distribute
- `ASSESSMENT-DAY-*.md` files are participant-facing; `ANSWER-KEY-DAY-*.md` files are facilitator-only
- `06-participant-materials/` contains the participant handbook — this IS distributed in print or digital form to all participants

---

## Section 2: Lab Logistics and Sandbox Access

### Nexara IMS Sandbox Environment

The Nexara IMS sandbox is a fully-functional instance of the platform pre-loaded with demonstration data. It is the primary learning tool for all Nexara training programmes — participants do not learn Nexara by watching screenshots; they learn by doing.

**Access credentials (standard training sandbox)**:

| Role | Username | Password |
|------|----------|---------|
| Admin (your account) | `admin@ims.local` | `admin123` |
| Participant accounts | `trainer.demo1@ims.local` through `trainer.demo8@ims.local` | `demo123` |
| Module owner demo | `moduleowner@ims.local` | `demo123` |
| Read-only observer | `observer@ims.local` | `demo123` |

**Important**: The sandbox is **reset weekly** (Sunday nights). Any data participants create during training will be lost after the weekend. This is by design — it means each cohort starts with clean demo data.

**Accessing the sandbox**:
- URL: provided in your T3 confirmation email (sandbox URL is cohort-specific)
- Participants access via browser on their own devices; no installation required
- Mobile browsers are supported but not recommended for training (screen too small for some modules)

### Pre-Session Sandbox Checklist

| Task | Timing | Responsibility |
|------|--------|---------------|
| Confirm sandbox URL is live | Day before | Trainer |
| Log in as admin and verify demo data is present | 60 min before session start | Trainer |
| Share participant login credentials | Start of session | Trainer |
| Confirm all participants can log in | First 10 min of first sandbox exercise | Trainer |
| Brief participants on sandbox limitations (resets weekly; no live data) | During lab setup | Trainer |

### Common Sandbox Issues and Solutions

| Issue | Likely Cause | Solution |
|-------|-------------|---------|
| Participant cannot log in | Wrong URL or password | Confirm credentials match the cohort email; reset password via admin console |
| Sandbox is loading slowly | Network congestion | Reduce simultaneous connections; use trainer screen for demonstration |
| Demo data is missing | Post-reset before reseed | Contact training@nexara.io immediately; use screenshots for that session |
| Module is not activated in sandbox | Sandbox configuration | Admin console → Modules → activate the required module |
| Participant cannot see a module | RBAC role not assigned | Admin console → Users → assign the module owner role to that user |

---

## Section 3: Customisation Limits

### What You May Customise

Nexara source materials are designed to be contextualised for your organisation. The following modifications are explicitly permitted:

| Element | Permitted Modifications |
|---------|------------------------|
| **Scenario names** | Replace "Acme Manufacturing" / "Delta Chemicals" with your organisation name in all lab scenarios |
| **Industry context** | Adjust industry references (e.g. "pharmaceutical regulations" → "food safety regulations" if appropriate) |
| **Local regulatory references** | Add country-specific regulation names to the Legal Register exercises (e.g. adding RIDDOR instead of generic "H&S regulations") |
| **Organisation-specific examples** | Add supplementary case studies drawn from your organisation's actual experience (must be clearly demarcated from Nexara source content) |
| **Glossary terms** | Add organisation-specific terminology to the participant glossary |
| **Assessment context** | Adjust scenario descriptions in MCQ questions to reflect your industry (question stem; answer options and correct answers may not be altered) |

**Process for customisation**:
1. Make a copy of the source file; prefix with your organisation code (e.g. `XYZ-MODULE-INCIDENTS.md`)
2. Document all changes in a change log at the top of the file
3. Never edit the Nexara source file directly — always work from a copy
4. Version your customised copy (v1.0, v1.1, etc.) independently of Nexara version numbers

---

### What You May NOT Customise

The following modifications are **prohibited**:

| Prohibited Change | Reason |
|------------------|--------|
| Altering MCQ correct answers | Assessment integrity — answer keys are controlled by Nexara |
| Removing Nexara logo or name from materials | IP and co-branding requirement |
| Removing the CPD credit declaration | CPD bodies require Nexara as the issuing body |
| Changing the pass threshold | Certification standard — threshold is set at the programme level by Nexara |
| Adding content that contradicts Nexara guidance | Creates misinformation risk; participants may receive incorrect information about the system |
| Translating materials into another language without Nexara approval | Nexara maintains quality control over translated versions |
| Delivering materials outside your licensed organisation | Licence scope violation |

**When in doubt**: Email training@nexara.io. The team will confirm within 2 business days whether a proposed change is within permitted scope.

---

## Section 4: Branding Rules

### The Co-Branding Zone

Every Nexara material template includes a **co-branding zone** — a designated area (typically top-right of slide templates; bottom of printed documents) where the client organisation may place their logo.

**Placement rules**:
- Client logo in the co-branding zone: ✓ permitted
- Client logo replacing the Nexara logo: ✗ prohibited
- Client logo larger than the Nexara logo: ✗ prohibited
- Client logo in the Nexara logo position: ✗ prohibited

### Programme Title Rules

| Format | Permitted? |
|--------|-----------|
| "Nexara IMS End User Training — Delivered by XYZ Corp L&D" | ✓ |
| "XYZ Corp Compliance Training — Powered by Nexara IMS" | ✓ |
| "XYZ Corp Compliance Academy End User Programme" (no Nexara mention) | ✗ |
| "XYZ Corp Nexara Training" (abbreviated; no full Nexara IMS reference) | ✗ |

### Certificate Branding

Participant certificates are generated by the Nexara Training Portal and always include:
- The programme title (e.g. "Nexara Platform Foundation — End User")
- The participant's name
- The issue date
- A Nexara certificate number (for verification)
- The Nexara logo (mandatory; cannot be removed)
- An optional co-brand field for the client organisation's name

Client organisations may **not** issue their own certificates for Nexara programmes. All certification must flow through the Training Portal.

---

## Section 5: Facilitator vs. Participant Materials — The Golden Rule

**The golden rule**: If a file contains the word "ANSWER-KEY" in its name, it is for the facilitator only and must never be shared with, printed for, or left accessible to participants.

| File Type | Audience | Distribution |
|-----------|----------|-------------|
| Module content files (e.g. `MODULE-INCIDENTS.md`) | Participants | Share in full |
| Schedule files (e.g. `DAY-A-SCHEDULE.md`) | Facilitator | Do not distribute |
| Facilitation guides (e.g. `DAY-A-FACILITATION-GUIDE.md`) | Facilitator | Do not distribute |
| Assessment files (e.g. `ASSESSMENT-DAY-A.md`) | Participants | Share questions only; no answers visible |
| Answer key files (e.g. `ANSWER-KEY-DAY-A.md`) | Facilitator only | Never distribute |
| Lab files (e.g. `LAB-DAY-A.md`) | Both | Share scenario; facilitator retains expected-outcome section |
| Participant handbook | Participants | Share in full |
| Observer checklists | Facilitator/assessor | Do not share with candidates before delivery assessment |

**Practical tip**: Keep two separate folders on your device — "Participant materials" (safe to share) and "Facilitator materials" (never share). Before any session, double-check you are sharing from the correct folder.

---

*Nexara IMS Train-the-Trainer — Module: Nexara Curriculum | Version 1.0 | February 2026*
