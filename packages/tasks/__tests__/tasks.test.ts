/**
 * Unit tests for @ims/tasks package
 * Covers in-memory CRUD store with pagination, filtering and date grouping.
 */

import {
  createTask,
  getTasks,
  getMyTasks,
  updateTask,
  completeTask,
  deleteTask,
  getTaskById,
  resetStore,
} from '../src/index';

beforeEach(() => {
  resetStore();
});

describe('createTask', () => {
  it('creates a task with defaults', async () => {
    const task = await createTask({
      orgId: 'org-1',
      title: 'Fix critical bug',
      assigneeId: 'user-1',
      assigneeName: 'Alice',
      createdById: 'user-2',
    });

    expect(task.id).toBeDefined();
    expect(task.refNumber).toMatch(/^TSK-\d{4}-\d{3}$/);
    expect(task.status).toBe('OPEN');
    expect(task.priority).toBe('MEDIUM');
    expect(task.orgId).toBe('org-1');
    expect(task.title).toBe('Fix critical bug');
  });

  it('accepts optional fields', async () => {
    const due = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const task = await createTask({
      orgId: 'org-1',
      title: 'Review report',
      description: 'Quarterly safety review',
      recordType: 'audit',
      recordId: 'audit-123',
      assigneeId: 'user-1',
      assigneeName: 'Alice',
      createdById: 'user-2',
      priority: 'HIGH',
      dueDate: due,
    });

    expect(task.priority).toBe('HIGH');
    expect(task.description).toBe('Quarterly safety review');
    expect(task.recordType).toBe('audit');
    expect(task.dueDate?.toISOString()).toBe(due.toISOString());
  });

  it('accepts dueDate as ISO string', async () => {
    const task = await createTask({
      orgId: 'org-1',
      title: 'Test task',
      assigneeId: 'user-1',
      assigneeName: 'Alice',
      createdById: 'user-2',
      dueDate: '2026-12-31T00:00:00.000Z',
    });

    expect(task.dueDate).toBeInstanceOf(Date);
  });

  it('generates sequential reference numbers', async () => {
    const t1 = await createTask({
      orgId: 'org-1', title: 'T1', assigneeId: 'u1', assigneeName: 'A', createdById: 'u2',
    });
    const t2 = await createTask({
      orgId: 'org-1', title: 'T2', assigneeId: 'u1', assigneeName: 'A', createdById: 'u2',
    });

    expect(t1.refNumber).not.toBe(t2.refNumber);
    expect(t1.refNumber).toMatch(/TSK-\d{4}-001/);
    expect(t2.refNumber).toMatch(/TSK-\d{4}-002/);
  });
});

