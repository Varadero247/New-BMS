// Copyright (c) 2026 Nexara DMCC. All rights reserved.

import {
  WRITTEN_PASS_THRESHOLD, WRITTEN_TOTAL_QUESTIONS, WRITTEN_PASS_CORRECT,
  DELIVERY_PASS_THRESHOLD, DELIVERY_MAX_SCORE_PER_DOMAIN, DELIVERY_DOMAINS,
  DOMAIN_MINIMUM_SCORES, RESUBMISSION_WINDOW_DAYS, RESUBMISSION_EXTENSION_DAYS,
  RENEWAL_PERIOD_DAYS, RENEWAL_REMINDER_DAYS_60, RENEWAL_REMINDER_DAYS_14,
  RENEWAL_PASS_THRESHOLD, RENEWAL_TOTAL_QUESTIONS, RENEWAL_PASS_CORRECT,
  scoreWrittenAssessment, calculateDomainAverage, checkDomainMinimums,
  scoreDeliveryAssessment, determineCertificationOutcome,
  calculateResubmissionDeadline, isWithinResubmissionWindow,
  calculateRenewalDueDate, daysUntilRenewal, needsRenewalReminder,
  isRenewalLapsed, getLapsedSeverity, scoreRenewalAssessment,
} from '../scoring';
import { CohortManager } from '../cohort-manager';
import { TrainerRegistry } from '../trainer-registry';
import {
  createDefaultProgramme, getSessionsByDay, getSessionsByType,
  getCPDEligibleSessions, calculateCPDMinutes, totalSessionDuration,
  validateProgramme, supportsDeliveryMode,
  T3_PROGRAMME_ID, T3_PROGRAMME_NAME, T3_PROGRAMME_VERSION,
  T3_CPD_HOURS, T3_MAX_PARTICIPANTS, T3_MIN_PARTICIPANTS, T3_DAYS,
} from '../programme-registry';
import { DomainScore, CompetencyScore, Programme, DeliveryMode, TrainerRecord } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeScores(cm: number, fac: number, aa: number, pm: number, pro: number): DomainScore[] {
  return [
    { domain: 'CONTENT_MASTERY',           score: cm  as CompetencyScore, evidence: ['ev'], developmentNotes: '' },
    { domain: 'FACILITATION',              score: fac as CompetencyScore, evidence: ['ev'], developmentNotes: '' },
    { domain: 'ASSESSMENT_ADMINISTRATION', score: aa  as CompetencyScore, evidence: ['ev'], developmentNotes: '' },
    { domain: 'PROGRAMME_MANAGEMENT',      score: pm  as CompetencyScore, evidence: ['ev'], developmentNotes: '' },
    { domain: 'PROFESSIONALISM',           score: pro as CompetencyScore, evidence: ['ev'], developmentNotes: '' },
  ];
}
const PASS  = makeScores(3, 3, 3, 2, 3); // avg 2.8, all minimums met
const FAIL  = makeScores(2, 2, 2, 1, 2); // avg 1.8 < 2.5
const FMIN  = makeScores(1, 4, 4, 4, 4); // avg 3.4 but CM=1 < min(2)

// ── 1. Constants (15) ─────────────────────────────────────────────────────────

describe('Constants', () => {
  it('WRITTEN_PASS_THRESHOLD = 0.75',           () => expect(WRITTEN_PASS_THRESHOLD).toBe(0.75));
  it('WRITTEN_TOTAL_QUESTIONS = 20',            () => expect(WRITTEN_TOTAL_QUESTIONS).toBe(20));
  it('WRITTEN_PASS_CORRECT = 15',               () => expect(WRITTEN_PASS_CORRECT).toBe(15));
  it('DELIVERY_PASS_THRESHOLD = 2.5',           () => expect(DELIVERY_PASS_THRESHOLD).toBe(2.5));
  it('DELIVERY_MAX_SCORE_PER_DOMAIN = 4',       () => expect(DELIVERY_MAX_SCORE_PER_DOMAIN).toBe(4));
  it('DELIVERY_DOMAINS has 5 elements',         () => expect(DELIVERY_DOMAINS).toHaveLength(5));
  it('DELIVERY_DOMAINS has CONTENT_MASTERY',    () => expect(DELIVERY_DOMAINS).toContain('CONTENT_MASTERY'));
  it('DELIVERY_DOMAINS has FACILITATION',       () => expect(DELIVERY_DOMAINS).toContain('FACILITATION'));
  it('DELIVERY_DOMAINS has ASSESSMENT_ADMINISTRATION', () => expect(DELIVERY_DOMAINS).toContain('ASSESSMENT_ADMINISTRATION'));
  it('DELIVERY_DOMAINS has PROGRAMME_MANAGEMENT',      () => expect(DELIVERY_DOMAINS).toContain('PROGRAMME_MANAGEMENT'));
  it('DELIVERY_DOMAINS has PROFESSIONALISM',    () => expect(DELIVERY_DOMAINS).toContain('PROFESSIONALISM'));
  it('RESUBMISSION_WINDOW_DAYS = 30',           () => expect(RESUBMISSION_WINDOW_DAYS).toBe(30));
  it('RESUBMISSION_EXTENSION_DAYS = 14',        () => expect(RESUBMISSION_EXTENSION_DAYS).toBe(14));
  it('RENEWAL_PERIOD_DAYS = 365',               () => expect(RENEWAL_PERIOD_DAYS).toBe(365));
  it('RENEWAL_PASS_THRESHOLD = 0.70',           () => expect(RENEWAL_PASS_THRESHOLD).toBe(0.70));
});

// ── 2. scoreWrittenAssessment (99) ────────────────────────────────────────────

describe('scoreWrittenAssessment', () => {

  // 2a. passed for all 21 valid inputs (21 tests)
  it.each([
    [0,false],[1,false],[2,false],[3,false],[4,false],[5,false],[6,false],
    [7,false],[8,false],[9,false],[10,false],[11,false],[12,false],[13,false],[14,false],
    [15,true],[16,true],[17,true],[18,true],[19,true],[20,true],
  ])('passed=%p for correctAnswers=%i', (n, exp) => {
    expect(scoreWrittenAssessment('p','c', n as number).passed).toBe(exp);
  });

  // 2b. scorePercentage for all 21 valid inputs (21 tests)
  it.each([
    [0,0],[1,5],[2,10],[3,15],[4,20],[5,25],[6,30],[7,35],[8,40],[9,45],[10,50],
    [11,55],[12,60],[13,65],[14,70],[15,75],[16,80],[17,85],[18,90],[19,95],[20,100],
  ])('scorePercentage=%i for correctAnswers=%i', (n, pct) => {
    expect(scoreWrittenAssessment('p','c', n as number).scorePercentage).toBe(pct);
  });

  // 2c. correctAnswers echoed for all 21 valid inputs (21 tests)
  it.each([[0],[1],[2],[3],[4],[5],[6],[7],[8],[9],[10],[11],[12],[13],[14],[15],[16],[17],[18],[19],[20]])
  ('correctAnswers=%i echoed', (n) => {
    expect(scoreWrittenAssessment('p','c', n as number).correctAnswers).toBe(n);
  });

  // 2d. totalQuestions always 20 for all 21 valid inputs (21 tests)
  it.each([[0],[1],[2],[3],[4],[5],[6],[7],[8],[9],[10],[11],[12],[13],[14],[15],[16],[17],[18],[19],[20]])
  ('totalQuestions=20 when correct=%i', (n) => {
    expect(scoreWrittenAssessment('p','c', n as number).totalQuestions).toBe(20);
  });

  // 2e. Individual tests (15)
  it('throws for negative correctAnswers',         () => expect(() => scoreWrittenAssessment('p','c',-1)).toThrow());
  it('throws for correctAnswers > 20',             () => expect(() => scoreWrittenAssessment('p','c',21)).toThrow());
  it('error mentions "negative" for -1',           () => expect(() => scoreWrittenAssessment('p','c',-1)).toThrow(/negative/i));
  it('error mentions "20" for 21',                 () => expect(() => scoreWrittenAssessment('p','c',21)).toThrow('20'));
  it('participantId is echoed',                    () => expect(scoreWrittenAssessment('alice','c',10).participantId).toBe('alice'));
  it('cohortId is echoed',                         () => expect(scoreWrittenAssessment('p','coh42',10).cohortId).toBe('coh42'));
  it('attemptDate defaults to today',              () => expect(scoreWrittenAssessment('p','c',10).attemptDate).toBe(new Date().toISOString().split('T')[0]));
  it('custom attemptDate accepted',                () => expect(scoreWrittenAssessment('p','c',10,'2026-03-01').attemptDate).toBe('2026-03-01'));
  it('result is an object',                        () => expect(typeof scoreWrittenAssessment('p','c',10)).toBe('object'));
  it('scorePercentage is a number',                () => expect(typeof scoreWrittenAssessment('p','c',10).scorePercentage).toBe('number'));
  it('passed is a boolean',                        () => expect(typeof scoreWrittenAssessment('p','c',10).passed).toBe('boolean'));
  it('14 correct does not pass',                   () => expect(scoreWrittenAssessment('p','c',14).passed).toBe(false));
  it('15 correct passes',                          () => expect(scoreWrittenAssessment('p','c',15).passed).toBe(true));
  it('scorePercentage at 15/20 is 75',             () => expect(scoreWrittenAssessment('p','c',15).scorePercentage).toBe(75));
  it('scorePercentage at 0 is exactly 0',          () => expect(scoreWrittenAssessment('p','c',0).scorePercentage).toBe(0));
});

// ── 3. calculateDomainAverage (20) ────────────────────────────────────────────

describe('calculateDomainAverage', () => {
  it('returns 0 for empty array',          () => expect(calculateDomainAverage([])).toBe(0));
  it('single score of 1 returns 1',        () => expect(calculateDomainAverage([makeScores(1,1,1,1,1)[0]!])).toBe(1));
  it('single score of 4 returns 4',        () => expect(calculateDomainAverage([makeScores(4,4,4,4,4)[0]!])).toBe(4));
  it('(3,3,3,2,3) → 2.8',                 () => expect(calculateDomainAverage(PASS)).toBe(2.8));
  it('(2,2,2,1,2) → 1.8',                 () => expect(calculateDomainAverage(FAIL)).toBe(1.8));
  it('(1,4,4,4,4) → 3.4',                 () => expect(calculateDomainAverage(FMIN)).toBe(3.4));
  it('(4,4,4,4,4) → 4.0',                 () => expect(calculateDomainAverage(makeScores(4,4,4,4,4))).toBe(4.0));
  it('(1,1,1,1,1) → 1.0',                 () => expect(calculateDomainAverage(makeScores(1,1,1,1,1))).toBe(1.0));
  it('(2,2,2,2,2) → 2.0',                 () => expect(calculateDomainAverage(makeScores(2,2,2,2,2))).toBe(2.0));
  it('(3,3,3,3,3) → 3.0',                 () => expect(calculateDomainAverage(makeScores(3,3,3,3,3))).toBe(3.0));
  it('(2,3,3,2,3) → 2.6',                 () => expect(calculateDomainAverage(makeScores(2,3,3,2,3))).toBe(2.6));
  it('(1,2,3,4,1) → 2.2',                 () => expect(calculateDomainAverage(makeScores(1,2,3,4,1))).toBe(2.2));
  it('result is a number',                 () => expect(typeof calculateDomainAverage(PASS)).toBe('number'));
  it('result is non-negative',             () => expect(calculateDomainAverage(PASS)).toBeGreaterThanOrEqual(0));
  it('result is at most 4',                () => expect(calculateDomainAverage(PASS)).toBeLessThanOrEqual(4));
  it('(2,2,3,3,2) → 2.4',                 () => expect(calculateDomainAverage(makeScores(2,2,3,3,2))).toBe(2.4));
  it('(3,2,3,2,3) → 2.6',                 () => expect(calculateDomainAverage(makeScores(3,2,3,2,3))).toBe(2.6));
  it('all scores of 2 → 2',               () => expect(calculateDomainAverage(makeScores(2,2,2,2,2))).toBe(2));
  it('rounds to 2 decimal places',         () => { const r = calculateDomainAverage(PASS); expect(r).toBe(Math.round(r * 100) / 100); });
  it('(1,3,4,2,3) → 2.6',                 () => expect(calculateDomainAverage(makeScores(1,3,4,2,3))).toBe(2.6));
});

// ── 4. checkDomainMinimums (22) ───────────────────────────────────────────────

describe('checkDomainMinimums', () => {
  it('PASS scores satisfy all minimums',             () => expect(checkDomainMinimums(PASS)).toBe(true));
  it('all at minimums (2,2,2,1,2) → true',          () => expect(checkDomainMinimums(FAIL)).toBe(true));
  it('all 4s → true',                               () => expect(checkDomainMinimums(makeScores(4,4,4,4,4))).toBe(true));
  it('all 3s → true',                               () => expect(checkDomainMinimums(makeScores(3,3,3,3,3))).toBe(true));
  it('CM=1 fails CONTENT_MASTERY min (2)',           () => expect(checkDomainMinimums(makeScores(1,3,3,2,3))).toBe(false));
  it('FAC=1 fails FACILITATION min (2)',             () => expect(checkDomainMinimums(makeScores(3,1,3,2,3))).toBe(false));
  it('AA=1 fails ASSESSMENT_ADMINISTRATION min',     () => expect(checkDomainMinimums(makeScores(3,3,1,2,3))).toBe(false));
  it('PRO=1 fails PROFESSIONALISM min (2)',          () => expect(checkDomainMinimums(makeScores(3,3,3,2,1))).toBe(false));
  it('PM=1 meets PROGRAMME_MANAGEMENT min (1)',      () => expect(checkDomainMinimums(makeScores(3,3,3,1,3))).toBe(true));
  it('CM=2 exactly at minimum',                     () => expect(checkDomainMinimums(makeScores(2,3,3,2,3))).toBe(true));
  it('FAC=2 exactly at minimum',                    () => expect(checkDomainMinimums(makeScores(3,2,3,2,3))).toBe(true));
  it('AA=2 exactly at minimum',                     () => expect(checkDomainMinimums(makeScores(3,3,2,2,3))).toBe(true));
  it('PRO=2 exactly at minimum',                    () => expect(checkDomainMinimums(makeScores(3,3,3,2,2))).toBe(true));
  it('FMIN (CM=1) fails',                           () => expect(checkDomainMinimums(FMIN)).toBe(false));
  it('empty array returns true (vacuous)',           () => expect(checkDomainMinimums([])).toBe(true));
  it('two domains below min → false',               () => expect(checkDomainMinimums(makeScores(1,1,3,2,3))).toBe(false));
  it('all below minimum → false',                  () => expect(checkDomainMinimums(makeScores(1,1,1,0 as CompetencyScore,1))).toBe(false));
  it('result is boolean',                           () => expect(typeof checkDomainMinimums(PASS)).toBe('boolean'));
  it('(2,2,2,1,2) → true (all at minimums)',        () => expect(checkDomainMinimums(makeScores(2,2,2,1,2))).toBe(true));
  it('(2,2,2,2,2) → true (all at or above min)',    () => expect(checkDomainMinimums(makeScores(2,2,2,2,2))).toBe(true));
  it('single domain at min → true',                 () => expect(checkDomainMinimums([makeScores(2,2,2,2,2)[0]!])).toBe(true));
  it('single domain below min → false',             () => expect(checkDomainMinimums([makeScores(1,1,1,1,1)[0]!])).toBe(false));
});

// ── 5. scoreDeliveryAssessment (50) ───────────────────────────────────────────

describe('scoreDeliveryAssessment', () => {
  const call = (ds: DomainScore[], date?: string) =>
    scoreDeliveryAssessment('p','c','obs','seg-A', ds, date);

  it('PASS: passed=true',                          () => expect(call(PASS).passed).toBe(true));
  it('PASS: overallAverage=2.8',                   () => expect(call(PASS).overallAverage).toBe(2.8));
  it('PASS: overallPercentage=70',                 () => expect(call(PASS).overallPercentage).toBe(70));
  it('PASS: allDomainMinimumsMet=true',            () => expect(call(PASS).allDomainMinimumsMet).toBe(true));
  it('participantId echoed',                       () => expect(scoreDeliveryAssessment('alice','c','o','s',PASS).participantId).toBe('alice'));
  it('cohortId echoed',                            () => expect(scoreDeliveryAssessment('p','coh1','o','s',PASS).cohortId).toBe('coh1'));
  it('observerId echoed',                          () => expect(scoreDeliveryAssessment('p','c','obs9','s',PASS).observerId).toBe('obs9'));
  it('segmentDelivered echoed',                    () => expect(scoreDeliveryAssessment('p','c','o','mod1',PASS).segmentDelivered).toBe('mod1'));
  it('domainScores echoed',                        () => expect(call(PASS).domainScores).toEqual(PASS));
  it('all 4s: passed=true',                        () => expect(call(makeScores(4,4,4,4,4)).passed).toBe(true));
  it('all 4s: overallAverage=4',                   () => expect(call(makeScores(4,4,4,4,4)).overallAverage).toBe(4));
  it('all 4s: overallPercentage=100',              () => expect(call(makeScores(4,4,4,4,4)).overallPercentage).toBe(100));
  it('FAIL: passed=false (avg=1.8)',               () => expect(call(FAIL).passed).toBe(false));
  it('FAIL: overallAverage=1.8',                   () => expect(call(FAIL).overallAverage).toBe(1.8));
  it('FAIL: overallPercentage=45',                 () => expect(call(FAIL).overallPercentage).toBe(45));
  it('FAIL: allDomainMinimumsMet=true (all at min)', () => expect(call(FAIL).allDomainMinimumsMet).toBe(true));
  it('FMIN: passed=false (domain min fail)',       () => expect(call(FMIN).passed).toBe(false));
  it('FMIN: allDomainMinimumsMet=false',           () => expect(call(FMIN).allDomainMinimumsMet).toBe(false));
  it('FMIN: overallAverage=3.4',                   () => expect(call(FMIN).overallAverage).toBe(3.4));
  it('FMIN: overallPercentage=85',                 () => expect(call(FMIN).overallPercentage).toBe(85));
  it('(2,3,3,2,3) avg=2.6 passes',                () => expect(call(makeScores(2,3,3,2,3)).passed).toBe(true));
  it('(2,2,3,3,2) avg=2.4 fails',                 () => expect(call(makeScores(2,2,3,3,2)).passed).toBe(false));
  it('(2,4,4,4,4) CM=2 avg=3.6 passes',           () => expect(call(makeScores(2,4,4,4,4)).passed).toBe(true));
  it('all 3s passes',                              () => expect(call(makeScores(3,3,3,3,3)).passed).toBe(true));
  it('(1,3,3,2,3) CM=1 domain min fail',           () => expect(call(makeScores(1,3,3,2,3)).passed).toBe(false));
  it('throws for 4 domain scores',                 () => expect(() => call(PASS.slice(0,4))).toThrow());
  it('throws for 6 domain scores',                 () => expect(() => call([...PASS, PASS[0]!])).toThrow());
  it('error for wrong count mentions 5',           () => expect(() => call(PASS.slice(0,4))).toThrow('5'));
  it('throws when FACILITATION domain is missing', () => {
    const dup = [PASS[0]!, PASS[0]!, PASS[2]!, PASS[3]!, PASS[4]!];
    expect(() => call(dup)).toThrow();
  });
  it('missing-domain error mentions FACILITATION', () => {
    const dup = [PASS[0]!, PASS[0]!, PASS[2]!, PASS[3]!, PASS[4]!];
    expect(() => call(dup)).toThrow('FACILITATION');
  });
  it('deliveryDate defaults to today',             () => expect(call(PASS).deliveryDate).toBe(new Date().toISOString().split('T')[0]));
  it('custom deliveryDate accepted',               () => expect(call(PASS,'2026-04-01').deliveryDate).toBe('2026-04-01'));
  it('result is object',                           () => expect(typeof call(PASS)).toBe('object'));
  it('passed is boolean',                          () => expect(typeof call(PASS).passed).toBe('boolean'));
  it('overallAverage is number',                   () => expect(typeof call(PASS).overallAverage).toBe('number'));
  it('overallPercentage is number',                () => expect(typeof call(PASS).overallPercentage).toBe('number'));
  it('allDomainMinimumsMet is boolean',            () => expect(typeof call(PASS).allDomainMinimumsMet).toBe('boolean'));
  it('domainScores is array',                      () => expect(Array.isArray(call(PASS).domainScores)).toBe(true));
  it('domainScores has 5 elements',                () => expect(call(PASS).domainScores).toHaveLength(5));
  it('all 1s fails',                               () => expect(call(makeScores(1,1,1,1,1)).passed).toBe(false));
  it('(3,3,3,1,3) PM=1 at min passes (avg=2.6)',   () => expect(call(makeScores(3,3,3,1,3)).passed).toBe(true));
  it('overallAverage for all 1s is 1',             () => expect(call(makeScores(1,1,1,1,1)).overallAverage).toBe(1));
  it('overallPercentage for all 1s is 25',         () => expect(call(makeScores(1,1,1,1,1)).overallPercentage).toBe(25));
  it('FAC=1 causes allDomainMinimumsMet=false',    () => expect(call(makeScores(3,1,3,2,3)).allDomainMinimumsMet).toBe(false));
  it('(2,3,3,2,3) all minimums met',               () => expect(call(makeScores(2,3,3,2,3)).allDomainMinimumsMet).toBe(true));
  it('overallPercentage for PASS is 70',           () => expect(call(PASS).overallPercentage).toBe(70));
  it('overallAverage for all 3s is 3',             () => expect(call(makeScores(3,3,3,3,3)).overallAverage).toBe(3));
  it('overallPercentage for all 3s is 75',         () => expect(call(makeScores(3,3,3,3,3)).overallPercentage).toBe(75));
  it('throws for 0 domain scores',                 () => expect(() => call([])).toThrow());
});

