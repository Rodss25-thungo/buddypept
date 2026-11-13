# BuddyPept: full project brief

Paste-ready context for a fresh Claude Code session started from a terminal
(no VS Code). Current as of 2026-08-29, commit `815b928`.

---

## 1. Environments (state these before the first tool call)

| Purpose | Path |
|---|---|
| Code, git, Supabase, Vercel, anything that ships | `C:\Users\rodss\code\buddypept` |
| Strategy, brand, marketing docs, copy sheet | `C:\Users\rodss\Google Drive\05. MARKETING CONSULTING\Client Work\BuddyPept` |
| Additional strategy folder | `C:\Users\rodss\Google Drive\BUSINESSES\BuddyPept` |
| Claude memories for this project | `C:\Users\rodss\.claude\projects\c--Users-rodss-code-buddypept\memory\` |
| Scratch/temp work | session scratchpad, never `/tmp`, never the repo |

Never work code from a Drive-folder window: MCP tools do not load there.

Start a session with:

```
cd C:\Users\rodss\code\buddypept
claude
```

### Key files in the Drive folder

- `BuddyPept_CopyFinalized_EN_ES_PT.xlsx` — the authoritative copy sheet.
  Sheet `copy`, columns `key | english | spanish | portuguese`, 416 keys.
  Keys map 1:1 onto flattened `messages/{en,es,pt}.json` paths
  (arrays flatten as `legal.terms.sections.0.title`).
- `Peptides Names.xlsx`, `Peptide_Protocols_Study.xlsx`,
  `peptide_manufacturers_direct.pdf/.docx`, `peptide_manufacturers_wholesale.xlsx`,
  `oath_research_products.csv`, `RESEARCH.md` — research inputs.
  Manufacturer lists are for research only; the app never links a seller.

---

## 2. What BuddyPept is

A free, mobile-first PWA that turns a peptide dose into the exact amount to
measure on a syringe. Reconstitution math (mg vial + mL bacteriostatic water →
concentration → mL → syringe units), plus a plain-language peptide library.

- **Audience:** the confused beginner, the first time someone holds a vial.
  Cuts across GLP-1, recovery, biohacking, aesthetics. English, Spanish, and
  Portuguese speakers **in the United States**, not other markets. **Exception
  (Rod, 2026-10-06):** the Instagram account `@buddypept_br` targets Brazil.
- **Mission:** turn peptide-curious into peptide-confident, free forever.
- **Stake:** the math stays free, forever.
- **Trueline:** the math doesn't lie.
- **Zag:** everyone else in peptides is selling; we give.
- **Voice:** calm, kind, precise. Anti-hype, anti-bro-science, anti-disclaimer-fest.
- **Money:** never a paywall. Future affiliate supplies and brand partnerships,
  kept structurally separate from the calculator.
- **Founder:** Rod Galvez, solo, marketing background, non-technical, builds
  with AI assistance.

### Standing defaults

Rod's current intent, written down so a new session does not silently reverse a
decision he made deliberately. **Defaults, not locks.** He can override any of
them at any time, without justifying it and without argument. Nothing here
should block development, a change of direction, or a new project.

1. Free forever. No paywall on the calculator or the education content.
2. Name and email only. No height, weight, age, gender, or conditions. Signup
   locale is stored, which is app configuration, not personal data.
3. Analytics stay light and disclosed. Vercel Analytics and Google Analytics are
   both live and intentional. The bar is no covert behavioral tracking, no data
   brokering, nothing that would surprise a reader.
4. Editorial and commercial stay structurally separate. A future `/shop` shares
   no code with the calculator.
5. **BuddyPept never gives medical advice in its own voice.** It does not tell
   anyone what to take, how much, or whether to start or stop, and it always
   points back to a healthcare professional.
   **Citing is not advising.** Quoting, summarizing, or linking published
   medical literature and named expert sources is fine and encouraged, as long
   as the source is attributed and BuddyPept is not the one recommending.
6. Voice: calm, kind, precise. Not clinical-pharma, not bro-science.
7. Never link to a supplier. The manufacturer files in Drive are research
   inputs; the app does not send anyone to a seller.

---

## 3. Stack and hosting

- Next.js 16.2.6, App Router, React 19.2.4, TypeScript strict
- Tailwind CSS v4
- next-intl 4 for i18n
- Supabase (`@supabase/supabase-js`) for Postgres
- Brevo for transactional email, the newsletter list (id 6) and the welcome automation
- Vercel hosting, auto-deploy on push to `main`, plus two crons
- Vercel Analytics (pageviews, referrers; Hobby plan keeps 31 days) + GA4 (`NEXT_PUBLIC_GA_ID`, also the conversion-event store; see section 15)
- Zod v4 at API boundaries
- Husky + lint-staged pre-commit running `eslint --fix`

Scripts: `npm run dev | build | start | lint | typecheck`

**Repo:** https://github.com/Rodss25-thungo/buddypept, branch `main`.
**Production:** `www.buddypept.com`; apex `buddypept.com` 307-redirects there.
Deploys take well under a minute.

---

## 4. Directory map (tracked files)

```
app/
  [locale]/                      public site, locale-aware
    page.tsx                     landing
    calculator/page.tsx
    calculator/calculator-wizard.tsx      the wizard (client component)
    calculator/request-peptide-form.tsx   "my peptide isn't listed"
    learn/page.tsx                        library index
    learn/[slug]/page.tsx                 education pages
    confirm/page.tsx + unlock-library.tsx double opt-in
    disclaimer|privacy|terms/page.tsx
    layout.tsx
  admin/                         private, Basic Auth, English only, unprefixed
  api/
    learn-signup/route.ts        email capture
    request-peptide/route.ts     peptide requests
    notify-peptide-live/route.ts manual "it's live" send
    cron/notify-live/route.ts    daily 14:00 UTC cron, CRON_SECRET auth
    cron/weekly-report/route.ts  Sunday 22:00 UTC, guards on day itself
  manifest.ts, icon.svg, apple-icon.tsx, favicon.ico, fonts.ts, globals.css
  signature-logo/route.tsx       generated email-signature logo
