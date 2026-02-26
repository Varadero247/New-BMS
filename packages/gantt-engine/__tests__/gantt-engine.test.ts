import {
  taskDurationMs,
  taskDurationDays,
  isTaskOverdue,
  taskOverlapMs,
  createTask,
  createProject,
  getProjectStats,
  getTaskById,
  getDependenciesOf,
  getDependents,
  filterTasksByStatus,
  computeOverallProgress,
  findCriticalPath,
  addTaskToProject,
  removeTaskFromProject,
  updateTaskProgress,
  isValidTaskStatus,
  isValidDependencyType,
  sortTasksByStartDate,
  getTasksInRange,
  GanttTask,
  GanttProject,
  GanttDependency,
  TaskStatus,
  DependencyType,
} from '../src/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_700_000_000_000; // fixed "now" for deterministic tests

function makeTask(
  id: string,
  startOffset: number,
  endOffset: number,
  status: TaskStatus = 'not_started',
  progress = 0
): GanttTask {
  return {
    id,
    name: `Task ${id}`,
    startDate: NOW + startOffset,
    endDate: NOW + endOffset,
    progress,
    status,
  };
}

function makeProject(tasks: GanttTask[] = [], deps: GanttDependency[] = []): GanttProject {
  return createProject('proj-1', 'Test Project', tasks, deps);
}

function makeDep(from: string, to: string, type: DependencyType = 'finish_to_start'): GanttDependency {
  return { fromTaskId: from, toTaskId: to, type };
}

// ===========================================================================
// taskDurationMs
// ===========================================================================
describe('taskDurationMs', () => {
  // 1-20: explicit durations
  const cases: Array<[number, number, number]> = [
    [0, 0, 0],
    [0, 1000, 1000],
    [0, DAY, DAY],
    [0, 7 * DAY, 7 * DAY],
    [0, 30 * DAY, 30 * DAY],
    [1000, 2000, 1000],
    [1000, 1000, 0],
    [2000, 1000, 0],      // endDate < startDate → clamped to 0
    [0, 365 * DAY, 365 * DAY],
    [100, 86400100, 86400000], // exactly 1 day
    [NOW, NOW + DAY, DAY],
    [NOW, NOW, 0],
    [0, 5 * DAY, 5 * DAY],
    [0, 14 * DAY, 14 * DAY],
    [0, 90 * DAY, 90 * DAY],
    [0, 180 * DAY, 180 * DAY],
    [500, 500, 0],
    [DAY, 2 * DAY, DAY],
    [3 * DAY, 10 * DAY, 7 * DAY],
    [10 * DAY, 11 * DAY, DAY],
  ];
  cases.forEach(([start, end, expected], i) => {
    it(`case ${i + 1}: start=${start} end=${end} → ${expected}ms`, () => {
      const task = makeTask(`t${i}`, 0, 0);
      task.startDate = start;
      task.endDate = end;
      expect(taskDurationMs(task)).toBe(expected);
    });
  });

  // 21-40: loop over multiples of 1 day
  for (let d = 1; d <= 20; d++) {
    it(`duration of ${d} day(s) task`, () => {
      const task = makeTask('td', 0, d * DAY);
      expect(taskDurationMs(task)).toBe(d * DAY);
    });
  }
});

// ===========================================================================
// taskDurationDays
// ===========================================================================
describe('taskDurationDays', () => {
  // 1-15: exact day conversions
  for (let d = 0; d <= 14; d++) {
    it(`${d} days task → durationDays === ${d}`, () => {
      const task = makeTask('td', 0, d * DAY);
      expect(taskDurationDays(task)).toBe(d);
    });
  }

  // 16-30: fractional days
  const fractional: Array<[number, number]> = [
    [DAY / 2, 0.5],
    [DAY / 4, 0.25],
    [DAY / 8, 0.125],
    [3 * DAY / 2, 1.5],
    [5 * DAY / 2, 2.5],
    [7 * DAY / 4, 1.75],
    [DAY * 10, 10],
    [DAY * 20, 20],
    [DAY * 50, 50],
    [DAY * 100, 100],
    [DAY * 365, 365],
    [0, 0],
    [DAY * 3, 3],
    [DAY * 6, 6],
    [DAY * 9, 9],
  ];
  fractional.forEach(([ms, days], i) => {
    it(`fractional case ${i + 1}: ${ms}ms → ${days} days`, () => {
      const task = makeTask('tf', 0, ms);
      expect(taskDurationDays(task)).toBeCloseTo(days, 10);
    });
  });

  // 31-45: negative durations clamped to 0
  for (let d = 1; d <= 15; d++) {
    it(`negative duration task ${d} → 0 days`, () => {
      const task = makeTask('tn', d * DAY, 0);
      expect(taskDurationDays(task)).toBe(0);
    });
  }
});

// ===========================================================================
// isTaskOverdue
// ===========================================================================
describe('isTaskOverdue', () => {
  // offsets relative to NOW (makeTask adds NOW to them)
  const pastEndOffset = -DAY;       // endDate = NOW - DAY (in the past)
  const futureEndOffset = DAY;      // endDate = NOW + DAY (in the future)

  // 1-20: completed tasks are never overdue regardless of end date
  for (let i = 0; i < 20; i++) {
    it(`completed task ${i + 1} with past endDate is NOT overdue`, () => {
      const task = makeTask('c', -3 * DAY, pastEndOffset - i * 1000, 'completed', 100);
      expect(isTaskOverdue(task, NOW)).toBe(false);
    });
  }

  // 21-40: cancelled tasks are never overdue
  for (let i = 0; i < 20; i++) {
    it(`cancelled task ${i + 1} with past endDate is NOT overdue`, () => {
      const task = makeTask('x', -3 * DAY, pastEndOffset - i * 1000, 'cancelled');
      expect(isTaskOverdue(task, NOW)).toBe(false);
    });
  }

  // 41-60: not_started tasks with past end are overdue
  for (let i = 0; i < 20; i++) {
    it(`not_started task ${i + 1} past endDate IS overdue`, () => {
      const task = makeTask('n', -3 * DAY, pastEndOffset - i * 1000, 'not_started');
      expect(isTaskOverdue(task, NOW)).toBe(true);
    });
  }

  // 61-80: in_progress tasks with past end are overdue
  for (let i = 0; i < 20; i++) {
    it(`in_progress task ${i + 1} past endDate IS overdue`, () => {
      const task = makeTask('p', -3 * DAY, pastEndOffset - i * 1000, 'in_progress', 50);
      expect(isTaskOverdue(task, NOW)).toBe(true);
    });
  }

  // 81-100: blocked tasks with past end are overdue
  for (let i = 0; i < 20; i++) {
    it(`blocked task ${i + 1} past endDate IS overdue`, () => {
      const task = makeTask('b', -3 * DAY, pastEndOffset - i * 1000, 'blocked');
      expect(isTaskOverdue(task, NOW)).toBe(true);
    });
  }

  // 101-115: future end date tasks are NOT overdue (various statuses)
  const activeStatuses: TaskStatus[] = ['not_started', 'in_progress', 'blocked'];
  activeStatuses.forEach((status, si) => {
    for (let i = 0; i < 5; i++) {
      it(`${status} task with future endDate ${i + 1} is NOT overdue`, () => {
        const task = makeTask('f', 0, futureEndOffset + i * 1000, status);
        expect(isTaskOverdue(task, NOW)).toBe(false);
      });
    }
  });

  // 116-120: boundary: endDate = NOW - 1 (just before now) IS overdue
  for (let i = 0; i < 5; i++) {
    it(`boundary case ${i + 1}: endDate === now - 1 for not_started IS overdue`, () => {
      const task: GanttTask = {
        id: 'b', name: 'b', startDate: NOW - 2 * DAY, endDate: NOW - 1,
        progress: 0, status: 'not_started',
      };
      expect(isTaskOverdue(task, NOW)).toBe(true);
    });
  }
});

