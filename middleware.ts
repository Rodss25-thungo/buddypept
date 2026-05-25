import { NextRequest, NextResponse } from 'next/server';

/**
 * Password-protects the private /admin area with HTTP Basic Auth.
 *
 * The browser shows a native sign-in prompt. We check the password against the
 * ADMIN_PASSWORD environment variable (set in Vercel). The username can be
 * anything; only the password is checked. The /admin page lists peptide
 * requests, which include people's emails, so it must never be public.
 */

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

export function middleware(req: NextRequest) {
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
