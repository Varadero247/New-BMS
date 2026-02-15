'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter, Input, Label } from '@ims/ui';
import { Plus, Search, FileText, Trash2, Eye } from 'lucide-react';
import { api } from '@/lib/api';

interface JournalLine {
  id?: string;
  accountId: string;
  accountCode?: string;
  accountName?: string;
  description: string;
  debit: number;
  credit: number;
}

interface JournalEntry {
  id: string;
  reference: string;
  date: string;
  description: string;
  status: string;
  totalDebit: number;
  totalCredit: number;
  lines: JournalLine[];
  createdAt: string;
  createdBy?: string;
}

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  POSTED: 'bg-green-100 text-green-700',
  REVERSED: 'bg-red-100 text-red-700',
  VOID: 'bg-orange-100 text-orange-700',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

const emptyLine: JournalLine = { accountId: '', description: '', debit: 0, credit: 0 };

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formDate, setFormDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formReference, setFormReference] = useState('');
  const [lines, setLines] = useState<JournalLine[]>([{ ...emptyLine }, { ...emptyLine }]);

  useEffect(() => {
    loadEntries();
    loadAccounts();
  }, []);

  async function loadEntries() {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/journal?${params.toString()}`);
      setEntries(res.data.data || []);
    } catch (err) {
      setError('Failed to load journal entries.');
      console.error('Error loading journal entries:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadAccounts() {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data.data || []);
    } catch (err) {
      console.error('Error loading accounts:', err);
    }
  }

  function openCreateModal() {
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDescription('');
    setFormReference('');
    setLines([{ ...emptyLine }, { ...emptyLine }]);
    setFormError('');
    setCreateModalOpen(true);
  }

  function openViewModal(entry: JournalEntry) {
    setViewEntry(entry);
    setViewModalOpen(true);
  }

  function addLine() {
    setLines(prev => [...prev, { ...emptyLine }]);
  }

  function removeLine(index: number) {
    if (lines.length <= 2) return;
    setLines(prev => prev.filter((_, i) => i !== index));
  }

  function updateLine(index: number, field: keyof JournalLine, value: string | number) {
    setLines(prev => prev.map((line, i) => i === index ? { ...line, [field]: value } : line));
  }

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  async function handleCreate() {
    setFormError('');

    if (!formDate) { setFormError('Date is required'); return; }
    if (!formDescription.trim()) { setFormError('Description is required'); return; }
    if (!isBalanced) { setFormError('Total debits must equal total credits'); return; }

    const validLines = lines.filter(l => l.accountId && (Number(l.debit) > 0 || Number(l.credit) > 0));
    if (validLines.length < 2) { setFormError('At least 2 valid lines are required'); return; }

    setSubmitting(true);
    try {
      await api.post('/journal', {
        reference: formReference || undefined,
        date: formDate,
        description: formDescription,
        lines: validLines.map(l => ({
          accountId: l.accountId,
          description: l.description,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
        })),
      });
      setCreateModalOpen(false);
      loadEntries();
    } catch (err: any) {
      setFormError(err?.response?.data?.error?.message || 'Failed to create journal entry.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePost(id: string) {
    try {
      await api.patch(`/journal/${id}/post`);
      loadEntries();
    } catch (err) {
      console.error('Error posting entry:', err);
    }
  }

  async function handleVoid(id: string) {
    if (!confirm('Are you sure you want to void this entry?')) return;
    try {
      await api.patch(`/journal/${id}/void`);
      loadEntries();
    } catch (err) {
      console.error('Error voiding entry:', err);
    }
  }

  const filteredEntries = entries.filter(e => {
    const matchesSearch = !searchTerm ||
      e.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || e.status === statusFilter;
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Journal Entries</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Record and manage journal entries</p>
          </div>
          <Button className="flex items-center gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" /> New Entry
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="POSTED">Posted</option>
                <option value="REVERSED">Reversed</option>
                <option value="VOID">Void</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Journal Entries ({filteredEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Reference</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Debit</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Credit</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-gray-900 dark:text-gray-100">{entry.reference}</td>
                        <td className="py-3 px-4 text-gray-600">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{entry.description}</td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[entry.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>{entry.status}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(entry.totalDebit || 0)}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(entry.totalCredit || 0)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openViewModal(entry)} className="text-gray-400 dark:text-gray-500 hover:text-indigo-600">
                              <Eye className="h-4 w-4" />
                            </button>
                            {entry.status === 'DRAFT' && (
                              <button onClick={() => handlePost(entry.id)} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">
                                Post
                              </button>
                            )}
                            {entry.status === 'DRAFT' && (
                              <button onClick={() => handleVoid(entry.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
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
                <p>No journal entries found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="New Journal Entry" size="full">
        <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{formError}</div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="je-reference">Reference</Label>
              <Input id="je-reference" value={formReference} onChange={(e) => setFormReference(e.target.value)} placeholder="Auto-generated if empty" />
            </div>
            <div>
              <Label htmlFor="je-date">Date *</Label>
              <Input id="je-date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="je-description">Description *</Label>
              <Input id="je-description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Entry description" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Line Items</Label>
              <button onClick={addLine} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">+ Add Line</button>
            </div>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Account</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Description</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Debit</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Credit</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="py-2 px-3">
                      <select
                        value={line.accountId}
                        onChange={(e) => updateLine(idx, 'accountId', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select account</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        value={line.description}
                        onChange={(e) => updateLine(idx, 'description', e.target.value)}
                        placeholder="Line description"
                        className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.debit || ''}
                        onChange={(e) => updateLine(idx, 'debit', parseFloat(e.target.value) || 0)}
                        className="w-full border rounded px-2 py-1 text-sm text-right focus:ring-2 focus:ring-indigo-500"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.credit || ''}
                        onChange={(e) => updateLine(idx, 'credit', parseFloat(e.target.value) || 0)}
                        className="w-full border rounded px-2 py-1 text-sm text-right focus:ring-2 focus:ring-indigo-500"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      {lines.length > 2 && (
                        <button onClick={() => removeLine(idx)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="border-t bg-gray-50 dark:bg-gray-800 font-medium">
                  <td colSpan={2} className="py-2 px-3 text-right">Totals:</td>
                  <td className="py-2 px-3 text-right">{formatCurrency(totalDebit)}</td>
                  <td className="py-2 px-3 text-right">{formatCurrency(totalCredit)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            {!isBalanced && totalDebit > 0 && (
              <p className="text-sm text-red-600 mt-1">Debits and credits must balance. Difference: {formatCurrency(Math.abs(totalDebit - totalCredit))}</p>
            )}
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleCreate} disabled={submitting || !isBalanced}>{submitting ? 'Creating...' : 'Create Entry'}</Button>
        </ModalFooter>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title={`Journal Entry: ${viewEntry?.reference || ''}`} size="lg">
        {viewEntry && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                <p className="font-medium">{new Date(viewEntry.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <Badge className={statusColors[viewEntry.status]}>{viewEntry.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                <p className="font-medium">{viewEntry.description}</p>
              </div>
            </div>
            {viewEntry.lines && viewEntry.lines.length > 0 && (
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-2 px-3">Account</th>
                    <th className="text-left py-2 px-3">Description</th>
                    <th className="text-right py-2 px-3">Debit</th>
                    <th className="text-right py-2 px-3">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {viewEntry.lines.map((line, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="py-2 px-3">{line.accountCode || line.accountName || line.accountId}</td>
                      <td className="py-2 px-3">{line.description}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(line.debit || 0)}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(line.credit || 0)}</td>
                    </tr>
                  ))}
                  <tr className="border-t bg-gray-50 dark:bg-gray-800 font-medium">
                    <td colSpan={2} className="py-2 px-3 text-right">Totals:</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(viewEntry.totalDebit || 0)}</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(viewEntry.totalCredit || 0)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
