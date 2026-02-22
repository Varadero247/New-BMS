'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ims/ui';
import { Shield, Loader2, TrendingDown } from 'lucide-react';
import { api } from '@/lib/api';

interface TreatmentStat {
  treatment: string;
  count: number;
}

const MOCK_DATA: TreatmentStat[] = [
  { treatment: 'MITIGATE', count: 23 },
  { treatment: 'ACCEPT', count: 12 },
  { treatment: 'TRANSFER', count: 7 },
  { treatment: 'AVOID', count: 5 },
  { treatment: 'ESCALATE', count: 3 },
];

const TREATMENT_META: Record<
  string,
  { label: string; color: string; barColor: string; description: string; icon: string }
> = {
  MITIGATE: {
    label: 'Mitigate',
    color: 'bg-blue-100 text-blue-700',
    barColor: 'bg-blue-500',
    description: 'Reduce the impact or likelihood of the risk through controls and action plans.',
    icon: 'M',
  },
  ACCEPT: {
    label: 'Accept',
    color: 'bg-green-100 text-green-700',
    barColor: 'bg-green-500',
    description: 'Tolerate the risk as it falls within acceptable risk appetite thresholds.',
    icon: 'A',
  },
  TRANSFER: {
    label: 'Transfer',
    color: 'bg-yellow-100 text-yellow-700',
    barColor: 'bg-yellow-500',
    description: 'Shift risk exposure to a third party via insurance, contracts, or outsourcing.',
    icon: 'T',
  },
  AVOID: {
    label: 'Avoid',
    color: 'bg-red-100 text-red-700',
    barColor: 'bg-red-500',
    description: 'Cease or redesign the activity that gives rise to the risk entirely.',
    icon: 'AV',
  },
  ESCALATE: {
    label: 'Escalate',
    color: 'bg-purple-100 text-purple-700',
    barColor: 'bg-purple-500',
    description: 'Escalate to senior management or the board for a risk beyond delegated authority.',
    icon: 'E',
  },
};

export default function TreatmentsClient() {
  const [data, setData] = useState<TreatmentStat[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTreatments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/treatments');
      const fetched: TreatmentStat[] = response.data.data || [];
      setData(fetched.length > 0 ? fetched : MOCK_DATA);
    } catch {
      setData(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTreatments();
  }, [loadTreatments]);

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const maxCount = sorted[0]?.count ?? 1;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Risk Treatment Breakdown
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                ISO 31000 treatment strategy distribution across the risk register
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Treatments</p>
            <p className="text-4xl font-bold text-blue-600">{loading ? '\u2014' : total}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : (
          <>
            {/* Stat cards — one per treatment type */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {sorted.map((item) => {
                const meta = TREATMENT_META[item.treatment];
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <Card key={item.treatment} className="relative overflow-hidden text-center">
                    <div className={`absolute top-0 left-0 right-0 h-1 ${meta?.barColor ?? 'bg-gray-400'}`} />
                    <CardContent className="pt-6 pb-5">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-xs font-bold ${meta?.color ?? 'bg-gray-100 text-gray-700'}`}
                      >
                        {meta?.icon ?? item.treatment[0]}
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {item.count}
                      </p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                        {meta?.label ?? item.treatment}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{pct}% of total</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Bar chart */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-200">
                  <TrendingDown className="h-5 w-5 text-blue-500" />
                  Treatment Strategy Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {sorted.map((item) => {
                  const meta = TREATMENT_META[item.treatment];
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  const barWidth = maxCount > 0 ? Math.round((item.count / maxCount) * 100) : 0;
                  return (
                    <div key={item.treatment}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${meta?.color ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {meta?.label ?? item.treatment}
                          </span>
                          <span className="text-xs text-gray-400 hidden md:inline truncate max-w-xs">
                            {meta?.description}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 tabular-nums ml-4">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-7 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        <div
                          className={`h-full rounded-lg transition-all duration-500 ${meta?.barColor ?? 'bg-gray-400'}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Detail table with descriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  Treatment Type Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Strategy</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">% of Total</TableHead>
                        <TableHead>Visual Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sorted.map((item) => {
                        const meta = TREATMENT_META[item.treatment];
                        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                        return (
                          <TableRow key={item.treatment}>
                            <TableCell>
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${meta?.color ?? 'bg-gray-100 text-gray-700'}`}
                              >
                                {meta?.label ?? item.treatment}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                              {meta?.description ?? '—'}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                              {item.count}
                            </TableCell>
                            <TableCell className="text-right text-gray-600 dark:text-gray-400 tabular-nums">
                              {pct}%
                            </TableCell>
                            <TableCell className="min-w-[140px]">
                              <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${meta?.barColor ?? 'bg-gray-400'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                        <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                          Total
                        </TableCell>
                        <TableCell />
                        <TableCell className="text-right font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                          {total}
                        </TableCell>
                        <TableCell className="text-right text-gray-600 dark:text-gray-400">
                          100%
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
