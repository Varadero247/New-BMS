import { Router, Request, Response } from 'express';
import { createLogger } from '@ims/monitoring';
import { generateOpenApiSpec } from '@ims/openapi';

const logger = createLogger('api-gateway:openapi');
const router = Router();

// GET /api/docs/openapi.json — Public, no auth required
router.get('/openapi.json', (_req: Request, res: Response) => {
  try {
    const spec = generateOpenApiSpec();
    res.json(spec);
  } catch (error: unknown) {
    logger.error('Failed to generate OpenAPI spec', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate OpenAPI specification' },
    });
  }
});

export default router;
