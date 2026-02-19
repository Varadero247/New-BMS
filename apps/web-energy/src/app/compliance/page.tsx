'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import {
  Plus,
  Search,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  Edit2,
  Trash2,
  Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface ComplianceItem {
  id: string;
  requirement: string;
  regulation?: string;
  authority?: string;
  status: string;
  dueDate?: string;
  lastReviewDate?: string;
  responsible?: string;
  category?: string;
  description?: string;
  evidence?: string;
  priority?: string;
}

const CATEGORIES = [
  'REPORTING',
  'METERING',
  'TARGETS',
  'AUDIT',
  'CERTIFICATION',
  'DISCLOSURE',
  'OTHER',
];
const STATUS_OPTIONS = ['COMPLIANT', 'NON_COMPLIANT', 'PENDING', 'IN_PROGRESS', 'EXEMPT'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> =
  {
    COMPLIANT: { label: 'Compliant', className: 'bg-green-100 text-green-700', icon: CheckCircle },
    NON_COMPLIANT: { label: 'Non-Compliant', className: 'bg-red-100 text-red-700', icon: XCircle },
    PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-700', icon: Clock },
    EXEMPT: {
      label: 'Exempt',
      className: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
      icon: Shield } };

const empty: Partial<ComplianceItem> = {
  requirement: '',
  regulation: '',
  authority: '',
  status: 'PENDING',
  category: 'REPORTING',
  priority: 'MEDIUM',
  responsible: '',
  description: '',
  evidence: '' };

export default function CompliancePage() {
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<ComplianceItem>>(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const load = async () => {
    try {
      const r = await api.get('/compliance');
      setItems(r.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((i) => {
    const m = JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase());
    const ms = !filterStatus || i.status === filterStatus;
    const mc = !filterCategory || i.category === filterCategory;
    return m && ms && mc;
  });

  const stats = {
    total: items.length,
    compliant: items.filter((i) => i.status === 'COMPLIANT').length,
    nonCompliant: items.filter((i) => i.status === 'NON_COMPLIANT').length,
    pending: items.filter((i) => i.status === 'PENDING' || i.status === 'IN_PROGRESS').length };
  const complianceRate = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;

  const openCreate = () => {
    setEditItem({ ...empty });
    setIsEditing(false);
    setModalOpen(true);
  };
  const openEdit = (item: ComplianceItem) => {
    setEditItem({
      ...item,
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : '',
      lastReviewDate: item.lastReviewDate
        ? new Date(item.lastReviewDate).toISOString().slice(0, 10)
        : '' });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEditing && editItem.id) {
        await api.put(`/compliance/${editItem.id}`, editItem);
      } else {
        await api.post('/compliance', editItem);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/compliance/${deleteId}`);
      setDeleteModal(false);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading)
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Energy Compliance
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Energy regulatory compliance tracking and obligations
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" /> Add Requirement
          </button>
        </div>

        {/* Compliance Rate Banner */}
        <div
          className={`mb-6 rounded-xl p-5 ${complianceRate >= 80 ? 'bg-green-50 border border-green-200' : complianceRate >= 60 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Compliance Rate</p>
              <p
                className={`text-4xl font-bold mt-1 ${complianceRate >= 80 ? 'text-green-700' : complianceRate >= 60 ? 'text-yellow-700' : 'text-red-700'}`}
              >
                {complianceRate}%
              </p>
            </div>
            <div className="flex-1 mx-8">
              <div className="h-4 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${complianceRate >= 80 ? 'bg-green-500' : complianceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${complianceRate}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            <Shield
              className={`h-12 w-12 ${complianceRate >= 80 ? 'text-green-500' : complianceRate >= 60 ? 'text-yellow-500' : 'text-red-500'}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Requirements</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  <Shield className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Compliant</p>
                  <p className="text-2xl font-bold text-green-700">{stats.compliant}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Non-Compliant</p>
                  <p className="text-2xl font-bold text-red-700">{stats.nonCompliant}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-full">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search requirements..."
              placeholder="Search requirements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-600" />
              Compliance Requirements ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Requirement
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Regulation
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Priority
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Due Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Responsible
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => {
                      const sc = statusConfig[item.status] || statusConfig.PENDING;
                      const Icon = sc.icon;
                      const priorityColors: Record<string, string> = {
                        LOW: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
                        MEDIUM: 'bg-blue-100 text-blue-700',
                        HIGH: 'bg-orange-100 text-orange-700',
                        CRITICAL: 'bg-red-100 text-red-700' };
                      return (
                        <tr key={item.id} className="border-b hover:bg-yellow-50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {item.requirement}
                            </p>
                            {item.authority && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {item.authority}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">
                            {item.regulation || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                              {item.category || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${priorityColors[item.priority || 'MEDIUM']}`}
                            >
                              {item.priority || 'MEDIUM'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs flex items-center gap-1">
                            {item.dueDate && <Calendar className="h-3 w-3" />}
                            {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">
                            {item.responsible || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${sc.className}`}
                            >
                              <Icon className="h-3 w-3" />
                              {sc.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => openEdit(item)}
                                className="p-1.5 rounded hover:bg-yellow-100 text-yellow-700"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteId(item.id);
                                  setDeleteModal(true);
                                }}
                                className="p-1.5 rounded hover:bg-red-100 text-red-600"
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
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No compliance requirements found</p>
                <p className="text-sm mt-1">
                  Add energy regulatory compliance requirements to track
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Requirement' : 'Add Compliance Requirement'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Requirement *
            </label>
            <input
              value={editItem.requirement || ''}
              onChange={(e) => setEditItem((p) => ({ ...p, requirement: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="e.g. Annual energy audit submission"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Regulation
              </label>
              <input
                value={editItem.regulation || ''}
                onChange={(e) => setEditItem((p) => ({ ...p, regulation: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="e.g. ISO 50001, ESOS, SECR"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Authority
              </label>
              <input
                value={editItem.authority || ''}
                onChange={(e) => setEditItem((p) => ({ ...p, authority: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Regulatory body"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={editItem.category || 'REPORTING'}
                onChange={(e) => setEditItem((p) => ({ ...p, category: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={editItem.priority || 'MEDIUM'}
                onChange={(e) => setEditItem((p) => ({ ...p, priority: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={editItem.dueDate || ''}
                onChange={(e) => setEditItem((p) => ({ ...p, dueDate: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Review Date
              </label>
              <input
                type="date"
                value={editItem.lastReviewDate || ''}
                onChange={(e) => setEditItem((p) => ({ ...p, lastReviewDate: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Responsible
              </label>
              <input
                value={editItem.responsible || ''}
                onChange={(e) => setEditItem((p) => ({ ...p, responsible: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={editItem.status || 'PENDING'}
                onChange={(e) => setEditItem((p) => ({ ...p, status: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Evidence / Notes
            </label>
            <textarea
              value={editItem.evidence || ''}
              onChange={(e) => setEditItem((p) => ({ ...p, evidence: e.target.value }))}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Link to evidence, document reference..."
            />
          </div>
        </div>
        <ModalFooter>
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !editItem.requirement}
            className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            )}
            {isEditing ? 'Save Changes' : 'Add Requirement'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Requirement"
        size="sm"
      >
        <p className="text-gray-600 text-sm">
          Are you sure you want to delete this compliance requirement?
        </p>
        <ModalFooter>
          <button
            onClick={() => setDeleteModal(false)}
            className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
