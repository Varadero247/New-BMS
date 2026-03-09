// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Domain Types ────────────────────────────────────────────────────────────

type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
type ProjectHealth = 'GREEN' | 'AMBER' | 'RED';
type ProjectType = 'CONSTRUCTION' | 'SOFTWARE' | 'INFRASTRUCTURE' | 'RESEARCH' | 'COMPLIANCE' | 'IMPROVEMENT' | 'OTHER';
type Methodology = 'WATERFALL' | 'AGILE' | 'HYBRID' | 'PRINCE2' | 'LEAN';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
type TaskType = 'TASK' | 'MILESTONE' | 'SUMMARY' | 'WORK_PACKAGE' | 'DELIVERABLE';
type MilestoneStatus = 'PENDING' | 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED' | 'CANCELLED';
type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type RiskCategory = 'TECHNICAL' | 'SCHEDULE' | 'COST' | 'SCOPE' | 'QUALITY' | 'RESOURCE' | 'EXTERNAL' | 'ORGANIZATIONAL';
type ResponseStrategy = 'AVOID' | 'MITIGATE' | 'TRANSFER' | 'ACCEPT' | 'ESCALATE' | 'EXPLOIT';
type RiskStatus = 'IDENTIFIED' | 'OPEN' | 'ANALYSED' | 'MITIGATING' | 'CLOSED' | 'OCCURRED';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// ─── Static Arrays ────────────────────────────────────────────────────────────

const PROJECT_STATUSES: ProjectStatus[] = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
const PROJECT_HEALTH_VALUES: ProjectHealth[] = ['GREEN', 'AMBER', 'RED'];
const PROJECT_TYPES: ProjectType[] = ['CONSTRUCTION', 'SOFTWARE', 'INFRASTRUCTURE', 'RESEARCH', 'COMPLIANCE', 'IMPROVEMENT', 'OTHER'];
const METHODOLOGIES: Methodology[] = ['WATERFALL', 'AGILE', 'HYBRID', 'PRINCE2', 'LEAN'];
const TASK_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const TASK_STATUSES: TaskStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];
const TASK_TYPES: TaskType[] = ['TASK', 'MILESTONE', 'SUMMARY', 'WORK_PACKAGE', 'DELIVERABLE'];
const MILESTONE_STATUSES: MilestoneStatus[] = ['PENDING', 'ON_TRACK', 'AT_RISK', 'DELAYED', 'COMPLETED', 'CANCELLED'];
const RISK_CATEGORIES: RiskCategory[] = ['TECHNICAL', 'SCHEDULE', 'COST', 'SCOPE', 'QUALITY', 'RESOURCE', 'EXTERNAL', 'ORGANIZATIONAL'];
const RESPONSE_STRATEGIES: ResponseStrategy[] = ['AVOID', 'MITIGATE', 'TRANSFER', 'ACCEPT', 'ESCALATE', 'EXPLOIT'];
const RISK_STATUSES: RiskStatus[] = ['IDENTIFIED', 'OPEN', 'ANALYSED', 'MITIGATING', 'CLOSED', 'OCCURRED'];
const RISK_LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// ─── Badge / Colour Maps ──────────────────────────────────────────────────────

const projectStatusBadge: Record<ProjectStatus, string> = {
  PLANNING:  'bg-blue-100 text-blue-700',
  ACTIVE:    'bg-green-100 text-green-700',
  ON_HOLD:   'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const projectHealthBadge: Record<ProjectHealth, string> = {
  GREEN: 'bg-green-100 text-green-700',
  AMBER: 'bg-amber-100 text-amber-700',
  RED:   'bg-red-100 text-red-700',
};

const taskStatusBadge: Record<TaskStatus, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED:   'bg-green-100 text-green-700',
  ON_HOLD:     'bg-amber-100 text-amber-700',
  CANCELLED:   'bg-red-100 text-red-700',
};

const milestoneStatusBadge: Record<MilestoneStatus, string> = {
  PENDING:   'bg-gray-100 text-gray-700',
  ON_TRACK:  'bg-blue-100 text-blue-700',
  AT_RISK:   'bg-amber-100 text-amber-700',
  DELAYED:   'bg-red-100 text-red-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const riskLevelBadge: Record<RiskLevel, string> = {
  LOW:      'bg-green-100 text-green-700',
  MEDIUM:   'bg-amber-100 text-amber-700',
  HIGH:     'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const riskStatusBadge: Record<RiskStatus, string> = {
  IDENTIFIED: 'bg-blue-100 text-blue-700',
  OPEN:       'bg-blue-100 text-blue-700',
  ANALYSED:   'bg-indigo-100 text-indigo-700',
  MITIGATING: 'bg-amber-100 text-amber-700',
  CLOSED:     'bg-green-100 text-green-700',
  OCCURRED:   'bg-red-100 text-red-700',
};

