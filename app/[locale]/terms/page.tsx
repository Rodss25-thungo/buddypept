import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | BuddyPept',
  description:
    'The terms for using BuddyPept, a free educational peptide dosing-math tool.',
};

const LAST_UPDATED = 'May 25, 2026';

/**
 * Standalone Terms of Service page (Phase 7 placement map surface).
 * Draft, plain-language wording. A lawyer must review before public launch.
 * Placeholders to confirm before launch: governing-law state, contact email.
 */
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-zinc-500">Last updated: {LAST_UPDATED}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          These terms cover your use of BuddyPept (the &ldquo;Service&rdquo;).
          By using the Service, you agree to them. If you do not agree, please
          do not use the Service.
        </p>

        <Section title="What BuddyPept is">
          BuddyPept is a free educational tool for peptide reconstitution and
          dosing math, plus plain-language information about common peptides. It
          is provided for general informational purposes only.
        </Section>

        <Section title="Not medical advice">
          The Service does not provide medical advice and does not recommend
          doses. Please read our{' '}
          <Link href="/disclaimer" className="underline">
            Medical Disclaimer
          </Link>
          , which is part of these terms. You are responsible for verifying any
          result and for any decisions you make.
        </Section>

        <Section title="Acceptable use">
          Use the Service lawfully and for your own personal, educational
          purposes. Do not misuse it, attempt to break or overload it, copy it
          to pass off as your own, or use it to harm others.
        </Section>

        <Section title="No warranties">
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as
          available,&rdquo; without warranties of any kind, express or implied.
          We do not warrant that the Service will be accurate, error-free,
          uninterrupted, or suitable for your situation.
        </Section>

        <Section title="Limitation of liability">
          To the fullest extent allowed by law, BuddyPept and the people behind
          it are not liable for any indirect, incidental, or consequential
          damages, or for any harm or loss arising from your use of, or reliance
          on, the Service.
        </Section>

        <Section title="Intellectual property">
          The BuddyPept name, content, and design belong to BuddyPept. You may
          use the Service for your own personal use, but you may not copy,
          resell, or redistribute it without permission.
        </Section>

        <Section title="Third-party services">
          The Service runs on third-party providers (for hosting, data storage,
          and email). Their handling of data is covered in our{' '}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </Section>

        <Section title="Changes">
          We may update the Service or these terms over time. If we make
          meaningful changes, we will update the date at the top of this page.
          Continuing to use the Service means you accept the current terms.
        </Section>

        <Section title="Governing law">
          These terms are governed by the laws of [your home state], without
          regard to conflict-of-law rules.
        </Section>

        <Section title="Contact">
          Questions about these terms can be sent to{' '}
          <span className="font-medium">hello@buddypept.com</span>.
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      <p className="mt-2">{children}</p>
    </section>
  );
}

