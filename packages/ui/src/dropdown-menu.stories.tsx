import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { DropdownMenu, DropdownItem, DropdownLabel, DropdownSeparator } from './dropdown-menu';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  argTypes: {
    align: {
      control: 'select',
      options: ['left', 'right'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: () => (
    <DropdownMenu
      trigger={<Button variant="outline">Menu</Button>}
    >
      <DropdownItem>Edit</DropdownItem>
      <DropdownItem>Delete</DropdownItem>
      <DropdownItem>Share</DropdownItem>
    </DropdownMenu>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <DropdownMenu
      trigger={<Button variant="outline">Actions</Button>}
    >
      <DropdownItem icon={<span>✏️</span>}>Edit Item</DropdownItem>
      <DropdownItem icon={<span>👁️</span>}>View Details</DropdownItem>
      <DropdownItem icon={<span>📋</span>}>Duplicate</DropdownItem>
      <DropdownItem icon={<span>🔗</span>}>Copy Link</DropdownItem>
      <DropdownSeparator />
      <DropdownItem destructive icon={<span>🗑️</span>}>
        Delete
      </DropdownItem>
    </DropdownMenu>
  ),
};

export const WithLabelsAndSeparators: Story = {
  render: () => (
    <DropdownMenu
      trigger={<Button variant="outline">File</Button>}
    >
      <DropdownLabel>File Operations</DropdownLabel>
      <DropdownItem icon={<span>📄</span>}>New</DropdownItem>
      <DropdownItem icon={<span>📂</span>}>Open</DropdownItem>
      <DropdownItem icon={<span>💾</span>}>Save</DropdownItem>
      <DropdownSeparator />
      <DropdownLabel>Advanced</DropdownLabel>
      <DropdownItem icon={<span>⚙️</span>}>Settings</DropdownItem>
      <DropdownItem icon={<span>ℹ️</span>}>About</DropdownItem>
    </DropdownMenu>
  ),
};

export const WithDestructive: Story = {
  render: () => (
    <DropdownMenu
      trigger={<Button variant="outline">More</Button>}
    >
      <DropdownItem icon={<span>📝</span>}>Edit</DropdownItem>
      <DropdownItem icon={<span>📤</span>}>Export</DropdownItem>
      <DropdownSeparator />
      <DropdownItem destructive icon={<span>🗑️</span>}>
        Delete Permanently
      </DropdownItem>
    </DropdownMenu>
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <DropdownMenu
      trigger={<Button variant="outline">Options</Button>}
    >
      <DropdownItem icon={<span>✂️</span>}>Cut</DropdownItem>
      <DropdownItem icon={<span>📋</span>}>Copy</DropdownItem>
      <DropdownItem icon={<span>📌</span>} disabled>
        Paste (Disabled)
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem icon={<span>↩️</span>}>Undo</DropdownItem>
      <DropdownItem icon={<span>↪️</span>} disabled>
        Redo (Disabled)
      </DropdownItem>
    </DropdownMenu>
  ),
};

export const RightAligned: Story = {
  render: () => (
    <div className="flex justify-end pr-8">
      <DropdownMenu
        trigger={<Button variant="outline">Align Right</Button>}
        align="right"
      >
        <DropdownItem icon={<span>🎨</span>}>Customize</DropdownItem>
        <DropdownItem icon={<span>⚙️</span>}>Preferences</DropdownItem>
        <DropdownItem icon={<span>👤</span>}>Profile</DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={<span>🚪</span>}>Logout</DropdownItem>
      </DropdownMenu>
    </div>
  ),
};

export const Compact: Story = {
  render: () => (
    <DropdownMenu
      trigger={<Button variant="ghost" size="sm">⋯</Button>}
    >
      <DropdownItem>View</DropdownItem>
      <DropdownItem>Edit</DropdownItem>
      <DropdownItem>Archive</DropdownItem>
      <DropdownItem destructive>Delete</DropdownItem>
    </DropdownMenu>
  ),
};

export const LongMenu: Story = {
  render: () => (
    <DropdownMenu
      trigger={<Button variant="outline">Categories</Button>}
    >
      <DropdownLabel>Popular</DropdownLabel>
      <DropdownItem>Recently Used</DropdownItem>
      <DropdownItem>Favorites</DropdownItem>
      <DropdownSeparator />
      <DropdownLabel>All Categories</DropdownLabel>
      <DropdownItem>Electronics</DropdownItem>
      <DropdownItem>Clothing</DropdownItem>
      <DropdownItem>Home & Garden</DropdownItem>
      <DropdownItem>Books & Media</DropdownItem>
      <DropdownItem>Sports & Outdoors</DropdownItem>
      <DropdownItem>Toys & Games</DropdownItem>
      <DropdownSeparator />
      <DropdownItem icon={<span>✨</span>}>View All Categories</DropdownItem>
    </DropdownMenu>
  ),
};
