import { Router, Response } from 'express';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '@ims/database';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Import RBAC types and functions inline to avoid dist build requirement
// These mirror the structures in @ims/rbac exactly

enum PermissionLevel {
  NONE = 0,
  VIEW = 1,
  CREATE = 2,
  EDIT = 3,
  DELETE = 4,
  APPROVE = 5,
  FULL = 6,
}

type ImsModule =
  | 'health-safety' | 'environment' | 'quality' | 'hr' | 'payroll'
  | 'inventory' | 'workflows' | 'project-management' | 'automotive'
  | 'medical' | 'aerospace' | 'finance' | 'crm' | 'infosec'
  | 'esg' | 'cmms' | 'portal' | 'food-safety' | 'energy'
  | 'analytics' | 'field-service' | 'iso42001' | 'iso37001'
  | 'ai' | 'settings' | 'templates' | 'reports' | 'dashboard';

interface ModulePermissions {
  module: ImsModule;
  level: PermissionLevel;
}

interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: ModulePermissions[];
  isSystem: boolean;
}

const ALL_MODULES: ImsModule[] = [
  'health-safety', 'environment', 'quality', 'hr', 'payroll',
  'inventory', 'workflows', 'project-management', 'automotive',
  'medical', 'aerospace', 'finance', 'crm', 'infosec',
  'esg', 'cmms', 'portal', 'food-safety', 'energy',
  'analytics', 'field-service', 'iso42001', 'iso37001',
  'ai', 'settings', 'templates', 'reports', 'dashboard',
];

// Lazy-load @ims/rbac at runtime (avoids compile-time type resolution issues when dist is not built)
let _rbac: {
  PLATFORM_ROLES: RoleDefinition[];
  getRoleById: (id: string) => RoleDefinition | undefined;
  resolvePermissions: (roleIds: string[]) => { roles: string[]; modules: Record<ImsModule, PermissionLevel> };
  mapLegacyRole: (role: string) => string[];
} | null = null;

function getRbac() {
  if (!_rbac) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const rbac = require('@ims/rbac');
      _rbac = rbac;
    } catch {
      // Fallback: load from source directly
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const roles = require('../../../../packages/rbac/src/roles');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const permissions = require('../../../../packages/rbac/src/permissions');
      _rbac = {
        PLATFORM_ROLES: roles.PLATFORM_ROLES,
        getRoleById: roles.getRoleById,
        resolvePermissions: permissions.resolvePermissions,
        mapLegacyRole: permissions.mapLegacyRole,
      };
    }
  }
  return _rbac!;
}

const LEVEL_NAMES: Record<number, string> = {
  [PermissionLevel.NONE]: 'NONE',
  [PermissionLevel.VIEW]: 'VIEW',
  [PermissionLevel.CREATE]: 'CREATE',
  [PermissionLevel.EDIT]: 'EDIT',
  [PermissionLevel.DELETE]: 'DELETE',
  [PermissionLevel.APPROVE]: 'APPROVE',
  [PermissionLevel.FULL]: 'FULL',
};

function formatModules(modules: Record<string, number>): Record<string, { level: number; name: string }> {
  const result: Record<string, { level: number; name: string }> = {};
  const keys = Object.keys(modules);
  for (const mod of keys) {
    const level = modules[mod] as number;
    result[mod] = { level, name: LEVEL_NAMES[level] || 'UNKNOWN' };
  }
  return result;
}

const logger = createLogger('api-gateway:roles');
const router = Router();

// In-memory audit log store (until a dedicated audit table exists)
interface AccessLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  module: string;
  action: string;
  resource?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

const accessLog: AccessLogEntry[] = [];
const MAX_LOG_ENTRIES = 10000;

// All routes require authentication
router.use(authenticate);

// ============================================
// Role Management Endpoints (mounted at /api/roles)
// ============================================

// GET /api/roles/modules — List all IMS modules
// NOTE: This must be defined BEFORE /:id to avoid "modules" being captured as an id param
router.get('/modules', (_req: AuthRequest, res: Response) => {
  const moduleList = ALL_MODULES.map((m: string) => ({
    id: m,
    name: m.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  }));

  res.json({ success: true, data: moduleList });
});

