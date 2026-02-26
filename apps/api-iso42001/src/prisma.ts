// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import {
  PrismaClient,
  Prisma,
  AiSystemCategory,
  AiSystemRiskTier,
  AiSystemStatus,
  AiRiskCategory,
  AiRiskLikelihood,
  AiRiskImpact,
  AiRiskStatus,
  AiPolicyStatus,
  AiIncidentSeverity,
  AiIncidentStatus,
  AiControlStatus,
  AiImpactLevel,
  AiImpactAssessmentStatus,
  AiSelfDeclarationStatus,
  AiAuditAction,
  HumanReviewStatus,
  AiMonitoringStatus,
  AiMonitoringMetricType,
} from '@ims/database/iso42001';
export {
  Prisma,
  AiSystemCategory,
  AiSystemRiskTier,
  AiSystemStatus,
  AiRiskCategory,
  AiRiskLikelihood,
  AiRiskImpact,
  AiRiskStatus,
  AiPolicyStatus,
  AiIncidentSeverity,
  AiIncidentStatus,
  AiControlStatus,
  AiImpactLevel,
  AiImpactAssessmentStatus,
  AiSelfDeclarationStatus,
  AiAuditAction,
  HumanReviewStatus,
  AiMonitoringStatus,
  AiMonitoringMetricType,
};

declare global {
  // eslint-disable-next-line no-var
  var iso42001Prisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma =
  global.iso42001Prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.iso42001Prisma = prisma;
}
