// Copyright (c) 2026 Nexara DMCC. All rights reserved.

import {
  CompetencyDomain,
  CompetencyScore,
  DomainScore,
  DeliveryAssessmentResult,
  WrittenAssessmentResult,
  CertificationOutcome,
} from './types';

// ── Constants ─────────────────────────────────────────────────────────────────

export const WRITTEN_PASS_THRESHOLD = 0.75;      // 75%
export const WRITTEN_TOTAL_QUESTIONS = 20;
export const WRITTEN_PASS_CORRECT = 15;          // 15/20

export const DELIVERY_PASS_THRESHOLD = 2.5;      // 2.5/4 average = 70%
export const DELIVERY_MAX_SCORE_PER_DOMAIN = 4;
export const DELIVERY_DOMAINS: CompetencyDomain[] = [
  'CONTENT_MASTERY',
  'FACILITATION',
  'ASSESSMENT_ADMINISTRATION',
  'PROGRAMME_MANAGEMENT',
  'PROFESSIONALISM',
];

export const DOMAIN_MINIMUM_SCORES: Record<CompetencyDomain, CompetencyScore> = {
  CONTENT_MASTERY: 2,
  FACILITATION: 2,
  ASSESSMENT_ADMINISTRATION: 2,
  PROGRAMME_MANAGEMENT: 1,
  PROFESSIONALISM: 2,
};

// ── Written Assessment Scoring ─────────────────────────────────────────────────

export function scoreWrittenAssessment(
  participantId: string,
  cohortId: string,
  correctAnswers: number,
  attemptDate: string = new Date().toISOString().split('T')[0],
): WrittenAssessmentResult {
  if (correctAnswers < 0) throw new Error('correctAnswers cannot be negative');
  if (correctAnswers > WRITTEN_TOTAL_QUESTIONS) {
    throw new Error(`correctAnswers cannot exceed ${WRITTEN_TOTAL_QUESTIONS}`);
  }

  const scorePercentage = (correctAnswers / WRITTEN_TOTAL_QUESTIONS) * 100;
  const passed = correctAnswers >= WRITTEN_PASS_CORRECT;

  return {
    participantId,
    cohortId,
    attemptDate,
    totalQuestions: WRITTEN_TOTAL_QUESTIONS,
    correctAnswers,
    scorePercentage: Math.round(scorePercentage * 10) / 10,
    passed,
  };
}

// ── Delivery Assessment Scoring ────────────────────────────────────────────────

export function calculateDomainAverage(scores: DomainScore[]): number {
  if (scores.length === 0) return 0;
  const total = scores.reduce((sum, d) => sum + d.score, 0);
  return Math.round((total / scores.length) * 100) / 100;
}

export function checkDomainMinimums(scores: DomainScore[]): boolean {
  return scores.every((d) => d.score >= DOMAIN_MINIMUM_SCORES[d.domain]);
}

export function scoreDeliveryAssessment(
  participantId: string,
  cohortId: string,
  observerId: string,
  segmentDelivered: string,
  domainScores: DomainScore[],
  deliveryDate: string = new Date().toISOString().split('T')[0],
): DeliveryAssessmentResult {
  if (domainScores.length !== DELIVERY_DOMAINS.length) {
    throw new Error(`Expected ${DELIVERY_DOMAINS.length} domain scores, got ${domainScores.length}`);
  }

  const domainsProvided = domainScores.map((d) => d.domain);
  for (const domain of DELIVERY_DOMAINS) {
    if (!domainsProvided.includes(domain)) {
      throw new Error(`Missing domain score for: ${domain}`);
    }
  }

  const overallAverage = calculateDomainAverage(domainScores);
  const overallPercentage = Math.round((overallAverage / DELIVERY_MAX_SCORE_PER_DOMAIN) * 100 * 10) / 10;
  const allDomainMinimumsMet = checkDomainMinimums(domainScores);
  const passed = overallAverage >= DELIVERY_PASS_THRESHOLD && allDomainMinimumsMet;

  return {
    participantId,
    cohortId,
    observerId,
    segmentDelivered,
    deliveryDate,
    domainScores,
    overallAverage,
    overallPercentage,
    passed,
    allDomainMinimumsMet,
  };
}

