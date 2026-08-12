import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware replacements for `next/link` and the navigation hooks.
 *
 * Import `Link` from here instead of `next/link` anywhere inside a page. It
 * keeps the reader in their language: `<Link href="/calculator">` renders as
 * `/calculator` for an English reader and `/pt/calculator` for a Portuguese
 * one, without every call site having to remember the prefix.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
