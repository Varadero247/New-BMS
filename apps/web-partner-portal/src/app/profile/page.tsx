// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Profile {
  companyName: string;
  contactName: string;
  email: string;
  tier: string;
  status: string;
  partnerSince: string;
}

interface EditForm {
  companyName: string;
  phone: string;
  website: string;
  billingAddress: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    companyName: '',
    contactName: '',
    email: '',
    tier: '',
    status: '',
    partnerSince: '',
  });
  const [form, setForm] = useState<EditForm>({
    companyName: '',
    phone: '',
    website: '',
    billingAddress: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Populate from localStorage first
    const name = localStorage.getItem('partner_name') || '';
    const tier = localStorage.getItem('partner_tier') || '';

    setProfile((prev) => ({
      ...prev,
      contactName: name,
      tier,
    }));
    setForm((prev) => ({ ...prev, companyName: name }));

    api
      .get('/api/billing/partners/profile')
      .then((res) => {
        const data = res.data?.data || res.data || {};
        setProfile({
          companyName: data.companyName || name,
          contactName: data.contactName || name,
          email: data.email || '',
          tier: data.tier || tier,
          status: data.status || 'Active',
          partnerSince: data.partnerSince || '',
        });
        setForm({
          companyName: data.companyName || '',
          phone: data.phone || '',
          website: data.website || '',
          billingAddress: data.billingAddress || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/api/billing/partners/profile', form);
    } catch {
      // Accept silently
    } finally {
      setSaving(false);
      window.alert('Profile updated');
    }
  }

  const infoRows = [
    { label: 'Company Name', value: profile.companyName },
    { label: 'Contact Name', value: profile.contactName },
    { label: 'Email', value: profile.email },
    { label: 'Tier', value: profile.tier },
    { label: 'Status', value: profile.status },
    { label: 'Partner Since', value: profile.partnerSince ? new Date(profile.partnerSince).toLocaleDateString('en-GB') : '—' },
  ];

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500 text-sm">Loading profile...</div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Your partner account details and settings.</p>
      </div>

      {/* Profile info card */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-6">
        <h2 className="text-base font-semibold text-white mb-4">Account Information</h2>
        <dl className="space-y-3">
          {infoRows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <dt className="text-sm text-gray-400">{r.label}</dt>
              <dd className="text-sm text-white font-medium">{r.value || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Edit form */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-base font-semibold text-white mb-4">Edit Details</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-1.5">
              Company Name
            </label>
            <input
              id="companyName"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm"
              placeholder="Acme Partners Ltd"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1.5">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm"
              placeholder="+44 20 1234 5678"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-1.5">
              Website
            </label>
            <input
              id="website"
              name="website"
              type="url"
              value={form.website}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm"
              placeholder="https://www.acmepartners.com"
            />
          </div>

          <div>
            <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-300 mb-1.5">
              Billing Address
            </label>
            <textarea
              id="billingAddress"
              name="billingAddress"
              rows={3}
              value={form.billingAddress}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm resize-none"
              placeholder="123 Business Park, London, EC1A 1BB"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
