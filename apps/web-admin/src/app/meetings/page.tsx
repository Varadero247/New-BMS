'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { Calendar, Plus, ChevronDown, ChevronUp, CheckSquare, Square, Users } from 'lucide-react';

interface ActionItem {
  text: string;
  assignee?: string;
  completed: boolean;
}

interface Meeting {
  id: string;
  title: string;
  type: string;
  date: string;
  attendees: string[];
  summary: string;
  actionItems: ActionItem[];
  createdAt: string;
}

const TYPE_BADGES: Record<string, { bg: string; text: string }> = {
  BOARD: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  TEAM: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  CUSTOMER: { bg: 'bg-green-500/20', text: 'text-green-400' },
  PARTNER: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'TEAM',
    date: '',
    attendees: '',
    summary: '',
    actionItems: '',
  });

  useEffect(() => {
    loadMeetings();
  }, []);

  async function loadMeetings() {
    try {
      const res = await api.get('/api/analytics/meetings');
      setMeetings(res.data.data?.meetings || []);
    } catch {
      // API may not be available
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      const actionItems = form.actionItems
        .split('\n')
        .filter((l) => l.trim())
        .map((text) => ({ text: text.trim(), completed: false }));

      await api.post('/api/analytics/meetings', {
        title: form.title,
        type: form.type,
        date: form.date,
        attendees: form.attendees
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
        summary: form.summary,
        actionItems,
      });
      setShowCreate(false);
      setForm({ title: '', type: 'TEAM', date: '', attendees: '', summary: '', actionItems: '' });
      loadMeetings();
    } catch {
      // handle error
    }
  }

  async function toggleAction(meetingId: string, actionIndex: number) {
    try {
      await api.patch(`/api/analytics/meetings/${meetingId}/actions/${actionIndex}`);
      loadMeetings();
    } catch {
      // handle error
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#080B12]">
      <Sidebar />
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-7 h-7 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Meetings</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Meeting
          </button>
        </div>

        {loading ? (
          <div className="text-gray-400 dark:text-gray-500 text-center py-12">
            Loading meetings...
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-gray-400 dark:text-gray-500 text-center py-12">
            No meetings recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => {
              const expanded = expandedId === meeting.id;
              const badge = TYPE_BADGES[meeting.type] || TYPE_BADGES.TEAM;
              return (
                <div
                  key={meeting.id}
                  className="bg-[#112240] border border-[#1B3A6B]/30 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(expanded ? null : meeting.id)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#1B3A6B]/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}
                      >
                        {meeting.type}
                      </span>
                      <span className="text-white font-medium">{meeting.title}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {formatDate(meeting.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                        <Users className="w-3.5 h-3.5" />
                        {(meeting.attendees || []).length}
                      </div>
                      {expanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                  </button>

                  {expanded && (
                    <div className="px-6 pb-5 border-t border-[#1B3A6B]/20">
                      {meeting.summary && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-1">
                            Summary
                          </h3>
                          <p className="text-gray-300 text-sm whitespace-pre-wrap">
                            {meeting.summary}
                          </p>
                        </div>
                      )}

                      {(meeting.attendees || []).length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-1">
                            Attendees
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {meeting.attendees.map((a, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-[#1B3A6B]/40 text-gray-300 rounded text-xs"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(meeting.actionItems || []).length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-2">
                            Action Items
                          </h3>
                          <div className="space-y-2">
                            {meeting.actionItems.map((item, idx) => (
                              <button
                                key={idx}
                                onClick={() => toggleAction(meeting.id, idx)}
                                className="flex items-center gap-2 w-full text-left hover:bg-[#1B3A6B]/20 rounded px-2 py-1 transition-colors"
                              >
                                {item.completed ? (
                                  <CheckSquare className="w-4 h-4 text-green-400 flex-shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                )}
                                <span
                                  className={`text-sm ${
                                    item.completed
                                      ? 'text-gray-500 dark:text-gray-400 line-through'
                                      : 'text-gray-300'
                                  }`}
                                >
                                  {item.text}
                                </span>
                                {item.assignee && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                                    {item.assignee}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create Meeting Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#112240] border border-[#1B3A6B]/30 rounded-xl w-full max-w-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4">New Meeting</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 dark:text-gray-500 block mb-1">
                    Title
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080B12] border border-[#1B3A6B]/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Meeting title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 dark:text-gray-500 block mb-1">
                      Type
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2 bg-[#080B12] border border-[#1B3A6B]/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="BOARD">Board</option>
                      <option value="TEAM">Team</option>
                      <option value="CUSTOMER">Customer</option>
                      <option value="PARTNER">Partner</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 dark:text-gray-500 block mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2 bg-[#080B12] border border-[#1B3A6B]/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 dark:text-gray-500 block mb-1">
                    Attendees (comma separated)
                  </label>
                  <input
                    value={form.attendees}
                    onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080B12] border border-[#1B3A6B]/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Alice, Bob, Charlie"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 dark:text-gray-500 block mb-1">
                    Summary
                  </label>
                  <textarea
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#080B12] border border-[#1B3A6B]/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Meeting summary..."
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 dark:text-gray-500 block mb-1">
                    Action Items (one per line)
                  </label>
                  <textarea
                    value={form.actionItems}
                    onChange={(e) => setForm({ ...form, actionItems: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#080B12] border border-[#1B3A6B]/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Follow up with client&#10;Send proposal&#10;Schedule next review"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-gray-400 dark:text-gray-500 hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!form.title || !form.date}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Meeting
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
