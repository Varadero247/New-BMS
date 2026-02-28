# Module: Permit to Work & Inspections

**Programme**: Day B — Health, Safety & Environment
**IMS Modules covered**: Health & Safety → PTW, Health & Safety → Inspections

---

## Section 1: What Requires a Permit

A Permit to Work (PTW) is a formal, documented authorisation system for high-risk work activities. In Nexara, PTW templates define which work types require permits, and the system enforces the approval chain before work can begin.

### Standard Permit Types

| Permit Type | Trigger Conditions |
|-------------|-------------------|
| Hot Work | Any work producing heat, flame, or sparks in a non-designated area — welding, grinding, cutting |
| Confined Space | Entry to any space with restricted access that is not designed for continuous occupancy — tanks, vessels, drains |
| Work at Height | Any work above 2 metres where a fall could cause injury — scaffolding, ladders, MEWPs |
| Electrical Isolation | Any work on electrical systems requiring de-energisation — panel work, cable installation |
| Excavation | Any ground-breaking work > 300mm depth — trenching, piling, cable laying |
| Chemical / Hazardous Substance | Work with substances above risk threshold — fumigation, toxic chemical handling |
| Live Line / Energised Equipment | Work on energised systems where isolation is not possible — operational necessity |

### Configuring PTW Templates (Admin task — awareness only)

PTW templates are configured by administrators in **Settings → Health & Safety → PTW Templates**. As a module owner, you should understand that each template contains:
- Mandatory pre-work checks
- Required PPE / engineering controls
- Approver chain (e.g. Supervisor → HSE Manager → Site Manager for confined space)
- Maximum permit duration
- Emergency contacts and procedures

If a template is missing a required permit type, raise the request with your Nexara administrator.

---

## Section 2: Creating a PTW Request

1. Navigate to **Health & Safety → Permits → New Permit Request**
2. Select the **Permit Type** from the template list
3. Complete:
   - **Work Description**: Specific, detailed description of the work to be performed
   - **Location**: Use the location hierarchy picker
   - **Start Date/Time** and **Expected End Date/Time**
   - **Permit Holder**: The person taking responsibility for the work (usually the contractor or craft supervisor)
   - **Contractor/Company** (if external)
   - **Hazards Identified**: Select from the hazard library or add custom hazards
   - **Control Measures**: For each hazard, document the control measure in place
   - **PPE Required**: Select required PPE from the standard list
   - **Isolation Certificate Number**: For electrical/mechanical isolation permits, reference the isolation certificate
4. Complete the pre-work checklist (mandatory items defined in the template)
5. Submit for approval

The permit enters **Pending Approval** status and is routed to the first approver in the chain.

---

## Section 3: Approver Chains and Live Permits Dashboard

### Approval Chain Management

Each approval stage must be completed sequentially. The permit moves to the next approver only after the previous stage is approved. Any approver can return the permit to the applicant with a rejection reason.

**As an HSE Manager**, you may be Stage 2 or Stage 3 in the approval chain. When a permit awaiting your approval exists, it appears in **My Actions → Pending Approvals**.

**Emergency suspension**: If a safety concern arises during permitted work, any approver can suspend the permit immediately via **Actions → Suspend Permit**. The permit holder is notified instantly and work must cease immediately. A suspension reason must be documented.

### Live Permits Dashboard

**Health & Safety → Permits → Live Dashboard** shows:
- All currently active permits with countdown to expiry
- Permits expiring in next 4 hours (amber alert)
- Permits that have expired and are awaiting closure confirmation (red alert)
- Suspended permits requiring resolution

**Common mistake**: Allowing permits to expire without formal closure. An expired permit with no closure record is an audit finding — it suggests work continued without authorisation. Always ensure permit holders formally close permits when work is complete.

---

## Section 4: Inspection Schedule Management

### Creating a Recurring Inspection

1. Navigate to **Health & Safety → Inspections → New Inspection Schedule**
2. Configure:
   - **Inspection Type**: Fire safety, housekeeping, machinery, PPE, environmental compliance, etc.
   - **Location**: The area or asset to be inspected
   - **Frequency**: Weekly / Monthly / Quarterly / Annual / Custom
   - **Inspector**: Assigned inspector (must have appropriate permissions)
   - **Checklist Template**: Select or create the inspection checklist
3. Save — future inspection due dates are automatically generated in the schedule

### Conducting an Inspection

When an inspection is due, the inspector receives an email notification with a link to the inspection form. To complete:
1. Navigate to **Health & Safety → Inspections → Due Now**
2. Open the inspection and work through the checklist items
3. For each item: Satisfactory / Unsatisfactory / Not Applicable + notes and photos as required
4. For Unsatisfactory items: a **Finding** record is automatically created (pre-linked to the inspection)
5. Classify each finding: Observation / Minor Non-Conformance / Major Non-Conformance
6. Assign each finding to a responsible owner with a due date
7. Complete the inspection and submit

---

## Section 5: Inspection Findings and ISO 45001/14001

### Finding Classification

| Classification | Description | Required Response |
|---------------|-------------|-------------------|
| Observation | A potential risk condition that does not yet constitute a non-conformance | Monitor; document; recommend improvement |
| Minor Non-Conformance | A non-compliance with a procedure or standard that does not create immediate risk | Corrective action required within 30 days |
| Major Non-Conformance | A systemic failure or serious risk condition | Immediate corrective action; may require work stoppage |

### Generating ISO Evidence

For external audits against ISO 45001 or ISO 14001, generate evidence packages from:
- **Health & Safety → Reports → ISO Evidence Package**
- Select standard (ISO 45001 or ISO 14001)
- Select date range and clause scope

The evidence package includes: incident records, investigation reports, legal register with compliance status, PTW records, inspection schedules and findings, and corrective actions — all mapped to the relevant standard clauses.
