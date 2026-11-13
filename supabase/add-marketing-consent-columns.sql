-- Optional marketing-email consent and first-touch attribution.
-- Additive only: no existing column, row or value is changed. Safe to re-run.
--
-- Consent evidence kept per signup row:
--   marketing_consent          true only when the person ticked the separate,
--                              unchecked box. Every pre-existing row stays
--                              false: consent was never asked for, so it is
--                              not recorded.
--   marketing_consent_at       when the box was submitted ticked (server time)
--   marketing_consent_source   which form (homepage, popup, library, peptide-request)
--   marketing_consent_text     the exact label shown, in the language shown
--   marketing_consent_version  version id of that wording (bump when it changes)
-- Consent only becomes active for sending once confirmed_at is also set
-- (double opt-in). Withdrawal happens through the unsubscribe link in Brevo
-- and is mirrored back here by /api/brevo-webhook (marketing_unsubscribed_at).

alter table public.peptide_requests
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists marketing_consent_at timestamptz,
  add column if not exists marketing_consent_source text,
  add column if not exists marketing_consent_text text,
  add column if not exists marketing_consent_version text,
  add column if not exists marketing_unsubscribed_at timestamptz,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists referrer text,
  add column if not exists landing_path text;

-- Check: every existing row reads marketing_consent = false.
select count(*) as total_rows,
       count(*) filter (where marketing_consent) as with_consent
from public.peptide_requests;
