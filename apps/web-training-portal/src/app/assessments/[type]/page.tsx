'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';

// Assessment question banks
const PRE_QUESTIONS = [
  { q: 'What does SCIM stand for?', options: ['Secure Configuration and Identity Management', 'System for Cross-domain Identity Management', 'Standard Cloud Identity Mechanism', 'Structured Credential and Integration Model'], answer: 1 },
  { q: 'Which of the following best describes "deprovisioning"?', options: ['Adding a user to a new system', 'Removing a user\'s access when they leave an organisation', 'Resetting a user\'s password', 'Granting temporary elevated access'], answer: 1 },
  { q: 'In RBAC, what does "least privilege" mean?', options: ['Users should have the minimum permissions needed to do their job', 'Junior staff should have fewer permissions than senior staff', 'All users should have read-only access by default', 'Permissions should be granted manually for each action'], answer: 0 },
  { q: 'What is a JWT?', options: ['A type of database backup', 'A JSON-formatted token used for authentication', 'A webhook delivery format', 'A SAML assertion type'], answer: 1 },
  { q: 'Can a user have EDIT permission without VIEW in a cumulative permission model?', options: ['Yes, permissions are independent', 'No, permissions are cumulative', 'Yes, if an admin explicitly grants EDIT only', 'Depends on the module'], answer: 1 },
];

const DAY1_QUESTIONS = [
  { q: 'A user\'s SCIM provisioning is failing with HTTP 409. What is the most likely cause?', options: ['The SCIM bearer token has expired', 'A user with the same email address already exists', 'The IdP group is not mapped to an IMS role', 'The SCIM endpoint URL is incorrect'], answer: 1, explanation: 'HTTP 409 Conflict indicates the resource already exists — a duplicate email in this context.' },
  { q: 'What IMS audit event confirms a user was deprovisioned via SCIM?', options: ['USER_DELETED', 'AUTH_LOGOUT', 'SCIM_USER_DEACTIVATE', 'USER_UPDATED'], answer: 2, explanation: 'SCIM_USER_DEACTIVATE is the specific event logged when SCIM deprovisioning sets an account to Inactive.' },
  { q: 'A participant\'s invitation email expired. What is their account status and the correct action?', options: ['Active — no action needed', 'Pending — resend invitation', 'Inactive — reactivate the account', 'Deleted — create a new account'], answer: 1, explanation: 'Pending means invited but not accepted. Resend the invitation to generate a new link.' },
  { q: 'An HS Manager needs to cover Quality Manager for two weeks. What is the CORRECT approach?', options: ['Assign QUALITY_MANAGER permanently', 'Give a DENY override on other namespaces', 'Use a Temporary Access Grant expiring in 14 days', 'Create a combined custom role'], answer: 2, explanation: 'Temporary Access Grants are designed for exactly this use case — they auto-revoke at expiry.' },
  { q: 'A user has Role A (health_safety: EDIT) and Role B (health_safety: VIEW). What is their effective permission?', options: ['VIEW (most restrictive)', 'EDIT (most permissive)', 'ADMIN (combined)', 'NONE (conflict)'], answer: 1, explanation: 'Most permissive wins per namespace. EDIT > VIEW, so the effective level is EDIT.' },
];

const FINAL_QUESTIONS = [
  { q: 'What SCIM endpoint is used to create a new user?', options: ['GET /scim/v2/Users', 'POST /scim/v2/Users', 'PUT /scim/v2/Users', 'PATCH /scim/v2/Users'], answer: 1 },
  { q: 'How many predefined roles exist in the Nexara IMS?', options: ['17', '28', '39', '44'], answer: 2 },
  { q: 'The AUDITOR role grants which of the following?', options: ['ADMIN on compliance namespace only', 'VIEW on all 17 namespaces plus audit log export', 'EDIT on all namespaces except platform', 'ADMIN on the audit namespace only'], answer: 1 },
  { q: 'Which OAuth 2.0 grant type is for server-to-server integration with no user interaction?', options: ['Authorization Code', 'Implicit', 'Client Credentials', 'Device Code'], answer: 2 },
  { q: 'An audit event with category ADMIN and action ROLE_ASSIGNED means:', options: ['A user logged in with admin privileges', 'An administrator granted a role to a user', 'A role was created in the system', 'A module admin activated a new module'], answer: 1 },
  { q: 'What is the IMS rollback SLA?', options: ['10 minutes', '30 minutes', '1 hour', '4 hours'], answer: 1 },
  { q: 'Auto-rollback triggers when:', options: ['Any user reports an error', 'Health check fails 3 times or error rate >5% for 2 min', 'Update takes >60 min', 'Any Grafana alert fires'], answer: 1 },
  { q: 'The IMS audit log uses SHA-256 chained hashing. This means:', options: ['All events are encrypted', 'Modifying any past event invalidates all subsequent hashes', 'The log cannot be exported until hashes are verified', 'Only SUPER_ADMIN can read hash values'], answer: 1 },
];

const ASSESSMENT_CONFIG = {
  pre: { title: 'Pre-Assessment', questions: PRE_QUESTIONS, scored: false, time: null },
  day1: { title: 'Day 1 Formative', questions: DAY1_QUESTIONS, scored: true, time: 15 * 60, pass: 0.7 },
  final: { title: 'Summative Assessment — Part A', questions: FINAL_QUESTIONS, scored: true, time: 45 * 60, pass: 0.75 },
};

