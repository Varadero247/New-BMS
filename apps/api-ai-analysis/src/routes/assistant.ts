import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';

const router: IRouter = Router();
router.use(authenticate);

const assistantSchema = z.object({
  question: z.string().trim().min(1).max(1000),
  context: z.string().trim().max(500).optional(),
});

// IMS knowledge base for fallback answers
const MODULE_KB: Record<string, { description: string; iso?: string; port: number }> = {
  'Health & Safety': {
    description:
      'Risk assessments, incident reporting, legal compliance registers, PPE tracking, and COSHH management.',
    iso: 'ISO 45001',
    port: 3001,
  },
  Environmental: {
    description:
      'Environmental aspects & impacts, events, legal requirements, objectives, and CAPA workflows.',
    iso: 'ISO 14001',
    port: 3002,
  },
  Quality: {
    description:
      'Non-conformance reports, CAPA, evidence packs, headstart templates, and document control.',
    iso: 'ISO 9001',
    port: 3003,
  },
  ESG: {
    description:
      'Sustainability reporting, carbon footprint tracking, scope 1/2/3 emissions, and ESG frameworks.',
    iso: 'GRI/SASB/TCFD',
    port: 3016,
  },
  'Food Safety': {
    description:
      'HACCP plans, CCP monitoring, allergen management, supplier approvals, and recall procedures.',
    iso: 'ISO 22000',
    port: 3020,
  },
  Energy: {
    description:
      'Energy reviews, baselines, EnPIs, significant energy uses, and energy action plans.',
    iso: 'ISO 50001',
    port: 3021,
  },
  'ISO 42001 (AI)': {
    description:
      'AI risk management, algorithmic impact assessments, AI inventory, and ethical AI governance.',
    iso: 'ISO 42001',
    port: 3024,
  },
  'ISO 37001 (Anti-Bribery)': {
    description:
      'Bribery risk assessments, due diligence, gifts & hospitality registers, and whistleblowing.',
    iso: 'ISO 37001',
    port: 3025,
  },
  InfoSec: {
    description:
      'Information security risk registers, asset management, access control, and incident response.',
    iso: 'ISO 27001',
    port: 3015,
  },
  Inventory: {
    description:
      'Stock levels, warehouse management, purchase orders, and automatic reorder points.',
    port: 3005,
  },
  HR: {
    description:
      'Employee records, performance reviews, training matrices, and competency tracking.',
    port: 3006,
  },
  Payroll: {
    description:
      'Salary processing, tax calculations across 40+ jurisdictions, benefits, and deductions.',
    port: 3007,
  },
  Workflows: {
    description:
      'Visual workflow builder with 6 ISO templates, approval chains, and automated triggers.',
    port: 3008,
  },
  'Project Management': {
    description: 'Tasks, milestones, Gantt charts, resource allocation, and project dashboards.',
    port: 3009,
  },
  Finance: {
    description: 'Accounts, budgets, invoicing, expense tracking, and financial reporting.',
    port: 3013,
  },
  CRM: {
    description:
      'Customer contacts, deals pipeline, support tickets, and customer satisfaction tracking.',
    port: 3014,
  },
  CMMS: {
    description:
      'Work orders, preventive maintenance schedules, asset lifecycle, and spare parts inventory.',
    port: 3017,
  },
  'Field Service': {
    description:
      'Job dispatch, mobile workforce management, route optimization, and time tracking.',
    port: 3023,
  },
  Analytics: {
    description: 'Cross-module dashboards, custom reports, trend analysis, and data export.',
    port: 3022,
  },
  Risk: {
    description:
      'Enterprise risk register, bow-tie analysis, KRIs, risk appetite statements, and heat maps.',
    iso: 'ISO 31000',
    port: 3031,
  },
  Incidents: {
    description:
      'Incident reporting, investigation workflows, root cause analysis, and lessons learned.',
    port: 3041,
  },
  Audits: {
    description: 'Audit planning, checklists, findings management, and corrective action tracking.',
    port: 3042,
  },
  Complaints: {
    description:
      'Customer complaint logging, investigation, resolution tracking, and trend analysis.',
    port: 3036,
  },
  'Regulatory Monitor': {
    description:
      'Live regulatory feed, compliance calendar, obligation tracking, and change impact assessment.',
    port: 3040,
  },
  'Management Review': {
    description: 'Meeting scheduling, agenda management, action items, and minutes documentation.',
    port: 3043,
  },
  'Permit to Work': {
    description: 'Permit requests, approvals, isolation management, and permit-to-work registers.',
    port: 3039,
  },
  Emergency: {
    description:
      'Fire risk assessments, evacuation drills, business continuity plans, and PEEP management.',
    iso: 'ISO 22301',
    port: 3045,
  },
  Chemicals: {
    description:
      'Chemical register, SDS management, COSHH assessments, exposure monitoring, and GHS classification.',
    port: 3044,
  },
  Documents: {
    description:
      'Document control, version management, approval workflows, and distribution tracking.',
    port: 3035,
  },
  Templates: {
    description: '192 built-in templates across 34 modules in DOCX format, mapped to ISO clauses.',
    port: 3000,
  },
  Training: {
    description:
      'Training plans, course management, competency assessments, and certification tracking.',
    port: 3032,
  },
  Suppliers: {
    description:
      'Supplier database, evaluations, approved supplier lists, and performance scorecards.',
    port: 3033,
  },
  Assets: {
    description:
      'Asset register, depreciation tracking, maintenance schedules, and disposal management.',
    port: 3034,
  },
  Contracts: {
    description:
      'Contract lifecycle management, renewals, obligations tracking, and electronic signatures.',
    port: 3037,
  },
};

