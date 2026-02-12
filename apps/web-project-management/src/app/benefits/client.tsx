'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, TrendingUp, DollarSign, Target, BarChart3, Search } from 'lucide-react';
import { Modal } from '@ims/ui';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BenefitMeasurement {
  id: string;
  benefitId: string;
  value: number;
  notes?: string;
  measuredAt: string;
  source?: string;
  measuredBy: string;
}

interface Benefit {
  id: string;
  refNumber: string;
  title: string;
  description?: string;
  type: string;
  projectId?: string;
  owner?: string;
  baselineValue?: number;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  measurementMethod: string;
  measurementSchedule?: string;
  expectedRealisationDate?: string;
  financialValue?: number;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  measurements?: BenefitMeasurement[];
}

interface DashboardData {
  total: number;
  realised: number;
  tracking: number;
  identified: number;
  realisationRate: number;
  byType: Record<string, number>;
  financialSummary: { totalExpected: number; totalRealised: number };
}

const TYPE_COLORS: Record<string, string> = {
  FINANCIAL: 'bg-green-100 text-green-800',
  STRATEGIC: 'bg-blue-100 text-blue-800',
  OPERATIONAL: 'bg-purple-100 text-purple-800',
  SOCIAL_ENVIRONMENTAL: 'bg-teal-100 text-teal-800',
};

