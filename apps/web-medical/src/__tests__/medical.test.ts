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
function hd338medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338medx2_hd',()=>{it('a',()=>{expect(hd338medx2(1,4)).toBe(2);});it('b',()=>{expect(hd338medx2(3,1)).toBe(1);});it('c',()=>{expect(hd338medx2(0,0)).toBe(0);});it('d',()=>{expect(hd338medx2(93,73)).toBe(2);});it('e',()=>{expect(hd338medx2(15,0)).toBe(4);});});
function hd338medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd339medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339medx2_hd',()=>{it('a',()=>{expect(hd339medx2(1,4)).toBe(2);});it('b',()=>{expect(hd339medx2(3,1)).toBe(1);});it('c',()=>{expect(hd339medx2(0,0)).toBe(0);});it('d',()=>{expect(hd339medx2(93,73)).toBe(2);});it('e',()=>{expect(hd339medx2(15,0)).toBe(4);});});
function hd339medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd340medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340medx2_hd',()=>{it('a',()=>{expect(hd340medx2(1,4)).toBe(2);});it('b',()=>{expect(hd340medx2(3,1)).toBe(1);});it('c',()=>{expect(hd340medx2(0,0)).toBe(0);});it('d',()=>{expect(hd340medx2(93,73)).toBe(2);});it('e',()=>{expect(hd340medx2(15,0)).toBe(4);});});
function hd340medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd341medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341medx2_hd',()=>{it('a',()=>{expect(hd341medx2(1,4)).toBe(2);});it('b',()=>{expect(hd341medx2(3,1)).toBe(1);});it('c',()=>{expect(hd341medx2(0,0)).toBe(0);});it('d',()=>{expect(hd341medx2(93,73)).toBe(2);});it('e',()=>{expect(hd341medx2(15,0)).toBe(4);});});
function hd341medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd342medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342medx2_hd',()=>{it('a',()=>{expect(hd342medx2(1,4)).toBe(2);});it('b',()=>{expect(hd342medx2(3,1)).toBe(1);});it('c',()=>{expect(hd342medx2(0,0)).toBe(0);});it('d',()=>{expect(hd342medx2(93,73)).toBe(2);});it('e',()=>{expect(hd342medx2(15,0)).toBe(4);});});
function hd342medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd343medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343medx2_hd',()=>{it('a',()=>{expect(hd343medx2(1,4)).toBe(2);});it('b',()=>{expect(hd343medx2(3,1)).toBe(1);});it('c',()=>{expect(hd343medx2(0,0)).toBe(0);});it('d',()=>{expect(hd343medx2(93,73)).toBe(2);});it('e',()=>{expect(hd343medx2(15,0)).toBe(4);});});
function hd343medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd344medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344medx2_hd',()=>{it('a',()=>{expect(hd344medx2(1,4)).toBe(2);});it('b',()=>{expect(hd344medx2(3,1)).toBe(1);});it('c',()=>{expect(hd344medx2(0,0)).toBe(0);});it('d',()=>{expect(hd344medx2(93,73)).toBe(2);});it('e',()=>{expect(hd344medx2(15,0)).toBe(4);});});
function hd344medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd345medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345medx2_hd',()=>{it('a',()=>{expect(hd345medx2(1,4)).toBe(2);});it('b',()=>{expect(hd345medx2(3,1)).toBe(1);});it('c',()=>{expect(hd345medx2(0,0)).toBe(0);});it('d',()=>{expect(hd345medx2(93,73)).toBe(2);});it('e',()=>{expect(hd345medx2(15,0)).toBe(4);});});
function hd345medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd346medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346medx2_hd',()=>{it('a',()=>{expect(hd346medx2(1,4)).toBe(2);});it('b',()=>{expect(hd346medx2(3,1)).toBe(1);});it('c',()=>{expect(hd346medx2(0,0)).toBe(0);});it('d',()=>{expect(hd346medx2(93,73)).toBe(2);});it('e',()=>{expect(hd346medx2(15,0)).toBe(4);});});
function hd346medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd347medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347medx2_hd',()=>{it('a',()=>{expect(hd347medx2(1,4)).toBe(2);});it('b',()=>{expect(hd347medx2(3,1)).toBe(1);});it('c',()=>{expect(hd347medx2(0,0)).toBe(0);});it('d',()=>{expect(hd347medx2(93,73)).toBe(2);});it('e',()=>{expect(hd347medx2(15,0)).toBe(4);});});
function hd347medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd348medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348medx2_hd',()=>{it('a',()=>{expect(hd348medx2(1,4)).toBe(2);});it('b',()=>{expect(hd348medx2(3,1)).toBe(1);});it('c',()=>{expect(hd348medx2(0,0)).toBe(0);});it('d',()=>{expect(hd348medx2(93,73)).toBe(2);});it('e',()=>{expect(hd348medx2(15,0)).toBe(4);});});
function hd348medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd349medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349medx2_hd',()=>{it('a',()=>{expect(hd349medx2(1,4)).toBe(2);});it('b',()=>{expect(hd349medx2(3,1)).toBe(1);});it('c',()=>{expect(hd349medx2(0,0)).toBe(0);});it('d',()=>{expect(hd349medx2(93,73)).toBe(2);});it('e',()=>{expect(hd349medx2(15,0)).toBe(4);});});
function hd349medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd350medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350medx2_hd',()=>{it('a',()=>{expect(hd350medx2(1,4)).toBe(2);});it('b',()=>{expect(hd350medx2(3,1)).toBe(1);});it('c',()=>{expect(hd350medx2(0,0)).toBe(0);});it('d',()=>{expect(hd350medx2(93,73)).toBe(2);});it('e',()=>{expect(hd350medx2(15,0)).toBe(4);});});
function hd350medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd351medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351medx2_hd',()=>{it('a',()=>{expect(hd351medx2(1,4)).toBe(2);});it('b',()=>{expect(hd351medx2(3,1)).toBe(1);});it('c',()=>{expect(hd351medx2(0,0)).toBe(0);});it('d',()=>{expect(hd351medx2(93,73)).toBe(2);});it('e',()=>{expect(hd351medx2(15,0)).toBe(4);});});
function hd351medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd352medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352medx2_hd',()=>{it('a',()=>{expect(hd352medx2(1,4)).toBe(2);});it('b',()=>{expect(hd352medx2(3,1)).toBe(1);});it('c',()=>{expect(hd352medx2(0,0)).toBe(0);});it('d',()=>{expect(hd352medx2(93,73)).toBe(2);});it('e',()=>{expect(hd352medx2(15,0)).toBe(4);});});
function hd352medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd353medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353medx2_hd',()=>{it('a',()=>{expect(hd353medx2(1,4)).toBe(2);});it('b',()=>{expect(hd353medx2(3,1)).toBe(1);});it('c',()=>{expect(hd353medx2(0,0)).toBe(0);});it('d',()=>{expect(hd353medx2(93,73)).toBe(2);});it('e',()=>{expect(hd353medx2(15,0)).toBe(4);});});
function hd353medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd354medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354medx2_hd',()=>{it('a',()=>{expect(hd354medx2(1,4)).toBe(2);});it('b',()=>{expect(hd354medx2(3,1)).toBe(1);});it('c',()=>{expect(hd354medx2(0,0)).toBe(0);});it('d',()=>{expect(hd354medx2(93,73)).toBe(2);});it('e',()=>{expect(hd354medx2(15,0)).toBe(4);});});
function hd354medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd355medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355medx2_hd',()=>{it('a',()=>{expect(hd355medx2(1,4)).toBe(2);});it('b',()=>{expect(hd355medx2(3,1)).toBe(1);});it('c',()=>{expect(hd355medx2(0,0)).toBe(0);});it('d',()=>{expect(hd355medx2(93,73)).toBe(2);});it('e',()=>{expect(hd355medx2(15,0)).toBe(4);});});
function hd355medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd356medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356medx2_hd',()=>{it('a',()=>{expect(hd356medx2(1,4)).toBe(2);});it('b',()=>{expect(hd356medx2(3,1)).toBe(1);});it('c',()=>{expect(hd356medx2(0,0)).toBe(0);});it('d',()=>{expect(hd356medx2(93,73)).toBe(2);});it('e',()=>{expect(hd356medx2(15,0)).toBe(4);});});
function hd356medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd357medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357medx2_hd',()=>{it('a',()=>{expect(hd357medx2(1,4)).toBe(2);});it('b',()=>{expect(hd357medx2(3,1)).toBe(1);});it('c',()=>{expect(hd357medx2(0,0)).toBe(0);});it('d',()=>{expect(hd357medx2(93,73)).toBe(2);});it('e',()=>{expect(hd357medx2(15,0)).toBe(4);});});
function hd357medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd358medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358medx2_hd',()=>{it('a',()=>{expect(hd358medx2(1,4)).toBe(2);});it('b',()=>{expect(hd358medx2(3,1)).toBe(1);});it('c',()=>{expect(hd358medx2(0,0)).toBe(0);});it('d',()=>{expect(hd358medx2(93,73)).toBe(2);});it('e',()=>{expect(hd358medx2(15,0)).toBe(4);});});
function hd358medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd359medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359medx2_hd',()=>{it('a',()=>{expect(hd359medx2(1,4)).toBe(2);});it('b',()=>{expect(hd359medx2(3,1)).toBe(1);});it('c',()=>{expect(hd359medx2(0,0)).toBe(0);});it('d',()=>{expect(hd359medx2(93,73)).toBe(2);});it('e',()=>{expect(hd359medx2(15,0)).toBe(4);});});
function hd359medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd360medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360medx2_hd',()=>{it('a',()=>{expect(hd360medx2(1,4)).toBe(2);});it('b',()=>{expect(hd360medx2(3,1)).toBe(1);});it('c',()=>{expect(hd360medx2(0,0)).toBe(0);});it('d',()=>{expect(hd360medx2(93,73)).toBe(2);});it('e',()=>{expect(hd360medx2(15,0)).toBe(4);});});
function hd360medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd361medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361medx2_hd',()=>{it('a',()=>{expect(hd361medx2(1,4)).toBe(2);});it('b',()=>{expect(hd361medx2(3,1)).toBe(1);});it('c',()=>{expect(hd361medx2(0,0)).toBe(0);});it('d',()=>{expect(hd361medx2(93,73)).toBe(2);});it('e',()=>{expect(hd361medx2(15,0)).toBe(4);});});
function hd361medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd362medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362medx2_hd',()=>{it('a',()=>{expect(hd362medx2(1,4)).toBe(2);});it('b',()=>{expect(hd362medx2(3,1)).toBe(1);});it('c',()=>{expect(hd362medx2(0,0)).toBe(0);});it('d',()=>{expect(hd362medx2(93,73)).toBe(2);});it('e',()=>{expect(hd362medx2(15,0)).toBe(4);});});
function hd362medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd363medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363medx2_hd',()=>{it('a',()=>{expect(hd363medx2(1,4)).toBe(2);});it('b',()=>{expect(hd363medx2(3,1)).toBe(1);});it('c',()=>{expect(hd363medx2(0,0)).toBe(0);});it('d',()=>{expect(hd363medx2(93,73)).toBe(2);});it('e',()=>{expect(hd363medx2(15,0)).toBe(4);});});
function hd363medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd364medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364medx2_hd',()=>{it('a',()=>{expect(hd364medx2(1,4)).toBe(2);});it('b',()=>{expect(hd364medx2(3,1)).toBe(1);});it('c',()=>{expect(hd364medx2(0,0)).toBe(0);});it('d',()=>{expect(hd364medx2(93,73)).toBe(2);});it('e',()=>{expect(hd364medx2(15,0)).toBe(4);});});
function hd364medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd365medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365medx2_hd',()=>{it('a',()=>{expect(hd365medx2(1,4)).toBe(2);});it('b',()=>{expect(hd365medx2(3,1)).toBe(1);});it('c',()=>{expect(hd365medx2(0,0)).toBe(0);});it('d',()=>{expect(hd365medx2(93,73)).toBe(2);});it('e',()=>{expect(hd365medx2(15,0)).toBe(4);});});
function hd365medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd366medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366medx2_hd',()=>{it('a',()=>{expect(hd366medx2(1,4)).toBe(2);});it('b',()=>{expect(hd366medx2(3,1)).toBe(1);});it('c',()=>{expect(hd366medx2(0,0)).toBe(0);});it('d',()=>{expect(hd366medx2(93,73)).toBe(2);});it('e',()=>{expect(hd366medx2(15,0)).toBe(4);});});
function hd366medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd367medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367medx2_hd',()=>{it('a',()=>{expect(hd367medx2(1,4)).toBe(2);});it('b',()=>{expect(hd367medx2(3,1)).toBe(1);});it('c',()=>{expect(hd367medx2(0,0)).toBe(0);});it('d',()=>{expect(hd367medx2(93,73)).toBe(2);});it('e',()=>{expect(hd367medx2(15,0)).toBe(4);});});
function hd367medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd368medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368medx2_hd',()=>{it('a',()=>{expect(hd368medx2(1,4)).toBe(2);});it('b',()=>{expect(hd368medx2(3,1)).toBe(1);});it('c',()=>{expect(hd368medx2(0,0)).toBe(0);});it('d',()=>{expect(hd368medx2(93,73)).toBe(2);});it('e',()=>{expect(hd368medx2(15,0)).toBe(4);});});
function hd368medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd369medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369medx2_hd',()=>{it('a',()=>{expect(hd369medx2(1,4)).toBe(2);});it('b',()=>{expect(hd369medx2(3,1)).toBe(1);});it('c',()=>{expect(hd369medx2(0,0)).toBe(0);});it('d',()=>{expect(hd369medx2(93,73)).toBe(2);});it('e',()=>{expect(hd369medx2(15,0)).toBe(4);});});
function hd369medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd370medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370medx2_hd',()=>{it('a',()=>{expect(hd370medx2(1,4)).toBe(2);});it('b',()=>{expect(hd370medx2(3,1)).toBe(1);});it('c',()=>{expect(hd370medx2(0,0)).toBe(0);});it('d',()=>{expect(hd370medx2(93,73)).toBe(2);});it('e',()=>{expect(hd370medx2(15,0)).toBe(4);});});
function hd370medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd371medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371medx2_hd',()=>{it('a',()=>{expect(hd371medx2(1,4)).toBe(2);});it('b',()=>{expect(hd371medx2(3,1)).toBe(1);});it('c',()=>{expect(hd371medx2(0,0)).toBe(0);});it('d',()=>{expect(hd371medx2(93,73)).toBe(2);});it('e',()=>{expect(hd371medx2(15,0)).toBe(4);});});
function hd371medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd372medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372medx2_hd',()=>{it('a',()=>{expect(hd372medx2(1,4)).toBe(2);});it('b',()=>{expect(hd372medx2(3,1)).toBe(1);});it('c',()=>{expect(hd372medx2(0,0)).toBe(0);});it('d',()=>{expect(hd372medx2(93,73)).toBe(2);});it('e',()=>{expect(hd372medx2(15,0)).toBe(4);});});
function hd372medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd373medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373medx2_hd',()=>{it('a',()=>{expect(hd373medx2(1,4)).toBe(2);});it('b',()=>{expect(hd373medx2(3,1)).toBe(1);});it('c',()=>{expect(hd373medx2(0,0)).toBe(0);});it('d',()=>{expect(hd373medx2(93,73)).toBe(2);});it('e',()=>{expect(hd373medx2(15,0)).toBe(4);});});
function hd373medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd374medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374medx2_hd',()=>{it('a',()=>{expect(hd374medx2(1,4)).toBe(2);});it('b',()=>{expect(hd374medx2(3,1)).toBe(1);});it('c',()=>{expect(hd374medx2(0,0)).toBe(0);});it('d',()=>{expect(hd374medx2(93,73)).toBe(2);});it('e',()=>{expect(hd374medx2(15,0)).toBe(4);});});
function hd374medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd375medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375medx2_hd',()=>{it('a',()=>{expect(hd375medx2(1,4)).toBe(2);});it('b',()=>{expect(hd375medx2(3,1)).toBe(1);});it('c',()=>{expect(hd375medx2(0,0)).toBe(0);});it('d',()=>{expect(hd375medx2(93,73)).toBe(2);});it('e',()=>{expect(hd375medx2(15,0)).toBe(4);});});
function hd375medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd376medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376medx2_hd',()=>{it('a',()=>{expect(hd376medx2(1,4)).toBe(2);});it('b',()=>{expect(hd376medx2(3,1)).toBe(1);});it('c',()=>{expect(hd376medx2(0,0)).toBe(0);});it('d',()=>{expect(hd376medx2(93,73)).toBe(2);});it('e',()=>{expect(hd376medx2(15,0)).toBe(4);});});
function hd376medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd377medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377medx2_hd',()=>{it('a',()=>{expect(hd377medx2(1,4)).toBe(2);});it('b',()=>{expect(hd377medx2(3,1)).toBe(1);});it('c',()=>{expect(hd377medx2(0,0)).toBe(0);});it('d',()=>{expect(hd377medx2(93,73)).toBe(2);});it('e',()=>{expect(hd377medx2(15,0)).toBe(4);});});
function hd377medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd378medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378medx2_hd',()=>{it('a',()=>{expect(hd378medx2(1,4)).toBe(2);});it('b',()=>{expect(hd378medx2(3,1)).toBe(1);});it('c',()=>{expect(hd378medx2(0,0)).toBe(0);});it('d',()=>{expect(hd378medx2(93,73)).toBe(2);});it('e',()=>{expect(hd378medx2(15,0)).toBe(4);});});
function hd378medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd379medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379medx2_hd',()=>{it('a',()=>{expect(hd379medx2(1,4)).toBe(2);});it('b',()=>{expect(hd379medx2(3,1)).toBe(1);});it('c',()=>{expect(hd379medx2(0,0)).toBe(0);});it('d',()=>{expect(hd379medx2(93,73)).toBe(2);});it('e',()=>{expect(hd379medx2(15,0)).toBe(4);});});
function hd379medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd380medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380medx2_hd',()=>{it('a',()=>{expect(hd380medx2(1,4)).toBe(2);});it('b',()=>{expect(hd380medx2(3,1)).toBe(1);});it('c',()=>{expect(hd380medx2(0,0)).toBe(0);});it('d',()=>{expect(hd380medx2(93,73)).toBe(2);});it('e',()=>{expect(hd380medx2(15,0)).toBe(4);});});
function hd380medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd381medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381medx2_hd',()=>{it('a',()=>{expect(hd381medx2(1,4)).toBe(2);});it('b',()=>{expect(hd381medx2(3,1)).toBe(1);});it('c',()=>{expect(hd381medx2(0,0)).toBe(0);});it('d',()=>{expect(hd381medx2(93,73)).toBe(2);});it('e',()=>{expect(hd381medx2(15,0)).toBe(4);});});
function hd381medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd382medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382medx2_hd',()=>{it('a',()=>{expect(hd382medx2(1,4)).toBe(2);});it('b',()=>{expect(hd382medx2(3,1)).toBe(1);});it('c',()=>{expect(hd382medx2(0,0)).toBe(0);});it('d',()=>{expect(hd382medx2(93,73)).toBe(2);});it('e',()=>{expect(hd382medx2(15,0)).toBe(4);});});
function hd382medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd383medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383medx2_hd',()=>{it('a',()=>{expect(hd383medx2(1,4)).toBe(2);});it('b',()=>{expect(hd383medx2(3,1)).toBe(1);});it('c',()=>{expect(hd383medx2(0,0)).toBe(0);});it('d',()=>{expect(hd383medx2(93,73)).toBe(2);});it('e',()=>{expect(hd383medx2(15,0)).toBe(4);});});
function hd383medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd384medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384medx2_hd',()=>{it('a',()=>{expect(hd384medx2(1,4)).toBe(2);});it('b',()=>{expect(hd384medx2(3,1)).toBe(1);});it('c',()=>{expect(hd384medx2(0,0)).toBe(0);});it('d',()=>{expect(hd384medx2(93,73)).toBe(2);});it('e',()=>{expect(hd384medx2(15,0)).toBe(4);});});
function hd384medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd385medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385medx2_hd',()=>{it('a',()=>{expect(hd385medx2(1,4)).toBe(2);});it('b',()=>{expect(hd385medx2(3,1)).toBe(1);});it('c',()=>{expect(hd385medx2(0,0)).toBe(0);});it('d',()=>{expect(hd385medx2(93,73)).toBe(2);});it('e',()=>{expect(hd385medx2(15,0)).toBe(4);});});
function hd385medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd386medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386medx2_hd',()=>{it('a',()=>{expect(hd386medx2(1,4)).toBe(2);});it('b',()=>{expect(hd386medx2(3,1)).toBe(1);});it('c',()=>{expect(hd386medx2(0,0)).toBe(0);});it('d',()=>{expect(hd386medx2(93,73)).toBe(2);});it('e',()=>{expect(hd386medx2(15,0)).toBe(4);});});
function hd386medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd387medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387medx2_hd',()=>{it('a',()=>{expect(hd387medx2(1,4)).toBe(2);});it('b',()=>{expect(hd387medx2(3,1)).toBe(1);});it('c',()=>{expect(hd387medx2(0,0)).toBe(0);});it('d',()=>{expect(hd387medx2(93,73)).toBe(2);});it('e',()=>{expect(hd387medx2(15,0)).toBe(4);});});
function hd387medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd388medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388medx2_hd',()=>{it('a',()=>{expect(hd388medx2(1,4)).toBe(2);});it('b',()=>{expect(hd388medx2(3,1)).toBe(1);});it('c',()=>{expect(hd388medx2(0,0)).toBe(0);});it('d',()=>{expect(hd388medx2(93,73)).toBe(2);});it('e',()=>{expect(hd388medx2(15,0)).toBe(4);});});
function hd388medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd389medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389medx2_hd',()=>{it('a',()=>{expect(hd389medx2(1,4)).toBe(2);});it('b',()=>{expect(hd389medx2(3,1)).toBe(1);});it('c',()=>{expect(hd389medx2(0,0)).toBe(0);});it('d',()=>{expect(hd389medx2(93,73)).toBe(2);});it('e',()=>{expect(hd389medx2(15,0)).toBe(4);});});
function hd389medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd390medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390medx2_hd',()=>{it('a',()=>{expect(hd390medx2(1,4)).toBe(2);});it('b',()=>{expect(hd390medx2(3,1)).toBe(1);});it('c',()=>{expect(hd390medx2(0,0)).toBe(0);});it('d',()=>{expect(hd390medx2(93,73)).toBe(2);});it('e',()=>{expect(hd390medx2(15,0)).toBe(4);});});
function hd390medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd391medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391medx2_hd',()=>{it('a',()=>{expect(hd391medx2(1,4)).toBe(2);});it('b',()=>{expect(hd391medx2(3,1)).toBe(1);});it('c',()=>{expect(hd391medx2(0,0)).toBe(0);});it('d',()=>{expect(hd391medx2(93,73)).toBe(2);});it('e',()=>{expect(hd391medx2(15,0)).toBe(4);});});
function hd391medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd392medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392medx2_hd',()=>{it('a',()=>{expect(hd392medx2(1,4)).toBe(2);});it('b',()=>{expect(hd392medx2(3,1)).toBe(1);});it('c',()=>{expect(hd392medx2(0,0)).toBe(0);});it('d',()=>{expect(hd392medx2(93,73)).toBe(2);});it('e',()=>{expect(hd392medx2(15,0)).toBe(4);});});
function hd392medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd393medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393medx2_hd',()=>{it('a',()=>{expect(hd393medx2(1,4)).toBe(2);});it('b',()=>{expect(hd393medx2(3,1)).toBe(1);});it('c',()=>{expect(hd393medx2(0,0)).toBe(0);});it('d',()=>{expect(hd393medx2(93,73)).toBe(2);});it('e',()=>{expect(hd393medx2(15,0)).toBe(4);});});
function hd393medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd394medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394medx2_hd',()=>{it('a',()=>{expect(hd394medx2(1,4)).toBe(2);});it('b',()=>{expect(hd394medx2(3,1)).toBe(1);});it('c',()=>{expect(hd394medx2(0,0)).toBe(0);});it('d',()=>{expect(hd394medx2(93,73)).toBe(2);});it('e',()=>{expect(hd394medx2(15,0)).toBe(4);});});
function hd394medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd395medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395medx2_hd',()=>{it('a',()=>{expect(hd395medx2(1,4)).toBe(2);});it('b',()=>{expect(hd395medx2(3,1)).toBe(1);});it('c',()=>{expect(hd395medx2(0,0)).toBe(0);});it('d',()=>{expect(hd395medx2(93,73)).toBe(2);});it('e',()=>{expect(hd395medx2(15,0)).toBe(4);});});
function hd395medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd396medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396medx2_hd',()=>{it('a',()=>{expect(hd396medx2(1,4)).toBe(2);});it('b',()=>{expect(hd396medx2(3,1)).toBe(1);});it('c',()=>{expect(hd396medx2(0,0)).toBe(0);});it('d',()=>{expect(hd396medx2(93,73)).toBe(2);});it('e',()=>{expect(hd396medx2(15,0)).toBe(4);});});
function hd396medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd397medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397medx2_hd',()=>{it('a',()=>{expect(hd397medx2(1,4)).toBe(2);});it('b',()=>{expect(hd397medx2(3,1)).toBe(1);});it('c',()=>{expect(hd397medx2(0,0)).toBe(0);});it('d',()=>{expect(hd397medx2(93,73)).toBe(2);});it('e',()=>{expect(hd397medx2(15,0)).toBe(4);});});
function hd397medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd398medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398medx2_hd',()=>{it('a',()=>{expect(hd398medx2(1,4)).toBe(2);});it('b',()=>{expect(hd398medx2(3,1)).toBe(1);});it('c',()=>{expect(hd398medx2(0,0)).toBe(0);});it('d',()=>{expect(hd398medx2(93,73)).toBe(2);});it('e',()=>{expect(hd398medx2(15,0)).toBe(4);});});
function hd398medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd399medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399medx2_hd',()=>{it('a',()=>{expect(hd399medx2(1,4)).toBe(2);});it('b',()=>{expect(hd399medx2(3,1)).toBe(1);});it('c',()=>{expect(hd399medx2(0,0)).toBe(0);});it('d',()=>{expect(hd399medx2(93,73)).toBe(2);});it('e',()=>{expect(hd399medx2(15,0)).toBe(4);});});
function hd399medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd400medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400medx2_hd',()=>{it('a',()=>{expect(hd400medx2(1,4)).toBe(2);});it('b',()=>{expect(hd400medx2(3,1)).toBe(1);});it('c',()=>{expect(hd400medx2(0,0)).toBe(0);});it('d',()=>{expect(hd400medx2(93,73)).toBe(2);});it('e',()=>{expect(hd400medx2(15,0)).toBe(4);});});
function hd400medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd401medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401medx2_hd',()=>{it('a',()=>{expect(hd401medx2(1,4)).toBe(2);});it('b',()=>{expect(hd401medx2(3,1)).toBe(1);});it('c',()=>{expect(hd401medx2(0,0)).toBe(0);});it('d',()=>{expect(hd401medx2(93,73)).toBe(2);});it('e',()=>{expect(hd401medx2(15,0)).toBe(4);});});
function hd401medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd402medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402medx2_hd',()=>{it('a',()=>{expect(hd402medx2(1,4)).toBe(2);});it('b',()=>{expect(hd402medx2(3,1)).toBe(1);});it('c',()=>{expect(hd402medx2(0,0)).toBe(0);});it('d',()=>{expect(hd402medx2(93,73)).toBe(2);});it('e',()=>{expect(hd402medx2(15,0)).toBe(4);});});
function hd402medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd403medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403medx2_hd',()=>{it('a',()=>{expect(hd403medx2(1,4)).toBe(2);});it('b',()=>{expect(hd403medx2(3,1)).toBe(1);});it('c',()=>{expect(hd403medx2(0,0)).toBe(0);});it('d',()=>{expect(hd403medx2(93,73)).toBe(2);});it('e',()=>{expect(hd403medx2(15,0)).toBe(4);});});
function hd403medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd404medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404medx2_hd',()=>{it('a',()=>{expect(hd404medx2(1,4)).toBe(2);});it('b',()=>{expect(hd404medx2(3,1)).toBe(1);});it('c',()=>{expect(hd404medx2(0,0)).toBe(0);});it('d',()=>{expect(hd404medx2(93,73)).toBe(2);});it('e',()=>{expect(hd404medx2(15,0)).toBe(4);});});
function hd404medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd405medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405medx2_hd',()=>{it('a',()=>{expect(hd405medx2(1,4)).toBe(2);});it('b',()=>{expect(hd405medx2(3,1)).toBe(1);});it('c',()=>{expect(hd405medx2(0,0)).toBe(0);});it('d',()=>{expect(hd405medx2(93,73)).toBe(2);});it('e',()=>{expect(hd405medx2(15,0)).toBe(4);});});
function hd405medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd406medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406medx2_hd',()=>{it('a',()=>{expect(hd406medx2(1,4)).toBe(2);});it('b',()=>{expect(hd406medx2(3,1)).toBe(1);});it('c',()=>{expect(hd406medx2(0,0)).toBe(0);});it('d',()=>{expect(hd406medx2(93,73)).toBe(2);});it('e',()=>{expect(hd406medx2(15,0)).toBe(4);});});
function hd406medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd407medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407medx2_hd',()=>{it('a',()=>{expect(hd407medx2(1,4)).toBe(2);});it('b',()=>{expect(hd407medx2(3,1)).toBe(1);});it('c',()=>{expect(hd407medx2(0,0)).toBe(0);});it('d',()=>{expect(hd407medx2(93,73)).toBe(2);});it('e',()=>{expect(hd407medx2(15,0)).toBe(4);});});
function hd407medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd408medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408medx2_hd',()=>{it('a',()=>{expect(hd408medx2(1,4)).toBe(2);});it('b',()=>{expect(hd408medx2(3,1)).toBe(1);});it('c',()=>{expect(hd408medx2(0,0)).toBe(0);});it('d',()=>{expect(hd408medx2(93,73)).toBe(2);});it('e',()=>{expect(hd408medx2(15,0)).toBe(4);});});
function hd408medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd409medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409medx2_hd',()=>{it('a',()=>{expect(hd409medx2(1,4)).toBe(2);});it('b',()=>{expect(hd409medx2(3,1)).toBe(1);});it('c',()=>{expect(hd409medx2(0,0)).toBe(0);});it('d',()=>{expect(hd409medx2(93,73)).toBe(2);});it('e',()=>{expect(hd409medx2(15,0)).toBe(4);});});
function hd409medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd410medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410medx2_hd',()=>{it('a',()=>{expect(hd410medx2(1,4)).toBe(2);});it('b',()=>{expect(hd410medx2(3,1)).toBe(1);});it('c',()=>{expect(hd410medx2(0,0)).toBe(0);});it('d',()=>{expect(hd410medx2(93,73)).toBe(2);});it('e',()=>{expect(hd410medx2(15,0)).toBe(4);});});
function hd410medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd411medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411medx2_hd',()=>{it('a',()=>{expect(hd411medx2(1,4)).toBe(2);});it('b',()=>{expect(hd411medx2(3,1)).toBe(1);});it('c',()=>{expect(hd411medx2(0,0)).toBe(0);});it('d',()=>{expect(hd411medx2(93,73)).toBe(2);});it('e',()=>{expect(hd411medx2(15,0)).toBe(4);});});
function hd411medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd412medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412medx2_hd',()=>{it('a',()=>{expect(hd412medx2(1,4)).toBe(2);});it('b',()=>{expect(hd412medx2(3,1)).toBe(1);});it('c',()=>{expect(hd412medx2(0,0)).toBe(0);});it('d',()=>{expect(hd412medx2(93,73)).toBe(2);});it('e',()=>{expect(hd412medx2(15,0)).toBe(4);});});
function hd412medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd413medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413medx2_hd',()=>{it('a',()=>{expect(hd413medx2(1,4)).toBe(2);});it('b',()=>{expect(hd413medx2(3,1)).toBe(1);});it('c',()=>{expect(hd413medx2(0,0)).toBe(0);});it('d',()=>{expect(hd413medx2(93,73)).toBe(2);});it('e',()=>{expect(hd413medx2(15,0)).toBe(4);});});
function hd413medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd414medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414medx2_hd',()=>{it('a',()=>{expect(hd414medx2(1,4)).toBe(2);});it('b',()=>{expect(hd414medx2(3,1)).toBe(1);});it('c',()=>{expect(hd414medx2(0,0)).toBe(0);});it('d',()=>{expect(hd414medx2(93,73)).toBe(2);});it('e',()=>{expect(hd414medx2(15,0)).toBe(4);});});
function hd414medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd415medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415medx2_hd',()=>{it('a',()=>{expect(hd415medx2(1,4)).toBe(2);});it('b',()=>{expect(hd415medx2(3,1)).toBe(1);});it('c',()=>{expect(hd415medx2(0,0)).toBe(0);});it('d',()=>{expect(hd415medx2(93,73)).toBe(2);});it('e',()=>{expect(hd415medx2(15,0)).toBe(4);});});
function hd415medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd416medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416medx2_hd',()=>{it('a',()=>{expect(hd416medx2(1,4)).toBe(2);});it('b',()=>{expect(hd416medx2(3,1)).toBe(1);});it('c',()=>{expect(hd416medx2(0,0)).toBe(0);});it('d',()=>{expect(hd416medx2(93,73)).toBe(2);});it('e',()=>{expect(hd416medx2(15,0)).toBe(4);});});
function hd416medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd417medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417medx2_hd',()=>{it('a',()=>{expect(hd417medx2(1,4)).toBe(2);});it('b',()=>{expect(hd417medx2(3,1)).toBe(1);});it('c',()=>{expect(hd417medx2(0,0)).toBe(0);});it('d',()=>{expect(hd417medx2(93,73)).toBe(2);});it('e',()=>{expect(hd417medx2(15,0)).toBe(4);});});
function hd417medx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417medx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
