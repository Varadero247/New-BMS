import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './select';
import { Label } from './label';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select style={{ width: '240px' }}>
      <option value="">Select an option</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '240px' }}>
      <Label htmlFor="status">Status</Label>
      <Select id="status">
        <option value="">Select status</option>
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="closed">Closed</option>
        <option value="cancelled">Cancelled</option>
      </Select>
    </div>
  ),
};

export const WithPreselected: Story = {
  render: () => (
    <Select style={{ width: '240px' }} defaultValue="medium">
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="critical">Critical</option>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select style={{ width: '240px' }} disabled defaultValue="locked">
      <option value="locked">Locked value</option>
    </Select>
  ),
};

export const LongOptionList: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '300px' }}>
      <Label htmlFor="country">Country</Label>
      <Select id="country">
        <option value="">Select country</option>
        <option value="au">Australia</option>
        <option value="ca">Canada</option>
        <option value="de">Germany</option>
        <option value="fr">France</option>
        <option value="gb">United Kingdom</option>
        <option value="jp">Japan</option>
        <option value="nz">New Zealand</option>
        <option value="us">United States</option>
      </Select>
    </div>
  ),
};

export const PrioritySelect: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '240px' }}>
      <Label htmlFor="priority">Priority</Label>
      <Select id="priority" defaultValue="medium">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </Select>
    </div>
  ),
};
