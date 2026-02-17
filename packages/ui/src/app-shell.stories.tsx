import type { Meta, StoryObj } from '@storybook/react';
import { AppShell, type NavSection } from './app-shell';

const meta: Meta<typeof AppShell> = {
  title: 'Layout/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

const sampleNavSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Calendar', href: '/calendar' },
    ],
  },
  {
    title: 'Management',
    items: [
      { name: 'Risk Register', href: '/risks' },
      { name: 'Incidents', href: '/incidents' },
      { name: 'Actions', href: '/actions' },
      { name: 'Audits', href: '/audits' },
    ],
  },
  {
    title: 'Reports',
    items: [
      { name: 'Analytics', href: '/analytics' },
      { name: 'Templates', href: '/templates' },
    ],
  },
];

export const Default: Story = {
  args: {
    moduleName: 'Health & Safety',
    moduleDescription: 'ISO 45001 Management',
    moduleAccent: '#ef4444',
    navSections: sampleNavSections,
    pathname: '/dashboard',
    children: (
      <div style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Dashboard</h1>
        <p style={{ color: '#666' }}>Module content goes here.</p>
      </div>
    ),
  },
};

export const QualityModule: Story = {
  args: {
    moduleName: 'Quality',
    moduleDescription: 'ISO 9001 Management',
    moduleAccent: '#3b82f6',
    navSections: [
      {
        title: 'Quality',
        items: [
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'NCRs', href: '/ncrs' },
          { name: 'CAPAs', href: '/capas' },
          { name: 'Documents', href: '/documents' },
        ],
      },
    ],
    pathname: '/ncrs',
    children: (
      <div style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Non-Conformance Reports</h1>
      </div>
    ),
  },
};

export const WithFooterLinks: Story = {
  args: {
    moduleName: 'Environment',
    moduleAccent: '#22c55e',
    navSections: sampleNavSections,
    pathname: '/dashboard',
    footerLinks: [
      { name: 'Settings', href: '/settings' },
      { name: 'Help', href: '/help' },
    ],
    children: (
      <div style={{ padding: '24px' }}>
        <p>Content with footer navigation links in sidebar.</p>
      </div>
    ),
  },
};
