import type { Meta, StoryObj } from '@storybook/react';
import { ChangelogBell, type ChangelogEntry } from './changelog-bell';

const meta: Meta<typeof ChangelogBell> = {
  title: 'Components/ChangelogBell',
  component: ChangelogBell,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChangelogBell>;

const sampleEntries: ChangelogEntry[] = [
  {
    id: '1',
    title: 'Risk Heat Map Visualisation',
    description: 'Interactive heat maps are now available in the Risk Management module.',
    category: 'new_feature',
    modules: ['risk'],
    publishedAt: '2026-02-17T10:00:00Z',
  },
  {
    id: '2',
    title: 'Faster Dashboard Loading',
    description: 'Dashboard load times reduced by 40% with optimised queries.',
    category: 'improvement',
    modules: ['dashboard'],
    publishedAt: '2026-02-15T10:00:00Z',
  },
  {
    id: '3',
    title: 'Fixed Export Date Format',
    description: 'CSV exports now use ISO 8601 date format consistently.',
    category: 'bug_fix',
    modules: ['analytics', 'reports'],
    publishedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: '4',
    title: 'Security Patch Applied',
    description: 'Updated dependencies to address CVE-2026-1234.',
    category: 'security',
    modules: [],
    publishedAt: '2026-02-13T10:00:00Z',
  },
];

export const WithUnread: Story = {
  args: {
    entries: sampleEntries,
    unreadCount: 3,
  },
};

export const AllRead: Story = {
  args: {
    entries: sampleEntries,
    unreadCount: 0,
  },
};

export const Empty: Story = {
  args: {
    entries: [],
    unreadCount: 0,
  },
};

export const ManyUnread: Story = {
  args: {
    entries: sampleEntries,
    unreadCount: 12,
  },
};
