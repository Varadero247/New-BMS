import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Award, ChevronRight, BookOpen, FlaskConical, CheckCircle } from 'lucide-react';

type GroupConfig = {
  title: string;
  subtitle: string;
  audience: string;
  topics: { block: string; duration: string; items: string[] }[];
  labScenario: string;
  certificate: string;
  accentColour: string;
};

const GROUPS: Record<string, GroupConfig> = {
  'quality-nc': {
    title: 'Quality & Non-Conformance',
    subtitle: 'Day A — Module Owner Training',
    audience: 'Quality managers, document controllers, QMS coordinators, internal auditors (quality focus)',
    topics: [
      { block: 'Block 1 · 09:00–10:30', duration: '90 min', items: ['Quality record architecture & reference numbers', 'Document control workflow & version management', 'Approval workflow routing & escalation rules', 'Quality KPI dashboard orientation'] },
      { block: 'Block 2 · 10:45–12:15', duration: '90 min', items: ['NC creation, categorisation & severity classification', 'Investigation workflow: contributing factors & root cause', 'CAPA linkage from within NC records', 'Closure verification & ISO 9001 evidence requirements', 'Repeat NC tracking & escalation triggers'] },
      { block: 'Block 3 · 13:00–14:15', duration: '75 min', items: ['Quality KPI deep-dive: NC open rate, CAPA effectiveness', 'Report configuration & scheduled delivery', 'ISO 9001:2015 clause mapping', 'ISO evidence package generation'] },
    ],
    labScenario: 'Greenfield Manufacturing — Dimensional NC on steel brackets (Batch 2026-089). Create NC → investigate → link CAPA → generate ISO evidence package.',
    certificate: 'Nexara Certified Module Owner — Quality & Non-Conformance',
    accentColour: 'text-blue-400',
  },
  'hse': {
    title: 'Health, Safety & Environment',
    subtitle: 'Day B — Module Owner Training',
    audience: 'HSE managers, EHS coordinators, safety officers, environmental compliance leads',
    topics: [
      { block: 'Block 1 · 09:00–10:30', duration: '90 min', items: ['Incident vs near miss vs observation — correct record types', 'Incident severity classification (MINOR to CATASTROPHIC)', 'Investigation workflow: causes, root cause, corrective actions', 'TRIR and LTIR calculation and tracking'] },
      { block: 'Block 2 · 10:45–12:15', duration: '90 min', items: ['Legal register structure: obligation types and fields', 'Compliance evidence linking and AT_RISK vs NON_COMPLIANT', 'Environmental aspects and impacts — the A/I relationship', 'Significance scoring formula (≥15 = significant aspect)'] },
      { block: 'Block 3 · 13:00–14:15', duration: '75 min', items: ['PTW permit types and when each is required', 'PTW request: hazard identification, approval chain', 'Live permits dashboard: expiry alerts, emergency suspension', 'Inspection schedule and finding classification'] },
    ],
    labScenario: 'Hartfield Industrial — Contractor fall from height, Building 7. Record incident → investigate → raise PTW → conduct inspection → ISO 45001 evidence package.',
    certificate: 'Nexara Certified Module Owner — Health, Safety & Environment',
    accentColour: 'text-green-400',
  },
  'hr-payroll': {
    title: 'HR & Payroll',
    subtitle: 'Day C — Module Owner Training',
    audience: 'HR managers, payroll administrators, L&D coordinators, HR business partners',
    topics: [
      { block: 'Block 1 · 09:00–10:30', duration: '90 min', items: ['Employee record structure and mandatory fields', 'Starter process: onboarding checklist, document uploads', 'Absence management: types, recording, return-to-work', 'Leaver process: exit checklist, access revocation, data retention'] },
      { block: 'Block 2 · 10:45–12:15', duration: '90 min', items: ['Course management: creating and configuring training courses', 'Individual and group bulk assignment', 'Completion recording and certificate uploads', 'Compliance matrix report: overdue assignments, export', 'Deadline alerts: 30-day, 7-day, and overdue notifications'] },
      { block: 'Block 3 · 13:00–14:15', duration: '75 min', items: ['Pay period structure and initiation workflow', 'Pay adjustments: overtime, bonuses, deductions, BIK', 'Payroll audit trail: segregation of duties', 'Journal export for finance system integration'] },
    ],
    labScenario: 'Meridian Healthcare — Onboard nurse Emily Chen → assign mandatory training → run payroll period → generate CQC training compliance report.',
    certificate: 'Nexara Certified Module Owner — HR & Payroll',
    accentColour: 'text-purple-400',
  },
  'finance-contracts': {
    title: 'Finance & Contracts',
    subtitle: 'Day D — Module Owner Training',
    audience: 'Finance managers, procurement leads, legal counsel, contract managers',
    topics: [
      { block: 'Block 1 · 09:00–10:30', duration: '90 min', items: ['Financial record architecture: FIN-{TYPE}-{YEAR}-{NNN}', 'PO/Invoice 3-way match workflow', 'Budget vs actual: variance analysis and thresholds', 'Multi-currency handling and FX variance'] },
      { block: 'Block 2 · 10:45–12:15', duration: '90 min', items: ['Contract lifecycle stages: Draft → Active → Terminated', 'Milestone alerts and renewal pipeline management', 'Contract version control and amendment workflow', 'Obligation tracking and contractual compliance'] },
      { block: 'Block 3 · 13:00–14:15', duration: '75 min', items: ['Supplier register: categories and qualification status', 'Scorecard evaluation: weighted criteria and thresholds', 'Supply chain risk classification (LOW to CRITICAL)', 'Preferred supplier list report'] },
    ],
    labScenario: 'Thornton Capital Group — Onboard TechBridge Solutions supplier → evaluate scorecard → create £1.35M contract → configure milestones → check DataSystems expiry pipeline.',
    certificate: 'Nexara Certified Module Owner — Finance & Contracts',
    accentColour: 'text-amber-400',
  },
  'advanced': {
    title: 'Audits, CAPA & Management Review',
    subtitle: 'Day E — Module Owner Training',
    audience: 'Audit leads, QMS managers, management review secretaries, ISO certification leads',
    topics: [
      { block: 'Block 1 · 09:00–10:30', duration: '90 min', items: ['Annual audit programme structure and risk-based scheduling', 'Audit conduct: opening meeting, sampling, evidence', 'Finding classification: Conformance, Observation, OFI, Minor/Major NC', 'Audit report generation and distribution'] },
      { block: 'Block 2 · 10:45–12:15', duration: '90 min', items: ['Multi-source CAPA management (NC, audit, MR, complaints)', '5-Why, fishbone, and fault tree analysis techniques', 'SMART action planning and effectiveness review criteria', 'Repeat findings rate: what it means and how to respond'] },
      { block: 'Block 3 · 13:00–14:15', duration: '75 min', items: ['Management review architecture and status workflow', 'Input compiler: pulling data from all active modules', 'Agenda, minutes, and output action management', 'ISO evidence package for certification body submission'] },
    ],
    labScenario: 'Vertex Global Systems — Plan internal audit → conduct → raise CAPA (5-Why) → compile management review inputs → generate ISO 9001 surveillance audit evidence package.',
    certificate: 'Nexara Certified Module Owner — Audits, CAPA & Management Review',
    accentColour: 'text-red-400',
  },
};

