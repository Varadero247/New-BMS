# Nexara Brand Identity v3.0

## Brand

- **Name**: Nexara IMS
- **Previous**: Resolvex (deprecated February 2026)
- **Domain**: nexara.io / app.nexara.app / api.nexara.app
- **Tagline**: "Every standard. One intelligent platform."

## Design Tokens (CSS Custom Properties)

### Foundation (12 Neutrals)

| Token | Value | Usage |
|-------|-------|-------|
| `--ink` | `#080B12` | Page background |
| `--deep` | `#0C1220` | Section background |
| `--midnight` | `#101828` | Navigation background |
| `--surface` | `#162032` | Card background |
| `--raised` | `#1C2940` | Elevated surface |
| `--border` | `#1E2E48` | Default border |
| `--border-hi` | `#263852` | Strong border |
| `--muted` | `#344D72` | Faint text |
| `--steel` | `#5A7099` | Muted text |
| `--silver` | `#8EA8CC` | Body text |
| `--light` | `#C8D9EF` | Light text |
| `--white` | `#EDF3FC` | Primary text |

### Brand Signal (6 Hues)

| Token | Value |
|-------|-------|
| `--blue-deep` | `#1A4FBF` |
| `--blue-core` | `#2660D8` |
| `--blue-mid` | `#3B78F5` |
| `--blue-hi` | `#5B94FF` |
| `--teal-deep` | `#009E87` |
| `--teal-core` | `#00C4A8` |
| `--teal-hi` | `#00E0BF` |

### Gradients

| Token | Value |
|-------|-------|
| `--g-brand` | `linear-gradient(135deg, #2660D8 0%, #3B78F5 45%, #00C4A8 100%)` |
| `--g-brand-r` | `linear-gradient(315deg, #2660D8 0%, #3B78F5 45%, #00C4A8 100%)` |
| `--g-dark` | `linear-gradient(160deg, #0C1220 0%, #101828 100%)` |

### Module Colours (12)

| Token | Value | Module |
|-------|-------|--------|
| `--m-quality` | `#3B78F5` | Quality (ISO 9001) |
| `--m-safety` | `#F04B5A` | Health & Safety (ISO 45001) |
| `--m-env` | `#00C4A8` | Environment (ISO 14001) |
| `--m-hr` | `#9B6FEA` | Human Resources |
| `--m-payroll` | `#F59E0B` | Payroll |
| `--m-projects` | `#4EB8FF` | Project Management |
| `--m-finance` | `#34D399` | Finance |
| `--m-crm` | `#FB923C` | CRM |
| `--m-infosec` | `#818CF8` | Information Security (ISO 27001) |
| `--m-esg` | `#6EE7B7` | ESG |
| `--m-cmms` | `#FCD34D` | CMMS |
| `--m-ai` | `#E879F9` | AI Analysis |

### Sector Vertical Colours (6)

| Token | Value | Vertical |
|-------|-------|----------|
| `--s-auto` | `#DC2626` | Automotive (IATF 16949) |
| `--s-medical` | `#0891B2` | Medical Devices (ISO 13485) |
| `--s-aero` | `#1D4ED8` | Aerospace (AS9100D) |
| `--s-food` | `#16A34A` | Food Safety (ISO 22000) |
| `--s-energy` | `#D97706` | Energy (ISO 50001) |
| `--s-antibrib` | `#7C3AED` | Anti-Bribery (ISO 37001) |

## Typography

| Role | Font | Weight | CSS Variable |
|------|------|--------|-------------|
| Display/Headings | Syne | 800 | `--font-display` |
| Body/Paragraph | DM Sans | 300, 400, 500 | `--font-body` |
| Labels/Code | DM Mono | 300, 400, 500 | `--font-mono` |

### Typography Rules

- **Syne 800** is the **ONLY** display/heading font
- **DM Mono** is the **ONLY** monospace font
- **Zero exceptions** — no Inter, Roboto, Arial, or system-ui anywhere

## Logo

### Four Variants

1. **Full** — Convergence ring mark + "nexara" wordmark
2. **Mark Only** — Convergence ring (3 open arcs → radiant white core)
3. **Light** — For dark backgrounds with white text
4. **Gradient** — White mark on brand gradient background

### Logo Rules

- Minimum clear space: 1× mark width on all sides
- Gradient IDs must be unique per instance (use React `useId()`)
- Component: `<NexaraLogo size="md" variant="default" />`

## Approved Taglines

1. **Primary**: "Every standard. One intelligent platform."
2. **Secondary**: "29 ISO standards. One platform. No integrations required."
3. **Short Form**: "Compliance intelligence, unified."
4. **Feature-Led**: "From audit to action in one click."
5. **Category-Defining**: "The operating system for compliance."
6. **User-Led**: "Built for auditors. Loved by teams."

## Voice Guide

- **Precise**: No vague claims. Cite standards, numbers, evidence.
- **Direct**: Short sentences. Active voice. No filler.
- **AI-Earned**: AI features earn trust through transparency, not hype.

## Never-Say List

- "Synergy", "leverage", "paradigm", "disrupt"
- "World-class" without evidence
- "Resolvex" (deprecated)
- "Simple" when describing compliance (compliance is complex; the tool simplifies it)

## Legal

Copyright (c) 2026 Nexara Ltd. All rights reserved.

---

**Last Updated**: February 2026
**Version**: 3.0
