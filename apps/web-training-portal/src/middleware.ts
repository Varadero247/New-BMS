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
 * Key format (legacy):  NEXARA-ATP-<ORG_CODE>-<YEAR>
 * Key format (signed):  NEXARA-ATP-<ORG_CODE>-<YEAR>-<16-char HMAC>
 * Example:              NEXARA-ATP-MERIDIAN-2026
 *
 * FINDING-006 fix: When PORTAL_HMAC_SECRET is set, keys with a 5th dash-separated
 * segment are verified against an HMAC-SHA256 signature.  Legacy keys (4 segments,
 * no sig) remain accepted for backward compatibility with already-issued keys.
 *
 * Return type: NextResponse (sync, no HMAC) | Promise<NextResponse> (async, HMAC set).
 * Tests run without PORTAL_HMAC_SECRET so the middleware stays synchronous and all
 * existing test helpers continue to work without awaiting.
 */

function isValidKeyPattern(key: string | undefined): boolean {
  if (!key) return false;
  return key.startsWith('NEXARA-ATP-') && key.length >= 20;
}

async function isValidKeyWithHmac(key: string, secret: string): Promise<boolean> {
  if (!key.startsWith('NEXARA-ATP-') || key.length < 20) return false;

  // Keys with a signature have ≥5 segments: NEXARA-ATP-<ORG>-<YEAR>-<SIG>
  const parts = key.split('-');
  if (parts.length < 5) {
    // Old-format key without signature — accept as legacy
    return true;
  }

  const lastDash = key.lastIndexOf('-');
  const payload = key.substring(0, lastDash);
  const providedSig = key.substring(lastDash + 1).toLowerCase();

  // Web Crypto API (Edge-runtime compatible)
  const encoder = new TextEncoder();
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBytes = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payload));
  const expectedSig = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 16); // First 16 hex chars (64-bit security)

  return providedSig === expectedSig;
}

function buildRedirect(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = '/not-activated';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest): NextResponse | Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Always allow: the not-activated page, Next.js internals, static assets, API routes
  if (
    pathname.startsWith('/not-activated') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  const activationKey = request.cookies.get('nexara_portal_key')?.value;
  const hmacSecret = process.env.PORTAL_HMAC_SECRET;

  if (hmacSecret) {
    // Async path: HMAC-validate the key (FINDING-006)
    return isValidKeyWithHmac(activationKey ?? '', hmacSecret).then((isValid) =>
      isValid ? NextResponse.next() : buildRedirect(request, pathname)
    );
  }

  // Synchronous path: pattern-only check (no HMAC secret configured)
  if (!isValidKeyPattern(activationKey)) {
    return buildRedirect(request, pathname);
  }

  return NextResponse.next();
}

export const config = {
  // Apply to all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
};
