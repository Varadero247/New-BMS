// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export const locales = ['en', 'de', 'fr', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export { I18nProvider, useI18n } from './provider';
export { LocaleSwitcher } from './locale-switcher';
export { useT } from './use-t';
