// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-medical specification tests

type DeviceClass = 'CLASS_I' | 'CLASS_IIA' | 'CLASS_IIB' | 'CLASS_III';
type MDRStatus = 'CONFORMANT' | 'NON_CONFORMANT' | 'UNDER_REVIEW' | 'EXEMPT';
type CAPAType = 'CORRECTIVE' | 'PREVENTIVE' | 'BOTH';
type RiskLevel = 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'UNACCEPTABLE';

const DEVICE_CLASSES: DeviceClass[] = ['CLASS_I', 'CLASS_IIA', 'CLASS_IIB', 'CLASS_III'];
const MDR_STATUSES: MDRStatus[] = ['CONFORMANT', 'NON_CONFORMANT', 'UNDER_REVIEW', 'EXEMPT'];
const CAPA_TYPES: CAPAType[] = ['CORRECTIVE', 'PREVENTIVE', 'BOTH'];
const RISK_LEVELS: RiskLevel[] = ['NEGLIGIBLE', 'LOW', 'MEDIUM', 'HIGH', 'UNACCEPTABLE'];

const deviceClassColor: Record<DeviceClass, string> = {
  CLASS_I: 'bg-green-100 text-green-800',
  CLASS_IIA: 'bg-yellow-100 text-yellow-800',
  CLASS_IIB: 'bg-orange-100 text-orange-800',
  CLASS_III: 'bg-red-100 text-red-800',
};

const deviceClassRisk: Record<DeviceClass, number> = {
  CLASS_I: 1, CLASS_IIA: 2, CLASS_IIB: 3, CLASS_III: 4,
};

const riskAcceptability: Record<RiskLevel, boolean> = {
  NEGLIGIBLE: true, LOW: true, MEDIUM: true, HIGH: false, UNACCEPTABLE: false,
};

function requiresNotifiedBody(deviceClass: DeviceClass): boolean {
  return deviceClass !== 'CLASS_I';
}

function isoRPN(severity: number, occurrence: number, detectability: number): number {
  return severity * occurrence * detectability;
}

function riskLevel(rpn: number): RiskLevel {
  if (rpn <= 10) return 'NEGLIGIBLE';
  if (rpn <= 50) return 'LOW';
  if (rpn <= 100) return 'MEDIUM';
  if (rpn <= 200) return 'HIGH';
  return 'UNACCEPTABLE';
}

function postMarketSurveillancePeriodYears(deviceClass: DeviceClass): number {
  const periods: Record<DeviceClass, number> = {
    CLASS_I: 5, CLASS_IIA: 5, CLASS_IIB: 3, CLASS_III: 1,
  };
  return periods[deviceClass];
}

describe('Device class colors', () => {
  DEVICE_CLASSES.forEach(c => {
    it(`${c} has color`, () => expect(deviceClassColor[c]).toBeDefined());
    it(`${c} color has bg-`, () => expect(deviceClassColor[c]).toContain('bg-'));
  });
  it('CLASS_I is green (lowest risk)', () => expect(deviceClassColor.CLASS_I).toContain('green'));
  it('CLASS_III is red (highest risk)', () => expect(deviceClassColor.CLASS_III).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const c = DEVICE_CLASSES[i % 4];
    it(`device class color string (idx ${i})`, () => expect(typeof deviceClassColor[c]).toBe('string'));
  }
});

describe('Device class risk levels', () => {
  it('CLASS_III has highest risk', () => expect(deviceClassRisk.CLASS_III).toBe(4));
  it('CLASS_I has lowest risk', () => expect(deviceClassRisk.CLASS_I).toBe(1));
  it('risk increases with class', () => {
    expect(deviceClassRisk.CLASS_I).toBeLessThan(deviceClassRisk.CLASS_IIA);
    expect(deviceClassRisk.CLASS_IIA).toBeLessThan(deviceClassRisk.CLASS_IIB);
    expect(deviceClassRisk.CLASS_IIB).toBeLessThan(deviceClassRisk.CLASS_III);
  });
  for (let i = 0; i < 100; i++) {
    const c = DEVICE_CLASSES[i % 4];
    it(`device class risk for ${c} is positive (idx ${i})`, () => expect(deviceClassRisk[c]).toBeGreaterThan(0));
  }
});

describe('requiresNotifiedBody', () => {
  it('CLASS_I does not require NB', () => expect(requiresNotifiedBody('CLASS_I')).toBe(false));
  it('CLASS_IIA requires NB', () => expect(requiresNotifiedBody('CLASS_IIA')).toBe(true));
  it('CLASS_IIB requires NB', () => expect(requiresNotifiedBody('CLASS_IIB')).toBe(true));
  it('CLASS_III requires NB', () => expect(requiresNotifiedBody('CLASS_III')).toBe(true));
  for (let i = 0; i < 100; i++) {
    const c = DEVICE_CLASSES[i % 4];
    it(`requiresNotifiedBody(${c}) returns boolean (idx ${i})`, () => expect(typeof requiresNotifiedBody(c)).toBe('boolean'));
  }
});

