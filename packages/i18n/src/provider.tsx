'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { NextIntlClientProvider } from 'next-intl';
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

interface I18nContextValue {
  /** The currently active locale */
  locale: Locale;
  /**
   * Switch to a new locale immediately — updates the React tree without a
   * page reload. Also persists the choice to localStorage('ims-locale').
   */
  switchLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: defaultLocale,
  switchLocale: () => {},
});

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
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

  const switchLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem('ims-locale', newLocale);
    setLocale(newLocale);
    setMessages(getMessages(newLocale));
  }, []);

  return (
    <I18nContext.Provider value={{ locale, switchLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  );
}
