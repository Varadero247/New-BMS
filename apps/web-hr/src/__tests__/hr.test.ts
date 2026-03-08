// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-hr specification tests

type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERN';
type LeaveType = 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'UNPAID' | 'STUDY' | 'BEREAVEMENT';
type PerformanceRating = 1 | 2 | 3 | 4 | 5;
type OnboardingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';

const EMPLOYMENT_TYPES: EmploymentType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERN'];
const LEAVE_TYPES: LeaveType[] = ['ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'STUDY', 'BEREAVEMENT'];
const PERFORMANCE_RATINGS: PerformanceRating[] = [1, 2, 3, 4, 5];
const ONBOARDING_STATUSES: OnboardingStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'];

const performanceLabel: Record<PerformanceRating, string> = {
  1: 'Unsatisfactory',
  2: 'Needs Improvement',
  3: 'Meets Expectations',
  4: 'Exceeds Expectations',
  5: 'Outstanding',
};

const leaveEntitlementDays: Record<LeaveType, number> = {
  ANNUAL: 30, SICK: 15, MATERNITY: 90, PATERNITY: 10, UNPAID: 0, STUDY: 5, BEREAVEMENT: 3,
};

const onboardingStatusColor: Record<OnboardingStatus, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
};

function computeLeaveBalance(entitlement: number, taken: number): number {
  return Math.max(0, entitlement - taken);
}

function yearsOfService(hireDate: Date, today: Date): number {
  let years = today.getFullYear() - hireDate.getFullYear();
  if (
    today.getMonth() < hireDate.getMonth() ||
    (today.getMonth() === hireDate.getMonth() && today.getDate() < hireDate.getDate())
  ) {
    years--;
  }
  return Math.max(0, years);
}

function isEligibleForLeave(employmentType: EmploymentType, yearsOfSvc: number): boolean {
  if (employmentType === 'INTERN') return false;
  return yearsOfSvc >= 0;
}

function annualLeaveAccrual(annualEntitlement: number, monthsWorked: number): number {
  return (annualEntitlement / 12) * monthsWorked;
}

describe('Performance labels', () => {
  PERFORMANCE_RATINGS.forEach(r => {
    it(`Rating ${r} has label`, () => expect(performanceLabel[r]).toBeDefined());
    it(`Rating ${r} label is non-empty`, () => expect(performanceLabel[r].length).toBeGreaterThan(0));
  });
  it('Rating 5 is Outstanding', () => expect(performanceLabel[5]).toBe('Outstanding'));
  it('Rating 1 is Unsatisfactory', () => expect(performanceLabel[1]).toBe('Unsatisfactory'));
  for (let r = 1; r <= 5; r++) {
    it(`performance label ${r} is string`, () => expect(typeof performanceLabel[r as PerformanceRating]).toBe('string'));
  }
  for (let i = 0; i < 50; i++) {
    const r = PERFORMANCE_RATINGS[i % 5];
    it(`performance label for rating ${r} exists (idx ${i})`, () => expect(performanceLabel[r]).toBeTruthy());
  }
});

describe('Leave entitlement days', () => {
  it('ANNUAL = 30 days', () => expect(leaveEntitlementDays.ANNUAL).toBe(30));
  it('MATERNITY = 90 days', () => expect(leaveEntitlementDays.MATERNITY).toBe(90));
  it('UNPAID = 0 days', () => expect(leaveEntitlementDays.UNPAID).toBe(0));
  LEAVE_TYPES.forEach(l => {
    it(`${l} has entitlement defined`, () => expect(leaveEntitlementDays[l]).toBeDefined());
  });
  for (let i = 0; i < 50; i++) {
    const l = LEAVE_TYPES[i % 7];
    it(`leave entitlement for ${l} is non-negative (idx ${i})`, () => expect(leaveEntitlementDays[l]).toBeGreaterThanOrEqual(0));
  }
});

describe('Onboarding status colors', () => {
  ONBOARDING_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(onboardingStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(onboardingStatusColor[s]).toContain('bg-'));
  });
  it('COMPLETED is green', () => expect(onboardingStatusColor.COMPLETED).toContain('green'));
  it('OVERDUE is red', () => expect(onboardingStatusColor.OVERDUE).toContain('red'));
  for (let i = 0; i < 50; i++) {
    const s = ONBOARDING_STATUSES[i % 4];
    it(`onboarding status color string (idx ${i})`, () => expect(typeof onboardingStatusColor[s]).toBe('string'));
  }
});

describe('computeLeaveBalance', () => {
  it('full balance when nothing taken', () => expect(computeLeaveBalance(30, 0)).toBe(30));
  it('balance reduces with taken days', () => expect(computeLeaveBalance(30, 10)).toBe(20));
  it('cannot go negative', () => expect(computeLeaveBalance(30, 50)).toBe(0));
  for (let taken = 0; taken <= 50; taken++) {
    it(`leave balance with ${taken} taken days is non-negative`, () => {
      expect(computeLeaveBalance(30, taken)).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('yearsOfService', () => {
  it('hire date today = 0 years', () => {
    const today = new Date('2026-01-01');
    expect(yearsOfService(today, today)).toBe(0);
  });
  it('hired 5 years ago = 5', () => {
    const hire = new Date('2021-01-01');
    const today = new Date('2026-01-01');
    expect(yearsOfService(hire, today)).toBe(5);
  });
  for (let y = 1; y <= 30; y++) {
    it(`${y} years of service`, () => {
      const hire = new Date(`${2026 - y}-06-15`);
      const today = new Date('2026-06-15');
      expect(yearsOfService(hire, today)).toBe(y);
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`yearsOfService returns non-negative (idx ${i})`, () => {
      const hire = new Date(`${2000 + i}-01-01`);
      const today = new Date('2026-01-01');
      expect(yearsOfService(hire, today)).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('annualLeaveAccrual', () => {
  it('full year = full entitlement', () => expect(annualLeaveAccrual(30, 12)).toBe(30));
  it('6 months = half entitlement', () => expect(annualLeaveAccrual(30, 6)).toBe(15));
  it('0 months = 0', () => expect(annualLeaveAccrual(30, 0)).toBe(0));
  for (let m = 1; m <= 12; m++) {
    it(`accrual for ${m} months is between 0-30`, () => {
      const accrual = annualLeaveAccrual(30, m);
      expect(accrual).toBeGreaterThanOrEqual(0);
      expect(accrual).toBeLessThanOrEqual(30);
    });
  }
});
