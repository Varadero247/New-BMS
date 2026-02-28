# Certificate Design Specification — Nexara Certified Platform Administrator

**Document**: Certificate design specification for print and digital production
**Version**: 1.0

---

## Certificate Variants

| Grade | Certificate Title | Badge Colour |
|-------|-----------------|--------------|
| Pass (75–89%) | Nexara Certified Platform Administrator | Deep Blue (`#0B1E38`) |
| Distinction (≥ 90%) | Nexara Certified Platform Administrator **with Distinction** | Deep Blue + Gold (`#B8860B`) |

---

## Layout Specification

### Format Options

| Format | Dimensions | Use Case |
|--------|-----------|---------|
| Print PDF | A4 Landscape (297mm × 210mm) | Physical ceremony handout |
| Digital PNG | 1920 × 1080px | Email, LinkedIn, digital display |

### Page Orientation
Landscape (horizontal).

---

## Visual Zones

```
╔══════════════════════════════════════════════════════════════════╗
║ [NEXARA LOGO]                              [CERTIFICATE BORDER]  ║
║ top-left                                                         ║
║                                                                   ║
║              CERTIFICATE OF ACHIEVEMENT                          ║
║                   (subtitle: Nexara IMS Platform)                ║
║                                                                   ║
║           This is to certify that                                ║
║                                                                   ║
║              [PARTICIPANT FULL NAME]                             ║
║              (large, gold-coloured for Distinction)              ║
║                                                                   ║
║    representing  [ORGANISATION NAME]                             ║
║                                                                   ║
║  has successfully completed the                                  ║
║                                                                   ║
║     Nexara IMS Role-Based Administrator Training Programme       ║
║     Two-Day Instructor-Led Training | 14 CPD Hours               ║
║                                                                   ║
║  and is hereby awarded the credential:                           ║
║                                                                   ║
║     ┌─────────────────────────────────────────┐                  ║
║     │ NEXARA CERTIFIED PLATFORM ADMINISTRATOR │                  ║
║     │         [with Distinction]              │                  ║
║     └─────────────────────────────────────────┘                  ║
║                                                                   ║
║   Grade: [PASS / DISTINCTION]    Score: [XX%]                    ║
║   Date: [DD MMMM YYYY]           Certificate ID: [UUID]          ║
║                                                                   ║
║   [NEXARA AUTHORISED SIGNATURE]     [FACILITATOR NAME]           ║
║   Chief Executive Officer           Training Facilitator         ║
║   Nexara DMCC                       [DATE]                       ║
║                                                                   ║
║   [CLIENT LOGO ZONE — bottom-right, 80×40mm max]                ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Typography

| Element | Font | Size | Weight | Colour |
|---------|------|------|--------|--------|
| "CERTIFICATE OF ACHIEVEMENT" | Montserrat | 24pt | Bold | White |
| "This is to certify that" | Lato | 14pt | Regular | Silver (`#C0C0C0`) |
| Participant name | Montserrat | 32pt | Bold | Gold (`#B8860B`) for Distinction; White for Pass |
| Organisation | Lato | 14pt | Regular | Silver |
| Credential box text | Montserrat | 18pt | Bold | White |
| Metadata line (grade, score, date, ID) | Lato | 11pt | Regular | Silver |
| Signature name | Lato | 12pt | Regular | White |
| Signature title | Lato | 10pt | Regular | Silver |

---

## Colour Palette

| Element | Colour | Hex |
|---------|--------|-----|
| Background | Deep Navy | `#0B1E38` |
| Border (outer) | Gold | `#B8860B` |
| Border (inner) | Steel Blue | `#1E3A5F` |
| Primary text | White | `#FFFFFF` |
| Secondary text | Silver | `#C0C0C0` |
| Credential box background | Midnight Navy | `#091628` |
| Credential box border | Gold | `#B8860B` |
| Distinction accent | Gold | `#B8860B` |

---

## Logo Placement

| Logo | Position | Size | Alignment |
|------|----------|------|-----------|
| Nexara wordmark + icon | Top-left | 48px height (digital); 15mm height (print) | Left-aligned |
| "Authorised Signature" block | Bottom-left | 40mm × 20mm | Left-aligned |
| Client organisation logo | Bottom-right | Max 80mm × 40mm (print); max 160px × 80px (digital) | Right-aligned |

---

## Certificate ID Format

Each certificate receives a unique UUID v4:
- **Format**: `CERT-{YYYY}-{UUID_FIRST_8_CHARS}` (e.g., `CERT-2026-A3F2B1C4`)
- **Verification URL**: `https://certs.nexara.io/verify/{certificate-id}`
- **Registry retention**: 7 years

---

## Digital Certificate Generation (Web Portal)

The training portal (`apps/web-training-portal/`) generates certificates client-side using:
- **Canvas API** or **html2canvas** for rendering
- **jsPDF** for PDF export
- **PNG export** via canvas `toDataURL('image/png')`

Input fields collected from participant:
- Full legal name (must match employment records)
- Organisation name
- Assessment score (auto-populated from portal)
- Assessment date (auto-populated)

Certificate ID generated as UUID v4 on the server before download, registered in Nexara Training Registry.

---

## Quality Control

Before issuing any certificate:
- [ ] Participant name spelled correctly (verify against ID if in-person)
- [ ] Organisation name matches contract
- [ ] Grade matches assessment score
- [ ] Certificate ID is unique (no duplicate UUID)
- [ ] Date is the assessment date, not print date

---

*Certificate template maintained by Nexara Training Team. Do not modify the layout or branding elements. Client co-branding permitted only in the designated bottom-right zone per CO-BRANDING-GUIDE.md.*
