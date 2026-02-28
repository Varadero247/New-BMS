import Link from 'next/link';

const DAY1 = [
  { time: '08:30–09:00', session: 'Welcome, introductions, pre-assessment', type: 'admin' },
  { time: '09:00–10:30', session: 'Module 1: User Management & SCIM Provisioning', type: 'module', moduleId: 1 },
  { time: '10:30–10:45', session: '☕ Break', type: 'break' },
  { time: '10:45–12:15', session: 'Module 2: Role & Permission Configuration', type: 'module', moduleId: 2 },
  { time: '12:15–13:00', session: '🍽️ Lunch', type: 'break' },
  { time: '13:00–14:30', session: 'Module 3: Module Activation & Configuration', type: 'module', moduleId: 3 },
  { time: '14:30–14:45', session: '☕ Break', type: 'break' },
  { time: '14:45–16:15', session: 'Module 4: Integration Management', type: 'module', moduleId: 4 },
  { time: '16:15–16:45', session: 'Day 1 Formative Assessment (15 Q) + Review', type: 'assessment' },
  { time: '16:45–17:00', session: 'Wrap-up & Day 2 Preview', type: 'admin' },
];

const DAY2 = [
  { time: '08:30–09:00', session: 'Day 1 Recap & Day 2 Objectives', type: 'admin' },
  { time: '09:00–10:30', session: 'Module 5: Audit Log Review', type: 'module', moduleId: 5 },
  { time: '10:30–10:45', session: '☕ Break', type: 'break' },
  { time: '10:45–12:15', session: 'Module 6: Backup & Restore Procedures', type: 'module', moduleId: 6 },
  { time: '12:15–13:00', session: '🍽️ Lunch', type: 'break' },
  { time: '13:00–14:00', session: 'Module 7: Platform Update Management', type: 'module', moduleId: 7 },
  { time: '14:00–14:15', session: '☕ Break', type: 'break' },
  { time: '14:15–15:15', session: 'Summative Assessment (40 MCQ + 3 scenarios)', type: 'assessment' },
  { time: '15:15–15:45', session: 'Assessment Debrief + Results', type: 'admin' },
  { time: '15:45–16:15', session: 'Action Planning, Next Steps, Q&A', type: 'admin' },
  { time: '16:15–16:30', session: '🎓 Certificate Ceremony', type: 'ceremony' },
  { time: '16:30–17:00', session: 'Close + Networking', type: 'break' },
];

type SessionItem = { time: string; session: string; type: string; moduleId?: number };

function ScheduleRow({ item }: { item: SessionItem }) {
  const colours: Record<string, string> = {
    module: 'bg-[#1E3A5F]/40 border-l-[#B8860B]',
    assessment: 'bg-amber-950/20 border-l-amber-600',
    break: 'bg-[#091628]/40 border-l-[#1E3A5F]',
    admin: 'bg-[#1E3A5F]/10 border-l-[#1E3A5F]',
    ceremony: 'bg-[#B8860B]/10 border-l-[#B8860B]',
  };

  const content = (
    <div className={`flex gap-4 px-4 py-3 rounded-r-lg border-l-4 ${colours[item.type] ?? colours.admin}`}>
      <span className="text-slate-500 text-sm w-28 shrink-0">{item.time}</span>
      <span className={`text-sm ${item.type === 'break' ? 'text-slate-500' : 'text-slate-200'}`}>{item.session}</span>
    </div>
  );

  if (item.type === 'module' && item.moduleId) {
    return <Link href={`/modules/${item.moduleId}`} className="block hover:opacity-80 transition-opacity">{content}</Link>;
  }
  if (item.type === 'assessment') {
    return <Link href="/assessments" className="block hover:opacity-80 transition-opacity">{content}</Link>;
  }
  return content;
}

export default function ProgrammePage() {
  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← Back to Home</Link>
        <h1 className="text-3xl font-bold text-white mt-4 mb-2">Full Programme Schedule</h1>
        <p className="text-slate-400">Two-day instructor-led programme. Click a module or assessment to begin.</p>
      </div>

      {/* Day 1 */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#B8860B] flex items-center justify-center font-bold text-white text-sm">1</div>
          <h2 className="text-xl font-bold text-white">Day 1 — Platform Foundations & User Governance</h2>
        </div>
        <div className="space-y-1">
          {DAY1.map((item, i) => <ScheduleRow key={i} item={item} />)}
        </div>
      </section>

      {/* Day 2 */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center font-bold text-white text-sm">2</div>
          <h2 className="text-xl font-bold text-white">Day 2 — Operations, Security & Maintenance</h2>
        </div>
        <div className="space-y-1">
          {DAY2.map((item, i) => <ScheduleRow key={i} item={item} />)}
        </div>
      </section>

      {/* CTA */}
      <div className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-6 text-center">
        <h2 className="text-lg font-semibold text-white mb-2">Ready to begin?</h2>
        <p className="text-slate-400 text-sm mb-4">Start with the pre-assessment to establish your baseline, then work through the modules.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/assessments/pre" className="bg-[#1E3A5F] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2A4A7F] transition-colors">
            Take Pre-Assessment
          </Link>
          <Link href="/modules/1" className="bg-[#B8860B] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#D4A017] transition-colors">
            Start Module 1
          </Link>
        </div>
      </div>
    </main>
  );
}
