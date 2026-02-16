'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface GiftRecord {
  id: string;
  description: string;
  type: string;
  value: number;
  currency: string;
  givenOrReceived: string;
  counterparty: string;
  approvalStatus: string;
  approvedBy?: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const typeOptions = ['GIFT', 'HOSPITALITY', 'ENTERTAINMENT', 'TRAVEL'];
const directionOptions = ['GIVEN', 'RECEIVED'];
const approvalStatusOptions = ['PENDING', 'APPROVED', 'REJECTED'];

const typeColors: Record<string, string> = {
  GIFT: 'bg-purple-100 text-purple-700',
  HOSPITALITY: 'bg-blue-100 text-blue-700',
  ENTERTAINMENT: 'bg-indigo-100 text-indigo-700',
  TRAVEL: 'bg-cyan-100 text-cyan-700',
};

const approvalColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const commonCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'CHF'];

export default function GiftsPage() {
  const [gifts, setGifts] = useState<GiftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDirection, setFilterDirection] = useState('');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    description: '',
    type: 'GIFT',
    value: 0,
    currency: 'USD',
    givenOrReceived: 'RECEIVED',
    counterparty: '',
    approvalStatus: 'PENDING',
    approvedBy: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadGifts();
  }, []);

  async function loadGifts() {
    try {
      setError(null);
      const res = await api.get('/gifts');
      setGifts(res.data.data || []);
    } catch (err) {
      console.error('Error loading gifts:', err);
      setError('Failed to load gifts register.');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingGift(null);
    setForm({
      description: '',
      type: 'GIFT',
      value: 0,
      currency: 'USD',
      givenOrReceived: 'RECEIVED',
      counterparty: '',
      approvalStatus: 'PENDING',
      approvedBy: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setModalOpen(true);
  }

  function openEditModal(gift: GiftRecord) {
    setEditingGift(gift);
    setForm({
      description: gift.description,
      type: gift.type,
      value: gift.value,
      currency: gift.currency,
      givenOrReceived: gift.givenOrReceived,
      counterparty: gift.counterparty,
      approvalStatus: gift.approvalStatus,
      approvedBy: gift.approvedBy || '',
      date: gift.date ? gift.date.split('T')[0] : '',
      notes: gift.notes || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingGift) {
        await api.put(`/gifts/${editingGift.id}`, form);
      } else {
        await api.post('/gifts', form);
      }
      setModalOpen(false);
      loadGifts();
    } catch (err) {
      console.error('Error saving gift:', err);
      setError('Failed to save gift record.');
    }
  }

  async function handleApprove(id: string) {
    try {
      await api.put(`/gifts/${id}`, { approvalStatus: 'APPROVED' });
      loadGifts();
    } catch (err) {
      console.error('Error approving gift:', err);
      setError('Failed to approve gift.');
    }
  }

  async function handleReject(id: string) {
    try {
      await api.put(`/gifts/${id}`, { approvalStatus: 'REJECTED' });
      loadGifts();
    } catch (err) {
      console.error('Error rejecting gift:', err);
      setError('Failed to reject gift.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/gifts/${id}`);
      loadGifts();
    } catch (err) {
      console.error('Error deleting gift:', err);
      setError('Failed to delete gift record.');
    }
  }

  const filtered = gifts.filter((g) => {
    if (filterStatus && g.approvalStatus !== filterStatus) return false;
    if (filterType && g.type !== filterType) return false;
    if (filterDirection && g.givenOrReceived !== filterDirection) return false;
    if (search && !g.description.toLowerCase().includes(search.toLowerCase()) && !g.counterparty.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pendingCount = gifts.filter((g) => g.approvalStatus === 'PENDING').length;
  const approvedCount = gifts.filter((g) => g.approvalStatus === 'APPROVED').length;
  const rejectedCount = gifts.filter((g) => g.approvalStatus === 'REJECTED').length;
  const totalValueReceived = gifts
    .filter((g) => g.givenOrReceived === 'RECEIVED' && g.currency === 'USD')
    .reduce((sum, g) => sum + g.value, 0);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gifts & Hospitality Register</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track and approve gifts, hospitality, entertainment and travel</p>
          </div>
          <button onClick={openAddModal} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">
            Register Gift
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Approval</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">awaiting decision</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">of {gifts.length} total</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">not permitted</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Received (USD)</p>
            <p className="text-2xl font-bold text-rose-600">${totalValueReceived.toLocaleString()}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">total value received</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 p-4">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              aria-label="Search by description or counterparty..." placeholder="Search by description or counterparty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <select aria-label="Filter by type" value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">All Types</option>
              {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterDirection} onChange={(e) => setFilterDirection(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">Given & Received</option>
              {directionOptions.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select aria-label="Filter by status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">All Statuses</option>
              {approvalStatusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Direction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Counterparty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Approval</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.length > 0 ? (
                filtered.map((gift) => (
                  <tr key={gift.id} className="hover:bg-gray-50 dark:bg-gray-800">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{gift.description}</p>
                      {gift.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-xs">{gift.notes}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeColors[gift.type] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                        {gift.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {gift.currency} {gift.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${gift.givenOrReceived === 'GIVEN' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {gift.givenOrReceived}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{gift.counterparty}</td>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${approvalColors[gift.approvalStatus] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                          {gift.approvalStatus}
                        </span>
                        {gift.approvedBy && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">by {gift.approvedBy}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {gift.date ? new Date(gift.date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {gift.approvalStatus === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(gift.id)} className="text-green-600 hover:text-green-700 text-sm mr-2">Approve</button>
                          <button onClick={() => handleReject(gift.id)} className="text-orange-600 hover:text-orange-700 text-sm mr-2">Reject</button>
                        </>
                      )}
                      <button onClick={() => openEditModal(gift)} className="text-rose-600 hover:text-rose-700 text-sm mr-2">Edit</button>
                      <button onClick={() => handleDelete(gift.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {gifts.length === 0 ? 'No gift records found. Register one to get started.' : 'No records match your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setModalOpen(false)} />
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{editingGift ? 'Edit Gift Record' : 'Register Gift / Hospitality'}</h2>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Business dinner at client premises"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Direction</label>
                    <select value={form.givenOrReceived} onChange={(e) => setForm({ ...form, givenOrReceived: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {directionOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                    <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {commonCurrencies.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Counterparty <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.counterparty}
                    onChange={(e) => setForm({ ...form, counterparty: e.target.value })}
                    placeholder="Name / organisation of counterparty"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Approval Status</label>
                    <select value={form.approvalStatus} onChange={(e) => setForm({ ...form, approvalStatus: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {approvalStatusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Approved By</label>
                    <input
                      type="text"
                      value={form.approvedBy}
                      onChange={(e) => setForm({ ...form, approvedBy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                    <input
                      type="text"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
                    {editingGift ? 'Update' : 'Register'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
