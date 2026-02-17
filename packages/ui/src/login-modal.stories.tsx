import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LoginModal } from './login-modal';
import { Button } from './button';

const meta: Meta<typeof LoginModal> = {
  title: 'Components/LoginModal',
  component: LoginModal,
  tags: ['autodocs'],
  argTypes: {
    defaultEnv: {
      control: 'select',
      options: ['local', 'staging', 'production'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoginModal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Open Login Modal</Button>
        <LoginModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onSuccess={(token) => {
            console.log('Login success, token:', token);
            setOpen(false);
          }}
          defaultEnv="local"
        />
      </div>
    );
  },
};

export const StagingEnv: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Login (Staging)</Button>
        <LoginModal
          isOpen={open}
          onClose={() => setOpen(false)}
          defaultEnv="staging"
        />
      </div>
    );
  },
};

export const ProductionEnv: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Login (Production)</Button>
        <LoginModal
          isOpen={open}
          onClose={() => setOpen(false)}
          defaultEnv="production"
        />
      </div>
    );
  },
};
