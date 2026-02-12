'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, ModalFooter, Label, Select, Textarea } from '@ims/ui';
import { Search, RefreshCw, AlertTriangle, CheckCircle, AlertCircle, MinusCircle, FileText, Edit2 } from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CsrEntry {
  id: string;
  oem: string;
  iatfClause: string;
  requirement: string;
  complianceStatus: string;
  gapNotes?: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COMPLIANCE_STATUSES = ['COMPLIANT', 'PARTIAL', 'NON_COMPLIANT'] as const;

const statusColors: Record<string, string> = {
  COMPLIANT: 'bg-green-100 text-green-700',
  PARTIAL: 'bg-yellow-100 text-yellow-700',
  NON_COMPLIANT: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, React.ReactNode> = {
  COMPLIANT: <CheckCircle className="h-4 w-4 text-green-500" />,
  PARTIAL: <MinusCircle className="h-4 w-4 text-yellow-500" />,
  NON_COMPLIANT: <AlertCircle className="h-4 w-4 text-red-500" />,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CsrClient() {
  // Data state
  const [csrs, setCsrs] = useState<CsrEntry[]>([]);
  const [oems, setOems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [oemFilter, setOemFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCsr, setSelectedCsr] = useState<CsrEntry | null>(null);
  const [editForm, setEditForm] = useState({ complianceStatus: '', gapNotes: '' });
  const [submitting, setSubmitting] = useState(false);

  // -------------------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------------------

  const loadOems = useCallback(async () => {
    try {
      const response = await api.get('/csr/oems');
      setOems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load OEMs:', err);
    }
  }, []);

  const loadCsrs = useCallback(async () => {
    try {
      setError(null);
      if (oemFilter !== 'all') {
        const response = await api.get(`/csr/oems/${encodeURIComponent(oemFilter)}`);
        setCsrs(response.data.data || []);
      } else if (statusFilter === 'NON_COMPLIANT') {
        const response = await api.get('/csr/gaps');
        setCsrs(response.data.data || []);
      } else {
        // Load all OEMs and merge results
        const allCsrs: CsrEntry[] = [];
        for (const oem of oems) {
          try {
            const response = await api.get(`/csr/oems/${encodeURIComponent(oem)}`);
            const data = response.data.data || [];
            allCsrs.push(...data);
          } catch {
            // skip failed OEM
          }
        }
        setCsrs(allCsrs);
      }
    } catch (err) {
      console.error('Failed to load CSRs:', err);
      setError('Failed to load CSR data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [oemFilter, statusFilter, oems]);

  useEffect(() => {
    loadOems();
  }, [loadOems]);

  useEffect(() => {
    if (oems.length > 0 || oemFilter !== 'all') {
      loadCsrs();
    }
  }, [loadCsrs, oems, oemFilter]);

  // -------------------------------------------------------------------------
  // Edit CSR
  // -------------------------------------------------------------------------

  function openEditModal(csr: CsrEntry) {
    setSelectedCsr(csr);
    setEditForm({
      complianceStatus: csr.complianceStatus,
      gapNotes: csr.gapNotes || '',
    });
    setShowEditModal(true);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCsr) return;
    setSubmitting(true);
    try {
      await api.put(`/csr/${selectedCsr.id}/status`, editForm);
      setShowEditModal(false);
      setSelectedCsr(null);
      loadCsrs();
    } catch (err) {
      console.error('Failed to update CSR status:', err);
    } finally {
      setSubmitting(false);
    }
  }

  // -------------------------------------------------------------------------
  // Filtering & Stats
  // -------------------------------------------------------------------------

  const filtered = useMemo(() => {
    return csrs
      .filter(c => statusFilter === 'all' || c.complianceStatus === statusFilter)
      .filter(c =>
        !searchQuery ||
        c.oem?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.iatfClause?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.requirement?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.gapNotes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [csrs, statusFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: csrs.length,
    compliant: csrs.filter(c => c.complianceStatus === 'COMPLIANT').length,
    partial: csrs.filter(c => c.complianceStatus === 'PARTIAL').length,
    nonCompliant: csrs.filter(c => c.complianceStatus === 'NON_COMPLIANT').length,
  }), [csrs]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CSR Register</h1>
            <p className="text-gray-500 mt-1">Customer-Specific Requirements Compliance Tracker</p>
          </div>
          <Button variant="outline" onClick={() => { setLoading(true); loadCsrs(); }} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total CSRs</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Compliant</p>
                  <p className="text-3xl font-bold text-green-600">{stats.compliant}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Partial</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.partial}</p>
                </div>
                <MinusCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Non-Compliant</p>
                  <p className="text-3xl font-bold text-red-600">{stats.nonCompliant}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setLoading(true); loadCsrs(); }}>Retry</Button>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs text-gray-500 mb-1 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by OEM, clause, requirement, gap notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="min-w-[160px]">
                <Label className="text-xs text-gray-500 mb-1 block">OEM</Label>
                <Select value={oemFilter} onChange={(e) => setOemFilter(e.target.value)}>
                  <option value="all">All OEMs</option>
                  {oems.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[160px]">
                <Label className="text-xs text-gray-500 mb-1 block">Compliance Status</Label>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  {COMPLIANCE_STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CSR Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                Customer-Specific Requirements ({filtered.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-medium text-gray-600">OEM</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">IATF Clause</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Requirement</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Gap Notes</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((csr) => (
                      <tr key={csr.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">{csr.oem}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-gray-600">{csr.iatfClause}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700 max-w-[300px] block truncate" title={csr.requirement}>
                            {csr.requirement}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={`inline-flex items-center gap-1 ${statusColors[csr.complianceStatus] || 'bg-gray-100 text-gray-700'}`}>
                            {statusIcons[csr.complianceStatus]}
                            {csr.complianceStatus?.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-500 max-w-[200px] block truncate" title={csr.gapNotes || ''}>
                            {csr.gapNotes || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => openEditModal(csr)}
                            className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors rounded hover:bg-orange-50"
                            title="Update compliance status"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No CSRs found</h3>
                <p className="text-sm text-gray-400 mb-6">
                  {searchQuery || statusFilter !== 'all' || oemFilter !== 'all'
                    ? 'Try adjusting your filters or search query.'
                    : 'Select an OEM to view their customer-specific requirements.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================================================================= */}
      {/* EDIT COMPLIANCE STATUS MODAL                                      */}
      {/* ================================================================= */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedCsr(null); }}
        title="Update Compliance Status"
        size="lg"
      >
        {selectedCsr && (
          <form onSubmit={handleEditSubmit}>
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
              {/* Read-only info */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">OEM</p>
                    <p className="text-sm font-medium">{selectedCsr.oem}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">IATF Clause</p>
                    <p className="text-sm font-mono">{selectedCsr.iatfClause}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Requirement</p>
                  <p className="text-sm text-gray-700 mt-1">{selectedCsr.requirement}</p>
                </div>
              </div>

              {/* Editable fields */}
              <div>
                <Label htmlFor="csr-status">Compliance Status *</Label>
                <Select
                  id="csr-status"
                  value={editForm.complianceStatus}
                  onChange={e => setEditForm({ ...editForm, complianceStatus: e.target.value })}
                >
                  {COMPLIANCE_STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="csr-gapNotes">Gap Notes</Label>
                <Textarea
                  id="csr-gapNotes"
                  value={editForm.gapNotes}
                  onChange={e => setEditForm({ ...editForm, gapNotes: e.target.value })}
                  rows={4}
                  placeholder="Describe any gaps, action items, or notes..."
                />
              </div>
            </div>

            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setSelectedCsr(null); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-orange-600 hover:bg-orange-700">
                {submitting ? 'Saving...' : 'Update Status'}
              </Button>
            </ModalFooter>
          </form>
        )}
      </Modal>
    </div>
  );
}
