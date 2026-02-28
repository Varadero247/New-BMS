# Lab Environment Setup — Nexara IMS Administrator Training

---

## Overview

The lab environment is a sandboxed instance of the Nexara IMS platform, pre-configured with:
- Sample organisation: "Nexara Training Co."
- 50 sample users with varied roles
- All 7 core modules in ACTIVE state
- Sample data across all modules (incidents, documents, risks, etc.)
- SCIM provisioning endpoint (simulated IdP)
- Mock webhook receiver at `http://lab-webhook.local:9000`

**Two delivery modes:**

| Mode | When to use | Setup |
|------|------------|-------|
| **Hosted sandbox** | Facilitator-led in-person or virtual | Nexara provides credentials per participant |
| **Scenario-based** | Self-paced or printed scenarios | No live system needed; participants work from provided mock data |

---

## Hosted Sandbox Access

### Your Credentials

| Field | Value |
|-------|-------|
| Instance URL | `https://training-{cohortId}.nexara.io` |
| Your admin email | `participant{N}@training.nexara.io` |
| Temporary password | Provided by facilitator at session start |
| Admin console | `https://training-{cohortId}.nexara.io/admin` |
| SCIM base URL | `https://training-{cohortId}.nexara.io/scim/v2` |
| Mock IdP | `https://mock-idp.training.nexara.io` |
| Webhook receiver | `https://training-{cohortId}.nexara.io/lab/webhook-receiver` |

### Pre-Lab Verification

Before each lab, verify access:

```bash
# Test API access
curl -H "Authorization: Bearer {YOUR_API_KEY}" \
  https://training-{cohortId}.nexara.io/api/health

# Expected: {"status":"healthy","version":"..."}
```

---

## Scenario-Based Mode (No Live System)

In scenario-based mode, labs are delivered as printed or digital case studies. Participants:
1. Read the scenario brief (included in each lab file)
2. Review the provided mock data (screenshots, log extracts, exported CSVs)
3. Answer the questions and complete the exercises on paper or in a shared doc
4. Compare answers against the facilitator's debrief notes

This mode is suitable for:
- Pre-delivery self-study
- Remote participants without sandbox access
- Printed-workbook-only delivery

---

## Lab Environment Architecture

```
[Participant browser]
        ↓
[Training IMS instance]
   ├── API Gateway (port 4000)
   ├── Core modules (ports 4001–4041)
   ├── Admin Console (port 3027)
   ├── Mock SCIM IdP
   └── Webhook receiver (logs all incoming payloads)
```

---

## Resetting Your Lab Environment

If your sandbox environment gets into an unexpected state, use the reset function:

**Admin Console → Settings → Lab Environment → Reset to Default State**

This will:
- Restore all sample users, roles, and module configurations
- Clear any API keys, webhooks, or custom roles you created
- Preserve your account credentials

**Note**: Reset takes approximately 60 seconds. Other participants' environments are unaffected.

---

## Lab Index

| Lab | Module | Duration | Mode |
|-----|--------|----------|------|
| LAB-01 | User Management & SCIM | 30 min | Live + scenario |
| LAB-02 | Roles & Permissions | 25 min | Scenario (design exercise) |
| LAB-03 | Module Activation | 35 min | Live |
| LAB-04 | Integration Management | 25 min | Live |
| LAB-05 | Audit Log Review | 30 min | Live + scenario |
| LAB-06 | Backup & Restore | 35 min | Live |
| LAB-07 | Platform Updates | 20 min | Scenario (planning exercise) |

---

## Technical Requirements (Participant)

| Requirement | Specification |
|-------------|--------------|
| Browser | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ |
| Screen resolution | 1280×800 minimum |
| Network | Internet access (for hosted sandbox); or LAN (for local instance) |
| Terminal (optional) | For pg_dump exercises in LAB-06 |
| Text editor | Any (for CSV exercises and planning documents) |

---

*If you experience persistent access issues, contact the facilitator immediately. Do not spend more than 5 minutes troubleshooting access before escalating.*
