'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Plus,
  X,
  Search,
  RefreshCw,
  Calendar,
  Tag,
  ChevronRight,
  Building2,
  Award,
} from 'lucide-react';

interface Certification {
  standard: string;
  issuer: string;
  expiry: string;
  scope: string;
}

interface OasisRecord {
  id: string;
  supplierName: string;
  cageCode?: string;
  duns?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'NOT_FOUND';
  certifications: Certification[];
  lastLookupDate: string;
  lookupNotes?: string;
}

const MOCK_RECORDS: OasisRecord[] = [
  {
    id: '1',
    supplierName: 'Precision Heat Treatment Co.',
    cageCode: '1A2B3',
    status: 'ACTIVE',
    certifications: [
      {
        standard: 'AS9100D',
        issuer: 'BSI',
        expiry: '2027-01-01',
        scope: 'Design and manufacture of aerospace components',
      },
    ],
    lastLookupDate: '2026-02-01T00:00:00Z',
  },
  {
    id: '2',
    supplierName: 'Advanced Coatings Ltd',
    cageCode: '4D5E6',
    status: 'ACTIVE',
    certifications: [
      {
        standard: 'AS9100D',
        issuer: "Lloyd's Register",
        expiry: '2026-06-30',
        scope: 'Chemical processing and plating',
      },
      {
        standard: 'AS9110C',
        issuer: "Lloyd's Register",
        expiry: '2026-06-30',
        scope: 'MRO',
      },
    ],
    lastLookupDate: '2026-02-10T00:00:00Z',
  },
  {
    id: '3',
    supplierName: 'Old Parts Supplier Inc.',
    cageCode: '9Z8Y7',
    status: 'SUSPENDED',
    certifications: [],
    lastLookupDate: '2026-01-15T00:00:00Z',
    lookupNotes: 'Certificate suspended Jan 2026 — audit non-conformity',
  },
  {
    id: '4',
    supplierName: 'Global NDT Services',
    cageCode: '3F4G5',
    status: 'ACTIVE',
    certifications: [
      {
        standard: 'NAS410',
        issuer: 'Nadcap',
        expiry: '2026-11-30',
        scope: 'NDT Level III',
      },
    ],
    lastLookupDate: '2026-02-05T00:00:00Z',
  },
];

