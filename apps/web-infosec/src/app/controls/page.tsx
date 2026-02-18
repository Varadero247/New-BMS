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
import { Shield, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface Control {
  id: string;
  controlId: string;
  title: string;
  domain: string;
  applicability: boolean;
  implementationStatus: string;
  owner: string;
  notes: string;
  evidence: string;
}

const statusColors: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  PARTIAL: 'bg-yellow-100 text-yellow-700',
  IMPLEMENTED: 'bg-green-100 text-green-700',
  NOT_APPLICABLE: 'bg-blue-100 text-blue-700',
};

const domains = [
  'Organizational controls',
  'People controls',
  'Physical controls',
  'Technological controls',
];

const statuses = ['NOT_STARTED', 'PARTIAL', 'IMPLEMENTED', 'NOT_APPLICABLE'];

export default function ControlsPage() {
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [domainFilter, setDomainFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<Control | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    implementationStatus: 'NOT_STARTED',
    owner: '',
    notes: '',
    evidence: '',
  });

  useEffect(() => {
    loadControls();
  }, []);

  async function loadControls() {
    try {
      setError(null);
      const res = await api.get('/controls');
      setControls(res.data.data || []);
    } catch (err) {
      console.error('Error loading controls:', err);
      setError('Failed to load Annex A controls.');
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(control: Control) {
    setEditingControl(control);
    setEditForm({
      implementationStatus: control.implementationStatus,
      owner: control.owner || '',
      notes: control.notes || '',
      evidence: control.evidence || '',
    });
    setEditModalOpen(true);
  }

  async function handleSave() {
    if (!editingControl) return;
    setSaving(true);
    try {
      await api.put(`/controls/${editingControl.id}`, editForm);
      setEditModalOpen(false);
      loadControls();
    } catch (err) {
      console.error('Error saving control:', err);
    } finally {
      setSaving(false);
    }
  }

  const filtered = controls.filter((c) => {
    if (domainFilter && c.domain !== domainFilter) return false;
    if (statusFilter && c.implementationStatus !== statusFilter) return false;
    if (
      searchTerm &&
      !c.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.controlId.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Annex A Controls</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            ISO 27001:2022 Annex A control implementation tracking
          </p>
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
                  aria-label="Search controls..."
                  placeholder="Search controls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <select
                aria-label="Filter by domain"
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Domains</option>
                {domains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {statuses.map((s) => {
            const count = controls.filter((c) => c.implementationStatus === s).length;
            return (
              <Card key={s}>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.replace(/_/g, ' ')}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Control ID
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Domain
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Applicable
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Owner
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((control) => (
                      <tr
                        key={control.id}
                        className="border-b hover:bg-gray-50 dark:bg-gray-800 cursor-pointer"
                        onClick={() => openEditModal(control)}
                      >
                        <td className="py-3 px-4 font-mono text-xs text-gray-600">
                          {control.controlId}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                          {control.title}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{control.domain}</td>
                        <td className="py-3 px-4">
                          {control.applicability ? (
                            <Badge className="bg-green-100 text-green-700">Yes</Badge>
                          ) : (
                            <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                              No
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              statusColors[control.implementationStatus] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {control.implementationStatus.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{control.owner || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No controls found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Control: ${editingControl?.controlId || ''}`}
        size="lg"
      >
        {editingControl && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="font-medium text-gray-900 dark:text-gray-100">{editingControl.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {editingControl.domain}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Implementation Status
              </label>
              <select
                value={editForm.implementationStatus}
                onChange={(e) => setEditForm({ ...editForm, implementationStatus: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Owner
              </label>
              <input
                type="text"
                value={editForm.owner}
                onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Implementation Notes
              </label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Evidence
              </label>
              <textarea
                value={editForm.evidence}
                onChange={(e) => setEditForm({ ...editForm, evidence: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Reference to evidence documents..."
              />
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setEditModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? 'Saving...' : 'Update Control'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
