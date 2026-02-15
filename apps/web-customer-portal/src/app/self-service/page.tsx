'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, HelpCircle, X, MessageSquare, FileText, Package, CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastReply: string;
}

interface KBArticle {
  id: string;
  title: string;
  category: string;
  views: number;
  helpful: number;
}

const CATEGORIES = ['GENERAL', 'ORDER', 'BILLING', 'TECHNICAL', 'RETURNS', 'SHIPPING', 'PRODUCT', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUSES = ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'];

const statusColor = (s: string) =>
  s === 'RESOLVED' || s === 'CLOSED' ? 'bg-green-100 text-green-700' :
  s === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
  s === 'WAITING_CUSTOMER' ? 'bg-orange-100 text-orange-700' :
  'bg-yellow-100 text-yellow-700';

const statusIcon = (s: string) =>
  s === 'RESOLVED' || s === 'CLOSED' ? CheckCircle :
  s === 'IN_PROGRESS' ? Clock :
  AlertCircle;

const priorityColor = (p: string) =>
  p === 'URGENT' ? 'bg-red-100 text-red-700' :
  p === 'HIGH' ? 'bg-orange-100 text-orange-700' :
  p === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
  'bg-gray-100 dark:bg-gray-800 text-gray-600';

const KB_ARTICLES: KBArticle[] = [
  { id: '1', title: 'How to track your order', category: 'Order', views: 1240, helpful: 98 },
  { id: '2', title: 'Returns and refund policy', category: 'Returns', views: 870, helpful: 94 },
  { id: '3', title: 'Updating your billing information', category: 'Billing', views: 650, helpful: 91 },
  { id: '4', title: 'Product documentation library', category: 'Product', views: 540, helpful: 88 },
  { id: '5', title: 'Shipping timelines and carriers', category: 'Shipping', views: 480, helpful: 86 },
  { id: '6', title: 'Setting up your portal account', category: 'General', views: 390, helpful: 95 },
];

const emptyForm = { subject: '', category: 'GENERAL', priority: 'MEDIUM', message: '' };

export default function SelfServicePage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'tickets' | 'knowledge'>('tickets');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [kbSearch, setKbSearch] = useState('');

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/self-service/tickets'); setTickets(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  async function handleSubmit() {
    setSaving(true);
    try {
      await api.post('/self-service/tickets', form);
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }

  const filteredTickets = tickets.filter(t => {
    const matchSearch = !search || JSON.stringify(t).toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredKB = KB_ARTICLES.filter(a =>
    !kbSearch || a.title.toLowerCase().includes(kbSearch.toLowerCase()) || a.category.toLowerCase().includes(kbSearch.toLowerCase())
  );

  const stats = {
    open: tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
    waiting: tickets.filter(t => t.status === 'WAITING_CUSTOMER').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
    total: tickets.length,
  };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Self-Service Support</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Submit support tickets, track requests, and search the knowledge base</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 flex items-center gap-2">
            <Plus className="h-5 w-5" /> New Ticket
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Tickets', value: stats.total, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800', Icon: MessageSquare },
            { label: 'Open / In Progress', value: stats.open, color: 'text-cyan-700', bg: 'bg-cyan-100', Icon: Clock },
            { label: 'Awaiting Your Reply', value: stats.waiting, color: 'text-orange-700', bg: 'bg-orange-100', Icon: AlertCircle },
            { label: 'Resolved', value: stats.resolved, color: 'text-green-700', bg: 'bg-green-100', Icon: CheckCircle },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div><div className={`p-2 rounded-full ${s.bg}`}><s.Icon className={`h-5 w-5 ${s.color}`} /></div></div></CardContent></Card>
          ))}
        </div>

        <div className="flex gap-1 border-b mb-6">
          <button onClick={() => setActiveTab('tickets')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tickets' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
            <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4" />My Tickets</span>
          </button>
          <button onClick={() => setActiveTab('knowledge')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'knowledge' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
            <span className="flex items-center gap-2"><FileText className="h-4 w-4" />Knowledge Base</span>
          </button>
        </div>

        {activeTab === 'tickets' && (
          <>
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm"><option value="">All Statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select>
            </div>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-cyan-600" />Support Tickets ({filteredTickets.length})</CardTitle></CardHeader>
              <CardContent>
                {filteredTickets.length > 0 ? (
                  <div className="space-y-3">
                    {filteredTickets.map(ticket => {
                      const StatusIcon = statusIcon(ticket.status);
                      return (
                        <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:bg-gray-800 cursor-pointer group">
                          <div className="flex items-center gap-4">
                            <StatusIcon className={`h-5 w-5 ${ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'text-green-500' : ticket.status === 'IN_PROGRESS' ? 'text-blue-500' : 'text-orange-500'}`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{ticket.subject}</span>
                                <span className="font-mono text-xs text-gray-400 dark:text-gray-500">#{ticket.ticketNumber}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{ticket.category}</span>
                                <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}</span>
                                {ticket.lastReply && <><span className="text-xs text-gray-300 dark:text-gray-600">·</span><span className="text-xs text-gray-500 dark:text-gray-400">Last reply: {new Date(ticket.lastReply).toLocaleDateString()}</span></>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(ticket.status)}`}>{ticket.status.replace(/_/g, ' ')}</span>
                            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No tickets found</p>
                    <p className="text-sm mt-1">Submit a new ticket to get help from our support team.</p>
                    <button onClick={() => setModalOpen(true)} className="mt-4 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 text-sm flex items-center gap-2 mx-auto">
                      <Plus className="h-4 w-4" /> New Ticket
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'knowledge' && (
          <>
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" placeholder="Search knowledge base..." value={kbSearch} onChange={e => setKbSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredKB.map(article => (
                <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-cyan-50 rounded-lg shrink-0">
                        <FileText className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm group-hover:text-cyan-700 transition-colors">{article.title}</h3>
                        <span className="inline-flex mt-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded text-xs">{article.category}</span>
                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>{article.views.toLocaleString()} views</span>
                          <span className="text-green-600 font-medium">{article.helpful}% helpful</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-cyan-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredKB.length === 0 && (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No articles found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}
            <div className="mt-8 p-6 bg-cyan-50 rounded-xl border border-cyan-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-100 rounded-lg">
                  <HelpCircle className="h-6 w-6 text-cyan-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Can't find what you need?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Submit a support ticket and our team will get back to you.</p>
                </div>
                <button onClick={() => { setActiveTab('tickets'); setModalOpen(true); }} className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 text-sm flex items-center gap-2">
                  <Plus className="h-4 w-4" /> New Ticket
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Submit Support Ticket</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label><input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Brief description of your issue" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label><textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={4} placeholder="Please describe your issue in detail..." className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Our support team typically responds within 1 business day. For urgent issues, mark the priority as URGENT.</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={handleSubmit} disabled={!form.subject || !form.message || saving} className="px-4 py-2 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50">{saving ? 'Submitting...' : 'Submit Ticket'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
