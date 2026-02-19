'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, Modal } from '@ims/ui';
import { Trash2, Search, Plus, FileText } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface DisposalRecord {
  id: string;
  reference: string;
  chemicalId: string;
  chemicalName: string;
  quantity: number;
  unit: string;
  disposalMethod: string;
  wasteClassification: string;
  ewcCode: string;
  contractor: string;
  collectionDate: string;
  consignmentNote: string;
  destination: string;
  status: string;
  authorisedBy: string;
  notes: string;
}

const DISPOSAL_METHODS = [
  'INCINERATION',
  'CHEMICAL_TREATMENT',
  'LANDFILL',
  'RECYCLING',
  'NEUTRALISATION',
  'RETURN_TO_SUPPLIER',
  'OTHER',
];
const WASTE_CLASSES = ['HAZARDOUS', 'NON_HAZARDOUS', 'SPECIAL'];

export default function DisposalPage() {
  const [records, setRecords] = useState<DisposalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DisposalRecord | null>(null);

  const [chemicals, setChemicals] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    chemicalId: '',
    quantity: '',
    unit: 'litres',
    disposalMethod: 'INCINERATION',
    wasteClassification: 'HAZARDOUS',
    ewcCode: '',
    contractor: '',
    collectionDate: '',
    consignmentNote: '',
    destination: '',
    authorisedBy: '',
    notes: '',
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await api.get('/disposal', { params });
      setRecords(res.data.data || []);
    } catch (e) {
      setError(
        (e as any)?.response?.status === 401 ? 'Session expired.' : 'Failed to load disposal records.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
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
      await api.post('/disposal', { ...form, quantity: Number(form.quantity) });
      setModalOpen(false);
      setForm({
        chemicalId: '',
        quantity: '',
        unit: 'litres',
        disposalMethod: 'INCINERATION',
        wasteClassification: 'HAZARDOUS',
        ewcCode: '',
        contractor: '',
        collectionDate: '',
        consignmentNote: '',
        destination: '',
        authorisedBy: '',
        notes: '',
      });
      fetchRecords();
    } catch (e) {
      setError((e as any)?.response?.data?.message || 'Failed to create disposal record.');
    } finally {
      setSaving(false);
    }
  };

  const statusBadge: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    COLLECTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    DISPOSED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    CERTIFICATE_RECEIVED: 'bg-green-200 text-green-900 dark:bg-green-900/40 dark:text-green-200',
  };

  if (loading && records.length === 0) {
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
                Disposal Records
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Chemical waste disposal and chain of custody tracking
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" /> New Disposal
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
                  placeholder="Search by chemical, contractor or consignment note..."
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
                        Reference
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Chemical
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Quantity
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Classification
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Method
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Contractor
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Collection
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Consignment
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="text-center py-12 text-gray-500 dark:text-gray-400"
                        >
                          No disposal records found.
                        </td>
                      </tr>
                    ) : (
                      records.map((r) => (
                        <tr
                          key={r.id}
                          onClick={() => setSelectedRecord(r)}
                          className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Trash2 className="h-4 w-4 text-gray-400" />
                              <span className="font-mono text-xs font-medium text-gray-900 dark:text-gray-100">
                                {r.reference}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                            {r.chemicalName}
                          </td>
                          <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">
                            {r.quantity} {r.unit}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                r.wasteClassification === 'HAZARDOUS'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                  : r.wasteClassification === 'SPECIAL'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              }`}
                            >
                              {r.wasteClassification?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                            {r.disposalMethod?.replace(/_/g, ' ')}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {r.contractor || '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {r.collectionDate
                              ? new Date(r.collectionDate).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="px-4 py-3">
                            {r.consignmentNote ? (
                              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <FileText className="h-3 w-3" /> {r.consignmentNote}
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadge[r.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                            >
                              {r.status?.replace(/_/g, ' ')}
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
        isOpen={selectedRecord !== null}
        onClose={() => setSelectedRecord(null)}
        title="Disposal Record Details"
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold font-mono text-gray-900 dark:text-gray-100">
                {selectedRecord.reference}
              </h3>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadge[selectedRecord.status] || ''}`}
              >
                {selectedRecord.status?.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Chemical</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedRecord.chemicalName}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Quantity</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedRecord.quantity} {selectedRecord.unit}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Waste Classification</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedRecord.wasteClassification?.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">EWC Code</p>
                <p className="font-medium font-mono text-gray-900 dark:text-gray-100">
                  {selectedRecord.ewcCode || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Disposal Method</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedRecord.disposalMethod?.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Contractor</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedRecord.contractor || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Collection Date</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedRecord.collectionDate
                    ? new Date(selectedRecord.collectionDate).toLocaleDateString()
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Consignment Note</p>
                <p className="font-medium font-mono text-gray-900 dark:text-gray-100">
                  {selectedRecord.consignmentNote || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Destination</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedRecord.destination || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Authorised By</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedRecord.authorisedBy || '-'}
                </p>
              </div>
            </div>
            {selectedRecord.notes && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  {selectedRecord.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Disposal Record"
        size="lg"
      >
        <div className="space-y-4 p-4">
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
                Waste Classification *
              </label>
              <select
                value={form.wasteClassification}
                onChange={(e) => setForm({ ...form, wasteClassification: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {WASTE_CLASSES.map((w) => (
                  <option key={w} value={w}>
                    {w.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="litres">Litres</option>
                <option value="kg">Kilograms</option>
                <option value="g">Grams</option>
                <option value="drums">Drums</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                EWC Code
              </label>
              <input
                type="text"
                value={form.ewcCode}
                onChange={(e) => setForm({ ...form, ewcCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                placeholder="e.g. 07 01 04*"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Disposal Method *
              </label>
              <select
                value={form.disposalMethod}
                onChange={(e) => setForm({ ...form, disposalMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {DISPOSAL_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contractor
              </label>
              <input
                type="text"
                value={form.contractor}
                onChange={(e) => setForm({ ...form, contractor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                placeholder="Waste contractor name"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Collection Date
              </label>
              <input
                type="date"
                value={form.collectionDate}
                onChange={(e) => setForm({ ...form, collectionDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Consignment Note
              </label>
              <input
                type="text"
                value={form.consignmentNote}
                onChange={(e) => setForm({ ...form, consignmentNote: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                placeholder="Consignment note reference"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Destination
              </label>
              <input
                type="text"
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                placeholder="Waste facility"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Authorised By
              </label>
              <input
                type="text"
                value={form.authorisedBy}
                onChange={(e) => setForm({ ...form, authorisedBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              placeholder="Additional notes..."
            />
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
              disabled={saving || !form.chemicalId || !form.quantity}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Create Record'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
