'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
import { Plus, GitBranch, Clock, CheckCircle, AlertTriangle, FileEdit, Users } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface ChangeRequest {
  id: string;
  changeNumber: string;
  title: string;
  description: string;
  changeType: string;
  category?: string;
  priority: string;
  status: string;
  riskLevel?: string;
  requestedAt: string;
  targetDate?: string;
  effectiveDate?: string;
  _count?: { approvals: number; impacts: number; implementations: number };
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-purple-100 text-purple-700',
  IMPACT_ASSESSMENT: 'bg-yellow-100 text-yellow-700',
  PENDING_APPROVAL: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  IN_IMPLEMENTATION: 'bg-cyan-100 text-cyan-700',
  VERIFICATION: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-green-200 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
  EMERGENCY: 'bg-red-200 text-red-800',
};

const typeColors: Record<string, string> = {
  PRODUCT: 'bg-blue-100 text-blue-700',
  PROCESS: 'bg-green-100 text-green-700',
  DOCUMENT: 'bg-purple-100 text-purple-700',
  SYSTEM: 'bg-orange-100 text-orange-700',
  SUPPLIER: 'bg-cyan-100 text-cyan-700',
  EQUIPMENT: 'bg-yellow-100 text-yellow-700',
  MATERIAL: 'bg-pink-100 text-pink-700',
  ORGANIZATIONAL: 'bg-indigo-100 text-indigo-700',
};

export default function ChangesPage() {
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  useEffect(() => {
    loadChanges();
  }, [statusFilter, typeFilter, priorityFilter]);

  async function loadChanges() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('changeType', typeFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const res = await api.get(`/change-requests?${params.toString()}`);
      setChanges(res.data.data || []);
    } catch (error) {
      console.error('Failed to load changes:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: changes.length,
    pending: changes.filter(c => ['SUBMITTED', 'UNDER_REVIEW', 'IMPACT_ASSESSMENT', 'PENDING_APPROVAL'].includes(c.status)).length,
    approved: changes.filter(c => c.status === 'APPROVED').length,
    inImplementation: changes.filter(c => c.status === 'IN_IMPLEMENTATION').length,
    completed: changes.filter(c => c.status === 'COMPLETED').length,
    critical: changes.filter(c => c.priority === 'CRITICAL' || c.priority === 'EMERGENCY').length,
  };

  // Workflow stages
  const workflowStages = [
    { key: 'DRAFT', label: 'Draft', count: changes.filter(c => c.status === 'DRAFT').length },
    { key: 'SUBMITTED', label: 'Submitted', count: changes.filter(c => c.status === 'SUBMITTED').length },
    { key: 'UNDER_REVIEW', label: 'Review', count: changes.filter(c => c.status === 'UNDER_REVIEW').length },
    { key: 'IMPACT_ASSESSMENT', label: 'Impact', count: changes.filter(c => c.status === 'IMPACT_ASSESSMENT').length },
    { key: 'PENDING_APPROVAL', label: 'Approval', count: changes.filter(c => c.status === 'PENDING_APPROVAL').length },
    { key: 'APPROVED', label: 'Approved', count: changes.filter(c => c.status === 'APPROVED').length },
    { key: 'IN_IMPLEMENTATION', label: 'Implement', count: changes.filter(c => c.status === 'IN_IMPLEMENTATION').length },
    { key: 'COMPLETED', label: 'Complete', count: changes.filter(c => c.status === 'COMPLETED').length },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Change Management</h1>
            <p className="text-gray-500 mt-1">Change Control Board (CCB) workflow and tracking</p>
          </div>
          <Link href="/changes/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Change Request
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Changes</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <GitBranch className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Implementing</p>
                  <p className="text-2xl font-bold text-cyan-600">{stats.inImplementation}</p>
                </div>
                <FileEdit className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Pipeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Change Workflow Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between overflow-x-auto">
              {workflowStages.map((stage, index) => (
                <div key={stage.key} className="flex items-center">
                  <button
                    onClick={() => setStatusFilter(stage.key)}
                    className={`text-center min-w-[80px] p-3 rounded-lg transition-colors ${
                      statusFilter === stage.key
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold ${
                      stage.count > 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {stage.count}
                    </div>
                    <p className="text-xs mt-1 text-gray-600">{stage.label}</p>
                  </button>
                  {index < workflowStages.length - 1 && (
                    <div className="w-8 h-0.5 bg-gray-300 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="IMPACT_ASSESSMENT">Impact Assessment</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="IN_IMPLEMENTATION">In Implementation</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="PRODUCT">Product</option>
                <option value="PROCESS">Process</option>
                <option value="DOCUMENT">Document</option>
                <option value="SYSTEM">System</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
              {(statusFilter || typeFilter || priorityFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('');
                    setTypeFilter('');
                    setPriorityFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Changes List */}
        <Card>
          <CardHeader>
            <CardTitle>Change Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {changes.length > 0 ? (
              <div className="space-y-4">
                {changes.map((change) => (
                  <Link key={change.id} href={`/changes/${change.id}`}>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{change.title}</span>
                          <Badge className={statusColors[change.status] || 'bg-gray-100'}>
                            {change.status.replace(/_/g, ' ')}
                          </Badge>
                          <Badge className={typeColors[change.changeType] || 'bg-gray-100'}>
                            {change.changeType}
                          </Badge>
                          <Badge className={priorityColors[change.priority] || 'bg-gray-100'}>
                            {change.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{change.changeNumber}</span>
                          {change.category && (
                            <>
                              <span>•</span>
                              <span>{change.category}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>Requested: {new Date(change.requestedAt).toLocaleDateString()}</span>
                          {change._count && (
                            <>
                              <span>•</span>
                              <span>{change._count.approvals} approvers</span>
                              <span>•</span>
                              <span>{change._count.impacts} impacts</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {change.targetDate && (
                          <div className="text-sm">
                            <span className="text-gray-500">Target: </span>
                            <span className={new Date(change.targetDate) < new Date() && change.status !== 'COMPLETED' ? 'text-red-500 font-medium' : ''}>
                              {new Date(change.targetDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {change.riskLevel && (
                          <Badge className={
                            change.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            change.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }>
                            {change.riskLevel} Risk
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No change requests found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
