// Copyright (c) 2026 Nexara DMCC. All rights reserved.

import { Programme, ProgrammeSession, SessionType, ProgrammeDay, DeliveryMode } from './types';

export const T3_PROGRAMME_ID = 'NEXARA-T3-V1';
export const T3_PROGRAMME_NAME = 'Nexara Train-the-Trainer Programme';
export const T3_PROGRAMME_VERSION = '1.0.0';
export const T3_CPD_HOURS = 14;
export const T3_MAX_PARTICIPANTS = 8;
export const T3_MIN_PARTICIPANTS = 2;
export const T3_DAYS = 2;

export function createDefaultProgramme(): Programme {
  const sessions: ProgrammeSession[] = [
    // ── Day 1 ─────────────────────────────────────────────────────────────────
    {
      id: 'd1-s1',
      day: 'DAY_1',
      startTime: '08:30',
      endTime: '09:00',
      title: 'Welcome, Introductions & Day Objectives',
      type: 'OPENING',
      durationMinutes: 30,
      isCPDEligible: true,
    },
    {
      id: 'd1-s2',
      day: 'DAY_1',
      startTime: '09:00',
      endTime: '10:30',
      title: 'Adult Learning Theory & Compliance Training Psychology',
      type: 'MODULE',
      durationMinutes: 90,
      isCPDEligible: true,
    },
    {
      id: 'd1-s3',
      day: 'DAY_1',
      startTime: '10:30',
      endTime: '10:45',
      title: 'Morning Break',
      type: 'BREAK',
      durationMinutes: 15,
      isCPDEligible: false,
    },
    {
      id: 'd1-s4',
      day: 'DAY_1',
      startTime: '10:45',
      endTime: '12:15',
      title: 'Facilitation Skills',
      type: 'MODULE',
      durationMinutes: 90,
      isCPDEligible: true,
    },
    {
      id: 'd1-s5',
      day: 'DAY_1',
      startTime: '12:15',
      endTime: '13:00',
      title: 'Lunch',
      type: 'BREAK',
      durationMinutes: 45,
      isCPDEligible: false,
    },
    {
      id: 'd1-s6',
      day: 'DAY_1',
      startTime: '13:00',
      endTime: '14:15',
      title: 'The Nexara Curriculum',
      type: 'MODULE',
      durationMinutes: 75,
      isCPDEligible: true,
    },
    {
      id: 'd1-s7',
      day: 'DAY_1',
      startTime: '14:15',
      endTime: '14:30',
      title: 'Afternoon Break',
      type: 'BREAK',
      durationMinutes: 15,
      isCPDEligible: false,
    },
    {
      id: 'd1-s8',
      day: 'DAY_1',
      startTime: '14:30',
      endTime: '15:45',
      title: 'Lab: Micro-Teaching Practice',
      type: 'LAB',
      durationMinutes: 75,
      isCPDEligible: true,
    },
    {
      id: 'd1-s9',
      day: 'DAY_1',
      startTime: '15:45',
      endTime: '16:30',
      title: 'Debrief & Curriculum Q&A',
      type: 'DEBRIEF',
      durationMinutes: 45,
      isCPDEligible: true,
    },
    {
      id: 'd1-s10',
      day: 'DAY_1',
      startTime: '16:30',
      endTime: '17:00',
      title: 'Day 1 Formative Check & Day 2 Briefing',
      type: 'ASSESSMENT',
      durationMinutes: 30,
      isCPDEligible: true,
    },
    // ── Day 2 ─────────────────────────────────────────────────────────────────
    {
      id: 'd2-s1',
      day: 'DAY_2',
      startTime: '08:30',
      endTime: '09:00',
      title: 'Recap & Day 2 Overview',
      type: 'OPENING',
      durationMinutes: 30,
      isCPDEligible: true,
    },
    {
      id: 'd2-s2',
      day: 'DAY_2',
      startTime: '09:00',
      endTime: '10:30',
      title: 'Assessment Delivery',
      type: 'MODULE',
      durationMinutes: 90,
      isCPDEligible: true,
    },
    {
      id: 'd2-s3',
      day: 'DAY_2',
      startTime: '10:30',
      endTime: '10:45',
      title: 'Morning Break',
      type: 'BREAK',
      durationMinutes: 15,
      isCPDEligible: false,
    },
    {
      id: 'd2-s4',
      day: 'DAY_2',
      startTime: '10:45',
      endTime: '12:15',
      title: 'Programme Management',
      type: 'MODULE',
      durationMinutes: 90,
      isCPDEligible: true,
    },
    {
      id: 'd2-s5',
      day: 'DAY_2',
      startTime: '12:15',
      endTime: '13:00',
      title: 'Lunch',
      type: 'BREAK',
      durationMinutes: 45,
      isCPDEligible: false,
    },
    {
      id: 'd2-s6',
      day: 'DAY_2',
      startTime: '13:00',
      endTime: '15:00',
      title: 'Assessed Delivery: 20-min Observed Segment per Participant',
      type: 'LAB',
      durationMinutes: 120,
      isCPDEligible: true,
    },
    {
      id: 'd2-s7',
      day: 'DAY_2',
      startTime: '15:00',
      endTime: '15:15',
      title: 'Break',
      type: 'BREAK',
      durationMinutes: 15,
      isCPDEligible: false,
    },
    {
      id: 'd2-s8',
      day: 'DAY_2',
      startTime: '15:15',
      endTime: '15:45',
      title: 'Written Assessment: 20 MCQ',
      type: 'ASSESSMENT',
      durationMinutes: 30,
      isCPDEligible: true,
    },
    {
      id: 'd2-s9',
      day: 'DAY_2',
      startTime: '15:45',
      endTime: '16:30',
      title: 'Individual Debrief with Observer Results',
      type: 'DEBRIEF',
      durationMinutes: 45,
      isCPDEligible: true,
    },
    {
      id: 'd2-s10',
      day: 'DAY_2',
      startTime: '16:30',
      endTime: '17:00',
      title: 'Certificate Ceremony & Resubmission Briefing',
      type: 'CEREMONY',
      durationMinutes: 30,
      isCPDEligible: true,
    },
  ];

  return {
    id: T3_PROGRAMME_ID,
    name: T3_PROGRAMME_NAME,
    version: T3_PROGRAMME_VERSION,
    cpdHours: T3_CPD_HOURS,
    maxParticipants: T3_MAX_PARTICIPANTS,
    minParticipants: T3_MIN_PARTICIPANTS,
    days: T3_DAYS,
    deliveryModes: ['IN_PERSON', 'VIRTUAL', 'HYBRID'],
    prerequisite:
      'Nexara Administrator certification OR written approval from Nexara Training Director',
    sessions,
  };
}

