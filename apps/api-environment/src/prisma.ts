// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import {
  PrismaClient,
  Prisma,
  EnvActionType,
  EnvPriority,
  EnvActionSource,
  EnvVerificationMethod,
  EnvEffectiveness,
  EnvActivityCategory,
  EnvImpactDirection,
  EnvScale,
  EnvControlHierarchy,
  EnvReviewFrequency,
  EnvCapaType,
  EnvCapaTrigger,
  EnvRCAMethod,
  EnvRootCauseCategory,
  EnvEventType,
  EnvEventSeverity,
  EnvReputationalImpact,
  EnvObligationType,
  EnvJurisdiction,
  EnvObjectiveCategory,
  EnvAssessmentMethod,
  EnvReportingFrequency,
  EnvAuditType,
  EnvCapaSeverity,
  EsgCategory,
} from '@ims/database/environment';
export {
  Prisma,
  EnvActionType,
  EnvPriority,
  EnvActionSource,
  EnvVerificationMethod,
  EnvEffectiveness,
  EnvActivityCategory,
  EnvImpactDirection,
  EnvScale,
  EnvControlHierarchy,
  EnvReviewFrequency,
  EnvCapaType,
  EnvCapaTrigger,
  EnvRCAMethod,
  EnvRootCauseCategory,
  EnvEventType,
  EnvEventSeverity,
  EnvReputationalImpact,
  EnvObligationType,
  EnvJurisdiction,
  EnvObjectiveCategory,
  EnvAssessmentMethod,
  EnvReportingFrequency,
  EnvAuditType,
  EnvCapaSeverity,
  EsgCategory,
};

declare global {
  // eslint-disable-next-line no-var
  var envPrisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma: InstanceType<typeof PrismaClient> =
  global.envPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.envPrisma = prisma;
}
