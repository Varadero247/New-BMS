'use client';
import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';
import { defaultLocale, type Locale, locales } from './index';

// Static imports — required for Next.js production builds (dynamic require() fails at runtime)
import en from '../messages/en.json';
import de from '../messages/de.json';
import fr from '../messages/fr.json';
import es from '../messages/es.json';

const MESSAGES: Record<Locale, Record<string, unknown>> = { en, de, fr, es };

function getMessages(locale: Locale): Record<string, unknown> {
  return MESSAGES[locale] ?? MESSAGES[defaultLocale];
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState(getMessages(defaultLocale));

  useEffect(() => {
    const stored = localStorage.getItem('ims-locale') as Locale | null;
    if (stored && locales.includes(stored)) {
      setLocale(stored);
      setMessages(getMessages(stored));
    }
  }, []);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
