'use client';
import axios from 'axios';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, Modal } from '@ims/ui';
import { FlaskConical, Search, Plus, ChevronRight } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Chemical {
  id: string;
  name: string;
  casNumber: string;
  signalWord: string;
  pictograms: string[];
  riskLevel: string;
  sdsStatus: string;
  cmrFlag: boolean;
}

const riskBadgeClass: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  VERY_HIGH: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const signalBadgeClass: Record<string, string> = {
  DANGER: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  WARNING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

const GHS_PICTOGRAM_LABELS: Record<string, string> = {
  GHS01: 'Explosive',
  GHS02: 'Flammable',
  GHS03: 'Oxidiser',
  GHS04: 'Compressed Gas',
  GHS05: 'Corrosive',
  GHS06: 'Toxic',
  GHS07: 'Harmful',
  GHS08: 'Health Hazard',
  GHS09: 'Environment',
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [signalFilter, setSignalFilter] = useState('');
  const [cmrFilter, setCmrFilter] = useState(false);
  const [modalOpen, setModalOpen] = useState(searchParams.get('action') === 'new');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    casNumber: '',
    signalWord: 'WARNING',
    pictograms: [] as string[],
    riskLevel: 'MEDIUM',
    physicalForm: 'LIQUID',
    storageClass: '',
    welLimit: '',
    cmrFlag: false,
    description: '',
  });

  const fetchChemicals = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (signalFilter) params.signalWord = signalFilter;
      if (cmrFilter) params.cmr = 'true';
      const res = await api.get('/register', { params });
      setChemicals(res.data.data || []);
    } catch (e) {
      setError(axios.isAxiosError(e) && e.response?.status === 401 ? 'Session expired.' : 'Failed to load chemicals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChemicals();
  }, [search, signalFilter, cmrFilter]);

  const handleCreate = async () => {
    try {
      setSaving(true);
      await api.post('/register', form);
      setModalOpen(false);
      setForm({
        name: '',
        casNumber: '',
        signalWord: 'WARNING',
        pictograms: [],
        riskLevel: 'MEDIUM',
        physicalForm: 'LIQUID',
        storageClass: '',
        welLimit: '',
        cmrFlag: false,
        description: '',
      });
      fetchChemicals();
    } catch (e) {
      setError(axios.isAxiosError(e) && e.response?.data?.message || 'Failed to create chemical.');
    } finally {
      setSaving(false);
    }
  };

  const togglePictogram = (code: string) => {
    setForm((prev) => ({
      ...prev,
      pictograms: prev.pictograms.includes(code)
        ? prev.pictograms.filter((p) => p !== code)
        : [...prev.pictograms, code],
    }));
  };

  if (loading && chemicals.length === 0) {
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
                Chemical Register
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Manage all registered chemicals and their classifications
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Chemical
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search chemicals by name or CAS number..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={signalFilter}
                  onChange={(e) => setSignalFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Signal Words</option>
                  <option value="DANGER">Danger</option>
                  <option value="WARNING">Warning</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={cmrFilter}
                    onChange={(e) => setCmrFilter(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  CMR Only
                </label>
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
                        Chemical Name
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        CAS No.
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Signal Word
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Pictograms
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Risk Level
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        SDS Status
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chemicals.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-12 text-gray-500 dark:text-gray-400"
                        >
                          No chemicals found. Add your first chemical to get started.
                        </td>
                      </tr>
                    ) : (
                      chemicals.map((chem) => (
                        <tr
                          key={chem.id}
                          onClick={() => router.push(`/register/${chem.id}`)}
                          className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FlaskConical className="h-4 w-4 text-red-500" />
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {chem.name}
                              </span>
                              {chem.cmrFlag && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                  CMR
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">
                            {chem.casNumber || '-'}
                          </td>
                          <td className="px-4 py-3">
                            {chem.signalWord ? (
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${signalBadgeClass[chem.signalWord] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                              >
                                {chem.signalWord}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {(chem.pictograms || []).map((p) => (
                                <span
                                  key={p}
                                  title={GHS_PICTOGRAM_LABELS[p] || p}
                                  className="inline-flex items-center justify-center w-6 h-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-[9px] font-bold text-red-700 dark:text-red-300"
                                >
                                  {p.replace('GHS0', '').replace('GHS', '')}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${riskBadgeClass[chem.riskLevel] || 'bg-gray-100 text-gray-800'}`}
                            >
                              {chem.riskLevel?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                chem.sdsStatus === 'CURRENT'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : chem.sdsStatus === 'OVERDUE'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                              }`}
                            >
                              {chem.sdsStatus || 'NONE'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <ChevronRight className="h-4 w-4 text-gray-400" />
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
        title="Add New Chemical"
        size="lg"
      >
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chemical Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                placeholder="e.g. Acetone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CAS Number
              </label>
              <input
                type="text"
                value={form.casNumber}
                onChange={(e) => setForm({ ...form, casNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                placeholder="e.g. 67-64-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Signal Word
              </label>
              <select
                value={form.signalWord}
                onChange={(e) => setForm({ ...form, signalWord: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="WARNING">Warning</option>
                <option value="DANGER">Danger</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Risk Level
              </label>
              <select
                value={form.riskLevel}
                onChange={(e) => setForm({ ...form, riskLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="VERY_HIGH">Very High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Physical Form
              </label>
              <select
                value={form.physicalForm}
                onChange={(e) => setForm({ ...form, physicalForm: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="SOLID">Solid</option>
                <option value="LIQUID">Liquid</option>
                <option value="GAS">Gas</option>
                <option value="POWDER">Powder</option>
                <option value="AEROSOL">Aerosol</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                WEL Limit (mg/m3)
              </label>
              <input
                type="text"
                value={form.welLimit}
                onChange={(e) => setForm({ ...form, welLimit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                placeholder="e.g. 1210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              GHS Pictograms
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(GHS_PICTOGRAM_LABELS).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => togglePictogram(code)}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${
                    form.pictograms.includes(code)
                      ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300'
                      : 'bg-gray-50 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {code}: {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Storage Class
            </label>
            <input
              type="text"
              value={form.storageClass}
              onChange={(e) => setForm({ ...form, storageClass: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              placeholder="e.g. Flammable liquids"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.cmrFlag}
              onChange={(e) => setForm({ ...form, cmrFlag: e.target.checked })}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            CMR (Carcinogenic, Mutagenic, Reprotoxic)
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              placeholder="Additional details about this chemical..."
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
              disabled={saving || !form.name}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Create Chemical'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