// ===========================================================================
// taskOverlapMs
// ===========================================================================
describe('taskOverlapMs', () => {
  // No overlap cases (1-20)
  for (let i = 0; i < 20; i++) {
    it(`no overlap case ${i + 1}: tasks are sequential`, () => {
      const a = makeTask('a', 0, DAY);
      const b = makeTask('b', DAY + i * 1000, 2 * DAY + i * 1000);
      expect(taskOverlapMs(a, b)).toBe(0);
    });
  }

  // Adjacent tasks (21-25): endDate of a === startDate of b → 0 overlap
  for (let i = 0; i < 5; i++) {
    it(`adjacent tasks case ${i + 1}: overlap = 0`, () => {
      const a = makeTask('a', 0, DAY);
      const b = makeTask('b', DAY, 2 * DAY);
      expect(taskOverlapMs(a, b)).toBe(0);
    });
  }

  // Partial overlap (26-45)
  for (let i = 1; i <= 20; i++) {
    it(`partial overlap case ${i}: overlap = ${i * 1000}ms`, () => {
      const a = makeTask('a', 0, 2 * i * 1000);
      const b = makeTask('b', i * 1000, 3 * i * 1000);
      expect(taskOverlapMs(a, b)).toBe(i * 1000);
    });
  }

  // Full containment overlap (46-60): b is fully inside a
  for (let i = 1; i <= 9; i++) {
    it(`full containment case ${i}: b inside a → overlap = duration of b`, () => {
      const a = makeTask('a', 0, 10 * DAY);
      const b = makeTask('b', i * DAY, (i + 1) * DAY);
      expect(taskOverlapMs(a, b)).toBe(DAY);
    });
  }
  // Full containment extra (with bigger container)
  for (let i = 10; i <= 15; i++) {
    it(`full containment case ${i}: b inside larger a → overlap = duration of b`, () => {
      const a = makeTask('a', 0, 20 * DAY);
      const b = makeTask('b', i * DAY, (i + 1) * DAY);
      expect(taskOverlapMs(a, b)).toBe(DAY);
    });
  }

  // Commutative property (61-75)
  for (let i = 1; i <= 15; i++) {
    it(`commutative case ${i}: overlap(a,b) === overlap(b,a)`, () => {
      const a = makeTask('a', 0, (i + 2) * DAY);
      const b = makeTask('b', i * DAY, (i + 4) * DAY);
      expect(taskOverlapMs(a, b)).toBe(taskOverlapMs(b, a));
    });
  }

  // Same task overlap (76-80)
  for (let d = 1; d <= 5; d++) {
    it(`same task overlap ${d}: task overlaps with itself = full duration`, () => {
      const t = makeTask('a', 0, d * DAY);
      expect(taskOverlapMs(t, t)).toBe(d * DAY);
    });
  }
});

// ===========================================================================
// createTask
// ===========================================================================
describe('createTask', () => {
  // Basic field assignment (1-20)
  for (let i = 0; i < 20; i++) {
    it(`createTask case ${i + 1}: correct id and name`, () => {
      const t = createTask(`id-${i}`, `name-${i}`, i * 1000, (i + 1) * 1000);
      expect(t.id).toBe(`id-${i}`);
      expect(t.name).toBe(`name-${i}`);
    });
  }

  // Progress clamping below 0 (21-35)
  for (let i = -15; i < 0; i++) {
    it(`progress clamping: ${i} → 0`, () => {
      const t = createTask('x', 'task', 0, DAY, i);
      expect(t.progress).toBe(0);
    });
  }

  // Progress clamping above 100 (36-50)
  for (let i = 101; i <= 115; i++) {
    it(`progress clamping: ${i} → 100`, () => {
      const t = createTask('x', 'task', 0, DAY, i);
      expect(t.progress).toBe(100);
    });
  }

  // Valid progress range (51-70)
  for (let p = 0; p <= 100; p += 5) {
    it(`progress ${p} stays as-is`, () => {
      const t = createTask('x', 'task', 0, DAY, p);
      expect(t.progress).toBe(p);
    });
  }

  // Default status (71-75)
  for (let i = 0; i < 5; i++) {
    it(`default status is not_started (${i})`, () => {
      const t = createTask('x', 'task', 0, DAY);
      expect(t.status).toBe('not_started');
    });
  }

  // Default progress (76-80)
  for (let i = 0; i < 5; i++) {
    it(`default progress is 0 (${i})`, () => {
      const t = createTask('x', 'task', 0, DAY);
      expect(t.progress).toBe(0);
    });
  }

  // Explicit status values (81-85)
  const statuses: TaskStatus[] = ['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'];
  statuses.forEach((s, i) => {
    it(`status ${s} is preserved`, () => {
      const t = createTask('x', 'task', 0, DAY, 50, s);
      expect(t.status).toBe(s);
    });
  });

  // Start/end dates preserved (86-100)
  for (let d = 1; d <= 15; d++) {
    it(`startDate and endDate preserved: ${d} day(s)`, () => {
      const start = d * DAY;
      const end = (d + 5) * DAY;
      const t = createTask('x', 'n', start, end);
      expect(t.startDate).toBe(start);
      expect(t.endDate).toBe(end);
    });
  }
});

// ===========================================================================
// createProject
// ===========================================================================
describe('createProject', () => {
  // Empty project (1-5)
  for (let i = 0; i < 5; i++) {
    it(`empty project ${i + 1}: tasks array is empty`, () => {
      const now = Date.now();
      const p = createProject(`p${i}`, `Project ${i}`);
      expect(p.tasks).toHaveLength(0);
      expect(p.dependencies).toHaveLength(0);
    });
  }

  // ID and name preserved (6-15)
  for (let i = 0; i < 10; i++) {
    it(`project id and name preserved (${i})`, () => {
      const p = createProject(`proj-${i}`, `My Project ${i}`);
      expect(p.id).toBe(`proj-${i}`);
      expect(p.name).toBe(`My Project ${i}`);
    });
  }

  // startDate = min of task start dates (16-30)
  for (let i = 1; i <= 15; i++) {
    it(`startDate is minimum of task starts (${i} tasks)`, () => {
      const tasks = Array.from({ length: i }, (_, j) =>
        makeTask(`t${j}`, j * DAY, (j + 2) * DAY)
      );
      const p = createProject('p', 'P', tasks);
      expect(p.startDate).toBe(tasks[0].startDate);
    });
  }

  // endDate = max of task end dates (31-45)
  for (let i = 1; i <= 15; i++) {
    it(`endDate is maximum of task ends (${i} tasks)`, () => {
      const tasks = Array.from({ length: i }, (_, j) =>
        makeTask(`t${j}`, j * DAY, (j + 2) * DAY)
      );
      const p = createProject('p', 'P', tasks);
      const expectedEnd = tasks[tasks.length - 1].endDate;
      expect(p.endDate).toBe(expectedEnd);
    });
  }

  // Dependencies wired (46-55)
  for (let i = 0; i < 10; i++) {
    it(`dependencies stored correctly (${i})`, () => {
      const t1 = makeTask('t1', 0, DAY);
      const t2 = makeTask('t2', DAY, 2 * DAY);
      const dep = makeDep('t1', 't2');
      const p = createProject('p', 'P', [t1, t2], [dep]);
      expect(p.dependencies).toHaveLength(1);
      expect(p.dependencies[0].fromTaskId).toBe('t1');
      expect(p.dependencies[0].toTaskId).toBe('t2');
    });
  }

  // Multiple deps (56-65)
  for (let n = 2; n <= 11; n++) {
    it(`project with ${n} dependencies stores all`, () => {
      const tasks = Array.from({ length: n + 1 }, (_, j) =>
        makeTask(`t${j}`, j * DAY, (j + 1) * DAY)
      );
      const deps = Array.from({ length: n }, (_, j) =>
        makeDep(`t${j}`, `t${j + 1}`)
      );
      const p = createProject('p', 'P', tasks, deps);
      expect(p.dependencies).toHaveLength(n);
    });
  }
});

