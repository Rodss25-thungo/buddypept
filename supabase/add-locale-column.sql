-- ───────────────────────────────────────────────────────────────
-- BuddyPept — remember which language each person signed up in
-- ───────────────────────────────────────────────────────────────
-- Run this ONCE in the Supabase SQL Editor:
--   Supabase dashboard → SQL Editor → New query → paste this → Run
--
-- Adds one column to peptide_requests:
--   locale — the site language the person was reading when they signed up
--            ('en', 'pt', 'es'). Transactional email is sent in this
--            language, so someone who signed up on /pt is not confirmed in
--            English.
--
-- Existing rows predate the multilingual site, so they default to 'en',
-- which is also exactly what they were sent at the time.
--
-- Safe to run before the app starts writing the column: the send path falls
-- back to 'en' whenever locale is null or unrecognised.
-- ───────────────────────────────────────────────────────────────

alter table public.peptide_requests
  add column if not exists locale text not null default 'en';

-- Only the locales the site actually serves. Widen this when a locale is
-- added, so a typo cannot quietly park someone in a language that has no
-- catalog and no email templates.
alter table public.peptide_requests
  drop constraint if exists peptide_requests_locale_check;

alter table public.peptide_requests
  add constraint peptide_requests_locale_check
  check (locale in ('en', 'pt', 'es'));
