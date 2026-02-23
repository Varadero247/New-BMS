# Non-Codeable Items — Actions Requiring Human Input

**Date:** 2026-02-17
**Context:** Items identified during launch readiness audit that cannot be resolved through code changes alone. These require manual intervention, external service access, or business decisions.

---

## CRITICAL — Must Resolve Before Launch

### 1. Revoke Exposed GitHub PAT Token

**What:** A GitHub Personal Access Token (`ghp_dWo...`) is embedded in the `.git/config` remote URL.

**Why it can't be coded:** Token revocation must be done through the GitHub web UI under Settings > Developer Settings > Personal Access Tokens. The token may have repo/org access that could be exploited.

**Steps:**

1. Go to https://github.com/settings/tokens
2. Find and **revoke** the token starting with `ghp_dWo`
3. Update the git remote to use SSH or a credential helper:
   ```bash
   git remote set-url origin git@github.com:YOUR_ORG/New-BMS.git
   ```
4. Verify with `git remote -v`

**Risk if skipped:** Anyone with repo access can extract the PAT and gain access to your GitHub account/organisation.

---

### 2. Set Production Kubernetes Domains

**What:** The Kubernetes ingress configuration (`deploy/k8s/base/ingress.yaml`) uses `*.example.com` placeholder domains.

**Why it can't be coded:** Production domain names are a business decision (e.g., `app.nexara.io`, `api.nexara.io`). DNS records, SSL certificates (via cert-manager), and CDN configuration depend on the chosen domains.

**Steps:**

1. Decide on production domain structure (e.g., `api.nexara.io`, `app.nexara.io`)
2. Update `deploy/k8s/overlays/production/ingress-patch.yaml` with real domains
3. Configure DNS A/CNAME records pointing to the K8s load balancer IP
4. Verify cert-manager issues valid TLS certificates

**Risk if skipped:** Application unreachable in production.

---

### 3. Set Production Environment Variables

**What:** Production deployments need real values for security-critical environment variables.

**Why it can't be coded:** These are secrets that must be generated/decided by the operator, not stored in code.

**Variables to set:**
| Variable | Requirement |
|----------|-------------|
| `JWT_SECRET` | Minimum 32 characters, cryptographically random |
| `POSTGRES_PASSWORD` | Strong password, not the dev default |
| `REDIS_URL` | Production Redis connection string |
| `CSRF_ENABLED` | Must be `true` in production |
| `NODE_ENV` | Must be `production` |
| All 44 `*_DATABASE_URL` vars | Production database connection strings |
| `STRIPE_SECRET_KEY` | Live Stripe key (if accepting payments) |
| `HUBSPOT_API_KEY` | Live HubSpot key (if CRM integration active) |
| `SENDGRID_API_KEY` or SMTP config | For email sending |

**Steps:**

1. Generate a strong JWT_SECRET: `openssl rand -hex 32`
2. Set up production PostgreSQL with strong credentials
3. Configure all DATABASE_URL variants to point to production DB
4. Store secrets in K8s Secrets, AWS Secrets Manager, or HashiCorp Vault
5. Update `deploy/k8s/base/secrets.yaml` or use external-secrets-operator

**Risk if skipped:** Using dev credentials in production = full compromise.

---

## HIGH — Should Resolve Before Launch

### 4. Dependency Major Version Upgrades

**What:** Several dependencies have known vulnerabilities that require major version bumps with potential API changes.

**Why it can't be coded:** Major version bumps may introduce breaking changes that need manual testing and code adjustments. The scope of changes is unknown without testing.

| Package          | Current    | Required     | Breaking Changes                                                |
| ---------------- | ---------- | ------------ | --------------------------------------------------------------- |
| ~~`nodemailer`~~ | ~~^6.9.8~~ | ~~>=7.0.11~~ | ~~DONE — Updated to ^7.0.11 in @ims/email~~                     |
| ~~`axios`~~      | ~~^1.6.x~~ | ~~>=1.13.5~~ | ~~DONE — Updated to ^1.7.9 across all 45 apps~~                 |
| `jspdf`          | ^4.0.0     | >=4.1.0      | LOW RISK — Only in legacy `apps/web`, not in any active web app |

**Steps:**

1. ~~Run `pnpm update axios`~~ — DONE
2. ~~Update `nodemailer` to v7~~ — DONE
3. Monitor `jspdf` releases for v4.1.0 (low priority — legacy app only)

---

### ~~5. Replace `xlsx` Package~~ — DONE ✅

**Resolution (2026-02-23):** `xlsx` replaced with `exceljs ^4.4.0` in `apps/web/package.json`. The single affected file (`apps/web/src/lib/export.ts`) has been rewritten — `exportToExcel` and all Excel helper functions are now async (return `Promise<void>`), using the ExcelJS workbook/worksheet API with styled headers, alternating row colours, and branded colour themes per ISO standard. Commit: see fix(deps) below.

---

### 6. Move K8s Secrets to External Secret Management

**What:** `deploy/k8s/base/secrets.yaml` is tracked in git. While it contains only placeholder values, the pattern encourages putting real secrets in version control.

**Why it can't be coded:** Requires infrastructure decisions:

- Which secret management tool? (AWS Secrets Manager, HashiCorp Vault, Sealed Secrets, External Secrets Operator)
- How will secrets be rotated?
- Who has access?

**Steps:**

