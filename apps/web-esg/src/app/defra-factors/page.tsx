'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Leaf, Plus, Search, Filter, X, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface DefrFactor {
  id: string;
  category: string;
  subcategory: string;
  unit: string;
  factor: number;
  year: number;
  source: string;
  notes?: string;
}

const MOCK_FACTORS: DefrFactor[] = [
  { id: '1', category: 'Electricity', subcategory: 'UK Grid Average', unit: 'kWh', factor: 0.23314, year: 2024, source: 'DEFRA 2024' },
  { id: '2', category: 'Natural Gas', subcategory: 'Combustion', unit: 'kWh', factor: 0.18280, year: 2024, source: 'DEFRA 2024' },
  { id: '3', category: 'Diesel', subcategory: 'HGV - Rigid', unit: 'km', factor: 0.16280, year: 2024, source: 'DEFRA 2024' },
  { id: '4', category: 'Air Travel', subcategory: 'Short Haul Economy', unit: 'passenger.km', factor: 0.15553, year: 2024, source: 'DEFRA 2024' },
  { id: '5', category: 'Water', subcategory: 'Supply', unit: 'm³', factor: 0.34900, year: 2024, source: 'DEFRA 2024' },
  { id: '6', category: 'Waste', subcategory: 'General Landfill', unit: 'tonne', factor: 459.00000, year: 2024, source: 'DEFRA 2024' },
];

const CATEGORIES = ['All', 'Electricity', 'Natural Gas', 'Diesel', 'Air Travel', 'Water', 'Waste'];

const categoryColors: Record<string, string> = {
  Electricity: 'bg-yellow-100 text-yellow-800',
  'Natural Gas': 'bg-orange-100 text-orange-800',
  Diesel: 'bg-red-100 text-red-800',
  'Air Travel': 'bg-sky-100 text-sky-800',
  Water: 'bg-blue-100 text-blue-800',
  Waste: 'bg-gray-100 text-gray-800',
};

export default function DefraFactorsPage() {
  const [factors, setFactors] = useState<DefrFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: '',
    subcategory: '',
    unit: '',
    factor: '',
    year: '2024',
    source: '',
    notes: '',
  });

  useEffect(() => {
    fetchFactors();
  }, []);

  async function fetchFactors() {
    try {
      setLoading(true);
      const r = await api.get('/defra-factors');
      setFactors(r.data.data);
    } catch {
      setFactors(MOCK_FACTORS);
      setError('Using mock data — API unavailable');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/defra-factors', {
        ...form,
        factor: parseFloat(form.factor),
        year: parseInt(form.year),
      });
      setShowModal(false);
      setForm({ category: '', subcategory: '', unit: '', factor: '', year: '2024', source: '', notes: '' });
      fetchFactors();
    } catch {
      setFactors(prev => [
        ...prev,
        {
          id: String(Date.now()),
          ...form,
          factor: parseFloat(form.factor),
          year: parseInt(form.year),
        },
      ]);
      setShowModal(false);
      setForm({ category: '', subcategory: '', unit: '', factor: '', year: '2024', source: '', notes: '' });
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = factors.filter(f => {
    const matchSearch =
      f.category.toLowerCase().includes(search.toLowerCase()) ||
      f.subcategory.toLowerCase().includes(search.toLowerCase()) ||
      f.source.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || f.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DEFRA Emission Factors</h1>
              <p className="text-sm text-gray-500">UK Government GHG Conversion Factors (kgCO2e per unit)</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Factor
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Electricity', 'Transport', 'Waste', 'Other'].map(cat => {
            const count = factors.filter(f =>
              cat === 'Other'
                ? !['Electricity', 'Natural Gas', 'Diesel', 'Air Travel', 'Water', 'Waste'].slice(0, 2).concat(['Diesel', 'Air Travel']).includes(f.category)
                : cat === 'Transport'
                ? ['Diesel', 'Air Travel'].includes(f.category)
                : f.category === cat
            ).length;
            return (
              <Card key={cat} className="border-green-100">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-700">{count}</div>
                  <div className="text-sm text-gray-500">{cat} Factors</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="border-green-100">
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search category, subcategory, source..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Emission Factors ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Subcategory</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Unit</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-600">Factor (kgCO2e)</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600">Year</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((f, i) => (
                      <tr key={f.id} className={i % 2 === 0 ? 'bg-white' : 'bg-green-50/30'}>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[f.category] ?? 'bg-gray-100 text-gray-700'}`}>
                            {f.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{f.subcategory}</td>
                        <td className="py-3 px-4 text-gray-500 font-mono text-xs">{f.unit}</td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-green-800">
                          {f.factor.toFixed(5)}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-500">{f.year}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{f.source}</td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-400">
                          No factors found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Factor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Add Emission Factor</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    required
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Electricity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <input
                    required
                    value={form.subcategory}
                    onChange={e => setForm(p => ({ ...p, subcategory: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. UK Grid Average"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    required
                    value={form.unit}
                    onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. kWh"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Factor (kgCO2e)</label>
                  <input
                    required
                    type="number"
                    step="0.00001"
                    value={form.factor}
                    onChange={e => setForm(p => ({ ...p, factor: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.23314"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    required
                    type="number"
                    value={form.year}
                    onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <input
                    required
                    value={form.source}
                    onChange={e => setForm(p => ({ ...p, source: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="DEFRA 2024"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Factor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
