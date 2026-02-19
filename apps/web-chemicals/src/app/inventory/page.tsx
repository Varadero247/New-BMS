'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, Modal } from '@ims/ui';
import { Warehouse, Search, Plus, AlertTriangle, Clock } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface InventoryRecord {
  id: string;
  chemicalId: string;
  chemicalName: string;
  location: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  expiryDate: string;
  lastInspected: string;
  batchNumber: string;
  storageCondition: string;
}

export default function InventoryPage() {
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(searchParams.get('action') === 'new');
  const [saving, setSaving] = useState(false);

  const [chemicals, setChemicals] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    chemicalId: '',
    location: '',
    quantity: '',
    unit: 'litres',
    minStock: '',
    maxStock: '',
    expiryDate: '',
    batchNumber: '',
    storageCondition: '',
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await api.get('/inventory', { params });
      setRecords(res.data.data || []);
    } catch (e) {
      setError((e as any)?.response?.status === 401 ? 'Session expired.' : 'Failed to load inventory.');
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
      await api.post('/inventory', {
        ...form,
        quantity: Number(form.quantity),
        minStock: Number(form.minStock) || 0,
        maxStock: Number(form.maxStock) || 0,
      });
      setModalOpen(false);
      setForm({
        chemicalId: '',
        location: '',
        quantity: '',
        unit: 'litres',
        minStock: '',
        maxStock: '',
        expiryDate: '',
        batchNumber: '',
        storageCondition: '',
      });
      fetchRecords();
    } catch (e) {
      setError((e as any)?.response?.data?.message || 'Failed to add stock.');
    } finally {
      setSaving(false);
    }
  };

  const isLowStock = (r: InventoryRecord) => r.minStock > 0 && r.quantity <= r.minStock;
  const isExpired = (r: InventoryRecord) => r.expiryDate && new Date(r.expiryDate) < new Date();
  const isExpiringSoon = (r: InventoryRecord) => {
    if (!r.expiryDate) return false;
    const days = Math.floor(
      (new Date(r.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 && days <= 30;
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
                Chemical Inventory
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Stock levels, locations and storage compliance
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Stock
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {(records.some(isLowStock) || records.some(isExpired)) && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {records.some(isLowStock) && (
                <Card className="border-amber-200 dark:border-amber-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        Low Stock Alert
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {records.filter(isLowStock).length} chemical(s) below minimum stock level
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {records.some(isExpired) && (
                <Card className="border-red-200 dark:border-red-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        Expiry Alert
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {records.filter(isExpired).length} chemical(s) have expired
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
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
                  placeholder="Search by chemical or location..."
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
                        Chemical
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Location
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Quantity
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Min Stock
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Batch
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Expiry
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Last Inspected
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
                          colSpan={8}
                          className="text-center py-12 text-gray-500 dark:text-gray-400"
                        >
                          No inventory records found.
                        </td>
                      </tr>
                    ) : (
                      records.map((r) => (
                        <tr
                          key={r.id}
                          className={`border-b border-gray-100 dark:border-gray-700/50 transition-colors ${isExpired(r) ? 'bg-red-50/50 dark:bg-red-900/10' : isLowStock(r) ? 'bg-amber-50/50 dark:bg-amber-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Warehouse className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {r.chemicalName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {r.location}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-mono ${isLowStock(r) ? 'text-amber-600 font-medium' : 'text-gray-900 dark:text-gray-100'}`}
                            >
                              {r.quantity} {r.unit}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">
                            {r.minStock || '-'}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                            {r.batchNumber || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-sm ${isExpired(r) ? 'text-red-600 font-medium' : isExpiringSoon(r) ? 'text-amber-600 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
                            >
                              {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : '-'}
                              {isExpired(r) && ' (EXPIRED)'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {r.lastInspected ? new Date(r.lastInspected).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3">
                            {isExpired(r) ? (
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                Expired
                              </span>
                            ) : isLowStock(r) ? (
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                Low Stock
                              </span>
                            ) : (
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                OK
                              </span>
                            )}
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
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Chemical Stock"
        size="lg"
      >
        <div className="space-y-4 p-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                placeholder="e.g. Store Room A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Batch Number
              </label>
              <input
                type="text"
                value={form.batchNumber}
                onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                placeholder="e.g. LOT-2026-001"
              />
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
                <option value="ml">Millilitres</option>
                <option value="units">Units</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Stock
              </label>
              <input
                type="number"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Storage Condition
              </label>
              <input
                type="text"
                value={form.storageCondition}
                onChange={(e) => setForm({ ...form, storageCondition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                placeholder="e.g. Cool, dry, ventilated"
              />
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
              disabled={saving || !form.chemicalId || !form.location || !form.quantity}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Stock'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
