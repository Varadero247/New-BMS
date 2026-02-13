import type { Meta, StoryObj } from '@storybook/react';
import { PlanBadge } from './plan-badge';

const meta: Meta<typeof PlanBadge> = {
  title: 'Components/PlanBadge',
  component: PlanBadge,
  tags: ['autodocs'],
  argTypes: {
    plan: { control: 'select', options: ['free', 'starter', 'professional', 'enterprise'] },
  },
};

export default meta;
type Story = StoryObj<typeof PlanBadge>;

export const Free: Story = {
  args: { plan: 'free' },
};

export const Starter: Story = {
  args: { plan: 'starter' },
};

export const Professional: Story = {
  args: { plan: 'professional' },
};

export const Enterprise: Story = {
  args: { plan: 'enterprise' },
};
