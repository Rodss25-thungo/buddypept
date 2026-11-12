-- ───────────────────────────────────────────────────────────────
-- BuddyPept: confirmation-email send status on signups
-- ───────────────────────────────────────────────────────────────
-- Run this ONCE in the Supabase SQL Editor, BEFORE deploying the code that
-- reads these columns. Safe to run more than once.
--
-- Purpose: a signup is saved first, and the confirmation email result is
-- recorded on the row. A failed send leaves a visible "failed" row instead of
-- a silent orphan, and a repeat submission reuses the row instead of
-- creating a duplicate.
--
-- Existing rows are marked 'sent': they were handled by the old flow, and
-- nobody should get a surprise email from a backfill.
--
-- No unique index on (email, requested_peptide) yet. Three duplicate groups
-- already exist, and merging them needs a decision. The signup code prevents
-- new duplicates by looking up the row first.
-- ───────────────────────────────────────────────────────────────

alter table public.peptide_requests
  add column if not exists email_status text not null default 'pending'
    check (email_status in ('pending', 'sent', 'failed')),
  add column if not exists email_attempts integer not null default 0,
  add column if not exists email_last_error text,
  add column if not exists email_sent_at timestamptz;

comment on column public.peptide_requests.email_status is
  'Confirmation email state: pending (not yet sent), sent, or failed (needs a resend).';

update public.peptide_requests
   set email_status = 'sent',
       email_sent_at = created_at
 where email_status = 'pending'
   and email_sent_at is null;

-- Pin the search path on the two helper functions. Both use only built-ins
-- and no table references, so an empty path changes nothing about results.
alter function public.normalize_peptide_name(text) set search_path = '';
alter function public.is_peptide_request(text) set search_path = '';
