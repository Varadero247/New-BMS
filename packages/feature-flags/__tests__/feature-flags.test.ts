/**
 * Unit tests for @ims/feature-flags package
 * Mocks fs so no actual files are written.
 */

// Mock fs before any imports
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
}));

import fs from 'fs';
import {
  isEnabled,
  getAll,
  invalidateCache,
  getAllFlags,
  getOrgOverrides,
  createFlag,
  updateFlag,
  deleteFlag,
  setOrgOverride,
  removeOrgOverride,
  seedInitialFlags,
} from '../src/index';

const mockFs = fs as jest.Mocked<typeof fs>;

// Helper: set the mock store data and clear all caches
function setStore(data: { flags: unknown[]; orgOverrides: unknown[] }) {
  (mockFs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(data));
  invalidateCache();
}

function emptyStore() {
  setStore({ flags: [], orgOverrides: [] });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockFs.existsSync.mockReturnValue(true);
  emptyStore();
});

describe('isEnabled', () => {
  it('returns false for non-existent flag (fail closed)', async () => {
    const result = await isEnabled('unknown_flag');
    expect(result).toBe(false);
  });

  it('returns global flag enabled state', async () => {
    setStore({
      flags: [{ name: 'my_feature', description: 'Test', enabled: true, createdAt: '', updatedAt: '' }],
      orgOverrides: [],
    });

    const result = await isEnabled('my_feature');
    expect(result).toBe(true);
  });

  it('returns org override when available', async () => {
    setStore({
      flags: [{ name: 'beta', description: 'Beta', enabled: false, createdAt: '', updatedAt: '' }],
      orgOverrides: [{ flagName: 'beta', orgId: 'org-1', enabled: true, createdAt: '', updatedAt: '' }],
    });

    const result = await isEnabled('beta', 'org-1');
    expect(result).toBe(true);
  });

  it('falls back to global flag when no org override', async () => {
    setStore({
      flags: [{ name: 'feature_x', description: 'X', enabled: false, createdAt: '', updatedAt: '' }],
      orgOverrides: [],
    });

    const result = await isEnabled('feature_x', 'org-2');
    expect(result).toBe(false);
  });

  it('caches result for subsequent calls', async () => {
    setStore({
      flags: [{ name: 'cached_flag', description: 'C', enabled: true, createdAt: '', updatedAt: '' }],
      orgOverrides: [],
    });

    await isEnabled('cached_flag');
    await isEnabled('cached_flag');

    // readFileSync called once per cache miss (should be 1 at most due to caching)
    expect(mockFs.readFileSync).toHaveBeenCalled();
  });
});

describe('getAll', () => {
  it('returns empty object for empty store', async () => {
    const result = await getAll();
    expect(result).toEqual({});
  });

  it('returns all flags with their states', async () => {
    setStore({
      flags: [
        { name: 'flag_a', description: 'A', enabled: true, createdAt: '', updatedAt: '' },
        { name: 'flag_b', description: 'B', enabled: false, createdAt: '', updatedAt: '' },
      ],
      orgOverrides: [],
    });

    const result = await getAll();
    expect(result).toEqual({ flag_a: true, flag_b: false });
  });

  it('applies org overrides per flag', async () => {
    setStore({
      flags: [
        { name: 'feature', description: 'F', enabled: false, createdAt: '', updatedAt: '' },
      ],
      orgOverrides: [
        { flagName: 'feature', orgId: 'org-5', enabled: true, createdAt: '', updatedAt: '' },
      ],
    });

    const result = await getAll('org-5');
    expect(result.feature).toBe(true);
  });
});

describe('invalidateCache', () => {
  it('clears specific flag cache so next call re-reads', async () => {
    setStore({
      flags: [{ name: 'f1', description: 'F1', enabled: true, createdAt: '', updatedAt: '' }],
      orgOverrides: [],
    });

    await isEnabled('f1');
    const countAfterFirst = (mockFs.readFileSync as jest.Mock).mock.calls.length;

    invalidateCache('f1');
    await isEnabled('f1');

    expect((mockFs.readFileSync as jest.Mock).mock.calls.length).toBeGreaterThan(countAfterFirst);
  });

  it('clears all caches when no flag specified', () => {
    expect(() => invalidateCache()).not.toThrow();
  });
});

describe('getAllFlags', () => {
  it('returns all flags from store', () => {
    setStore({
      flags: [
        { name: 'g1', description: 'G1', enabled: true, createdAt: '', updatedAt: '' },
        { name: 'g2', description: 'G2', enabled: false, createdAt: '', updatedAt: '' },
      ],
      orgOverrides: [],
    });

    const flags = getAllFlags();
    expect(flags).toHaveLength(2);
    expect(flags[0].name).toBe('g1');
  });

  it('returns empty array for empty store', () => {
    const flags = getAllFlags();
    expect(flags).toHaveLength(0);
  });
});

