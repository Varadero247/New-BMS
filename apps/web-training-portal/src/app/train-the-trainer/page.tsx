import Link from 'next/link';
import { ChevronRight, Clock, Award, Users, BookOpen, GraduationCap, CheckCircle, AlertCircle } from 'lucide-react';

const DAYS = [
  {
    day: 'Day 1',
    theme: 'Foundations',
    time: '08:30–17:00',
    sessions: [
      { time: '08:30–09:00', title: 'Welcome, introductions & day objectives', type: 'opening' },
      { time: '09:00–10:30', title: 'Module 1: Adult Learning Theory & Compliance Training Psychology', type: 'module' },
      { time: '10:30–10:45', title: 'Break', type: 'break' },
      { time: '10:45–12:15', title: 'Module 2: Facilitation Skills', type: 'module' },
      { time: '12:15–13:00', title: 'Lunch', type: 'break' },
      { time: '13:00–14:15', title: 'Module 3: The Nexara Curriculum', type: 'module' },
      { time: '14:15–14:30', title: 'Break', type: 'break' },
      { time: '14:30–15:45', title: 'Lab: Micro-teaching (10 min per participant, peer feedback)', type: 'lab' },
      { time: '15:45–16:30', title: 'Debrief + curriculum Q&A', type: 'debrief' },
      { time: '16:30–17:00', title: 'Formative check + Day 2 briefing', type: 'assessment' },
    ],
  },
  {
    day: 'Day 2',
    theme: 'Delivery Certification',
    time: '08:30–17:00',
    sessions: [
      { time: '08:30–09:00', title: 'Recap + Day 2 overview', type: 'opening' },
      { time: '09:00–10:30', title: 'Module 4: Assessment Delivery', type: 'module' },
      { time: '10:30–10:45', title: 'Break', type: 'break' },
      { time: '10:45–12:15', title: 'Module 5: Programme Management', type: 'module' },
      { time: '12:15–13:00', title: 'Lunch', type: 'break' },
      { time: '13:00–15:00', title: 'ASSESSED DELIVERY: 20-min observed segment per participant', type: 'assessed' },
      { time: '15:00–15:15', title: 'Break', type: 'break' },
      { time: '15:15–15:45', title: 'Written Assessment: 20 MCQ, 30 minutes', type: 'assessment' },
      { time: '15:45–16:30', title: 'Individual debrief with observer results', type: 'debrief' },
      { time: '16:30–17:00', title: 'Certificate ceremony + resubmission briefing', type: 'ceremony' },
    ],
  },
];

const SESSION_COLOURS: Record<string, string> = {
  opening: 'text-purple-400',
  module: 'text-slate-300',
  break: 'text-slate-600',
  lab: 'text-blue-400',
  debrief: 'text-slate-400',
  assessment: 'text-amber-400',
  assessed: 'text-red-400',
  ceremony: 'text-purple-400',
};

const CURRICULUM_RECEIVED = [
  { label: 'End User Training', detail: '4-hour programme — virtual & e-learning formats', icon: Users },
  { label: 'Module Owner — Quality & NC', detail: '1-day programme + assessment + lab', icon: BookOpen },
  { label: 'Module Owner — HSE', detail: '1-day programme + assessment + lab', icon: BookOpen },
  { label: 'Module Owner — HR & Payroll', detail: '1-day programme + assessment + lab', icon: BookOpen },
  { label: 'Module Owner — Finance & Contracts', detail: '1-day programme + assessment + lab', icon: BookOpen },
  { label: 'Module Owner — Audits, CAPA & Review', detail: '1-day programme + assessment + lab', icon: BookOpen },
];

