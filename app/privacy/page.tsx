import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | BuddyPept',
  description:
    'How BuddyPept handles your data. We collect only your name and email when you ask for a peptide, never health data, and we never sell it.',
};

const LAST_UPDATED = 'May 25, 2026';

/**
 * Standalone Privacy Policy page (Phase 7 placement map surface).
 * Draft, plain-language wording. A lawyer must review before public launch.
 *
 * Reflects the brand hard rules: collect only name + email, no health data,
 * no third-party tracking pixels, never sell data.
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <DraftNotice />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-zinc-500">Last updated: {LAST_UPDATED}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          Privacy is part of how BuddyPept is built. We keep what we collect to
          the bare minimum, we never sell it, and we do not track you around the
          web. Here is exactly what that means.
        </p>

        <Section title="What we collect">
          Only your name and email address, and only when you choose to submit
          the &ldquo;request a peptide&rdquo; form, along with the name of the
          peptide you asked us to add. That is the only personal information we
          collect.
        </Section>

        <Section title="What we do not collect">
          We do not ask for or store any health data: no height, weight, age,
          gender, conditions, or anything about your treatment. The dose numbers
          you type into the calculator are processed in your browser to show the
          result; we do not save them. We do not use third-party advertising or
          tracking pixels.
        </Section>

        <Section title="How we use your information">
          We use your name and email for one purpose: to email you when the
          peptide you requested is added to the library. We do not add you to
          unrelated marketing without your say-so.
        </Section>

        <Section title="Who we share it with">
          We never sell your information. We use a small number of trusted
          service providers to run the site, such as hosting, database, and
          email delivery. They process data only to provide those services to
          us. We share your information with them only as needed for that, or if
          required by law.
        </Section>

        <Section title="Keeping it, and your choices">
          We keep your request only as long as needed to follow up with you. You
          can ask us to show you what we have or to delete it at any time by
          emailing us, and we will honor that.
        </Section>

        <Section title="Security">
          We take reasonable steps to protect your information, but no method of
          storage or transmission over the internet is completely secure, so we
          cannot guarantee absolute security.
        </Section>

        <Section title="Children">
          BuddyPept is not directed to children and is intended for adults. We
          do not knowingly collect information from minors.
        </Section>

        <Section title="Changes">
          If we change this policy, we will update the date at the top of this
          page.
        </Section>

        <Section title="Contact">
          Questions or requests about your data can be sent to{' '}
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