const FAQ: Record<string, string> = {
  'how many modules': `Nexara has 42+ modules covering ISO compliance, operations, risk & governance, AI intelligence, and portals. Each module integrates with others through the shared data platform.`,
  'what iso standards': `Nexara covers ISO 45001 (H&S), ISO 14001 (Environmental), ISO 9001 (Quality), ISO 27001 (InfoSec), ISO 42001 (AI), ISO 37001 (Anti-Bribery), ISO 22000 (Food Safety), ISO 50001 (Energy), ISO 31000 (Risk), ISO 22301 (Business Continuity), AS9100 (Aerospace), IATF 16949 (Automotive), and ISO 13485 (Medical Devices).`,
  'how does ai work': `The AI engine supports 35+ analysis types including root-cause analysis, compliance gap detection, predictive risk scoring, semantic search, and document analysis. It uses your organisation's data to provide contextual recommendations.`,
  'what is capa': `CAPA stands for Corrective and Preventive Action. It's a systematic process to identify root causes of non-conformances, implement corrective actions, and prevent recurrence. Nexara's CAPA workflows are integrated across Quality, H&S, Environmental, and other modules.`,
  'how do i get started': `Start by completing the setup wizard (/setup) to select your ISO standards and seed initial documents. Then explore the dashboard, create your first risk assessment, and invite team members. The onboarding checklist will guide you through the key steps.`,
  'what are evidence packs': `Evidence packs are audit-ready document bundles that combine policies, procedures, records, and evidence for a specific ISO clause or audit topic. They can be generated automatically from your templates and controlled documents.`,
  'how does risk connect': `The Risk module integrates with Incidents (incidents update risk likelihood), Audits (findings create CAPA), Regulatory Monitor (new regulations create risk items), and the Dashboard (risk KPIs and heat maps).`,
  'what templates': `Nexara includes 192 built-in templates across 34 modules in DOCX format. Each template is mapped to specific ISO clauses and can be customised. Templates cover policies, procedures, forms, registers, reports, and plans.`,
  'bow-tie': `Bow-tie analysis is a risk visualisation method showing threats on the left, the risk event in the centre, and consequences on the right. Preventive controls are placed between threats and the event, while mitigating controls are placed between the event and consequences.`,
  'invite team': `Go to Settings (port 3004) to manage users and roles. You can invite team members by email and assign them specific roles with granular RBAC permissions across all 42 modules.`,
};

function findFaqAnswer(question: string): string | null {
  const lower = question.toLowerCase();
  for (const [key, answer] of Object.entries(FAQ)) {
    if (lower.includes(key)) return answer;
  }
  return null;
}

