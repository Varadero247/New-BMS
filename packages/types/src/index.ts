// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// Auth Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserProfile;
  token: string;
  expiresAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  jobTitle?: string;
  createdAt: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'AUDITOR' | 'USER';

// ============================================
// ISO Standards
// ============================================

export type ISOStandard = 'ISO_45001' | 'ISO_14001' | 'ISO_9001';

export const ISO_STANDARD_LABELS: Record<ISOStandard, string> = {
  ISO_45001: 'Health & Safety',
  ISO_14001: 'Environmental',
  ISO_9001: 'Quality',
};

export const ISO_STANDARD_COLORS: Record<ISOStandard, string> = {
  ISO_45001: '#ef4444', // red
  ISO_14001: '#22c55e', // green
  ISO_9001: '#3b82f6', // blue
};

// ============================================
// Risk / Aspect / Process Types
// ============================================

export interface Risk {
  id: string;
  standard: ISOStandard;
  title: string;
  description: string;
  category?: string;
  source?: string;

  // Risk Assessment
  likelihood: number;
  severity: number;
  detectability: number;
  riskScore?: number;
  riskLevel?: RiskLevel;

  // Environmental Aspects (ISO 14001)
  aspectType?: string;
  environmentalImpact?: string;
  scale?: number;
  frequency?: number;
  legalImpact?: number;
  significanceScore?: number;

  // Processes (ISO 9001)
  processOwner?: string;
  processInputs?: string;
  processOutputs?: string;
  kpis?: string;

  // Controls
  existingControls?: string;
  additionalControls?: string;
  residualRisk?: number;

  // Status
  status: RiskStatus;
  reviewDate?: string;
  lastReviewedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'MITIGATED' | 'CLOSED' | 'ACCEPTED';

export interface CreateRiskRequest {
  standard: ISOStandard;
  title: string;
  description: string;
  category?: string;
  source?: string;
  likelihood?: number;
  severity?: number;
  detectability?: number;
  aspectType?: string;
  environmentalImpact?: string;
  scale?: number;
  frequency?: number;
  legalImpact?: number;
  processOwner?: string;
  processInputs?: string;
  processOutputs?: string;
  kpis?: string;
  existingControls?: string;
  additionalControls?: string;
  reviewDate?: string;
}

// ============================================
// Incident / Event / Non-Conformance Types
// ============================================

export interface Incident {
  id: string;
  standard: ISOStandard;
  referenceNumber: string;
  title: string;
  description: string;

  // Classification
  type: IncidentType;
  severity: IncidentSeverity;
  category?: string;

  // Details
  location?: string;
  dateOccurred: string;
  dateReported: string;

  // People
  reporterId: string;
  reporter?: UserProfile;
  investigatorId?: string;
  investigator?: UserProfile;
  personsInvolved?: string;

  // H&S specific
  injuryType?: string;
  bodyPart?: string;
  daysLost?: number;
  treatmentType?: string;

  // Environmental specific
  environmentalMedia?: string;
  quantity?: number;
  unit?: string;
  regulatoryReport?: boolean;

  // Quality specific
  productAffected?: string;
  customerImpact?: string;
  costOfNonConformance?: number;

  // Investigation
  immediateCause?: string;
  rootCauses?: string;
  contributingFactors?: string;

  // Status
  status: IncidentStatus;
  closedAt?: string;

  createdAt: string;
  updatedAt: string;

