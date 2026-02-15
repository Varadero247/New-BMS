/*
  Warnings:

  - A unique constraint covering the columns `[referenceNumber]` on the table `risks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'DOMESTIC_PARTNERSHIP');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERN', 'CONSULTANT', 'FREELANCE');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'PROBATION', 'NOTICE_PERIOD', 'TERMINATED', 'RETIRED');

-- CreateEnum
CREATE TYPE "PayFrequency" AS ENUM ('WEEKLY', 'BI_WEEKLY', 'SEMI_MONTHLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY');

-- CreateEnum
CREATE TYPE "ClockMethod" AS ENUM ('MANUAL', 'BIOMETRIC', 'CARD_SWIPE', 'MOBILE_APP', 'WEB_PORTAL', 'FACIAL_RECOGNITION');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'WEEKEND', 'WORK_FROM_HOME', 'LATE');

-- CreateEnum
CREATE TYPE "LeaveCategory" AS ENUM ('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT', 'UNPAID', 'COMPENSATORY', 'STUDY', 'SABBATICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "LeaveRequestStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'PARTIALLY_APPROVED');

-- CreateEnum
CREATE TYPE "HalfDayPeriod" AS ENUM ('FIRST_HALF', 'SECOND_HALF');

-- CreateEnum
CREATE TYPE "AccrualType" AS ENUM ('ANNUAL', 'MONTHLY', 'PRORATED', 'MILESTONE');

-- CreateEnum
CREATE TYPE "HolidayType" AS ENUM ('PUBLIC', 'COMPANY', 'OPTIONAL', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "PerformanceCycleType" AS ENUM ('ANNUAL', 'SEMI_ANNUAL', 'QUARTERLY', 'CONTINUOUS');

-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('DRAFT', 'GOAL_SETTING', 'IN_PROGRESS', 'REVIEW_PERIOD', 'CALIBRATION', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('ANNUAL', 'MID_YEAR', 'QUARTERLY', 'PROBATION', 'PROJECT_END', 'AD_HOC');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'SELF_ASSESSMENT', 'MANAGER_REVIEW', 'CALIBRATION', 'ACKNOWLEDGED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "GoalCategory" AS ENUM ('PERFORMANCE', 'DEVELOPMENT', 'BEHAVIORAL', 'STRATEGIC', 'OPERATIONAL');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'AT_RISK', 'COMPLETED', 'EXCEEDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('PEER', 'DIRECT_REPORT', 'SKIP_LEVEL', 'EXTERNAL', 'SELF');

-- CreateEnum
CREATE TYPE "JobPostingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ON_HOLD', 'CLOSED', 'FILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RemoteType" AS ENUM ('FULLY_REMOTE', 'HYBRID', 'OCCASIONAL');

-- CreateEnum
CREATE TYPE "ApplicationSource" AS ENUM ('WEBSITE', 'LINKEDIN', 'INDEED', 'GLASSDOOR', 'REFERRAL', 'AGENCY', 'CAMPUS', 'INTERNAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('NEW', 'SCREENING', 'SHORTLISTED', 'INTERVIEWING', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "RecruitmentStage" AS ENUM ('APPLICATION', 'SCREENING', 'PHONE_INTERVIEW', 'TECHNICAL_ROUND', 'HR_ROUND', 'FINAL_ROUND', 'OFFER', 'BACKGROUND_CHECK', 'ONBOARDING');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('PHONE', 'VIDEO', 'IN_PERSON', 'TECHNICAL', 'BEHAVIORAL', 'PANEL', 'CASE_STUDY');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "HiringRecommendation" AS ENUM ('STRONG_HIRE', 'HIRE', 'MAYBE', 'NO_HIRE', 'STRONG_NO_HIRE');

-- CreateEnum
CREATE TYPE "EmployeeDocumentType" AS ENUM ('CONTRACT', 'OFFER_LETTER', 'NDA', 'POLICY_ACKNOWLEDGMENT', 'ID_PROOF', 'ADDRESS_PROOF', 'EDUCATION_CERTIFICATE', 'EXPERIENCE_LETTER', 'BACKGROUND_CHECK', 'MEDICAL_CERTIFICATE', 'TAX_FORM', 'BANK_DETAILS', 'PERFORMANCE_LETTER', 'WARNING_LETTER', 'TERMINATION_LETTER', 'OTHER');

-- CreateEnum
CREATE TYPE "QualificationType" AS ENUM ('HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'DIPLOMA', 'CERTIFICATE', 'PROFESSIONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "CertificationStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'RENEWAL_PENDING', 'REVOKED');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('LAPTOP', 'DESKTOP', 'MOBILE', 'TABLET', 'MONITOR', 'KEYBOARD', 'MOUSE', 'HEADSET', 'ID_CARD', 'ACCESS_CARD', 'PARKING_PASS', 'FURNITURE', 'VEHICLE', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED', 'LOST');

-- CreateEnum
CREATE TYPE "DisciplinaryCategory" AS ENUM ('ATTENDANCE', 'PERFORMANCE', 'MISCONDUCT', 'POLICY_VIOLATION', 'HARASSMENT', 'SAFETY_VIOLATION', 'THEFT', 'FRAUD', 'OTHER');

-- CreateEnum
CREATE TYPE "DisciplinarySeverity" AS ENUM ('MINOR', 'MODERATE', 'SERIOUS', 'GROSS');

-- CreateEnum
CREATE TYPE "DisciplinaryActionType" AS ENUM ('VERBAL_WARNING', 'WRITTEN_WARNING', 'FINAL_WARNING', 'SUSPENSION', 'DEMOTION', 'TERMINATION', 'PROBATION');

-- CreateEnum
CREATE TYPE "DisciplinaryStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'PENDING_ACTION', 'ACTION_TAKEN', 'APPEAL_PENDING', 'CLOSED');

-- CreateEnum
CREATE TYPE "TrainingSessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ENROLLED', 'WAITLISTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "SalaryChangeType" AS ENUM ('PROMOTION', 'ANNUAL_INCREMENT', 'ADJUSTMENT', 'DEMOTION', 'TRANSFER', 'CORRECTION', 'INITIAL');

-- CreateEnum
CREATE TYPE "ComponentCategory" AS ENUM ('BASIC', 'ALLOWANCE', 'BONUS', 'COMMISSION', 'OVERTIME', 'REIMBURSEMENT', 'STATUTORY', 'DEDUCTION', 'OTHER');

-- CreateEnum
CREATE TYPE "ComponentType" AS ENUM ('EARNING', 'DEDUCTION');

-- CreateEnum
CREATE TYPE "ComponentCalculationType" AS ENUM ('FIXED', 'PERCENTAGE_OF_BASIC', 'PERCENTAGE_OF_GROSS', 'FORMULA', 'ATTENDANCE_BASED');

-- CreateEnum
CREATE TYPE "PayrollRunStatus" AS ENUM ('DRAFT', 'CALCULATING', 'CALCULATED', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'ERROR');

-- CreateEnum
CREATE TYPE "PayslipStatus" AS ENUM ('DRAFT', 'GENERATED', 'PUBLISHED', 'VOID');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CHECK', 'CASH', 'DIRECT_DEPOSIT', 'MOBILE_WALLET');

-- CreateEnum
CREATE TYPE "BenefitCategory" AS ENUM ('HEALTH_INSURANCE', 'LIFE_INSURANCE', 'DENTAL', 'VISION', 'RETIREMENT', 'PENSION', 'HSA', 'FSA', 'TRANSPORTATION', 'WELLNESS', 'OTHER');

-- CreateEnum
CREATE TYPE "BenefitStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'TERMINATED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CoverageLevel" AS ENUM ('EMPLOYEE_ONLY', 'EMPLOYEE_SPOUSE', 'EMPLOYEE_CHILDREN', 'FAMILY');

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('SALARY_ADVANCE', 'PERSONAL_LOAN', 'EMERGENCY_LOAN', 'HOUSING_LOAN', 'VEHICLE_LOAN', 'EDUCATION_LOAN', 'OTHER');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DISBURSED', 'ACTIVE', 'COMPLETED', 'DEFAULTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RepaymentStatus" AS ENUM ('PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'WAIVED');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('TRAVEL', 'MEALS', 'ACCOMMODATION', 'TRANSPORTATION', 'OFFICE_SUPPLIES', 'SOFTWARE', 'HARDWARE', 'TRAINING', 'COMMUNICATION', 'CLIENT_ENTERTAINMENT', 'MISCELLANEOUS');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REIMBURSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExpenseReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReimbursementStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TaxFilingType" AS ENUM ('WITHHOLDING', 'QUARTERLY', 'ANNUAL', 'AMENDMENT', 'SOCIAL_SECURITY', 'MEDICARE', 'STATE', 'LOCAL');

-- CreateEnum
CREATE TYPE "TaxFilingStatus" AS ENUM ('PENDING', 'PREPARED', 'REVIEWED', 'FILED', 'ACCEPTED', 'REJECTED', 'AMENDED');

-- CreateEnum
CREATE TYPE "WorkflowCategory" AS ENUM ('HR', 'FINANCE', 'OPERATIONS', 'QUALITY', 'SAFETY', 'PROCUREMENT', 'SALES', 'CUSTOMER_SERVICE', 'IT', 'COMPLIANCE', 'GENERAL');

-- CreateEnum
CREATE TYPE "IndustryType" AS ENUM ('MANUFACTURING', 'HEALTHCARE', 'CONSTRUCTION', 'RETAIL', 'FINANCE', 'TECHNOLOGY', 'EDUCATION', 'HOSPITALITY', 'LOGISTICS', 'ENERGY', 'PHARMACEUTICAL', 'AUTOMOTIVE', 'AEROSPACE', 'FOOD_BEVERAGE', 'GENERAL');

-- CreateEnum
CREATE TYPE "WorkflowComplexity" AS ENUM ('SIMPLE', 'MEDIUM', 'COMPLEX');

-- CreateEnum
CREATE TYPE "WorkflowDefinitionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DEPRECATED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WorkflowTriggerType" AS ENUM ('MANUAL', 'AUTOMATIC', 'SCHEDULED', 'EVENT', 'API');

-- CreateEnum
CREATE TYPE "WorkflowInstanceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'WAITING_APPROVAL', 'PAUSED', 'COMPLETED', 'CANCELLED', 'ERROR', 'EXPIRED');

-- CreateEnum
CREATE TYPE "WorkflowPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "WorkflowOutcome" AS ENUM ('APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'ERROR');

-- CreateEnum
CREATE TYPE "WorkflowStepType" AS ENUM ('START', 'END', 'TASK', 'APPROVAL', 'DECISION', 'PARALLEL_GATEWAY', 'EXCLUSIVE_GATEWAY', 'NOTIFICATION', 'AUTOMATION', 'SUBPROCESS', 'TIMER');

-- CreateEnum
CREATE TYPE "WorkflowStepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'CANCELLED', 'ERROR');

-- CreateEnum
CREATE TYPE "AssigneeType" AS ENUM ('USER', 'ROLE', 'DEPARTMENT', 'MANAGER', 'INITIATOR', 'DYNAMIC');

-- CreateEnum
CREATE TYPE "WorkflowTaskType" AS ENUM ('REVIEW', 'APPROVE', 'COMPLETE_FORM', 'UPLOAD_DOCUMENT', 'VERIFICATION', 'DATA_ENTRY', 'NOTIFICATION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "WorkflowTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "WorkflowRuleType" AS ENUM ('ROUTING', 'ASSIGNMENT', 'VALIDATION', 'AUTOMATION', 'NOTIFICATION', 'ESCALATION');

-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('EXPRESSION', 'SCRIPT', 'COMPARISON', 'ALWAYS');

-- CreateEnum
CREATE TYPE "WorkflowActionType" AS ENUM ('ASSIGN', 'NOTIFY', 'UPDATE_FIELD', 'CALL_API', 'EXECUTE_SCRIPT', 'ROUTE', 'ESCALATE', 'CANCEL');

-- CreateEnum
CREATE TYPE "ApprovalChainType" AS ENUM ('SEQUENTIAL', 'PARALLEL', 'HIERARCHICAL', 'DYNAMIC');

-- CreateEnum
CREATE TYPE "EscalationReason" AS ENUM ('SLA_BREACH', 'DEADLINE_APPROACHING', 'NO_RESPONSE', 'MANUAL', 'REJECTION', 'ERROR');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TASK_ASSIGNED', 'APPROVAL_REQUIRED', 'TASK_COMPLETED', 'WORKFLOW_COMPLETED', 'DEADLINE_REMINDER', 'ESCALATION', 'STATUS_UPDATE', 'COMMENT_ADDED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'IN_APP', 'PUSH', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ');

-- CreateEnum
CREATE TYPE "AutomationTriggerType" AS ENUM ('EVENT', 'SCHEDULED', 'CONDITION', 'WORKFLOW_EVENT', 'API', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "AutomationActionType" AS ENUM ('CREATE_WORKFLOW', 'UPDATE_ENTITY', 'SEND_NOTIFICATION', 'CALL_WEBHOOK', 'EXECUTE_SCRIPT', 'ASSIGN_TASK', 'ESCALATE', 'UPDATE_STATUS', 'GENERATE_REPORT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AutomationExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'RETRYING', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "ApprovalRequestType" AS ENUM ('DOCUMENT_APPROVAL', 'PURCHASE_REQUEST', 'LEAVE_REQUEST', 'EXPENSE_CLAIM', 'CHANGE_REQUEST', 'ACCESS_REQUEST', 'POLICY_EXCEPTION', 'BUDGET_APPROVAL', 'CONTRACT_APPROVAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ApprovalRequestStatus" AS ENUM ('DRAFT', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "ApprovalOutcome" AS ENUM ('APPROVED', 'REJECTED', 'APPROVED_WITH_CONDITIONS', 'PARTIALLY_APPROVED', 'CANCELLED', 'EXPIRED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ApprovalDecision" ADD VALUE 'APPROVE';
ALTER TYPE "ApprovalDecision" ADD VALUE 'REJECT';
ALTER TYPE "ApprovalDecision" ADD VALUE 'REQUEST_CHANGES';
ALTER TYPE "ApprovalDecision" ADD VALUE 'DELEGATE';
ALTER TYPE "ApprovalDecision" ADD VALUE 'ABSTAIN';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ApprovalStatus" ADD VALUE 'DELEGATED';
ALTER TYPE "ApprovalStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DeliveryMethod" ADD VALUE 'VIRTUAL';
ALTER TYPE "DeliveryMethod" ADD VALUE 'E_LEARNING';
ALTER TYPE "DeliveryMethod" ADD VALUE 'WORKSHOP';
ALTER TYPE "DeliveryMethod" ADD VALUE 'SEMINAR';
ALTER TYPE "DeliveryMethod" ADD VALUE 'EMAIL';
ALTER TYPE "DeliveryMethod" ADD VALUE 'PORTAL';
ALTER TYPE "DeliveryMethod" ADD VALUE 'PRINT';
ALTER TYPE "DeliveryMethod" ADD VALUE 'IN_PERSON';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentStatus" ADD VALUE 'PENDING_REVIEW';
ALTER TYPE "DocumentStatus" ADD VALUE 'REJECTED';
ALTER TYPE "DocumentStatus" ADD VALUE 'EFFECTIVE';
ALTER TYPE "DocumentStatus" ADD VALUE 'ARCHIVED';
ALTER TYPE "DocumentStatus" ADD VALUE 'ACTIVE';
ALTER TYPE "DocumentStatus" ADD VALUE 'EXPIRED';
ALTER TYPE "DocumentStatus" ADD VALUE 'PENDING_VERIFICATION';
ALTER TYPE "DocumentStatus" ADD VALUE 'VERIFIED';

-- Allow new enum values to be committed before use
COMMIT;
BEGIN;


-- AlterTable
ALTER TABLE "risks" ADD COLUMN     "aiControlAdministrative" TEXT,
ADD COLUMN     "aiControlElimination" TEXT,
ADD COLUMN     "aiControlEngineering" TEXT,
ADD COLUMN     "aiControlPPE" TEXT,
ADD COLUMN     "aiControlSubstitution" TEXT,
ADD COLUMN     "aiControlsGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "initialLikelihood" INTEGER,
ADD COLUMN     "initialRiskLevel" "RiskLevel",
ADD COLUMN     "initialRiskScore" INTEGER,
ADD COLUMN     "initialSeverity" INTEGER,
ADD COLUMN     "legalReference" TEXT,
ADD COLUMN     "referenceNumber" TEXT,
ADD COLUMN     "residualLikelihood" INTEGER,
ADD COLUMN     "residualRiskLevel" "RiskLevel",
ADD COLUMN     "residualRiskScore" INTEGER,
ADD COLUMN     "residualSeverity" INTEGER,
ADD COLUMN     "riskOwner" TEXT,
ADD COLUMN     "whoAtRisk" TEXT;

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_employees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeNumber" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "nationalId" TEXT,
    "nationality" TEXT,
    "maritalStatus" "MaritalStatus",
    "bloodGroup" TEXT,
    "personalEmail" TEXT,
    "workEmail" TEXT NOT NULL,
    "phone" TEXT,
    "mobilePhone" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "currentAddress" TEXT,
    "permanentAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "departmentId" UUID NOT NULL,
    "positionId" UUID,
    "managerId" UUID,
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "hireDate" TIMESTAMP(3) NOT NULL,
    "confirmationDate" TIMESTAMP(3),
    "terminationDate" TIMESTAMP(3),
    "terminationReason" TEXT,
    "jobTitle" TEXT NOT NULL,
    "jobGrade" TEXT,
    "workLocation" TEXT,
    "costCenter" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "payFrequency" "PayFrequency" NOT NULL DEFAULT 'MONTHLY',
    "bankName" TEXT,
    "bankBranch" TEXT,
    "accountNumber" TEXT,
    "accountName" TEXT,
    "routingNumber" TEXT,
    "profilePhoto" TEXT,
    "signatureFile" TEXT,
    "probationPeriod" INTEGER,
    "probationEndDate" TIMESTAMP(3),
    "shiftId" UUID,
    "workHoursPerWeek" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "hr_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_departments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" UUID,
    "headId" UUID,
    "costCenter" TEXT,
    "budget" DOUBLE PRECISION,
    "budgetCurrency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_positions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" UUID NOT NULL,
    "jobGrade" TEXT,
    "minSalary" DOUBLE PRECISION,
    "maxSalary" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "headcount" INTEGER NOT NULL DEFAULT 1,
    "filledCount" INTEGER NOT NULL DEFAULT 0,
    "requirements" TEXT,
    "responsibilities" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_work_shifts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "breakDuration" INTEGER NOT NULL DEFAULT 60,
    "workingHours" DOUBLE PRECISION NOT NULL,
    "monday" BOOLEAN NOT NULL DEFAULT true,
    "tuesday" BOOLEAN NOT NULL DEFAULT true,
    "wednesday" BOOLEAN NOT NULL DEFAULT true,
    "thursday" BOOLEAN NOT NULL DEFAULT true,
    "friday" BOOLEAN NOT NULL DEFAULT true,
    "saturday" BOOLEAN NOT NULL DEFAULT false,
    "sunday" BOOLEAN NOT NULL DEFAULT false,
    "overtimeThreshold" DOUBLE PRECISION,
    "overtimeMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isNightShift" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_work_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_attendances" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "shiftId" UUID,
    "clockIn" TIMESTAMP(3),
    "clockOut" TIMESTAMP(3),
    "clockInLocation" TEXT,
    "clockOutLocation" TEXT,
    "clockInMethod" "ClockMethod",
    "clockOutMethod" "ClockMethod",
    "scheduledHours" DOUBLE PRECISION,
    "workedHours" DOUBLE PRECISION,
    "overtimeHours" DOUBLE PRECISION,
    "breakDuration" INTEGER,
    "lateMinutes" INTEGER NOT NULL DEFAULT 0,
    "earlyDepartureMin" INTEGER NOT NULL DEFAULT 0,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "holidayName" TEXT,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvalNotes" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_timesheet_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attendanceId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "projectCode" TEXT,
    "projectName" TEXT,
    "taskDescription" TEXT NOT NULL,
    "category" TEXT,
    "hours" DOUBLE PRECISION NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "isBillable" BOOLEAN NOT NULL DEFAULT false,
    "billingRate" DOUBLE PRECISION,
    "billingCurrency" TEXT NOT NULL DEFAULT 'USD',
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_timesheet_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_leave_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "LeaveCategory" NOT NULL,
    "color" TEXT,
    "defaultDaysPerYear" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxCarryForward" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxAccumulation" DOUBLE PRECISION,
    "minServiceDays" INTEGER NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "requiresDocument" BOOLEAN NOT NULL DEFAULT false,
    "allowHalfDay" BOOLEAN NOT NULL DEFAULT true,
    "allowNegative" BOOLEAN NOT NULL DEFAULT false,
    "encashable" BOOLEAN NOT NULL DEFAULT false,
    "applicableGenders" "Gender"[],
    "minNoticeDays" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_leave_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_leave_balances" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "leaveTypeId" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "entitled" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carryForward" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adjustment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taken" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pending" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "encashed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_leave_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requestNumber" TEXT NOT NULL,
    "employeeId" UUID NOT NULL,
    "leaveTypeId" UUID NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "days" DOUBLE PRECISION NOT NULL,
    "isHalfDay" BOOLEAN NOT NULL DEFAULT false,
    "halfDayPeriod" "HalfDayPeriod",
    "reason" TEXT,
    "contactDuring" TEXT,
    "emergencyPhone" TEXT,
    "handoverToId" UUID,
    "handoverNotes" TEXT,
    "attachments" JSONB,
    "status" "LeaveRequestStatus" NOT NULL DEFAULT 'PENDING',
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "currentApprovalStep" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_leave_approvals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leaveRequestId" UUID NOT NULL,
    "approverEmployeeId" UUID NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 1,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "decision" "ApprovalDecision",
    "decidedAt" TIMESTAMP(3),
    "comments" TEXT,
    "delegatedFromId" UUID,
    "delegatedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_leave_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_leave_policy_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leaveTypeId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minServiceMonths" INTEGER,
    "maxServiceMonths" INTEGER,
    "employmentTypes" "EmploymentType"[],
    "departments" TEXT[],
    "jobGrades" TEXT[],
    "daysPerYear" DOUBLE PRECISION NOT NULL,
    "accrualType" "AccrualType" NOT NULL DEFAULT 'ANNUAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_leave_policy_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_holidays" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "year" INTEGER NOT NULL,
    "type" "HolidayType" NOT NULL,
    "isFloating" BOOLEAN NOT NULL DEFAULT false,
    "applicableLocations" TEXT[],
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_performance_cycles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "cycleType" "PerformanceCycleType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "goalSettingStart" TIMESTAMP(3),
    "goalSettingEnd" TIMESTAMP(3),
    "midYearReviewStart" TIMESTAMP(3),
    "midYearReviewEnd" TIMESTAMP(3),
    "annualReviewStart" TIMESTAMP(3),
    "annualReviewEnd" TIMESTAMP(3),
    "ratingScale" INTEGER NOT NULL DEFAULT 5,
    "ratingLabels" JSONB,
    "status" "CycleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_performance_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_performance_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cycleId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "reviewerId" UUID NOT NULL,
    "reviewType" "ReviewType" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "selfAssessment" TEXT,
    "selfRating" INTEGER,
    "selfRatingDate" TIMESTAMP(3),
    "managerAssessment" TEXT,
    "managerRating" INTEGER,
    "managerRatingDate" TIMESTAMP(3),
    "competencyRatings" JSONB,
    "goalsAchievement" DOUBLE PRECISION,
    "goalsNotes" TEXT,
    "overallRating" INTEGER,
    "overallComments" TEXT,
    "strengths" TEXT,
    "improvementAreas" TEXT,
    "developmentPlan" TEXT,
    "calibratedRating" INTEGER,
    "calibrationNotes" TEXT,
    "calibratedById" TEXT,
    "calibratedAt" TIMESTAMP(3),
    "employeeAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "employeeComments" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_performance_goals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cycleId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "GoalCategory" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "measurementCriteria" TEXT NOT NULL,
    "targetValue" TEXT,
    "actualValue" TEXT,
    "unit" TEXT,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "GoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "selfRating" INTEGER,
    "managerRating" INTEGER,
    "finalRating" INTEGER,
    "ratingComments" TEXT,
    "alignedToObjective" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_performance_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_goal_updates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "goalId" UUID NOT NULL,
    "updatedById" TEXT NOT NULL,
    "progressBefore" DOUBLE PRECISION NOT NULL,
    "progressAfter" DOUBLE PRECISION NOT NULL,
    "updateNotes" TEXT NOT NULL,
    "evidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hr_goal_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_performance_feedbacks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reviewId" UUID NOT NULL,
    "feedbackType" "FeedbackType" NOT NULL,
    "providerId" TEXT NOT NULL,
    "relationship" TEXT,
    "ratings" JSONB,
    "strengths" TEXT,
    "improvements" TEXT,
    "additionalComments" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_performance_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_job_postings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "jobCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "departmentId" UUID NOT NULL,
    "positionId" UUID,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "preferredSkills" TEXT,
    "benefits" TEXT,
    "employmentType" "EmploymentType" NOT NULL,
    "experienceMin" INTEGER,
    "experienceMax" INTEGER,
    "educationLevel" TEXT,
    "location" TEXT NOT NULL,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "remoteType" "RemoteType",
    "salaryMin" DOUBLE PRECISION,
    "salaryMax" DOUBLE PRECISION,
    "salaryCurrency" TEXT NOT NULL DEFAULT 'USD',
    "salaryPeriod" "PayFrequency" NOT NULL DEFAULT 'MONTHLY',
    "showSalary" BOOLEAN NOT NULL DEFAULT false,
    "openings" INTEGER NOT NULL DEFAULT 1,
    "filled" INTEGER NOT NULL DEFAULT 0,
    "status" "JobPostingStatus" NOT NULL DEFAULT 'DRAFT',
    "publishDate" TIMESTAMP(3),
    "closeDate" TIMESTAMP(3),
    "internalOnly" BOOLEAN NOT NULL DEFAULT false,
    "hiringManagerId" TEXT,
    "recruiterId" TEXT,
    "postingChannels" TEXT[],
    "applicationUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "hr_job_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_applicants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "applicantNumber" TEXT NOT NULL,
    "jobPostingId" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "linkedinUrl" TEXT,
    "coverLetter" TEXT,
    "resumeUrl" TEXT,
    "portfolioUrl" TEXT,
    "source" "ApplicationSource" NOT NULL,
    "referredBy" TEXT,
    "currentCompany" TEXT,
    "currentTitle" TEXT,
    "yearsExperience" INTEGER,
    "noticePeriod" INTEGER,
    "expectedSalary" DOUBLE PRECISION,
    "salaryCurrency" TEXT NOT NULL DEFAULT 'USD',
    "screeningScore" INTEGER,
    "screeningNotes" TEXT,
    "status" "ApplicantStatus" NOT NULL DEFAULT 'NEW',
    "stage" "RecruitmentStage" NOT NULL DEFAULT 'APPLICATION',
    "rejectionReason" TEXT,
    "assessmentScores" JSONB,
    "offerExtended" TIMESTAMP(3),
    "offerAccepted" TIMESTAMP(3),
    "offerRejected" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_applicants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_interviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "applicantId" UUID NOT NULL,
    "jobPostingId" UUID NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "interviewType" "InterviewType" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "location" TEXT,
    "meetingUrl" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "interviewerIds" TEXT[],
    "organizerId" TEXT NOT NULL,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "cancelledReason" TEXT,
    "agenda" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_interview_evaluations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "interviewId" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "technicalRating" INTEGER,
    "communicationRating" INTEGER,
    "cultureFitRating" INTEGER,
    "leadershipRating" INTEGER,
    "strengths" TEXT,
    "concerns" TEXT,
    "additionalNotes" TEXT,
    "recommendation" "HiringRecommendation" NOT NULL,
    "recommendedSalary" DOUBLE PRECISION,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hr_interview_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_employee_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "documentType" "EmployeeDocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "previousVersionId" UUID,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "issuingAuthority" TEXT,
    "documentNumber" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "requiresSignature" BOOLEAN NOT NULL DEFAULT false,
    "signedAt" TIMESTAMP(3),
    "signatureUrl" TEXT,
    "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    "accessRoles" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "hr_employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_employee_qualifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "qualificationType" "QualificationType" NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT,
    "fieldOfStudy" TEXT,
    "grade" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isOngoing" BOOLEAN NOT NULL DEFAULT false,
    "documentUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_employee_qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_employee_certifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "issuingOrganization" TEXT NOT NULL,
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "doesNotExpire" BOOLEAN NOT NULL DEFAULT false,
    "renewalRequired" BOOLEAN NOT NULL DEFAULT false,
    "renewalReminderDays" INTEGER,
    "certificateUrl" TEXT,
    "status" "CertificationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_employee_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_employee_assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "assetTag" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "serialNumber" TEXT,
    "model" TEXT,
    "manufacturer" TEXT,
    "assignedDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3),
    "returnCondition" TEXT,
    "purchaseValue" DOUBLE PRECISION,
    "currentValue" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "condition" "AssetCondition" NOT NULL DEFAULT 'GOOD',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_employee_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_disciplinary_actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "incidentDescription" TEXT NOT NULL,
    "category" "DisciplinaryCategory" NOT NULL,
    "severity" "DisciplinarySeverity" NOT NULL,
    "investigatorId" TEXT,
    "investigationNotes" TEXT,
    "witnessStatements" JSONB,
    "actionType" "DisciplinaryActionType" NOT NULL,
    "actionDescription" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "appealSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "appealDate" TIMESTAMP(3),
    "appealOutcome" TEXT,
    "status" "DisciplinaryStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "hr_disciplinary_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_training_courses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "provider" TEXT,
    "instructorName" TEXT,
    "deliveryMethod" "DeliveryMethod" NOT NULL,
    "duration" INTEGER NOT NULL,
    "maxParticipants" INTEGER,
    "prerequisites" TEXT[],
    "objectives" TEXT,
    "syllabus" TEXT,
    "certificationAwarded" BOOLEAN NOT NULL DEFAULT false,
    "certificationValidity" INTEGER,
    "costPerPerson" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "materialsUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_training_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_training_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "courseId" UUID NOT NULL,
    "sessionCode" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "meetingUrl" TEXT,
    "instructorId" TEXT,
    "instructorName" TEXT,
    "maxParticipants" INTEGER NOT NULL,
    "enrolledCount" INTEGER NOT NULL DEFAULT 0,
    "waitlistCount" INTEGER NOT NULL DEFAULT 0,
    "status" "TrainingSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "cancelledReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_training_enrollments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "sessionId" UUID,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "attendancePercent" DOUBLE PRECISION,
    "assessmentScore" DOUBLE PRECISION,
    "assessmentDate" TIMESTAMP(3),
    "passed" BOOLEAN,
    "certificateIssued" BOOLEAN NOT NULL DEFAULT false,
    "certificateUrl" TEXT,
    "certificateExpiry" TIMESTAMP(3),
    "feedbackRating" INTEGER,
    "feedbackComments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_training_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_employee_salaries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "payFrequency" "PayFrequency" NOT NULL DEFAULT 'MONTHLY',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "previousSalary" DOUBLE PRECISION,
    "changeReason" TEXT,
    "changeType" "SalaryChangeType",
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "payroll_employee_salaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_salary_components" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeSalaryId" UUID NOT NULL,
    "componentTypeId" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION,
    "calculationType" "ComponentCalculationType" NOT NULL DEFAULT 'FIXED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_salary_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_salary_component_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ComponentCategory" NOT NULL,
    "type" "ComponentType" NOT NULL,
    "isTaxable" BOOLEAN NOT NULL DEFAULT true,
    "taxCategory" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "isStatutory" BOOLEAN NOT NULL DEFAULT false,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "defaultCalculationType" "ComponentCalculationType" NOT NULL DEFAULT 'FIXED',
    "defaultPercentage" DOUBLE PRECISION,
    "showInPayslip" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_salary_component_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "runNumber" TEXT NOT NULL,
    "companyId" TEXT,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "payDate" DATE NOT NULL,
    "payFrequency" "PayFrequency" NOT NULL,
    "totalEmployees" INTEGER NOT NULL DEFAULT 0,
    "processedEmployees" INTEGER NOT NULL DEFAULT 0,
    "errorEmployees" INTEGER NOT NULL DEFAULT 0,
    "totalGross" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalNet" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEmployerCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PayrollRunStatus" NOT NULL DEFAULT 'DRAFT',
    "lockedAt" TIMESTAMP(3),
    "lockedById" TEXT,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentDate" TIMESTAMP(3),
    "paymentReference" TEXT,
    "bankFileGenerated" BOOLEAN NOT NULL DEFAULT false,
    "bankFileUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "payroll_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_payslips" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payslipNumber" TEXT NOT NULL,
    "payrollRunId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "payDate" DATE NOT NULL,
    "employeeName" TEXT NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "department" TEXT,
    "position" TEXT,
    "bankAccount" TEXT,
    "workingDays" DOUBLE PRECISION NOT NULL,
    "paidDays" DOUBLE PRECISION NOT NULL,
    "leaveDays" DOUBLE PRECISION NOT NULL,
    "unpaidLeaveDays" DOUBLE PRECISION NOT NULL,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "grossEarnings" DOUBLE PRECISION NOT NULL,
    "totalDeductions" DOUBLE PRECISION NOT NULL,
    "statutoryDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "voluntaryDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netPay" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "taxableIncome" DOUBLE PRECISION NOT NULL,
    "incomeTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "yearToDateEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "yearToDateTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "PayslipStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "viewedByEmployee" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3),
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_payslips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_payslip_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payslipId" UUID NOT NULL,
    "componentTypeId" UUID,
    "category" "ComponentCategory" NOT NULL,
    "type" "ComponentType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "rate" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION NOT NULL,
    "isTaxable" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_payslip_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_employee_benefits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "benefitPlanId" UUID NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL,
    "terminationDate" TIMESTAMP(3),
    "status" "BenefitStatus" NOT NULL DEFAULT 'ACTIVE',
    "coverageLevel" "CoverageLevel" NOT NULL,
    "dependents" JSONB,
    "employeeContribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "employerContribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contributionFrequency" "PayFrequency" NOT NULL DEFAULT 'MONTHLY',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_employee_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_benefit_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "BenefitCategory" NOT NULL,
    "provider" TEXT,
    "coverageLevels" "CoverageLevel"[],
    "dependentsCoverage" BOOLEAN NOT NULL DEFAULT false,
    "employeeContribution" DOUBLE PRECISION,
    "employerContribution" DOUBLE PRECISION,
    "contributionType" "ComponentCalculationType" NOT NULL DEFAULT 'FIXED',
    "eligibilityRules" JSONB,
    "waitingPeriodDays" INTEGER NOT NULL DEFAULT 0,
    "planDocumentUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_benefit_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_employee_loans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "loanNumber" TEXT NOT NULL,
    "employeeId" UUID NOT NULL,
    "loanType" "LoanType" NOT NULL,
    "principalAmount" DOUBLE PRECISION NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "termMonths" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "installmentAmount" DOUBLE PRECISION NOT NULL,
    "paymentFrequency" "PayFrequency" NOT NULL DEFAULT 'MONTHLY',
    "disbursedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "repaidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingBalance" DOUBLE PRECISION NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "disbursedAt" TIMESTAMP(3),
    "purpose" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_employee_loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_loan_repayments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "loanId" UUID NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "dueDate" DATE NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "principal" DOUBLE PRECISION NOT NULL,
    "interest" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidDate" TIMESTAMP(3),
    "paymentMethod" "PaymentMethod",
    "payrollRunId" TEXT,
    "status" "RepaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_loan_repayments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_expenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "expenseNumber" TEXT NOT NULL,
    "employeeId" UUID NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "subcategory" TEXT,
    "description" TEXT NOT NULL,
    "merchant" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "amountInBaseCurrency" DOUBLE PRECISION NOT NULL,
    "expenseDate" DATE NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptUrls" TEXT[],
    "hasReceipt" BOOLEAN NOT NULL DEFAULT false,
    "projectCode" TEXT,
    "costCenter" TEXT,
    "isBillable" BOOLEAN NOT NULL DEFAULT false,
    "clientName" TEXT,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'DRAFT',
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvalNotes" TEXT,
    "reimbursementStatus" "ReimbursementStatus" NOT NULL DEFAULT 'PENDING',
    "reimbursedAt" TIMESTAMP(3),
    "reimbursementMethod" "PaymentMethod",
    "payrollRunId" TEXT,
    "policyViolation" BOOLEAN NOT NULL DEFAULT false,
    "violationNotes" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reportId" UUID,

    CONSTRAINT "payroll_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_expense_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reportNumber" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "expenseCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ExpenseReportStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_expense_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_tax_filings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payrollRunId" UUID,
    "filingType" "TaxFilingType" NOT NULL,
    "taxPeriod" TEXT NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "grossWages" DOUBLE PRECISION NOT NULL,
    "taxableWages" DOUBLE PRECISION NOT NULL,
    "taxWithheld" DOUBLE PRECISION NOT NULL,
    "employerTax" DOUBLE PRECISION NOT NULL,
    "totalTax" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "filingDeadline" TIMESTAMP(3) NOT NULL,
    "filedAt" TIMESTAMP(3),
    "filedById" TEXT,
    "confirmationNumber" TEXT,
    "paymentDue" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "paymentReference" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "filingDocumentUrl" TEXT,
    "supportingDocs" TEXT[],
    "status" "TaxFilingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_tax_filings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_tax_brackets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "taxYear" INTEGER NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "filingStatus" TEXT,
    "minIncome" DOUBLE PRECISION NOT NULL,
    "maxIncome" DOUBLE PRECISION,
    "rate" DOUBLE PRECISION NOT NULL,
    "fixedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_tax_brackets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "WorkflowCategory" NOT NULL,
    "industryType" "IndustryType",
    "version" INTEGER NOT NULL DEFAULT 1,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "estimatedDuration" INTEGER,
    "complexity" "WorkflowComplexity" NOT NULL DEFAULT 'MEDIUM',
    "requiredRoles" TEXT[],
    "icon" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "workflow_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_definitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "templateId" UUID,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "WorkflowDefinitionStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedVersion" INTEGER,
    "triggerType" "WorkflowTriggerType" NOT NULL,
    "triggerConfig" JSONB,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "variables" JSONB,
    "defaultSLA" INTEGER,
    "escalationRules" JSONB,
    "notificationConfig" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instanceNumber" TEXT NOT NULL,
    "definitionId" UUID NOT NULL,
    "initiatorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "priority" "WorkflowPriority" NOT NULL DEFAULT 'NORMAL',
    "variables" JSONB,
    "formData" JSONB,
    "status" "WorkflowInstanceStatus" NOT NULL DEFAULT 'PENDING',
    "currentNodeId" TEXT,
    "completedNodeIds" TEXT[],
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelledById" TEXT,
    "cancellationReason" TEXT,
    "dueDate" TIMESTAMP(3),
    "isOverdue" BOOLEAN NOT NULL DEFAULT false,
    "escalationLevel" INTEGER NOT NULL DEFAULT 0,
    "outcome" "WorkflowOutcome",
    "outcomeNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_step_instances" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instanceId" UUID NOT NULL,
    "nodeId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "stepType" "WorkflowStepType" NOT NULL,
    "description" TEXT,
    "assigneeType" "AssigneeType" NOT NULL,
    "assigneeId" TEXT,
    "assigneeRole" TEXT,
    "status" "WorkflowStepStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "action" TEXT,
    "actionData" JSONB,
    "comments" TEXT,
    "dueDate" TIMESTAMP(3),
    "isOverdue" BOOLEAN NOT NULL DEFAULT false,
    "parallelBranchId" TEXT,
    "isParallel" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_step_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_step_approvals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "stepInstanceId" UUID NOT NULL,
    "approverId" UUID NOT NULL,
    "approvalOrder" INTEGER NOT NULL DEFAULT 1,
    "decision" "ApprovalDecision",
    "decidedAt" TIMESTAMP(3),
    "comments" TEXT,
    "delegatedFromId" TEXT,
    "delegatedReason" TEXT,
    "reminderSentAt" TIMESTAMP(3),
    "reminderCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_step_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instanceId" UUID NOT NULL,
    "assigneeId" UUID NOT NULL,
    "taskNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskType" "WorkflowTaskType" NOT NULL,
    "priority" "WorkflowPriority" NOT NULL DEFAULT 'NORMAL',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "status" "WorkflowTaskStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "result" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "definitionId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleType" "WorkflowRuleType" NOT NULL,
    "condition" JSONB NOT NULL,
    "conditionType" "ConditionType" NOT NULL DEFAULT 'EXPRESSION',
    "action" JSONB NOT NULL,
    "actionType" "WorkflowActionType" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "stopOnMatch" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_approval_chains" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "definitionId" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "chainType" "ApprovalChainType" NOT NULL,
    "levels" JSONB NOT NULL,
    "skipConditions" JSONB,
    "escalationConfig" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_approval_chains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_escalations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instanceId" UUID NOT NULL,
    "level" INTEGER NOT NULL,
    "reason" "EscalationReason" NOT NULL,
    "escalatedFromId" TEXT,
    "escalatedToId" TEXT,
    "escalatedToRole" TEXT,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "notificationSentAt" TIMESTAMP(3),
    "notificationMethod" TEXT[],
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_escalations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instanceId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "actionBy" TEXT,
    "actionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nodeId" TEXT,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "details" JSONB,
    "comments" TEXT,

    CONSTRAINT "workflow_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instanceId" TEXT,
    "recipientId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "notificationType" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "templateId" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "triggerType" "AutomationTriggerType" NOT NULL,
    "triggerEvent" TEXT,
    "triggerSchedule" TEXT,
    "triggerCondition" JSONB,
    "actionType" "AutomationActionType" NOT NULL,
    "actionConfig" JSONB NOT NULL,
    "entityType" TEXT,
    "workflowCategory" "WorkflowCategory",
    "priority" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "retryDelaySeconds" INTEGER NOT NULL DEFAULT 60,
    "timeoutSeconds" INTEGER NOT NULL DEFAULT 300,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastExecutedAt" TIMESTAMP(3),
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_executions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ruleId" UUID NOT NULL,
    "triggeredBy" TEXT,
    "triggerType" "AutomationTriggerType" NOT NULL,
    "triggerData" JSONB,
    "entityType" TEXT,
    "entityId" TEXT,
    "status" "AutomationExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "result" JSONB,
    "output" TEXT,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "nextRetryAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requestNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requestType" "ApprovalRequestType" NOT NULL,
    "priority" "WorkflowPriority" NOT NULL DEFAULT 'NORMAL',
    "requesterId" UUID NOT NULL,
    "requesterName" TEXT,
    "departmentId" UUID,
    "entityType" TEXT,
    "entityId" TEXT,
    "entityData" JSONB,
    "approvalChainId" UUID,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "totalLevels" INTEGER NOT NULL DEFAULT 1,
    "status" "ApprovalRequestStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "outcome" "ApprovalOutcome",
    "outcomeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_responses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requestId" UUID NOT NULL,
    "approverId" UUID NOT NULL,
    "approverName" TEXT,
    "approverRole" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "decision" "ApprovalDecision" NOT NULL,
    "comments" TEXT,
    "conditions" TEXT,
    "delegatedFromId" UUID,
    "delegatedFromName" TEXT,
    "attachments" JSONB,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_signatures" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userFullName" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'password',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "e_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enhanced_audit_trail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userFullName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "resourceRef" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL DEFAULT '',
    "esignatureId" UUID,
    "systemVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "checksum" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enhanced_audit_trail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expiresAt_idx" ON "password_reset_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "hr_employees_employeeNumber_key" ON "hr_employees"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "hr_employees_userId_key" ON "hr_employees"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "hr_employees_workEmail_key" ON "hr_employees"("workEmail");

-- CreateIndex
CREATE INDEX "hr_employees_departmentId_idx" ON "hr_employees"("departmentId");

-- CreateIndex
CREATE INDEX "hr_employees_managerId_idx" ON "hr_employees"("managerId");

-- CreateIndex
CREATE INDEX "hr_employees_employmentStatus_idx" ON "hr_employees"("employmentStatus");

-- CreateIndex
CREATE INDEX "hr_employees_workEmail_idx" ON "hr_employees"("workEmail");

-- CreateIndex
CREATE UNIQUE INDEX "hr_departments_code_key" ON "hr_departments"("code");

-- CreateIndex
CREATE INDEX "hr_departments_parentId_idx" ON "hr_departments"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "hr_positions_code_key" ON "hr_positions"("code");

-- CreateIndex
CREATE INDEX "hr_positions_departmentId_idx" ON "hr_positions"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "hr_work_shifts_code_key" ON "hr_work_shifts"("code");

-- CreateIndex
CREATE INDEX "hr_attendances_employeeId_idx" ON "hr_attendances"("employeeId");

-- CreateIndex
CREATE INDEX "hr_attendances_date_idx" ON "hr_attendances"("date");

-- CreateIndex
CREATE INDEX "hr_attendances_status_idx" ON "hr_attendances"("status");

-- CreateIndex
CREATE UNIQUE INDEX "hr_attendances_employeeId_date_key" ON "hr_attendances"("employeeId", "date");

-- CreateIndex
CREATE INDEX "hr_timesheet_entries_attendanceId_idx" ON "hr_timesheet_entries"("attendanceId");

-- CreateIndex
CREATE INDEX "hr_timesheet_entries_employeeId_idx" ON "hr_timesheet_entries"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "hr_leave_types_code_key" ON "hr_leave_types"("code");

-- CreateIndex
CREATE INDEX "hr_leave_balances_employeeId_idx" ON "hr_leave_balances"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "hr_leave_balances_employeeId_leaveTypeId_year_key" ON "hr_leave_balances"("employeeId", "leaveTypeId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "hr_leave_requests_requestNumber_key" ON "hr_leave_requests"("requestNumber");

-- CreateIndex
CREATE INDEX "hr_leave_requests_employeeId_idx" ON "hr_leave_requests"("employeeId");

-- CreateIndex
CREATE INDEX "hr_leave_requests_status_idx" ON "hr_leave_requests"("status");

-- CreateIndex
CREATE INDEX "hr_leave_requests_startDate_endDate_idx" ON "hr_leave_requests"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "hr_leave_approvals_leaveRequestId_idx" ON "hr_leave_approvals"("leaveRequestId");

-- CreateIndex
CREATE INDEX "hr_leave_approvals_approverEmployeeId_idx" ON "hr_leave_approvals"("approverEmployeeId");

-- CreateIndex
CREATE INDEX "hr_leave_policy_rules_leaveTypeId_idx" ON "hr_leave_policy_rules"("leaveTypeId");

-- CreateIndex
CREATE INDEX "hr_holidays_year_idx" ON "hr_holidays"("year");

-- CreateIndex
CREATE INDEX "hr_holidays_date_idx" ON "hr_holidays"("date");

-- CreateIndex
CREATE UNIQUE INDEX "hr_holidays_name_year_key" ON "hr_holidays"("name", "year");

-- CreateIndex
CREATE UNIQUE INDEX "hr_performance_cycles_name_year_key" ON "hr_performance_cycles"("name", "year");

-- CreateIndex
CREATE INDEX "hr_performance_reviews_cycleId_idx" ON "hr_performance_reviews"("cycleId");

-- CreateIndex
CREATE INDEX "hr_performance_reviews_employeeId_idx" ON "hr_performance_reviews"("employeeId");

-- CreateIndex
CREATE INDEX "hr_performance_reviews_reviewerId_idx" ON "hr_performance_reviews"("reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "hr_performance_reviews_cycleId_employeeId_reviewType_key" ON "hr_performance_reviews"("cycleId", "employeeId", "reviewType");

-- CreateIndex
CREATE INDEX "hr_performance_goals_cycleId_idx" ON "hr_performance_goals"("cycleId");

-- CreateIndex
CREATE INDEX "hr_performance_goals_employeeId_idx" ON "hr_performance_goals"("employeeId");

-- CreateIndex
CREATE INDEX "hr_goal_updates_goalId_idx" ON "hr_goal_updates"("goalId");

-- CreateIndex
CREATE INDEX "hr_performance_feedbacks_reviewId_idx" ON "hr_performance_feedbacks"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "hr_job_postings_jobCode_key" ON "hr_job_postings"("jobCode");

-- CreateIndex
CREATE INDEX "hr_job_postings_departmentId_idx" ON "hr_job_postings"("departmentId");

-- CreateIndex
CREATE INDEX "hr_job_postings_status_idx" ON "hr_job_postings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "hr_applicants_applicantNumber_key" ON "hr_applicants"("applicantNumber");

-- CreateIndex
CREATE INDEX "hr_applicants_jobPostingId_idx" ON "hr_applicants"("jobPostingId");

-- CreateIndex
CREATE INDEX "hr_applicants_status_idx" ON "hr_applicants"("status");

-- CreateIndex
CREATE INDEX "hr_applicants_email_idx" ON "hr_applicants"("email");

-- CreateIndex
CREATE INDEX "hr_interviews_applicantId_idx" ON "hr_interviews"("applicantId");

-- CreateIndex
CREATE INDEX "hr_interviews_jobPostingId_idx" ON "hr_interviews"("jobPostingId");

-- CreateIndex
CREATE INDEX "hr_interviews_scheduledAt_idx" ON "hr_interviews"("scheduledAt");

-- CreateIndex
CREATE INDEX "hr_interview_evaluations_interviewId_idx" ON "hr_interview_evaluations"("interviewId");

-- CreateIndex
CREATE INDEX "hr_interview_evaluations_applicantId_idx" ON "hr_interview_evaluations"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "hr_interview_evaluations_interviewId_evaluatorId_key" ON "hr_interview_evaluations"("interviewId", "evaluatorId");

-- CreateIndex
CREATE INDEX "hr_employee_documents_employeeId_idx" ON "hr_employee_documents"("employeeId");

-- CreateIndex
CREATE INDEX "hr_employee_documents_documentType_idx" ON "hr_employee_documents"("documentType");

-- CreateIndex
CREATE INDEX "hr_employee_documents_expiryDate_idx" ON "hr_employee_documents"("expiryDate");

-- CreateIndex
CREATE INDEX "hr_employee_qualifications_employeeId_idx" ON "hr_employee_qualifications"("employeeId");

-- CreateIndex
CREATE INDEX "hr_employee_certifications_employeeId_idx" ON "hr_employee_certifications"("employeeId");

-- CreateIndex
CREATE INDEX "hr_employee_certifications_expiryDate_idx" ON "hr_employee_certifications"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "hr_employee_assets_assetTag_key" ON "hr_employee_assets"("assetTag");

-- CreateIndex
CREATE INDEX "hr_employee_assets_employeeId_idx" ON "hr_employee_assets"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "hr_disciplinary_actions_caseNumber_key" ON "hr_disciplinary_actions"("caseNumber");

-- CreateIndex
CREATE INDEX "hr_disciplinary_actions_employeeId_idx" ON "hr_disciplinary_actions"("employeeId");

-- CreateIndex
CREATE INDEX "hr_disciplinary_actions_status_idx" ON "hr_disciplinary_actions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "hr_training_courses_code_key" ON "hr_training_courses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "hr_training_sessions_sessionCode_key" ON "hr_training_sessions"("sessionCode");

-- CreateIndex
CREATE INDEX "hr_training_sessions_courseId_idx" ON "hr_training_sessions"("courseId");

-- CreateIndex
CREATE INDEX "hr_training_sessions_startDate_idx" ON "hr_training_sessions"("startDate");

-- CreateIndex
CREATE INDEX "hr_training_enrollments_employeeId_idx" ON "hr_training_enrollments"("employeeId");

-- CreateIndex
CREATE INDEX "hr_training_enrollments_courseId_idx" ON "hr_training_enrollments"("courseId");

-- CreateIndex
CREATE INDEX "hr_training_enrollments_sessionId_idx" ON "hr_training_enrollments"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "hr_training_enrollments_employeeId_courseId_sessionId_key" ON "hr_training_enrollments"("employeeId", "courseId", "sessionId");

-- CreateIndex
CREATE INDEX "payroll_employee_salaries_employeeId_idx" ON "payroll_employee_salaries"("employeeId");

-- CreateIndex
CREATE INDEX "payroll_employee_salaries_effectiveFrom_idx" ON "payroll_employee_salaries"("effectiveFrom");

-- CreateIndex
CREATE INDEX "payroll_salary_components_employeeSalaryId_idx" ON "payroll_salary_components"("employeeSalaryId");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_salary_component_types_code_key" ON "payroll_salary_component_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_runs_runNumber_key" ON "payroll_runs"("runNumber");

-- CreateIndex
CREATE INDEX "payroll_runs_periodStart_periodEnd_idx" ON "payroll_runs"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "payroll_runs_status_idx" ON "payroll_runs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_payslips_payslipNumber_key" ON "payroll_payslips"("payslipNumber");

-- CreateIndex
CREATE INDEX "payroll_payslips_payrollRunId_idx" ON "payroll_payslips"("payrollRunId");

-- CreateIndex
CREATE INDEX "payroll_payslips_employeeId_idx" ON "payroll_payslips"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_payslips_payrollRunId_employeeId_key" ON "payroll_payslips"("payrollRunId", "employeeId");

-- CreateIndex
CREATE INDEX "payroll_payslip_items_payslipId_idx" ON "payroll_payslip_items"("payslipId");

-- CreateIndex
CREATE INDEX "payroll_employee_benefits_employeeId_idx" ON "payroll_employee_benefits"("employeeId");

-- CreateIndex
CREATE INDEX "payroll_employee_benefits_benefitPlanId_idx" ON "payroll_employee_benefits"("benefitPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_benefit_plans_code_key" ON "payroll_benefit_plans"("code");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_employee_loans_loanNumber_key" ON "payroll_employee_loans"("loanNumber");

-- CreateIndex
CREATE INDEX "payroll_employee_loans_employeeId_idx" ON "payroll_employee_loans"("employeeId");

-- CreateIndex
CREATE INDEX "payroll_employee_loans_status_idx" ON "payroll_employee_loans"("status");

-- CreateIndex
CREATE INDEX "payroll_loan_repayments_loanId_idx" ON "payroll_loan_repayments"("loanId");

-- CreateIndex
CREATE INDEX "payroll_loan_repayments_dueDate_idx" ON "payroll_loan_repayments"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_loan_repayments_loanId_installmentNumber_key" ON "payroll_loan_repayments"("loanId", "installmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_expenses_expenseNumber_key" ON "payroll_expenses"("expenseNumber");

-- CreateIndex
CREATE INDEX "payroll_expenses_employeeId_idx" ON "payroll_expenses"("employeeId");

-- CreateIndex
CREATE INDEX "payroll_expenses_status_idx" ON "payroll_expenses"("status");

-- CreateIndex
CREATE INDEX "payroll_expenses_expenseDate_idx" ON "payroll_expenses"("expenseDate");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_expense_reports_reportNumber_key" ON "payroll_expense_reports"("reportNumber");

-- CreateIndex
CREATE INDEX "payroll_expense_reports_employeeId_idx" ON "payroll_expense_reports"("employeeId");

-- CreateIndex
CREATE INDEX "payroll_expense_reports_status_idx" ON "payroll_expense_reports"("status");

-- CreateIndex
CREATE INDEX "payroll_tax_filings_taxYear_idx" ON "payroll_tax_filings"("taxYear");

-- CreateIndex
CREATE INDEX "payroll_tax_filings_filingType_idx" ON "payroll_tax_filings"("filingType");

-- CreateIndex
CREATE INDEX "payroll_tax_brackets_taxYear_country_idx" ON "payroll_tax_brackets"("taxYear", "country");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_templates_code_key" ON "workflow_templates"("code");

-- CreateIndex
CREATE INDEX "workflow_templates_category_idx" ON "workflow_templates"("category");

-- CreateIndex
CREATE INDEX "workflow_templates_industryType_idx" ON "workflow_templates"("industryType");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_definitions_code_key" ON "workflow_definitions"("code");

-- CreateIndex
CREATE INDEX "workflow_definitions_templateId_idx" ON "workflow_definitions"("templateId");

-- CreateIndex
CREATE INDEX "workflow_definitions_status_idx" ON "workflow_definitions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_instances_instanceNumber_key" ON "workflow_instances"("instanceNumber");

-- CreateIndex
CREATE INDEX "workflow_instances_definitionId_idx" ON "workflow_instances"("definitionId");

-- CreateIndex
CREATE INDEX "workflow_instances_initiatorId_idx" ON "workflow_instances"("initiatorId");

-- CreateIndex
CREATE INDEX "workflow_instances_status_idx" ON "workflow_instances"("status");

-- CreateIndex
CREATE INDEX "workflow_instances_entityType_entityId_idx" ON "workflow_instances"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "workflow_step_instances_instanceId_idx" ON "workflow_step_instances"("instanceId");

-- CreateIndex
CREATE INDEX "workflow_step_instances_status_idx" ON "workflow_step_instances"("status");

-- CreateIndex
CREATE INDEX "workflow_step_approvals_stepInstanceId_idx" ON "workflow_step_approvals"("stepInstanceId");

-- CreateIndex
CREATE INDEX "workflow_step_approvals_approverId_idx" ON "workflow_step_approvals"("approverId");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_step_approvals_stepInstanceId_approverId_key" ON "workflow_step_approvals"("stepInstanceId", "approverId");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_tasks_taskNumber_key" ON "workflow_tasks"("taskNumber");

-- CreateIndex
CREATE INDEX "workflow_tasks_instanceId_idx" ON "workflow_tasks"("instanceId");

-- CreateIndex
CREATE INDEX "workflow_tasks_assigneeId_idx" ON "workflow_tasks"("assigneeId");

-- CreateIndex
CREATE INDEX "workflow_tasks_status_idx" ON "workflow_tasks"("status");

-- CreateIndex
CREATE INDEX "workflow_rules_definitionId_idx" ON "workflow_rules"("definitionId");

-- CreateIndex
CREATE INDEX "workflow_approval_chains_definitionId_idx" ON "workflow_approval_chains"("definitionId");

-- CreateIndex
CREATE INDEX "workflow_escalations_instanceId_idx" ON "workflow_escalations"("instanceId");

-- CreateIndex
CREATE INDEX "workflow_history_instanceId_idx" ON "workflow_history"("instanceId");

-- CreateIndex
CREATE INDEX "workflow_history_actionAt_idx" ON "workflow_history"("actionAt");

-- CreateIndex
CREATE INDEX "workflow_notifications_instanceId_idx" ON "workflow_notifications"("instanceId");

-- CreateIndex
CREATE INDEX "workflow_notifications_recipientId_idx" ON "workflow_notifications"("recipientId");

-- CreateIndex
CREATE INDEX "workflow_notifications_status_idx" ON "workflow_notifications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "automation_rules_code_key" ON "automation_rules"("code");

-- CreateIndex
CREATE INDEX "automation_rules_triggerType_idx" ON "automation_rules"("triggerType");

-- CreateIndex
CREATE INDEX "automation_rules_isActive_idx" ON "automation_rules"("isActive");

-- CreateIndex
CREATE INDEX "automation_rules_entityType_idx" ON "automation_rules"("entityType");

-- CreateIndex
CREATE INDEX "automation_executions_ruleId_idx" ON "automation_executions"("ruleId");

-- CreateIndex
CREATE INDEX "automation_executions_status_idx" ON "automation_executions"("status");

-- CreateIndex
CREATE INDEX "automation_executions_entityType_entityId_idx" ON "automation_executions"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "automation_executions_createdAt_idx" ON "automation_executions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "approval_requests_requestNumber_key" ON "approval_requests"("requestNumber");

-- CreateIndex
CREATE INDEX "approval_requests_requesterId_idx" ON "approval_requests"("requesterId");

-- CreateIndex
CREATE INDEX "approval_requests_status_idx" ON "approval_requests"("status");

-- CreateIndex
CREATE INDEX "approval_requests_requestType_idx" ON "approval_requests"("requestType");

-- CreateIndex
CREATE INDEX "approval_requests_entityType_entityId_idx" ON "approval_requests"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "approval_responses_requestId_idx" ON "approval_responses"("requestId");

-- CreateIndex
CREATE INDEX "approval_responses_approverId_idx" ON "approval_responses"("approverId");

-- CreateIndex
CREATE INDEX "e_signatures_userId_idx" ON "e_signatures"("userId");

-- CreateIndex
CREATE INDEX "e_signatures_signedAt_idx" ON "e_signatures"("signedAt");

-- CreateIndex
CREATE INDEX "enhanced_audit_trail_userId_idx" ON "enhanced_audit_trail"("userId");

-- CreateIndex
CREATE INDEX "enhanced_audit_trail_resourceType_resourceId_idx" ON "enhanced_audit_trail"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "enhanced_audit_trail_tenantId_idx" ON "enhanced_audit_trail"("tenantId");

-- CreateIndex
CREATE INDEX "enhanced_audit_trail_createdAt_idx" ON "enhanced_audit_trail"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "risks_referenceNumber_key" ON "risks"("referenceNumber");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "sessions_lastActivityAt_idx" ON "sessions"("lastActivityAt");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "hr_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "hr_positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "hr_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "hr_work_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_departments" ADD CONSTRAINT "hr_departments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "hr_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_positions" ADD CONSTRAINT "hr_positions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "hr_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_attendances" ADD CONSTRAINT "hr_attendances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_attendances" ADD CONSTRAINT "hr_attendances_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "hr_work_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_timesheet_entries" ADD CONSTRAINT "hr_timesheet_entries_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "hr_attendances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_leave_balances" ADD CONSTRAINT "hr_leave_balances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_leave_balances" ADD CONSTRAINT "hr_leave_balances_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "hr_leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_leave_requests" ADD CONSTRAINT "hr_leave_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_leave_requests" ADD CONSTRAINT "hr_leave_requests_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "hr_leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_leave_approvals" ADD CONSTRAINT "hr_leave_approvals_leaveRequestId_fkey" FOREIGN KEY ("leaveRequestId") REFERENCES "hr_leave_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_leave_policy_rules" ADD CONSTRAINT "hr_leave_policy_rules_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "hr_leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_performance_reviews" ADD CONSTRAINT "hr_performance_reviews_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "hr_performance_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_performance_reviews" ADD CONSTRAINT "hr_performance_reviews_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_performance_reviews" ADD CONSTRAINT "hr_performance_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "hr_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_performance_goals" ADD CONSTRAINT "hr_performance_goals_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "hr_performance_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_performance_goals" ADD CONSTRAINT "hr_performance_goals_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_goal_updates" ADD CONSTRAINT "hr_goal_updates_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "hr_performance_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_performance_feedbacks" ADD CONSTRAINT "hr_performance_feedbacks_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "hr_performance_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_job_postings" ADD CONSTRAINT "hr_job_postings_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "hr_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_job_postings" ADD CONSTRAINT "hr_job_postings_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "hr_positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_applicants" ADD CONSTRAINT "hr_applicants_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "hr_job_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_interviews" ADD CONSTRAINT "hr_interviews_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "hr_applicants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_interviews" ADD CONSTRAINT "hr_interviews_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "hr_job_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_interview_evaluations" ADD CONSTRAINT "hr_interview_evaluations_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "hr_interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_interview_evaluations" ADD CONSTRAINT "hr_interview_evaluations_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "hr_applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employee_documents" ADD CONSTRAINT "hr_employee_documents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employee_qualifications" ADD CONSTRAINT "hr_employee_qualifications_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employee_certifications" ADD CONSTRAINT "hr_employee_certifications_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employee_assets" ADD CONSTRAINT "hr_employee_assets_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_disciplinary_actions" ADD CONSTRAINT "hr_disciplinary_actions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_training_sessions" ADD CONSTRAINT "hr_training_sessions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "hr_training_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_training_enrollments" ADD CONSTRAINT "hr_training_enrollments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_training_enrollments" ADD CONSTRAINT "hr_training_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "hr_training_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_training_enrollments" ADD CONSTRAINT "hr_training_enrollments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "hr_training_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_employee_salaries" ADD CONSTRAINT "payroll_employee_salaries_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_salary_components" ADD CONSTRAINT "payroll_salary_components_employeeSalaryId_fkey" FOREIGN KEY ("employeeSalaryId") REFERENCES "payroll_employee_salaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_salary_components" ADD CONSTRAINT "payroll_salary_components_componentTypeId_fkey" FOREIGN KEY ("componentTypeId") REFERENCES "payroll_salary_component_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_payslips" ADD CONSTRAINT "payroll_payslips_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "payroll_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_payslips" ADD CONSTRAINT "payroll_payslips_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_payslip_items" ADD CONSTRAINT "payroll_payslip_items_payslipId_fkey" FOREIGN KEY ("payslipId") REFERENCES "payroll_payslips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_payslip_items" ADD CONSTRAINT "payroll_payslip_items_componentTypeId_fkey" FOREIGN KEY ("componentTypeId") REFERENCES "payroll_salary_component_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_employee_benefits" ADD CONSTRAINT "payroll_employee_benefits_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_employee_benefits" ADD CONSTRAINT "payroll_employee_benefits_benefitPlanId_fkey" FOREIGN KEY ("benefitPlanId") REFERENCES "payroll_benefit_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_employee_loans" ADD CONSTRAINT "payroll_employee_loans_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_loan_repayments" ADD CONSTRAINT "payroll_loan_repayments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "payroll_employee_loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_expenses" ADD CONSTRAINT "payroll_expenses_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "hr_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_expenses" ADD CONSTRAINT "payroll_expenses_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "payroll_expense_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_tax_filings" ADD CONSTRAINT "payroll_tax_filings_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "payroll_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_definitions" ADD CONSTRAINT "workflow_definitions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "workflow_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "hr_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_step_instances" ADD CONSTRAINT "workflow_step_instances_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "workflow_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_step_approvals" ADD CONSTRAINT "workflow_step_approvals_stepInstanceId_fkey" FOREIGN KEY ("stepInstanceId") REFERENCES "workflow_step_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_step_approvals" ADD CONSTRAINT "workflow_step_approvals_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "hr_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_tasks" ADD CONSTRAINT "workflow_tasks_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "workflow_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_tasks" ADD CONSTRAINT "workflow_tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "hr_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_rules" ADD CONSTRAINT "workflow_rules_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "workflow_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_approval_chains" ADD CONSTRAINT "workflow_approval_chains_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "workflow_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_escalations" ADD CONSTRAINT "workflow_escalations_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "workflow_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_history" ADD CONSTRAINT "workflow_history_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "workflow_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_executions" ADD CONSTRAINT "automation_executions_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_responses" ADD CONSTRAINT "approval_responses_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "approval_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enhanced_audit_trail" ADD CONSTRAINT "enhanced_audit_trail_esignatureId_fkey" FOREIGN KEY ("esignatureId") REFERENCES "e_signatures"("id") ON DELETE SET NULL ON UPDATE CASCADE;
