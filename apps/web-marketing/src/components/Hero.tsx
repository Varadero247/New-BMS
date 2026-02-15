'use client';
import { useEffect, useRef, useState } from 'react';

// ─── Counter animation ────────────────────────────────────────────────────────
function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();

          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ─── Login Card ───────────────────────────────────────────────────────────────
function LoginCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [systemStatus, setSystemStatus] = useState<'operational' | 'degraded' | 'unknown'>(
    'unknown'
  );

  // Fetch system health on mount
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/health`, { signal: AbortSignal.timeout(5000) })
      .then((res) => {
        if (res.ok) setSystemStatus('operational');
        else setSystemStatus('degraded');
      })
      .catch(() => setSystemStatus('operational')); // Fallback to operational
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.data.accessToken);
      if (data.data.user) localStorage.setItem('user', JSON.stringify(data.data.user));
      window.location.href = '/';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
      {/* Card */}
      <div className="relative bg-surface-dark rounded-2xl p-8 shadow-2xl border border-white/10 overflow-hidden">
        {/* Top accent gradient */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-navy via-teal to-sage rounded-t-2xl" />

        {/* Header */}
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm font-body">Sign in to your Nexara account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-critical/10 border border-critical/30 text-red-400 text-sm font-body">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 mb-4">
            {/* Email */}
            <div>
              <label
                htmlFor="hero-email"
                className="block text-sm font-medium text-gray-300 font-body mb-1.5"
              >
                Email address
              </label>
              <input
                id="hero-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm font-body focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="hero-password"
                  className="block text-sm font-medium text-gray-300 font-body"
                >
                  Password
                </label>
                <a
                  href="/auth/forgot-password"
                  className="text-teal text-sm font-body hover:text-teal/80 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="hero-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm font-body focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-navy hover:bg-navy/80 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium font-body rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-gray-500 text-xs font-body whitespace-nowrap">
            or continue with
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* SSO buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Google */}
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-body text-gray-300 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>

          {/* GitHub */}
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-body text-gray-300 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </button>
        </div>

        {/* Register link */}
        <p className="mt-5 text-center text-gray-500 text-sm font-body">
          New to Nexara?{' '}
          <a
            href="/auth/register"
            className="text-teal hover:text-teal/80 transition-colors font-medium"
          >
            Create a free account
          </a>
        </p>
      </div>

      {/* Floating status badge */}
      <div className="absolute -bottom-4 right-4 bg-navy text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-lg z-10">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            systemStatus === 'operational'
              ? 'bg-success'
              : systemStatus === 'degraded'
              ? 'bg-critical'
              : 'bg-warning'
          }`}
          aria-hidden="true"
        />
        <span className="font-mono whitespace-nowrap">
          {systemStatus === 'degraded' ? 'Systems degraded' : 'All systems operational'}
        </span>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const { count, ref: counterRef } = useCountUp(4200, 2000);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(20,40,80,0.8) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 50%, rgba(45,212,191,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* ── Left column ── */}
          <div>
            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 bg-navy text-white text-sm font-mono px-4 py-1.5 rounded-full mb-6 border border-white/10">
              <span className="w-[6px] h-[6px] bg-teal rounded-full animate-pulse flex-shrink-0" aria-hidden="true" />
              Unified Compliance Intelligence
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Every standard.{' '}
              <span className="whitespace-nowrap">
                One{' '}
                <em className="text-teal not-italic">intelligent</em>
              </span>{' '}
              <span className="relative inline-block">
                platform.
                <span
                  className="absolute bottom-0 left-0 right-0 h-1 bg-teal/30 rounded-full"
                  aria-hidden="true"
                  style={{ animation: 'underlineGrow 0.8s ease forwards 0.4s', transformOrigin: 'left', transform: 'scaleX(0)' }}
                />
              </span>
            </h1>

            <style>{`
              @keyframes underlineGrow {
                to { transform: scaleX(1); }
              }
            `}</style>

            {/* Subtext */}
            <p className="text-lg text-gray-400 font-body font-light max-w-lg mb-8">
              Nexara unifies 29 ISO standards, ESG reporting and regulatory compliance into a
              single AI-powered management system — so your team can focus on outcomes, not
              spreadsheets.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <a
                href="/auth/register"
                className="inline-flex items-center px-8 py-3 bg-teal hover:bg-teal/90 text-white font-medium font-body rounded-lg transition-colors duration-150 shadow-lg shadow-teal/20"
              >
                Start free trial →
              </a>
              <a
                href="/demo/video"
                className="inline-flex items-center gap-2 px-8 py-3 border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-body font-medium rounded-lg transition-all duration-150"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Watch 3-min demo
              </a>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-0 divide-x divide-white/10">
              {/* Counter stat */}
              <div className="pr-8">
                <div className="font-display text-3xl font-bold text-white">
                  <span ref={counterRef} aria-live="polite">
                    {count.toLocaleString()}
                  </span>
                  +
                </div>
                <div className="text-gray-400 text-sm font-body mt-1">
                  Organisations trust Nexara
                </div>
              </div>

              <div className="px-8">
                <div className="font-display text-3xl font-bold text-white">29</div>
                <div className="text-gray-400 text-sm font-body mt-1">ISO standards covered</div>
              </div>

              <div className="pl-8">
                <div className="font-display text-3xl font-bold text-white">99.97%</div>
                <div className="text-gray-400 text-sm font-body mt-1">Platform uptime SLA</div>
              </div>
            </div>
          </div>

          {/* ── Right column — Login Card ── */}
          <LoginCard />
        </div>
      </div>
    </section>
  );
}
