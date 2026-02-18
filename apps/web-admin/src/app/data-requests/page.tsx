'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { ShieldCheck, Plus, X, Clock, ArrowRight } from 'lucide-react';

interface DataRequest {
  id: string;
  type: string;
  requesterEmail: string;
  requesterName: string;
  description: string | null;
  status: string;
  deadlineAt: string;
  completedAt: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  RECEIVED: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  VERIFIED: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  PROCESSING: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400' },
  REJECTED: { bg: 'bg-red-500/20', text: 'text-red-400' },
};

const NEXT_STATUS: Record<string, string> = {
  RECEIVED: 'VERIFIED',
  VERIFIED: 'PROCESSING',
  PROCESSING: 'COMPLETED',
};

const REQUEST_TYPES = [
  'ACCESS',
  'RECTIFICATION',
  'ERASURE',
  'PORTABILITY',
  'RESTRICTION',
  'OBJECTION',
];

export default function DataRequestsPage() {
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    type: 'ACCESS',
    requesterName: '',
    requesterEmail: '',
    description: '',
  });
  const [statusFilter, setStatusFilter] = useState('');

  const loadRequests = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/api/analytics/dsars${params}`);
      setRequests(res.data.data?.requests || []);
    } catch {
      // API may not be available
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const handleCreate = async () => {
    try {
      await api.post('/api/analytics/dsars', form);
      setShowModal(false);
      setForm({ type: 'ACCESS', requesterName: '', requesterEmail: '', description: '' });
      loadRequests();
    } catch {
      // handle error
    }
  };

  const handleTransition = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/analytics/dsars/${id}/status`, { status: newStatus });
      loadRequests();
    } catch {
      // handle error
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const daysLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysLeftBadge = (deadline: string, status: string) => {
    if (status === 'COMPLETED' || status === 'REJECTED') return null;
    const days = daysLeft(deadline);
    const color = days <= 0 ? 'text-red-400' : days <= 7 ? 'text-amber-400' : 'text-green-400';
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
        <Clock className="w-3 h-3" />
        {days <= 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
      </span>
    );
  };

  const statusBadge = (status: string) => {
    const colors = STATUS_COLORS[status] || STATUS_COLORS.RECEIVED;
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      <Sidebar />
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1B3A6B] rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Data Subject Requests</h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                GDPR/DSAR management with SLA tracking
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New DSAR
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['', 'RECEIVED', 'VERIFIED', 'PROCESSING', 'COMPLETED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                statusFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1B3A6B]/40 text-gray-400 dark:text-gray-500 hover:text-white'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#0F2440] rounded-xl border border-[#1B3A6B]/30 overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-400 dark:text-gray-500">
              Loading data requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-gray-400 dark:text-gray-500">
              No data requests found.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1B3A6B]/30">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                    Requester
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                    Received
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                    Deadline
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                    Days Left
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-[#1B3A6B]/20 hover:bg-[#1B3A6B]/10 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium">{r.type}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{r.requesterName}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {r.requesterEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4">{statusBadge(r.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{formatDate(r.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{formatDate(r.deadlineAt)}</td>
                    <td className="px-6 py-4">{daysLeftBadge(r.deadlineAt, r.status)}</td>
                    <td className="px-6 py-4">
                      {NEXT_STATUS[r.status] ? (
                        <button
                          onClick={() => handleTransition(r.id, NEXT_STATUS[r.status])}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-medium hover:bg-blue-600/40 transition-colors"
                        >
                          <ArrowRight className="w-3 h-3" />
                          {NEXT_STATUS[r.status]}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#0F2440] rounded-xl border border-[#1B3A6B]/30 w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">New Data Subject Request</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">
                    Request Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-[#0A1628] border border-[#1B3A6B]/50 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    {REQUEST_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">
                      Requester Name
                    </label>
                    <input
                      value={form.requesterName}
                      onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
                      className="w-full bg-[#0A1628] border border-[#1B3A6B]/50 rounded-lg px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.requesterEmail}
                      onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })}
                      className="w-full bg-[#0A1628] border border-[#1B3A6B]/50 rounded-lg px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full bg-[#0A1628] border border-[#1B3A6B]/50 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-400 dark:text-gray-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Submit DSAR
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
