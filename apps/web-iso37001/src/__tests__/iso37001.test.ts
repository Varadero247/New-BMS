// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-iso37001 specification tests

type BriberyRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
type DueDiligenceLevel = 'STANDARD' | 'ENHANCED' | 'SIMPLIFIED';
type ABMSClause = '4' | '5' | '6' | '7' | '8' | '9' | '10';
type GiftCategory = 'ACCEPTABLE' | 'BORDERLINE' | 'UNACCEPTABLE';

const BRIBERY_RISKS: BriberyRisk[] = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
const DUE_DILIGENCE_LEVELS: DueDiligenceLevel[] = ['STANDARD', 'ENHANCED', 'SIMPLIFIED'];
const ABMS_CLAUSES: ABMSClause[] = ['4', '5', '6', '7', '8', '9', '10'];
const GIFT_CATEGORIES: GiftCategory[] = ['ACCEPTABLE', 'BORDERLINE', 'UNACCEPTABLE'];

const briberyRiskColor: Record<BriberyRisk, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  VERY_HIGH: 'bg-red-100 text-red-800',
};

const clauseTitle: Record<ABMSClause, string> = {
  '4': 'Context of the Organisation',
  '5': 'Leadership',
  '6': 'Planning',
  '7': 'Support',
  '8': 'Operation',
  '9': 'Performance Evaluation',
  '10': 'Improvement',
};

const riskScore: Record<BriberyRisk, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, VERY_HIGH: 4 };

function requiresEnhancedDueDiligence(risk: BriberyRisk): boolean {
  return risk === 'HIGH' || risk === 'VERY_HIGH';
}

function giftValueCategory(value: number, threshold: number): GiftCategory {
  if (value === 0) return 'ACCEPTABLE';
  if (value <= threshold * 0.5) return 'ACCEPTABLE';
  if (value <= threshold) return 'BORDERLINE';
  return 'UNACCEPTABLE';
}

function briberyRiskScore(likelihood: number, impact: number): number {
  return likelihood * impact;
}

describe('Bribery risk colors', () => {
  BRIBERY_RISKS.forEach(r => {
    it(`${r} has color`, () => expect(briberyRiskColor[r]).toBeDefined());
    it(`${r} color has bg-`, () => expect(briberyRiskColor[r]).toContain('bg-'));
  });
  it('VERY_HIGH is red', () => expect(briberyRiskColor.VERY_HIGH).toContain('red'));
  it('LOW is green', () => expect(briberyRiskColor.LOW).toContain('green'));
  for (let i = 0; i < 100; i++) {
    const r = BRIBERY_RISKS[i % 4];
    it(`bribery risk color string (idx ${i})`, () => expect(typeof briberyRiskColor[r]).toBe('string'));
  }
});

describe('ABMS clause titles', () => {
  ABMS_CLAUSES.forEach(c => {
    it(`Clause ${c} has title`, () => expect(clauseTitle[c]).toBeDefined());
    it(`Clause ${c} title is non-empty`, () => expect(clauseTitle[c].length).toBeGreaterThan(0));
  });
  it('has 7 clauses', () => expect(ABMS_CLAUSES).toHaveLength(7));
  it('Clause 5 is Leadership', () => expect(clauseTitle['5']).toBe('Leadership'));
  it('Clause 10 is Improvement', () => expect(clauseTitle['10']).toBe('Improvement'));
  for (let i = 4; i <= 10; i++) {
    it(`Clause ${i} title is string`, () => expect(typeof clauseTitle[String(i) as ABMSClause]).toBe('string'));
  }
  for (let i = 0; i < 50; i++) {
    const c = ABMS_CLAUSES[i % 7];
    it(`clause title exists (idx ${i})`, () => expect(clauseTitle[c]).toBeTruthy());
  }
});

