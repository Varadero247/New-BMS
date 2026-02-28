import Link from 'next/link';
import { notFound } from 'next/navigation';

const MODULE_CONTENT: Record<number, {
  title: string;
  day: number;
  duration: string;
  objectives: string[];
  sections: { heading: string; content: string }[];
}> = {
  1: {
    title: 'User Management & SCIM Provisioning',
    day: 1,
    duration: '90 min',
    objectives: [
      'Describe the full IMS user lifecycle from creation through deactivation',
      'Execute bulk user import via CSV with field mapping and error remediation',
      'Configure SCIM 2.0 provisioning with an external Identity Provider end-to-end',
      'Diagnose common SCIM provisioning failures using HTTP codes and event logs',
      'Design a user governance policy for your organisation',
    ],
    sections: [
      {
        heading: 'User Account States',
        content: 'The IMS recognises five user account states: **Active** (can log in), **Inactive** (no login; data retained), **Suspended** (temporary block), **Pending** (invited; not accepted), and **Deleted** (soft-deleted; 90-day retention). Deactivating a user does not delete their data — use Deleted state only for GDPR erasure requests.',
      },
      {
        heading: 'SCIM 2.0 Provisioning',
        content: 'SCIM (System for Cross-domain Identity Management) is an open standard protocol (RFC 7642-7644) that allows an IdP such as Azure AD or Okta to automatically create, update, and deactivate IMS accounts. Base URL: `/scim/v2`. Authentication: `Authorization: Bearer {SCIM_TOKEN}`. Key endpoints: `GET/POST /scim/v2/Users`, `PUT/PATCH/DELETE /scim/v2/Users/{id}`, `GET/POST /scim/v2/Groups`.',
      },
      {
        heading: 'Diagnosing SCIM Failures',
        content: 'Common HTTP response codes: **200/201** = Success. **401** = Invalid/expired token (rotate SCIM token). **409** = Duplicate email (remove duplicate). **422** = Invalid field value (check attribute mapping). **429** = Rate limited (reduce provisioning frequency). Check audit log: Admin Console → Audit Log → Category: INTEGRATION → Subtype: SCIM.',
      },
      {
        heading: 'User Governance Best Practices',
        content: 'Deprovisioning SLA: leavers within **24 hours**, role changes within **48 hours**. Conduct quarterly account audits: export user list, cross-reference against HR system, deactivate orphaned accounts. Avoid generic accounts (`admin@`, `it@`). Document shared service accounts in the integration registry.',
      },
    ],
  },
  2: {
    title: 'Role & Permission Configuration',
    day: 1,
    duration: '90 min',
    objectives: [
      'Identify all 39 predefined IMS roles and their default permission sets',
      'Explain the 7 permission levels and how they interact across module namespaces',
      'Construct a custom role matrix meeting a stated organisational security policy',
      'Evaluate existing role assignments for least-privilege violations',
      'Apply role inheritance and permission override rules to resolve access conflicts',
    ],
    sections: [
      {
        heading: '7 Permission Levels',
        content: 'The IMS uses a cumulative permission model: **0 None** (no access), **1 View** (read only), **2 Comment** (read + comment), **3 Create** (+ create records), **4 Edit** (+ modify records), **5 Delete** (+ archive/delete), **6 Admin** (+ module config). Each level includes all lower levels — you cannot have Edit without also having View, Comment, and Create.',
      },
      {
        heading: '39 Predefined Roles',
        content: 'Platform roles: SUPER_ADMIN, ORG_ADMIN, MODULE_ADMIN, AUDITOR. Governance roles: COMPLIANCE_MANAGER, RISK_MANAGER, QUALITY_MANAGER, HS_MANAGER, ENV_MANAGER, ESG_MANAGER. 10 operational roles, 10 specialist roles, 9 viewer/external roles. Multi-role users receive the most permissive level per namespace.',
      },
      {
        heading: 'Least-Privilege Principle',
        content: 'Every role assignment should grant only the minimum permissions required for the job. Red flags: SUPER_ADMIN assigned to more than 2 users; ADMIN on platform namespace for non-IT roles; external roles (CUSTOMER, SUPPLIER) with CREATE or higher. Conduct quarterly least-privilege audits using the Role Matrix Export.',
      },
    ],
  },
  3: {
    title: 'Module Activation & Configuration',
    day: 1,
    duration: '90 min',
    objectives: [
      'List all 44 IMS modules and identify their activation dependencies',
      'Interpret the module dependency graph to plan a safe activation sequence',
      'Activate and configure three IMS modules end-to-end',
      'Troubleshoot a module activation failure using event logs',
      'Create a module activation plan for a new IMS deployment',
    ],
    sections: [
      {
        heading: 'Activation States',
        content: 'Modules progress through: **INACTIVE** (not activated) → **ACTIVATING** (provisioning, 30–120 seconds) → **ACTIVE** (accessible). Error states: **ERROR** (failed; partial state), **SUSPENDED** (temporary disable), **ARCHIVED** (data preserved read-only). Always Reset to INACTIVE before retrying a failed activation.',
      },
      {
        heading: 'Hard Dependencies',
        content: 'Key hard dependencies: Incidents requires Health & Safety. Payroll requires HR. Financial Compliance requires Finance. Supplier Portal requires Suppliers. Customer Portal requires CRM. Energy requires Environment. Equipment Calibration requires CMMS. Always activate dependencies first.',
      },
      {
        heading: 'Wave-Based Activation',
        content: 'Wave 1 (Foundation): quality, health-safety, environment, hr, finance, risk, infosec. Wave 2 (Operational): incidents, audits, documents, training, payroll, cmms, inventory, crm. Wave 3 (Advanced): corrective-action, mgmt-review, assets, field-service, esg, energy, analytics. Wave 4 (Portals): customer-portal, supplier-portal, sector-specific modules.',
      },
    ],
  },
  4: {
    title: 'Integration Management',
    day: 1,
    duration: '90 min',
    objectives: [
      'Generate API keys with appropriate scope, expiry, and IP restrictions',
      'Configure an OAuth 2.0 client with correct redirect URIs and granted scopes',
      'Implement SAML 2.0 SSO by exchanging metadata, mapping attributes, and testing the flow',
      'Register a webhook endpoint with HMAC-SHA256 verification',
      'Audit the integration inventory for expired or overly-scoped credentials',
    ],
    sections: [
      {
        heading: 'API Key Best Practices',
        content: 'Always: set an expiry date (max 365 days), use minimum required scopes, restrict to known IP CIDR ranges, use descriptive names (system-purpose), document rotation procedures. Never: use `write:all` or `admin:*` unless specifically required, create keys with no expiry, share keys across teams.',
      },
      {
        heading: 'SAML 2.0 SSO',
        content: 'Configuration steps: (1) Export IMS SP metadata from Admin Console → Integrations → SAML. (2) Create IdP application with ACS URL `https://instance.nexara.io/saml/callback`. (3) Configure attribute mapping: NameID→email, givenName→firstName, surname→lastName, groups→IMS roles. (4) Upload IdP metadata to IMS. (5) Test SSO flow.',
      },
      {
        heading: 'Webhook Security',
        content: 'All webhook payloads are signed with HMAC-SHA256. Verify: `signature = sha256=HMAC_SHA256(secret, raw_body)`. Use `crypto.timingSafeEqual()` for comparison to prevent timing attacks. Retry policy: 1 min → 5 min → 30 min on 5xx responses. HTTP 4xx = no retry (client error).',
      },
    ],
  },
  5: {
    title: 'Audit Log Review',
    day: 2,
    duration: '90 min',
    objectives: [
      'Describe the IMS audit architecture including event ingestion, storage, and tamper-evidence',
      'Classify audit events using the IMS event taxonomy (5 categories, 47 event types)',
      'Filter audit logs to isolate specific user actions within a time window',
      'Investigate a simulated security incident using only audit log data',
      'Export audit data in CSV and JSON formats for regulatory reporting',
    ],
    sections: [
      {
        heading: 'Audit Architecture',
        content: 'The IMS audit log is append-only and tamper-evident using SHA-256 chained hashing. Every event includes: id, timestamp, actor (userId, email, ip), action, target (type, id, name), outcome (SUCCESS/FAILURE), sessionId, metadata, and hash. Retention: 7 years (ISO 27001 / GDPR Article 30).',
      },
      {
        heading: 'Event Taxonomy',
        content: '5 categories: **AUTH** (login, logout, MFA, tokens — 11 events), **DATA** (CRUD operations — 7 events), **ADMIN** (user/role/module/org changes — 11 events), **INTEGRATION** (API keys, OAuth, SAML, SCIM, webhooks — 12 events), **SYSTEM** (backup, restore, updates, alerts — 8 events). Total: 47 event types.',
      },
      {
        heading: 'Investigation Workflow',
        content: 'Step 1: Define the time window. Step 2: Filter by actor (if known) or event type. Step 3: Look for FAILURE events — these are entry points. Step 4: Pivot to DATA events to find what was accessed/changed. Step 5: Cross-reference IP address with known locations. Step 6: Export findings for incident report.',
      },
    ],
  },
  6: {
    title: 'Backup & Restore Procedures',
    day: 2,
    duration: '90 min',
    objectives: [
      'Explain the IMS backup architecture including full, incremental, and WAL-archive strategies',
      'Execute a manual pg_dump backup and verify backup integrity',
      'Configure automated backup schedules with retention policies',
      'Perform a restore from backup into a target environment',
      'Evaluate a backup audit report and identify gaps',
    ],
    sections: [
      {
        heading: 'Backup Architecture',
        content: 'Three tiers: **Full backup** (pg_dump, daily, 7-day local / 30-day warm / 365-day cold), **Incremental** (schema-specific pg_dump, 4-hourly), **WAL archiving** (continuous, enables PITR). RPO ≤ 1 hour (incremental) or ≤ 5 min (WAL). RTO ≤ 4 hours (full) or ≤ 1 hour (schema-level).',
      },
      {
        heading: 'Backup Command',
        content: '`pg_dump -h localhost -U postgres -d ims --format=custom --file=ims_YYYYMMDD.dump` then verify: `sha256sum ims_YYYYMMDD.dump` and `pg_restore --list ims_YYYYMMDD.dump > /dev/null`. Always verify before relying on a backup. Never use a backup that fails checksum verification.',
      },
      {
        heading: 'DR Runbook',
        content: '8-step process: (1) Declare DR incident, (2) Notify stakeholders + Nexara Support, (3) Identify clean backup, (4) Provision DR environment, (5) Restore from backup, (6) Validate restore, (7) Update DNS/load balancer, (8) Notify users. SLA: service restored within 4 hours of invocation.',
      },
    ],
  },
  7: {
    title: 'Platform Update Management',
    day: 2,
    duration: '60 min',
    objectives: [
      'Describe the Nexara IMS update lifecycle through release, staging, and production gates',
      'Plan a platform update using the 12-point pre-update checklist',
      'Monitor an update deployment using health checks and error dashboards',
      'Execute an emergency rollback within the 30-minute SLA',
      'Manage feature flags to enable/disable features independently of deployment',
    ],
    sections: [
      {
        heading: 'Update Types',
        content: '**Patch** (x.y.Z): bug fixes only; 48-hour notice; never breaking. **Minor** (x.Y.z): new features; deprecated warnings; 2-week notice. **Major** (X.y.z): breaking changes; 4-week notice; may require training. Always read the full changelog before applying any update.',
      },
      {
        heading: 'Rollback SLA',
        content: 'Rollback must be initiated within **30 minutes** of confirming an update failure. Auto-rollback triggers: health check fails ×3, or error rate > 5% for 2 consecutive minutes. Manual rollback: Admin Console → Settings → Platform Updates → [Version] → Rollback. Notify Nexara Support with reason.',
      },
      {
        heading: 'Feature Flags',
        content: 'Feature flags enable/disable features independently of code deployment. Uses: gradual rollout (10% → 50% → 100%), A/B testing, emergency disable, per-org access control. Every flag should have an expiry date. Review and remove expired flags quarterly to prevent technical debt accumulation.',
      },
    ],
  },
};

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const moduleId = parseInt(id, 10);
  const mod = MODULE_CONTENT[moduleId];

  if (!mod) notFound();

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/modules" className="text-sm text-slate-400 hover:text-white transition-colors">← Back to Modules</Link>
        <div className="flex items-center gap-3 mt-4 mb-2">
          <span className="w-10 h-10 rounded-lg bg-[#B8860B] text-white font-bold flex items-center justify-center text-lg">
            {moduleId}
          </span>
          <div>
            <div className="text-xs text-slate-400">Day {mod.day} · {mod.duration}</div>
            <h1 className="text-2xl font-bold text-white">{mod.title}</h1>
          </div>
        </div>
      </div>

      {/* Objectives */}
      <section className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-[#B8860B] uppercase tracking-wider mb-4">Learning Objectives</h2>
        <ol className="space-y-2">
          {mod.objectives.map((obj, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-300">
              <span className="text-[#B8860B] font-bold shrink-0">{i + 1}.</span>
              {obj}
            </li>
          ))}
        </ol>
      </section>

      {/* Content Sections */}
      <div className="space-y-6">
        {mod.sections.map((section) => (
          <section key={section.heading} className="bg-[#1E3A5F]/20 border border-[#1E3A5F] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-3">{section.heading}</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {section.content.split('**').map((part, i) =>
                i % 2 === 0 ? part : <strong key={i} className="text-white font-semibold">{part}</strong>
              )}
            </p>
          </section>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-[#1E3A5F]">
        {moduleId > 1 ? (
          <Link href={`/modules/${moduleId - 1}`} className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Module {moduleId - 1}
          </Link>
        ) : <div />}
        {moduleId < 7 ? (
          <Link href={`/modules/${moduleId + 1}`} className="text-sm text-[#B8860B] hover:text-[#D4A017] transition-colors">
            Module {moduleId + 1} →
          </Link>
        ) : (
          <Link href="/labs/1" className="text-sm text-[#B8860B] hover:text-[#D4A017] transition-colors">
            Go to Labs →
          </Link>
        )}
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return [1, 2, 3, 4, 5, 6, 7].map((id) => ({ id: String(id) }));
}
