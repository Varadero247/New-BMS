import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './stat-card';

const meta: Meta<typeof StatCard> = {
  title: 'Components/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  argTypes: {
    trend: {
      control: 'object',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    label: 'Total Revenue',
    value: '$45,231.89',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Total Revenue',
    value: '$45,231.89',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
};

export const TrendUp: Story = {
  args: {
    label: 'Total Users',
    value: '2,543',
    trend: {
      value: 12.5,
      direction: 'up',
    },
    description: 'compared to last month',
  },
};

export const TrendDown: Story = {
  args: {
    label: 'Churn Rate',
    value: '3.2%',
    trend: {
      value: 2.1,
      direction: 'down',
    },
    description: 'improvement from last quarter',
  },
};

export const TrendNeutral: Story = {
  args: {
    label: 'Average Score',
    value: '7.8/10',
    trend: {
      value: 0.1,
      direction: 'neutral',
    },
    description: 'stable performance',
  },
};

export const WithIconAndTrend: Story = {
  args: {
    label: 'Conversion Rate',
    value: '8.5%',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    trend: {
      value: 5.3,
      direction: 'up',
    },
  },
};

export const LargeValue: Story = {
  args: {
    label: 'Total Transactions',
    value: '1,234,567',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    description: 'All time record',
  },
};

export const NegativeValue: Story = {
  args: {
    label: 'Error Count',
    value: '42',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    trend: {
      value: 8.2,
      direction: 'down',
    },
    description: 'reduced from last week',
  },
};

export const MultipleCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Revenue"
        value="$45,231.89"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        trend={{ value: 20.1, direction: 'up' }}
      />
      <StatCard
        label="Total Users"
        value="2,543"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        }
        trend={{ value: 15.3, direction: 'up' }}
      />
      <StatCard
        label="Active Sessions"
        value="1,231"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        }
        trend={{ value: 2.5, direction: 'neutral' }}
      />
      <StatCard
        label="Bounce Rate"
        value="32.5%"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        }
        trend={{ value: 4.3, direction: 'down' }}
      />
    </div>
  ),
};

export const CompactLayout: Story = {
  render: () => (
    <div className="space-y-2">
      <StatCard label="Success Rate" value="99.5%" trend={{ value: 0.5, direction: 'up' }} />
      <StatCard
        label="Response Time"
        value="142ms"
        trend={{ value: 12, direction: 'down' }}
        description="faster than yesterday"
      />
      <StatCard label="CPU Usage" value="45%" trend={{ value: 3, direction: 'up' }} />
    </div>
  ),
};

export const DifferentTrends: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        label="Positive Trend"
        value="↑ 42%"
        trend={{ value: 25, direction: 'up' }}
        description="Growing steadily"
        icon={
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        }
      />
      <StatCard
        label="Negative Trend"
        value="↓ 18%"
        trend={{ value: 18, direction: 'down' }}
        description="Declined last quarter"
        icon={
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 14V6m0 0L7 12m6 0l6-6"
            />
          </svg>
        }
      />
      <StatCard
        label="Stable Trend"
        value="≈ 5.2%"
        trend={{ value: 0.2, direction: 'neutral' }}
        description="Consistent performance"
        icon={
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        }
      />
    </div>
  ),
};
