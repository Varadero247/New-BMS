import {
  DataPoint,
  PlottedPoint,
  ControlChart,
  OutOfControlPoint,
  CapabilityResult,
  Violation,
  PChartDataPoint,
} from './types';
import { SPC_CONSTANTS } from './constants';

// ============================================
// Helper functions
// ============================================

/** Calculate the arithmetic mean of an array of numbers. */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Calculate the range (max - min) of an array of numbers. */
function range(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values) - Math.min(...values);
}

/** Calculate the population standard deviation of an array of numbers. */
function stdDev(values: number[]): number {
  if (values.length <= 1) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map((v) => (v - avg) ** 2);
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1));
}

/**
 * Group data points into subgroups of the specified size.
 * Incomplete trailing subgroups are discarded.
 */
function groupIntoSubgroups(data: DataPoint[], subgroupSize: number): DataPoint[][] {
  const groups: DataPoint[][] = [];
  for (let i = 0; i + subgroupSize <= data.length; i += subgroupSize) {
    groups.push(data.slice(i, i + subgroupSize));
  }
  return groups;
}

/**
 * Create a PlottedPoint from raw values.
 */
function createPlottedPoint(
  value: number,
  timestamp: Date,
  index: number,
  ucl: number,
  lcl: number,
  subgroup?: number
): PlottedPoint {
  const outOfControl = value > ucl || value < lcl;
  const violationRules: string[] = [];
  if (value > ucl) violationRules.push('Above UCL');
  if (value < lcl) violationRules.push('Below LCL');

  return {
    value,
    timestamp,
    subgroup,
    index,
    outOfControl,
    violationRules,
  };
}

// ============================================
// X-bar and R Chart
// ============================================

/**
 * Compute an X-bar and R control chart.
 *
 * Groups the data into subgroups of `subgroupSize`, computes the mean (X-bar)
 * and range (R) for each subgroup, then calculates the control limits using
 * the standard A2, D3, D4 constants.
 *
 * @param data - Array of individual data points (sorted by time/order)
 * @param subgroupSize - Number of observations per subgroup (2-10)
 * @returns ControlChart with both X-bar and R chart information
 */
export function xbarRChart(data: DataPoint[], subgroupSize: number): ControlChart {
  if (subgroupSize < 2 || subgroupSize > 10) {
    throw new Error('Subgroup size must be between 2 and 10');
  }

  const constants = SPC_CONSTANTS[subgroupSize];
  if (!constants) {
    throw new Error(`No SPC constants available for subgroup size ${subgroupSize}`);
  }

  const subgroups = groupIntoSubgroups(data, subgroupSize);
  if (subgroups.length < 2) {
    throw new Error('Need at least 2 complete subgroups to compute control limits');
  }

  // Calculate X-bar and R for each subgroup
  const xBars: number[] = [];
  const ranges: number[] = [];
  const timestamps: Date[] = [];

  for (const sg of subgroups) {
    const values = sg.map((d) => d.value);
    xBars.push(mean(values));
    ranges.push(range(values));
    timestamps.push(sg[sg.length - 1].timestamp); // use last point's timestamp
  }

  // Grand averages
  const xBarBar = mean(xBars);
  const rBar = mean(ranges);

  // X-bar control limits
  const uclXbar = xBarBar + constants.A2 * rBar;
  const lclXbar = xBarBar - constants.A2 * rBar;

  // R control limits
  const uclR = constants.D4 * rBar;
  const lclR = constants.D3 * rBar;

  // Build X-bar plotted points
  const xbarPoints: PlottedPoint[] = xBars.map((xb, i) =>
    createPlottedPoint(xb, timestamps[i], i, uclXbar, lclXbar, i + 1)
  );

  // Build R plotted points
  const rangePointsList: PlottedPoint[] = ranges.map((r, i) =>
    createPlottedPoint(r, timestamps[i], i, uclR, lclR, i + 1)
  );

  // Collect out-of-control points from X-bar chart
  const oocPoints: OutOfControlPoint[] = xbarPoints
    .filter((p) => p.outOfControl)
    .map((p) => ({
      index: p.index,
      value: p.value,
      rules: p.violationRules,
    }));

  // Also flag out-of-control range points
  const oocRangePoints: OutOfControlPoint[] = rangePointsList
    .filter((p) => p.outOfControl)
    .map((p) => ({
      index: p.index,
      value: p.value,
      rules: p.violationRules.map((r) => `Range: ${r}`),
    }));

  return {
    type: 'XBAR_R',
    ucl: uclXbar,
    lcl: lclXbar,
    centerLine: xBarBar,
    dataPoints: xbarPoints,
    outOfControl: [...oocPoints, ...oocRangePoints],
    rangeUcl: uclR,
    rangeLcl: lclR,
    rangeCenterLine: rBar,
    rangePoints: rangePointsList,
  };
}

