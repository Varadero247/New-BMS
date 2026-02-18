import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BulkImportWizard } from './csv-import';

const meta: Meta<typeof BulkImportWizard> = {
  title: 'Components/BulkImportWizard',
  component: BulkImportWizard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BulkImportWizard>;

export const Default: Story = {
  render: () => {
    const [result, setResult] = useState<{ imported: number; recordType: string } | null>(null);
    return (
      <div>
        {result && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              background: '#f0fdf4',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          >
            Imported {result.imported} {result.recordType} records successfully.
          </div>
        )}
        <BulkImportWizard onComplete={setResult} />
      </div>
    );
  },
};

export const CustomRecordTypes: Story = {
  render: () => (
    <BulkImportWizard
      recordTypes={[
        {
          recordType: 'risks',
          label: 'Risks',
          fieldCount: 5,
          requiredFields: ['title', 'severity', 'likelihood'],
        },
        {
          recordType: 'incidents',
          label: 'Incidents',
          fieldCount: 6,
          requiredFields: ['title', 'dateOccurred', 'severity'],
        },
        {
          recordType: 'assets',
          label: 'Assets',
          fieldCount: 4,
          requiredFields: ['name', 'type', 'location'],
        },
      ]}
      onComplete={(result) => console.log('Import complete:', result)}
    />
  ),
};
