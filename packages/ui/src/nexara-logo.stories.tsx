import type { Meta, StoryObj } from '@storybook/react';
import { NexaraLogo } from './nexara-logo';

const meta: Meta<typeof NexaraLogo> = {
  title: 'Nexara/NexaraLogo',
  component: NexaraLogo,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    variant: {
      control: 'select',
      options: ['default', 'light', 'gradient', 'mark-only'],
    },
    showTagline: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof NexaraLogo>;

export const Default: Story = {
  args: { size: 'md', variant: 'default' },
};

export const WithTagline: Story = {
  args: { size: 'md', variant: 'default', showTagline: true },
};

export const Light: Story = {
  args: { size: 'md', variant: 'light' },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#1a1a2e', padding: '32px', borderRadius: '8px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Gradient: Story = {
  args: { size: 'lg', variant: 'gradient' },
};

export const MarkOnly: Story = {
  args: { size: 'lg', variant: 'mark-only' },
};

export const ExtraSmall: Story = {
  args: { size: 'xs', variant: 'default' },
};

export const ExtraLarge: Story = {
  args: { size: 'xl', variant: 'default', showTagline: true },
};

export const AllSizes: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}
    >
      <NexaraLogo size="xs" />
      <NexaraLogo size="sm" />
      <NexaraLogo size="md" />
      <NexaraLogo size="lg" />
      <NexaraLogo size="xl" />
    </div>
  ),
};
