import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { LegalPage } from '@/components/legal-page';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('termsTitle'), description: t('termsDescription') };
}

/**
 * Standalone terms page (Phase 7 placement map surface).
 * Draft, plain-language wording. A lawyer must review before public launch,
 * and per market, not once for all languages.
 */
export default function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <LegalPage page="terms" />;
}
