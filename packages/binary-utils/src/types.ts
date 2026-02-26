// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * A numeric bit field value. Bits are indexed from 0 (LSB) to 31 (MSB).
 */
export type BitField = number;

/**
 * Byte order for multi-byte integer reads/writes.
 */
export type ByteOrder = 'big-endian' | 'little-endian';

/**
 * A packed struct descriptor: maps field names to their bit offset and width.
 */
export interface PackedStruct {
  /** Field name → [bitOffset, bitWidth] */
  fields: Record<string, [offset: number, width: number]>;
  /** Total width of the struct in bits (up to 32) */
  totalBits: number;
}

/**
 * Describes the differences between two Buffers at the byte level.
 */
export interface BinaryDiff {
  /** Byte offset where the two buffers differ */
  offset: number;
  /** Byte value in buffer `a` */
  aValue: number;
  /** Byte value in buffer `b` */
  bValue: number;
}

/**
 * Options for mask-based bit operations.
 */
export interface MaskOptions {
  /** Bit mask to apply */
  mask: number;
  /** Whether to invert the mask before applying */
  invert?: boolean;
  /** Bit-shift amount to apply after masking */
  shift?: number;
}
