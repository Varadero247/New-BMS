'use client';

import { useState } from 'react';
import { Globe, ChevronDown, ChevronRight, Search } from 'lucide-react';

interface TaxBand { name: string;
  from: number;
  to: number | null;
  rate: number; }

interface Jurisdiction { id: string;
  name: string;
  code: string;
  region: string;
  currency: string;
  symbol: string;
  status: 'active' | 'coming-soon';
  taxYear: string;
  personalAllowance: number;
  taxBands: TaxBand[];
  socialSecurity: { employeeRate: number; employerRate: number; ceiling: number | null };
  pension: { mandatoryRate: number; employerMin: number };
  payFrequencies: string[];
  minimumWage: number;
  lastUpdated: string; }

const jurisdictions: Jurisdiction[] = [
  { id: 'uk',
    name: 'United Kingdom',
    code: 'GB',
    region: 'Europe',
    currency: 'GBP',
    symbol: '£',
    status: 'active',
    taxYear: '2025/26',
    personalAllowance: 12570,
    taxBands: [
      { name: 'Basic Rate', from: 12571, to: 50270, rate: 20 },
      { name: 'Higher Rate', from: 50271, to: 125140, rate: 40 },
      { name: 'Additional Rate', from: 125141, to: null, rate: 45 },
    ],
    socialSecurity: { employeeRate: 8, employerRate: 13.8, ceiling: null },
    pension: { mandatoryRate: 5, employerMin: 3 },
    payFrequencies: ['Weekly', 'Fortnightly', 'Monthly'],
    minimumWage: 11.44,
    lastUpdated: '2025-04-06' },
  { id: 'us',
    name: 'United States (Federal)',
    code: 'US',
    region: 'North America',
    currency: 'USD',
    symbol: '$',
    status: 'active',
    taxYear: '2025',
    personalAllowance: 14600,
    taxBands: [
      { name: '10%', from: 0, to: 11600, rate: 10 },
      { name: '12%', from: 11601, to: 47150, rate: 12 },
      { name: '22%', from: 47151, to: 100525, rate: 22 },
      { name: '24%', from: 100526, to: 191950, rate: 24 },
      { name: '32%', from: 191951, to: 243725, rate: 32 },
      { name: '35%', from: 243726, to: 609350, rate: 35 },
      { name: '37%', from: 609351, to: null, rate: 37 },
    ],
    socialSecurity: { employeeRate: 6.2, employerRate: 6.2, ceiling: 168600 },
    pension: { mandatoryRate: 0, employerMin: 0 },
    payFrequencies: ['Weekly', 'Bi-weekly', 'Semi-monthly', 'Monthly'],
    minimumWage: 7.25,
    lastUpdated: '2025-01-01' },
  { id: 'ie',
    name: 'Ireland',
    code: 'IE',
    region: 'Europe',
    currency: 'EUR',
    symbol: '€',
    status: 'active',
    taxYear: '2025',
    personalAllowance: 1875,
    taxBands: [
      { name: 'Standard Rate', from: 0, to: 42000, rate: 20 },
      { name: 'Higher Rate', from: 42001, to: null, rate: 40 },
    ],
    socialSecurity: { employeeRate: 4, employerRate: 11.05, ceiling: null },
    pension: { mandatoryRate: 0, employerMin: 0 },
    payFrequencies: ['Weekly', 'Fortnightly', 'Monthly'],
    minimumWage: 12.7,
    lastUpdated: '2025-01-01' },
  { id: 'de',
    name: 'Germany',
    code: 'DE',
    region: 'Europe',
    currency: 'EUR',
    symbol: '€',
    status: 'active',
    taxYear: '2025',
    personalAllowance: 11604,
    taxBands: [
      { name: 'First Zone', from: 11605, to: 17005, rate: 14 },
      { name: 'Second Zone', from: 17006, to: 66760, rate: 24 },
      { name: 'Third Zone', from: 66761, to: 277825, rate: 42 },
      { name: 'Rich Tax', from: 277826, to: null, rate: 45 },
    ],
    socialSecurity: { employeeRate: 9.3, employerRate: 9.3, ceiling: 90600 },
    pension: { mandatoryRate: 3.05, employerMin: 3.05 },
    payFrequencies: ['Monthly'],
    minimumWage: 12.41,
    lastUpdated: '2025-01-01' },
  { id: 'fr',
    name: 'France',
    code: 'FR',
    region: 'Europe',
    currency: 'EUR',
    symbol: '€',
    status: 'active',
    taxYear: '2025',
    personalAllowance: 11294,
    taxBands: [
      { name: 'Tranche 1', from: 11295, to: 28797, rate: 11 },
      { name: 'Tranche 2', from: 28798, to: 82341, rate: 30 },
      { name: 'Tranche 3', from: 82342, to: 177106, rate: 41 },
      { name: 'Tranche 4', from: 177107, to: null, rate: 45 },
    ],
    socialSecurity: { employeeRate: 11.31, employerRate: 25.3, ceiling: null },
    pension: { mandatoryRate: 6.9, employerMin: 8.55 },
    payFrequencies: ['Monthly'],
    minimumWage: 11.65,
    lastUpdated: '2025-01-01' },
  { id: 'au',
    name: 'Australia',
    code: 'AU',
    region: 'Asia Pacific',
    currency: 'AUD',
    symbol: 'A$',
    status: 'active',
    taxYear: '2025/26',
    personalAllowance: 18200,
    taxBands: [
      { name: 'First Bracket', from: 18201, to: 45000, rate: 16 },
      { name: 'Second Bracket', from: 45001, to: 135000, rate: 30 },
      { name: 'Third Bracket', from: 135001, to: 190000, rate: 37 },
      { name: 'Top Bracket', from: 190001, to: null, rate: 45 },
    ],
    socialSecurity: { employeeRate: 0, employerRate: 11.5, ceiling: null },
    pension: { mandatoryRate: 0, employerMin: 11.5 },
    payFrequencies: ['Weekly', 'Fortnightly', 'Monthly'],
    minimumWage: 23.23,
    lastUpdated: '2025-07-01' },
  { id: 'ca',
    name: 'Canada (Federal)',
    code: 'CA',
    region: 'North America',
    currency: 'CAD',
    symbol: 'C$',
    status: 'coming-soon',
    taxYear: '2025',
    personalAllowance: 15705,
    taxBands: [
      { name: 'First Bracket', from: 15706, to: 55867, rate: 15 },
      { name: 'Second Bracket', from: 55868, to: 111733, rate: 20.5 },
      { name: 'Third Bracket', from: 111734, to: 154906, rate: 26 },
      { name: 'Fourth Bracket', from: 154907, to: 221708, rate: 29 },
      { name: 'Top Bracket', from: 221709, to: null, rate: 33 },
    ],
    socialSecurity: { employeeRate: 5.95, employerRate: 5.95, ceiling: 68500 },
    pension: { mandatoryRate: 0, employerMin: 0 },
    payFrequencies: ['Weekly', 'Bi-weekly', 'Semi-monthly', 'Monthly'],
    minimumWage: 17.2,
    lastUpdated: '2025-01-01' },
  { id: 'sg',
    name: 'Singapore',
    code: 'SG',
    region: 'Asia Pacific',
    currency: 'SGD',
    symbol: 'S$',
    status: 'coming-soon',
    taxYear: '2025',
    personalAllowance: 20000,
    taxBands: [
      { name: 'First Band', from: 20001, to: 30000, rate: 2 },
      { name: 'Second Band', from: 30001, to: 40000, rate: 3.5 },
      { name: 'Third Band', from: 40001, to: 80000, rate: 7 },
      { name: 'Fourth Band', from: 80001, to: 120000, rate: 11.5 },
      { name: 'Fifth Band', from: 120001, to: 160000, rate: 15 },
      { name: 'Sixth Band', from: 160001, to: 200000, rate: 18 },
      { name: 'Seventh Band', from: 200001, to: 240000, rate: 19 },
      { name: 'Eighth Band', from: 240001, to: 280000, rate: 19.5 },
      { name: 'Ninth Band', from: 280001, to: 320000, rate: 20 },
      { name: 'Top Band', from: 320001, to: null, rate: 22 },
    ],
    socialSecurity: { employeeRate: 20, employerRate: 17, ceiling: 102000 },
    pension: { mandatoryRate: 0, employerMin: 0 },
    payFrequencies: ['Monthly'],
    minimumWage: 0,
    lastUpdated: '2025-01-01' },
];

