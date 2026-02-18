import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal, ModalFooter } from './modal';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    title: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const ModalWrapper = ({
  title,
  description,
  size,
  children,
}: {
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={title}
        description={description}
        size={size}
      >
        {children ?? <p>Modal content goes here.</p>}
        <ModalFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Confirm</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <ModalWrapper title="Default Modal" description="This is a standard medium-sized modal." />
  ),
};

export const Small: Story = {
  render: () => (
    <ModalWrapper
      title="Small Modal"
      description="A compact modal for quick confirmations."
      size="sm"
    />
  ),
};

export const Large: Story = {
  render: () => (
    <ModalWrapper
      title="Large Modal"
      description="A large modal suitable for forms or detailed content."
      size="lg"
    />
  ),
};

export const ExtraLarge: Story = {
  render: () => (
    <ModalWrapper title="Extra Large Modal" size="xl">
      <p>Extra large modals are great for tables and multi-step workflows.</p>
    </ModalWrapper>
  ),
};

export const WithForm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Create Record</Button>
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Create New Record" size="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Label htmlFor="rec-title">Title</Label>
              <Input id="rec-title" placeholder="Enter title" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Label htmlFor="rec-desc">Description</Label>
              <Input id="rec-desc" placeholder="Enter description" />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  },
};

export const Confirmation: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete Item
        </Button>
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Confirm Deletion"
          description="This action cannot be undone. Are you sure you want to delete this item?"
          size="sm"
        >
          <ModalFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  },
};

export const WithoutTitle: Story = {
  render: () => (
    <ModalWrapper>
      <p style={{ padding: '8px 0' }}>
        This modal has no title or description — just plain content.
      </p>
    </ModalWrapper>
  ),
};