// POST /api/roles/resolve — Resolve permissions for a set of role IDs
router.post('/resolve', (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      roles: z.array(z.string()).min(1, 'At least one role ID is required'),
    });

    const { roles } = schema.parse(req.body);
    const rbac = getRbac();

    // Validate that all role IDs exist
    const invalidRoles = roles.filter((id: string) => !rbac.getRoleById(id));
    if (invalidRoles.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLES',
          message: `Unknown role IDs: ${invalidRoles.join(', ')}`,
        },
      });
    }

    const resolved = rbac.resolvePermissions(roles);
    const modulesReadable = formatModules(resolved.modules as unknown as Record<string, number>);

    res.json({
      success: true,
      data: {
        roles: resolved.roles,
        modules: modulesReadable,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map((e: z.ZodIssue) => e.path.join('.')) },
      });
    }
    logger.error('Resolve permissions error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to resolve permissions' },
    });
  }
});

// GET /api/roles — List all platform roles + custom roles with their permission matrices
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const rbac = getRbac();
    const systemRoles = rbac.PLATFORM_ROLES.map((role: RoleDefinition) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: true,
      permissionCount: role.permissions.length,
      permissions: role.permissions.map((p: ModulePermissions) => ({
        module: p.module,
        level: p.level,
        levelName: PermissionLevel[p.level],
      })),
    }));

    // Fetch custom roles from database
    const customRolesDb = await prisma.customRole.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
    const customRoles = customRolesDb.map((cr: { id: string; name: string; description: string; permissions: unknown }) => {
      const perms = (cr.permissions as { module: string; level: number }[]) || [];
      return {
        id: cr.id,
        name: cr.name,
        description: cr.description,
        isSystem: false,
        permissionCount: perms.length,
        permissions: perms.map((p: { module: string; level: number }) => ({
          module: p.module,
          level: p.level,
          levelName: PermissionLevel[p.level],
        })),
      };
    });

    const allRoles = [...systemRoles, ...customRoles];

    res.json({
      success: true,
      data: allRoles,
      meta: { total: allRoles.length, system: systemRoles.length, custom: customRoles.length },
    });
  } catch (error) {
    logger.error('List roles error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list roles' },
    });
  }
});

