'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function SignupForm() {
  const searchParams = useSearchParams();
  const source = searchParams.get('source') || '';
  const tier = searchParams.get('tier') || '';

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/marketing/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source, tier }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Signup failed. Please try again.');
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[#34D399]/20 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-[#34D399]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 font-display">You are in!</h2>
        <p className="text-gray-400 dark:text-gray-500 mb-6">
          Check your inbox for a confirmation email. Your 21-day free trial starts now.
        </p>
        <Link href="/" className="text-[#60A5FA] hover:text-white transition-colors text-sm">
          Back to homepage
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
          Full name *
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

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1.5">
          Company name *
        </label>
        <input
          id="company"
          name="company"
          required
          value={form.company}
          onChange={handleChange}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] outline-none transition"
          placeholder="Acme Ltd"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
          Password *
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={handleChange}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] outline-none transition"
          placeholder="Min 8 characters"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-semibold text-base transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account...' : 'Start free trial'}
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        By signing up you agree to our{' '}
        <Link
          href="/terms"
          className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors underline"
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href="/privacy"
          className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors underline"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#0B1120] text-gray-100 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight text-white font-display">
            Nexara
          </Link>
          <Link
            href="/roi-calculator"
            className="text-sm text-[#60A5FA] hover:text-white transition-colors"
          >
            ROI Calculator
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold font-display text-white text-center mb-2">
            Start your free 21-day trial
          </h1>
          <p className="text-gray-400 dark:text-gray-500 text-center mb-8">
            No credit card required
          </p>

          <Suspense
            fallback={
              <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
            }
          >
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
