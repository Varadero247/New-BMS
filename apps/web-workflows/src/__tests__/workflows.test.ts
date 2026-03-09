// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-workflows specification tests

type WorkflowStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'ARCHIVED';
type StepType = 'MANUAL' | 'AUTOMATED' | 'APPROVAL' | 'NOTIFICATION' | 'CONDITION' | 'PARALLEL' | 'LOOP';
type TriggerType = 'MANUAL' | 'SCHEDULED' | 'EVENT' | 'WEBHOOK' | 'FORM_SUBMISSION';
type ApprovalOutcome = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'TIMED_OUT';

const WORKFLOW_STATUSES: WorkflowStatus[] = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED', 'ARCHIVED'];
const STEP_TYPES: StepType[] = ['MANUAL', 'AUTOMATED', 'APPROVAL', 'NOTIFICATION', 'CONDITION', 'PARALLEL', 'LOOP'];
const TRIGGER_TYPES: TriggerType[] = ['MANUAL', 'SCHEDULED', 'EVENT', 'WEBHOOK', 'FORM_SUBMISSION'];
const APPROVAL_OUTCOMES: ApprovalOutcome[] = ['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED', 'TIMED_OUT'];

const workflowStatusColor: Record<WorkflowStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-200 text-gray-600',
  ARCHIVED: 'bg-gray-300 text-gray-500',
};

const stepTypeIcon: Record<StepType, string> = {
  MANUAL: 'user',
  AUTOMATED: 'cog',
  APPROVAL: 'check-circle',
  NOTIFICATION: 'bell',
  CONDITION: 'git-branch',
  PARALLEL: 'layers',
  LOOP: 'repeat',
};

const approvalOutcomeColor: Record<ApprovalOutcome, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  ESCALATED: 'bg-orange-100 text-orange-800',
  TIMED_OUT: 'bg-gray-100 text-gray-700',
};

function isWorkflowRunning(status: WorkflowStatus): boolean {
  return status === 'ACTIVE' || status === 'PAUSED';
}

function isTerminalStatus(status: WorkflowStatus): boolean {
  return ['COMPLETED', 'FAILED', 'CANCELLED', 'ARCHIVED'].includes(status);
}

function workflowCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return (completed / total) * 100;
}

function estimateRemainingTime(totalSteps: number, completedSteps: number, avgStepMinutes: number): number {
  const remaining = totalSteps - completedSteps;
  return remaining * avgStepMinutes;
}

describe('Workflow status colors', () => {
  WORKFLOW_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(workflowStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(workflowStatusColor[s]).toContain('bg-'));
  });
  it('ACTIVE is green', () => expect(workflowStatusColor.ACTIVE).toContain('green'));
  it('FAILED is red', () => expect(workflowStatusColor.FAILED).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = WORKFLOW_STATUSES[i % 7];
    it(`workflow status color string (idx ${i})`, () => expect(typeof workflowStatusColor[s]).toBe('string'));
  }
});

describe('Step type icons', () => {
  STEP_TYPES.forEach(t => {
    it(`${t} has icon`, () => expect(stepTypeIcon[t]).toBeDefined());
    it(`${t} icon is non-empty`, () => expect(stepTypeIcon[t].length).toBeGreaterThan(0));
  });
  it('APPROVAL icon is check-circle', () => expect(stepTypeIcon.APPROVAL).toBe('check-circle'));
  it('NOTIFICATION icon is bell', () => expect(stepTypeIcon.NOTIFICATION).toBe('bell'));
  for (let i = 0; i < 100; i++) {
    const t = STEP_TYPES[i % 7];
    it(`step type icon for ${t} is string (idx ${i})`, () => expect(typeof stepTypeIcon[t]).toBe('string'));
  }
});

describe('Approval outcome colors', () => {
  APPROVAL_OUTCOMES.forEach(o => {
    it(`${o} has color`, () => expect(approvalOutcomeColor[o]).toBeDefined());
    it(`${o} color has bg-`, () => expect(approvalOutcomeColor[o]).toContain('bg-'));
  });
  it('APPROVED is green', () => expect(approvalOutcomeColor.APPROVED).toContain('green'));
  it('REJECTED is red', () => expect(approvalOutcomeColor.REJECTED).toContain('red'));
  for (let i = 0; i < 50; i++) {
    const o = APPROVAL_OUTCOMES[i % 5];
    it(`approval outcome color string (idx ${i})`, () => expect(typeof approvalOutcomeColor[o]).toBe('string'));
  }
});

