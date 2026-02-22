'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Users,
  HardHat,
  CheckCircle,
  Clock,
  Search,
  Plus,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  AlertTriangle,
} from 'lucide-react';

interface Contractor {
  id: string;
  companyName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  workType: string;
  workLocation: string;
  startDate: string;
  endDate?: string;
  ohsRequirements: string;
  inductionCompleted: boolean;
  inductionDate?: string;
  insuranceRef?: string;
  insuranceExpiry?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED';
}

const MOCK_CONTRACTORS: Contractor[] = [
  {
    id: '1',
    companyName: 'Alpha Construction Ltd',
    contactName: 'James Smith',
    contactEmail: 'j.smith@alpha.com',
    workType: 'Roof Repair & Waterproofing',
    workLocation: 'Building A - Roof Level',
    startDate: '2026-02-01',
    endDate: '2026-03-15',
    ohsRequirements: 'PPE, Height Safety, Hot Works Permit',
    inductionCompleted: true,
    inductionDate: '2026-02-01',
    insuranceRef: 'INS-2026-001',
    insuranceExpiry: '2026-12-31',
    status: 'ACTIVE',
  },
  {
    id: '2',
    companyName: 'Beta Electrical Services',
    contactName: 'Sarah Connor',
    workType: 'Electrical Installation',
    workLocation: 'Server Room B',
    startDate: '2026-01-15',
    endDate: '2026-02-28',
    ohsRequirements: 'Electrical Safe System of Work, Lockout/Tagout',
    inductionCompleted: true,
    inductionDate: '2026-01-15',
    status: 'COMPLETED',
  },
  {
    id: '3',
    companyName: 'Gamma HVAC Solutions',
    contactName: 'Tom Williams',
    workType: 'HVAC Maintenance',
    workLocation: 'All Buildings',
    startDate: '2026-03-01',
    ohsRequirements: 'Confined Space, COSHH, Working at Height',
    inductionCompleted: false,
    status: 'ACTIVE',
  },
  {
    id: '4',
    companyName: 'Delta Catering Ltd',
    workType: 'Catering Services',
    workLocation: 'Canteen',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    ohsRequirements: 'Food Safety, Manual Handling, Fire Safety',
    inductionCompleted: true,
    inductionDate: '2026-01-01',
    status: 'ACTIVE',
  },
  {
    id: '5',
    companyName: 'Epsilon Security',
    contactName: 'Mark Davies',
    workType: 'Security & Access Control',
    workLocation: 'Main Gate and Reception',
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    ohsRequirements: 'Lone Working, Conflict Management, CCTV',
    inductionCompleted: true,
    status: 'ACTIVE',
  },
];

