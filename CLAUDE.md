# BuddyPept

## Project context for Claude Code

This file is read by Claude Code every session. Read it first before suggesting any change to BuddyPept.

**See also `AGENTS.md`** — same project context formatted as the universal AI agent context file (works for any AI tool: Cursor, Codex, Cody, etc.). CLAUDE.md is the Claude-specific layer with Claude Code workflow notes; AGENTS.md is the universal layer with the same brand spine and hard rules. Both files MUST stay aligned on locked decisions.

---

## What BuddyPept is

BuddyPept is a free mobile-first Progressive Web App (PWA) that helps peptide newcomers calculate dosing math (mg → IU → mL → units), reconstitute peptides correctly (bacteriostatic water + mg peptide → correct concentration), and understand what they're putting in their body.

**Audience:** "The confused beginner" — anyone entering the peptide world unsure how to dose. Cuts across GLP-1 patients (semaglutide, tirzepatide), recovery users (BPC-157, TB-500), biohackers, and aesthetic users. Focused by *moment* (the first time someone receives a vial), not by demographic.

**Business model:** Free for users forever. Email + name capture at entry. Downstream monetization via affiliate links to supplies (syringes, needles) and eventual brand partnerships — never via paywall, never via data harvest.

---

## Brand spine — DO NOT VIOLATE THESE

- **Mission:** "Turn peptide-curious into peptide-confident — for free, forever."
- **Stake in the ground:** "The math stays free. Forever."
- **Zag:** "Everyone else in peptides is selling. We give."
- **Trueline:** "The math doesn't lie."
- **Voice:** Calm, kind, precise. Anti-hype. Anti-bro-science. Anti-disclaimer-fest. Treats users as smart adults.
- **Character:** Illustrated character named "Buddy" — calm, science-teacher friend, Khan Academy / Headspace warmth.

### Hard rules that override any other suggestion

1. **Never paywall the calculator or education content.** The math is free forever. Structural, not negotiable.
2. **Never collect user data beyond name + email.** No height, weight, age, gender, health conditions. Brand differentiator.
3. **Never add third-party tracking pixels** (Facebook Pixel, third-party GTM, etc.). Privacy-first matches the brand.
4. **Never mix calculator code with commerce code.** Editorial-commercial separation is structural. Any future `/shop` route stays isolated.
5. **Never give medical advice.** Always include "consult a healthcare professional" disclaimers in dosing/education content.
6. **Never write copy in clinical pharma voice or bro-science voice.** Calm. Kind. Precise.

---

## Tech stack

- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui (components from shadcn registry)
- **Backend:** Next.js API Routes (serverless functions on Vercel)
- **Database:** Supabase (Postgres + Auth + Storage)
- **Email:** Resend (transactional + future newsletter)
- **Hosting:** Vercel (Hobby/free tier)
- **Analytics:** Vercel Analytics (privacy-first, cookie-free)
- **Error tracking:** Sentry (free tier)
- **Primary domain:** buddypept.app (when registered), buddypept.com (when registered)
- **Defensive redirect holds (already owned):** peptbuddy.com, peptbuddy.app — these redirect to the primary domains and block copycats

---

## Directory structure

```
buddypept/
├── CLAUDE.md                    # This file — read every session
├── README.md                    # Human-readable docs
├── .env.local                   # SECRETS (gitignored, copy from .env.local.example)
├── .env.local.example           # Template for env vars
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── .gitignore
├── index.html                   # PRIOR ART — pre-Brand-Squad calculator (reference only)
│
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   ├── onboarding/page.tsx      # Email + name capture flow
│   ├── calculator/page.tsx      # The math tool
│   ├── peptides/
│   │   ├── page.tsx             # Library index
│   │   └── [slug]/page.tsx      # Individual peptide pages
│   ├── about/page.tsx
│   ├── mission/page.tsx
│   ├── privacy/page.tsx
│   ├── disclaimer/page.tsx
│   └── api/
│       └── capture/route.ts     # Email capture endpoint
│
├── components/                  # Reusable React components
│   ├── ui/                      # shadcn primitives
│   └── brand/                   # Buddy character, logo
│
├── lib/                         # Utilities (testable pure logic)
│   ├── supabase.ts              # Supabase client setup
│   ├── resend.ts                # Email client setup
│   └── calculator.ts            # Math logic (pure functions, well-tested)
│
├── data/                        # Static data
│   └── peptides.ts              # Pre-loaded peptide library
│
├── content/                     # Markdown content
│   └── peptides/                # one .md per peptide
│
├── public/                      # Static assets
│   ├── manifest.json            # PWA manifest
│   ├── icons/                   # PWA icons (192px, 512px)
│   └── images/                  # Brand images
│
└── docs/
    └── adr/                     # Architecture Decision Records
        └── 001-pwa-not-native.md
```

---

## Code conventions

- **TypeScript everywhere.** No `.js` files. Strict mode enabled.
- **Functional components only.** No class components.
- **Server Components by default.** Use `"use client"` only when truly needed (interactivity, browser APIs).
- **File naming:** kebab-case for files (`peptide-card.tsx`), PascalCase for component names (`PeptideCard`).
- **Tailwind for styling.** shadcn/ui for primitives. No CSS Modules, no styled-components.
- **Database access:** via Supabase server client in Server Components / API routes only. Never expose service-role key to client.
- **Environment variables:** all secrets in `.env.local` (gitignored). Public env vars prefixed `NEXT_PUBLIC_`.
- **Type safety:** Zod for runtime validation at API boundaries.
- **No premature abstractions.** Don't build a custom hook for something used once. Inline first; abstract at 3+ uses.
- **`.claude/` directory:** Workspace metadata for Claude Code — must be gitignored.

