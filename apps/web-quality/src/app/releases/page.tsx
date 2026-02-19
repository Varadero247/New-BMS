'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
  Label,
  Select,
  Textarea,
} from '@ims/ui';
import { Plus, Search, RefreshCw, PackageCheck } from 'lucide-react';
import { api } from '@/lib/api';

interface Release {
  id: string;
  referenceNumber: string;
  productName: string;
  productId: string | null;
  batchNumber: string | null;
  releaseStage: string | null;
  inspectionCriteria: string | null;
  testResults: string | null;
  decision: string;
  authorisedBy: string | null;
  authorisedAt: string | null;
  conditions: string | null;
  nonconformanceRef: string | null;
  evidence: string | null;
  notes: string | null;
  createdAt: string;
}

const DECISIONS = ['APPROVED', 'REJECTED', 'CONDITIONAL', 'ON_HOLD'] as const;
const decisionColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'danger' | 'info'> = {
  APPROVED: 'success',
  REJECTED: 'danger',
  CONDITIONAL: 'warning',
  ON_HOLD: 'default',
};

export default function ReleasesPage() {
  const [items, setItems] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDecision, setFilterDecision] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Release | null>(null);
  const [authItem, setAuthItem] = useState<Release | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  const [form, setForm] = useState({
    productName: '',
    productId: '',
    batchNumber: '',
    releaseStage: '',
    inspectionCriteria: '',
    testResults: '',
    conditions: '',
    nonconformanceRef: '',
    evidence: '',
    notes: '',
  });

  const [authForm, setAuthForm] = useState({ decision: 'APPROVED' as string, conditions: '' });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(pagination.page), limit: '25' };
      if (search) params.search = search;
      if (filterDecision) params.decision = filterDecision;
      const res = await api.get('/releases', { params });
      setItems(res.data.data);
      setPagination((p) => ({
        ...p,
        total: res.data.pagination.total,
        totalPages: res.data.pagination.totalPages,
      }));
    } catch {
      /* empty */
    }
    setLoading(false);
  }, [pagination.page, search, filterDecision]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      productName: '',
      productId: '',
      batchNumber: '',
      releaseStage: '',
      inspectionCriteria: '',
      testResults: '',
      conditions: '',
      nonconformanceRef: '',
      evidence: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const openEdit = (item: Release) => {
    setEditItem(item);
    setForm({
      productName: item.productName,
      productId: item.productId || '',
      batchNumber: item.batchNumber || '',
      releaseStage: item.releaseStage || '',
      inspectionCriteria: item.inspectionCriteria || '',
      testResults: item.testResults || '',
      conditions: item.conditions || '',
      nonconformanceRef: item.nonconformanceRef || '',
      evidence: item.evidence || '',
      notes: item.notes || '',
    });
    setModalOpen(true);
  };

  const openAuthorise = (item: Release) => {
    setAuthItem(item);
    setAuthForm({ decision: 'APPROVED', conditions: '' });
    setAuthModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.put(`/releases/${editItem.id}`, form);
      } else {
        await api.post('/releases', form);
      }
      setModalOpen(false);
      fetchItems();
    } catch {
      /* empty */
    }
  };

  const handleAuthorise = async () => {
    if (!authItem) return;
    try {
      await api.put(`/releases/${authItem.id}/authorise`, authForm);
      setAuthModalOpen(false);
      fetchItems();
    } catch {
      /* empty */
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this release record?')) return;
    try {
      await api.delete(`/releases/${id}`);
      fetchItems();
    } catch {
      /* empty */
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Release Records</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ISO 9001:2015 §8.6 — Release of products and services
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Release
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {items.filter((i) => i.decision === 'APPROVED').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {items.filter((i) => i.decision === 'ON_HOLD').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">On Hold</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {items.filter((i) => i.decision === 'REJECTED').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Rejected</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            aria-label="Search products or batches..."
            placeholder="Search products or batches..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={filterDecision}
          onChange={(e) => {
            setFilterDecision(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
        >
          <option value="">All Decisions</option>
          {DECISIONS.map((d) => (
            <option key={d} value={d}>
              {d.replace(/_/g, ' ')}
            </option>
          ))}
        </Select>
        <Button variant="outline" onClick={fetchItems}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Reference
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Product
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Batch
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Decision
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Authorised By
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No release records found
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:bg-gray-800">
                      <td className="p-3 font-mono text-xs text-blue-600">
                        {item.referenceNumber}
                      </td>
                      <td className="p-3 font-medium">{item.productName}</td>
                      <td className="p-3 text-gray-600">{item.batchNumber || '—'}</td>
                      <td className="p-3">
                        <Badge variant={decisionColors[item.decision]}>
                          {item.decision.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-3 text-gray-600">{item.authorisedBy || '—'}</td>
                      <td className="p-3 text-gray-600">
                        {item.authorisedAt ? new Date(item.authorisedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {item.decision === 'ON_HOLD' && (
                            <Button size="sm" onClick={() => openAuthorise(item)}>
                              <PackageCheck className="h-3 w-3 mr-1" />
                              Authorise
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400 py-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Release' : 'New Release Record'}
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Product Name *</Label>
            <Input
              value={form.productName}
              onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
            />
          </div>
          <div>
            <Label>Product ID</Label>
            <Input
              value={form.productId}
              onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
            />
          </div>
          <div>
            <Label>Batch Number</Label>
            <Input
              value={form.batchNumber}
              onChange={(e) => setForm((f) => ({ ...f, batchNumber: e.target.value }))}
            />
          </div>
          <div>
            <Label>Release Stage</Label>
            <Input
              value={form.releaseStage}
              onChange={(e) => setForm((f) => ({ ...f, releaseStage: e.target.value }))}
              placeholder="e.g. Final Inspection"
            />
          </div>
          <div className="col-span-2">
            <Label>Inspection Criteria</Label>
            <Textarea
              value={form.inspectionCriteria}
              onChange={(e) => setForm((f) => ({ ...f, inspectionCriteria: e.target.value }))}
            />
          </div>
          <div className="col-span-2">
            <Label>Test Results</Label>
            <Textarea
              value={form.testResults}
              onChange={(e) => setForm((f) => ({ ...f, testResults: e.target.value }))}
            />
          </div>
          <div className="col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{editItem ? 'Update' : 'Create'}</Button>
        </ModalFooter>
      </Modal>

      {/* Authorise Modal */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Authorise Release"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Authorise release for: <strong>{authItem?.productName}</strong> (Batch:{' '}
            {authItem?.batchNumber || 'N/A'})
          </p>
          <div>
            <Label>Decision *</Label>
            <Select
              value={authForm.decision}
              onChange={(e) => setAuthForm((f) => ({ ...f, decision: e.target.value }))}
            >
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CONDITIONAL">Conditional</option>
            </Select>
          </div>
          <div>
            <Label>Conditions</Label>
            <Textarea
              value={authForm.conditions}
              onChange={(e) => setAuthForm((f) => ({ ...f, conditions: e.target.value }))}
              placeholder="Enter any conditions for release..."
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setAuthModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAuthorise}>Authorise</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