describe('getOrgOverrides', () => {
  it('returns overrides for a specific flag', () => {
    setStore({
      flags: [{ name: 'ov_flag', description: 'OV', enabled: false, createdAt: '', updatedAt: '' }],
      orgOverrides: [
        { flagName: 'ov_flag', orgId: 'org-A', enabled: true, createdAt: '', updatedAt: '' },
        { flagName: 'ov_flag', orgId: 'org-B', enabled: false, createdAt: '', updatedAt: '' },
        { flagName: 'other_flag', orgId: 'org-A', enabled: true, createdAt: '', updatedAt: '' },
      ],
    });

    const overrides = getOrgOverrides('ov_flag');
    expect(overrides).toHaveLength(2);
    expect(overrides.every((o) => o.flagName === 'ov_flag')).toBe(true);
  });
});

describe('createFlag', () => {
  it('creates a new flag', () => {
    const flag = createFlag('new_flag', 'A new feature flag');
    expect(flag).not.toBeNull();
    expect(flag?.name).toBe('new_flag');
    expect(flag?.description).toBe('A new feature flag');
    expect(flag?.enabled).toBe(false); // default
    expect(mockFs.writeFileSync).toHaveBeenCalled();
  });

  it('creates a flag as enabled when specified', () => {
    const flag = createFlag('enabled_flag', 'Enabled by default', true);
    expect(flag?.enabled).toBe(true);
  });

  it('returns null for duplicate flag name', () => {
    setStore({
      flags: [{ name: 'existing', description: 'E', enabled: false, createdAt: '', updatedAt: '' }],
      orgOverrides: [],
    });

    const result = createFlag('existing', 'Duplicate');
    expect(result).toBeNull();
  });
});

describe('updateFlag', () => {
  it('updates enabled state', () => {
    setStore({
      flags: [{ name: 'upd_flag', description: 'U', enabled: false, createdAt: '', updatedAt: '' }],
      orgOverrides: [],
    });

    const updated = updateFlag('upd_flag', { enabled: true });
    expect(updated?.enabled).toBe(true);
    expect(mockFs.writeFileSync).toHaveBeenCalled();
  });

  it('updates description', () => {
    setStore({
      flags: [{ name: 'desc_flag', description: 'Old', enabled: true, createdAt: '', updatedAt: '' }],
      orgOverrides: [],
    });

    const updated = updateFlag('desc_flag', { description: 'New description' });
    expect(updated?.description).toBe('New description');
  });

  it('returns null for non-existent flag', () => {
    const result = updateFlag('ghost_flag', { enabled: true });
    expect(result).toBeNull();
  });
});

describe('deleteFlag', () => {
  it('deletes an existing flag', () => {
    setStore({
      flags: [{ name: 'del_flag', description: 'D', enabled: true, createdAt: '', updatedAt: '' }],
      orgOverrides: [],
    });

    const result = deleteFlag('del_flag');
    expect(result).toBe(true);
    expect(mockFs.writeFileSync).toHaveBeenCalled();
  });

  it('returns false for non-existent flag', () => {
    const result = deleteFlag('no_such_flag');
    expect(result).toBe(false);
  });

  it('also removes org overrides for the deleted flag', () => {
    const capturedWrites: string[] = [];
    (mockFs.writeFileSync as jest.Mock).mockImplementation((_path: unknown, data: unknown) => {
      capturedWrites.push(String(data));
    });

    setStore({
      flags: [{ name: 'rm_flag', description: 'R', enabled: true, createdAt: '', updatedAt: '' }],
      orgOverrides: [
        { flagName: 'rm_flag', orgId: 'org-1', enabled: true, createdAt: '', updatedAt: '' },
      ],
    });

    deleteFlag('rm_flag');

    const lastWrite = JSON.parse(capturedWrites[capturedWrites.length - 1]);
    expect(lastWrite.orgOverrides.filter((o: { flagName: string }) => o.flagName === 'rm_flag')).toHaveLength(0);
  });
});

describe('setOrgOverride', () => {
  it('creates a new org override', () => {
    setStore({
      flags: [{ name: 'ov', description: 'O', enabled: false, createdAt: '', updatedAt: '' }],
      orgOverrides: [],
    });

    const override = setOrgOverride('ov', 'org-test', true);
    expect(override).not.toBeNull();
    expect(override?.flagName).toBe('ov');
    expect(override?.orgId).toBe('org-test');
    expect(override?.enabled).toBe(true);
  });

  it('returns null when flag does not exist', () => {
    const result = setOrgOverride('ghost', 'org-1', true);
    expect(result).toBeNull();
  });

  it('updates existing override', () => {
    const captured: string[] = [];
    (mockFs.writeFileSync as jest.Mock).mockImplementation((_path: unknown, data: unknown) => {
      captured.push(String(data));
    });

    setStore({
      flags: [{ name: 'upd_ov', description: 'U', enabled: false, createdAt: '', updatedAt: '' }],
      orgOverrides: [
        { flagName: 'upd_ov', orgId: 'org-1', enabled: false, createdAt: '', updatedAt: '' },
      ],
    });

    setOrgOverride('upd_ov', 'org-1', true);
    const written = JSON.parse(captured[captured.length - 1]);
    const ov = written.orgOverrides.find(
      (o: { flagName: string; orgId: string }) => o.flagName === 'upd_ov' && o.orgId === 'org-1'
    );
    expect(ov?.enabled).toBe(true);
  });
});

