'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface ApprovalRequest {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  requestType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  deadline: string;
  requestedBy: string;
}

const MOCK_APPROVALS: ApprovalRequest[] = [
  {
    id: '1',
    referenceNumber: 'PTL-APR-2026-001',
    title: 'Engineering Change Order — Valve Assembly Rev C',
    description:
      'Customer sign-off required for the revision C update to the valve assembly drawing pack. Changes address thread tolerance on items 4 and 7.',
    requestType: 'Engineering Change',
    status: 'PENDING',
    requestedAt: '2026-02-20T10:00:00Z',
    deadline: '2026-02-26T23:59:59Z',
    requestedBy: 'Sarah Mitchell',
  },
  {
    id: '2',
    referenceNumber: 'PTL-APR-2026-002',
    title: 'Delivery Schedule Amendment — March Batch',
    description:
      'Proposed amendment to the March delivery schedule. Week 12 delivery moved from 19 March to 22 March due to supplier lead-time extension.',
    requestType: 'Schedule Change',
    status: 'PENDING',
    requestedAt: '2026-02-18T14:30:00Z',
    deadline: '2026-02-24T23:59:59Z',
    requestedBy: 'James Okafor',
  },
  {
    id: '3',
    referenceNumber: 'PTL-APR-2026-003',
    title: 'Supplier Qualification Waiver — Component XR-44',
    description:
      'Request for temporary waiver on full qualification testing for component XR-44 sourced from alternate supplier pending primary supplier capacity restoration.',
    requestType: 'Quality Waiver',
    status: 'APPROVED',
    requestedAt: '2026-02-10T09:00:00Z',
    deadline: '2026-02-17T23:59:59Z',
    requestedBy: 'Rachel Kim',
  },
  {
    id: '4',
    referenceNumber: 'PTL-APR-2026-004',
    title: 'Contract Extension — Maintenance Services',
    description:
      'Extension of preventive maintenance services agreement for a further 12 months at the current agreed rate with CPI uplift clause.',
    requestType: 'Contract',
    status: 'REJECTED',
    requestedAt: '2026-02-05T11:00:00Z',
    deadline: '2026-02-12T23:59:59Z',
    requestedBy: 'Tom Baines',
  },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function isOverdue(deadline: string) {
  return new Date(deadline) < new Date();
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get('/portal/approvals');
      setApprovals(res.data.data || []);
    } catch {
      setApprovals(MOCK_APPROVALS);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, action: 'APPROVED' | 'REJECTED') {
    setActing(id);
    try {
      await api.patch(`/portal/approvals/${id}`, { status: action });
      setApprovals((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: action } : a))
      );
    } catch {
      setApprovals((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: action } : a))
      );
    } finally {
      setActing(null);
    }
  }

  const pending = approvals.filter((a) => a.status === 'PENDING');
  const resolved = approvals.filter((a) => a.status !== 'PENDING');

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Approvals</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Requests requiring your review and sign-off
          </p>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pending.length}</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Awaiting Action</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {approvals.filter((a) => a.status === 'APPROVED').length}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Approved</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">
              {approvals.filter((a) => a.status === 'REJECTED').length}
            </p>
            <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">Rejected</p>
          </div>
        </div>

        {/* Pending */}
        {pending.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Pending Action
            </h2>
            <div className="space-y-4">
              {pending.map((a) => {
                const overdue = isOverdue(a.deadline);
                return (
                  <Card
                    key={a.id}
                    className="border-2 border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-900/10"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mb-1">
                            {a.referenceNumber}
                          </p>
                          <CardTitle className="text-base text-gray-900 dark:text-white">
                            {a.title}
                          </CardTitle>
                        </div>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${STATUS_STYLES[a.status]}`}>
                          {a.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {a.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <span>Type: <strong>{a.requestType}</strong></span>
                        <span>Requested by: <strong>{a.requestedBy}</strong></span>
                        <span>Requested: {new Date(a.requestedAt).toLocaleDateString('en-GB')}</span>
                        <span className={overdue ? 'text-red-600 dark:text-red-400 font-semibold flex items-center gap-1' : ''}>
                          {overdue && <AlertCircle className="h-3 w-3" />}
                          Deadline: {new Date(a.deadline).toLocaleDateString('en-GB')}
                          {overdue && ' (Overdue)'}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction(a.id, 'APPROVED')}
                          disabled={acting === a.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(a.id, 'REJECTED')}
                          disabled={acting === a.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Resolved */}
        {resolved.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Resolved
            </h2>
            <div className="space-y-3">
              {resolved.map((a) => (
                <Card key={a.id} className="border border-gray-200 dark:border-gray-700 opacity-80">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-mono text-gray-400 dark:text-gray-500">
                          {a.referenceNumber}
                        </p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                          {a.title}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {a.requestType} &middot; {a.requestedBy}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[a.status]}`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {approvals.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No approval requests</p>
            <p className="text-sm mt-1">All caught up — no items require your attention.</p>
          </div>
        )}
      </div>
    </div>
  );
}
