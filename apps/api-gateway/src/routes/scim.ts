import { Router, Request, Response, NextFunction } from 'express';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('api-gateway:scim');
const router = Router();

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

const scimUserStore = new Map<string, ScimUser>();
const scimGroupStore = new Map<string, ScimGroup>();
const scimTokenStore = new Map<string, ScimBearerToken>();

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

// ─── Validation ─────────────────────────────────────────────────────────────

const createUserSchema = z.object({
  schemas: z.array(z.string()).optional(),
  externalId: z.string().optional(),
  userName: z.string().min(1, 'userName is required'),
  name: z.object({
    formatted: z.string().optional(),
    givenName: z.string().optional().default(''),
    familyName: z.string().optional().default(''),
  }).optional(),
  emails: z.array(z.object({
    value: z.string().email(),
    type: z.string().optional().default('work'),
    primary: z.boolean().optional().default(true),
  })).optional(),
  active: z.boolean().optional().default(true),
  displayName: z.string().optional(),
  title: z.string().optional(),
});

const patchUserSchema = z.object({
  schemas: z.array(z.string()).optional(),
  Operations: z.array(z.object({
    op: z.enum(['add', 'replace', 'remove']),
    path: z.string().optional(),
    value: z.any().optional(),
  })),
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
  const validToken = Array.from(scimTokenStore.values()).find(
    (t) => t.token === token && t.active
  );

  if (!validToken) {
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

// ─── SCIM Response Helpers ──────────────────────────────────────────────────

function scimListResponse(resources: any[], totalResults: number, startIndex: number, itemsPerPage: number) {
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
    filter: { supported: false, maxResults: 200 },
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

// GET /scim/v2/Users — list users
router.get('/Users', (req: Request, res: Response) => {
  try {
    const startIndex = Math.max(1, parseInt(req.query.startIndex as string) || 1);
    const count = Math.min(200, Math.max(1, parseInt(req.query.count as string) || 100));

    const allUsers = Array.from(scimUserStore.values());
    const paged = allUsers.slice(startIndex - 1, startIndex - 1 + count);

    res.json(scimListResponse(paged, allUsers.length, startIndex, paged.length));
  } catch (error: unknown) {
    logger.error('SCIM list users failed', { error: error instanceof Error ? error.message : 'Unknown error' });
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
    logger.error('SCIM get user failed', { error: error instanceof Error ? error.message : 'Unknown error' });
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

    // Check for duplicate userName
    const existing = Array.from(scimUserStore.values()).find((u) => u.userName === data.userName);
    if (existing) {
      return res.status(409).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: `User with userName "${data.userName}" already exists`,
        scimType: 'uniqueness',
        status: '409',
      });
    }

    const now = new Date().toISOString();
    const id = uuidv4();

    const user: ScimUser = {
      id,
      externalId: data.externalId,
      userName: data.userName,
      name: {
        formatted: data.name?.formatted || `${data.name?.givenName || ''} ${data.name?.familyName || ''}`.trim(),
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
    logger.info('SCIM user created', { id, userName: user.userName });

    res.status(201).json({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      ...user,
    });
  } catch (error: unknown) {
    logger.error('SCIM create user failed', { error: error instanceof Error ? error.message : 'Unknown error' });
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

    existing.userName = data.userName;
    existing.externalId = data.externalId;
    existing.name = {
      formatted: data.name?.formatted || `${data.name?.givenName || ''} ${data.name?.familyName || ''}`.trim(),
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
    logger.error('SCIM replace user failed', { error: error instanceof Error ? error.message : 'Unknown error' });
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
        if (op.path === 'active' || (!op.path && typeof op.value === 'object' && 'active' in op.value)) {
          existing.active = op.path === 'active' ? !!op.value : !!op.value.active;
        }
        if (op.path === 'displayName' || (!op.path && typeof op.value === 'object' && 'displayName' in op.value)) {
          existing.displayName = op.path === 'displayName' ? String(op.value) : String(op.value.displayName);
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
    logger.error('SCIM patch user failed', { error: error instanceof Error ? error.message : 'Unknown error' });
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
    logger.info('SCIM user deprovisioned', { id: req.params.id, userName: existing.userName });

    res.status(204).send();
  } catch (error: unknown) {
    logger.error('SCIM delete user failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Internal server error',
      status: '500',
    });
  }
});

// GET /scim/v2/Groups — list groups (maps to Nexara roles)
router.get('/Groups', (req: Request, res: Response) => {
  try {
    const startIndex = Math.max(1, parseInt(req.query.startIndex as string) || 1);
    const count = Math.min(200, Math.max(1, parseInt(req.query.count as string) || 100));

    const allGroups = Array.from(scimGroupStore.values());
    const paged = allGroups.slice(startIndex - 1, startIndex - 1 + count);

    res.json(scimListResponse(paged, allGroups.length, startIndex, paged.length));
  } catch (error: unknown) {
    logger.error('SCIM list groups failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Internal server error',
      status: '500',
    });
  }
});

export default router;
