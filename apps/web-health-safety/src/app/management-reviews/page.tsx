'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  ClipboardList,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  X,
  Calendar,
  User,
  Users,
  ChevronRight,
  Shield,
  AlertCircle,
} from 'lucide-react';

interface ManagementReview {
  id: string;
  refNumber: string;
  title: string;
  status: 'DRAFT' | 'COMPLETED' | 'APPROVED';
  reviewDate: string;
  chair?: string;
  attendees?: string;
  ohsPerformanceSummary?: string;
  incidentsSummary?: string;
  legalComplianceSummary?: string;
  objectivesReview?: string;
  resourcesReview?: string;
  decisions?: string;
  nextReviewDate?: string;
  createdAt?: string;
}

const MOCK_REVIEWS: ManagementReview[] = [
  {
    id: '1',
    refNumber: 'HS-MR-2026-01',
    title: 'Q1 2026 OHS Management Review',
    status: 'APPROVED',
    reviewDate: '2026-01-30T09:00:00Z',
    chair: 'CEO Jane Roberts',
    attendees: 'HR Director, H&S Manager, Operations Director, Site Managers',
    ohsPerformanceSummary: '12 near misses, 0 LTIs, 3 first-aid incidents in Q4 2025',
    incidentsSummary: 'All incidents investigated, no systemic failures identified',
    legalComplianceSummary: 'Full compliance - 2 new regulations monitored',
    objectivesReview: '8/10 OHS objectives met, 2 deferred to Q2',
    resourcesReview: 'H&S budget adequate, additional training budget approved for 2026',
    decisions: '1. Implement behavioural safety program by Q2; 2. Review lone worker policy by March; 3. Contractor management procedure update',
    nextReviewDate: '2026-04-30T09:00:00Z',
  },
  {
    id: '2',
    refNumber: 'HS-MR-2026-02',
    title: 'Q2 2026 OHS Management Review',
    status: 'DRAFT',
    reviewDate: '2026-04-30T09:00:00Z',
    chair: 'CEO Jane Roberts',
    attendees: 'HR Director, H&S Manager, Operations Director',
    decisions: '',
    nextReviewDate: '2026-07-31T09:00:00Z',
  },
  {
    id: '3',
    refNumber: 'HS-MR-2025-04',
    title: 'Q4 2025 OHS Management Review',
    status: 'COMPLETED',
    reviewDate: '2025-10-29T09:00:00Z',
    chair: 'COO Mike Chen',
    attendees: 'H&S Manager, Site Managers',
    ohsPerformanceSummary: '5 near misses, 1 LTI, improvement trend vs prior year',
    decisions: 'Update PPE matrix, new contractor induction process, ergonomic assessment program',
    nextReviewDate: '2026-01-30T09:00:00Z',
  },
  {
    id: '4',
    refNumber: 'HS-MR-2025-03',
    title: 'Q3 2025 OHS Management Review',
    status: 'APPROVED',
    reviewDate: '2025-07-31T09:00:00Z',
    chair: 'CEO Jane Roberts',
    attendees: 'All Senior Management',
    decisions: 'Risk assessment update complete, emergency drill scheduled, mental health first aider training approved',
    nextReviewDate: '2025-10-29T09:00:00Z',
  },
];

const statusConfig: Record<ManagementReview['status'], { label: string; color: string; icon: React.ElementType }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  COMPLETED: { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: Shield },
};

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Section({ title, content }: { title: string; content?: string }) {
  if (!content) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-rose-700 uppercase tracking-wide">{title}</p>
      <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
    </div>
  );
}

