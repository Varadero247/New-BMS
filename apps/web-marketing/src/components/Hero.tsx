'use client';
import { useEffect, useRef, useState } from 'react';
import { NexaraLogo } from '@ims/ui';

// ─── Counter animation ────────────────────────────────────────────────────────
function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
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

// ─── Floating dashboard mockup ────────────────────────────────────────────────
function DashboardMockup() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        setScore(current);
        if (current >= 94) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
      style={{ animation: 'float 6s ease-in-out infinite' }}
    >
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'var(--deep)',
          border: '1px solid var(--border)',
          borderRadius: 16,
        }}
      >
        {/* Top accent gradient */}
        <div className="h-[2px]" style={{ background: 'var(--g-brand)' }} />

        <div className="p-6">
          {/* Header bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <NexaraLogo size="xs" variant="mark-only" />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--muted)',
                }}
              >
                Compliance Dashboard
              </span>
            </div>
            <span
              className="px-2 py-0.5"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                color: 'var(--teal-core)',
                backgroundColor: 'rgba(0, 196, 168, 0.1)',
                borderRadius: 4,
              }}
            >
              LIVE
            </span>
          </div>

          {/* Compliance score circle */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative" style={{ width: 96, height: 96 }}>
              <svg viewBox="0 0 96 96" width="96" height="96">
                <circle cx="48" cy="48" r="42" fill="none" stroke="var(--border)" strokeWidth="4" />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  fill="none"
                  stroke="var(--teal-core)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 264} 264`}
                  transform="rotate(-90 48 48)"
                  style={{ transition: 'stroke-dasharray 0.3s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '1.5rem',
                    color: 'var(--white)',
                  }}
                >
                  {score}%
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5rem',
                    color: 'var(--muted)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.1em',
                  }}
                >
                  Score
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { label: 'ISO 9001', pct: 98, color: 'var(--m-quality)' },
                { label: 'ISO 14001', pct: 91, color: 'var(--m-env)' },
                { label: 'ISO 45001', pct: 96, color: 'var(--m-safety)' },
                { label: 'ISO 27001', pct: 88, color: 'var(--m-infosec)' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-0.5">
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.58rem',
                        color: 'var(--steel)',
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.58rem',
                        color: 'var(--silver)',
                      }}
                    >
                      {item.pct}%
                    </span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, backgroundColor: 'var(--border)' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${item.pct}%`,
                        borderRadius: 2,
                        backgroundColor: item.color,
                        transition: 'width 1.5s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini KPI row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Open Actions', value: '12', trend: '-3' },
              { label: 'Audits Due', value: '4', trend: '+1' },
              { label: 'NCRs', value: '2', trend: '-5' },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="px-3 py-2"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5rem',
                    color: 'var(--muted)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.1em',
                  }}
                >
                  {kpi.label}
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: 'var(--white)',
                    }}
                  >
                    {kpi.value}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.55rem',
                      color: kpi.trend.startsWith('-') ? 'var(--teal-core)' : 'var(--m-payroll)',
                    }}
                  >
                    {kpi.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
interface HeroProps {
  onOpenLogin: () => void;
}

export default function Hero({ onOpenLogin }: HeroProps) {
  const { ref: counterRef } = useCountUp(4200, 2000);

  const stats = [
    { value: '29', label: 'ISO Standards' },
    { value: '57', label: 'Apps' },
    { value: '59', label: 'Packages' },
    { value: '6', label: 'Verticals' },
  ];

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
            'var(--ink)',
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
                style={{ width: 36, height: 2, background: 'var(--teal-core)', borderRadius: 1 }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--teal-core)',
                }}
              >
                Nexara IMS &middot; v3.0
              </span>
            </div>

            {/* Headline */}
            <h1
              className="mb-6"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
                lineHeight: 0.93,
                letterSpacing: '-0.025em',
                color: 'var(--white)',
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
                fontFamily: 'var(--font-body)',
                fontWeight: 300,
                fontSize: '1.1rem',
                lineHeight: 1.75,
                color: 'var(--silver)',
              }}
            >
              29 ISO standards. One platform. No integrations required. Nexara unifies compliance,
              ESG, and regulatory management into a single AI-powered system.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <button
                type="button"
                onClick={onOpenLogin}
                className="inline-flex items-center text-white font-medium transition-all duration-150"
                style={{
                  background: 'var(--g-brand)',
                  padding: '13px 28px',
                  borderRadius: 8,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Start 21-day free trial &rarr;
              </button>
              <button
                type="button"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 font-medium transition-all duration-150"
                style={{
                  border: '1.5px solid var(--border-hi)',
                  color: 'var(--silver)',
                  padding: '13px 28px',
                  borderRadius: 8,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Sign in to app
              </button>
            </div>

            {/* Stats strip */}
            <div
              ref={counterRef}
              className="flex flex-wrap gap-0 divide-x pt-6"
              style={{
                borderTop: '1px solid var(--border)',
                borderColor: 'var(--border)',
              }}
            >
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={i === 0 ? 'pr-8' : i === stats.length - 1 ? 'pl-8' : 'px-8'}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: '1.6rem',
                      color: 'var(--white)',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.62rem',
                      textTransform: 'uppercase' as const,
                      color: 'var(--muted)',
                      marginTop: 2,
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column — Floating Dashboard Mockup ── */}
          <DashboardMockup />
        </div>
      </div>

      {/* Float animation keyframe */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </section>
  );
}
