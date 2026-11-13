'use client';

import { useEffect } from 'react';
import { captureFirstTouch, track } from '@/lib/analytics';

/**
 * Mounted once in the locale layout. Two jobs:
 *
 * 1. Record the first-touch source (UTM tags or referrer) for this browser.
 * 2. Send a `cta_click` event for any element marked `data-track="<name>"`,
 *    so server-rendered links can be measured without becoming client
 *    components.
 */
export function AnalyticsListener() {
  useEffect(() => {
    captureFirstTouch();

    function onClick(e: MouseEvent) {
      const el = (e.target as Element | null)?.closest?.('[data-track]');
      if (!el) return;
      track('cta_click', {
        cta: el.getAttribute('data-track') ?? 'unknown',
        page_path: window.location.pathname,
      });
    }
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
