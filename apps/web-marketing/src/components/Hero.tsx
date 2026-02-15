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

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/health`, { signal: AbortSignal.timeout(5000) })
      .then((res) => {
        if (res.ok) setSystemStatus('operational');
        else setSystemStatus('degraded');
      })
      .catch(() => setSystemStatus('operational'));
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
      <div
        className="relative rounded-2xl p-8 shadow-2xl overflow-hidden"
        style={{
          background: 'var(--deep, #0C1220)',
          border: '1px solid var(--border, #1E2E48)',
          borderRadius: 16,
        }}
      >
        {/* Top accent gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'var(--g-brand)' }}
        />

        {/* Header */}
        <div className="mb-6">
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: '1.4rem',
              color: 'var(--white, #EDF3FC)',
              marginBottom: 4,
            }}
          >
            Welcome back
          </h2>
          <p style={{ color: 'var(--steel, #5A7099)', fontSize: '0.85rem' }}>
            Sign in to your Nexara account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-sm"
            style={{
              background: 'rgba(240,75,90,0.1)',
              border: '1px solid rgba(240,75,90,0.3)',
              color: '#F04B5A',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 mb-4">
            <div>
              <label
                htmlFor="hero-email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--silver, #8EA8CC)' }}
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
                className="w-full px-4 py-2.5 text-sm transition-colors"
                style={{
                  background: 'var(--surface, #162032)',
                  border: '1px solid var(--border, #1E2E48)',
                  borderRadius: 8,
                  color: 'var(--white, #EDF3FC)',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--blue-mid, #3B78F5)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,120,245,0.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border, #1E2E48)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="hero-password"
                  className="block text-sm font-medium"
                  style={{ color: 'var(--silver, #8EA8CC)' }}
                >
                  Password
                </label>
                <a
                  href="/auth/forgot-password"
                  className="text-sm transition-colors"
                  style={{ color: 'var(--teal-core, #00C4A8)' }}
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
                className="w-full px-4 py-2.5 text-sm transition-colors"
                style={{
                  background: 'var(--surface, #162032)',
                  border: '1px solid var(--border, #1E2E48)',
                  borderRadius: 8,
                  color: 'var(--white, #EDF3FC)',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--blue-mid, #3B78F5)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,120,245,0.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border, #1E2E48)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 text-white font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: 'var(--g-brand)',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              borderRadius: 8,
            }}
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
          <div className="flex-1 h-px" style={{ background: 'var(--border, #1E2E48)' }} />
          <span
            style={{
              color: 'var(--muted, #344D72)',
              fontSize: '0.75rem',
              fontFamily: "'DM Mono', monospace",
            }}
          >
            or continue with
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--border, #1E2E48)' }} />
        </div>

        {/* SSO buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm transition-colors"
            style={{
              border: '1px solid var(--border, #1E2E48)',
              background: 'var(--surface, #162032)',
              borderRadius: 8,
              color: 'var(--silver, #8EA8CC)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm transition-colors"
            style={{
              border: '1px solid var(--border, #1E2E48)',
              background: 'var(--surface, #162032)',
              borderRadius: 8,
              color: 'var(--silver, #8EA8CC)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </button>
        </div>

        {/* Register link */}
        <p className="mt-5 text-center text-sm" style={{ color: 'var(--muted, #344D72)' }}>
          New to Nexara?{' '}
          <a
            href="/auth/register"
            className="transition-colors font-medium"
            style={{ color: 'var(--teal-core, #00C4A8)' }}
          >
            Create a free account
          </a>
        </p>
      </div>

      {/* Floating status badge */}
      <div
        className="absolute -bottom-4 right-4 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg z-10"
        style={{
          background: 'var(--surface, #162032)',
          border: '1px solid var(--border, #1E2E48)',
          color: 'var(--silver, #8EA8CC)',
        }}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            backgroundColor:
              systemStatus === 'operational'
                ? 'var(--teal-core, #00C4A8)'
                : systemStatus === 'degraded'
                  ? '#F04B5A'
                  : 'var(--m-payroll, #F59E0B)',
          }}
          aria-hidden="true"
        />
        <span style={{ fontFamily: "'DM Mono', monospace" }}>
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
      {/* Background gradient — 3-layer brand spec */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background: [
            'radial-gradient(ellipse 70% 70% at 65% 35%, rgba(38,96,216,0.14), transparent 65%)',
            'radial-gradient(ellipse 45% 55% at 15% 75%, rgba(0,196,168,0.09), transparent 55%)',
            'radial-gradient(ellipse 30% 40% at 85% 80%, rgba(59,120,245,0.06), transparent 50%)',
            'var(--ink, #080B12)',
          ].join(', '),
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(38,96,216,0.055) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(38,96,216,0.055) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 90% 80% at 65% 40%, black, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 65% 40%, black, transparent 72%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* ── Left column ── */}
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className="block"
                style={{ width: 36, height: 2, background: 'var(--teal-core, #00C4A8)', borderRadius: 1 }}
              />
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.68rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--teal-core, #00C4A8)',
                }}
              >
                Nexara IMS &middot; v2.0
              </span>
            </div>

            {/* Headline */}
            <h1
              className="mb-6"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
                lineHeight: 0.93,
                letterSpacing: '-0.025em',
                color: 'var(--white, #EDF3FC)',
              }}
            >
              Every standard.{' '}
              <span className="whitespace-nowrap">
                One <span className="grad-text">intelligent</span>
              </span>{' '}
              platform.
            </h1>

            {/* Subtext */}
            <p
              className="max-w-lg mb-8"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 300,
                fontSize: '1.1rem',
                lineHeight: 1.75,
                color: 'var(--silver, #8EA8CC)',
              }}
            >
              Nexara unifies 29 ISO standards, ESG reporting and regulatory compliance into a
              single AI-powered management system — so your team can focus on outcomes, not
              spreadsheets.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <a
                href="/auth/register"
                className="inline-flex items-center text-white font-medium transition-all duration-150"
                style={{
                  background: 'var(--g-brand)',
                  padding: '13px 28px',
                  borderRadius: 8,
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.88rem',
                }}
              >
                Start free trial &rarr;
              </a>
              <a
                href="/demo/video"
                className="inline-flex items-center gap-2 font-medium transition-all duration-150"
                style={{
                  border: '1.5px solid var(--border-hi, #263852)',
                  color: 'var(--silver, #8EA8CC)',
                  padding: '13px 28px',
                  borderRadius: 8,
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.88rem',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Watch 3-min demo
              </a>
            </div>

            {/* Stats strip */}
            <div
              className="flex flex-wrap gap-0 divide-x pt-6"
              style={{
                borderTop: '1px solid var(--border, #1E2E48)',
                borderColor: 'var(--border, #1E2E48)',
              }}
            >
              <div className="pr-8">
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    color: 'var(--white, #EDF3FC)',
                  }}
                >
                  29
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.62rem',
                    textTransform: 'uppercase',
                    color: 'var(--muted, #344D72)',
                    marginTop: 2,
                  }}
                >
                  ISO Standards
                </div>
              </div>

              <div className="px-8">
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    color: 'var(--white, #EDF3FC)',
                  }}
                >
                  51
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.62rem',
                    textTransform: 'uppercase',
                    color: 'var(--muted, #344D72)',
                    marginTop: 2,
                  }}
                >
                  Services
                </div>
              </div>

              <div className="px-8">
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    color: 'var(--white, #EDF3FC)',
                  }}
                >
                  99.97%
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.62rem',
                    textTransform: 'uppercase',
                    color: 'var(--muted, #344D72)',
                    marginTop: 2,
                  }}
                >
                  Uptime
                </div>
              </div>

              <div className="pl-8">
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    color: 'var(--white, #EDF3FC)',
                  }}
                >
                  AI-Native
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.62rem',
                    textTransform: 'uppercase',
                    color: 'var(--muted, #344D72)',
                    marginTop: 2,
                  }}
                >
                  Intelligence
                </div>
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
