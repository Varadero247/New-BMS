import { DriftConfig, DriftMetrics, DriftAlert } from './types';

export { DriftMetrics, DriftAlert };

export class ModelDriftMonitor {
  private readonly config: DriftConfig;
  private readonly samples: number[] = [];
  private readonly alerts: DriftAlert[] = [];
  private baseline: DriftMetrics | null = null;

  constructor(config: Partial<DriftConfig> = {}) {
    this.config = {
      baselineWindow: config.baselineWindow ?? 100,
      alertThreshold: config.alertThreshold ?? 0.1,
      criticalThreshold: config.criticalThreshold ?? 0.25,
      minSamples: config.minSamples ?? 30,
    };
  }

  addSample(confidenceScore: number): void {
    if (confidenceScore < 0 || confidenceScore > 1) return;
    this.samples.push(confidenceScore);
    if (this.samples.length >= this.config.minSamples && !this.baseline) {
      this.baseline = this.computeMetrics(this.samples.slice(0, this.config.baselineWindow));
    }
    if (this.baseline && this.samples.length >= this.config.minSamples) {
      this.detectDrift();
    }
  }

  computeMetrics(data: number[]): DriftMetrics {
    if (data.length === 0) return { mean: 0, stdDev: 0, min: 0, max: 0, sampleCount: 0, upperControlLimit: 1, lowerControlLimit: 0 };
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    return {
      mean, stdDev,
      min: Math.min(...data),
      max: Math.max(...data),
      sampleCount: data.length,
      upperControlLimit: Math.min(1, mean + 3 * stdDev),
      lowerControlLimit: Math.max(0, mean - 3 * stdDev),
    };
  }

  private detectDrift(): void {
    if (!this.baseline) return;
    const recent = this.samples.slice(-this.config.baselineWindow);
    const current = this.computeMetrics(recent);
    const deviationPercent = Math.abs(current.mean - this.baseline.mean) / (this.baseline.mean || 1);

    if (deviationPercent >= this.config.criticalThreshold) {
      this.alerts.push({
        type: 'DRIFT_DETECTED', severity: 'CRITICAL', metric: 'confidence_score',
        currentValue: current.mean, baselineValue: this.baseline.mean, deviationPercent,
        message: `Critical drift: ${(deviationPercent * 100).toFixed(1)}% deviation from baseline`,
        timestamp: new Date(),
      });
    } else if (deviationPercent >= this.config.alertThreshold) {
      this.alerts.push({
        type: 'DRIFT_DETECTED',
        severity: deviationPercent > this.config.alertThreshold * 2 ? 'HIGH' : 'MEDIUM',
        metric: 'confidence_score',
        currentValue: current.mean, baselineValue: this.baseline.mean, deviationPercent,
        message: `Drift detected: ${(deviationPercent * 100).toFixed(1)}% deviation`,
        timestamp: new Date(),
      });
    }
  }

  getCurrentMetrics(): DriftMetrics | null {
    if (this.samples.length < this.config.minSamples) return null;
    return this.computeMetrics(this.samples.slice(-this.config.baselineWindow));
  }

  getBaseline(): DriftMetrics | null { return this.baseline; }
  getAlerts(severity?: DriftAlert['severity']): DriftAlert[] {
    if (!severity) return [...this.alerts];
    return this.alerts.filter(a => a.severity === severity);
  }
  hasDrift(): boolean { return this.alerts.length > 0; }
  getSampleCount(): number { return this.samples.length; }
  reset(): void { this.samples.length = 0; this.alerts.length = 0; this.baseline = null; }
}
