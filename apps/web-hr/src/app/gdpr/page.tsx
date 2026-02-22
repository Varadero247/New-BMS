'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Users,
  Plus,
  AlertCircle,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  FileSearch,
  Shield,
  CalendarClock,
  Inbox,
} from 'lucide-react';
import { api } from '@/lib/api';

type RequestType = 'ACCESS' | 'RECTIFICATION' | 'ERASURE' | 'PORTABILITY' | 'OBJECTION';
type RequestStatus = 'RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

interface GdprRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  requestType: RequestType;
  description: string;
  status: RequestStatus;
  createdAt: string;
  responseDeadline: string;
}

const MOCK_REQUESTS: GdprRequest[] = [
  {
    id: '1',
    employeeId: 'EMP-001',
    employeeName: 'Sarah Johnson',
    requestType: 'ACCESS',
    description: 'Copy of all personal data held',
    status: 'COMPLETED',
    createdAt: '2026-02-01T00:00:00Z',
    responseDeadline: '2026-03-03T00:00:00Z',
  },
  {
    id: '2',
    employeeId: 'EMP-047',
    employeeName: 'Marcus Williams',
    requestType: 'RECTIFICATION',
    description: 'Incorrect date of birth on record',
    status: 'PROCESSING',
    createdAt: '2026-02-10T00:00:00Z',
    responseDeadline: '2026-03-12T00:00:00Z',
  },
  {
    id: '3',
    employeeId: 'EMP-103',
    employeeName: 'Priya Patel',
    requestType: 'ERASURE',
    description: 'Remove all records after resignation',
    status: 'RECEIVED',
    createdAt: '2026-02-18T00:00:00Z',
    responseDeadline: '2026-03-20T00:00:00Z',
  },
  {
    id: '4',
    employeeId: 'EMP-028',
    employeeName: 'Tom Bradley',
    requestType: 'PORTABILITY',
    description: 'Export data to transfer to new employer',
    status: 'COMPLETED',
    createdAt: '2026-01-20T00:00:00Z',
    responseDeadline: '2026-02-19T00:00:00Z',
  },
];

const REQUEST_TYPE_CONFIG: Record<RequestType, { label: string; color: string; icon: React.ReactNode }> = {
  ACCESS: { label: 'Access', color: 'bg-blue-100 text-blue-700', icon: <FileSearch className="h-3 w-3" /> },
  RECTIFICATION: { label: 'Rectification', color: 'bg-amber-100 text-amber-700', icon: <Shield className="h-3 w-3" /> },
  ERASURE: { label: 'Erasure', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> },
  PORTABILITY: { label: 'Portability', color: 'bg-purple-100 text-purple-700', icon: <Inbox className="h-3 w-3" /> },
  OBJECTION: { label: 'Objection', color: 'bg-orange-100 text-orange-700', icon: <AlertCircle className="h-3 w-3" /> },
};

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; icon: React.ReactNode }> = {
  RECEIVED: { label: 'Received', color: 'bg-gray-100 text-gray-700', icon: <Inbox className="h-3 w-3" /> },
  PROCESSING: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: <Clock className="h-3 w-3" /> },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3 w-3" /> },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> },
};

const REQUEST_TYPES: RequestType[] = ['ACCESS', 'RECTIFICATION', 'ERASURE', 'PORTABILITY', 'OBJECTION'];

function daysUntil(dateStr: string): number {
  const now = new Date();
  const deadline = new Date(dateStr);
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function DeadlineBadge({ deadline, status }: { deadline: string; status: RequestStatus }) {
  if (status === 'COMPLETED' || status === 'REJECTED') {
    return <span className="text-xs text-gray-400">{new Date(deadline).toLocaleDateString()}</span>;
  }
  const days = daysUntil(deadline);
  if (days < 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
        <AlertCircle className="h-3 w-3" />
        Overdue {Math.abs(days)}d
      </span>
    );
  }
  if (days <= 7) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
        <CalendarClock className="h-3 w-3" />
        {days}d left
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
      <CalendarClock className="h-3 w-3" />
      {days}d left
    </span>
  );
}

