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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ims/ui';
import { Wrench, Plus, Search, CheckCircle, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Equipment {
  id: string;
  referenceNumber: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  premisesId: string;
  premisesName: string;
  status: string;
  lastServiceDate: string | null;
  nextServiceDate: string | null;
  installDate: string | null;
  warrantyExpiry: string | null;
  serviceProvider: string;
  notes: string;
  createdAt: string;
}

interface EquipmentForm {
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  premisesId: string;
  status: string;
  lastServiceDate: string;
  nextServiceDate: string;
  serviceProvider: string;
  notes: string;
}

const EQUIPMENT_TYPES = [
  'FIRE_EXTINGUISHER',
  'FIRE_ALARM_PANEL',
  'SMOKE_DETECTOR',
  'HEAT_DETECTOR',
  'SPRINKLER_SYSTEM',
  'EMERGENCY_LIGHTING',
  'FIRE_DOOR',
  'EVAC_CHAIR',
  'FIRE_BLANKET',
  'FIRST_AID_KIT',
  'DEFIBRILLATOR',
  'SUPPRESSION_SYSTEM',
  'OTHER',
] as const;

const STATUS_OPTIONS = [
  'SERVICEABLE',
  'DUE_SERVICE',
  'OVERDUE_SERVICE',
  'OUT_OF_SERVICE',
  'CONDEMNED',
] as const;

const emptyForm: EquipmentForm = {
  name: '',
  type: 'FIRE_EXTINGUISHER',
  manufacturer: '',
  model: '',
  serialNumber: '',
  location: '',
  premisesId: '',
  status: 'SERVICEABLE',
  lastServiceDate: '',
  nextServiceDate: '',
  serviceProvider: '',
  notes: '',
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SERVICEABLE: 'bg-green-100 text-green-800',
    DUE_SERVICE: 'bg-amber-100 text-amber-800',
    OVERDUE_SERVICE: 'bg-red-100 text-red-800',
    OUT_OF_SERVICE: 'bg-gray-100 text-gray-600',
    CONDEMNED: 'bg-red-200 text-red-900 font-bold',
  };
  const icons: Record<string, React.ElementType> = {
    SERVICEABLE: CheckCircle,
    DUE_SERVICE: Clock,
    OVERDUE_SERVICE: AlertTriangle,
    OUT_OF_SERVICE: AlertTriangle,
    CONDEMNED: AlertTriangle,
  };
  const Icon = icons[status] || Clock;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.SERVICEABLE}`}
    >
      <Icon className="h-3 w-3" />
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EquipmentForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [premises, setPremises] = useState<Array<{ id: string; name: string }>>([]);

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;
      const r = await api.get('/equipment', { params });
      setEquipment(r.data.data || []);
    } catch {
      setError('Failed to load equipment.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    load();
    api
      .get('/premises')
      .then((r) => setPremises(r.data.data || []))
      .catch(() => {});
  }, [load]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(eq: Equipment) {
    setForm({
      name: eq.name || '',
      type: eq.type || 'FIRE_EXTINGUISHER',
      manufacturer: eq.manufacturer || '',
      model: eq.model || '',
      serialNumber: eq.serialNumber || '',
      location: eq.location || '',
      premisesId: eq.premisesId || '',
      status: eq.status || 'SERVICEABLE',
      lastServiceDate: eq.lastServiceDate ? eq.lastServiceDate.split('T')[0] : '',
      nextServiceDate: eq.nextServiceDate ? eq.nextServiceDate.split('T')[0] : '',
      serviceProvider: eq.serviceProvider || '',
      notes: eq.notes || '',
    });
    setEditId(eq.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.name || !form.premisesId) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        lastServiceDate: form.lastServiceDate ? new Date(form.lastServiceDate).toISOString() : null,
        nextServiceDate: form.nextServiceDate ? new Date(form.nextServiceDate).toISOString() : null,
      };
      if (editId) {
        await api.put(`/equipment/${editId}`, payload);
      } else {
        await api.post('/equipment', payload);
      }
      setModalOpen(false);
      load();
    } catch {
      setError('Failed to save equipment.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this equipment record?')) return;
    try {
      await api.delete(`/equipment/${id}`);
      load();
    } catch {
      setError('Failed to delete equipment.');
    }
  }

  const overdue = equipment.filter((e) => e.status === 'OVERDUE_SERVICE').length;
  const dueService = equipment.filter((e) => e.status === 'DUE_SERVICE').length;
  const outOfService = equipment.filter(
    (e) => e.status === 'OUT_OF_SERVICE' || e.status === 'CONDEMNED'
  ).length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Fire Safety Equipment
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Equipment register, servicing schedule and compliance tracking
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="flex items-center gap-2 text-white"
              style={{ backgroundColor: '#F04B5A' }}
            >
              <Plus className="h-4 w-4" />
              Add Equipment
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{equipment.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {equipment.filter((e) => e.status === 'SERVICEABLE').length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Serviceable</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-amber-600">{dueService}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Due Service</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold" style={{ color: '#F04B5A' }}>
                  {overdue + outOfService}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Action Required</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </Select>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="ALL">All Types</option>
              {EQUIPMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </Select>
          </div>

          {/* Equipment Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="animate-pulse space-y-4 p-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  ))}
                </div>
              ) : equipment.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ref</TableHead>
                        <TableHead>Name / Model</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Premises</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Last Service</TableHead>
                        <TableHead>Next Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipment.map((eq) => (
                        <TableRow key={eq.id}>
                          <TableCell className="font-mono text-xs">{eq.referenceNumber}</TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{eq.name}</p>
                            {eq.model && (
                              <p className="text-xs text-gray-500">
                                {eq.manufacturer} {eq.model}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{eq.type.replace(/_/g, ' ')}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{eq.premisesName}</TableCell>
                          <TableCell className="text-sm">{eq.location}</TableCell>
                          <TableCell className="text-sm">
                            {eq.lastServiceDate ? (
                              new Date(eq.lastServiceDate).toLocaleDateString()
                            ) : (
                              <span className="text-gray-400">Never</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {eq.nextServiceDate ? (
                              <span
                                className={
                                  new Date(eq.nextServiceDate) < new Date()
                                    ? 'text-red-600 font-medium'
                                    : ''
                                }
                              >
                                {new Date(eq.nextServiceDate).toLocaleDateString()}
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={eq.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openEdit(eq)}>
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(eq.id)}
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
                  <Wrench className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No equipment registered</p>
                  <Button variant="outline" className="mt-4" onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Equipment
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
          title={editId ? 'Edit Equipment' : 'Add Equipment'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Equipment Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Fire Extinguisher 01"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  {EQUIPMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Premises *</Label>
                <Select
                  value={form.premisesId}
                  onChange={(e) => setForm((f) => ({ ...f, premisesId: e.target.value }))}
                >
                  <option value="">Select premises...</option>
                  {premises.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Location / Floor</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. 3rd Floor East Corridor"
                />
              </div>
              <div>
                <Label>Manufacturer</Label>
                <Input
                  value={form.manufacturer}
                  onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))}
                  placeholder="Manufacturer name"
                />
              </div>
              <div>
                <Label>Model</Label>
                <Input
                  value={form.model}
                  onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                  placeholder="Model number"
                />
              </div>
              <div>
                <Label>Serial Number</Label>
                <Input
                  value={form.serialNumber}
                  onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
                  placeholder="Serial / Asset number"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Last Service Date</Label>
                <Input
                  type="date"
                  value={form.lastServiceDate}
                  onChange={(e) => setForm((f) => ({ ...f, lastServiceDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>Next Service Date</Label>
                <Input
                  type="date"
                  value={form.nextServiceDate}
                  onChange={(e) => setForm((f) => ({ ...f, nextServiceDate: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <Label>Service Provider</Label>
                <Input
                  value={form.serviceProvider}
                  onChange={(e) => setForm((f) => ({ ...f, serviceProvider: e.target.value }))}
                  placeholder="Servicing company name"
                />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !form.name || !form.premisesId}
              className="text-white"
              style={{ backgroundColor: '#F04B5A' }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : editId ? (
                'Update Equipment'
              ) : (
                'Add Equipment'
              )}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
