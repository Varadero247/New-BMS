'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { FileWarning, Loader2, Search, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Incident {
  id: string;
  referenceNumber: string;
  title: string;
  severity: string;
  status: string;
  dateOccurred: string;
  location: string;
  type: string;
  riddorReportable: string;
  riddorRef: string;
  injuredPerson: string;
  injuryType: string;
  hospitalized: boolean;
  daysLost: number;
}

export default function RiddorClient() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'reportable' | 'pending'>('reportable');

  const [assessModalOpen, setAssessModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [assessForm, setAssessForm] = useState({ reportable: true, riddorRef: '' });

  const loadData = useCallback(async () => {
    try {
      const [riddorRes, allRes] = await Promise.all([
        api.get('/riddor'),
        api.get('/incidents'),
      ]);
      setIncidents(riddorRes.data.data || []);
      setAllIncidents((allRes.data.data || []).filter((i: Incident) => i.riddorReportable === 'PENDING_ASSESSMENT'));
    } catch (err) {
      console.error('Failed to load RIDDOR data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const displayedIncidents = viewMode === 'reportable' ? incidents : allIncidents;
  const filtered = displayedIncidents.filter(i =>
    !searchTerm || i.title.toLowerCase().includes(searchTerm.toLowerCase()) || i.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function openAssess(incident: Incident) {
    setSelectedId(incident.id);
    setAssessForm({
      reportable: incident.riddorReportable === 'YES',
      riddorRef: incident.riddorRef || '',
    });
    setAssessModalOpen(true);
  }

  async function handleAssess() {
    if (!selectedId) return;
    setSaving(true);
    try {
      await api.post(`/riddor/${selectedId}/assess`, assessForm);
      setAssessModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to assess RIDDOR:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">RIDDOR Reports</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Reporting of Injuries, Diseases and Dangerous Occurrences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">{incidents.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">RIDDOR Reportable</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-amber-600">{allIncidents.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Assessment</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{incidents.filter(i => i.riddorRef).length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">With RIDDOR Ref</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search RIDDOR reports"
              placeholder="Search RIDDOR reports..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            aria-label="Filter by view"
            value={viewMode}
            onChange={e => setViewMode(e.target.value as 'reportable' | 'pending')}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="reportable">RIDDOR Reportable</option>
            <option value="pending">Pending Assessment</option>
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />)}</div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Injured Person</TableHead>
                      <TableHead>Hospitalized</TableHead>
                      <TableHead>Days Lost</TableHead>
                      <TableHead>RIDDOR Ref</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(incident => (
                      <TableRow key={incident.id}>
                        <TableCell className="font-mono text-xs">{incident.referenceNumber}</TableCell>
                        <TableCell className="font-medium max-w-[180px] truncate">{incident.title}</TableCell>
                        <TableCell><Badge variant="outline">{(incident.type || 'OTHER').replace(/_/g, ' ')}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={incident.severity === 'CRITICAL' || incident.severity === 'CATASTROPHIC' ? 'destructive' : 'outline'}>
                            {incident.severity || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{incident.dateOccurred ? new Date(incident.dateOccurred).toLocaleDateString() : '-'}</TableCell>
                        <TableCell className="text-sm">{incident.injuredPerson || '-'}</TableCell>
                        <TableCell>
                          {incident.hospitalized ? (
                            <CheckCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{incident.daysLost ?? 0}</TableCell>
                        <TableCell className="font-mono text-xs">{incident.riddorRef || <span className="text-gray-400">-</span>}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => openAssess(incident)}>
                            Assess
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileWarning className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {viewMode === 'reportable' ? 'No RIDDOR reportable incidents' : 'No incidents pending assessment'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {assessModalOpen && (
          <Modal isOpen={assessModalOpen} onClose={() => setAssessModalOpen(false)} title="RIDDOR Assessment" size="md">
            <div className="space-y-4">
              <div>
                <Label>Is this incident RIDDOR reportable?</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reportable"
                      checked={assessForm.reportable === true}
                      onChange={() => setAssessForm(p => ({ ...p, reportable: true }))}
                      className="h-4 w-4 text-red-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Yes - Reportable</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reportable"
                      checked={assessForm.reportable === false}
                      onChange={() => setAssessForm(p => ({ ...p, reportable: false }))}
                      className="h-4 w-4 text-red-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">No - Not Reportable</span>
                  </label>
                </div>
              </div>
              {assessForm.reportable && (
                <div>
                  <Label>RIDDOR Reference Number</Label>
                  <Input
                    value={assessForm.riddorRef}
                    onChange={e => setAssessForm(p => ({ ...p, riddorRef: e.target.value }))}
                    placeholder="e.g. RIDDOR-2026-00001"
                  />
                </div>
              )}
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  RIDDOR requires employers to report certain workplace incidents, including deaths, major injuries,
                  over-7-day incapacitation, and dangerous occurrences to the Health and Safety Executive (HSE).
                </p>
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setAssessModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAssess} disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : 'Save Assessment'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
