'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface PartnerProfile {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  isoSpecialisms: string[];
  partnerTier: 'GOLD' | 'SILVER' | 'BRONZE';
  joinedAt: string;
  status: string;
}

const MOCK_PROFILE: PartnerProfile = {
  id: '1',
  name: 'Alexandra Chen',
  company: 'Nexara Solutions Ltd',
  email: 'a.chen@nexarasolutions.com',
  phone: '+44 20 7946 0123',
  isoSpecialisms: ['ISO 9001', 'ISO 14001', 'ISO 45001'],
  partnerTier: 'GOLD',
  joinedAt: '2023-03-15T00:00:00Z',
  status: 'ACTIVE',
};

const ALL_SPECIALISMS = [
  'ISO 9001',
  'ISO 14001',
  'ISO 45001',
  'ISO 27001',
  'ISO 50001',
  'ISO 13485',
  'AS9100',
  'IATF 16949',
  'ISO 22000',
];

const TIER_STYLES: Record<string, { badge: string; label: string; ring: string }> = {
  GOLD: {
    badge: 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/40',
    label: 'Gold Partner',
    ring: 'ring-yellow-400/30',
  },
  SILVER: {
    badge: 'bg-gray-300/20 text-gray-300 border border-gray-300/40',
    label: 'Silver Partner',
    ring: 'ring-gray-300/30',
  },
  BRONZE: {
    badge: 'bg-orange-700/20 text-orange-400 border border-orange-700/40',
    label: 'Bronze Partner',
    ring: 'ring-orange-700/30',
  },
};

interface EditForm {
  name: string;
  company: string;
  phone: string;
  isoSpecialisms: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState<EditForm>({
    name: '',
    company: '',
    phone: '',
    isoSpecialisms: [],
  });

  useEffect(() => {
    const token = localStorage.getItem('partner_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [router]);

  async function fetchProfile() {
    try {
      const res = await api.get('/api/profile');
      const data: PartnerProfile = res.data.data || res.data;
      setProfile(data);
      setForm({
        name: data.name,
        company: data.company,
        phone: data.phone,
        isoSpecialisms: data.isoSpecialisms,
      });
    } catch {
      setProfile(MOCK_PROFILE);
      setForm({
        name: MOCK_PROFILE.name,
        company: MOCK_PROFILE.company,
        phone: MOCK_PROFILE.phone,
        isoSpecialisms: MOCK_PROFILE.isoSpecialisms,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const res = await api.put('/api/profile', form);
      const updated: PartnerProfile = res.data.data || res.data;
      setProfile({ ...profile!, ...updated });
      setEditing(false);
    } catch {
      // Apply optimistically
      setProfile({ ...profile!, ...form });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function toggleSpecialism(s: string) {
    setForm((prev) => ({
      ...prev,
      isoSpecialisms: prev.isoSpecialisms.includes(s)
        ? prev.isoSpecialisms.filter((x) => x !== s)
        : [...prev.isoSpecialisms, s],
    }));
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-gray-400">Loading profile...</div>
        </main>
      </div>
    );
  }

  if (!profile) return null;

  const tier = TIER_STYLES[profile.partnerTier];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Partner Profile</h1>
            <p className="text-gray-400 mt-1">Your organisation details and ISO specialisms</p>
          </div>

          {/* Profile card */}
          <div className={`bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 ring-1 ${tier.ring}`}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="h-14 w-14 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {profile.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{profile.name}</h2>
                  <p className="text-gray-400 text-sm">{profile.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${tier.badge}`}
                >
                  {tier.label}
                </span>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-[#1B3A6B] hover:bg-[#244d8a] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Info grid */}
            {!editing ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Email', value: profile.email },
                    { label: 'Phone', value: profile.phone },
                    {
                      label: 'Partner Since',
                      value: new Date(profile.joinedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }),
                    },
                    {
                      label: 'Status',
                      value: profile.status,
                      valueClass: 'text-green-400',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-gray-800/50 rounded-lg p-3"
                    >
                      <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                      <p className={`text-sm font-medium text-white ${item.valueClass ?? ''}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Specialisms */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">ISO Specialisms</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.isoSpecialisms.length > 0 ? (
                      profile.isoSpecialisms.map((s) => (
                        <span
                          key={s}
                          className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[#1B3A6B]/50 text-blue-300 border border-[#1B3A6B]"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No specialisms listed</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Edit form */
              <form onSubmit={handleSave} className="space-y-4">
                {saveError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {saveError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Company
                    </label>
                    <input
                      type="text"
                      required
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Specialisms checkboxes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ISO Specialisms
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ALL_SPECIALISMS.map((s) => {
                      const checked = form.isoSpecialisms.includes(s);
                      return (
                        <label
                          key={s}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                            checked
                              ? 'bg-[#1B3A6B]/40 border-[#1B3A6B] text-blue-300'
                              : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSpecialism(s)}
                            className="sr-only"
                          />
                          <span
                            className={`h-3.5 w-3.5 rounded flex-shrink-0 border ${
                              checked
                                ? 'bg-[#1B3A6B] border-blue-400'
                                : 'bg-transparent border-gray-600'
                            } flex items-center justify-center`}
                          >
                            {checked && (
                              <svg
                                viewBox="0 0 10 8"
                                fill="none"
                                className="w-2.5 h-2.5"
                              >
                                <path
                                  d="M1 4l3 3 5-6"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                          <span className="text-xs font-medium">{s}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setSaveError('');
                      setForm({
                        name: profile.name,
                        company: profile.company,
                        phone: profile.phone,
                        isoSpecialisms: profile.isoSpecialisms,
                      });
                    }}
                    className="px-5 py-2.5 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg hover:border-gray-600 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-[#1B3A6B] hover:bg-[#244d8a] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Tier explanation */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Partner Tier Benefits</h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {([
                { tier: 'BRONZE', label: 'Bronze', perks: ['Portal access', 'Deal registration', 'Basic support'] },
                { tier: 'SILVER', label: 'Silver', perks: ['All Bronze', 'Co-marketing assets', 'Priority support', 'Quarterly reviews'] },
                { tier: 'GOLD', label: 'Gold', perks: ['All Silver', 'Dedicated manager', 'Custom commissions', 'Early access'] },
              ] as const).map((t) => (
                <div
                  key={t.tier}
                  className={`rounded-lg p-3 border ${
                    profile.partnerTier === t.tier
                      ? 'border-gray-600 bg-gray-800/70'
                      : 'border-gray-800 bg-gray-800/20'
                  }`}
                >
                  <p
                    className={`font-semibold mb-2 ${
                      t.tier === 'GOLD'
                        ? 'text-yellow-400'
                        : t.tier === 'SILVER'
                          ? 'text-gray-300'
                          : 'text-orange-400'
                    }`}
                  >
                    {t.label}
                    {profile.partnerTier === t.tier && (
                      <span className="ml-1 text-gray-500 font-normal">(current)</span>
                    )}
                  </p>
                  <ul className="space-y-1">
                    {t.perks.map((p) => (
                      <li key={p} className="text-gray-400 flex items-start gap-1.5">
                        <span className="text-gray-600 mt-0.5">&#8226;</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
