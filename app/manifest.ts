import type { MetadataRoute } from 'next';

/**
 * Web app manifest. Lets people install BuddyPept to their phone home screen,
 * where it opens full screen (no browser bar) with its own icon, like an app.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BuddyPept',
    short_name: 'BuddyPept',
    description:
      'A free, step-by-step peptide dosing calculator. The math, free forever.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf9',
    theme_color: '#0d9488',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
