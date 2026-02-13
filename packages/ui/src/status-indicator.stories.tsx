import type { Meta, StoryObj } from '@storybook/react';
import { StatusIndicator } from './status-indicator';

const meta: Meta<typeof StatusIndicator> = {
  title: 'Components/StatusIndicator',
  component: StatusIndicator,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['operational', 'degraded', 'partial-outage', 'major-outage', 'unknown'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showLabel: { control: 'boolean' },
    pulse: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof StatusIndicator>;

export const Operational: Story = {
  args: {
    status: 'operational',
    showLabel: true,
  },
};

export const Degraded: Story = {
  args: {
    status: 'degraded',
    showLabel: true,
  },
};

export const PartialOutage: Story = {
  args: {
    status: 'partial-outage',
    showLabel: true,
  },
};

export const MajorOutage: Story = {
  args: {
    status: 'major-outage',
    showLabel: true,
  },
};

export const Unknown: Story = {
  args: {
    status: 'unknown',
    showLabel: true,
  },
};

export const OperationalWithPulse: Story = {
  args: {
    status: 'operational',
    showLabel: true,
    pulse: true,
  },
};

export const DotOnly: Story = {
  args: {
    status: 'operational',
    showLabel: false,
  },
};

export const SmallSize: Story = {
  args: {
    status: 'operational',
    size: 'sm',
    showLabel: true,
  },
};

export const MediumSize: Story = {
  args: {
    status: 'degraded',
    size: 'md',
    showLabel: true,
  },
};

export const LargeSize: Story = {
  args: {
    status: 'major-outage',
    size: 'lg',
    showLabel: true,
  },
};

export const CustomLabel: Story = {
  args: {
    status: 'operational',
    label: 'All Systems Online',
    showLabel: true,
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <StatusIndicator status="operational" showLabel={true} />
      <StatusIndicator status="degraded" showLabel={true} />
      <StatusIndicator status="partial-outage" showLabel={true} />
      <StatusIndicator status="major-outage" showLabel={true} />
      <StatusIndicator status="unknown" showLabel={true} />
    </div>
  ),
};

export const WithPulseVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <StatusIndicator status="operational" showLabel={true} pulse={true} />
      <StatusIndicator status="degraded" showLabel={true} pulse={false} />
      <StatusIndicator status="major-outage" showLabel={true} pulse={false} />
    </div>
  ),
};

export const SizeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <StatusIndicator status="operational" size="sm" showLabel={true} />
      <StatusIndicator status="operational" size="md" showLabel={true} />
      <StatusIndicator status="operational" size="lg" showLabel={true} />
    </div>
  ),
};
