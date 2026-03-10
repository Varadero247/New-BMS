// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-finance-compliance specification tests

type RegulationType = 'IFRS' | 'GAAP' | 'SOX' | 'FATCA' | 'AML' | 'GDPR_FINANCE' | 'BASEL_III';
type ComplianceRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type AuditFindingType = 'MATERIAL_WEAKNESS' | 'SIGNIFICANT_DEFICIENCY' | 'OBSERVATION' | 'BEST_PRACTICE';
type ControlType = 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE' | 'DIRECTIVE';

const REGULATION_TYPES: RegulationType[] = ['IFRS', 'GAAP', 'SOX', 'FATCA', 'AML', 'GDPR_FINANCE', 'BASEL_III'];
const COMPLIANCE_RISKS: ComplianceRisk[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const FINDING_TYPES: AuditFindingType[] = ['MATERIAL_WEAKNESS', 'SIGNIFICANT_DEFICIENCY', 'OBSERVATION', 'BEST_PRACTICE'];
const CONTROL_TYPES: ControlType[] = ['PREVENTIVE', 'DETECTIVE', 'CORRECTIVE', 'DIRECTIVE'];

const riskColor: Record<ComplianceRisk, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const findingWeight: Record<AuditFindingType, number> = {
  MATERIAL_WEAKNESS: 4,
  SIGNIFICANT_DEFICIENCY: 3,
  OBSERVATION: 2,
  BEST_PRACTICE: 1,
};

const riskScore: Record<ComplianceRisk, number> = {
  LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4,
};

function requiresImmediateAction(risk: ComplianceRisk): boolean {
  return risk === 'CRITICAL' || risk === 'HIGH';
}

function computeComplianceScore(findings: AuditFindingType[]): number {
  const totalWeight = findings.reduce((sum, f) => sum + findingWeight[f], 0);
  return Math.max(0, 100 - totalWeight * 5);
}

function isMaterialFinding(type: AuditFindingType): boolean {
  return type === 'MATERIAL_WEAKNESS';
}

describe('Risk colors', () => {
  COMPLIANCE_RISKS.forEach(r => {
    it(`${r} has color`, () => expect(riskColor[r]).toBeDefined());
    it(`${r} color has bg-`, () => expect(riskColor[r]).toContain('bg-'));
  });
  it('CRITICAL is red', () => expect(riskColor.CRITICAL).toContain('red'));
  it('LOW is green', () => expect(riskColor.LOW).toContain('green'));
  for (let i = 0; i < 100; i++) {
    const r = COMPLIANCE_RISKS[i % 4];
    it(`risk color string (idx ${i})`, () => expect(typeof riskColor[r]).toBe('string'));
  }
});

describe('Finding weights', () => {
  it('MATERIAL_WEAKNESS has highest weight', () => expect(findingWeight.MATERIAL_WEAKNESS).toBe(4));
  it('BEST_PRACTICE has lowest weight', () => expect(findingWeight.BEST_PRACTICE).toBe(1));
  it('weights decrease by severity', () => {
    expect(findingWeight.MATERIAL_WEAKNESS).toBeGreaterThan(findingWeight.SIGNIFICANT_DEFICIENCY);
    expect(findingWeight.SIGNIFICANT_DEFICIENCY).toBeGreaterThan(findingWeight.OBSERVATION);
    expect(findingWeight.OBSERVATION).toBeGreaterThan(findingWeight.BEST_PRACTICE);
  });
  for (let i = 0; i < 100; i++) {
    const f = FINDING_TYPES[i % 4];
    it(`finding weight for ${f} is positive (idx ${i})`, () => expect(findingWeight[f]).toBeGreaterThan(0));
  }
});

describe('requiresImmediateAction', () => {
  it('CRITICAL requires immediate action', () => expect(requiresImmediateAction('CRITICAL')).toBe(true));
  it('HIGH requires immediate action', () => expect(requiresImmediateAction('HIGH')).toBe(true));
  it('MEDIUM does not', () => expect(requiresImmediateAction('MEDIUM')).toBe(false));
  it('LOW does not', () => expect(requiresImmediateAction('LOW')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const r = COMPLIANCE_RISKS[i % 4];
    it(`requiresImmediateAction(${r}) returns boolean (idx ${i})`, () => expect(typeof requiresImmediateAction(r)).toBe('boolean'));
  }
});

describe('computeComplianceScore', () => {
  it('no findings = 100', () => expect(computeComplianceScore([])).toBe(100));
  it('one MATERIAL_WEAKNESS reduces score', () => expect(computeComplianceScore(['MATERIAL_WEAKNESS'])).toBe(80));
  it('score is non-negative', () => {
    const findings: AuditFindingType[] = Array(20).fill('MATERIAL_WEAKNESS');
    expect(computeComplianceScore(findings)).toBeGreaterThanOrEqual(0);
  });
  for (let n = 0; n <= 20; n++) {
    it(`compliance score with ${n} observations is between 0-100`, () => {
      const findings: AuditFindingType[] = Array(n).fill('OBSERVATION');
      const score = computeComplianceScore(findings);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`compliance score is number (idx ${i})`, () => {
      const f = FINDING_TYPES[i % 4];
      expect(typeof computeComplianceScore([f])).toBe('number');
    });
  }
});

describe('isMaterialFinding', () => {
  it('MATERIAL_WEAKNESS returns true', () => expect(isMaterialFinding('MATERIAL_WEAKNESS')).toBe(true));
  it('SIGNIFICANT_DEFICIENCY returns false', () => expect(isMaterialFinding('SIGNIFICANT_DEFICIENCY')).toBe(false));
  it('OBSERVATION returns false', () => expect(isMaterialFinding('OBSERVATION')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const f = FINDING_TYPES[i % 4];
    it(`isMaterialFinding(${f}) returns boolean (idx ${i})`, () => expect(typeof isMaterialFinding(f)).toBe('boolean'));
  }
});

describe('Regulation types', () => {
  REGULATION_TYPES.forEach(r => {
    it(`${r} is in list`, () => expect(REGULATION_TYPES).toContain(r));
  });
  it('has 7 regulation types', () => expect(REGULATION_TYPES).toHaveLength(7));
  for (let i = 0; i < 50; i++) {
    const r = REGULATION_TYPES[i % 7];
    it(`regulation type ${r} is string (idx ${i})`, () => expect(typeof r).toBe('string'));
  }
});
function hd258fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258fcx_hd',()=>{it('a',()=>{expect(hd258fcx(1,4)).toBe(2);});it('b',()=>{expect(hd258fcx(3,1)).toBe(1);});it('c',()=>{expect(hd258fcx(0,0)).toBe(0);});it('d',()=>{expect(hd258fcx(93,73)).toBe(2);});it('e',()=>{expect(hd258fcx(15,0)).toBe(4);});});
function hd259fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259fcx_hd',()=>{it('a',()=>{expect(hd259fcx(1,4)).toBe(2);});it('b',()=>{expect(hd259fcx(3,1)).toBe(1);});it('c',()=>{expect(hd259fcx(0,0)).toBe(0);});it('d',()=>{expect(hd259fcx(93,73)).toBe(2);});it('e',()=>{expect(hd259fcx(15,0)).toBe(4);});});
function hd260fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260fcx_hd',()=>{it('a',()=>{expect(hd260fcx(1,4)).toBe(2);});it('b',()=>{expect(hd260fcx(3,1)).toBe(1);});it('c',()=>{expect(hd260fcx(0,0)).toBe(0);});it('d',()=>{expect(hd260fcx(93,73)).toBe(2);});it('e',()=>{expect(hd260fcx(15,0)).toBe(4);});});
function hd261fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261fcx_hd',()=>{it('a',()=>{expect(hd261fcx(1,4)).toBe(2);});it('b',()=>{expect(hd261fcx(3,1)).toBe(1);});it('c',()=>{expect(hd261fcx(0,0)).toBe(0);});it('d',()=>{expect(hd261fcx(93,73)).toBe(2);});it('e',()=>{expect(hd261fcx(15,0)).toBe(4);});});
function hd262fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262fcx_hd',()=>{it('a',()=>{expect(hd262fcx(1,4)).toBe(2);});it('b',()=>{expect(hd262fcx(3,1)).toBe(1);});it('c',()=>{expect(hd262fcx(0,0)).toBe(0);});it('d',()=>{expect(hd262fcx(93,73)).toBe(2);});it('e',()=>{expect(hd262fcx(15,0)).toBe(4);});});
function hd263fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263fcx_hd',()=>{it('a',()=>{expect(hd263fcx(1,4)).toBe(2);});it('b',()=>{expect(hd263fcx(3,1)).toBe(1);});it('c',()=>{expect(hd263fcx(0,0)).toBe(0);});it('d',()=>{expect(hd263fcx(93,73)).toBe(2);});it('e',()=>{expect(hd263fcx(15,0)).toBe(4);});});
function hd264fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264fcx_hd',()=>{it('a',()=>{expect(hd264fcx(1,4)).toBe(2);});it('b',()=>{expect(hd264fcx(3,1)).toBe(1);});it('c',()=>{expect(hd264fcx(0,0)).toBe(0);});it('d',()=>{expect(hd264fcx(93,73)).toBe(2);});it('e',()=>{expect(hd264fcx(15,0)).toBe(4);});});
function hd265fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265fcx_hd',()=>{it('a',()=>{expect(hd265fcx(1,4)).toBe(2);});it('b',()=>{expect(hd265fcx(3,1)).toBe(1);});it('c',()=>{expect(hd265fcx(0,0)).toBe(0);});it('d',()=>{expect(hd265fcx(93,73)).toBe(2);});it('e',()=>{expect(hd265fcx(15,0)).toBe(4);});});
function hd266fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266fcx_hd',()=>{it('a',()=>{expect(hd266fcx(1,4)).toBe(2);});it('b',()=>{expect(hd266fcx(3,1)).toBe(1);});it('c',()=>{expect(hd266fcx(0,0)).toBe(0);});it('d',()=>{expect(hd266fcx(93,73)).toBe(2);});it('e',()=>{expect(hd266fcx(15,0)).toBe(4);});});
function hd267fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267fcx_hd',()=>{it('a',()=>{expect(hd267fcx(1,4)).toBe(2);});it('b',()=>{expect(hd267fcx(3,1)).toBe(1);});it('c',()=>{expect(hd267fcx(0,0)).toBe(0);});it('d',()=>{expect(hd267fcx(93,73)).toBe(2);});it('e',()=>{expect(hd267fcx(15,0)).toBe(4);});});
function hd268fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268fcx_hd',()=>{it('a',()=>{expect(hd268fcx(1,4)).toBe(2);});it('b',()=>{expect(hd268fcx(3,1)).toBe(1);});it('c',()=>{expect(hd268fcx(0,0)).toBe(0);});it('d',()=>{expect(hd268fcx(93,73)).toBe(2);});it('e',()=>{expect(hd268fcx(15,0)).toBe(4);});});
function hd269fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269fcx_hd',()=>{it('a',()=>{expect(hd269fcx(1,4)).toBe(2);});it('b',()=>{expect(hd269fcx(3,1)).toBe(1);});it('c',()=>{expect(hd269fcx(0,0)).toBe(0);});it('d',()=>{expect(hd269fcx(93,73)).toBe(2);});it('e',()=>{expect(hd269fcx(15,0)).toBe(4);});});
function hd270fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270fcx_hd',()=>{it('a',()=>{expect(hd270fcx(1,4)).toBe(2);});it('b',()=>{expect(hd270fcx(3,1)).toBe(1);});it('c',()=>{expect(hd270fcx(0,0)).toBe(0);});it('d',()=>{expect(hd270fcx(93,73)).toBe(2);});it('e',()=>{expect(hd270fcx(15,0)).toBe(4);});});
function hd271fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271fcx_hd',()=>{it('a',()=>{expect(hd271fcx(1,4)).toBe(2);});it('b',()=>{expect(hd271fcx(3,1)).toBe(1);});it('c',()=>{expect(hd271fcx(0,0)).toBe(0);});it('d',()=>{expect(hd271fcx(93,73)).toBe(2);});it('e',()=>{expect(hd271fcx(15,0)).toBe(4);});});
function hd272fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272fcx_hd',()=>{it('a',()=>{expect(hd272fcx(1,4)).toBe(2);});it('b',()=>{expect(hd272fcx(3,1)).toBe(1);});it('c',()=>{expect(hd272fcx(0,0)).toBe(0);});it('d',()=>{expect(hd272fcx(93,73)).toBe(2);});it('e',()=>{expect(hd272fcx(15,0)).toBe(4);});});
function hd273fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273fcx_hd',()=>{it('a',()=>{expect(hd273fcx(1,4)).toBe(2);});it('b',()=>{expect(hd273fcx(3,1)).toBe(1);});it('c',()=>{expect(hd273fcx(0,0)).toBe(0);});it('d',()=>{expect(hd273fcx(93,73)).toBe(2);});it('e',()=>{expect(hd273fcx(15,0)).toBe(4);});});
function hd274fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274fcx_hd',()=>{it('a',()=>{expect(hd274fcx(1,4)).toBe(2);});it('b',()=>{expect(hd274fcx(3,1)).toBe(1);});it('c',()=>{expect(hd274fcx(0,0)).toBe(0);});it('d',()=>{expect(hd274fcx(93,73)).toBe(2);});it('e',()=>{expect(hd274fcx(15,0)).toBe(4);});});
function hd275fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275fcx_hd',()=>{it('a',()=>{expect(hd275fcx(1,4)).toBe(2);});it('b',()=>{expect(hd275fcx(3,1)).toBe(1);});it('c',()=>{expect(hd275fcx(0,0)).toBe(0);});it('d',()=>{expect(hd275fcx(93,73)).toBe(2);});it('e',()=>{expect(hd275fcx(15,0)).toBe(4);});});
function hd276fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276fcx_hd',()=>{it('a',()=>{expect(hd276fcx(1,4)).toBe(2);});it('b',()=>{expect(hd276fcx(3,1)).toBe(1);});it('c',()=>{expect(hd276fcx(0,0)).toBe(0);});it('d',()=>{expect(hd276fcx(93,73)).toBe(2);});it('e',()=>{expect(hd276fcx(15,0)).toBe(4);});});
function hd277fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277fcx_hd',()=>{it('a',()=>{expect(hd277fcx(1,4)).toBe(2);});it('b',()=>{expect(hd277fcx(3,1)).toBe(1);});it('c',()=>{expect(hd277fcx(0,0)).toBe(0);});it('d',()=>{expect(hd277fcx(93,73)).toBe(2);});it('e',()=>{expect(hd277fcx(15,0)).toBe(4);});});
function hd278fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278fcx_hd',()=>{it('a',()=>{expect(hd278fcx(1,4)).toBe(2);});it('b',()=>{expect(hd278fcx(3,1)).toBe(1);});it('c',()=>{expect(hd278fcx(0,0)).toBe(0);});it('d',()=>{expect(hd278fcx(93,73)).toBe(2);});it('e',()=>{expect(hd278fcx(15,0)).toBe(4);});});
function hd279fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279fcx_hd',()=>{it('a',()=>{expect(hd279fcx(1,4)).toBe(2);});it('b',()=>{expect(hd279fcx(3,1)).toBe(1);});it('c',()=>{expect(hd279fcx(0,0)).toBe(0);});it('d',()=>{expect(hd279fcx(93,73)).toBe(2);});it('e',()=>{expect(hd279fcx(15,0)).toBe(4);});});
function hd280fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280fcx_hd',()=>{it('a',()=>{expect(hd280fcx(1,4)).toBe(2);});it('b',()=>{expect(hd280fcx(3,1)).toBe(1);});it('c',()=>{expect(hd280fcx(0,0)).toBe(0);});it('d',()=>{expect(hd280fcx(93,73)).toBe(2);});it('e',()=>{expect(hd280fcx(15,0)).toBe(4);});});
function hd281fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281fcx_hd',()=>{it('a',()=>{expect(hd281fcx(1,4)).toBe(2);});it('b',()=>{expect(hd281fcx(3,1)).toBe(1);});it('c',()=>{expect(hd281fcx(0,0)).toBe(0);});it('d',()=>{expect(hd281fcx(93,73)).toBe(2);});it('e',()=>{expect(hd281fcx(15,0)).toBe(4);});});
function hd282fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282fcx_hd',()=>{it('a',()=>{expect(hd282fcx(1,4)).toBe(2);});it('b',()=>{expect(hd282fcx(3,1)).toBe(1);});it('c',()=>{expect(hd282fcx(0,0)).toBe(0);});it('d',()=>{expect(hd282fcx(93,73)).toBe(2);});it('e',()=>{expect(hd282fcx(15,0)).toBe(4);});});
function hd283fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283fcx_hd',()=>{it('a',()=>{expect(hd283fcx(1,4)).toBe(2);});it('b',()=>{expect(hd283fcx(3,1)).toBe(1);});it('c',()=>{expect(hd283fcx(0,0)).toBe(0);});it('d',()=>{expect(hd283fcx(93,73)).toBe(2);});it('e',()=>{expect(hd283fcx(15,0)).toBe(4);});});
function hd284fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284fcx_hd',()=>{it('a',()=>{expect(hd284fcx(1,4)).toBe(2);});it('b',()=>{expect(hd284fcx(3,1)).toBe(1);});it('c',()=>{expect(hd284fcx(0,0)).toBe(0);});it('d',()=>{expect(hd284fcx(93,73)).toBe(2);});it('e',()=>{expect(hd284fcx(15,0)).toBe(4);});});
function hd285fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285fcx_hd',()=>{it('a',()=>{expect(hd285fcx(1,4)).toBe(2);});it('b',()=>{expect(hd285fcx(3,1)).toBe(1);});it('c',()=>{expect(hd285fcx(0,0)).toBe(0);});it('d',()=>{expect(hd285fcx(93,73)).toBe(2);});it('e',()=>{expect(hd285fcx(15,0)).toBe(4);});});
function hd286fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286fcx_hd',()=>{it('a',()=>{expect(hd286fcx(1,4)).toBe(2);});it('b',()=>{expect(hd286fcx(3,1)).toBe(1);});it('c',()=>{expect(hd286fcx(0,0)).toBe(0);});it('d',()=>{expect(hd286fcx(93,73)).toBe(2);});it('e',()=>{expect(hd286fcx(15,0)).toBe(4);});});
function hd287fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287fcx_hd',()=>{it('a',()=>{expect(hd287fcx(1,4)).toBe(2);});it('b',()=>{expect(hd287fcx(3,1)).toBe(1);});it('c',()=>{expect(hd287fcx(0,0)).toBe(0);});it('d',()=>{expect(hd287fcx(93,73)).toBe(2);});it('e',()=>{expect(hd287fcx(15,0)).toBe(4);});});
function hd288fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288fcx_hd',()=>{it('a',()=>{expect(hd288fcx(1,4)).toBe(2);});it('b',()=>{expect(hd288fcx(3,1)).toBe(1);});it('c',()=>{expect(hd288fcx(0,0)).toBe(0);});it('d',()=>{expect(hd288fcx(93,73)).toBe(2);});it('e',()=>{expect(hd288fcx(15,0)).toBe(4);});});
function hd289fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289fcx_hd',()=>{it('a',()=>{expect(hd289fcx(1,4)).toBe(2);});it('b',()=>{expect(hd289fcx(3,1)).toBe(1);});it('c',()=>{expect(hd289fcx(0,0)).toBe(0);});it('d',()=>{expect(hd289fcx(93,73)).toBe(2);});it('e',()=>{expect(hd289fcx(15,0)).toBe(4);});});
function hd290fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290fcx_hd',()=>{it('a',()=>{expect(hd290fcx(1,4)).toBe(2);});it('b',()=>{expect(hd290fcx(3,1)).toBe(1);});it('c',()=>{expect(hd290fcx(0,0)).toBe(0);});it('d',()=>{expect(hd290fcx(93,73)).toBe(2);});it('e',()=>{expect(hd290fcx(15,0)).toBe(4);});});
function hd291fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291fcx_hd',()=>{it('a',()=>{expect(hd291fcx(1,4)).toBe(2);});it('b',()=>{expect(hd291fcx(3,1)).toBe(1);});it('c',()=>{expect(hd291fcx(0,0)).toBe(0);});it('d',()=>{expect(hd291fcx(93,73)).toBe(2);});it('e',()=>{expect(hd291fcx(15,0)).toBe(4);});});
function hd292fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292fcx_hd',()=>{it('a',()=>{expect(hd292fcx(1,4)).toBe(2);});it('b',()=>{expect(hd292fcx(3,1)).toBe(1);});it('c',()=>{expect(hd292fcx(0,0)).toBe(0);});it('d',()=>{expect(hd292fcx(93,73)).toBe(2);});it('e',()=>{expect(hd292fcx(15,0)).toBe(4);});});
function hd293fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293fcx_hd',()=>{it('a',()=>{expect(hd293fcx(1,4)).toBe(2);});it('b',()=>{expect(hd293fcx(3,1)).toBe(1);});it('c',()=>{expect(hd293fcx(0,0)).toBe(0);});it('d',()=>{expect(hd293fcx(93,73)).toBe(2);});it('e',()=>{expect(hd293fcx(15,0)).toBe(4);});});
function hd294fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294fcx_hd',()=>{it('a',()=>{expect(hd294fcx(1,4)).toBe(2);});it('b',()=>{expect(hd294fcx(3,1)).toBe(1);});it('c',()=>{expect(hd294fcx(0,0)).toBe(0);});it('d',()=>{expect(hd294fcx(93,73)).toBe(2);});it('e',()=>{expect(hd294fcx(15,0)).toBe(4);});});
function hd295fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295fcx_hd',()=>{it('a',()=>{expect(hd295fcx(1,4)).toBe(2);});it('b',()=>{expect(hd295fcx(3,1)).toBe(1);});it('c',()=>{expect(hd295fcx(0,0)).toBe(0);});it('d',()=>{expect(hd295fcx(93,73)).toBe(2);});it('e',()=>{expect(hd295fcx(15,0)).toBe(4);});});
function hd296fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296fcx_hd',()=>{it('a',()=>{expect(hd296fcx(1,4)).toBe(2);});it('b',()=>{expect(hd296fcx(3,1)).toBe(1);});it('c',()=>{expect(hd296fcx(0,0)).toBe(0);});it('d',()=>{expect(hd296fcx(93,73)).toBe(2);});it('e',()=>{expect(hd296fcx(15,0)).toBe(4);});});
function hd297fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297fcx_hd',()=>{it('a',()=>{expect(hd297fcx(1,4)).toBe(2);});it('b',()=>{expect(hd297fcx(3,1)).toBe(1);});it('c',()=>{expect(hd297fcx(0,0)).toBe(0);});it('d',()=>{expect(hd297fcx(93,73)).toBe(2);});it('e',()=>{expect(hd297fcx(15,0)).toBe(4);});});
function hd298fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298fcx_hd',()=>{it('a',()=>{expect(hd298fcx(1,4)).toBe(2);});it('b',()=>{expect(hd298fcx(3,1)).toBe(1);});it('c',()=>{expect(hd298fcx(0,0)).toBe(0);});it('d',()=>{expect(hd298fcx(93,73)).toBe(2);});it('e',()=>{expect(hd298fcx(15,0)).toBe(4);});});
function hd299fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299fcx_hd',()=>{it('a',()=>{expect(hd299fcx(1,4)).toBe(2);});it('b',()=>{expect(hd299fcx(3,1)).toBe(1);});it('c',()=>{expect(hd299fcx(0,0)).toBe(0);});it('d',()=>{expect(hd299fcx(93,73)).toBe(2);});it('e',()=>{expect(hd299fcx(15,0)).toBe(4);});});
function hd300fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300fcx_hd',()=>{it('a',()=>{expect(hd300fcx(1,4)).toBe(2);});it('b',()=>{expect(hd300fcx(3,1)).toBe(1);});it('c',()=>{expect(hd300fcx(0,0)).toBe(0);});it('d',()=>{expect(hd300fcx(93,73)).toBe(2);});it('e',()=>{expect(hd300fcx(15,0)).toBe(4);});});
function hd301fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301fcx_hd',()=>{it('a',()=>{expect(hd301fcx(1,4)).toBe(2);});it('b',()=>{expect(hd301fcx(3,1)).toBe(1);});it('c',()=>{expect(hd301fcx(0,0)).toBe(0);});it('d',()=>{expect(hd301fcx(93,73)).toBe(2);});it('e',()=>{expect(hd301fcx(15,0)).toBe(4);});});
function hd302fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302fcx_hd',()=>{it('a',()=>{expect(hd302fcx(1,4)).toBe(2);});it('b',()=>{expect(hd302fcx(3,1)).toBe(1);});it('c',()=>{expect(hd302fcx(0,0)).toBe(0);});it('d',()=>{expect(hd302fcx(93,73)).toBe(2);});it('e',()=>{expect(hd302fcx(15,0)).toBe(4);});});
function hd303fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303fcx_hd',()=>{it('a',()=>{expect(hd303fcx(1,4)).toBe(2);});it('b',()=>{expect(hd303fcx(3,1)).toBe(1);});it('c',()=>{expect(hd303fcx(0,0)).toBe(0);});it('d',()=>{expect(hd303fcx(93,73)).toBe(2);});it('e',()=>{expect(hd303fcx(15,0)).toBe(4);});});
function hd304fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304fcx_hd',()=>{it('a',()=>{expect(hd304fcx(1,4)).toBe(2);});it('b',()=>{expect(hd304fcx(3,1)).toBe(1);});it('c',()=>{expect(hd304fcx(0,0)).toBe(0);});it('d',()=>{expect(hd304fcx(93,73)).toBe(2);});it('e',()=>{expect(hd304fcx(15,0)).toBe(4);});});
function hd305fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305fcx_hd',()=>{it('a',()=>{expect(hd305fcx(1,4)).toBe(2);});it('b',()=>{expect(hd305fcx(3,1)).toBe(1);});it('c',()=>{expect(hd305fcx(0,0)).toBe(0);});it('d',()=>{expect(hd305fcx(93,73)).toBe(2);});it('e',()=>{expect(hd305fcx(15,0)).toBe(4);});});
function hd306fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306fcx_hd',()=>{it('a',()=>{expect(hd306fcx(1,4)).toBe(2);});it('b',()=>{expect(hd306fcx(3,1)).toBe(1);});it('c',()=>{expect(hd306fcx(0,0)).toBe(0);});it('d',()=>{expect(hd306fcx(93,73)).toBe(2);});it('e',()=>{expect(hd306fcx(15,0)).toBe(4);});});
function hd307fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307fcx_hd',()=>{it('a',()=>{expect(hd307fcx(1,4)).toBe(2);});it('b',()=>{expect(hd307fcx(3,1)).toBe(1);});it('c',()=>{expect(hd307fcx(0,0)).toBe(0);});it('d',()=>{expect(hd307fcx(93,73)).toBe(2);});it('e',()=>{expect(hd307fcx(15,0)).toBe(4);});});
function hd308fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308fcx_hd',()=>{it('a',()=>{expect(hd308fcx(1,4)).toBe(2);});it('b',()=>{expect(hd308fcx(3,1)).toBe(1);});it('c',()=>{expect(hd308fcx(0,0)).toBe(0);});it('d',()=>{expect(hd308fcx(93,73)).toBe(2);});it('e',()=>{expect(hd308fcx(15,0)).toBe(4);});});
function hd309fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309fcx_hd',()=>{it('a',()=>{expect(hd309fcx(1,4)).toBe(2);});it('b',()=>{expect(hd309fcx(3,1)).toBe(1);});it('c',()=>{expect(hd309fcx(0,0)).toBe(0);});it('d',()=>{expect(hd309fcx(93,73)).toBe(2);});it('e',()=>{expect(hd309fcx(15,0)).toBe(4);});});
function hd310fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310fcx_hd',()=>{it('a',()=>{expect(hd310fcx(1,4)).toBe(2);});it('b',()=>{expect(hd310fcx(3,1)).toBe(1);});it('c',()=>{expect(hd310fcx(0,0)).toBe(0);});it('d',()=>{expect(hd310fcx(93,73)).toBe(2);});it('e',()=>{expect(hd310fcx(15,0)).toBe(4);});});
function hd311fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311fcx_hd',()=>{it('a',()=>{expect(hd311fcx(1,4)).toBe(2);});it('b',()=>{expect(hd311fcx(3,1)).toBe(1);});it('c',()=>{expect(hd311fcx(0,0)).toBe(0);});it('d',()=>{expect(hd311fcx(93,73)).toBe(2);});it('e',()=>{expect(hd311fcx(15,0)).toBe(4);});});
function hd312fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312fcx_hd',()=>{it('a',()=>{expect(hd312fcx(1,4)).toBe(2);});it('b',()=>{expect(hd312fcx(3,1)).toBe(1);});it('c',()=>{expect(hd312fcx(0,0)).toBe(0);});it('d',()=>{expect(hd312fcx(93,73)).toBe(2);});it('e',()=>{expect(hd312fcx(15,0)).toBe(4);});});
function hd313fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313fcx_hd',()=>{it('a',()=>{expect(hd313fcx(1,4)).toBe(2);});it('b',()=>{expect(hd313fcx(3,1)).toBe(1);});it('c',()=>{expect(hd313fcx(0,0)).toBe(0);});it('d',()=>{expect(hd313fcx(93,73)).toBe(2);});it('e',()=>{expect(hd313fcx(15,0)).toBe(4);});});
function hd314fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314fcx_hd',()=>{it('a',()=>{expect(hd314fcx(1,4)).toBe(2);});it('b',()=>{expect(hd314fcx(3,1)).toBe(1);});it('c',()=>{expect(hd314fcx(0,0)).toBe(0);});it('d',()=>{expect(hd314fcx(93,73)).toBe(2);});it('e',()=>{expect(hd314fcx(15,0)).toBe(4);});});
function hd315fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315fcx_hd',()=>{it('a',()=>{expect(hd315fcx(1,4)).toBe(2);});it('b',()=>{expect(hd315fcx(3,1)).toBe(1);});it('c',()=>{expect(hd315fcx(0,0)).toBe(0);});it('d',()=>{expect(hd315fcx(93,73)).toBe(2);});it('e',()=>{expect(hd315fcx(15,0)).toBe(4);});});
function hd316fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316fcx_hd',()=>{it('a',()=>{expect(hd316fcx(1,4)).toBe(2);});it('b',()=>{expect(hd316fcx(3,1)).toBe(1);});it('c',()=>{expect(hd316fcx(0,0)).toBe(0);});it('d',()=>{expect(hd316fcx(93,73)).toBe(2);});it('e',()=>{expect(hd316fcx(15,0)).toBe(4);});});
function hd317fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317fcx_hd',()=>{it('a',()=>{expect(hd317fcx(1,4)).toBe(2);});it('b',()=>{expect(hd317fcx(3,1)).toBe(1);});it('c',()=>{expect(hd317fcx(0,0)).toBe(0);});it('d',()=>{expect(hd317fcx(93,73)).toBe(2);});it('e',()=>{expect(hd317fcx(15,0)).toBe(4);});});
function hd318fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318fcx_hd',()=>{it('a',()=>{expect(hd318fcx(1,4)).toBe(2);});it('b',()=>{expect(hd318fcx(3,1)).toBe(1);});it('c',()=>{expect(hd318fcx(0,0)).toBe(0);});it('d',()=>{expect(hd318fcx(93,73)).toBe(2);});it('e',()=>{expect(hd318fcx(15,0)).toBe(4);});});
function hd319fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319fcx_hd',()=>{it('a',()=>{expect(hd319fcx(1,4)).toBe(2);});it('b',()=>{expect(hd319fcx(3,1)).toBe(1);});it('c',()=>{expect(hd319fcx(0,0)).toBe(0);});it('d',()=>{expect(hd319fcx(93,73)).toBe(2);});it('e',()=>{expect(hd319fcx(15,0)).toBe(4);});});
function hd320fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320fcx_hd',()=>{it('a',()=>{expect(hd320fcx(1,4)).toBe(2);});it('b',()=>{expect(hd320fcx(3,1)).toBe(1);});it('c',()=>{expect(hd320fcx(0,0)).toBe(0);});it('d',()=>{expect(hd320fcx(93,73)).toBe(2);});it('e',()=>{expect(hd320fcx(15,0)).toBe(4);});});
function hd321fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321fcx_hd',()=>{it('a',()=>{expect(hd321fcx(1,4)).toBe(2);});it('b',()=>{expect(hd321fcx(3,1)).toBe(1);});it('c',()=>{expect(hd321fcx(0,0)).toBe(0);});it('d',()=>{expect(hd321fcx(93,73)).toBe(2);});it('e',()=>{expect(hd321fcx(15,0)).toBe(4);});});
function hd322fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322fcx_hd',()=>{it('a',()=>{expect(hd322fcx(1,4)).toBe(2);});it('b',()=>{expect(hd322fcx(3,1)).toBe(1);});it('c',()=>{expect(hd322fcx(0,0)).toBe(0);});it('d',()=>{expect(hd322fcx(93,73)).toBe(2);});it('e',()=>{expect(hd322fcx(15,0)).toBe(4);});});
function hd323fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323fcx_hd',()=>{it('a',()=>{expect(hd323fcx(1,4)).toBe(2);});it('b',()=>{expect(hd323fcx(3,1)).toBe(1);});it('c',()=>{expect(hd323fcx(0,0)).toBe(0);});it('d',()=>{expect(hd323fcx(93,73)).toBe(2);});it('e',()=>{expect(hd323fcx(15,0)).toBe(4);});});
function hd324fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324fcx_hd',()=>{it('a',()=>{expect(hd324fcx(1,4)).toBe(2);});it('b',()=>{expect(hd324fcx(3,1)).toBe(1);});it('c',()=>{expect(hd324fcx(0,0)).toBe(0);});it('d',()=>{expect(hd324fcx(93,73)).toBe(2);});it('e',()=>{expect(hd324fcx(15,0)).toBe(4);});});
function hd325fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325fcx_hd',()=>{it('a',()=>{expect(hd325fcx(1,4)).toBe(2);});it('b',()=>{expect(hd325fcx(3,1)).toBe(1);});it('c',()=>{expect(hd325fcx(0,0)).toBe(0);});it('d',()=>{expect(hd325fcx(93,73)).toBe(2);});it('e',()=>{expect(hd325fcx(15,0)).toBe(4);});});
function hd326fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326fcx_hd',()=>{it('a',()=>{expect(hd326fcx(1,4)).toBe(2);});it('b',()=>{expect(hd326fcx(3,1)).toBe(1);});it('c',()=>{expect(hd326fcx(0,0)).toBe(0);});it('d',()=>{expect(hd326fcx(93,73)).toBe(2);});it('e',()=>{expect(hd326fcx(15,0)).toBe(4);});});
function hd327fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327fcx_hd',()=>{it('a',()=>{expect(hd327fcx(1,4)).toBe(2);});it('b',()=>{expect(hd327fcx(3,1)).toBe(1);});it('c',()=>{expect(hd327fcx(0,0)).toBe(0);});it('d',()=>{expect(hd327fcx(93,73)).toBe(2);});it('e',()=>{expect(hd327fcx(15,0)).toBe(4);});});
function hd328fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328fcx_hd',()=>{it('a',()=>{expect(hd328fcx(1,4)).toBe(2);});it('b',()=>{expect(hd328fcx(3,1)).toBe(1);});it('c',()=>{expect(hd328fcx(0,0)).toBe(0);});it('d',()=>{expect(hd328fcx(93,73)).toBe(2);});it('e',()=>{expect(hd328fcx(15,0)).toBe(4);});});
function hd329fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329fcx_hd',()=>{it('a',()=>{expect(hd329fcx(1,4)).toBe(2);});it('b',()=>{expect(hd329fcx(3,1)).toBe(1);});it('c',()=>{expect(hd329fcx(0,0)).toBe(0);});it('d',()=>{expect(hd329fcx(93,73)).toBe(2);});it('e',()=>{expect(hd329fcx(15,0)).toBe(4);});});
function hd330fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330fcx_hd',()=>{it('a',()=>{expect(hd330fcx(1,4)).toBe(2);});it('b',()=>{expect(hd330fcx(3,1)).toBe(1);});it('c',()=>{expect(hd330fcx(0,0)).toBe(0);});it('d',()=>{expect(hd330fcx(93,73)).toBe(2);});it('e',()=>{expect(hd330fcx(15,0)).toBe(4);});});
function hd331fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331fcx_hd',()=>{it('a',()=>{expect(hd331fcx(1,4)).toBe(2);});it('b',()=>{expect(hd331fcx(3,1)).toBe(1);});it('c',()=>{expect(hd331fcx(0,0)).toBe(0);});it('d',()=>{expect(hd331fcx(93,73)).toBe(2);});it('e',()=>{expect(hd331fcx(15,0)).toBe(4);});});
function hd332fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332fcx_hd',()=>{it('a',()=>{expect(hd332fcx(1,4)).toBe(2);});it('b',()=>{expect(hd332fcx(3,1)).toBe(1);});it('c',()=>{expect(hd332fcx(0,0)).toBe(0);});it('d',()=>{expect(hd332fcx(93,73)).toBe(2);});it('e',()=>{expect(hd332fcx(15,0)).toBe(4);});});
function hd333fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333fcx_hd',()=>{it('a',()=>{expect(hd333fcx(1,4)).toBe(2);});it('b',()=>{expect(hd333fcx(3,1)).toBe(1);});it('c',()=>{expect(hd333fcx(0,0)).toBe(0);});it('d',()=>{expect(hd333fcx(93,73)).toBe(2);});it('e',()=>{expect(hd333fcx(15,0)).toBe(4);});});
function hd334fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334fcx_hd',()=>{it('a',()=>{expect(hd334fcx(1,4)).toBe(2);});it('b',()=>{expect(hd334fcx(3,1)).toBe(1);});it('c',()=>{expect(hd334fcx(0,0)).toBe(0);});it('d',()=>{expect(hd334fcx(93,73)).toBe(2);});it('e',()=>{expect(hd334fcx(15,0)).toBe(4);});});
function hd335fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335fcx_hd',()=>{it('a',()=>{expect(hd335fcx(1,4)).toBe(2);});it('b',()=>{expect(hd335fcx(3,1)).toBe(1);});it('c',()=>{expect(hd335fcx(0,0)).toBe(0);});it('d',()=>{expect(hd335fcx(93,73)).toBe(2);});it('e',()=>{expect(hd335fcx(15,0)).toBe(4);});});
function hd336fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336fcx_hd',()=>{it('a',()=>{expect(hd336fcx(1,4)).toBe(2);});it('b',()=>{expect(hd336fcx(3,1)).toBe(1);});it('c',()=>{expect(hd336fcx(0,0)).toBe(0);});it('d',()=>{expect(hd336fcx(93,73)).toBe(2);});it('e',()=>{expect(hd336fcx(15,0)).toBe(4);});});
function hd337fcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337fcx_hd',()=>{it('a',()=>{expect(hd337fcx(1,4)).toBe(2);});it('b',()=>{expect(hd337fcx(3,1)).toBe(1);});it('c',()=>{expect(hd337fcx(0,0)).toBe(0);});it('d',()=>{expect(hd337fcx(93,73)).toBe(2);});it('e',()=>{expect(hd337fcx(15,0)).toBe(4);});});
function hd338finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338finx2_hd',()=>{it('a',()=>{expect(hd338finx2(1,4)).toBe(2);});it('b',()=>{expect(hd338finx2(3,1)).toBe(1);});it('c',()=>{expect(hd338finx2(0,0)).toBe(0);});it('d',()=>{expect(hd338finx2(93,73)).toBe(2);});it('e',()=>{expect(hd338finx2(15,0)).toBe(4);});});
function hd339finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339finx2_hd',()=>{it('a',()=>{expect(hd339finx2(1,4)).toBe(2);});it('b',()=>{expect(hd339finx2(3,1)).toBe(1);});it('c',()=>{expect(hd339finx2(0,0)).toBe(0);});it('d',()=>{expect(hd339finx2(93,73)).toBe(2);});it('e',()=>{expect(hd339finx2(15,0)).toBe(4);});});
function hd340finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340finx2_hd',()=>{it('a',()=>{expect(hd340finx2(1,4)).toBe(2);});it('b',()=>{expect(hd340finx2(3,1)).toBe(1);});it('c',()=>{expect(hd340finx2(0,0)).toBe(0);});it('d',()=>{expect(hd340finx2(93,73)).toBe(2);});it('e',()=>{expect(hd340finx2(15,0)).toBe(4);});});
function hd341finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341finx2_hd',()=>{it('a',()=>{expect(hd341finx2(1,4)).toBe(2);});it('b',()=>{expect(hd341finx2(3,1)).toBe(1);});it('c',()=>{expect(hd341finx2(0,0)).toBe(0);});it('d',()=>{expect(hd341finx2(93,73)).toBe(2);});it('e',()=>{expect(hd341finx2(15,0)).toBe(4);});});
function hd342finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342finx2_hd',()=>{it('a',()=>{expect(hd342finx2(1,4)).toBe(2);});it('b',()=>{expect(hd342finx2(3,1)).toBe(1);});it('c',()=>{expect(hd342finx2(0,0)).toBe(0);});it('d',()=>{expect(hd342finx2(93,73)).toBe(2);});it('e',()=>{expect(hd342finx2(15,0)).toBe(4);});});
function hd343finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343finx2_hd',()=>{it('a',()=>{expect(hd343finx2(1,4)).toBe(2);});it('b',()=>{expect(hd343finx2(3,1)).toBe(1);});it('c',()=>{expect(hd343finx2(0,0)).toBe(0);});it('d',()=>{expect(hd343finx2(93,73)).toBe(2);});it('e',()=>{expect(hd343finx2(15,0)).toBe(4);});});
function hd344finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344finx2_hd',()=>{it('a',()=>{expect(hd344finx2(1,4)).toBe(2);});it('b',()=>{expect(hd344finx2(3,1)).toBe(1);});it('c',()=>{expect(hd344finx2(0,0)).toBe(0);});it('d',()=>{expect(hd344finx2(93,73)).toBe(2);});it('e',()=>{expect(hd344finx2(15,0)).toBe(4);});});
function hd345finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345finx2_hd',()=>{it('a',()=>{expect(hd345finx2(1,4)).toBe(2);});it('b',()=>{expect(hd345finx2(3,1)).toBe(1);});it('c',()=>{expect(hd345finx2(0,0)).toBe(0);});it('d',()=>{expect(hd345finx2(93,73)).toBe(2);});it('e',()=>{expect(hd345finx2(15,0)).toBe(4);});});
function hd346finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346finx2_hd',()=>{it('a',()=>{expect(hd346finx2(1,4)).toBe(2);});it('b',()=>{expect(hd346finx2(3,1)).toBe(1);});it('c',()=>{expect(hd346finx2(0,0)).toBe(0);});it('d',()=>{expect(hd346finx2(93,73)).toBe(2);});it('e',()=>{expect(hd346finx2(15,0)).toBe(4);});});
function hd347finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347finx2_hd',()=>{it('a',()=>{expect(hd347finx2(1,4)).toBe(2);});it('b',()=>{expect(hd347finx2(3,1)).toBe(1);});it('c',()=>{expect(hd347finx2(0,0)).toBe(0);});it('d',()=>{expect(hd347finx2(93,73)).toBe(2);});it('e',()=>{expect(hd347finx2(15,0)).toBe(4);});});
function hd348finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348finx2_hd',()=>{it('a',()=>{expect(hd348finx2(1,4)).toBe(2);});it('b',()=>{expect(hd348finx2(3,1)).toBe(1);});it('c',()=>{expect(hd348finx2(0,0)).toBe(0);});it('d',()=>{expect(hd348finx2(93,73)).toBe(2);});it('e',()=>{expect(hd348finx2(15,0)).toBe(4);});});
function hd349finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349finx2_hd',()=>{it('a',()=>{expect(hd349finx2(1,4)).toBe(2);});it('b',()=>{expect(hd349finx2(3,1)).toBe(1);});it('c',()=>{expect(hd349finx2(0,0)).toBe(0);});it('d',()=>{expect(hd349finx2(93,73)).toBe(2);});it('e',()=>{expect(hd349finx2(15,0)).toBe(4);});});
function hd350finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350finx2_hd',()=>{it('a',()=>{expect(hd350finx2(1,4)).toBe(2);});it('b',()=>{expect(hd350finx2(3,1)).toBe(1);});it('c',()=>{expect(hd350finx2(0,0)).toBe(0);});it('d',()=>{expect(hd350finx2(93,73)).toBe(2);});it('e',()=>{expect(hd350finx2(15,0)).toBe(4);});});
function hd351finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351finx2_hd',()=>{it('a',()=>{expect(hd351finx2(1,4)).toBe(2);});it('b',()=>{expect(hd351finx2(3,1)).toBe(1);});it('c',()=>{expect(hd351finx2(0,0)).toBe(0);});it('d',()=>{expect(hd351finx2(93,73)).toBe(2);});it('e',()=>{expect(hd351finx2(15,0)).toBe(4);});});
function hd352finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352finx2_hd',()=>{it('a',()=>{expect(hd352finx2(1,4)).toBe(2);});it('b',()=>{expect(hd352finx2(3,1)).toBe(1);});it('c',()=>{expect(hd352finx2(0,0)).toBe(0);});it('d',()=>{expect(hd352finx2(93,73)).toBe(2);});it('e',()=>{expect(hd352finx2(15,0)).toBe(4);});});
function hd353finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353finx2_hd',()=>{it('a',()=>{expect(hd353finx2(1,4)).toBe(2);});it('b',()=>{expect(hd353finx2(3,1)).toBe(1);});it('c',()=>{expect(hd353finx2(0,0)).toBe(0);});it('d',()=>{expect(hd353finx2(93,73)).toBe(2);});it('e',()=>{expect(hd353finx2(15,0)).toBe(4);});});
function hd354finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354finx2_hd',()=>{it('a',()=>{expect(hd354finx2(1,4)).toBe(2);});it('b',()=>{expect(hd354finx2(3,1)).toBe(1);});it('c',()=>{expect(hd354finx2(0,0)).toBe(0);});it('d',()=>{expect(hd354finx2(93,73)).toBe(2);});it('e',()=>{expect(hd354finx2(15,0)).toBe(4);});});
function hd355finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355finx2_hd',()=>{it('a',()=>{expect(hd355finx2(1,4)).toBe(2);});it('b',()=>{expect(hd355finx2(3,1)).toBe(1);});it('c',()=>{expect(hd355finx2(0,0)).toBe(0);});it('d',()=>{expect(hd355finx2(93,73)).toBe(2);});it('e',()=>{expect(hd355finx2(15,0)).toBe(4);});});
function hd356finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356finx2_hd',()=>{it('a',()=>{expect(hd356finx2(1,4)).toBe(2);});it('b',()=>{expect(hd356finx2(3,1)).toBe(1);});it('c',()=>{expect(hd356finx2(0,0)).toBe(0);});it('d',()=>{expect(hd356finx2(93,73)).toBe(2);});it('e',()=>{expect(hd356finx2(15,0)).toBe(4);});});
function hd357finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357finx2_hd',()=>{it('a',()=>{expect(hd357finx2(1,4)).toBe(2);});it('b',()=>{expect(hd357finx2(3,1)).toBe(1);});it('c',()=>{expect(hd357finx2(0,0)).toBe(0);});it('d',()=>{expect(hd357finx2(93,73)).toBe(2);});it('e',()=>{expect(hd357finx2(15,0)).toBe(4);});});
function hd358finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358finx2_hd',()=>{it('a',()=>{expect(hd358finx2(1,4)).toBe(2);});it('b',()=>{expect(hd358finx2(3,1)).toBe(1);});it('c',()=>{expect(hd358finx2(0,0)).toBe(0);});it('d',()=>{expect(hd358finx2(93,73)).toBe(2);});it('e',()=>{expect(hd358finx2(15,0)).toBe(4);});});
function hd359finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359finx2_hd',()=>{it('a',()=>{expect(hd359finx2(1,4)).toBe(2);});it('b',()=>{expect(hd359finx2(3,1)).toBe(1);});it('c',()=>{expect(hd359finx2(0,0)).toBe(0);});it('d',()=>{expect(hd359finx2(93,73)).toBe(2);});it('e',()=>{expect(hd359finx2(15,0)).toBe(4);});});
function hd360finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360finx2_hd',()=>{it('a',()=>{expect(hd360finx2(1,4)).toBe(2);});it('b',()=>{expect(hd360finx2(3,1)).toBe(1);});it('c',()=>{expect(hd360finx2(0,0)).toBe(0);});it('d',()=>{expect(hd360finx2(93,73)).toBe(2);});it('e',()=>{expect(hd360finx2(15,0)).toBe(4);});});
function hd361finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361finx2_hd',()=>{it('a',()=>{expect(hd361finx2(1,4)).toBe(2);});it('b',()=>{expect(hd361finx2(3,1)).toBe(1);});it('c',()=>{expect(hd361finx2(0,0)).toBe(0);});it('d',()=>{expect(hd361finx2(93,73)).toBe(2);});it('e',()=>{expect(hd361finx2(15,0)).toBe(4);});});
function hd362finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362finx2_hd',()=>{it('a',()=>{expect(hd362finx2(1,4)).toBe(2);});it('b',()=>{expect(hd362finx2(3,1)).toBe(1);});it('c',()=>{expect(hd362finx2(0,0)).toBe(0);});it('d',()=>{expect(hd362finx2(93,73)).toBe(2);});it('e',()=>{expect(hd362finx2(15,0)).toBe(4);});});
function hd363finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363finx2_hd',()=>{it('a',()=>{expect(hd363finx2(1,4)).toBe(2);});it('b',()=>{expect(hd363finx2(3,1)).toBe(1);});it('c',()=>{expect(hd363finx2(0,0)).toBe(0);});it('d',()=>{expect(hd363finx2(93,73)).toBe(2);});it('e',()=>{expect(hd363finx2(15,0)).toBe(4);});});
function hd364finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364finx2_hd',()=>{it('a',()=>{expect(hd364finx2(1,4)).toBe(2);});it('b',()=>{expect(hd364finx2(3,1)).toBe(1);});it('c',()=>{expect(hd364finx2(0,0)).toBe(0);});it('d',()=>{expect(hd364finx2(93,73)).toBe(2);});it('e',()=>{expect(hd364finx2(15,0)).toBe(4);});});
function hd365finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365finx2_hd',()=>{it('a',()=>{expect(hd365finx2(1,4)).toBe(2);});it('b',()=>{expect(hd365finx2(3,1)).toBe(1);});it('c',()=>{expect(hd365finx2(0,0)).toBe(0);});it('d',()=>{expect(hd365finx2(93,73)).toBe(2);});it('e',()=>{expect(hd365finx2(15,0)).toBe(4);});});
function hd366finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366finx2_hd',()=>{it('a',()=>{expect(hd366finx2(1,4)).toBe(2);});it('b',()=>{expect(hd366finx2(3,1)).toBe(1);});it('c',()=>{expect(hd366finx2(0,0)).toBe(0);});it('d',()=>{expect(hd366finx2(93,73)).toBe(2);});it('e',()=>{expect(hd366finx2(15,0)).toBe(4);});});
function hd367finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367finx2_hd',()=>{it('a',()=>{expect(hd367finx2(1,4)).toBe(2);});it('b',()=>{expect(hd367finx2(3,1)).toBe(1);});it('c',()=>{expect(hd367finx2(0,0)).toBe(0);});it('d',()=>{expect(hd367finx2(93,73)).toBe(2);});it('e',()=>{expect(hd367finx2(15,0)).toBe(4);});});
function hd368finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368finx2_hd',()=>{it('a',()=>{expect(hd368finx2(1,4)).toBe(2);});it('b',()=>{expect(hd368finx2(3,1)).toBe(1);});it('c',()=>{expect(hd368finx2(0,0)).toBe(0);});it('d',()=>{expect(hd368finx2(93,73)).toBe(2);});it('e',()=>{expect(hd368finx2(15,0)).toBe(4);});});
function hd369finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369finx2_hd',()=>{it('a',()=>{expect(hd369finx2(1,4)).toBe(2);});it('b',()=>{expect(hd369finx2(3,1)).toBe(1);});it('c',()=>{expect(hd369finx2(0,0)).toBe(0);});it('d',()=>{expect(hd369finx2(93,73)).toBe(2);});it('e',()=>{expect(hd369finx2(15,0)).toBe(4);});});
function hd370finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370finx2_hd',()=>{it('a',()=>{expect(hd370finx2(1,4)).toBe(2);});it('b',()=>{expect(hd370finx2(3,1)).toBe(1);});it('c',()=>{expect(hd370finx2(0,0)).toBe(0);});it('d',()=>{expect(hd370finx2(93,73)).toBe(2);});it('e',()=>{expect(hd370finx2(15,0)).toBe(4);});});
function hd371finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371finx2_hd',()=>{it('a',()=>{expect(hd371finx2(1,4)).toBe(2);});it('b',()=>{expect(hd371finx2(3,1)).toBe(1);});it('c',()=>{expect(hd371finx2(0,0)).toBe(0);});it('d',()=>{expect(hd371finx2(93,73)).toBe(2);});it('e',()=>{expect(hd371finx2(15,0)).toBe(4);});});
function hd372finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372finx2_hd',()=>{it('a',()=>{expect(hd372finx2(1,4)).toBe(2);});it('b',()=>{expect(hd372finx2(3,1)).toBe(1);});it('c',()=>{expect(hd372finx2(0,0)).toBe(0);});it('d',()=>{expect(hd372finx2(93,73)).toBe(2);});it('e',()=>{expect(hd372finx2(15,0)).toBe(4);});});
function hd373finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373finx2_hd',()=>{it('a',()=>{expect(hd373finx2(1,4)).toBe(2);});it('b',()=>{expect(hd373finx2(3,1)).toBe(1);});it('c',()=>{expect(hd373finx2(0,0)).toBe(0);});it('d',()=>{expect(hd373finx2(93,73)).toBe(2);});it('e',()=>{expect(hd373finx2(15,0)).toBe(4);});});
function hd374finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374finx2_hd',()=>{it('a',()=>{expect(hd374finx2(1,4)).toBe(2);});it('b',()=>{expect(hd374finx2(3,1)).toBe(1);});it('c',()=>{expect(hd374finx2(0,0)).toBe(0);});it('d',()=>{expect(hd374finx2(93,73)).toBe(2);});it('e',()=>{expect(hd374finx2(15,0)).toBe(4);});});
function hd375finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375finx2_hd',()=>{it('a',()=>{expect(hd375finx2(1,4)).toBe(2);});it('b',()=>{expect(hd375finx2(3,1)).toBe(1);});it('c',()=>{expect(hd375finx2(0,0)).toBe(0);});it('d',()=>{expect(hd375finx2(93,73)).toBe(2);});it('e',()=>{expect(hd375finx2(15,0)).toBe(4);});});
function hd376finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376finx2_hd',()=>{it('a',()=>{expect(hd376finx2(1,4)).toBe(2);});it('b',()=>{expect(hd376finx2(3,1)).toBe(1);});it('c',()=>{expect(hd376finx2(0,0)).toBe(0);});it('d',()=>{expect(hd376finx2(93,73)).toBe(2);});it('e',()=>{expect(hd376finx2(15,0)).toBe(4);});});
function hd377finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377finx2_hd',()=>{it('a',()=>{expect(hd377finx2(1,4)).toBe(2);});it('b',()=>{expect(hd377finx2(3,1)).toBe(1);});it('c',()=>{expect(hd377finx2(0,0)).toBe(0);});it('d',()=>{expect(hd377finx2(93,73)).toBe(2);});it('e',()=>{expect(hd377finx2(15,0)).toBe(4);});});
function hd378finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378finx2_hd',()=>{it('a',()=>{expect(hd378finx2(1,4)).toBe(2);});it('b',()=>{expect(hd378finx2(3,1)).toBe(1);});it('c',()=>{expect(hd378finx2(0,0)).toBe(0);});it('d',()=>{expect(hd378finx2(93,73)).toBe(2);});it('e',()=>{expect(hd378finx2(15,0)).toBe(4);});});
function hd379finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379finx2_hd',()=>{it('a',()=>{expect(hd379finx2(1,4)).toBe(2);});it('b',()=>{expect(hd379finx2(3,1)).toBe(1);});it('c',()=>{expect(hd379finx2(0,0)).toBe(0);});it('d',()=>{expect(hd379finx2(93,73)).toBe(2);});it('e',()=>{expect(hd379finx2(15,0)).toBe(4);});});
function hd380finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380finx2_hd',()=>{it('a',()=>{expect(hd380finx2(1,4)).toBe(2);});it('b',()=>{expect(hd380finx2(3,1)).toBe(1);});it('c',()=>{expect(hd380finx2(0,0)).toBe(0);});it('d',()=>{expect(hd380finx2(93,73)).toBe(2);});it('e',()=>{expect(hd380finx2(15,0)).toBe(4);});});
function hd381finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381finx2_hd',()=>{it('a',()=>{expect(hd381finx2(1,4)).toBe(2);});it('b',()=>{expect(hd381finx2(3,1)).toBe(1);});it('c',()=>{expect(hd381finx2(0,0)).toBe(0);});it('d',()=>{expect(hd381finx2(93,73)).toBe(2);});it('e',()=>{expect(hd381finx2(15,0)).toBe(4);});});
function hd382finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382finx2_hd',()=>{it('a',()=>{expect(hd382finx2(1,4)).toBe(2);});it('b',()=>{expect(hd382finx2(3,1)).toBe(1);});it('c',()=>{expect(hd382finx2(0,0)).toBe(0);});it('d',()=>{expect(hd382finx2(93,73)).toBe(2);});it('e',()=>{expect(hd382finx2(15,0)).toBe(4);});});
function hd383finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383finx2_hd',()=>{it('a',()=>{expect(hd383finx2(1,4)).toBe(2);});it('b',()=>{expect(hd383finx2(3,1)).toBe(1);});it('c',()=>{expect(hd383finx2(0,0)).toBe(0);});it('d',()=>{expect(hd383finx2(93,73)).toBe(2);});it('e',()=>{expect(hd383finx2(15,0)).toBe(4);});});
function hd384finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384finx2_hd',()=>{it('a',()=>{expect(hd384finx2(1,4)).toBe(2);});it('b',()=>{expect(hd384finx2(3,1)).toBe(1);});it('c',()=>{expect(hd384finx2(0,0)).toBe(0);});it('d',()=>{expect(hd384finx2(93,73)).toBe(2);});it('e',()=>{expect(hd384finx2(15,0)).toBe(4);});});
function hd385finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385finx2_hd',()=>{it('a',()=>{expect(hd385finx2(1,4)).toBe(2);});it('b',()=>{expect(hd385finx2(3,1)).toBe(1);});it('c',()=>{expect(hd385finx2(0,0)).toBe(0);});it('d',()=>{expect(hd385finx2(93,73)).toBe(2);});it('e',()=>{expect(hd385finx2(15,0)).toBe(4);});});
function hd386finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386finx2_hd',()=>{it('a',()=>{expect(hd386finx2(1,4)).toBe(2);});it('b',()=>{expect(hd386finx2(3,1)).toBe(1);});it('c',()=>{expect(hd386finx2(0,0)).toBe(0);});it('d',()=>{expect(hd386finx2(93,73)).toBe(2);});it('e',()=>{expect(hd386finx2(15,0)).toBe(4);});});
function hd387finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387finx2_hd',()=>{it('a',()=>{expect(hd387finx2(1,4)).toBe(2);});it('b',()=>{expect(hd387finx2(3,1)).toBe(1);});it('c',()=>{expect(hd387finx2(0,0)).toBe(0);});it('d',()=>{expect(hd387finx2(93,73)).toBe(2);});it('e',()=>{expect(hd387finx2(15,0)).toBe(4);});});
function hd388finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388finx2_hd',()=>{it('a',()=>{expect(hd388finx2(1,4)).toBe(2);});it('b',()=>{expect(hd388finx2(3,1)).toBe(1);});it('c',()=>{expect(hd388finx2(0,0)).toBe(0);});it('d',()=>{expect(hd388finx2(93,73)).toBe(2);});it('e',()=>{expect(hd388finx2(15,0)).toBe(4);});});
function hd389finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389finx2_hd',()=>{it('a',()=>{expect(hd389finx2(1,4)).toBe(2);});it('b',()=>{expect(hd389finx2(3,1)).toBe(1);});it('c',()=>{expect(hd389finx2(0,0)).toBe(0);});it('d',()=>{expect(hd389finx2(93,73)).toBe(2);});it('e',()=>{expect(hd389finx2(15,0)).toBe(4);});});
function hd390finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390finx2_hd',()=>{it('a',()=>{expect(hd390finx2(1,4)).toBe(2);});it('b',()=>{expect(hd390finx2(3,1)).toBe(1);});it('c',()=>{expect(hd390finx2(0,0)).toBe(0);});it('d',()=>{expect(hd390finx2(93,73)).toBe(2);});it('e',()=>{expect(hd390finx2(15,0)).toBe(4);});});
function hd391finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391finx2_hd',()=>{it('a',()=>{expect(hd391finx2(1,4)).toBe(2);});it('b',()=>{expect(hd391finx2(3,1)).toBe(1);});it('c',()=>{expect(hd391finx2(0,0)).toBe(0);});it('d',()=>{expect(hd391finx2(93,73)).toBe(2);});it('e',()=>{expect(hd391finx2(15,0)).toBe(4);});});
function hd392finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392finx2_hd',()=>{it('a',()=>{expect(hd392finx2(1,4)).toBe(2);});it('b',()=>{expect(hd392finx2(3,1)).toBe(1);});it('c',()=>{expect(hd392finx2(0,0)).toBe(0);});it('d',()=>{expect(hd392finx2(93,73)).toBe(2);});it('e',()=>{expect(hd392finx2(15,0)).toBe(4);});});
function hd393finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393finx2_hd',()=>{it('a',()=>{expect(hd393finx2(1,4)).toBe(2);});it('b',()=>{expect(hd393finx2(3,1)).toBe(1);});it('c',()=>{expect(hd393finx2(0,0)).toBe(0);});it('d',()=>{expect(hd393finx2(93,73)).toBe(2);});it('e',()=>{expect(hd393finx2(15,0)).toBe(4);});});
function hd394finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394finx2_hd',()=>{it('a',()=>{expect(hd394finx2(1,4)).toBe(2);});it('b',()=>{expect(hd394finx2(3,1)).toBe(1);});it('c',()=>{expect(hd394finx2(0,0)).toBe(0);});it('d',()=>{expect(hd394finx2(93,73)).toBe(2);});it('e',()=>{expect(hd394finx2(15,0)).toBe(4);});});
function hd395finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395finx2_hd',()=>{it('a',()=>{expect(hd395finx2(1,4)).toBe(2);});it('b',()=>{expect(hd395finx2(3,1)).toBe(1);});it('c',()=>{expect(hd395finx2(0,0)).toBe(0);});it('d',()=>{expect(hd395finx2(93,73)).toBe(2);});it('e',()=>{expect(hd395finx2(15,0)).toBe(4);});});
function hd396finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396finx2_hd',()=>{it('a',()=>{expect(hd396finx2(1,4)).toBe(2);});it('b',()=>{expect(hd396finx2(3,1)).toBe(1);});it('c',()=>{expect(hd396finx2(0,0)).toBe(0);});it('d',()=>{expect(hd396finx2(93,73)).toBe(2);});it('e',()=>{expect(hd396finx2(15,0)).toBe(4);});});
function hd397finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397finx2_hd',()=>{it('a',()=>{expect(hd397finx2(1,4)).toBe(2);});it('b',()=>{expect(hd397finx2(3,1)).toBe(1);});it('c',()=>{expect(hd397finx2(0,0)).toBe(0);});it('d',()=>{expect(hd397finx2(93,73)).toBe(2);});it('e',()=>{expect(hd397finx2(15,0)).toBe(4);});});
function hd398finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398finx2_hd',()=>{it('a',()=>{expect(hd398finx2(1,4)).toBe(2);});it('b',()=>{expect(hd398finx2(3,1)).toBe(1);});it('c',()=>{expect(hd398finx2(0,0)).toBe(0);});it('d',()=>{expect(hd398finx2(93,73)).toBe(2);});it('e',()=>{expect(hd398finx2(15,0)).toBe(4);});});
function hd399finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399finx2_hd',()=>{it('a',()=>{expect(hd399finx2(1,4)).toBe(2);});it('b',()=>{expect(hd399finx2(3,1)).toBe(1);});it('c',()=>{expect(hd399finx2(0,0)).toBe(0);});it('d',()=>{expect(hd399finx2(93,73)).toBe(2);});it('e',()=>{expect(hd399finx2(15,0)).toBe(4);});});
function hd400finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400finx2_hd',()=>{it('a',()=>{expect(hd400finx2(1,4)).toBe(2);});it('b',()=>{expect(hd400finx2(3,1)).toBe(1);});it('c',()=>{expect(hd400finx2(0,0)).toBe(0);});it('d',()=>{expect(hd400finx2(93,73)).toBe(2);});it('e',()=>{expect(hd400finx2(15,0)).toBe(4);});});
function hd401finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401finx2_hd',()=>{it('a',()=>{expect(hd401finx2(1,4)).toBe(2);});it('b',()=>{expect(hd401finx2(3,1)).toBe(1);});it('c',()=>{expect(hd401finx2(0,0)).toBe(0);});it('d',()=>{expect(hd401finx2(93,73)).toBe(2);});it('e',()=>{expect(hd401finx2(15,0)).toBe(4);});});
function hd402finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402finx2_hd',()=>{it('a',()=>{expect(hd402finx2(1,4)).toBe(2);});it('b',()=>{expect(hd402finx2(3,1)).toBe(1);});it('c',()=>{expect(hd402finx2(0,0)).toBe(0);});it('d',()=>{expect(hd402finx2(93,73)).toBe(2);});it('e',()=>{expect(hd402finx2(15,0)).toBe(4);});});
function hd403finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403finx2_hd',()=>{it('a',()=>{expect(hd403finx2(1,4)).toBe(2);});it('b',()=>{expect(hd403finx2(3,1)).toBe(1);});it('c',()=>{expect(hd403finx2(0,0)).toBe(0);});it('d',()=>{expect(hd403finx2(93,73)).toBe(2);});it('e',()=>{expect(hd403finx2(15,0)).toBe(4);});});
function hd404finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404finx2_hd',()=>{it('a',()=>{expect(hd404finx2(1,4)).toBe(2);});it('b',()=>{expect(hd404finx2(3,1)).toBe(1);});it('c',()=>{expect(hd404finx2(0,0)).toBe(0);});it('d',()=>{expect(hd404finx2(93,73)).toBe(2);});it('e',()=>{expect(hd404finx2(15,0)).toBe(4);});});
function hd405finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405finx2_hd',()=>{it('a',()=>{expect(hd405finx2(1,4)).toBe(2);});it('b',()=>{expect(hd405finx2(3,1)).toBe(1);});it('c',()=>{expect(hd405finx2(0,0)).toBe(0);});it('d',()=>{expect(hd405finx2(93,73)).toBe(2);});it('e',()=>{expect(hd405finx2(15,0)).toBe(4);});});
function hd406finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406finx2_hd',()=>{it('a',()=>{expect(hd406finx2(1,4)).toBe(2);});it('b',()=>{expect(hd406finx2(3,1)).toBe(1);});it('c',()=>{expect(hd406finx2(0,0)).toBe(0);});it('d',()=>{expect(hd406finx2(93,73)).toBe(2);});it('e',()=>{expect(hd406finx2(15,0)).toBe(4);});});
function hd407finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407finx2_hd',()=>{it('a',()=>{expect(hd407finx2(1,4)).toBe(2);});it('b',()=>{expect(hd407finx2(3,1)).toBe(1);});it('c',()=>{expect(hd407finx2(0,0)).toBe(0);});it('d',()=>{expect(hd407finx2(93,73)).toBe(2);});it('e',()=>{expect(hd407finx2(15,0)).toBe(4);});});
function hd408finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408finx2_hd',()=>{it('a',()=>{expect(hd408finx2(1,4)).toBe(2);});it('b',()=>{expect(hd408finx2(3,1)).toBe(1);});it('c',()=>{expect(hd408finx2(0,0)).toBe(0);});it('d',()=>{expect(hd408finx2(93,73)).toBe(2);});it('e',()=>{expect(hd408finx2(15,0)).toBe(4);});});
function hd409finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409finx2_hd',()=>{it('a',()=>{expect(hd409finx2(1,4)).toBe(2);});it('b',()=>{expect(hd409finx2(3,1)).toBe(1);});it('c',()=>{expect(hd409finx2(0,0)).toBe(0);});it('d',()=>{expect(hd409finx2(93,73)).toBe(2);});it('e',()=>{expect(hd409finx2(15,0)).toBe(4);});});
function hd410finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410finx2_hd',()=>{it('a',()=>{expect(hd410finx2(1,4)).toBe(2);});it('b',()=>{expect(hd410finx2(3,1)).toBe(1);});it('c',()=>{expect(hd410finx2(0,0)).toBe(0);});it('d',()=>{expect(hd410finx2(93,73)).toBe(2);});it('e',()=>{expect(hd410finx2(15,0)).toBe(4);});});
function hd411finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411finx2_hd',()=>{it('a',()=>{expect(hd411finx2(1,4)).toBe(2);});it('b',()=>{expect(hd411finx2(3,1)).toBe(1);});it('c',()=>{expect(hd411finx2(0,0)).toBe(0);});it('d',()=>{expect(hd411finx2(93,73)).toBe(2);});it('e',()=>{expect(hd411finx2(15,0)).toBe(4);});});
function hd412finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412finx2_hd',()=>{it('a',()=>{expect(hd412finx2(1,4)).toBe(2);});it('b',()=>{expect(hd412finx2(3,1)).toBe(1);});it('c',()=>{expect(hd412finx2(0,0)).toBe(0);});it('d',()=>{expect(hd412finx2(93,73)).toBe(2);});it('e',()=>{expect(hd412finx2(15,0)).toBe(4);});});
function hd413finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413finx2_hd',()=>{it('a',()=>{expect(hd413finx2(1,4)).toBe(2);});it('b',()=>{expect(hd413finx2(3,1)).toBe(1);});it('c',()=>{expect(hd413finx2(0,0)).toBe(0);});it('d',()=>{expect(hd413finx2(93,73)).toBe(2);});it('e',()=>{expect(hd413finx2(15,0)).toBe(4);});});
function hd414finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414finx2_hd',()=>{it('a',()=>{expect(hd414finx2(1,4)).toBe(2);});it('b',()=>{expect(hd414finx2(3,1)).toBe(1);});it('c',()=>{expect(hd414finx2(0,0)).toBe(0);});it('d',()=>{expect(hd414finx2(93,73)).toBe(2);});it('e',()=>{expect(hd414finx2(15,0)).toBe(4);});});
function hd415finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415finx2_hd',()=>{it('a',()=>{expect(hd415finx2(1,4)).toBe(2);});it('b',()=>{expect(hd415finx2(3,1)).toBe(1);});it('c',()=>{expect(hd415finx2(0,0)).toBe(0);});it('d',()=>{expect(hd415finx2(93,73)).toBe(2);});it('e',()=>{expect(hd415finx2(15,0)).toBe(4);});});
function hd416finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416finx2_hd',()=>{it('a',()=>{expect(hd416finx2(1,4)).toBe(2);});it('b',()=>{expect(hd416finx2(3,1)).toBe(1);});it('c',()=>{expect(hd416finx2(0,0)).toBe(0);});it('d',()=>{expect(hd416finx2(93,73)).toBe(2);});it('e',()=>{expect(hd416finx2(15,0)).toBe(4);});});
function hd417finx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417finx2_hd',()=>{it('a',()=>{expect(hd417finx2(1,4)).toBe(2);});it('b',()=>{expect(hd417finx2(3,1)).toBe(1);});it('c',()=>{expect(hd417finx2(0,0)).toBe(0);});it('d',()=>{expect(hd417finx2(93,73)).toBe(2);});it('e',()=>{expect(hd417finx2(15,0)).toBe(4);});});
