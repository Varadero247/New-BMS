import Link from 'next/link';
import { ChevronRight, Clock, Laptop } from 'lucide-react';

const MODULES = [
  {
    id: 1,
    title: 'Platform Navigation',
    duration: '30 min',
    topics: ['Login and dashboard orientation', 'Sidebar navigation and module switching', 'Notifications and profile settings'],
    colour: 'border-blue-700/60',
    accent: 'text-blue-400',
  },
  {
    id: 2,
    title: 'Recording Incidents',
    duration: '40 min',
    topics: ['Incident vs near miss vs observation', 'Step-by-step incident form fields', 'Evidence upload and status tracking'],
    colour: 'border-red-700/60',
    accent: 'text-red-400',
  },
  {
    id: 3,
    title: 'Training Acknowledgements',
    duration: '30 min',
    topics: ['Finding assigned training in your dashboard', 'Reading procedures and completing knowledge checks', 'RAG status and deadline alert notifications'],
    colour: 'border-green-700/60',
    accent: 'text-green-400',
  },
  {
    id: 4,
    title: 'Permit to Work',
    duration: '40 min',
    topics: ['Which activities require a permit', 'Submitting a permit request form', 'Working under a permit; closure on completion'],
    colour: 'border-amber-700/60',
    accent: 'text-amber-400',
  },
  {
    id: 5,
    title: 'Observations',
    duration: '30 min',
    topics: ['Positive vs negative observations', 'Location, category, and photo evidence', 'Anonymous submission and status tracking'],
    colour: 'border-purple-700/60',
    accent: 'text-purple-400',
  },
  {
    id: 6,
    title: 'Reports & Dashboards',
    duration: '25 min',
    topics: ['Personal compliance dashboard widgets', 'Pre-configured reports for your role', 'Exporting data and understanding RAG status'],
    colour: 'border-cyan-700/60',
    accent: 'text-cyan-400',
  },
];

export default function EndUserModulesPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[#1E3A5F] bg-[#091628] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#B8860B] flex items-center justify-center font-bold text-sm text-white">N</div>
          <div>
            <span className="font-semibold text-white text-sm">Nexara IMS — Training Portal</span>
            <span className="text-slate-500 text-xs ml-3">/ End User / E-Learning</span>
          </div>
        </div>
        <Link href="/end-user" className="text-sm text-slate-400 hover:text-white transition-colors">← End User Training</Link>
      </nav>

      {/* Hero */}
      <section className="px-6 py-12 text-center max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Laptop className="w-5 h-5 text-[#B8860B]" />
          <span className="text-xs font-semibold uppercase tracking-wide text-[#B8860B]">Self-Paced E-Learning</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          End User Training Modules
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Work through the six modules at your own pace. Each module ends with a short formative knowledge check.
          Complete all six, then take the 20-question summative assessment to earn your certificate.
        </p>
        <div className="flex flex-wrap gap-5 justify-center mt-4 text-sm text-slate-400">
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#B8860B]" />~3.25 hrs total content</div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#B8860B]" />5 Q knowledge check per module</div>
        </div>
      </section>

      {/* Module Cards */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <div className="space-y-4">
          {MODULES.map(({ id, title, duration, topics, colour, accent }) => (
            <div key={id} className={`bg-[#091628] border ${colour} rounded-xl p-6`}>
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className={`text-xs font-semibold uppercase tracking-wide ${accent} mb-1`}>
                    Module {id} · {duration}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                  <ul className="space-y-1">
                    {topics.map((t) => (
                      <li key={t} className="text-sm text-slate-400 flex gap-2 items-start">
                        <span className={`${accent} mt-0.5`}>▸</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-2 min-w-[130px]">
                  <Link
                    href={`/end-user/modules/${id}`}
                    className="bg-[#B8860B] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#D4A017] transition-colors text-center flex items-center justify-center gap-1"
                  >
                    Start Module <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-[#091628] border border-[#B8860B]/30 rounded-xl p-6 text-center">
          <p className="text-slate-300 text-sm mb-4">Completed all six modules? Take the final assessment to earn your certificate.</p>
          <Link
            href="/end-user/assessment"
            className="inline-flex items-center gap-2 bg-[#B8860B] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#D4A017] transition-colors"
          >
            Take Summative Assessment <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#1E3A5F] px-6 py-6 mt-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm text-slate-500">© 2026 Nexara DMCC</div>
          <Link href="/end-user" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">← End User Training</Link>
        </div>
      </footer>
    </main>
  );
}
