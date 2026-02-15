'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
} from '@ims/ui';
import {
  Plus, Search, Loader2, Filter,
  MessageSquare, AlertTriangle, FileWarning,
  CheckCircle2, Clock, XCircle,
  ChevronLeft, BarChart3,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Complaint {
  id: string;
  referenceNumber: string;
  deviceName: string;
  deviceId: string;
  lotNumber: string;
  serialNumber: string;
  complaintDate: string;
  source: string;
  reporterName: string;
  reporterContact: string;
  description: string;
  severity: string;
  status: string;
  patientInvolved: boolean;
  injuryOccurred: boolean;
  injuryDescription: string;
  deathOccurred: boolean;
  malfunctionOccurred: boolean;
  investigationSummary: string;
  rootCause: string;
  correctiveAction: string;
  capaRef: string;
  mdrReportable: string;
  mdrReportRef: string;
  daysOpen: number;
  closedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TrendingData {
  month: string;
  count: number;
}

interface MdrPending {
  total: number;
  complaints: Complaint[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOURCES = [
  'CUSTOMER',
  'PATIENT',
  'HEALTHCARE_PROFESSIONAL',
  'DISTRIBUTOR',
  'REGULATORY_AUTHORITY',
  'INTERNAL',
  'FIELD_SERVICE',
  'OTHER',
] as const;

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

const COMPLAINT_STATUSES = [
  'NEW',
  'UNDER_INVESTIGATION',
  'PENDING_MDR',
  'PENDING_CAPA',
  'CLOSED',
  'REJECTED',
] as const;

const MDR_OPTIONS = ['YES', 'NO', 'PENDING'] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSeverityBadgeVariant(severity: string): 'secondary' | 'info' | 'warning' | 'success' | 'danger' | 'outline' {
  switch (severity) {
    case 'LOW': return 'info';
    case 'MEDIUM': return 'warning';
    case 'HIGH': return 'danger';
    case 'CRITICAL': return 'danger';
    default: return 'outline';
  }
}

function getStatusBadgeVariant(status: string): 'secondary' | 'info' | 'warning' | 'success' | 'danger' | 'outline' {
  switch (status) {
    case 'NEW': return 'info';
    case 'UNDER_INVESTIGATION': return 'warning';
    case 'PENDING_MDR': return 'danger';
    case 'PENDING_CAPA': return 'warning';
    case 'CLOSED': return 'success';
    case 'REJECTED': return 'secondary';
    default: return 'outline';
  }
}

function formatDate(date: string | null): string {
  if (!date) return '--';
  return new Date(date).toLocaleDateString();
}

function getMdrIcon(mdr: string): string {
  switch (mdr) {
    case 'YES': return 'Yes';
    case 'NO': return 'No';
    case 'PENDING': return 'Pending';
    default: return '--';
  }
}

function getMdrBadgeVariant(mdr: string): 'secondary' | 'info' | 'warning' | 'success' | 'danger' | 'outline' {
  switch (mdr) {
    case 'YES': return 'danger';
    case 'NO': return 'secondary';
    case 'PENDING': return 'warning';
    default: return 'outline';
  }
}

// ---------------------------------------------------------------------------
// Empty form states
// ---------------------------------------------------------------------------

const emptyComplaintForm = {
  deviceName: '',
  deviceId: '',
  lotNumber: '',
  serialNumber: '',
  complaintDate: '',
  source: 'CUSTOMER' as string,
  reporterName: '',
  reporterContact: '',
  description: '',
  severity: 'MEDIUM' as string,
  patientInvolved: false,
  injuryOccurred: false,
  injuryDescription: '',
  deathOccurred: false,
  malfunctionOccurred: false,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ComplaintsClient() {
  // View state
  const [view, setView] = useState<'list' | 'detail'>('list');

  // Data state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [mdrPending, setMdrPending] = useState<MdrPending | null>(null);
  const [trendingData, setTrendingData] = useState<TrendingData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTrendingModal, setShowTrendingModal] = useState(false);

  // Form state
  const [form, setForm] = useState(emptyComplaintForm);

  // Investigation form (in-place editing in detail view)
  const [investigationForm, setInvestigationForm] = useState({
    investigationSummary: '',
    rootCause: '',
    correctiveAction: '',
    capaRef: '',
  });

  // MDR form
  const [mdrDecision, setMdrDecision] = useState({
    mdrReportable: 'PENDING' as string,
    mdrReportRef: '',
  });

  // Common state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [deviceNameFilter, setDeviceNameFilter] = useState('');
  const [mdrFilter, setMdrFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/complaints');
      setComplaints(response.data.data || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMdrPending = useCallback(async () => {
    try {
      const response = await api.get('/complaints/mdr-pending');
      setMdrPending(response.data.data || null);
    } catch (err) {
      console.error('Failed to load MDR pending:', err);
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    try {
      const response = await api.get('/complaints/trending');
      setTrendingData(response.data.data || []);
      setShowTrendingModal(true);
    } catch (err) {
      console.error('Failed to load trending:', err);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
    fetchMdrPending();
  }, [fetchComplaints, fetchMdrPending]);

  const fetchComplaintDetail = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/complaints/${id}`);
      const complaint = response.data.data;
      setSelectedComplaint(complaint);
      setInvestigationForm({
        investigationSummary: complaint.investigationSummary || '',
        rootCause: complaint.rootCause || '',
        correctiveAction: complaint.correctiveAction || '',
        capaRef: complaint.capaRef || '',
      });
      setMdrDecision({
        mdrReportable: complaint.mdrReportable || 'PENDING',
        mdrReportRef: complaint.mdrReportRef || '',
      });
    } catch (err) {
      console.error('Failed to load complaint detail:', err);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/complaints', form);
      setShowCreateModal(false);
      setForm(emptyComplaintForm);
      fetchComplaints();
      fetchMdrPending();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create complaint');
    } finally {
      setSubmitting(false);
    }
  }, [form, fetchComplaints, fetchMdrPending]);

  const handleUpdateInvestigation = useCallback(async () => {
    if (!selectedComplaint) return;
    setSubmitting(true);
    setError('');
    try {
      await api.put(`/complaints/${selectedComplaint.id}`, investigationForm);
      fetchComplaintDetail(selectedComplaint.id);
      fetchComplaints();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update investigation');
    } finally {
      setSubmitting(false);
    }
  }, [selectedComplaint, investigationForm, fetchComplaintDetail, fetchComplaints]);

  const handleMdrDecision = useCallback(async () => {
    if (!selectedComplaint) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/complaints/${selectedComplaint.id}/mdr`, mdrDecision);
      fetchComplaintDetail(selectedComplaint.id);
      fetchComplaints();
      fetchMdrPending();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit MDR decision');
    } finally {
      setSubmitting(false);
    }
  }, [selectedComplaint, mdrDecision, fetchComplaintDetail, fetchComplaints, fetchMdrPending]);

  const handleClose = useCallback(async () => {
    if (!selectedComplaint) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/complaints/${selectedComplaint.id}/close`);
      fetchComplaintDetail(selectedComplaint.id);
      fetchComplaints();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to close complaint');
    } finally {
      setSubmitting(false);
    }
  }, [selectedComplaint, fetchComplaintDetail, fetchComplaints]);

  const openDetail = useCallback(async (complaint: Complaint) => {
    await fetchComplaintDetail(complaint.id);
    setView('detail');
  }, [fetchComplaintDetail]);

  // ---------------------------------------------------------------------------
  // Filtered data
  // ---------------------------------------------------------------------------

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (severityFilter !== 'all' && c.severity !== severityFilter) return false;
      if (mdrFilter !== 'all' && c.mdrReportable !== mdrFilter) return false;
      if (deviceNameFilter && !c.deviceName?.toLowerCase().includes(deviceNameFilter.toLowerCase())) return false;
      if (dateFromFilter && c.complaintDate < dateFromFilter) return false;
      if (dateToFilter && c.complaintDate > dateToFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !c.deviceName?.toLowerCase().includes(q) &&
          !c.referenceNumber?.toLowerCase().includes(q) &&
          !c.description?.toLowerCase().includes(q) &&
          !c.reporterName?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [complaints, statusFilter, severityFilter, mdrFilter, deviceNameFilter, dateFromFilter, dateToFilter, searchQuery]);

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

    return {
      total: complaints.length,
      underInvestigation: complaints.filter(c => c.status === 'UNDER_INVESTIGATION').length,
      mdrPendingCount: complaints.filter(c => c.mdrReportable === 'PENDING' || c.status === 'PENDING_MDR').length,
      closedThisMonth: complaints.filter(c => {
        if (!c.closedDate) return false;
        const closed = c.closedDate.substring(0, 7);
        return closed === thisMonth;
      }).length,
    };
  }, [complaints]);

  // ---------------------------------------------------------------------------
  // Loading spinner
  // ---------------------------------------------------------------------------

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      <span className="ml-3 text-gray-500 dark:text-gray-400">Loading complaints...</span>
    </div>
  );

  // ---------------------------------------------------------------------------
  // DETAIL VIEW
  // ---------------------------------------------------------------------------

  if (view === 'detail' && selectedComplaint) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back navigation */}
          <button
            onClick={() => { setView('list'); setSelectedComplaint(null); }}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Complaints
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">{error}</div>
          )}

          {/* Complaint Info Card */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedComplaint.referenceNumber}</h1>
                    <Badge variant={getSeverityBadgeVariant(selectedComplaint.severity)}>
                      {selectedComplaint.severity}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(selectedComplaint.status)}>
                      {selectedComplaint.status?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Device: <strong>{selectedComplaint.deviceName}</strong></p>
                </div>
                <div className="flex items-center gap-2">
                  {/* MDR Status Indicator */}
                  <div className={`px-3 py-2 rounded-lg border ${
                    selectedComplaint.mdrReportable === 'YES' ? 'bg-red-50 border-red-200' :
                    selectedComplaint.mdrReportable === 'PENDING' ? 'bg-amber-50 border-amber-200' :
                    'bg-gray-50 dark:bg-gray-800 border-gray-200'
                  }`}>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">MDR Status</p>
                    <Badge variant={getMdrBadgeVariant(selectedComplaint.mdrReportable)}>
                      {getMdrIcon(selectedComplaint.mdrReportable)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Complaint Date</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(selectedComplaint.complaintDate)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Source</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{selectedComplaint.source?.replace(/_/g, ' ')}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Reporter</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{selectedComplaint.reporterName || '--'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Days Open</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{selectedComplaint.daysOpen ?? '--'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Device ID</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">{selectedComplaint.deviceId || '--'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Lot Number</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">{selectedComplaint.lotNumber || '--'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Serial Number</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">{selectedComplaint.serialNumber || '--'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Contact</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{selectedComplaint.reporterContact || '--'}</p>
                </div>
              </div>

              {/* Patient/Injury flags */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${selectedComplaint.patientInvolved ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                  <span className="text-xs text-gray-600">Patient Involved</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${selectedComplaint.injuryOccurred ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                  <span className="text-xs text-gray-600">Injury Occurred</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${selectedComplaint.deathOccurred ? 'bg-red-700' : 'bg-gray-300'}`}></span>
                  <span className="text-xs text-gray-600">Death Occurred</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${selectedComplaint.malfunctionOccurred ? 'bg-amber-500' : 'bg-gray-300'}`}></span>
                  <span className="text-xs text-gray-600">Malfunction</span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Complaint Description</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.injuryOccurred && selectedComplaint.injuryDescription && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <p className="text-xs font-medium text-red-700 uppercase mb-1">Injury Description</p>
                  <p className="text-sm text-red-900 whitespace-pre-wrap">{selectedComplaint.injuryDescription}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Investigation Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Investigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="inv-summary">Investigation Summary</Label>
                  <Textarea
                    id="inv-summary"
                    value={investigationForm.investigationSummary}
                    onChange={(e) => setInvestigationForm({ ...investigationForm, investigationSummary: e.target.value })}
                    rows={4}
                    placeholder="Document investigation findings..."
                  />
                </div>
                <div>
                  <Label htmlFor="inv-rootCause">Root Cause</Label>
                  <Textarea
                    id="inv-rootCause"
                    value={investigationForm.rootCause}
                    onChange={(e) => setInvestigationForm({ ...investigationForm, rootCause: e.target.value })}
                    rows={3}
                    placeholder="Identified root cause..."
                  />
                </div>
                <div>
                  <Label htmlFor="inv-corrective">Corrective Action</Label>
                  <Textarea
                    id="inv-corrective"
                    value={investigationForm.correctiveAction}
                    onChange={(e) => setInvestigationForm({ ...investigationForm, correctiveAction: e.target.value })}
                    rows={3}
                    placeholder="Corrective actions taken or planned..."
                  />
                </div>
                <div>
                  <Label htmlFor="inv-capaRef">CAPA Reference</Label>
                  <Input
                    id="inv-capaRef"
                    value={investigationForm.capaRef}
                    onChange={(e) => setInvestigationForm({ ...investigationForm, capaRef: e.target.value })}
                    placeholder="e.g. CAPA-2026-001"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleUpdateInvestigation}
                    disabled={submitting}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Saving...</span>
                    ) : 'Save Investigation'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MDR Decision Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">MDR / Vigilance Decision</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mdr-reportable">MDR Reportable</Label>
                    <Select
                      id="mdr-reportable"
                      value={mdrDecision.mdrReportable}
                      onChange={(e) => setMdrDecision({ ...mdrDecision, mdrReportable: e.target.value })}
                    >
                      {MDR_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="mdr-reportRef">MDR Report Reference</Label>
                    <Input
                      id="mdr-reportRef"
                      value={mdrDecision.mdrReportRef}
                      onChange={(e) => setMdrDecision({ ...mdrDecision, mdrReportRef: e.target.value })}
                      placeholder="e.g. MDR-2026-001"
                    />
                  </div>
                </div>

                {(selectedComplaint.deathOccurred || selectedComplaint.injuryOccurred) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700 font-medium">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      This complaint involves {selectedComplaint.deathOccurred ? 'a death' : 'an injury'}.
                      MDR reporting may be required within regulatory timeframes.
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleMdrDecision}
                    disabled={submitting}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Submitting...</span>
                    ) : 'Submit MDR Decision'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Close Complaint */}
          {selectedComplaint.status !== 'CLOSED' && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Close Complaint</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Ensure investigation is complete and MDR decision has been made before closing.
                    </p>
                  </div>
                  <Button
                    onClick={handleClose}
                    disabled={submitting}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Closing...</span>
                    ) : (
                      <span className="flex items-center gap-2"><XCircle className="h-4 w-4" />Close Complaint</span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Complaint Handling</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Complaint Management & MDR/Vigilance Reporting</p>
        </div>

        {/* MDR Warning Banner */}
        {mdrPending && mdrPending.total > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-center gap-3">
            <FileWarning className="h-6 w-6 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {mdrPending.total} complaint{mdrPending.total > 1 ? 's' : ''} pending MDR decision
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Review these complaints promptly to determine if Medical Device Reporting is required.
              </p>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Complaints</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Under Investigation</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.underInvestigation}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">MDR Pending</p>
                  <p className="text-3xl font-bold text-red-600">{stats.mdrPendingCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Closed This Month</p>
                  <p className="text-3xl font-bold text-green-600">{stats.closedThisMonth}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search by device, reference, description, or reporter..."
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
            {(statusFilter !== 'all' || severityFilter !== 'all' || mdrFilter !== 'all' || deviceNameFilter || dateFromFilter || dateToFilter) && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-700">Active</span>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={fetchTrending}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Trending
          </Button>

          <Button
            onClick={() => { setForm(emptyComplaintForm); setError(''); setShowCreateModal(true); }}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            New Complaint
          </Button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex-wrap">
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Status</Label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40"
              >
                <option value="all">All Statuses</option>
                {COMPLAINT_STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Severity</Label>
              <Select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-36"
              >
                <option value="all">All</option>
                {SEVERITIES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Device Name</Label>
              <Input
                value={deviceNameFilter}
                onChange={(e) => setDeviceNameFilter(e.target.value)}
                placeholder="Filter..."
                className="w-36"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">MDR</Label>
              <Select
                value={mdrFilter}
                onChange={(e) => setMdrFilter(e.target.value)}
                className="w-32"
              >
                <option value="all">All</option>
                {MDR_OPTIONS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Date From</Label>
              <Input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                className="w-40"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Date To</Label>
              <Input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                className="w-40"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter('all');
                setSeverityFilter('all');
                setDeviceNameFilter('');
                setMdrFilter('all');
                setDateFromFilter('');
                setDateToFilter('');
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredComplaints.length} of {complaints.length} complaints
          </p>
        </div>

        {/* Complaints Table */}
        {loading ? <LoadingSpinner /> : filteredComplaints.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Ref #</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Device</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Date</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Source</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Severity</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">MDR</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Days Open</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredComplaints.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-gray-50 dark:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => openDetail(c)}
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-gray-600">{c.referenceNumber || '--'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.deviceName}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(c.complaintDate)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{c.source?.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getSeverityBadgeVariant(c.severity)}>
                            {c.severity}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusBadgeVariant(c.status)}>
                            {c.status?.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getMdrBadgeVariant(c.mdrReportable)}>
                            {getMdrIcon(c.mdrReportable)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${
                            (c.daysOpen || 0) > 30 ? 'text-red-600' :
                            (c.daysOpen || 0) > 14 ? 'text-amber-600' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {c.daysOpen ?? '--'}
                          </span>
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
            <MessageSquare className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No complaints found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Record and track complaints to meet post-market surveillance requirements.</p>
            <Button
              onClick={() => { setForm(emptyComplaintForm); setError(''); setShowCreateModal(true); }}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record First Complaint
            </Button>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL: Create Complaint                                              */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Complaint"
        size="lg"
      >
        <form onSubmit={handleCreate}>
          <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            {/* Device Info */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Device Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="c-deviceName">Device Name *</Label>
                    <Input
                      id="c-deviceName"
                      value={form.deviceName}
                      onChange={(e) => setForm({ ...form, deviceName: e.target.value })}
                      required
                      placeholder="e.g. CardioMonitor Pro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="c-deviceId">Device Identifier</Label>
                    <Input
                      id="c-deviceId"
                      value={form.deviceId}
                      onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
                      placeholder="UDI or catalog number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="c-lotNumber">Lot Number</Label>
                    <Input
                      id="c-lotNumber"
                      value={form.lotNumber}
                      onChange={(e) => setForm({ ...form, lotNumber: e.target.value })}
                      placeholder="e.g. LOT-2026-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="c-serialNumber">Serial Number</Label>
                    <Input
                      id="c-serialNumber"
                      value={form.serialNumber}
                      onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                      placeholder="e.g. SN-123456"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Complaint Details */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Complaint Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="c-complaintDate">Complaint Date *</Label>
                    <Input
                      id="c-complaintDate"
                      type="date"
                      value={form.complaintDate}
                      onChange={(e) => setForm({ ...form, complaintDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="c-source">Source *</Label>
                    <Select
                      id="c-source"
                      value={form.source}
                      onChange={(e) => setForm({ ...form, source: e.target.value })}
                    >
                      {SOURCES.map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="c-reporterName">Reporter Name</Label>
                    <Input
                      id="c-reporterName"
                      value={form.reporterName}
                      onChange={(e) => setForm({ ...form, reporterName: e.target.value })}
                      placeholder="Name of person reporting"
                    />
                  </div>
                  <div>
                    <Label htmlFor="c-reporterContact">Reporter Contact</Label>
                    <Input
                      id="c-reporterContact"
                      value={form.reporterContact}
                      onChange={(e) => setForm({ ...form, reporterContact: e.target.value })}
                      placeholder="Phone or email"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="c-description">Description *</Label>
                  <Textarea
                    id="c-description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    required
                    placeholder="Detailed description of the complaint"
                  />
                </div>
                <div>
                  <Label htmlFor="c-severity">Severity *</Label>
                  <Select
                    id="c-severity"
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  >
                    {SEVERITIES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Patient/Injury */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Patient & Injury Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="c-patientInvolved"
                      checked={form.patientInvolved}
                      onChange={(e) => setForm({ ...form, patientInvolved: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <Label htmlFor="c-patientInvolved">Patient Involved</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="c-injuryOccurred"
                      checked={form.injuryOccurred}
                      onChange={(e) => setForm({ ...form, injuryOccurred: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <Label htmlFor="c-injuryOccurred">Injury Occurred</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="c-deathOccurred"
                      checked={form.deathOccurred}
                      onChange={(e) => setForm({ ...form, deathOccurred: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <Label htmlFor="c-deathOccurred">Death Occurred</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="c-malfunction"
                      checked={form.malfunctionOccurred}
                      onChange={(e) => setForm({ ...form, malfunctionOccurred: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <Label htmlFor="c-malfunction">Malfunction</Label>
                  </div>
                </div>

                {form.injuryOccurred && (
                  <div>
                    <Label htmlFor="c-injuryDescription">Injury Description *</Label>
                    <Textarea
                      id="c-injuryDescription"
                      value={form.injuryDescription}
                      onChange={(e) => setForm({ ...form, injuryDescription: e.target.value })}
                      rows={3}
                      required
                      placeholder="Describe the nature of the injury"
                    />
                  </div>
                )}

                {(form.deathOccurred || form.injuryOccurred) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700 font-medium">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      This complaint may require MDR reporting. Ensure timely regulatory notification.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating...</span>
              ) : 'Create Complaint'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL: Trending                                                      */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showTrendingModal}
        onClose={() => setShowTrendingModal(false)}
        title="Complaint Trending"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Complaints by month</p>
          {trendingData.length > 0 ? (
            <div className="space-y-2">
              {trendingData.map((item) => {
                const maxCount = Math.max(...trendingData.map(t => t.count), 1);
                const widthPercent = (item.count / maxCount) * 100;
                return (
                  <div key={item.month} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-24 flex-shrink-0">{item.month}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-teal-500 h-full rounded-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${Math.max(widthPercent, 8)}%` }}
                      >
                        <span className="text-xs text-white font-medium">{item.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-center py-8">No trending data available.</p>
          )}

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowTrendingModal(false)}>Close</Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  );
}
