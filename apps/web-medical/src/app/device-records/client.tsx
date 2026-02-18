'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
  Label,
  Select,
  Textarea,
} from '@ims/ui';
import {
  Plus,
  Search,
  Loader2,
  Filter,
  FileText,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Clipboard,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DMR {
  id: string;
  referenceNumber: string;
  deviceName: string;
  deviceClass: string;
  description: string;
  specifications: string;
  productionProcesses: string;
  qualityProcedures: string;
  acceptanceCriteria: string;
  labellingSpecs: string;
  packagingSpecs: string;
  status: string;
  currentVersion: string;
  approvedDate: string | null;
  createdAt: string;
  updatedAt: string;
  dhrs?: DHR[];
}

interface DHR {
  id: string;
  referenceNumber: string;
  dmrId: string;
  dmrRef: string;
  batchNumber: string;
  manufacturingDate: string;
  quantityManufactured: number;
  quantityReleased: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  records?: ProductionRecord[];
}

interface ProductionRecord {
  id: string;
  dhrId: string;
  recordType: string;
  description: string;
  result: string;
  performedBy: string;
  performedDate: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEVICE_CLASSES = ['I', 'II', 'III'] as const;

const DMR_STATUSES = ['DRAFT', 'APPROVED', 'SUPERSEDED', 'OBSOLETE'] as const;
const DHR_STATUSES = ['IN_PRODUCTION', 'RELEASED', 'REJECTED', 'ON_HOLD'] as const;

const RECORD_TYPES = [
  'MANUFACTURING',
  'INSPECTION',
  'TESTING',
  'PACKAGING',
  'LABELLING',
  'STERILIZATION',
  'ENVIRONMENTAL_MONITORING',
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusBadgeVariant(
  status: string
): 'secondary' | 'info' | 'warning' | 'success' | 'danger' | 'outline' {
  switch (status) {
    case 'DRAFT':
      return 'secondary';
    case 'APPROVED':
      return 'success';
    case 'SUPERSEDED':
      return 'warning';
    case 'OBSOLETE':
      return 'danger';
    case 'IN_PRODUCTION':
      return 'info';
    case 'RELEASED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    case 'ON_HOLD':
      return 'warning';
    default:
      return 'outline';
  }
}

function formatDate(date: string | null): string {
  if (!date) return '--';
  return new Date(date).toLocaleDateString();
}

// ---------------------------------------------------------------------------
// Empty form states
// ---------------------------------------------------------------------------

const emptyDmrForm = {
  deviceName: '',
  deviceClass: 'I' as string,
  description: '',
  specifications: '',
  productionProcesses: '',
  qualityProcedures: '',
  acceptanceCriteria: '',
  labellingSpecs: '',
  packagingSpecs: '',
};

const emptyDhrForm = {
  dmrId: '',
  batchNumber: '',
  manufacturingDate: '',
  quantityManufactured: 0,
};

const emptyRecordForm = {
  recordType: 'MANUFACTURING' as string,
  description: '',
  result: '',
  performedBy: '',
  performedDate: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DeviceRecordsClient() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'DMR' | 'DHR'>('DMR');

  // Data state
  const [dmrs, setDmrs] = useState<DMR[]>([]);
  const [dhrs, setDhrs] = useState<DHR[]>([]);
  const [loading, setLoading] = useState(true);

  // DMR modal state
  const [showCreateDmrModal, setShowCreateDmrModal] = useState(false);
  const [showDmrDetailModal, setShowDmrDetailModal] = useState(false);
  const [selectedDmr, setSelectedDmr] = useState<DMR | null>(null);
  const [dmrForm, setDmrForm] = useState(emptyDmrForm);

  // DHR modal state
  const [showCreateDhrModal, setShowCreateDhrModal] = useState(false);
  const [showDhrDetailModal, setShowDhrDetailModal] = useState(false);
  const [selectedDhr, setSelectedDhr] = useState<DHR | null>(null);
  const [dhrForm, setDhrForm] = useState(emptyDhrForm);

  // Record modal state
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [recordForm, setRecordForm] = useState(emptyRecordForm);

  // Common state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchDmrs = useCallback(async () => {
    try {
      const response = await api.get('/dmr');
      setDmrs(response.data.data || []);
    } catch (err) {
      console.error('Failed to load DMRs:', err);
    }
  }, []);

  const fetchDhrs = useCallback(async () => {
    try {
      const response = await api.get('/dhr');
      setDhrs(response.data.data || []);
    } catch (err) {
      console.error('Failed to load DHRs:', err);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchDmrs(), fetchDhrs()]);
    setLoading(false);
  }, [fetchDmrs, fetchDhrs]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const fetchDmrDetail = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/dmr/${id}`);
      setSelectedDmr(response.data.data);
    } catch (err) {
      console.error('Failed to load DMR detail:', err);
    }
  }, []);

  const fetchDhrDetail = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/dhr/${id}`);
      setSelectedDhr(response.data.data);
    } catch (err) {
      console.error('Failed to load DHR detail:', err);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // DMR Handlers
  // ---------------------------------------------------------------------------

  const handleCreateDmr = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      setError('');
      try {
        await api.post('/dmr', dmrForm);
        setShowCreateDmrModal(false);
        setDmrForm(emptyDmrForm);
        fetchDmrs();
      } catch (err: unknown) {
        setError(err.response?.data?.message || 'Failed to create DMR');
      } finally {
        setSubmitting(false);
      }
    },
    [dmrForm, fetchDmrs]
  );

  const handleApproveDmr = useCallback(
    async (id: string) => {
      setSubmitting(true);
      try {
        await api.post(`/dmr/${id}/approve`);
        fetchDmrDetail(id);
        fetchDmrs();
      } catch (err: unknown) {
        setError(err.response?.data?.message || 'Failed to approve DMR');
      } finally {
        setSubmitting(false);
      }
    },
    [fetchDmrDetail, fetchDmrs]
  );

  // ---------------------------------------------------------------------------
  // DHR Handlers
  // ---------------------------------------------------------------------------

  const handleCreateDhr = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      setError('');
      try {
        await api.post('/dhr', {
          ...dhrForm,
          quantityManufactured: Number(dhrForm.quantityManufactured),
        });
        setShowCreateDhrModal(false);
        setDhrForm(emptyDhrForm);
        fetchDhrs();
      } catch (err: unknown) {
        setError(err.response?.data?.message || 'Failed to create DHR');
      } finally {
        setSubmitting(false);
      }
    },
    [dhrForm, fetchDhrs]
  );

  const handleAddRecord = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedDhr) return;
      setSubmitting(true);
      setError('');
      try {
        await api.post(`/dhr/${selectedDhr.id}/records`, recordForm);
        setShowAddRecordModal(false);
        setRecordForm(emptyRecordForm);
        fetchDhrDetail(selectedDhr.id);
      } catch (err: unknown) {
        setError(err.response?.data?.message || 'Failed to add production record');
      } finally {
        setSubmitting(false);
      }
    },
    [selectedDhr, recordForm, fetchDhrDetail]
  );

  const handleReleaseDhr = useCallback(
    async (id: string) => {
      setSubmitting(true);
      try {
        await api.post(`/dhr/${id}/release`);
        fetchDhrDetail(id);
        fetchDhrs();
      } catch (err: unknown) {
        setError(err.response?.data?.message || 'Failed to release DHR');
      } finally {
        setSubmitting(false);
      }
    },
    [fetchDhrDetail, fetchDhrs]
  );

  // ---------------------------------------------------------------------------
  // Filtered data
  // ---------------------------------------------------------------------------

  const filteredDmrs = useMemo(() => {
    return dmrs.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !d.deviceName?.toLowerCase().includes(q) &&
          !d.referenceNumber?.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [dmrs, statusFilter, searchQuery]);

  const filteredDhrs = useMemo(() => {
    return dhrs.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !d.batchNumber?.toLowerCase().includes(q) &&
          !d.referenceNumber?.toLowerCase().includes(q) &&
          !d.dmrRef?.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [dhrs, statusFilter, searchQuery]);

  // ---------------------------------------------------------------------------
  // DMR Stats
  // ---------------------------------------------------------------------------

  const dmrStats = useMemo(
    () => ({
      total: dmrs.length,
      draft: dmrs.filter((d) => d.status === 'DRAFT').length,
      approved: dmrs.filter((d) => d.status === 'APPROVED').length,
      superseded: dmrs.filter((d) => d.status === 'SUPERSEDED').length,
    }),
    [dmrs]
  );

  // ---------------------------------------------------------------------------
  // DHR Stats
  // ---------------------------------------------------------------------------

  const dhrStats = useMemo(
    () => ({
      total: dhrs.length,
      inProduction: dhrs.filter((d) => d.status === 'IN_PRODUCTION').length,
      released: dhrs.filter((d) => d.status === 'RELEASED').length,
      rejected: dhrs.filter((d) => d.status === 'REJECTED').length,
    }),
    [dhrs]
  );

  // ---------------------------------------------------------------------------
  // Loading spinner
  // ---------------------------------------------------------------------------

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      <span className="ml-3 text-gray-500 dark:text-gray-400">Loading device records...</span>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Device Records</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            DMR/DHR Management -- Device Master Records & Device History Records
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          <button
            onClick={() => {
              setActiveTab('DMR');
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'DMR'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              DMR (Device Master Records)
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('DHR');
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'DHR'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              DHR (Device History Records)
            </div>
          </button>
        </div>

        {/* ================================================================ */}
        {/* DMR TAB                                                         */}
        {/* ================================================================ */}
        {activeTab === 'DMR' && (
          <>
            {/* DMR Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total DMRs</p>
                      <p className="text-3xl font-bold">{dmrStats.total}</p>
                    </div>
                    <FileText className="h-8 w-8 text-teal-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Draft</p>
                      <p className="text-3xl font-bold text-gray-600">{dmrStats.draft}</p>
                    </div>
                    <Clock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                      <p className="text-3xl font-bold text-green-600">{dmrStats.approved}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Superseded</p>
                      <p className="text-3xl font-bold text-amber-600">{dmrStats.superseded}</p>
                    </div>
                    <ArrowRight className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* DMR Filter bar */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  aria-label="Search by device name or reference..."
                  placeholder="Search by device name or reference..."
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
                {statusFilter !== 'all' && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-700">
                    Active
                  </span>
                )}
              </Button>

              <Button
                onClick={() => {
                  setDmrForm(emptyDmrForm);
                  setError('');
                  setShowCreateDmrModal(true);
                }}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="h-4 w-4" />
                New DMR
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
                    {DMR_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* DMR results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredDmrs.length} of {dmrs.length} device master records
              </p>
            </div>

            {/* DMR Table */}
            {loading ? (
              <LoadingSpinner />
            ) : filteredDmrs.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Ref #
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Device Name
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Device Class
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Status
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Version
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Approved Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredDmrs.map((dmr) => (
                          <tr
                            key={dmr.id}
                            className="hover:bg-gray-50 dark:bg-gray-800 transition-colors cursor-pointer"
                            onClick={() => {
                              fetchDmrDetail(dmr.id);
                              setShowDmrDetailModal(true);
                            }}
                          >
                            <td className="px-6 py-4">
                              <span className="text-sm font-mono text-gray-600">
                                {dmr.referenceNumber || '--'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {dmr.deviceName}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant={
                                  dmr.deviceClass === 'III'
                                    ? 'danger'
                                    : dmr.deviceClass === 'II'
                                      ? 'warning'
                                      : 'info'
                                }
                              >
                                Class {dmr.deviceClass}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={getStatusBadgeVariant(dmr.status)}>
                                {dmr.status?.replace(/_/g, ' ')}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {dmr.currentVersion || '1.0'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {formatDate(dmr.approvedDate)}
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
                <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No device master records found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Create a DMR to define device specifications and manufacturing processes.
                </p>
                <Button
                  onClick={() => {
                    setDmrForm(emptyDmrForm);
                    setError('');
                    setShowCreateDmrModal(true);
                  }}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First DMR
                </Button>
              </div>
            )}
          </>
        )}

        {/* ================================================================ */}
        {/* DHR TAB                                                         */}
        {/* ================================================================ */}
        {activeTab === 'DHR' && (
          <>
            {/* DHR Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total DHRs</p>
                      <p className="text-3xl font-bold">{dhrStats.total}</p>
                    </div>
                    <Package className="h-8 w-8 text-teal-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">In Production</p>
                      <p className="text-3xl font-bold text-blue-600">{dhrStats.inProduction}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Released</p>
                      <p className="text-3xl font-bold text-green-600">{dhrStats.released}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
                      <p className="text-3xl font-bold text-red-600">{dhrStats.rejected}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* DHR Filter bar */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  aria-label="Search by batch number, reference, or DMR..."
                  placeholder="Search by batch number, reference, or DMR..."
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
                {statusFilter !== 'all' && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-700">
                    Active
                  </span>
                )}
              </Button>

              <Button
                onClick={() => {
                  setDhrForm(emptyDhrForm);
                  setError('');
                  setShowCreateDhrModal(true);
                }}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="h-4 w-4" />
                New DHR
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
                    {DHR_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* DHR results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredDhrs.length} of {dhrs.length} device history records
              </p>
            </div>

            {/* DHR Table */}
            {loading ? (
              <LoadingSpinner />
            ) : filteredDhrs.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Ref #
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Batch Number
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            DMR Ref
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Mfg Date
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Qty Mfg
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Qty Released
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredDhrs.map((dhr) => (
                          <tr
                            key={dhr.id}
                            className="hover:bg-gray-50 dark:bg-gray-800 transition-colors cursor-pointer"
                            onClick={() => {
                              fetchDhrDetail(dhr.id);
                              setShowDhrDetailModal(true);
                            }}
                          >
                            <td className="px-6 py-4">
                              <span className="text-sm font-mono text-gray-600">
                                {dhr.referenceNumber || '--'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {dhr.batchNumber}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-mono text-gray-600">
                                {dhr.dmrRef || '--'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {formatDate(dhr.manufacturingDate)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {dhr.quantityManufactured}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {dhr.quantityReleased}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={getStatusBadgeVariant(dhr.status)}>
                                {dhr.status?.replace(/_/g, ' ')}
                              </Badge>
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
                <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No device history records found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Create a DHR to track manufacturing batch records for a device.
                </p>
                <Button
                  onClick={() => {
                    setDhrForm(emptyDhrForm);
                    setError('');
                    setShowCreateDhrModal(true);
                  }}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First DHR
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL: Create DMR                                                    */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showCreateDmrModal}
        onClose={() => setShowCreateDmrModal(false)}
        title="New Device Master Record"
        size="lg"
      >
        <form onSubmit={handleCreateDmr}>
          <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                Device Identification
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dmr-deviceName">Device Name *</Label>
                  <Input
                    id="dmr-deviceName"
                    value={dmrForm.deviceName}
                    onChange={(e) => setDmrForm({ ...dmrForm, deviceName: e.target.value })}
                    required
                    placeholder="e.g. CardioMonitor Pro"
                  />
                </div>
                <div>
                  <Label htmlFor="dmr-deviceClass">Device Classification *</Label>
                  <Select
                    id="dmr-deviceClass"
                    value={dmrForm.deviceClass}
                    onChange={(e) => setDmrForm({ ...dmrForm, deviceClass: e.target.value })}
                  >
                    {DEVICE_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}{' '}
                        {cls === 'I'
                          ? '(Low Risk)'
                          : cls === 'II'
                            ? '(Moderate Risk)'
                            : '(High Risk)'}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dmr-description">Description *</Label>
                  <Textarea
                    id="dmr-description"
                    value={dmrForm.description}
                    onChange={(e) => setDmrForm({ ...dmrForm, description: e.target.value })}
                    rows={3}
                    required
                    placeholder="Device description and intended use"
                  />
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                Specifications & Processes
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dmr-specifications">Device Specifications</Label>
                  <Textarea
                    id="dmr-specifications"
                    value={dmrForm.specifications}
                    onChange={(e) => setDmrForm({ ...dmrForm, specifications: e.target.value })}
                    rows={3}
                    placeholder="Physical, chemical, performance specifications"
                  />
                </div>
                <div>
                  <Label htmlFor="dmr-productionProcesses">Production Processes</Label>
                  <Textarea
                    id="dmr-productionProcesses"
                    value={dmrForm.productionProcesses}
                    onChange={(e) =>
                      setDmrForm({ ...dmrForm, productionProcesses: e.target.value })
                    }
                    rows={3}
                    placeholder="Manufacturing steps, process parameters, equipment"
                  />
                </div>
                <div>
                  <Label htmlFor="dmr-qualityProcedures">Quality Procedures</Label>
                  <Textarea
                    id="dmr-qualityProcedures"
                    value={dmrForm.qualityProcedures}
                    onChange={(e) => setDmrForm({ ...dmrForm, qualityProcedures: e.target.value })}
                    rows={3}
                    placeholder="In-process and final inspection procedures"
                  />
                </div>
                <div>
                  <Label htmlFor="dmr-acceptanceCriteria">Acceptance Criteria</Label>
                  <Textarea
                    id="dmr-acceptanceCriteria"
                    value={dmrForm.acceptanceCriteria}
                    onChange={(e) => setDmrForm({ ...dmrForm, acceptanceCriteria: e.target.value })}
                    rows={2}
                    placeholder="Pass/fail criteria for release"
                  />
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                Labelling & Packaging
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dmr-labellingSpecs">Labelling Specifications</Label>
                  <Textarea
                    id="dmr-labellingSpecs"
                    value={dmrForm.labellingSpecs}
                    onChange={(e) => setDmrForm({ ...dmrForm, labellingSpecs: e.target.value })}
                    rows={2}
                    placeholder="Label content, format, regulatory symbols"
                  />
                </div>
                <div>
                  <Label htmlFor="dmr-packagingSpecs">Packaging Specifications</Label>
                  <Textarea
                    id="dmr-packagingSpecs"
                    value={dmrForm.packagingSpecs}
                    onChange={(e) => setDmrForm({ ...dmrForm, packagingSpecs: e.target.value })}
                    rows={2}
                    placeholder="Packaging materials, sterile barrier, shipping requirements"
                  />
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateDmrModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create DMR'
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL: DMR Detail                                                    */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showDmrDetailModal}
        onClose={() => {
          setShowDmrDetailModal(false);
          setSelectedDmr(null);
        }}
        title={selectedDmr ? `DMR: ${selectedDmr.deviceName}` : 'DMR Details'}
        size="lg"
      >
        {selectedDmr ? (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={getStatusBadgeVariant(selectedDmr.status)}>
                {selectedDmr.status?.replace(/_/g, ' ')}
              </Badge>
              <Badge
                variant={
                  selectedDmr.deviceClass === 'III'
                    ? 'danger'
                    : selectedDmr.deviceClass === 'II'
                      ? 'warning'
                      : 'info'
                }
              >
                Class {selectedDmr.deviceClass}
              </Badge>
              <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                {selectedDmr.referenceNumber}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                v{selectedDmr.currentVersion || '1.0'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Device Name
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">{selectedDmr.deviceName}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Approved Date
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(selectedDmr.approvedDate)}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                Description
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {selectedDmr.description || '--'}
              </p>
            </div>

            {selectedDmr.specifications && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Specifications
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {selectedDmr.specifications}
                </p>
              </div>
            )}

            {selectedDmr.productionProcesses && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Production Processes
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {selectedDmr.productionProcesses}
                </p>
              </div>
            )}

            {selectedDmr.qualityProcedures && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Quality Procedures
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {selectedDmr.qualityProcedures}
                </p>
              </div>
            )}

            {selectedDmr.acceptanceCriteria && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Acceptance Criteria
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {selectedDmr.acceptanceCriteria}
                </p>
              </div>
            )}

            {selectedDmr.labellingSpecs && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Labelling Specifications
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {selectedDmr.labellingSpecs}
                </p>
              </div>
            )}

            {selectedDmr.packagingSpecs && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Packaging Specifications
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {selectedDmr.packagingSpecs}
                </p>
              </div>
            )}

            {/* Linked DHRs */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                Linked Device History Records
              </h3>
              {selectedDmr.dhrs && selectedDmr.dhrs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">
                          Ref #
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">
                          Batch
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">
                          Status
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">
                          Qty
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {selectedDmr.dhrs.map((dhr) => (
                        <tr key={dhr.id}>
                          <td className="px-3 py-2 font-mono text-gray-600">
                            {dhr.referenceNumber}
                          </td>
                          <td className="px-3 py-2">{dhr.batchNumber}</td>
                          <td className="px-3 py-2">
                            <Badge variant={getStatusBadgeVariant(dhr.status)}>
                              {dhr.status?.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="px-3 py-2">{dhr.quantityManufactured}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No DHRs linked to this DMR yet.
                </p>
              )}
            </div>

            <ModalFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDmrDetailModal(false);
                  setSelectedDmr(null);
                }}
              >
                Close
              </Button>
              {selectedDmr.status === 'DRAFT' && (
                <Button
                  onClick={() => handleApproveDmr(selectedDmr.id)}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Approving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Approve DMR
                    </span>
                  )}
                </Button>
              )}
            </ModalFooter>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
            <span className="ml-2 text-gray-500 dark:text-gray-400">Loading...</span>
          </div>
        )}
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL: Create DHR                                                    */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showCreateDhrModal}
        onClose={() => setShowCreateDhrModal(false)}
        title="New Device History Record"
        size="lg"
      >
        <form onSubmit={handleCreateDhr}>
          <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                Batch Information
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dhr-dmrId">Device Master Record *</Label>
                  <Select
                    id="dhr-dmrId"
                    value={dhrForm.dmrId}
                    onChange={(e) => setDhrForm({ ...dhrForm, dmrId: e.target.value })}
                    required
                  >
                    <option value="">Select a DMR...</option>
                    {dmrs
                      .filter((d) => d.status === 'APPROVED')
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.referenceNumber} -- {d.deviceName} (v{d.currentVersion || '1.0'})
                        </option>
                      ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dhr-batchNumber">Batch Number *</Label>
                  <Input
                    id="dhr-batchNumber"
                    value={dhrForm.batchNumber}
                    onChange={(e) => setDhrForm({ ...dhrForm, batchNumber: e.target.value })}
                    required
                    placeholder="e.g. BATCH-2026-001"
                  />
                </div>
                <div>
                  <Label htmlFor="dhr-manufacturingDate">Manufacturing Date *</Label>
                  <Input
                    id="dhr-manufacturingDate"
                    type="date"
                    value={dhrForm.manufacturingDate}
                    onChange={(e) => setDhrForm({ ...dhrForm, manufacturingDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dhr-quantityManufactured">Quantity Manufactured *</Label>
                  <Input
                    id="dhr-quantityManufactured"
                    type="number"
                    min="1"
                    value={dhrForm.quantityManufactured || ''}
                    onChange={(e) =>
                      setDhrForm({
                        ...dhrForm,
                        quantityManufactured: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                    placeholder="e.g. 500"
                  />
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateDhrModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create DHR'
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL: DHR Detail                                                    */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showDhrDetailModal}
        onClose={() => {
          setShowDhrDetailModal(false);
          setSelectedDhr(null);
        }}
        title={selectedDhr ? `DHR: ${selectedDhr.batchNumber}` : 'DHR Details'}
        size="lg"
      >
        {selectedDhr ? (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={getStatusBadgeVariant(selectedDhr.status)}>
                {selectedDhr.status?.replace(/_/g, ' ')}
              </Badge>
              <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                {selectedDhr.referenceNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Batch Number
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {selectedDhr.batchNumber}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  DMR Reference
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                  {selectedDhr.dmrRef || '--'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Manufacturing Date
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(selectedDhr.manufacturingDate)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Quantity
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {selectedDhr.quantityManufactured} manufactured / {selectedDhr.quantityReleased}{' '}
                  released
                </p>
              </div>
            </div>

            {/* Production Records */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Production Records
                </h3>
                <Button
                  size="sm"
                  onClick={() => {
                    setRecordForm(emptyRecordForm);
                    setError('');
                    setShowAddRecordModal(true);
                  }}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Record
                </Button>
              </div>
              {selectedDhr.records && selectedDhr.records.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">
                          Type
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">
                          Description
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">
                          Result
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">
                          Performed By
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {selectedDhr.records.map((rec) => (
                        <tr key={rec.id}>
                          <td className="px-3 py-2">
                            <Badge variant="outline">{rec.recordType?.replace(/_/g, ' ')}</Badge>
                          </td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                            {rec.description}
                          </td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                            {rec.result}
                          </td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                            {rec.performedBy}
                          </td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                            {formatDate(rec.performedDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No production records yet.
                </p>
              )}
            </div>

            <ModalFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDhrDetailModal(false);
                  setSelectedDhr(null);
                }}
              >
                Close
              </Button>
              {selectedDhr.status === 'IN_PRODUCTION' && (
                <Button
                  onClick={() => handleReleaseDhr(selectedDhr.id)}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Releasing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Release DHR
                    </span>
                  )}
                </Button>
              )}
            </ModalFooter>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
            <span className="ml-2 text-gray-500 dark:text-gray-400">Loading...</span>
          </div>
        )}
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL: Add Production Record                                         */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showAddRecordModal}
        onClose={() => setShowAddRecordModal(false)}
        title="Add Production Record"
        size="lg"
      >
        <form onSubmit={handleAddRecord}>
          <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="rec-recordType">Record Type *</Label>
                <Select
                  id="rec-recordType"
                  value={recordForm.recordType}
                  onChange={(e) => setRecordForm({ ...recordForm, recordType: e.target.value })}
                >
                  {RECORD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="rec-description">Description *</Label>
                <Textarea
                  id="rec-description"
                  value={recordForm.description}
                  onChange={(e) => setRecordForm({ ...recordForm, description: e.target.value })}
                  rows={3}
                  required
                  placeholder="Describe the production activity or inspection"
                />
              </div>
              <div>
                <Label htmlFor="rec-result">Result *</Label>
                <Input
                  id="rec-result"
                  value={recordForm.result}
                  onChange={(e) => setRecordForm({ ...recordForm, result: e.target.value })}
                  required
                  placeholder="e.g. PASS, FAIL, or measured value"
                />
              </div>
              <div>
                <Label htmlFor="rec-performedBy">Performed By *</Label>
                <Input
                  id="rec-performedBy"
                  value={recordForm.performedBy}
                  onChange={(e) => setRecordForm({ ...recordForm, performedBy: e.target.value })}
                  required
                  placeholder="e.g. John Smith, QA Inspector"
                />
              </div>
              <div>
                <Label htmlFor="rec-performedDate">Date Performed *</Label>
                <Input
                  id="rec-performedDate"
                  type="date"
                  value={recordForm.performedDate}
                  onChange={(e) => setRecordForm({ ...recordForm, performedDate: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowAddRecordModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </span>
              ) : (
                'Add Record'
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
