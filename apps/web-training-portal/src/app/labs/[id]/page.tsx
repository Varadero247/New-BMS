import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FlaskConical, Zap } from 'lucide-react';

const LABS: Record<number, {
  title: string;
  module: number;
  duration: string;
  scenario: string;
  tasks: string[];
  extension?: string;
}> = {
  1: {
    title: 'User Management & SCIM Provisioning',
    module: 1,
    duration: '30 min',
    scenario: 'You are the new IT Administrator at Nexara Training Co. HR has sent you a CSV of 5 new starters and the company wants SCIM auto-provisioning via Azure AD.',
    tasks: [
      'Part A: Import the provided CSV (5 users) with field mapping and error correction',
      'Part B: Generate a SCIM bearer token and connect the mock IdP',
      'Part B: Trigger a SCIM provisioning event and verify in the audit log',
      'Verify all provisioned accounts appear in Pending or Active state',
    ],
    extension: 'Configure group-to-role mapping for 3 IdP groups (IMS-HSManagers, IMS-Auditors, IMS-ReadOnly) and test automatic role assignment.',
  },
  2: {
    title: 'Role Matrix Design Exercise',
    module: 2,
    duration: '25 min (group)',
    scenario: 'Design a role matrix for Meridian Manufacturing Ltd (200 employees, 9 active IMS modules). Assign the most appropriate role for each of 9 stakeholders including an external auditor with quarterly access.',
    tasks: [
      'Assign predefined roles to all 9 named stakeholders',
      'Identify any least-privilege violations in your initial assignments',
      'Specify a custom role for the Maintenance Supervisor (CMMS-only access)',
      'Present your top 3 decisions to the group with rationale',
    ],
  },
  3: {
    title: 'Module Activation & Configuration',
    module: 3,
    duration: '35 min',
    scenario: 'Activate and configure 3 IMS modules for Nexara Training Co. Then attempt an intentional activation failure to practise diagnosis.',
    tasks: [
      'Part 1 (immediate): Activate the Risk Register module — verify dependencies first',
      'Part 2: Activate Audit Management, Document Control, and Training & Competency modules',
      'Configure org-level parameters for each (audit cycle, document review period, certificate expiry)',
      'Intentional failure: Attempt to activate Complaints without Quality — diagnose the error in the audit log',
    ],
    extension: 'Map your organisation\'s full 44-module activation plan with wave assignments and estimated timeline.',
  },
  4: {
    title: 'API Key Lifecycle & Webhook Test',
    module: 4,
    duration: '25 min',
    scenario: 'Integrate IMS with a Power BI dashboard (read-only API key) and a Slack channel (webhook for critical incidents).',
    tasks: [
      'Create API key: powerbi-incidents-ro (scopes: read:incidents read:risk, IP restricted, 365-day expiry)',
      'Test key: verify GET succeeds, POST returns 403',
      'Rotate key: generate v2, verify it works, revoke original',
      'Register webhook: slack-critical-incidents (events: incident.created, incident.severity_changed)',
      'Test fire webhook and verify HMAC-SHA256 signature in receiver logs',
    ],
  },
  5: {
    title: 'Mock Security Incident Investigation',
    module: 5,
    duration: '30 min',
    scenario: 'URGENT: Your SIEM detected that david.osei@nexara-training.io (HS Manager) exported 200 HR records at 10:31 AM from IP 185.220.101.44 (Tor exit node). Investigate using only the audit log.',
    tasks: [
      'Identify how the account gained HR module access (check ROLE_ASSIGNED / PERMISSION_OVERRIDE events)',
      'Build a timeline of the attack from first auth failure to data export',
      'Determine: was this David acting maliciously, or a compromised account?',
      'List your immediate containment actions',
    ],
  },
  6: {
    title: 'Backup & Restore Sequence',
    module: 6,
    duration: '35 min',
    scenario: 'Complete your first backup verification cycle. Run a manual backup, verify integrity, restore to a test database, validate the restore, and document the procedure.',
    tasks: [
      'Run pg_dump with --format=custom; record file size',
      'Generate SHA-256 checksum; verify with sha256sum --check',
      'Validate backup structure: pg_restore --list',
      'Restore to ims_restore_test database; verify row counts',
      'Drop test database; document your DR runbook fields',
    ],
  },
  7: {
    title: 'Update Plan & Rollback Scenario',
    module: 7,
    duration: '20 min (scenario)',
    scenario: 'Plan the deployment of IMS v2.15.0 (includes a DB migration and breaking webhook signature change). Then respond to a simulated rollback emergency 34 minutes into deployment.',
    tasks: [
      'Complete the 12-point pre-update checklist for v2.15.0',
      'Document your rollback plan (what specifically would you do)',
      'Write the incident declaration for the rollback scenario',
      'List the exact rollback steps and post-rollback validation',
      'Design a controlled feature flag rollout for the new AI prediction feature',
    ],
  },
};

export default async function LabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const labId = parseInt(id, 10);
  const lab = LABS[labId];
  if (!lab) notFound();

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/modules" className="text-sm text-slate-400 hover:text-white transition-colors">← Back to Modules</Link>
        <div className="flex items-center gap-3 mt-4 mb-2">
          <FlaskConical className="w-6 h-6 text-[#B8860B]" />
          <div>
            <div className="text-xs text-slate-400">Lab {labId} of 7 · Module {lab.module} · {lab.duration}</div>
            <h1 className="text-2xl font-bold text-white">{lab.title}</h1>
          </div>
        </div>
      </div>

      {/* Scenario */}
      <section className="bg-amber-950/10 border border-amber-800 rounded-xl p-6 mb-6">
        <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Scenario</div>
        <p className="text-slate-200 text-sm leading-relaxed">{lab.scenario}</p>
      </section>

      {/* Tasks */}
      <section className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-[#B8860B] uppercase tracking-wider mb-4">Tasks</h2>
        <ol className="space-y-3">
          {lab.tasks.map((task, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-300">
              <span className="w-6 h-6 rounded-full bg-[#1E3A5F] text-slate-400 text-xs flex items-center justify-center shrink-0 font-medium">
                {i + 1}
              </span>
              {task}
            </li>
          ))}
        </ol>
      </section>

      {/* Extension */}
      {lab.extension && (
        <section className="bg-[#1E4A2F]/20 border border-green-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-green-400" />
            <div className="text-xs font-semibold text-green-400 uppercase tracking-wider">Live Extension (Fast Finishers)</div>
          </div>
          <p className="text-slate-300 text-sm">{lab.extension}</p>
        </section>
      )}

      {/* Nav */}
      <div className="flex justify-between pt-4 border-t border-[#1E3A5F]">
        {labId > 1 ? (
          <Link href={`/labs/${labId - 1}`} className="text-sm text-slate-400 hover:text-white transition-colors">← Lab {labId - 1}</Link>
        ) : <div />}
        {labId < 7 ? (
          <Link href={`/labs/${labId + 1}`} className="text-sm text-[#B8860B] hover:text-[#D4A017] transition-colors">Lab {labId + 1} →</Link>
        ) : (
          <Link href="/assessments/final" className="text-sm text-[#B8860B] hover:text-[#D4A017] transition-colors">Summative Assessment →</Link>
        )}
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return [1, 2, 3, 4, 5, 6, 7].map((id) => ({ id: String(id) }));
}