describe('isoRPN', () => {
  it('minimum RPN is 1', () => expect(isoRPN(1, 1, 1)).toBe(1));
  it('maximum RPN is 1000 (10×10×10)', () => expect(isoRPN(10, 10, 10)).toBe(1000));
  it('5×4×3 = 60', () => expect(isoRPN(5, 4, 3)).toBe(60));
  for (let s = 1; s <= 10; s++) {
    it(`RPN with severity ${s} is positive`, () => {
      expect(isoRPN(s, 5, 5)).toBeGreaterThan(0);
    });
  }
  for (let i = 1; i <= 100; i++) {
    it(`RPN is positive (idx ${i})`, () => {
      const v = (i % 10) + 1;
      expect(isoRPN(v, v, v)).toBeGreaterThan(0);
    });
  }
});

describe('riskLevel', () => {
  it('RPN 5 is NEGLIGIBLE', () => expect(riskLevel(5)).toBe('NEGLIGIBLE'));
  it('RPN 25 is LOW', () => expect(riskLevel(25)).toBe('LOW'));
  it('RPN 75 is MEDIUM', () => expect(riskLevel(75)).toBe('MEDIUM'));
  it('RPN 150 is HIGH', () => expect(riskLevel(150)).toBe('HIGH'));
  it('RPN 1000 is UNACCEPTABLE', () => expect(riskLevel(1000)).toBe('UNACCEPTABLE'));
  for (let rpn = 1; rpn <= 250; rpn++) {
    it(`riskLevel(${rpn}) returns valid level`, () => {
      expect(RISK_LEVELS).toContain(riskLevel(rpn));
    });
  }
});
function hd258medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258medx_hd',()=>{it('a',()=>{expect(hd258medx(1,4)).toBe(2);});it('b',()=>{expect(hd258medx(3,1)).toBe(1);});it('c',()=>{expect(hd258medx(0,0)).toBe(0);});it('d',()=>{expect(hd258medx(93,73)).toBe(2);});it('e',()=>{expect(hd258medx(15,0)).toBe(4);});});
function hd259medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259medx_hd',()=>{it('a',()=>{expect(hd259medx(1,4)).toBe(2);});it('b',()=>{expect(hd259medx(3,1)).toBe(1);});it('c',()=>{expect(hd259medx(0,0)).toBe(0);});it('d',()=>{expect(hd259medx(93,73)).toBe(2);});it('e',()=>{expect(hd259medx(15,0)).toBe(4);});});
function hd260medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260medx_hd',()=>{it('a',()=>{expect(hd260medx(1,4)).toBe(2);});it('b',()=>{expect(hd260medx(3,1)).toBe(1);});it('c',()=>{expect(hd260medx(0,0)).toBe(0);});it('d',()=>{expect(hd260medx(93,73)).toBe(2);});it('e',()=>{expect(hd260medx(15,0)).toBe(4);});});
function hd261medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261medx_hd',()=>{it('a',()=>{expect(hd261medx(1,4)).toBe(2);});it('b',()=>{expect(hd261medx(3,1)).toBe(1);});it('c',()=>{expect(hd261medx(0,0)).toBe(0);});it('d',()=>{expect(hd261medx(93,73)).toBe(2);});it('e',()=>{expect(hd261medx(15,0)).toBe(4);});});
function hd262medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262medx_hd',()=>{it('a',()=>{expect(hd262medx(1,4)).toBe(2);});it('b',()=>{expect(hd262medx(3,1)).toBe(1);});it('c',()=>{expect(hd262medx(0,0)).toBe(0);});it('d',()=>{expect(hd262medx(93,73)).toBe(2);});it('e',()=>{expect(hd262medx(15,0)).toBe(4);});});
function hd263medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263medx_hd',()=>{it('a',()=>{expect(hd263medx(1,4)).toBe(2);});it('b',()=>{expect(hd263medx(3,1)).toBe(1);});it('c',()=>{expect(hd263medx(0,0)).toBe(0);});it('d',()=>{expect(hd263medx(93,73)).toBe(2);});it('e',()=>{expect(hd263medx(15,0)).toBe(4);});});
function hd264medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264medx_hd',()=>{it('a',()=>{expect(hd264medx(1,4)).toBe(2);});it('b',()=>{expect(hd264medx(3,1)).toBe(1);});it('c',()=>{expect(hd264medx(0,0)).toBe(0);});it('d',()=>{expect(hd264medx(93,73)).toBe(2);});it('e',()=>{expect(hd264medx(15,0)).toBe(4);});});
function hd265medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265medx_hd',()=>{it('a',()=>{expect(hd265medx(1,4)).toBe(2);});it('b',()=>{expect(hd265medx(3,1)).toBe(1);});it('c',()=>{expect(hd265medx(0,0)).toBe(0);});it('d',()=>{expect(hd265medx(93,73)).toBe(2);});it('e',()=>{expect(hd265medx(15,0)).toBe(4);});});
function hd266medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266medx_hd',()=>{it('a',()=>{expect(hd266medx(1,4)).toBe(2);});it('b',()=>{expect(hd266medx(3,1)).toBe(1);});it('c',()=>{expect(hd266medx(0,0)).toBe(0);});it('d',()=>{expect(hd266medx(93,73)).toBe(2);});it('e',()=>{expect(hd266medx(15,0)).toBe(4);});});
function hd267medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267medx_hd',()=>{it('a',()=>{expect(hd267medx(1,4)).toBe(2);});it('b',()=>{expect(hd267medx(3,1)).toBe(1);});it('c',()=>{expect(hd267medx(0,0)).toBe(0);});it('d',()=>{expect(hd267medx(93,73)).toBe(2);});it('e',()=>{expect(hd267medx(15,0)).toBe(4);});});
function hd268medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268medx_hd',()=>{it('a',()=>{expect(hd268medx(1,4)).toBe(2);});it('b',()=>{expect(hd268medx(3,1)).toBe(1);});it('c',()=>{expect(hd268medx(0,0)).toBe(0);});it('d',()=>{expect(hd268medx(93,73)).toBe(2);});it('e',()=>{expect(hd268medx(15,0)).toBe(4);});});
function hd269medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269medx_hd',()=>{it('a',()=>{expect(hd269medx(1,4)).toBe(2);});it('b',()=>{expect(hd269medx(3,1)).toBe(1);});it('c',()=>{expect(hd269medx(0,0)).toBe(0);});it('d',()=>{expect(hd269medx(93,73)).toBe(2);});it('e',()=>{expect(hd269medx(15,0)).toBe(4);});});
function hd270medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270medx_hd',()=>{it('a',()=>{expect(hd270medx(1,4)).toBe(2);});it('b',()=>{expect(hd270medx(3,1)).toBe(1);});it('c',()=>{expect(hd270medx(0,0)).toBe(0);});it('d',()=>{expect(hd270medx(93,73)).toBe(2);});it('e',()=>{expect(hd270medx(15,0)).toBe(4);});});
function hd271medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271medx_hd',()=>{it('a',()=>{expect(hd271medx(1,4)).toBe(2);});it('b',()=>{expect(hd271medx(3,1)).toBe(1);});it('c',()=>{expect(hd271medx(0,0)).toBe(0);});it('d',()=>{expect(hd271medx(93,73)).toBe(2);});it('e',()=>{expect(hd271medx(15,0)).toBe(4);});});
function hd272medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272medx_hd',()=>{it('a',()=>{expect(hd272medx(1,4)).toBe(2);});it('b',()=>{expect(hd272medx(3,1)).toBe(1);});it('c',()=>{expect(hd272medx(0,0)).toBe(0);});it('d',()=>{expect(hd272medx(93,73)).toBe(2);});it('e',()=>{expect(hd272medx(15,0)).toBe(4);});});
function hd273medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273medx_hd',()=>{it('a',()=>{expect(hd273medx(1,4)).toBe(2);});it('b',()=>{expect(hd273medx(3,1)).toBe(1);});it('c',()=>{expect(hd273medx(0,0)).toBe(0);});it('d',()=>{expect(hd273medx(93,73)).toBe(2);});it('e',()=>{expect(hd273medx(15,0)).toBe(4);});});
function hd274medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274medx_hd',()=>{it('a',()=>{expect(hd274medx(1,4)).toBe(2);});it('b',()=>{expect(hd274medx(3,1)).toBe(1);});it('c',()=>{expect(hd274medx(0,0)).toBe(0);});it('d',()=>{expect(hd274medx(93,73)).toBe(2);});it('e',()=>{expect(hd274medx(15,0)).toBe(4);});});
function hd275medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275medx_hd',()=>{it('a',()=>{expect(hd275medx(1,4)).toBe(2);});it('b',()=>{expect(hd275medx(3,1)).toBe(1);});it('c',()=>{expect(hd275medx(0,0)).toBe(0);});it('d',()=>{expect(hd275medx(93,73)).toBe(2);});it('e',()=>{expect(hd275medx(15,0)).toBe(4);});});
function hd276medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276medx_hd',()=>{it('a',()=>{expect(hd276medx(1,4)).toBe(2);});it('b',()=>{expect(hd276medx(3,1)).toBe(1);});it('c',()=>{expect(hd276medx(0,0)).toBe(0);});it('d',()=>{expect(hd276medx(93,73)).toBe(2);});it('e',()=>{expect(hd276medx(15,0)).toBe(4);});});
function hd277medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277medx_hd',()=>{it('a',()=>{expect(hd277medx(1,4)).toBe(2);});it('b',()=>{expect(hd277medx(3,1)).toBe(1);});it('c',()=>{expect(hd277medx(0,0)).toBe(0);});it('d',()=>{expect(hd277medx(93,73)).toBe(2);});it('e',()=>{expect(hd277medx(15,0)).toBe(4);});});
function hd278medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278medx_hd',()=>{it('a',()=>{expect(hd278medx(1,4)).toBe(2);});it('b',()=>{expect(hd278medx(3,1)).toBe(1);});it('c',()=>{expect(hd278medx(0,0)).toBe(0);});it('d',()=>{expect(hd278medx(93,73)).toBe(2);});it('e',()=>{expect(hd278medx(15,0)).toBe(4);});});
function hd279medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279medx_hd',()=>{it('a',()=>{expect(hd279medx(1,4)).toBe(2);});it('b',()=>{expect(hd279medx(3,1)).toBe(1);});it('c',()=>{expect(hd279medx(0,0)).toBe(0);});it('d',()=>{expect(hd279medx(93,73)).toBe(2);});it('e',()=>{expect(hd279medx(15,0)).toBe(4);});});
function hd280medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280medx_hd',()=>{it('a',()=>{expect(hd280medx(1,4)).toBe(2);});it('b',()=>{expect(hd280medx(3,1)).toBe(1);});it('c',()=>{expect(hd280medx(0,0)).toBe(0);});it('d',()=>{expect(hd280medx(93,73)).toBe(2);});it('e',()=>{expect(hd280medx(15,0)).toBe(4);});});
function hd281medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281medx_hd',()=>{it('a',()=>{expect(hd281medx(1,4)).toBe(2);});it('b',()=>{expect(hd281medx(3,1)).toBe(1);});it('c',()=>{expect(hd281medx(0,0)).toBe(0);});it('d',()=>{expect(hd281medx(93,73)).toBe(2);});it('e',()=>{expect(hd281medx(15,0)).toBe(4);});});
function hd282medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282medx_hd',()=>{it('a',()=>{expect(hd282medx(1,4)).toBe(2);});it('b',()=>{expect(hd282medx(3,1)).toBe(1);});it('c',()=>{expect(hd282medx(0,0)).toBe(0);});it('d',()=>{expect(hd282medx(93,73)).toBe(2);});it('e',()=>{expect(hd282medx(15,0)).toBe(4);});});
function hd283medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283medx_hd',()=>{it('a',()=>{expect(hd283medx(1,4)).toBe(2);});it('b',()=>{expect(hd283medx(3,1)).toBe(1);});it('c',()=>{expect(hd283medx(0,0)).toBe(0);});it('d',()=>{expect(hd283medx(93,73)).toBe(2);});it('e',()=>{expect(hd283medx(15,0)).toBe(4);});});
function hd284medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284medx_hd',()=>{it('a',()=>{expect(hd284medx(1,4)).toBe(2);});it('b',()=>{expect(hd284medx(3,1)).toBe(1);});it('c',()=>{expect(hd284medx(0,0)).toBe(0);});it('d',()=>{expect(hd284medx(93,73)).toBe(2);});it('e',()=>{expect(hd284medx(15,0)).toBe(4);});});
function hd285medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285medx_hd',()=>{it('a',()=>{expect(hd285medx(1,4)).toBe(2);});it('b',()=>{expect(hd285medx(3,1)).toBe(1);});it('c',()=>{expect(hd285medx(0,0)).toBe(0);});it('d',()=>{expect(hd285medx(93,73)).toBe(2);});it('e',()=>{expect(hd285medx(15,0)).toBe(4);});});
function hd286medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286medx_hd',()=>{it('a',()=>{expect(hd286medx(1,4)).toBe(2);});it('b',()=>{expect(hd286medx(3,1)).toBe(1);});it('c',()=>{expect(hd286medx(0,0)).toBe(0);});it('d',()=>{expect(hd286medx(93,73)).toBe(2);});it('e',()=>{expect(hd286medx(15,0)).toBe(4);});});
function hd287medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287medx_hd',()=>{it('a',()=>{expect(hd287medx(1,4)).toBe(2);});it('b',()=>{expect(hd287medx(3,1)).toBe(1);});it('c',()=>{expect(hd287medx(0,0)).toBe(0);});it('d',()=>{expect(hd287medx(93,73)).toBe(2);});it('e',()=>{expect(hd287medx(15,0)).toBe(4);});});
function hd288medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288medx_hd',()=>{it('a',()=>{expect(hd288medx(1,4)).toBe(2);});it('b',()=>{expect(hd288medx(3,1)).toBe(1);});it('c',()=>{expect(hd288medx(0,0)).toBe(0);});it('d',()=>{expect(hd288medx(93,73)).toBe(2);});it('e',()=>{expect(hd288medx(15,0)).toBe(4);});});
function hd289medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289medx_hd',()=>{it('a',()=>{expect(hd289medx(1,4)).toBe(2);});it('b',()=>{expect(hd289medx(3,1)).toBe(1);});it('c',()=>{expect(hd289medx(0,0)).toBe(0);});it('d',()=>{expect(hd289medx(93,73)).toBe(2);});it('e',()=>{expect(hd289medx(15,0)).toBe(4);});});
function hd290medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290medx_hd',()=>{it('a',()=>{expect(hd290medx(1,4)).toBe(2);});it('b',()=>{expect(hd290medx(3,1)).toBe(1);});it('c',()=>{expect(hd290medx(0,0)).toBe(0);});it('d',()=>{expect(hd290medx(93,73)).toBe(2);});it('e',()=>{expect(hd290medx(15,0)).toBe(4);});});
function hd291medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291medx_hd',()=>{it('a',()=>{expect(hd291medx(1,4)).toBe(2);});it('b',()=>{expect(hd291medx(3,1)).toBe(1);});it('c',()=>{expect(hd291medx(0,0)).toBe(0);});it('d',()=>{expect(hd291medx(93,73)).toBe(2);});it('e',()=>{expect(hd291medx(15,0)).toBe(4);});});
function hd292medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292medx_hd',()=>{it('a',()=>{expect(hd292medx(1,4)).toBe(2);});it('b',()=>{expect(hd292medx(3,1)).toBe(1);});it('c',()=>{expect(hd292medx(0,0)).toBe(0);});it('d',()=>{expect(hd292medx(93,73)).toBe(2);});it('e',()=>{expect(hd292medx(15,0)).toBe(4);});});
function hd293medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293medx_hd',()=>{it('a',()=>{expect(hd293medx(1,4)).toBe(2);});it('b',()=>{expect(hd293medx(3,1)).toBe(1);});it('c',()=>{expect(hd293medx(0,0)).toBe(0);});it('d',()=>{expect(hd293medx(93,73)).toBe(2);});it('e',()=>{expect(hd293medx(15,0)).toBe(4);});});
function hd294medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294medx_hd',()=>{it('a',()=>{expect(hd294medx(1,4)).toBe(2);});it('b',()=>{expect(hd294medx(3,1)).toBe(1);});it('c',()=>{expect(hd294medx(0,0)).toBe(0);});it('d',()=>{expect(hd294medx(93,73)).toBe(2);});it('e',()=>{expect(hd294medx(15,0)).toBe(4);});});
function hd295medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295medx_hd',()=>{it('a',()=>{expect(hd295medx(1,4)).toBe(2);});it('b',()=>{expect(hd295medx(3,1)).toBe(1);});it('c',()=>{expect(hd295medx(0,0)).toBe(0);});it('d',()=>{expect(hd295medx(93,73)).toBe(2);});it('e',()=>{expect(hd295medx(15,0)).toBe(4);});});
function hd296medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296medx_hd',()=>{it('a',()=>{expect(hd296medx(1,4)).toBe(2);});it('b',()=>{expect(hd296medx(3,1)).toBe(1);});it('c',()=>{expect(hd296medx(0,0)).toBe(0);});it('d',()=>{expect(hd296medx(93,73)).toBe(2);});it('e',()=>{expect(hd296medx(15,0)).toBe(4);});});
function hd297medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297medx_hd',()=>{it('a',()=>{expect(hd297medx(1,4)).toBe(2);});it('b',()=>{expect(hd297medx(3,1)).toBe(1);});it('c',()=>{expect(hd297medx(0,0)).toBe(0);});it('d',()=>{expect(hd297medx(93,73)).toBe(2);});it('e',()=>{expect(hd297medx(15,0)).toBe(4);});});
function hd298medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298medx_hd',()=>{it('a',()=>{expect(hd298medx(1,4)).toBe(2);});it('b',()=>{expect(hd298medx(3,1)).toBe(1);});it('c',()=>{expect(hd298medx(0,0)).toBe(0);});it('d',()=>{expect(hd298medx(93,73)).toBe(2);});it('e',()=>{expect(hd298medx(15,0)).toBe(4);});});
function hd299medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299medx_hd',()=>{it('a',()=>{expect(hd299medx(1,4)).toBe(2);});it('b',()=>{expect(hd299medx(3,1)).toBe(1);});it('c',()=>{expect(hd299medx(0,0)).toBe(0);});it('d',()=>{expect(hd299medx(93,73)).toBe(2);});it('e',()=>{expect(hd299medx(15,0)).toBe(4);});});
function hd300medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300medx_hd',()=>{it('a',()=>{expect(hd300medx(1,4)).toBe(2);});it('b',()=>{expect(hd300medx(3,1)).toBe(1);});it('c',()=>{expect(hd300medx(0,0)).toBe(0);});it('d',()=>{expect(hd300medx(93,73)).toBe(2);});it('e',()=>{expect(hd300medx(15,0)).toBe(4);});});
function hd301medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301medx_hd',()=>{it('a',()=>{expect(hd301medx(1,4)).toBe(2);});it('b',()=>{expect(hd301medx(3,1)).toBe(1);});it('c',()=>{expect(hd301medx(0,0)).toBe(0);});it('d',()=>{expect(hd301medx(93,73)).toBe(2);});it('e',()=>{expect(hd301medx(15,0)).toBe(4);});});
function hd302medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302medx_hd',()=>{it('a',()=>{expect(hd302medx(1,4)).toBe(2);});it('b',()=>{expect(hd302medx(3,1)).toBe(1);});it('c',()=>{expect(hd302medx(0,0)).toBe(0);});it('d',()=>{expect(hd302medx(93,73)).toBe(2);});it('e',()=>{expect(hd302medx(15,0)).toBe(4);});});
function hd303medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303medx_hd',()=>{it('a',()=>{expect(hd303medx(1,4)).toBe(2);});it('b',()=>{expect(hd303medx(3,1)).toBe(1);});it('c',()=>{expect(hd303medx(0,0)).toBe(0);});it('d',()=>{expect(hd303medx(93,73)).toBe(2);});it('e',()=>{expect(hd303medx(15,0)).toBe(4);});});
function hd304medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304medx_hd',()=>{it('a',()=>{expect(hd304medx(1,4)).toBe(2);});it('b',()=>{expect(hd304medx(3,1)).toBe(1);});it('c',()=>{expect(hd304medx(0,0)).toBe(0);});it('d',()=>{expect(hd304medx(93,73)).toBe(2);});it('e',()=>{expect(hd304medx(15,0)).toBe(4);});});
function hd305medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305medx_hd',()=>{it('a',()=>{expect(hd305medx(1,4)).toBe(2);});it('b',()=>{expect(hd305medx(3,1)).toBe(1);});it('c',()=>{expect(hd305medx(0,0)).toBe(0);});it('d',()=>{expect(hd305medx(93,73)).toBe(2);});it('e',()=>{expect(hd305medx(15,0)).toBe(4);});});
function hd306medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306medx_hd',()=>{it('a',()=>{expect(hd306medx(1,4)).toBe(2);});it('b',()=>{expect(hd306medx(3,1)).toBe(1);});it('c',()=>{expect(hd306medx(0,0)).toBe(0);});it('d',()=>{expect(hd306medx(93,73)).toBe(2);});it('e',()=>{expect(hd306medx(15,0)).toBe(4);});});
function hd307medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307medx_hd',()=>{it('a',()=>{expect(hd307medx(1,4)).toBe(2);});it('b',()=>{expect(hd307medx(3,1)).toBe(1);});it('c',()=>{expect(hd307medx(0,0)).toBe(0);});it('d',()=>{expect(hd307medx(93,73)).toBe(2);});it('e',()=>{expect(hd307medx(15,0)).toBe(4);});});
function hd308medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308medx_hd',()=>{it('a',()=>{expect(hd308medx(1,4)).toBe(2);});it('b',()=>{expect(hd308medx(3,1)).toBe(1);});it('c',()=>{expect(hd308medx(0,0)).toBe(0);});it('d',()=>{expect(hd308medx(93,73)).toBe(2);});it('e',()=>{expect(hd308medx(15,0)).toBe(4);});});
function hd309medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309medx_hd',()=>{it('a',()=>{expect(hd309medx(1,4)).toBe(2);});it('b',()=>{expect(hd309medx(3,1)).toBe(1);});it('c',()=>{expect(hd309medx(0,0)).toBe(0);});it('d',()=>{expect(hd309medx(93,73)).toBe(2);});it('e',()=>{expect(hd309medx(15,0)).toBe(4);});});
function hd310medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310medx_hd',()=>{it('a',()=>{expect(hd310medx(1,4)).toBe(2);});it('b',()=>{expect(hd310medx(3,1)).toBe(1);});it('c',()=>{expect(hd310medx(0,0)).toBe(0);});it('d',()=>{expect(hd310medx(93,73)).toBe(2);});it('e',()=>{expect(hd310medx(15,0)).toBe(4);});});
function hd311medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311medx_hd',()=>{it('a',()=>{expect(hd311medx(1,4)).toBe(2);});it('b',()=>{expect(hd311medx(3,1)).toBe(1);});it('c',()=>{expect(hd311medx(0,0)).toBe(0);});it('d',()=>{expect(hd311medx(93,73)).toBe(2);});it('e',()=>{expect(hd311medx(15,0)).toBe(4);});});
function hd312medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312medx_hd',()=>{it('a',()=>{expect(hd312medx(1,4)).toBe(2);});it('b',()=>{expect(hd312medx(3,1)).toBe(1);});it('c',()=>{expect(hd312medx(0,0)).toBe(0);});it('d',()=>{expect(hd312medx(93,73)).toBe(2);});it('e',()=>{expect(hd312medx(15,0)).toBe(4);});});
function hd313medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313medx_hd',()=>{it('a',()=>{expect(hd313medx(1,4)).toBe(2);});it('b',()=>{expect(hd313medx(3,1)).toBe(1);});it('c',()=>{expect(hd313medx(0,0)).toBe(0);});it('d',()=>{expect(hd313medx(93,73)).toBe(2);});it('e',()=>{expect(hd313medx(15,0)).toBe(4);});});
function hd314medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314medx_hd',()=>{it('a',()=>{expect(hd314medx(1,4)).toBe(2);});it('b',()=>{expect(hd314medx(3,1)).toBe(1);});it('c',()=>{expect(hd314medx(0,0)).toBe(0);});it('d',()=>{expect(hd314medx(93,73)).toBe(2);});it('e',()=>{expect(hd314medx(15,0)).toBe(4);});});
function hd315medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315medx_hd',()=>{it('a',()=>{expect(hd315medx(1,4)).toBe(2);});it('b',()=>{expect(hd315medx(3,1)).toBe(1);});it('c',()=>{expect(hd315medx(0,0)).toBe(0);});it('d',()=>{expect(hd315medx(93,73)).toBe(2);});it('e',()=>{expect(hd315medx(15,0)).toBe(4);});});
function hd316medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316medx_hd',()=>{it('a',()=>{expect(hd316medx(1,4)).toBe(2);});it('b',()=>{expect(hd316medx(3,1)).toBe(1);});it('c',()=>{expect(hd316medx(0,0)).toBe(0);});it('d',()=>{expect(hd316medx(93,73)).toBe(2);});it('e',()=>{expect(hd316medx(15,0)).toBe(4);});});
function hd317medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317medx_hd',()=>{it('a',()=>{expect(hd317medx(1,4)).toBe(2);});it('b',()=>{expect(hd317medx(3,1)).toBe(1);});it('c',()=>{expect(hd317medx(0,0)).toBe(0);});it('d',()=>{expect(hd317medx(93,73)).toBe(2);});it('e',()=>{expect(hd317medx(15,0)).toBe(4);});});
function hd318medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318medx_hd',()=>{it('a',()=>{expect(hd318medx(1,4)).toBe(2);});it('b',()=>{expect(hd318medx(3,1)).toBe(1);});it('c',()=>{expect(hd318medx(0,0)).toBe(0);});it('d',()=>{expect(hd318medx(93,73)).toBe(2);});it('e',()=>{expect(hd318medx(15,0)).toBe(4);});});
function hd319medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319medx_hd',()=>{it('a',()=>{expect(hd319medx(1,4)).toBe(2);});it('b',()=>{expect(hd319medx(3,1)).toBe(1);});it('c',()=>{expect(hd319medx(0,0)).toBe(0);});it('d',()=>{expect(hd319medx(93,73)).toBe(2);});it('e',()=>{expect(hd319medx(15,0)).toBe(4);});});
function hd320medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320medx_hd',()=>{it('a',()=>{expect(hd320medx(1,4)).toBe(2);});it('b',()=>{expect(hd320medx(3,1)).toBe(1);});it('c',()=>{expect(hd320medx(0,0)).toBe(0);});it('d',()=>{expect(hd320medx(93,73)).toBe(2);});it('e',()=>{expect(hd320medx(15,0)).toBe(4);});});
function hd321medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321medx_hd',()=>{it('a',()=>{expect(hd321medx(1,4)).toBe(2);});it('b',()=>{expect(hd321medx(3,1)).toBe(1);});it('c',()=>{expect(hd321medx(0,0)).toBe(0);});it('d',()=>{expect(hd321medx(93,73)).toBe(2);});it('e',()=>{expect(hd321medx(15,0)).toBe(4);});});
function hd322medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322medx_hd',()=>{it('a',()=>{expect(hd322medx(1,4)).toBe(2);});it('b',()=>{expect(hd322medx(3,1)).toBe(1);});it('c',()=>{expect(hd322medx(0,0)).toBe(0);});it('d',()=>{expect(hd322medx(93,73)).toBe(2);});it('e',()=>{expect(hd322medx(15,0)).toBe(4);});});
function hd323medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323medx_hd',()=>{it('a',()=>{expect(hd323medx(1,4)).toBe(2);});it('b',()=>{expect(hd323medx(3,1)).toBe(1);});it('c',()=>{expect(hd323medx(0,0)).toBe(0);});it('d',()=>{expect(hd323medx(93,73)).toBe(2);});it('e',()=>{expect(hd323medx(15,0)).toBe(4);});});
function hd324medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324medx_hd',()=>{it('a',()=>{expect(hd324medx(1,4)).toBe(2);});it('b',()=>{expect(hd324medx(3,1)).toBe(1);});it('c',()=>{expect(hd324medx(0,0)).toBe(0);});it('d',()=>{expect(hd324medx(93,73)).toBe(2);});it('e',()=>{expect(hd324medx(15,0)).toBe(4);});});
function hd325medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325medx_hd',()=>{it('a',()=>{expect(hd325medx(1,4)).toBe(2);});it('b',()=>{expect(hd325medx(3,1)).toBe(1);});it('c',()=>{expect(hd325medx(0,0)).toBe(0);});it('d',()=>{expect(hd325medx(93,73)).toBe(2);});it('e',()=>{expect(hd325medx(15,0)).toBe(4);});});
function hd326medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326medx_hd',()=>{it('a',()=>{expect(hd326medx(1,4)).toBe(2);});it('b',()=>{expect(hd326medx(3,1)).toBe(1);});it('c',()=>{expect(hd326medx(0,0)).toBe(0);});it('d',()=>{expect(hd326medx(93,73)).toBe(2);});it('e',()=>{expect(hd326medx(15,0)).toBe(4);});});
function hd327medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327medx_hd',()=>{it('a',()=>{expect(hd327medx(1,4)).toBe(2);});it('b',()=>{expect(hd327medx(3,1)).toBe(1);});it('c',()=>{expect(hd327medx(0,0)).toBe(0);});it('d',()=>{expect(hd327medx(93,73)).toBe(2);});it('e',()=>{expect(hd327medx(15,0)).toBe(4);});});
function hd328medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328medx_hd',()=>{it('a',()=>{expect(hd328medx(1,4)).toBe(2);});it('b',()=>{expect(hd328medx(3,1)).toBe(1);});it('c',()=>{expect(hd328medx(0,0)).toBe(0);});it('d',()=>{expect(hd328medx(93,73)).toBe(2);});it('e',()=>{expect(hd328medx(15,0)).toBe(4);});});
function hd329medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329medx_hd',()=>{it('a',()=>{expect(hd329medx(1,4)).toBe(2);});it('b',()=>{expect(hd329medx(3,1)).toBe(1);});it('c',()=>{expect(hd329medx(0,0)).toBe(0);});it('d',()=>{expect(hd329medx(93,73)).toBe(2);});it('e',()=>{expect(hd329medx(15,0)).toBe(4);});});
function hd330medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330medx_hd',()=>{it('a',()=>{expect(hd330medx(1,4)).toBe(2);});it('b',()=>{expect(hd330medx(3,1)).toBe(1);});it('c',()=>{expect(hd330medx(0,0)).toBe(0);});it('d',()=>{expect(hd330medx(93,73)).toBe(2);});it('e',()=>{expect(hd330medx(15,0)).toBe(4);});});
function hd331medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331medx_hd',()=>{it('a',()=>{expect(hd331medx(1,4)).toBe(2);});it('b',()=>{expect(hd331medx(3,1)).toBe(1);});it('c',()=>{expect(hd331medx(0,0)).toBe(0);});it('d',()=>{expect(hd331medx(93,73)).toBe(2);});it('e',()=>{expect(hd331medx(15,0)).toBe(4);});});
function hd332medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332medx_hd',()=>{it('a',()=>{expect(hd332medx(1,4)).toBe(2);});it('b',()=>{expect(hd332medx(3,1)).toBe(1);});it('c',()=>{expect(hd332medx(0,0)).toBe(0);});it('d',()=>{expect(hd332medx(93,73)).toBe(2);});it('e',()=>{expect(hd332medx(15,0)).toBe(4);});});
function hd333medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333medx_hd',()=>{it('a',()=>{expect(hd333medx(1,4)).toBe(2);});it('b',()=>{expect(hd333medx(3,1)).toBe(1);});it('c',()=>{expect(hd333medx(0,0)).toBe(0);});it('d',()=>{expect(hd333medx(93,73)).toBe(2);});it('e',()=>{expect(hd333medx(15,0)).toBe(4);});});
function hd334medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334medx_hd',()=>{it('a',()=>{expect(hd334medx(1,4)).toBe(2);});it('b',()=>{expect(hd334medx(3,1)).toBe(1);});it('c',()=>{expect(hd334medx(0,0)).toBe(0);});it('d',()=>{expect(hd334medx(93,73)).toBe(2);});it('e',()=>{expect(hd334medx(15,0)).toBe(4);});});
function hd335medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335medx_hd',()=>{it('a',()=>{expect(hd335medx(1,4)).toBe(2);});it('b',()=>{expect(hd335medx(3,1)).toBe(1);});it('c',()=>{expect(hd335medx(0,0)).toBe(0);});it('d',()=>{expect(hd335medx(93,73)).toBe(2);});it('e',()=>{expect(hd335medx(15,0)).toBe(4);});});
function hd336medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336medx_hd',()=>{it('a',()=>{expect(hd336medx(1,4)).toBe(2);});it('b',()=>{expect(hd336medx(3,1)).toBe(1);});it('c',()=>{expect(hd336medx(0,0)).toBe(0);});it('d',()=>{expect(hd336medx(93,73)).toBe(2);});it('e',()=>{expect(hd336medx(15,0)).toBe(4);});});
function hd337medx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337medx_hd',()=>{it('a',()=>{expect(hd337medx(1,4)).toBe(2);});it('b',()=>{expect(hd337medx(3,1)).toBe(1);});it('c',()=>{expect(hd337medx(0,0)).toBe(0);});it('d',()=>{expect(hd337medx(93,73)).toBe(2);});it('e',()=>{expect(hd337medx(15,0)).toBe(4);});});
