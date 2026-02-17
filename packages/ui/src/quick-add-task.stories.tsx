import type { Meta, StoryObj } from '@storybook/react';
import { QuickAddTask } from './quick-add-task';

const meta: Meta<typeof QuickAddTask> = {
  title: 'Components/QuickAddTask',
  component: QuickAddTask,
  tags: ['autodocs'],
  argTypes: {
    recordType: { control: 'text' },
    recordId: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof QuickAddTask>;

export const Default: Story = {
  args: {
    recordType: 'risk',
    recordId: 'risk-001',
    onCreated: (task) => console.log('Task created:', task),
  },
};

export const ForIncident: Story = {
  args: {
    recordType: 'incident',
    recordId: 'inc-045',
    onCreated: (task) => console.log('Task created:', task),
  },
};

export const Standalone: Story = {
  args: {
    onCreated: (task) => console.log('Task created:', task),
  },
};
