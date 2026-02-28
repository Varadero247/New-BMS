// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export * from './types';
export * from './scoring';
export { CohortManager, T3_MAX_PARTICIPANTS, T3_MIN_PARTICIPANTS } from './cohort-manager';
export { TrainerRegistry } from './trainer-registry';
export {
  createDefaultProgramme,
  getSessionsByDay,
  getSessionsByType,
  getCPDEligibleSessions,
  calculateCPDMinutes,
  totalSessionDuration,
  supportsDeliveryMode,
  validateProgramme,
  T3_PROGRAMME_ID,
  T3_PROGRAMME_NAME,
  T3_PROGRAMME_VERSION,
  T3_CPD_HOURS,
  T3_DAYS,
} from './programme-registry';
