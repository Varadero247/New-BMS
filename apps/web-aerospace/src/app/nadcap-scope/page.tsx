'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Award,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Plus,
  X,
  Building2,
  Calendar,
  User,
  Tag,
  ChevronRight,
  Info,
  Search,
} from 'lucide-react';

interface NadcapScope {
  id: string;
  supplierName: string;
  supplierCode: string;
  nadcapCertRef: string;
  certExpiryDate: string;
  issuedByPri?: boolean;
  commodityCodes: string[];
  commodityCodesRequired: string[];
  processDescription?: string;
  auditBoard?: string;
  lastAuditDate?: string;
  nextAuditDate?: string;
  verifiedBy?: string;
  verificationDate?: string;
  approvedBy?: string;
  notes?: string;
  status: 'COMPLIANT' | 'GAP_FOUND' | 'EXPIRED' | 'PENDING_REVIEW';
}

const MOCK_RECORDS: NadcapScope[] = [
  {
    id: '1',
    supplierName: 'Precision Heat Treatment Co.',
    supplierCode: 'PHT-001',
    nadcapCertRef: 'NADCAP-2024-HT-78421',
    certExpiryDate: '2026-06-30',
    issuedByPri: true,
    commodityCodes: ['HT', 'HT-01', 'HT-07'],
    commodityCodesRequired: ['HT', 'HT-01', 'HT-07'],
    processDescription: 'Heat treatment of aerospace aluminium alloys',
    verifiedBy: 'Q. Engineer A. Thompson',
    verificationDate: '2026-01-15',
    status: 'COMPLIANT',
  },
  {
    id: '2',
    supplierName: 'Advanced Coatings Ltd',
    supplierCode: 'ACL-042',
    nadcapCertRef: 'NADCAP-2024-CC-12093',
    certExpiryDate: '2025-12-31',
    issuedByPri: false,
    commodityCodes: ['CC', 'CC-01'],
    commodityCodesRequired: ['CC', 'CC-01', 'CC-04'],
    processDescription: 'Chemical processing and plating',
    verifiedBy: 'Q. Engineer B. Wilson',
    verificationDate: '2026-01-10',
    status: 'GAP_FOUND',
    notes: 'CC-04 (Anodising Type III) not covered',
  },
  {
    id: '3',
    supplierName: 'Global NDT Services',
    supplierCode: 'GND-007',
    nadcapCertRef: 'NADCAP-2023-NDT-45001',
    certExpiryDate: '2025-11-30',
    commodityCodes: ['NDT-PT', 'NDT-MT'],
    commodityCodesRequired: ['NDT-PT', 'NDT-MT', 'NDT-UT'],
    processDescription: 'Non-destructive testing',
    verifiedBy: 'Q. Engineer C. Davis',
    verificationDate: '2025-11-01',
    status: 'EXPIRED',
  },
  {
    id: '4',
    supplierName: 'Electro-Composites Inc.',
    supplierCode: 'ECI-089',
    nadcapCertRef: 'NADCAP-2025-CP-67234',
    certExpiryDate: '2027-03-31',
    issuedByPri: true,
    commodityCodes: ['CP', 'CP-06', 'CP-12'],
    commodityCodesRequired: ['CP', 'CP-06'],
    processDescription: 'Composite fabrication',
    verifiedBy: 'Q. Engineer D. Martin',
    verificationDate: '2026-02-01',
    status: 'COMPLIANT',
  },
];

