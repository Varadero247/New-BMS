# Module: Training Tracker

**Programme**: Day C — HR & Payroll | **IMS Module**: Training (port 3032 / API 4028)

---

## Section 1: Course Management

Navigate to **Training → Courses → New Course** to create a training course record.

**Mandatory fields**:
| Field | Notes |
|-------|-------|
| `courseTitle` | Full descriptive name |
| `courseType` | Mandatory / Mandatory (Refresher) / Optional / Regulatory |
| `deliveryMethod` | Classroom / E-learning / On-the-job / Blended |
| `durationHours` | Estimated completion time |
| `validityPeriod` | How long the completion certificate is valid (months). E.g. 12 months for fire safety refresher |
| `mandatoryFor` | Role(s) or department(s) for which this course is mandatory |
| `provider` | Internal or external training provider name |

**Common mistake**: Not setting `validityPeriod` for mandatory refresher courses. Without a validity period, the system treats the training as complete forever and never triggers a refresher reminder.

---

## Section 2: Individual and Group Assignment

**Individual assignment**: Training → [Course] → Assign → search for employee → set completion deadline → save. The employee receives an email notification with a link to their training record.

**Group/department assignment**: Training → [Course] → Bulk Assign → select department or role → set completion deadline → assign. The system creates individual training records for each member of the group.

**Assignment status values**:
| Status | Meaning |
|--------|---------|
| Assigned | Course assigned; not yet started |
| In Progress | Employee has acknowledged and started (for e-learning) |
| Completed | Completion recorded with date and result |
| Overdue | Completion deadline passed; no completion recorded |
| Exempt | Individual exemption granted (e.g. role change made course irrelevant) |

---

## Section 3: Completion Recording

Navigate to the employee's training record → **Actions → Record Completion**:
- **Completion Date**: The date training was completed
- **Result**: Pass / Fail / Attended (for awareness training with no pass/fail)
- **Score** (if applicable): Percentage result from assessment
- **Certificate**: Upload the certificate issued by the training provider

For internal training with facilitator-led delivery: the facilitator can bulk-record attendance via **Training → [Session] → Mark Attendance**.

---

## Section 4: Compliance Matrix Report

The compliance matrix report is your primary tool for demonstrating training compliance to auditors and regulators.

Navigate to **Training → Reports → Compliance Matrix**:
- Filter by: Department / Role / Course / Date range
- Output: Grid showing employee vs course, with completion status and date for each cell
- Colour coding: Green (complete and valid), Amber (due for renewal within 30 days), Red (overdue or expired)
- Export: PDF (for audit packs) or CSV (for further analysis)

**For ISO audits**: Generate the matrix filtered by mandatory/regulatory courses only, for the relevant audit period. This demonstrates that all personnel have received required training per ISO 9001 clause 7.2 (Competence) and ISO 45001 clause 7.2.

---

## Section 5: Deadline Alerts

Navigate to **Training → Settings → Notification Rules** (requires Training Admin permission):

Configure alerts for:
- **30-day reminder**: Email to employee when a mandatory course completion deadline is 30 days away
- **7-day escalation**: Email to line manager when a mandatory course completion deadline is 7 days away
- **Overdue notification**: Email to HR manager and line manager when a deadline passes without completion
- **Expiry reminder**: Email to employee when a certificate is due to expire within 60 days (configurable)

**Common mistake**: Configuring alerts but not assigning the correct `lineManager` on employee records. Escalation emails go to the `lineManager` field — if it is blank, the escalation email is not sent.
