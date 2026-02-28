// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ── Programme Structure ───────────────────────────────────────────────────────

export type ProgrammeDay = 'DAY_1' | 'DAY_2';
export type SessionType = 'MODULE' | 'LAB' | 'ASSESSMENT' | 'BREAK' | 'OPENING' | 'DEBRIEF' | 'CEREMONY';
export type DeliveryMode = 'IN_PERSON' | 'VIRTUAL' | 'HYBRID';
export type CohortStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ProgrammeSession {
  id: string;
  day: ProgrammeDay;
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
  title: string;
  type: SessionType;
  durationMinutes: number;
  isCPDEligible: boolean;
}

export interface Programme {
  id: string;
  name: string;
  version: string;
  cpdHours: number;
  maxParticipants: number;
  minParticipants: number;
  days: number;
  deliveryModes: DeliveryMode[];
  prerequisite: string;
  sessions: ProgrammeSession[];
}

// ── Competency Framework ──────────────────────────────────────────────────────

export type CompetencyDomain =
  | 'CONTENT_MASTERY'
  | 'FACILITATION'
  | 'ASSESSMENT_ADMINISTRATION'
  | 'PROGRAMME_MANAGEMENT'
  | 'PROFESSIONALISM';

export type CompetencyScore = 1 | 2 | 3 | 4;

export interface DomainScore {
  domain: CompetencyDomain;
  score: CompetencyScore;
  evidence: string[];
  developmentNotes: string;
}

export interface DeliveryAssessmentResult {
  participantId: string;
  cohortId: string;
  observerId: string;
  segmentDelivered: string;
  deliveryDate: string;
  domainScores: DomainScore[];
  overallAverage: number;
  overallPercentage: number;
  passed: boolean;
  allDomainMinimumsMet: boolean;
}

// ── Written Assessment ────────────────────────────────────────────────────────

export interface WrittenAssessmentResult {
  participantId: string;
  cohortId: string;
  attemptDate: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  passed: boolean;
}

// ── Certification ─────────────────────────────────────────────────────────────

export type CertificationOutcome = 'CERTIFIED' | 'CONDITIONAL' | 'FULL_RETAKE' | 'PENDING';
export type CertificationStatus = 'ACTIVE' | 'LAPSED_WARNING' | 'SUSPENDED' | 'LAPSED' | 'CANCELLED';

export interface CertificationRecord {
  id: string;
  participantId: string;
  organisationId: string;
  cohortId: string;
  writtenResult: WrittenAssessmentResult;
  deliveryResult: DeliveryAssessmentResult | null;
  outcome: CertificationOutcome;
  certificationDate: string | null;
  certificateNumber: string | null;
  renewalDueDate: string | null;
  status: CertificationStatus;
  resubmissionDeadline: string | null;
  resubmissionAttempts: number;
}

// ── Cohort Management ─────────────────────────────────────────────────────────

export interface Cohort {
  id: string;
  organisationId: string;
  masterTrainerId: string;
  scheduledDate: string;
  location: string;
  deliveryMode: DeliveryMode;
  status: CohortStatus;
  maxParticipants: number;
  enrolledParticipants: string[];
  completedParticipants: string[];
  certifiedParticipants: string[];
}

// ── Trainer Registry ──────────────────────────────────────────────────────────

export interface TrainerRecord {
  id: string;
  name: string;
  email: string;
  organisationId: string;
  certificationDate: string;
  renewalDueDate: string;
  status: CertificationStatus;
  deliveryScore: number;
  writtenScore: number;
  cohortsDelivered: number;
  lastDeliveryDate: string | null;
}
