import { ApprovalDecision, ApprovalFlow, ApprovalStatus, ApprovalStep, Approver, FlowSummary, StepType } from './types';

export function createApprover(id: string, name: string, email: string, role?: string): Approver {
  return { id, name, email, ...(role ? { role } : {}) };
}

export function createStep(id: string, name: string, order: number, type: StepType, approvers: Approver[]): ApprovalStep {
  return { id, name, order, type, approvers, status: 'pending', decisions: [] };
}

export function createFlow(id: string, name: string, entityId: string, entityType: string, steps: ApprovalStep[], requestedBy: string): ApprovalFlow {
  return { id, name, entityId, entityType, steps, currentStepIndex: 0, status: 'pending', requestedBy, requestedAt: Date.now() };
}

export function getCurrentStep(flow: ApprovalFlow): ApprovalStep | undefined {
  return flow.steps[flow.currentStepIndex];
}

export function isStepComplete(step: ApprovalStep): boolean {
  if (step.status === 'approved' || step.status === 'rejected') return true;
  if (step.decisions.some(d => d.status === 'rejected')) return true;
  if (step.type === 'any_one') return step.decisions.some(d => d.status === 'approved');
  if (step.type === 'parallel') return step.decisions.filter(d => d.status === 'approved').length >= step.approvers.length;
  // sequential: first approver decides
  return step.decisions.length > 0;
}

export function computeStepStatus(step: ApprovalStep): ApprovalStatus {
  if (step.decisions.some(d => d.status === 'rejected')) return 'rejected';
  if (step.type === 'any_one' && step.decisions.some(d => d.status === 'approved')) return 'approved';
  if (step.type === 'parallel' && step.decisions.filter(d => d.status === 'approved').length >= step.approvers.length) return 'approved';
  if (step.type === 'sequential' && step.decisions.length > 0) return step.decisions[0].status;
  return 'pending';
}

export function addDecision(flow: ApprovalFlow, stepId: string, decision: ApprovalDecision): ApprovalFlow {
  const steps = flow.steps.map(step => {
    if (step.id !== stepId) return step;
    const decisions = [...step.decisions, decision];
    const updatedStep = { ...step, decisions };
    return { ...updatedStep, status: computeStepStatus(updatedStep) };
  });
  const updatedFlow = { ...flow, steps };
  return advanceFlow(updatedFlow);
}

export function advanceFlow(flow: ApprovalFlow): ApprovalFlow {
  const currentStep = flow.steps[flow.currentStepIndex];
  if (!currentStep) return { ...flow, status: 'approved', completedAt: Date.now() };

  const stepStatus = computeStepStatus(currentStep);
  if (stepStatus === 'rejected') return { ...flow, status: 'rejected', completedAt: Date.now() };

  if (stepStatus === 'approved') {
    const nextIndex = flow.currentStepIndex + 1;
    if (nextIndex >= flow.steps.length) {
      return { ...flow, currentStepIndex: nextIndex, status: 'approved', completedAt: Date.now() };
    }
    return { ...flow, currentStepIndex: nextIndex, status: 'pending' };
  }

  return flow;
}

export function withdrawFlow(flow: ApprovalFlow): ApprovalFlow {
  return { ...flow, status: 'withdrawn', completedAt: Date.now() };
}

export function getFlowSummary(flow: ApprovalFlow): FlowSummary {
  const completedSteps = flow.steps.filter(s => s.status === 'approved' || s.status === 'rejected').length;
  const pendingSteps = flow.steps.filter(s => s.status === 'pending').length;
  const isComplete = flow.status !== 'pending';
  const isFinallyApproved = flow.status === 'approved';
  const isFinallyRejected = flow.status === 'rejected';
  const currentStep = flow.steps[flow.currentStepIndex];
  return { totalSteps: flow.steps.length, completedSteps, pendingSteps, currentStep, isComplete, isFinallyApproved, isFinallyRejected };
}

export function canApprove(flow: ApprovalFlow, approverId: string): boolean {
  if (flow.status !== 'pending') return false;
  const step = getCurrentStep(flow);
  if (!step || step.status !== 'pending') return false;
  return step.approvers.some(a => a.id === approverId || a.delegateTo === approverId);
}

export function hasApproved(flow: ApprovalFlow, stepId: string, approverId: string): boolean {
  const step = flow.steps.find(s => s.id === stepId);
  if (!step) return false;
  return step.decisions.some(d => d.approverId === approverId);
}

export function isValidStatus(s: string): s is ApprovalStatus {
  return ['pending', 'approved', 'rejected', 'escalated', 'withdrawn', 'expired'].includes(s);
}

export function isValidStepType(t: string): t is StepType {
  return ['sequential', 'parallel', 'any_one'].includes(t);
}

export function makeDecision(approverId: string, approverName: string, status: 'approved' | 'rejected', comment?: string): ApprovalDecision {
  return { approverId, approverName, status, decidedAt: Date.now(), ...(comment ? { comment } : {}) };
}

export function sortStepsByOrder(steps: ApprovalStep[]): ApprovalStep[] {
  return [...steps].sort((a, b) => a.order - b.order);
}

export function getPendingApprovers(flow: ApprovalFlow): Approver[] {
  const step = getCurrentStep(flow);
  if (!step || step.status !== 'pending') return [];
  const decided = new Set(step.decisions.map(d => d.approverId));
  return step.approvers.filter(a => !decided.has(a.id));
}
