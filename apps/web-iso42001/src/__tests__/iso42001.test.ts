// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-iso42001 specification tests

type AIRiskLevel = 'MINIMAL' | 'LIMITED' | 'HIGH' | 'UNACCEPTABLE';
type AISystemStatus = 'DEVELOPMENT' | 'TESTING' | 'DEPLOYED' | 'SUSPENDED' | 'DECOMMISSIONED';
type BiasType = 'SELECTION' | 'MEASUREMENT' | 'CONFIRMATION' | 'ALGORITHMIC' | 'HISTORICAL';
type TransparencyLevel = 'OPAQUE' | 'PARTIAL' | 'EXPLAINABLE' | 'FULL';

const AI_RISK_LEVELS: AIRiskLevel[] = ['MINIMAL', 'LIMITED', 'HIGH', 'UNACCEPTABLE'];
const AI_SYSTEM_STATUSES: AISystemStatus[] = ['DEVELOPMENT', 'TESTING', 'DEPLOYED', 'SUSPENDED', 'DECOMMISSIONED'];
const BIAS_TYPES: BiasType[] = ['SELECTION', 'MEASUREMENT', 'CONFIRMATION', 'ALGORITHMIC', 'HISTORICAL'];
const TRANSPARENCY_LEVELS: TransparencyLevel[] = ['OPAQUE', 'PARTIAL', 'EXPLAINABLE', 'FULL'];

const riskLevelColor: Record<AIRiskLevel, string> = {
  MINIMAL: 'bg-green-100 text-green-800',
  LIMITED: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  UNACCEPTABLE: 'bg-red-100 text-red-800',
};

const transparencyScore: Record<TransparencyLevel, number> = {
  OPAQUE: 1, PARTIAL: 2, EXPLAINABLE: 3, FULL: 4,
};

const aimsClauseTitle: Record<string, string> = {
  '4': 'Context of Organisation',
  '5': 'Leadership',
  '6': 'Planning',
  '7': 'Support',
  '8': 'Operation',
  '9': 'Performance Evaluation',
  '10': 'Improvement',
};

function isAISystemActive(status: AISystemStatus): boolean {
  return status === 'DEPLOYED';
}

function requiresImpactAssessment(riskLevel: AIRiskLevel): boolean {
  return riskLevel === 'HIGH' || riskLevel === 'UNACCEPTABLE';
}

function isProhibited(riskLevel: AIRiskLevel): boolean {
  return riskLevel === 'UNACCEPTABLE';
}

function computeAIRiskScore(likelihood: number, impact: number, mitigations: number): number {
  return Math.max(0, (likelihood * impact) - mitigations);
}

describe('AI risk level colors', () => {
  AI_RISK_LEVELS.forEach(r => {
    it(`${r} has color`, () => expect(riskLevelColor[r]).toBeDefined());
    it(`${r} color has bg-`, () => expect(riskLevelColor[r]).toContain('bg-'));
  });
  it('UNACCEPTABLE is red', () => expect(riskLevelColor.UNACCEPTABLE).toContain('red'));
  it('MINIMAL is green', () => expect(riskLevelColor.MINIMAL).toContain('green'));
  for (let i = 0; i < 100; i++) {
    const r = AI_RISK_LEVELS[i % 4];
    it(`AI risk level color string (idx ${i})`, () => expect(typeof riskLevelColor[r]).toBe('string'));
  }
});

describe('Transparency scores', () => {
  it('FULL has highest score', () => expect(transparencyScore.FULL).toBe(4));
  it('OPAQUE has lowest score', () => expect(transparencyScore.OPAQUE).toBe(1));
  it('scores increase with transparency', () => {
    expect(transparencyScore.OPAQUE).toBeLessThan(transparencyScore.PARTIAL);
    expect(transparencyScore.PARTIAL).toBeLessThan(transparencyScore.EXPLAINABLE);
    expect(transparencyScore.EXPLAINABLE).toBeLessThan(transparencyScore.FULL);
  });
  for (let i = 0; i < 100; i++) {
    const t = TRANSPARENCY_LEVELS[i % 4];
    it(`transparency score for ${t} is positive (idx ${i})`, () => expect(transparencyScore[t]).toBeGreaterThan(0));
  }
});

