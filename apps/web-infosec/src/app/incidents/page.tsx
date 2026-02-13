'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter } from '@ims/ui';
import { AlertOctagon, Plus, Search, Shield } from 'lucide-react';
import { api } from '@/lib/api';

interface Incident {
  id: string;
  referenceNumber: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  reportedDate: string;
  isGdprBreach: boolean;
  gdprDeadline: string | null;
  description: string;
}

const severityColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const incidentTypes = ['DATA_BREACH', 'MALWARE', 'PHISHING', 'UNAUTHORIZED_ACCESS', 'DENIAL_OF_SERVICE', 'INSIDER_THREAT', 'PHYSICAL_SECURITY', 'OTHER'];
const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const incidentStatuses = ['REPORTED', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED'];

function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'DATA_BREACH',
    severity: 'MEDIUM',
    description: '',
    isGdprBreach: false,
  });

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    try {
      setError(null);
      const res = await api.get('/incidents');
      setIncidents(res.data.data || []);
    } catch (err) {
      console.error('Error loading incidents:', err);
      setError('Failed to load security incidents.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setForm({ title: '', type: 'DATA_BREACH', severity: 'MEDIUM', description: '', isGdprBreach: false });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.post('/incidents', form);
      setModalOpen(false);
      loadIncidents();
    } catch (err) {
      console.error('Error saving incident:', err);
    } finally {
      setSaving(false);
    }
  }

  const filtered = incidents.filter(i => {
    if (typeFilter && i.type !== typeFilter) return false;
    if (severityFilter && i.severity !== severityFilter) return false;
    if (statusFilter && i.status !== statusFilter) return false;
    if (searchTerm && !i.title.toLowerCase().includes(searchTerm.toLowerCase()) && !i.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false;
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
            <h1 className="text-3xl font-bold text-gray-900">Security Incidents</h1>
            <p className="text-gray-500 mt-1">Incident reporting and response management</p>
          </div>
          <Button onClick={openCreateModal} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4" /> Report Incident
          </Button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search incidents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">All Types</option>
                {incidentTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
              <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">All Severities</option>
                {severities.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">All Statuses</option>
                {incidentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
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
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Ref</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Severity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Reported</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">GDPR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((incident) => {
                      const daysLeft = getDaysUntilDeadline(incident.gdprDeadline);
                      return (
                        <tr key={incident.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-xs text-gray-600">{incident.referenceNumber}</td>
                          <td className="py-3 px-4 text-gray-900 font-medium">{incident.title}</td>
                          <td className="py-3 px-4 text-gray-600">{incident.type.replace(/_/g, ' ')}</td>
                          <td className="py-3 px-4">
                            <Badge className={severityColors[incident.severity] || 'bg-gray-100 text-gray-700'}>{incident.severity}</Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{incident.status}</td>
                          <td className="py-3 px-4 text-gray-600">{new Date(incident.reportedDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            {incident.isGdprBreach ? (
                              <div className="flex items-center gap-1">
                                <Shield className="h-4 w-4 text-red-500" />
                                {daysLeft !== null && (
                                  <span className={`text-xs font-medium ${daysLeft <= 3 ? 'text-red-600' : daysLeft <= 14 ? 'text-orange-600' : 'text-gray-600'}`}>
                                    {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <AlertOctagon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No incidents found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Report Security Incident" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                {incidentTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                {severities.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Describe the incident in detail..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="gdprBreach" checked={form.isGdprBreach} onChange={(e) => setForm({ ...form, isGdprBreach: e.target.checked })} className="rounded text-teal-600 focus:ring-teal-500" />
            <label htmlFor="gdprBreach" className="text-sm text-gray-700">This is a GDPR-reportable breach (72-hour notification deadline)</label>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? 'Saving...' : 'Report Incident'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
