'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DueDiligence {
  id: string;
  thirdPartyName: string;
  thirdPartyType: string;
  country: string;
  riskLevel: string;
  status: string;
  assessor?: string;
  findings?: string;
  recommendation?: string;
  nextReviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

const thirdPartyTypeOptions = ['SUPPLIER', 'AGENT', 'CONSULTANT', 'JOINT_VENTURE', 'CONTRACTOR', 'DISTRIBUTOR', 'GOVERNMENT', 'OTHER'];
const riskLevelOptions = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
const statusOptions = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED', 'EXPIRED'];

const riskColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  VERY_HIGH: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  APPROVED: 'bg-indigo-100 text-indigo-700',
  REJECTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-orange-100 text-orange-700',
};

export default function DueDiligencePage() {
  const [records, setRecords] = useState<DueDiligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DueDiligence | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRisk, setFilterRisk] = useState('');

  const [form, setForm] = useState({
    thirdPartyName: '',
    thirdPartyType: 'SUPPLIER',
    country: '',
    riskLevel: 'MEDIUM',
    status: 'NOT_STARTED',
    assessor: '',
    findings: '',
    recommendation: '',
    nextReviewDate: '',
  });

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      setError(null);
      const res = await api.get('/due-diligence');
      setRecords(res.data.data || []);
    } catch (err) {
      console.error('Error loading due diligence records:', err);
      setError('Failed to load due diligence records.');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingRecord(null);
    setForm({ thirdPartyName: '', thirdPartyType: 'SUPPLIER', country: '', riskLevel: 'MEDIUM', status: 'NOT_STARTED', assessor: '', findings: '', recommendation: '', nextReviewDate: '' });
    setModalOpen(true);
  }

  function openEditModal(record: DueDiligence) {
    setEditingRecord(record);
    setForm({
      thirdPartyName: record.thirdPartyName,
      thirdPartyType: record.thirdPartyType,
      country: record.country,
      riskLevel: record.riskLevel,
      status: record.status,
      assessor: record.assessor || '',
      findings: record.findings || '',
      recommendation: record.recommendation || '',
      nextReviewDate: record.nextReviewDate ? record.nextReviewDate.split('T')[0] : '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingRecord) {
        await api.put(`/due-diligence/${editingRecord.id}`, form);
      } else {
        await api.post('/due-diligence', form);
      }
      setModalOpen(false);
      loadRecords();
    } catch (err) {
      console.error('Error saving due diligence record:', err);
      setError('Failed to save record.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/due-diligence/${id}`);
      loadRecords();
    } catch (err) {
      console.error('Error deleting record:', err);
      setError('Failed to delete record.');
    }
  }

  const filteredRecords = records.filter((r) => {
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterRisk && r.riskLevel !== filterRisk) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
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
            <h1 className="text-3xl font-bold text-gray-900">Due Diligence</h1>
            <p className="text-gray-500 mt-1">Third-party due diligence register</p>
          </div>
          <button onClick={openAddModal} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">
            Add Due Diligence
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-4">
          <div className="flex gap-4">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">All Statuses</option>
              {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">All Risk Levels</option>
              {riskLevelOptions.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Third Party</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Review</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.thirdPartyName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{record.thirdPartyType.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{record.country}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${riskColors[record.riskLevel] || 'bg-gray-100 text-gray-700'}`}>
                        {record.riskLevel.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[record.status] || 'bg-gray-100 text-gray-700'}`}>
                        {record.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.nextReviewDate ? new Date(record.nextReviewDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(record)} className="text-rose-600 hover:text-rose-700 text-sm mr-3">Edit</button>
                      <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No due diligence records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setModalOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editingRecord ? 'Edit Due Diligence' : 'Add Due Diligence'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Third Party Name</label>
                  <input type="text" value={form.thirdPartyName} onChange={(e) => setForm({ ...form, thirdPartyName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select value={form.thirdPartyType} onChange={(e) => setForm({ ...form, thirdPartyType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {thirdPartyTypeOptions.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                    <select value={form.riskLevel} onChange={(e) => setForm({ ...form, riskLevel: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {riskLevelOptions.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assessor</label>
                    <input type="text" value={form.assessor} onChange={(e) => setForm({ ...form, assessor: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Findings</label>
                  <textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recommendation</label>
                  <textarea value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Review Date</label>
                  <input type="date" value={form.nextReviewDate} onChange={(e) => setForm({ ...form, nextReviewDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
                    {editingRecord ? 'Update' : 'Create'}
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
