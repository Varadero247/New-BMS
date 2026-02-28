import {
  EnergyType,
  MeterUnit,
  BaselineStatus,
  PerformanceStatus,
  EnergyBaseline,
} from './types';

export interface BaselineComparison {
  baselineValue: number;
  currentValue: number;
  difference: number;
  percentageChange: number;
  status: PerformanceStatus;
}

let _baselineCounter = 0;

function generateBaselineId(): string {
  _baselineCounter += 1;
  return `BL-${Date.now()}-${_baselineCounter}`;
}

export class BaselineManager {
  private baselines: Map<string, EnergyBaseline> = new Map();

  create(
    name: string,
    energyType: EnergyType,
    baselineYear: number,
    baselineValue: number,
    unit: MeterUnit,
    createdBy: string,
    createdAt: string,
    notes?: string,
  ): EnergyBaseline {
    const id = generateBaselineId();
    const baseline: EnergyBaseline = {
      id,
      name,
      energyType,
      status: 'DRAFT',
      baselineYear,
      baselineValue,
      unit,
      createdBy,
      createdAt,
      notes,
    };
    this.baselines.set(id, baseline);
    return baseline;
  }

  approve(id: string, approvedBy: string): boolean {
    const baseline = this.baselines.get(id);
    if (!baseline) return false;
    baseline.status = 'APPROVED';
    baseline.approvedBy = approvedBy;
    return true;
  }

  supersede(id: string): boolean {
    const baseline = this.baselines.get(id);
    if (!baseline) return false;
    baseline.status = 'SUPERSEDED';
    return true;
  }

  get(id: string): EnergyBaseline | undefined {
    return this.baselines.get(id);
  }

  getAll(): EnergyBaseline[] {
    return Array.from(this.baselines.values());
  }

  getByEnergyType(type: EnergyType): EnergyBaseline[] {
    return Array.from(this.baselines.values()).filter((b) => b.energyType === type);
  }

  getByStatus(status: BaselineStatus): EnergyBaseline[] {
    return Array.from(this.baselines.values()).filter((b) => b.status === status);
  }

  getApproved(): EnergyBaseline[] {
    return this.getByStatus('APPROVED');
  }

  compareToBaseline(baselineId: string, currentValue: number): BaselineComparison | null {
    const baseline = this.baselines.get(baselineId);
    if (!baseline) return null;

    const difference = currentValue - baseline.baselineValue;
    const percentageChange =
      baseline.baselineValue !== 0
        ? (difference / baseline.baselineValue) * 100
        : 0;

    let status: PerformanceStatus;
    if (currentValue < baseline.baselineValue) {
      status = 'IMPROVEMENT';
    } else if (currentValue === baseline.baselineValue) {
      status = 'NO_CHANGE';
    } else {
      status = 'DETERIORATION';
    }

    return {
      baselineValue: baseline.baselineValue,
      currentValue,
      difference,
      percentageChange,
      status,
    };
  }

  getCount(): number {
    return this.baselines.size;
  }
}
