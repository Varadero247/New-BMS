// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import Link from 'next/link';

const KEY_BENEFITS = [
  {
    heading: 'G-Cloud procurement',
    body: 'Nexara IMS is pursuing a G-Cloud listing on the Crown Commercial Service (CCS) Digital Marketplace. Register your interest to be notified when framework procurement is available.',
  },
  {
    heading: 'GDPR + UK Gov frameworks',
    body: 'All data stored in UK-based data centres. Built for OFFICIAL-SENSITIVE workloads. Compliant with UK GDPR, the Data Protection Act 2018, and HM Treasury risk management guidelines.',
  },
  {
    heading: 'Accessibility — WCAG 2.1 AA',
    body: 'Nexara IMS is designed to meet WCAG 2.1 Level AA accessibility standards, ensuring inclusive access across NHS, local authority, and central government user bases.',
  },
  {
    heading: 'Crown Commercial Service alignment',
    body: 'We are actively working towards CCS framework alignment. Procurement officers can engage directly to discuss direct award, mini competition, and call-off contract options.',
  },
];

export default function PublicSectorPage() {
  return (
    <main className="min-h-screen bg-[#0B1120] text-gray-100">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight text-white">
            Nexara
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              Pricing
            </Link>
            <Link href="/lp/free-trial" className="text-sm text-[#60A5FA] hover:text-white transition-colors">
              Start free trial
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-[#1B3A6B] hover:bg-[#244d8a] text-white px-4 py-2 rounded-lg transition"
            >
              Book a demo
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Coming Soon
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Nexara IMS for Public Sector
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Custom frameworks for local authorities, NHS trusts, and government bodies.
            All ISO standards. UK data residency. WCAG 2.1 AA accessibility. G-Cloud ready.
          </p>
          <a
            href="mailto:public-sector@nexara.io"
            className="inline-block px-8 py-3.5 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-semibold transition"
          >
            Register interest &rarr;
          </a>
          <p className="mt-3 text-sm text-gray-500">
            Email us at{' '}
            <a
              href="mailto:public-sector@nexara.io"
              className="text-[#60A5FA] hover:text-white transition-colors"
            >
              public-sector@nexara.io
            </a>
          </p>
        </div>

        {/* Key benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          {KEY_BENEFITS.map((b) => (
            <div key={b.heading} className="rounded-xl bg-white/5 border border-white/10 p-6">
              <h3 className="text-white font-semibold mb-2">{b.heading}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>

        {/* Standards callout */}
        <div className="rounded-2xl bg-gradient-to-r from-[#1B3A6B]/30 to-transparent border border-[#1B3A6B]/30 p-8 mb-16">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Standards coverage</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              'ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 27001', 'ISO 42001',
              'ISO 37001', 'ISO 50001', 'ISO 22301', 'ISO 55001', 'ISO 13485',
              'NHS IG Toolkit', 'UK GDPR', 'HMT Risk Framework', 'WCAG 2.1 AA',
            ].map((s) => (
              <span
                key={s}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* CTA strip */}
        <div className="rounded-2xl bg-gradient-to-r from-[#1B3A6B]/60 to-[#0B1120] border border-[#1B3A6B]/40 p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Be first to know when we launch
          </h2>
          <p className="text-gray-400 mb-6">
            Register your interest and our public sector team will be in touch with a tailored quote,
            G-Cloud procurement timeline, and a private preview of the public sector edition.
          </p>
          <a
            href="mailto:public-sector@nexara.io"
            className="inline-block px-8 py-3.5 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-semibold transition"
          >
            Register interest &rarr;
          </a>
        </div>
      </div>

      <footer className="border-t border-white/10 mt-16 py-8 text-center text-xs text-gray-600">
        &copy; 2026 Nexara DMCC. All rights reserved. &nbsp;&middot;&nbsp;
        <Link href="/privacy" className="hover:text-gray-400">Privacy</Link> &nbsp;&middot;&nbsp;
        <Link href="/terms" className="hover:text-gray-400">Terms</Link>
      </footer>
    </main>
  );
}
