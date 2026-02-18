'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import {
  Plus,
  Search,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit2,
  Trash2,
  Zap,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Reading {
  id: string;
  meterId?: string;
  meterName?: string;
  value: number;
  unit: string;
  readingDate: string;
  status: string;
  readingType?: string;
  notes?: string;
  consumption?: number;
}

interface Meter {
  id: string;
  name: string;
  unit: string;
}

const STATUS_OPTIONS = ['PENDING', 'VERIFIED', 'FLAGGED', 'REJECTED'];
const READING_TYPES = ['MANUAL', 'AUTOMATIC', 'ESTIMATED', 'INVOICE'];

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> =
  {
    PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
    VERIFIED: { label: 'Verified', className: 'bg-green-100 text-green-700', icon: CheckCircle },
    FLAGGED: { label: 'Flagged', className: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
    REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700', icon: AlertTriangle },
  };

const empty: Partial<Reading> = {
  meterId: '',
  value: 0,
  unit: 'kWh',
  readingDate: new Date().toISOString().slice(0, 10),
  status: 'PENDING',
  readingType: 'MANUAL',
  notes: '',
};

export default function ReadingsPage() {
  const [items, setItems] = useState<Reading[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<Reading>>(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const load = async () => {
    try {
      const [r1, r2] = await Promise.all([
        api.get('/readings'),
        api.get('/meters').catch(() => ({ data: { data: [] } })),
      ]);
      setItems(r1.data.data || []);
      setMeters(r2.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((i) => {
    const match = JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase());
    const ms = !filterStatus || i.status === filterStatus;
    const mt = !filterType || i.readingType === filterType;
    return match && ms && mt;
  });

  const stats = {
    total: items.length,
    verified: items.filter((i) => i.status === 'VERIFIED').length,
    pending: items.filter((i) => i.status === 'PENDING').length,
    totalConsumption: items.reduce((s, i) => s + (Number(i.consumption || i.value) || 0), 0),
  };

  const openCreate = () => {
    setEditItem({ ...empty, readingDate: new Date().toISOString().slice(0, 10) });
    setIsEditing(false);
    setModalOpen(true);
  };
  const openEdit = (item: Reading) => {
    setEditItem({
      ...item,
      readingDate: item.readingDate ? new Date(item.readingDate).toISOString().slice(0, 10) : '',
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEditing && editItem.id) {
        await api.put(`/readings/${editItem.id}`, editItem);
      } else {
        await api.post('/readings', editItem);
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
      await api.delete(`/readings/${deleteId}`);
      setDeleteModal(false);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading)
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

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Meter Readings</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Log and verify energy consumption readings
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" /> Log Reading
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Readings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Verified</p>
                  <p className="text-2xl font-bold text-green-700">{stats.verified}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total kWh Logged</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {stats.totalConsumption.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search readings..."
              placeholder="Search readings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">All Types</option>
            {READING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-yellow-600" />
              Readings ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Meter
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Value
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => {
                      const sc = statusConfig[item.status] || statusConfig.PENDING;
                      const Icon = sc.icon;
                      return (
                        <tr key={item.id} className="border-b hover:bg-yellow-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            {item.meterName || item.meterId || '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-medium text-gray-900 dark:text-gray-100">
                            {Number(item.value).toLocaleString()}{' '}
                            <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">
                              {item.unit}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                              {item.readingType || 'MANUAL'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.readingDate
                              ? new Date(item.readingDate).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${sc.className}`}
                            >
                              <Icon className="h-3 w-3" />
                              {sc.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => openEdit(item)}
                                className="p-1.5 rounded hover:bg-yellow-100 text-yellow-700 transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteId(item.id);
                                  setDeleteModal(true);
                                }}
                                className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                              >
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
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No readings found</p>
                <p className="text-sm mt-1">
                  Log your first meter reading to start tracking consumption
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Reading' : 'Log New Reading'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meter *
              </label>
              <select
                value={editItem.meterId || ''}
                onChange={(e) => setEditItem((p) => ({ ...p, meterId: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select meter...</option>
                {meters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reading Value *
              </label>
              <input
                type="number"
                value={editItem.value || ''}
                onChange={(e) => setEditItem((p) => ({ ...p, value: Number(e.target.value) }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="e.g. 12543.5"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <input
                value={editItem.unit || ''}
                onChange={(e) => setEditItem((p) => ({ ...p, unit: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="kWh, therms, m³..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reading Date *
              </label>
              <input
                type="date"
                value={editItem.readingDate || ''}
                onChange={(e) => setEditItem((p) => ({ ...p, readingDate: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reading Type
              </label>
              <select
                value={editItem.readingType || 'MANUAL'}
                onChange={(e) => setEditItem((p) => ({ ...p, readingType: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {READING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={editItem.status || 'PENDING'}
                onChange={(e) => setEditItem((p) => ({ ...p, status: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={editItem.notes || ''}
              onChange={(e) => setEditItem((p) => ({ ...p, notes: e.target.value }))}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Optional notes..."
            />
          </div>
        </div>
        <ModalFooter>
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !editItem.meterId}
            className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            )}
            {isEditing ? 'Save Changes' : 'Log Reading'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Reading"
        size="sm"
      >
        <p className="text-gray-600 text-sm">
          Are you sure you want to delete this reading? This action cannot be undone.
        </p>
        <ModalFooter>
          <button
            onClick={() => setDeleteModal(false)}
            className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
