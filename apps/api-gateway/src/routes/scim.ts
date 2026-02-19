import { Router, Request, Response, NextFunction } from 'express';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('api-gateway:scim');
const router = Router();
// SCIM uses external IdP-assigned IDs (arbitrary strings, not UUIDs) — no UUID validation

// ─── Types ──────────────────────────────────────────────────────────────────

interface ScimUser {
  id: string;
  externalId?: string;
  userName: string;
  name: {
    formatted: string;
    givenName: string;
    familyName: string;
  };
  emails: Array<{ value: string; type: string; primary: boolean }>;
  active: boolean;
  displayName: string;
  title?: string;
  groups: Array<{ value: string; display: string }>;
  meta: {
    resourceType: 'User';
    created: string;
    lastModified: string;
    location: string;
  };
}

interface ScimGroup {
  id: string;
  displayName: string;
  members: Array<{ value: string; display: string }>;
  meta: {
    resourceType: 'Group';
    created: string;
    lastModified: string;
    location: string;
  };
}

interface ScimBearerToken {
  id: string;
  token: string;
  orgId: string;
  createdAt: string;
  active: boolean;
}

// ─── In-Memory Stores ───────────────────────────────────────────────────────

const MAX_SCIM_USERS = 10000;
const MAX_SCIM_GROUPS = 1000;

const scimUserStore = new Map<string, ScimUser>();
const scimGroupStore = new Map<string, ScimGroup>();
const scimTokenStore = new Map<string, ScimBearerToken>();
// Reverse index: token string -> token ID for O(1) auth lookups
const scimTokenByValue = new Map<string, string>();
// Reverse index: userName -> user ID for O(1) duplicate checks
const scimUserByUserName = new Map<string, string>();

// Seed default groups from Nexara roles
const defaultGroups: Array<{ id: string; name: string }> = [
  { id: 'role-admin', name: 'Admin' },
  { id: 'role-manager', name: 'Manager' },
  { id: 'role-auditor', name: 'Auditor' },
  { id: 'role-viewer', name: 'Viewer' },
  { id: 'role-operator', name: 'Operator' },
];

defaultGroups.forEach((g) => {
  scimGroupStore.set(g.id, {
    id: g.id,
    displayName: g.name,
    members: [],
    meta: {
      resourceType: 'Group',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      location: `/scim/v2/Groups/${g.id}`,
    },
  });
});

// Export for token management from admin routes
export function getScimTokenStore(): Map<string, ScimBearerToken> {
  return scimTokenStore;
}

/**
 * Register a SCIM token in both the main store and the reverse index.
 * Call this instead of directly setting on scimTokenStore when adding tokens externally.
 */
export function registerScimToken(token: ScimBearerToken): void {
  scimTokenStore.set(token.id, token);
  scimTokenByValue.set(token.token, token.id);
}

/**
 * Remove a SCIM token from both stores.
 */
export function removeScimToken(tokenId: string): void {
  const existing = scimTokenStore.get(tokenId);
  if (existing) {
    scimTokenByValue.delete(existing.token);
    scimTokenStore.delete(tokenId);
  }
}

// ─── Validation ─────────────────────────────────────────────────────────────

const createUserSchema = z.object({
  schemas: z.array(z.string().trim()).optional(),
  externalId: z.string().trim().optional(),
  userName: z.string().trim().min(1, 'userName is required'),
  name: z
    .object({
      formatted: z.string().trim().optional(),
      givenName: z.string().trim().optional().default(''),
      familyName: z.string().trim().optional().default(''),
    })
    .optional(),
  emails: z
    .array(
      z.object({
        value: z.string().trim().email(),
        type: z.string().trim().optional().default('work'),
        primary: z.boolean().optional().default(true),
      })
    )
    .optional(),
  active: z.boolean().optional().default(true),
  displayName: z.string().trim().optional(),
  title: z.string().trim().optional(),
});

