import Link from 'next/link';
import { Clock, Monitor, Users, ChevronRight, CheckCircle, Award } from 'lucide-react';

const SCHEDULE = [
  { time: '09:00–09:10', session: 'Welcome, housekeeping & session overview', type: 'plenary', duration: '10 min' },
  { time: '09:10–09:40', session: 'Module 1: Platform Navigation', type: 'demo', duration: '30 min', note: 'Live facilitator demo — follow along in your sandbox' },
  { time: '09:40–10:20', session: 'Module 2: Recording Incidents', type: 'exercise', duration: '40 min', note: 'Guided exercise — record a near miss, upload evidence, track status' },
  { time: '10:20–10:30', session: 'Break', type: 'break', duration: '10 min' },
  { time: '10:30–11:00', session: 'Module 3: Training Acknowledgements', type: 'exercise', duration: '30 min', note: 'Guided exercise — find assigned procedures, complete knowledge check' },
  { time: '11:00–11:40', session: 'Module 4: Permit to Work', type: 'scenario', duration: '40 min', note: 'Scenario walkthrough — raise and close a confined space permit' },
  { time: '11:40–11:50', session: 'Break', type: 'break', duration: '10 min' },
  { time: '11:50–12:20', session: 'Module 5: Observations + Module 6: Reports & Dashboards', type: 'demo', duration: '30 min', note: 'Live demo — positive observation, dashboard navigation, report export' },
  { time: '12:20–12:30', session: 'Q&A and course wrap-up', type: 'plenary', duration: '10 min' },
  { time: '12:30–12:45', session: 'Assessment (20 MCQ) + Certificate download', type: 'assessment', duration: '15 min' },
];

const TYPE_BADGE: Record<string, string> = {
  plenary: 'bg-slate-700/50 text-slate-300',
  demo: 'bg-[#1E3A5F]/60 text-blue-300',
  exercise: 'bg-amber-900/30 text-amber-300',
  scenario: 'bg-purple-900/30 text-purple-300',
  break: 'bg-slate-800/60 text-slate-500',
  assessment: 'bg-[#B8860B]/20 text-[#D4A017]',
};

const TYPE_LABEL: Record<string, string> = {
  plenary: 'Plenary',
  demo: 'Live Demo',
  exercise: 'Guided Exercise',
  scenario: 'Scenario',
  break: 'Break',
  assessment: 'Assessment',
};

const SETUP_CHECKLIST = [
  'Nexara sandbox login credentials (provided by your organisation)',
  'Stable internet connection (10 Mbps+ recommended)',
  'Zoom or Microsoft Teams installed and tested',
  'Two screens helpful but not required',
  'Headset or speakers with microphone',
  'Google Chrome or Microsoft Edge (latest version)',
];

export default function VirtualSessionPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[#1E3A5F] bg-[#091628] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#B8860B] flex items-center justify-center font-bold text-sm text-white">N</div>
          <div>
            <span className="font-semibold text-white text-sm">Nexara IMS — Training Portal</span>
            <span className="text-slate-500 text-xs ml-3">/ End User / Virtual Session</span>
          </div>
        </div>
        <Link href="/end-user" className="text-sm text-slate-400 hover:text-white transition-colors">← End User Training</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#B8860B] mb-2">Instructor-Led · Virtual Delivery</div>
          <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            End User Virtual Session
          </h1>
          <p className="text-slate-400 text-sm mb-4">
            A live, four-hour session delivered via Zoom or Microsoft Teams. The facilitator guides participants through
            all six modules using a shared sandbox environment. No prior experience required.
          </p>
          <div className="flex flex-wrap gap-5 text-sm text-slate-400">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#B8860B]" />09:00–12:45 · 4 CPD hours</div>
            <div className="flex items-center gap-2"><Monitor className="w-4 h-4 text-[#B8860B]" />Zoom or Microsoft Teams</div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#B8860B]" />Up to 20 participants</div>
            <div className="flex items-center gap-2"><Award className="w-4 h-4 text-[#B8860B]" />Certificate issued same day</div>
          </div>
        </div>

        {/* Session Schedule */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">Session Schedule</h2>
          <div className="space-y-2">
            {SCHEDULE.map(({ time, session, type, duration, note }) => (
              <div
                key={time}
                className={`bg-[#091628] border rounded-xl p-4 ${type === 'break' ? 'border-[#1E3A5F]/40 opacity-60' : 'border-[#1E3A5F]'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="w-32 shrink-0">
                    <div className="text-sm font-mono text-[#B8860B]">{time}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{duration}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">{session}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[type]}`}>
                        {TYPE_LABEL[type]}
                      </span>
                    </div>
                    {note && <p className="text-xs text-slate-400">{note}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pre-Session Checklist */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">Before You Join</h2>
          <div className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-5">
            <p className="text-sm text-slate-400 mb-4">
              Complete this checklist at least 15 minutes before the session starts.
            </p>
            <ul className="space-y-2">
              {SETUP_CHECKLIST.map((item) => (
                <li key={item} className="flex gap-2.5 items-start text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Assessment CTA */}
        <section className="bg-[#091628] border border-[#B8860B]/30 rounded-2xl p-8 text-center">
          <Award className="w-10 h-10 text-[#B8860B] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Ready to take the assessment?</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            20 questions · 20 minutes · ≥80% to pass. Your certificate is issued immediately on pass.
          </p>
          <Link
            href="/end-user/assessment"
            className="inline-flex items-center gap-2 bg-[#B8860B] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#D4A017] transition-colors"
          >
            Begin Assessment <ChevronRight className="w-4 h-4" />
          </Link>
          <div className="mt-4 text-xs text-slate-500">Take this after attending the full virtual session</div>
        </section>
      </div>

      <footer className="border-t border-[#1E3A5F] px-6 py-6 mt-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm text-slate-500">© 2026 Nexara DMCC</div>
          <Link href="/end-user" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">← End User Training</Link>
        </div>
      </footer>
    </main>
  );
}
