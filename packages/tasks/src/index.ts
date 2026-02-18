import { v4 as uuidv4 } from 'uuid';

// ============================================
// Types
// ============================================

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED';

export interface Task {
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
  priority: TaskPriority;
  dueDate?: Date;
  completedAt?: Date;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskParams {
  orgId: string;
  title: string;
  description?: string;
  recordType?: string;
  recordId?: string;
  assigneeId: string;
  assigneeName: string;
  createdById: string;
  priority?: TaskPriority;
  dueDate?: Date | string;
}

export interface TaskFilters {
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  recordType?: string;
  page?: number;
  limit?: number;
}

export interface GroupedTasks {
  overdue: Task[];
  today: Task[];
  thisWeek: Task[];
  later: Task[];
}

// ============================================
// In-memory store
// ============================================

const tasks = new Map<string, Task>();
let sequenceCounter = 0;

// ============================================
// Reference number generator
// ============================================

function generateRefNumber(): string {
  sequenceCounter++;
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const nnn = String(sequenceCounter).padStart(3, '0');
  return `TSK-${yy}${mm}-${nnn}`;
}

// ============================================
// Create task
// ============================================

export async function createTask(params: CreateTaskParams): Promise<Task> {
  const now = new Date();
  const dueDate = params.dueDate ? new Date(params.dueDate) : undefined;

  const task: Task = {
    id: uuidv4(),
    orgId: params.orgId,
    refNumber: generateRefNumber(),
    title: params.title,
    description: params.description,
    recordType: params.recordType,
    recordId: params.recordId,
    assigneeId: params.assigneeId,
    assigneeName: params.assigneeName,
    createdById: params.createdById,
    priority: params.priority || 'MEDIUM',
    dueDate,
    completedAt: undefined,
    status: 'OPEN',
    createdAt: now,
    updatedAt: now,
  };

  tasks.set(task.id, task);
  return task;
}

// ============================================
// Get tasks (filtered, paginated)
// ============================================

export async function getTasks(
  orgId: string,
  filters?: TaskFilters
): Promise<{ tasks: Task[]; total: number }> {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 20;

  let result = Array.from(tasks.values()).filter((t) => t.orgId === orgId);

  if (filters?.assigneeId) {
    result = result.filter((t) => t.assigneeId === filters.assigneeId);
  }
  if (filters?.status) {
    result = result.filter((t) => t.status === filters.status);
  }
  if (filters?.priority) {
    result = result.filter((t) => t.priority === filters.priority);
  }
  if (filters?.recordType) {
    result = result.filter((t) => t.recordType === filters.recordType);
  }

  // Sort: overdue first, then by priority (HIGH > MEDIUM > LOW), then by createdAt desc
  const priorityOrder: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const now = Date.now();

  result.sort((a, b) => {
    // Overdue tasks first
    const aOverdue =
      a.dueDate && a.dueDate.getTime() < now && a.status !== 'COMPLETE' && a.status !== 'CANCELLED'
        ? 0
        : 1;
    const bOverdue =
      b.dueDate && b.dueDate.getTime() < now && b.status !== 'COMPLETE' && b.status !== 'CANCELLED'
        ? 0
        : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;

    // Then by priority
    const aPri = priorityOrder[a.priority];
    const bPri = priorityOrder[b.priority];
    if (aPri !== bPri) return aPri - bPri;

    // Then newest first
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const total = result.length;
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);

  return { tasks: paginated, total };
}

// ============================================
// Get my tasks (grouped by due date)
// ============================================

export async function getMyTasks(orgId: string, userId: string): Promise<GroupedTasks> {
  const allTasks = Array.from(tasks.values()).filter(
    (t) =>
      t.orgId === orgId &&
      t.assigneeId === userId &&
      t.status !== 'COMPLETE' &&
      t.status !== 'CANCELLED'
  );

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

  const grouped: GroupedTasks = {
    overdue: [],
    today: [],
    thisWeek: [],
    later: [],
  };

  for (const task of allTasks) {
    if (!task.dueDate) {
      grouped.later.push(task);
    } else if (task.dueDate.getTime() < startOfToday.getTime()) {
      grouped.overdue.push(task);
    } else if (task.dueDate.getTime() < endOfToday.getTime()) {
      grouped.today.push(task);
    } else if (task.dueDate.getTime() < endOfWeek.getTime()) {
      grouped.thisWeek.push(task);
    } else {
      grouped.later.push(task);
    }
  }

  // Sort each group by priority then dueDate
  const priorityOrder: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const sortFn = (a: Task, b: Task) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
    return 0;
  };

  grouped.overdue.sort(sortFn);
  grouped.today.sort(sortFn);
  grouped.thisWeek.sort(sortFn);
  grouped.later.sort(sortFn);

  return grouped;
}

// ============================================
// Update task
// ============================================

export async function updateTask(
  id: string,
  updates: Partial<
    Pick<
      Task,
      'title' | 'description' | 'assigneeId' | 'assigneeName' | 'priority' | 'dueDate' | 'status'
    >
  >
): Promise<Task> {
  const task = tasks.get(id);
  if (!task) {
    throw new Error('Task not found');
  }

  if (updates.title !== undefined) task.title = updates.title;
  if (updates.description !== undefined) task.description = updates.description;
  if (updates.assigneeId !== undefined) task.assigneeId = updates.assigneeId;
  if (updates.assigneeName !== undefined) task.assigneeName = updates.assigneeName;
  if (updates.priority !== undefined) task.priority = updates.priority;
  if (updates.dueDate !== undefined) task.dueDate = new Date(updates.dueDate);
  if (updates.status !== undefined) task.status = updates.status;
  task.updatedAt = new Date();

  tasks.set(id, task);
  return task;
}

// ============================================
// Complete task
// ============================================

export async function completeTask(id: string): Promise<Task> {
  const task = tasks.get(id);
  if (!task) {
    throw new Error('Task not found');
  }

  task.status = 'COMPLETE';
  task.completedAt = new Date();
  task.updatedAt = new Date();

  tasks.set(id, task);
  return task;
}

// ============================================
// Delete task
// ============================================

export async function deleteTask(id: string): Promise<void> {
  const task = tasks.get(id);
  if (!task) {
    throw new Error('Task not found');
  }
  tasks.delete(id);
}

// ============================================
// Get single task by ID
// ============================================

export async function getTaskById(id: string): Promise<Task | null> {
  return tasks.get(id) || null;
}

// ============================================
// Reset store (for testing)
// ============================================

export function resetStore(): void {
  tasks.clear();
  sequenceCounter = 0;
}