1. Choose a secret management solution
2. Install the operator in K8s cluster (e.g., `external-secrets-operator`)
3. Create `ExternalSecret` resources instead of `Secret` resources
4. Add `deploy/k8s/base/secrets.yaml` to `.gitignore`
5. Document the secret management process

---

## MEDIUM — Should Resolve Before GA

### 7. Run `pnpm install` After Version Changes

**What:** The Next.js (15.1.x → 15.5.12) and React (19 → 18.3.1) version changes made during this audit updated `package.json` files but the lockfile (`pnpm-lock.yaml`) hasn't been regenerated.

**Why it can't be coded:** Running `pnpm install` on this monorepo requires significant memory/CPU and may produce interactive prompts about peer dependency conflicts. It needs human oversight.

**Steps:**

1. Run `pnpm install --no-frozen-lockfile`
2. Resolve any peer dependency warnings
3. Run `pnpm test` to verify all 11,808 tests still pass
4. Run `pnpm build` to verify all apps build successfully

---

### 8. Production Database Backup Strategy

**What:** No automated backup configuration exists for the PostgreSQL database (~590 tables across 44 schemas).

**Why it can't be coded:** Requires infrastructure decisions about backup frequency, retention period, storage location, and disaster recovery procedures.

**Decisions needed:**

- Backup frequency (hourly? daily?)
- Retention period (7 days? 30 days? 1 year?)
- Storage location (S3? GCS? separate server?)
- Point-in-time recovery requirements
- Cross-region replication needs

---

### 9. Production Monitoring & Alerting Setup

**What:** The `@ims/monitoring` package provides metrics endpoints and structured logging, but no external monitoring stack is configured.

**Why it can't be coded:** Requires choosing and deploying monitoring infrastructure.

**Recommended stack:**

- **Metrics:** Prometheus + Grafana (scrape `/metrics` endpoints on all 42 APIs)
- **Logging:** ELK Stack or Loki (aggregate structured logs)
- **Alerting:** PagerDuty/OpsGenie integration
- **APM:** Datadog or New Relic (optional)

**Steps:**

1. Deploy Prometheus in K8s cluster
2. Configure ServiceMonitor resources for each API service
3. Import Grafana dashboards
4. Set up alert rules (error rate > 1%, latency p99 > 2s, pod restarts)
5. Configure notification channels (Slack, PagerDuty)

---

### 10. SSL/TLS Certificate Configuration

**What:** cert-manager is referenced in K8s ingress annotations but no ClusterIssuer is configured.

**Why it can't be coded:** Requires domain ownership verification and choice of certificate authority.

**Steps:**

1. Install cert-manager in K8s cluster
2. Create a `ClusterIssuer` for Let's Encrypt (staging first, then production)
3. Verify domain ownership via DNS-01 or HTTP-01 challenge
4. Update ingress annotations with the issuer name

---

### 11. Email Sending Configuration

**What:** Marketing automation, onboarding sequences, and notification emails require a configured email provider.

**Why it can't be coded:** Requires an email service account and domain verification.

**Options:**

- SendGrid (recommended for transactional + marketing)
- AWS SES
- Postmark
- Self-hosted SMTP

**Steps:**

1. Sign up for email service provider
2. Verify sending domain (SPF, DKIM, DMARC records)
3. Set `SENDGRID_API_KEY` or SMTP credentials in environment
4. Test email delivery with onboarding sequence

---

### 12. Stripe Integration (If Applicable)

**What:** `api-marketing` has Stripe webhook handlers and the `@ims/stripe-client` package is configured.

**Why it can't be coded:** Requires a Stripe account with live API keys.

**Steps:**

1. Create/configure Stripe account
2. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in production env
3. Configure Stripe webhook URL to point to production gateway
4. Set up products/prices in Stripe dashboard
5. Test payment flow end-to-end

---

## LOW — Post-Launch Improvements

### 13. Custom Domain Email Addresses

Set up `noreply@nexara.io` (or equivalent) for transactional emails instead of using a generic provider address.

### 14. CDN Configuration

Configure CloudFlare, AWS CloudFront, or similar CDN in front of the Next.js web apps for edge caching and DDoS protection.

### 15. Load Testing in Production-Like Environment

Run the k6 load test scripts (`packages/performance/k6/`) against a staging environment that mirrors production hardware to establish realistic performance baselines.

### 16. Security Penetration Test

Commission a professional penetration test before handling real customer data. The automated security scans (CodeQL, Semgrep, Trivy, TruffleHog) cover known patterns but cannot find business logic vulnerabilities.

### 17. GDPR/Data Protection Assessment

If operating in the EU/UK, conduct a Data Protection Impact Assessment (DPIA) covering:

- User data storage and processing
- Data retention policies
- Right to erasure implementation
- Cross-border data transfers
- Privacy policy and cookie consent

---

## Summary

| Priority  | Count  | Category                                               |
| --------- | ------ | ------------------------------------------------------ |
| CRITICAL  | 3      | Security credentials, K8s domains, production env vars |
| HIGH      | 1      | Dependency upgrades (xlsx ✅ DONE)                      |
| MEDIUM    | 6      | pnpm install, backups, monitoring, SSL, email, Stripe  |
| LOW       | 5      | CDN, load testing, pen test, GDPR, custom email        |
| **Total** | **15** | (1 resolved)                                           |

**Estimated effort for CRITICAL items:** 2-4 hours (mostly configuration, not coding)
**Estimated effort for HIGH items:** 2-4 hours (dependency testing only — xlsx already replaced)
**Estimated effort for MEDIUM items:** 1-2 days (infrastructure setup)