// ===========================================================================
// getProjectStats
// ===========================================================================
describe('getProjectStats', () => {
  // Empty project (1-5)
  for (let i = 0; i < 5; i++) {
    it(`empty project stats ${i + 1}: all zeros`, () => {
      const p = makeProject();
      const stats = getProjectStats(p, NOW);
      expect(stats.totalTasks).toBe(0);
      expect(stats.completedTasks).toBe(0);
      expect(stats.completionPercentage).toBe(0);
      expect(stats.overdueTasks).toBe(0);
      expect(stats.blockedTasks).toBe(0);
      expect(stats.totalDurationMs).toBe(0);
    });
  }

  // All completed (6-15)
  for (let n = 1; n <= 10; n++) {
    it(`${n} completed tasks → completionPercentage 100`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, 0, DAY, 'completed', 100)
      );
      const p = makeProject(tasks);
      const stats = getProjectStats(p, NOW);
      expect(stats.completionPercentage).toBe(100);
      expect(stats.completedTasks).toBe(n);
    });
  }

  // Mixed completed/not (16-25)
  for (let n = 1; n <= 10; n++) {
    it(`mixed tasks: ${n} of 10 completed → completionPercentage = ${n * 10}`, () => {
      const tasks = Array.from({ length: 10 }, (_, i) =>
        makeTask(`t${i}`, 0, DAY, i < n ? 'completed' : 'not_started')
      );
      const p = makeProject(tasks);
      const stats = getProjectStats(p, NOW);
      expect(stats.completionPercentage).toBeCloseTo(n * 10, 5);
    });
  }

  // Additional mixed completed/not variants (26-30) — different total sizes
  for (let n = 1; n <= 5; n++) {
    it(`mixed tasks alt: ${n} of ${n * 2} completed → completionPercentage = 50`, () => {
      const total = n * 2;
      const tasks = Array.from({ length: total }, (_, i) =>
        makeTask(`t${i}`, 0, DAY, i < n ? 'completed' : 'not_started')
      );
      const p = makeProject(tasks);
      const stats = getProjectStats(p, NOW);
      expect(stats.completionPercentage).toBeCloseTo(50, 5);
    });
  }

  // Overdue tasks (31-45)
  for (let n = 1; n <= 15; n++) {
    it(`${n} overdue tasks counted correctly`, () => {
      const overdueTasks = Array.from({ length: n }, (_, i) =>
        makeTask(`o${i}`, -3 * DAY, -DAY, 'in_progress')
      );
      const futureTasks = Array.from({ length: 5 }, (_, i) =>
        makeTask(`f${i}`, DAY, 3 * DAY, 'not_started')
      );
      const p = makeProject([...overdueTasks, ...futureTasks]);
      const stats = getProjectStats(p, NOW);
      expect(stats.overdueTasks).toBe(n);
    });
  }

  // Blocked tasks (46-55)
  for (let n = 1; n <= 10; n++) {
    it(`${n} blocked tasks counted correctly`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`b${i}`, DAY, 3 * DAY, 'blocked')
      );
      const p = makeProject(tasks);
      const stats = getProjectStats(p, NOW);
      expect(stats.blockedTasks).toBe(n);
    });
  }

  // totalDurationMs (56-65)
  for (let n = 1; n <= 10; n++) {
    it(`totalDurationMs = sum of task durations (${n} tasks)`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, i * DAY, (i + 1) * DAY)
      );
      const p = makeProject(tasks);
      const stats = getProjectStats(p, NOW);
      expect(stats.totalDurationMs).toBe(n * DAY);
    });
  }

  // Completed tasks are not overdue (66-70)
  for (let i = 0; i < 5; i++) {
    it(`completed past-due task ${i + 1}: not counted as overdue`, () => {
      const task = makeTask('c', -3 * DAY, -DAY, 'completed', 100);
      const p = makeProject([task]);
      const stats = getProjectStats(p, NOW);
      expect(stats.overdueTasks).toBe(0);
    });
  }

  // totalTasks count (71-80)
  for (let n = 1; n <= 10; n++) {
    it(`totalTasks = ${n}`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, 0, DAY)
      );
      const p = makeProject(tasks);
      expect(getProjectStats(p, NOW).totalTasks).toBe(n);
    });
  }
});

// ===========================================================================
// getTaskById
// ===========================================================================
describe('getTaskById', () => {
  // Found (1-20)
  for (let i = 0; i < 20; i++) {
    it(`getTaskById finds task with id t${i}`, () => {
      const tasks = Array.from({ length: 20 }, (_, j) =>
        makeTask(`t${j}`, j * DAY, (j + 1) * DAY)
      );
      const p = makeProject(tasks);
      const found = getTaskById(p, `t${i}`);
      expect(found).toBeDefined();
      expect(found!.id).toBe(`t${i}`);
    });
  }

  // Not found (21-40)
  for (let i = 0; i < 20; i++) {
    it(`getTaskById returns undefined for missing id ${i}`, () => {
      const tasks = Array.from({ length: 5 }, (_, j) =>
        makeTask(`t${j}`, j * DAY, (j + 1) * DAY)
      );
      const p = makeProject(tasks);
      expect(getTaskById(p, `missing-${i}`)).toBeUndefined();
    });
  }

  // Empty project (41-45)
  for (let i = 0; i < 5; i++) {
    it(`getTaskById on empty project ${i + 1} returns undefined`, () => {
      const p = makeProject();
      expect(getTaskById(p, `t${i}`)).toBeUndefined();
    });
  }

  // ID type checks (46-50)
  for (let i = 0; i < 5; i++) {
    it(`getTaskById returns task with correct name (case ${i})`, () => {
      const task = makeTask(`unique-${i}`, 0, DAY);
      task.name = `Special Task ${i}`;
      const p = makeProject([task]);
      const found = getTaskById(p, `unique-${i}`);
      expect(found?.name).toBe(`Special Task ${i}`);
    });
  }
});

