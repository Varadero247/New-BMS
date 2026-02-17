'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STEP_SUGGESTIONS: string[][] = [
  ['What can Nexara do?', 'How many modules are there?', 'How does the AI work?'],
  ['What ISO standards are covered?', 'How do audits work?', 'What is CAPA?'],
  ['How does CMMS connect to Inventory?', 'Can I automate workflows?', 'How does payroll work?'],
  ['How do incidents connect to risk?', 'What is bow-tie analysis?', 'How does regulatory monitoring work?'],
  ['What AI analysis types exist?', 'Can AI detect compliance gaps?', 'How does predictive risk work?'],
  ['How many templates are there?', 'Can I customise templates?', 'What are evidence packs?'],
  ['How do I invite my team?', 'Where is the setup wizard?', 'How do I get support?'],
];

interface WizardAssistantProps {
  stepIndex: number;
  onClose: () => void;
}

export function WizardAssistant({ stepIndex, onClose }: WizardAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const suggestions = STEP_SUGGESTIONS[stepIndex] || STEP_SUGGESTIONS[0];

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/assistant', {
        question: text.trim(),
        context: `User is on wizard step ${stepIndex + 1} of 7`,
      });
      const data = res.data.data;
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer || 'I couldn\'t find a specific answer. Try rephrasing your question.' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I\'m unable to connect to the AI service right now. Please try again later.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full border-l border-[var(--border,#334155)] bg-[var(--deep,#0f172a)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border,#334155)]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--blue-mid,#3b82f6)]" />
          <span className="text-sm font-semibold text-[var(--white,#f8fafc)]">Ask AI</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--surface,#1e293b)]">
          <X className="h-4 w-4 text-[var(--steel,#94a3b8)]" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-[var(--steel,#94a3b8)] text-center py-4">
            Ask me anything about Nexara modules, integrations, or ISO standards.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[var(--blue-mid,#3b82f6)] text-white'
                  : 'bg-[var(--surface,#1e293b)] text-[var(--silver,#cbd5e1)] border border-[var(--border,#334155)]'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface,#1e293b)] border border-[var(--border,#334155)]">
              <Loader2 className="h-3.5 w-3.5 text-[var(--blue-mid,#3b82f6)] animate-spin" />
              <span className="text-xs text-[var(--steel,#94a3b8)]">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs px-2.5 py-1.5 rounded-full border border-[var(--border,#334155)] text-[var(--silver,#cbd5e1)] hover:bg-[var(--surface,#1e293b)] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-[var(--border,#334155)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 text-sm px-3 py-2 rounded-lg bg-[var(--surface,#1e293b)] border border-[var(--border,#334155)] text-[var(--white,#f8fafc)] placeholder-[var(--steel,#94a3b8)] focus:outline-none focus:border-[var(--blue-mid,#3b82f6)]"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 rounded-lg bg-[var(--blue-mid,#3b82f6)] text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