describe('removeOrgOverride', () => {
  it('removes an existing override', () => {
    setStore({
      flags: [{ name: 'rem_ov', description: 'R', enabled: false, createdAt: '', updatedAt: '' }],
      orgOverrides: [
        { flagName: 'rem_ov', orgId: 'org-del', enabled: true, createdAt: '', updatedAt: '' },
      ],
    });

    const result = removeOrgOverride('rem_ov', 'org-del');
    expect(result).toBe(true);
  });

  it('returns false when override does not exist', () => {
    const result = removeOrgOverride('no_flag', 'no_org');
    expect(result).toBe(false);
  });
});

describe('seedInitialFlags', () => {
  it('creates initial flags when store is empty', () => {
    const capturedWrites: string[] = [];
    (mockFs.writeFileSync as jest.Mock).mockImplementation((_path: unknown, data: unknown) => {
      capturedWrites.push(String(data));
    });

    const seeded = seedInitialFlags();

    expect(seeded.length).toBeGreaterThan(0);
    expect(seeded.some((f) => f.name === 'workflow_visual_builder')).toBe(true);
    expect(seeded.some((f) => f.name === 'natural_language_query')).toBe(true);
    expect(seeded.every((f) => f.enabled === false)).toBe(true);
  });

  it('skips flags that already exist', () => {
    setStore({
      flags: [
        {
          name: 'workflow_visual_builder',
          description: 'Already exists',
          enabled: true,
          createdAt: '',
          updatedAt: '',
        },
      ],
      orgOverrides: [],
    });

    const seeded = seedInitialFlags();
    // The existing flag should NOT be in the returned array
    expect(seeded.every((f) => f.name !== 'workflow_visual_builder')).toBe(true);
  });
});

describe('feature-flags — additional coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.existsSync.mockReturnValue(true);
    emptyStore();
  });

  it('createFlag calls writeFileSync with a JSON object containing the new flag', () => {
    const written: string[] = [];
    (mockFs.writeFileSync as jest.Mock).mockImplementation((_p: unknown, data: unknown) => {
      written.push(String(data));
    });
    createFlag('persist_test', 'Test persistence');
    const parsed = JSON.parse(written[written.length - 1]);
    expect(parsed.flags.some((f: { name: string }) => f.name === 'persist_test')).toBe(true);
  });

  it('updateFlag writes updated description to store', () => {
    setStore({
      flags: [{ name: 'upd_persist', description: 'Old', enabled: false, createdAt: '', updatedAt: '' }],
      orgOverrides: [],
    });
    const written: string[] = [];
    (mockFs.writeFileSync as jest.Mock).mockImplementation((_p: unknown, data: unknown) => {
      written.push(String(data));
    });
    updateFlag('upd_persist', { description: 'Updated' });
    const parsed = JSON.parse(written[written.length - 1]);
    const flag = parsed.flags.find((f: { name: string }) => f.name === 'upd_persist');
    expect(flag?.description).toBe('Updated');
  });

  it('deleteFlag writes store without the deleted flag', () => {
    setStore({
      flags: [{ name: 'to_delete', description: 'D', enabled: true, createdAt: '', updatedAt: '' }],
      orgOverrides: [],
    });
    const written: string[] = [];
    (mockFs.writeFileSync as jest.Mock).mockImplementation((_p: unknown, data: unknown) => {
      written.push(String(data));
    });
    deleteFlag('to_delete');
    const parsed = JSON.parse(written[written.length - 1]);
    expect(parsed.flags.some((f: { name: string }) => f.name === 'to_delete')).toBe(false);
  });

  it('getOrgOverrides returns empty array when no overrides exist for a flag', () => {
    setStore({
      flags: [{ name: 'no_ov', description: 'N', enabled: true, createdAt: '', updatedAt: '' }],
      orgOverrides: [],
    });
    expect(getOrgOverrides('no_ov')).toHaveLength(0);
  });

  it('removeOrgOverride writes store without the removed override', () => {
    setStore({
      flags: [{ name: 'rem_chk', description: 'R', enabled: false, createdAt: '', updatedAt: '' }],
      orgOverrides: [
        { flagName: 'rem_chk', orgId: 'org-rm', enabled: true, createdAt: '', updatedAt: '' },
      ],
    });
    const written: string[] = [];
    (mockFs.writeFileSync as jest.Mock).mockImplementation((_p: unknown, data: unknown) => {
      written.push(String(data));
    });
    removeOrgOverride('rem_chk', 'org-rm');
    const parsed = JSON.parse(written[written.length - 1]);
    expect(parsed.orgOverrides.some((o: { orgId: string }) => o.orgId === 'org-rm')).toBe(false);
  });

  it('isEnabled returns false for a disabled flag with no org override', async () => {
    setStore({
      flags: [{ name: 'disabled_flag', description: 'D', enabled: false, createdAt: '', updatedAt: '' }],
      orgOverrides: [],
    });
    expect(await isEnabled('disabled_flag', 'org-any')).toBe(false);
  });
});
