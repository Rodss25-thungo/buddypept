import type { Metadata } from 'next';
import { CalculatorWizard } from './calculator-wizard';

export const metadata: Metadata = {
  title: 'Peptide Dosing Calculator | BuddyPept',
  description:
    'A free, step-by-step peptide dosing calculator for education. Enter a vial strength and a dose to see exactly how much would be drawn.',
};

export default function CalculatorPage() {
  return <CalculatorWizard />;
}
