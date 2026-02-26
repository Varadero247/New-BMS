// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { createLogger } from '@ims/monitoring';

const logger = createLogger('emergency-notifications');

export interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  recipientRoles?: string[];
  premisesId?: string;
}

export function notifyEmergencyDeclared(
  incidentNumber: string,
  emergencyType: string,
  severity: string,
  premisesName?: string
): void {
  const payload: NotificationPayload = {
    type: 'EMERGENCY_DECLARED',
    title: `Emergency Declared: ${incidentNumber}`,
    message: `${emergencyType} emergency (${severity}) declared${premisesName ? ` at ${premisesName}` : ''}. Respond immediately.`,
    severity: 'critical',
    recipientRoles: [
      'FIRE_WARDEN',
      'INCIDENT_COMMANDER',
      'HEALTH_SAFETY_MANAGER',
      'SENIOR_MANAGEMENT',
    ],
  };
  logger.info('Emergency notification triggered', { payload });
}

export function notifyIncidentStatusChange(incidentNumber: string, newStatus: string): void {
  logger.info('Incident status change notification', { incidentNumber, newStatus });
}

export function notifyFraOverdue(referenceNumber: string, premisesName: string): void {
  logger.info('FRA overdue notification', { referenceNumber, premisesName });
}

export function notifyWardenTrainingExpiring(wardenName: string, expiryDate: Date): void {
  logger.info('Warden training expiry notification', { wardenName, expiryDate });
}

export function notifyEquipmentServiceDue(equipmentType: string, location: string): void {
  logger.info('Equipment service due notification', { equipmentType, location });
}

export function notifyDrillOverdue(premisesName: string): void {
  logger.info('Drill overdue notification', { premisesName });
}

export function notifyPeepReviewDue(personName: string, reviewDate: Date): void {
  logger.info('PEEP review due notification', { personName, reviewDate });
}

export function notifyBcpNotTested(planReference: string, title: string): void {
  logger.info('BCP not tested notification', { planReference, title });
}
