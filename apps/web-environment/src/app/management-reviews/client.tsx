'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  ClipboardCheck,
  Plus,
  X,
  CheckCircle,
  Clock,
  FileEdit,
  Calendar,
  User,
  Users,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';

type ReviewStatus = 'DRAFT' | 'SCHEDULED' | 'COMPLETED';

interface ManagementReview {
  id: string;
  refNumber: string;
  title: string;
  reviewDate: string;
  chair: string;
  attendees?: string;
  status: ReviewStatus;
  inputs?: string;
  outputs?: string;
  decisions?: string;
  nextReviewDate?: string;
  createdAt?: string;
}

const MOCK_REVIEWS: ManagementReview[] = [
  {
    id: '1',
    refNumber: 'ENV-MR-2601-0001',
    title: 'Annual Management Review 2025',
    reviewDate: '2026-01-30T00:00:00Z',
    chair: 'CEO',
    attendees: 'CEO, CFO, Environment Manager, Quality Director',
    status: 'COMPLETED',
    decisions:
      'Approved environmental objectives for 2026, increased budget for waste reduction initiatives',
    nextReviewDate: '2027-01-30T00:00:00Z',
  },
  {
    id: '2',
    refNumber: 'ENV-MR-2602-0001',
    title: 'Q1 2026 Management Review',
    reviewDate: '2026-03-31T00:00:00Z',
    chair: 'CEO',
    attendees: 'CEO, Environment Manager, Operations Director',
    status: 'SCHEDULED',
  },
  {
    id: '3',
    refNumber: 'ENV-MR-2606-0001',
    title: 'Mid-Year Review',
    reviewDate: '2026-06-30T00:00:00Z',
    chair: 'CEO',
    status: 'DRAFT',
  },
];

function StatusBadge({ status }: { status: ReviewStatus }) {
  const config: Record<ReviewStatus, { label: string; classes: string; icon: React.ReactNode }> = {
    COMPLETED: {
      label: 'Completed',
      classes: 'bg-green-100 text-green-800',
      icon: <CheckCircle className="h-3 w-3" />,
    },
    SCHEDULED: {
      label: 'Scheduled',
      classes: 'bg-blue-100 text-blue-800',
      icon: <Clock className="h-3 w-3" />,
    },
    DRAFT: {
      label: 'Draft',
      classes: 'bg-gray-100 text-gray-600',
      icon: <FileEdit className="h-3 w-3" />,
    },
  };
  const { label, classes, icon } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {icon} {label}
    </span>
  );
}