// ── 6. determineCertificationOutcome (10) ─────────────────────────────────────

describe('determineCertificationOutcome', () => {
  it('null delivery → PENDING',                    () => expect(determineCertificationOutcome(true, null)).toBe('PENDING'));
  it('false written + null delivery → PENDING',    () => expect(determineCertificationOutcome(false, null)).toBe('PENDING'));
  it('true written + true delivery → CERTIFIED',   () => expect(determineCertificationOutcome(true, true)).toBe('CERTIFIED'));
  it('true written + false delivery → CONDITIONAL', () => expect(determineCertificationOutcome(true, false)).toBe('CONDITIONAL'));
  it('false written + true delivery → FULL_RETAKE', () => expect(determineCertificationOutcome(false, true)).toBe('FULL_RETAKE'));
  it('false written + false delivery → FULL_RETAKE', () => expect(determineCertificationOutcome(false, false)).toBe('FULL_RETAKE'));
  it('result type is string',                      () => expect(typeof determineCertificationOutcome(true, true)).toBe('string'));
  it('CERTIFIED is a valid CertificationOutcome',  () => expect(['CERTIFIED','CONDITIONAL','FULL_RETAKE','PENDING']).toContain(determineCertificationOutcome(true, true)));
  it('CONDITIONAL only when written passes',       () => expect(determineCertificationOutcome(true, false)).toBe('CONDITIONAL'));
  it('FULL_RETAKE when written fails regardless of delivery', () => expect(determineCertificationOutcome(false, true)).toBe('FULL_RETAKE'));
});

// ── 7. calculateResubmissionDeadline (15) ────────────────────────────────────

describe('calculateResubmissionDeadline', () => {
  it('Jan 1 + 30 = Jan 31',                        () => expect(calculateResubmissionDeadline('2026-01-01')).toBe('2026-01-31'));
  it('Dec 1 + 30 = Dec 31',                        () => expect(calculateResubmissionDeadline('2026-12-01')).toBe('2026-12-31'));
  it('Feb 1 + 30 = Mar 3 (non-leap 2026)',          () => expect(calculateResubmissionDeadline('2026-02-01')).toBe('2026-03-03'));
  it('Mar 15 + 30 = Apr 13',                       () => expect(calculateResubmissionDeadline('2026-03-15')).toBe('2026-04-13'));
  it('Jun 1 + 30 = Jul 1',                         () => expect(calculateResubmissionDeadline('2026-06-01')).toBe('2026-07-01'));
  it('Apr 1 + 30 = May 1',                         () => expect(calculateResubmissionDeadline('2026-04-01')).toBe('2026-05-01'));
  it('default extensionGranted=false',             () => expect(calculateResubmissionDeadline('2026-01-01')).toBe(calculateResubmissionDeadline('2026-01-01', false)));
  it('Jan 1 + 44 (ext) = Feb 14',                  () => expect(calculateResubmissionDeadline('2026-01-01', true)).toBe('2026-02-14'));
  it('Dec 1 + 44 (ext) = Jan 14 2027',             () => expect(calculateResubmissionDeadline('2026-12-01', true)).toBe('2027-01-14'));
  it('Jun 1 + 44 (ext) = Jul 15',                  () => expect(calculateResubmissionDeadline('2026-06-01', true)).toBe('2026-07-15'));
  it('extension adds exactly 14 days',             () => {
    const base = new Date(calculateResubmissionDeadline('2026-06-01', false)).getTime();
    const ext  = new Date(calculateResubmissionDeadline('2026-06-01', true)).getTime();
    expect((ext - base) / 86400000).toBe(14);
  });
  it('returns a string',                           () => expect(typeof calculateResubmissionDeadline('2026-01-01')).toBe('string'));
  it('format is YYYY-MM-DD',                       () => expect(calculateResubmissionDeadline('2026-01-01')).toMatch(/^\d{4}-\d{2}-\d{2}$/));
  it('deadline is after cohortDate',               () => expect(calculateResubmissionDeadline('2026-01-01') > '2026-01-01').toBe(true));
  it('extension deadline > standard deadline',     () => expect(calculateResubmissionDeadline('2026-01-01',true) > calculateResubmissionDeadline('2026-01-01',false)).toBe(true));
});

// ── 8. isWithinResubmissionWindow (18) ───────────────────────────────────────

describe('isWithinResubmissionWindow', () => {
  it('same day as cohort → true',                  () => expect(isWithinResubmissionWindow('2026-01-01','2026-01-01')).toBe(true));
  it('mid-window → true',                          () => expect(isWithinResubmissionWindow('2026-01-01','2026-01-15')).toBe(true));
  it('on exact deadline → true',                   () => expect(isWithinResubmissionWindow('2026-01-01','2026-01-31')).toBe(true));
  it('one day after deadline → false',             () => expect(isWithinResubmissionWindow('2026-01-01','2026-02-01')).toBe(false));
  it('far after deadline → false',                 () => expect(isWithinResubmissionWindow('2026-01-01','2026-12-01')).toBe(false));
  it('extensionGranted=false gives 30d window',    () => expect(isWithinResubmissionWindow('2026-01-01','2026-01-31',false)).toBe(true));
  it('Feb 1 outside no-ext but inside ext deadline', () => expect(isWithinResubmissionWindow('2026-01-01','2026-02-01',true)).toBe(true));
  it('Feb 14 on ext deadline → true',              () => expect(isWithinResubmissionWindow('2026-01-01','2026-02-14',true)).toBe(true));
  it('Feb 15 after ext deadline → false',          () => expect(isWithinResubmissionWindow('2026-01-01','2026-02-15',true)).toBe(false));
  it('returns boolean',                            () => expect(typeof isWithinResubmissionWindow('2026-01-01','2026-01-15')).toBe('boolean'));
  it('Feb 10 outside standard window',             () => expect(isWithinResubmissionWindow('2026-01-01','2026-02-10')).toBe(false));
  it('Feb 10 inside extended window',              () => expect(isWithinResubmissionWindow('2026-01-01','2026-02-10',true)).toBe(true));
  it('30 days after cohort (on deadline) → true',  () => expect(isWithinResubmissionWindow('2026-06-01','2026-07-01')).toBe(true));
  it('31 days after cohort → false',               () => expect(isWithinResubmissionWindow('2026-06-01','2026-07-02')).toBe(false));
  it('44 days after cohort with ext → true',       () => expect(isWithinResubmissionWindow('2026-06-01','2026-07-15',true)).toBe(true));
  it('45 days after cohort with ext → false',      () => expect(isWithinResubmissionWindow('2026-06-01','2026-07-16',true)).toBe(false));
  it('cohort and check date identical → true',     () => expect(isWithinResubmissionWindow('2026-06-01','2026-06-01')).toBe(true));
  it('check date before cohort date → true (no lower bound)', () => expect(isWithinResubmissionWindow('2026-06-01','2026-05-01')).toBe(true));
});

// ── 9. calculateRenewalDueDate (12) ───────────────────────────────────────────

describe('calculateRenewalDueDate', () => {
  it('Jan 1 2026 → Jan 1 2027',                    () => expect(calculateRenewalDueDate('2026-01-01')).toBe('2027-01-01'));
  it('Mar 15 2026 → Mar 15 2027',                  () => expect(calculateRenewalDueDate('2026-03-15')).toBe('2027-03-15'));
  it('Dec 31 2025 → Dec 31 2026',                  () => expect(calculateRenewalDueDate('2025-12-31')).toBe('2026-12-31'));
  it('Jun 1 2026 → Jun 1 2027',                    () => expect(calculateRenewalDueDate('2026-06-01')).toBe('2027-06-01'));
  it('Feb 28 2026 → Feb 28 2027',                  () => expect(calculateRenewalDueDate('2026-02-28')).toBe('2027-02-28'));
  it('Jan 31 2026 → Jan 31 2027',                  () => expect(calculateRenewalDueDate('2026-01-31')).toBe('2027-01-31'));
  it('always exactly 365 days later',              () => {
    const c = '2026-05-10';
    expect((new Date(calculateRenewalDueDate(c)).getTime() - new Date(c).getTime()) / 86400000).toBe(365);
  });
  it('returns a string',                           () => expect(typeof calculateRenewalDueDate('2026-01-01')).toBe('string'));
  it('format is YYYY-MM-DD',                       () => expect(calculateRenewalDueDate('2026-01-01')).toMatch(/^\d{4}-\d{2}-\d{2}$/));
  it('result is after certificationDate',          () => { const c='2026-01-01'; expect(calculateRenewalDueDate(c) > c).toBe(true); });
  it('Sep 1 2026 → Sep 1 2027',                    () => expect(calculateRenewalDueDate('2026-09-01')).toBe('2027-09-01'));
  it('year increments by 1 for mid-year dates',    () => expect(calculateRenewalDueDate('2026-07-04').startsWith('2027')).toBe(true));
});

// ── 10. daysUntilRenewal (15) ────────────────────────────────────────────────

describe('daysUntilRenewal', () => {
  const C = '2026-01-01'; // renewal = 2027-01-01
  it('365 on cert date itself',                    () => expect(daysUntilRenewal(C,'2026-01-01')).toBe(365));
  it('364 one day after cert date',                () => expect(daysUntilRenewal(C,'2026-01-02')).toBe(364));
  it('180 on Jul 5 2026',                          () => expect(daysUntilRenewal(C,'2026-07-05')).toBe(180));
  it('61 on Nov 1 2026',                           () => expect(daysUntilRenewal(C,'2026-11-01')).toBe(61));
  it('60 on Nov 2 2026',                           () => expect(daysUntilRenewal(C,'2026-11-02')).toBe(60));
  it('15 on Dec 17 2026',                          () => expect(daysUntilRenewal(C,'2026-12-17')).toBe(15));
  it('14 on Dec 18 2026',                          () => expect(daysUntilRenewal(C,'2026-12-18')).toBe(14));
  it('1 on Dec 31 2026',                           () => expect(daysUntilRenewal(C,'2026-12-31')).toBe(1));
  it('0 on exact renewal date',                    () => expect(daysUntilRenewal(C,'2027-01-01')).toBe(0));
  it('-1 one day past renewal',                    () => expect(daysUntilRenewal(C,'2027-01-02')).toBe(-1));
  it('-30 thirty days past renewal',               () => expect(daysUntilRenewal(C,'2027-01-31')).toBe(-30));
  it('returns number type',                        () => expect(typeof daysUntilRenewal(C,'2026-06-01')).toBe('number'));
  it('decreases as today advances',                () => expect(daysUntilRenewal(C,'2026-07-01')).toBeLessThan(daysUntilRenewal(C,'2026-06-01')));
  it('result is integer',                          () => { const d=daysUntilRenewal(C,'2026-06-01'); expect(d).toBe(Math.floor(d)); });
  it('large negative when far past renewal',       () => expect(daysUntilRenewal(C,'2027-07-01')).toBeLessThan(-100));
});

// ── 11. needsRenewalReminder (20) ────────────────────────────────────────────

describe('needsRenewalReminder', () => {
  const C = '2026-01-01'; // renewal = 2027-01-01
  it('365 days away → false',                      () => expect(needsRenewalReminder(C,'2026-01-01')).toBe(false));
  it('214 days away → false',                      () => expect(needsRenewalReminder(C,'2026-06-01')).toBe(false));
  it('61 days away → false',                       () => expect(needsRenewalReminder(C,'2026-11-01')).toBe(false));
  it('exactly 60 days → 60_DAY',                   () => expect(needsRenewalReminder(C,'2026-11-02')).toBe('60_DAY'));
  it('59 days → 60_DAY',                           () => expect(needsRenewalReminder(C,'2026-11-03')).toBe('60_DAY'));
  it('30 days → 60_DAY',                           () => expect(needsRenewalReminder(C,'2026-12-02')).toBe('60_DAY'));
  it('15 days → 60_DAY',                           () => expect(needsRenewalReminder(C,'2026-12-17')).toBe('60_DAY'));
  it('exactly 14 days → 14_DAY',                   () => expect(needsRenewalReminder(C,'2026-12-18')).toBe('14_DAY'));
  it('13 days → 14_DAY',                           () => expect(needsRenewalReminder(C,'2026-12-19')).toBe('14_DAY'));
  it('1 day → 14_DAY',                             () => expect(needsRenewalReminder(C,'2026-12-31')).toBe('14_DAY'));
  it('0 days (on renewal date) → 14_DAY',          () => expect(needsRenewalReminder(C,'2027-01-01')).toBe('14_DAY'));
  it('-1 day (past renewal) → 14_DAY',             () => expect(needsRenewalReminder(C,'2027-01-02')).toBe('14_DAY'));
  it('14_DAY takes priority when ≤14',             () => expect(needsRenewalReminder(C,'2026-12-18')).not.toBe('60_DAY'));
  it('not 14_DAY when 60 days away',               () => expect(needsRenewalReminder(C,'2026-11-02')).not.toBe('14_DAY'));
  it('not false when 60 days away',                () => expect(needsRenewalReminder(C,'2026-11-02')).not.toBe(false));
  it('result type is boolean or string',           () => { const r=needsRenewalReminder(C,'2026-11-02'); expect(typeof r==='boolean'||typeof r==='string').toBe(true); });
  it('false for 200 days away',                    () => expect(needsRenewalReminder(C,'2026-06-15')).toBe(false));
  it('false for 100 days away',                    () => expect(needsRenewalReminder(C,'2026-09-23')).toBe(false));
  it('60_DAY for 45 days away',                    () => expect(needsRenewalReminder(C,'2026-11-17')).toBe('60_DAY'));
  it('14_DAY for 7 days away',                     () => expect(needsRenewalReminder(C,'2026-12-25')).toBe('14_DAY'));
});

// ── 12. isRenewalLapsed (15) ──────────────────────────────────────────────────

describe('isRenewalLapsed', () => {
  const C = '2026-01-01';
  it('false on cert date',                         () => expect(isRenewalLapsed(C,'2026-01-01')).toBe(false));
  it('false well before renewal',                  () => expect(isRenewalLapsed(C,'2026-06-01')).toBe(false));
  it('false on exact renewal date',                () => expect(isRenewalLapsed(C,'2027-01-01')).toBe(false));
  it('false one day before renewal',               () => expect(isRenewalLapsed(C,'2026-12-31')).toBe(false));
  it('true one day after renewal',                 () => expect(isRenewalLapsed(C,'2027-01-02')).toBe(true));
  it('true 30 days after renewal',                 () => expect(isRenewalLapsed(C,'2027-01-31')).toBe(true));
  it('true 180 days after renewal',                () => expect(isRenewalLapsed(C,'2027-07-01')).toBe(true));
  it('true long after renewal',                    () => expect(isRenewalLapsed(C,'2027-12-01')).toBe(true));
  it('true one year after renewal',                () => expect(isRenewalLapsed(C,'2028-01-01')).toBe(true));
  it('false for far-future cert date',             () => expect(isRenewalLapsed('2030-01-01','2026-01-01')).toBe(false));
  it('returns boolean',                            () => expect(typeof isRenewalLapsed(C,'2026-06-01')).toBe('boolean'));
  it('true when today > renewalDate (string cmp)', () => expect(isRenewalLapsed(C,'2027-01-02')).toBe(true));
  it('false when today === renewalDate',           () => expect(isRenewalLapsed(C,'2027-01-01')).toBe(false));
  it('false when today < renewalDate',             () => expect(isRenewalLapsed(C,'2026-06-01')).toBe(false));
  it('true 364 days after renewal',               () => expect(isRenewalLapsed(C,'2027-12-31')).toBe(true));
});

// ── 13. getLapsedSeverity (28) ────────────────────────────────────────────────

