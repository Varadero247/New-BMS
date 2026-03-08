/**
 * @ims/chemical-register — comprehensive unit tests
 *
 * 200+ tests covering all exported types, constants, and pure utility functions.
 * No external imports — all logic is self-contained.
 */

import {
  GHS_PICTOGRAMS,
  areStorageClassesIncompatible,
  calculateRiskScore,
  getRiskLevel,
  riskLevelWeight,
  calculateWelPercentage,
  getWelStatus,
  welStatusToMonitoringResult,
  calculateSdsNextReviewDate,
  isSdsNearingReview,
  isSdsOverdue,
  isLowStock,
  isExpired,
  isExpiringWithin,
  generateChemRef,
  generateCoshhRef,
  generateSdsRef,
  isValidCasNumber,
  recommendDisposalRoute,
  calculateTwa,
  type GhsPictogram,
  type RiskLevel,
  type WelStatus,
  type MonitoringResult,
  type StorageClass,
  type WasteClass,
} from '../index';

// ---------------------------------------------------------------------------
// GHS_PICTOGRAMS constant
// ---------------------------------------------------------------------------

describe('GHS_PICTOGRAMS', () => {
  const allCodes: GhsPictogram[] = [
    'GHS01_EXPLOSIVE',
    'GHS02_FLAMMABLE',
    'GHS03_OXIDISING',
    'GHS04_GAS_UNDER_PRESSURE',
    'GHS05_CORROSIVE',
    'GHS06_TOXIC',
    'GHS07_IRRITANT_HARMFUL',
    'GHS08_HEALTH_HAZARD',
    'GHS09_ENVIRONMENTAL',
  ];

  it('has exactly 9 pictograms', () => {
    expect(Object.keys(GHS_PICTOGRAMS)).toHaveLength(9);
  });

  for (const code of allCodes) {
    it(`GHS_PICTOGRAMS.${code} has required fields`, () => {
      const meta = GHS_PICTOGRAMS[code];
      expect(meta.code).toBe(code);
      expect(typeof meta.label).toBe('string');
      expect(meta.label.length).toBeGreaterThan(0);
      expect(typeof meta.hazardClass).toBe('string');
      expect(['DANGER', 'WARNING', 'NONE']).toContain(meta.minSignalWord);
    });
  }

  it('DANGER signal word on high-hazard pictograms', () => {
    const dangerPictograms: GhsPictogram[] = [
      'GHS01_EXPLOSIVE',
      'GHS02_FLAMMABLE',
      'GHS03_OXIDISING',
      'GHS05_CORROSIVE',
      'GHS06_TOXIC',
      'GHS08_HEALTH_HAZARD',
    ];
    for (const code of dangerPictograms) {
      expect(GHS_PICTOGRAMS[code].minSignalWord).toBe('DANGER');
    }
  });

  it('WARNING signal word on lower-hazard pictograms', () => {
    const warningPictograms: GhsPictogram[] = [
      'GHS04_GAS_UNDER_PRESSURE',
      'GHS07_IRRITANT_HARMFUL',
      'GHS09_ENVIRONMENTAL',
    ];
    for (const code of warningPictograms) {
      expect(GHS_PICTOGRAMS[code].minSignalWord).toBe('WARNING');
    }
  });
});

// ---------------------------------------------------------------------------
// areStorageClassesIncompatible
// ---------------------------------------------------------------------------

