'use client';

import { useEffect, useState } from 'react';
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
import { Plus, Search, Shield, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface FoodDefenseItem {
  id: string;
  title?: string;
  name?: string;
  area?: string;
  threatType?: string;
  vulnerability?: string;
  likelihood?: string;
  severity?: string;
  riskScore?: number;
  mitigation?: string;
  responsible?: string;
  reviewDate?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

const threatColors: Record<string, string> = {
  INTENTIONAL: 'bg-red-100 text-red-700',
  UNINTENTIONAL: 'bg-yellow-100 text-yellow-700',
  ACCIDENTAL: 'bg-blue-100 text-blue-700',
};

const initialForm = {
  title: '',
  area: '',
  threatType: 'INTENTIONAL',
  vulnerability: '',
  likelihood: 'LOW',
  severity: 'MEDIUM',
  mitigation: '',
  responsible: '',
  reviewDate: '',
  notes: '',
  status: 'OPEN',
};

export default function FoodDefensePage() {
  const [items, setItems] = useState<FoodDefenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FoodDefenseItem | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function load() {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/food-defense${params}`);
      setItems(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(initialForm);
    setFormError('');
    setModalOpen(true);
  }
  function openEdit(r: FoodDefenseItem) {
    setEditing(r);
    setForm({
      title: r.title || r.name || '',
      area: r.area || '',
      threatType: r.threatType || 'INTENTIONAL',
      vulnerability: r.vulnerability || '',
      likelihood: r.likelihood || 'LOW',
      severity: r.severity || 'MEDIUM',
      mitigation: r.mitigation || '',
      responsible: r.responsible || '',
      reviewDate: r.reviewDate ? r.reviewDate.split('T')[0] : '',
      notes: r.notes || '',
      status: r.status,
    });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.title.trim()) {
      setFormError('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        title: form.title,
        threatType: form.threatType,
        likelihood: form.likelihood,
        severity: form.severity,
        status: form.status,
      };
      if (form.area) payload.area = form.area;
      if (form.vulnerability) payload.vulnerability = form.vulnerability;
      if (form.mitigation) payload.mitigation = form.mitigation;
      if (form.responsible) payload.responsible = form.responsible;
      if (form.reviewDate) payload.reviewDate = form.reviewDate;
      if (form.notes) payload.notes = form.notes;
      if (editing) {
        await api.put(`/food-defense/${editing.id}`, payload);
      } else {
        await api.post('/food-defense', payload);
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      setFormError(e?.response?.data?.error?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this food defense record?')) return;
    try {
      await api.delete(`/food-defense/${id}`);
      load();
    } catch {
      alert('Failed');
    }
  }

  const getRiskLevel = (likelihood: string, severity: string) => {
    const l = ['LOW', 'MEDIUM', 'HIGH'].indexOf(likelihood);
    const s = ['LOW', 'MEDIUM', 'HIGH'].indexOf(severity);
    const score = (l + 1) * (s + 1);
    if (score >= 7) return { label: 'HIGH', color: 'bg-red-100 text-red-700' };
    if (score >= 4) return { label: 'MEDIUM', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'LOW', color: 'bg-green-100 text-green-700' };
  };

  const filtered = items.filter((i) => {
    const title = i.title || i.name || '';
    return (
      title.toLowerCase().includes(search.toLowerCase()) ||
      (i.area || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const highRisk = items.filter(
    (i) => getRiskLevel(i.likelihood || 'LOW', i.severity || 'LOW').label === 'HIGH'
  );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Food Defense</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Intentional adulteration threat assessment and mitigation
            </p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Threat
          </Button>
        </div>

        {highRisk.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-medium">
              {highRisk.length} high-risk threat{highRisk.length > 1 ? 's' : ''} identified —
              mitigation actions required
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Threats</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">High Risk</p>
                  <p className="text-2xl font-bold text-red-600">{highRisk.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {items.filter((i) => i.status === 'OPEN').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mitigated</p>
                  <p className="text-2xl font-bold text-green-600">
                    {items.filter((i) => i.status === 'MITIGATED' || i.status === 'CLOSED').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  aria-label="Search by title or area..."
                  placeholder="Search by title or area..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="MITIGATED">Mitigated</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              Threat Assessments ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Area
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Threat Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Likelihood
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Severity
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Risk Level
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
                    {filtered.map((r) => {
                      const risk = getRiskLevel(r.likelihood || 'LOW', r.severity || 'LOW');
                      return (
                        <tr key={r.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {r.title || r.name || '—'}
                            </p>
                            {r.vulnerability && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {r.vulnerability}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{r.area || '—'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${threatColors[r.threatType || ''] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                            >
                              {(r.threatType || '—').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{r.likelihood || '—'}</td>
                          <td className="py-3 px-4 text-gray-600">{r.severity || '—'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${risk.color}`}
                            >
                              {risk.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                r.status === 'MITIGATED' || r.status === 'CLOSED'
                                  ? 'bg-green-100 text-green-700'
                                  : r.status === 'OPEN'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-blue-100 text-blue-700'
                              }
                            >
                              {r.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
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
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No food defense records found</p>
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Threat
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Threat Assessment' : 'Add Threat Assessment'}
        size="lg"
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="e.g. Raw material intake point vulnerability"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Area</label>
              <input
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="e.g. Receiving Dock"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Threat Type</label>
              <select
                value={form.threatType}
                onChange={(e) => setForm({ ...form, threatType: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="INTENTIONAL">Intentional</option>
                <option value="UNINTENTIONAL">Unintentional</option>
                <option value="ACCIDENTAL">Accidental</option>
                <option value="MALICIOUS">Malicious</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vulnerability Description</label>
            <textarea
              value={form.vulnerability}
              onChange={(e) => setForm({ ...form, vulnerability: e.target.value })}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Likelihood</label>
              <select
                value={form.likelihood}
                onChange={(e) => setForm({ ...form, likelihood: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Severity</label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="MITIGATED">Mitigated</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mitigation Measures</label>
            <textarea
              value={form.mitigation}
              onChange={(e) => setForm({ ...form, mitigation: e.target.value })}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Responsible Person</label>
              <input
                value={form.responsible}
                onChange={(e) => setForm({ ...form, responsible: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Review Date</label>
              <input
                type="date"
                value={form.reviewDate}
                onChange={(e) => setForm({ ...form, reviewDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
