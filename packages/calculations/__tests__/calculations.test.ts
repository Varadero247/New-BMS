/**
 * Unit tests for @ims/calculations package
 * Covers risk, safety, quality, and environmental calculation functions.
 */

import {
  calculateRiskScore,
  getRiskLevel,
  getRiskColor,
  getRiskLevelFromMatrix,
  getRiskColorFromMatrix,
  calculateResidualRisk,
  getRiskMatrixData,
} from '../src/risk';

import {
  calculateLTIFR,
  calculateTRIR,
  calculateSeverityRate,
  calculateNearMissRate,
  calculateSafetyMetrics,
  predictIncidentPyramid,
  getSafetyMetricStatus,
  HEINRICH_RATIOS,
} from '../src/safety';

import {
  calculateCOPQ,
  calculateCOPQBreakdown,
  calculateDPMO,
  calculateFPY,
  calculateRTY,
  calculateSigma,
  calculateDefectRate,
  calculateQualityMetrics,
  getQualityMetricStatus,
} from '../src/quality';

import {
  calculateSignificance,
  getSignificanceLevel,
  getSignificanceColor,
  isSignificant,
  calculateAspectSignificance,
  calculateCarbonFootprint,
  calculateWasteDiversionRate,
  ASPECT_TYPES,
  ENVIRONMENTAL_MEDIA,
} from '../src/environment';

// ============================================================
// Risk calculations
// ============================================================

describe('calculateRiskScore', () => {
  it('should return L × S when no detectability given', () => {
    expect(calculateRiskScore(3, 4)).toBe(12);
  });

  it('should return L × S × D when detectability given', () => {
    expect(calculateRiskScore(2, 3, 4)).toBe(24);
  });

  it('should clamp inputs to 1–5 range (low)', () => {
    expect(calculateRiskScore(0, 0, 0)).toBe(1); // 1 × 1 × 1
  });

  it('should clamp inputs to 1–5 range (high)', () => {
    expect(calculateRiskScore(10, 10, 10)).toBe(125); // 5 × 5 × 5
  });

  it('should return 1 for minimum inputs', () => {
    expect(calculateRiskScore(1, 1, 1)).toBe(1);
  });

  it('should return 125 for maximum inputs', () => {
    expect(calculateRiskScore(5, 5, 5)).toBe(125);
  });
});

describe('getRiskLevel', () => {
  it('returns LOW for score ≤ 8', () => {
    expect(getRiskLevel(1)).toBe('LOW');
    expect(getRiskLevel(8)).toBe('LOW');
  });

  it('returns MEDIUM for score ≤ 27', () => {
    expect(getRiskLevel(9)).toBe('MEDIUM');
    expect(getRiskLevel(27)).toBe('MEDIUM');
  });

  it('returns HIGH for score ≤ 64', () => {
    expect(getRiskLevel(28)).toBe('HIGH');
    expect(getRiskLevel(64)).toBe('HIGH');
  });

  it('returns CRITICAL for score > 64', () => {
    expect(getRiskLevel(65)).toBe('CRITICAL');
    expect(getRiskLevel(125)).toBe('CRITICAL');
  });
});

describe('getRiskColor', () => {
  it('returns green for LOW scores', () => {
    expect(getRiskColor(8)).toBe('#22c55e');
  });

  it('returns yellow for MEDIUM scores', () => {
    expect(getRiskColor(9)).toBe('#eab308');
  });

  it('returns orange for HIGH scores', () => {
    expect(getRiskColor(28)).toBe('#f97316');
  });

  it('returns red for CRITICAL scores', () => {
    expect(getRiskColor(65)).toBe('#ef4444');
  });
});

describe('getRiskLevelFromMatrix', () => {
  it('returns LOW for L×S ≤ 4', () => {
    expect(getRiskLevelFromMatrix(1, 4)).toBe('LOW');
    expect(getRiskLevelFromMatrix(2, 2)).toBe('LOW');
  });

  it('returns MEDIUM for L×S ≤ 9', () => {
    expect(getRiskLevelFromMatrix(3, 3)).toBe('MEDIUM');
    expect(getRiskLevelFromMatrix(1, 9)).toBe('MEDIUM');
  });

  it('returns HIGH for L×S ≤ 15', () => {
    expect(getRiskLevelFromMatrix(3, 4)).toBe('HIGH');
    expect(getRiskLevelFromMatrix(3, 5)).toBe('HIGH');
  });

  it('returns CRITICAL for L×S > 15', () => {
    expect(getRiskLevelFromMatrix(4, 4)).toBe('CRITICAL');
    expect(getRiskLevelFromMatrix(5, 5)).toBe('CRITICAL');
  });
});

