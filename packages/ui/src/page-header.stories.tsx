import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Badge } from './badge';

// PageHeader component — inline definition for stories
interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  badge?: { label: string; variant?: 'default' | 'success' | 'warning' | 'info' | 'danger' };
}

function PageHeader({ title, subtitle, breadcrumbs, actions, badge }: PageHeaderProps) {
  return (
    <div
      style={{
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '16px',
        marginBottom: '24px',
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav style={{ display: 'flex', gap: '6px', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '8px' }}>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>/</span>}
              {crumb.href ? (
                <a href={crumb.href} style={{ color: '#6b7280', textDecoration: 'none' }}>
                  {crumb.label}
                </a>
              ) : (
                <span style={{ color: '#374151' }}>{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h1>
              {badge && <Badge variant={badge.variant ?? 'default'}>{badge.label}</Badge>}
            </div>
            {subtitle && <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>{subtitle}</p>}
          </div>
        </div>
        {actions && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>{actions}</div>}
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Components/PageHeader',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <PageHeader title="Work Orders" subtitle="Manage and track all maintenance work orders." />
  ),
};

export const WithActions: Story = {
  render: () => (
    <PageHeader
      title="Assets"
      subtitle="Track and manage all physical assets."
      actions={
        <>
          <Button variant="outline" size="sm">Import</Button>
          <Button size="sm">+ Add Asset</Button>
        </>
      }
    />
  ),
};

export const WithBreadcrumbs: Story = {
  render: () => (
    <PageHeader
      title="WO-2024-0042"
      subtitle="Replace HVAC filter — Unit 3B"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Work Orders', href: '/work-orders' },
        { label: 'WO-2024-0042' },
      ]}
    />
  ),
};

export const WithBadge: Story = {
  render: () => (
    <PageHeader
      title="Incident Report"
      subtitle="INC-2024-0115"
      badge={{ label: 'Open', variant: 'info' }}
      actions={
        <>
          <Button variant="outline" size="sm">Assign</Button>
          <Button size="sm">Close Incident</Button>
        </>
      }
    />
  ),
};

export const FullFeatured: Story = {
  render: () => (
    <PageHeader
      title="Audit Report"
      subtitle="ISO 45001:2018 Internal Audit — Q1 2024"
      badge={{ label: 'In Progress', variant: 'warning' }}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Audits', href: '/audits' },
        { label: 'AUD-2024-Q1' },
      ]}
      actions={
        <>
          <Button variant="outline" size="sm">Export PDF</Button>
          <Button variant="outline" size="sm">Edit</Button>
          <Button size="sm">Complete Audit</Button>
        </>
      }
    />
  ),
};
