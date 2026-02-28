import { PhishingCheckResult, URLReputationResult, EmailAuthResult } from './types';

export class PhishingProtectionService {
  private readonly KNOWN_PHISHING_PATTERNS = [
    /nexara-verify/i, /nexara-security/i, /nexara-alert/i, /verify-nexara/i,
    /secure-nexara/i, /nexara\.login/i, /account-verify/i, /login-verify/i,
  ];

  private readonly SAFE_DOMAINS = new Set(['nexara.com', 'nexara.co.uk', 'nexara.ae', 'ims.nexara.com']);

  private readonly LOOKALIKE_CHARS: Record<string, string[]> = {
    'a': ['а', 'ɑ', 'α'],
    'e': ['е', 'ε', 'ё'],
    'o': ['о', 'ο', 'ο'],
    'i': ['і', 'ı', 'ï'],
    'n': ['ñ', 'ń', 'ŋ'],
    'x': ['х', 'χ'],
  };

  detectDomainSpoofing(url: string, legitimateDomain: string): PhishingCheckResult {
    const threats: string[] = [];
    let riskScore = 0;
    let hostname: string;

    try {
      hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    } catch {
      return { isSuspicious: true, threats: ['Invalid URL format'], riskScore: 50 };
    }

    // HTTP (not HTTPS) is always suspicious — check before domain match
    if (url.startsWith('http://')) {
      return { isSuspicious: true, threats: ['URL uses HTTP (not HTTPS) — insecure'], riskScore: 30 };
    }

    // Check if it IS the legitimate domain
    if (hostname === legitimateDomain || hostname.endsWith(`.${legitimateDomain}`)) {
      return { isSuspicious: false, threats: [], riskScore: 0 };
    }

    // Check known phishing patterns
    for (const pattern of this.KNOWN_PHISHING_PATTERNS) {
      if (pattern.test(hostname)) {
        threats.push(`Known phishing pattern: ${hostname}`);
        riskScore += 80;
      }
    }

    // Check lookalike characters (homograph attack)
    const legitNorm = this.normalise(legitimateDomain);
    const hostNorm = this.normalise(hostname);
    if (hostNorm === legitNorm && hostname !== legitimateDomain) {
      threats.push(`Homograph attack: ${hostname} looks like ${legitimateDomain}`);
      riskScore += 90;
    }

    // Detect typosquatting (Levenshtein distance = 1 or 2)
    const distance = this.levenshtein(hostname.replace(/\.(com|co\.uk|ae|net|org)$/, ''), legitimateDomain.replace(/\.(com|co\.uk|ae|net|org)$/, ''));
    if (distance > 0 && distance <= 2) {
      threats.push(`Typosquatting: "${hostname}" is suspiciously similar to "${legitimateDomain}" (distance: ${distance})`);
      riskScore += 60;
    }

    // Detect subdomain tricks (e.g. nexara.com.evil.com)
    if (hostname.includes(legitimateDomain) && hostname !== legitimateDomain) {
      threats.push(`Subdomain trick: "${hostname}" contains "${legitimateDomain}" but is not it`);
      riskScore += 70;
    }

    return {
      isSuspicious: threats.length > 0,
      threats,
      riskScore: Math.min(100, riskScore),
    };
  }

  checkURLReputation(url: string): URLReputationResult {
    const reasons: string[] = [];
    let isPhishing = false;

    for (const pattern of this.KNOWN_PHISHING_PATTERNS) {
      if (pattern.test(url)) {
        reasons.push(`Matches phishing pattern: ${pattern.source}`);
        isPhishing = true;
      }
    }

    const isSpoofed = this.detectDomainSpoofing(url, 'nexara.com').isSuspicious;
    const hasValidSSL = url.startsWith('https://');

    if (!hasValidSSL) reasons.push('No HTTPS');

    return { isPhishing, isSpoofed, hasValidSSL, reasons };
  }

  verifyEmailAuthentication(headers: Record<string, string>): EmailAuthResult {
    const spfValid = headers['spf'] === 'pass' || headers['received-spf']?.includes('pass') || false;
    const dkimValid = headers['dkim-signature'] !== undefined || headers['dkim'] === 'pass' || false;
    const dmarcValid = headers['dmarc'] === 'pass' || headers['arc-authentication-results']?.includes('dmarc=pass') || false;

    return {
      spfValid,
      dkimValid,
      dmarcValid,
      isAuthentic: spfValid && dkimValid && dmarcValid,
    };
  }

  private normalise(domain: string): string {
    let result = domain.toLowerCase();
    for (const [char, lookalikes] of Object.entries(this.LOOKALIKE_CHARS)) {
      for (const lookalike of lookalikes) {
        result = result.split(lookalike).join(char);
      }
    }
    return result;
  }

  private levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
      Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }

  isKnownSafeDomain(url: string): boolean {
    try {
      const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return this.SAFE_DOMAINS.has(hostname);
    } catch {
      return false;
    }
  }
}