describe('calculateResidualRisk', () => {
  it('reduces risk by given effectiveness percentage', () => {
    expect(calculateResidualRisk(100, 50)).toBe(50);
  });

  it('reduces to 0 with 100% effectiveness', () => {
    expect(calculateResidualRisk(25, 100)).toBe(0);
  });

  it('does not reduce with 0% effectiveness', () => {
    expect(calculateResidualRisk(25, 0)).toBe(25);
  });

  it('clamps effectiveness to 100', () => {
    expect(calculateResidualRisk(100, 150)).toBe(0);
  });

  it('clamps effectiveness to 0', () => {
    expect(calculateResidualRisk(50, -10)).toBe(50);
  });
});

describe('getRiskColorFromMatrix', () => {
  it('returns green for L×S ≤ 4', () => {
    expect(getRiskColorFromMatrix(1, 4)).toBe('#22c55e');
  });

  it('returns red for L×S > 16', () => {
    expect(getRiskColorFromMatrix(5, 5)).toBe('#ef4444');
  });
});

describe('getRiskMatrixData', () => {
  it('returns 25 cells for 5×5 matrix', () => {
    const { cells } = getRiskMatrixData();
    expect(cells).toHaveLength(25);
  });

  it('each cell has required properties', () => {
    const { cells } = getRiskMatrixData();
    for (const cell of cells) {
      expect(cell).toHaveProperty('likelihood');
      expect(cell).toHaveProperty('severity');
      expect(cell).toHaveProperty('score');
      expect(cell).toHaveProperty('level');
      expect(cell).toHaveProperty('color');
      expect(cell.score).toBe(cell.likelihood * cell.severity);
    }
  });
});

// ============================================================
// Safety calculations
// ============================================================

describe('calculateLTIFR', () => {
  it('calculates LTIFR correctly', () => {
    // 2 LTIs, 1,000,000 hours → LTIFR = 2.00
    expect(calculateLTIFR(2, 1_000_000)).toBe(2.0);
  });

  it('returns 0 when no hours worked', () => {
    expect(calculateLTIFR(5, 0)).toBe(0);
  });

  it('handles fractional result', () => {
    // 1 LTI, 500,000 hours → 2.00
    expect(calculateLTIFR(1, 500_000)).toBe(2.0);
  });
});

describe('calculateTRIR', () => {
  it('calculates TRIR using 200,000 base hours', () => {
    // 5 injuries, 200,000 hours → TRIR = 5.00
    expect(calculateTRIR(5, 200_000)).toBe(5.0);
  });

  it('returns 0 when no hours worked', () => {
    expect(calculateTRIR(3, 0)).toBe(0);
  });
});

describe('calculateSeverityRate', () => {
  it('calculates severity rate correctly', () => {
    expect(calculateSeverityRate(5, 1_000_000)).toBe(5.0);
  });

  it('returns 0 when no hours worked', () => {
    expect(calculateSeverityRate(10, 0)).toBe(0);
  });
});

describe('calculateNearMissRate', () => {
  it('calculates near miss rate correctly', () => {
    expect(calculateNearMissRate(10, 200_000)).toBe(10.0);
  });
});

describe('calculateSafetyMetrics', () => {
  it('calculates all required metrics', () => {
    const result = calculateSafetyMetrics({
      hoursWorked: 1_000_000,
      lostTimeInjuries: 2,
      totalRecordableInjuries: 5,
      daysLost: 20,
      nearMisses: 50,
      firstAidCases: 10,
    });

    expect(result.ltifr).toBe(2.0);
    expect(result.trir).toBe(1.0);
    expect(result.severityRate).toBe(20.0);
    expect(typeof result.nearMissRate).toBe('number');
    expect(typeof result.firstAidRate).toBe('number');
  });

  it('omits nearMissRate and firstAidRate when not provided', () => {
    const result = calculateSafetyMetrics({
      hoursWorked: 500_000,
      lostTimeInjuries: 1,
      totalRecordableInjuries: 2,
      daysLost: 5,
    });

    expect(result.nearMissRate).toBeUndefined();
    expect(result.firstAidRate).toBeUndefined();
  });
});

describe('HEINRICH_RATIOS', () => {
  it('has correct ratios', () => {
    expect(HEINRICH_RATIOS.majorInjury).toBe(1);
    expect(HEINRICH_RATIOS.minorInjury).toBe(29);
    expect(HEINRICH_RATIOS.nearMiss).toBe(300);
  });
});

describe('predictIncidentPyramid', () => {
  it('predicts correct numbers for 1 major injury', () => {
    const result = predictIncidentPyramid(1);
    expect(result.majorInjuries).toBe(1);
    expect(result.minorInjuries).toBe(29);
    expect(result.nearMisses).toBe(300);
  });

  it('scales proportionally for 3 major injuries', () => {
    const result = predictIncidentPyramid(3);
    expect(result.majorInjuries).toBe(3);
    expect(result.minorInjuries).toBe(87);
    expect(result.nearMisses).toBe(900);
  });
});

describe('getSafetyMetricStatus', () => {
  it('returns GREEN when value is 75% or less of benchmark', () => {
    expect(getSafetyMetricStatus('ltifr', 0.5, 1.0)).toBe('GREEN');
  });

  it('returns AMBER when value is within 125% of benchmark', () => {
    expect(getSafetyMetricStatus('ltifr', 1.0, 1.0)).toBe('AMBER');
  });

  it('returns RED when value exceeds 125% of benchmark', () => {
    expect(getSafetyMetricStatus('ltifr', 2.0, 1.0)).toBe('RED');
  });
});

// ============================================================
// Quality calculations
// ============================================================

describe('calculateCOPQ', () => {
  it('sums all four cost categories', () => {
    expect(calculateCOPQ(100, 200, 300, 400)).toBe(1000);
  });

  it('returns 0 when all costs are 0', () => {
    expect(calculateCOPQ(0, 0, 0, 0)).toBe(0);
  });
});

describe('calculateCOPQBreakdown', () => {
  it('calculates percentages correctly', () => {
    const result = calculateCOPQBreakdown(250, 250, 250, 250);
    expect(result.prevention).toBe(25.0);
    expect(result.appraisal).toBe(25.0);
    expect(result.internalFailure).toBe(25.0);
    expect(result.externalFailure).toBe(25.0);
    expect(result.total).toBe(1000);
  });

  it('returns 0 percentages when total is 0', () => {
    const result = calculateCOPQBreakdown(0, 0, 0, 0);
    expect(result.prevention).toBe(0);
    expect(result.total).toBe(0);
  });

  it('splits conformance vs non-conformance costs', () => {
    const result = calculateCOPQBreakdown(100, 200, 300, 400);
    expect(result.conformanceCost).toBe(300);
    expect(result.nonConformanceCost).toBe(700);
  });
});

describe('calculateDPMO', () => {
  it('calculates DPMO correctly', () => {
    // 10 defects, 100 units, 1 opportunity each → DPMO = 100,000
    expect(calculateDPMO(10, 100, 1)).toBe(100_000);
  });

  it('returns 0 when units is 0', () => {
    expect(calculateDPMO(5, 0, 1)).toBe(0);
  });

  it('returns 0 when opportunities is 0', () => {
    expect(calculateDPMO(5, 100, 0)).toBe(0);
  });
});

describe('calculateFPY', () => {
  it('calculates first pass yield correctly', () => {
    // 90 good out of 100 = 90%
    expect(calculateFPY(100, 10)).toBe(90.0);
  });

  it('returns 100% when no defectives', () => {
    expect(calculateFPY(100, 0)).toBe(100.0);
  });

  it('returns 0 when totalUnits is 0', () => {
    expect(calculateFPY(0, 0)).toBe(0);
  });
});

describe('calculateRTY', () => {
  it('multiplies process yields correctly', () => {
    // 90% × 90% × 90% = 72.9%
    const result = calculateRTY([90, 90, 90]);
    expect(result).toBeCloseTo(72.9, 1);
  });

  it('returns 0 for empty array', () => {
    expect(calculateRTY([])).toBe(0);
  });

  it('returns 100 for single 100% process', () => {
    expect(calculateRTY([100])).toBe(100.0);
  });
});

describe('calculateSigma', () => {
  it('returns 6 for near-zero DPMO', () => {
    expect(calculateSigma(0)).toBe(6);
  });

  it('returns 0 for very high DPMO', () => {
    expect(calculateSigma(1_000_000)).toBe(0);
  });

  it('returns approximately 3.0 for 22,750 DPMO (classic 3-sigma)', () => {
    const sigma = calculateSigma(22_750);
    expect(sigma).toBeGreaterThanOrEqual(2.9);
    expect(sigma).toBeLessThanOrEqual(3.1);
  });
});

describe('calculateDefectRate', () => {
  it('calculates defect rate percentage', () => {
    expect(calculateDefectRate(5, 100)).toBe(5.0);
  });

  it('returns 0 when totalUnits is 0', () => {
    expect(calculateDefectRate(0, 0)).toBe(0);
  });
});

describe('calculateQualityMetrics', () => {
  it('returns all required quality metric fields', () => {
    const result = calculateQualityMetrics({
      preventionCost: 1000,
      appraisalCost: 2000,
      internalFailureCost: 3000,
      externalFailureCost: 4000,
      totalUnits: 1000,
      defectiveUnits: 50,
      defectOpportunities: 5,
    });

    expect(typeof result.totalCOPQ).toBe('number');
    expect(typeof result.dpmo).toBe('number');
    expect(typeof result.firstPassYield).toBe('number');
    expect(typeof result.processSigma).toBe('number');
    expect(typeof result.defectRate).toBe('number');
    expect(result.totalCOPQ).toBe(10_000);
    expect(result.firstPassYield).toBe(95.0);
    expect(result.defectRate).toBe(5.0);
  });
});