const approvalStatusBadge: Record<ApprovalStatus, string> = {
  PENDING:  'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

// ─── Mock Data Shapes ─────────────────────────────────────────────────────────

interface MockProject {
  id: string;
  projectCode: string;
  projectName: string;
  projectType: ProjectType;
  methodology: Methodology;
  status: ProjectStatus;
  projectHealth: ProjectHealth;
  priority: TaskPriority;
  completionPercentage: number;
  plannedBudget: number;
  actualCost: number;
  startDate: string;
  plannedEndDate: string;
}

interface MockTask {
  id: string;
  taskCode: string;
  taskName: string;
  taskType: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  completionPercentage: number;
  plannedDuration: number;
  isCriticalPath: boolean;
  plannedStartDate: string;
  plannedEndDate: string;
}

interface MockMilestone {
  id: string;
  milestoneName: string;
  plannedDate: string;
  status: MilestoneStatus;
  isCritical: boolean;
  requiresApproval: boolean;
  approvalStatus: ApprovalStatus | null;
}

interface MockRisk {
  id: string;
  riskCode: string;
  riskTitle: string;
  riskCategory: RiskCategory;
  probability: number;
  impact: number;
  responseStrategy: ResponseStrategy;
  status: RiskStatus;
}

const MOCK_PROJECTS: MockProject[] = [
  {
    id: 'proj-001',
    projectCode: 'PROJ-2026-001',
    projectName: 'Office Renovation',
    projectType: 'CONSTRUCTION',
    methodology: 'WATERFALL',
    status: 'ACTIVE',
    projectHealth: 'GREEN',
    priority: 'HIGH',
    completionPercentage: 45,
    plannedBudget: 500000,
    actualCost: 210000,
    startDate: '2026-01-01',
    plannedEndDate: '2026-12-31',
  },
  {
    id: 'proj-002',
    projectCode: 'PROJ-2026-002',
    projectName: 'ERP Migration',
    projectType: 'SOFTWARE',
    methodology: 'AGILE',
    status: 'PLANNING',
    projectHealth: 'AMBER',
    priority: 'CRITICAL',
    completionPercentage: 10,
    plannedBudget: 1200000,
    actualCost: 80000,
    startDate: '2026-03-01',
    plannedEndDate: '2026-09-30',
  },
  {
    id: 'proj-003',
    projectCode: 'PROJ-2026-003',
    projectName: 'ISO 9001 Certification',
    projectType: 'COMPLIANCE',
    methodology: 'PRINCE2',
    status: 'COMPLETED',
    projectHealth: 'GREEN',
    priority: 'MEDIUM',
    completionPercentage: 100,
    plannedBudget: 75000,
    actualCost: 72000,
    startDate: '2025-10-01',
    plannedEndDate: '2026-02-28',
  },
];

const MOCK_TASKS: MockTask[] = [
  {
    id: 'task-001',
    taskCode: 'WBS-1.1',
    taskName: 'Requirements Gathering',
    taskType: 'TASK',
    status: 'COMPLETED',
    priority: 'HIGH',
    completionPercentage: 100,
    plannedDuration: 10,
    isCriticalPath: true,
    plannedStartDate: '2026-01-01',
    plannedEndDate: '2026-01-10',
  },
  {
    id: 'task-002',
    taskCode: 'WBS-1.2',
    taskName: 'Design Phase',
    taskType: 'WORK_PACKAGE',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    completionPercentage: 60,
    plannedDuration: 20,
    isCriticalPath: true,
    plannedStartDate: '2026-01-11',
    plannedEndDate: '2026-01-30',
  },
  {
    id: 'task-003',
    taskCode: 'WBS-2.1',
    taskName: 'User Training',
    taskType: 'DELIVERABLE',
    status: 'NOT_STARTED',
    priority: 'MEDIUM',
    completionPercentage: 0,
    plannedDuration: 5,
    isCriticalPath: false,
    plannedStartDate: '2026-02-15',
    plannedEndDate: '2026-02-20',
  },
];

const MOCK_MILESTONES: MockMilestone[] = [
  {
    id: 'ms-001',
    milestoneName: 'Design Sign-off',
    plannedDate: '2026-02-28',
    status: 'ON_TRACK',
    isCritical: true,
    requiresApproval: true,
    approvalStatus: 'PENDING',
  },
  {
    id: 'ms-002',
    milestoneName: 'System Go-live',
    plannedDate: '2026-09-30',
    status: 'PENDING',
    isCritical: true,
    requiresApproval: true,
    approvalStatus: null,
  },
  {
    id: 'ms-003',
    milestoneName: 'User Acceptance Testing',
    plannedDate: '2026-08-31',
    status: 'PENDING',
    isCritical: false,
    requiresApproval: false,
    approvalStatus: null,
  },
];

const MOCK_RISKS: MockRisk[] = [
  {
    id: 'risk-001',
    riskCode: 'RSK-001',
    riskTitle: 'Key resource unavailable',
    riskCategory: 'RESOURCE',
    probability: 4,
    impact: 5,
    responseStrategy: 'MITIGATE',
    status: 'IDENTIFIED',
  },
  {
    id: 'risk-002',
    riskCode: 'RSK-002',
    riskTitle: 'Budget overrun',
    riskCategory: 'COST',
    probability: 3,
    impact: 4,
    responseStrategy: 'AVOID',
    status: 'MITIGATING',
  },
  {
    id: 'risk-003',
    riskCode: 'RSK-003',
    riskTitle: 'Integration complexity',
    riskCategory: 'TECHNICAL',
    probability: 2,
    impact: 3,
    responseStrategy: 'ACCEPT',
    status: 'OPEN',
  },
];

// ─── Pure Helper Functions (inlined from source) ───────────────────────────────

function getRiskScore(probability: number, impact: number): number {
  return probability * impact;
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 20) return 'CRITICAL';
  if (score >= 12) return 'HIGH';
  if (score >= 6) return 'MEDIUM';
  return 'LOW';
}