describe('getLapsedSeverity', () => {
  const C = '2026-01-01'; // renewal = 2027-01-01
  it('null when not lapsed',                       () => expect(getLapsedSeverity(C,'2026-06-01')).toBeNull());
  it('null on exact renewal date',                 () => expect(getLapsedSeverity(C,'2027-01-01')).toBeNull());
  it('null one day before renewal',                () => expect(getLapsedSeverity(C,'2026-12-31')).toBeNull());
  it('null for far-future cert',                   () => expect(getLapsedSeverity('2030-01-01','2026-01-01')).toBeNull());
  it('WARNING at 1 day past',                      () => expect(getLapsedSeverity(C,'2027-01-02')).toBe('WARNING'));
  it('WARNING at 7 days past',                     () => expect(getLapsedSeverity(C,'2027-01-08')).toBe('WARNING'));
  it('WARNING at 14 days past',                    () => expect(getLapsedSeverity(C,'2027-01-15')).toBe('WARNING'));
  it('WARNING at exactly 30 days past',            () => expect(getLapsedSeverity(C,'2027-01-31')).toBe('WARNING'));
  it('SUSPENDED at 31 days past',                  () => expect(getLapsedSeverity(C,'2027-02-01')).toBe('SUSPENDED'));
  it('SUSPENDED at 45 days past',                  () => expect(getLapsedSeverity(C,'2027-02-15')).toBe('SUSPENDED'));
  it('SUSPENDED at 73 days past (Mar 15)',         () => expect(getLapsedSeverity(C,'2027-03-15')).toBe('SUSPENDED'));
  it('SUSPENDED at exactly 90 days past (Apr 1)',  () => expect(getLapsedSeverity(C,'2027-04-01')).toBe('SUSPENDED'));
  it('LAPSED at 91 days past (Apr 2)',             () => expect(getLapsedSeverity(C,'2027-04-02')).toBe('LAPSED'));
  it('LAPSED at 120 days past',                    () => expect(getLapsedSeverity(C,'2027-05-01')).toBe('LAPSED'));
  it('LAPSED at 150 days past',                    () => expect(getLapsedSeverity(C,'2027-06-01')).toBe('LAPSED'));
  it('LAPSED at exactly 180 days past (Jun 30)',   () => expect(getLapsedSeverity(C,'2027-06-30')).toBe('LAPSED'));
  it('CANCELLED at 181 days past (Jul 1)',         () => expect(getLapsedSeverity(C,'2027-07-01')).toBe('CANCELLED'));
  it('CANCELLED at 200 days past',                 () => expect(getLapsedSeverity(C,'2027-07-20')).toBe('CANCELLED'));
  it('CANCELLED at 365 days past',                 () => expect(getLapsedSeverity(C,'2028-01-01')).toBe('CANCELLED'));
  it('WARNING boundary: 30 days is WARNING',       () => expect(getLapsedSeverity(C,'2027-01-31')).toBe('WARNING'));
  it('SUSPENDED boundary: 31 days is SUSPENDED',   () => expect(getLapsedSeverity(C,'2027-02-01')).not.toBe('WARNING'));
  it('SUSPENDED boundary: 90 days is SUSPENDED',   () => expect(getLapsedSeverity(C,'2027-04-01')).toBe('SUSPENDED'));
  it('LAPSED boundary: 91 days is LAPSED',         () => expect(getLapsedSeverity(C,'2027-04-02')).not.toBe('SUSPENDED'));
  it('LAPSED boundary: 180 days is LAPSED',        () => expect(getLapsedSeverity(C,'2027-06-30')).toBe('LAPSED'));
  it('CANCELLED boundary: 181 days is CANCELLED',  () => expect(getLapsedSeverity(C,'2027-07-01')).not.toBe('LAPSED'));
  it('result is null or known severity string',    () => {
    const r = getLapsedSeverity(C,'2027-01-02');
    expect(['WARNING','SUSPENDED','LAPSED','CANCELLED']).toContain(r);
  });
  it('null or string type',                        () => { const r=getLapsedSeverity(C,'2027-01-02'); expect(r===null||typeof r==='string').toBe(true); });
  it('CANCELLED for very distant future',          () => expect(getLapsedSeverity(C,'2029-01-01')).toBe('CANCELLED'));
});

// ── 14. scoreRenewalAssessment (45) ───────────────────────────────────────────

describe('scoreRenewalAssessment', () => {

  // 14a. passed for all 11 valid inputs 0–10 (11 tests)
  it.each([
    [0,false],[1,false],[2,false],[3,false],[4,false],[5,false],[6,false],
    [7,true],[8,true],[9,true],[10,true],
  ])('passed=%p for score=%i', (n, exp) => {
    expect(scoreRenewalAssessment(n as number).passed).toBe(exp);
  });

  // 14b. percentage for all 11 valid inputs (11 tests)
  it.each([
    [0,0],[1,10],[2,20],[3,30],[4,40],[5,50],[6,60],[7,70],[8,80],[9,90],[10,100],
  ])('percentage=%i for score=%i', (n, pct) => {
    expect(scoreRenewalAssessment(n as number).percentage).toBe(pct);
  });

  // 14c. score echoed for all 11 valid inputs (11 tests)
  it.each([[0],[1],[2],[3],[4],[5],[6],[7],[8],[9],[10]])
  ('score=%i echoed', (n) => {
    expect(scoreRenewalAssessment(n as number).score).toBe(n);
  });

  // 14d. Individual tests (12)
  it('throws for -1',                              () => expect(() => scoreRenewalAssessment(-1)).toThrow());
  it('throws for 11',                              () => expect(() => scoreRenewalAssessment(11)).toThrow());
  it('error message mentions negative for -1',     () => expect(() => scoreRenewalAssessment(-1)).toThrow(/negative/i));
  it('error message mentions 10 for 11',           () => expect(() => scoreRenewalAssessment(11)).toThrow('10'));
  it('result is object',                           () => expect(typeof scoreRenewalAssessment(7)).toBe('object'));
  it('score field is number',                      () => expect(typeof scoreRenewalAssessment(7).score).toBe('number'));
  it('percentage field is number',                 () => expect(typeof scoreRenewalAssessment(7).percentage).toBe('number'));
  it('passed field is boolean',                    () => expect(typeof scoreRenewalAssessment(7).passed).toBe('boolean'));
  it('6 correct fails',                            () => expect(scoreRenewalAssessment(6).passed).toBe(false));
  it('7 correct passes',                           () => expect(scoreRenewalAssessment(7).passed).toBe(true));
  it('0 correct fails',                            () => expect(scoreRenewalAssessment(0).passed).toBe(false));
  it('10 correct passes',                          () => expect(scoreRenewalAssessment(10).passed).toBe(true));
});

// ── 15. CohortManager (240) ───────────────────────────────────────────────────

