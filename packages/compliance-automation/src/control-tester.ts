import { ControlDefinition, ControlStatus, ControlTestResult } from './types';

export class ControlTester {
  private readonly controls = new Map<string, ControlDefinition>();
  private readonly results = new Map<string, ControlTestResult[]>();

  registerControl(def: ControlDefinition): void {
    this.controls.set(def.id, def);
    if (!this.results.has(def.id)) this.results.set(def.id, []);
  }

  test(controlId: string, testedBy: string, status: ControlStatus, findings: string[] = [], score?: number): ControlTestResult {
    if (!this.controls.has(controlId)) throw new Error(`Control not found: ${controlId}`);
    const defaultScore = status === 'EFFECTIVE' ? 100
      : status === 'PARTIAL' ? 60
      : status === 'INEFFECTIVE' ? 20
      : 0;
    const result: ControlTestResult = {
      controlId,
      testedAt: new Date(),
      testedBy,
      status,
      findings,
      score: score ?? defaultScore,
    };
    const list = this.results.get(controlId)!;
    list.push(result);
    return result;
  }

  getLatest(controlId: string): ControlTestResult | undefined {
    const list = this.results.get(controlId);
    if (!list || list.length === 0) return undefined;
    return list[list.length - 1];
  }

  getHistory(controlId: string): ControlTestResult[] {
    return this.results.get(controlId) ?? [];
  }

  getByStatus(status: ControlStatus): ControlTestResult[] {
    const out: ControlTestResult[] = [];
    for (const list of this.results.values()) {
      if (list.length > 0) {
        const latest = list[list.length - 1];
        if (latest.status === status) out.push(latest);
      }
    }
    return out;
  }

  getByFramework(framework: string): ControlTestResult[] {
    const out: ControlTestResult[] = [];
    for (const [cid, def] of this.controls.entries()) {
      if (def.framework === framework) {
        const list = this.results.get(cid)!;
        if (list.length > 0) out.push(list[list.length - 1]);
      }
    }
    return out;
  }

  getControl(id: string): ControlDefinition | undefined {
    return this.controls.get(id);
  }

  getAllControls(): ControlDefinition[] {
    return Array.from(this.controls.values());
  }

  getControlCount(): number {
    return this.controls.size;
  }

  getAverageScore(framework?: string): number {
    const latest: ControlTestResult[] = [];
    for (const [cid, list] of this.results.entries()) {
      if (list.length === 0) continue;
      if (framework) {
        const def = this.controls.get(cid);
        if (!def || def.framework !== framework) continue;
      }
      latest.push(list[list.length - 1]);
    }
    if (latest.length === 0) return 0;
    return Math.round(latest.reduce((s, r) => s + r.score, 0) / latest.length);
  }

  getUntestedControls(): ControlDefinition[] {
    const out: ControlDefinition[] = [];
    for (const [cid, def] of this.controls.entries()) {
      const list = this.results.get(cid)!;
      if (list.length === 0) out.push(def);
    }
    return out;
  }

  getFailingControls(): ControlTestResult[] {
    const out: ControlTestResult[] = [];
    for (const list of this.results.values()) {
      if (list.length > 0) {
        const latest = list[list.length - 1];
        if (latest.status === 'INEFFECTIVE') out.push(latest);
      }
    }
    return out;
  }
}
