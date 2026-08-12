import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CalculatorWizard } from './calculator-wizard';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('calculatorTitle'),
    description: t('calculatorDescription'),
  };
}

/**
 * `?peptide=<slug>` preselects the picker. The "your peptide is live" email
 * links here so someone lands on the peptide they asked for instead of an
 * empty dropdown. Unknown slugs are ignored by the wizard.
 */
export default async function CalculatorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ peptide?: string | string[] }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { peptide } = await searchParams;
  const slug = Array.isArray(peptide) ? peptide[0] : peptide;
  return <CalculatorWizard initialPeptideSlug={slug} />;
}
