'use client';
import { useTranslations } from 'next-intl';

/**
 * Convenience wrapper around next-intl's useTranslations.
 * Usage: const t = useT('common');  t('save') → 'Save'
 *        const t = useT();          t('common.save') → 'Save'
 */
export function useT(namespace?: string) {
  return useTranslations(namespace);
}
