import type { Meta, StoryObj } from '@storybook/react';
import { NexaraIcon } from './nexara-icon';

const meta: Meta<typeof NexaraIcon> = {
  title: 'Nexara/NexaraIcon',
  component: NexaraIcon,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof NexaraIcon>;

export const Default: Story = {
  args: { size: 32 },
};

export const Small: Story = {
  args: { size: 16 },
};

export const Large: Story = {
  args: { size: 64 },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <NexaraIcon size={16} />
      <NexaraIcon size={24} />
      <NexaraIcon size={32} />
      <NexaraIcon size={48} />
      <NexaraIcon size={64} />
    </div>
  ),
};
