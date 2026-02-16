'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, FileText, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const STATUSES = ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED', 'OBSOLETE'] as const;
const CATEGORIES = ['POLICY', 'PROCEDURE', 'WORK_INSTRUCTION', 'FORM', 'TEMPLATE', 'RECORD', 'MANUAL', 'EXTERNAL', 'OTHER'] as const;

interface Document {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  category: string;
  department: string;
  status: string;
  currentVersion: number;
  fileUrl: string;
  owner: string;
  ownerName: string;
  reviewDate: string;
  retentionDate: string;
  tags: string[];
  notes: string;
  createdAt: string;
}

interface DocumentForm {
  title: string;
  description: string;
  category: string;
  department: string;
  status: string;
  currentVersion: number;
  fileUrl: string;
  owner: string;
  ownerName: string;
  reviewDate: string;
  retentionDate: string;
  tags: string;
  notes: string;
}

const emptyForm: DocumentForm = {
  title: '',
  description: '',
  category: 'PROCEDURE',
  department: '',
  status: 'DRAFT',
  currentVersion: 1,
  fileUrl: '',
  owner: '',
  ownerName: '',
  reviewDate: '',
  retentionDate: '',
  tags: '',
  notes: '',
};

function getStatusColor(status: string) {
  switch (status) {
    case 'PUBLISHED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'APPROVED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'PENDING_REVIEW': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    case 'ARCHIVED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'OBSOLETE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

export default function DocumentsClient() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DocumentForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadDocuments = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/documents', { params });
      setDocuments(response.data.data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(doc: Document) {
    setForm({
      title: doc.title,
      description: doc.description || '',
      category: doc.category || 'PROCEDURE',
      department: doc.department || '',
      status: doc.status || 'DRAFT',
      currentVersion: doc.currentVersion || 1,
      fileUrl: doc.fileUrl || '',
      owner: doc.owner || '',
      ownerName: doc.ownerName || '',
      reviewDate: doc.reviewDate ? doc.reviewDate.split('T')[0] : '',
      retentionDate: doc.retentionDate ? doc.retentionDate.split('T')[0] : '',
      tags: (doc.tags || []).join(', '),
      notes: doc.notes || '',
    });
    setEditId(doc.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        reviewDate: form.reviewDate ? new Date(form.reviewDate).toISOString() : undefined,
        retentionDate: form.retentionDate ? new Date(form.retentionDate).toISOString() : undefined,
      };
      if (editId) {
        await api.put(`/documents/${editId}`, payload);
      } else {
        await api.post('/documents', payload);
      }
      setModalOpen(false);
      loadDocuments();
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
      loadDocuments();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Documents</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">ISO 9001 Clause 7.5 - Documented information</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />Add Document
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{documents.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{documents.filter(d => d.status === 'PUBLISHED').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Published</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-amber-600">{documents.filter(d => d.status === 'PENDING_REVIEW').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Pending Review</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-gray-600">{documents.filter(d => d.status === 'DRAFT').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search documents"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />)}</div>
            ) : documents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map(doc => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-mono text-xs">{doc.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{doc.title}</TableCell>
                        <TableCell><Badge variant="outline">{(doc.category || '-').replace(/_/g, ' ')}</Badge></TableCell>
                        <TableCell className="text-sm">{doc.department || '-'}</TableCell>
                        <TableCell className="text-sm">v{doc.currentVersion || 1}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                            {doc.status?.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{doc.ownerName || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(doc)}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(doc.id)} className="text-red-600 hover:bg-red-50">Delete</Button>
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
                  <Plus className="h-4 w-4 mr-2" />Add First Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Document' : 'Add Document'} size="lg">
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Document title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe the document..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="e.g. Quality, Operations" />
                </div>
                <div>
                  <Label>Version</Label>
                  <Input type="number" value={form.currentVersion} onChange={e => setForm(p => ({ ...p, currentVersion: parseInt(e.target.value) || 1 }))} min={1} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Owner Name</Label>
                  <Input value={form.ownerName} onChange={e => setForm(p => ({ ...p, ownerName: e.target.value }))} placeholder="Document owner" />
                </div>
                <div>
                  <Label>File URL</Label>
                  <Input value={form.fileUrl} onChange={e => setForm(p => ({ ...p, fileUrl: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Review Date</Label>
                  <Input type="date" value={form.reviewDate} onChange={e => setForm(p => ({ ...p, reviewDate: e.target.value }))} />
                </div>
                <div>
                  <Label>Retention Date</Label>
                  <Input type="date" value={form.retentionDate} onChange={e => setForm(p => ({ ...p, retentionDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="iso9001, quality, procedure" />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Additional notes..." />
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.title}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Document' : 'Create Document'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
