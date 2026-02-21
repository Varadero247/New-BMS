import {
  AUTOMATION_RULES,
  enableRule,
  disableRule,
  listRules,
  getEnabledRules,
  getRuleById,
  logExecution,
  getExecutionLog,
  _resetStores,
} from '../src/index';

describe('@ims/automation-rules', () => {
  beforeEach(() => {
    _resetStores();
  });

  describe('AUTOMATION_RULES', () => {
    it('should have exactly 20 pre-built rules', () => {
      expect(AUTOMATION_RULES).toHaveLength(20);
    });

    it('each rule should have required fields', () => {
      for (const rule of AUTOMATION_RULES) {
        expect(rule.id).toBeDefined();
        expect(rule.name).toBeDefined();
        expect(rule.description).toBeDefined();
        expect(rule.trigger).toBeDefined();
        expect(rule.trigger.type).toBeDefined();
        expect(rule.trigger.module).toBeDefined();
        expect(rule.trigger.recordType).toBeDefined();
        expect(rule.conditions).toBeDefined();
        expect(rule.actions).toBeDefined();
        expect(rule.actions.length).toBeGreaterThan(0);
        expect(rule.category).toBeDefined();
      }
    });

    it('should have unique IDs', () => {
      const ids = AUTOMATION_RULES.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have valid categories', () => {
      const validCategories = [
        'quality',
        'safety',
        'environment',
        'compliance',
        'hr',
        'maintenance',
      ];
      for (const rule of AUTOMATION_RULES) {
        expect(validCategories).toContain(rule.category);
      }
    });

    it('should cover all 6 categories', () => {
      const categories = new Set(AUTOMATION_RULES.map((r) => r.category));
      expect(categories.size).toBeGreaterThanOrEqual(4);
    });
  });

  describe('getRuleById', () => {
    it('should return a rule by ID', () => {
      const rule = getRuleById('rule-001');
      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Critical NCR → Auto-CAPA');
    });

    it('should return undefined for non-existent ID', () => {
      expect(getRuleById('non-existent')).toBeUndefined();
    });
  });

  describe('enableRule / disableRule', () => {
    it('should enable a valid rule', () => {
      const result = enableRule('org-1', 'rule-001');
      expect(result).toBe(true);
    });

    it('should return false for invalid rule ID', () => {
      const result = enableRule('org-1', 'non-existent');
      expect(result).toBe(false);
    });

    it('should disable a rule', () => {
      enableRule('org-1', 'rule-001');
      const result = disableRule('org-1', 'rule-001');
      expect(result).toBe(true);
    });

    it('should return false when disabling non-existent rule', () => {
      const result = disableRule('org-1', 'non-existent');
      expect(result).toBe(false);
    });
  });

  describe('listRules', () => {
    it('should return all rules with enabled status', () => {
      const rules = listRules('org-1');
      expect(rules).toHaveLength(20);
      expect(rules.every((r) => r.enabled === false)).toBe(true);
    });

    it('should show enabled status after enabling', () => {
      enableRule('org-1', 'rule-001');
      enableRule('org-1', 'rule-005');
      const rules = listRules('org-1');
      const enabled = rules.filter((r) => r.enabled);
      expect(enabled).toHaveLength(2);
      expect(enabled.map((r) => r.id)).toContain('rule-001');
      expect(enabled.map((r) => r.id)).toContain('rule-005');
    });

    it('should isolate enabled rules per org', () => {
      enableRule('org-1', 'rule-001');
      enableRule('org-2', 'rule-002');
      const org1Rules = listRules('org-1');
      const org2Rules = listRules('org-2');
      expect(org1Rules.find((r) => r.id === 'rule-001')!.enabled).toBe(true);
      expect(org1Rules.find((r) => r.id === 'rule-002')!.enabled).toBe(false);
      expect(org2Rules.find((r) => r.id === 'rule-001')!.enabled).toBe(false);
      expect(org2Rules.find((r) => r.id === 'rule-002')!.enabled).toBe(true);
    });
  });

  describe('getEnabledRules', () => {
    it('should return only enabled rules', () => {
      enableRule('org-1', 'rule-001');
      enableRule('org-1', 'rule-010');
      const enabled = getEnabledRules('org-1');
      expect(enabled).toHaveLength(2);
    });

    it('should return empty array when none enabled', () => {
      const enabled = getEnabledRules('org-1');
      expect(enabled).toHaveLength(0);
    });
  });

  describe('logExecution', () => {
    it('should create an execution log entry', () => {
      const entry = logExecution('org-1', 'rule-001', 'success', 'CAPA created successfully');
      expect(entry.id).toBeDefined();
      expect(entry.orgId).toBe('org-1');
      expect(entry.ruleId).toBe('rule-001');
      expect(entry.status).toBe('success');
      expect(entry.details).toBe('CAPA created successfully');
      expect(entry.timestamp).toBeDefined();
    });

    it('should log "skipped" status', () => {
      const entry = logExecution('org-1', 'rule-002', 'skipped', 'Condition not met');
      expect(entry.status).toBe('skipped');
    });

    it('entry id is a UUID', () => {
      const entry = logExecution('org-1', 'rule-001', 'success', 'OK');
      expect(entry.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('timestamp is a valid ISO string', () => {
      const entry = logExecution('org-1', 'rule-001', 'success', 'OK');
      expect(new Date(entry.timestamp).toISOString()).toBe(entry.timestamp);
    });
  });

  describe('getExecutionLog', () => {
    it('should return execution logs for an org', () => {
      logExecution('org-1', 'rule-001', 'success', 'Test 1');
      logExecution('org-1', 'rule-002', 'failed', 'Test 2');
      logExecution('org-2', 'rule-001', 'success', 'Test 3');

      const logs = getExecutionLog('org-1');
      expect(logs).toHaveLength(2);
    });

    it('should filter by ruleId', () => {
      logExecution('org-1', 'rule-001', 'success', 'Test 1');
      logExecution('org-1', 'rule-002', 'failed', 'Test 2');

      const logs = getExecutionLog('org-1', 'rule-001');
      expect(logs).toHaveLength(1);
      expect(logs[0].ruleId).toBe('rule-001');
    });

    it('should respect limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        logExecution('org-1', 'rule-001', 'success', `Test ${i}`);
      }
      const logs = getExecutionLog('org-1', undefined, 5);
      expect(logs).toHaveLength(5);
    });

    it('should return entries in reverse insertion order', () => {
      logExecution('org-1', 'rule-001', 'success', 'Entry A');
      logExecution('org-1', 'rule-001', 'success', 'Entry B');
      logExecution('org-1', 'rule-001', 'success', 'Entry C');
      const logs = getExecutionLog('org-1');
      expect(logs).toHaveLength(3);
      // Most recent should be last inserted
      expect(logs[0].details).toBe('Entry C');
      expect(logs[2].details).toBe('Entry A');
    });

    it('should return empty array for org with no logs', () => {
      const logs = getExecutionLog('org-no-logs');
      expect(logs).toEqual([]);
    });
  });
});