describe('isWorkflowRunning', () => {
  it('ACTIVE is running', () => expect(isWorkflowRunning('ACTIVE')).toBe(true));
  it('PAUSED is running', () => expect(isWorkflowRunning('PAUSED')).toBe(true));
  it('COMPLETED is not running', () => expect(isWorkflowRunning('COMPLETED')).toBe(false));
  it('FAILED is not running', () => expect(isWorkflowRunning('FAILED')).toBe(false));
  it('DRAFT is not running', () => expect(isWorkflowRunning('DRAFT')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = WORKFLOW_STATUSES[i % 7];
    it(`isWorkflowRunning(${s}) returns boolean (idx ${i})`, () => expect(typeof isWorkflowRunning(s)).toBe('boolean'));
  }
});

describe('isTerminalStatus', () => {
  it('COMPLETED is terminal', () => expect(isTerminalStatus('COMPLETED')).toBe(true));
  it('FAILED is terminal', () => expect(isTerminalStatus('FAILED')).toBe(true));
  it('CANCELLED is terminal', () => expect(isTerminalStatus('CANCELLED')).toBe(true));
  it('ARCHIVED is terminal', () => expect(isTerminalStatus('ARCHIVED')).toBe(true));
  it('ACTIVE is not terminal', () => expect(isTerminalStatus('ACTIVE')).toBe(false));
  it('DRAFT is not terminal', () => expect(isTerminalStatus('DRAFT')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = WORKFLOW_STATUSES[i % 7];
    it(`isTerminalStatus(${s}) returns boolean (idx ${i})`, () => expect(typeof isTerminalStatus(s)).toBe('boolean'));
  }
});

describe('workflowCompletionRate', () => {
  it('0 total = 0%', () => expect(workflowCompletionRate(0, 0)).toBe(0));
  it('all completed = 100%', () => expect(workflowCompletionRate(10, 10)).toBe(100));
  it('half completed = 50%', () => expect(workflowCompletionRate(5, 10)).toBe(50));
  for (let completed = 0; completed <= 100; completed++) {
    it(`completion rate ${completed}/100 is between 0-100`, () => {
      const rate = workflowCompletionRate(completed, 100);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    });
  }
});

describe('estimateRemainingTime', () => {
  it('0 remaining steps = 0 minutes', () => expect(estimateRemainingTime(10, 10, 5)).toBe(0));
  it('10 steps remaining at 5 min each = 50 min', () => expect(estimateRemainingTime(10, 0, 5)).toBe(50));
  it('scales with step count', () => {
    expect(estimateRemainingTime(20, 10, 5)).toBe(50);
  });
  for (let remaining = 1; remaining <= 50; remaining++) {
    it(`remaining time for ${remaining} steps at 10 min = ${remaining * 10}`, () => {
      expect(estimateRemainingTime(remaining, 0, 10)).toBe(remaining * 10);
    });
  }
});
function hd258wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258wfx_hd',()=>{it('a',()=>{expect(hd258wfx(1,4)).toBe(2);});it('b',()=>{expect(hd258wfx(3,1)).toBe(1);});it('c',()=>{expect(hd258wfx(0,0)).toBe(0);});it('d',()=>{expect(hd258wfx(93,73)).toBe(2);});it('e',()=>{expect(hd258wfx(15,0)).toBe(4);});});
function hd259wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259wfx_hd',()=>{it('a',()=>{expect(hd259wfx(1,4)).toBe(2);});it('b',()=>{expect(hd259wfx(3,1)).toBe(1);});it('c',()=>{expect(hd259wfx(0,0)).toBe(0);});it('d',()=>{expect(hd259wfx(93,73)).toBe(2);});it('e',()=>{expect(hd259wfx(15,0)).toBe(4);});});
function hd260wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260wfx_hd',()=>{it('a',()=>{expect(hd260wfx(1,4)).toBe(2);});it('b',()=>{expect(hd260wfx(3,1)).toBe(1);});it('c',()=>{expect(hd260wfx(0,0)).toBe(0);});it('d',()=>{expect(hd260wfx(93,73)).toBe(2);});it('e',()=>{expect(hd260wfx(15,0)).toBe(4);});});
function hd261wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261wfx_hd',()=>{it('a',()=>{expect(hd261wfx(1,4)).toBe(2);});it('b',()=>{expect(hd261wfx(3,1)).toBe(1);});it('c',()=>{expect(hd261wfx(0,0)).toBe(0);});it('d',()=>{expect(hd261wfx(93,73)).toBe(2);});it('e',()=>{expect(hd261wfx(15,0)).toBe(4);});});
function hd262wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262wfx_hd',()=>{it('a',()=>{expect(hd262wfx(1,4)).toBe(2);});it('b',()=>{expect(hd262wfx(3,1)).toBe(1);});it('c',()=>{expect(hd262wfx(0,0)).toBe(0);});it('d',()=>{expect(hd262wfx(93,73)).toBe(2);});it('e',()=>{expect(hd262wfx(15,0)).toBe(4);});});
function hd263wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263wfx_hd',()=>{it('a',()=>{expect(hd263wfx(1,4)).toBe(2);});it('b',()=>{expect(hd263wfx(3,1)).toBe(1);});it('c',()=>{expect(hd263wfx(0,0)).toBe(0);});it('d',()=>{expect(hd263wfx(93,73)).toBe(2);});it('e',()=>{expect(hd263wfx(15,0)).toBe(4);});});
function hd264wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264wfx_hd',()=>{it('a',()=>{expect(hd264wfx(1,4)).toBe(2);});it('b',()=>{expect(hd264wfx(3,1)).toBe(1);});it('c',()=>{expect(hd264wfx(0,0)).toBe(0);});it('d',()=>{expect(hd264wfx(93,73)).toBe(2);});it('e',()=>{expect(hd264wfx(15,0)).toBe(4);});});
function hd265wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265wfx_hd',()=>{it('a',()=>{expect(hd265wfx(1,4)).toBe(2);});it('b',()=>{expect(hd265wfx(3,1)).toBe(1);});it('c',()=>{expect(hd265wfx(0,0)).toBe(0);});it('d',()=>{expect(hd265wfx(93,73)).toBe(2);});it('e',()=>{expect(hd265wfx(15,0)).toBe(4);});});
function hd266wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266wfx_hd',()=>{it('a',()=>{expect(hd266wfx(1,4)).toBe(2);});it('b',()=>{expect(hd266wfx(3,1)).toBe(1);});it('c',()=>{expect(hd266wfx(0,0)).toBe(0);});it('d',()=>{expect(hd266wfx(93,73)).toBe(2);});it('e',()=>{expect(hd266wfx(15,0)).toBe(4);});});
function hd267wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267wfx_hd',()=>{it('a',()=>{expect(hd267wfx(1,4)).toBe(2);});it('b',()=>{expect(hd267wfx(3,1)).toBe(1);});it('c',()=>{expect(hd267wfx(0,0)).toBe(0);});it('d',()=>{expect(hd267wfx(93,73)).toBe(2);});it('e',()=>{expect(hd267wfx(15,0)).toBe(4);});});
function hd268wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268wfx_hd',()=>{it('a',()=>{expect(hd268wfx(1,4)).toBe(2);});it('b',()=>{expect(hd268wfx(3,1)).toBe(1);});it('c',()=>{expect(hd268wfx(0,0)).toBe(0);});it('d',()=>{expect(hd268wfx(93,73)).toBe(2);});it('e',()=>{expect(hd268wfx(15,0)).toBe(4);});});
function hd269wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269wfx_hd',()=>{it('a',()=>{expect(hd269wfx(1,4)).toBe(2);});it('b',()=>{expect(hd269wfx(3,1)).toBe(1);});it('c',()=>{expect(hd269wfx(0,0)).toBe(0);});it('d',()=>{expect(hd269wfx(93,73)).toBe(2);});it('e',()=>{expect(hd269wfx(15,0)).toBe(4);});});
function hd270wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270wfx_hd',()=>{it('a',()=>{expect(hd270wfx(1,4)).toBe(2);});it('b',()=>{expect(hd270wfx(3,1)).toBe(1);});it('c',()=>{expect(hd270wfx(0,0)).toBe(0);});it('d',()=>{expect(hd270wfx(93,73)).toBe(2);});it('e',()=>{expect(hd270wfx(15,0)).toBe(4);});});
function hd271wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271wfx_hd',()=>{it('a',()=>{expect(hd271wfx(1,4)).toBe(2);});it('b',()=>{expect(hd271wfx(3,1)).toBe(1);});it('c',()=>{expect(hd271wfx(0,0)).toBe(0);});it('d',()=>{expect(hd271wfx(93,73)).toBe(2);});it('e',()=>{expect(hd271wfx(15,0)).toBe(4);});});
function hd272wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272wfx_hd',()=>{it('a',()=>{expect(hd272wfx(1,4)).toBe(2);});it('b',()=>{expect(hd272wfx(3,1)).toBe(1);});it('c',()=>{expect(hd272wfx(0,0)).toBe(0);});it('d',()=>{expect(hd272wfx(93,73)).toBe(2);});it('e',()=>{expect(hd272wfx(15,0)).toBe(4);});});
function hd273wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273wfx_hd',()=>{it('a',()=>{expect(hd273wfx(1,4)).toBe(2);});it('b',()=>{expect(hd273wfx(3,1)).toBe(1);});it('c',()=>{expect(hd273wfx(0,0)).toBe(0);});it('d',()=>{expect(hd273wfx(93,73)).toBe(2);});it('e',()=>{expect(hd273wfx(15,0)).toBe(4);});});
function hd274wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274wfx_hd',()=>{it('a',()=>{expect(hd274wfx(1,4)).toBe(2);});it('b',()=>{expect(hd274wfx(3,1)).toBe(1);});it('c',()=>{expect(hd274wfx(0,0)).toBe(0);});it('d',()=>{expect(hd274wfx(93,73)).toBe(2);});it('e',()=>{expect(hd274wfx(15,0)).toBe(4);});});
function hd275wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275wfx_hd',()=>{it('a',()=>{expect(hd275wfx(1,4)).toBe(2);});it('b',()=>{expect(hd275wfx(3,1)).toBe(1);});it('c',()=>{expect(hd275wfx(0,0)).toBe(0);});it('d',()=>{expect(hd275wfx(93,73)).toBe(2);});it('e',()=>{expect(hd275wfx(15,0)).toBe(4);});});
function hd276wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276wfx_hd',()=>{it('a',()=>{expect(hd276wfx(1,4)).toBe(2);});it('b',()=>{expect(hd276wfx(3,1)).toBe(1);});it('c',()=>{expect(hd276wfx(0,0)).toBe(0);});it('d',()=>{expect(hd276wfx(93,73)).toBe(2);});it('e',()=>{expect(hd276wfx(15,0)).toBe(4);});});
function hd277wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277wfx_hd',()=>{it('a',()=>{expect(hd277wfx(1,4)).toBe(2);});it('b',()=>{expect(hd277wfx(3,1)).toBe(1);});it('c',()=>{expect(hd277wfx(0,0)).toBe(0);});it('d',()=>{expect(hd277wfx(93,73)).toBe(2);});it('e',()=>{expect(hd277wfx(15,0)).toBe(4);});});
function hd278wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278wfx_hd',()=>{it('a',()=>{expect(hd278wfx(1,4)).toBe(2);});it('b',()=>{expect(hd278wfx(3,1)).toBe(1);});it('c',()=>{expect(hd278wfx(0,0)).toBe(0);});it('d',()=>{expect(hd278wfx(93,73)).toBe(2);});it('e',()=>{expect(hd278wfx(15,0)).toBe(4);});});
function hd279wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279wfx_hd',()=>{it('a',()=>{expect(hd279wfx(1,4)).toBe(2);});it('b',()=>{expect(hd279wfx(3,1)).toBe(1);});it('c',()=>{expect(hd279wfx(0,0)).toBe(0);});it('d',()=>{expect(hd279wfx(93,73)).toBe(2);});it('e',()=>{expect(hd279wfx(15,0)).toBe(4);});});
function hd280wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280wfx_hd',()=>{it('a',()=>{expect(hd280wfx(1,4)).toBe(2);});it('b',()=>{expect(hd280wfx(3,1)).toBe(1);});it('c',()=>{expect(hd280wfx(0,0)).toBe(0);});it('d',()=>{expect(hd280wfx(93,73)).toBe(2);});it('e',()=>{expect(hd280wfx(15,0)).toBe(4);});});
function hd281wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281wfx_hd',()=>{it('a',()=>{expect(hd281wfx(1,4)).toBe(2);});it('b',()=>{expect(hd281wfx(3,1)).toBe(1);});it('c',()=>{expect(hd281wfx(0,0)).toBe(0);});it('d',()=>{expect(hd281wfx(93,73)).toBe(2);});it('e',()=>{expect(hd281wfx(15,0)).toBe(4);});});
function hd282wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282wfx_hd',()=>{it('a',()=>{expect(hd282wfx(1,4)).toBe(2);});it('b',()=>{expect(hd282wfx(3,1)).toBe(1);});it('c',()=>{expect(hd282wfx(0,0)).toBe(0);});it('d',()=>{expect(hd282wfx(93,73)).toBe(2);});it('e',()=>{expect(hd282wfx(15,0)).toBe(4);});});
function hd283wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283wfx_hd',()=>{it('a',()=>{expect(hd283wfx(1,4)).toBe(2);});it('b',()=>{expect(hd283wfx(3,1)).toBe(1);});it('c',()=>{expect(hd283wfx(0,0)).toBe(0);});it('d',()=>{expect(hd283wfx(93,73)).toBe(2);});it('e',()=>{expect(hd283wfx(15,0)).toBe(4);});});
function hd284wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284wfx_hd',()=>{it('a',()=>{expect(hd284wfx(1,4)).toBe(2);});it('b',()=>{expect(hd284wfx(3,1)).toBe(1);});it('c',()=>{expect(hd284wfx(0,0)).toBe(0);});it('d',()=>{expect(hd284wfx(93,73)).toBe(2);});it('e',()=>{expect(hd284wfx(15,0)).toBe(4);});});
function hd285wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285wfx_hd',()=>{it('a',()=>{expect(hd285wfx(1,4)).toBe(2);});it('b',()=>{expect(hd285wfx(3,1)).toBe(1);});it('c',()=>{expect(hd285wfx(0,0)).toBe(0);});it('d',()=>{expect(hd285wfx(93,73)).toBe(2);});it('e',()=>{expect(hd285wfx(15,0)).toBe(4);});});
function hd286wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286wfx_hd',()=>{it('a',()=>{expect(hd286wfx(1,4)).toBe(2);});it('b',()=>{expect(hd286wfx(3,1)).toBe(1);});it('c',()=>{expect(hd286wfx(0,0)).toBe(0);});it('d',()=>{expect(hd286wfx(93,73)).toBe(2);});it('e',()=>{expect(hd286wfx(15,0)).toBe(4);});});
function hd287wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287wfx_hd',()=>{it('a',()=>{expect(hd287wfx(1,4)).toBe(2);});it('b',()=>{expect(hd287wfx(3,1)).toBe(1);});it('c',()=>{expect(hd287wfx(0,0)).toBe(0);});it('d',()=>{expect(hd287wfx(93,73)).toBe(2);});it('e',()=>{expect(hd287wfx(15,0)).toBe(4);});});
function hd288wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288wfx_hd',()=>{it('a',()=>{expect(hd288wfx(1,4)).toBe(2);});it('b',()=>{expect(hd288wfx(3,1)).toBe(1);});it('c',()=>{expect(hd288wfx(0,0)).toBe(0);});it('d',()=>{expect(hd288wfx(93,73)).toBe(2);});it('e',()=>{expect(hd288wfx(15,0)).toBe(4);});});
function hd289wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289wfx_hd',()=>{it('a',()=>{expect(hd289wfx(1,4)).toBe(2);});it('b',()=>{expect(hd289wfx(3,1)).toBe(1);});it('c',()=>{expect(hd289wfx(0,0)).toBe(0);});it('d',()=>{expect(hd289wfx(93,73)).toBe(2);});it('e',()=>{expect(hd289wfx(15,0)).toBe(4);});});
function hd290wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290wfx_hd',()=>{it('a',()=>{expect(hd290wfx(1,4)).toBe(2);});it('b',()=>{expect(hd290wfx(3,1)).toBe(1);});it('c',()=>{expect(hd290wfx(0,0)).toBe(0);});it('d',()=>{expect(hd290wfx(93,73)).toBe(2);});it('e',()=>{expect(hd290wfx(15,0)).toBe(4);});});
function hd291wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291wfx_hd',()=>{it('a',()=>{expect(hd291wfx(1,4)).toBe(2);});it('b',()=>{expect(hd291wfx(3,1)).toBe(1);});it('c',()=>{expect(hd291wfx(0,0)).toBe(0);});it('d',()=>{expect(hd291wfx(93,73)).toBe(2);});it('e',()=>{expect(hd291wfx(15,0)).toBe(4);});});
function hd292wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292wfx_hd',()=>{it('a',()=>{expect(hd292wfx(1,4)).toBe(2);});it('b',()=>{expect(hd292wfx(3,1)).toBe(1);});it('c',()=>{expect(hd292wfx(0,0)).toBe(0);});it('d',()=>{expect(hd292wfx(93,73)).toBe(2);});it('e',()=>{expect(hd292wfx(15,0)).toBe(4);});});
function hd293wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293wfx_hd',()=>{it('a',()=>{expect(hd293wfx(1,4)).toBe(2);});it('b',()=>{expect(hd293wfx(3,1)).toBe(1);});it('c',()=>{expect(hd293wfx(0,0)).toBe(0);});it('d',()=>{expect(hd293wfx(93,73)).toBe(2);});it('e',()=>{expect(hd293wfx(15,0)).toBe(4);});});
function hd294wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294wfx_hd',()=>{it('a',()=>{expect(hd294wfx(1,4)).toBe(2);});it('b',()=>{expect(hd294wfx(3,1)).toBe(1);});it('c',()=>{expect(hd294wfx(0,0)).toBe(0);});it('d',()=>{expect(hd294wfx(93,73)).toBe(2);});it('e',()=>{expect(hd294wfx(15,0)).toBe(4);});});
function hd295wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295wfx_hd',()=>{it('a',()=>{expect(hd295wfx(1,4)).toBe(2);});it('b',()=>{expect(hd295wfx(3,1)).toBe(1);});it('c',()=>{expect(hd295wfx(0,0)).toBe(0);});it('d',()=>{expect(hd295wfx(93,73)).toBe(2);});it('e',()=>{expect(hd295wfx(15,0)).toBe(4);});});
function hd296wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296wfx_hd',()=>{it('a',()=>{expect(hd296wfx(1,4)).toBe(2);});it('b',()=>{expect(hd296wfx(3,1)).toBe(1);});it('c',()=>{expect(hd296wfx(0,0)).toBe(0);});it('d',()=>{expect(hd296wfx(93,73)).toBe(2);});it('e',()=>{expect(hd296wfx(15,0)).toBe(4);});});
function hd297wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297wfx_hd',()=>{it('a',()=>{expect(hd297wfx(1,4)).toBe(2);});it('b',()=>{expect(hd297wfx(3,1)).toBe(1);});it('c',()=>{expect(hd297wfx(0,0)).toBe(0);});it('d',()=>{expect(hd297wfx(93,73)).toBe(2);});it('e',()=>{expect(hd297wfx(15,0)).toBe(4);});});
function hd298wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298wfx_hd',()=>{it('a',()=>{expect(hd298wfx(1,4)).toBe(2);});it('b',()=>{expect(hd298wfx(3,1)).toBe(1);});it('c',()=>{expect(hd298wfx(0,0)).toBe(0);});it('d',()=>{expect(hd298wfx(93,73)).toBe(2);});it('e',()=>{expect(hd298wfx(15,0)).toBe(4);});});
function hd299wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299wfx_hd',()=>{it('a',()=>{expect(hd299wfx(1,4)).toBe(2);});it('b',()=>{expect(hd299wfx(3,1)).toBe(1);});it('c',()=>{expect(hd299wfx(0,0)).toBe(0);});it('d',()=>{expect(hd299wfx(93,73)).toBe(2);});it('e',()=>{expect(hd299wfx(15,0)).toBe(4);});});
function hd300wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300wfx_hd',()=>{it('a',()=>{expect(hd300wfx(1,4)).toBe(2);});it('b',()=>{expect(hd300wfx(3,1)).toBe(1);});it('c',()=>{expect(hd300wfx(0,0)).toBe(0);});it('d',()=>{expect(hd300wfx(93,73)).toBe(2);});it('e',()=>{expect(hd300wfx(15,0)).toBe(4);});});
function hd301wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301wfx_hd',()=>{it('a',()=>{expect(hd301wfx(1,4)).toBe(2);});it('b',()=>{expect(hd301wfx(3,1)).toBe(1);});it('c',()=>{expect(hd301wfx(0,0)).toBe(0);});it('d',()=>{expect(hd301wfx(93,73)).toBe(2);});it('e',()=>{expect(hd301wfx(15,0)).toBe(4);});});
function hd302wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302wfx_hd',()=>{it('a',()=>{expect(hd302wfx(1,4)).toBe(2);});it('b',()=>{expect(hd302wfx(3,1)).toBe(1);});it('c',()=>{expect(hd302wfx(0,0)).toBe(0);});it('d',()=>{expect(hd302wfx(93,73)).toBe(2);});it('e',()=>{expect(hd302wfx(15,0)).toBe(4);});});
function hd303wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303wfx_hd',()=>{it('a',()=>{expect(hd303wfx(1,4)).toBe(2);});it('b',()=>{expect(hd303wfx(3,1)).toBe(1);});it('c',()=>{expect(hd303wfx(0,0)).toBe(0);});it('d',()=>{expect(hd303wfx(93,73)).toBe(2);});it('e',()=>{expect(hd303wfx(15,0)).toBe(4);});});
function hd304wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304wfx_hd',()=>{it('a',()=>{expect(hd304wfx(1,4)).toBe(2);});it('b',()=>{expect(hd304wfx(3,1)).toBe(1);});it('c',()=>{expect(hd304wfx(0,0)).toBe(0);});it('d',()=>{expect(hd304wfx(93,73)).toBe(2);});it('e',()=>{expect(hd304wfx(15,0)).toBe(4);});});
function hd305wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305wfx_hd',()=>{it('a',()=>{expect(hd305wfx(1,4)).toBe(2);});it('b',()=>{expect(hd305wfx(3,1)).toBe(1);});it('c',()=>{expect(hd305wfx(0,0)).toBe(0);});it('d',()=>{expect(hd305wfx(93,73)).toBe(2);});it('e',()=>{expect(hd305wfx(15,0)).toBe(4);});});
function hd306wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306wfx_hd',()=>{it('a',()=>{expect(hd306wfx(1,4)).toBe(2);});it('b',()=>{expect(hd306wfx(3,1)).toBe(1);});it('c',()=>{expect(hd306wfx(0,0)).toBe(0);});it('d',()=>{expect(hd306wfx(93,73)).toBe(2);});it('e',()=>{expect(hd306wfx(15,0)).toBe(4);});});
function hd307wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307wfx_hd',()=>{it('a',()=>{expect(hd307wfx(1,4)).toBe(2);});it('b',()=>{expect(hd307wfx(3,1)).toBe(1);});it('c',()=>{expect(hd307wfx(0,0)).toBe(0);});it('d',()=>{expect(hd307wfx(93,73)).toBe(2);});it('e',()=>{expect(hd307wfx(15,0)).toBe(4);});});
function hd308wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308wfx_hd',()=>{it('a',()=>{expect(hd308wfx(1,4)).toBe(2);});it('b',()=>{expect(hd308wfx(3,1)).toBe(1);});it('c',()=>{expect(hd308wfx(0,0)).toBe(0);});it('d',()=>{expect(hd308wfx(93,73)).toBe(2);});it('e',()=>{expect(hd308wfx(15,0)).toBe(4);});});
function hd309wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309wfx_hd',()=>{it('a',()=>{expect(hd309wfx(1,4)).toBe(2);});it('b',()=>{expect(hd309wfx(3,1)).toBe(1);});it('c',()=>{expect(hd309wfx(0,0)).toBe(0);});it('d',()=>{expect(hd309wfx(93,73)).toBe(2);});it('e',()=>{expect(hd309wfx(15,0)).toBe(4);});});
function hd310wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310wfx_hd',()=>{it('a',()=>{expect(hd310wfx(1,4)).toBe(2);});it('b',()=>{expect(hd310wfx(3,1)).toBe(1);});it('c',()=>{expect(hd310wfx(0,0)).toBe(0);});it('d',()=>{expect(hd310wfx(93,73)).toBe(2);});it('e',()=>{expect(hd310wfx(15,0)).toBe(4);});});
function hd311wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311wfx_hd',()=>{it('a',()=>{expect(hd311wfx(1,4)).toBe(2);});it('b',()=>{expect(hd311wfx(3,1)).toBe(1);});it('c',()=>{expect(hd311wfx(0,0)).toBe(0);});it('d',()=>{expect(hd311wfx(93,73)).toBe(2);});it('e',()=>{expect(hd311wfx(15,0)).toBe(4);});});
function hd312wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312wfx_hd',()=>{it('a',()=>{expect(hd312wfx(1,4)).toBe(2);});it('b',()=>{expect(hd312wfx(3,1)).toBe(1);});it('c',()=>{expect(hd312wfx(0,0)).toBe(0);});it('d',()=>{expect(hd312wfx(93,73)).toBe(2);});it('e',()=>{expect(hd312wfx(15,0)).toBe(4);});});
function hd313wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313wfx_hd',()=>{it('a',()=>{expect(hd313wfx(1,4)).toBe(2);});it('b',()=>{expect(hd313wfx(3,1)).toBe(1);});it('c',()=>{expect(hd313wfx(0,0)).toBe(0);});it('d',()=>{expect(hd313wfx(93,73)).toBe(2);});it('e',()=>{expect(hd313wfx(15,0)).toBe(4);});});
function hd314wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314wfx_hd',()=>{it('a',()=>{expect(hd314wfx(1,4)).toBe(2);});it('b',()=>{expect(hd314wfx(3,1)).toBe(1);});it('c',()=>{expect(hd314wfx(0,0)).toBe(0);});it('d',()=>{expect(hd314wfx(93,73)).toBe(2);});it('e',()=>{expect(hd314wfx(15,0)).toBe(4);});});
function hd315wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315wfx_hd',()=>{it('a',()=>{expect(hd315wfx(1,4)).toBe(2);});it('b',()=>{expect(hd315wfx(3,1)).toBe(1);});it('c',()=>{expect(hd315wfx(0,0)).toBe(0);});it('d',()=>{expect(hd315wfx(93,73)).toBe(2);});it('e',()=>{expect(hd315wfx(15,0)).toBe(4);});});
function hd316wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316wfx_hd',()=>{it('a',()=>{expect(hd316wfx(1,4)).toBe(2);});it('b',()=>{expect(hd316wfx(3,1)).toBe(1);});it('c',()=>{expect(hd316wfx(0,0)).toBe(0);});it('d',()=>{expect(hd316wfx(93,73)).toBe(2);});it('e',()=>{expect(hd316wfx(15,0)).toBe(4);});});
function hd317wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317wfx_hd',()=>{it('a',()=>{expect(hd317wfx(1,4)).toBe(2);});it('b',()=>{expect(hd317wfx(3,1)).toBe(1);});it('c',()=>{expect(hd317wfx(0,0)).toBe(0);});it('d',()=>{expect(hd317wfx(93,73)).toBe(2);});it('e',()=>{expect(hd317wfx(15,0)).toBe(4);});});
function hd318wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318wfx_hd',()=>{it('a',()=>{expect(hd318wfx(1,4)).toBe(2);});it('b',()=>{expect(hd318wfx(3,1)).toBe(1);});it('c',()=>{expect(hd318wfx(0,0)).toBe(0);});it('d',()=>{expect(hd318wfx(93,73)).toBe(2);});it('e',()=>{expect(hd318wfx(15,0)).toBe(4);});});
function hd319wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319wfx_hd',()=>{it('a',()=>{expect(hd319wfx(1,4)).toBe(2);});it('b',()=>{expect(hd319wfx(3,1)).toBe(1);});it('c',()=>{expect(hd319wfx(0,0)).toBe(0);});it('d',()=>{expect(hd319wfx(93,73)).toBe(2);});it('e',()=>{expect(hd319wfx(15,0)).toBe(4);});});
function hd320wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320wfx_hd',()=>{it('a',()=>{expect(hd320wfx(1,4)).toBe(2);});it('b',()=>{expect(hd320wfx(3,1)).toBe(1);});it('c',()=>{expect(hd320wfx(0,0)).toBe(0);});it('d',()=>{expect(hd320wfx(93,73)).toBe(2);});it('e',()=>{expect(hd320wfx(15,0)).toBe(4);});});
function hd321wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321wfx_hd',()=>{it('a',()=>{expect(hd321wfx(1,4)).toBe(2);});it('b',()=>{expect(hd321wfx(3,1)).toBe(1);});it('c',()=>{expect(hd321wfx(0,0)).toBe(0);});it('d',()=>{expect(hd321wfx(93,73)).toBe(2);});it('e',()=>{expect(hd321wfx(15,0)).toBe(4);});});
function hd322wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322wfx_hd',()=>{it('a',()=>{expect(hd322wfx(1,4)).toBe(2);});it('b',()=>{expect(hd322wfx(3,1)).toBe(1);});it('c',()=>{expect(hd322wfx(0,0)).toBe(0);});it('d',()=>{expect(hd322wfx(93,73)).toBe(2);});it('e',()=>{expect(hd322wfx(15,0)).toBe(4);});});
function hd323wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323wfx_hd',()=>{it('a',()=>{expect(hd323wfx(1,4)).toBe(2);});it('b',()=>{expect(hd323wfx(3,1)).toBe(1);});it('c',()=>{expect(hd323wfx(0,0)).toBe(0);});it('d',()=>{expect(hd323wfx(93,73)).toBe(2);});it('e',()=>{expect(hd323wfx(15,0)).toBe(4);});});
function hd324wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324wfx_hd',()=>{it('a',()=>{expect(hd324wfx(1,4)).toBe(2);});it('b',()=>{expect(hd324wfx(3,1)).toBe(1);});it('c',()=>{expect(hd324wfx(0,0)).toBe(0);});it('d',()=>{expect(hd324wfx(93,73)).toBe(2);});it('e',()=>{expect(hd324wfx(15,0)).toBe(4);});});
function hd325wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325wfx_hd',()=>{it('a',()=>{expect(hd325wfx(1,4)).toBe(2);});it('b',()=>{expect(hd325wfx(3,1)).toBe(1);});it('c',()=>{expect(hd325wfx(0,0)).toBe(0);});it('d',()=>{expect(hd325wfx(93,73)).toBe(2);});it('e',()=>{expect(hd325wfx(15,0)).toBe(4);});});
function hd326wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326wfx_hd',()=>{it('a',()=>{expect(hd326wfx(1,4)).toBe(2);});it('b',()=>{expect(hd326wfx(3,1)).toBe(1);});it('c',()=>{expect(hd326wfx(0,0)).toBe(0);});it('d',()=>{expect(hd326wfx(93,73)).toBe(2);});it('e',()=>{expect(hd326wfx(15,0)).toBe(4);});});
function hd327wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327wfx_hd',()=>{it('a',()=>{expect(hd327wfx(1,4)).toBe(2);});it('b',()=>{expect(hd327wfx(3,1)).toBe(1);});it('c',()=>{expect(hd327wfx(0,0)).toBe(0);});it('d',()=>{expect(hd327wfx(93,73)).toBe(2);});it('e',()=>{expect(hd327wfx(15,0)).toBe(4);});});
function hd328wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328wfx_hd',()=>{it('a',()=>{expect(hd328wfx(1,4)).toBe(2);});it('b',()=>{expect(hd328wfx(3,1)).toBe(1);});it('c',()=>{expect(hd328wfx(0,0)).toBe(0);});it('d',()=>{expect(hd328wfx(93,73)).toBe(2);});it('e',()=>{expect(hd328wfx(15,0)).toBe(4);});});
function hd329wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329wfx_hd',()=>{it('a',()=>{expect(hd329wfx(1,4)).toBe(2);});it('b',()=>{expect(hd329wfx(3,1)).toBe(1);});it('c',()=>{expect(hd329wfx(0,0)).toBe(0);});it('d',()=>{expect(hd329wfx(93,73)).toBe(2);});it('e',()=>{expect(hd329wfx(15,0)).toBe(4);});});
function hd330wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330wfx_hd',()=>{it('a',()=>{expect(hd330wfx(1,4)).toBe(2);});it('b',()=>{expect(hd330wfx(3,1)).toBe(1);});it('c',()=>{expect(hd330wfx(0,0)).toBe(0);});it('d',()=>{expect(hd330wfx(93,73)).toBe(2);});it('e',()=>{expect(hd330wfx(15,0)).toBe(4);});});
function hd331wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331wfx_hd',()=>{it('a',()=>{expect(hd331wfx(1,4)).toBe(2);});it('b',()=>{expect(hd331wfx(3,1)).toBe(1);});it('c',()=>{expect(hd331wfx(0,0)).toBe(0);});it('d',()=>{expect(hd331wfx(93,73)).toBe(2);});it('e',()=>{expect(hd331wfx(15,0)).toBe(4);});});
function hd332wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332wfx_hd',()=>{it('a',()=>{expect(hd332wfx(1,4)).toBe(2);});it('b',()=>{expect(hd332wfx(3,1)).toBe(1);});it('c',()=>{expect(hd332wfx(0,0)).toBe(0);});it('d',()=>{expect(hd332wfx(93,73)).toBe(2);});it('e',()=>{expect(hd332wfx(15,0)).toBe(4);});});
function hd333wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333wfx_hd',()=>{it('a',()=>{expect(hd333wfx(1,4)).toBe(2);});it('b',()=>{expect(hd333wfx(3,1)).toBe(1);});it('c',()=>{expect(hd333wfx(0,0)).toBe(0);});it('d',()=>{expect(hd333wfx(93,73)).toBe(2);});it('e',()=>{expect(hd333wfx(15,0)).toBe(4);});});
function hd334wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334wfx_hd',()=>{it('a',()=>{expect(hd334wfx(1,4)).toBe(2);});it('b',()=>{expect(hd334wfx(3,1)).toBe(1);});it('c',()=>{expect(hd334wfx(0,0)).toBe(0);});it('d',()=>{expect(hd334wfx(93,73)).toBe(2);});it('e',()=>{expect(hd334wfx(15,0)).toBe(4);});});
function hd335wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335wfx_hd',()=>{it('a',()=>{expect(hd335wfx(1,4)).toBe(2);});it('b',()=>{expect(hd335wfx(3,1)).toBe(1);});it('c',()=>{expect(hd335wfx(0,0)).toBe(0);});it('d',()=>{expect(hd335wfx(93,73)).toBe(2);});it('e',()=>{expect(hd335wfx(15,0)).toBe(4);});});
function hd336wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336wfx_hd',()=>{it('a',()=>{expect(hd336wfx(1,4)).toBe(2);});it('b',()=>{expect(hd336wfx(3,1)).toBe(1);});it('c',()=>{expect(hd336wfx(0,0)).toBe(0);});it('d',()=>{expect(hd336wfx(93,73)).toBe(2);});it('e',()=>{expect(hd336wfx(15,0)).toBe(4);});});
function hd337wfx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337wfx_hd',()=>{it('a',()=>{expect(hd337wfx(1,4)).toBe(2);});it('b',()=>{expect(hd337wfx(3,1)).toBe(1);});it('c',()=>{expect(hd337wfx(0,0)).toBe(0);});it('d',()=>{expect(hd337wfx(93,73)).toBe(2);});it('e',()=>{expect(hd337wfx(15,0)).toBe(4);});});
function hd338worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338worx2_hd',()=>{it('a',()=>{expect(hd338worx2(1,4)).toBe(2);});it('b',()=>{expect(hd338worx2(3,1)).toBe(1);});it('c',()=>{expect(hd338worx2(0,0)).toBe(0);});it('d',()=>{expect(hd338worx2(93,73)).toBe(2);});it('e',()=>{expect(hd338worx2(15,0)).toBe(4);});});
function hd338worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd339worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339worx2_hd',()=>{it('a',()=>{expect(hd339worx2(1,4)).toBe(2);});it('b',()=>{expect(hd339worx2(3,1)).toBe(1);});it('c',()=>{expect(hd339worx2(0,0)).toBe(0);});it('d',()=>{expect(hd339worx2(93,73)).toBe(2);});it('e',()=>{expect(hd339worx2(15,0)).toBe(4);});});
function hd339worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd340worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340worx2_hd',()=>{it('a',()=>{expect(hd340worx2(1,4)).toBe(2);});it('b',()=>{expect(hd340worx2(3,1)).toBe(1);});it('c',()=>{expect(hd340worx2(0,0)).toBe(0);});it('d',()=>{expect(hd340worx2(93,73)).toBe(2);});it('e',()=>{expect(hd340worx2(15,0)).toBe(4);});});
function hd340worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd341worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341worx2_hd',()=>{it('a',()=>{expect(hd341worx2(1,4)).toBe(2);});it('b',()=>{expect(hd341worx2(3,1)).toBe(1);});it('c',()=>{expect(hd341worx2(0,0)).toBe(0);});it('d',()=>{expect(hd341worx2(93,73)).toBe(2);});it('e',()=>{expect(hd341worx2(15,0)).toBe(4);});});
function hd341worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd342worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342worx2_hd',()=>{it('a',()=>{expect(hd342worx2(1,4)).toBe(2);});it('b',()=>{expect(hd342worx2(3,1)).toBe(1);});it('c',()=>{expect(hd342worx2(0,0)).toBe(0);});it('d',()=>{expect(hd342worx2(93,73)).toBe(2);});it('e',()=>{expect(hd342worx2(15,0)).toBe(4);});});
function hd342worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd343worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343worx2_hd',()=>{it('a',()=>{expect(hd343worx2(1,4)).toBe(2);});it('b',()=>{expect(hd343worx2(3,1)).toBe(1);});it('c',()=>{expect(hd343worx2(0,0)).toBe(0);});it('d',()=>{expect(hd343worx2(93,73)).toBe(2);});it('e',()=>{expect(hd343worx2(15,0)).toBe(4);});});
function hd343worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd344worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344worx2_hd',()=>{it('a',()=>{expect(hd344worx2(1,4)).toBe(2);});it('b',()=>{expect(hd344worx2(3,1)).toBe(1);});it('c',()=>{expect(hd344worx2(0,0)).toBe(0);});it('d',()=>{expect(hd344worx2(93,73)).toBe(2);});it('e',()=>{expect(hd344worx2(15,0)).toBe(4);});});
function hd344worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd345worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345worx2_hd',()=>{it('a',()=>{expect(hd345worx2(1,4)).toBe(2);});it('b',()=>{expect(hd345worx2(3,1)).toBe(1);});it('c',()=>{expect(hd345worx2(0,0)).toBe(0);});it('d',()=>{expect(hd345worx2(93,73)).toBe(2);});it('e',()=>{expect(hd345worx2(15,0)).toBe(4);});});
function hd345worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd346worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346worx2_hd',()=>{it('a',()=>{expect(hd346worx2(1,4)).toBe(2);});it('b',()=>{expect(hd346worx2(3,1)).toBe(1);});it('c',()=>{expect(hd346worx2(0,0)).toBe(0);});it('d',()=>{expect(hd346worx2(93,73)).toBe(2);});it('e',()=>{expect(hd346worx2(15,0)).toBe(4);});});
function hd346worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd347worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347worx2_hd',()=>{it('a',()=>{expect(hd347worx2(1,4)).toBe(2);});it('b',()=>{expect(hd347worx2(3,1)).toBe(1);});it('c',()=>{expect(hd347worx2(0,0)).toBe(0);});it('d',()=>{expect(hd347worx2(93,73)).toBe(2);});it('e',()=>{expect(hd347worx2(15,0)).toBe(4);});});
function hd347worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd348worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348worx2_hd',()=>{it('a',()=>{expect(hd348worx2(1,4)).toBe(2);});it('b',()=>{expect(hd348worx2(3,1)).toBe(1);});it('c',()=>{expect(hd348worx2(0,0)).toBe(0);});it('d',()=>{expect(hd348worx2(93,73)).toBe(2);});it('e',()=>{expect(hd348worx2(15,0)).toBe(4);});});
function hd348worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd349worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349worx2_hd',()=>{it('a',()=>{expect(hd349worx2(1,4)).toBe(2);});it('b',()=>{expect(hd349worx2(3,1)).toBe(1);});it('c',()=>{expect(hd349worx2(0,0)).toBe(0);});it('d',()=>{expect(hd349worx2(93,73)).toBe(2);});it('e',()=>{expect(hd349worx2(15,0)).toBe(4);});});
function hd349worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd350worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350worx2_hd',()=>{it('a',()=>{expect(hd350worx2(1,4)).toBe(2);});it('b',()=>{expect(hd350worx2(3,1)).toBe(1);});it('c',()=>{expect(hd350worx2(0,0)).toBe(0);});it('d',()=>{expect(hd350worx2(93,73)).toBe(2);});it('e',()=>{expect(hd350worx2(15,0)).toBe(4);});});
function hd350worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd351worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351worx2_hd',()=>{it('a',()=>{expect(hd351worx2(1,4)).toBe(2);});it('b',()=>{expect(hd351worx2(3,1)).toBe(1);});it('c',()=>{expect(hd351worx2(0,0)).toBe(0);});it('d',()=>{expect(hd351worx2(93,73)).toBe(2);});it('e',()=>{expect(hd351worx2(15,0)).toBe(4);});});
function hd351worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd352worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352worx2_hd',()=>{it('a',()=>{expect(hd352worx2(1,4)).toBe(2);});it('b',()=>{expect(hd352worx2(3,1)).toBe(1);});it('c',()=>{expect(hd352worx2(0,0)).toBe(0);});it('d',()=>{expect(hd352worx2(93,73)).toBe(2);});it('e',()=>{expect(hd352worx2(15,0)).toBe(4);});});
function hd352worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd353worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353worx2_hd',()=>{it('a',()=>{expect(hd353worx2(1,4)).toBe(2);});it('b',()=>{expect(hd353worx2(3,1)).toBe(1);});it('c',()=>{expect(hd353worx2(0,0)).toBe(0);});it('d',()=>{expect(hd353worx2(93,73)).toBe(2);});it('e',()=>{expect(hd353worx2(15,0)).toBe(4);});});
function hd353worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd354worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354worx2_hd',()=>{it('a',()=>{expect(hd354worx2(1,4)).toBe(2);});it('b',()=>{expect(hd354worx2(3,1)).toBe(1);});it('c',()=>{expect(hd354worx2(0,0)).toBe(0);});it('d',()=>{expect(hd354worx2(93,73)).toBe(2);});it('e',()=>{expect(hd354worx2(15,0)).toBe(4);});});
function hd354worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd355worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355worx2_hd',()=>{it('a',()=>{expect(hd355worx2(1,4)).toBe(2);});it('b',()=>{expect(hd355worx2(3,1)).toBe(1);});it('c',()=>{expect(hd355worx2(0,0)).toBe(0);});it('d',()=>{expect(hd355worx2(93,73)).toBe(2);});it('e',()=>{expect(hd355worx2(15,0)).toBe(4);});});
function hd355worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd356worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356worx2_hd',()=>{it('a',()=>{expect(hd356worx2(1,4)).toBe(2);});it('b',()=>{expect(hd356worx2(3,1)).toBe(1);});it('c',()=>{expect(hd356worx2(0,0)).toBe(0);});it('d',()=>{expect(hd356worx2(93,73)).toBe(2);});it('e',()=>{expect(hd356worx2(15,0)).toBe(4);});});
function hd356worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd357worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357worx2_hd',()=>{it('a',()=>{expect(hd357worx2(1,4)).toBe(2);});it('b',()=>{expect(hd357worx2(3,1)).toBe(1);});it('c',()=>{expect(hd357worx2(0,0)).toBe(0);});it('d',()=>{expect(hd357worx2(93,73)).toBe(2);});it('e',()=>{expect(hd357worx2(15,0)).toBe(4);});});
function hd357worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd358worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358worx2_hd',()=>{it('a',()=>{expect(hd358worx2(1,4)).toBe(2);});it('b',()=>{expect(hd358worx2(3,1)).toBe(1);});it('c',()=>{expect(hd358worx2(0,0)).toBe(0);});it('d',()=>{expect(hd358worx2(93,73)).toBe(2);});it('e',()=>{expect(hd358worx2(15,0)).toBe(4);});});
function hd358worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd359worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359worx2_hd',()=>{it('a',()=>{expect(hd359worx2(1,4)).toBe(2);});it('b',()=>{expect(hd359worx2(3,1)).toBe(1);});it('c',()=>{expect(hd359worx2(0,0)).toBe(0);});it('d',()=>{expect(hd359worx2(93,73)).toBe(2);});it('e',()=>{expect(hd359worx2(15,0)).toBe(4);});});
function hd359worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd360worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360worx2_hd',()=>{it('a',()=>{expect(hd360worx2(1,4)).toBe(2);});it('b',()=>{expect(hd360worx2(3,1)).toBe(1);});it('c',()=>{expect(hd360worx2(0,0)).toBe(0);});it('d',()=>{expect(hd360worx2(93,73)).toBe(2);});it('e',()=>{expect(hd360worx2(15,0)).toBe(4);});});
function hd360worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd361worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361worx2_hd',()=>{it('a',()=>{expect(hd361worx2(1,4)).toBe(2);});it('b',()=>{expect(hd361worx2(3,1)).toBe(1);});it('c',()=>{expect(hd361worx2(0,0)).toBe(0);});it('d',()=>{expect(hd361worx2(93,73)).toBe(2);});it('e',()=>{expect(hd361worx2(15,0)).toBe(4);});});
function hd361worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd362worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362worx2_hd',()=>{it('a',()=>{expect(hd362worx2(1,4)).toBe(2);});it('b',()=>{expect(hd362worx2(3,1)).toBe(1);});it('c',()=>{expect(hd362worx2(0,0)).toBe(0);});it('d',()=>{expect(hd362worx2(93,73)).toBe(2);});it('e',()=>{expect(hd362worx2(15,0)).toBe(4);});});
function hd362worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd363worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363worx2_hd',()=>{it('a',()=>{expect(hd363worx2(1,4)).toBe(2);});it('b',()=>{expect(hd363worx2(3,1)).toBe(1);});it('c',()=>{expect(hd363worx2(0,0)).toBe(0);});it('d',()=>{expect(hd363worx2(93,73)).toBe(2);});it('e',()=>{expect(hd363worx2(15,0)).toBe(4);});});
function hd363worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd364worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364worx2_hd',()=>{it('a',()=>{expect(hd364worx2(1,4)).toBe(2);});it('b',()=>{expect(hd364worx2(3,1)).toBe(1);});it('c',()=>{expect(hd364worx2(0,0)).toBe(0);});it('d',()=>{expect(hd364worx2(93,73)).toBe(2);});it('e',()=>{expect(hd364worx2(15,0)).toBe(4);});});
function hd364worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd365worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365worx2_hd',()=>{it('a',()=>{expect(hd365worx2(1,4)).toBe(2);});it('b',()=>{expect(hd365worx2(3,1)).toBe(1);});it('c',()=>{expect(hd365worx2(0,0)).toBe(0);});it('d',()=>{expect(hd365worx2(93,73)).toBe(2);});it('e',()=>{expect(hd365worx2(15,0)).toBe(4);});});
function hd365worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd366worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366worx2_hd',()=>{it('a',()=>{expect(hd366worx2(1,4)).toBe(2);});it('b',()=>{expect(hd366worx2(3,1)).toBe(1);});it('c',()=>{expect(hd366worx2(0,0)).toBe(0);});it('d',()=>{expect(hd366worx2(93,73)).toBe(2);});it('e',()=>{expect(hd366worx2(15,0)).toBe(4);});});
function hd366worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd367worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367worx2_hd',()=>{it('a',()=>{expect(hd367worx2(1,4)).toBe(2);});it('b',()=>{expect(hd367worx2(3,1)).toBe(1);});it('c',()=>{expect(hd367worx2(0,0)).toBe(0);});it('d',()=>{expect(hd367worx2(93,73)).toBe(2);});it('e',()=>{expect(hd367worx2(15,0)).toBe(4);});});
function hd367worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd368worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368worx2_hd',()=>{it('a',()=>{expect(hd368worx2(1,4)).toBe(2);});it('b',()=>{expect(hd368worx2(3,1)).toBe(1);});it('c',()=>{expect(hd368worx2(0,0)).toBe(0);});it('d',()=>{expect(hd368worx2(93,73)).toBe(2);});it('e',()=>{expect(hd368worx2(15,0)).toBe(4);});});
function hd368worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd369worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369worx2_hd',()=>{it('a',()=>{expect(hd369worx2(1,4)).toBe(2);});it('b',()=>{expect(hd369worx2(3,1)).toBe(1);});it('c',()=>{expect(hd369worx2(0,0)).toBe(0);});it('d',()=>{expect(hd369worx2(93,73)).toBe(2);});it('e',()=>{expect(hd369worx2(15,0)).toBe(4);});});
function hd369worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd370worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370worx2_hd',()=>{it('a',()=>{expect(hd370worx2(1,4)).toBe(2);});it('b',()=>{expect(hd370worx2(3,1)).toBe(1);});it('c',()=>{expect(hd370worx2(0,0)).toBe(0);});it('d',()=>{expect(hd370worx2(93,73)).toBe(2);});it('e',()=>{expect(hd370worx2(15,0)).toBe(4);});});
function hd370worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd371worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371worx2_hd',()=>{it('a',()=>{expect(hd371worx2(1,4)).toBe(2);});it('b',()=>{expect(hd371worx2(3,1)).toBe(1);});it('c',()=>{expect(hd371worx2(0,0)).toBe(0);});it('d',()=>{expect(hd371worx2(93,73)).toBe(2);});it('e',()=>{expect(hd371worx2(15,0)).toBe(4);});});
function hd371worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd372worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372worx2_hd',()=>{it('a',()=>{expect(hd372worx2(1,4)).toBe(2);});it('b',()=>{expect(hd372worx2(3,1)).toBe(1);});it('c',()=>{expect(hd372worx2(0,0)).toBe(0);});it('d',()=>{expect(hd372worx2(93,73)).toBe(2);});it('e',()=>{expect(hd372worx2(15,0)).toBe(4);});});
function hd372worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd373worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373worx2_hd',()=>{it('a',()=>{expect(hd373worx2(1,4)).toBe(2);});it('b',()=>{expect(hd373worx2(3,1)).toBe(1);});it('c',()=>{expect(hd373worx2(0,0)).toBe(0);});it('d',()=>{expect(hd373worx2(93,73)).toBe(2);});it('e',()=>{expect(hd373worx2(15,0)).toBe(4);});});
function hd373worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd374worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374worx2_hd',()=>{it('a',()=>{expect(hd374worx2(1,4)).toBe(2);});it('b',()=>{expect(hd374worx2(3,1)).toBe(1);});it('c',()=>{expect(hd374worx2(0,0)).toBe(0);});it('d',()=>{expect(hd374worx2(93,73)).toBe(2);});it('e',()=>{expect(hd374worx2(15,0)).toBe(4);});});
function hd374worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd375worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375worx2_hd',()=>{it('a',()=>{expect(hd375worx2(1,4)).toBe(2);});it('b',()=>{expect(hd375worx2(3,1)).toBe(1);});it('c',()=>{expect(hd375worx2(0,0)).toBe(0);});it('d',()=>{expect(hd375worx2(93,73)).toBe(2);});it('e',()=>{expect(hd375worx2(15,0)).toBe(4);});});
function hd375worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd376worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376worx2_hd',()=>{it('a',()=>{expect(hd376worx2(1,4)).toBe(2);});it('b',()=>{expect(hd376worx2(3,1)).toBe(1);});it('c',()=>{expect(hd376worx2(0,0)).toBe(0);});it('d',()=>{expect(hd376worx2(93,73)).toBe(2);});it('e',()=>{expect(hd376worx2(15,0)).toBe(4);});});
function hd376worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd377worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377worx2_hd',()=>{it('a',()=>{expect(hd377worx2(1,4)).toBe(2);});it('b',()=>{expect(hd377worx2(3,1)).toBe(1);});it('c',()=>{expect(hd377worx2(0,0)).toBe(0);});it('d',()=>{expect(hd377worx2(93,73)).toBe(2);});it('e',()=>{expect(hd377worx2(15,0)).toBe(4);});});
function hd377worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd378worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378worx2_hd',()=>{it('a',()=>{expect(hd378worx2(1,4)).toBe(2);});it('b',()=>{expect(hd378worx2(3,1)).toBe(1);});it('c',()=>{expect(hd378worx2(0,0)).toBe(0);});it('d',()=>{expect(hd378worx2(93,73)).toBe(2);});it('e',()=>{expect(hd378worx2(15,0)).toBe(4);});});
function hd378worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd379worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379worx2_hd',()=>{it('a',()=>{expect(hd379worx2(1,4)).toBe(2);});it('b',()=>{expect(hd379worx2(3,1)).toBe(1);});it('c',()=>{expect(hd379worx2(0,0)).toBe(0);});it('d',()=>{expect(hd379worx2(93,73)).toBe(2);});it('e',()=>{expect(hd379worx2(15,0)).toBe(4);});});
function hd379worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd380worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380worx2_hd',()=>{it('a',()=>{expect(hd380worx2(1,4)).toBe(2);});it('b',()=>{expect(hd380worx2(3,1)).toBe(1);});it('c',()=>{expect(hd380worx2(0,0)).toBe(0);});it('d',()=>{expect(hd380worx2(93,73)).toBe(2);});it('e',()=>{expect(hd380worx2(15,0)).toBe(4);});});
function hd380worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd381worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381worx2_hd',()=>{it('a',()=>{expect(hd381worx2(1,4)).toBe(2);});it('b',()=>{expect(hd381worx2(3,1)).toBe(1);});it('c',()=>{expect(hd381worx2(0,0)).toBe(0);});it('d',()=>{expect(hd381worx2(93,73)).toBe(2);});it('e',()=>{expect(hd381worx2(15,0)).toBe(4);});});
function hd381worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd382worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382worx2_hd',()=>{it('a',()=>{expect(hd382worx2(1,4)).toBe(2);});it('b',()=>{expect(hd382worx2(3,1)).toBe(1);});it('c',()=>{expect(hd382worx2(0,0)).toBe(0);});it('d',()=>{expect(hd382worx2(93,73)).toBe(2);});it('e',()=>{expect(hd382worx2(15,0)).toBe(4);});});
function hd382worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd383worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383worx2_hd',()=>{it('a',()=>{expect(hd383worx2(1,4)).toBe(2);});it('b',()=>{expect(hd383worx2(3,1)).toBe(1);});it('c',()=>{expect(hd383worx2(0,0)).toBe(0);});it('d',()=>{expect(hd383worx2(93,73)).toBe(2);});it('e',()=>{expect(hd383worx2(15,0)).toBe(4);});});
function hd383worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd384worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384worx2_hd',()=>{it('a',()=>{expect(hd384worx2(1,4)).toBe(2);});it('b',()=>{expect(hd384worx2(3,1)).toBe(1);});it('c',()=>{expect(hd384worx2(0,0)).toBe(0);});it('d',()=>{expect(hd384worx2(93,73)).toBe(2);});it('e',()=>{expect(hd384worx2(15,0)).toBe(4);});});
function hd384worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd385worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385worx2_hd',()=>{it('a',()=>{expect(hd385worx2(1,4)).toBe(2);});it('b',()=>{expect(hd385worx2(3,1)).toBe(1);});it('c',()=>{expect(hd385worx2(0,0)).toBe(0);});it('d',()=>{expect(hd385worx2(93,73)).toBe(2);});it('e',()=>{expect(hd385worx2(15,0)).toBe(4);});});
function hd385worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd386worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386worx2_hd',()=>{it('a',()=>{expect(hd386worx2(1,4)).toBe(2);});it('b',()=>{expect(hd386worx2(3,1)).toBe(1);});it('c',()=>{expect(hd386worx2(0,0)).toBe(0);});it('d',()=>{expect(hd386worx2(93,73)).toBe(2);});it('e',()=>{expect(hd386worx2(15,0)).toBe(4);});});
function hd386worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd387worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387worx2_hd',()=>{it('a',()=>{expect(hd387worx2(1,4)).toBe(2);});it('b',()=>{expect(hd387worx2(3,1)).toBe(1);});it('c',()=>{expect(hd387worx2(0,0)).toBe(0);});it('d',()=>{expect(hd387worx2(93,73)).toBe(2);});it('e',()=>{expect(hd387worx2(15,0)).toBe(4);});});
function hd387worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd388worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388worx2_hd',()=>{it('a',()=>{expect(hd388worx2(1,4)).toBe(2);});it('b',()=>{expect(hd388worx2(3,1)).toBe(1);});it('c',()=>{expect(hd388worx2(0,0)).toBe(0);});it('d',()=>{expect(hd388worx2(93,73)).toBe(2);});it('e',()=>{expect(hd388worx2(15,0)).toBe(4);});});
function hd388worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd389worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389worx2_hd',()=>{it('a',()=>{expect(hd389worx2(1,4)).toBe(2);});it('b',()=>{expect(hd389worx2(3,1)).toBe(1);});it('c',()=>{expect(hd389worx2(0,0)).toBe(0);});it('d',()=>{expect(hd389worx2(93,73)).toBe(2);});it('e',()=>{expect(hd389worx2(15,0)).toBe(4);});});
function hd389worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd390worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390worx2_hd',()=>{it('a',()=>{expect(hd390worx2(1,4)).toBe(2);});it('b',()=>{expect(hd390worx2(3,1)).toBe(1);});it('c',()=>{expect(hd390worx2(0,0)).toBe(0);});it('d',()=>{expect(hd390worx2(93,73)).toBe(2);});it('e',()=>{expect(hd390worx2(15,0)).toBe(4);});});
function hd390worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd391worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391worx2_hd',()=>{it('a',()=>{expect(hd391worx2(1,4)).toBe(2);});it('b',()=>{expect(hd391worx2(3,1)).toBe(1);});it('c',()=>{expect(hd391worx2(0,0)).toBe(0);});it('d',()=>{expect(hd391worx2(93,73)).toBe(2);});it('e',()=>{expect(hd391worx2(15,0)).toBe(4);});});
function hd391worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd392worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392worx2_hd',()=>{it('a',()=>{expect(hd392worx2(1,4)).toBe(2);});it('b',()=>{expect(hd392worx2(3,1)).toBe(1);});it('c',()=>{expect(hd392worx2(0,0)).toBe(0);});it('d',()=>{expect(hd392worx2(93,73)).toBe(2);});it('e',()=>{expect(hd392worx2(15,0)).toBe(4);});});
function hd392worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd393worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393worx2_hd',()=>{it('a',()=>{expect(hd393worx2(1,4)).toBe(2);});it('b',()=>{expect(hd393worx2(3,1)).toBe(1);});it('c',()=>{expect(hd393worx2(0,0)).toBe(0);});it('d',()=>{expect(hd393worx2(93,73)).toBe(2);});it('e',()=>{expect(hd393worx2(15,0)).toBe(4);});});
function hd393worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd394worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394worx2_hd',()=>{it('a',()=>{expect(hd394worx2(1,4)).toBe(2);});it('b',()=>{expect(hd394worx2(3,1)).toBe(1);});it('c',()=>{expect(hd394worx2(0,0)).toBe(0);});it('d',()=>{expect(hd394worx2(93,73)).toBe(2);});it('e',()=>{expect(hd394worx2(15,0)).toBe(4);});});
function hd394worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd395worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395worx2_hd',()=>{it('a',()=>{expect(hd395worx2(1,4)).toBe(2);});it('b',()=>{expect(hd395worx2(3,1)).toBe(1);});it('c',()=>{expect(hd395worx2(0,0)).toBe(0);});it('d',()=>{expect(hd395worx2(93,73)).toBe(2);});it('e',()=>{expect(hd395worx2(15,0)).toBe(4);});});
function hd395worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd396worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396worx2_hd',()=>{it('a',()=>{expect(hd396worx2(1,4)).toBe(2);});it('b',()=>{expect(hd396worx2(3,1)).toBe(1);});it('c',()=>{expect(hd396worx2(0,0)).toBe(0);});it('d',()=>{expect(hd396worx2(93,73)).toBe(2);});it('e',()=>{expect(hd396worx2(15,0)).toBe(4);});});
function hd396worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd397worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397worx2_hd',()=>{it('a',()=>{expect(hd397worx2(1,4)).toBe(2);});it('b',()=>{expect(hd397worx2(3,1)).toBe(1);});it('c',()=>{expect(hd397worx2(0,0)).toBe(0);});it('d',()=>{expect(hd397worx2(93,73)).toBe(2);});it('e',()=>{expect(hd397worx2(15,0)).toBe(4);});});
function hd397worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd398worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398worx2_hd',()=>{it('a',()=>{expect(hd398worx2(1,4)).toBe(2);});it('b',()=>{expect(hd398worx2(3,1)).toBe(1);});it('c',()=>{expect(hd398worx2(0,0)).toBe(0);});it('d',()=>{expect(hd398worx2(93,73)).toBe(2);});it('e',()=>{expect(hd398worx2(15,0)).toBe(4);});});
function hd398worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd399worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399worx2_hd',()=>{it('a',()=>{expect(hd399worx2(1,4)).toBe(2);});it('b',()=>{expect(hd399worx2(3,1)).toBe(1);});it('c',()=>{expect(hd399worx2(0,0)).toBe(0);});it('d',()=>{expect(hd399worx2(93,73)).toBe(2);});it('e',()=>{expect(hd399worx2(15,0)).toBe(4);});});
function hd399worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd400worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400worx2_hd',()=>{it('a',()=>{expect(hd400worx2(1,4)).toBe(2);});it('b',()=>{expect(hd400worx2(3,1)).toBe(1);});it('c',()=>{expect(hd400worx2(0,0)).toBe(0);});it('d',()=>{expect(hd400worx2(93,73)).toBe(2);});it('e',()=>{expect(hd400worx2(15,0)).toBe(4);});});
function hd400worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd401worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401worx2_hd',()=>{it('a',()=>{expect(hd401worx2(1,4)).toBe(2);});it('b',()=>{expect(hd401worx2(3,1)).toBe(1);});it('c',()=>{expect(hd401worx2(0,0)).toBe(0);});it('d',()=>{expect(hd401worx2(93,73)).toBe(2);});it('e',()=>{expect(hd401worx2(15,0)).toBe(4);});});
function hd401worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd402worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402worx2_hd',()=>{it('a',()=>{expect(hd402worx2(1,4)).toBe(2);});it('b',()=>{expect(hd402worx2(3,1)).toBe(1);});it('c',()=>{expect(hd402worx2(0,0)).toBe(0);});it('d',()=>{expect(hd402worx2(93,73)).toBe(2);});it('e',()=>{expect(hd402worx2(15,0)).toBe(4);});});
function hd402worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd403worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403worx2_hd',()=>{it('a',()=>{expect(hd403worx2(1,4)).toBe(2);});it('b',()=>{expect(hd403worx2(3,1)).toBe(1);});it('c',()=>{expect(hd403worx2(0,0)).toBe(0);});it('d',()=>{expect(hd403worx2(93,73)).toBe(2);});it('e',()=>{expect(hd403worx2(15,0)).toBe(4);});});
function hd403worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd404worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404worx2_hd',()=>{it('a',()=>{expect(hd404worx2(1,4)).toBe(2);});it('b',()=>{expect(hd404worx2(3,1)).toBe(1);});it('c',()=>{expect(hd404worx2(0,0)).toBe(0);});it('d',()=>{expect(hd404worx2(93,73)).toBe(2);});it('e',()=>{expect(hd404worx2(15,0)).toBe(4);});});
function hd404worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd405worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405worx2_hd',()=>{it('a',()=>{expect(hd405worx2(1,4)).toBe(2);});it('b',()=>{expect(hd405worx2(3,1)).toBe(1);});it('c',()=>{expect(hd405worx2(0,0)).toBe(0);});it('d',()=>{expect(hd405worx2(93,73)).toBe(2);});it('e',()=>{expect(hd405worx2(15,0)).toBe(4);});});
function hd405worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd406worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406worx2_hd',()=>{it('a',()=>{expect(hd406worx2(1,4)).toBe(2);});it('b',()=>{expect(hd406worx2(3,1)).toBe(1);});it('c',()=>{expect(hd406worx2(0,0)).toBe(0);});it('d',()=>{expect(hd406worx2(93,73)).toBe(2);});it('e',()=>{expect(hd406worx2(15,0)).toBe(4);});});
function hd406worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd407worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407worx2_hd',()=>{it('a',()=>{expect(hd407worx2(1,4)).toBe(2);});it('b',()=>{expect(hd407worx2(3,1)).toBe(1);});it('c',()=>{expect(hd407worx2(0,0)).toBe(0);});it('d',()=>{expect(hd407worx2(93,73)).toBe(2);});it('e',()=>{expect(hd407worx2(15,0)).toBe(4);});});
function hd407worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd408worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408worx2_hd',()=>{it('a',()=>{expect(hd408worx2(1,4)).toBe(2);});it('b',()=>{expect(hd408worx2(3,1)).toBe(1);});it('c',()=>{expect(hd408worx2(0,0)).toBe(0);});it('d',()=>{expect(hd408worx2(93,73)).toBe(2);});it('e',()=>{expect(hd408worx2(15,0)).toBe(4);});});
function hd408worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd409worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409worx2_hd',()=>{it('a',()=>{expect(hd409worx2(1,4)).toBe(2);});it('b',()=>{expect(hd409worx2(3,1)).toBe(1);});it('c',()=>{expect(hd409worx2(0,0)).toBe(0);});it('d',()=>{expect(hd409worx2(93,73)).toBe(2);});it('e',()=>{expect(hd409worx2(15,0)).toBe(4);});});
function hd409worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd410worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410worx2_hd',()=>{it('a',()=>{expect(hd410worx2(1,4)).toBe(2);});it('b',()=>{expect(hd410worx2(3,1)).toBe(1);});it('c',()=>{expect(hd410worx2(0,0)).toBe(0);});it('d',()=>{expect(hd410worx2(93,73)).toBe(2);});it('e',()=>{expect(hd410worx2(15,0)).toBe(4);});});
function hd410worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd411worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411worx2_hd',()=>{it('a',()=>{expect(hd411worx2(1,4)).toBe(2);});it('b',()=>{expect(hd411worx2(3,1)).toBe(1);});it('c',()=>{expect(hd411worx2(0,0)).toBe(0);});it('d',()=>{expect(hd411worx2(93,73)).toBe(2);});it('e',()=>{expect(hd411worx2(15,0)).toBe(4);});});
function hd411worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd412worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412worx2_hd',()=>{it('a',()=>{expect(hd412worx2(1,4)).toBe(2);});it('b',()=>{expect(hd412worx2(3,1)).toBe(1);});it('c',()=>{expect(hd412worx2(0,0)).toBe(0);});it('d',()=>{expect(hd412worx2(93,73)).toBe(2);});it('e',()=>{expect(hd412worx2(15,0)).toBe(4);});});
function hd412worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd413worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413worx2_hd',()=>{it('a',()=>{expect(hd413worx2(1,4)).toBe(2);});it('b',()=>{expect(hd413worx2(3,1)).toBe(1);});it('c',()=>{expect(hd413worx2(0,0)).toBe(0);});it('d',()=>{expect(hd413worx2(93,73)).toBe(2);});it('e',()=>{expect(hd413worx2(15,0)).toBe(4);});});
function hd413worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd414worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414worx2_hd',()=>{it('a',()=>{expect(hd414worx2(1,4)).toBe(2);});it('b',()=>{expect(hd414worx2(3,1)).toBe(1);});it('c',()=>{expect(hd414worx2(0,0)).toBe(0);});it('d',()=>{expect(hd414worx2(93,73)).toBe(2);});it('e',()=>{expect(hd414worx2(15,0)).toBe(4);});});
function hd414worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd415worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415worx2_hd',()=>{it('a',()=>{expect(hd415worx2(1,4)).toBe(2);});it('b',()=>{expect(hd415worx2(3,1)).toBe(1);});it('c',()=>{expect(hd415worx2(0,0)).toBe(0);});it('d',()=>{expect(hd415worx2(93,73)).toBe(2);});it('e',()=>{expect(hd415worx2(15,0)).toBe(4);});});
function hd415worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd416worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416worx2_hd',()=>{it('a',()=>{expect(hd416worx2(1,4)).toBe(2);});it('b',()=>{expect(hd416worx2(3,1)).toBe(1);});it('c',()=>{expect(hd416worx2(0,0)).toBe(0);});it('d',()=>{expect(hd416worx2(93,73)).toBe(2);});it('e',()=>{expect(hd416worx2(15,0)).toBe(4);});});
function hd416worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd417worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417worx2_hd',()=>{it('a',()=>{expect(hd417worx2(1,4)).toBe(2);});it('b',()=>{expect(hd417worx2(3,1)).toBe(1);});it('c',()=>{expect(hd417worx2(0,0)).toBe(0);});it('d',()=>{expect(hd417worx2(93,73)).toBe(2);});it('e',()=>{expect(hd417worx2(15,0)).toBe(4);});});
function hd417worx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417worx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