// ===========================================================================
// getDependenciesOf
// ===========================================================================
describe('getDependenciesOf', () => {
  // Task with no incoming deps (1-10)
  for (let i = 0; i < 10; i++) {
    it(`getDependenciesOf: no incoming deps for t${i}`, () => {
      const t1 = makeTask('t1', 0, DAY);
      const t2 = makeTask('t2', DAY, 2 * DAY);
      const dep = makeDep('t1', 't2');
      const p = makeProject([t1, t2], [dep]);
      expect(getDependenciesOf(p, 't1')).toHaveLength(0);
    });
  }

  // Task with one incoming dep (11-20)
  for (let i = 0; i < 10; i++) {
    it(`getDependenciesOf: one incoming dep for t2 (case ${i})`, () => {
      const t1 = makeTask('t1', 0, DAY);
      const t2 = makeTask('t2', DAY, 2 * DAY);
      const dep = makeDep('t1', 't2');
      const p = makeProject([t1, t2], [dep]);
      const result = getDependenciesOf(p, 't2');
      expect(result).toHaveLength(1);
      expect(result[0].fromTaskId).toBe('t1');
    });
  }

  // Multiple incoming deps (21-35)
  for (let n = 2; n <= 16; n++) {
    it(`getDependenciesOf: ${n} incoming deps`, () => {
      const tasks = Array.from({ length: n + 1 }, (_, j) =>
        makeTask(`t${j}`, j * DAY, (j + 1) * DAY)
      );
      const deps = Array.from({ length: n }, (_, j) =>
        makeDep(`t${j}`, `t${n}`)
      );
      const p = makeProject(tasks, deps);
      expect(getDependenciesOf(p, `t${n}`)).toHaveLength(n);
    });
  }

  // No deps at all (36-40)
  for (let i = 0; i < 5; i++) {
    it(`getDependenciesOf: empty project ${i + 1}`, () => {
      const p = makeProject();
      expect(getDependenciesOf(p, 'any')).toHaveLength(0);
    });
  }
});

// ===========================================================================
// getDependents
// ===========================================================================
describe('getDependents', () => {
  // Task with no outgoing deps (1-10)
  for (let i = 0; i < 10; i++) {
    it(`getDependents: no outgoing from t2 (case ${i})`, () => {
      const t1 = makeTask('t1', 0, DAY);
      const t2 = makeTask('t2', DAY, 2 * DAY);
      const dep = makeDep('t1', 't2');
      const p = makeProject([t1, t2], [dep]);
      expect(getDependents(p, 't2')).toHaveLength(0);
    });
  }

  // Task with one outgoing dep (11-20)
  for (let i = 0; i < 10; i++) {
    it(`getDependents: one outgoing from t1 (case ${i})`, () => {
      const t1 = makeTask('t1', 0, DAY);
      const t2 = makeTask('t2', DAY, 2 * DAY);
      const dep = makeDep('t1', 't2');
      const p = makeProject([t1, t2], [dep]);
      const result = getDependents(p, 't1');
      expect(result).toHaveLength(1);
      expect(result[0].toTaskId).toBe('t2');
    });
  }

  // Multiple outgoing deps (21-35)
  for (let n = 2; n <= 16; n++) {
    it(`getDependents: ${n} outgoing from t0`, () => {
      const tasks = Array.from({ length: n + 1 }, (_, j) =>
        makeTask(`t${j}`, j * DAY, (j + 1) * DAY)
      );
      const deps = Array.from({ length: n }, (_, j) =>
        makeDep('t0', `t${j + 1}`)
      );
      const p = makeProject(tasks, deps);
      expect(getDependents(p, 't0')).toHaveLength(n);
    });
  }

  // No deps (36-40)
  for (let i = 0; i < 5; i++) {
    it(`getDependents: empty project ${i + 1}`, () => {
      const p = makeProject();
      expect(getDependents(p, 'any')).toHaveLength(0);
    });
  }
});

// ===========================================================================
// filterTasksByStatus
// ===========================================================================
describe('filterTasksByStatus', () => {
  const allStatuses: TaskStatus[] = ['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'];

  // Each status: 1-25 (5 statuses × 5 counts)
  allStatuses.forEach((status, si) => {
    for (let n = 1; n <= 10; n++) {
      it(`filterTasksByStatus: ${n} ${status} tasks in mixed project`, () => {
        const targetTasks = Array.from({ length: n }, (_, i) =>
          makeTask(`target-${si}-${i}`, 0, DAY, status)
        );
        const otherTasks = Array.from({ length: 3 }, (_, i) =>
          makeTask(`other-${si}-${i}`, 0, DAY, allStatuses[(si + 1 + i) % allStatuses.length])
        );
        const p = makeProject([...targetTasks, ...otherTasks]);
        const result = filterTasksByStatus(p, status);
        expect(result).toHaveLength(n);
        result.forEach(t => expect(t.status).toBe(status));
      });
    }
  });

  // Empty project for each status (51-55)
  allStatuses.forEach((status, i) => {
    it(`filterTasksByStatus: empty project returns [] for ${status}`, () => {
      const p = makeProject();
      expect(filterTasksByStatus(p, status)).toHaveLength(0);
    });
  });

  // All tasks same status (56-60)
  allStatuses.forEach((status, i) => {
    it(`filterTasksByStatus: all 5 tasks are ${status}`, () => {
      const tasks = Array.from({ length: 5 }, (_, j) =>
        makeTask(`t${j}`, j * DAY, (j + 1) * DAY, status)
      );
      const p = makeProject(tasks);
      expect(filterTasksByStatus(p, status)).toHaveLength(5);
    });
  });
});

// ===========================================================================
// computeOverallProgress
// ===========================================================================
describe('computeOverallProgress', () => {
  // Empty project (1-5)
  for (let i = 0; i < 5; i++) {
    it(`empty project ${i + 1}: overall progress = 0`, () => {
      const p = makeProject();
      expect(computeOverallProgress(p)).toBe(0);
    });
  }

  // All 0% (6-15)
  for (let n = 1; n <= 10; n++) {
    it(`${n} tasks all 0% → overall progress = 0`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, 0, DAY, 'not_started', 0)
      );
      const p = makeProject(tasks);
      expect(computeOverallProgress(p)).toBe(0);
    });
  }

  // All 100% (16-25)
  for (let n = 1; n <= 10; n++) {
    it(`${n} tasks all 100% → overall progress = 100`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, 0, DAY, 'completed', 100)
      );
      const p = makeProject(tasks);
      expect(computeOverallProgress(p)).toBe(100);
    });
  }

  // Mixed progress (26-45)
  for (let p = 0; p <= 100; p += 5) {
    it(`all tasks at ${p}% → overall progress = ${p}`, () => {
      const tasks = Array.from({ length: 4 }, (_, i) =>
        makeTask(`t${i}`, 0, DAY, 'in_progress', p)
      );
      const project = makeProject(tasks);
      expect(computeOverallProgress(project)).toBeCloseTo(p, 5);
    });
  }

  // Average calculation (46-55)
  for (let n = 2; n <= 11; n++) {
    it(`average progress calculation with ${n} tasks`, () => {
      const progresses = Array.from({ length: n }, (_, i) => (i / (n - 1)) * 100);
      const tasks = progresses.map((pg, i) =>
        makeTask(`t${i}`, i * DAY, (i + 1) * DAY, 'in_progress', pg)
      );
      const p = makeProject(tasks);
      const expected = progresses.reduce((s, v) => s + v, 0) / n;
      expect(computeOverallProgress(p)).toBeCloseTo(expected, 5);
    });
  }
});

