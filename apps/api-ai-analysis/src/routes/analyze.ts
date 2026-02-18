import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

interface AIProviderResponse {
  content: string;
  tokensUsed: number;
}

const logger = createLogger('api-ai-analysis');

const router: IRouter = Router();

router.use(authenticate);

// POST /api/analyze - Quick AI analysis without requiring a saved source record
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      type: z.enum([
        'LEGAL_REFERENCES',
        'ENVIRONMENTAL_ASPECT',
        'HR_JOB_DESCRIPTION',
        'HR_PERFORMANCE_INSIGHTS',
        'HR_LEAVE_ANALYSIS',
        'HR_EMPLOYEE_ONBOARDING',
        'HR_CERTIFICATION_MONITOR',
        'PAYROLL_VALIDATION',
        'SALARY_BENCHMARK',
        'EXPENSE_VALIDATION',
        'LOAN_CALCULATOR',
        'PAYSLIP_ANOMALY',
        'PROJECT_CHARTER',
        'WBS_GENERATION',
        'CRITICAL_PATH',
        'THREE_POINT_ESTIMATION',
        'RESOURCE_LEVELING',
        'PROJECT_RISK_ANALYSIS',
        'EVM_ANALYSIS',
        'STAKEHOLDER_STRATEGY',
        'PROJECT_HEALTH_CHECK',
        'SPRINT_PLANNING',
        'LESSONS_LEARNED',
        'ENV_ASPECTS_SIGNIFICANCE',
        'ENV_REGULATORY_GAP',
        'MEDICAL_COMPLAINT_MDR_TRIAGE',
        'MEDICAL_RISK_CONTROL_GENERATION',
        'MEDICAL_DESIGN_INPUT_REVIEW',
        'AEROSPACE_COUNTERFEIT_RISK_ASSESSMENT',
        'AEROSPACE_AIRWORTHINESS_DIRECTIVE_IMPACT',
        'AUTOMOTIVE_APQP_RISK_ASSESSMENT',
        'AUTOMOTIVE_PPAP_READINESS',
      ]),
      context: z.record(z.unknown()),
    });

    const data = schema.parse(req.body);

    // Get AI settings
    const settings = await prisma.aISettings.findFirst({
      where: { deletedAt: null } as any,
      orderBy: { createdAt: 'desc' },
    });

    if (!settings?.apiKey) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_AI_CONFIG',
          message:
            'AI provider not configured. Please set up an API key in Settings > AI Configuration.',
        },
      });
    }

    let prompt = '';

    if (data.type === 'LEGAL_REFERENCES') {
      prompt = `You are a UK health and safety legal compliance expert.

Given this workplace risk:
- Title: ${data.context.riskTitle || 'Not specified'}
- Description: ${data.context.riskDescription || 'Not specified'}
- Category: ${data.context.riskCategory || 'General'}

List the TOP 3 most relevant UK legal references/regulations that apply to this risk.
For each, provide:
1. Regulation name (e.g., "Health and Safety at Work Act 1974")
2. Specific section/clause if applicable
3. Why it's relevant (1 sentence)

Return ONLY a valid JSON array, no preamble or explanation:
[
  {
    "regulation": "...",
    "section": "...",
    "relevance": "..."
  }
]`;
    } else if (data.type === 'ENVIRONMENTAL_ASPECT') {
      prompt = `You are an ISO 14001 environmental management expert.

Analyze this environmental aspect:
- Activity: ${data.context.activity || 'Not specified'}
- Aspect (cause): ${data.context.aspect || 'Not specified'}
- Impact (effect): ${data.context.impact || 'Not specified'}
- Category: ${data.context.category || 'General'}

Provide analysis as JSON with this exact structure:
{
  "scoring": {
    "severity": <1-5>,
    "probability": <1-5>,
    "duration": <1-5>,
    "extent": <1-5>,
    "reversibility": <1-5>,
    "regulatory": <1-5>,
    "stakeholder": <1-5>,
    "rationale": "Brief explanation of scoring"
  },
  "controls": [
    "Control measure 1",
    "Control measure 2",
    "Control measure 3"
  ],
  "legalReferences": [
    {
      "regulation": "...",
      "section": "...",
      "relevance": "..."
    }
  ],
  "iso14001Clauses": [
    {
      "clause": "6.1.2",
      "title": "Environmental aspects",
      "relevance": "..."
    }
  ]
}

Return ONLY valid JSON, no preamble or explanation.`;
    } else if (data.type === 'HR_JOB_DESCRIPTION') {
      prompt = `You are a senior HR professional and talent acquisition expert.

Given this job posting:
- Title: ${data.context.title || 'Not specified'}
- Department: ${data.context.department || 'Not specified'}
- Employment Type: ${data.context.employmentType || 'Full-time'}
- Location: ${data.context.location || 'Not specified'}
- Current Description: ${data.context.description || 'None provided'}
- Current Requirements: ${data.context.requirements || 'None provided'}

Generate an enhanced, professional job description following best practices.

Return ONLY valid JSON with this structure:
{
  "description": "Enhanced job description (2-3 paragraphs)",
  "responsibilities": ["Responsibility 1", "Responsibility 2", "..."],
  "requirements": ["Requirement 1", "Requirement 2", "..."],
  "qualifications": ["Qualification 1", "Qualification 2", "..."],
  "skills": ["Skill 1", "Skill 2", "..."],
  "benefits": ["Benefit 1", "Benefit 2", "..."]
}`;
    } else if (data.type === 'HR_PERFORMANCE_INSIGHTS') {
      prompt = `You are a performance management expert following SHRM best practices.

Analyze this employee performance data:
- Employee Name: ${data.context.employeeName || 'Not specified'}
- Job Title: ${data.context.jobTitle || 'Not specified'}
- Department: ${data.context.department || 'Not specified'}
- Review Period: ${data.context.reviewPeriod || 'Not specified'}
- Self Assessment: ${data.context.selfAssessment || 'None'}
- Manager Assessment: ${data.context.managerAssessment || 'None'}
- Current Rating: ${data.context.overallRating || 'Not rated'}
- Goals Completed: ${data.context.goalsCompleted || 0} of ${data.context.totalGoals || 0}

Provide performance insights and development recommendations.

Return ONLY valid JSON:
{
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "areasForImprovement": ["Area 1", "Area 2"],
  "developmentGoals": [
    {"goal": "...", "timeline": "...", "actions": ["Action 1", "Action 2"]}
  ],
  "trainingRecommendations": ["Training 1", "Training 2"],
  "overallSummary": "Brief performance summary paragraph",
  "suggestedRating": <1-5>
}`;
    } else if (data.type === 'HR_LEAVE_ANALYSIS') {
      prompt = `You are an HR analytics expert specializing in workforce planning.

Analyze these leave patterns:
- Employee Name: ${data.context.employeeName || 'Team'}
- Analysis Period: ${data.context.period || 'Last 12 months'}
- Total Leave Days: ${data.context.totalLeaveDays || 0}
- Leave Breakdown: ${JSON.stringify(data.context.leaveBreakdown || {})}
- Sick Leave Days: ${data.context.sickLeaveDays || 0}
- Unplanned Absences: ${data.context.unplannedAbsences || 0}

Calculate the Bradford Factor if sick leave data is provided (S x S x D where S=spells, D=total days).
Identify patterns and provide recommendations.

Return ONLY valid JSON:
{
  "bradfordFactor": <number or null>,
  "bradfordRisk": "LOW|MEDIUM|HIGH|CRITICAL",
  "patterns": ["Pattern 1", "Pattern 2"],
  "trends": ["Trend 1", "Trend 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "comparisonToAverage": "Brief comparison to industry averages",
  "wellbeingFlags": ["Any wellbeing concerns noted"]
}`;
    } else if (data.type === 'HR_EMPLOYEE_ONBOARDING') {
      prompt = `You are an HR onboarding specialist.

Generate an onboarding checklist for this new hire:
- Name: ${data.context.employeeName || 'New Employee'}
- Job Title: ${data.context.jobTitle || 'Not specified'}
- Department: ${data.context.department || 'Not specified'}
- Employment Type: ${data.context.employmentType || 'Full-time'}
- Start Date: ${data.context.startDate || 'Not specified'}
- Is Remote: ${data.context.isRemote || false}

Create a structured onboarding plan covering the first 90 days.

Return ONLY valid JSON:
{
  "preboarding": ["Task 1", "Task 2"],
  "day1": ["Task 1", "Task 2"],
  "week1": ["Task 1", "Task 2"],
  "month1": ["Task 1", "Task 2"],
  "month2to3": ["Task 1", "Task 2"],
  "documentsRequired": ["Document 1", "Document 2"],
  "systemAccess": ["System 1", "System 2"],
  "keyContacts": [
    {"role": "...", "purpose": "..."}
  ],
  "trainingRequired": ["Training 1", "Training 2"]
}`;
    } else if (data.type === 'HR_CERTIFICATION_MONITOR') {
      prompt = `You are a compliance and professional development expert.

Analyze these employee certifications:
- Employee Name: ${data.context.employeeName || 'Team'}
- Job Title: ${data.context.jobTitle || 'Not specified'}
- Department: ${data.context.department || 'Not specified'}
- Current Certifications: ${JSON.stringify(data.context.certifications || [])}
- Industry: ${data.context.industry || 'General'}

Identify compliance gaps and recommend certifications.

Return ONLY valid JSON:
{
  "expiringCerts": [
    {"name": "...", "expiryDate": "...", "urgency": "HIGH|MEDIUM|LOW", "renewalSteps": "..."}
  ],
  "missingCerts": [
    {"name": "...", "reason": "...", "priority": "HIGH|MEDIUM|LOW", "provider": "..."}
  ],
  "complianceStatus": "COMPLIANT|AT_RISK|NON_COMPLIANT",
  "complianceScore": <0-100>,
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "budgetEstimate": "Estimated cost for recommended certifications"
}`;
    } else if (data.type === 'PAYROLL_VALIDATION') {
      prompt = `You are a payroll compliance and auditing expert specializing in UK PAYE, HMRC regulations, and multi-currency payroll.

Validate this payroll run:
- Run Number: ${data.context.runNumber || 'Not specified'}
- Period: ${data.context.periodStart || ''} to ${data.context.periodEnd || ''}
- Total Employees: ${data.context.totalEmployees || 0}
- Total Gross: ${data.context.totalGross || 0}
- Total Deductions: ${data.context.totalDeductions || 0}
- Total Net: ${data.context.totalNet || 0}
- Currency: ${data.context.currency || 'USD'}

Check calculations, identify potential errors, and flag compliance issues.

Return ONLY valid JSON:
{
  "isValid": true|false,
  "calculationCheck": {
    "grossMinusDeductions": <number>,
    "matchesNet": true|false,
    "variance": <number>
  },
  "warnings": ["Warning 1", "Warning 2"],
  "errors": ["Error 1"],
  "complianceFlags": ["Flag 1"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "averagePerEmployee": {
    "gross": <number>,
    "net": <number>,
    "deductions": <number>
  }
}`;
    } else if (data.type === 'SALARY_BENCHMARK') {
      prompt = `You are a compensation and benefits analyst with expertise in UK and global salary benchmarking.

Benchmark this salary:
- Job Title: ${data.context.jobTitle || 'Not specified'}
- Department: ${data.context.department || 'Not specified'}
- Location: ${data.context.location || 'United Kingdom'}
- Experience Level: ${data.context.experienceLevel || 'Mid-level'}
- Current Salary: ${data.context.currentSalary || 'Not specified'}
- Currency: ${data.context.currency || 'GBP'}
- Industry: ${data.context.industry || 'General'}

Provide salary benchmarking analysis with market comparison.

Return ONLY valid JSON:
{
  "marketRange": {
    "low": <number>,
    "median": <number>,
    "high": <number>,
    "currency": "GBP"
  },
  "currentPositionInRange": "BELOW_MARKET|AT_MARKET|ABOVE_MARKET",
  "percentile": <0-100>,
  "adjustmentRecommendation": <number or null>,
  "factors": ["Factor affecting salary 1", "Factor 2"],
  "competitorComparison": [
    {"company": "...", "estimatedRange": "..."}
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;
    } else if (data.type === 'EXPENSE_VALIDATION') {
      prompt = `You are a corporate expense management and compliance expert.

Validate this expense claim:
- Category: ${data.context.category || 'Not specified'}
- Amount: ${data.context.amount || 0} ${data.context.currency || 'USD'}
- Description: ${data.context.description || 'Not specified'}
- Merchant: ${data.context.merchant || 'Not specified'}
- Is Billable: ${data.context.isBillable || false}
- Recent Claims: ${JSON.stringify(data.context.recentClaims || [])}

Check for policy compliance, duplicate detection, and reasonableness.

Return ONLY valid JSON:
{
  "isReasonable": true|false,
  "riskLevel": "LOW|MEDIUM|HIGH",
  "policyChecks": [
    {"check": "...", "passed": true|false, "note": "..."}
  ],
  "duplicateRisk": "LOW|MEDIUM|HIGH",
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "categoryBenchmark": {
    "averageAmount": <number>,
    "isWithinNorm": true|false
  },
  "approvalRecommendation": "APPROVE|REVIEW|REJECT"
}`;
    } else if (data.type === 'LOAN_CALCULATOR') {
      prompt = `You are a financial planning expert specializing in employee loan programs.

Calculate loan details:
- Loan Amount: ${data.context.amount || 0}
- Interest Rate: ${data.context.interestRate || 0}% per annum
- Term: ${data.context.termMonths || 12} months
- Monthly Salary: ${data.context.monthlySalary || 'Not specified'}
- Currency: ${data.context.currency || 'USD'}
- Loan Type: ${data.context.loanType || 'PERSONAL'}

Generate repayment schedule and affordability analysis.

Return ONLY valid JSON:
{
  "monthlyPayment": <number>,
  "totalInterest": <number>,
  "totalRepayment": <number>,
  "affordability": {
    "debtToIncomeRatio": <percentage>,
    "isAffordable": true|false,
    "maxRecommendedPayment": <number>
  },
  "schedule": [
    {"month": 1, "payment": <number>, "principal": <number>, "interest": <number>, "balance": <number>},
    {"month": 2, "payment": <number>, "principal": <number>, "interest": <number>, "balance": <number>}
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "alternativeTerms": [
    {"months": 6, "monthlyPayment": <number>, "totalInterest": <number>},
    {"months": 24, "monthlyPayment": <number>, "totalInterest": <number>}
  ]
}`;
    } else if (data.type === 'PAYSLIP_ANOMALY') {
      prompt = `You are a payroll auditing expert specializing in anomaly detection and fraud prevention.

Analyze this payslip for anomalies:
- Employee: ${data.context.employeeName || 'Not specified'}
- Current Gross: ${data.context.currentGross || 0}
- Current Net: ${data.context.currentNet || 0}
- Current Deductions: ${data.context.currentDeductions || 0}
- Previous Payslips: ${JSON.stringify(data.context.previousPayslips || [])}

Compare against historical data and identify any anomalies or unusual patterns.

Return ONLY valid JSON:
{
  "anomaliesDetected": true|false,
  "anomalies": [
    {"type": "...", "severity": "LOW|MEDIUM|HIGH", "description": "...", "expectedValue": <number>, "actualValue": <number>}
  ],
  "trends": {
    "grossTrend": "INCREASING|STABLE|DECREASING",
    "deductionTrend": "INCREASING|STABLE|DECREASING",
    "netTrend": "INCREASING|STABLE|DECREASING"
  },
  "varianceAnalysis": {
    "grossVariance": <percentage>,
    "netVariance": <percentage>,
    "deductionsVariance": <percentage>
  },
  "riskScore": <0-100>,
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;
    } else if (data.type === 'PROJECT_CHARTER') {
      prompt = `You are a PMBOK-certified project management expert.

Given project details:
- Project Name: ${data.context.projectName}
- Project Type: ${data.context.projectType}
- Description: ${data.context.description}
- Objectives: ${data.context.objectives}

Create a comprehensive project charter.

Return ONLY valid JSON with this structure:
{
  "overview": "...",
  "businessCase": {
    "problemStatement": "...",
    "businessNeed": "...",
    "expectedBenefits": ["Benefit 1", "Benefit 2"],
    "roiEstimate": "..."
  },
  "objectives": [
    {"objective": "...", "smart": "..."}
  ],
  "scopeStatement": {
    "inScope": ["Item 1"],
    "outOfScope": ["Item 1"],
    "assumptions": ["Assumption 1"],
    "constraints": ["Constraint 1"]
  },
  "deliverables": ["Deliverable 1"],
  "stakeholders": [
    {"name": "...", "role": "...", "interest": "..."}
  ],
  "timeline": {
    "estimatedDuration": "...",
    "phases": [
      {"phase": "...", "duration": "..."}
    ]
  },
  "budgetEstimate": {
    "low": <number>,
    "high": <number>,
    "mostLikely": <number>
  },
  "successCriteria": ["Criteria 1"],
  "keyRisks": [
    {"risk": "...", "mitigation": "..."}
  ]
}`;
    } else if (data.type === 'WBS_GENERATION') {
      prompt = `You are a project planning expert.

Given project:
- Project Name: ${data.context.projectName}
- Project Type: ${data.context.projectType}
- Deliverables: ${JSON.stringify(data.context.deliverables)}
- Methodology: ${data.context.methodology}

Create a Work Breakdown Structure (WBS).

Return ONLY a valid JSON array:
[
  {"wbsCode": "1.0", "taskName": "...", "level": 1, "parentCode": null, "estimatedHours": <number>, "taskType": "..."},
  {"wbsCode": "1.1", "taskName": "...", "level": 2, "parentCode": "1.0", "estimatedHours": <number>, "taskType": "..."}
]`;
    } else if (data.type === 'CRITICAL_PATH') {
      prompt = `You are a scheduling expert using the Critical Path Method (CPM).

Given tasks: ${JSON.stringify(data.context.tasks)}

Calculate the critical path.

Return ONLY valid JSON:
{
  "criticalPathIds": ["taskId1", "taskId2"],
  "totalProjectDuration": <number>,
  "criticalPathDuration": <number>,
  "taskDetails": [
    {"taskId": "...", "earliestStart": <number>, "earliestFinish": <number>, "latestStart": <number>, "latestFinish": <number>, "slack": <number>, "isCritical": true|false}
  ]
}`;
    } else if (data.type === 'THREE_POINT_ESTIMATION') {
      prompt = `You are a PERT estimation expert.

Given:
- Task: ${data.context.taskName}
- Optimistic: ${data.context.optimistic}h
- Most Likely: ${data.context.mostLikely}h
- Pessimistic: ${data.context.pessimistic}h

Calculate PERT estimates.

Return ONLY valid JSON:
{
  "expectedDuration": <number>,
  "standardDeviation": <number>,
  "variance": <number>,
  "confidenceIntervals": {
    "68percent": {"low": <number>, "high": <number>},
    "95percent": {"low": <number>, "high": <number>}
  },
  "riskAssessment": "...",
  "recommendation": "..."
}`;
    } else if (data.type === 'RESOURCE_LEVELING') {
      prompt = `You are a resource management expert.

Given allocations: ${JSON.stringify(data.context.resources)}

Analyze over-allocation and under-utilization.

Return ONLY valid JSON:
{
  "overAllocated": [
    {"resource": "...", "period": "...", "allocation": <number>, "excess": <number>}
  ],
  "underUtilized": [
    {"resource": "...", "period": "...", "allocation": <number>, "available": <number>}
  ],
  "recommendations": [
    {"issue": "...", "solution": "...", "impact": "..."}
  ]
}`;
    } else if (data.type === 'PROJECT_RISK_ANALYSIS') {
      prompt = `You are a PMBOK risk management expert.

Given:
- Risk: ${data.context.riskDescription}
- Category: ${data.context.category}

Perform qualitative risk analysis.

Return ONLY valid JSON:
{
  "probability": <number>,
  "probabilityRationale": "...",
  "impact": {
    "schedule": <number>,
    "cost": <number>,
    "quality": <number>,
    "scope": <number>,
    "overall": <number>
  },
  "impactRationale": "...",
  "riskScore": <number>,
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "responseStrategy": "...",
  "responseActions": ["Action 1", "Action 2"],
  "contingencyPlan": "...",
  "riskOwner": "..."
}`;
    } else if (data.type === 'EVM_ANALYSIS') {
      prompt = `You are an Earned Value Management (EVM) expert.

Given:
- Planned Value (PV): ${data.context.pv}
- Earned Value (EV): ${data.context.ev}
- Actual Cost (AC): ${data.context.ac}
- Budget at Completion (BAC): ${data.context.bac}

Calculate all EVM metrics.

Return ONLY valid JSON:
{
  "metrics": {
    "cv": <number>,
    "sv": <number>,
    "cpi": <number>,
    "spi": <number>,
    "eac": <number>,
    "etc": <number>,
    "vac": <number>,
    "tcpi": <number>
  },
  "interpretation": {
    "costStatus": "...",
    "scheduleStatus": "...",
    "explanation": "..."
  },
  "healthStatus": "GREEN|YELLOW|RED",
  "forecast": "...",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;
    } else if (data.type === 'STAKEHOLDER_STRATEGY') {
      prompt = `You are a stakeholder management expert.

Given:
- Name: ${data.context.name}
- Role: ${data.context.role}
- Power: ${data.context.power}
- Interest: ${data.context.interest}
- Current Engagement: ${data.context.currentEngagement}
- Desired Engagement: ${data.context.desiredEngagement}

Develop a stakeholder engagement strategy.

Return ONLY valid JSON:
{
  "category": "...",
  "categoryRationale": "...",
  "engagementStrategy": "...",
  "communicationPlan": {
    "frequency": "...",
    "method": "...",
    "content": ["Content 1", "Content 2"],
    "format": "..."
  },
  "actionPlan": [
    {"action": "...", "timeline": "..."}
  ],
  "riskIfNotEngaged": "..."
}`;
    } else if (data.type === 'PROJECT_HEALTH_CHECK') {
      prompt = `You are a project auditor.

Given project data: ${JSON.stringify(data.context.project)}

Assess overall project health across schedule, budget, scope, quality, risks, team, stakeholders, and governance.

Return ONLY valid JSON:
{
  "overallHealth": "HEALTHY|AT_RISK|CRITICAL",
  "overallScore": <0-100>,
  "dimensions": [
    {"name": "...", "status": "GREEN|YELLOW|RED", "score": <0-100>, "issues": ["Issue 1"], "recommendations": ["Recommendation 1"]}
  ],
  "criticalIssues": ["Issue 1"],
  "quickWins": ["Quick win 1"],
  "executiveSummary": "..."
}`;
    } else if (data.type === 'SPRINT_PLANNING') {
      prompt = `You are an Agile coach.

Given:
- Team Capacity: ${data.context.teamCapacity} person-days
- Sprint Duration: ${data.context.sprintDuration} days
- Backlog: ${JSON.stringify(data.context.backlog)}
- Velocity: ${data.context.velocity}

Plan the sprint.

Return ONLY valid JSON:
{
  "sprintGoal": "...",
  "recommendedStories": [
    {"storyId": "...", "title": "...", "points": <number>, "priority": "..."}
  ],
  "totalStoryPoints": <number>,
  "capacityAllocation": {
    "development": <percentage>,
    "testing": <percentage>,
    "meetings": <percentage>,
    "buffer": <percentage>
  },
  "riskAssessment": {
    "level": "LOW|MEDIUM|HIGH",
    "risks": ["Risk 1"],
    "mitigation": ["Mitigation 1"]
  },
  "commitmentRecommendation": "..."
}`;
    } else if (data.type === 'LESSONS_LEARNED') {
      prompt = `You are a knowledge management expert.

Given:
- Project: ${data.context.projectName}
- Duration: ${data.context.duration}
- Budget Performance: ${data.context.budgetPerformance}
- Schedule Performance: ${data.context.schedulePerformance}
- Issues: ${JSON.stringify(data.context.issues)}
- Successes: ${JSON.stringify(data.context.successes)}

Compile lessons learned.

Return ONLY valid JSON:
{
  "whatWentWell": [
    {"item": "...", "category": "..."}
  ],
  "whatWentWrong": [
    {"item": "...", "category": "...", "impact": "..."}
  ],
  "rootCauses": [
    {"problem": "...", "rootCause": "...", "evidence": "..."}
  ],
  "recommendations": [
    {"recommendation": "...", "applicableTo": "...", "priority": "HIGH|MEDIUM|LOW"}
  ],
  "knowledgeAssets": [
    {"asset": "...", "location": "..."}
  ]
}`;
    } else if (data.type === 'ENV_ASPECTS_SIGNIFICANCE') {
      prompt = `You are an ISO 14001:2015 environmental management system expert.

Analyze the following environmental aspect for significance under ISO 14001:2015:

Aspect: ${data.context.description || 'Not specified'}
Activity: ${data.context.activity || 'Not specified'}
Condition: ${data.context.condition || 'NORMAL'} (NORMAL/ABNORMAL/EMERGENCY)
Scale: ${data.context.scale || 'Not specified'}
Severity: ${data.context.severity || 0}/5
Probability: ${data.context.probability || 0}/5
Legal Requirement: ${data.context.legalRequirement || 'Not specified'}
Stakeholder Concern: ${data.context.stakeholderConcern || 'Not specified'}

Provide a structured significance assessment.

Return ONLY valid JSON:
{
  "significanceAssessment": {
    "isSignificant": true|false,
    "overallScore": <number>,
    "justification": "..."
  },
  "operationalControls": [
    {"control": "...", "type": "ENGINEERING|ADMINISTRATIVE|PPE|MONITORING", "priority": "HIGH|MEDIUM|LOW"}
  ],
  "applicableRegulations": [
    {"regulation": "...", "section": "...", "relevance": "..."}
  ],
  "monitoringParameters": [
    {"parameter": "...", "method": "...", "frequency": "...", "limit": "..."}
  ],
  "iso14001Clauses": [
    {"clause": "...", "title": "...", "relevance": "..."}
  ]
}`;
    } else if (data.type === 'ENV_REGULATORY_GAP') {
      prompt = `You are an ISO 14001:2015 environmental regulatory compliance expert.

Analyze regulatory compliance gaps for the following organization under ISO 14001:2015:

Sector: ${data.context.sector || 'Not specified'}
Location: ${data.context.location || 'UK'}
Operations: ${data.context.operations || 'Not specified'}
Current Legal Register Entries: ${JSON.stringify(data.context.currentEntries || [])}

Identify regulatory gaps and provide recommendations.

Return ONLY valid JSON:
{
  "missingRegulations": [
    {"regulation": "...", "jurisdiction": "...", "applicableClause": "...", "reason": "..."}
  ],
  "recentUpdates": [
    {"regulation": "...", "updateDate": "...", "summary": "...", "actionRequired": "..."}
  ],
  "recommendedAdditions": [
    {"regulation": "...", "clause": "...", "description": "...", "complianceAction": "..."}
  ],
  "priorityRanking": [
    {"regulation": "...", "priority": "HIGH|MEDIUM|LOW", "reason": "...", "deadline": "..."}
  ],
  "overallComplianceRisk": "HIGH|MEDIUM|LOW",
  "summary": "..."
}`;
    } else if (data.type === 'MEDICAL_COMPLAINT_MDR_TRIAGE') {
      prompt = `You are a medical device regulatory expert specializing in complaint handling, MDR reporting (FDA 21 CFR 803), EU MDR Article 87, and UK MDR 2002.

Assess the following complaint for MDR reportability:

Complaint Description: ${data.context.description || 'Not specified'}
Device Type: ${data.context.deviceType || 'Not specified'}
Device Class: ${data.context.deviceClass || 'Not specified'}
Injury/Incident Details: ${data.context.injuryDetails || 'None reported'}
Death Involved: ${data.context.deathInvolved || 'No'}
Serious Injury: ${data.context.seriousInjury || 'No'}
Malfunction: ${data.context.malfunction || 'No'}
Recurrence Likely: ${data.context.recurrenceLikely || 'Unknown'}

Determine MDR reportability and provide a structured assessment. Respond with ONLY valid JSON:
{
  "reportability": "REPORTABLE|NOT_REPORTABLE|UNCERTAIN",
  "confidence": "HIGH|MEDIUM|LOW",
  "rationale": "...",
  "applicableRegulations": [
    {"regulation": "...", "clause": "...", "requirement": "..."}
  ],
  "reportingTimeline": "...",
  "suggestedInvestigationSteps": ["..."],
  "riskToPatient": "HIGH|MEDIUM|LOW|NONE",
  "recommendedActions": ["..."]
}`;
    } else if (data.type === 'MEDICAL_RISK_CONTROL_GENERATION') {
      prompt = `You are an ISO 14971:2019 risk management expert for medical devices.

Given the following hazard information, recommend risk controls following the ISO 14971 risk control hierarchy:

Hazard: ${data.context.hazard || 'Not specified'}
Hazardous Situation: ${data.context.hazardousSituation || 'Not specified'}
Harm: ${data.context.harm || 'Not specified'}
Severity: ${data.context.severity || 'Not specified'} (1=Negligible, 5=Catastrophic)
Probability: ${data.context.probability || 'Not specified'} (1=Rare, 5=Frequent)
Current Risk Level: ${data.context.currentRiskLevel || 'Not specified'}
Device Type: ${data.context.deviceType || 'Not specified'}

Recommend risk controls by type following the hierarchy. Respond with ONLY valid JSON:
{
  "inherentSafetyControls": [
    {"control": "...", "effectiveness": "HIGH|MEDIUM|LOW", "feasibility": "...", "iso14971Clause": "..."}
  ],
  "protectiveMeasures": [
    {"control": "...", "effectiveness": "HIGH|MEDIUM|LOW", "feasibility": "...", "iso14971Clause": "..."}
  ],
  "informationForSafety": [
    {"control": "...", "effectiveness": "HIGH|MEDIUM|LOW", "feasibility": "...", "iso14971Clause": "..."}
  ],
  "residualRiskEstimate": {
    "severity": 1,
    "probability": 1,
    "riskLevel": "NEGLIGIBLE|LOW|MEDIUM|HIGH|UNACCEPTABLE",
    "acceptable": true
  },
  "verificationMethods": ["..."],
  "monitoringRequirements": ["..."]
}`;
    } else if (data.type === 'MEDICAL_DESIGN_INPUT_REVIEW') {
      prompt = `You are a medical device design controls expert per ISO 13485 Clause 7.3 and FDA 21 CFR 820.30.

Review the following user needs and intended use to derive design inputs:

User Needs: ${data.context.userNeeds || 'Not specified'}
Intended Use: ${data.context.intendedUse || 'Not specified'}
Patient Population: ${data.context.patientPopulation || 'Not specified'}
Use Environment: ${data.context.useEnvironment || 'Not specified'}
Similar Devices: ${data.context.similarDevices || 'None specified'}
Device Classification: ${data.context.deviceClass || 'Not specified'}

Derive comprehensive design inputs. Respond with ONLY valid JSON:
{
  "functionalRequirements": [
    {"requirement": "...", "source": "...", "verifiable": true, "testMethod": "..."}
  ],
  "performanceRequirements": [
    {"requirement": "...", "source": "...", "verifiable": true, "testMethod": "..."}
  ],
  "safetyRequirements": [
    {"requirement": "...", "source": "...", "regulatoryBasis": "...", "riskRef": "..."}
  ],
  "regulatoryRequirements": [
    {"requirement": "...", "regulation": "...", "clause": "..."}
  ],
  "usabilityRequirements": [
    {"requirement": "...", "humanFactorsConsideration": "..."}
  ],
  "verificationApproach": ["..."],
  "validationApproach": ["..."],
  "gaps": ["..."]
}`;
    }

    if (data.type === 'AEROSPACE_COUNTERFEIT_RISK_ASSESSMENT') {
      prompt = `You are an AS9100D / SAE AS6174 counterfeit parts prevention expert specializing in aerospace supply chain integrity.

Assess the counterfeit risk for the following component/supplier:

Part Number: ${data.context.partNumber || 'Not specified'}
Part Description: ${data.context.partDescription || 'Not specified'}
Manufacturer: ${data.context.manufacturer || 'Not specified'}
Supplier: ${data.context.supplier || 'Not specified'}
Procurement Source: ${data.context.procurementSource || 'Not specified'}
Criticality Level: ${data.context.criticalityLevel || 'Not specified'}
Historical Issues: ${data.context.historicalIssues || 'None'}
Test/Inspection Results: ${JSON.stringify(data.context.testResults || [])}

Provide a comprehensive counterfeit risk assessment. Respond with ONLY valid JSON:
{
  "overallRiskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "overallRiskScore": <0-100>,
  "riskFactors": [
    {
      "factor": "...",
      "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
      "score": <0-100>,
      "evidence": "...",
      "mitigation": "..."
    }
  ],
  "supplyChainVulnerabilities": [
    {
      "vulnerability": "...",
      "likelihood": "LOW|MEDIUM|HIGH",
      "impact": "...",
      "recommendation": "..."
    }
  ],
  "recommendedActions": [
    {
      "action": "...",
      "priority": "IMMEDIATE|HIGH|MEDIUM|LOW",
      "standard": "...",
      "estimatedCost": "..."
    }
  ],
  "testingRecommendations": ["..."],
  "documentationRequirements": ["..."],
  "applicableStandards": ["SAE AS6174", "SAE AS6081", "SAE AS6171", "..."]
}`;
    } else if (data.type === 'AEROSPACE_AIRWORTHINESS_DIRECTIVE_IMPACT') {
      prompt = `You are an EASA/FAA airworthiness directive compliance expert specializing in aerospace regulatory compliance.

Assess the impact of the following airworthiness directive:

AD Number: ${data.context.adNumber || 'Not specified'}
AD Title: ${data.context.adTitle || 'Not specified'}
Issuing Authority: ${data.context.issuingAuthority || 'EASA'}
Affected Aircraft/Component: ${data.context.affectedComponent || 'Not specified'}
Effective Date: ${data.context.effectiveDate || 'Not specified'}
Compliance Deadline: ${data.context.complianceDeadline || 'Not specified'}
Current Fleet Status: ${JSON.stringify(data.context.fleetStatus || {})}
Existing Maintenance Program: ${data.context.maintenanceProgram || 'Not specified'}

Provide a comprehensive AD impact assessment. Respond with ONLY valid JSON:
{
  "impactLevel": "MINIMAL|MODERATE|SIGNIFICANT|CRITICAL",
  "complianceUrgency": "IMMEDIATE|WITHIN_30_DAYS|WITHIN_90_DAYS|SCHEDULED",
  "affectedSystems": [
    {
      "system": "...",
      "ataChapter": "...",
      "impactDescription": "...",
      "complianceAction": "..."
    }
  ],
  "compliancePlan": [
    {
      "step": <number>,
      "action": "...",
      "responsible": "...",
      "estimatedHours": <number>,
      "partsRequired": ["..."],
      "deadline": "..."
    }
  ],
  "costEstimate": {
    "laborHours": <number>,
    "partsEstimate": "...",
    "downtime": "...",
    "totalEstimate": "..."
  },
  "riskIfNonCompliant": ["..."],
  "relatedADs": ["..."],
  "documentationRequired": ["..."]
}`;
    } else if (data.type === 'AUTOMOTIVE_APQP_RISK_ASSESSMENT') {
      prompt = `You are an IATF 16949 / AIAG APQP (Advanced Product Quality Planning) expert specializing in automotive quality management.

Assess the APQP risks for the following product program:

Product Description: ${data.context.productDescription || 'Not specified'}
Customer OEM: ${data.context.customer || 'Not specified'}
Industry Segment: ${data.context.industrySegment || 'Automotive'}
Complexity Factors: ${JSON.stringify(data.context.complexityFactors || [])}
New Technology: ${data.context.newTechnology || 'No'}
Similar Programs History: ${data.context.similarProgramsHistory || 'None'}
Supply Chain Tiers: ${data.context.supplyChainTiers || 'Not specified'}
Production Volume: ${data.context.productionVolume || 'Not specified'}

Provide a comprehensive APQP risk assessment. Respond with ONLY valid JSON:
{
  "overallRiskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "overallRiskScore": <0-100>,
  "topRisks": [
    {
      "rank": <1-10>,
      "riskArea": "...",
      "description": "...",
      "probability": <1-5>,
      "impact": <1-5>,
      "riskScore": <number>,
      "apqpPhase": "PLAN_AND_DEFINE|PRODUCT_DESIGN|PROCESS_DESIGN|VALIDATION|PRODUCTION",
      "mitigation": "..."
    }
  ],
  "criticalDeliverables": [
    {
      "deliverable": "...",
      "apqpPhase": "...",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "rationale": "..."
    }
  ],
  "recommendedMitigations": [
    {
      "action": "...",
      "targetPhase": "...",
      "responsible": "...",
      "effectiveness": "HIGH|MEDIUM|LOW"
    }
  ],
  "typicalTimeline": {
    "totalWeeks": <number>,
    "phases": [
      {"phase": "...", "durationWeeks": <number>, "keyActivities": ["..."]}
    ]
  },
  "oemSpecificConsiderations": ["..."],
  "lessonsLearned": ["..."]
}`;
    } else if (data.type === 'AUTOMOTIVE_PPAP_READINESS') {
      prompt = `You are an AIAG PPAP (Production Part Approval Process) expert specializing in IATF 16949 automotive quality submissions.

Assess PPAP readiness for the following submission:

Customer OEM: ${data.context.customerOem || 'Not specified'}
PPAP Level: ${data.context.ppapLevel || 'Level 3'}
Part Name: ${data.context.partName || 'Not specified'}
Part Number: ${data.context.partNumber || 'Not specified'}
Submission Reason: ${data.context.submissionReason || 'New Part'}

PPAP Element Status (18 Elements):
1. Design Records: ${data.context.designRecords || 'INCOMPLETE'}
2. Engineering Change Documents: ${data.context.engineeringChangeDocs || 'INCOMPLETE'}
3. Customer Engineering Approval: ${data.context.customerApproval || 'INCOMPLETE'}
4. DFMEA: ${data.context.dfmea || 'INCOMPLETE'}
5. Process Flow Diagram: ${data.context.processFlow || 'INCOMPLETE'}
6. PFMEA: ${data.context.pfmea || 'INCOMPLETE'}
7. Control Plan: ${data.context.controlPlan || 'INCOMPLETE'}
8. MSA Studies: ${data.context.msaStudies || 'INCOMPLETE'}
9. Dimensional Results: ${data.context.dimensionalResults || 'INCOMPLETE'}
10. Material/Performance Tests: ${data.context.materialTests || 'INCOMPLETE'}
11. Initial Process Studies (SPC): ${data.context.initialProcessStudies || 'INCOMPLETE'}
12. Qualified Lab Documentation: ${data.context.qualifiedLabDocs || 'INCOMPLETE'}
13. Appearance Approval Report: ${data.context.appearanceApproval || 'INCOMPLETE'}
14. Sample Production Parts: ${data.context.sampleParts || 'INCOMPLETE'}
15. Master Sample: ${data.context.masterSample || 'INCOMPLETE'}
16. Checking Aids: ${data.context.checkingAids || 'INCOMPLETE'}
17. Customer-Specific Requirements: ${data.context.customerSpecificReqs || 'INCOMPLETE'}
18. Part Submission Warrant (PSW): ${data.context.psw || 'INCOMPLETE'}

Provide a comprehensive PPAP readiness assessment. Respond with ONLY valid JSON:
{
  "readinessScore": <0-100>,
  "readinessLevel": "NOT_READY|PARTIALLY_READY|NEARLY_READY|READY",
  "elementsStatus": {
    "complete": <number>,
    "incomplete": <number>,
    "notApplicable": <number>,
    "total": 18
  },
  "gaps": [
    {
      "element": "...",
      "elementNumber": <1-18>,
      "currentStatus": "...",
      "requiredActions": ["..."],
      "estimatedEffort": "...",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW"
    }
  ],
  "oemSpecificRequirements": [
    {
      "requirement": "...",
      "oem": "...",
      "status": "MET|NOT_MET|PARTIAL",
      "action": "..."
    }
  ],
  "recommendedSequence": [
    {
      "step": <number>,
      "element": "...",
      "action": "...",
      "dependency": "...",
      "estimatedDays": <number>
    }
  ],
  "submissionRisks": [
    {
      "risk": "...",
      "likelihood": "HIGH|MEDIUM|LOW",
      "impact": "...",
      "mitigation": "..."
    }
  ],
  "estimatedCompletionDays": <number>,
  "recommendations": ["..."]
}`;
    }

    // Call AI provider
    let aiResponse: AIProviderResponse | null = null;

    try {
      if (settings.provider === 'OPENAI') {
        aiResponse = await callOpenAI(settings.apiKey, settings.model || 'gpt-4', prompt);
      } else if (settings.provider === 'ANTHROPIC') {
        aiResponse = await callAnthropic(
          settings.apiKey,
          settings.model || 'claude-3-sonnet-20240229',
          prompt
        );
      } else if (settings.provider === 'GROK') {
        aiResponse = await callGrok(settings.apiKey, prompt);
      }
    } catch (aiError: unknown) {
      const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI error';
      return res.status(502).json({
        success: false,
        error: { code: 'AI_ERROR', message: `AI provider error: ${errorMessage}` },
      });
    }

    // Parse JSON from AI response
    let parsedResult: unknown;
    try {
      const content = aiResponse!.content || '';
      // Extract JSON from response (handle cases where AI adds markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/) || content.match(/\{[\s\S]*\}/);
      parsedResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      return res.status(502).json({
        success: false,
        error: { code: 'PARSE_ERROR', message: 'Failed to parse AI response as JSON' },
      });
    }

    // Update token usage
    await prisma.aISettings.update({
      where: { id: settings.id },
      data: {
        totalTokensUsed: settings.totalTokensUsed + (aiResponse!.tokensUsed || 0),
        lastUsedAt: new Date(),
      },
    });

    // Return structured result
    if (data.type === 'LEGAL_REFERENCES') {
      res.json({
        success: true,
        data: { suggestions: Array.isArray(parsedResult) ? parsedResult : [] },
      });
    } else {
      res.json({ success: true, data: { type: data.type, result: parsedResult } });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields = error.errors.map((e) => e.path.join('.'));
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields },
      });
    }
    logger.error('Quick analyze error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to perform AI analysis' },
    });
  }
});

// AI provider helper functions
async function callOpenAI(apiKey: string, model: string, prompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert management system consultant specializing in ISO 45001, ISO 14001, ISO 9001, ISO 30414 (HR), SHRM, and CIPD frameworks. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as Record<string, unknown>;
    const errorObj = error.error as Record<string, unknown> | undefined;
    throw new Error((errorObj?.message as string) || 'OpenAI API error');
  }

  const data = (await response.json()) as Record<string, unknown>;
  const choices = data.choices as Array<{ message: { content: string } }>;
  const usage = data.usage as { total_tokens?: number } | undefined;
  return {
    content: choices[0].message.content,
    tokensUsed: usage?.total_tokens || 0,
  };
}

async function callAnthropic(apiKey: string, model: string, prompt: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system:
        'You are an expert management system consultant specializing in ISO 45001, ISO 14001, ISO 9001, ISO 30414 (HR), SHRM, and CIPD frameworks. Always respond with valid JSON only.',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as Record<string, unknown>;
    const errorObj = error.error as Record<string, unknown> | undefined;
    throw new Error((errorObj?.message as string) || 'Anthropic API error');
  }

  const data = (await response.json()) as Record<string, unknown>;
  const content = data.content as Array<{ text: string }>;
  const usage = data.usage as { input_tokens?: number; output_tokens?: number } | undefined;
  return {
    content: content[0].text,
    tokensUsed: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
  };
}

async function callGrok(apiKey: string, prompt: string) {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert ISO management system consultant. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as Record<string, unknown>;
    const errorObj = error.error as Record<string, unknown> | undefined;
    throw new Error((errorObj?.message as string) || 'Grok API error');
  }

  const data = (await response.json()) as Record<string, unknown>;
  const choices = data.choices as Array<{ message: { content: string } }>;
  const usage = data.usage as { total_tokens?: number } | undefined;
  return {
    content: choices[0].message.content,
    tokensUsed: usage?.total_tokens || 0,
  };
}

export default router;
