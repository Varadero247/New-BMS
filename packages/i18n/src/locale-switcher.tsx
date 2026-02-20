'use client';
import { useState, useEffect, useRef } from 'react';
import { locales, type Locale } from './index';
import { useI18n } from './provider';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Fran\u00e7ais',
  es: 'Espa\u00f1ol',
};

const LOCALE_FLAGS: Record<Locale, string> = {
  en: 'GB',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
};

export function LocaleSwitcher() {
  const { locale: current, switchLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSwitch(locale: Locale) {
    switchLocale(locale);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Switch language"
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          border: '1px solid var(--border-primary, #d1d5db)',
          borderRadius: '6px',
          background: 'var(--bg-surface, #fff)',
          color: 'var(--text-primary, #111827)',
          cursor: 'pointer',
          fontSize: '14px',
          fontFamily: 'inherit',
        }}
      >
        <span>{LOCALE_FLAGS[current as Locale]}</span>
        <span>{LOCALE_LABELS[current as Locale]}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: '4px' }}>
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            padding: '4px 0',
            background: 'var(--bg-surface, #fff)',
            border: '1px solid var(--border-primary, #d1d5db)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            listStyle: 'none',
            minWidth: '160px',
            zIndex: 50,
          }}
        >
          {locales.map((locale) => (
            <li key={locale}>
              <button
                role="option"
                aria-selected={locale === current}
                onClick={() => handleSwitch(locale)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: locale === current ? 'var(--bg-active, #f3f4f6)' : 'transparent',
                  color: 'var(--text-primary, #111827)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
              >
                <span>{LOCALE_FLAGS[locale]}</span>
                <span>{LOCALE_LABELS[locale]}</span>
                {locale === current && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ marginLeft: 'auto' }}
                  >
                    <path
                      d="M3.5 8L6.5 11L12.5 5"
                      stroke="var(--accent-primary, #2563eb)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