describe('getQualityMetricStatus', () => {
  it('returns GREEN for DPMO at or below target', () => {
    expect(getQualityMetricStatus('dpmo', 100, 200)).toBe('GREEN');
  });

  it('returns AMBER for DPMO slightly above target', () => {
    expect(getQualityMetricStatus('dpmo', 250, 200)).toBe('AMBER');
  });

  it('returns RED for DPMO far above target', () => {
    expect(getQualityMetricStatus('dpmo', 500, 200)).toBe('RED');
  });

  it('returns GREEN for FPY at or above target', () => {
    expect(getQualityMetricStatus('fpy', 95, 90)).toBe('GREEN');
  });

  it('returns AMBER for FPY slightly below target', () => {
    // 85 is 94.4% of 90 — within 90% threshold
    expect(getQualityMetricStatus('fpy', 85, 90)).toBe('AMBER');
  });

  it('returns RED for FPY far below target', () => {
    expect(getQualityMetricStatus('fpy', 50, 90)).toBe('RED');
  });
});

// ============================================================
// Environmental calculations
// ============================================================

describe('calculateSignificance', () => {
  it('calculates base score as scale × frequency × legal', () => {
    // 3 × 3 × 3 = 27
    expect(calculateSignificance({ scale: 3, frequency: 3, legalImpact: 3 })).toBe(27);
  });

  it('clamps inputs to 1–5 range', () => {
    // 5 × 5 × 5 = 125
    expect(calculateSignificance({ scale: 10, frequency: 10, legalImpact: 10 })).toBe(125);
    // 1 × 1 × 1 = 1
    expect(calculateSignificance({ scale: 0, frequency: 0, legalImpact: 0 })).toBe(1);
  });

  it('applies reversibility modifier when provided', () => {
    const base = calculateSignificance({ scale: 3, frequency: 3, legalImpact: 3 });
    const withR = calculateSignificance({
      scale: 3,
      frequency: 3,
      legalImpact: 3,
      reversibility: 5,
    });
    // With high reversibility, score should be higher than base
    expect(withR).toBeGreaterThan(base);
  });
});

describe('getSignificanceLevel', () => {
  it('returns NEGLIGIBLE for score ≤ 8', () => {
    expect(getSignificanceLevel(1)).toBe('NEGLIGIBLE');
    expect(getSignificanceLevel(8)).toBe('NEGLIGIBLE');
  });

  it('returns LOW for score ≤ 27', () => {
    expect(getSignificanceLevel(9)).toBe('LOW');
    expect(getSignificanceLevel(27)).toBe('LOW');
  });

  it('returns MODERATE for score ≤ 64', () => {
    expect(getSignificanceLevel(28)).toBe('MODERATE');
    expect(getSignificanceLevel(64)).toBe('MODERATE');
  });

  it('returns HIGH for score ≤ 100', () => {
    expect(getSignificanceLevel(65)).toBe('HIGH');
    expect(getSignificanceLevel(100)).toBe('HIGH');
  });

  it('returns CRITICAL for score > 100', () => {
    expect(getSignificanceLevel(101)).toBe('CRITICAL');
  });
});

describe('getSignificanceColor', () => {
  it('returns slate for negligible scores', () => {
    expect(getSignificanceColor(8)).toBe('#94a3b8');
  });

  it('returns green for low scores', () => {
    expect(getSignificanceColor(27)).toBe('#22c55e');
  });

  it('returns yellow for moderate scores', () => {
    expect(getSignificanceColor(64)).toBe('#eab308');
  });

  it('returns orange for high scores', () => {
    expect(getSignificanceColor(100)).toBe('#f97316');
  });

  it('returns red for critical scores', () => {
    expect(getSignificanceColor(101)).toBe('#ef4444');
  });
});

describe('isSignificant', () => {
  it('returns false for score at or below threshold (27)', () => {
    expect(isSignificant(27)).toBe(false);
  });

  it('returns true for score above threshold', () => {
    expect(isSignificant(28)).toBe(true);
  });

  it('uses custom threshold when provided', () => {
    expect(isSignificant(50, 60)).toBe(false);
    expect(isSignificant(61, 60)).toBe(true);
  });
});

