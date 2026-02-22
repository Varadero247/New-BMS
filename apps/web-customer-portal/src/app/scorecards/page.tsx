'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { BarChart2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Scorecard {
  id: string;
  period: string;
  overallScore: number;
  deliveryScore: number;
  qualityScore: number;
  communicationScore: number;
  status: 'PUBLISHED' | 'DRAFT';
  publishedAt: string;
}

const MOCK_SCORECARDS: Scorecard[] = [
  {
    id: '1',
    period: 'Q4 2025',
    overallScore: 94,
    deliveryScore: 96,
    qualityScore: 98,
    communicationScore: 88,
    status: 'PUBLISHED',
    publishedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    period: 'Q3 2025',
    overallScore: 91,
    deliveryScore: 89,
    qualityScore: 95,
    communicationScore: 90,
    status: 'PUBLISHED',
    publishedAt: '2025-10-12T09:30:00Z',
  },
  {
    id: '3',
    period: 'Q2 2025',
    overallScore: 87,
    deliveryScore: 82,
    qualityScore: 93,
    communicationScore: 86,
    status: 'PUBLISHED',
    publishedAt: '2025-07-11T14:00:00Z',
  },
  {
    id: '4',
    period: 'Q1 2026',
    overallScore: 0,
    deliveryScore: 0,
    qualityScore: 0,
    communicationScore: 0,
    status: 'DRAFT',
    publishedAt: '',
  },
];

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-8 text-right">
        {score}
      </span>
    </div>
  );
}

function overallColor(score: number) {
  if (score >= 90) return 'text-green-600 dark:text-green-400';
  if (score >= 75) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

export default function ScorecardsPage() {
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get('/portal/scorecards');
      setScorecards(res.data.data || []);
    } catch {
      setScorecards(MOCK_SCORECARDS);
    } finally {
      setLoading(false);
    }
  }

  const published = scorecards.filter((s) => s.status === 'PUBLISHED');
  const periods = ['ALL', ...published.map((s) => s.period)];
  const filtered =
    selectedPeriod === 'ALL'
      ? scorecards.filter((s) => s.status === 'PUBLISHED')
      : scorecards.filter((s) => s.period === selectedPeriod && s.status === 'PUBLISHED');

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-56 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Performance Scorecards
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Supplier performance metrics by period
            </p>
          </div>
          <BarChart2 className="h-7 w-7 text-teal-500 mt-1 flex-shrink-0" />
        </div>

        {/* Period selector */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedPeriod === p
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {p === 'ALL' ? 'All Periods' : p}
            </button>
          ))}
        </div>

        {/* Draft notice */}
        {scorecards.some((s) => s.status === 'DRAFT') && (
          <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-400">
            {scorecards.filter((s) => s.status === 'DRAFT').length} scorecard(s) are currently in
            draft and not yet published.
          </div>
        )}

        {/* Scorecard cards */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((sc) => (
              <Card key={sc.id} className="border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                      {sc.period}
                    </CardTitle>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Published{' '}
                      {new Date(sc.publishedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {/* Overall score */}
                  <div className="mt-3 flex items-center gap-4">
                    <div className="text-center">
                      <p className={`text-4xl font-black ${overallColor(sc.overallScore)}`}>
                        {sc.overallScore}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Overall</p>
                    </div>
                    <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          sc.overallScore >= 90
                            ? 'bg-green-500'
                            : sc.overallScore >= 75
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${sc.overallScore}%` }}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Delivery
                      </p>
                      <ScoreBar score={sc.deliveryScore} color="bg-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Quality
                      </p>
                      <ScoreBar score={sc.qualityScore} color="bg-teal-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Communication
                      </p>
                      <ScoreBar score={sc.communicationScore} color="bg-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <BarChart2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No published scorecards</p>
            <p className="text-sm mt-1">Published scorecards will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
