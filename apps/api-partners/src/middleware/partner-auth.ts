import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-partners:auth-middleware');
const JWT_SECRET = process.env.JWT_SECRET || 'partner-secret';

export interface PartnerRequest extends Request {
  partner?: Record<string, unknown>;
}

export function authenticatePartner(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'No token provided' },
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    if (decoded.type !== 'partner') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Invalid token type' },
      });
    }
    (req as PartnerRequest).partner = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_INVALID', message: 'Invalid or expired token' },
    });
  }
}
