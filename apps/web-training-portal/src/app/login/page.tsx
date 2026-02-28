'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'participant' | 'facilitator'>('participant');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple demo auth — replace with real API call in production
    await new Promise((r) => setTimeout(r, 800));

    if (email && password) {
      if (role === 'facilitator') {
        router.push('/admin');
      } else {
        router.push('/programme');
      }
    } else {
      setError('Please enter your email and password.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#B8860B] flex items-center justify-center font-bold text-xl text-white mx-auto mb-4">N</div>
          <h1 className="text-2xl font-bold text-white">Nexara Training Portal</h1>
          <p className="text-slate-400 text-sm mt-2">Sign in to access the administrator training programme</p>
        </div>

        <div className="bg-[#091628] border border-[#1E3A5F] rounded-2xl p-8">
          {/* Role toggle */}
          <div className="flex bg-[#1E3A5F]/30 rounded-lg p-1 mb-6">
            <button
              onClick={() => setRole('participant')}
              className={`flex-1 text-sm py-2 rounded-md transition-colors font-medium ${role === 'participant' ? 'bg-[#B8860B] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Participant
            </button>
            <button
              onClick={() => setRole('facilitator')}
              className={`flex-1 text-sm py-2 rounded-md transition-colors font-medium ${role === 'facilitator' ? 'bg-[#B8860B] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Facilitator
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'facilitator' ? 'facilitator@nexara.io' : 'participant@organisation.io'}
                className="w-full bg-[#1E3A5F]/30 border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#B8860B] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your training portal password"
                className="w-full bg-[#1E3A5F]/30 border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#B8860B] transition-colors"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-950/20 border border-red-800 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B8860B] text-white font-semibold py-3 rounded-lg hover:bg-[#D4A017] transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#1E3A5F] text-center">
            <p className="text-xs text-slate-500">
              Training portal credentials are provided by your facilitator.
              Contact <a href="mailto:training@nexara.io" className="text-[#B8860B] hover:underline">training@nexara.io</a> for access.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            ← Back to programme overview
          </Link>
        </div>
      </div>
    </main>
  );
}