const STATUS_COLORS: Record<string, string> = {
  IDENTIFIED: 'bg-gray-100 text-gray-800',
  BASELINED: 'bg-blue-100 text-blue-800',
  TRACKING: 'bg-yellow-100 text-yellow-800',
  REALISED: 'bg-green-100 text-green-800',
  PARTIALLY_REALISED: 'bg-orange-100 text-orange-800',
  NOT_REALISED: 'bg-red-100 text-red-800',
  CLOSED: 'bg-gray-100 text-gray-600',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '', description: '', type: 'FINANCIAL', owner: '',
    baselineValue: '', targetValue: '', unit: '',
    measurementMethod: 'QUANTITATIVE', measurementSchedule: '',
    expectedRealisationDate: '', financialValue: '', priority: 'MEDIUM',
  });

  // Detail modal
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Measurement modal
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [measurementForm, setMeasurementForm] = useState({
    value: '', notes: '', measuredAt: '', source: '',
  });

  const fetchBenefits = useCallback(async () => {
    try {
      const params: Record<string, string> = { limit: '50' };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (search) params.search = search;
      const res = await api.get('/benefits', { params });
      setBenefits(res.data.data.items || []);
    } catch {
      setBenefits([]);
    }
  }, [statusFilter, typeFilter, search]);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get('/benefits/dashboard');
      setDashboard(res.data.data);
    } catch {
      setDashboard(null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchBenefits(), fetchDashboard()]).finally(() => setLoading(false));
  }, [fetchBenefits, fetchDashboard]);

  const handleCreate = async () => {
    try {
      await api.post('/benefits', {
        ...createForm,
        baselineValue: createForm.baselineValue ? parseFloat(createForm.baselineValue) : undefined,
        targetValue: createForm.targetValue ? parseFloat(createForm.targetValue) : undefined,
        financialValue: createForm.financialValue ? parseFloat(createForm.financialValue) : undefined,
      });
      setShowCreateModal(false);
      setCreateForm({
        title: '', description: '', type: 'FINANCIAL', owner: '',
        baselineValue: '', targetValue: '', unit: '',
        measurementMethod: 'QUANTITATIVE', measurementSchedule: '',
        expectedRealisationDate: '', financialValue: '', priority: 'MEDIUM',
      });
      fetchBenefits();
      fetchDashboard();
    } catch (err) {
      console.error('Failed to create benefit', err);
    }
  };

  const handleViewDetail = async (benefit: Benefit) => {
    try {
      const res = await api.get(`/benefits/${benefit.id}`);
      setSelectedBenefit(res.data.data);
      setShowDetailModal(true);
    } catch {
      setSelectedBenefit(benefit);
      setShowDetailModal(true);
    }
  };

  const handleLogMeasurement = async () => {
    if (!selectedBenefit) return;
    try {
      await api.post(`/benefits/${selectedBenefit.id}/measurements`, {
        value: parseFloat(measurementForm.value),
        notes: measurementForm.notes || undefined,
        measuredAt: measurementForm.measuredAt || undefined,
        source: measurementForm.source || undefined,
      });
      setShowMeasurementModal(false);
      setMeasurementForm({ value: '', notes: '', measuredAt: '', source: '' });
      // Refresh detail
      const res = await api.get(`/benefits/${selectedBenefit.id}`);
      setSelectedBenefit(res.data.data);
      fetchBenefits();
      fetchDashboard();
    } catch (err) {
      console.error('Failed to log measurement', err);
    }
  };

  const handleDelete = async (benefitId: string) => {
    if (!confirm('Are you sure you want to delete this benefit?')) return;
    try {
      await api.delete(`/benefits/${benefitId}`);
      setShowDetailModal(false);
      fetchBenefits();
      fetchDashboard();
    } catch (err) {
      console.error('Failed to delete benefit', err);
    }
  };

  const formatCurrency = (v?: number) => v != null ? `$${v.toLocaleString()}` : '-';
  const getProgress = (b: Benefit) => {
    if (!b.baselineValue || !b.targetValue || !b.currentValue) return 0;
    const total = Math.abs(b.targetValue - b.baselineValue);
    if (total === 0) return 100;
    const achieved = Math.abs(b.currentValue - b.baselineValue);
    return Math.min(100, Math.round((achieved / total) * 100));
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Benefits Realisation
            </h1>
            <p className="text-gray-500 text-sm mt-1">ISO 21502 -- Track and measure project benefits</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Benefit
          </button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Target className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Total Benefits</p>
                <p className="text-2xl font-bold">{dashboard?.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Realisation Rate</p>
                <p className="text-2xl font-bold">{dashboard?.realisationRate || 0}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Expected Value</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboard?.financialSummary.totalExpected)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><BarChart3 className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Realised Value</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboard?.financialSummary.totalRealised)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex gap-2 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search benefits..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="IDENTIFIED">Identified</option>
              <option value="BASELINED">Baselined</option>
              <option value="TRACKING">Tracking</option>
              <option value="REALISED">Realised</option>
              <option value="PARTIALLY_REALISED">Partially Realised</option>
              <option value="NOT_REALISED">Not Realised</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="FINANCIAL">Financial</option>
              <option value="STRATEGIC">Strategic</option>
              <option value="OPERATIONAL">Operational</option>
              <option value="SOCIAL_ENVIRONMENTAL">Social/Environmental</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {benefits.map((benefit) => (
                  <tr key={benefit.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetail(benefit)}>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{benefit.refNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{benefit.title}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${TYPE_COLORS[benefit.type] || 'bg-gray-100'}`}>
                        {benefit.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[benefit.status] || 'bg-gray-100'}`}>
                        {benefit.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{ width: `${getProgress(benefit)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{getProgress(benefit)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {benefit.targetValue != null ? `${benefit.targetValue} ${benefit.unit || ''}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {benefit.currentValue != null ? `${benefit.currentValue} ${benefit.unit || ''}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${PRIORITY_COLORS[benefit.priority] || 'bg-gray-100'}`}>
                        {benefit.priority}
                      </span>
                    </td>
                  </tr>
                ))}
                {benefits.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No benefits found. Create your first benefit.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CREATE MODAL */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Benefit" size="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FINANCIAL">Financial</option>
                  <option value="STRATEGIC">Strategic</option>
                  <option value="OPERATIONAL">Operational</option>
                  <option value="SOCIAL_ENVIRONMENTAL">Social/Environmental</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                <input type="text" value={createForm.owner} onChange={(e) => setCreateForm({ ...createForm, owner: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input type="text" value={createForm.unit} onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })} placeholder="e.g., USD, NPS, %" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baseline Value</label>
                <input type="number" step="any" value={createForm.baselineValue} onChange={(e) => setCreateForm({ ...createForm, baselineValue: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
                <input type="number" step="any" value={createForm.targetValue} onChange={(e) => setCreateForm({ ...createForm, targetValue: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Financial Value</label>
                <input type="number" step="any" value={createForm.financialValue} onChange={(e) => setCreateForm({ ...createForm, financialValue: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Realisation Date</label>
                <input type="date" value={createForm.expectedRealisationDate} onChange={(e) => setCreateForm({ ...createForm, expectedRealisationDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={2} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button onClick={handleCreate} disabled={!createForm.title || !createForm.type} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Create Benefit</button>
          </div>
        </Modal>

        {/* DETAIL MODAL */}
        <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedBenefit ? `${selectedBenefit.refNumber} -- ${selectedBenefit.title}` : 'Benefit Details'} size="lg">
          {selectedBenefit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Type:</span> <span className={`px-2 py-0.5 rounded-full text-xs ${TYPE_COLORS[selectedBenefit.type] || ''}`}>{selectedBenefit.type.replace(/_/g, ' ')}</span></div>
                <div><span className="text-gray-500">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[selectedBenefit.status] || ''}`}>{selectedBenefit.status.replace(/_/g, ' ')}</span></div>
                <div><span className="text-gray-500">Owner:</span> <span className="font-medium">{selectedBenefit.owner || '-'}</span></div>
                <div><span className="text-gray-500">Priority:</span> <span className={`px-2 py-0.5 rounded-full text-xs ${PRIORITY_COLORS[selectedBenefit.priority] || ''}`}>{selectedBenefit.priority}</span></div>
                <div><span className="text-gray-500">Baseline:</span> <span className="font-medium">{selectedBenefit.baselineValue ?? '-'} {selectedBenefit.unit || ''}</span></div>
                <div><span className="text-gray-500">Target:</span> <span className="font-medium">{selectedBenefit.targetValue ?? '-'} {selectedBenefit.unit || ''}</span></div>
                <div><span className="text-gray-500">Current:</span> <span className="font-bold text-blue-600">{selectedBenefit.currentValue ?? '-'} {selectedBenefit.unit || ''}</span></div>
                <div><span className="text-gray-500">Financial Value:</span> <span className="font-medium">{formatCurrency(selectedBenefit.financialValue)}</span></div>
              </div>

              {selectedBenefit.description && (
                <div>
                  <span className="text-gray-500 text-sm">Description:</span>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{selectedBenefit.description}</p>
                </div>
              )}

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress toward target</span>
                  <span>{getProgress(selectedBenefit)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full">
                  <div className="h-3 bg-blue-600 rounded-full transition-all" style={{ width: `${getProgress(selectedBenefit)}%` }} />
                </div>
              </div>

              {/* Measurements */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Measurement History</h3>
                  <button
                    onClick={() => setShowMeasurementModal(true)}
                    className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Log Measurement
                  </button>
                </div>
                {selectedBenefit.measurements && selectedBenefit.measurements.length > 0 ? (
                  <div className="space-y-2">
                    {selectedBenefit.measurements.map(m => (
                      <div key={m.id} className="flex items-center justify-between border rounded p-2 text-sm">
                        <div>
                          <span className="font-medium">{m.value} {selectedBenefit.unit || ''}</span>
                          {m.notes && <span className="text-gray-500 ml-2">-- {m.notes}</span>}
                        </div>
                        <span className="text-xs text-gray-400">{new Date(m.measuredAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No measurements recorded yet.</p>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button onClick={() => handleDelete(selectedBenefit.id)} className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
              </div>
            </div>
          )}
        </Modal>

        {/* MEASUREMENT MODAL */}
        <Modal isOpen={showMeasurementModal} onClose={() => setShowMeasurementModal(false)} title="Log Measurement" size="md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
              <input type="number" step="any" value={measurementForm.value} onChange={(e) => setMeasurementForm({ ...measurementForm, value: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={measurementForm.measuredAt} onChange={(e) => setMeasurementForm({ ...measurementForm, measuredAt: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <input type="text" value={measurementForm.source} onChange={(e) => setMeasurementForm({ ...measurementForm, source: e.target.value })} placeholder="e.g., Finance Report Q1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea rows={2} value={measurementForm.notes} onChange={(e) => setMeasurementForm({ ...measurementForm, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setShowMeasurementModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button onClick={handleLogMeasurement} disabled={!measurementForm.value} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Log Measurement</button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
