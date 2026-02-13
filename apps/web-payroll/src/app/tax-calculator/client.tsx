'use client';

import { useState } from 'react';
import { Calculator, ArrowRight, DollarSign, TrendingDown, Building2, Globe } from 'lucide-react';

interface TaxBand {
  name: string;
  from: number;
  to: number | null;
  rate: number;
  color: string;
}

interface JurisdictionConfig {
  id: string;
  name: string;
  currency: string;
  symbol: string;
  taxBands: TaxBand[];
  personalAllowance: number;
  niRate: number;
  niThreshold: number;
  pensionRate: number;
  studentLoanRate: number;
  studentLoanThreshold: number;
}

const jurisdictions: JurisdictionConfig[] = [
  {
    id: 'uk',
    name: 'United Kingdom',
    currency: 'GBP',
    symbol: '£',
    taxBands: [
      { name: 'Personal Allowance', from: 0, to: 12570, rate: 0, color: 'bg-green-400' },
      { name: 'Basic Rate', from: 12571, to: 50270, rate: 20, color: 'bg-blue-400' },
      { name: 'Higher Rate', from: 50271, to: 125140, rate: 40, color: 'bg-amber-400' },
      { name: 'Additional Rate', from: 125141, to: null, rate: 45, color: 'bg-red-400' },
    ],
    personalAllowance: 12570,
    niRate: 8,
    niThreshold: 12570,
    pensionRate: 5,
    studentLoanRate: 9,
    studentLoanThreshold: 27295,
  },
  {
    id: 'us-federal',
    name: 'United States (Federal)',
    currency: 'USD',
    symbol: '$',
    taxBands: [
      { name: '10% Bracket', from: 0, to: 11600, rate: 10, color: 'bg-green-400' },
      { name: '12% Bracket', from: 11601, to: 47150, rate: 12, color: 'bg-blue-400' },
      { name: '22% Bracket', from: 47151, to: 100525, rate: 22, color: 'bg-cyan-400' },
      { name: '24% Bracket', from: 100526, to: 191950, rate: 24, color: 'bg-amber-400' },
      { name: '32% Bracket', from: 191951, to: 243725, rate: 32, color: 'bg-orange-400' },
      { name: '35% Bracket', from: 243726, to: 609350, rate: 35, color: 'bg-red-400' },
      { name: '37% Bracket', from: 609351, to: null, rate: 37, color: 'bg-red-600' },
    ],
    personalAllowance: 14600,
    niRate: 6.2,
    niThreshold: 0,
    pensionRate: 6,
    studentLoanRate: 0,
    studentLoanThreshold: 0,
  },
  {
    id: 'ie',
    name: 'Ireland',
    currency: 'EUR',
    symbol: '€',
    taxBands: [
      { name: 'Standard Rate', from: 0, to: 42000, rate: 20, color: 'bg-green-400' },
      { name: 'Higher Rate', from: 42001, to: null, rate: 40, color: 'bg-red-400' },
    ],
    personalAllowance: 1875,
    niRate: 4,
    niThreshold: 18304,
    pensionRate: 5,
    studentLoanRate: 0,
    studentLoanThreshold: 0,
  },
  {
    id: 'de',
    name: 'Germany',
    currency: 'EUR',
    symbol: '€',
    taxBands: [
      { name: 'Tax-Free', from: 0, to: 11604, rate: 0, color: 'bg-green-400' },
      { name: 'First Zone', from: 11605, to: 17005, rate: 14, color: 'bg-blue-400' },
      { name: 'Second Zone', from: 17006, to: 66760, rate: 24, color: 'bg-amber-400' },
      { name: 'Third Zone', from: 66761, to: 277825, rate: 42, color: 'bg-orange-400' },
      { name: 'Rich Tax', from: 277826, to: null, rate: 45, color: 'bg-red-400' },
    ],
    personalAllowance: 11604,
    niRate: 9.3,
    niThreshold: 0,
    pensionRate: 3.05,
    studentLoanRate: 0,
    studentLoanThreshold: 0,
  },
];

