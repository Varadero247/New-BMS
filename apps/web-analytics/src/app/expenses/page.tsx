'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Receipt, Plus, Search, Trash2, Edit2, XCircle, Loader2, CheckCircle, XOctagon } from 'lucide-react';
import { api } from '@/lib/api';

interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  category: string;
  vendor?: string;
  receiptUrl?: string;
  status: string;
  expenseDate: string;
  submittedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

interface ExpenseForm {
  title: string;
  description: string;
  amount: string;
  category: string;
  vendor: string;
}

const EMPTY_FORM: ExpenseForm = { title: '', description: '', amount: '', category: 'TRAVEL', vendor: '' };

const MOCK_EXPENSES: Expense[] = [
  { id: '1', title: 'ISO 9001 Audit Travel', description: 'Train and hotel for external audit', amount: 425.50, category: 'TRAVEL', vendor: 'National Rail', status: 'APPROVED', expenseDate: '2026-02-15', submittedBy: 'Alice Johnson', approvedBy: 'Bob Smith' },
  { id: '2', title: 'Safety Signage — Q1', description: 'Updated safety signs for warehouse', amount: 860.00, category: 'EQUIPMENT', vendor: 'SafeSign Ltd', status: 'PENDING', expenseDate: '2026-02-18', submittedBy: 'Carol Davis' },
  { id: '3', title: 'Training Materials', description: 'ISO 14001 awareness training packs', amount: 320.00, category: 'TRAINING', vendor: 'GreenLearn', status: 'APPROVED', expenseDate: '2026-02-10', submittedBy: 'Eve Green', approvedBy: 'Bob Smith' },
  { id: '4', title: 'IT Software Licence', description: 'Annual CAD software renewal', amount: 1200.00, category: 'IT', vendor: 'Autodesk', status: 'PENDING', expenseDate: '2026-02-20', submittedBy: 'Frank IT' },
  { id: '5', title: 'COSHH Assessment Supplies', description: 'Chemical testing kits', amount: 185.00, category: 'SUPPLIES', vendor: 'Lab Supplies Co', status: 'REJECTED', expenseDate: '2026-02-05', submittedBy: 'George H&S', notes: 'Duplicate — already ordered centrally' },
];

const CATEGORIES = ['TRAVEL', 'EQUIPMENT', 'TRAINING', 'IT', 'SUPPLIES', 'FACILITIES', 'PROFESSIONAL', 'OTHER'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  REIMBURSED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
};

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenseForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await api.get('/expenses');
      setExpenses(r.data.data?.expenses || MOCK_EXPENSES);
    } catch {
      setExpenses(MOCK_EXPENSES);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); }
  function openEdit(e: Expense) {
    setForm({ title: e.title, description: e.description || '', amount: e.amount.toString(), category: e.category, vendor: e.vendor || '' });
    setEditingId(e.id); setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditingId(null); setForm(EMPTY_FORM); }

  async function handleSave() {
    if (!form.title || !form.amount || !form.category) return;
    setSaving(true);
    try {
      const payload = { title: form.title, description: form.description || undefined, amount: parseFloat(form.amount), category: form.category, vendor: form.vendor || undefined };
      if (editingId) { await api.put(`/expenses/${editingId}`, payload); }
      else { await api.post('/expenses', payload); }
      await load(); closeModal();
    } catch { } finally { setSaving(false); }
  }

  async function updateStatus(id: string, status: string) {
    setActionId(id);
    try {
      await api.put(`/expenses/${id}`, { status });
      setExpenses((prev) => prev.map((e) => e.id === id ? { ...e, status } : e));
    } catch { } finally { setActionId(null); }
  }

  async function handleDelete(id: string) {
    setActionId(id);
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch { } finally { setActionId(null); }
  }

  const filtered = expenses.filter((e) => {
    const matchSearch = searchTerm === '' || e.title.toLowerCase().includes(searchTerm.toLowerCase()) || (e.vendor || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === '' || e.status === statusFilter;
    const matchCat = categoryFilter === '' || e.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const totalPending = expenses.filter((e) => e.status === 'PENDING').reduce((s, e) => s + e.amount, 0);
  const totalApproved = expenses.filter((e) => e.status === 'APPROVED').reduce((s, e) => s + e.amount, 0);
  const pendingCount = expenses.filter((e) => e.status === 'PENDING').length;
  const approvedCount = expenses.filter((e) => e.status === 'APPROVED').length;

  if (loading) return <div className="p-8 flex items-center justify-center min-h-96"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Expenses</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track and approve business expenses</p>
          </div>
          <button onClick={openAdd} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Submit Expense
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pending', value: fmt(totalPending), sub: `${pendingCount} expenses`, color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' },
            { label: 'Approved', value: fmt(totalApproved), sub: `${approvedCount} expenses`, color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' },
            { label: 'Total Submitted', value: expenses.length.toString(), sub: 'all time', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' },
            { label: 'Rejected', value: expenses.filter((e) => e.status === 'REJECTED').length.toString(), sub: 'expenses', color: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' },
          ].map((s) => (
            <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
              <p className="text-xs opacity-70 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search expenses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
            <option value="">All Statuses</option>
            {['PENDING', 'APPROVED', 'REJECTED', 'REIMBURSED'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Receipt className="h-5 w-5 text-purple-600" /> Expenses ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      {['Title', 'Category', 'Amount', 'Vendor', 'Status', 'Date', 'Submitted By', 'Actions'].map((h) => (
                        <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e) => (
                      <tr key={e.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100 max-w-xs">
                          <p>{e.title}</p>
                          {e.description && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{e.description}</p>}
                        </td>
                        <td className="py-3 px-4"><span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">{e.category}</span></td>
                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">{fmt(e.amount)}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{e.vendor || '—'}</td>
                        <td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[e.status] || 'bg-gray-100 text-gray-700'}`}>{e.status}</span></td>
                        <td className="py-3 px-4 text-gray-400 dark:text-gray-500 text-xs">{new Date(e.expenseDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{e.submittedBy || '—'}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            {e.status === 'PENDING' && (
                              <>
                                <button onClick={() => updateStatus(e.id, 'APPROVED')} disabled={actionId === e.id} title="Approve" className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"><CheckCircle className="h-4 w-4" /></button>
                                <button onClick={() => updateStatus(e.id, 'REJECTED')} disabled={actionId === e.id} title="Reject" className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"><XOctagon className="h-4 w-4" /></button>
                              </>
                            )}
                            <button onClick={() => openEdit(e)} className="p-1 text-gray-400 hover:text-purple-600"><Edit2 className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(e.id)} disabled={actionId === e.id} className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No expenses found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editingId ? 'Edit Expense' : 'Submit Expense'}</h2>
              <button onClick={closeModal}><XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="e.g. Supplier visit travel" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (£) *</label>
                  <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor</label>
                <input type="text" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="Supplier name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="Brief description..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeModal} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.amount} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
