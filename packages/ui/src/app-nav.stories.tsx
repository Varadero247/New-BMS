import type { Meta, StoryObj } from '@storybook/react';
import { AppNav, NavTab } from './app-nav';

const meta: Meta<typeof AppNav> = {
  title: 'Nexara/AppNav',
  component: AppNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    moduleName: { control: 'text' },
    moduleColor: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof AppNav>;

export const Default: Story = {
  args: {
    moduleName: 'Risk Management',
    moduleColor: '#f59e0b',
    user: { name: 'John Smith', initials: 'JS' },
    children: (
      <>
        <NavTab label="Dashboard" active />
        <NavTab label="Risks" />
        <NavTab label="Controls" />
        <NavTab label="Analytics" />
      </>
    ),
  },
};

export const HealthSafety: Story = {
  args: {
    moduleName: 'Health & Safety',
    moduleColor: '#ef4444',
    user: { name: 'Admin User', initials: 'AU' },
    children: (
      <>
        <NavTab label="Dashboard" />
        <NavTab label="Incidents" active />
        <NavTab label="Risk Assessments" />
        <NavTab label="Actions" />
        <NavTab label="Training" />
      </>
    ),
  },
};

export const MinimalNav: Story = {
  args: {
    moduleName: 'Settings',
    moduleColor: '#6366f1',
    user: { name: 'User', initials: 'U' },
  },
};