---

## Common tasks

### Adding a new peptide

1. Add entry to `data/peptides.ts`:
   ```ts
   {
     slug: 'bpc-157',
     name: 'BPC-157',
     commonMgPerVial: [5, 10],
     typicalDoseMcg: 250,
     unit: 'mcg',
     shortDescription: 'A peptide studied for tissue repair and recovery.',
   }
   ```
2. Create `content/peptides/bpc-157.md` for the educational page.
3. The peptide auto-appears in the library and is selectable in the calculator.

### Updating the calculator math

The math lives in `lib/calculator.ts` as pure functions. The math is the brand's trust foundation — any change must be triple-checked against known peptide reconstitution examples. Add test cases for any new edge case.

### Deploying

`git push origin main` → Vercel auto-deploys. Preview deploys for non-main branches. Domain `buddypept.app` points to production once registered.

### Running locally

```bash
npm install
cp .env.local.example .env.local  # fill in Supabase + Resend keys
npm run dev
# open http://localhost:3000
```

---

## Prior art

`index.html` at the project root is the pre-existing v0 calculator built by Rod in May 2026, before the formal Brand Squad and architecture work. It's a single-file HTML/JS implementation. When implementing the new Next.js calculator in `lib/calculator.ts` and `app/calculator/page.tsx`, treat `index.html` as the *reference* for the math logic and UX patterns — extract the dosing formulas, then re-implement in TypeScript with proper types and tests. Don't reference `index.html` from the running app; it stays as historical reference and will be removed when the new calculator ships.

---

## What's deferred — do NOT build these yet

These are explicitly NOT part of MVP. Do not build them until launch + real user feedback:

- Saved calculations history (requires user accounts beyond email capture)
- Expanded peptide library beyond initial 5-10
- Newsletter platform integration
- `/shop` affiliate route
- App Store distribution (Capacitor wrap)
- SEO content site at buddypept.com (separate from app)

---

## Disclaimer & Legal Placement Map (Phase 7)

BuddyPept's stake is education, not medical advice or prescribing. Disclaimers must appear at every surface where a user could mistake content for medical guidance. Final copy is lawyer-reviewed at Phase 7. Below is the placement architecture only.

Surfaces requiring disclaimers:

1. First-time entry / onboarding gate — one-time acknowledgment before app use.
2. Persistent site-wide footer — short disclaimer on every page.
3. Calculator — two placements: above inputs, and attached to results output. The result number is the moment of highest action risk; disclaimer must sit near the number, not buried.
4. Each peptide library entry — top of every peptide page.
5. Legal status content — every peptide page touching legal/regulatory status needs a "last updated" timestamp and a note that laws change. Library must distinguish prescription peptides (semaglutide, tirzepatide) from "research chemical" peptides (BPC-157, TB-500, GHK-Cu, etc.) without endorsing the research-use framing.
6. Email / account signup — terms acceptance checkbox referencing medical disclaimer and terms of service.
7. Standalone pages — medical disclaimer page, terms of service, privacy policy. Linked from footer and signup.

Positioning rules the app must hold to keep the "educate, don't prescribe" stake credible:
- Never recommend a dose. Show only the math the user inputs.
- Never tell someone to take a peptide. Explain what peptides do.
- Never link to a supplier (already a hard rule).
- Always direct users back to a healthcare professional for decisions.

Implementation note for Phase 5 (current): when building calculator UI and peptide library components, leave placeholder slots (e.g., `[MEDICAL_DISCLAIMER_TOP]`, `[MEDICAL_DISCLAIMER_RESULTS]`, `[PEPTIDE_LEGAL_STATUS_TIMESTAMP]`) in the components. Phase 7 fills them with reviewed copy.

Pre-launch checklist additions for Phase 7:
- Retain legal review for all disclaimer copy, terms of service, and privacy policy before any public users hit the app.
- Verify "last updated" timestamps are live on legal-status content.
- Confirm onboarding acknowledgment gate fires on first session.

---

## Founder

Rod — solo founder, marketing background, non-technical. Building with AI assistance. The origin story: Rod was the confused beginner trying to figure out dosing math and built the tool he wished existed. That story lives on the About page.

---

## Status

- **2026-05-17:** Brand strategy locked (Heyward → Neumeier → Naming → Domain Scout). Name pivoted PeptBuddy → BuddyPept after discovering PepBuddy competitor collision. Defensive domains acquired: peptbuddy.com + peptbuddy.app. Architecture decided (this stack, CTO Architect). Project folder moved out of Google Drive to local `C:\Users\rodss\code\buddypept\`. Context engineering files (this CLAUDE.md, README.md, .env.local.example, ADR-001) saved to project folder.
- **Next:** Register buddypept.com / buddypept.app, scaffold Next.js into this folder (`npx create-next-app@latest .`), set up Supabase + Resend accounts, deploy "hello world" to buddypept.app. Then Week 2: port the math logic from `index.html` into a clean Next.js calculator component.
