// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

'use client';

interface CollateralItem {
  title: string;
  description: string;
  type: string;
  typeLabel: string;
  category: string;
}

const COLLATERAL: CollateralItem[] = [
  {
    title: 'Nexara IMS Product Sheet',
    description: 'One-page overview of the full Nexara IMS platform — modules, pricing tiers, and key differentiators.',
    type: 'PDF',
    typeLabel: 'PDF',
    category: 'Overview',
  },
  {
    title: 'Pricing Comparison Guide',
    description: 'Detailed pricing breakdown comparing Nexara against leading incumbents. Ideal for late-stage negotiations.',
    type: 'PDF',
    typeLabel: 'PDF',
    category: 'Pricing',
  },
  {
    title: 'Battle Card — Donesafe',
    description: 'Competitive intelligence card: where Nexara wins vs Donesafe, common objections, and suggested responses.',
    type: 'PDF',
    typeLabel: 'PDF',
    category: 'Competitive',
  },
  {
    title: 'Battle Card — Intelex',
    description: 'Competitive intelligence card: where Nexara wins vs Intelex, common objections, and suggested responses.',
    type: 'PDF',
    typeLabel: 'PDF',
    category: 'Competitive',
  },
  {
    title: 'Battle Card — ETQ Reliance',
    description: 'Competitive intelligence card: where Nexara wins vs ETQ, common objections, and suggested responses.',
    type: 'PDF',
    typeLabel: 'PDF',
    category: 'Competitive',
  },
  {
    title: 'Email Templates',
    description: 'Outreach email sequence for prospect nurturing: initial contact, follow-up, demo invitation, and proposal.',
    type: 'HTML',
    typeLabel: 'HTML',
    category: 'Email',
  },
  {
    title: 'Partner Presentation Deck',
    description: '30-slide PowerPoint presentation for partner-led prospect meetings. Fully co-branded and editable.',
    type: 'PPTX',
    typeLabel: 'PPTX',
    category: 'Presentation',
  },
  {
    title: 'Case Study — Manufacturing (ISO 9001)',
    description: '2-page customer case study: 40% reduction in audit preparation time for a Tier-1 automotive supplier.',
    type: 'PDF',
    typeLabel: 'PDF',
    category: 'Case Study',
  },
  {
    title: 'Case Study — Construction (ISO 45001)',
    description: '2-page customer case study: zero LTIs for 18 months after deploying Nexara H&S module.',
    type: 'PDF',
    typeLabel: 'PDF',
    category: 'Case Study',
  },
  {
    title: 'Case Study — Food Manufacturing (ISO 22000)',
    description: '2-page customer case study: HACCP digitisation and audit readiness achieved in under 6 weeks.',
    type: 'PDF',
    typeLabel: 'PDF',
    category: 'Case Study',
  },
];

const CATEGORY_COLOURS: Record<string, string> = {
  Overview: 'bg-blue-500/20 text-blue-400',
  Pricing: 'bg-emerald-500/20 text-emerald-400',
  Competitive: 'bg-red-500/20 text-red-400',
  Email: 'bg-purple-500/20 text-purple-400',
  Presentation: 'bg-amber-500/20 text-amber-400',
  'Case Study': 'bg-cyan-500/20 text-cyan-400',
};

const TYPE_COLOURS: Record<string, string> = {
  PDF: 'text-red-400',
  HTML: 'text-orange-400',
  PPTX: 'text-amber-400',
};

export default function CollateralPage() {
  const categories = [...new Set(COLLATERAL.map((c) => c.category))];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Co-marketing Collateral</h1>
        <p className="text-gray-400 text-sm mt-1">
          Download approved Nexara partner materials. Contact your channel manager for co-branded versions.
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 mb-6 text-sm text-amber-300">
        <strong>Note:</strong> All assets are available via the Partner Asset Library. Contact your channel manager at{' '}
        <a href="mailto:partners@nexara.com" className="underline hover:text-amber-200 transition-colors">
          partners@nexara.com
        </a>{' '}
        to request co-branded versions or additional materials.
      </div>

      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COLLATERAL.filter((c) => c.category === category).map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-gray-800 bg-gray-900 p-5 flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLOURS[item.category] || 'bg-gray-700 text-gray-300'}`}>
                    {item.category}
                  </span>
                  <span className={`text-xs font-mono font-bold ${TYPE_COLOURS[item.type] || 'text-gray-400'}`}>
                    {item.typeLabel}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-2 leading-snug">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed flex-1 mb-4">{item.description}</p>
                <button
                  onClick={() => window.alert('Asset available in Partner Portal — contact your channel manager')}
                  className="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-colors border border-gray-700 hover:border-gray-600"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
