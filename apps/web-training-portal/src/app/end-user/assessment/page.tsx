'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Clock, ChevronRight, ChevronLeft, CheckCircle, XCircle } from 'lucide-react';

type Question = { q: string; options: string[]; correct: string };

const QUESTIONS: Question[] = [
  // Module 1 — Platform Navigation (3 Q)
  {
    q: 'Where do you find tasks and action items assigned directly to you?',
    options: ['A. My Training widget', 'B. My Tasks widget', 'C. System Alerts', 'D. Recent Activity'],
    correct: 'B',
  },
  {
    q: 'What colour indicates an "action required" notification in the bell icon?',
    options: ['A. Blue', 'B. Green', 'C. Amber', 'D. Red'],
    correct: 'C',
  },
  {
    q: 'On mobile, how do you access the main module navigation?',
    options: ['A. Tap the profile avatar', 'B. Tap the hamburger menu (≡)', 'C. Swipe left from the edge', 'D. Long-press the Nexara logo'],
    correct: 'B',
  },
  // Module 2 — Recording Incidents (4 Q)
  {
    q: 'A chemical spill occurs in the laboratory but is immediately contained with no injury. What record type is most appropriate?',
    options: ['A. Observation', 'B. Near Miss', 'C. Incident', 'D. CAPA'],
    correct: 'C',
  },
  {
    q: 'You notice a machine guard is missing but no one has been injured. What should you record?',
    options: ['A. Incident — MINOR', 'B. Near Miss', 'C. Observation', 'D. Nothing — report verbally'],
    correct: 'C',
  },
  {
    q: 'Which severity level is assigned to events with the most serious potential consequences?',
    options: ['A. MAJOR', 'B. CRITICAL', 'C. SEVERE', 'D. CATASTROPHIC'],
    correct: 'D',
  },
  {
    q: 'After saving an incident record, where do you upload photographic evidence?',
    options: ['A. Attach it to the confirmation email', 'B. The Evidence tab on the incident record', 'C. A separate document management folder', 'D. The Description field'],
    correct: 'B',
  },
  // Module 3 — Training Acknowledgements (3 Q)
  {
    q: 'What does a RED Training Compliance RAG status mean?',
    options: ['A. All training is complete', 'B. One assignment is due within 7 days', 'C. One or more assignments are overdue', 'D. The training module is unavailable'],
    correct: 'C',
  },
  {
    q: 'When acknowledging a procedure, what action creates the digital signature?',
    options: ['A. Clicking Save', 'B. Completing all scroll sections', 'C. Entering your password', 'D. Emailing your manager'],
    correct: 'C',
  },
  {
    q: 'How many days before a deadline does Nexara send the first training reminder?',
    options: ['A. 7 days', 'B. 14 days', 'C. 21 days', 'D. 30 days'],
    correct: 'D',
  },
  // Module 4 — Permit to Work (4 Q)
  {
    q: 'Which activity requires a Hot Work permit?',
    options: ['A. Painting an interior wall', 'B. Welding on a structural beam', 'C. Replacing a light fitting', 'D. Cleaning a work surface with detergent'],
    correct: 'B',
  },
  {
    q: 'When may you begin work that requires a Permit to Work?',
    options: ['A. Once the risk assessment is signed', 'B. After verbal approval from your supervisor', 'C. Only after receiving written/digital confirmation that the permit is APPROVED', 'D. Once you have submitted the permit request'],
    correct: 'C',
  },
  {
    q: 'During permitted work, conditions change unexpectedly. What is your first action?',
    options: ['A. Continue working and note it in the closure section', 'B. Stop work and notify the permit authority', 'C. Extend the permit end time', 'D. Add new workers to the permit record'],
    correct: 'B',
  },
  {
    q: 'For how long are closed Permit to Work records retained in Nexara?',
    options: ['A. 1 year', 'B. 3 years', 'C. 5 years', 'D. 7 years'],
    correct: 'D',
  },
  // Module 5 — Observations (3 Q)
  {
    q: 'You see a colleague correctly following a manual handling procedure. Which record type is most appropriate?',
    options: ['A. Incident', 'B. Near Miss', 'C. Positive Observation', 'D. Negative Observation'],
    correct: 'C',
  },
  {
    q: 'When you submit an anonymous observation, who can reverse the anonymisation?',
    options: ['A. Your line manager', 'B. The HSE manager', 'C. The system administrator', 'D. No one — it cannot be reversed'],
    correct: 'D',
  },
  {
    q: 'After submitting a negative observation, what does Nexara automatically generate?',
    options: ['A. A new incident record', 'B. A follow-up action assigned to the area\'s responsible person', 'C. An email to the HSE regulator', 'D. A CAPA record'],
    correct: 'B',
  },
  // Module 6 — Reports & Dashboards (3 Q)
  {
    q: 'What does the Active Permits dashboard widget show?',
    options: ['A. All permits submitted by anyone in your organisation', 'B. Permits in APPROVED or IN-PROGRESS status that you are listed on', 'C. Permits that have been rejected', 'D. Permits due for renewal in the next 30 days'],
    correct: 'B',
  },
  {
    q: 'You have filtered a report by the last quarter. What data does the CSV export contain?',
    options: ['A. All historical data regardless of filter', 'B. Data from the current month only', 'C. Only the filtered data visible on screen at the time of download', 'D. Data from the previous 12 months'],
    correct: 'C',
  },
  {
    q: 'Where do you find pre-configured compliance reports relevant to your role?',
    options: ['A. Dashboard → My Tasks', 'B. Profile → Settings', 'C. Health & Safety → Incidents', 'D. Reports → My Reports'],
    correct: 'D',
  },
];

