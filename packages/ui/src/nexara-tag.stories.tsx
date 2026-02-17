import type { Meta, StoryObj } from '@storybook/react';
import { NexaraTag } from './nexara-tag';

const meta: Meta<typeof NexaraTag> = {
  title: 'Nexara/NexaraTag',
  component: NexaraTag,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['teal', 'blue', 'version'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof NexaraTag>;

export const Teal: Story = {
  args: { children: 'ISO 9001', variant: 'teal' },
};

export const Blue: Story = {
  args: { children: 'Enterprise', variant: 'blue' },
};

export const Version: Story = {
  args: { children: 'v3.0', variant: 'version' },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <NexaraTag variant="teal">ISO 45001</NexaraTag>
      <NexaraTag variant="blue">Premium</NexaraTag>
      <NexaraTag variant="version">v2.4.1</NexaraTag>
    </div>
  ),
};
