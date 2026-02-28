import { BCPTest, TestType, TestResult } from './types';

let _testSeq = 0;

export class BCPTester {
  private readonly tests = new Map<string, BCPTest>();

  schedule(planId: string, testType: TestType, scheduledDate: Date): BCPTest {
    const id = `bcpt-${++_testSeq}`;
    const test: BCPTest = { id, planId, testType, scheduledDate, gaps: [] };
    this.tests.set(id, test);
    return test;
  }

  recordResult(id: string, result: TestResult, opts: {
    rtoActualMinutes?: number;
    rpoActualMinutes?: number;
    notes?: string;
    gaps?: string[];
  } = {}): BCPTest {
    const t = this.tests.get(id);
    if (!t) throw new Error(`Test not found: ${id}`);
    const updated: BCPTest = {
      ...t,
      result,
      conductedDate: new Date(),
      rtoActualMinutes: opts.rtoActualMinutes,
      rpoActualMinutes: opts.rpoActualMinutes,
      notes: opts.notes,
      gaps: opts.gaps ?? [],
    };
    this.tests.set(id, updated);
    return updated;
  }

  get(id: string): BCPTest | undefined { return this.tests.get(id); }
  getAll(): BCPTest[] { return Array.from(this.tests.values()); }
  getByPlan(planId: string): BCPTest[] { return Array.from(this.tests.values()).filter(t => t.planId === planId); }
  getByResult(result: TestResult): BCPTest[] { return Array.from(this.tests.values()).filter(t => t.result === result); }
  getByType(testType: TestType): BCPTest[] { return Array.from(this.tests.values()).filter(t => t.testType === testType); }
  getPending(): BCPTest[] { return Array.from(this.tests.values()).filter(t => !t.conductedDate); }
  getCompleted(): BCPTest[] { return Array.from(this.tests.values()).filter(t => !!t.conductedDate); }
  getCount(): number { return this.tests.size; }
  getPassRate(): number {
    const completed = this.getCompleted();
    if (completed.length === 0) return 0;
    const passed = completed.filter(t => t.result === 'PASS').length;
    return Math.round((passed / completed.length) * 100);
  }
  getTestsWithGaps(): BCPTest[] { return Array.from(this.tests.values()).filter(t => t.gaps.length > 0); }
}
