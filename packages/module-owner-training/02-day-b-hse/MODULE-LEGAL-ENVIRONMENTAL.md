# Module: Legal Register & Environmental Compliance

**Programme**: Day B — Health, Safety & Environment
**IMS Modules covered**: Health & Safety → Legal Register; Environment (port 3002 / API 4002)

---

## Section 1: Legal Register Structure

The legal register is the organisation's documented inventory of all legal and compliance obligations relevant to its HSE activities. In Nexara, each obligation is a separate record.

### Obligation Types

| Type | Description | Examples |
|------|-------------|---------|
| `REGULATION` | Primary legislation — directly binding | Health and Safety at Work Act, Control of Substances Hazardous to Health |
| `DIRECTIVE` | Secondary legislation requiring transposition | EU Environmental Liability Directive |
| `PERMIT` | Site-specific authorisation | Environmental permit, discharge consent, planning consent |
| `STANDARD` | Voluntary or contractual technical standard adopted as an obligation | ISO 45001:2018, customer HSE requirements |
| `CONTRACTUAL` | Obligation arising from commercial contract | Customer HSE supply chain requirements, insurance conditions |

### Mandatory Fields per Obligation

| Field | Options / Format | Notes |
|-------|----------------|-------|
| `title` | Free text | Full official title of the regulation/permit/standard |
| `obligationType` | See types above | Select the most accurate type |
| `jurisdiction` | Country / Region / Site | Where this obligation applies |
| `applicabilityCriteria` | Free text | Exactly how and why this applies to the organisation |
| `complianceStatus` | COMPLIANT / AT_RISK / NON_COMPLIANT | Current status — manually maintained |
| `reviewDate` | Date picker | When the obligation must be reviewed for changes; default 12 months |
| `obligationOwner` | User lookup | Person responsible for maintaining compliance with this obligation |

---

## Section 2: Adding New Obligations

When a new regulation is published or becomes applicable:

1. Navigate to **Health & Safety → Legal Register → Add Obligation**
2. Complete all mandatory fields
3. Set `reviewDate` — for regulations that change frequently (e.g. Environmental Permits), use 6 months; for stable standards (ISO), use 12–24 months
4. Set initial `complianceStatus`:
   - **COMPLIANT**: Evidence of compliance already exists
   - **AT_RISK**: Compliance cannot currently be confirmed; action required
   - **NON_COMPLIANT**: Known gap; urgent corrective action required

**Review date management**: Nexara sends an email reminder to the `obligationOwner` 30 days before the `reviewDate`. At review, the owner confirms whether the obligation has changed, updates the status, and sets the next review date. This creates an audit trail of regular review — essential for ISO 14001 and ISO 45001 compliance evidence.

---

## Section 3: Evidence Linking

For each obligation, you must attach compliance evidence. Navigate to the obligation record → **Evidence** tab.

### What Constitutes Adequate Evidence

| Obligation Type | Acceptable Evidence |
|----------------|-------------------|
| Regulation | Procedure that implements the requirement + training records showing staff are trained on the procedure |
| Permit | Current permit document + monitoring records + discharge/emission records as required |
| Standard | Certification certificate + last audit report |
| Contractual | Contract document + signed conformance declaration or audit report |

**Common mistake**: Attaching the regulation or permit document itself as compliance evidence. The regulation is the obligation, not the evidence. The evidence is what demonstrates your compliance with it.

**AT_RISK status usage**: Use AT_RISK (not NON_COMPLIANT) when:
- A new regulation has been issued and you are actively working toward compliance but not yet there
- A permit renewal is in progress and the old permit has expired
- Evidence documents are due for renewal and the renewal is in progress

Use NON_COMPLIANT only when there is a known, confirmed gap with no active remediation plan.

---

## Section 4: Environmental Aspects and Impacts

ISO 14001:2015 clause 6.1.2 requires identification of environmental aspects and their associated impacts.

### Aspect vs Impact

- **Aspect**: Element of the organisation's activities, products, or services that can interact with the environment
- **Impact**: The environmental change resulting from an aspect (positive or negative)

Example: Aspect = "Solvent use in painting process" → Impact = "Air quality deterioration from VOC emissions"

### Significance Scoring in Nexara

Each aspect/impact pair is scored using the Nexara significance formula:

```
Score = (severity × 1.5) + (probability × 1.5) + duration + extent + reversibility + regulatory + stakeholder
```

| Factor | Scale | Description |
|--------|-------|-------------|
| `severity` | 1–5 | Environmental consequence (1=negligible, 5=severe) |
| `probability` | 1–5 | Likelihood of the impact occurring (1=rare, 5=almost certain) |
| `duration` | 1–5 | How long the impact lasts (1=momentary, 5=permanent) |
| `extent` | 1–5 | Geographic reach of the impact (1=localised, 5=transboundary) |
| `reversibility` | 1–5 | Ease of reversing the impact (1=fully reversible, 5=irreversible) |
| `regulatory` | 1–5 | Degree of regulatory attention (1=unregulated, 5=highly regulated) |
| `stakeholder` | 1–5 | Level of stakeholder concern (1=no concern, 5=major concern) |

**Significant aspect threshold**: Score ≥ 15. Significant aspects require at least one of: operational control, objective and target, or emergency procedure.

**Worked example**: Aspect = "Fuel combustion in company fleet vehicles"
- Severity: 3 (localised air quality impact)
- Probability: 5 (occurs daily)
- Duration: 3 (continuous during operation)
- Extent: 2 (local/regional)
- Reversibility: 4 (CO₂ is long-lived)
- Regulatory: 4 (emissions heavily regulated)
- Stakeholder: 3 (moderate public concern)

Score = (3×1.5) + (5×1.5) + 3 + 2 + 4 + 4 + 3 = 4.5 + 7.5 + 16 = **28** → Significant

This aspect requires a corresponding environmental objective (e.g., fleet CO₂ reduction target) and an operational control (e.g., eco-driving policy, vehicle replacement plan).