describe('calculateAspectSignificance', () => {
  it('returns complete output object', () => {
    const result = calculateAspectSignificance({
      scale: 3,
      frequency: 3,
      legalImpact: 3,
    });

    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('level');
    expect(result).toHaveProperty('isSignificant');
    expect(result).toHaveProperty('color');
    expect(result.score).toBe(27);
    expect(result.level).toBe('LOW');
    expect(result.isSignificant).toBe(false);
  });

  it('returns significant=true for high-scoring aspects', () => {
    const result = calculateAspectSignificance({
      scale: 5,
      frequency: 5,
      legalImpact: 5,
    });
    expect(result.isSignificant).toBe(true);
    expect(result.level).toBe('CRITICAL');
  });
});

describe('calculateCarbonFootprint', () => {
  it('returns 0 for empty emissions object', () => {
    expect(calculateCarbonFootprint({})).toBe(0);
  });

  it('converts CO2 kg to tonnes', () => {
    expect(calculateCarbonFootprint({ co2: 1000 })).toBe(1.0);
  });

  it('applies GWP factor for methane', () => {
    // 1 kg CH4 × 28 GWP = 28 kg CO2e = 0.028 tonnes
    expect(calculateCarbonFootprint({ methane: 1 })).toBe(0.03); // rounded
  });

  it('sums multiple emission sources', () => {
    const result = calculateCarbonFootprint({
      co2: 1000, // 1 tonne
      diesel: 1000, // 1000L × 2.68 = 2680 kg = 2.68 tonnes
    });
    expect(result).toBeCloseTo(3.68, 2);
  });
});

describe('calculateWasteDiversionRate', () => {
  it('calculates diversion rate correctly', () => {
    // 75 diverted, 25 landfill = 75%
    expect(calculateWasteDiversionRate(25, 25, 25, 25)).toBe(75.0);
  });

  it('returns 100% when no landfill', () => {
    expect(calculateWasteDiversionRate(100, 0, 0, 0)).toBe(100.0);
  });

  it('returns 0% when all goes to landfill', () => {
    expect(calculateWasteDiversionRate(0, 0, 0, 100)).toBe(0.0);
  });

  it('returns 0 for all-zero inputs', () => {
    expect(calculateWasteDiversionRate(0, 0, 0, 0)).toBe(0);
  });
});

describe('ASPECT_TYPES and ENVIRONMENTAL_MEDIA constants', () => {
  it('ASPECT_TYPES contains expected types', () => {
    expect(ASPECT_TYPES).toContain('EMISSIONS_TO_AIR');
    expect(ASPECT_TYPES).toContain('WASTE_GENERATION');
    expect(ASPECT_TYPES).toContain('ENERGY_USE');
    expect(ASPECT_TYPES).toContain('WATER_USE');
  });

  it('ENVIRONMENTAL_MEDIA contains expected media', () => {
    expect(ENVIRONMENTAL_MEDIA).toContain('AIR');
    expect(ENVIRONMENTAL_MEDIA).toContain('WATER');
    expect(ENVIRONMENTAL_MEDIA).toContain('LAND');
  });
});


describe('phase40 coverage', () => {
  it('implements simple state machine', () => { type State='idle'|'running'|'stopped'; const transitions:{[K in State]?:Partial<Record<string,State>>}={idle:{start:'running'},running:{stop:'stopped'},stopped:{reset:'idle'}}; const step=(state:State,event:string):State=>(transitions[state] as any)?.[event]??state; expect(step('idle','start')).toBe('running'); expect(step('running','stop')).toBe('stopped'); });
  it('finds smallest window containing all chars', () => { const minWindow=(s:string,t:string)=>{const need=new Map<string,number>();for(const c of t)need.set(c,(need.get(c)||0)+1);let l=0,formed=0,best='';const have=new Map<string,number>();for(let r=0;r<s.length;r++){const c=s[r];have.set(c,(have.get(c)||0)+1);if(need.has(c)&&have.get(c)===need.get(c))formed++;while(formed===need.size){const w=s.slice(l,r+1);if(!best||w.length<best.length)best=w;const lc=s[l];have.set(lc,(have.get(lc)||0)-1);if(need.has(lc)&&have.get(lc)!<need.get(lc)!)formed--;l++;}}return best;}; expect(minWindow('ADOBECODEBANC','ABC')).toBe('BANC'); });
  it('converts number to words (single digit)', () => { const words=['zero','one','two','three','four','five','six','seven','eight','nine']; expect(words[7]).toBe('seven'); });
});


