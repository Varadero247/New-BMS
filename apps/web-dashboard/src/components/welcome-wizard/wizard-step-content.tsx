'use client';

import {
  Sparkles,
  Shield,
  Wrench,
  AlertTriangle,
  Brain,
  FileText,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export interface IntegrationCallout {
  from: string;
  to: string;
  description: string;
}

export interface WizardStep {
  title: string;
  subtitle: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
  integrations: IntegrationCallout[];
  cta?: { label: string; href: string };
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    title: 'Welcome to Nexara',
    subtitle: 'Your Integrated Management System',
    body: 'Nexara brings 42+ modules into one unified platform, covering ISO compliance, operations, risk management, and AI-powered intelligence. Everything works together so you never have to switch between disconnected tools again.',
    icon: Sparkles,
    integrations: [],
  },
  {
    title: 'ISO Compliance',
    subtitle: '10+ standards in one place',
    body: 'Manage ISO 45001 (Health & Safety), ISO 14001 (Environmental), ISO 9001 (Quality), ISO 27001 (InfoSec), ISO 42001 (AI Management), ISO 37001 (Anti-Bribery), and more. Each standard has its own registers, audit trails, CAPA workflows, and document controls.',
    icon: Shield,
    integrations: [
      {
        from: 'Quality NCRs',
        to: 'CAPA Workflows',
        description: 'Non-conformances automatically create corrective action requests',
      },
      {
        from: 'Env Aspects',
        to: 'ESG Reporting',
        description: 'Environmental aspect data flows into sustainability reports',
      },
      {
        from: 'Audit Findings',
        to: 'Risk Register',
        description: 'Audit non-conformances update risk scores automatically',
      },
    ],
  },
  {
    title: 'Operations',
    subtitle: 'Run your entire business',
    body: 'Inventory, HR, Payroll, Project Management, Finance, CRM, CMMS, Field Service, Analytics, and Workflows. All operational modules share data so you get a single source of truth across departments.',
    icon: Wrench,
    integrations: [
      {
        from: 'CMMS Work Orders',
        to: 'Inventory Parts',
        description: 'Maintenance jobs automatically reserve and consume spare parts',
      },
      {
        from: 'HR Training',
        to: 'Certifications',
        description: 'Employee training completions update competency matrices',
      },
      {
        from: 'Field Service Jobs',
        to: 'Finance Invoicing',
        description: 'Completed field jobs generate invoices automatically',
      },
    ],
  },
  {
    title: 'Risk & Governance',
    subtitle: 'Stay ahead of threats',
    body: 'Enterprise Risk Register with bow-tie analysis, Incident Management, Internal Audits, Complaints, Regulatory Monitor, Management Review, Permit to Work, and Emergency Response. All governance modules feed into a unified risk picture.',
    icon: AlertTriangle,
    integrations: [
      {
        from: 'Incidents',
        to: 'Risk Scores',
        description: 'Reported incidents automatically adjust risk likelihood ratings',
      },
      {
        from: 'Audit Findings',
        to: 'CAPA Actions',
        description: 'Non-conformances from audits create tracked corrective actions',
      },
      {
        from: 'Reg Changes',
        to: 'Compliance Calendar',
        description: 'New regulatory changes appear as action items on your calendar',
      },
    ],
  },
  {
    title: 'AI Intelligence',
    subtitle: '35+ analysis types',
    body: "AI-powered root-cause analysis, compliance gap detection, predictive risk scoring, semantic search across all documents, and automated report generation. The AI learns from your organisation's data to provide contextual recommendations.",
    icon: Brain,
    integrations: [
      {
        from: 'AI Insights',
        to: 'Dashboard KPIs',
        description: 'AI analysis results surface as actionable items on your dashboard',
      },
      {
        from: 'Documents',
        to: 'Gap Analysis',
        description: 'Upload policies and the AI identifies compliance gaps automatically',
      },
    ],
  },
  {
    title: 'Templates & Documents',
    subtitle: '192 built-in templates',
    body: 'Pre-built templates covering 34 modules in DOCX format, mapped to specific ISO clauses. Use them as-is or customise them. Templates feed into the document management system for version control and approval workflows.',
    icon: FileText,
    integrations: [
      {
        from: 'Templates',
        to: 'Documents Module',
        description: 'Generate controlled documents from templates with auto-numbering',
      },
      {
        from: 'Templates',
        to: 'Evidence Packs',
        description: 'Bundle templates into audit-ready evidence packs for certification',
      },
    ],
  },
  {
    title: "You're All Set!",
    subtitle: 'Start exploring',
    body: 'You\'ve seen the highlights. Use the checklist below to get started, or take a guided tour of the dashboard. You can always reopen this guide from the sidebar under "Help & Discovery".',
    icon: CheckCircle2,
    integrations: [],
  },
];

interface WizardStepContentProps {
  stepIndex: number;
}

export function WizardStepContent({ stepIndex }: WizardStepContentProps) {
  const step = WIZARD_STEPS[stepIndex];
  if (!step) return null;

  const Icon = step.icon;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[var(--raised)] border border-[var(--border)]">
          <Icon className="h-6 w-6 text-[var(--blue-mid,#3b82f6)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--white,#f8fafc)]">{step.title}</h3>
          <p className="text-sm text-[var(--steel,#94a3b8)]">{step.subtitle}</p>
        </div>
      </div>

      {/* Body */}
      <p className="text-sm leading-relaxed text-[var(--silver,#cbd5e1)]">{step.body}</p>

      {/* Integration callouts */}
      {step.integrations.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--steel,#94a3b8)]">
            Key Integrations
          </p>
          <div className="space-y-2">
            {step.integrations.map((integ, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-[var(--raised,#1e293b)] border border-[var(--border,#334155)]"
              >
                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-[var(--teal-core,#14b8a6)]">
                    {integ.from}
                  </span>
                  <ArrowRight className="h-3 w-3 text-[var(--steel,#94a3b8)]" />
                  <span className="text-xs font-medium text-[var(--blue-mid,#3b82f6)]">
                    {integ.to}
                  </span>
                </div>
                <span className="text-xs text-[var(--steel,#94a3b8)] leading-relaxed">
                  {integ.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {step.cta && (
        <a
          href={step.cta.href}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--blue-mid,#3b82f6)] hover:underline"
        >
          {step.cta.label}
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}
