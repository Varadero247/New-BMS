import type { Meta, StoryObj } from '@storybook/react';
import { OnboardingChecklist } from './onboarding-checklist';

const meta: Meta<typeof OnboardingChecklist> = {
  title: 'Components/OnboardingChecklist',
  component: OnboardingChecklist,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OnboardingChecklist>;

export const Default: Story = {
  args: {
    steps: [
      { id: '1', title: 'Create your first risk', description: 'Add a risk to the register', completed: true },
      { id: '2', title: 'Set up notifications', description: 'Configure email alerts', completed: true },
      { id: '3', title: 'Invite team members', description: 'Add users to your organisation', completed: false },
      { id: '4', title: 'Upload documents', description: 'Import your existing documents', completed: false },
      { id: '5', title: 'Configure RBAC', description: 'Set up roles and permissions', completed: false },
    ],
    onToggle: (id: string) => console.log('Toggle', id),
    onDismiss: () => console.log('Dismissed'),
  },
};
