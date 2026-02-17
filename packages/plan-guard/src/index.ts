import type { Request, Response, NextFunction } from 'express';

interface PlanGuardRequest extends Request {
  user?: { id: string; orgId?: string; organisationId?: string };
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type PlanTier = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface PlanLimits {
  users: number | null;
  recordsPerModule: number | null;
  aiCallsPerMonth: number | null;
  modules: number | null;
}

export interface LimitCheck {
  allowed: boolean;
  current: number;
  limit: number | null;
  plan: PlanTier;
  upgradeRequired: boolean;
}

// ─── Plan Definitions ───────────────────────────────────────────────────────

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  FREE: { users: 3, recordsPerModule: 500, aiCallsPerMonth: 10, modules: 2 },
  STARTER: { users: 10, recordsPerModule: 5000, aiCallsPerMonth: 100, modules: 5 },
  PROFESSIONAL: { users: 50, recordsPerModule: null, aiCallsPerMonth: 500, modules: null },
  ENTERPRISE: { users: null, recordsPerModule: null, aiCallsPerMonth: null, modules: null },
};

// ─── In-Memory Org Plan Store ───────────────────────────────────────────────

const orgPlans = new Map<string, PlanTier>();

/**
 * Get the plan tier for an organisation.
 * Defaults to PROFESSIONAL if not explicitly set.
 */
export function getOrgPlan(orgId: string): PlanTier {
  return orgPlans.get(orgId) || 'PROFESSIONAL';
}

/**
 * Set the plan tier for an organisation.
 */
export function setOrgPlan(orgId: string, plan: PlanTier): void {
  orgPlans.set(orgId, plan);
}

// ─── Limit Checking ─────────────────────────────────────────────────────────

/**
 * Check whether an organisation can perform a resource action.
 * For now, always returns allowed: true (no enforcement until billing connected).
 */
export function checkLimit(_orgId: string, _resource: string): LimitCheck {
  return {
    allowed: true,
    current: 0,
    limit: null,
    plan: 'PROFESSIONAL',
    upgradeRequired: false,
  };
}

// ─── Express Middleware ─────────────────────────────────────────────────────

/**
 * Express middleware that checks plan limits before allowing the request.
 * Returns 402 Payment Required if the limit is exceeded.
 *
 * Usage: router.post('/items', planGuard('records'), handler)
 */
export function planGuard(resource: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const orgId = (req as PlanGuardRequest).user?.orgId || 'default';
    const result = checkLimit(orgId, resource);

    if (!result.allowed) {
      res.status(402).json({
        success: false,
        error: {
          code: 'PLAN_LIMIT_EXCEEDED',
          message: `You have reached the ${resource} limit for your ${result.plan} plan.`,
          current: result.current,
          limit: result.limit,
          plan: result.plan,
          upgradeUrl: '/settings/billing',
        },
      });
      return;
    }

    next();
  };
}
