// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
//
// FINDING-002 fix: Portal activation key cookie is now set SERVER-SIDE with
// HttpOnly + Secure flags, preventing XSS-based theft of the cookie.

import { NextRequest, NextResponse } from 'next/server';

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

/**
 * Validate a portal activation key.
 * If PORTAL_HMAC_SECRET is configured, keys with a signature segment
 * (5th dash-separated part) are verified via HMAC-SHA256.
 * Keys without a signature segment fall back to pattern + length check
 * for backward compatibility with keys issued before HMAC was introduced.
 */
async function isValidActivationKey(key: string): Promise<boolean> {
  if (!key.startsWith('NEXARA-ATP-') || key.length < 20) return false;

  const hmacSecret = process.env.PORTAL_HMAC_SECRET;
  if (!hmacSecret) {
    // No HMAC secret configured — accept any key matching the pattern
    return true;
  }

  // Keys with a signature have 5 segments: NEXARA-ATP-<ORG>-<YEAR>-<SIG>
  const parts = key.split('-');
  if (parts.length < 5) {
    // Old-format key without signature — accept as legacy
    return true;
  }

  // Payload = everything before the last segment; signature = last segment
  const lastDash = key.lastIndexOf('-');
  const payload = key.substring(0, lastDash);
  const providedSig = key.substring(lastDash + 1).toLowerCase();

  // Web Crypto API (Edge-runtime safe)
  const encoder = new TextEncoder();
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(hmacSecret),
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const key = typeof body.key === 'string' ? body.key.trim().toUpperCase() : '';

    if (!(await isValidActivationKey(key))) {
      return NextResponse.json({ success: false, error: 'Invalid activation key' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    // Set HttpOnly + Secure cookie — JS cannot read this cookie (XSS-safe)
    response.cookies.set('nexara_portal_key', key, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: ONE_YEAR_SECONDS,
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
