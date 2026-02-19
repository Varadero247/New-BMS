'use client';

import axios from 'axios';
import { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Modal,
  ModalFooter,
  Input,
  Label,
} from '@ims/ui';
import {
  TrendingUp,
  Target,
  DollarSign,
  Percent,
  ArrowUpRight,
  Calendar,
  User,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Deal {
  id: string;
  reference?: string;
  title: string;
  value: number;
  probability: number;
  stage: string;
  status: string;
  expectedCloseDate?: string;
  assignedTo?: string;
  accountName?: string;
  account?: { name: string };
}

interface ForecastEntry {
  id: string;
  dealId: string;
  dealTitle?: string;
  period: string;
  weightedValue: number;
  bestCase: number;
  worstCase: number;
  committed: boolean;
  notes?: string;
  createdAt: string;
}

interface ForecastData {
  items?: ForecastEntry[];
  deals?: Deal[];
  totalPipeline?: number;
  weightedForecast?: number;
  commitForecast?: number;
  bestCaseForecast?: number;
}

const STAGE_COLORS: Record<string, string> = {
  PROSPECTING: '#1E3A8A',
  QUALIFICATION: '#0EA5E9',
  PROPOSAL: '#8B5CF6',
  NEGOTIATION: '#F59E0B',
  CLOSED_WON: '#10B981',
  CLOSED_LOST: '#DC2626',
};

const STAGE_LABELS: Record<string, string> = {
  PROSPECTING: 'Prospecting',
  QUALIFICATION: 'Qualification',
  PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation',
  CLOSED_WON: 'Closed Won',
  CLOSED_LOST: 'Closed Lost',
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value.toFixed(0)}`;
}

function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
}

const initialFormState = {
  dealId: '',
  period: '',
  weightedValue: '',
  bestCase: '',
  worstCase: '',
  committed: false,
  notes: '',
};

export default function ForecastPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStage, setSelectedStage] = useState<string>('');
  const [sortBy, setSortBy] = useState<'value' | 'probability' | 'date'>('value');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [dealsRes, forecastRes] = await Promise.allSettled([
        api.get('/deals'),
        api.get('/forecast'),
      ]);

      if (dealsRes.status === 'fulfilled') {
        const rawDeals = dealsRes.value.data.data || [];
        setDeals(rawDeals.filter((d: Deal) => d.status === 'OPEN'));
      }

      if (forecastRes.status === 'fulfilled') {
        setForecastData(forecastRes.value.data.data || {});
      } else {
        setForecastData({});
      }

      setError(null);
    } catch {
      setError('Failed to load forecast data.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  function openCreateModal() {
    setFormData(initialFormState);
    setFormError('');
    setCreateModalOpen(true);
  }

  function openEditModal(item: ForecastEntry) {
    setFormData({
      dealId: item.dealId || '',
      period: item.period || '',
      weightedValue: String(item.weightedValue || ''),
      bestCase: String(item.bestCase || ''),
      worstCase: String(item.worstCase || ''),
      committed: item.committed || false,
      notes: item.notes || '',
    });
    setEditingId(item.id);
    setFormError('');
    setEditModalOpen(true);
  }

  async function handleCreate() {
    setFormError('');
    if (!formData.period.trim()) {
      setFormError('Period is required');
      return;
    }
    if (!formData.weightedValue) {
      setFormError('Weighted value is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        period: formData.period,
        weightedValue: parseFloat(formData.weightedValue) || 0,
        bestCase: parseFloat(formData.bestCase) || 0,
        worstCase: parseFloat(formData.worstCase) || 0,
        committed: formData.committed,
        notes: formData.notes || undefined,
      };
      if (formData.dealId) payload.dealId = formData.dealId;
      await api.post('/forecast', payload);
      setCreateModalOpen(false);
      loadAll();
    } catch (err) {
      setFormError((axios.isAxiosError(err) && err.response?.data?.error?.message) || 'Failed to create forecast entry.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    setFormError('');
    if (!formData.period.trim()) {
      setFormError('Period is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        period: formData.period,
        weightedValue: parseFloat(formData.weightedValue) || 0,
        bestCase: parseFloat(formData.bestCase) || 0,
        worstCase: parseFloat(formData.worstCase) || 0,
        committed: formData.committed,
        notes: formData.notes || undefined,
      };
      await api.put(`/forecast/${editingId}`, payload);
      setEditModalOpen(false);
      loadAll();
    } catch (err) {
      setFormError((axios.isAxiosError(err) && err.response?.data?.error?.message) || 'Failed to update forecast entry.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this forecast entry?')) return;
    try {
      await api.delete(`/forecast/${id}`);
      loadAll();
    } catch (err) {
      console.error('Error deleting forecast entry:', err);
    }
  }

  // Compute stats from live deals
  const openDeals = deals.filter((d) => d.status !== 'CLOSED_LOST');
  const totalPipeline =
    forecastData?.totalPipeline ?? openDeals.reduce((s, d) => s + (d.value || 0), 0);
  const weightedForecast =
    forecastData?.weightedForecast ??
    openDeals.reduce((s, d) => s + (d.value || 0) * ((d.probability || 0) / 100), 0);
  const commitForecast = forecastData?.commitForecast ?? 0;
  const bestCaseForecast =
    forecastData?.bestCaseForecast ?? openDeals.reduce((s, d) => s + (d.value || 0), 0);
  const avgDealSize = openDeals.length > 0 ? totalPipeline / openDeals.length : 0;

  // Pipeline funnel by stage
  const stageGroups = useMemo(() => {
    const groups: Record<string, { count: number; value: number }> = {};
    openDeals.forEach((d) => {
      if (!groups[d.stage]) groups[d.stage] = { count: 0, value: 0 };
      groups[d.stage].count++;
      groups[d.stage].value += d.value || 0;
    });
    return Object.entries(groups).sort((a, b) => {
      const order = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    });
  }, [openDeals]);

  // Monthly forecast from deals
  const monthlyData = useMemo(() => {
    const months: Record<string, { weighted: number; unweighted: number }> = {};
    openDeals.forEach((d) => {
      if (d.expectedCloseDate) {
        const date = new Date(d.expectedCloseDate);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (!months[key]) months[key] = { weighted: 0, unweighted: 0 };
        months[key].weighted += (d.value || 0) * ((d.probability || 0) / 100);
        months[key].unweighted += d.value || 0;
      }
    });
    return Object.entries(months)
      .sort(([a], [b]) => new Date(`01 ${a}`).getTime() - new Date(`01 ${b}`).getTime())
      .slice(0, 6)
      .map(([month, vals]) => ({ month, ...vals }));
  }, [openDeals]);

  // Filtered deal list
  const filteredDeals = useMemo(() => {
    let filtered = openDeals;
    if (selectedStage) filtered = filtered.filter((d) => d.stage === selectedStage);
    return filtered.sort((a, b) => {
      if (sortBy === 'probability') return (b.probability || 0) - (a.probability || 0);
      if (sortBy === 'date') {
        const aDate = a.expectedCloseDate ? new Date(a.expectedCloseDate).getTime() : Infinity;
        const bDate = b.expectedCloseDate ? new Date(b.expectedCloseDate).getTime() : Infinity;
        return aDate - bDate;
      }
      return (b.value || 0) - (a.value || 0);
    });
  }, [openDeals, selectedStage, sortBy]);

  const forecastItems = forecastData?.items || [];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const maxMonthly = Math.max(...monthlyData.map((m) => m.unweighted), 1);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Sales Forecast</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Pipeline analysis and revenue projection
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={loadAll} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button onClick={openCreateModal} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Forecast Entry
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Pipeline</p>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(totalPipeline)}
            </p>
            <div className="mt-1 flex items-center text-xs text-blue-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              {openDeals.length} open deals
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 border-l-4 border-violet-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Weighted Forecast
              </p>
              <TrendingUp className="h-4 w-4 text-violet-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(weightedForecast)}
            </p>
            <div className="mt-1 text-xs text-violet-600">
              {totalPipeline > 0 ? ((weightedForecast / totalPipeline) * 100).toFixed(0) : 0}% of
              pipeline
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Commit Forecast
              </p>
              <Target className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(commitForecast)}
            </p>
            <div className="mt-1 text-xs text-green-600">Committed deals</div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 border-l-4 border-amber-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Best Case</p>
              <ArrowUpRight className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(bestCaseForecast)}
            </p>
            <div className="mt-1 text-xs text-amber-600">Optimistic scenario</div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 border-l-4 border-cyan-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Avg Deal Size</p>
              <Percent className="h-4 w-4 text-cyan-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(avgDealSize)}
            </p>
            <div className="mt-1 text-xs text-cyan-600">Per open deal</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 6-Month Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Close Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <>
                  <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded bg-violet-500" /> Weighted
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded bg-gray-200" /> Unweighted
                    </span>
                  </div>
                  <div className="flex items-end gap-3 h-48">
                    {monthlyData.map((d) => (
                      <div
                        key={d.month}
                        className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
                      >
                        <div className="w-full flex gap-0.5 items-end flex-1">
                          <div
                            className="flex-1 bg-violet-500 rounded-t-sm"
                            style={{ height: `${(d.weighted / maxMonthly) * 100}%` }}
                            title={`Weighted: ${formatCurrencyFull(d.weighted)}`}
                          />
                          <div
                            className="flex-1 bg-gray-200 rounded-t-sm"
                            style={{ height: `${(d.unweighted / maxMonthly) * 100}%` }}
                            title={`Unweighted: ${formatCurrencyFull(d.unweighted)}`}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{d.month}</span>
                        <span className="text-xs text-violet-600 font-medium">
                          {formatCurrency(d.weighted)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
                  No deals with expected close dates found
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pipeline Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline by Stage</CardTitle>
            </CardHeader>
            <CardContent>
              {stageGroups.length > 0 ? (
                <div className="space-y-3">
                  {stageGroups.map(([stage, data], _index) => {
                    const maxCount = Math.max(...stageGroups.map(([, d]) => d.count), 1);
                    const pct = (data.count / maxCount) * 100;
                    const color = STAGE_COLORS[stage] || '#64748b';
                    return (
                      <div key={stage}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {STAGE_LABELS[stage] || stage}
                          </span>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {data.count} deals
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {formatCurrency(data.value)}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-6">
                          <div
                            className="h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: color }}
                          >
                            <span className="text-xs text-white font-medium">{data.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
                  No open deals in pipeline
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Forecast Entries (if API supports it) */}
        {forecastItems.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-violet-600" />
                Forecast Entries ({forecastItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Period
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Deal
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Weighted
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Best Case
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Worst Case
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Committed
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {item.period}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {item.dealTitle || item.dealId || '-'}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                          {formatCurrencyFull(item.weightedValue || 0)}
                        </td>
                        <td className="py-3 px-4 text-right text-green-700">
                          {formatCurrencyFull(item.bestCase || 0)}
                        </td>
                        <td className="py-3 px-4 text-right text-red-700">
                          {formatCurrencyFull(item.worstCase || 0)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            className={
                              item.committed
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                            }
                          >
                            {item.committed ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="text-gray-400 dark:text-gray-500 hover:text-violet-600"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-gray-400 dark:text-gray-500 hover:text-red-600"
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
            </CardContent>
          </Card>
        )}

        {/* Deals Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-violet-600" />
                Open Pipeline Deals ({filteredDeals.length})
              </CardTitle>
              <div className="flex items-center gap-3">
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Stages</option>
                  {Object.entries(STAGE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'value' | 'probability' | 'date')}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  <option value="value">Sort by Value</option>
                  <option value="probability">Sort by Probability</option>
                  <option value="date">Sort by Close Date</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredDeals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Deal
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Account
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Value
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Probability
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Weighted
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Stage
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Expected Close
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Owner
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeals.map((deal) => {
                      const weightedVal = (deal.value || 0) * ((deal.probability || 0) / 100);
                      const stageColor = STAGE_COLORS[deal.stage] || '#64748b';
                      return (
                        <tr key={deal.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            {deal.title}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {deal.account?.name || deal.accountName || '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrencyFull(deal.value || 0)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                                <div
                                  className="h-2 rounded-full bg-blue-500"
                                  style={{ width: `${deal.probability || 0}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-max">
                                {deal.probability || 0}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-violet-700">
                            {formatCurrencyFull(weightedVal)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: stageColor }}
                            >
                              {STAGE_LABELS[deal.stage] || deal.stage}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {deal.expectedCloseDate ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                {new Date(deal.expectedCloseDate).toLocaleDateString()}
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {deal.assignedTo ? (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                {deal.assignedTo}
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 dark:bg-gray-800 font-medium border-t-2 border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Totals</td>
                      <td />
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                        {formatCurrencyFull(filteredDeals.reduce((s, d) => s + (d.value || 0), 0))}
                      </td>
                      <td />
                      <td className="py-3 px-4 text-right text-violet-700">
                        {formatCurrencyFull(
                          filteredDeals.reduce(
                            (s, d) => s + (d.value || 0) * ((d.probability || 0) / 100),
                            0
                          )
                        )}
                      </td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No open deals in pipeline</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Forecast Entry Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Forecast Entry"
        size="lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="period">Period *</Label>
              <Input
                id="period"
                name="period"
                value={formData.period}
                onChange={handleChange}
                placeholder="e.g. Q1 2026 or Mar 2026"
              />
            </div>
            <div>
              <Label htmlFor="dealId">Deal (optional)</Label>
              <select
                id="dealId"
                name="dealId"
                value={formData.dealId}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500"
              >
                <option value="">-- No specific deal --</option>
                {deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({formatCurrency(d.value || 0)})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weightedValue">Weighted Value *</Label>
              <Input
                id="weightedValue"
                name="weightedValue"
                type="number"
                step="1000"
                value={formData.weightedValue}
                onChange={handleChange}
                placeholder="250000"
              />
            </div>
            <div>
              <Label htmlFor="bestCase">Best Case</Label>
              <Input
                id="bestCase"
                name="bestCase"
                type="number"
                step="1000"
                value={formData.bestCase}
                onChange={handleChange}
                placeholder="350000"
              />
            </div>
            <div>
              <Label htmlFor="worstCase">Worst Case</Label>
              <Input
                id="worstCase"
                name="worstCase"
                type="number"
                step="1000"
                value={formData.worstCase}
                onChange={handleChange}
                placeholder="150000"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="committed"
              name="committed"
              checked={formData.committed}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-violet-600"
            />
            <Label htmlFor="committed" className="cursor-pointer">
              Committed (high confidence)
            </Label>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional context..."
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Entry'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Forecast Entry Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Forecast Entry"
        size="lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div>
            <Label htmlFor="e-period">Period *</Label>
            <Input id="e-period" name="period" value={formData.period} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="e-weightedValue">Weighted Value *</Label>
              <Input
                id="e-weightedValue"
                name="weightedValue"
                type="number"
                step="1000"
                value={formData.weightedValue}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="e-bestCase">Best Case</Label>
              <Input
                id="e-bestCase"
                name="bestCase"
                type="number"
                step="1000"
                value={formData.bestCase}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="e-worstCase">Worst Case</Label>
              <Input
                id="e-worstCase"
                name="worstCase"
                type="number"
                step="1000"
                value={formData.worstCase}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="e-committed"
              name="committed"
              checked={formData.committed}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-violet-600"
            />
            <Label htmlFor="e-committed" className="cursor-pointer">
              Committed
            </Label>
          </div>
          <div>
            <Label htmlFor="e-notes">Notes</Label>
            <textarea
              id="e-notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
