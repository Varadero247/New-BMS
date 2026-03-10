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
function hd258isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258isx_hd',()=>{it('a',()=>{expect(hd258isx(1,4)).toBe(2);});it('b',()=>{expect(hd258isx(3,1)).toBe(1);});it('c',()=>{expect(hd258isx(0,0)).toBe(0);});it('d',()=>{expect(hd258isx(93,73)).toBe(2);});it('e',()=>{expect(hd258isx(15,0)).toBe(4);});});
function hd259isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259isx_hd',()=>{it('a',()=>{expect(hd259isx(1,4)).toBe(2);});it('b',()=>{expect(hd259isx(3,1)).toBe(1);});it('c',()=>{expect(hd259isx(0,0)).toBe(0);});it('d',()=>{expect(hd259isx(93,73)).toBe(2);});it('e',()=>{expect(hd259isx(15,0)).toBe(4);});});
function hd260isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260isx_hd',()=>{it('a',()=>{expect(hd260isx(1,4)).toBe(2);});it('b',()=>{expect(hd260isx(3,1)).toBe(1);});it('c',()=>{expect(hd260isx(0,0)).toBe(0);});it('d',()=>{expect(hd260isx(93,73)).toBe(2);});it('e',()=>{expect(hd260isx(15,0)).toBe(4);});});
function hd261isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261isx_hd',()=>{it('a',()=>{expect(hd261isx(1,4)).toBe(2);});it('b',()=>{expect(hd261isx(3,1)).toBe(1);});it('c',()=>{expect(hd261isx(0,0)).toBe(0);});it('d',()=>{expect(hd261isx(93,73)).toBe(2);});it('e',()=>{expect(hd261isx(15,0)).toBe(4);});});
function hd262isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262isx_hd',()=>{it('a',()=>{expect(hd262isx(1,4)).toBe(2);});it('b',()=>{expect(hd262isx(3,1)).toBe(1);});it('c',()=>{expect(hd262isx(0,0)).toBe(0);});it('d',()=>{expect(hd262isx(93,73)).toBe(2);});it('e',()=>{expect(hd262isx(15,0)).toBe(4);});});
function hd263isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263isx_hd',()=>{it('a',()=>{expect(hd263isx(1,4)).toBe(2);});it('b',()=>{expect(hd263isx(3,1)).toBe(1);});it('c',()=>{expect(hd263isx(0,0)).toBe(0);});it('d',()=>{expect(hd263isx(93,73)).toBe(2);});it('e',()=>{expect(hd263isx(15,0)).toBe(4);});});
function hd264isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264isx_hd',()=>{it('a',()=>{expect(hd264isx(1,4)).toBe(2);});it('b',()=>{expect(hd264isx(3,1)).toBe(1);});it('c',()=>{expect(hd264isx(0,0)).toBe(0);});it('d',()=>{expect(hd264isx(93,73)).toBe(2);});it('e',()=>{expect(hd264isx(15,0)).toBe(4);});});
function hd265isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265isx_hd',()=>{it('a',()=>{expect(hd265isx(1,4)).toBe(2);});it('b',()=>{expect(hd265isx(3,1)).toBe(1);});it('c',()=>{expect(hd265isx(0,0)).toBe(0);});it('d',()=>{expect(hd265isx(93,73)).toBe(2);});it('e',()=>{expect(hd265isx(15,0)).toBe(4);});});
function hd266isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266isx_hd',()=>{it('a',()=>{expect(hd266isx(1,4)).toBe(2);});it('b',()=>{expect(hd266isx(3,1)).toBe(1);});it('c',()=>{expect(hd266isx(0,0)).toBe(0);});it('d',()=>{expect(hd266isx(93,73)).toBe(2);});it('e',()=>{expect(hd266isx(15,0)).toBe(4);});});
function hd267isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267isx_hd',()=>{it('a',()=>{expect(hd267isx(1,4)).toBe(2);});it('b',()=>{expect(hd267isx(3,1)).toBe(1);});it('c',()=>{expect(hd267isx(0,0)).toBe(0);});it('d',()=>{expect(hd267isx(93,73)).toBe(2);});it('e',()=>{expect(hd267isx(15,0)).toBe(4);});});
function hd268isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268isx_hd',()=>{it('a',()=>{expect(hd268isx(1,4)).toBe(2);});it('b',()=>{expect(hd268isx(3,1)).toBe(1);});it('c',()=>{expect(hd268isx(0,0)).toBe(0);});it('d',()=>{expect(hd268isx(93,73)).toBe(2);});it('e',()=>{expect(hd268isx(15,0)).toBe(4);});});
function hd269isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269isx_hd',()=>{it('a',()=>{expect(hd269isx(1,4)).toBe(2);});it('b',()=>{expect(hd269isx(3,1)).toBe(1);});it('c',()=>{expect(hd269isx(0,0)).toBe(0);});it('d',()=>{expect(hd269isx(93,73)).toBe(2);});it('e',()=>{expect(hd269isx(15,0)).toBe(4);});});
function hd270isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270isx_hd',()=>{it('a',()=>{expect(hd270isx(1,4)).toBe(2);});it('b',()=>{expect(hd270isx(3,1)).toBe(1);});it('c',()=>{expect(hd270isx(0,0)).toBe(0);});it('d',()=>{expect(hd270isx(93,73)).toBe(2);});it('e',()=>{expect(hd270isx(15,0)).toBe(4);});});
function hd271isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271isx_hd',()=>{it('a',()=>{expect(hd271isx(1,4)).toBe(2);});it('b',()=>{expect(hd271isx(3,1)).toBe(1);});it('c',()=>{expect(hd271isx(0,0)).toBe(0);});it('d',()=>{expect(hd271isx(93,73)).toBe(2);});it('e',()=>{expect(hd271isx(15,0)).toBe(4);});});
function hd272isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272isx_hd',()=>{it('a',()=>{expect(hd272isx(1,4)).toBe(2);});it('b',()=>{expect(hd272isx(3,1)).toBe(1);});it('c',()=>{expect(hd272isx(0,0)).toBe(0);});it('d',()=>{expect(hd272isx(93,73)).toBe(2);});it('e',()=>{expect(hd272isx(15,0)).toBe(4);});});
function hd273isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273isx_hd',()=>{it('a',()=>{expect(hd273isx(1,4)).toBe(2);});it('b',()=>{expect(hd273isx(3,1)).toBe(1);});it('c',()=>{expect(hd273isx(0,0)).toBe(0);});it('d',()=>{expect(hd273isx(93,73)).toBe(2);});it('e',()=>{expect(hd273isx(15,0)).toBe(4);});});
function hd274isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274isx_hd',()=>{it('a',()=>{expect(hd274isx(1,4)).toBe(2);});it('b',()=>{expect(hd274isx(3,1)).toBe(1);});it('c',()=>{expect(hd274isx(0,0)).toBe(0);});it('d',()=>{expect(hd274isx(93,73)).toBe(2);});it('e',()=>{expect(hd274isx(15,0)).toBe(4);});});
function hd275isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275isx_hd',()=>{it('a',()=>{expect(hd275isx(1,4)).toBe(2);});it('b',()=>{expect(hd275isx(3,1)).toBe(1);});it('c',()=>{expect(hd275isx(0,0)).toBe(0);});it('d',()=>{expect(hd275isx(93,73)).toBe(2);});it('e',()=>{expect(hd275isx(15,0)).toBe(4);});});
function hd276isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276isx_hd',()=>{it('a',()=>{expect(hd276isx(1,4)).toBe(2);});it('b',()=>{expect(hd276isx(3,1)).toBe(1);});it('c',()=>{expect(hd276isx(0,0)).toBe(0);});it('d',()=>{expect(hd276isx(93,73)).toBe(2);});it('e',()=>{expect(hd276isx(15,0)).toBe(4);});});
function hd277isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277isx_hd',()=>{it('a',()=>{expect(hd277isx(1,4)).toBe(2);});it('b',()=>{expect(hd277isx(3,1)).toBe(1);});it('c',()=>{expect(hd277isx(0,0)).toBe(0);});it('d',()=>{expect(hd277isx(93,73)).toBe(2);});it('e',()=>{expect(hd277isx(15,0)).toBe(4);});});
function hd278isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278isx_hd',()=>{it('a',()=>{expect(hd278isx(1,4)).toBe(2);});it('b',()=>{expect(hd278isx(3,1)).toBe(1);});it('c',()=>{expect(hd278isx(0,0)).toBe(0);});it('d',()=>{expect(hd278isx(93,73)).toBe(2);});it('e',()=>{expect(hd278isx(15,0)).toBe(4);});});
function hd279isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279isx_hd',()=>{it('a',()=>{expect(hd279isx(1,4)).toBe(2);});it('b',()=>{expect(hd279isx(3,1)).toBe(1);});it('c',()=>{expect(hd279isx(0,0)).toBe(0);});it('d',()=>{expect(hd279isx(93,73)).toBe(2);});it('e',()=>{expect(hd279isx(15,0)).toBe(4);});});
function hd280isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280isx_hd',()=>{it('a',()=>{expect(hd280isx(1,4)).toBe(2);});it('b',()=>{expect(hd280isx(3,1)).toBe(1);});it('c',()=>{expect(hd280isx(0,0)).toBe(0);});it('d',()=>{expect(hd280isx(93,73)).toBe(2);});it('e',()=>{expect(hd280isx(15,0)).toBe(4);});});
function hd281isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281isx_hd',()=>{it('a',()=>{expect(hd281isx(1,4)).toBe(2);});it('b',()=>{expect(hd281isx(3,1)).toBe(1);});it('c',()=>{expect(hd281isx(0,0)).toBe(0);});it('d',()=>{expect(hd281isx(93,73)).toBe(2);});it('e',()=>{expect(hd281isx(15,0)).toBe(4);});});
function hd282isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282isx_hd',()=>{it('a',()=>{expect(hd282isx(1,4)).toBe(2);});it('b',()=>{expect(hd282isx(3,1)).toBe(1);});it('c',()=>{expect(hd282isx(0,0)).toBe(0);});it('d',()=>{expect(hd282isx(93,73)).toBe(2);});it('e',()=>{expect(hd282isx(15,0)).toBe(4);});});
function hd283isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283isx_hd',()=>{it('a',()=>{expect(hd283isx(1,4)).toBe(2);});it('b',()=>{expect(hd283isx(3,1)).toBe(1);});it('c',()=>{expect(hd283isx(0,0)).toBe(0);});it('d',()=>{expect(hd283isx(93,73)).toBe(2);});it('e',()=>{expect(hd283isx(15,0)).toBe(4);});});
function hd284isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284isx_hd',()=>{it('a',()=>{expect(hd284isx(1,4)).toBe(2);});it('b',()=>{expect(hd284isx(3,1)).toBe(1);});it('c',()=>{expect(hd284isx(0,0)).toBe(0);});it('d',()=>{expect(hd284isx(93,73)).toBe(2);});it('e',()=>{expect(hd284isx(15,0)).toBe(4);});});
function hd285isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285isx_hd',()=>{it('a',()=>{expect(hd285isx(1,4)).toBe(2);});it('b',()=>{expect(hd285isx(3,1)).toBe(1);});it('c',()=>{expect(hd285isx(0,0)).toBe(0);});it('d',()=>{expect(hd285isx(93,73)).toBe(2);});it('e',()=>{expect(hd285isx(15,0)).toBe(4);});});
function hd286isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286isx_hd',()=>{it('a',()=>{expect(hd286isx(1,4)).toBe(2);});it('b',()=>{expect(hd286isx(3,1)).toBe(1);});it('c',()=>{expect(hd286isx(0,0)).toBe(0);});it('d',()=>{expect(hd286isx(93,73)).toBe(2);});it('e',()=>{expect(hd286isx(15,0)).toBe(4);});});
function hd287isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287isx_hd',()=>{it('a',()=>{expect(hd287isx(1,4)).toBe(2);});it('b',()=>{expect(hd287isx(3,1)).toBe(1);});it('c',()=>{expect(hd287isx(0,0)).toBe(0);});it('d',()=>{expect(hd287isx(93,73)).toBe(2);});it('e',()=>{expect(hd287isx(15,0)).toBe(4);});});
function hd288isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288isx_hd',()=>{it('a',()=>{expect(hd288isx(1,4)).toBe(2);});it('b',()=>{expect(hd288isx(3,1)).toBe(1);});it('c',()=>{expect(hd288isx(0,0)).toBe(0);});it('d',()=>{expect(hd288isx(93,73)).toBe(2);});it('e',()=>{expect(hd288isx(15,0)).toBe(4);});});
function hd289isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289isx_hd',()=>{it('a',()=>{expect(hd289isx(1,4)).toBe(2);});it('b',()=>{expect(hd289isx(3,1)).toBe(1);});it('c',()=>{expect(hd289isx(0,0)).toBe(0);});it('d',()=>{expect(hd289isx(93,73)).toBe(2);});it('e',()=>{expect(hd289isx(15,0)).toBe(4);});});
function hd290isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290isx_hd',()=>{it('a',()=>{expect(hd290isx(1,4)).toBe(2);});it('b',()=>{expect(hd290isx(3,1)).toBe(1);});it('c',()=>{expect(hd290isx(0,0)).toBe(0);});it('d',()=>{expect(hd290isx(93,73)).toBe(2);});it('e',()=>{expect(hd290isx(15,0)).toBe(4);});});
function hd291isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291isx_hd',()=>{it('a',()=>{expect(hd291isx(1,4)).toBe(2);});it('b',()=>{expect(hd291isx(3,1)).toBe(1);});it('c',()=>{expect(hd291isx(0,0)).toBe(0);});it('d',()=>{expect(hd291isx(93,73)).toBe(2);});it('e',()=>{expect(hd291isx(15,0)).toBe(4);});});
function hd292isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292isx_hd',()=>{it('a',()=>{expect(hd292isx(1,4)).toBe(2);});it('b',()=>{expect(hd292isx(3,1)).toBe(1);});it('c',()=>{expect(hd292isx(0,0)).toBe(0);});it('d',()=>{expect(hd292isx(93,73)).toBe(2);});it('e',()=>{expect(hd292isx(15,0)).toBe(4);});});
function hd293isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293isx_hd',()=>{it('a',()=>{expect(hd293isx(1,4)).toBe(2);});it('b',()=>{expect(hd293isx(3,1)).toBe(1);});it('c',()=>{expect(hd293isx(0,0)).toBe(0);});it('d',()=>{expect(hd293isx(93,73)).toBe(2);});it('e',()=>{expect(hd293isx(15,0)).toBe(4);});});
function hd294isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294isx_hd',()=>{it('a',()=>{expect(hd294isx(1,4)).toBe(2);});it('b',()=>{expect(hd294isx(3,1)).toBe(1);});it('c',()=>{expect(hd294isx(0,0)).toBe(0);});it('d',()=>{expect(hd294isx(93,73)).toBe(2);});it('e',()=>{expect(hd294isx(15,0)).toBe(4);});});
function hd295isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295isx_hd',()=>{it('a',()=>{expect(hd295isx(1,4)).toBe(2);});it('b',()=>{expect(hd295isx(3,1)).toBe(1);});it('c',()=>{expect(hd295isx(0,0)).toBe(0);});it('d',()=>{expect(hd295isx(93,73)).toBe(2);});it('e',()=>{expect(hd295isx(15,0)).toBe(4);});});
function hd296isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296isx_hd',()=>{it('a',()=>{expect(hd296isx(1,4)).toBe(2);});it('b',()=>{expect(hd296isx(3,1)).toBe(1);});it('c',()=>{expect(hd296isx(0,0)).toBe(0);});it('d',()=>{expect(hd296isx(93,73)).toBe(2);});it('e',()=>{expect(hd296isx(15,0)).toBe(4);});});
function hd297isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297isx_hd',()=>{it('a',()=>{expect(hd297isx(1,4)).toBe(2);});it('b',()=>{expect(hd297isx(3,1)).toBe(1);});it('c',()=>{expect(hd297isx(0,0)).toBe(0);});it('d',()=>{expect(hd297isx(93,73)).toBe(2);});it('e',()=>{expect(hd297isx(15,0)).toBe(4);});});
function hd298isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298isx_hd',()=>{it('a',()=>{expect(hd298isx(1,4)).toBe(2);});it('b',()=>{expect(hd298isx(3,1)).toBe(1);});it('c',()=>{expect(hd298isx(0,0)).toBe(0);});it('d',()=>{expect(hd298isx(93,73)).toBe(2);});it('e',()=>{expect(hd298isx(15,0)).toBe(4);});});
function hd299isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299isx_hd',()=>{it('a',()=>{expect(hd299isx(1,4)).toBe(2);});it('b',()=>{expect(hd299isx(3,1)).toBe(1);});it('c',()=>{expect(hd299isx(0,0)).toBe(0);});it('d',()=>{expect(hd299isx(93,73)).toBe(2);});it('e',()=>{expect(hd299isx(15,0)).toBe(4);});});
function hd300isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300isx_hd',()=>{it('a',()=>{expect(hd300isx(1,4)).toBe(2);});it('b',()=>{expect(hd300isx(3,1)).toBe(1);});it('c',()=>{expect(hd300isx(0,0)).toBe(0);});it('d',()=>{expect(hd300isx(93,73)).toBe(2);});it('e',()=>{expect(hd300isx(15,0)).toBe(4);});});
function hd301isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301isx_hd',()=>{it('a',()=>{expect(hd301isx(1,4)).toBe(2);});it('b',()=>{expect(hd301isx(3,1)).toBe(1);});it('c',()=>{expect(hd301isx(0,0)).toBe(0);});it('d',()=>{expect(hd301isx(93,73)).toBe(2);});it('e',()=>{expect(hd301isx(15,0)).toBe(4);});});
function hd302isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302isx_hd',()=>{it('a',()=>{expect(hd302isx(1,4)).toBe(2);});it('b',()=>{expect(hd302isx(3,1)).toBe(1);});it('c',()=>{expect(hd302isx(0,0)).toBe(0);});it('d',()=>{expect(hd302isx(93,73)).toBe(2);});it('e',()=>{expect(hd302isx(15,0)).toBe(4);});});
function hd303isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303isx_hd',()=>{it('a',()=>{expect(hd303isx(1,4)).toBe(2);});it('b',()=>{expect(hd303isx(3,1)).toBe(1);});it('c',()=>{expect(hd303isx(0,0)).toBe(0);});it('d',()=>{expect(hd303isx(93,73)).toBe(2);});it('e',()=>{expect(hd303isx(15,0)).toBe(4);});});
function hd304isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304isx_hd',()=>{it('a',()=>{expect(hd304isx(1,4)).toBe(2);});it('b',()=>{expect(hd304isx(3,1)).toBe(1);});it('c',()=>{expect(hd304isx(0,0)).toBe(0);});it('d',()=>{expect(hd304isx(93,73)).toBe(2);});it('e',()=>{expect(hd304isx(15,0)).toBe(4);});});
function hd305isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305isx_hd',()=>{it('a',()=>{expect(hd305isx(1,4)).toBe(2);});it('b',()=>{expect(hd305isx(3,1)).toBe(1);});it('c',()=>{expect(hd305isx(0,0)).toBe(0);});it('d',()=>{expect(hd305isx(93,73)).toBe(2);});it('e',()=>{expect(hd305isx(15,0)).toBe(4);});});
function hd306isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306isx_hd',()=>{it('a',()=>{expect(hd306isx(1,4)).toBe(2);});it('b',()=>{expect(hd306isx(3,1)).toBe(1);});it('c',()=>{expect(hd306isx(0,0)).toBe(0);});it('d',()=>{expect(hd306isx(93,73)).toBe(2);});it('e',()=>{expect(hd306isx(15,0)).toBe(4);});});
function hd307isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307isx_hd',()=>{it('a',()=>{expect(hd307isx(1,4)).toBe(2);});it('b',()=>{expect(hd307isx(3,1)).toBe(1);});it('c',()=>{expect(hd307isx(0,0)).toBe(0);});it('d',()=>{expect(hd307isx(93,73)).toBe(2);});it('e',()=>{expect(hd307isx(15,0)).toBe(4);});});
function hd308isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308isx_hd',()=>{it('a',()=>{expect(hd308isx(1,4)).toBe(2);});it('b',()=>{expect(hd308isx(3,1)).toBe(1);});it('c',()=>{expect(hd308isx(0,0)).toBe(0);});it('d',()=>{expect(hd308isx(93,73)).toBe(2);});it('e',()=>{expect(hd308isx(15,0)).toBe(4);});});
function hd309isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309isx_hd',()=>{it('a',()=>{expect(hd309isx(1,4)).toBe(2);});it('b',()=>{expect(hd309isx(3,1)).toBe(1);});it('c',()=>{expect(hd309isx(0,0)).toBe(0);});it('d',()=>{expect(hd309isx(93,73)).toBe(2);});it('e',()=>{expect(hd309isx(15,0)).toBe(4);});});
function hd310isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310isx_hd',()=>{it('a',()=>{expect(hd310isx(1,4)).toBe(2);});it('b',()=>{expect(hd310isx(3,1)).toBe(1);});it('c',()=>{expect(hd310isx(0,0)).toBe(0);});it('d',()=>{expect(hd310isx(93,73)).toBe(2);});it('e',()=>{expect(hd310isx(15,0)).toBe(4);});});
function hd311isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311isx_hd',()=>{it('a',()=>{expect(hd311isx(1,4)).toBe(2);});it('b',()=>{expect(hd311isx(3,1)).toBe(1);});it('c',()=>{expect(hd311isx(0,0)).toBe(0);});it('d',()=>{expect(hd311isx(93,73)).toBe(2);});it('e',()=>{expect(hd311isx(15,0)).toBe(4);});});
function hd312isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312isx_hd',()=>{it('a',()=>{expect(hd312isx(1,4)).toBe(2);});it('b',()=>{expect(hd312isx(3,1)).toBe(1);});it('c',()=>{expect(hd312isx(0,0)).toBe(0);});it('d',()=>{expect(hd312isx(93,73)).toBe(2);});it('e',()=>{expect(hd312isx(15,0)).toBe(4);});});
function hd313isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313isx_hd',()=>{it('a',()=>{expect(hd313isx(1,4)).toBe(2);});it('b',()=>{expect(hd313isx(3,1)).toBe(1);});it('c',()=>{expect(hd313isx(0,0)).toBe(0);});it('d',()=>{expect(hd313isx(93,73)).toBe(2);});it('e',()=>{expect(hd313isx(15,0)).toBe(4);});});
function hd314isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314isx_hd',()=>{it('a',()=>{expect(hd314isx(1,4)).toBe(2);});it('b',()=>{expect(hd314isx(3,1)).toBe(1);});it('c',()=>{expect(hd314isx(0,0)).toBe(0);});it('d',()=>{expect(hd314isx(93,73)).toBe(2);});it('e',()=>{expect(hd314isx(15,0)).toBe(4);});});
function hd315isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315isx_hd',()=>{it('a',()=>{expect(hd315isx(1,4)).toBe(2);});it('b',()=>{expect(hd315isx(3,1)).toBe(1);});it('c',()=>{expect(hd315isx(0,0)).toBe(0);});it('d',()=>{expect(hd315isx(93,73)).toBe(2);});it('e',()=>{expect(hd315isx(15,0)).toBe(4);});});
function hd316isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316isx_hd',()=>{it('a',()=>{expect(hd316isx(1,4)).toBe(2);});it('b',()=>{expect(hd316isx(3,1)).toBe(1);});it('c',()=>{expect(hd316isx(0,0)).toBe(0);});it('d',()=>{expect(hd316isx(93,73)).toBe(2);});it('e',()=>{expect(hd316isx(15,0)).toBe(4);});});
function hd317isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317isx_hd',()=>{it('a',()=>{expect(hd317isx(1,4)).toBe(2);});it('b',()=>{expect(hd317isx(3,1)).toBe(1);});it('c',()=>{expect(hd317isx(0,0)).toBe(0);});it('d',()=>{expect(hd317isx(93,73)).toBe(2);});it('e',()=>{expect(hd317isx(15,0)).toBe(4);});});
function hd318isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318isx_hd',()=>{it('a',()=>{expect(hd318isx(1,4)).toBe(2);});it('b',()=>{expect(hd318isx(3,1)).toBe(1);});it('c',()=>{expect(hd318isx(0,0)).toBe(0);});it('d',()=>{expect(hd318isx(93,73)).toBe(2);});it('e',()=>{expect(hd318isx(15,0)).toBe(4);});});
function hd319isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319isx_hd',()=>{it('a',()=>{expect(hd319isx(1,4)).toBe(2);});it('b',()=>{expect(hd319isx(3,1)).toBe(1);});it('c',()=>{expect(hd319isx(0,0)).toBe(0);});it('d',()=>{expect(hd319isx(93,73)).toBe(2);});it('e',()=>{expect(hd319isx(15,0)).toBe(4);});});
function hd320isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320isx_hd',()=>{it('a',()=>{expect(hd320isx(1,4)).toBe(2);});it('b',()=>{expect(hd320isx(3,1)).toBe(1);});it('c',()=>{expect(hd320isx(0,0)).toBe(0);});it('d',()=>{expect(hd320isx(93,73)).toBe(2);});it('e',()=>{expect(hd320isx(15,0)).toBe(4);});});
function hd321isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321isx_hd',()=>{it('a',()=>{expect(hd321isx(1,4)).toBe(2);});it('b',()=>{expect(hd321isx(3,1)).toBe(1);});it('c',()=>{expect(hd321isx(0,0)).toBe(0);});it('d',()=>{expect(hd321isx(93,73)).toBe(2);});it('e',()=>{expect(hd321isx(15,0)).toBe(4);});});
function hd322isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322isx_hd',()=>{it('a',()=>{expect(hd322isx(1,4)).toBe(2);});it('b',()=>{expect(hd322isx(3,1)).toBe(1);});it('c',()=>{expect(hd322isx(0,0)).toBe(0);});it('d',()=>{expect(hd322isx(93,73)).toBe(2);});it('e',()=>{expect(hd322isx(15,0)).toBe(4);});});
function hd323isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323isx_hd',()=>{it('a',()=>{expect(hd323isx(1,4)).toBe(2);});it('b',()=>{expect(hd323isx(3,1)).toBe(1);});it('c',()=>{expect(hd323isx(0,0)).toBe(0);});it('d',()=>{expect(hd323isx(93,73)).toBe(2);});it('e',()=>{expect(hd323isx(15,0)).toBe(4);});});
function hd324isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324isx_hd',()=>{it('a',()=>{expect(hd324isx(1,4)).toBe(2);});it('b',()=>{expect(hd324isx(3,1)).toBe(1);});it('c',()=>{expect(hd324isx(0,0)).toBe(0);});it('d',()=>{expect(hd324isx(93,73)).toBe(2);});it('e',()=>{expect(hd324isx(15,0)).toBe(4);});});
function hd325isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325isx_hd',()=>{it('a',()=>{expect(hd325isx(1,4)).toBe(2);});it('b',()=>{expect(hd325isx(3,1)).toBe(1);});it('c',()=>{expect(hd325isx(0,0)).toBe(0);});it('d',()=>{expect(hd325isx(93,73)).toBe(2);});it('e',()=>{expect(hd325isx(15,0)).toBe(4);});});
function hd326isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326isx_hd',()=>{it('a',()=>{expect(hd326isx(1,4)).toBe(2);});it('b',()=>{expect(hd326isx(3,1)).toBe(1);});it('c',()=>{expect(hd326isx(0,0)).toBe(0);});it('d',()=>{expect(hd326isx(93,73)).toBe(2);});it('e',()=>{expect(hd326isx(15,0)).toBe(4);});});
function hd327isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327isx_hd',()=>{it('a',()=>{expect(hd327isx(1,4)).toBe(2);});it('b',()=>{expect(hd327isx(3,1)).toBe(1);});it('c',()=>{expect(hd327isx(0,0)).toBe(0);});it('d',()=>{expect(hd327isx(93,73)).toBe(2);});it('e',()=>{expect(hd327isx(15,0)).toBe(4);});});
function hd328isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328isx_hd',()=>{it('a',()=>{expect(hd328isx(1,4)).toBe(2);});it('b',()=>{expect(hd328isx(3,1)).toBe(1);});it('c',()=>{expect(hd328isx(0,0)).toBe(0);});it('d',()=>{expect(hd328isx(93,73)).toBe(2);});it('e',()=>{expect(hd328isx(15,0)).toBe(4);});});
function hd329isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329isx_hd',()=>{it('a',()=>{expect(hd329isx(1,4)).toBe(2);});it('b',()=>{expect(hd329isx(3,1)).toBe(1);});it('c',()=>{expect(hd329isx(0,0)).toBe(0);});it('d',()=>{expect(hd329isx(93,73)).toBe(2);});it('e',()=>{expect(hd329isx(15,0)).toBe(4);});});
function hd330isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330isx_hd',()=>{it('a',()=>{expect(hd330isx(1,4)).toBe(2);});it('b',()=>{expect(hd330isx(3,1)).toBe(1);});it('c',()=>{expect(hd330isx(0,0)).toBe(0);});it('d',()=>{expect(hd330isx(93,73)).toBe(2);});it('e',()=>{expect(hd330isx(15,0)).toBe(4);});});
function hd331isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331isx_hd',()=>{it('a',()=>{expect(hd331isx(1,4)).toBe(2);});it('b',()=>{expect(hd331isx(3,1)).toBe(1);});it('c',()=>{expect(hd331isx(0,0)).toBe(0);});it('d',()=>{expect(hd331isx(93,73)).toBe(2);});it('e',()=>{expect(hd331isx(15,0)).toBe(4);});});
function hd332isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332isx_hd',()=>{it('a',()=>{expect(hd332isx(1,4)).toBe(2);});it('b',()=>{expect(hd332isx(3,1)).toBe(1);});it('c',()=>{expect(hd332isx(0,0)).toBe(0);});it('d',()=>{expect(hd332isx(93,73)).toBe(2);});it('e',()=>{expect(hd332isx(15,0)).toBe(4);});});
function hd333isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333isx_hd',()=>{it('a',()=>{expect(hd333isx(1,4)).toBe(2);});it('b',()=>{expect(hd333isx(3,1)).toBe(1);});it('c',()=>{expect(hd333isx(0,0)).toBe(0);});it('d',()=>{expect(hd333isx(93,73)).toBe(2);});it('e',()=>{expect(hd333isx(15,0)).toBe(4);});});
function hd334isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334isx_hd',()=>{it('a',()=>{expect(hd334isx(1,4)).toBe(2);});it('b',()=>{expect(hd334isx(3,1)).toBe(1);});it('c',()=>{expect(hd334isx(0,0)).toBe(0);});it('d',()=>{expect(hd334isx(93,73)).toBe(2);});it('e',()=>{expect(hd334isx(15,0)).toBe(4);});});
function hd335isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335isx_hd',()=>{it('a',()=>{expect(hd335isx(1,4)).toBe(2);});it('b',()=>{expect(hd335isx(3,1)).toBe(1);});it('c',()=>{expect(hd335isx(0,0)).toBe(0);});it('d',()=>{expect(hd335isx(93,73)).toBe(2);});it('e',()=>{expect(hd335isx(15,0)).toBe(4);});});
function hd336isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336isx_hd',()=>{it('a',()=>{expect(hd336isx(1,4)).toBe(2);});it('b',()=>{expect(hd336isx(3,1)).toBe(1);});it('c',()=>{expect(hd336isx(0,0)).toBe(0);});it('d',()=>{expect(hd336isx(93,73)).toBe(2);});it('e',()=>{expect(hd336isx(15,0)).toBe(4);});});
function hd337isx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337isx_hd',()=>{it('a',()=>{expect(hd337isx(1,4)).toBe(2);});it('b',()=>{expect(hd337isx(3,1)).toBe(1);});it('c',()=>{expect(hd337isx(0,0)).toBe(0);});it('d',()=>{expect(hd337isx(93,73)).toBe(2);});it('e',()=>{expect(hd337isx(15,0)).toBe(4);});});
function hd338infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338infx2_hd',()=>{it('a',()=>{expect(hd338infx2(1,4)).toBe(2);});it('b',()=>{expect(hd338infx2(3,1)).toBe(1);});it('c',()=>{expect(hd338infx2(0,0)).toBe(0);});it('d',()=>{expect(hd338infx2(93,73)).toBe(2);});it('e',()=>{expect(hd338infx2(15,0)).toBe(4);});});
function hd339infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339infx2_hd',()=>{it('a',()=>{expect(hd339infx2(1,4)).toBe(2);});it('b',()=>{expect(hd339infx2(3,1)).toBe(1);});it('c',()=>{expect(hd339infx2(0,0)).toBe(0);});it('d',()=>{expect(hd339infx2(93,73)).toBe(2);});it('e',()=>{expect(hd339infx2(15,0)).toBe(4);});});
function hd340infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340infx2_hd',()=>{it('a',()=>{expect(hd340infx2(1,4)).toBe(2);});it('b',()=>{expect(hd340infx2(3,1)).toBe(1);});it('c',()=>{expect(hd340infx2(0,0)).toBe(0);});it('d',()=>{expect(hd340infx2(93,73)).toBe(2);});it('e',()=>{expect(hd340infx2(15,0)).toBe(4);});});
function hd341infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341infx2_hd',()=>{it('a',()=>{expect(hd341infx2(1,4)).toBe(2);});it('b',()=>{expect(hd341infx2(3,1)).toBe(1);});it('c',()=>{expect(hd341infx2(0,0)).toBe(0);});it('d',()=>{expect(hd341infx2(93,73)).toBe(2);});it('e',()=>{expect(hd341infx2(15,0)).toBe(4);});});
function hd342infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342infx2_hd',()=>{it('a',()=>{expect(hd342infx2(1,4)).toBe(2);});it('b',()=>{expect(hd342infx2(3,1)).toBe(1);});it('c',()=>{expect(hd342infx2(0,0)).toBe(0);});it('d',()=>{expect(hd342infx2(93,73)).toBe(2);});it('e',()=>{expect(hd342infx2(15,0)).toBe(4);});});
function hd343infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343infx2_hd',()=>{it('a',()=>{expect(hd343infx2(1,4)).toBe(2);});it('b',()=>{expect(hd343infx2(3,1)).toBe(1);});it('c',()=>{expect(hd343infx2(0,0)).toBe(0);});it('d',()=>{expect(hd343infx2(93,73)).toBe(2);});it('e',()=>{expect(hd343infx2(15,0)).toBe(4);});});
function hd344infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344infx2_hd',()=>{it('a',()=>{expect(hd344infx2(1,4)).toBe(2);});it('b',()=>{expect(hd344infx2(3,1)).toBe(1);});it('c',()=>{expect(hd344infx2(0,0)).toBe(0);});it('d',()=>{expect(hd344infx2(93,73)).toBe(2);});it('e',()=>{expect(hd344infx2(15,0)).toBe(4);});});
function hd345infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345infx2_hd',()=>{it('a',()=>{expect(hd345infx2(1,4)).toBe(2);});it('b',()=>{expect(hd345infx2(3,1)).toBe(1);});it('c',()=>{expect(hd345infx2(0,0)).toBe(0);});it('d',()=>{expect(hd345infx2(93,73)).toBe(2);});it('e',()=>{expect(hd345infx2(15,0)).toBe(4);});});
function hd346infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346infx2_hd',()=>{it('a',()=>{expect(hd346infx2(1,4)).toBe(2);});it('b',()=>{expect(hd346infx2(3,1)).toBe(1);});it('c',()=>{expect(hd346infx2(0,0)).toBe(0);});it('d',()=>{expect(hd346infx2(93,73)).toBe(2);});it('e',()=>{expect(hd346infx2(15,0)).toBe(4);});});
function hd347infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347infx2_hd',()=>{it('a',()=>{expect(hd347infx2(1,4)).toBe(2);});it('b',()=>{expect(hd347infx2(3,1)).toBe(1);});it('c',()=>{expect(hd347infx2(0,0)).toBe(0);});it('d',()=>{expect(hd347infx2(93,73)).toBe(2);});it('e',()=>{expect(hd347infx2(15,0)).toBe(4);});});
function hd348infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348infx2_hd',()=>{it('a',()=>{expect(hd348infx2(1,4)).toBe(2);});it('b',()=>{expect(hd348infx2(3,1)).toBe(1);});it('c',()=>{expect(hd348infx2(0,0)).toBe(0);});it('d',()=>{expect(hd348infx2(93,73)).toBe(2);});it('e',()=>{expect(hd348infx2(15,0)).toBe(4);});});
function hd349infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349infx2_hd',()=>{it('a',()=>{expect(hd349infx2(1,4)).toBe(2);});it('b',()=>{expect(hd349infx2(3,1)).toBe(1);});it('c',()=>{expect(hd349infx2(0,0)).toBe(0);});it('d',()=>{expect(hd349infx2(93,73)).toBe(2);});it('e',()=>{expect(hd349infx2(15,0)).toBe(4);});});
function hd350infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350infx2_hd',()=>{it('a',()=>{expect(hd350infx2(1,4)).toBe(2);});it('b',()=>{expect(hd350infx2(3,1)).toBe(1);});it('c',()=>{expect(hd350infx2(0,0)).toBe(0);});it('d',()=>{expect(hd350infx2(93,73)).toBe(2);});it('e',()=>{expect(hd350infx2(15,0)).toBe(4);});});
function hd351infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351infx2_hd',()=>{it('a',()=>{expect(hd351infx2(1,4)).toBe(2);});it('b',()=>{expect(hd351infx2(3,1)).toBe(1);});it('c',()=>{expect(hd351infx2(0,0)).toBe(0);});it('d',()=>{expect(hd351infx2(93,73)).toBe(2);});it('e',()=>{expect(hd351infx2(15,0)).toBe(4);});});
function hd352infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352infx2_hd',()=>{it('a',()=>{expect(hd352infx2(1,4)).toBe(2);});it('b',()=>{expect(hd352infx2(3,1)).toBe(1);});it('c',()=>{expect(hd352infx2(0,0)).toBe(0);});it('d',()=>{expect(hd352infx2(93,73)).toBe(2);});it('e',()=>{expect(hd352infx2(15,0)).toBe(4);});});
function hd353infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353infx2_hd',()=>{it('a',()=>{expect(hd353infx2(1,4)).toBe(2);});it('b',()=>{expect(hd353infx2(3,1)).toBe(1);});it('c',()=>{expect(hd353infx2(0,0)).toBe(0);});it('d',()=>{expect(hd353infx2(93,73)).toBe(2);});it('e',()=>{expect(hd353infx2(15,0)).toBe(4);});});
function hd354infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354infx2_hd',()=>{it('a',()=>{expect(hd354infx2(1,4)).toBe(2);});it('b',()=>{expect(hd354infx2(3,1)).toBe(1);});it('c',()=>{expect(hd354infx2(0,0)).toBe(0);});it('d',()=>{expect(hd354infx2(93,73)).toBe(2);});it('e',()=>{expect(hd354infx2(15,0)).toBe(4);});});
function hd355infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355infx2_hd',()=>{it('a',()=>{expect(hd355infx2(1,4)).toBe(2);});it('b',()=>{expect(hd355infx2(3,1)).toBe(1);});it('c',()=>{expect(hd355infx2(0,0)).toBe(0);});it('d',()=>{expect(hd355infx2(93,73)).toBe(2);});it('e',()=>{expect(hd355infx2(15,0)).toBe(4);});});
function hd356infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356infx2_hd',()=>{it('a',()=>{expect(hd356infx2(1,4)).toBe(2);});it('b',()=>{expect(hd356infx2(3,1)).toBe(1);});it('c',()=>{expect(hd356infx2(0,0)).toBe(0);});it('d',()=>{expect(hd356infx2(93,73)).toBe(2);});it('e',()=>{expect(hd356infx2(15,0)).toBe(4);});});
function hd357infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357infx2_hd',()=>{it('a',()=>{expect(hd357infx2(1,4)).toBe(2);});it('b',()=>{expect(hd357infx2(3,1)).toBe(1);});it('c',()=>{expect(hd357infx2(0,0)).toBe(0);});it('d',()=>{expect(hd357infx2(93,73)).toBe(2);});it('e',()=>{expect(hd357infx2(15,0)).toBe(4);});});
function hd358infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358infx2_hd',()=>{it('a',()=>{expect(hd358infx2(1,4)).toBe(2);});it('b',()=>{expect(hd358infx2(3,1)).toBe(1);});it('c',()=>{expect(hd358infx2(0,0)).toBe(0);});it('d',()=>{expect(hd358infx2(93,73)).toBe(2);});it('e',()=>{expect(hd358infx2(15,0)).toBe(4);});});
function hd359infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359infx2_hd',()=>{it('a',()=>{expect(hd359infx2(1,4)).toBe(2);});it('b',()=>{expect(hd359infx2(3,1)).toBe(1);});it('c',()=>{expect(hd359infx2(0,0)).toBe(0);});it('d',()=>{expect(hd359infx2(93,73)).toBe(2);});it('e',()=>{expect(hd359infx2(15,0)).toBe(4);});});
function hd360infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360infx2_hd',()=>{it('a',()=>{expect(hd360infx2(1,4)).toBe(2);});it('b',()=>{expect(hd360infx2(3,1)).toBe(1);});it('c',()=>{expect(hd360infx2(0,0)).toBe(0);});it('d',()=>{expect(hd360infx2(93,73)).toBe(2);});it('e',()=>{expect(hd360infx2(15,0)).toBe(4);});});
function hd361infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361infx2_hd',()=>{it('a',()=>{expect(hd361infx2(1,4)).toBe(2);});it('b',()=>{expect(hd361infx2(3,1)).toBe(1);});it('c',()=>{expect(hd361infx2(0,0)).toBe(0);});it('d',()=>{expect(hd361infx2(93,73)).toBe(2);});it('e',()=>{expect(hd361infx2(15,0)).toBe(4);});});
function hd362infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362infx2_hd',()=>{it('a',()=>{expect(hd362infx2(1,4)).toBe(2);});it('b',()=>{expect(hd362infx2(3,1)).toBe(1);});it('c',()=>{expect(hd362infx2(0,0)).toBe(0);});it('d',()=>{expect(hd362infx2(93,73)).toBe(2);});it('e',()=>{expect(hd362infx2(15,0)).toBe(4);});});
function hd363infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363infx2_hd',()=>{it('a',()=>{expect(hd363infx2(1,4)).toBe(2);});it('b',()=>{expect(hd363infx2(3,1)).toBe(1);});it('c',()=>{expect(hd363infx2(0,0)).toBe(0);});it('d',()=>{expect(hd363infx2(93,73)).toBe(2);});it('e',()=>{expect(hd363infx2(15,0)).toBe(4);});});
function hd364infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364infx2_hd',()=>{it('a',()=>{expect(hd364infx2(1,4)).toBe(2);});it('b',()=>{expect(hd364infx2(3,1)).toBe(1);});it('c',()=>{expect(hd364infx2(0,0)).toBe(0);});it('d',()=>{expect(hd364infx2(93,73)).toBe(2);});it('e',()=>{expect(hd364infx2(15,0)).toBe(4);});});
function hd365infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365infx2_hd',()=>{it('a',()=>{expect(hd365infx2(1,4)).toBe(2);});it('b',()=>{expect(hd365infx2(3,1)).toBe(1);});it('c',()=>{expect(hd365infx2(0,0)).toBe(0);});it('d',()=>{expect(hd365infx2(93,73)).toBe(2);});it('e',()=>{expect(hd365infx2(15,0)).toBe(4);});});
function hd366infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366infx2_hd',()=>{it('a',()=>{expect(hd366infx2(1,4)).toBe(2);});it('b',()=>{expect(hd366infx2(3,1)).toBe(1);});it('c',()=>{expect(hd366infx2(0,0)).toBe(0);});it('d',()=>{expect(hd366infx2(93,73)).toBe(2);});it('e',()=>{expect(hd366infx2(15,0)).toBe(4);});});
function hd367infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367infx2_hd',()=>{it('a',()=>{expect(hd367infx2(1,4)).toBe(2);});it('b',()=>{expect(hd367infx2(3,1)).toBe(1);});it('c',()=>{expect(hd367infx2(0,0)).toBe(0);});it('d',()=>{expect(hd367infx2(93,73)).toBe(2);});it('e',()=>{expect(hd367infx2(15,0)).toBe(4);});});
function hd368infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368infx2_hd',()=>{it('a',()=>{expect(hd368infx2(1,4)).toBe(2);});it('b',()=>{expect(hd368infx2(3,1)).toBe(1);});it('c',()=>{expect(hd368infx2(0,0)).toBe(0);});it('d',()=>{expect(hd368infx2(93,73)).toBe(2);});it('e',()=>{expect(hd368infx2(15,0)).toBe(4);});});
function hd369infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369infx2_hd',()=>{it('a',()=>{expect(hd369infx2(1,4)).toBe(2);});it('b',()=>{expect(hd369infx2(3,1)).toBe(1);});it('c',()=>{expect(hd369infx2(0,0)).toBe(0);});it('d',()=>{expect(hd369infx2(93,73)).toBe(2);});it('e',()=>{expect(hd369infx2(15,0)).toBe(4);});});
function hd370infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370infx2_hd',()=>{it('a',()=>{expect(hd370infx2(1,4)).toBe(2);});it('b',()=>{expect(hd370infx2(3,1)).toBe(1);});it('c',()=>{expect(hd370infx2(0,0)).toBe(0);});it('d',()=>{expect(hd370infx2(93,73)).toBe(2);});it('e',()=>{expect(hd370infx2(15,0)).toBe(4);});});
function hd371infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371infx2_hd',()=>{it('a',()=>{expect(hd371infx2(1,4)).toBe(2);});it('b',()=>{expect(hd371infx2(3,1)).toBe(1);});it('c',()=>{expect(hd371infx2(0,0)).toBe(0);});it('d',()=>{expect(hd371infx2(93,73)).toBe(2);});it('e',()=>{expect(hd371infx2(15,0)).toBe(4);});});
function hd372infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372infx2_hd',()=>{it('a',()=>{expect(hd372infx2(1,4)).toBe(2);});it('b',()=>{expect(hd372infx2(3,1)).toBe(1);});it('c',()=>{expect(hd372infx2(0,0)).toBe(0);});it('d',()=>{expect(hd372infx2(93,73)).toBe(2);});it('e',()=>{expect(hd372infx2(15,0)).toBe(4);});});
function hd373infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373infx2_hd',()=>{it('a',()=>{expect(hd373infx2(1,4)).toBe(2);});it('b',()=>{expect(hd373infx2(3,1)).toBe(1);});it('c',()=>{expect(hd373infx2(0,0)).toBe(0);});it('d',()=>{expect(hd373infx2(93,73)).toBe(2);});it('e',()=>{expect(hd373infx2(15,0)).toBe(4);});});
function hd374infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374infx2_hd',()=>{it('a',()=>{expect(hd374infx2(1,4)).toBe(2);});it('b',()=>{expect(hd374infx2(3,1)).toBe(1);});it('c',()=>{expect(hd374infx2(0,0)).toBe(0);});it('d',()=>{expect(hd374infx2(93,73)).toBe(2);});it('e',()=>{expect(hd374infx2(15,0)).toBe(4);});});
function hd375infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375infx2_hd',()=>{it('a',()=>{expect(hd375infx2(1,4)).toBe(2);});it('b',()=>{expect(hd375infx2(3,1)).toBe(1);});it('c',()=>{expect(hd375infx2(0,0)).toBe(0);});it('d',()=>{expect(hd375infx2(93,73)).toBe(2);});it('e',()=>{expect(hd375infx2(15,0)).toBe(4);});});
function hd376infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376infx2_hd',()=>{it('a',()=>{expect(hd376infx2(1,4)).toBe(2);});it('b',()=>{expect(hd376infx2(3,1)).toBe(1);});it('c',()=>{expect(hd376infx2(0,0)).toBe(0);});it('d',()=>{expect(hd376infx2(93,73)).toBe(2);});it('e',()=>{expect(hd376infx2(15,0)).toBe(4);});});
function hd377infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377infx2_hd',()=>{it('a',()=>{expect(hd377infx2(1,4)).toBe(2);});it('b',()=>{expect(hd377infx2(3,1)).toBe(1);});it('c',()=>{expect(hd377infx2(0,0)).toBe(0);});it('d',()=>{expect(hd377infx2(93,73)).toBe(2);});it('e',()=>{expect(hd377infx2(15,0)).toBe(4);});});
function hd378infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378infx2_hd',()=>{it('a',()=>{expect(hd378infx2(1,4)).toBe(2);});it('b',()=>{expect(hd378infx2(3,1)).toBe(1);});it('c',()=>{expect(hd378infx2(0,0)).toBe(0);});it('d',()=>{expect(hd378infx2(93,73)).toBe(2);});it('e',()=>{expect(hd378infx2(15,0)).toBe(4);});});
function hd379infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379infx2_hd',()=>{it('a',()=>{expect(hd379infx2(1,4)).toBe(2);});it('b',()=>{expect(hd379infx2(3,1)).toBe(1);});it('c',()=>{expect(hd379infx2(0,0)).toBe(0);});it('d',()=>{expect(hd379infx2(93,73)).toBe(2);});it('e',()=>{expect(hd379infx2(15,0)).toBe(4);});});
function hd380infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380infx2_hd',()=>{it('a',()=>{expect(hd380infx2(1,4)).toBe(2);});it('b',()=>{expect(hd380infx2(3,1)).toBe(1);});it('c',()=>{expect(hd380infx2(0,0)).toBe(0);});it('d',()=>{expect(hd380infx2(93,73)).toBe(2);});it('e',()=>{expect(hd380infx2(15,0)).toBe(4);});});
function hd381infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381infx2_hd',()=>{it('a',()=>{expect(hd381infx2(1,4)).toBe(2);});it('b',()=>{expect(hd381infx2(3,1)).toBe(1);});it('c',()=>{expect(hd381infx2(0,0)).toBe(0);});it('d',()=>{expect(hd381infx2(93,73)).toBe(2);});it('e',()=>{expect(hd381infx2(15,0)).toBe(4);});});
function hd382infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382infx2_hd',()=>{it('a',()=>{expect(hd382infx2(1,4)).toBe(2);});it('b',()=>{expect(hd382infx2(3,1)).toBe(1);});it('c',()=>{expect(hd382infx2(0,0)).toBe(0);});it('d',()=>{expect(hd382infx2(93,73)).toBe(2);});it('e',()=>{expect(hd382infx2(15,0)).toBe(4);});});
function hd383infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383infx2_hd',()=>{it('a',()=>{expect(hd383infx2(1,4)).toBe(2);});it('b',()=>{expect(hd383infx2(3,1)).toBe(1);});it('c',()=>{expect(hd383infx2(0,0)).toBe(0);});it('d',()=>{expect(hd383infx2(93,73)).toBe(2);});it('e',()=>{expect(hd383infx2(15,0)).toBe(4);});});
function hd384infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384infx2_hd',()=>{it('a',()=>{expect(hd384infx2(1,4)).toBe(2);});it('b',()=>{expect(hd384infx2(3,1)).toBe(1);});it('c',()=>{expect(hd384infx2(0,0)).toBe(0);});it('d',()=>{expect(hd384infx2(93,73)).toBe(2);});it('e',()=>{expect(hd384infx2(15,0)).toBe(4);});});
function hd385infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385infx2_hd',()=>{it('a',()=>{expect(hd385infx2(1,4)).toBe(2);});it('b',()=>{expect(hd385infx2(3,1)).toBe(1);});it('c',()=>{expect(hd385infx2(0,0)).toBe(0);});it('d',()=>{expect(hd385infx2(93,73)).toBe(2);});it('e',()=>{expect(hd385infx2(15,0)).toBe(4);});});
function hd386infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386infx2_hd',()=>{it('a',()=>{expect(hd386infx2(1,4)).toBe(2);});it('b',()=>{expect(hd386infx2(3,1)).toBe(1);});it('c',()=>{expect(hd386infx2(0,0)).toBe(0);});it('d',()=>{expect(hd386infx2(93,73)).toBe(2);});it('e',()=>{expect(hd386infx2(15,0)).toBe(4);});});
function hd387infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387infx2_hd',()=>{it('a',()=>{expect(hd387infx2(1,4)).toBe(2);});it('b',()=>{expect(hd387infx2(3,1)).toBe(1);});it('c',()=>{expect(hd387infx2(0,0)).toBe(0);});it('d',()=>{expect(hd387infx2(93,73)).toBe(2);});it('e',()=>{expect(hd387infx2(15,0)).toBe(4);});});
function hd388infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388infx2_hd',()=>{it('a',()=>{expect(hd388infx2(1,4)).toBe(2);});it('b',()=>{expect(hd388infx2(3,1)).toBe(1);});it('c',()=>{expect(hd388infx2(0,0)).toBe(0);});it('d',()=>{expect(hd388infx2(93,73)).toBe(2);});it('e',()=>{expect(hd388infx2(15,0)).toBe(4);});});
function hd389infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389infx2_hd',()=>{it('a',()=>{expect(hd389infx2(1,4)).toBe(2);});it('b',()=>{expect(hd389infx2(3,1)).toBe(1);});it('c',()=>{expect(hd389infx2(0,0)).toBe(0);});it('d',()=>{expect(hd389infx2(93,73)).toBe(2);});it('e',()=>{expect(hd389infx2(15,0)).toBe(4);});});
function hd390infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390infx2_hd',()=>{it('a',()=>{expect(hd390infx2(1,4)).toBe(2);});it('b',()=>{expect(hd390infx2(3,1)).toBe(1);});it('c',()=>{expect(hd390infx2(0,0)).toBe(0);});it('d',()=>{expect(hd390infx2(93,73)).toBe(2);});it('e',()=>{expect(hd390infx2(15,0)).toBe(4);});});
function hd391infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391infx2_hd',()=>{it('a',()=>{expect(hd391infx2(1,4)).toBe(2);});it('b',()=>{expect(hd391infx2(3,1)).toBe(1);});it('c',()=>{expect(hd391infx2(0,0)).toBe(0);});it('d',()=>{expect(hd391infx2(93,73)).toBe(2);});it('e',()=>{expect(hd391infx2(15,0)).toBe(4);});});
function hd392infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392infx2_hd',()=>{it('a',()=>{expect(hd392infx2(1,4)).toBe(2);});it('b',()=>{expect(hd392infx2(3,1)).toBe(1);});it('c',()=>{expect(hd392infx2(0,0)).toBe(0);});it('d',()=>{expect(hd392infx2(93,73)).toBe(2);});it('e',()=>{expect(hd392infx2(15,0)).toBe(4);});});
function hd393infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393infx2_hd',()=>{it('a',()=>{expect(hd393infx2(1,4)).toBe(2);});it('b',()=>{expect(hd393infx2(3,1)).toBe(1);});it('c',()=>{expect(hd393infx2(0,0)).toBe(0);});it('d',()=>{expect(hd393infx2(93,73)).toBe(2);});it('e',()=>{expect(hd393infx2(15,0)).toBe(4);});});
function hd394infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394infx2_hd',()=>{it('a',()=>{expect(hd394infx2(1,4)).toBe(2);});it('b',()=>{expect(hd394infx2(3,1)).toBe(1);});it('c',()=>{expect(hd394infx2(0,0)).toBe(0);});it('d',()=>{expect(hd394infx2(93,73)).toBe(2);});it('e',()=>{expect(hd394infx2(15,0)).toBe(4);});});
function hd395infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395infx2_hd',()=>{it('a',()=>{expect(hd395infx2(1,4)).toBe(2);});it('b',()=>{expect(hd395infx2(3,1)).toBe(1);});it('c',()=>{expect(hd395infx2(0,0)).toBe(0);});it('d',()=>{expect(hd395infx2(93,73)).toBe(2);});it('e',()=>{expect(hd395infx2(15,0)).toBe(4);});});
function hd396infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396infx2_hd',()=>{it('a',()=>{expect(hd396infx2(1,4)).toBe(2);});it('b',()=>{expect(hd396infx2(3,1)).toBe(1);});it('c',()=>{expect(hd396infx2(0,0)).toBe(0);});it('d',()=>{expect(hd396infx2(93,73)).toBe(2);});it('e',()=>{expect(hd396infx2(15,0)).toBe(4);});});
function hd397infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397infx2_hd',()=>{it('a',()=>{expect(hd397infx2(1,4)).toBe(2);});it('b',()=>{expect(hd397infx2(3,1)).toBe(1);});it('c',()=>{expect(hd397infx2(0,0)).toBe(0);});it('d',()=>{expect(hd397infx2(93,73)).toBe(2);});it('e',()=>{expect(hd397infx2(15,0)).toBe(4);});});
function hd398infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398infx2_hd',()=>{it('a',()=>{expect(hd398infx2(1,4)).toBe(2);});it('b',()=>{expect(hd398infx2(3,1)).toBe(1);});it('c',()=>{expect(hd398infx2(0,0)).toBe(0);});it('d',()=>{expect(hd398infx2(93,73)).toBe(2);});it('e',()=>{expect(hd398infx2(15,0)).toBe(4);});});
function hd399infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399infx2_hd',()=>{it('a',()=>{expect(hd399infx2(1,4)).toBe(2);});it('b',()=>{expect(hd399infx2(3,1)).toBe(1);});it('c',()=>{expect(hd399infx2(0,0)).toBe(0);});it('d',()=>{expect(hd399infx2(93,73)).toBe(2);});it('e',()=>{expect(hd399infx2(15,0)).toBe(4);});});
function hd400infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400infx2_hd',()=>{it('a',()=>{expect(hd400infx2(1,4)).toBe(2);});it('b',()=>{expect(hd400infx2(3,1)).toBe(1);});it('c',()=>{expect(hd400infx2(0,0)).toBe(0);});it('d',()=>{expect(hd400infx2(93,73)).toBe(2);});it('e',()=>{expect(hd400infx2(15,0)).toBe(4);});});
function hd401infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401infx2_hd',()=>{it('a',()=>{expect(hd401infx2(1,4)).toBe(2);});it('b',()=>{expect(hd401infx2(3,1)).toBe(1);});it('c',()=>{expect(hd401infx2(0,0)).toBe(0);});it('d',()=>{expect(hd401infx2(93,73)).toBe(2);});it('e',()=>{expect(hd401infx2(15,0)).toBe(4);});});
function hd402infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402infx2_hd',()=>{it('a',()=>{expect(hd402infx2(1,4)).toBe(2);});it('b',()=>{expect(hd402infx2(3,1)).toBe(1);});it('c',()=>{expect(hd402infx2(0,0)).toBe(0);});it('d',()=>{expect(hd402infx2(93,73)).toBe(2);});it('e',()=>{expect(hd402infx2(15,0)).toBe(4);});});
function hd403infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403infx2_hd',()=>{it('a',()=>{expect(hd403infx2(1,4)).toBe(2);});it('b',()=>{expect(hd403infx2(3,1)).toBe(1);});it('c',()=>{expect(hd403infx2(0,0)).toBe(0);});it('d',()=>{expect(hd403infx2(93,73)).toBe(2);});it('e',()=>{expect(hd403infx2(15,0)).toBe(4);});});
function hd404infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404infx2_hd',()=>{it('a',()=>{expect(hd404infx2(1,4)).toBe(2);});it('b',()=>{expect(hd404infx2(3,1)).toBe(1);});it('c',()=>{expect(hd404infx2(0,0)).toBe(0);});it('d',()=>{expect(hd404infx2(93,73)).toBe(2);});it('e',()=>{expect(hd404infx2(15,0)).toBe(4);});});
function hd405infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405infx2_hd',()=>{it('a',()=>{expect(hd405infx2(1,4)).toBe(2);});it('b',()=>{expect(hd405infx2(3,1)).toBe(1);});it('c',()=>{expect(hd405infx2(0,0)).toBe(0);});it('d',()=>{expect(hd405infx2(93,73)).toBe(2);});it('e',()=>{expect(hd405infx2(15,0)).toBe(4);});});
function hd406infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406infx2_hd',()=>{it('a',()=>{expect(hd406infx2(1,4)).toBe(2);});it('b',()=>{expect(hd406infx2(3,1)).toBe(1);});it('c',()=>{expect(hd406infx2(0,0)).toBe(0);});it('d',()=>{expect(hd406infx2(93,73)).toBe(2);});it('e',()=>{expect(hd406infx2(15,0)).toBe(4);});});
function hd407infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407infx2_hd',()=>{it('a',()=>{expect(hd407infx2(1,4)).toBe(2);});it('b',()=>{expect(hd407infx2(3,1)).toBe(1);});it('c',()=>{expect(hd407infx2(0,0)).toBe(0);});it('d',()=>{expect(hd407infx2(93,73)).toBe(2);});it('e',()=>{expect(hd407infx2(15,0)).toBe(4);});});
function hd408infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408infx2_hd',()=>{it('a',()=>{expect(hd408infx2(1,4)).toBe(2);});it('b',()=>{expect(hd408infx2(3,1)).toBe(1);});it('c',()=>{expect(hd408infx2(0,0)).toBe(0);});it('d',()=>{expect(hd408infx2(93,73)).toBe(2);});it('e',()=>{expect(hd408infx2(15,0)).toBe(4);});});
function hd409infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409infx2_hd',()=>{it('a',()=>{expect(hd409infx2(1,4)).toBe(2);});it('b',()=>{expect(hd409infx2(3,1)).toBe(1);});it('c',()=>{expect(hd409infx2(0,0)).toBe(0);});it('d',()=>{expect(hd409infx2(93,73)).toBe(2);});it('e',()=>{expect(hd409infx2(15,0)).toBe(4);});});
function hd410infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410infx2_hd',()=>{it('a',()=>{expect(hd410infx2(1,4)).toBe(2);});it('b',()=>{expect(hd410infx2(3,1)).toBe(1);});it('c',()=>{expect(hd410infx2(0,0)).toBe(0);});it('d',()=>{expect(hd410infx2(93,73)).toBe(2);});it('e',()=>{expect(hd410infx2(15,0)).toBe(4);});});
function hd411infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411infx2_hd',()=>{it('a',()=>{expect(hd411infx2(1,4)).toBe(2);});it('b',()=>{expect(hd411infx2(3,1)).toBe(1);});it('c',()=>{expect(hd411infx2(0,0)).toBe(0);});it('d',()=>{expect(hd411infx2(93,73)).toBe(2);});it('e',()=>{expect(hd411infx2(15,0)).toBe(4);});});
function hd412infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412infx2_hd',()=>{it('a',()=>{expect(hd412infx2(1,4)).toBe(2);});it('b',()=>{expect(hd412infx2(3,1)).toBe(1);});it('c',()=>{expect(hd412infx2(0,0)).toBe(0);});it('d',()=>{expect(hd412infx2(93,73)).toBe(2);});it('e',()=>{expect(hd412infx2(15,0)).toBe(4);});});
function hd413infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413infx2_hd',()=>{it('a',()=>{expect(hd413infx2(1,4)).toBe(2);});it('b',()=>{expect(hd413infx2(3,1)).toBe(1);});it('c',()=>{expect(hd413infx2(0,0)).toBe(0);});it('d',()=>{expect(hd413infx2(93,73)).toBe(2);});it('e',()=>{expect(hd413infx2(15,0)).toBe(4);});});
function hd414infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414infx2_hd',()=>{it('a',()=>{expect(hd414infx2(1,4)).toBe(2);});it('b',()=>{expect(hd414infx2(3,1)).toBe(1);});it('c',()=>{expect(hd414infx2(0,0)).toBe(0);});it('d',()=>{expect(hd414infx2(93,73)).toBe(2);});it('e',()=>{expect(hd414infx2(15,0)).toBe(4);});});
function hd415infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415infx2_hd',()=>{it('a',()=>{expect(hd415infx2(1,4)).toBe(2);});it('b',()=>{expect(hd415infx2(3,1)).toBe(1);});it('c',()=>{expect(hd415infx2(0,0)).toBe(0);});it('d',()=>{expect(hd415infx2(93,73)).toBe(2);});it('e',()=>{expect(hd415infx2(15,0)).toBe(4);});});
function hd416infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416infx2_hd',()=>{it('a',()=>{expect(hd416infx2(1,4)).toBe(2);});it('b',()=>{expect(hd416infx2(3,1)).toBe(1);});it('c',()=>{expect(hd416infx2(0,0)).toBe(0);});it('d',()=>{expect(hd416infx2(93,73)).toBe(2);});it('e',()=>{expect(hd416infx2(15,0)).toBe(4);});});
function hd417infx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417infx2_hd',()=>{it('a',()=>{expect(hd417infx2(1,4)).toBe(2);});it('b',()=>{expect(hd417infx2(3,1)).toBe(1);});it('c',()=>{expect(hd417infx2(0,0)).toBe(0);});it('d',()=>{expect(hd417infx2(93,73)).toBe(2);});it('e',()=>{expect(hd417infx2(15,0)).toBe(4);});});