function isProjectActive(status: ProjectStatus): boolean {
  return status !== 'COMPLETED' && status !== 'CANCELLED';
}

function completionPercentage(completedTasks: number, totalTasks: number): number {
  if (totalTasks === 0) return 0;
  return (completedTasks / totalTasks) * 100;
}

function scheduleVariance(plannedValue: number, earnedValue: number): number {
  return earnedValue - plannedValue;
}

function costVariance(earnedValue: number, actualCost: number): number {
  return earnedValue - actualCost;
}

function schedulePerformanceIndex(earnedValue: number, plannedValue: number): number {
  if (plannedValue === 0) return 1;
  return earnedValue / plannedValue;
}

function costPerformanceIndex(earnedValue: number, actualCost: number): number {
  if (actualCost === 0) return 1;
  return earnedValue / actualCost;
}

function budgetUtilisation(actualCost: number, plannedBudget: number): number {
  if (plannedBudget === 0) return 0;
  return (actualCost / plannedBudget) * 100;
}

function daysVariance(plannedDate: Date, actualDate: Date): number {
  return Math.round((actualDate.getTime() - plannedDate.getTime()) / (1000 * 60 * 60 * 24));
}

function isMilestoneOverdue(plannedDate: Date, today: Date, status: MilestoneStatus): boolean {
  if (status === 'COMPLETED' || status === 'CANCELLED') return false;
  return today > plannedDate;
}

function criticalTaskCount(tasks: MockTask[]): number {
  return tasks.filter((t) => t.isCriticalPath).length;
}

function weightedProgress(tasks: MockTask[]): number {
  if (tasks.length === 0) return 0;
  const total = tasks.reduce((sum, t) => sum + t.completionPercentage, 0);
  return total / tasks.length;
}

// ─── Tests: Project Status Badge Map ─────────────────────────────────────────

describe('projectStatusBadge map', () => {
  for (const status of PROJECT_STATUSES) {
    it(`${status} has a badge class`, () => {
      expect(projectStatusBadge[status]).toBeDefined();
    });
    it(`${status} badge contains bg-`, () => {
      expect(projectStatusBadge[status]).toContain('bg-');
    });
    it(`${status} badge is a string`, () => {
      expect(typeof projectStatusBadge[status]).toBe('string');
    });
  }

  it('ACTIVE is green', () => expect(projectStatusBadge.ACTIVE).toContain('green'));
  it('CANCELLED is red', () => expect(projectStatusBadge.CANCELLED).toContain('red'));
  it('PLANNING is blue', () => expect(projectStatusBadge.PLANNING).toContain('blue'));
  it('ON_HOLD is amber', () => expect(projectStatusBadge.ON_HOLD).toContain('amber'));
  it('COMPLETED is purple', () => expect(projectStatusBadge.COMPLETED).toContain('purple'));
  it('map has exactly 5 entries', () => expect(Object.keys(projectStatusBadge).length).toBe(5));
});

// ─── Tests: Project Health Badge Map ─────────────────────────────────────────

