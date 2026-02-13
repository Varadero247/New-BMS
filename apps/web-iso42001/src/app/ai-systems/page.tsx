'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface AISystem {
  id: string;
  name: string;
  description?: string;
  category: string;
  riskTier: string;
  status: string;
  owner: string;
  purpose?: string;
  createdAt: string;
  updatedAt: string;
}

const categoryOptions = ['MACHINE_LEARNING', 'DEEP_LEARNING', 'NLP', 'COMPUTER_VISION', 'GENERATIVE_AI', 'ROBOTICS', 'RECOMMENDATION', 'OTHER'];
const riskTierOptions = ['UNACCEPTABLE', 'HIGH', 'LIMITED', 'MINIMAL'];
const statusOptions = ['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'DECOMMISSIONED', 'SUSPENDED'];

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-green-100 text-green-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  DECOMMISSIONED: 'bg-red-100 text-red-700',
  SUSPENDED: 'bg-orange-100 text-orange-700',
};

const riskTierColors: Record<string, string> = {
  UNACCEPTABLE: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  LIMITED: 'bg-yellow-100 text-yellow-700',
  MINIMAL: 'bg-green-100 text-green-700',
};

export default function AISystemsPage() {
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<AISystem | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'MACHINE_LEARNING',
    riskTier: 'MINIMAL',
    status: 'DRAFT',
    owner: '',
    purpose: '',
  });

  useEffect(() => {
    loadSystems();
  }, []);

  async function loadSystems() {
    try {
      setError(null);
      const res = await api.get('/ai-systems');
      setSystems(res.data.data || []);
    } catch (err) {
      console.error('Error loading AI systems:', err);
      setError('Failed to load AI systems.');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingSystem(null);
    setForm({ name: '', description: '', category: 'MACHINE_LEARNING', riskTier: 'MINIMAL', status: 'DRAFT', owner: '', purpose: '' });
    setModalOpen(true);
  }

  function openEditModal(system: AISystem) {
    setEditingSystem(system);
    setForm({
      name: system.name,
      description: system.description || '',
      category: system.category,
      riskTier: system.riskTier,
      status: system.status,
      owner: system.owner,
      purpose: system.purpose || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingSystem) {
        await api.put(`/ai-systems/${editingSystem.id}`, form);
      } else {
        await api.post('/ai-systems', form);
      }
      setModalOpen(false);
      loadSystems();
    } catch (err) {
      console.error('Error saving AI system:', err);
      setError('Failed to save AI system.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this AI system?')) return;
    try {
      await api.delete(`/ai-systems/${id}`);
      loadSystems();
    } catch (err) {
      console.error('Error deleting AI system:', err);
      setError('Failed to delete AI system.');
    }
  }

  const filteredSystems = systems.filter((s) => {
    if (filterStatus && s.status !== filterStatus) return false;
    if (filterCategory && s.category !== filterCategory) return false;
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
            <h1 className="text-3xl font-bold text-gray-900">AI Systems</h1>
            <p className="text-gray-500 mt-1">Register and manage AI systems under ISO 42001</p>
          </div>
          <button onClick={openAddModal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Add AI System
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-4">
          <div className="flex gap-4">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All Statuses</option>
              {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All Categories</option>
              {categoryOptions.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Tier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSystems.length > 0 ? (
                filteredSystems.map((system) => (
                  <tr key={system.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{system.name}</p>
                        {system.description && <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{system.description}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{system.category.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${riskTierColors[system.riskTier] || 'bg-gray-100 text-gray-700'}`}>
                        {system.riskTier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[system.status] || 'bg-gray-100 text-gray-700'}`}>
                        {system.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{system.owner}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(system)} className="text-indigo-600 hover:text-indigo-700 text-sm mr-3">Edit</button>
                      <button onClick={() => handleDelete(system.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No AI systems found</td>
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editingSystem ? 'Edit AI System' : 'Add AI System'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <textarea value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {categoryOptions.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Tier</label>
                    <select value={form.riskTier} onChange={(e) => setForm({ ...form, riskTier: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {riskTierOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                    <input type="text" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    {editingSystem ? 'Update' : 'Create'}
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
