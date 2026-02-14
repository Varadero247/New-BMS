'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, GitCompare, TrendingUp, TrendingDown, Minus, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface BenchmarkItem {
  id: string;
  name: string;
  category: string;
  yourScore: number;
  industryAvg: number;
  topQuartile: number;
  unit: string;
  direction: 'higher_better' | 'lower_better';
  period: string;
  source: string;
  ranking: string;
  percentile: number;
}

const MOCK_BENCHMARKS: BenchmarkItem[] = [
  { id: '1', name: 'Lost Time Injury Rate', category: 'H&S', yourScore: 0.12, industryAvg: 0.45, topQuartile: 0.08, unit: 'per 100k hrs', direction: 'lower_better', period: '2025', source: 'HSE National Stats', ranking: 'ABOVE', percentile: 78 },
  { id: '2', name: 'CAPA Closure Rate', category: 'Quality', yourScore: 76, industryAvg: 72, topQuartile: 90, unit: '%', direction: 'higher_better', period: 'Q4 2025', source: 'ISO 9001 Benchmarking Group', ranking: 'AVERAGE', percentile: 55 },
  { id: '3', name: 'Carbon Intensity', category: 'ESG', yourScore: 24.8, industryAvg: 31.2, topQuartile: 18.0, unit: 'tCO2/£m', direction: 'lower_better', period: '2025', source: 'CDP Climate Report', ranking: 'ABOVE', percentile: 68 },
  { id: '4', name: 'Customer Satisfaction Score', category: 'Quality', yourScore: 88, industryAvg: 82, topQuartile: 94, unit: '%', direction: 'higher_better', period: 'Q4 2025', source: 'Customer Experience Index', ranking: 'ABOVE', percentile: 72 },
  { id: '5', name: 'On-Time Delivery', category: 'Operations', yourScore: 93, industryAvg: 88, topQuartile: 97, unit: '%', direction: 'higher_better', period: 'Q4 2025', source: 'Supply Chain Benchmark', ranking: 'ABOVE', percentile: 64 },
  { id: '6', name: 'Employee Turnover Rate', category: 'HR', yourScore: 14.2, industryAvg: 12.5, topQuartile: 8.0, unit: '%', direction: 'lower_better', period: '2025', source: 'CIPD Annual Survey', ranking: 'BELOW', percentile: 38 },
  { id: '7', name: 'Supplier Defect Rate', category: 'Supply Chain', yourScore: 2.1, industryAvg: 3.8, topQuartile: 1.0, unit: 'ppm', direction: 'lower_better', period: 'Q4 2025', source: 'Manufacturing Excellence Forum', ranking: 'ABOVE', percentile: 71 },
  { id: '8', name: 'Energy Intensity', category: 'ESG', yourScore: 142, industryAvg: 165, topQuartile: 110, unit: 'kWh/m²/yr', direction: 'lower_better', period: '2025', source: 'Energy Benchmarking Study', ranking: 'ABOVE', percentile: 62 },
  { id: '9', name: 'Training Hours per Employee', category: 'HR', yourScore: 18.5, industryAvg: 22.0, topQuartile: 32.0, unit: 'hrs/yr', direction: 'higher_better', period: '2025', source: 'L&D Industry Report', ranking: 'BELOW', percentile: 42 },
];

const RANKING_STYLES: Record<string, string> = {
  ABOVE: 'bg-green-100 text-green-700',
  AVERAGE: 'bg-yellow-100 text-yellow-700',
  BELOW: 'bg-red-100 text-red-700',
};

const CATEGORY_STYLES: Record<string, string> = {
  'H&S': 'bg-red-100 text-red-700',
  Quality: 'bg-blue-100 text-blue-700',
  ESG: 'bg-green-100 text-green-700',
  Operations: 'bg-orange-100 text-orange-700',
  HR: 'bg-pink-100 text-pink-700',
  'Supply Chain': 'bg-amber-100 text-amber-700',
};

