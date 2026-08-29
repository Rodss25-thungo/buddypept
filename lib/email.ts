/**
 * Brevo transactional email sender (server-side only).
 *
 * Used for:
 *   - Double opt-in confirmation email (to the user who signed up)
 *   - Owner notification (to buddypept@gmail.com, every signup)
 *   - Non-peptide auto-reply (to a user who requested testosterone/steroids)
 *
 * Authenticated with BREVO_API_KEY (Brevo dashboard -> SMTP & API -> API keys).
 * The sender domain buddypept.com is already verified in Brevo, so messages
 * send from hello@buddypept.com with proper DKIM signatures.
 *
 * Language
 * ────────
 * Every reader-facing send takes an explicit `locale`. Email is generated
 * outside any request, often from the cron job days after the signup, so it
 * cannot infer the language from the current page: it reads the `locale`
 * column recorded on the signup row. Unknown or missing values fall back to
 * English, which is what every pre-existing row holds.
 *
 * The owner notification is the exception. It goes to Rod, so it stays English
 * and has no locale parameter.
 */

import { getTranslations } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import {
  describeChange,
  describeWindow,
  type WeeklyReport,
} from '@/lib/weekly-report';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const OWNER_EMAIL = 'buddypept@gmail.com';
const SITE_URL = 'https://buddypept.com';
const ADMIN_URL = `${SITE_URL}/admin`;

/**
 * Where replies land. Defaults to the sender address, which is the existing
 * behaviour. Set REPLY_TO_EMAIL to route replies to an inbox that is actually
 * read: the "when is the tracker coming?" replies are the demand signal behind
 * the 30-reply build threshold, and they are worthless if nobody sees them.
 */
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL;

/** Narrows whatever the database returned to a locale we can actually send. */
function resolveLocale(locale?: string | null): Locale {
  return routing.locales.includes(locale as Locale)
    ? (locale as Locale)
    : routing.defaultLocale;
}

/**
 * Loads the `emails` namespace for a locale, outside of any request context.
 *
 * Falls back to English per key (see i18n/request.ts), so a locale whose
 * catalog is still in draft sends readable English rather than raw key names.
 */
async function emailStrings(locale: Locale) {
  return getTranslations({ locale, namespace: 'emails' });
}

/** "Hi Ana," or "Hi there," depending on whether a name was captured. */
function greetingFor(
  t: Awaited<ReturnType<typeof emailStrings>>,
  toName?: string
): string {
  const firstName = toName?.trim().split(/\s+/)[0] ?? '';
  return firstName ? t('greetingNamed', { name: firstName }) : t('greetingAnon');
}

const PARA = 'margin:0 0 16px;font-size:16px;line-height:1.6;';
const PARA_LAST = 'margin:0 0 28px;font-size:16px;line-height:1.6;';
const MUTED = 'margin:0 0 16px;font-size:14px;line-height:1.6;color:#6b7280;';
const BUTTON =
  'display:inline-block;background:#0d9488;color:#ffffff;padding:14px 28px;' +
  'border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;';

/**
 * The shared BuddyPept email shell: logo, body, rule, sign-off.
 *
 * `body` is raw HTML the callers assemble, so anything interpolated into it
 * must already be escaped. Having one shell means a layout fix lands in every
 * email instead of three near-copies drifting apart.
 */