// POST /api/roles — Create a custom role
router.post('/', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters').max(100),
      description: z.string().max(500).optional().default(''),
      permissions: z.array(z.object({
        module: z.string(),
        level: z.number().min(0).max(6),
      })).min(1, 'At least one permission is required'),
    });

    const data = schema.parse(req.body);

    // Validate module names
    const invalidModules = data.permissions.filter((p: { module: string }) => !ALL_MODULES.includes(p.module as ImsModule));
    if (invalidModules.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Invalid modules: ${invalidModules.map((p: { module: string }) => p.module).join(', ')}` },
      });
    }

    // Check for duplicate name against system roles
    const rbac = getRbac();
    const systemNameConflict = rbac.PLATFORM_ROLES.find(
      (r: RoleDefinition) => r.name.toLowerCase() === data.name.toLowerCase()
    );
    if (systemNameConflict) {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_NAME', message: `A system role with name "${data.name}" already exists` },
      });
    }

    const customRole = await prisma.customRole.create({
      data: {
        name: data.name,
        description: data.description || '',
        permissions: data.permissions,
        createdBy: req.user!.id,
      },
    });

    const perms = customRole.permissions as { module: string; level: number }[];

    // Audit
    accessLog.unshift({
      id: uuidv4(),
      userId: req.user!.id,
      userEmail: req.user!.email || 'unknown',
      module: 'rbac',
      action: 'CREATE_ROLE',
      resource: `role:${customRole.id}`,
      details: `Created custom role "${customRole.name}"`,
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
    });
    if (accessLog.length > MAX_LOG_ENTRIES) accessLog.length = MAX_LOG_ENTRIES;

    res.status(201).json({
      success: true,
      data: {
        id: customRole.id,
        name: customRole.name,
        description: customRole.description,
        isSystem: false,
        permissionCount: perms.length,
        permissions: perms.map((p: { module: string; level: number }) => ({
          module: p.module,
          level: p.level,
          levelName: PermissionLevel[p.level],
        })),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.errors[0]?.message || 'Invalid input' },
      });
    }
    if ((error as { code?: string }).code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_NAME', message: 'A role with this name already exists' },
      });
    }
    logger.error('Create role error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create role' },
    });
  }
});

// PUT /api/roles/:id — Update a custom role
router.put('/:id', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Cannot edit system roles
    const rbac = getRbac();
    if (rbac.getRoleById(id)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'System roles cannot be modified' },
      });
    }

    const existing = await prisma.customRole.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Custom role not found' },
      });
    }

    const schema = z.object({
      name: z.string().min(2).max(100).optional(),
      description: z.string().max(500).optional(),
      permissions: z.array(z.object({
        module: z.string(),
        level: z.number().min(0).max(6),
      })).min(1).optional(),
    });

    const data = schema.parse(req.body);

    if (data.permissions) {
      const invalidModules = data.permissions.filter((p: { module: string }) => !ALL_MODULES.includes(p.module as ImsModule));
      if (invalidModules.length > 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: `Invalid modules: ${invalidModules.map((p: { module: string }) => p.module).join(', ')}` },
        });
      }
    }

    const updated = await prisma.customRole.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.permissions !== undefined && { permissions: data.permissions }),
      },
    });

    const perms = updated.permissions as { module: string; level: number }[];

    accessLog.unshift({
      id: uuidv4(),
      userId: req.user!.id,
      userEmail: req.user!.email || 'unknown',
      module: 'rbac',
      action: 'UPDATE_ROLE',
      resource: `role:${updated.id}`,
      details: `Updated custom role "${updated.name}"`,
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
    });
    if (accessLog.length > MAX_LOG_ENTRIES) accessLog.length = MAX_LOG_ENTRIES;

    res.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        isSystem: false,
        permissionCount: perms.length,
        permissions: perms.map((p: { module: string; level: number }) => ({
          module: p.module,
          level: p.level,
          levelName: PermissionLevel[p.level],
        })),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.errors[0]?.message || 'Invalid input' },
      });
    }
    if ((error as { code?: string }).code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_NAME', message: 'A role with this name already exists' },
      });
    }
    logger.error('Update role error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update role' },
    });
  }
});

// DELETE /api/roles/:id — Delete a custom role
router.delete('/:id', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Cannot delete system roles
    const rbac = getRbac();
    if (rbac.getRoleById(id)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'System roles cannot be deleted' },
      });
    }

    const existing = await prisma.customRole.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Custom role not found' },
      });
    }

    await prisma.customRole.delete({ where: { id } });

    accessLog.unshift({
      id: uuidv4(),
      userId: req.user!.id,
      userEmail: req.user!.email || 'unknown',
      module: 'rbac',
      action: 'DELETE_ROLE',
      resource: `role:${id}`,
      details: `Deleted custom role "${existing.name}"`,
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
    });
    if (accessLog.length > MAX_LOG_ENTRIES) accessLog.length = MAX_LOG_ENTRIES;

    res.json({ success: true, data: { id, deleted: true } });
  } catch (error) {
    logger.error('Delete role error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete role' },
    });
  }
});

// ============================================
// Access Log Endpoints
// NOTE: Must be defined BEFORE /:id to avoid 'access-log' being captured as an id param
// In production, also mounted at /api/access-log (where '/' maps to the GET handler)
// ============================================

// GET /access-log — List audit log entries (paginated, filterable)
router.get('/access-log', (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      userId,
      module,
      action,
      startDate,
      endDate,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 50, 200);

    let filtered = [...accessLog];

    if (userId) {
      filtered = filtered.filter((e: AccessLogEntry) => e.userId === userId);
    }
    if (module) {
      filtered = filtered.filter((e: AccessLogEntry) => e.module === module);
    }
    if (action) {
      filtered = filtered.filter((e: AccessLogEntry) => e.action === action);
    }
    if (startDate) {
      const start = new Date(startDate as string).getTime();
      filtered = filtered.filter((e: AccessLogEntry) => new Date(e.timestamp).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate as string).getTime();
      filtered = filtered.filter((e: AccessLogEntry) => new Date(e.timestamp).getTime() <= end);
    }

    const total = filtered.length;
    const skip = (pageNum - 1) * limitNum;
    const entries = filtered.slice(skip, skip + limitNum);

    res.json({
      success: true,
      data: entries,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('List access log error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list access log' },
    });
  }
});

// POST /access-log — Record an audit entry (internal use)
router.post('/access-log', (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      module: z.string().min(1),
      action: z.string().min(1),
      resource: z.string().optional(),
      details: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const entry: AccessLogEntry = {
      id: uuidv4(),
      userId: req.user!.id,
      userEmail: req.user!.email || 'unknown',
      module: data.module,
      action: data.action,
      resource: data.resource,
      details: data.details,
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
    };

    accessLog.unshift(entry);
    if (accessLog.length > MAX_LOG_ENTRIES) {
      accessLog.length = MAX_LOG_ENTRIES;
    }

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map((e: z.ZodIssue) => e.path.join('.')) },
      });
    }
    logger.error('Record access log error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to record access log entry' },
    });
  }
});

// GET /api/roles/:id — Get role detail with permissions and description
router.get('/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const rbac = getRbac();
  const role = rbac.getRoleById(id);

  if (!role) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Role '${id}' not found` },
    });
  }

  res.json({
    success: true,
    data: {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      permissions: role.permissions.map((p: ModulePermissions) => ({
        module: p.module,
        level: p.level,
        levelName: PermissionLevel[p.level],
      })),
    },
  });
});

