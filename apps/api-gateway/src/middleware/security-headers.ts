// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import helmet from 'helmet';
import { RequestHandler } from 'express';

/**
 * Security headers configuration
 * Implements OWASP security headers best practices
 */

const isProduction = process.env.NODE_ENV === 'production';
// Disable strict headers only in local development and test runs.
// Staging / preview / CI integration envs still get security headers.
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

/**
 * Content Security Policy configuration
 * Restricts sources for scripts, styles, images, etc.
 */
const contentSecurityPolicy = {
  directives: {
    // Default: only allow resources from same origin
    defaultSrc: ["'self'"],

    // Scripts: same origin only; allow unsafe-inline/eval in local dev for hot-reload tooling
    scriptSrc: isDevelopment ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"] : ["'self'"],

    // Styles: same origin, allow inline for UI frameworks
    styleSrc: ["'self'", "'unsafe-inline'"],

    // Images: same origin + data URIs for embedded images
    imgSrc: ["'self'", 'data:', 'blob:'],

    // Fonts: same origin + Google Fonts
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],

    // Connect (XHR, WebSocket): same origin + API endpoints
    connectSrc: [
      "'self'",
      // Allow connections to configured origins and local services in development
      ...(isProduction
        ? process.env.CSP_CONNECT_SOURCES
          ? process.env.CSP_CONNECT_SOURCES.split(',').map((s) => s.trim())
          : []
        : process.env.CSP_CONNECT_SOURCES
          ? process.env.CSP_CONNECT_SOURCES.split(',').map((s) => s.trim())
          : [
              ...Array.from({ length: 25 }, (_, i) => `http://localhost:${4000 + i}`),
              'ws://localhost:*',
            ]),
    ],

    // Frame ancestors: prevent clickjacking
    frameAncestors: ["'none'"],

    // Form actions: only allow form submission to same origin
    formAction: ["'self'"],

    // Base URI: restrict base tag
    baseUri: ["'self'"],

    // Object sources: block plugins
    objectSrc: ["'none'"],

    // Upgrade insecure requests in production and staging (not local dev where HTTPS isn't set up)
    ...(isDevelopment ? {} : { upgradeInsecureRequests: [] }),

    // Block mixed content
    blockAllMixedContent: [],
  },
};

/**
 * Helmet configuration with all security headers
 */
export const securityHeaders: RequestHandler = helmet({
  // Content Security Policy — enabled in production and staging; disabled only in local dev
  contentSecurityPolicy: isDevelopment ? false : contentSecurityPolicy,

  // Cross-Origin-Embedder-Policy
  crossOriginEmbedderPolicy: false, // Disabled for compatibility with external resources

  // Cross-Origin-Opener-Policy
  crossOriginOpenerPolicy: { policy: 'same-origin' },

  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: { policy: 'cross-origin' },

  // DNS Prefetch Control - disable to prevent information leakage
  dnsPrefetchControl: { allow: false },

  // Expect-CT (Certificate Transparency) - deprecated but still useful
  // expectCt: false, // Removed in newer Helmet versions

  // Frameguard - prevent clickjacking
  frameguard: { action: 'deny' },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // HSTS - force HTTPS
  // Production: 1-year preload. Staging: 1-day (validates config). Development: disabled.
  hsts: isDevelopment
    ? false
    : isProduction
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : { maxAge: 86400, includeSubDomains: true, preload: false },

  // IE No Open - prevent IE from executing downloads
  ieNoOpen: true,

  // No Sniff - prevent MIME type sniffing
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Permitted Cross-Domain Policies
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },

  // Referrer Policy - control referrer information
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // X-XSS-Protection - legacy XSS protection (mostly for older browsers)
  xssFilter: true,
});

/**
 * Additional custom security headers
 */
export const additionalSecurityHeaders: RequestHandler = (req, res, next) => {
  // Permissions Policy (formerly Feature Policy)
  // Restrict browser features
  res.setHeader(
    'Permissions-Policy',
    [
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'battery=()',
      'camera=()',
      'cross-origin-isolated=()',
      'display-capture=()',
      'document-domain=()',
      'encrypted-media=()',
      'execution-while-not-rendered=()',
      'execution-while-out-of-viewport=()',
      'fullscreen=(self)',
      'geolocation=()',
      'gyroscope=()',
      'keyboard-map=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'navigation-override=()',
      'payment=()',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'sync-xhr=()',
      'usb=()',
      'web-share=()',
      'xr-spatial-tracking=()',
    ].join(', ')
  );

  // Cache Control for API responses
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }

  // X-Content-Type-Options is already set by helmet, but ensure it
  res.setHeader('X-Content-Type-Options', 'nosniff');

  next();
};

/**
 * Combined security middleware
 */
export function createSecurityMiddleware(): RequestHandler[] {
  return [securityHeaders, additionalSecurityHeaders];
}

export default securityHeaders;
