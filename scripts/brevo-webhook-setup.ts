/**
 * One-time, idempotent: registers the Brevo marketing webhook that mirrors
 * unsubscribes into Supabase (app/api/brevo-webhook). Safe to run again.
 *
 *   node --env-file=.env.local scripts/brevo-webhook-setup.ts
 *
 * The bearer token is derived from CRON_SECRET exactly as the route derives
 * it, and is never printed.
 */
import { createHmac } from 'node:crypto';

const URL = 'https://www.buddypept.com/api/brevo-webhook';
const H = {
  accept: 'application/json',
  'api-key': process.env.BREVO_API_KEY ?? '',
  'content-type': 'application/json',
};

async function main() {
  if (!process.env.BREVO_API_KEY || !process.env.CRON_SECRET) {
    throw new Error('BREVO_API_KEY and CRON_SECRET must be set.');
  }
  const token = createHmac('sha256', process.env.CRON_SECRET)
    .update('brevo-webhook')
    .digest('hex');

  const list = await fetch('https://api.brevo.com/v3/webhooks?type=marketing', { headers: H });
  const existing = ((await list.json()).webhooks ?? []) as Array<{ id: number; url: string }>;
  const found = existing.find((w) => w.url === URL);
  const body = {
    url: URL,
    description: 'BuddyPept: mirror unsubscribes to Supabase',
    events: ['unsubscribed'],
    type: 'marketing',
    auth: { type: 'bearer', token },
  };
  const res = await fetch(
    `https://api.brevo.com/v3/webhooks${found ? `/${found.id}` : ''}`,
    { method: found ? 'PUT' : 'POST', headers: H, body: JSON.stringify(body) }
  );
  const text = await res.text();
  console.log(`webhook ${found ? `update ${found.id}` : 'create'}: ${res.status} ${text.replace(token, '***')}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
