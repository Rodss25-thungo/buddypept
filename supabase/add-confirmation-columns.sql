-- ───────────────────────────────────────────────────────────────
-- BuddyPept — add double opt-in confirmation columns
-- ───────────────────────────────────────────────────────────────
-- Run this ONCE in the Supabase SQL Editor:
--   Supabase dashboard → SQL Editor → New query → paste this → Run
--
-- Adds two columns to peptide_requests:
--   confirmation_token  — one-time UUID sent in the confirmation email link
--   confirmed_at        — timestamp when the user clicked the confirm link
--                         (NULL until confirmed)
--
-- Existing rows (signups from before this change) are backfilled as already
-- confirmed, since they predate the opt-in change.
-- ───────────────────────────────────────────────────────────────

alter table public.peptide_requests
  add column if not exists confirmation_token uuid default gen_random_uuid(),
  add column if not exists confirmed_at timestamptz;

-- Backfill: treat all pre-existing rows as confirmed.
update public.peptide_requests
  set confirmed_at = created_at
  where confirmed_at is null;