describe('projectHealthBadge map', () => {
  for (const health of PROJECT_HEALTH_VALUES) {
    it(`${health} has a badge class`, () => expect(projectHealthBadge[health]).toBeDefined());
    it(`${health} badge contains bg-`, () => expect(projectHealthBadge[health]).toContain('bg-'));
  }

  it('GREEN is green', () => expect(projectHealthBadge.GREEN).toContain('green'));
  it('AMBER is amber', () => expect(projectHealthBadge.AMBER).toContain('amber'));
  it('RED is red', () => expect(projectHealthBadge.RED).toContain('red'));
  it('map has exactly 3 entries', () => expect(Object.keys(projectHealthBadge).length).toBe(3));
});

// ─── Tests: Task Status Badge Map ────────────────────────────────────────────

describe('taskStatusBadge map', () => {
  for (const status of TASK_STATUSES) {
    it(`${status} has a badge class`, () => expect(taskStatusBadge[status]).toBeDefined());
    it(`${status} badge contains bg-`, () => expect(taskStatusBadge[status]).toContain('bg-'));
  }

  it('IN_PROGRESS is blue', () => expect(taskStatusBadge.IN_PROGRESS).toContain('blue'));
  it('COMPLETED is green', () => expect(taskStatusBadge.COMPLETED).toContain('green'));
  it('ON_HOLD is amber', () => expect(taskStatusBadge.ON_HOLD).toContain('amber'));
  it('CANCELLED is red', () => expect(taskStatusBadge.CANCELLED).toContain('red'));
  it('NOT_STARTED is gray', () => expect(taskStatusBadge.NOT_STARTED).toContain('gray'));
  it('map has exactly 5 entries', () => expect(Object.keys(taskStatusBadge).length).toBe(5));
});

// ─── Tests: Milestone Status Badge Map ───────────────────────────────────────

describe('milestoneStatusBadge map', () => {
  for (const status of MILESTONE_STATUSES) {
    it(`${status} has a badge class`, () => expect(milestoneStatusBadge[status]).toBeDefined());
    it(`${status} badge contains bg-`, () => expect(milestoneStatusBadge[status]).toContain('bg-'));
  }

  it('COMPLETED is green', () => expect(milestoneStatusBadge.COMPLETED).toContain('green'));
  it('AT_RISK is amber', () => expect(milestoneStatusBadge.AT_RISK).toContain('amber'));
  it('DELAYED is red', () => expect(milestoneStatusBadge.DELAYED).toContain('red'));
  it('map has exactly 6 entries', () => expect(Object.keys(milestoneStatusBadge).length).toBe(6));
});

// ─── Tests: Risk Level Badge Map ──────────────────────────────────────────────

describe('riskLevelBadge map', () => {
  for (const level of RISK_LEVELS) {
    it(`${level} has a badge class`, () => expect(riskLevelBadge[level]).toBeDefined());
    it(`${level} badge contains bg-`, () => expect(riskLevelBadge[level]).toContain('bg-'));
  }

  it('CRITICAL is red', () => expect(riskLevelBadge.CRITICAL).toContain('red'));
  it('LOW is green', () => expect(riskLevelBadge.LOW).toContain('green'));
  it('MEDIUM is amber', () => expect(riskLevelBadge.MEDIUM).toContain('amber'));
  it('HIGH is orange', () => expect(riskLevelBadge.HIGH).toContain('orange'));
  it('map has exactly 4 entries', () => expect(Object.keys(riskLevelBadge).length).toBe(4));
});

// ─── Tests: Approval Status Badge Map ────────────────────────────────────────

describe('approvalStatusBadge map', () => {
  it('PENDING is amber', () => expect(approvalStatusBadge.PENDING).toContain('amber'));
  it('APPROVED is green', () => expect(approvalStatusBadge.APPROVED).toContain('green'));
  it('REJECTED is red', () => expect(approvalStatusBadge.REJECTED).toContain('red'));

  for (const status of ['PENDING', 'APPROVED', 'REJECTED'] as ApprovalStatus[]) {
    it(`${status} contains bg-`, () => expect(approvalStatusBadge[status]).toContain('bg-'));
  }
});

// ─── Tests: getRiskScore ──────────────────────────────────────────────────────

describe('getRiskScore', () => {
  it('score = probability × impact', () => expect(getRiskScore(4, 5)).toBe(20));
  it('zero probability = 0', () => expect(getRiskScore(0, 5)).toBe(0));
  it('zero impact = 0', () => expect(getRiskScore(5, 0)).toBe(0));
  it('commutative: score(3,4) = score(4,3)', () => {
    expect(getRiskScore(3, 4)).toBe(getRiskScore(4, 3));
  });

  const scoreCases: [number, number, number][] = [
    [1, 1, 1],
    [2, 3, 6],
    [3, 4, 12],
    [4, 5, 20],
    [5, 5, 25],
  ];
  for (const [p, i, expected] of scoreCases) {
    it(`getRiskScore(${p}, ${i}) = ${expected}`, () => {
      expect(getRiskScore(p, i)).toBe(expected);
    });
  }
});

