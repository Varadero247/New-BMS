import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from './breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Documentation', href: '/docs' },
      { label: 'Components' },
    ],
    separator: 'chevron',
  },
};

export const ChevronSeparator: Story = {
  args: {
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings', href: '/settings' },
      { label: 'Profile' },
    ],
    separator: 'chevron',
  },
};

export const SlashSeparator: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Electronics', href: '/products/electronics' },
      { label: 'Laptops' },
    ],
    separator: 'slash',
  },
};

export const SingleItem: Story = {
  args: {
    items: [{ label: 'Dashboard' }],
  },
};

export const AllClickable: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Team', href: '/team' },
      { label: 'Project', href: '/team/project' },
      { label: 'Settings', href: '/team/project/settings' },
    ],
    separator: 'chevron',
  },
};

export const DeepNavigation: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Modules', href: '/modules' },
      { label: 'Health & Safety', href: '/modules/health-safety' },
      { label: 'Risks', href: '/modules/health-safety/risks' },
      { label: 'View' },
    ],
    separator: 'chevron',
  },
};

export const WithLongLabels: Story = {
  args: {
    items: [
      { label: 'Dashboard', href: '/' },
      { label: 'Compliance Management System', href: '/compliance' },
      { label: 'Annual Audit Report' },
    ],
    separator: 'slash',
  },
};
