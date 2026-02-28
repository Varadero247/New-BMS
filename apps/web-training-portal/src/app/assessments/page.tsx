import Link from 'next/link';
import { ClipboardCheck, BookOpen, Trophy, Lock } from 'lucide-react';

const ASSESSMENTS = [
  {
    id: 'pre',
    title: 'Pre-Assessment',
    subtitle: 'Diagnostic (unscored)',
    description: 'A 20-question diagnostic to help your facilitator understand your starting knowledge level. Results are not shared with you — they guide facilitation emphasis.',
    questions: 20,
    duration: '15 min',
    scored: false,
    available: true,
    icon: BookOpen,
    colour: 'border-blue-800 bg-blue-950/20',
    iconColour: 'text-blue-400',
    badge: 'Day 1 Opening',
  },
  {
    id: 'day1',
    title: 'Day 1 Formative',
    subtitle: 'Scored — instant feedback',
    description: 'A 15-question scored assessment covering Modules 1–4. Instant per-question feedback helps you identify gaps before Day 2.',
    questions: 15,
    duration: '15 min',
    scored: true,
    available: true,
    icon: ClipboardCheck,
    colour: 'border-amber-800 bg-amber-950/20',
    iconColour: 'text-amber-400',
    badge: 'Day 1 Close',
  },
  {
    id: 'final',
    title: 'Summative Assessment',
    subtitle: 'Scored — determines certificate',
    description: 'Part A: 40 MCQ (45 min, timed). Part B: 3 written scenarios (15 min). Combined score determines your certificate grade.',
    questions: 55,
    duration: '60 min',
    scored: true,
    available: true,
    icon: Trophy,
    colour: 'border-[#B8860B] bg-[#B8860B]/5',
    iconColour: 'text-[#B8860B]',
    badge: 'Day 2 Afternoon',
  },
];

export default function AssessmentsPage() {
  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← Back to Home</Link>
        <h1 className="text-3xl font-bold text-white mt-4 mb-2">Assessment Hub</h1>
        <p className="text-slate-400">Complete all three assessments to qualify for your Nexara certificate.</p>
      </div>

      {/* Grade table */}
      <div className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-5 mb-8">
        <h2 className="text-sm font-semibold text-[#B8860B] uppercase tracking-wider mb-4">Certificate Grade Thresholds</h2>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div className="bg-red-950/20 border border-red-800 rounded-lg p-3">
            <div className="font-semibold text-red-400 mb-1">Fail</div>
            <div className="text-slate-400">&lt; 75% (42/55)</div>
          </div>
          <div className="bg-green-950/20 border border-green-800 rounded-lg p-3">
            <div className="font-semibold text-green-400 mb-1">Pass</div>
            <div className="text-slate-400">75–89% (42–49/55)</div>
          </div>
          <div className="bg-[#B8860B]/10 border border-[#B8860B] rounded-lg p-3">
            <div className="font-semibold text-[#B8860B] mb-1">Distinction</div>
            <div className="text-slate-400">≥ 90% (50+/55)</div>
          </div>
        </div>
      </div>

      {/* Assessment cards */}
      <div className="space-y-4">
        {ASSESSMENTS.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.id} className={`border rounded-xl p-6 ${a.colour}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className={`w-6 h-6 ${a.iconColour}`} />
                    <span className="text-xs text-slate-400 bg-[#091628] px-2 py-0.5 rounded-full border border-[#1E3A5F]">
                      {a.badge}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-white mb-1">{a.title}</h2>
                  <p className="text-xs text-slate-400 mb-3">{a.subtitle}</p>
                  <p className="text-sm text-slate-300 mb-4">{a.description}</p>
                  <div className="flex gap-4 text-sm text-slate-400">
                    <span>{a.questions} questions</span>
                    <span>{a.duration}</span>
                    <span>{a.scored ? '✓ Scored' : '○ Diagnostic'}</span>
                  </div>
                </div>
                <div className="shrink-0 pt-1">
                  {a.available ? (
                    <Link
                      href={`/assessments/${a.id}`}
                      className="inline-block bg-[#B8860B] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#D4A017] transition-colors"
                    >
                      Start →
                    </Link>
                  ) : (
                    <button disabled className="flex items-center gap-1 bg-[#1E3A5F] text-slate-500 text-sm px-4 py-2 rounded-lg cursor-not-allowed">
                      <Lock className="w-3 h-3" /> Locked
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
