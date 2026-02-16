'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Message {
  id: string;
  senderId: string;
  senderType: 'PARTNER' | 'SUPPORT';
  body: string;
  createdAt: string;
}

interface TicketDetail {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  slaTarget: string | null;
  resolvedAt: string | null;
  createdAt: string;
  messages: Message[];
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('partner_token');
    if (!token) { router.push('/login'); return; }
    fetchTicket();
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/api/support/${ticketId}`);
      setTicket(res.data.data);
    } catch {
      router.push('/support');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await api.post(`/api/support/${ticketId}/messages`, { body: newMessage });
      setNewMessage('');
      fetchTicket();
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    try {
      await api.patch(`/api/support/${ticketId}/close`);
      fetchTicket();
    } catch (err) {
      console.error('Failed to close ticket', err);
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

  if (!ticket) return null;

  const isClosed = ticket.status === 'CLOSED';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <button onClick={() => router.push('/support')} className="text-sm text-gray-400 hover:text-white mb-4 inline-block">
            &larr; Back to Support
          </button>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">{ticket.subject}</h1>
                <p className="text-sm text-gray-400 mt-1">Created {new Date(ticket.createdAt).toLocaleString('en-GB')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  ticket.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                  ticket.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                  ticket.priority === 'MEDIUM' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {ticket.priority}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  isClosed ? 'bg-gray-500/20 text-gray-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {ticket.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4 mb-6">
            {ticket.messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl p-4 ${
                  msg.senderType === 'PARTNER'
                    ? 'bg-[#1B3A6B]/30 border border-[#1B3A6B]/50 ml-8'
                    : 'bg-gray-900 border border-gray-800 mr-8'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-400">
                    {msg.senderType === 'PARTNER' ? 'You' : 'Support Team'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.createdAt).toLocaleString('en-GB')}
                  </span>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{msg.body}</p>
              </div>
            ))}
          </div>

          {/* Reply / Close */}
          {!isClosed ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <form onSubmit={handleSend} className="space-y-3">
                <textarea
                  rows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm resize-none"
                  placeholder="Type your reply..."
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Close Ticket
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-6 py-2 bg-[#1B3A6B] hover:bg-[#244d8a] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <p className="text-gray-400">This ticket is closed.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
