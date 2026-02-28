import Link from 'next/link';
import { ChevronRight, Clock, Award, Users, BookOpen } from 'lucide-react';

const GROUPS = [
  {
    slug: 'quality-nc',
    title: 'Quality & Non-Conformance',
    audience: 'Quality managers, document controllers, QMS coordinators',
    topics: ['Quality workflows & document control', 'Non-conformance management', 'CAPA linkage & closure', 'ISO 9001 evidence packages'],
    colour: 'border-blue-700',
    accent: 'text-blue-400',
  },
  {
    slug: 'hse',
    title: 'Health, Safety & Environment',
    audience: 'HSE managers, EHS coordinators, safety officers',
    topics: ['Incident recording & investigation', 'Legal register & compliance', 'Environmental aspects & significance', 'PTW & inspections'],
    colour: 'border-green-700',
    accent: 'text-green-400',
  },
  {
    slug: 'hr-payroll',
    title: 'HR & Payroll',
    audience: 'HR managers, payroll administrators, L&D coordinators',
    topics: ['Employee record lifecycle', 'Training tracker & compliance', 'Payroll management', 'GDPR obligations'],
    colour: 'border-purple-700',
    accent: 'text-purple-400',
  },
  {
    slug: 'finance-contracts',
    title: 'Finance & Contracts',
    audience: 'Finance managers, procurement leads, legal counsel',
    topics: ['Financial workflows & approval', 'Contract lifecycle management', 'Supplier evaluation & scorecard', 'KPI dashboards & reporting'],
    colour: 'border-amber-700',
    accent: 'text-amber-400',
  },
  {
    slug: 'advanced',
    title: 'Audits, CAPA & Management Review',
    audience: 'Audit leads, QMS managers, management review secretaries',
    topics: ['Audit programme & conduct', 'CAPA root cause analysis', 'Management review inputs & outputs', 'ISO evidence packages'],
    colour: 'border-red-700',
    accent: 'text-red-400',
  },
];

export default function ModuleOwnerPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[#1E3A5F] bg-[#091628] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#B8860B] flex items-center justify-center font-bold text-sm text-white">N</div>
          <div>
            <span className="font-semibold text-white text-sm">Nexara IMS — Training Portal</span>
            <span className="text-slate-500 text-xs ml-3">/ Module Owner Training</span>
          </div>
        </div>
        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← All Programmes</Link>
      </nav>

      {/* Hero */}
      <section className="px-6 py-14 text-center max-w-4xl mx-auto">
        <div className="inline-block bg-[#B8860B]/20 text-[#D4A017] text-xs font-semibold px-3 py-1 rounded-full mb-5 border border-[#B8860B]/30 uppercase tracking-wide">
          Module Owner Training
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Five Targeted One-Day Programmes
        </h1>
        <p className="text-lg text-slate-300 mb-6 max-w-2xl mx-auto leading-relaxed">
          Designed for compliance professionals and department heads who own and operate specific Nexara modules.
          Each programme is independent — attend only the days relevant to your role.
        </p>
        <div className="flex flex-wrap gap-6 justify-center text-sm text-slate-400">
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#B8860B]" />7 CPD hours per programme</div>
          <div className="flex items-center gap-2"><Award className="w-4 h-4 text-[#B8860B]" />Certificate on ≥ 75%</div>
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#B8860B]" />Max 14 participants</div>
          <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#B8860B]" />20 MCQ assessment</div>
        </div>
      </section>

      {/* Programme Cards */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <h2 className="text-lg font-semibold text-slate-300 mb-6">Select your programme</h2>
        <div className="space-y-4">
          {GROUPS.map(({ slug, title, audience, topics, colour, accent }) => (
            <div key={slug} className={`bg-[#091628] border ${colour}/60 rounded-xl p-6 hover:border-opacity-100 transition-all`}>
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className={`text-xs font-semibold uppercase tracking-wide ${accent} mb-1`}>One day · 7 CPD hrs</div>
                  <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{audience}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {topics.map((t) => (
                      <li key={t} className="text-xs text-slate-400 flex gap-1.5 items-start">
                        <span className={`${accent} mt-0.5`}>▸</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <Link
                    href={`/module-owner/${slug}`}
                    className="bg-[#B8860B] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#D4A017] transition-colors text-center flex items-center justify-center gap-1"
                  >
                    View Programme <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/module-owner/${slug}/assessment`}
                    className="border border-[#1E3A5F] text-slate-300 text-sm px-4 py-2.5 rounded-lg hover:border-[#B8860B]/50 hover:text-white transition-colors text-center"
                  >
                    Take Assessment
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E3A5F] px-6 py-6 mt-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">© 2026 Nexara DMCC. All rights reserved.</div>
          <a href="mailto:training@nexara.io" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">training@nexara.io</a>
        </div>
      </footer>
    </main>
  );
}
