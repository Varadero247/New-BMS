'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Users, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import api from '@/lib/api';

interface ApprovalChain {
  id: string;
  name: string;
  description: string | null;
  entityType: string;
  isActive: boolean;
  levels: Array<{
    id: string;
    levelOrder: number;
    name: string;
    approverType: string;
  }>;
}

interface ApprovalRequest {
  id: string;
  requestNumber: string;
  title: string;
  description: string | null;
  entityType: string;
  amount: number | null;
  status: string;
  currentLevel: number;
  createdAt: string;
  chain: { name: string };
}

export default function ApprovalsPage() {
  const [chains, setChains] = useState<ApprovalChain[]>([]);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'chains'>('requests');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const [chainsRes, requestsRes] = await Promise.all([
        api.get('/approvals/chains'),
        api.get(`/approvals/requests?${params.toString()}`),
      ]);

      setChains(chainsRes.data.data || []);
      setRequests(requestsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await api.put(`/approvals/requests/${requestId}/respond`, {
        decision: 'APPROVED',
        responderId: 'current-user',
        comments: 'Approved',
      });
      fetchData();
    } catch (error) {
      console.error('Error approving:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await api.put(`/approvals/requests/${requestId}/respond`, {
        decision: 'REJECTED',
        responderId: 'current-user',
        comments: 'Rejected',
      });
      fetchData();
    } catch (error) {
      console.error('Error rejecting:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800';
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading approvals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Approval Management</h1>
        <Link
          href="/approvals/chains/new"
          className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          <span>New Chain</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('requests')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'requests'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Approval Requests
          </button>
          <button
            onClick={() => setActiveTab('chains')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'chains'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Approval Chains
          </button>
        </nav>
      </div>

      {activeTab === 'requests' ? (
        <>
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                  <p className="text-xl font-semibold">
                    {requests.filter((r) => r.status === 'PENDING').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                  <p className="text-xl font-semibold">
                    {requests.filter((r) => r.status === 'APPROVED').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
              <div className="flex items-center space-x-3">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
                  <p className="text-xl font-semibold">
                    {requests.filter((r) => r.status === 'REJECTED').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(requests.reduce((sum, r) => sum + (r.amount || 0), 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="rounded-lg bg-white dark:bg-gray-900 shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Request
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Chain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Entity Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {requests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      No approval requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 dark:bg-gray-800">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {request.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {request.requestNumber}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {request.chain?.name || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {request.entityType}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(request.amount)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        Level {request.currentLevel}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(request.status)}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        {request.status === 'PENDING' && (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Approval Chains */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {chains.length === 0 ? (
            <div className="col-span-full rounded-lg bg-white dark:bg-gray-900 p-12 text-center shadow">
              <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                No approval chains
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Create an approval chain to get started.
              </p>
            </div>
          ) : (
            chains.map((chain) => (
              <div key={chain.id} className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{chain.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{chain.entityType}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      chain.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800'
                    }`}
                  >
                    {chain.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {chain.description && (
                  <p className="mt-2 text-sm text-gray-600">{chain.description}</p>
                )}

                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    APPROVAL LEVELS
                  </p>
                  <div className="mt-2 space-y-2">
                    {chain.levels.map((level) => (
                      <div key={level.id} className="flex items-center space-x-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600">
                          {level.levelOrder}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {level.name}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          ({level.approverType})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <Link
                    href={`/approvals/chains/${chain.id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
