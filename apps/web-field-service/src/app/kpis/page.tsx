'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface KPI {
  id: string;
  name?: string;
  metric?: string;
  category?: string;
  currentValue?: number;
  value?: number;
  target?: number;
  unit?: string;
  trend?: string;
  period?: string;
  description?: string;
  [key: string]: any;
}

const trendColors: Record<string, string> = {
  UP: 'bg-green-100 text-green-700',
  DOWN: 'bg-red-100 text-red-700',
  FLAT: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  STABLE: 'bg-blue-100 text-blue-700',
};

const emptyForm = {
  name: '',
  category: 'OPERATIONS',
  currentValue: '',
  target: '',
  unit: '%',
  trend: 'STABLE',
  period: 'MONTHLY',
  description: '',
};

const CATEGORIES = ['OPERATIONS', 'FINANCIAL', 'QUALITY', 'CUSTOMER', 'SAFETY', 'PRODUCTIVITY'];

export default function KPIsPage() {
  const [items, setItems] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<KPI | null>(null);
  const [deleteItem, setDeleteItem] = useState<KPI | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const r = await api.get('/kpis');
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
    const q = searchTerm.toLowerCase();
    return (
      (!q || JSON.stringify(i).toLowerCase().includes(q)) &&
      (!categoryFilter || i.category === categoryFilter)
    );
  });

  const onTarget = items.filter((i) => {
    const curr = Number(i.currentValue || i.value || 0);
    const tgt = Number(i.target || 0);
    return tgt > 0 && curr >= tgt;
  }).length;

  const stats = {
    total: items.length,
    onTarget,
    offTarget: items.length - onTarget,
    trending: items.filter((i) => i.trend === 'UP').length,
  };

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };
  const openEdit = (item: KPI) => {
    setEditItem(item);
    setForm({
      name: item.name || item.metric || '',
      category: item.category || 'OPERATIONS',
      currentValue: item.currentValue ?? item.value ?? '',
      target: item.target ?? '',
      unit: item.unit || '%',
      trend: item.trend || 'STABLE',
      period: item.period || 'MONTHLY',
      description: item.description || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      setError('KPI name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editItem) await api.put(`/kpis/${editItem.id}`, form);
      else await api.post('/kpis', form);
      setModalOpen(false);
      await load();
    } catch (e: any) {
      setError((e as any)?.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await api.delete(`/kpis/${deleteItem.id}`);
      setDeleteItem(null);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const getProgress = (current: number, target: number) => {
    if (!target) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };

  if (loading)
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </main>
      </div>
    );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">KPIs</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Key performance indicators and metrics tracking
              </p>
            </div>
            <button
              onClick={openCreate}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 flex items-center gap-2 font-medium"
            >
              <Plus className="h-5 w-5" /> Add KPI
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'Total KPIs',
                value: stats.total,
                icon: BarChart3,
                bg: 'bg-sky-50',
                color: 'text-sky-600',
                border: 'border-sky-200',
              },
              {
                label: 'On Target',
                value: stats.onTarget,
                icon: TrendingUp,
                bg: 'bg-green-50',
                color: 'text-green-600',
                border: 'border-green-200',
              },
              {
                label: 'Off Target',
                value: stats.offTarget,
                icon: TrendingDown,
                bg: 'bg-red-50',
                color: 'text-red-600',
                border: 'border-red-200',
              },
              {
                label: 'Trending Up',
                value: stats.trending,
                icon: TrendingUp,
                bg: 'bg-blue-50',
                color: 'text-blue-600',
                border: 'border-blue-200',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className={`border ${s.border}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                        <p className="text-2xl font-bold mt-1">{s.value}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${s.bg}`}>
                        <Icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                aria-label="Search KPIs..."
                placeholder="Search KPIs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <select
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* KPI Cards Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => {
                const curr = Number(item.currentValue ?? item.value ?? 0);
                const tgt = Number(item.target ?? 0);
                const progress = getProgress(curr, tgt);
                const onTgt = tgt > 0 && curr >= tgt;
                return (
                  <Card
                    key={item.id}
                    className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {item.name || item.metric}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {item.category} · {item.period || 'MONTHLY'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {item.trend === 'UP' && <TrendingUp className="h-4 w-4 text-green-500" />}
                          {item.trend === 'DOWN' && (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          {(!item.trend || item.trend === 'FLAT' || item.trend === 'STABLE') && (
                            <Minus className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-end justify-between mb-2">
                        <div>
                          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {curr}
                          </span>
                          <span className="text-sm text-gray-400 dark:text-gray-500 ml-1">
                            {item.unit || ''}
                          </span>
                        </div>
                        {tgt > 0 && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Target: {tgt}
                            {item.unit || ''}
                          </span>
                        )}
                      </div>
                      {tgt > 0 && (
                        <div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all ${onTgt ? 'bg-green-500' : progress > 75 ? 'bg-yellow-400' : 'bg-sky-500'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {progress}% of target
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${trendColors[item.trend || ''] || 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}
                        >
                          {item.trend || 'STABLE'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="text-sky-600 hover:text-sky-800 text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteItem(item)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-gray-400 dark:text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="font-medium">No KPIs found</p>
                <p className="text-sm mt-1">Add your first KPI to start tracking performance</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit KPI' : 'Add KPI'}
        size="lg"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                KPI Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. First-Time Fix Rate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Period
              </label>
              <select
                value={form.period}
                onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Value
              </label>
              <input
                type="number"
                value={form.currentValue}
                onChange={(e) => setForm((f) => ({ ...f, currentValue: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="0"
                step="any"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target
              </label>
              <input
                type="number"
                value={form.target}
                onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="0"
                step="any"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <input
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="%, hrs, $"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trend
              </label>
              <select
                value={form.trend}
                onChange={(e) => setForm((f) => ({ ...f, trend: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {['UP', 'DOWN', 'FLAT', 'STABLE'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="What this KPI measures..."
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : editItem ? 'Update KPI' : 'Add KPI'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete KPI" size="sm">
        <p className="text-sm text-gray-600">
          Delete <span className="font-semibold">{deleteItem?.name || deleteItem?.metric}</span>?
          This action cannot be undone.
        </p>
        <ModalFooter>
          <button
            onClick={() => setDeleteItem(null)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800"
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
