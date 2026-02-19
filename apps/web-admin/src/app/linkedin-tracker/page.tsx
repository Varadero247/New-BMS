'use client';

import axios from 'axios';
import { useState, useEffect, type ElementType } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { Linkedin, Send, Loader2, TrendingUp, Users, MessageSquare, Calendar } from 'lucide-react';

interface OutreachRecord {
  id: string;
  linkedinUrl: string;
  prospectName: string;
  company: string;
  template: string;
  generatedMessage: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface FunnelStats {
  sent: number;
  connected: number;
  replied: number;
  meeting: number;
  closedWon: number;
  closedLost: number;
}

const STATUS_OPTIONS = ['SENT', 'CONNECTED', 'REPLIED', 'MEETING', 'CLOSED_WON', 'CLOSED_LOST'];

const STATUS_COLORS: Record<string, string> = {
  SENT: 'bg-gray-500/20 text-gray-300',
  CONNECTED: 'bg-blue-500/20 text-blue-400',
  REPLIED: 'bg-cyan-500/20 text-cyan-400',
  MEETING: 'bg-yellow-500/20 text-yellow-400',
  CLOSED_WON: 'bg-green-500/20 text-green-400',
  CLOSED_LOST: 'bg-red-500/20 text-red-400',
};

const TEMPLATES = [
  { value: 'iso-compliance', label: 'ISO Compliance Pain Point' },
  { value: 'audit-preparation', label: 'Audit Preparation' },
  { value: 'digital-transformation', label: 'Digital Transformation' },
  { value: 'cost-reduction', label: 'Cost Reduction' },
  { value: 'regulatory-change', label: 'Regulatory Change' },
  { value: 'custom', label: 'Custom Message' },
];

export default function LinkedInTrackerPage() {
  const [records, setRecords] = useState<OutreachRecord[]>([]);
  const [dailyCount, setDailyCount] = useState(0);
  const [funnelStats, setFunnelStats] = useState<FunnelStats>({
    sent: 0,
    connected: 0,
    replied: 0,
    meeting: 0,
    closedWon: 0,
    closedLost: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [prospectName, setProspectName] = useState('');
  const [company, setCompany] = useState('');
  const [template, setTemplate] = useState('iso-compliance');
  const [customContext, setCustomContext] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const DAILY_LIMIT = 20;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [outreachRes, statsRes] = await Promise.allSettled([
        api.get('/api/marketing/linkedin/outreach'),
        api.get('/api/marketing/linkedin/stats'),
      ]);

      if (outreachRes.status === 'fulfilled') {
        const data = outreachRes.value.data.data || [];
        setRecords(data);
        // Calculate daily count
        const today = new Date().toDateString();
        const todayCount = data.filter(
          (r: OutreachRecord) => new Date(r.createdAt).toDateString() === today
        ).length;
        setDailyCount(todayCount);
      }

      if (statsRes.status === 'fulfilled') {
        setFunnelStats(statsRes.value.data.data || funnelStats);
      } else {
        // Calculate from records
        const stats: FunnelStats = {
          sent: 0,
          connected: 0,
          replied: 0,
          meeting: 0,
          closedWon: 0,
          closedLost: 0,
        };
        records.forEach((r) => {
          const key =
            r.status === 'CLOSED_WON'
              ? 'closedWon'
              : r.status === 'CLOSED_LOST'
                ? 'closedLost'
                : r.status.toLowerCase();
          if (key in stats) (stats as unknown as Record<string, number>)[key]++;
        });
        setFunnelStats(stats);
      }
    } catch {
      // API may not exist yet
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dailyCount >= DAILY_LIMIT) {
      setError('Daily LinkedIn outreach limit (20) reached. Try again tomorrow.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const response = await api.post('/api/marketing/linkedin/outreach', {
        linkedinUrl,
        prospectName,
        company,
        template,
        customContext,
      });
      const data = response.data.data;
      setGeneratedMessage(data.generatedMessage || '');
      setShowMessage(true);
      setDailyCount((prev) => prev + 1);
      fetchData();

      // Reset form
      setLinkedinUrl('');
      setProspectName('');
      setCompany('');
      setCustomContext('');
    } catch (err) {
      setError((axios.isAxiosError(err) && err.response?.data?.message) || 'Failed to create outreach');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/marketing/linkedin/outreach/${id}`, { status: newStatus });
      setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    } catch {
      setError('Failed to update status');
    }
  };

  const totalFunnel =
    funnelStats.sent +
    funnelStats.connected +
    funnelStats.replied +
    funnelStats.meeting +
    funnelStats.closedWon +
    funnelStats.closedLost;
  const conversionRate =
    totalFunnel > 0 ? ((funnelStats.closedWon / totalFunnel) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-[#080B12]">
      <Sidebar />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">LinkedIn Outreach Tracker</h1>
          <p className="text-gray-400 dark:text-gray-500 mt-1">
            Track and manage LinkedIn outreach campaigns
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Daily Limit Bar */}
        <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-medium">Today&apos;s Outreach</span>
            <span
              className={`text-sm font-bold ${dailyCount >= DAILY_LIMIT ? 'text-red-400' : 'text-blue-400'}`}
            >
              {dailyCount} / {DAILY_LIMIT}
            </span>
          </div>
          <div className="w-full bg-[#080B12] rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${dailyCount >= DAILY_LIMIT ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min((dailyCount / DAILY_LIMIT) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Conversion Funnel Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <FunnelCard label="Sent" count={funnelStats.sent} icon={Send} color="text-gray-300" />
          <FunnelCard
            label="Connected"
            count={funnelStats.connected}
            icon={Users}
            color="text-blue-400"
          />
          <FunnelCard
            label="Replied"
            count={funnelStats.replied}
            icon={MessageSquare}
            color="text-cyan-400"
          />
          <FunnelCard
            label="Meeting"
            count={funnelStats.meeting}
            icon={Calendar}
            color="text-yellow-400"
          />
          <FunnelCard
            label="Won"
            count={funnelStats.closedWon}
            icon={TrendingUp}
            color="text-green-400"
          />
          <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-4 text-center">
            <p className="text-2xl font-bold text-white">{conversionRate}%</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Win Rate</p>
          </div>
        </div>

        {/* New Outreach Form */}
        <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Linkedin className="w-5 h-5 text-blue-400" />
            New Outreach
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                LinkedIn URL *
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#080B12] border border-[#1B3A6B]/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="https://linkedin.com/in/john-doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Prospect Name *
              </label>
              <input
                type="text"
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#080B12] border border-[#1B3A6B]/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Company *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#080B12] border border-[#1B3A6B]/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="Acme Ltd"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Template</label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#080B12] border border-[#1B3A6B]/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {TEMPLATES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Custom Context
              </label>
              <textarea
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-[#080B12] border border-[#1B3A6B]/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Any specific context for the message..."
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting || dailyCount >= DAILY_LIMIT}
                className="px-6 py-2.5 bg-[#1B3A6B] hover:bg-[#244d8a] text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Generate & Send
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Generated Message */}
        {showMessage && generatedMessage && (
          <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">Generated Message</h3>
            <textarea
              value={generatedMessage}
              onChange={(e) => setGeneratedMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-[#080B12] border border-[#1B3A6B]/50 rounded-lg text-gray-200 font-mono text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedMessage);
              }}
              className="mt-3 px-4 py-2 bg-[#1B3A6B] hover:bg-[#244d8a] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
        )}

        {/* Outreach Records Table */}
        <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">All Outreach Records</h2>
          {loading ? (
            <div className="text-gray-400 dark:text-gray-500 text-center py-8">Loading...</div>
          ) : records.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
              No outreach records yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1B3A6B]/30">
                    <th className="text-left py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">
                      Prospect
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">
                      Company
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">
                      Template
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-[#1B3A6B]/10 hover:bg-[#1B3A6B]/10"
                    >
                      <td className="py-3 px-4">
                        <a
                          href={record.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {record.prospectName}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{record.company}</td>
                      <td className="py-3 px-4 text-gray-400 dark:text-gray-500">
                        {record.template}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={record.status}
                          onChange={(e) => handleStatusChange(record.id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs font-medium border-0 focus:outline-none cursor-pointer ${STATUS_COLORS[record.status] || 'bg-gray-500/20 text-gray-300'}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-gray-400 dark:text-gray-500">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function FunnelCard({
  label,
  count,
  icon: Icon,
  color,
}: {
  label: string;
  count: number;
  icon: ElementType;
  color: string;
}) {
  return (
    <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-4 text-center">
      <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
      <p className="text-2xl font-bold text-white">{count}</p>
      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{label}</p>
    </div>
  );
}
