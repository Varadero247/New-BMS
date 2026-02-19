'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Modal,
  ModalFooter,
  Input,
  Label,
} from '@ims/ui';
import { Plus, Search, FileText, Eye, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface QuoteLine {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Quote {
  id: string;
  reference: string;
  title: string;
  dealId?: string;
  dealTitle?: string;
  deal?: { title: string };
  total: number;
  status: string;
  validUntil?: string;
  lines?: QuoteLine[];
  createdAt: string;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  SENT: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-orange-100 text-orange-700',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

const emptyLine: QuoteLine = { description: '', quantity: 1, unitPrice: 0, amount: 0 };

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewQuote, setViewQuote] = useState<Quote | null>(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formDealId, setFormDealId] = useState('');
  const [formValidUntil, setFormValidUntil] = useState('');
  const [lines, setLines] = useState<QuoteLine[]>([{ ...emptyLine }]);

  useEffect(() => {
    loadQuotes();
  }, []);

  async function loadQuotes() {
    try {
      setError(null);
      const res = await api.get('/quotes');
      setQuotes(res.data.data || []);
    } catch {
      setError('Failed to load quotes.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setFormTitle('');
    setFormDealId('');
    setFormValidUntil('');
    setLines([{ ...emptyLine }]);
    setFormError('');
    setCreateModalOpen(true);
  }

  function addLine() {
    setLines((prev) => [...prev, { ...emptyLine }]);
  }

  function removeLine(index: number) {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLine(index: number, field: keyof QuoteLine, value: string | number) {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line;
        const updated = { ...line, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0);
        }
        return updated;
      })
    );
  }

  const quoteTotal = lines.reduce((sum, l) => sum + (l.amount || 0), 0);

  async function handleCreate() {
    setFormError('');
    if (!formTitle.trim()) {
      setFormError('Quote title is required');
      return;
    }

    const validLines = lines.filter((l) => l.description.trim() && l.amount > 0);
    if (validLines.length === 0) {
      setFormError('At least one line item is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/quotes', {
        title: formTitle,
        dealId: formDealId || undefined,
        validUntil: formValidUntil || undefined,
        lines: validLines,
      });
      setCreateModalOpen(false);
      loadQuotes();
    } catch (err) {
      setFormError((axios.isAxiosError(err) && err.response?.data?.error?.message) || 'Failed to create quote.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    try {
      await api.delete(`/quotes/${id}`);
      loadQuotes();
    } catch (err) {
      console.error('Error deleting quote:', err);
    }
  }

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      !searchTerm ||
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.reference || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quotes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage sales quotes</p>
          </div>
          <Button className="flex items-center gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" /> New Quote
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    aria-label="Search quotes..."
                    placeholder="Search quotes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-600" />
              Quotes ({filteredQuotes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredQuotes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Ref
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Deal
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Total
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Valid Until
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotes.map((quote) => (
                      <tr key={quote.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-gray-900 dark:text-gray-100">
                          {quote.reference || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                          {quote.title}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {quote.deal?.title || quote.dealTitle || '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(quote.total || 0)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              statusColors[quote.status] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {quote.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setViewQuote(quote);
                                setViewModalOpen(true);
                              }}
                              className="text-gray-400 dark:text-gray-500 hover:text-violet-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(quote.id)}
                              className="text-gray-400 dark:text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No quotes found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="New Quote"
        size="full"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="q-title">Title *</Label>
              <Input
                id="q-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Quote title"
              />
            </div>
            <div>
              <Label htmlFor="q-deal">Deal ID</Label>
              <Input
                id="q-deal"
                value={formDealId}
                onChange={(e) => setFormDealId(e.target.value)}
                placeholder="Optional deal reference"
              />
            </div>
            <div>
              <Label htmlFor="q-valid">Valid Until</Label>
              <Input
                id="q-valid"
                type="date"
                value={formValidUntil}
                onChange={(e) => setFormValidUntil(e.target.value)}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Line Items</Label>
              <button
                onClick={addLine}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                + Add Line
              </button>
            </div>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                    Description
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400 w-24">
                    Qty
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400 w-32">
                    Unit Price
                  </th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400 w-32">
                    Amount
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="py-2 px-3">
                      <input
                        value={line.description}
                        onChange={(e) => updateLine(idx, 'description', e.target.value)}
                        placeholder="Item description"
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(idx, 'quantity', parseFloat(e.target.value) || 0)
                        }
                        className="w-full border rounded px-2 py-1 text-sm text-right"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.unitPrice || ''}
                        onChange={(e) =>
                          updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                        className="w-full border rounded px-2 py-1 text-sm text-right"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-medium">
                      {formatCurrency(line.amount)}
                    </td>
                    <td className="py-2 px-3">
                      {lines.length > 1 && (
                        <button
                          onClick={() => removeLine(idx)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="border-t bg-gray-50 dark:bg-gray-800 font-medium">
                  <td colSpan={3} className="py-2 px-3 text-right">
                    Total:
                  </td>
                  <td className="py-2 px-3 text-right">{formatCurrency(quoteTotal)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Quote'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`Quote: ${viewQuote?.reference || ''}`}
        size="lg"
      >
        {viewQuote && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Title</p>
                <p className="font-medium">{viewQuote.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p className="font-medium text-green-700">{formatCurrency(viewQuote.total || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <Badge className={statusColors[viewQuote.status]}>{viewQuote.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Deal</p>
                <p className="font-medium">{viewQuote.deal?.title || viewQuote.dealTitle || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Valid Until</p>
                <p className="font-medium">
                  {viewQuote.validUntil ? new Date(viewQuote.validUntil).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
            {viewQuote.lines && viewQuote.lines.length > 0 && (
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-2 px-3">Description</th>
                    <th className="text-right py-2 px-3">Qty</th>
                    <th className="text-right py-2 px-3">Unit Price</th>
                    <th className="text-right py-2 px-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {viewQuote.lines.map((line, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="py-2 px-3">{line.description}</td>
                      <td className="py-2 px-3 text-right">{line.quantity}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(line.unitPrice)}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(line.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
