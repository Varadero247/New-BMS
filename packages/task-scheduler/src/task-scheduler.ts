// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Task {
  id: string;
  name: string;
  priority: Priority;
  fn: () => Promise<void>;
  createdAt: number;
  scheduledAt?: number;
}

export interface ScheduledTask extends Task {
  scheduledAt: number;
}

let taskCounter = 0;

export function createTask(name: string, fn: () => Promise<void>, priority: Priority = 'MEDIUM'): Task {
  return {
    id: `task-${++taskCounter}-${Date.now()}`,
    name,
    priority,
    fn,
    createdAt: Date.now(),
  };
}

export function priorityScore(p: Priority): number {
  if (p === 'HIGH') return 3;
  if (p === 'MEDIUM') return 2;
  return 1;
}

export function comparePriority(a: Task, b: Task): number {
  return priorityScore(b.priority) - priorityScore(a.priority);
}

export interface TaskQueue {
  add(task: Task): void;
  peek(): Task | undefined;
  poll(): Task | undefined;
  size(): number;
  isEmpty(): boolean;
  drain(): Task[];
  contains(id: string): boolean;
  remove(id: string): boolean;
  toArray(): Task[];
  clear(): void;
}

export function createTaskQueue(): TaskQueue {
  let items: Task[] = [];

  function sortItems() {
    items.sort(comparePriority);
  }

  return {
    add(task: Task): void {
      items.push(task);
      sortItems();
    },
    peek(): Task | undefined {
      return items[0];
    },
    poll(): Task | undefined {
      if (items.length === 0) return undefined;
      const task = items[0];
      items = items.slice(1);
      return task;
    },
    size(): number {
      return items.length;
    },
    isEmpty(): boolean {
      return items.length === 0;
    },
    drain(): Task[] {
      const all = [...items];
      items = [];
      return all;
    },
    contains(id: string): boolean {
      return items.some(t => t.id === id);
    },
    remove(id: string): boolean {
      const idx = items.findIndex(t => t.id === id);
      if (idx === -1) return false;
      items.splice(idx, 1);
      return true;
    },
    toArray(): Task[] {
      return [...items];
    },
    clear(): void {
      items = [];
    },
  };
}

export interface Scheduler {
  schedule(task: Task, delayMs: number): string;
  cancel(scheduleId: string): boolean;
  pending(): number;
  runNow(task: Task): Promise<void>;
}

export function createScheduler(): Scheduler {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  let scheduleCounter = 0;

  return {
    schedule(task: Task, delayMs: number): string {
      const scheduleId = `sched-${++scheduleCounter}`;
      const timer = setTimeout(() => {
        timers.delete(scheduleId);
        task.fn().catch(() => {/* ignore */});
      }, delayMs);
      timers.set(scheduleId, timer);
      return scheduleId;
    },
    cancel(scheduleId: string): boolean {
      const timer = timers.get(scheduleId);
      if (timer === undefined) return false;
      clearTimeout(timer);
      timers.delete(scheduleId);
      return true;
    },
    pending(): number {
      return timers.size;
    },
    runNow(task: Task): Promise<void> {
      return task.fn();
    },
  };
}

export function groupByPriority(tasks: Task[]): Record<Priority, Task[]> {
  const result: Record<Priority, Task[]> = { HIGH: [], MEDIUM: [], LOW: [] };
  for (const task of tasks) {
    result[task.priority].push(task);
  }
  return result;
}

export function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort(comparePriority);
}

export function filterByPriority(tasks: Task[], priority: Priority): Task[] {
  return tasks.filter(t => t.priority === priority);
}

export function taskStats(tasks: Task[]): { total: number; high: number; medium: number; low: number } {
  const high = tasks.filter(t => t.priority === 'HIGH').length;
  const medium = tasks.filter(t => t.priority === 'MEDIUM').length;
  const low = tasks.filter(t => t.priority === 'LOW').length;
  return { total: tasks.length, high, medium, low };
}
