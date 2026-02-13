import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
    },
    width: {
      control: 'text',
    },
    height: {
      control: 'text',
    },
    lines: {
      control: { type: 'number', min: 1, max: 5 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    variant: 'text',
    lines: 1,
  },
};

export const TextSingleLine: Story = {
  args: {
    variant: 'text',
    lines: 1,
  },
};

export const TextMultiLine: Story = {
  args: {
    variant: 'text',
    lines: 3,
  },
};

export const TextFourLines: Story = {
  args: {
    variant: 'text',
    lines: 4,
  },
};

export const TextCustomWidth: Story = {
  args: {
    variant: 'text',
    lines: 1,
    width: '50%',
  },
};

export const CircularDefault: Story = {
  args: {
    variant: 'circular',
  },
};

export const CircularSmall: Story = {
  args: {
    variant: 'circular',
    width: 32,
    height: 32,
  },
};

export const CircularMedium: Story = {
  args: {
    variant: 'circular',
    width: 48,
    height: 48,
  },
};

export const CircularLarge: Story = {
  args: {
    variant: 'circular',
    width: 80,
    height: 80,
  },
};

export const CircularExtraLarge: Story = {
  args: {
    variant: 'circular',
    width: 120,
    height: 120,
  },
};

export const RectangularDefault: Story = {
  args: {
    variant: 'rectangular',
  },
};

export const RectangularSmall: Story = {
  args: {
    variant: 'rectangular',
    width: '100%',
    height: 60,
  },
};

export const RectangularMedium: Story = {
  args: {
    variant: 'rectangular',
    width: '100%',
    height: 120,
  },
};

export const RectangularLarge: Story = {
  args: {
    variant: 'rectangular',
    width: '100%',
    height: 200,
  },
};

export const RectangularCustom: Story = {
  args: {
    variant: 'rectangular',
    width: 300,
    height: 150,
  },
};

export const CardSkeleton: Story = {
  render: () => (
    <div className="border rounded-lg p-4 space-y-4 max-w-sm">
      <Skeleton variant="rectangular" width="100%" height={200} />
      <div className="space-y-2">
        <Skeleton variant="text" lines={1} />
        <Skeleton variant="text" lines={2} width="90%" />
      </div>
    </div>
  ),
};

export const UserProfileSkeleton: Story = {
  render: () => (
    <div className="flex gap-4 max-w-md">
      <Skeleton variant="circular" width={64} height={64} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" lines={1} width="60%" />
        <Skeleton variant="text" lines={1} width="40%" />
        <div className="pt-2">
          <Skeleton variant="text" lines={2} width="80%" />
        </div>
      </div>
    </div>
  ),
};

export const ListSkeleton: Story = {
  render: () => (
    <div className="space-y-3 max-w-md">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" lines={1} width="70%" />
            <Skeleton variant="text" lines={1} width="50%" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const DashboardSkeleton: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-2xl">
      <div className="space-y-2">
        <Skeleton variant="text" lines={1} width="80%" />
        <Skeleton variant="rectangular" width="100%" height={120} />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" lines={1} width="80%" />
        <Skeleton variant="rectangular" width="100%" height={120} />
      </div>
      <div className="col-span-2">
        <Skeleton variant="text" lines={1} width="80%" />
        <Skeleton variant="rectangular" width="100%" height={150} className="mt-2" />
      </div>
    </div>
  ),
};

export const ArticleSkeleton: Story = {
  render: () => (
    <div className="max-w-2xl space-y-4">
      <Skeleton variant="rectangular" width="100%" height={300} />
      <Skeleton variant="text" lines={1} width="80%" />
      <Skeleton variant="text" lines={3} width="100%" />
      <Skeleton variant="text" lines={2} width="95%" />
    </div>
  ),
};
