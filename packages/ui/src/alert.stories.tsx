import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
    dismissible: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    variant: 'info',
    children: 'This is an informational alert message.',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'This is an informational message. You can use this to provide helpful context or tips.',
  },
};

export const InfoWithTitle: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    children: 'This is an informational alert with a title and additional details.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Operation completed successfully!',
  },
};

export const SuccessWithTitle: Story = {
  args: {
    variant: 'success',
    title: 'Success',
    children: 'Your changes have been saved successfully.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Please be careful. This action may have unintended consequences.',
  },
};

export const WarningWithTitle: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    children: 'This field is required before you can proceed. Please provide a value.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'An error occurred while processing your request. Please try again.',
  },
};

export const ErrorWithTitle: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    children: 'Failed to load the data. Please check your connection and try again.',
  },
};

export const Dismissible: Story = {
  args: {
    variant: 'info',
    dismissible: true,
    children: 'Click the X button to dismiss this alert.',
  },
};

export const DismissibleWithTitle: Story = {
  args: {
    variant: 'success',
    title: 'Setup Complete',
    dismissible: true,
    children: 'Your account has been created successfully. You can now log in with your credentials.',
  },
};

export const DismissibleWarning: Story = {
  args: {
    variant: 'warning',
    title: 'Browser Compatibility',
    dismissible: true,
    children: 'You are using an older browser. Some features may not work correctly. Please consider updating.',
  },
};

export const DismissibleError: Story = {
  args: {
    variant: 'error',
    title: 'Connection Lost',
    dismissible: true,
    children: 'Unable to connect to the server. Please check your internet connection and try again.',
  },
};

export const LongContent: Story = {
  args: {
    variant: 'info',
    title: 'Important Notice',
    children: (
      <div>
        <p>This system has been updated with several new features and improvements.</p>
        <ul className="mt-2 ml-4 list-disc">
          <li>Enhanced security protocols</li>
          <li>Improved performance</li>
          <li>New reporting capabilities</li>
        </ul>
      </div>
    ),
  },
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <Alert variant="info" title="Information">
        This is how an info alert looks with a title.
      </Alert>
      <Alert variant="success" title="Success">
        Your operation was successful!
      </Alert>
      <Alert variant="warning" title="Warning">
        Please review this warning before proceeding.
      </Alert>
      <Alert variant="error" title="Error">
        An error has occurred. Please contact support if this persists.
      </Alert>
    </div>
  ),
};

export const MultipleWithDismiss: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <Alert variant="info" dismissible title="Info">
        Informational message with dismiss button.
      </Alert>
      <Alert variant="success" dismissible title="Success">
        Success message with dismiss button.
      </Alert>
      <Alert variant="warning" dismissible title="Warning">
        Warning message with dismiss button.
      </Alert>
      <Alert variant="error" dismissible title="Error">
        Error message with dismiss button.
      </Alert>
    </div>
  ),
};

export const FormValidation: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Alert variant="error" title="Validation Error">
        Please correct the following errors:
        <ul className="mt-2 ml-4 list-disc text-sm">
          <li>Email address is required</li>
          <li>Password must be at least 8 characters</li>
          <li>Terms must be accepted</li>
        </ul>
      </Alert>
    </div>
  ),
};

export const SystemStatus: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <Alert variant="success" dismissible title="System Online">
        All systems are operational and running normally.
      </Alert>
      <Alert variant="warning" title="Maintenance Scheduled">
        Scheduled maintenance will occur on Friday at 2:00 AM UTC. Some services may be unavailable.
      </Alert>
    </div>
  ),
};
