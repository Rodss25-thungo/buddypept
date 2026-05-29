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
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const OWNER_EMAIL = 'buddypept@gmail.com';
const ADMIN_URL = 'https://buddypept.com/admin';

// ─── Confirmation email (existing) ───

interface SendConfirmationArgs {
  to: string;
  toName: string;
  confirmUrl: string;
}

export async function sendConfirmationEmail({
  to,
  toName,
  confirmUrl,
}: SendConfirmationArgs): Promise<void> {
  const apiKey = requireApiKey();
  const firstName = toName?.trim().split(/\s+/)[0] ?? '';
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';

  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1c1917;">
    <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
      <div style="text-align:left;margin-bottom:24px;">
        <img src="https://buddypept.com/signature-logo" width="32" height="32" alt="BuddyPept" style="vertical-align:middle;border-radius:6px;">
        <span style="margin-left:10px;font-weight:700;font-size:18px;vertical-align:middle;">BuddyPept</span>
      </div>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${greeting}</p>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">
        Tap the button below to confirm and finish joining the BuddyPept community. Takes one click.
      </p>
      <p style="margin:0 0 28px;">
        <a href="${confirmUrl}" style="display:inline-block;background:#0d9488;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;">Confirm my email</a>
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#6b7280;">
        If the button does not work, copy and paste this link into your browser:<br>
        <a href="${confirmUrl}" style="color:#0d9488;word-break:break-all;">${confirmUrl}</a>
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#6b7280;">
        If this was not you, just ignore this message. You will not be added.
      </p>
      <hr style="border:0;border-top:1px solid #e5e7eb;margin:28px 0 16px;">
      <p style="margin:0;font-size:14px;color:#6b7280;">
        The BuddyPept team<br>
        <a href="https://buddypept.com" style="color:#0d9488;text-decoration:none;">buddypept.com</a>
      </p>
    </div>
  </body>
</html>`.trim();

  const text =
    `${greeting}\n\nTap the link below to confirm and finish joining the BuddyPept community. Takes one click.\n\n${confirmUrl}\n\nIf this was not you, just ignore this message. You will not be added.\n\nThe BuddyPept team\nbuddypept.com`;

  await sendViaBrevo({
    apiKey,
    to,
    toName,
    subject: "Confirm you're joining BuddyPept",
    html,
    text,
  });
}

// ─── Non-peptide auto-reply (testosterone/steroids) ───

interface SendNonPeptideReplyArgs {
  to: string;
  toName: string;
  requested: string;
}

export async function sendNonPeptideAutoReply({
  to,
  toName,
  requested,
}: SendNonPeptideReplyArgs): Promise<void> {
  const apiKey = requireApiKey();
  const firstName = toName?.trim().split(/\s+/)[0] ?? '';
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';
  const safeRequested = escapeHtml(requested);

  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1c1917;">
    <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
      <div style="text-align:left;margin-bottom:24px;">
        <img src="https://buddypept.com/signature-logo" width="32" height="32" alt="BuddyPept" style="vertical-align:middle;border-radius:6px;">
        <span style="margin-left:10px;font-weight:700;font-size:18px;vertical-align:middle;">BuddyPept</span>
      </div>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${greeting}</p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
        Thanks for reaching out about <strong>${safeRequested}</strong>!
      </p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
        BuddyPept focuses only on peptides (compounds like BPC-157, semaglutide, and similar). Steroids and steroid hormones like testosterone are outside what we cover, so this isn&rsquo;t one we&rsquo;ll be adding.
      </p>
      <p style="margin:0 0 28px;font-size:16px;line-height:1.6;">
        If you&rsquo;d like to explore peptides instead, our library is open and waiting:
      </p>
      <p style="margin:0 0 28px;">
        <a href="https://buddypept.com/learn" style="display:inline-block;background:#0d9488;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;">Browse the peptide library</a>
      </p>
      <hr style="border:0;border-top:1px solid #e5e7eb;margin:28px 0 16px;">
      <p style="margin:0;font-size:14px;color:#6b7280;">
        The BuddyPept team<br>
        <a href="https://buddypept.com" style="color:#0d9488;text-decoration:none;">buddypept.com</a>
      </p>
    </div>
  </body>
</html>`.trim();

  const text =
    `${greeting}\n\nThanks for reaching out about ${requested}!\n\nBuddyPept focuses only on peptides (compounds like BPC-157, semaglutide, and similar). Steroids and steroid hormones like testosterone are outside what we cover, so this isn't one we'll be adding.\n\nIf you'd like to explore peptides instead, our library is open and waiting:\nhttps://buddypept.com/learn\n\nThe BuddyPept team\nbuddypept.com`;

  await sendViaBrevo({
    apiKey,
    to,
    toName,
    subject: 'About your BuddyPept request',
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
