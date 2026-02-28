// Copyright (c) 2026 Nexara DMCC. All rights reserved.

import { TrainerRecord, CertificationStatus } from './types';
import { calculateRenewalDueDate, getLapsedSeverity } from './scoring';

export class TrainerRegistry {
  private trainers = new Map<string, TrainerRecord>();

  register(
    id: string,
    name: string,
    email: string,
    organisationId: string,
    certificationDate: string,
    deliveryScore: number,
    writtenScore: number,
  ): TrainerRecord {
    if (this.trainers.has(id)) throw new Error(`Trainer ${id} is already registered`);
    if (!name.trim()) throw new Error('Trainer name cannot be empty');
    if (!email.includes('@')) throw new Error('Invalid email address');
    if (deliveryScore < 0 || deliveryScore > 100) {
      throw new Error('deliveryScore must be between 0 and 100');
    }
    if (writtenScore < 0 || writtenScore > 100) {
      throw new Error('writtenScore must be between 0 and 100');
    }

    const renewalDueDate = calculateRenewalDueDate(certificationDate);
    const trainer: TrainerRecord = {
      id,
      name,
      email,
      organisationId,
      certificationDate,
      renewalDueDate,
      status: 'ACTIVE',
      deliveryScore,
      writtenScore,
      cohortsDelivered: 0,
      lastDeliveryDate: null,
    };
    this.trainers.set(id, trainer);
    return trainer;
  }

  get(id: string): TrainerRecord {
    const t = this.trainers.get(id);
    if (!t) throw new Error(`Trainer ${id} not found`);
    return t;
  }

  getByOrganisation(organisationId: string): TrainerRecord[] {
    return Array.from(this.trainers.values()).filter((t) => t.organisationId === organisationId);
  }

  getActive(): TrainerRecord[] {
    return Array.from(this.trainers.values()).filter((t) => t.status === 'ACTIVE');
  }

  getByStatus(status: CertificationStatus): TrainerRecord[] {
    return Array.from(this.trainers.values()).filter((t) => t.status === status);
  }

  recordDelivery(trainerId: string, deliveryDate: string): void {
    const t = this.get(trainerId);
    t.cohortsDelivered += 1;
    t.lastDeliveryDate = deliveryDate;
  }

  refreshStatus(trainerId: string, today: string): CertificationStatus {
    const t = this.get(trainerId);
    const severity = getLapsedSeverity(t.certificationDate, today);
    if (!severity) {
      t.status = 'ACTIVE';
    } else if (severity === 'WARNING') {
      t.status = 'LAPSED_WARNING';
    } else if (severity === 'SUSPENDED') {
      t.status = 'SUSPENDED';
    } else if (severity === 'LAPSED') {
      t.status = 'LAPSED';
    } else {
      t.status = 'CANCELLED';
    }
    return t.status;
  }

  renew(trainerId: string, renewalDate: string): void {
    const t = this.get(trainerId);
    if (t.status === 'CANCELLED') {
      throw new Error(`Cannot renew trainer ${trainerId} — CANCELLED status requires full re-certification`);
    }
    t.certificationDate = renewalDate;
    t.renewalDueDate = calculateRenewalDueDate(renewalDate);
    t.status = 'ACTIVE';
  }

  updateScores(trainerId: string, deliveryScore: number, writtenScore: number): void {
    const t = this.get(trainerId);
    if (deliveryScore < 0 || deliveryScore > 100) {
      throw new Error('deliveryScore must be between 0 and 100');
    }
    if (writtenScore < 0 || writtenScore > 100) {
      throw new Error('writtenScore must be between 0 and 100');
    }
    t.deliveryScore = deliveryScore;
    t.writtenScore = writtenScore;
  }

  count(): number {
    return this.trainers.size;
  }

  all(): TrainerRecord[] {
    return Array.from(this.trainers.values());
  }
}
