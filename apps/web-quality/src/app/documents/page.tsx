'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input } from '@ims/ui';
import { FileText, Plus, Search, Filter, Eye, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Document {
  id: string;
  documentNumber: string;
  title: string;
  description?: string;
  documentType: string;
  status: string;
  category?: string;
  isoClause?: string;
  nextReviewDate?: string;
  createdAt: string;
  updatedAt: string;
  versions?: { versionNumber: string }[];
  _count?: { approvals: number; distributions: number };
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  EFFECTIVE: 'bg-green-100 text-green-700',
  OBSOLETE: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

const typeIcons: Record<string, string> = {
  POLICY: '📋',
  PROCEDURE: '📝',
  WORK_INSTRUCTION: '📖',
  FORM: '📄',
  RECORD: '📑',
  MANUAL: '📚',
  SPECIFICATION: '📐',
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    loadDocuments();
  }, [statusFilter, typeFilter]);

  async function loadDocuments() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('documentType', typeFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/documents?${params.toString()}`);
      setDocuments(res.data.data || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = () => {
    loadDocuments();
  };

  const stats = {
    total: documents.length,
    effective: documents.filter(d => d.status === 'EFFECTIVE').length,
    draft: documents.filter(d => d.status === 'DRAFT').length,
    pendingReview: documents.filter(d => d.status === 'REVIEW').length,
    dueForReview: documents.filter(d => {
      if (!d.nextReviewDate) return false;
      const reviewDate = new Date(d.nextReviewDate);
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.setDate(today.getDate() + 30));
      return reviewDate <= thirtyDaysFromNow;
    }).length,
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
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
            <h1 className="text-3xl font-bold text-gray-900">Document Control</h1>
            <p className="text-gray-500 mt-1">Manage controlled documents and versions</p>
          </div>
          <Link href="/documents/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Document
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Documents</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Effective</p>
                  <p className="text-2xl font-bold text-green-600">{stats.effective}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Draft</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
                </div>
                <FileText className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Due for Review</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.dueForReview}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="EFFECTIVE">Effective</option>
                <option value="OBSOLETE">Obsolete</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="POLICY">Policy</option>
                <option value="PROCEDURE">Procedure</option>
                <option value="WORK_INSTRUCTION">Work Instruction</option>
                <option value="FORM">Form</option>
                <option value="RECORD">Record</option>
                <option value="MANUAL">Manual</option>
              </select>
              <Button variant="outline" onClick={handleSearch}>
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Documents Library</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{typeIcons[doc.documentType] || '📄'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{doc.title}</span>
                          <Badge className={statusColors[doc.status] || 'bg-gray-100'}>
                            {doc.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span>{doc.documentNumber}</span>
                          <span>•</span>
                          <span>{doc.documentType.replace('_', ' ')}</span>
                          {doc.versions?.[0] && (
                            <>
                              <span>•</span>
                              <span>v{doc.versions[0].versionNumber}</span>
                            </>
                          )}
                          {doc.isoClause && (
                            <>
                              <span>•</span>
                              <span>ISO {doc.isoClause}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/documents/${doc.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No documents found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
