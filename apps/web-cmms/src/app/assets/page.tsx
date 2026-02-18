'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import {
  Plus,
  Search,
  Server,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Wrench,
  Ban,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  location: string;
  status: string;
  criticality: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installDate: string;
  description: string;
}

const statusColors: Record<string, string> = {
  OPERATIONAL: 'bg-green-100 text-green-700',
  DOWN: 'bg-red-100 text-red-700',
  MAINTENANCE: 'bg-yellow-100 text-yellow-700',
  DECOMMISSIONED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const criticalityColors: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

const EMPTY_FORM = {
  assetTag: '',
  name: '',
  category: '',
  location: '',
  status: 'OPERATIONAL',
  criticality: 'MEDIUM',
  manufacturer: '',
  model: '',
  serialNumber: '',
  installDate: '',
  description: '',
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [criticalityFilter, setCriticalityFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    setLoading(true);
    try {
      const res = await api.get('/assets');
      setAssets(res.data.data || []);
    } catch (e) {
      console.error('Error loading assets:', e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = assets.filter((a) => {
    const matchesSearch =
      !searchTerm || JSON.stringify(a).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || a.status === statusFilter;
    const matchesCriticality = !criticalityFilter || a.criticality === criticalityFilter;
    return matchesSearch && matchesStatus && matchesCriticality;
  });

  const stats = {
    total: assets.length,
    operational: assets.filter((a) => a.status === 'OPERATIONAL').length,
    down: assets.filter((a) => a.status === 'DOWN').length,
    maintenance: assets.filter((a) => a.status === 'MAINTENANCE').length,
  };

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setError('');
    setCreateOpen(true);
  }

  function openEdit(asset: Asset) {
    setSelected(asset);
    setForm({
      assetTag: asset.assetTag || '',
      name: asset.name || '',
      category: asset.category || '',
      location: asset.location || '',
      status: asset.status || 'OPERATIONAL',
      criticality: asset.criticality || 'MEDIUM',
      manufacturer: asset.manufacturer || '',
      model: asset.model || '',
      serialNumber: asset.serialNumber || '',
      installDate: asset.installDate ? asset.installDate.slice(0, 10) : '',
      description: asset.description || '',
    });
    setError('');
    setEditOpen(true);
  }

  function openDelete(asset: Asset) {
    setSelected(asset);
    setDeleteOpen(true);
  }

  async function handleCreate() {
    if (!form.name.trim()) {
      setError('Asset name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/assets', form);
      setCreateOpen(false);
      await loadAssets();
    } catch (e: unknown) {
      setError(e?.response?.data?.error || 'Failed to create asset');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit() {
    if (!form.name.trim()) {
      setError('Asset name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.put(`/assets/${selected!.id}`, form);
      setEditOpen(false);
      await loadAssets();
    } catch (e: unknown) {
      setError(e?.response?.data?.error || 'Failed to update asset');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await api.delete(`/assets/${selected!.id}`);
      setDeleteOpen(false);
      await loadAssets();
    } catch (e: unknown) {
      setError(e?.response?.data?.error || 'Failed to delete asset');
    } finally {
      setSaving(false);
    }
  }

  const FormFields = () => (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Asset Tag
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.assetTag}
            onChange={(e) => setForm((f) => ({ ...f, assetTag: e.target.value }))}
            placeholder="AST-001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name *
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Asset name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="e.g. Production, Utilities"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="e.g. Building A, Floor 2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="OPERATIONAL">Operational</option>
            <option value="DOWN">Down</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="DECOMMISSIONED">Decommissioned</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Criticality
          </label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.criticality}
            onChange={(e) => setForm((f) => ({ ...f, criticality: e.target.value }))}
          >
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Manufacturer
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.manufacturer}
            onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))}
            placeholder="Manufacturer name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Model
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            placeholder="Model number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Serial Number
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.serialNumber}
            onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
            placeholder="Serial number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Install Date
          </label>
          <input
            type="date"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.installDate}
            onChange={(e) => setForm((f) => ({ ...f, installDate: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          rows={3}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Asset description..."
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Assets</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Asset register and equipment management
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Add Asset
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Assets',
              value: stats.total,
              icon: Server,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              label: 'Operational',
              value: stats.operational,
              icon: CheckCircle,
              color: 'text-green-600',
              bg: 'bg-green-50',
            },
            {
              label: 'Down',
              value: stats.down,
              icon: AlertCircle,
              color: 'text-red-600',
              bg: 'bg-red-50',
            },
            {
              label: 'In Maintenance',
              value: stats.maintenance,
              icon: Wrench,
              color: 'text-yellow-600',
              bg: 'bg-yellow-50',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label}>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                      <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${card.bg}`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-5">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  aria-label="Search assets..."
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="OPERATIONAL">Operational</option>
                <option value="DOWN">Down</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="DECOMMISSIONED">Decommissioned</option>
              </select>
              <select
                aria-label="Filter by criticality"
                value={criticalityFilter}
                onChange={(e) => setCriticalityFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Criticality</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-amber-600" />
              Assets ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Asset Tag
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Location
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Manufacturer / Model
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Criticality
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((asset) => (
                      <tr key={asset.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-gray-900 dark:text-gray-100">
                          {asset.assetTag}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                          {asset.name}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{asset.category}</td>
                        <td className="py-3 px-4 text-gray-600">{asset.location}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {[asset.manufacturer, asset.model].filter(Boolean).join(' / ') || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${criticalityColors[asset.criticality] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                          >
                            {asset.criticality}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[asset.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                          >
                            {asset.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(asset)}
                              className="text-gray-400 dark:text-gray-500 hover:text-amber-600 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDelete(asset)}
                              className="text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Server className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="font-medium">No assets found</p>
                <p className="text-sm mt-1">Add your first asset to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Asset" size="lg">
        <FormFields />
        <ModalFooter>
          <button
            onClick={() => setCreateOpen(false)}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Add Asset'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Asset" size="lg">
        <FormFields />
        <ModalFooter>
          <button
            onClick={() => setEditOpen(false)}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleEdit}
            disabled={saving}
            className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Asset"
        size="sm"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-red-100 rounded-full">
            <Ban className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to delete{' '}
              <span className="font-semibold">{selected?.name}</span>? This action cannot be undone.
            </p>
          </div>
        </div>
        <ModalFooter>
          <button
            onClick={() => setDeleteOpen(false)}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Deleting...' : 'Delete'}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
