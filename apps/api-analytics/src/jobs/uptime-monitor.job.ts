import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('uptime-monitor-job');

const TEST_MODE = process.env.NODE_ENV === 'test';
const FETCH_TIMEOUT = 10000;

async function fetchUrl(url: string): Promise<{ status: number; responseMs: number }> {
  if (TEST_MODE) {
    return { status: 200, responseMs: 42 };
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    const response = await fetch(url, { signal: controller.signal, method: 'GET' });
    clearTimeout(timeout);
    return { status: response.status, responseMs: Date.now() - start };
  } catch {
    return { status: 0, responseMs: Date.now() - start };
  }
}

export async function runUptimeMonitorJob(): Promise<void> {
  logger.info('Starting uptime monitor job');

  try {
    const checks = await prisma.uptimeCheck.findMany({ where: { isActive: true } });

    for (const check of checks) {
      const { status, responseMs } = await fetchUrl(check.url);
      const isUp = status === (check.expectedStatus || 200);
      const now = new Date();

      // Update the check record
      await prisma.uptimeCheck.update({
        where: { id: check.id },
        data: {
          lastStatus: isUp ? 'UP' : 'DOWN',
          lastCheckedAt: now,
          avgResponseMs: responseMs,
        },
      });

      if (!isUp) {
        // Create an incident if service is down
        await prisma.uptimeIncident.create({
          data: {
            uptimeCheckId: check.id,
            detectedAt: now,
            httpStatus: status,
            errorMessage:
              status === 0 ? 'Connection failed or timeout' : `Unexpected status ${status}`,
          } as any,
        });
        logger.warn('Uptime incident detected', { checkId: check.id, url: check.url, status });
      } else {
        // If there is an unresolved incident, resolve it
        const openIncident = await prisma.uptimeIncident.findFirst({
          where: {
            uptimeCheckId: check.id,
            resolvedAt: null,
          },
          orderBy: { detectedAt: 'desc' } as any,
        });

        if (openIncident) {
          await prisma.uptimeIncident.update({
            where: { id: openIncident.id },
            data: { resolvedAt: now },
          });
          logger.info('Uptime incident resolved', {
            checkId: check.id,
            incidentId: openIncident.id,
          });
        }
      }

      logger.info('Uptime check completed', {
        checkId: check.id,
        url: check.url,
        status,
        responseMs,
        isUp,
      });
    }

    logger.info('Uptime monitor job completed', { checksProcessed: checks.length });
  } catch (err) {
    logger.error('Uptime monitor job failed', { error: String(err) });
  }
}
