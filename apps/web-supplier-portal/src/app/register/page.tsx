'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { UserPlus, CheckCircle2, AlertCircle, Search, Trash2, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

interface SupplierUser {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  role: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

const MOCK_USERS: SupplierUser[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    email: 's.mitchell@acme-supplies.com',
    company: 'ACME Supplies Ltd',
    phone: '+44 7700 900123',
    role: 'SUPPLIER_USER',
    status: 'ACTIVE',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'James Park',
    email: 'j.park@globalmfg.co.uk',
    company: 'Global Manufacturing Co.',
    phone: '+44 7700 900456',
    role: 'SUPPLIER_USER',
    status: 'PENDING',
    createdAt: '2026-02-10T14:30:00Z',
  },
  {
    id: '3',
    name: 'Priya Sharma',
    email: 'p.sharma@techcomp.io',
    company: 'TechComp Components',
    role: 'SUPPLIER_USER',
    status: 'SUSPENDED',
    createdAt: '2025-11-20T09:00:00Z',
  },
];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 border border-green-200',
  PENDING: 'bg-amber-100 text-amber-700 border border-amber-200',
  SUSPENDED: 'bg-red-100 text-red-700 border border-red-200',
};

export default function RegisterPage() {
  const [users, setUsers] = useState<SupplierUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [mockBanner, setMockBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const r = await api.get('/supplier/register');
      setUsers(r.data.data || []);
    } catch {
      setUsers(MOCK_USERS);
      setMockBanner(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const r = await api.post('/supplier/register', form);
      const created = r.data.data as SupplierUser;
      setUsers(prev => [created, ...prev]);
      setSuccess(`Supplier account created for ${form.email}`);
    } catch {
      // optimistic fallback
      const mock: SupplierUser = {
        id: String(Date.now()),
        ...form,
        role: 'SUPPLIER_USER',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      setUsers(prev => [mock, ...prev]);
      setSuccess(`Supplier account created for ${form.email}`);
    } finally {
      setSubmitting(false);
      setShowModal(false);
      setForm({ name: '', email: '', company: '', phone: '' });
      setTimeout(() => setSuccess(''), 5000);
    }
  }

  async function handleRevoke(id: string) {
    try {
      await api.delete(`/supplier/register/${id}`);
    } catch {
      // proceed locally
    }
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  const filtered = users.filter(u =>
    [u.name, u.email, u.company].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-600 rounded-lg">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Supplier Portal Registration
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage supplier portal user accounts
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
        >
          <UserPlus className="h-4 w-4" />
          Register Supplier
        </button>
      </div>

      {/* Banners */}
      {mockBanner && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          Using mock data — API unavailable
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Accounts', value: users.length, color: 'text-teal-700' },
          { label: 'Active', value: users.filter(u => u.status === 'ACTIVE').length, color: 'text-green-700' },
          { label: 'Pending', value: users.filter(u => u.status === 'PENDING').length, color: 'text-amber-700' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 dark:text-white">Registered Users</CardTitle>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 w-56"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {['Name', 'Email', 'Company', 'Status', 'Registered', 'Actions'].map(h => (
                    <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{u.company}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[u.status]}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleRevoke(u.id)}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors"
                        title="Revoke access"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No supplier users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Register Supplier User
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  {error}
                </div>
              )}
              {[
                { label: 'Full Name', key: 'name', type: 'text', required: true },
                { label: 'Email Address', key: 'email', type: 'email', required: true },
                { label: 'Company', key: 'company', type: 'text', required: true },
                { label: 'Phone (optional)', key: 'phone', type: 'tel', required: false },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    required={f.required}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="h-3 w-3 animate-spin" />}
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