const PASS_THRESHOLD = 80; // 80% = 16/20
const TIMER_SECONDS = 20 * 60; // 20 minutes

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function genCertId(): string {
  const year = new Date().getFullYear();
  const hex = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 10).toString()
  ).join('');
  return `NEU-${year}-${hex}`;
}

type Screen = 'start' | 'question' | 'results';

export default function EndUserAssessmentPage() {
  const [screen, setScreen] = useState<Screen>('start');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const [certId] = useState(genCertId);

  useEffect(() => {
    if (screen !== 'question') return;
    if (timeLeft <= 0) { setTimedOut(true); setScreen('results'); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [screen, timeLeft]);

  const select = (letter: string) => {
    setAnswers((prev) => ({ ...prev, [current]: letter }));
  };

  const goNext = () => {
    if (current < QUESTIONS.length - 1) setCurrent((c) => c + 1);
    else setScreen('results');
  };

  const goPrev = () => { if (current > 0) setCurrent((c) => c - 1); };

  const correctCount = QUESTIONS.filter((q, i) => answers[i] === q.correct).length;
  const pct = Math.round((correctCount / QUESTIONS.length) * 100);
  const passed = pct >= PASS_THRESHOLD;
  const isWarning = timeLeft <= 120 && timeLeft > 0;

  // ── Start screen ────────────────────────────────────────────────────────────
  if (screen === 'start') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#B8860B]/20 border border-[#B8860B]/40 flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-[#B8860B]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              End User Summative Assessment
            </h1>
            <p className="text-slate-400 text-sm">Nexara Platform Foundation — End User Training</p>
          </div>
          <div className="bg-[#091628] border border-[#1E3A5F] rounded-2xl p-8 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-[#1E3A5F]/30 rounded-xl">
                <div className="text-2xl font-bold text-white">20</div>
                <div className="text-xs text-slate-400">Questions</div>
              </div>
              <div className="text-center p-4 bg-[#1E3A5F]/30 rounded-xl">
                <div className="text-2xl font-bold text-white">20 min</div>
                <div className="text-xs text-slate-400">Time limit</div>
              </div>
              <div className="text-center p-4 bg-[#1E3A5F]/30 rounded-xl">
                <div className="text-2xl font-bold text-[#B8860B]">80%</div>
                <div className="text-xs text-slate-400">Pass mark</div>
              </div>
              <div className="text-center p-4 bg-[#1E3A5F]/30 rounded-xl">
                <div className="text-2xl font-bold text-white">16/20</div>
                <div className="text-xs text-slate-400">Correct needed</div>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex gap-2"><span className="text-[#B8860B]">·</span>Covers all 6 modules of the End User Training programme</li>
              <li className="flex gap-2"><span className="text-[#B8860B]">·</span>Timer starts when you click Begin Assessment</li>
              <li className="flex gap-2"><span className="text-[#B8860B]">·</span>You can navigate back and change your answers before submitting</li>
              <li className="flex gap-2"><span className="text-[#B8860B]">·</span>On pass: certificate available immediately for download</li>
              <li className="flex gap-2"><span className="text-[#B8860B]">·</span>On fail: retake immediately (e-learning) or at next virtual session</li>
            </ul>
          </div>
          <button
            onClick={() => { setScreen('question'); setTimeLeft(TIMER_SECONDS); }}
            className="w-full bg-[#B8860B] text-white font-semibold py-3 rounded-lg hover:bg-[#D4A017] transition-colors flex items-center justify-center gap-2"
          >
            Begin Assessment <ChevronRight className="w-4 h-4" />
          </button>
          <div className="text-center mt-4">
            <Link href="/end-user/modules" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              ← Review modules first
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Question screen ─────────────────────────────────────────────────────────
  if (screen === 'question') {
    const q = QUESTIONS[current];
    const answered = answers[current];
    const progress = ((current + 1) / QUESTIONS.length) * 100;

    return (
      <main className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-[#1E3A5F] bg-[#091628] px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-slate-400 font-medium">
            Question <span className="text-white font-bold">{current + 1}</span> / {QUESTIONS.length}
          </div>
          <div className={`flex items-center gap-2 text-sm font-mono font-semibold ${isWarning ? 'text-red-400' : 'text-white'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[#1E3A5F]">
          <div className="h-1 bg-[#B8860B] transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-2xl">
            <p className="text-lg font-semibold text-white mb-6 leading-relaxed">{q.q}</p>
            <div className="space-y-3 mb-8">
              {q.options.map((opt) => {
                const letter = opt.charAt(0);
                const selected = answered === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => select(letter)}
                    className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm transition-all ${
                      selected
                        ? 'border-[#B8860B] text-white bg-[#B8860B]/15'
                        : 'border-[#1E3A5F] text-slate-300 bg-[#091628] hover:border-[#B8860B]/50 hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={goPrev}
                disabled={current === 0}
                className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors ${current === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <div className="text-xs text-slate-500">
                {Object.keys(answers).length} / {QUESTIONS.length} answered
              </div>
              <button
                onClick={goNext}
                className={`flex items-center gap-2 text-sm px-5 py-2 rounded-lg font-semibold transition-colors ${
                  current === QUESTIONS.length - 1
                    ? 'bg-[#B8860B] text-white hover:bg-[#D4A017]'
                    : 'bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/80'
                }`}
              >
                {current === QUESTIONS.length - 1 ? 'Submit' : 'Next'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Results screen ──────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          {passed ? (
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          )}
          <h1 className="text-3xl font-bold text-white mb-2">
            {timedOut ? 'Time expired' : passed ? 'Congratulations!' : 'Assessment not passed'}
          </h1>
          <p className="text-slate-400">
            {timedOut
              ? 'Your time ran out. Your answers up to that point have been scored.'
              : passed
              ? 'You have passed the End User Training assessment.'
              : `You need ${Math.ceil(QUESTIONS.length * PASS_THRESHOLD / 100)} correct answers (${PASS_THRESHOLD}%) to pass.`}
          </p>
        </div>

        <div className="bg-[#091628] border border-[#1E3A5F] rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className={`text-5xl font-bold mb-1 ${passed ? 'text-green-400' : 'text-red-400'}`}>{pct}%</div>
              <div className="text-sm text-slate-400">Score</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-1">{correctCount}/{QUESTIONS.length}</div>
              <div className="text-sm text-slate-400">Correct</div>
            </div>
          </div>
          {passed && (
            <div className="bg-[#B8860B]/10 border border-[#B8860B]/30 rounded-xl p-4 text-center mb-4">
              <Award className="w-6 h-6 text-[#B8860B] mx-auto mb-2" />
              <div className="text-sm font-semibold text-white">Nexara Platform Foundation</div>
              <div className="text-xs text-slate-400">End User Completion Certificate</div>
              <div className="text-xs text-slate-500 mt-1 font-mono">{certId}</div>
            </div>
          )}
        </div>

        {/* Answer Review */}
        <div className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-white mb-4">Answer Review</h2>
          <div className="space-y-2">
            {QUESTIONS.map((q, i) => {
              const userAns = answers[i];
              const correct = userAns === q.correct;
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg text-sm ${correct ? 'bg-green-900/10' : 'bg-red-900/10'}`}>
                  <span className={`shrink-0 font-bold ${correct ? 'text-green-400' : 'text-red-400'}`}>
                    {i + 1}.
                  </span>
                  <div className="flex-1 text-slate-300 text-xs">{q.q}</div>
                  <div className="shrink-0 text-xs">
                    {correct ? (
                      <span className="text-green-400">{userAns} ✓</span>
                    ) : (
                      <span className="text-red-400">{userAns || '—'} → {q.correct}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {passed ? (
            <Link
              href="/certificate"
              className="flex-1 bg-[#B8860B] text-white font-semibold py-3 rounded-lg hover:bg-[#D4A017] transition-colors text-center"
            >
              Download Certificate
            </Link>
          ) : (
            <button
              onClick={() => { setScreen('start'); setCurrent(0); setAnswers({}); setTimeLeft(TIMER_SECONDS); setTimedOut(false); }}
              className="flex-1 bg-[#B8860B] text-white font-semibold py-3 rounded-lg hover:bg-[#D4A017] transition-colors"
            >
              Retake Assessment
            </button>
          )}
          <Link
            href="/end-user/modules"
            className="flex-1 border border-[#1E3A5F] text-slate-300 font-semibold py-3 rounded-lg hover:border-[#B8860B]/50 hover:text-white transition-colors text-center"
          >
            Review Modules
          </Link>
        </div>
      </div>
    </main>
  );
}