const patchUserSchema = z.object({
  schemas: z.array(z.string().trim()).optional(),
  Operations: z
    .array(
      z.object({
        op: z.enum(['add', 'replace', 'remove']),
        path: z.string().trim().max(200).optional(),
        value: z.any().optional(),
      })
    )
    .max(50),
});

const patchGroupSchema = z.object({
  schemas: z.array(z.string().trim()).optional(),
  Operations: z
    .array(
      z.object({
        op: z.enum(['add', 'replace', 'remove']),
        path: z.string().trim().max(200).optional(),
        value: z.any().optional(),
      })
    )
    .max(100),
});

// ─── SCIM Bearer Token Auth Middleware ───────────────────────────────────────

function scimAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Authorization header with Bearer token is required',
      status: '401',
    });
    return;
  }

  const token = authHeader.substring(7);
  // O(1) lookup via reverse index instead of O(n) linear scan
  const tokenId = scimTokenByValue.get(token);
  const validToken = tokenId ? scimTokenStore.get(tokenId) : undefined;

  if (!validToken || !validToken.active) {
    res.status(401).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Invalid or expired SCIM bearer token',
      status: '401',
    });
    return;
  }

  // Attach orgId to request for downstream use
  (req as any).scimOrgId = validToken.orgId;
  next();
}

// ─── SCIM Filter Parser ────────────────────────────────────────────────

/**
 * Parse a SCIM filter expression (RFC 7644 §3.4.2.2).
 * Supports: eq, ne, co, sw, ew operators on simple attribute paths.
 * Example: userName eq "john@example.com"
 */
function parseScimFilter(filter: string): ((user: ScimUser) => boolean) | null {
  // Match: attributePath operator value
  const match = filter.match(/^(\S+)\s+(eq|ne|co|sw|ew)\s+"([^"]*)"$/i);
  if (!match) return null;

  const [, attr, op, value] = match;
  const lowerValue = value.toLowerCase();

  return (user: ScimUser): boolean => {
    let fieldValue: string | undefined;

    switch (attr.toLowerCase()) {
      case 'username':
        fieldValue = user.userName;
        break;
      case 'displayname':
        fieldValue = user.displayName;
        break;
      case 'externalid':
        fieldValue = user.externalId;
        break;
      case 'name.givenname':
        fieldValue = user.name.givenName;
        break;
      case 'name.familyname':
        fieldValue = user.name.familyName;
        break;
      case 'emails.value':
      case 'emails[type eq "work"].value':
        fieldValue = user.emails.find((e) => e.primary)?.value || user.emails[0]?.value;
        break;
      case 'active':
        fieldValue = String(user.active);
        break;
      default:
        return false;
    }

    if (fieldValue === undefined) return false;
    const lowerField = fieldValue.toLowerCase();

    switch (op.toLowerCase()) {
      case 'eq':
        return lowerField === lowerValue;
      case 'ne':
        return lowerField !== lowerValue;
      case 'co':
        return lowerField.includes(lowerValue);
      case 'sw':
        return lowerField.startsWith(lowerValue);
      case 'ew':
        return lowerField.endsWith(lowerValue);
      default:
        return false;
    }
  };
}

// ─── SCIM Response Helpers ──────────────────────────────────────────────────

function scimListResponse(
  resources: unknown[],
  totalResults: number,
  startIndex: number,
  itemsPerPage: number
) {
  return {
    schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
    totalResults,
    startIndex,
    itemsPerPage,
    Resources: resources,
  };
}

function getBaseUrl(req: Request): string {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:4000';
  return `${proto}://${host}`;
}

// ─── SCIM 2.0 Routes ───────────────────────────────────────────────────────

// GET /scim/v2/ServiceProviderConfig — SCIM capabilities
router.get('/ServiceProviderConfig', (_req: Request, res: Response) => {
  res.json({
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'],
    documentationUri: 'https://docs.ims.local/scim',
    patch: { supported: true },
    bulk: { supported: false, maxOperations: 0, maxPayloadSize: 0 },
    filter: { supported: true, maxResults: 200 },
    changePassword: { supported: false },
    sort: { supported: false },
    etag: { supported: false },
    authenticationSchemes: [
      {
        type: 'oauthbearertoken',
        name: 'OAuth Bearer Token',
        description: 'Authentication scheme using the OAuth Bearer Token Standard',
        specUri: 'https://www.rfc-editor.org/info/rfc6750',
        primary: true,
      },
    ],
  });
});

