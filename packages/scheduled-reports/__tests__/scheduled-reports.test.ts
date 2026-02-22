import {
  REPORT_TYPES,
  createSchedule,
  listSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  runScheduleNow,
} from '../src/index';

/**
 * scheduled-reports uses module-level state seeded with 5 'default' org schedules.
 * Tests use unique orgIds to keep lists isolated; we also test deletion to clean up.
 */

let orgCounter = 0;
function uniqueOrg(): string {
  return `rpt-org-${++orgCounter}`;
}

const BASE_PARAMS = {
  name: 'Test Report',
  reportType: 'quality_kpi' as const,
  schedule: '0 8 1 * *',
  recipients: ['test@example.com'],
  format: 'pdf' as const,
};

// ─── REPORT_TYPES constant ────────────────────────────────────────────────────

describe('REPORT_TYPES', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(REPORT_TYPES)).toBe(true);
    expect(REPORT_TYPES.length).toBeGreaterThan(0);
  });

  it('each entry has value, label, and description', () => {
    for (const t of REPORT_TYPES) {
      expect(typeof t.value).toBe('string');
      expect(typeof t.label).toBe('string');
      expect(typeof t.description).toBe('string');
    }
  });
});

// ─── createSchedule ───────────────────────────────────────────────────────────

describe('createSchedule', () => {
  it('creates a schedule with required fields', () => {
    const org = uniqueOrg();
    const sched = createSchedule({ orgId: org, ...BASE_PARAMS });

    expect(sched.id).toBeTruthy();
    expect(sched.orgId).toBe(org);
    expect(sched.name).toBe('Test Report');
    expect(sched.reportType).toBe('quality_kpi');
    expect(sched.format).toBe('pdf');
    expect(sched.recipients).toEqual(['test@example.com']);
    expect(sched.enabled).toBe(true); // default
    expect(sched.lastRun).toBeNull();
    expect(typeof sched.nextRun).toBe('string');
    expect(typeof sched.createdAt).toBe('string');
  });

  it('respects enabled: false', () => {
    const sched = createSchedule({ orgId: uniqueOrg(), ...BASE_PARAMS, enabled: false });
    expect(sched.enabled).toBe(false);
  });

  it('generates nextRun from cron expression', () => {
    const sched = createSchedule({ orgId: uniqueOrg(), ...BASE_PARAMS, schedule: '0 8 1 * *' });
    const nextRun = new Date(sched.nextRun);
    expect(nextRun.getTime()).toBeGreaterThan(Date.now());
  });

  it('assigns unique IDs to each schedule', () => {
    const org = uniqueOrg();
    const s1 = createSchedule({ orgId: org, ...BASE_PARAMS });
    const s2 = createSchedule({ orgId: org, ...BASE_PARAMS });
    expect(s1.id).not.toBe(s2.id);
  });

  it('invalid cron expression falls back to tomorrow at 8am', () => {
    const sched = createSchedule({ orgId: uniqueOrg(), ...BASE_PARAMS, schedule: 'not-a-cron' });
    const nextRun = new Date(sched.nextRun);
    // Should be a future date
    expect(nextRun.getTime()).toBeGreaterThan(Date.now());
    // Hour should be 8 (fallback)
    expect(nextRun.getHours()).toBe(8);
  });
});

// ─── listSchedules ────────────────────────────────────────────────────────────

describe('listSchedules', () => {
  it('returns empty array for org with no schedules', () => {
    expect(listSchedules(uniqueOrg())).toEqual([]);
  });

  it('returns only schedules for the specified org', () => {
    const org = uniqueOrg();
    const other = uniqueOrg();
    createSchedule({ orgId: org, ...BASE_PARAMS });
    createSchedule({ orgId: other, ...BASE_PARAMS });
    expect(listSchedules(org)).toHaveLength(1);
    expect(listSchedules(org)[0].orgId).toBe(org);
  });

  it('returns all schedules for an org', () => {
    const org = uniqueOrg();
    createSchedule({ orgId: org, ...BASE_PARAMS, name: 'Sched A' });
    createSchedule({ orgId: org, ...BASE_PARAMS, name: 'Sched B' });
    expect(listSchedules(org)).toHaveLength(2);
  });

  it('seeded default org has 5 schedules', () => {
    // The module seeds 5 schedules for 'default' org on load
    expect(listSchedules('default').length).toBeGreaterThanOrEqual(5);
  });
});

// ─── getSchedule ──────────────────────────────────────────────────────────────

describe('getSchedule', () => {
  it('returns schedule by ID', () => {
    const sched = createSchedule({ orgId: uniqueOrg(), ...BASE_PARAMS });
    expect(getSchedule(sched.id)).toBeDefined();
    expect(getSchedule(sched.id)?.id).toBe(sched.id);
  });

  it('returns undefined for unknown ID', () => {
    expect(getSchedule('nonexistent')).toBeUndefined();
  });
});

// ─── updateSchedule ───────────────────────────────────────────────────────────

