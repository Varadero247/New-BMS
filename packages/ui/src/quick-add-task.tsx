'use client';

import { useState, type FormEvent } from 'react';
import { cn } from './utils';

// ============================================
// Types
// ============================================

interface Task {
  id: string;
  orgId: string;
  refNumber: string;
  title: string;
  description?: string;
  recordType?: string;
  recordId?: string;
  assigneeId: string;
  assigneeName: string;
  createdById: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string | Date;
  completedAt?: string | Date;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED';
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface QuickAddTaskProps {
  recordType?: string;
  recordId?: string;
  onCreated?: (task: Task) => void;
  apiBaseUrl?: string;
  className?: string;
}

// ============================================
// Component
// ============================================

export function QuickAddTask({
  recordType,
  recordId,
  onCreated,
  apiBaseUrl = '',
  className,
}: QuickAddTaskProps) {
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assigneeId.trim() || !assigneeName.trim()) {
      setError('Title, assignee ID, and assignee name are required');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${apiBaseUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          assigneeId: assigneeId.trim(),
          assigneeName: assigneeName.trim(),
          priority,
          dueDate: dueDate || undefined,
          recordType,
          recordId,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(`Task ${json.data.refNumber} created`);
        setTitle('');
        setAssigneeId('');
        setAssigneeName('');
        setDueDate('');
        setPriority('MEDIUM');
        onCreated?.(json.data);
        // Auto-clear success after 3s
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(json.error?.message || 'Failed to create task');
      }
    } catch {
      setError('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-md border border-dashed border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-brand-500 dark:hover:text-brand-400',
          className
        )}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Task
      </button>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900',
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Quick Add Task</h4>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title *"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        {/* Assignee row */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            placeholder="Assignee ID *"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <input
            type="text"
            value={assigneeName}
            onChange={(e) => setAssigneeName(e.target.value)}
            placeholder="Assignee name *"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        {/* Due date + priority */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>

        {/* Error / Success */}
        {error && <div className="text-xs text-red-600 dark:text-red-400">{error}</div>}
        {success && <div className="text-xs text-green-600 dark:text-green-400">{success}</div>}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium text-white transition-colors',
              submitting || !title.trim()
                ? 'cursor-not-allowed bg-zinc-300 dark:bg-zinc-700'
                : 'bg-brand-600 hover:bg-brand-700'
            )}
          >
            {submitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
