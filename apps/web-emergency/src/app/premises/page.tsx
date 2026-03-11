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
import { Plus, Building2, Search, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';
import Link from 'next/link';

const PREMISES_TYPES = [
  'OFFICE',
  'WAREHOUSE',
  'FACTORY',
  'RETAIL',
  'HOSPITALITY',
  'HEALTHCARE',
  'EDUCATIONAL',
  'RESIDENTIAL',
  'MIXED_USE',
  'OTHER',
] as const;

const _FRA_STATUSES = ['CURRENT', 'ACTION_REQUIRED', 'OVERDUE', 'NOT_COMPLETED'] as const;

interface Premises {
  id: string;
  referenceNumber: string;
  name: string;
  type: string;
  address: string;
  city: string;
  postcode: string;
  rpName: string;
  rpEmail: string;
  rpPhone: string;
  occupants: number;
  fraStatus: string;
  fraLastDate: string | null;
  fraNextDue: string | null;
  lastDrillDate: string | null;
  activeIncidents: number;
  createdAt: string;
}

interface PremisesForm {
  name: string;
  type: string;
  address: string;
  city: string;
  postcode: string;
  rpName: string;
  rpEmail: string;
  rpPhone: string;
  occupants: number;
  description: string;
}

const emptyForm: PremisesForm = {
  name: '',
  type: 'OFFICE',
  address: '',
  city: '',
  postcode: '',
  rpName: '',
  rpEmail: '',
  rpPhone: '',
  occupants: 0,
  description: '',
};

function getFraStatusBadge(status: string) {
  switch (status) {
    case 'CURRENT':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle className="h-3 w-3" />
          Current
        </span>
      );
    case 'ACTION_REQUIRED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          <AlertTriangle className="h-3 w-3" />
          Action Required
        </span>
      );
    case 'OVERDUE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <AlertTriangle className="h-3 w-3" />
          Overdue
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
          <Clock className="h-3 w-3" />
          Not Completed
        </span>
      );
  }
}

