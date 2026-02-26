import { CriticalPath, DependencyType, GanttDependency, GanttProject, GanttTask, ProjectStats, TaskStatus } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function taskDurationMs(task: GanttTask): number {
  return Math.max(0, task.endDate - task.startDate);
}

export function taskDurationDays(task: GanttTask): number {
  return taskDurationMs(task) / DAY_MS;
}

export function isTaskOverdue(task: GanttTask, now = Date.now()): boolean {
  return task.status !== 'completed' && task.status !== 'cancelled' && task.endDate < now;
}

export function taskOverlapMs(a: GanttTask, b: GanttTask): number {
  const start = Math.max(a.startDate, b.startDate);
  const end = Math.min(a.endDate, b.endDate);
  return Math.max(0, end - start);
}

export function createTask(
  id: string, name: string, startDate: number, endDate: number,
  progress = 0, status: TaskStatus = 'not_started'
): GanttTask {
  return { id, name, startDate, endDate, progress: Math.max(0, Math.min(100, progress)), status };
}

export function createProject(id: string, name: string, tasks: GanttTask[] = [], deps: GanttDependency[] = []): GanttProject {
  const starts = tasks.map(t => t.startDate);
  const ends = tasks.map(t => t.endDate);
  const startDate = starts.length > 0 ? Math.min(...starts) : Date.now();
  const endDate = ends.length > 0 ? Math.max(...ends) : Date.now();
  return { id, name, tasks, dependencies: deps, startDate, endDate };
}

export function getProjectStats(project: GanttProject, now = Date.now()): ProjectStats {
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const overdueTasks = project.tasks.filter(t => isTaskOverdue(t, now)).length;
  const blockedTasks = project.tasks.filter(t => t.status === 'blocked').length;
  const totalDurationMs = project.tasks.reduce((s, t) => s + taskDurationMs(t), 0);
  return { totalTasks, completedTasks, completionPercentage, overdueTasks, blockedTasks, totalDurationMs };
}

export function getTaskById(project: GanttProject, id: string): GanttTask | undefined {
  return project.tasks.find(t => t.id === id);
}

export function getDependenciesOf(project: GanttProject, taskId: string): GanttDependency[] {
  return project.dependencies.filter(d => d.toTaskId === taskId);
}

export function getDependents(project: GanttProject, taskId: string): GanttDependency[] {
  return project.dependencies.filter(d => d.fromTaskId === taskId);
}

export function filterTasksByStatus(project: GanttProject, status: TaskStatus): GanttTask[] {
  return project.tasks.filter(t => t.status === status);
}

export function computeOverallProgress(project: GanttProject): number {
  if (project.tasks.length === 0) return 0;
  return project.tasks.reduce((s, t) => s + t.progress, 0) / project.tasks.length;
}

export function findCriticalPath(project: GanttProject): CriticalPath {
  if (project.tasks.length === 0) return { taskIds: [], totalDuration: 0 };
  // Simple longest-path (by duration) approximation
  const sorted = [...project.tasks].sort((a, b) => taskDurationMs(b) - taskDurationMs(a));
  return { taskIds: sorted.map(t => t.id), totalDuration: taskDurationMs(sorted[0]) };
}

export function addTaskToProject(project: GanttProject, task: GanttTask): GanttProject {
  const tasks = [...project.tasks, task];
  return { ...project, tasks, startDate: Math.min(project.startDate, task.startDate), endDate: Math.max(project.endDate, task.endDate) };
}

export function removeTaskFromProject(project: GanttProject, taskId: string): GanttProject {
  return { ...project, tasks: project.tasks.filter(t => t.id !== taskId), dependencies: project.dependencies.filter(d => d.fromTaskId !== taskId && d.toTaskId !== taskId) };
}

export function updateTaskProgress(project: GanttProject, taskId: string, progress: number): GanttProject {
  return { ...project, tasks: project.tasks.map(t => t.id === taskId ? { ...t, progress: Math.max(0, Math.min(100, progress)) } : t) };
}

export function isValidTaskStatus(s: string): s is TaskStatus {
  return ['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'].includes(s);
}

export function isValidDependencyType(t: string): t is DependencyType {
  return ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'].includes(t);
}

export function sortTasksByStartDate(tasks: GanttTask[]): GanttTask[] {
  return [...tasks].sort((a, b) => a.startDate - b.startDate);
}

export function getTasksInRange(project: GanttProject, from: number, to: number): GanttTask[] {
  return project.tasks.filter(t => t.startDate <= to && t.endDate >= from);
}
