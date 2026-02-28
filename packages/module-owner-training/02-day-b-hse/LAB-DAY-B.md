# Lab Exercise — Day B: Health, Safety & Environment

**Duration**: 75 minutes (14:30–15:45)
**Sandbox**: Hartfield Industrial sample data pre-loaded
**Your role**: HSE Manager

---

## Scenario Background

**Organisation**: Hartfield Industrial Services Ltd — a facilities management and industrial services contractor
**Site**: Hartfield Refinery Services — North Terminal Building 7

At 10:47 this morning, an external roofing contractor (Apex Roofing Ltd) was performing maintenance on the roof of Building 7. A worker lost footing on a wet surface and fell approximately 2.5 metres from a fixed access ladder to the roof parapet level, striking their right shoulder and arm. First aid was administered on site; the worker was transported to hospital with a suspected fractured collarbone. They will not return to work for at least 8 weeks.

Prior investigation findings have revealed that: (a) no Permit to Work was in place for the roofing work; (b) the access ladder had a broken anti-slip tread that had been reported internally 3 weeks ago but not actioned; (c) no toolbox talk was conducted before work commenced.

The site has an ISO 45001 surveillance audit in 6 weeks' time.

---

## Step 1: Record the Incident

1. Navigate to **Health & Safety → Incidents → Record Incident**
2. Complete the incident record:
   - `title`: "Contractor fall from height — roof access ladder — Building 7 — Apex Roofing"
   - `dateOccurred`: Today at 10:47 (use today's date)
   - `severity`: **CRITICAL** (hospitalisation; 8+ week absence; fractured bone; potential fatality risk)
   - `incidentType`: Slip/Trip/Fall
   - `location`: Building 7 → Roof → Access Ladder
   - `injuredPersons`: Add sandbox person "James Thornton, Apex Roofing Ltd"
   - `lostTimeInjury`: ✓ Checked (8+ week absence)
   - `immediateActions`: "First aid administered on site. Worker transported to hospital by ambulance at 11:15. Area isolated — roof access prohibited until PTW and ladder repair completed. Site manager and HSE Manager notified immediately."
   - `reportedBy`: Your sandbox user
   - `regulatoryReportable`: ✓ Checked (hospitalisation; RIDDOR reportable)
   - `description`: "External contractor James Thornton (Apex Roofing Ltd) fell approximately 2.5m from roof access ladder to parapet level while conducting scheduled roof maintenance on Building 7. Suspected fractured right collarbone. No PTW was in place. Broken anti-slip tread on ladder was a known defect. No toolbox talk conducted."
3. Save the incident record — note the reference number

**Expected outcome**: Incident created with CRITICAL severity; regulatory reportable flag set; LTI flag set.

---

## Step 2: Record Contributing Factors and Root Cause

1. On the incident record → **Investigation** tab
2. Assign yourself as Investigation Lead
3. Add contributing factors:
   - "No Permit to Work in place for work at height activity — contractor commenced work without required authorisation"
   - "Broken anti-slip tread on roof access ladder — reported 3 weeks ago via maintenance request but not actioned"
   - "No toolbox talk conducted — workers not briefed on site-specific hazards before commencing work"
   - "Roof surface wet due to overnight rain — no pre-work weather assessment performed"
4. Immediate causes:
   - "Worker slipped on wet surface of roof parapet due to inadequate footing"
   - "Fall height of 2.5m not adequately controlled — no secondary fall arrest system present"
5. Root cause: Category = **Inadequate procedure**; Statement = "Management system failure — PTW procedure does not extend to external contractors for work-at-height activities above 2m. Maintenance defect management process has no escalation path for safety-critical defects, allowing a known hazard to remain unresolved for 3 weeks."
6. Mark investigation as **In Progress** (not yet complete — awaiting full investigation)

---

## Step 3: Raise a Permit to Work (Retroactive Safety Control)

Simulate creating the PTW that should have been raised before work commenced, to demonstrate the system process for future similar activities:

1. Navigate to **Health & Safety → Permits → New Permit Request**
2. Select **Permit Type**: Work at Height
3. Complete:
   - **Work Description**: "Scheduled roof maintenance and tile inspection — Building 7 North elevation. Includes access via fixed ladder and walking on roof surface."
   - **Location**: Building 7 → Roof
   - **Start Date/Time**: 08:00 today
   - **Expected End Date/Time**: 17:00 today
   - **Permit Holder**: James Thornton (Apex Roofing Ltd)
   - **Hazards**: Select: Work at Height, Slippery Surface, Fragile Roof Materials, Weather Exposure
   - **Controls**: "Safety harness and lanyard required. Full coverage hard hat. Anti-slip footwear rated to EN ISO 20345. Weather assessment before commencing — work suspended if wind exceeds Beaufort 4 or surface is wet and unprotected."
   - **PPE**: Hard hat, safety harness, anti-slip footwear, hi-vis vest
4. Mark the ladder inspection item on the pre-work checklist as **Unsatisfactory** (broken anti-slip tread) — add note: "Ladder in Building 7 requires repair before use — access via external scaffold tower only"
5. Submit for approval (the PTW will route to HSE Manager — yourself)

**Expected outcome**: PTW created in Pending Approval status; pre-work checklist finding documented.

---

## Step 4: Conduct a Reactive Inspection

1. Navigate to **Health & Safety → Inspections → New Inspection**
2. Select **Type**: Work at Height — Reactive
3. **Location**: Building 7 → Roof and access routes
4. **Inspector**: Your sandbox user
5. In the checklist, record the following findings:
   - "Roof access ladder — Step 4 anti-slip tread broken" → **Major Non-Conformance** → assign to Maintenance Manager, due: 2 days from today
   - "No PTW documentation visible at point of work" → **Major Non-Conformance** → assign to Site Manager, due: same day
   - "No toolbox talk record for today's roofing work" → **Minor Non-Conformance** → assign to Site Supervisor, due: 5 days from today
   - "Fall arrest anchor points on roof — 3 of 6 last inspected > 12 months ago" → **Observation** → assign to HSE Manager (yourself), due: 14 days from today
6. Complete and submit the inspection

**Expected outcome**: Inspection record with 2 Major NCs, 1 Minor NC, 1 Observation.

---

## Step 5: Update the Legal Register

A regulatory review has identified that the organisation's legal register is missing an entry for the Work at Height Regulations 2005 (UK):

1. Navigate to **Health & Safety → Legal Register → Add Obligation**
2. Complete:
   - `title`: "Work at Height Regulations 2005 (UK)"
   - `obligationType`: REGULATION
   - `jurisdiction`: United Kingdom
   - `applicabilityCriteria`: "Applies to all work activities carried out at height where a person could fall a distance liable to cause personal injury. Includes work on roofs, scaffolding, ladders, and elevated platforms."
   - `complianceStatus`: AT_RISK (today's incident demonstrates a compliance gap)
   - `reviewDate`: 6 months from today
   - `obligationOwner`: Your sandbox user
3. Attach a compliance evidence entry: "PTW procedure (under revision) — WAH_PTW_procedure_v1.2.pdf" — upload the sandbox placeholder file
4. Save the obligation

**Expected outcome**: New legal register entry with AT_RISK status.

---

## Step 6: Generate the ISO 45001 Evidence Package

1. Navigate to **Health & Safety → Reports → ISO Evidence Package**
2. Configure:
   - **Standard**: ISO 45001:2018
   - **Date Range**: Last 90 days
   - **Clauses**: 6.1.2 (Hazard identification), 8.1.3 (Management of change), 9.1 (Monitoring and measurement), 10.2 (Incident investigation)
3. Generate and download the package
4. Verify the package index includes: the incident record, the inspection record, and the legal register entry

**Expected outcome**: ZIP package downloaded; all three records appear in the evidence index.

---

## Debrief Questions

1. The broken ladder anti-slip tread was reported 3 weeks before the incident but not actioned. What features in Nexara could have prevented this? How would you use the inspection findings workflow differently going forward?

2. A regulatory inspector from the Health and Safety Executive (HSE) visits tomorrow as a result of the RIDDOR notification. They ask to see your PTW system records and risk assessments for work at height. Walk through what reports you would generate from Nexara and in what order.

3. Significance scoring: Calculate the significance score for the environmental aspect "Vehicle fuel combustion" using the following scores: severity=3, probability=5, duration=3, extent=2, reversibility=4, regulatory=4, stakeholder=3. Is this a significant aspect?
