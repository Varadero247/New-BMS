# @ims/pwa

Progressive Web App utilities for IMS web applications.

## Features

- Service worker with offline caching strategies
- Background sync queue for offline form submissions
- Offline cache with IndexedDB fallback
- Push notification support
- Camera and geolocation hooks
- PWA manifest generator
- Install banner component
- React hook: `usePWA()`

## Usage

### React Hook

```typescript
import { usePWA } from '@ims/pwa';

function App() {
  const { isOnline, isInstallable, install, pendingSyncCount } = usePWA();

  return (
    <div>
      {!isOnline && <Banner>You are offline. Changes will sync when reconnected.</Banner>}
      {isInstallable && <Button onClick={install}>Install App</Button>}
      {pendingSyncCount > 0 && <Badge>{pendingSyncCount} pending</Badge>}
    </div>
  );
}
```

### Service Worker

```typescript
import { registerServiceWorker } from '@ims/pwa';

// Register in app entry point
registerServiceWorker('/sw.js');
```

### Offline Sync

```typescript
import { SyncQueue } from '@ims/pwa';

const queue = new SyncQueue();

// Queue a request for later sync
await queue.add({
  url: '/api/health-safety/inspections',
  method: 'POST',
  body: inspectionData,
});
```

## Components

| Component            | Description                 |
| -------------------- | --------------------------- |
| `InstallBanner`      | Prompts user to install PWA |
| `useCamera()`        | Camera access hook          |
| `useGeolocation()`   | GPS location hook           |
| `generateManifest()` | Creates web app manifest    |
