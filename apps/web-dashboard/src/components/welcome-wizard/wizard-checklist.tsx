'use client';

import { OnboardingChecklist } from '@ims/ui';

const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost';

const CHECKLIST_ITEMS = [
  { id: 'explore-dashboard', title: 'Explore the dashboard', description: 'Browse your IMS overview and KPIs', href: '/' },
  { id: 'open-hs', title: 'Open Health & Safety', description: 'Visit the H&S module to manage risks and incidents', href: `${APP_BASE}:3001` },
  { id: 'create-risk', title: 'Create your first risk', description: 'Add a risk to the enterprise risk register', href: `${APP_BASE}:3031/risks/new` },
  { id: 'invite-team', title: 'Invite a team member', description: 'Add colleagues and assign roles', href: `${APP_BASE}:3004` },
  { id: 'generate-report', title: 'Generate a report', description: 'Use templates to create your first document', href: '/templates' },
  { id: 'take-tour', title: 'Take the dashboard tour', description: 'Get a guided walkthrough of the main dashboard', href: '/' },
  { id: 'complete-setup', title: 'Complete the setup wizard', description: 'Configure ISO standards and seed initial data', href: '/setup' },
];

interface WizardChecklistProps {
  show: boolean;
  completedItems: Record<string, boolean>;
  onDismiss: () => void;
  onItemClick: (id: string) => void;
}

export function WizardChecklist({ show, completedItems, onDismiss, onItemClick }: WizardChecklistProps) {
  if (!show) return null;

  const steps = CHECKLIST_ITEMS.map((item) => ({
    ...item,
    completed: !!completedItems[item.id],
  }));

  return (
    <OnboardingChecklist
      steps={steps}
      onDismiss={onDismiss}
      onStepClick={(step) => onItemClick(step.id)}
    />
  );
}
