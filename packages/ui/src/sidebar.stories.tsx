import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// Sidebar component — inline definition for stories
interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  href?: string;
  children?: NavItem[];
}

interface SidebarProps {
  items: NavItem[];
  collapsed?: boolean;
  activeId?: string;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
}

function Sidebar({ items, collapsed = false, activeId, logo, footer }: SidebarProps) {
  return (
    <div
      style={{
        width: collapsed ? 64 : 240,
        height: '100vh',
        backgroundColor: '#1e293b',
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '16px 0' : '16px 20px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        {logo ?? (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            I
          </div>
        )}
        {!collapsed && <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>IMS</span>}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href ?? '#'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: collapsed ? '10px 0' : '10px 20px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: activeId === item.id ? '#fff' : '#94a3b8',
              backgroundColor: activeId === item.id ? '#334155' : 'transparent',
              textDecoration: 'none',
              fontSize: '0.875rem',
              borderLeft: activeId === item.id ? '3px solid #3b82f6' : '3px solid transparent',
              transition: 'background-color 0.15s',
            }}
          >
            <span style={{ flexShrink: 0, fontSize: '1rem' }}>{item.icon}</span>
            {!collapsed && (
              <>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    style={{
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      borderRadius: '9999px',
                      padding: '1px 7px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </a>
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div style={{ padding: collapsed ? '12px 0' : '12px 20px', borderTop: '1px solid #334155' }}>
          {footer}
        </div>
      )}
    </div>
  );
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'incidents', label: 'Incidents', icon: '⚠️', badge: 5 },
  { id: 'assets', label: 'Assets', icon: '🔧' },
  { id: 'work-orders', label: 'Work Orders', icon: '📋', badge: 12 },
  { id: 'reports', label: 'Reports', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const meta: Meta = {
  title: 'Components/Sidebar',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', height: '400px' }}>
      <Sidebar items={navItems} activeId="dashboard" />
      <div style={{ flex: 1, padding: '24px', backgroundColor: '#f8fafc' }}>
        <p>Main content area</p>
      </div>
    </div>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <div style={{ display: 'flex', height: '400px' }}>
      <Sidebar items={navItems} activeId="incidents" collapsed />
      <div style={{ flex: 1, padding: '24px', backgroundColor: '#f8fafc' }}>
        <p>Collapsed sidebar — icons only</p>
      </div>
    </div>
  ),
};

export const Toggleable: Story = {
  render: () => {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <div style={{ display: 'flex', height: '400px' }}>
        <Sidebar
          items={navItems}
          activeId="work-orders"
          collapsed={collapsed}
          footer={
            <button
              onClick={() => setCollapsed((c) => !c)}
              style={{
                background: 'none',
                border: '1px solid #334155',
                color: '#94a3b8',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                width: '100%',
              }}
            >
              {collapsed ? '→' : '← Collapse'}
            </button>
          }
        />
        <div style={{ flex: 1, padding: '24px', backgroundColor: '#f8fafc' }}>
          <p>Click the footer button to toggle the sidebar.</p>
        </div>
      </div>
    );
  },
};

export const WithBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', height: '400px' }}>
      <Sidebar
        items={[
          { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
          { id: 'incidents', label: 'Incidents', icon: '⚠️', badge: 3 },
          { id: 'work-orders', label: 'Work Orders', icon: '📋', badge: 8 },
          { id: 'alerts', label: 'Alerts', icon: '🔔', badge: 21 },
          { id: 'reports', label: 'Reports', icon: '📊' },
        ]}
        activeId="dashboard"
      />
      <div style={{ flex: 1, padding: '24px', backgroundColor: '#f8fafc' }}>
        <p>Sidebar with notification badges</p>
      </div>
    </div>
  ),
};
