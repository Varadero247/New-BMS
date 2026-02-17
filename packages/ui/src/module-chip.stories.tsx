import type { Meta, StoryObj } from '@storybook/react';
import { ModuleChip } from './module-chip';

const meta: Meta<typeof ModuleChip> = {
  title: 'Nexara/ModuleChip',
  component: ModuleChip,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    standard: { control: 'text' },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof ModuleChip>;

export const HealthSafety: Story = {
  args: { name: 'Health & Safety', standard: 'ISO 45001', color: '#ef4444' },
};

export const Quality: Story = {
  args: { name: 'Quality', standard: 'ISO 9001', color: '#3b82f6' },
};

export const Environment: Story = {
  args: { name: 'Environment', standard: 'ISO 14001', color: '#22c55e' },
};

export const InfoSec: Story = {
  args: { name: 'Information Security', standard: 'ISO 27001', color: '#8b5cf6' },
};

export const AllModules: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      <ModuleChip name="Health & Safety" standard="ISO 45001" color="#ef4444" />
      <ModuleChip name="Quality" standard="ISO 9001" color="#3b82f6" />
      <ModuleChip name="Environment" standard="ISO 14001" color="#22c55e" />
      <ModuleChip name="Information Security" standard="ISO 27001" color="#8b5cf6" />
      <ModuleChip name="Energy" standard="ISO 50001" color="#f59e0b" />
      <ModuleChip name="Food Safety" standard="ISO 22000" color="#06b6d4" />
    </div>
  ),
};
