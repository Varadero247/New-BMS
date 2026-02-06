import path from 'path';
import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_BY_TYPE,
  getAllAllowedMimeTypes,
  ALLOWED_EXTENSIONS,
  EXTENSION_TO_MIME,
  DANGEROUS_SIGNATURES,
  DANGEROUS_FILENAME_PATTERNS,
} from './config';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  details?: {
    field: string;
    issue: string;
  };
}

export interface FileInfo {
  originalName: string;
  mimeType: string;
  size: number;
  buffer?: Buffer;
}

/**
 * Validate file size
 */
export function validateFileSize(
  size: number,
  mimeType?: string
): FileValidationResult {
  const maxSize = mimeType && MAX_FILE_SIZE_BY_TYPE[mimeType]
    ? MAX_FILE_SIZE_BY_TYPE[mimeType]
    : MAX_FILE_SIZE;

  if (size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds maximum allowed (${maxMB}MB)`,
      details: { field: 'size', issue: `${size} > ${maxSize}` },
    };
  }

  if (size === 0) {
    return {
      valid: false,
      error: 'File is empty',
      details: { field: 'size', issue: 'size is 0' },
    };
  }

  return { valid: true };
}

/**
 * Validate MIME type against whitelist
 */
export function validateMimeType(mimeType: string): FileValidationResult {
  const allowedTypes = getAllAllowedMimeTypes();

  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `File type '${mimeType}' is not allowed`,
      details: { field: 'mimeType', issue: 'not in whitelist' },
    };
  }

  return { valid: true };
}

/**
 * Validate file extension
 */
export function validateExtension(filename: string): FileValidationResult {
  const ext = path.extname(filename).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File extension '${ext}' is not allowed`,
      details: { field: 'extension', issue: 'not in whitelist' },
    };
  }

  return { valid: true };
}

/**
 * Validate that extension matches MIME type
 */
export function validateExtensionMimeMatch(
  filename: string,
  mimeType: string
): FileValidationResult {
  const ext = path.extname(filename).toLowerCase();
  const expectedMime = EXTENSION_TO_MIME[ext];

  if (expectedMime && expectedMime !== mimeType) {
    return {
      valid: false,
      error: `File extension does not match content type`,
      details: { field: 'mimeMatch', issue: `${ext} expects ${expectedMime}, got ${mimeType}` },
    };
  }

  return { valid: true };
}

/**
 * Validate filename for dangerous patterns
 */
export function validateFilename(filename: string): FileValidationResult {
  // Check for null bytes (used to bypass filters)
  if (filename.includes('\0')) {
    return {
      valid: false,
      error: 'Filename contains invalid characters',
      details: { field: 'filename', issue: 'null byte detected' },
    };
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_FILENAME_PATTERNS) {
    if (pattern.test(filename)) {
      return {
        valid: false,
        error: 'Filename contains dangerous pattern',
        details: { field: 'filename', issue: `matches ${pattern.toString()}` },
      };
    }
  }

  // Check for overly long filenames
  if (filename.length > 255) {
    return {
      valid: false,
      error: 'Filename is too long',
      details: { field: 'filename', issue: 'exceeds 255 characters' },
    };
  }

  return { valid: true };
}

/**
 * Validate file content for dangerous signatures (magic bytes)
 */
export function validateFileContent(buffer: Buffer): FileValidationResult {
  if (buffer.length < 4) {
    return { valid: true }; // Too small to detect
  }

  for (const { signature, description } of DANGEROUS_SIGNATURES) {
    let matches = true;
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return {
        valid: false,
        error: `File appears to be an executable: ${description}`,
        details: { field: 'content', issue: description },
      };
    }
  }

  return { valid: true };
}

/**
 * Comprehensive file validation
 */
export function validateFile(file: FileInfo): FileValidationResult {
  // 1. Validate filename
  const filenameResult = validateFilename(file.originalName);
  if (!filenameResult.valid) return filenameResult;

  // 2. Validate extension
  const extensionResult = validateExtension(file.originalName);
  if (!extensionResult.valid) return extensionResult;

  // 3. Validate MIME type
  const mimeResult = validateMimeType(file.mimeType);
  if (!mimeResult.valid) return mimeResult;

  // 4. Validate extension matches MIME type
  const matchResult = validateExtensionMimeMatch(file.originalName, file.mimeType);
  if (!matchResult.valid) return matchResult;

  // 5. Validate file size
  const sizeResult = validateFileSize(file.size, file.mimeType);
  if (!sizeResult.valid) return sizeResult;

  // 6. Validate file content if buffer is available
  if (file.buffer) {
    const contentResult = validateFileContent(file.buffer);
    if (!contentResult.valid) return contentResult;
  }

  return { valid: true };
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal
  let safe = filename.replace(/\.\./g, '');
  safe = safe.replace(/[\/\\]/g, '');

  // Remove null bytes
  safe = safe.replace(/\0/g, '');

  // Keep only safe characters (alphanumeric, dots, hyphens, underscores)
  safe = safe.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Limit length while preserving extension
  if (safe.length > 200) {
    const ext = path.extname(safe);
    safe = safe.slice(0, 200 - ext.length) + ext;
  }

  return safe;
}
