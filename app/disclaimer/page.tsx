import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medical Disclaimer | BuddyPept',
  description:
    'BuddyPept is an educational dosing-math tool, not medical advice. Read how the tool works and what it does not do.',
};

const LAST_UPDATED = 'May 25, 2026';

/**
 * Standalone Medical Disclaimer page (Phase 7 placement map surface).
 * Draft, plain-language wording. A lawyer must review before public launch.
 */
export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <DraftNotice />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Medical Disclaimer
      </h1>
      <p className="mt-2 text-sm text-zinc-500">Last updated: {LAST_UPDATED}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          BuddyPept is a free educational tool that helps people understand
          peptide reconstitution and dosing math. Please read this page before
          using the calculator or anything else on the site.
        </p>

        <Section title="This is education, not medical advice">
          Everything on BuddyPept is for general informational and educational
          purposes only. It is not medical advice, and it is not a substitute
          for the judgment of a licensed healthcare provider. We do not
          diagnose conditions, treat illness, prescribe anything, or tell you
          whether a peptide is safe or appropriate for you.
        </Section>

        <Section title="We do not recommend doses">
          The calculator does only the math you ask it to do. You enter the
          amounts (what is in your vial, how much water, the dose you intend),
          and it converts those numbers between units. It never suggests a dose,
          a frequency, or a protocol. Any dose you enter is one you decided on
          with your healthcare provider, not one BuddyPept chose for you.
        </Section>

        <Section title="No doctor-patient relationship">
          Using this website does not create a doctor-patient, provider-patient,
          or any professional relationship between you and BuddyPept or anyone
          associated with it. We are not your healthcare provider.
        </Section>

        <Section title="About peptides specifically">
          Many peptides are not approved by the FDA (or your local regulator)
          for human use, and their legal status varies by country and over time.
          Some are available only by prescription. BuddyPept describes peptides
          factually and does not encourage you to take any of them. Whether a
          peptide is legal, safe, or right for you is a decision for you and a
          qualified professional.
        </Section>

        <Section title="Accuracy and your responsibility">
          We work hard to keep the math correct, but we cannot guarantee that
          any result is accurate or appropriate for your specific situation.
          Always double-check any result against your vial label and your
          provider&rsquo;s guidance before acting on it. You are responsible for
          verifying the numbers you enter and the numbers you act on.
        </Section>

        <Section title="Assumption of risk and limitation of liability">
          You use BuddyPept at your own risk. To the fullest extent allowed by
          law, BuddyPept and the people behind it are not liable for any harm,
          loss, or damages of any kind arising from your use of the site or
          reliance on anything it shows you.
        </Section>

        <Section title="In an emergency">
          BuddyPept is not for medical emergencies. If you think you are having
          a medical emergency, call your local emergency number (911 in the US)
          or contact a healthcare professional immediately.
        </Section>

        <Section title="Questions">
          Questions about this disclaimer can be sent to{' '}
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

function DraftNotice() {
  return (
    <div className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      Draft for internal review. This wording has not yet been reviewed by a
      lawyer and should be finalized before public launch.
    </div>
  );
}