function calculateTax(salary: number, jurisdiction: JurisdictionConfig) {
  let totalTax = 0;
  const bandBreakdown: { band: TaxBand; taxable: number; tax: number }[] = [];

  for (const band of jurisdiction.taxBands) {
    const bandMax = band.to ?? Infinity;
    if (salary > band.from) {
      const taxable = Math.min(salary, bandMax) - band.from;
      const tax = (taxable * band.rate) / 100;
      totalTax += tax;
      bandBreakdown.push({ band, taxable, tax });
    }
  }

  const niContribution = salary > jurisdiction.niThreshold
    ? ((salary - jurisdiction.niThreshold) * jurisdiction.niRate) / 100
    : 0;
  const pension = (salary * jurisdiction.pensionRate) / 100;
  const studentLoan = salary > jurisdiction.studentLoanThreshold && jurisdiction.studentLoanRate > 0
    ? ((salary - jurisdiction.studentLoanThreshold) * jurisdiction.studentLoanRate) / 100
    : 0;

  const totalDeductions = totalTax + niContribution + pension + studentLoan;
  const netPay = salary - totalDeductions;
  const effectiveRate = salary > 0 ? (totalTax / salary) * 100 : 0;

  return { totalTax, bandBreakdown, niContribution, pension, studentLoan, totalDeductions, netPay, effectiveRate };
}

