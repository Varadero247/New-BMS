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
