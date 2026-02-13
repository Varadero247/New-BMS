'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter } from '@ims/ui';
import { Server, Plus, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface Asset {
  id: string;
  referenceNumber: string;
  name: string;
  type: string;
  classification: string;
  owner: string;
  format: string;
  encryptionRequired: boolean;
  status: string;
  createdAt: string;
}

const classificationColors: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

const assetTypes = ['HARDWARE', 'SOFTWARE', 'DATA', 'NETWORK', 'PERSONNEL', 'FACILITY', 'SERVICE'];
const classifications = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'HARDWARE',
    classification: 'MEDIUM',
    owner: '',
    format: '',
    encryptionRequired: false,
  });

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    try {
      setError(null);
      const res = await api.get('/assets');
      setAssets(res.data.data || []);
    } catch (err) {
      console.error('Error loading assets:', err);
      setError('Failed to load assets.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingAsset(null);
    setForm({ name: '', type: 'HARDWARE', classification: 'MEDIUM', owner: '', format: '', encryptionRequired: false });
    setModalOpen(true);
  }

  function openEditModal(asset: Asset) {
    setEditingAsset(asset);
    setForm({
      name: asset.name,
      type: asset.type,
      classification: asset.classification,
      owner: asset.owner,
      format: asset.format,
      encryptionRequired: asset.encryptionRequired,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingAsset) {
        await api.put(`/assets/${editingAsset.id}`, form);
      } else {
        await api.post('/assets', form);
      }
      setModalOpen(false);
      loadAssets();
    } catch (err) {
      console.error('Error saving asset:', err);
    } finally {
      setSaving(false);
    }
  }

  const filtered = assets.filter(a => {
    if (typeFilter && a.type !== typeFilter) return false;
    if (classFilter && a.classification !== classFilter) return false;
    if (searchTerm && !a.name.toLowerCase().includes(searchTerm.toLowerCase()) && !a.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false;
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
            <h1 className="text-3xl font-bold text-gray-900">Asset Register</h1>
            <p className="text-gray-500 mt-1">Information assets inventory</p>
          </div>
          <Button onClick={openCreateModal} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4" /> Add Asset
          </Button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search assets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">All Types</option>
                {assetTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">All Classifications</option>
                {classifications.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Ref</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Classification</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Owner</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Format</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Encryption</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((asset) => (
                      <tr key={asset.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-xs text-gray-600">{asset.referenceNumber}</td>
                        <td className="py-3 px-4 text-gray-900 font-medium">{asset.name}</td>
                        <td className="py-3 px-4 text-gray-600">{asset.type}</td>
                        <td className="py-3 px-4">
                          <Badge className={classificationColors[asset.classification] || 'bg-gray-100 text-gray-700'}>{asset.classification}</Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{asset.owner}</td>
                        <td className="py-3 px-4 text-gray-600">{asset.format}</td>
                        <td className="py-3 px-4">
                          {asset.encryptionRequired ? (
                            <Badge className="bg-teal-100 text-teal-700">Required</Badge>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button onClick={() => openEditModal(asset)} className="text-teal-600 hover:text-teal-700 text-sm font-medium">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No assets found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingAsset ? 'Edit Asset' : 'Add Asset'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                {assetTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
              <select value={form.classification} onChange={(e) => setForm({ ...form, classification: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                {classifications.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input type="text" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <input type="text" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g., Digital, Physical, Cloud" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="encryption" checked={form.encryptionRequired} onChange={(e) => setForm({ ...form, encryptionRequired: e.target.checked })} className="rounded text-teal-600 focus:ring-teal-500" />
            <label htmlFor="encryption" className="text-sm text-gray-700">Encryption Required</label>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? 'Saving...' : editingAsset ? 'Update Asset' : 'Create Asset'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
