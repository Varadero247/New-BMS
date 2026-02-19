'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@ims/ui';
import { GitBranch, AlertTriangle, ArrowRight, Shield, Zap, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface BowtieRisk {
  id: string;
  title: string;
  referenceNumber: string;
  residualRiskLevel: string;
  category: string;
}

interface Bowtie {
  id: string;
  riskId: string;
  topEvent: string;
  threats: { id: string; description: string; likelihood?: number }[];
  preventionBarriers: { id: string; description: string; effectiveness?: string }[];
  consequences: { id: string; description: string; severity?: number }[];
  mitigationBarriers: { id: string; description: string; effectiveness?: string }[];
  version: string;
  updatedAt: string;
  risk: BowtieRisk;
}

const LEVEL_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  VERY_HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  HIGH: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

function EffectivenessDot({ val }: { val?: string }) {
  const map: Record<string, string> = {
    STRONG: 'bg-green-500',
    ADEQUATE: 'bg-yellow-500',
    WEAK: 'bg-orange-500',
    NONE_EFFECTIVE: 'bg-red-500',
  };
  if (!val) return null;
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${map[val] || 'bg-gray-400'} mr-1`}
      title={val}
    />
  );
}

export default function BowtiePage() {
  const [bowties, setBowties] = useState<Bowtie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/risks/bowtie/all');
        setBowties(r.data.data || []);
      } catch (e) {
        setError(
          (e as any)?.response?.status === 401
            ? 'Session expired. Please log in.'
            : 'Failed to load bow-tie library.'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = bowties.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.risk?.title?.toLowerCase().includes(q) ||
      b.risk?.referenceNumber?.toLowerCase().includes(q) ||
      b.topEvent?.toLowerCase().includes(q);
    const matchLevel = levelFilter === 'all' || b.risk?.residualRiskLevel === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Bow-Tie Library</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Threat-barrier-event-barrier-consequence analysis for high-level risks
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-5 pb-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {bowties.length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Total Bow-Ties</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4 text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {
                    bowties.filter((b) =>
                      ['CRITICAL', 'VERY_HIGH'].includes(b.risk?.residualRiskLevel)
                    ).length
                  }
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Critical / Very High
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4 text-center">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {bowties.reduce((a, b) => a + (b.threats?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Total Threats</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4 text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {bowties.reduce(
                    (a, b) =>
                      a + (b.preventionBarriers?.length || 0) + (b.mitigationBarriers?.length || 0),
                    0
                  )}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Total Barriers</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <input
                type="text"
                placeholder="Search risks or events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="VERY_HIGH">Very High</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse h-56 bg-gray-200 dark:bg-gray-700 rounded-xl"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <GitBranch className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No bow-tie analyses found
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Bow-tie analysis is available for HIGH, VERY HIGH and CRITICAL risks from the risk
                  detail page.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((bt) => (
                <Card key={bt.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-gray-500 dark:text-gray-400 shrink-0">
                            {bt.risk?.referenceNumber || '—'}
                          </span>
                          {bt.risk?.residualRiskLevel && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[bt.risk.residualRiskLevel] || 'bg-gray-100 text-gray-700'}`}
                            >
                              {bt.risk.residualRiskLevel}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-snug truncate">
                          {bt.risk?.title || 'Unknown Risk'}
                        </p>
                      </div>
                      <Link
                        href={`/risks/${bt.riskId}`}
                        className="ml-3 flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline shrink-0"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>

                    {/* Top Event */}
                    <div className="mb-4 p-2.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        <span className="text-xs font-semibold text-orange-800 dark:text-orange-300 uppercase tracking-wider">
                          Top Event
                        </span>
                      </div>
                      <p className="text-sm text-orange-900 dark:text-orange-200 mt-0.5 leading-snug">
                        {bt.topEvent}
                      </p>
                    </div>

                    {/* Threats / Consequences counts */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center gap-1.5 mb-1">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                          <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                            Threats
                          </span>
                        </div>
                        <p className="text-lg font-bold text-red-700 dark:text-red-300">
                          {bt.threats?.length || 0}
                        </p>
                        <div className="mt-1 space-y-0.5">
                          {(bt.threats || []).slice(0, 2).map((t) => (
                            <p
                              key={t.id}
                              className="text-xs text-red-600 dark:text-red-400 truncate"
                            >
                              • {t.description}
                            </p>
                          ))}
                          {(bt.threats?.length || 0) > 2 && (
                            <p className="text-xs text-red-400 dark:text-red-500">
                              +{bt.threats.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center gap-1.5 mb-1">
                          <ArrowRight className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                          <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                            Consequences
                          </span>
                        </div>
                        <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                          {bt.consequences?.length || 0}
                        </p>
                        <div className="mt-1 space-y-0.5">
                          {(bt.consequences || []).slice(0, 2).map((c) => (
                            <p
                              key={c.id}
                              className="text-xs text-purple-600 dark:text-purple-400 truncate"
                            >
                              • {c.description}
                            </p>
                          ))}
                          {(bt.consequences?.length || 0) > 2 && (
                            <p className="text-xs text-purple-400 dark:text-purple-500">
                              +{bt.consequences.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Barriers */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Shield className="h-3.5 w-3.5" />
                      <span>
                        {bt.preventionBarriers?.length || 0} prevention +{' '}
                        {bt.mitigationBarriers?.length || 0} mitigation barriers
                      </span>
                    </div>

                    {/* Prevention Barriers */}
                    {(bt.preventionBarriers?.length || 0) > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {bt.preventionBarriers.slice(0, 3).map((bar) => (
                          <span
                            key={bar.id}
                            className="inline-flex items-center px-2 py-0.5 rounded bg-green-50 dark:bg-green-900/20 text-xs text-green-700 dark:text-green-300"
                          >
                            <EffectivenessDot val={bar.effectiveness} />
                            {bar.description.length > 28
                              ? bar.description.slice(0, 28) + '…'
                              : bar.description}
                          </span>
                        ))}
                        {bt.preventionBarriers.length > 3 && (
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
                            +{bt.preventionBarriers.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                      <span>Version {bt.version || '1.0'}</span>
                      <span>Updated {new Date(bt.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