export default function PremisesPage() {
  const [premises, setPremises] = useState<Premises[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PremisesForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [error, setError] = useState('');

  const loadPremises = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (typeFilter !== 'all') params.type = typeFilter;
      const r = await api.get('/premises', { params });
      const raw: Record<string, unknown>[] = Array.isArray(r.data.data) ? r.data.data : [];
      setPremises(
        raw.map((p) => ({
          id: String(p.id ?? ''),
          referenceNumber: String(p.referenceNumber ?? p.id ?? '').slice(0, 12).toUpperCase(),
          name: String(p.name ?? ''),
          type: String(p.buildingType ?? p.type ?? 'OTHER'),
          address: String(p.address ?? ''),
          city: String(p.city ?? ''),
          postcode: String(p.postcode ?? ''),
          rpName: String(p.responsiblePersonName ?? p.rpName ?? ''),
          rpEmail: String(p.responsiblePersonEmail ?? p.rpEmail ?? ''),
          rpPhone: String(p.responsiblePersonPhone ?? p.rpPhone ?? ''),
          occupants: Number(p.normalOccupancy ?? p.maxOccupancy ?? p.occupants ?? 0),
          fraStatus: String(p.fraStatus ?? 'NOT_COMPLETED'),
          fraLastDate: (p.fraLastDate as string | null) ?? null,
          fraNextDue: (p.fraNextDue as string | null) ?? null,
          lastDrillDate: (p.lastDrillDate as string | null) ?? null,
          activeIncidents: Number((p._count as Record<string, unknown> | undefined)?.activeIncidents ?? p.activeIncidents ?? 0),
          createdAt: String(p.createdAt ?? ''),
        }))
      );
    } catch {
      setError('Failed to load premises.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter]);

  useEffect(() => {
    loadPremises();
  }, [loadPremises]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(p: Premises) {
    setForm({
      name: p.name || '',
      type: p.type || 'OFFICE',
      address: p.address || '',
      city: p.city || '',
      postcode: p.postcode || '',
      rpName: p.rpName || '',
      rpEmail: p.rpEmail || '',
      rpPhone: p.rpPhone || '',
      occupants: p.occupants || 0,
      description: '',
    });
    setEditId(p.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.name || !form.rpName) return;
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/premises/${editId}`, form);
      } else {
        await api.post('/premises', form);
      }
      setModalOpen(false);
      loadPremises();
    } catch {
      setError('Failed to save premises.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this premises? This action cannot be undone.')) return;
    try {
      await api.delete(`/premises/${id}`);
      loadPremises();
    } catch {
      setError('Failed to delete premises.');
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Premises Register
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                All premises under fire safety management
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="flex items-center gap-2 text-white"
              style={{ backgroundColor: '#F04B5A' }}
            >
              <Plus className="h-4 w-4" />
              Add Premises
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{premises.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Premises</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {premises.filter((p) => p.fraStatus === 'CURRENT').length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">FRA Current</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-red-600">
                  {premises.filter((p) => p.fraStatus === 'OVERDUE').length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">FRA Overdue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-amber-600">
                  {premises.filter((p) => p.activeIncidents > 0).length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">With Active Incidents</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search premises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                style={{ '--tw-ring-color': '#F04B5A' } as React.CSSProperties}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Types</option>
              {PREMISES_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="animate-pulse space-y-4 p-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  ))}
                </div>
              ) : premises.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ref</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>RP Name</TableHead>
                        <TableHead>FRA Status</TableHead>
                        <TableHead>Last Drill</TableHead>
                        <TableHead>Active Incidents</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {premises.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-xs">{p.referenceNumber}</TableCell>
                          <TableCell className="font-medium">
                            <Link
                              href={`/premises/${p.id}`}
                              className="hover:underline"
                              style={{ color: '#F04B5A' }}
                            >
                              {p.name}
                            </Link>
                            <p className="text-xs text-gray-500">{p.city}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{p.type.replace(/_/g, ' ')}</Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{p.rpName}</p>
                          </TableCell>
                          <TableCell>{getFraStatusBadge(p.fraStatus)}</TableCell>
                          <TableCell className="text-sm">
                            {p.lastDrillDate ? (
                              new Date(p.lastDrillDate).toLocaleDateString()
                            ) : (
                              <span className="text-gray-400">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {p.activeIncidents > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                <AlertTriangle className="h-3 w-3" />
                                {p.activeIncidents}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link href={`/premises/${p.id}`}>
                                <Button size="sm" variant="outline">View</Button>
                              </Link>
                              <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(p.id)}
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
                  <Building2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No premises found</p>
                  <Button variant="outline" className="mt-4" onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Premises
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editId ? 'Edit Premises' : 'Add Premises'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Premises Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Head Office"
                />
              </div>
              <div>
                <Label>Premises Type</Label>
                <Select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                >
                  {PREMISES_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="Street address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  placeholder="City"
                />
              </div>
              <div>
                <Label>Postcode</Label>
                <Input
                  value={form.postcode}
                  onChange={(e) => setForm((p) => ({ ...p, postcode: e.target.value }))}
                  placeholder="Postcode"
                />
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Responsible Person
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={form.rpName}
                    onChange={(e) => setForm((p) => ({ ...p, rpName: e.target.value }))}
                    placeholder="Responsible Person name"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.rpEmail}
                    onChange={(e) => setForm((p) => ({ ...p, rpEmail: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={form.rpPhone}
                    onChange={(e) => setForm((p) => ({ ...p, rpPhone: e.target.value }))}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <Label>Number of Occupants</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.occupants}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, occupants: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>
            </div>
            <div>
              <Label>Description / Notes</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="Additional information about this premises..."
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !form.name || !form.rpName}
              className="text-white"
              style={{ backgroundColor: '#F04B5A' }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : editId ? (
                'Update Premises'
              ) : (
                'Add Premises'
              )}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