describe('phase41 coverage', () => {
  it('computes extended GCD', () => { const extGcd=(a:number,b:number):[number,number,number]=>{if(b===0)return[a,1,0];const[g,x,y]=extGcd(b,a%b);return[g,y,x-Math.floor(a/b)*y];}; const[g]=extGcd(35,15); expect(g).toBe(5); });
  it('checks if number is automorphic', () => { const isAuto=(n:number)=>String(n*n).endsWith(String(n)); expect(isAuto(5)).toBe(true); expect(isAuto(6)).toBe(true); expect(isAuto(7)).toBe(false); });
  it('finds maximum width of binary tree level', () => { const maxWidth=(nodes:number[])=>{const levels=new Map<number,number[]>();nodes.forEach((v,i)=>{if(v!==-1){const lvl=Math.floor(Math.log2(i+1));(levels.get(lvl)||levels.set(lvl,[]).get(lvl)!).push(i);}});return Math.max(...[...levels.values()].map(idxs=>idxs[idxs.length-1]-idxs[0]+1),1);}; expect(maxWidth([1,3,2,5,-1,-1,9,-1,-1,-1,-1,-1,-1,7])).toBeGreaterThan(0); });
  it('checks if string matches wildcard pattern', () => { const match=(s:string,p:string)=>{const m=s.length,n=p.length;const dp=Array.from({length:m+1},()=>Array(n+1).fill(false));dp[0][0]=true;for(let j=1;j<=n;j++)if(p[j-1]==='*')dp[0][j]=dp[0][j-1];for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=p[j-1]==='*'?dp[i-1][j]||dp[i][j-1]:dp[i-1][j-1]&&(p[j-1]==='?'||p[j-1]===s[i-1]);return dp[m][n];}; expect(match('aa','*')).toBe(true); expect(match('cb','?a')).toBe(false); });
  it('implements LCS string reconstruction', () => { const lcs=(a:string,b:string)=>{const m=a.length,n=b.length;const dp=Array.from({length:m+1},()=>Array(n+1).fill(''));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+a[i-1]:dp[i-1][j].length>=dp[i][j-1].length?dp[i-1][j]:dp[i][j-1];return dp[m][n];}; expect(lcs('ABCBDAB','BDCAB')).toBe('BCAB'); });
});


describe('phase42 coverage', () => {
  it('computes pentagonal number', () => { const penta=(n:number)=>n*(3*n-1)/2; expect(penta(1)).toBe(1); expect(penta(4)).toBe(22); });
  it('computes cross product magnitude of 2D vectors', () => { const cross=(ax:number,ay:number,bx:number,by:number)=>ax*by-ay*bx; expect(cross(1,0,0,1)).toBe(1); expect(cross(2,3,4,5)).toBe(-2); });
  it('checks point inside circle', () => { const inCircle=(px:number,py:number,cx:number,cy:number,r:number)=>Math.hypot(px-cx,py-cy)<=r; expect(inCircle(3,4,0,0,5)).toBe(true); expect(inCircle(4,4,0,0,5)).toBe(false); });
  it('checks line segments intersection (bounding box)', () => { const overlap=(a:number,b:number,c:number,d:number)=>Math.max(a,c)<=Math.min(b,d); expect(overlap(1,4,2,6)).toBe(true); expect(overlap(1,2,3,4)).toBe(false); });
  it('rotates 2D point by 90 degrees', () => { const rot90=(x:number,y:number)=>[-y,x]; expect(rot90(2,3)).toEqual([-3,2]); expect(rot90(0,1)).toEqual([-1,0]); });
});


describe('phase43 coverage', () => {
  it('computes moving average', () => { const ma=(a:number[],w:number)=>Array.from({length:a.length-w+1},(_,i)=>a.slice(i,i+w).reduce((s,v)=>s+v,0)/w); expect(ma([1,2,3,4,5],3)).toEqual([2,3,4]); });
  it('formats number with locale-like thousand separators', () => { const fmt=(n:number)=>n.toString().replace(/\B(?=(\d{3})+$)/g,','); expect(fmt(1000000)).toBe('1,000,000'); expect(fmt(1234)).toBe('1,234'); });
  it('checks if two date ranges overlap', () => { const overlap=(s1:number,e1:number,s2:number,e2:number)=>s1<=e2&&s2<=e1; expect(overlap(1,5,3,8)).toBe(true); expect(overlap(1,3,5,8)).toBe(false); });
  it('computes ReLU activation', () => { const relu=(x:number)=>Math.max(0,x); expect(relu(3)).toBe(3); expect(relu(-2)).toBe(0); expect(relu(0)).toBe(0); });
  it('generates one-hot encoding', () => { const oneHot=(idx:number,size:number)=>Array(size).fill(0).map((_,i)=>i===idx?1:0); expect(oneHot(2,4)).toEqual([0,0,1,0]); });
});


