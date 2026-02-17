import type { Meta, StoryObj } from '@storybook/react';
import { ChangelogBanner } from './changelog-banner';

const meta: Meta<typeof ChangelogBanner> = {
  title: 'Components/ChangelogBanner',
  component: ChangelogBanner,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    body: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ChangelogBanner>;

export const Default: Story = {
  args: {
    title: 'New Feature: Risk Heat Maps',
    body: 'Visualise your risk landscape with interactive heat maps. Available now in the Risk Management module.',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Scheduled Maintenance',
    body: 'The system will undergo maintenance on Saturday 22 Feb 2026 from 02:00-04:00 UTC.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L2 18h16L10 2z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M10 8v4M10 14h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
};

export const LongContent: Story = {
  args: {
    title: 'ISO 42001 AI Management System Now Available',
    body: 'We are excited to announce full support for ISO 42001:2023 — the international standard for AI management systems. This includes risk assessments, impact analysis, data governance, and model lifecycle tracking. Get started from the modules page.',
  },
};
