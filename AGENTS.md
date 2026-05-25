<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (16.2.6) has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# BuddyPept: Universal AI Agent Context

This file is the **universal** AI agent context. Read it at the start of every session, regardless of which AI tool you are (Claude Code, Cursor, Codex, Cody, GitHub Copilot Chat, etc.). For Claude-specific workflow notes, also see `CLAUDE.md`.

## What BuddyPept is

A free mobile-first Progressive Web App (PWA) that helps peptide newcomers calculate dosing math (mg → IU → mL → units), reconstitute peptides correctly (bacteriostatic water + mg peptide → correct concentration), and understand what they're putting in their body.

**Audience:** "The confused beginner" entering the peptide world unsure how to dose. Cuts across GLP-1 patients (semaglutide, tirzepatide), recovery users (BPC-157, TB-500), biohackers, aesthetic users. Focused by *moment* (first time receiving a vial), not by demographic.

**Business model:** Free for users forever. Email + name capture at entry. Downstream monetization via affiliate links to supplies + eventual brand partnerships, never via paywall, never via data harvest.

## Brand spine: DO NOT VIOLATE

- **Mission:** *"To turn peptide-curious into peptide-confident. For free, forever."*
- **Stake in the ground:** *"The math stays free. Forever."*
- **Zag:** *"Everyone else in peptides is selling. We give."* The brand never extracts from users.
- **Trueline (cornerstone phrase):** *"The math doesn't lie."*
- **Voice:** Calm, kind, precise. Anti-hype. Anti-bro-science. Anti-disclaimer-fest. Treats users as smart adults.
- **Character:** Illustrated mascot named "Buddy" (or "Bud"), a calm, science-teacher friend. Mood: Khan Academy / Headspace / DuckDuckGo warmth.

## Hard rules: NEVER violate these

1. **Never paywall the calculator or education content.** The math is free forever. Structural, not negotiable.
2. **Never collect user data beyond name + email.** No height, weight, age, gender, health conditions. Brand differentiator.
3. **Never add third-party tracking pixels** (Facebook Pixel, GTM beyond essential analytics, etc.). Privacy-first.
4. **Never mix calculator code with commerce code.** Editorial-commercial separation is structural. Any future `/shop` route stays isolated.
5. **Never give medical advice.** Always include "consult a healthcare professional" disclaimers in dosing/education content.
6. **Never write copy in clinical pharma voice or bro-science voice.** Calm. Kind. Precise.

If a code suggestion would violate any of these, refuse or warn before producing it.

## Tech stack

- **Frontend:** Next.js 16.2.6 (App Router) + React 18 + TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Next.js API Routes (serverless functions on Vercel)
- **Database:** Supabase (Postgres + Auth + Storage)
- **Email:** Resend
- **Hosting:** Vercel (Hobby/free tier)
- **Validation:** Zod (runtime type validation at API boundaries)
- **Dev tooling:** Turbopack, ESLint, Node.js v24.15.0 LTS
- **Build approach:** PWA, installable on iOS/Android home screen, Capacitor wrap deferred to Phase 3

## Code conventions

- TypeScript everywhere. No `.js` files. Strict mode enabled.
- Functional components only. No class components.
- Server Components by default. Use `"use client"` only when truly needed (interactivity, browser APIs).
- File naming: **kebab-case for files** (`peptide-card.tsx`), **PascalCase for component names** (`PeptideCard`).
- Tailwind for styling. shadcn/ui for primitives. No CSS Modules, no styled-components.
- Database access via Supabase server client in Server Components / API routes only. Never expose service-role key to client.
- Environment variables: secrets in `.env.local` (gitignored). Public vars prefixed `NEXT_PUBLIC_`.
- Type safety: Zod for runtime validation at API boundaries.
- No premature abstractions. Inline first; abstract at 3+ uses.

## Directory structure

```
buddypept/
├── CLAUDE.md            ← Claude-specific context (this file's sibling)
├── AGENTS.md            ← This file (universal AI agent context)
├── README.md            ← Human-readable docs
├── .env.local           ← SECRETS (gitignored)
├── .env.local.example   ← Template
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind / postcss configs
├── .gitignore
├── index.html           ← PRIOR ART, pre-Brand-Squad calculator, reference only
│
├── app/                 ← Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                 ← Landing page
│   ├── onboarding/page.tsx      ← Email + name capture
│   ├── calculator/page.tsx      ← Math tool
│   ├── peptides/                ← Education library
│   ├── about/, mission/, privacy/, disclaimer/
│   └── api/capture/route.ts     ← Email capture endpoint
│
├── components/
│   ├── ui/              ← shadcn primitives
│   └── brand/           ← Buddy character, logo
│
├── lib/
│   ├── supabase.ts      ← Supabase client setup
│   ├── resend.ts        ← Email client setup
│   └── calculator.ts    ← Math logic (pure functions, well-tested)
│
├── data/
│   └── peptides.ts      ← Pre-loaded peptide library (5-10 common)
│
├── content/peptides/    ← One .md per peptide for educational pages
├── public/              ← Static assets, PWA manifest, icons
└── docs/adr/            ← Architecture Decision Records
```

## Common tasks

### Adding a new peptide
1. Add entry to `data/peptides.ts` (slug, name, common mg/vial, typical dose, unit, short description)
2. Create `content/peptides/{slug}.md` for the educational page
3. Peptide auto-appears in library and calculator

### Updating the calculator math
Math lives in `lib/calculator.ts` as pure functions. **Any change must be triple-checked against known peptide reconstitution examples.** The math is the brand's trust foundation: *"the math doesn't lie."* Add test cases for any new edge case.

### Deploying
`git push origin main` → Vercel auto-deploys. Domain `buddypept.app` points to production once registered.

### Running locally
```bash
npm install
cp .env.local.example .env.local  # fill in Supabase + Resend keys
npm run dev
# open http://localhost:3000
```

## What's deferred: do NOT build these yet

- Saved calculations history (requires user accounts beyond email)
- Expanded peptide library beyond initial 5-10
- Newsletter platform integration
- `/shop` affiliate route
- App Store distribution (Capacitor wrap)
- SEO content site at buddypept.com

## Prior art

`index.html` at the project root is the pre-existing v0 calculator built by Rod in May 2026, before formal Brand Squad and architecture work. Single-file HTML/JS. When implementing the new Next.js calculator in `lib/calculator.ts` and `app/calculator/page.tsx`, treat `index.html` as the *reference* for the math logic and UX patterns. Extract the dosing formulas, then re-implement in TypeScript with proper types and tests. Don't reference `index.html` from the running app; it stays as historical reference and will be removed once the new calculator ships.

## Founder

Rod: solo founder, marketing background, **non-technical**. Builds with AI assistance. Origin story: he was the confused beginner trying to figure out dosing math and built the tool he wished existed. That story lives on the About page.
