'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, ModalFooter, Input, Label, Select, Textarea } from '@ims/ui';
import { Leaf, Target, TrendingDown, Droplets, Trash2, Zap, Plus, BarChart3 } from 'lucide-react';
import { api } from '@/lib/api';

// ============================================
// Types
// ============================================

interface EsgSummary {
  year: number;
  ghg: { scope1: number; scope2: number; scope3: number; total: number; unit: string };
  energy: { total: number; unit: string };
  water: { total: number; unit: string };
  waste: { total: number; unit: string };
  intensityRatios: { carbonIntensity: number; waterIntensity: number };
  targets: { total: number; achieved: number; atRisk: number };
  metricEntries: number;
}

interface EsgTarget {
  id: string;
  refNumber: string;
  category: string;
  subcategory: string;
  description: string;
  baselineValue: number;
  baselineYear: number;
  targetValue: number;
  targetYear: number;
  currentValue: number | null;
  unit: string;
  status: string;
  notes?: string;
  progressPercent: number;
  createdAt: string;
}

interface EsgMetric {
  id: string;
  category: string;
  subcategory: string;
  period: string;
  value: number;
  unit: string;
  source?: string;
  verified: boolean;
  createdAt: string;
}

interface TrendPoint {
  period: string;
  [key: string]: string | number;
}

// ============================================
// Constants
// ============================================

const CATEGORIES = [
  { value: 'GHG_SCOPE_1', label: 'GHG Scope 1 (Direct)' },
  { value: 'GHG_SCOPE_2', label: 'GHG Scope 2 (Electricity)' },
  { value: 'GHG_SCOPE_3', label: 'GHG Scope 3 (Supply Chain)' },
  { value: 'ENERGY', label: 'Energy' },
  { value: 'WATER', label: 'Water' },
  { value: 'WASTE', label: 'Waste' },
  { value: 'BIODIVERSITY', label: 'Biodiversity' },
  { value: 'SOCIAL', label: 'Social' },
  { value: 'GOVERNANCE', label: 'Governance' },
];