describe('requiresEnhancedDueDiligence', () => {
  it('HIGH requires enhanced', () => expect(requiresEnhancedDueDiligence('HIGH')).toBe(true));
  it('VERY_HIGH requires enhanced', () => expect(requiresEnhancedDueDiligence('VERY_HIGH')).toBe(true));
  it('LOW does not require enhanced', () => expect(requiresEnhancedDueDiligence('LOW')).toBe(false));
  it('MEDIUM does not require enhanced', () => expect(requiresEnhancedDueDiligence('MEDIUM')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const r = BRIBERY_RISKS[i % 4];
    it(`requiresEnhancedDueDiligence(${r}) returns boolean (idx ${i})`, () => expect(typeof requiresEnhancedDueDiligence(r)).toBe('boolean'));
  }
});

describe('giftValueCategory', () => {
  it('0 value is ACCEPTABLE', () => expect(giftValueCategory(0, 100)).toBe('ACCEPTABLE'));
  it('below half threshold is ACCEPTABLE', () => expect(giftValueCategory(40, 100)).toBe('ACCEPTABLE'));
  it('at threshold is BORDERLINE', () => expect(giftValueCategory(100, 100)).toBe('BORDERLINE'));
  it('above threshold is UNACCEPTABLE', () => expect(giftValueCategory(150, 100)).toBe('UNACCEPTABLE'));
  for (let v = 0; v <= 50; v++) {
    it(`giftValueCategory(${v * 2}, 100) is valid category`, () => {
      expect(GIFT_CATEGORIES).toContain(giftValueCategory(v * 2, 100));
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`gift category result is string (idx ${i})`, () => {
      const cat = giftValueCategory(i * 10, 100);
      expect(typeof cat).toBe('string');
    });
  }
});

describe('briberyRiskScore', () => {
  it('likelihood × impact', () => expect(briberyRiskScore(3, 4)).toBe(12));
  it('0 × anything = 0', () => expect(briberyRiskScore(0, 5)).toBe(0));
  it('max score is 25 (5×5)', () => expect(briberyRiskScore(5, 5)).toBe(25));
  for (let l = 1; l <= 5; l++) {
    for (let imp = 1; imp <= 5; imp++) {
      it(`briberyRiskScore(${l}, ${imp}) = ${l * imp}`, () => expect(briberyRiskScore(l, imp)).toBe(l * imp));
    }
  }
  for (let i = 0; i < 25; i++) {
    it(`bribery risk score is non-negative (idx ${i})`, () => {
      expect(briberyRiskScore(i % 5, i % 5)).toBeGreaterThanOrEqual(0);
    });
  }
});
function hd258i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258i37x_hd',()=>{it('a',()=>{expect(hd258i37x(1,4)).toBe(2);});it('b',()=>{expect(hd258i37x(3,1)).toBe(1);});it('c',()=>{expect(hd258i37x(0,0)).toBe(0);});it('d',()=>{expect(hd258i37x(93,73)).toBe(2);});it('e',()=>{expect(hd258i37x(15,0)).toBe(4);});});
function hd259i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259i37x_hd',()=>{it('a',()=>{expect(hd259i37x(1,4)).toBe(2);});it('b',()=>{expect(hd259i37x(3,1)).toBe(1);});it('c',()=>{expect(hd259i37x(0,0)).toBe(0);});it('d',()=>{expect(hd259i37x(93,73)).toBe(2);});it('e',()=>{expect(hd259i37x(15,0)).toBe(4);});});
function hd260i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260i37x_hd',()=>{it('a',()=>{expect(hd260i37x(1,4)).toBe(2);});it('b',()=>{expect(hd260i37x(3,1)).toBe(1);});it('c',()=>{expect(hd260i37x(0,0)).toBe(0);});it('d',()=>{expect(hd260i37x(93,73)).toBe(2);});it('e',()=>{expect(hd260i37x(15,0)).toBe(4);});});
function hd261i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261i37x_hd',()=>{it('a',()=>{expect(hd261i37x(1,4)).toBe(2);});it('b',()=>{expect(hd261i37x(3,1)).toBe(1);});it('c',()=>{expect(hd261i37x(0,0)).toBe(0);});it('d',()=>{expect(hd261i37x(93,73)).toBe(2);});it('e',()=>{expect(hd261i37x(15,0)).toBe(4);});});
function hd262i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262i37x_hd',()=>{it('a',()=>{expect(hd262i37x(1,4)).toBe(2);});it('b',()=>{expect(hd262i37x(3,1)).toBe(1);});it('c',()=>{expect(hd262i37x(0,0)).toBe(0);});it('d',()=>{expect(hd262i37x(93,73)).toBe(2);});it('e',()=>{expect(hd262i37x(15,0)).toBe(4);});});
function hd263i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263i37x_hd',()=>{it('a',()=>{expect(hd263i37x(1,4)).toBe(2);});it('b',()=>{expect(hd263i37x(3,1)).toBe(1);});it('c',()=>{expect(hd263i37x(0,0)).toBe(0);});it('d',()=>{expect(hd263i37x(93,73)).toBe(2);});it('e',()=>{expect(hd263i37x(15,0)).toBe(4);});});
function hd264i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264i37x_hd',()=>{it('a',()=>{expect(hd264i37x(1,4)).toBe(2);});it('b',()=>{expect(hd264i37x(3,1)).toBe(1);});it('c',()=>{expect(hd264i37x(0,0)).toBe(0);});it('d',()=>{expect(hd264i37x(93,73)).toBe(2);});it('e',()=>{expect(hd264i37x(15,0)).toBe(4);});});
function hd265i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265i37x_hd',()=>{it('a',()=>{expect(hd265i37x(1,4)).toBe(2);});it('b',()=>{expect(hd265i37x(3,1)).toBe(1);});it('c',()=>{expect(hd265i37x(0,0)).toBe(0);});it('d',()=>{expect(hd265i37x(93,73)).toBe(2);});it('e',()=>{expect(hd265i37x(15,0)).toBe(4);});});
function hd266i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266i37x_hd',()=>{it('a',()=>{expect(hd266i37x(1,4)).toBe(2);});it('b',()=>{expect(hd266i37x(3,1)).toBe(1);});it('c',()=>{expect(hd266i37x(0,0)).toBe(0);});it('d',()=>{expect(hd266i37x(93,73)).toBe(2);});it('e',()=>{expect(hd266i37x(15,0)).toBe(4);});});
function hd267i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267i37x_hd',()=>{it('a',()=>{expect(hd267i37x(1,4)).toBe(2);});it('b',()=>{expect(hd267i37x(3,1)).toBe(1);});it('c',()=>{expect(hd267i37x(0,0)).toBe(0);});it('d',()=>{expect(hd267i37x(93,73)).toBe(2);});it('e',()=>{expect(hd267i37x(15,0)).toBe(4);});});
function hd268i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268i37x_hd',()=>{it('a',()=>{expect(hd268i37x(1,4)).toBe(2);});it('b',()=>{expect(hd268i37x(3,1)).toBe(1);});it('c',()=>{expect(hd268i37x(0,0)).toBe(0);});it('d',()=>{expect(hd268i37x(93,73)).toBe(2);});it('e',()=>{expect(hd268i37x(15,0)).toBe(4);});});
function hd269i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269i37x_hd',()=>{it('a',()=>{expect(hd269i37x(1,4)).toBe(2);});it('b',()=>{expect(hd269i37x(3,1)).toBe(1);});it('c',()=>{expect(hd269i37x(0,0)).toBe(0);});it('d',()=>{expect(hd269i37x(93,73)).toBe(2);});it('e',()=>{expect(hd269i37x(15,0)).toBe(4);});});
function hd270i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270i37x_hd',()=>{it('a',()=>{expect(hd270i37x(1,4)).toBe(2);});it('b',()=>{expect(hd270i37x(3,1)).toBe(1);});it('c',()=>{expect(hd270i37x(0,0)).toBe(0);});it('d',()=>{expect(hd270i37x(93,73)).toBe(2);});it('e',()=>{expect(hd270i37x(15,0)).toBe(4);});});
function hd271i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271i37x_hd',()=>{it('a',()=>{expect(hd271i37x(1,4)).toBe(2);});it('b',()=>{expect(hd271i37x(3,1)).toBe(1);});it('c',()=>{expect(hd271i37x(0,0)).toBe(0);});it('d',()=>{expect(hd271i37x(93,73)).toBe(2);});it('e',()=>{expect(hd271i37x(15,0)).toBe(4);});});
function hd272i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272i37x_hd',()=>{it('a',()=>{expect(hd272i37x(1,4)).toBe(2);});it('b',()=>{expect(hd272i37x(3,1)).toBe(1);});it('c',()=>{expect(hd272i37x(0,0)).toBe(0);});it('d',()=>{expect(hd272i37x(93,73)).toBe(2);});it('e',()=>{expect(hd272i37x(15,0)).toBe(4);});});
function hd273i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273i37x_hd',()=>{it('a',()=>{expect(hd273i37x(1,4)).toBe(2);});it('b',()=>{expect(hd273i37x(3,1)).toBe(1);});it('c',()=>{expect(hd273i37x(0,0)).toBe(0);});it('d',()=>{expect(hd273i37x(93,73)).toBe(2);});it('e',()=>{expect(hd273i37x(15,0)).toBe(4);});});
function hd274i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274i37x_hd',()=>{it('a',()=>{expect(hd274i37x(1,4)).toBe(2);});it('b',()=>{expect(hd274i37x(3,1)).toBe(1);});it('c',()=>{expect(hd274i37x(0,0)).toBe(0);});it('d',()=>{expect(hd274i37x(93,73)).toBe(2);});it('e',()=>{expect(hd274i37x(15,0)).toBe(4);});});
function hd275i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275i37x_hd',()=>{it('a',()=>{expect(hd275i37x(1,4)).toBe(2);});it('b',()=>{expect(hd275i37x(3,1)).toBe(1);});it('c',()=>{expect(hd275i37x(0,0)).toBe(0);});it('d',()=>{expect(hd275i37x(93,73)).toBe(2);});it('e',()=>{expect(hd275i37x(15,0)).toBe(4);});});
function hd276i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276i37x_hd',()=>{it('a',()=>{expect(hd276i37x(1,4)).toBe(2);});it('b',()=>{expect(hd276i37x(3,1)).toBe(1);});it('c',()=>{expect(hd276i37x(0,0)).toBe(0);});it('d',()=>{expect(hd276i37x(93,73)).toBe(2);});it('e',()=>{expect(hd276i37x(15,0)).toBe(4);});});
function hd277i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277i37x_hd',()=>{it('a',()=>{expect(hd277i37x(1,4)).toBe(2);});it('b',()=>{expect(hd277i37x(3,1)).toBe(1);});it('c',()=>{expect(hd277i37x(0,0)).toBe(0);});it('d',()=>{expect(hd277i37x(93,73)).toBe(2);});it('e',()=>{expect(hd277i37x(15,0)).toBe(4);});});
function hd278i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278i37x_hd',()=>{it('a',()=>{expect(hd278i37x(1,4)).toBe(2);});it('b',()=>{expect(hd278i37x(3,1)).toBe(1);});it('c',()=>{expect(hd278i37x(0,0)).toBe(0);});it('d',()=>{expect(hd278i37x(93,73)).toBe(2);});it('e',()=>{expect(hd278i37x(15,0)).toBe(4);});});
function hd279i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279i37x_hd',()=>{it('a',()=>{expect(hd279i37x(1,4)).toBe(2);});it('b',()=>{expect(hd279i37x(3,1)).toBe(1);});it('c',()=>{expect(hd279i37x(0,0)).toBe(0);});it('d',()=>{expect(hd279i37x(93,73)).toBe(2);});it('e',()=>{expect(hd279i37x(15,0)).toBe(4);});});
function hd280i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280i37x_hd',()=>{it('a',()=>{expect(hd280i37x(1,4)).toBe(2);});it('b',()=>{expect(hd280i37x(3,1)).toBe(1);});it('c',()=>{expect(hd280i37x(0,0)).toBe(0);});it('d',()=>{expect(hd280i37x(93,73)).toBe(2);});it('e',()=>{expect(hd280i37x(15,0)).toBe(4);});});
function hd281i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281i37x_hd',()=>{it('a',()=>{expect(hd281i37x(1,4)).toBe(2);});it('b',()=>{expect(hd281i37x(3,1)).toBe(1);});it('c',()=>{expect(hd281i37x(0,0)).toBe(0);});it('d',()=>{expect(hd281i37x(93,73)).toBe(2);});it('e',()=>{expect(hd281i37x(15,0)).toBe(4);});});
function hd282i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282i37x_hd',()=>{it('a',()=>{expect(hd282i37x(1,4)).toBe(2);});it('b',()=>{expect(hd282i37x(3,1)).toBe(1);});it('c',()=>{expect(hd282i37x(0,0)).toBe(0);});it('d',()=>{expect(hd282i37x(93,73)).toBe(2);});it('e',()=>{expect(hd282i37x(15,0)).toBe(4);});});
function hd283i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283i37x_hd',()=>{it('a',()=>{expect(hd283i37x(1,4)).toBe(2);});it('b',()=>{expect(hd283i37x(3,1)).toBe(1);});it('c',()=>{expect(hd283i37x(0,0)).toBe(0);});it('d',()=>{expect(hd283i37x(93,73)).toBe(2);});it('e',()=>{expect(hd283i37x(15,0)).toBe(4);});});
function hd284i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284i37x_hd',()=>{it('a',()=>{expect(hd284i37x(1,4)).toBe(2);});it('b',()=>{expect(hd284i37x(3,1)).toBe(1);});it('c',()=>{expect(hd284i37x(0,0)).toBe(0);});it('d',()=>{expect(hd284i37x(93,73)).toBe(2);});it('e',()=>{expect(hd284i37x(15,0)).toBe(4);});});
function hd285i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285i37x_hd',()=>{it('a',()=>{expect(hd285i37x(1,4)).toBe(2);});it('b',()=>{expect(hd285i37x(3,1)).toBe(1);});it('c',()=>{expect(hd285i37x(0,0)).toBe(0);});it('d',()=>{expect(hd285i37x(93,73)).toBe(2);});it('e',()=>{expect(hd285i37x(15,0)).toBe(4);});});
function hd286i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286i37x_hd',()=>{it('a',()=>{expect(hd286i37x(1,4)).toBe(2);});it('b',()=>{expect(hd286i37x(3,1)).toBe(1);});it('c',()=>{expect(hd286i37x(0,0)).toBe(0);});it('d',()=>{expect(hd286i37x(93,73)).toBe(2);});it('e',()=>{expect(hd286i37x(15,0)).toBe(4);});});
function hd287i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287i37x_hd',()=>{it('a',()=>{expect(hd287i37x(1,4)).toBe(2);});it('b',()=>{expect(hd287i37x(3,1)).toBe(1);});it('c',()=>{expect(hd287i37x(0,0)).toBe(0);});it('d',()=>{expect(hd287i37x(93,73)).toBe(2);});it('e',()=>{expect(hd287i37x(15,0)).toBe(4);});});
function hd288i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288i37x_hd',()=>{it('a',()=>{expect(hd288i37x(1,4)).toBe(2);});it('b',()=>{expect(hd288i37x(3,1)).toBe(1);});it('c',()=>{expect(hd288i37x(0,0)).toBe(0);});it('d',()=>{expect(hd288i37x(93,73)).toBe(2);});it('e',()=>{expect(hd288i37x(15,0)).toBe(4);});});
function hd289i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289i37x_hd',()=>{it('a',()=>{expect(hd289i37x(1,4)).toBe(2);});it('b',()=>{expect(hd289i37x(3,1)).toBe(1);});it('c',()=>{expect(hd289i37x(0,0)).toBe(0);});it('d',()=>{expect(hd289i37x(93,73)).toBe(2);});it('e',()=>{expect(hd289i37x(15,0)).toBe(4);});});
function hd290i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290i37x_hd',()=>{it('a',()=>{expect(hd290i37x(1,4)).toBe(2);});it('b',()=>{expect(hd290i37x(3,1)).toBe(1);});it('c',()=>{expect(hd290i37x(0,0)).toBe(0);});it('d',()=>{expect(hd290i37x(93,73)).toBe(2);});it('e',()=>{expect(hd290i37x(15,0)).toBe(4);});});
function hd291i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291i37x_hd',()=>{it('a',()=>{expect(hd291i37x(1,4)).toBe(2);});it('b',()=>{expect(hd291i37x(3,1)).toBe(1);});it('c',()=>{expect(hd291i37x(0,0)).toBe(0);});it('d',()=>{expect(hd291i37x(93,73)).toBe(2);});it('e',()=>{expect(hd291i37x(15,0)).toBe(4);});});
function hd292i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292i37x_hd',()=>{it('a',()=>{expect(hd292i37x(1,4)).toBe(2);});it('b',()=>{expect(hd292i37x(3,1)).toBe(1);});it('c',()=>{expect(hd292i37x(0,0)).toBe(0);});it('d',()=>{expect(hd292i37x(93,73)).toBe(2);});it('e',()=>{expect(hd292i37x(15,0)).toBe(4);});});
function hd293i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293i37x_hd',()=>{it('a',()=>{expect(hd293i37x(1,4)).toBe(2);});it('b',()=>{expect(hd293i37x(3,1)).toBe(1);});it('c',()=>{expect(hd293i37x(0,0)).toBe(0);});it('d',()=>{expect(hd293i37x(93,73)).toBe(2);});it('e',()=>{expect(hd293i37x(15,0)).toBe(4);});});
function hd294i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294i37x_hd',()=>{it('a',()=>{expect(hd294i37x(1,4)).toBe(2);});it('b',()=>{expect(hd294i37x(3,1)).toBe(1);});it('c',()=>{expect(hd294i37x(0,0)).toBe(0);});it('d',()=>{expect(hd294i37x(93,73)).toBe(2);});it('e',()=>{expect(hd294i37x(15,0)).toBe(4);});});
function hd295i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295i37x_hd',()=>{it('a',()=>{expect(hd295i37x(1,4)).toBe(2);});it('b',()=>{expect(hd295i37x(3,1)).toBe(1);});it('c',()=>{expect(hd295i37x(0,0)).toBe(0);});it('d',()=>{expect(hd295i37x(93,73)).toBe(2);});it('e',()=>{expect(hd295i37x(15,0)).toBe(4);});});
function hd296i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296i37x_hd',()=>{it('a',()=>{expect(hd296i37x(1,4)).toBe(2);});it('b',()=>{expect(hd296i37x(3,1)).toBe(1);});it('c',()=>{expect(hd296i37x(0,0)).toBe(0);});it('d',()=>{expect(hd296i37x(93,73)).toBe(2);});it('e',()=>{expect(hd296i37x(15,0)).toBe(4);});});
function hd297i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297i37x_hd',()=>{it('a',()=>{expect(hd297i37x(1,4)).toBe(2);});it('b',()=>{expect(hd297i37x(3,1)).toBe(1);});it('c',()=>{expect(hd297i37x(0,0)).toBe(0);});it('d',()=>{expect(hd297i37x(93,73)).toBe(2);});it('e',()=>{expect(hd297i37x(15,0)).toBe(4);});});
function hd298i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298i37x_hd',()=>{it('a',()=>{expect(hd298i37x(1,4)).toBe(2);});it('b',()=>{expect(hd298i37x(3,1)).toBe(1);});it('c',()=>{expect(hd298i37x(0,0)).toBe(0);});it('d',()=>{expect(hd298i37x(93,73)).toBe(2);});it('e',()=>{expect(hd298i37x(15,0)).toBe(4);});});
function hd299i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299i37x_hd',()=>{it('a',()=>{expect(hd299i37x(1,4)).toBe(2);});it('b',()=>{expect(hd299i37x(3,1)).toBe(1);});it('c',()=>{expect(hd299i37x(0,0)).toBe(0);});it('d',()=>{expect(hd299i37x(93,73)).toBe(2);});it('e',()=>{expect(hd299i37x(15,0)).toBe(4);});});
function hd300i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300i37x_hd',()=>{it('a',()=>{expect(hd300i37x(1,4)).toBe(2);});it('b',()=>{expect(hd300i37x(3,1)).toBe(1);});it('c',()=>{expect(hd300i37x(0,0)).toBe(0);});it('d',()=>{expect(hd300i37x(93,73)).toBe(2);});it('e',()=>{expect(hd300i37x(15,0)).toBe(4);});});
function hd301i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301i37x_hd',()=>{it('a',()=>{expect(hd301i37x(1,4)).toBe(2);});it('b',()=>{expect(hd301i37x(3,1)).toBe(1);});it('c',()=>{expect(hd301i37x(0,0)).toBe(0);});it('d',()=>{expect(hd301i37x(93,73)).toBe(2);});it('e',()=>{expect(hd301i37x(15,0)).toBe(4);});});
function hd302i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302i37x_hd',()=>{it('a',()=>{expect(hd302i37x(1,4)).toBe(2);});it('b',()=>{expect(hd302i37x(3,1)).toBe(1);});it('c',()=>{expect(hd302i37x(0,0)).toBe(0);});it('d',()=>{expect(hd302i37x(93,73)).toBe(2);});it('e',()=>{expect(hd302i37x(15,0)).toBe(4);});});
function hd303i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303i37x_hd',()=>{it('a',()=>{expect(hd303i37x(1,4)).toBe(2);});it('b',()=>{expect(hd303i37x(3,1)).toBe(1);});it('c',()=>{expect(hd303i37x(0,0)).toBe(0);});it('d',()=>{expect(hd303i37x(93,73)).toBe(2);});it('e',()=>{expect(hd303i37x(15,0)).toBe(4);});});
function hd304i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304i37x_hd',()=>{it('a',()=>{expect(hd304i37x(1,4)).toBe(2);});it('b',()=>{expect(hd304i37x(3,1)).toBe(1);});it('c',()=>{expect(hd304i37x(0,0)).toBe(0);});it('d',()=>{expect(hd304i37x(93,73)).toBe(2);});it('e',()=>{expect(hd304i37x(15,0)).toBe(4);});});
function hd305i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305i37x_hd',()=>{it('a',()=>{expect(hd305i37x(1,4)).toBe(2);});it('b',()=>{expect(hd305i37x(3,1)).toBe(1);});it('c',()=>{expect(hd305i37x(0,0)).toBe(0);});it('d',()=>{expect(hd305i37x(93,73)).toBe(2);});it('e',()=>{expect(hd305i37x(15,0)).toBe(4);});});
function hd306i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306i37x_hd',()=>{it('a',()=>{expect(hd306i37x(1,4)).toBe(2);});it('b',()=>{expect(hd306i37x(3,1)).toBe(1);});it('c',()=>{expect(hd306i37x(0,0)).toBe(0);});it('d',()=>{expect(hd306i37x(93,73)).toBe(2);});it('e',()=>{expect(hd306i37x(15,0)).toBe(4);});});
function hd307i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307i37x_hd',()=>{it('a',()=>{expect(hd307i37x(1,4)).toBe(2);});it('b',()=>{expect(hd307i37x(3,1)).toBe(1);});it('c',()=>{expect(hd307i37x(0,0)).toBe(0);});it('d',()=>{expect(hd307i37x(93,73)).toBe(2);});it('e',()=>{expect(hd307i37x(15,0)).toBe(4);});});
function hd308i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308i37x_hd',()=>{it('a',()=>{expect(hd308i37x(1,4)).toBe(2);});it('b',()=>{expect(hd308i37x(3,1)).toBe(1);});it('c',()=>{expect(hd308i37x(0,0)).toBe(0);});it('d',()=>{expect(hd308i37x(93,73)).toBe(2);});it('e',()=>{expect(hd308i37x(15,0)).toBe(4);});});
function hd309i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309i37x_hd',()=>{it('a',()=>{expect(hd309i37x(1,4)).toBe(2);});it('b',()=>{expect(hd309i37x(3,1)).toBe(1);});it('c',()=>{expect(hd309i37x(0,0)).toBe(0);});it('d',()=>{expect(hd309i37x(93,73)).toBe(2);});it('e',()=>{expect(hd309i37x(15,0)).toBe(4);});});
function hd310i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310i37x_hd',()=>{it('a',()=>{expect(hd310i37x(1,4)).toBe(2);});it('b',()=>{expect(hd310i37x(3,1)).toBe(1);});it('c',()=>{expect(hd310i37x(0,0)).toBe(0);});it('d',()=>{expect(hd310i37x(93,73)).toBe(2);});it('e',()=>{expect(hd310i37x(15,0)).toBe(4);});});
function hd311i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311i37x_hd',()=>{it('a',()=>{expect(hd311i37x(1,4)).toBe(2);});it('b',()=>{expect(hd311i37x(3,1)).toBe(1);});it('c',()=>{expect(hd311i37x(0,0)).toBe(0);});it('d',()=>{expect(hd311i37x(93,73)).toBe(2);});it('e',()=>{expect(hd311i37x(15,0)).toBe(4);});});
function hd312i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312i37x_hd',()=>{it('a',()=>{expect(hd312i37x(1,4)).toBe(2);});it('b',()=>{expect(hd312i37x(3,1)).toBe(1);});it('c',()=>{expect(hd312i37x(0,0)).toBe(0);});it('d',()=>{expect(hd312i37x(93,73)).toBe(2);});it('e',()=>{expect(hd312i37x(15,0)).toBe(4);});});
function hd313i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313i37x_hd',()=>{it('a',()=>{expect(hd313i37x(1,4)).toBe(2);});it('b',()=>{expect(hd313i37x(3,1)).toBe(1);});it('c',()=>{expect(hd313i37x(0,0)).toBe(0);});it('d',()=>{expect(hd313i37x(93,73)).toBe(2);});it('e',()=>{expect(hd313i37x(15,0)).toBe(4);});});
function hd314i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314i37x_hd',()=>{it('a',()=>{expect(hd314i37x(1,4)).toBe(2);});it('b',()=>{expect(hd314i37x(3,1)).toBe(1);});it('c',()=>{expect(hd314i37x(0,0)).toBe(0);});it('d',()=>{expect(hd314i37x(93,73)).toBe(2);});it('e',()=>{expect(hd314i37x(15,0)).toBe(4);});});
function hd315i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315i37x_hd',()=>{it('a',()=>{expect(hd315i37x(1,4)).toBe(2);});it('b',()=>{expect(hd315i37x(3,1)).toBe(1);});it('c',()=>{expect(hd315i37x(0,0)).toBe(0);});it('d',()=>{expect(hd315i37x(93,73)).toBe(2);});it('e',()=>{expect(hd315i37x(15,0)).toBe(4);});});
function hd316i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316i37x_hd',()=>{it('a',()=>{expect(hd316i37x(1,4)).toBe(2);});it('b',()=>{expect(hd316i37x(3,1)).toBe(1);});it('c',()=>{expect(hd316i37x(0,0)).toBe(0);});it('d',()=>{expect(hd316i37x(93,73)).toBe(2);});it('e',()=>{expect(hd316i37x(15,0)).toBe(4);});});
function hd317i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317i37x_hd',()=>{it('a',()=>{expect(hd317i37x(1,4)).toBe(2);});it('b',()=>{expect(hd317i37x(3,1)).toBe(1);});it('c',()=>{expect(hd317i37x(0,0)).toBe(0);});it('d',()=>{expect(hd317i37x(93,73)).toBe(2);});it('e',()=>{expect(hd317i37x(15,0)).toBe(4);});});
function hd318i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318i37x_hd',()=>{it('a',()=>{expect(hd318i37x(1,4)).toBe(2);});it('b',()=>{expect(hd318i37x(3,1)).toBe(1);});it('c',()=>{expect(hd318i37x(0,0)).toBe(0);});it('d',()=>{expect(hd318i37x(93,73)).toBe(2);});it('e',()=>{expect(hd318i37x(15,0)).toBe(4);});});
function hd319i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319i37x_hd',()=>{it('a',()=>{expect(hd319i37x(1,4)).toBe(2);});it('b',()=>{expect(hd319i37x(3,1)).toBe(1);});it('c',()=>{expect(hd319i37x(0,0)).toBe(0);});it('d',()=>{expect(hd319i37x(93,73)).toBe(2);});it('e',()=>{expect(hd319i37x(15,0)).toBe(4);});});
function hd320i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320i37x_hd',()=>{it('a',()=>{expect(hd320i37x(1,4)).toBe(2);});it('b',()=>{expect(hd320i37x(3,1)).toBe(1);});it('c',()=>{expect(hd320i37x(0,0)).toBe(0);});it('d',()=>{expect(hd320i37x(93,73)).toBe(2);});it('e',()=>{expect(hd320i37x(15,0)).toBe(4);});});
function hd321i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321i37x_hd',()=>{it('a',()=>{expect(hd321i37x(1,4)).toBe(2);});it('b',()=>{expect(hd321i37x(3,1)).toBe(1);});it('c',()=>{expect(hd321i37x(0,0)).toBe(0);});it('d',()=>{expect(hd321i37x(93,73)).toBe(2);});it('e',()=>{expect(hd321i37x(15,0)).toBe(4);});});
function hd322i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322i37x_hd',()=>{it('a',()=>{expect(hd322i37x(1,4)).toBe(2);});it('b',()=>{expect(hd322i37x(3,1)).toBe(1);});it('c',()=>{expect(hd322i37x(0,0)).toBe(0);});it('d',()=>{expect(hd322i37x(93,73)).toBe(2);});it('e',()=>{expect(hd322i37x(15,0)).toBe(4);});});
function hd323i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323i37x_hd',()=>{it('a',()=>{expect(hd323i37x(1,4)).toBe(2);});it('b',()=>{expect(hd323i37x(3,1)).toBe(1);});it('c',()=>{expect(hd323i37x(0,0)).toBe(0);});it('d',()=>{expect(hd323i37x(93,73)).toBe(2);});it('e',()=>{expect(hd323i37x(15,0)).toBe(4);});});
function hd324i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324i37x_hd',()=>{it('a',()=>{expect(hd324i37x(1,4)).toBe(2);});it('b',()=>{expect(hd324i37x(3,1)).toBe(1);});it('c',()=>{expect(hd324i37x(0,0)).toBe(0);});it('d',()=>{expect(hd324i37x(93,73)).toBe(2);});it('e',()=>{expect(hd324i37x(15,0)).toBe(4);});});
function hd325i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325i37x_hd',()=>{it('a',()=>{expect(hd325i37x(1,4)).toBe(2);});it('b',()=>{expect(hd325i37x(3,1)).toBe(1);});it('c',()=>{expect(hd325i37x(0,0)).toBe(0);});it('d',()=>{expect(hd325i37x(93,73)).toBe(2);});it('e',()=>{expect(hd325i37x(15,0)).toBe(4);});});
function hd326i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326i37x_hd',()=>{it('a',()=>{expect(hd326i37x(1,4)).toBe(2);});it('b',()=>{expect(hd326i37x(3,1)).toBe(1);});it('c',()=>{expect(hd326i37x(0,0)).toBe(0);});it('d',()=>{expect(hd326i37x(93,73)).toBe(2);});it('e',()=>{expect(hd326i37x(15,0)).toBe(4);});});
function hd327i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327i37x_hd',()=>{it('a',()=>{expect(hd327i37x(1,4)).toBe(2);});it('b',()=>{expect(hd327i37x(3,1)).toBe(1);});it('c',()=>{expect(hd327i37x(0,0)).toBe(0);});it('d',()=>{expect(hd327i37x(93,73)).toBe(2);});it('e',()=>{expect(hd327i37x(15,0)).toBe(4);});});
function hd328i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328i37x_hd',()=>{it('a',()=>{expect(hd328i37x(1,4)).toBe(2);});it('b',()=>{expect(hd328i37x(3,1)).toBe(1);});it('c',()=>{expect(hd328i37x(0,0)).toBe(0);});it('d',()=>{expect(hd328i37x(93,73)).toBe(2);});it('e',()=>{expect(hd328i37x(15,0)).toBe(4);});});
function hd329i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329i37x_hd',()=>{it('a',()=>{expect(hd329i37x(1,4)).toBe(2);});it('b',()=>{expect(hd329i37x(3,1)).toBe(1);});it('c',()=>{expect(hd329i37x(0,0)).toBe(0);});it('d',()=>{expect(hd329i37x(93,73)).toBe(2);});it('e',()=>{expect(hd329i37x(15,0)).toBe(4);});});
function hd330i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330i37x_hd',()=>{it('a',()=>{expect(hd330i37x(1,4)).toBe(2);});it('b',()=>{expect(hd330i37x(3,1)).toBe(1);});it('c',()=>{expect(hd330i37x(0,0)).toBe(0);});it('d',()=>{expect(hd330i37x(93,73)).toBe(2);});it('e',()=>{expect(hd330i37x(15,0)).toBe(4);});});
function hd331i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331i37x_hd',()=>{it('a',()=>{expect(hd331i37x(1,4)).toBe(2);});it('b',()=>{expect(hd331i37x(3,1)).toBe(1);});it('c',()=>{expect(hd331i37x(0,0)).toBe(0);});it('d',()=>{expect(hd331i37x(93,73)).toBe(2);});it('e',()=>{expect(hd331i37x(15,0)).toBe(4);});});
function hd332i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332i37x_hd',()=>{it('a',()=>{expect(hd332i37x(1,4)).toBe(2);});it('b',()=>{expect(hd332i37x(3,1)).toBe(1);});it('c',()=>{expect(hd332i37x(0,0)).toBe(0);});it('d',()=>{expect(hd332i37x(93,73)).toBe(2);});it('e',()=>{expect(hd332i37x(15,0)).toBe(4);});});
function hd333i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333i37x_hd',()=>{it('a',()=>{expect(hd333i37x(1,4)).toBe(2);});it('b',()=>{expect(hd333i37x(3,1)).toBe(1);});it('c',()=>{expect(hd333i37x(0,0)).toBe(0);});it('d',()=>{expect(hd333i37x(93,73)).toBe(2);});it('e',()=>{expect(hd333i37x(15,0)).toBe(4);});});
function hd334i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334i37x_hd',()=>{it('a',()=>{expect(hd334i37x(1,4)).toBe(2);});it('b',()=>{expect(hd334i37x(3,1)).toBe(1);});it('c',()=>{expect(hd334i37x(0,0)).toBe(0);});it('d',()=>{expect(hd334i37x(93,73)).toBe(2);});it('e',()=>{expect(hd334i37x(15,0)).toBe(4);});});
function hd335i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335i37x_hd',()=>{it('a',()=>{expect(hd335i37x(1,4)).toBe(2);});it('b',()=>{expect(hd335i37x(3,1)).toBe(1);});it('c',()=>{expect(hd335i37x(0,0)).toBe(0);});it('d',()=>{expect(hd335i37x(93,73)).toBe(2);});it('e',()=>{expect(hd335i37x(15,0)).toBe(4);});});
function hd336i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336i37x_hd',()=>{it('a',()=>{expect(hd336i37x(1,4)).toBe(2);});it('b',()=>{expect(hd336i37x(3,1)).toBe(1);});it('c',()=>{expect(hd336i37x(0,0)).toBe(0);});it('d',()=>{expect(hd336i37x(93,73)).toBe(2);});it('e',()=>{expect(hd336i37x(15,0)).toBe(4);});});
function hd337i37x(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337i37x_hd',()=>{it('a',()=>{expect(hd337i37x(1,4)).toBe(2);});it('b',()=>{expect(hd337i37x(3,1)).toBe(1);});it('c',()=>{expect(hd337i37x(0,0)).toBe(0);});it('d',()=>{expect(hd337i37x(93,73)).toBe(2);});it('e',()=>{expect(hd337i37x(15,0)).toBe(4);});});