// ============================================
// Individuals and Moving Range (I-MR) Chart
// ============================================

/**
 * Compute an Individuals and Moving Range (I-MR) control chart.
 *
 * Uses individual observations and the moving range between consecutive
 * observations to estimate process variation.
 *
 * @param data - Array of individual data points (sorted by time/order)
 * @returns ControlChart with both Individuals and MR chart information
 */
export function iMrChart(data: DataPoint[]): ControlChart {
  if (data.length < 2) {
    throw new Error('Need at least 2 data points for I-MR chart');
  }

  const values = data.map((d) => d.value);
  const timestamps = data.map((d) => d.timestamp);

  // Moving ranges: |Xi - Xi-1|
  const movingRanges: number[] = [];
  for (let i = 1; i < values.length; i++) {
    movingRanges.push(Math.abs(values[i] - values[i - 1]));
  }

  // Center lines
  const xBar = mean(values);
  const mrBar = mean(movingRanges);

  // Individuals control limits (E2 = 2.66 for n=2 moving range)
  const uclIndividuals = xBar + 2.66 * mrBar;
  const lclIndividuals = xBar - 2.66 * mrBar;

  // Moving Range control limits (D4 for n=2 = 3.267, D3 = 0)
  const uclMR = 3.267 * mrBar;
  const lclMR = 0; // D3 for n=2 is 0

  // Build individual plotted points
  const individualPoints: PlottedPoint[] = values.map((v, i) =>
    createPlottedPoint(v, timestamps[i], i, uclIndividuals, lclIndividuals)
  );

  // Build MR plotted points (one fewer than individuals)
  const mrPoints: PlottedPoint[] = movingRanges.map((mr, i) =>
    createPlottedPoint(mr, timestamps[i + 1], i, uclMR, lclMR)
  );

  // Collect out-of-control points
  const oocIndividuals: OutOfControlPoint[] = individualPoints
    .filter((p) => p.outOfControl)
    .map((p) => ({
      index: p.index,
      value: p.value,
      rules: p.violationRules,
    }));

  const oocMR: OutOfControlPoint[] = mrPoints
    .filter((p) => p.outOfControl)
    .map((p) => ({
      index: p.index,
      value: p.value,
      rules: p.violationRules.map((r) => `MR: ${r}`),
    }));

  return {
    type: 'IMR',
    ucl: uclIndividuals,
    lcl: lclIndividuals,
    centerLine: xBar,
    dataPoints: individualPoints,
    outOfControl: [...oocIndividuals, ...oocMR],
    rangeUcl: uclMR,
    rangeLcl: lclMR,
    rangeCenterLine: mrBar,
    rangePoints: mrPoints,
  };
}

// ============================================
// P Chart (Proportion Defective)
// ============================================

/**
 * Compute a p (proportion defective) control chart.
 *
 * For each sample, p = defectives / sampleSize. The average proportion (p-bar)
 * and 3-sigma limits are computed. Limits can vary per sample if sample sizes differ,
 * but this implementation uses the average sample size for simplified limits.
 *
 * @param data - Array of sample data with defectives count and sample size
 * @returns ControlChart with p-chart information
 */
export function pChart(data: PChartDataPoint[]): ControlChart {
  if (data.length < 2) {
    throw new Error('Need at least 2 samples for p chart');
  }

  // Validate data
  for (let i = 0; i < data.length; i++) {
    if (data[i].sampleSize <= 0) {
      throw new Error(`Sample size must be positive at index ${i}`);
    }
    if (data[i].defectives < 0 || data[i].defectives > data[i].sampleSize) {
      throw new Error(`Defectives must be between 0 and sample size at index ${i}`);
    }
  }

  // Calculate p for each sample
  const proportions = data.map((d) => d.defectives / d.sampleSize);

  // p-bar = total defectives / total inspected
  const totalDefectives = data.reduce((sum, d) => sum + d.defectives, 0);
  const totalInspected = data.reduce((sum, d) => sum + d.sampleSize, 0);
  const pBar = totalDefectives / totalInspected;

  // Average sample size for control limits
  const avgN = totalInspected / data.length;

  // Control limits using average sample size
  const sigma = Math.sqrt((pBar * (1 - pBar)) / avgN);
  const ucl = pBar + 3 * sigma;
  const lcl = Math.max(0, pBar - 3 * sigma);

  // Build plotted points
  const points: PlottedPoint[] = proportions.map((p, i) =>
    createPlottedPoint(p, data[i].timestamp, i, ucl, lcl)
  );

  // Collect out-of-control points
  const oocPoints: OutOfControlPoint[] = points
    .filter((p) => p.outOfControl)
    .map((p) => ({
      index: p.index,
      value: p.value,
      rules: p.violationRules,
    }));

  return {
    type: 'P',
    ucl,
    lcl,
    centerLine: pBar,
    dataPoints: points,
    outOfControl: oocPoints,
  };
}

