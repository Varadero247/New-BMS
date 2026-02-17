'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const ISO_SPECIALISMS = [
  'ISO 9001 - Quality Management',
  'ISO 14001 - Environmental Management',
  'ISO 27001 - Information Security',
  'ISO 45001 - Health & Safety',
  'ISO 22000 - Food Safety',
  'ISO 50001 - Energy Management',
  'ISO 42001 - AI Management',
  'ISO 37001 - Anti-Bribery',
  'ISO 13485 - Medical Devices',
  'IATF 16949 - Automotive',
  'AS9100 - Aerospace',
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
    specialisms: [] as string[],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSpecialism = (specialism: string) => {
    setForm((prev) => ({
      ...prev,
      specialisms: prev.specialisms.includes(specialism)
        ? prev.specialisms.filter((s) => s !== specialism)
        : [...prev.specialisms, specialism],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/register', {
        name: form.name,
        email: form.email,
        company: form.company,
        password: form.password,
        specialisms: form.specialisms,
      });
      router.push('/login?registered=true');
    } catch (err: unknown) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Nexara</h1>
          <p className="text-gray-400 dark:text-gray-500 mt-2">Partner Programme Application</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Create your partner account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Company</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                required
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
                placeholder="Acme Consulting Ltd"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
                placeholder="Repeat your password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ISO Specialisms</label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
                {ISO_SPECIALISMS.map((specialism) => (
                  <label
                    key={specialism}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      form.specialisms.includes(specialism)
                        ? 'border-[#1B3A6B] bg-[#1B3A6B]/20 text-white'
                        : 'border-gray-700 bg-gray-800 text-gray-400 dark:text-gray-500 hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.specialisms.includes(specialism)}
                      onChange={() => toggleSpecialism(specialism)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        form.specialisms.includes(specialism)
                          ? 'bg-[#1B3A6B] border-[#1B3A6B]'
                          : 'border-gray-600'
                      }`}
                    >
                      {form.specialisms.includes(specialism) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{specialism}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400 dark:text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4a8ade] hover:text-[#6ba3f0] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