export default function TrainTheTrainerPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[#1E3A5F] bg-[#091628] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#B8860B] flex items-center justify-center font-bold text-sm text-white">N</div>
          <div>
            <span className="font-semibold text-white text-sm">Nexara IMS — Training Portal</span>
            <span className="text-slate-500 text-xs ml-3">/ Train-the-Trainer</span>
          </div>
        </div>
        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← All Programmes</Link>
      </nav>

      {/* Hero */}
      <section className="px-6 py-14 text-center max-w-4xl mx-auto">
        <div className="inline-block bg-purple-900/30 text-purple-400 text-xs font-semibold px-3 py-1 rounded-full mb-5 border border-purple-700/40 uppercase tracking-wide">
          Train-the-Trainer
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Build Your Internal Training Capability
        </h1>
        <p className="text-lg text-slate-300 mb-6 max-w-2xl mx-auto leading-relaxed">
          Equip your designated trainers to independently deliver Nexara End User and Module Owner programmes to internal cohorts — using Nexara's editable source materials, facilitation guides, and assessment tools.
        </p>
        <div className="flex flex-wrap gap-6 justify-center text-sm text-slate-400 mb-8">
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-purple-400" />14 CPD hours</div>
          <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-purple-400" />2 days</div>
          <div className="flex items-center gap-2"><Award className="w-4 h-4 text-purple-400" />Dual assessment (written + delivery)</div>
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-purple-400" />Max 8 participants</div>
        </div>
        <a
          href="mailto:training@nexara.io?subject=Train-the-Trainer%20Programme%20Request"
          className="inline-flex items-center gap-2 bg-purple-700 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
        >
          Request This Programme <ChevronRight className="w-4 h-4" />
        </a>
        <p className="text-xs text-slate-500 mt-3">No self-serve enrolment — Nexara schedules T3 cohorts by request</p>
      </section>

      {/* Important Notice */}
      <section className="px-6 pb-8 max-w-5xl mx-auto">
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-5 flex gap-4">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-amber-400 mb-1">Delivered by Nexara Master Trainers Only</div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The Train-the-Trainer programme itself must be delivered by a Nexara Master Trainer. Certified internal trainers may not deliver the T3 programme to others. To request a cohort, contact training@nexara.io — Nexara schedules within 8 weeks of a confirmed booking.
            </p>
          </div>
        </div>
      </section>

      {/* Two-Day Structure */}
      <section className="px-6 pb-12 max-w-5xl mx-auto">
        <h2 className="text-lg font-semibold text-slate-300 mb-6">Two-Day Programme Structure</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {DAYS.map(({ day, theme, time, sessions }) => (
            <div key={day} className="bg-[#091628] border border-purple-700/40 rounded-xl p-6">
              <div className="mb-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-purple-400 mb-1">{day} · {time}</div>
                <h3 className="text-xl font-bold text-white">{theme}</h3>
              </div>
              <div className="space-y-2">
                {sessions.map(({ time: t, title, type }) => (
                  <div key={t} className="flex gap-3 text-sm">
                    <span className="text-slate-600 shrink-0 w-28 tabular-nums">{t}</span>
                    <span className={SESSION_COLOURS[type] ?? 'text-slate-300'}>{title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certification Section */}
      <section className="px-6 pb-12 max-w-5xl mx-auto">
        <h2 className="text-lg font-semibold text-slate-300 mb-6">Certification Requirements</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Written */}
          <div className="bg-[#091628] border border-purple-700/40 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-purple-400">Component A</div>
                <h3 className="text-base font-bold text-white">Written Assessment</h3>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Format</dt>
                <dd className="text-slate-300">20 MCQ</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Duration</dt>
                <dd className="text-slate-300">30 minutes</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Pass threshold</dt>
                <dd className="text-slate-300">≥ 75% (15/20)</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Topics</dt>
                <dd className="text-slate-300">All 5 modules</dd>
              </div>
            </dl>
          </div>

          {/* Delivery */}
          <div className="bg-[#091628] border border-purple-700/40 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-purple-400">Component B</div>
                <h3 className="text-base font-bold text-white">Delivery Assessment</h3>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Format</dt>
                <dd className="text-slate-300">20-min observed delivery</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Domains</dt>
                <dd className="text-slate-300">5 competency areas</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Scale</dt>
                <dd className="text-slate-300">4-point per domain</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Pass threshold</dt>
                <dd className="text-slate-300">≥ 70% overall + domain mins</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Both required callout */}
        <div className="mt-4 bg-[#091628] border border-purple-700/40 rounded-xl p-5">
          <div className="text-sm font-semibold text-white mb-2">Both components required for certification</div>
          <div className="grid sm:grid-cols-3 gap-3 text-sm text-slate-400">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <span><span className="text-green-400 font-medium">Both pass</span> → Certified; credential issued same day</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><span className="text-amber-400 font-medium">Written pass; delivery fail</span> → Resubmit delivery within 30 days</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span><span className="text-red-400 font-medium">Either/both fail</span> → Full retake at next T3 cohort</span>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Included */}
      <section className="px-6 pb-12 max-w-5xl mx-auto">
        <h2 className="text-lg font-semibold text-slate-300 mb-2">Curriculum Included on Completion</h2>
        <p className="text-sm text-slate-500 mb-6">Certified trainers receive the complete source packages for all programmes below — editable materials, facilitation guides, assessment banks, lab data sets, and co-brandable slide templates.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CURRICULUM_RECEIVED.map(({ label, detail, icon: Icon }) => (
            <div key={label} className="bg-[#091628] border border-purple-700/30 rounded-xl p-4 flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-900/30 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white mb-0.5">{label}</div>
                <div className="text-xs text-slate-500">{detail}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-4">Answer keys remain in the Nexara secure vault — accessible via Training Portal only during live assessments. Licence scope: internal delivery within your organisation only.</p>
      </section>

      {/* Annual Renewal */}
      <section className="px-6 pb-12 max-w-5xl mx-auto">
        <div className="bg-[#091628] border border-purple-700/40 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Annual Renewal</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-400">
            <div>
              <div className="text-purple-400 font-medium mb-1">Option A — Online Refresher</div>
              <p>4-hour online module covering programme updates; includes 10-MCQ assessment (≥ 70% to renew). Available via Training Portal from 60 days before renewal date.</p>
            </div>
            <div>
              <div className="text-purple-400 font-medium mb-1">Option B — T3 Day 2 Attendance</div>
              <p>Attend the next T3 Day 2 as an observer and complete the written assessment. No delivery assessment required for renewal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-16 max-w-5xl mx-auto text-center">
        <div className="bg-[#091628] border border-purple-700/40 rounded-2xl p-10">
          <GraduationCap className="w-10 h-10 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Ready to Build Internal Training Capability?
          </h2>
          <p className="text-slate-400 mb-6 max-w-xl mx-auto text-sm leading-relaxed">
            Contact Nexara L&D to discuss your organisation's needs, confirm participant suitability, and schedule a cohort. T3 programmes are available in-person (at your site or Nexara's facility) and virtually.
          </p>
          <a
            href="mailto:training@nexara.io?subject=Train-the-Trainer%20Programme%20Enquiry"
            className="inline-flex items-center gap-2 bg-purple-700 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Request This Programme <ChevronRight className="w-4 h-4" />
          </a>
          <div className="mt-4 text-xs text-slate-600">
            training@nexara.io · Cohorts scheduled within 8 weeks of confirmed booking · Maximum 8 participants
          </div>
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
