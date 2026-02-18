# @ims/rbac

Role-based access control for IMS platform. Defines 39 roles across 17 modules with 7 permission levels.

## Features

- 39 predefined platform roles (admin, manager, auditor, viewer, plus module-specific roles)
- 17 IMS modules with granular permissions
- 7 permission levels: `NONE`, `VIEW_OWN`, `VIEW_ALL`, `CREATE`, `EDIT_OWN`, `EDIT_ALL`, `DELETE`
- Express middleware: `requirePermission`, `requireOwnership`, `attachPermissions`
- React hooks and components (via `@ims/rbac/react`)
- Ownership-scoped queries with `scopeByPermission`

## Usage

### Express Middleware

```typescript
import { attachPermissions, requirePermission } from '@ims/rbac';

// Attach permissions to request (call once per service)
app.use(attachPermissions());

// Require specific permission on a route
router.get('/items', requirePermission('quality', 'VIEW_ALL'), handler);
router.post('/items', requirePermission('quality', 'CREATE'), handler);
router.delete('/items/:id', requirePermission('quality', 'DELETE'), handler);
```

### React (Client-side)

```typescript
import { usePermission, PermissionGate } from '@ims/rbac/react';

// Hook
const canEdit = usePermission('quality', 'EDIT_ALL');

// Component
<PermissionGate module="quality" level="DELETE">
  <DeleteButton />
</PermissionGate>
```

## Exports

| Export                          | Description                                         |
| ------------------------------- | --------------------------------------------------- |
| `PLATFORM_ROLES`                | All 39 role definitions                             |
| `getRoleById` / `getRolesByIds` | Look up role definitions                            |
| `resolvePermissions`            | Merge multiple roles into effective permissions     |
| `hasPermission`                 | Check if permissions include a specific level       |
| `requirePermission`             | Express middleware for permission checks            |
| `attachPermissions`             | Express middleware to resolve user permissions      |
| `scopeByPermission`             | Generate Prisma `where` clause based on permissions |
