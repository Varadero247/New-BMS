import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './tooltip';
import { Button } from './button';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    delay: {
      control: { type: 'number', min: 0, max: 1000, step: 50 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: (args) => (
    <div className="flex justify-center p-8">
      <Tooltip {...args}>
        <Button variant="default">Hover me</Button>
      </Tooltip>
    </div>
  ),
  args: {
    content: 'This is a tooltip',
    placement: 'top',
    delay: 200,
  },
};

export const TopPlacement: Story = {
  render: () => (
    <div className="flex justify-center p-8">
      <Tooltip content="Top tooltip" placement="top">
        <Button variant="default">Top</Button>
      </Tooltip>
    </div>
  ),
};

export const BottomPlacement: Story = {
  render: () => (
    <div className="flex justify-center p-8">
      <Tooltip content="Bottom tooltip" placement="bottom">
        <Button variant="default">Bottom</Button>
      </Tooltip>
    </div>
  ),
};

export const LeftPlacement: Story = {
  render: () => (
    <div className="flex justify-center p-8">
      <Tooltip content="Left tooltip" placement="left">
        <Button variant="default">Left</Button>
      </Tooltip>
    </div>
  ),
};

export const RightPlacement: Story = {
  render: () => (
    <div className="flex justify-center p-8">
      <Tooltip content="Right tooltip" placement="right">
        <Button variant="default">Right</Button>
      </Tooltip>
    </div>
  ),
};

export const ShortDelay: Story = {
  render: () => (
    <div className="flex justify-center p-8">
      <Tooltip content="Quick tooltip" delay={50}>
        <Button variant="secondary">Fast (50ms)</Button>
      </Tooltip>
    </div>
  ),
};

export const LongDelay: Story = {
  render: () => (
    <div className="flex justify-center p-8">
      <Tooltip content="Slow appearing tooltip" delay={1000}>
        <Button variant="secondary">Slow (1000ms)</Button>
      </Tooltip>
    </div>
  ),
};

export const LongContent: Story = {
  render: () => (
    <div className="flex justify-center p-8">
      <Tooltip
        content="This is a longer tooltip content that provides more detailed information about the action"
        placement="top"
      >
        <Button variant="default">Information</Button>
      </Tooltip>
    </div>
  ),
};

export const CustomStyle: Story = {
  render: () => (
    <div className="flex justify-center p-8">
      <Tooltip content="Custom styled tooltip" placement="top" className="bg-purple-600 text-white">
        <Button variant="default">Custom Tooltip</Button>
      </Tooltip>
    </div>
  ),
};

export const MultipleTooltips: Story = {
  render: () => (
    <div className="flex gap-4 justify-center p-8">
      <Tooltip content="Help text" placement="top">
        <Button variant="ghost">Help</Button>
      </Tooltip>
      <Tooltip content="Download file" placement="bottom">
        <Button variant="ghost">Download</Button>
      </Tooltip>
      <Tooltip content="Settings" placement="left">
        <Button variant="ghost">Settings</Button>
      </Tooltip>
      <Tooltip content="Delete item" placement="right">
        <Button variant="destructive">Delete</Button>
      </Tooltip>
    </div>
  ),
};

export const OnLink: Story = {
  render: () => (
    <div className="flex justify-center p-8">
      <Tooltip content="Visit our website" placement="top">
        <a href="#" className="text-blue-600 hover:underline">
          External Link
        </a>
      </Tooltip>
    </div>
  ),
};
