import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { QRCodeDisplay, QRScanner } from './qr-code';

const displayMeta: Meta<typeof QRCodeDisplay> = {
  title: 'Components/QRCode',
  component: QRCodeDisplay,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    label: { control: 'text' },
    size: { control: 'number' },
  },
};

export default displayMeta;
type Story = StoryObj<typeof QRCodeDisplay>;

export const Default: Story = {
  args: {
    value: 'https://nexara.io/asset/AST-2026-001',
    label: 'Asset: AST-2026-001',
    size: 200,
  },
};

export const Small: Story = {
  args: {
    value: 'https://nexara.io/equipment/EQ-042',
    label: 'Equipment Tag',
    size: 120,
  },
};

export const Large: Story = {
  args: {
    value: 'https://nexara.io/inspection/INS-2026-089',
    label: 'Scan for Inspection Form',
    size: 300,
  },
};

export const NoLabel: Story = {
  args: {
    value: 'NEXARA-ASSET-12345',
    size: 200,
  },
};

export const Scanner: Story = {
  render: () => {
    const [scanned, setScanned] = useState<string>('');
    return (
      <div>
        {scanned && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', fontSize: '14px' }}>
            Scanned: {scanned}
          </div>
        )}
        <QRScanner
          onScan={(value) => setScanned(value)}
          onError={(err) => console.error('Scan error:', err)}
        />
      </div>
    );
  },
};