// ─── Tests: getRiskLevel thresholds ──────────────────────────────────────────

describe('getRiskLevel', () => {
  it('score 1 = LOW', () => expect(getRiskLevel(1)).toBe('LOW'));
  it('score 5 = LOW', () => expect(getRiskLevel(5)).toBe('LOW'));
  it('score 6 = MEDIUM', () => expect(getRiskLevel(6)).toBe('MEDIUM'));
  it('score 11 = MEDIUM', () => expect(getRiskLevel(11)).toBe('MEDIUM'));
  it('score 12 = HIGH', () => expect(getRiskLevel(12)).toBe('HIGH'));
  it('score 19 = HIGH', () => expect(getRiskLevel(19)).toBe('HIGH'));
  it('score 20 = CRITICAL', () => expect(getRiskLevel(20)).toBe('CRITICAL'));
  it('score 25 = CRITICAL', () => expect(getRiskLevel(25)).toBe('CRITICAL'));
  it('returns a valid risk level', () => {
    for (let score = 1; score <= 25; score++) {
      expect(RISK_LEVELS).toContain(getRiskLevel(score));
    }
  });
});

// ─── Tests: Mock Project shapes ───────────────────────────────────────────────

describe('MOCK_PROJECTS shapes', () => {
  it('has 3 projects', () => expect(MOCK_PROJECTS.length).toBe(3));

  for (const project of MOCK_PROJECTS) {
    it(`${project.projectCode} has id`, () => expect(project.id).toBeTruthy());
    it(`${project.projectCode} status is valid`, () => {
      expect(PROJECT_STATUSES).toContain(project.status);
    });
    it(`${project.projectCode} health is valid`, () => {
      expect(PROJECT_HEALTH_VALUES).toContain(project.projectHealth);
    });
    it(`${project.projectCode} type is valid`, () => {
      expect(PROJECT_TYPES).toContain(project.projectType);
    });
    it(`${project.projectCode} methodology is valid`, () => {
      expect(METHODOLOGIES).toContain(project.methodology);
    });
    it(`${project.projectCode} completion 0-100`, () => {
      expect(project.completionPercentage).toBeGreaterThanOrEqual(0);
      expect(project.completionPercentage).toBeLessThanOrEqual(100);
    });
    it(`${project.projectCode} budget > 0`, () => {
      expect(project.plannedBudget).toBeGreaterThan(0);
    });
  }

  it('completed project has 100% completion', () => {
    const completed = MOCK_PROJECTS.find((p) => p.status === 'COMPLETED');
    expect(completed?.completionPercentage).toBe(100);
  });
});

// ─── Tests: Mock Task shapes ──────────────────────────────────────────────────

describe('MOCK_TASKS shapes', () => {
  it('has 3 tasks', () => expect(MOCK_TASKS.length).toBe(3));

  for (const task of MOCK_TASKS) {
    it(`${task.taskCode} has id`, () => expect(task.id).toBeTruthy());
    it(`${task.taskCode} status is valid`, () => expect(TASK_STATUSES).toContain(task.status));
    it(`${task.taskCode} type is valid`, () => expect(TASK_TYPES).toContain(task.taskType));
    it(`${task.taskCode} priority is valid`, () => expect(TASK_PRIORITIES).toContain(task.priority));
    it(`${task.taskCode} completion 0-100`, () => {
      expect(task.completionPercentage).toBeGreaterThanOrEqual(0);
      expect(task.completionPercentage).toBeLessThanOrEqual(100);
    });
    it(`${task.taskCode} duration > 0`, () => expect(task.plannedDuration).toBeGreaterThan(0));
    it(`${task.taskCode} isCriticalPath is boolean`, () => {
      expect(typeof task.isCriticalPath).toBe('boolean');
    });
  }

  it('completed task has 100% completion', () => {
    const completed = MOCK_TASKS.find((t) => t.status === 'COMPLETED');
    expect(completed?.completionPercentage).toBe(100);
  });
  it('not started task has 0% completion', () => {
    const notStarted = MOCK_TASKS.find((t) => t.status === 'NOT_STARTED');
    expect(notStarted?.completionPercentage).toBe(0);
  });
});

// ─── Tests: Mock Milestone shapes ────────────────────────────────────────────

