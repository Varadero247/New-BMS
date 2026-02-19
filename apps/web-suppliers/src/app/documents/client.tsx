'use client';

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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ims/ui';
import { Plus, FileText, Loader2, Search, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

const DOC_TYPES = [
  'CERTIFICATE',
  'LICENSE',
  'INSURANCE',
  'AUDIT_REPORT',
  'QUALITY_MANUAL',
  'OTHER',
] as const;

interface SupplierDoc {
  id: string;
  referenceNumber: string;
  supplierId: string;
  type: string;
  title: string;
  fileUrl: string;
  expiryDate: string;
  isVerified: boolean;
  verifiedBy: string;
  notes: string;
  createdAt: string;
}

interface DocForm {
  supplierId: string;
  type: string;
  title: string;
  fileUrl: string;
  expiryDate: string;
  isVerified: boolean;
  verifiedBy: string;
  notes: string;
}

const emptyForm: DocForm = {
  supplierId: '',
  type: 'CERTIFICATE',
  title: '',
  fileUrl: '',
  expiryDate: '',
  isVerified: false,
  verifiedBy: '',
  notes: '',
};

interface SupplierOption {
  id: string;
  name: string;
  referenceNumber: string;
}

export default function DocumentsClient() {
  const [items, setItems] = useState<SupplierDoc[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DocForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      const [res, suppRes] = await Promise.all([
        api.get('/documents', { params }),
        api.get('/suppliers'),
      ]);
      let data = res.data.data || [];
      if (typeFilter !== 'all') {
        data = data.filter((d: SupplierDoc) => d.type === typeFilter);
      }
      setItems(data);
      setSuppliers(suppRes.data.data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(item: SupplierDoc) {
    setForm({
      supplierId: item.supplierId || '',
      type: item.type || 'CERTIFICATE',
      title: item.title || '',
      fileUrl: item.fileUrl || '',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      isVerified: item.isVerified || false,
      verifiedBy: item.verifiedBy || '',
      notes: item.notes || '',
    });
    setEditId(item.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.supplierId || !form.title) return;
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        ...form,
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
      };
      if (editId) {
        await api.put(`/documents/${editId}`, payload);
      } else {
        await api.post('/documents', payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) {
      console.error('Failed to save document:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      loadItems();
    } catch (err) {
      console.error(err);
    }
  }

  function getSupplierName(id: string) {
    const s = suppliers.find((s) => s.id === id);
    return s ? s.name : id;
  }

  function isExpired(date: string) {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Supplier Documents
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Certificates, licenses and compliance documents
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Document
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{items.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {items.filter((i) => i.isVerified).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">
                {items.filter((i) => i.expiryDate && isExpired(i.expiryDate)).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expired</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {items.filter((i) => i.type === 'CERTIFICATE').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Certificates</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search documents"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            aria-label="Filter by type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Types</option>
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="text-sm">
                          {getSupplierName(item.supplierId)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.type?.replace(/_/g, ' ') || '-'}</Badge>
                        </TableCell>
                        <TableCell>
                          {item.expiryDate ? (
                            <span
                              className={`text-sm ${isExpired(item.expiryDate) ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                            >
                              {new Date(item.expiryDate).toLocaleDateString()}
                              {isExpired(item.expiryDate) && ' (Expired)'}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {item.isVerified ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No documents found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editId ? 'Edit Document' : 'Add Document'}
            size="lg"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier *</Label>
                  <Select
                    value={form.supplierId}
                    onChange={(e) => setForm((p) => ({ ...p, supplierId: e.target.value }))}
                  >
                    <option value="">Select supplier...</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.referenceNumber})
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  >
                    {DOC_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Document title"
                />
              </div>
              <div>
                <Label>File URL</Label>
                <Input
                  value={form.fileUrl}
                  onChange={(e) => setForm((p) => ({ ...p, fileUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Verified By</Label>
                  <Input
                    value={form.verifiedBy}
                    onChange={(e) => setForm((p) => ({ ...p, verifiedBy: e.target.value }))}
                    placeholder="Verifier name"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={form.isVerified}
                  onChange={(e) => setForm((p) => ({ ...p, isVerified: e.target.checked }))}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <Label htmlFor="isVerified">Document verified</Label>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !form.supplierId || !form.title}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : editId ? (
                  'Update Document'
                ) : (
                  'Create Document'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
