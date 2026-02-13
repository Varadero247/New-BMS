'use client';
import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';
import { defaultLocale, type Locale, locales } from './index';

function getMessages(locale: Locale) {
  try {
    return require(`../messages/${locale}.json`);
  } catch {
    return require('../messages/en.json');
  }
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