// All remaining SCIM endpoints require SCIM Bearer auth
router.use(scimAuth);

// GET /scim/v2/Users — list users (supports filter query parameter)
router.get('/Users', (req: Request, res: Response) => {
  try {
    const startIndex = Math.max(1, parseInt(req.query.startIndex as string, 10) || 1);
    const count = Math.min(200, Math.max(1, parseInt(req.query.count as string, 10) || 100));
    const filterParam = req.query.filter as string | undefined;

    let allUsers = Array.from(scimUserStore.values());

    // Apply SCIM filter if provided
    if (filterParam) {
      // Limit filter length to prevent abuse
      if (filterParam.length > 500) {
        return res.status(400).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: 'Filter expression too long',
          scimType: 'invalidFilter',
          status: '400',
        });
      }

      const filterFn = parseScimFilter(filterParam);
      if (filterFn) {
        allUsers = allUsers.filter(filterFn);
      } else {
        return res.status(400).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail:
            'Unsupported filter expression. Supported: attributePath (eq|ne|co|sw|ew) "value"',
          scimType: 'invalidFilter',
          status: '400',
        });
      }
    }

    const paged = allUsers.slice(startIndex - 1, startIndex - 1 + count);

    res.json(scimListResponse(paged, allUsers.length, startIndex, paged.length));
  } catch (error: unknown) {
    logger.error('SCIM list users failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Internal server error',
      status: '500',
    });
  }
});

// GET /scim/v2/Users/:id — get single user
router.get('/Users/:id', (req: Request, res: Response) => {
  try {
    const user = scimUserStore.get(req.params.id);
    if (!user) {
      return res.status(404).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'User not found',
        status: '404',
      });
    }
    res.json({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      ...user,
    });
  } catch (error: unknown) {
    logger.error('SCIM get user failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Internal server error',
      status: '500',
    });
  }
});

// POST /scim/v2/Users — create user
router.post('/Users', (req: Request, res: Response) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'Invalid user data: ' + parsed.error.issues.map((i) => i.message).join(', '),
        status: '400',
      });
    }

    const data = parsed.data;
    const baseUrl = getBaseUrl(req);

    // Check for duplicate userName via O(1) reverse index
    if (scimUserByUserName.has(data.userName)) {
      return res.status(409).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: `User with userName "${data.userName}" already exists`,
        scimType: 'uniqueness',
        status: '409',
      });
    }

    // Enforce size cap to prevent unbounded memory growth
    if (scimUserStore.size >= MAX_SCIM_USERS) {
      return res.status(507).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: `Maximum user limit (${MAX_SCIM_USERS}) reached`,
        status: '507',
      });
    }

    const now = new Date().toISOString();
    const id = uuidv4();

    const user: ScimUser = {
      id,
      externalId: data.externalId,
      userName: data.userName,
      name: {
        formatted:
          data.name?.formatted ||
          `${data.name?.givenName || ''} ${data.name?.familyName || ''}`.trim(),
        givenName: data.name?.givenName || '',
        familyName: data.name?.familyName || '',
      },
      emails: data.emails || [{ value: data.userName, type: 'work', primary: true }],
      active: data.active,
      displayName: data.displayName || data.name?.formatted || data.userName,
      title: data.title,
      groups: [],
      meta: {
        resourceType: 'User',
        created: now,
        lastModified: now,
        location: `${baseUrl}/scim/v2/Users/${id}`,
      },
    };

    scimUserStore.set(id, user);
    scimUserByUserName.set(user.userName, id);
    logger.info('SCIM user created', { id, userName: user.userName });

    res.status(201).json({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      ...user,
    });
  } catch (error: unknown) {
    logger.error('SCIM create user failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Internal server error',
      status: '500',
    });
  }
});

