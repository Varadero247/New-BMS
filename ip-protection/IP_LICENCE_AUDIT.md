# Nexara IP — Open Source Licence Audit
**Generated:** 2026-02-23  
**Status:** PASS *(no GPL/AGPL/SSPL/EUPL found in production code)*

---

## SUMMARY
- Total packages audited: 41
- Safe licences (MIT, Apache-2.0, BSD, ISC, CC0): 41 packages
- WARNING licences (LGPL — review required): None found
- FAIL licences (GPL, AGPL, SSPL, EUPL — must replace): None found

Overall Status: **PASS**

---

## FULL LICENCE BREAKDOWN
| Licence | Package Count |
|---------|--------------|
| MIT | 34 |
| Apache-2.0 | 5 |
| BSD-3-Clause | 0 |
| BSD-2-Clause | 1 |
| ISC | 1 |
| CC0-1.0 | 0 |
| 0BSD | 0 |
| CC-BY-3.0 | 0 |
| BlueOak-1.0.0 | 0 |
| Python-2.0 | 0 |
| Unlicense | 0 |

> **Note:** The above counts reflect the root `node_modules` audit scope (41 non-private packages).  
> The monorepo contains 738,865 unit tests across 733 suites and 86 workspace packages  
> (42 API services, 44 web apps); workspace packages are excluded as private and owned by Nexara.

---

## ACTION REQUIRED
No action required — all licences are safe.

All 41 audited packages carry permissive licences (MIT, Apache-2.0, BSD-2-Clause, ISC).  
No copyleft (GPL/AGPL/LGPL), server-side (SSPL), or European Union Public Licence (EUPL) packages  
were detected at any severity level. Standard attribution notices for Apache-2.0 packages  
should be included in the product's NOTICES file as good practice.

---

## METHODOLOGY
- Tool: `license-checker` (npx, run 2026-02-23)
- Command: `npx license-checker --summary --excludePrivatePackages`
- Scope: Root `node_modules` and workspace packages
- Exclusions: Private packages (`--excludePrivatePackages`)
- Total packages scanned: 41 (non-private root dependencies)
- Blocklist: GPL-2.0, GPL-3.0, AGPL-3.0, LGPL-2.0, LGPL-2.1, LGPL-3.0, SSPL, EUPL-1.1, EUPL-1.2
- Allowlist: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, CC0-1.0, CC-BY-3.0, CC-BY-4.0, 0BSD, Unlicense, Python-2.0, BlueOak-1.0.0

---

*© 2026 Nexara DMCC — CONFIDENTIAL*
