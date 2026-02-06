/**
 * File upload security configuration
 */

// Maximum file size in bytes (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Maximum file size for specific types (can be larger for certain file types)
export const MAX_FILE_SIZE_BY_TYPE: Record<string, number> = {
  'application/pdf': 10 * 1024 * 1024, // 10MB for PDFs
  'image/jpeg': 5 * 1024 * 1024,
  'image/png': 5 * 1024 * 1024,
  'image/gif': 2 * 1024 * 1024,
  'application/msword': 10 * 1024 * 1024,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 10 * 1024 * 1024,
  'application/vnd.ms-excel': 10 * 1024 * 1024,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 10 * 1024 * 1024,
};

// Allowed MIME types (whitelist)
export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  // Images
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  // Documents
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
  // Archives
  archives: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ],
};

// Get all allowed MIME types as a flat array
export function getAllAllowedMimeTypes(): string[] {
  return Object.values(ALLOWED_MIME_TYPES).flat();
}

// Allowed file extensions (must match MIME type)
export const ALLOWED_EXTENSIONS: string[] = [
  // Images
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  // Documents
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv',
  // Archives
  '.zip', '.rar', '.7z',
];

// Extension to MIME type mapping
export const EXTENSION_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.zip': 'application/zip',
  '.rar': 'application/x-rar-compressed',
  '.7z': 'application/x-7z-compressed',
};

// Dangerous file signatures (magic bytes) to block
export const DANGEROUS_SIGNATURES = [
  // Executable files
  { signature: [0x4D, 0x5A], description: 'Windows Executable (MZ)' }, // .exe, .dll
  { signature: [0x7F, 0x45, 0x4C, 0x46], description: 'Linux Executable (ELF)' },
  // Scripts that could be executed
  { signature: [0x23, 0x21], description: 'Shebang script (#!)' }, // Shell scripts
];

// Patterns to detect in filenames
export const DANGEROUS_FILENAME_PATTERNS = [
  /\.exe$/i,
  /\.dll$/i,
  /\.bat$/i,
  /\.cmd$/i,
  /\.sh$/i,
  /\.ps1$/i,
  /\.vbs$/i,
  /\.js$/i,  // Blocking JS files for security
  /\.jar$/i,
  /\.php$/i,
  /\.asp$/i,
  /\.aspx$/i,
  /\.jsp$/i,
  /\.\./,     // Path traversal
  /^\.ht/,    // htaccess files
];
