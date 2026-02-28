'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter, notFound } from 'next/navigation';

// ── Question banks ────────────────────────────────────────────────────────────

type Question = {
  q: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3; // 0=A 1=B 2=C 3=D
  explanation?: string;
};

// Pre-Assessment — 20 Q diagnostic (unscored)
const PRE_QUESTIONS: Question[] = [
  // Section A: Identity & Access Management
  { q: 'What does SCIM stand for?', options: ['Secure Configuration and Identity Management', 'System for Cross-domain Identity Management', 'Standard Cloud Identity Mechanism', 'Structured Credential and Integration Model'], answer: 1 },
  { q: 'Which of the following best describes "deprovisioning"?', options: ['Adding a user to a new system', 'Removing a user\'s access when they leave an organisation', 'Resetting a user\'s password', 'Granting temporary elevated access'], answer: 1 },
  { q: 'In RBAC, what does "least privilege" mean?', options: ['Users should have the minimum permissions needed to do their job', 'Junior staff should have fewer permissions than senior staff', 'All users should have read-only access by default', 'Permissions should be granted manually for each action'], answer: 0 },
  { q: 'What is a JWT?', options: ['A type of database backup', 'A JSON-formatted token used for authentication', 'A webhook delivery format', 'A SAML assertion type'], answer: 1 },
  // Section B: Role-Based Access Control
  { q: 'In a cumulative permission model with 6 levels, can a user have EDIT permission without also having VIEW?', options: ['Yes, permissions are independent', 'No, permissions are cumulative — each level includes all lower levels', 'Yes, if an admin explicitly grants EDIT only', 'Depends on the module'], answer: 1 },
  { q: 'What is the most secure practice when assigning admin roles?', options: ['Share one admin account across the IT team', 'Give all IT staff admin access for convenience', 'Assign named individual accounts with minimum required permissions', 'Rotate admin access weekly'], answer: 2 },
  { q: 'A user has two roles: Role A grants View to Module X, Role B grants Edit to Module X. What is their effective access?', options: ['View (most restrictive wins)', 'Edit (most permissive wins)', 'Neither (conflicting roles cancel)', 'Depends on which role was assigned first'], answer: 1 },
  { q: 'What is a "DENY override" in access control?', options: ['A role that blocks all access to the system', 'An explicit denial that overrides any role-granted permission', 'A temporary suspension of a user account', 'A failed permission check logged in the audit trail'], answer: 1 },
  // Section C: Integration Basics
  { q: 'What is the purpose of an API key?', options: ['To encrypt database backups', 'To authenticate programmatic access to an API', 'To configure SAML SSO', 'To sign audit log entries'], answer: 1 },
  { q: 'In SAML SSO, what is the Identity Provider (IdP)?', options: ['The system receiving the SAML assertion (e.g., Nexara IMS)', 'The system authenticating the user and issuing the assertion (e.g., Azure AD)', 'The certificate authority that signs the SAML assertion', 'The user\'s browser'], answer: 1 },
  { q: 'What is a webhook?', options: ['A scheduled database query', 'An HTTP callback that pushes event notifications to an external endpoint', 'A type of API key with limited scope', 'A SCIM provisioning trigger'], answer: 1 },
  { q: 'HMAC-SHA256 in webhook signatures is used to:', options: ['Encrypt the webhook payload', 'Compress the payload for faster delivery', 'Verify the payload was sent by the expected sender and was not tampered with', 'Generate a unique event ID'], answer: 2 },
  // Section D: Audit & Compliance
  { q: 'Why is an "append-only" audit log important?', options: ['It makes the log faster to write', 'Past events cannot be modified or deleted, providing tamper-evidence', 'It reduces storage costs', 'It allows events to be replayed'], answer: 1 },
  { q: 'Which of these is an authentication event in an audit log?', options: ['User created a risk record', 'User exported a report', 'User logged in', 'User changed module configuration'], answer: 2 },
  { q: 'For how many years should audit logs typically be retained under ISO 27001?', options: ['1 year', '3 years', '5 years', '7 years'], answer: 3 },
  { q: 'What does it mean to "forward audit events to a SIEM"?', options: ['Archive the audit log to cold storage', 'Send real-time audit events to a security monitoring platform for analysis', 'Export the audit log to a spreadsheet for manual review', 'Delete old audit events after processing'], answer: 1 },
  // Section E: Backup & Operations
  { q: 'What is pg_dump?', options: ['A PostgreSQL tool for restoring databases', 'A PostgreSQL tool for creating database backups', 'A monitoring command for checking database health', 'A migration tool for schema changes'], answer: 1 },
  { q: 'What is Recovery Point Objective (RPO)?', options: ['The maximum time to restore a system after a failure', 'The maximum acceptable amount of data loss measured in time', 'The percentage of data that must be recovered', 'The time between backups'], answer: 1 },
  { q: 'Which of the following is a "breaking change" in a software update?', options: ['A bug fix that doesn\'t affect APIs', 'A performance improvement', 'A new feature disabled by default', 'A change that removes a feature or modifies an API in a way that breaks existing integrations'], answer: 3 },
  { q: 'What is a "feature flag"?', options: ['A warning icon in the admin console', 'A configuration toggle that enables or disables a feature independently of code deployment', 'A security certificate for a specific feature', 'A user permission for experimental features'], answer: 1 },
];

