'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, Button, Badge, Modal, ModalFooter, Input, Label, Select, Textarea } from '@ims/ui';
import { Plus, Search, RefreshCw, Users, Building2, Globe, FileText } from 'lucide-react';
import { api } from '@/lib/api';

interface InterestedParty {
  id: string;
  referenceNumber: string;
  partyName: string;
  partyType: string;
  reasonForInclusion: string;
  needsExpectations: string | null;
  communicationMethod: string | null;
  reviewFrequency: string;
  status: string;
  notes: string | null;
  createdAt: string;
  _count?: { issues: number };
}

const PARTY_TYPES = ['INTERNAL', 'EXTERNAL'] as const;
const STATUSES = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
const REVIEW_FREQUENCIES = ['MONTHLY', 'QUARTERLY', 'ANNUALLY', 'BI_ANNUALLY', 'ON_CHANGE'] as const;

const statusColors: Record<string, string> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  ARCHIVED: 'default',
};

const typeColors: Record<string, string> = {
  INTERNAL: 'bg-blue-100 text-blue-700',
  EXTERNAL: 'bg-purple-100 text-purple-700',
};

const emptyForm = {
  partyName: '',
  partyType: 'EXTERNAL' as string,
  reasonForInclusion: '',
  needsExpectations: '',
  communicationMethod: '',
  reviewFrequency: 'ANNUALLY' as string,
  status: 'ACTIVE' as string,
  notes: '',
};

export default function InterestedPartiesPage() {
  const [items, setItems] = useState<InterestedParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<InterestedParty | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [form, setForm] = useState({ ...emptyForm });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(pagination.page), limit: '25' };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.partyType = filterType;
      const res = await api.get('/parties', { params });
      const data = res.data.data;
      if (Array.isArray(data)) {
        setItems(data);
      } else if (data?.items) {
        setItems(data.items);
        setPagination(p => ({ ...p, total: data.total || 0, totalPages: data.totalPages || 0 }));
      }
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [pagination.page, search, filterStatus, filterType]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ ...emptyForm });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (item: InterestedParty) => {
    setEditItem(item);
    setForm({
      partyName: item.partyName,
      partyType: item.partyType,
      reasonForInclusion: item.reasonForInclusion,
      needsExpectations: item.needsExpectations || '',
      communicationMethod: item.communicationMethod || '',
      reviewFrequency: item.reviewFrequency,
      status: item.status,
      notes: item.notes || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.partyName.trim()) {
      setError('Party name is required');
      return;
    }
    if (!form.reasonForInclusion.trim()) {
      setError('Reason for inclusion is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editItem) {
        await api.put(`/parties/${editItem.id}`, form);
      } else {
        await api.post('/parties', form);
      }
      setModalOpen(false);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this interested party?')) return;
    try {
      await api.delete(`/parties/${id}`);
      fetchItems();
    } catch {
      /* empty */
    }
  };

  const internalCount = items.filter(i => i.partyType === 'INTERNAL').length;
  const externalCount = items.filter(i => i.partyType === 'EXTERNAL').length;
  const activeCount = items.filter(i => i.status === 'ACTIVE').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Interested Parties</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ISO 9001:2015 &sect;4.2 &mdash; Understanding needs and expectations of interested parties</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Interested Party</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{pagination.total || items.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Parties</div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{internalCount}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Internal</div>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Building2 className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{externalCount}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">External</div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{activeCount}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search parties..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onChange={e => { setFilterType(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
          <option value="">All Types</option>
          {PARTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Button variant="outline" onClick={fetchItems}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Reference</th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Party Name</th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Type</th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Review Frequency</th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Issues</th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No interested parties found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start by identifying the interested parties relevant to your QMS.</p>
                    </td>
                  </tr>
                ) : items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:bg-gray-800 cursor-pointer" onClick={() => openEdit(item)}>
                    <td className="p-3 font-mono text-xs text-blue-600">{item.referenceNumber}</td>
                    <td className="p-3">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{item.partyName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{item.reasonForInclusion}</div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeColors[item.partyType] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                        {item.partyType}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{item.reviewFrequency.replace(/_/g, ' ')}</td>
                    <td className="p-3"><Badge variant={statusColors[item.status] as any}>{item.status}</Badge></td>
                    <td className="p-3 text-gray-600">{item._count?.issues ?? 0}</td>
                    <td className="p-3">
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="outline" size="sm" onClick={() => openEdit(item)}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>Previous</Button>
          <span className="text-sm text-gray-500 dark:text-gray-400 py-2">Page {pagination.page} of {pagination.totalPages}</span>
          <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next</Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Interested Party' : 'Add Interested Party'} size="lg">
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Party Name *</Label>
              <Input
                value={form.partyName}
                onChange={e => setForm(f => ({ ...f, partyName: e.target.value }))}
                placeholder="e.g. Customers, Regulatory Bodies, Employees"
              />
            </div>
            <div>
              <Label>Party Type *</Label>
              <Select value={form.partyType} onChange={e => setForm(f => ({ ...f, partyType: e.target.value }))}>
                {PARTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <div>
              <Label>Review Frequency</Label>
              <Select value={form.reviewFrequency} onChange={e => setForm(f => ({ ...f, reviewFrequency: e.target.value }))}>
                {REVIEW_FREQUENCIES.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div>
              <Label>Communication Method</Label>
              <Input
                value={form.communicationMethod}
                onChange={e => setForm(f => ({ ...f, communicationMethod: e.target.value }))}
                placeholder="e.g. Email, Meeting, Survey"
              />
            </div>
            <div className="col-span-2">
              <Label>Reason for Inclusion *</Label>
              <Textarea
                value={form.reasonForInclusion}
                onChange={e => setForm(f => ({ ...f, reasonForInclusion: e.target.value }))}
                placeholder="Why is this party relevant to the QMS?"
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <Label>Needs and Expectations</Label>
              <Textarea
                value={form.needsExpectations}
                onChange={e => setForm(f => ({ ...f, needsExpectations: e.target.value }))}
                placeholder="What are the needs and expectations of this interested party?"
                rows={3}
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Create'}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