const STATUS_COLORS: Record<string, string> = {
  ON_TRACK: 'bg-green-100 text-green-800',
  AT_RISK: 'bg-yellow-100 text-yellow-800',
  OFF_TRACK: 'bg-red-100 text-red-800',
  ACHIEVED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const CATEGORY_COLORS: Record<string, string> = {
  GHG_SCOPE_1: 'bg-red-100 text-red-800',
  GHG_SCOPE_2: 'bg-orange-100 text-orange-800',
  GHG_SCOPE_3: 'bg-amber-100 text-amber-800',
  ENERGY: 'bg-yellow-100 text-yellow-800',
  WATER: 'bg-blue-100 text-blue-800',
  WASTE: 'bg-purple-100 text-purple-800',
  BIODIVERSITY: 'bg-green-100 text-green-800',
  SOCIAL: 'bg-pink-100 text-pink-800',
  GOVERNANCE: 'bg-indigo-100 text-indigo-800',
};

// ============================================
// Component
// ============================================

export default function ESGDashboardClient() {
  const [activeTab, setActiveTab] = useState<'overview' | 'targets' | 'metrics'>('overview');
  const [summary, setSummary] = useState<EsgSummary | null>(null);
  const [targets, setTargets] = useState<EsgTarget[]>([]);
  const [metrics, setMetrics] = useState<EsgMetric[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Target modal
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetForm, setTargetForm] = useState({
    category: 'GHG_SCOPE_1',
    subcategory: '',
    description: '',
    baselineValue: '',
    baselineYear: String(new Date().getFullYear()),
    targetValue: '',
    targetYear: String(new Date().getFullYear() + 5),
    unit: 'tCO2e',
    notes: '',
  });

  // Metric modal
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [metricForm, setMetricForm] = useState({
    category: 'GHG_SCOPE_1',
    subcategory: '',
    period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    value: '',
    unit: 'tCO2e',
    source: '',
    notes: '',
  });

  // Filter state
  const [filterCategory, setFilterCategory] = useState('');

  // ============================================
  // Data fetching
  // ============================================

  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get('/esg/summary');
      setSummary(res.data.data || null);
    } catch { setSummary(null); }
  }, []);

  const fetchTargets = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (filterCategory) params.category = filterCategory;
      const res = await api.get('/esg/targets', { params });
      setTargets(res.data.data || []);
    } catch { setTargets([]); }
  }, [filterCategory]);

  const fetchMetrics = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (filterCategory) params.category = filterCategory;
      const res = await api.get('/esg/metrics', { params });
      setMetrics(res.data.data || []);
    } catch { setMetrics([]); }
  }, [filterCategory]);

  const fetchTrends = useCallback(async () => {
    try {
      const res = await api.get('/esg/trends?months=12');
      setTrends(res.data.data || []);
    } catch { setTrends([]); }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchSummary(), fetchTargets(), fetchMetrics(), fetchTrends()]).finally(() => setLoading(false));
  }, [fetchSummary, fetchTargets, fetchMetrics, fetchTrends]);

  // ============================================
  // Handlers
  // ============================================

  const handleCreateTarget = async () => {
    try {
      await api.post('/esg/targets', {
        ...targetForm,
        baselineValue: parseFloat(targetForm.baselineValue),
        baselineYear: parseInt(targetForm.baselineYear, 10),
        targetValue: parseFloat(targetForm.targetValue),
        targetYear: parseInt(targetForm.targetYear, 10),
      });
      setShowTargetModal(false);
      setTargetForm({
        category: 'GHG_SCOPE_1', subcategory: '', description: '',
        baselineValue: '', baselineYear: String(new Date().getFullYear()),
        targetValue: '', targetYear: String(new Date().getFullYear() + 5),
        unit: 'tCO2e', notes: '',
      });
      fetchTargets();
      fetchSummary();
    } catch (err) { console.error('Failed to create ESG target', err); }
  };

  const handleRecordMetric = async () => {
    try {
      await api.post('/esg/metrics', {
        ...metricForm,
        value: parseFloat(metricForm.value),
      });
      setShowMetricModal(false);
      setMetricForm({
        category: 'GHG_SCOPE_1', subcategory: '',
        period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
        value: '', unit: 'tCO2e', source: '', notes: '',
      });
      fetchMetrics();
      fetchSummary();
      fetchTrends();
    } catch (err) { console.error('Failed to record ESG metric', err); }
  };

  const formatNumber = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toFixed(1);
  };

  const getCategoryLabel = (val: string) => CATEGORIES.find(c => c.value === val)?.label ?? val.replace(/_/g, ' ');

  // ============================================
  // Render
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ESG / Sustainability Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">GRI/TCFD-aligned environmental, social and governance tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowMetricModal(true)}>
            <BarChart3 className="h-4 w-4 mr-2" /> Record Metric
          </Button>
          <Button onClick={() => setShowTargetModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Set Target
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total GHG</p>
                <p className="text-2xl font-bold">{summary ? formatNumber(summary.ghg.total) : '0'}</p>
                <p className="text-xs text-gray-400">tCO2e</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Energy</p>
                <p className="text-2xl font-bold">{summary ? formatNumber(summary.energy.total) : '0'}</p>
                <p className="text-xs text-gray-400">MWh</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Water</p>
                <p className="text-2xl font-bold">{summary ? formatNumber(summary.water.total) : '0'}</p>
                <p className="text-xs text-gray-400">m3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trash2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Waste</p>
                <p className="text-2xl font-bold">{summary ? formatNumber(summary.waste.total) : '0'}</p>
                <p className="text-xs text-gray-400">tonnes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GHG Scope Breakdown */}
      {summary && summary.ghg.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>GHG Emissions Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-500">Scope 1 (Direct)</p>
                <p className="text-xl font-bold text-red-700">{formatNumber(summary.ghg.scope1)}</p>
                <p className="text-xs text-gray-400">tCO2e</p>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.round((summary.ghg.scope1 / summary.ghg.total) * 100)}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round((summary.ghg.scope1 / summary.ghg.total) * 100)}%</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-500">Scope 2 (Electricity)</p>
                <p className="text-xl font-bold text-orange-700">{formatNumber(summary.ghg.scope2)}</p>
                <p className="text-xs text-gray-400">tCO2e</p>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.round((summary.ghg.scope2 / summary.ghg.total) * 100)}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round((summary.ghg.scope2 / summary.ghg.total) * 100)}%</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-gray-500">Scope 3 (Supply Chain)</p>
                <p className="text-xl font-bold text-amber-700">{formatNumber(summary.ghg.scope3)}</p>
                <p className="text-xs text-gray-400">tCO2e</p>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.round((summary.ghg.scope3 / summary.ghg.total) * 100)}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round((summary.ghg.scope3 / summary.ghg.total) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-t text-sm font-medium ${activeTab === 'overview' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Overview</button>
        <button onClick={() => setActiveTab('targets')} className={`px-4 py-2 rounded-t text-sm font-medium ${activeTab === 'targets' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Targets</button>
        <button onClick={() => setActiveTab('metrics')} className={`px-4 py-2 rounded-t text-sm font-medium ${activeTab === 'metrics' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Metrics</button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 items-center">
        <div className="w-64">
          <Select value={filterCategory} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends (Last 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              {trends.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No trend data available. Start recording ESG metrics to see trends.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 pr-4">Period</th>
                        <th className="pb-2 pr-4">Scope 1</th>
                        <th className="pb-2 pr-4">Scope 2</th>
                        <th className="pb-2 pr-4">Scope 3</th>
                        <th className="pb-2 pr-4">Energy</th>
                        <th className="pb-2 pr-4">Water</th>
                        <th className="pb-2">Waste</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trends.map(t => (
                        <tr key={t.period} className="border-b hover:bg-gray-50">
                          <td className="py-2 pr-4 font-mono text-xs">{t.period}</td>
                          <td className="py-2 pr-4">{typeof t.GHG_SCOPE_1 === 'number' ? t.GHG_SCOPE_1.toFixed(1) : '-'}</td>
                          <td className="py-2 pr-4">{typeof t.GHG_SCOPE_2 === 'number' ? t.GHG_SCOPE_2.toFixed(1) : '-'}</td>
                          <td className="py-2 pr-4">{typeof t.GHG_SCOPE_3 === 'number' ? t.GHG_SCOPE_3.toFixed(1) : '-'}</td>
                          <td className="py-2 pr-4">{typeof t.ENERGY === 'number' ? t.ENERGY.toFixed(1) : '-'}</td>
                          <td className="py-2 pr-4">{typeof t.WATER === 'number' ? t.WATER.toFixed(1) : '-'}</td>
                          <td className="py-2">{typeof t.WASTE === 'number' ? t.WASTE.toFixed(1) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Target Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Target Progress</CardTitle>
                <div className="flex gap-2 text-sm">
                  <span className="text-green-600 font-medium">{summary?.targets.achieved ?? 0} achieved</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-yellow-600 font-medium">{summary?.targets.atRisk ?? 0} at risk</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600 font-medium">{summary?.targets.total ?? 0} total</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {targets.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No ESG targets set. Click &quot;Set Target&quot; to get started.</p>
              ) : (
                <div className="space-y-4">
                  {targets.slice(0, 5).map(t => (
                    <div key={t.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-500">{t.refNumber}</span>
                          <Badge className={CATEGORY_COLORS[t.category] || 'bg-gray-100'}>{getCategoryLabel(t.category)}</Badge>
                          <Badge className={STATUS_COLORS[t.status] || 'bg-gray-100'}>{t.status.replace(/_/g, ' ')}</Badge>
                        </div>
                        <span className="text-sm font-medium">{t.progressPercent}%</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{t.description}</p>
                      <div className="bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${t.status === 'ACHIEVED' ? 'bg-blue-500' : t.status === 'AT_RISK' ? 'bg-yellow-500' : t.status === 'OFF_TRACK' ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(100, t.progressPercent)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Baseline: {t.baselineValue} {t.unit} ({t.baselineYear})</span>
                        <span>Current: {t.currentValue ?? '-'} {t.unit}</span>
                        <span>Target: {t.targetValue} {t.unit} ({t.targetYear})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Targets Tab */}
      {activeTab === 'targets' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ESG Targets</CardTitle>
              <Button onClick={() => setShowTargetModal(true)}><Plus className="h-4 w-4 mr-2" /> New Target</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <p className="text-gray-500 text-center py-8">Loading...</p> : targets.length === 0 ? <p className="text-gray-500 text-center py-8">No targets found.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 pr-4">Ref</th>
                      <th className="pb-2 pr-4">Category</th>
                      <th className="pb-2 pr-4">Description</th>
                      <th className="pb-2 pr-4">Baseline</th>
                      <th className="pb-2 pr-4">Target</th>
                      <th className="pb-2 pr-4">Current</th>
                      <th className="pb-2 pr-4">Progress</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {targets.map(t => (
                      <tr key={t.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 pr-4 font-mono text-xs">{t.refNumber}</td>
                        <td className="py-3 pr-4"><Badge className={CATEGORY_COLORS[t.category] || 'bg-gray-100 text-gray-800'}>{getCategoryLabel(t.category)}</Badge></td>
                        <td className="py-3 pr-4 max-w-xs truncate">{t.description}</td>
                        <td className="py-3 pr-4 text-right">{t.baselineValue} {t.unit}</td>
                        <td className="py-3 pr-4 text-right">{t.targetValue} {t.unit}</td>
                        <td className="py-3 pr-4 text-right">{t.currentValue ?? '-'} {t.unit}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${t.status === 'ACHIEVED' ? 'bg-blue-500' : t.status === 'OFF_TRACK' ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, t.progressPercent)}%` }} />
                            </div>
                            <span className="text-xs">{t.progressPercent}%</span>
                          </div>
                        </td>
                        <td className="py-3"><Badge className={STATUS_COLORS[t.status] || 'bg-gray-100'}>{t.status.replace(/_/g, ' ')}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ESG Metric Entries</CardTitle>
              <Button onClick={() => setShowMetricModal(true)}><Plus className="h-4 w-4 mr-2" /> Record Metric</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <p className="text-gray-500 text-center py-8">Loading...</p> : metrics.length === 0 ? <p className="text-gray-500 text-center py-8">No metrics recorded.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 pr-4">Period</th>
                      <th className="pb-2 pr-4">Category</th>
                      <th className="pb-2 pr-4">Subcategory</th>
                      <th className="pb-2 pr-4">Value</th>
                      <th className="pb-2 pr-4">Unit</th>
                      <th className="pb-2 pr-4">Source</th>
                      <th className="pb-2">Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map(m => (
                      <tr key={m.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 pr-4 font-mono text-xs">{m.period}</td>
                        <td className="py-3 pr-4"><Badge className={CATEGORY_COLORS[m.category] || 'bg-gray-100'}>{getCategoryLabel(m.category)}</Badge></td>
                        <td className="py-3 pr-4">{m.subcategory}</td>
                        <td className="py-3 pr-4 text-right font-medium">{m.value.toFixed(2)}</td>
                        <td className="py-3 pr-4 text-gray-500">{m.unit}</td>
                        <td className="py-3 pr-4 text-gray-500">{m.source || '-'}</td>
                        <td className="py-3">
                          {m.verified
                            ? <Badge className="bg-green-100 text-green-800">Verified</Badge>
                            : <Badge className="bg-gray-100 text-gray-600">Unverified</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Target Modal */}
      <Modal isOpen={showTargetModal} onClose={() => setShowTargetModal(false)} title="Set ESG Target" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Select value={targetForm.category} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTargetForm({ ...targetForm, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </div>
            <div>
              <Label>Subcategory *</Label>
              <Input value={targetForm.subcategory} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetForm({ ...targetForm, subcategory: e.target.value })} placeholder="e.g. Direct Fuel Combustion" />
            </div>
          </div>
          <div>
            <Label>Description *</Label>
            <Textarea rows={2} value={targetForm.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTargetForm({ ...targetForm, description: e.target.value })} placeholder="e.g. Reduce Scope 1 GHG emissions by 30% by 2030" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Baseline Value *</Label>
              <Input type="number" value={targetForm.baselineValue} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetForm({ ...targetForm, baselineValue: e.target.value })} />
            </div>
            <div>
              <Label>Baseline Year *</Label>
              <Input type="number" value={targetForm.baselineYear} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetForm({ ...targetForm, baselineYear: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Target Value *</Label>
              <Input type="number" value={targetForm.targetValue} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetForm({ ...targetForm, targetValue: e.target.value })} />
            </div>
            <div>
              <Label>Target Year *</Label>
              <Input type="number" value={targetForm.targetYear} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetForm({ ...targetForm, targetYear: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Unit *</Label>
              <Input value={targetForm.unit} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetForm({ ...targetForm, unit: e.target.value })} placeholder="tCO2e, MWh, m3, tonnes" />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea rows={2} value={targetForm.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTargetForm({ ...targetForm, notes: e.target.value })} />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowTargetModal(false)}>Cancel</Button>
          <Button
            onClick={handleCreateTarget}
            disabled={!targetForm.category || !targetForm.subcategory || !targetForm.description || !targetForm.baselineValue || !targetForm.targetValue || !targetForm.unit}
          >
            Create Target
          </Button>
        </ModalFooter>
      </Modal>

      {/* Record Metric Modal */}
      <Modal isOpen={showMetricModal} onClose={() => setShowMetricModal(false)} title="Record ESG Metric" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Select value={metricForm.category} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMetricForm({ ...metricForm, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </div>
            <div>
              <Label>Subcategory *</Label>
              <Input value={metricForm.subcategory} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetricForm({ ...metricForm, subcategory: e.target.value })} placeholder="e.g. Direct Fuel Combustion" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Period * (YYYY-MM)</Label>
              <Input value={metricForm.period} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetricForm({ ...metricForm, period: e.target.value })} placeholder="2026-02" />
            </div>
            <div>
              <Label>Value *</Label>
              <Input type="number" step="0.01" value={metricForm.value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetricForm({ ...metricForm, value: e.target.value })} />
            </div>
            <div>
              <Label>Unit *</Label>
              <Input value={metricForm.unit} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetricForm({ ...metricForm, unit: e.target.value })} placeholder="tCO2e, MWh, m3" />
            </div>
          </div>
          <div>
            <Label>Data Source</Label>
            <Input value={metricForm.source} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetricForm({ ...metricForm, source: e.target.value })} placeholder="e.g. Utility bill, Meter reading, Calculation" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea rows={2} value={metricForm.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMetricForm({ ...metricForm, notes: e.target.value })} />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowMetricModal(false)}>Cancel</Button>
          <Button
            onClick={handleRecordMetric}
            disabled={!metricForm.category || !metricForm.subcategory || !metricForm.period || !metricForm.value || !metricForm.unit}
          >
            Record Metric
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
