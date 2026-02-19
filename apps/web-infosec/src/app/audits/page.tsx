'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Badge,
  Button,
  Modal,
  ModalFooter } from '@ims/ui';
import { ClipboardCheck, Plus, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/lib/api';

interface AuditFinding {
  id: string;
  title: string;
  severity: string;
  status: string;
  description: string;
}

interface Audit {
  id: string;
  referenceNumber: string;
  title: string;
  auditDate: string;
  leadAuditor: string;
  status: string;
  findingsCount: number;
  findings?: AuditFinding[];
}

const statusColors: Record<string, string> = {
  PLANNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-700' };

const auditStatuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  const [auditDetails, setAuditDetails] = useState<Record<string, Audit>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    auditDate: '',
    leadAuditor: '' });

  useEffect(() => {
    loadAudits();
  }, []);

  async function loadAudits() {
    try {
      setError(null);
      const res = await api.get('/audits');
      setAudits(res.data.data || []);
    } catch (err) {
      console.error('Error loading audits:', err);
      setError('Failed to load audits.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleAuditDetail(auditId: string) {
    if (expandedAudit === auditId) {
      setExpandedAudit(null);
      return;
    }
    setExpandedAudit(auditId);
    if (!auditDetails[auditId]) {
      try {
        const res = await api.get(`/audits/${auditId}`);
        setAuditDetails((prev) => ({ ...prev, [auditId]: res.data.data }));
      } catch (err) {
        console.error('Error loading audit details:', err);
      }
    }
  }

  function openCreateModal() {
    setForm({ title: '', auditDate: '', leadAuditor: '' });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.post('/audits', form);
      setModalOpen(false);
      loadAudits();
    } catch (err) {
      console.error('Error saving audit:', err);
    } finally {
      setSaving(false);
    }
  }

  const filtered = audits.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (
      searchTerm &&
      !a.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !a.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">ISMS Audits</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Internal and external audit management
            </p>
          </div>
          <Button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" /> Create Audit
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  aria-label="Search audits..."
                  placeholder="Search audits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Statuses</option>
                {auditStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Ref
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Audit Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Lead Auditor
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Findings
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((audit) => (
                      <>
                        <tr
                          key={audit.id}
                          className="border-b hover:bg-gray-50 dark:bg-gray-800 cursor-pointer"
                          onClick={() => toggleAuditDetail(audit.id)}
                        >
                          <td className="py-3 px-4 font-mono text-xs text-gray-600">
                            {audit.referenceNumber}
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                            {audit.title}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(audit.auditDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{audit.leadAuditor}</td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                statusColors[audit.status] ||
                                'bg-gray-100 dark:bg-gray-800 text-gray-700'
                              }
                            >
                              {audit.status.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{audit.findingsCount}</td>
                          <td className="py-3 px-4">
                            {expandedAudit === audit.id ? (
                              <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            )}
                          </td>
                        </tr>
                        {expandedAudit === audit.id && (
                          <tr key={`${audit.id}-detail`}>
                            <td colSpan={7} className="px-4 py-4 bg-gray-50 dark:bg-gray-800">
                              {auditDetails[audit.id]?.findings &&
                              auditDetails[audit.id].findings!.length > 0 ? (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Findings
                                  </p>
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                                          Title
                                        </th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                                          Severity
                                        </th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                                          Status
                                        </th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                                          Description
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {auditDetails[audit.id].findings!.map((f) => (
                                        <tr key={f.id} className="border-b">
                                          <td className="py-2 px-3 text-gray-900 dark:text-gray-100">
                                            {f.title}
                                          </td>
                                          <td className="py-2 px-3">
                                            <Badge
                                              className={
                                                f.severity === 'MAJOR'
                                                  ? 'bg-red-100 text-red-700'
                                                  : f.severity === 'MINOR'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-blue-100 text-blue-700'
                                              }
                                            >
                                              {f.severity}
                                            </Badge>
                                          </td>
                                          <td className="py-2 px-3 text-gray-600">{f.status}</td>
                                          <td className="py-2 px-3 text-gray-600 max-w-xs truncate">
                                            {f.description}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  No findings recorded for this audit.
                                </p>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audits found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Audit" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g., Annual ISMS Internal Audit 2026"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Audit Date
              </label>
              <input
                type="date"
                value={form.auditDate}
                onChange={(e) => setForm({ ...form, auditDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lead Auditor
              </label>
              <input
                type="text"
                value={form.leadAuditor}
                onChange={(e) => setForm({ ...form, leadAuditor: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? 'Saving...' : 'Create Audit'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
