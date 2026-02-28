// Copyright (c) 2026 Nexara DMCC. All rights reserved.

import { Cohort, CohortStatus, DeliveryMode } from './types';

export const T3_MAX_PARTICIPANTS = 8;
export const T3_MIN_PARTICIPANTS = 2;

export class CohortManager {
  private cohorts = new Map<string, Cohort>();

  create(
    id: string,
    organisationId: string,
    masterTrainerId: string,
    scheduledDate: string,
    location: string,
    deliveryMode: DeliveryMode,
    maxParticipants: number = T3_MAX_PARTICIPANTS,
  ): Cohort {
    if (this.cohorts.has(id)) throw new Error(`Cohort ${id} already exists`);
    if (maxParticipants < 1) throw new Error('maxParticipants must be at least 1');
    if (maxParticipants > T3_MAX_PARTICIPANTS) {
      throw new Error(`maxParticipants cannot exceed ${T3_MAX_PARTICIPANTS}`);
    }
    const cohort: Cohort = {
      id,
      organisationId,
      masterTrainerId,
      scheduledDate,
      location,
      deliveryMode,
      status: 'PLANNED',
      maxParticipants,
      enrolledParticipants: [],
      completedParticipants: [],
      certifiedParticipants: [],
    };
    this.cohorts.set(id, cohort);
    return cohort;
  }

  get(id: string): Cohort {
    const c = this.cohorts.get(id);
    if (!c) throw new Error(`Cohort ${id} not found`);
    return c;
  }

  enrol(cohortId: string, participantId: string): void {
    const c = this.get(cohortId);
    if (c.status !== 'PLANNED' && c.status !== 'IN_PROGRESS') {
      throw new Error(`Cannot enrol into cohort with status ${c.status}`);
    }
    if (c.enrolledParticipants.length >= c.maxParticipants) {
      throw new Error(`Cohort ${cohortId} is at capacity`);
    }
    if (c.enrolledParticipants.includes(participantId)) {
      throw new Error(`Participant ${participantId} is already enrolled in cohort ${cohortId}`);
    }
    c.enrolledParticipants.push(participantId);
  }

  start(cohortId: string): void {
    const c = this.get(cohortId);
    if (c.status !== 'PLANNED') {
      throw new Error(`Cohort must be PLANNED to start (current: ${c.status})`);
    }
    if (c.enrolledParticipants.length < T3_MIN_PARTICIPANTS) {
      throw new Error(`Minimum ${T3_MIN_PARTICIPANTS} participants required to start cohort`);
    }
    c.status = 'IN_PROGRESS';
  }

  completeParticipant(cohortId: string, participantId: string): void {
    const c = this.get(cohortId);
    if (c.status !== 'IN_PROGRESS') {
      throw new Error(`Cohort must be IN_PROGRESS to mark participant complete`);
    }
    if (!c.enrolledParticipants.includes(participantId)) {
      throw new Error(`Participant ${participantId} is not enrolled in cohort ${cohortId}`);
    }
    if (!c.completedParticipants.includes(participantId)) {
      c.completedParticipants.push(participantId);
    }
  }

  certifyParticipant(cohortId: string, participantId: string): void {
    const c = this.get(cohortId);
    if (!c.enrolledParticipants.includes(participantId)) {
      throw new Error(`Participant ${participantId} is not enrolled in cohort ${cohortId}`);
    }
    if (!c.completedParticipants.includes(participantId)) {
      throw new Error(`Participant ${participantId} must complete cohort before certification`);
    }
    if (!c.certifiedParticipants.includes(participantId)) {
      c.certifiedParticipants.push(participantId);
    }
  }

  close(cohortId: string): void {
    const c = this.get(cohortId);
    if (c.status !== 'IN_PROGRESS') {
      throw new Error(`Cohort must be IN_PROGRESS to close (current: ${c.status})`);
    }
    c.status = 'COMPLETED';
  }

  cancel(cohortId: string): void {
    const c = this.get(cohortId);
    if (c.status === 'COMPLETED') {
      throw new Error(`Cannot cancel a completed cohort`);
    }
    c.status = 'CANCELLED';
  }

  availableCapacity(cohortId: string): number {
    const c = this.get(cohortId);
    return c.maxParticipants - c.enrolledParticipants.length;
  }

  isFull(cohortId: string): boolean {
    return this.availableCapacity(cohortId) === 0;
  }

  completionRate(cohortId: string): number {
    const c = this.get(cohortId);
    if (c.enrolledParticipants.length === 0) return 0;
    return Math.round((c.completedParticipants.length / c.enrolledParticipants.length) * 100);
  }

  certificationRate(cohortId: string): number {
    const c = this.get(cohortId);
    if (c.completedParticipants.length === 0) return 0;
    return Math.round((c.certifiedParticipants.length / c.completedParticipants.length) * 100);
  }

  getByStatus(status: CohortStatus): Cohort[] {
    return Array.from(this.cohorts.values()).filter((c) => c.status === status);
  }

  getByOrganisation(organisationId: string): Cohort[] {
    return Array.from(this.cohorts.values()).filter((c) => c.organisationId === organisationId);
  }

  getByMasterTrainer(masterTrainerId: string): Cohort[] {
    return Array.from(this.cohorts.values()).filter((c) => c.masterTrainerId === masterTrainerId);
  }

  count(): number {
    return this.cohorts.size;
  }

  all(): Cohort[] {
    return Array.from(this.cohorts.values());
  }
}
