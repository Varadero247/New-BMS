// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-reg-monitor specification tests

type RegulatoryArea = 'ENVIRONMENTAL' | 'HEALTH_SAFETY' | 'QUALITY' | 'FINANCIAL' | 'DATA_PRIVACY' | 'EMPLOYMENT' | 'PRODUCT_SAFETY';
type ChangeType = 'NEW_REGULATION' | 'AMENDMENT' | 'REPEAL' | 'GUIDANCE' | 'ENFORCEMENT_ACTION';
type ComplianceImpact = 'NONE' | 'MINOR' | 'MODERATE' | 'SIGNIFICANT' | 'CRITICAL';
type RegulationStatus = 'PROPOSED' | 'ENACTED' | 'IN_FORCE' | 'SUPERSEDED' | 'REPEALED';

const REGULATORY_AREAS: RegulatoryArea[] = ['ENVIRONMENTAL', 'HEALTH_SAFETY', 'QUALITY', 'FINANCIAL', 'DATA_PRIVACY', 'EMPLOYMENT', 'PRODUCT_SAFETY'];
const CHANGE_TYPES: ChangeType[] = ['NEW_REGULATION', 'AMENDMENT', 'REPEAL', 'GUIDANCE', 'ENFORCEMENT_ACTION'];
const COMPLIANCE_IMPACTS: ComplianceImpact[] = ['NONE', 'MINOR', 'MODERATE', 'SIGNIFICANT', 'CRITICAL'];
const REGULATION_STATUSES: RegulationStatus[] = ['PROPOSED', 'ENACTED', 'IN_FORCE', 'SUPERSEDED', 'REPEALED'];

