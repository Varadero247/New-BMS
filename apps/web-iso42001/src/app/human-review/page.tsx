'use client';

import { useEffect, useState, useCallback } from 'react';
import { AIDisclosure } from '@ims/ui';
import { api } from '@/lib/api';

interface HumanReview {
  id: string;
  systemId: string;
  title: string;
  description: string | null;
  aiDecision: string;
  aiConfidence: number | null;
  aiReasoning: string | null;
  status: string;
  reviewerUserId: string | null;
  reviewerName: string | null;
  decision: string | null;
  justification: string | null;
  reviewedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  ESCALATED: 'bg-blue-100 text-blue-700',
  EXPIRED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

export default function HumanReviewPage() {
  const [reviews, setReviews] = useState<HumanReview[]>([]);
  const [pendingReviews, setPendingReviews] = useState<HumanReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeReview, setActiveReview] = useState<HumanReview | null>(null);
  const [decisionForm, setDecisionForm] = useState({
    decision: 'APPROVED' as string,
    justification: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '25' };
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;
      const res = await api.get('/human-review', { params });
      setReviews(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch {
      /* empty */
    }
    setLoading(false);
  }, [page, filterStatus, search]);

  const fetchPending = useCallback(async () => {
    try {
      const res = await api.get('/human-review/pending');
      setPendingReviews(res.data.data);
    } catch {
      /* empty */
    }
  }, []);

  useEffect(() => {
    fetchReviews();
    fetchPending();
  }, [fetchReviews, fetchPending]);

  const handleDecide = async () => {
    if (!activeReview || !decisionForm.justification.trim()) return;
    setSubmitting(true);
    try {
      await api.put(`/human-review/${activeReview.id}/decide`, decisionForm);
      setActiveReview(null);
      fetchReviews();
      fetchPending();
    } catch {
      /* empty */
    }
    setSubmitting(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Human Review Gate</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          ISO 42001:2023 — Human oversight of AI decisions
        </p>
      </div>

      {/* Pending alert */}
      {pendingReviews.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-800">
            {pendingReviews.length} review{pendingReviews.length > 1 ? 's' : ''} awaiting your
            decision
          </h3>
          <div className="mt-2 space-y-2">
            {pendingReviews.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-white dark:bg-gray-900 rounded border p-3"
              >
                <div>
                  <div className="font-medium text-sm">{r.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    AI Decision: {r.aiDecision}
                    {r.aiConfidence !== null && ` (${Math.round(r.aiConfidence * 100)}%)`}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveReview(r);
                    setDecisionForm({ decision: 'APPROVED', justification: '' });
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED', 'EXPIRED'].map((status) => (
          <div key={status} className="bg-white dark:bg-gray-900 rounded-lg border p-4">
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {reviews.filter((r) => r.status === status).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{status}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            aria-label="Search reviews..."
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED', 'EXPIRED'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Reviews table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                  Title
                </th>
                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                  AI Decision
                </th>
                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                  Confidence
                </th>
                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                  Reviewer
                </th>
                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No reviews found
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:bg-gray-800">
                    <td className="p-3 font-medium">{r.title}</td>
                    <td className="p-3 text-gray-600 max-w-xs truncate">{r.aiDecision}</td>
                    <td className="p-3">
                      {r.aiConfidence !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-full rounded-full ${r.aiConfidence >= 0.8 ? 'bg-green-500' : r.aiConfidence >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${r.aiConfidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs">{Math.round(r.aiConfidence * 100)}%</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[r.status]}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{r.reviewerName || '—'}</td>
                    <td className="p-3">
                      {r.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            setActiveReview(r);
                            setDecisionForm({ decision: 'APPROVED', justification: '' });
                          }}
                          className="px-3 py-1 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm rounded-md border disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400 py-1.5">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm rounded-md border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Decision modal */}
      {activeReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setActiveReview(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold">Review: {activeReview.title}</h2>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <AIDisclosure
                  variant="inline"
                  provider="claude"
                  analysisType="Human Review Assessment"
                  confidence={activeReview.aiConfidence ?? 0.85}
                />
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mt-2">
                  AI Decision
                </p>
                <p className="text-sm">{activeReview.aiDecision}</p>
                {activeReview.aiConfidence !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Confidence:</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${activeReview.aiConfidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {Math.round(activeReview.aiConfidence * 100)}%
                    </span>
                  </div>
                )}
                {activeReview.aiReasoning && (
                  <>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mt-2">
                      AI Reasoning
                    </p>
                    <p className="text-sm text-gray-600">{activeReview.aiReasoning}</p>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Decision
                  </label>
                  <div className="flex gap-2">
                    {['APPROVED', 'REJECTED', 'ESCALATED'].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDecisionForm((f) => ({ ...f, decision: d }))}
                        className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                          decisionForm.decision === d
                            ? d === 'APPROVED'
                              ? 'bg-green-600 text-white border-green-600'
                              : d === 'REJECTED'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {d === 'APPROVED' ? 'Approve' : d === 'REJECTED' ? 'Reject' : 'Escalate'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Justification *
                  </label>
                  <textarea
                    value={decisionForm.justification}
                    onChange={(e) =>
                      setDecisionForm((f) => ({ ...f, justification: e.target.value }))
                    }
                    placeholder="Provide your justification..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[80px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setActiveReview(null)}
                  className="px-4 py-2 text-sm rounded-md border"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDecide}
                  disabled={!decisionForm.justification.trim() || submitting}
                  className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Decision'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
