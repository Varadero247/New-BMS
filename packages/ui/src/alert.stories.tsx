import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// Alert component (inline definition — not yet in the UI package as a standalone)
interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
}

const variantStyles: Record<string, { container: string; icon: string; title: string }> = {
  info: {
    container: 'background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;display:flex;gap:12px',
    icon: 'color:#3b82f6',
    title: 'color:#1e40af',
  },
  success: {
    container: 'background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;display:flex;gap:12px',
    icon: 'color:#22c55e',
    title: 'color:#15803d',
  },
  warning: {
    container: 'background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;display:flex;gap:12px',
    icon: 'color:#f59e0b',
    title: 'color:#92400e',
  },
  error: {
    container: 'background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;display:flex;gap:12px',
    icon: 'color:#ef4444',
    title: 'color:#991b1b',
  },
};

const icons: Record<string, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✕',
};

function Alert({ variant = 'info', title, children, onDismiss }: AlertProps) {
  const styles = variantStyles[variant];
  return (
    <div style={{ cssText: styles.container } as React.CSSProperties}>
      <span style={{ fontSize: '1.25rem', lineHeight: 1, color: styles.icon.split(':')[1] }}>
        {icons[variant]}
      </span>
      <div style={{ flex: 1 }}>
        {title && (
          <p style={{ fontWeight: 600, fontSize: '0.875rem', color: styles.title.split(':')[1], marginBottom: '4px' }}>
            {title}
          </p>
        )}
        <p style={{ fontSize: '0.875rem', color: '#374151' }}>{children}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1rem' }}
        >
          ×
        </button>
      )}
    </div>
  );
}

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
    title: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    children: 'This is an informational alert message.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success',
    children: 'Your changes have been saved successfully.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    children: 'This action may have unintended side effects. Please review before proceeding.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    children: 'Something went wrong. Please try again or contact support.',
  },
};

export const WithoutTitle: Story = {
  args: {
    variant: 'info',
    children: 'A simple alert without a title heading.',
  },
};

export const Dismissible: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(true);
    return visible ? (
      <Alert variant="success" title="Upload Complete" onDismiss={() => setVisible(false)}>
        Your file has been uploaded and processed successfully.
      </Alert>
    ) : (
      <button
        style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
        onClick={() => setVisible(true)}
      >
        Show Alert
      </button>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px' }}>
      <Alert variant="info" title="Info">An informational message.</Alert>
      <Alert variant="success" title="Success">Operation completed successfully.</Alert>
      <Alert variant="warning" title="Warning">Please review before continuing.</Alert>
      <Alert variant="error" title="Error">Something went wrong.</Alert>
    </div>
  ),
};