components/    buddy, logo, site-header, site-footer, language-switcher,
               learn-gate, learn-popup, community-cta, legal-page, prose,
               syringe-diagram
data/          peptides.ts, calculator-peptides.ts, peptide-education.ts,
               peptide-vocabulary.ts, Peptide_Nomenclature.xlsx
lib/           calculator.ts (the math), email.ts, notify-peptide-live.ts,
               peptide-matching.ts, format.ts, supabase.ts, api-messages.ts,
               weekly-report.ts
i18n/          routing.ts, request.ts, navigation.ts
messages/      en.json, es.json, pt.json  (all user-facing copy)
supabase/      setup.sql + 4 migration files
docs/adr/      001-pwa-not-native.md
.claude/       settings.json (committed), rules/calculator-precision.md
CLAUDE.md      thin pointer to this brief, plus workflow notes and defaults
social-media/  brand book, campaign cards, Instagram post, TikTok source
index.html     PRIOR ART, the v0 single-file calculator, reference only
```

---

## 5. i18n

- Locales: `en` (default, bare paths), `pt` (`/pt/...`), `es` (`/es/...`).
- `localePrefix: 'as-needed'`, `localeDetection: false`. No auto-redirect by
  browser language; the switcher sets the `NEXT_LOCALE` cookie.
- `<html lang>` / hreflang tags: `en-US`, `pt-BR`, `es-419`.
- `draftLocales` in `i18n/routing.ts` is now **empty**: pt and es are both live.
  Adding a locale back to that list hides it from the switcher, sitemap, and hreflang.
- Legal pages stay US-framed in every language: one jurisdiction, one FDA,
  one emergency number. They are per-market reviewed, not translated.
- **All reader-facing strings live in `messages/*.json`.** Nothing hardcoded in JSX.
- The Drive copy sheet is the source of truth. To re-sync, flatten each JSON
  (arrays included) and compare key-for-key against the `copy` sheet.
  Last sync 2026-08-29: en and es matched exactly; pt had 5 differences, all
  "aspirar" → "medir / puxar na seringa / Medida" (commit `44331bb`).

---

## 6. Data and database

Supabase project ref `fbvvqjyqtihkqhhasvxq`.

Tables:
- `peptide_requests` — signups and peptide requests. Columns added over time by
  `add-confirmation-columns.sql` (double opt-in), `add-fulfillment-columns.sql`,
  `add-locale-column.sql` (the language someone signed up in).
- `notification_sends` — one row per "your peptide is live" send, so nobody is
  emailed twice.
- `peptide_demand` — view/aggregate powering the admin demand count
  (`fix-demand-count-people.sql` counts people, not rows).

RLS is enabled on both tables. Server-side access only, via
`SUPABASE_SERVICE_ROLE_KEY`. The service-role key never reaches the client.

Migrations are run by hand in the Supabase SQL Editor. Never deploy code that
reads a column before its SQL file has been run.

### Peptide library

16 peptides in `data/peptides.ts`: semaglutide, tirzepatide, retatrutide,
bpc-157, tb-500, ghk-cu, ipamorelin, cjc-1295-dac, cjc-1295-no-dac, sermorelin,
nad-plus, ss-31, mots-c, pt-141, hgh, hcg.
15 have education pages (`LEARN_SLUGS`); `pt-141` does not.

**Adding a peptide requires three lists, or it is unreachable:**
1. `data/peptides.ts` entry matching the `Peptide` interface.
2. The slug in the calculator's peptide list (`CALCULATOR_SLUGS` in
   `data/calculator-peptides.ts`, consumed as `WIZARD_PEPTIDE_SLUGS`).
3. `LEARN_SLUGS` in `data/peptide-education.ts`, plus a
   `peptideEducation.<slug>` block in `messages/en.json` with
   whatItIs / studiedFor / howSold / bottomLine (other locales fall back to en).

Then verify the arithmetic against `lib/calculator.ts` with a real example.

`commonVialSizes` must be researched, never generated as a tidy ladder:
strengths actually stocked by several independent sellers, roughly six buttons
max, sourcing noted in a comment, and always a way to type a value by hand.

---

## 7. Environment variables

Read by the app (`process.env`):

```
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
BREVO_API_KEY
REPLY_TO_EMAIL=buddypept@gmail.com
CRON_SECRET
ADMIN_PASSWORD
NEXT_PUBLIC_GA_ID
```

Set in `.env.local` (gitignored) and in Vercel Production. `CRON_SECRET` values
are locked in the Vercel UI; the copy in `.env.local` is the only readable one,
so rotating means changing both places.

**Supabase MCP token is separate.** `.mcp.json` expands
`${SUPABASE_ACCESS_TOKEN}` from the Claude Code process environment. Claude Code
does not read `.env.local`. The token lives in `.claude/settings.local.json`
under an `env` block (gitignored), and changing it requires a Claude Code
restart. If Supabase MCP returns "Unauthorized", check that file first.
The MCP server runs `--read-only`; drop that flag only for a deliberate write.

---

## 8. Email

- Sends from `hello@buddypept.com` via Brevo, domain verified with DKIM.
  It forwards to `buddypept@gmail.com`.
- `buddypept@gmail.com` is the inbox Rod actually reads. Owner notifications on
  every signup land there, as do Brevo alerts, as do replies (`REPLY_TO_EMAIL`).
- `rodss25@gmail.com` is Rod's personal address: previews and test copies only,
  never anything user-facing. **One deliberate exception:** the weekly
  performance report goes here, by Rod's request on 2026-08-29. It is internal
  and never reaches a reader.
- The "your peptide is live" email sends from the daily cron, days after signup,
  so it reads the language off the signup row rather than inferring it.
- It closes with a personal-tracker teaser. That is deliberate: the replies are
  the demand measurement. **Threshold is 30 people asking** before the tracker
  gets built. Not a shipping commitment, and it never gets a date attached.

---

## 9. Copy rules

1. **No em dashes** in any user-facing copy. Commas, colons, or separate
   sentences. Normal hyphens in compound words are fine.
2. **Never imply the reader is dosing themselves.** The compound is the subject.
   "Whatever your research calls for," not "decisions about what to take."
3. **Treat readers as researchers and peers.** Their requests steer the roadmap.
4. **Dry humor, not jokey**, landed on precision: "it says 12.5 units, not
   'about 12'."
5. **No time references.** "A while back you asked" gets cut.
6. The healthcare-professional disclaimer is required but folded into a
   sentence, never stacked as a block, and never worded to presume self-use.
7. Never recommend a dose. `typicalDose` is a prefill so a newcomer can watch
   the math work, not guidance. Thin evidence is never a reason to withhold a
   peptide; state plainly what the research shows and ship it.

---

## 10. Calculator precision rule (`.claude/rules/calculator-precision.md`)

The math is the brand. Any change to `lib/calculator.ts` gets verified by hand
against these before commit:

- Semaglutide: 5 mg + 2 mL → 2.5 mg/mL. 0.25 mg → 0.1 mL → **10 units** U-100.
- BPC-157: 10 mg + 5 mL → 2 mg/mL (2000 mcg/mL). 250 mcg → 0.125 mL → **12.5 units**.
- Tirzepatide: 10 mg + 2 mL → 5 mg/mL. 2.5 mg → 0.5 mL → **50 units**.

Also: pure functions only; distinct types per unit (mg / mL / mcg / IU / units);
a test case for every new branch; never round silently; refuse impossible inputs
(0 mL water, negatives) with a clear error; no medical claims in output strings.

---

## 11. How Rod works (follow this cadence)

- **One UI change at a time.** He describes what he sees on screen, not the file.
  Locate the code yourself; do not ask which file.
- Each change ships end to end before the next: typecheck, build, commit,
  push to `main`, confirm live.
- To confirm a client-side change is live, grep the deployed
  `_next/static/chunks/*.js` for a string the change introduced. The wizard
  renders client-side, so the string will not be in the page HTML.
- Treat an example Rod gives as an illustration of the problem, not a spec for
  the fix. Ask what the real distribution looks like before generalizing.
- Do not "fix" things he flagged and deliberately deferred; ask first.
- Restate both environments (code path and Drive path) in every session wrap-up.
- Confirm before destructive, irreversible, or scope-expanding actions. Ordinary
  read-only inspection needs no confirmation.
- Compliance Review Mode is OFF by default: no unsolicited legal, regulatory,
  or disclaimer commentary unless he asks for it.

---

## 12. Deferred, do not build

- Saved calculation history (needs accounts beyond email capture)
- Personal tracker (gated on 30 reply requests)
- ~~Newsletter platform integration~~ Superseded 2026-11-12: Rod's Phase 1 authorization moved newsletter preparation into scope (section 15). Live marketing sends still need his approval.
- `/shop` affiliate route
- App Store distribution (Capacitor wrap)
- Separate SEO content site at buddypept.com

---

## 13. Open items

1. **Vial input placeholder is generic.** Step 3 reads "e.g. 5" for every mg
   peptide (`isIU ? 'e.g. 5000' : 'e.g. 5'` in `calculator-wizard.tsx`). On
   MOTS-c that points at the least common of its four sizes. Fix would use the
   peptide's most common `commonVialSizes` entry. Deferred, needs Rod's call.
2. **Four-field adjust grid on narrow phones.** The results screen's "adjust
   without going back" panel is a 2x2 grid, never eyeballed at 375px. May need
   to stack at the smallest breakpoint. Deferred, needs Rod's call.
3. `index.html` prior art still sits at the repo root; it goes when the new
   calculator is considered final.
4. `pt-141` has a library entry but no `/learn` page.
5. Weekly performance report: the Supabase half ships Sunday 22:00 UTC to
   `rodss25@gmail.com`. Traffic numbers are still missing and need a Google
   Cloud service account for the GA Data API before they can be added.
6. `README.md` (2026-08-06) has not been checked for the same drift that
   CLAUDE.md had.

---

## 14. Recent history

```
44331bb  Apply updated Portuguese wording from the finalized copy sheet
eee4919  Merge copy-and-request-flow
67f2e64  Render multi-paragraph body copy as real paragraphs
c183568  Apply finalized es/pt copy and honor its paragraph breaks
f3ecb08  Peptide name recognition, request flow, and copy rewrite
d319b24  Send email in the language the person signed up in
dd19caa  Move the rest of the reader-facing copy into the catalogs
76e5e29  Set up the app to speak more than one language
0588290  Let the results screen adjust the mix, not just the dose
575efd6  Research real vial sizes for every peptide
```

The `add-locale-column.sql` migration has been run; `d319b24` and everything
after it is pushed and live. Working tree is clean.

---

## 15. Growth infrastructure (Phase 1, 2026-11-12)

Authorized by Rod on 2026-11-12 (Megamind register entry "BuddyPept: Phase 1").

### Baseline before Phase 1 (verified 2026-11-12)

75 unique visitors and 162 pageviews in 31 days (Vercel). Referrers: 64 none,
8 l.instagram.com, 3 facebook. Zero from Google, Bing or TikTok. 42 signup rows,
25 confirmed. Brevo: 2 contacts, no templates, no marketing list.
sitemap.xml and robots.txt returned 404; hreflang links were relative and every
page pointed them at the home page; no canonical tags; no conversion events.

### SEO

- `app/sitemap.ts` lists every indexable page in every live locale (78 URLs)
  with hreflang siblings. `app/robots.ts` blocks `/admin` and `/api/` only.
- `lib/seo.ts`: `SITE_URL` (www), `INDEXABLE_PATHS`, `pageAlternates()`. Each
  page's `generateMetadata` sets an absolute canonical plus en-US, pt-BR,
  es-419 and x-default. `metadataBase` is set in the locale layout.
- A new public page must be added to `INDEXABLE_PATHS` and call
  `pageAlternates()`. `/confirm` and `/admin` stay noindex.

### Conversion events (GA4 only)

Vercel custom events need a paid plan, so GA4 is the event store. `lib/analytics.ts`
`track()`; nothing personal is sent (no names, emails, typed peptide names or doses).

| Event | When | Params |
|---|---|---|
| `calculator_start` | leaves the peptide step | `peptide` (curated slug, `other`, `not_listed`) |
| `calculator_complete` | presses Calculate | `peptide`, `has_result` |
| `calculator_restart` | starts over | `peptide` |
| `peptide_request_open` | picks "not listed" | |
| `popup_shown` | learn pop-up opens | |
| `sign_up_start` | first focus in a signup form | `form` |
| `sign_up` | signup accepted | `method`, `form`, `marketing_consent` |
| `sign_up_error` | signup rejected | `form` |
| `email_confirmed` | first confirmation only | |
| `cta_click` | any element with `data-track` | `cta`, `page_path` |

`form` values: `homepage`, `popup`, `library`, `peptide_request`. To measure a new
link, add `data-track="<name>"`; no client component needed.
Mark `sign_up` and `email_confirmed` as key events in the GA4 admin.

### UTM convention

All lowercase, words joined with underscores. Every link we place gets UTMs.

| Placement | utm_source | utm_medium | utm_campaign | utm_content |
|---|---|---|---|---|
| Instagram bio link | `instagram` | `social` | `bio_en` / `bio_es` / `bio_br` | |
| Instagram story link | `instagram` | `social` | series or post id | `story` |
| TikTok bio link | `tiktok` | `social` | `bio_en` | |
| Facebook post | `facebook` | `social` | post id | |
| Brevo emails | `brevo` | `email` | `welcome` or newsletter id | link position |
| Future paid | platform | `paid_social` | campaign name | ad id |

Example: `https://www.buddypept.com/?utm_source=instagram&utm_medium=social&utm_campaign=bio_en`.
First touch (UTMs, else referrer host, plus landing path) is kept in the
browser's localStorage (`bp_first_touch`) and saved on the signup row, so
subscribers can be counted by the post that brought them.

### Marketing consent

- Separate, unchecked box on all four signup forms (`components/marketing-consent.tsx`,
  copy key `consent.label`). Nothing depends on it.
- Evidence on `peptide_requests`: `marketing_consent`, `_at`, `_source`, `_text`
  (exact wording shown, with locale), `_version` (`CONSENT_VERSION` in
  `lib/consent.ts`; bump it when the wording changes). Migration
  `supabase/add-marketing-consent-columns.sql`, run 2026-11-12.
- Consent is only ever added by a form. Withdrawal is Brevo's unsubscribe link,
  mirrored back by `/api/brevo-webhook` into `marketing_unsubscribed_at`.
- The 42 rows from before Phase 1 have `marketing_consent = false`. They are not
  subscribers and are never added to the list without evidence.

### Brevo

- List **BuddyPept Newsletter (id 6)**, folder BuddyPept. A contact joins only
  when consent is given AND the email is confirmed (`lib/brevo-contacts.ts`).
- Attributes: LANGUAGE, SIGNUP_SOURCE, CONFIRMED, CONFIRMED_AT,
  MARKETING_CONSENT, CONSENT_AT, CONSENT_SOURCE, UTM_SOURCE, UTM_CAMPAIGN.
  `scripts/brevo-setup.ts` recreates attributes, folder, list and sender.
- Templates: 1 to 3 welcome EN/ES/PT (reference), 5 combined welcome that
  switches on LANGUAGE (used by the automation). All inactive. Sender
  hello@buddypept.com, reply-to buddypept@gmail.com, links tagged
  `utm_source=brevo&utm_medium=email&utm_campaign=welcome`.
- Automation **"Welcome message" (id 1)**: contact added to list 6, wait 5
  minutes, send template 5. Re-entry off (one welcome per contact). INACTIVE.
- Webhook 2677380 (marketing, `unsubscribed`) to `/api/brevo-webhook`, bearer
  token = HMAC-SHA256 of "brevo-webhook" keyed with CRON_SECRET
  (`scripts/brevo-webhook-setup.ts`). Rotating CRON_SECRET means re-running it.
- Free plan: 300 emails/day.

### Reporting

- Traffic and referrers: Vercel Web Analytics (31-day window on Hobby).
- Events and funnels: GA4.
- Delivery, opens, clicks, unsubscribes: Brevo (transactional and automation logs).
- Signups, confirmations, consent, first-touch source: `peptide_requests`.

### Waiting on Rod

1. Approve the consent wording (EN/ES/PT), then merge branch `consent-ui` to
   ship the checkbox.
2. Approve the welcome email content, eligibility (list 6 only) and send setup,
   then activate template 5 and automation 1.
3. Footer postal line: drafts show "Murray, UT, United States"; decide whether a
   full postal address or PO box goes there.
4. The library gate's privacy line says emails share "occasional updates";
   decide whether to reword it now that updates are opt-in.
