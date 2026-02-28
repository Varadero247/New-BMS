# Module: HR Workflows — Employee Record Lifecycle

**Programme**: Day C — HR & Payroll | **IMS Module**: HR (port 3006 / API 4006)

---

## Section 1: Employee Record Structure

Each employee has a single master record in Nexara HR. All other records (absences, training, payroll) link to this master record. Reference format: `HR-EMP-{YEAR}-{NNN}`.

**Mandatory fields**:
| Field | Notes |
|-------|-------|
| `firstName` / `lastName` | Legal name as on employment contract |
| `employeeId` | Internal employee reference (your format) |
| `employmentType` | FULL_TIME / PART_TIME / CONTRACTOR / ZERO_HOURS |
| `startDate` | First day of employment |
| `department` | Linked to the organisational structure |
| `lineManager` | User lookup — must be an active system user |
| `position` | Job title |
| `workLocation` | Site, remote, hybrid |

**GDPR note**: All employee records are classified as personal data. Access to HR records is restricted to users with HR module permissions (HR_VIEWER minimum). Data is retained per the configured retention schedule (default: employment duration + 7 years for UK).

---

## Section 2: Starter Process

1. **Create record**: HR → Employees → New Employee
2. **Starter checklist**: Each new employee has an automated onboarding checklist. Default items: right-to-work documents checked, employment contract signed, bank details received, IT access requested, health declaration received, induction scheduled. Mark each item as complete with date.
3. **Document upload**: Contract (PDF), right-to-work evidence (certified copy), and any pre-employment medical clearance
4. **Role assignment**: The HR record generates an access request — your Nexara administrator completes the system access setup. HR does not assign system roles directly.

---

## Section 3: Absence Management

Navigate to **HR → Absences → Record Absence** (or from the employee record → Absences tab).

| Absence Type | Notes |
|-------------|-------|
| Annual Leave | Pre-approved; balance tracked automatically |
| Sick Leave | Any illness; certificate required >5 days (configurable) |
| Parental Leave | Maternity / Paternity / Shared Parental / Adoption — configure statutory pay settings |
| Unpaid Leave | Agreed absence without pay |
| Compassionate Leave | Bereavement or family emergency |

**Return to work**: For sick absences >1 day, a return-to-work interview record should be created (HR → Absences → Return to Work). This documents: return date, employee's fitness to return, any reasonable adjustments, and whether absence is linked to an ongoing condition.

---

## Section 4: Leaver Process

1. Open employee record → **Actions → Initiate Leaver Process**
2. Complete the exit checklist: resignation/termination reason, final working day, notice period confirmation, equipment return, access revocation date
3. Set `terminationDate` — this automatically triggers an access revocation task for the Nexara administrator
4. **Data retention flag**: Select the retention period. For UK: employment records retained 7 years post-employment. For EU employees: apply relevant jurisdiction setting.
5. After the retention period expires, the system prompts for erasure confirmation (GDPR right-to-erasure workflow)

**Common mistake**: Setting the access revocation date after the last working day. Best practice: revoke access on the final working day (not the day after). Set `accessRevocationDate` = last working day.

---

## Section 5: GDPR Obligations for HR Data

| Obligation | Nexara Implementation |
|-----------|---------------------|
| Lawful basis for processing | Configured in Settings → HR → Data Processing Register |
| Data retention | Per-record retention schedule based on employment jurisdiction |
| Right to access | HR → Reports → Employee Data Export (generates subject access report) |
| Right to erasure | HR → [Employee] → Actions → Request Erasure (triggers review workflow) |
| Data breach | HR records involved in a breach should be linked to the incident record in the H&S/Incidents module |
