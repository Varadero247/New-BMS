// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export interface HtmlNode { tag: string; attrs: Record<string, string>; children: Array<HtmlNode | string>; }
export interface SanitizeOptions { allowedTags?: string[]; allowedAttrs?: Record<string, string[]>; stripComments?: boolean; }
export interface MetaTag { name: string; content: string; }
export interface HtmlStats { tagCount: number; textLength: number; linkCount: number; imageCount: number; headingCount: number; }