// ===========================================================================
// findCriticalPath
// ===========================================================================
describe('findCriticalPath', () => {
  // Empty project (1-5)
  for (let i = 0; i < 5; i++) {
    it(`empty project ${i + 1}: empty critical path`, () => {
      const p = makeProject();
      const cp = findCriticalPath(p);
      expect(cp.taskIds).toHaveLength(0);
      expect(cp.totalDuration).toBe(0);
    });
  }

  // Single task (6-15)
  for (let d = 1; d <= 10; d++) {
    it(`single task of ${d} day(s): critical path = that task`, () => {
      const task = makeTask('t1', 0, d * DAY);
      const p = makeProject([task]);
      const cp = findCriticalPath(p);
      expect(cp.taskIds).toContain('t1');
      expect(cp.totalDuration).toBe(d * DAY);
    });
  }

  // Longest task first in sorted result (16-30)
  for (let n = 2; n <= 16; n++) {
    it(`with ${n} tasks, longest task appears first in critical path`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, 0, (i + 1) * DAY)
      );
      const p = makeProject(tasks);
      const cp = findCriticalPath(p);
      expect(cp.taskIds[0]).toBe(`t${n - 1}`); // longest task
      expect(cp.totalDuration).toBe(n * DAY);
    });
  }

  // All tasks present in result (31-40)
  for (let n = 1; n <= 10; n++) {
    it(`findCriticalPath includes all ${n} task ids`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, i * DAY, (i + 2) * DAY)
      );
      const p = makeProject(tasks);
      const cp = findCriticalPath(p);
      expect(cp.taskIds).toHaveLength(n);
      tasks.forEach(t => expect(cp.taskIds).toContain(t.id));
    });
  }

  // totalDuration matches longest task (41-50)
  for (let n = 2; n <= 11; n++) {
    it(`totalDuration matches duration of longest task (${n} tasks)`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, 0, (i + 1) * DAY)
      );
      const p = makeProject(tasks);
      const cp = findCriticalPath(p);
      expect(cp.totalDuration).toBe(n * DAY);
    });
  }
});

// ===========================================================================
// addTaskToProject
// ===========================================================================
describe('addTaskToProject', () => {
  // Task count increases by 1 (1-15)
  for (let n = 0; n < 15; n++) {
    it(`addTaskToProject: task count increases from ${n} to ${n + 1}`, () => {
      const existing = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, i * DAY, (i + 1) * DAY)
      );
      const p = makeProject(existing);
      const newTask = makeTask('new', n * DAY, (n + 1) * DAY);
      const updated = addTaskToProject(p, newTask);
      expect(updated.tasks).toHaveLength(n + 1);
    });
  }

  // New task present (16-25)
  for (let i = 0; i < 10; i++) {
    it(`addTaskToProject: new task with id new-${i} is present`, () => {
      const p = makeProject([makeTask('t1', 0, DAY)]);
      const newTask = makeTask(`new-${i}`, 2 * DAY, 3 * DAY);
      const updated = addTaskToProject(p, newTask);
      expect(updated.tasks.find(t => t.id === `new-${i}`)).toBeDefined();
    });
  }

  // Original tasks still present (26-35)
  for (let i = 0; i < 10; i++) {
    it(`addTaskToProject: original task t${i} still in result`, () => {
      const orig = makeTask(`t${i}`, i * DAY, (i + 1) * DAY);
      const p = makeProject([orig]);
      const newTask = makeTask('new', 100 * DAY, 101 * DAY);
      const updated = addTaskToProject(p, newTask);
      expect(updated.tasks.find(t => t.id === `t${i}`)).toBeDefined();
    });
  }

  // startDate updated when new task starts earlier (36-45)
  for (let d = 1; d <= 10; d++) {
    it(`addTaskToProject: startDate updated when new task is earlier (${d} day offset)`, () => {
      const t = makeTask('t', d * DAY, (d + 2) * DAY);
      const p = makeProject([t]);
      const earlier = makeTask('e', 0, DAY);
      const updated = addTaskToProject(p, earlier);
      expect(updated.startDate).toBe(0 + NOW); // earlier task's startDate
    });
  }

  // endDate updated when new task ends later (46-55)
  for (let d = 1; d <= 10; d++) {
    it(`addTaskToProject: endDate updated when new task is later (${d})`, () => {
      const t = makeTask('t', 0, DAY);
      const p = makeProject([t]);
      const later = makeTask('l', 2 * DAY + d * 1000, 10 * DAY + d * 1000);
      const updated = addTaskToProject(p, later);
      expect(updated.endDate).toBe(NOW + 10 * DAY + d * 1000);
    });
  }

  // Immutability: original project not mutated (56-60)
  for (let i = 0; i < 5; i++) {
    it(`addTaskToProject: original project not mutated (${i})`, () => {
      const t = makeTask('t1', 0, DAY);
      const p = makeProject([t]);
      const origLen = p.tasks.length;
      addTaskToProject(p, makeTask('new', DAY, 2 * DAY));
      expect(p.tasks).toHaveLength(origLen);
    });
  }
});

// ===========================================================================
// removeTaskFromProject
// ===========================================================================
describe('removeTaskFromProject', () => {
  // Task count decreases (1-15)
  for (let n = 1; n <= 15; n++) {
    it(`removeTaskFromProject: count decreases from ${n} to ${n - 1}`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, i * DAY, (i + 1) * DAY)
      );
      const p = makeProject(tasks);
      const updated = removeTaskFromProject(p, 't0');
      expect(updated.tasks).toHaveLength(n - 1);
    });
  }

  // Removed task not present (16-25)
  for (let i = 0; i < 10; i++) {
    it(`removeTaskFromProject: task t${i} no longer present`, () => {
      const tasks = Array.from({ length: 10 }, (_, j) =>
        makeTask(`t${j}`, j * DAY, (j + 1) * DAY)
      );
      const p = makeProject(tasks);
      const updated = removeTaskFromProject(p, `t${i}`);
      expect(updated.tasks.find(t => t.id === `t${i}`)).toBeUndefined();
    });
  }

  // Dependencies involving removed task are also removed (26-40)
  for (let i = 0; i < 15; i++) {
    it(`removeTaskFromProject: deps involving t0 removed (case ${i})`, () => {
      const t0 = makeTask('t0', 0, DAY);
      const t1 = makeTask('t1', DAY, 2 * DAY);
      const dep = makeDep('t0', 't1');
      const p = makeProject([t0, t1], [dep]);
      const updated = removeTaskFromProject(p, 't0');
      expect(updated.dependencies).toHaveLength(0);
    });
  }

  // Removing non-existent task (41-45)
  for (let i = 0; i < 5; i++) {
    it(`removeTaskFromProject: removing non-existent task ${i} is safe`, () => {
      const tasks = [makeTask('t1', 0, DAY), makeTask('t2', DAY, 2 * DAY)];
      const p = makeProject(tasks);
      const updated = removeTaskFromProject(p, `nonexistent-${i}`);
      expect(updated.tasks).toHaveLength(2);
    });
  }

  // Immutability (46-50)
  for (let i = 0; i < 5; i++) {
    it(`removeTaskFromProject: original project not mutated (${i})`, () => {
      const tasks = [makeTask('t1', 0, DAY), makeTask('t2', DAY, 2 * DAY)];
      const p = makeProject(tasks);
      removeTaskFromProject(p, 't1');
      expect(p.tasks).toHaveLength(2);
    });
  }
});

