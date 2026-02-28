# Certificate Specification — Nexara Certified Internal Trainer

**Programme**: Nexara IMS Train-the-Trainer (T3)
**Version**: 1.0
**Managed by**: Nexara Learning & Development

---

## Certificate Identity

| Attribute | Value |
|-----------|-------|
| Certificate title | "Nexara Certified Internal Trainer — End User & Module Owner Programmes" |
| Abbreviation (for records) | NCIT-EUMO |
| Credential type | Professional certification |
| Issuing body | Nexara DMCC |
| Verification | Nexara certificate verification system (certificate number lookup at training.nexara.io/verify) |
| CPD credit | 14 hours — structured CPD |
| Validity | 12 months from issue date; renewable annually |

---

## Physical Certificate Specification

### Format

| Attribute | Specification |
|-----------|-------------|
| Orientation | A4 landscape (297mm × 210mm) |
| Paper stock | 150gsm silk (minimum); 200gsm silk (preferred for physical ceremonies) |
| Background | Nexara navy (#091628) with subtle geometric pattern |
| Border | Gold (#B8860B) rule, 2pt, 12mm inset from edge |
| Print quality | 1200 dpi minimum; do not print below 300 dpi |

### Layout Zones

The A4 landscape certificate is divided into the following zones:

```
┌─────────────────────────────────────────────────────────────────┐
│  [Nexara Logo — top centre]                                     │  ← Header zone (top 18mm)
│  "Nexara DMCC — Training Academy"                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  This is to certify that                                        │
│                                                                 │  ← Title zone (centre)
│  [PARTICIPANT NAME — large, Montserrat Bold, 28pt]              │
│                                                                 │
│  has successfully completed the                                 │
│                                                                 │
│  Nexara Certified Internal Trainer                              │  ← Programme title zone
│  End User & Module Owner Programmes                             │  (Montserrat SemiBold, 18pt)
│                                                                 │
│  [Date of issue] | CPD: 14 hours | Certificate: [NUMBER]       │  ← Details bar
│                                                                 │
├───────────────────────────────┬─────────────────────────────────┤
│  [Co-branding zone]           │  [Signatures zone]              │  ← Footer zone
│  [Client organisation logo]   │  ________________               │
│  [Client organisation name]   │  Head of L&D, Nexara DMCC       │
│                               │  ________________               │
│                               │  Lead Trainer, [Name]           │
└───────────────────────────────┴─────────────────────────────────┘
```

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Header | Montserrat | 11pt | Regular |
| "This is to certify that" | Georgia | 12pt | Italic |
| Participant name | Montserrat | 28pt | Bold |
| "has successfully completed the" | Georgia | 12pt | Regular |
| Programme title line 1 | Montserrat | 18pt | SemiBold |
| Programme title line 2 | Montserrat | 14pt | Regular |
| Details bar (date, CPD, cert number) | Montserrat | 9pt | Regular |
| Signature labels | Montserrat | 9pt | Regular |
| Co-branding zone text | Client's own brand font (if applied) | — | — |

### Colour Palette

| Element | Colour | Hex |
|---------|--------|-----|
| Background | Nexara navy | #091628 |
| Border rule | Nexara gold | #B8860B |
| All text | White | #FFFFFF |
| Details bar background | Translucent dark overlay | rgba(0,0,0,0.3) |
| Geometric background pattern | Subtle navy variation | #0E2040 at 40% opacity |

---

## Digital Certificate Specification

The Training Portal generates digital certificates in PDF format. Digital certificates must meet the following specification:

| Attribute | Specification |
|-----------|-------------|
| File format | PDF/A-1b (archival quality) |
| File size | < 500 KB (optimised; do not embed full font files) |
| Dimensions | A4 landscape (297 × 210mm) at 150 dpi |
| Certificate number | Embedded as machine-readable metadata (PDF field) |
| Verification QR code | Included in the footer — links to `training.nexara.io/verify?cert=[NUMBER]` |
| Email delivery | Sent via portal from `certificates@nexara.io` with subject "Your Nexara Certificate — [Programme Name]" |

---

## Co-Branding Zone Specification

The co-branding zone is in the **bottom-left quadrant** of the certificate footer (approximately 40% of the footer width). Client organisations may use this zone as follows:

| Element | Rule |
|---------|------|
| Client logo | May be placed in the co-branding zone; must not exceed the Nexara logo in size |
| Client organisation name | May be displayed below the client logo in the co-branding zone |
| Format | PNG or SVG (white or light-coloured version of logo recommended on dark background) |
| Maximum logo height | 18mm |
| Maximum text size | 10pt |
| Permitted: | "Delivered by [Organisation] L&D" text below client logo |
| Not permitted: | Replacing any Nexara element; placing client logo in the Nexara logo zone; removing the Nexara logo |

**Setting the co-branding zone**: Certified internal trainers log in to the Training Portal → Settings → Organisation Branding → upload client logo. The logo is automatically applied to all certificates issued by that trainer.

---

## Certificate Number Format

All Nexara certificates carry a unique certificate number in the format:

```
NEXARA-T3-[YEAR]-[SEQUENCE]
```

Examples:
- `NEXARA-T3-2026-00001` (first certificate issued in 2026)
- `NEXARA-T3-2026-00847` (847th certificate in 2026)

The certificate number is used for:
- Verification via `training.nexara.io/verify`
- Revocation tracking
- CPD body evidence submission
- The Nexara certified trainer register

---

## Certificate Verification

Third parties (employers, certification bodies, auditors) can verify a Nexara certificate by:

1. Visiting `training.nexara.io/verify`
2. Entering the certificate number
3. The system returns: **Valid** / **Invalid** / **Revoked** + the programme name, holder name, and issue date

Certificate details beyond pass/fail status (individual scores) are not disclosed to third parties.

---

*Nexara IMS Train-the-Trainer — Certificate Specification | Version 1.0 | February 2026*
