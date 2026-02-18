'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Search, BarChart3 } from 'lucide-react';
import { api } from '@/lib/api';

interface Scorecard {
  id: string;
  period: string;
  quality: number;
  delivery: number;
  responsiveness: number;
  cost: number;
  overall: number;
  grade: string;
  reviewer: string;
}

export default function ScorecardsPage() {
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    load();
  }, []);
  async function load() {
    try {
      const res = await api.get('/supplier/scorecards');
      setScorecards(res.data.data || []);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  }
  const filtered = scorecards.filter((s) =>
    JSON.stringify(s).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Scorecards</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              View your performance scorecards
            </p>
          </div>
        </div>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search scorecards..."
              placeholder="Search scorecards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-600" />
              Scorecards ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Period
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Quality
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Delivery
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Responsiveness
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Cost
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Overall
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((sc) => (
                      <tr key={sc.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                          {sc.period}
                        </td>
                        <td className="py-3 px-4 text-center">{sc.quality}/100</td>
                        <td className="py-3 px-4 text-center">{sc.delivery}/100</td>
                        <td className="py-3 px-4 text-center">{sc.responsiveness}/100</td>
                        <td className="py-3 px-4 text-center">{sc.cost}/100</td>
                        <td className="py-3 px-4 text-center font-bold">{sc.overall}/100</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sc.grade === 'A' ? 'bg-green-100 text-green-700' : sc.grade === 'B' ? 'bg-blue-100 text-blue-700' : sc.grade === 'C' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {sc.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scorecards found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