// ============================================
// Process Capability: Cpk
// ============================================

/**
 * Calculate process capability indices (Cp, Cpk) using within-subgroup variation.
 *
 * Cp measures the spread of the process relative to the specification width.
 * Cpk measures how centered the process is within the specification limits.
 *
 * sigma_within is estimated from the overall standard deviation of the data
 * when subgroup information is not available. For a more precise estimate,
 * use R-bar/d2 from an X-bar R chart.
 *
 * @param data - Array of individual measurement values
 * @param usl - Upper specification limit
 * @param lsl - Lower specification limit
 * @returns CapabilityResult with Cp, Cpk, Pp, Ppk, sigma, mean, and status
 */
export function calculateCpk(data: number[], usl: number, lsl: number): CapabilityResult {
  if (data.length < 2) {
    throw new Error('Need at least 2 data points for capability analysis');
  }
  if (usl <= lsl) {
    throw new Error('USL must be greater than LSL');
  }

  const dataMean = mean(data);
  const sigmaOverall = stdDev(data);

  // For Cpk, we estimate sigma_within. Without explicit subgroup info,
  // we use moving range method (pairs of consecutive observations).
  const movingRanges: number[] = [];
  for (let i = 1; i < data.length; i++) {
    movingRanges.push(Math.abs(data[i] - data[i - 1]));
  }
  const mrBar = mean(movingRanges);
  const d2 = SPC_CONSTANTS[2].d2; // d2 for n=2 (moving range of 2)
  const sigmaWithin = mrBar / d2;

  // Cp and Cpk (short-term, within-subgroup variation)
  const cp = sigmaWithin > 0 ? (usl - lsl) / (6 * sigmaWithin) : 0;
  const cpUpper = sigmaWithin > 0 ? (usl - dataMean) / (3 * sigmaWithin) : 0;
  const cpLower = sigmaWithin > 0 ? (dataMean - lsl) / (3 * sigmaWithin) : 0;
  const cpk = Math.min(cpUpper, cpLower);

  // Pp and Ppk (long-term, overall variation)
  const pp = sigmaOverall > 0 ? (usl - lsl) / (6 * sigmaOverall) : 0;
  const ppUpper = sigmaOverall > 0 ? (usl - dataMean) / (3 * sigmaOverall) : 0;
  const ppLower = sigmaOverall > 0 ? (dataMean - lsl) / (3 * sigmaOverall) : 0;
  const ppk = Math.min(ppUpper, ppLower);

  // Status determination based on Cpk
  let status: 'CAPABLE' | 'MARGINAL' | 'INCAPABLE';
  if (cpk >= 1.67) {
    status = 'CAPABLE';
  } else if (cpk >= 1.33) {
    status = 'MARGINAL';
  } else {
    status = 'INCAPABLE';
  }

  return {
    cp: Math.round(cp * 1000) / 1000,
    cpk: Math.round(cpk * 1000) / 1000,
    pp: Math.round(pp * 1000) / 1000,
    ppk: Math.round(ppk * 1000) / 1000,
    sigma: Math.round(sigmaWithin * 1000000) / 1000000,
    mean: Math.round(dataMean * 1000000) / 1000000,
    status,
  };
}

// ============================================
// Process Performance: Ppk
// ============================================

/**
 * Calculate process performance indices (Pp, Ppk) using overall variation.
 *
 * This is a convenience function that returns the same CapabilityResult
 * but with status based on Ppk instead of Cpk.
 *
 * @param data - Array of individual measurement values
 * @param usl - Upper specification limit
 * @param lsl - Lower specification limit
 * @returns CapabilityResult with Pp, Ppk, Cp, Cpk, sigma, mean, and status
 */
export function calculatePpk(data: number[], usl: number, lsl: number): CapabilityResult {
  if (data.length < 2) {
    throw new Error('Need at least 2 data points for performance analysis');
  }
  if (usl <= lsl) {
    throw new Error('USL must be greater than LSL');
  }

  const result = calculateCpk(data, usl, lsl);

  // Override status based on Ppk instead of Cpk
  let status: 'CAPABLE' | 'MARGINAL' | 'INCAPABLE';
  if (result.ppk >= 1.67) {
    status = 'CAPABLE';
  } else if (result.ppk >= 1.33) {
    status = 'MARGINAL';
  } else {
    status = 'INCAPABLE';
  }

  return {
    ...result,
    status,
  };
}

