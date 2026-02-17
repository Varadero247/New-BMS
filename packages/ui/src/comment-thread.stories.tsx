import type { Meta, StoryObj } from '@storybook/react';
import { CommentThread } from './comment-thread';

const meta: Meta<typeof CommentThread> = {
  title: 'Components/CommentThread',
  component: CommentThread,
  tags: ['autodocs'],
  argTypes: {
    recordType: { control: 'text' },
    recordId: { control: 'text' },
    currentUserId: { control: 'text' },
    currentUserName: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof CommentThread>;

export const Default: Story = {
  args: {
    recordType: 'risk',
    recordId: 'risk-001',
    currentUserId: 'user-1',
    currentUserName: 'John Smith',
    apiBaseUrl: '/api',
  },
};

export const ForIncident: Story = {
  args: {
    recordType: 'incident',
    recordId: 'inc-045',
    currentUserId: 'user-2',
    currentUserName: 'Jane Doe',
    apiBaseUrl: '/api',
  },
};
