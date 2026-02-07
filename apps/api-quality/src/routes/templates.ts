import { Router, Response, Request } from 'express';
import type { Router as IRouter } from 'express';

const router: IRouter = Router();

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'process' | 'nc' | 'action';
  prefill: Record<string, any>;
}

const templates: Template[] = [
  // Process templates
  {
    id: 'proc-doc-control',
    name: 'Document Control',
    description: 'ISO 9001 document control process covering creation, review, approval, distribution, and revision of controlled documents.',
    category: 'Core QMS',
    type: 'process',
    prefill: {
      title: 'Document Control Process',
      description: 'Management of controlled documents including creation, review, approval, distribution, revision control, and obsolete document handling per ISO 9001:2015 clause 7.5.',
      category: 'Document Management',
      processOwner: '',
      processInputs: 'New document requests, revision requests, external documents, regulatory updates',
      processOutputs: 'Approved documents, document register, distribution records, revision history',
      kpis: 'Document review cycle time, overdue reviews %, document retrieval time',
      likelihood: 2,
      severity: 3,
      detectability: 2,
      existingControls: 'Document numbering system, approval workflow, version control, periodic review schedule',
    },
  },
  {
    id: 'proc-internal-audit',
    name: 'Internal Audit',
    description: 'Systematic internal audit process for evaluating QMS effectiveness and conformity.',
    category: 'Core QMS',
    type: 'process',
    prefill: {
      title: 'Internal Audit Process',
      description: 'Planning, conducting, reporting, and following up on internal quality management system audits per ISO 9001:2015 clause 9.2.',
      category: 'Audit & Compliance',
      processInputs: 'Audit schedule, previous audit results, process documentation, standards requirements',
      processOutputs: 'Audit reports, nonconformance reports, corrective action requests, management review input',
      kpis: 'Audit schedule adherence %, findings closure rate, average days to close findings',
      likelihood: 2,
      severity: 3,
      detectability: 2,
      existingControls: 'Annual audit schedule, trained auditors, standardized checklists, audit report templates',
    },
  },
  {
    id: 'proc-mgmt-review',
    name: 'Management Review',
    description: 'Top management review of the QMS to ensure continuing suitability, adequacy, and effectiveness.',
    category: 'Core QMS',
    type: 'process',
    prefill: {
      title: 'Management Review Process',
      description: 'Periodic review by top management of the QMS including inputs such as audit results, customer feedback, process performance, and improvement opportunities per ISO 9001:2015 clause 9.3.',
      category: 'Management',
      processInputs: 'Audit results, customer feedback, process metrics, NC trends, action status, risk register, improvement suggestions',
      processOutputs: 'Meeting minutes, action items, resource decisions, improvement initiatives, QMS changes',
      kpis: 'Review frequency adherence, action item completion rate, decisions implemented %',
      likelihood: 2,
      severity: 4,
      detectability: 2,
      existingControls: 'Scheduled quarterly reviews, standardized agenda, action tracking, minutes distribution',
    },
  },
  {
    id: 'proc-customer-feedback',
    name: 'Customer Feedback',
    description: 'Process for capturing, analyzing, and acting on customer satisfaction data and complaints.',
    category: 'Customer Focus',
    type: 'process',
    prefill: {
      title: 'Customer Feedback Process',
      description: 'Systematic collection, analysis, and response to customer feedback including complaints, surveys, and satisfaction monitoring per ISO 9001:2015 clause 9.1.2.',
      category: 'Customer Relations',
      processInputs: 'Customer complaints, survey responses, returns data, warranty claims, social media feedback',
      processOutputs: 'Satisfaction reports, complaint resolutions, trend analysis, improvement actions',
      kpis: 'Customer satisfaction score, complaint response time, complaint resolution rate, NPS',
      likelihood: 3,
      severity: 4,
      detectability: 2,
      existingControls: 'Complaint logging system, satisfaction surveys, response SLAs, escalation procedures',
    },
  },
  {
    id: 'proc-supplier-eval',
    name: 'Supplier Evaluation',
    description: 'Evaluation, selection, and monitoring of external providers to ensure product/service conformity.',
    category: 'Supply Chain',
    type: 'process',
    prefill: {
      title: 'Supplier Evaluation Process',
      description: 'Evaluation, selection, and ongoing monitoring of suppliers and external providers per ISO 9001:2015 clause 8.4.',
      category: 'Procurement',
      processInputs: 'Supplier applications, quality records, delivery data, audit results, market research',
      processOutputs: 'Approved supplier list, supplier scorecards, audit reports, improvement requests',
      kpis: 'Supplier on-time delivery %, supplier quality rate, incoming inspection pass rate',
      likelihood: 3,
      severity: 3,
      detectability: 3,
      existingControls: 'Supplier qualification checklist, periodic audits, incoming inspection, scorecard system',
    },
  },
  {
    id: 'proc-design-dev',
    name: 'Design & Development',
    description: 'Controlled design and development process with verification and validation stages.',
    category: 'Product Realization',
    type: 'process',
    prefill: {
      title: 'Design & Development Process',
      description: 'Controlled design and development planning, inputs, controls, outputs, and changes per ISO 9001:2015 clause 8.3.',
      category: 'Engineering',
      processInputs: 'Customer requirements, regulatory requirements, lessons learned, design briefs',
      processOutputs: 'Design specifications, verification records, validation records, production documentation',
      kpis: 'Design review pass rate, time-to-market, design change frequency, first-pass yield',
      likelihood: 3,
      severity: 4,
      detectability: 3,
      existingControls: 'Stage-gate reviews, design FMEA, prototype testing, cross-functional design review',
    },
  },

  // NC templates
  {
    id: 'nc-customer-complaint',
    name: 'Customer Complaint',
    description: 'Template for recording and investigating customer complaints about product or service quality.',
    category: 'External',
    type: 'nc',
    prefill: {
      title: '',
      description: '',
      type: 'CUSTOMER_COMPLAINT',
      severity: 'MAJOR',
      category: 'Customer Complaint',
      location: '',
      productAffected: '',
      customerImpact: 'Direct customer impact - requires investigation and response within 48 hours',
    },
  },
  {
    id: 'nc-supplier-nc',
    name: 'Supplier Nonconformance',
    description: 'Template for documenting nonconformances from incoming materials or supplier services.',
    category: 'External',
    type: 'nc',
    prefill: {
      title: '',
      description: '',
      type: 'SUPPLIER_ISSUE',
      severity: 'MODERATE',
      category: 'Supplier Quality',
      location: 'Incoming Inspection',
      productAffected: '',
      customerImpact: '',
    },
  },
  {
    id: 'nc-audit-finding',
    name: 'Audit Finding',
    description: 'Template for recording nonconformances identified during internal or external audits.',
    category: 'Internal',
    type: 'nc',
    prefill: {
      title: '',
      description: '',
      type: 'AUDIT_FINDING',
      severity: 'MODERATE',
      category: 'Audit Finding',
      location: '',
      productAffected: '',
      customerImpact: '',
    },
  },
  {
    id: 'nc-process-deviation',
    name: 'Process Deviation',
    description: 'Template for documenting deviations from established processes or procedures.',
    category: 'Internal',
    type: 'nc',
    prefill: {
      title: '',
      description: '',
      type: 'PROCESS_DEVIATION',
      severity: 'MINOR',
      category: 'Process Deviation',
      location: '',
      productAffected: '',
      customerImpact: '',
    },
  },
  {
    id: 'nc-product-defect',
    name: 'Product Defect',
    description: 'Template for recording product defects found during production or inspection.',
    category: 'Internal',
    type: 'nc',
    prefill: {
      title: '',
      description: '',
      type: 'PRODUCT_DEFECT',
      severity: 'MAJOR',
      category: 'Product Quality',
      location: 'Production',
      productAffected: '',
      customerImpact: '',
    },
  },

  // Action templates
  {
    id: 'act-corrective',
    name: 'Corrective Action',
    description: 'Eliminate the cause of a detected nonconformity to prevent recurrence.',
    category: 'Corrective',
    type: 'action',
    prefill: {
      title: '',
      description: '',
      type: 'CORRECTIVE',
      priority: 'HIGH',
    },
  },
  {
    id: 'act-preventive',
    name: 'Preventive Action',
    description: 'Proactive action to eliminate the cause of a potential nonconformity before it occurs.',
    category: 'Preventive',
    type: 'action',
    prefill: {
      title: '',
      description: '',
      type: 'PREVENTIVE',
      priority: 'MEDIUM',
    },
  },
  {
    id: 'act-improvement',
    name: 'Improvement Action',
    description: 'Continual improvement initiative to enhance QMS effectiveness and efficiency.',
    category: 'Improvement',
    type: 'action',
    prefill: {
      title: '',
      description: '',
      type: 'IMPROVEMENT',
      priority: 'MEDIUM',
    },
  },
];

// GET /api/templates - List templates
router.get('/', (req: Request, res: Response) => {
  const { type, category } = req.query;

  let filtered = templates;
  if (type) filtered = filtered.filter(t => t.type === type);
  if (category) filtered = filtered.filter(t => t.category === category);

  res.json({
    success: true,
    data: filtered.map(({ prefill, ...rest }) => rest),
  });
});

// GET /api/templates/:id - Get single template with prefill data
router.get('/:id', (req: Request, res: Response) => {
  const template = templates.find(t => t.id === req.params.id);

  if (!template) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
  }

  res.json({ success: true, data: template });
});

export default router;