// ── Certification Outcome ─────────────────────────────────────────────────────

export function determineCertificationOutcome(
  writtenPassed: boolean,
  deliveryPassed: boolean | null,
): CertificationOutcome {
  if (deliveryPassed === null) return 'PENDING';
  if (writtenPassed && deliveryPassed) return 'CERTIFIED';
  if (writtenPassed && !deliveryPassed) return 'CONDITIONAL';
  return 'FULL_RETAKE';
}

// ── Resubmission Window ────────────────────────────────────────────────────────

export const RESUBMISSION_WINDOW_DAYS = 30;
export const RESUBMISSION_EXTENSION_DAYS = 14;

export function calculateResubmissionDeadline(
  cohortDate: string,
  extensionGranted = false,
): string {
  const base = new Date(cohortDate);
  const days = RESUBMISSION_WINDOW_DAYS + (extensionGranted ? RESUBMISSION_EXTENSION_DAYS : 0);
  base.setDate(base.getDate() + days);
  return base.toISOString().split('T')[0];
}

export function isWithinResubmissionWindow(
  cohortDate: string,
  checkDate: string,
  extensionGranted = false,
): boolean {
  const deadline = calculateResubmissionDeadline(cohortDate, extensionGranted);
  return checkDate <= deadline;
}

// ── Renewal ───────────────────────────────────────────────────────────────────

export const RENEWAL_PERIOD_DAYS = 365;
export const RENEWAL_REMINDER_DAYS_60 = 60;
export const RENEWAL_REMINDER_DAYS_14 = 14;
export const RENEWAL_PASS_THRESHOLD = 0.70;  // 70% for refresher (10-question)
export const RENEWAL_TOTAL_QUESTIONS = 10;
export const RENEWAL_PASS_CORRECT = 7;

export function calculateRenewalDueDate(certificationDate: string): string {
  const base = new Date(certificationDate);
  base.setDate(base.getDate() + RENEWAL_PERIOD_DAYS);
  return base.toISOString().split('T')[0];
}

export function daysUntilRenewal(certificationDate: string, today: string): number {
  const renewalDate = calculateRenewalDueDate(certificationDate);
  const ms = new Date(renewalDate).getTime() - new Date(today).getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function needsRenewalReminder(certificationDate: string, today: string): false | '60_DAY' | '14_DAY' {
  const days = daysUntilRenewal(certificationDate, today);
  if (days <= RENEWAL_REMINDER_DAYS_14) return '14_DAY';
  if (days <= RENEWAL_REMINDER_DAYS_60) return '60_DAY';
  return false;
}

export function isRenewalLapsed(certificationDate: string, today: string): boolean {
  const renewalDate = calculateRenewalDueDate(certificationDate);
  return today > renewalDate;
}

export type LapsedSeverity = 'WARNING' | 'SUSPENDED' | 'LAPSED' | 'CANCELLED';

export function getLapsedSeverity(certificationDate: string, today: string): LapsedSeverity | null {
  if (!isRenewalLapsed(certificationDate, today)) return null;
  const renewalDate = calculateRenewalDueDate(certificationDate);
  const daysLapsed = Math.ceil(
    (new Date(today).getTime() - new Date(renewalDate).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysLapsed <= 30) return 'WARNING';
  if (daysLapsed <= 90) return 'SUSPENDED';
  if (daysLapsed <= 180) return 'LAPSED';
  return 'CANCELLED';
}

export function scoreRenewalAssessment(correctAnswers: number): {
  score: number;
  percentage: number;
  passed: boolean;
} {
  if (correctAnswers < 0) throw new Error('correctAnswers cannot be negative');
  if (correctAnswers > RENEWAL_TOTAL_QUESTIONS) {
    throw new Error(`correctAnswers cannot exceed ${RENEWAL_TOTAL_QUESTIONS}`);
  }
  const percentage = (correctAnswers / RENEWAL_TOTAL_QUESTIONS) * 100;
  return {
    score: correctAnswers,
    percentage: Math.round(percentage * 10) / 10,
    passed: correctAnswers >= RENEWAL_PASS_CORRECT,
  };
}
