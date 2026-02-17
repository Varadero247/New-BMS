'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
} from '@ims/ui';
import {
  Plus, Search, Loader2, Filter,
  AlertTriangle, Shield, FileText,
  ChevronLeft, Eye, BarChart3,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RiskManagementFile {
  id: string;
  referenceNumber: string;
  title: string;
  deviceName: string;
  deviceClass: string;
  intendedUse: string;
  riskPolicy: string;
  status: string;
  hazardCount: number;
  highRiskCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Hazard {
  id: string;
  hazardId: string;
  category: string;
  description: string;
  hazardousSituation: string;
  harm: string;
  severityBefore: number;
  probabilityBefore: number;
  riskLevelBefore: string;
  severityAfter: number | null;
  probabilityAfter: number | null;
  riskLevelAfter: string | null;
  controlsCount: number;
  controls: RiskControl[];
}

interface RiskControl {
  id: string;
  controlType: string;
  description: string;
  verificationMethod: string;
  verified: boolean;
}

interface BenefitRisk {
  overallRiskAcceptable: boolean;
  benefitRiskAcceptable: boolean;
  analysis: string;
}

interface RiskReport {
  totalHazards: number;
  hazardsByRiskLevel: Record<string, number>;
  controlsImplemented: number;
  residualRiskSummary: Record<string, number>;
  overallAcceptable: boolean;
}

interface RMFDetail extends RiskManagementFile {
  hazards: Hazard[];
  benefitRisk: BenefitRisk | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEVICE_CLASSES = ['I', 'II', 'III'] as const;

const RMF_STATUSES = ['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'APPROVED', 'CLOSED'] as const;

const HAZARD_CATEGORIES = [
  'ENERGY',
  'BIOLOGICAL',
  'CHEMICAL',
  'OPERATIONAL',
  'INFORMATION',
  'ENVIRONMENTAL',
  'ELECTROMAGNETIC',
  'MECHANICAL',
  'THERMAL',
  'RADIATION',
  'SOFTWARE',
  'USE_ERROR',
] as const;

const CONTROL_TYPES = [
  'INHERENT_SAFETY',
  'PROTECTIVE_MEASURE',
  'INFORMATION_FOR_SAFETY',
] as const;

const RISK_LEVELS = ['NEGLIGIBLE', 'LOW', 'MEDIUM', 'HIGH', 'UNACCEPTABLE'] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusBadgeVariant(status: string): 'secondary' | 'info' | 'warning' | 'success' | 'danger' | 'outline' {
  switch (status) {
    case 'DRAFT': return 'secondary';
    case 'ACTIVE': return 'info';
    case 'UNDER_REVIEW': return 'warning';
    case 'APPROVED': return 'success';
    case 'CLOSED': return 'danger';
    default: return 'outline';
  }
}

function getRiskBadgeVariant(level: string): 'secondary' | 'info' | 'warning' | 'success' | 'danger' | 'outline' {
  switch (level) {
    case 'NEGLIGIBLE': return 'secondary';
    case 'LOW': return 'success';
    case 'MEDIUM': return 'warning';
    case 'HIGH': return 'danger';
    case 'UNACCEPTABLE': return 'danger';
    default: return 'outline';
  }
}

function getRiskLevel(severity: number, probability: number): string {
  const score = severity * probability;
  if (score >= 15) return 'UNACCEPTABLE';
  if (score >= 10) return 'HIGH';
  if (score >= 5) return 'MEDIUM';
  if (score >= 2) return 'LOW';
  return 'NEGLIGIBLE';
}

function getRiskMatrixColor(severity: number, probability: number): string {
  const level = getRiskLevel(severity, probability);
  switch (level) {
    case 'NEGLIGIBLE': return 'bg-green-500 text-white';
    case 'LOW': return 'bg-green-300 text-green-900';
    case 'MEDIUM': return 'bg-yellow-400 text-yellow-900';
    case 'HIGH': return 'bg-orange-500 text-white';
    case 'UNACCEPTABLE': return 'bg-red-600 text-white';
    default: return 'bg-gray-200 text-gray-600';
  }
}

// ---------------------------------------------------------------------------
// Empty form states
// ---------------------------------------------------------------------------

const emptyRmfForm = {
  title: '',
  deviceName: '',
  deviceClass: 'I' as string,
  intendedUse: '',
  riskPolicy: '',
};

const emptyHazardForm = {
  category: 'ENERGY' as string,
  description: '',
  hazardousSituation: '',
  harm: '',
  severityBefore: 3,
  probabilityBefore: 3,
};

const emptyControlForm = {
  controlType: 'INHERENT_SAFETY' as string,
  description: '',
  verificationMethod: '',
};

const emptyBenefitRiskForm = {
  overallRiskAcceptable: false,
  benefitRiskAcceptable: false,
  analysis: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RiskManagementClient() {
  // View state
  const [view, setView] = useState<'list' | 'detail'>('list');

  // Data state
  const [riskFiles, setRiskFiles] = useState<RiskManagementFile[]>([]);
  const [selectedRmf, setSelectedRmf] = useState<RMFDetail | null>(null);
  const [riskReport, setRiskReport] = useState<RiskReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddHazardModal, setShowAddHazardModal] = useState(false);
  const [showHazardDetailModal, setShowHazardDetailModal] = useState(false);
  const [showAddControlModal, setShowAddControlModal] = useState(false);
  const [showBenefitRiskModal, setShowBenefitRiskModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Selected hazard for detail
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);

  // Form state
  const [rmfForm, setRmfForm] = useState(emptyRmfForm);
  const [hazardForm, setHazardForm] = useState(emptyHazardForm);
  const [controlForm, setControlForm] = useState(emptyControlForm);
  const [benefitRiskForm, setBenefitRiskForm] = useState(emptyBenefitRiskForm);

  // Common state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceNameFilter, setDeviceNameFilter] = useState('');

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchRiskFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/risk');
      setRiskFiles(response.data.data || []);
    } catch (err) {
      console.error('Failed to load risk files:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiskFiles();
  }, [fetchRiskFiles]);

  const fetchRmfDetail = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/risk/${id}`);
      setSelectedRmf(response.data.data);
    } catch (err) {
      console.error('Failed to load RMF detail:', err);
    }
  }, []);

  const fetchReport = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/risk/${id}/report`);
      setRiskReport(response.data.data);
      setShowReportModal(true);
    } catch (err) {
      console.error('Failed to load risk report:', err);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCreateRmf = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/risk', rmfForm);
      setShowCreateModal(false);
      setRmfForm(emptyRmfForm);
      fetchRiskFiles();
    } catch (err: unknown) {
      setError(err.response?.data?.message || 'Failed to create risk management file');
    } finally {
      setSubmitting(false);
    }
  }, [rmfForm, fetchRiskFiles]);

  const handleAddHazard = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRmf) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/risk/${selectedRmf.id}/hazards`, {
        ...hazardForm,
        severityBefore: Number(hazardForm.severityBefore),
        probabilityBefore: Number(hazardForm.probabilityBefore),
      });
      setShowAddHazardModal(false);
      setHazardForm(emptyHazardForm);
      fetchRmfDetail(selectedRmf.id);
    } catch (err: unknown) {
      setError(err.response?.data?.message || 'Failed to add hazard');
    } finally {
      setSubmitting(false);
    }
  }, [selectedRmf, hazardForm, fetchRmfDetail]);

  const handleAddControl = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRmf || !selectedHazard) return;
    setSubmitting(true);
    setError('');
    try {
      await api.put(`/risk/${selectedRmf.id}/hazards/${selectedHazard.id}`, {
        addControl: controlForm,
      });
      setShowAddControlModal(false);
      setControlForm(emptyControlForm);
      fetchRmfDetail(selectedRmf.id);
      // Refresh hazard detail
      const updatedRmf = await api.get(`/risk/${selectedRmf.id}`);
      const updatedHazard = (updatedRmf.data.data as RMFDetail).hazards.find(
        (h: Hazard) => h.id === selectedHazard.id
      );
      if (updatedHazard) setSelectedHazard(updatedHazard);
    } catch (err: unknown) {
      setError(err.response?.data?.message || 'Failed to add control');
    } finally {
      setSubmitting(false);
    }
  }, [selectedRmf, selectedHazard, controlForm, fetchRmfDetail]);

  const handleBenefitRisk = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRmf) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/risk/${selectedRmf.id}/benefit-risk`, benefitRiskForm);
      setShowBenefitRiskModal(false);
      fetchRmfDetail(selectedRmf.id);
    } catch (err: unknown) {
      setError(err.response?.data?.message || 'Failed to save benefit-risk analysis');
    } finally {
      setSubmitting(false);
    }
  }, [selectedRmf, benefitRiskForm, fetchRmfDetail]);

  const openDetail = useCallback(async (rmf: RiskManagementFile) => {
    await fetchRmfDetail(rmf.id);
    setView('detail');
  }, [fetchRmfDetail]);

  // ---------------------------------------------------------------------------
  // Filtered data
  // ---------------------------------------------------------------------------

  const filteredRiskFiles = useMemo(() => {
    return riskFiles.filter(rf => {
      if (statusFilter !== 'all' && rf.status !== statusFilter) return false;
      if (deviceNameFilter && !rf.deviceName?.toLowerCase().includes(deviceNameFilter.toLowerCase())) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !rf.title?.toLowerCase().includes(q) &&
          !rf.referenceNumber?.toLowerCase().includes(q) &&
          !rf.deviceName?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [riskFiles, statusFilter, deviceNameFilter, searchQuery]);

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const stats = useMemo(() => ({
    total: riskFiles.length,
    active: riskFiles.filter(rf => rf.status === 'ACTIVE' || rf.status === 'UNDER_REVIEW').length,
    totalHazards: riskFiles.reduce((sum, rf) => sum + (rf.hazardCount || 0), 0),
    highRiskCount: riskFiles.reduce((sum, rf) => sum + (rf.highRiskCount || 0), 0),
  }), [riskFiles]);

  // ---------------------------------------------------------------------------
  // Risk Matrix for detail view
  // ---------------------------------------------------------------------------

  const hazardMatrix = useMemo(() => {
    if (!selectedRmf?.hazards) return null;
    // Count hazards in each cell of the 5x5 matrix
    const matrix: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
    selectedRmf.hazards.forEach(h => {
      const sev = Math.min(Math.max(h.severityBefore, 1), 5);
      const prob = Math.min(Math.max(h.probabilityBefore, 1), 5);
      matrix[sev - 1][prob - 1]++;
    });
    return matrix;
  }, [selectedRmf]);

  // ---------------------------------------------------------------------------
  // Loading spinner
  // ---------------------------------------------------------------------------

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      <span className="ml-3 text-gray-500 dark:text-gray-400">Loading risk management files...</span>
    </div>
  );

  // ---------------------------------------------------------------------------
  // DETAIL VIEW
  // ---------------------------------------------------------------------------

  if (view === 'detail' && selectedRmf) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back navigation */}
          <button
            onClick={() => { setView('list'); setSelectedRmf(null); setSelectedHazard(null); }}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Risk Files
          </button>

          {/* RMF Info Card */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedRmf.title}</h1>
                    <Badge variant={getStatusBadgeVariant(selectedRmf.status)}>
                      {selectedRmf.status?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mb-2">{selectedRmf.referenceNumber}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Device: <strong>{selectedRmf.deviceName}</strong></span>
                    <Badge variant={selectedRmf.deviceClass === 'III' ? 'danger' : selectedRmf.deviceClass === 'II' ? 'warning' : 'info'}>
                      Class {selectedRmf.deviceClass}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fetchReport(selectedRmf.id)}
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Report
                  </Button>
                  <Button
                    onClick={() => {
                      setBenefitRiskForm(
                        selectedRmf.benefitRisk
                          ? {
                              overallRiskAcceptable: selectedRmf.benefitRisk.overallRiskAcceptable,
                              benefitRiskAcceptable: selectedRmf.benefitRisk.benefitRiskAcceptable,
                              analysis: selectedRmf.benefitRisk.analysis || '',
                            }
                          : emptyBenefitRiskForm
                      );
                      setError('');
                      setShowBenefitRiskModal(true);
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Benefit-Risk
                  </Button>
                </div>
              </div>

              {selectedRmf.intendedUse && (
                <div className="mt-4 bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-teal-700 uppercase mb-1">Intended Use</p>
                  <p className="text-sm text-teal-800">{selectedRmf.intendedUse}</p>
                </div>
              )}

              {selectedRmf.riskPolicy && (
                <div className="mt-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Risk Acceptability Policy</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedRmf.riskPolicy}</p>
                </div>
              )}

              {/* Benefit-Risk status */}
              {selectedRmf.benefitRisk && (
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Overall Risk:</span>
                    <Badge variant={selectedRmf.benefitRisk.overallRiskAcceptable ? 'success' : 'danger'}>
                      {selectedRmf.benefitRisk.overallRiskAcceptable ? 'Acceptable' : 'Not Acceptable'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Benefit-Risk:</span>
                    <Badge variant={selectedRmf.benefitRisk.benefitRiskAcceptable ? 'success' : 'danger'}>
                      {selectedRmf.benefitRisk.benefitRiskAcceptable ? 'Acceptable' : 'Not Acceptable'}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 5x5 Risk Matrix */}
          {hazardMatrix && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Risk Matrix (ISO 14971)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 text-xs text-gray-500 dark:text-gray-400 w-24"></th>
                        <th className="p-2 text-xs text-center text-gray-600 font-semibold" colSpan={5}>
                          Probability of Occurrence
                        </th>
                      </tr>
                      <tr>
                        <th className="p-2 text-xs text-gray-500 dark:text-gray-400"></th>
                        {[1, 2, 3, 4, 5].map(p => (
                          <th key={p} className="p-2 text-xs text-center text-gray-600 w-20">P{p}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[5, 4, 3, 2, 1].map(sev => (
                        <tr key={sev}>
                          <td className="p-2 text-xs text-gray-600 font-medium text-right pr-3">
                            S{sev} {sev === 5 ? '(Catastrophic)' : sev === 4 ? '(Critical)' : sev === 3 ? '(Serious)' : sev === 2 ? '(Minor)' : '(Negligible)'}
                          </td>
                          {[1, 2, 3, 4, 5].map(prob => {
                            const count = hazardMatrix[sev - 1][prob - 1];
                            return (
                              <td
                                key={prob}
                                className={`p-2 text-center text-sm font-bold border border-white rounded ${getRiskMatrixColor(sev, prob)}`}
                                style={{ minWidth: '60px', minHeight: '40px' }}
                              >
                                {count > 0 ? count : ''}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-green-500 inline-block"></span> Negligible</div>
                    <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-green-300 inline-block"></span> Low</div>
                    <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-yellow-400 inline-block"></span> Medium</div>
                    <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-orange-500 inline-block"></span> High</div>
                    <div className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-red-600 inline-block"></span> Unacceptable</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hazards Table */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Identified Hazards</CardTitle>
                <Button
                  onClick={() => { setHazardForm(emptyHazardForm); setError(''); setShowAddHazardModal(true); }}
                  className="bg-teal-600 hover:bg-teal-700"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Hazard
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {selectedRmf.hazards && selectedRmf.hazards.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Hazard ID</th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Category</th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Description</th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Harm</th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Sev</th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Prob</th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Risk Level</th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Controls</th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Residual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedRmf.hazards.map((hazard) => (
                        <tr
                          key={hazard.id}
                          className="hover:bg-gray-50 dark:bg-gray-800 transition-colors cursor-pointer"
                          onClick={() => { setSelectedHazard(hazard); setShowHazardDetailModal(true); }}
                        >
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono text-gray-600">{hazard.hazardId || '--'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline">{hazard.category?.replace(/_/g, ' ')}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">{hazard.description}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">{hazard.harm}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium">{hazard.severityBefore}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium">{hazard.probabilityBefore}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={getRiskBadgeVariant(hazard.riskLevelBefore)}>
                              {hazard.riskLevelBefore}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{hazard.controlsCount || hazard.controls?.length || 0}</span>
                          </td>
                          <td className="px-6 py-4">
                            {hazard.riskLevelAfter ? (
                              <Badge variant={getRiskBadgeVariant(hazard.riskLevelAfter)}>
                                {hazard.riskLevelAfter}
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-500">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No hazards identified yet.</p>
                  <Button
                    onClick={() => { setHazardForm(emptyHazardForm); setError(''); setShowAddHazardModal(true); }}
                    className="bg-teal-600 hover:bg-teal-700"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add First Hazard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ================================================================ */}
        {/* MODAL: Add Hazard                                               */}
        {/* ================================================================ */}
        <Modal
          isOpen={showAddHazardModal}
          onClose={() => setShowAddHazardModal(false)}
          title="Add Hazard"
          size="lg"
        >
          <form onSubmit={handleAddHazard}>
            <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="haz-category">Hazard Category *</Label>
                  <Select
                    id="haz-category"
                    value={hazardForm.category}
                    onChange={(e) => setHazardForm({ ...hazardForm, category: e.target.value })}
                  >
                    {HAZARD_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="haz-description">Hazard Description *</Label>
                  <Textarea
                    id="haz-description"
                    value={hazardForm.description}
                    onChange={(e) => setHazardForm({ ...hazardForm, description: e.target.value })}
                    rows={2}
                    required
                    placeholder="Describe the hazard"
                  />
                </div>
                <div>
                  <Label htmlFor="haz-situation">Hazardous Situation *</Label>
                  <Textarea
                    id="haz-situation"
                    value={hazardForm.hazardousSituation}
                    onChange={(e) => setHazardForm({ ...hazardForm, hazardousSituation: e.target.value })}
                    rows={2}
                    required
                    placeholder="Describe the foreseeable sequence of events leading to harm"
                  />
                </div>
                <div>
                  <Label htmlFor="haz-harm">Harm *</Label>
                  <Textarea
                    id="haz-harm"
                    value={hazardForm.harm}
                    onChange={(e) => setHazardForm({ ...hazardForm, harm: e.target.value })}
                    rows={2}
                    required
                    placeholder="Describe the resulting harm to patient/user"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="haz-severity">Severity Before Controls (1-5) *</Label>
                    <Select
                      id="haz-severity"
                      value={String(hazardForm.severityBefore)}
                      onChange={(e) => setHazardForm({ ...hazardForm, severityBefore: Number(e.target.value) })}
                    >
                      <option value="1">1 - Negligible</option>
                      <option value="2">2 - Minor</option>
                      <option value="3">3 - Serious</option>
                      <option value="4">4 - Critical</option>
                      <option value="5">5 - Catastrophic</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="haz-probability">Probability Before Controls (1-5) *</Label>
                    <Select
                      id="haz-probability"
                      value={String(hazardForm.probabilityBefore)}
                      onChange={(e) => setHazardForm({ ...hazardForm, probabilityBefore: Number(e.target.value) })}
                    >
                      <option value="1">1 - Improbable</option>
                      <option value="2">2 - Remote</option>
                      <option value="3">3 - Occasional</option>
                      <option value="4">4 - Probable</option>
                      <option value="5">5 - Frequent</option>
                    </Select>
                  </div>
                </div>

                {/* Preview risk level */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Estimated Risk Level:</span>
                  <Badge variant={getRiskBadgeVariant(getRiskLevel(hazardForm.severityBefore, hazardForm.probabilityBefore))}>
                    {getRiskLevel(hazardForm.severityBefore, hazardForm.probabilityBefore)}
                  </Badge>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    (Score: {hazardForm.severityBefore * hazardForm.probabilityBefore})
                  </span>
                </div>
              </div>
            </div>

            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddHazardModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Adding...</span>
                ) : 'Add Hazard'}
              </Button>
            </ModalFooter>
          </form>
        </Modal>

        {/* ================================================================ */}
        {/* MODAL: Hazard Detail                                            */}
        {/* ================================================================ */}
        <Modal
          isOpen={showHazardDetailModal}
          onClose={() => { setShowHazardDetailModal(false); setSelectedHazard(null); }}
          title={selectedHazard ? `Hazard: ${selectedHazard.hazardId}` : 'Hazard Details'}
          size="lg"
        >
          {selectedHazard && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline">{selectedHazard.category?.replace(/_/g, ' ')}</Badge>
                <Badge variant={getRiskBadgeVariant(selectedHazard.riskLevelBefore)}>
                  Initial: {selectedHazard.riskLevelBefore}
                </Badge>
                {selectedHazard.riskLevelAfter && (
                  <Badge variant={getRiskBadgeVariant(selectedHazard.riskLevelAfter)}>
                    Residual: {selectedHazard.riskLevelAfter}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Severity (Before)</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{selectedHazard.severityBefore} / 5</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Probability (Before)</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{selectedHazard.probabilityBefore} / 5</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Description</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{selectedHazard.description}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Hazardous Situation</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{selectedHazard.hazardousSituation}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Harm</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{selectedHazard.harm}</p>
              </div>

              {/* Risk Controls */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Risk Controls</h3>
                  <Button
                    size="sm"
                    onClick={() => { setControlForm(emptyControlForm); setError(''); setShowAddControlModal(true); }}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Control
                  </Button>
                </div>
                {selectedHazard.controls && selectedHazard.controls.length > 0 ? (
                  <div className="space-y-3">
                    {selectedHazard.controls.map((ctrl, idx) => (
                      <div key={ctrl.id || idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={
                            ctrl.controlType === 'INHERENT_SAFETY' ? 'success' :
                            ctrl.controlType === 'PROTECTIVE_MEASURE' ? 'warning' : 'info'
                          }>
                            {ctrl.controlType?.replace(/_/g, ' ')}
                          </Badge>
                          {ctrl.verified && <Badge variant="success">Verified</Badge>}
                        </div>
                        <p className="text-sm text-gray-800">{ctrl.description}</p>
                        {ctrl.verificationMethod && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Verification: {ctrl.verificationMethod}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No controls added yet.</p>
                )}
              </div>

              {/* Residual Risk */}
              {selectedHazard.severityAfter !== null && selectedHazard.probabilityAfter !== null && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-teal-700 uppercase mb-1">Residual Severity</p>
                    <p className="text-sm text-teal-900">{selectedHazard.severityAfter} / 5</p>
                  </div>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-teal-700 uppercase mb-1">Residual Probability</p>
                    <p className="text-sm text-teal-900">{selectedHazard.probabilityAfter} / 5</p>
                  </div>
                </div>
              )}

              <ModalFooter>
                <Button variant="outline" onClick={() => { setShowHazardDetailModal(false); setSelectedHazard(null); }}>
                  Close
                </Button>
              </ModalFooter>
            </div>
          )}
        </Modal>

        {/* ================================================================ */}
        {/* MODAL: Add Control                                              */}
        {/* ================================================================ */}
        <Modal
          isOpen={showAddControlModal}
          onClose={() => setShowAddControlModal(false)}
          title="Add Risk Control Measure"
          size="lg"
        >
          <form onSubmit={handleAddControl}>
            <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="ctrl-type">Control Type *</Label>
                  <Select
                    id="ctrl-type"
                    value={controlForm.controlType}
                    onChange={(e) => setControlForm({ ...controlForm, controlType: e.target.value })}
                  >
                    {CONTROL_TYPES.map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </Select>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {controlForm.controlType === 'INHERENT_SAFETY' && 'Eliminate or reduce the hazard by design (most preferred)'}
                    {controlForm.controlType === 'PROTECTIVE_MEASURE' && 'Add protective measures in the device or manufacturing process'}
                    {controlForm.controlType === 'INFORMATION_FOR_SAFETY' && 'Provide information for safety (labels, instructions, warnings)'}
                  </p>
                </div>
                <div>
                  <Label htmlFor="ctrl-description">Description *</Label>
                  <Textarea
                    id="ctrl-description"
                    value={controlForm.description}
                    onChange={(e) => setControlForm({ ...controlForm, description: e.target.value })}
                    rows={3}
                    required
                    placeholder="Describe the risk control measure"
                  />
                </div>
                <div>
                  <Label htmlFor="ctrl-verification">Verification Method *</Label>
                  <Textarea
                    id="ctrl-verification"
                    value={controlForm.verificationMethod}
                    onChange={(e) => setControlForm({ ...controlForm, verificationMethod: e.target.value })}
                    rows={2}
                    required
                    placeholder="How will this control be verified effective?"
                  />
                </div>
              </div>
            </div>

            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddControlModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Adding...</span>
                ) : 'Add Control'}
              </Button>
            </ModalFooter>
          </form>
        </Modal>

        {/* ================================================================ */}
        {/* MODAL: Benefit-Risk Analysis                                    */}
        {/* ================================================================ */}
        <Modal
          isOpen={showBenefitRiskModal}
          onClose={() => setShowBenefitRiskModal(false)}
          title="Benefit-Risk Analysis"
          size="lg"
        >
          <form onSubmit={handleBenefitRisk}>
            <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="br-overallRisk"
                      checked={benefitRiskForm.overallRiskAcceptable}
                      onChange={(e) => setBenefitRiskForm({ ...benefitRiskForm, overallRiskAcceptable: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <Label htmlFor="br-overallRisk">Overall Residual Risk is Acceptable</Label>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="br-benefitRisk"
                      checked={benefitRiskForm.benefitRiskAcceptable}
                      onChange={(e) => setBenefitRiskForm({ ...benefitRiskForm, benefitRiskAcceptable: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <Label htmlFor="br-benefitRisk">Benefits Outweigh Residual Risks</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="br-analysis">Analysis *</Label>
                  <Textarea
                    id="br-analysis"
                    value={benefitRiskForm.analysis}
                    onChange={(e) => setBenefitRiskForm({ ...benefitRiskForm, analysis: e.target.value })}
                    rows={6}
                    required
                    placeholder="Document the benefit-risk analysis rationale including clinical benefits, residual risks, and comparison with alternative treatments/devices..."
                  />
                </div>
              </div>
            </div>

            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setShowBenefitRiskModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Saving...</span>
                ) : 'Save Benefit-Risk Analysis'}
              </Button>
            </ModalFooter>
          </form>
        </Modal>

        {/* ================================================================ */}
        {/* MODAL: Risk Report                                              */}
        {/* ================================================================ */}
        <Modal
          isOpen={showReportModal}
          onClose={() => { setShowReportModal(false); setRiskReport(null); }}
          title="Risk Management Report"
          size="lg"
        >
          {riskReport ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Total Hazards</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{riskReport.totalHazards}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Controls Implemented</p>
                  <p className="text-2xl font-bold text-teal-600">{riskReport.controlsImplemented}</p>
                </div>
              </div>

              {riskReport.hazardsByRiskLevel && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Hazards by Initial Risk Level</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {Object.entries(riskReport.hazardsByRiskLevel).map(([level, count]) => (
                      <div key={level} className="flex items-center gap-2">
                        <Badge variant={getRiskBadgeVariant(level)}>{level}</Badge>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {riskReport.residualRiskSummary && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Residual Risk Summary</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {Object.entries(riskReport.residualRiskSummary).map(([level, count]) => (
                      <div key={level} className="flex items-center gap-2">
                        <Badge variant={getRiskBadgeVariant(level)}>{level}</Badge>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={`rounded-lg p-4 ${riskReport.overallAcceptable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`text-sm font-medium ${riskReport.overallAcceptable ? 'text-green-700' : 'text-red-700'}`}>
                  Overall Risk: {riskReport.overallAcceptable ? 'ACCEPTABLE' : 'NOT ACCEPTABLE'}
                </p>
              </div>

              <ModalFooter>
                <Button variant="outline" onClick={() => { setShowReportModal(false); setRiskReport(null); }}>Close</Button>
              </ModalFooter>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
              <span className="ml-2 text-gray-500 dark:text-gray-400">Loading report...</span>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // LIST VIEW
  // ---------------------------------------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Risk Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">ISO 14971 -- Application of Risk Management to Medical Devices</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Risk Files</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hazards Identified</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.totalHazards}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">High/Unacceptable</p>
                  <p className="text-3xl font-bold text-red-600">{stats.highRiskCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              aria-label="Search by title, reference, or device..." placeholder="Search by title, reference, or device..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {(statusFilter !== 'all' || deviceNameFilter) && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-700">Active</span>
            )}
          </Button>

          <Button
            onClick={() => { setRmfForm(emptyRmfForm); setError(''); setShowCreateModal(true); }}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            New Risk File
          </Button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Status</Label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40"
              >
                <option value="all">All Statuses</option>
                {RMF_STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Device Name</Label>
              <Input
                value={deviceNameFilter}
                onChange={(e) => setDeviceNameFilter(e.target.value)}
                placeholder="Filter by device..."
                className="w-48"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setStatusFilter('all'); setDeviceNameFilter(''); }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredRiskFiles.length} of {riskFiles.length} risk management files
          </p>
        </div>

        {/* Risk Files Table */}
        {loading ? <LoadingSpinner /> : filteredRiskFiles.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Ref #</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Title</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Device</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Class</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Hazards</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">High Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredRiskFiles.map((rf) => (
                      <tr
                        key={rf.id}
                        className="hover:bg-gray-50 dark:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => openDetail(rf)}
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-gray-600">{rf.referenceNumber || '--'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{rf.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{rf.deviceName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={rf.deviceClass === 'III' ? 'danger' : rf.deviceClass === 'II' ? 'warning' : 'info'}>
                            Class {rf.deviceClass}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusBadgeVariant(rf.status)}>
                            {rf.status?.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{rf.hazardCount || 0}</span>
                        </td>
                        <td className="px-6 py-4">
                          {(rf.highRiskCount || 0) > 0 ? (
                            <Badge variant="danger">{rf.highRiskCount}</Badge>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">0</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-16">
            <Shield className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No risk management files found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Create a risk management file to begin ISO 14971 risk analysis for a medical device.</p>
            <Button
              onClick={() => { setRmfForm(emptyRmfForm); setError(''); setShowCreateModal(true); }}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Risk File
            </Button>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL: Create Risk Management File                                   */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Risk Management File"
        size="lg"
      >
        <form onSubmit={handleCreateRmf}>
          <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Risk File Identification</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rmf-title">Title *</Label>
                  <Input
                    id="rmf-title"
                    value={rmfForm.title}
                    onChange={(e) => setRmfForm({ ...rmfForm, title: e.target.value })}
                    required
                    placeholder="e.g. Risk Management File - CardioMonitor Pro"
                  />
                </div>
                <div>
                  <Label htmlFor="rmf-deviceName">Device Name *</Label>
                  <Input
                    id="rmf-deviceName"
                    value={rmfForm.deviceName}
                    onChange={(e) => setRmfForm({ ...rmfForm, deviceName: e.target.value })}
                    required
                    placeholder="e.g. CardioMonitor Pro"
                  />
                </div>
                <div>
                  <Label htmlFor="rmf-deviceClass">Device Classification *</Label>
                  <Select
                    id="rmf-deviceClass"
                    value={rmfForm.deviceClass}
                    onChange={(e) => setRmfForm({ ...rmfForm, deviceClass: e.target.value })}
                  >
                    {DEVICE_CLASSES.map(cls => (
                      <option key={cls} value={cls}>
                        Class {cls} {cls === 'I' ? '(Low Risk)' : cls === 'II' ? '(Moderate Risk)' : '(High Risk)'}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Use & Policy</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rmf-intendedUse">Intended Use / Intended Purpose *</Label>
                  <Textarea
                    id="rmf-intendedUse"
                    value={rmfForm.intendedUse}
                    onChange={(e) => setRmfForm({ ...rmfForm, intendedUse: e.target.value })}
                    rows={3}
                    required
                    placeholder="Describe the medical purpose and conditions of use"
                  />
                </div>
                <div>
                  <Label htmlFor="rmf-riskPolicy">Risk Acceptability Policy</Label>
                  <Textarea
                    id="rmf-riskPolicy"
                    value={rmfForm.riskPolicy}
                    onChange={(e) => setRmfForm({ ...rmfForm, riskPolicy: e.target.value })}
                    rows={3}
                    placeholder="Define criteria for risk acceptability (e.g., ALARP, risk matrix thresholds)"
                  />
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating...</span>
              ) : 'Create Risk File'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
