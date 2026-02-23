// Sanitization utilities
export {
  sanitizeString,
  sanitizeHtml,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeFilename,
  sanitizeObject,
  containsXss,
  containsSqlInjection,
} from './sanitize';
export type { SanitizeStringOptions, SanitizeHtmlOptions } from './sanitize';

// Express middleware
export {
  sanitizeMiddleware,
  validateMiddleware,
  validateFieldsMiddleware,
  sanitizeQueryMiddleware,
  formatZodErrors,
  type SanitizeMiddlewareOptions,
  type ValidateMiddlewareOptions,
} from './middleware';

// Zod schemas
export {
  sanitizedString,
  emailSchema,
  passwordSchema,
  idSchema,
  phoneSchema,
  urlSchema,
  dateSchema,
  paginationSchema,
  searchQuerySchema,
  riskSchema,
  incidentSchema,
  registrationSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  searchSchema,
  type PaginationInput,
  type RiskInput,
  type IncidentInput,
  type RegistrationInput,
  type LoginInput,
  type UpdateProfileInput,
  type ChangePasswordInput,
  type SearchInput,
  type SearchQuery,
} from './schemas';

// Re-export Zod for convenience
export { z } from 'zod';
