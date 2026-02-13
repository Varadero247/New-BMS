import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast } from './toast';
import { Button } from './button';

const meta: Meta = {
  title: 'Components/Toast',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

function ToastDemo() {
  const { addToast } = useToast();

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Button onClick={() => addToast({ title: 'Success!', description: 'Operation completed successfully.', variant: 'success', duration: 5000 })}>
        Success Toast
      </Button>
      <Button onClick={() => addToast({ title: 'Error!', description: 'Something went wrong.', variant: 'error', duration: 5000 })}>
        Error Toast
      </Button>
      <Button onClick={() => addToast({ title: 'Warning', description: 'Please review this action.', variant: 'warning', duration: 5000 })}>
        Warning Toast
      </Button>
      <Button onClick={() => addToast({ title: 'Information', description: 'Here is some useful info.', variant: 'info', duration: 5000 })}>
        Info Toast
      </Button>
      <Button onClick={() => addToast({ title: 'Persistent Toast', description: 'This toast will not auto-dismiss.', variant: 'info', duration: 0 })}>
        Persistent Toast
      </Button>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};

export const Success: Story = {
  render: () => {
    const ToastButton = () => {
      const { addToast } = useToast();
      return (
        <Button
          onClick={() => addToast({
            title: 'Success!',
            description: 'Your changes have been saved.',
            variant: 'success',
            duration: 5000,
          })}
        >
          Show Success Toast
        </Button>
      );
    };

    return (
      <ToastProvider>
        <ToastButton />
      </ToastProvider>
    );
  },
};

export const Error: Story = {
  render: () => {
    const ToastButton = () => {
      const { addToast } = useToast();
      return (
        <Button
          onClick={() => addToast({
            title: 'Error',
            description: 'Failed to save changes. Please try again.',
            variant: 'error',
            duration: 5000,
          })}
        >
          Show Error Toast
        </Button>
      );
    };

    return (
      <ToastProvider>
        <ToastButton />
      </ToastProvider>
    );
  },
};

export const Warning: Story = {
  render: () => {
    const ToastButton = () => {
      const { addToast } = useToast();
      return (
        <Button
          onClick={() => addToast({
            title: 'Warning',
            description: 'This action cannot be undone.',
            variant: 'warning',
            duration: 5000,
          })}
        >
          Show Warning Toast
        </Button>
      );
    };

    return (
      <ToastProvider>
        <ToastButton />
      </ToastProvider>
    );
  },
};

export const Info: Story = {
  render: () => {
    const ToastButton = () => {
      const { addToast } = useToast();
      return (
        <Button
          onClick={() => addToast({
            title: 'Information',
            description: 'The system will be undergoing maintenance tonight.',
            variant: 'info',
            duration: 5000,
          })}
        >
          Show Info Toast
        </Button>
      );
    };

    return (
      <ToastProvider>
        <ToastButton />
      </ToastProvider>
    );
  },
};

export const WithoutDescription: Story = {
  render: () => {
    const ToastButton = () => {
      const { addToast } = useToast();
      return (
        <Button
          onClick={() => addToast({
            title: 'Saved',
            variant: 'success',
            duration: 5000,
          })}
        >
          Show Toast
        </Button>
      );
    };

    return (
      <ToastProvider>
        <ToastButton />
      </ToastProvider>
    );
  },
};

export const Persistent: Story = {
  render: () => {
    const ToastButton = () => {
      const { addToast } = useToast();
      return (
        <Button
          onClick={() => addToast({
            title: 'This will stay until dismissed',
            description: 'Click the X to close.',
            variant: 'info',
            duration: 0,
          })}
        >
          Show Persistent Toast
        </Button>
      );
    };

    return (
      <ToastProvider>
        <ToastButton />
      </ToastProvider>
    );
  },
};