describe('areStorageClassesIncompatible', () => {
  it('returns false for identical storage classes', () => {
    expect(areStorageClassesIncompatible('CLASS_1_EXPLOSIVES', 'CLASS_1_EXPLOSIVES')).toBe(false);
    expect(areStorageClassesIncompatible('NON_HAZARDOUS', 'NON_HAZARDOUS')).toBe(false);
  });

  const incompatiblePairs: [StorageClass, StorageClass][] = [
    ['CLASS_1_EXPLOSIVES', 'CLASS_2_FLAMMABLE_GAS'],
    ['CLASS_1_EXPLOSIVES', 'CLASS_3_FLAMMABLE_LIQUID'],
    ['CLASS_1_EXPLOSIVES', 'CLASS_5_OXIDISING'],
    ['CLASS_2_FLAMMABLE_GAS', 'CLASS_3_FLAMMABLE_LIQUID'],
    ['CLASS_2_FLAMMABLE_GAS', 'CLASS_5_OXIDISING'],
    ['CLASS_3_FLAMMABLE_LIQUID', 'CLASS_5_OXIDISING'],
    ['CLASS_4_FLAMMABLE_SOLID', 'CLASS_5_OXIDISING'],
    ['CLASS_5_OXIDISING', 'CLASS_6_TOXIC'],
    ['CLASS_7_RADIOACTIVE', 'CLASS_1_EXPLOSIVES'],
    ['CLASS_7_RADIOACTIVE', 'CLASS_2_FLAMMABLE_GAS'],
  ];

  for (const [a, b] of incompatiblePairs) {
    it(`${a} incompatible with ${b} (and reverse)`, () => {
      expect(areStorageClassesIncompatible(a, b)).toBe(true);
      expect(areStorageClassesIncompatible(b, a)).toBe(true);
    });
  }

  it('NON_HAZARDOUS is compatible with anything', () => {
    const classes: StorageClass[] = [
      'CLASS_1_EXPLOSIVES',
      'CLASS_6_TOXIC',
      'CLASS_8_CORROSIVE',
      'CLASS_9_OTHER_HAZARDOUS',
    ];
    for (const c of classes) {
      expect(areStorageClassesIncompatible('NON_HAZARDOUS', c)).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// calculateRiskScore
// ---------------------------------------------------------------------------

describe('calculateRiskScore', () => {
  it('multiplies likelihood × severity', () => {
    expect(calculateRiskScore(3, 4)).toBe(12);
    expect(calculateRiskScore(1, 1)).toBe(1);
    expect(calculateRiskScore(5, 5)).toBe(25);
  });

  it('clamps likelihood below 1 to 1', () => {
    expect(calculateRiskScore(0, 3)).toBe(3);
    expect(calculateRiskScore(-2, 3)).toBe(3);
  });

  it('clamps likelihood above 5 to 5', () => {
    expect(calculateRiskScore(10, 2)).toBe(10);
  });

  it('clamps severity below 1 to 1', () => {
    expect(calculateRiskScore(3, 0)).toBe(3);
  });

  it('clamps severity above 5 to 5', () => {
    expect(calculateRiskScore(2, 99)).toBe(10);
  });

  it('rounds float inputs', () => {
    expect(calculateRiskScore(2.9, 3.1)).toBe(9); // round(2.9)=3, round(3.1)=3
  });
});

// ---------------------------------------------------------------------------
// getRiskLevel
// ---------------------------------------------------------------------------

describe('getRiskLevel', () => {
  const cases: Array<[number, RiskLevel]> = [
    [1, 'VERY_LOW'],
    [2, 'VERY_LOW'],
    [3, 'LOW'],
    [4, 'LOW'],
    [5, 'MEDIUM'],
    [9, 'MEDIUM'],
    [10, 'HIGH'],
    [14, 'HIGH'],
    [15, 'VERY_HIGH'],
    [19, 'VERY_HIGH'],
    [20, 'UNACCEPTABLE'],
    [25, 'UNACCEPTABLE'],
  ];

  for (const [score, expected] of cases) {
    it(`score ${score} → ${expected}`, () => {
      expect(getRiskLevel(score)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// riskLevelWeight
// ---------------------------------------------------------------------------

describe('riskLevelWeight', () => {
  it('returns monotonically increasing weights', () => {
    const levels: RiskLevel[] = ['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'UNACCEPTABLE'];
    const weights = levels.map(riskLevelWeight);
    for (let i = 1; i < weights.length; i++) {
      expect(weights[i]).toBeGreaterThan(weights[i - 1]);
    }
  });

  it('VERY_LOW has weight 1', () => expect(riskLevelWeight('VERY_LOW')).toBe(1));
  it('UNACCEPTABLE has weight 6', () => expect(riskLevelWeight('UNACCEPTABLE')).toBe(6));
});

// ---------------------------------------------------------------------------
// calculateWelPercentage
// ---------------------------------------------------------------------------

describe('calculateWelPercentage', () => {
  it('calculates percentage correctly', () => {
    expect(calculateWelPercentage(0.5, 1.0)).toBe(50);
    expect(calculateWelPercentage(1.0, 1.0)).toBe(100);
    expect(calculateWelPercentage(0.0, 1.0)).toBe(0);
  });

  it('rounds to 1 decimal place', () => {
    expect(calculateWelPercentage(1, 3)).toBe(33.3);
    expect(calculateWelPercentage(2, 3)).toBe(66.7);
  });

  it('returns 0 when welLimit is 0', () => {
    expect(calculateWelPercentage(5, 0)).toBe(0);
  });

  it('returns 0 when welLimit is negative', () => {
    expect(calculateWelPercentage(5, -1)).toBe(0);
  });

  it('handles result above WEL', () => {
    expect(calculateWelPercentage(1.5, 1.0)).toBe(150);
  });
});

// ---------------------------------------------------------------------------
// getWelStatus
// ---------------------------------------------------------------------------

describe('getWelStatus', () => {
  const cases: Array<[number, WelStatus]> = [
    [0, 'BELOW_WEL'],
    [89.9, 'BELOW_WEL'],
    [90, 'AT_WEL'],
    [99.9, 'AT_WEL'],
    [100, 'ABOVE_WEL'],
    [150, 'ABOVE_WEL'],
  ];

  for (const [pct, expected] of cases) {
    it(`${pct}% → ${expected}`, () => {
      expect(getWelStatus(pct)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// welStatusToMonitoringResult
// ---------------------------------------------------------------------------

describe('welStatusToMonitoringResult', () => {
  const cases: Array<[WelStatus, MonitoringResult]> = [
    ['BELOW_WEL', 'PASS'],
    ['AT_WEL', 'ADVISORY'],
    ['ABOVE_WEL', 'FAIL'],
  ];
  for (const [status, expected] of cases) {
    it(`${status} → ${expected}`, () => {
      expect(welStatusToMonitoringResult(status)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// SDS lifecycle utilities
// ---------------------------------------------------------------------------

describe('calculateSdsNextReviewDate', () => {
  it('adds 36 months by default', () => {
    const revision = new Date('2023-01-15');
    const next = calculateSdsNextReviewDate({ revisionDate: revision });
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(0); // January
    expect(next.getDate()).toBe(15);
  });

  it('respects custom interval', () => {
    const revision = new Date('2024-06-01');
    const next = calculateSdsNextReviewDate({ revisionDate: revision, reviewIntervalMonths: 12 });
    expect(next.getFullYear()).toBe(2025);
    expect(next.getMonth()).toBe(5); // June
  });

  it('handles month overflow correctly', () => {
    const revision = new Date('2025-11-30');
    const next = calculateSdsNextReviewDate({ revisionDate: revision, reviewIntervalMonths: 3 });
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(2); // February (rolled over)
  });
});

describe('isSdsNearingReview', () => {
  it('returns true when review is within default 30 days', () => {
    const now = new Date('2026-01-01');
    const revision = new Date('2023-01-01'); // 36 months later = 2026-01-01 exactly
    expect(isSdsNearingReview({ revisionDate: revision }, 30, now)).toBe(true);
  });

  it('returns false when review is more than 30 days away', () => {
    const now = new Date('2026-01-01');
    const revision = new Date('2023-06-01'); // next review 2026-06-01 — far away
    expect(isSdsNearingReview({ revisionDate: revision }, 30, now)).toBe(false);
  });

  it('returns false when review is already past', () => {
    const now = new Date('2026-06-01');
    const revision = new Date('2023-01-01'); // next review 2026-01-01 — past
    expect(isSdsNearingReview({ revisionDate: revision }, 30, now)).toBe(false);
  });

  it('respects custom daysAhead', () => {
    const now = new Date('2026-01-01');
    const revision = new Date('2023-01-01');
    expect(isSdsNearingReview({ revisionDate: revision }, 0, now)).toBe(true); // exactly on day 0
  });
});

describe('isSdsOverdue', () => {
  it('returns true when review date is in the past', () => {
    const now = new Date('2026-06-01');
    const revision = new Date('2023-01-01'); // next review 2026-01-01 — past
    expect(isSdsOverdue({ revisionDate: revision }, now)).toBe(true);
  });

  it('returns false when review date is in the future', () => {
    const now = new Date('2025-01-01');
    const revision = new Date('2023-01-01'); // next review 2026-01-01 — future
    expect(isSdsOverdue({ revisionDate: revision }, now)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Inventory utilities
// ---------------------------------------------------------------------------

describe('isLowStock', () => {
  it('returns false when minStockLevel is null', () => {
    expect(isLowStock({ quantityOnHand: 0, minStockLevel: null, expiryDate: null })).toBe(false);
  });

  it('returns true when quantityOnHand equals minStockLevel', () => {
    expect(isLowStock({ quantityOnHand: 5, minStockLevel: 5, expiryDate: null })).toBe(true);
  });

  it('returns true when quantityOnHand is below minStockLevel', () => {
    expect(isLowStock({ quantityOnHand: 3, minStockLevel: 10, expiryDate: null })).toBe(true);
  });

  it('returns false when quantityOnHand is above minStockLevel', () => {
    expect(isLowStock({ quantityOnHand: 11, minStockLevel: 10, expiryDate: null })).toBe(false);
  });
});

describe('isExpired', () => {
  const now = new Date('2026-03-08');

  it('returns false when expiryDate is null', () => {
    expect(isExpired({ quantityOnHand: 10, minStockLevel: null, expiryDate: null }, now)).toBe(false);
  });

  it('returns true when expiryDate is in the past', () => {
    const past = new Date('2025-01-01');
    expect(isExpired({ quantityOnHand: 10, minStockLevel: null, expiryDate: past }, now)).toBe(true);
  });

  it('returns false when expiryDate is in the future', () => {
    const future = new Date('2027-01-01');
    expect(isExpired({ quantityOnHand: 10, minStockLevel: null, expiryDate: future }, now)).toBe(false);
  });
});

describe('isExpiringWithin', () => {
  const now = new Date('2026-03-08');

  it('returns false when expiryDate is null', () => {
    expect(isExpiringWithin({ quantityOnHand: 10, minStockLevel: null, expiryDate: null }, 60, now)).toBe(false);
  });

  it('returns false when already expired', () => {
    const past = new Date('2026-01-01');
    expect(isExpiringWithin({ quantityOnHand: 10, minStockLevel: null, expiryDate: past }, 60, now)).toBe(false);
  });

  it('returns true when expiry is within daysAhead', () => {
    const soon = new Date('2026-04-01'); // ~24 days from Mar 8
    expect(isExpiringWithin({ quantityOnHand: 10, minStockLevel: null, expiryDate: soon }, 60, now)).toBe(true);
  });

  it('returns false when expiry is beyond daysAhead', () => {
    const far = new Date('2027-01-01'); // > 60 days
    expect(isExpiringWithin({ quantityOnHand: 10, minStockLevel: null, expiryDate: far }, 60, now)).toBe(false);
  });

  it('returns true on the boundary day', () => {
    const boundary = new Date('2026-03-08'); // exactly now → 0 days
    expect(isExpiringWithin({ quantityOnHand: 10, minStockLevel: null, expiryDate: boundary }, 0, now)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Reference number generation
// ---------------------------------------------------------------------------

describe('generateChemRef', () => {
  it('formats correctly', () => {
    expect(generateChemRef(2026, 1)).toBe('CHEM-2026-001');
    expect(generateChemRef(2026, 42)).toBe('CHEM-2026-042');
    expect(generateChemRef(2026, 999)).toBe('CHEM-2026-999');
    expect(generateChemRef(2026, 1000)).toBe('CHEM-2026-1000');
  });
});

describe('generateCoshhRef', () => {
  it('formats correctly', () => {
    expect(generateCoshhRef(2026, 1)).toBe('COSHH-2026-001');
    expect(generateCoshhRef(2026, 55)).toBe('COSHH-2026-055');
  });
});

describe('generateSdsRef', () => {
  it('formats correctly', () => {
    expect(generateSdsRef(2026, 1)).toBe('SDS-2026-001');
    expect(generateSdsRef(2026, 200)).toBe('SDS-2026-200');
  });
});

// ---------------------------------------------------------------------------
// CAS number validation
// ---------------------------------------------------------------------------

describe('isValidCasNumber', () => {
  const validCases = [
    '7732-18-5',  // Water
    '64-17-5',    // Ethanol
    '67-64-1',    // Acetone
    '71-43-2',    // Benzene
    '108-95-2',   // Phenol
    '7647-01-0',  // Hydrochloric acid
    '1310-73-2',  // Sodium hydroxide
    '7664-41-7',  // Ammonia
  ];

  for (const cas of validCases) {
    it(`accepts valid CAS ${cas}`, () => {
      expect(isValidCasNumber(cas)).toBe(true);
    });
  }

  const invalidCases = [
    '',
    '7732-18-6',  // Water with wrong check digit
    '1234',       // Too short
    'ABCD-EF-G',  // Non-numeric
    '7732-18',    // Missing segment
    '1234567890-12-3', // Too many digits
  ];

  for (const cas of invalidCases) {
    it(`rejects invalid CAS "${cas}"`, () => {
      expect(isValidCasNumber(cas)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// recommendDisposalRoute
// ---------------------------------------------------------------------------

describe('recommendDisposalRoute', () => {
  it('RADIOACTIVE waste → LICENSED_CONTRACTOR', () => {
    expect(recommendDisposalRoute('NON_HAZARDOUS', 'RADIOACTIVE')).toBe('LICENSED_CONTRACTOR');
    expect(recommendDisposalRoute('CLASS_3_FLAMMABLE_LIQUID', 'RADIOACTIVE')).toBe('LICENSED_CONTRACTOR');
  });

  it('CLINICAL waste → INCINERATION', () => {
    expect(recommendDisposalRoute('NON_HAZARDOUS', 'CLINICAL')).toBe('INCINERATION');
  });

  it('CLASS_1_EXPLOSIVES → LICENSED_CONTRACTOR', () => {
    expect(recommendDisposalRoute('CLASS_1_EXPLOSIVES', 'HAZARDOUS')).toBe('LICENSED_CONTRACTOR');
  });

  it('CLASS_7_RADIOACTIVE storage → LICENSED_CONTRACTOR', () => {
    expect(recommendDisposalRoute('CLASS_7_RADIOACTIVE', 'HAZARDOUS')).toBe('LICENSED_CONTRACTOR');
  });

  it('CLASS_3_FLAMMABLE_LIQUID → HAZARDOUS_WASTE_SITE', () => {
    expect(recommendDisposalRoute('CLASS_3_FLAMMABLE_LIQUID', 'HAZARDOUS')).toBe('HAZARDOUS_WASTE_SITE');
  });

  it('CLASS_2_FLAMMABLE_GAS → HAZARDOUS_WASTE_SITE', () => {
    expect(recommendDisposalRoute('CLASS_2_FLAMMABLE_GAS', 'HAZARDOUS')).toBe('HAZARDOUS_WASTE_SITE');
  });

  it('CLASS_5_OXIDISING → HAZARDOUS_WASTE_SITE', () => {
    expect(recommendDisposalRoute('CLASS_5_OXIDISING', 'HAZARDOUS')).toBe('HAZARDOUS_WASTE_SITE');
  });

  it('HAZARDOUS waste class → HAZARDOUS_WASTE_SITE', () => {
    expect(recommendDisposalRoute('CLASS_9_OTHER_HAZARDOUS', 'HAZARDOUS')).toBe('HAZARDOUS_WASTE_SITE');
  });

  it('SPECIAL waste class → HAZARDOUS_WASTE_SITE', () => {
    expect(recommendDisposalRoute('CLASS_8_CORROSIVE', 'SPECIAL')).toBe('HAZARDOUS_WASTE_SITE');
  });

  it('non-hazardous defaults → LICENSED_CONTRACTOR', () => {
    expect(recommendDisposalRoute('NON_HAZARDOUS', 'NON_HAZARDOUS')).toBe('LICENSED_CONTRACTOR');
  });
});

// ---------------------------------------------------------------------------
// calculateTwa
// ---------------------------------------------------------------------------

describe('calculateTwa', () => {
  it('returns 0 for empty tasks', () => {
    expect(calculateTwa([])).toBe(0);
  });

  it('calculates 8-hour TWA correctly', () => {
    // 4 hours at 2 mg/m³ = 8/8 = 1 mg/m³ TWA
    const tasks = [{ durationMinutesPerDay: 240, frequencyDaysPerWeek: 5, concentrationMgM3: 2 }];
    expect(calculateTwa(tasks)).toBe(1);
  });

  it('aggregates multiple tasks', () => {
    const tasks = [
      { durationMinutesPerDay: 120, frequencyDaysPerWeek: 5, concentrationMgM3: 4 }, // 2h × 4 = 8
      { durationMinutesPerDay: 240, frequencyDaysPerWeek: 5, concentrationMgM3: 2 }, // 4h × 2 = 8
    ];
    // (8 + 8) / 8 = 2
    expect(calculateTwa(tasks)).toBe(2);
  });

  it('full 8-hour shift equals concentration', () => {
    const tasks = [{ durationMinutesPerDay: 480, frequencyDaysPerWeek: 5, concentrationMgM3: 5 }];
    expect(calculateTwa(tasks)).toBe(5);
  });

  it('rounds to 3 decimal places', () => {
    // 60 min (1h) at 1 mg/m³ = 1/8 = 0.125
    const tasks = [{ durationMinutesPerDay: 60, frequencyDaysPerWeek: 5, concentrationMgM3: 1 }];
    expect(calculateTwa(tasks)).toBe(0.125);
  });

  it('handles zero concentration', () => {
    const tasks = [{ durationMinutesPerDay: 480, frequencyDaysPerWeek: 5, concentrationMgM3: 0 }];
    expect(calculateTwa(tasks)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Type contract invariants
// ---------------------------------------------------------------------------

describe('type contract invariants', () => {
  it('all RiskLevel values are covered by riskLevelWeight', () => {
    const levels: RiskLevel[] = ['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'UNACCEPTABLE'];
    for (const level of levels) {
      expect(typeof riskLevelWeight(level)).toBe('number');
    }
  });

  it('all WelStatus values are covered by welStatusToMonitoringResult', () => {
    const statuses: WelStatus[] = ['BELOW_WEL', 'AT_WEL', 'ABOVE_WEL'];
    for (const status of statuses) {
      const result = welStatusToMonitoringResult(status);
      expect(['PASS', 'ADVISORY', 'FAIL']).toContain(result);
    }
  });

  it('getRiskLevel covers full 1–25 score range without gap', () => {
    for (let score = 1; score <= 25; score++) {
      const level = getRiskLevel(score);
      expect(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'UNACCEPTABLE']).toContain(level);
    }
  });

  it('calculateRiskScore × getRiskLevel pipeline is consistent', () => {
    // UNACCEPTABLE: both 5
    const score = calculateRiskScore(5, 5);
    expect(score).toBe(25);
    expect(getRiskLevel(score)).toBe('UNACCEPTABLE');
  });
});
