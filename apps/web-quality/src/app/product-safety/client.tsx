'use client';

import { useEffect, useState, useCallback } from 'react';
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
  Textarea } from '@ims/ui';
import {
  Shield,
  Plus,
  Search,
  AlertTriangle,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Beaker } from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SafetyCharacteristic {
  id: string;
  refNumber: string;
  partNumber: string;
  partName: string;
  characteristicType: string;
  description: string;
  controlMethod: string;
  measurementMethod?: string;
  tolerance?: string;
  linkedFmeaId?: string;
  linkedControlPlanId?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SafetyIncident {
  id: string;
  refNumber: string;
  title: string;
  description: string;
  product: string;
  partNumber?: string;
  severity: string;
  source: string;
  affectedCharacteristicId?: string;
  immediateAction?: string;
  rootCause?: string;
  correctiveAction?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface RecallAction {
  id: string;
  refNumber: string;
  product: string;
  reason: string;
  scope: string;
  affectedQuantity: number;
  linkedIncidentId?: string;
  regulatoryBody?: string;
  customerNotified: boolean;
  regulatoryNotified: boolean;
  containmentAction?: string;
  correctiveAction?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ComplianceRecord {
  id: string;
  partNumber: string;
  partName: string;
  regulation: string;
  status: string;
  certificateRef?: string;
  expiryDate?: string;
  substances?: string;
  notes?: string;
  createdAt: string;
}

type TabType = 'characteristics' | 'incidents' | 'recalls' | 'compliance';

const CHAR_TYPE_COLORS: Record<string, string> = {
  SC: 'bg-red-100 text-red-800',
  CC: 'bg-orange-100 text-orange-800',
  KPC: 'bg-blue-100 text-blue-800' };

const CHAR_TYPE_LABELS: Record<string, string> = {
  SC: 'Safety Characteristic (AS9100)',
  CC: 'Critical Characteristic (IATF)',
  KPC: 'Key Product Characteristic (IATF)' };

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  OPEN: 'bg-red-100 text-red-800',
  INVESTIGATING: 'bg-blue-100 text-blue-800',
  CONTAINED: 'bg-orange-100 text-orange-800',
  CORRECTED: 'bg-teal-100 text-teal-800',
  CLOSED: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  INITIATED: 'bg-yellow-100 text-yellow-800',
  COMPLIANT: 'bg-green-100 text-green-800',
  NON_COMPLIANT: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  EXEMPT: 'bg-gray-100 dark:bg-gray-800 text-gray-600' };

const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800' };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProductSafetyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('characteristics');
  const [characteristics, setCharacteristics] = useState<SafetyCharacteristic[]>([]);
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [recalls, setRecalls] = useState<RecallAction[]>([]);
  const [compliance, setCompliance] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Characteristic modal
  const [showCharModal, setShowCharModal] = useState(false);
  const [charForm, setCharForm] = useState({
    partNumber: '',
    partName: '',
    characteristicType: 'SC',
    description: '',
    controlMethod: '',
    measurementMethod: '',
    tolerance: '' });

  // Incident modal
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    description: '',
    product: '',
    partNumber: '',
    severity: 'MEDIUM',
    source: 'INTERNAL',
    immediateAction: '' });

  // Recall modal
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [recallForm, setRecallForm] = useState({
    product: '',
    reason: '',
    scope: '',
    affectedQuantity: '',
    regulatoryBody: '',
    notes: '' });

  // Compliance modal
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [complianceForm, setComplianceForm] = useState({
    partNumber: '',
    partName: '',
    regulation: 'REACH',
    status: 'PENDING',
    certificateRef: '',
    expiryDate: '',
    substances: '',
    notes: '' });

  // Detail modals
  const [selectedChar, setSelectedChar] = useState<SafetyCharacteristic | null>(null);
  const [showCharDetail, setShowCharDetail] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<SafetyIncident | null>(null);
  const [showIncidentDetail, setShowIncidentDetail] = useState(false);
  const [selectedRecall, setSelectedRecall] = useState<RecallAction | null>(null);
  const [showRecallDetail, setShowRecallDetail] = useState(false);

  const fetchCharacteristics = useCallback(async () => {
    try {
      const params: Record<string, string> = { limit: '50' };
      if (search) params.partNumber = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/product-safety/characteristics', { params });
      setCharacteristics(res.data.data.items || []);
    } catch {
      setCharacteristics([]);
    }
  }, [search, statusFilter]);

  const fetchIncidents = useCallback(async () => {
    try {
      const params: Record<string, string> = { limit: '50' };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/product-safety/incidents', { params });
      setIncidents(res.data.data.items || []);
    } catch {
      setIncidents([]);
    }
  }, [statusFilter]);

  const fetchRecalls = useCallback(async () => {
    try {
      const params: Record<string, string> = { limit: '50' };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/product-safety/recalls', { params });
      setRecalls(res.data.data.items || []);
    } catch {
      setRecalls([]);
    }
  }, [statusFilter]);

  const fetchCompliance = useCallback(async () => {
    try {
      const params: Record<string, string> = { limit: '50' };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/product-safety/compliance', { params });
      setCompliance(res.data.data.items || []);
    } catch {
      setCompliance([]);
    }
  }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchCharacteristics(),
      fetchIncidents(),
      fetchRecalls(),
      fetchCompliance(),
    ]).finally(() => setLoading(false));
  }, [fetchCharacteristics, fetchIncidents, fetchRecalls, fetchCompliance]);

  // Create handlers
  const handleCreateCharacteristic = async () => {
    try {
      await api.post('/product-safety/characteristics', charForm);
      setShowCharModal(false);
      setCharForm({
        partNumber: '',
        partName: '',
        characteristicType: 'SC',
        description: '',
        controlMethod: '',
        measurementMethod: '',
        tolerance: '' });
      fetchCharacteristics();
    } catch (err) {
      console.error('Failed to create characteristic', err);
    }
  };

  const handleCreateIncident = async () => {
    try {
      await api.post('/product-safety/incidents', incidentForm);
      setShowIncidentModal(false);
      setIncidentForm({
        title: '',
        description: '',
        product: '',
        partNumber: '',
        severity: 'MEDIUM',
        source: 'INTERNAL',
        immediateAction: '' });
      fetchIncidents();
    } catch (err) {
      console.error('Failed to create incident', err);
    }
  };

  const handleCreateRecall = async () => {
    try {
      await api.post('/product-safety/recalls', {
        ...recallForm,
        affectedQuantity: parseInt(recallForm.affectedQuantity, 10) || 0 });
      setShowRecallModal(false);
      setRecallForm({
        product: '',
        reason: '',
        scope: '',
        affectedQuantity: '',
        regulatoryBody: '',
        notes: '' });
      fetchRecalls();
    } catch (err) {
      console.error('Failed to create recall', err);
    }
  };

  const handleCreateCompliance = async () => {
    try {
      await api.post('/product-safety/compliance', complianceForm);
      setShowComplianceModal(false);
      setComplianceForm({
        partNumber: '',
        partName: '',
        regulation: 'REACH',
        status: 'PENDING',
        certificateRef: '',
        expiryDate: '',
        substances: '',
        notes: '' });
      fetchCompliance();
    } catch (err) {
      console.error('Failed to create compliance record', err);
    }
  };

  const handleUpdateIncidentStatus = async (id: string, status: string) => {
    try {
      await api.put(`/product-safety/incidents/${id}`, { status });
      fetchIncidents();
      if (selectedIncident?.id === id) setSelectedIncident({ ...selectedIncident, status });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleUpdateRecallStatus = async (id: string, status: string) => {
    try {
      await api.put(`/product-safety/recalls/${id}`, { status });
      fetchRecalls();
      if (selectedRecall?.id === id) setSelectedRecall({ ...selectedRecall, status });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Stats
  const totalChars = characteristics.length;
  const scCount = characteristics.filter((c) => c.characteristicType === 'SC').length;
  const openIncidents = incidents.filter(
    (i) => i.status === 'OPEN' || i.status === 'INVESTIGATING'
  ).length;
  const activeRecalls = recalls.filter((r) => r.status !== 'CLOSED').length;
  const nonCompliant = compliance.filter((c) => c.status === 'NON_COMPLIANT').length;

  const tabs: { key: TabType; label: string }[] = [
    { key: 'characteristics', label: 'Characteristics' },
    { key: 'incidents', label: 'Incidents' },
    { key: 'recalls', label: 'Recalls' },
    { key: 'compliance', label: 'Compliance' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Product Safety Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            AS9100D / IATF 16949 -- Safety-critical characteristics, incidents & recalls
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Characteristics</p>
                <p className="text-2xl font-bold">{totalChars}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">SC (Safety)</p>
                <p className="text-2xl font-bold">{scCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Open Incidents</p>
                <p className="text-2xl font-bold">{openIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Package className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Recalls</p>
                <p className="text-2xl font-bold">{activeRecalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${nonCompliant > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                {nonCompliant > 0 ? (
                  <XCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Non-Compliant</p>
                <p className="text-2xl font-bold">{nonCompliant}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setStatusFilter('');
            }}
            className={`px-4 py-2 rounded-t text-sm font-medium ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CHARACTERISTICS TAB */}
      {activeTab === 'characteristics' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Safety-Critical Characteristics</CardTitle>
              <Button onClick={() => setShowCharModal(true)}>
                <Plus className="h-4 w-4 mr-2" /> Define Characteristic
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  aria-label="Search by part number..."
                  placeholder="Search by part number..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="UNDER_REVIEW">Under Review</option>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading...</p>
            ) : characteristics.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No safety characteristics defined.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500 dark:text-gray-400">
                      <th className="pb-2 pr-4">Ref</th>
                      <th className="pb-2 pr-4">Part Number</th>
                      <th className="pb-2 pr-4">Part Name</th>
                      <th className="pb-2 pr-4">Type</th>
                      <th className="pb-2 pr-4">Control Method</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {characteristics.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b hover:bg-gray-50 dark:bg-gray-800 cursor-pointer"
                        onClick={() => {
                          setSelectedChar(c);
                          setShowCharDetail(true);
                        }}
                      >
                        <td className="py-3 pr-4 font-mono text-xs">{c.refNumber}</td>
                        <td className="py-3 pr-4 font-medium">{c.partNumber}</td>
                        <td className="py-3 pr-4">{c.partName}</td>
                        <td className="py-3 pr-4">
                          <Badge
                            className={
                              CHAR_TYPE_COLORS[c.characteristicType] ||
                              'bg-gray-100 dark:bg-gray-800'
                            }
                          >
                            {c.characteristicType}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-xs max-w-[200px] truncate">
                          {c.controlMethod}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge
                            className={STATUS_COLORS[c.status] || 'bg-gray-100 dark:bg-gray-800'}
                          >
                            {c.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString()}
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

      {/* INCIDENTS TAB */}
      {activeTab === 'incidents' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Safety Incidents</CardTitle>
              <Button onClick={() => setShowIncidentModal(true)}>
                <Plus className="h-4 w-4 mr-2" /> Log Incident
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <Select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="CONTAINED">Contained</option>
                <option value="CORRECTED">Corrected</option>
                <option value="CLOSED">Closed</option>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading...</p>
            ) : incidents.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No safety incidents recorded.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500 dark:text-gray-400">
                      <th className="pb-2 pr-4">Ref</th>
                      <th className="pb-2 pr-4">Title</th>
                      <th className="pb-2 pr-4">Product</th>
                      <th className="pb-2 pr-4">Severity</th>
                      <th className="pb-2 pr-4">Source</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((inc) => (
                      <tr
                        key={inc.id}
                        className="border-b hover:bg-gray-50 dark:bg-gray-800 cursor-pointer"
                        onClick={() => {
                          setSelectedIncident(inc);
                          setShowIncidentDetail(true);
                        }}
                      >
                        <td className="py-3 pr-4 font-mono text-xs">{inc.refNumber}</td>
                        <td className="py-3 pr-4 font-medium max-w-[200px] truncate">
                          {inc.title}
                        </td>
                        <td className="py-3 pr-4">{inc.product}</td>
                        <td className="py-3 pr-4">
                          <Badge
                            className={
                              SEVERITY_COLORS[inc.severity] || 'bg-gray-100 dark:bg-gray-800'
                            }
                          >
                            {inc.severity}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">{inc.source}</td>
                        <td className="py-3 pr-4">
                          <Badge
                            className={STATUS_COLORS[inc.status] || 'bg-gray-100 dark:bg-gray-800'}
                          >
                            {inc.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">
                          {new Date(inc.createdAt).toLocaleDateString()}
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

      {/* RECALLS TAB */}
      {activeTab === 'recalls' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recall Investigations</CardTitle>
              <Button onClick={() => setShowRecallModal(true)}>
                <Plus className="h-4 w-4 mr-2" /> Initiate Recall
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <Select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="">All Statuses</option>
                <option value="INITIATED">Initiated</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="CONTAINED">Contained</option>
                <option value="CORRECTED">Corrected</option>
                <option value="CLOSED">Closed</option>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading...</p>
            ) : recalls.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No recall investigations.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500 dark:text-gray-400">
                      <th className="pb-2 pr-4">Ref</th>
                      <th className="pb-2 pr-4">Product</th>
                      <th className="pb-2 pr-4">Reason</th>
                      <th className="pb-2 pr-4">Qty</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Notifications</th>
                      <th className="pb-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recalls.map((rcl) => (
                      <tr
                        key={rcl.id}
                        className="border-b hover:bg-gray-50 dark:bg-gray-800 cursor-pointer"
                        onClick={() => {
                          setSelectedRecall(rcl);
                          setShowRecallDetail(true);
                        }}
                      >
                        <td className="py-3 pr-4 font-mono text-xs">{rcl.refNumber}</td>
                        <td className="py-3 pr-4 font-medium">{rcl.product}</td>
                        <td className="py-3 pr-4 max-w-[200px] truncate">{rcl.reason}</td>
                        <td className="py-3 pr-4">{rcl.affectedQuantity.toLocaleString()}</td>
                        <td className="py-3 pr-4">
                          <Badge
                            className={STATUS_COLORS[rcl.status] || 'bg-gray-100 dark:bg-gray-800'}
                          >
                            {rcl.status}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-xs">
                          {rcl.customerNotified && (
                            <span className="text-green-600 mr-2">Customer</span>
                          )}
                          {rcl.regulatoryNotified && (
                            <span className="text-blue-600">Regulatory</span>
                          )}
                          {!rcl.customerNotified && !rcl.regulatoryNotified && (
                            <span className="text-gray-400 dark:text-gray-500">None</span>
                          )}
                        </td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">
                          {new Date(rcl.createdAt).toLocaleDateString()}
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

      {/* COMPLIANCE TAB */}
      {activeTab === 'compliance' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>REACH / RoHS / IMDS Compliance</CardTitle>
              <Button onClick={() => setShowComplianceModal(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Record
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <Select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="">All Statuses</option>
                <option value="COMPLIANT">Compliant</option>
                <option value="NON_COMPLIANT">Non-Compliant</option>
                <option value="PENDING">Pending</option>
                <option value="EXEMPT">Exempt</option>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Loading...</p>
            ) : compliance.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No compliance records.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500 dark:text-gray-400">
                      <th className="pb-2 pr-4">Part Number</th>
                      <th className="pb-2 pr-4">Part Name</th>
                      <th className="pb-2 pr-4">Regulation</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Certificate</th>
                      <th className="pb-2 pr-4">Expiry</th>
                      <th className="pb-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compliance.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 pr-4 font-medium">{c.partNumber}</td>
                        <td className="py-3 pr-4">{c.partName}</td>
                        <td className="py-3 pr-4">
                          <Badge className="bg-blue-100 text-blue-800">{c.regulation}</Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge
                            className={STATUS_COLORS[c.status] || 'bg-gray-100 dark:bg-gray-800'}
                          >
                            {c.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs">{c.certificateRef || '-'}</td>
                        <td className="py-3 pr-4">
                          {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString()}
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

      {/* CREATE CHARACTERISTIC MODAL */}
      <Modal
        isOpen={showCharModal}
        onClose={() => setShowCharModal(false)}
        title="Define Safety Characteristic"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Part Number *</Label>
              <Input
                value={charForm.partNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCharForm({ ...charForm, partNumber: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Part Name *</Label>
              <Input
                value={charForm.partName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCharForm({ ...charForm, partName: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label>Characteristic Type *</Label>
            <Select
              value={charForm.characteristicType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setCharForm({ ...charForm, characteristicType: e.target.value })
              }
            >
              <option value="SC">SC - Safety Characteristic (AS9100)</option>
              <option value="CC">CC - Critical Characteristic (IATF)</option>
              <option value="KPC">KPC - Key Product Characteristic (IATF)</option>
            </Select>
          </div>
          <div>
            <Label>Description *</Label>
            <Textarea
              rows={2}
              value={charForm.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setCharForm({ ...charForm, description: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Control Method *</Label>
            <Input
              value={charForm.controlMethod}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCharForm({ ...charForm, controlMethod: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Measurement Method</Label>
              <Input
                value={charForm.measurementMethod}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCharForm({ ...charForm, measurementMethod: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Tolerance</Label>
              <Input
                value={charForm.tolerance}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCharForm({ ...charForm, tolerance: e.target.value })
                }
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCharModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateCharacteristic}
            disabled={
              !charForm.partNumber ||
              !charForm.partName ||
              !charForm.description ||
              !charForm.controlMethod
            }
          >
            Define Characteristic
          </Button>
        </ModalFooter>
      </Modal>

      {/* CREATE INCIDENT MODAL */}
      <Modal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
        title="Log Safety Incident"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input
              value={incidentForm.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setIncidentForm({ ...incidentForm, title: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Product *</Label>
              <Input
                value={incidentForm.product}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setIncidentForm({ ...incidentForm, product: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Part Number</Label>
              <Input
                value={incidentForm.partNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setIncidentForm({ ...incidentForm, partNumber: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Severity *</Label>
              <Select
                value={incidentForm.severity}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setIncidentForm({ ...incidentForm, severity: e.target.value })
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </Select>
            </div>
            <div>
              <Label>Source</Label>
              <Select
                value={incidentForm.source}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setIncidentForm({ ...incidentForm, source: e.target.value })
                }
              >
                <option value="INTERNAL">Internal</option>
                <option value="CUSTOMER">Customer</option>
                <option value="REGULATORY">Regulatory</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="FIELD">Field</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>Description *</Label>
            <Textarea
              rows={3}
              value={incidentForm.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setIncidentForm({ ...incidentForm, description: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Immediate Action</Label>
            <Textarea
              rows={2}
              value={incidentForm.immediateAction}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setIncidentForm({ ...incidentForm, immediateAction: e.target.value })
              }
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowIncidentModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateIncident}
            disabled={!incidentForm.title || !incidentForm.description || !incidentForm.product}
          >
            Log Incident
          </Button>
        </ModalFooter>
      </Modal>

      {/* CREATE RECALL MODAL */}
      <Modal
        isOpen={showRecallModal}
        onClose={() => setShowRecallModal(false)}
        title="Initiate Recall Investigation"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Product *</Label>
              <Input
                value={recallForm.product}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRecallForm({ ...recallForm, product: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Affected Quantity *</Label>
              <Input
                type="number"
                value={recallForm.affectedQuantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRecallForm({ ...recallForm, affectedQuantity: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label>Reason *</Label>
            <Textarea
              rows={2}
              value={recallForm.reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setRecallForm({ ...recallForm, reason: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Scope (affected lots/serials) *</Label>
            <Textarea
              rows={2}
              value={recallForm.scope}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setRecallForm({ ...recallForm, scope: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Regulatory Body</Label>
            <Input
              value={recallForm.regulatoryBody}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRecallForm({ ...recallForm, regulatoryBody: e.target.value })
              }
              placeholder="e.g., NHTSA, FAA, TGA"
            />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              rows={2}
              value={recallForm.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setRecallForm({ ...recallForm, notes: e.target.value })
              }
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowRecallModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateRecall}
            disabled={!recallForm.product || !recallForm.reason || !recallForm.scope}
          >
            Initiate Recall
          </Button>
        </ModalFooter>
      </Modal>

      {/* CREATE COMPLIANCE MODAL */}
      <Modal
        isOpen={showComplianceModal}
        onClose={() => setShowComplianceModal(false)}
        title="Add Compliance Record"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Part Number *</Label>
              <Input
                value={complianceForm.partNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setComplianceForm({ ...complianceForm, partNumber: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Part Name *</Label>
              <Input
                value={complianceForm.partName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setComplianceForm({ ...complianceForm, partName: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Regulation *</Label>
              <Select
                value={complianceForm.regulation}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setComplianceForm({ ...complianceForm, regulation: e.target.value })
                }
              >
                <option value="REACH">REACH</option>
                <option value="RoHS">RoHS</option>
                <option value="IMDS">IMDS</option>
                <option value="TSCA">TSCA</option>
                <option value="PROP65">Proposition 65</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>
            <div>
              <Label>Status *</Label>
              <Select
                value={complianceForm.status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setComplianceForm({ ...complianceForm, status: e.target.value })
                }
              >
                <option value="PENDING">Pending</option>
                <option value="COMPLIANT">Compliant</option>
                <option value="NON_COMPLIANT">Non-Compliant</option>
                <option value="EXEMPT">Exempt</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Certificate Ref</Label>
              <Input
                value={complianceForm.certificateRef}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setComplianceForm({ ...complianceForm, certificateRef: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={complianceForm.expiryDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setComplianceForm({ ...complianceForm, expiryDate: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label>Substances</Label>
            <Input
              value={complianceForm.substances}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setComplianceForm({ ...complianceForm, substances: e.target.value })
              }
              placeholder="e.g., No SVHC above 0.1% w/w"
            />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              rows={2}
              value={complianceForm.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setComplianceForm({ ...complianceForm, notes: e.target.value })
              }
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowComplianceModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateCompliance}
            disabled={!complianceForm.partNumber || !complianceForm.partName}
          >
            Add Record
          </Button>
        </ModalFooter>
      </Modal>

      {/* CHARACTERISTIC DETAIL MODAL */}
      <Modal
        isOpen={showCharDetail}
        onClose={() => setShowCharDetail(false)}
        title={
          selectedChar
            ? `${selectedChar.refNumber} - ${selectedChar.partName}`
            : 'Characteristic Details'
        }
        size="lg"
      >
        {selectedChar && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Part Number:</span>{' '}
                <span className="font-medium">{selectedChar.partNumber}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Part Name:</span>{' '}
                <span className="font-medium">{selectedChar.partName}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Type:</span>{' '}
                <Badge className={CHAR_TYPE_COLORS[selectedChar.characteristicType]}>
                  {selectedChar.characteristicType}
                </Badge>{' '}
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                  {CHAR_TYPE_LABELS[selectedChar.characteristicType]}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Status:</span>{' '}
                <Badge className={STATUS_COLORS[selectedChar.status]}>{selectedChar.status}</Badge>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Control Method:</span>{' '}
                <span className="font-medium">{selectedChar.controlMethod}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Measurement:</span>{' '}
                <span className="font-medium">{selectedChar.measurementMethod || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Tolerance:</span>{' '}
                <span className="font-medium">{selectedChar.tolerance || '-'}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Description:</span>
              <p className="mt-1 text-sm bg-blue-50 p-3 rounded">{selectedChar.description}</p>
            </div>
            {selectedChar.notes && (
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Notes:</span>
                <p className="mt-1 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  {selectedChar.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* INCIDENT DETAIL MODAL */}
      <Modal
        isOpen={showIncidentDetail}
        onClose={() => setShowIncidentDetail(false)}
        title={
          selectedIncident
            ? `${selectedIncident.refNumber} - ${selectedIncident.title}`
            : 'Incident Details'
        }
        size="lg"
      >
        {selectedIncident && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Product:</span>{' '}
                <span className="font-medium">{selectedIncident.product}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Part Number:</span>{' '}
                <span className="font-medium">{selectedIncident.partNumber || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Severity:</span>{' '}
                <Badge className={SEVERITY_COLORS[selectedIncident.severity]}>
                  {selectedIncident.severity}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Source:</span>{' '}
                <span className="font-medium">{selectedIncident.source}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Status:</span>{' '}
                <Badge className={STATUS_COLORS[selectedIncident.status]}>
                  {selectedIncident.status}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Description:</span>
              <p className="mt-1 text-sm bg-red-50 p-3 rounded">{selectedIncident.description}</p>
            </div>
            {selectedIncident.immediateAction && (
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Immediate Action:</span>
                <p className="mt-1 text-sm bg-orange-50 p-3 rounded">
                  {selectedIncident.immediateAction}
                </p>
              </div>
            )}
            {selectedIncident.rootCause && (
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Root Cause:</span>
                <p className="mt-1 text-sm bg-blue-50 p-3 rounded">{selectedIncident.rootCause}</p>
              </div>
            )}
            {selectedIncident.correctiveAction && (
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Corrective Action:</span>
                <p className="mt-1 text-sm bg-green-50 p-3 rounded">
                  {selectedIncident.correctiveAction}
                </p>
              </div>
            )}
            <div className="flex gap-2 pt-2 border-t">
              {selectedIncident.status === 'OPEN' && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateIncidentStatus(selectedIncident.id, 'INVESTIGATING')}
                >
                  Start Investigation
                </Button>
              )}
              {selectedIncident.status === 'INVESTIGATING' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateIncidentStatus(selectedIncident.id, 'CONTAINED')}
                  >
                    Mark Contained
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateIncidentStatus(selectedIncident.id, 'CORRECTED')}
                  >
                    Mark Corrected
                  </Button>
                </>
              )}
              {(selectedIncident.status === 'CONTAINED' ||
                selectedIncident.status === 'CORRECTED') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateIncidentStatus(selectedIncident.id, 'CLOSED')}
                >
                  Close Incident
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* RECALL DETAIL MODAL */}
      <Modal
        isOpen={showRecallDetail}
        onClose={() => setShowRecallDetail(false)}
        title={
          selectedRecall
            ? `${selectedRecall.refNumber} - ${selectedRecall.product}`
            : 'Recall Details'
        }
        size="lg"
      >
        {selectedRecall && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Product:</span>{' '}
                <span className="font-medium">{selectedRecall.product}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Affected Qty:</span>{' '}
                <span className="font-medium">
                  {selectedRecall.affectedQuantity.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Status:</span>{' '}
                <Badge className={STATUS_COLORS[selectedRecall.status]}>
                  {selectedRecall.status}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Regulatory Body:</span>{' '}
                <span className="font-medium">{selectedRecall.regulatoryBody || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Customer Notified:</span>{' '}
                <span
                  className={`font-medium ${selectedRecall.customerNotified ? 'text-green-600' : 'text-red-600'}`}
                >
                  {selectedRecall.customerNotified ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Regulatory Notified:</span>{' '}
                <span
                  className={`font-medium ${selectedRecall.regulatoryNotified ? 'text-green-600' : 'text-red-600'}`}
                >
                  {selectedRecall.regulatoryNotified ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Reason:</span>
              <p className="mt-1 text-sm bg-red-50 p-3 rounded">{selectedRecall.reason}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Scope:</span>
              <p className="mt-1 text-sm bg-orange-50 p-3 rounded">{selectedRecall.scope}</p>
            </div>
            {selectedRecall.containmentAction && (
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Containment Action:
                </span>
                <p className="mt-1 text-sm bg-blue-50 p-3 rounded">
                  {selectedRecall.containmentAction}
                </p>
              </div>
            )}
            {selectedRecall.correctiveAction && (
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Corrective Action:</span>
                <p className="mt-1 text-sm bg-green-50 p-3 rounded">
                  {selectedRecall.correctiveAction}
                </p>
              </div>
            )}
            <div className="flex gap-2 pt-2 border-t">
              {selectedRecall.status === 'INITIATED' && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateRecallStatus(selectedRecall.id, 'INVESTIGATING')}
                >
                  Start Investigation
                </Button>
              )}
              {selectedRecall.status === 'INVESTIGATING' && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateRecallStatus(selectedRecall.id, 'CONTAINED')}
                >
                  Mark Contained
                </Button>
              )}
              {selectedRecall.status === 'CONTAINED' && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateRecallStatus(selectedRecall.id, 'CORRECTED')}
                >
                  Mark Corrected
                </Button>
              )}
              {selectedRecall.status === 'CORRECTED' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateRecallStatus(selectedRecall.id, 'CLOSED')}
                >
                  Close Recall
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
