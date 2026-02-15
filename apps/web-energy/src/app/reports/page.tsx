'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter, Badge } from '@ims/ui';
import {
  Plus, Search, FileText, Download, Eye, Trash2, Filter,
  CheckCircle, Clock, AlertCircle, XCircle, RefreshCw,
  BarChart2, TrendingDown, Zap, Calendar,
} from 'lucide-react';
import { api } from '@/lib/api';

interface EnergyReport {
  id: string;
  title: string;
  type: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  generatedAt?: string;
  generatedBy?: string;
  description?: string;
  format: string;
  scope?: string;
  energySources?: string;
  findings?: string;
  recommendations?: string;
  fileUrl?: string;
  fileSize?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  DRAFT:       { label: 'Draft',       color: 'bg-gray-100 dark:bg-gray-800 text-gray-700',   icon: Clock },
  GENERATING:  { label: 'Generating',  color: 'bg-blue-100 text-blue-700',   icon: RefreshCw },
  PUBLISHED:   { label: 'Published',   color: 'bg-green-100 text-green-700', icon: CheckCircle },
  UNDER_REVIEW:{ label: 'Under Review',color: 'bg-yellow-100 text-yellow-700',icon: AlertCircle },
  ARCHIVED:    { label: 'Archived',    color: 'bg-purple-100 text-purple-700',icon: XCircle },
  FAILED:      { label: 'Failed',      color: 'bg-red-100 text-red-700',     icon: XCircle },
};

const REPORT_TYPES = [
  'ENERGY_PERFORMANCE',
  'ISO_50001_COMPLIANCE',
  'ENPI_SUMMARY',
  'AUDIT_SUMMARY',
  'BASELINE_REVIEW',
  'TARGET_PROGRESS',
  'SEU_ANALYSIS',
  'CARBON_FOOTPRINT',
  'COST_ANALYSIS',
  'MANAGEMENT_REVIEW',
  'REGULATORY_SUBMISSION',
  'MONTHLY_SUMMARY',
  'QUARTERLY_REPORT',
  'ANNUAL_REPORT',
];

const FORMAT_OPTIONS = ['PDF', 'EXCEL', 'WORD', 'CSV', 'HTML'];

const ENERGY_SOURCES = [
  'ELECTRICITY', 'NATURAL_GAS', 'DIESEL', 'PETROL', 'COAL',
  'BIOMASS', 'SOLAR', 'WIND', 'STEAM', 'ALL',
];

const empty: Omit<EnergyReport, 'id'> = {
  title: '',
  type: 'ENERGY_PERFORMANCE',
  status: 'DRAFT',
  periodStart: '',
  periodEnd: '',
  generatedBy: '',
  description: '',
  format: 'PDF',
  scope: '',
  energySources: 'ALL',
  findings: '',
  recommendations: '',
};

