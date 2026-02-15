'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { FileText, Plus, X, AlertTriangle } from 'lucide-react';

interface Contract {
  id: string;
  name: string;
  vendor: string;
  category: string;
  startDate: string;
  endDate: string;
  annualCost: number;
  status: string;
  notes: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: 'bg-green-500/20', text: 'text-green-400' },
  EXPIRING_SOON: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  EXPIRED: { bg: 'bg-red-500/20', text: 'text-red-400' },
  TERMINATED: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', vendor: '', category: 'SOFTWARE', startDate: '', endDate: '', annualCost: '', notes: '' });
  const [statusFilter, setStatusFilter] = useState('');

  const loadContracts = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/api/analytics/contracts${params}`);
      setContracts(res.data.data?.contracts || []);
    } catch {
      // API may not be available
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadContracts(); }, [statusFilter]);

  const handleCreate = async () => {
    try {
      await api.post('/api/analytics/contracts', {
        ...form,
        annualCost: parseFloat(form.annualCost) || 0,
      });
      setShowModal(false);
      setForm({ name: '', vendor: '', category: 'SOFTWARE', startDate: '', endDate: '', annualCost: '', notes: '' });
      loadContracts();
    } catch {
      // handle error
    }
  };

  const handleSeed = async () => {
    try {
      await api.get('/api/analytics/contracts/seed');
      loadContracts();
    } catch {
      // handle error
    }
  };

  const formatCurrency = (v: number) => `$${Number(v || 0).toLocaleString()}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const statusBadge = (status: string) => {
    const colors = STATUS_COLORS[status] || STATUS_COLORS.ACTIVE;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
        {status === 'EXPIRING_SOON' && <AlertTriangle className="w-3 h-3" />}
        {status.replace(/_/g, ' ')}
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
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Contracts</h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Manage vendor contracts and licences</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSeed}
              className="px-4 py-2 bg-[#1B3A6B]/60 text-gray-300 rounded-lg hover:bg-[#1B3A6B] transition-colors text-sm"
            >
              Seed Defaults
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Contract
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'bg-[#1B3A6B]/40 text-gray-400 dark:text-gray-500 hover:text-white'
              }`}
            >
              {s ? s.replace(/_/g, ' ') : 'All'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#0F2440] rounded-xl border border-[#1B3A6B]/30 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400 dark:text-gray-500">Loading contracts...</div>
          ) : contracts.length === 0 ? (
            <div className="p-12 text-center text-gray-400 dark:text-gray-500">No contracts found. Click &quot;Seed Defaults&quot; to add sample data.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1B3A6B]/30">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">Vendor</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">End Date</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">Annual Cost</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.id} className="border-b border-[#1B3A6B]/20 hover:bg-[#1B3A6B]/10 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{c.vendor}</td>
                    <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-500">{c.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{formatDate(c.endDate)}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-300">{formatCurrency(c.annualCost)}</td>
                    <td className="px-6 py-4">{statusBadge(c.status)}</td>
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
                <h2 className="text-lg font-bold">New Contract</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-[#0A1628] border border-[#1B3A6B]/50 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">Vendor</label>
                    <input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} className="w-full bg-[#0A1628] border border-[#1B3A6B]/50 rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-[#0A1628] border border-[#1B3A6B]/50 rounded-lg px-3 py-2 text-sm text-white">
                      <option value="SOFTWARE">Software</option>
                      <option value="INFRASTRUCTURE">Infrastructure</option>
                      <option value="COMPLIANCE">Compliance</option>
                      <option value="LICENCE">Licence</option>
                      <option value="CONSULTING">Consulting</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">Start Date</label>
                    <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full bg-[#0A1628] border border-[#1B3A6B]/50 rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">End Date</label>
                    <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full bg-[#0A1628] border border-[#1B3A6B]/50 rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">Annual Cost ($)</label>
                  <input type="number" value={form.annualCost} onChange={(e) => setForm({ ...form, annualCost: e.target.value })} className="w-full bg-[#0A1628] border border-[#1B3A6B]/50 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full bg-[#0A1628] border border-[#1B3A6B]/50 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 dark:text-gray-500 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">Create Contract</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