// Day 1 Formative Assessment — 15 Q scored (Modules 1–4)
const DAY1_QUESTIONS: Question[] = [
  { q: 'A user\'s SCIM provisioning is failing with HTTP 409. What is the most likely cause?', options: ['The SCIM bearer token has expired', 'A user with the same email address already exists in the system', 'The IdP group is not mapped to an IMS role', 'The SCIM endpoint URL is incorrect'], answer: 1, explanation: 'HTTP 409 Conflict means the resource already exists — a duplicate email in this context.' },
  { q: 'What IMS audit event confirms a user was deprovisioned via SCIM?', options: ['USER_DELETED', 'AUTH_LOGOUT', 'SCIM_USER_DEACTIVATE', 'USER_UPDATED'], answer: 2, explanation: 'SCIM_USER_DEACTIVATE is the specific event logged when SCIM deprovisioning sets an account to Inactive.' },
  { q: 'A new employee\'s invitation email expired before they accepted it. What is their account status and the correct action?', options: ['Status: Active — no action needed', 'Status: Pending — resend invitation', 'Status: Inactive — reactivate the account', 'Status: Deleted — create a new account'], answer: 1, explanation: 'Pending means invited but not accepted. Resend the invitation to generate a new activation link.' },
  { q: 'An HS Manager needs to cover the Quality Manager role for two weeks. What is the CORRECT approach?', options: ['Assign QUALITY_MANAGER permanently', 'Give a DENY override on other namespaces', 'Use a Temporary Access Grant expiring in 14 days', 'Create a combined HS+Quality custom role'], answer: 2, explanation: 'Temporary Access Grants are designed for exactly this use case — they auto-revoke at expiry with no manual cleanup.' },
  { q: 'A user has Role A (health_safety: EDIT) and Role B (health_safety: VIEW). What is their effective permission?', options: ['VIEW (most restrictive)', 'EDIT (most permissive)', 'ADMIN (combined)', 'NONE (conflict)'], answer: 1, explanation: 'Most permissive wins per namespace. EDIT > VIEW, so the effective level is EDIT.' },
  { q: 'Which statement about DENY overrides is correct?', options: ['DENY overrides are automatically removed after 24 hours', 'An explicit DENY at the user level overrides all role-granted permissions', 'DENY overrides must be approved by SUPER_ADMIN', 'DENY overrides only affect modules with ADMIN permission'], answer: 1, explanation: 'DENY overrides explicitly block access regardless of any role-granted permission for that namespace.' },
  { q: 'Module A cannot be activated because "dependency not met". Where would you look first?', options: ['Admin Console → Users → All Users', 'Admin Console → Module Registry → [Module A] → Dependencies tab', 'Admin Console → Audit Log → Filter: AUTH', 'Admin Console → Integrations → API Keys'], answer: 1, explanation: 'The Dependencies tab in Module Registry shows all hard and soft dependencies for the module.' },
  { q: 'An admin activated Module X before its dependency Module Y. Module X is now in ERROR state. What is the correct sequence?', options: ['Delete Module X and start over', 'Activate Module Y, then wait for Module X to auto-recover', 'Reset Module X to INACTIVE, activate Module Y, then re-activate Module X', 'Contact Nexara Support immediately'], answer: 2, explanation: 'Always Reset to INACTIVE before retrying. Then satisfy the dependency, then re-activate.' },
  { q: 'What is the difference between a hard dependency and a soft dependency in module activation?', options: ['Hard are permanent; soft can be removed later', 'Hard are strictly required; soft are recommended but not blocking', 'Hard are set by Nexara; soft are set by the administrator', 'There is no functional difference'], answer: 1, explanation: 'Hard dependencies block activation entirely. Soft dependencies produce a warning but activation proceeds.' },
  { q: 'You generate an API key for a third-party analytics tool. Which configuration is BEST?', options: ['Scopes: read:all, expiry: none, IP: unrestricted', 'Scopes: read:analytics, expiry: 90 days, IP: analytics server CIDR', 'Scopes: admin:integrations, expiry: 365 days, IP: unrestricted', 'Scopes: write:all, expiry: 30 days, IP: analytics server CIDR'], answer: 1, explanation: 'Minimum scope + expiry + IP restriction is the gold standard. read:analytics covers only what\'s needed.' },
  { q: 'During SAML SSO configuration, what is the ACS URL used for?', options: ['It identifies the IMS to the Identity Provider', 'It is the endpoint where the IdP POSTs SAML assertions after authentication', 'It is the URL users are sent to after logout', 'It is the IdP\'s metadata URL'], answer: 1, explanation: 'Assertion Consumer Service URL = the IMS endpoint that receives and validates SAML assertions from the IdP.' },
  { q: 'You receive a webhook with header X-Nexara-Signature: sha256=a3f2b... How do you verify it?', options: ['Decode the base64 payload and check for valid JSON', 'Compute HMAC-SHA256 of the raw request body using your webhook secret and compare', 'Send the signature to Nexara for validation via the API', 'Check the audit log for the corresponding WEBHOOK_FIRED event'], answer: 1, explanation: 'HMAC-SHA256 of the raw body with the shared secret. Always use timing-safe comparison.' },
  { q: 'A developer asks for an API key to "do everything they need". What is the correct response?', options: ['Generate a key with write:all scope', 'Ask for specifics: which endpoints, modules, operations — then grant minimum required scopes', 'Refuse API access; use the admin console instead', 'Generate a key with admin:integrations scope'], answer: 1, explanation: 'Scope creep is a major security risk. Always clarify and grant the minimum required scopes.' },
  { q: 'How often should API keys be rotated as a minimum best practice?', options: ['Every 30 days', 'Every 90 days', 'Annually, or immediately when suspected compromised', 'Never — only revoke when confirmed compromised'], answer: 2, explanation: 'Annual rotation is the documented minimum. Immediate rotation is required on any suspicion of compromise.' },
  { q: 'A webhook has a 35% delivery failure rate over 7 days. What should you do first?', options: ['Increase retry attempts to 10', 'Delete the webhook and recreate it', 'Check the delivery logs for HTTP response codes returned by the endpoint', 'Contact Nexara Support to investigate the webhook service'], answer: 2, explanation: 'Delivery logs show the HTTP status codes. 5xx = server issue at receiving end; 4xx = configuration problem.' },
];

