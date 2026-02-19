'use client';

import { useState, useEffect, useCallback } from 'react';

interface DsarRequest {
  id: string;
  type: 'EXPORT' | 'ERASURE';
  subjectEmail: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' | 'FAILED';
  completedAt: string | null;
  downloadUrl: string | null;
  downloadExpiry: string | null;
  createdAt: string;
  notes: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  COMPLETE: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  FAILED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

export default function PrivacyPage() {
  const [requests, setRequests] = useState<DsarRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<'EXPORT' | 'ERASURE'>('EXPORT');
  const [formEmail, setFormEmail] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/privacy/dsar`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) setRequests(data.data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchRequests().finally(() => setLoading(false));
  }, [fetchRequests]);

  const handleCreate = async () => {
    if (!formEmail) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/privacy/dsar`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          type: formType,
          subjectEmail: formEmail,
          notes: formNotes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) => [data.data, ...prev]);
        setShowCreate(false);
        setFormEmail('');
        setFormNotes('');
      }
    } catch {
      /* ignore */
    }
  };

  const handleProcess = async (id: string) => {
    setProcessing(id);
    try {
      const res = await fetch(`${API_URL}/api/admin/privacy/dsar/${id}/process`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) => prev.map((r) => (r.id === id ? data.data : r)));
      }
    } catch {
      /* ignore */
    }
    setProcessing(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Privacy & DSAR</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage Data Subject Access Requests (GDPR Article 15-17).
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          {showCreate ? 'Cancel' : 'New DSAR Request'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{requests.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {requests.filter((r) => r.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400">In Progress</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {requests.filter((r) => r.status === 'IN_PROGRESS').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-sm text-green-600 dark:text-green-400">Complete</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {requests.filter((r) => r.status === 'COMPLETE').length}
          </p>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            New DSAR Request
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Request Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as 'EXPORT' | 'ERASURE')}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="EXPORT">Data Export (Article 15 / 20)</option>
                <option value="ERASURE">Data Erasure (Article 17)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject Email
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="e.g., john.doe@example.com"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCreate}
              disabled={!formEmail}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Request
            </button>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Subject Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Completed
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No DSAR requests yet. Create one to get started.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800/50"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        r.type === 'EXPORT'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                      }`}
                    >
                      {r.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {r.subjectEmail}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[r.status]}`}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {r.status === 'PENDING' && (
                      <button
                        onClick={() => handleProcess(r.id)}
                        disabled={processing === r.id}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50"
                      >
                        {processing === r.id ? 'Processing...' : 'Process'}
                      </button>
                    )}
                    {r.status === 'COMPLETE' && r.downloadUrl && (
                      <a
                        href={r.downloadUrl}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        Download
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
