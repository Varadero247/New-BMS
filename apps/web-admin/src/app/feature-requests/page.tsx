'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { ThumbsUp, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  votes: number;
  status: string;
  priority: string;
  requestedBy: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['SUBMITTED', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'SHIPPED', 'DECLINED'];
const FILTER_TABS = ['All', 'SUBMITTED', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'SHIPPED', 'DECLINED'];

const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-gray-500/20 text-gray-400',
  UNDER_REVIEW: 'bg-yellow-500/20 text-yellow-400',
  PLANNED: 'bg-blue-500/20 text-blue-400',
  IN_PROGRESS: 'bg-cyan-500/20 text-cyan-400',
  SHIPPED: 'bg-green-500/20 text-green-400',
  DECLINED: 'bg-red-500/20 text-red-400',
};

const priorityColors: Record<string, string> = {
  LOW: 'text-gray-400',
  MEDIUM: 'text-yellow-400',
  HIGH: 'text-orange-400',
  CRITICAL: 'text-red-400',
};

export default function FeatureRequestsPage() {
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (activeFilter !== 'All') params.status = activeFilter;

      const res = await api.get('/api/analytics/feature-requests', { params });
      setRequests(res.data.data?.featureRequests || []);
      setTotalPages(res.data.data?.pagination?.totalPages || 1);
      setError('');
    } catch {
      setError('Failed to load feature requests.');
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleVote = async (id: string) => {
    try {
      await api.post(`/api/analytics/feature-requests/${id}/vote`);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, votes: r.votes + 1 } : r))
      );
    } catch {
      // Silently fail
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/analytics/feature-requests/${id}`, { status: newStatus });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="min-h-screen bg-[#080B12]">
      <Sidebar />
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Feature Requests</h1>
            <p className="text-gray-400 mt-1">Track and manage customer feature requests</p>
          </div>
          <button
            onClick={fetchRequests}
            className="p-2 bg-[#112240] border border-[#1B3A6B]/30 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 bg-[#112240] rounded-lg p-1 w-fit flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveFilter(tab); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeFilter === tab ? 'bg-[#1B3A6B] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'All' ? 'All' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1B3A6B]/30">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Title</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium w-20">Votes</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium w-32">Status</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium w-24">Priority</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium w-36">Requested By</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">Loading...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">No feature requests found</td>
                </tr>
              ) : (
                requests.map((req) => (
                  <>
                    <tr
                      key={req.id}
                      className="border-b border-[#1B3A6B]/10 hover:bg-[#1B3A6B]/10 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                    >
                      <td className="py-3 px-4 text-white font-medium">
                        <div className="flex items-center gap-2">
                          {expandedId === req.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          )}
                          {req.title}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleVote(req.id); }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="font-medium">{req.votes}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[req.status] || 'bg-gray-500/20 text-gray-400'}`}>
                          {req.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium ${priorityColors[req.priority] || 'text-gray-400'}`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-sm truncate max-w-[144px]">{req.requestedBy}</td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={req.status}
                          onChange={(e) => handleStatusUpdate(req.id, e.target.value)}
                          className="bg-[#080B12] border border-[#1B3A6B]/30 text-gray-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    {expandedId === req.id && (
                      <tr key={`${req.id}-desc`} className="border-b border-[#1B3A6B]/10">
                        <td colSpan={6} className="py-4 px-8 bg-[#080B12]/50">
                          <p className="text-gray-400 text-sm whitespace-pre-wrap">
                            {req.description || 'No description provided.'}
                          </p>
                          {req.createdAt && (
                            <p className="text-gray-600 text-xs mt-2">
                              Created: {new Date(req.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 bg-[#112240] border border-[#1B3A6B]/30 rounded text-sm text-gray-400 hover:text-white disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-gray-400 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 bg-[#112240] border border-[#1B3A6B]/30 rounded text-sm text-gray-400 hover:text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
