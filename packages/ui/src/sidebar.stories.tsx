import type { Meta, StoryObj } from '@storybook/react';
import { AppSidebar } from './app-sidebar';

const meta: Meta<typeof AppSidebar> = {
  title: 'Layout/Sidebar',
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
    moduleColor: '#1E3A8A',
    activeId: 'dashboard',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'incidents', label: 'Incidents', href: '/incidents' },
      { id: 'assets', label: 'Assets', href: '/assets' },
      { id: 'work-orders', label: 'Work Orders', href: '/work-orders' },
      { id: 'reports', label: 'Reports', href: '/reports' },
      { id: 'settings', label: 'Settings', href: '/settings' },
    ],
  },
};

export const WithGroups: Story = {
  args: {
    moduleColor: '#ef4444',
    activeId: 'incidents',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'incidents', label: 'Incidents', href: '/incidents', group: 'Safety' },
      { id: 'hazards', label: 'Hazards', href: '/hazards', group: 'Safety' },
      { id: 'risk-assessments', label: 'Risk Assessments', href: '/risk-assessments', group: 'Safety' },
      { id: 'work-orders', label: 'Work Orders', href: '/work-orders', group: 'Maintenance' },
      { id: 'alerts', label: 'Alerts', href: '/alerts', group: 'Maintenance' },
    ],
  },
};