// ============================================
// Western Electric Rules Detection
// ============================================

/**
 * Detect violations of the Western Electric rules on a control chart.
 *
 * Rules implemented:
 * - Rule 1: Any single point beyond 3-sigma (UCL or LCL)
 * - Rule 2: 2 out of 3 consecutive points beyond 2-sigma on the same side
 * - Rule 3: 4 out of 5 consecutive points beyond 1-sigma on the same side
 * - Rule 4: 8 consecutive points on the same side of the center line
 *
 * @param chart - A computed ControlChart
 * @returns Array of Violation objects describing each detected rule violation
 */
export function detectWesternElectricRules(chart: ControlChart): Violation[] {
  const violations: Violation[] = [];
  const points = chart.dataPoints;
  const cl = chart.centerLine;
  const ucl = chart.ucl;
  const lcl = chart.lcl;

  // Calculate 1-sigma and 2-sigma zones
  const oneSigmaUpper = cl + (ucl - cl) / 3;
  const oneSigmaLower = cl - (cl - lcl) / 3;
  const twoSigmaUpper = cl + (2 * (ucl - cl)) / 3;
  const twoSigmaLower = cl - (2 * (cl - lcl)) / 3;

  for (let i = 0; i < points.length; i++) {
    const value = points[i].value;

    // Rule 1: Any single point beyond 3-sigma (outside UCL/LCL)
    if (value > ucl || value < lcl) {
      violations.push({
        pointIndex: i,
        rule: 'RULE_1',
        description: `Point ${i} (${value.toFixed(4)}) is beyond 3-sigma limits [${lcl.toFixed(4)}, ${ucl.toFixed(4)}]`,
      });
    }

    // Rule 2: 2 of 3 consecutive points beyond 2-sigma on same side
    if (i >= 2) {
      const window = [points[i - 2].value, points[i - 1].value, value];

      // Check upper side
      const aboveTwoSigmaUpper = window.filter((v) => v > twoSigmaUpper).length;
      if (aboveTwoSigmaUpper >= 2) {
        violations.push({
          pointIndex: i,
          rule: 'RULE_2',
          description: `2 of 3 consecutive points (ending at ${i}) are above 2-sigma (${twoSigmaUpper.toFixed(4)})`,
        });
      }

      // Check lower side
      const belowTwoSigmaLower = window.filter((v) => v < twoSigmaLower).length;
      if (belowTwoSigmaLower >= 2) {
        violations.push({
          pointIndex: i,
          rule: 'RULE_2',
          description: `2 of 3 consecutive points (ending at ${i}) are below 2-sigma (${twoSigmaLower.toFixed(4)})`,
        });
      }
    }

    // Rule 3: 4 of 5 consecutive points beyond 1-sigma on same side
    if (i >= 4) {
      const window = [
        points[i - 4].value,
        points[i - 3].value,
        points[i - 2].value,
        points[i - 1].value,
        value,
      ];

      // Check upper side
      const aboveOneSigmaUpper = window.filter((v) => v > oneSigmaUpper).length;
      if (aboveOneSigmaUpper >= 4) {
        violations.push({
          pointIndex: i,
          rule: 'RULE_3',
          description: `4 of 5 consecutive points (ending at ${i}) are above 1-sigma (${oneSigmaUpper.toFixed(4)})`,
        });
      }

      // Check lower side
      const belowOneSigmaLower = window.filter((v) => v < oneSigmaLower).length;
      if (belowOneSigmaLower >= 4) {
        violations.push({
          pointIndex: i,
          rule: 'RULE_3',
          description: `4 of 5 consecutive points (ending at ${i}) are below 1-sigma (${oneSigmaLower.toFixed(4)})`,
        });
      }
    }

    // Rule 4: 8 consecutive points on same side of center line
    if (i >= 7) {
      const window = [];
      for (let j = i - 7; j <= i; j++) {
        window.push(points[j].value);
      }

      const allAbove = window.every((v) => v > cl);
      const allBelow = window.every((v) => v < cl);

      if (allAbove) {
        violations.push({
          pointIndex: i,
          rule: 'RULE_4',
          description: `8 consecutive points (ending at ${i}) are above the center line (${cl.toFixed(4)})`,
        });
      }

      if (allBelow) {
        violations.push({
          pointIndex: i,
          rule: 'RULE_4',
          description: `8 consecutive points (ending at ${i}) are below the center line (${cl.toFixed(4)})`,
        });
      }
    }
  }

  return violations;
}
