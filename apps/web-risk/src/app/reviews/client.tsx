'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
  Label,
  Select,
  Textarea,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ims/ui';
import { Plus, ClipboardCheck, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
const LIKELIHOODS = ['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'ALMOST_CERTAIN'] as const;
const CONSEQUENCES = ['INSIGNIFICANT', 'MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC'] as const;

interface Review {
  id: string;
  referenceNumber: string;
  riskId: string;
  reviewerName: string;
  scheduledDate: string;
  completedDate: string;
  status: string;
  newLikelihood: string;
  newConsequence: string;
  newScore: number;
  findings: string;
  recommendations: string;
  createdAt: string;
}

interface ReviewForm {
  riskId: string;
  reviewerName: string;
  scheduledDate: string;
  status: string;
  newLikelihood: string;
  newConsequence: string;
  findings: string;
  recommendations: string;
  notes: string;
}

const emptyForm: ReviewForm = {
  riskId: '',
  reviewerName: '',
  scheduledDate: new Date().toISOString().split('T')[0],
  status: 'SCHEDULED',
  newLikelihood: 'POSSIBLE',
  newConsequence: 'MODERATE',
  findings: '',
  recommendations: '',
  notes: '',
};

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ReviewForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadReviews = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      const response = await api.get('/reviews', { params });
      setReviews(response.data.data || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(review: Review) {
    setForm({
      riskId: review.riskId || '',
      reviewerName: review.reviewerName || '',
      scheduledDate: review.scheduledDate ? review.scheduledDate.split('T')[0] : '',
      status: review.status || 'SCHEDULED',
      newLikelihood: review.newLikelihood || 'POSSIBLE',
      newConsequence: review.newConsequence || 'MODERATE',
      findings: review.findings || '',
      recommendations: review.recommendations || '',
      notes: '',
    });
    setEditId(review.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.riskId || !form.scheduledDate) return;
    setSaving(true);
    try {
      const payload = { ...form, scheduledDate: new Date(form.scheduledDate).toISOString() };
      if (editId) {
        await api.put(`/reviews/${editId}`, payload);
      } else {
        await api.post('/reviews', payload);
      }
      setModalOpen(false);
      loadReviews();
    } catch (err) {
      console.error('Failed to save review:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      loadReviews();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Risk Reviews</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Schedule and track periodic risk reviews
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Schedule Review
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search reviews"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>New Score</TableHead>
                      <TableHead>Findings</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-mono text-xs">
                          {review.referenceNumber}
                        </TableCell>
                        <TableCell className="text-sm">
                          {review.scheduledDate
                            ? new Date(review.scheduledDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>{review.reviewerName || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              review.status === 'COMPLETED'
                                ? 'secondary'
                                : review.status === 'IN_PROGRESS'
                                  ? 'default'
                                  : 'outline'
                            }
                          >
                            {review.status?.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{review.newScore || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                          {review.findings || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(review)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(review.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ClipboardCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No reviews scheduled</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule First Review
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editId ? 'Edit Review' : 'Schedule Review'}
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <Label>Risk ID *</Label>
                <Input
                  value={form.riskId}
                  onChange={(e) => setForm((p) => ({ ...p, riskId: e.target.value }))}
                  placeholder="Enter risk ID or reference"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reviewer Name</Label>
                  <Input
                    value={form.reviewerName}
                    onChange={(e) => setForm((p) => ({ ...p, reviewerName: e.target.value }))}
                    placeholder="Reviewer name"
                  />
                </div>
                <div>
                  <Label>Scheduled Date *</Label>
                  <Input
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => setForm((p) => ({ ...p, scheduledDate: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>New Likelihood</Label>
                  <Select
                    value={form.newLikelihood}
                    onChange={(e) => setForm((p) => ({ ...p, newLikelihood: e.target.value }))}
                  >
                    {LIKELIHOODS.map((l) => (
                      <option key={l} value={l}>
                        {l.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>New Consequence</Label>
                  <Select
                    value={form.newConsequence}
                    onChange={(e) => setForm((p) => ({ ...p, newConsequence: e.target.value }))}
                  >
                    {CONSEQUENCES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <Label>Findings</Label>
                <Textarea
                  value={form.findings}
                  onChange={(e) => setForm((p) => ({ ...p, findings: e.target.value }))}
                  rows={3}
                  placeholder="Review findings..."
                />
              </div>
              <div>
                <Label>Recommendations</Label>
                <Textarea
                  value={form.recommendations}
                  onChange={(e) => setForm((p) => ({ ...p, recommendations: e.target.value }))}
                  rows={2}
                  placeholder="Recommendations..."
                />
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving || !form.riskId || !form.scheduledDate}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : editId ? (
                  'Update Review'
                ) : (
                  'Schedule Review'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
