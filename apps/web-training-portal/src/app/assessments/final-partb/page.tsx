'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Clock, FileText } from 'lucide-react';

const SCENARIOS = [
  {
    id: 'A',
    title: 'SCIM Outage',
    marks: 5,
    situation: 'Your company uses Azure AD SCIM provisioning. This morning, the HR team reports that 12 new starters hired yesterday have not appeared in the IMS. The HR team confirms they were added to the IMS-NewStarters Azure AD group yesterday afternoon.',
    task: 'Diagnose the outage and outline the remediation steps.',
    criteria: [
      'Correct first diagnostic step (check IMS audit log for SCIM events)',
      'Identifies the SCIM token as a likely cause of 401 failures (or another plausible HTTP error code with correct explanation)',
      'Describes how to verify IdP connectivity from the Azure AD side',
      'Outlines the correct remediation for the root cause identified',
      'Describes how to provision the 12 affected users without waiting for the next automated cycle',
    ],
  },
  {
    id: 'B',
    title: 'Privilege Escalation',
    marks: 5,
    situation: 'Your SIEM fires an alert at 11:47 PM: "User karen.booth@meridian.io (Quality Manager) performed an HR data export containing 189 employee records. Karen\'s role is QUALITY_MANAGER which has no HR namespace access."',
    task: 'Investigate using audit log data and outline the containment response.',
    criteria: [
      'Correctly identifies the audit events that reveal how Karen gained HR access (ROLE_ASSIGNED or PERMISSION_OVERRIDE)',
      'Determines whether this is a compromised account or insider action (and explains what evidence distinguishes them)',
      'Lists the immediate containment steps in correct priority order',
      'Identifies the data protection obligation triggered (GDPR: HR records = personal data; 72-hour notification window)',
      'Describes the post-incident review actions',
    ],
  },
  {
    id: 'C',
    title: 'Failed Update Rollback',
    marks: 5,
    situation: 'You applied IMS v2.16.0 at 09:00 today. At 09:34, monitoring shows the health check returning DEGRADED on 2 of 3 pods, and the error rate has climbed to 6.2%. The auto-rollback did not trigger. It is now 09:36.',
    task: 'Execute the recovery within the 30-minute SLA.',
    criteria: [
      'Correct priority of first action (declare incident in change management + notify stakeholders)',
      'Correctly identifies that auto-rollback did not trigger and manual intervention is required (and why the threshold may have been missed)',
      'Lists the exact steps to initiate a manual rollback',
      'Describes the post-rollback validation steps',
      'Describes the post-mortem requirements and timeline',
    ],
  },
];

export default function FinalPartBPage() {
  const [answers, setAnswers] = useState({ A: '', B: '', C: '' });
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft] = useState(15 * 60); // 15 minutes reading/writing

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const allAnswered = answers.A.trim().length >= 30 &&
    answers.B.trim().length >= 30 &&
    answers.C.trim().length >= 30;

  if (submitted) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto">
        <div className="bg-[#091628] border border-[#1E3A5F] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#B8860B]/20 border border-[#B8860B] flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#B8860B]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Summative Assessment Complete</h1>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Both Part A (40 MCQ) and Part B (3 scenarios) submitted. Your facilitator will mark Part B against the rubric
            and combine scores for your certificate grade.
          </p>
          <div className="bg-[#1E3A5F]/20 border border-[#1E3A5F] rounded-xl p-4 mb-6 text-left space-y-2 text-sm text-slate-300">
            <div className="flex justify-between"><span>Part A (40 MCQ)</span><span className="text-slate-400">Self-scored</span></div>
            <div className="flex justify-between"><span>Part B (3 scenarios × 5 marks)</span><span className="text-slate-400">Facilitator marked</span></div>
            <div className="flex justify-between font-semibold border-t border-[#1E3A5F] pt-2 mt-2"><span>Total</span><span className="text-slate-400">55 marks</span></div>
            <div className="flex justify-between text-xs"><span className="text-green-400">Pass</span><span className="text-slate-500">≥42 marks (75%)</span></div>
            <div className="flex justify-between text-xs"><span className="text-[#B8860B]">Distinction</span><span className="text-slate-500">≥50 marks (90%)</span></div>
          </div>
          <p className="text-xs text-slate-500 mb-6">Results will be announced within 30 minutes of the assessment close.</p>
          <Link
            href="/certificate"
            className="inline-block bg-[#B8860B] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#D4A017] transition-colors text-sm"
          >
            Prepare Your Certificate →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-[#B8860B] font-semibold uppercase tracking-wider">Summative Assessment</div>
          <h1 className="text-2xl font-bold text-white mt-1">Part B — Scenario Questions</h1>
        </div>
        <div className="flex items-center gap-2 text-sm font-mono px-3 py-1.5 rounded-lg border border-[#1E3A5F] bg-[#091628] text-slate-300">
          <Clock className="w-4 h-4 text-slate-400" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-amber-950/10 border border-amber-800/50 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-2 text-sm text-amber-200/80">
          <FileText className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <strong className="text-amber-300">Instructions:</strong> Answer all three scenarios. Each is worth 5 marks.
            Written answers will be marked by your facilitator against the rubric. Individual work — no collaboration.
          </div>
        </div>
      </div>

      {/* Scenarios */}
      <div className="space-y-8">
        {SCENARIOS.map((s) => (
          <div key={s.id} className="bg-[#091628] border border-[#1E3A5F] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1E3A5F] flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">
                  Scenario {s.id} · {s.marks} marks
                </div>
                <h2 className="text-base font-semibold text-white">{s.title}</h2>
              </div>
              {answers[s.id as 'A' | 'B' | 'C'].trim().length >= 30 && (
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
              )}
            </div>
            <div className="px-6 py-5">
              <div className="bg-[#1E3A5F]/20 border border-[#1E3A5F] rounded-lg p-4 mb-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Situation</div>
                <p className="text-sm text-slate-300 leading-relaxed">{s.situation}</p>
              </div>
              <div className="mb-4">
                <div className="text-xs font-semibold text-[#B8860B] uppercase tracking-wider mb-2">Your Task</div>
                <p className="text-sm text-slate-200">{s.task}</p>
              </div>
              <div className="mb-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Marking criteria (1 mark each)
                </div>
                <ol className="space-y-1.5">
                  {s.criteria.map((c, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-400">
                      <span className="text-slate-600 shrink-0">{i + 1}.</span>
                      {c}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Your Answer
                </label>
                <textarea
                  value={answers[s.id as 'A' | 'B' | 'C']}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [s.id]: e.target.value }))}
                  rows={8}
                  placeholder={`Write your answer for Scenario ${s.id} here…`}
                  className="w-full bg-[#1E3A5F]/20 border border-[#1E3A5F] rounded-lg px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#B8860B] transition-colors resize-none leading-relaxed"
                />
                <div className="text-xs text-slate-600 mt-1 text-right">
                  {answers[s.id as 'A' | 'B' | 'C'].trim().length} characters
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-8 pt-6 border-t border-[#1E3A5F] flex items-center justify-between">
        <Link href="/assessments/final" className="text-sm text-slate-400 hover:text-white transition-colors">
          ← Back to Part A
        </Link>
        <div className="flex items-center gap-4">
          {!allAnswered && (
            <span className="text-xs text-slate-500">All 3 scenarios must have a response before submitting</span>
          )}
          <button
            onClick={() => setSubmitted(true)}
            disabled={!allAnswered}
            className="bg-[#B8860B] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#D4A017] transition-colors disabled:opacity-40 text-sm"
          >
            Submit Part B
          </button>
        </div>
      </div>
    </main>
  );
}
