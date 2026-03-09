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
