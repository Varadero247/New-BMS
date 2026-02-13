import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// Tabs component — inline definition for stories
interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
}

function Tabs({ items, defaultTab }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? items[0]?.id);
  const activeItem = items.find((t) => t.id === active);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid #e5e7eb',
          gap: '0',
        }}
      >
        {items.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActive(tab.id)}
            disabled={tab.disabled}
            style={{
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: active === tab.id ? 600 : 400,
              color: active === tab.id ? '#2563eb' : tab.disabled ? '#9ca3af' : '#6b7280',
              background: 'none',
              border: 'none',
              borderBottom: active === tab.id ? '2px solid #2563eb' : '2px solid transparent',
              marginBottom: '-2px',
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ padding: '16px 0' }}>
        {activeItem?.content}
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Components/Tabs',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Tabs
      items={[
        { id: 'overview', label: 'Overview', content: <p>Overview content panel.</p> },
        { id: 'details', label: 'Details', content: <p>Details content panel with more information.</p> },
        { id: 'history', label: 'History', content: <p>Activity history and audit log.</p> },
      ]}
    />
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Tabs
      items={[
        {
          id: 'assets',
          label: 'Assets',
          icon: <span>🔧</span>,
          content: <p>Asset management panel.</p>,
        },
        {
          id: 'work-orders',
          label: 'Work Orders',
          icon: <span>📋</span>,
          content: <p>Work orders list.</p>,
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: <span>📊</span>,
          content: <p>Reports and analytics.</p>,
        },
      ]}
    />
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs
      items={[
        { id: 'active', label: 'Active', content: <p>Active tab content.</p> },
        { id: 'settings', label: 'Settings', content: <p>Settings tab.</p> },
        { id: 'locked', label: 'Locked', disabled: true, content: <p>You cannot see this.</p> },
      ]}
    />
  ),
};

export const ManyTabs: Story = {
  render: () => (
    <Tabs
      items={[
        { id: 'general', label: 'General', content: <p>General settings.</p> },
        { id: 'security', label: 'Security', content: <p>Security settings.</p> },
        { id: 'notifications', label: 'Notifications', content: <p>Notification preferences.</p> },
        { id: 'billing', label: 'Billing', content: <p>Billing information.</p> },
        { id: 'integrations', label: 'Integrations', content: <p>Third-party integrations.</p> },
      ]}
    />
  ),
};

export const ControlledTab: Story = {
  render: () => {
    const [tab, setTab] = useState('b');
    const items = [
      { id: 'a', label: 'Tab A', content: <p>Content A</p> },
      { id: 'b', label: 'Tab B', content: <p>Content B (default active)</p> },
      { id: 'c', label: 'Tab C', content: <p>Content C</p> },
    ];
    return (
      <div>
        <Tabs items={items} defaultTab={tab} />
      </div>
    );
  },
};
