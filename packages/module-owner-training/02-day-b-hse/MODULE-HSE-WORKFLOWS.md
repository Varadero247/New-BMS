# Module: HSE Workflows — Incident Recording & Investigation

**Programme**: Day B — Health, Safety & Environment
**IMS Modules covered**: Health & Safety (port 3001 / API 4001)

---

## Section 1: Incident vs Near Miss vs Observation

Nexara provides three distinct record types for HSE events. Using the correct type is critical for accurate TRIR/LTIR calculation and for identifying leading indicators.

| Record Type | Definition | When to use | IMS Field: `eventType` |
|------------|-----------|-------------|------------------------|
| Incident | An unplanned event that resulted in injury, illness, property damage, or environmental release | Someone was injured, equipment was damaged, or a spill/release occurred | `INCIDENT` |
| Near Miss | An unplanned event that had the potential to cause harm but did not | "We were lucky" — same scenario, different outcome | `NEAR_MISS` |
| Observation | A condition or behaviour that, if uncorrected, could lead to an incident or near miss | Unsafe conditions, unsafe acts, positive safety behaviours | `OBSERVATION` |

**Common mistake**: Recording a near miss as an observation. An observation is a future risk condition; a near miss is a past event that nearly caused harm. If someone slipped but did not fall (and no injury), that is a near miss.

---

## Section 2: Incident Record Fields

Navigate to **Health & Safety → Incidents → Record Incident**

**Mandatory fields**:

| Field | Format / Options | Notes |
|-------|----------------|-------|
| `title` | Free text, max 200 chars | Descriptive: "Operator slip on wet flooring — Assembly Bay 3" not "Slip incident" |
| `dateOccurred` | Date-time picker | The date and time the incident occurred, not the date it was reported |
| `severity` | MINOR / MODERATE / MAJOR / CRITICAL / CATASTROPHIC | See classification framework below |
| `incidentType` | Slip/Trip/Fall, Struck By, Struck Against, Caught In/On/Between, Electrical, Chemical, Fire/Explosion, Environmental Release, Vehicle, Ergonomic, Other | Select the most accurate type |
| `location` | Site / Building / Area hierarchy | Use the location picker — do not free-text |
| `immediateActions` | Free text | What was done immediately — first aid, evacuation, isolation |
| `reportedBy` | User lookup | The person filing the report (may differ from the injured person) |

**Optional but important**:
- `injuredPersons` — add each injured person; required for RIDDOR/statutory reporting
- `witnessStatements` — attach or type statements
- `evidenceAttachments` — photos, CCTV stills, equipment inspection reports

---

## Section 3: Severity Classification Framework

| Severity | Definition | Examples | Regulatory trigger |
|----------|-----------|----------|-------------------|
| MINOR | First aid treatment; no lost time; no significant property damage | Paper cut, minor bruise, small tool damage | Record only |
| MODERATE | Medical treatment beyond first aid; restricted work; limited property damage | Sprained ankle (restricted duty), minor chemical spill (contained) | Internal investigation required |
| MAJOR | Lost time injury (LTI); significant property damage; near regulatory threshold | Broken bone, hospitalisation, significant equipment damage | RIDDOR reportable (UK); regulatory notification likely |
| CRITICAL | Life-threatening injury; major environmental release; process safety event | Severe burn, toxic gas release, structural collapse partial | Immediate regulatory notification; enforcement risk |
| CATASTROPHIC | Fatality; major irreversible environmental impact; major explosion/collapse | Death, permanent disability, large-scale environmental damage | Immediate notification; regulator investigation; potential enforcement |

**Worked example**: An operator drops a 20kg component which strikes their foot, causing a hairline fracture. They are hospitalised for 4 hours and return to restricted duties the next day. Severity = **MAJOR** (lost-time equivalent; hospitalisation; RIDDOR over-7-day reportable).

---

## Section 4: Investigation Workflow

After an incident is recorded, the investigation workflow begins automatically.

### Investigation Steps

1. **Assign Investigation Lead**: Incidents above MINOR require a named Investigation Lead (usually the department manager or HSE manager). Go to **Investigation** tab → Assign Lead.

2. **Immediate Cause(s)**: The direct physical cause(s) of the incident. Example: "Wet floor not signed" and "Operative not wearing non-slip footwear."

3. **Contributing Factors**: Conditions that increased the risk. Example: "No standard for wet floor response during shift handover" and "PPE compliance not monitored in this area."

4. **Root Cause**: The fundamental system failure. Example: "Management system failure — no wet floor procedure exists; PPE compliance audit last conducted 14 months ago."

5. **Corrective Actions**: Specific actions to prevent recurrence. Add each action with owner, due date, and completion status. Actions can link to CAPA records if a formal CAPA is required.

6. **Regulatory Reporting Flag**: If the incident meets RIDDOR / OSHA / local regulatory thresholds, tick the **Regulatory Reportable** checkbox. The system generates a draft regulatory notification for facilitator review.

---

## Section 5: TRIR and LTIR Calculation

Nexara calculates TRIR and LTIR automatically from incident records. You must ensure incident records have the correct `severity` and `lostTimeInjury` flag.

**TRIR (Total Recordable Incident Rate)**:
```
TRIR = (Number of recordable incidents × 200,000) ÷ Total hours worked
```
- Recordable incidents: MODERATE, MAJOR, CRITICAL, CATASTROPHIC
- Total hours worked: configured in Settings → Organisation → Workforce Hours

**LTIR (Lost Time Incident Rate)**:
```
LTIR = (Number of LTIs × 200,000) ÷ Total hours worked
```
- LTIs: Incidents with `lostTimeInjury = true` (system flag; auto-set for MAJOR and above; confirm manually)

**Common mistake**: Forgetting to mark a MAJOR incident as `lostTimeInjury = true` when the injured person was sent home or to hospital. The LTIR will be understated, which is a misrepresentation to the regulator.
