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
import {
  Plus,
  FileText,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Edit2,
  File,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
}

interface Document {
  id: string;
  documentType: string;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  documentNumber?: string;
  requiresSignature: boolean;
  isConfidential: boolean;
  status: string;
  version: number;
  signedAt?: string;
  verifiedAt?: string;
  createdAt: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-red-100 text-red-700',
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-700',
  VERIFIED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-800',
  ARCHIVED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  PENDING_VERIFICATION: 'Pending Verification',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
  ARCHIVED: 'Archived',
};

const typeColors: Record<string, string> = {
  CONTRACT: 'bg-blue-100 text-blue-700',
  OFFER_LETTER: 'bg-emerald-100 text-emerald-700',
  NDA: 'bg-purple-100 text-purple-700',
  POLICY_ACKNOWLEDGMENT: 'bg-indigo-100 text-indigo-700',
  ID_PROOF: 'bg-orange-100 text-orange-700',
  ADDRESS_PROOF: 'bg-orange-100 text-orange-700',
  EDUCATION_CERTIFICATE: 'bg-teal-100 text-teal-700',
  EXPERIENCE_LETTER: 'bg-cyan-100 text-cyan-700',
  BACKGROUND_CHECK: 'bg-yellow-100 text-yellow-700',
  MEDICAL_CERTIFICATE: 'bg-pink-100 text-pink-700',
  TAX_FORM: 'bg-lime-100 text-lime-700',
  BANK_DETAILS: 'bg-amber-100 text-amber-700',
  PERFORMANCE_LETTER: 'bg-green-100 text-green-700',
  WARNING_LETTER: 'bg-red-100 text-red-700',
  TERMINATION_LETTER: 'bg-red-100 text-red-800',
  OTHER: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const DOCUMENT_TYPES = [
  'CONTRACT',
  'OFFER_LETTER',
  'NDA',
  'POLICY_ACKNOWLEDGMENT',
  'ID_PROOF',
  'ADDRESS_PROOF',
  'EDUCATION_CERTIFICATE',
  'EXPERIENCE_LETTER',
  'BACKGROUND_CHECK',
  'MEDICAL_CERTIFICATE',
  'TAX_FORM',
  'BANK_DETAILS',
  'PERFORMANCE_LETTER',
  'WARNING_LETTER',
  'TERMINATION_LETTER',
  'OTHER',
];

const DOCUMENT_STATUSES = [
  'ACTIVE',
  'EXPIRED',
  'PENDING_VERIFICATION',
  'VERIFIED',
  'REJECTED',
  'ARCHIVED',
];

function formatDocType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Create modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formDocumentType, setFormDocumentType] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFileName, setFormFileName] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formFileSize, setFormFileSize] = useState('');
  const [formIssueDate, setFormIssueDate] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formIsConfidential, setFormIsConfidential] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');

  useEffect(() => {
    loadData();
  }, [statusFilter, typeFilter]);

  async function loadData() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('documentType', typeFilter);

      const [docsRes, employeesRes] = await Promise.all([
        api.get(`/documents?${params.toString()}`),
        api.get('/employees'),
      ]);
      setDocuments(docsRes.data.data || []);
      setEmployees(employeesRes.data.data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  }

  function resetCreateForm() {
    setFormEmployeeId('');
    setFormDocumentType('');
    setFormTitle('');
    setFormDescription('');
    setFormFileName('');
    setFormFileUrl('');
    setFormFileSize('');
    setFormIssueDate('');
    setFormExpiryDate('');
    setFormIsConfidential(false);
  }

  async function handleCreate() {
    if (!formEmployeeId || !formDocumentType || !formTitle || !formFileName || !formFileUrl) return;
    setCreating(true);
    try {
      const payload: Record<string, any> = {
        employeeId: formEmployeeId,
        documentType: formDocumentType,
        title: formTitle,
        fileName: formFileName,
        fileUrl: formFileUrl,
        isConfidential: formIsConfidential,
      };
      if (formDescription) payload.description = formDescription;
      if (formFileSize) payload.fileSize = parseInt(formFileSize, 10);
      if (formIssueDate) payload.issueDate = formIssueDate;
      if (formExpiryDate) payload.expiryDate = formExpiryDate;

      await api.post('/documents', payload);
      setCreateModalOpen(false);
      resetCreateForm();
      setLoading(true);
      await loadData();
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setCreating(false);
    }
  }

  function openEditModal(doc: Document) {
    setEditDoc(doc);
    setEditStatus(doc.status);
    setEditTitle(doc.title);
    setEditDescription(doc.description || '');
    setEditExpiryDate(doc.expiryDate ? doc.expiryDate.split('T')[0] : '');
    setEditModalOpen(true);
  }

  async function handleEdit() {
    if (!editDoc) return;
    setEditing(true);
    try {
      const payload: Record<string, any> = {
        status: editStatus,
      };
      if (editTitle !== editDoc.title) payload.title = editTitle;
      if (editDescription !== (editDoc.description || '')) payload.description = editDescription;
      if (editExpiryDate) payload.expiryDate = editExpiryDate;

      await api.put(`/documents/${editDoc.id}`, payload);
      setEditModalOpen(false);
      setEditDoc(null);
      setLoading(true);
      await loadData();
    } catch (error) {
      console.error('Error updating document:', error);
    } finally {
      setEditing(false);
    }
  }

  // Filter documents by search term
  const filteredDocs = documents.filter((doc) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      doc.title.toLowerCase().includes(term) ||
      doc.fileName.toLowerCase().includes(term) ||
      doc.employee.firstName.toLowerCase().includes(term) ||
      doc.employee.lastName.toLowerCase().includes(term) ||
      (doc.documentNumber && doc.documentNumber.toLowerCase().includes(term))
    );
  });

  // Stats
  const totalDocs = documents.length;
  const activeDocs = documents.filter((d) => d.status === 'ACTIVE').length;
  const expiredDocs = documents.filter((d) => d.status === 'EXPIRED').length;
  const pendingDocs = documents.filter((d) => d.status === 'PENDING_VERIFICATION').length;

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Documents</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage employee documents and records
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4" /> Add Document
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Documents</p>
                  <p className="text-2xl font-bold">{totalDocs}</p>
                </div>
                <FileText className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-green-600">{activeDocs}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Expired</p>
                  <p className="text-2xl font-bold text-red-600">{expiredDocs}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Verification</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingDocs}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    aria-label="Search documents..."
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {formatDocType(t)}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                {DOCUMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s] || s}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Documents ({filteredDocs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDocs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Issue Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Expiry Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Size</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map((doc) => (
                      <tr
                        key={doc.id}
                        className="border-b hover:bg-gray-50 dark:bg-gray-800 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {doc.title}
                                </span>
                                {doc.isConfidential && (
                                  <Lock className="h-3 w-3 text-red-500" aria-label="Confidential" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {doc.fileName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-900 dark:text-gray-100">
                            {doc.employee.firstName} {doc.employee.lastName}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {doc.employee.employeeNumber}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              typeColors[doc.documentType] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {formatDocType(doc.documentType)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              statusColors[doc.status] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {statusLabels[doc.status] || doc.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {formatFileSize(doc.fileSize)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {doc.fileUrl && (
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 dark:text-gray-500 hover:text-emerald-600 p-1"
                                title="Open file"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            <button
                              onClick={() => openEditModal(doc)}
                              className="text-gray-400 dark:text-gray-500 hover:text-emerald-600 p-1"
                              title="Edit document"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No documents found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Document Modal */}
        <Modal
          isOpen={createModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            resetCreateForm();
          }}
          title="Add Document"
          size="lg"
        >
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee *
              </label>
              <select
                value={formEmployeeId}
                onChange={(e) => setFormEmployeeId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select employee...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Document Type *
              </label>
              <select
                value={formDocumentType}
                onChange={(e) => setFormDocumentType(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select type...</option>
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {formatDocType(t)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Employment Contract 2024"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Document description..."
                rows={3}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File Name *
                </label>
                <input
                  type="text"
                  value={formFileName}
                  onChange={(e) => setFormFileName(e.target.value)}
                  placeholder="e.g. contract.pdf"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File Size (bytes)
                </label>
                <input
                  type="number"
                  value={formFileSize}
                  onChange={(e) => setFormFileSize(e.target.value)}
                  placeholder="e.g. 1048576"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                File URL *
              </label>
              <input
                type="url"
                value={formFileUrl}
                onChange={(e) => setFormFileUrl(e.target.value)}
                placeholder="https://storage.example.com/documents/file.pdf"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={formIssueDate}
                  onChange={(e) => setFormIssueDate(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formExpiryDate}
                  onChange={(e) => setFormExpiryDate(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formIsConfidential}
                  onChange={(e) => setFormIsConfidential(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Mark as confidential
              </label>
            </div>
          </div>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateModalOpen(false);
                resetCreateForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                creating ||
                !formEmployeeId ||
                !formDocumentType ||
                !formTitle ||
                !formFileName ||
                !formFileUrl
              }
            >
              {creating ? 'Creating...' : 'Add Document'}
            </Button>
          </ModalFooter>
        </Modal>

        {/* Edit Document Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditDoc(null);
          }}
          title="Edit Document"
          size="lg"
        >
          {editDoc && (
            <>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <File className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span className="font-medium">{editDoc.fileName}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {editDoc.employee.firstName} {editDoc.employee.lastName} -{' '}
                    {formatDocType(editDoc.documentType)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {DOCUMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {statusLabels[s] || s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={editExpiryDate}
                    onChange={(e) => setEditExpiryDate(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <ModalFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditDoc(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleEdit} disabled={editing}>
                  {editing ? 'Saving...' : 'Save Changes'}
                </Button>
              </ModalFooter>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}
