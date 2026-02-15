'use client';

import * as React from 'react';
import { cn } from './utils';

export interface CodeBlockProps {
  children: React.ReactNode;
  language?: string;
  className?: string;
}

export function CodeBlock({ children, language, className }: CodeBlockProps) {
  return (
    <div
      className={cn('overflow-auto', className)}
      style={{
        background: 'var(--ink, #080B12)',
        border: '1px solid var(--border, #1E2E48)',
        borderRadius: 12,
        padding: 28,
      }}
    >
      {language && (
        <div
          className="mb-3"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.62rem',
            color: 'var(--muted, #344D72)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
          }}
        >
          {language}
        </div>
      )}
      <pre
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '0.78rem',
          lineHeight: 1.9,
          color: 'var(--silver, #8EA8CC)',
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {children}
      </pre>
    </div>
  );
}
