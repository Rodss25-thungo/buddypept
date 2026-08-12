import type { Metadata } from 'next';
import { CalculatorWizard } from './calculator-wizard';

export const metadata: Metadata = {
  title: 'Peptide Dosing Calculator | BuddyPept',
  description:
    'A free, step-by-step peptide dosing calculator for education. Enter a vial strength and a dose to see exactly how much would be drawn.',
};

/**
 * `?peptide=<slug>` preselects the picker. The "your peptide is live" email
 * links here so someone lands on the peptide they asked for instead of an
 * empty dropdown. Unknown slugs are ignored by the wizard.
 */
export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ peptide?: string | string[] }>;
}) {
  const { peptide } = await searchParams;
  const slug = Array.isArray(peptide) ? peptide[0] : peptide;
  return <CalculatorWizard initialPeptideSlug={slug} />;
}
