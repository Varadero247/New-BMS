'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Modal,
  ModalFooter,
  Label,
  Input,
  Textarea,
  AIDisclosure } from '@ims/ui';
import {
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Sparkles } from 'lucide-react';
import { api, aiApi } from '@/lib/api';
import Link from 'next/link';

interface LeaveRequest {
  id: string;
  requestNumber: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
  leaveType: {
    name: string;
    color?: string;
  };
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
}

interface LeaveType {
  id: string;
  code: string;
  name: string;
  category: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-700' };

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Create modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Create form fields
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formLeaveTypeId, setFormLeaveTypeId] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formReason, setFormReason] = useState('');
  const [formHandoverToId, setFormHandoverToId] = useState('');
  const [formIsHalfDay, setFormIsHalfDay] = useState(false);
  const [formHalfDayType, setFormHalfDayType] = useState('');

  // AI analysis state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  // Approve/Reject modal state
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [actionRequestId, setActionRequestId] = useState('');
  const [actionComments, setActionComments] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  async function loadRequests() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/leave/requests?${params.toString()}`);
      setRequests(res.data.data || []);
    } catch (error) {
      console.error('Error loading leave requests:', error);
    } finally {
      setLoading(false);
    }
  }

  async function openCreateModal() {
    setCreateError('');
    setFormEmployeeId('');
    setFormLeaveTypeId('');
    setFormStartDate('');
    setFormEndDate('');
    setFormReason('');
    setFormHandoverToId('');
    setFormIsHalfDay(false);
    setFormHalfDayType('');
    setCreateModalOpen(true);

    try {
      const [empRes, typesRes] = await Promise.all([
        api.get('/employees'),
        api.get('/leave/types'),
      ]);
      setEmployees(empRes.data.data || []);
      setLeaveTypes(typesRes.data.data || []);
    } catch (error) {
      console.error('Error loading form data:', error);
      setCreateError('Failed to load form data. Please try again.');
    }
  }

  async function handleCreate() {
    if (!formEmployeeId || !formLeaveTypeId || !formStartDate || !formEndDate) {
      setCreateError('Please fill in all required fields.');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      const payload: Record<string, any> = {
        employeeId: formEmployeeId,
        leaveTypeId: formLeaveTypeId,
        startDate: formStartDate,
        endDate: formEndDate,
        reason: formReason || undefined,
        handoverToId: formHandoverToId || undefined,
        isHalfDay: formIsHalfDay };

      if (formIsHalfDay && formHalfDayType) {
        payload.halfDayPeriod = formHalfDayType;
      }

      await api.post('/leave/requests', payload);
      setCreateModalOpen(false);
      loadRequests();
    } catch (error) {
      const msg = (axios.isAxiosError(error) && error.response?.data?.error)?.message;
      setCreateError(typeof msg === 'string' ? msg : 'Failed to create leave request.');
    } finally {
      setCreating(false);
    }
  }

  function openActionModal(requestId: string, action: 'APPROVED' | 'REJECTED') {
    setActionRequestId(requestId);
    setActionType(action);
    setActionComments('');
    setActionError('');
    setActionModalOpen(true);
  }

  async function handleAction() {
    setActionSubmitting(true);
    setActionError('');

    try {
      const endpoint =
        actionType === 'APPROVED'
          ? `/leave/requests/${actionRequestId}/approve`
          : `/leave/requests/${actionRequestId}/reject`;

      await api.put(endpoint, {
        comments: actionComments || undefined });
      setActionModalOpen(false);
      loadRequests();
    } catch (error) {
      const msg = (axios.isAxiosError(error) && error.response?.data?.error)?.message;
      setActionError(
        typeof msg === 'string'
          ? msg
          : `Failed to ${actionType === 'APPROVED' ? 'approve' : 'reject'} request.`
      );
    } finally {
      setActionSubmitting(false);
    }
  }

  async function analyzeLeavePatterns() {
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const totalLeaveDays = requests.reduce((sum, r) => sum + (r.days || 0), 0);
      const sickLeaveDays = requests
        .filter((r) => r.leaveType?.name?.toLowerCase().includes('sick'))
        .reduce((sum, r) => sum + (r.days || 0), 0);
      const leaveBreakdown: Record<string, number> = {};
      requests.forEach((r) => {
        const typeName = r.leaveType?.name || 'Unknown';
        leaveBreakdown[typeName] = (leaveBreakdown[typeName] || 0) + (r.days || 0);
      });

      const res = await aiApi.post('/analyze', {
        type: 'HR_LEAVE_ANALYSIS',
        context: {
          period: 'Current data',
          totalLeaveDays,
          sickLeaveDays,
          leaveBreakdown,
          unplannedAbsences: 0 } });
      setAiAnalysis(res.data.data.result);
    } catch (error) {
      console.error('Error analyzing leave patterns:', error);
    } finally {
      setAiLoading(false);
    }
  }

  const stats = {
    pending: requests.filter((r) => r.status === 'PENDING').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
    total: requests.length };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Leave Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage leave requests and approvals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={analyzeLeavePatterns}
              disabled={aiLoading || requests.length === 0}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" /> {aiLoading ? 'Analyzing...' : 'Analyze Patterns'}
            </Button>
            <Button className="flex items-center gap-2" onClick={openCreateModal}>
              <Plus className="h-4 w-4" /> New Request
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Panel */}
        {aiAnalysis && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-blue-900">AI Leave Analysis</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setAiAnalysis(null)}>
                  Dismiss
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AIDisclosure
                variant="inline"
                provider="claude"
                analysisType="Leave Analysis"
                confidence={0.85}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold">{aiAnalysis.bradfordFactor ?? 'N/A'}</span>
                    <div>
                      <p className="text-sm font-medium">Bradford Factor</p>
                      <Badge
                        className={
                          aiAnalysis.bradfordRisk === 'LOW'
                            ? 'bg-green-100 text-green-700'
                            : aiAnalysis.bradfordRisk === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }
                      >
                        {aiAnalysis.bradfordRisk || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  {aiAnalysis.patterns?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Patterns
                      </h4>
                      <ul className="text-sm space-y-1">
                        {aiAnalysis.patterns.map((p: string, i: number) => (
                          <li key={i}>
                            {'\u2022'} {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div>
                  {aiAnalysis.recommendations?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Recommendations
                      </h4>
                      <ul className="text-sm space-y-1">
                        {aiAnalysis.recommendations.map((r: string, i: number) => (
                          <li key={i}>
                            {'\u2022'} {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiAnalysis.wellbeingFlags?.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-medium text-amber-700 mb-1">Wellbeing Flags</h4>
                      <ul className="text-sm space-y-1">
                        {aiAnalysis.wellbeingFlags.map((w: string, i: number) => (
                          <li key={i} className="text-amber-600">
                            {'\u26A0'} {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              {aiAnalysis.comparisonToAverage && (
                <p className="text-sm text-gray-600 mt-4 pt-4 border-t">
                  {aiAnalysis.comparisonToAverage}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Link
                      href={`/leave/${request.id}`}
                      className="flex items-center gap-4 flex-1 cursor-pointer"
                    >
                      <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {request.employee.firstName} {request.employee.lastName}
                          </span>
                          <Badge
                            className={
                              statusColors[request.status] || 'bg-gray-100 dark:bg-gray-800'
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span>{request.requestNumber}</span>
                          <span>•</span>
                          <span>{request.leaveType.name}</span>
                          <span>•</span>
                          <span>{request.days} day(s)</span>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">
                          {new Date(request.startDate).toLocaleDateString()} -{' '}
                          {new Date(request.endDate).toLocaleDateString()}
                        </p>
                        {request.reason && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            {request.reason}
                          </p>
                        )}
                      </div>
                      {request.status === 'PENDING' && (
                        <div className="flex items-center gap-1 ml-4">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              openActionModal(request.id, 'APPROVED');
                            }}
                            className="p-2 rounded-md hover:bg-green-100 text-green-600 transition-colors"
                            title="Approve"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              openActionModal(request.id, 'REJECTED');
                            }}
                            className="p-2 rounded-md hover:bg-red-100 text-red-600 transition-colors"
                            title="Reject"
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No leave requests found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Leave Request Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="New Leave Request"
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {createError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeId">Employee *</Label>
              <select
                id="employeeId"
                value={formEmployeeId}
                onChange={(e) => setFormEmployeeId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="leaveTypeId">Leave Type *</Label>
              <select
                id="leaveTypeId"
                value={formLeaveTypeId}
                onChange={(e) => setFormLeaveTypeId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name} ({lt.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={formReason}
              onChange={(e) => setFormReason(e.target.value)}
              placeholder="Reason for leave..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="handoverToId">Handover To</Label>
            <select
              id="handoverToId"
              value={formHandoverToId}
              onChange={(e) => setFormHandoverToId(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
            >
              <option value="">Select Employee (optional)</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isHalfDay"
              checked={formIsHalfDay}
              onChange={(e) => {
                setFormIsHalfDay(e.target.checked);
                if (!e.target.checked) setFormHalfDayType('');
              }}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isHalfDay">Half Day</Label>
          </div>

          {formIsHalfDay && (
            <div>
              <Label htmlFor="halfDayType">Half Day Period</Label>
              <select
                id="halfDayType"
                value={formHalfDayType}
                onChange={(e) => setFormHalfDayType(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              >
                <option value="">Select Period</option>
                <option value="FIRST_HALF">First Half</option>
                <option value="SECOND_HALF">Second Half</option>
              </select>
            </div>
          )}
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? 'Submitting...' : 'Submit Request'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Approve/Reject Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={actionType === 'APPROVED' ? 'Approve Leave Request' : 'Reject Leave Request'}
        size="md"
      >
        <div className="space-y-4">
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {actionError}
            </div>
          )}

          <p className="text-sm text-gray-600">
            {actionType === 'APPROVED'
              ? 'Are you sure you want to approve this leave request?'
              : 'Are you sure you want to reject this leave request?'}
          </p>

          <div>
            <Label htmlFor="actionComments">Comments</Label>
            <Textarea
              id="actionComments"
              value={actionComments}
              onChange={(e) => setActionComments(e.target.value)}
              placeholder="Optional comments..."
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => setActionModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            disabled={actionSubmitting}
            className={actionType === 'APPROVED' ? '' : 'bg-red-600 hover:bg-red-700'}
          >
            {actionSubmitting ? 'Processing...' : actionType === 'APPROVED' ? 'Approve' : 'Reject'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
