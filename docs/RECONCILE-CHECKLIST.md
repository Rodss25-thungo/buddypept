# CLAUDE.md reconciliation checklist

`CLAUDE.md` (2026-08-11) and `docs/PROJECT-BRIEF.md` (2026-08-29) disagree.
This lists every disagreement so Rod can rule on each one.

**How to answer:** reply with the item numbers you DISAGREE with. Silence on an
item means the recommendation stands. Nothing here is applied until Rod rules.

---

## Part A. Factual drift, no judgment needed

These are not opinions. The repo settles them; `CLAUDE.md` is simply out of date.
Recommendation on every A item: **update CLAUDE.md to match reality.**

| # | CLAUDE.md says | Reality in the repo |
|---|---|---|
| A1 | Next.js 14, React 18 | Next.js 16.2.6, React 19.2.4 |
| A2 | Tailwind + shadcn/ui components | Tailwind v4, **no shadcn**, no `components/ui/` |
| A3 | Email via Resend, `lib/resend.ts` | Brevo, `lib/email.ts` |
| A4 | Error tracking via Sentry | **Not installed** |
| A5 | Primary domain `buddypept.app` | `www.buddypept.com`, apex 307-redirects |
| A6 | Routes `/onboarding`, `/about`, `/mission`, `/peptides/[slug]` | **None exist.** Real: `/calculator`, `/learn/[slug]`, `/confirm`, `/disclaimer`, `/privacy`, `/terms`, plus `/admin` |
| A7 | `content/peptides/*.md` for education | **No `content/` folder.** Education lives in `data/peptide-education.ts` + `messages/*.json` |
| A8 | API route `api/capture/route.ts` | Real: `learn-signup`, `request-peptide`, `notify-peptide-live`, `cron/notify-live` |
| A9 | Add a peptide via `WIZARD_PEPTIDE_SLUGS` in `calculator-wizard.tsx` | Moved to `CALCULATOR_SLUGS` in `data/calculator-peptides.ts` |
| A10 | No mention of i18n at all | Three locales live: en, es, pt. `draftLocales` is empty |
| A11 | Status: "2026-05-17, next: register domains, scaffold Next.js" | Shipped and live since June |
| A12 | Deferred: "expanded peptide library beyond initial 5-10" | 16 peptides ship today. Item is obsolete |
| A13 | Phase 7 disclaimer placement map, unbuilt | **Already ruled: cut.** Legal pages shipped in all three languages |

---

## Part B. Live contradictions between a stated rule and shipped code

| # | The conflict | Options |
|---|---|---|
| B1 | Rule 3 says **never add third-party tracking pixels**. The app loads **Google Analytics** (`GoogleAnalytics` in `app/[locale]/layout.tsx:98`). One of the two has to give. | (a) Keep GA, drop or reword the rule. (b) Keep the rule, remove GA and rely on Vercel Analytics alone. **Recommend (a)**, since GA is already live and pulling data. |

---

## Part C. The rules themselves

Rod's ruling: *"We will remove the rules. Nothing should stop development, change
of direction, or new projects."*

Taken literally that deletes all seven. Recommendation is to keep them as
**defaults, not locks**: each stays written down as the current intent, with one
line at the top of the section saying they are Rod's standing preferences and
that Rod can override any of them at any time without argument. That preserves
the freedom he asked for, and keeps a new session from silently reversing a
decision he never revisited.

Rule by rule. Mark any you want **deleted outright** rather than kept as a default.

| # | Rule | Note |
|---|---|---|
| C1 | Never paywall the calculator or education | This is the brand stake, "the math stays free, forever" |
| C2 | Never collect data beyond name + email | Currently true. Locale is also stored, which is app config, not personal data |
| C3 | Never add third-party tracking pixels | Already broken by GA, see B1 |
| C4 | Never mix calculator code with commerce code | Structural. Matters only when `/shop` happens |
| C5 | Never give medical advice; point back to a professional | **The one I would not delete.** This is not a brand preference, it is the line between an education tool and something that carries real liability. Removing it does not unblock development, since nothing about growth, marketing, or new features requires giving medical advice |
| C6 | Never write in clinical-pharma or bro-science voice | Voice guideline |
| C7 | Never link to a supplier | The 7th rule, in the brief but not CLAUDE.md. You have manufacturer research files in Drive; this rule is what keeps them research-only |

The seven **copy rules** (no em dashes, never imply self-dosing, researcher
framing, dry humor, no time references, folded disclaimer, never recommend a
dose) live in the brief and in memory. They are not in `CLAUDE.md`. Same
question applies: keep as defaults, or drop?

| # | Item | Recommendation |
|---|---|---|
| C8 | The seven copy rules | Keep as defaults. They are what makes the copy sound like BuddyPept rather than generic |
| C9 | Calculator precision rule (`.claude/rules/calculator-precision.md`) | Keep. It is a correctness check, not a restriction: three worked examples that catch a math regression before it ships |

---

## Part D. Structure

| # | Question | Recommendation |
|---|---|---|
| D1 | CLAUDE.md vs the brief | Make `CLAUDE.md` a short pointer that says "read `docs/PROJECT-BRIEF.md` first," plus only the session-workflow notes. One source of truth, so they cannot drift apart again |
| D2 | `AGENTS.md` | **Ruled: delete.** Claude Code is the only tool in use |
| D3 | `README.md` (2026-08-06) | Not yet checked for drift. Flag for a later pass |
| D4 | `.env.local.example` | Stale: lists Resend and Sentry. Update to the real seven variables |

---

## Already ruled, for the record

- Commit the brief and `social-media/`: **done**, commit `815b928`
- Delete `AGENTS.md`: **yes**
- Cut the Phase 7 section: **yes**
- The two deferred calculator UI items, vial placeholder and the 2x2 adjust
  grid at 375px: **stay deferred, do not touch**
