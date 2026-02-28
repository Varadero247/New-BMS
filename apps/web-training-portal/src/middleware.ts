import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Nexara Training Portal — Access Control Middleware
 *
 * The training programme is a Nexara-managed service. Access is granted
 * only to organisations that have been approved and issued an activation
 * key by Nexara. Without a valid key the entire portal is inaccessible
 * and the visitor is directed to the access-request page.
 *
 * Activation keys are issued by Nexara via:
 *   training@nexara.io  |  https://nexara.io/contact
 *
 * Key format: NEXARA-ATP-<ORG_CODE>-<YEAR>
 * Example:    NEXARA-ATP-MERIDIAN-2026
 */
function isValidActivationKey(key: string | undefined): boolean {
  if (!key) return false;
  // Nexara-issued keys always start with the ATP (Administrator Training Programme) prefix
  return key.startsWith('NEXARA-ATP-') && key.length >= 20;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow: the not-activated page, Next.js internals, static assets
  if (
    pathname.startsWith('/not-activated') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  const activationKey = request.cookies.get('nexara_portal_key')?.value;

  if (!isValidActivationKey(activationKey)) {
    const url = request.nextUrl.clone();
    url.pathname = '/not-activated';
    // Preserve the originally requested path so we can redirect back after activation
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Apply to all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
};
