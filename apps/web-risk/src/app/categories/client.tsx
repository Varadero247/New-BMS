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
  Badge,
} from '@ims/ui';
import { Tag, TrendingUp, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface CategoryStat {
  category: string;
  count: number;
}

const MOCK_DATA: CategoryStat[] = [
  { category: 'STRATEGIC', count: 8 },
  { category: 'OPERATIONAL', count: 15 },
  { category: 'FINANCIAL', count: 6 },
  { category: 'COMPLIANCE', count: 4 },
  { category: 'REPUTATIONAL', count: 3 },
  { category: 'ENVIRONMENTAL', count: 5 },
  { category: 'HEALTH_SAFETY', count: 7 },
  { category: 'INFORMATION_SECURITY', count: 9 },
  { category: 'QUALITY', count: 11 },
  { category: 'SUPPLY_CHAIN', count: 6 },
];

const CATEGORY_COLORS: Record<string, string> = {
  STRATEGIC: 'bg-purple-500',
  OPERATIONAL: 'bg-blue-500',
  FINANCIAL: 'bg-green-500',
  COMPLIANCE: 'bg-yellow-500',
  REPUTATIONAL: 'bg-pink-500',
  ENVIRONMENTAL: 'bg-teal-500',
  HEALTH_SAFETY: 'bg-orange-500',
  INFORMATION_SECURITY: 'bg-red-500',
  QUALITY: 'bg-indigo-500',
  SUPPLY_CHAIN: 'bg-cyan-500',
};

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  STRATEGIC: 'bg-purple-100 text-purple-700',
  OPERATIONAL: 'bg-blue-100 text-blue-700',
  FINANCIAL: 'bg-green-100 text-green-700',
  COMPLIANCE: 'bg-yellow-100 text-yellow-700',
  REPUTATIONAL: 'bg-pink-100 text-pink-700',
  ENVIRONMENTAL: 'bg-teal-100 text-teal-700',
  HEALTH_SAFETY: 'bg-orange-100 text-orange-700',
  INFORMATION_SECURITY: 'bg-red-100 text-red-700',
  QUALITY: 'bg-indigo-100 text-indigo-700',
  SUPPLY_CHAIN: 'bg-cyan-100 text-cyan-700',
};

function formatCategory(cat: string): string {
  return cat
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export default function CategoriesClient() {
  const [data, setData] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      const fetched: CategoryStat[] = response.data.data || [];
      setData(fetched.length > 0 ? fetched : MOCK_DATA);
    } catch {
      // API not available — fall back to illustrative mock data
      setData(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const maxCount = sorted[0]?.count ?? 1;
  const top3 = sorted.slice(0, 3);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Tag className="h-7 w-7 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Risk Category Breakdown
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Distribution of risks across ISO 31000 categories
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Risks</p>
            <p className="text-4xl font-bold text-purple-600">{loading ? '\u2014' : total}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : (
          <>
            {/* Top 3 stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {top3.map((item, idx) => {
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                const medals = ['1st', '2nd', '3rd'];
                return (
                  <Card key={item.category} className="relative overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 ${CATEGORY_COLORS[item.category] ?? 'bg-gray-400'}`}
                    />
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                            {medals[idx]} Highest
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {formatCategory(item.category)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {item.count} risks &middot; {pct}% of total
                          </p>
                        </div>
                        <span className="text-3xl font-bold text-gray-700 dark:text-gray-300">
                          {item.count}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Bar chart */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-200">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Risk Distribution by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sorted.map((item) => {
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  const barWidth = maxCount > 0 ? Math.round((item.count / maxCount) * 100) : 0;
                  return (
                    <div key={item.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-52 truncate">
                          {formatCategory(item.category)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 tabular-nums">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${CATEGORY_COLORS[item.category] ?? 'bg-gray-400'}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Detail table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  Category Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Risk Count</TableHead>
                        <TableHead className="text-right">% of Total</TableHead>
                        <TableHead>Share (visual)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sorted.map((item) => {
                        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                        return (
                          <TableRow key={item.category}>
                            <TableCell>
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_BADGE_COLORS[item.category] ?? 'bg-gray-100 text-gray-700'}`}
                              >
                                {formatCategory(item.category)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                              {item.count}
                            </TableCell>
                            <TableCell className="text-right text-gray-600 dark:text-gray-400 tabular-nums">
                              {pct}%
                            </TableCell>
                            <TableCell className="min-w-[160px]">
                              <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${CATEGORY_COLORS[item.category] ?? 'bg-gray-400'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="font-semibold bg-gray-50 dark:bg-gray-800/50">
                        <TableCell>
                          <Badge variant="outline">Total</Badge>
                        </TableCell>
                        <TableCell className="text-right text-gray-900 dark:text-gray-100 tabular-nums">
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
