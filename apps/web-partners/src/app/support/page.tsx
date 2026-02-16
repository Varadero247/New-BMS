'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  slaTarget: string | null;
  createdAt: string;
  messages: { id: string; body: string; createdAt: string }[];
}

const priorityColor: Record<string, string> = {
  LOW: 'bg-gray-500/20 text-gray-400',
  MEDIUM: 'bg-blue-500/20 text-blue-400',
  HIGH: 'bg-orange-500/20 text-orange-400',
  URGENT: 'bg-red-500/20 text-red-400',
};

const statusColor: Record<string, string> = {
  OPEN: 'bg-blue-500/20 text-blue-400',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400',
  WAITING_ON_PARTNER: 'bg-purple-500/20 text-purple-400',
  RESOLVED: 'bg-green-500/20 text-green-400',
  CLOSED: 'bg-gray-500/20 text-gray-400',
};

export default function SupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formSubject, setFormSubject] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState('MEDIUM');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('partner_token');
    if (!token) { router.push('/login'); return; }
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/api/support');
      setTickets(res.data.data || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/support', {
        subject: formSubject,
        description: formDesc,
        priority: formPriority,
      });
      setFormSubject('');
      setFormDesc('');
      setFormPriority('MEDIUM');
      setShowForm(false);
      fetchTickets();
    } catch {} finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Support</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-[#1B3A6B] hover:bg-[#244d8a] text-white text-sm font-medium rounded-lg transition-colors"
            >
              + New Ticket
            </button>
          </div>

          {/* New Ticket Form */}
          {showForm && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">New Support Ticket</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    placeholder="Brief description of the issue"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm resize-none"
                    placeholder="Describe the issue in detail"
                  />
                </div>
                <div className="flex items-end gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Priority</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value)}
                      className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Ticket'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tickets List */}
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">
                No support tickets yet.
              </div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => router.push(`/support/${ticket.id}`)}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{ticket.subject}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColor[ticket.priority] || ''}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[ticket.status] || ''}`}>
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-1">{ticket.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleDateString('en-GB')}</span>
                    {ticket.slaTarget && (
                      <span className="text-xs text-gray-500">
                        SLA: {new Date(ticket.slaTarget).toLocaleString('en-GB')}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
