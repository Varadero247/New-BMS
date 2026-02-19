'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import {
  Plus,
  Search,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertCircle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';

interface EnPI {
  id: string;
  name: string;
  description?: string;
  formula?: string;
  currentValue: number;
  baselineValue: number;
  targetValue?: number;
  unit: string;
  trend: string;
  status: string;
  category?: string;
  reportingFrequency?: string;
  responsible?: string;
}

const CATEGORIES = [
  'CONSUMPTION',
  'INTENSITY',
  'COST',
  'RENEWABLE',
  'EMISSION',
  'EFFICIENCY',
  'OTHER',
];
const TREND_OPTIONS = ['IMPROVING', 'STABLE', 'DECLINING'];
const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'NEEDS_REVIEW'];
const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'];

const trendConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  IMPROVING: { label: 'Improving', className: 'text-green-600', icon: TrendingDown },
  STABLE: { label: 'Stable', className: 'text-gray-500 dark:text-gray-400', icon: Minus },
  DECLINING: { label: 'Declining', className: 'text-red-600', icon: TrendingUp },
};

const empty: Partial<EnPI> = {
  name: '',
  description: '',
  formula: '',
  currentValue: 0,
  baselineValue: 0,
  targetValue: 0,
  unit: 'kWh/unit',
  trend: 'IMPROVING',
  status: 'ACTIVE',
  category: 'INTENSITY',
  reportingFrequency: 'MONTHLY',
};

export default function EnPIsPage() {
  const [items, setItems] = useState<EnPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTrend, setFilterTrend] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<EnPI>>(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const load = async () => {
    try {
      const r = await api.get('/enpis');
      setItems(r.data.data || []);
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
    const m = JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase());
    const ms = !filterStatus || i.status === filterStatus;
    const mt = !filterTrend || i.trend === filterTrend;
    return m && ms && mt;
  });

  const stats = {
    total: items.length,
    improving: items.filter((i) => i.trend === 'IMPROVING').length,
    onTarget: items.filter((i) => i.targetValue !== null && i.currentValue <= i.targetValue).length,
    declining: items.filter((i) => i.trend === 'DECLINING').length,
  };

  const openCreate = () => {
    setEditItem({ ...empty });
    setIsEditing(false);
    setModalOpen(true);
  };
  const openEdit = (item: EnPI) => {
    setEditItem({ ...item });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEditing && editItem.id) {
        await api.put(`/enpis/${editItem.id}`, editItem);
      } else {
        await api.post('/enpis', editItem);
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
      await api.delete(`/enpis/${deleteId}`);
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Energy Performance Indicators
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track EnPIs against baselines and targets (ISO 50001 §6.4)
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" /> Add EnPI
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total EnPIs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  <Activity className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Improving</p>
                  <p className="text-2xl font-bold text-green-700">{stats.improving}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <TrendingDown className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">On Target</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.onTarget}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Declining</p>
                  <p className="text-2xl font-bold text-red-700">{stats.declining}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
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
              aria-label="Search EnPIs..."
              placeholder="Search EnPIs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <select
            aria-label="Filter by trend"
            value={filterTrend}
            onChange={(e) => setFilterTrend(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">All Trends</option>
            {TREND_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-yellow-600" />
              EnPIs ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Category
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Current
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Baseline
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Target
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Trend
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Frequency
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => {
                      const tc = trendConfig[item.trend] || trendConfig.STABLE;
                      const TIcon = tc.icon;
                      const improvePct =
                        item.baselineValue > 0
                          ? Math.round(
                              ((item.baselineValue - item.currentValue) / item.baselineValue) * 100
                            )
                          : 0;
                      const onTarget =
                        item.targetValue !== null && item.currentValue <= item.targetValue;
                      return (
                        <tr key={item.id} className="border-b hover:bg-yellow-50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {item.name}
                            </p>
                            {item.formula && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                {item.formula}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                              {item.category || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`font-mono font-bold ${onTarget ? 'text-green-700' : 'text-gray-900 dark:text-gray-100'}`}
                            >
                              {item.currentValue}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                              {item.unit}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-gray-500 dark:text-gray-400">
                            {item.baselineValue}{' '}
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {item.unit}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-gray-500 dark:text-gray-400">
                            {item.targetValue ?? '-'}{' '}
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {item.unit}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`flex items-center gap-1 ${tc.className}`}>
                              <TIcon className="h-4 w-4" />
                              <span className="text-xs font-medium">{tc.label}</span>
                              {improvePct !== 0 && (
                                <span className="text-xs">
                                  ({improvePct > 0 ? '-' : '+'}
                                  {Math.abs(improvePct)}%)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                            {item.reportingFrequency || '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => openEdit(item)}
                                className="p-1.5 rounded hover:bg-yellow-100 text-yellow-700"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteId(item.id);
                                  setDeleteModal(true);
                                }}
                                className="p-1.5 rounded hover:bg-red-100 text-red-600"
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
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No EnPIs found</p>
                <p className="text-sm mt-1">
                  Add energy performance indicators to track improvement
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit EnPI' : 'Add Energy Performance Indicator'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                value={editItem.name || ''}
                onChange={(e) => setEditItem((p) => ({ ...p, name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="e.g. Energy Intensity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={editItem.category || 'INTENSITY'}
                onChange={(e) => setEditItem((p) => ({ ...p, category: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Formula / Definition
            </label>
            <input
              value={editItem.formula || ''}
              onChange={(e) => setEditItem((p) => ({ ...p, formula: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono"
              placeholder="e.g. Total kWh / Units produced"
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current
              </label>
              <input
                type="number"
                step="0.01"
                value={editItem.currentValue ?? ''}
                onChange={(e) =>
                  setEditItem((p) => ({ ...p, currentValue: Number(e.target.value) }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Baseline
              </label>
              <input
                type="number"
                step="0.01"
                value={editItem.baselineValue ?? ''}
                onChange={(e) =>
                  setEditItem((p) => ({ ...p, baselineValue: Number(e.target.value) }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target
              </label>
              <input
                type="number"
                step="0.01"
                value={editItem.targetValue ?? ''}
                onChange={(e) =>
                  setEditItem((p) => ({ ...p, targetValue: Number(e.target.value) }))
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <input
                value={editItem.unit || ''}
                onChange={(e) => setEditItem((p) => ({ ...p, unit: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trend
              </label>
              <select
                value={editItem.trend || 'IMPROVING'}
                onChange={(e) => setEditItem((p) => ({ ...p, trend: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {TREND_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reporting Frequency
              </label>
              <select
                value={editItem.reportingFrequency || 'MONTHLY'}
                onChange={(e) => setEditItem((p) => ({ ...p, reportingFrequency: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={editItem.status || 'ACTIVE'}
                onChange={(e) => setEditItem((p) => ({ ...p, status: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
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
            disabled={saving || !editItem.name}
            className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            )}
            {isEditing ? 'Save Changes' : 'Add EnPI'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete EnPI"
        size="sm"
      >
        <p className="text-gray-600 text-sm">Are you sure you want to delete this EnPI?</p>
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
