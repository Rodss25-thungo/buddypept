-- ───────────────────────────────────────────────────────────────
-- BuddyPept — peptide request fulfillment + notification tracking
-- ───────────────────────────────────────────────────────────────
-- Run this ONCE in the Supabase SQL Editor:
--   Supabase dashboard → SQL Editor → New query → paste this → Run
--
-- Purpose: close the loop on "request a peptide". Today a person asks for a
-- peptide, confirms their email, and never hears back when it goes live in
-- the calculator. This adds the tracking needed to notify them once, and
-- only once, when their peptide ships.
--
-- What it adds:
--   peptide_requests.matched_slug  — the peptide slug this request maps to
--   peptide_requests.fulfilled_at  — set when the requester has been notified
--   notification_sends             — per-recipient send log, so a batch that
--                                    fails halfway is resumable, not a guess
--   is_peptide_request()           — separates real requests from newsletter rows
--   peptide_demand                 — ranked view of what people actually want
--
-- Safe to run more than once. Every statement is guarded.
-- ───────────────────────────────────────────────────────────────

-- ─── 1. Fulfillment columns ───

alter table public.peptide_requests
  add column if not exists matched_slug text,
  add column if not exists fulfilled_at timestamptz;

comment on column public.peptide_requests.matched_slug is
  'Slug from data/peptides.ts this request maps to. NULL until matched.';
comment on column public.peptide_requests.fulfilled_at is
  'Set when the requester was emailed that their peptide is live. NULL = still owed a notification.';

-- ─── 2. Request text normalization ───
-- "BPC-157", "bpc 157", and "BPC157" are the same request. Without this they
-- rank as three separate items and the demand list lies to you.
--
-- IMMUTABLE so it can be used in an index expression.

create or replace function public.normalize_peptide_name(raw text)
returns text
language sql
immutable
strict
as $$
  select regexp_replace(lower(trim(raw)), '[^a-z0-9]', '', 'g');
$$;

comment on function public.normalize_peptide_name(text) is
  'Lowercases and strips all non-alphanumerics so peptide name variants collapse to one key.';

-- ─── 2b. Newsletter rows are not peptide requests ───
-- peptide_requests holds two kinds of row. app/api/request-peptide/route.ts
-- writes what a person actually typed. app/api/learn-signup/route.ts writes
-- 'Learn: homepage', 'Learn: popup', etc. as newsletter signups.
--
-- As of 2026-08-11 the newsletter rows are 8 of 15 confirmed rows. Counting
-- them as demand puts 'Learn: homepage' at the top of the list, which would
-- point the roadmap at a peptide that does not exist. Everything downstream
-- must filter on this.

create or replace function public.is_peptide_request(raw text)
returns boolean
language sql
immutable
strict
as $$
  select raw not like 'Learn: %';
$$;

comment on function public.is_peptide_request(text) is
  'False for newsletter signups written as "Learn: <source>" by learn-signup/route.ts. True for real peptide requests. If that prefix ever changes, change it here too.';

-- ─── 3. Indexes ───
-- These matter once the table is large. The notify job filters on exactly
-- this shape: confirmed, not yet fulfilled, matching a slug.

create index if not exists peptide_requests_normalized_idx
  on public.peptide_requests (public.normalize_peptide_name(requested_peptide));

create index if not exists peptide_requests_pending_notify_idx
  on public.peptide_requests (matched_slug)
  where confirmed_at is not null
    and fulfilled_at is null
    and matched_slug is not null;

create index if not exists peptide_requests_created_at_idx
  on public.peptide_requests (created_at desc);

-- ─── 4. Per-recipient send log ───
-- One row per (person, peptide) notification attempt. The unique constraint
-- is the idempotency guarantee: re-running a batch cannot double-email
-- anyone, so a partial failure is safe to retry in full.

create table if not exists public.notification_sends (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid not null references public.peptide_requests(id) on delete cascade,
  peptide_slug  text not null,
  -- 'sent' | 'failed'. Failed rows are what a retry picks back up.
  status        text not null default 'sent',
  error_message text,
  created_at    timestamptz not null default now(),
  constraint notification_sends_status_check check (status in ('sent', 'failed')),
  constraint notification_sends_once_per_peptide unique (request_id, peptide_slug)
);

comment on table public.notification_sends is
  'Per-recipient log of "your peptide is live" emails. Unique(request_id, peptide_slug) prevents double sends across retries.';

create index if not exists notification_sends_retry_idx
  on public.notification_sends (peptide_slug)
  where status = 'failed';

-- ─── 5. Demand view ───
-- What people are asking for that is not yet in the calculator. This is the
-- list that drives which peptides get added next, ranked by real demand
-- rather than by whoever emailed most recently.
--
-- Only confirmed requests count. An unconfirmed signup is not a signal.
-- Newsletter rows are excluded, see is_peptide_request() above.

create or replace view public.peptide_demand as
select
  public.normalize_peptide_name(requested_peptide) as normalized_name,
  -- The most recent spelling, for display. Users read "BPC-157", not "bpc157".
  (array_agg(requested_peptide order by created_at desc))[1] as display_name,
  count(*)                                          as request_count,
  count(*) filter (where fulfilled_at is null)      as awaiting_notification,
  min(created_at)                                   as first_requested_at,
  max(created_at)                                   as last_requested_at,
  (array_agg(matched_slug) filter (where matched_slug is not null))[1] as matched_slug
from public.peptide_requests
where confirmed_at is not null
  and public.is_peptide_request(requested_peptide)
group by 1
order by request_count desc, last_requested_at desc;

comment on view public.peptide_demand is
  'Confirmed peptide requests grouped by normalized name, ranked by demand. Excludes newsletter signups. Drives what gets added to the calculator next.';

-- A view inherits the privileges of its owner, so make it obey the caller's
-- RLS instead. Without this, exposing the view would leak the base table.
alter view public.peptide_demand set (security_invoker = on);

-- ─── 6. Keep everything private ───
-- RLS stays on for the base table (set in setup.sql). Nothing here opens a
-- public policy, so only the service-role key reaches this data.

alter table public.notification_sends enable row level security;
