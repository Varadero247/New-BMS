# Module: CAPA Workflows & Root Cause Analysis

**Programme**: Day E — Audits, CAPA & Management Review | **IMS Modules**: Quality → CAPA (port 3003 / API 4003)
**Delivery time**: Content Block 2 (see schedule)

---

## Section 1: CAPA in the Advanced Context

In the Day A training, CAPA was introduced as the corrective action partner of the NC record in the Quality module. In the advanced context, CAPA is a cross-module function: a corrective (or preventive) action record can originate from any part of the management system and must be managed collectively to give senior management — and auditors — an accurate picture of the organisation's improvement activities.

### Multi-Source CAPA Management

CAPA records in Nexara can be created from the following source types:

| Source | Originating Module | Example |
|--------|--------------------|---------|
| `NC` | Quality → Non-Conformances | Product defect requiring root cause investigation |
| `AUDIT_FINDING` | Audits → Findings | Major NC from an internal or external audit |
| `MANAGEMENT_REVIEW_OUTPUT` | Management Review → Output Actions | Strategic gap identified at board level |
| `REGULATORY_NOTICE` | Reg Monitor | Regulator notification of a compliance requirement |
| `CUSTOMER_COMPLAINT` | CRM / Complaints | Customer-reported failure requiring investigation |
| `INCIDENT` | H&S → Incidents | Safety incident investigation CAPA |

### All-Sources CAPA View

Navigate to **Quality → CAPA → All CAPAs**. The default view shows all CAPA records across all source types. Filter options:
- `source`: Select one or multiple source types
- `status`: Open / In Progress / Pending Review / Effective / Ineffective / Closed
- `responsibleOwner`: Filter to a specific user or team
- `overdueOnly`: Show only CAPAs past their due date

This single view is the key tool for the QMS Manager reporting on the organisation's corrective action performance to senior management or a certification body. A certified organisation with 40 open CAPAs — spread across quality, HSE, and audit findings — must be able to demonstrate through this view that all are being actively managed.

---

## Section 2: Root Cause Analysis Techniques

Nexara implements three root cause analysis techniques within the CAPA record. The technique selection field appears when the CAPA status is changed from Open to In Progress: **Root Cause Analysis Method** → 5-Why / Fishbone / Fault Tree.

The choice of technique should be driven by the nature of the finding, not by familiarity or convenience. The worked examples below demonstrate when each technique is most appropriate.

### Technique 1: 5-Why

The 5-Why technique uses sequential questioning to drill through symptoms to root cause. Each "Why?" builds on the answer to the previous one until the fundamental cause is identified — typically at the fifth level.

**When to use**: Linear, sequential cause-and-effect chains. Single-process failures. Straightforward NCs where the chain of causation is clear.

**In Nexara**: CAPA → Root Cause Analysis → Method: 5-Why. Five fields appear, labelled Why 1 through Why 5. Each field must be completed before the system permits "Root cause confirmed" status. This enforces the full depth of analysis rather than allowing practitioners to stop at the first convenient answer.

**Worked example** — Major NC: Audit finding against ISO 9001 clause 8.7 (incomplete NC records):

- Why 1: Why were NC records found to be incomplete? → Because the description and root cause fields were left blank on 12 of 18 NC records reviewed.
- Why 2: Why were these fields left blank? → Because production supervisors who raise NC records are not completing all mandatory fields.
- Why 3: Why are production supervisors not completing all mandatory fields? → Because the NC record template does not enforce completion of description and root cause fields before saving.
- Why 4: Why does the template not enforce completion? → Because when the system was configured, mandatory field validation was not activated for description and root cause.
- Why 5: Why was mandatory field validation not activated? → Because the system configuration was completed by IT without input from the Quality team; no QMS requirements were specified for the configuration.
- **Root cause confirmed**: System configuration gap — mandatory field validation for NC records was not specified by the Quality team during system setup.