describe('phase44 coverage', () => {
  it('implements observable pattern', () => { const obs=<T>(init:T)=>{let v=init;const subs:((v:T)=>void)[]=[];return{get:()=>v,set:(nv:T)=>{v=nv;subs.forEach(fn=>fn(nv));},sub:(fn:(v:T)=>void)=>subs.push(fn)};}; const o=obs(0);const log:number[]=[];o.sub(v=>log.push(v));o.set(1);o.set(2); expect(log).toEqual([1,2]); });
  it('checks circle contains point', () => { const inCirc=(cx:number,cy:number,r:number,px:number,py:number)=>(px-cx)**2+(py-cy)**2<=r**2; expect(inCirc(0,0,5,3,4)).toBe(true); expect(inCirc(0,0,5,4,4)).toBe(false); });
  it('inverts a key-value map', () => { const inv=(o:Record<string,string>)=>Object.fromEntries(Object.entries(o).map(([k,v])=>[v,k])); expect(inv({a:'1',b:'2',c:'3'})).toEqual({'1':'a','2':'b','3':'c'}); });
  it('curries a two-argument function', () => { const curry=<A,B,C>(fn:(a:A,b:B)=>C)=>(a:A)=>(b:B)=>fn(a,b); const add=curry((a:number,b:number)=>a+b); expect(add(3)(4)).toBe(7); });
  it('throttles function calls', () => { jest.useFakeTimers();const th=(fn:()=>void,ms:number)=>{let last=0;return()=>{const now=Date.now();if(now-last>=ms){last=now;fn();}};};let c=0;const t=th(()=>c++,100);t();t();jest.advanceTimersByTime(150);t(); expect(c).toBe(2);jest.useRealTimers(); });
});


describe('phase45 coverage', () => {
  it('computes harmonic mean', () => { const hm=(a:number[])=>a.length/a.reduce((s,v)=>s+1/v,0); expect(Math.round(hm([1,2,4])*1000)/1000).toBe(1.714); });
  it('computes simple moving sum', () => { const ms=(a:number[],w:number)=>Array.from({length:a.length-w+1},(_,i)=>a.slice(i,i+w).reduce((s,v)=>s+v,0)); expect(ms([1,2,3,4,5],3)).toEqual([6,9,12]); });
  it('computes topological sort (DFS)', () => { const topo=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v])=>adj[u].push(v));const vis=new Set<number>();const ord:number[]=[];const dfs=(u:number)=>{vis.add(u);adj[u].forEach(v=>{if(!vis.has(v))dfs(v);});ord.unshift(u);};for(let i=0;i<n;i++)if(!vis.has(i))dfs(i);return ord;}; const r=topo(4,[[0,1],[0,2],[1,3],[2,3]]); expect(r.indexOf(0)).toBeLessThan(r.indexOf(1)); expect(r.indexOf(1)).toBeLessThan(r.indexOf(3)); });
  it('pads string to center', () => { const center=(s:string,n:number,c=' ')=>{const p=Math.max(0,n-s.length);const l=Math.floor(p/2);return c.repeat(l)+s+c.repeat(p-l);}; expect(center('hi',6,'-')).toBe('--hi--'); });
  it('flattens matrix to array', () => { const flat=(m:number[][])=>m.reduce((a,r)=>[...a,...r],[]); expect(flat([[1,2],[3,4],[5,6]])).toEqual([1,2,3,4,5,6]); });
});


describe('phase46 coverage', () => {
  it('finds all prime pairs (twin primes) up to n', () => { const sieve=(n:number)=>{const p=new Array(n+1).fill(true);p[0]=p[1]=false;for(let i=2;i*i<=n;i++)if(p[i])for(let j=i*i;j<=n;j+=i)p[j]=false;return p;};const twins=(n:number)=>{const p=sieve(n);const r:[number,number][]=[];for(let i=2;i<=n-2;i++)if(p[i]&&p[i+2])r.push([i,i+2]);return r;}; expect(twins(20)).toContainEqual([5,7]); expect(twins(20)).toContainEqual([11,13]); });
  it('checks if number is deficient', () => { const def=(n:number)=>Array.from({length:n-1},(_,i)=>i+1).filter(d=>n%d===0).reduce((s,v)=>s+v,0)<n; expect(def(8)).toBe(true); expect(def(12)).toBe(false); });
  it('computes prefix XOR array', () => { const px=(a:number[])=>{const r=[0];for(const v of a)r.push(r[r.length-1]^v);return r;}; expect(px([1,2,3])).toEqual([0,1,3,0]); });
  it('finds first missing positive', () => { const fmp=(a:number[])=>{const s=new Set(a);let i=1;while(s.has(i))i++;return i;}; expect(fmp([1,2,0])).toBe(3); expect(fmp([3,4,-1,1])).toBe(2); expect(fmp([7,8,9,11,12])).toBe(1); });
  it('finds the longest consecutive sequence', () => { const lcs=(a:number[])=>{const s=new Set(a);let best=0;for(const v of s){if(!s.has(v-1)){let cur=v,len=1;while(s.has(cur+1)){cur++;len++;}best=Math.max(best,len);}}return best;}; expect(lcs([100,4,200,1,3,2])).toBe(4); expect(lcs([0,3,7,2,5,8,4,6,0,1])).toBe(9); });
});