const statusConfig: Record<NadcapScope['status'], { label: string; color: string; badgeClass: string; icon: React.ElementType }> = {
  COMPLIANT: { label: 'Compliant', color: 'text-green-700', badgeClass: 'bg-green-100 text-green-700', icon: CheckCircle },
  GAP_FOUND: { label: 'Gap Found', color: 'text-amber-700', badgeClass: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  EXPIRED: { label: 'Expired', color: 'text-red-700', badgeClass: 'bg-red-100 text-red-700', icon: XCircle },
  PENDING_REVIEW: { label: 'Pending Review', color: 'text-blue-700', badgeClass: 'bg-blue-100 text-blue-700', icon: Clock },
};

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function expiryColor(dateStr: string) {
  const now = new Date();
  const expiry = new Date(dateStr);
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return 'text-red-600 font-semibold';
  if (diffDays < 90) return 'text-amber-600 font-semibold';
  return 'text-green-700';
}

function getGaps(record: NadcapScope) {
  return record.commodityCodesRequired.filter((c) => !record.commodityCodes.includes(c));
}

export default function NadcapScopePage() {
  const [records, setRecords] = useState<NadcapScope[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NadcapScope | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    supplierName: '',
    supplierCode: '',
    nadcapCertRef: '',
    certExpiryDate: '',
    issuedByPri: false,
    commodityCodesRaw: '',
    commodityCodesRequiredRaw: '',
    processDescription: '',
    verifiedBy: '',
    verificationDate: '',
    status: 'PENDING_REVIEW' as NadcapScope['status'],
    notes: '',
  });

  useEffect(() => {
    api.get('/nadcap-scope')
      .then((r) => setRecords(r.data.data))
      .catch(() => setRecords(MOCK_RECORDS))
      .finally(() => setLoading(false));
  }, []);

  const total = records.length;
  const compliant = records.filter((r) => r.status === 'COMPLIANT').length;
  const gapFound = records.filter((r) => r.status === 'GAP_FOUND').length;
  const expired = records.filter((r) => r.status === 'EXPIRED').length;

  const filtered = records.filter((r) =>
    r.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    r.supplierCode.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload: Omit<NadcapScope, 'id'> = {
      supplierName: form.supplierName,
      supplierCode: form.supplierCode,
      nadcapCertRef: form.nadcapCertRef,
      certExpiryDate: form.certExpiryDate,
      issuedByPri: form.issuedByPri,
      commodityCodes: form.commodityCodesRaw.split(',').map((s) => s.trim()).filter(Boolean),
      commodityCodesRequired: form.commodityCodesRequiredRaw.split(',').map((s) => s.trim()).filter(Boolean),
      processDescription: form.processDescription,
      verifiedBy: form.verifiedBy,
      verificationDate: form.verificationDate || undefined,
      status: form.status,
      notes: form.notes || undefined,
    };
    try {
      const r = await api.post('/nadcap-scope', payload);
      setRecords((prev) => [...prev, r.data.data]);
    } catch {
      setRecords((prev) => [...prev, { ...payload, id: String(Date.now()) }]);
    } finally {
      setSubmitting(false);
      setShowAdd(false);
      setForm({
        supplierName: '', supplierCode: '', nadcapCertRef: '', certExpiryDate: '',
        issuedByPri: false, commodityCodesRaw: '', commodityCodesRequiredRaw: '',
        processDescription: '', verifiedBy: '', verificationDate: '',
        status: 'PENDING_REVIEW', notes: '',
      });
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <Award className="h-7 w-7 text-blue-600" />
              Nadcap Commodity Code Scope Verification
            </h1>
            <p className="text-sm text-blue-700 mt-1">AS9100D 8.5.1.2 — Special Process Supplier Nadcap Accreditation</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Record
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <Award className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{total}</p>
                <p className="text-xs text-gray-500">Total Records</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-green-200">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-700">{compliant}</p>
                <p className="text-xs text-green-600">Compliant</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-amber-200">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-amber-700">{gapFound}</p>
                <p className="text-xs text-amber-600">Gap Found</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-red-200">
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-700">{expired}</p>
                <p className="text-xs text-red-600">Expired</p>
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
            placeholder="Search supplier or code..."
            className="w-full pl-9 pr-4 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-blue-500">Loading records...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((record) => {
              const cfg = statusConfig[record.status];
              const StatusIcon = cfg.icon;
              const gaps = getGaps(record);
              return (
                <Card
                  key={record.id}
                  className="bg-white border-blue-100 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => setSelected(record)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-mono text-blue-500 mb-0.5">{record.supplierCode}</p>
                        <CardTitle className="text-base text-blue-900">{record.supplierName}</CardTitle>
                      </div>
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium shrink-0 ${cfg.badgeClass}`}>
                        <StatusIcon className="h-3 w-3" />{cfg.label}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="font-mono text-gray-600">{record.nadcapCertRef}</span>
                      {record.issuedByPri && (
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs">PRI Issued</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3 text-blue-400 shrink-0" />
                      <span className="text-gray-500">Expires:</span>
                      <span className={expiryColor(record.certExpiryDate)}>{fmt(record.certExpiryDate)}</span>
                    </div>
                    {record.processDescription && (
                      <p className="text-xs text-gray-600 italic">{record.processDescription}</p>
                    )}
                    {/* Commodity Codes */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">Commodity Codes</p>
                      <div className="flex flex-wrap gap-1">
                        {record.commodityCodesRequired.map((code) => {
                          const covered = record.commodityCodes.includes(code);
                          return (
                            <span
                              key={code}
                              className={`text-xs px-2 py-0.5 rounded font-mono font-medium ${
                                covered ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {code}{!covered && ' !'}
                            </span>
                          );
                        })}
                        {record.commodityCodes.filter((c) => !record.commodityCodesRequired.includes(c)).map((code) => (
                          <span key={code} className="text-xs px-2 py-0.5 rounded font-mono bg-gray-100 text-gray-500">{code}</span>
                        ))}
                      </div>
                      {gaps.length > 0 && (
                        <p className="text-xs text-red-600 font-medium">
                          {gaps.length} scope gap{gaps.length > 1 ? 's' : ''}: {gaps.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      {record.verifiedBy && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <User className="h-3 w-3" />{record.verifiedBy}
                        </p>
                      )}
                      <span className="flex items-center gap-1 text-xs text-blue-500 ml-auto">
                        Details <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-400">No records found.</div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-blue-100">
              <div>
                <p className="text-xs font-mono text-blue-500">{selected.supplierCode}</p>
                <h2 className="text-lg font-semibold text-blue-900">{selected.supplierName}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-gray-500">Cert Reference</p><p className="font-mono text-gray-800">{selected.nadcapCertRef}</p></div>
                <div><p className="text-xs text-gray-500">Expiry</p><p className={expiryColor(selected.certExpiryDate)}>{fmt(selected.certExpiryDate)}</p></div>
                <div><p className="text-xs text-gray-500">Status</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusConfig[selected.status].badgeClass}`}>{selected.status}</span>
                </div>
                <div><p className="text-xs text-gray-500">PRI Issued</p><p>{selected.issuedByPri ? 'Yes' : 'No'}</p></div>
                <div><p className="text-xs text-gray-500">Verified By</p><p>{selected.verifiedBy || '—'}</p></div>
                <div><p className="text-xs text-gray-500">Verification Date</p><p>{fmt(selected.verificationDate)}</p></div>
                <div><p className="text-xs text-gray-500">Approved By</p><p>{selected.approvedBy || '—'}</p></div>
                <div><p className="text-xs text-gray-500">Last Audit</p><p>{fmt(selected.lastAuditDate)}</p></div>
                <div><p className="text-xs text-gray-500">Next Audit</p><p>{fmt(selected.nextAuditDate)}</p></div>
              </div>
              {selected.processDescription && (
                <div><p className="text-xs font-semibold text-blue-700 uppercase mb-1">Process Description</p>
                  <p className="text-sm text-gray-700">{selected.processDescription}</p></div>
              )}
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Scope Analysis</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Held Codes</p>
                    <div className="flex flex-wrap gap-1">
                      {selected.commodityCodes.map((c) => (
                        <span key={c} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-mono">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Required Codes</p>
                    <div className="flex flex-wrap gap-1">
                      {selected.commodityCodesRequired.map((c) => {
                        const ok = selected.commodityCodes.includes(c);
                        return (
                          <span key={c} className={`text-xs px-2 py-0.5 rounded font-mono ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 font-bold'}`}>{c}</span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {getGaps(selected).length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Scope Gaps Identified
                    </p>
                    <p className="text-sm text-red-600 mt-1">Missing: {getGaps(selected).join(', ')}</p>
                  </div>
                )}
              </div>
              {selected.notes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                    <Info className="h-3 w-3" /> Notes
                  </p>
                  <p className="text-sm text-amber-800 mt-1">{selected.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-blue-100">
              <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" /> New Nadcap Scope Record
              </h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Supplier Name *</label>
                  <input required value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Supplier Code *</label>
                  <input required value={form.supplierCode} onChange={(e) => setForm({ ...form, supplierCode: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cert Reference *</label>
                  <input required value={form.nadcapCertRef} onChange={(e) => setForm({ ...form, nadcapCertRef: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cert Expiry Date *</label>
                  <input required type="date" value={form.certExpiryDate} onChange={(e) => setForm({ ...form, certExpiryDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as NadcapScope['status'] })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="COMPLIANT">COMPLIANT</option>
                    <option value="GAP_FOUND">GAP_FOUND</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Commodity Codes Held (comma-separated)</label>
                  <input value={form.commodityCodesRaw} onChange={(e) => setForm({ ...form, commodityCodesRaw: e.target.value })}
                    placeholder="e.g. HT, HT-01, HT-07"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Commodity Codes Required (comma-separated)</label>
                  <input value={form.commodityCodesRequiredRaw} onChange={(e) => setForm({ ...form, commodityCodesRequiredRaw: e.target.value })}
                    placeholder="e.g. HT, HT-01, HT-07"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Process Description</label>
                  <textarea value={form.processDescription} onChange={(e) => setForm({ ...form, processDescription: e.target.value })}
                    rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Verified By</label>
                  <input value={form.verifiedBy} onChange={(e) => setForm({ ...form, verifiedBy: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Verification Date</label>
                  <input type="date" value={form.verificationDate} onChange={(e) => setForm({ ...form, verificationDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="pri" checked={form.issuedByPri} onChange={(e) => setForm({ ...form, issuedByPri: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600" />
                  <label htmlFor="pri" className="text-sm text-gray-700">Issued by PRI (Performance Review Institute)</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60">
                  {submitting ? 'Saving...' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
