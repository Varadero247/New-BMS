# Security Policy

**Product:** Nexara IMS Platform
**Owner:** Nexara DMCC, Dubai Multi Commodities Centre Free Zone, Dubai, UAE

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x (current) | ✅ Active security updates |
| 0.9.x | ✅ Critical fixes only |
| < 0.9 | ❌ End of life |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through GitHub Issues.**

### Private Disclosure

Report vulnerabilities using GitHub's private security advisory feature:

1. Navigate to the **Security** tab of this repository
2. Click **"Report a vulnerability"**
3. Fill in the vulnerability details

Alternatively, email **security@nexara.io** with the subject line `[SECURITY] <brief description>`.

### What to Include

- **Description**: Clear description of the vulnerability
- **Impact**: What an attacker could achieve by exploiting it
- **Steps to reproduce**: Minimal steps to trigger the issue
- **Affected versions**: Which versions are affected
- **Suggested fix**: If you have a proposed fix (optional)

### Response Timeline

| Stage | Target |
|-------|--------|
| Acknowledgement | Within 48 hours |
| Initial assessment | Within 5 business days |
| Patch development | Within 30 days (critical: 7 days) |
| Public disclosure | Coordinated with reporter |

### Severity Classification

We use CVSS v3.1 for severity scoring:

| CVSS Score | Severity | Response |
|-----------|----------|----------|
| 9.0–10.0 | Critical | 7-day patch target |
| 7.0–8.9 | High | 14-day patch target |
| 4.0–6.9 | Medium | 30-day patch target |
| 0.1–3.9 | Low | Next release cycle |

## Scope

### In Scope

- **API Gateway** (port 4000) and all 42 microservices (4001–4041 + api-search:4050)
- **Authentication & authorisation** (JWT, RBAC, SAML, SCIM)
- **Web applications** (ports 3000–3045)
- **API endpoint security** (injection, IDOR, BOLA, BFLA)
- **Data exposure** (PII, credentials, financial data)
- **Infrastructure** (Kubernetes manifests, Docker images, CI/CD)

### Out of Scope

- Vulnerabilities requiring physical access to servers
- Findings from automated scanners without proof of exploitability
- Social engineering attacks against Nexara employees
- Vulnerabilities in third-party services (report to the respective vendor)
- Rate-limiting bypasses under 5× the stated limit
- Missing `httpOnly`/`secure` flags on non-sensitive cookies
- Clickjacking on pages that require authentication

## Security Acknowledgements

We thank all responsible disclosure reporters. With your permission, we list acknowledged researchers in our [CHANGELOG.md](../CHANGELOG.md) release notes.

## Security Controls

For a full description of implemented security controls, see [docs/SECURITY.md](../docs/SECURITY.md).

Key controls include:

- **Authentication**: JWT Bearer tokens (RS256, 15-min TTL), SAML 2.0 SSO, magic links
- **Authorisation**: Role-Based Access Control (39 roles, 7 permission levels)
- **Transport**: HTTPS enforced in production; HSTS headers set
- **Input validation**: Zod schema validation on all API endpoints; RASP middleware for injection detection
- **Rate limiting**: Per-IP and per-user rate limiting via Redis; auth endpoints at 5 req/15 min
- **Secrets**: Environment variables only; no secrets in code or logs
- **Audit logging**: All privileged actions logged with correlation IDs; 90-day retention
- **Dependencies**: Weekly Dependabot updates; daily pnpm audit in CI; Trivy container scanning
- **SAST/DAST**: CodeQL, Semgrep on every PR; OWASP ZAP baseline on main