// PUT /scim/v2/Users/:id — replace user
router.put('/Users/:id', (req: Request, res: Response) => {
  try {
    const existing = scimUserStore.get(req.params.id);
    if (!existing) {
      return res.status(404).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'User not found',
        status: '404',
      });
    }

    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'Invalid user data: ' + parsed.error.issues.map((i) => i.message).join(', '),
        status: '400',
      });
    }

    const data = parsed.data;
    const now = new Date().toISOString();

    // Update reverse index if userName changed
    if (existing.userName !== data.userName) {
      scimUserByUserName.delete(existing.userName);
      scimUserByUserName.set(data.userName, req.params.id);
    }
    existing.userName = data.userName;
    existing.externalId = data.externalId;
    existing.name = {
      formatted:
        data.name?.formatted ||
        `${data.name?.givenName || ''} ${data.name?.familyName || ''}`.trim(),
      givenName: data.name?.givenName || '',
      familyName: data.name?.familyName || '',
    };
    existing.emails = data.emails || existing.emails;
    existing.active = data.active;
    existing.displayName = data.displayName || existing.displayName;
    existing.title = data.title;
    existing.meta.lastModified = now;

    logger.info('SCIM user replaced', { id: req.params.id, userName: existing.userName });

    res.json({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      ...existing,
    });
  } catch (error: unknown) {
    logger.error('SCIM replace user failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Internal server error',
      status: '500',
    });
  }
});

// PATCH /scim/v2/Users/:id — update user (activate/deactivate)
router.patch('/Users/:id', (req: Request, res: Response) => {
  try {
    const existing = scimUserStore.get(req.params.id);
    if (!existing) {
      return res.status(404).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'User not found',
        status: '404',
      });
    }

    const parsed = patchUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'Invalid PATCH request',
        status: '400',
      });
    }

    for (const op of parsed.data.Operations) {
      if (op.op === 'replace') {
        if (
          op.path === 'active' ||
          (!op.path && typeof op.value === 'object' && 'active' in op.value)
        ) {
          existing.active = op.path === 'active' ? !!op.value : !!op.value.active;
        }
        if (
          op.path === 'displayName' ||
          (!op.path && typeof op.value === 'object' && 'displayName' in op.value)
        ) {
          existing.displayName =
            op.path === 'displayName' ? String(op.value) : String(op.value.displayName);
        }
        if (op.path === 'name.givenName' && op.value) {
          existing.name.givenName = String(op.value);
          existing.name.formatted = `${existing.name.givenName} ${existing.name.familyName}`.trim();
        }
        if (op.path === 'name.familyName' && op.value) {
          existing.name.familyName = String(op.value);
          existing.name.formatted = `${existing.name.givenName} ${existing.name.familyName}`.trim();
        }
      }
    }

    existing.meta.lastModified = new Date().toISOString();
    logger.info('SCIM user patched', { id: req.params.id, active: existing.active });

    res.json({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      ...existing,
    });
  } catch (error: unknown) {
    logger.error('SCIM patch user failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Internal server error',
      status: '500',
    });
  }
});

// DELETE /scim/v2/Users/:id — deprovision user
router.delete('/Users/:id', (req: Request, res: Response) => {
  try {
    const existing = scimUserStore.get(req.params.id);
    if (!existing) {
      return res.status(404).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'User not found',
        status: '404',
      });
    }

    scimUserStore.delete(req.params.id);
    scimUserByUserName.delete(existing.userName);
    logger.info('SCIM user deprovisioned', { id: req.params.id, userName: existing.userName });

    res.status(204).send();
  } catch (error: unknown) {
    logger.error('SCIM delete user failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Internal server error',
      status: '500',
    });
  }
});

