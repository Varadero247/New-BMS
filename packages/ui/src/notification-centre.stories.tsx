import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NotificationCentre, type Notification } from './notification-centre';

const meta: Meta<typeof NotificationCentre> = {
  title: 'Components/NotificationCentre',
  component: NotificationCentre,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NotificationCentre>;

const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'Audit scheduled',
    message: 'Internal audit for ISO 9001 scheduled for 25 Feb 2026.',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Action overdue',
    message: 'Corrective action CA-2026-012 is 3 days overdue.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'Document approved',
    message: 'Risk Assessment RA-045 has been approved by Jane Doe.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: '4',
    type: 'error',
    title: 'Incident reported',
    message: 'A near-miss incident has been reported at Site B.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
  },
  {
    id: '5',
    type: 'info',
    title: 'System update',
    message: 'Nexara v3.2 has been deployed with new risk features.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
];

export const Default: Story = {
  render: () => {
    const [notifications, setNotifications] = useState(sampleNotifications);
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px' }}>
        <NotificationCentre
          notifications={notifications}
          onMarkRead={(id) =>
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
          }
          onMarkAllRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
          onDismiss={(id) =>
            setNotifications((prev) => prev.filter((n) => n.id !== id))
          }
        />
      </div>
    );
  },
};

export const Empty: Story = {
  args: {
    notifications: [],
  },
};

export const AllRead: Story = {
  args: {
    notifications: sampleNotifications.map((n) => ({ ...n, read: true })),
  },
};