export function getSessionsByDay(programme: Programme, day: ProgrammeDay): ProgrammeSession[] {
  return programme.sessions.filter((s) => s.day === day);
}

export function getSessionsByType(programme: Programme, type: SessionType): ProgrammeSession[] {
  return programme.sessions.filter((s) => s.type === type);
}

export function getCPDEligibleSessions(programme: Programme): ProgrammeSession[] {
  return programme.sessions.filter((s) => s.isCPDEligible);
}

export function calculateCPDMinutes(programme: Programme): number {
  return getCPDEligibleSessions(programme).reduce((sum, s) => sum + s.durationMinutes, 0);
}

export function totalSessionDuration(programme: Programme, day?: ProgrammeDay): number {
  const sessions = day ? getSessionsByDay(programme, day) : programme.sessions;
  return sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
}

export function supportsDeliveryMode(programme: Programme, mode: DeliveryMode): boolean {
  return programme.deliveryModes.includes(mode);
}

export function validateProgramme(programme: Programme): string[] {
  const errors: string[] = [];

  if (programme.maxParticipants > T3_MAX_PARTICIPANTS) {
    errors.push(`T3 maxParticipants cannot exceed ${T3_MAX_PARTICIPANTS}`);
  }
  if (programme.minParticipants < T3_MIN_PARTICIPANTS) {
    errors.push(`T3 minParticipants must be at least ${T3_MIN_PARTICIPANTS}`);
  }
  if (programme.minParticipants > programme.maxParticipants) {
    errors.push('minParticipants cannot exceed maxParticipants');
  }
  if (programme.days !== T3_DAYS) {
    errors.push(`T3 programme must be ${T3_DAYS} days`);
  }

  const cpdMinutes = calculateCPDMinutes(programme);
  const cpdHours = cpdMinutes / 60;
  if (Math.abs(cpdHours - programme.cpdHours) > 0.5) {
    errors.push(
      `CPD hours mismatch: declared ${programme.cpdHours} but sessions total ${cpdHours.toFixed(1)}`,
    );
  }

  const day1Sessions = getSessionsByDay(programme, 'DAY_1');
  const day2Sessions = getSessionsByDay(programme, 'DAY_2');
  if (day1Sessions.length === 0) errors.push('No sessions scheduled for Day 1');
  if (day2Sessions.length === 0) errors.push('No sessions scheduled for Day 2');

  const hasDay2Assessment = getSessionsByType(programme, 'ASSESSMENT').some(
    (s) => s.day === 'DAY_2',
  );
  if (!hasDay2Assessment) {
    errors.push('No written assessment session found on Day 2');
  }

  const hasDay2Lab = getSessionsByType(programme, 'LAB').some((s) => s.day === 'DAY_2');
  if (!hasDay2Lab) {
    errors.push('No assessed delivery (LAB) session found on Day 2');
  }

  return errors;
}