export default function ManagementReviewsPage() {
  const [reviews, setReviews] = useState<ManagementReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ManagementReview | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    reviewDate: '',
    chair: '',
    attendees: '',
    status: 'DRAFT' as ManagementReview['status'],
    ohsPerformanceSummary: '',
    incidentsSummary: '',
    legalComplianceSummary: '',
    objectivesReview: '',
    resourcesReview: '',
    decisions: '',
    nextReviewDate: '',
  });

  useEffect(() => {
    api.get('/management-reviews')
      .then((r) => setReviews(r.data.data))
      .catch(() => setReviews(MOCK_REVIEWS))
      .finally(() => setLoading(false));
  }, []);

  const total = reviews.length;
  const draft = reviews.filter((r) => r.status === 'DRAFT').length;
  const completed = reviews.filter((r) => r.status === 'COMPLETED').length;
  const approved = reviews.filter((r) => r.status === 'APPROVED').length;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const year = new Date(form.reviewDate).getFullYear();
    const nextNum = reviews.filter((r) => r.refNumber.includes(String(year))).length + 1;
    const refNumber = `HS-MR-${year}-${String(nextNum).padStart(2, '0')}`;
    try {
      const r = await api.post('/management-reviews', { ...form, refNumber });
      setReviews((prev) => [r.data.data, ...prev]);
    } catch {
      setReviews((prev) => [{ ...form, id: String(Date.now()), refNumber }, ...prev]);
    } finally {
      setSubmitting(false);
      setShowAdd(false);
      setForm({
        title: '', reviewDate: '', chair: '', attendees: '', status: 'DRAFT',
        ohsPerformanceSummary: '', incidentsSummary: '', legalComplianceSummary: '',
        objectivesReview: '', resourcesReview: '', decisions: '', nextReviewDate: '',
      });
    }
  }

  return (
    <div className="min-h-screen bg-rose-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-rose-900 flex items-center gap-2">
              <ClipboardList className="h-7 w-7 text-rose-600" />
              OHS Management Reviews
            </h1>
            <p className="text-sm text-rose-700 mt-1">ISO 45001:2018 — Management Review Programme</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Review
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <ClipboardList className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{total}</p>
                <p className="text-xs text-gray-500">Total Reviews</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-2xl font-bold text-gray-700">{draft}</p>
                <p className="text-xs text-gray-500">Draft</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-200">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{completed}</p>
                <p className="text-xs text-blue-600">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-green-200">
            <CardContent className="p-4 flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-700">{approved}</p>
                <p className="text-xs text-green-600">Approved</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-rose-500">Loading reviews...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => {
              const cfg = statusConfig[review.status];
              const StatusIcon = cfg.icon;
              return (
                <Card
                  key={review.id}
                  className="bg-white border-rose-100 hover:border-rose-300 transition-colors cursor-pointer"
                  onClick={() => setSelected(review)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-mono text-rose-500 mb-1">{review.refNumber}</p>
                        <CardTitle className="text-base text-rose-900 leading-snug">{review.title}</CardTitle>
                      </div>
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium shrink-0 ${cfg.color}`}>
                        <StatusIcon className="h-3 w-3" />{cfg.label}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-rose-400" />
                        {fmt(review.reviewDate)}
                      </span>
                      {review.chair && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-rose-400" />
                          {review.chair}
                        </span>
                      )}
                    </div>
                    {review.attendees && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="h-3 w-3 text-rose-300 shrink-0" />
                        <span className="truncate">{review.attendees}</span>
                      </div>
                    )}
                    {review.decisions && (
                      <p className="text-xs text-gray-600 line-clamp-2 border-t border-rose-50 pt-2">
                        <span className="font-medium text-rose-700">Decisions: </span>
                        {review.decisions}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      {review.nextReviewDate && (
                        <p className="text-xs text-gray-400">
                          Next: {fmt(review.nextReviewDate)}
                        </p>
                      )}
                      <span className="flex items-center gap-1 text-xs text-rose-500 ml-auto">
                        View details <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {reviews.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-400">
                <AlertCircle className="h-10 w-10 mx-auto mb-2 text-rose-200" />
                No reviews found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-rose-100">
              <div>
                <p className="text-xs font-mono text-rose-500">{selected.refNumber}</p>
                <h2 className="text-lg font-semibold text-rose-900">{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-gray-500">Review Date</p>
                  <p className="font-medium text-gray-800">{fmt(selected.reviewDate)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Status</p>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${statusConfig[selected.status].color}`}>
                    {selected.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Chair</p>
                  <p className="text-gray-800">{selected.chair || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Next Review</p>
                  <p className="text-gray-800">{fmt(selected.nextReviewDate)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-medium text-gray-500">Attendees</p>
                  <p className="text-gray-800">{selected.attendees || '—'}</p>
                </div>
              </div>
              <div className="border-t border-rose-50 pt-4 space-y-4">
                <Section title="OHS Performance Summary" content={selected.ohsPerformanceSummary} />
                <Section title="Incidents Summary" content={selected.incidentsSummary} />
                <Section title="Legal Compliance Summary" content={selected.legalComplianceSummary} />
                <Section title="Objectives Review" content={selected.objectivesReview} />
                <Section title="Resources Review" content={selected.resourcesReview} />
                <Section title="Decisions & Actions" content={selected.decisions} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Review Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-rose-100">
              <h2 className="text-lg font-semibold text-rose-900 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-rose-600" /> New Management Review
              </h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Review Title *</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Q3 2026 OHS Management Review"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Review Date *</label>
                    <input required type="datetime-local" value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ManagementReview['status'] })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
                      <option value="DRAFT">DRAFT</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="APPROVED">APPROVED</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Chair *</label>
                  <input required value={form.chair} onChange={(e) => setForm({ ...form, chair: e.target.value })}
                    placeholder="e.g. CEO Jane Roberts"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Attendees</label>
                  <input value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                    placeholder="Comma-separated list of attendees"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Next Review Date</label>
                  <input type="datetime-local" value={form.nextReviewDate} onChange={(e) => setForm({ ...form, nextReviewDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Decisions</label>
                  <textarea value={form.decisions} onChange={(e) => setForm({ ...form, decisions: e.target.value })}
                    rows={3} placeholder="Key decisions and actions from the review..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60">
                  {submitting ? 'Saving...' : 'Create Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