// Summative Assessment Part A — 40 MCQ (45 minutes timed)
const FINAL_QUESTIONS: Question[] = [
  // User Management & SCIM (Q1–8)
  { q: 'What SCIM endpoint is used to create a new user?', options: ['GET /scim/v2/Users', 'POST /scim/v2/Users', 'PUT /scim/v2/Users', 'PATCH /scim/v2/Users'], answer: 1 },
  { q: 'A user in "Pending" state has existed for 96 hours. What has most likely happened?', options: ['They were manually deactivated', 'The invitation email expired (valid for 72 hours) and they never accepted', 'Their SCIM provisioning failed silently', 'Their account was soft-deleted by an admin'], answer: 1 },
  { q: 'What is the maximum recommended validity period for a SCIM bearer token?', options: ['30 days', '90 days', '365 days', 'Tokens should never expire'], answer: 2 },
  { q: 'You receive a SCIM alert with HTTP 422 for a new user. The most likely cause is:', options: ['The SCIM token has expired', 'A required field is missing or contains an invalid value', 'The email already exists in the system', 'The IMS is temporarily unavailable'], answer: 1 },
  { q: 'Which provisioning method is most appropriate for a company with 1,200 employees using Azure AD?', options: ['Manual creation via admin console', 'CSV bulk import', 'SCIM 2.0 auto-provisioning', 'API batch create script'], answer: 2 },
  { q: 'A leaver deprovisioned via SCIM will have their account state changed to:', options: ['Deleted', 'Suspended', 'Inactive', 'Pending'], answer: 2 },
  { q: 'SCIM provisioning worked for 6 months. This morning all new attempts fail with HTTP 401. Check first:', options: ['The SCIM endpoint URL', 'The SCIM bearer token (may have expired or been rotated)', 'The group-to-role mapping', 'The attribute mapping configuration'], answer: 1 },
  { q: 'Which of the following is a security risk with shared admin accounts?', options: ['Shared accounts run faster than individual accounts', 'The audit trail cannot attribute actions to a specific person', 'Shared accounts cannot be assigned SCIM groups', 'Shared accounts bypass the rate limiter'], answer: 1 },
  // Roles & Permissions (Q9–16)
  { q: 'How many predefined roles exist in the Nexara IMS?', options: ['17', '28', '39', '44'], answer: 2 },
  { q: 'A user needs to view records in health_safety but never create, edit, or delete. Which permission level?', options: ['NONE (0)', 'VIEW (1)', 'COMMENT (2)', 'CREATE (3)'], answer: 1 },
  { q: 'The AUDITOR role grants which of the following?', options: ['ADMIN on the compliance namespace only', 'VIEW on all 17 namespaces plus audit log export rights', 'EDIT on all namespaces except platform', 'ADMIN on the audit namespace only'], answer: 1 },
  { q: 'A SUPER_ADMIN has what scope of access?', options: ['All modules within a single organisation', 'The platform namespace only', 'All organisations, all modules, all operations', 'All modules within all organisations (read-only)'], answer: 2 },
  { q: 'When should a custom role be created instead of a predefined role?', options: ['Whenever a new employee joins', 'Only when no predefined role provides the exact combination required and the use case is justified', 'For all contractor and external users', 'When SUPER_ADMIN decides a new role is needed'], answer: 1 },
  { q: 'A user has Role A (finance: EDIT, hr: VIEW) and Role B (finance: VIEW, hr: ADMIN). Effective permissions?', options: ['finance: VIEW, hr: VIEW', 'finance: EDIT, hr: ADMIN', 'finance: ADMIN, hr: ADMIN', 'finance: EDIT, hr: VIEW'], answer: 1 },
  { q: 'Temporary Access Grants are automatically:', options: ['Promoted to permanent roles after 30 days', 'Revoked at the specified expiry time', 'Logged only when manually revoked', 'Applied to all users in the same department'], answer: 1 },
  { q: 'In a quarterly least-privilege audit, which finding is highest severity?', options: ['3 users with COMMENT permission on quality namespace', 'SUPER_ADMIN assigned to 6 users including junior IT staff', 'A contractor with VIEW access to inventory records', 'A module admin with EDIT on their own module'], answer: 1 },
  // Module Activation (Q17–22)
  { q: 'A module in ERROR state means:', options: ['The module must be deleted and reinstalled', 'Activation failed partway through; the module is in a partial state requiring intervention', 'The module\'s licence has expired', 'The module is currently updating'], answer: 1 },
  { q: 'Which module has a hard dependency on the HR module?', options: ['Risk Register', 'Payroll', 'Audit Management', 'Document Control'], answer: 1 },
  { q: 'In a Wave 1 (Foundation) activation, which modules are included?', options: ['Modules with hard dependencies on other modules', 'Portal and sector-specific modules', 'Modules with no activation dependencies', 'The most recently released modules'], answer: 2 },
  { q: 'An admin attempts to activate Incidents before Health & Safety. What happens?', options: ['Incidents activates but without incident categorisation', 'Incidents fails with a DEPENDENCY_NOT_MET error', 'Health & Safety is automatically activated first', 'Both modules activate together'], answer: 1 },
  { q: 'Module data in ARCHIVED state is:', options: ['Permanently deleted after 90 days', 'Accessible to all users in read-only format', 'Preserved but inaccessible until restored; readable by admins only', 'Moved to cold storage but deletable on demand'], answer: 2 },
  { q: 'How long does a typical IMS module activation take?', options: ['1–5 seconds', '30–120 seconds', '5–10 minutes', '1 hour'], answer: 1 },
  // Integration Management (Q23–28)
  { q: 'Which OAuth 2.0 grant type is appropriate for server-to-server integration with no user interaction?', options: ['Authorization Code', 'Implicit', 'Client Credentials', 'Device Code'], answer: 2 },
  { q: 'In SAML SSO configuration, what is the Entity ID?', options: ['The SAML assertion\'s unique identifier', 'A unique identifier for the Service Provider (IMS instance) used in metadata', 'The user\'s employee ID in the IdP', 'The session identifier assigned after authentication'], answer: 1 },
  { q: 'An API key with scope read:incidents write:all violates which best practice?', options: ['Keys should not combine read and write scopes', 'Keys should use minimum required scopes (write:all is over-privileged)', 'Keys should not include module-specific scopes', 'This configuration is acceptable for data integration keys'], answer: 1 },
  { q: 'A webhook delivery fails with HTTP 500. According to the IMS retry policy, what happens next?', options: ['The delivery is marked FAILED immediately', 'The IMS retries after 1 min, then 5 min, then 30 min', 'The IMS retries every 5 minutes for 24 hours', 'An admin receives an email and manually retries'], answer: 1 },
  { q: 'The X-Nexara-Signature header contains sha256=abc123... What does the sha256= prefix indicate?', options: ['The payload is encrypted with AES-256', 'The signature was computed using HMAC-SHA256', 'The payload format is JSON Schema v256', 'The delivery uses a SHA-256 TLS certificate'], answer: 1 },
  { q: 'You find an API key created 14 months ago, no expiry, scope admin:users, from a developer who left 3 months ago. Correct action?', options: ['Leave it — changing it might break something', 'Reduce the scope to read-only', 'Immediately revoke; audit usage; generate a replacement if still needed with proper config', 'Set an expiry date of 30 days from now'], answer: 2 },
  // Audit Log Review (Q29–34)
  { q: 'An audit event with category ADMIN and action ROLE_ASSIGNED means:', options: ['A user logged in with admin privileges', 'An administrator granted a role to a user', 'A role was created in the system', 'A module admin activated a new module'], answer: 1 },
  { q: 'The IMS audit log uses chained SHA-256 hashing. This means:', options: ['All events are encrypted using SHA-256', 'Modifying any past event invalidates the hash of all subsequent events, making tampering detectable', 'The audit log cannot be exported until all hashes are verified', 'Only SUPER_ADMIN can read the hash values'], answer: 1 },
  { q: 'You need all actions by a specific user over the last 30 days. Which filters?', options: ['Category = AUTH, Date range = last 30 days', 'Actor = [user email], Date range = last 30 days', 'Outcome = SUCCESS, Actor = [user email]', 'Event type = DATA_EXPORTED, Actor = [user email]'], answer: 1 },
  { q: 'An audit event with outcome FAILURE indicates:', options: ['The IMS encountered a server error', 'The action was attempted but did not complete successfully (e.g., access denied)', 'The user was locked out of the system', 'The event was recorded but the operation was rolled back'], answer: 1 },
  { q: 'For ISO 27001 compliance, which export demonstrates all privileged access changes over the past year?', options: ['Category = DATA, Date range = last year', 'Category = ADMIN, Event types = ROLE_ASSIGNED, ROLE_REMOVED, PERMISSION_OVERRIDE', 'Category = AUTH, Event types = AUTH_LOGIN_SUCCESS', 'Category = INTEGRATION, Date range = last year'], answer: 1 },
  { q: 'Audit log integrity verification returns a "chain broken" error for events between 14:00–14:30. This indicates:', options: ['The audit service was unavailable during that window', 'One or more events in that window were modified or deleted after being written', 'Events are stored in batches and the batch boundary is at 14:00', 'The hash algorithm was changed during that window'], answer: 1 },
  // Backup & Restore (Q35–38)
  { q: 'What is the purpose of --format=custom in a pg_dump command?', options: ['Dumps only the custom schemas in the database', 'Creates a binary, compressed, parallel-restorable backup file', 'Exports the database in human-readable SQL format', 'Enables custom retention policies'], answer: 1 },
  { q: 'After a backup, sha256sum --check ims_backup.sha256 fails. What should you do?', options: ['Use the backup anyway — checksum failures are usually false positives', 'Do not use this backup; investigate storage corruption; run a fresh backup immediately', 'Re-run sha256sum with the --ignore-errors flag', 'Restore the backup to verify it works'], answer: 1 },
  { q: 'What is the Recovery Time Objective (RTO) for the IMS?', options: ['≤ 5 minutes (with WAL archiving)', '≤ 1 hour for schema-level restore; ≤ 4 hours for full restore', '≤ 24 hours regardless of restore type', '≤ 30 minutes (matching the rollback SLA)'], answer: 1 },
  { q: 'In the DR runbook, dual authorisation (two named admins) is required for:', options: ['All backup jobs', 'All restore operations regardless of environment', 'Production environment restores only', 'Restore operations that exceed 10 GB'], answer: 2 },
  // Platform Updates (Q39–40)
  { q: 'A platform update is automatically rolled back if:', options: ['Any user reports an error within 1 hour', 'Health check fails 3 consecutive times or error rate exceeds 5% for 2 consecutive minutes', 'The update takes longer than 60 minutes', 'Any Grafana alert fires during the update window'], answer: 1 },
  { q: 'A feature flag set to 50% rollout means:', options: ['The feature is 50% complete', '50% of the feature\'s functionality is enabled', '50% of eligible users see the new feature; 50% see the old behaviour', 'The feature will be fully released in 50 days'], answer: 2 },
];