describe('MOCK_MILESTONES shapes', () => {
  it('has 3 milestones', () => expect(MOCK_MILESTONES.length).toBe(3));

  for (const ms of MOCK_MILESTONES) {
    it(`${ms.milestoneName} has id`, () => expect(ms.id).toBeTruthy());
    it(`${ms.milestoneName} status is valid`, () => {
      expect(MILESTONE_STATUSES).toContain(ms.status);
    });
    it(`${ms.milestoneName} isCritical is boolean`, () => {
      expect(typeof ms.isCritical).toBe('boolean');
    });
    it(`${ms.milestoneName} requiresApproval is boolean`, () => {
      expect(typeof ms.requiresApproval).toBe('boolean');
    });
    it(`${ms.milestoneName} planned date is truthy`, () => {
      expect(ms.plannedDate).toBeTruthy();
    });
  }
});

// ─── Tests: Mock Risk shapes ──────────────────────────────────────────────────

describe('MOCK_RISKS shapes', () => {
  it('has 3 risks', () => expect(MOCK_RISKS.length).toBe(3));

  for (const risk of MOCK_RISKS) {
    it(`${risk.riskCode} has id`, () => expect(risk.id).toBeTruthy());
    it(`${risk.riskCode} category is valid`, () => {
      expect(RISK_CATEGORIES).toContain(risk.riskCategory);
    });
    it(`${risk.riskCode} response strategy is valid`, () => {
      expect(RESPONSE_STRATEGIES).toContain(risk.responseStrategy);
    });
    it(`${risk.riskCode} status is valid`, () => {
      expect(RISK_STATUSES).toContain(risk.status);
    });
    it(`${risk.riskCode} probability between 1 and 5`, () => {
      expect(risk.probability).toBeGreaterThanOrEqual(1);
      expect(risk.probability).toBeLessThanOrEqual(5);
    });
    it(`${risk.riskCode} impact between 1 and 5`, () => {
      expect(risk.impact).toBeGreaterThanOrEqual(1);
      expect(risk.impact).toBeLessThanOrEqual(5);
    });
  }
});

// ─── Tests: isProjectActive ───────────────────────────────────────────────────

describe('isProjectActive', () => {
  it('PLANNING is active', () => expect(isProjectActive('PLANNING')).toBe(true));
  it('ACTIVE is active', () => expect(isProjectActive('ACTIVE')).toBe(true));
  it('ON_HOLD is active', () => expect(isProjectActive('ON_HOLD')).toBe(true));
  it('COMPLETED is NOT active', () => expect(isProjectActive('COMPLETED')).toBe(false));
  it('CANCELLED is NOT active', () => expect(isProjectActive('CANCELLED')).toBe(false));

  for (const status of PROJECT_STATUSES) {
    it(`isProjectActive(${status}) is boolean`, () => {
      expect(typeof isProjectActive(status)).toBe('boolean');
    });
  }
});

// ─── Tests: completionPercentage ─────────────────────────────────────────────

describe('completionPercentage', () => {
  it('0 of 0 = 0', () => expect(completionPercentage(0, 0)).toBe(0));
  it('all complete = 100', () => expect(completionPercentage(10, 10)).toBe(100));
  it('half complete = 50', () => expect(completionPercentage(5, 10)).toBe(50));
  it('none complete = 0', () => expect(completionPercentage(0, 10)).toBe(0));
  it('result >= 0', () => expect(completionPercentage(3, 7)).toBeGreaterThanOrEqual(0));
  it('result <= 100', () => expect(completionPercentage(7, 7)).toBeLessThanOrEqual(100));

  for (let n = 0; n <= 10; n++) {
    it(`completionPercentage(${n}, 10) = ${n * 10}`, () => {
      expect(completionPercentage(n, 10)).toBeCloseTo(n * 10, 5);
    });
  }
});

// ─── Tests: scheduleVariance ──────────────────────────────────────────────────

describe('scheduleVariance', () => {
  it('ahead of schedule is positive', () => expect(scheduleVariance(100, 110)).toBe(10));
  it('behind schedule is negative', () => expect(scheduleVariance(100, 90)).toBe(-10));
  it('on schedule = 0', () => expect(scheduleVariance(100, 100)).toBe(0));

  for (let ev = 80; ev <= 120; ev++) {
    it(`SV(100, ${ev}) = ${ev - 100}`, () => {
      expect(scheduleVariance(100, ev)).toBe(ev - 100);
    });
  }
});

// ─── Tests: costVariance ──────────────────────────────────────────────────────

describe('costVariance', () => {
  it('under budget is positive', () => expect(costVariance(100, 80)).toBe(20));
  it('over budget is negative', () => expect(costVariance(100, 120)).toBe(-20));
  it('on budget = 0', () => expect(costVariance(100, 100)).toBe(0));

  const cvCases: [number, number, number][] = [
    [500, 400, 100],
    [500, 600, -100],
    [1000, 950, 50],
  ];
  for (const [ev, ac, expected] of cvCases) {
    it(`costVariance(${ev}, ${ac}) = ${expected}`, () => {
      expect(costVariance(ev, ac)).toBe(expected);
    });
  }
});

