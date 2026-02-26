// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * Represents a parsed file path, mirroring Node.js path.ParsedPath.
 */
export interface ParsedPath {
  /** The root of the path, e.g. '/' or 'C:\\' */
  root: string;
  /** The directory portion, e.g. '/home/user' */
  dir: string;
  /** The filename including extension, e.g. 'file.txt' */
  base: string;
  /** The filename without extension, e.g. 'file' */
  name: string;
  /** The extension including leading dot, e.g. '.txt' */
  ext: string;
}

/**
 * Options for glob matching behaviour.
 */
export interface GlobOptions {
  /** Whether matching is case-insensitive. Defaults to false. */
  caseInsensitive?: boolean;
  /** Whether to match dot-files with wildcards. Defaults to false. */
  dot?: boolean;
}

/**
 * A split representation of a file path into its non-empty segments.
 */
export interface PathSegments {
  /** The original path string */
  original: string;
  /** Array of non-empty path segments */
  parts: string[];
  /** Whether the path is absolute */
  absolute: boolean;
}

/**
 * Decomposed parts of a URL string.
 */
export interface UrlParts {
  /** The URL protocol including colon, e.g. 'https:' or empty string */
  protocol: string;
  /** The host (hostname + optional port), e.g. 'example.com:8080' */
  host: string;
  /** The port number as string, or empty string if not present */
  port: string;
  /** The path portion of the URL, e.g. '/api/v1/users' */
  pathname: string;
  /** The raw query string including leading '?', or empty string */
  search: string;
  /** The hash fragment including leading '#', or empty string */
  hash: string;
}

/**
 * Options for computing relative paths.
 */
export interface RelativePathOptions {
  /** If true, always use POSIX-style forward slashes in output. Defaults to true. */
  posix?: boolean;
  /** If true, prepend './' to relative paths that do not start with '../'. Defaults to false. */
  explicitRelative?: boolean;
}