// ===========================================================================
// updateTaskProgress
// ===========================================================================
describe('updateTaskProgress', () => {
  // Valid progress values (1-21)
  for (let p = 0; p <= 100; p += 5) {
    it(`updateTaskProgress: sets progress to ${p}`, () => {
      const task = makeTask('t1', 0, DAY, 'in_progress', 0);
      const project = makeProject([task]);
      const updated = updateTaskProgress(project, 't1', p);
      const found = updated.tasks.find(t => t.id === 't1');
      expect(found?.progress).toBe(p);
    });
  }

  // Clamp above 100 (22-31)
  for (let v = 101; v <= 110; v++) {
    it(`updateTaskProgress: ${v} clamped to 100`, () => {
      const task = makeTask('t1', 0, DAY);
      const project = makeProject([task]);
      const updated = updateTaskProgress(project, 't1', v);
      expect(updated.tasks.find(t => t.id === 't1')?.progress).toBe(100);
    });
  }

  // Clamp below 0 (32-41)
  for (let v = -1; v >= -10; v--) {
    it(`updateTaskProgress: ${v} clamped to 0`, () => {
      const task = makeTask('t1', 0, DAY);
      const project = makeProject([task]);
      const updated = updateTaskProgress(project, 't1', v);
      expect(updated.tasks.find(t => t.id === 't1')?.progress).toBe(0);
    });
  }

  // Other tasks not affected (42-51)
  for (let i = 0; i < 10; i++) {
    it(`updateTaskProgress: other tasks unchanged (case ${i})`, () => {
      const t1 = makeTask('t1', 0, DAY, 'in_progress', 20);
      const t2 = makeTask('t2', DAY, 2 * DAY, 'not_started', 0);
      const p = makeProject([t1, t2]);
      const updated = updateTaskProgress(p, 't1', 80);
      expect(updated.tasks.find(t => t.id === 't2')?.progress).toBe(0);
    });
  }

  // Non-existent task: project unchanged (52-56)
  for (let i = 0; i < 5; i++) {
    it(`updateTaskProgress: non-existent task ${i} leaves project intact`, () => {
      const task = makeTask('t1', 0, DAY, 'in_progress', 50);
      const p = makeProject([task]);
      const updated = updateTaskProgress(p, `nonexistent-${i}`, 100);
      expect(updated.tasks.find(t => t.id === 't1')?.progress).toBe(50);
    });
  }

  // Immutability (57-61)
  for (let i = 0; i < 5; i++) {
    it(`updateTaskProgress: original project not mutated (${i})`, () => {
      const task = makeTask('t1', 0, DAY, 'in_progress', 10);
      const p = makeProject([task]);
      updateTaskProgress(p, 't1', 90);
      expect(p.tasks.find(t => t.id === 't1')?.progress).toBe(10);
    });
  }
});

// ===========================================================================
// isValidTaskStatus
// ===========================================================================
describe('isValidTaskStatus', () => {
  const validStatuses = ['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'];
  const invalidStatuses = [
    'done', 'pending', 'active', 'closed', 'open', 'finished',
    'COMPLETED', 'IN_PROGRESS', 'NOT_STARTED', '', 'null', 'undefined',
    '0', 'true', 'false', 'running', 'paused', 'deferred', 'archived', 'deleted',
  ];

  // Valid (1-5 × 5 repetitions = 25)
  validStatuses.forEach((s, si) => {
    for (let i = 0; i < 5; i++) {
      it(`isValidTaskStatus: "${s}" is valid (rep ${i + 1})`, () => {
        expect(isValidTaskStatus(s)).toBe(true);
      });
    }
  });

  // Invalid (1-20 invalid values × 1)
  invalidStatuses.forEach((s, i) => {
    it(`isValidTaskStatus: "${s}" is invalid`, () => {
      expect(isValidTaskStatus(s)).toBe(false);
    });
  });
});

// ===========================================================================
// isValidDependencyType
// ===========================================================================
describe('isValidDependencyType', () => {
  const validTypes = ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'];
  const invalidTypes = [
    'fs', 'ss', 'ff', 'sf', 'FS', 'SS', 'FF', 'SF',
    'finish-to-start', 'start-to-start', 'FINISH_TO_START', '',
    'none', 'all', 'depends', '0', 'true', 'blocking', 'soft', 'hard',
  ];

  // Valid (4 × 5 reps = 20)
  validTypes.forEach((t, ti) => {
    for (let i = 0; i < 5; i++) {
      it(`isValidDependencyType: "${t}" is valid (rep ${i + 1})`, () => {
        expect(isValidDependencyType(t)).toBe(true);
      });
    }
  });

  // Invalid (20 values)
  invalidTypes.forEach((t, i) => {
    it(`isValidDependencyType: "${t}" is invalid`, () => {
      expect(isValidDependencyType(t)).toBe(false);
    });
  });
});

// ===========================================================================
// sortTasksByStartDate
// ===========================================================================
describe('sortTasksByStartDate', () => {
  // Already sorted (1-10)
  for (let n = 2; n <= 11; n++) {
    it(`sortTasksByStartDate: ${n} already-sorted tasks remain sorted`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, i * DAY, (i + 1) * DAY)
      );
      const result = sortTasksByStartDate(tasks);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].startDate).toBeLessThanOrEqual(result[i + 1].startDate);
      }
    });
  }

  // Reverse order input (11-20)
  for (let n = 2; n <= 11; n++) {
    it(`sortTasksByStartDate: ${n} reverse-sorted tasks become sorted`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, (n - 1 - i) * DAY, (n - i) * DAY)
      );
      const result = sortTasksByStartDate(tasks);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].startDate).toBeLessThanOrEqual(result[i + 1].startDate);
      }
    });
  }

  // Random-ish order (21-30)
  for (let seed = 0; seed < 10; seed++) {
    it(`sortTasksByStartDate: pseudo-random input ${seed} becomes sorted`, () => {
      const offsets = [5, 2, 8, 1, 9, 3, 7, 4, 6, 0].map(v => (v + seed) % 10);
      const tasks = offsets.map((o, i) => makeTask(`t${i}`, o * DAY, (o + 1) * DAY));
      const result = sortTasksByStartDate(tasks);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].startDate).toBeLessThanOrEqual(result[i + 1].startDate);
      }
    });
  }

  // Length preserved (31-40)
  for (let n = 0; n <= 9; n++) {
    it(`sortTasksByStartDate: length preserved for ${n} tasks`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, i * DAY, (i + 1) * DAY)
      );
      expect(sortTasksByStartDate(tasks)).toHaveLength(n);
    });
  }

  // Immutability (41-45)
  for (let i = 0; i < 5; i++) {
    it(`sortTasksByStartDate: original array not mutated (${i})`, () => {
      const tasks = [
        makeTask('b', 2 * DAY, 3 * DAY),
        makeTask('a', 0, DAY),
      ];
      const original = tasks.map(t => t.id);
      sortTasksByStartDate(tasks);
      expect(tasks.map(t => t.id)).toEqual(original);
    });
  }

  // Single element (46-50)
  for (let i = 0; i < 5; i++) {
    it(`sortTasksByStartDate: single task ${i + 1} returned as-is`, () => {
      const task = makeTask(`t${i}`, i * DAY, (i + 1) * DAY);
      const result = sortTasksByStartDate([task]);
      expect(result[0].id).toBe(`t${i}`);
    });
  }
});

