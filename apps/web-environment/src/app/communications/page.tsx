'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Modal,
  ModalFooter,
} from '@ims/ui';
import {
  Plus,
  Search,
  MessageSquare,
  ExternalLink,
  Users,
  FileText,
  Filter,
  Edit2,
  Trash2,
  Send,
  Inbox,
  ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Communication {
  id: string;
  referenceNumber: string;
  subject: string;
  description: string;
  direction: 'INTERNAL' | 'EXTERNAL';
  type:
    | 'REPORT'
    | 'COMPLAINT'
    | 'ENQUIRY'
    | 'NOTIFICATION'
    | 'CONSULTATION'
    | 'DISCLOSURE'
    | 'OTHER';
  status: 'DRAFT' | 'SENT' | 'RECEIVED' | 'ACKNOWLEDGED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  stakeholder: string;
  stakeholderType: string;
  contactPerson?: string;
  contactEmail?: string;
  dateReceived?: string;
  dateSent?: string;
  dueDate?: string;
  responseRequired: boolean;
  responseDate?: string;
  assignedTo?: string;
  aspectRef?: string;
  legalRef?: string;
  notes?: string;
  attachments?: number;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  REPORT: 'Report',
  COMPLAINT: 'Complaint',
  ENQUIRY: 'Enquiry',
  NOTIFICATION: 'Notification',
  CONSULTATION: 'Consultation',
  DISCLOSURE: 'Disclosure',
  OTHER: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  SENT: 'bg-blue-100 text-blue-700',
  RECEIVED: 'bg-purple-100 text-purple-700',
  ACKNOWLEDGED: 'bg-yellow-100 text-yellow-700',
  CLOSED: 'bg-green-100 text-green-700',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  URGENT: 'bg-red-100 text-red-600',
};

const EMPTY_FORM = {
  subject: '',
  description: '',
  direction: 'EXTERNAL' as string,
  type: 'NOTIFICATION' as string,
  status: 'DRAFT' as string,
  priority: 'MEDIUM' as string,
  stakeholder: '',
  stakeholderType: '',
  contactPerson: '',
  contactEmail: '',
  dateReceived: '',
  dateSent: '',
  dueDate: '',
  responseRequired: false,
  assignedTo: '',
  aspectRef: '',
  legalRef: '',
  notes: '',
};

export default function CommunicationsPage() {
  const [records, setRecords] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDirection, setFilterDirection] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Communication | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'EXTERNAL' | 'INTERNAL'>('EXTERNAL');
  const [formTab, setFormTab] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/communications').catch(() => ({ data: { data: [] } }));
      setRecords(res.data.data || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  function openCreate() {
    setSelectedRecord(null);
    setForm({ ...EMPTY_FORM, direction: activeTab });
    setFormTab(0);
    setModalOpen(true);
  }

  function openEdit(rec: Communication) {
    setSelectedRecord(rec);
    setForm({
      subject: rec.subject,
      description: rec.description,
      direction: rec.direction,
      type: rec.type,
      status: rec.status,
      priority: rec.priority,
      stakeholder: rec.stakeholder,
      stakeholderType: rec.stakeholderType,
      contactPerson: rec.contactPerson || '',
      contactEmail: rec.contactEmail || '',
      dateReceived: rec.dateReceived?.split('T')[0] || '',
      dateSent: rec.dateSent?.split('T')[0] || '',
      dueDate: rec.dueDate?.split('T')[0] || '',
      responseRequired: rec.responseRequired,
      assignedTo: rec.assignedTo || '',
      aspectRef: rec.aspectRef || '',
      legalRef: rec.legalRef || '',
      notes: rec.notes || '',
    });
    setFormTab(0);
    setModalOpen(true);
  }

  function openDelete(rec: Communication) {
    setSelectedRecord(rec);
    setDeleteModalOpen(true);
  }

  async function handleSave() {
    if (!form.subject.trim() || !form.stakeholder.trim()) return;
    setSaving(true);
    try {
      if (selectedRecord) {
        await api.put(`/communications/${selectedRecord.id}`, form);
      } else {
        await api.post('/communications', form);
      }
      await loadRecords();
      setModalOpen(false);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedRecord) return;
    try {
      await api.delete(`/communications/${selectedRecord.id}`);
      await loadRecords();
    } catch {
      // silently fail
    } finally {
      setDeleteModalOpen(false);
    }
  }

  const filtered = records.filter((r) => {
    const matchesSearch =
      !search ||
      r.subject.toLowerCase().includes(search.toLowerCase()) ||
      r.stakeholder.toLowerCase().includes(search.toLowerCase()) ||
      (r.referenceNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchesDirection = filterDirection === 'ALL' || r.direction === filterDirection;
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesPriority = filterPriority === 'ALL' || r.priority === filterPriority;
    return matchesSearch && matchesDirection && matchesStatus && matchesPriority;
  });

  const external = records.filter((r) => r.direction === 'EXTERNAL');
  const internal = records.filter((r) => r.direction === 'INTERNAL');
  const pending = records.filter((r) => r.responseRequired && r.status !== 'CLOSED');
  const urgent = records.filter((r) => r.priority === 'URGENT');
  const tabRecords = filtered.filter((r) => r.direction === activeTab);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Communications</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              ISO 14001:2015 Cl. 7.4 — Internal &amp; external environmental communications
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4" />
            New Communication
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">External</p>
                  <p className="text-2xl font-bold text-green-700">{external.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <ExternalLink className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Internal</p>
                  <p className="text-2xl font-bold text-blue-700">{internal.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Response</p>
                  <p className="text-2xl font-bold text-orange-600">{pending.length}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Inbox className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Urgent</p>
                  <p className="text-2xl font-bold text-red-600">{urgent.length}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <MessageSquare className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Direction Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {(['EXTERNAL', 'INTERNAL'] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => setActiveTab(dir)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === dir
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              {dir === 'EXTERNAL' ? (
                <span className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" /> External ({external.length})
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Internal ({internal.length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search by subject, stakeholder or ref..."
              placeholder="Search by subject, stakeholder or ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="RECEIVED">Received</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="ALL">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5 text-green-600" />
              {activeTab === 'EXTERNAL' ? 'External Communications' : 'Internal Communications'}
              <span className="ml-auto text-sm text-gray-400 dark:text-gray-500 font-normal">
                {tabRecords.length} records
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : tabRecords.length === 0 ? (
              <div className="py-16 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No communications found</p>
                <Button
                  onClick={openCreate}
                  variant="outline"
                  className="mt-4 text-green-600 border-green-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Communication
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Ref
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Subject
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Type
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Stakeholder
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Priority
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Due Date
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Response?
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabRecords.map((rec) => (
                      <tr
                        key={rec.id}
                        className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                          {rec.referenceNumber || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                            {rec.subject}
                          </p>
                          {rec.description && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">
                              {rec.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-600 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {TYPE_LABELS[rec.type] || rec.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {rec.stakeholder}
                          </p>
                          {rec.stakeholderType && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {rec.stakeholderType}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium ${PRIORITY_COLORS[rec.priority] || ''}`}
                          >
                            {rec.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium ${STATUS_COLORS[rec.status] || ''}`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {rec.dueDate ? new Date(rec.dueDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {rec.responseRequired ? (
                            <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                              <Inbox className="h-3 w-3" /> Required
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => openEdit(rec)}
                              className="p-1.5 hover:bg-green-100 rounded text-gray-400 dark:text-gray-500 hover:text-green-600 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDelete(rec)}
                              className="p-1.5 hover:bg-red-100 rounded text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"
                              title="Delete"
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedRecord ? 'Edit Communication' : 'New Communication'}
        size="lg"
      >
        {/* Form Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
          {['Details', 'Stakeholder', 'Dates & Assignment', 'Notes'].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setFormTab(idx)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                formTab === idx
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 0: Details */}
        {formTab === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Annual Environmental Report to Regulator"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the purpose and content of this communication..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Direction
                </label>
                <select
                  value={form.direction}
                  onChange={(e) =>
                    setForm({ ...form, direction: e.target.value as 'INTERNAL' | 'EXTERNAL' })
                  }
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="EXTERNAL">External</option>
                  <option value="INTERNAL">Internal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as typeof form.status })
                  }
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="RECEIVED">Received</option>
                  <option value="ACKNOWLEDGED">Acknowledged</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value as typeof form.priority })
                  }
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="checkbox"
                id="responseRequired"
                checked={form.responseRequired}
                onChange={(e) => setForm({ ...form, responseRequired: e.target.checked })}
                className="h-4 w-4 text-green-600 rounded border-gray-300"
              />
              <label
                htmlFor="responseRequired"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Response required
              </label>
            </div>
          </div>
        )}

        {/* Tab 1: Stakeholder */}
        {formTab === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stakeholder / Organisation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.stakeholder}
                  onChange={(e) => setForm({ ...form, stakeholder: e.target.value })}
                  placeholder="e.g. Environment Agency"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stakeholder Type
                </label>
                <select
                  value={form.stakeholderType}
                  onChange={(e) => setForm({ ...form, stakeholderType: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="">Select type...</option>
                  <option value="Regulatory Body">Regulatory Body</option>
                  <option value="Local Authority">Local Authority</option>
                  <option value="Community">Community</option>
                  <option value="Customer">Customer</option>
                  <option value="Supplier">Supplier</option>
                  <option value="NGO">NGO</option>
                  <option value="Media">Media</option>
                  <option value="Employee">Employee</option>
                  <option value="Management">Management</option>
                  <option value="Investor">Investor</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  placeholder="Full name"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-xs font-semibold text-green-800 mb-2 uppercase tracking-wide">
                ISO 14001 Cl. 7.4.2 — External Communication
              </p>
              <p className="text-xs text-green-700">
                The organisation shall establish and implement processes for external environmental
                communications as required by its compliance obligations and as decided by the
                organisation. External communications shall consider the views of interested
                parties.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Dates & Assignment */}
        {formTab === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Sent
                </label>
                <input
                  type="date"
                  value={form.dateSent}
                  onChange={(e) => setForm({ ...form, dateSent: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Received
                </label>
                <input
                  type="date"
                  value={form.dateReceived}
                  onChange={(e) => setForm({ ...form, dateReceived: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due / Response Date
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  placeholder="Name or role"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Aspect Reference
                </label>
                <input
                  type="text"
                  value={form.aspectRef}
                  onChange={(e) => setForm({ ...form, aspectRef: e.target.value })}
                  placeholder="e.g. ENV-ASP-2026-001"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Legal Reference
                </label>
                <input
                  type="text"
                  value={form.legalRef}
                  onChange={(e) => setForm({ ...form, legalRef: e.target.value })}
                  placeholder="e.g. ENV-LEG-2026-003"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Notes */}
        {formTab === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes / Additional Details
              </label>
              <textarea
                rows={8}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Record any additional context, outcomes, or follow-up actions related to this communication..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Documented Information
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ISO 14001 requires retaining documented information as evidence of communications.
                Ensure all relevant attachments and response records are stored and linked here.
              </p>
            </div>
          </div>
        )}

        <ModalFooter>
          <div className="flex justify-between w-full">
            <div className="flex gap-2">
              {formTab > 0 && (
                <Button variant="outline" onClick={() => setFormTab(formTab - 1)}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              {formTab < 3 ? (
                <Button
                  onClick={() => setFormTab(formTab + 1)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={saving || !form.subject.trim() || !form.stakeholder.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {saving ? 'Saving...' : selectedRecord ? 'Update' : 'Create'}
                </Button>
              )}
            </div>
          </div>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Communication"
        size="sm"
      >
        <p className="text-gray-600 text-sm mb-2">
          Are you sure you want to delete this communication record?
        </p>
        {selectedRecord && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {selectedRecord.subject}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {selectedRecord.stakeholder}
            </p>
          </div>
        )}
        <p className="text-xs text-red-500">This action cannot be undone.</p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
