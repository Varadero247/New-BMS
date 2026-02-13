import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
}

function Spinner({ size = 'md', color = '#3b82f6', label = 'Loading...' }: SpinnerProps) {
  const sizeMap = { sm: 16, md: 32, lg: 48 };
  const px = sizeMap[size];
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: 'spin 0.8s linear infinite' }}
      >
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      </svg>
      {label && <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{label}</span>}
    </div>
  );
}

function DotsSpinner({ size = 'md', color = '#3b82f6' }: Omit<SpinnerProps, 'label'>) {
  const dotSize = size === 'sm' ? 6 : size === 'lg' ? 14 : 10;
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <style>{`
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        .dot-1 { animation: bounce 1.4s infinite ease-in-out; animation-delay: -0.32s; }
        .dot-2 { animation: bounce 1.4s infinite ease-in-out; animation-delay: -0.16s; }
        .dot-3 { animation: bounce 1.4s infinite ease-in-out; }
      `}</style>
      {['dot-1', 'dot-2', 'dot-3'].map((cls) => (
        <div
          key={cls}
          className={cls}
          style={{ width: dotSize, height: dotSize, backgroundColor: color, borderRadius: '50%' }}
        />
      ))}
    </div>
  );
}

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    color: { control: 'color' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {
    size: 'md',
    color: '#3b82f6',
    label: 'Loading...',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Loading...',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Loading...',
  },
};

export const NoLabel: Story = {
  args: {
    size: 'md',
    label: '',
  },
};

export const DotsVariant: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <DotsSpinner size="sm" />
      <DotsSpinner size="md" />
      <DotsSpinner size="lg" />
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <Spinner size="lg" label="" />
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Loading content...</span>
      </div>
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
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'not-allowed',
        opacity: 0.7,
        fontSize: '0.875rem',
      }}
    >
      <Spinner size="sm" color="#fff" label="" />
      Saving...
    </button>
  ),
};