const statusColors: Record<Contractor['status'], string> = {
  ACTIVE: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ContractorManagementPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filtered, setFiltered] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    workType: '',
    workLocation: '',
    startDate: '',
    endDate: '',
    ohsRequirements: '',
    inductionCompleted: false,
    inductionDate: '',
    insuranceRef: '',
    insuranceExpiry: '',
    status: 'ACTIVE' as Contractor['status'],
  });

  useEffect(() => {
    api.get('/contractor-management')
      .then((r) => setContractors(r.data.data))
      .catch(() => setContractors(MOCK_CONTRACTORS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      contractors.filter((c) => c.companyName.toLowerCase().includes(q))
    );
  }, [search, contractors]);

  const total = contractors.length;
  const active = contractors.filter((c) => c.status === 'ACTIVE').length;
  const inductionRequired = contractors.filter((c) => !c.inductionCompleted).length;
  const completed = contractors.filter((c) => c.status === 'COMPLETED').length;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await api.post('/contractor-management', form);
      setContractors((prev) => [...prev, r.data.data]);
    } catch {
      setContractors((prev) => [
        ...prev,
        { ...form, id: String(Date.now()) },
      ]);
    } finally {
      setSubmitting(false);
      setShowAdd(false);
      setForm({
        companyName: '', contactName: '', contactEmail: '', contactPhone: '',
        workType: '', workLocation: '', startDate: '', endDate: '',
        ohsRequirements: '', inductionCompleted: false, inductionDate: '',
        insuranceRef: '', insuranceExpiry: '', status: 'ACTIVE',
      });
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
              <HardHat className="h-7 w-7 text-amber-600" />
              Contractor OHS Management
            </h1>
            <p className="text-sm text-amber-700 mt-1">ISO 45001:2018 Cl. 8.4 — Contractor Safety Management</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Contractor
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{total}</p>
                <p className="text-xs text-gray-500">Total Contractors</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-700">{active}</p>
                <p className="text-xs text-green-600">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-amber-700">{inductionRequired}</p>
                <p className="text-xs text-amber-600">Induction Required</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{completed}</p>
                <p className="text-xs text-blue-600">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name..."
            className="w-full pl-9 pr-4 py-2 border border-amber-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {/* Table */}
        <Card className="bg-white border-amber-200">
          <CardHeader className="border-b border-amber-100 pb-3">
            <CardTitle className="text-amber-900 text-base">Contractor Register</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-amber-600">Loading contractors...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-amber-50 text-amber-800 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3 text-left">Company</th>
                      <th className="px-4 py-3 text-left">Contact</th>
                      <th className="px-4 py-3 text-left">Work Type</th>
                      <th className="px-4 py-3 text-left">Location</th>
                      <th className="px-4 py-3 text-left">Period</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Induction</th>
                      <th className="px-4 py-3 text-left">Insurance Expiry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-50">
                    {filtered.map((c) => (
                      <tr key={c.id} className="hover:bg-amber-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-amber-500 shrink-0" />
                            {c.companyName}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div>{c.contactName || '—'}</div>
                          {c.contactEmail && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Mail className="h-3 w-3" />{c.contactEmail}
                            </div>
                          )}
                          {c.contactPhone && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Phone className="h-3 w-3" />{c.contactPhone}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700 max-w-[160px]">
                          <div className="truncate" title={c.workType}>{c.workType}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3 text-amber-400" />{c.workLocation}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-amber-400" />
                            {fmt(c.startDate)}
                          </div>
                          {c.endDate && <div className="text-gray-400">to {fmt(c.endDate)}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[c.status]}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {c.inductionCompleted ? (
                            <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
                              <CheckCircle className="h-4 w-4 text-green-500" /> Done
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-amber-700 font-medium">
                              <AlertTriangle className="h-4 w-4 text-amber-500" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {c.insuranceExpiry ? (
                            <div className="flex items-center gap-1">
                              <Shield className="h-3 w-3 text-amber-400" />
                              {fmt(c.insuranceExpiry)}
                            </div>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                          No contractors found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Contractor Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-amber-100">
              <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                <HardHat className="h-5 w-5 text-amber-600" /> Add Contractor
              </h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company Name *</label>
                  <input required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact Name</label>
                  <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact Email</label>
                  <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Work Type *</label>
                  <input required value={form.workType} onChange={(e) => setForm({ ...form, workType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Work Location *</label>
                  <input required value={form.workLocation} onChange={(e) => setForm({ ...form, workLocation: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date *</label>
                  <input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">OHS Requirements *</label>
                  <textarea required value={form.ohsRequirements} onChange={(e) => setForm({ ...form, ohsRequirements: e.target.value })}
                    rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Insurance Reference</label>
                  <input value={form.insuranceRef} onChange={(e) => setForm({ ...form, insuranceRef: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Insurance Expiry</label>
                  <input type="date" value={form.insuranceExpiry} onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Induction Date</label>
                  <input type="date" value={form.inductionDate} onChange={(e) => setForm({ ...form, inductionDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Contractor['status'] })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="induction" checked={form.inductionCompleted}
                    onChange={(e) => setForm({ ...form, inductionCompleted: e.target.checked })}
                    className="rounded border-gray-300 text-amber-600" />
                  <label htmlFor="induction" className="text-sm text-gray-700">Induction Completed</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60">
                  {submitting ? 'Saving...' : 'Add Contractor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
