import { sendGAEvent } from '@next/third-parties/google';

/**
 * Conversion events, sent to GA4 only (client-side).
 *
 * Vercel Analytics keeps counting pageviews and referrers. Its custom events
 * need a paid plan, so GA4 is the single event store. Nothing personal is ever
 * sent: no names, no emails, no typed peptide names, no dose values. Curated
 * peptide slugs and form names are the most specific thing that leaves the
 * browser.
 *
 * Event names follow GA4's recommended set where one exists (`sign_up`).
 * See docs/PROJECT-BRIEF.md section 15 for the event list and UTM convention.
 */
export type AnalyticsEvent =
  | 'calculator_start'
  | 'calculator_complete'
  | 'calculator_restart'
  | 'peptide_request_open'
  | 'sign_up_start'
  | 'sign_up'
  | 'sign_up_error'
  | 'email_confirmed'
  | 'popup_shown'
  | 'cta_click';

type Params = Record<string, string | number | boolean | undefined>;

export function track(event: AnalyticsEvent, params: Params = {}): void {
  if (typeof window === 'undefined') return;
  try {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    );
    sendGAEvent('event', event, clean);
  } catch {
    // Analytics must never break the page.
  }
}

/* ─────────────────────────── First-touch attribution ─────────────────────── */

const ATTRIBUTION_KEY = 'bp_first_touch';

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  /** Referring host on the landing visit, when there was one. */
  referrer?: string;
  /** Path of the first page seen, without query string. */
  landing_path?: string;
}

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
] as const;

/**
 * Stores where this browser first came from, once. Later visits never
 * overwrite it, so a signup is credited to the post that brought the person
 * in, not to whatever page they happened to sign up on.
 */
export function captureFirstTouch(): void {
  try {
    if (localStorage.getItem(ATTRIBUTION_KEY)) return;
    const url = new URL(window.location.href);
    const data: Attribution = { landing_path: url.pathname.slice(0, 200) };
    for (const key of UTM_KEYS) {
      const v = url.searchParams.get(key);
      if (v) data[key] = v.trim().toLowerCase().slice(0, 100);
    }
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host && host !== window.location.hostname) {
        data.referrer = host.slice(0, 100);
      }
    }
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(data));
  } catch {
    // Private mode or blocked storage: no attribution, nothing breaks.
  }
}

/** The stored first touch, sent along with a signup. */
export function getAttribution(): Attribution | undefined {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : undefined;
  } catch {
    return undefined;
  }
}
