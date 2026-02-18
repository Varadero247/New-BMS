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
import { Plus, AlertOctagon, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const TYPES = [
  'INJURY',
  'NEAR_MISS',
  'ENVIRONMENTAL',
  'PROPERTY_DAMAGE',
  'SECURITY',
  'QUALITY',
  'VEHICLE',
  'OTHER',
] as const;
const SEVERITIES = ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC'] as const;
const STATUSES = [
  'REPORTED',
  'ACKNOWLEDGED',
  'INVESTIGATING',
  'ROOT_CAUSE_ANALYSIS',
  'CORRECTIVE_ACTION',
  'CLOSED',
  'REOPENED',
] as const;
const RIDDOR_OPTIONS = ['YES', 'NO', 'PENDING_ASSESSMENT'] as const;

interface Incident {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  status: string;
  dateOccurred: string;
  timeOccurred: string;
  location: string;
  area: string;
  department: string;
  reportedBy: string;
  reportedByName: string;
  injuredPerson: string;
  injuredPersonRole: string;
  injuryType: string;
  bodyPart: string;
  treatmentGiven: string;
  hospitalized: boolean;
  daysLost: number;
  immediateActions: string;
  rootCause: string;
  contributingFactors: string;
  correctiveActions: string;
  preventiveActions: string;
  riddorReportable: string;
  riddorRef: string;
  investigator: string;
  investigatorName: string;
  notes: string;
  createdAt: string;
}

interface IncidentForm {
  title: string;
  description: string;
  type: string;
  severity: string;
  status: string;
  dateOccurred: string;
  timeOccurred: string;
  location: string;
  area: string;
  department: string;
  reportedByName: string;
  injuredPerson: string;
  injuredPersonRole: string;
  injuryType: string;
  bodyPart: string;
  treatmentGiven: string;
  hospitalized: boolean;
  daysLost: number;
  immediateActions: string;
  riddorReportable: string;
  notes: string;
}

const emptyForm: IncidentForm = {
  title: '',
  description: '',
  type: 'INJURY',
  severity: 'MODERATE',
  status: 'REPORTED',
  dateOccurred: '',
  timeOccurred: '',
  location: '',
  area: '',
  department: '',
  reportedByName: '',
  injuredPerson: '',
  injuredPersonRole: '',
  injuryType: '',
  bodyPart: '',
  treatmentGiven: '',
  hospitalized: false,
  daysLost: 0,
  immediateActions: '',
  riddorReportable: 'PENDING_ASSESSMENT',
  notes: '',
};

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'CATASTROPHIC':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'CRITICAL':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'MAJOR':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'MODERATE':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    default:
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  }
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'CLOSED':
      return 'secondary';
    case 'INVESTIGATING':
    case 'ROOT_CAUSE_ANALYSIS':
      return 'default';
    case 'CORRECTIVE_ACTION':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function IncidentsClient() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<IncidentForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadIncidents = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/incidents', { params });
      setIncidents(response.data.data || []);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  function openCreate() {
    setForm({ ...emptyForm, dateOccurred: new Date().toISOString().split('T')[0] });
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(incident: Incident) {
    setForm({
      title: incident.title || '',
      description: incident.description || '',
      type: incident.type || 'INJURY',
      severity: incident.severity || 'MODERATE',
      status: incident.status || 'REPORTED',
      dateOccurred: incident.dateOccurred ? incident.dateOccurred.split('T')[0] : '',
      timeOccurred: incident.timeOccurred || '',
      location: incident.location || '',
      area: incident.area || '',
      department: incident.department || '',
      reportedByName: incident.reportedByName || '',
      injuredPerson: incident.injuredPerson || '',
      injuredPersonRole: incident.injuredPersonRole || '',
      injuryType: incident.injuryType || '',
      bodyPart: incident.bodyPart || '',
      treatmentGiven: incident.treatmentGiven || '',
      hospitalized: incident.hospitalized || false,
      daysLost: incident.daysLost || 0,
      immediateActions: incident.immediateActions || '',
      riddorReportable: incident.riddorReportable || 'PENDING_ASSESSMENT',
      notes: incident.notes || '',
    });
    setEditId(incident.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title || !form.dateOccurred) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        dateOccurred: new Date(form.dateOccurred).toISOString(),
        daysLost: form.daysLost || 0,
      };
      if (editId) {
        await api.put(`/incidents/${editId}`, payload);
      } else {
        await api.post('/incidents', payload);
      }
      setModalOpen(false);
      loadIncidents();
    } catch (err) {
      console.error('Failed to save incident:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this incident?')) return;
    try {
      await api.delete(`/incidents/${id}`);
      loadIncidents();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Incident Register
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Report, track and manage all incidents
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Report Incident
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{incidents.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Incidents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">
                {
                  incidents.filter(
                    (i) => i.severity === 'CRITICAL' || i.severity === 'CATASTROPHIC'
                  ).length
                }
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Critical/Catastrophic</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {
                  incidents.filter(
                    (i) => i.status === 'INVESTIGATING' || i.status === 'ROOT_CAUSE_ANALYSIS'
                  ).length
                }
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Under Investigation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {incidents.filter((i) => i.status === 'CLOSED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Closed</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search incidents"
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
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
            ) : incidents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>RIDDOR</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell className="font-mono text-xs">
                          {incident.referenceNumber}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {incident.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {(incident.type || 'OTHER').replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}
                          >
                            {incident.severity || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {incident.dateOccurred
                            ? new Date(incident.dateOccurred).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">{incident.location || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(incident.status)}>
                            {(incident.status || 'REPORTED').replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              incident.riddorReportable === 'YES' ? 'destructive' : 'outline'
                            }
                          >
                            {(incident.riddorReportable || 'PENDING').replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(incident)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(incident.id)}
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
                <AlertOctagon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No incidents found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Report First Incident
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editId ? 'Edit Incident' : 'Report Incident'}
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Incident title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select
                    value={form.severity}
                    onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value }))}
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe the incident..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date Occurred *</Label>
                  <Input
                    type="date"
                    value={form.dateOccurred}
                    onChange={(e) => setForm((p) => ({ ...p, dateOccurred: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Time Occurred</Label>
                  <Input
                    type="time"
                    value={form.timeOccurred}
                    onChange={(e) => setForm((p) => ({ ...p, timeOccurred: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Where did it occur?"
                  />
                </div>
                <div>
                  <Label>Area / Zone</Label>
                  <Input
                    value={form.area}
                    onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
                    placeholder="Specific area"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Input
                    value={form.department}
                    onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                    placeholder="Department"
                  />
                </div>
                <div>
                  <Label>Reported By</Label>
                  <Input
                    value={form.reportedByName}
                    onChange={(e) => setForm((p) => ({ ...p, reportedByName: e.target.value }))}
                    placeholder="Reporter name"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Injury Details
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Injured Person</Label>
                    <Input
                      value={form.injuredPerson}
                      onChange={(e) => setForm((p) => ({ ...p, injuredPerson: e.target.value }))}
                      placeholder="Name of injured person"
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input
                      value={form.injuredPersonRole}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, injuredPersonRole: e.target.value }))
                      }
                      placeholder="Employee, Contractor, etc."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Injury Type</Label>
                    <Input
                      value={form.injuryType}
                      onChange={(e) => setForm((p) => ({ ...p, injuryType: e.target.value }))}
                      placeholder="Laceration, fracture, etc."
                    />
                  </div>
                  <div>
                    <Label>Body Part</Label>
                    <Input
                      value={form.bodyPart}
                      onChange={(e) => setForm((p) => ({ ...p, bodyPart: e.target.value }))}
                      placeholder="Hand, back, etc."
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Treatment Given</Label>
                  <Textarea
                    value={form.treatmentGiven}
                    onChange={(e) => setForm((p) => ({ ...p, treatmentGiven: e.target.value }))}
                    rows={2}
                    placeholder="First aid, hospital treatment, etc."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hospitalized"
                      checked={form.hospitalized}
                      onChange={(e) => setForm((p) => ({ ...p, hospitalized: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="hospitalized">Hospitalized</Label>
                  </div>
                  <div>
                    <Label>Days Lost</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.daysLost}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, daysLost: parseInt(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Actions & Classification
                </p>
                <div>
                  <Label>Immediate Actions Taken</Label>
                  <Textarea
                    value={form.immediateActions}
                    onChange={(e) => setForm((p) => ({ ...p, immediateActions: e.target.value }))}
                    rows={2}
                    placeholder="What immediate actions were taken?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>RIDDOR Reportable</Label>
                    <Select
                      value={form.riddorReportable}
                      onChange={(e) => setForm((p) => ({ ...p, riddorReportable: e.target.value }))}
                    >
                      {RIDDOR_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !form.title || !form.dateOccurred}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : editId ? (
                  'Update Incident'
                ) : (
                  'Report Incident'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