describe('updateSchedule', () => {
  it('returns null for unknown ID', () => {
    expect(updateSchedule('bad-id', { name: 'New Name' })).toBeNull();
  });

  it('updates name', () => {
    const sched = createSchedule({ orgId: uniqueOrg(), ...BASE_PARAMS });
    const updated = updateSchedule(sched.id, { name: 'Updated Name' });
    expect(updated!.name).toBe('Updated Name');
  });

  it('updates recipients', () => {
    const sched = createSchedule({ orgId: uniqueOrg(), ...BASE_PARAMS });
    const updated = updateSchedule(sched.id, { recipients: ['a@b.com', 'c@d.com'] });
    expect(updated!.recipients).toEqual(['a@b.com', 'c@d.com']);
  });

  it('updates enabled flag', () => {
    const sched = createSchedule({ orgId: uniqueOrg(), ...BASE_PARAMS });
    const updated = updateSchedule(sched.id, { enabled: false });
    expect(updated!.enabled).toBe(false);
  });

  it('updates schedule expression and recalculates nextRun', () => {
    const sched = createSchedule({ orgId: uniqueOrg(), ...BASE_PARAMS, schedule: '0 8 1 * *' });
    updateSchedule(sched.id, { schedule: '0 9 * * 1' }); // Different cron
    const updated = getSchedule(sched.id)!;
    // nextRun should be a valid future date
    expect(typeof updated.nextRun).toBe('string');
    expect(new Date(updated.nextRun).getTime()).toBeGreaterThan(0);
    // updatedAt should be a valid ISO string
    expect(typeof updated.updatedAt).toBe('string');
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(0);
  });

  it('updates format', () => {
    const sched = createSchedule({ orgId: uniqueOrg(), ...BASE_PARAMS });
    const updated = updateSchedule(sched.id, { format: 'csv' });
    expect(updated!.format).toBe('csv');
  });

  it('updates reportType', () => {
    const sched = createSchedule({ orgId: uniqueOrg(), ...BASE_PARAMS, reportType: 'quality_kpi' });
    const updated = updateSchedule(sched.id, { reportType: 'safety_kpi' });
    expect(updated!.reportType).toBe('safety_kpi');
  });
});

// ─── deleteSchedule ───────────────────────────────────────────────────────────

describe('deleteSchedule', () => {
  it('returns true when schedule is deleted', () => {
    const sched = createSchedule({ orgId: uniqueOrg(), ...BASE_PARAMS });
    expect(deleteSchedule(sched.id)).toBe(true);
    expect(getSchedule(sched.id)).toBeUndefined();
  });

  it('returns false for unknown ID', () => {
    expect(deleteSchedule('nonexistent')).toBe(false);
  });

  it('removes schedule from listSchedules', () => {
    const org = uniqueOrg();
    const s1 = createSchedule({ orgId: org, ...BASE_PARAMS, name: 'Keep' });
    const s2 = createSchedule({ orgId: org, ...BASE_PARAMS, name: 'Delete' });
    deleteSchedule(s2.id);
    const list = listSchedules(org);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(s1.id);
  });
});

// ─── runScheduleNow ───────────────────────────────────────────────────────────

describe('runScheduleNow', () => {
  it('returns null for unknown ID', () => {
    expect(runScheduleNow('nonexistent')).toBeNull();
  });

  it('updates lastRun to now and recalculates nextRun', () => {
    const sched = createSchedule({ orgId: uniqueOrg(), ...BASE_PARAMS });
    expect(sched.lastRun).toBeNull();

    const before = Date.now();
    const result = runScheduleNow(sched.id);
    const after = Date.now();

    expect(result).not.toBeNull();
    expect(result!.lastRun).not.toBeNull();
    const lastRunMs = new Date(result!.lastRun!).getTime();
    expect(lastRunMs).toBeGreaterThanOrEqual(before);
    expect(lastRunMs).toBeLessThanOrEqual(after);
    expect(typeof result!.nextRun).toBe('string');
  });

  it('updates updatedAt when run', async () => {
    const sched = createSchedule({ orgId: uniqueOrg(), ...BASE_PARAMS });
    const originalUpdatedAt = sched.updatedAt;
    await new Promise((r) => setTimeout(r, 5));
    runScheduleNow(sched.id);
    expect(getSchedule(sched.id)!.updatedAt).not.toBe(originalUpdatedAt);
  });
});

describe('schedule response shape and additional coverage', () => {
  it('created schedule has all expected fields', () => {
    const org = uniqueOrg();
    const sched = createSchedule({ orgId: org, ...BASE_PARAMS });
    expect(sched).toHaveProperty('id');
    expect(sched).toHaveProperty('orgId', org);
    expect(sched).toHaveProperty('name', 'Test Report');
    expect(sched).toHaveProperty('reportType', 'quality_kpi');
    expect(sched).toHaveProperty('schedule', '0 8 1 * *');
    expect(sched).toHaveProperty('recipients');
    expect(sched).toHaveProperty('format', 'pdf');
    expect(sched).toHaveProperty('enabled', true);
    expect(sched).toHaveProperty('lastRun', null);
    expect(sched).toHaveProperty('nextRun');
    expect(sched).toHaveProperty('createdAt');
    expect(sched).toHaveProperty('updatedAt');
  });

  it('updateSchedule preserves orgId and reportType when not changed', () => {
    const org = uniqueOrg();
    const sched = createSchedule({ orgId: org, ...BASE_PARAMS });
    const updated = updateSchedule(sched.id, { name: 'Changed Name' });
    expect(updated!.orgId).toBe(org);
    expect(updated!.reportType).toBe('quality_kpi');
  });

  it('listSchedules returns multiple schedules in insertion order or array form', () => {
    const org = uniqueOrg();
    createSchedule({ orgId: org, ...BASE_PARAMS, name: 'First' });
    createSchedule({ orgId: org, ...BASE_PARAMS, name: 'Second' });
    createSchedule({ orgId: org, ...BASE_PARAMS, name: 'Third' });
    const list = listSchedules(org);
    expect(list).toHaveLength(3);
    const names = list.map((s) => s.name);
    expect(names).toContain('First');
    expect(names).toContain('Second');
    expect(names).toContain('Third');
  });
});