**Common mistake**: Stopping at Why 2 or Why 3 (e.g., concluding "root cause = production supervisors not filling in forms"). This is a symptom, not a root cause. Stopping here leads to corrective actions like "remind supervisors to fill in forms" — which produces temporary improvement followed by recurrence. The true root cause (system configuration gap) leads to a permanent corrective action (activate mandatory field validation) that prevents the issue by design.

### Technique 2: Fishbone (Ishikawa)

The fishbone technique maps multiple contributing causes to a central effect (the problem statement) across six standard categories. It is used when a problem has multiple contributing causes from different domains.

**When to use**: Complex problems with multiple simultaneous contributing causes. HSE incidents where Man, Machine, Method, Material, Measurement, and Environment all contribute. Any situation where the 5-Why approach would produce multiple parallel chains.

**In Nexara**: CAPA → Root Cause Analysis → Method: Fishbone. A grid appears with six category branches. For each category, multiple cause entries can be added. When causes are entered, the system generates a visual fishbone diagram that can be exported as a PDF for the CAPA record and audit evidence.

**Six categories**:

| Category | What to consider |
|----------|-----------------|
| **Man** | Human factors: skills, training, supervision, fatigue, distraction |
| **Machine** | Equipment: condition, calibration, maintenance, design |
| **Method** | Process design: procedures, work instructions, sequence, standards |
| **Material** | Inputs: raw materials, components, specifications, supplier quality |
| **Measurement** | Measurement systems: instrument accuracy, sampling frequency, inspection criteria |
| **Environment** | Conditions: temperature, lighting, noise, contamination, workspace layout |

**Worked example** — HSE incident: A maintenance technician suffered a minor laceration while using an angle grinder without cut-resistant gloves:
- Man: Technician had not attended refresher PPE training (last training 18 months ago; required annually)
- Machine: Angle grinder disc guard missing — disc guard removed to access confined space and not refitted
- Method: Work permit did not specifically require PPE check for grinder use; generic PPE requirement only
- Material: Cut-resistant gloves of the required grade not stocked in the maintenance workshop
- Measurement: No pre-task PPE inspection step in the job safety analysis
- Environment: Confined workspace required disc guard removal; no alternative tooling available for confined space grinding

This multi-cause landscape is not amenable to a 5-Why analysis — it would require six parallel chains. The fishbone produces a complete picture that drives a multi-action CAPA addressing all six categories.

### Technique 3: Fault Tree

The fault tree technique begins with the top-level undesired event and works downward through intermediate events to basic causes, using logic gates to model how combinations of events lead to the top-level failure.

**When to use**: Complex, safety-critical failures where the exact combination of conditions that caused the event must be understood. Scenarios where some causes are necessary but not sufficient alone (AND gates) and where any one of several causes is sufficient (OR gates). Aerospace, medical device, and nuclear industry applications. Post-accident analysis where the sequence of events must be precisely reconstructed.

**In Nexara**: CAPA → Root Cause Analysis → Method: Fault Tree. A visual builder allows the user to define the top event, add intermediate events, and connect them with AND or OR gates. The system generates a fault tree diagram. Basic events at the bottom of the tree are the root causes that corrective actions must address.

**AND gate**: Both (or all) contributing events must occur simultaneously for the parent event to occur. Example: (No disc guard fitted) AND (no PPE worn) → grinding injury.

**OR gate**: Any one of the contributing events is sufficient to cause the parent event. Example: (Incorrect material grade) OR (batch contamination) OR (dimension out of tolerance) → product NC.

**When not to use**: Simple, linear cause-and-effect chains — use 5-Why instead. General operations failures without safety-critical implications — fishbone is more practical.

---

## Section 3: Action Planning

SMART criteria enforcement ensures that corrective actions are substantive and trackable, not vague commitments that are difficult to verify at the effectiveness review.

### SMART Validation in Nexara

Each corrective action on a CAPA record must pass SMART validation before the action can be saved. The system enforces:

