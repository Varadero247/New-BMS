export const locales = ['en', 'de', 'fr', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export { I18nProvider, useI18n } from './provider';
export { LocaleSwitcher } from './locale-switcher';
export { useT } from './use-t';
