import type { Meta, StoryObj } from '@storybook/react';
import { Timeline } from './timeline';
import type { TimelineItem } from './timeline';

const meta: Meta<typeof Timeline> = {
  title: 'Components/Timeline',
  component: Timeline,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

const defaultItems: TimelineItem[] = [
  {
    id: '1',
    title: 'Project Started',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    title: 'Team Meeting Held',
    timestamp: '1 hour ago',
  },
  {
    id: '3',
    title: 'Requirements Finalized',
    timestamp: '30 minutes ago',
  },
];

export const Default: Story = {
  args: {
    items: defaultItems,
  },
};

export const WithDescriptions: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Project Created',
        description: 'New project "IMS Platform" has been created in the system.',
        timestamp: '2026-02-13 09:00',
      },
      {
        id: '2',
        title: 'Requirements Submitted',
        description: 'Initial requirements document submitted for review by stakeholders.',
        timestamp: '2026-02-13 10:30',
      },
      {
        id: '3',
        title: 'Design Approved',
        description: 'System architecture and UI design approved by the design team.',
        timestamp: '2026-02-13 14:15',
      },
      {
        id: '4',
        title: 'Development Started',
        description: 'Development phase has officially begun with initial sprint planning.',
        timestamp: '2026-02-13 16:45',
      },
    ],
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      {
        id: '1',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m0 0h6"
            />
          </svg>
        ),
        title: 'Feature Added',
        description: 'New search functionality added to the dashboard.',
        timestamp: '2026-02-12 14:20',
        user: 'Sarah Johnson',
      },
      {
        id: '2',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        title: 'Tests Passed',
        description: 'All unit tests and integration tests completed successfully.',
        timestamp: '2026-02-12 16:45',
        user: 'Mike Chen',
      },
      {
        id: '3',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        ),
        title: 'Code Reviewed',
        description: 'Pull request reviewed and approved with minor suggestions.',
        timestamp: '2026-02-12 17:30',
        user: 'Alex Kumar',
      },
    ],
  },
};

export const WithBadges: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Requirement Gathered',
        description: 'Collected and documented all business requirements.',
        timestamp: '2026-02-10 10:00',
        badge: {
          label: 'Planning',
          className: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        ),
      },
      {
        id: '2',
        title: 'Design Completed',
        description: 'UI/UX design finalized and handed off to development.',
        timestamp: '2026-02-11 15:00',
        badge: {
          label: 'Design',
          className: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
        ),
      },
      {
        id: '3',
        title: 'Development Sprint 1',
        description: 'First sprint completed with core features implemented.',
        timestamp: '2026-02-12 17:00',
        badge: {
          label: 'In Progress',
          className: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        ),
      },
      {
        id: '4',
        title: 'Testing & QA',
        description: 'Quality assurance phase in progress.',
        timestamp: '2026-02-13 09:00',
        badge: {
          label: 'Testing',
          className: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
    ],
  },
};

export const WithUserAttributions: Story = {
  args: {
    items: [
      {
        id: '1',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ),
        title: 'Issue Created',
        description: 'New bug reported: Login form validation not working on mobile.',
        timestamp: '2026-02-13 08:30',
        user: 'Emily Rodriguez',
        badge: {
          label: 'Bug',
          className: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
        },
      },
      {
        id: '2',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
          </svg>
        ),
        title: 'Issue Assigned',
        description: 'Bug assigned to development team for investigation.',
        timestamp: '2026-02-13 09:15',
        user: 'James Wilson',
      },
      {
        id: '3',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        ),
        title: 'Fix In Progress',
        description: 'Developer started working on the mobile validation fix.',
        timestamp: '2026-02-13 10:00',
        user: 'David Park',
        badge: {
          label: 'In Progress',
          className: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
        },
      },
      {
        id: '4',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        title: 'Issue Resolved',
        description: 'Pull request merged. Mobile form validation now working correctly.',
        timestamp: '2026-02-13 11:45',
        user: 'Lisa Anderson',
        badge: {
          label: 'Resolved',
          className: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
        },
      },
    ],
  },
};

export const MultiColorIcons: Story = {
  args: {
    items: [
      {
        id: '1',
        icon: (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" />
          </svg>
        ),
        title: 'Account Created',
        timestamp: '2026-02-01 08:00',
        user: 'System',
      },
      {
        id: '2',
        icon: (
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        ),
        title: 'Email Verified',
        timestamp: '2026-02-01 08:15',
      },
      {
        id: '3',
        icon: (
          <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        ),
        title: 'Profile Completed',
        timestamp: '2026-02-01 09:30',
      },
      {
        id: '4',
        icon: (
          <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ),
        title: 'First Purchase',
        timestamp: '2026-02-15 14:20',
      },
    ],
  },
};

export const SimpleActivityLog: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'File uploaded',
        timestamp: '14:30',
      },
      {
        id: '2',
        title: 'Document edited',
        timestamp: '14:25',
      },
      {
        id: '3',
        title: 'Comment added',
        timestamp: '14:20',
      },
      {
        id: '4',
        title: 'Shared with team',
        timestamp: '14:10',
      },
    ],
  },
};

export const EmptyState: Story = {
  args: {
    items: [],
  },
  render: () => (
    <div className="flex items-center justify-center p-8">
      <Timeline items={[]} />
      <div className="text-center text-gray-500">No timeline items to display</div>
    </div>
  ),
};
