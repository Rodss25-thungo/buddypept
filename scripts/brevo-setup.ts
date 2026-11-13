/**
 * One-time, idempotent Brevo setup. Safe to run again.
 *
 *   node --env-file=.env.local scripts/brevo-setup.ts
 *
 * Creates the contact attributes the signup sync writes, the newsletter list
 * (marketing subscribers who ticked the consent box AND confirmed their
 * email), and registers hello@buddypept.com as a sender. The API key is read from the environment
 * and is never printed.
 */

const API = 'https://api.brevo.com/v3';

const ATTRIBUTES: Array<{ name: string; type: string }> = [
  { name: 'LANGUAGE', type: 'text' },
  { name: 'SIGNUP_SOURCE', type: 'text' },
  { name: 'CONFIRMED', type: 'boolean' },
  { name: 'CONFIRMED_AT', type: 'date' },
  { name: 'MARKETING_CONSENT', type: 'text' },
  { name: 'CONSENT_AT', type: 'date' },
  { name: 'CONSENT_SOURCE', type: 'text' },
  { name: 'UTM_SOURCE', type: 'text' },
  { name: 'UTM_CAMPAIGN', type: 'text' },
];

const FOLDER_NAME = 'BuddyPept';
const LIST_NAME = 'BuddyPept Newsletter';

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

  await ensureNewsletterList();

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

async function ensureNewsletterList() {
  const lists = await brevo('/contacts/lists?limit=50');
  if (!lists.ok) throw new Error(`Could not list lists: ${lists.status}`);
  const list = (lists.body.lists as Array<{ id: number; name: string }>).find(
    (l) => l.name === LIST_NAME
  );
  if (list) {
    console.log(`list "${LIST_NAME}": already exists (id ${list.id})`);
    return;
  }
  const folders = await brevo('/contacts/folders?limit=50');
  if (!folders.ok) throw new Error(`Could not list folders: ${folders.status}`);
  let folderId = (folders.body.folders as Array<{ id: number; name: string }>).find(
    (f) => f.name === FOLDER_NAME
  )?.id;
  if (!folderId) {
    const f = await brevo('/contacts/folders', {
      method: 'POST',
      body: JSON.stringify({ name: FOLDER_NAME }),
    });
    if (!f.ok) throw new Error(`Could not create folder: ${f.status} ${JSON.stringify(f.body)}`);
    folderId = f.body.id;
    console.log(`folder "${FOLDER_NAME}": created (id ${folderId})`);
  }
  const created = await brevo('/contacts/lists', {
    method: 'POST',
    body: JSON.stringify({ name: LIST_NAME, folderId }),
  });
  console.log(
    `list "${LIST_NAME}": ${created.ok ? `created (id ${created.body.id})` : `FAILED ${created.status} ${JSON.stringify(created.body)}`}`
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
