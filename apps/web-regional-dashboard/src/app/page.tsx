// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { fetchAllCountries, fetchTaxReport } from '@/lib/api';

const tierLabel = (t: number) => t === 1 ? 'Tier 1' : 'Tier 2';
const tierColor = (t: number) => t === 1 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700';

const REGIONS = ['ASEAN', 'ANZ', 'East Asia', 'South Asia'];

export default async function OverviewPage() {
  const [countries, taxReport] = await Promise.all([
    fetchAllCountries(),
    fetchTaxReport(),
  ]);

  const byRegion = REGIONS.map((r) => ({
    region: r,
    countries: countries.filter((c) => c.region === r),
  })).filter((g) => g.countries.length > 0);

  const { summary } = taxReport;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">APAC Regional Overview</h1>
        <p className="text-gray-500 mt-1">Tax, compliance and regulatory intelligence across {countries.length} markets</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Markets covered', value: countries.length, sub: '20 APAC countries' },
          { label: 'Lowest corp tax', value: `${(summary.lowestCorpTax.corporateTaxRate * 100).toFixed(1)}%`, sub: summary.lowestCorpTax.countryName },
          { label: 'Lowest GST/VAT', value: `${(summary.lowestGst.gstVatRate * 100).toFixed(1)}%`, sub: summary.lowestGst.countryName },
          { label: 'Easiest to set up', value: summary.easiestToBusiness?.countryName ?? '—', sub: summary.easiestToBusiness ? `Rank #${summary.easiestToBusiness.easeOfDoingBusinessRank}` : '' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{c.label}</div>
            <div className="text-2xl font-bold text-indigo-700">{c.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Countries by region */}
      <div className="space-y-6">
        {byRegion.map(({ region, countries: group }) => (
          <div key={region} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">{region}</h2>
              <span className="text-xs text-gray-500">{group.length} markets</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="px-4 py-2 font-medium">Country</th>
                    <th className="px-4 py-2 font-medium">Tier</th>
                    <th className="px-4 py-2 font-medium">Currency</th>
                    <th className="px-4 py-2 font-medium text-right">Corp Tax</th>
                    <th className="px-4 py-2 font-medium text-right">GST/VAT</th>
                    <th className="px-4 py-2 font-medium text-right">Laws</th>
                    <th className="px-4 py-2 font-medium text-right">ISO Stds</th>
                  </tr>
                </thead>
                <tbody>
                  {group.map((c) => (
                    <tr key={c.countryCode} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 font-medium">{c.countryName}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierColor(c.tier)}`}>{tierLabel(c.tier)}</span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">{c.currency.code}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{(c.corporateTaxRate * 100).toFixed(1)}%</td>
                      <td className="px-4 py-2.5 text-right font-mono">{(c.gstVatRate * 100).toFixed(1)}% <span className="text-gray-400 text-xs">{c.gstVatName}</span></td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{c.legislationCount}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{c.isoStandardsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
