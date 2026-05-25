import type { Metadata } from 'next';
import { CalculatorWizard } from './calculator-wizard';

export const metadata: Metadata = {
  title: 'Peptide Dosing Calculator | BuddyPept',
  description:
    'A free, step-by-step peptide dosing calculator. Tell Buddy what is in your vial and your dose, and see exactly how much to draw.',
};

export default function CalculatorPage() {
  return <CalculatorWizard />;
}
