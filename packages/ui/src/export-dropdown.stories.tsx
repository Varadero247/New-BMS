import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ExportDropdown } from './export-dropdown';

const meta: Meta<typeof ExportDropdown> = {
  title: 'Components/ExportDropdown',
  component: ExportDropdown,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ExportDropdown>;

export const Default: Story = {
  args: {
    onExportPDF: () => alert('Exporting PDF...'),
    onExportExcel: () => alert('Exporting Excel...'),
  },
};

export const Disabled: Story = {
  args: {
    onExportPDF: () => {},
    onExportExcel: () => {},
    disabled: true,
  },
};

export const WithAsyncHandlers: Story = {
  args: {
    onExportPDF: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    onExportExcel: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
  },
};

export const InToolbar: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, flex: 1 }}>Work Orders</h2>
      <ExportDropdown
        onExportPDF={() => alert('PDF')}
        onExportExcel={() => alert('Excel')}
      />
    </div>
  ),
};
