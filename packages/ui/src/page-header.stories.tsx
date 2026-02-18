import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './page-header';
import { Button } from './button';
import { Badge } from './badge';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: 'Work Orders',
    description: 'Manage and track all maintenance work orders.',
  },
};

export const WithActions: Story = {
  args: {
    title: 'Assets',
    description: 'Track and manage all physical assets.',
    actions: (
      <>
        <Button variant="outline" size="sm">
          Import
        </Button>
        <Button size="sm">+ Add Asset</Button>
      </>
    ),
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    title: 'WO-2024-0042',
    description: 'Replace HVAC filter — Unit 3B',
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Work Orders', href: '/work-orders' },
      { label: 'WO-2024-0042' },
    ],
  },
};

export const WithBadge: Story = {
  args: {
    title: 'Incident Report',
    description: 'INC-2024-0115',
    badge: <Badge variant="info">Open</Badge>,
    actions: (
      <>
        <Button variant="outline" size="sm">
          Assign
        </Button>
        <Button size="sm">Close Incident</Button>
      </>
    ),
  },
};

export const FullFeatured: Story = {
  args: {
    title: 'Audit Report',
    description: 'ISO 45001:2018 Internal Audit — Q1 2024',
    badge: <Badge variant="warning">In Progress</Badge>,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Audits', href: '/audits' },
      { label: 'AUD-2024-Q1' },
    ],
    actions: (
      <>
        <Button variant="outline" size="sm">
          Export PDF
        </Button>
        <Button variant="outline" size="sm">
          Edit
        </Button>
        <Button size="sm">Complete Audit</Button>
      </>
    ),
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Dashboard',
  },
};
