'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckSquare, Clock, AlertTriangle, Play } from 'lucide-react';
import api from '@/lib/api';

interface WorkflowTask {
  id: string;
  taskNumber: string;
  taskType: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  assigneeId: string | null;
  instance: {
    instanceNumber: string;
    title: string;
    definition: { name: string };
  };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const response = await api.get(`/tasks?${params.toString()}`);
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTask = async (taskId: string) => {
    try {
      await api.put(`/tasks/${taskId}/claim`, { userId: 'current-user' });
      fetchTasks();
    } catch (error) {
      console.error('Error claiming task:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      SKIPPED: 'bg-gray-100 dark:bg-gray-800 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800' };
    return styles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      LOW: 'bg-gray-100 dark:bg-gray-800 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800' };
    return styles[priority] || 'bg-gray-100 dark:bg-gray-800 text-gray-800';
  };

  const getTaskTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      APPROVAL: 'bg-purple-100 text-purple-800',
      REVIEW: 'bg-cyan-100 text-cyan-800',
      ACTION: 'bg-green-100 text-green-800',
      DECISION: 'bg-orange-100 text-orange-800',
      NOTIFICATION: 'bg-blue-100 text-blue-800',
      MANUAL: 'bg-gray-100 dark:bg-gray-800 text-gray-800' };
    return styles[type] || 'bg-gray-100 dark:bg-gray-800 text-gray-800';
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'COMPLETED' || status === 'SKIPPED') return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Workflow Tasks</h1>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="SKIPPED">Skipped</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
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
                {tasks.filter((t) => t.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <Play className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
              <p className="text-xl font-semibold">
                {tasks.filter((t) => t.status === 'IN_PROGRESS').length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
              <p className="text-xl font-semibold">
                {tasks.filter((t) => isOverdue(t.dueDate, t.status)).length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <CheckSquare className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-xl font-semibold">
                {tasks.filter((t) => t.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="rounded-lg bg-white dark:bg-gray-900 shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Workflow
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Due Date
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
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No tasks found.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr
                  key={task.id}
                  className={`hover:bg-gray-50 dark:bg-gray-800 ${isOverdue(task.dueDate, task.status) ? 'bg-red-50' : ''}`}
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <CheckSquare className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {task.taskNumber}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {task.instance?.title || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {task.instance?.instanceNumber}
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getTaskTypeBadge(task.taskType)}`}
                    >
                      {task.taskType}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getPriorityBadge(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {task.dueDate ? (
                      <span
                        className={`text-sm ${isOverdue(task.dueDate, task.status) ? 'font-medium text-red-600' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        {new Date(task.dueDate).toLocaleDateString()}
                        {isOverdue(task.dueDate, task.status) && (
                          <AlertTriangle className="ml-1 inline h-4 w-4 text-red-500" />
                        )}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(task.status)}`}
                    >
                      {task.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {task.status === 'PENDING' && !task.assigneeId && (
                        <button
                          onClick={() => handleClaimTask(task.id)}
                          className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200"
                        >
                          Claim
                        </button>
                      )}
                      <Link
                        href={`/tasks/${task.id}`}
                        className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
