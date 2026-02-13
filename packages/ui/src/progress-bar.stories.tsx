import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './progress-bar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 100 },
    },
    max: {
      control: { type: 'number', min: 1, max: 1000 },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'info'],
    },
    indeterminate: {
      control: 'boolean',
    },
    showValue: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    value: 50,
    max: 100,
    size: 'md',
    variant: 'default',
  },
};

export const Zero: Story = {
  args: {
    value: 0,
    max: 100,
    size: 'md',
    variant: 'default',
  },
};

export const Quarter: Story = {
  args: {
    value: 25,
    max: 100,
    size: 'md',
    variant: 'default',
  },
};

export const Half: Story = {
  args: {
    value: 50,
    max: 100,
    size: 'md',
    variant: 'default',
  },
};

export const ThreeQuarters: Story = {
  args: {
    value: 75,
    max: 100,
    size: 'md',
    variant: 'default',
  },
};

export const Full: Story = {
  args: {
    value: 100,
    max: 100,
    size: 'md',
    variant: 'default',
  },
};

export const Small: Story = {
  args: {
    value: 60,
    max: 100,
    size: 'sm',
    variant: 'default',
  },
};

export const Medium: Story = {
  args: {
    value: 60,
    max: 100,
    size: 'md',
    variant: 'default',
  },
};

export const Large: Story = {
  args: {
    value: 60,
    max: 100,
    size: 'lg',
    variant: 'default',
  },
};

export const DefaultVariant: Story = {
  args: {
    value: 60,
    max: 100,
    variant: 'default',
    size: 'md',
  },
};

export const Success: Story = {
  args: {
    value: 100,
    max: 100,
    variant: 'success',
    size: 'md',
  },
};

export const Warning: Story = {
  args: {
    value: 75,
    max: 100,
    variant: 'warning',
    size: 'md',
  },
};

export const Danger: Story = {
  args: {
    value: 90,
    max: 100,
    variant: 'danger',
    size: 'md',
  },
};

export const Info: Story = {
  args: {
    value: 45,
    max: 100,
    variant: 'info',
    size: 'md',
  },
};

export const WithValue: Story = {
  args: {
    value: 65,
    max: 100,
    showValue: true,
    size: 'md',
    variant: 'default',
  },
};

export const WithLabel: Story = {
  args: {
    value: 70,
    max: 100,
    label: 'Download Progress',
    size: 'md',
    variant: 'default',
  },
};

export const WithLabelAndValue: Story = {
  args: {
    value: 55,
    max: 100,
    label: 'Installation Progress',
    showValue: true,
    size: 'md',
    variant: 'default',
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
    size: 'md',
    variant: 'default',
  },
};

export const IndeterminateWithLabel: Story = {
  args: {
    indeterminate: true,
    label: 'Loading...',
    size: 'md',
    variant: 'default',
  },
};

export const IndeterminateSuccess: Story = {
  args: {
    indeterminate: true,
    size: 'md',
    variant: 'success',
  },
};

export const IndeterminateWarning: Story = {
  args: {
    indeterminate: true,
    size: 'md',
    variant: 'warning',
  },
};

export const CustomMax: Story = {
  args: {
    value: 30,
    max: 50,
    label: 'Tasks: 30/50',
    showValue: true,
    size: 'md',
    variant: 'info',
  },
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-4 max-w-lg">
      <div>
        <ProgressBar value={25} max={100} label="Task 1" showValue variant="default" />
      </div>
      <div>
        <ProgressBar value={50} max={100} label="Task 2" showValue variant="success" />
      </div>
      <div>
        <ProgressBar value={75} max={100} label="Task 3" showValue variant="warning" />
      </div>
      <div>
        <ProgressBar value={90} max={100} label="Task 4" showValue variant="danger" />
      </div>
      <div>
        <ProgressBar value={100} max={100} label="Task 5" showValue variant="info" />
      </div>
    </div>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-4 max-w-lg">
      <div>
        <ProgressBar value={50} max={100} label="Small" size="sm" variant="default" />
      </div>
      <div>
        <ProgressBar value={50} max={100} label="Medium" size="md" variant="default" />
      </div>
      <div>
        <ProgressBar value={50} max={100} label="Large" size="lg" variant="default" />
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 max-w-lg">
      <ProgressBar value={60} max={100} label="Default" showValue variant="default" />
      <ProgressBar value={100} max={100} label="Success" showValue variant="success" />
      <ProgressBar value={75} max={100} label="Warning" showValue variant="warning" />
      <ProgressBar value={85} max={100} label="Danger" showValue variant="danger" />
      <ProgressBar value={50} max={100} label="Info" showValue variant="info" />
    </div>
  ),
};

export const LoadingStates: Story = {
  render: () => (
    <div className="space-y-4 max-w-lg">
      <div>
        <ProgressBar indeterminate label="Processing..." variant="default" />
      </div>
      <div>
        <ProgressBar indeterminate label="Uploading..." variant="info" />
      </div>
      <div>
        <ProgressBar indeterminate label="Analyzing..." variant="warning" />
      </div>
    </div>
  ),
};
