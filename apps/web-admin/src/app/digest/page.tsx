'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { Newspaper, RefreshCw, CheckCircle2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Digest {
  id?: string;
  period: string;
  highlights: string[];
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  generatedAt: string;
}

const MOCK_DIGEST: Digest = {
  id: 'digest-1',
  period: 'Feb 17-21 2026',
  highlights: [
    'MRR up 12% — strongest week of Q1',
    '15 new leads acquired via LinkedIn and referral channels',
    '3 deals closed, totalling £8,400 new ARR',
    'Customer health score average improved from 71 to 76',
    'Churn rate held steady at 1.2% — below target of 2%',
  ],
  sentiment: 'POSITIVE',
  generatedAt: '2026-02-21T18:00:00Z',
};

const MOCK_HISTORY: Digest[] = [
  {
    id: 'digest-1',
    period: 'Feb 17-21 2026',
    highlights: ['MRR up 12%', '15 new leads', '3 deals closed'],
    sentiment: 'POSITIVE',
    generatedAt: '2026-02-21T18:00:00Z',
  },
  {
    id: 'digest-2',
    period: 'Feb 10-14 2026',
    highlights: ['MRR flat', '9 new leads', '1 deal closed'],
    sentiment: 'NEUTRAL',
    generatedAt: '2026-02-14T18:00:00Z',
  },
  {
    id: 'digest-3',
    period: 'Feb 3-7 2026',
    highlights: ['MRR down 3%', '6 new leads', '0 deals closed', '2 churns'],
    sentiment: 'NEGATIVE',
    generatedAt: '2026-02-07T18:00:00Z',
  },
  {
    id: 'digest-4',
    period: 'Jan 27-31 2026',
    highlights: ['MRR up 8%', '12 new leads', '2 deals closed'],
    sentiment: 'POSITIVE',
    generatedAt: '2026-01-31T18:00:00Z',
  },
];

function SentimentBadge({ sentiment }: { sentiment: Digest['sentiment'] }) {
  const map = {
    POSITIVE: {
      cls: 'bg-green-900/30 text-green-400 border border-green-700',
      icon: <TrendingUp className="w-3 h-3" />,
    },
    NEUTRAL: {
      cls: 'bg-gray-700/40 text-gray-400 border border-gray-600',
      icon: <Minus className="w-3 h-3" />,
    },
    NEGATIVE: {
      cls: 'bg-red-900/30 text-red-400 border border-red-700',
      icon: <TrendingDown className="w-3 h-3" />,
    },
  };
  const { cls, icon } = map[sentiment];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      {icon}
      {sentiment}
    </span>
  );
}

export default function DigestPage() {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [history, setHistory] = useState<Digest[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const r = await api.get('/api/marketing/digest');
      const data = r.data.data;
      setDigest(data?.latest || MOCK_DIGEST);
      setHistory(data?.history || MOCK_HISTORY);
    } catch {
      setDigest(MOCK_DIGEST);
      setHistory(MOCK_HISTORY);
      setError('Digest API unavailable — showing demo data.');
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    setGenerating(true);
    try {
      const r = await api.post('/api/marketing/digest/generate', {});
      const newDigest = r.data.data;
      if (newDigest) {
        setDigest(newDigest);
        setHistory((prev) => [newDigest, ...prev]);
      }
    } catch {
      setError('Could not generate digest — API unavailable.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0B1E38]">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Marketing Digest</h1>
              <p className="text-gray-400 text-sm">Weekly AI-generated marketing summary</p>
            </div>
          </div>
          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {generating ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Generate New Digest
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <>
            {/* Latest Digest Card */}
            {digest && (
              <div className="bg-[#112240] border border-white/10 rounded-xl p-6 mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Latest Digest</h2>
                    <p className="text-gray-400 text-sm mt-0.5">{digest.period}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <SentimentBadge sentiment={digest.sentiment} />
                    <span className="text-gray-500 text-xs">
                      Generated {new Date(digest.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {digest.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-200 text-sm">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History Table */}
            <div className="bg-[#112240] border border-white/10 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-base font-semibold text-white">Digest History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-6 py-3 text-gray-400 font-medium">Period</th>
                      <th className="text-left px-6 py-3 text-gray-400 font-medium">Top Highlight</th>
                      <th className="text-center px-6 py-3 text-gray-400 font-medium">Sentiment</th>
                      <th className="text-right px-6 py-3 text-gray-400 font-medium">Generated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((d, i) => (
                      <tr key={d.id || i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-6 py-3 text-white font-medium">{d.period}</td>
                        <td className="px-6 py-3 text-gray-300">{d.highlights[0]}</td>
                        <td className="px-6 py-3 text-center">
                          <SentimentBadge sentiment={d.sentiment} />
                        </td>
                        <td className="px-6 py-3 text-gray-400 text-right">
                          {new Date(d.generatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
