'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, Users, UserCheck, UserX, Briefcase, Phone } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Technician {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  skills?: string;
  status?: string;
  activeJobs?: number;
  certifications?: string;
  region?: string;
  [key: string]: any;
}

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  ON_JOB: 'bg-blue-100 text-blue-700',
  EN_ROUTE: 'bg-yellow-100 text-yellow-700',
  OFF_DUTY: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  ON_LEAVE: 'bg-orange-100 text-orange-700',
};

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  specialization: '',
  certifications: '',
  region: '',
  status: 'AVAILABLE',
};

export default function TechniciansPage() {
  const [items, setItems] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Technician | null>(null);
  const [deleteItem, setDeleteItem] = useState<Technician | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const r = await api.get('/technicians');
      setItems(r.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((i) => {
    const q = searchTerm.toLowerCase();
    return (
      (!q || JSON.stringify(i).toLowerCase().includes(q)) &&
      (!statusFilter || i.status === statusFilter)
    );
  });

  const stats = {
    total: items.length,
    available: items.filter((i) => i.status === 'AVAILABLE').length,
    onJob: items.filter((i) => i.status === 'ON_JOB').length,
    offDuty: items.filter((i) => i.status === 'OFF_DUTY' || i.status === 'ON_LEAVE').length,
  };

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };
  const openEdit = (item: Technician) => {
    setEditItem(item);
    setForm({
      name: item.name || '',
      email: item.email || '',
      phone: item.phone || '',
      specialization: item.specialization || item.skills || '',
      certifications: item.certifications || '',
      region: item.region || '',
      status: item.status || 'AVAILABLE',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editItem) await api.put(`/technicians/${editItem.id}`, form);
      else await api.post('/technicians', form);
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(axios.isAxiosError(e) && e.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await api.delete(`/technicians/${deleteItem.id}`);
      setDeleteItem(null);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </main>
      </div>
    );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Technicians</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Manage field technicians and assignments
              </p>
            </div>
            <button
              onClick={openCreate}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 flex items-center gap-2 font-medium"
            >
              <Plus className="h-5 w-5" /> Add Technician
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Technicians',
                value: stats.total,
                icon: Users,
                bg: 'bg-sky-50',
                color: 'text-sky-600',
                border: 'border-sky-200',
              },
              {
                label: 'Available',
                value: stats.available,
                icon: UserCheck,
                bg: 'bg-green-50',
                color: 'text-green-600',
                border: 'border-green-200',
              },
              {
                label: 'On Job',
                value: stats.onJob,
                icon: Briefcase,
                bg: 'bg-blue-50',
                color: 'text-blue-600',
                border: 'border-blue-200',
              },
              {
                label: 'Off Duty / Leave',
                value: stats.offDuty,
                icon: UserX,
                bg: 'bg-gray-50 dark:bg-gray-800',
                color: 'text-gray-600',
                border: 'border-gray-200 dark:border-gray-700',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className={`border ${s.border}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                        <p className="text-2xl font-bold mt-1">{s.value}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${s.bg}`}>
                        <Icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                aria-label="Search technicians..."
                placeholder="Search technicians..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Statuses</option>
              {['AVAILABLE', 'ON_JOB', 'EN_ROUTE', 'OFF_DUTY', 'ON_LEAVE'].map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-sky-600" /> Technicians ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Specialization
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Region</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Phone</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Active Jobs
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-sky-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            {item.name || '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.specialization || item.skills || '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.region || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.phone ? (
                              <a
                                href={`tel:${item.phone}`}
                                className="flex items-center gap-1 text-sky-600 hover:underline"
                              >
                                <Phone className="h-3 w-3" />
                                {item.phone}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.activeJobs ?? '-'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[item.status || ''] || 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}
                            >
                              {item.status?.replace('_', ' ') || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEdit(item)}
                                className="text-sky-600 hover:text-sky-800 text-xs font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteItem(item)}
                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-medium">No technicians found</p>
                  <p className="text-sm mt-1">Add your first technician to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Technician' : 'Add Technician'}
        size="lg"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="+44 7700 000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Specialization
              </label>
              <input
                value={form.specialization}
                onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. HVAC, Electrical"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Region
              </label>
              <input
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. North, Central"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {['AVAILABLE', 'ON_JOB', 'EN_ROUTE', 'OFF_DUTY', 'ON_LEAVE'].map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Certifications
              </label>
              <input
                value={form.certifications}
                onChange={(e) => setForm((f) => ({ ...f, certifications: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. Gas Safe, NICEIC, City & Guilds"
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : editItem ? 'Update Technician' : 'Add Technician'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Remove Technician"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to remove <span className="font-semibold">{deleteItem?.name}</span>?
          This action cannot be undone.
        </p>
        <ModalFooter>
          <button
            onClick={() => setDeleteItem(null)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Remove
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