// ===========================================================================
// getTasksInRange
// ===========================================================================
describe('getTasksInRange', () => {
  // Tasks fully inside range (1-15)
  for (let n = 1; n <= 15; n++) {
    it(`getTasksInRange: ${n} tasks fully inside range are returned`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, (i + 1) * DAY, (i + 2) * DAY)
      );
      const p = makeProject(tasks);
      const result = getTasksInRange(p, 0, (n + 3) * DAY + NOW);
      expect(result).toHaveLength(n);
    });
  }

  // Tasks outside range (16-25)
  for (let i = 0; i < 10; i++) {
    it(`getTasksInRange: tasks entirely before range excluded (${i})`, () => {
      const task = makeTask('t', 0, DAY); // ends at NOW + DAY
      const p = makeProject([task]);
      // range starts after task ends
      const result = getTasksInRange(p, NOW + 2 * DAY, NOW + 3 * DAY);
      expect(result).toHaveLength(0);
    });
  }

  // Tasks entirely after range (26-35)
  for (let i = 0; i < 10; i++) {
    it(`getTasksInRange: tasks entirely after range excluded (${i})`, () => {
      const task = makeTask('t', 5 * DAY, 7 * DAY);
      const p = makeProject([task]);
      // range ends before task starts
      const result = getTasksInRange(p, NOW, NOW + DAY);
      expect(result).toHaveLength(0);
    });
  }

  // Partially overlapping tasks included (36-45)
  for (let i = 1; i <= 10; i++) {
    it(`getTasksInRange: task partially overlapping range is included (${i})`, () => {
      // task spans 2 days starting from NOW
      const task = makeTask('t', 0, 2 * DAY);
      const p = makeProject([task]);
      // range only covers second half
      const result = getTasksInRange(p, NOW + DAY, NOW + 3 * DAY);
      expect(result).toHaveLength(1);
    });
  }

  // Empty project (46-50)
  for (let i = 0; i < 5; i++) {
    it(`getTasksInRange: empty project ${i + 1} returns []`, () => {
      const p = makeProject();
      expect(getTasksInRange(p, 0, NOW + 100 * DAY)).toHaveLength(0);
    });
  }

  // Mixed: some inside, some outside (51-60)
  for (let n = 1; n <= 10; n++) {
    it(`getTasksInRange: exactly ${n} of ${n + 5} tasks in range`, () => {
      const insideTasks = Array.from({ length: n }, (_, i) =>
        makeTask(`in${i}`, (i + 1) * DAY, (i + 2) * DAY)
      );
      const outsideTasks = Array.from({ length: 5 }, (_, i) =>
        makeTask(`out${i}`, (n + 10 + i) * DAY, (n + 11 + i) * DAY)
      );
      const p = makeProject([...insideTasks, ...outsideTasks]);
      const result = getTasksInRange(p, NOW, NOW + (n + 3) * DAY);
      expect(result).toHaveLength(n);
    });
  }
});

// ===========================================================================
// Integration / cross-function tests
// ===========================================================================
describe('Integration tests', () => {
  // Workflow: create project → add tasks → update progress → stats (1-10)
  for (let n = 1; n <= 10; n++) {
    it(`workflow ${n}: create → add tasks → update progress → correct stats`, () => {
      let p = createProject('proj', 'Test');
      for (let i = 0; i < n; i++) {
        const t = createTask(`t${i}`, `Task ${i}`, NOW + i * DAY, NOW + (i + 1) * DAY, 0, 'in_progress');
        p = addTaskToProject(p, t);
      }
      // Update all tasks to 50%
      for (let i = 0; i < n; i++) {
        p = updateTaskProgress(p, `t${i}`, 50);
      }
      const stats = getProjectStats(p, NOW + 100 * DAY); // far future so all overdue
      expect(stats.totalTasks).toBe(n);
      expect(computeOverallProgress(p)).toBeCloseTo(50, 5);
    });
  }

  // Remove and re-add cycle (11-20)
  for (let i = 0; i < 10; i++) {
    it(`remove and re-add cycle ${i + 1}: task count stays the same`, () => {
      const t1 = makeTask('t1', 0, DAY);
      const t2 = makeTask('t2', DAY, 2 * DAY);
      let p = makeProject([t1, t2]);
      p = removeTaskFromProject(p, 't1');
      p = addTaskToProject(p, makeTask('t1', 0, DAY));
      expect(p.tasks).toHaveLength(2);
    });
  }

  // sortTasksByStartDate after multiple addTask calls (21-30)
  for (let n = 2; n <= 11; n++) {
    it(`sort after ${n} reverse-added tasks yields correct order`, () => {
      let p = createProject('proj', 'Test');
      for (let i = n - 1; i >= 0; i--) {
        p = addTaskToProject(p, makeTask(`t${i}`, i * DAY, (i + 1) * DAY));
      }
      const sorted = sortTasksByStartDate(p.tasks);
      expect(sorted[0].startDate).toBeLessThanOrEqual(sorted[sorted.length - 1].startDate);
    });
  }

  // filterTasksByStatus after remove (31-40)
  for (let i = 0; i < 10; i++) {
    it(`filterTasksByStatus after removeTask ${i + 1}`, () => {
      const tasks = [
        makeTask('t1', 0, DAY, 'completed', 100),
        makeTask('t2', DAY, 2 * DAY, 'in_progress', 50),
        makeTask('t3', 2 * DAY, 3 * DAY, 'in_progress', 25),
      ];
      let p = makeProject(tasks);
      p = removeTaskFromProject(p, 't1');
      expect(filterTasksByStatus(p, 'completed')).toHaveLength(0);
      expect(filterTasksByStatus(p, 'in_progress')).toHaveLength(2);
    });
  }

  // Dependency graph integrity (41-50)
  for (let n = 2; n <= 11; n++) {
    it(`dependency graph integrity with ${n} chained tasks`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, i * DAY, (i + 1) * DAY)
      );
      const deps = Array.from({ length: n - 1 }, (_, i) =>
        makeDep(`t${i}`, `t${i + 1}`)
      );
      const p = makeProject(tasks, deps);
      expect(getDependents(p, 't0')).toHaveLength(1);
      expect(getDependenciesOf(p, `t${n - 1}`)).toHaveLength(1);
      const mid = Math.floor(n / 2);
      if (mid > 0 && mid < n - 1) {
        expect(getDependenciesOf(p, `t${mid}`)).toHaveLength(1);
        expect(getDependents(p, `t${mid}`)).toHaveLength(1);
      }
    });
  }

  // Critical path on growing project (51-60)
  for (let n = 1; n <= 10; n++) {
    it(`critical path on project with ${n} tasks grows correctly`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, 0, (i + 1) * DAY)
      );
      const p = makeProject(tasks);
      const cp = findCriticalPath(p);
      expect(cp.totalDuration).toBe(n * DAY);
      expect(cp.taskIds).toHaveLength(n);
    });
  }

  // getTasksInRange after addTask (61-65)
  for (let i = 0; i < 5; i++) {
    it(`getTasksInRange after addTask ${i + 1} finds new task`, () => {
      let p = makeProject([makeTask('t1', 0, DAY)]);
      const newTask = makeTask('t2', 2 * DAY, 3 * DAY);
      p = addTaskToProject(p, newTask);
      const result = getTasksInRange(p, NOW + DAY + 1, NOW + 4 * DAY);
      expect(result.some(t => t.id === 't2')).toBe(true);
    });
  }

  // Progress after remove (66-70)
  for (let i = 0; i < 5; i++) {
    it(`computeOverallProgress after removeTask ${i + 1}`, () => {
      const tasks = [
        makeTask('t1', 0, DAY, 'completed', 100),
        makeTask('t2', DAY, 2 * DAY, 'not_started', 0),
      ];
      let p = makeProject(tasks);
      p = removeTaskFromProject(p, 't2');
      expect(computeOverallProgress(p)).toBe(100);
    });
  }

  // isValidTaskStatus + createTask integration (71-75)
  const statuses: TaskStatus[] = ['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'];
  statuses.forEach((s, i) => {
    it(`createTask with valid status ${s} passes isValidTaskStatus check`, () => {
      const t = createTask('x', 'name', 0, DAY, 50, s);
      expect(isValidTaskStatus(t.status)).toBe(true);
    });
  });

  // isValidDependencyType + dep creation (76-79)
  const depTypes: DependencyType[] = ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'];
  depTypes.forEach((type, i) => {
    it(`makeDep with valid type ${type} passes isValidDependencyType check`, () => {
      const dep = makeDep('a', 'b', type);
      expect(isValidDependencyType(dep.type)).toBe(true);
    });
  });

  // Stats totalDurationMs matches manual sum (80-89)
  for (let n = 1; n <= 10; n++) {
    it(`stats totalDurationMs is sum of all task durations (${n} tasks)`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, i * DAY, (i + 2) * DAY) // each task is 2 days
      );
      const p = makeProject(tasks);
      const stats = getProjectStats(p, NOW + 100 * DAY);
      expect(stats.totalDurationMs).toBe(n * 2 * DAY);
    });
  }

  // taskOverlapMs with project tasks (90-99)
  for (let i = 1; i <= 10; i++) {
    it(`taskOverlapMs integration test ${i}: tasks overlap by ${i} hours`, () => {
      const overlapMs = i * 3600 * 1000;
      const a = makeTask('a', 0, 2 * DAY);
      const b = makeTask('b', 2 * DAY - overlapMs, 3 * DAY);
      expect(taskOverlapMs(a, b)).toBe(overlapMs);
    });
  }
});