function shell(bodyHtml: string, signoff: string): string {
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1c1917;">
    <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
      <div style="text-align:left;margin-bottom:24px;">
        <img src="${SITE_URL}/signature-logo" width="32" height="32" alt="BuddyPept" style="vertical-align:middle;border-radius:6px;">
        <span style="margin-left:10px;font-weight:700;font-size:18px;vertical-align:middle;">BuddyPept</span>
      </div>
${bodyHtml}
      <hr style="border:0;border-top:1px solid #e5e7eb;margin:28px 0 16px;">
      <p style="margin:0;font-size:14px;color:#6b7280;">
        ${escapeHtml(signoff)}<br>
        <a href="${SITE_URL}" style="color:#0d9488;text-decoration:none;">buddypept.com</a>
      </p>
    </div>
  </body>
</html>`.trim();
}

/**
 * Renders a message that may contain <b> tags into escaped HTML.
 *
 * next-intl's t.rich() returns React nodes, which are no use in an email
 * string, so the interpolated values are escaped first and the <b> tags in the
 * catalog are the only markup allowed through.
 */
function richToHtml(message: string): string {
  return message.replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>');
}

/** Same message with the markup stripped, for the plain-text alternative. */
function richToText(message: string): string {
  return message.replace(/<\/?b>/g, '');
}

// ─── Confirmation email ───

interface SendConfirmationArgs {
  to: string;
  toName: string;
  confirmUrl: string;
  /** Site language the person signed up in. Defaults to English. */
  locale?: string | null;
}

export async function sendConfirmationEmail({
  to,
  toName,
  confirmUrl,
  locale,
}: SendConfirmationArgs): Promise<void> {
  const apiKey = requireApiKey();
  const t = await emailStrings(resolveLocale(locale));
  const greeting = greetingFor(t, toName);
  const safeUrl = escapeHtml(confirmUrl);

  const html = shell(
    `      <p style="${PARA}">${escapeHtml(greeting)}</p>
      <p style="${PARA_LAST}">${escapeHtml(t('confirmation.body'))}</p>
      <p style="margin:0 0 28px;">
        <a href="${safeUrl}" style="${BUTTON}">${escapeHtml(t('confirmation.cta'))}</a>
      </p>
      <p style="${MUTED}">
        ${escapeHtml(t('confirmation.fallbackLink'))}<br>
        <a href="${safeUrl}" style="color:#0d9488;word-break:break-all;">${safeUrl}</a>
      </p>
      <p style="${MUTED}">${escapeHtml(t('confirmation.notYou'))}</p>`,
    t('signoff')
  );

  const text = [
    greeting,
    '',
    t('confirmation.textBody'),
    '',
    confirmUrl,
    '',
    t('confirmation.notYou'),
    '',
    t('signoff'),
    'buddypept.com',
  ].join('\n');

  await sendViaBrevo({
    apiKey,
    to,
    toName,
    subject: t('confirmation.subject'),
    html,
    text,
  });
}

// ─── Non-peptide auto-reply (testosterone/steroids) ───

interface SendNonPeptideReplyArgs {
  to: string;
  toName: string;
  requested: string;
  /** Site language the person signed up in. Defaults to English. */
  locale?: string | null;
}

export async function sendNonPeptideAutoReply({
  to,
  toName,
  requested,
  locale,
}: SendNonPeptideReplyArgs): Promise<void> {
  const apiKey = requireApiKey();
  const t = await emailStrings(resolveLocale(locale));
  const greeting = greetingFor(t, toName);
  const thanks = t('nonPeptide.thanks', { requested: escapeHtml(requested) });

  const html = shell(
    `      <p style="${PARA}">${escapeHtml(greeting)}</p>
      <p style="${PARA}">${richToHtml(thanks)}</p>
      <p style="${PARA}">${escapeHtml(t('nonPeptide.scope'))}</p>
      <p style="${PARA_LAST}">${escapeHtml(t('nonPeptide.invite'))}</p>
      <p style="margin:0 0 28px;">
        <a href="${SITE_URL}/learn" style="${BUTTON}">${escapeHtml(t('nonPeptide.cta'))}</a>
      </p>`,
    t('signoff')
  );

  const text = [
    greeting,
    '',
    richToText(t('nonPeptide.thanks', { requested })),
    '',
    t('nonPeptide.scope'),
    '',
    t('nonPeptide.invite'),
    `${SITE_URL}/learn`,
    '',
    t('signoff'),
    'buddypept.com',
  ].join('\n');

  await sendViaBrevo({
    apiKey,
    to,
    toName,
    subject: t('nonPeptide.subject'),
    html,
    text,
  });
}

// ─── "Your peptide is live" notification ───

interface SendPeptideLiveArgs {
  to: string;
  toName: string;
  /** Display name of the peptide, e.g. "NAD+". */
  peptideName: string;
  /** Slug used to deep-link the calculator with the peptide preselected. */
  peptideSlug: string;
  /** Site language the person signed up in. Defaults to English. */
  locale?: string | null;
}

/**
 * Sent once to someone who requested a peptide, after it ships in the calculator.
 *
 * Voice rules this copy holds to, do not "improve" them away, and carry them
 * into every translation:
 *   - Never implies or assumes the reader is dosing themselves. The compound is
 *     the subject, never their body. "whatever your research calls for."
 *   - No time references. "You asked for X" stands alone and does not date the
 *     email, which may go out long after the request.
 *   - The disclaimer is one sentence with the joke attached, not a stacked block.
 *     Anti-disclaimer-fest is part of the brand spine.
 *   - The tracker line is deliberate. Replies asking "when?" are the demand
 *     signal; 30 of them is the threshold to build it.
 */
export async function sendPeptideLiveEmail({
  to,
  toName,
  peptideName,
  peptideSlug,
  locale,
}: SendPeptideLiveArgs): Promise<void> {
  const apiKey = requireApiKey();
  const resolved = resolveLocale(locale);
  const t = await emailStrings(resolved);
  const greeting = greetingFor(t, toName);
  const safeName = escapeHtml(peptideName);

  // The deep link keeps the reader in their own language.
  const prefix = resolved === routing.defaultLocale ? '' : `/${resolved}`;
  const url = `${SITE_URL}${prefix}/calculator?peptide=${encodeURIComponent(peptideSlug)}`;

  const paragraphs = ['whatItDoes', 'noRounding', 'tracker', 'disclaimer', 'thanks'] as const;

  const html = shell(
    `      <p style="${PARA}">${escapeHtml(greeting)}</p>
      <p style="${PARA_LAST}">${richToHtml(t('peptideLive.lede', { name: safeName }))}</p>
      <p style="margin:0 0 28px;">
        <a href="${escapeHtml(url)}" style="${BUTTON}">${escapeHtml(t('peptideLive.cta', { name: peptideName }))}</a>
      </p>
${paragraphs.map((k) => `      <p style="${PARA}">${escapeHtml(t(`peptideLive.${k}`))}</p>`).join('\n')}`,
    t('signoff')
  );

  const text = [
    greeting,
    '',
    richToText(t('peptideLive.lede', { name: peptideName })),
    '',
    `${t('peptideLive.cta', { name: peptideName })}: ${url}`,
    '',
    ...paragraphs.flatMap((k) => [t(`peptideLive.${k}`), '']),
    t('signoff'),
    'buddypept.com',
  ].join('\n');

  await sendViaBrevo({
    apiKey,
    to,
    toName,
    subject: t('peptideLive.subject', { name: peptideName }),
    html,
    text,
  });
}

// ─── Owner notification (sent on every signup) ───

interface SendOwnerNotificationArgs {
  type: 'library-signup' | 'peptide-request' | 'non-peptide-request';
  name: string;
  email: string;
  detail: string;
}

const TYPE_LABEL: Record<SendOwnerNotificationArgs['type'], string> = {
  'library-signup': 'Library signup',
  'peptide-request': 'Peptide request',
  'non-peptide-request': 'Non-peptide request (auto-replied)',
};

export async function sendOwnerNotification({
  type,
  name,
  email,
  detail,
}: SendOwnerNotificationArgs): Promise<void> {
  const apiKey = requireApiKey();
  const label = TYPE_LABEL[type];
  const isBlocked = type === 'non-peptide-request';
  const banner = isBlocked
    ? '<p style="margin:0 0 20px;padding:10px 14px;border-radius:8px;background:#fef3c7;color:#92400e;font-size:14px;">⚠ Auto-replied (non-peptide, user told we only cover peptides)</p>'
    : '';

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeDetail = escapeHtml(detail);

  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1c1917;">
    <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
      <p style="margin:0 0 16px;font-size:14px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">New BuddyPept ${escapeHtml(label.toLowerCase())}</p>
      ${banner}
      <table style="width:100%;font-size:15px;line-height:1.6;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;width:120px;">Name:</td><td style="padding:6px 0;"><strong>${safeName}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Email:</td><td style="padding:6px 0;"><a href="mailto:${safeEmail}" style="color:#0d9488;text-decoration:none;">${safeEmail}</a></td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Type:</td><td style="padding:6px 0;">${escapeHtml(label)}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;vertical-align:top;">${type === 'peptide-request' || type === 'non-peptide-request' ? 'Requested:' : 'Source:'}</td><td style="padding:6px 0;"><strong>${safeDetail}</strong></td></tr>
      </table>
      <p style="margin:24px 0 0;">
        <a href="${ADMIN_URL}" style="display:inline-block;background:#0d9488;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View all signups</a>
      </p>
    </div>
  </body>
</html>`.trim();

  const text =
    `New BuddyPept ${label.toLowerCase()}\n${isBlocked ? '\n⚠ Auto-replied (non-peptide; user told we only cover peptides)\n' : ''}\nName: ${name}\nEmail: ${email}\nType: ${label}\n${type === 'peptide-request' || type === 'non-peptide-request' ? 'Requested' : 'Source'}: ${detail}\n\nView all signups: ${ADMIN_URL}`;

  await sendViaBrevo({
    apiKey,
    to: OWNER_EMAIL,
    toName: 'BuddyPept',
    subject: `BuddyPept: ${label.toLowerCase()} from ${name}`,
    html,
    text,
  });
}

