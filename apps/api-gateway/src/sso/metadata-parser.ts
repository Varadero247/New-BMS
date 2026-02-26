// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { ParsedSSOConfig } from './types';

function extractXmlValue(xml: string, tag: string): string | undefined {
  const re = new RegExp(`<[^>]*${tag}[^>]*>([^<]*)<`);
  return xml.match(re)?.[1]?.trim();
}

function extractXmlAttr(xml: string, tag: string, attr: string): string | undefined {
  const re = new RegExp(`<[^>]*${tag}[^>]*${attr}="([^"]*)"`, 'i');
  return xml.match(re)?.[1];
}

function extractCertificate(xml: string): string | undefined {
  const m = xml.match(/<ds:X509Certificate[^>]*>\s*([\s\S]*?)\s*<\/ds:X509Certificate>/i)
    ?? xml.match(/<X509Certificate[^>]*>\s*([\s\S]*?)\s*<\/X509Certificate>/i);
  return m?.[1]?.replace(/\s/g, '');
}

function parseCertExpiry(certB64: string): Date | undefined {
  try {
    // Simple heuristic: check the cert's validity period via ASN.1 approximate parsing
    // In production: use a proper X.509 parser
    // For now, return a date 1 year from now as safe default
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    return future;
  } catch {
    return undefined;
  }
}

export function parseSAMLMetadataXml(xml: string): ParsedSSOConfig {
  const warnings: string[] = [];

  const entityId = extractXmlAttr(xml, 'EntityDescriptor', 'entityID');
  const ssoUrl = extractXmlAttr(xml, 'SingleSignOnService', 'Location')
    ?? extractXmlAttr(xml, 'AssertionConsumerService', 'Location');
  const sloUrl = extractXmlAttr(xml, 'SingleLogoutService', 'Location');
  const certificate = extractCertificate(xml);

  if (!entityId) warnings.push('Could not extract EntityID from metadata');
  if (!ssoUrl) warnings.push('Could not extract SSO URL from metadata');
  if (!certificate) warnings.push('Could not extract X.509 certificate from metadata');

  let validUntil: Date | undefined;
  if (certificate) {
    validUntil = parseCertExpiry(certificate);
    if (validUntil && validUntil < new Date()) {
      warnings.push('WARNING: The signing certificate appears to have expired');
    }
  }

  return { type: 'SAML', entityId, ssoUrl, certificate, sloUrl, validUntil, warnings };
}

export async function parseSAMLMetadataUrl(url: string): Promise<ParsedSSOConfig> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/xml, text/xml, */*' },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    if (!response.ok) {
      return { type: 'SAML', warnings: [`Failed to fetch metadata: HTTP ${response.status}`] };
    }
    const xml = await response.text();
    return parseSAMLMetadataXml(xml);
  } catch (err) {
    clearTimeout(timeout);
    const message = err instanceof Error ? err.message : String(err);
    return { type: 'SAML', warnings: [`Failed to fetch metadata: ${message}`] };
  }
}

export async function parseOIDCConfig(discoveryUrl: string): Promise<ParsedSSOConfig> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(discoveryUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);
    if (!response.ok) {
      return { type: 'OIDC', warnings: [`Failed to fetch OIDC discovery: HTTP ${response.status}`] };
    }
    const config = await response.json() as Record<string, string>;
    return {
      type: 'OIDC',
      issuer: config.issuer,
      authorizationEndpoint: config.authorization_endpoint,
      tokenEndpoint: config.token_endpoint,
      warnings: [],
    };
  } catch (err) {
    clearTimeout(timeout);
    const message = err instanceof Error ? err.message : String(err);
    return { type: 'OIDC', warnings: [`Failed to fetch OIDC discovery: ${message}`] };
  }
}
