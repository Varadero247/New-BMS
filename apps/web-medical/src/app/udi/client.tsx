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
  Barcode,
  Box,
  CheckCircle2,
  Clock,
  ChevronLeft,
  Send,
  Tag,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Device {
  id: string;
  referenceNumber: string;
  deviceName: string;
  modelNumber: string;
  manufacturer: string;
  deviceClass: string;
  status: string;
  description: string;
  diRecords: DIRecord[];
  piRecords: PIRecord[];
  submissions: Submission[];
  createdAt: string;
  updatedAt: string;
}

interface DIRecord {
  id: string;
  diNumber: string;
  issuingAgency: string;
  status: string;
  createdAt: string;
}

interface PIRecord {
  id: string;
  lotNumber: string;
  serialNumber: string;
  manufacturingDate: string;
  expirationDate: string;
  createdAt: string;
}

interface Submission {
  id: string;
  database: string;
  submissionDate: string;
  status: string;
  referenceId: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEVICE_CLASSES = ['CLASS_I', 'CLASS_II', 'CLASS_III'] as const;

const DEVICE_STATUSES = ['DRAFT', 'ACTIVE', 'SUSPENDED', 'DISCONTINUED'] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getClassBadgeVariant(
  cls: string
): 'secondary' | 'info' | 'warning' | 'success' | 'danger' | 'outline' {
  switch (cls) {
    case 'CLASS_I':
      return 'info';
    case 'CLASS_II':
      return 'warning';
    case 'CLASS_III':
      return 'danger';
    default:
      return 'outline';
  }
}

function getStatusBadgeVariant(
  status: string
): 'secondary' | 'info' | 'warning' | 'success' | 'danger' | 'outline' {
  switch (status) {
    case 'DRAFT':
      return 'secondary';
    case 'ACTIVE':
      return 'success';
    case 'SUSPENDED':
      return 'warning';
    case 'DISCONTINUED':
      return 'danger';
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

const emptyDeviceForm = {
  deviceName: '',
  modelNumber: '',
  manufacturer: '',
  deviceClass: 'CLASS_II' as string,
  description: '',
};

const emptyDIForm = {
  diNumber: '',
  issuingAgency: 'GS1',
};

const emptyPIForm = {
  lotNumber: '',
  serialNumber: '',
  manufacturingDate: '',
  expirationDate: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function UDIClient() {
  // View state
  const [view, setView] = useState<'list' | 'detail'>('list');

  // Data state
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDIModal, setShowDIModal] = useState(false);
  const [showPIModal, setShowPIModal] = useState(false);

  // Form state
  const [form, setForm] = useState(emptyDeviceForm);
  const [diForm, setDIForm] = useState(emptyDIForm);
  const [piForm, setPIForm] = useState(emptyPIForm);

  // Common state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  // Detail tabs
  const [activeTab, setActiveTab] = useState<'di' | 'pi' | 'submissions'>('di');

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/udi/devices');
      setDevices(response.data.data || []);
    } catch (err) {
      console.error('Failed to load devices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const fetchDeviceDetail = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/udi/devices/${id}`);
      setSelectedDevice(response.data.data);
    } catch (err) {
      console.error('Failed to load device detail:', err);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      setError('');
      try {
        await api.post('/udi/devices', form);
        setShowCreateModal(false);
        setForm(emptyDeviceForm);
        fetchDevices();
      } catch (err) {
        setError((err as any).response?.data?.message || 'Failed to create device');
      } finally {
        setSubmitting(false);
      }
    },
    [form, fetchDevices]
  );

  const handleAddDI = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedDevice) return;
      setSubmitting(true);
      setError('');
      try {
        await api.post(`/udi/devices/${selectedDevice.id}/di`, diForm);
        setShowDIModal(false);
        setDIForm(emptyDIForm);
        fetchDeviceDetail(selectedDevice.id);
      } catch (err) {
        setError((err as any).response?.data?.message || 'Failed to add DI record');
      } finally {
        setSubmitting(false);
      }
    },
    [selectedDevice, diForm, fetchDeviceDetail]
  );

  const handleAddPI = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedDevice) return;
      setSubmitting(true);
      setError('');
      try {
        await api.post(`/udi/devices/${selectedDevice.id}/pi`, piForm);
        setShowPIModal(false);
        setPIForm(emptyPIForm);
        fetchDeviceDetail(selectedDevice.id);
      } catch (err) {
        setError((err as any).response?.data?.message || 'Failed to add PI record');
      } finally {
        setSubmitting(false);
      }
    },
    [selectedDevice, piForm, fetchDeviceDetail]
  );

  const openDetail = useCallback(
    async (device: Device) => {
      await fetchDeviceDetail(device.id);
      setActiveTab('di');
      setView('detail');
    },
    [fetchDeviceDetail]
  );

  // ---------------------------------------------------------------------------
  // Filtered data
  // ---------------------------------------------------------------------------

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (classFilter !== 'all' && d.deviceClass !== classFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !d.deviceName?.toLowerCase().includes(q) &&
          !d.referenceNumber?.toLowerCase().includes(q) &&
          !d.modelNumber?.toLowerCase().includes(q) &&
          !d.manufacturer?.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [devices, statusFilter, classFilter, searchQuery]);

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const stats = useMemo(() => {
    return {
      total: devices.length,
      active: devices.filter((d) => d.status === 'ACTIVE').length,
      classI: devices.filter((d) => d.deviceClass === 'CLASS_I').length,
      classII: devices.filter((d) => d.deviceClass === 'CLASS_II').length,
      classIII: devices.filter((d) => d.deviceClass === 'CLASS_III').length,
    };
  }, [devices]);

  // ---------------------------------------------------------------------------
  // Loading spinner
  // ---------------------------------------------------------------------------

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      <span className="ml-3 text-gray-500 dark:text-gray-400">Loading devices...</span>
    </div>
  );

  // ---------------------------------------------------------------------------
  // DETAIL VIEW
  // ---------------------------------------------------------------------------

  if (view === 'detail' && selectedDevice) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back navigation */}
          <button
            onClick={() => {
              setView('list');
              setSelectedDevice(null);
            }}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to UDI Management
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* Device Info Card */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {selectedDevice.referenceNumber}
                    </h1>
                    <Badge variant={getClassBadgeVariant(selectedDevice.deviceClass)}>
                      {selectedDevice.deviceClass?.replace(/_/g, ' ')}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(selectedDevice.status)}>
                      {selectedDevice.status}
                    </Badge>
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">
                    {selectedDevice.deviceName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Model: {selectedDevice.modelNumber} | Manufacturer:{' '}
                    {selectedDevice.manufacturer}
                  </p>
                </div>
              </div>

              {selectedDevice.description && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {selectedDevice.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                    DI Records
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                    {selectedDevice.diRecords?.length || 0}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                    PI Records
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                    {selectedDevice.piRecords?.length || 0}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Submissions
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                    {selectedDevice.submissions?.length || 0}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Created
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(selectedDevice.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('di')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'di'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              DI Records ({selectedDevice.diRecords?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('pi')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pi'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              PI Records ({selectedDevice.piRecords?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'submissions'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              Submissions ({selectedDevice.submissions?.length || 0})
            </button>
          </div>

          {/* DI Records Tab */}
          {activeTab === 'di' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Device Identifier (DI) Records</CardTitle>
                  <Button
                    onClick={() => {
                      setDIForm(emptyDIForm);
                      setError('');
                      setShowDIModal(true);
                    }}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add DI
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedDevice.diRecords && selectedDevice.diRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            DI Number
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Issuing Agency
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Status
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedDevice.diRecords.map((di) => (
                          <tr key={di.id} className="hover:bg-gray-50 dark:bg-gray-800">
                            <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-100">
                              {di.diNumber}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {di.issuingAgency}
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={di.status === 'ACTIVE' ? 'success' : 'secondary'}>
                                {di.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {formatDate(di.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Barcode className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No DI records yet. Add the first Device Identifier.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* PI Records Tab */}
          {activeTab === 'pi' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Production Identifier (PI) Records</CardTitle>
                  <Button
                    onClick={() => {
                      setPIForm(emptyPIForm);
                      setError('');
                      setShowPIModal(true);
                    }}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add PI
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedDevice.piRecords && selectedDevice.piRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Lot Number
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Serial Number
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Mfg Date
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Exp Date
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedDevice.piRecords.map((pi) => (
                          <tr key={pi.id} className="hover:bg-gray-50 dark:bg-gray-800">
                            <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-100">
                              {pi.lotNumber || '--'}
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-gray-700 dark:text-gray-300">
                              {pi.serialNumber || '--'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {formatDate(pi.manufacturingDate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {formatDate(pi.expirationDate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {formatDate(pi.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Tag className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No PI records yet. Add lot/serial/date information.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Database Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDevice.submissions && selectedDevice.submissions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Database
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Submission Date
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Status
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                            Reference ID
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedDevice.submissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-gray-50 dark:bg-gray-800">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                              {sub.database}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {formatDate(sub.submissionDate)}
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant={
                                  sub.status === 'ACCEPTED'
                                    ? 'success'
                                    : sub.status === 'PENDING'
                                      ? 'warning'
                                      : 'secondary'
                                }
                              >
                                {sub.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-gray-700 dark:text-gray-300">
                              {sub.referenceId || '--'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Send className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No database submissions yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ==================================================================== */}
        {/* MODAL: Add DI Record                                                 */}
        {/* ==================================================================== */}
        <Modal
          isOpen={showDIModal}
          onClose={() => setShowDIModal(false)}
          title="Add Device Identifier (DI)"
          size="md"
        >
          <form onSubmit={handleAddDI}>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <Label htmlFor="di-number">DI Number *</Label>
                <Input
                  id="di-number"
                  value={diForm.diNumber}
                  onChange={(e) => setDIForm({ ...diForm, diNumber: e.target.value })}
                  required
                  placeholder="e.g. (01)00884838000025"
                />
              </div>
              <div>
                <Label htmlFor="di-agency">Issuing Agency *</Label>
                <Select
                  id="di-agency"
                  value={diForm.issuingAgency}
                  onChange={(e) => setDIForm({ ...diForm, issuingAgency: e.target.value })}
                >
                  <option value="GS1">GS1</option>
                  <option value="HIBCC">HIBCC</option>
                  <option value="ICCBBA">ICCBBA</option>
                  <option value="IFA">IFA</option>
                </Select>
              </div>
            </div>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setShowDIModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </span>
                ) : (
                  'Add DI Record'
                )}
              </Button>
            </ModalFooter>
          </form>
        </Modal>

        {/* ==================================================================== */}
        {/* MODAL: Add PI Record                                                 */}
        {/* ==================================================================== */}
        <Modal
          isOpen={showPIModal}
          onClose={() => setShowPIModal(false)}
          title="Add Production Identifier (PI)"
          size="md"
        >
          <form onSubmit={handleAddPI}>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pi-lot">Lot Number</Label>
                  <Input
                    id="pi-lot"
                    value={piForm.lotNumber}
                    onChange={(e) => setPIForm({ ...piForm, lotNumber: e.target.value })}
                    placeholder="e.g. LOT-2026-001"
                  />
                </div>
                <div>
                  <Label htmlFor="pi-serial">Serial Number</Label>
                  <Input
                    id="pi-serial"
                    value={piForm.serialNumber}
                    onChange={(e) => setPIForm({ ...piForm, serialNumber: e.target.value })}
                    placeholder="e.g. SN-123456"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pi-mfg-date">Manufacturing Date</Label>
                  <Input
                    id="pi-mfg-date"
                    type="date"
                    value={piForm.manufacturingDate}
                    onChange={(e) => setPIForm({ ...piForm, manufacturingDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pi-exp-date">Expiration Date</Label>
                  <Input
                    id="pi-exp-date"
                    type="date"
                    value={piForm.expirationDate}
                    onChange={(e) => setPIForm({ ...piForm, expirationDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setShowPIModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </span>
                ) : (
                  'Add PI Record'
                )}
              </Button>
            </ModalFooter>
          </form>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">UDI Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Unique Device Identification System Management
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Devices</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Box className="h-8 w-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Class II</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.classII}</p>
                </div>
                <Barcode className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Class III</p>
                  <p className="text-3xl font-bold text-red-600">{stats.classIII}</p>
                </div>
                <Barcode className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              aria-label="Search by device name, reference, model, or manufacturer..."
              placeholder="Search by device name, reference, model, or manufacturer..."
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
            {(statusFilter !== 'all' || classFilter !== 'all') && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-700">
                Active
              </span>
            )}
          </Button>

          <Button
            onClick={() => {
              setForm(emptyDeviceForm);
              setError('');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            New Device
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
                {DEVICE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Device Class</Label>
              <Select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-40"
              >
                <option value="all">All Classes</option>
                {DEVICE_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter('all');
                setClassFilter('all');
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
            Showing {filteredDevices.length} of {devices.length} devices
          </p>
        </div>

        {/* Devices Table */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredDevices.length > 0 ? (
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
                        Model
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                        Manufacturer
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                        Class
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDevices.map((d) => (
                      <tr
                        key={d.id}
                        className="hover:bg-gray-50 dark:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => openDetail(d)}
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-gray-600">
                            {d.referenceNumber || '--'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {d.deviceName}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {d.modelNumber || '--'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {d.manufacturer || '--'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getClassBadgeVariant(d.deviceClass)}>
                            {d.deviceClass?.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusBadgeVariant(d.status)}>{d.status}</Badge>
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
            <Barcode className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No devices found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Register medical devices and manage their UDI records.
            </p>
            <Button
              onClick={() => {
                setForm(emptyDeviceForm);
                setError('');
                setShowCreateModal(true);
              }}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Register First Device
            </Button>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL: Create Device                                                 */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Register New Device"
        size="lg"
      >
        <form onSubmit={handleCreate}>
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="d-deviceName">Device Name *</Label>
              <Input
                id="d-deviceName"
                value={form.deviceName}
                onChange={(e) => setForm({ ...form, deviceName: e.target.value })}
                required
                placeholder="e.g. CardioMonitor Pro 3000"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="d-modelNumber">Model Number *</Label>
                <Input
                  id="d-modelNumber"
                  value={form.modelNumber}
                  onChange={(e) => setForm({ ...form, modelNumber: e.target.value })}
                  required
                  placeholder="e.g. CM-3000"
                />
              </div>
              <div>
                <Label htmlFor="d-manufacturer">Manufacturer *</Label>
                <Input
                  id="d-manufacturer"
                  value={form.manufacturer}
                  onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                  required
                  placeholder="e.g. MedTech Corp"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="d-deviceClass">Device Class *</Label>
              <Select
                id="d-deviceClass"
                value={form.deviceClass}
                onChange={(e) => setForm({ ...form, deviceClass: e.target.value })}
              >
                {DEVICE_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="d-description">Description</Label>
              <Textarea
                id="d-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Optional device description"
              />
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Register Device'
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
