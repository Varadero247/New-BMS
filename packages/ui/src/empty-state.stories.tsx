import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './empty-state';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: 'No results found',
    description: 'Try adjusting your search or filter criteria.',
  },
};

export const WithAction: Story = {
  args: {
    title: 'No items yet',
    description: 'Get started by creating your first item.',
    action: { label: 'Create Item', onClick: () => alert('Create!') },
  },
};
