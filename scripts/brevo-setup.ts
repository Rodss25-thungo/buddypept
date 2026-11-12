/**
 * One-time, idempotent Brevo setup. Safe to run again.
 *
 *   node --env-file=.env.local scripts/brevo-setup.ts
 *
 * Creates the contact attributes the signup sync writes, and registers
 * hello@buddypept.com as a sender. The API key is read from the environment
 * and is never printed.
 */

const API = 'https://api.brevo.com/v3';

const ATTRIBUTES: Array<{ name: string; type: string }> = [
  { name: 'LANGUAGE', type: 'text' },
  { name: 'SIGNUP_SOURCE', type: 'text' },
  { name: 'CONFIRMED', type: 'boolean' },
  { name: 'CONFIRMED_AT', type: 'date' },
  { name: 'MARKETING_CONSENT', type: 'text' },
];

const SENDER = { name: 'BuddyPept', email: 'hello@buddypept.com' };

async function brevo(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY ?? '',
      'content-type': 'application/json',
    },
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text ? JSON.parse(text) : null };
}

async function main() {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not set.');
  }

  const attrs = await brevo('/contacts/attributes');
  if (!attrs.ok) throw new Error(`Could not list attributes: ${attrs.status}`);
  const existing = new Set<string>(
    (attrs.body.attributes as Array<{ name: string }>).map((a) => a.name)
  );

  for (const { name, type } of ATTRIBUTES) {
    if (existing.has(name)) {
      console.log(`attribute ${name}: already exists`);
      continue;
    }
    const res = await brevo(`/contacts/attributes/normal/${name}`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
    console.log(`attribute ${name}: ${res.ok ? 'created' : `FAILED ${res.status} ${JSON.stringify(res.body)}`}`);
  }

  const senders = await brevo('/senders');
  if (!senders.ok) throw new Error(`Could not list senders: ${senders.status}`);
  const found = (senders.body.senders as Array<{ email: string; active: boolean }>).find(
    (s) => s.email.toLowerCase() === SENDER.email
  );
  if (found) {
    console.log(`sender ${SENDER.email}: already exists (active=${found.active})`);
    return;
  }
  const created = await brevo('/senders', {
    method: 'POST',
    body: JSON.stringify(SENDER),
  });
  console.log(
    `sender ${SENDER.email}: ${created.ok ? `created ${JSON.stringify(created.body)}` : `FAILED ${created.status} ${JSON.stringify(created.body)}`}`
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
