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
    logger.error('Failed to generate OpenAPI spec', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate OpenAPI specification' },
    });
  }
});

// GET /api/docs — Interactive API documentation (Scalar)
router.get('/', (_req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Nexara IMS — API Documentation</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <script id="api-reference" data-url="/api/docs/openapi.json"></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`;
  res.set('Content-Type', 'text/html');
  res.send(html);
});

export default router;
