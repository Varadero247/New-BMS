// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ─── Bitmask Permissions ─────────────────────────────────────────────────────

/**
 * Creates a bitmask permission map from an array of flag names.
 * Each flag gets a unique power-of-2 bit value: READ=1, WRITE=2, DELETE=4, ...
 */
export function createPermissions(flags: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (let i = 0; i < flags.length; i++) {
    result[flags[i]] = 1 << i;
  }
  return result;
}

/** Grant a permission bit to an existing mask. */
export function grant(mask: number, permission: number): number {
  return mask | permission;
}

/** Revoke a permission bit from an existing mask. */
export function revoke(mask: number, permission: number): number {
  return mask & ~permission;
}

/** Check whether a mask has a specific permission bit. */
export function has(mask: number, permission: number): boolean {
  if (permission === 0) return true;
  return (mask & permission) === permission;
}

/** Check whether a mask has ALL of the given permission bits. */
export function hasAll(mask: number, permissions: number[]): boolean {
  for (const p of permissions) {
    if (!has(mask, p)) return false;
  }
  return true;
}

/** Check whether a mask has ANY of the given permission bits. */
export function hasAny(mask: number, permissions: number[]): boolean {
  for (const p of permissions) {
    if (has(mask, p)) return true;
  }
  return false;
}

/** Combine multiple masks with bitwise OR. */
export function combine(...masks: number[]): number {
  return masks.reduce((acc, m) => acc | m, 0);
}

/** Intersect multiple masks with bitwise AND. */
export function intersection(...masks: number[]): number {
  if (masks.length === 0) return 0;
  return masks.reduce((acc, m) => acc & m);
}

/**
 * Convert a numeric mask to a list of permission names whose bits are set.
 * Only names whose corresponding bit is set AND whose permission value is non-zero are included.
 */
export function toList(mask: number, permissions: Record<string, number>): string[] {
  return Object.entries(permissions)
    .filter(([, bit]) => bit !== 0 && (mask & bit) === bit)
    .map(([name]) => name);
}

/** Convert a list of permission names to a combined numeric mask. */
export function fromList(permissions: string[], permMap: Record<string, number>): number {
  let mask = 0;
  for (const name of permissions) {
    if (permMap[name] !== undefined) {
      mask |= permMap[name];
    }
  }
  return mask;
}

// ─── Role-Based Access ────────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  permissions: number;
}

export interface User {
  id: string;
  roles: string[];
}

/** Create a Role object. */
export function createRole(id: string, name: string, permissions: number): Role {
  return { id, name, permissions };
}

/** Get combined permission mask for all of a user's roles. */
export function getUserPermissions(user: User, roles: Role[]): number {
  const roleMap: Record<string, Role> = {};
  for (const role of roles) {
    roleMap[role.id] = role;
  }
  let mask = 0;
  for (const roleId of user.roles) {
    if (roleMap[roleId]) {
      mask |= roleMap[roleId].permissions;
    }
  }
  return mask;
}

/** Check whether a user (via their roles) has a specific permission. */
export function canUser(user: User, permission: number, roles: Role[]): boolean {
  const mask = getUserPermissions(user, roles);
  return has(mask, permission);
}

/** Return a new User with the given roleId added (no duplicates). */
export function addRole(user: User, roleId: string): User {
  if (user.roles.includes(roleId)) return { ...user };
  return { ...user, roles: [...user.roles, roleId] };
}

/** Return a new User with the given roleId removed. */
export function removeRole(user: User, roleId: string): User {
  return { ...user, roles: user.roles.filter((r) => r !== roleId) };
}

/** Check whether a user has a specific role by id. */
export function hasRole(user: User, roleId: string): boolean {
  return user.roles.includes(roleId);
}

// ─── Policy-Based Access ──────────────────────────────────────────────────────

export interface Policy {
  resource: string;
  action: string;
  allow: boolean;
}

/** Create a Policy object. */
export function createPolicy(resource: string, action: string, allow: boolean): Policy {
  return { resource, action, allow };
}

/**
 * Evaluate a set of policies for a resource+action pair.
 * Returns true if at least one matching policy allows AND no matching policy denies.
 * Deny overrides allow.
 */
export function evaluate(policies: Policy[], resource: string, action: string): boolean {
  const matching = policies.filter((p) => p.resource === resource && p.action === action);
  if (matching.length === 0) return false;
  const anyDeny = matching.some((p) => !p.allow);
  if (anyDeny) return false;
  return matching.some((p) => p.allow);
}

// ─── JWT-Like Claims ──────────────────────────────────────────────────────────

/** Encode a claims object as a base64 JSON string. */
export function encodeClaims(claims: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(claims)).toString("base64");
}

/** Decode a base64 claims token back to an object, or null on failure. */
export function decodeClaims(token: string): Record<string, unknown> | null {
  try {
    const json = Buffer.from(token, "base64").toString("utf8");
    const parsed = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Check whether a decoded claims token has a specific key,
 * and optionally that the key's value equals a given value.
 */
export function hasClaim(token: string, key: string, value?: unknown): boolean {
  const claims = decodeClaims(token);
  if (!claims) return false;
  if (!(key in claims)) return false;
  if (value !== undefined) return claims[key] === value;
  return true;
}
