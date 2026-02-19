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
  Textarea } from '@ims/ui';
import { Plus, Ruler, Search, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

interface Calibration {
  id: string;
  referenceNumber: string;
  equipmentName: string;
  equipmentId: string | null;
  manufacturer: string | null;
  modelNumber: string | null;
  serialNumber: string | null;
  location: string | null;
  calibrationMethod: string | null;
  standardUsed: string | null;
  acceptanceCriteria: string | null;
  status: string;
  lastCalibrationDate: string | null;
  nextCalibrationDate: string | null;
  calibrationFrequency: string | null;
  calibratedBy: string | null;
  certificateNumber: string | null;
  results: string | null;
  deviation: string | null;
  adjustments: string | null;
  notes: string | null;
  createdAt: string;
}

const STATUSES = ['CURRENT', 'DUE', 'OVERDUE', 'OUT_OF_SERVICE', 'RETIRED'] as const;

const statusColors: Record<string, string> = {
  CURRENT: 'success',
  DUE: 'warning',
  OVERDUE: 'danger',
  OUT_OF_SERVICE: 'default',
  RETIRED: 'default' };

export default function CalibrationsPage() {
  const [items, setItems] = useState<Calibration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Calibration | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  const [form, setForm] = useState({
    equipmentName: '',
    equipmentId: '',
    manufacturer: '',
    modelNumber: '',
    serialNumber: '',
    location: '',
    calibrationMethod: '',
    standardUsed: '',
    acceptanceCriteria: '',
    calibrationFrequency: '',
    lastCalibrationDate: '',
    nextCalibrationDate: '',
    calibratedBy: '',
    certificateNumber: '',
    results: '',
    deviation: '',
    adjustments: '',
    notes: '' });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(pagination.page), limit: '25' };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/calibrations', { params });
      setItems(res.data.data);
      setPagination((p) => ({
        ...p,
        total: res.data.pagination.total,
        totalPages: res.data.pagination.totalPages }));
    } catch {
      /* empty */
    }
    setLoading(false);
  }, [pagination.page, search, filterStatus]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      equipmentName: '',
      equipmentId: '',
      manufacturer: '',
      modelNumber: '',
      serialNumber: '',
      location: '',
      calibrationMethod: '',
      standardUsed: '',
      acceptanceCriteria: '',
      calibrationFrequency: '',
      lastCalibrationDate: '',
      nextCalibrationDate: '',
      calibratedBy: '',
      certificateNumber: '',
      results: '',
      deviation: '',
      adjustments: '',
      notes: '' });
    setModalOpen(true);
  };

  const openEdit = (item: Calibration) => {
    setEditItem(item);
    setForm({
      equipmentName: item.equipmentName,
      equipmentId: item.equipmentId || '',
      manufacturer: item.manufacturer || '',
      modelNumber: item.modelNumber || '',
      serialNumber: item.serialNumber || '',
      location: item.location || '',
      calibrationMethod: item.calibrationMethod || '',
      standardUsed: item.standardUsed || '',
      acceptanceCriteria: item.acceptanceCriteria || '',
      calibrationFrequency: item.calibrationFrequency || '',
      lastCalibrationDate: item.lastCalibrationDate?.slice(0, 10) || '',
      nextCalibrationDate: item.nextCalibrationDate?.slice(0, 10) || '',
      calibratedBy: item.calibratedBy || '',
      certificateNumber: item.certificateNumber || '',
      results: item.results || '',
      deviation: item.deviation || '',
      adjustments: item.adjustments || '',
      notes: item.notes || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.put(`/calibrations/${editItem.id}`, form);
      } else {
        await api.post('/calibrations', form);
      }
      setModalOpen(false);
      fetchItems();
    } catch {
      /* empty */
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this calibration record?')) return;
    try {
      await api.delete(`/calibrations/${id}`);
      fetchItems();
    } catch {
      /* empty */
    }
  };

  const dueCount = items.filter((i) => i.status === 'DUE' || i.status === 'OVERDUE').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Calibration Register
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ISO 9001:2015 §7.1.5 — Monitoring and measuring resources
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Calibration
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Equipment</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {items.filter((i) => i.status === 'CURRENT').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Current</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {items.filter((i) => i.status === 'DUE').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Due</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {items.filter((i) => i.status === 'OVERDUE').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            aria-label="Search equipment..."
            placeholder="Search equipment..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </Select>
        <Button variant="outline" onClick={fetchItems}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Reference
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Equipment
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Serial No.
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Next Due
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No calibration records found
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:bg-gray-800">
                      <td className="p-3 font-mono text-xs text-blue-600">
                        {item.referenceNumber}
                      </td>
                      <td className="p-3 font-medium">{item.equipmentName}</td>
                      <td className="p-3 text-gray-600">{item.serialNumber || '—'}</td>
                      <td className="p-3 text-gray-600">{item.location || '—'}</td>
                      <td className="p-3">
                        <Badge variant={statusColors[item.status] as any}>
                          {item.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-3 text-gray-600">
                        {item.nextCalibrationDate
                          ? new Date(item.nextCalibrationDate).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400 py-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Calibration' : 'Add Calibration'}
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Equipment Name *</Label>
            <Input
              value={form.equipmentName}
              onChange={(e) => setForm((f) => ({ ...f, equipmentName: e.target.value }))}
            />
          </div>
          <div>
            <Label>Equipment ID</Label>
            <Input
              value={form.equipmentId}
              onChange={(e) => setForm((f) => ({ ...f, equipmentId: e.target.value }))}
            />
          </div>
          <div>
            <Label>Manufacturer</Label>
            <Input
              value={form.manufacturer}
              onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))}
            />
          </div>
          <div>
            <Label>Model Number</Label>
            <Input
              value={form.modelNumber}
              onChange={(e) => setForm((f) => ({ ...f, modelNumber: e.target.value }))}
            />
          </div>
          <div>
            <Label>Serial Number</Label>
            <Input
              value={form.serialNumber}
              onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div>
            <Label>Calibration Frequency</Label>
            <Input
              value={form.calibrationFrequency}
              onChange={(e) => setForm((f) => ({ ...f, calibrationFrequency: e.target.value }))}
              placeholder="e.g. Annual"
            />
          </div>
          <div>
            <Label>Calibrated By</Label>
            <Input
              value={form.calibratedBy}
              onChange={(e) => setForm((f) => ({ ...f, calibratedBy: e.target.value }))}
            />
          </div>
          <div>
            <Label>Last Calibration Date</Label>
            <Input
              type="date"
              value={form.lastCalibrationDate}
              onChange={(e) => setForm((f) => ({ ...f, lastCalibrationDate: e.target.value }))}
            />
          </div>
          <div>
            <Label>Next Calibration Date</Label>
            <Input
              type="date"
              value={form.nextCalibrationDate}
              onChange={(e) => setForm((f) => ({ ...f, nextCalibrationDate: e.target.value }))}
            />
          </div>
          <div>
            <Label>Standard Used</Label>
            <Input
              value={form.standardUsed}
              onChange={(e) => setForm((f) => ({ ...f, standardUsed: e.target.value }))}
            />
          </div>
          <div>
            <Label>Certificate Number</Label>
            <Input
              value={form.certificateNumber}
              onChange={(e) => setForm((f) => ({ ...f, certificateNumber: e.target.value }))}
            />
          </div>
          <div className="col-span-2">
            <Label>Calibration Method</Label>
            <Textarea
              value={form.calibrationMethod}
              onChange={(e) => setForm((f) => ({ ...f, calibrationMethod: e.target.value }))}
            />
          </div>
          <div className="col-span-2">
            <Label>Acceptance Criteria</Label>
            <Textarea
              value={form.acceptanceCriteria}
              onChange={(e) => setForm((f) => ({ ...f, acceptanceCriteria: e.target.value }))}
            />
          </div>
          <div className="col-span-2">
            <Label>Results</Label>
            <Textarea
              value={form.results}
              onChange={(e) => setForm((f) => ({ ...f, results: e.target.value }))}
            />
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