export default function GroupPage({ params }: { params: { group: string } }) {
  const config = GROUPS[params.group];
  if (!config) notFound();

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[#1E3A5F] bg-[#091628] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#B8860B] flex items-center justify-center font-bold text-sm text-white">N</div>
          <div>
            <span className="font-semibold text-white text-sm">Nexara IMS — Training Portal</span>
            <span className="text-slate-500 text-xs ml-3">/ Module Owner</span>
          </div>
        </div>
        <Link href="/module-owner" className="text-sm text-slate-400 hover:text-white transition-colors">← All Programmes</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className={`text-xs font-semibold uppercase tracking-wide ${config.accentColour} mb-2`}>{config.subtitle}</div>
          <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>{config.title}</h1>
          <p className="text-slate-400 text-sm mb-4">{config.audience}</p>
          <div className="flex flex-wrap gap-5 text-sm text-slate-400">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#B8860B]" />08:30–17:00 · 7 CPD hours</div>
            <div className="flex items-center gap-2"><Award className="w-4 h-4 text-[#B8860B]" />20 MCQ · ≥75% pass</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#B8860B]" />Certificate issued same day</div>
          </div>
        </div>

        {/* Content Blocks */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#B8860B]" /> Programme Content
          </h2>
          <div className="space-y-4">
            {config.topics.map(({ block, duration, items }) => (
              <div key={block} className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-[#B8860B]">{block}</div>
                  <div className="text-xs text-slate-500">{duration}</div>
                </div>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-slate-600 shrink-0">—</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Lab */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[#B8860B]" /> Hands-On Lab · 14:30–15:45
          </h2>
          <div className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-5">
            <p className="text-sm text-slate-300 leading-relaxed">{config.labScenario}</p>
            <div className="mt-3 text-xs text-slate-500">75 minutes · sandbox environment · independent exercise with facilitator support</div>
          </div>
        </section>

        {/* Assessment CTA */}
        <section className="bg-[#091628] border border-[#B8860B]/30 rounded-2xl p-8 text-center">
          <Award className="w-10 h-10 text-[#B8860B] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">{config.certificate}</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Complete the 20-question assessment (30 min, ≥75% pass) to earn your certificate. Timer starts on entry.
          </p>
          <Link
            href={`/module-owner/${params.group}/assessment`}
            className="inline-flex items-center gap-2 bg-[#B8860B] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#D4A017] transition-colors"
          >
            Begin Assessment <ChevronRight className="w-4 h-4" />
          </Link>
          <div className="mt-4 text-xs text-slate-500">Assessment is available after attending the full-day programme</div>
        </section>
      </div>

      <footer className="border-t border-[#1E3A5F] px-6 py-6 mt-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm text-slate-500">© 2026 Nexara DMCC</div>
          <Link href="/module-owner" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">← All Module Owner Programmes</Link>
        </div>
      </footer>
    </main>
  );
}

export function generateStaticParams() {
  return ['quality-nc', 'hse', 'hr-payroll', 'finance-contracts', 'advanced'].map((group) => ({ group }));
}
