import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Two jobs, in this order:
 *
 * 1. Password-protect the private /admin area with HTTP Basic Auth.
 * 2. Resolve the locale for every public page.
 *
 * The order matters. /admin lists peptide requests, which include people's
 * emails, so the auth check runs first and /admin never reaches the locale
 * middleware at all. Admin is a private internal tool; it stays English and
 * stays unprefixed.
 */

export const config = {
  // Every path except API routes, Next internals, and files with an extension
  // (favicon.ico, icon.svg, images). Those must not be locale-prefixed.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

const intlMiddleware = createIntlMiddleware(routing);

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    return adminAuth(req);
  }
  return intlMiddleware(req);
}

function adminAuth(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;

  // If no password is configured, refuse access rather than expose data.
  if (!expected) {
    return new NextResponse(
      'Admin access is not configured yet. Set ADMIN_PASSWORD and redeploy.',
      { status: 503 }
    );
  }

  const header = req.headers.get('authorization');
  if (header?.startsWith('Basic ')) {
    const encoded = header.slice('Basic '.length);
    let decoded = '';
    try {
      decoded = atob(encoded);
    } catch {
      decoded = '';
    }
    // Format is "username:password"; we only check the password part.
    const password = decoded.slice(decoded.indexOf(':') + 1);
    if (password && password === expected) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="BuddyPept Admin"' },
  });
}
