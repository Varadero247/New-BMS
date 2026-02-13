import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarGroup } from './avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'away', 'busy'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    name: 'John Doe',
    size: 'md',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://avatars.githubusercontent.com/u/1234567?v=4',
    alt: 'User Avatar',
    size: 'md',
  },
};

export const ExtraSmall: Story = {
  args: {
    name: 'Sarah Smith',
    size: 'xs',
  },
};

export const Small: Story = {
  args: {
    name: 'Mike Johnson',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    name: 'Emma Wilson',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    name: 'David Brown',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    name: 'Alex Taylor',
    size: 'xl',
  },
};

export const Online: Story = {
  args: {
    name: 'John Online',
    size: 'md',
    status: 'online',
  },
};

export const Offline: Story = {
  args: {
    name: 'Jane Offline',
    size: 'md',
    status: 'offline',
  },
};

export const Away: Story = {
  args: {
    name: 'Bob Away',
    size: 'md',
    status: 'away',
  },
};

export const Busy: Story = {
  args: {
    name: 'Alice Busy',
    size: 'md',
    status: 'busy',
  },
};

export const SingleInitial: Story = {
  args: {
    name: 'X',
    size: 'md',
  },
};

export const NoName: Story = {
  args: {
    size: 'md',
  },
};

const AvatarGroupMeta: Meta<typeof AvatarGroup> = {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
  tags: ['autodocs'],
  argTypes: {
    max: {
      control: { type: 'number', min: 1, max: 10 },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
};

export const GroupDefault: StoryObj<typeof AvatarGroup> = {
  render: () => (
    <AvatarGroup max={5}>
      <Avatar name="Alice Smith" size="md" />
      <Avatar name="Bob Johnson" size="md" />
      <Avatar name="Charlie Brown" size="md" />
      <Avatar name="Diana Prince" size="md" />
      <Avatar name="Eve Wilson" size="md" />
    </AvatarGroup>
  ),
};

export const GroupSmall: StoryObj<typeof AvatarGroup> = {
  render: () => (
    <AvatarGroup max={5} size="sm">
      <Avatar name="Alice Smith" size="sm" />
      <Avatar name="Bob Johnson" size="sm" />
      <Avatar name="Charlie Brown" size="sm" />
      <Avatar name="Diana Prince" size="sm" />
    </AvatarGroup>
  ),
};

export const GroupLarge: StoryObj<typeof AvatarGroup> = {
  render: () => (
    <AvatarGroup max={5} size="lg">
      <Avatar name="Alice Smith" size="lg" />
      <Avatar name="Bob Johnson" size="lg" />
      <Avatar name="Charlie Brown" size="lg" />
      <Avatar name="Diana Prince" size="lg" />
    </AvatarGroup>
  ),
};

export const GroupWithOverflow: StoryObj<typeof AvatarGroup> = {
  render: () => (
    <AvatarGroup max={3}>
      <Avatar name="Alice Smith" size="md" />
      <Avatar name="Bob Johnson" size="md" />
      <Avatar name="Charlie Brown" size="md" />
      <Avatar name="Diana Prince" size="md" />
      <Avatar name="Eve Wilson" size="md" />
      <Avatar name="Frank Miller" size="md" />
      <Avatar name="Grace Lee" size="md" />
    </AvatarGroup>
  ),
};

export const GroupLargeOverflow: StoryObj<typeof AvatarGroup> = {
  render: () => (
    <AvatarGroup max={2} size="lg">
      <Avatar name="Alice Smith" size="lg" />
      <Avatar name="Bob Johnson" size="lg" />
      <Avatar name="Charlie Brown" size="lg" />
      <Avatar name="Diana Prince" size="lg" />
      <Avatar name="Eve Wilson" size="lg" />
    </AvatarGroup>
  ),
};

export const GroupWithStatus: StoryObj<typeof AvatarGroup> = {
  render: () => (
    <AvatarGroup max={4}>
      <Avatar name="Alice Smith" size="md" status="online" />
      <Avatar name="Bob Johnson" size="md" status="away" />
      <Avatar name="Charlie Brown" size="md" status="offline" />
      <Avatar name="Diana Prince" size="md" status="busy" />
    </AvatarGroup>
  ),
};

export const GroupMixed: StoryObj<typeof AvatarGroup> = {
  render: () => (
    <AvatarGroup max={3}>
      <Avatar src="https://avatars.githubusercontent.com/u/1?v=4" alt="User 1" size="md" />
      <Avatar name="Bob Johnson" size="md" />
      <Avatar name="Charlie Brown" size="md" />
      <Avatar name="Diana Prince" size="md" />
      <Avatar name="Eve Wilson" size="md" />
    </AvatarGroup>
  ),
};