export default function HrGdprPage() {
  const [requests, setRequests] = useState<GdprRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    employeeName: '',
    requestType: 'ACCESS' as RequestType,
    description: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);
      const r = await api.get('/gdpr');
      setRequests(r.data.data);
    } catch {
      setRequests(MOCK_REQUESTS);
      setError('Using mock data — API unavailable');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/gdpr', form);
    } catch {
      const now = new Date();
      const deadline = new Date(now);
      deadline.setDate(deadline.getDate() + 30);
      setRequests(prev => [
        ...prev,
        {
          id: String(Date.now()),
          ...form,
          status: 'RECEIVED' as RequestStatus,
          createdAt: now.toISOString(),
          responseDeadline: deadline.toISOString(),
        },
      ]);
    } finally {
      setSubmitting(false);
      setShowModal(false);
      setForm({ employeeId: '', employeeName: '', requestType: 'ACCESS', description: '' });
    }
  }

  const counts = {
    total: requests.length,
    received: requests.filter(r => r.status === 'RECEIVED').length,
    processing: requests.filter(r => r.status === 'PROCESSING').length,
    completed: requests.filter(r => r.status === 'COMPLETED').length,
    overdue: requests.filter(r => {
      if (r.status === 'COMPLETED' || r.status === 'REJECTED') return false;
      return daysUntil(r.responseDeadline) < 0;
    }).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HR GDPR — Employee Data Rights</h1>
              <p className="text-sm text-gray-500">Manage employee data subject requests under UK GDPR</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            New Request
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-blue-100">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-700">{counts.total}</div>
              <div className="text-sm text-gray-500">Total Requests</div>
            </CardContent>
          </Card>
          <Card className="border-gray-100">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-gray-700">{counts.received}</div>
              <div className="text-sm text-gray-500">Received</div>
            </CardContent>
          </Card>
          <Card className="border-blue-100">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-700">{counts.processing}</div>
              <div className="text-sm text-gray-500">Processing</div>
            </CardContent>
          </Card>
          <Card className="border-green-100">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-700">{counts.completed}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </CardContent>
          </Card>
          <Card className={counts.overdue > 0 ? 'border-red-200' : 'border-gray-100'}>
            <CardContent className="pt-4">
              <div className={`text-2xl font-bold ${counts.overdue > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {counts.overdue}
              </div>
              <div className="text-sm text-gray-500">Overdue</div>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Data Subject Requests ({requests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Employee</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Request Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Description</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Received</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req, i) => (
                      <tr key={req.id} className={`border-b border-gray-50 hover:bg-blue-50/30 ${i % 2 === 0 ? 'bg-white' : 'bg-sky-50/20'}`}>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{req.employeeName}</div>
                          <div className="text-xs text-gray-400">{req.employeeId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${REQUEST_TYPE_CONFIG[req.requestType].color}`}>
                            {REQUEST_TYPE_CONFIG[req.requestType].icon}
                            {REQUEST_TYPE_CONFIG[req.requestType].label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs max-w-xs">{req.description}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[req.status].color}`}>
                            {STATUS_CONFIG[req.status].icon}
                            {STATUS_CONFIG[req.status].label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <DeadlineBadge deadline={req.responseDeadline} status={req.status} />
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-400">
                          No GDPR requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance note */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Shield className="h-3 w-3" />
          UK GDPR Article 17 — responses required within 30 days. Requests are tracked for audit purposes.
        </div>
      </div>

      {/* Add Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">New Data Subject Request</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input
                    required
                    value={form.employeeId}
                    onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="EMP-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                  <input
                    required
                    value={form.employeeName}
                    onChange={e => setForm(p => ({ ...p, employeeName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                <select
                  value={form.requestType}
                  onChange={e => setForm(p => ({ ...p, requestType: e.target.value as RequestType }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {REQUEST_TYPES.map(t => (
                    <option key={t} value={t}>{REQUEST_TYPE_CONFIG[t].label} ({t})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe the employee's request..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700">
                The 30-day response deadline will be automatically calculated from today's date.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