// ─── Weekly performance report ───

/**
 * Where the weekly report goes.
 *
 * This is a deliberate exception to the rule that rodss25@gmail.com only ever
 * receives previews and test copies. Rod asked for the report in his personal
 * inbox on 2026-08-29. It is an internal report, never user-facing, so nothing
 * about it reaches a reader.
 */
const REPORT_EMAIL = 'rodss25@gmail.com';

function reportRow(label: string, value: string): string {
  return `<tr><td style="padding:7px 0;color:#6b7280;width:190px;">${escapeHtml(label)}</td><td style="padding:7px 0;"><strong>${escapeHtml(value)}</strong></td></tr>`;
}

/**
 * Sends the weekly numbers to Rod.
 *
 * English only and plain by design: this is an internal report, so it skips the
 * locale machinery and the brand shell that reader-facing mail uses.
 */
export async function sendWeeklyReport({
  report,
}: {
  report: WeeklyReport;
}): Promise<void> {
  const apiKey = requireApiKey();
  const window = describeWindow(report.windowStart, report.windowEnd);
  const change = describeChange(report.signups, report.signupsPrior);

  const rate =
    report.confirmationRate === null
      ? 'no signups to measure'
      : `${Math.round(report.confirmationRate)}%`;

  const locales = Object.entries(report.localeSplit)
    .sort((a, b) => b[1] - a[1])
    .map(([code, n]) => `${code} ${n}`)
    .join(', ');

  const demandList = report.topDemand.length
    ? report.topDemand
        .map(
          (d) =>
            `<li style="margin:0 0 6px;">${escapeHtml(d.displayName)} <span style="color:#6b7280;">${d.requestCount} ${d.requestCount === 1 ? 'person' : 'people'}</span>${d.isGap ? ' <span style="color:#b45309;">not in the calculator</span>' : ''}</li>`
        )
        .join('')
    : '<li style="color:#6b7280;">No confirmed requests yet.</li>';

  const gapsBlock = report.gaps.length
    ? `<p style="margin:24px 0 8px;font-size:14px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Asked for, not offered</p>
       <p style="margin:0 0 10px;font-size:15px;line-height:1.6;">People confirmed their email, then found the calculator could not help them. Each one is a peptide worth considering.</p>
       <ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.6;">${report.gaps
         .map(
           (d) =>
             `<li style="margin:0 0 6px;">${escapeHtml(d.displayName)} <span style="color:#6b7280;">${d.requestCount} ${d.requestCount === 1 ? 'person' : 'people'}</span></li>`
         )
         .join('')}</ul>`
    : '';

  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1c1917;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <p style="margin:0 0 4px;font-size:14px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">BuddyPept weekly</p>
      <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">${escapeHtml(window)}</p>

      <p style="margin:0 0 20px;font-size:17px;line-height:1.6;"><strong>${report.signups}</strong> ${report.signups === 1 ? 'person' : 'people'} signed up, ${escapeHtml(change)}.</p>

      <table style="width:100%;font-size:15px;line-height:1.6;border-collapse:collapse;">
        ${reportRow('Confirmed', String(report.confirmed))}
        ${reportRow('Still unconfirmed', String(report.pending))}
        ${reportRow('Confirmation rate', rate)}
        ${reportRow('Language', locales || 'none')}
        ${reportRow('Owed a "it is live" email', String(report.awaitingNotification))}
        ${reportRow('Confirmed, all time', String(report.totalConfirmedAllTime))}
      </table>

      <p style="margin:28px 0 8px;font-size:14px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Most requested</p>
      <ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.6;">${demandList}</ul>

      ${gapsBlock}

      <p style="margin:28px 0 0;">
        <a href="${ADMIN_URL}" style="display:inline-block;background:#0d9488;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Open the admin page</a>
      </p>

      <hr style="border:0;border-top:1px solid #e5e7eb;margin:28px 0 16px;">
      <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
        Traffic numbers are not in here yet. Page views and sources live in Google Analytics, which needs a Google Cloud service account before this report can read them.<br><br>
        Replies to the tracker teaser are not counted either. They arrive in Gmail rather than the database, so the 30-reply threshold stays a manual count.
      </p>
    </div>
  </body>
</html>`.trim();

  const text = [
    `BuddyPept weekly, ${window}`,
    ``,
    `${report.signups} signed up, ${change}.`,
    `Confirmed: ${report.confirmed}`,
    `Still unconfirmed: ${report.pending}`,
    `Confirmation rate: ${rate}`,
    `Language: ${locales || 'none'}`,
    `Owed an "it is live" email: ${report.awaitingNotification}`,
    `Confirmed, all time: ${report.totalConfirmedAllTime}`,
    ``,
    `Most requested:`,
    ...(report.topDemand.length
      ? report.topDemand.map(
          (d) =>
            `  ${d.displayName}: ${d.requestCount}${d.isGap ? ' (not in the calculator)' : ''}`
        )
      : ['  No confirmed requests yet.']),
    ...(report.gaps.length
      ? [
          ``,
          `Asked for, not offered:`,
          ...report.gaps.map((d) => `  ${d.displayName}: ${d.requestCount}`),
        ]
      : []),
    ``,
    `Admin: ${ADMIN_URL}`,
    ``,
    `Traffic is not included yet: GA needs a Google Cloud service account.`,
    `Tracker replies are not counted: they arrive in Gmail, not the database.`,
  ].join('\n');

  await sendViaBrevo({
    apiKey,
    to: REPORT_EMAIL,
    toName: 'Rod',
    subject: `BuddyPept weekly: ${report.signups} ${report.signups === 1 ? 'signup' : 'signups'}, ${window}`,
    html,
    text,
  });
}

// ─── Helpers ───

function requireApiKey(): string {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Brevo is not configured. Set BREVO_API_KEY in the environment.'
    );
  }
  return apiKey;
}

async function sendViaBrevo({
  apiKey,
  to,
  toName,
  subject,
  html,
  text,
}: {
  apiKey: string;
  to: string;
  toName: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'BuddyPept', email: 'hello@buddypept.com' },
      to: [{ email: to, name: toName || undefined }],
      ...(REPLY_TO_EMAIL ? { replyTo: { email: REPLY_TO_EMAIL } } : {}),
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo send failed: ${res.status} ${body}`);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Returns true if the requested item looks like a non-peptide we should
 * auto-reply to (currently testosterone and steroids only).
 */
export function isNonPeptideRequest(requested: string): boolean {
  const lower = requested.toLowerCase();
  return lower.includes('testosterone') || lower.includes('steroid');
}
