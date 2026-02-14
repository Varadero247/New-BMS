'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter, Badge } from '@ims/ui';
import { Plus, Search, Gauge, Wifi, WifiOff, Wrench, AlertTriangle, CheckCircle, Edit2, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';

interface Meter {
  id: string;
  name: string;
  meterType: string;
  location: string;
  unit: string;
  status: string;
  serialNumber?: string;
  installDate?: string;
  lastReading?: number;
  lastReadingDate?: string;
  description?: string;
}

const METER_TYPES = ['ELECTRICITY', 'GAS', 'WATER', 'HEAT', 'COMPRESSED_AIR', 'FUEL_OIL', 'STEAM', 'OTHER'];
const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'FAULT', 'MAINTENANCE', 'DECOMMISSIONED'];

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  INACTIVE: { label: 'Inactive', className: 'bg-gray-100 text-gray-600', icon: WifiOff },
  FAULT: { label: 'Fault', className: 'bg-red-100 text-red-700', icon: AlertTriangle },
  MAINTENANCE: { label: 'Maintenance', className: 'bg-yellow-100 text-yellow-700', icon: Wrench },
  DECOMMISSIONED: { label: 'Decommissioned', className: 'bg-gray-100 text-gray-500', icon: X },
};

const typeColors: Record<string, string> = {
  ELECTRICITY: 'bg-blue-100 text-blue-700',
  GAS: 'bg-orange-100 text-orange-700',
  WATER: 'bg-cyan-100 text-cyan-700',
  HEAT: 'bg-red-100 text-red-700',
  COMPRESSED_AIR: 'bg-purple-100 text-purple-700',
  FUEL_OIL: 'bg-gray-100 text-gray-700',
  STEAM: 'bg-indigo-100 text-indigo-700',
  OTHER: 'bg-slate-100 text-slate-700',
};

const empty: Partial<Meter> = { name: '', meterType: 'ELECTRICITY', location: '', unit: 'kWh', status: 'ACTIVE', serialNumber: '', description: '' };

export default function MetersPage() {
  const [items, setItems] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<Meter>>(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const load = async () => {
    try {
      const r = await api.get('/meters');
      setItems(r.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    const matchSearch = JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filterStatus || i.status === filterStatus;
    const matchType = !filterType || i.meterType === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    total: items.length,
    active: items.filter(i => i.status === 'ACTIVE').length,
    fault: items.filter(i => i.status === 'FAULT').length,
    maintenance: items.filter(i => i.status === 'MAINTENANCE').length,
  };

  const openCreate = () => { setEditItem(empty); setIsEditing(false); setModalOpen(true); };
  const openEdit = (item: Meter) => { setEditItem({ ...item }); setIsEditing(true); setModalOpen(true); };
  const openDelete = (id: string) => { setDeleteId(id); setDeleteModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEditing && editItem.id) {
        await api.put(`/meters/${editItem.id}`, editItem);
      } else {
        await api.post('/meters', editItem);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/meters/${deleteId}`);
      setDeleteModal(false);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <div className="p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div>
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Energy Meters</h1>
            <p className="text-gray-500 mt-1">Manage energy metering infrastructure</p>
          </div>
          <button onClick={openCreate} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors">
            <Plus className="h-5 w-5" /> Add Meter
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Meters</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full"><Gauge className="h-6 w-6 text-yellow-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-700">{stats.active}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full"><Wifi className="h-6 w-6 text-green-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Faults</p>
                  <p className="text-2xl font-bold text-red-700">{stats.fault}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-full"><AlertTriangle className="h-6 w-6 text-red-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Maintenance</p>
                  <p className="text-2xl font-bold text-yellow-700">{stats.maintenance}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full"><Wrench className="h-6 w-6 text-yellow-600" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search meters..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
            <option value="">All Types</option>
            {METER_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-yellow-600" />
              Meters ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Unit</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Serial No.</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => {
                      const sc = statusConfig[item.status] || statusConfig.INACTIVE;
                      const Icon = sc.icon;
                      return (
                        <tr key={item.id} className="border-b hover:bg-yellow-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${typeColors[item.meterType] || 'bg-gray-100 text-gray-700'}`}>
                              {item.meterType?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.location || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.unit || '-'}</td>
                          <td className="py-3 px-4 text-gray-500 font-mono text-xs">{item.serialNumber || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${sc.className}`}>
                              <Icon className="h-3 w-3" />{sc.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-yellow-100 text-yellow-700 transition-colors" title="Edit">
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button onClick={() => openDelete(item.id)} className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Gauge className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No meters found</p>
                <p className="text-sm mt-1">Add your first meter to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit Meter' : 'Add New Meter'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input value={editItem.name || ''} onChange={e => setEditItem(p => ({ ...p, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="e.g. Main Electricity Meter" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meter Type *</label>
              <select value={editItem.meterType || 'ELECTRICITY'} onChange={e => setEditItem(p => ({ ...p, meterType: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {METER_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input value={editItem.location || ''} onChange={e => setEditItem(p => ({ ...p, location: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="e.g. Building A, Level 2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input value={editItem.unit || ''} onChange={e => setEditItem(p => ({ ...p, unit: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="kWh, therms, m³..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
              <input value={editItem.serialNumber || ''} onChange={e => setEditItem(p => ({ ...p, serialNumber: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Meter serial number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={editItem.status || 'ACTIVE'} onChange={e => setEditItem(p => ({ ...p, status: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={editItem.description || ''} onChange={e => setEditItem(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Optional notes about this meter..." />
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving || !editItem.name} className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {saving && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
            {isEditing ? 'Save Changes' : 'Add Meter'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Meter" size="sm">
        <p className="text-gray-600 text-sm">Are you sure you want to delete this meter? This action cannot be undone and will remove all associated readings.</p>
        <ModalFooter>
          <button onClick={() => setDeleteModal(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete Meter</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
