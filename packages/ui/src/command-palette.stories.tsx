import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CommandPalette, type CommandItem } from './command-palette';

const meta: Meta<typeof CommandPalette> = {
  title: 'Components/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

const sampleItems: CommandItem[] = [
  { id: '1', label: 'Go to Dashboard', category: 'Navigation', href: '/dashboard' },
  { id: '2', label: 'Go to Risk Register', category: 'Navigation', href: '/risks' },
  { id: '3', label: 'Go to Incidents', category: 'Navigation', href: '/incidents' },
  { id: '4', label: 'Create New Risk', category: 'Actions', href: '/risks/new' },
  { id: '5', label: 'Create New Incident', category: 'Actions', href: '/incidents/new' },
  { id: '6', label: 'Run Audit Report', category: 'Actions', href: '/reports/audit' },
  { id: '7', label: 'Search Documents', category: 'Search', href: '/documents', keywords: ['docs', 'files'] },
  { id: '8', label: 'Search Users', category: 'Search', href: '/users', keywords: ['people', 'team'] },
];

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<string>('');
    return (
      <div>
        <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
          Press Cmd+K (or Ctrl+K) to open. Last selected: {selected || 'None'}
        </p>
        <CommandPalette
          items={sampleItems}
          onSelect={(item) => setSelected(item.label)}
          placeholder="Type a command or search..."
        />
      </div>
    );
  },
};

export const CustomPlaceholder: Story = {
  render: () => (
    <CommandPalette
      items={sampleItems}
      onSelect={() => {}}
      placeholder="What would you like to do?"
    />
  ),
};
