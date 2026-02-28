# Customisation Guide — Train-the-Trainer Source Materials

**Programme**: Nexara IMS Train-the-Trainer (T3)
**Version**: 1.0
**For**: Certified internal trainers

---

## 1. Introduction

This guide defines precisely what you may and may not change in the Nexara source materials you have received. Customisation supports relevance; uncontrolled customisation risks accuracy and compliance.

**Rule 1**: Always work from a copy. Never modify a Nexara source file directly.

**Rule 2**: When you are uncertain, email training@nexara.io before proceeding.

---

## 2. What You May Change

### 2.1 Scenario Company Names

All Nexara lab scenarios use fictional company names: "Meridian Industrial Group", "Acme Manufacturing", "Delta Chemicals", "Summit Logistics". These may be replaced with your organisation's name throughout the scenario descriptions.

**Process**:
1. Copy the scenario file (e.g. `LAB-DAY-A.md` → `XYZ-LAB-DAY-A.md`)
2. Replace the fictional company name with your organisation name using find-and-replace
3. Review for context — ensure industry references still make sense for your organisation
4. Save in your organisation's materials folder; do not overwrite the Nexara source file

**Caveat**: If your organisation's industry is significantly different from the scenario (e.g. the scenario describes manufacturing and you are a financial services company), you may adjust the industry context (product → service; factory floor → branch office) provided the Nexara module functionality being demonstrated is unchanged.

### 2.2 Local Regulatory References

Nexara materials reference generic regulatory frameworks ("applicable H&S regulations", "legal compliance requirements"). You may replace these generic references with the specific legislation applicable in your jurisdiction.

**Examples of permitted substitutions**:
- "H&S regulations" → "Health and Safety at Work Act 1974 (UK)" or "OSHA 29 CFR 1910 (US)" or "Federal Work Health and Safety Act 2011 (Australia)"
- "Environmental regulations" → "Environment Act 2021 (UK)" or relevant national legislation
- "Privacy regulations" → "GDPR" or "CCPA" or "PDPA" as applicable

**Constraints**:
- Do not add regulatory citations you are not qualified to confirm are correct — if uncertain, use the generic language
- Do not remove Nexara's references to ISO standards (e.g. ISO 9001, ISO 45001) — these map to the platform's compliance framework

### 2.3 Supplementary Case Studies

You may add organisation-specific case studies to any module. These must be:

- Clearly labelled as supplementary content: header "Organisation Case Study — [Your Organisation]" before the content
- Accurate descriptions of Nexara IMS functionality (incorrect supplementary content creates misinformation risk)
- Compatible with the module's learning objectives — a supplementary case study should illustrate the same skills targeted by the Nexara source module
- Placed after, not within, the Nexara source content

**Example**: At the end of `MODULE-NC-MANAGEMENT.md`, you add a two-page case study describing how your organisation investigated a real NC using Nexara, what root cause was identified, and what CAPA was raised. This is permitted. Inserting this case study between sections 2 and 3 of the source module is not — it fragments Nexara content.

### 2.4 Glossary Additions

You may add organisation-specific terminology to the participant glossary in `06-participant-materials/GLOSSARY.md`. Mark added terms clearly:

```
**CAPA**: Corrective and Preventive Action. [Nexara definition]

**MRB** *(Organisation-specific term)*: Material Review Board — used at [Org Name] to govern NC disposition decisions. Mapped to the NC Approver role in Nexara.
```

### 2.5 Assessment Question Context (Scenario Descriptions Only)

MCQ question stems may be adjusted to replace fictional company/industry context with your organisation's context. This only applies to the scenario description within the question stem — the answer options and correct answers may not be changed.

**Permitted**:
> Original: "Meridian Industrial Group discovers a batch of machined components is out of tolerance. Which NC category applies?"
> Customised: "[Your Org] discovers a batch of processed materials is out-of-specification. Which NC category applies?"

**Not permitted**: Changing the answer options, changing which answer is correct, or rewording the question in a way that changes its Bloom's level or the skill being assessed.

---

## 3. What You May NOT Change

### 3.1 Assessment Correct Answers

