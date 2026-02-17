# @ims/notifications

Real-time WebSocket notification system for IMS.

## Features

- WebSocket server for push notifications
- Notification bell React component
- User-targeted notifications with read/unread tracking
- 5 gateway API endpoints for notification CRUD
- Notification types: info, warning, error, success

## Usage

### Server-side (Gateway)

```typescript
import { NotificationServer } from '@ims/notifications';

const notificationServer = new NotificationServer(httpServer);

// Send notification to specific user
notificationServer.sendToUser(userId, {
  type: 'info',
  title: 'Audit Complete',
  message: 'Your ISO 9001 audit has been completed.',
});
```

### Client-side (React)

```typescript
import { NotificationBell } from '@ims/notifications/react';

<NotificationBell userId={currentUser.id} apiUrl="/api/notifications" />
```

## Gateway Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notifications` | List user notifications |
| POST | `/api/notifications` | Create notification |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |
