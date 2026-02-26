// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { ParsedEmail, EmailValidationResult } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const FREE_PROVIDERS: string[] = [
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de', 'yahoo.es', 'yahoo.it',
  'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.de', 'hotmail.it', 'hotmail.es',
  'outlook.com', 'outlook.co.uk',
  'live.com', 'live.co.uk',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com',
  'protonmail.com', 'proton.me',
  'zoho.com',
  'gmx.com', 'gmx.net', 'gmx.de',
  'yandex.com', 'yandex.ru',
  'mail.com', 'mail.ru',
  'inbox.com',
  'fastmail.com',
];

const DISPOSABLE_DOMAINS: Set<string> = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'maildrop.cc', 'sharklasers.com', 'guerrillamailblock.com',
  'grr.la', 'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de',
  'guerrillamail.net', 'guerrillamail.org', 'spam4.me',
  'trashmail.com', 'trashmail.at', 'trashmail.io', 'trashmail.me', 'trashmail.net',
  'dispostable.com', 'mailnull.com',
  'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org',
  '10minutemail.com', '10minutemail.net', '10minutemail.org',
  '20minutemail.com',
  'tempinbox.com', 'fakeinbox.com', 'tempinbox.net',
  'getairmail.com', 'filzmail.com', 'discard.email',
  'throwam.com', 'spamthisplease.com', 'mailexpire.com', 'mailforspam.com',
  'notmailinator.com', 'spamavert.com', 'emailondeck.com', 'easytrashmail.com',
  'mintemail.com', 'instantemailaddress.com', 'nospamfor.us',
  'mt2015.com', 'mt2014.com', 'mt2016.com',
  'spamfree24.org', 'spamfree24.de', 'spamfree24.eu', 'spamfree24.info', 'spamfree24.net',
  'tempmailer.com', 'emailmyphone.com', 'bossmail.de',
  'cool.fr.nf', 'courriel.fr.nf', 'diplomats.com',
  'letthemeatspam.com', 'lovemeleaveme.com', 'objectmail.com', 'ownmail.net',
  'pecinan.com', 'pecinan.net', 'pecinan.org', 'put2.net', 'rotaniliam.com',
  'skeefmail.com', 'sogetthis.com', 'suckmyd.com', 'teewars.org',
  'thisisnotmyrealemail.com', 'tradermail.info', 'trbvm.com',
  'vmailing.info', 'webm4il.info', 'xoxy.net', 'yep.it',
]);

const ROLE_ACCOUNTS: Set<string> = new Set([
  'admin', 'administrator', 'postmaster', 'hostmaster', 'webmaster',
  'info', 'support', 'help', 'sales', 'marketing',
  'noreply', 'no-reply', 'bounce', 'abuse', 'security',
  'privacy', 'legal', 'billing', 'finance', 'hr',
  'jobs', 'careers', 'press', 'media', 'contact',
  'hello', 'team', 'newsletter', 'unsubscribe', 'subscribe',
  'feedback', 'complaints',
]);

const FREE_PROVIDER_SET: Set<string> = new Set(FREE_PROVIDERS);

// RFC 5321: local up to 64, domain up to 255, total up to 320
const LOCAL_MAX = 64;
const DOMAIN_MAX = 255;
const TOTAL_MAX = 320;

// Valid local part characters (excluding quotes which we don't support in this impl)
const LOCAL_VALID_RE = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;

// Domain label: starts/ends with alphanum, may contain hyphens
const DOMAIN_LABEL_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$|^[a-zA-Z0-9]$/;

// TLD: letters only, 2-24 chars
const TLD_RE = /^[a-zA-Z]{2,24}$/;

// Regex for extracting email addresses from free text
const EMAIL_EXTRACT_RE = /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}/g;

const ALPHA_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const ALNUM_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function splitAtSign(email: string): { local: string; domain: string } | null {
  const idx = email.lastIndexOf('@');
  if (idx <= 0 || idx === email.length - 1) return null;
  const local = email.slice(0, idx);
  const domain = email.slice(idx + 1);
  return { local, domain };
}

function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > DOMAIN_MAX) return false;
  const labels = domain.split('.');
  if (labels.length < 2) return false;
  for (const label of labels) {
    if (!label || !DOMAIN_LABEL_RE.test(label)) return false;
  }
  const tld = labels[labels.length - 1];
  if (!TLD_RE.test(tld)) return false;
  return true;
}

function randChar(chars: string): string {
  return chars[Math.floor(Math.random() * chars.length)];
}

function randStr(chars: string, len: number): string {
  let s = '';
  for (let i = 0; i < len; i++) s += randChar(chars);
  return s;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > TOTAL_MAX) return false;

  const parts = splitAtSign(trimmed);
  if (!parts) return false;
  const { local, domain } = parts;

  if (local.length === 0 || local.length > LOCAL_MAX) return false;
  if (!LOCAL_VALID_RE.test(local)) return false;
  if (!isValidDomain(domain)) return false;

  return true;
}

