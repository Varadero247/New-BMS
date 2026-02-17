import type { Meta, StoryObj } from '@storybook/react';
import { AppSidebar } from './app-sidebar';

const meta: Meta<typeof AppSidebar> = {
  title: 'Nexara/AppSidebar',
  component: AppSidebar,
  tags: ['autodocs'],
  argTypes: {
    activeId: { control: 'text' },
    moduleColor: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof AppSidebar>;

export const Default: Story = {
  args: {
    moduleColor: '#3b82f6',
    activeId: 'risks',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'risks', label: 'Risk Register', href: '/risks', group: 'Management' },
      { id: 'controls', label: 'Controls', href: '/controls', group: 'Management' },
      { id: 'actions', label: 'Actions', href: '/actions', group: 'Management' },
      { id: 'kri', label: 'Key Risk Indicators', href: '/kri', group: 'Monitoring' },
      { id: 'analytics', label: 'Analytics', href: '/analytics', group: 'Monitoring' },
    ],
  },
};

export const HealthSafety: Story = {
  args: {
    moduleColor: '#ef4444',
    activeId: 'incidents',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'incidents', label: 'Incidents', href: '/incidents' },
      { id: 'hazards', label: 'Hazards', href: '/hazards' },
      { id: 'risk-assessments', label: 'Risk Assessments', href: '/risk-assessments' },
      { id: 'actions', label: 'Actions', href: '/actions' },
      { id: 'training', label: 'Training', href: '/training' },
    ],
  },
};

export const WithGroups: Story = {
  args: {
    moduleColor: '#22c55e',
    activeId: 'aspects',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'aspects', label: 'Aspects', href: '/aspects', group: 'Environmental' },
      { id: 'events', label: 'Events', href: '/events', group: 'Environmental' },
      { id: 'legal', label: 'Legal Register', href: '/legal', group: 'Compliance' },
      { id: 'objectives', label: 'Objectives', href: '/objectives', group: 'Compliance' },
      { id: 'capa', label: 'CAPA', href: '/capa', group: 'Improvement' },
    ],
  },
};