function findRelevantModules(question: string): string[] {
  const lower = question.toLowerCase();
  const matches: string[] = [];
  for (const [name, info] of Object.entries(MODULE_KB)) {
    const searchText = `${name} ${info.description} ${info.iso || ''}`.toLowerCase();
    const words = lower.split(/\s+/).filter((w) => w.length > 3);
    if (words.some((w) => searchText.includes(w))) {
      matches.push(name);
    }
  }
  return matches.slice(0, 5);
}

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = assistantSchema.parse(req.body);

    // Try FAQ first
    const faqAnswer = findFaqAnswer(body.question);
    if (faqAnswer) {
      const suggestedModules = findRelevantModules(body.question);
      return res.json({
        success: true,
        data: { answer: faqAnswer, suggestedModules, relatedFeatures: [] },
      });
    }

    // Try AI provider
    let aiAnswer: string | null = null;
    try {
      const settings = await prisma.aISettings.findFirst({ where: { isActive: true } as any });
      if (settings?.apiKey) {
        const moduleList = Object.entries(MODULE_KB)
          .map(
            ([name, info]) => `- ${name}${info.iso ? ` (${info.iso})` : ''}: ${info.description}`
          )
          .join('\n');

        const systemPrompt = `You are the Nexara IMS assistant. Answer questions about the Integrated Management System. Be concise (2-4 sentences max). Here are the available modules:\n\n${moduleList}\n\nKey facts:\n- 42+ modules, 192 templates, 35+ AI analysis types\n- All modules share data through a unified platform\n- RBAC with 39 roles and 7 permission levels\n- Supports 10+ ISO standards`;

        const payload: Record<string, unknown> = {
          model: settings.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: body.question },
          ],
          max_tokens: 300,
          temperature: 0.3,
        };

        const provider = settings.provider || 'OPENAI';
        let apiUrl = 'https://api.openai.com/v1/chat/completions';
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };

        if (provider === 'OPENAI') {
          headers['Authorization'] = `Bearer ${settings.apiKey}`;
        } else if (provider === 'ANTHROPIC') {
          apiUrl = 'https://api.anthropic.com/v1/messages';
          headers['x-api-key'] = settings.apiKey;
          headers['anthropic-version'] = '2023-06-01';
          payload.model = settings.model || 'claude-sonnet-4-5-20250929';
          payload.max_tokens = 300;
          payload.system = systemPrompt;
          payload.messages = [{ role: 'user', content: body.question }];
        } else if (provider === 'GROK') {
          apiUrl = 'https://api.x.ai/v1/chat/completions';
          headers['Authorization'] = `Bearer ${settings.apiKey}`;
        }

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(15000),
        });

        if (response.ok) {
          const data: any = await response.json();
          if (provider === 'ANTHROPIC') {
            aiAnswer = data.content?.[0]?.text || null;
          } else {
            aiAnswer = data.choices?.[0]?.message?.content || null;
          }
        }
      }
    } catch {
      // AI provider unavailable, fall through to fallback
    }

    if (aiAnswer) {
      const suggestedModules = findRelevantModules(body.question);
      return res.json({
        success: true,
        data: { answer: aiAnswer, suggestedModules, relatedFeatures: [] },
      });
    }

    // Fallback: module-based answer
    const relevantModules = findRelevantModules(body.question);
    if (relevantModules.length > 0) {
      const descriptions = relevantModules
        .map((name) => {
          const info = MODULE_KB[name];
          return `**${name}**${info.iso ? ` (${info.iso})` : ''}: ${info.description}`;
        })
        .join('\n\n');
      return res.json({
        success: true,
        data: {
          answer: `Here are the most relevant modules for your question:\n\n${descriptions}`,
          suggestedModules: relevantModules,
          relatedFeatures: [],
        },
      });
    }

    // Generic fallback
    return res.json({
      success: true,
      data: {
        answer:
          "I'm not sure about that specific topic. Try asking about ISO standards, specific modules (like Risk, Quality, or H&S), integrations between modules, or how to get started with Nexara.",
        suggestedModules: [],
        relatedFeatures: [],
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid input' },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});

export default router;
