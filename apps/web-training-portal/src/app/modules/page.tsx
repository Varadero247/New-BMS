import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const MODULES = [
  {
    id: 1,
    title: 'User Management & SCIM Provisioning',
    day: 1,
    duration: '90 min',
    topics: ['User lifecycle states', 'SCIM 2.0 endpoints', 'IdP integration', 'Bulk import', 'Deprovisioning policy'],
    objectives: 5,
  },
  {
    id: 2,
    title: 'Role & Permission Configuration',
    day: 1,
    duration: '90 min',
    topics: ['39 predefined roles', '7 permission levels', '17 module namespaces', 'Custom roles', 'Least-privilege audit'],
    objectives: 5,
  },
  {
    id: 3,
    title: 'Module Activation & Configuration',
    day: 1,
    duration: '90 min',
    topics: ['44 IMS modules', 'Activation states', 'Dependency graph', 'Wave-based rollout', 'Troubleshooting'],
    objectives: 5,
  },
  {
    id: 4,
    title: 'Integration Management',
    day: 1,
    duration: '90 min',
    topics: ['API key lifecycle', 'OAuth 2.0', 'SAML SSO', 'Webhooks', 'Integration audit'],
    objectives: 5,
  },
  {
    id: 5,
    title: 'Audit Log Review',
    day: 2,
    duration: '90 min',
    topics: ['Audit architecture', 'Event taxonomy', 'Filtering & search', 'Incident investigation', 'Compliance export'],
    objectives: 5,
  },
  {
    id: 6,
    title: 'Backup & Restore Procedures',
    day: 2,
    duration: '90 min',
    topics: ['pg_dump / pg_restore', 'Backup schedules', 'Integrity verification', 'DR runbook', 'PITR'],
    objectives: 5,
  },
  {
    id: 7,
    title: 'Platform Update Management',
    day: 2,
    duration: '60 min',
    topics: ['Update lifecycle', 'Pre-update checklist', 'Monitoring', 'Emergency rollback', 'Feature flags'],
    objectives: 5,
  },
];

export default function ModulesPage() {
  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← Back to Home</Link>
        <h1 className="text-3xl font-bold text-white mt-4 mb-2">Module Index</h1>
        <p className="text-slate-400">7 modules across 2 days covering complete IMS administration.</p>
      </div>

      <div className="space-y-4">
        {MODULES.map((mod) => (
          <Link
            key={mod.id}
            href={`/modules/${mod.id}`}
            className="block bg-[#1E3A5F]/20 border border-[#1E3A5F] rounded-xl p-6 hover:border-[#B8860B]/50 hover:bg-[#1E3A5F]/30 transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-lg bg-[#B8860B] text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {mod.id}
                  </span>
                  <span className="text-xs text-slate-400 bg-[#091628] px-2 py-0.5 rounded-full">
                    Day {mod.day} · {mod.duration}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-white mb-3 group-hover:text-[#D4A017] transition-colors">
                  {mod.title}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {mod.topics.map((topic) => (
                    <span key={topic} className="text-xs text-slate-400 bg-[#091628] px-2 py-1 rounded-full border border-[#1E3A5F]">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-xs text-slate-500">{mod.objectives} objectives</span>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-[#B8860B] transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
