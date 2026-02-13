import type { Meta, StoryObj } from '@storybook/react';
import { DarkModeToggle } from './dark-mode-toggle';

const meta: Meta<typeof DarkModeToggle> = {
  title: 'Components/DarkModeToggle',
  component: DarkModeToggle,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof DarkModeToggle>;

export const Default: Story = {
  args: { size: 'md' },
};

export const Small: Story = {
  args: { size: 'sm' },
};
