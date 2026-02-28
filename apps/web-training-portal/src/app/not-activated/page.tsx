'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Key, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Suspense } from 'react';

function NotActivatedContent() {
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    // Simulate a brief validation delay
    await new Promise((r) => setTimeout(r, 600));

    const trimmed = key.trim().toUpperCase();

    // Nexara-issued keys follow the pattern NEXARA-ATP-<ORG>-<YEAR>
    if (trimmed.startsWith('NEXARA-ATP-') && trimmed.length >= 20) {
      // Set the activation cookie (expires 1 year)
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `nexara_portal_key=${trimmed}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;

      setStatus('success');
      setTimeout(() => router.push(next), 1200);
    } else {
      setStatus('error');
      setErrorMsg(
        'This activation key is not recognised. Keys are issued by Nexara and follow the format NEXARA-ATP-ORGNAME-YEAR. Contact training@nexara.io if you believe this is an error.'
      );
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Nexara wordmark */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 rounded-xl bg-[#B8860B] flex items-center justify-center font-bold text-lg text-white">
          N
        </div>
        <span className="font-semibold text-white text-lg">Nexara IMS</span>
      </div>

      <div className="w-full max-w-lg">
        {/* Status: success */}
        {status === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Portal Activated</h1>
            <p className="text-slate-400 text-sm">Redirecting you to the training programme…</p>
          </div>
        ) : (
          <>
            {/* Lock icon + heading */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#1E3A5F]/50 border border-[#1E3A5F] flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-slate-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Training Portal Not Activated
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
                The <strong className="text-white">Nexara Role-Based Administrator Training Programme</strong> is
                a managed service that must be activated by Nexara for your organisation before it
                can be accessed.
              </p>
            </div>

            {/* Information card */}
            <div className="bg-[#091628] border border-[#1E3A5F] rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-semibold text-[#B8860B] uppercase tracking-wider mb-4">
                How to Get Access
              </h2>
              <ol className="space-y-4 text-sm text-slate-300">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1E3A5F] text-slate-400 text-xs flex items-center justify-center shrink-0 font-medium mt-0.5">
                    1
                  </span>
                  <span>
                    Contact Nexara to request enrolment in the Administrator Training Programme.
                    Your account manager can raise this, or email{' '}
                    <a href="mailto:training@nexara.io" className="text-[#B8860B] hover:underline">
                      training@nexara.io
                    </a>
                    .
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1E3A5F] text-slate-400 text-xs flex items-center justify-center shrink-0 font-medium mt-0.5">
                    2
                  </span>
                  <span>
                    Nexara will review your request and, upon approval, issue a{' '}
                    <strong className="text-white">Portal Activation Key</strong> unique to your
                    organisation.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1E3A5F] text-slate-400 text-xs flex items-center justify-center shrink-0 font-medium mt-0.5">
                    3
                  </span>
                  <span>
                    Enter your activation key below. Once activated, all registered participants in
                    your cohort will have access.
                  </span>
                </li>
              </ol>
            </div>

            {/* Activation key form */}
            <div className="bg-[#091628] border border-[#1E3A5F] rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-4 h-4 text-[#B8860B]" />
                <h2 className="text-sm font-semibold text-white">Enter Activation Key</h2>
              </div>
              <form onSubmit={handleActivate} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      setKey(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder="NEXARA-ATP-ORGNAME-2026"
                    className="w-full bg-[#1E3A5F]/30 border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-white text-sm font-mono placeholder-slate-500 focus:outline-none focus:border-[#B8860B] transition-colors"
                    required
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Activation keys are provided by Nexara upon service approval.
                  </p>
                </div>

                {status === 'error' && (
                  <div className="flex gap-2 text-sm text-red-400 bg-red-950/20 border border-red-800 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || !key.trim()}
                  className="w-full bg-[#B8860B] text-white font-semibold py-2.5 rounded-lg hover:bg-[#D4A017] transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? 'Validating…' : 'Activate Portal'}
                </button>
              </form>
            </div>

            {/* Contact CTA */}
            <div className="bg-amber-950/10 border border-amber-800/50 rounded-xl p-4 flex items-start gap-3">
              <Mail className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium text-amber-300 mb-1">
                  Request Access from Nexara
                </div>
                <p className="text-xs text-slate-400">
                  If your organisation has not yet enrolled in the training programme, contact your
                  Nexara account manager or email{' '}
                  <a href="mailto:training@nexara.io" className="text-[#B8860B] hover:underline">
                    training@nexara.io
                  </a>{' '}
                  with your organisation name and IMS licence reference number.
                </p>
                <a
                  href="https://nexara.io/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#B8860B] hover:underline mt-2"
                >
                  nexara.io/contact <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer note */}
      {status !== 'success' && (
        <p className="text-xs text-slate-600 mt-12 text-center">
          This portal is operated exclusively by Nexara DMCC.
          Unauthorised access attempts are logged and may be investigated.
        </p>
      )}
    </main>
  );
}

export default function NotActivatedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <NotActivatedContent />
    </Suspense>
  );
}
