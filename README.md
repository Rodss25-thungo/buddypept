# BuddyPept

> Turn peptide-curious into peptide-confident — for free, forever.

The free, no-paywall, no-data-harvest peptide dosing calculator and education app.

## What this is

A Progressive Web App (PWA) that helps peptide newcomers calculate IU, mL, and syringe units for reconstitution and dosing — without paywalls, data harvesting, or sales pitches.

The math stays free. Forever.

## Stack

- Next.js 14 (App Router)
- TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Auth)
- Resend (email)
- Deployed on Vercel

## Local setup

```bash
npm install
cp .env.local.example .env.local
# Fill in your keys (see .env.local.example for the list)
npm run dev
```

Open http://localhost:3000.

## Project context for AI assistants

See [`CLAUDE.md`](./CLAUDE.md) for full project context, brand rules, and conventions. Claude Code and Cursor read this file at the start of every session.

## Deploy

`git push origin main` → Vercel auto-deploys to buddypept.app.

## License

Proprietary — © Rod 2026. All rights reserved.