function ReviewCard({ review, onClick }: { review: ManagementReview; onClick: () => void }) {
  return (
    <Card
      className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-gray-400">{review.refNumber}</p>
            <CardTitle className="text-base font-semibold text-gray-900 mt-0.5 leading-snug">
              {review.title}
            </CardTitle>
          </div>
          <StatusBadge status={review.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Review Date: <span className="font-medium text-gray-900">{new Date(review.reviewDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Chair: <span className="font-medium text-gray-900">{review.chair}</span></span>
          </div>
          {review.attendees && (
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-gray-500 leading-relaxed">{review.attendees}</span>
            </div>
          )}
          {review.decisions && (
            <div className="mt-3 rounded-md bg-green-50 border border-green-100 p-3">
              <p className="text-xs font-semibold text-green-700 mb-1">Key Decisions</p>
              <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{review.decisions}</p>
            </div>
          )}
          {review.nextReviewDate && (
            <p className="text-xs text-gray-400 mt-2">
              Next review: {new Date(review.nextReviewDate).toLocaleDateString('en-GB')}
            </p>
          )}
        </div>
        <div className="flex justify-end mt-3">
          <span className="text-xs text-green-600 font-medium group-hover:underline flex items-center gap-1">
            View details <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ManagementReviewsClient() {
  const [reviews, setReviews] = useState<ManagementReview[]>(MOCK_REVIEWS);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailReview, setDetailReview] = useState<ManagementReview | null>(null);

  const [form, setForm] = useState({
    title: '',
    reviewDate: '',
    chair: '',
    attendees: '',
    inputs: '',
    outputs: '',
    decisions: '',
    nextReviewDate: '',
  });

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const r = await api.get('/management-reviews');
        setReviews(r.data.data);
      } catch {
        // Fall back to mock data
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.reviewDate || !form.chair.trim()) {
      setError('Title, review date, and chair are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const r = await api.post('/management-reviews', form);
      setReviews((prev) => [r.data.data, ...prev]);
      setModalOpen(false);
      setForm({ title: '', reviewDate: '', chair: '', attendees: '', inputs: '', outputs: '', decisions: '', nextReviewDate: '' });
    } catch {
      setError('Failed to create review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const completed = reviews.filter((r) => r.status === 'COMPLETED').length;
  const scheduled = reviews.filter((r) => r.status === 'SCHEDULED').length;
  const draft = reviews.filter((r) => r.status === 'DRAFT').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="h-7 w-7 text-green-600" />
            Management Reviews
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ISO 14001:2015 Cl. 9.3 — Top management reviews of the environmental management system
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Review
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Completed</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{completed}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Scheduled</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{scheduled}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-300">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Draft</p>
            <p className="mt-1 text-2xl font-bold text-gray-600">{draft}</p>
          </CardContent>
        </Card>
      </div>

      {/* Review Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <ClipboardCheck className="h-12 w-12 mb-3" />
          <p className="text-lg font-medium">No management reviews yet</p>
          <p className="text-sm">Add a management review to track top management decisions.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((rev) => (
            <ReviewCard key={rev.id} review={rev} onClick={() => setDetailReview(rev)} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {detailReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-lg rounded-lg bg-white shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs font-mono text-gray-400">{detailReview.refNumber}</p>
                <h2 className="text-lg font-semibold text-gray-900 mt-0.5">{detailReview.title}</h2>
              </div>
              <button onClick={() => setDetailReview(null)} className="text-gray-400 hover:text-gray-600 ml-4">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <StatusBadge status={detailReview.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Review Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(detailReview.reviewDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Chair</p>
                  <p className="font-medium text-gray-900">{detailReview.chair}</p>
                </div>
              </div>

              {detailReview.attendees && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Attendees</p>
                  <p className="text-sm text-gray-700">{detailReview.attendees}</p>
                </div>
              )}

              {detailReview.inputs && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Inputs</p>
                  <p className="text-sm text-gray-700 rounded-md bg-gray-50 p-3">{detailReview.inputs}</p>
                </div>
              )}

              {detailReview.outputs && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Outputs</p>
                  <p className="text-sm text-gray-700 rounded-md bg-gray-50 p-3">{detailReview.outputs}</p>
                </div>
              )}

              {detailReview.decisions && (
                <div>
                  <p className="text-xs font-semibold text-green-700 mb-1 uppercase tracking-wide">Decisions</p>
                  <p className="text-sm text-gray-700 rounded-md bg-green-50 border border-green-100 p-3">
                    {detailReview.decisions}
                  </p>
                </div>
              )}

              {detailReview.nextReviewDate && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Next Review Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(detailReview.nextReviewDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setDetailReview(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-lg rounded-lg bg-white shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Add Management Review</h2>
              <button
                onClick={() => { setModalOpen(false); setError(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Annual Management Review 2026"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.reviewDate}
                    onChange={(e) => setForm((f) => ({ ...f, reviewDate: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chair <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.chair}
                    onChange={(e) => setForm((f) => ({ ...f, chair: e.target.value }))}
                    placeholder="e.g. CEO"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
                <input
                  type="text"
                  value={form.attendees}
                  onChange={(e) => setForm((f) => ({ ...f, attendees: e.target.value }))}
                  placeholder="e.g. CEO, CFO, Environment Manager"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inputs</label>
                <textarea
                  value={form.inputs}
                  onChange={(e) => setForm((f) => ({ ...f, inputs: e.target.value }))}
                  rows={2}
                  placeholder="Audit results, environmental performance data, legal compliance status..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Outputs</label>
                <textarea
                  value={form.outputs}
                  onChange={(e) => setForm((f) => ({ ...f, outputs: e.target.value }))}
                  rows={2}
                  placeholder="Conclusions on EMS suitability, adequacy and effectiveness..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Decisions</label>
                <textarea
                  value={form.decisions}
                  onChange={(e) => setForm((f) => ({ ...f, decisions: e.target.value }))}
                  rows={2}
                  placeholder="Actions and resource decisions from the review..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Review Date</label>
                <input
                  type="date"
                  value={form.nextReviewDate}
                  onChange={(e) => setForm((f) => ({ ...f, nextReviewDate: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setError(null); }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
