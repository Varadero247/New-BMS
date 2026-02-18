/**
 * InstallBanner — PWA install prompt component
 * Displays a banner when the app is installable but not yet installed.
 */

'use client';
import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface InstallBannerProps {
  /** Text to display on the install button */
  buttonText?: string;
  /** Text to display as the banner message */
  message?: string;
  /** Whether to show the dismiss button */
  dismissible?: boolean;
  /** Delay before showing the banner (ms) */
  delay?: number;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);

    return outcome === 'accepted';
  }, [deferredPrompt]);

  return { isInstallable, isInstalled, promptInstall };
}

export function InstallBanner({
  buttonText = 'Install App',
  message = 'Install IMS for a faster, offline-capable experience',
  dismissible = true,
  delay = 3000,
}: InstallBannerProps) {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isInstallable && !dismissed && !isInstalled) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isInstallable, dismissed, isInstalled, delay]);

  if (!visible || dismissed || isInstalled) return null;

  return (
    <div
      role="banner"
      aria-label="Install application"
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        background: 'var(--bg-surface, #ffffff)',
        border: '1px solid var(--border-primary, #e5e7eb)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 9999,
        maxWidth: '90vw',
        fontFamily: 'inherit',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 4v12m0 0l-4-4m4 4l4-4M4 18h16"
          stroke="var(--accent-primary, #2563eb)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{ fontSize: '14px', color: 'var(--text-primary, #111827)' }}>{message}</span>
      <button
        onClick={promptInstall}
        style={{
          padding: '6px 16px',
          background: 'var(--accent-primary, #2563eb)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontFamily: 'inherit',
        }}
      >
        {buttonText}
      </button>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          style={{
            padding: '4px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary, #6b7280)',
            fontSize: '18px',
            lineHeight: 1,
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
}
