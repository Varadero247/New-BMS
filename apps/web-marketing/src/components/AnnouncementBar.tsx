'use client';
import { useEffect, useState } from 'react';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('announcement-dismissed');
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('announcement-dismissed', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="relative z-50 bg-teal text-white text-sm"
      role="banner"
      aria-label="Announcement"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex-1 text-center font-body">
          <span className="font-medium">
            🎉 Nexara IMS v3.0 — AI-powered risk controls, 29 ISO frameworks &amp; real-time
            dashboards.
          </span>{' '}
          <a
            href="/blog/v3-announcement"
            className="underline underline-offset-2 hover:text-white/80 transition-colors font-semibold whitespace-nowrap"
          >
            Read the announcement →
          </a>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
