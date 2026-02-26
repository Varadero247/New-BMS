export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
export type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';

export interface GanttTask {
  id: string;
  name: string;
  startDate: number;   // epoch ms
  endDate: number;     // epoch ms
  progress: number;    // 0-100
  status: TaskStatus;
  assignee?: string;
  dependencies?: string[];   // task ids
  parentId?: string;
  milestoneId?: string;
  color?: string;
}

export interface GanttDependency {
  fromTaskId: string;
  toTaskId: string;
  type: DependencyType;
}

export interface GanttProject {
  id: string;
  name: string;
  tasks: GanttTask[];
  dependencies: GanttDependency[];
  startDate: number;
  endDate: number;
}

export interface CriticalPath {
  taskIds: string[];
  totalDuration: number;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  overdueTasks: number;
  blockedTasks: number;
  totalDurationMs: number;
}
