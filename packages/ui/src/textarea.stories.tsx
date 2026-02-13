import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './textarea';
import { Label } from './label';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
    rows: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your text here...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '400px' }}>
      <Label htmlFor="notes">Notes</Label>
      <Textarea id="notes" placeholder="Add any additional notes..." />
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    defaultValue: 'This is a pre-filled textarea with some content. It spans multiple lines to demonstrate the component behaviour.',
    rows: 4,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'This field is read-only.',
  },
};

export const Tall: Story = {
  args: {
    placeholder: 'Write a detailed description...',
    rows: 8,
    style: { width: '400px' },
  },
};

export const WithError: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '400px' }}>
      <Label htmlFor="desc-err">Description</Label>
      <Textarea
        id="desc-err"
        className="border-red-500 focus-visible:ring-red-500"
        defaultValue="x"
        rows={3}
      />
      <p style={{ fontSize: '0.75rem', color: '#ef4444' }}>Description must be at least 20 characters.</p>
    </div>
  ),
};
