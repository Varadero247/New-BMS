import { KpiDataPoint, KpiDefinition, KpiDashboard, KpiDirection, KpiFrequency, KpiResult, KpiStatus, KpiTarget, TrendDirection } from "./types";

export function computeVariance(current: number, target: number): number {
  return current - target;
}

export function computeVariancePct(current: number, target: number): number {
  if (target === 0) return 0;
  return ((current - target) / Math.abs(target)) * 100;
}

export function computeStatus(current: number, target: KpiTarget, direction: KpiDirection): KpiStatus {
  const tolerance = target.tolerance ?? 5;
  const variancePct = computeVariancePct(current, target.value);

  if (direction === "higher_better") {
    if (current >= target.value) return variancePct > 10 ? "exceeded" : "on_track";
    return Math.abs(variancePct) <= tolerance ? "at_risk" : "off_track";
  } else if (direction === "lower_better") {
    if (current <= target.value) return "on_track";
    return Math.abs(variancePct) <= tolerance ? "at_risk" : "off_track";
  } else {
    if (Math.abs(variancePct) <= tolerance) return "on_track";
    if (Math.abs(variancePct) <= tolerance * 2) return "at_risk";
    return "off_track";
  }
}

export function computePerformance(current: number, target: number, direction: KpiDirection): number {
  if (target === 0) return 100;
  if (direction === "higher_better") {
    return Math.min(100, Math.max(0, (current / target) * 100));
  } else if (direction === "lower_better") {
    if (current <= 0) return 100;
    return Math.min(100, Math.max(0, (target / current) * 100));
  } else {
    const variancePct = Math.abs(computeVariancePct(current, target));
    return Math.min(100, Math.max(0, 100 - variancePct));
  }
}

export function computeTrend(points: KpiDataPoint[]): TrendDirection {
  if (points.length < 2) return "stable";
  const sorted = [...points].sort((a, b) => a.timestamp - b.timestamp);
  const recent = sorted[sorted.length - 1].value;
  const prev = sorted[sorted.length - 2].value;
  const diffPct = ((recent - prev) / Math.abs(prev || 1)) * 100;
  if (Math.abs(diffPct) < 1) return "stable";
  return recent > prev ? "up" : "down";
}

export function evaluateKpi(kpi: KpiDefinition, points: KpiDataPoint[]): KpiResult {
  if (points.length === 0) {
    return {
      kpiId: kpi.id,
      current: 0,
      target: kpi.target.value,
      variance: -kpi.target.value,
      variancePct: -100,
      status: "off_track",
      trend: "stable",
      performance: 0,
    };
  }
  const sorted = [...points].sort((a, b) => b.timestamp - a.timestamp);
  const current = sorted[0].value;
  const variance = computeVariance(current, kpi.target.value);
  const variancePct = computeVariancePct(current, kpi.target.value);
  const status = computeStatus(current, kpi.target, kpi.direction);
  const trend = computeTrend(points);
  const performance = computePerformance(current, kpi.target.value, kpi.direction);
  return { kpiId: kpi.id, current, target: kpi.target.value, variance, variancePct, status, trend, performance };
}

export function buildDashboard(kpis: KpiDefinition[], pointsMap: Record<string, KpiDataPoint[]>): KpiDashboard {
  const results = kpis.map(k => evaluateKpi(k, pointsMap[k.id] ?? []));
  const overall = results.length > 0 ? results.reduce((s, r) => s + r.performance, 0) / results.length : 0;
  return {
    kpis: results,
    overall,
    onTrackCount: results.filter(r => r.status === "on_track" || r.status === "exceeded").length,
    atRiskCount: results.filter(r => r.status === "at_risk").length,
    offTrackCount: results.filter(r => r.status === "off_track").length,
  };
}

export function latestValue(points: KpiDataPoint[]): number | null {
  if (points.length === 0) return null;
  return [...points].sort((a, b) => b.timestamp - a.timestamp)[0].value;
}

export function averageValue(points: KpiDataPoint[]): number {
  if (points.length === 0) return 0;
  return points.reduce((s, p) => s + p.value, 0) / points.length;
}

export function minValue(points: KpiDataPoint[]): number | null {
  if (points.length === 0) return null;
  return Math.min(...points.map(p => p.value));
}

export function maxValue(points: KpiDataPoint[]): number | null {
  if (points.length === 0) return null;
  return Math.max(...points.map(p => p.value));
}

export function isValidDirection(d: string): d is KpiDirection {
  return ["higher_better", "lower_better", "target"].includes(d);
}

export function isValidStatus(s: string): s is KpiStatus {
  return ["on_track", "at_risk", "off_track", "exceeded"].includes(s);
}

export function isValidFrequency(f: string): f is KpiFrequency {
  return ["daily", "weekly", "monthly", "quarterly", "annual"].includes(f);
}

export function makeKpi(id: string, name: string, direction: KpiDirection, targetValue: number, unit = "%", frequency: KpiFrequency = "monthly"): KpiDefinition {
  return { id, name, unit, direction, target: { value: targetValue }, frequency };
}

export function makePoint(value: number, timestamp = Date.now()): KpiDataPoint {
  return { value, timestamp };
}

export function clampPerformance(p: number): number {
  return Math.max(0, Math.min(100, p));
}
