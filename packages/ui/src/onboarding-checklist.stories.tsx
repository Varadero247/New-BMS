import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { OnboardingChecklist, type OnboardingStep } from './onboarding-checklist';

const meta: Meta<typeof OnboardingChecklist> = {
  title: 'Components/OnboardingChecklist',
  component: OnboardingChecklist,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OnboardingChecklist>;

const sampleSteps: OnboardingStep[] = [
  {
    id: '1',
    title: 'Create your first risk',
    description: 'Add a risk to the register',
    completed: true,
    href: '/risks/new',
  },
  {
    id: '2',
    title: 'Set up notifications',
    description: 'Configure email alerts',
    completed: true,
    href: '/settings/notifications',
  },
  {
    id: '3',
    title: 'Invite team members',
    description: 'Add users to your organisation',
    completed: false,
    href: '/settings/users',
  },
  {
    id: '4',
    title: 'Upload documents',
    description: 'Import your existing documents',
    completed: false,
    href: '/documents',
  },
  {
    id: '5',
    title: 'Configure RBAC',
    description: 'Set up roles and permissions',
    completed: false,
    href: '/settings/roles',
  },
];

export const Default: Story = {
  args: {
    steps: sampleSteps,
    onStepClick: (step: OnboardingStep) => console.log('Step clicked:', step.title),
    onDismiss: () => console.log('Dismissed'),
  },
};

export const AllComplete: Story = {
  args: {
    steps: sampleSteps.map((s) => ({ ...s, completed: true })),
    onStepClick: (step: OnboardingStep) => console.log('Step clicked:', step.title),
    onDismiss: () => console.log('Dismissed'),
  },
};

export const NoneComplete: Story = {
  args: {
    steps: sampleSteps.map((s) => ({ ...s, completed: false })),
    onStepClick: (step: OnboardingStep) => console.log('Step clicked:', step.title),
    onDismiss: () => console.log('Dismissed'),
  },
};

export const Interactive: Story = {
  render: () => {
    const [steps, setSteps] = useState(sampleSteps);
    return (
      <OnboardingChecklist
        steps={steps}
        onStepClick={(step) => {
          setSteps((prev) =>
            prev.map((s) => (s.id === step.id ? { ...s, completed: !s.completed } : s))
          );
        }}
        onDismiss={() => alert('Checklist dismissed')}
      />
    );
  },
};

export const WithoutDismiss: Story = {
  args: {
    steps: sampleSteps,
    onStepClick: (step: OnboardingStep) => console.log('Step clicked:', step.title),
  },
};
