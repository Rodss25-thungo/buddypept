'use client';

import { useEffect } from 'react';

/**
 * Tiny client component that runs once on the confirm success / already pages
 * and sets the localStorage flag the library uses to bypass its email gate.
 * That way a confirmed visitor returning to /learn can browse without being
 * asked for their email again on this device.
 */

const UNLOCK_KEY = 'bp_learn_unlocked';

export function UnlockLibrary() {
  useEffect(() => {
    try {
      localStorage.setItem(UNLOCK_KEY, '1');
    } catch {
      // ignore storage errors
    }
  }, []);
  return null;
}