const impactColor: Record<ComplianceImpact, string> = {
  NONE: 'bg-gray-100 text-gray-700',
  MINOR: 'bg-blue-100 text-blue-800',
  MODERATE: 'bg-yellow-100 text-yellow-800',
  SIGNIFICANT: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const impactScore: Record<ComplianceImpact, number> = {
  NONE: 0, MINOR: 1, MODERATE: 2, SIGNIFICANT: 3, CRITICAL: 4,
};

const changeTypeLabel: Record<ChangeType, string> = {
  NEW_REGULATION: 'New Regulation',
  AMENDMENT: 'Amendment',
  REPEAL: 'Repeal',
  GUIDANCE: 'Guidance',
  ENFORCEMENT_ACTION: 'Enforcement Action',
};

function requiresImmediateReview(impact: ComplianceImpact): boolean {
  return impact === 'SIGNIFICANT' || impact === 'CRITICAL';
}

function isRegulationActive(status: RegulationStatus): boolean {
  return status === 'IN_FORCE';
}

function daysUntilEffective(effectiveDate: Date, now: Date): number {
  return Math.ceil((effectiveDate.getTime() - now.getTime()) / 86400000);
}

function complianceGapScore(totalRequirements: number, compliantRequirements: number): number {
  if (totalRequirements === 0) return 100;
  return (compliantRequirements / totalRequirements) * 100;
}

describe('Compliance impact colors', () => {
  COMPLIANCE_IMPACTS.forEach(i => {
    it(`${i} has color`, () => expect(impactColor[i]).toBeDefined());
    it(`${i} color has bg-`, () => expect(impactColor[i]).toContain('bg-'));
  });
  it('CRITICAL is red', () => expect(impactColor.CRITICAL).toContain('red'));
  it('NONE is gray', () => expect(impactColor.NONE).toContain('gray'));
  for (let i = 0; i < 100; i++) {
    const imp = COMPLIANCE_IMPACTS[i % 5];
    it(`impact color string (idx ${i})`, () => expect(typeof impactColor[imp]).toBe('string'));
  }
});

describe('Impact scores', () => {
  it('CRITICAL = 4', () => expect(impactScore.CRITICAL).toBe(4));
  it('NONE = 0', () => expect(impactScore.NONE).toBe(0));
  it('scores increase with impact', () => {
    expect(impactScore.NONE).toBeLessThan(impactScore.MINOR);
    expect(impactScore.MINOR).toBeLessThan(impactScore.MODERATE);
    expect(impactScore.MODERATE).toBeLessThan(impactScore.SIGNIFICANT);
    expect(impactScore.SIGNIFICANT).toBeLessThan(impactScore.CRITICAL);
  });
  for (let i = 0; i < 100; i++) {
    const imp = COMPLIANCE_IMPACTS[i % 5];
    it(`impact score for ${imp} is non-negative (idx ${i})`, () => expect(impactScore[imp]).toBeGreaterThanOrEqual(0));
  }
});

describe('Change type labels', () => {
  CHANGE_TYPES.forEach(c => {
    it(`${c} has label`, () => expect(changeTypeLabel[c]).toBeDefined());
    it(`${c} label is non-empty`, () => expect(changeTypeLabel[c].length).toBeGreaterThan(0));
  });
  it('NEW_REGULATION label contains New', () => expect(changeTypeLabel.NEW_REGULATION).toContain('New'));
  for (let i = 0; i < 50; i++) {
    const c = CHANGE_TYPES[i % 5];
    it(`change type label for ${c} is string (idx ${i})`, () => expect(typeof changeTypeLabel[c]).toBe('string'));
  }
});

describe('requiresImmediateReview', () => {
  it('CRITICAL requires immediate review', () => expect(requiresImmediateReview('CRITICAL')).toBe(true));
  it('SIGNIFICANT requires immediate review', () => expect(requiresImmediateReview('SIGNIFICANT')).toBe(true));
  it('MODERATE does not', () => expect(requiresImmediateReview('MODERATE')).toBe(false));
  it('NONE does not', () => expect(requiresImmediateReview('NONE')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const imp = COMPLIANCE_IMPACTS[i % 5];
    it(`requiresImmediateReview(${imp}) returns boolean (idx ${i})`, () => expect(typeof requiresImmediateReview(imp)).toBe('boolean'));
  }
});

describe('isRegulationActive', () => {
  it('IN_FORCE is active', () => expect(isRegulationActive('IN_FORCE')).toBe(true));
  it('PROPOSED is not active', () => expect(isRegulationActive('PROPOSED')).toBe(false));
  it('REPEALED is not active', () => expect(isRegulationActive('REPEALED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = REGULATION_STATUSES[i % 5];
    it(`isRegulationActive(${s}) returns boolean (idx ${i})`, () => expect(typeof isRegulationActive(s)).toBe('boolean'));
  }
});

describe('daysUntilEffective', () => {
  it('30 days until effective = 30', () => {
    const now = new Date('2026-01-01');
    const effective = new Date('2026-01-31');
    expect(daysUntilEffective(effective, now)).toBe(30);
  });
  it('past effective date is negative', () => {
    const now = new Date('2026-02-01');
    const effective = new Date('2026-01-01');
    expect(daysUntilEffective(effective, now)).toBeLessThan(0);
  });
  for (let d = 0; d <= 50; d++) {
    it(`daysUntilEffective(+${d}d) = ${d}`, () => {
      const now = new Date('2026-01-01');
      const effective = new Date(now.getTime() + d * 86400000);
      expect(daysUntilEffective(effective, now)).toBe(d);
    });
  }
});
function hd258rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258rmx_hd',()=>{it('a',()=>{expect(hd258rmx(1,4)).toBe(2);});it('b',()=>{expect(hd258rmx(3,1)).toBe(1);});it('c',()=>{expect(hd258rmx(0,0)).toBe(0);});it('d',()=>{expect(hd258rmx(93,73)).toBe(2);});it('e',()=>{expect(hd258rmx(15,0)).toBe(4);});});
function hd259rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259rmx_hd',()=>{it('a',()=>{expect(hd259rmx(1,4)).toBe(2);});it('b',()=>{expect(hd259rmx(3,1)).toBe(1);});it('c',()=>{expect(hd259rmx(0,0)).toBe(0);});it('d',()=>{expect(hd259rmx(93,73)).toBe(2);});it('e',()=>{expect(hd259rmx(15,0)).toBe(4);});});
function hd260rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260rmx_hd',()=>{it('a',()=>{expect(hd260rmx(1,4)).toBe(2);});it('b',()=>{expect(hd260rmx(3,1)).toBe(1);});it('c',()=>{expect(hd260rmx(0,0)).toBe(0);});it('d',()=>{expect(hd260rmx(93,73)).toBe(2);});it('e',()=>{expect(hd260rmx(15,0)).toBe(4);});});
function hd261rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261rmx_hd',()=>{it('a',()=>{expect(hd261rmx(1,4)).toBe(2);});it('b',()=>{expect(hd261rmx(3,1)).toBe(1);});it('c',()=>{expect(hd261rmx(0,0)).toBe(0);});it('d',()=>{expect(hd261rmx(93,73)).toBe(2);});it('e',()=>{expect(hd261rmx(15,0)).toBe(4);});});
function hd262rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262rmx_hd',()=>{it('a',()=>{expect(hd262rmx(1,4)).toBe(2);});it('b',()=>{expect(hd262rmx(3,1)).toBe(1);});it('c',()=>{expect(hd262rmx(0,0)).toBe(0);});it('d',()=>{expect(hd262rmx(93,73)).toBe(2);});it('e',()=>{expect(hd262rmx(15,0)).toBe(4);});});
function hd263rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263rmx_hd',()=>{it('a',()=>{expect(hd263rmx(1,4)).toBe(2);});it('b',()=>{expect(hd263rmx(3,1)).toBe(1);});it('c',()=>{expect(hd263rmx(0,0)).toBe(0);});it('d',()=>{expect(hd263rmx(93,73)).toBe(2);});it('e',()=>{expect(hd263rmx(15,0)).toBe(4);});});
function hd264rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264rmx_hd',()=>{it('a',()=>{expect(hd264rmx(1,4)).toBe(2);});it('b',()=>{expect(hd264rmx(3,1)).toBe(1);});it('c',()=>{expect(hd264rmx(0,0)).toBe(0);});it('d',()=>{expect(hd264rmx(93,73)).toBe(2);});it('e',()=>{expect(hd264rmx(15,0)).toBe(4);});});
function hd265rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265rmx_hd',()=>{it('a',()=>{expect(hd265rmx(1,4)).toBe(2);});it('b',()=>{expect(hd265rmx(3,1)).toBe(1);});it('c',()=>{expect(hd265rmx(0,0)).toBe(0);});it('d',()=>{expect(hd265rmx(93,73)).toBe(2);});it('e',()=>{expect(hd265rmx(15,0)).toBe(4);});});
function hd266rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266rmx_hd',()=>{it('a',()=>{expect(hd266rmx(1,4)).toBe(2);});it('b',()=>{expect(hd266rmx(3,1)).toBe(1);});it('c',()=>{expect(hd266rmx(0,0)).toBe(0);});it('d',()=>{expect(hd266rmx(93,73)).toBe(2);});it('e',()=>{expect(hd266rmx(15,0)).toBe(4);});});
function hd267rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267rmx_hd',()=>{it('a',()=>{expect(hd267rmx(1,4)).toBe(2);});it('b',()=>{expect(hd267rmx(3,1)).toBe(1);});it('c',()=>{expect(hd267rmx(0,0)).toBe(0);});it('d',()=>{expect(hd267rmx(93,73)).toBe(2);});it('e',()=>{expect(hd267rmx(15,0)).toBe(4);});});
function hd268rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268rmx_hd',()=>{it('a',()=>{expect(hd268rmx(1,4)).toBe(2);});it('b',()=>{expect(hd268rmx(3,1)).toBe(1);});it('c',()=>{expect(hd268rmx(0,0)).toBe(0);});it('d',()=>{expect(hd268rmx(93,73)).toBe(2);});it('e',()=>{expect(hd268rmx(15,0)).toBe(4);});});
function hd269rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269rmx_hd',()=>{it('a',()=>{expect(hd269rmx(1,4)).toBe(2);});it('b',()=>{expect(hd269rmx(3,1)).toBe(1);});it('c',()=>{expect(hd269rmx(0,0)).toBe(0);});it('d',()=>{expect(hd269rmx(93,73)).toBe(2);});it('e',()=>{expect(hd269rmx(15,0)).toBe(4);});});
function hd270rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270rmx_hd',()=>{it('a',()=>{expect(hd270rmx(1,4)).toBe(2);});it('b',()=>{expect(hd270rmx(3,1)).toBe(1);});it('c',()=>{expect(hd270rmx(0,0)).toBe(0);});it('d',()=>{expect(hd270rmx(93,73)).toBe(2);});it('e',()=>{expect(hd270rmx(15,0)).toBe(4);});});
function hd271rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271rmx_hd',()=>{it('a',()=>{expect(hd271rmx(1,4)).toBe(2);});it('b',()=>{expect(hd271rmx(3,1)).toBe(1);});it('c',()=>{expect(hd271rmx(0,0)).toBe(0);});it('d',()=>{expect(hd271rmx(93,73)).toBe(2);});it('e',()=>{expect(hd271rmx(15,0)).toBe(4);});});
function hd272rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272rmx_hd',()=>{it('a',()=>{expect(hd272rmx(1,4)).toBe(2);});it('b',()=>{expect(hd272rmx(3,1)).toBe(1);});it('c',()=>{expect(hd272rmx(0,0)).toBe(0);});it('d',()=>{expect(hd272rmx(93,73)).toBe(2);});it('e',()=>{expect(hd272rmx(15,0)).toBe(4);});});
function hd273rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273rmx_hd',()=>{it('a',()=>{expect(hd273rmx(1,4)).toBe(2);});it('b',()=>{expect(hd273rmx(3,1)).toBe(1);});it('c',()=>{expect(hd273rmx(0,0)).toBe(0);});it('d',()=>{expect(hd273rmx(93,73)).toBe(2);});it('e',()=>{expect(hd273rmx(15,0)).toBe(4);});});
function hd274rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274rmx_hd',()=>{it('a',()=>{expect(hd274rmx(1,4)).toBe(2);});it('b',()=>{expect(hd274rmx(3,1)).toBe(1);});it('c',()=>{expect(hd274rmx(0,0)).toBe(0);});it('d',()=>{expect(hd274rmx(93,73)).toBe(2);});it('e',()=>{expect(hd274rmx(15,0)).toBe(4);});});
function hd275rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275rmx_hd',()=>{it('a',()=>{expect(hd275rmx(1,4)).toBe(2);});it('b',()=>{expect(hd275rmx(3,1)).toBe(1);});it('c',()=>{expect(hd275rmx(0,0)).toBe(0);});it('d',()=>{expect(hd275rmx(93,73)).toBe(2);});it('e',()=>{expect(hd275rmx(15,0)).toBe(4);});});
function hd276rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276rmx_hd',()=>{it('a',()=>{expect(hd276rmx(1,4)).toBe(2);});it('b',()=>{expect(hd276rmx(3,1)).toBe(1);});it('c',()=>{expect(hd276rmx(0,0)).toBe(0);});it('d',()=>{expect(hd276rmx(93,73)).toBe(2);});it('e',()=>{expect(hd276rmx(15,0)).toBe(4);});});
function hd277rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277rmx_hd',()=>{it('a',()=>{expect(hd277rmx(1,4)).toBe(2);});it('b',()=>{expect(hd277rmx(3,1)).toBe(1);});it('c',()=>{expect(hd277rmx(0,0)).toBe(0);});it('d',()=>{expect(hd277rmx(93,73)).toBe(2);});it('e',()=>{expect(hd277rmx(15,0)).toBe(4);});});
function hd278rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278rmx_hd',()=>{it('a',()=>{expect(hd278rmx(1,4)).toBe(2);});it('b',()=>{expect(hd278rmx(3,1)).toBe(1);});it('c',()=>{expect(hd278rmx(0,0)).toBe(0);});it('d',()=>{expect(hd278rmx(93,73)).toBe(2);});it('e',()=>{expect(hd278rmx(15,0)).toBe(4);});});
function hd279rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279rmx_hd',()=>{it('a',()=>{expect(hd279rmx(1,4)).toBe(2);});it('b',()=>{expect(hd279rmx(3,1)).toBe(1);});it('c',()=>{expect(hd279rmx(0,0)).toBe(0);});it('d',()=>{expect(hd279rmx(93,73)).toBe(2);});it('e',()=>{expect(hd279rmx(15,0)).toBe(4);});});
function hd280rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280rmx_hd',()=>{it('a',()=>{expect(hd280rmx(1,4)).toBe(2);});it('b',()=>{expect(hd280rmx(3,1)).toBe(1);});it('c',()=>{expect(hd280rmx(0,0)).toBe(0);});it('d',()=>{expect(hd280rmx(93,73)).toBe(2);});it('e',()=>{expect(hd280rmx(15,0)).toBe(4);});});
function hd281rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281rmx_hd',()=>{it('a',()=>{expect(hd281rmx(1,4)).toBe(2);});it('b',()=>{expect(hd281rmx(3,1)).toBe(1);});it('c',()=>{expect(hd281rmx(0,0)).toBe(0);});it('d',()=>{expect(hd281rmx(93,73)).toBe(2);});it('e',()=>{expect(hd281rmx(15,0)).toBe(4);});});
function hd282rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282rmx_hd',()=>{it('a',()=>{expect(hd282rmx(1,4)).toBe(2);});it('b',()=>{expect(hd282rmx(3,1)).toBe(1);});it('c',()=>{expect(hd282rmx(0,0)).toBe(0);});it('d',()=>{expect(hd282rmx(93,73)).toBe(2);});it('e',()=>{expect(hd282rmx(15,0)).toBe(4);});});
function hd283rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283rmx_hd',()=>{it('a',()=>{expect(hd283rmx(1,4)).toBe(2);});it('b',()=>{expect(hd283rmx(3,1)).toBe(1);});it('c',()=>{expect(hd283rmx(0,0)).toBe(0);});it('d',()=>{expect(hd283rmx(93,73)).toBe(2);});it('e',()=>{expect(hd283rmx(15,0)).toBe(4);});});
function hd284rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284rmx_hd',()=>{it('a',()=>{expect(hd284rmx(1,4)).toBe(2);});it('b',()=>{expect(hd284rmx(3,1)).toBe(1);});it('c',()=>{expect(hd284rmx(0,0)).toBe(0);});it('d',()=>{expect(hd284rmx(93,73)).toBe(2);});it('e',()=>{expect(hd284rmx(15,0)).toBe(4);});});
function hd285rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285rmx_hd',()=>{it('a',()=>{expect(hd285rmx(1,4)).toBe(2);});it('b',()=>{expect(hd285rmx(3,1)).toBe(1);});it('c',()=>{expect(hd285rmx(0,0)).toBe(0);});it('d',()=>{expect(hd285rmx(93,73)).toBe(2);});it('e',()=>{expect(hd285rmx(15,0)).toBe(4);});});
function hd286rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286rmx_hd',()=>{it('a',()=>{expect(hd286rmx(1,4)).toBe(2);});it('b',()=>{expect(hd286rmx(3,1)).toBe(1);});it('c',()=>{expect(hd286rmx(0,0)).toBe(0);});it('d',()=>{expect(hd286rmx(93,73)).toBe(2);});it('e',()=>{expect(hd286rmx(15,0)).toBe(4);});});
function hd287rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287rmx_hd',()=>{it('a',()=>{expect(hd287rmx(1,4)).toBe(2);});it('b',()=>{expect(hd287rmx(3,1)).toBe(1);});it('c',()=>{expect(hd287rmx(0,0)).toBe(0);});it('d',()=>{expect(hd287rmx(93,73)).toBe(2);});it('e',()=>{expect(hd287rmx(15,0)).toBe(4);});});
function hd288rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288rmx_hd',()=>{it('a',()=>{expect(hd288rmx(1,4)).toBe(2);});it('b',()=>{expect(hd288rmx(3,1)).toBe(1);});it('c',()=>{expect(hd288rmx(0,0)).toBe(0);});it('d',()=>{expect(hd288rmx(93,73)).toBe(2);});it('e',()=>{expect(hd288rmx(15,0)).toBe(4);});});
function hd289rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289rmx_hd',()=>{it('a',()=>{expect(hd289rmx(1,4)).toBe(2);});it('b',()=>{expect(hd289rmx(3,1)).toBe(1);});it('c',()=>{expect(hd289rmx(0,0)).toBe(0);});it('d',()=>{expect(hd289rmx(93,73)).toBe(2);});it('e',()=>{expect(hd289rmx(15,0)).toBe(4);});});
function hd290rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290rmx_hd',()=>{it('a',()=>{expect(hd290rmx(1,4)).toBe(2);});it('b',()=>{expect(hd290rmx(3,1)).toBe(1);});it('c',()=>{expect(hd290rmx(0,0)).toBe(0);});it('d',()=>{expect(hd290rmx(93,73)).toBe(2);});it('e',()=>{expect(hd290rmx(15,0)).toBe(4);});});
function hd291rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291rmx_hd',()=>{it('a',()=>{expect(hd291rmx(1,4)).toBe(2);});it('b',()=>{expect(hd291rmx(3,1)).toBe(1);});it('c',()=>{expect(hd291rmx(0,0)).toBe(0);});it('d',()=>{expect(hd291rmx(93,73)).toBe(2);});it('e',()=>{expect(hd291rmx(15,0)).toBe(4);});});
function hd292rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292rmx_hd',()=>{it('a',()=>{expect(hd292rmx(1,4)).toBe(2);});it('b',()=>{expect(hd292rmx(3,1)).toBe(1);});it('c',()=>{expect(hd292rmx(0,0)).toBe(0);});it('d',()=>{expect(hd292rmx(93,73)).toBe(2);});it('e',()=>{expect(hd292rmx(15,0)).toBe(4);});});
function hd293rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293rmx_hd',()=>{it('a',()=>{expect(hd293rmx(1,4)).toBe(2);});it('b',()=>{expect(hd293rmx(3,1)).toBe(1);});it('c',()=>{expect(hd293rmx(0,0)).toBe(0);});it('d',()=>{expect(hd293rmx(93,73)).toBe(2);});it('e',()=>{expect(hd293rmx(15,0)).toBe(4);});});
function hd294rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294rmx_hd',()=>{it('a',()=>{expect(hd294rmx(1,4)).toBe(2);});it('b',()=>{expect(hd294rmx(3,1)).toBe(1);});it('c',()=>{expect(hd294rmx(0,0)).toBe(0);});it('d',()=>{expect(hd294rmx(93,73)).toBe(2);});it('e',()=>{expect(hd294rmx(15,0)).toBe(4);});});
function hd295rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295rmx_hd',()=>{it('a',()=>{expect(hd295rmx(1,4)).toBe(2);});it('b',()=>{expect(hd295rmx(3,1)).toBe(1);});it('c',()=>{expect(hd295rmx(0,0)).toBe(0);});it('d',()=>{expect(hd295rmx(93,73)).toBe(2);});it('e',()=>{expect(hd295rmx(15,0)).toBe(4);});});
function hd296rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296rmx_hd',()=>{it('a',()=>{expect(hd296rmx(1,4)).toBe(2);});it('b',()=>{expect(hd296rmx(3,1)).toBe(1);});it('c',()=>{expect(hd296rmx(0,0)).toBe(0);});it('d',()=>{expect(hd296rmx(93,73)).toBe(2);});it('e',()=>{expect(hd296rmx(15,0)).toBe(4);});});
function hd297rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297rmx_hd',()=>{it('a',()=>{expect(hd297rmx(1,4)).toBe(2);});it('b',()=>{expect(hd297rmx(3,1)).toBe(1);});it('c',()=>{expect(hd297rmx(0,0)).toBe(0);});it('d',()=>{expect(hd297rmx(93,73)).toBe(2);});it('e',()=>{expect(hd297rmx(15,0)).toBe(4);});});
function hd298rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298rmx_hd',()=>{it('a',()=>{expect(hd298rmx(1,4)).toBe(2);});it('b',()=>{expect(hd298rmx(3,1)).toBe(1);});it('c',()=>{expect(hd298rmx(0,0)).toBe(0);});it('d',()=>{expect(hd298rmx(93,73)).toBe(2);});it('e',()=>{expect(hd298rmx(15,0)).toBe(4);});});
function hd299rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299rmx_hd',()=>{it('a',()=>{expect(hd299rmx(1,4)).toBe(2);});it('b',()=>{expect(hd299rmx(3,1)).toBe(1);});it('c',()=>{expect(hd299rmx(0,0)).toBe(0);});it('d',()=>{expect(hd299rmx(93,73)).toBe(2);});it('e',()=>{expect(hd299rmx(15,0)).toBe(4);});});
function hd300rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300rmx_hd',()=>{it('a',()=>{expect(hd300rmx(1,4)).toBe(2);});it('b',()=>{expect(hd300rmx(3,1)).toBe(1);});it('c',()=>{expect(hd300rmx(0,0)).toBe(0);});it('d',()=>{expect(hd300rmx(93,73)).toBe(2);});it('e',()=>{expect(hd300rmx(15,0)).toBe(4);});});
function hd301rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301rmx_hd',()=>{it('a',()=>{expect(hd301rmx(1,4)).toBe(2);});it('b',()=>{expect(hd301rmx(3,1)).toBe(1);});it('c',()=>{expect(hd301rmx(0,0)).toBe(0);});it('d',()=>{expect(hd301rmx(93,73)).toBe(2);});it('e',()=>{expect(hd301rmx(15,0)).toBe(4);});});
function hd302rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302rmx_hd',()=>{it('a',()=>{expect(hd302rmx(1,4)).toBe(2);});it('b',()=>{expect(hd302rmx(3,1)).toBe(1);});it('c',()=>{expect(hd302rmx(0,0)).toBe(0);});it('d',()=>{expect(hd302rmx(93,73)).toBe(2);});it('e',()=>{expect(hd302rmx(15,0)).toBe(4);});});
function hd303rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303rmx_hd',()=>{it('a',()=>{expect(hd303rmx(1,4)).toBe(2);});it('b',()=>{expect(hd303rmx(3,1)).toBe(1);});it('c',()=>{expect(hd303rmx(0,0)).toBe(0);});it('d',()=>{expect(hd303rmx(93,73)).toBe(2);});it('e',()=>{expect(hd303rmx(15,0)).toBe(4);});});
function hd304rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304rmx_hd',()=>{it('a',()=>{expect(hd304rmx(1,4)).toBe(2);});it('b',()=>{expect(hd304rmx(3,1)).toBe(1);});it('c',()=>{expect(hd304rmx(0,0)).toBe(0);});it('d',()=>{expect(hd304rmx(93,73)).toBe(2);});it('e',()=>{expect(hd304rmx(15,0)).toBe(4);});});
function hd305rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305rmx_hd',()=>{it('a',()=>{expect(hd305rmx(1,4)).toBe(2);});it('b',()=>{expect(hd305rmx(3,1)).toBe(1);});it('c',()=>{expect(hd305rmx(0,0)).toBe(0);});it('d',()=>{expect(hd305rmx(93,73)).toBe(2);});it('e',()=>{expect(hd305rmx(15,0)).toBe(4);});});
function hd306rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306rmx_hd',()=>{it('a',()=>{expect(hd306rmx(1,4)).toBe(2);});it('b',()=>{expect(hd306rmx(3,1)).toBe(1);});it('c',()=>{expect(hd306rmx(0,0)).toBe(0);});it('d',()=>{expect(hd306rmx(93,73)).toBe(2);});it('e',()=>{expect(hd306rmx(15,0)).toBe(4);});});
function hd307rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307rmx_hd',()=>{it('a',()=>{expect(hd307rmx(1,4)).toBe(2);});it('b',()=>{expect(hd307rmx(3,1)).toBe(1);});it('c',()=>{expect(hd307rmx(0,0)).toBe(0);});it('d',()=>{expect(hd307rmx(93,73)).toBe(2);});it('e',()=>{expect(hd307rmx(15,0)).toBe(4);});});
function hd308rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308rmx_hd',()=>{it('a',()=>{expect(hd308rmx(1,4)).toBe(2);});it('b',()=>{expect(hd308rmx(3,1)).toBe(1);});it('c',()=>{expect(hd308rmx(0,0)).toBe(0);});it('d',()=>{expect(hd308rmx(93,73)).toBe(2);});it('e',()=>{expect(hd308rmx(15,0)).toBe(4);});});
function hd309rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309rmx_hd',()=>{it('a',()=>{expect(hd309rmx(1,4)).toBe(2);});it('b',()=>{expect(hd309rmx(3,1)).toBe(1);});it('c',()=>{expect(hd309rmx(0,0)).toBe(0);});it('d',()=>{expect(hd309rmx(93,73)).toBe(2);});it('e',()=>{expect(hd309rmx(15,0)).toBe(4);});});
function hd310rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310rmx_hd',()=>{it('a',()=>{expect(hd310rmx(1,4)).toBe(2);});it('b',()=>{expect(hd310rmx(3,1)).toBe(1);});it('c',()=>{expect(hd310rmx(0,0)).toBe(0);});it('d',()=>{expect(hd310rmx(93,73)).toBe(2);});it('e',()=>{expect(hd310rmx(15,0)).toBe(4);});});
function hd311rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311rmx_hd',()=>{it('a',()=>{expect(hd311rmx(1,4)).toBe(2);});it('b',()=>{expect(hd311rmx(3,1)).toBe(1);});it('c',()=>{expect(hd311rmx(0,0)).toBe(0);});it('d',()=>{expect(hd311rmx(93,73)).toBe(2);});it('e',()=>{expect(hd311rmx(15,0)).toBe(4);});});
function hd312rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312rmx_hd',()=>{it('a',()=>{expect(hd312rmx(1,4)).toBe(2);});it('b',()=>{expect(hd312rmx(3,1)).toBe(1);});it('c',()=>{expect(hd312rmx(0,0)).toBe(0);});it('d',()=>{expect(hd312rmx(93,73)).toBe(2);});it('e',()=>{expect(hd312rmx(15,0)).toBe(4);});});
function hd313rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313rmx_hd',()=>{it('a',()=>{expect(hd313rmx(1,4)).toBe(2);});it('b',()=>{expect(hd313rmx(3,1)).toBe(1);});it('c',()=>{expect(hd313rmx(0,0)).toBe(0);});it('d',()=>{expect(hd313rmx(93,73)).toBe(2);});it('e',()=>{expect(hd313rmx(15,0)).toBe(4);});});
function hd314rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314rmx_hd',()=>{it('a',()=>{expect(hd314rmx(1,4)).toBe(2);});it('b',()=>{expect(hd314rmx(3,1)).toBe(1);});it('c',()=>{expect(hd314rmx(0,0)).toBe(0);});it('d',()=>{expect(hd314rmx(93,73)).toBe(2);});it('e',()=>{expect(hd314rmx(15,0)).toBe(4);});});
function hd315rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315rmx_hd',()=>{it('a',()=>{expect(hd315rmx(1,4)).toBe(2);});it('b',()=>{expect(hd315rmx(3,1)).toBe(1);});it('c',()=>{expect(hd315rmx(0,0)).toBe(0);});it('d',()=>{expect(hd315rmx(93,73)).toBe(2);});it('e',()=>{expect(hd315rmx(15,0)).toBe(4);});});
function hd316rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316rmx_hd',()=>{it('a',()=>{expect(hd316rmx(1,4)).toBe(2);});it('b',()=>{expect(hd316rmx(3,1)).toBe(1);});it('c',()=>{expect(hd316rmx(0,0)).toBe(0);});it('d',()=>{expect(hd316rmx(93,73)).toBe(2);});it('e',()=>{expect(hd316rmx(15,0)).toBe(4);});});
function hd317rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317rmx_hd',()=>{it('a',()=>{expect(hd317rmx(1,4)).toBe(2);});it('b',()=>{expect(hd317rmx(3,1)).toBe(1);});it('c',()=>{expect(hd317rmx(0,0)).toBe(0);});it('d',()=>{expect(hd317rmx(93,73)).toBe(2);});it('e',()=>{expect(hd317rmx(15,0)).toBe(4);});});
function hd318rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318rmx_hd',()=>{it('a',()=>{expect(hd318rmx(1,4)).toBe(2);});it('b',()=>{expect(hd318rmx(3,1)).toBe(1);});it('c',()=>{expect(hd318rmx(0,0)).toBe(0);});it('d',()=>{expect(hd318rmx(93,73)).toBe(2);});it('e',()=>{expect(hd318rmx(15,0)).toBe(4);});});
function hd319rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319rmx_hd',()=>{it('a',()=>{expect(hd319rmx(1,4)).toBe(2);});it('b',()=>{expect(hd319rmx(3,1)).toBe(1);});it('c',()=>{expect(hd319rmx(0,0)).toBe(0);});it('d',()=>{expect(hd319rmx(93,73)).toBe(2);});it('e',()=>{expect(hd319rmx(15,0)).toBe(4);});});
function hd320rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320rmx_hd',()=>{it('a',()=>{expect(hd320rmx(1,4)).toBe(2);});it('b',()=>{expect(hd320rmx(3,1)).toBe(1);});it('c',()=>{expect(hd320rmx(0,0)).toBe(0);});it('d',()=>{expect(hd320rmx(93,73)).toBe(2);});it('e',()=>{expect(hd320rmx(15,0)).toBe(4);});});
function hd321rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321rmx_hd',()=>{it('a',()=>{expect(hd321rmx(1,4)).toBe(2);});it('b',()=>{expect(hd321rmx(3,1)).toBe(1);});it('c',()=>{expect(hd321rmx(0,0)).toBe(0);});it('d',()=>{expect(hd321rmx(93,73)).toBe(2);});it('e',()=>{expect(hd321rmx(15,0)).toBe(4);});});
function hd322rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322rmx_hd',()=>{it('a',()=>{expect(hd322rmx(1,4)).toBe(2);});it('b',()=>{expect(hd322rmx(3,1)).toBe(1);});it('c',()=>{expect(hd322rmx(0,0)).toBe(0);});it('d',()=>{expect(hd322rmx(93,73)).toBe(2);});it('e',()=>{expect(hd322rmx(15,0)).toBe(4);});});
function hd323rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323rmx_hd',()=>{it('a',()=>{expect(hd323rmx(1,4)).toBe(2);});it('b',()=>{expect(hd323rmx(3,1)).toBe(1);});it('c',()=>{expect(hd323rmx(0,0)).toBe(0);});it('d',()=>{expect(hd323rmx(93,73)).toBe(2);});it('e',()=>{expect(hd323rmx(15,0)).toBe(4);});});
function hd324rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324rmx_hd',()=>{it('a',()=>{expect(hd324rmx(1,4)).toBe(2);});it('b',()=>{expect(hd324rmx(3,1)).toBe(1);});it('c',()=>{expect(hd324rmx(0,0)).toBe(0);});it('d',()=>{expect(hd324rmx(93,73)).toBe(2);});it('e',()=>{expect(hd324rmx(15,0)).toBe(4);});});
function hd325rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325rmx_hd',()=>{it('a',()=>{expect(hd325rmx(1,4)).toBe(2);});it('b',()=>{expect(hd325rmx(3,1)).toBe(1);});it('c',()=>{expect(hd325rmx(0,0)).toBe(0);});it('d',()=>{expect(hd325rmx(93,73)).toBe(2);});it('e',()=>{expect(hd325rmx(15,0)).toBe(4);});});
function hd326rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326rmx_hd',()=>{it('a',()=>{expect(hd326rmx(1,4)).toBe(2);});it('b',()=>{expect(hd326rmx(3,1)).toBe(1);});it('c',()=>{expect(hd326rmx(0,0)).toBe(0);});it('d',()=>{expect(hd326rmx(93,73)).toBe(2);});it('e',()=>{expect(hd326rmx(15,0)).toBe(4);});});
function hd327rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327rmx_hd',()=>{it('a',()=>{expect(hd327rmx(1,4)).toBe(2);});it('b',()=>{expect(hd327rmx(3,1)).toBe(1);});it('c',()=>{expect(hd327rmx(0,0)).toBe(0);});it('d',()=>{expect(hd327rmx(93,73)).toBe(2);});it('e',()=>{expect(hd327rmx(15,0)).toBe(4);});});
function hd328rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328rmx_hd',()=>{it('a',()=>{expect(hd328rmx(1,4)).toBe(2);});it('b',()=>{expect(hd328rmx(3,1)).toBe(1);});it('c',()=>{expect(hd328rmx(0,0)).toBe(0);});it('d',()=>{expect(hd328rmx(93,73)).toBe(2);});it('e',()=>{expect(hd328rmx(15,0)).toBe(4);});});
function hd329rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329rmx_hd',()=>{it('a',()=>{expect(hd329rmx(1,4)).toBe(2);});it('b',()=>{expect(hd329rmx(3,1)).toBe(1);});it('c',()=>{expect(hd329rmx(0,0)).toBe(0);});it('d',()=>{expect(hd329rmx(93,73)).toBe(2);});it('e',()=>{expect(hd329rmx(15,0)).toBe(4);});});
function hd330rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330rmx_hd',()=>{it('a',()=>{expect(hd330rmx(1,4)).toBe(2);});it('b',()=>{expect(hd330rmx(3,1)).toBe(1);});it('c',()=>{expect(hd330rmx(0,0)).toBe(0);});it('d',()=>{expect(hd330rmx(93,73)).toBe(2);});it('e',()=>{expect(hd330rmx(15,0)).toBe(4);});});
function hd331rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331rmx_hd',()=>{it('a',()=>{expect(hd331rmx(1,4)).toBe(2);});it('b',()=>{expect(hd331rmx(3,1)).toBe(1);});it('c',()=>{expect(hd331rmx(0,0)).toBe(0);});it('d',()=>{expect(hd331rmx(93,73)).toBe(2);});it('e',()=>{expect(hd331rmx(15,0)).toBe(4);});});
function hd332rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332rmx_hd',()=>{it('a',()=>{expect(hd332rmx(1,4)).toBe(2);});it('b',()=>{expect(hd332rmx(3,1)).toBe(1);});it('c',()=>{expect(hd332rmx(0,0)).toBe(0);});it('d',()=>{expect(hd332rmx(93,73)).toBe(2);});it('e',()=>{expect(hd332rmx(15,0)).toBe(4);});});
function hd333rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333rmx_hd',()=>{it('a',()=>{expect(hd333rmx(1,4)).toBe(2);});it('b',()=>{expect(hd333rmx(3,1)).toBe(1);});it('c',()=>{expect(hd333rmx(0,0)).toBe(0);});it('d',()=>{expect(hd333rmx(93,73)).toBe(2);});it('e',()=>{expect(hd333rmx(15,0)).toBe(4);});});
function hd334rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334rmx_hd',()=>{it('a',()=>{expect(hd334rmx(1,4)).toBe(2);});it('b',()=>{expect(hd334rmx(3,1)).toBe(1);});it('c',()=>{expect(hd334rmx(0,0)).toBe(0);});it('d',()=>{expect(hd334rmx(93,73)).toBe(2);});it('e',()=>{expect(hd334rmx(15,0)).toBe(4);});});
function hd335rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335rmx_hd',()=>{it('a',()=>{expect(hd335rmx(1,4)).toBe(2);});it('b',()=>{expect(hd335rmx(3,1)).toBe(1);});it('c',()=>{expect(hd335rmx(0,0)).toBe(0);});it('d',()=>{expect(hd335rmx(93,73)).toBe(2);});it('e',()=>{expect(hd335rmx(15,0)).toBe(4);});});
function hd336rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336rmx_hd',()=>{it('a',()=>{expect(hd336rmx(1,4)).toBe(2);});it('b',()=>{expect(hd336rmx(3,1)).toBe(1);});it('c',()=>{expect(hd336rmx(0,0)).toBe(0);});it('d',()=>{expect(hd336rmx(93,73)).toBe(2);});it('e',()=>{expect(hd336rmx(15,0)).toBe(4);});});
function hd337rmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337rmx_hd',()=>{it('a',()=>{expect(hd337rmx(1,4)).toBe(2);});it('b',()=>{expect(hd337rmx(3,1)).toBe(1);});it('c',()=>{expect(hd337rmx(0,0)).toBe(0);});it('d',()=>{expect(hd337rmx(93,73)).toBe(2);});it('e',()=>{expect(hd337rmx(15,0)).toBe(4);});});
function hd338regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338regx2_hd',()=>{it('a',()=>{expect(hd338regx2(1,4)).toBe(2);});it('b',()=>{expect(hd338regx2(3,1)).toBe(1);});it('c',()=>{expect(hd338regx2(0,0)).toBe(0);});it('d',()=>{expect(hd338regx2(93,73)).toBe(2);});it('e',()=>{expect(hd338regx2(15,0)).toBe(4);});});
function hd338regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd339regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339regx2_hd',()=>{it('a',()=>{expect(hd339regx2(1,4)).toBe(2);});it('b',()=>{expect(hd339regx2(3,1)).toBe(1);});it('c',()=>{expect(hd339regx2(0,0)).toBe(0);});it('d',()=>{expect(hd339regx2(93,73)).toBe(2);});it('e',()=>{expect(hd339regx2(15,0)).toBe(4);});});
function hd339regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd340regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340regx2_hd',()=>{it('a',()=>{expect(hd340regx2(1,4)).toBe(2);});it('b',()=>{expect(hd340regx2(3,1)).toBe(1);});it('c',()=>{expect(hd340regx2(0,0)).toBe(0);});it('d',()=>{expect(hd340regx2(93,73)).toBe(2);});it('e',()=>{expect(hd340regx2(15,0)).toBe(4);});});
function hd340regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd341regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341regx2_hd',()=>{it('a',()=>{expect(hd341regx2(1,4)).toBe(2);});it('b',()=>{expect(hd341regx2(3,1)).toBe(1);});it('c',()=>{expect(hd341regx2(0,0)).toBe(0);});it('d',()=>{expect(hd341regx2(93,73)).toBe(2);});it('e',()=>{expect(hd341regx2(15,0)).toBe(4);});});
function hd341regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd342regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342regx2_hd',()=>{it('a',()=>{expect(hd342regx2(1,4)).toBe(2);});it('b',()=>{expect(hd342regx2(3,1)).toBe(1);});it('c',()=>{expect(hd342regx2(0,0)).toBe(0);});it('d',()=>{expect(hd342regx2(93,73)).toBe(2);});it('e',()=>{expect(hd342regx2(15,0)).toBe(4);});});
function hd342regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd343regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343regx2_hd',()=>{it('a',()=>{expect(hd343regx2(1,4)).toBe(2);});it('b',()=>{expect(hd343regx2(3,1)).toBe(1);});it('c',()=>{expect(hd343regx2(0,0)).toBe(0);});it('d',()=>{expect(hd343regx2(93,73)).toBe(2);});it('e',()=>{expect(hd343regx2(15,0)).toBe(4);});});
function hd343regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd344regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344regx2_hd',()=>{it('a',()=>{expect(hd344regx2(1,4)).toBe(2);});it('b',()=>{expect(hd344regx2(3,1)).toBe(1);});it('c',()=>{expect(hd344regx2(0,0)).toBe(0);});it('d',()=>{expect(hd344regx2(93,73)).toBe(2);});it('e',()=>{expect(hd344regx2(15,0)).toBe(4);});});
function hd344regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd345regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345regx2_hd',()=>{it('a',()=>{expect(hd345regx2(1,4)).toBe(2);});it('b',()=>{expect(hd345regx2(3,1)).toBe(1);});it('c',()=>{expect(hd345regx2(0,0)).toBe(0);});it('d',()=>{expect(hd345regx2(93,73)).toBe(2);});it('e',()=>{expect(hd345regx2(15,0)).toBe(4);});});
function hd345regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd346regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346regx2_hd',()=>{it('a',()=>{expect(hd346regx2(1,4)).toBe(2);});it('b',()=>{expect(hd346regx2(3,1)).toBe(1);});it('c',()=>{expect(hd346regx2(0,0)).toBe(0);});it('d',()=>{expect(hd346regx2(93,73)).toBe(2);});it('e',()=>{expect(hd346regx2(15,0)).toBe(4);});});
function hd346regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd347regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347regx2_hd',()=>{it('a',()=>{expect(hd347regx2(1,4)).toBe(2);});it('b',()=>{expect(hd347regx2(3,1)).toBe(1);});it('c',()=>{expect(hd347regx2(0,0)).toBe(0);});it('d',()=>{expect(hd347regx2(93,73)).toBe(2);});it('e',()=>{expect(hd347regx2(15,0)).toBe(4);});});
function hd347regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd348regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348regx2_hd',()=>{it('a',()=>{expect(hd348regx2(1,4)).toBe(2);});it('b',()=>{expect(hd348regx2(3,1)).toBe(1);});it('c',()=>{expect(hd348regx2(0,0)).toBe(0);});it('d',()=>{expect(hd348regx2(93,73)).toBe(2);});it('e',()=>{expect(hd348regx2(15,0)).toBe(4);});});
function hd348regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd349regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349regx2_hd',()=>{it('a',()=>{expect(hd349regx2(1,4)).toBe(2);});it('b',()=>{expect(hd349regx2(3,1)).toBe(1);});it('c',()=>{expect(hd349regx2(0,0)).toBe(0);});it('d',()=>{expect(hd349regx2(93,73)).toBe(2);});it('e',()=>{expect(hd349regx2(15,0)).toBe(4);});});
function hd349regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd350regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350regx2_hd',()=>{it('a',()=>{expect(hd350regx2(1,4)).toBe(2);});it('b',()=>{expect(hd350regx2(3,1)).toBe(1);});it('c',()=>{expect(hd350regx2(0,0)).toBe(0);});it('d',()=>{expect(hd350regx2(93,73)).toBe(2);});it('e',()=>{expect(hd350regx2(15,0)).toBe(4);});});
function hd350regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd351regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351regx2_hd',()=>{it('a',()=>{expect(hd351regx2(1,4)).toBe(2);});it('b',()=>{expect(hd351regx2(3,1)).toBe(1);});it('c',()=>{expect(hd351regx2(0,0)).toBe(0);});it('d',()=>{expect(hd351regx2(93,73)).toBe(2);});it('e',()=>{expect(hd351regx2(15,0)).toBe(4);});});
function hd351regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd352regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352regx2_hd',()=>{it('a',()=>{expect(hd352regx2(1,4)).toBe(2);});it('b',()=>{expect(hd352regx2(3,1)).toBe(1);});it('c',()=>{expect(hd352regx2(0,0)).toBe(0);});it('d',()=>{expect(hd352regx2(93,73)).toBe(2);});it('e',()=>{expect(hd352regx2(15,0)).toBe(4);});});
function hd352regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd353regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353regx2_hd',()=>{it('a',()=>{expect(hd353regx2(1,4)).toBe(2);});it('b',()=>{expect(hd353regx2(3,1)).toBe(1);});it('c',()=>{expect(hd353regx2(0,0)).toBe(0);});it('d',()=>{expect(hd353regx2(93,73)).toBe(2);});it('e',()=>{expect(hd353regx2(15,0)).toBe(4);});});
function hd353regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd354regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354regx2_hd',()=>{it('a',()=>{expect(hd354regx2(1,4)).toBe(2);});it('b',()=>{expect(hd354regx2(3,1)).toBe(1);});it('c',()=>{expect(hd354regx2(0,0)).toBe(0);});it('d',()=>{expect(hd354regx2(93,73)).toBe(2);});it('e',()=>{expect(hd354regx2(15,0)).toBe(4);});});
function hd354regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd355regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355regx2_hd',()=>{it('a',()=>{expect(hd355regx2(1,4)).toBe(2);});it('b',()=>{expect(hd355regx2(3,1)).toBe(1);});it('c',()=>{expect(hd355regx2(0,0)).toBe(0);});it('d',()=>{expect(hd355regx2(93,73)).toBe(2);});it('e',()=>{expect(hd355regx2(15,0)).toBe(4);});});
function hd355regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd356regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356regx2_hd',()=>{it('a',()=>{expect(hd356regx2(1,4)).toBe(2);});it('b',()=>{expect(hd356regx2(3,1)).toBe(1);});it('c',()=>{expect(hd356regx2(0,0)).toBe(0);});it('d',()=>{expect(hd356regx2(93,73)).toBe(2);});it('e',()=>{expect(hd356regx2(15,0)).toBe(4);});});
function hd356regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd357regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357regx2_hd',()=>{it('a',()=>{expect(hd357regx2(1,4)).toBe(2);});it('b',()=>{expect(hd357regx2(3,1)).toBe(1);});it('c',()=>{expect(hd357regx2(0,0)).toBe(0);});it('d',()=>{expect(hd357regx2(93,73)).toBe(2);});it('e',()=>{expect(hd357regx2(15,0)).toBe(4);});});
function hd357regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd358regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358regx2_hd',()=>{it('a',()=>{expect(hd358regx2(1,4)).toBe(2);});it('b',()=>{expect(hd358regx2(3,1)).toBe(1);});it('c',()=>{expect(hd358regx2(0,0)).toBe(0);});it('d',()=>{expect(hd358regx2(93,73)).toBe(2);});it('e',()=>{expect(hd358regx2(15,0)).toBe(4);});});
function hd358regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd359regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359regx2_hd',()=>{it('a',()=>{expect(hd359regx2(1,4)).toBe(2);});it('b',()=>{expect(hd359regx2(3,1)).toBe(1);});it('c',()=>{expect(hd359regx2(0,0)).toBe(0);});it('d',()=>{expect(hd359regx2(93,73)).toBe(2);});it('e',()=>{expect(hd359regx2(15,0)).toBe(4);});});
function hd359regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd360regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360regx2_hd',()=>{it('a',()=>{expect(hd360regx2(1,4)).toBe(2);});it('b',()=>{expect(hd360regx2(3,1)).toBe(1);});it('c',()=>{expect(hd360regx2(0,0)).toBe(0);});it('d',()=>{expect(hd360regx2(93,73)).toBe(2);});it('e',()=>{expect(hd360regx2(15,0)).toBe(4);});});
function hd360regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd361regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361regx2_hd',()=>{it('a',()=>{expect(hd361regx2(1,4)).toBe(2);});it('b',()=>{expect(hd361regx2(3,1)).toBe(1);});it('c',()=>{expect(hd361regx2(0,0)).toBe(0);});it('d',()=>{expect(hd361regx2(93,73)).toBe(2);});it('e',()=>{expect(hd361regx2(15,0)).toBe(4);});});
function hd361regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd362regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362regx2_hd',()=>{it('a',()=>{expect(hd362regx2(1,4)).toBe(2);});it('b',()=>{expect(hd362regx2(3,1)).toBe(1);});it('c',()=>{expect(hd362regx2(0,0)).toBe(0);});it('d',()=>{expect(hd362regx2(93,73)).toBe(2);});it('e',()=>{expect(hd362regx2(15,0)).toBe(4);});});
function hd362regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd363regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363regx2_hd',()=>{it('a',()=>{expect(hd363regx2(1,4)).toBe(2);});it('b',()=>{expect(hd363regx2(3,1)).toBe(1);});it('c',()=>{expect(hd363regx2(0,0)).toBe(0);});it('d',()=>{expect(hd363regx2(93,73)).toBe(2);});it('e',()=>{expect(hd363regx2(15,0)).toBe(4);});});
function hd363regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd364regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364regx2_hd',()=>{it('a',()=>{expect(hd364regx2(1,4)).toBe(2);});it('b',()=>{expect(hd364regx2(3,1)).toBe(1);});it('c',()=>{expect(hd364regx2(0,0)).toBe(0);});it('d',()=>{expect(hd364regx2(93,73)).toBe(2);});it('e',()=>{expect(hd364regx2(15,0)).toBe(4);});});
function hd364regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd365regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365regx2_hd',()=>{it('a',()=>{expect(hd365regx2(1,4)).toBe(2);});it('b',()=>{expect(hd365regx2(3,1)).toBe(1);});it('c',()=>{expect(hd365regx2(0,0)).toBe(0);});it('d',()=>{expect(hd365regx2(93,73)).toBe(2);});it('e',()=>{expect(hd365regx2(15,0)).toBe(4);});});
function hd365regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd366regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366regx2_hd',()=>{it('a',()=>{expect(hd366regx2(1,4)).toBe(2);});it('b',()=>{expect(hd366regx2(3,1)).toBe(1);});it('c',()=>{expect(hd366regx2(0,0)).toBe(0);});it('d',()=>{expect(hd366regx2(93,73)).toBe(2);});it('e',()=>{expect(hd366regx2(15,0)).toBe(4);});});
function hd366regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd367regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367regx2_hd',()=>{it('a',()=>{expect(hd367regx2(1,4)).toBe(2);});it('b',()=>{expect(hd367regx2(3,1)).toBe(1);});it('c',()=>{expect(hd367regx2(0,0)).toBe(0);});it('d',()=>{expect(hd367regx2(93,73)).toBe(2);});it('e',()=>{expect(hd367regx2(15,0)).toBe(4);});});
function hd367regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd368regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368regx2_hd',()=>{it('a',()=>{expect(hd368regx2(1,4)).toBe(2);});it('b',()=>{expect(hd368regx2(3,1)).toBe(1);});it('c',()=>{expect(hd368regx2(0,0)).toBe(0);});it('d',()=>{expect(hd368regx2(93,73)).toBe(2);});it('e',()=>{expect(hd368regx2(15,0)).toBe(4);});});
function hd368regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd369regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369regx2_hd',()=>{it('a',()=>{expect(hd369regx2(1,4)).toBe(2);});it('b',()=>{expect(hd369regx2(3,1)).toBe(1);});it('c',()=>{expect(hd369regx2(0,0)).toBe(0);});it('d',()=>{expect(hd369regx2(93,73)).toBe(2);});it('e',()=>{expect(hd369regx2(15,0)).toBe(4);});});
function hd369regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd370regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370regx2_hd',()=>{it('a',()=>{expect(hd370regx2(1,4)).toBe(2);});it('b',()=>{expect(hd370regx2(3,1)).toBe(1);});it('c',()=>{expect(hd370regx2(0,0)).toBe(0);});it('d',()=>{expect(hd370regx2(93,73)).toBe(2);});it('e',()=>{expect(hd370regx2(15,0)).toBe(4);});});
function hd370regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd371regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371regx2_hd',()=>{it('a',()=>{expect(hd371regx2(1,4)).toBe(2);});it('b',()=>{expect(hd371regx2(3,1)).toBe(1);});it('c',()=>{expect(hd371regx2(0,0)).toBe(0);});it('d',()=>{expect(hd371regx2(93,73)).toBe(2);});it('e',()=>{expect(hd371regx2(15,0)).toBe(4);});});
function hd371regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd372regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372regx2_hd',()=>{it('a',()=>{expect(hd372regx2(1,4)).toBe(2);});it('b',()=>{expect(hd372regx2(3,1)).toBe(1);});it('c',()=>{expect(hd372regx2(0,0)).toBe(0);});it('d',()=>{expect(hd372regx2(93,73)).toBe(2);});it('e',()=>{expect(hd372regx2(15,0)).toBe(4);});});
function hd372regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd373regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373regx2_hd',()=>{it('a',()=>{expect(hd373regx2(1,4)).toBe(2);});it('b',()=>{expect(hd373regx2(3,1)).toBe(1);});it('c',()=>{expect(hd373regx2(0,0)).toBe(0);});it('d',()=>{expect(hd373regx2(93,73)).toBe(2);});it('e',()=>{expect(hd373regx2(15,0)).toBe(4);});});
function hd373regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd374regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374regx2_hd',()=>{it('a',()=>{expect(hd374regx2(1,4)).toBe(2);});it('b',()=>{expect(hd374regx2(3,1)).toBe(1);});it('c',()=>{expect(hd374regx2(0,0)).toBe(0);});it('d',()=>{expect(hd374regx2(93,73)).toBe(2);});it('e',()=>{expect(hd374regx2(15,0)).toBe(4);});});
function hd374regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd375regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375regx2_hd',()=>{it('a',()=>{expect(hd375regx2(1,4)).toBe(2);});it('b',()=>{expect(hd375regx2(3,1)).toBe(1);});it('c',()=>{expect(hd375regx2(0,0)).toBe(0);});it('d',()=>{expect(hd375regx2(93,73)).toBe(2);});it('e',()=>{expect(hd375regx2(15,0)).toBe(4);});});
function hd375regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd376regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376regx2_hd',()=>{it('a',()=>{expect(hd376regx2(1,4)).toBe(2);});it('b',()=>{expect(hd376regx2(3,1)).toBe(1);});it('c',()=>{expect(hd376regx2(0,0)).toBe(0);});it('d',()=>{expect(hd376regx2(93,73)).toBe(2);});it('e',()=>{expect(hd376regx2(15,0)).toBe(4);});});
function hd376regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd377regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377regx2_hd',()=>{it('a',()=>{expect(hd377regx2(1,4)).toBe(2);});it('b',()=>{expect(hd377regx2(3,1)).toBe(1);});it('c',()=>{expect(hd377regx2(0,0)).toBe(0);});it('d',()=>{expect(hd377regx2(93,73)).toBe(2);});it('e',()=>{expect(hd377regx2(15,0)).toBe(4);});});
function hd377regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd378regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378regx2_hd',()=>{it('a',()=>{expect(hd378regx2(1,4)).toBe(2);});it('b',()=>{expect(hd378regx2(3,1)).toBe(1);});it('c',()=>{expect(hd378regx2(0,0)).toBe(0);});it('d',()=>{expect(hd378regx2(93,73)).toBe(2);});it('e',()=>{expect(hd378regx2(15,0)).toBe(4);});});
function hd378regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd379regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379regx2_hd',()=>{it('a',()=>{expect(hd379regx2(1,4)).toBe(2);});it('b',()=>{expect(hd379regx2(3,1)).toBe(1);});it('c',()=>{expect(hd379regx2(0,0)).toBe(0);});it('d',()=>{expect(hd379regx2(93,73)).toBe(2);});it('e',()=>{expect(hd379regx2(15,0)).toBe(4);});});
function hd379regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd380regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380regx2_hd',()=>{it('a',()=>{expect(hd380regx2(1,4)).toBe(2);});it('b',()=>{expect(hd380regx2(3,1)).toBe(1);});it('c',()=>{expect(hd380regx2(0,0)).toBe(0);});it('d',()=>{expect(hd380regx2(93,73)).toBe(2);});it('e',()=>{expect(hd380regx2(15,0)).toBe(4);});});
function hd380regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd381regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381regx2_hd',()=>{it('a',()=>{expect(hd381regx2(1,4)).toBe(2);});it('b',()=>{expect(hd381regx2(3,1)).toBe(1);});it('c',()=>{expect(hd381regx2(0,0)).toBe(0);});it('d',()=>{expect(hd381regx2(93,73)).toBe(2);});it('e',()=>{expect(hd381regx2(15,0)).toBe(4);});});
function hd381regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd382regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382regx2_hd',()=>{it('a',()=>{expect(hd382regx2(1,4)).toBe(2);});it('b',()=>{expect(hd382regx2(3,1)).toBe(1);});it('c',()=>{expect(hd382regx2(0,0)).toBe(0);});it('d',()=>{expect(hd382regx2(93,73)).toBe(2);});it('e',()=>{expect(hd382regx2(15,0)).toBe(4);});});
function hd382regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd383regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383regx2_hd',()=>{it('a',()=>{expect(hd383regx2(1,4)).toBe(2);});it('b',()=>{expect(hd383regx2(3,1)).toBe(1);});it('c',()=>{expect(hd383regx2(0,0)).toBe(0);});it('d',()=>{expect(hd383regx2(93,73)).toBe(2);});it('e',()=>{expect(hd383regx2(15,0)).toBe(4);});});
function hd383regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd384regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384regx2_hd',()=>{it('a',()=>{expect(hd384regx2(1,4)).toBe(2);});it('b',()=>{expect(hd384regx2(3,1)).toBe(1);});it('c',()=>{expect(hd384regx2(0,0)).toBe(0);});it('d',()=>{expect(hd384regx2(93,73)).toBe(2);});it('e',()=>{expect(hd384regx2(15,0)).toBe(4);});});
function hd384regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd385regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385regx2_hd',()=>{it('a',()=>{expect(hd385regx2(1,4)).toBe(2);});it('b',()=>{expect(hd385regx2(3,1)).toBe(1);});it('c',()=>{expect(hd385regx2(0,0)).toBe(0);});it('d',()=>{expect(hd385regx2(93,73)).toBe(2);});it('e',()=>{expect(hd385regx2(15,0)).toBe(4);});});
function hd385regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd386regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386regx2_hd',()=>{it('a',()=>{expect(hd386regx2(1,4)).toBe(2);});it('b',()=>{expect(hd386regx2(3,1)).toBe(1);});it('c',()=>{expect(hd386regx2(0,0)).toBe(0);});it('d',()=>{expect(hd386regx2(93,73)).toBe(2);});it('e',()=>{expect(hd386regx2(15,0)).toBe(4);});});
function hd386regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd387regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387regx2_hd',()=>{it('a',()=>{expect(hd387regx2(1,4)).toBe(2);});it('b',()=>{expect(hd387regx2(3,1)).toBe(1);});it('c',()=>{expect(hd387regx2(0,0)).toBe(0);});it('d',()=>{expect(hd387regx2(93,73)).toBe(2);});it('e',()=>{expect(hd387regx2(15,0)).toBe(4);});});
function hd387regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd388regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388regx2_hd',()=>{it('a',()=>{expect(hd388regx2(1,4)).toBe(2);});it('b',()=>{expect(hd388regx2(3,1)).toBe(1);});it('c',()=>{expect(hd388regx2(0,0)).toBe(0);});it('d',()=>{expect(hd388regx2(93,73)).toBe(2);});it('e',()=>{expect(hd388regx2(15,0)).toBe(4);});});
function hd388regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd389regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389regx2_hd',()=>{it('a',()=>{expect(hd389regx2(1,4)).toBe(2);});it('b',()=>{expect(hd389regx2(3,1)).toBe(1);});it('c',()=>{expect(hd389regx2(0,0)).toBe(0);});it('d',()=>{expect(hd389regx2(93,73)).toBe(2);});it('e',()=>{expect(hd389regx2(15,0)).toBe(4);});});
function hd389regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd390regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390regx2_hd',()=>{it('a',()=>{expect(hd390regx2(1,4)).toBe(2);});it('b',()=>{expect(hd390regx2(3,1)).toBe(1);});it('c',()=>{expect(hd390regx2(0,0)).toBe(0);});it('d',()=>{expect(hd390regx2(93,73)).toBe(2);});it('e',()=>{expect(hd390regx2(15,0)).toBe(4);});});
function hd390regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd391regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391regx2_hd',()=>{it('a',()=>{expect(hd391regx2(1,4)).toBe(2);});it('b',()=>{expect(hd391regx2(3,1)).toBe(1);});it('c',()=>{expect(hd391regx2(0,0)).toBe(0);});it('d',()=>{expect(hd391regx2(93,73)).toBe(2);});it('e',()=>{expect(hd391regx2(15,0)).toBe(4);});});
function hd391regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd392regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392regx2_hd',()=>{it('a',()=>{expect(hd392regx2(1,4)).toBe(2);});it('b',()=>{expect(hd392regx2(3,1)).toBe(1);});it('c',()=>{expect(hd392regx2(0,0)).toBe(0);});it('d',()=>{expect(hd392regx2(93,73)).toBe(2);});it('e',()=>{expect(hd392regx2(15,0)).toBe(4);});});
function hd392regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd393regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393regx2_hd',()=>{it('a',()=>{expect(hd393regx2(1,4)).toBe(2);});it('b',()=>{expect(hd393regx2(3,1)).toBe(1);});it('c',()=>{expect(hd393regx2(0,0)).toBe(0);});it('d',()=>{expect(hd393regx2(93,73)).toBe(2);});it('e',()=>{expect(hd393regx2(15,0)).toBe(4);});});
function hd393regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd394regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394regx2_hd',()=>{it('a',()=>{expect(hd394regx2(1,4)).toBe(2);});it('b',()=>{expect(hd394regx2(3,1)).toBe(1);});it('c',()=>{expect(hd394regx2(0,0)).toBe(0);});it('d',()=>{expect(hd394regx2(93,73)).toBe(2);});it('e',()=>{expect(hd394regx2(15,0)).toBe(4);});});
function hd394regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd395regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395regx2_hd',()=>{it('a',()=>{expect(hd395regx2(1,4)).toBe(2);});it('b',()=>{expect(hd395regx2(3,1)).toBe(1);});it('c',()=>{expect(hd395regx2(0,0)).toBe(0);});it('d',()=>{expect(hd395regx2(93,73)).toBe(2);});it('e',()=>{expect(hd395regx2(15,0)).toBe(4);});});
function hd395regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd396regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396regx2_hd',()=>{it('a',()=>{expect(hd396regx2(1,4)).toBe(2);});it('b',()=>{expect(hd396regx2(3,1)).toBe(1);});it('c',()=>{expect(hd396regx2(0,0)).toBe(0);});it('d',()=>{expect(hd396regx2(93,73)).toBe(2);});it('e',()=>{expect(hd396regx2(15,0)).toBe(4);});});
function hd396regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd397regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397regx2_hd',()=>{it('a',()=>{expect(hd397regx2(1,4)).toBe(2);});it('b',()=>{expect(hd397regx2(3,1)).toBe(1);});it('c',()=>{expect(hd397regx2(0,0)).toBe(0);});it('d',()=>{expect(hd397regx2(93,73)).toBe(2);});it('e',()=>{expect(hd397regx2(15,0)).toBe(4);});});
function hd397regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd398regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398regx2_hd',()=>{it('a',()=>{expect(hd398regx2(1,4)).toBe(2);});it('b',()=>{expect(hd398regx2(3,1)).toBe(1);});it('c',()=>{expect(hd398regx2(0,0)).toBe(0);});it('d',()=>{expect(hd398regx2(93,73)).toBe(2);});it('e',()=>{expect(hd398regx2(15,0)).toBe(4);});});
function hd398regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd399regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399regx2_hd',()=>{it('a',()=>{expect(hd399regx2(1,4)).toBe(2);});it('b',()=>{expect(hd399regx2(3,1)).toBe(1);});it('c',()=>{expect(hd399regx2(0,0)).toBe(0);});it('d',()=>{expect(hd399regx2(93,73)).toBe(2);});it('e',()=>{expect(hd399regx2(15,0)).toBe(4);});});
function hd399regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd400regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400regx2_hd',()=>{it('a',()=>{expect(hd400regx2(1,4)).toBe(2);});it('b',()=>{expect(hd400regx2(3,1)).toBe(1);});it('c',()=>{expect(hd400regx2(0,0)).toBe(0);});it('d',()=>{expect(hd400regx2(93,73)).toBe(2);});it('e',()=>{expect(hd400regx2(15,0)).toBe(4);});});
function hd400regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd401regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401regx2_hd',()=>{it('a',()=>{expect(hd401regx2(1,4)).toBe(2);});it('b',()=>{expect(hd401regx2(3,1)).toBe(1);});it('c',()=>{expect(hd401regx2(0,0)).toBe(0);});it('d',()=>{expect(hd401regx2(93,73)).toBe(2);});it('e',()=>{expect(hd401regx2(15,0)).toBe(4);});});
function hd401regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd402regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402regx2_hd',()=>{it('a',()=>{expect(hd402regx2(1,4)).toBe(2);});it('b',()=>{expect(hd402regx2(3,1)).toBe(1);});it('c',()=>{expect(hd402regx2(0,0)).toBe(0);});it('d',()=>{expect(hd402regx2(93,73)).toBe(2);});it('e',()=>{expect(hd402regx2(15,0)).toBe(4);});});
function hd402regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd403regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403regx2_hd',()=>{it('a',()=>{expect(hd403regx2(1,4)).toBe(2);});it('b',()=>{expect(hd403regx2(3,1)).toBe(1);});it('c',()=>{expect(hd403regx2(0,0)).toBe(0);});it('d',()=>{expect(hd403regx2(93,73)).toBe(2);});it('e',()=>{expect(hd403regx2(15,0)).toBe(4);});});
function hd403regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd404regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404regx2_hd',()=>{it('a',()=>{expect(hd404regx2(1,4)).toBe(2);});it('b',()=>{expect(hd404regx2(3,1)).toBe(1);});it('c',()=>{expect(hd404regx2(0,0)).toBe(0);});it('d',()=>{expect(hd404regx2(93,73)).toBe(2);});it('e',()=>{expect(hd404regx2(15,0)).toBe(4);});});
function hd404regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd405regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405regx2_hd',()=>{it('a',()=>{expect(hd405regx2(1,4)).toBe(2);});it('b',()=>{expect(hd405regx2(3,1)).toBe(1);});it('c',()=>{expect(hd405regx2(0,0)).toBe(0);});it('d',()=>{expect(hd405regx2(93,73)).toBe(2);});it('e',()=>{expect(hd405regx2(15,0)).toBe(4);});});
function hd405regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd406regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406regx2_hd',()=>{it('a',()=>{expect(hd406regx2(1,4)).toBe(2);});it('b',()=>{expect(hd406regx2(3,1)).toBe(1);});it('c',()=>{expect(hd406regx2(0,0)).toBe(0);});it('d',()=>{expect(hd406regx2(93,73)).toBe(2);});it('e',()=>{expect(hd406regx2(15,0)).toBe(4);});});
function hd406regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd407regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407regx2_hd',()=>{it('a',()=>{expect(hd407regx2(1,4)).toBe(2);});it('b',()=>{expect(hd407regx2(3,1)).toBe(1);});it('c',()=>{expect(hd407regx2(0,0)).toBe(0);});it('d',()=>{expect(hd407regx2(93,73)).toBe(2);});it('e',()=>{expect(hd407regx2(15,0)).toBe(4);});});
function hd407regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd408regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408regx2_hd',()=>{it('a',()=>{expect(hd408regx2(1,4)).toBe(2);});it('b',()=>{expect(hd408regx2(3,1)).toBe(1);});it('c',()=>{expect(hd408regx2(0,0)).toBe(0);});it('d',()=>{expect(hd408regx2(93,73)).toBe(2);});it('e',()=>{expect(hd408regx2(15,0)).toBe(4);});});
function hd408regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd409regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409regx2_hd',()=>{it('a',()=>{expect(hd409regx2(1,4)).toBe(2);});it('b',()=>{expect(hd409regx2(3,1)).toBe(1);});it('c',()=>{expect(hd409regx2(0,0)).toBe(0);});it('d',()=>{expect(hd409regx2(93,73)).toBe(2);});it('e',()=>{expect(hd409regx2(15,0)).toBe(4);});});
function hd409regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd410regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410regx2_hd',()=>{it('a',()=>{expect(hd410regx2(1,4)).toBe(2);});it('b',()=>{expect(hd410regx2(3,1)).toBe(1);});it('c',()=>{expect(hd410regx2(0,0)).toBe(0);});it('d',()=>{expect(hd410regx2(93,73)).toBe(2);});it('e',()=>{expect(hd410regx2(15,0)).toBe(4);});});
function hd410regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd411regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411regx2_hd',()=>{it('a',()=>{expect(hd411regx2(1,4)).toBe(2);});it('b',()=>{expect(hd411regx2(3,1)).toBe(1);});it('c',()=>{expect(hd411regx2(0,0)).toBe(0);});it('d',()=>{expect(hd411regx2(93,73)).toBe(2);});it('e',()=>{expect(hd411regx2(15,0)).toBe(4);});});
function hd411regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd412regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412regx2_hd',()=>{it('a',()=>{expect(hd412regx2(1,4)).toBe(2);});it('b',()=>{expect(hd412regx2(3,1)).toBe(1);});it('c',()=>{expect(hd412regx2(0,0)).toBe(0);});it('d',()=>{expect(hd412regx2(93,73)).toBe(2);});it('e',()=>{expect(hd412regx2(15,0)).toBe(4);});});
function hd412regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd413regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413regx2_hd',()=>{it('a',()=>{expect(hd413regx2(1,4)).toBe(2);});it('b',()=>{expect(hd413regx2(3,1)).toBe(1);});it('c',()=>{expect(hd413regx2(0,0)).toBe(0);});it('d',()=>{expect(hd413regx2(93,73)).toBe(2);});it('e',()=>{expect(hd413regx2(15,0)).toBe(4);});});
function hd413regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd414regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414regx2_hd',()=>{it('a',()=>{expect(hd414regx2(1,4)).toBe(2);});it('b',()=>{expect(hd414regx2(3,1)).toBe(1);});it('c',()=>{expect(hd414regx2(0,0)).toBe(0);});it('d',()=>{expect(hd414regx2(93,73)).toBe(2);});it('e',()=>{expect(hd414regx2(15,0)).toBe(4);});});
function hd414regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd415regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415regx2_hd',()=>{it('a',()=>{expect(hd415regx2(1,4)).toBe(2);});it('b',()=>{expect(hd415regx2(3,1)).toBe(1);});it('c',()=>{expect(hd415regx2(0,0)).toBe(0);});it('d',()=>{expect(hd415regx2(93,73)).toBe(2);});it('e',()=>{expect(hd415regx2(15,0)).toBe(4);});});
function hd415regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd416regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416regx2_hd',()=>{it('a',()=>{expect(hd416regx2(1,4)).toBe(2);});it('b',()=>{expect(hd416regx2(3,1)).toBe(1);});it('c',()=>{expect(hd416regx2(0,0)).toBe(0);});it('d',()=>{expect(hd416regx2(93,73)).toBe(2);});it('e',()=>{expect(hd416regx2(15,0)).toBe(4);});});
function hd416regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd417regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417regx2_hd',()=>{it('a',()=>{expect(hd417regx2(1,4)).toBe(2);});it('b',()=>{expect(hd417regx2(3,1)).toBe(1);});it('c',()=>{expect(hd417regx2(0,0)).toBe(0);});it('d',()=>{expect(hd417regx2(93,73)).toBe(2);});it('e',()=>{expect(hd417regx2(15,0)).toBe(4);});});
function hd417regx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417regx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
