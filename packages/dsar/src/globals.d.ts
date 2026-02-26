// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
declare module 'uuid' {
  export function v4(): string;
  export function v5(name: string, namespace: string | Uint8Array): string;
}
