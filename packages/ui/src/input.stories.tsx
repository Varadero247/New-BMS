import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Label } from './label';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    type: 'text',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '300px' }}>
      <Label htmlFor="name">Full Name</Label>
      <Input id="name" placeholder="John Smith" />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '300px' }}>
      <Label htmlFor="email-err">Email</Label>
      <Input
        id="email-err"
        type="email"
        placeholder="you@example.com"
        defaultValue="not-an-email"
        className="border-red-500 focus-visible:ring-red-500"
      />
      <p style={{ fontSize: '0.75rem', color: '#ef4444' }}>Please enter a valid email address.</p>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    defaultValue: 'Read-only value',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
    min: 0,
    max: 100,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Pre-filled value',
    type: 'text',
  },
};
