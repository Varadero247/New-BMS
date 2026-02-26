import type { Meta, StoryObj } from '@storybook/react';
import { TopBar } from './top-bar';
import { PlanBadge } from './plan-badge';
import { Badge } from './badge';

const meta: Meta<typeof TopBar> = {
  title: 'Layout/TopBar',
  component: TopBar,
  tags: ['autodocs'],
  argTypes: {
    userName: { control: 'text' },
    userInitials: { control: 'text' },
    orgName: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof TopBar>;

export const Default: Story = {
  args: {
    userName: 'John Smith',
    userInitials: 'JS',
    orgName: 'Acme Corp',
  },
};

export const WithPlanBadge: Story = {
  args: {
    userName: 'Jane Doe',
    userInitials: 'JD',
    orgName: 'Nexara DMCC',
    planBadge: <PlanBadge plan="enterprise" />,
  },
};

export const WithNotificationSlot: Story = {
  args: {
    userName: 'Admin User',
    userInitials: 'AU',
    orgName: 'Test Organisation',
    notificationSlot: (
      <button style={{ position: 'relative', padding: '8px' }}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M10 2a6 6 0 016 6v3l2 2H2l2-2V8a6 6 0 016-6zM8 17h4" />
        </svg>
        <Badge
          variant="danger"
          style={{ position: 'absolute', top: 0, right: 0, fontSize: '10px' }}
        >
          3
        </Badge>
      </button>
    ),
  },
};

export const MinimalTopBar: Story = {
  args: {
    userName: 'User',
    userInitials: 'U',
  },
};
