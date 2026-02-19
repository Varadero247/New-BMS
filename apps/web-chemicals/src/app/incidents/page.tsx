'use client';
import axios from 'axios';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, Modal } from '@ims/ui';
import { AlertTriangle, Search, Plus, Shield } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface ChemicalIncident {
  id: string;
  title: string;
  type: string;
  severity: string;
  chemicalId: string;
  chemicalName: string;
  dateOccurred: string;
  location: string;
  description: string;
  riddor: boolean;
  status: string;
  reportedBy: string;
  immediateActions: string;
  rootCause: string;
}

const INCIDENT_TYPES = [
  'SPILL',
  'LEAK',
  'EXPOSURE',
  'FIRE',
  'EXPLOSION',
  'REACTION',
  'RELEASE',
  'OTHER',
];
const SEVERITIES = ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC'];

const severityBadge: Record<string, string> = {
  MINOR: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  MODERATE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  MAJOR: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  CATASTROPHIC: 'bg-red-200 text-red-900 dark:bg-red-800/40 dark:text-red-200',
};

export default function IncidentsPage() {
  const searchParams = useSearchParams();
  const [incidents, setIncidents] = useState<ChemicalIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(searchParams.get('action') === 'new');
  const [saving, setSaving] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<ChemicalIncident | null>(null);

  const [chemicals, setChemicals] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    title: '',
    type: 'SPILL',
    severity: 'MODERATE',
    chemicalId: '',
    dateOccurred: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
    riddor: false,
    reportedBy: '',
    immediateActions: '',
  });

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await api.get('/incidents', { params });
      setIncidents(res.data.data || []);
    } catch (e) {
      setError(axios.isAxiosError(e) && e.response?.status === 401 ? 'Session expired.' : 'Failed to load incidents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [search]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/register?fields=id,name');
        setChemicals(res.data.data || []);
      } catch {
        /* non-critical */
      }
    })();
  }, []);

  const handleCreate = async () => {
    try {
      setSaving(true);
      await api.post('/incidents', form);
      setModalOpen(false);
      setForm({
        title: '',
        type: 'SPILL',
        severity: 'MODERATE',
        chemicalId: '',
        dateOccurred: new Date().toISOString().split('T')[0],
        location: '',
        description: '',
        riddor: false,
        reportedBy: '',
        immediateActions: '',
      });
      fetchIncidents();
    } catch (e) {
      setError(axios.isAxiosError(e) && e.response?.data?.message || 'Failed to report incident.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && incidents.length === 0) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Chemical Incidents
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Report and track chemical safety incidents
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" /> Report Incident
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search incidents..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Title
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Type
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Chemical
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Severity
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Date
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        RIDDOR
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-12 text-gray-500 dark:text-gray-400"
                        >
                          No incidents recorded.
                        </td>
                      </tr>
                    ) : (
                      incidents.map((inc) => (
                        <tr
                          key={inc.id}
                          onClick={() => setSelectedIncident(inc)}
                          className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <AlertTriangle
                                className={`h-4 w-4 ${inc.severity === 'CRITICAL' || inc.severity === 'CATASTROPHIC' ? 'text-red-500' : inc.severity === 'MAJOR' ? 'text-orange-500' : 'text-gray-400'}`}
                              />
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {inc.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{inc.type}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {inc.chemicalName}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${severityBadge[inc.severity] || 'bg-gray-100 text-gray-800'}`}
                            >
                              {inc.severity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {new Date(inc.dateOccurred).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            {inc.riddor && (
                              <span className="flex items-center gap-1 text-xs font-bold text-red-700 dark:text-red-300">
                                <Shield className="h-3 w-3" /> RIDDOR
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                inc.status === 'CLOSED'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : inc.status === 'INVESTIGATING'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                              }`}
                            >
                              {inc.status || 'OPEN'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Modal
        isOpen={selectedIncident !== null}
        onClose={() => setSelectedIncident(null)}
        title="Incident Details"
        size="lg"
      >
        {selectedIncident && (
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedIncident.title}
              </h3>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${severityBadge[selectedIncident.severity] || ''}`}
              >
                {selectedIncident.severity}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Type</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedIncident.type}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Chemical</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedIncident.chemicalName}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Date</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(selectedIncident.dateOccurred).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Location</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedIncident.location || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Reported By</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedIncident.reportedBy || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">RIDDOR</p>
                <p
                  className={`font-medium ${selectedIncident.riddor ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}
                >
                  {selectedIncident.riddor ? 'Yes - Reportable' : 'No'}
                </p>
              </div>
            </div>
            {selectedIncident.description && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  {selectedIncident.description}
                </p>
              </div>
            )}
            {selectedIncident.immediateActions && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Immediate Actions</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  {selectedIncident.immediateActions}
                </p>
              </div>
            )}
            {selectedIncident.rootCause && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Root Cause</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  {selectedIncident.rootCause}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Report Chemical Incident"
        size="lg"
      >
        <div className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Incident Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              placeholder="Brief description of the incident"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type *
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {INCIDENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Severity *
              </label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={form.dateOccurred}
                onChange={(e) => setForm({ ...form, dateOccurred: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chemical *
              </label>
              <select
                value={form.chemicalId}
                onChange={(e) => setForm({ ...form, chemicalId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select chemical...</option>
                {chemicals.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                placeholder="Where it happened"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              placeholder="What happened..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Immediate Actions Taken
            </label>
            <textarea
              value={form.immediateActions}
              onChange={(e) => setForm({ ...form, immediateActions: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              placeholder="What was done immediately..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reported By
              </label>
              <input
                type="text"
                value={form.reportedBy}
                onChange={(e) => setForm({ ...form, reportedBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 pb-2">
                <input
                  type="checkbox"
                  checked={form.riddor}
                  onChange={(e) => setForm({ ...form, riddor: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                RIDDOR Reportable
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving || !form.title || !form.chemicalId || !form.description}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Report Incident'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