export default function ReportsPage() {
  const [items, setItems] = useState<EnergyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Partial<EnergyReport>>(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [viewItem, setViewItem] = useState<EnergyReport | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/reports');
      setItems(r.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    const matchSearch = !searchTerm ||
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.generatedBy || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filterStatus || i.status === filterStatus;
    const matchType = !filterType || i.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const totalReports   = items.length;
  const published      = items.filter(i => i.status === 'PUBLISHED').length;
  const drafts         = items.filter(i => i.status === 'DRAFT').length;
  const underReview    = items.filter(i => i.status === 'UNDER_REVIEW').length;

  const openCreate = () => {
    setEditItem({ ...empty });
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEdit = (item: EnergyReport) => {
    setEditItem({
      ...item,
      periodStart: item.periodStart ? item.periodStart.slice(0, 10) : '',
      periodEnd:   item.periodEnd   ? item.periodEnd.slice(0, 10)   : '',
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const openView = (item: EnergyReport) => {
    setViewItem(item);
    setViewModal(true);
  };

  const save = async () => {
    if (!editItem.title || !editItem.periodStart || !editItem.periodEnd) return;
    setSaving(true);
    try {
      if (isEditing && editItem.id) {
        await api.put(`/reports/${editItem.id}`, editItem);
      } else {
        await api.post('/reports', editItem);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setDeleteModal(true);
  };

  const doDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await api.delete(`/reports/${deleteId}`);
      setDeleteModal(false);
      setDeleteId(null);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const formatTypeLabel = (type: string) =>
    type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Energy Reports</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Generate, review, and manage energy performance reports — ISO 50001 §9.1</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2 font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            Generate Report
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalReports}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Published</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{published}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Under Review</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{underReview}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Drafts</p>
                  <p className="text-3xl font-bold text-gray-600 mt-1">{drafts}</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">All Types</option>
              {REPORT_TYPES.map(t => (
                <option key={t} value={t}>{formatTypeLabel(t)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-yellow-600" />
              Reports ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Period</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Format</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Generated</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => {
                      const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG['DRAFT'];
                      const StatusIcon = sc.icon;
                      return (
                        <tr key={item.id} className="border-b hover:bg-yellow-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{item.title}</div>
                            {item.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-xs">{item.description}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <TrendingDown className="h-3 w-3" />
                              {formatTypeLabel(item.type)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                              <span className="text-xs">{formatDate(item.periodStart)} – {formatDate(item.periodEnd)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              <FileText className="h-3 w-3" />
                              {item.format}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                            {item.generatedAt ? (
                              <div>
                                <div>{formatDate(item.generatedAt)}</div>
                                {item.generatedBy && <div className="text-gray-400 dark:text-gray-500">{item.generatedBy}</div>}
                              </div>
                            ) : '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {sc.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openView(item)}
                                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {item.fileUrl && (
                                <a
                                  href={item.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                  title="Download"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              )}
                              <button
                                onClick={() => openEdit(item)}
                                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                                title="Edit"
                              >
                                <FileText className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => confirmDelete(item.id)}
                                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                <FileText className="h-14 w-14 mx-auto mb-4 opacity-40" />
                <p className="font-medium text-gray-500 dark:text-gray-400">No reports found</p>
                <p className="text-sm mt-1">Generate your first energy report to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Report' : 'Generate New Report'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={editItem.title || ''}
              onChange={e => setEditItem(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Annual Energy Performance Review 2025"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Type</label>
              <select
                value={editItem.type || 'ENERGY_PERFORMANCE'}
                onChange={e => setEditItem(p => ({ ...p, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {REPORT_TYPES.map(t => (
                  <option key={t} value={t}>{formatTypeLabel(t)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
              <select
                value={editItem.format || 'PDF'}
                onChange={e => setEditItem(p => ({ ...p, format: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {FORMAT_OPTIONS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period Start <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={editItem.periodStart || ''}
                onChange={e => setEditItem(p => ({ ...p, periodStart: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period End <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={editItem.periodEnd || ''}
                onChange={e => setEditItem(p => ({ ...p, periodEnd: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={editItem.status || 'DRAFT'}
                onChange={e => setEditItem(p => ({ ...p, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Energy Sources</label>
              <select
                value={editItem.energySources || 'ALL'}
                onChange={e => setEditItem(p => ({ ...p, energySources: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {ENERGY_SOURCES.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scope</label>
            <input
              type="text"
              value={editItem.scope || ''}
              onChange={e => setEditItem(p => ({ ...p, scope: e.target.value }))}
              placeholder="e.g. All facilities, Site A only, Production area"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Generated By</label>
            <input
              type="text"
              value={editItem.generatedBy || ''}
              onChange={e => setEditItem(p => ({ ...p, generatedBy: e.target.value }))}
              placeholder="Name or role of the report author"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={editItem.description || ''}
              onChange={e => setEditItem(p => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder="Brief description of the report purpose"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Findings</label>
            <textarea
              value={editItem.findings || ''}
              onChange={e => setEditItem(p => ({ ...p, findings: e.target.value }))}
              rows={2}
              placeholder="Summary of key findings from this reporting period"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recommendations</label>
            <textarea
              value={editItem.recommendations || ''}
              onChange={e => setEditItem(p => ({ ...p, recommendations: e.target.value }))}
              rows={2}
              placeholder="Recommendations for improvement"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            />
          </div>
        </div>

        <ModalFooter>
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !editItem.title || !editItem.periodStart || !editItem.periodEnd}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving ? <><RefreshCw className="h-4 w-4 animate-spin" /> Saving...</> : isEditing ? 'Save Changes' : 'Generate Report'}
          </button>
        </ModalFooter>
      </Modal>

      {/* View Details Modal */}
      {viewItem && (
        <Modal
          isOpen={viewModal}
          onClose={() => setViewModal(false)}
          title="Report Details"
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{viewItem.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{formatTypeLabel(viewItem.type)}</p>
              </div>
              {(() => {
                const sc = STATUS_CONFIG[viewItem.status] || STATUS_CONFIG['DRAFT'];
                const StatusIcon = sc.icon;
                return (
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${sc.color}`}>
                    <StatusIcon className="h-4 w-4" />
                    {sc.label}
                  </span>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">Period</span>
                <p className="text-gray-900 dark:text-gray-100 mt-0.5">{formatDate(viewItem.periodStart)} – {formatDate(viewItem.periodEnd)}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">Format</span>
                <p className="text-gray-900 dark:text-gray-100 mt-0.5">{viewItem.format}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">Energy Sources</span>
                <p className="text-gray-900 dark:text-gray-100 mt-0.5">{viewItem.energySources || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">Generated By</span>
                <p className="text-gray-900 dark:text-gray-100 mt-0.5">{viewItem.generatedBy || '—'}</p>
              </div>
              {viewItem.generatedAt && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">Generated At</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-0.5">{formatDate(viewItem.generatedAt)}</p>
                </div>
              )}
              {viewItem.scope && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">Scope</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-0.5">{viewItem.scope}</p>
                </div>
              )}
            </div>

            {viewItem.description && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{viewItem.description}</p>
              </div>
            )}

            {viewItem.findings && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Key Findings</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{viewItem.findings}</p>
              </div>
            )}

            {viewItem.recommendations && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Recommendations</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{viewItem.recommendations}</p>
              </div>
            )}

            {viewItem.fileUrl && (
              <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Report File</p>
                    {viewItem.fileSize && <p className="text-xs text-gray-500 dark:text-gray-400">{viewItem.fileSize}</p>}
                  </div>
                </div>
                <a
                  href={viewItem.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </div>
            )}
          </div>

          <ModalFooter>
            <button
              onClick={() => { setViewModal(false); openEdit(viewItem); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
            >
              Edit Report
            </button>
            <button
              onClick={() => setViewModal(false)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
            >
              Close
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Report"
        size="sm"
      >
        <p className="text-gray-600 text-sm">
          Are you sure you want to delete this report? This action cannot be undone.
        </p>
        <ModalFooter>
          <button
            onClick={() => setDeleteModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={doDelete}
            disabled={saving}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Deleting...' : 'Delete Report'}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
