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
} from '@ims/ui';
import { Plus, Search, RefreshCw, Grid3x3 } from 'lucide-react';
import { api } from '@/lib/api';

interface RaciEntry {
  id: string;
  referenceNumber: string;
  processName: string;
  processId: string | null;
  activityName: string;
  roleName: string;
  personName: string | null;
  raciType: string;
  notes: string | null;
  createdAt: string;
}

const RACI_TYPES = ['RESPONSIBLE', 'ACCOUNTABLE', 'CONSULTED', 'INFORMED'] as const;
const raciColors: Record<string, string> = {
  RESPONSIBLE: 'info',
  ACCOUNTABLE: 'danger',
  CONSULTED: 'warning',
  INFORMED: 'default',
};
const raciLetters: Record<string, string> = {
  RESPONSIBLE: 'R',
  ACCOUNTABLE: 'A',
  CONSULTED: 'C',
  INFORMED: 'I',
};

type MatrixData = Record<
  string,
  Record<string, Array<{ roleName: string; personName: string | null; raciType: string }>>
>;

export default function RaciPage() {
  const [items, setItems] = useState<RaciEntry[]>([]);
  const [matrix, setMatrix] = useState<MatrixData>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('matrix');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<RaciEntry | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  const [form, setForm] = useState({
    processName: '',
    processId: '',
    activityName: '',
    roleName: '',
    personName: '',
    raciType: 'RESPONSIBLE',
    notes: '',
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      if (viewMode === 'matrix') {
        const res = await api.get('/raci/matrix');
        setMatrix(res.data.data);
      } else {
        const params: Record<string, string> = { page: String(pagination.page), limit: '50' };
        if (search) params.search = search;
        const res = await api.get('/raci', { params });
        setItems(res.data.data);
        setPagination((p) => ({
          ...p,
          total: res.data.pagination.total,
          totalPages: res.data.pagination.totalPages,
        }));
      }
    } catch {
      /* empty */
    }
    setLoading(false);
  }, [pagination.page, search, viewMode]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      processName: '',
      processId: '',
      activityName: '',
      roleName: '',
      personName: '',
      raciType: 'RESPONSIBLE',
      notes: '',
    });
    setModalOpen(true);
  };

  const openEdit = (item: RaciEntry) => {
    setEditItem(item);
    setForm({
      processName: item.processName,
      processId: item.processId || '',
      activityName: item.activityName,
      roleName: item.roleName,
      personName: item.personName || '',
      raciType: item.raciType,
      notes: item.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.put(`/raci/${editItem.id}`, form);
      } else {
        await api.post('/raci', form);
      }
      setModalOpen(false);
      fetchItems();
    } catch {
      /* empty */
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this RACI entry?')) return;
    try {
      await api.delete(`/raci/${id}`);
      fetchItems();
    } catch {
      /* empty */
    }
  };

  // Extract unique roles from matrix for column headers
  const allRoles = new Set<string>();
  Object.values(matrix).forEach((activities) => {
    Object.values(activities).forEach((entries) => {
      entries.forEach((e) => allRoles.add(e.roleName));
    });
  });
  const roles = Array.from(allRoles).sort();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">RACI Matrix</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ISO 9001:2015 §5.3 — Organizational roles, responsibilities and authorities
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            <button
              className={`px-3 py-1.5 text-sm ${viewMode === 'matrix' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
              onClick={() => setViewMode('matrix')}
            >
              Matrix
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Badge variant="info">R = Responsible</Badge>
        <Badge variant="danger">A = Accountable</Badge>
        <Badge variant="warning">C = Consulted</Badge>
        <Badge>I = Informed</Badge>
      </div>

      {viewMode === 'matrix' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {Object.keys(matrix).length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No RACI entries. Add entries to see the matrix.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 min-w-[200px]">
                        Process / Activity
                      </th>
                      {roles.map((role) => (
                        <th
                          key={role}
                          className="text-center p-3 font-medium text-gray-700 dark:text-gray-300 min-w-[100px]"
                        >
                          {role}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {Object.entries(matrix).map(([process, activities]) =>
                      Object.entries(activities).map(([activity, entries], idx) => (
                        <tr
                          key={`${process}-${activity}`}
                          className="hover:bg-gray-50 dark:bg-gray-800"
                        >
                          <td className="p-3">
                            {idx === 0 && (
                              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                {process}
                              </div>
                            )}
                            <div className="text-gray-600 pl-4">{activity}</div>
                          </td>
                          {roles.map((role) => {
                            const match = entries.find((e) => e.roleName === role);
                            return (
                              <td key={role} className="p-3 text-center">
                                {match ? (
                                  <Badge variant={raciColors[match.raciType] as any}>
                                    {raciLetters[match.raciType]}
                                  </Badge>
                                ) : (
                                  <span className="text-gray-300 dark:text-gray-600">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                aria-label="Search processes, activities, roles..."
                placeholder="Search processes, activities, roles..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={fetchItems}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                        Process
                      </th>
                      <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                        Activity
                      </th>
                      <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                        Role
                      </th>
                      <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                        Person
                      </th>
                      <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                        RACI
                      </th>
                      <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          Loading...
                        </td>
                      </tr>
                    ) : items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          No entries found
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:bg-gray-800">
                          <td className="p-3 font-medium">{item.processName}</td>
                          <td className="p-3 text-gray-600">{item.activityName}</td>
                          <td className="p-3 text-gray-600">{item.roleName}</td>
                          <td className="p-3 text-gray-600">{item.personName || '—'}</td>
                          <td className="p-3">
                            <Badge variant={raciColors[item.raciType] as any}>
                              {item.raciType}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit RACI Entry' : 'Add RACI Entry'}
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Process Name *</Label>
            <Input
              value={form.processName}
              onChange={(e) => setForm((f) => ({ ...f, processName: e.target.value }))}
            />
          </div>
          <div>
            <Label>Activity Name *</Label>
            <Input
              value={form.activityName}
              onChange={(e) => setForm((f) => ({ ...f, activityName: e.target.value }))}
            />
          </div>
          <div>
            <Label>Role Name *</Label>
            <Input
              value={form.roleName}
              onChange={(e) => setForm((f) => ({ ...f, roleName: e.target.value }))}
            />
          </div>
          <div>
            <Label>Person Name</Label>
            <Input
              value={form.personName}
              onChange={(e) => setForm((f) => ({ ...f, personName: e.target.value }))}
            />
          </div>
          <div>
            <Label>RACI Type *</Label>
            <Select
              value={form.raciType}
              onChange={(e) => setForm((f) => ({ ...f, raciType: e.target.value }))}
            >
              {RACI_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{editItem ? 'Update' : 'Create'}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
