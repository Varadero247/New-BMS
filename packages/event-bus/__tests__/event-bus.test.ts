import { EventPublisher } from '../src/publisher';
import { EventSubscriber } from '../src/subscriber';
import { NEXARA_EVENTS, getEventTriggers, getAllEventTypes } from '../src/events';
import { EventPayload } from '../src/types';

// Mock ioredis so tests don't need a real Redis connection
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    xadd: jest.fn().mockResolvedValue('1-0'),
    xgroup: jest.fn().mockResolvedValue('OK'),
    xreadgroup: jest.fn().mockResolvedValue(null),
    xack: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue('OK'),
  }));
});

describe('@ims/event-bus', () => {
  describe('NEXARA_EVENTS registry', () => {
    it('should contain 17 event types', () => {
      expect(Object.keys(NEXARA_EVENTS)).toHaveLength(17);
    });

    it('should have description and triggers for every event', () => {
      for (const [eventType, config] of Object.entries(NEXARA_EVENTS)) {
        expect(config.description).toBeDefined();
        expect(typeof config.description).toBe('string');
        expect(config.description.length).toBeGreaterThan(0);
        expect(Array.isArray(config.triggers)).toBe(true);
        expect(config.triggers.length).toBeGreaterThan(0);
      }
    });

    it('should include calibration.failed event', () => {
      expect(NEXARA_EVENTS['calibration.failed']).toBeDefined();
      expect(NEXARA_EVENTS['calibration.failed'].triggers).toContain('quality.ncr.auto_create');
      expect(NEXARA_EVENTS['calibration.failed'].triggers).toContain('cmms.asset.quarantine');
    });

    it('should include incident.reported event', () => {
      expect(NEXARA_EVENTS['incident.reported']).toBeDefined();
      expect(NEXARA_EVENTS['incident.reported'].triggers).toContain('cmms.permit_to_work.review');
    });

    it('should include invoice.overdue event', () => {
      expect(NEXARA_EVENTS['invoice.overdue']).toBeDefined();
      expect(NEXARA_EVENTS['invoice.overdue'].triggers).toContain('crm.account.alert');
    });

    it('should include deal.closed_won event with cross-module triggers', () => {
      expect(NEXARA_EVENTS['deal.closed_won']).toBeDefined();
      expect(NEXARA_EVENTS['deal.closed_won'].triggers).toContain('finance.invoice.draft_create');
      expect(NEXARA_EVENTS['deal.closed_won'].triggers).toContain('pm.project.auto_create');
      expect(NEXARA_EVENTS['deal.closed_won'].triggers).toContain('workflow.onboarding.trigger');
    });

    it('should include equipment.failure event', () => {
      expect(NEXARA_EVENTS['equipment.failure']).toBeDefined();
      expect(NEXARA_EVENTS['equipment.failure'].triggers).toContain(
        'health_safety.incident.prompt'
      );
    });

    it('should include payroll.run.complete event', () => {
      expect(NEXARA_EVENTS['payroll.run.complete']).toBeDefined();
      expect(NEXARA_EVENTS['payroll.run.complete'].triggers).toContain(
        'esg.social.gender_pay_gap.recalculate'
      );
    });

    it('should include training.completed event', () => {
      expect(NEXARA_EVENTS['training.completed']).toBeDefined();
      expect(NEXARA_EVENTS['training.completed'].triggers).toContain('quality.competency.update');
      expect(NEXARA_EVENTS['training.completed'].triggers).toContain('hr.training_matrix.update');
    });

    it('should include portal events', () => {
      expect(NEXARA_EVENTS['portal.complaint.submitted']).toBeDefined();
      expect(NEXARA_EVENTS['portal.supplier.ppap_submitted']).toBeDefined();
    });

    it('should include ai.incident.reported event', () => {
      expect(NEXARA_EVENTS['ai.incident.reported']).toBeDefined();
      expect(NEXARA_EVENTS['ai.incident.reported'].triggers).toContain('infosec.incident.review');
    });

    it('should include anti-bribery events', () => {
      expect(NEXARA_EVENTS['antibribery.gift.reported']).toBeDefined();
      expect(NEXARA_EVENTS['antibribery.investigation.opened']).toBeDefined();
      expect(NEXARA_EVENTS['antibribery.investigation.opened'].triggers).toContain(
        'hr.suspension.review'
      );
    });
  });

  describe('getEventTriggers', () => {
    it('should return triggers for known event', () => {
      const triggers = getEventTriggers('calibration.failed');
      expect(triggers).toEqual(['quality.ncr.auto_create', 'cmms.asset.quarantine']);
    });

    it('should return empty array for unknown event', () => {
      const triggers = getEventTriggers('nonexistent.event');
      expect(triggers).toEqual([]);
    });

    it('should return triggers for energy.consumption.logged', () => {
      const triggers = getEventTriggers('energy.consumption.logged');
      expect(triggers).toContain('esg.carbon_intensity.update');
      expect(triggers).toContain('iso50001.enpi.recalculate');
    });
  });

  describe('getAllEventTypes', () => {
    it('should return all event type names', () => {
      const types = getAllEventTypes();
      expect(types).toHaveLength(17);
      expect(types).toContain('calibration.failed');
      expect(types).toContain('deal.closed_won');
      expect(types).toContain('incident.reported');
      expect(types).toContain('invoice.overdue');
    });

    it('should return strings', () => {
      const types = getAllEventTypes();
      types.forEach((t) => expect(typeof t).toBe('string'));
    });
  });

  describe('EventPublisher', () => {
    it('should create publisher without redis URL', () => {
      const publisher = new EventPublisher();
      expect(publisher).toBeDefined();
    });

    it('should create publisher with redis URL', () => {
      const publisher = new EventPublisher('redis://localhost:6379');
      expect(publisher).toBeDefined();
    });

    it('should publish event and return UUID id', async () => {
      const publisher = new EventPublisher('redis://localhost:6379');
      const id = await publisher.publish(
        'calibration.failed',
        { assetId: '123' },
        {
          source: 'quality-service',
          organisationId: 'org-1',
          userId: 'user-1',
        }
      );
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
      await publisher.disconnect();
    });

    it('should call local handler on publish', async () => {
      const publisher = new EventPublisher();
      const handler = jest.fn().mockResolvedValue(undefined);
      publisher.onLocal('calibration.failed', handler);

      await publisher.publish(
        'calibration.failed',
        { assetId: '123' },
        {
          source: 'quality-service',
          organisationId: 'org-1',
        }
      );

      expect(handler).toHaveBeenCalledTimes(1);
      const payload: EventPayload = handler.mock.calls[0][0];
      expect(payload.type).toBe('calibration.failed');
      expect(payload.source).toBe('quality-service');
      expect(payload.organisationId).toBe('org-1');
      expect(payload.data).toEqual({ assetId: '123' });
    });

    it('should generate payload with ISO timestamp', async () => {
      const publisher = new EventPublisher();
      const handler = jest.fn().mockResolvedValue(undefined);
      publisher.onLocal('incident.reported', handler);

      await publisher.publish(
        'incident.reported',
        { location: 'Zone A' },
        {
          source: 'hs-service',
          organisationId: 'org-1',
        }
      );

      const payload: EventPayload = handler.mock.calls[0][0];
      expect(payload.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should generate unique IDs for each publish', async () => {
      const publisher = new EventPublisher();
      const ids = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const id = await publisher.publish(
          'calibration.failed',
          { i },
          {
            source: 'test',
            organisationId: 'org-1',
          }
        );
        ids.add(id);
      }
      expect(ids.size).toBe(10);
    });

    it('should not call handler for different event type', async () => {
      const publisher = new EventPublisher();
      const handler = jest.fn().mockResolvedValue(undefined);
      publisher.onLocal('calibration.failed', handler);

      await publisher.publish(
        'incident.reported',
        { data: 'test' },
        {
          source: 'test',
          organisationId: 'org-1',
        }
      );

      expect(handler).not.toHaveBeenCalled();
    });

    it('should disconnect cleanly without redis', async () => {
      const publisher = new EventPublisher();
      await expect(publisher.disconnect()).resolves.toBeUndefined();
    });

    it('should include userId when provided', async () => {
      const publisher = new EventPublisher();
      const handler = jest.fn().mockResolvedValue(undefined);
      publisher.onLocal('deal.closed_won', handler);

      await publisher.publish(
        'deal.closed_won',
        { dealId: 'd1' },
        {
          source: 'crm-service',
          organisationId: 'org-1',
          userId: 'user-42',
        }
      );

      const payload: EventPayload = handler.mock.calls[0][0];
      expect(payload.userId).toBe('user-42');
    });
  });

  describe('EventSubscriber', () => {
    it('should create subscriber without redis URL', () => {
      const subscriber = new EventSubscriber();
      expect(subscriber).toBeDefined();
    });

    it('should create subscriber with redis URL', () => {
      const subscriber = new EventSubscriber('redis://localhost:6379');
      expect(subscriber).toBeDefined();
    });

    it('should add subscription via subscribe()', () => {
      const subscriber = new EventSubscriber();
      const handler = jest.fn();
      subscriber.subscribe('calibration.failed', handler, 'quality-group');
      // No error means subscription was added
      expect(true).toBe(true);
    });

    it('should not throw when starting without redis', async () => {
      const subscriber = new EventSubscriber();
      subscriber.subscribe('calibration.failed', jest.fn());
      await expect(subscriber.start()).resolves.toBeUndefined();
    });

    it('should stop cleanly without redis', async () => {
      const subscriber = new EventSubscriber();
      await expect(subscriber.stop()).resolves.toBeUndefined();
    });

    it('should accept multiple subscriptions', () => {
      const subscriber = new EventSubscriber();
      subscriber.subscribe('calibration.failed', jest.fn());
      subscriber.subscribe('incident.reported', jest.fn());
      subscriber.subscribe('deal.closed_won', jest.fn(), 'crm-group');
      // No error
      expect(true).toBe(true);
    });
  });
});
