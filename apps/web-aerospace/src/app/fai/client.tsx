'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card, CardContent,
  Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
} from '@ims/ui';
import {
  Plus, Search, Loader2, FileCheck,
  ClipboardList, CheckCircle2, Clock,
  AlertTriangle, ArrowLeft, Save,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FAI {
  id: string;
  refNumber: string;
  title: string;
  partNumber: string;
  partName: string;
  revision: string;
  drawingNumber: string;
  customer: string;
  poNumber: string;
  faiType: string;
  status: string;
  part1Status: string;
  part2Status: string;
  part3Status: string;
  part1Data?: DesignCharacteristic[];
  part2Data?: ManufacturingDoc[];
  part3Data?: TestResult[];
  openItems?: string;
  createdAt: string;
  updatedAt: string;
}

interface DesignCharacteristic {
  charNumber: string;
  characteristicName: string;
  nominal: string;
  tolerance: string;
  actual: string;
  pass: boolean;
}

interface ManufacturingDoc {
  documentType: string;
  docNumber: string;
  revision: string;
  available: boolean;
}

interface TestResult {
  testName: string;
  testMethod: string;
  requirement: string;
  result: string;
  pass: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FAI_TYPES = ['FULL', 'PARTIAL', 'DELTA'] as const;

const FAI_STATUSES = [
  'PLANNING',
  'IN_PROGRESS',
  'COMPLETED',
  'APPROVED',
  'PARTIAL_APPROVAL',
  'REJECTED',
] as const;

const PART_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'NEEDS_REVIEW'] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'secondary' | 'danger' | 'destructive' {
  switch (status) {
    case 'APPROVED': return 'success';
    case 'IN_PROGRESS': return 'info';
    case 'PLANNING': return 'secondary';
    case 'COMPLETED': return 'success';
    case 'PARTIAL_APPROVAL': return 'warning';
    case 'REJECTED': return 'destructive';
    default: return 'info';
  }
}

function getPartStatusColor(status: string): string {
  switch (status) {
    case 'NOT_STARTED': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300';
    case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-300';
    case 'NEEDS_REVIEW': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300';
  }
}

function getFaiTypeBadge(faiType: string): string {
  switch (faiType) {
    case 'FULL': return 'bg-indigo-100 text-indigo-700 border-indigo-300';
    case 'PARTIAL': return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'DELTA': return 'bg-cyan-100 text-cyan-700 border-cyan-300';
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300';
  }
}

// ---------------------------------------------------------------------------
// Empty form state
// ---------------------------------------------------------------------------

const emptyForm = {
  title: '',
  partNumber: '',
  partName: '',
  revision: '',
  drawingNumber: '',
  customer: '',
  poNumber: '',
  faiType: 'FULL' as string,
};

const emptyCharacteristic: DesignCharacteristic = {
  charNumber: '',
  characteristicName: '',
  nominal: '',
  tolerance: '',
  actual: '',
  pass: false,
};

const emptyDoc: ManufacturingDoc = {
  documentType: '',
  docNumber: '',
  revision: '',
  available: false,
};

const emptyTestResult: TestResult = {
  testName: '',
  testMethod: '',
  requirement: '',
  result: '',
  pass: false,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FAIClient() {
  // Data state
  const [items, setItems] = useState<FAI[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Detail view state
  const [selectedItem, setSelectedItem] = useState<FAI | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);

  // Part data editing
  const [part1Data, setPart1Data] = useState<DesignCharacteristic[]>([]);
  const [part2Data, setPart2Data] = useState<ManufacturingDoc[]>([]);
  const [part3Data, setPart3Data] = useState<TestResult[]>([]);
  const [partSaving, setPartSaving] = useState(false);

  // Approve / Partial
  const [showPartialModal, setShowPartialModal] = useState(false);
  const [partialOpenItems, setPartialOpenItems] = useState('');

  // Form state
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [faiTypeFilter, setFaiTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/fai');
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load FAIs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const response = await api.get(`/fai/${id}`);
      const fai = response.data.data;
      setSelectedItem(fai);
      setPart1Data(fai.part1Data || []);
      setPart2Data(fai.part2Data || []);
      setPart3Data(fai.part3Data || []);
      setActiveTab(1);
    } catch (err) {
      console.error('Failed to load FAI detail:', err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ---------------------------------------------------------------------------
  // Submit handlers
  // ---------------------------------------------------------------------------

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/fai', form);
      setShowCreateModal(false);
      setForm(emptyForm);
      fetchItems();
    } catch (err: unknown) {
      setError(err.response?.data?.message || 'Failed to create FAI');
      console.error('Failed to create FAI:', err);
    } finally {
      setSubmitting(false);
    }
  }, [form, fetchItems]);

  const handleSavePart1 = useCallback(async () => {
    if (!selectedItem) return;
    setPartSaving(true);
    try {
      await api.put(`/fai/${selectedItem.id}/part1`, { characteristics: part1Data });
      await fetchDetail(selectedItem.id);
    } catch (err: unknown) {
      console.error('Failed to save Part 1:', err);
      alert(err.response?.data?.message || 'Failed to save Part 1 data');
    } finally {
      setPartSaving(false);
    }
  }, [selectedItem, part1Data, fetchDetail]);

  const handleSavePart2 = useCallback(async () => {
    if (!selectedItem) return;
    setPartSaving(true);
    try {
      await api.put(`/fai/${selectedItem.id}/part2`, { documents: part2Data });
      await fetchDetail(selectedItem.id);
    } catch (err: unknown) {
      console.error('Failed to save Part 2:', err);
      alert(err.response?.data?.message || 'Failed to save Part 2 data');
    } finally {
      setPartSaving(false);
    }
  }, [selectedItem, part2Data, fetchDetail]);

  const handleSavePart3 = useCallback(async () => {
    if (!selectedItem) return;
    setPartSaving(true);
    try {
      await api.put(`/fai/${selectedItem.id}/part3`, { tests: part3Data });
      await fetchDetail(selectedItem.id);
    } catch (err: unknown) {
      console.error('Failed to save Part 3:', err);
      alert(err.response?.data?.message || 'Failed to save Part 3 data');
    } finally {
      setPartSaving(false);
    }
  }, [selectedItem, part3Data, fetchDetail]);

  const handleApprove = useCallback(async () => {
    if (!selectedItem) return;
    if (!confirm('Approve this FAI? This marks all parts as accepted.')) return;
    try {
      await api.post(`/fai/${selectedItem.id}/approve`);
      await fetchDetail(selectedItem.id);
      fetchItems();
    } catch (err: unknown) {
      console.error('Failed to approve FAI:', err);
      alert(err.response?.data?.message || 'Failed to approve FAI');
    }
  }, [selectedItem, fetchDetail, fetchItems]);

  const handlePartialApproval = useCallback(async () => {
    if (!selectedItem) return;
    try {
      await api.post(`/fai/${selectedItem.id}/partial`, { openItems: partialOpenItems });
      setShowPartialModal(false);
      setPartialOpenItems('');
      await fetchDetail(selectedItem.id);
      fetchItems();
    } catch (err: unknown) {
      console.error('Failed to mark partial approval:', err);
      alert(err.response?.data?.message || 'Failed to mark partial approval');
    }
  }, [selectedItem, partialOpenItems, fetchDetail, fetchItems]);

  // ---------------------------------------------------------------------------
  // Part data editing helpers
  // ---------------------------------------------------------------------------

  const updatePart1Row = (index: number, field: keyof DesignCharacteristic, value: string | boolean) => {
    setPart1Data(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const addPart1Row = () => {
    setPart1Data(prev => [...prev, { ...emptyCharacteristic, charNumber: String(prev.length + 1) }]);
  };

  const removePart1Row = (index: number) => {
    setPart1Data(prev => prev.filter((_, i) => i !== index));
  };

  const updatePart2Row = (index: number, field: keyof ManufacturingDoc, value: string | boolean) => {
    setPart2Data(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const addPart2Row = () => {
    setPart2Data(prev => [...prev, { ...emptyDoc }]);
  };

  const removePart2Row = (index: number) => {
    setPart2Data(prev => prev.filter((_, i) => i !== index));
  };

  const updatePart3Row = (index: number, field: keyof TestResult, value: string | boolean) => {
    setPart3Data(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const addPart3Row = () => {
    setPart3Data(prev => [...prev, { ...emptyTestResult }]);
  };

  const removePart3Row = (index: number) => {
    setPart3Data(prev => prev.filter((_, i) => i !== index));
  };

  // ---------------------------------------------------------------------------
  // Filtered data
  // ---------------------------------------------------------------------------

  const filteredItems = useMemo(() => items.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (faiTypeFilter !== 'all' && item.faiType !== faiTypeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !item.title.toLowerCase().includes(query) &&
        !item.refNumber.toLowerCase().includes(query) &&
        !item.partNumber.toLowerCase().includes(query) &&
        !(item.customer || '').toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  }), [items, statusFilter, faiTypeFilter, searchQuery]);

  // ---------------------------------------------------------------------------
  // Summary stats
  // ---------------------------------------------------------------------------

  const summaryStats = useMemo(() => ({
    total: items.length,
    planning: items.filter(i => i.status === 'PLANNING').length,
    inProgress: items.filter(i => i.status === 'IN_PROGRESS').length,
    approved: items.filter(i => i.status === 'APPROVED').length,
    partial: items.filter(i => i.status === 'PARTIAL_APPROVAL').length,
  }), [items]);

  // ---------------------------------------------------------------------------
  // Loading spinner
  // ---------------------------------------------------------------------------

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      <span className="ml-3 text-gray-500 dark:text-gray-400">Loading First Article Inspections...</span>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Detail View (replaces the list when an item is selected)
  // ---------------------------------------------------------------------------

  if (selectedItem) {
    const allPartsCompleted =
      selectedItem.part1Status === 'COMPLETED' &&
      selectedItem.part2Status === 'COMPLETED' &&
      selectedItem.part3Status === 'COMPLETED';

    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back button + header */}
          <div className="mb-6">
            <button
              onClick={() => { setSelectedItem(null); fetchItems(); }}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to FAI List
            </button>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{selectedItem.title}</h1>
                <p className="text-sm font-mono text-indigo-600 mt-1">{selectedItem.refNumber}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant={getStatusVariant(selectedItem.status)}>
                    {selectedItem.status?.replace(/_/g, ' ')}
                  </Badge>
                  <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border ${getFaiTypeBadge(selectedItem.faiType)}`}>
                    {selectedItem.faiType}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {allPartsCompleted && selectedItem.status !== 'APPROVED' && (
                  <Button
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve FAI
                  </Button>
                )}
                {selectedItem.status !== 'APPROVED' && (
                  <Button
                    variant="outline"
                    onClick={() => { setPartialOpenItems(selectedItem.openItems || ''); setShowPartialModal(true); }}
                    className="flex items-center gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Mark Partial
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* FAI metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Part Number</p>
              <p className="text-sm font-mono font-medium mt-1">{selectedItem.partNumber}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Part Name</p>
              <p className="text-sm font-medium mt-1">{selectedItem.partName || '--'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Revision</p>
              <p className="text-sm font-mono font-medium mt-1">{selectedItem.revision}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Drawing Number</p>
              <p className="text-sm font-mono font-medium mt-1">{selectedItem.drawingNumber || '--'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
              <p className="text-sm font-medium mt-1">{selectedItem.customer || '--'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">PO Number</p>
              <p className="text-sm font-mono font-medium mt-1">{selectedItem.poNumber || '--'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
              <p className="text-sm font-medium mt-1">{new Date(selectedItem.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Updated</p>
              <p className="text-sm font-medium mt-1">{new Date(selectedItem.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Open Items notice */}
          {selectedItem.openItems && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-amber-800 mb-1">Open Items (Partial Approval)</h3>
              <p className="text-sm text-amber-700 whitespace-pre-wrap">{selectedItem.openItems}</p>
            </div>
          )}

          {/* Three-tab layout */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Tab headers */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              {[
                { num: 1 as const, label: 'Part 1 -- Design Characteristics', status: selectedItem.part1Status },
                { num: 2 as const, label: 'Part 2 -- Manufacturing Process', status: selectedItem.part2Status },
                { num: 3 as const, label: 'Part 3 -- Test Results', status: selectedItem.part3Status },
              ].map(tab => (
                <button
                  key={tab.num}
                  onClick={() => setActiveTab(tab.num)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === tab.num
                      ? 'bg-white dark:bg-gray-900 text-indigo-700 border-b-2 border-indigo-600'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getPartStatusColor(tab.status)}`}>
                    {tab.status?.replace(/_/g, ' ')}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  <span className="ml-2 text-gray-500 dark:text-gray-400">Loading...</span>
                </div>
              ) : (
                <>
                  {/* ===== PART 1: Design Characteristics ===== */}
                  {activeTab === 1 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          AS9102 Part 1 -- Design Characteristics
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={addPart1Row}
                            className="flex items-center gap-1 text-sm"
                          >
                            <Plus className="h-4 w-4" />
                            Add Row
                          </Button>
                          <Button
                            onClick={handleSavePart1}
                            disabled={partSaving}
                            className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1 text-sm"
                          >
                            {partSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Part 1
                          </Button>
                        </div>
                      </div>
                      {part1Data.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 w-16">Char #</th>
                                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">Characteristic Name</th>
                                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 w-28">Nominal</th>
                                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 w-28">Tolerance</th>
                                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 w-28">Actual</th>
                                <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 w-16">Pass</th>
                                <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 w-12"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                              {part1Data.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:bg-gray-800">
                                  <td className="px-3 py-2">
                                    <Input
                                      value={row.charNumber}
                                      onChange={(e) => updatePart1Row(idx, 'charNumber', e.target.value)}
                                      className="w-14 text-sm"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                      value={row.characteristicName}
                                      onChange={(e) => updatePart1Row(idx, 'characteristicName', e.target.value)}
                                      className="text-sm"
                                      placeholder="e.g. Diameter, Length, Surface Finish"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                      value={row.nominal}
                                      onChange={(e) => updatePart1Row(idx, 'nominal', e.target.value)}
                                      className="w-24 text-sm"
                                      placeholder="10.000"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                      value={row.tolerance}
                                      onChange={(e) => updatePart1Row(idx, 'tolerance', e.target.value)}
                                      className="w-24 text-sm"
                                      placeholder="+/- 0.005"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                      value={row.actual}
                                      onChange={(e) => updatePart1Row(idx, 'actual', e.target.value)}
                                      className="w-24 text-sm bg-indigo-50 border-indigo-200 focus:border-indigo-400"
                                      placeholder="Measured"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={row.pass}
                                      onChange={(e) => updatePart1Row(idx, 'pass', e.target.checked)}
                                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <button
                                      onClick={() => removePart1Row(idx)}
                                      className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                                      title="Remove row"
                                    >
                                      &times;
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                          <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm">No design characteristics recorded yet.</p>
                          <p className="text-xs mt-1">Click "Add Row" to start entering AS9102 Part 1 data.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===== PART 2: Manufacturing Process Documentation ===== */}
                  {activeTab === 2 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          AS9102 Part 2 -- Manufacturing Process Documentation
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={addPart2Row}
                            className="flex items-center gap-1 text-sm"
                          >
                            <Plus className="h-4 w-4" />
                            Add Row
                          </Button>
                          <Button
                            onClick={handleSavePart2}
                            disabled={partSaving}
                            className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1 text-sm"
                          >
                            {partSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Part 2
                          </Button>
                        </div>
                      </div>
                      {part2Data.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">Document Type</th>
                                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">Doc Number</th>
                                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 w-28">Revision</th>
                                <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 w-24">Available</th>
                                <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 w-12"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                              {part2Data.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:bg-gray-800">
                                  <td className="px-3 py-2">
                                    <Input
                                      value={row.documentType}
                                      onChange={(e) => updatePart2Row(idx, 'documentType', e.target.value)}
                                      className="text-sm"
                                      placeholder="e.g. Work Instruction, Process Spec"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                      value={row.docNumber}
                                      onChange={(e) => updatePart2Row(idx, 'docNumber', e.target.value)}
                                      className="text-sm"
                                      placeholder="e.g. WI-2026-001"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                      value={row.revision}
                                      onChange={(e) => updatePart2Row(idx, 'revision', e.target.value)}
                                      className="w-24 text-sm"
                                      placeholder="Rev A"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={row.available}
                                      onChange={(e) => updatePart2Row(idx, 'available', e.target.checked)}
                                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <button
                                      onClick={() => removePart2Row(idx)}
                                      className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                                      title="Remove row"
                                    >
                                      &times;
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                          <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm">No manufacturing documents recorded yet.</p>
                          <p className="text-xs mt-1">Click "Add Row" to start entering AS9102 Part 2 data.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===== PART 3: Test Results ===== */}
                  {activeTab === 3 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          AS9102 Part 3 -- Test Results
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={addPart3Row}
                            className="flex items-center gap-1 text-sm"
                          >
                            <Plus className="h-4 w-4" />
                            Add Row
                          </Button>
                          <Button
                            onClick={handleSavePart3}
                            disabled={partSaving}
                            className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1 text-sm"
                          >
                            {partSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Part 3
                          </Button>
                        </div>
                      </div>
                      {part3Data.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">Test Name</th>
                                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">Test Method</th>
                                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">Requirement</th>
                                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 w-28">Result</th>
                                <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 w-16">Pass</th>
                                <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 w-12"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                              {part3Data.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:bg-gray-800">
                                  <td className="px-3 py-2">
                                    <Input
                                      value={row.testName}
                                      onChange={(e) => updatePart3Row(idx, 'testName', e.target.value)}
                                      className="text-sm"
                                      placeholder="e.g. Tensile Strength Test"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                      value={row.testMethod}
                                      onChange={(e) => updatePart3Row(idx, 'testMethod', e.target.value)}
                                      className="text-sm"
                                      placeholder="e.g. ASTM E8"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                      value={row.requirement}
                                      onChange={(e) => updatePart3Row(idx, 'requirement', e.target.value)}
                                      className="text-sm"
                                      placeholder="e.g. >= 60 ksi"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <Input
                                      value={row.result}
                                      onChange={(e) => updatePart3Row(idx, 'result', e.target.value)}
                                      className="w-24 text-sm bg-indigo-50 border-indigo-200 focus:border-indigo-400"
                                      placeholder="Measured"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={row.pass}
                                      onChange={(e) => updatePart3Row(idx, 'pass', e.target.checked)}
                                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <button
                                      onClick={() => removePart3Row(idx)}
                                      className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                                      title="Remove row"
                                    >
                                      &times;
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                          <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm">No test results recorded yet.</p>
                          <p className="text-xs mt-1">Click "Add Row" to start entering AS9102 Part 3 data.</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Partial Approval Modal */}
        <Modal isOpen={showPartialModal} onClose={() => setShowPartialModal(false)} title="Mark Partial Approval" size="lg">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Record open items that prevent full approval. The FAI will be marked as partially approved with these noted discrepancies.
            </p>
            <div>
              <Label htmlFor="partial-open-items">Open Items / Discrepancies</Label>
              <Textarea
                id="partial-open-items"
                value={partialOpenItems}
                onChange={(e) => setPartialOpenItems(e.target.value)}
                rows={6}
                placeholder="Describe the open items, missing data, or discrepancies that need to be resolved..."
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowPartialModal(false)}>Cancel</Button>
            <Button
              onClick={handlePartialApproval}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Mark Partial Approval
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // List View (main render)
  // ---------------------------------------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">First Article Inspection</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">AS9102 -- First Article Inspection Requirements</p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total FAIs</p>
                  <p className="text-3xl font-bold">{summaryStats.total}</p>
                </div>
                <FileCheck className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Planning</p>
                  <p className="text-3xl font-bold text-gray-600">{summaryStats.planning}</p>
                </div>
                <Clock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600">{summaryStats.inProgress}</p>
                </div>
                <Loader2 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{summaryStats.approved}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Partial Approvals</p>
                  <p className="text-3xl font-bold text-amber-600">{summaryStats.partial}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-44"
          >
            <option value="all">All Statuses</option>
            {FAI_STATUSES.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </Select>
          <Select
            value={faiTypeFilter}
            onChange={(e) => setFaiTypeFilter(e.target.value)}
            className="w-36"
          >
            <option value="all">All Types</option>
            {FAI_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              aria-label="Search by title, ref number, part number..." placeholder="Search by title, ref number, part number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => { setForm(emptyForm); setError(''); setShowCreateModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Create FAI
          </Button>
        </div>

        {/* Content */}
        {loading ? <LoadingSpinner /> : filteredItems.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Ref Number</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Title</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Part Number</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Rev</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Customer</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Type</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Status</th>
                      <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-3">Part 1</th>
                      <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-3">Part 2</th>
                      <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-3">Part 3</th>
                      <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => fetchDetail(item.id)}
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-indigo-600 font-medium">{item.refNumber}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{item.partNumber}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-gray-600">{item.revision}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.customer || '--'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border ${getFaiTypeBadge(item.faiType)}`}>
                            {item.faiType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getStatusVariant(item.status)}>
                            {item.status?.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border ${getPartStatusColor(item.part1Status)}`}>
                            {item.part1Status === 'NOT_STARTED' ? 'N/S' :
                             item.part1Status === 'IN_PROGRESS' ? 'WIP' :
                             item.part1Status === 'COMPLETED' ? 'Done' :
                             item.part1Status === 'NEEDS_REVIEW' ? 'Rev' : '--'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border ${getPartStatusColor(item.part2Status)}`}>
                            {item.part2Status === 'NOT_STARTED' ? 'N/S' :
                             item.part2Status === 'IN_PROGRESS' ? 'WIP' :
                             item.part2Status === 'COMPLETED' ? 'Done' :
                             item.part2Status === 'NEEDS_REVIEW' ? 'Rev' : '--'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border ${getPartStatusColor(item.part3Status)}`}>
                            {item.part3Status === 'NOT_STARTED' ? 'N/S' :
                             item.part3Status === 'IN_PROGRESS' ? 'WIP' :
                             item.part3Status === 'COMPLETED' ? 'Done' :
                             item.part3Status === 'NEEDS_REVIEW' ? 'Rev' : '--'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 inline" />
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
            <FileCheck className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No First Article Inspections found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create an FAI to begin documenting first article inspections per AS9102 requirements.
            </p>
            <Button
              onClick={() => { setForm(emptyForm); setError(''); setShowCreateModal(true); }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First FAI
            </Button>
          </div>
        )}

        {/* Results count */}
        {!loading && items.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredItems.length} of {items.length} first article inspections
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL: Create FAI                                                    */}
      {/* ==================================================================== */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create First Article Inspection" size="lg">
        <form onSubmit={handleCreate}>
          <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Section A: FAI Identification */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                FAI Identification
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fai-title">Title *</Label>
                  <Input
                    id="fai-title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="e.g. FCU-200 First Article Inspection"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fai-partNumber">Part Number *</Label>
                    <Input
                      id="fai-partNumber"
                      value={form.partNumber}
                      onChange={(e) => setForm({ ...form, partNumber: e.target.value })}
                      required
                      placeholder="e.g. PN-12345-01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fai-partName">Part Name</Label>
                    <Input
                      id="fai-partName"
                      value={form.partName}
                      onChange={(e) => setForm({ ...form, partName: e.target.value })}
                      placeholder="e.g. Flight Control Unit Housing"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fai-revision">Revision *</Label>
                    <Input
                      id="fai-revision"
                      value={form.revision}
                      onChange={(e) => setForm({ ...form, revision: e.target.value })}
                      required
                      placeholder="e.g. A, B, C or 1.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fai-drawingNumber">Drawing Number</Label>
                    <Input
                      id="fai-drawingNumber"
                      value={form.drawingNumber}
                      onChange={(e) => setForm({ ...form, drawingNumber: e.target.value })}
                      placeholder="e.g. DWG-2026-0042"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section B: Customer & Order */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                Customer & Order
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fai-customer">Customer</Label>
                    <Input
                      id="fai-customer"
                      value={form.customer}
                      onChange={(e) => setForm({ ...form, customer: e.target.value })}
                      placeholder="e.g. Boeing, Airbus"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fai-poNumber">PO Number</Label>
                    <Input
                      id="fai-poNumber"
                      value={form.poNumber}
                      onChange={(e) => setForm({ ...form, poNumber: e.target.value })}
                      placeholder="e.g. PO-2026-5678"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fai-faiType">FAI Type *</Label>
                  <Select
                    id="fai-faiType"
                    value={form.faiType}
                    onChange={(e) => setForm({ ...form, faiType: e.target.value })}
                  >
                    {FAI_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Select>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Full = complete new FAI, Partial = subset of characteristics, Delta = changes only
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating...</span>
              ) : 'Create FAI'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