// ===========================================================================
// Edge / boundary tests
// ===========================================================================
describe('Edge cases', () => {
  // Very large durations (1-10)
  for (let years = 1; years <= 10; years++) {
    it(`taskDurationDays: ${years} year(s) duration`, () => {
      const task = makeTask('t', 0, years * 365 * DAY);
      expect(taskDurationDays(task)).toBeCloseTo(years * 365, 5);
    });
  }

  // Progress exactly at boundary (11-15)
  const boundary = [0, 1, 50, 99, 100];
  boundary.forEach((p, i) => {
    it(`createTask: progress boundary ${p}`, () => {
      const t = createTask('x', 'n', 0, DAY, p);
      expect(t.progress).toBe(p);
    });
  });

  // Tasks with same start/end date (zero duration) (16-20)
  for (let i = 0; i < 5; i++) {
    it(`zero duration task ${i + 1}: durationMs = 0, durationDays = 0`, () => {
      const task = makeTask('t', 0, 0);
      expect(taskDurationMs(task)).toBe(0);
      expect(taskDurationDays(task)).toBe(0);
    });
  }

  // isTaskOverdue: exact boundary (endDate === now - 1) (21-25)
  for (let i = 0; i < 5; i++) {
    it(`isTaskOverdue boundary ${i + 1}: endDate = now - 1 is overdue`, () => {
      const task = makeTask('t', -2 * DAY, -1, 'in_progress');
      expect(isTaskOverdue(task, NOW)).toBe(true);
    });
  }

  // isTaskOverdue: exact boundary (endDate === now) → NOT overdue since now is not < now (26-30)
  for (let i = 0; i < 5; i++) {
    it(`isTaskOverdue boundary ${i + 1}: endDate = now is NOT overdue`, () => {
      const task = makeTask('t', -DAY, 0, 'in_progress');
      // endDate = NOW + 0 = NOW; now = NOW; condition: endDate < now → false
      expect(isTaskOverdue(task, NOW)).toBe(false);
    });
  }

  // getTaskById with duplicate ids: returns first (31-35)
  for (let i = 0; i < 5; i++) {
    it(`getTaskById with duplicate ids ${i + 1}: returns first match`, () => {
      const t1 = { ...makeTask('dup', 0, DAY), name: 'First' };
      const t2 = { ...makeTask('dup', DAY, 2 * DAY), name: 'Second' };
      const p = makeProject([t1, t2]);
      expect(getTaskById(p, 'dup')?.name).toBe('First');
    });
  }

  // computeOverallProgress: single task at various levels (36-56)
  for (let progress = 0; progress <= 100; progress += 5) {
    it(`computeOverallProgress single task at ${progress}% = ${progress}`, () => {
      const task = makeTask('t', 0, DAY, 'in_progress', progress);
      const p = makeProject([task]);
      expect(computeOverallProgress(p)).toBe(progress);
    });
  }

  // Large number of tasks in project (57-61)
  for (let n = 100; n <= 500; n += 100) {
    it(`project with ${n} tasks: stats computed correctly`, () => {
      const tasks = Array.from({ length: n }, (_, i) =>
        makeTask(`t${i}`, i * DAY, (i + 1) * DAY, 'completed', 100)
      );
      const p = makeProject(tasks);
      const stats = getProjectStats(p, NOW);
      expect(stats.totalTasks).toBe(n);
      expect(stats.completedTasks).toBe(n);
      expect(stats.completionPercentage).toBe(100);
    });
  }

  // Dependency types stored correctly (62-65)
  const depTypes: DependencyType[] = ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'];
  depTypes.forEach((type, i) => {
    it(`dependency type ${type} stored and retrieved correctly`, () => {
      const t1 = makeTask('t1', 0, DAY);
      const t2 = makeTask('t2', DAY, 2 * DAY);
      const dep = makeDep('t1', 't2', type);
      const p = makeProject([t1, t2], [dep]);
      expect(p.dependencies[0].type).toBe(type);
    });
  });

  // getTasksInRange with overlapping tasks (66-70)
  for (let i = 0; i < 5; i++) {
    it(`getTasksInRange edge ${i + 1}: task spanning entire range is included`, () => {
      const task = makeTask('t', -10 * DAY, 10 * DAY);
      const p = makeProject([task]);
      const result = getTasksInRange(p, NOW - DAY, NOW + DAY);
      expect(result).toHaveLength(1);
    });
  }

  // removeTaskFromProject dep cleanup: outgoing dep also removed (71-75)
  for (let i = 0; i < 5; i++) {
    it(`removeTaskFromProject: outgoing dep from removed task is cleaned (${i})`, () => {
      const t0 = makeTask('t0', 0, DAY);
      const t1 = makeTask('t1', DAY, 2 * DAY);
      const dep = makeDep('t0', 't1');
      const p = makeProject([t0, t1], [dep]);
      const updated = removeTaskFromProject(p, 't0');
      expect(updated.dependencies).toHaveLength(0);
    });
  }

  // addTaskToProject: project with no tasks gets correct start/end (76-80)
  for (let d = 1; d <= 5; d++) {
    it(`addTaskToProject to empty project: start/end set correctly (${d})`, () => {
      const p = createProject('p', 'P');
      const task = makeTask('t', 0, d * DAY);
      const updated = addTaskToProject(p, task);
      expect(updated.startDate).toBeLessThanOrEqual(task.startDate);
      expect(updated.endDate).toBeGreaterThanOrEqual(task.endDate);
    });
  }
});
