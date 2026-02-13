import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmDialog } from './confirm-dialog';
import { Button } from './button';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const DangerDefault: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button variant="destructive" onClick={() => setIsOpen(true)}>
          Delete Item
        </Button>
        <ConfirmDialog
          isOpen={isOpen}
          onConfirm={() => {
            setIsOpen(false);
            alert('Item deleted!');
          }}
          onCancel={() => setIsOpen(false)}
          title="Delete Item"
          message="This action cannot be undone. Are you sure?"
          variant="danger"
        />
      </>
    );
  },
};

export const WarningVariant: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Proceed with Caution
        </Button>
        <ConfirmDialog
          isOpen={isOpen}
          onConfirm={() => {
            setIsOpen(false);
            alert('Action confirmed!');
          }}
          onCancel={() => setIsOpen(false)}
          title="Are you sure?"
          message="This action may have unintended consequences."
          variant="warning"
          confirmLabel="Proceed"
        />
      </>
    );
  },
};

export const InfoVariant: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          Confirm Action
        </Button>
        <ConfirmDialog
          isOpen={isOpen}
          onConfirm={() => {
            setIsOpen(false);
            alert('Confirmed!');
          }}
          onCancel={() => setIsOpen(false)}
          title="Confirm"
          message="Please confirm that you want to proceed with this action."
          variant="info"
        />
      </>
    );
  },
};

export const Loading: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLoading(false);
      setIsOpen(false);
      alert('Completed!');
    };

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          Process
        </Button>
        <ConfirmDialog
          isOpen={isOpen}
          onConfirm={handleConfirm}
          onCancel={() => !loading && setIsOpen(false)}
          title="Processing"
          message="This may take a moment..."
          variant="info"
          loading={loading}
        />
      </>
    );
  },
};

export const CustomLabels: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          Publish
        </Button>
        <ConfirmDialog
          isOpen={isOpen}
          onConfirm={() => {
            setIsOpen(false);
            alert('Published!');
          }}
          onCancel={() => setIsOpen(false)}
          title="Publish Content"
          message="Make this content public to all users?"
          variant="warning"
          confirmLabel="Publish"
          cancelLabel="Keep Private"
        />
      </>
    );
  },
};

export const LongMessage: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button variant="destructive" onClick={() => setIsOpen(true)}>
          Delete All
        </Button>
        <ConfirmDialog
          isOpen={isOpen}
          onConfirm={() => {
            setIsOpen(false);
            alert('All items deleted!');
          }}
          onCancel={() => setIsOpen(false)}
          title="Delete All Items"
          message="This will permanently delete all 45 items from your account. This action cannot be undone and will affect all connected services. Please make sure you have backed up any important data before proceeding."
          variant="danger"
          confirmLabel="Delete All"
          cancelLabel="Cancel"
        />
      </>
    );
  },
};