// ─── Tests: SPI / CPI ────────────────────────────────────────────────────────

describe('schedulePerformanceIndex', () => {
  it('SPI 1.0 = on schedule', () => expect(schedulePerformanceIndex(100, 100)).toBe(1));
  it('SPI > 1 = ahead of schedule', () => expect(schedulePerformanceIndex(110, 100)).toBeGreaterThan(1));
  it('SPI < 1 = behind schedule', () => expect(schedulePerformanceIndex(90, 100)).toBeLessThan(1));
  it('zero planned value returns 1', () => expect(schedulePerformanceIndex(50, 0)).toBe(1));
  it('SPI is always positive', () => {
    for (let ev = 10; ev <= 200; ev += 10) {
      expect(schedulePerformanceIndex(ev, 100)).toBeGreaterThan(0);
    }
  });
});

describe('costPerformanceIndex', () => {
  it('CPI 1.0 = on budget', () => expect(costPerformanceIndex(100, 100)).toBe(1));
  it('CPI > 1 = under budget', () => expect(costPerformanceIndex(100, 80)).toBeGreaterThan(1));
  it('CPI < 1 = over budget', () => expect(costPerformanceIndex(80, 100)).toBeLessThan(1));
  it('zero actual cost returns 1', () => expect(costPerformanceIndex(50, 0)).toBe(1));
});

// ─── Tests: budgetUtilisation ─────────────────────────────────────────────────

describe('budgetUtilisation', () => {
  it('zero budget returns 0', () => expect(budgetUtilisation(5000, 0)).toBe(0));
  it('50% utilisation', () => expect(budgetUtilisation(25000, 50000)).toBeCloseTo(50, 5));
  it('100% utilisation', () => expect(budgetUtilisation(50000, 50000)).toBeCloseTo(100, 5));
  it('over budget > 100%', () => expect(budgetUtilisation(60000, 50000)).toBeGreaterThan(100));
  it('utilisation for mock project-001', () => {
    const proj = MOCK_PROJECTS[0];
    const util = budgetUtilisation(proj.actualCost, proj.plannedBudget);
    expect(util).toBeGreaterThan(0);
    expect(util).toBeLessThan(100);
  });
});

// ─── Tests: daysVariance ─────────────────────────────────────────────────────

describe('daysVariance', () => {
  it('same date = 0 days', () => {
    const d = new Date('2026-06-01');
    expect(daysVariance(d, d)).toBe(0);
  });
  it('7 days late = +7', () => {
    const planned = new Date('2026-06-01');
    const actual = new Date('2026-06-08');
    expect(daysVariance(planned, actual)).toBe(7);
  });
  it('early delivery = negative', () => {
    const planned = new Date('2026-06-08');
    const actual = new Date('2026-06-01');
    expect(daysVariance(planned, actual)).toBe(-7);
  });
});

// ─── Tests: isMilestoneOverdue ────────────────────────────────────────────────

describe('isMilestoneOverdue', () => {
  const pastDate = new Date('2026-01-01');
  const today = new Date('2026-03-09');
  const futureDate = new Date('2026-12-31');

  it('COMPLETED milestone is never overdue', () => {
    expect(isMilestoneOverdue(pastDate, today, 'COMPLETED')).toBe(false);
  });
  it('CANCELLED milestone is never overdue', () => {
    expect(isMilestoneOverdue(pastDate, today, 'CANCELLED')).toBe(false);
  });
  it('past date PENDING is overdue', () => {
    expect(isMilestoneOverdue(pastDate, today, 'PENDING')).toBe(true);
  });
  it('future date PENDING is not overdue', () => {
    expect(isMilestoneOverdue(futureDate, today, 'PENDING')).toBe(false);
  });
});

// ─── Tests: criticalTaskCount ────────────────────────────────────────────────

describe('criticalTaskCount', () => {
  it('counts critical path tasks', () => expect(criticalTaskCount(MOCK_TASKS)).toBe(2));
  it('empty list = 0', () => expect(criticalTaskCount([])).toBe(0));
  it('all critical tasks', () => {
    const allCritical = MOCK_TASKS.map((t) => ({ ...t, isCriticalPath: true }));
    expect(criticalTaskCount(allCritical)).toBe(MOCK_TASKS.length);
  });
  it('no critical tasks', () => {
    const noCritical = MOCK_TASKS.map((t) => ({ ...t, isCriticalPath: false }));
    expect(criticalTaskCount(noCritical)).toBe(0);
  });
});

