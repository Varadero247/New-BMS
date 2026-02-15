'use client';

import Link from 'next/link';

const trustItems = [
  'SOC 2',
  'GDPR',
  '99.97% SLA',
  'EU & UK data residency',
];

export default function CTASection() {
  return (
    <section className="py-24 max-w-4xl mx-auto px-6">
      <div className="bg-surface-dark-alt rounded-3xl p-12 md:p-16 text-center relative overflow-hidden border border-white/10">
        {/* Radial gradient overlays */}
        <div
          className="absolute w-96 h-96 -left-48 -top-48 bg-teal/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute w-96 h-96 -right-48 -bottom-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(6, 95, 70, 0.12)' }}
          aria-hidden="true"
        />

        {/* Content — relative so it sits above the gradients */}
        <div className="relative">
          {/* Eyebrow */}
          <p className="font-mono text-warning-500 text-sm uppercase tracking-wider">
            Ready to simplify compliance?
          </p>

          {/* Headline */}
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 leading-tight">
            Your compliance stack,{' '}
            <em className="text-teal not-italic">finally</em> simplified
          </h2>

          {/* Subtitle */}
          <p className="text-gray-400 dark:text-gray-500 mt-4 max-w-lg mx-auto font-body leading-relaxed">
            Join hundreds of compliance teams who replaced fragmented spreadsheets and siloed tools
            with a single, intelligent platform.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/auth/signup"
              className="bg-teal hover:bg-teal-bright text-white px-8 py-3 rounded-lg font-medium font-body transition-colors duration-150 inline-flex items-center justify-center"
            >
              Start your free trial →
            </Link>
            <Link
              href="/demo"
              className="border border-white/20 text-white/70 hover:text-white px-8 py-3 rounded-lg font-body transition-colors duration-150 inline-flex items-center justify-center"
            >
              Book a demo
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-white/35 text-sm font-mono">
            {trustItems.map((item, i) => (
              <span key={item} className="flex items-center gap-2">
                {i > 0 && <span className="text-white/15 hidden sm:inline">·</span>}
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
