import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LoginPage } from './login-page';

const meta: Meta<typeof LoginPage> = {
  title: 'Components/LoginPage',
  component: LoginPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    themeColor: {
      control: 'select',
      options: ['blue', 'green', 'red', 'purple', 'orange', 'indigo', 'teal', 'amber'],
    },
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof LoginPage>;

export const Default: Story = {
  args: {
    title: 'IMS',
    subtitle: 'Integrated Management System',
    themeColor: 'blue',
    onLoginSuccess: () => alert('Login success!'),
    checkAuth: () => false,
  },
};

export const HealthSafety: Story = {
  args: {
    title: 'Health & Safety',
    subtitle: 'ISO 45001 Compliance',
    themeColor: 'red',
    icon: <span style={{ fontSize: '2rem' }}>🦺</span>,
    onLoginSuccess: () => alert('Login success!'),
    checkAuth: () => false,
  },
};

export const Environment: Story = {
  args: {
    title: 'Environment',
    subtitle: 'ISO 14001:2015',
    themeColor: 'green',
    icon: <span style={{ fontSize: '2rem' }}>🌿</span>,
    onLoginSuccess: () => alert('Login success!'),
    checkAuth: () => false,
  },
};

export const InfoSec: Story = {
  args: {
    title: 'InfoSec',
    subtitle: 'ISO 27001 Information Security',
    themeColor: 'indigo',
    icon: <span style={{ fontSize: '2rem' }}>🔐</span>,
    onLoginSuccess: () => alert('Login success!'),
    checkAuth: () => false,
  },
};

export const Energy: Story = {
  args: {
    title: 'Energy Management',
    subtitle: 'ISO 50001:2018',
    themeColor: 'amber',
    icon: <span style={{ fontSize: '2rem' }}>⚡</span>,
    onLoginSuccess: () => alert('Login success!'),
    checkAuth: () => false,
  },
};
