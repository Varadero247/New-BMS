import type { Meta, StoryObj } from '@storybook/react';
import { ActivityFeed, ActivityFeedInline, type ActivityEntry } from './activity-feed';

const meta: Meta<typeof ActivityFeed> = {
  title: 'Components/ActivityFeed',
  component: ActivityFeed,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ActivityFeed>;

const sampleEntries: ActivityEntry[] = [
  {
    id: '1',
    orgId: 'org-1',
    recordType: 'risk',
    recordId: 'risk-001',
    userId: 'user-1',
    userName: 'John Smith',
    action: 'created',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: '2',
    orgId: 'org-1',
    recordType: 'risk',
    recordId: 'risk-001',
    userId: 'user-2',
    userName: 'Jane Doe',
    action: 'updated',
    field: 'severity',
    oldValue: 'MEDIUM',
    newValue: 'HIGH',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '3',
    orgId: 'org-1',
    recordType: 'risk',
    recordId: 'risk-001',
    userId: 'user-3',
    userName: 'Bob Wilson',
    action: 'commented',
    comment: 'Needs review before next audit',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: '4',
    orgId: 'org-1',
    recordType: 'action',
    recordId: 'ca-012',
    userId: 'user-4',
    userName: 'Alice Brown',
    action: 'approved',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export const Default: Story = {
  args: {
    entries: sampleEntries,
  },
};

export const Empty: Story = {
  args: {
    entries: [],
  },
};

export const Inline: Story = {
  render: () => (
    <ActivityFeedInline
      entries={sampleEntries.slice(0, 3)}
      onViewAll={() => alert('View all clicked')}
    />
  ),
};

export const SingleEntry: Story = {
  args: {
    entries: [sampleEntries[0]],
  },
};
