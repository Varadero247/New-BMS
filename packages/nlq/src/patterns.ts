import { QueryPattern } from './types';

/**
 * Common natural language query patterns mapped to SQL.
 * Each pattern includes regex matchers, the corresponding SQL, and required module permissions.
 */
export const QUERY_PATTERNS: QueryPattern[] = [
  // Health & Safety
  {
    patterns: [
      /show\s+(?:me\s+)?(?:all\s+)?overdue\s+capas?/i,
      /overdue\s+capas?/i,
      /capas?\s+(?:that\s+are\s+)?overdue/i,
    ],
    sql: `SELECT * FROM hs_capas WHERE status != 'CLOSED' AND "dueDate" < NOW() ORDER BY "dueDate" ASC`,
    modules: ['health-safety'],
    description: 'List all overdue CAPAs',
  },
  {
    patterns: [
      /(?:what\s+is\s+)?(?:our|the)\s+ltifr/i,
      /lost\s+time\s+injury\s+frequency\s+rate/i,
      /calculate\s+ltifr/i,
    ],
    sql: `SELECT
      COUNT(CASE WHEN "lostTimeHours" > 0 THEN 1 END) * 1000000.0 / NULLIF(SUM("hoursWorked"), 0) AS ltifr
      FROM hs_incidents
      WHERE "dateOccurred" >= NOW() - INTERVAL '12 months'`,
    modules: ['health-safety'],
    description: 'Calculate Lost Time Injury Frequency Rate',
  },
  {
    patterns: [
      /(?:show\s+)?(?:all\s+)?open\s+incidents?/i,
      /incidents?\s+(?:that\s+are\s+)?open/i,
    ],
    sql: `SELECT * FROM hs_incidents WHERE status IN ('OPEN', 'INVESTIGATING') ORDER BY "dateOccurred" DESC`,
    modules: ['health-safety'],
    description: 'List all open incidents',
  },
  {
    patterns: [
      /(?:show\s+)?(?:all\s+)?(?:high|critical)\s+risk(?:s)?/i,
      /risks?\s+rated\s+(?:high|critical)/i,
    ],
    sql: `SELECT * FROM hs_risks WHERE "riskRating" IN ('HIGH', 'CRITICAL') AND status = 'ACTIVE' ORDER BY "riskScore" DESC`,
    modules: ['health-safety'],
    description: 'List high and critical risks',
  },

  // Quality
  {
    patterns: [
      /(?:which|what)\s+suppliers?\s+have\s+open\s+ncrs?/i,
      /supplier\s+ncrs?/i,
      /open\s+ncrs?\s+(?:by|per)\s+supplier/i,
    ],
    sql: `SELECT s."name" AS supplier_name, COUNT(n.id) AS open_ncrs
      FROM qms_ncrs n
      JOIN inv_suppliers s ON n."supplierId" = s.id
      WHERE n.status != 'CLOSED'
      GROUP BY s."name"
      ORDER BY open_ncrs DESC`,
    modules: ['quality', 'inventory'],
    description: 'List suppliers with open NCRs',
  },
  {
    patterns: [
      /(?:what\s+is\s+)?(?:our|the)\s+(?:first\s+pass\s+)?yield/i,
      /first\s+pass\s+yield/i,
    ],
    sql: `SELECT
      ROUND(SUM(CASE WHEN "firstPassResult" = 'PASS' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2) AS first_pass_yield
      FROM qms_inspections
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'`,
    modules: ['quality'],
    description: 'Calculate first pass yield rate',
  },

  // Environment
  {
    patterns: [
      /(?:what\s+(?:are|is)\s+)?(?:our|the)\s+(?:total\s+)?(?:carbon\s+)?emissions?/i,
      /total\s+co2/i,
      /carbon\s+footprint/i,
    ],
    sql: `SELECT
      SUM("co2eKg") / 1000.0 AS total_tco2e,
      scope,
      EXTRACT(YEAR FROM "reportingDate") AS year
      FROM env_emissions
      GROUP BY scope, year
      ORDER BY year DESC, scope`,
    modules: ['environment'],
    description: 'Show total carbon emissions by scope',
  },

  // HR
  {
    patterns: [
      /(?:show\s+)?(?:all\s+)?overdue\s+training/i,
      /training\s+(?:that\s+is\s+)?overdue/i,
      /expired?\s+training/i,
    ],
    sql: `SELECT e."firstName", e."lastName", t."courseName", t."dueDate"
      FROM hr_training t
      JOIN hr_employees e ON t."employeeId" = e.id
      WHERE t."completedAt" IS NULL AND t."dueDate" < NOW()
      ORDER BY t."dueDate" ASC`,
    modules: ['hr'],
    description: 'List all overdue training',
  },

  // Inventory
  {
    patterns: [
      /(?:show\s+)?(?:items?\s+)?(?:below|under)\s+(?:minimum\s+)?(?:stock|reorder)/i,
      /low\s+stock\s+items?/i,
      /items?\s+(?:that\s+)?need\s+reorder/i,
    ],
    sql: `SELECT * FROM inv_items WHERE "currentStock" <= "reorderPoint" AND "isActive" = true ORDER BY "currentStock" ASC`,
    modules: ['inventory'],
    description: 'List items below reorder point',
  },

  // Finance
  {
    patterns: [
      /(?:show\s+)?overdue\s+invoices?/i,
      /invoices?\s+(?:that\s+are\s+)?overdue/i,
      /unpaid\s+invoices?\s+past\s+due/i,
    ],
    sql: `SELECT * FROM fin_invoices WHERE status = 'SENT' AND "dueDate" < NOW() ORDER BY "dueDate" ASC`,
    modules: ['finance'],
    description: 'List overdue invoices',
  },
  {
    patterns: [
      /(?:what\s+is\s+)?(?:our|the)\s+(?:accounts?\s+)?receivable\s+aging/i,
      /ar\s+aging/i,
    ],
    sql: `SELECT
      CASE
        WHEN "dueDate" >= NOW() THEN 'Current'
        WHEN "dueDate" >= NOW() - INTERVAL '30 days' THEN '1-30 days'
        WHEN "dueDate" >= NOW() - INTERVAL '60 days' THEN '31-60 days'
        WHEN "dueDate" >= NOW() - INTERVAL '90 days' THEN '61-90 days'
        ELSE 'Over 90 days'
      END AS aging_bucket,
      COUNT(*) AS count,
      SUM("totalAmount") AS total
      FROM fin_invoices
      WHERE status IN ('SENT', 'OVERDUE')
      GROUP BY aging_bucket`,
    modules: ['finance'],
    description: 'Show accounts receivable aging',
  },

  // CRM
  {
    patterns: [
      /(?:show\s+)?(?:all\s+)?open\s+opportunities?/i,
      /opportunities?\s+(?:in\s+)?pipeline/i,
      /deals?\s+in\s+progress/i,
    ],
    sql: `SELECT * FROM crm_opportunities WHERE stage NOT IN ('WON', 'LOST') ORDER BY "expectedCloseDate" ASC`,
    modules: ['crm'],
    description: 'List open sales opportunities',
  },
  {
    patterns: [
      /(?:what\s+is\s+)?(?:our|the)\s+(?:sales\s+)?pipeline\s+value/i,
      /total\s+pipeline/i,
    ],
    sql: `SELECT stage, COUNT(*) AS count, SUM("value") AS total_value FROM crm_opportunities WHERE stage NOT IN ('WON', 'LOST') GROUP BY stage`,
    modules: ['crm'],
    description: 'Show sales pipeline value by stage',
  },

  // ESG
  {
    patterns: [
      /(?:show\s+)?(?:our\s+)?esg\s+(?:score|rating)s?/i,
      /esg\s+performance/i,
    ],
    sql: `SELECT category, AVG(score) AS avg_score, COUNT(*) AS metrics_count FROM esg_metrics WHERE "reportingPeriod" >= NOW() - INTERVAL '12 months' GROUP BY category`,
    modules: ['esg'],
    description: 'Show ESG scores by category',
  },
  {
    patterns: [
      /(?:show\s+)?(?:all\s+)?esg\s+goals?\s+(?:behind|off\s+track)/i,
      /esg\s+goals?\s+not\s+(?:on\s+)?track/i,
    ],
    sql: `SELECT * FROM esg_goals WHERE status IN ('BEHIND', 'AT_RISK') ORDER BY "targetDate" ASC`,
    modules: ['esg'],
    description: 'List ESG goals that are behind schedule',
  },

  // CMMS
  {
    patterns: [
      /(?:show\s+)?overdue\s+(?:work\s+)?orders?/i,
      /(?:work\s+)?orders?\s+(?:that\s+are\s+)?overdue/i,
    ],
    sql: `SELECT * FROM cmms_work_orders WHERE status NOT IN ('COMPLETED', 'CANCELLED') AND "dueDate" < NOW() ORDER BY "dueDate" ASC`,
    modules: ['cmms'],
    description: 'List overdue work orders',
  },
  {
    patterns: [
      /(?:show\s+)?(?:assets?\s+)?(?:due|overdue)\s+(?:for\s+)?(?:preventive\s+)?maintenance/i,
      /pm\s+(?:schedule|due)/i,
    ],
    sql: `SELECT a."name", pm."nextDueDate", pm."frequency" FROM cmms_preventive_maintenance pm JOIN cmms_assets a ON pm."assetId" = a.id WHERE pm."nextDueDate" <= NOW() + INTERVAL '7 days' ORDER BY pm."nextDueDate" ASC`,
    modules: ['cmms'],
    description: 'Show assets due for preventive maintenance',
  },

  // Food Safety
  {
    patterns: [
      /(?:show\s+)?(?:all\s+)?(?:critical\s+)?control\s+points?/i,
      /ccps?\s+(?:list|status)/i,
    ],
    sql: `SELECT * FROM fs_ccps WHERE status = 'ACTIVE' ORDER BY "hazardCategory", "ccpNumber"`,
    modules: ['food-safety'],
    description: 'List active critical control points',
  },
  {
    patterns: [
      /(?:show\s+)?ccp\s+(?:limit\s+)?deviations?/i,
      /(?:out\s+of\s+)?(?:control\s+)?limit\s+breaches?/i,
    ],
    sql: `SELECT m.*, c."ccpNumber" FROM fs_monitoring m JOIN fs_ccps c ON m."ccpId" = c.id WHERE m."inControl" = false ORDER BY m."monitoredAt" DESC LIMIT 20`,
    modules: ['food-safety'],
    description: 'Show CCP monitoring deviations',
  },

  // Energy
  {
    patterns: [
      /(?:what\s+is\s+)?(?:our|the)\s+energy\s+consumption/i,
      /total\s+energy\s+(?:usage|use)/i,
    ],
    sql: `SELECT "meterType", SUM("reading") AS total_consumption, "unit" FROM energy_readings WHERE "readingDate" >= NOW() - INTERVAL '30 days' GROUP BY "meterType", "unit"`,
    modules: ['energy'],
    description: 'Show total energy consumption by meter type',
  },
  {
    patterns: [
      /(?:show\s+)?enpi\s+(?:trend|performance)/i,
      /energy\s+performance\s+indicators?/i,
    ],
    sql: `SELECT * FROM energy_enpi WHERE "calculatedAt" >= NOW() - INTERVAL '12 months' ORDER BY "calculatedAt" DESC`,
    modules: ['energy'],
    description: 'Show energy performance indicator trends',
  },

  // Field Service
  {
    patterns: [
      /(?:show\s+)?(?:all\s+)?open\s+(?:service\s+)?jobs?/i,
      /(?:unassigned|pending)\s+(?:service\s+)?jobs?/i,
    ],
    sql: `SELECT * FROM fs_jobs WHERE status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS') ORDER BY priority DESC, "scheduledDate" ASC`,
    modules: ['field-service'],
    description: 'List open field service jobs',
  },
  {
    patterns: [
      /(?:show\s+)?technician\s+(?:utilization|utilisation|workload)/i,
      /(?:who\s+is\s+)?(?:available|free)\s+technicians?/i,
    ],
    sql: `SELECT t."name", COUNT(j.id) AS active_jobs, t."availabilityStatus" FROM fs_technicians t LEFT JOIN fs_jobs j ON t.id = j."technicianId" AND j.status = 'IN_PROGRESS' GROUP BY t.id, t."name", t."availabilityStatus" ORDER BY active_jobs ASC`,
    modules: ['field-service'],
    description: 'Show technician workload and availability',
  },

  // Risk Management
  {
    patterns: [
      /(?:show\s+)?(?:all\s+)?(?:enterprise\s+)?risks?\s+(?:above|over|score\s+(?:above|over))\s+(\d+)/i,
      /high\s+(?:enterprise\s+)?risks?/i,
    ],
    sql: `SELECT * FROM risk_register WHERE "residualScore" >= 15 AND status = 'ACTIVE' ORDER BY "residualScore" DESC`,
    modules: ['risk'],
    description: 'List high-scoring enterprise risks',
  },
  {
    patterns: [
      /(?:show\s+)?(?:all\s+)?(?:key\s+)?risk\s+indicators?\s+(?:in\s+)?breach/i,
      /kris?\s+(?:that\s+are\s+)?(?:in\s+)?(?:red|breach|exceeded)/i,
    ],
    sql: `SELECT k.*, r."latestReading" FROM risk_kri k LEFT JOIN LATERAL (SELECT "value" AS "latestReading" FROM risk_kri_readings WHERE "kriId" = k.id ORDER BY "readingDate" DESC LIMIT 1) r ON true WHERE r."latestReading" > k."upperThreshold" ORDER BY k."name"`,
    modules: ['risk'],
    description: 'Show KRIs that have breached their threshold',
  },

  // Chemicals
  {
    patterns: [
      /(?:show\s+)?(?:all\s+)?chemicals?\s+(?:without|missing)\s+(?:valid\s+)?sds/i,
      /expired?\s+(?:safety\s+data\s+)?sheets?/i,
      /sds\s+(?:expiring|expired)/i,
    ],
    sql: `SELECT c.*, s."expiryDate" FROM chem_register c LEFT JOIN chem_sds s ON c.id = s."chemicalId" AND s."isCurrent" = true WHERE s.id IS NULL OR s."expiryDate" < NOW() ORDER BY c."name"`,
    modules: ['chemicals'],
    description: 'List chemicals with missing or expired SDS',
  },
  {
    patterns: [
      /(?:show\s+)?coshh\s+assessments?\s+(?:due|overdue)/i,
      /overdue\s+coshh/i,
    ],
    sql: `SELECT * FROM chem_coshh WHERE "reviewDate" < NOW() AND status = 'ACTIVE' ORDER BY "reviewDate" ASC`,
    modules: ['chemicals'],
    description: 'List overdue COSHH assessments',
  },

  // Emergency
  {
    patterns: [
      /(?:show\s+)?(?:fire\s+)?risk\s+assessments?\s+(?:due|overdue)/i,
      /overdue\s+(?:fire\s+)?risk\s+assessments?/i,
      /fra\s+(?:review\s+)?(?:due|overdue)/i,
    ],
    sql: `SELECT * FROM fem_fire_risk_assessments WHERE "nextReviewDate" < NOW() AND status = 'ACTIVE' ORDER BY "nextReviewDate" ASC`,
    modules: ['emergency'],
    description: 'List overdue fire risk assessments',
  },
  {
    patterns: [
      /(?:show\s+)?(?:emergency\s+)?equipment\s+(?:inspections?\s+)?(?:due|overdue)/i,
      /(?:fire\s+)?(?:extinguisher|equipment)\s+(?:check|inspection)\s+(?:due|overdue)/i,
    ],
    sql: `SELECT * FROM fem_emergency_equipment WHERE "nextInspectionDate" < NOW() ORDER BY "nextInspectionDate" ASC`,
    modules: ['emergency'],
    description: 'List emergency equipment due for inspection',
  },

  // InfoSec
  {
    patterns: [
      /(?:show\s+)?(?:all\s+)?(?:information\s+)?security\s+incidents?/i,
      /(?:infosec|cyber)\s+incidents?/i,
    ],
    sql: `SELECT * FROM is_incidents WHERE status IN ('OPEN', 'INVESTIGATING') ORDER BY severity DESC, "reportedAt" DESC`,
    modules: ['infosec'],
    description: 'List open information security incidents',
  },
  {
    patterns: [
      /(?:show\s+)?(?:all\s+)?(?:infosec\s+)?(?:controls?\s+)?(?:not\s+)?(?:implemented|missing)/i,
      /(?:unimplemented|gap)\s+(?:security\s+)?controls?/i,
    ],
    sql: `SELECT * FROM is_controls WHERE "implementationStatus" != 'IMPLEMENTED' ORDER BY "riskLevel" DESC`,
    modules: ['infosec'],
    description: 'List security controls not yet implemented',
  },

  // Payroll
  {
    patterns: [
      /(?:show\s+)?(?:total\s+)?payroll\s+(?:cost|spend)/i,
      /(?:what\s+(?:is|was)\s+)?(?:the\s+)?payroll\s+(?:this|last)\s+month/i,
    ],
    sql: `SELECT "payPeriod", SUM("grossPay") AS total_gross, SUM("netPay") AS total_net, COUNT(*) AS employee_count FROM pay_payslips WHERE "payPeriod" >= NOW() - INTERVAL '3 months' GROUP BY "payPeriod" ORDER BY "payPeriod" DESC`,
    modules: ['payroll'],
    description: 'Show payroll costs by period',
  },

  // Documents
  {
    patterns: [
      /(?:show\s+)?(?:all\s+)?documents?\s+(?:due|pending)\s+(?:for\s+)?review/i,
      /document\s+reviews?\s+(?:due|overdue)/i,
    ],
    sql: `SELECT * FROM doc_documents WHERE "nextReviewDate" <= NOW() + INTERVAL '30 days' AND status = 'PUBLISHED' ORDER BY "nextReviewDate" ASC`,
    modules: ['documents'],
    description: 'List documents due for review',
  },

  // Complaints
  {
    patterns: [
      /(?:show\s+)?(?:all\s+)?open\s+complaints?/i,
      /(?:unresolved|pending)\s+complaints?/i,
    ],
    sql: `SELECT * FROM comp_complaints WHERE status IN ('OPEN', 'INVESTIGATING', 'IN_PROGRESS') ORDER BY priority DESC, "receivedDate" DESC`,
    modules: ['complaints'],
    description: 'List open customer complaints',
  },

  // Audits
  {
    patterns: [
      /(?:show\s+)?(?:upcoming|scheduled)\s+audits?/i,
      /audit\s+schedule/i,
      /(?:next|planned)\s+audits?/i,
    ],
    sql: `SELECT * FROM aud_audits WHERE "plannedDate" >= NOW() AND status = 'PLANNED' ORDER BY "plannedDate" ASC`,
    modules: ['audits'],
    description: 'Show upcoming scheduled audits',
  },
  {
    patterns: [
      /(?:show\s+)?(?:all\s+)?open\s+audit\s+findings?/i,
      /(?:unresolved|outstanding)\s+(?:audit\s+)?findings?/i,
    ],
    sql: `SELECT * FROM aud_findings WHERE status IN ('OPEN', 'IN_PROGRESS') ORDER BY severity DESC, "identifiedDate" DESC`,
    modules: ['audits'],
    description: 'List open audit findings',
  },

  // Suppliers
  {
    patterns: [
      /(?:show\s+)?(?:all\s+)?(?:approved\s+)?suppliers?(?:\s+list)?/i,
      /(?:who\s+are\s+)?(?:our\s+)?approved\s+suppliers?/i,
    ],
    sql: `SELECT * FROM sup_suppliers WHERE "approvalStatus" = 'APPROVED' AND "isActive" = true ORDER BY "name" ASC`,
    modules: ['suppliers'],
    description: 'List all approved suppliers',
  },
  {
    patterns: [
      /(?:show\s+)?suppliers?\s+(?:with\s+)?(?:poor|low|bad)\s+(?:rating|evaluation|score)s?/i,
      /(?:underperforming|failing)\s+suppliers?/i,
    ],
    sql: `SELECT s."name", e."overallScore", e."evaluationDate" FROM sup_suppliers s JOIN sup_evaluations e ON s.id = e."supplierId" WHERE e."overallScore" < 60 ORDER BY e."overallScore" ASC`,
    modules: ['suppliers'],
    description: 'List suppliers with poor evaluation scores',
  },

  // Training
  {
    patterns: [
      /(?:show\s+)?(?:training\s+)?competency\s+gaps?/i,
      /(?:who\s+(?:needs|requires)\s+)?training/i,
      /training\s+needs?\s+analysis/i,
    ],
    sql: `SELECT * FROM trn_tna WHERE status = 'IDENTIFIED' AND priority IN ('HIGH', 'CRITICAL') ORDER BY priority DESC, "identifiedDate" ASC`,
    modules: ['training'],
    description: 'Show high-priority training needs',
  },
  {
    patterns: [
      /(?:show\s+)?(?:expiring|expired)\s+(?:training\s+)?certifications?/i,
      /certifications?\s+(?:expiring|due)/i,
    ],
    sql: `SELECT r.*, c."name" AS course_name FROM trn_records r JOIN trn_courses c ON r."courseId" = c.id WHERE r."expiryDate" <= NOW() + INTERVAL '30 days' AND r."expiryDate" >= NOW() - INTERVAL '30 days' ORDER BY r."expiryDate" ASC`,
    modules: ['training'],
    description: 'Show expiring or recently expired training certifications',
  },
];