// ============================================
// User Permission & Role Endpoints
// These are accessed via /api/roles/users/:userId/permissions and /api/roles/users/:userId/roles
// ============================================

// GET /users/:userId/permissions — Get effective permissions for a user
router.get('/users/:userId/permissions', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Users can view their own permissions; admins/managers can view any
    if (req.user!.id !== userId && !['ADMIN', 'MANAGER'].includes(req.user!.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    const rbac = getRbac();
    const rbacRoles = rbac.mapLegacyRole(user.role);
    const resolved = rbac.resolvePermissions(rbacRoles);
    const modulesReadable = formatModules(resolved.modules as unknown as Record<string, number>);

    res.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        legacyRole: user.role,
        rbacRoles,
        modules: modulesReadable,
      },
    });
  } catch (error) {
    logger.error('Get user permissions error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get user permissions' },
    });
  }
});

// PATCH /users/:userId/roles — Update a user's assigned roles (Admin only)
router.patch('/users/:userId/roles', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const schema = z.object({
      roles: z.array(z.string()).min(1, 'At least one role is required'),
    });

    const { roles } = schema.parse(req.body);
    const rbac = getRbac();

    // Validate that all role IDs exist
    const invalidRoles = roles.filter((id: string) => !rbac.getRoleById(id));
    if (invalidRoles.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLES',
          message: `Unknown role IDs: ${invalidRoles.join(', ')}`,
        },
      });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    // Resolve effective permissions from the assigned roles
    const resolved = rbac.resolvePermissions(roles);

    // Record audit entry
    accessLog.unshift({
      id: uuidv4(),
      userId: req.user!.id,
      userEmail: req.user!.email || 'unknown',
      module: 'rbac',
      action: 'UPDATE_ROLES',
      resource: `user:${userId}`,
      details: `Assigned roles [${roles.join(', ')}] to user ${user.email}`,
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
    });

    if (accessLog.length > MAX_LOG_ENTRIES) {
      accessLog.length = MAX_LOG_ENTRIES;
    }

    const modulesReadable = formatModules(resolved.modules as unknown as Record<string, number>);

    res.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        assignedRoles: roles,
        effectivePermissions: modulesReadable,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map((e: z.ZodIssue) => e.path.join('.')) },
      });
    }
    logger.error('Update user roles error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update user roles' },
    });
  }
});

export default router;