// ── Config ────────────────────────────────────────────────────────────────────

const ASSESSMENT_CONFIG = {
  pre:   { title: 'Pre-Assessment',                questions: PRE_QUESTIONS,   scored: false, time: null     },
  day1:  { title: 'Day 1 Formative Assessment',    questions: DAY1_QUESTIONS,  scored: true,  time: 15 * 60, pass: 0.70 },
  final: { title: 'Summative Assessment — Part A', questions: FINAL_QUESTIONS, scored: true,  time: 45 * 60, pass: 0.75 },
} as const;

type AssessmentType = keyof typeof ASSESSMENT_CONFIG;

// ── Component ─────────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const { type } = useParams<{ type: string }>();
  const assessmentType = type as AssessmentType;
  const config = ASSESSMENT_CONFIG[assessmentType];

  const router = useRouter();
  const [started, setStarted]   = useState(false);
  const [answers, setAnswers]   = useState<(number | null)[]>([]);
  const [submitted, setSubmit]  = useState(false);
  const [current, setCurrent]   = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // Initialise answer array when config is known
  useEffect(() => {
    if (config) setAnswers(Array(config.questions.length).fill(null));
  }, [config]);

  // Timer
  useEffect(() => {
    if (!started || !config?.time || submitted) return;
    setTimeLeft(config.time);
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timer); setSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  if (!config) {
    notFound();
    return null;
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const score   = submitted ? answers.filter((a, i) => a === config.questions[i].answer).length : 0;
  const pct     = submitted && config.questions.length > 0 ? Math.round((score / config.questions.length) * 100) : 0;
  const passed  = config.scored && submitted ? pct >= (assessmentType === 'final' ? 75 : 70) : false;
  const distinction = assessmentType === 'final' && pct >= 90;

  const handleAnswer = useCallback((idx: number) => {
    if (submitted) return;
    setAnswers((prev) => { const next = [...prev]; next[current] = idx; return next; });
  }, [current, submitted]);

  // ── Start screen ──────────────────────────────────────────────────────────

  if (!started) {
    const infoRows = assessmentType === 'pre'
      ? [['Questions', '20'], ['Time limit', '15 minutes (unproctored)'], ['Scoring', 'Unscored diagnostic — results shown to facilitator only']]
      : assessmentType === 'day1'
      ? [['Questions', '15'], ['Time limit', '15 minutes'], ['Pass threshold', '70% (11/15) — Advance badge'], ['Coverage', 'Modules 1–4']]
      : [['Questions', '40 MCQ'], ['Time limit', '45 minutes'], ['Pass threshold', '75% (30/40) — Nexara Certificate'], ['Distinction', '90% (36/40) — with Distinction'], ['Note', 'Part B (3 written scenarios, 15 min) follows separately']];

    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto flex flex-col items-center justify-center">
        <div className="bg-[#091628] border border-[#1E3A5F] rounded-2xl p-8 w-full">
          <div className="text-xs text-[#B8860B] font-semibold uppercase tracking-wider mb-2">
            {assessmentType === 'pre' ? 'Diagnostic' : assessmentType === 'day1' ? 'Formative' : 'Summative'}
          </div>
          <h1 className="text-2xl font-bold text-white mb-6">{config.title}</h1>
          <table className="w-full text-sm mb-6">
            <tbody>
              {infoRows.map(([label, value]) => (
                <tr key={label} className="border-b border-[#1E3A5F]/50">
                  <td className="py-2 text-slate-400 w-40">{label}</td>
                  <td className="py-2 text-white">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {assessmentType === 'pre' && (
            <div className="text-sm text-blue-300 bg-blue-950/20 border border-blue-800 rounded-lg p-3 mb-6">
              Answer honestly — there is no pass or fail. Your answers help the facilitator tailor the programme.
            </div>
          )}
          {assessmentType === 'final' && (
            <div className="text-sm text-amber-300 bg-amber-950/20 border border-amber-800 rounded-lg p-3 mb-6">
              Individual work only. No collaboration, no reference materials. Timer starts when you click Begin.
            </div>
          )}
          <button
            onClick={() => setStarted(true)}
            className="w-full bg-[#B8860B] text-white font-semibold py-3 rounded-lg hover:bg-[#D4A017] transition-colors"
          >
            Begin Assessment
          </button>
          <div className="text-center mt-4">
            <Link href="/assessments" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">← Back to Assessments</Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Results screen ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto">
        <div className="bg-[#091628] border border-[#1E3A5F] rounded-2xl p-8">
          {config.scored ? (
            <>
              <div className={`text-7xl font-bold mb-2 text-center ${distinction ? 'text-[#B8860B]' : passed ? 'text-green-400' : 'text-red-400'}`}>
                {pct}%
              </div>
              <div className="text-center mb-1">
                <span className={`text-xl font-semibold ${distinction ? 'text-[#B8860B]' : passed ? 'text-green-400' : 'text-red-400'}`}>
                  {distinction ? 'Distinction' : passed ? 'Pass' : 'Did Not Pass'}
                </span>
              </div>
              <div className="text-center text-slate-400 text-sm mb-4">{score}/{config.questions.length} correct</div>
              {assessmentType === 'day1' && (
                <div className={`text-sm rounded-lg p-3 mb-4 border text-center ${passed ? 'bg-green-950/20 border-green-800 text-green-300' : 'bg-amber-950/20 border-amber-800 text-amber-300'}`}>
                  {passed ? '✓ Advance — strong foundation for Day 2' : '⚠ Review note — your facilitator will reinforce key areas in Day 2'}
                </div>
              )}
              {assessmentType === 'final' && passed && (
                <div className="bg-[#1E3A5F]/20 border border-[#1E3A5F] rounded-xl p-5 mb-4 text-center">
                  <p className="text-sm text-slate-300 mb-1 font-medium">Part A complete — proceed to Part B</p>
                  <p className="text-xs text-slate-500 mb-4">
                    Answer 3 written scenarios (5 marks each, 15 min). Your facilitator will mark Part B and combine both scores for your certificate grade.
                  </p>
                  <Link
                    href="/assessments/final-partb"
                    className="inline-block bg-[#B8860B] text-white px-6 py-2.5 rounded-lg hover:bg-[#D4A017] transition-colors text-sm font-semibold"
                  >
                    Continue to Part B →
                  </Link>
                </div>
              )}
              {assessmentType === 'final' && !passed && (
                <div className="text-sm text-slate-400 bg-[#1E3A5F]/20 border border-[#1E3A5F] rounded-lg p-3 mb-4 text-center">
                  Score of {pct}% is below the 75% pass threshold. A retake can be arranged at the next scheduled cohort.
                </div>
              )}

              {/* Per-question review */}
              <div className="mt-8 space-y-3">
                <h2 className="text-sm font-semibold text-[#B8860B] uppercase tracking-wider mb-4">Answer Review</h2>
                {config.questions.map((q, i) => {
                  const correct = answers[i] === q.answer;
                  return (
                    <div key={i} className={`rounded-lg p-4 border ${correct ? 'border-green-800/60 bg-green-950/10' : 'border-red-800/60 bg-red-950/10'}`}>
                      <p className="text-sm text-white font-medium mb-2">{i + 1}. {q.q}</p>
                      <p className="text-xs text-green-400 mb-1">✓ Correct: {q.options[q.answer]}</p>
                      {!correct && <p className="text-xs text-red-400">✗ Your answer: {answers[i] !== null ? q.options[answers[i]!] : 'Not answered'}</p>}
                      {!correct && q.explanation && (
                        <p className="text-xs text-slate-400 mt-1.5 italic">{q.explanation}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-600 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-green-400">✓</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Pre-Assessment Complete</h2>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Thank you. Your facilitator will use these results to focus on the areas where the group needs the most support. Individual scores are not revealed.
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#1E3A5F] flex justify-between items-center">
            <Link href="/assessments" className="text-sm text-slate-400 hover:text-white transition-colors">← All Assessments</Link>
            {assessmentType === 'day1' && <Link href="/programme" className="text-sm text-[#B8860B] hover:text-[#D4A017] transition-colors">View Day 2 Schedule →</Link>}
            {assessmentType === 'pre' && <Link href="/modules/1" className="text-sm text-[#B8860B] hover:text-[#D4A017] transition-colors">Begin Module 1 →</Link>}
            {assessmentType === 'final' && passed && <Link href="/assessments/final-partb" className="text-sm text-[#B8860B] hover:text-[#D4A017] transition-colors">Part B: Scenarios →</Link>}
            {assessmentType === 'final' && !passed && <Link href="/assessments" className="text-sm text-slate-400 hover:text-white transition-colors">Retake information →</Link>}
          </div>
        </div>
      </main>
    );
  }

  // ── Question screen ───────────────────────────────────────────────────────

  const q = config.questions[current];
  const progress = Math.round(((current + 1) / config.questions.length) * 100);
  const answeredCount = answers.filter(a => a !== null).length;

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-sm font-semibold text-slate-400">{config.title}</h1>
          <div className="text-xs text-slate-500 mt-0.5">{answeredCount} of {config.questions.length} answered</div>
        </div>
        {config.time && (
          <div className={`text-sm font-mono px-3 py-1.5 rounded-lg border ${timeLeft < 120 ? 'border-red-600 bg-red-950/30 text-red-400' : 'border-[#1E3A5F] bg-[#091628] text-white'}`}>
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#1E3A5F] rounded-full mb-6">
        <div className="h-1 bg-[#B8860B] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-6 mb-4">
        <div className="text-xs text-slate-500 mb-3 font-medium">Question {current + 1} / {config.questions.length}</div>
        <p className="text-white font-medium text-base mb-6 leading-relaxed">{q.q}</p>
        <div className="space-y-2.5">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm border transition-all ${
                answers[current] === i
                  ? 'border-[#B8860B] bg-[#B8860B]/10 text-white'
                  : 'border-[#1E3A5F] text-slate-300 hover:border-[#B8860B]/50 hover:bg-[#1E3A5F]/20'
              }`}
            >
              <span className="font-semibold mr-2 text-slate-500">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-30"
        >
          ← Previous
        </button>
        <span className="text-xs text-slate-600">{current + 1} / {config.questions.length}</span>
        {current < config.questions.length - 1 ? (
          <button
            onClick={() => setCurrent((c) => c + 1)}
            className="text-sm bg-[#B8860B] text-white px-4 py-2 rounded-lg hover:bg-[#D4A017] transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={() => setSubmit(true)}
            className="text-sm bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Submit Assessment
          </button>
        )}
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return (['pre', 'day1', 'final'] as AssessmentType[]).map((type) => ({ type }));
}
