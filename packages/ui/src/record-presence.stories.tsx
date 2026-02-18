import type { Meta, StoryObj } from '@storybook/react';
import { RecordPresence } from './record-presence';

const meta: Meta<typeof RecordPresence> = {
  title: 'Components/RecordPresence',
  component: RecordPresence,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RecordPresence>;

const now = new Date();
const expires = new Date(Date.now() + 30_000);

export const NoViewers: Story = {
  args: {
    recordType: 'risk',
    recordId: 'risk-001',
    currentUserId: 'user-1',
    viewers: [],
    isLocked: false,
    lockedBy: null,
    onAcquireLock: async () => ({ acquired: true }),
    onReleaseLock: async () => {},
  },
};

export const MultipleViewers: Story = {
  args: {
    recordType: 'risk',
    recordId: 'risk-001',
    currentUserId: 'user-1',
    viewers: [
      { userId: 'user-2', userName: 'Jane Doe', lockedAt: now, expiresAt: expires },
      { userId: 'user-3', userName: 'Bob Wilson', lockedAt: now, expiresAt: expires },
      { userId: 'user-4', userName: 'Alice Brown', lockedAt: now, expiresAt: expires },
      { userId: 'user-5', userName: 'Charlie Green', lockedAt: now, expiresAt: expires },
    ],
    isLocked: false,
    lockedBy: null,
    onAcquireLock: async () => ({ acquired: true }),
    onReleaseLock: async () => {},
  },
};

export const LockedByOther: Story = {
  args: {
    recordType: 'risk',
    recordId: 'risk-001',
    currentUserId: 'user-1',
    viewers: [{ userId: 'user-2', userName: 'Jane Doe', lockedAt: now, expiresAt: expires }],
    isLocked: true,
    lockedBy: { userId: 'user-2', userName: 'Jane Doe', lockedAt: now, expiresAt: expires },
    onAcquireLock: async (force) => ({ acquired: !!force }),
    onReleaseLock: async () => {},
  },
};

export const LockedBySelf: Story = {
  args: {
    recordType: 'risk',
    recordId: 'risk-001',
    currentUserId: 'user-1',
    viewers: [{ userId: 'user-2', userName: 'Jane Doe', lockedAt: now, expiresAt: expires }],
    isLocked: true,
    lockedBy: { userId: 'user-1', userName: 'John Smith', lockedAt: now, expiresAt: expires },
    onAcquireLock: async () => ({ acquired: true }),
    onReleaseLock: async () => {},
  },
};