export default function JurisdictionsClient() { const [expanded, setExpanded] = useState<Set<string>>(new Set(['uk']));
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');

  const regions = [...new Set(jurisdictions.map((j) => j.region))];
  const activeCount = jurisdictions.filter((j) => j.status === 'active').length;

  const filtered = jurisdictions.filter((j) => { const matchesSearch =
      !searchTerm ||
      j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = regionFilter === 'all' || j.region === regionFilter;
    return matchesSearch && matchesRegion; });

  const toggleExpand = (id: string) => { setExpanded((prev) => { const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next; }); };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tax Jurisdictions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Supported payroll tax jurisdictions, rates, and thresholds
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Total Jurisdictions
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {jurisdictions.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Active</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Coming Soon
          </p>
          <p className="text-3xl font-bold text-amber-700 mt-1">
            {jurisdictions.length - activeCount}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Regions</p>
          <p className="text-3xl font-bold text-indigo-700 mt-1">{regions.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            aria-label="Search jurisdictions..."
            placeholder="Search jurisdictions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRegionFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${regionFilter === 'all' ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}
          >
            All
          </button>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegionFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${regionFilter === r ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Jurisdiction Cards */}
      <div className="space-y-3">
        {filtered.map((j) => { const isExpanded = expanded.has(j.id);
          return (
            <div
              key={j.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(j.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                  <Globe className="h-5 w-5 text-green-600" />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{j.name}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${j.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                      >
                        {j.status === 'active' ? 'Active' : 'Coming Soon'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {j.region} · {j.currency} ({j.symbol}) · Tax Year {j.taxYear}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Top rate: {j.taxBands[j.taxBands.length - 1].rate}%</span>
                  <span>
                    Allowance: {j.symbol}
                    {j.personalAllowance.toLocaleString()}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Tax Bands */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Income Tax Bands
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Personal Allowance</span>
                          <span>
                            {j.symbol}
                            {j.personalAllowance.toLocaleString()} @ 0%
                          </span>
                        </div>
                        {j.taxBands.map((b, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-gray-700 dark:text-gray-300">{b.name}</span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {j.symbol}
                              {b.from.toLocaleString()} –{' '}
                              {b.to ? `${j.symbol}${b.to.toLocaleString()}` : '∞'} @ {b.rate}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Social Security */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Social Security
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Employee Rate</span>
                          <span className="font-medium">{j.socialSecurity.employeeRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Employer Rate</span>
                          <span className="font-medium">{j.socialSecurity.employerRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Earnings Ceiling</span>
                          <span className="font-medium">
                            {j.socialSecurity.ceiling
                              ? `${j.symbol}${j.socialSecurity.ceiling.toLocaleString()}`
                              : 'None'}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">
                        Pension
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mandatory Employee</span>
                          <span className="font-medium">{j.pension.mandatoryRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Minimum Employer</span>
                          <span className="font-medium">{j.pension.employerMin}%</span>
                        </div>
                      </div>
                    </div>

                    {/* General Info */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        General
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Minimum Wage</span>
                          <span className="font-medium">
                            {j.minimumWage > 0 ? `${j.symbol}${j.minimumWage}/hr` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pay Frequencies</span>
                          <span className="font-medium">{j.payFrequencies.join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated</span>
                          <span className="font-medium">{j.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ); })}
      </div>
    </div>
  ); }
