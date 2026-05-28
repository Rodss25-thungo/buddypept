/**
 * Brevo transactional email sender (server-side only).
 *
 * Used to send the double opt-in confirmation email. Authenticated with
 * BREVO_API_KEY (Brevo dashboard -> SMTP & API -> API keys). The sender domain
 * buddypept.com is already verified in Brevo, so messages send from
 * hello@buddypept.com with proper DKIM signatures.
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

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
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Brevo is not configured. Set BREVO_API_KEY in the environment.'
    );
  }

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
      subject: "Confirm you're joining BuddyPept",
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo send failed: ${res.status} ${body}`);
  }
}