describe('getTasks', () => {
  it('returns all tasks for an org', async () => {
    await createTask({ orgId: 'org-1', title: 'T1', assigneeId: 'u1', assigneeName: 'A', createdById: 'u2' });
    await createTask({ orgId: 'org-1', title: 'T2', assigneeId: 'u1', assigneeName: 'A', createdById: 'u2' });
    await createTask({ orgId: 'org-2', title: 'T3', assigneeId: 'u1', assigneeName: 'A', createdById: 'u2' });

    const { tasks, total } = await getTasks('org-1');
    expect(total).toBe(2);
    expect(tasks.every((t) => t.orgId === 'org-1')).toBe(true);
  });

  it('returns empty list for unknown org', async () => {
    const { tasks, total } = await getTasks('org-unknown');
    expect(tasks).toHaveLength(0);
    expect(total).toBe(0);
  });

  it('filters by assigneeId', async () => {
    await createTask({ orgId: 'org-1', title: 'T1', assigneeId: 'alice', assigneeName: 'A', createdById: 'u2' });
    await createTask({ orgId: 'org-1', title: 'T2', assigneeId: 'bob', assigneeName: 'B', createdById: 'u2' });

    const { tasks, total } = await getTasks('org-1', { assigneeId: 'alice' });
    expect(total).toBe(1);
    expect(tasks[0].assigneeId).toBe('alice');
  });

  it('filters by status', async () => {
    const t = await createTask({ orgId: 'org-1', title: 'T1', assigneeId: 'u1', assigneeName: 'A', createdById: 'u2' });
    await updateTask(t.id, { status: 'IN_PROGRESS' });
    await createTask({ orgId: 'org-1', title: 'T2', assigneeId: 'u1', assigneeName: 'A', createdById: 'u2' });

    const { tasks } = await getTasks('org-1', { status: 'IN_PROGRESS' });
    expect(tasks.every((t) => t.status === 'IN_PROGRESS')).toBe(true);
  });

  it('filters by priority', async () => {
    await createTask({ orgId: 'org-1', title: 'High', assigneeId: 'u1', assigneeName: 'A', createdById: 'u2', priority: 'HIGH' });
    await createTask({ orgId: 'org-1', title: 'Low', assigneeId: 'u1', assigneeName: 'A', createdById: 'u2', priority: 'LOW' });

    const { tasks } = await getTasks('org-1', { priority: 'HIGH' });
    expect(tasks.every((t) => t.priority === 'HIGH')).toBe(true);
  });

  it('filters by recordType', async () => {
    await createTask({ orgId: 'org-1', title: 'T1', assigneeId: 'u1', assigneeName: 'A', createdById: 'u2', recordType: 'risk' });
    await createTask({ orgId: 'org-1', title: 'T2', assigneeId: 'u1', assigneeName: 'A', createdById: 'u2', recordType: 'audit' });

    const { tasks } = await getTasks('org-1', { recordType: 'risk' });
    expect(tasks.every((t) => t.recordType === 'risk')).toBe(true);
  });

  it('paginates results', async () => {
    for (let i = 0; i < 5; i++) {
      await createTask({ orgId: 'org-1', title: `T${i}`, assigneeId: 'u1', assigneeName: 'A', createdById: 'u2' });
    }

    const p1 = await getTasks('org-1', { page: 1, limit: 2 });
    const p2 = await getTasks('org-1', { page: 2, limit: 2 });

    expect(p1.tasks).toHaveLength(2);
    expect(p2.tasks).toHaveLength(2);
    expect(p1.total).toBe(5);
  });

  it('places overdue tasks first', async () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await createTask({ orgId: 'org-1', title: 'Future', assigneeId: 'u1', assigneeName: 'A', createdById: 'u2', dueDate: future });
    await createTask({ orgId: 'org-1', title: 'Overdue', assigneeId: 'u1', assigneeName: 'A', createdById: 'u2', dueDate: past });

    const { tasks } = await getTasks('org-1');
    expect(tasks[0].title).toBe('Overdue');
  });
});

describe('getMyTasks', () => {
  it('groups tasks by due date bucket', async () => {
    const past = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

    await createTask({ orgId: 'org-1', title: 'Overdue', assigneeId: 'alice', assigneeName: 'Alice', createdById: 'u2', dueDate: past });
    await createTask({ orgId: 'org-1', title: 'Later', assigneeId: 'alice', assigneeName: 'Alice', createdById: 'u2', dueDate: future });
    await createTask({ orgId: 'org-1', title: 'No due date', assigneeId: 'alice', assigneeName: 'Alice', createdById: 'u2' });

    const grouped = await getMyTasks('org-1', 'alice');

    expect(grouped.overdue).toHaveLength(1);
    expect(grouped.overdue[0].title).toBe('Overdue');
    expect(grouped.later.length).toBeGreaterThanOrEqual(1);
  });

  it('excludes completed and cancelled tasks', async () => {
    const t1 = await createTask({ orgId: 'org-1', title: 'Done', assigneeId: 'bob', assigneeName: 'Bob', createdById: 'u2' });
    const t2 = await createTask({ orgId: 'org-1', title: 'Cancelled', assigneeId: 'bob', assigneeName: 'Bob', createdById: 'u2' });

    await completeTask(t1.id);
    await updateTask(t2.id, { status: 'CANCELLED' });

    const grouped = await getMyTasks('org-1', 'bob');
    const all = [...grouped.overdue, ...grouped.today, ...grouped.thisWeek, ...grouped.later];
    expect(all).toHaveLength(0);
  });

  it('only includes tasks for the specified user', async () => {
    await createTask({ orgId: 'org-1', title: 'Alice task', assigneeId: 'alice', assigneeName: 'Alice', createdById: 'u2' });
    await createTask({ orgId: 'org-1', title: 'Bob task', assigneeId: 'bob', assigneeName: 'Bob', createdById: 'u2' });

    const grouped = await getMyTasks('org-1', 'alice');
    const all = [...grouped.overdue, ...grouped.today, ...grouped.thisWeek, ...grouped.later];
    expect(all.every((t) => t.assigneeId === 'alice')).toBe(true);
  });

  it('places task due today in the "today" bucket', async () => {
    // Due in 2 hours = same calendar day = "today" bucket
    const inTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000);
    // Ensure it's still today (guard against midnight boundary)
    const today = new Date();
    if (inTwoHours.getDate() === today.getDate()) {
      await createTask({ orgId: 'org-1', title: 'Today task', assigneeId: 'carol', assigneeName: 'Carol', createdById: 'u2', dueDate: inTwoHours });
      const grouped = await getMyTasks('org-1', 'carol');
      expect(grouped.today).toHaveLength(1);
      expect(grouped.today[0].title).toBe('Today task');
    }
  });

  it('places task due in 3 days in "thisWeek" bucket', async () => {
    const threeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await createTask({ orgId: 'org-1', title: 'This week', assigneeId: 'dave', assigneeName: 'Dave', createdById: 'u2', dueDate: threeDays });
    const grouped = await getMyTasks('org-1', 'dave');
    expect(grouped.thisWeek).toHaveLength(1);
    expect(grouped.thisWeek[0].title).toBe('This week');
  });

  it('sorts within a group by priority (HIGH before MEDIUM)', async () => {
    const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    await createTask({ orgId: 'org-1', title: 'Med overdue', assigneeId: 'eve', assigneeName: 'Eve', createdById: 'u2', priority: 'MEDIUM', dueDate: past });
    await createTask({ orgId: 'org-1', title: 'High overdue', assigneeId: 'eve', assigneeName: 'Eve', createdById: 'u2', priority: 'HIGH', dueDate: past });
    const grouped = await getMyTasks('org-1', 'eve');
    expect(grouped.overdue[0].priority).toBe('HIGH');
    expect(grouped.overdue[1].priority).toBe('MEDIUM');
  });
});

