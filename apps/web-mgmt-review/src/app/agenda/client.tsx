'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Textarea,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell } from '@ims/ui';
import { ListChecks, Loader2, Search, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

const STATUSES = ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

interface Review {
  id: string;
  referenceNumber: string;
  title: string;
  status: string;
  scheduledDate: string;
  chairpersonName: string;
  aiGeneratedAgenda: string;
}

interface AgendaData {
  title: string;
  items: string[];
  aiNote?: string;
}

export default function AgendaClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaData | null>(null);
  const [selectedReviewTitle, setSelectedReviewTitle] = useState('');

  const loadReviews = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/reviews', { params });
      setReviews(response.data.data || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  async function handleGenerateAgenda(reviewId: string) {
    setGeneratingId(reviewId);
    try {
      const response = await api.post(`/agenda/${reviewId}/generate`);
      const agenda = response.data.data;
      if (agenda) {
        setSelectedAgenda(agenda);
        const review = reviews.find((r) => r.id === reviewId);
        setSelectedReviewTitle(review?.title || '');
        setViewModalOpen(true);
      }
      loadReviews();
    } catch (err) {
      console.error('Failed to generate agenda:', err);
    } finally {
      setGeneratingId(null);
    }
  }

  function viewAgenda(review: Review) {
    if (!review.aiGeneratedAgenda) return;
    try {
      const agenda = JSON.parse(review.aiGeneratedAgenda);
      setSelectedAgenda(agenda);
      setSelectedReviewTitle(review.title);
      setViewModalOpen(true);
    } catch {
      console.error('Failed to parse agenda data');
    }
  }

  function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (status) {
      case 'COMPLETED':
        return 'secondary';
      case 'IN_PROGRESS':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Review Agenda</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Generate and manage meeting agendas for management reviews
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{reviews.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-slate-600">
                {reviews.filter((r) => r.aiGeneratedAgenda).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">With Agenda</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {reviews.filter((r) => !r.aiGeneratedAgenda).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Agenda</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search reviews"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
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
                      <TableHead>Review Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Agenda</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-mono text-xs">
                          {review.referenceNumber}
                        </TableCell>
                        <TableCell className="font-medium">{review.title}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(review.status)}>
                            {(review.status || '-').replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {review.scheduledDate
                            ? new Date(review.scheduledDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {review.aiGeneratedAgenda ? (
                            <Badge
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => viewAgenda(review)}
                            >
                              Generated
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not Generated</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {review.aiGeneratedAgenda ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewAgenda(review)}
                              >
                                View Agenda
                              </Button>
                            ) : null}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateAgenda(review.id)}
                              disabled={generatingId === review.id}
                              className="flex items-center gap-1"
                            >
                              {generatingId === review.id ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3 w-3" />
                                  {review.aiGeneratedAgenda ? 'Regenerate' : 'Generate'}
                                </>
                              )}
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
                <ListChecks className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No reviews found. Create a review first to generate agendas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {viewModalOpen && selectedAgenda && (
          <Modal
            isOpen={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
            title={`Agenda: ${selectedReviewTitle}`}
            size="lg"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedAgenda.title}
              </h3>
              <ol className="space-y-2">
                {selectedAgenda.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-700 dark:text-slate-300">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.replace(/^\d+\.\s*/, '')}
                    </span>
                  </li>
                ))}
              </ol>
              {selectedAgenda.aiNote && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> {selectedAgenda.aiNote}
                  </p>
                </div>
              )}
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