The answer keys to all Nexara assessments are controlled by Nexara. You may not:
- Change which answer option is correct
- Add, remove, or rewrite answer options in a way that makes a different option correct
- Adjust the pass threshold from the Nexara standard

**Why**: Assessment integrity. If the correct answer changes, participants in your organisation receive a different certification standard from those certified through Nexara-delivered programmes. Certificates must be internationally consistent.

### 3.2 Nexara Branding Elements

You may not:
- Remove the Nexara name from any materials
- Remove or resize the Nexara logo below the minimum size specified in `CO-BRANDING-GUIDE.md`
- Alter the programme title to remove "Nexara IMS"
- Replace Nexara copyright notices with your own

### 3.3 CPD Hour Attribution

The CPD hours assigned to each programme are:
- End User Training: 4 CPD hours
- Module Owner Training: 7 CPD hours per day
- Train-the-Trainer: 14 CPD hours

These values are set by Nexara and verified with relevant CPD bodies. You may not increase or decrease these values, even if you deliver a shorter or longer version of the programme.

**If you deliver an abbreviated version** (e.g. End User Training in 3 hours): you may not claim 4 CPD hours. Contact Nexara before delivering a non-standard-duration programme.

### 4 Translations

All materials are published in English. If your organisation requires materials in another language:
1. Contact training@nexara.io to request the translation licence
2. Nexara coordinates translations through approved translation partners
3. Translated versions are versioned and reviewed by Nexara before release
4. Certified trainers may not self-translate and self-publish without Nexara approval

Unapproved translations risk quality errors and regulatory misalignments that could affect the compliance value of the training.

### 3.5 Module Content Order

The order of sections within each module file reflects the adult learning sequencing applied by Nexara (concept → application → worked example → common mistakes). Do not resequence sections — doing so disrupts the pedagogical design.

---

## 4. Managing Customised Versions

### 4.1 File Naming Convention

All customised files should follow this naming pattern:

```
[ORG-CODE]-[ORIGINAL-FILENAME]-v[VERSION].md
```

Examples:
- `MIG-LAB-DAY-A-v1.1.md` (Meridian Industrial Group's customised Day A lab, version 1.1)
- `MIG-MODULE-NC-MANAGEMENT-v1.0.md` (Meridian's NC module with supplementary case study added)

Retain both the Nexara source file and your customised version. Do not delete the Nexara source.

### 4.2 Change Log

Maintain a change log at the top of each customised file:

```markdown
---
**Customised by**: [Your Name], [Organisation]
**Base version**: Nexara v1.0 (received [date])
**Your version**: v1.1
**Changes made**:
- Replaced "Meridian Industrial Group" with "[Org Name]" throughout
- Added Organisation Case Study (Section 6)
- Updated regulatory references: "H&S regulations" → "Health and Safety at Work Act 1974"
---
```

### 4.3 When a Nexara Update Arrives

When Nexara releases an updated version of a source file:
1. Compare the updated source with your customised version
2. Apply the new Nexara content changes to your customised version
3. Update your version number and change log
4. Do not continue using the old customised version after the Nexara implementation deadline

For guidance on version update timing and retro-training requirements, see `VERSION-CONTROL-GUIDE.md`.

---

## 5. Quick Reference — Permitted vs. Prohibited

| Modification | Permitted | Process |
|-------------|----------|---------|
| Replace scenario company names | ✓ | Copy source; use find-replace |
| Add local regulatory citations | ✓ | Substitute in copy; verify accuracy |
| Add supplementary case studies | ✓ | After source content; clearly labelled |
| Adjust MCQ question stem context | ✓ | Scenario text only; not answers |
| Add glossary terms | ✓ | Mark as organisation-specific |
| Change MCQ correct answers | ✗ | Never |
| Remove Nexara name/logo | ✗ | Never |
| Change CPD hour values | ✗ | Contact Nexara first |
| Reorder module sections | ✗ | Never |
| Translate materials | ✗ without approval | Contact Nexara |
| Deliver outside licensed organisation | ✗ | Separate licence required |

---

*Nexara IMS Train-the-Trainer — Customisation Guide | Version 1.0 | February 2026*
