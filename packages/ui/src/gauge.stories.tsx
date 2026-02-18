import type { Meta, StoryObj } from '@storybook/react';
import { Gauge } from './gauge';

const meta: Meta<typeof Gauge> = {
  title: 'Components/Gauge',
  component: Gauge,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    color: {
      control: 'select',
      options: ['blue', 'green', 'yellow', 'red', 'purple', 'auto'],
    },
    value: {
      control: 'number',
      min: 0,
      max: 100,
    },
    max: {
      control: 'number',
      min: 1,
      max: 1000,
    },
    showValue: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Gauge>;

export const Default: Story = {
  args: {
    value: 50,
    label: 'Progress',
  },
};

export const Small: Story = {
  args: {
    value: 65,
    size: 'sm',
    label: 'Small',
  },
};

export const Medium: Story = {
  args: {
    value: 75,
    size: 'md',
    label: 'Medium',
  },
};

export const Large: Story = {
  args: {
    value: 85,
    size: 'lg',
    label: 'Large',
  },
};

export const ExtraLarge: Story = {
  args: {
    value: 92,
    size: 'xl',
    label: 'Extra Large',
  },
};

export const ColorBlue: Story = {
  args: {
    value: 45,
    color: 'blue',
    label: 'Blue Color',
  },
};

export const ColorGreen: Story = {
  args: {
    value: 85,
    color: 'green',
    label: 'Green Color',
  },
};

export const ColorYellow: Story = {
  args: {
    value: 60,
    color: 'yellow',
    label: 'Yellow Color',
  },
};

export const ColorRed: Story = {
  args: {
    value: 25,
    color: 'red',
    label: 'Red Color',
  },
};

export const ColorPurple: Story = {
  args: {
    value: 70,
    color: 'purple',
    label: 'Purple Color',
  },
};

export const AutoColor: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4">Auto color (90%) - Green</h3>
        <Gauge value={90} color="auto" label="Excellent" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-4">Auto color (70%) - Yellow</h3>
        <Gauge value={70} color="auto" label="Good" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-4">Auto color (50%) - Orange</h3>
        <Gauge value={50} color="auto" label="Fair" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-4">Auto color (25%) - Red</h3>
        <Gauge value={25} color="auto" label="Poor" />
      </div>
    </div>
  ),
};

export const WithSublabel: Story = {
  args: {
    value: 78,
    size: 'lg',
    label: 'CPU Usage',
    sublabel: 'cores',
    showValue: true,
  },
};

export const CustomMax: Story = {
  args: {
    value: 750,
    max: 1000,
    label: 'Storage Usage',
    sublabel: 'GB',
    size: 'lg',
  },
};

export const HiddenValue: Story = {
  args: {
    value: 68,
    size: 'md',
    label: 'Progress',
    showValue: false,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8 justify-center items-end">
      <div className="text-center">
        <Gauge value={45} size="sm" label="Small" />
      </div>
      <div className="text-center">
        <Gauge value={60} size="md" label="Medium" />
      </div>
      <div className="text-center">
        <Gauge value={75} size="lg" label="Large" />
      </div>
      <div className="text-center">
        <Gauge value={88} size="xl" label="Extra Large" />
      </div>
    </div>
  ),
};

export const AllColors: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
      <div className="flex flex-col items-center">
        <Gauge value={50} color="blue" label="Blue" size="md" />
      </div>
      <div className="flex flex-col items-center">
        <Gauge value={80} color="green" label="Green" size="md" />
      </div>
      <div className="flex flex-col items-center">
        <Gauge value={60} color="yellow" label="Yellow" size="md" />
      </div>
      <div className="flex flex-col items-center">
        <Gauge value={30} color="red" label="Red" size="md" />
      </div>
      <div className="flex flex-col items-center">
        <Gauge value={70} color="purple" label="Purple" size="md" />
      </div>
      <div className="flex flex-col items-center">
        <Gauge value={55} color="auto" label="Auto" size="md" />
      </div>
    </div>
  ),
};

export const DashboardMetrics: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
          CPU Usage
        </h3>
        <div className="flex justify-center">
          <Gauge value={42} color="auto" size="md" sublabel="%" showValue={true} />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
          Memory
        </h3>
        <div className="flex justify-center">
          <Gauge value={68} color="auto" size="md" sublabel="GB" showValue={true} />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
          Disk Space
        </h3>
        <div className="flex justify-center">
          <Gauge value={85} color="auto" size="md" sublabel="TB" showValue={true} />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
          Network
        </h3>
        <div className="flex justify-center">
          <Gauge value={52} color="auto" size="md" sublabel="Mbps" showValue={true} />
        </div>
      </div>
    </div>
  ),
};

export const PerformanceScores: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Accessibility Score
          </h3>
          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
            Excellent
          </span>
        </div>
        <Gauge value={95} color="green" size="lg" showValue={true} />
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Performance Score
          </h3>
          <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Good</span>
        </div>
        <Gauge value={72} color="yellow" size="lg" showValue={true} />
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">SEO Score</h3>
          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">Fair</span>
        </div>
        <Gauge value={58} color="auto" size="lg" showValue={true} />
      </div>
    </div>
  ),
};

export const CompletionProgress: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Profile Setup</span>
          <span className="text-xs text-gray-500">25% of 100%</span>
        </div>
        <Gauge value={25} max={100} color="red" size="md" showValue={true} />
      </div>
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Training Modules</span>
          <span className="text-xs text-gray-500">50% of 100%</span>
        </div>
        <Gauge value={50} max={100} color="yellow" size="md" showValue={true} />
      </div>
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Certifications</span>
          <span className="text-xs text-gray-500">80% of 100%</span>
        </div>
        <Gauge value={80} max={100} color="green" size="md" showValue={true} />
      </div>
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-xs text-gray-500">52% of 100%</span>
        </div>
        <Gauge value={52} max={100} color="auto" size="lg" showValue={true} />
      </div>
    </div>
  ),
};

export const ExtendedRange: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="text-center">
        <Gauge value={250} max={500} label="Monthly Sales (in K)" size="md" />
        <p className="text-xs text-gray-500 mt-2">$250K of $500K</p>
      </div>
      <div className="text-center">
        <Gauge value={7500} max={10000} label="Website Visits" size="md" />
        <p className="text-xs text-gray-500 mt-2">7,500 of 10,000</p>
      </div>
      <div className="text-center">
        <Gauge value={85} max={100} label="Customer Satisfaction" size="md" />
        <p className="text-xs text-gray-500 mt-2">85 of 100 points</p>
      </div>
    </div>
  ),
};
