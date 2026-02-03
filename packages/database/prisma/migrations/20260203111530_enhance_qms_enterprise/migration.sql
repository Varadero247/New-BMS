-- CreateEnum
CREATE TYPE "QMSDocumentType" AS ENUM ('POLICY', 'PROCEDURE', 'WORK_INSTRUCTION', 'FORM', 'RECORD', 'MANUAL', 'PLAN', 'SPECIFICATION', 'DRAWING', 'STANDARD', 'GUIDELINE', 'TEMPLATE', 'REPORT', 'CERTIFICATE', 'CONTRACT', 'OTHER');

-- CreateEnum
CREATE TYPE "QMSDocumentStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'EFFECTIVE', 'OBSOLETE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QMSDocumentVersionStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'UNDER_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "ConfidentialityLevel" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'SECRET');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ESCALATED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ApprovalDecision" AS ENUM ('APPROVED', 'APPROVED_WITH_COMMENTS', 'REJECTED', 'RETURNED_FOR_REVISION');

-- CreateEnum
CREATE TYPE "RecipientType" AS ENUM ('USER', 'DEPARTMENT', 'ROLE', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "DistributionType" AS ENUM ('ELECTRONIC', 'PRINTED_CONTROLLED', 'PRINTED_UNCONTROLLED', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "DistributionStatus" AS ENUM ('PENDING', 'DISTRIBUTED', 'ACKNOWLEDGED', 'RECALLED');

-- CreateEnum
CREATE TYPE "DocumentAccessAction" AS ENUM ('VIEW', 'DOWNLOAD', 'PRINT', 'EDIT', 'APPROVE', 'REJECT', 'DISTRIBUTE', 'RECALL');

-- CreateEnum
CREATE TYPE "InvestigationType" AS ENUM ('INCIDENT', 'NEAR_MISS', 'QUALITY_EVENT', 'CUSTOMER_COMPLAINT', 'AUDIT_FINDING', 'REGULATORY_EVENT', 'PRODUCT_FAILURE', 'PROCESS_DEVIATION', 'ENVIRONMENTAL_EVENT', 'SAFETY_EVENT');

-- CreateEnum
CREATE TYPE "InvestigationSeverity" AS ENUM ('MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC');

-- CreateEnum
CREATE TYPE "InvestigationStatus" AS ENUM ('INITIATED', 'DATA_COLLECTION', 'ANALYSIS_IN_PROGRESS', 'ROOT_CAUSE_IDENTIFIED', 'RECOMMENDATIONS_PENDING', 'ACTIONS_ASSIGNED', 'VERIFICATION_IN_PROGRESS', 'COMPLETED', 'CLOSED', 'REOPENED');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('INITIAL_EVENT', 'CONTRIBUTING_FACTOR', 'RESPONSE_ACTION', 'ESCALATION', 'COMMUNICATION', 'EVIDENCE_COLLECTED', 'WITNESS_STATEMENT', 'SYSTEM_ALERT', 'OTHER');

-- CreateEnum
CREATE TYPE "CauseType" AS ENUM ('ROOT_CAUSE', 'CONTRIBUTING_CAUSE', 'IMMEDIATE_CAUSE', 'SYSTEMIC_CAUSE', 'DIRECT_CAUSE');

-- CreateEnum
CREATE TYPE "RCAMethod" AS ENUM ('FIVE_WHYS', 'FISHBONE', 'FAULT_TREE', 'CHANGE_ANALYSIS', 'BARRIER_ANALYSIS', 'EVENT_TREE', 'PARETO', 'FMEA');

-- CreateEnum
CREATE TYPE "FishboneCategory" AS ENUM ('MANPOWER', 'METHOD', 'MACHINE', 'MATERIAL', 'MEASUREMENT', 'ENVIRONMENT');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT', 'TRAINING', 'PROCEDURE_UPDATE', 'EQUIPMENT_CHANGE', 'PROCESS_CHANGE', 'MONITORING');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('PROPOSED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CLOSED');

-- CreateEnum
CREATE TYPE "InvestigationRole" AS ENUM ('LEAD_INVESTIGATOR', 'INVESTIGATOR', 'SUBJECT_MATTER_EXPERT', 'WITNESS', 'STAKEHOLDER', 'REVIEWER', 'APPROVER');

-- CreateEnum
CREATE TYPE "CAPAType" AS ENUM ('CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT');

-- CreateEnum
CREATE TYPE "CAPASeverity" AS ENUM ('MINOR', 'MODERATE', 'MAJOR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CAPAPhase" AS ENUM ('D1_TEAM', 'D2_PROBLEM', 'D3_CONTAINMENT', 'D4_ROOT_CAUSE', 'D5_CORRECTIVE_ACTION', 'D6_IMPLEMENTATION', 'D7_PREVENTION', 'D8_CLOSURE');

-- CreateEnum
CREATE TYPE "CAPAStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'VERIFIED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CAPATeamRole" AS ENUM ('CHAMPION', 'TEAM_LEADER', 'TEAM_MEMBER', 'PROCESS_OWNER', 'QUALITY_REP', 'SUBJECT_MATTER_EXPERT', 'MANAGEMENT_REP', 'CUSTOMER_REP');

-- CreateEnum
CREATE TYPE "ContainmentActionType" AS ENUM ('QUARANTINE', 'SORTING', 'REWORK', 'REPLACEMENT', 'CUSTOMER_NOTIFICATION', 'PRODUCTION_STOP', 'PROCESS_ADJUSTMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "RootCauseType" AS ENUM ('TECHNICAL', 'HUMAN', 'ORGANIZATIONAL', 'EXTERNAL', 'DESIGN', 'PROCESS', 'MATERIAL', 'EQUIPMENT', 'TRAINING', 'COMMUNICATION');

-- CreateEnum
CREATE TYPE "CorrectiveActionCategory" AS ENUM ('DESIGN_CHANGE', 'PROCESS_CHANGE', 'PROCEDURE_UPDATE', 'EQUIPMENT_MODIFICATION', 'TRAINING', 'SUPPLIER_CHANGE', 'INSPECTION_UPDATE', 'PREVENTIVE_MAINTENANCE', 'WORK_INSTRUCTION_UPDATE', 'OTHER');

-- CreateEnum
CREATE TYPE "ImplementationType" AS ENUM ('PROCESS_CHANGE', 'EQUIPMENT_INSTALLATION', 'TRAINING_DELIVERY', 'DOCUMENT_UPDATE', 'SYSTEM_CONFIGURATION', 'SUPPLIER_QUALIFICATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ImplementationStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'VALIDATED', 'FAILED');

-- CreateEnum
CREATE TYPE "ValidationResult" AS ENUM ('PASSED', 'PASSED_WITH_OBSERVATIONS', 'FAILED', 'INCONCLUSIVE');

-- CreateEnum
CREATE TYPE "PreventionType" AS ENUM ('FMEA_UPDATE', 'CONTROL_PLAN_UPDATE', 'PROCEDURE_REVISION', 'TRAINING_UPDATE', 'POKA_YOKE', 'SYSTEM_ENHANCEMENT', 'AUDIT_CHECKLIST_UPDATE', 'OTHER');

-- CreateEnum
CREATE TYPE "EffectivenessCheckType" AS ENUM ('INITIAL_VERIFICATION', 'THIRTY_DAY_CHECK', 'SIXTY_DAY_CHECK', 'NINETY_DAY_CHECK', 'SIX_MONTH_CHECK', 'ANNUAL_CHECK', 'CUSTOM');

-- CreateEnum
CREATE TYPE "HorizontalDeploymentType" AS ENUM ('SIMILAR_PROCESS', 'SIMILAR_PRODUCT', 'SIMILAR_EQUIPMENT', 'SAME_SUPPLIER', 'SAME_DEPARTMENT', 'SISTER_PLANT', 'CUSTOMER_NOTIFICATION');

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('IDENTIFIED', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "AuditType" AS ENUM ('INTERNAL', 'EXTERNAL', 'SUPPLIER', 'CUSTOMER', 'CERTIFICATION', 'SURVEILLANCE', 'PROCESS', 'PRODUCT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('PLANNED', 'PREPARATION', 'IN_PROGRESS', 'REPORTING', 'FINDINGS_REVIEW', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AuditRating" AS ENUM ('EXCELLENT', 'SATISFACTORY', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY', 'NOT_RATED');

-- CreateEnum
CREATE TYPE "AuditTeamRole" AS ENUM ('LEAD_AUDITOR', 'AUDITOR', 'AUDITOR_IN_TRAINING', 'TECHNICAL_EXPERT', 'OBSERVER', 'TRANSLATOR');

-- CreateEnum
CREATE TYPE "ChecklistStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "AuditFindingType" AS ENUM ('MAJOR_NC', 'MINOR_NC', 'OBSERVATION', 'OFI', 'POSITIVE');

-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('OPEN', 'RESPONSE_PENDING', 'RESPONSE_RECEIVED', 'VERIFICATION_PENDING', 'VERIFIED_CLOSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RiskCategory" AS ENUM ('STRATEGIC', 'OPERATIONAL', 'FINANCIAL', 'COMPLIANCE', 'REPUTATIONAL', 'TECHNICAL', 'MARKET', 'PROJECT', 'SUPPLY_CHAIN', 'ENVIRONMENTAL', 'SAFETY');

-- CreateEnum
CREATE TYPE "QMSRiskType" AS ENUM ('OPPORTUNITY', 'THREAT', 'BOTH');

-- CreateEnum
CREATE TYPE "QMSRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EXTREME');

-- CreateEnum
CREATE TYPE "QMSRiskStatus" AS ENUM ('IDENTIFIED', 'BEING_ASSESSED', 'ASSESSED', 'TREATMENT_PLANNED', 'TREATMENT_IN_PROGRESS', 'MONITORED', 'CLOSED', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "RiskAssessmentType" AS ENUM ('INITIAL', 'PERIODIC', 'TRIGGERED', 'POST_INCIDENT', 'POST_TREATMENT');

-- CreateEnum
CREATE TYPE "TrendDirection" AS ENUM ('IMPROVING', 'STABLE', 'DETERIORATING');

-- CreateEnum
CREATE TYPE "ControlType" AS ENUM ('PREVENTIVE', 'DETECTIVE', 'CORRECTIVE', 'DIRECTIVE');

-- CreateEnum
CREATE TYPE "ControlCategory" AS ENUM ('MANUAL', 'AUTOMATED', 'SEMI_AUTOMATED', 'IT_DEPENDENT');

-- CreateEnum
CREATE TYPE "ControlFrequency" AS ENUM ('CONTINUOUS', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'AD_HOC');

-- CreateEnum
CREATE TYPE "ControlEffectiveness" AS ENUM ('EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'MODERATE', 'WEAK', 'INEFFECTIVE');

-- CreateEnum
CREATE TYPE "ControlStatus" AS ENUM ('ACTIVE', 'UNDER_REVIEW', 'IMPROVEMENT_NEEDED', 'INACTIVE', 'PENDING_IMPLEMENTATION');

-- CreateEnum
CREATE TYPE "TreatmentStrategy" AS ENUM ('AVOID', 'REDUCE_LIKELIHOOD', 'REDUCE_IMPACT', 'TRANSFER', 'ACCEPT', 'EXPLOIT', 'ENHANCE');

-- CreateEnum
CREATE TYPE "TreatmentStatus" AS ENUM ('PROPOSED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'REJECTED', 'DEFERRED');

-- CreateEnum
CREATE TYPE "FMEAType" AS ENUM ('DFMEA', 'PFMEA', 'SFMEA', 'MFMEA');

-- CreateEnum
CREATE TYPE "FMEAStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'IMPLEMENTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "FMEAClassification" AS ENUM ('CRITICAL', 'SIGNIFICANT', 'MODERATE', 'MINOR');

-- CreateEnum
CREATE TYPE "FMEAActionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ImprovementProjectType" AS ENUM ('COST_REDUCTION', 'QUALITY_IMPROVEMENT', 'LEAD_TIME_REDUCTION', 'CAPACITY_INCREASE', 'SAFETY_IMPROVEMENT', 'CUSTOMER_SATISFACTION', 'PROCESS_OPTIMIZATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ImprovementMethodology" AS ENUM ('DMAIC', 'DMADV', 'LEAN', 'KAIZEN', 'SIX_SIGMA', 'THEORY_OF_CONSTRAINTS', 'AGILE', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectPhase" AS ENUM ('DEFINE', 'MEASURE', 'ANALYZE', 'IMPROVE', 'CONTROL', 'CLOSED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PROPOSED', 'APPROVED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "KaizenStatus" AS ENUM ('PLANNED', 'PREPARATION', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "WasteType" AS ENUM ('DEFECTS', 'OVERPRODUCTION', 'WAITING', 'NON_UTILIZED_TALENT', 'TRANSPORTATION', 'INVENTORY', 'MOTION', 'EXTRA_PROCESSING');

-- CreateEnum
CREATE TYPE "SustainabilityStatus" AS ENUM ('SUSTAINED', 'PARTIALLY_SUSTAINED', 'DECLINED', 'NOT_ASSESSED');

-- CreateEnum
CREATE TYPE "IdeaCategory" AS ENUM ('QUALITY', 'SAFETY', 'PRODUCTIVITY', 'COST_REDUCTION', 'ENVIRONMENT', 'EMPLOYEE_SATISFACTION', 'CUSTOMER_SATISFACTION', 'OTHER');

-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'IMPLEMENTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "StandardWorkStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'REVISION_NEEDED', 'OBSOLETE');

-- CreateEnum
CREATE TYPE "VSMStatus" AS ENUM ('CURRENT_STATE', 'FUTURE_STATE_DESIGN', 'IMPLEMENTATION', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TrainingCategory" AS ENUM ('ONBOARDING', 'QUALITY_SYSTEM', 'SAFETY', 'TECHNICAL', 'COMPLIANCE', 'MANAGEMENT', 'SOFT_SKILLS', 'CERTIFICATION', 'REFRESHER');

-- CreateEnum
CREATE TYPE "TrainingType" AS ENUM ('REQUIRED', 'RECOMMENDED', 'OPTIONAL', 'JOB_SPECIFIC', 'DEVELOPMENT');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('CLASSROOM', 'ONLINE', 'BLENDED', 'ON_THE_JOB', 'SELF_PACED', 'VIRTUAL_INSTRUCTOR_LED');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'ACTIVE', 'SUSPENDED', 'RETIRED');

-- CreateEnum
CREATE TYPE "TrainingTargetType" AS ENUM ('ROLE', 'DEPARTMENT', 'USER', 'ALL_EMPLOYEES', 'NEW_HIRES');

-- CreateEnum
CREATE TYPE "TrainingPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "QMSTrainingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PASSED', 'FAILED', 'EXPIRED', 'WAIVED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'OPEN_FOR_ENROLLMENT', 'FULL', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "MatrixStatus" AS ENUM ('DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SupplierQualificationType" AS ENUM ('INITIAL', 'REQUALIFICATION', 'SCOPE_EXTENSION', 'CHANGE_ASSESSMENT');

-- CreateEnum
CREATE TYPE "QualificationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'APPROVED', 'CONDITIONALLY_APPROVED', 'REJECTED', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ScorecardPeriod" AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL');

-- CreateEnum
CREATE TYPE "SupplierRating" AS ENUM ('PREFERRED', 'APPROVED', 'CONDITIONAL', 'PROBATION', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "SupplierAuditType" AS ENUM ('INITIAL', 'SURVEILLANCE', 'REQUALIFICATION', 'PROCESS', 'PRODUCT', 'SPECIAL');

-- CreateEnum
CREATE TYPE "SupplierAuditStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'POSTPONED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PPAPLevel" AS ENUM ('LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5');

-- CreateEnum
CREATE TYPE "PPAPReason" AS ENUM ('NEW_PART', 'ENGINEERING_CHANGE', 'TOOLING_CHANGE', 'PROCESS_CHANGE', 'LOCATION_CHANGE', 'SUBCONTRACTOR_CHANGE', 'REQUALIFICATION');

-- CreateEnum
CREATE TYPE "PPAPStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'INTERIM_APPROVED', 'REJECTED', 'PENDING_RESUBMIT');

-- CreateEnum
CREATE TYPE "SupplierIssueType" AS ENUM ('QUALITY_DEFECT', 'DIMENSIONAL', 'MATERIAL', 'COSMETIC', 'DOCUMENTATION', 'PACKAGING', 'CONTAMINATION', 'WRONG_PART', 'SHORT_SHIPMENT', 'LATE_DELIVERY');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('MINOR', 'MODERATE', 'MAJOR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SupplierNCRStatus" AS ENUM ('OPEN', 'AWAITING_RESPONSE', 'RESPONSE_RECEIVED', 'UNDER_REVIEW', 'PENDING_VERIFICATION', 'CLOSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('PRODUCT', 'PROCESS', 'DOCUMENT', 'SYSTEM', 'SUPPLIER', 'EQUIPMENT', 'MATERIAL', 'ORGANIZATIONAL');

-- CreateEnum
CREATE TYPE "ChangeCategory" AS ENUM ('DESIGN', 'MANUFACTURING', 'QUALITY', 'SAFETY', 'REGULATORY', 'CUSTOMER_DRIVEN', 'COST_REDUCTION', 'IMPROVEMENT');

-- CreateEnum
CREATE TYPE "ChangePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "ChangeStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'IMPACT_ASSESSMENT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'IN_IMPLEMENTATION', 'VERIFICATION', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ImpactArea" AS ENUM ('QUALITY', 'SAFETY', 'REGULATORY', 'FINANCIAL', 'OPERATIONAL', 'CUSTOMER', 'SUPPLY_CHAIN', 'DOCUMENTATION', 'TRAINING', 'EQUIPMENT', 'PERSONNEL');

-- CreateEnum
CREATE TYPE "ImpactSeverity" AS ENUM ('NEGLIGIBLE', 'MINOR', 'MODERATE', 'MAJOR', 'CRITICAL');

-- CreateTable
CREATE TABLE "qms_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documentNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "documentType" "QMSDocumentType" NOT NULL,
    "category" TEXT,
    "isoClause" TEXT,
    "standard" "ISOStandard",
    "ownerId" TEXT,
    "departmentId" TEXT,
    "status" "QMSDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "effectiveDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "retentionPeriod" INTEGER,
    "reviewFrequency" INTEGER,
    "nextReviewDate" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),
    "confidentiality" "ConfidentialityLevel" NOT NULL DEFAULT 'INTERNAL',
    "accessRoles" JSONB,
    "currentVersionId" UUID,
    "keywords" TEXT[],
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "qms_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qms_document_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documentId" UUID NOT NULL,
    "versionNumber" TEXT NOT NULL,
    "majorVersion" INTEGER NOT NULL DEFAULT 1,
    "minorVersion" INTEGER NOT NULL DEFAULT 0,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "fileType" TEXT,
    "content" TEXT,
    "changeReason" TEXT,
    "changeSummary" TEXT,
    "status" "QMSDocumentVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "digitalSignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "qms_document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qms_document_approvals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documentId" UUID NOT NULL,
    "versionNumber" TEXT,
    "approvalLevel" INTEGER NOT NULL DEFAULT 1,
    "approverId" TEXT NOT NULL,
    "approverRole" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "decision" "ApprovalDecision",
    "comments" TEXT,
    "digitalSignature" TEXT,
    "signedAt" TIMESTAMP(3),
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),

    CONSTRAINT "qms_document_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qms_document_distributions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documentId" UUID NOT NULL,
    "recipientId" TEXT NOT NULL,
    "recipientType" "RecipientType" NOT NULL DEFAULT 'USER',
    "copyNumber" TEXT,
    "distributionType" "DistributionType" NOT NULL DEFAULT 'ELECTRONIC',
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgementRequired" BOOLEAN NOT NULL DEFAULT true,
    "status" "DistributionStatus" NOT NULL DEFAULT 'PENDING',
    "distributedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recalledAt" TIMESTAMP(3),

    CONSTRAINT "qms_document_distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qms_document_access_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documentId" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "DocumentAccessAction" NOT NULL,
    "versionNumber" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qms_document_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referenceNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "investigationType" "InvestigationType" NOT NULL,
    "category" TEXT,
    "severity" "InvestigationSeverity" NOT NULL DEFAULT 'MINOR',
    "sourceType" TEXT,
    "sourceId" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventLocation" TEXT,
    "reportedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "impactDescription" TEXT,
    "financialImpact" DOUBLE PRECISION,
    "productionImpact" TEXT,
    "customerImpact" TEXT,
    "regulatoryImpact" TEXT,
    "leadInvestigatorId" TEXT,
    "status" "InvestigationStatus" NOT NULL DEFAULT 'INITIATED',
    "targetCompletionDate" TIMESTAMP(3),
    "actualCompletionDate" TIMESTAMP(3),
    "rootCauseSummary" TEXT,
    "conclusion" TEXT,
    "lessonsLearned" TEXT,
    "evidence" JSONB,
    "attachments" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "investigations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigation_timelines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "investigationId" UUID NOT NULL,
    "eventDateTime" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "eventType" "TimelineEventType" NOT NULL,
    "evidence" JSONB,
    "witnesses" TEXT[],
    "source" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "sequenceOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "investigation_timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigation_causes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "investigationId" UUID NOT NULL,
    "causeType" "CauseType" NOT NULL,
    "category" TEXT,
    "description" TEXT NOT NULL,
    "analysisMethod" "RCAMethod",
    "whyLevel" INTEGER,
    "parentCauseId" UUID,
    "fishboneCategory" "FishboneCategory",
    "evidence" JSONB,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "contributionFactor" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "investigation_causes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigation_recommendations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "investigationId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "recommendationType" "RecommendationType" NOT NULL,
    "priority" "ActionPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignedToId" TEXT,
    "department" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "status" "RecommendationStatus" NOT NULL DEFAULT 'PROPOSED',
    "actionId" TEXT,
    "verificationMethod" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "effectivenessRating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "investigation_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigation_team_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "investigationId" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "InvestigationRole" NOT NULL,
    "responsibilities" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "investigation_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referenceNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "capaType" "CAPAType" NOT NULL DEFAULT 'CORRECTIVE',
    "severity" "CAPASeverity" NOT NULL DEFAULT 'MINOR',
    "category" TEXT,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "currentPhase" "CAPAPhase" NOT NULL DEFAULT 'D1_TEAM',
    "phaseHistory" JSONB,
    "initiatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetClosureDate" TIMESTAMP(3),
    "actualClosureDate" TIMESTAMP(3),
    "status" "CAPAStatus" NOT NULL DEFAULT 'OPEN',
    "effectivenessVerified" BOOLEAN NOT NULL DEFAULT false,
    "effectivenessScore" INTEGER,
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "costAvoidance" DOUBLE PRECISION,
    "metadata" JSONB,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "closedById" TEXT,

    CONSTRAINT "capas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capa_team_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "capaId" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CAPATeamRole" NOT NULL,
    "department" TEXT,
    "responsibilities" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "capa_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capa_problem_statements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "capaId" UUID NOT NULL,
    "what" TEXT NOT NULL,
    "when" TEXT,
    "whereLocation" TEXT,
    "who" TEXT,
    "why" TEXT,
    "howDiscovered" TEXT,
    "howMany" TEXT,
    "defectsCount" INTEGER,
    "unitsAffected" INTEGER,
    "customerAffected" TEXT,
    "financialImpact" DOUBLE PRECISION,
    "problemSummary" TEXT,
    "isIsNotAnalysis" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "capa_problem_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capa_containment_actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "capaId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "actionType" "ContainmentActionType" NOT NULL,
    "assignedToId" TEXT,
    "plannedDate" TIMESTAMP(3),
    "implementedDate" TIMESTAMP(3),
    "status" "ActionStatus" NOT NULL DEFAULT 'OPEN',
    "verificationMethod" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "isEffective" BOOLEAN,
    "evidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "capa_containment_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capa_root_causes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "capaId" UUID NOT NULL,
    "causeDescription" TEXT NOT NULL,
    "causeType" "RootCauseType" NOT NULL,
    "causeCategory" TEXT,
    "analysisMethod" "RCAMethod" NOT NULL,
    "fiveWhysData" JSONB,
    "fishboneData" JSONB,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationMethod" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "evidence" JSONB,
    "contributionPercent" DOUBLE PRECISION,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "capa_root_causes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capa_corrective_actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "capaId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "actionCategory" "CorrectiveActionCategory" NOT NULL,
    "rootCauseId" UUID,
    "assignedToId" TEXT,
    "department" TEXT,
    "plannedStartDate" TIMESTAMP(3),
    "plannedEndDate" TIMESTAMP(3),
    "actualStartDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "status" "ActionStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "ActionPriority" NOT NULL DEFAULT 'MEDIUM',
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "resourcesRequired" TEXT,
    "evidence" JSONB,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "capa_corrective_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capa_implementations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "capaId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "implementationType" "ImplementationType" NOT NULL,
    "correctiveActionId" UUID,
    "implementedById" TEXT,
    "implementedAt" TIMESTAMP(3),
    "validationMethod" TEXT,
    "validationCriteria" TEXT,
    "validatedById" TEXT,
    "validatedAt" TIMESTAMP(3),
    "validationResult" "ValidationResult",
    "validationNotes" TEXT,
    "status" "ImplementationStatus" NOT NULL DEFAULT 'PLANNED',
    "beforeData" JSONB,
    "afterData" JSONB,
    "evidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "capa_implementations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capa_prevention_actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "capaId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "preventionType" "PreventionType" NOT NULL,
    "affectedDocuments" TEXT[],
    "affectedProcesses" TEXT[],
    "trainingRequired" BOOLEAN NOT NULL DEFAULT false,
    "assignedToId" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "status" "ActionStatus" NOT NULL DEFAULT 'OPEN',
    "verificationMethod" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "evidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "capa_prevention_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capa_effectiveness_checks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "capaId" UUID NOT NULL,
    "checkNumber" INTEGER NOT NULL,
    "checkType" "EffectivenessCheckType" NOT NULL,
    "plannedDate" TIMESTAMP(3) NOT NULL,
    "actualDate" TIMESTAMP(3),
    "beforeMetric" TEXT,
    "beforeValue" DOUBLE PRECISION,
    "afterMetric" TEXT,
    "afterValue" DOUBLE PRECISION,
    "targetValue" DOUBLE PRECISION,
    "isEffective" BOOLEAN,
    "effectivenessScore" INTEGER,
    "findings" TEXT,
    "verifiedById" TEXT,
    "verificationMethod" TEXT,
    "evidence" JSONB,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "capa_effectiveness_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capa_horizontal_deployments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "capaId" UUID NOT NULL,
    "targetArea" TEXT NOT NULL,
    "targetType" "HorizontalDeploymentType" NOT NULL,
    "description" TEXT NOT NULL,
    "rationale" TEXT,
    "assignedToId" TEXT,
    "plannedDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "status" "DeploymentStatus" NOT NULL DEFAULT 'IDENTIFIED',
    "deployed" BOOLEAN NOT NULL DEFAULT false,
    "deploymentNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "capa_horizontal_deployments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qms_audits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auditNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "auditType" "AuditType" NOT NULL,
    "auditScope" TEXT,
    "standard" "ISOStandard",
    "clauses" TEXT[],
    "plannedStartDate" TIMESTAMP(3) NOT NULL,
    "plannedEndDate" TIMESTAMP(3) NOT NULL,
    "actualStartDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "auditeeDepartment" TEXT,
    "auditeeLocation" TEXT,
    "auditeeContact" TEXT,
    "status" "AuditStatus" NOT NULL DEFAULT 'PLANNED',
    "objectives" TEXT,
    "conclusion" TEXT,
    "overallRating" "AuditRating",
    "totalFindings" INTEGER NOT NULL DEFAULT 0,
    "majorNCs" INTEGER NOT NULL DEFAULT 0,
    "minorNCs" INTEGER NOT NULL DEFAULT 0,
    "observations" INTEGER NOT NULL DEFAULT 0,
    "ofis" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "scheduleId" UUID,

    CONSTRAINT "qms_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_team_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auditId" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "AuditTeamRole" NOT NULL,
    "isQualified" BOOLEAN NOT NULL DEFAULT true,
    "qualificationNotes" TEXT,
    "assignedClauses" TEXT[],
    "assignedAreas" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_checklists" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auditId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "clause" TEXT,
    "area" TEXT,
    "items" JSONB NOT NULL,
    "completedById" TEXT,
    "completedAt" TIMESTAMP(3),
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "compliantItems" INTEGER NOT NULL DEFAULT 0,
    "nonCompliantItems" INTEGER NOT NULL DEFAULT 0,
    "notApplicable" INTEGER NOT NULL DEFAULT 0,
    "compliancePercent" DOUBLE PRECISION,
    "status" "ChecklistStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_findings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auditId" UUID NOT NULL,
    "findingNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "findingType" "AuditFindingType" NOT NULL,
    "clause" TEXT,
    "area" TEXT,
    "process" TEXT,
    "objectiveEvidence" TEXT,
    "criteria" TEXT,
    "riskLevel" "RiskLevel",
    "auditeeResponse" TEXT,
    "responseDate" TIMESTAMP(3),
    "status" "FindingStatus" NOT NULL DEFAULT 'OPEN',
    "capaId" UUID,
    "closedById" TEXT,
    "closedAt" TIMESTAMP(3),
    "closureNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "audit_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_schedules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER NOT NULL,
    "plannedAudits" JSONB NOT NULL,
    "riskCriteria" JSONB,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "totalPlanned" INTEGER NOT NULL DEFAULT 0,
    "totalCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalInProgress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "audit_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qms_risks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "riskNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "riskCategory" "RiskCategory" NOT NULL,
    "riskType" "QMSRiskType" NOT NULL,
    "standard" "ISOStandard",
    "process" TEXT,
    "department" TEXT,
    "objective" TEXT,
    "ownerId" TEXT,
    "likelihood" INTEGER NOT NULL DEFAULT 1,
    "impact" INTEGER NOT NULL DEFAULT 1,
    "currentRiskScore" INTEGER,
    "currentRiskLevel" "QMSRiskLevel",
    "residualLikelihood" INTEGER,
    "residualImpact" INTEGER,
    "residualRiskScore" INTEGER,
    "residualRiskLevel" "QMSRiskLevel",
    "targetRiskScore" INTEGER,
    "status" "QMSRiskStatus" NOT NULL DEFAULT 'IDENTIFIED',
    "reviewFrequency" INTEGER,
    "nextReviewDate" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),
    "lastReviewedById" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "qms_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_assessments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "riskId" UUID NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assessmentType" "RiskAssessmentType" NOT NULL DEFAULT 'PERIODIC',
    "assessedById" TEXT NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskLevel" "QMSRiskLevel" NOT NULL,
    "likelihoodFactors" JSONB,
    "impactFactors" JSONB,
    "rationale" TEXT,
    "assumptions" TEXT,
    "uncertainties" TEXT,
    "trendDirection" "TrendDirection",
    "previousScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_controls" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "riskId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "controlType" "ControlType" NOT NULL,
    "controlCategory" "ControlCategory" NOT NULL DEFAULT 'MANUAL',
    "frequency" "ControlFrequency" NOT NULL DEFAULT 'CONTINUOUS',
    "ownerId" TEXT,
    "designEffectiveness" "ControlEffectiveness" NOT NULL DEFAULT 'MODERATE',
    "operatingEffectiveness" "ControlEffectiveness",
    "lastTestedAt" TIMESTAMP(3),
    "lastTestedById" TEXT,
    "testResults" TEXT,
    "status" "ControlStatus" NOT NULL DEFAULT 'ACTIVE',
    "relatedDocuments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "risk_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_treatments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "riskId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "treatmentStrategy" "TreatmentStrategy" NOT NULL,
    "ownerId" TEXT,
    "plannedStartDate" TIMESTAMP(3),
    "plannedEndDate" TIMESTAMP(3),
    "actualStartDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "status" "TreatmentStatus" NOT NULL DEFAULT 'PROPOSED',
    "expectedLikelihood" INTEGER,
    "expectedImpact" INTEGER,
    "expectedRiskScore" INTEGER,
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "resourcesRequired" TEXT,
    "verificationMethod" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "isEffective" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "risk_treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fmea_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fmeaNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fmeaType" "FMEAType" NOT NULL,
    "product" TEXT,
    "process" TEXT,
    "subsystem" TEXT,
    "function" TEXT,
    "teamLeaderId" TEXT,
    "teamMembers" TEXT[],
    "startDate" TIMESTAMP(3),
    "targetDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "status" "FMEAStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "totalFailureModes" INTEGER NOT NULL DEFAULT 0,
    "highRPNCount" INTEGER NOT NULL DEFAULT 0,
    "actionsPending" INTEGER NOT NULL DEFAULT 0,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "revisionDate" TIMESTAMP(3),
    "revisionNotes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "fmea_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fmea_actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fmeaId" UUID NOT NULL,
    "itemFunction" TEXT NOT NULL,
    "potentialFailureMode" TEXT NOT NULL,
    "potentialEffects" TEXT NOT NULL,
    "potentialCauses" TEXT NOT NULL,
    "currentControls" TEXT,
    "currentDetection" TEXT,
    "originalSeverity" INTEGER NOT NULL,
    "originalOccurrence" INTEGER NOT NULL,
    "originalDetection" INTEGER NOT NULL,
    "originalRPN" INTEGER NOT NULL,
    "classification" "FMEAClassification",
    "recommendedAction" TEXT,
    "responsibleParty" TEXT,
    "targetDate" TIMESTAMP(3),
    "actionTaken" TEXT,
    "completedDate" TIMESTAMP(3),
    "newSeverity" INTEGER,
    "newOccurrence" INTEGER,
    "newDetection" INTEGER,
    "newRPN" INTEGER,
    "status" "FMEAActionStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "fmea_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "improvement_projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "projectType" "ImprovementProjectType" NOT NULL,
    "methodology" "ImprovementMethodology" NOT NULL,
    "category" TEXT,
    "department" TEXT,
    "process" TEXT,
    "product" TEXT,
    "sponsorId" TEXT,
    "leaderId" TEXT,
    "currentPhase" "ProjectPhase" NOT NULL DEFAULT 'DEFINE',
    "phaseHistory" JSONB,
    "startDate" TIMESTAMP(3),
    "targetEndDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "status" "ProjectStatus" NOT NULL DEFAULT 'PROPOSED',
    "problemStatement" TEXT,
    "goalStatement" TEXT,
    "baselineMetric" TEXT,
    "baselineValue" DOUBLE PRECISION,
    "targetValue" DOUBLE PRECISION,
    "actualValue" DOUBLE PRECISION,
    "estimatedSavings" DOUBLE PRECISION,
    "actualSavings" DOUBLE PRECISION,
    "investmentRequired" DOUBLE PRECISION,
    "roi" DOUBLE PRECISION,
    "risks" JSONB,
    "metadata" JSONB,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "improvement_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kaizen_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "eventNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "process" TEXT,
    "facilitatorId" TEXT,
    "teamMembers" TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "KaizenStatus" NOT NULL DEFAULT 'PLANNED',
    "wasteTypes" "WasteType"[],
    "improvements" JSONB,
    "actionsCompleted" INTEGER NOT NULL DEFAULT 0,
    "actionsTotal" INTEGER NOT NULL DEFAULT 0,
    "beforeMetrics" JSONB,
    "afterMetrics" JSONB,
    "estimatedSavings" DOUBLE PRECISION,
    "actualSavings" DOUBLE PRECISION,
    "followUpDate" TIMESTAMP(3),
    "sustainabilityStatus" "SustainabilityStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "kaizen_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_ideas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ideaNumber" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "problemStatement" TEXT,
    "proposedSolution" TEXT,
    "category" "IdeaCategory" NOT NULL,
    "area" TEXT,
    "expectedBenefits" TEXT,
    "estimatedSavings" DOUBLE PRECISION,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewComments" TEXT,
    "status" "IdeaStatus" NOT NULL DEFAULT 'SUBMITTED',
    "implementedById" TEXT,
    "implementedAt" TIMESTAMP(3),
    "actualBenefits" TEXT,
    "actualSavings" DOUBLE PRECISION,
    "pointsAwarded" INTEGER,
    "recognitionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standard_work" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documentNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "process" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "workstation" TEXT,
    "taktTime" DOUBLE PRECISION,
    "cycleTime" DOUBLE PRECISION,
    "standardWIP" INTEGER,
    "workSequence" JSONB NOT NULL,
    "totalSteps" INTEGER NOT NULL DEFAULT 0,
    "safetyPoints" TEXT[],
    "qualityCheckpoints" JSONB,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "status" "StandardWorkStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "trainingRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "standard_work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "value_stream_maps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vsmNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "productFamily" TEXT,
    "process" TEXT NOT NULL,
    "currentState" JSONB,
    "futureState" JSONB,
    "currentLeadTime" DOUBLE PRECISION,
    "currentProcessTime" DOUBLE PRECISION,
    "currentInventory" DOUBLE PRECISION,
    "currentQuality" DOUBLE PRECISION,
    "targetLeadTime" DOUBLE PRECISION,
    "targetProcessTime" DOUBLE PRECISION,
    "targetInventory" DOUBLE PRECISION,
    "targetQuality" DOUBLE PRECISION,
    "wastesIdentified" JSONB,
    "status" "VSMStatus" NOT NULL DEFAULT 'CURRENT_STATE',
    "implementationPlan" JSONB,
    "implementationProgress" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "value_stream_maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "five_s_audits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auditNumber" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "department" TEXT,
    "auditDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auditorId" TEXT NOT NULL,
    "sortScore" INTEGER NOT NULL,
    "setInOrderScore" INTEGER NOT NULL,
    "shineScore" INTEGER NOT NULL,
    "standardizeScore" INTEGER NOT NULL,
    "sustainScore" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 25,
    "percentScore" DOUBLE PRECISION NOT NULL,
    "sortFindings" JSONB,
    "setInOrderFindings" JSONB,
    "shineFindings" JSONB,
    "standardizeFindings" JSONB,
    "sustainFindings" JSONB,
    "actionsRequired" JSONB,
    "photos" JSONB,
    "followUpDate" TIMESTAMP(3),
    "followUpCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "five_s_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qms_training_courses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "courseCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "TrainingCategory" NOT NULL,
    "type" "TrainingType" NOT NULL,
    "standard" "ISOStandard",
    "objectives" TEXT[],
    "content" JSONB,
    "materials" JSONB,
    "durationHours" DOUBLE PRECISION,
    "durationDays" DOUBLE PRECISION,
    "deliveryMethod" "DeliveryMethod" NOT NULL,
    "provider" TEXT,
    "location" TEXT,
    "prerequisites" TEXT[],
    "assessmentRequired" BOOLEAN NOT NULL DEFAULT false,
    "passingScore" DOUBLE PRECISION,
    "validityPeriod" INTEGER,
    "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE',
    "version" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "qms_training_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qms_training_requirements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "targetType" "TrainingTargetType" NOT NULL,
    "targetId" TEXT,
    "targetDescription" TEXT,
    "courseId" UUID NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "priority" "TrainingPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueWithinDays" INTEGER,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringInterval" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rationale" TEXT,
    "regulatoryRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "qms_training_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qms_training_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "courseId" UUID NOT NULL,
    "sessionId" UUID,
    "status" "QMSTrainingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "assessmentScore" DOUBLE PRECISION,
    "assessmentPassed" BOOLEAN,
    "assessmentDate" TIMESTAMP(3),
    "competencyLevel" "CompetenceLevel",
    "assessedById" TEXT,
    "competencyNotes" TEXT,
    "certificateNumber" TEXT,
    "certificateUrl" TEXT,
    "expiryDate" TIMESTAMP(3),
    "trainingMethod" TEXT,
    "trainerId" TEXT,
    "effectivenessRating" INTEGER,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qms_training_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qms_training_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sessionNumber" TEXT NOT NULL,
    "courseId" UUID NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "virtualLink" TEXT,
    "trainerId" TEXT,
    "trainerName" TEXT,
    "maxParticipants" INTEGER,
    "enrolledCount" INTEGER NOT NULL DEFAULT 0,
    "attendedCount" INTEGER NOT NULL DEFAULT 0,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "materials" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "qms_training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_matrices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "roleId" TEXT,
    "roleName" TEXT NOT NULL,
    "department" TEXT,
    "competencies" JSONB NOT NULL,
    "lastAssessedAt" TIMESTAMP(3),
    "assessedById" TEXT,
    "gapAnalysis" JSONB,
    "status" "MatrixStatus" NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "effectiveDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "competency_matrices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_qualifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplierId" TEXT NOT NULL,
    "qualificationNumber" TEXT NOT NULL,
    "qualificationType" "SupplierQualificationType" NOT NULL,
    "productCategories" TEXT[],
    "services" TEXT[],
    "assessmentDate" TIMESTAMP(3),
    "assessedById" TEXT,
    "qualityScore" DOUBLE PRECISION,
    "deliveryScore" DOUBLE PRECISION,
    "technicalScore" DOUBLE PRECISION,
    "financialScore" DOUBLE PRECISION,
    "complianceScore" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "documentsReceived" JSONB,
    "certificationsVerified" JSONB,
    "qualificationStatus" "QualificationStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvalNotes" TEXT,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "conditions" TEXT[],
    "restrictions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "supplier_qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_scorecards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplierId" TEXT NOT NULL,
    "periodType" "ScorecardPeriod" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "qualityPPM" DOUBLE PRECISION,
    "qualityScore" DOUBLE PRECISION,
    "ncCount" INTEGER NOT NULL DEFAULT 0,
    "returnRate" DOUBLE PRECISION,
    "onTimeDelivery" DOUBLE PRECISION,
    "deliveryScore" DOUBLE PRECISION,
    "lateDeliveries" INTEGER NOT NULL DEFAULT 0,
    "costVariance" DOUBLE PRECISION,
    "costScore" DOUBLE PRECISION,
    "priceStability" DOUBLE PRECISION,
    "responseTime" DOUBLE PRECISION,
    "responsivenessScore" DOUBLE PRECISION,
    "communicationScore" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "rating" "SupplierRating",
    "trend" "TrendDirection",
    "strengths" TEXT[],
    "improvements" TEXT[],
    "notes" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_scorecards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_audits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplierId" TEXT NOT NULL,
    "auditNumber" TEXT NOT NULL,
    "auditType" "SupplierAuditType" NOT NULL,
    "auditDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "scope" TEXT NOT NULL,
    "standard" "ISOStandard",
    "clauses" TEXT[],
    "leadAuditorId" TEXT,
    "teamMembers" TEXT[],
    "overallRating" "AuditRating",
    "findings" JSONB,
    "majorNCs" INTEGER NOT NULL DEFAULT 0,
    "minorNCs" INTEGER NOT NULL DEFAULT 0,
    "observations" INTEGER NOT NULL DEFAULT 0,
    "reportUrl" TEXT,
    "status" "SupplierAuditStatus" NOT NULL DEFAULT 'SCHEDULED',
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "followUpNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "supplier_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ppap_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "submissionNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "partRevision" TEXT,
    "submissionLevel" "PPAPLevel" NOT NULL,
    "submissionReason" "PPAPReason" NOT NULL,
    "elements" JSONB NOT NULL,
    "submittedDate" TIMESTAMP(3),
    "requiredDate" TIMESTAMP(3),
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "status" "PPAPStatus" NOT NULL DEFAULT 'PENDING',
    "dispositionDate" TIMESTAMP(3),
    "dispositionById" TEXT,
    "dispositionNotes" TEXT,
    "interimApproval" BOOLEAN NOT NULL DEFAULT false,
    "interimConditions" TEXT,
    "interimExpiryDate" TIMESTAMP(3),
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "ppap_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_ncrs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ncrNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "partNumber" TEXT,
    "poNumber" TEXT,
    "lotNumber" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "issueType" "SupplierIssueType" NOT NULL,
    "severity" "IssueSeverity" NOT NULL DEFAULT 'MINOR',
    "quantityReceived" INTEGER,
    "quantityDefective" INTEGER,
    "detectedAt" TEXT,
    "detectedById" TEXT,
    "detectedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evidence" JSONB,
    "photos" JSONB,
    "containmentAction" TEXT,
    "containedById" TEXT,
    "containedAt" TIMESTAMP(3),
    "supplierResponse" TEXT,
    "supplierResponseDate" TIMESTAMP(3),
    "rootCauseProvided" TEXT,
    "correctiveActionProvided" TEXT,
    "eightDRequired" BOOLEAN NOT NULL DEFAULT false,
    "eightDReceived" BOOLEAN NOT NULL DEFAULT false,
    "eightDAccepted" BOOLEAN,
    "materialCost" DOUBLE PRECISION,
    "laborCost" DOUBLE PRECISION,
    "additionalCosts" DOUBLE PRECISION,
    "chargedToSupplier" BOOLEAN NOT NULL DEFAULT false,
    "status" "SupplierNCRStatus" NOT NULL DEFAULT 'OPEN',
    "closedById" TEXT,
    "closedAt" TIMESTAMP(3),
    "closureNotes" TEXT,
    "effectivenessVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "supplier_ncrs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "change_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "changeNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "justification" TEXT,
    "changeType" "ChangeType" NOT NULL,
    "category" "ChangeCategory",
    "priority" "ChangePriority" NOT NULL DEFAULT 'MEDIUM',
    "affectedItems" JSONB,
    "documentId" UUID,
    "requestedById" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" TEXT,
    "riskLevel" "RiskLevel",
    "riskAssessment" JSONB,
    "status" "ChangeStatus" NOT NULL DEFAULT 'DRAFT',
    "targetDate" TIMESTAMP(3),
    "effectiveDate" TIMESTAMP(3),
    "actualCompletionDate" TIMESTAMP(3),
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "metadata" JSONB,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "change_approvals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "changeRequestId" UUID NOT NULL,
    "approvalLevel" INTEGER NOT NULL DEFAULT 1,
    "approverId" TEXT NOT NULL,
    "approverRole" TEXT,
    "isCCBMember" BOOLEAN NOT NULL DEFAULT false,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "decision" "ApprovalDecision",
    "comments" TEXT,
    "conditions" TEXT[],
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),

    CONSTRAINT "change_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "change_impacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "changeRequestId" UUID NOT NULL,
    "impactArea" "ImpactArea" NOT NULL,
    "impactDescription" TEXT NOT NULL,
    "severity" "ImpactSeverity" NOT NULL DEFAULT 'MODERATE',
    "affectedEntity" TEXT,
    "affectedEntityId" TEXT,
    "mitigationRequired" BOOLEAN NOT NULL DEFAULT false,
    "mitigationPlan" TEXT,
    "actionsRequired" JSONB,
    "trainingRequired" BOOLEAN NOT NULL DEFAULT false,
    "trainingNotes" TEXT,
    "documentationChanges" TEXT[],
    "assessedById" TEXT,
    "assessedAt" TIMESTAMP(3),

    CONSTRAINT "change_impacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "change_implementations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "changeRequestId" UUID NOT NULL,
    "taskNumber" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "assignedToId" TEXT,
    "department" TEXT,
    "plannedStartDate" TIMESTAMP(3),
    "plannedEndDate" TIMESTAMP(3),
    "actualStartDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "status" "ImplementationStatus" NOT NULL DEFAULT 'PLANNED',
    "verificationMethod" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verificationResult" TEXT,
    "evidence" JSONB,
    "notes" TEXT,

    CONSTRAINT "change_implementations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qms_documents_documentNumber_key" ON "qms_documents"("documentNumber");

-- CreateIndex
CREATE INDEX "qms_documents_documentNumber_idx" ON "qms_documents"("documentNumber");

-- CreateIndex
CREATE INDEX "qms_documents_status_documentType_idx" ON "qms_documents"("status", "documentType");

-- CreateIndex
CREATE INDEX "qms_documents_standard_idx" ON "qms_documents"("standard");

-- CreateIndex
CREATE INDEX "qms_documents_nextReviewDate_idx" ON "qms_documents"("nextReviewDate");

-- CreateIndex
CREATE INDEX "qms_document_versions_documentId_idx" ON "qms_document_versions"("documentId");

-- CreateIndex
CREATE INDEX "qms_document_versions_status_idx" ON "qms_document_versions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "qms_document_versions_documentId_versionNumber_key" ON "qms_document_versions"("documentId", "versionNumber");

-- CreateIndex
CREATE INDEX "qms_document_approvals_documentId_idx" ON "qms_document_approvals"("documentId");

-- CreateIndex
CREATE INDEX "qms_document_approvals_approverId_status_idx" ON "qms_document_approvals"("approverId", "status");

-- CreateIndex
CREATE INDEX "qms_document_distributions_documentId_idx" ON "qms_document_distributions"("documentId");

-- CreateIndex
CREATE INDEX "qms_document_distributions_recipientId_idx" ON "qms_document_distributions"("recipientId");

-- CreateIndex
CREATE INDEX "qms_document_access_logs_documentId_idx" ON "qms_document_access_logs"("documentId");

-- CreateIndex
CREATE INDEX "qms_document_access_logs_userId_idx" ON "qms_document_access_logs"("userId");

-- CreateIndex
CREATE INDEX "qms_document_access_logs_accessedAt_idx" ON "qms_document_access_logs"("accessedAt");

-- CreateIndex
CREATE UNIQUE INDEX "investigations_referenceNumber_key" ON "investigations"("referenceNumber");

-- CreateIndex
CREATE INDEX "investigations_referenceNumber_idx" ON "investigations"("referenceNumber");

-- CreateIndex
CREATE INDEX "investigations_status_idx" ON "investigations"("status");

-- CreateIndex
CREATE INDEX "investigations_investigationType_idx" ON "investigations"("investigationType");

-- CreateIndex
CREATE INDEX "investigations_eventDate_idx" ON "investigations"("eventDate");

-- CreateIndex
CREATE INDEX "investigation_timelines_investigationId_idx" ON "investigation_timelines"("investigationId");

-- CreateIndex
CREATE INDEX "investigation_causes_investigationId_idx" ON "investigation_causes"("investigationId");

-- CreateIndex
CREATE INDEX "investigation_causes_causeType_idx" ON "investigation_causes"("causeType");

-- CreateIndex
CREATE INDEX "investigation_recommendations_investigationId_idx" ON "investigation_recommendations"("investigationId");

-- CreateIndex
CREATE INDEX "investigation_recommendations_status_idx" ON "investigation_recommendations"("status");

-- CreateIndex
CREATE INDEX "investigation_team_members_investigationId_idx" ON "investigation_team_members"("investigationId");

-- CreateIndex
CREATE UNIQUE INDEX "investigation_team_members_investigationId_userId_key" ON "investigation_team_members"("investigationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "capas_referenceNumber_key" ON "capas"("referenceNumber");

-- CreateIndex
CREATE INDEX "capas_referenceNumber_idx" ON "capas"("referenceNumber");

-- CreateIndex
CREATE INDEX "capas_status_currentPhase_idx" ON "capas"("status", "currentPhase");

-- CreateIndex
CREATE INDEX "capas_capaType_idx" ON "capas"("capaType");

-- CreateIndex
CREATE INDEX "capa_team_members_capaId_idx" ON "capa_team_members"("capaId");

-- CreateIndex
CREATE UNIQUE INDEX "capa_team_members_capaId_userId_key" ON "capa_team_members"("capaId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "capa_problem_statements_capaId_key" ON "capa_problem_statements"("capaId");

-- CreateIndex
CREATE INDEX "capa_containment_actions_capaId_idx" ON "capa_containment_actions"("capaId");

-- CreateIndex
CREATE INDEX "capa_root_causes_capaId_idx" ON "capa_root_causes"("capaId");

-- CreateIndex
CREATE INDEX "capa_corrective_actions_capaId_idx" ON "capa_corrective_actions"("capaId");

-- CreateIndex
CREATE INDEX "capa_implementations_capaId_idx" ON "capa_implementations"("capaId");

-- CreateIndex
CREATE INDEX "capa_prevention_actions_capaId_idx" ON "capa_prevention_actions"("capaId");

-- CreateIndex
CREATE INDEX "capa_effectiveness_checks_capaId_idx" ON "capa_effectiveness_checks"("capaId");

-- CreateIndex
CREATE INDEX "capa_horizontal_deployments_capaId_idx" ON "capa_horizontal_deployments"("capaId");

-- CreateIndex
CREATE UNIQUE INDEX "qms_audits_auditNumber_key" ON "qms_audits"("auditNumber");

-- CreateIndex
CREATE INDEX "qms_audits_auditNumber_idx" ON "qms_audits"("auditNumber");

-- CreateIndex
CREATE INDEX "qms_audits_status_idx" ON "qms_audits"("status");

-- CreateIndex
CREATE INDEX "qms_audits_auditType_idx" ON "qms_audits"("auditType");

-- CreateIndex
CREATE INDEX "qms_audits_plannedStartDate_idx" ON "qms_audits"("plannedStartDate");

-- CreateIndex
CREATE INDEX "audit_team_members_auditId_idx" ON "audit_team_members"("auditId");

-- CreateIndex
CREATE UNIQUE INDEX "audit_team_members_auditId_userId_key" ON "audit_team_members"("auditId", "userId");

-- CreateIndex
CREATE INDEX "audit_checklists_auditId_idx" ON "audit_checklists"("auditId");

-- CreateIndex
CREATE INDEX "audit_findings_auditId_idx" ON "audit_findings"("auditId");

-- CreateIndex
CREATE INDEX "audit_findings_findingType_idx" ON "audit_findings"("findingType");

-- CreateIndex
CREATE INDEX "audit_findings_status_idx" ON "audit_findings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "audit_findings_auditId_findingNumber_key" ON "audit_findings"("auditId", "findingNumber");

-- CreateIndex
CREATE INDEX "audit_schedules_year_idx" ON "audit_schedules"("year");

-- CreateIndex
CREATE UNIQUE INDEX "audit_schedules_year_key" ON "audit_schedules"("year");

-- CreateIndex
CREATE UNIQUE INDEX "qms_risks_riskNumber_key" ON "qms_risks"("riskNumber");

-- CreateIndex
CREATE INDEX "qms_risks_riskNumber_idx" ON "qms_risks"("riskNumber");

-- CreateIndex
CREATE INDEX "qms_risks_status_idx" ON "qms_risks"("status");

-- CreateIndex
CREATE INDEX "qms_risks_currentRiskLevel_idx" ON "qms_risks"("currentRiskLevel");

-- CreateIndex
CREATE INDEX "risk_assessments_riskId_idx" ON "risk_assessments"("riskId");

-- CreateIndex
CREATE INDEX "risk_assessments_assessmentDate_idx" ON "risk_assessments"("assessmentDate");

-- CreateIndex
CREATE INDEX "risk_controls_riskId_idx" ON "risk_controls"("riskId");

-- CreateIndex
CREATE INDEX "risk_treatments_riskId_idx" ON "risk_treatments"("riskId");

-- CreateIndex
CREATE UNIQUE INDEX "fmea_records_fmeaNumber_key" ON "fmea_records"("fmeaNumber");

-- CreateIndex
CREATE INDEX "fmea_records_fmeaNumber_idx" ON "fmea_records"("fmeaNumber");

-- CreateIndex
CREATE INDEX "fmea_records_status_idx" ON "fmea_records"("status");

-- CreateIndex
CREATE INDEX "fmea_records_fmeaType_idx" ON "fmea_records"("fmeaType");

-- CreateIndex
CREATE INDEX "fmea_actions_fmeaId_idx" ON "fmea_actions"("fmeaId");

-- CreateIndex
CREATE INDEX "fmea_actions_originalRPN_idx" ON "fmea_actions"("originalRPN");

-- CreateIndex
CREATE UNIQUE INDEX "improvement_projects_projectNumber_key" ON "improvement_projects"("projectNumber");

-- CreateIndex
CREATE INDEX "improvement_projects_projectNumber_idx" ON "improvement_projects"("projectNumber");

-- CreateIndex
CREATE INDEX "improvement_projects_status_idx" ON "improvement_projects"("status");

-- CreateIndex
CREATE INDEX "improvement_projects_methodology_idx" ON "improvement_projects"("methodology");

-- CreateIndex
CREATE UNIQUE INDEX "kaizen_events_eventNumber_key" ON "kaizen_events"("eventNumber");

-- CreateIndex
CREATE INDEX "kaizen_events_eventNumber_idx" ON "kaizen_events"("eventNumber");

-- CreateIndex
CREATE INDEX "kaizen_events_status_idx" ON "kaizen_events"("status");

-- CreateIndex
CREATE UNIQUE INDEX "employee_ideas_ideaNumber_key" ON "employee_ideas"("ideaNumber");

-- CreateIndex
CREATE INDEX "employee_ideas_ideaNumber_idx" ON "employee_ideas"("ideaNumber");

-- CreateIndex
CREATE INDEX "employee_ideas_status_idx" ON "employee_ideas"("status");

-- CreateIndex
CREATE INDEX "employee_ideas_submittedById_idx" ON "employee_ideas"("submittedById");

-- CreateIndex
CREATE UNIQUE INDEX "standard_work_documentNumber_key" ON "standard_work"("documentNumber");

-- CreateIndex
CREATE INDEX "standard_work_documentNumber_idx" ON "standard_work"("documentNumber");

-- CreateIndex
CREATE INDEX "standard_work_process_idx" ON "standard_work"("process");

-- CreateIndex
CREATE UNIQUE INDEX "value_stream_maps_vsmNumber_key" ON "value_stream_maps"("vsmNumber");

-- CreateIndex
CREATE INDEX "value_stream_maps_vsmNumber_idx" ON "value_stream_maps"("vsmNumber");

-- CreateIndex
CREATE INDEX "value_stream_maps_status_idx" ON "value_stream_maps"("status");

-- CreateIndex
CREATE UNIQUE INDEX "five_s_audits_auditNumber_key" ON "five_s_audits"("auditNumber");

-- CreateIndex
CREATE INDEX "five_s_audits_auditNumber_idx" ON "five_s_audits"("auditNumber");

-- CreateIndex
CREATE INDEX "five_s_audits_area_idx" ON "five_s_audits"("area");

-- CreateIndex
CREATE INDEX "five_s_audits_auditDate_idx" ON "five_s_audits"("auditDate");

-- CreateIndex
CREATE UNIQUE INDEX "qms_training_courses_courseCode_key" ON "qms_training_courses"("courseCode");

-- CreateIndex
CREATE INDEX "qms_training_courses_courseCode_idx" ON "qms_training_courses"("courseCode");

-- CreateIndex
CREATE INDEX "qms_training_courses_category_idx" ON "qms_training_courses"("category");

-- CreateIndex
CREATE INDEX "qms_training_courses_status_idx" ON "qms_training_courses"("status");

-- CreateIndex
CREATE INDEX "qms_training_requirements_courseId_idx" ON "qms_training_requirements"("courseId");

-- CreateIndex
CREATE INDEX "qms_training_requirements_targetType_targetId_idx" ON "qms_training_requirements"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "qms_training_records_userId_idx" ON "qms_training_records"("userId");

-- CreateIndex
CREATE INDEX "qms_training_records_courseId_idx" ON "qms_training_records"("courseId");

-- CreateIndex
CREATE INDEX "qms_training_records_status_idx" ON "qms_training_records"("status");

-- CreateIndex
CREATE UNIQUE INDEX "qms_training_records_userId_courseId_key" ON "qms_training_records"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "qms_training_sessions_sessionNumber_key" ON "qms_training_sessions"("sessionNumber");

-- CreateIndex
CREATE INDEX "qms_training_sessions_courseId_idx" ON "qms_training_sessions"("courseId");

-- CreateIndex
CREATE INDEX "qms_training_sessions_scheduledDate_idx" ON "qms_training_sessions"("scheduledDate");

-- CreateIndex
CREATE INDEX "qms_training_sessions_status_idx" ON "qms_training_sessions"("status");

-- CreateIndex
CREATE INDEX "competency_matrices_roleId_idx" ON "competency_matrices"("roleId");

-- CreateIndex
CREATE INDEX "competency_matrices_roleName_idx" ON "competency_matrices"("roleName");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_qualifications_qualificationNumber_key" ON "supplier_qualifications"("qualificationNumber");

-- CreateIndex
CREATE INDEX "supplier_qualifications_supplierId_idx" ON "supplier_qualifications"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_qualifications_qualificationStatus_idx" ON "supplier_qualifications"("qualificationStatus");

-- CreateIndex
CREATE INDEX "supplier_scorecards_supplierId_idx" ON "supplier_scorecards"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_scorecards_supplierId_periodType_periodStart_key" ON "supplier_scorecards"("supplierId", "periodType", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_audits_auditNumber_key" ON "supplier_audits"("auditNumber");

-- CreateIndex
CREATE INDEX "supplier_audits_supplierId_idx" ON "supplier_audits"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_audits_auditDate_idx" ON "supplier_audits"("auditDate");

-- CreateIndex
CREATE UNIQUE INDEX "ppap_submissions_submissionNumber_key" ON "ppap_submissions"("submissionNumber");

-- CreateIndex
CREATE INDEX "ppap_submissions_submissionNumber_idx" ON "ppap_submissions"("submissionNumber");

-- CreateIndex
CREATE INDEX "ppap_submissions_supplierId_idx" ON "ppap_submissions"("supplierId");

-- CreateIndex
CREATE INDEX "ppap_submissions_partNumber_idx" ON "ppap_submissions"("partNumber");

-- CreateIndex
CREATE INDEX "ppap_submissions_status_idx" ON "ppap_submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_ncrs_ncrNumber_key" ON "supplier_ncrs"("ncrNumber");

-- CreateIndex
CREATE INDEX "supplier_ncrs_ncrNumber_idx" ON "supplier_ncrs"("ncrNumber");

-- CreateIndex
CREATE INDEX "supplier_ncrs_supplierId_idx" ON "supplier_ncrs"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_ncrs_status_idx" ON "supplier_ncrs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "change_requests_changeNumber_key" ON "change_requests"("changeNumber");

-- CreateIndex
CREATE INDEX "change_requests_changeNumber_idx" ON "change_requests"("changeNumber");

-- CreateIndex
CREATE INDEX "change_requests_status_idx" ON "change_requests"("status");

-- CreateIndex
CREATE INDEX "change_requests_changeType_idx" ON "change_requests"("changeType");

-- CreateIndex
CREATE INDEX "change_approvals_changeRequestId_idx" ON "change_approvals"("changeRequestId");

-- CreateIndex
CREATE INDEX "change_approvals_approverId_idx" ON "change_approvals"("approverId");

-- CreateIndex
CREATE INDEX "change_impacts_changeRequestId_idx" ON "change_impacts"("changeRequestId");

-- CreateIndex
CREATE INDEX "change_implementations_changeRequestId_idx" ON "change_implementations"("changeRequestId");

-- AddForeignKey
ALTER TABLE "qms_document_versions" ADD CONSTRAINT "qms_document_versions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "qms_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qms_document_approvals" ADD CONSTRAINT "qms_document_approvals_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "qms_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qms_document_distributions" ADD CONSTRAINT "qms_document_distributions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "qms_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qms_document_access_logs" ADD CONSTRAINT "qms_document_access_logs_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "qms_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigation_timelines" ADD CONSTRAINT "investigation_timelines_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "investigations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigation_causes" ADD CONSTRAINT "investigation_causes_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "investigations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigation_causes" ADD CONSTRAINT "investigation_causes_parentCauseId_fkey" FOREIGN KEY ("parentCauseId") REFERENCES "investigation_causes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigation_recommendations" ADD CONSTRAINT "investigation_recommendations_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "investigations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigation_team_members" ADD CONSTRAINT "investigation_team_members_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "investigations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_team_members" ADD CONSTRAINT "capa_team_members_capaId_fkey" FOREIGN KEY ("capaId") REFERENCES "capas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_problem_statements" ADD CONSTRAINT "capa_problem_statements_capaId_fkey" FOREIGN KEY ("capaId") REFERENCES "capas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_containment_actions" ADD CONSTRAINT "capa_containment_actions_capaId_fkey" FOREIGN KEY ("capaId") REFERENCES "capas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_root_causes" ADD CONSTRAINT "capa_root_causes_capaId_fkey" FOREIGN KEY ("capaId") REFERENCES "capas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_corrective_actions" ADD CONSTRAINT "capa_corrective_actions_capaId_fkey" FOREIGN KEY ("capaId") REFERENCES "capas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_implementations" ADD CONSTRAINT "capa_implementations_capaId_fkey" FOREIGN KEY ("capaId") REFERENCES "capas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_prevention_actions" ADD CONSTRAINT "capa_prevention_actions_capaId_fkey" FOREIGN KEY ("capaId") REFERENCES "capas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_effectiveness_checks" ADD CONSTRAINT "capa_effectiveness_checks_capaId_fkey" FOREIGN KEY ("capaId") REFERENCES "capas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capa_horizontal_deployments" ADD CONSTRAINT "capa_horizontal_deployments_capaId_fkey" FOREIGN KEY ("capaId") REFERENCES "capas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qms_audits" ADD CONSTRAINT "qms_audits_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "audit_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_team_members" ADD CONSTRAINT "audit_team_members_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "qms_audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_checklists" ADD CONSTRAINT "audit_checklists_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "qms_audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_findings" ADD CONSTRAINT "audit_findings_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "qms_audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "qms_risks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_controls" ADD CONSTRAINT "risk_controls_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "qms_risks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_treatments" ADD CONSTRAINT "risk_treatments_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "qms_risks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fmea_actions" ADD CONSTRAINT "fmea_actions_fmeaId_fkey" FOREIGN KEY ("fmeaId") REFERENCES "fmea_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qms_training_requirements" ADD CONSTRAINT "qms_training_requirements_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "qms_training_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qms_training_records" ADD CONSTRAINT "qms_training_records_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "qms_training_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qms_training_records" ADD CONSTRAINT "qms_training_records_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "qms_training_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qms_training_sessions" ADD CONSTRAINT "qms_training_sessions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "qms_training_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "qms_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_approvals" ADD CONSTRAINT "change_approvals_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "change_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_impacts" ADD CONSTRAINT "change_impacts_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "change_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_implementations" ADD CONSTRAINT "change_implementations_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "change_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