  // Relations
  riskId?: string;
  actions?: Action[];
}

export type IncidentType =
  // H&S (ISO 45001)
  | 'INJURY'
  | 'NEAR_MISS'
  | 'DANGEROUS_OCCURRENCE'
  | 'OCCUPATIONAL_ILLNESS'
  | 'PROPERTY_DAMAGE'
  // Environmental (ISO 14001)
  | 'SPILL'
  | 'EMISSION'
  | 'WASTE_INCIDENT'
  | 'ENVIRONMENTAL_COMPLAINT'
  | 'REGULATORY_BREACH'
  // Quality (ISO 9001)
  | 'NON_CONFORMANCE'
  | 'CUSTOMER_COMPLAINT'
  | 'SUPPLIER_ISSUE'
  | 'PROCESS_DEVIATION'
  | 'PRODUCT_DEFECT'
  | 'AUDIT_FINDING';

export type IncidentSeverity = 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL' | 'CATASTROPHIC';

export type IncidentStatus =
  | 'OPEN'
  | 'UNDER_INVESTIGATION'
  | 'AWAITING_ACTIONS'
  | 'ACTIONS_IN_PROGRESS'
  | 'VERIFICATION'
  | 'CLOSED';

export interface CreateIncidentRequest {
  standard: ISOStandard;
  title: string;
  description: string;
  type: IncidentType;
  severity?: IncidentSeverity;
  category?: string;
  location?: string;
  dateOccurred: string;
  personsInvolved?: string;
  injuryType?: string;
  bodyPart?: string;
  daysLost?: number;
  treatmentType?: string;
  environmentalMedia?: string;
  quantity?: number;
  unit?: string;
  regulatoryReport?: boolean;
  productAffected?: string;
  customerImpact?: string;
  costOfNonConformance?: number;
  riskId?: string;
}

// ============================================
// Legal Requirement Types
// ============================================

export interface LegalRequirement {
  id: string;
  standard: ISOStandard;
  title: string;
  description: string;

  type: LegalType;
  jurisdiction?: string;
  issuingBody?: string;
  referenceNumber?: string;

  effectiveDate?: string;
  expiryDate?: string;
  reviewFrequency?: string;

  complianceStatus: ComplianceStatus;
  complianceEvidence?: string;
  lastAssessedAt?: string;
  nextAssessmentDate?: string;

  responsiblePerson?: string;

  createdAt: string;
  updatedAt: string;
}

export type LegalType =
  | 'LEGISLATION'
  | 'REGULATION'
  | 'CODE_OF_PRACTICE'
  | 'PERMIT'
  | 'LICENSE'
  | 'STANDARD'
  | 'CUSTOMER_REQUIREMENT'
  | 'INTERNAL_REQUIREMENT'
  | 'OTHER';

export type ComplianceStatus =
  | 'COMPLIANT'
  | 'PARTIALLY_COMPLIANT'
  | 'NON_COMPLIANT'
  | 'PENDING'
  | 'NOT_APPLICABLE';

export interface CreateLegalRequirementRequest {
  standard: ISOStandard;
  title: string;
  description: string;
  type: LegalType;
  jurisdiction?: string;
  issuingBody?: string;
  referenceNumber?: string;
  effectiveDate?: string;
  expiryDate?: string;
  reviewFrequency?: string;
  responsiblePerson?: string;
}

// ============================================
// Objective & Target Types
// ============================================

export interface Objective {
  id: string;
  standard: ISOStandard;
  title: string;
  description: string;

  targetValue?: number;
  currentValue?: number;
  unit?: string;
  baselineValue?: number;

  progressPercent: number;

  startDate?: string;
  targetDate?: string;

  ownerId?: string;
  owner?: UserProfile;
  department?: string;

  status: ObjectiveStatus;

  createdAt: string;
  updatedAt: string;

  progressRecords?: ObjectiveProgress[];
}

export interface ObjectiveProgress {
  id: string;
  objectiveId: string;
  value: number;
  notes?: string;
  recordedAt: string;
}

export type ObjectiveStatus =
  | 'NOT_STARTED'
  | 'ON_TRACK'
  | 'AT_RISK'
  | 'BEHIND'
  | 'ACHIEVED'
  | 'CANCELLED';

export interface CreateObjectiveRequest {
  standard: ISOStandard;
  title: string;
  description: string;
  targetValue?: number;
  unit?: string;
  baselineValue?: number;
  startDate?: string;
  targetDate?: string;
  ownerId?: string;
  department?: string;
}

// ============================================
// Action / CAPA Types
// ============================================

export interface Action {
  id: string;
  standard: ISOStandard;
  referenceNumber: string;
  title: string;
  description: string;

