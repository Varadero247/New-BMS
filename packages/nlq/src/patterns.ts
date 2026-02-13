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
];
