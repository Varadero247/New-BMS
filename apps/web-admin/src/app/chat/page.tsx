'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { Send, Bot, User, MessageSquare } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      'Hello! I am your Nexara marketing AI assistant. I can help you with pipeline analysis, campaign strategy, lead scoring, and growth forecasting. What would you like to explore today?',
    timestamp: '2026-02-21T09:00:00Z',
  },
  {
    id: '2',
    role: 'user',
    content: 'What is our current MRR growth trajectory?',
    timestamp: '2026-02-21T09:01:00Z',
  },
  {
    id: '3',
    role: 'assistant',
    content:
      'Based on the last 3 months of data, your MRR growth trajectory is positive at approximately 12% month-over-month. Your top contributing segments are Enterprise (PROFESSIONAL plan) and SMB (STARTER plan). I recommend doubling down on referral incentives — your referral channel converts at 38%, nearly double the industry average of 20%.',
    timestamp: '2026-02-21T09:01:15Z',
  },
  {
    id: '4',
    role: 'user',
    content: 'Which lead sources should we prioritize this quarter?',
    timestamp: '2026-02-21T09:05:00Z',
  },
  {
    id: '5',
    role: 'assistant',
    content:
      'I recommend prioritising LinkedIn outbound and referral channels. LinkedIn currently drives 34% of pipeline value at a 22% close rate. Referrals close at 38% and have a 40% shorter sales cycle. Cold outreach shows diminishing returns — consider reallocating that budget to content-led inbound, which has grown 18% in the last 60 days.',
    timestamp: '2026-02-21T09:05:20Z',
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function load() {
    try {
      const r = await api.get('/api/marketing/chat');
      setMessages(r.data.data || MOCK_MESSAGES);
    } catch {
      setMessages(MOCK_MESSAGES);
      setError('Live chat API unavailable — showing demo conversation.');
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const r = await api.post('/api/marketing/chat', { message: text });
      const reply = r.data.data;
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply?.content || reply || 'I have analysed your query. Please check back shortly.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'I am currently unable to connect to the AI backend. Your message has been noted and I will respond once connectivity is restored.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setSending(false);
    }
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="flex min-h-screen bg-[#0B1E38]">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 h-screen">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 bg-[#0F2440]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Marketing Assistant</h1>
              <p className="text-gray-400 text-sm">Ask about pipeline, strategy, and growth metrics</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Message List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'assistant' ? 'bg-blue-500/20' : 'bg-[#1B3A6B]'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <Bot className="w-4 h-4 text-blue-400" />
                  ) : (
                    <User className="w-4 h-4 text-gray-300" />
                  )}
                </div>

                {/* Bubble */}
                <div className={`max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'assistant'
                        ? 'bg-[#112240] border border-white/10 text-gray-200 rounded-tl-none'
                        : 'bg-[#1B3A6B] text-white rounded-tr-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-xs text-gray-500 px-1">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="bg-[#112240] border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#0F2440]">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about marketing strategy, pipeline, growth metrics..."
              className="flex-1 bg-[#112240] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500/50"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
            >
              {sending ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
