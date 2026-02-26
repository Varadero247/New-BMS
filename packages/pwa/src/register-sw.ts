// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * registerServiceWorker — Registration and update management for the IMS service worker
 */

export interface ServiceWorkerRegistrationResult {
  registration: ServiceWorkerRegistration | null;
  isSupported: boolean;
  update: () => void;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistrationResult> {
  const isSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

  if (!isSupported) {
    return {
      registration: null,
      isSupported: false,
      update: () => {},
    };
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    // Handle updates — when a new SW is waiting, tell it to skip waiting
    const handleStateChange = () => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    };

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', handleStateChange);
      }
    });

    // If there is already a waiting worker on load, activate it
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    const update = () => {
      registration.update().catch(() => {
        // update check may fail if offline
      });
    };

    return {
      registration,
      isSupported: true,
      update,
    };
  } catch (error) {
    console.error('[IMS PWA] Service worker registration failed:', error);
    return {
      registration: null,
      isSupported: true,
      update: () => {},
    };
  }
}
