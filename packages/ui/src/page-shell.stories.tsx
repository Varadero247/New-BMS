import type { Meta, StoryObj } from '@storybook/react';
import { PageShell } from './page-shell';

const meta: Meta<typeof PageShell> = {
  title: 'Layout/PageShell',
  component: PageShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PageShell>;

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'risks', label: 'Risk Register', href: '/risks', group: 'Management' },
  { id: 'controls', label: 'Controls', href: '/controls', group: 'Management' },
  { id: 'kri', label: 'Key Risk Indicators', href: '/kri', group: 'Monitoring' },
  { id: 'analytics', label: 'Analytics', href: '/analytics', group: 'Monitoring' },
  { id: 'settings', label: 'Settings', href: '/settings' },
];

export const Default: Story = {
  args: {
    moduleName: 'Risk Management',
    moduleColor: '#f59e0b',
    sidebarItems,
    activeNavId: 'risks',
    user: { name: 'John Smith', initials: 'JS' },
    children: (
      <div style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Risk Register</h1>
        <p style={{ color: '#999' }}>Risk management content area.</p>
      </div>
    ),
  },
};

export const DashboardView: Story = {
  args: {
    moduleName: 'ESG Reporting',
    moduleColor: '#22c55e',
    sidebarItems: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'emissions', label: 'Emissions', href: '/emissions' },
      { id: 'social', label: 'Social', href: '/social' },
      { id: 'governance', label: 'Governance', href: '/governance' },
    ],
    activeNavId: 'dashboard',
    user: { name: 'Jane Doe', initials: 'JD' },
    children: (
      <div style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>ESG Dashboard</h1>
      </div>
    ),
  },
};
