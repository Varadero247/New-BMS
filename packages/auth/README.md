# @ims/auth

Authentication and authorization middleware for IMS API services.

## Features

- JWT token generation, verification, and refresh
- Password hashing (bcrypt) and strength validation
- Express middleware: `authenticate`, `requireRole`, `optionalAuth`
- Re-exports RBAC middleware from `@ims/rbac`

## Usage

```typescript
import { authenticate, requirePermission, generateTokenPair, hashPassword } from '@ims/auth';

// Protect a route
router.get('/protected', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Require specific permission
router.delete('/item/:id', authenticate, requirePermission('quality', 'DELETE'), handler);

// Generate tokens on login
const tokens = await generateTokenPair({ userId, email, role });

// Hash a password
const hash = await hashPassword('plaintext');
```

## Exports

| Export | Description |
|--------|-------------|
| `generateToken` / `generateRefreshToken` | Create JWT access/refresh tokens |
| `generateTokenPair` | Create both tokens at once |
| `verifyToken` / `verifyRefreshToken` | Validate and decode tokens |
| `hashPassword` / `comparePassword` | Bcrypt password operations |
| `authenticate` | Express middleware — verifies Bearer token |
| `requireRole` | Express middleware — checks user role |
| `optionalAuth` | Express middleware — attaches user if token present |
| `requirePermission` | RBAC middleware (from `@ims/rbac`) |
| `attachPermissions` | RBAC middleware (from `@ims/rbac`) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Must match across all services |
| `JWT_REFRESH_SECRET` | Yes | For refresh token signing |