  type: ActionType;
  priority: ActionPriority;

  ownerId: string;
  owner?: UserProfile;
  createdById: string;
  createdBy?: UserProfile;

  dueDate: string;
  completedAt?: string;
  verifiedAt?: string;

  verificationMethod?: string;
  verificationNotes?: string;
  effectivenessRating?: number;

  status: ActionStatus;

  estimatedCost?: number;
  actualCost?: number;

  createdAt: string;
  updatedAt: string;

  // Relations
  riskId?: string;
  incidentId?: string;
  legalRequirementId?: string;
  objectiveId?: string;
  aiAnalysisId?: string;
}

export type ActionType = 'CORRECTIVE' | 'PREVENTIVE' | 'IMPROVEMENT' | 'IMMEDIATE' | 'LONG_TERM';

export type ActionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ActionStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'VERIFIED'
  | 'OVERDUE'
  | 'CANCELLED';

export interface CreateActionRequest {
  standard: ISOStandard;
  title: string;
  description: string;
  type: ActionType;
  priority?: ActionPriority;
  ownerId: string;
  dueDate: string;
  verificationMethod?: string;
  estimatedCost?: number;
  riskId?: string;
  incidentId?: string;
  legalRequirementId?: string;
  objectiveId?: string;
}

// ============================================
// Training & Competence Types
// ============================================

export interface TrainingCourse {
  id: string;
  standard?: ISOStandard;
  title: string;
  description?: string;
  provider?: string;
  duration?: string;
  frequency?: string;
  requiredForRoles?: string;
  requiredForDepartments?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingRecord {
  id: string;
  userId: string;
  user?: UserProfile;
  courseId: string;
  course?: TrainingCourse;
  completedAt?: string;
  expiresAt?: string;
  score?: number;
  competenceLevel?: CompetenceLevel;
  assessedBy?: string;
  assessedAt?: string;
  certificateUrl?: string;
  notes?: string;
  status: TrainingStatus;
  createdAt: string;
  updatedAt: string;
}

export type CompetenceLevel = 'AWARENESS' | 'BASIC' | 'PROFICIENT' | 'EXPERT';

export type TrainingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'FAILED';

export interface CreateTrainingCourseRequest {
  standard?: ISOStandard;
  title: string;
  description?: string;
  provider?: string;
  duration?: string;
  frequency?: string;
  requiredForRoles?: string;
  requiredForDepartments?: string;
}

// ============================================
// Analytics - 5 Whys
// ============================================

export interface FiveWhyAnalysis {
  id: string;
  incidentId: string;
  why1?: string;
  why2?: string;
  why3?: string;
  why4?: string;
  why5?: string;
  rootCause?: string;
  conclusion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFiveWhyRequest {
  incidentId: string;
  why1?: string;
  why2?: string;
  why3?: string;
  why4?: string;
  why5?: string;
  rootCause?: string;
  conclusion?: string;
}

// ============================================
// Analytics - Fishbone / Ishikawa
// ============================================

export interface FishboneAnalysis {
  id: string;
  incidentId: string;
  problemStatement: string;
  manpower?: string;
  method?: string;
  machine?: string;
  material?: string;
  measurement?: string;
  environment?: string;
  conclusion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFishboneRequest {
  incidentId: string;
  problemStatement: string;
  manpower?: string;
  method?: string;
  machine?: string;
  material?: string;
  measurement?: string;
  environment?: string;
  conclusion?: string;
}

// ============================================
// Analytics - Pareto
// ============================================

export interface ParetoAnalysis {
  id: string;
  incidentId?: string;
  standard?: ISOStandard;
  title: string;
  description?: string;
  data: ParetoDataItem[];
  periodStart?: string;
  periodEnd?: string;
  conclusion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParetoDataItem {
  category: string;
  count: number;
  percentage: number;
  cumulative: number;
}

export interface CreateParetoRequest {
  incidentId?: string;
  standard?: ISOStandard;
  title: string;
  description?: string;
  data: ParetoDataItem[];
  periodStart?: string;
  periodEnd?: string;
  conclusion?: string;
}

// ============================================
// Analytics - Bow-Tie
// ============================================

export interface BowTieAnalysis {
  id: string;
  riskId: string;
  topEvent: string;
  threats: BowTieThreat[];
  consequences: BowTieConsequence[];
  preventiveControls: BowTieControl[];
  mitigatingControls: BowTieControl[];
  escalationFactors?: BowTieEscalationFactor[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BowTieThreat {
  id: string;
  description: string;
  likelihood?: number;
}

export interface BowTieConsequence {
  id: string;
  description: string;
  severity?: number;
}

export interface BowTieControl {
  id: string;
  description: string;
  effectiveness?: number;
  threatId?: string;
  consequenceId?: string;
}

export interface BowTieEscalationFactor {
  id: string;
  description: string;
  controlId?: string;
}

export interface CreateBowTieRequest {
  riskId: string;
  topEvent: string;
  threats: Omit<BowTieThreat, 'id'>[];
  consequences: Omit<BowTieConsequence, 'id'>[];
  preventiveControls: Omit<BowTieControl, 'id'>[];
  mitigatingControls: Omit<BowTieControl, 'id'>[];
  escalationFactors?: Omit<BowTieEscalationFactor, 'id'>[];
  notes?: string;
}

// ============================================
// Analytics - Lean 8 Wastes
// ============================================

export interface LeanWasteAnalysis {
  id: string;
  title: string;
  description?: string;
  defects?: WasteItem;
  overproduction?: WasteItem;
  waiting?: WasteItem;
  nonUtilizedTalent?: WasteItem;
  transportation?: WasteItem;
  inventory?: WasteItem;
  motion?: WasteItem;
  extraProcessing?: WasteItem;
  totalEstimatedCost?: number;
  totalIdentifiedWastes?: number;
  recommendations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WasteItem {
  identified: boolean;
  description?: string;
  estimatedCost?: number;
}

export interface CreateLeanWasteRequest {
  title: string;
  description?: string;
  defects?: WasteItem;
  overproduction?: WasteItem;
  waiting?: WasteItem;
  nonUtilizedTalent?: WasteItem;
  transportation?: WasteItem;
  inventory?: WasteItem;
  motion?: WasteItem;
  extraProcessing?: WasteItem;
  recommendations?: string;
}

// ============================================
// AI Analysis Types
// ============================================

export type AIProvider = 'OPENAI' | 'ANTHROPIC' | 'GROK';

export interface AISettings {
  id: string;
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  defaultPrompt?: string;
  totalTokensUsed: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysis {
  id: string;
  userId: string;
  sourceType: string;
  sourceId: string;
  sourceData: Record<string, unknown>;
  prompt: string;
  provider: AIProvider;
  model?: string;
  response: AIAnalysisResponse;
  suggestedRootCause?: string;
  suggestedActions?: SuggestedAction[];
  complianceGaps?: ComplianceGap[];
  highlights?: TextHighlight[];
  status: AIAnalysisStatus;
  acceptedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysisResponse {
  content: string;
  tokensUsed?: number;
  model?: string;
}

export interface SuggestedAction {
  title: string;
  description: string;
  priority: ActionPriority;
  type: ActionType;
}

export interface ComplianceGap {
  clause: string;
  gap: string;
  recommendation: string;
}

export interface TextHighlight {
  text: string;
  reason: string;
  type: 'warning' | 'critical' | 'improvement';
}

export type AIAnalysisStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'ACCEPTED'
  | 'PARTIALLY_ACCEPTED'
  | 'REJECTED'
  | 'ERROR';

export interface AIAnalyseRequest {
  sourceType: 'risk' | 'incident' | 'aspect' | 'nonconformance';
  sourceId: string;
  selectedText?: string;
  customPrompt?: string;
}

export const DEFAULT_AI_PROMPT = `Analyse this incident/non-conformance/environmental aspect against ISO 45001/14001/9001, highlight root causes, suggest actions and ISO clause gaps. Provide:
1. Root cause analysis
2. Suggested corrective actions with priorities
3. ISO clause compliance gaps
4. Key text highlights requiring attention`;

// ============================================
// Safety Metrics (H&S)
// ============================================

export interface SafetyMetric {
  id: string;
  year: number;
  month: number;
  hoursWorked: number;
  lostTimeInjuries: number;
  totalRecordableInjuries: number;
  daysLost: number;
  nearMisses: number;
  firstAidCases: number;
  ltifr?: number;
  trir?: number;
  severityRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSafetyMetricRequest {
  year: number;
  month: number;
  hoursWorked: number;
  lostTimeInjuries?: number;
  totalRecordableInjuries?: number;
  daysLost?: number;
  nearMisses?: number;
  firstAidCases?: number;
}

// Safety Rate Calculations
// LTIFR = (Lost Time Injuries × 1,000,000) / Hours Worked
// TRIR = (Total Recordable Injuries × 200,000) / Hours Worked
// Severity Rate = (Days Lost × 1,000,000) / Hours Worked

// ============================================
// Quality Metrics
// ============================================

export interface QualityMetric {
  id: string;
  year: number;
  month: number;
  preventionCost: number;
  appraisalCost: number;
  internalFailureCost: number;
  externalFailureCost: number;
  totalCOPQ?: number;
  totalUnits: number;
  defectiveUnits: number;
  defectOpportunities: number;
  dpmo?: number;
  firstPassYield?: number;
  processSigma?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQualityMetricRequest {
  year: number;
  month: number;
  preventionCost?: number;
  appraisalCost?: number;
  internalFailureCost?: number;
  externalFailureCost?: number;
  totalUnits?: number;
  defectiveUnits?: number;
  defectOpportunities?: number;
}

// Quality Calculations
// COPQ = Prevention + Appraisal + Internal Failure + External Failure
// DPMO = (Defects × 1,000,000) / (Units × Opportunities)
// First Pass Yield = ((Total - Defective) / Total) × 100
// Process Sigma from DPMO lookup table

// ============================================
// Monthly Trends
// ============================================

export interface MonthlyTrend {
  id: string;
  standard: ISOStandard;
  metric: string;
  year: number;
  month: number;
  value: number;
  createdAt: string;
}

// ============================================
// Compliance Score
// ============================================

export interface ComplianceScore {
  id: string;
  standard: ISOStandard;
  overallScore: number;
  riskScore?: number;
  incidentScore?: number;
  legalScore?: number;
  objectiveScore?: number;
  actionScore?: number;
  trainingScore?: number;
  documentScore?: number;
  totalItems: number;
  compliantItems: number;
  calculatedAt: string;
}

// ============================================
// Document Types
// ============================================

export interface Document {
  id: string;
  standard?: ISOStandard;
  title: string;
  description?: string;
  version: string;
  previousVersionId?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  documentType: DocumentType;
  isoClause?: string;
  reviewDate?: string;
  nextReviewDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType =
  | 'POLICY'
  | 'PROCEDURE'
  | 'WORK_INSTRUCTION'
  | 'FORM'
  | 'RECORD'
  | 'MANUAL'
  | 'PLAN'
  | 'REPORT'
  | 'CERTIFICATE'
  | 'OTHER';

export type DocumentStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'OBSOLETE';

// ============================================
// Dashboard Types
// ============================================

export interface IMSDashboardStats {
  compliance: {
    iso45001: number;
    iso14001: number;
    iso9001: number;
    overall: number;
  };
  risks: {
    total: number;
    high: number;
    critical: number;
    byStandard: Record<ISOStandard, number>;
  };
  incidents: {
    total: number;
    open: number;
    thisMonth: number;
    byStandard: Record<ISOStandard, number>;
  };
  actions: {
    total: number;
    open: number;
    overdue: number;
    dueThisWeek: number;
  };
  topRisks: Risk[];
  overdueActions: Action[];
  recentAIInsights: AIAnalysis[];
}

// ============================================
// Utility Types
// ============================================

export type DateRange = {
  start: string;
  end: string;
};

// Risk score color coding
export const getRiskColor = (score: number): string => {
  if (score <= 8) return '#22c55e'; // green - low
  if (score <= 27) return '#eab308'; // yellow - medium
  if (score <= 64) return '#f97316'; // orange - high
  return '#ef4444'; // red - critical
};

export const getRiskLevel = (score: number): RiskLevel => {
  if (score <= 8) return 'LOW';
  if (score <= 27) return 'MEDIUM';
  if (score <= 64) return 'HIGH';
  return 'CRITICAL';
};

// ============================================
// API Endpoints
// ============================================

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  RISKS: {
    LIST: '/risks',
    CREATE: '/risks',
    GET: (id: string) => `/risks/${id}`,
    UPDATE: (id: string) => `/risks/${id}`,
    DELETE: (id: string) => `/risks/${id}`,
    BY_STANDARD: (standard: ISOStandard) => `/risks?standard=${standard}`,
    MATRIX: '/risks/matrix',
  },
  INCIDENTS: {
    LIST: '/incidents',
    CREATE: '/incidents',
    GET: (id: string) => `/incidents/${id}`,
    UPDATE: (id: string) => `/incidents/${id}`,
    DELETE: (id: string) => `/incidents/${id}`,
    BY_STANDARD: (standard: ISOStandard) => `/incidents?standard=${standard}`,
  },
  LEGAL: {
    LIST: '/legal-requirements',
    CREATE: '/legal-requirements',
    GET: (id: string) => `/legal-requirements/${id}`,
    UPDATE: (id: string) => `/legal-requirements/${id}`,
    DELETE: (id: string) => `/legal-requirements/${id}`,
  },
  OBJECTIVES: {
    LIST: '/objectives',
    CREATE: '/objectives',
    GET: (id: string) => `/objectives/${id}`,
    UPDATE: (id: string) => `/objectives/${id}`,
    DELETE: (id: string) => `/objectives/${id}`,
    PROGRESS: (id: string) => `/objectives/${id}/progress`,
  },
  ACTIONS: {
    LIST: '/actions',
    CREATE: '/actions',
    GET: (id: string) => `/actions/${id}`,
    UPDATE: (id: string) => `/actions/${id}`,
    DELETE: (id: string) => `/actions/${id}`,
    COMPLETE: (id: string) => `/actions/${id}/complete`,
    VERIFY: (id: string) => `/actions/${id}/verify`,
  },
  TRAINING: {
    COURSES: '/training/courses',
    RECORDS: '/training/records',
    MATRIX: '/training/matrix',
  },
  ANALYTICS: {
    FIVE_WHY: '/analytics/five-why',
    FISHBONE: '/analytics/fishbone',
    PARETO: '/analytics/pareto',
    BOW_TIE: '/analytics/bow-tie',
    LEAN_WASTE: '/analytics/lean-waste',
    TRENDS: '/analytics/trends',
  },
  AI: {
    SETTINGS: '/ai/settings',
    ANALYSE: '/ai/analyse',
    ANALYSES: '/ai/analyses',
    ACCEPT: (id: string) => `/ai/analyses/${id}/accept`,
    REJECT: (id: string) => `/ai/analyses/${id}/reject`,
  },
  METRICS: {
    SAFETY: '/metrics/safety',
    QUALITY: '/metrics/quality',
    COMPLIANCE: '/metrics/compliance',
  },
  DOCUMENTS: {
    LIST: '/documents',
    CREATE: '/documents',
    GET: (id: string) => `/documents/${id}`,
    UPDATE: (id: string) => `/documents/${id}`,
    DELETE: (id: string) => `/documents/${id}`,
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    COMPLIANCE: '/dashboard/compliance',
  },
} as const;
