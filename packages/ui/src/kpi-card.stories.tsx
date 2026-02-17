import type { Meta, StoryObj } from '@storybook/react';
import { KpiCard } from './kpi-card';

const meta: Meta<typeof KpiCard> = {
  title: 'Nexara/KpiCard',
  component: KpiCard,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof KpiCard>;

export const Default: Story = {
  args: { label: 'Open NCRs', value: 12 },
};

export const WithUpTrend: Story = {
  args: {
    label: 'Compliance Score',
    value: '94%',
    trend: { direction: 'up', text: '+3% this month' },
  },
};

export const WithDownTrend: Story = {
  args: {
    label: 'Open Incidents',
    value: 7,
    trend: { direction: 'down', text: '-2 from last week' },
  },
};

export const WithWarning: Story = {
  args: {
    label: 'Overdue Actions',
    value: 15,
    trend: { direction: 'warn', text: '5 critical' },
  },
};

export const Dashboard: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
      <KpiCard label="Compliance" value="94%" trend={{ direction: 'up', text: '+3%' }} />
      <KpiCard label="Open NCRs" value={12} trend={{ direction: 'down', text: '-2' }} />
      <KpiCard label="Overdue" value={5} trend={{ direction: 'warn', text: 'Action needed' }} />
      <KpiCard label="Audits" value={3} />
    </div>
  ),
};
