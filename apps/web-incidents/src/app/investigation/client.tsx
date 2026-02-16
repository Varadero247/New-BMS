'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Search, Loader2, UserCheck, FileText } from 'lucide-react';
import { api } from '@/lib/api';

interface Incident {
  id: string;
  referenceNumber: string;
  title: string;
  severity: string;
  status: string;
  dateOccurred: string;
  location: string;
  investigator: string;
  investigatorName: string;
  rootCause: string;
  contributingFactors: string;
  correctiveActions: string;
  preventiveActions: string;
  investigationReport: string;
  investigationDate: string;
}

export default function InvestigationClient() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [assignForm, setAssignForm] = useState({ investigator: '', investigatorName: '' });
  const [reportForm, setReportForm] = useState({
    rootCause: '',
    contributingFactors: '',
    correctiveActions: '',
    preventiveActions: '',
    report: '',
  });

  const loadIncidents = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      const response = await api.get('/incidents', { params });
      const all = response.data.data || [];
      setIncidents(all.filter((i: Incident) =>
        ['INVESTIGATING', 'ROOT_CAUSE_ANALYSIS', 'ACKNOWLEDGED', 'REPORTED'].includes(i.status)
      ));
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => { loadIncidents(); }, [loadIncidents]);

  function openAssign(incident: Incident) {
    setSelectedId(incident.id);
    setAssignForm({
      investigator: incident.investigator || '',
      investigatorName: incident.investigatorName || '',
    });
    setAssignModalOpen(true);
  }

  function openReport(incident: Incident) {
    setSelectedId(incident.id);
    setReportForm({
      rootCause: incident.rootCause || '',
      contributingFactors: incident.contributingFactors || '',
      correctiveActions: incident.correctiveActions || '',
      preventiveActions: incident.preventiveActions || '',
      report: incident.investigationReport || '',
    });
    setReportModalOpen(true);
  }

  async function handleAssign() {
    if (!selectedId || !assignForm.investigator) return;
    setSaving(true);
    try {
      await api.post(`/investigation/${selectedId}/assign`, assignForm);
      setAssignModalOpen(false);
      loadIncidents();
    } catch (err) {
      console.error('Failed to assign investigator:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleReport() {
    if (!selectedId) return;
    setSaving(true);
    try {
      await api.put(`/investigation/${selectedId}/report`, reportForm);
      setReportModalOpen(false);
      loadIncidents();
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setSaving(false);
    }
  }

  function getSeverityColor(severity: string): string {
    switch (severity) {
      case 'CATASTROPHIC': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'CRITICAL': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'MAJOR': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Investigation</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Assign investigators and submit root cause analysis reports</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{incidents.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Awaiting Action</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-amber-600">{incidents.filter(i => !i.investigator).length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Unassigned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{incidents.filter(i => i.status === 'INVESTIGATING').length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Under Investigation</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search investigations"
              placeholder="Search incidents for investigation..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />)}</div>
            ) : incidents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Investigator</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map(incident => (
                      <TableRow key={incident.id}>
                        <TableCell className="font-mono text-xs">{incident.referenceNumber}</TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">{incident.title}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                            {incident.severity || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{incident.dateOccurred ? new Date(incident.dateOccurred).toLocaleDateString() : '-'}</TableCell>
                        <TableCell><Badge variant="outline">{(incident.status || '').replace(/_/g, ' ')}</Badge></TableCell>
                        <TableCell className="text-sm">{incident.investigatorName || <span className="text-gray-400 italic">Unassigned</span>}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openAssign(incident)} className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />Assign
                            </Button>
                            {incident.status === 'INVESTIGATING' && (
                              <Button size="sm" variant="outline" onClick={() => openReport(incident)} className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />Report
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No incidents require investigation</p>
              </div>
            )}
          </CardContent>
        </Card>

        {assignModalOpen && (
          <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Investigator" size="md">
            <div className="space-y-4">
              <div>
                <Label>Investigator ID *</Label>
                <Input
                  value={assignForm.investigator}
                  onChange={e => setAssignForm(p => ({ ...p, investigator: e.target.value }))}
                  placeholder="User ID of investigator"
                />
              </div>
              <div>
                <Label>Investigator Name</Label>
                <Input
                  value={assignForm.investigatorName}
                  onChange={e => setAssignForm(p => ({ ...p, investigatorName: e.target.value }))}
                  placeholder="Full name of investigator"
                />
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAssign} disabled={saving || !assignForm.investigator}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Assigning...</> : 'Assign Investigator'}
              </Button>
            </ModalFooter>
          </Modal>
        )}

        {reportModalOpen && (
          <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Investigation Report" size="lg">
            <div className="space-y-4">
              <div>
                <Label>Root Cause</Label>
                <Textarea
                  value={reportForm.rootCause}
                  onChange={e => setReportForm(p => ({ ...p, rootCause: e.target.value }))}
                  rows={3}
                  placeholder="What was the root cause of this incident?"
                />
              </div>
              <div>
                <Label>Contributing Factors</Label>
                <Textarea
                  value={reportForm.contributingFactors}
                  onChange={e => setReportForm(p => ({ ...p, contributingFactors: e.target.value }))}
                  rows={3}
                  placeholder="What factors contributed to the incident?"
                />
              </div>
              <div>
                <Label>Corrective Actions</Label>
                <Textarea
                  value={reportForm.correctiveActions}
                  onChange={e => setReportForm(p => ({ ...p, correctiveActions: e.target.value }))}
                  rows={3}
                  placeholder="What corrective actions are required?"
                />
              </div>
              <div>
                <Label>Preventive Actions</Label>
                <Textarea
                  value={reportForm.preventiveActions}
                  onChange={e => setReportForm(p => ({ ...p, preventiveActions: e.target.value }))}
                  rows={3}
                  placeholder="What preventive actions will stop recurrence?"
                />
              </div>
              <div>
                <Label>Investigation Report Summary</Label>
                <Textarea
                  value={reportForm.report}
                  onChange={e => setReportForm(p => ({ ...p, report: e.target.value }))}
                  rows={4}
                  placeholder="Full investigation report summary..."
                />
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setReportModalOpen(false)}>Cancel</Button>
              <Button onClick={handleReport} disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting...</> : 'Submit Report'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
