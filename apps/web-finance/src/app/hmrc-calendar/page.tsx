'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Calendar, Plus, AlertTriangle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface HmrcDeadline {
  id: string;
  title: string;
  description?: string;
  type?: string;
  dueDate: string;
  filingRef?: string;
  status?: string;
  submittedDate?: string;
  submittedBy?: string;
  notes?: string;
  createdAt?: string;
}

interface DeadlineForm {
  title: string;
  type: string;
  dueDate: string;
  filingRef: string;
  description: string;
}

const EMPTY_FORM: DeadlineForm = { title: '', type: '', dueDate: '', filingRef: '', description: '' };

const MOCK_DEADLINES: HmrcDeadline[] = [
  { id: '1', title: 'Corporation Tax Return (CT600)', type: 'CORPORATION_TAX', dueDate: '2026-03-31T00:00:00Z', filingRef: 'CT600-2025', status: 'PENDING', description: 'Annual corporation tax return for FY2025' },
  { id: '2', title: 'VAT Return Q4 2025', type: 'VAT', dueDate: '2026-02-07T00:00:00Z', filingRef: 'VAT-Q4-2025', status: 'SUBMITTED', submittedDate: '2026-02-05T00:00:00Z', submittedBy: 'Finance Manager' },
  { id: '3', title: 'PAYE RTI Submission — February', type: 'PAYE', dueDate: '2026-03-22T00:00:00Z', status: 'PENDING' },
  { id: '4', title: 'P11D Benefits in Kind', type: 'P11D', dueDate: '2026-07-06T00:00:00Z', status: 'PENDING', description: 'Annual P11D submission for employee benefits' },
  { id: '5', title: 'Self-Assessment Payment on Account', type: 'SELF_ASSESSMENT', dueDate: '2026-07-31T00:00:00Z', status: 'PENDING' },
  { id: '6', title: 'Employer Annual Return', type: 'PAYE', dueDate: '2026-05-19T00:00:00Z', status: 'PENDING' },
];

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function deadlineColor(daysLeft: number, status?: string): string {
  if (status === 'SUBMITTED') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
  if (daysLeft < 0) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  if (daysLeft <= 14) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
}

export default function HmrcCalendarPage() {
  const [deadlines, setDeadlines] = useState<HmrcDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<DeadlineForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await api.get('/hmrc-calendar');
      setDeadlines((r.data.data || MOCK_DEADLINES).sort((a: HmrcDeadline, b: HmrcDeadline) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    } catch {
      setDeadlines([...MOCK_DEADLINES].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!form.title || !form.dueDate) return;
    setSaving(true);
    try {
      await api.post('/hmrc-calendar', { ...form, dueDate: new Date(form.dueDate).toISOString() });
      await load();
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch {
      setDeadlines((prev) => [...prev, { id: Date.now().toString(), ...form, dueDate: new Date(form.dueDate).toISOString(), status: 'PENDING' }].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
      setShowModal(false);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  }

  const overdue = deadlines.filter((d) => d.status !== 'SUBMITTED' && daysUntil(d.dueDate) < 0).length;
  const dueSoon = deadlines.filter((d) => d.status !== 'SUBMITTED' && daysUntil(d.dueDate) >= 0 && daysUntil(d.dueDate) <= 14).length;
  const submitted = deadlines.filter((d) => d.status === 'SUBMITTED').length;

  if (loading) return <div className="p-8 flex items-center justify-center min-h-96"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">HMRC Tax Calendar</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">UK tax filing deadlines and compliance calendar</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Add Deadline
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl p-4 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" /><p className="text-sm font-medium text-red-700 dark:text-red-300">Overdue</p></div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{overdue}</p>
          </div>
          <div className="rounded-xl p-4 bg-amber-50 dark:bg-amber-900/20">
            <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" /><p className="text-sm font-medium text-amber-700 dark:text-amber-300">Due in 14 days</p></div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{dueSoon}</p>
          </div>
          <div className="rounded-xl p-4 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" /><p className="text-sm font-medium text-green-700 dark:text-green-300">Submitted</p></div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{submitted}</p>
          </div>
        </div>

        <div className="space-y-3">
          {deadlines.map((d) => {
            const days = daysUntil(d.dueDate);
            const color = deadlineColor(days, d.status);
            return (
              <Card key={d.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-lg ${color} shrink-0`}><Calendar className="h-4 w-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{d.title}</p>
                          {d.filingRef && <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">{d.filingRef}</span>}
                          {d.type && <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded font-medium">{d.type.replace(/_/g, ' ')}</span>}
                        </div>
                        {d.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{d.description}</p>}
                        {d.submittedBy && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Submitted by {d.submittedBy}{d.submittedDate ? ` on ${new Date(d.submittedDate).toLocaleDateString()}` : ''}</p>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{new Date(d.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className={`text-xs font-medium mt-0.5 ${d.status === 'SUBMITTED' ? 'text-green-600' : days < 0 ? 'text-red-600' : days <= 14 ? 'text-amber-600' : 'text-blue-600'}`}>
                        {d.status === 'SUBMITTED' ? 'Filed' : days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {deadlines.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500"><Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No deadlines found.</p></div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add HMRC Deadline</h2>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label><input type="text" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="VAT / PAYE / CT600" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
                <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date *</label><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Filing Reference</label><input type="text" value={form.filingRef} onChange={(e) => setForm({ ...form, filingRef: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.title || !form.dueDate} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Add Deadline'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
