-- ───────────────────────────────────────────────────────────────
-- BuddyPept — count people, not form submissions
-- ───────────────────────────────────────────────────────────────
-- Run this ONCE in the Supabase SQL Editor.
--
-- Why: peptide_demand counted rows. One person who submits the form three
-- times looked like three people wanting the same peptide. That is not
-- hypothetical: on 2026-05-28 a single requester submitted "NAD 500" three
-- times in six hours, and the demand list read "3" for what is one person.
--
-- Demand decides what gets built next, so it has to count people. A roadmap
-- driven by inflated numbers builds the wrong thing.
--
-- Safe to run more than once.
-- ───────────────────────────────────────────────────────────────

create or replace view public.peptide_demand as
select
  public.normalize_peptide_name(requested_peptide) as normalized_name,
  -- The most recent spelling, for display. Users read "BPC-157", not "bpc157".
  (array_agg(requested_peptide order by created_at desc))[1] as display_name,
  -- The number that matters. Emails are lowercased so casing variants of the
  -- same address do not count twice.
  count(distinct lower(trim(email)))                as request_count,
  -- Kept for when a duplicate submission is itself the signal, e.g. someone
  -- asking repeatedly because they never heard back.
  count(*)                                          as submission_count,
  -- People still owed an email, not rows. Matches what the notify route sends.
  count(distinct lower(trim(email))) filter (where fulfilled_at is null)
                                                    as awaiting_notification,
  min(created_at)                                   as first_requested_at,
  max(created_at)                                   as last_requested_at,
  (array_agg(matched_slug) filter (where matched_slug is not null))[1] as matched_slug
from public.peptide_requests
where confirmed_at is not null
  and public.is_peptide_request(requested_peptide)
group by 1
order by request_count desc, last_requested_at desc;

comment on view public.peptide_demand is
  'Confirmed peptide requests grouped by normalized name. request_count is DISTINCT PEOPLE; submission_count is raw form submissions. Excludes newsletter signups.';

alter view public.peptide_demand set (security_invoker = on);