export function validateEmail(email: string): EmailValidationResult {
  if (typeof email !== 'string' || email.trim().length === 0) {
    return { valid: false, reason: 'Email must be a non-empty string' };
  }
  const trimmed = email.trim();

  if (trimmed.length > TOTAL_MAX) {
    return { valid: false, reason: `Email exceeds maximum length of ${TOTAL_MAX} characters` };
  }

  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount === 0) {
    return { valid: false, reason: 'Missing @ symbol' };
  }
  if (atCount > 1) {
    return { valid: false, reason: 'Multiple @ symbols found' };
  }

  // Explicit check for empty local or domain before splitAtSign
  const atIdx = trimmed.indexOf('@');
  if (atIdx === 0) {
    return { valid: false, reason: 'Local part is empty' };
  }
  if (atIdx === trimmed.length - 1) {
    return { valid: false, reason: 'Domain is empty' };
  }

  const parts = splitAtSign(trimmed);
  if (!parts) {
    return { valid: false, reason: 'Invalid email structure' };
  }
  const { local, domain } = parts;

  if (local.length === 0) {
    return { valid: false, reason: 'Local part is empty' };
  }
  if (local.length > LOCAL_MAX) {
    return { valid: false, reason: `Local part exceeds ${LOCAL_MAX} characters` };
  }
  if (local.startsWith('.')) {
    return { valid: false, reason: 'Local part cannot start with a dot' };
  }
  if (local.endsWith('.')) {
    return { valid: false, reason: 'Local part cannot end with a dot' };
  }
  if (local.includes('..')) {
    return { valid: false, reason: 'Local part cannot contain consecutive dots' };
  }
  if (!LOCAL_VALID_RE.test(local)) {
    return { valid: false, reason: 'Local part contains invalid characters' };
  }

  if (!domain || domain.length === 0) {
    return { valid: false, reason: 'Domain is empty' };
  }
  if (domain.length > DOMAIN_MAX) {
    return { valid: false, reason: `Domain exceeds ${DOMAIN_MAX} characters` };
  }
  const labels = domain.split('.');
  if (labels.length < 2) {
    return { valid: false, reason: 'Domain must have at least one dot' };
  }
  for (const label of labels) {
    if (!label) {
      return { valid: false, reason: 'Domain contains empty label (consecutive dots or leading/trailing dot)' };
    }
    if (!DOMAIN_LABEL_RE.test(label)) {
      return { valid: false, reason: `Invalid domain label: "${label}"` };
    }
  }
  const tld = labels[labels.length - 1];
  if (!TLD_RE.test(tld)) {
    return { valid: false, reason: `Invalid TLD: "${tld}"` };
  }

  const normalized = normalizeEmail(trimmed);
  return { valid: true, normalized: normalized ?? trimmed };
}

export function isDisposable(email: string): boolean {
  const domain = getDomain(email);
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase());
}

export function isFreeProvider(email: string): boolean {
  const domain = getDomain(email);
  if (!domain) return false;
  return FREE_PROVIDER_SET.has(domain.toLowerCase());
}

export function isCorporate(email: string): boolean {
  if (!isValidEmail(email)) return false;
  if (isDisposable(email)) return false;
  if (isFreeProvider(email)) return false;
  return true;
}