function ScoreComparison({ item }: { item: BenchmarkItem }) {
  const vsAvg = item.direction === 'lower_better'
    ? item.industryAvg - item.yourScore
    : item.yourScore - item.industryAvg;
  const positive = vsAvg >= 0;

  return (
    <div className="flex items-center gap-1.5">
      {positive
        ? <TrendingUp className="h-3.5 w-3.5 text-green-500" />
        : <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
      <span className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
        {positive ? '+' : ''}{Math.abs(vsAvg).toFixed(1)} vs avg
      </span>
    </div>
  );
}

export default function BenchmarksPage() {
  const [items, setItems] = useState<BenchmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [rankingFilter, setRankingFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/benchmarks');
        setItems(r.data.data || MOCK_BENCHMARKS);
      } catch {
        setItems(MOCK_BENCHMARKS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter(i => {
    const matchSearch = searchTerm === '' ||
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === '' || i.category === categoryFilter;
    const matchRanking = rankingFilter === '' || i.ranking === rankingFilter;
    return matchSearch && matchCategory && matchRanking;
  });

  const categories = [...new Set(items.map(i => i.category))].sort();
  const above = items.filter(i => i.ranking === 'ABOVE').length;
  const below = items.filter(i => i.ranking === 'BELOW').length;
  const avgPercentile = items.length > 0
    ? Math.round(items.reduce((s, i) => s + i.percentile, 0) / items.length)
    : 0;

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Benchmarks</h1>
            <p className="text-gray-500 mt-1">Compare your performance against industry averages and top quartile</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Add Benchmark
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Benchmarks', value: items.length, color: 'bg-purple-50 text-purple-700' },
            { label: 'Above Industry Avg', value: above, color: 'bg-green-50 text-green-700' },
            { label: 'Below Industry Avg', value: below, color: 'bg-red-50 text-red-700' },
            { label: 'Avg Percentile', value: `${avgPercentile}th`, color: 'bg-blue-50 text-blue-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Percentile overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-purple-600" />
              Percentile Ranking by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-44 flex-shrink-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.category}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.percentile >= 70 ? 'bg-green-500' : item.percentile >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${item.percentile}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold w-12 text-right ${item.percentile >= 70 ? 'text-green-600' : item.percentile >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {item.percentile}th
                      </span>
                    </div>
                  </div>
                  <ScoreComparison item={item} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search benchmarks..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={rankingFilter} onChange={e => setRankingFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">All Rankings</option>
            <option value="ABOVE">Above Average</option>
            <option value="AVERAGE">Average</option>
            <option value="BELOW">Below Average</option>
          </select>
        </div>

        {/* Benchmarks table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GitCompare className="h-5 w-5 text-purple-600" />
              Benchmarks ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No benchmarks found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Metric</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Category</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Your Score</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Industry Avg</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Top Quartile</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Percentile</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Ranking</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(b => (
                      <tr key={b.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{b.name}</p>
                          <p className="text-xs text-gray-400">{b.period} · {b.direction === 'lower_better' ? 'Lower is better' : 'Higher is better'}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_STYLES[b.category] || 'bg-gray-100 text-gray-700'}`}>
                            {b.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-bold ${b.ranking === 'ABOVE' ? 'text-green-600' : b.ranking === 'BELOW' ? 'text-red-600' : 'text-gray-900'}`}>
                            {b.yourScore}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">{b.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {b.industryAvg}<span className="text-xs text-gray-400 ml-1">{b.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-500">
                          {b.topQuartile}<span className="text-xs text-gray-400 ml-1">{b.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${b.percentile >= 70 ? 'bg-green-500' : b.percentile >= 40 ? 'bg-yellow-500' : 'bg-red-400'}`}
                                style={{ width: `${b.percentile}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${b.percentile >= 70 ? 'text-green-600' : b.percentile >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {b.percentile}th
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${RANKING_STYLES[b.ranking] || 'bg-gray-100 text-gray-700'}`}>
                            {b.ranking === 'ABOVE' ? 'Above Avg' : b.ranking === 'BELOW' ? 'Below Avg' : 'Average'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">{b.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Benchmark Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Add Benchmark</h2>
                <button onClick={() => setShowAddModal(false)}>
                  <XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Metric Name</label>
                  <input type="text" placeholder="e.g. Waste Recycling Rate" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <input type="text" placeholder="e.g. %" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Score</label>
                    <input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry Avg</label>
                    <input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Top Quartile</label>
                    <input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
                  <input type="text" placeholder="e.g. Industry Report 2025" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Cancel</button>
                <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">Add Benchmark</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