const statusConfig: Record<OasisRecord['status'], { label: string; badgeClass: string; icon: React.ElementType }> = {
  ACTIVE: { label: 'Active', badgeClass: 'bg-green-100 text-green-700', icon: CheckCircle },
  SUSPENDED: { label: 'Suspended', badgeClass: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  REVOKED: { label: 'Revoked', badgeClass: 'bg-red-100 text-red-700', icon: XCircle },
  NOT_FOUND: { label: 'Not Found', badgeClass: 'bg-gray-100 text-gray-600', icon: XCircle },
};

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysSince(dateStr: string) {
  const now = new Date();
  const d = new Date(dateStr);
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function certExpiryColor(dateStr: string) {
  const now = new Date();
  const expiry = new Date(dateStr);
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return 'text-red-600';
  if (diffDays < 90) return 'text-amber-600';
  return 'text-green-700';
}

export default function OasisPage() {
  const [records, setRecords] = useState<OasisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLookup, setShowLookup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [lookupResult, setLookupResult] = useState<OasisRecord | null>(null);
  const [form, setForm] = useState({
    supplierName: '',
    cageCode: '',
    duns: '',
  });

  useEffect(() => {
    api.get('/oasis')
      .then((r) => setRecords(r.data.data))
      .catch(() => setRecords(MOCK_RECORDS))
      .finally(() => setLoading(false));
  }, []);

  const total = records.length;
  const active = records.filter((r) => r.status === 'ACTIVE').length;
  const suspendedRevoked = records.filter((r) => r.status === 'SUSPENDED' || r.status === 'REVOKED').length;
  const staleLookup = records.filter((r) => daysSince(r.lastLookupDate) > 30).length;

  const filtered = records.filter((r) =>
    r.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    (r.cageCode && r.cageCode.toLowerCase().includes(search.toLowerCase())) ||
    (r.duns && r.duns.includes(search))
  );

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setLookupResult(null);
    try {
      const r = await api.post('/oasis/lookup', {
        supplierName: form.supplierName,
        ...(form.cageCode && { cageCode: form.cageCode }),
        ...(form.duns && { duns: form.duns }),
      });
      const result: OasisRecord = r.data.data;
      setLookupResult(result);
      setRecords((prev) => {
        const exists = prev.findIndex((p) => p.id === result.id);
        if (exists >= 0) {
          const updated = [...prev];
          updated[exists] = result;
          return updated;
        }
        return [result, ...prev];
      });
    } catch {
      const mockResult: OasisRecord = {
        id: String(Date.now()),
        supplierName: form.supplierName,
        cageCode: form.cageCode || undefined,
        duns: form.duns || undefined,
        status: 'ACTIVE',
        certifications: [],
        lastLookupDate: new Date().toISOString(),
        lookupNotes: 'Mock lookup result — API unavailable',
      };
      setLookupResult(mockResult);
      setRecords((prev) => [mockResult, ...prev]);
    } finally {
      setSubmitting(false);
    }
  }

  function resetLookup() {
    setLookupResult(null);
    setForm({ supplierName: '', cageCode: '', duns: '' });
    setShowLookup(false);
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <Database className="h-7 w-7 text-blue-600" />
              OASIS Database Integration
            </h1>
            <p className="text-sm text-blue-700 mt-1">AS9100D S4-04 — Online Aerospace Supplier Information System</p>
          </div>
          <button
            onClick={() => setShowLookup(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Search className="h-4 w-4" /> New Lookup
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <Database className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{total}</p>
                <p className="text-xs text-gray-500">Total Queried</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-green-200">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-700">{active}</p>
                <p className="text-xs text-green-600">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-amber-200">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-amber-700">{suspendedRevoked}</p>
                <p className="text-xs text-amber-600">Suspended / Revoked</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-200">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{staleLookup}</p>
                <p className="text-xs text-blue-600">Due Re-lookup (&gt;30d)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplier, CAGE, or DUNS..."
            className="w-full pl-9 pr-4 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-blue-500">Loading OASIS records...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((record) => {
              const cfg = statusConfig[record.status];
              const StatusIcon = cfg.icon;
              const stale = daysSince(record.lastLookupDate) > 30;
              return (
                <Card key={record.id} className="bg-white border-blue-100 hover:border-blue-300 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base text-blue-900 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-500 shrink-0" />
                          {record.supplierName}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-1">
                          {record.cageCode && (
                            <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              CAGE: {record.cageCode}
                            </span>
                          )}
                          {record.duns && (
                            <span className="text-xs font-mono text-gray-500">DUNS: {record.duns}</span>
                          )}
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium shrink-0 ${cfg.badgeClass}`}>
                        <StatusIcon className="h-3 w-3" />{cfg.label}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    {/* Certifications */}
                    {record.certifications.length > 0 ? (
                      <div className="space-y-2">
                        {record.certifications.map((cert, i) => (
                          <div key={i} className="flex items-start justify-between bg-blue-50 rounded-lg p-2">
                            <div className="flex items-start gap-2">
                              <Award className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-blue-800">{cert.standard}</p>
                                <p className="text-xs text-gray-500">{cert.issuer}</p>
                                <p className="text-xs text-gray-600 italic mt-0.5">{cert.scope}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <p className="text-xs text-gray-500">Expires</p>
                              <p className={`text-xs font-medium ${certExpiryColor(cert.expiry)}`}>{fmt(cert.expiry)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No certifications on record.</p>
                    )}
                    {record.lookupNotes && (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-700">{record.lookupNotes}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-blue-50">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <RefreshCw className="h-3 w-3" />
                        Last lookup: {fmt(record.lastLookupDate)}
                        {stale && (
                          <span className="ml-1 bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full text-xs font-medium">
                            Stale
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setForm({ supplierName: record.supplierName, cageCode: record.cageCode || '', duns: record.duns || '' });
                          setShowLookup(true);
                        }}
                        className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        Re-lookup <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && !loading && (
              <div className="col-span-2 text-center py-12 text-gray-400">
                <Database className="h-10 w-10 mx-auto mb-2 text-blue-200" />
                No OASIS records found. Start a new lookup.
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Lookup Modal */}
      {showLookup && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-blue-100">
              <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" /> OASIS Supplier Lookup
              </h2>
              <button onClick={resetLookup} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {lookupResult ? (
              <div className="p-5 space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-blue-900">{lookupResult.supplierName}</p>
                      {lookupResult.cageCode && (
                        <p className="text-xs font-mono text-blue-600">CAGE: {lookupResult.cageCode}</p>
                      )}
                    </div>
                    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${statusConfig[lookupResult.status].badgeClass}`}>
                      {lookupResult.status}
                    </span>
                  </div>
                  {lookupResult.certifications.length > 0 ? (
                    <div className="space-y-2">
                      {lookupResult.certifications.map((cert, i) => (
                        <div key={i} className="bg-white rounded-lg p-2 border border-blue-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-blue-800">{cert.standard}</span>
                            <span className={`text-xs ${certExpiryColor(cert.expiry)}`}>Exp: {fmt(cert.expiry)}</span>
                          </div>
                          <p className="text-xs text-gray-500">{cert.issuer} — {cert.scope}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No active certifications found.</p>
                  )}
                  {lookupResult.lookupNotes && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-700">{lookupResult.lookupNotes}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  Lookup timestamp: {fmt(lookupResult.lastLookupDate)}
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={resetLookup}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLookup} className="p-5 space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                  Enter at least a Supplier Name. CAGE Code or DUNS improve match accuracy.
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Supplier Name *</label>
                  <input
                    required
                    value={form.supplierName}
                    onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                    placeholder="e.g. Precision Heat Treatment Co."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    CAGE Code <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <input
                      value={form.cageCode}
                      onChange={(e) => setForm({ ...form, cageCode: e.target.value })}
                      placeholder="e.g. 1A2B3"
                      className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    DUNS Number <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    value={form.duns}
                    onChange={(e) => setForm({ ...form, duns: e.target.value })}
                    placeholder="e.g. 123456789"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <button type="button" onClick={resetLookup} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60">
                    {submitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Querying OASIS...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" /> Run Lookup
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
