'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, GitBranch, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface Version {
  id: string;
  documentId: string;
  version: number;
  fileUrl: string;
  fileSize: number;
  changeNotes: string;
  createdBy: string;
  createdAt: string;
}

interface VersionForm {
  documentId: string;
  version: number;
  fileUrl: string;
  fileSize: number;
  changeNotes: string;
}

const emptyForm: VersionForm = {
  documentId: '',
  version: 1,
  fileUrl: '',
  fileSize: 0,
  changeNotes: '',
};

export default function VersionsClient() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<VersionForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadVersions = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      const response = await api.get('/versions', { params });
      setVersions(response.data.data || []);
    } catch (err) {
      console.error('Failed to load versions:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => { loadVersions(); }, [loadVersions]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(ver: Version) {
    setForm({
      documentId: ver.documentId || '',
      version: ver.version || 1,
      fileUrl: ver.fileUrl || '',
      fileSize: ver.fileSize || 0,
      changeNotes: ver.changeNotes || '',
    });
    setEditId(ver.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.documentId) return;
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/versions/${editId}`, form);
      } else {
        await api.post('/versions', form);
      }
      setModalOpen(false);
      loadVersions();
    } catch (err) {
      console.error('Failed to save version:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this version?')) return;
    try {
      await api.delete(`/versions/${id}`);
      loadVersions();
    } catch (err) {
      console.error(err);
    }
  }

  function formatFileSize(bytes: number) {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Document Versions</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track version history and change notes</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />Add Version
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{versions.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total Versions</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-indigo-600">{new Set(versions.map(v => v.documentId)).size}</p><p className="text-sm text-gray-500 dark:text-gray-400">Documents Versioned</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-blue-600">{Math.max(...versions.map(v => v.version), 0)}</p><p className="text-sm text-gray-500 dark:text-gray-400">Latest Version</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search versions"
              placeholder="Search versions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />)}</div>
            ) : versions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document ID</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>File Size</TableHead>
                      <TableHead>Change Notes</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.map(ver => (
                      <TableRow key={ver.id}>
                        <TableCell className="font-mono text-xs">{ver.documentId?.slice(0, 8)}...</TableCell>
                        <TableCell><Badge variant="default">v{ver.version}</Badge></TableCell>
                        <TableCell className="text-sm">{formatFileSize(ver.fileSize)}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{ver.changeNotes || '-'}</TableCell>
                        <TableCell className="text-sm">{ver.createdAt ? new Date(ver.createdAt).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(ver)}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(ver.id)} className="text-red-600 hover:bg-red-50">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <GitBranch className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No versions found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />Add First Version
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Version' : 'Add Version'} size="lg">
            <div className="space-y-4">
              <div>
                <Label>Document ID *</Label>
                <Input value={form.documentId} onChange={e => setForm(p => ({ ...p, documentId: e.target.value }))} placeholder="Document UUID" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Version Number *</Label>
                  <Input type="number" value={form.version} onChange={e => setForm(p => ({ ...p, version: parseInt(e.target.value) || 1 }))} min={1} />
                </div>
                <div>
                  <Label>File Size (bytes)</Label>
                  <Input type="number" value={form.fileSize} onChange={e => setForm(p => ({ ...p, fileSize: parseInt(e.target.value) || 0 }))} min={0} />
                </div>
              </div>
              <div>
                <Label>File URL</Label>
                <Input value={form.fileUrl} onChange={e => setForm(p => ({ ...p, fileUrl: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <Label>Change Notes</Label>
                <Textarea value={form.changeNotes} onChange={e => setForm(p => ({ ...p, changeNotes: e.target.value }))} rows={3} placeholder="Describe what changed in this version..." />
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.documentId}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Version' : 'Create Version'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
