import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const WithLabel: Story = {
  args: {
    size: 'md',
    label: 'Loading...',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Spinner size="sm" label="Small" />
      <Spinner size="md" label="Medium" />
      <Spinner size="lg" label="Large" />
    </div>
  ),
};

export const FullPage: Story = {
  render: () => (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: '8px',
        border: '1px dashed #d1d5db',
      }}
    >
      <Spinner size="lg" label="Loading content..." />
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <button
      disabled
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: '#1E3A8A',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'not-allowed',
        opacity: 0.7,
        fontSize: '0.875rem',
      }}
    >
      <Spinner size="sm" className="text-white" />
      Saving...
    </button>
  ),
};
