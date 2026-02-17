'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@ims/ui';
import { ShieldAlert, Plus, Search, ChevronRight } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface CoshhAssessment {
  id: string;
  reference: string;
  chemicalName: string;
  activity: string;
  riskLevel: string;
  status: string;
  reviewDate: string;
}

const riskBadgeClass: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  VERY_HIGH: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const statusBadgeClass: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  PENDING_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  SUPERSEDED: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

export default function CoshhListPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<CoshhAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        const res = await api.get('/coshh', { params });
        setAssessments(res.data.data || []);
      } catch (e: unknown) {
        setError(e.response?.status === 401 ? 'Session expired.' : 'Failed to load COSHH assessments.');
      } finally {
        setLoading(false);
      }
    })();
  }, [search]);

  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  if (loading) {
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">COSHH Assessments</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Control of Substances Hazardous to Health assessments
              </p>
            </div>
            <button
              onClick={() => router.push('/coshh/new')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Assessment
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
                  placeholder="Search by reference, chemical or activity..."
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
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Reference</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Chemical</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Activity</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Risk Level</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Review Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-500 dark:text-gray-400">
                          No COSHH assessments found. Create your first assessment to get started.
                        </td>
                      </tr>
                    ) : (
                      assessments.map((a) => {
                        const overdue = isOverdue(a.reviewDate) && a.status === 'APPROVED';
                        return (
                          <tr
                            key={a.id}
                            onClick={() => router.push(`/coshh/${a.id}`)}
                            className={`border-b border-gray-100 dark:border-gray-700/50 cursor-pointer transition-colors ${
                              overdue
                                ? 'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <ShieldAlert className={`h-4 w-4 ${overdue ? 'text-red-500' : 'text-gray-400'}`} />
                                <span className="font-mono text-xs font-medium text-gray-900 dark:text-gray-100">{a.reference}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{a.chemicalName}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.activity}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${riskBadgeClass[a.riskLevel] || 'bg-gray-100 text-gray-800'}`}>
                                {a.riskLevel?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadgeClass[a.status] || 'bg-gray-100 text-gray-800'}`}>
                                {a.status?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                                {a.reviewDate ? new Date(a.reviewDate).toLocaleDateString() : '-'}
                                {overdue && ' (OVERDUE)'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
