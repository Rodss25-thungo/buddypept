# BuddyPept

## Read this first

**The full project context lives in [`docs/PROJECT-BRIEF.md`](docs/PROJECT-BRIEF.md).**
Read it at the start of every session. It is the single source of truth for
environments, brand, stack, i18n, data, email, copy rules, and open items.

This file holds only what the brief does not: how to work in this repo, and the
standing defaults. When this file and the brief disagree, **the brief wins**,
and the disagreement is a bug worth fixing on the spot.

---

## Environments

| Purpose | Path |
|---|---|
| Code, git, Supabase, Vercel | `C:\Users\rodss\code\buddypept` |
| Strategy, brand, marketing, copy sheet | `C:\Users\rodss\Google Drive\05. MARKETING CONSULTING\Client Work\BuddyPept` |
| Brand assets, logos | `C:\Users\rodss\Google Drive\BUSINESSES\BuddyPept` |
| Scratch work | the session scratchpad, never `/tmp`, never the repo |

State both the code path and the Drive path before the first tool call, and
again in the session wrap-up. Marketing deliverables go to Drive, not the repo.

---

## How Rod works

- **One change at a time.** He describes what he sees on screen, not the file.
  Locate the code yourself; do not ask which file.
- Each change ships end to end before the next: typecheck, build, commit, push
  to `main`, confirm live.
- To confirm a client-side change is live, grep the deployed
  `_next/static/chunks/*.js` for a string the change introduced. The wizard
  renders client-side, so the string will not appear in the page HTML.
- Treat an example Rod gives as an illustration of the problem, not a spec for
  the fix. Ask what the real distribution looks like before generalizing.
- Do not "fix" what he flagged and deliberately deferred. Ask first.
- Compliance Review Mode is OFF by default. No unsolicited legal, regulatory,
  or disclaimer commentary unless he asks.

---

## Standing defaults

These are Rod's current intent, written down so a new session does not silently
reverse a decision he made deliberately. **They are defaults, not locks.** Rod
can override any of them at any time, without justifying it and without
argument. Nothing here should ever block development, a change of direction, or
a new project.

1. **Free forever.** No paywall on the calculator or the education content.
   "The math stays free, forever" is the brand stake.
2. **Name and email only.** No height, weight, age, gender, or health
   conditions. Signup locale is stored, which is app configuration, not
   personal data.
3. **Analytics stay light and disclosed.** Vercel Analytics plus Google
   Analytics are live and intentional. The bar is no covert behavioral
   tracking, no data brokering, and nothing that would surprise a reader.
4. **Editorial and commercial stay structurally separate.** If a `/shop` route
   ever ships, it does not share code with the calculator.
5. **BuddyPept never gives medical advice in its own voice.** It does not tell
   anyone what to take, how much, or whether to start or stop. It always points
   back to a healthcare professional.
   **Citing is not advising.** Quoting, summarizing, or linking published
   medical literature and named expert sources is fine and encouraged, so long
   as the source is attributed and BuddyPept is not the one making the
   recommendation.
6. **Voice: calm, kind, precise.** Not clinical-pharma, not bro-science.
7. **Never link to a supplier.** The manufacturer research files in Drive are
   research inputs. The app does not send anyone to a seller.

The seven copy rules and the calculator precision rule are in the brief,
sections 9 and 10. Both still apply.

---

## Code conventions

- TypeScript everywhere, strict mode. No `.js` files.
- Functional components only. Server Components by default; `"use client"` only
  for real interactivity or browser APIs.
- kebab-case filenames, PascalCase component names.
- Tailwind v4 for styling. No CSS Modules, no styled-components, no shadcn.
- All reader-facing strings live in `messages/*.json`. Nothing hardcoded in JSX.
- Supabase access is server-side only. The service-role key never reaches the
  client.
- Zod at API boundaries.
- No premature abstractions. Inline first, abstract at three uses.

---

## Running locally

```bash
npm install
cp .env.local.example .env.local   # fill in the real values
npm run dev
```

Scripts: `npm run dev | build | start | lint | typecheck`.
Push to `main` and Vercel deploys automatically, in well under a minute.