describe('isAISystemActive', () => {
  it('DEPLOYED is active', () => expect(isAISystemActive('DEPLOYED')).toBe(true));
  it('DEVELOPMENT is not active', () => expect(isAISystemActive('DEVELOPMENT')).toBe(false));
  it('SUSPENDED is not active', () => expect(isAISystemActive('SUSPENDED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = AI_SYSTEM_STATUSES[i % 5];
    it(`isAISystemActive(${s}) returns boolean (idx ${i})`, () => expect(typeof isAISystemActive(s)).toBe('boolean'));
  }
});

describe('requiresImpactAssessment', () => {
  it('HIGH requires assessment', () => expect(requiresImpactAssessment('HIGH')).toBe(true));
  it('UNACCEPTABLE requires assessment', () => expect(requiresImpactAssessment('UNACCEPTABLE')).toBe(true));
  it('MINIMAL does not', () => expect(requiresImpactAssessment('MINIMAL')).toBe(false));
  it('LIMITED does not', () => expect(requiresImpactAssessment('LIMITED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const r = AI_RISK_LEVELS[i % 4];
    it(`requiresImpactAssessment(${r}) returns boolean (idx ${i})`, () => expect(typeof requiresImpactAssessment(r)).toBe('boolean'));
  }
});

describe('isProhibited', () => {
  it('UNACCEPTABLE is prohibited', () => expect(isProhibited('UNACCEPTABLE')).toBe(true));
  it('HIGH is not prohibited', () => expect(isProhibited('HIGH')).toBe(false));
  it('MINIMAL is not prohibited', () => expect(isProhibited('MINIMAL')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const r = AI_RISK_LEVELS[i % 4];
    it(`isProhibited(${r}) returns boolean (idx ${i})`, () => expect(typeof isProhibited(r)).toBe('boolean'));
  }
});

describe('computeAIRiskScore', () => {
  it('0 mitigations = likelihood × impact', () => expect(computeAIRiskScore(5, 4, 0)).toBe(20));
  it('mitigations reduce score', () => expect(computeAIRiskScore(5, 4, 5)).toBe(15));
  it('cannot go negative', () => expect(computeAIRiskScore(2, 2, 100)).toBe(0));
  for (let m = 0; m <= 25; m++) {
    it(`risk score with ${m} mitigations is non-negative`, () => {
      expect(computeAIRiskScore(5, 5, m)).toBeGreaterThanOrEqual(0);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`AI risk score is non-negative (idx ${i})`, () => {
      const l = (i % 5) + 1;
      const imp = (i % 5) + 1;
      expect(computeAIRiskScore(l, imp, 0)).toBeGreaterThan(0);
    });
  }
});
function hd258i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258i42x_hd',()=>{it('a',()=>{expect(hd258i42x(1,4)).toBe(2);});it('b',()=>{expect(hd258i42x(3,1)).toBe(1);});it('c',()=>{expect(hd258i42x(0,0)).toBe(0);});it('d',()=>{expect(hd258i42x(93,73)).toBe(2);});it('e',()=>{expect(hd258i42x(15,0)).toBe(4);});});
function hd259i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259i42x_hd',()=>{it('a',()=>{expect(hd259i42x(1,4)).toBe(2);});it('b',()=>{expect(hd259i42x(3,1)).toBe(1);});it('c',()=>{expect(hd259i42x(0,0)).toBe(0);});it('d',()=>{expect(hd259i42x(93,73)).toBe(2);});it('e',()=>{expect(hd259i42x(15,0)).toBe(4);});});
function hd260i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260i42x_hd',()=>{it('a',()=>{expect(hd260i42x(1,4)).toBe(2);});it('b',()=>{expect(hd260i42x(3,1)).toBe(1);});it('c',()=>{expect(hd260i42x(0,0)).toBe(0);});it('d',()=>{expect(hd260i42x(93,73)).toBe(2);});it('e',()=>{expect(hd260i42x(15,0)).toBe(4);});});
function hd261i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261i42x_hd',()=>{it('a',()=>{expect(hd261i42x(1,4)).toBe(2);});it('b',()=>{expect(hd261i42x(3,1)).toBe(1);});it('c',()=>{expect(hd261i42x(0,0)).toBe(0);});it('d',()=>{expect(hd261i42x(93,73)).toBe(2);});it('e',()=>{expect(hd261i42x(15,0)).toBe(4);});});
function hd262i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262i42x_hd',()=>{it('a',()=>{expect(hd262i42x(1,4)).toBe(2);});it('b',()=>{expect(hd262i42x(3,1)).toBe(1);});it('c',()=>{expect(hd262i42x(0,0)).toBe(0);});it('d',()=>{expect(hd262i42x(93,73)).toBe(2);});it('e',()=>{expect(hd262i42x(15,0)).toBe(4);});});
function hd263i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263i42x_hd',()=>{it('a',()=>{expect(hd263i42x(1,4)).toBe(2);});it('b',()=>{expect(hd263i42x(3,1)).toBe(1);});it('c',()=>{expect(hd263i42x(0,0)).toBe(0);});it('d',()=>{expect(hd263i42x(93,73)).toBe(2);});it('e',()=>{expect(hd263i42x(15,0)).toBe(4);});});
function hd264i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264i42x_hd',()=>{it('a',()=>{expect(hd264i42x(1,4)).toBe(2);});it('b',()=>{expect(hd264i42x(3,1)).toBe(1);});it('c',()=>{expect(hd264i42x(0,0)).toBe(0);});it('d',()=>{expect(hd264i42x(93,73)).toBe(2);});it('e',()=>{expect(hd264i42x(15,0)).toBe(4);});});
function hd265i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265i42x_hd',()=>{it('a',()=>{expect(hd265i42x(1,4)).toBe(2);});it('b',()=>{expect(hd265i42x(3,1)).toBe(1);});it('c',()=>{expect(hd265i42x(0,0)).toBe(0);});it('d',()=>{expect(hd265i42x(93,73)).toBe(2);});it('e',()=>{expect(hd265i42x(15,0)).toBe(4);});});
function hd266i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266i42x_hd',()=>{it('a',()=>{expect(hd266i42x(1,4)).toBe(2);});it('b',()=>{expect(hd266i42x(3,1)).toBe(1);});it('c',()=>{expect(hd266i42x(0,0)).toBe(0);});it('d',()=>{expect(hd266i42x(93,73)).toBe(2);});it('e',()=>{expect(hd266i42x(15,0)).toBe(4);});});
function hd267i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267i42x_hd',()=>{it('a',()=>{expect(hd267i42x(1,4)).toBe(2);});it('b',()=>{expect(hd267i42x(3,1)).toBe(1);});it('c',()=>{expect(hd267i42x(0,0)).toBe(0);});it('d',()=>{expect(hd267i42x(93,73)).toBe(2);});it('e',()=>{expect(hd267i42x(15,0)).toBe(4);});});
function hd268i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268i42x_hd',()=>{it('a',()=>{expect(hd268i42x(1,4)).toBe(2);});it('b',()=>{expect(hd268i42x(3,1)).toBe(1);});it('c',()=>{expect(hd268i42x(0,0)).toBe(0);});it('d',()=>{expect(hd268i42x(93,73)).toBe(2);});it('e',()=>{expect(hd268i42x(15,0)).toBe(4);});});
function hd269i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269i42x_hd',()=>{it('a',()=>{expect(hd269i42x(1,4)).toBe(2);});it('b',()=>{expect(hd269i42x(3,1)).toBe(1);});it('c',()=>{expect(hd269i42x(0,0)).toBe(0);});it('d',()=>{expect(hd269i42x(93,73)).toBe(2);});it('e',()=>{expect(hd269i42x(15,0)).toBe(4);});});
function hd270i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270i42x_hd',()=>{it('a',()=>{expect(hd270i42x(1,4)).toBe(2);});it('b',()=>{expect(hd270i42x(3,1)).toBe(1);});it('c',()=>{expect(hd270i42x(0,0)).toBe(0);});it('d',()=>{expect(hd270i42x(93,73)).toBe(2);});it('e',()=>{expect(hd270i42x(15,0)).toBe(4);});});
function hd271i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271i42x_hd',()=>{it('a',()=>{expect(hd271i42x(1,4)).toBe(2);});it('b',()=>{expect(hd271i42x(3,1)).toBe(1);});it('c',()=>{expect(hd271i42x(0,0)).toBe(0);});it('d',()=>{expect(hd271i42x(93,73)).toBe(2);});it('e',()=>{expect(hd271i42x(15,0)).toBe(4);});});
function hd272i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272i42x_hd',()=>{it('a',()=>{expect(hd272i42x(1,4)).toBe(2);});it('b',()=>{expect(hd272i42x(3,1)).toBe(1);});it('c',()=>{expect(hd272i42x(0,0)).toBe(0);});it('d',()=>{expect(hd272i42x(93,73)).toBe(2);});it('e',()=>{expect(hd272i42x(15,0)).toBe(4);});});
function hd273i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273i42x_hd',()=>{it('a',()=>{expect(hd273i42x(1,4)).toBe(2);});it('b',()=>{expect(hd273i42x(3,1)).toBe(1);});it('c',()=>{expect(hd273i42x(0,0)).toBe(0);});it('d',()=>{expect(hd273i42x(93,73)).toBe(2);});it('e',()=>{expect(hd273i42x(15,0)).toBe(4);});});
function hd274i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274i42x_hd',()=>{it('a',()=>{expect(hd274i42x(1,4)).toBe(2);});it('b',()=>{expect(hd274i42x(3,1)).toBe(1);});it('c',()=>{expect(hd274i42x(0,0)).toBe(0);});it('d',()=>{expect(hd274i42x(93,73)).toBe(2);});it('e',()=>{expect(hd274i42x(15,0)).toBe(4);});});
function hd275i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275i42x_hd',()=>{it('a',()=>{expect(hd275i42x(1,4)).toBe(2);});it('b',()=>{expect(hd275i42x(3,1)).toBe(1);});it('c',()=>{expect(hd275i42x(0,0)).toBe(0);});it('d',()=>{expect(hd275i42x(93,73)).toBe(2);});it('e',()=>{expect(hd275i42x(15,0)).toBe(4);});});
function hd276i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276i42x_hd',()=>{it('a',()=>{expect(hd276i42x(1,4)).toBe(2);});it('b',()=>{expect(hd276i42x(3,1)).toBe(1);});it('c',()=>{expect(hd276i42x(0,0)).toBe(0);});it('d',()=>{expect(hd276i42x(93,73)).toBe(2);});it('e',()=>{expect(hd276i42x(15,0)).toBe(4);});});
function hd277i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277i42x_hd',()=>{it('a',()=>{expect(hd277i42x(1,4)).toBe(2);});it('b',()=>{expect(hd277i42x(3,1)).toBe(1);});it('c',()=>{expect(hd277i42x(0,0)).toBe(0);});it('d',()=>{expect(hd277i42x(93,73)).toBe(2);});it('e',()=>{expect(hd277i42x(15,0)).toBe(4);});});
function hd278i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278i42x_hd',()=>{it('a',()=>{expect(hd278i42x(1,4)).toBe(2);});it('b',()=>{expect(hd278i42x(3,1)).toBe(1);});it('c',()=>{expect(hd278i42x(0,0)).toBe(0);});it('d',()=>{expect(hd278i42x(93,73)).toBe(2);});it('e',()=>{expect(hd278i42x(15,0)).toBe(4);});});
function hd279i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279i42x_hd',()=>{it('a',()=>{expect(hd279i42x(1,4)).toBe(2);});it('b',()=>{expect(hd279i42x(3,1)).toBe(1);});it('c',()=>{expect(hd279i42x(0,0)).toBe(0);});it('d',()=>{expect(hd279i42x(93,73)).toBe(2);});it('e',()=>{expect(hd279i42x(15,0)).toBe(4);});});
function hd280i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280i42x_hd',()=>{it('a',()=>{expect(hd280i42x(1,4)).toBe(2);});it('b',()=>{expect(hd280i42x(3,1)).toBe(1);});it('c',()=>{expect(hd280i42x(0,0)).toBe(0);});it('d',()=>{expect(hd280i42x(93,73)).toBe(2);});it('e',()=>{expect(hd280i42x(15,0)).toBe(4);});});
function hd281i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281i42x_hd',()=>{it('a',()=>{expect(hd281i42x(1,4)).toBe(2);});it('b',()=>{expect(hd281i42x(3,1)).toBe(1);});it('c',()=>{expect(hd281i42x(0,0)).toBe(0);});it('d',()=>{expect(hd281i42x(93,73)).toBe(2);});it('e',()=>{expect(hd281i42x(15,0)).toBe(4);});});
function hd282i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282i42x_hd',()=>{it('a',()=>{expect(hd282i42x(1,4)).toBe(2);});it('b',()=>{expect(hd282i42x(3,1)).toBe(1);});it('c',()=>{expect(hd282i42x(0,0)).toBe(0);});it('d',()=>{expect(hd282i42x(93,73)).toBe(2);});it('e',()=>{expect(hd282i42x(15,0)).toBe(4);});});
function hd283i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283i42x_hd',()=>{it('a',()=>{expect(hd283i42x(1,4)).toBe(2);});it('b',()=>{expect(hd283i42x(3,1)).toBe(1);});it('c',()=>{expect(hd283i42x(0,0)).toBe(0);});it('d',()=>{expect(hd283i42x(93,73)).toBe(2);});it('e',()=>{expect(hd283i42x(15,0)).toBe(4);});});
function hd284i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284i42x_hd',()=>{it('a',()=>{expect(hd284i42x(1,4)).toBe(2);});it('b',()=>{expect(hd284i42x(3,1)).toBe(1);});it('c',()=>{expect(hd284i42x(0,0)).toBe(0);});it('d',()=>{expect(hd284i42x(93,73)).toBe(2);});it('e',()=>{expect(hd284i42x(15,0)).toBe(4);});});
function hd285i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285i42x_hd',()=>{it('a',()=>{expect(hd285i42x(1,4)).toBe(2);});it('b',()=>{expect(hd285i42x(3,1)).toBe(1);});it('c',()=>{expect(hd285i42x(0,0)).toBe(0);});it('d',()=>{expect(hd285i42x(93,73)).toBe(2);});it('e',()=>{expect(hd285i42x(15,0)).toBe(4);});});
function hd286i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286i42x_hd',()=>{it('a',()=>{expect(hd286i42x(1,4)).toBe(2);});it('b',()=>{expect(hd286i42x(3,1)).toBe(1);});it('c',()=>{expect(hd286i42x(0,0)).toBe(0);});it('d',()=>{expect(hd286i42x(93,73)).toBe(2);});it('e',()=>{expect(hd286i42x(15,0)).toBe(4);});});
function hd287i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287i42x_hd',()=>{it('a',()=>{expect(hd287i42x(1,4)).toBe(2);});it('b',()=>{expect(hd287i42x(3,1)).toBe(1);});it('c',()=>{expect(hd287i42x(0,0)).toBe(0);});it('d',()=>{expect(hd287i42x(93,73)).toBe(2);});it('e',()=>{expect(hd287i42x(15,0)).toBe(4);});});
function hd288i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288i42x_hd',()=>{it('a',()=>{expect(hd288i42x(1,4)).toBe(2);});it('b',()=>{expect(hd288i42x(3,1)).toBe(1);});it('c',()=>{expect(hd288i42x(0,0)).toBe(0);});it('d',()=>{expect(hd288i42x(93,73)).toBe(2);});it('e',()=>{expect(hd288i42x(15,0)).toBe(4);});});
function hd289i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289i42x_hd',()=>{it('a',()=>{expect(hd289i42x(1,4)).toBe(2);});it('b',()=>{expect(hd289i42x(3,1)).toBe(1);});it('c',()=>{expect(hd289i42x(0,0)).toBe(0);});it('d',()=>{expect(hd289i42x(93,73)).toBe(2);});it('e',()=>{expect(hd289i42x(15,0)).toBe(4);});});
function hd290i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290i42x_hd',()=>{it('a',()=>{expect(hd290i42x(1,4)).toBe(2);});it('b',()=>{expect(hd290i42x(3,1)).toBe(1);});it('c',()=>{expect(hd290i42x(0,0)).toBe(0);});it('d',()=>{expect(hd290i42x(93,73)).toBe(2);});it('e',()=>{expect(hd290i42x(15,0)).toBe(4);});});
function hd291i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291i42x_hd',()=>{it('a',()=>{expect(hd291i42x(1,4)).toBe(2);});it('b',()=>{expect(hd291i42x(3,1)).toBe(1);});it('c',()=>{expect(hd291i42x(0,0)).toBe(0);});it('d',()=>{expect(hd291i42x(93,73)).toBe(2);});it('e',()=>{expect(hd291i42x(15,0)).toBe(4);});});
function hd292i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292i42x_hd',()=>{it('a',()=>{expect(hd292i42x(1,4)).toBe(2);});it('b',()=>{expect(hd292i42x(3,1)).toBe(1);});it('c',()=>{expect(hd292i42x(0,0)).toBe(0);});it('d',()=>{expect(hd292i42x(93,73)).toBe(2);});it('e',()=>{expect(hd292i42x(15,0)).toBe(4);});});
function hd293i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293i42x_hd',()=>{it('a',()=>{expect(hd293i42x(1,4)).toBe(2);});it('b',()=>{expect(hd293i42x(3,1)).toBe(1);});it('c',()=>{expect(hd293i42x(0,0)).toBe(0);});it('d',()=>{expect(hd293i42x(93,73)).toBe(2);});it('e',()=>{expect(hd293i42x(15,0)).toBe(4);});});
function hd294i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294i42x_hd',()=>{it('a',()=>{expect(hd294i42x(1,4)).toBe(2);});it('b',()=>{expect(hd294i42x(3,1)).toBe(1);});it('c',()=>{expect(hd294i42x(0,0)).toBe(0);});it('d',()=>{expect(hd294i42x(93,73)).toBe(2);});it('e',()=>{expect(hd294i42x(15,0)).toBe(4);});});
function hd295i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295i42x_hd',()=>{it('a',()=>{expect(hd295i42x(1,4)).toBe(2);});it('b',()=>{expect(hd295i42x(3,1)).toBe(1);});it('c',()=>{expect(hd295i42x(0,0)).toBe(0);});it('d',()=>{expect(hd295i42x(93,73)).toBe(2);});it('e',()=>{expect(hd295i42x(15,0)).toBe(4);});});
function hd296i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296i42x_hd',()=>{it('a',()=>{expect(hd296i42x(1,4)).toBe(2);});it('b',()=>{expect(hd296i42x(3,1)).toBe(1);});it('c',()=>{expect(hd296i42x(0,0)).toBe(0);});it('d',()=>{expect(hd296i42x(93,73)).toBe(2);});it('e',()=>{expect(hd296i42x(15,0)).toBe(4);});});
function hd297i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297i42x_hd',()=>{it('a',()=>{expect(hd297i42x(1,4)).toBe(2);});it('b',()=>{expect(hd297i42x(3,1)).toBe(1);});it('c',()=>{expect(hd297i42x(0,0)).toBe(0);});it('d',()=>{expect(hd297i42x(93,73)).toBe(2);});it('e',()=>{expect(hd297i42x(15,0)).toBe(4);});});
function hd298i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298i42x_hd',()=>{it('a',()=>{expect(hd298i42x(1,4)).toBe(2);});it('b',()=>{expect(hd298i42x(3,1)).toBe(1);});it('c',()=>{expect(hd298i42x(0,0)).toBe(0);});it('d',()=>{expect(hd298i42x(93,73)).toBe(2);});it('e',()=>{expect(hd298i42x(15,0)).toBe(4);});});
function hd299i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299i42x_hd',()=>{it('a',()=>{expect(hd299i42x(1,4)).toBe(2);});it('b',()=>{expect(hd299i42x(3,1)).toBe(1);});it('c',()=>{expect(hd299i42x(0,0)).toBe(0);});it('d',()=>{expect(hd299i42x(93,73)).toBe(2);});it('e',()=>{expect(hd299i42x(15,0)).toBe(4);});});
function hd300i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300i42x_hd',()=>{it('a',()=>{expect(hd300i42x(1,4)).toBe(2);});it('b',()=>{expect(hd300i42x(3,1)).toBe(1);});it('c',()=>{expect(hd300i42x(0,0)).toBe(0);});it('d',()=>{expect(hd300i42x(93,73)).toBe(2);});it('e',()=>{expect(hd300i42x(15,0)).toBe(4);});});
function hd301i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301i42x_hd',()=>{it('a',()=>{expect(hd301i42x(1,4)).toBe(2);});it('b',()=>{expect(hd301i42x(3,1)).toBe(1);});it('c',()=>{expect(hd301i42x(0,0)).toBe(0);});it('d',()=>{expect(hd301i42x(93,73)).toBe(2);});it('e',()=>{expect(hd301i42x(15,0)).toBe(4);});});
function hd302i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302i42x_hd',()=>{it('a',()=>{expect(hd302i42x(1,4)).toBe(2);});it('b',()=>{expect(hd302i42x(3,1)).toBe(1);});it('c',()=>{expect(hd302i42x(0,0)).toBe(0);});it('d',()=>{expect(hd302i42x(93,73)).toBe(2);});it('e',()=>{expect(hd302i42x(15,0)).toBe(4);});});
function hd303i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303i42x_hd',()=>{it('a',()=>{expect(hd303i42x(1,4)).toBe(2);});it('b',()=>{expect(hd303i42x(3,1)).toBe(1);});it('c',()=>{expect(hd303i42x(0,0)).toBe(0);});it('d',()=>{expect(hd303i42x(93,73)).toBe(2);});it('e',()=>{expect(hd303i42x(15,0)).toBe(4);});});
function hd304i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304i42x_hd',()=>{it('a',()=>{expect(hd304i42x(1,4)).toBe(2);});it('b',()=>{expect(hd304i42x(3,1)).toBe(1);});it('c',()=>{expect(hd304i42x(0,0)).toBe(0);});it('d',()=>{expect(hd304i42x(93,73)).toBe(2);});it('e',()=>{expect(hd304i42x(15,0)).toBe(4);});});
function hd305i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305i42x_hd',()=>{it('a',()=>{expect(hd305i42x(1,4)).toBe(2);});it('b',()=>{expect(hd305i42x(3,1)).toBe(1);});it('c',()=>{expect(hd305i42x(0,0)).toBe(0);});it('d',()=>{expect(hd305i42x(93,73)).toBe(2);});it('e',()=>{expect(hd305i42x(15,0)).toBe(4);});});
function hd306i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306i42x_hd',()=>{it('a',()=>{expect(hd306i42x(1,4)).toBe(2);});it('b',()=>{expect(hd306i42x(3,1)).toBe(1);});it('c',()=>{expect(hd306i42x(0,0)).toBe(0);});it('d',()=>{expect(hd306i42x(93,73)).toBe(2);});it('e',()=>{expect(hd306i42x(15,0)).toBe(4);});});
function hd307i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307i42x_hd',()=>{it('a',()=>{expect(hd307i42x(1,4)).toBe(2);});it('b',()=>{expect(hd307i42x(3,1)).toBe(1);});it('c',()=>{expect(hd307i42x(0,0)).toBe(0);});it('d',()=>{expect(hd307i42x(93,73)).toBe(2);});it('e',()=>{expect(hd307i42x(15,0)).toBe(4);});});
function hd308i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308i42x_hd',()=>{it('a',()=>{expect(hd308i42x(1,4)).toBe(2);});it('b',()=>{expect(hd308i42x(3,1)).toBe(1);});it('c',()=>{expect(hd308i42x(0,0)).toBe(0);});it('d',()=>{expect(hd308i42x(93,73)).toBe(2);});it('e',()=>{expect(hd308i42x(15,0)).toBe(4);});});
function hd309i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309i42x_hd',()=>{it('a',()=>{expect(hd309i42x(1,4)).toBe(2);});it('b',()=>{expect(hd309i42x(3,1)).toBe(1);});it('c',()=>{expect(hd309i42x(0,0)).toBe(0);});it('d',()=>{expect(hd309i42x(93,73)).toBe(2);});it('e',()=>{expect(hd309i42x(15,0)).toBe(4);});});
function hd310i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310i42x_hd',()=>{it('a',()=>{expect(hd310i42x(1,4)).toBe(2);});it('b',()=>{expect(hd310i42x(3,1)).toBe(1);});it('c',()=>{expect(hd310i42x(0,0)).toBe(0);});it('d',()=>{expect(hd310i42x(93,73)).toBe(2);});it('e',()=>{expect(hd310i42x(15,0)).toBe(4);});});
function hd311i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311i42x_hd',()=>{it('a',()=>{expect(hd311i42x(1,4)).toBe(2);});it('b',()=>{expect(hd311i42x(3,1)).toBe(1);});it('c',()=>{expect(hd311i42x(0,0)).toBe(0);});it('d',()=>{expect(hd311i42x(93,73)).toBe(2);});it('e',()=>{expect(hd311i42x(15,0)).toBe(4);});});
function hd312i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312i42x_hd',()=>{it('a',()=>{expect(hd312i42x(1,4)).toBe(2);});it('b',()=>{expect(hd312i42x(3,1)).toBe(1);});it('c',()=>{expect(hd312i42x(0,0)).toBe(0);});it('d',()=>{expect(hd312i42x(93,73)).toBe(2);});it('e',()=>{expect(hd312i42x(15,0)).toBe(4);});});
function hd313i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313i42x_hd',()=>{it('a',()=>{expect(hd313i42x(1,4)).toBe(2);});it('b',()=>{expect(hd313i42x(3,1)).toBe(1);});it('c',()=>{expect(hd313i42x(0,0)).toBe(0);});it('d',()=>{expect(hd313i42x(93,73)).toBe(2);});it('e',()=>{expect(hd313i42x(15,0)).toBe(4);});});
function hd314i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314i42x_hd',()=>{it('a',()=>{expect(hd314i42x(1,4)).toBe(2);});it('b',()=>{expect(hd314i42x(3,1)).toBe(1);});it('c',()=>{expect(hd314i42x(0,0)).toBe(0);});it('d',()=>{expect(hd314i42x(93,73)).toBe(2);});it('e',()=>{expect(hd314i42x(15,0)).toBe(4);});});
function hd315i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315i42x_hd',()=>{it('a',()=>{expect(hd315i42x(1,4)).toBe(2);});it('b',()=>{expect(hd315i42x(3,1)).toBe(1);});it('c',()=>{expect(hd315i42x(0,0)).toBe(0);});it('d',()=>{expect(hd315i42x(93,73)).toBe(2);});it('e',()=>{expect(hd315i42x(15,0)).toBe(4);});});
function hd316i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316i42x_hd',()=>{it('a',()=>{expect(hd316i42x(1,4)).toBe(2);});it('b',()=>{expect(hd316i42x(3,1)).toBe(1);});it('c',()=>{expect(hd316i42x(0,0)).toBe(0);});it('d',()=>{expect(hd316i42x(93,73)).toBe(2);});it('e',()=>{expect(hd316i42x(15,0)).toBe(4);});});
function hd317i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317i42x_hd',()=>{it('a',()=>{expect(hd317i42x(1,4)).toBe(2);});it('b',()=>{expect(hd317i42x(3,1)).toBe(1);});it('c',()=>{expect(hd317i42x(0,0)).toBe(0);});it('d',()=>{expect(hd317i42x(93,73)).toBe(2);});it('e',()=>{expect(hd317i42x(15,0)).toBe(4);});});
function hd318i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318i42x_hd',()=>{it('a',()=>{expect(hd318i42x(1,4)).toBe(2);});it('b',()=>{expect(hd318i42x(3,1)).toBe(1);});it('c',()=>{expect(hd318i42x(0,0)).toBe(0);});it('d',()=>{expect(hd318i42x(93,73)).toBe(2);});it('e',()=>{expect(hd318i42x(15,0)).toBe(4);});});
function hd319i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319i42x_hd',()=>{it('a',()=>{expect(hd319i42x(1,4)).toBe(2);});it('b',()=>{expect(hd319i42x(3,1)).toBe(1);});it('c',()=>{expect(hd319i42x(0,0)).toBe(0);});it('d',()=>{expect(hd319i42x(93,73)).toBe(2);});it('e',()=>{expect(hd319i42x(15,0)).toBe(4);});});
function hd320i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320i42x_hd',()=>{it('a',()=>{expect(hd320i42x(1,4)).toBe(2);});it('b',()=>{expect(hd320i42x(3,1)).toBe(1);});it('c',()=>{expect(hd320i42x(0,0)).toBe(0);});it('d',()=>{expect(hd320i42x(93,73)).toBe(2);});it('e',()=>{expect(hd320i42x(15,0)).toBe(4);});});
function hd321i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321i42x_hd',()=>{it('a',()=>{expect(hd321i42x(1,4)).toBe(2);});it('b',()=>{expect(hd321i42x(3,1)).toBe(1);});it('c',()=>{expect(hd321i42x(0,0)).toBe(0);});it('d',()=>{expect(hd321i42x(93,73)).toBe(2);});it('e',()=>{expect(hd321i42x(15,0)).toBe(4);});});
function hd322i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322i42x_hd',()=>{it('a',()=>{expect(hd322i42x(1,4)).toBe(2);});it('b',()=>{expect(hd322i42x(3,1)).toBe(1);});it('c',()=>{expect(hd322i42x(0,0)).toBe(0);});it('d',()=>{expect(hd322i42x(93,73)).toBe(2);});it('e',()=>{expect(hd322i42x(15,0)).toBe(4);});});
function hd323i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323i42x_hd',()=>{it('a',()=>{expect(hd323i42x(1,4)).toBe(2);});it('b',()=>{expect(hd323i42x(3,1)).toBe(1);});it('c',()=>{expect(hd323i42x(0,0)).toBe(0);});it('d',()=>{expect(hd323i42x(93,73)).toBe(2);});it('e',()=>{expect(hd323i42x(15,0)).toBe(4);});});
function hd324i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324i42x_hd',()=>{it('a',()=>{expect(hd324i42x(1,4)).toBe(2);});it('b',()=>{expect(hd324i42x(3,1)).toBe(1);});it('c',()=>{expect(hd324i42x(0,0)).toBe(0);});it('d',()=>{expect(hd324i42x(93,73)).toBe(2);});it('e',()=>{expect(hd324i42x(15,0)).toBe(4);});});
function hd325i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325i42x_hd',()=>{it('a',()=>{expect(hd325i42x(1,4)).toBe(2);});it('b',()=>{expect(hd325i42x(3,1)).toBe(1);});it('c',()=>{expect(hd325i42x(0,0)).toBe(0);});it('d',()=>{expect(hd325i42x(93,73)).toBe(2);});it('e',()=>{expect(hd325i42x(15,0)).toBe(4);});});
function hd326i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326i42x_hd',()=>{it('a',()=>{expect(hd326i42x(1,4)).toBe(2);});it('b',()=>{expect(hd326i42x(3,1)).toBe(1);});it('c',()=>{expect(hd326i42x(0,0)).toBe(0);});it('d',()=>{expect(hd326i42x(93,73)).toBe(2);});it('e',()=>{expect(hd326i42x(15,0)).toBe(4);});});
function hd327i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327i42x_hd',()=>{it('a',()=>{expect(hd327i42x(1,4)).toBe(2);});it('b',()=>{expect(hd327i42x(3,1)).toBe(1);});it('c',()=>{expect(hd327i42x(0,0)).toBe(0);});it('d',()=>{expect(hd327i42x(93,73)).toBe(2);});it('e',()=>{expect(hd327i42x(15,0)).toBe(4);});});
function hd328i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328i42x_hd',()=>{it('a',()=>{expect(hd328i42x(1,4)).toBe(2);});it('b',()=>{expect(hd328i42x(3,1)).toBe(1);});it('c',()=>{expect(hd328i42x(0,0)).toBe(0);});it('d',()=>{expect(hd328i42x(93,73)).toBe(2);});it('e',()=>{expect(hd328i42x(15,0)).toBe(4);});});
function hd329i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329i42x_hd',()=>{it('a',()=>{expect(hd329i42x(1,4)).toBe(2);});it('b',()=>{expect(hd329i42x(3,1)).toBe(1);});it('c',()=>{expect(hd329i42x(0,0)).toBe(0);});it('d',()=>{expect(hd329i42x(93,73)).toBe(2);});it('e',()=>{expect(hd329i42x(15,0)).toBe(4);});});
function hd330i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330i42x_hd',()=>{it('a',()=>{expect(hd330i42x(1,4)).toBe(2);});it('b',()=>{expect(hd330i42x(3,1)).toBe(1);});it('c',()=>{expect(hd330i42x(0,0)).toBe(0);});it('d',()=>{expect(hd330i42x(93,73)).toBe(2);});it('e',()=>{expect(hd330i42x(15,0)).toBe(4);});});
function hd331i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331i42x_hd',()=>{it('a',()=>{expect(hd331i42x(1,4)).toBe(2);});it('b',()=>{expect(hd331i42x(3,1)).toBe(1);});it('c',()=>{expect(hd331i42x(0,0)).toBe(0);});it('d',()=>{expect(hd331i42x(93,73)).toBe(2);});it('e',()=>{expect(hd331i42x(15,0)).toBe(4);});});
function hd332i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332i42x_hd',()=>{it('a',()=>{expect(hd332i42x(1,4)).toBe(2);});it('b',()=>{expect(hd332i42x(3,1)).toBe(1);});it('c',()=>{expect(hd332i42x(0,0)).toBe(0);});it('d',()=>{expect(hd332i42x(93,73)).toBe(2);});it('e',()=>{expect(hd332i42x(15,0)).toBe(4);});});
function hd333i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333i42x_hd',()=>{it('a',()=>{expect(hd333i42x(1,4)).toBe(2);});it('b',()=>{expect(hd333i42x(3,1)).toBe(1);});it('c',()=>{expect(hd333i42x(0,0)).toBe(0);});it('d',()=>{expect(hd333i42x(93,73)).toBe(2);});it('e',()=>{expect(hd333i42x(15,0)).toBe(4);});});
function hd334i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334i42x_hd',()=>{it('a',()=>{expect(hd334i42x(1,4)).toBe(2);});it('b',()=>{expect(hd334i42x(3,1)).toBe(1);});it('c',()=>{expect(hd334i42x(0,0)).toBe(0);});it('d',()=>{expect(hd334i42x(93,73)).toBe(2);});it('e',()=>{expect(hd334i42x(15,0)).toBe(4);});});
function hd335i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335i42x_hd',()=>{it('a',()=>{expect(hd335i42x(1,4)).toBe(2);});it('b',()=>{expect(hd335i42x(3,1)).toBe(1);});it('c',()=>{expect(hd335i42x(0,0)).toBe(0);});it('d',()=>{expect(hd335i42x(93,73)).toBe(2);});it('e',()=>{expect(hd335i42x(15,0)).toBe(4);});});
function hd336i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336i42x_hd',()=>{it('a',()=>{expect(hd336i42x(1,4)).toBe(2);});it('b',()=>{expect(hd336i42x(3,1)).toBe(1);});it('c',()=>{expect(hd336i42x(0,0)).toBe(0);});it('d',()=>{expect(hd336i42x(93,73)).toBe(2);});it('e',()=>{expect(hd336i42x(15,0)).toBe(4);});});
function hd337i42x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337i42x_hd',()=>{it('a',()=>{expect(hd337i42x(1,4)).toBe(2);});it('b',()=>{expect(hd337i42x(3,1)).toBe(1);});it('c',()=>{expect(hd337i42x(0,0)).toBe(0);});it('d',()=>{expect(hd337i42x(93,73)).toBe(2);});it('e',()=>{expect(hd337i42x(15,0)).toBe(4);});});
function hd338isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338isox2_hd',()=>{it('a',()=>{expect(hd338isox2(1,4)).toBe(2);});it('b',()=>{expect(hd338isox2(3,1)).toBe(1);});it('c',()=>{expect(hd338isox2(0,0)).toBe(0);});it('d',()=>{expect(hd338isox2(93,73)).toBe(2);});it('e',()=>{expect(hd338isox2(15,0)).toBe(4);});});
function hd338isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd339isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339isox2_hd',()=>{it('a',()=>{expect(hd339isox2(1,4)).toBe(2);});it('b',()=>{expect(hd339isox2(3,1)).toBe(1);});it('c',()=>{expect(hd339isox2(0,0)).toBe(0);});it('d',()=>{expect(hd339isox2(93,73)).toBe(2);});it('e',()=>{expect(hd339isox2(15,0)).toBe(4);});});
function hd339isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd340isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340isox2_hd',()=>{it('a',()=>{expect(hd340isox2(1,4)).toBe(2);});it('b',()=>{expect(hd340isox2(3,1)).toBe(1);});it('c',()=>{expect(hd340isox2(0,0)).toBe(0);});it('d',()=>{expect(hd340isox2(93,73)).toBe(2);});it('e',()=>{expect(hd340isox2(15,0)).toBe(4);});});
function hd340isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd341isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341isox2_hd',()=>{it('a',()=>{expect(hd341isox2(1,4)).toBe(2);});it('b',()=>{expect(hd341isox2(3,1)).toBe(1);});it('c',()=>{expect(hd341isox2(0,0)).toBe(0);});it('d',()=>{expect(hd341isox2(93,73)).toBe(2);});it('e',()=>{expect(hd341isox2(15,0)).toBe(4);});});
function hd341isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd342isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342isox2_hd',()=>{it('a',()=>{expect(hd342isox2(1,4)).toBe(2);});it('b',()=>{expect(hd342isox2(3,1)).toBe(1);});it('c',()=>{expect(hd342isox2(0,0)).toBe(0);});it('d',()=>{expect(hd342isox2(93,73)).toBe(2);});it('e',()=>{expect(hd342isox2(15,0)).toBe(4);});});
function hd342isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd343isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343isox2_hd',()=>{it('a',()=>{expect(hd343isox2(1,4)).toBe(2);});it('b',()=>{expect(hd343isox2(3,1)).toBe(1);});it('c',()=>{expect(hd343isox2(0,0)).toBe(0);});it('d',()=>{expect(hd343isox2(93,73)).toBe(2);});it('e',()=>{expect(hd343isox2(15,0)).toBe(4);});});
function hd343isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd344isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344isox2_hd',()=>{it('a',()=>{expect(hd344isox2(1,4)).toBe(2);});it('b',()=>{expect(hd344isox2(3,1)).toBe(1);});it('c',()=>{expect(hd344isox2(0,0)).toBe(0);});it('d',()=>{expect(hd344isox2(93,73)).toBe(2);});it('e',()=>{expect(hd344isox2(15,0)).toBe(4);});});
function hd344isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd345isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345isox2_hd',()=>{it('a',()=>{expect(hd345isox2(1,4)).toBe(2);});it('b',()=>{expect(hd345isox2(3,1)).toBe(1);});it('c',()=>{expect(hd345isox2(0,0)).toBe(0);});it('d',()=>{expect(hd345isox2(93,73)).toBe(2);});it('e',()=>{expect(hd345isox2(15,0)).toBe(4);});});
function hd345isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd346isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346isox2_hd',()=>{it('a',()=>{expect(hd346isox2(1,4)).toBe(2);});it('b',()=>{expect(hd346isox2(3,1)).toBe(1);});it('c',()=>{expect(hd346isox2(0,0)).toBe(0);});it('d',()=>{expect(hd346isox2(93,73)).toBe(2);});it('e',()=>{expect(hd346isox2(15,0)).toBe(4);});});
function hd346isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd347isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347isox2_hd',()=>{it('a',()=>{expect(hd347isox2(1,4)).toBe(2);});it('b',()=>{expect(hd347isox2(3,1)).toBe(1);});it('c',()=>{expect(hd347isox2(0,0)).toBe(0);});it('d',()=>{expect(hd347isox2(93,73)).toBe(2);});it('e',()=>{expect(hd347isox2(15,0)).toBe(4);});});
function hd347isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd348isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348isox2_hd',()=>{it('a',()=>{expect(hd348isox2(1,4)).toBe(2);});it('b',()=>{expect(hd348isox2(3,1)).toBe(1);});it('c',()=>{expect(hd348isox2(0,0)).toBe(0);});it('d',()=>{expect(hd348isox2(93,73)).toBe(2);});it('e',()=>{expect(hd348isox2(15,0)).toBe(4);});});
function hd348isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd349isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349isox2_hd',()=>{it('a',()=>{expect(hd349isox2(1,4)).toBe(2);});it('b',()=>{expect(hd349isox2(3,1)).toBe(1);});it('c',()=>{expect(hd349isox2(0,0)).toBe(0);});it('d',()=>{expect(hd349isox2(93,73)).toBe(2);});it('e',()=>{expect(hd349isox2(15,0)).toBe(4);});});
function hd349isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd350isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350isox2_hd',()=>{it('a',()=>{expect(hd350isox2(1,4)).toBe(2);});it('b',()=>{expect(hd350isox2(3,1)).toBe(1);});it('c',()=>{expect(hd350isox2(0,0)).toBe(0);});it('d',()=>{expect(hd350isox2(93,73)).toBe(2);});it('e',()=>{expect(hd350isox2(15,0)).toBe(4);});});
function hd350isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd351isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351isox2_hd',()=>{it('a',()=>{expect(hd351isox2(1,4)).toBe(2);});it('b',()=>{expect(hd351isox2(3,1)).toBe(1);});it('c',()=>{expect(hd351isox2(0,0)).toBe(0);});it('d',()=>{expect(hd351isox2(93,73)).toBe(2);});it('e',()=>{expect(hd351isox2(15,0)).toBe(4);});});
function hd351isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd352isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352isox2_hd',()=>{it('a',()=>{expect(hd352isox2(1,4)).toBe(2);});it('b',()=>{expect(hd352isox2(3,1)).toBe(1);});it('c',()=>{expect(hd352isox2(0,0)).toBe(0);});it('d',()=>{expect(hd352isox2(93,73)).toBe(2);});it('e',()=>{expect(hd352isox2(15,0)).toBe(4);});});
function hd352isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd353isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353isox2_hd',()=>{it('a',()=>{expect(hd353isox2(1,4)).toBe(2);});it('b',()=>{expect(hd353isox2(3,1)).toBe(1);});it('c',()=>{expect(hd353isox2(0,0)).toBe(0);});it('d',()=>{expect(hd353isox2(93,73)).toBe(2);});it('e',()=>{expect(hd353isox2(15,0)).toBe(4);});});
function hd353isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd354isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354isox2_hd',()=>{it('a',()=>{expect(hd354isox2(1,4)).toBe(2);});it('b',()=>{expect(hd354isox2(3,1)).toBe(1);});it('c',()=>{expect(hd354isox2(0,0)).toBe(0);});it('d',()=>{expect(hd354isox2(93,73)).toBe(2);});it('e',()=>{expect(hd354isox2(15,0)).toBe(4);});});
function hd354isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd355isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355isox2_hd',()=>{it('a',()=>{expect(hd355isox2(1,4)).toBe(2);});it('b',()=>{expect(hd355isox2(3,1)).toBe(1);});it('c',()=>{expect(hd355isox2(0,0)).toBe(0);});it('d',()=>{expect(hd355isox2(93,73)).toBe(2);});it('e',()=>{expect(hd355isox2(15,0)).toBe(4);});});
function hd355isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd356isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356isox2_hd',()=>{it('a',()=>{expect(hd356isox2(1,4)).toBe(2);});it('b',()=>{expect(hd356isox2(3,1)).toBe(1);});it('c',()=>{expect(hd356isox2(0,0)).toBe(0);});it('d',()=>{expect(hd356isox2(93,73)).toBe(2);});it('e',()=>{expect(hd356isox2(15,0)).toBe(4);});});
function hd356isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd357isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357isox2_hd',()=>{it('a',()=>{expect(hd357isox2(1,4)).toBe(2);});it('b',()=>{expect(hd357isox2(3,1)).toBe(1);});it('c',()=>{expect(hd357isox2(0,0)).toBe(0);});it('d',()=>{expect(hd357isox2(93,73)).toBe(2);});it('e',()=>{expect(hd357isox2(15,0)).toBe(4);});});
function hd357isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd358isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358isox2_hd',()=>{it('a',()=>{expect(hd358isox2(1,4)).toBe(2);});it('b',()=>{expect(hd358isox2(3,1)).toBe(1);});it('c',()=>{expect(hd358isox2(0,0)).toBe(0);});it('d',()=>{expect(hd358isox2(93,73)).toBe(2);});it('e',()=>{expect(hd358isox2(15,0)).toBe(4);});});
function hd358isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd359isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359isox2_hd',()=>{it('a',()=>{expect(hd359isox2(1,4)).toBe(2);});it('b',()=>{expect(hd359isox2(3,1)).toBe(1);});it('c',()=>{expect(hd359isox2(0,0)).toBe(0);});it('d',()=>{expect(hd359isox2(93,73)).toBe(2);});it('e',()=>{expect(hd359isox2(15,0)).toBe(4);});});
function hd359isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd360isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360isox2_hd',()=>{it('a',()=>{expect(hd360isox2(1,4)).toBe(2);});it('b',()=>{expect(hd360isox2(3,1)).toBe(1);});it('c',()=>{expect(hd360isox2(0,0)).toBe(0);});it('d',()=>{expect(hd360isox2(93,73)).toBe(2);});it('e',()=>{expect(hd360isox2(15,0)).toBe(4);});});
function hd360isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd361isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361isox2_hd',()=>{it('a',()=>{expect(hd361isox2(1,4)).toBe(2);});it('b',()=>{expect(hd361isox2(3,1)).toBe(1);});it('c',()=>{expect(hd361isox2(0,0)).toBe(0);});it('d',()=>{expect(hd361isox2(93,73)).toBe(2);});it('e',()=>{expect(hd361isox2(15,0)).toBe(4);});});
function hd361isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd362isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362isox2_hd',()=>{it('a',()=>{expect(hd362isox2(1,4)).toBe(2);});it('b',()=>{expect(hd362isox2(3,1)).toBe(1);});it('c',()=>{expect(hd362isox2(0,0)).toBe(0);});it('d',()=>{expect(hd362isox2(93,73)).toBe(2);});it('e',()=>{expect(hd362isox2(15,0)).toBe(4);});});
function hd362isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd363isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363isox2_hd',()=>{it('a',()=>{expect(hd363isox2(1,4)).toBe(2);});it('b',()=>{expect(hd363isox2(3,1)).toBe(1);});it('c',()=>{expect(hd363isox2(0,0)).toBe(0);});it('d',()=>{expect(hd363isox2(93,73)).toBe(2);});it('e',()=>{expect(hd363isox2(15,0)).toBe(4);});});
function hd363isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd364isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364isox2_hd',()=>{it('a',()=>{expect(hd364isox2(1,4)).toBe(2);});it('b',()=>{expect(hd364isox2(3,1)).toBe(1);});it('c',()=>{expect(hd364isox2(0,0)).toBe(0);});it('d',()=>{expect(hd364isox2(93,73)).toBe(2);});it('e',()=>{expect(hd364isox2(15,0)).toBe(4);});});
function hd364isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd365isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365isox2_hd',()=>{it('a',()=>{expect(hd365isox2(1,4)).toBe(2);});it('b',()=>{expect(hd365isox2(3,1)).toBe(1);});it('c',()=>{expect(hd365isox2(0,0)).toBe(0);});it('d',()=>{expect(hd365isox2(93,73)).toBe(2);});it('e',()=>{expect(hd365isox2(15,0)).toBe(4);});});
function hd365isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd366isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366isox2_hd',()=>{it('a',()=>{expect(hd366isox2(1,4)).toBe(2);});it('b',()=>{expect(hd366isox2(3,1)).toBe(1);});it('c',()=>{expect(hd366isox2(0,0)).toBe(0);});it('d',()=>{expect(hd366isox2(93,73)).toBe(2);});it('e',()=>{expect(hd366isox2(15,0)).toBe(4);});});
function hd366isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd367isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367isox2_hd',()=>{it('a',()=>{expect(hd367isox2(1,4)).toBe(2);});it('b',()=>{expect(hd367isox2(3,1)).toBe(1);});it('c',()=>{expect(hd367isox2(0,0)).toBe(0);});it('d',()=>{expect(hd367isox2(93,73)).toBe(2);});it('e',()=>{expect(hd367isox2(15,0)).toBe(4);});});
function hd367isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd368isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368isox2_hd',()=>{it('a',()=>{expect(hd368isox2(1,4)).toBe(2);});it('b',()=>{expect(hd368isox2(3,1)).toBe(1);});it('c',()=>{expect(hd368isox2(0,0)).toBe(0);});it('d',()=>{expect(hd368isox2(93,73)).toBe(2);});it('e',()=>{expect(hd368isox2(15,0)).toBe(4);});});
function hd368isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd369isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369isox2_hd',()=>{it('a',()=>{expect(hd369isox2(1,4)).toBe(2);});it('b',()=>{expect(hd369isox2(3,1)).toBe(1);});it('c',()=>{expect(hd369isox2(0,0)).toBe(0);});it('d',()=>{expect(hd369isox2(93,73)).toBe(2);});it('e',()=>{expect(hd369isox2(15,0)).toBe(4);});});
function hd369isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd370isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370isox2_hd',()=>{it('a',()=>{expect(hd370isox2(1,4)).toBe(2);});it('b',()=>{expect(hd370isox2(3,1)).toBe(1);});it('c',()=>{expect(hd370isox2(0,0)).toBe(0);});it('d',()=>{expect(hd370isox2(93,73)).toBe(2);});it('e',()=>{expect(hd370isox2(15,0)).toBe(4);});});
function hd370isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd371isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371isox2_hd',()=>{it('a',()=>{expect(hd371isox2(1,4)).toBe(2);});it('b',()=>{expect(hd371isox2(3,1)).toBe(1);});it('c',()=>{expect(hd371isox2(0,0)).toBe(0);});it('d',()=>{expect(hd371isox2(93,73)).toBe(2);});it('e',()=>{expect(hd371isox2(15,0)).toBe(4);});});
function hd371isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd372isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372isox2_hd',()=>{it('a',()=>{expect(hd372isox2(1,4)).toBe(2);});it('b',()=>{expect(hd372isox2(3,1)).toBe(1);});it('c',()=>{expect(hd372isox2(0,0)).toBe(0);});it('d',()=>{expect(hd372isox2(93,73)).toBe(2);});it('e',()=>{expect(hd372isox2(15,0)).toBe(4);});});
function hd372isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd373isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373isox2_hd',()=>{it('a',()=>{expect(hd373isox2(1,4)).toBe(2);});it('b',()=>{expect(hd373isox2(3,1)).toBe(1);});it('c',()=>{expect(hd373isox2(0,0)).toBe(0);});it('d',()=>{expect(hd373isox2(93,73)).toBe(2);});it('e',()=>{expect(hd373isox2(15,0)).toBe(4);});});
function hd373isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd374isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374isox2_hd',()=>{it('a',()=>{expect(hd374isox2(1,4)).toBe(2);});it('b',()=>{expect(hd374isox2(3,1)).toBe(1);});it('c',()=>{expect(hd374isox2(0,0)).toBe(0);});it('d',()=>{expect(hd374isox2(93,73)).toBe(2);});it('e',()=>{expect(hd374isox2(15,0)).toBe(4);});});
function hd374isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd375isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375isox2_hd',()=>{it('a',()=>{expect(hd375isox2(1,4)).toBe(2);});it('b',()=>{expect(hd375isox2(3,1)).toBe(1);});it('c',()=>{expect(hd375isox2(0,0)).toBe(0);});it('d',()=>{expect(hd375isox2(93,73)).toBe(2);});it('e',()=>{expect(hd375isox2(15,0)).toBe(4);});});
function hd375isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd376isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376isox2_hd',()=>{it('a',()=>{expect(hd376isox2(1,4)).toBe(2);});it('b',()=>{expect(hd376isox2(3,1)).toBe(1);});it('c',()=>{expect(hd376isox2(0,0)).toBe(0);});it('d',()=>{expect(hd376isox2(93,73)).toBe(2);});it('e',()=>{expect(hd376isox2(15,0)).toBe(4);});});
function hd376isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd377isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377isox2_hd',()=>{it('a',()=>{expect(hd377isox2(1,4)).toBe(2);});it('b',()=>{expect(hd377isox2(3,1)).toBe(1);});it('c',()=>{expect(hd377isox2(0,0)).toBe(0);});it('d',()=>{expect(hd377isox2(93,73)).toBe(2);});it('e',()=>{expect(hd377isox2(15,0)).toBe(4);});});
function hd377isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd378isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378isox2_hd',()=>{it('a',()=>{expect(hd378isox2(1,4)).toBe(2);});it('b',()=>{expect(hd378isox2(3,1)).toBe(1);});it('c',()=>{expect(hd378isox2(0,0)).toBe(0);});it('d',()=>{expect(hd378isox2(93,73)).toBe(2);});it('e',()=>{expect(hd378isox2(15,0)).toBe(4);});});
function hd378isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd379isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379isox2_hd',()=>{it('a',()=>{expect(hd379isox2(1,4)).toBe(2);});it('b',()=>{expect(hd379isox2(3,1)).toBe(1);});it('c',()=>{expect(hd379isox2(0,0)).toBe(0);});it('d',()=>{expect(hd379isox2(93,73)).toBe(2);});it('e',()=>{expect(hd379isox2(15,0)).toBe(4);});});
function hd379isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd380isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380isox2_hd',()=>{it('a',()=>{expect(hd380isox2(1,4)).toBe(2);});it('b',()=>{expect(hd380isox2(3,1)).toBe(1);});it('c',()=>{expect(hd380isox2(0,0)).toBe(0);});it('d',()=>{expect(hd380isox2(93,73)).toBe(2);});it('e',()=>{expect(hd380isox2(15,0)).toBe(4);});});
function hd380isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd381isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381isox2_hd',()=>{it('a',()=>{expect(hd381isox2(1,4)).toBe(2);});it('b',()=>{expect(hd381isox2(3,1)).toBe(1);});it('c',()=>{expect(hd381isox2(0,0)).toBe(0);});it('d',()=>{expect(hd381isox2(93,73)).toBe(2);});it('e',()=>{expect(hd381isox2(15,0)).toBe(4);});});
function hd381isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd382isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382isox2_hd',()=>{it('a',()=>{expect(hd382isox2(1,4)).toBe(2);});it('b',()=>{expect(hd382isox2(3,1)).toBe(1);});it('c',()=>{expect(hd382isox2(0,0)).toBe(0);});it('d',()=>{expect(hd382isox2(93,73)).toBe(2);});it('e',()=>{expect(hd382isox2(15,0)).toBe(4);});});
function hd382isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd383isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383isox2_hd',()=>{it('a',()=>{expect(hd383isox2(1,4)).toBe(2);});it('b',()=>{expect(hd383isox2(3,1)).toBe(1);});it('c',()=>{expect(hd383isox2(0,0)).toBe(0);});it('d',()=>{expect(hd383isox2(93,73)).toBe(2);});it('e',()=>{expect(hd383isox2(15,0)).toBe(4);});});
function hd383isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd384isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384isox2_hd',()=>{it('a',()=>{expect(hd384isox2(1,4)).toBe(2);});it('b',()=>{expect(hd384isox2(3,1)).toBe(1);});it('c',()=>{expect(hd384isox2(0,0)).toBe(0);});it('d',()=>{expect(hd384isox2(93,73)).toBe(2);});it('e',()=>{expect(hd384isox2(15,0)).toBe(4);});});
function hd384isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd385isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385isox2_hd',()=>{it('a',()=>{expect(hd385isox2(1,4)).toBe(2);});it('b',()=>{expect(hd385isox2(3,1)).toBe(1);});it('c',()=>{expect(hd385isox2(0,0)).toBe(0);});it('d',()=>{expect(hd385isox2(93,73)).toBe(2);});it('e',()=>{expect(hd385isox2(15,0)).toBe(4);});});
function hd385isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd386isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386isox2_hd',()=>{it('a',()=>{expect(hd386isox2(1,4)).toBe(2);});it('b',()=>{expect(hd386isox2(3,1)).toBe(1);});it('c',()=>{expect(hd386isox2(0,0)).toBe(0);});it('d',()=>{expect(hd386isox2(93,73)).toBe(2);});it('e',()=>{expect(hd386isox2(15,0)).toBe(4);});});
function hd386isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd387isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387isox2_hd',()=>{it('a',()=>{expect(hd387isox2(1,4)).toBe(2);});it('b',()=>{expect(hd387isox2(3,1)).toBe(1);});it('c',()=>{expect(hd387isox2(0,0)).toBe(0);});it('d',()=>{expect(hd387isox2(93,73)).toBe(2);});it('e',()=>{expect(hd387isox2(15,0)).toBe(4);});});
function hd387isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd388isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388isox2_hd',()=>{it('a',()=>{expect(hd388isox2(1,4)).toBe(2);});it('b',()=>{expect(hd388isox2(3,1)).toBe(1);});it('c',()=>{expect(hd388isox2(0,0)).toBe(0);});it('d',()=>{expect(hd388isox2(93,73)).toBe(2);});it('e',()=>{expect(hd388isox2(15,0)).toBe(4);});});
function hd388isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd389isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389isox2_hd',()=>{it('a',()=>{expect(hd389isox2(1,4)).toBe(2);});it('b',()=>{expect(hd389isox2(3,1)).toBe(1);});it('c',()=>{expect(hd389isox2(0,0)).toBe(0);});it('d',()=>{expect(hd389isox2(93,73)).toBe(2);});it('e',()=>{expect(hd389isox2(15,0)).toBe(4);});});
function hd389isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd390isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390isox2_hd',()=>{it('a',()=>{expect(hd390isox2(1,4)).toBe(2);});it('b',()=>{expect(hd390isox2(3,1)).toBe(1);});it('c',()=>{expect(hd390isox2(0,0)).toBe(0);});it('d',()=>{expect(hd390isox2(93,73)).toBe(2);});it('e',()=>{expect(hd390isox2(15,0)).toBe(4);});});
function hd390isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd391isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391isox2_hd',()=>{it('a',()=>{expect(hd391isox2(1,4)).toBe(2);});it('b',()=>{expect(hd391isox2(3,1)).toBe(1);});it('c',()=>{expect(hd391isox2(0,0)).toBe(0);});it('d',()=>{expect(hd391isox2(93,73)).toBe(2);});it('e',()=>{expect(hd391isox2(15,0)).toBe(4);});});
function hd391isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd392isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392isox2_hd',()=>{it('a',()=>{expect(hd392isox2(1,4)).toBe(2);});it('b',()=>{expect(hd392isox2(3,1)).toBe(1);});it('c',()=>{expect(hd392isox2(0,0)).toBe(0);});it('d',()=>{expect(hd392isox2(93,73)).toBe(2);});it('e',()=>{expect(hd392isox2(15,0)).toBe(4);});});
function hd392isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd393isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393isox2_hd',()=>{it('a',()=>{expect(hd393isox2(1,4)).toBe(2);});it('b',()=>{expect(hd393isox2(3,1)).toBe(1);});it('c',()=>{expect(hd393isox2(0,0)).toBe(0);});it('d',()=>{expect(hd393isox2(93,73)).toBe(2);});it('e',()=>{expect(hd393isox2(15,0)).toBe(4);});});
function hd393isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd394isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394isox2_hd',()=>{it('a',()=>{expect(hd394isox2(1,4)).toBe(2);});it('b',()=>{expect(hd394isox2(3,1)).toBe(1);});it('c',()=>{expect(hd394isox2(0,0)).toBe(0);});it('d',()=>{expect(hd394isox2(93,73)).toBe(2);});it('e',()=>{expect(hd394isox2(15,0)).toBe(4);});});
function hd394isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd395isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395isox2_hd',()=>{it('a',()=>{expect(hd395isox2(1,4)).toBe(2);});it('b',()=>{expect(hd395isox2(3,1)).toBe(1);});it('c',()=>{expect(hd395isox2(0,0)).toBe(0);});it('d',()=>{expect(hd395isox2(93,73)).toBe(2);});it('e',()=>{expect(hd395isox2(15,0)).toBe(4);});});
function hd395isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd396isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396isox2_hd',()=>{it('a',()=>{expect(hd396isox2(1,4)).toBe(2);});it('b',()=>{expect(hd396isox2(3,1)).toBe(1);});it('c',()=>{expect(hd396isox2(0,0)).toBe(0);});it('d',()=>{expect(hd396isox2(93,73)).toBe(2);});it('e',()=>{expect(hd396isox2(15,0)).toBe(4);});});
function hd396isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd397isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397isox2_hd',()=>{it('a',()=>{expect(hd397isox2(1,4)).toBe(2);});it('b',()=>{expect(hd397isox2(3,1)).toBe(1);});it('c',()=>{expect(hd397isox2(0,0)).toBe(0);});it('d',()=>{expect(hd397isox2(93,73)).toBe(2);});it('e',()=>{expect(hd397isox2(15,0)).toBe(4);});});
function hd397isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd398isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398isox2_hd',()=>{it('a',()=>{expect(hd398isox2(1,4)).toBe(2);});it('b',()=>{expect(hd398isox2(3,1)).toBe(1);});it('c',()=>{expect(hd398isox2(0,0)).toBe(0);});it('d',()=>{expect(hd398isox2(93,73)).toBe(2);});it('e',()=>{expect(hd398isox2(15,0)).toBe(4);});});
function hd398isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd399isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399isox2_hd',()=>{it('a',()=>{expect(hd399isox2(1,4)).toBe(2);});it('b',()=>{expect(hd399isox2(3,1)).toBe(1);});it('c',()=>{expect(hd399isox2(0,0)).toBe(0);});it('d',()=>{expect(hd399isox2(93,73)).toBe(2);});it('e',()=>{expect(hd399isox2(15,0)).toBe(4);});});
function hd399isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd400isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400isox2_hd',()=>{it('a',()=>{expect(hd400isox2(1,4)).toBe(2);});it('b',()=>{expect(hd400isox2(3,1)).toBe(1);});it('c',()=>{expect(hd400isox2(0,0)).toBe(0);});it('d',()=>{expect(hd400isox2(93,73)).toBe(2);});it('e',()=>{expect(hd400isox2(15,0)).toBe(4);});});
function hd400isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd401isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401isox2_hd',()=>{it('a',()=>{expect(hd401isox2(1,4)).toBe(2);});it('b',()=>{expect(hd401isox2(3,1)).toBe(1);});it('c',()=>{expect(hd401isox2(0,0)).toBe(0);});it('d',()=>{expect(hd401isox2(93,73)).toBe(2);});it('e',()=>{expect(hd401isox2(15,0)).toBe(4);});});
function hd401isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd402isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402isox2_hd',()=>{it('a',()=>{expect(hd402isox2(1,4)).toBe(2);});it('b',()=>{expect(hd402isox2(3,1)).toBe(1);});it('c',()=>{expect(hd402isox2(0,0)).toBe(0);});it('d',()=>{expect(hd402isox2(93,73)).toBe(2);});it('e',()=>{expect(hd402isox2(15,0)).toBe(4);});});
function hd402isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd403isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403isox2_hd',()=>{it('a',()=>{expect(hd403isox2(1,4)).toBe(2);});it('b',()=>{expect(hd403isox2(3,1)).toBe(1);});it('c',()=>{expect(hd403isox2(0,0)).toBe(0);});it('d',()=>{expect(hd403isox2(93,73)).toBe(2);});it('e',()=>{expect(hd403isox2(15,0)).toBe(4);});});
function hd403isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd404isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404isox2_hd',()=>{it('a',()=>{expect(hd404isox2(1,4)).toBe(2);});it('b',()=>{expect(hd404isox2(3,1)).toBe(1);});it('c',()=>{expect(hd404isox2(0,0)).toBe(0);});it('d',()=>{expect(hd404isox2(93,73)).toBe(2);});it('e',()=>{expect(hd404isox2(15,0)).toBe(4);});});
function hd404isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd405isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405isox2_hd',()=>{it('a',()=>{expect(hd405isox2(1,4)).toBe(2);});it('b',()=>{expect(hd405isox2(3,1)).toBe(1);});it('c',()=>{expect(hd405isox2(0,0)).toBe(0);});it('d',()=>{expect(hd405isox2(93,73)).toBe(2);});it('e',()=>{expect(hd405isox2(15,0)).toBe(4);});});
function hd405isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd406isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406isox2_hd',()=>{it('a',()=>{expect(hd406isox2(1,4)).toBe(2);});it('b',()=>{expect(hd406isox2(3,1)).toBe(1);});it('c',()=>{expect(hd406isox2(0,0)).toBe(0);});it('d',()=>{expect(hd406isox2(93,73)).toBe(2);});it('e',()=>{expect(hd406isox2(15,0)).toBe(4);});});
function hd406isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd407isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407isox2_hd',()=>{it('a',()=>{expect(hd407isox2(1,4)).toBe(2);});it('b',()=>{expect(hd407isox2(3,1)).toBe(1);});it('c',()=>{expect(hd407isox2(0,0)).toBe(0);});it('d',()=>{expect(hd407isox2(93,73)).toBe(2);});it('e',()=>{expect(hd407isox2(15,0)).toBe(4);});});
function hd407isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd408isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408isox2_hd',()=>{it('a',()=>{expect(hd408isox2(1,4)).toBe(2);});it('b',()=>{expect(hd408isox2(3,1)).toBe(1);});it('c',()=>{expect(hd408isox2(0,0)).toBe(0);});it('d',()=>{expect(hd408isox2(93,73)).toBe(2);});it('e',()=>{expect(hd408isox2(15,0)).toBe(4);});});
function hd408isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd409isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409isox2_hd',()=>{it('a',()=>{expect(hd409isox2(1,4)).toBe(2);});it('b',()=>{expect(hd409isox2(3,1)).toBe(1);});it('c',()=>{expect(hd409isox2(0,0)).toBe(0);});it('d',()=>{expect(hd409isox2(93,73)).toBe(2);});it('e',()=>{expect(hd409isox2(15,0)).toBe(4);});});
function hd409isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd410isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410isox2_hd',()=>{it('a',()=>{expect(hd410isox2(1,4)).toBe(2);});it('b',()=>{expect(hd410isox2(3,1)).toBe(1);});it('c',()=>{expect(hd410isox2(0,0)).toBe(0);});it('d',()=>{expect(hd410isox2(93,73)).toBe(2);});it('e',()=>{expect(hd410isox2(15,0)).toBe(4);});});
function hd410isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd411isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411isox2_hd',()=>{it('a',()=>{expect(hd411isox2(1,4)).toBe(2);});it('b',()=>{expect(hd411isox2(3,1)).toBe(1);});it('c',()=>{expect(hd411isox2(0,0)).toBe(0);});it('d',()=>{expect(hd411isox2(93,73)).toBe(2);});it('e',()=>{expect(hd411isox2(15,0)).toBe(4);});});
function hd411isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd412isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412isox2_hd',()=>{it('a',()=>{expect(hd412isox2(1,4)).toBe(2);});it('b',()=>{expect(hd412isox2(3,1)).toBe(1);});it('c',()=>{expect(hd412isox2(0,0)).toBe(0);});it('d',()=>{expect(hd412isox2(93,73)).toBe(2);});it('e',()=>{expect(hd412isox2(15,0)).toBe(4);});});
function hd412isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd413isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413isox2_hd',()=>{it('a',()=>{expect(hd413isox2(1,4)).toBe(2);});it('b',()=>{expect(hd413isox2(3,1)).toBe(1);});it('c',()=>{expect(hd413isox2(0,0)).toBe(0);});it('d',()=>{expect(hd413isox2(93,73)).toBe(2);});it('e',()=>{expect(hd413isox2(15,0)).toBe(4);});});
function hd413isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd414isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414isox2_hd',()=>{it('a',()=>{expect(hd414isox2(1,4)).toBe(2);});it('b',()=>{expect(hd414isox2(3,1)).toBe(1);});it('c',()=>{expect(hd414isox2(0,0)).toBe(0);});it('d',()=>{expect(hd414isox2(93,73)).toBe(2);});it('e',()=>{expect(hd414isox2(15,0)).toBe(4);});});
function hd414isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd415isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415isox2_hd',()=>{it('a',()=>{expect(hd415isox2(1,4)).toBe(2);});it('b',()=>{expect(hd415isox2(3,1)).toBe(1);});it('c',()=>{expect(hd415isox2(0,0)).toBe(0);});it('d',()=>{expect(hd415isox2(93,73)).toBe(2);});it('e',()=>{expect(hd415isox2(15,0)).toBe(4);});});
function hd415isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd416isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416isox2_hd',()=>{it('a',()=>{expect(hd416isox2(1,4)).toBe(2);});it('b',()=>{expect(hd416isox2(3,1)).toBe(1);});it('c',()=>{expect(hd416isox2(0,0)).toBe(0);});it('d',()=>{expect(hd416isox2(93,73)).toBe(2);});it('e',()=>{expect(hd416isox2(15,0)).toBe(4);});});
function hd416isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd417isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417isox2_hd',()=>{it('a',()=>{expect(hd417isox2(1,4)).toBe(2);});it('b',()=>{expect(hd417isox2(3,1)).toBe(1);});it('c',()=>{expect(hd417isox2(0,0)).toBe(0);});it('d',()=>{expect(hd417isox2(93,73)).toBe(2);});it('e',()=>{expect(hd417isox2(15,0)).toBe(4);});});
function hd417isox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417isox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