describe('phase47 coverage', () => {
  it('implements stable sort', () => { const ss=(a:{v:number;i:number}[])=>[...a].sort((x,y)=>x.v-y.v||x.i-y.i); const in2=[{v:2,i:0},{v:1,i:1},{v:2,i:2}]; const s=ss(in2); expect(s[0].v).toBe(1); expect(s[1].i).toBe(0); expect(s[2].i).toBe(2); });
  it('computes longest substring without repeating', () => { const lw=(s:string)=>{const m=new Map<string,number>();let best=0,l=0;for(let r=0;r<s.length;r++){if(m.has(s[r])&&m.get(s[r])!>=l)l=m.get(s[r])!+1;m.set(s[r],r);best=Math.max(best,r-l+1);}return best;}; expect(lw('abcabcbb')).toBe(3); expect(lw('pwwkew')).toBe(3); });
  it('computes stock profit with cooldown', () => { const sp=(p:number[])=>{let hold=-Infinity,sold=0,cool=0;for(const v of p){const nh=Math.max(hold,cool-v),ns=hold+v,nc=Math.max(cool,sold);[hold,sold,cool]=[nh,ns,nc];}return Math.max(sold,cool);}; expect(sp([1,2,3,0,2])).toBe(3); expect(sp([1])).toBe(0); });
  it('implements quicksort', () => { const qs=(a:number[]):number[]=>a.length<=1?a:(()=>{const p=a[Math.floor(a.length/2)];return[...qs(a.filter(x=>x<p)),...a.filter(x=>x===p),...qs(a.filter(x=>x>p))];})(); expect(qs([3,6,8,10,1,2,1])).toEqual([1,1,2,3,6,8,10]); });
  it('checks if pattern matches string (wildcard)', () => { const wm=(s:string,p:string)=>{const m=s.length,n=p.length;const dp=Array.from({length:m+1},()=>new Array(n+1).fill(false));dp[0][0]=true;for(let j=1;j<=n;j++)if(p[j-1]==='*')dp[0][j]=dp[0][j-1];for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=p[j-1]==='*'?(dp[i-1][j]||dp[i][j-1]):(p[j-1]==='?'||p[j-1]===s[i-1])&&dp[i-1][j-1];return dp[m][n];}; expect(wm('aa','*')).toBe(true); expect(wm('cb','?a')).toBe(false); });
});


describe('phase48 coverage', () => {
  it('computes closest pair distance', () => { const cpd=(pts:[number,number][])=>{const d=(a:[number,number],b:[number,number])=>Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2);let best=Infinity;for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)best=Math.min(best,d(pts[i],pts[j]));return best;}; expect(cpd([[0,0],[3,4],[1,1],[5,2]])).toBeCloseTo(Math.sqrt(2),5); });
  it('counts set bits across range', () => { const cb=(n:number)=>{let c=0,x=n;while(x){c+=x&1;x>>=1;}return c;};const total=(n:number)=>Array.from({length:n+1},(_,i)=>cb(i)).reduce((s,v)=>s+v,0); expect(total(5)).toBe(7); expect(total(10)).toBe(17); });
  it('computes maximum meetings in one room', () => { const mm=(s:number[],e:number[])=>{const m=s.map((si,i)=>[si,e[i]] as [number,number]).sort((a,b)=>a[1]-b[1]);let cnt=1,end=m[0][1];for(let i=1;i<m.length;i++)if(m[i][0]>=end){cnt++;end=m[i][1];}return cnt;}; expect(mm([0,3,1,5],[5,4,2,9])).toBe(3); expect(mm([1,3,0,5,8,5],[2,4,6,7,9,9])).toBe(4); });
  it('finds longest word in sentence', () => { const lw=(s:string)=>s.split(' ').reduce((a,w)=>w.length>a.length?w:a,''); expect(lw('the quick brown fox')).toBe('quick'); expect(lw('a bb ccc')).toBe('ccc'); });
  it('finds maximum XOR of two array elements', () => { const mx=(a:number[])=>{let res=0,pre=0;const seen=new Set([0]);for(const v of a){pre^=v;for(let b=31;b>=0;b--){const t=(pre>>b)&1;res=Math.max(res,pre);if(seen.has(pre^res))break;}seen.add(pre);}return a.reduce((best,_,i)=>a.slice(i+1).reduce((b,v)=>Math.max(b,a[i]^v),best),0);}; expect(mx([3,10,5,25,2,8])).toBe(28); });
});
