import Link from 'next/link';
import { Clock, Award, Users, BookOpen, Monitor, Laptop, ChevronRight } from 'lucide-react';

const MODULES = [
  { id: 1, title: 'Platform Navigation', duration: '30 min', desc: 'Login, dashboard orientation, sidebar navigation, notifications' },
  { id: 2, title: 'Recording Incidents', duration: '40 min', desc: 'Incident vs near miss vs observation; step-by-step form; status tracking' },
  { id: 3, title: 'Training Acknowledgements', duration: '30 min', desc: 'Finding assigned training, completing knowledge checks, deadline alerts' },
  { id: 4, title: 'Permit to Work', duration: '40 min', desc: 'Permit types, submission form, working safely under a permit, closure' },
  { id: 5, title: 'Observations', duration: '30 min', desc: 'Positive vs negative observations, photo evidence, anonymous submission' },
  { id: 6, title: 'Reports & Dashboards', duration: '25 min', desc: 'Personal compliance dashboard, pre-configured reports, RAG status' },
];

export default function EndUserPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[#1E3A5F] bg-[#091628] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#B8860B] flex items-center justify-center font-bold text-sm text-white">N</div>
          <div>
            <span className="font-semibold text-white text-sm">Nexara IMS — Training Portal</span>
            <span className="text-slate-500 text-xs ml-3">/ End User Training</span>
          </div>
        </div>
        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← All Programmes</Link>
      </nav>

      {/* Hero */}
      <section className="px-6 py-14 text-center max-w-4xl mx-auto">
        <div className="inline-block bg-[#B8860B]/20 text-[#D4A017] text-xs font-semibold px-3 py-1 rounded-full mb-5 border border-[#B8860B]/30 uppercase tracking-wide">
          End User Training
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Nexara Platform Foundation
        </h1>
        <p className="text-lg text-slate-300 mb-6 max-w-2xl mx-auto leading-relaxed">
          A four-hour programme for operational staff. Learn how to record incidents, complete training acknowledgements,
          raise permits, and use the platform confidently from day one.
        </p>
        <div className="flex flex-wrap gap-6 justify-center text-sm text-slate-400">
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#B8860B]" />4 CPD hours</div>
          <div className="flex items-center gap-2"><Award className="w-4 h-4 text-[#B8860B]" />Certificate on ≥ 80%</div>
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#B8860B]" />No prerequisites</div>
          <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#B8860B]" />6 modules · 20 MCQ</div>
        </div>
      </section>

      {/* Delivery Format Selector */}
      <section className="px-6 pb-10 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-slate-300 mb-4">Choose your delivery format</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Virtual Session */}
          <div className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#B8860B]/20 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-[#B8860B]" />
              </div>
              <div>
                <div className="font-semibold text-white">Virtual Session</div>
                <div className="text-xs text-slate-400">Instructor-led · 4 hours</div>
              </div>
            </div>
            <ul className="space-y-1.5 text-sm text-slate-300 mb-6 flex-1">
              <li className="flex gap-2"><span className="text-slate-600">—</span>Live trainer via Zoom or Microsoft Teams</li>
              <li className="flex gap-2"><span className="text-slate-600">—</span>Guided exercises in a shared sandbox environment</li>
              <li className="flex gap-2"><span className="text-slate-600">—</span>Q&A throughout — ideal for cohort onboarding</li>
              <li className="flex gap-2"><span className="text-slate-600">—</span>Assessment and certificate at end of session</li>
            </ul>
            <Link
              href="/end-user/virtual"
              className="bg-[#B8860B] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#D4A017] transition-colors text-center flex items-center justify-center gap-1"
            >
              View Session Details <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* E-Learning */}
          <div className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#1E3A5F]/60 flex items-center justify-center">
                <Laptop className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <div className="font-semibold text-white">E-Learning</div>
                <div className="text-xs text-slate-400">Self-paced · available 24/7</div>
              </div>
            </div>
            <ul className="space-y-1.5 text-sm text-slate-300 mb-6 flex-1">
              <li className="flex gap-2"><span className="text-slate-600">—</span>Work through 6 modules at your own pace</li>
              <li className="flex gap-2"><span className="text-slate-600">—</span>5-question formative check after each module</li>
              <li className="flex gap-2"><span className="text-slate-600">—</span>Retake immediately on fail — no waiting for a cohort</li>
              <li className="flex gap-2"><span className="text-slate-600">—</span>Ideal for shift workers and remote staff</li>
            </ul>
            <Link
              href="/end-user/modules"
              className="border border-[#1E3A5F] text-slate-300 text-sm px-4 py-2.5 rounded-lg hover:border-[#B8860B]/50 hover:text-white transition-colors text-center"
            >
              Browse E-Learning Modules
            </Link>
          </div>
        </div>
      </section>

      {/* Module Overview */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <h2 className="text-lg font-semibold text-slate-300 mb-6">Programme content — 6 modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map(({ id, title, duration, desc }) => (
            <div key={id} className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-[#B8860B] uppercase tracking-wide">Module {id}</div>
                <div className="text-xs text-slate-500">{duration}</div>
              </div>
              <div className="font-semibold text-white mb-1 text-sm">{title}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-[#091628] border border-[#B8860B]/30 rounded-2xl p-8 text-center">
          <Award className="w-10 h-10 text-[#B8860B] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Nexara Platform Foundation</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Complete all 6 modules and pass the 20-question assessment (20 min, ≥80% pass) to earn your completion certificate.
          </p>
          <Link
            href="/end-user/assessment"
            className="inline-flex items-center gap-2 bg-[#B8860B] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#D4A017] transition-colors"
          >
            Take Assessment <ChevronRight className="w-4 h-4" />
          </Link>
          <div className="mt-4 text-xs text-slate-500">Assessment available after completing all 6 modules</div>
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
