'use client';

/**
 * @ims/pwa — PWA offline infrastructure for the IMS platform
 */

export { SyncQueue, syncQueue } from './sync-queue';
export type { QueuedRequest } from './sync-queue';

export { OfflineCache, offlineCache } from './offline-cache';

export { useOfflineStatus } from './use-offline';
export type { OfflineStatus } from './use-offline';

export { registerServiceWorker } from './register-sw';
export type { ServiceWorkerRegistrationResult } from './register-sw';

// Push Notifications
export {
  isPushSupported,
  requestPermission,
  getPermissionState,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribedToPush,
  showLocalNotification,
} from './push-notifications';
export type { PushSubscriptionData, PushNotificationOptions } from './push-notifications';

// Camera Capture
export { useCamera, isCameraSupported } from './camera';
export type { CameraOptions, CapturedImage, CameraState } from './camera';

// Geolocation
export { useGeolocation, calculateDistance } from './geolocation';
export type { GeoPosition, GeolocationState, GeolocationOptions } from './geolocation';

// Manifest Generator
export {
  generateManifest,
  generateModuleManifest,
  injectManifest,
  setThemeColor,
} from './manifest-generator';
export type { ManifestConfig, ManifestIcon } from './manifest-generator';

// Install Banner
export { InstallBanner, useInstallPrompt } from './install-banner';
export type { InstallBannerProps } from './install-banner';
