import type { Meta, StoryObj } from '@storybook/react';
import { ThemeSwitch } from './theme-switch';

const meta: Meta<typeof ThemeSwitch> = {
  title: 'Components/ThemeSwitch',
  component: ThemeSwitch,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ThemeSwitch>;

export const Default: Story = {};

export const InContext: Story = {
  render: () => (
    <div
      style={{
        position: 'relative',
        height: '200px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
      }}
    >
      <p style={{ padding: '16px', fontSize: '14px', color: '#666' }}>
        The theme switch appears as a floating button (bottom-right by default).
      </p>
      <ThemeSwitch />
    </div>
  ),
};