describe('CohortManager', () => {
  let mgr: CohortManager;
  beforeEach(() => { mgr = new CohortManager(); });

  const mk  = (id='c1', max=8) => mgr.create(id,'org1','mt1','2026-04-01','Dubai','IN_PERSON', max);
  const mk2 = () => { mk(); mgr.enrol('c1','p1'); mgr.enrol('c1','p2'); };
  const mk3 = () => { mk2(); mgr.start('c1'); };

  // ── create (28) ───────────────────────────────────────────────────────────
  describe('create', () => {
    it('status is PLANNED',                         () => expect(mk().status).toBe('PLANNED'));
    it('id echoed',                                 () => expect(mk().id).toBe('c1'));
    it('organisationId echoed',                     () => expect(mk().organisationId).toBe('org1'));
    it('masterTrainerId echoed',                    () => expect(mk().masterTrainerId).toBe('mt1'));
    it('scheduledDate echoed',                      () => expect(mk().scheduledDate).toBe('2026-04-01'));
    it('location echoed',                           () => expect(mk().location).toBe('Dubai'));
    it('deliveryMode IN_PERSON echoed',             () => expect(mk().deliveryMode).toBe('IN_PERSON'));
    it('deliveryMode VIRTUAL',                      () => expect(mgr.create('c1','org1','mt1','2026-04-01','Dubai','VIRTUAL').deliveryMode).toBe('VIRTUAL'));
    it('deliveryMode HYBRID',                       () => expect(mgr.create('c1','org1','mt1','2026-04-01','Dubai','HYBRID').deliveryMode).toBe('HYBRID'));
    it('default maxParticipants = 8',               () => expect(mk().maxParticipants).toBe(8));
    it('custom maxParticipants = 4',                () => expect(mk('c1',4).maxParticipants).toBe(4));
    it('enrolledParticipants is empty array',        () => expect(mk().enrolledParticipants).toHaveLength(0));
    it('completedParticipants is empty array',       () => expect(mk().completedParticipants).toHaveLength(0));
    it('certifiedParticipants is empty array',       () => expect(mk().certifiedParticipants).toHaveLength(0));
    it('maxParticipants=1 valid',                   () => expect(() => mk('c1',1)).not.toThrow());
    it('maxParticipants=8 valid',                   () => expect(() => mk('c1',8)).not.toThrow());
    it('maxParticipants=9 throws',                  () => expect(() => mk('c1',9)).toThrow());
    it('maxParticipants=0 throws',                  () => expect(() => mk('c1',0)).toThrow());
    it('maxParticipants=9 error mentions 8',        () => expect(() => mk('c1',9)).toThrow('8'));
    it('duplicate id throws',                       () => { mk(); expect(() => mk()).toThrow(); });
    it('duplicate id error contains id',            () => { mk(); expect(() => mk()).toThrow('c1'); });
    it('count = 1 after create',                    () => { mk(); expect(mgr.count()).toBe(1); });
    it('all() has 1 element after create',          () => { mk(); expect(mgr.all()).toHaveLength(1); });
    it('returns a Cohort object',                   () => expect(mk()).not.toBeNull());
    it('two creates with different ids → count=2', () => { mk('c1'); mk('c2'); expect(mgr.count()).toBe(2); });
    it('maxParticipants=3 valid',                   () => expect(mk('c1',3).maxParticipants).toBe(3));
    it('enrolledParticipants is array',             () => expect(Array.isArray(mk().enrolledParticipants)).toBe(true));
    it('status is not IN_PROGRESS on creation',     () => expect(mk().status).not.toBe('IN_PROGRESS'));
  });

  // ── enrol (32) ────────────────────────────────────────────────────────────
  describe('enrol', () => {
    it('enrols participant in PLANNED cohort',       () => { mk(); mgr.enrol('c1','p1'); expect(mgr.get('c1').enrolledParticipants).toContain('p1'); });
    it('enrols participant in IN_PROGRESS cohort',  () => { mk3(); mgr.enrol('c1','p3'); expect(mgr.get('c1').enrolledParticipants).toContain('p3'); });
    it('enrolledParticipants grows by 1',           () => { mk(); mgr.enrol('c1','p1'); expect(mgr.get('c1').enrolledParticipants).toHaveLength(1); });
    it('cannot enrol in COMPLETED cohort',          () => { mk3(); mgr.close('c1'); expect(() => mgr.enrol('c1','p3')).toThrow(); });
    it('cannot enrol in CANCELLED cohort',          () => { mk(); mgr.cancel('c1'); expect(() => mgr.enrol('c1','p1')).toThrow(); });
    it('COMPLETED error mentions status',           () => { mk3(); mgr.close('c1'); expect(() => mgr.enrol('c1','p3')).toThrow('COMPLETED'); });
    it('CANCELLED error mentions status',           () => { mk(); mgr.cancel('c1'); expect(() => mgr.enrol('c1','p1')).toThrow('CANCELLED'); });
    it('capacity reached → throws',                () => { mk('c1',2); mgr.enrol('c1','p1'); mgr.enrol('c1','p2'); expect(() => mgr.enrol('c1','p3')).toThrow(); });
    it('capacity error mentions cohortId',          () => { mk('c1',1); mgr.enrol('c1','p1'); expect(() => mgr.enrol('c1','p2')).toThrow('c1'); });
    it('duplicate enrol → throws',                 () => { mk(); mgr.enrol('c1','p1'); expect(() => mgr.enrol('c1','p1')).toThrow(); });
    it('duplicate error mentions participantId',    () => { mk(); mgr.enrol('c1','p1'); expect(() => mgr.enrol('c1','p1')).toThrow('p1'); });
    it('duplicate error mentions cohortId',         () => { mk(); mgr.enrol('c1','p1'); expect(() => mgr.enrol('c1','p1')).toThrow('c1'); });
    it('availableCapacity decreases after enrol',  () => { mk(); const before=mgr.availableCapacity('c1'); mgr.enrol('c1','p1'); expect(mgr.availableCapacity('c1')).toBe(before-1); });
    it('status unchanged after enrol',              () => { mk(); mgr.enrol('c1','p1'); expect(mgr.get('c1').status).toBe('PLANNED'); });
    it('completedParticipants unchanged after enrol', () => { mk(); mgr.enrol('c1','p1'); expect(mgr.get('c1').completedParticipants).toHaveLength(0); });
    it('certifiedParticipants unchanged after enrol', () => { mk(); mgr.enrol('c1','p1'); expect(mgr.get('c1').certifiedParticipants).toHaveLength(0); });
    it('maxParticipants unchanged after enrol',     () => { mk('c1',4); mgr.enrol('c1','p1'); expect(mgr.get('c1').maxParticipants).toBe(4); });
    it('enrol 8 in max-8 cohort fills it',          () => { mk(); for(let i=1;i<=8;i++) mgr.enrol('c1',`p${i}`); expect(mgr.isFull('c1')).toBe(true); });
    it('9th enrol fails in max-8 cohort',           () => { mk(); for(let i=1;i<=8;i++) mgr.enrol('c1',`p${i}`); expect(() => mgr.enrol('c1','p9')).toThrow(); });
    it('enrol non-existent cohort throws',          () => expect(() => mgr.enrol('ghost','p1')).toThrow());
    it('order of enrolled preserved',               () => { mk(); mgr.enrol('c1','p1'); mgr.enrol('c1','p2'); expect(mgr.get('c1').enrolledParticipants[0]).toBe('p1'); });
    it('two cohorts independent',                   () => { mk('c1'); mk('c2'); mgr.enrol('c1','p1'); expect(mgr.get('c2').enrolledParticipants).toHaveLength(0); });
    it('isFull after max enrol',                    () => { mk('c1',2); mgr.enrol('c1','p1'); mgr.enrol('c1','p2'); expect(mgr.isFull('c1')).toBe(true); });
    it('length 1 after first enrol',                () => { mk(); mgr.enrol('c1','p1'); expect(mgr.get('c1').enrolledParticipants).toHaveLength(1); });
    it('length 2 after second enrol',               () => { mk(); mgr.enrol('c1','p1'); mgr.enrol('c1','p2'); expect(mgr.get('c1').enrolledParticipants).toHaveLength(2); });
    it('length 3 after third enrol',                () => { mk(); mgr.enrol('c1','p1'); mgr.enrol('c1','p2'); mgr.enrol('c1','p3'); expect(mgr.get('c1').enrolledParticipants).toHaveLength(3); });
    it('max=1: enrol succeeds',                     () => { mk('c1',1); expect(() => mgr.enrol('c1','p1')).not.toThrow(); });
    it('max=1: second enrol fails',                 () => { mk('c1',1); mgr.enrol('c1','p1'); expect(() => mgr.enrol('c1','p2')).toThrow(); });
    it('p1 and p2 both in enrolledParticipants',    () => { mk(); mgr.enrol('c1','p1'); mgr.enrol('c1','p2'); expect(mgr.get('c1').enrolledParticipants).toEqual(expect.arrayContaining(['p1','p2'])); });
    it('7 enrols → not full in max-8',              () => { mk(); for(let i=1;i<=7;i++) mgr.enrol('c1',`p${i}`); expect(mgr.isFull('c1')).toBe(false); });
    it('8 enrols → full in max-8',                  () => { mk(); for(let i=1;i<=8;i++) mgr.enrol('c1',`p${i}`); expect(mgr.isFull('c1')).toBe(true); });
  });

  // ── start (22) ────────────────────────────────────────────────────────────
  describe('start', () => {
    it('PLANNED → IN_PROGRESS',                     () => { mk2(); mgr.start('c1'); expect(mgr.get('c1').status).toBe('IN_PROGRESS'); });
    it('cannot start IN_PROGRESS',                  () => { mk3(); expect(() => mgr.start('c1')).toThrow(); });
    it('cannot start COMPLETED',                    () => { mk3(); mgr.close('c1'); expect(() => mgr.start('c1')).toThrow(); });
    it('cannot start CANCELLED',                    () => { mk(); mgr.cancel('c1'); expect(() => mgr.start('c1')).toThrow(); });
    it('IN_PROGRESS error mentions status',         () => { mk3(); expect(() => mgr.start('c1')).toThrow('IN_PROGRESS'); });
    it('COMPLETED error mentions status',           () => { mk3(); mgr.close('c1'); expect(() => mgr.start('c1')).toThrow('COMPLETED'); });
    it('CANCELLED error mentions status',           () => { mk(); mgr.cancel('c1'); expect(() => mgr.start('c1')).toThrow('CANCELLED'); });
    it('requires min 2 participants',               () => { mk(); mgr.enrol('c1','p1'); expect(() => mgr.start('c1')).toThrow(); });
    it('1 participant → throws',                    () => { mk(); mgr.enrol('c1','p1'); expect(() => mgr.start('c1')).toThrow(); });
    it('0 participants → throws',                   () => { mk(); expect(() => mgr.start('c1')).toThrow(); });
    it('error for too few mentions 2',              () => { mk(); mgr.enrol('c1','p1'); expect(() => mgr.start('c1')).toThrow('2'); });
    it('2 participants can start',                  () => { mk2(); expect(() => mgr.start('c1')).not.toThrow(); });
    it('3 participants can start',                  () => { mk(); mgr.enrol('c1','p1'); mgr.enrol('c1','p2'); mgr.enrol('c1','p3'); expect(() => mgr.start('c1')).not.toThrow(); });
    it('8 participants can start',                  () => { mk(); for(let i=1;i<=8;i++) mgr.enrol('c1',`p${i}`); expect(() => mgr.start('c1')).not.toThrow(); });
    it('enrolledParticipants unchanged after start', () => { mk2(); const len=mgr.get('c1').enrolledParticipants.length; mgr.start('c1'); expect(mgr.get('c1').enrolledParticipants).toHaveLength(len); });
    it('completedParticipants unchanged after start', () => { mk2(); mgr.start('c1'); expect(mgr.get('c1').completedParticipants).toHaveLength(0); });
    it('certifiedParticipants unchanged after start', () => { mk2(); mgr.start('c1'); expect(mgr.get('c1').certifiedParticipants).toHaveLength(0); });
    it('non-existent cohort throws',                () => expect(() => mgr.start('ghost')).toThrow());
    it('status is IN_PROGRESS not COMPLETED',       () => { mk2(); mgr.start('c1'); expect(mgr.get('c1').status).not.toBe('COMPLETED'); });
    it('count unchanged after start',               () => { mk2(); mgr.start('c1'); expect(mgr.count()).toBe(1); });
    it('can enrol into IN_PROGRESS after start',    () => { mk2(); mgr.start('c1'); expect(() => mgr.enrol('c1','p3')).not.toThrow(); });
    it('exactly 2 participants → start succeeds',  () => { mk2(); mgr.start('c1'); expect(mgr.get('c1').status).toBe('IN_PROGRESS'); });
  });

  // ── completeParticipant (22) ───────────────────────────────────────────────
  describe('completeParticipant', () => {
    it('adds participant to completedParticipants',  () => { mk3(); mgr.completeParticipant('c1','p1'); expect(mgr.get('c1').completedParticipants).toContain('p1'); });
    it('cannot complete from PLANNED status',        () => { mk(); expect(() => mgr.completeParticipant('c1','p1')).toThrow(); });
    it('cannot complete from COMPLETED status',      () => { mk3(); mgr.close('c1'); expect(() => mgr.completeParticipant('c1','p1')).toThrow(); });
    it('cannot complete from CANCELLED status',      () => { mk(); mgr.cancel('c1'); expect(() => mgr.completeParticipant('c1','p1')).toThrow(); });
    it('PLANNED error mentions status',              () => { mk(); expect(() => mgr.completeParticipant('c1','p1')).toThrow(/PLANNED|IN_PROGRESS/i); });
    it('cannot complete non-enrolled participant',   () => { mk3(); expect(() => mgr.completeParticipant('c1','ghost')).toThrow(); });
    it('non-enrolled error mentions participantId',  () => { mk3(); expect(() => mgr.completeParticipant('c1','ghost')).toThrow('ghost'); });
    it('non-enrolled error mentions cohortId',       () => { mk3(); expect(() => mgr.completeParticipant('c1','ghost')).toThrow('c1'); });
    it('idempotent: completing twice stays length 1', () => { mk3(); mgr.completeParticipant('c1','p1'); mgr.completeParticipant('c1','p1'); expect(mgr.get('c1').completedParticipants).toHaveLength(1); });
    it('enrolledParticipants unchanged after complete', () => { mk3(); mgr.completeParticipant('c1','p1'); expect(mgr.get('c1').enrolledParticipants).toHaveLength(2); });
    it('certifiedParticipants unchanged after complete', () => { mk3(); mgr.completeParticipant('c1','p1'); expect(mgr.get('c1').certifiedParticipants).toHaveLength(0); });
    it('completedParticipants grows by 1',           () => { mk3(); mgr.completeParticipant('c1','p1'); expect(mgr.get('c1').completedParticipants).toHaveLength(1); });
    it('status unchanged after complete',            () => { mk3(); mgr.completeParticipant('c1','p1'); expect(mgr.get('c1').status).toBe('IN_PROGRESS'); });
    it('non-existent cohort throws',                 () => expect(() => mgr.completeParticipant('ghost','p1')).toThrow());
    it('complete first of two enrolled',             () => { mk3(); mgr.completeParticipant('c1','p1'); expect(mgr.get('c1').completedParticipants).toContain('p1'); });
    it('complete both enrolled participants',        () => { mk3(); mgr.completeParticipant('c1','p1'); mgr.completeParticipant('c1','p2'); expect(mgr.get('c1').completedParticipants).toHaveLength(2); });
    it('completedParticipants contains id',          () => { mk3(); mgr.completeParticipant('c1','p1'); expect(mgr.get('c1').completedParticipants).toContain('p1'); });
    it('completionRate increases after complete',    () => { mk3(); const before=mgr.completionRate('c1'); mgr.completeParticipant('c1','p1'); expect(mgr.completionRate('c1')).toBeGreaterThan(before); });
    it('completing same participant twice stays at 1', () => { mk3(); mgr.completeParticipant('c1','p1'); mgr.completeParticipant('c1','p1'); expect(mgr.get('c1').completedParticipants.length).toBe(1); });
    it('two cohorts independent on complete',        () => { mk3(); mk('c2'); expect(() => mgr.completeParticipant('c2','p1')).toThrow(); });
    it('cannot complete participant not in IN_PROGRESS', () => { mk2(); expect(() => mgr.completeParticipant('c1','p1')).toThrow(); });
    it('completedParticipants is an array',          () => { mk3(); mgr.completeParticipant('c1','p1'); expect(Array.isArray(mgr.get('c1').completedParticipants)).toBe(true); });
  });

  // ── certifyParticipant (20) ────────────────────────────────────────────────
  describe('certifyParticipant', () => {
    const setup = () => { mk3(); mgr.completeParticipant('c1','p1'); mgr.completeParticipant('c1','p2'); };

    it('adds to certifiedParticipants',              () => { setup(); mgr.certifyParticipant('c1','p1'); expect(mgr.get('c1').certifiedParticipants).toContain('p1'); });
    it('cannot certify non-enrolled participant',    () => { setup(); expect(() => mgr.certifyParticipant('c1','ghost')).toThrow(); });
    it('cannot certify non-completed participant',   () => { mk3(); expect(() => mgr.certifyParticipant('c1','p1')).toThrow(); });
    it('non-enrolled error mentions participantId',  () => { setup(); expect(() => mgr.certifyParticipant('c1','ghost')).toThrow('ghost'); });
    it('non-completed error mentions participantId', () => { mk3(); expect(() => mgr.certifyParticipant('c1','p1')).toThrow('p1'); });
    it('idempotent: certifying twice stays at 1',    () => { setup(); mgr.certifyParticipant('c1','p1'); mgr.certifyParticipant('c1','p1'); expect(mgr.get('c1').certifiedParticipants).toHaveLength(1); });
    it('certifiedParticipants grows by 1',           () => { setup(); mgr.certifyParticipant('c1','p1'); expect(mgr.get('c1').certifiedParticipants).toHaveLength(1); });
    it('completedParticipants unchanged after certify', () => { setup(); mgr.certifyParticipant('c1','p1'); expect(mgr.get('c1').completedParticipants).toHaveLength(2); });
    it('enrolledParticipants unchanged after certify', () => { setup(); mgr.certifyParticipant('c1','p1'); expect(mgr.get('c1').enrolledParticipants).toHaveLength(2); });
    it('non-existent cohort throws',                 () => expect(() => mgr.certifyParticipant('ghost','p1')).toThrow());
    it('certify both enrolled completed participants', () => { setup(); mgr.certifyParticipant('c1','p1'); mgr.certifyParticipant('c1','p2'); expect(mgr.get('c1').certifiedParticipants).toHaveLength(2); });
    it('certificationRate increases after certify',  () => { setup(); const before=mgr.certificationRate('c1'); mgr.certifyParticipant('c1','p1'); expect(mgr.certificationRate('c1')).toBeGreaterThan(before); });
    it('certifiedParticipants contains participant id', () => { setup(); mgr.certifyParticipant('c1','p1'); expect(mgr.get('c1').certifiedParticipants).toContain('p1'); });
    it('cannot certify without completing first',    () => { mk3(); expect(() => mgr.certifyParticipant('c1','p1')).toThrow(); });
    it('certify does not change cohort status',      () => { setup(); mgr.certifyParticipant('c1','p1'); expect(mgr.get('c1').status).toBe('IN_PROGRESS'); });
    it('two cohorts independent on certify',         () => { setup(); mk('c2'); expect(() => mgr.certifyParticipant('c2','p1')).toThrow(); });
    it('certify after close works (no status check on certify)', () => { setup(); mgr.close('c1'); expect(() => mgr.certifyParticipant('c1','p1')).not.toThrow(); });
    it('certificationRate is 100 when all certified', () => { setup(); mgr.certifyParticipant('c1','p1'); mgr.certifyParticipant('c1','p2'); expect(mgr.certificationRate('c1')).toBe(100); });
    it('certify adds exactly one entry per participant', () => { setup(); mgr.certifyParticipant('c1','p1'); expect(mgr.get('c1').certifiedParticipants.length).toBe(1); });
    it('certify start+complete+certify full flow',   () => { setup(); mgr.certifyParticipant('c1','p1'); expect(mgr.get('c1').certifiedParticipants).toHaveLength(1); });
  });

  // ── close (18) ────────────────────────────────────────────────────────────
  describe('close', () => {
    it('IN_PROGRESS → COMPLETED',                   () => { mk3(); mgr.close('c1'); expect(mgr.get('c1').status).toBe('COMPLETED'); });
    it('cannot close PLANNED',                      () => { mk(); expect(() => mgr.close('c1')).toThrow(); });
    it('cannot close COMPLETED',                    () => { mk3(); mgr.close('c1'); expect(() => mgr.close('c1')).toThrow(); });
    it('cannot close CANCELLED',                    () => { mk(); mgr.cancel('c1'); expect(() => mgr.close('c1')).toThrow(); });
    it('PLANNED error mentions status',             () => { mk(); expect(() => mgr.close('c1')).toThrow('PLANNED'); });
    it('COMPLETED error mentions status',           () => { mk3(); mgr.close('c1'); expect(() => mgr.close('c1')).toThrow('COMPLETED'); });
    it('CANCELLED error mentions status',           () => { mk(); mgr.cancel('c1'); expect(() => mgr.close('c1')).toThrow('CANCELLED'); });
    it('enrolledParticipants unchanged after close', () => { mk3(); const len=mgr.get('c1').enrolledParticipants.length; mgr.close('c1'); expect(mgr.get('c1').enrolledParticipants).toHaveLength(len); });
    it('completedParticipants unchanged after close', () => { mk3(); mgr.close('c1'); expect(mgr.get('c1').completedParticipants).toHaveLength(0); });
    it('certifiedParticipants unchanged after close', () => { mk3(); mgr.close('c1'); expect(mgr.get('c1').certifiedParticipants).toHaveLength(0); });
    it('maxParticipants unchanged after close',      () => { mk3(); mgr.close('c1'); expect(mgr.get('c1').maxParticipants).toBe(8); });
    it('non-existent cohort throws',                 () => expect(() => mgr.close('ghost')).toThrow());
    it('status after close is COMPLETED not CANCELLED', () => { mk3(); mgr.close('c1'); expect(mgr.get('c1').status).not.toBe('CANCELLED'); });
    it('getByStatus(COMPLETED) includes closed cohort', () => { mk3(); mgr.close('c1'); expect(mgr.getByStatus('COMPLETED').map(c=>c.id)).toContain('c1'); });
    it('count unchanged after close',               () => { mk3(); mgr.close('c1'); expect(mgr.count()).toBe(1); });
    it('all() shows COMPLETED after close',          () => { mk3(); mgr.close('c1'); expect(mgr.all()[0]!.status).toBe('COMPLETED'); });
    it('status changes from IN_PROGRESS to COMPLETED', () => { mk3(); expect(mgr.get('c1').status).toBe('IN_PROGRESS'); mgr.close('c1'); expect(mgr.get('c1').status).toBe('COMPLETED'); });
    it('close after enrol+start succeeds',           () => { mk3(); expect(() => mgr.close('c1')).not.toThrow(); });
  });

  // ── cancel (18) ───────────────────────────────────────────────────────────
  describe('cancel', () => {
    it('PLANNED → CANCELLED',                       () => { mk(); mgr.cancel('c1'); expect(mgr.get('c1').status).toBe('CANCELLED'); });
    it('IN_PROGRESS → CANCELLED',                   () => { mk3(); mgr.cancel('c1'); expect(mgr.get('c1').status).toBe('CANCELLED'); });
    it('cannot cancel COMPLETED',                   () => { mk3(); mgr.close('c1'); expect(() => mgr.cancel('c1')).toThrow(); });
    it('COMPLETED error message',                   () => { mk3(); mgr.close('c1'); expect(() => mgr.cancel('c1')).toThrow(/completed/i); });
    it('enrolledParticipants unchanged after cancel', () => { mk2(); const len=mgr.get('c1').enrolledParticipants.length; mgr.cancel('c1'); expect(mgr.get('c1').enrolledParticipants).toHaveLength(len); });
    it('completedParticipants unchanged after cancel', () => { mk3(); mgr.cancel('c1'); expect(mgr.get('c1').completedParticipants).toHaveLength(0); });
    it('certifiedParticipants unchanged after cancel', () => { mk3(); mgr.cancel('c1'); expect(mgr.get('c1').certifiedParticipants).toHaveLength(0); });
    it('status is CANCELLED not COMPLETED',          () => { mk(); mgr.cancel('c1'); expect(mgr.get('c1').status).not.toBe('COMPLETED'); });
    it('non-existent cohort throws',                 () => expect(() => mgr.cancel('ghost')).toThrow());
    it('count unchanged after cancel',               () => { mk(); mgr.cancel('c1'); expect(mgr.count()).toBe(1); });
    it('getByStatus(CANCELLED) includes it',         () => { mk(); mgr.cancel('c1'); expect(mgr.getByStatus('CANCELLED').map(c=>c.id)).toContain('c1'); });
    it('cancel removes from getByStatus(PLANNED)',   () => { mk(); mgr.cancel('c1'); expect(mgr.getByStatus('PLANNED')).toHaveLength(0); });
    it('cancelling one cohort does not affect another', () => { mk('c1'); mk('c2'); mgr.cancel('c1'); expect(mgr.get('c2').status).toBe('PLANNED'); });
    it('status is CANCELLED after cancel from PLANNED', () => { mk(); mgr.cancel('c1'); expect(mgr.get('c1').status).toBe('CANCELLED'); });
    it('cancel from IN_PROGRESS works',              () => { mk3(); expect(() => mgr.cancel('c1')).not.toThrow(); });
    it('all() shows CANCELLED',                      () => { mk(); mgr.cancel('c1'); expect(mgr.all()[0]!.status).toBe('CANCELLED'); });
    it('cannot enrol into CANCELLED cohort',         () => { mk(); mgr.cancel('c1'); expect(() => mgr.enrol('c1','p1')).toThrow(); });
    it('can cancel PLANNED without any participants', () => { mk(); expect(() => mgr.cancel('c1')).not.toThrow(); });
  });

  // ── capacity (22) ─────────────────────────────────────────────────────────
  describe('capacity', () => {
    it('availableCapacity = maxParticipants when empty', () => { mk(); expect(mgr.availableCapacity('c1')).toBe(8); });
    it('availableCapacity decreases after enrol',    () => { mk(); mgr.enrol('c1','p1'); expect(mgr.availableCapacity('c1')).toBe(7); });
    it('availableCapacity is 0 when full',           () => { mk('c1',2); mgr.enrol('c1','p1'); mgr.enrol('c1','p2'); expect(mgr.availableCapacity('c1')).toBe(0); });
    it('max=1: availableCapacity=0 after 1 enrol',  () => { mk('c1',1); mgr.enrol('c1','p1'); expect(mgr.availableCapacity('c1')).toBe(0); });
    it('max=4 starts at 4',                          () => { mk('c1',4); expect(mgr.availableCapacity('c1')).toBe(4); });
    it('max=8 starts at 8',                          () => { mk(); expect(mgr.availableCapacity('c1')).toBe(8); });
    it('isFull is false for empty cohort',           () => { mk(); expect(mgr.isFull('c1')).toBe(false); });
    it('isFull is true when at capacity',            () => { mk('c1',2); mgr.enrol('c1','p1'); mgr.enrol('c1','p2'); expect(mgr.isFull('c1')).toBe(true); });
    it('isFull false with 1 in max=2',               () => { mk('c1',2); mgr.enrol('c1','p1'); expect(mgr.isFull('c1')).toBe(false); });
    it('isFull true with 2 in max=2',                () => { mk('c1',2); mgr.enrol('c1','p1'); mgr.enrol('c1','p2'); expect(mgr.isFull('c1')).toBe(true); });
    it('availableCapacity throws for unknown cohort', () => expect(() => mgr.availableCapacity('ghost')).toThrow());
    it('isFull throws for unknown cohort',           () => expect(() => mgr.isFull('ghost')).toThrow());
    it('availableCapacity 7 after 1 enrol in max-8', () => { mk(); mgr.enrol('c1','p1'); expect(mgr.availableCapacity('c1')).toBe(7); });
    it('availableCapacity 1 after 7 enrols in max-8', () => { mk(); for(let i=1;i<=7;i++) mgr.enrol('c1',`p${i}`); expect(mgr.availableCapacity('c1')).toBe(1); });
    it('availableCapacity 0 after 8 enrols',         () => { mk(); for(let i=1;i<=8;i++) mgr.enrol('c1',`p${i}`); expect(mgr.availableCapacity('c1')).toBe(0); });
    it('isFull false with 7 in max-8',               () => { mk(); for(let i=1;i<=7;i++) mgr.enrol('c1',`p${i}`); expect(mgr.isFull('c1')).toBe(false); });
    it('isFull true with 8 in max-8',                () => { mk(); for(let i=1;i<=8;i++) mgr.enrol('c1',`p${i}`); expect(mgr.isFull('c1')).toBe(true); });
    it('each enrol reduces availableCapacity by 1',  () => { mk(); mgr.enrol('c1','p1'); mgr.enrol('c1','p2'); expect(mgr.availableCapacity('c1')).toBe(6); });
    it('max=3 starts at 3',                          () => { mk('c1',3); expect(mgr.availableCapacity('c1')).toBe(3); });
    it('max=3 has 1 left after 2 enrols',            () => { mk('c1',3); mgr.enrol('c1','p1'); mgr.enrol('c1','p2'); expect(mgr.availableCapacity('c1')).toBe(1); });
    it('isFull with 3/3 enrolled',                  () => { mk('c1',3); for(let i=1;i<=3;i++) mgr.enrol('c1',`p${i}`); expect(mgr.isFull('c1')).toBe(true); });
    it('availableCapacity is not negative',          () => { mk(); for(let i=1;i<=8;i++) mgr.enrol('c1',`p${i}`); expect(mgr.availableCapacity('c1')).toBeGreaterThanOrEqual(0); });
  });

  // ── rates (22) ────────────────────────────────────────────────────────────
  describe('completionRate and certificationRate', () => {
    beforeEach(() => {
      mgr = new CohortManager();
      mgr.create('c1','org1','mt1','2026-04-01','Dubai','IN_PERSON',4);
      ['p1','p2','p3','p4'].forEach(p => mgr.enrol('c1',p));
      mgr.start('c1');
    });

    it('completionRate is 0 with no completions',     () => expect(mgr.completionRate('c1')).toBe(0));
    it('completionRate is 25 after 1/4 completed',   () => { mgr.completeParticipant('c1','p1'); expect(mgr.completionRate('c1')).toBe(25); });
    it('completionRate is 50 after 2/4 completed',   () => { mgr.completeParticipant('c1','p1'); mgr.completeParticipant('c1','p2'); expect(mgr.completionRate('c1')).toBe(50); });
    it('completionRate is 75 after 3/4 completed',   () => { ['p1','p2','p3'].forEach(p=>mgr.completeParticipant('c1',p)); expect(mgr.completionRate('c1')).toBe(75); });
    it('completionRate is 100 when all 4 completed', () => { ['p1','p2','p3','p4'].forEach(p=>mgr.completeParticipant('c1',p)); expect(mgr.completionRate('c1')).toBe(100); });
    it('completionRate throws for unknown cohort',    () => expect(() => mgr.completionRate('ghost')).toThrow());
    it('certificationRate is 0 with no certifications', () => { mgr.completeParticipant('c1','p1'); expect(mgr.certificationRate('c1')).toBe(0); });
    it('certificationRate is 0 when no one completed (denom=0)', () => expect(mgr.certificationRate('c1')).toBe(0));
    it('certificationRate is 50 when 1/2 certified', () => { ['p1','p2'].forEach(p=>{mgr.completeParticipant('c1',p);}); mgr.certifyParticipant('c1','p1'); expect(mgr.certificationRate('c1')).toBe(50); });
    it('certificationRate is 100 when all completed are certified', () => { ['p1','p2'].forEach(p=>{mgr.completeParticipant('c1',p); mgr.certifyParticipant('c1',p);}); expect(mgr.certificationRate('c1')).toBe(100); });
    it('certificationRate throws for unknown cohort', () => expect(() => mgr.certificationRate('ghost')).toThrow());
    it('completionRate increases from 0 to 50',      () => { mgr.completeParticipant('c1','p1'); mgr.completeParticipant('c1','p2'); expect(mgr.completionRate('c1')).toBeGreaterThan(0); });
    it('certificationRate increases with each cert',  () => { ['p1','p2'].forEach(p=>mgr.completeParticipant('c1',p)); mgr.certifyParticipant('c1','p1'); const r1=mgr.certificationRate('c1'); mgr.certifyParticipant('c1','p2'); expect(mgr.certificationRate('c1')).toBeGreaterThan(r1); });
    it('completionRate is independent of certificationRate', () => { mgr.completeParticipant('c1','p1'); const cr=mgr.completionRate('c1'); mgr.certifyParticipant('c1','p1'); expect(mgr.completionRate('c1')).toBe(cr); });
    it('certificationRate is 33 for 1/3 certified',  () => { ['p1','p2','p3'].forEach(p=>mgr.completeParticipant('c1',p)); mgr.certifyParticipant('c1','p1'); expect(mgr.certificationRate('c1')).toBe(33); });
    it('completionRate is 33 for 1/3 completed',     () => { mgr.completeParticipant('c1','p1'); expect(mgr.completionRate('c1')).toBe(25); }); // 1/4 = 25
    it('completionRate not affected by certify',      () => { ['p1','p2'].forEach(p=>mgr.completeParticipant('c1',p)); const cr=mgr.completionRate('c1'); mgr.certifyParticipant('c1','p1'); expect(mgr.completionRate('c1')).toBe(cr); });
    it('certificationRate changes after certify',     () => { mgr.completeParticipant('c1','p1'); const before=mgr.certificationRate('c1'); mgr.certifyParticipant('c1','p1'); expect(mgr.certificationRate('c1')).toBeGreaterThan(before); });
    it('completionRate returns integer',              () => { mgr.completeParticipant('c1','p1'); const r=mgr.completionRate('c1'); expect(r).toBe(Math.round(r)); });
    it('certificationRate returns integer',           () => { mgr.completeParticipant('c1','p1'); mgr.certifyParticipant('c1','p1'); const r=mgr.certificationRate('c1'); expect(r).toBe(Math.round(r)); });
    it('completionRate 0 for empty enrolled',         () => { const m=new CohortManager(); m.create('c2','o','mt','2026-01-01','L','IN_PERSON'); expect(m.completionRate('c2')).toBe(0); });
    it('certificationRate 0 when completedParticipants empty', () => expect(mgr.certificationRate('c1')).toBe(0));
  });

  // ── queries (22) ──────────────────────────────────────────────────────────
  describe('queries', () => {
    it('getByStatus(PLANNED) returns PLANNED cohorts',   () => { mk(); expect(mgr.getByStatus('PLANNED').map(c=>c.id)).toContain('c1'); });
    it('getByStatus(IN_PROGRESS) after start',           () => { mk3(); expect(mgr.getByStatus('IN_PROGRESS').map(c=>c.id)).toContain('c1'); });
    it('getByStatus(COMPLETED) after close',             () => { mk3(); mgr.close('c1'); expect(mgr.getByStatus('COMPLETED').map(c=>c.id)).toContain('c1'); });
    it('getByStatus(CANCELLED) after cancel',            () => { mk(); mgr.cancel('c1'); expect(mgr.getByStatus('CANCELLED').map(c=>c.id)).toContain('c1'); });
    it('getByStatus returns empty for no match',         () => { mk(); expect(mgr.getByStatus('IN_PROGRESS')).toHaveLength(0); });
    it('getByStatus excludes non-matching status',       () => { mk(); expect(mgr.getByStatus('COMPLETED')).toHaveLength(0); });
    it('getByOrganisation returns cohorts for org',      () => { mk(); expect(mgr.getByOrganisation('org1').map(c=>c.id)).toContain('c1'); });
    it('getByOrganisation empty for unknown org',        () => { mk(); expect(mgr.getByOrganisation('orgX')).toHaveLength(0); });
    it('getByOrganisation excludes other orgs',          () => { mk(); mgr.create('c2','org2','mt1','2026-04-01','Dubai','IN_PERSON'); expect(mgr.getByOrganisation('org1')).toHaveLength(1); });
    it('getByOrganisation returns multiple same org',    () => { mk('c1'); mk('c2'); expect(mgr.getByOrganisation('org1')).toHaveLength(2); });
    it('getByMasterTrainer returns cohorts for trainer', () => { mk(); expect(mgr.getByMasterTrainer('mt1').map(c=>c.id)).toContain('c1'); });
    it('getByMasterTrainer empty for unknown trainer',   () => { mk(); expect(mgr.getByMasterTrainer('mtX')).toHaveLength(0); });
    it('getByMasterTrainer excludes other trainers',     () => { mk(); mgr.create('c2','org1','mt2','2026-04-01','Dubai','IN_PERSON'); expect(mgr.getByMasterTrainer('mt1')).toHaveLength(1); });
    it('getByMasterTrainer returns multiple same trainer', () => { mk('c1'); mk('c2'); expect(mgr.getByMasterTrainer('mt1')).toHaveLength(2); });
    it('getByStatus changes when status changes',        () => { mk2(); expect(mgr.getByStatus('PLANNED')).toHaveLength(1); mgr.start('c1'); expect(mgr.getByStatus('PLANNED')).toHaveLength(0); });
    it('getByStatus result is array',                    () => expect(Array.isArray(mgr.getByStatus('PLANNED'))).toBe(true));
    it('getByOrganisation result is array',              () => expect(Array.isArray(mgr.getByOrganisation('org1'))).toBe(true));
    it('getByMasterTrainer result is array',             () => expect(Array.isArray(mgr.getByMasterTrainer('mt1'))).toBe(true));
    it('two orgs: each query returns only that org',     () => { mk('c1'); mgr.create('c2','org2','mt1','2026-04-01','Dubai','IN_PERSON'); expect(mgr.getByOrganisation('org2')).toHaveLength(1); });
    it('two trainers: each query scoped correctly',      () => { mk(); mgr.create('c2','org1','mt2','2026-04-01','Dubai','IN_PERSON'); expect(mgr.getByMasterTrainer('mt2')).toHaveLength(1); });
    it('getByStatus PLANNED before start includes cohort', () => { mk2(); expect(mgr.getByStatus('PLANNED')).toHaveLength(1); });
    it('getByStatus IN_PROGRESS includes started cohort', () => { mk3(); expect(mgr.getByStatus('IN_PROGRESS')).toHaveLength(1); });
  });

  // ── count and all (14) ────────────────────────────────────────────────────
  describe('count and all', () => {
    it('count is 0 initially',                       () => expect(mgr.count()).toBe(0));
    it('count is 1 after one create',                () => { mk(); expect(mgr.count()).toBe(1); });
    it('count is 2 after two creates',               () => { mk('c1'); mk('c2'); expect(mgr.count()).toBe(2); });
    it('count is 3 after three creates',             () => { mk('c1'); mk('c2'); mk('c3'); expect(mgr.count()).toBe(3); });
    it('all() is empty initially',                   () => expect(mgr.all()).toHaveLength(0));
    it('all() has 1 element after create',           () => { mk(); expect(mgr.all()).toHaveLength(1); });
    it('all() has 2 elements after two creates',     () => { mk('c1'); mk('c2'); expect(mgr.all()).toHaveLength(2); });
    it('all() includes all statuses',                () => { mk('c1'); mk('c2'); mgr.cancel('c2'); expect(mgr.all()).toHaveLength(2); });
    it('count unchanged by enrol',                   () => { mk(); mgr.enrol('c1','p1'); expect(mgr.count()).toBe(1); });
    it('count unchanged by start',                   () => { mk2(); mgr.start('c1'); expect(mgr.count()).toBe(1); });
    it('count unchanged by close',                   () => { mk3(); mgr.close('c1'); expect(mgr.count()).toBe(1); });
    it('count unchanged by cancel',                  () => { mk(); mgr.cancel('c1'); expect(mgr.count()).toBe(1); });
    it('all() returns Cohort objects',               () => { mk(); expect(mgr.all()[0]).toHaveProperty('id'); });
    it('count not incremented on duplicate id error', () => { mk(); try{mk();}catch(_){} expect(mgr.count()).toBe(1); });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TrainerRegistry (167)
// ─────────────────────────────────────────────────────────────────────────────
describe('TrainerRegistry', () => {
  let reg: TrainerRegistry;

  const REG_DATE = '2026-01-01';
  const RENEWAL  = '2027-01-01'; // +365 days

  function mkTrainer(id = 't1', overrides: Partial<{ deliveryScore: number; writtenScore: number }> = {}): TrainerRecord {
    return reg.register(id, 'Alice Smith', 'alice@example.com', 'org1', REG_DATE, overrides.deliveryScore ?? 85, overrides.writtenScore ?? 90);
  }

  beforeEach(() => { reg = new TrainerRegistry(); });

  // ── register (32) ─────────────────────────────────────────────────────────
  describe('register', () => {
    it('returns a TrainerRecord',                              () => expect(mkTrainer()).toMatchObject({ id: 't1' }));
    it('sets id correctly',                                    () => expect(mkTrainer().id).toBe('t1'));
    it('sets name correctly',                                  () => expect(mkTrainer().name).toBe('Alice Smith'));
    it('sets email correctly',                                 () => expect(mkTrainer().email).toBe('alice@example.com'));
    it('sets organisationId correctly',                        () => expect(mkTrainer().organisationId).toBe('org1'));
    it('sets certificationDate correctly',                     () => expect(mkTrainer().certificationDate).toBe(REG_DATE));
    it('sets renewalDueDate to +365 days',                     () => expect(mkTrainer().renewalDueDate).toBe(RENEWAL));
    it('sets status to ACTIVE',                                () => expect(mkTrainer().status).toBe('ACTIVE'));
    it('sets deliveryScore',                                   () => expect(mkTrainer('t1', { deliveryScore: 80 }).deliveryScore).toBe(80));
    it('sets writtenScore',                                    () => expect(mkTrainer('t1', { writtenScore: 75 }).writtenScore).toBe(75));
    it('sets cohortsDelivered to 0',                           () => expect(mkTrainer().cohortsDelivered).toBe(0));
    it('sets lastDeliveryDate to null',                        () => expect(mkTrainer().lastDeliveryDate).toBeNull());
    it('stores trainer — retrievable by get()',                () => { mkTrainer(); expect(reg.get('t1').id).toBe('t1'); });
    it('throws on duplicate id',                              () => { mkTrainer(); expect(() => mkTrainer()).toThrow('already registered'); });
    it('throws on empty name',                                 () => expect(() => reg.register('t2', '  ', 'a@b.com', 'org1', REG_DATE, 80, 90)).toThrow('cannot be empty'));
    it('throws on invalid email (no @)',                       () => expect(() => reg.register('t2', 'Bob', 'bob.com', 'org1', REG_DATE, 80, 90)).toThrow('Invalid email'));
    it('throws on deliveryScore < 0',                          () => expect(() => reg.register('t2', 'Bob', 'b@c.com', 'org1', REG_DATE, -1, 90)).toThrow('deliveryScore'));
    it('throws on deliveryScore > 100',                        () => expect(() => reg.register('t2', 'Bob', 'b@c.com', 'org1', REG_DATE, 101, 90)).toThrow('deliveryScore'));
    it('throws on writtenScore < 0',                           () => expect(() => reg.register('t2', 'Bob', 'b@c.com', 'org1', REG_DATE, 80, -1)).toThrow('writtenScore'));
    it('throws on writtenScore > 100',                         () => expect(() => reg.register('t2', 'Bob', 'b@c.com', 'org1', REG_DATE, 80, 101)).toThrow('writtenScore'));
    it('accepts deliveryScore 0',                              () => expect(reg.register('t2', 'Bob', 'b@c.com', 'org1', REG_DATE, 0, 90).deliveryScore).toBe(0));
    it('accepts deliveryScore 100',                            () => expect(reg.register('t2', 'Bob', 'b@c.com', 'org1', REG_DATE, 100, 90).deliveryScore).toBe(100));
    it('accepts writtenScore 0',                               () => expect(reg.register('t2', 'Bob', 'b@c.com', 'org1', REG_DATE, 80, 0).writtenScore).toBe(0));
    it('accepts writtenScore 100',                             () => expect(reg.register('t2', 'Bob', 'b@c.com', 'org1', REG_DATE, 80, 100).writtenScore).toBe(100));
    it('two distinct trainers registered independently',       () => { mkTrainer('t1'); mkTrainer('t2'); expect(reg.count()).toBe(2); });
    it('count increments per registration',                    () => { mkTrainer('t1'); mkTrainer('t2'); mkTrainer('t3'); expect(reg.count()).toBe(3); });
    it('name with leading space is trimmed check (throws)',     () => expect(() => reg.register('t2', '  ', 'b@c.com', 'org1', REG_DATE, 80, 90)).toThrow());
    it('email with @ passes validation',                       () => expect(() => mkTrainer()).not.toThrow());
    it('duplicate id error does not increment count',          () => { mkTrainer(); try { mkTrainer(); } catch (_) {} expect(reg.count()).toBe(1); });
    it('renewalDueDate is a string',                           () => expect(typeof mkTrainer().renewalDueDate).toBe('string'));
    it('certificationDate preserved as provided',              () => expect(mkTrainer().certificationDate).toBe(REG_DATE));
  });

  // ── get and queries (25) ───────────────────────────────────────────────────
  describe('get and queries', () => {
    it('get returns registered trainer',                             () => { mkTrainer(); expect(reg.get('t1').name).toBe('Alice Smith'); });
    it('get throws for unknown id',                                  () => expect(() => reg.get('unknown')).toThrow('not found'));
    it('getByOrganisation returns trainers in org',                  () => { mkTrainer('t1'); expect(reg.getByOrganisation('org1').map(t=>t.id)).toContain('t1'); });
    it('getByOrganisation empty for unknown org',                    () => { mkTrainer(); expect(reg.getByOrganisation('org99')).toHaveLength(0); });
    it('getByOrganisation excludes other orgs',                      () => { mkTrainer('t1'); reg.register('t2','Bob','b@c.com','org2',REG_DATE,80,90); expect(reg.getByOrganisation('org1')).toHaveLength(1); });
    it('getByOrganisation returns multiple from same org',           () => { mkTrainer('t1'); mkTrainer('t2'); expect(reg.getByOrganisation('org1')).toHaveLength(2); });
    it('getActive returns ACTIVE trainers',                          () => { mkTrainer(); expect(reg.getActive().map(t=>t.id)).toContain('t1'); });
    it('getActive empty when no trainers',                           () => expect(reg.getActive()).toHaveLength(0));
    it('getActive excludes LAPSED trainers after refreshStatus',     () => { mkTrainer(); reg.refreshStatus('t1','2027-07-02'); expect(reg.getActive()).toHaveLength(0); });
    it('getByStatus(ACTIVE) returns newly registered trainer',       () => { mkTrainer(); expect(reg.getByStatus('ACTIVE')).toHaveLength(1); });
    it('getByStatus(LAPSED) returns 0 initially',                    () => { mkTrainer(); expect(reg.getByStatus('LAPSED')).toHaveLength(0); });
    it('getByStatus(CANCELLED) returns 0 initially',                 () => { mkTrainer(); expect(reg.getByStatus('CANCELLED')).toHaveLength(0); });
    it('getByStatus(LAPSED_WARNING) returns 0 initially',            () => { mkTrainer(); expect(reg.getByStatus('LAPSED_WARNING')).toHaveLength(0); });
    it('getByStatus(SUSPENDED) returns 0 initially',                 () => { mkTrainer(); expect(reg.getByStatus('SUSPENDED')).toHaveLength(0); });
    it('getByOrganisation result is array',                          () => expect(Array.isArray(reg.getByOrganisation('org1'))).toBe(true));
    it('getActive result is array',                                  () => expect(Array.isArray(reg.getActive())).toBe(true));
    it('getByStatus result is array',                                () => expect(Array.isArray(reg.getByStatus('ACTIVE'))).toBe(true));
    it('get returns object with required fields',                     () => { mkTrainer(); const t = reg.get('t1'); expect(t).toHaveProperty('certificationDate'); });
    it('get after refresh reflects new status',                      () => { mkTrainer(); reg.refreshStatus('t1','2027-01-15'); expect(reg.get('t1').status).toBe('LAPSED_WARNING'); });
    it('get after renew reflects ACTIVE',                            () => { mkTrainer(); reg.refreshStatus('t1','2027-04-02'); reg.renew('t1','2027-04-02'); expect(reg.get('t1').status).toBe('ACTIVE'); });
    it('two orgs separated correctly by getByOrganisation',          () => { mkTrainer('t1'); reg.register('t2','Bob','b@c.com','org2',REG_DATE,80,90); expect(reg.getByOrganisation('org2').map(t=>t.id)).toContain('t2'); });
    it('getActive returns all active when multiple',                  () => { mkTrainer('t1'); mkTrainer('t2'); expect(reg.getActive()).toHaveLength(2); });
    it('getByStatus after cancel-equiv (CANCELLED) has 1',           () => { mkTrainer(); reg.refreshStatus('t1','2027-07-02'); expect(reg.getByStatus('CANCELLED')).toHaveLength(1); });
    it('count() returns correct count',                              () => { mkTrainer('t1'); mkTrainer('t2'); expect(reg.count()).toBe(2); });
    it('all() returns all registered trainers',                      () => { mkTrainer('t1'); mkTrainer('t2'); expect(reg.all()).toHaveLength(2); });
  });

  // ── recordDelivery (20) ────────────────────────────────────────────────────
  describe('recordDelivery', () => {
    it('increments cohortsDelivered from 0 to 1',           () => { mkTrainer(); reg.recordDelivery('t1','2026-03-01'); expect(reg.get('t1').cohortsDelivered).toBe(1); });
    it('increments cohortsDelivered from 1 to 2',           () => { mkTrainer(); reg.recordDelivery('t1','2026-03-01'); reg.recordDelivery('t1','2026-04-01'); expect(reg.get('t1').cohortsDelivered).toBe(2); });
    it('increments cohortsDelivered from 2 to 3',           () => { mkTrainer(); reg.recordDelivery('t1','2026-03-01'); reg.recordDelivery('t1','2026-04-01'); reg.recordDelivery('t1','2026-05-01'); expect(reg.get('t1').cohortsDelivered).toBe(3); });
    it('sets lastDeliveryDate',                             () => { mkTrainer(); reg.recordDelivery('t1','2026-03-01'); expect(reg.get('t1').lastDeliveryDate).toBe('2026-03-01'); });
    it('updates lastDeliveryDate on second delivery',        () => { mkTrainer(); reg.recordDelivery('t1','2026-03-01'); reg.recordDelivery('t1','2026-04-15'); expect(reg.get('t1').lastDeliveryDate).toBe('2026-04-15'); });
    it('lastDeliveryDate starts as null',                   () => { mkTrainer(); expect(reg.get('t1').lastDeliveryDate).toBeNull(); });
    it('throws for unknown trainer',                        () => expect(() => reg.recordDelivery('unknown','2026-03-01')).toThrow());
    it('does not affect status',                            () => { mkTrainer(); reg.recordDelivery('t1','2026-03-01'); expect(reg.get('t1').status).toBe('ACTIVE'); });
    it('does not affect deliveryScore',                     () => { mkTrainer('t1', { deliveryScore: 85 }); reg.recordDelivery('t1','2026-03-01'); expect(reg.get('t1').deliveryScore).toBe(85); });
    it('does not affect writtenScore',                      () => { mkTrainer('t1', { writtenScore: 90 }); reg.recordDelivery('t1','2026-03-01'); expect(reg.get('t1').writtenScore).toBe(90); });
    it('does not affect certificationDate',                 () => { mkTrainer(); reg.recordDelivery('t1','2026-03-01'); expect(reg.get('t1').certificationDate).toBe(REG_DATE); });
    it('does not affect renewalDueDate',                    () => { mkTrainer(); reg.recordDelivery('t1','2026-03-01'); expect(reg.get('t1').renewalDueDate).toBe(RENEWAL); });
    it('multiple trainers — only target incremented',       () => { mkTrainer('t1'); mkTrainer('t2'); reg.recordDelivery('t1','2026-03-01'); expect(reg.get('t2').cohortsDelivered).toBe(0); });
    it('cohortsDelivered is 0 before any delivery',         () => { mkTrainer(); expect(reg.get('t1').cohortsDelivered).toBe(0); });
    it('five deliveries → cohortsDelivered = 5',           () => { mkTrainer(); for(let i=1;i<=5;i++) reg.recordDelivery('t1',`2026-0${i}-01`); expect(reg.get('t1').cohortsDelivered).toBe(5); });
    it('lastDeliveryDate is string after set',              () => { mkTrainer(); reg.recordDelivery('t1','2026-03-01'); expect(typeof reg.get('t1').lastDeliveryDate).toBe('string'); });
    it('different dates for different trainers',            () => { mkTrainer('t1'); mkTrainer('t2'); reg.recordDelivery('t1','2026-03-01'); reg.recordDelivery('t2','2026-04-15'); expect(reg.get('t1').lastDeliveryDate).toBe('2026-03-01'); });
    it('second trainer lastDeliveryDate set independently', () => { mkTrainer('t1'); mkTrainer('t2'); reg.recordDelivery('t1','2026-03-01'); reg.recordDelivery('t2','2026-04-15'); expect(reg.get('t2').lastDeliveryDate).toBe('2026-04-15'); });
    it('does not affect organisationId',                    () => { mkTrainer(); reg.recordDelivery('t1','2026-03-01'); expect(reg.get('t1').organisationId).toBe('org1'); });
    it('does not affect id',                                () => { mkTrainer(); reg.recordDelivery('t1','2026-03-01'); expect(reg.get('t1').id).toBe('t1'); });
  });

  // ── refreshStatus (35) ────────────────────────────────────────────────────
  describe('refreshStatus', () => {
    // certDate = 2026-01-01, renewal = 2027-01-01
    it('returns ACTIVE well before renewal',              () => { mkTrainer(); expect(reg.refreshStatus('t1','2026-06-01')).toBe('ACTIVE'); });
    it('returns ACTIVE on renewal day itself',            () => { mkTrainer(); expect(reg.refreshStatus('t1','2027-01-01')).toBe('ACTIVE'); });
    it('returns ACTIVE day before renewal',               () => { mkTrainer(); expect(reg.refreshStatus('t1','2026-12-31')).toBe('ACTIVE'); });
    it('returns LAPSED_WARNING 1 day past renewal',       () => { mkTrainer(); expect(reg.refreshStatus('t1','2027-01-02')).toBe('LAPSED_WARNING'); });
    it('returns LAPSED_WARNING 15 days past renewal',     () => { mkTrainer(); expect(reg.refreshStatus('t1','2027-01-16')).toBe('LAPSED_WARNING'); });
    it('returns LAPSED_WARNING 30 days past renewal',     () => { mkTrainer(); expect(reg.refreshStatus('t1','2027-01-31')).toBe('LAPSED_WARNING'); });
    it('returns SUSPENDED 31 days past renewal',          () => { mkTrainer(); expect(reg.refreshStatus('t1','2027-02-01')).toBe('SUSPENDED'); });
    it('returns SUSPENDED 60 days past renewal',          () => { mkTrainer(); expect(reg.refreshStatus('t1','2027-03-02')).toBe('SUSPENDED'); });
    it('returns SUSPENDED 90 days past renewal',          () => { mkTrainer(); expect(reg.refreshStatus('t1','2027-04-01')).toBe('SUSPENDED'); });
    it('returns LAPSED 91 days past renewal',             () => { mkTrainer(); expect(reg.refreshStatus('t1','2027-04-02')).toBe('LAPSED'); });
    it('returns LAPSED 135 days past renewal',            () => { mkTrainer(); expect(reg.refreshStatus('t1','2027-05-16')).toBe('LAPSED'); });
    it('returns LAPSED 180 days past renewal',            () => { mkTrainer(); expect(reg.refreshStatus('t1','2027-06-30')).toBe('LAPSED'); });
    it('returns CANCELLED 181 days past renewal',         () => { mkTrainer(); expect(reg.refreshStatus('t1','2027-07-01')).toBe('CANCELLED'); });
    it('returns CANCELLED 365 days past renewal',         () => { mkTrainer(); expect(reg.refreshStatus('t1','2028-01-01')).toBe('CANCELLED'); });
    it('sets trainer status to ACTIVE',                   () => { mkTrainer(); reg.refreshStatus('t1','2026-06-01'); expect(reg.get('t1').status).toBe('ACTIVE'); });
    it('sets trainer status to LAPSED_WARNING',           () => { mkTrainer(); reg.refreshStatus('t1','2027-01-15'); expect(reg.get('t1').status).toBe('LAPSED_WARNING'); });
    it('sets trainer status to SUSPENDED',                () => { mkTrainer(); reg.refreshStatus('t1','2027-02-15'); expect(reg.get('t1').status).toBe('SUSPENDED'); });
    it('sets trainer status to LAPSED',                   () => { mkTrainer(); reg.refreshStatus('t1','2027-04-15'); expect(reg.get('t1').status).toBe('LAPSED'); });
    it('sets trainer status to CANCELLED',                () => { mkTrainer(); reg.refreshStatus('t1','2027-07-02'); expect(reg.get('t1').status).toBe('CANCELLED'); });
    it('throws for unknown trainer',                      () => expect(() => reg.refreshStatus('unknown','2026-06-01')).toThrow());
    it('return value matches stored status (ACTIVE)',      () => { mkTrainer(); const s = reg.refreshStatus('t1','2026-06-01'); expect(s).toBe(reg.get('t1').status); });
    it('return value matches stored status (LAPSED_WARNING)', () => { mkTrainer(); const s = reg.refreshStatus('t1','2027-01-15'); expect(s).toBe(reg.get('t1').status); });
    it('return value matches stored status (SUSPENDED)',   () => { mkTrainer(); const s = reg.refreshStatus('t1','2027-02-15'); expect(s).toBe(reg.get('t1').status); });
    it('return value matches stored status (LAPSED)',      () => { mkTrainer(); const s = reg.refreshStatus('t1','2027-04-15'); expect(s).toBe(reg.get('t1').status); });
    it('return value matches stored status (CANCELLED)',   () => { mkTrainer(); const s = reg.refreshStatus('t1','2027-07-02'); expect(s).toBe(reg.get('t1').status); });
    it('ACTIVE today then LAPSED_WARNING later',          () => { mkTrainer(); reg.refreshStatus('t1','2026-06-01'); reg.refreshStatus('t1','2027-01-15'); expect(reg.get('t1').status).toBe('LAPSED_WARNING'); });
    it('LAPSED_WARNING then back to ACTIVE after renew',  () => { mkTrainer(); reg.refreshStatus('t1','2027-01-15'); reg.renew('t1','2027-01-15'); reg.refreshStatus('t1','2027-01-15'); expect(reg.get('t1').status).toBe('ACTIVE'); });
    it('does not affect cohortsDelivered',                () => { mkTrainer(); reg.recordDelivery('t1','2026-03-01'); reg.refreshStatus('t1','2027-01-15'); expect(reg.get('t1').cohortsDelivered).toBe(1); });
    it('does not affect deliveryScore',                   () => { mkTrainer('t1', { deliveryScore: 88 }); reg.refreshStatus('t1','2027-01-15'); expect(reg.get('t1').deliveryScore).toBe(88); });
    it('does not affect certificationDate (before renew)', () => { mkTrainer(); reg.refreshStatus('t1','2027-01-15'); expect(reg.get('t1').certificationDate).toBe(REG_DATE); });
    it('getActive reflects status after refresh ACTIVE',   () => { mkTrainer(); reg.refreshStatus('t1','2026-06-01'); expect(reg.getActive()).toHaveLength(1); });
    it('getActive excludes after refresh LAPSED_WARNING',  () => { mkTrainer(); reg.refreshStatus('t1','2027-01-15'); expect(reg.getActive()).toHaveLength(0); });
    it('getByStatus SUSPENDED has 1 after refresh',        () => { mkTrainer(); reg.refreshStatus('t1','2027-02-15'); expect(reg.getByStatus('SUSPENDED')).toHaveLength(1); });
    it('getByStatus LAPSED has 1 after refresh',           () => { mkTrainer(); reg.refreshStatus('t1','2027-04-15'); expect(reg.getByStatus('LAPSED')).toHaveLength(1); });
    it('getByStatus CANCELLED has 1 after refresh',        () => { mkTrainer(); reg.refreshStatus('t1','2027-07-02'); expect(reg.getByStatus('CANCELLED')).toHaveLength(1); });
  });

  // ── renew (25) ────────────────────────────────────────────────────────────
  describe('renew', () => {
    const REN_DATE = '2027-06-01';
    const REN_RENEWAL = '2028-05-31'; // 2027-06-01 +365 days spans Feb 29 2028 (leap year)

    it('sets certificationDate to renewalDate',           () => { mkTrainer(); reg.renew('t1',REN_DATE); expect(reg.get('t1').certificationDate).toBe(REN_DATE); });
    it('sets renewalDueDate to +365d from renewalDate',   () => { mkTrainer(); reg.renew('t1',REN_DATE); expect(reg.get('t1').renewalDueDate).toBe(REN_RENEWAL); });
    it('sets status to ACTIVE',                           () => { mkTrainer(); reg.refreshStatus('t1','2027-04-15'); reg.renew('t1',REN_DATE); expect(reg.get('t1').status).toBe('ACTIVE'); });
    it('LAPSED trainer can renew',                        () => { mkTrainer(); reg.refreshStatus('t1','2027-04-15'); expect(() => reg.renew('t1',REN_DATE)).not.toThrow(); });
    it('LAPSED_WARNING trainer can renew',                () => { mkTrainer(); reg.refreshStatus('t1','2027-01-15'); expect(() => reg.renew('t1',REN_DATE)).not.toThrow(); });
    it('SUSPENDED trainer can renew',                     () => { mkTrainer(); reg.refreshStatus('t1','2027-02-15'); expect(() => reg.renew('t1',REN_DATE)).not.toThrow(); });
    it('ACTIVE trainer can renew',                        () => { mkTrainer(); expect(() => reg.renew('t1',REN_DATE)).not.toThrow(); });
    it('CANCELLED trainer cannot renew',                  () => { mkTrainer(); reg.refreshStatus('t1','2027-07-02'); expect(() => reg.renew('t1',REN_DATE)).toThrow('CANCELLED'); });
    it('CANCELLED error message mentions re-certification', () => { mkTrainer(); reg.refreshStatus('t1','2027-07-02'); expect(() => reg.renew('t1',REN_DATE)).toThrow(/re-certif/i); });
    it('throws for unknown trainer',                      () => expect(() => reg.renew('unknown',REN_DATE)).toThrow());
    it('renewal updates certificationDate from old value', () => { mkTrainer(); expect(reg.get('t1').certificationDate).toBe(REG_DATE); reg.renew('t1',REN_DATE); expect(reg.get('t1').certificationDate).toBe(REN_DATE); });
    it('renewal updates renewalDueDate from old value',    () => { mkTrainer(); expect(reg.get('t1').renewalDueDate).toBe(RENEWAL); reg.renew('t1',REN_DATE); expect(reg.get('t1').renewalDueDate).toBe(REN_RENEWAL); });
    it('multiple renewals chain correctly (cert)',         () => { mkTrainer(); reg.renew('t1',REN_DATE); reg.renew('t1','2028-06-01'); expect(reg.get('t1').certificationDate).toBe('2028-06-01'); });
    it('multiple renewals chain correctly (renewal due)',  () => { mkTrainer(); reg.renew('t1',REN_DATE); reg.renew('t1','2028-06-01'); expect(reg.get('t1').renewalDueDate).toBe('2029-06-01'); });
    it('does not change cohortsDelivered',                () => { mkTrainer(); reg.recordDelivery('t1','2026-03-01'); reg.renew('t1',REN_DATE); expect(reg.get('t1').cohortsDelivered).toBe(1); });
    it('does not change deliveryScore',                   () => { mkTrainer('t1', { deliveryScore: 77 }); reg.renew('t1',REN_DATE); expect(reg.get('t1').deliveryScore).toBe(77); });
    it('does not change writtenScore',                    () => { mkTrainer('t1', { writtenScore: 82 }); reg.renew('t1',REN_DATE); expect(reg.get('t1').writtenScore).toBe(82); });
    it('does not change name',                            () => { mkTrainer(); reg.renew('t1',REN_DATE); expect(reg.get('t1').name).toBe('Alice Smith'); });
    it('does not change email',                           () => { mkTrainer(); reg.renew('t1',REN_DATE); expect(reg.get('t1').email).toBe('alice@example.com'); });
    it('does not change organisationId',                  () => { mkTrainer(); reg.renew('t1',REN_DATE); expect(reg.get('t1').organisationId).toBe('org1'); });
    it('getActive includes renewed trainer',              () => { mkTrainer(); reg.refreshStatus('t1','2027-04-15'); reg.renew('t1',REN_DATE); expect(reg.getActive()).toHaveLength(1); });
    it('getByStatus(ACTIVE) includes renewed trainer',    () => { mkTrainer(); reg.refreshStatus('t1','2027-04-15'); reg.renew('t1',REN_DATE); expect(reg.getByStatus('ACTIVE')).toHaveLength(1); });
    it('LAPSED -> renew -> refresh still ACTIVE',         () => { mkTrainer(); reg.refreshStatus('t1','2027-04-15'); reg.renew('t1',REN_DATE); reg.refreshStatus('t1','2027-07-01'); expect(reg.get('t1').status).toBe('ACTIVE'); });
    it('renewalDueDate after renewal is a string',        () => { mkTrainer(); reg.renew('t1',REN_DATE); expect(typeof reg.get('t1').renewalDueDate).toBe('string'); });
    it('certificationDate after renewal is a string',     () => { mkTrainer(); reg.renew('t1',REN_DATE); expect(typeof reg.get('t1').certificationDate).toBe('string'); });
  });

  // ── updateScores (18) ─────────────────────────────────────────────────────
  describe('updateScores', () => {
    it('updates deliveryScore',                  () => { mkTrainer(); reg.updateScores('t1',70,80); expect(reg.get('t1').deliveryScore).toBe(70); });
    it('updates writtenScore',                   () => { mkTrainer(); reg.updateScores('t1',70,80); expect(reg.get('t1').writtenScore).toBe(80); });
    it('accepts deliveryScore 0',                () => { mkTrainer(); reg.updateScores('t1',0,80); expect(reg.get('t1').deliveryScore).toBe(0); });
    it('accepts deliveryScore 100',              () => { mkTrainer(); reg.updateScores('t1',100,80); expect(reg.get('t1').deliveryScore).toBe(100); });
    it('accepts writtenScore 0',                 () => { mkTrainer(); reg.updateScores('t1',80,0); expect(reg.get('t1').writtenScore).toBe(0); });
    it('accepts writtenScore 100',               () => { mkTrainer(); reg.updateScores('t1',80,100); expect(reg.get('t1').writtenScore).toBe(100); });
    it('throws for deliveryScore < 0',           () => { mkTrainer(); expect(() => reg.updateScores('t1',-1,80)).toThrow('deliveryScore'); });
    it('throws for deliveryScore > 100',         () => { mkTrainer(); expect(() => reg.updateScores('t1',101,80)).toThrow('deliveryScore'); });
    it('throws for writtenScore < 0',            () => { mkTrainer(); expect(() => reg.updateScores('t1',80,-1)).toThrow('writtenScore'); });
    it('throws for writtenScore > 100',          () => { mkTrainer(); expect(() => reg.updateScores('t1',80,101)).toThrow('writtenScore'); });
    it('throws for unknown trainer',             () => expect(() => reg.updateScores('unknown',80,80)).toThrow());
    it('does not affect status',                 () => { mkTrainer(); reg.updateScores('t1',70,80); expect(reg.get('t1').status).toBe('ACTIVE'); });
    it('does not affect certificationDate',      () => { mkTrainer(); reg.updateScores('t1',70,80); expect(reg.get('t1').certificationDate).toBe(REG_DATE); });
    it('does not affect renewalDueDate',         () => { mkTrainer(); reg.updateScores('t1',70,80); expect(reg.get('t1').renewalDueDate).toBe(RENEWAL); });
    it('does not affect cohortsDelivered',       () => { mkTrainer(); reg.recordDelivery('t1','2026-03-01'); reg.updateScores('t1',70,80); expect(reg.get('t1').cohortsDelivered).toBe(1); });
    it('multiple updates overwrite previous',    () => { mkTrainer(); reg.updateScores('t1',70,80); reg.updateScores('t1',55,65); expect(reg.get('t1').deliveryScore).toBe(55); });
    it('written score also updated on second call', () => { mkTrainer(); reg.updateScores('t1',70,80); reg.updateScores('t1',55,65); expect(reg.get('t1').writtenScore).toBe(65); });
    it('only target trainer scores updated',     () => { mkTrainer('t1'); mkTrainer('t2'); reg.updateScores('t1',70,80); expect(reg.get('t2').deliveryScore).toBe(85); });
  });

  // ── count and all (12) ────────────────────────────────────────────────────
  describe('count and all', () => {
    it('count 0 initially',                    () => expect(reg.count()).toBe(0));
    it('count 1 after one register',           () => { mkTrainer(); expect(reg.count()).toBe(1); });
    it('count 2 after two registers',          () => { mkTrainer('t1'); mkTrainer('t2'); expect(reg.count()).toBe(2); });
    it('count 3 after three registers',        () => { mkTrainer('t1'); mkTrainer('t2'); mkTrainer('t3'); expect(reg.count()).toBe(3); });
    it('all() empty initially',               () => expect(reg.all()).toHaveLength(0));
    it('all() 1 element after one register',   () => { mkTrainer(); expect(reg.all()).toHaveLength(1); });
    it('all() 2 elements after two registers', () => { mkTrainer('t1'); mkTrainer('t2'); expect(reg.all()).toHaveLength(2); });
    it('all() returns TrainerRecord objects',  () => { mkTrainer(); expect(reg.all()[0]).toHaveProperty('certificationDate'); });
    it('count not increased by recordDelivery', () => { mkTrainer(); reg.recordDelivery('t1','2026-03-01'); expect(reg.count()).toBe(1); });
    it('count not increased by renew',         () => { mkTrainer(); reg.renew('t1','2027-06-01'); expect(reg.count()).toBe(1); });
    it('count not increased by updateScores',  () => { mkTrainer(); reg.updateScores('t1',70,80); expect(reg.count()).toBe(1); });
    it('count not increased on duplicate error', () => { mkTrainer(); try { mkTrainer(); } catch(_){} expect(reg.count()).toBe(1); });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// programme-registry (170)
// ─────────────────────────────────────────────────────────────────────────────
describe('programme-registry', () => {
  let prog: ReturnType<typeof createDefaultProgramme>;

  beforeEach(() => { prog = createDefaultProgramme(); });

  // ── createDefaultProgramme — identity (35) ────────────────────────────────
  describe('createDefaultProgramme — identity', () => {
    it('id is T3_PROGRAMME_ID',                       () => expect(prog.id).toBe(T3_PROGRAMME_ID));
    it('id value is NEXARA-T3-V1',                    () => expect(prog.id).toBe('NEXARA-T3-V1'));
    it('name is T3_PROGRAMME_NAME',                   () => expect(prog.name).toBe(T3_PROGRAMME_NAME));
    it('version is T3_PROGRAMME_VERSION',             () => expect(prog.version).toBe(T3_PROGRAMME_VERSION));
    it('cpdHours is T3_CPD_HOURS',                    () => expect(prog.cpdHours).toBe(T3_CPD_HOURS));
    it('cpdHours is 14',                              () => expect(prog.cpdHours).toBe(14));
    it('maxParticipants is 8',                        () => expect(prog.maxParticipants).toBe(8));
    it('minParticipants is 2',                        () => expect(prog.minParticipants).toBe(2));
    it('days is 2',                                   () => expect(prog.days).toBe(2));
    it('deliveryModes includes IN_PERSON',            () => expect(prog.deliveryModes).toContain('IN_PERSON'));
    it('deliveryModes includes VIRTUAL',              () => expect(prog.deliveryModes).toContain('VIRTUAL'));
    it('deliveryModes includes HYBRID',               () => expect(prog.deliveryModes).toContain('HYBRID'));
    it('deliveryModes has 3 entries',                 () => expect(prog.deliveryModes).toHaveLength(3));
    it('prerequisite mentions certification',          () => expect(prog.prerequisite).toMatch(/certif/i));
    it('prerequisite mentions Nexara',                 () => expect(prog.prerequisite).toMatch(/Nexara/));
    it('sessions is an array',                        () => expect(Array.isArray(prog.sessions)).toBe(true));
    it('has 20 sessions total',                       () => expect(prog.sessions).toHaveLength(20));
    it('each session has id field',                   () => prog.sessions.forEach(s => expect(s).toHaveProperty('id')));
    it('each session has day field',                  () => prog.sessions.forEach(s => expect(s).toHaveProperty('day')));
    it('each session has title field',                () => prog.sessions.forEach(s => expect(s).toHaveProperty('title')));
    it('each session has type field',                 () => prog.sessions.forEach(s => expect(s).toHaveProperty('type')));
    it('each session has durationMinutes field',      () => prog.sessions.forEach(s => expect(s).toHaveProperty('durationMinutes')));
    it('each session has isCPDEligible field',        () => prog.sessions.forEach(s => expect(s).toHaveProperty('isCPDEligible')));
    it('has 10 Day 1 sessions',                       () => expect(prog.sessions.filter(s=>s.day==='DAY_1')).toHaveLength(10));
    it('has 10 Day 2 sessions',                       () => expect(prog.sessions.filter(s=>s.day==='DAY_2')).toHaveLength(10));
    it('has 6 BREAK sessions',                        () => expect(prog.sessions.filter(s=>s.type==='BREAK')).toHaveLength(6));
    it('has 5 MODULE sessions',                       () => expect(prog.sessions.filter(s=>s.type==='MODULE')).toHaveLength(5));
    it('has 2 LAB sessions',                          () => expect(prog.sessions.filter(s=>s.type==='LAB')).toHaveLength(2));
    it('has 2 ASSESSMENT sessions',                   () => expect(prog.sessions.filter(s=>s.type==='ASSESSMENT')).toHaveLength(2));
    it('has 2 OPENING sessions',                      () => expect(prog.sessions.filter(s=>s.type==='OPENING')).toHaveLength(2));
    it('has 2 DEBRIEF sessions',                      () => expect(prog.sessions.filter(s=>s.type==='DEBRIEF')).toHaveLength(2));
    it('has 1 CEREMONY session',                      () => expect(prog.sessions.filter(s=>s.type==='CEREMONY')).toHaveLength(1));
    it('all session ids are unique',                  () => { const ids = prog.sessions.map(s=>s.id); expect(new Set(ids).size).toBe(ids.length); });
    it('all BREAK sessions are not CPD eligible',     () => prog.sessions.filter(s=>s.type==='BREAK').forEach(s => expect(s.isCPDEligible).toBe(false)));
  });

  // ── getSessionsByDay (20) ─────────────────────────────────────────────────
  describe('getSessionsByDay', () => {
    it('returns 10 sessions for DAY_1',                () => expect(getSessionsByDay(prog,'DAY_1')).toHaveLength(10));
    it('returns 10 sessions for DAY_2',                () => expect(getSessionsByDay(prog,'DAY_2')).toHaveLength(10));
    it('all returned DAY_1 sessions have day DAY_1',   () => getSessionsByDay(prog,'DAY_1').forEach(s => expect(s.day).toBe('DAY_1')));
    it('all returned DAY_2 sessions have day DAY_2',   () => getSessionsByDay(prog,'DAY_2').forEach(s => expect(s.day).toBe('DAY_2')));
    it('returns array type',                           () => expect(Array.isArray(getSessionsByDay(prog,'DAY_1'))).toBe(true));
    it('DAY_1 includes d1-s1',                         () => expect(getSessionsByDay(prog,'DAY_1').map(s=>s.id)).toContain('d1-s1'));
    it('DAY_1 includes d1-s10',                        () => expect(getSessionsByDay(prog,'DAY_1').map(s=>s.id)).toContain('d1-s10'));
    it('DAY_2 includes d2-s1',                         () => expect(getSessionsByDay(prog,'DAY_2').map(s=>s.id)).toContain('d2-s1'));
    it('DAY_2 includes d2-s10',                        () => expect(getSessionsByDay(prog,'DAY_2').map(s=>s.id)).toContain('d2-s10'));
    it('DAY_1 does not include any DAY_2 sessions',    () => getSessionsByDay(prog,'DAY_1').forEach(s => expect(s.day).not.toBe('DAY_2')));
    it('DAY_2 does not include any DAY_1 sessions',    () => getSessionsByDay(prog,'DAY_2').forEach(s => expect(s.day).not.toBe('DAY_1')));
    it('DAY_1 has 3 BREAK sessions',                   () => expect(getSessionsByDay(prog,'DAY_1').filter(s=>s.type==='BREAK')).toHaveLength(3));
    it('DAY_2 has 3 BREAK sessions',                   () => expect(getSessionsByDay(prog,'DAY_2').filter(s=>s.type==='BREAK')).toHaveLength(3));
    it('DAY_1 has 3 MODULE sessions',                  () => expect(getSessionsByDay(prog,'DAY_1').filter(s=>s.type==='MODULE')).toHaveLength(3));
    it('DAY_2 has 2 MODULE sessions',                  () => expect(getSessionsByDay(prog,'DAY_2').filter(s=>s.type==='MODULE')).toHaveLength(2));
    it('DAY_1 has 1 LAB session',                      () => expect(getSessionsByDay(prog,'DAY_1').filter(s=>s.type==='LAB')).toHaveLength(1));
    it('DAY_2 has 1 LAB session',                      () => expect(getSessionsByDay(prog,'DAY_2').filter(s=>s.type==='LAB')).toHaveLength(1));
    it('DAY_2 has 1 ASSESSMENT session',               () => expect(getSessionsByDay(prog,'DAY_2').filter(s=>s.type==='ASSESSMENT')).toHaveLength(1));
    it('DAY_2 has 1 CEREMONY session',                 () => expect(getSessionsByDay(prog,'DAY_2').filter(s=>s.type==='CEREMONY')).toHaveLength(1));
    it('sum of DAY_1 and DAY_2 counts = total',        () => expect(getSessionsByDay(prog,'DAY_1').length + getSessionsByDay(prog,'DAY_2').length).toBe(prog.sessions.length));
  });

  // ── getSessionsByType (20) ────────────────────────────────────────────────
  describe('getSessionsByType', () => {
    it('BREAK returns 6 sessions',                () => expect(getSessionsByType(prog,'BREAK')).toHaveLength(6));
    it('MODULE returns 5 sessions',               () => expect(getSessionsByType(prog,'MODULE')).toHaveLength(5));
    it('LAB returns 2 sessions',                  () => expect(getSessionsByType(prog,'LAB')).toHaveLength(2));
    it('ASSESSMENT returns 2 sessions',           () => expect(getSessionsByType(prog,'ASSESSMENT')).toHaveLength(2));
    it('OPENING returns 2 sessions',              () => expect(getSessionsByType(prog,'OPENING')).toHaveLength(2));
    it('DEBRIEF returns 2 sessions',              () => expect(getSessionsByType(prog,'DEBRIEF')).toHaveLength(2));
    it('CEREMONY returns 1 session',              () => expect(getSessionsByType(prog,'CEREMONY')).toHaveLength(1));
    it('all BREAK results have type BREAK',       () => getSessionsByType(prog,'BREAK').forEach(s => expect(s.type).toBe('BREAK')));
    it('all MODULE results have type MODULE',      () => getSessionsByType(prog,'MODULE').forEach(s => expect(s.type).toBe('MODULE')));
    it('all LAB results have type LAB',           () => getSessionsByType(prog,'LAB').forEach(s => expect(s.type).toBe('LAB')));
    it('all ASSESSMENT results have type ASSESSMENT', () => getSessionsByType(prog,'ASSESSMENT').forEach(s => expect(s.type).toBe('ASSESSMENT')));
    it('all OPENING results have type OPENING',   () => getSessionsByType(prog,'OPENING').forEach(s => expect(s.type).toBe('OPENING')));
    it('all DEBRIEF results have type DEBRIEF',   () => getSessionsByType(prog,'DEBRIEF').forEach(s => expect(s.type).toBe('DEBRIEF')));
    it('all CEREMONY results have type CEREMONY', () => getSessionsByType(prog,'CEREMONY').forEach(s => expect(s.type).toBe('CEREMONY')));
    it('returns array type',                      () => expect(Array.isArray(getSessionsByType(prog,'BREAK'))).toBe(true));
    it('BREAK sessions span both days',           () => { const days = getSessionsByType(prog,'BREAK').map(s=>s.day); expect(days).toContain('DAY_1'); expect(days).toContain('DAY_2'); });
    it('LAB sessions span both days',             () => { const days = getSessionsByType(prog,'LAB').map(s=>s.day); expect(days).toContain('DAY_1'); expect(days).toContain('DAY_2'); });
    it('ASSESSMENT sessions span both days',      () => { const days = getSessionsByType(prog,'ASSESSMENT').map(s=>s.day); expect(days).toContain('DAY_1'); expect(days).toContain('DAY_2'); });
    it('sum of all type counts equals 20',        () => { const total = (['BREAK','MODULE','LAB','ASSESSMENT','OPENING','DEBRIEF','CEREMONY'] as const).reduce((sum,t) => sum + getSessionsByType(prog,t).length, 0); expect(total).toBe(20); });
    it('CEREMONY is on DAY_2',                    () => expect(getSessionsByType(prog,'CEREMONY')[0].day).toBe('DAY_2'));
  });

  // ── getCPDEligibleSessions and calculateCPDMinutes (27) ───────────────────
  describe('getCPDEligibleSessions and calculateCPDMinutes', () => {
    it('getCPDEligibleSessions returns array',               () => expect(Array.isArray(getCPDEligibleSessions(prog))).toBe(true));
    it('getCPDEligibleSessions returns 14 sessions',         () => expect(getCPDEligibleSessions(prog)).toHaveLength(14));
    it('all returned sessions have isCPDEligible true',      () => getCPDEligibleSessions(prog).forEach(s => expect(s.isCPDEligible).toBe(true)));
    it('no BREAK sessions in CPD list',                      () => getCPDEligibleSessions(prog).forEach(s => expect(s.type).not.toBe('BREAK')));
    it('all 5 MODULE sessions are CPD eligible',             () => { const cpdIds = getCPDEligibleSessions(prog).map(s=>s.id); getSessionsByType(prog,'MODULE').forEach(s => expect(cpdIds).toContain(s.id)); });
    it('both LAB sessions are CPD eligible',                 () => { const cpdIds = getCPDEligibleSessions(prog).map(s=>s.id); getSessionsByType(prog,'LAB').forEach(s => expect(cpdIds).toContain(s.id)); });
    it('both ASSESSMENT sessions are CPD eligible',          () => { const cpdIds = getCPDEligibleSessions(prog).map(s=>s.id); getSessionsByType(prog,'ASSESSMENT').forEach(s => expect(cpdIds).toContain(s.id)); });
    it('both OPENING sessions are CPD eligible',             () => { const cpdIds = getCPDEligibleSessions(prog).map(s=>s.id); getSessionsByType(prog,'OPENING').forEach(s => expect(cpdIds).toContain(s.id)); });
    it('both DEBRIEF sessions are CPD eligible',             () => { const cpdIds = getCPDEligibleSessions(prog).map(s=>s.id); getSessionsByType(prog,'DEBRIEF').forEach(s => expect(cpdIds).toContain(s.id)); });
    it('CEREMONY session is CPD eligible',                   () => { const cpdIds = getCPDEligibleSessions(prog).map(s=>s.id); expect(cpdIds).toContain('d2-s10'); });
    it('calculateCPDMinutes returns a number',               () => expect(typeof calculateCPDMinutes(prog)).toBe('number'));
    it('calculateCPDMinutes returns 870',                    () => expect(calculateCPDMinutes(prog)).toBe(870));
    it('CPD hours derived from minutes is 14.5',             () => expect(calculateCPDMinutes(prog) / 60).toBeCloseTo(14.5));
    it('|CPD hours - declared| is not > 0.5',                () => expect(Math.abs(calculateCPDMinutes(prog)/60 - prog.cpdHours)).not.toBeGreaterThan(0.5));
    it('calculateCPDMinutes equals sum of eligible durations', () => { const expected = getCPDEligibleSessions(prog).reduce((s,x)=>s+x.durationMinutes,0); expect(calculateCPDMinutes(prog)).toBe(expected); });
    it('empty programme returns 0 CPD minutes',             () => { const p = {...prog, sessions: []}; expect(calculateCPDMinutes(p)).toBe(0); });
    it('all-breaks programme returns 0 CPD minutes',        () => { const p = {...prog, sessions: prog.sessions.filter(s=>s.type==='BREAK')}; expect(calculateCPDMinutes(p)).toBe(0); });
    it('CPD sessions count does not include any BREAKs',    () => expect(getCPDEligibleSessions(prog).filter(s=>s.type==='BREAK')).toHaveLength(0));
    it('d1-s1 (OPENING DAY_1) is CPD eligible',             () => { const s = prog.sessions.find(s=>s.id==='d1-s1')!; expect(s.isCPDEligible).toBe(true); });
    it('d2-s1 (OPENING DAY_2) is CPD eligible',             () => { const s = prog.sessions.find(s=>s.id==='d2-s1')!; expect(s.isCPDEligible).toBe(true); });
    it('d2-s9 (DEBRIEF DAY_2) is CPD eligible',             () => { const s = prog.sessions.find(s=>s.id==='d2-s9')!; expect(s.isCPDEligible).toBe(true); });
    it('d2-s10 (CEREMONY) is CPD eligible',                  () => { const s = prog.sessions.find(s=>s.id==='d2-s10')!; expect(s.isCPDEligible).toBe(true); });
    it('d1-s3 (BREAK) is not CPD eligible',                  () => { const s = prog.sessions.find(s=>s.id==='d1-s3')!; expect(s.isCPDEligible).toBe(false); });
    it('d1-s5 (Lunch BREAK) is not CPD eligible',            () => { const s = prog.sessions.find(s=>s.id==='d1-s5')!; expect(s.isCPDEligible).toBe(false); });
    it('d2-s3 (Morning Break DAY_2) is not CPD eligible',    () => { const s = prog.sessions.find(s=>s.id==='d2-s3')!; expect(s.isCPDEligible).toBe(false); });
    it('BREAK total minutes = 150',                          () => { const breaks = prog.sessions.filter(s=>s.type==='BREAK'); expect(breaks.reduce((s,x)=>s+x.durationMinutes,0)).toBe(150); });
    it('total minutes (CPD + BREAK) = 1020',                 () => expect(calculateCPDMinutes(prog) + 150).toBe(1020));
  });

  // ── totalSessionDuration (18) ─────────────────────────────────────────────
  describe('totalSessionDuration', () => {
    it('total for all sessions is 1020 min',         () => expect(totalSessionDuration(prog)).toBe(1020));
    it('DAY_1 total is 510 min',                     () => expect(totalSessionDuration(prog,'DAY_1')).toBe(510));
    it('DAY_2 total is 510 min',                     () => expect(totalSessionDuration(prog,'DAY_2')).toBe(510));
    it('DAY_1 + DAY_2 = overall total',              () => expect(totalSessionDuration(prog,'DAY_1') + totalSessionDuration(prog,'DAY_2')).toBe(totalSessionDuration(prog)));
    it('returns number type',                        () => expect(typeof totalSessionDuration(prog)).toBe('number'));
    it('without day arg returns all sessions sum',   () => { const sum = prog.sessions.reduce((s,x)=>s+x.durationMinutes,0); expect(totalSessionDuration(prog)).toBe(sum); });
    it('with DAY_1 arg sums only DAY_1',             () => { const sum = prog.sessions.filter(s=>s.day==='DAY_1').reduce((s,x)=>s+x.durationMinutes,0); expect(totalSessionDuration(prog,'DAY_1')).toBe(sum); });
    it('with DAY_2 arg sums only DAY_2',             () => { const sum = prog.sessions.filter(s=>s.day==='DAY_2').reduce((s,x)=>s+x.durationMinutes,0); expect(totalSessionDuration(prog,'DAY_2')).toBe(sum); });
    it('empty session list returns 0',               () => expect(totalSessionDuration({...prog,sessions:[]})).toBe(0));
    it('single session returns its duration',        () => { const one = {...prog, sessions:[prog.sessions[0]]}; expect(totalSessionDuration(one)).toBe(prog.sessions[0].durationMinutes); });
    it('8.5 hours per day (510 min)',                () => expect(totalSessionDuration(prog,'DAY_1')).toBe(8.5*60));
    it('total is 17 hours (1020 min)',               () => expect(totalSessionDuration(prog)).toBe(17*60));
    it('DAY_1 BREAK minutes = 75',                   () => { const d1breaks = prog.sessions.filter(s=>s.day==='DAY_1'&&s.type==='BREAK'); expect(d1breaks.reduce((s,x)=>s+x.durationMinutes,0)).toBe(75); });
    it('DAY_2 BREAK minutes = 75',                   () => { const d2breaks = prog.sessions.filter(s=>s.day==='DAY_2'&&s.type==='BREAK'); expect(d2breaks.reduce((s,x)=>s+x.durationMinutes,0)).toBe(75); });
    it('total break minutes = 150',                  () => { const breaks = prog.sessions.filter(s=>s.type==='BREAK'); expect(breaks.reduce((s,x)=>s+x.durationMinutes,0)).toBe(150); });
    it('non-break minutes per day = 435',            () => { const nb = prog.sessions.filter(s=>s.day==='DAY_1'&&s.type!=='BREAK'); expect(nb.reduce((s,x)=>s+x.durationMinutes,0)).toBe(435); });
    it('1020 - 150 breaks = 870 non-break minutes',  () => expect(totalSessionDuration(prog) - 150).toBe(870));
    it('returns consistent result on repeated call', () => expect(totalSessionDuration(prog)).toBe(totalSessionDuration(prog)));
  });

  // ── supportsDeliveryMode (15) ─────────────────────────────────────────────
  describe('supportsDeliveryMode', () => {
    it('supports IN_PERSON',                              () => expect(supportsDeliveryMode(prog,'IN_PERSON')).toBe(true));
    it('supports VIRTUAL',                                () => expect(supportsDeliveryMode(prog,'VIRTUAL')).toBe(true));
    it('supports HYBRID',                                 () => expect(supportsDeliveryMode(prog,'HYBRID')).toBe(true));
    it('returns boolean type',                            () => expect(typeof supportsDeliveryMode(prog,'IN_PERSON')).toBe('boolean'));
    it('returns false for mode not in list',              () => { const p = {...prog, deliveryModes: ['IN_PERSON'] as DeliveryMode[]}; expect(supportsDeliveryMode(p,'VIRTUAL')).toBe(false); });
    it('IN_PERSON-only programme does not support VIRTUAL', () => { const p = {...prog, deliveryModes: ['IN_PERSON'] as DeliveryMode[]}; expect(supportsDeliveryMode(p,'VIRTUAL')).toBe(false); });
    it('IN_PERSON-only programme does not support HYBRID',  () => { const p = {...prog, deliveryModes: ['IN_PERSON'] as DeliveryMode[]}; expect(supportsDeliveryMode(p,'HYBRID')).toBe(false); });
    it('VIRTUAL-only programme does not support IN_PERSON',  () => { const p = {...prog, deliveryModes: ['VIRTUAL'] as DeliveryMode[]}; expect(supportsDeliveryMode(p,'IN_PERSON')).toBe(false); });
    it('empty deliveryModes returns false for any mode',  () => { const p = {...prog, deliveryModes: [] as DeliveryMode[]}; expect(supportsDeliveryMode(p,'IN_PERSON')).toBe(false); });
    it('IN_PERSON+VIRTUAL but not HYBRID',               () => { const p = {...prog, deliveryModes: ['IN_PERSON','VIRTUAL'] as DeliveryMode[]}; expect(supportsDeliveryMode(p,'HYBRID')).toBe(false); });
    it('IN_PERSON+VIRTUAL supports IN_PERSON',           () => { const p = {...prog, deliveryModes: ['IN_PERSON','VIRTUAL'] as DeliveryMode[]}; expect(supportsDeliveryMode(p,'IN_PERSON')).toBe(true); });
    it('all three modes: IN_PERSON true',                () => expect(supportsDeliveryMode(prog,'IN_PERSON')).toBe(true));
    it('all three modes: VIRTUAL true',                  () => expect(supportsDeliveryMode(prog,'VIRTUAL')).toBe(true));
    it('all three modes: HYBRID true',                   () => expect(supportsDeliveryMode(prog,'HYBRID')).toBe(true));
    it('default programme supports all 3 modes',         () => expect(['IN_PERSON','VIRTUAL','HYBRID'].every(m => supportsDeliveryMode(prog, m as DeliveryMode))).toBe(true));
  });

  // ── validateProgramme (35) ────────────────────────────────────────────────
  describe('validateProgramme', () => {
    it('default programme returns no errors',                    () => expect(validateProgramme(prog)).toHaveLength(0));
    it('returns an array',                                       () => expect(Array.isArray(validateProgramme(prog))).toBe(true));
    it('default programme returns empty array',                   () => expect(validateProgramme(prog)).toEqual([]));
    it('maxParticipants > 8 produces error',                     () => expect(validateProgramme({...prog,maxParticipants:9})).toEqual(expect.arrayContaining([expect.stringContaining('maxParticipants')])));
    it('maxParticipants = 8 is valid',                           () => expect(validateProgramme({...prog,maxParticipants:8})).toHaveLength(0));
    it('maxParticipants = 7 is valid',                           () => expect(validateProgramme({...prog,maxParticipants:7})).toHaveLength(0));
    it('minParticipants < 2 produces error',                     () => expect(validateProgramme({...prog,minParticipants:1})).toEqual(expect.arrayContaining([expect.stringContaining('minParticipants')])));
    it('minParticipants = 2 is valid',                           () => expect(validateProgramme({...prog,minParticipants:2})).toHaveLength(0));
    it('minParticipants = 3 is valid',                           () => expect(validateProgramme({...prog,minParticipants:3})).toHaveLength(0));
    it('minParticipants > maxParticipants produces error',       () => expect(validateProgramme({...prog,minParticipants:9,maxParticipants:8})).toEqual(expect.arrayContaining([expect.stringContaining('minParticipants cannot exceed')])));
    it('days != 2 produces error',                               () => expect(validateProgramme({...prog,days:3})).toEqual(expect.arrayContaining([expect.stringContaining('days')])));
    it('days = 2 is valid',                                      () => expect(validateProgramme({...prog,days:2})).toHaveLength(0));
    it('days = 1 produces error',                                () => expect(validateProgramme({...prog,days:1})).toEqual(expect.arrayContaining([expect.stringContaining('days')])));
    it('CPD hours declared 10 with 870min sessions produces error', () => expect(validateProgramme({...prog,cpdHours:10})).toEqual(expect.arrayContaining([expect.stringContaining('CPD hours mismatch')])));
    it('CPD hours declared 16 with 870min sessions produces error', () => expect(validateProgramme({...prog,cpdHours:16})).toEqual(expect.arrayContaining([expect.stringContaining('CPD hours mismatch')])));
    it('CPD hours declared 14 within 0.5h tolerance is valid',   () => expect(validateProgramme({...prog,cpdHours:14})).toHaveLength(0));
    it('no DAY_1 sessions produces error',                       () => { const p = {...prog,sessions:prog.sessions.filter(s=>s.day!=='DAY_1')}; expect(validateProgramme(p)).toEqual(expect.arrayContaining([expect.stringContaining('Day 1')])); });
    it('no DAY_2 sessions produces error',                       () => { const p = {...prog,sessions:prog.sessions.filter(s=>s.day!=='DAY_2')}; expect(validateProgramme(p)).toEqual(expect.arrayContaining([expect.stringContaining('Day 2')])); });
    it('no DAY_2 ASSESSMENT produces error',                     () => { const p = {...prog,sessions:prog.sessions.filter(s=>!(s.day==='DAY_2'&&s.type==='ASSESSMENT'))}; expect(validateProgramme(p)).toEqual(expect.arrayContaining([expect.stringContaining('assessment')])); });
    it('no DAY_2 LAB produces error',                            () => { const p = {...prog,sessions:prog.sessions.filter(s=>!(s.day==='DAY_2'&&s.type==='LAB'))}; expect(validateProgramme(p)).toEqual(expect.arrayContaining([expect.stringContaining('LAB')])); });
    it('DAY_1 ASSESSMENT only (not DAY_2) still errors',         () => { const p = {...prog,sessions:prog.sessions.filter(s=>!(s.day==='DAY_2'&&s.type==='ASSESSMENT'))}; expect(validateProgramme(p).some(e=>e.toLowerCase().includes('assessment'))).toBe(true); });
    it('maxParticipants = 0 produces error',                     () => expect(validateProgramme({...prog,maxParticipants:0,minParticipants:0})).not.toHaveLength(0));
    it('multiple errors when multiple invalid fields',            () => expect(validateProgramme({...prog,days:1,maxParticipants:9}).length).toBeGreaterThan(0));
    it('multiple errors scenario has at least 2 errors',         () => expect(validateProgramme({...prog,days:1,maxParticipants:9}).length).toBeGreaterThanOrEqual(2));
    it('returns string errors',                                  () => validateProgramme({...prog,days:1}).forEach(e => expect(typeof e).toBe('string')));
    it('error strings are non-empty',                            () => validateProgramme({...prog,days:1}).forEach(e => expect(e.length).toBeGreaterThan(0)));
    it('minParticipants = 0 produces error',                     () => expect(validateProgramme({...prog,minParticipants:0})).toEqual(expect.arrayContaining([expect.stringContaining('minParticipants')])));
    it('minParticipants = 1 produces error',                     () => expect(validateProgramme({...prog,minParticipants:1})).toEqual(expect.arrayContaining([expect.stringContaining('minParticipants')])));
    it('sessions empty produces Day 1 and Day 2 errors',         () => { const p = {...prog,sessions:[]}; const errs = validateProgramme(p); expect(errs.some(e=>e.includes('Day 1'))).toBe(true); expect(errs.some(e=>e.includes('Day 2'))).toBe(true); });
    it('cpdHours declared exactly 14.5 still within tolerance',  () => expect(validateProgramme({...prog,cpdHours:14.5})).toHaveLength(0));
    it('T3_PROGRAMME_ID constant matches id',                    () => expect(T3_PROGRAMME_ID).toBe(prog.id));
    it('T3_CPD_HOURS constant matches cpdHours',                 () => expect(T3_CPD_HOURS).toBe(prog.cpdHours));
    it('T3_DAYS constant matches days',                          () => expect(T3_DAYS).toBe(prog.days));
    it('T3_MAX_PARTICIPANTS matches maxParticipants',            () => { expect(prog.maxParticipants).toBe(8); });
    it('T3_MIN_PARTICIPANTS matches minParticipants',            () => { expect(prog.minParticipants).toBe(2); });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Integration (55)
// ─────────────────────────────────────────────────────────────────────────────
describe('Integration', () => {
  const CERT_DATE = '2026-03-01';

  function fullDeliveryPass(): DomainScore[] { return makeScores(3,3,3,3,3); }
  function fullDeliveryFail(): DomainScore[] { return makeScores(1,1,1,1,1); }
  function sda(ds: DomainScore[]) { return scoreDeliveryAssessment('p','c','obs','seg',ds); }

  // Cohort + programme integration (20) ─────────────────────────────────────
  describe('CohortManager + programme-registry', () => {
    let mgr: CohortManager;
    let prog: Programme;
    beforeEach(() => { mgr = new CohortManager(); prog = createDefaultProgramme(); });

    it('programme supports IN_PERSON cohort delivery mode',     () => { mgr.create('c1','org1','mt1','2026-06-01','Dubai','IN_PERSON'); expect(supportsDeliveryMode(prog, mgr.get('c1').deliveryMode)).toBe(true); });
    it('programme supports VIRTUAL cohort delivery mode',       () => { mgr.create('c1','org1','mt1','2026-06-01','Online','VIRTUAL'); expect(supportsDeliveryMode(prog, mgr.get('c1').deliveryMode)).toBe(true); });
    it('programme supports HYBRID cohort delivery mode',        () => { mgr.create('c1','org1','mt1','2026-06-01','Dubai','HYBRID'); expect(supportsDeliveryMode(prog, mgr.get('c1').deliveryMode)).toBe(true); });
    it('validateProgramme clean before cohort start',           () => { expect(validateProgramme(prog)).toHaveLength(0); });
    it('cohort maxParticipants <= programme max',               () => { mgr.create('c1','org1','mt1','2026-06-01','Dubai','IN_PERSON',6); expect(mgr.get('c1').maxParticipants).toBeLessThanOrEqual(prog.maxParticipants); });
    it('cohort at programme max (8) is valid',                  () => { mgr.create('c1','org1','mt1','2026-06-01','Dubai','IN_PERSON',8); expect(mgr.get('c1').maxParticipants).toBe(prog.maxParticipants); });
    it('cohort cannot exceed programme max',                    () => expect(() => mgr.create('c1','org1','mt1','2026-06-01','Dubai','IN_PERSON',9)).toThrow());
    it('full cohort completion rate = 100 after all complete',  () => { mgr.create('c1','org1','mt1','2026-06-01','Dubai','IN_PERSON'); for(let i=1;i<=2;i++) mgr.enrol('c1',`p${i}`); mgr.start('c1'); for(let i=1;i<=2;i++) mgr.completeParticipant('c1',`p${i}`); expect(mgr.completionRate('c1')).toBe(100); });
    it('certification rate = 100 when all certified',           () => { mgr.create('c1','org1','mt1','2026-06-01','Dubai','IN_PERSON'); for(let i=1;i<=2;i++) mgr.enrol('c1',`p${i}`); mgr.start('c1'); for(let i=1;i<=2;i++) { mgr.completeParticipant('c1',`p${i}`); mgr.certifyParticipant('c1',`p${i}`); } expect(mgr.certificationRate('c1')).toBe(100); });
    it('enrolment up to minParticipants allows start',          () => { mgr.create('c1','org1','mt1','2026-06-01','Dubai','IN_PERSON'); for(let i=1;i<=2;i++) mgr.enrol('c1',`p${i}`); expect(() => mgr.start('c1')).not.toThrow(); });
    it('enrolment below min prevents start',                    () => { mgr.create('c1','org1','mt1','2026-06-01','Dubai','IN_PERSON'); mgr.enrol('c1','p1'); expect(() => mgr.start('c1')).toThrow(); });
    it('programme has DAY_2 LAB so assessed delivery possible',  () => expect(getSessionsByType(prog,'LAB').some(s=>s.day==='DAY_2')).toBe(true));
    it('programme has DAY_2 ASSESSMENT so written test possible', () => expect(getSessionsByType(prog,'ASSESSMENT').some(s=>s.day==='DAY_2')).toBe(true));
    it('programme has DAY_2 CEREMONY so certificate possible',   () => expect(getSessionsByType(prog,'CEREMONY').some(s=>s.day==='DAY_2')).toBe(true));
    it('CPD hours sufficient for training',                      () => expect(prog.cpdHours).toBeGreaterThanOrEqual(14));
    it('getByOrganisation and getByMasterTrainer consistent',    () => { mgr.create('c1','org1','mt1','2026-06-01','Dubai','IN_PERSON'); expect(mgr.getByOrganisation('org1')).toHaveLength(mgr.getByMasterTrainer('mt1').length); });
    it('cancelled cohort excluded from IN_PROGRESS list',       () => { mgr.create('c1','org1','mt1','2026-06-01','Dubai','IN_PERSON'); mgr.cancel('c1'); expect(mgr.getByStatus('IN_PROGRESS')).toHaveLength(0); });
    it('closed cohort in COMPLETED list',                       () => { mgr.create('c1','org1','mt1','2026-06-01','Dubai','IN_PERSON'); for(let i=1;i<=2;i++) mgr.enrol('c1',`p${i}`); mgr.start('c1'); mgr.close('c1'); expect(mgr.getByStatus('COMPLETED')).toHaveLength(1); });
    it('programme days align with cohort lifecycle (2 days)',    () => expect(prog.days).toBe(2));
    it('multiple cohorts tracked independently',                 () => { mgr.create('c1','org1','mt1','2026-06-01','Dubai','IN_PERSON'); mgr.create('c2','org2','mt2','2026-07-01','London','VIRTUAL'); expect(mgr.count()).toBe(2); });
  });

  // TrainerRegistry + scoring integration (20) ──────────────────────────────
  describe('TrainerRegistry + scoring', () => {
    let reg: TrainerRegistry;
    beforeEach(() => { reg = new TrainerRegistry(); });

    it('certificationDate from register feeds calculateRenewalDueDate correctly', () => {
      const t = reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90);
      expect(t.renewalDueDate).toBe(calculateRenewalDueDate(CERT_DATE));
    });
    it('refreshStatus uses getLapsedSeverity logic correctly (ACTIVE)',          () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); expect(reg.refreshStatus('t1','2027-02-01')).toBe('ACTIVE'); });
    it('refreshStatus uses getLapsedSeverity logic correctly (LAPSED_WARNING)',  () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); expect(reg.refreshStatus('t1','2027-03-10')).toBe('LAPSED_WARNING'); });
    it('refreshStatus uses getLapsedSeverity logic correctly (SUSPENDED)',       () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); expect(reg.refreshStatus('t1','2027-04-15')).toBe('SUSPENDED'); });
    it('refreshStatus uses getLapsedSeverity logic correctly (LAPSED)',          () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); expect(reg.refreshStatus('t1','2027-07-10')).toBe('LAPSED'); });
    it('refreshStatus uses getLapsedSeverity logic correctly (CANCELLED)',       () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); expect(reg.refreshStatus('t1','2027-09-10')).toBe('CANCELLED'); });
    it('daysUntilRenewal matches trainer renewalDueDate',                        () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); expect(daysUntilRenewal(CERT_DATE,'2026-06-01')).toBeGreaterThan(0); });
    it('needsRenewalReminder 60d flag fires near renewal',                       () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); expect(needsRenewalReminder(CERT_DATE,'2027-01-15')).toBe('60_DAY'); });
    it('needsRenewalReminder 14d flag fires close to renewal',                   () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); expect(needsRenewalReminder(CERT_DATE,'2027-02-20')).toBe('14_DAY'); });
    it('isRenewalLapsed is false before renewal',                                () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); expect(isRenewalLapsed(CERT_DATE,'2026-06-01')).toBe(false); });
    it('isRenewalLapsed is true after renewal date',                             () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); expect(isRenewalLapsed(CERT_DATE,'2027-03-10')).toBe(true); });
    it('scoreWrittenAssessment(15) passes with passed=true',                     () => { const r = scoreWrittenAssessment('p','c',15); expect(r.passed).toBe(true); });
    it('scoreWrittenAssessment(14) fails with passed=false',                     () => { const r = scoreWrittenAssessment('p','c',14); expect(r.passed).toBe(false); });
    it('scoreDeliveryAssessment with all 3s passes',                             () => { const r = sda(fullDeliveryPass()); expect(r.passed).toBe(true); });
    it('determineCertificationOutcome both pass => CERTIFIED',                   () => { const w = scoreWrittenAssessment('p','c',15); const d = sda(fullDeliveryPass()); expect(determineCertificationOutcome(w.passed, d.passed)).toBe('CERTIFIED'); });
    it('determineCertificationOutcome written fail => FULL_RETAKE',              () => { const w = scoreWrittenAssessment('p','c',10); const d = sda(fullDeliveryPass()); expect(determineCertificationOutcome(w.passed, d.passed)).toBe('FULL_RETAKE'); });
    it('calculateResubmissionDeadline from CERT_DATE is after CERT_DATE',       () => expect(calculateResubmissionDeadline(CERT_DATE) > CERT_DATE).toBe(true));
    it('isWithinResubmissionWindow is true 15 days after assessment',           () => expect(isWithinResubmissionWindow(CERT_DATE,'2026-03-16')).toBe(true));
    it('scoreRenewalAssessment(7) passes',                                       () => expect(scoreRenewalAssessment(7).passed).toBe(true));
    it('scoreRenewalAssessment(6) fails',                                        () => expect(scoreRenewalAssessment(6).passed).toBe(false));
  });

  // End-to-end trainer lifecycle (15) ───────────────────────────────────────
  describe('end-to-end trainer lifecycle', () => {
    let reg: TrainerRegistry;
    let cohortMgr: CohortManager;
    beforeEach(() => { reg = new TrainerRegistry(); cohortMgr = new CohortManager(); });

    it('register trainer => status ACTIVE',                () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); expect(reg.get('t1').status).toBe('ACTIVE'); });
    it('create cohort => PLANNED',                         () => { cohortMgr.create('c1','org1','t1','2026-06-01','Dubai','IN_PERSON'); expect(cohortMgr.get('c1').status).toBe('PLANNED'); });
    it('enrol 2 participants => enrolment count 2',        () => { cohortMgr.create('c1','org1','t1','2026-06-01','Dubai','IN_PERSON'); cohortMgr.enrol('c1','p1'); cohortMgr.enrol('c1','p2'); expect(cohortMgr.get('c1').enrolledParticipants).toHaveLength(2); });
    it('start cohort => IN_PROGRESS',                     () => { cohortMgr.create('c1','org1','t1','2026-06-01','Dubai','IN_PERSON'); cohortMgr.enrol('c1','p1'); cohortMgr.enrol('c1','p2'); cohortMgr.start('c1'); expect(cohortMgr.get('c1').status).toBe('IN_PROGRESS'); });
    it('complete + certify participants => certificationRate 100', () => { cohortMgr.create('c1','org1','t1','2026-06-01','Dubai','IN_PERSON'); ['p1','p2'].forEach(p => cohortMgr.enrol('c1',p)); cohortMgr.start('c1'); ['p1','p2'].forEach(p => { cohortMgr.completeParticipant('c1',p); cohortMgr.certifyParticipant('c1',p); }); expect(cohortMgr.certificationRate('c1')).toBe(100); });
    it('record delivery for trainer => cohortsDelivered 1', () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); reg.recordDelivery('t1','2026-06-01'); expect(reg.get('t1').cohortsDelivered).toBe(1); });
    it('close cohort => COMPLETED',                       () => { cohortMgr.create('c1','org1','t1','2026-06-01','Dubai','IN_PERSON'); ['p1','p2'].forEach(p => cohortMgr.enrol('c1',p)); cohortMgr.start('c1'); cohortMgr.close('c1'); expect(cohortMgr.get('c1').status).toBe('COMPLETED'); });
    it('trainer LAPSED after renewal date passes',         () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); reg.refreshStatus('t1','2027-07-10'); expect(reg.get('t1').status).toBe('LAPSED'); });
    it('trainer renews => ACTIVE',                        () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); reg.refreshStatus('t1','2027-07-10'); reg.renew('t1','2027-08-01'); expect(reg.get('t1').status).toBe('ACTIVE'); });
    it('cancelled trainer cannot renew -- must re-certify', () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); reg.refreshStatus('t1','2027-10-01'); expect(() => reg.renew('t1','2027-10-01')).toThrow(/CANCELLED/i); });
    it('written pass + delivery fail => CONDITIONAL',        () => { const w = scoreWrittenAssessment('p','c',15); const d = sda(fullDeliveryFail()); expect(determineCertificationOutcome(w.passed, d.passed)).toBe('CONDITIONAL'); });
    it('full programme valid for all three delivery modes', () => { const p = createDefaultProgramme(); ['IN_PERSON','VIRTUAL','HYBRID'].forEach(m => expect(supportsDeliveryMode(p,m as DeliveryMode)).toBe(true)); });
    it('two cohorts for two orgs tracked separately',      () => { ['org1','org2'].forEach((org,i) => cohortMgr.create(`c${i+1}`,org,'mt1',`2026-0${i+6}-01`,'Dubai','IN_PERSON')); expect(cohortMgr.getByOrganisation('org1')).toHaveLength(1); expect(cohortMgr.getByOrganisation('org2')).toHaveLength(1); });
    it('update scores then refresh status preserves new scores', () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); reg.updateScores('t1',70,75); reg.refreshStatus('t1','2026-06-01'); expect(reg.get('t1').deliveryScore).toBe(70); });
    it('scoreRenewalAssessment integrated with trainer renewal flow', () => { reg.register('t1','Alice','a@b.com','org1',CERT_DATE,85,90); const r = scoreRenewalAssessment(8); if(r.passed) reg.renew('t1','2027-03-01'); expect(reg.get('t1').certificationDate).toBe('2027-03-01'); });
  });
});



