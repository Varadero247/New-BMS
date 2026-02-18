import cron from 'node-cron';
import { createLogger } from '@ims/monitoring';
import { runMonthlySnapshot } from './jobs/monthly-snapshot.job';
import { runDunningJob } from './jobs/dunning.job';
import { runVatSummaryJob } from './jobs/vat-summary.job';
import { runCashFlowForecastJob } from './jobs/cashflow-forecast.job';
import { runAnnualAccountsJob } from './jobs/annual-accounts.job';
import { runSaaSAuditJob } from './jobs/saas-audit.job';
import { runFeatureAggregationJob } from './jobs/feature-aggregation.job';
import { runUptimeMonitorJob } from './jobs/uptime-monitor.job';
import { runContractExpiryJob } from './jobs/contract-expiry.job';
import { runGdprMonitorJob } from './jobs/gdpr-monitor.job';
import { runCertificationTrackerJob } from './jobs/certification-tracker.job';
import { runMarketMonitorJob } from './jobs/market-monitor.job';
import { runBoardPackJob } from './jobs/board-pack.job';

const logger = createLogger('analytics-scheduler');

export function startScheduler(): void {
  // ── Phase 7 — Monthly Tracking ──────────────────────────────────────
  // Run monthly snapshot on the 1st of every month at 06:00 UTC
  cron.schedule(
    '0 6 1 * *',
    async () => {
      logger.info('Cron triggered: monthly snapshot');
      try {
        const snapshotId = await runMonthlySnapshot();
        logger.info('Monthly snapshot completed via cron', { snapshotId });
      } catch (err) {
        logger.error('Monthly snapshot cron failed', { error: String(err) });
      }
    },
    { timezone: 'UTC' }
  );

  // ── Session A — Finance Automation ──────────────────────────────────
  // Dunning: hourly check for payment failure sequences
  cron.schedule(
    '0 * * * *',
    async () => {
      logger.info('Cron triggered: dunning job');
      try {
        await runDunningJob();
        logger.info('Dunning job completed');
      } catch (err) {
        logger.error('Dunning cron failed', { error: String(err) });
      }
    },
    { timezone: 'UTC' }
  );

  // VAT summary: 5th of every month at 07:00 UTC
  cron.schedule(
    '0 7 5 * *',
    async () => {
      logger.info('Cron triggered: VAT summary');
      try {
        await runVatSummaryJob();
        logger.info('VAT summary completed');
      } catch (err) {
        logger.error('VAT summary cron failed', { error: String(err) });
      }
    },
    { timezone: 'UTC' }
  );

  // Cash flow forecast: every Monday at 07:00 UTC
  cron.schedule(
    '0 7 * * 1',
    async () => {
      logger.info('Cron triggered: cash flow forecast');
      try {
        await runCashFlowForecastJob();
        logger.info('Cash flow forecast completed');
      } catch (err) {
        logger.error('Cash flow forecast cron failed', { error: String(err) });
      }
    },
    { timezone: 'UTC' }
  );

  // Annual accounts data pack: March 1st at 08:00 UTC
  cron.schedule(
    '0 8 1 3 *',
    async () => {
      logger.info('Cron triggered: annual accounts pack');
      try {
        await runAnnualAccountsJob();
        logger.info('Annual accounts pack completed');
      } catch (err) {
        logger.error('Annual accounts cron failed', { error: String(err) });
      }
    },
    { timezone: 'UTC' }
  );

  // SaaS subscription audit: 1st of every month at 09:00 UTC
  cron.schedule(
    '0 9 1 * *',
    async () => {
      logger.info('Cron triggered: SaaS audit');
      try {
        await runSaaSAuditJob();
        logger.info('SaaS audit completed');
      } catch (err) {
        logger.error('SaaS audit cron failed', { error: String(err) });
      }
    },
    { timezone: 'UTC' }
  );

  // ── Session B — Support & Product Intelligence ──────────────────────
  // Feature aggregation: 1st of every month at 10:00 UTC
  cron.schedule(
    '0 10 1 * *',
    async () => {
      logger.info('Cron triggered: feature aggregation');
      try {
        await runFeatureAggregationJob();
        logger.info('Feature aggregation completed');
      } catch (err) {
        logger.error('Feature aggregation cron failed', { error: String(err) });
      }
    },
    { timezone: 'UTC' }
  );

  // Uptime monitor: every 5 minutes
  cron.schedule(
    '*/5 * * * *',
    async () => {
      try {
        await runUptimeMonitorJob();
      } catch (err) {
        logger.error('Uptime monitor cron failed', { error: String(err) });
      }
    },
    { timezone: 'UTC' }
  );

  // ── Session C — Compliance & Legal ──────────────────────────────────
  // Contract expiry check: every Monday at 08:00 UTC
  cron.schedule(
    '0 8 * * 1',
    async () => {
      logger.info('Cron triggered: contract expiry check');
      try {
        await runContractExpiryJob();
        logger.info('Contract expiry check completed');
      } catch (err) {
        logger.error('Contract expiry cron failed', { error: String(err) });
      }
    },
    { timezone: 'UTC' }
  );

  // GDPR compliance monitor: 1st of every month at 11:00 UTC
  cron.schedule(
    '0 11 1 * *',
    async () => {
      logger.info('Cron triggered: GDPR monitor');
      try {
        await runGdprMonitorJob();
        logger.info('GDPR monitor completed');
      } catch (err) {
        logger.error('GDPR monitor cron failed', { error: String(err) });
      }
    },
    { timezone: 'UTC' }
  );

  // Certification deadline tracker: every Monday at 09:00 UTC
  cron.schedule(
    '0 9 * * 1',
    async () => {
      logger.info('Cron triggered: certification tracker');
      try {
        await runCertificationTrackerJob();
        logger.info('Certification tracker completed');
      } catch (err) {
        logger.error('Certification tracker cron failed', { error: String(err) });
      }
    },
    { timezone: 'UTC' }
  );

  // ── Session D — Business Intelligence ───────────────────────────────
  // Market/competitor monitor: every Friday at 16:00 UTC
  cron.schedule(
    '0 16 * * 5',
    async () => {
      logger.info('Cron triggered: market monitor');
      try {
        await runMarketMonitorJob();
        logger.info('Market monitor completed');
      } catch (err) {
        logger.error('Market monitor cron failed', { error: String(err) });
      }
    },
    { timezone: 'UTC' }
  );

  // Board pack: end of quarter (1st of Jan/Apr/Jul/Oct at 07:00 UTC)
  cron.schedule(
    '0 7 1 1,4,7,10 *',
    async () => {
      logger.info('Cron triggered: quarterly board pack');
      try {
        await runBoardPackJob();
        logger.info('Board pack completed');
      } catch (err) {
        logger.error('Board pack cron failed', { error: String(err) });
      }
    },
    { timezone: 'UTC' }
  );

  // Cohort analysis runs inside runMonthlySnapshot(), no separate cron needed

  logger.info('Analytics scheduler started — 14 cron jobs registered');
}