// GET /scim/v2/Groups — list groups (maps to Nexara roles, supports filter)
router.get('/Groups', (req: Request, res: Response) => {
  try {
    const startIndex = Math.max(1, parseInt(req.query.startIndex as string, 10) || 1);
    const count = Math.min(200, Math.max(1, parseInt(req.query.count as string, 10) || 100));
    const filterParam = req.query.filter as string | undefined;

    let allGroups = Array.from(scimGroupStore.values());

    // Apply filter (supports displayName eq "...")
    if (filterParam) {
      const match = filterParam.match(/^displayName\s+(eq|co|sw)\s+"([^"]*)"$/i);
      if (match) {
        const [, op, value] = match;
        const lv = value.toLowerCase();
        allGroups = allGroups.filter((g) => {
          const dn = g.displayName.toLowerCase();
          if (op.toLowerCase() === 'eq') return dn === lv;
          if (op.toLowerCase() === 'co') return dn.includes(lv);
          if (op.toLowerCase() === 'sw') return dn.startsWith(lv);
          return false;
        });
      }
    }

    const paged = allGroups.slice(startIndex - 1, startIndex - 1 + count);

    res.json(scimListResponse(paged, allGroups.length, startIndex, paged.length));
  } catch (error: unknown) {
    logger.error('SCIM list groups failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Internal server error',
      status: '500',
    });
  }
});

// GET /scim/v2/Groups/:id — get single group
router.get('/Groups/:id', (req: Request, res: Response) => {
  try {
    const group = scimGroupStore.get(req.params.id);
    if (!group) {
      return res.status(404).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'Group not found',
        status: '404',
      });
    }
    res.json({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
      ...group,
    });
  } catch (error: unknown) {
    logger.error('SCIM get group failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Internal server error',
      status: '500',
    });
  }
});

// PATCH /scim/v2/Groups/:id — update group members
router.patch('/Groups/:id', (req: Request, res: Response) => {
  try {
    const group = scimGroupStore.get(req.params.id);
    if (!group) {
      return res.status(404).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'Group not found',
        status: '404',
      });
    }

    // Validate PATCH body with Zod schema
    const parsed = patchGroupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'Invalid PATCH request',
        status: '400',
      });
    }

    const { Operations } = parsed.data;

    for (const op of Operations) {
      if (op.op === 'add' && op.path === 'members') {
        const newMembers = Array.isArray(op.value) ? op.value : [op.value];
        for (const member of newMembers) {
          // Validate member value is a non-empty string with length limit
          if (
            !member ||
            typeof member !== 'object' ||
            typeof member.value !== 'string' ||
            member.value.length === 0 ||
            member.value.length > 200
          ) {
            continue;
          }
          if (!group.members.find((m) => m.value === member.value)) {
            const user = scimUserStore.get(member.value);
            group.members.push({
              value: String(member.value),
              display: String(member.display || user?.displayName || member.value).slice(0, 200),
            });
            // Also add group reference to user
            if (user && !user.groups.find((g) => g.value === group.id)) {
              user.groups.push({ value: group.id, display: group.displayName });
            }
          }
        }
      } else if (op.op === 'remove' && op.path?.startsWith('members')) {
        // Remove specific member: members[value eq "userId"]
        const memberMatch = op.path.match(/members\[value\s+eq\s+"([^"]+)"\]/);
        if (memberMatch) {
          const memberId = memberMatch[1];
          if (memberId.length > 200) continue;
          group.members = group.members.filter((m) => m.value !== memberId);
          const user = scimUserStore.get(memberId);
          if (user) {
            user.groups = user.groups.filter((g) => g.value !== group.id);
          }
        }
      } else if (op.op === 'replace' && op.path === 'displayName') {
        group.displayName = String(op.value).slice(0, 200);
      }
    }

    group.meta.lastModified = new Date().toISOString();
    logger.info('SCIM group patched', {
      id: req.params.id,
      displayName: group.displayName,
      memberCount: group.members.length,
    });

    res.json({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
      ...group,
    });
  } catch (error: unknown) {
    logger.error('SCIM patch group failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Internal server error',
      status: '500',
    });
  }
});

export default router;
