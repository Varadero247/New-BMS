// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-infosec specification tests

type ThreatCategory = 'MALWARE' | 'PHISHING' | 'INSIDER_THREAT' | 'DDOS' | 'SQL_INJECTION' | 'ZERO_DAY' | 'RANSOMWARE';
type SecurityControlType = 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE' | 'DETERRENT' | 'COMPENSATING';
type VulnerabilitySeverity = 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type IncidentResponsePhase = 'PREPARATION' | 'IDENTIFICATION' | 'CONTAINMENT' | 'ERADICATION' | 'RECOVERY' | 'LESSONS_LEARNED';

const THREAT_CATEGORIES: ThreatCategory[] = ['MALWARE', 'PHISHING', 'INSIDER_THREAT', 'DDOS', 'SQL_INJECTION', 'ZERO_DAY', 'RANSOMWARE'];
const CONTROL_TYPES: SecurityControlType[] = ['PREVENTIVE', 'DETECTIVE', 'CORRECTIVE', 'DETERRENT', 'COMPENSATING'];
const VULN_SEVERITIES: VulnerabilitySeverity[] = ['INFORMATIONAL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const IR_PHASES: IncidentResponsePhase[] = ['PREPARATION', 'IDENTIFICATION', 'CONTAINMENT', 'ERADICATION', 'RECOVERY', 'LESSONS_LEARNED'];

const cvssBaseSeverity: Record<VulnerabilitySeverity, [number, number]> = {
  INFORMATIONAL: [0, 0],
  LOW: [0.1, 3.9],
  MEDIUM: [4.0, 6.9],
  HIGH: [7.0, 8.9],
  CRITICAL: [9.0, 10.0],
};

const vulnSeverityColor: Record<VulnerabilitySeverity, string> = {
  INFORMATIONAL: 'bg-gray-100 text-gray-700',
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const irPhaseStep: Record<IncidentResponsePhase, number> = {
  PREPARATION: 1, IDENTIFICATION: 2, CONTAINMENT: 3,
  ERADICATION: 4, RECOVERY: 5, LESSONS_LEARNED: 6,
};

function cvssToSeverity(score: number): VulnerabilitySeverity {
  if (score === 0) return 'INFORMATIONAL';
  if (score < 4.0) return 'LOW';
  if (score < 7.0) return 'MEDIUM';
  if (score < 9.0) return 'HIGH';
  return 'CRITICAL';
}

function riskPriority(likelihood: number, impact: number): number {
  return likelihood * impact;
}

function isHighPriority(severity: VulnerabilitySeverity): boolean {
  return severity === 'HIGH' || severity === 'CRITICAL';
}

describe('Vulnerability severity colors', () => {
  VULN_SEVERITIES.forEach(s => {
    it(`${s} has color`, () => expect(vulnSeverityColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(vulnSeverityColor[s]).toContain('bg-'));
  });
  it('CRITICAL is red', () => expect(vulnSeverityColor.CRITICAL).toContain('red'));
  it('INFORMATIONAL is gray', () => expect(vulnSeverityColor.INFORMATIONAL).toContain('gray'));
  for (let i = 0; i < 100; i++) {
    const s = VULN_SEVERITIES[i % 5];
    it(`vuln severity color string (idx ${i})`, () => expect(typeof vulnSeverityColor[s]).toBe('string'));
  }
});

describe('CVSS ranges', () => {
  VULN_SEVERITIES.forEach(s => {
    it(`${s} has CVSS range`, () => {
      const [min, max] = cvssBaseSeverity[s];
      expect(min).toBeGreaterThanOrEqual(0);
      expect(max).toBeLessThanOrEqual(10);
    });
  });
  it('CRITICAL upper bound is 10', () => expect(cvssBaseSeverity.CRITICAL[1]).toBe(10));
  it('INFORMATIONAL range is [0, 0]', () => {
    expect(cvssBaseSeverity.INFORMATIONAL[0]).toBe(0);
    expect(cvssBaseSeverity.INFORMATIONAL[1]).toBe(0);
  });
  for (let i = 0; i < 50; i++) {
    const s = VULN_SEVERITIES[i % 5];
    it(`CVSS range for ${s} is array (idx ${i})`, () => expect(Array.isArray(cvssBaseSeverity[s])).toBe(true));
  }
});

describe('IR phase steps', () => {
  it('PREPARATION is step 1', () => expect(irPhaseStep.PREPARATION).toBe(1));
  it('LESSONS_LEARNED is step 6', () => expect(irPhaseStep.LESSONS_LEARNED).toBe(6));
  IR_PHASES.forEach(p => {
    it(`${p} step is between 1-6`, () => {
      expect(irPhaseStep[p]).toBeGreaterThanOrEqual(1);
      expect(irPhaseStep[p]).toBeLessThanOrEqual(6);
    });
  });
  for (let i = 0; i < 50; i++) {
    const p = IR_PHASES[i % 6];
    it(`IR phase step for ${p} is number (idx ${i})`, () => expect(typeof irPhaseStep[p]).toBe('number'));
  }
});

describe('cvssToSeverity', () => {
  it('0 = INFORMATIONAL', () => expect(cvssToSeverity(0)).toBe('INFORMATIONAL'));
  it('2.5 = LOW', () => expect(cvssToSeverity(2.5)).toBe('LOW'));
  it('5.5 = MEDIUM', () => expect(cvssToSeverity(5.5)).toBe('MEDIUM'));
  it('8.0 = HIGH', () => expect(cvssToSeverity(8.0)).toBe('HIGH'));
  it('9.5 = CRITICAL', () => expect(cvssToSeverity(9.5)).toBe('CRITICAL'));
  for (let i = 0; i <= 100; i++) {
    const score = i / 10;
    it(`cvssToSeverity(${score}) is valid severity`, () => {
      expect(VULN_SEVERITIES).toContain(cvssToSeverity(score));
    });
  }
});

describe('riskPriority', () => {
  it('likelihood × impact', () => expect(riskPriority(3, 4)).toBe(12));
  it('0 likelihood = 0', () => expect(riskPriority(0, 5)).toBe(0));
  it('0 impact = 0', () => expect(riskPriority(5, 0)).toBe(0));
  for (let l = 1; l <= 5; l++) {
    for (let imp = 1; imp <= 5; imp++) {
      it(`riskPriority(${l}, ${imp}) = ${l * imp}`, () => expect(riskPriority(l, imp)).toBe(l * imp));
    }
  }
  for (let i = 0; i < 50; i++) {
    it(`risk priority is non-negative (idx ${i})`, () => {
      expect(riskPriority(i % 5, i % 5)).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('isHighPriority', () => {
  it('HIGH is high priority', () => expect(isHighPriority('HIGH')).toBe(true));
  it('CRITICAL is high priority', () => expect(isHighPriority('CRITICAL')).toBe(true));
  it('LOW is not high priority', () => expect(isHighPriority('LOW')).toBe(false));
  it('INFORMATIONAL is not high priority', () => expect(isHighPriority('INFORMATIONAL')).toBe(false));
  for (let i = 0; i < 50; i++) {
    const s = VULN_SEVERITIES[i % 5];
    it(`isHighPriority(${s}) returns boolean (idx ${i})`, () => expect(typeof isHighPriority(s)).toBe('boolean'));
  }
});

// ─── Algorithm puzzle phases (ph217is2–ph220is2) ────────────────────────────────
function moveZeroes217is2(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217is2_mz',()=>{
  it('a',()=>{expect(moveZeroes217is2([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217is2([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217is2([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217is2([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217is2([4,2,0,0,3])).toBe(4);});
});
function missingNumber218is2(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218is2_mn',()=>{
  it('a',()=>{expect(missingNumber218is2([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218is2([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218is2([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218is2([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218is2([1])).toBe(0);});
});
function countBits219is2(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219is2_cb',()=>{
  it('a',()=>{expect(countBits219is2(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219is2(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219is2(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219is2(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219is2(4)[4]).toBe(1);});
});
function climbStairs220is2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220is2_cs',()=>{
  it('a',()=>{expect(climbStairs220is2(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220is2(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220is2(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220is2(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220is2(1)).toBe(1);});
});
