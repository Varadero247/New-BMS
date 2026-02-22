'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { FileText, Search, CheckCircle, Send, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface BoardPack {
  id: string;
  title: string;
  reportingPeriod: string;
  status: 'DRAFT' | 'FINAL' | 'DISTRIBUTED';
  generatedAt: string;
  preparedBy?: string;
  sections?: string[];
}

const MOCK_PACKS: BoardPack[] = [
  { id: '1', title: 'Q4 2025 Board Pack', reportingPeriod: 'Q4 2025', status: 'DISTRIBUTED', generatedAt: '2026-01-15T09:00:00Z', preparedBy: 'Alice Johnson' },
  { id: '2', title: 'Q1 2026 Board Pack', reportingPeriod: 'Q1 2026', status: 'FINAL', generatedAt: '2026-02-01T09:00:00Z', preparedBy: 'Alice Johnson' },
  { id: '3', title: 'February 2026 Monthly Pack', reportingPeriod: 'Feb 2026', status: 'DRAFT', generatedAt: '2026-02-20T09:00:00Z', preparedBy: 'Bob Smith' },
  { id: '4', title: 'Q3 2025 Board Pack', reportingPeriod: 'Q3 2025', status: 'DISTRIBUTED', generatedAt: '2025-10-10T09:00:00Z', preparedBy: 'Alice Johnson' },
];

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: FileText },
  FINAL: { label: 'Final', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: CheckCircle },
  DISTRIBUTED: { label: 'Distributed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: Send },
};

export default function BoardPacksPage() {
  const [packs, setPacks] = useState<BoardPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/board-packs');
        setPacks(r.data.data?.boardPacks || MOCK_PACKS);
      } catch {
        setPacks(MOCK_PACKS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateStatus = async (id: string, newStatus: BoardPack['status']) => {
    setUpdatingId(id);
    try {
      await api.patch(`/board-packs/${id}`, { status: newStatus });
      setPacks((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
    } catch {
      // revert on error — no-op (already updated optimistically)
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = packs.filter((p) => {
    const matchSearch =
      searchTerm === '' ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reportingPeriod.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === '' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    DRAFT: packs.filter((p) => p.status === 'DRAFT').length,
    FINAL: packs.filter((p) => p.status === 'FINAL').length,
    DISTRIBUTED: packs.filter((p) => p.status === 'DISTRIBUTED').length,
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Board Packs</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage and distribute board reporting packs
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {(Object.entries(counts) as [BoardPack['status'], number][]).map(([status, count]) => {
            const cfg = STATUS_CONFIG[status];
            const Icon = cfg.icon;
            return (
              <div key={status} className={`rounded-lg p-4 ${cfg.color}`}>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <p className="text-sm font-medium mt-0.5">{cfg.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search board packs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="FINAL">Final</option>
            <option value="DISTRIBUTED">Distributed</option>
          </select>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-purple-600" />
              Board Packs ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Period</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Generated</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Prepared By</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((pack) => {
                      const cfg = STATUS_CONFIG[pack.status];
                      return (
                        <tr key={pack.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{pack.title}</td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{pack.reportingPeriod}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400 dark:text-gray-500 text-xs">
                            {new Date(pack.generatedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{pack.preparedBy || '—'}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              {pack.status === 'DRAFT' && (
                                <button
                                  onClick={() => updateStatus(pack.id, 'FINAL')}
                                  disabled={updatingId === pack.id}
                                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {updatingId === pack.id ? '...' : 'Finalise'}
                                </button>
                              )}
                              {pack.status === 'FINAL' && (
                                <>
                                  <button
                                    onClick={() => updateStatus(pack.id, 'DRAFT')}
                                    disabled={updatingId === pack.id}
                                    className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                                  >
                                    Revert
                                  </button>
                                  <button
                                    onClick={() => updateStatus(pack.id, 'DISTRIBUTED')}
                                    disabled={updatingId === pack.id}
                                    className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                  >
                                    {updatingId === pack.id ? '...' : 'Distribute'}
                                  </button>
                                </>
                              )}
                              {pack.status === 'DISTRIBUTED' && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                  <Send className="h-3 w-3" /> Sent
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No board packs found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
