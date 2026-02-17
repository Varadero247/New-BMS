import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SignatureCapture, type SignatureData } from './signature-capture';

const meta: Meta<typeof SignatureCapture> = {
  title: 'Components/SignatureCapture',
  component: SignatureCapture,
  tags: ['autodocs'],
  argTypes: {
    purpose: {
      control: 'select',
      options: ['approval', 'sign_off', 'acknowledgement'],
    },
    width: { control: 'number' },
    height: { control: 'number' },
    signerName: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof SignatureCapture>;

export const Default: Story = {
  render: () => {
    const [sig, setSig] = useState<SignatureData | null>(null);
    return (
      <div>
        <SignatureCapture
          onSign={setSig}
          signerName="John Smith"
          purpose="approval"
        />
        {sig && (
          <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
            Signature captured at {new Date(sig.signedAt).toLocaleString()}
          </div>
        )}
      </div>
    );
  },
};

export const SignOff: Story = {
  args: {
    onSign: (data: SignatureData) => console.log('Signed:', data),
    signerName: 'Jane Doe',
    purpose: 'sign_off',
  },
};

export const Acknowledgement: Story = {
  args: {
    onSign: (data: SignatureData) => console.log('Acknowledged:', data),
    signerName: 'Bob Wilson',
    purpose: 'acknowledgement',
  },
};

export const CustomSize: Story = {
  args: {
    onSign: (data: SignatureData) => console.log('Signed:', data),
    signerName: 'Admin',
    purpose: 'approval',
    width: 600,
    height: 250,
  },
};
