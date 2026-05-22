-- ───────────────────────────────────────────────────────────────
-- BuddyPept — database setup
-- ───────────────────────────────────────────────────────────────
-- Run this ONCE in the Supabase SQL Editor:
--   Supabase dashboard → SQL Editor → New query → paste this → Run
--
-- It creates the table that stores "request a peptide" submissions
-- (name + email + the peptide the user wants added).
-- ───────────────────────────────────────────────────────────────

create table if not exists public.peptide_requests (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  email             text not null,
  requested_peptide text not null,
  created_at        timestamptz not null default now()
);

-- Keep the table private. With Row Level Security ON and no public policies,
-- the public/anon key cannot read or write anything. Only the server (using
-- the secret service-role key, which bypasses RLS) can insert rows.
--
-- Result: the BuddyPept API route saves submissions, but no website visitor
-- can read the list. You view submissions in the Supabase dashboard
-- (Table Editor → peptide_requests).
alter table public.peptide_requests enable row level security;