| SMART Element | Field | System validation |
|--------------|-------|------------------|
| **Specific** | `actionDescription` | Minimum 50 characters; free text description of exactly what will be done |
| **Measurable** | `successCriteria` | Minimum 30 characters; describes what evidence will confirm the action is complete |
| **Assignable** | `actionOwner` | Must be a named user (not a role or department) |
| **Realistic** | `dueDate` | Must be a future date; must be before `effectivenessReviewDate` |
| **Time-bound** | `dueDate` | Required field — no open-ended actions permitted |

**Common mistake**: Writing "Update the procedure" as an action description (6 words; fails Specific validation) and "Updated" as success criteria (7 characters; fails Measurable validation). A compliant version: actionDescription = "Revise Procedure QP-014 to add mandatory field validation requirements for NC record creation; update the system configuration in Nexara to enforce description and root cause fields as mandatory before an NC record can be saved" (sufficient specificity); successCriteria = "Procedure QP-014 v4.0 approved and published; Nexara NC record template updated — verified by attempting to save an NC record without a description field and confirming system prevents saving."

---

## Section 4: Effectiveness Review

### The Effectiveness Review Date

When a CAPA is created, the `effectivenessReviewDate` is set to a date after all corrective actions are expected to be implemented — typically 30–90 days after the last action due date, allowing sufficient time for the implemented change to be tested under real operating conditions.

Navigate to **Quality → CAPA → [Record] → Effectiveness Review** on or after the scheduled review date.

### Review Outcomes

**Effective**: The NC or audit finding has not recurred since implementation. Evidence of non-recurrence must be uploaded (e.g., subsequent audit finding showing Conformance against the same clause; inspection records showing the defect has not reappeared). The CAPA is closed. The parent NC or audit finding can be marked Closed.

**Partially Effective**: Some corrective actions have worked; others have not. The finding has partially recurred or a related finding has appeared. The effective actions are documented. A new CAPA is created for the residual gap, with a revised root cause analysis if necessary. The original CAPA status changes to Partially Effective (a terminal status); the new CAPA becomes the active improvement record.

**Ineffective**: The finding has recurred in the same or equivalent form. The corrective actions did not address the actual root cause. The original CAPA is closed as Ineffective (a terminal status). A new CAPA is raised with a mandatory requirement to use a different or deeper root cause analysis method — if 5-Why was used first time, the new CAPA should use Fishbone or Fault Tree.

---

## Section 5: Repeat Findings Rate

### KPI Definition

Repeat Findings Rate = (Number of audit findings in the period that are classified as repeats / Total number of audit findings in the period) × 100

A finding is classified as a repeat if, within the preceding 24 months, another finding exists against the same ISO clause in the same process area.

Navigate to **Audits → Dashboard → Repeat Findings Rate** to see the current KPI value and trend chart (rolling 12-month view).

### What Repeat Findings Indicate

A repeat finding against the same clause and process area indicates one of three failure conditions:

1. **The corrective action was never implemented**: The CAPA was marked as In Progress but the actions were not actually carried out. The effectiveness review was inadequate or was conducted too soon.

2. **The root cause was incorrectly identified**: The corrective actions addressed a symptom rather than the root cause. Recurrence is inevitable because the underlying cause was never removed.

3. **Management system fragility**: The corrective action worked initially but was not sustained — for example, a procedure was updated but was not maintained, a training programme was delivered once but not built into the induction process, or a system control was implemented but was later disabled.

### Escalation Triggers

| Condition | Escalation |
|-----------|-----------|
| Repeat Findings Rate > 20% in a 12-month period | Escalate to QMS Manager; conduct programme-level review |
| Three or more repeat findings against the same clause | Escalate to senior management as a management review input |
| Any repeat Major NC | Immediate escalation; potential certification risk |

Navigate to **Audits → Reports → Repeat Findings Report** — filter by date range and classification to identify the specific clauses and process areas driving the repeat findings rate.
