/**
 * ID format validation utilities for Express route params.
 *
 * Accepts both UUID v1-v5 format and Prisma's cuid format.
 * UUID:  xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
 * CUID:  c followed by 20+ lowercase alphanumeric chars
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CUID_REGEX = /^c[a-z0-9]{20,}$/;

/**
 * Check whether a string value is a valid ID (UUID or cuid).
 */
export function isValidId(value: string): boolean {
  return UUID_REGEX.test(value) || CUID_REGEX.test(value);
}

/**
 * Express param-handler middleware factory for validating ID route params.
 *
 * Usage with router.param():
 *   router.param('id', validateIdParam());
 *   router.param('actionId', validateIdParam('actionId'));
 *
 * Usage as inline route middleware:
 *   router.get('/:id', validateIdParam(), handler);
 *
 * When used with router.param(), Express calls this for every route on
 * that router that declares the named param — no per-route changes needed.
 */
export function validateIdParam(paramName: string = 'id') {
  return (
    req: { params?: Record<string, string> },
    res: { status: (code: number) => { json: (body: unknown) => void } },
    next: (err?: unknown) => void,
    value?: string
  ) => {
    // router.param() passes (req, res, next, value, name)
    // regular middleware passes (req, res, next)
    const id = value ?? req.params?.[paramName];
    if (id && !isValidId(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: `Invalid ${paramName} format`,
        },
      });
    }
    next();
  };
}