describe('updateTask', () => {
  it('updates title, priority, and assignee', async () => {
    const task = await createTask({ orgId: 'org-1', title: 'Original', assigneeId: 'u1', assigneeName: 'Alice', createdById: 'u2' });

    const updated = await updateTask(task.id, {
      title: 'Updated',
      priority: 'HIGH',
      assigneeId: 'u3',
      assigneeName: 'Charlie',
    });

    expect(updated.title).toBe('Updated');
    expect(updated.priority).toBe('HIGH');
    expect(updated.assigneeId).toBe('u3');
  });

  it('throws when task not found', async () => {
    await expect(updateTask('non-existent-id', { title: 'X' })).rejects.toThrow('Task not found');
  });

  it('updates description field', async () => {
    const task = await createTask({ orgId: 'org-1', title: 'T', assigneeId: 'u1', assigneeName: 'Alice', createdById: 'u2' });
    const updated = await updateTask(task.id, { description: 'New desc' });
    expect(updated.description).toBe('New desc');
  });

  it('updates dueDate field', async () => {
    const task = await createTask({ orgId: 'org-1', title: 'T', assigneeId: 'u1', assigneeName: 'Alice', createdById: 'u2' });
    const newDue = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const updated = await updateTask(task.id, { dueDate: newDue });
    expect(updated.dueDate).toBeInstanceOf(Date);
    expect(updated.dueDate!.getTime()).toBeCloseTo(newDue.getTime(), -2);
  });
});

describe('completeTask', () => {
  it('sets status to COMPLETE and records completedAt', async () => {
    const task = await createTask({ orgId: 'org-1', title: 'T1', assigneeId: 'u1', assigneeName: 'Alice', createdById: 'u2' });

    const completed = await completeTask(task.id);

    expect(completed.status).toBe('COMPLETE');
    expect(completed.completedAt).toBeInstanceOf(Date);
  });

  it('throws when task not found', async () => {
    await expect(completeTask('bad-id')).rejects.toThrow('Task not found');
  });
});

describe('deleteTask', () => {
  it('removes a task from the store', async () => {
    const task = await createTask({ orgId: 'org-1', title: 'Delete me', assigneeId: 'u1', assigneeName: 'Alice', createdById: 'u2' });

    await deleteTask(task.id);

    const found = await getTaskById(task.id);
    expect(found).toBeNull();
  });

  it('throws when task not found', async () => {
    await expect(deleteTask('no-such-id')).rejects.toThrow('Task not found');
  });
});

describe('getTaskById', () => {
  it('returns the task by ID', async () => {
    const task = await createTask({ orgId: 'org-1', title: 'Find me', assigneeId: 'u1', assigneeName: 'Alice', createdById: 'u2' });

    const found = await getTaskById(task.id);
    expect(found?.id).toBe(task.id);
    expect(found?.title).toBe('Find me');
  });

  it('returns null for unknown ID', async () => {
    const found = await getTaskById('not-there');
    expect(found).toBeNull();
  });
});
