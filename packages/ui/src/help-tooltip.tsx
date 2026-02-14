'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from './utils';

export interface HelpTooltipProps {
  content: string;
  isoRef?: string;
  videoUrl?: string;
  className?: string;
}

export function HelpTooltip({
  content,
  isoRef,
  videoUrl,
  className,
}: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [flipX, setFlipX] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Auto-detect overflow and flip
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popoverHeight = 160;
    const popoverWidth = 280;

    // Flip vertically if not enough space below
    setFlipY(rect.bottom + popoverHeight + 8 > window.innerHeight);
    // Flip horizontally if not enough space to the right
    setFlipX(rect.left + popoverWidth > window.innerWidth);
  }, []);

  useEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  return (
    <span
      ref={containerRef}
      className={cn('relative inline-flex items-center', className)}
      onMouseEnter={() => { updatePosition(); setOpen(true); }}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Help circle icon (inline SVG, Lucide HelpCircle style) */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }}
        className="inline-flex items-center justify-center h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
        aria-label="Help"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>

      {/* Popover */}
      {open && (
        <div
          ref={popoverRef}
          className={cn(
            'absolute z-50 w-72 bg-card border border-border rounded-lg shadow-lg p-3',
            'animate-in fade-in duration-150',
            flipY ? 'bottom-full mb-2' : 'top-full mt-2',
            flipX ? 'right-0' : 'left-0'
          )}
          role="tooltip"
        >
          <p className="text-sm text-foreground leading-relaxed">{content}</p>

          {isoRef && (
            <p className="text-xs text-muted-foreground mt-2">
              ISO Ref: <span className="font-medium">{isoRef}</span>
            </p>
          )}

          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline mt-2"
            >
              {/* Play icon */}
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Watch video
            </a>
          )}
        </div>
      )}
    </span>
  );
}