export default function AssessmentPage({ params }: { params: { type: string } }) {
  const type = params.type as keyof typeof ASSESSMENT_CONFIG;
  const config = ASSESSMENT_CONFIG[type];
  if (!config) notFound();

  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(config.questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.time ?? 0);
  const router = useRouter();

  useEffect(() => {
    if (!started || !config.time || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timer); setSubmitted(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, config.time, submitted]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const score = submitted ? answers.filter((a, i) => a === config.questions[i].answer).length : 0;
  const pct = submitted ? Math.round((score / config.questions.length) * 100) : 0;
  const passed = config.scored && submitted ? pct >= (type === 'final' ? 75 : 70) : false;
  const distinction = type === 'final' && pct >= 90;

  const handleAnswer = useCallback((idx: number) => {
    if (submitted) return;
    setAnswers((prev) => { const next = [...prev]; next[current] = idx; return next; });
  }, [current, submitted]);

  if (!started) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto flex flex-col items-center justify-center">
        <div className="bg-[#091628] border border-[#1E3A5F] rounded-2xl p-8 text-center w-full">
          <h1 className="text-2xl font-bold text-white mb-2">{config.title}</h1>
          <p className="text-slate-400 mb-6 text-sm">
            {config.questions.length} questions · {config.time ? formatTime(config.time) + ' timed' : 'Unscored diagnostic'}
          </p>
          {!config.scored && (
            <p className="text-sm text-blue-400 bg-blue-950/20 border border-blue-800 rounded-lg p-3 mb-6">
              This is a diagnostic assessment. Results are not shown to you — they help your facilitator tailor the programme.
            </p>
          )}
          <button
            onClick={() => setStarted(true)}
            className="bg-[#B8860B] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#D4A017] transition-colors"
          >
            Start Assessment
          </button>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto">
        <div className="bg-[#091628] border border-[#1E3A5F] rounded-2xl p-8 text-center">
          {config.scored ? (
            <>
              <div className={`text-6xl font-bold mb-2 ${distinction ? 'text-[#B8860B]' : passed ? 'text-green-400' : 'text-red-400'}`}>
                {pct}%
              </div>
              <div className="text-xl font-semibold text-white mb-1">
                {distinction ? 'Distinction' : passed ? 'Pass' : 'Did Not Pass'}
              </div>
              <div className="text-slate-400 text-sm mb-6">{score}/{config.questions.length} correct</div>
              {passed && (
                <Link href="/certificate" className="inline-block bg-[#B8860B] text-white px-6 py-2 rounded-lg hover:bg-[#D4A017] transition-colors text-sm font-medium mb-4">
                  Generate Certificate →
                </Link>
              )}
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">✓</div>
              <div className="text-xl font-semibold text-white mb-2">Pre-Assessment Complete</div>
              <div className="text-slate-400 text-sm mb-6">Thank you. Your facilitator will use these results to tailor the programme.</div>
            </>
          )}

          {/* Review answers */}
          {config.scored && (
            <div className="text-left mt-8 space-y-4">
              <h2 className="text-sm font-semibold text-[#B8860B] uppercase tracking-wider mb-4">Answer Review</h2>
              {config.questions.map((q, i) => {
                const correct = answers[i] === q.answer;
                return (
                  <div key={i} className={`rounded-lg p-4 border ${correct ? 'border-green-800 bg-green-950/10' : 'border-red-800 bg-red-950/10'}`}>
                    <p className="text-sm text-white font-medium mb-2">{i + 1}. {q.q}</p>
                    <p className="text-xs text-slate-300 mb-1">Correct: <span className="text-green-400">{q.options[q.answer]}</span></p>
                    {!correct && <p className="text-xs text-slate-400">Your answer: <span className="text-red-400">{answers[i] !== null ? q.options[answers[i]!] : 'Not answered'}</span></p>}
                    {'explanation' in q && !correct && <p className="text-xs text-slate-500 mt-2 italic">{(q as any).explanation}</p>}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6">
            <Link href="/assessments" className="text-sm text-slate-400 hover:text-white transition-colors">← Back to Assessments</Link>
          </div>
        </div>
      </main>
    );
  }

  const q = config.questions[current];
  const progress = Math.round((current / config.questions.length) * 100);

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-white">{config.title}</h1>
        {config.time && (
          <div className={`text-sm font-mono px-3 py-1 rounded-lg border ${timeLeft < 120 ? 'border-red-600 bg-red-950/20 text-red-400' : 'border-[#1E3A5F] bg-[#091628] text-white'}`}>
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-[#1E3A5F] rounded-full mb-6">
        <div className="h-1.5 bg-[#B8860B] rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="text-xs text-slate-400 mb-6">Question {current + 1} of {config.questions.length}</div>

      {/* Question */}
      <div className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-6 mb-4">
        <p className="text-white font-medium mb-6">{q.q}</p>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm border transition-all ${
                answers[current] === i
                  ? 'border-[#B8860B] bg-[#B8860B]/10 text-white'
                  : 'border-[#1E3A5F] text-slate-300 hover:border-[#B8860B]/50 hover:text-white'
              }`}
            >
              <span className="font-medium mr-2 text-slate-400">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-30"
        >
          ← Previous
        </button>
        {current < config.questions.length - 1 ? (
          <button
            onClick={() => setCurrent((c) => c + 1)}
            className="text-sm bg-[#B8860B] text-white px-4 py-2 rounded-lg hover:bg-[#D4A017] transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={() => setSubmitted(true)}
            className="text-sm bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Submit Assessment
          </button>
        )}
      </div>
    </main>
  );
}
