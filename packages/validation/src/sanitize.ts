import validator from 'validator';

/**
 * Options for string sanitization
 */
export interface SanitizeStringOptions {
  /** Maximum length (default: 1000) */
  maxLength?: number;
  /** Trim whitespace (default: true) */
  trim?: boolean;
  /** Convert to lowercase (default: false) */
  lowercase?: boolean;
  /** Strip all HTML tags (default: true) */
  stripHtml?: boolean;
  /** Escape special HTML characters (default: true) */
  escapeHtml?: boolean;
  /** Remove null bytes (default: true) */
  removeNullBytes?: boolean;
}

/**
 * Options for HTML sanitization
 */
export interface SanitizeHtmlOptions {
  /** Allow specific tags (default: common safe tags) */
  allowedTags?: string[];
  /** Allow specific attributes (default: safe attributes) */
  allowedAttributes?: string[];
}

/**
 * Check for XSS patterns (creates new regex each time to avoid state issues)
 */
function getXssPatterns(): RegExp[] {
  return [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /expression\s*\(/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<form/gi,
  ];
}

/**
 * Check for SQL injection patterns (creates new regex each time to avoid state issues).
 *
 * NOTE: This is a defence-in-depth detection layer for logging/alerting.
 * The primary SQL injection protection is Prisma's parameterised queries —
 * no raw user input is ever interpolated into SQL strings.
 *
 * Patterns cover:
 *  - Classic keyword combos (SELECT … FROM, DROP TABLE, etc.)
 *  - Comment-based bypasses (-- and slash-star)
 *  - Stacked query separators (;)
 *  - Boolean/numeric tautologies (OR 1=1, OR '1'='1', OR 'a'='a')
 *  - UNION-based extraction
 *  - Blind time-delay (SLEEP, WAITFOR, BENCHMARK, PG_SLEEP)
 *  - Hex/char encoding probes (0x…, CHAR(…), CHR(…))
 *  - Inline comment obfuscation (e.g. SEL--ECT via slash-star injection)
 *  - MySQL-specific shortcuts (#, inline version comments)
 */
function getSqlInjectionPatterns(): RegExp[] {
  return [
    // SQL keywords combined with a clause — requires meaningful context (avoids flagging
    // natural English like "Select the best option")
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|TRUNCATE|EXEC|EXECUTE)\b.{0,50}\b(FROM|INTO|WHERE|TABLE|DATABASE|SCHEMA|SET)\b/gi,
    // Unconditional destructive without clause (DROP TABLE / DROP DATABASE)
    /\bDROP\s+(TABLE|DATABASE|SCHEMA|INDEX|VIEW|PROCEDURE|TRIGGER)\b/gi,
    // UNION SELECT in any form (with optional comments/whitespace between words)
    /UNION[\s/]*SELECT/gi,
    // Comment sequences used to terminate queries (after a quote)
    /['"`]\s*--/g,
    /['"`]\s*\/\*/g,
    // MySQL inline comment syntax used to hide keywords
    /\/\*![\s\S]*?\*\//g,
    // Stacked query: semicolon followed by a destructive keyword
    /;\s*(DROP|DELETE|TRUNCATE|INSERT|UPDATE|CREATE|ALTER|EXEC)\b/gi,
    // Boolean tautologies — single-quoted
    /'\s*OR\s*'[^']*'\s*=\s*'[^']*'?/gi,
    /'\s*OR\s+\d+\s*=\s*\d+/gi,
    // Boolean tautologies — double-quoted
    /"\s*OR\s*"[^"]*"\s*=\s*"[^"]*"?/gi,
    // Inline OR/AND tautologies after a closing quote
    /'\s*OR\s+TRUE\b/gi,
    /'\s*AND\s+FALSE\b/gi,
    // Time-based blind injection
    /\b(SLEEP|WAITFOR\s+DELAY|BENCHMARK|PG_SLEEP)\s*\(/gi,
    // Encoding / obfuscation probes
    /\b(CHAR|CHR|NCHAR)\s*\(\s*\d+/gi,
    /0x[0-9a-f]{6,}/gi,
  ];
}

// Default safe tags for HTML content
const DEFAULT_ALLOWED_TAGS = [
  'p',
  'br',
  'b',
  'i',
  'u',
  'strong',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'a',
  'blockquote',
  'code',
  'pre',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'div',
  'span',
];

// Default safe attributes
const DEFAULT_ALLOWED_ATTRS = ['href', 'title', 'alt', 'class', 'id'];

/**
 * Strip all HTML tags from a string
 */
function stripHtmlTags(input: string): string {
  // Remove script tags and their content first
  let result = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove style tags and their content
  result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  // Remove all other HTML tags
  result = result.replace(/<[^>]+>/g, '');
  // Decode common HTML entities
  result = result.replace(/&nbsp;/g, ' ');
  result = result.replace(/&amp;/g, '&');
  result = result.replace(/&lt;/g, '<');
  result = result.replace(/&gt;/g, '>');
  result = result.replace(/&quot;/g, '"');
  result = result.replace(/&#39;/g, "'");
  return result;
}

/**
 * Sanitize a plain text string
 * Removes XSS vectors and normalizes the string
 */
export function sanitizeString(input: unknown, options: SanitizeStringOptions = {}): string {
  const {
    maxLength = 1000,
    trim = true,
    lowercase = false,
    stripHtml = true,
    escapeHtml = true,
    removeNullBytes = true,
  } = options;

  // Handle non-string input
  if (input === null || input === undefined) {
    return '';
  }

  let result = String(input);

  // Remove null bytes (can be used to bypass filters)
  if (removeNullBytes) {
    result = result.replace(/\0/g, '');
  }

  // Strip HTML tags if requested
  if (stripHtml) {
    result = stripHtmlTags(result);
  }

  // Escape HTML entities if requested (and not already stripped)
  if (escapeHtml && !stripHtml) {
    result = validator.escape(result);
  }

  // Trim whitespace
  if (trim) {
    result = result.trim();
  }

  // Convert to lowercase
  if (lowercase) {
    result = result.toLowerCase();
  }

  // Enforce max length
  if (result.length > maxLength) {
    result = result.slice(0, maxLength);
  }

  return result;
}

/**
 * Sanitize HTML content allowing specific safe tags
 * Used for rich text input like descriptions
 */
export function sanitizeHtml(input: unknown, options: SanitizeHtmlOptions = {}): string {
  const { allowedTags = DEFAULT_ALLOWED_TAGS, allowedAttributes = DEFAULT_ALLOWED_ATTRS } = options;

  if (input === null || input === undefined) {
    return '';
  }

  let result = String(input);

  // Remove dangerous tags completely (with content)
  result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  result = result.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  result = result.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  result = result.replace(/<embed\b[^>]*>/gi, '');

  // Remove event handlers from all tags
  result = result.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  result = result.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '');

  // Remove javascript: and data: URLs
  result = result.replace(/javascript:[^"']*/gi, '');
  result = result.replace(/data:text\/html[^"']*/gi, '');

  // Build regex pattern for allowed tags
  const tagPattern = allowedTags.join('|');
  const allowedAttrsPattern = allowedAttributes.join('|');

  // Remove disallowed attributes from allowed tags
  result = result.replace(
    new RegExp(`(<(?:${tagPattern})\\s+)([^>]*)>`, 'gi'),
    (match, tagStart, attrs) => {
      // Filter attributes to only allowed ones
      const cleanAttrs = attrs
        .split(/\s+/)
        .filter((attr: string) => {
          const attrName = attr.split('=')[0].toLowerCase();
          return allowedAttributes.includes(attrName);
        })
        .join(' ');
      return `${tagStart}${cleanAttrs}>`;
    }
  );

  // Remove tags that are not in the allowed list (but keep content)
  const allTagsPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi;
  result = result.replace(allTagsPattern, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      return match;
    }
    return ''; // Remove the tag but keep what was between
  });

  return result;
}

/**
 * Sanitize an email address
 */
export function sanitizeEmail(input: unknown): string {
  if (!input) return '';

  let email = String(input).trim().toLowerCase();

  // Remove any HTML
  email = stripHtmlTags(email);

  // Normalize email
  email = validator.normalizeEmail(email) || '';

  return email;
}

/**
 * Sanitize a URL
 */
export function sanitizeUrl(input: unknown): string {
  if (!input) return '';

  let url = String(input).trim();

  // Remove any HTML
  url = stripHtmlTags(url);

  // Block dangerous protocols
  if (/^(javascript|vbscript|data|file):/i.test(url)) {
    return '';
  }

  return url;
}

/**
 * Check if string contains potential XSS attack patterns
 */
export function containsXss(input: string): boolean {
  return getXssPatterns().some((pattern) => pattern.test(input));
}

/**
 * Check if string contains potential SQL injection patterns
 */
export function containsSqlInjection(input: string): boolean {
  return getSqlInjectionPatterns().some((pattern) => pattern.test(input));
}

/**
 * Sanitize an object recursively
 * Applies sanitizeString to all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: SanitizeStringOptions = {}
): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result = { ...obj } as Record<string, unknown>;

  for (const key of Object.keys(result)) {
    const value = result[key];

    if (typeof value === 'string') {
      result[key] = sanitizeString(value, options);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === 'string') {
          return sanitizeString(item, options);
        } else if (typeof item === 'object' && item !== null) {
          return sanitizeObject(item as Record<string, unknown>, options);
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>, options);
    }
  }

  return result as T;
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
export function sanitizeFilename(input: unknown): string {
  if (!input) return '';

  let filename = String(input);

  // Remove path traversal
  filename = filename.replace(/\.\./g, '');
  filename = filename.replace(/[\/\\]/g, '');

  // Remove null bytes
  filename = filename.replace(/\0/g, '');

  // Keep only safe characters
  filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Limit length
  if (filename.length > 255) {
    const ext = filename.slice(filename.lastIndexOf('.'));
    filename = filename.slice(0, 255 - ext.length) + ext;
  }

  return filename;
}
