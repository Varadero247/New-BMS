import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './status-badge';

const meta: Meta<typeof StatusBadge> = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['compliant', 'at-risk', 'non-compliant', 'in-review', 'pending'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Compliant: Story = {
  args: { status: 'compliant', label: 'Compliant' },
};

export const AtRisk: Story = {
  args: { status: 'at-risk', label: 'At Risk' },
};

export const NonCompliant: Story = {
  args: { status: 'non-compliant', label: 'Non-Compliant' },
};

export const InReview: Story = {
  args: { status: 'in-review', label: 'In Review' },
};

export const Pending: Story = {
  args: { status: 'pending', label: 'Pending' },
};

export const Small: Story = {
  args: { status: 'compliant', label: 'Compliant', size: 'sm' },
};

export const Large: Story = {
  args: { status: 'non-compliant', label: 'Non-Compliant', size: 'lg' },
};

export const DefaultLabel: Story = {
  args: { status: 'compliant' },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      <StatusBadge status="compliant" />
      <StatusBadge status="at-risk" />
      <StatusBadge status="non-compliant" />
      <StatusBadge status="in-review" />
      <StatusBadge status="pending" />
    </div>
  ),
};