function formatMoney(amount: number, symbol: string) {
  return `${symbol}${amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function TaxCalculatorClient() {
  const [salary, setSalary] = useState(55000);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('uk');
  const [compareJurisdiction, setCompareJurisdiction] = useState<string | null>(null);
  const [includeStudentLoan, setIncludeStudentLoan] = useState(false);
  const [period, setPeriod] = useState<'annual' | 'monthly'>('annual');

  const jurisdiction = jurisdictions.find((j) => j.id === selectedJurisdiction)!;
  const result = calculateTax(salary, jurisdiction);
  const divisor = period === 'monthly' ? 12 : 1;

  const compareResult = compareJurisdiction
    ? calculateTax(salary, jurisdictions.find((j) => j.id === compareJurisdiction)!)
    : null;
  const compareJ = compareJurisdiction ? jurisdictions.find((j) => j.id === compareJurisdiction)! : null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tax Calculator</h1>
        <p className="text-sm text-gray-500 mt-1">Multi-jurisdiction payroll tax estimation tool</p>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Annual Gross Salary</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
            <select
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {jurisdictions.map((j) => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compare With</label>
            <select
              value={compareJurisdiction || ''}
              onChange={(e) => setCompareJurisdiction(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">None</option>
              {jurisdictions.filter((j) => j.id !== selectedJurisdiction).map((j) => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Period</label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setPeriod('annual')}
                className={`flex-1 py-2 text-sm font-medium ${period === 'annual' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}
              >Annual</button>
              <button
                onClick={() => setPeriod('monthly')}
                className={`flex-1 py-2 text-sm font-medium ${period === 'monthly' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}
              >Monthly</button>
            </div>
          </div>
        </div>
        {jurisdiction.studentLoanRate > 0 && (
          <div className="mt-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={includeStudentLoan}
                onChange={(e) => setIncludeStudentLoan(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              Include student loan repayment (Plan 2: {jurisdiction.studentLoanRate}% above {jurisdiction.symbol}{jurisdiction.studentLoanThreshold.toLocaleString()})
            </label>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className={`grid ${compareResult ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
        {/* Primary Jurisdiction */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 font-semibold text-gray-800">
            <Globe className="h-5 w-5 text-green-600" />
            {jurisdiction.name}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase font-medium">Gross Pay</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatMoney(salary / divisor, jurisdiction.symbol)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase font-medium">Income Tax</p>
              <p className="text-xl font-bold text-red-700 mt-1">{formatMoney(result.totalTax / divisor, jurisdiction.symbol)}</p>
              <p className="text-xs text-gray-400">{result.effectiveRate.toFixed(1)}% effective</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase font-medium">Deductions</p>
              <p className="text-xl font-bold text-amber-700 mt-1">{formatMoney(result.totalDeductions / divisor, jurisdiction.symbol)}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs text-green-600 uppercase font-medium">Net Pay</p>
              <p className="text-xl font-bold text-green-700 mt-1">{formatMoney(result.netPay / divisor, jurisdiction.symbol)}</p>
              <p className="text-xs text-green-500">{((result.netPay / salary) * 100).toFixed(1)}% take-home</p>
            </div>
          </div>

          {/* Tax Band Visualization */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Tax Band Breakdown</h4>
            <div className="w-full h-8 flex rounded-lg overflow-hidden mb-3">
              {result.bandBreakdown.map((b, i) => {
                const width = (b.taxable / salary) * 100;
                return (
                  <div
                    key={i}
                    className={`${b.band.color} relative group`}
                    style={{ width: `${width}%` }}
                    title={`${b.band.name}: ${formatMoney(b.taxable, jurisdiction.symbol)} @ ${b.band.rate}%`}
                  >
                    {width > 8 && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                        {b.band.rate}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="space-y-2">
              {result.bandBreakdown.map((b, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${b.band.color}`} />
                    <span className="text-gray-700">{b.band.name} ({b.band.rate}%)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">{formatMoney(b.taxable / divisor, jurisdiction.symbol)}</span>
                    <ArrowRight className="h-3 w-3 text-gray-300" />
                    <span className="font-medium text-gray-800">{formatMoney(b.tax / divisor, jurisdiction.symbol)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Other Deductions */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Other Deductions</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">National Insurance / Social Security ({jurisdiction.niRate}%)</span>
                <span className="font-medium">{formatMoney(result.niContribution / divisor, jurisdiction.symbol)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pension Contribution ({jurisdiction.pensionRate}%)</span>
                <span className="font-medium">{formatMoney(result.pension / divisor, jurisdiction.symbol)}</span>
              </div>
              {includeStudentLoan && jurisdiction.studentLoanRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Student Loan ({jurisdiction.studentLoanRate}%)</span>
                  <span className="font-medium">{formatMoney(result.studentLoan / divisor, jurisdiction.symbol)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-2">
                <span className="text-gray-800">Total Deductions</span>
                <span className="text-red-700">{formatMoney(result.totalDeductions / divisor, jurisdiction.symbol)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compare Jurisdiction */}
        {compareResult && compareJ && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold text-gray-800">
              <Globe className="h-5 w-5 text-blue-600" />
              {compareJ.name}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Gross Pay</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{formatMoney(salary / divisor, compareJ.symbol)}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Income Tax</p>
                <p className="text-xl font-bold text-red-700 mt-1">{formatMoney(compareResult.totalTax / divisor, compareJ.symbol)}</p>
                <p className="text-xs text-gray-400">{compareResult.effectiveRate.toFixed(1)}% effective</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-medium">Deductions</p>
                <p className="text-xl font-bold text-amber-700 mt-1">{formatMoney(compareResult.totalDeductions / divisor, compareJ.symbol)}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs text-blue-600 uppercase font-medium">Net Pay</p>
                <p className="text-xl font-bold text-blue-700 mt-1">{formatMoney(compareResult.netPay / divisor, compareJ.symbol)}</p>
                <p className="text-xs text-blue-500">{((compareResult.netPay / salary) * 100).toFixed(1)}% take-home</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Tax Band Breakdown</h4>
              <div className="w-full h-8 flex rounded-lg overflow-hidden mb-3">
                {compareResult.bandBreakdown.map((b, i) => {
                  const width = (b.taxable / salary) * 100;
                  return (
                    <div key={i} className={`${b.band.color} relative`} style={{ width: `${width}%` }}>
                      {width > 8 && (
                        <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">{b.band.rate}%</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2">
                {compareResult.bandBreakdown.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${b.band.color}`} />
                      <span className="text-gray-700">{b.band.name} ({b.band.rate}%)</span>
                    </div>
                    <span className="font-medium text-gray-800">{formatMoney(b.tax / divisor, compareJ.symbol)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Delta */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Comparison Summary
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-indigo-700">Tax Difference</span>
                  <span className={`font-medium ${result.totalTax > compareResult.totalTax ? 'text-green-700' : 'text-red-700'}`}>
                    {result.totalTax > compareResult.totalTax ? '-' : '+'}{formatMoney(Math.abs(result.totalTax - compareResult.totalTax) / divisor, jurisdiction.symbol)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-700">Net Pay Difference</span>
                  <span className={`font-medium ${result.netPay < compareResult.netPay ? 'text-green-700' : 'text-red-700'}`}>
                    {compareResult.netPay > result.netPay ? '+' : ''}{formatMoney((compareResult.netPay - result.netPay) / divisor, jurisdiction.symbol)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Salary Presets */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Salary Presets</h4>
        <div className="flex flex-wrap gap-2">
          {[25000, 35000, 50000, 75000, 100000, 150000, 200000].map((s) => (
            <button
              key={s}
              onClick={() => setSalary(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                salary === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {jurisdiction.symbol}{(s / 1000).toFixed(0)}k
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
