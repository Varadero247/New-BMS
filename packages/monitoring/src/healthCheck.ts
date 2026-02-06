import type { Request, Response } from 'express';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  timestamp: string;
  uptime: number;
  version?: string;
  checks: {
    database?: 'up' | 'down';
    memory?: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

interface PrismaLike {
  $queryRaw: (query: TemplateStringsArray) => Promise<unknown>;
}

export const createHealthCheck = (
  serviceName: string,
  prisma?: PrismaLike,
  version?: string
) => {
  return async (_req: Request, res: Response) => {
    const checks: HealthStatus['checks'] = {};
    let status: HealthStatus['status'] = 'healthy';

    // Check database connection
    if (prisma) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        checks.database = 'up';
      } catch {
        checks.database = 'down';
        status = 'unhealthy';
      }
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    checks.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    };

    if (checks.memory.percentage > 90) {
      status = status === 'healthy' ? 'degraded' : status;
    }

    const health: HealthStatus = {
      status,
      service: serviceName,
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      version,
      checks,
    };

    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
    res.status(httpStatus).json(health);
  };
};
