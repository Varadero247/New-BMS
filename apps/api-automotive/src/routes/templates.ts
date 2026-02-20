import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-automotive');

const router: IRouter = Router();
router.use(authenticate);

// Static IATF 16949 / automotive templates library
const AUTOMOTIVE_TEMPLATES = [
  { id: 'tpl-apqp-01', name: 'APQP Phase Gate Checklist', description: 'Advanced Product Quality Planning phase gate review checklist per IATF 16949', category: 'APQP', format: 'XLSX', version: '2.1', downloadUrl: '/templates/apqp-phase-gate.xlsx', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tpl-apqp-02', name: 'APQP Project Plan Template', description: 'Comprehensive APQP project planning with timing chart and resource allocation', category: 'APQP', format: 'XLSX', version: '1.4', downloadUrl: '/templates/apqp-project-plan.xlsx', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tpl-ppap-01', name: 'PPAP Warrant (PSW)', description: 'Part Submission Warrant — AIAG 4th Edition compliant', category: 'PPAP', format: 'PDF', version: '4.0', downloadUrl: '/templates/ppap-psw.pdf', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tpl-ppap-02', name: 'PPAP Checklist (Level 3)', description: 'PPAP Level 3 submission checklist with all 18 elements', category: 'PPAP', format: 'XLSX', version: '2.0', downloadUrl: '/templates/ppap-checklist.xlsx', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tpl-fmea-01', name: 'DFMEA Template (AIAG-VDA)', description: 'Design FMEA per AIAG-VDA Harmonized FMEA Handbook', category: 'FMEA', format: 'XLSX', version: '1.1', downloadUrl: '/templates/dfmea-aiag-vda.xlsx', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tpl-fmea-02', name: 'PFMEA Template (AIAG-VDA)', description: 'Process FMEA per AIAG-VDA Harmonized FMEA Handbook', category: 'FMEA', format: 'XLSX', version: '1.1', downloadUrl: '/templates/pfmea-aiag-vda.xlsx', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tpl-cp-01', name: 'Control Plan Template', description: 'AIAG Control Plan form with product/process characteristics, methods and reaction plans', category: 'CONTROL_PLAN', format: 'XLSX', version: '3.0', downloadUrl: '/templates/control-plan.xlsx', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tpl-msa-01', name: 'Gauge R&R Study Template', description: 'Measurement System Analysis — Gauge Repeatability & Reproducibility (GR&R) worksheet', category: 'MSA', format: 'XLSX', version: '2.0', downloadUrl: '/templates/gauge-rr.xlsx', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tpl-msa-02', name: 'Attribute Agreement Analysis', description: 'Attribute MSA for pass/fail gauging systems', category: 'MSA', format: 'XLSX', version: '1.5', downloadUrl: '/templates/attribute-msa.xlsx', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tpl-spc-01', name: 'SPC Control Chart (Xbar-R)', description: 'Variable control chart — Xbar and R chart for subgroup data', category: 'SPC', format: 'XLSX', version: '2.0', downloadUrl: '/templates/xbar-r-chart.xlsx', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tpl-spc-02', name: 'Process Capability Study', description: 'Cp, Cpk, Pp, Ppk calculation worksheet with histogram', category: 'SPC', format: 'XLSX', version: '1.8', downloadUrl: '/templates/capability-study.xlsx', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tpl-8d-01', name: '8D Problem Solving Report', description: 'Global 8D problem solving template — D1 through D8 with A3 format', category: 'EIGHT_D', format: 'XLSX', version: '3.0', downloadUrl: '/templates/8d-report.xlsx', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tpl-lpa-01', name: 'Layered Process Audit Checklist', description: 'LPA checklist with operator, supervisor and management layers', category: 'LPA', format: 'XLSX', version: '1.3', downloadUrl: '/templates/lpa-checklist.xlsx', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tpl-sup-01', name: 'Supplier Quality Manual Template', description: 'Supplier quality requirements manual template for IATF 16949 compliance', category: 'SUPPLIER', format: 'DOCX', version: '2.0', downloadUrl: '/templates/supplier-quality-manual.docx', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tpl-sup-02', name: 'Supplier Scorecard', description: 'Monthly supplier performance scorecard — quality, delivery, cost metrics', category: 'SUPPLIER', format: 'XLSX', version: '1.7', downloadUrl: '/templates/supplier-scorecard.xlsx', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tpl-gen-01', name: 'IATF 16949 Internal Audit Checklist', description: 'Comprehensive internal audit checklist covering all IATF 16949:2016 clauses', category: 'GENERAL', format: 'XLSX', version: '2.0', downloadUrl: '/templates/iatf-audit-checklist.xlsx', createdAt: '2025-01-01T00:00:00Z' },
];

// GET /api/templates
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let data = [...AUTOMOTIVE_TEMPLATES];

    if (category) {
      data = data.filter((t) => t.category === category);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      data = data.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching automotive templates', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch templates' } });
  }
});

// GET /api/templates/:id — IDs are slugs like tpl-apqp-01 (not UUIDs)
const TEMPLATE_ID_REGEX = /^tpl-[a-z0-9]+-\d+$/;
router.get('/:id', async (req: Request, res: Response) => {
  if (!TEMPLATE_ID_REGEX.test(req.params.id)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid template ID format' } });
  }
  const template = AUTOMOTIVE_TEMPLATES.find((t) => t.id === req.params.id);
  if (!template) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
  res.json({ success: true, data: template });
});

export default router;
