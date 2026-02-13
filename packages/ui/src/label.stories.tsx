import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';
import { Input } from './input';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: 'Label text',
  },
};

export const WithInput: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '300px' }}>
      <Label htmlFor="example-input">Email Address</Label>
      <Input id="example-input" type="email" placeholder="you@example.com" />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '300px' }}>
      <Label htmlFor="required-input">
        Full Name <span style={{ color: '#ef4444' }}>*</span>
      </Label>
      <Input id="required-input" placeholder="John Smith" required />
    </div>
  ),
};

export const FormGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Label htmlFor="fg-first">First Name</Label>
        <Input id="fg-first" placeholder="John" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Label htmlFor="fg-last">Last Name</Label>
        <Input id="fg-last" placeholder="Smith" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Label htmlFor="fg-email">
          Email <span style={{ color: '#ef4444' }}>*</span>
        </Label>
        <Input id="fg-email" type="email" placeholder="john.smith@example.com" required />
      </div>
    </div>
  ),
};
