// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { z } from 'zod';
import validator from 'validator';
import { sanitizeString, sanitizeEmail } from './sanitize';

/**
 * Custom Zod preprocessor for sanitizing strings
 */
export const sanitizedString = () =>
  z.preprocess((val) => (typeof val === 'string' ? sanitizeString(val) : val), z.string());

/**
 * Email schema with sanitization
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .transform((val) => sanitizeEmail(val))
  .refine((val) => val.length > 0, 'Invalid email address');

/**
 * Password schema with strength requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .refine((val) => /[A-Z]/.test(val), 'Password must contain at least one uppercase letter')
  .refine((val) => /[a-z]/.test(val), 'Password must contain at least one lowercase letter')
  .refine((val) => /[0-9]/.test(val), 'Password must contain at least one number')
  .refine(
    (val) => /[^A-Za-z0-9]/.test(val),
    'Password must contain at least one special character'
  );

/**
 * UUID/CUID schema
 */
export const idSchema = z
  .string()
  .min(1, 'ID is required')
  .refine((val) => validator.isUUID(val) || /^c[a-z0-9]{24}$/.test(val), 'Invalid ID format');

/**
 * Phone number schema
 */
export const phoneSchema = z
  .string()
  .optional()
  .refine((val) => !val || validator.isMobilePhone(val, 'any'), 'Invalid phone number');

/**
 * URL schema with sanitization
 */
export const urlSchema = z
  .string()
  .url('Invalid URL')
  .refine(
    (val) => !val.startsWith('javascript:') && !val.startsWith('data:'),
    'Invalid URL protocol'
  );

/**
 * Date string schema (ISO format)
 */
export const dateSchema = z
  .string()
  .refine((val) => validator.isISO8601(val), 'Invalid date format')
  .transform((val) => new Date(val));

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, 'Page must be positive'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(parseInt(val, 10), 100) : 20))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Search query validation schema
 * Validates and sanitises the ?q= / ?search= query parameter.
 * Both fields are optional; either can be used as the search term.
 * Inputs are HTML-stripped by sanitizedString() before the max-length
 * and trim constraints are applied.
 */
export const searchQuerySchema = z.object({
  q: sanitizedString()
    .pipe(z.string().max(200).trim())
    .optional(),
  search: sanitizedString()
    .pipe(z.string().max(200).trim())
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * Common risk schema
 */
export const riskSchema = z.object({
  title: sanitizedString().pipe(z.string().min(3, 'Title must be at least 3 characters').max(200)),
  description: sanitizedString().pipe(z.string().max(5000).optional()),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  likelihood: z.enum(['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'ALMOST_CERTAIN']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'MITIGATED', 'CLOSED']).optional(),
  category: sanitizedString().pipe(z.string().max(100).optional()),
  mitigation: sanitizedString().pipe(z.string().max(5000).optional()),
  assigneeId: idSchema.optional(),
  dueDate: dateSchema.optional(),
});

/**
 * Incident schema
 */
export const incidentSchema = z.object({
  title: sanitizedString().pipe(z.string().min(3, 'Title must be at least 3 characters').max(200)),
  description: sanitizedString().pipe(z.string().max(10000)),
  type: z.enum(['ACCIDENT', 'NEAR_MISS', 'HAZARD', 'ENVIRONMENTAL', 'QUALITY']),
  severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']),
  status: z.enum(['REPORTED', 'INVESTIGATING', 'RESOLVED', 'CLOSED']).optional(),
  location: sanitizedString().pipe(z.string().max(200).optional()),
  occurredAt: dateSchema,
  reportedById: idSchema.optional(),
});

/**
 * User registration schema
 */
export const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: sanitizedString().pipe(z.string().min(2, 'Name must be at least 2 characters').max(100)),
  role: z.enum(['ADMIN', 'MANAGER', 'USER', 'VIEWER']).optional(),
});

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  name: sanitizedString().pipe(z.string().min(2).max(100)).optional(),
  phone: phoneSchema,
  department: sanitizedString().pipe(z.string().max(100).optional()),
  title: sanitizedString().pipe(z.string().max(100).optional()),
});

/**
 * Change password schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Search schema
 */
export const searchSchema = z.object({
  q: sanitizedString().pipe(z.string().min(1).max(200)),
  type: z.enum(['all', 'risks', 'incidents', 'documents', 'users']).optional(),
  ...paginationSchema.shape,
});

// Type exports
export type PaginationInput = z.infer<typeof paginationSchema>;
export type RiskInput = z.infer<typeof riskSchema>;
export type IncidentInput = z.infer<typeof incidentSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
