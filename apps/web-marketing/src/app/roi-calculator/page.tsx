'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const JOB_TITLES = [
  'Quality Manager',
  'EHS Manager',
  'Compliance Officer',
  'Operations Director',
  'IT Manager',
  'Managing Director / CEO',
  'Consultant',
  'Other',
];

const EMPLOYEE_RANGES = ['1-50', '51-250', '251-1000', '1000+'];

const ISO_COUNTS = ['1', '2', '3', '4', '5+'];

const INDUSTRIES = [
  'Manufacturing',
  'Construction',
  'Healthcare',
  'Technology',
  'Financial Services',
  'Food & Beverage',
  'Aerospace & Defence',
  'Automotive',
  'Energy & Utilities',
  'Professional Services',
  'Government & Public Sector',
  'Other',
];

interface ROIResult {
  recommendedTier: string;
  monthlyCost: number;
  annualCost: number;
  softwareSaving: number;
  timeSavingAnnual: number;
  totalROI: number;
}

export default function ROICalculatorPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ROIResult | null>(null);

  const [form, setForm] = useState({
    companyName: '',
    name: '',
    email: '',
    jobTitle: '',
    employeeCount: '',
    isoCount: '',
    currentSpend: '',
    industry: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        currentSpend: form.currentSpend ? Number(form.currentSpend) : undefined,
      };
      const res = await fetch(`${API_URL}/api/marketing/roi/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to calculate ROI');

      const data = await res.json();
      setResult(data.data || data);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? (err as Error).message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(n: number) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(n);
  }

  return (
    <main className="min-h-screen bg-[#0B1120] text-gray-100">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight text-white font-display">
            Nexara
          </Link>
          <Link
            href="/signup"
            className="text-sm text-[#60A5FA] hover:text-white transition-colors"
          >
            Start free trial
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {step === 1 && (
          <>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-3">
              ROI Calculator
            </h1>
            <p className="text-gray-400 dark:text-gray-500 mb-10 text-lg">
              See how much time and money Nexara can save your organisation.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Name */}
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-300 mb-1.5"
                >
                  Company name *
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  required
                  value={form.companyName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] outline-none transition"
                  placeholder="Acme Ltd"
                />
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Your name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] outline-none transition"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Work email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] outline-none transition"
                    placeholder="jane@acme.com"
                  />
                </div>
              </div>

              {/* Job Title & Industry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="jobTitle"
                    className="block text-sm font-medium text-gray-300 mb-1.5"
                  >
                    Job title *
                  </label>
                  <select
                    id="jobTitle"
                    name="jobTitle"
                    required
                    value={form.jobTitle}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] outline-none transition"
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    {JOB_TITLES.map((t) => (
                      <option key={t} value={t} className="bg-[#0B1120]">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="industry"
                    className="block text-sm font-medium text-gray-300 mb-1.5"
                  >
                    Industry *
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    required
                    value={form.industry}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] outline-none transition"
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i} className="bg-[#0B1120]">
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Employee Count & ISO Count */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="employeeCount"
                    className="block text-sm font-medium text-gray-300 mb-1.5"
                  >
                    Number of employees *
                  </label>
                  <select
                    id="employeeCount"
                    name="employeeCount"
                    required
                    value={form.employeeCount}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] outline-none transition"
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    {EMPLOYEE_RANGES.map((r) => (
                      <option key={r} value={r} className="bg-[#0B1120]">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="isoCount"
                    className="block text-sm font-medium text-gray-300 mb-1.5"
                  >
                    ISO standards managed *
                  </label>
                  <select
                    id="isoCount"
                    name="isoCount"
                    required
                    value={form.isoCount}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] outline-none transition"
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    {ISO_COUNTS.map((c) => (
                      <option key={c} value={c} className="bg-[#0B1120]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Current Spend */}
              <div>
                <label
                  htmlFor="currentSpend"
                  className="block text-sm font-medium text-gray-300 mb-1.5"
                >
                  Current annual spend on compliance tools (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    £
                  </span>
                  <input
                    id="currentSpend"
                    name="currentSpend"
                    type="number"
                    min="0"
                    value={form.currentSpend}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] outline-none transition"
                    placeholder="e.g. 15000"
                  />
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-semibold text-base transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Calculating...' : 'Calculate my ROI'}
              </button>
            </form>
          </>
        )}

        {step === 2 && result && (
          <div className="text-center">
            <p className="text-sm font-medium text-[#60A5FA] uppercase tracking-wider mb-2">
              Your personalised ROI
            </p>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-2">
              {form.companyName}
            </h1>
            <p className="text-gray-400 dark:text-gray-500 mb-12">
              Recommended tier:{' '}
              <span className="text-white font-semibold">{result.recommendedTier}</span>
            </p>

            {/* Large ROI figure */}
            <div className="mb-12">
              <p className="text-6xl md:text-7xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#34D399] animate-pulse">
                {formatCurrency(result.totalROI)}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-lg mt-2">
                total savings per year
              </p>
            </div>

            {/* Breakdown cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 text-left">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">Monthly cost</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(result.monthlyCost)}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">Annual cost</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(result.annualCost)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">
                  Software consolidation saving
                </p>
                <p className="text-2xl font-bold text-[#34D399]">
                  {formatCurrency(result.softwareSaving)}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">
                  Time saving (annual)
                </p>
                <p className="text-2xl font-bold text-[#34D399]">
                  {formatCurrency(result.timeSavingAnnual)}
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/signup?source=roi-calculator&tier=${encodeURIComponent(result.recommendedTier)}`}
              className="inline-block w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-semibold text-base transition"
            >
              Start your free 21-day trial
            </Link>

            <button
              onClick={() => {
                setStep(1);
                setResult(null);
              }}
              className="block mx-auto mt-4 text-sm text-gray-400 dark:text-gray-500 hover:text-white transition"
            >
              Recalculate
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