export function isRole(email: string): boolean {
  const local = getLocal(email);
  if (!local) return false;
  // Strip + alias before checking
  const stripped = local.split('+')[0].toLowerCase();
  return ROLE_ACCOUNTS.has(stripped);
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

export function parseEmail(input: string): ParsedEmail | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();

  let displayName: string | undefined;
  let emailStr: string;

  // Try "Display Name <email@domain>" format
  const angleMatch = trimmed.match(/^([^<]*)<([^>]+)>$/);
  if (angleMatch) {
    const rawName = angleMatch[1].trim().replace(/^["']|["']$/g, '');
    displayName = rawName.length > 0 ? rawName : undefined;
    emailStr = angleMatch[2].trim();
  } else {
    emailStr = trimmed;
  }

  if (!isValidEmail(emailStr)) return null;

  const parts = splitAtSign(emailStr);
  if (!parts) return null;
  const { local, domain } = parts;

  const domainLabels = domain.split('.');
  const tld = domainLabels[domainLabels.length - 1];

  let subdomain: string | undefined;
  if (domainLabels.length > 2) {
    subdomain = domainLabels.slice(0, domainLabels.length - 2).join('.');
  }

  return {
    local,
    domain,
    tld,
    subdomain,
    displayName,
    raw: input,
  };
}

export function extractEmails(text: string): string[] {
  if (typeof text !== 'string') return [];
  const matches = text.match(EMAIL_EXTRACT_RE) || [];
  // Filter to only truly valid emails
  return matches.filter(isValidEmail);
}

export function parseEmailList(list: string): string[] {
  if (typeof list !== 'string') return [];
  return list
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .filter(isValidEmail);
}

export function getLocal(email: string): string | null {
  if (typeof email !== 'string') return null;
  const parts = splitAtSign(email.trim());
  return parts ? parts.local : null;
}

export function getDomain(email: string): string | null {
  if (typeof email !== 'string') return null;
  const parts = splitAtSign(email.trim());
  return parts ? parts.domain : null;
}

export function getDomainFromEmail(email: string): string | null {
  return getDomain(email);
}

export function getTLD(email: string): string | null {
  const domain = getDomain(email);
  if (!domain) return null;
  const labels = domain.split('.');
  return labels[labels.length - 1] || null;
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com']);
const ICLOUD_DOMAINS = new Set(['icloud.com', 'me.com', 'mac.com']);

export function normalizeEmail(email: string): string | null {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  if (!isValidEmail(trimmed)) return null;

  const parts = splitAtSign(trimmed);
  if (!parts) return null;
  let { local, domain } = parts;

  // Normalize Googlemail -> gmail.com
  if (domain === 'googlemail.com') {
    domain = 'gmail.com';
  }

  // Normalize iCloud variants
  if (ICLOUD_DOMAINS.has(domain)) {
    domain = 'icloud.com';
  }

  // Gmail-specific normalization
  if (GMAIL_DOMAINS.has(domain)) {
    // Strip + alias
    local = local.split('+')[0];
    // Strip dots
    local = local.replace(/\./g, '');
  } else {
    // For all other providers: strip + alias only
    local = local.split('+')[0];
  }

  if (local.length === 0) return null;

  return `${local}@${domain}`;
}

export function normalizeEmailLoose(email: string): string | null {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  if (!isValidEmail(trimmed)) return null;
  return trimmed;
}

export function stripAlias(email: string): string | null {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  const parts = splitAtSign(trimmed);
  if (!parts) return null;
  const local = parts.local.split('+')[0];
  if (local.length === 0) return null;
  return `${local}@${parts.domain}`;
}

export function areEquivalent(a: string, b: string): boolean {
  const na = normalizeEmail(a);
  const nb = normalizeEmail(b);
  if (na === null || nb === null) return false;
  return na === nb;
}

export function formatEmail(local: string, domain: string): string {
  return `${local}@${domain}`;
}

// ---------------------------------------------------------------------------
// Generation (for testing)
// ---------------------------------------------------------------------------

const DEFAULT_TEST_TLDS = ['com', 'org', 'net', 'io', 'co'];

export function generateEmail(options?: { domain?: string; tld?: string; localLength?: number }): string {
  const localLen = options?.localLength ?? 6 + Math.floor(Math.random() * 6);
  const local = randChar(ALPHA_CHARS) + randStr(ALNUM_CHARS, Math.max(1, localLen - 1));

  let domain: string;
  if (options?.domain) {
    domain = options.domain;
  } else {
    const tld = options?.tld ?? DEFAULT_TEST_TLDS[Math.floor(Math.random() * DEFAULT_TEST_TLDS.length)];
    const domainName = randChar(ALPHA_CHARS) + randStr(ALNUM_CHARS, 4 + Math.floor(Math.random() * 5));
    domain = `${domainName}.${tld}`;
  }

  return `${local}@${domain}`;
}

export function generateEmailList(count: number, domain?: string): string[] {
  const emails: string[] = [];
  for (let i = 0; i < count; i++) {
    emails.push(generateEmail({ domain }));
  }
  return emails;
}

// ---------------------------------------------------------------------------
// Domain utilities
// ---------------------------------------------------------------------------

export function getProviderType(email: string): 'corporate' | 'free' | 'disposable' | 'role' | 'unknown' {
  if (!isValidEmail(email)) return 'unknown';
  if (isDisposable(email)) return 'disposable';
  if (isRole(email)) return 'role';
  if (isFreeProvider(email)) return 'free';
  if (isCorporate(email)) return 'corporate';
  return 'unknown';
}

// ---------------------------------------------------------------------------
// Obfuscation
// ---------------------------------------------------------------------------

export function obfuscateEmail(email: string, visibleChars: number = 1): string {
  if (typeof email !== 'string') return email;
  const parts = splitAtSign(email.trim());
  if (!parts) return email;
  const { local, domain } = parts;

  const visible = local.slice(0, Math.max(0, visibleChars));
  const hidden = local.length > visibleChars ? '***' : '';
  return `${visible}${hidden}@${domain}`;
}

export function maskEmail(email: string): string {
  if (typeof email !== 'string') return email;
  const parts = splitAtSign(email.trim());
  if (!parts) return email;
  const { local, domain } = parts;

  // Mask local: show first 2 chars, replace rest with *
  const localMasked =
    local.length <= 2
      ? local
      : local.slice(0, 2) + '*'.repeat(Math.min(local.length - 2, 4));

  // Mask domain: show first 2 chars of domain name, mask middle, show TLD
  const dotIdx = domain.lastIndexOf('.');
  if (dotIdx <= 0) return `${localMasked}@${domain}`;
  const domainName = domain.slice(0, dotIdx);
  const tld = domain.slice(dotIdx); // includes the dot
  const domainMasked =
    domainName.length <= 2
      ? domainName
      : domainName.slice(0, 2) + '*'.repeat(Math.min(domainName.length - 2, 5));

  return `${localMasked}@${domainMasked}${tld}`;
}
