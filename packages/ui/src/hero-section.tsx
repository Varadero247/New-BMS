'use client';

import * as React from 'react';
import { cn } from './utils';

export interface HeroSectionProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function HeroSection({
  eyebrow,
  title,
  description,
  children,
  className,
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        'relative min-h-[92vh] flex flex-col items-center justify-center px-6 overflow-hidden',
        className
      )}
      style={{ background: 'var(--ink, #080B12)' }}
    >
      {/* Gradient background layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 70% 70% at 65% 35%, rgba(38,96,216,0.14), transparent 65%)',
            'radial-gradient(ellipse 45% 55% at 15% 75%, rgba(0,196,168,0.09), transparent 55%)',
            'radial-gradient(ellipse 30% 40% at 85% 80%, rgba(59,120,245,0.06), transparent 50%)',
          ].join(', '),
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(38,96,216,0.055) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(38,96,216,0.055) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 90% 80% at 65% 40%, black, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 65% 40%, black, transparent 72%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl text-center">
        {eyebrow && (
          <div className="flex items-center justify-center gap-3 mb-6">
            <span
              className="block"
              style={{
                width: 36,
                height: 2,
                background: 'var(--teal-core, #00C4A8)',
                borderRadius: 1,
              }}
            />
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.68rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase' as const,
                color: 'var(--teal-core, #00C4A8)',
              }}
            >
              {eyebrow}
            </span>
          </div>
        )}

        <div className="display mb-6">{title}</div>

        {description && <p className="body-lg max-w-2xl mx-auto mb-8">{description}</p>}

        {children && (
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">{children}</div>
        )}
      </div>
    </section>
  );
}

export interface HeroButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function HeroButton({
  children,
  variant = 'primary',
  href,
  onClick,
  className,
}: HeroButtonProps) {
  const Tag = href ? 'a' : 'button';
  const isPrimary = variant === 'primary';

  return (
    <Tag
      href={href}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200',
        className
      )}
      style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        fontSize: '0.88rem',
        padding: '13px 28px',
        borderRadius: 8,
        ...(isPrimary
          ? {
              background: 'var(--g-brand)',
              color: 'white',
            }
          : {
              background: 'transparent',
              border: '1.5px solid var(--border-hi, #263852)',
              color: 'var(--silver, #8EA8CC)',
            }),
      }}
    >
      {children}
    </Tag>
  );
}
