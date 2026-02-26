# Nexara IP Protection
**CONFIDENTIAL — NEXARA DMCC INTERNAL USE ONLY**

This directory contains all IP protection materials for the Nexara IMS Platform.
© 2026 Nexara DMCC. All rights reserved.

---

## Files in This Directory

| File | Purpose | Status |
|------|---------|--------|
| `TRADE_SECRET_REGISTER.md` | Formal register of all trade secrets | Requires human review & completion |
| `NDA_TEMPLATE.md` | Mutual NDA for contractors/partners | **Requires solicitor review before use** |
| `IP_ASSIGNMENT_LETTER.md` | Past contractor IP assignment letter | **Requires solicitor review before use** |
| `CONTRACTOR_IP_AGREEMENT_CLAUSE.md` | Clause for new contractor agreements | **Requires solicitor review before use** |
| `IP_LICENCE_AUDIT.md` | Open source licence compliance audit | Auto-generated — review flagged packages |
| `ENTITY_NAME_AUDIT.md` | Audit of company entity name usage | Review any flagged files |
| `archives/ARCHIVE_LOG.md` | Monthly codebase archive provenance log | Auto-maintained by CI/CD |
| `archives/*.tar.gz` | Monthly SHA-256-verified codebase snapshots | Auto-generated |
| `create_archive.sh` | Script to create a dated provenance archive | Run monthly or after major releases |

---

## Automated Protections — Now Active

| Protection | Mechanism | Status |
|-----------|-----------|--------|
| Copyright headers on all source files | Added to 6,872 .ts/.js/.mjs/.prisma files | ✅ Active |
| Licence compliance check on every PR | `.github/workflows/ip-protection.yml` | ✅ Active |
| Copyright header check on new files | `.github/workflows/ip-protection.yml` | ✅ Active |
| Monthly codebase archive (CI/CD) | GitHub Actions schedule cron | ✅ Active |
| Monthly codebase archive (local) | `ip-protection/create_archive.sh` | ✅ Active |
| Confidentiality notices on all internal docs | Added to 88 files in `docs/` | ✅ Active |

---

## Next Human Actions Required

| Action | Owner | Deadline | Priority |
|--------|-------|----------|----------|
| File UK Trademark for "Nexara" and "Nexara IMS" at gov.uk/apply-register-trade-mark | Founder | 7 Mar 2026 | 🔴 HIGH |
| Review and complete `TRADE_SECRET_REGISTER.md` (Founder + Legal) | Founder + Legal Counsel | 7 Mar 2026 | 🔴 HIGH |
| Execute NDAs with all current contractors | Founder | Immediately | 🔴 HIGH |
| Send `NDA_TEMPLATE.md` to solicitor for review | Founder | 14 Mar 2026 | 🔴 HIGH |
| Send `IP_ASSIGNMENT_LETTER.md` to solicitor, then to all past contractors | Founder + Legal Counsel | 21 Mar 2026 | 🔴 HIGH |
| Review `IP_LICENCE_AUDIT.md` and replace any flagged packages | Engineering Lead | 21 Mar 2026 | 🟡 MEDIUM |
| Review `ENTITY_NAME_AUDIT.md` and correct any flagged files | Engineering Lead | 21 Mar 2026 | 🟡 MEDIUM |
| File UAE trademark with MOCIIA (UAE IP portal) | Founder + Legal | Within 1 month of UK filing | 🟡 MEDIUM |
| File EU trademark (EUIPO) | Founder + Legal | Within 6 months of UK filing | 🟡 MEDIUM |
| File US trademark (USPTO) | Founder + Legal | Within 6 months of UK filing | 🟡 MEDIUM |
| Obtain signed `CONTRACTOR_IP_AGREEMENT_CLAUSE.md` equivalents from all future contractors | Founder | Before any new engagement starts | 🔴 HIGH |

---

## DMCC Compliance Notes

As a DMCC Free Zone entity, Nexara DMCC should also:
- Maintain IP ownership records with DMCC Authority
- Ensure all trade secret registrations are consistent with DMCC company registration details
- Consider registering key software with UAE Ministry of Economy (copyright registration)

**UAE Copyright Law:** Federal Decree-Law No. 38 of 2021 on Copyright and Neighbouring Rights provides automatic copyright protection from the moment of creation. No registration is required, but documentation of creation dates (evidenced by this archive log) is essential for enforcement.

---

## Archive Verification

To verify the integrity of any archive entry:
```bash
shasum -a 256 ip-protection/archives/<archive-filename>.tar.gz
# Compare output with the hash in archives/ARCHIVE_LOG.md
```

To create a new archive manually:
```bash
bash ./ip-protection/create_archive.sh
```

First archive: `nexara-ip-archive-2026-02-23-f2d9add27.tar.gz`
SHA-256: `19c9dad763d1a0012eb640f1ce73bcbac43c1b027eb68d0ff18db94c47fac60f`

---

*© 2026 Nexara DMCC — CONFIDENTIAL — TRADE SECRET*
*This directory and its contents are proprietary to Nexara DMCC.*
*Unauthorised disclosure is strictly prohibited.*
