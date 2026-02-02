-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'AUDITOR', 'USER');

-- CreateEnum
CREATE TYPE "ISOStandard" AS ENUM ('ISO_45001', 'ISO_14001', 'ISO_9001');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RiskStatus" AS ENUM ('ACTIVE', 'UNDER_REVIEW', 'MITIGATED', 'CLOSED', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('INJURY', 'NEAR_MISS', 'DANGEROUS_OCCURRENCE', 'OCCUPATIONAL_ILLNESS', 'PROPERTY_DAMAGE', 'SPILL', 'EMISSION', 'WASTE_INCIDENT', 'ENVIRONMENTAL_COMPLAINT', 'REGULATORY_BREACH', 'NON_CONFORMANCE', 'CUSTOMER_COMPLAINT', 'SUPPLIER_ISSUE', 'PROCESS_DEVIATION', 'PRODUCT_DEFECT', 'AUDIT_FINDING');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'UNDER_INVESTIGATION', 'AWAITING_ACTIONS', 'ACTIONS_IN_PROGRESS', 'VERIFICATION', 'CLOSED');

-- CreateEnum
CREATE TYPE "LegalType" AS ENUM ('LEGISLATION', 'REGULATION', 'CODE_OF_PRACTICE', 'PERMIT', 'LICENSE', 'STANDARD', 'CUSTOMER_REQUIREMENT', 'INTERNAL_REQUIREMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'PENDING', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "ObjectiveStatus" AS ENUM ('NOT_STARTED', 'ON_TRACK', 'AT_RISK', 'BEHIND', 'ACHIEVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT', 'IMMEDIATE', 'LONG_TERM');

-- CreateEnum
CREATE TYPE "ActionPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CompetenceLevel" AS ENUM ('AWARENESS', 'BASIC', 'PROFICIENT', 'EXPERT');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "AIProvider" AS ENUM ('OPENAI', 'ANTHROPIC', 'GROK');

-- CreateEnum
CREATE TYPE "AIAnalysisStatus" AS ENUM ('PENDING', 'COMPLETED', 'ACCEPTED', 'PARTIALLY_ACCEPTED', 'REJECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('POLICY', 'PROCEDURE', 'WORK_INSTRUCTION', 'FORM', 'RECORD', 'MANUAL', 'PLAN', 'REPORT', 'CERTIFICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'OBSOLETE');

-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('RECEIPT', 'ISSUE', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'TRANSFER_OUT', 'TRANSFER_IN', 'CYCLE_COUNT', 'RETURN', 'DAMAGE', 'EXPIRED', 'INITIAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "department" TEXT,
    "jobTitle" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risks" (
    "id" TEXT NOT NULL,
    "standard" "ISOStandard" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "source" TEXT,
    "likelihood" INTEGER NOT NULL DEFAULT 1,
    "severity" INTEGER NOT NULL DEFAULT 1,
    "detectability" INTEGER NOT NULL DEFAULT 1,
    "riskScore" INTEGER,
    "riskLevel" "RiskLevel",
    "aspectType" TEXT,
    "environmentalImpact" TEXT,
    "scale" INTEGER,
    "frequency" INTEGER,
    "legalImpact" INTEGER,
    "significanceScore" INTEGER,
    "processOwner" TEXT,
    "processInputs" TEXT,
    "processOutputs" TEXT,
    "kpis" TEXT,
    "existingControls" TEXT,
    "additionalControls" TEXT,
    "residualRisk" INTEGER,
    "status" "RiskStatus" NOT NULL DEFAULT 'ACTIVE',
    "reviewDate" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "standard" "ISOStandard" NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "IncidentType" NOT NULL,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MINOR',
    "category" TEXT,
    "location" TEXT,
    "dateOccurred" TIMESTAMP(3) NOT NULL,
    "dateReported" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reporterId" TEXT NOT NULL,
    "investigatorId" TEXT,
    "personsInvolved" TEXT,
    "injuryType" TEXT,
    "bodyPart" TEXT,
    "daysLost" INTEGER,
    "treatmentType" TEXT,
    "environmentalMedia" TEXT,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "regulatoryReport" BOOLEAN NOT NULL DEFAULT false,
    "productAffected" TEXT,
    "customerImpact" TEXT,
    "costOfNonConformance" DOUBLE PRECISION,
    "immediateCause" TEXT,
    "rootCauses" TEXT,
    "contributingFactors" TEXT,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "riskId" TEXT,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_requirements" (
    "id" TEXT NOT NULL,
    "standard" "ISOStandard" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "LegalType" NOT NULL,
    "jurisdiction" TEXT,
    "issuingBody" TEXT,
    "referenceNumber" TEXT,
    "effectiveDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "reviewFrequency" TEXT,
    "complianceStatus" "ComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "complianceEvidence" TEXT,
    "lastAssessedAt" TIMESTAMP(3),
    "nextAssessmentDate" TIMESTAMP(3),
    "responsiblePerson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objectives" (
    "id" TEXT NOT NULL,
    "standard" "ISOStandard" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION,
    "currentValue" DOUBLE PRECISION,
    "unit" TEXT,
    "baselineValue" DOUBLE PRECISION,
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "targetDate" TIMESTAMP(3),
    "ownerId" TEXT,
    "department" TEXT,
    "status" "ObjectiveStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objective_progress" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "objective_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actions" (
    "id" TEXT NOT NULL,
    "standard" "ISOStandard" NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ActionType" NOT NULL,
    "priority" "ActionPriority" NOT NULL DEFAULT 'MEDIUM',
    "ownerId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verificationMethod" TEXT,
    "verificationNotes" TEXT,
    "effectivenessRating" INTEGER,
    "status" "ActionStatus" NOT NULL DEFAULT 'OPEN',
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "riskId" TEXT,
    "incidentId" TEXT,
    "legalRequirementId" TEXT,
    "objectiveId" TEXT,
    "aiAnalysisId" TEXT,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_courses" (
    "id" TEXT NOT NULL,
    "standard" "ISOStandard",
    "title" TEXT NOT NULL,
    "description" TEXT,
    "provider" TEXT,
    "duration" TEXT,
    "frequency" TEXT,
    "requiredForRoles" TEXT,
    "requiredForDepartments" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "competenceLevel" "CompetenceLevel",
    "assessedBy" TEXT,
    "assessedAt" TIMESTAMP(3),
    "certificateUrl" TEXT,
    "notes" TEXT,
    "status" "TrainingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "five_why_analyses" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "why1" TEXT,
    "why2" TEXT,
    "why3" TEXT,
    "why4" TEXT,
    "why5" TEXT,
    "rootCause" TEXT,
    "conclusion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "five_why_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fishbone_analyses" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "manpower" TEXT,
    "method" TEXT,
    "machine" TEXT,
    "material" TEXT,
    "measurement" TEXT,
    "environment" TEXT,
    "conclusion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fishbone_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pareto_analyses" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT,
    "standard" "ISOStandard",
    "title" TEXT NOT NULL,
    "description" TEXT,
    "data" JSONB NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "conclusion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pareto_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bow_tie_analyses" (
    "id" TEXT NOT NULL,
    "riskId" TEXT NOT NULL,
    "topEvent" TEXT NOT NULL,
    "threats" JSONB NOT NULL,
    "consequences" JSONB NOT NULL,
    "preventiveControls" JSONB NOT NULL,
    "mitigatingControls" JSONB NOT NULL,
    "escalationFactors" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bow_tie_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lean_waste_analyses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "defects" JSONB,
    "overproduction" JSONB,
    "waiting" JSONB,
    "nonUtilizedTalent" JSONB,
    "transportation" JSONB,
    "inventory" JSONB,
    "motion" JSONB,
    "extraProcessing" JSONB,
    "totalEstimatedCost" DOUBLE PRECISION,
    "totalIdentifiedWastes" INTEGER,
    "recommendations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lean_waste_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_settings" (
    "id" TEXT NOT NULL,
    "provider" "AIProvider" NOT NULL DEFAULT 'OPENAI',
    "apiKey" TEXT,
    "model" TEXT,
    "defaultPrompt" TEXT,
    "totalTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceData" JSONB NOT NULL,
    "prompt" TEXT NOT NULL,
    "provider" "AIProvider" NOT NULL,
    "model" TEXT,
    "response" JSONB NOT NULL,
    "suggestedRootCause" TEXT,
    "suggestedActions" JSONB,
    "complianceGaps" JSONB,
    "highlights" JSONB,
    "status" "AIAnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "riskId" TEXT,
    "incidentId" TEXT,

    CONSTRAINT "ai_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_trends" (
    "id" TEXT NOT NULL,
    "standard" "ISOStandard" NOT NULL,
    "metric" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_trends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_metrics" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "hoursWorked" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lostTimeInjuries" INTEGER NOT NULL DEFAULT 0,
    "totalRecordableInjuries" INTEGER NOT NULL DEFAULT 0,
    "daysLost" INTEGER NOT NULL DEFAULT 0,
    "nearMisses" INTEGER NOT NULL DEFAULT 0,
    "firstAidCases" INTEGER NOT NULL DEFAULT 0,
    "ltifr" DOUBLE PRECISION,
    "trir" DOUBLE PRECISION,
    "severityRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_metrics" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "preventionCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "appraisalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "internalFailureCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "externalFailureCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCOPQ" DOUBLE PRECISION,
    "totalUnits" INTEGER NOT NULL DEFAULT 0,
    "defectiveUnits" INTEGER NOT NULL DEFAULT 0,
    "defectOpportunities" INTEGER NOT NULL DEFAULT 1,
    "dpmo" DOUBLE PRECISION,
    "firstPassYield" DOUBLE PRECISION,
    "processSigma" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "standard" "ISOStandard",
    "title" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "previousVersionId" TEXT,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "documentType" "DocumentType" NOT NULL,
    "isoClause" TEXT,
    "reviewDate" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_scores" (
    "id" TEXT NOT NULL,
    "standard" "ISOStandard" NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskScore" DOUBLE PRECISION,
    "incidentScore" DOUBLE PRECISION,
    "legalScore" DOUBLE PRECISION,
    "objectiveScore" DOUBLE PRECISION,
    "actionScore" DOUBLE PRECISION,
    "trainingScore" DOUBLE PRECISION,
    "documentScore" DOUBLE PRECISION,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "compliantItems" INTEGER NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "code" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" JSONB,
    "paymentTerms" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "taxId" TEXT,
    "notes" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "status" "SupplierStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "supplierId" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER NOT NULL DEFAULT 0,
    "reorderQuantity" INTEGER NOT NULL DEFAULT 0,
    "minStockLevel" INTEGER NOT NULL DEFAULT 0,
    "maxStockLevel" INTEGER NOT NULL DEFAULT 0,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 0,
    "dimensions" JSONB,
    "weight" DOUBLE PRECISION,
    "weightUnit" TEXT,
    "customAttributes" JSONB,
    "trackSerialNumbers" BOOLEAN NOT NULL DEFAULT false,
    "trackLotNumbers" BOOLEAN NOT NULL DEFAULT false,
    "trackExpiryDates" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" JSONB,
    "totalCapacity" DOUBLE PRECISION,
    "usedCapacity" DOUBLE PRECISION DEFAULT 0,
    "capacityUnit" TEXT NOT NULL DEFAULT 'cubic_meters',
    "managerId" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "operatingHours" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
    "quantityReserved" INTEGER NOT NULL DEFAULT 0,
    "quantityOnOrder" INTEGER NOT NULL DEFAULT 0,
    "binLocation" TEXT,
    "zone" TEXT,
    "aisle" TEXT,
    "shelf" TEXT,
    "lotNumbers" JSONB,
    "serialNumbers" JSONB,
    "averageCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "inventoryValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastCountedAt" TIMESTAMP(3),
    "lastReceivedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "quantityBefore" INTEGER NOT NULL,
    "quantityAfter" INTEGER NOT NULL,
    "quantityChange" INTEGER NOT NULL,
    "warehouseId" TEXT,
    "fromWarehouseId" TEXT,
    "toWarehouseId" TEXT,
    "binLocation" TEXT,
    "lotNumber" TEXT,
    "serialNumber" TEXT,
    "expiryDate" TIMESTAMP(3),
    "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reason" TEXT,
    "notes" TEXT,
    "performedById" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "risks_standard_status_idx" ON "risks"("standard", "status");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_referenceNumber_key" ON "incidents"("referenceNumber");

-- CreateIndex
CREATE INDEX "incidents_standard_status_idx" ON "incidents"("standard", "status");

-- CreateIndex
CREATE INDEX "incidents_dateOccurred_idx" ON "incidents"("dateOccurred");

-- CreateIndex
CREATE INDEX "legal_requirements_standard_complianceStatus_idx" ON "legal_requirements"("standard", "complianceStatus");

-- CreateIndex
CREATE INDEX "objectives_standard_status_idx" ON "objectives"("standard", "status");

-- CreateIndex
CREATE UNIQUE INDEX "actions_referenceNumber_key" ON "actions"("referenceNumber");

-- CreateIndex
CREATE INDEX "actions_status_dueDate_idx" ON "actions"("status", "dueDate");

-- CreateIndex
CREATE INDEX "actions_ownerId_status_idx" ON "actions"("ownerId", "status");

-- CreateIndex
CREATE INDEX "training_records_status_idx" ON "training_records"("status");

-- CreateIndex
CREATE UNIQUE INDEX "training_records_userId_courseId_key" ON "training_records"("userId", "courseId");

-- CreateIndex
CREATE INDEX "ai_analyses_sourceType_sourceId_idx" ON "ai_analyses"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "monthly_trends_standard_metric_idx" ON "monthly_trends"("standard", "metric");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_trends_standard_metric_year_month_key" ON "monthly_trends"("standard", "metric", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "safety_metrics_year_month_key" ON "safety_metrics"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "quality_metrics_year_month_key" ON "quality_metrics"("year", "month");

-- CreateIndex
CREATE INDEX "documents_standard_documentType_idx" ON "documents"("standard", "documentType");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_scores_standard_key" ON "compliance_scores"("standard");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_code_key" ON "product_categories"("code");

-- CreateIndex
CREATE INDEX "product_categories_parentId_idx" ON "product_categories"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");

-- CreateIndex
CREATE INDEX "suppliers_status_idx" ON "suppliers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "idx_product_sku" ON "products"("sku");

-- CreateIndex
CREATE INDEX "idx_product_barcode" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_supplierId_idx" ON "products"("supplierId");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE INDEX "inventory_warehouseId_idx" ON "inventory"("warehouseId");

-- CreateIndex
CREATE INDEX "inventory_quantityOnHand_idx" ON "inventory"("quantityOnHand");

-- CreateIndex
CREATE UNIQUE INDEX "idx_product_warehouse" ON "inventory"("productId", "warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_transactions_referenceNumber_key" ON "inventory_transactions"("referenceNumber");

-- CreateIndex
CREATE INDEX "inventory_transactions_productId_idx" ON "inventory_transactions"("productId");

-- CreateIndex
CREATE INDEX "inventory_transactions_transactionType_idx" ON "inventory_transactions"("transactionType");

-- CreateIndex
CREATE INDEX "inventory_transactions_transactionDate_idx" ON "inventory_transactions"("transactionDate");

-- CreateIndex
CREATE INDEX "inventory_transactions_referenceType_referenceId_idx" ON "inventory_transactions"("referenceType", "referenceId");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_investigatorId_fkey" FOREIGN KEY ("investigatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "risks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objective_progress" ADD CONSTRAINT "objective_progress_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "risks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_legalRequirementId_fkey" FOREIGN KEY ("legalRequirementId") REFERENCES "legal_requirements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "objectives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_aiAnalysisId_fkey" FOREIGN KEY ("aiAnalysisId") REFERENCES "ai_analyses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "training_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "five_why_analyses" ADD CONSTRAINT "five_why_analyses_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fishbone_analyses" ADD CONSTRAINT "fishbone_analyses_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pareto_analyses" ADD CONSTRAINT "pareto_analyses_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bow_tie_analyses" ADD CONSTRAINT "bow_tie_analyses_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "risks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "risks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
