'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@ims/ui';
import { Tag, Search, Loader2, Zap, Bug, ArrowUpCircle, AlertTriangle, Shield } from 'lucide-react';
import { api } from '@/lib/api';

interface Changelog {
  id: string;
  version: string;
  title: string;
  type: string;
  summary: string;
  details?: string;
  publishedAt: string;
  author?: string;
}

const MOCK_CHANGELOGS: Changelog[] = [
  { id: '1', version: '2.8.0', title: 'Phase 17 — Compliance Gap Closure', type: 'FEATURE', summary: 'Added 20 new compliance modules across Health & Safety, Medical (HIPAA), Chemicals (COSHH), ESG (GRI/TCFD), InfoSec (ISO 27001:2022), and Aerospace (AS9100D).', details: '18 new frontend pages, 443 new tests, 5 Prisma schema updates.', publishedAt: '2026-02-22T08:00:00Z', author: 'Platform Team' },
  { id: '2', version: '2.7.0', title: 'Phase 16 — Setup Wizard & Admin Dashboard', type: 'FEATURE', summary: 'New guided setup wizard with 5 configuration steps. Admin dashboard with user management, billing overview, and system health monitoring.', publishedAt: '2026-02-21T08:00:00Z', author: 'Platform Team' },
  { id: '3', version: '2.6.2', title: 'Security Patch — JWT & Rate Limiting', type: 'SECURITY', summary: 'Enhanced JWT key rotation policy, per-user rate limiting tiers (basic/standard/premium/enterprise), and RASP injection detection improvements.', publishedAt: '2026-02-20T08:00:00Z', author: 'Security Team' },
  { id: '4', version: '2.6.1', title: 'Performance improvements for large datasets', type: 'IMPROVEMENT', summary: 'Optimised database queries for large dataset pagination. k6 load test p95 latency reduced from 800ms to 280ms. Added connection pooling across all 42 API services.', publishedAt: '2026-02-19T08:00:00Z', author: 'Backend Team' },
  { id: '5', version: '2.6.0', title: '100/100 Code Evaluation Score', type: 'IMPROVEMENT', summary: 'Achieved perfect composite score across security, architecture, and code quality dimensions. All 0 TypeScript errors, all tests passing.', publishedAt: '2026-02-20T00:00:00Z', author: 'Platform Team' },
  { id: '6', version: '2.5.0', title: 'In-memory to Prisma migration', type: 'IMPROVEMENT', summary: 'All in-memory Map stores migrated to persistent Prisma models: MSP links, API keys, SAML config, SCIM tokens, audit plans.', publishedAt: '2026-02-21T00:00:00Z', author: 'Backend Team' },
  { id: '7', version: '2.4.1', title: 'Fix: Gateway CORS header conflict', type: 'BUGFIX', summary: 'Fixed double Access-Control-Allow-Origin header when downstream services returned their own CORS headers. Gateway now strips downstream headers via onProxyRes.', publishedAt: '2026-02-18T00:00:00Z', author: 'Platform Team' },
  { id: '8', version: '2.4.0', title: 'Multi-tenant security hardening', type: 'FEATURE', summary: 'Row-level security for all 674 tables, per-service PostgreSQL roles, tenant isolation enforcement in all API routes.', publishedAt: '2026-02-18T00:00:00Z', author: 'Security Team' },
];

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: typeof Tag }> = {
  FEATURE: { label: 'Feature', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: Zap },
  BUGFIX: { label: 'Bug Fix', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: Bug },
  IMPROVEMENT: { label: 'Improvement', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', icon: ArrowUpCircle },
  BREAKING: { label: 'Breaking Change', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: AlertTriangle },
  SECURITY: { label: 'Security', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', icon: Shield },
};

export default function ReleaseNotesPage() {
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/release-notes');
        setChangelogs(r.data.data?.changelogs || MOCK_CHANGELOGS);
      } catch {
        setChangelogs(MOCK_CHANGELOGS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = changelogs.filter((c) => {
    const matchSearch = searchTerm === '' || c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.version.toLowerCase().includes(searchTerm.toLowerCase()) || c.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === '' || c.type === typeFilter;
    return matchSearch && matchType;
  });

  const typeCounts: Record<string, number> = {};
  changelogs.forEach((c) => { typeCounts[c.type] = (typeCounts[c.type] || 0) + 1; });

  if (loading) return <div className="p-8 flex items-center justify-center min-h-96"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Release Notes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Platform changelog — features, fixes, and improvements</p>
        </div>

        {/* Type counts */}
        <div className="flex flex-wrap gap-3 mb-6">
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return typeCounts[key] ? (
              <button key={key} onClick={() => setTypeFilter(typeFilter === key ? '' : key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${typeFilter === key ? cfg.color + ' border-transparent shadow' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}>
                <Icon className="h-3.5 w-3.5" /> {cfg.label} ({typeCounts[key]})
              </button>
            ) : null;
          })}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search release notes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
        </div>

        {/* Changelog entries */}
        <div className="space-y-4">
          {filtered.map((c) => {
            const cfg = TYPE_CONFIG[c.type] || TYPE_CONFIG.FEATURE;
            const Icon = cfg.icon;
            return (
              <Card key={c.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-lg ${cfg.color} shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">v{c.version}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{c.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{c.summary}</p>
                        {c.details && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{c.details}</p>}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(c.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          {c.author && <span className="text-xs text-gray-400 dark:text-gray-500">by {c.author}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No release notes found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
