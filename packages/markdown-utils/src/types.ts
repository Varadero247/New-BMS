// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** A heading extracted from a Markdown document. */
export interface MarkdownHeading {
  /** Heading level 1–6. */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** Plain text content of the heading. */
  text: string;
  /** URL-safe slug derived from the heading text. */
  id: string;
}

/** A hyperlink or image link extracted from Markdown. */
export interface MarkdownLink {
  /** Display text (alt text for images). */
  text: string;
  /** Destination URL. */
  url: string;
  /** True when the link is an image (`![alt](url)`). */
  isImage: boolean;
}

/** A fenced code block extracted from Markdown. */
export interface MarkdownCodeBlock {
  /** Language hint from the opening fence (may be empty string). */
  language: string;
  /** Raw code content, without the surrounding fences. */
  code: string;
}

/** A GFM-style table extracted from Markdown. */
export interface MarkdownTable {
  /** Column header cells. */
  headers: string[];
  /** Data rows, each an array of cell strings. */
  rows: string[][];
}

/** Aggregate statistics for a Markdown document. */
export interface MarkdownStats {
  wordCount: number;
  charCount: number;
  headingCount: number;
  linkCount: number;
  imageCount: number;
  codeBlockCount: number;
  /** Estimated reading time in whole minutes (minimum 1). */
  readingTimeMinutes: number;
}

/** Options controlling HTML output from `toHtml`. */
export interface ToHtmlOptions {
  /**
   * When true a full `<html>…<body>` wrapper is emitted.
   * Default: false.
   */
  fullDocument?: boolean;
  /**
   * Page title inserted into `<title>` when `fullDocument` is true.
   * Default: "Document".
   */
  title?: string;
  /**
   * When true heading `id` attributes are added.
   * Default: true.
   */
  addHeadingIds?: boolean;
}

/** A plain key/value map representing YAML-like front-matter fields. */
export type FrontMatter = Record<string, string | number | boolean | string[]>;
