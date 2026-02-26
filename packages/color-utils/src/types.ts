// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface RGB { r: number; g: number; b: number; }
export interface RGBA extends RGB { a: number; }
export interface HSL { h: number; s: number; l: number; }
export interface HSV { h: number; s: number; v: number; }
export type HexColor = string; // e.g. '#ff0000' or '#f00'