// ─── Tests: weightedProgress ─────────────────────────────────────────────────

describe('weightedProgress', () => {
  it('empty list = 0', () => expect(weightedProgress([])).toBe(0));
  it('average of [100, 60, 0] = 53.33...', () => {
    expect(weightedProgress(MOCK_TASKS)).toBeCloseTo((100 + 60 + 0) / 3, 2);
  });
  it('all complete = 100', () => {
    const allDone = MOCK_TASKS.map((t) => ({ ...t, completionPercentage: 100 }));
    expect(weightedProgress(allDone)).toBeCloseTo(100, 5);
  });
  it('none started = 0', () => {
    const none = MOCK_TASKS.map((t) => ({ ...t, completionPercentage: 0 }));
    expect(weightedProgress(none)).toBe(0);
  });
  it('result >= 0', () => expect(weightedProgress(MOCK_TASKS)).toBeGreaterThanOrEqual(0));
  it('result <= 100', () => expect(weightedProgress(MOCK_TASKS)).toBeLessThanOrEqual(100));
});

// ─── Tests: Domain Array Completeness ────────────────────────────────────────

describe('domain array completeness', () => {
  it('PROJECT_STATUSES has 5 values', () => expect(PROJECT_STATUSES.length).toBe(5));
  it('PROJECT_HEALTH_VALUES has 3 values', () => expect(PROJECT_HEALTH_VALUES.length).toBe(3));
  it('PROJECT_TYPES has 7 values', () => expect(PROJECT_TYPES.length).toBe(7));
  it('METHODOLOGIES has 5 values', () => expect(METHODOLOGIES.length).toBe(5));
  it('TASK_PRIORITIES has 4 values', () => expect(TASK_PRIORITIES.length).toBe(4));
  it('TASK_STATUSES has 5 values', () => expect(TASK_STATUSES.length).toBe(5));
  it('TASK_TYPES has 5 values', () => expect(TASK_TYPES.length).toBe(5));
  it('MILESTONE_STATUSES has 6 values', () => expect(MILESTONE_STATUSES.length).toBe(6));
  it('RISK_CATEGORIES has 8 values', () => expect(RISK_CATEGORIES.length).toBe(8));
  it('RESPONSE_STRATEGIES has 6 values', () => expect(RESPONSE_STRATEGIES.length).toBe(6));
  it('RISK_STATUSES has 6 values', () => expect(RISK_STATUSES.length).toBe(6));
  it('RISK_LEVELS has 4 values', () => expect(RISK_LEVELS.length).toBe(4));
  it('PROJECT_STATUSES contains ACTIVE', () => expect(PROJECT_STATUSES).toContain('ACTIVE'));
  it('METHODOLOGIES contains AGILE', () => expect(METHODOLOGIES).toContain('AGILE'));
  it('METHODOLOGIES contains PRINCE2', () => expect(METHODOLOGIES).toContain('PRINCE2'));
  it('TASK_TYPES contains WORK_PACKAGE', () => expect(TASK_TYPES).toContain('WORK_PACKAGE'));
  it('RISK_CATEGORIES contains TECHNICAL', () => expect(RISK_CATEGORIES).toContain('TECHNICAL'));
  it('RESPONSE_STRATEGIES contains MITIGATE', () => expect(RESPONSE_STRATEGIES).toContain('MITIGATE'));
  it('RESPONSE_STRATEGIES contains EXPLOIT', () => expect(RESPONSE_STRATEGIES).toContain('EXPLOIT'));
  it('RISK_STATUSES contains OCCURRED', () => expect(RISK_STATUSES).toContain('OCCURRED'));
});

// ─── Algorithm puzzle phases (ph217pmd–ph220pmd) ────────────────────────────────
function moveZeroes217pmd(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217pmd_mz',()=>{
  it('a',()=>{expect(moveZeroes217pmd([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217pmd([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217pmd([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217pmd([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217pmd([4,2,0,0,3])).toBe(4);});
});
function missingNumber218pmd(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218pmd_mn',()=>{
  it('a',()=>{expect(missingNumber218pmd([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218pmd([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218pmd([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218pmd([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218pmd([1])).toBe(0);});
});
function countBits219pmd(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219pmd_cb',()=>{
  it('a',()=>{expect(countBits219pmd(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219pmd(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219pmd(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219pmd(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219pmd(4)[4]).toBe(1);});
});
function climbStairs220pmd(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220pmd_cs',()=>{
  it('a',()=>{expect(climbStairs220pmd(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220pmd(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220pmd(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220pmd(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220pmd(1)).toBe(1);});
});
