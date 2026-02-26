// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  createPermissions,
  grant,
  revoke,
  has,
  hasAll,
  hasAny,
  combine,
  intersection,
  toList,
  fromList,
  createRole,
  canUser,
  getUserPermissions,
  addRole,
  removeRole,
  hasRole,
  createPolicy,
  evaluate,
  encodeClaims,
  decodeClaims,
  hasClaim,
} from '../permission-utils';

describe('createPermissions', () => {
  it('returns empty object for empty flags', () => {
    expect(createPermissions([])).toEqual({});
  });

  it('single flag gets bit 1', () => {
    expect(createPermissions(['READ'])).toEqual({ READ: 1 });
  });

  it('two flags: READ=1, WRITE=2', () => {
    expect(createPermissions(['READ', 'WRITE'])).toEqual({ READ: 1, WRITE: 2 });
  });

  it('three flags: READ=1, WRITE=2, DELETE=4', () => {
    expect(createPermissions(['READ', 'WRITE', 'DELETE'])).toEqual({ READ: 1, WRITE: 2, DELETE: 4 });
  });

  it('four flags assigns 1,2,4,8', () => {
    const p = createPermissions(['A','B','C','D']);
    expect(p.A).toBe(1); expect(p.B).toBe(2); expect(p.C).toBe(4); expect(p.D).toBe(8);
  });

  it('five flags last bit is 16', () => {
    const p = createPermissions(['A','B','C','D','E']);
    expect(p.E).toBe(16);
  });

  it('six flags last bit is 32', () => {
    const p = createPermissions(['A','B','C','D','E','F']);
    expect(p.F).toBe(32);
  });

  it('seven flags last bit is 64', () => {
    const p = createPermissions(['A','B','C','D','E','F','G']);
    expect(p.G).toBe(64);
  });

  it('eight flags last bit is 128', () => {
    const p = createPermissions(['A','B','C','D','E','F','G','H']);
    expect(p.H).toBe(128);
  });

  it('all bits are powers of 2', () => {
    const flags = ['A','B','C','D','E','F','G','H'];
    const p = createPermissions(flags);
    flags.forEach((f, i) => { expect(p[f]).toBe(1 << i); });
  });

  it('flag names are preserved exactly', () => {
    const p = createPermissions(['read_all', 'write_all']);
    expect(p['read_all']).toBe(1); expect(p['write_all']).toBe(2);
  });

  it('numeric string flag names work', () => {
    const p = createPermissions(['1','2','3']);
    expect(p['1']).toBe(1); expect(p['2']).toBe(2); expect(p['3']).toBe(4);
  });

  it('10 flags produces correct last bit 512', () => {
    const flags = Array.from({length:10}, (_,i) => 'F'+i);
    const p = createPermissions(flags);
    expect(p['F9']).toBe(512);
  });

  it('12 flags produces last bit 2048', () => {
    const flags = Array.from({length:12}, (_,i) => 'F'+i);
    const p = createPermissions(flags);
    expect(p['F11']).toBe(2048);
  });

  it('result has same number of keys as flags', () => {
    const flags = ['X','Y','Z'];
    expect(Object.keys(createPermissions(flags)).length).toBe(3);
  });

  it('bits are all distinct', () => {
    const flags = ['A','B','C','D','E'];
    const p = createPermissions(flags);
    const vals = Object.values(p);
    expect(new Set(vals).size).toBe(vals.length);
  });

  it('no two bits overlap (AND of any pair is 0)', () => {
    const p = createPermissions(['R','W','D','E','A']);
    const vals = Object.values(p);
    for(let i=0;i<vals.length;i++) for(let j=i+1;j<vals.length;j++) {
      expect(vals[i] & vals[j]).toBe(0);
    }
  });

  it('OR of all bits equals sum', () => {
    const p = createPermissions(['A','B','C','D']);
    const vals = Object.values(p);
    const orVal = vals.reduce((a,b) => a|b, 0);
    const sum = vals.reduce((a,b) => a+b, 0);
    expect(orVal).toBe(sum);
  });

  it('first flag is always 1', () => {
    const p = createPermissions(['ANYTHING']);
    expect(Object.values(p)[0]).toBe(1);
  });

  it('second flag is always 2', () => {
    const p = createPermissions(['X','Y']);
    expect(p['Y']).toBe(2);
  });

  it('special chars in flag names preserved', () => {
    const p = createPermissions(['perm:read', 'perm:write']);
    expect(p['perm:read']).toBe(1);
    expect(p['perm:write']).toBe(2);
  });

  it('createPermissions with ADMIN flag at index 4 = 16', () => {
    const p = createPermissions(['READ','WRITE','DELETE','EXECUTE','ADMIN']);
    expect(p.ADMIN).toBe(16);
  });

  it('createPermissions returns plain object', () => {
    expect(createPermissions(['A']) instanceof Object).toBe(true);
  });

  it('createPermissions does not mutate input array', () => {
    const flags = ['A','B'];
    createPermissions(flags);
    expect(flags).toEqual(['A','B']);
  });

  it('16 flags last bit is 32768', () => {
    const flags = Array.from({length:16}, (_,i) => 'P'+i);
    const p = createPermissions(flags);
    expect(p['P15']).toBe(32768);
  });

  it('createPermissions with 1 flags: each key has distinct power-of-2 value (variant 0)', () => {
    const flags = Array.from({length:1}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 2 flags: each key has distinct power-of-2 value (variant 1)', () => {
    const flags = Array.from({length:2}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 3 flags: each key has distinct power-of-2 value (variant 2)', () => {
    const flags = Array.from({length:3}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 4 flags: each key has distinct power-of-2 value (variant 3)', () => {
    const flags = Array.from({length:4}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 5 flags: each key has distinct power-of-2 value (variant 4)', () => {
    const flags = Array.from({length:5}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 6 flags: each key has distinct power-of-2 value (variant 5)', () => {
    const flags = Array.from({length:6}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 7 flags: each key has distinct power-of-2 value (variant 6)', () => {
    const flags = Array.from({length:7}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 8 flags: each key has distinct power-of-2 value (variant 7)', () => {
    const flags = Array.from({length:8}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 9 flags: each key has distinct power-of-2 value (variant 8)', () => {
    const flags = Array.from({length:9}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 10 flags: each key has distinct power-of-2 value (variant 9)', () => {
    const flags = Array.from({length:10}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 11 flags: each key has distinct power-of-2 value (variant 10)', () => {
    const flags = Array.from({length:11}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 12 flags: each key has distinct power-of-2 value (variant 11)', () => {
    const flags = Array.from({length:12}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 13 flags: each key has distinct power-of-2 value (variant 12)', () => {
    const flags = Array.from({length:13}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 14 flags: each key has distinct power-of-2 value (variant 13)', () => {
    const flags = Array.from({length:14}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 15 flags: each key has distinct power-of-2 value (variant 14)', () => {
    const flags = Array.from({length:15}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 16 flags: each key has distinct power-of-2 value (variant 15)', () => {
    const flags = Array.from({length:16}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 17 flags: each key has distinct power-of-2 value (variant 16)', () => {
    const flags = Array.from({length:17}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 18 flags: each key has distinct power-of-2 value (variant 17)', () => {
    const flags = Array.from({length:18}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 19 flags: each key has distinct power-of-2 value (variant 18)', () => {
    const flags = Array.from({length:19}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 20 flags: each key has distinct power-of-2 value (variant 19)', () => {
    const flags = Array.from({length:20}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 21 flags: each key has distinct power-of-2 value (variant 20)', () => {
    const flags = Array.from({length:21}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 22 flags: each key has distinct power-of-2 value (variant 21)', () => {
    const flags = Array.from({length:22}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 23 flags: each key has distinct power-of-2 value (variant 22)', () => {
    const flags = Array.from({length:23}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 24 flags: each key has distinct power-of-2 value (variant 23)', () => {
    const flags = Array.from({length:24}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

  it('createPermissions with 25 flags: each key has distinct power-of-2 value (variant 24)', () => {
    const flags = Array.from({length:25}, (_,i) => 'FLAG'+i);
    const p = createPermissions(flags);
    flags.forEach((f, idx) => { expect(p[f]).toBe(1 << idx); });
  });

});

describe('grant', () => {
  it('grant READ to empty mask', () => {
    expect(grant(0, 1)).toBe(1);
  });

  it('grant WRITE to empty mask', () => {
    expect(grant(0, 2)).toBe(2);
  });

  it('grant DELETE to empty mask', () => {
    expect(grant(0, 4)).toBe(4);
  });

  it('grant already-set bit is idempotent', () => {
    expect(grant(1, 1)).toBe(1);
  });

  it('grant WRITE when READ already set', () => {
    expect(grant(1, 2)).toBe(3);
  });

  it('grant READ when WRITE already set', () => {
    expect(grant(2, 1)).toBe(3);
  });

  it('grant to full mask is idempotent', () => {
    expect(grant(255, 128)).toBe(255);
  });

  it('grant 0 does not change mask', () => {
    expect(grant(5, 0)).toBe(5);
  });

  it('grant returns correct bits for mask=0,perm=8', () => {
    expect(grant(0, 8)).toBe(8);
  });

  it('grant returns correct bits for mask=0,perm=16', () => {
    expect(grant(0, 16)).toBe(16);
  });

  it('grant 64 to mask=63 gives 127', () => {
    expect(grant(63, 64)).toBe(127);
  });

  it('grant 128 to mask=127 gives 255', () => {
    expect(grant(127, 128)).toBe(255);
  });

  it('grant does not affect unrelated bits', () => {
    expect(grant(5, 2)).toBe(7);
  });

  it('grant 32 to 0 gives 32', () => {
    expect(grant(0, 32)).toBe(32);
  });

  it('grant does not subtract bits', () => {
    expect(grant(7, 1)).toBeGreaterThanOrEqual(7);
  });

  it('grant(0, 1) === 1 (variant 0)', () => {
    expect(grant(0, 1)).toBe(1);
  });

  it('grant(1, 2) === 3 (variant 1)', () => {
    expect(grant(1, 2)).toBe(3);
  });

  it('grant(2, 4) === 6 (variant 2)', () => {
    expect(grant(2, 4)).toBe(6);
  });

  it('grant(3, 8) === 11 (variant 3)', () => {
    expect(grant(3, 8)).toBe(11);
  });

  it('grant(4, 16) === 20 (variant 4)', () => {
    expect(grant(4, 16)).toBe(20);
  });

  it('grant(5, 32) === 37 (variant 5)', () => {
    expect(grant(5, 32)).toBe(37);
  });

  it('grant(6, 64) === 70 (variant 6)', () => {
    expect(grant(6, 64)).toBe(70);
  });

  it('grant(7, 128) === 135 (variant 7)', () => {
    expect(grant(7, 128)).toBe(135);
  });

  it('grant(8, 1) === 9 (variant 8)', () => {
    expect(grant(8, 1)).toBe(9);
  });

  it('grant(9, 2) === 11 (variant 9)', () => {
    expect(grant(9, 2)).toBe(11);
  });

  it('grant(10, 4) === 14 (variant 10)', () => {
    expect(grant(10, 4)).toBe(14);
  });

  it('grant(11, 8) === 11 (variant 11)', () => {
    expect(grant(11, 8)).toBe(11);
  });

  it('grant(12, 16) === 28 (variant 12)', () => {
    expect(grant(12, 16)).toBe(28);
  });

  it('grant(13, 32) === 45 (variant 13)', () => {
    expect(grant(13, 32)).toBe(45);
  });

  it('grant(14, 64) === 78 (variant 14)', () => {
    expect(grant(14, 64)).toBe(78);
  });

  it('grant(15, 128) === 143 (variant 15)', () => {
    expect(grant(15, 128)).toBe(143);
  });

  it('grant(0, 1) === 1 (variant 16)', () => {
    expect(grant(0, 1)).toBe(1);
  });

  it('grant(1, 2) === 3 (variant 17)', () => {
    expect(grant(1, 2)).toBe(3);
  });

  it('grant(2, 4) === 6 (variant 18)', () => {
    expect(grant(2, 4)).toBe(6);
  });

  it('grant(3, 8) === 11 (variant 19)', () => {
    expect(grant(3, 8)).toBe(11);
  });

  it('grant(4, 16) === 20 (variant 20)', () => {
    expect(grant(4, 16)).toBe(20);
  });

  it('grant(5, 32) === 37 (variant 21)', () => {
    expect(grant(5, 32)).toBe(37);
  });

  it('grant(6, 64) === 70 (variant 22)', () => {
    expect(grant(6, 64)).toBe(70);
  });

  it('grant(7, 128) === 135 (variant 23)', () => {
    expect(grant(7, 128)).toBe(135);
  });

  it('grant(8, 1) === 9 (variant 24)', () => {
    expect(grant(8, 1)).toBe(9);
  });

  it('grant(9, 2) === 11 (variant 25)', () => {
    expect(grant(9, 2)).toBe(11);
  });

  it('grant(10, 4) === 14 (variant 26)', () => {
    expect(grant(10, 4)).toBe(14);
  });

  it('grant(11, 8) === 11 (variant 27)', () => {
    expect(grant(11, 8)).toBe(11);
  });

  it('grant(12, 16) === 28 (variant 28)', () => {
    expect(grant(12, 16)).toBe(28);
  });

  it('grant(13, 32) === 45 (variant 29)', () => {
    expect(grant(13, 32)).toBe(45);
  });

  it('grant(14, 64) === 78 (variant 30)', () => {
    expect(grant(14, 64)).toBe(78);
  });

  it('grant(15, 128) === 143 (variant 31)', () => {
    expect(grant(15, 128)).toBe(143);
  });

  it('grant(0, 1) === 1 (variant 32)', () => {
    expect(grant(0, 1)).toBe(1);
  });

  it('grant(1, 2) === 3 (variant 33)', () => {
    expect(grant(1, 2)).toBe(3);
  });

  it('grant(2, 4) === 6 (variant 34)', () => {
    expect(grant(2, 4)).toBe(6);
  });

});

describe('revoke', () => {
  it('revoke READ from mask with only READ', () => {
    expect(revoke(1, 1)).toBe(0);
  });

  it('revoke WRITE from mask=3 leaves 1', () => {
    expect(revoke(3, 2)).toBe(1);
  });

  it('revoke READ from mask=3 leaves 2', () => {
    expect(revoke(3, 1)).toBe(2);
  });

  it('revoke bit not set is no-op', () => {
    expect(revoke(1, 2)).toBe(1);
  });

  it('revoke from 0 stays 0', () => {
    expect(revoke(0, 1)).toBe(0);
  });

  it('revoke all bits from 255', () => {
    expect(revoke(revoke(revoke(revoke(revoke(revoke(revoke(revoke(255,128),64),32),16),8),4),2),1)).toBe(0);
  });

  it('revoke 4 from 7 gives 3', () => {
    expect(revoke(7, 4)).toBe(3);
  });

  it('revoke 0 does not change mask', () => {
    expect(revoke(5, 0)).toBe(5);
  });

  it('revoke 128 from 255 gives 127', () => {
    expect(revoke(255, 128)).toBe(127);
  });

  it('revoke 64 from 127 gives 63', () => {
    expect(revoke(127, 64)).toBe(63);
  });

  it('revoke is idempotent when bit absent', () => {
    expect(revoke(revoke(4, 2), 2)).toBe(4);
  });

  it('revoke does not add bits', () => {
    expect(revoke(5, 2)).toBeLessThanOrEqual(5);
  });

  it('revoke(255, 1) === 254 (variant 0)', () => {
    expect(revoke(255, 1)).toBe(254);
  });

  it('revoke(255, 2) === 253 (variant 1)', () => {
    expect(revoke(255, 2)).toBe(253);
  });

  it('revoke(255, 4) === 251 (variant 2)', () => {
    expect(revoke(255, 4)).toBe(251);
  });

  it('revoke(255, 8) === 247 (variant 3)', () => {
    expect(revoke(255, 8)).toBe(247);
  });

  it('revoke(255, 16) === 239 (variant 4)', () => {
    expect(revoke(255, 16)).toBe(239);
  });

  it('revoke(255, 32) === 223 (variant 5)', () => {
    expect(revoke(255, 32)).toBe(223);
  });

  it('revoke(255, 64) === 191 (variant 6)', () => {
    expect(revoke(255, 64)).toBe(191);
  });

  it('revoke(255, 128) === 127 (variant 7)', () => {
    expect(revoke(255, 128)).toBe(127);
  });

  it('revoke(255, 1) === 254 (variant 8)', () => {
    expect(revoke(255, 1)).toBe(254);
  });

  it('revoke(255, 2) === 253 (variant 9)', () => {
    expect(revoke(255, 2)).toBe(253);
  });

  it('revoke(255, 4) === 251 (variant 10)', () => {
    expect(revoke(255, 4)).toBe(251);
  });

  it('revoke(255, 8) === 247 (variant 11)', () => {
    expect(revoke(255, 8)).toBe(247);
  });

  it('revoke(255, 16) === 239 (variant 12)', () => {
    expect(revoke(255, 16)).toBe(239);
  });

  it('revoke(255, 32) === 223 (variant 13)', () => {
    expect(revoke(255, 32)).toBe(223);
  });

  it('revoke(255, 64) === 191 (variant 14)', () => {
    expect(revoke(255, 64)).toBe(191);
  });

  it('revoke(255, 128) === 127 (variant 15)', () => {
    expect(revoke(255, 128)).toBe(127);
  });

  it('revoke(255, 1) === 254 (variant 16)', () => {
    expect(revoke(255, 1)).toBe(254);
  });

  it('revoke(255, 2) === 253 (variant 17)', () => {
    expect(revoke(255, 2)).toBe(253);
  });

  it('revoke(255, 4) === 251 (variant 18)', () => {
    expect(revoke(255, 4)).toBe(251);
  });

  it('revoke(255, 8) === 247 (variant 19)', () => {
    expect(revoke(255, 8)).toBe(247);
  });

  it('revoke(255, 16) === 239 (variant 20)', () => {
    expect(revoke(255, 16)).toBe(239);
  });

  it('revoke(255, 32) === 223 (variant 21)', () => {
    expect(revoke(255, 32)).toBe(223);
  });

  it('revoke(255, 64) === 191 (variant 22)', () => {
    expect(revoke(255, 64)).toBe(191);
  });

  it('revoke(255, 128) === 127 (variant 23)', () => {
    expect(revoke(255, 128)).toBe(127);
  });

  it('revoke(255, 1) === 254 (variant 24)', () => {
    expect(revoke(255, 1)).toBe(254);
  });

  it('revoke(255, 2) === 253 (variant 25)', () => {
    expect(revoke(255, 2)).toBe(253);
  });

  it('revoke(255, 4) === 251 (variant 26)', () => {
    expect(revoke(255, 4)).toBe(251);
  });

  it('revoke(255, 8) === 247 (variant 27)', () => {
    expect(revoke(255, 8)).toBe(247);
  });

  it('revoke(255, 16) === 239 (variant 28)', () => {
    expect(revoke(255, 16)).toBe(239);
  });

  it('revoke(255, 32) === 223 (variant 29)', () => {
    expect(revoke(255, 32)).toBe(223);
  });

  it('revoke(255, 64) === 191 (variant 30)', () => {
    expect(revoke(255, 64)).toBe(191);
  });

  it('revoke(255, 128) === 127 (variant 31)', () => {
    expect(revoke(255, 128)).toBe(127);
  });

  it('revoke(255, 1) === 254 (variant 32)', () => {
    expect(revoke(255, 1)).toBe(254);
  });

  it('revoke(255, 2) === 253 (variant 33)', () => {
    expect(revoke(255, 2)).toBe(253);
  });

  it('revoke(255, 4) === 251 (variant 34)', () => {
    expect(revoke(255, 4)).toBe(251);
  });

  it('revoke(255, 8) === 247 (variant 35)', () => {
    expect(revoke(255, 8)).toBe(247);
  });

  it('revoke(255, 16) === 239 (variant 36)', () => {
    expect(revoke(255, 16)).toBe(239);
  });

  it('revoke(255, 32) === 223 (variant 37)', () => {
    expect(revoke(255, 32)).toBe(223);
  });

});

describe('has', () => {
  it('has(1, 1) true', () => {
    expect(has(1, 1)).toBe(true);
  });

  it('has(0, 1) false', () => {
    expect(has(0, 1)).toBe(false);
  });

  it('has(3, 1) true', () => {
    expect(has(3, 1)).toBe(true);
  });

  it('has(3, 2) true', () => {
    expect(has(3, 2)).toBe(true);
  });

  it('has(2, 1) false', () => {
    expect(has(2, 1)).toBe(false);
  });

  it('has(1, 2) false', () => {
    expect(has(1, 2)).toBe(false);
  });

  it('has(255, 128) true', () => {
    expect(has(255, 128)).toBe(true);
  });

  it('has(127, 128) false', () => {
    expect(has(127, 128)).toBe(false);
  });

  it('has(mask, 0) always true', () => {
    expect(has(0, 0)).toBe(true); expect(has(255, 0)).toBe(true);
  });

  it('has(7, 4) true', () => {
    expect(has(7, 4)).toBe(true);
  });

  it('has(6, 1) false', () => {
    expect(has(6, 1)).toBe(false);
  });

  it('has(4, 4) true', () => {
    expect(has(4, 4)).toBe(true);
  });

  it('has(4, 2) false', () => {
    expect(has(4, 2)).toBe(false);
  });

  it('has(4, 1) false', () => {
    expect(has(4, 1)).toBe(false);
  });

  it('has(8, 8) true', () => {
    expect(has(8, 8)).toBe(true);
  });

  it('has(16, 16) true', () => {
    expect(has(16, 16)).toBe(true);
  });

  it('has(32, 32) true', () => {
    expect(has(32, 32)).toBe(true);
  });

  it('has(64, 64) true', () => {
    expect(has(64, 64)).toBe(true);
  });

  it('has(128, 128) true', () => {
    expect(has(128, 128)).toBe(true);
  });

  it('has after grant is true', () => {
    expect(has(grant(0, 4), 4)).toBe(true);
  });

  it('has after revoke is false', () => {
    expect(has(revoke(7, 4), 4)).toBe(false);
  });

  it('has(255, 1) true (variant 0)', () => {
    expect(has(255, 1)).toBe(true);
  });

  it('has(253, 2) false (variant 1)', () => {
    expect(has(253, 2)).toBe(false);
  });

  it('has(255, 4) true (variant 2)', () => {
    expect(has(255, 4)).toBe(true);
  });

  it('has(247, 8) false (variant 3)', () => {
    expect(has(247, 8)).toBe(false);
  });

  it('has(255, 16) true (variant 4)', () => {
    expect(has(255, 16)).toBe(true);
  });

  it('has(223, 32) false (variant 5)', () => {
    expect(has(223, 32)).toBe(false);
  });

  it('has(255, 64) true (variant 6)', () => {
    expect(has(255, 64)).toBe(true);
  });

  it('has(127, 128) false (variant 7)', () => {
    expect(has(127, 128)).toBe(false);
  });

  it('has(255, 1) true (variant 8)', () => {
    expect(has(255, 1)).toBe(true);
  });

  it('has(253, 2) false (variant 9)', () => {
    expect(has(253, 2)).toBe(false);
  });

  it('has(255, 4) true (variant 10)', () => {
    expect(has(255, 4)).toBe(true);
  });

  it('has(247, 8) false (variant 11)', () => {
    expect(has(247, 8)).toBe(false);
  });

  it('has(255, 16) true (variant 12)', () => {
    expect(has(255, 16)).toBe(true);
  });

  it('has(223, 32) false (variant 13)', () => {
    expect(has(223, 32)).toBe(false);
  });

  it('has(255, 64) true (variant 14)', () => {
    expect(has(255, 64)).toBe(true);
  });

  it('has(127, 128) false (variant 15)', () => {
    expect(has(127, 128)).toBe(false);
  });

  it('has(255, 1) true (variant 16)', () => {
    expect(has(255, 1)).toBe(true);
  });

  it('has(253, 2) false (variant 17)', () => {
    expect(has(253, 2)).toBe(false);
  });

  it('has(255, 4) true (variant 18)', () => {
    expect(has(255, 4)).toBe(true);
  });

  it('has(247, 8) false (variant 19)', () => {
    expect(has(247, 8)).toBe(false);
  });

  it('has(255, 16) true (variant 20)', () => {
    expect(has(255, 16)).toBe(true);
  });

  it('has(223, 32) false (variant 21)', () => {
    expect(has(223, 32)).toBe(false);
  });

  it('has(255, 64) true (variant 22)', () => {
    expect(has(255, 64)).toBe(true);
  });

  it('has(127, 128) false (variant 23)', () => {
    expect(has(127, 128)).toBe(false);
  });

  it('has(255, 1) true (variant 24)', () => {
    expect(has(255, 1)).toBe(true);
  });

  it('has(253, 2) false (variant 25)', () => {
    expect(has(253, 2)).toBe(false);
  });

  it('has(255, 4) true (variant 26)', () => {
    expect(has(255, 4)).toBe(true);
  });

  it('has(247, 8) false (variant 27)', () => {
    expect(has(247, 8)).toBe(false);
  });

  it('has(255, 16) true (variant 28)', () => {
    expect(has(255, 16)).toBe(true);
  });

  it('has(223, 32) false (variant 29)', () => {
    expect(has(223, 32)).toBe(false);
  });

  it('has(255, 64) true (variant 30)', () => {
    expect(has(255, 64)).toBe(true);
  });

  it('has(127, 128) false (variant 31)', () => {
    expect(has(127, 128)).toBe(false);
  });

  it('has(255, 1) true (variant 32)', () => {
    expect(has(255, 1)).toBe(true);
  });

  it('has(253, 2) false (variant 33)', () => {
    expect(has(253, 2)).toBe(false);
  });

  it('has(255, 4) true (variant 34)', () => {
    expect(has(255, 4)).toBe(true);
  });

  it('has(247, 8) false (variant 35)', () => {
    expect(has(247, 8)).toBe(false);
  });

  it('has(255, 16) true (variant 36)', () => {
    expect(has(255, 16)).toBe(true);
  });

  it('has(223, 32) false (variant 37)', () => {
    expect(has(223, 32)).toBe(false);
  });

  it('has(255, 64) true (variant 38)', () => {
    expect(has(255, 64)).toBe(true);
  });

  it('has(127, 128) false (variant 39)', () => {
    expect(has(127, 128)).toBe(false);
  });

  it('has(255, 1) true (variant 40)', () => {
    expect(has(255, 1)).toBe(true);
  });

  it('has(253, 2) false (variant 41)', () => {
    expect(has(253, 2)).toBe(false);
  });

  it('has(255, 4) true (variant 42)', () => {
    expect(has(255, 4)).toBe(true);
  });

  it('has(247, 8) false (variant 43)', () => {
    expect(has(247, 8)).toBe(false);
  });

  it('has(255, 16) true (variant 44)', () => {
    expect(has(255, 16)).toBe(true);
  });

  it('has(223, 32) false (variant 45)', () => {
    expect(has(223, 32)).toBe(false);
  });

  it('has(255, 64) true (variant 46)', () => {
    expect(has(255, 64)).toBe(true);
  });

  it('has(127, 128) false (variant 47)', () => {
    expect(has(127, 128)).toBe(false);
  });

  it('has(255, 1) true (variant 48)', () => {
    expect(has(255, 1)).toBe(true);
  });

  it('has(253, 2) false (variant 49)', () => {
    expect(has(253, 2)).toBe(false);
  });

  it('has(255, 4) true (variant 50)', () => {
    expect(has(255, 4)).toBe(true);
  });

  it('has(247, 8) false (variant 51)', () => {
    expect(has(247, 8)).toBe(false);
  });

  it('has(255, 16) true (variant 52)', () => {
    expect(has(255, 16)).toBe(true);
  });

  it('has(223, 32) false (variant 53)', () => {
    expect(has(223, 32)).toBe(false);
  });

  it('has(255, 64) true (variant 54)', () => {
    expect(has(255, 64)).toBe(true);
  });

  it('has(127, 128) false (variant 55)', () => {
    expect(has(127, 128)).toBe(false);
  });

  it('has(255, 1) true (variant 56)', () => {
    expect(has(255, 1)).toBe(true);
  });

  it('has(253, 2) false (variant 57)', () => {
    expect(has(253, 2)).toBe(false);
  });

  it('has(255, 4) true (variant 58)', () => {
    expect(has(255, 4)).toBe(true);
  });

  it('has(247, 8) false (variant 59)', () => {
    expect(has(247, 8)).toBe(false);
  });

  it('has(255, 16) true (variant 60)', () => {
    expect(has(255, 16)).toBe(true);
  });

  it('has(223, 32) false (variant 61)', () => {
    expect(has(223, 32)).toBe(false);
  });

  it('has(255, 64) true (variant 62)', () => {
    expect(has(255, 64)).toBe(true);
  });

  it('has(127, 128) false (variant 63)', () => {
    expect(has(127, 128)).toBe(false);
  });

  it('has(255, 1) true (variant 64)', () => {
    expect(has(255, 1)).toBe(true);
  });

  it('has(253, 2) false (variant 65)', () => {
    expect(has(253, 2)).toBe(false);
  });

  it('has(255, 4) true (variant 66)', () => {
    expect(has(255, 4)).toBe(true);
  });

  it('has(247, 8) false (variant 67)', () => {
    expect(has(247, 8)).toBe(false);
  });

  it('has(255, 16) true (variant 68)', () => {
    expect(has(255, 16)).toBe(true);
  });

  it('has(223, 32) false (variant 69)', () => {
    expect(has(223, 32)).toBe(false);
  });

  it('has(255, 64) true (variant 70)', () => {
    expect(has(255, 64)).toBe(true);
  });

  it('has(127, 128) false (variant 71)', () => {
    expect(has(127, 128)).toBe(false);
  });

  it('has(255, 1) true (variant 72)', () => {
    expect(has(255, 1)).toBe(true);
  });

  it('has(253, 2) false (variant 73)', () => {
    expect(has(253, 2)).toBe(false);
  });

  it('has(255, 4) true (variant 74)', () => {
    expect(has(255, 4)).toBe(true);
  });

  it('has(247, 8) false (variant 75)', () => {
    expect(has(247, 8)).toBe(false);
  });

  it('has(255, 16) true (variant 76)', () => {
    expect(has(255, 16)).toBe(true);
  });

  it('has(223, 32) false (variant 77)', () => {
    expect(has(223, 32)).toBe(false);
  });

  it('has(255, 64) true (variant 78)', () => {
    expect(has(255, 64)).toBe(true);
  });

});

describe('hasAll', () => {
  it('hasAll with empty permissions list is true', () => {
    expect(hasAll(0, [])).toBe(true);
  });

  it('hasAll(7, [1,2,4]) true', () => {
    expect(hasAll(7, [1, 2, 4])).toBe(true);
  });

  it('hasAll(6, [1,2]) false - missing 1', () => {
    expect(hasAll(6, [1, 2])).toBe(false);
  });

  it('hasAll(3, [1,2]) true', () => {
    expect(hasAll(3, [1, 2])).toBe(true);
  });

  it('hasAll(1, [1,2]) false', () => {
    expect(hasAll(1, [1, 2])).toBe(false);
  });

  it('hasAll(255, [1,2,4,8,16,32,64,128]) true', () => {
    expect(hasAll(255, [1,2,4,8,16,32,64,128])).toBe(true);
  });

  it('hasAll(254, [1,2,4,8,16,32,64,128]) false - missing 1', () => {
    expect(hasAll(254, [1,2,4,8,16,32,64,128])).toBe(false);
  });

  it('hasAll(0, [1]) false', () => {
    expect(hasAll(0, [1])).toBe(false);
  });

  it('hasAll single permission present', () => {
    expect(hasAll(4, [4])).toBe(true);
  });

  it('hasAll single permission absent', () => {
    expect(hasAll(2, [4])).toBe(false);
  });

  it('hasAll with repeated permission', () => {
    expect(hasAll(3, [1,1,2])).toBe(true);
  });

  it('hasAll(15, [1,2,4,8]) true', () => {
    expect(hasAll(15, [1,2,4,8])).toBe(true);
  });

  it('hasAll(14, [1,2,4,8]) false', () => {
    expect(hasAll(14, [1,2,4,8])).toBe(false);
  });

  it('hasAll with subset of bits', () => {
    expect(hasAll(255, [1,4,16,64])).toBe(true);
  });

  it('hasAll returns false if any bit missing', () => {
    expect(hasAll(7, [1,2,4,8])).toBe(false);
  });

  it('hasAll(7, [1, 2]) === true (variant 0)', () => {
    expect(hasAll(7, [1, 2])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4]) === true (variant 1)', () => {
    expect(hasAll(15, [1, 2, 4])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4, 8]) === false (variant 2)', () => {
    expect(hasAll(7, [1, 2, 4, 8])).toBe(false);
  });

  it('hasAll(15, [1, 2]) === true (variant 3)', () => {
    expect(hasAll(15, [1, 2])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4]) === true (variant 4)', () => {
    expect(hasAll(7, [1, 2, 4])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4, 8]) === true (variant 5)', () => {
    expect(hasAll(15, [1, 2, 4, 8])).toBe(true);
  });

  it('hasAll(7, [1, 2]) === true (variant 6)', () => {
    expect(hasAll(7, [1, 2])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4]) === true (variant 7)', () => {
    expect(hasAll(15, [1, 2, 4])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4, 8]) === false (variant 8)', () => {
    expect(hasAll(7, [1, 2, 4, 8])).toBe(false);
  });

  it('hasAll(15, [1, 2]) === true (variant 9)', () => {
    expect(hasAll(15, [1, 2])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4]) === true (variant 10)', () => {
    expect(hasAll(7, [1, 2, 4])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4, 8]) === true (variant 11)', () => {
    expect(hasAll(15, [1, 2, 4, 8])).toBe(true);
  });

  it('hasAll(7, [1, 2]) === true (variant 12)', () => {
    expect(hasAll(7, [1, 2])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4]) === true (variant 13)', () => {
    expect(hasAll(15, [1, 2, 4])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4, 8]) === false (variant 14)', () => {
    expect(hasAll(7, [1, 2, 4, 8])).toBe(false);
  });

  it('hasAll(15, [1, 2]) === true (variant 15)', () => {
    expect(hasAll(15, [1, 2])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4]) === true (variant 16)', () => {
    expect(hasAll(7, [1, 2, 4])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4, 8]) === true (variant 17)', () => {
    expect(hasAll(15, [1, 2, 4, 8])).toBe(true);
  });

  it('hasAll(7, [1, 2]) === true (variant 18)', () => {
    expect(hasAll(7, [1, 2])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4]) === true (variant 19)', () => {
    expect(hasAll(15, [1, 2, 4])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4, 8]) === false (variant 20)', () => {
    expect(hasAll(7, [1, 2, 4, 8])).toBe(false);
  });

  it('hasAll(15, [1, 2]) === true (variant 21)', () => {
    expect(hasAll(15, [1, 2])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4]) === true (variant 22)', () => {
    expect(hasAll(7, [1, 2, 4])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4, 8]) === true (variant 23)', () => {
    expect(hasAll(15, [1, 2, 4, 8])).toBe(true);
  });

  it('hasAll(7, [1, 2]) === true (variant 24)', () => {
    expect(hasAll(7, [1, 2])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4]) === true (variant 25)', () => {
    expect(hasAll(15, [1, 2, 4])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4, 8]) === false (variant 26)', () => {
    expect(hasAll(7, [1, 2, 4, 8])).toBe(false);
  });

  it('hasAll(15, [1, 2]) === true (variant 27)', () => {
    expect(hasAll(15, [1, 2])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4]) === true (variant 28)', () => {
    expect(hasAll(7, [1, 2, 4])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4, 8]) === true (variant 29)', () => {
    expect(hasAll(15, [1, 2, 4, 8])).toBe(true);
  });

  it('hasAll(7, [1, 2]) === true (variant 30)', () => {
    expect(hasAll(7, [1, 2])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4]) === true (variant 31)', () => {
    expect(hasAll(15, [1, 2, 4])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4, 8]) === false (variant 32)', () => {
    expect(hasAll(7, [1, 2, 4, 8])).toBe(false);
  });

  it('hasAll(15, [1, 2]) === true (variant 33)', () => {
    expect(hasAll(15, [1, 2])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4]) === true (variant 34)', () => {
    expect(hasAll(7, [1, 2, 4])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4, 8]) === true (variant 35)', () => {
    expect(hasAll(15, [1, 2, 4, 8])).toBe(true);
  });

  it('hasAll(7, [1, 2]) === true (variant 36)', () => {
    expect(hasAll(7, [1, 2])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4]) === true (variant 37)', () => {
    expect(hasAll(15, [1, 2, 4])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4, 8]) === false (variant 38)', () => {
    expect(hasAll(7, [1, 2, 4, 8])).toBe(false);
  });

  it('hasAll(15, [1, 2]) === true (variant 39)', () => {
    expect(hasAll(15, [1, 2])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4]) === true (variant 40)', () => {
    expect(hasAll(7, [1, 2, 4])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4, 8]) === true (variant 41)', () => {
    expect(hasAll(15, [1, 2, 4, 8])).toBe(true);
  });

  it('hasAll(7, [1, 2]) === true (variant 42)', () => {
    expect(hasAll(7, [1, 2])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4]) === true (variant 43)', () => {
    expect(hasAll(15, [1, 2, 4])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4, 8]) === false (variant 44)', () => {
    expect(hasAll(7, [1, 2, 4, 8])).toBe(false);
  });

  it('hasAll(15, [1, 2]) === true (variant 45)', () => {
    expect(hasAll(15, [1, 2])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4]) === true (variant 46)', () => {
    expect(hasAll(7, [1, 2, 4])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4, 8]) === true (variant 47)', () => {
    expect(hasAll(15, [1, 2, 4, 8])).toBe(true);
  });

  it('hasAll(7, [1, 2]) === true (variant 48)', () => {
    expect(hasAll(7, [1, 2])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4]) === true (variant 49)', () => {
    expect(hasAll(15, [1, 2, 4])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4, 8]) === false (variant 50)', () => {
    expect(hasAll(7, [1, 2, 4, 8])).toBe(false);
  });

  it('hasAll(15, [1, 2]) === true (variant 51)', () => {
    expect(hasAll(15, [1, 2])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4]) === true (variant 52)', () => {
    expect(hasAll(7, [1, 2, 4])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4, 8]) === true (variant 53)', () => {
    expect(hasAll(15, [1, 2, 4, 8])).toBe(true);
  });

  it('hasAll(7, [1, 2]) === true (variant 54)', () => {
    expect(hasAll(7, [1, 2])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4]) === true (variant 55)', () => {
    expect(hasAll(15, [1, 2, 4])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4, 8]) === false (variant 56)', () => {
    expect(hasAll(7, [1, 2, 4, 8])).toBe(false);
  });

  it('hasAll(15, [1, 2]) === true (variant 57)', () => {
    expect(hasAll(15, [1, 2])).toBe(true);
  });

  it('hasAll(7, [1, 2, 4]) === true (variant 58)', () => {
    expect(hasAll(7, [1, 2, 4])).toBe(true);
  });

  it('hasAll(15, [1, 2, 4, 8]) === true (variant 59)', () => {
    expect(hasAll(15, [1, 2, 4, 8])).toBe(true);
  });

});

describe('hasAny', () => {
  it('hasAny with empty permissions list is false', () => {
    expect(hasAny(7, [])).toBe(false);
  });

  it('hasAny(1, [1,2]) true', () => {
    expect(hasAny(1, [1, 2])).toBe(true);
  });

  it('hasAny(2, [1,2]) true', () => {
    expect(hasAny(2, [1, 2])).toBe(true);
  });

  it('hasAny(0, [1,2]) false', () => {
    expect(hasAny(0, [1, 2])).toBe(false);
  });

  it('hasAny(4, [1,2]) false', () => {
    expect(hasAny(4, [1, 2])).toBe(false);
  });

  it('hasAny(4, [4]) true', () => {
    expect(hasAny(4, [4])).toBe(true);
  });

  it('hasAny(3, [4,8]) false', () => {
    expect(hasAny(3, [4, 8])).toBe(false);
  });

  it('hasAny(255, [128]) true', () => {
    expect(hasAny(255, [128])).toBe(true);
  });

  it('hasAny(127, [128]) false', () => {
    expect(hasAny(127, [128])).toBe(false);
  });

  it('hasAny with single match in many permissions', () => {
    expect(hasAny(8, [1,2,4,8,16])).toBe(true);
  });

  it('hasAny(0, [0]) true - zero perm always passes has()', () => {
    expect(hasAny(0, [0])).toBe(true);
  });

  it('hasAny short-circuits on first match', () => {
    expect(hasAny(1, [1,2,4])).toBe(true);
  });

  it('hasAny(16, [1,2,4,8,32]) false', () => {
    expect(hasAny(16, [1,2,4,8,32])).toBe(false);
  });

  it('hasAny(16, [1,2,4,8,16]) true', () => {
    expect(hasAny(16, [1,2,4,8,16])).toBe(true);
  });

  it('hasAny preserves immutability', () => {
    const perms = [1, 2, 4];
    hasAny(7, perms);
    expect(perms).toEqual([1, 2, 4]);
  });

  it('hasAny(0, [2, 1]) === false (variant 0)', () => {
    expect(hasAny(0, [2, 1])).toBe(false);
  });

  it('hasAny(2, [4, 2]) === true (variant 1)', () => {
    expect(hasAny(2, [4, 2])).toBe(true);
  });

  it('hasAny(4, [8, 4]) === true (variant 2)', () => {
    expect(hasAny(4, [8, 4])).toBe(true);
  });

  it('hasAny(0, [16, 8]) === false (variant 3)', () => {
    expect(hasAny(0, [16, 8])).toBe(false);
  });

  it('hasAny(16, [32, 16]) === true (variant 4)', () => {
    expect(hasAny(16, [32, 16])).toBe(true);
  });

  it('hasAny(32, [64, 32]) === true (variant 5)', () => {
    expect(hasAny(32, [64, 32])).toBe(true);
  });

  it('hasAny(0, [128, 64]) === false (variant 6)', () => {
    expect(hasAny(0, [128, 64])).toBe(false);
  });

  it('hasAny(128, [1, 128]) === true (variant 7)', () => {
    expect(hasAny(128, [1, 128])).toBe(true);
  });

  it('hasAny(1, [2, 1]) === true (variant 8)', () => {
    expect(hasAny(1, [2, 1])).toBe(true);
  });

  it('hasAny(0, [4, 2]) === false (variant 9)', () => {
    expect(hasAny(0, [4, 2])).toBe(false);
  });

  it('hasAny(4, [8, 4]) === true (variant 10)', () => {
    expect(hasAny(4, [8, 4])).toBe(true);
  });

  it('hasAny(8, [16, 8]) === true (variant 11)', () => {
    expect(hasAny(8, [16, 8])).toBe(true);
  });

  it('hasAny(0, [32, 16]) === false (variant 12)', () => {
    expect(hasAny(0, [32, 16])).toBe(false);
  });

  it('hasAny(32, [64, 32]) === true (variant 13)', () => {
    expect(hasAny(32, [64, 32])).toBe(true);
  });

  it('hasAny(64, [128, 64]) === true (variant 14)', () => {
    expect(hasAny(64, [128, 64])).toBe(true);
  });

  it('hasAny(0, [1, 128]) === false (variant 15)', () => {
    expect(hasAny(0, [1, 128])).toBe(false);
  });

  it('hasAny(1, [2, 1]) === true (variant 16)', () => {
    expect(hasAny(1, [2, 1])).toBe(true);
  });

  it('hasAny(2, [4, 2]) === true (variant 17)', () => {
    expect(hasAny(2, [4, 2])).toBe(true);
  });

  it('hasAny(0, [8, 4]) === false (variant 18)', () => {
    expect(hasAny(0, [8, 4])).toBe(false);
  });

  it('hasAny(8, [16, 8]) === true (variant 19)', () => {
    expect(hasAny(8, [16, 8])).toBe(true);
  });

  it('hasAny(16, [32, 16]) === true (variant 20)', () => {
    expect(hasAny(16, [32, 16])).toBe(true);
  });

  it('hasAny(0, [64, 32]) === false (variant 21)', () => {
    expect(hasAny(0, [64, 32])).toBe(false);
  });

  it('hasAny(64, [128, 64]) === true (variant 22)', () => {
    expect(hasAny(64, [128, 64])).toBe(true);
  });

  it('hasAny(128, [1, 128]) === true (variant 23)', () => {
    expect(hasAny(128, [1, 128])).toBe(true);
  });

  it('hasAny(0, [2, 1]) === false (variant 24)', () => {
    expect(hasAny(0, [2, 1])).toBe(false);
  });

  it('hasAny(2, [4, 2]) === true (variant 25)', () => {
    expect(hasAny(2, [4, 2])).toBe(true);
  });

  it('hasAny(4, [8, 4]) === true (variant 26)', () => {
    expect(hasAny(4, [8, 4])).toBe(true);
  });

  it('hasAny(0, [16, 8]) === false (variant 27)', () => {
    expect(hasAny(0, [16, 8])).toBe(false);
  });

  it('hasAny(16, [32, 16]) === true (variant 28)', () => {
    expect(hasAny(16, [32, 16])).toBe(true);
  });

  it('hasAny(32, [64, 32]) === true (variant 29)', () => {
    expect(hasAny(32, [64, 32])).toBe(true);
  });

  it('hasAny(0, [128, 64]) === false (variant 30)', () => {
    expect(hasAny(0, [128, 64])).toBe(false);
  });

  it('hasAny(128, [1, 128]) === true (variant 31)', () => {
    expect(hasAny(128, [1, 128])).toBe(true);
  });

  it('hasAny(1, [2, 1]) === true (variant 32)', () => {
    expect(hasAny(1, [2, 1])).toBe(true);
  });

  it('hasAny(0, [4, 2]) === false (variant 33)', () => {
    expect(hasAny(0, [4, 2])).toBe(false);
  });

  it('hasAny(4, [8, 4]) === true (variant 34)', () => {
    expect(hasAny(4, [8, 4])).toBe(true);
  });

  it('hasAny(8, [16, 8]) === true (variant 35)', () => {
    expect(hasAny(8, [16, 8])).toBe(true);
  });

  it('hasAny(0, [32, 16]) === false (variant 36)', () => {
    expect(hasAny(0, [32, 16])).toBe(false);
  });

  it('hasAny(32, [64, 32]) === true (variant 37)', () => {
    expect(hasAny(32, [64, 32])).toBe(true);
  });

  it('hasAny(64, [128, 64]) === true (variant 38)', () => {
    expect(hasAny(64, [128, 64])).toBe(true);
  });

  it('hasAny(0, [1, 128]) === false (variant 39)', () => {
    expect(hasAny(0, [1, 128])).toBe(false);
  });

  it('hasAny(1, [2, 1]) === true (variant 40)', () => {
    expect(hasAny(1, [2, 1])).toBe(true);
  });

  it('hasAny(2, [4, 2]) === true (variant 41)', () => {
    expect(hasAny(2, [4, 2])).toBe(true);
  });

  it('hasAny(0, [8, 4]) === false (variant 42)', () => {
    expect(hasAny(0, [8, 4])).toBe(false);
  });

  it('hasAny(8, [16, 8]) === true (variant 43)', () => {
    expect(hasAny(8, [16, 8])).toBe(true);
  });

  it('hasAny(16, [32, 16]) === true (variant 44)', () => {
    expect(hasAny(16, [32, 16])).toBe(true);
  });

  it('hasAny(0, [64, 32]) === false (variant 45)', () => {
    expect(hasAny(0, [64, 32])).toBe(false);
  });

  it('hasAny(64, [128, 64]) === true (variant 46)', () => {
    expect(hasAny(64, [128, 64])).toBe(true);
  });

  it('hasAny(128, [1, 128]) === true (variant 47)', () => {
    expect(hasAny(128, [1, 128])).toBe(true);
  });

  it('hasAny(0, [2, 1]) === false (variant 48)', () => {
    expect(hasAny(0, [2, 1])).toBe(false);
  });

  it('hasAny(2, [4, 2]) === true (variant 49)', () => {
    expect(hasAny(2, [4, 2])).toBe(true);
  });

  it('hasAny(4, [8, 4]) === true (variant 50)', () => {
    expect(hasAny(4, [8, 4])).toBe(true);
  });

  it('hasAny(0, [16, 8]) === false (variant 51)', () => {
    expect(hasAny(0, [16, 8])).toBe(false);
  });

  it('hasAny(16, [32, 16]) === true (variant 52)', () => {
    expect(hasAny(16, [32, 16])).toBe(true);
  });

  it('hasAny(32, [64, 32]) === true (variant 53)', () => {
    expect(hasAny(32, [64, 32])).toBe(true);
  });

  it('hasAny(0, [128, 64]) === false (variant 54)', () => {
    expect(hasAny(0, [128, 64])).toBe(false);
  });

  it('hasAny(128, [1, 128]) === true (variant 55)', () => {
    expect(hasAny(128, [1, 128])).toBe(true);
  });

  it('hasAny(1, [2, 1]) === true (variant 56)', () => {
    expect(hasAny(1, [2, 1])).toBe(true);
  });

  it('hasAny(0, [4, 2]) === false (variant 57)', () => {
    expect(hasAny(0, [4, 2])).toBe(false);
  });

  it('hasAny(4, [8, 4]) === true (variant 58)', () => {
    expect(hasAny(4, [8, 4])).toBe(true);
  });

  it('hasAny(8, [16, 8]) === true (variant 59)', () => {
    expect(hasAny(8, [16, 8])).toBe(true);
  });

});

describe('combine', () => {
  it('combine() with no args returns 0', () => {
    expect(combine()).toBe(0);
  });

  it('combine(0) returns 0', () => {
    expect(combine(0)).toBe(0);
  });

  it('combine(1) returns 1', () => {
    expect(combine(1)).toBe(1);
  });

  it('combine(1, 2) returns 3', () => {
    expect(combine(1, 2)).toBe(3);
  });

  it('combine(1, 2, 4) returns 7', () => {
    expect(combine(1, 2, 4)).toBe(7);
  });

  it('combine(1, 1) returns 1 (idempotent)', () => {
    expect(combine(1, 1)).toBe(1);
  });

  it('combine(0, 0) returns 0', () => {
    expect(combine(0, 0)).toBe(0);
  });

  it('combine(128, 64, 32, 16, 8, 4, 2, 1) returns 255', () => {
    expect(combine(128,64,32,16,8,4,2,1)).toBe(255);
  });

  it('combine is order-independent', () => {
    expect(combine(4, 2, 1)).toBe(combine(1, 2, 4));
  });

  it('combine with 0 does not change result', () => {
    expect(combine(5, 0)).toBe(5);
  });

  it('combine single arg returns that arg', () => {
    expect(combine(42)).toBe(42);
  });

  it('combine(255, 0) returns 255', () => {
    expect(combine(255, 0)).toBe(255);
  });

  it('combine is associative', () => {
    expect(combine(combine(1,2),4)).toBe(combine(1,combine(2,4)));
  });

  it('combine(16, 32) returns 48', () => {
    expect(combine(16, 32)).toBe(48);
  });

  it('combine large values', () => {
    expect(combine(1024, 2048)).toBe(3072);
  });

  it('combine(1, 4) === 5 (variant 0)', () => {
    expect(combine(1, 4)).toBe(5);
  });

  it('combine(2, 8) === 10 (variant 1)', () => {
    expect(combine(2, 8)).toBe(10);
  });

  it('combine(4, 16) === 20 (variant 2)', () => {
    expect(combine(4, 16)).toBe(20);
  });

  it('combine(8, 32) === 40 (variant 3)', () => {
    expect(combine(8, 32)).toBe(40);
  });

  it('combine(16, 1) === 17 (variant 4)', () => {
    expect(combine(16, 1)).toBe(17);
  });

  it('combine(32, 2) === 34 (variant 5)', () => {
    expect(combine(32, 2)).toBe(34);
  });

  it('combine(1, 4) === 5 (variant 6)', () => {
    expect(combine(1, 4)).toBe(5);
  });

  it('combine(2, 8) === 10 (variant 7)', () => {
    expect(combine(2, 8)).toBe(10);
  });

  it('combine(4, 16) === 20 (variant 8)', () => {
    expect(combine(4, 16)).toBe(20);
  });

  it('combine(8, 32) === 40 (variant 9)', () => {
    expect(combine(8, 32)).toBe(40);
  });

  it('combine(16, 1) === 17 (variant 10)', () => {
    expect(combine(16, 1)).toBe(17);
  });

  it('combine(32, 2) === 34 (variant 11)', () => {
    expect(combine(32, 2)).toBe(34);
  });

  it('combine(1, 4) === 5 (variant 12)', () => {
    expect(combine(1, 4)).toBe(5);
  });

  it('combine(2, 8) === 10 (variant 13)', () => {
    expect(combine(2, 8)).toBe(10);
  });

  it('combine(4, 16) === 20 (variant 14)', () => {
    expect(combine(4, 16)).toBe(20);
  });

  it('combine(8, 32) === 40 (variant 15)', () => {
    expect(combine(8, 32)).toBe(40);
  });

  it('combine(16, 1) === 17 (variant 16)', () => {
    expect(combine(16, 1)).toBe(17);
  });

  it('combine(32, 2) === 34 (variant 17)', () => {
    expect(combine(32, 2)).toBe(34);
  });

  it('combine(1, 4) === 5 (variant 18)', () => {
    expect(combine(1, 4)).toBe(5);
  });

  it('combine(2, 8) === 10 (variant 19)', () => {
    expect(combine(2, 8)).toBe(10);
  });

  it('combine(4, 16) === 20 (variant 20)', () => {
    expect(combine(4, 16)).toBe(20);
  });

  it('combine(8, 32) === 40 (variant 21)', () => {
    expect(combine(8, 32)).toBe(40);
  });

  it('combine(16, 1) === 17 (variant 22)', () => {
    expect(combine(16, 1)).toBe(17);
  });

  it('combine(32, 2) === 34 (variant 23)', () => {
    expect(combine(32, 2)).toBe(34);
  });

  it('combine(1, 4) === 5 (variant 24)', () => {
    expect(combine(1, 4)).toBe(5);
  });

  it('combine(2, 8) === 10 (variant 25)', () => {
    expect(combine(2, 8)).toBe(10);
  });

  it('combine(4, 16) === 20 (variant 26)', () => {
    expect(combine(4, 16)).toBe(20);
  });

  it('combine(8, 32) === 40 (variant 27)', () => {
    expect(combine(8, 32)).toBe(40);
  });

  it('combine(16, 1) === 17 (variant 28)', () => {
    expect(combine(16, 1)).toBe(17);
  });

  it('combine(32, 2) === 34 (variant 29)', () => {
    expect(combine(32, 2)).toBe(34);
  });

  it('combine(1, 4) === 5 (variant 30)', () => {
    expect(combine(1, 4)).toBe(5);
  });

  it('combine(2, 8) === 10 (variant 31)', () => {
    expect(combine(2, 8)).toBe(10);
  });

  it('combine(4, 16) === 20 (variant 32)', () => {
    expect(combine(4, 16)).toBe(20);
  });

  it('combine(8, 32) === 40 (variant 33)', () => {
    expect(combine(8, 32)).toBe(40);
  });

  it('combine(16, 1) === 17 (variant 34)', () => {
    expect(combine(16, 1)).toBe(17);
  });

});

describe('intersection', () => {
  it('intersection() with no args returns 0', () => {
    expect(intersection()).toBe(0);
  });

  it('intersection(7, 3) returns 3', () => {
    expect(intersection(7, 3)).toBe(3);
  });

  it('intersection(1, 2) returns 0', () => {
    expect(intersection(1, 2)).toBe(0);
  });

  it('intersection(255, 255) returns 255', () => {
    expect(intersection(255, 255)).toBe(255);
  });

  it('intersection(0, 255) returns 0', () => {
    expect(intersection(0, 255)).toBe(0);
  });

  it('intersection(7, 7, 7) returns 7', () => {
    expect(intersection(7, 7, 7)).toBe(7);
  });

  it('intersection(15, 7) returns 7', () => {
    expect(intersection(15, 7)).toBe(7);
  });

  it('intersection(3, 6) returns 2', () => {
    expect(intersection(3, 6)).toBe(2);
  });

  it('intersection single arg returns that arg', () => {
    expect(intersection(42)).toBe(42);
  });

  it('intersection is commutative', () => {
    expect(intersection(5, 3)).toBe(intersection(3, 5));
  });

  it('intersection(255, 128) returns 128', () => {
    expect(intersection(255, 128)).toBe(128);
  });

  it('intersection(254, 1) returns 0', () => {
    expect(intersection(254, 1)).toBe(0);
  });

  it('intersection(7, 3, 1) returns 1', () => {
    expect(intersection(7, 3, 1)).toBe(1);
  });

  it('intersection of non-overlapping is 0', () => {
    expect(intersection(1, 2)).toBe(0);
  });

  it('intersection is associative', () => {
    expect(intersection(intersection(7,5),3)).toBe(intersection(7,intersection(5,3)));
  });

  it('intersection(5, 7) === 5 (variant 0)', () => {
    expect(intersection(5, 7)).toBe(5);
  });

  it('intersection(22, 20) === 20 (variant 1)', () => {
    expect(intersection(22, 20)).toBe(20);
  });

  it('intersection(39, 33) === 33 (variant 2)', () => {
    expect(intersection(39, 33)).toBe(33);
  });

  it('intersection(56, 46) === 40 (variant 3)', () => {
    expect(intersection(56, 46)).toBe(40);
  });

  it('intersection(73, 59) === 9 (variant 4)', () => {
    expect(intersection(73, 59)).toBe(9);
  });

  it('intersection(90, 72) === 72 (variant 5)', () => {
    expect(intersection(90, 72)).toBe(72);
  });

  it('intersection(107, 85) === 65 (variant 6)', () => {
    expect(intersection(107, 85)).toBe(65);
  });

  it('intersection(124, 98) === 96 (variant 7)', () => {
    expect(intersection(124, 98)).toBe(96);
  });

  it('intersection(141, 111) === 13 (variant 8)', () => {
    expect(intersection(141, 111)).toBe(13);
  });

  it('intersection(158, 124) === 28 (variant 9)', () => {
    expect(intersection(158, 124)).toBe(28);
  });

  it('intersection(175, 137) === 137 (variant 10)', () => {
    expect(intersection(175, 137)).toBe(137);
  });

  it('intersection(192, 150) === 128 (variant 11)', () => {
    expect(intersection(192, 150)).toBe(128);
  });

  it('intersection(209, 163) === 129 (variant 12)', () => {
    expect(intersection(209, 163)).toBe(129);
  });

  it('intersection(226, 176) === 160 (variant 13)', () => {
    expect(intersection(226, 176)).toBe(160);
  });

  it('intersection(243, 189) === 177 (variant 14)', () => {
    expect(intersection(243, 189)).toBe(177);
  });

  it('intersection(4, 202) === 0 (variant 15)', () => {
    expect(intersection(4, 202)).toBe(0);
  });

  it('intersection(21, 215) === 21 (variant 16)', () => {
    expect(intersection(21, 215)).toBe(21);
  });

  it('intersection(38, 228) === 36 (variant 17)', () => {
    expect(intersection(38, 228)).toBe(36);
  });

  it('intersection(55, 241) === 49 (variant 18)', () => {
    expect(intersection(55, 241)).toBe(49);
  });

  it('intersection(72, 254) === 72 (variant 19)', () => {
    expect(intersection(72, 254)).toBe(72);
  });

  it('intersection(89, 11) === 9 (variant 20)', () => {
    expect(intersection(89, 11)).toBe(9);
  });

  it('intersection(106, 24) === 8 (variant 21)', () => {
    expect(intersection(106, 24)).toBe(8);
  });

  it('intersection(123, 37) === 33 (variant 22)', () => {
    expect(intersection(123, 37)).toBe(33);
  });

  it('intersection(140, 50) === 0 (variant 23)', () => {
    expect(intersection(140, 50)).toBe(0);
  });

  it('intersection(157, 63) === 29 (variant 24)', () => {
    expect(intersection(157, 63)).toBe(29);
  });

  it('intersection(174, 76) === 12 (variant 25)', () => {
    expect(intersection(174, 76)).toBe(12);
  });

  it('intersection(191, 89) === 25 (variant 26)', () => {
    expect(intersection(191, 89)).toBe(25);
  });

  it('intersection(208, 102) === 64 (variant 27)', () => {
    expect(intersection(208, 102)).toBe(64);
  });

  it('intersection(225, 115) === 97 (variant 28)', () => {
    expect(intersection(225, 115)).toBe(97);
  });

  it('intersection(242, 128) === 128 (variant 29)', () => {
    expect(intersection(242, 128)).toBe(128);
  });

  it('intersection(3, 141) === 1 (variant 30)', () => {
    expect(intersection(3, 141)).toBe(1);
  });

  it('intersection(20, 154) === 16 (variant 31)', () => {
    expect(intersection(20, 154)).toBe(16);
  });

  it('intersection(37, 167) === 37 (variant 32)', () => {
    expect(intersection(37, 167)).toBe(37);
  });

  it('intersection(54, 180) === 52 (variant 33)', () => {
    expect(intersection(54, 180)).toBe(52);
  });

  it('intersection(71, 193) === 65 (variant 34)', () => {
    expect(intersection(71, 193)).toBe(65);
  });

});

describe('toList and fromList', () => {
  it('toList(0, {}) returns []', () => {
    expect(toList(0, {})).toEqual([]);
  });

  it('toList(0, {READ:1}) returns []', () => {
    expect(toList(0, {READ:1})).toEqual([]);
  });

  it("toList(1, {READ:1}) returns ['READ']", () => {
    expect(toList(1, {READ:1})).toEqual(['READ']);
  });

  it('toList(3, {READ:1,WRITE:2}) returns both', () => {
    const l = toList(3, {READ:1,WRITE:2});
    expect(l).toContain('READ'); expect(l).toContain('WRITE'); expect(l.length).toBe(2);
  });

  it('toList excludes unset bits', () => {
    expect(toList(1, {READ:1,WRITE:2})).toEqual(['READ']);
  });

  it('toList with all 8 standard perms on mask=255', () => {
    const p = createPermissions(['A','B','C','D','E','F','G','H']);
    const l = toList(255, p);
    expect(l.length).toBe(8);
  });

  it('toList with mask=127 excludes bit-128 flag', () => {
    const p = {A:1,B:2,C:4,D:8,E:16,F:32,G:64,H:128};
    const l = toList(127, p);
    expect(l).not.toContain('H'); expect(l.length).toBe(7);
  });

  it('fromList([], {}) returns 0', () => {
    expect(fromList([], {})).toBe(0);
  });

  it("fromList(['READ'], {READ:1}) returns 1", () => {
    expect(fromList(['READ'], {READ:1})).toBe(1);
  });

  it("fromList(['READ','WRITE'], {READ:1,WRITE:2}) returns 3", () => {
    expect(fromList(['READ','WRITE'], {READ:1,WRITE:2})).toBe(3);
  });

  it('fromList with unknown name returns 0 for that name', () => {
    expect(fromList(['UNKNOWN'], {READ:1})).toBe(0);
  });

  it('fromList with mixed known and unknown', () => {
    expect(fromList(['READ','UNKNOWN'], {READ:1,WRITE:2})).toBe(1);
  });

  it('round-trip toList->fromList', () => {
    const p = createPermissions(['READ','WRITE','DELETE']);
    const mask = 5;
    const list = toList(mask, p);
    expect(fromList(list, p)).toBe(mask);
  });

  it('round-trip fromList->toList', () => {
    const p = createPermissions(['A','B','C','D']);
    const list = ['A','C'];
    const mask = fromList(list, p);
    const back = toList(mask, p);
    expect(back.sort()).toEqual(list.sort());
  });

  it('toList is a subset when partial mask', () => {
    const p = {R:1,W:2,D:4};
    expect(toList(3, p)).toContain('R');
    expect(toList(3, p)).toContain('W');
    expect(toList(3, p)).not.toContain('D');
  });

  it('round-trip toList/fromList for mask=3 (variant 0)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(3, p);
    expect(fromList(list, p)).toBe(3);
  });

  it('round-trip toList/fromList for mask=10 (variant 1)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(10, p);
    expect(fromList(list, p)).toBe(10);
  });

  it('round-trip toList/fromList for mask=17 (variant 2)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(17, p);
    expect(fromList(list, p)).toBe(17);
  });

  it('round-trip toList/fromList for mask=24 (variant 3)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(24, p);
    expect(fromList(list, p)).toBe(24);
  });

  it('round-trip toList/fromList for mask=31 (variant 4)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(31, p);
    expect(fromList(list, p)).toBe(31);
  });

  it('round-trip toList/fromList for mask=6 (variant 5)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(6, p);
    expect(fromList(list, p)).toBe(6);
  });

  it('round-trip toList/fromList for mask=13 (variant 6)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(13, p);
    expect(fromList(list, p)).toBe(13);
  });

  it('round-trip toList/fromList for mask=20 (variant 7)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(20, p);
    expect(fromList(list, p)).toBe(20);
  });

  it('round-trip toList/fromList for mask=27 (variant 8)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(27, p);
    expect(fromList(list, p)).toBe(27);
  });

  it('round-trip toList/fromList for mask=2 (variant 9)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(2, p);
    expect(fromList(list, p)).toBe(2);
  });

  it('round-trip toList/fromList for mask=9 (variant 10)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(9, p);
    expect(fromList(list, p)).toBe(9);
  });

  it('round-trip toList/fromList for mask=16 (variant 11)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(16, p);
    expect(fromList(list, p)).toBe(16);
  });

  it('round-trip toList/fromList for mask=23 (variant 12)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(23, p);
    expect(fromList(list, p)).toBe(23);
  });

  it('round-trip toList/fromList for mask=30 (variant 13)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(30, p);
    expect(fromList(list, p)).toBe(30);
  });

  it('round-trip toList/fromList for mask=5 (variant 14)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(5, p);
    expect(fromList(list, p)).toBe(5);
  });

  it('round-trip toList/fromList for mask=12 (variant 15)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(12, p);
    expect(fromList(list, p)).toBe(12);
  });

  it('round-trip toList/fromList for mask=19 (variant 16)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(19, p);
    expect(fromList(list, p)).toBe(19);
  });

  it('round-trip toList/fromList for mask=26 (variant 17)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(26, p);
    expect(fromList(list, p)).toBe(26);
  });

  it('round-trip toList/fromList for mask=1 (variant 18)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(1, p);
    expect(fromList(list, p)).toBe(1);
  });

  it('round-trip toList/fromList for mask=8 (variant 19)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(8, p);
    expect(fromList(list, p)).toBe(8);
  });

  it('round-trip toList/fromList for mask=15 (variant 20)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(15, p);
    expect(fromList(list, p)).toBe(15);
  });

  it('round-trip toList/fromList for mask=22 (variant 21)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(22, p);
    expect(fromList(list, p)).toBe(22);
  });

  it('round-trip toList/fromList for mask=29 (variant 22)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(29, p);
    expect(fromList(list, p)).toBe(29);
  });

  it('round-trip toList/fromList for mask=4 (variant 23)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(4, p);
    expect(fromList(list, p)).toBe(4);
  });

  it('round-trip toList/fromList for mask=11 (variant 24)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(11, p);
    expect(fromList(list, p)).toBe(11);
  });

  it('round-trip toList/fromList for mask=18 (variant 25)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(18, p);
    expect(fromList(list, p)).toBe(18);
  });

  it('round-trip toList/fromList for mask=25 (variant 26)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(25, p);
    expect(fromList(list, p)).toBe(25);
  });

  it('round-trip toList/fromList for mask=0 (variant 27)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(0, p);
    expect(fromList(list, p)).toBe(0);
  });

  it('round-trip toList/fromList for mask=7 (variant 28)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(7, p);
    expect(fromList(list, p)).toBe(7);
  });

  it('round-trip toList/fromList for mask=14 (variant 29)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(14, p);
    expect(fromList(list, p)).toBe(14);
  });

  it('round-trip toList/fromList for mask=21 (variant 30)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(21, p);
    expect(fromList(list, p)).toBe(21);
  });

  it('round-trip toList/fromList for mask=28 (variant 31)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(28, p);
    expect(fromList(list, p)).toBe(28);
  });

  it('round-trip toList/fromList for mask=3 (variant 32)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(3, p);
    expect(fromList(list, p)).toBe(3);
  });

  it('round-trip toList/fromList for mask=10 (variant 33)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(10, p);
    expect(fromList(list, p)).toBe(10);
  });

  it('round-trip toList/fromList for mask=17 (variant 34)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(17, p);
    expect(fromList(list, p)).toBe(17);
  });

  it('round-trip toList/fromList for mask=24 (variant 35)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(24, p);
    expect(fromList(list, p)).toBe(24);
  });

  it('round-trip toList/fromList for mask=31 (variant 36)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(31, p);
    expect(fromList(list, p)).toBe(31);
  });

  it('round-trip toList/fromList for mask=6 (variant 37)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(6, p);
    expect(fromList(list, p)).toBe(6);
  });

  it('round-trip toList/fromList for mask=13 (variant 38)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(13, p);
    expect(fromList(list, p)).toBe(13);
  });

  it('round-trip toList/fromList for mask=20 (variant 39)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(20, p);
    expect(fromList(list, p)).toBe(20);
  });

  it('round-trip toList/fromList for mask=27 (variant 40)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(27, p);
    expect(fromList(list, p)).toBe(27);
  });

  it('round-trip toList/fromList for mask=2 (variant 41)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(2, p);
    expect(fromList(list, p)).toBe(2);
  });

  it('round-trip toList/fromList for mask=9 (variant 42)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(9, p);
    expect(fromList(list, p)).toBe(9);
  });

  it('round-trip toList/fromList for mask=16 (variant 43)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(16, p);
    expect(fromList(list, p)).toBe(16);
  });

  it('round-trip toList/fromList for mask=23 (variant 44)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(23, p);
    expect(fromList(list, p)).toBe(23);
  });

  it('round-trip toList/fromList for mask=30 (variant 45)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(30, p);
    expect(fromList(list, p)).toBe(30);
  });

  it('round-trip toList/fromList for mask=5 (variant 46)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(5, p);
    expect(fromList(list, p)).toBe(5);
  });

  it('round-trip toList/fromList for mask=12 (variant 47)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(12, p);
    expect(fromList(list, p)).toBe(12);
  });

  it('round-trip toList/fromList for mask=19 (variant 48)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(19, p);
    expect(fromList(list, p)).toBe(19);
  });

  it('round-trip toList/fromList for mask=26 (variant 49)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(26, p);
    expect(fromList(list, p)).toBe(26);
  });

  it('round-trip toList/fromList for mask=1 (variant 50)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(1, p);
    expect(fromList(list, p)).toBe(1);
  });

  it('round-trip toList/fromList for mask=8 (variant 51)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(8, p);
    expect(fromList(list, p)).toBe(8);
  });

  it('round-trip toList/fromList for mask=15 (variant 52)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(15, p);
    expect(fromList(list, p)).toBe(15);
  });

  it('round-trip toList/fromList for mask=22 (variant 53)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(22, p);
    expect(fromList(list, p)).toBe(22);
  });

  it('round-trip toList/fromList for mask=29 (variant 54)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(29, p);
    expect(fromList(list, p)).toBe(29);
  });

  it('round-trip toList/fromList for mask=4 (variant 55)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(4, p);
    expect(fromList(list, p)).toBe(4);
  });

  it('round-trip toList/fromList for mask=11 (variant 56)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(11, p);
    expect(fromList(list, p)).toBe(11);
  });

  it('round-trip toList/fromList for mask=18 (variant 57)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(18, p);
    expect(fromList(list, p)).toBe(18);
  });

  it('round-trip toList/fromList for mask=25 (variant 58)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(25, p);
    expect(fromList(list, p)).toBe(25);
  });

  it('round-trip toList/fromList for mask=0 (variant 59)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(0, p);
    expect(fromList(list, p)).toBe(0);
  });

  it('round-trip toList/fromList for mask=7 (variant 60)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(7, p);
    expect(fromList(list, p)).toBe(7);
  });

  it('round-trip toList/fromList for mask=14 (variant 61)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(14, p);
    expect(fromList(list, p)).toBe(14);
  });

  it('round-trip toList/fromList for mask=21 (variant 62)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(21, p);
    expect(fromList(list, p)).toBe(21);
  });

  it('round-trip toList/fromList for mask=28 (variant 63)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(28, p);
    expect(fromList(list, p)).toBe(28);
  });

  it('round-trip toList/fromList for mask=3 (variant 64)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(3, p);
    expect(fromList(list, p)).toBe(3);
  });

  it('round-trip toList/fromList for mask=10 (variant 65)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(10, p);
    expect(fromList(list, p)).toBe(10);
  });

  it('round-trip toList/fromList for mask=17 (variant 66)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(17, p);
    expect(fromList(list, p)).toBe(17);
  });

  it('round-trip toList/fromList for mask=24 (variant 67)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(24, p);
    expect(fromList(list, p)).toBe(24);
  });

  it('round-trip toList/fromList for mask=31 (variant 68)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(31, p);
    expect(fromList(list, p)).toBe(31);
  });

  it('round-trip toList/fromList for mask=6 (variant 69)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(6, p);
    expect(fromList(list, p)).toBe(6);
  });

  it('round-trip toList/fromList for mask=13 (variant 70)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(13, p);
    expect(fromList(list, p)).toBe(13);
  });

  it('round-trip toList/fromList for mask=20 (variant 71)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(20, p);
    expect(fromList(list, p)).toBe(20);
  });

  it('round-trip toList/fromList for mask=27 (variant 72)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(27, p);
    expect(fromList(list, p)).toBe(27);
  });

  it('round-trip toList/fromList for mask=2 (variant 73)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(2, p);
    expect(fromList(list, p)).toBe(2);
  });

  it('round-trip toList/fromList for mask=9 (variant 74)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(9, p);
    expect(fromList(list, p)).toBe(9);
  });

  it('round-trip toList/fromList for mask=16 (variant 75)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(16, p);
    expect(fromList(list, p)).toBe(16);
  });

  it('round-trip toList/fromList for mask=23 (variant 76)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(23, p);
    expect(fromList(list, p)).toBe(23);
  });

  it('round-trip toList/fromList for mask=30 (variant 77)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(30, p);
    expect(fromList(list, p)).toBe(30);
  });

  it('round-trip toList/fromList for mask=5 (variant 78)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(5, p);
    expect(fromList(list, p)).toBe(5);
  });

  it('round-trip toList/fromList for mask=12 (variant 79)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(12, p);
    expect(fromList(list, p)).toBe(12);
  });

  it('round-trip toList/fromList for mask=19 (variant 80)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(19, p);
    expect(fromList(list, p)).toBe(19);
  });

  it('round-trip toList/fromList for mask=26 (variant 81)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(26, p);
    expect(fromList(list, p)).toBe(26);
  });

  it('round-trip toList/fromList for mask=1 (variant 82)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(1, p);
    expect(fromList(list, p)).toBe(1);
  });

  it('round-trip toList/fromList for mask=8 (variant 83)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(8, p);
    expect(fromList(list, p)).toBe(8);
  });

  it('round-trip toList/fromList for mask=15 (variant 84)', () => {
    const p = {READ:1,WRITE:2,DELETE:4,EXECUTE:8,ADMIN:16};
    const list = toList(15, p);
    expect(fromList(list, p)).toBe(15);
  });

});

describe('createRole, canUser, getUserPermissions', () => {
  it('createRole returns correct object', () => {
    const r = createRole('admin', 'Admin', 7);
    expect(r.id).toBe('admin'); expect(r.name).toBe('Admin'); expect(r.permissions).toBe(7);
  });

  it('createRole with 0 permissions', () => {
    const r = createRole('guest', 'Guest', 0);
    expect(r.permissions).toBe(0);
  });

  it('canUser with matching role and permission', () => {
    const roles = [createRole('admin', 'Admin', 7)];
    const user = {id:'u1', roles:['admin']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with no roles is false', () => {
    const roles = [createRole('admin', 'Admin', 7)];
    const user = {id:'u1', roles:[]};
    expect(canUser(user, 1, roles)).toBe(false);
  });

  it('canUser with role lacking permission is false', () => {
    const roles = [createRole('reader', 'Reader', 1)];
    const user = {id:'u1', roles:['reader']};
    expect(canUser(user, 2, roles)).toBe(false);
  });

  it('canUser uses combined permissions of multiple roles', () => {
    const roles = [createRole('r1','R1',1), createRole('r2','R2',2)];
    const user = {id:'u1', roles:['r1','r2']};
    expect(canUser(user, 3, roles)).toBe(true);
  });

  it('canUser ignores roles not in the roles array', () => {
    const roles = [createRole('admin', 'Admin', 7)];
    const user = {id:'u1', roles:['unknown']};
    expect(canUser(user, 1, roles)).toBe(false);
  });

  it('getUserPermissions returns 0 for no roles', () => {
    const user = {id:'u1', roles:[]};
    expect(getUserPermissions(user, [])).toBe(0);
  });

  it('getUserPermissions returns union of role permissions', () => {
    const roles = [createRole('r1','R1',1), createRole('r2','R2',4)];
    const user = {id:'u1', roles:['r1','r2']};
    expect(getUserPermissions(user, roles)).toBe(5);
  });

  it('getUserPermissions with duplicate roles combines once', () => {
    const roles = [createRole('admin','Admin',7)];
    const user = {id:'u1', roles:['admin','admin']};
    expect(getUserPermissions(user, roles)).toBe(7);
  });

  it('canUser with permission 0 is always true', () => {
    const user = {id:'u1', roles:[]};
    expect(canUser(user, 0, [])).toBe(true);
  });

  it('createRole preserves id exactly', () => {
    const r = createRole('super-admin', 'Super Admin', 255);
    expect(r.id).toBe('super-admin');
  });

  it('getUserPermissions skips unknown roleIds', () => {
    const roles = [createRole('r1','R1',7)];
    const user = {id:'u1', roles:['r1','unknown']};
    expect(getUserPermissions(user, roles)).toBe(7);
  });

  it('canUser false when user lacks all bits of compound permission', () => {
    const roles = [createRole('r1','R1',1)];
    const user = {id:'u1', roles:['r1']};
    expect(canUser(user, 3, roles)).toBe(false);
  });

  it('getUserPermissions returns correct OR for 3 roles', () => {
    const roles = [createRole('a','A',1), createRole('b','B',2), createRole('c','C',4)];
    const user = {id:'u1', roles:['a','b','c']};
    expect(getUserPermissions(user, roles)).toBe(7);
  });

  it('canUser with full-permission role for bit 1 (variant 0)', () => {
    const roles = [createRole('r0', 'Role0', 255)];
    const user = {id:'u0', roles:['r0']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 1)', () => {
    const roles = [createRole('r1', 'Role1', 255)];
    const user = {id:'u1', roles:['r1']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 2)', () => {
    const roles = [createRole('r2', 'Role2', 255)];
    const user = {id:'u2', roles:['r2']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 3)', () => {
    const roles = [createRole('r3', 'Role3', 255)];
    const user = {id:'u3', roles:['r3']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 4)', () => {
    const roles = [createRole('r4', 'Role4', 255)];
    const user = {id:'u4', roles:['r4']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 5)', () => {
    const roles = [createRole('r5', 'Role5', 255)];
    const user = {id:'u5', roles:['r5']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 6)', () => {
    const roles = [createRole('r6', 'Role6', 255)];
    const user = {id:'u6', roles:['r6']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 128 (variant 7)', () => {
    const roles = [createRole('r7', 'Role7', 255)];
    const user = {id:'u7', roles:['r7']};
    expect(canUser(user, 128, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 1 (variant 8)', () => {
    const roles = [createRole('r8', 'Role8', 255)];
    const user = {id:'u8', roles:['r8']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 9)', () => {
    const roles = [createRole('r9', 'Role9', 255)];
    const user = {id:'u9', roles:['r9']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 10)', () => {
    const roles = [createRole('r10', 'Role10', 255)];
    const user = {id:'u10', roles:['r10']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 11)', () => {
    const roles = [createRole('r11', 'Role11', 255)];
    const user = {id:'u11', roles:['r11']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 12)', () => {
    const roles = [createRole('r12', 'Role12', 255)];
    const user = {id:'u12', roles:['r12']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 13)', () => {
    const roles = [createRole('r13', 'Role13', 255)];
    const user = {id:'u13', roles:['r13']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 14)', () => {
    const roles = [createRole('r14', 'Role14', 255)];
    const user = {id:'u14', roles:['r14']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 128 (variant 15)', () => {
    const roles = [createRole('r15', 'Role15', 255)];
    const user = {id:'u15', roles:['r15']};
    expect(canUser(user, 128, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 1 (variant 16)', () => {
    const roles = [createRole('r16', 'Role16', 255)];
    const user = {id:'u16', roles:['r16']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 17)', () => {
    const roles = [createRole('r17', 'Role17', 255)];
    const user = {id:'u17', roles:['r17']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 18)', () => {
    const roles = [createRole('r18', 'Role18', 255)];
    const user = {id:'u18', roles:['r18']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 19)', () => {
    const roles = [createRole('r19', 'Role19', 255)];
    const user = {id:'u19', roles:['r19']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 20)', () => {
    const roles = [createRole('r20', 'Role20', 255)];
    const user = {id:'u20', roles:['r20']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 21)', () => {
    const roles = [createRole('r21', 'Role21', 255)];
    const user = {id:'u21', roles:['r21']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 22)', () => {
    const roles = [createRole('r22', 'Role22', 255)];
    const user = {id:'u22', roles:['r22']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 128 (variant 23)', () => {
    const roles = [createRole('r23', 'Role23', 255)];
    const user = {id:'u23', roles:['r23']};
    expect(canUser(user, 128, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 1 (variant 24)', () => {
    const roles = [createRole('r24', 'Role24', 255)];
    const user = {id:'u24', roles:['r24']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 25)', () => {
    const roles = [createRole('r25', 'Role25', 255)];
    const user = {id:'u25', roles:['r25']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 26)', () => {
    const roles = [createRole('r26', 'Role26', 255)];
    const user = {id:'u26', roles:['r26']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 27)', () => {
    const roles = [createRole('r27', 'Role27', 255)];
    const user = {id:'u27', roles:['r27']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 28)', () => {
    const roles = [createRole('r28', 'Role28', 255)];
    const user = {id:'u28', roles:['r28']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 29)', () => {
    const roles = [createRole('r29', 'Role29', 255)];
    const user = {id:'u29', roles:['r29']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 30)', () => {
    const roles = [createRole('r30', 'Role30', 255)];
    const user = {id:'u30', roles:['r30']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 128 (variant 31)', () => {
    const roles = [createRole('r31', 'Role31', 255)];
    const user = {id:'u31', roles:['r31']};
    expect(canUser(user, 128, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 1 (variant 32)', () => {
    const roles = [createRole('r32', 'Role32', 255)];
    const user = {id:'u32', roles:['r32']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 33)', () => {
    const roles = [createRole('r33', 'Role33', 255)];
    const user = {id:'u33', roles:['r33']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 34)', () => {
    const roles = [createRole('r34', 'Role34', 255)];
    const user = {id:'u34', roles:['r34']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 35)', () => {
    const roles = [createRole('r35', 'Role35', 255)];
    const user = {id:'u35', roles:['r35']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 36)', () => {
    const roles = [createRole('r36', 'Role36', 255)];
    const user = {id:'u36', roles:['r36']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 37)', () => {
    const roles = [createRole('r37', 'Role37', 255)];
    const user = {id:'u37', roles:['r37']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 38)', () => {
    const roles = [createRole('r38', 'Role38', 255)];
    const user = {id:'u38', roles:['r38']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 128 (variant 39)', () => {
    const roles = [createRole('r39', 'Role39', 255)];
    const user = {id:'u39', roles:['r39']};
    expect(canUser(user, 128, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 1 (variant 40)', () => {
    const roles = [createRole('r40', 'Role40', 255)];
    const user = {id:'u40', roles:['r40']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 41)', () => {
    const roles = [createRole('r41', 'Role41', 255)];
    const user = {id:'u41', roles:['r41']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 42)', () => {
    const roles = [createRole('r42', 'Role42', 255)];
    const user = {id:'u42', roles:['r42']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 43)', () => {
    const roles = [createRole('r43', 'Role43', 255)];
    const user = {id:'u43', roles:['r43']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 44)', () => {
    const roles = [createRole('r44', 'Role44', 255)];
    const user = {id:'u44', roles:['r44']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 45)', () => {
    const roles = [createRole('r45', 'Role45', 255)];
    const user = {id:'u45', roles:['r45']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 46)', () => {
    const roles = [createRole('r46', 'Role46', 255)];
    const user = {id:'u46', roles:['r46']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 128 (variant 47)', () => {
    const roles = [createRole('r47', 'Role47', 255)];
    const user = {id:'u47', roles:['r47']};
    expect(canUser(user, 128, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 1 (variant 48)', () => {
    const roles = [createRole('r48', 'Role48', 255)];
    const user = {id:'u48', roles:['r48']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 49)', () => {
    const roles = [createRole('r49', 'Role49', 255)];
    const user = {id:'u49', roles:['r49']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 50)', () => {
    const roles = [createRole('r50', 'Role50', 255)];
    const user = {id:'u50', roles:['r50']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 51)', () => {
    const roles = [createRole('r51', 'Role51', 255)];
    const user = {id:'u51', roles:['r51']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 52)', () => {
    const roles = [createRole('r52', 'Role52', 255)];
    const user = {id:'u52', roles:['r52']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 53)', () => {
    const roles = [createRole('r53', 'Role53', 255)];
    const user = {id:'u53', roles:['r53']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 54)', () => {
    const roles = [createRole('r54', 'Role54', 255)];
    const user = {id:'u54', roles:['r54']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 128 (variant 55)', () => {
    const roles = [createRole('r55', 'Role55', 255)];
    const user = {id:'u55', roles:['r55']};
    expect(canUser(user, 128, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 1 (variant 56)', () => {
    const roles = [createRole('r56', 'Role56', 255)];
    const user = {id:'u56', roles:['r56']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 57)', () => {
    const roles = [createRole('r57', 'Role57', 255)];
    const user = {id:'u57', roles:['r57']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 58)', () => {
    const roles = [createRole('r58', 'Role58', 255)];
    const user = {id:'u58', roles:['r58']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 59)', () => {
    const roles = [createRole('r59', 'Role59', 255)];
    const user = {id:'u59', roles:['r59']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 60)', () => {
    const roles = [createRole('r60', 'Role60', 255)];
    const user = {id:'u60', roles:['r60']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 61)', () => {
    const roles = [createRole('r61', 'Role61', 255)];
    const user = {id:'u61', roles:['r61']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 62)', () => {
    const roles = [createRole('r62', 'Role62', 255)];
    const user = {id:'u62', roles:['r62']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 128 (variant 63)', () => {
    const roles = [createRole('r63', 'Role63', 255)];
    const user = {id:'u63', roles:['r63']};
    expect(canUser(user, 128, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 1 (variant 64)', () => {
    const roles = [createRole('r64', 'Role64', 255)];
    const user = {id:'u64', roles:['r64']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 65)', () => {
    const roles = [createRole('r65', 'Role65', 255)];
    const user = {id:'u65', roles:['r65']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 66)', () => {
    const roles = [createRole('r66', 'Role66', 255)];
    const user = {id:'u66', roles:['r66']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 67)', () => {
    const roles = [createRole('r67', 'Role67', 255)];
    const user = {id:'u67', roles:['r67']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 68)', () => {
    const roles = [createRole('r68', 'Role68', 255)];
    const user = {id:'u68', roles:['r68']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 69)', () => {
    const roles = [createRole('r69', 'Role69', 255)];
    const user = {id:'u69', roles:['r69']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 70)', () => {
    const roles = [createRole('r70', 'Role70', 255)];
    const user = {id:'u70', roles:['r70']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 128 (variant 71)', () => {
    const roles = [createRole('r71', 'Role71', 255)];
    const user = {id:'u71', roles:['r71']};
    expect(canUser(user, 128, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 1 (variant 72)', () => {
    const roles = [createRole('r72', 'Role72', 255)];
    const user = {id:'u72', roles:['r72']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 73)', () => {
    const roles = [createRole('r73', 'Role73', 255)];
    const user = {id:'u73', roles:['r73']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 74)', () => {
    const roles = [createRole('r74', 'Role74', 255)];
    const user = {id:'u74', roles:['r74']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 75)', () => {
    const roles = [createRole('r75', 'Role75', 255)];
    const user = {id:'u75', roles:['r75']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 76)', () => {
    const roles = [createRole('r76', 'Role76', 255)];
    const user = {id:'u76', roles:['r76']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 77)', () => {
    const roles = [createRole('r77', 'Role77', 255)];
    const user = {id:'u77', roles:['r77']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 78)', () => {
    const roles = [createRole('r78', 'Role78', 255)];
    const user = {id:'u78', roles:['r78']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 128 (variant 79)', () => {
    const roles = [createRole('r79', 'Role79', 255)];
    const user = {id:'u79', roles:['r79']};
    expect(canUser(user, 128, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 1 (variant 80)', () => {
    const roles = [createRole('r80', 'Role80', 255)];
    const user = {id:'u80', roles:['r80']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 81)', () => {
    const roles = [createRole('r81', 'Role81', 255)];
    const user = {id:'u81', roles:['r81']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 82)', () => {
    const roles = [createRole('r82', 'Role82', 255)];
    const user = {id:'u82', roles:['r82']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 83)', () => {
    const roles = [createRole('r83', 'Role83', 255)];
    const user = {id:'u83', roles:['r83']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 84)', () => {
    const roles = [createRole('r84', 'Role84', 255)];
    const user = {id:'u84', roles:['r84']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 85)', () => {
    const roles = [createRole('r85', 'Role85', 255)];
    const user = {id:'u85', roles:['r85']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 86)', () => {
    const roles = [createRole('r86', 'Role86', 255)];
    const user = {id:'u86', roles:['r86']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 128 (variant 87)', () => {
    const roles = [createRole('r87', 'Role87', 255)];
    const user = {id:'u87', roles:['r87']};
    expect(canUser(user, 128, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 1 (variant 88)', () => {
    const roles = [createRole('r88', 'Role88', 255)];
    const user = {id:'u88', roles:['r88']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 89)', () => {
    const roles = [createRole('r89', 'Role89', 255)];
    const user = {id:'u89', roles:['r89']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 90)', () => {
    const roles = [createRole('r90', 'Role90', 255)];
    const user = {id:'u90', roles:['r90']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 91)', () => {
    const roles = [createRole('r91', 'Role91', 255)];
    const user = {id:'u91', roles:['r91']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 92)', () => {
    const roles = [createRole('r92', 'Role92', 255)];
    const user = {id:'u92', roles:['r92']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 93)', () => {
    const roles = [createRole('r93', 'Role93', 255)];
    const user = {id:'u93', roles:['r93']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 94)', () => {
    const roles = [createRole('r94', 'Role94', 255)];
    const user = {id:'u94', roles:['r94']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 128 (variant 95)', () => {
    const roles = [createRole('r95', 'Role95', 255)];
    const user = {id:'u95', roles:['r95']};
    expect(canUser(user, 128, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 1 (variant 96)', () => {
    const roles = [createRole('r96', 'Role96', 255)];
    const user = {id:'u96', roles:['r96']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 97)', () => {
    const roles = [createRole('r97', 'Role97', 255)];
    const user = {id:'u97', roles:['r97']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 98)', () => {
    const roles = [createRole('r98', 'Role98', 255)];
    const user = {id:'u98', roles:['r98']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 99)', () => {
    const roles = [createRole('r99', 'Role99', 255)];
    const user = {id:'u99', roles:['r99']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 100)', () => {
    const roles = [createRole('r100', 'Role100', 255)];
    const user = {id:'u100', roles:['r100']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 101)', () => {
    const roles = [createRole('r101', 'Role101', 255)];
    const user = {id:'u101', roles:['r101']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 102)', () => {
    const roles = [createRole('r102', 'Role102', 255)];
    const user = {id:'u102', roles:['r102']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 128 (variant 103)', () => {
    const roles = [createRole('r103', 'Role103', 255)];
    const user = {id:'u103', roles:['r103']};
    expect(canUser(user, 128, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 1 (variant 104)', () => {
    const roles = [createRole('r104', 'Role104', 255)];
    const user = {id:'u104', roles:['r104']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 105)', () => {
    const roles = [createRole('r105', 'Role105', 255)];
    const user = {id:'u105', roles:['r105']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 106)', () => {
    const roles = [createRole('r106', 'Role106', 255)];
    const user = {id:'u106', roles:['r106']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 107)', () => {
    const roles = [createRole('r107', 'Role107', 255)];
    const user = {id:'u107', roles:['r107']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 108)', () => {
    const roles = [createRole('r108', 'Role108', 255)];
    const user = {id:'u108', roles:['r108']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 109)', () => {
    const roles = [createRole('r109', 'Role109', 255)];
    const user = {id:'u109', roles:['r109']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 110)', () => {
    const roles = [createRole('r110', 'Role110', 255)];
    const user = {id:'u110', roles:['r110']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 128 (variant 111)', () => {
    const roles = [createRole('r111', 'Role111', 255)];
    const user = {id:'u111', roles:['r111']};
    expect(canUser(user, 128, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 1 (variant 112)', () => {
    const roles = [createRole('r112', 'Role112', 255)];
    const user = {id:'u112', roles:['r112']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 113)', () => {
    const roles = [createRole('r113', 'Role113', 255)];
    const user = {id:'u113', roles:['r113']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 114)', () => {
    const roles = [createRole('r114', 'Role114', 255)];
    const user = {id:'u114', roles:['r114']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 115)', () => {
    const roles = [createRole('r115', 'Role115', 255)];
    const user = {id:'u115', roles:['r115']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 116)', () => {
    const roles = [createRole('r116', 'Role116', 255)];
    const user = {id:'u116', roles:['r116']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 117)', () => {
    const roles = [createRole('r117', 'Role117', 255)];
    const user = {id:'u117', roles:['r117']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 118)', () => {
    const roles = [createRole('r118', 'Role118', 255)];
    const user = {id:'u118', roles:['r118']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 128 (variant 119)', () => {
    const roles = [createRole('r119', 'Role119', 255)];
    const user = {id:'u119', roles:['r119']};
    expect(canUser(user, 128, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 1 (variant 120)', () => {
    const roles = [createRole('r120', 'Role120', 255)];
    const user = {id:'u120', roles:['r120']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 121)', () => {
    const roles = [createRole('r121', 'Role121', 255)];
    const user = {id:'u121', roles:['r121']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 122)', () => {
    const roles = [createRole('r122', 'Role122', 255)];
    const user = {id:'u122', roles:['r122']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 123)', () => {
    const roles = [createRole('r123', 'Role123', 255)];
    const user = {id:'u123', roles:['r123']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 124)', () => {
    const roles = [createRole('r124', 'Role124', 255)];
    const user = {id:'u124', roles:['r124']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 125)', () => {
    const roles = [createRole('r125', 'Role125', 255)];
    const user = {id:'u125', roles:['r125']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 126)', () => {
    const roles = [createRole('r126', 'Role126', 255)];
    const user = {id:'u126', roles:['r126']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 128 (variant 127)', () => {
    const roles = [createRole('r127', 'Role127', 255)];
    const user = {id:'u127', roles:['r127']};
    expect(canUser(user, 128, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 1 (variant 128)', () => {
    const roles = [createRole('r128', 'Role128', 255)];
    const user = {id:'u128', roles:['r128']};
    expect(canUser(user, 1, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 2 (variant 129)', () => {
    const roles = [createRole('r129', 'Role129', 255)];
    const user = {id:'u129', roles:['r129']};
    expect(canUser(user, 2, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 4 (variant 130)', () => {
    const roles = [createRole('r130', 'Role130', 255)];
    const user = {id:'u130', roles:['r130']};
    expect(canUser(user, 4, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 8 (variant 131)', () => {
    const roles = [createRole('r131', 'Role131', 255)];
    const user = {id:'u131', roles:['r131']};
    expect(canUser(user, 8, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 16 (variant 132)', () => {
    const roles = [createRole('r132', 'Role132', 255)];
    const user = {id:'u132', roles:['r132']};
    expect(canUser(user, 16, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 32 (variant 133)', () => {
    const roles = [createRole('r133', 'Role133', 255)];
    const user = {id:'u133', roles:['r133']};
    expect(canUser(user, 32, roles)).toBe(true);
  });

  it('canUser with full-permission role for bit 64 (variant 134)', () => {
    const roles = [createRole('r134', 'Role134', 255)];
    const user = {id:'u134', roles:['r134']};
    expect(canUser(user, 64, roles)).toBe(true);
  });

});

describe('addRole, removeRole, hasRole', () => {
  it('hasRole false when no roles', () => {
    expect(hasRole({id:'u1',roles:[]}, 'admin')).toBe(false);
  });

  it('hasRole true when role present', () => {
    expect(hasRole({id:'u1',roles:['admin']}, 'admin')).toBe(true);
  });

  it('hasRole false for different role', () => {
    expect(hasRole({id:'u1',roles:['user']}, 'admin')).toBe(false);
  });

  it('addRole adds new role', () => {
    const u = addRole({id:'u1',roles:[]}, 'admin');
    expect(u.roles).toContain('admin');
  });

  it('addRole does not duplicate existing role', () => {
    const u = addRole({id:'u1',roles:['admin']}, 'admin');
    expect(u.roles.filter((r:string) => r==='admin').length).toBe(1);
  });

  it('addRole does not mutate original user', () => {
    const orig = {id:'u1', roles:['user']};
    addRole(orig, 'admin');
    expect(orig.roles).toEqual(['user']);
  });

  it('removeRole removes existing role', () => {
    const u = removeRole({id:'u1',roles:['admin','user']}, 'admin');
    expect(u.roles).not.toContain('admin');
    expect(u.roles).toContain('user');
  });

  it('removeRole with role not present returns same roles', () => {
    const u = removeRole({id:'u1',roles:['user']}, 'admin');
    expect(u.roles).toEqual(['user']);
  });

  it('removeRole does not mutate original user', () => {
    const orig = {id:'u1', roles:['admin','user']};
    removeRole(orig, 'admin');
    expect(orig.roles).toEqual(['admin','user']);
  });

  it('addRole then hasRole is true', () => {
    const u = addRole({id:'u1',roles:[]}, 'editor');
    expect(hasRole(u, 'editor')).toBe(true);
  });

  it('removeRole then hasRole is false', () => {
    const u = removeRole({id:'u1',roles:['editor']}, 'editor');
    expect(hasRole(u, 'editor')).toBe(false);
  });

  it('addRole preserves existing roles', () => {
    const u = addRole({id:'u1',roles:['user']}, 'admin');
    expect(u.roles).toContain('user'); expect(u.roles).toContain('admin');
  });

  it('hasRole with multiple roles checks correctly', () => {
    const u = {id:'u1', roles:['a','b','c']};
    expect(hasRole(u,'a')).toBe(true);
    expect(hasRole(u,'b')).toBe(true);
    expect(hasRole(u,'d')).toBe(false);
  });

  it('chaining addRole calls', () => {
    let u = {id:'u1', roles:[] as string[]};
    u = addRole(u, 'r1');
    u = addRole(u, 'r2');
    u = addRole(u, 'r3');
    expect(u.roles.length).toBe(3);
  });

  it('chaining removeRole calls', () => {
    let u = {id:'u1', roles:['r1','r2','r3']};
    u = removeRole(u, 'r1');
    u = removeRole(u, 'r2');
    expect(u.roles).toEqual(['r3']);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_0' (variant 0)", () => {
    let u = {id:'u0', roles:[] as string[]};
    expect(hasRole(u, 'role_0')).toBe(false);
    u = addRole(u, 'role_0');
    expect(hasRole(u, 'role_0')).toBe(true);
    u = removeRole(u, 'role_0');
    expect(hasRole(u, 'role_0')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_1' (variant 1)", () => {
    let u = {id:'u1', roles:[] as string[]};
    expect(hasRole(u, 'role_1')).toBe(false);
    u = addRole(u, 'role_1');
    expect(hasRole(u, 'role_1')).toBe(true);
    u = removeRole(u, 'role_1');
    expect(hasRole(u, 'role_1')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_2' (variant 2)", () => {
    let u = {id:'u2', roles:[] as string[]};
    expect(hasRole(u, 'role_2')).toBe(false);
    u = addRole(u, 'role_2');
    expect(hasRole(u, 'role_2')).toBe(true);
    u = removeRole(u, 'role_2');
    expect(hasRole(u, 'role_2')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_3' (variant 3)", () => {
    let u = {id:'u3', roles:[] as string[]};
    expect(hasRole(u, 'role_3')).toBe(false);
    u = addRole(u, 'role_3');
    expect(hasRole(u, 'role_3')).toBe(true);
    u = removeRole(u, 'role_3');
    expect(hasRole(u, 'role_3')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_4' (variant 4)", () => {
    let u = {id:'u4', roles:[] as string[]};
    expect(hasRole(u, 'role_4')).toBe(false);
    u = addRole(u, 'role_4');
    expect(hasRole(u, 'role_4')).toBe(true);
    u = removeRole(u, 'role_4');
    expect(hasRole(u, 'role_4')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_5' (variant 5)", () => {
    let u = {id:'u5', roles:[] as string[]};
    expect(hasRole(u, 'role_5')).toBe(false);
    u = addRole(u, 'role_5');
    expect(hasRole(u, 'role_5')).toBe(true);
    u = removeRole(u, 'role_5');
    expect(hasRole(u, 'role_5')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_6' (variant 6)", () => {
    let u = {id:'u6', roles:[] as string[]};
    expect(hasRole(u, 'role_6')).toBe(false);
    u = addRole(u, 'role_6');
    expect(hasRole(u, 'role_6')).toBe(true);
    u = removeRole(u, 'role_6');
    expect(hasRole(u, 'role_6')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_7' (variant 7)", () => {
    let u = {id:'u7', roles:[] as string[]};
    expect(hasRole(u, 'role_7')).toBe(false);
    u = addRole(u, 'role_7');
    expect(hasRole(u, 'role_7')).toBe(true);
    u = removeRole(u, 'role_7');
    expect(hasRole(u, 'role_7')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_8' (variant 8)", () => {
    let u = {id:'u8', roles:[] as string[]};
    expect(hasRole(u, 'role_8')).toBe(false);
    u = addRole(u, 'role_8');
    expect(hasRole(u, 'role_8')).toBe(true);
    u = removeRole(u, 'role_8');
    expect(hasRole(u, 'role_8')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_9' (variant 9)", () => {
    let u = {id:'u9', roles:[] as string[]};
    expect(hasRole(u, 'role_9')).toBe(false);
    u = addRole(u, 'role_9');
    expect(hasRole(u, 'role_9')).toBe(true);
    u = removeRole(u, 'role_9');
    expect(hasRole(u, 'role_9')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_10' (variant 10)", () => {
    let u = {id:'u10', roles:[] as string[]};
    expect(hasRole(u, 'role_10')).toBe(false);
    u = addRole(u, 'role_10');
    expect(hasRole(u, 'role_10')).toBe(true);
    u = removeRole(u, 'role_10');
    expect(hasRole(u, 'role_10')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_11' (variant 11)", () => {
    let u = {id:'u11', roles:[] as string[]};
    expect(hasRole(u, 'role_11')).toBe(false);
    u = addRole(u, 'role_11');
    expect(hasRole(u, 'role_11')).toBe(true);
    u = removeRole(u, 'role_11');
    expect(hasRole(u, 'role_11')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_12' (variant 12)", () => {
    let u = {id:'u12', roles:[] as string[]};
    expect(hasRole(u, 'role_12')).toBe(false);
    u = addRole(u, 'role_12');
    expect(hasRole(u, 'role_12')).toBe(true);
    u = removeRole(u, 'role_12');
    expect(hasRole(u, 'role_12')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_13' (variant 13)", () => {
    let u = {id:'u13', roles:[] as string[]};
    expect(hasRole(u, 'role_13')).toBe(false);
    u = addRole(u, 'role_13');
    expect(hasRole(u, 'role_13')).toBe(true);
    u = removeRole(u, 'role_13');
    expect(hasRole(u, 'role_13')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_14' (variant 14)", () => {
    let u = {id:'u14', roles:[] as string[]};
    expect(hasRole(u, 'role_14')).toBe(false);
    u = addRole(u, 'role_14');
    expect(hasRole(u, 'role_14')).toBe(true);
    u = removeRole(u, 'role_14');
    expect(hasRole(u, 'role_14')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_15' (variant 15)", () => {
    let u = {id:'u15', roles:[] as string[]};
    expect(hasRole(u, 'role_15')).toBe(false);
    u = addRole(u, 'role_15');
    expect(hasRole(u, 'role_15')).toBe(true);
    u = removeRole(u, 'role_15');
    expect(hasRole(u, 'role_15')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_16' (variant 16)", () => {
    let u = {id:'u16', roles:[] as string[]};
    expect(hasRole(u, 'role_16')).toBe(false);
    u = addRole(u, 'role_16');
    expect(hasRole(u, 'role_16')).toBe(true);
    u = removeRole(u, 'role_16');
    expect(hasRole(u, 'role_16')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_17' (variant 17)", () => {
    let u = {id:'u17', roles:[] as string[]};
    expect(hasRole(u, 'role_17')).toBe(false);
    u = addRole(u, 'role_17');
    expect(hasRole(u, 'role_17')).toBe(true);
    u = removeRole(u, 'role_17');
    expect(hasRole(u, 'role_17')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_18' (variant 18)", () => {
    let u = {id:'u18', roles:[] as string[]};
    expect(hasRole(u, 'role_18')).toBe(false);
    u = addRole(u, 'role_18');
    expect(hasRole(u, 'role_18')).toBe(true);
    u = removeRole(u, 'role_18');
    expect(hasRole(u, 'role_18')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_19' (variant 19)", () => {
    let u = {id:'u19', roles:[] as string[]};
    expect(hasRole(u, 'role_19')).toBe(false);
    u = addRole(u, 'role_19');
    expect(hasRole(u, 'role_19')).toBe(true);
    u = removeRole(u, 'role_19');
    expect(hasRole(u, 'role_19')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_20' (variant 20)", () => {
    let u = {id:'u20', roles:[] as string[]};
    expect(hasRole(u, 'role_20')).toBe(false);
    u = addRole(u, 'role_20');
    expect(hasRole(u, 'role_20')).toBe(true);
    u = removeRole(u, 'role_20');
    expect(hasRole(u, 'role_20')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_21' (variant 21)", () => {
    let u = {id:'u21', roles:[] as string[]};
    expect(hasRole(u, 'role_21')).toBe(false);
    u = addRole(u, 'role_21');
    expect(hasRole(u, 'role_21')).toBe(true);
    u = removeRole(u, 'role_21');
    expect(hasRole(u, 'role_21')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_22' (variant 22)", () => {
    let u = {id:'u22', roles:[] as string[]};
    expect(hasRole(u, 'role_22')).toBe(false);
    u = addRole(u, 'role_22');
    expect(hasRole(u, 'role_22')).toBe(true);
    u = removeRole(u, 'role_22');
    expect(hasRole(u, 'role_22')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_23' (variant 23)", () => {
    let u = {id:'u23', roles:[] as string[]};
    expect(hasRole(u, 'role_23')).toBe(false);
    u = addRole(u, 'role_23');
    expect(hasRole(u, 'role_23')).toBe(true);
    u = removeRole(u, 'role_23');
    expect(hasRole(u, 'role_23')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_24' (variant 24)", () => {
    let u = {id:'u24', roles:[] as string[]};
    expect(hasRole(u, 'role_24')).toBe(false);
    u = addRole(u, 'role_24');
    expect(hasRole(u, 'role_24')).toBe(true);
    u = removeRole(u, 'role_24');
    expect(hasRole(u, 'role_24')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_25' (variant 25)", () => {
    let u = {id:'u25', roles:[] as string[]};
    expect(hasRole(u, 'role_25')).toBe(false);
    u = addRole(u, 'role_25');
    expect(hasRole(u, 'role_25')).toBe(true);
    u = removeRole(u, 'role_25');
    expect(hasRole(u, 'role_25')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_26' (variant 26)", () => {
    let u = {id:'u26', roles:[] as string[]};
    expect(hasRole(u, 'role_26')).toBe(false);
    u = addRole(u, 'role_26');
    expect(hasRole(u, 'role_26')).toBe(true);
    u = removeRole(u, 'role_26');
    expect(hasRole(u, 'role_26')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_27' (variant 27)", () => {
    let u = {id:'u27', roles:[] as string[]};
    expect(hasRole(u, 'role_27')).toBe(false);
    u = addRole(u, 'role_27');
    expect(hasRole(u, 'role_27')).toBe(true);
    u = removeRole(u, 'role_27');
    expect(hasRole(u, 'role_27')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_28' (variant 28)", () => {
    let u = {id:'u28', roles:[] as string[]};
    expect(hasRole(u, 'role_28')).toBe(false);
    u = addRole(u, 'role_28');
    expect(hasRole(u, 'role_28')).toBe(true);
    u = removeRole(u, 'role_28');
    expect(hasRole(u, 'role_28')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_29' (variant 29)", () => {
    let u = {id:'u29', roles:[] as string[]};
    expect(hasRole(u, 'role_29')).toBe(false);
    u = addRole(u, 'role_29');
    expect(hasRole(u, 'role_29')).toBe(true);
    u = removeRole(u, 'role_29');
    expect(hasRole(u, 'role_29')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_30' (variant 30)", () => {
    let u = {id:'u30', roles:[] as string[]};
    expect(hasRole(u, 'role_30')).toBe(false);
    u = addRole(u, 'role_30');
    expect(hasRole(u, 'role_30')).toBe(true);
    u = removeRole(u, 'role_30');
    expect(hasRole(u, 'role_30')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_31' (variant 31)", () => {
    let u = {id:'u31', roles:[] as string[]};
    expect(hasRole(u, 'role_31')).toBe(false);
    u = addRole(u, 'role_31');
    expect(hasRole(u, 'role_31')).toBe(true);
    u = removeRole(u, 'role_31');
    expect(hasRole(u, 'role_31')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_32' (variant 32)", () => {
    let u = {id:'u32', roles:[] as string[]};
    expect(hasRole(u, 'role_32')).toBe(false);
    u = addRole(u, 'role_32');
    expect(hasRole(u, 'role_32')).toBe(true);
    u = removeRole(u, 'role_32');
    expect(hasRole(u, 'role_32')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_33' (variant 33)", () => {
    let u = {id:'u33', roles:[] as string[]};
    expect(hasRole(u, 'role_33')).toBe(false);
    u = addRole(u, 'role_33');
    expect(hasRole(u, 'role_33')).toBe(true);
    u = removeRole(u, 'role_33');
    expect(hasRole(u, 'role_33')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_34' (variant 34)", () => {
    let u = {id:'u34', roles:[] as string[]};
    expect(hasRole(u, 'role_34')).toBe(false);
    u = addRole(u, 'role_34');
    expect(hasRole(u, 'role_34')).toBe(true);
    u = removeRole(u, 'role_34');
    expect(hasRole(u, 'role_34')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_35' (variant 35)", () => {
    let u = {id:'u35', roles:[] as string[]};
    expect(hasRole(u, 'role_35')).toBe(false);
    u = addRole(u, 'role_35');
    expect(hasRole(u, 'role_35')).toBe(true);
    u = removeRole(u, 'role_35');
    expect(hasRole(u, 'role_35')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_36' (variant 36)", () => {
    let u = {id:'u36', roles:[] as string[]};
    expect(hasRole(u, 'role_36')).toBe(false);
    u = addRole(u, 'role_36');
    expect(hasRole(u, 'role_36')).toBe(true);
    u = removeRole(u, 'role_36');
    expect(hasRole(u, 'role_36')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_37' (variant 37)", () => {
    let u = {id:'u37', roles:[] as string[]};
    expect(hasRole(u, 'role_37')).toBe(false);
    u = addRole(u, 'role_37');
    expect(hasRole(u, 'role_37')).toBe(true);
    u = removeRole(u, 'role_37');
    expect(hasRole(u, 'role_37')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_38' (variant 38)", () => {
    let u = {id:'u38', roles:[] as string[]};
    expect(hasRole(u, 'role_38')).toBe(false);
    u = addRole(u, 'role_38');
    expect(hasRole(u, 'role_38')).toBe(true);
    u = removeRole(u, 'role_38');
    expect(hasRole(u, 'role_38')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_39' (variant 39)", () => {
    let u = {id:'u39', roles:[] as string[]};
    expect(hasRole(u, 'role_39')).toBe(false);
    u = addRole(u, 'role_39');
    expect(hasRole(u, 'role_39')).toBe(true);
    u = removeRole(u, 'role_39');
    expect(hasRole(u, 'role_39')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_40' (variant 40)", () => {
    let u = {id:'u40', roles:[] as string[]};
    expect(hasRole(u, 'role_40')).toBe(false);
    u = addRole(u, 'role_40');
    expect(hasRole(u, 'role_40')).toBe(true);
    u = removeRole(u, 'role_40');
    expect(hasRole(u, 'role_40')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_41' (variant 41)", () => {
    let u = {id:'u41', roles:[] as string[]};
    expect(hasRole(u, 'role_41')).toBe(false);
    u = addRole(u, 'role_41');
    expect(hasRole(u, 'role_41')).toBe(true);
    u = removeRole(u, 'role_41');
    expect(hasRole(u, 'role_41')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_42' (variant 42)", () => {
    let u = {id:'u42', roles:[] as string[]};
    expect(hasRole(u, 'role_42')).toBe(false);
    u = addRole(u, 'role_42');
    expect(hasRole(u, 'role_42')).toBe(true);
    u = removeRole(u, 'role_42');
    expect(hasRole(u, 'role_42')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_43' (variant 43)", () => {
    let u = {id:'u43', roles:[] as string[]};
    expect(hasRole(u, 'role_43')).toBe(false);
    u = addRole(u, 'role_43');
    expect(hasRole(u, 'role_43')).toBe(true);
    u = removeRole(u, 'role_43');
    expect(hasRole(u, 'role_43')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_44' (variant 44)", () => {
    let u = {id:'u44', roles:[] as string[]};
    expect(hasRole(u, 'role_44')).toBe(false);
    u = addRole(u, 'role_44');
    expect(hasRole(u, 'role_44')).toBe(true);
    u = removeRole(u, 'role_44');
    expect(hasRole(u, 'role_44')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_45' (variant 45)", () => {
    let u = {id:'u45', roles:[] as string[]};
    expect(hasRole(u, 'role_45')).toBe(false);
    u = addRole(u, 'role_45');
    expect(hasRole(u, 'role_45')).toBe(true);
    u = removeRole(u, 'role_45');
    expect(hasRole(u, 'role_45')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_46' (variant 46)", () => {
    let u = {id:'u46', roles:[] as string[]};
    expect(hasRole(u, 'role_46')).toBe(false);
    u = addRole(u, 'role_46');
    expect(hasRole(u, 'role_46')).toBe(true);
    u = removeRole(u, 'role_46');
    expect(hasRole(u, 'role_46')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_47' (variant 47)", () => {
    let u = {id:'u47', roles:[] as string[]};
    expect(hasRole(u, 'role_47')).toBe(false);
    u = addRole(u, 'role_47');
    expect(hasRole(u, 'role_47')).toBe(true);
    u = removeRole(u, 'role_47');
    expect(hasRole(u, 'role_47')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_48' (variant 48)", () => {
    let u = {id:'u48', roles:[] as string[]};
    expect(hasRole(u, 'role_48')).toBe(false);
    u = addRole(u, 'role_48');
    expect(hasRole(u, 'role_48')).toBe(true);
    u = removeRole(u, 'role_48');
    expect(hasRole(u, 'role_48')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_49' (variant 49)", () => {
    let u = {id:'u49', roles:[] as string[]};
    expect(hasRole(u, 'role_49')).toBe(false);
    u = addRole(u, 'role_49');
    expect(hasRole(u, 'role_49')).toBe(true);
    u = removeRole(u, 'role_49');
    expect(hasRole(u, 'role_49')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_50' (variant 50)", () => {
    let u = {id:'u50', roles:[] as string[]};
    expect(hasRole(u, 'role_50')).toBe(false);
    u = addRole(u, 'role_50');
    expect(hasRole(u, 'role_50')).toBe(true);
    u = removeRole(u, 'role_50');
    expect(hasRole(u, 'role_50')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_51' (variant 51)", () => {
    let u = {id:'u51', roles:[] as string[]};
    expect(hasRole(u, 'role_51')).toBe(false);
    u = addRole(u, 'role_51');
    expect(hasRole(u, 'role_51')).toBe(true);
    u = removeRole(u, 'role_51');
    expect(hasRole(u, 'role_51')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_52' (variant 52)", () => {
    let u = {id:'u52', roles:[] as string[]};
    expect(hasRole(u, 'role_52')).toBe(false);
    u = addRole(u, 'role_52');
    expect(hasRole(u, 'role_52')).toBe(true);
    u = removeRole(u, 'role_52');
    expect(hasRole(u, 'role_52')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_53' (variant 53)", () => {
    let u = {id:'u53', roles:[] as string[]};
    expect(hasRole(u, 'role_53')).toBe(false);
    u = addRole(u, 'role_53');
    expect(hasRole(u, 'role_53')).toBe(true);
    u = removeRole(u, 'role_53');
    expect(hasRole(u, 'role_53')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_54' (variant 54)", () => {
    let u = {id:'u54', roles:[] as string[]};
    expect(hasRole(u, 'role_54')).toBe(false);
    u = addRole(u, 'role_54');
    expect(hasRole(u, 'role_54')).toBe(true);
    u = removeRole(u, 'role_54');
    expect(hasRole(u, 'role_54')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_55' (variant 55)", () => {
    let u = {id:'u55', roles:[] as string[]};
    expect(hasRole(u, 'role_55')).toBe(false);
    u = addRole(u, 'role_55');
    expect(hasRole(u, 'role_55')).toBe(true);
    u = removeRole(u, 'role_55');
    expect(hasRole(u, 'role_55')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_56' (variant 56)", () => {
    let u = {id:'u56', roles:[] as string[]};
    expect(hasRole(u, 'role_56')).toBe(false);
    u = addRole(u, 'role_56');
    expect(hasRole(u, 'role_56')).toBe(true);
    u = removeRole(u, 'role_56');
    expect(hasRole(u, 'role_56')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_57' (variant 57)", () => {
    let u = {id:'u57', roles:[] as string[]};
    expect(hasRole(u, 'role_57')).toBe(false);
    u = addRole(u, 'role_57');
    expect(hasRole(u, 'role_57')).toBe(true);
    u = removeRole(u, 'role_57');
    expect(hasRole(u, 'role_57')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_58' (variant 58)", () => {
    let u = {id:'u58', roles:[] as string[]};
    expect(hasRole(u, 'role_58')).toBe(false);
    u = addRole(u, 'role_58');
    expect(hasRole(u, 'role_58')).toBe(true);
    u = removeRole(u, 'role_58');
    expect(hasRole(u, 'role_58')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_59' (variant 59)", () => {
    let u = {id:'u59', roles:[] as string[]};
    expect(hasRole(u, 'role_59')).toBe(false);
    u = addRole(u, 'role_59');
    expect(hasRole(u, 'role_59')).toBe(true);
    u = removeRole(u, 'role_59');
    expect(hasRole(u, 'role_59')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_60' (variant 60)", () => {
    let u = {id:'u60', roles:[] as string[]};
    expect(hasRole(u, 'role_60')).toBe(false);
    u = addRole(u, 'role_60');
    expect(hasRole(u, 'role_60')).toBe(true);
    u = removeRole(u, 'role_60');
    expect(hasRole(u, 'role_60')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_61' (variant 61)", () => {
    let u = {id:'u61', roles:[] as string[]};
    expect(hasRole(u, 'role_61')).toBe(false);
    u = addRole(u, 'role_61');
    expect(hasRole(u, 'role_61')).toBe(true);
    u = removeRole(u, 'role_61');
    expect(hasRole(u, 'role_61')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_62' (variant 62)", () => {
    let u = {id:'u62', roles:[] as string[]};
    expect(hasRole(u, 'role_62')).toBe(false);
    u = addRole(u, 'role_62');
    expect(hasRole(u, 'role_62')).toBe(true);
    u = removeRole(u, 'role_62');
    expect(hasRole(u, 'role_62')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_63' (variant 63)", () => {
    let u = {id:'u63', roles:[] as string[]};
    expect(hasRole(u, 'role_63')).toBe(false);
    u = addRole(u, 'role_63');
    expect(hasRole(u, 'role_63')).toBe(true);
    u = removeRole(u, 'role_63');
    expect(hasRole(u, 'role_63')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_64' (variant 64)", () => {
    let u = {id:'u64', roles:[] as string[]};
    expect(hasRole(u, 'role_64')).toBe(false);
    u = addRole(u, 'role_64');
    expect(hasRole(u, 'role_64')).toBe(true);
    u = removeRole(u, 'role_64');
    expect(hasRole(u, 'role_64')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_65' (variant 65)", () => {
    let u = {id:'u65', roles:[] as string[]};
    expect(hasRole(u, 'role_65')).toBe(false);
    u = addRole(u, 'role_65');
    expect(hasRole(u, 'role_65')).toBe(true);
    u = removeRole(u, 'role_65');
    expect(hasRole(u, 'role_65')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_66' (variant 66)", () => {
    let u = {id:'u66', roles:[] as string[]};
    expect(hasRole(u, 'role_66')).toBe(false);
    u = addRole(u, 'role_66');
    expect(hasRole(u, 'role_66')).toBe(true);
    u = removeRole(u, 'role_66');
    expect(hasRole(u, 'role_66')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_67' (variant 67)", () => {
    let u = {id:'u67', roles:[] as string[]};
    expect(hasRole(u, 'role_67')).toBe(false);
    u = addRole(u, 'role_67');
    expect(hasRole(u, 'role_67')).toBe(true);
    u = removeRole(u, 'role_67');
    expect(hasRole(u, 'role_67')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_68' (variant 68)", () => {
    let u = {id:'u68', roles:[] as string[]};
    expect(hasRole(u, 'role_68')).toBe(false);
    u = addRole(u, 'role_68');
    expect(hasRole(u, 'role_68')).toBe(true);
    u = removeRole(u, 'role_68');
    expect(hasRole(u, 'role_68')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_69' (variant 69)", () => {
    let u = {id:'u69', roles:[] as string[]};
    expect(hasRole(u, 'role_69')).toBe(false);
    u = addRole(u, 'role_69');
    expect(hasRole(u, 'role_69')).toBe(true);
    u = removeRole(u, 'role_69');
    expect(hasRole(u, 'role_69')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_70' (variant 70)", () => {
    let u = {id:'u70', roles:[] as string[]};
    expect(hasRole(u, 'role_70')).toBe(false);
    u = addRole(u, 'role_70');
    expect(hasRole(u, 'role_70')).toBe(true);
    u = removeRole(u, 'role_70');
    expect(hasRole(u, 'role_70')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_71' (variant 71)", () => {
    let u = {id:'u71', roles:[] as string[]};
    expect(hasRole(u, 'role_71')).toBe(false);
    u = addRole(u, 'role_71');
    expect(hasRole(u, 'role_71')).toBe(true);
    u = removeRole(u, 'role_71');
    expect(hasRole(u, 'role_71')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_72' (variant 72)", () => {
    let u = {id:'u72', roles:[] as string[]};
    expect(hasRole(u, 'role_72')).toBe(false);
    u = addRole(u, 'role_72');
    expect(hasRole(u, 'role_72')).toBe(true);
    u = removeRole(u, 'role_72');
    expect(hasRole(u, 'role_72')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_73' (variant 73)", () => {
    let u = {id:'u73', roles:[] as string[]};
    expect(hasRole(u, 'role_73')).toBe(false);
    u = addRole(u, 'role_73');
    expect(hasRole(u, 'role_73')).toBe(true);
    u = removeRole(u, 'role_73');
    expect(hasRole(u, 'role_73')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_74' (variant 74)", () => {
    let u = {id:'u74', roles:[] as string[]};
    expect(hasRole(u, 'role_74')).toBe(false);
    u = addRole(u, 'role_74');
    expect(hasRole(u, 'role_74')).toBe(true);
    u = removeRole(u, 'role_74');
    expect(hasRole(u, 'role_74')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_75' (variant 75)", () => {
    let u = {id:'u75', roles:[] as string[]};
    expect(hasRole(u, 'role_75')).toBe(false);
    u = addRole(u, 'role_75');
    expect(hasRole(u, 'role_75')).toBe(true);
    u = removeRole(u, 'role_75');
    expect(hasRole(u, 'role_75')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_76' (variant 76)", () => {
    let u = {id:'u76', roles:[] as string[]};
    expect(hasRole(u, 'role_76')).toBe(false);
    u = addRole(u, 'role_76');
    expect(hasRole(u, 'role_76')).toBe(true);
    u = removeRole(u, 'role_76');
    expect(hasRole(u, 'role_76')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_77' (variant 77)", () => {
    let u = {id:'u77', roles:[] as string[]};
    expect(hasRole(u, 'role_77')).toBe(false);
    u = addRole(u, 'role_77');
    expect(hasRole(u, 'role_77')).toBe(true);
    u = removeRole(u, 'role_77');
    expect(hasRole(u, 'role_77')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_78' (variant 78)", () => {
    let u = {id:'u78', roles:[] as string[]};
    expect(hasRole(u, 'role_78')).toBe(false);
    u = addRole(u, 'role_78');
    expect(hasRole(u, 'role_78')).toBe(true);
    u = removeRole(u, 'role_78');
    expect(hasRole(u, 'role_78')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_79' (variant 79)", () => {
    let u = {id:'u79', roles:[] as string[]};
    expect(hasRole(u, 'role_79')).toBe(false);
    u = addRole(u, 'role_79');
    expect(hasRole(u, 'role_79')).toBe(true);
    u = removeRole(u, 'role_79');
    expect(hasRole(u, 'role_79')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_80' (variant 80)", () => {
    let u = {id:'u80', roles:[] as string[]};
    expect(hasRole(u, 'role_80')).toBe(false);
    u = addRole(u, 'role_80');
    expect(hasRole(u, 'role_80')).toBe(true);
    u = removeRole(u, 'role_80');
    expect(hasRole(u, 'role_80')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_81' (variant 81)", () => {
    let u = {id:'u81', roles:[] as string[]};
    expect(hasRole(u, 'role_81')).toBe(false);
    u = addRole(u, 'role_81');
    expect(hasRole(u, 'role_81')).toBe(true);
    u = removeRole(u, 'role_81');
    expect(hasRole(u, 'role_81')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_82' (variant 82)", () => {
    let u = {id:'u82', roles:[] as string[]};
    expect(hasRole(u, 'role_82')).toBe(false);
    u = addRole(u, 'role_82');
    expect(hasRole(u, 'role_82')).toBe(true);
    u = removeRole(u, 'role_82');
    expect(hasRole(u, 'role_82')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_83' (variant 83)", () => {
    let u = {id:'u83', roles:[] as string[]};
    expect(hasRole(u, 'role_83')).toBe(false);
    u = addRole(u, 'role_83');
    expect(hasRole(u, 'role_83')).toBe(true);
    u = removeRole(u, 'role_83');
    expect(hasRole(u, 'role_83')).toBe(false);
  });

  it("hasRole/addRole/removeRole lifecycle for 'role_84' (variant 84)", () => {
    let u = {id:'u84', roles:[] as string[]};
    expect(hasRole(u, 'role_84')).toBe(false);
    u = addRole(u, 'role_84');
    expect(hasRole(u, 'role_84')).toBe(true);
    u = removeRole(u, 'role_84');
    expect(hasRole(u, 'role_84')).toBe(false);
  });

});

describe('evaluate policies', () => {
  it('createPolicy returns correct object', () => {
    const p = createPolicy('doc', 'read', true);
    expect(p.resource).toBe('doc'); expect(p.action).toBe('read'); expect(p.allow).toBe(true);
  });

  it('evaluate with no policies returns false', () => {
    expect(evaluate([], 'doc', 'read')).toBe(false);
  });

  it('evaluate allow policy returns true', () => {
    const p = createPolicy('doc', 'read', true);
    expect(evaluate([p], 'doc', 'read')).toBe(true);
  });

  it('evaluate deny policy returns false', () => {
    const p = createPolicy('doc', 'read', false);
    expect(evaluate([p], 'doc', 'read')).toBe(false);
  });

  it('deny overrides allow', () => {
    const allow = createPolicy('doc','read',true);
    const deny = createPolicy('doc','read',false);
    expect(evaluate([allow, deny], 'doc', 'read')).toBe(false);
  });

  it('deny overrides allow regardless of order', () => {
    const allow = createPolicy('doc','read',true);
    const deny = createPolicy('doc','read',false);
    expect(evaluate([deny, allow], 'doc', 'read')).toBe(false);
  });

  it('non-matching resource returns false', () => {
    const p = createPolicy('doc','read',true);
    expect(evaluate([p], 'file', 'read')).toBe(false);
  });

  it('non-matching action returns false', () => {
    const p = createPolicy('doc','read',true);
    expect(evaluate([p], 'doc', 'write')).toBe(false);
  });

  it('multiple allow policies for same resource+action returns true', () => {
    const p1 = createPolicy('doc','read',true);
    const p2 = createPolicy('doc','read',true);
    expect(evaluate([p1,p2], 'doc', 'read')).toBe(true);
  });

  it('policy for different resource does not affect evaluation', () => {
    const p1 = createPolicy('doc','read',true);
    const p2 = createPolicy('file','read',false);
    expect(evaluate([p1,p2], 'doc', 'read')).toBe(true);
  });

  it('policy for different action does not affect evaluation', () => {
    const p1 = createPolicy('doc','read',true);
    const p2 = createPolicy('doc','write',false);
    expect(evaluate([p1,p2], 'doc', 'read')).toBe(true);
  });

  it('multiple deny policies returns false', () => {
    const d1 = createPolicy('doc','read',false);
    const d2 = createPolicy('doc','read',false);
    expect(evaluate([d1,d2], 'doc', 'read')).toBe(false);
  });

  it("allow policy for action='*' must exactly match action string", () => {
    const p = createPolicy('doc','*',true);
    expect(evaluate([p], 'doc', 'read')).toBe(false);
  });

  it('evaluate returns false when no policy matches resource', () => {
    const p = createPolicy('doc','read',true);
    expect(evaluate([p], 'report', 'read')).toBe(false);
  });

  it('createPolicy with allow=false creates deny policy', () => {
    const p = createPolicy('x','y',false);
    expect(p.allow).toBe(false);
  });

  it('evaluate single policy resource=res0 action=act0 allow=false (variant 0)', () => {
    const p = createPolicy('res0', 'act0', false);
    expect(evaluate([p], 'res0', 'act0')).toBe(false);
  });

  it('evaluate single policy resource=res1 action=act1 allow=true (variant 1)', () => {
    const p = createPolicy('res1', 'act1', true);
    expect(evaluate([p], 'res1', 'act1')).toBe(true);
  });

  it('evaluate single policy resource=res2 action=act2 allow=true (variant 2)', () => {
    const p = createPolicy('res2', 'act2', true);
    expect(evaluate([p], 'res2', 'act2')).toBe(true);
  });

  it('evaluate single policy resource=res3 action=act3 allow=false (variant 3)', () => {
    const p = createPolicy('res3', 'act3', false);
    expect(evaluate([p], 'res3', 'act3')).toBe(false);
  });

  it('evaluate single policy resource=res4 action=act0 allow=true (variant 4)', () => {
    const p = createPolicy('res4', 'act0', true);
    expect(evaluate([p], 'res4', 'act0')).toBe(true);
  });

  it('evaluate single policy resource=res0 action=act1 allow=true (variant 5)', () => {
    const p = createPolicy('res0', 'act1', true);
    expect(evaluate([p], 'res0', 'act1')).toBe(true);
  });

  it('evaluate single policy resource=res1 action=act2 allow=false (variant 6)', () => {
    const p = createPolicy('res1', 'act2', false);
    expect(evaluate([p], 'res1', 'act2')).toBe(false);
  });

  it('evaluate single policy resource=res2 action=act3 allow=true (variant 7)', () => {
    const p = createPolicy('res2', 'act3', true);
    expect(evaluate([p], 'res2', 'act3')).toBe(true);
  });

  it('evaluate single policy resource=res3 action=act0 allow=true (variant 8)', () => {
    const p = createPolicy('res3', 'act0', true);
    expect(evaluate([p], 'res3', 'act0')).toBe(true);
  });

  it('evaluate single policy resource=res4 action=act1 allow=false (variant 9)', () => {
    const p = createPolicy('res4', 'act1', false);
    expect(evaluate([p], 'res4', 'act1')).toBe(false);
  });

  it('evaluate single policy resource=res0 action=act2 allow=true (variant 10)', () => {
    const p = createPolicy('res0', 'act2', true);
    expect(evaluate([p], 'res0', 'act2')).toBe(true);
  });

  it('evaluate single policy resource=res1 action=act3 allow=true (variant 11)', () => {
    const p = createPolicy('res1', 'act3', true);
    expect(evaluate([p], 'res1', 'act3')).toBe(true);
  });

  it('evaluate single policy resource=res2 action=act0 allow=false (variant 12)', () => {
    const p = createPolicy('res2', 'act0', false);
    expect(evaluate([p], 'res2', 'act0')).toBe(false);
  });

  it('evaluate single policy resource=res3 action=act1 allow=true (variant 13)', () => {
    const p = createPolicy('res3', 'act1', true);
    expect(evaluate([p], 'res3', 'act1')).toBe(true);
  });

  it('evaluate single policy resource=res4 action=act2 allow=true (variant 14)', () => {
    const p = createPolicy('res4', 'act2', true);
    expect(evaluate([p], 'res4', 'act2')).toBe(true);
  });

  it('evaluate single policy resource=res0 action=act3 allow=false (variant 15)', () => {
    const p = createPolicy('res0', 'act3', false);
    expect(evaluate([p], 'res0', 'act3')).toBe(false);
  });

  it('evaluate single policy resource=res1 action=act0 allow=true (variant 16)', () => {
    const p = createPolicy('res1', 'act0', true);
    expect(evaluate([p], 'res1', 'act0')).toBe(true);
  });

  it('evaluate single policy resource=res2 action=act1 allow=true (variant 17)', () => {
    const p = createPolicy('res2', 'act1', true);
    expect(evaluate([p], 'res2', 'act1')).toBe(true);
  });

  it('evaluate single policy resource=res3 action=act2 allow=false (variant 18)', () => {
    const p = createPolicy('res3', 'act2', false);
    expect(evaluate([p], 'res3', 'act2')).toBe(false);
  });

  it('evaluate single policy resource=res4 action=act3 allow=true (variant 19)', () => {
    const p = createPolicy('res4', 'act3', true);
    expect(evaluate([p], 'res4', 'act3')).toBe(true);
  });

  it('evaluate single policy resource=res0 action=act0 allow=true (variant 20)', () => {
    const p = createPolicy('res0', 'act0', true);
    expect(evaluate([p], 'res0', 'act0')).toBe(true);
  });

  it('evaluate single policy resource=res1 action=act1 allow=false (variant 21)', () => {
    const p = createPolicy('res1', 'act1', false);
    expect(evaluate([p], 'res1', 'act1')).toBe(false);
  });

  it('evaluate single policy resource=res2 action=act2 allow=true (variant 22)', () => {
    const p = createPolicy('res2', 'act2', true);
    expect(evaluate([p], 'res2', 'act2')).toBe(true);
  });

  it('evaluate single policy resource=res3 action=act3 allow=true (variant 23)', () => {
    const p = createPolicy('res3', 'act3', true);
    expect(evaluate([p], 'res3', 'act3')).toBe(true);
  });

  it('evaluate single policy resource=res4 action=act0 allow=false (variant 24)', () => {
    const p = createPolicy('res4', 'act0', false);
    expect(evaluate([p], 'res4', 'act0')).toBe(false);
  });

  it('evaluate single policy resource=res0 action=act1 allow=true (variant 25)', () => {
    const p = createPolicy('res0', 'act1', true);
    expect(evaluate([p], 'res0', 'act1')).toBe(true);
  });

  it('evaluate single policy resource=res1 action=act2 allow=true (variant 26)', () => {
    const p = createPolicy('res1', 'act2', true);
    expect(evaluate([p], 'res1', 'act2')).toBe(true);
  });

  it('evaluate single policy resource=res2 action=act3 allow=false (variant 27)', () => {
    const p = createPolicy('res2', 'act3', false);
    expect(evaluate([p], 'res2', 'act3')).toBe(false);
  });

  it('evaluate single policy resource=res3 action=act0 allow=true (variant 28)', () => {
    const p = createPolicy('res3', 'act0', true);
    expect(evaluate([p], 'res3', 'act0')).toBe(true);
  });

  it('evaluate single policy resource=res4 action=act1 allow=true (variant 29)', () => {
    const p = createPolicy('res4', 'act1', true);
    expect(evaluate([p], 'res4', 'act1')).toBe(true);
  });

  it('evaluate single policy resource=res0 action=act2 allow=false (variant 30)', () => {
    const p = createPolicy('res0', 'act2', false);
    expect(evaluate([p], 'res0', 'act2')).toBe(false);
  });

  it('evaluate single policy resource=res1 action=act3 allow=true (variant 31)', () => {
    const p = createPolicy('res1', 'act3', true);
    expect(evaluate([p], 'res1', 'act3')).toBe(true);
  });

  it('evaluate single policy resource=res2 action=act0 allow=true (variant 32)', () => {
    const p = createPolicy('res2', 'act0', true);
    expect(evaluate([p], 'res2', 'act0')).toBe(true);
  });

  it('evaluate single policy resource=res3 action=act1 allow=false (variant 33)', () => {
    const p = createPolicy('res3', 'act1', false);
    expect(evaluate([p], 'res3', 'act1')).toBe(false);
  });

  it('evaluate single policy resource=res4 action=act2 allow=true (variant 34)', () => {
    const p = createPolicy('res4', 'act2', true);
    expect(evaluate([p], 'res4', 'act2')).toBe(true);
  });

  it('evaluate single policy resource=res0 action=act3 allow=true (variant 35)', () => {
    const p = createPolicy('res0', 'act3', true);
    expect(evaluate([p], 'res0', 'act3')).toBe(true);
  });

  it('evaluate single policy resource=res1 action=act0 allow=false (variant 36)', () => {
    const p = createPolicy('res1', 'act0', false);
    expect(evaluate([p], 'res1', 'act0')).toBe(false);
  });

  it('evaluate single policy resource=res2 action=act1 allow=true (variant 37)', () => {
    const p = createPolicy('res2', 'act1', true);
    expect(evaluate([p], 'res2', 'act1')).toBe(true);
  });

  it('evaluate single policy resource=res3 action=act2 allow=true (variant 38)', () => {
    const p = createPolicy('res3', 'act2', true);
    expect(evaluate([p], 'res3', 'act2')).toBe(true);
  });

  it('evaluate single policy resource=res4 action=act3 allow=false (variant 39)', () => {
    const p = createPolicy('res4', 'act3', false);
    expect(evaluate([p], 'res4', 'act3')).toBe(false);
  });

  it('evaluate single policy resource=res0 action=act0 allow=true (variant 40)', () => {
    const p = createPolicy('res0', 'act0', true);
    expect(evaluate([p], 'res0', 'act0')).toBe(true);
  });

  it('evaluate single policy resource=res1 action=act1 allow=true (variant 41)', () => {
    const p = createPolicy('res1', 'act1', true);
    expect(evaluate([p], 'res1', 'act1')).toBe(true);
  });

  it('evaluate single policy resource=res2 action=act2 allow=false (variant 42)', () => {
    const p = createPolicy('res2', 'act2', false);
    expect(evaluate([p], 'res2', 'act2')).toBe(false);
  });

  it('evaluate single policy resource=res3 action=act3 allow=true (variant 43)', () => {
    const p = createPolicy('res3', 'act3', true);
    expect(evaluate([p], 'res3', 'act3')).toBe(true);
  });

  it('evaluate single policy resource=res4 action=act0 allow=true (variant 44)', () => {
    const p = createPolicy('res4', 'act0', true);
    expect(evaluate([p], 'res4', 'act0')).toBe(true);
  });

  it('evaluate single policy resource=res0 action=act1 allow=false (variant 45)', () => {
    const p = createPolicy('res0', 'act1', false);
    expect(evaluate([p], 'res0', 'act1')).toBe(false);
  });

  it('evaluate single policy resource=res1 action=act2 allow=true (variant 46)', () => {
    const p = createPolicy('res1', 'act2', true);
    expect(evaluate([p], 'res1', 'act2')).toBe(true);
  });

  it('evaluate single policy resource=res2 action=act3 allow=true (variant 47)', () => {
    const p = createPolicy('res2', 'act3', true);
    expect(evaluate([p], 'res2', 'act3')).toBe(true);
  });

  it('evaluate single policy resource=res3 action=act0 allow=false (variant 48)', () => {
    const p = createPolicy('res3', 'act0', false);
    expect(evaluate([p], 'res3', 'act0')).toBe(false);
  });

  it('evaluate single policy resource=res4 action=act1 allow=true (variant 49)', () => {
    const p = createPolicy('res4', 'act1', true);
    expect(evaluate([p], 'res4', 'act1')).toBe(true);
  });

  it('evaluate single policy resource=res0 action=act2 allow=true (variant 50)', () => {
    const p = createPolicy('res0', 'act2', true);
    expect(evaluate([p], 'res0', 'act2')).toBe(true);
  });

  it('evaluate single policy resource=res1 action=act3 allow=false (variant 51)', () => {
    const p = createPolicy('res1', 'act3', false);
    expect(evaluate([p], 'res1', 'act3')).toBe(false);
  });

  it('evaluate single policy resource=res2 action=act0 allow=true (variant 52)', () => {
    const p = createPolicy('res2', 'act0', true);
    expect(evaluate([p], 'res2', 'act0')).toBe(true);
  });

  it('evaluate single policy resource=res3 action=act1 allow=true (variant 53)', () => {
    const p = createPolicy('res3', 'act1', true);
    expect(evaluate([p], 'res3', 'act1')).toBe(true);
  });

  it('evaluate single policy resource=res4 action=act2 allow=false (variant 54)', () => {
    const p = createPolicy('res4', 'act2', false);
    expect(evaluate([p], 'res4', 'act2')).toBe(false);
  });

  it('evaluate single policy resource=res0 action=act3 allow=true (variant 55)', () => {
    const p = createPolicy('res0', 'act3', true);
    expect(evaluate([p], 'res0', 'act3')).toBe(true);
  });

  it('evaluate single policy resource=res1 action=act0 allow=true (variant 56)', () => {
    const p = createPolicy('res1', 'act0', true);
    expect(evaluate([p], 'res1', 'act0')).toBe(true);
  });

  it('evaluate single policy resource=res2 action=act1 allow=false (variant 57)', () => {
    const p = createPolicy('res2', 'act1', false);
    expect(evaluate([p], 'res2', 'act1')).toBe(false);
  });

  it('evaluate single policy resource=res3 action=act2 allow=true (variant 58)', () => {
    const p = createPolicy('res3', 'act2', true);
    expect(evaluate([p], 'res3', 'act2')).toBe(true);
  });

  it('evaluate single policy resource=res4 action=act3 allow=true (variant 59)', () => {
    const p = createPolicy('res4', 'act3', true);
    expect(evaluate([p], 'res4', 'act3')).toBe(true);
  });

  it('evaluate single policy resource=res0 action=act0 allow=false (variant 60)', () => {
    const p = createPolicy('res0', 'act0', false);
    expect(evaluate([p], 'res0', 'act0')).toBe(false);
  });

  it('evaluate single policy resource=res1 action=act1 allow=true (variant 61)', () => {
    const p = createPolicy('res1', 'act1', true);
    expect(evaluate([p], 'res1', 'act1')).toBe(true);
  });

  it('evaluate single policy resource=res2 action=act2 allow=true (variant 62)', () => {
    const p = createPolicy('res2', 'act2', true);
    expect(evaluate([p], 'res2', 'act2')).toBe(true);
  });

  it('evaluate single policy resource=res3 action=act3 allow=false (variant 63)', () => {
    const p = createPolicy('res3', 'act3', false);
    expect(evaluate([p], 'res3', 'act3')).toBe(false);
  });

  it('evaluate single policy resource=res4 action=act0 allow=true (variant 64)', () => {
    const p = createPolicy('res4', 'act0', true);
    expect(evaluate([p], 'res4', 'act0')).toBe(true);
  });

  it('evaluate single policy resource=res0 action=act1 allow=true (variant 65)', () => {
    const p = createPolicy('res0', 'act1', true);
    expect(evaluate([p], 'res0', 'act1')).toBe(true);
  });

  it('evaluate single policy resource=res1 action=act2 allow=false (variant 66)', () => {
    const p = createPolicy('res1', 'act2', false);
    expect(evaluate([p], 'res1', 'act2')).toBe(false);
  });

  it('evaluate single policy resource=res2 action=act3 allow=true (variant 67)', () => {
    const p = createPolicy('res2', 'act3', true);
    expect(evaluate([p], 'res2', 'act3')).toBe(true);
  });

  it('evaluate single policy resource=res3 action=act0 allow=true (variant 68)', () => {
    const p = createPolicy('res3', 'act0', true);
    expect(evaluate([p], 'res3', 'act0')).toBe(true);
  });

  it('evaluate single policy resource=res4 action=act1 allow=false (variant 69)', () => {
    const p = createPolicy('res4', 'act1', false);
    expect(evaluate([p], 'res4', 'act1')).toBe(false);
  });

  it('evaluate single policy resource=res0 action=act2 allow=true (variant 70)', () => {
    const p = createPolicy('res0', 'act2', true);
    expect(evaluate([p], 'res0', 'act2')).toBe(true);
  });

  it('evaluate single policy resource=res1 action=act3 allow=true (variant 71)', () => {
    const p = createPolicy('res1', 'act3', true);
    expect(evaluate([p], 'res1', 'act3')).toBe(true);
  });

  it('evaluate single policy resource=res2 action=act0 allow=false (variant 72)', () => {
    const p = createPolicy('res2', 'act0', false);
    expect(evaluate([p], 'res2', 'act0')).toBe(false);
  });

  it('evaluate single policy resource=res3 action=act1 allow=true (variant 73)', () => {
    const p = createPolicy('res3', 'act1', true);
    expect(evaluate([p], 'res3', 'act1')).toBe(true);
  });

  it('evaluate single policy resource=res4 action=act2 allow=true (variant 74)', () => {
    const p = createPolicy('res4', 'act2', true);
    expect(evaluate([p], 'res4', 'act2')).toBe(true);
  });

  it('evaluate single policy resource=res0 action=act3 allow=false (variant 75)', () => {
    const p = createPolicy('res0', 'act3', false);
    expect(evaluate([p], 'res0', 'act3')).toBe(false);
  });

  it('evaluate single policy resource=res1 action=act0 allow=true (variant 76)', () => {
    const p = createPolicy('res1', 'act0', true);
    expect(evaluate([p], 'res1', 'act0')).toBe(true);
  });

  it('evaluate single policy resource=res2 action=act1 allow=true (variant 77)', () => {
    const p = createPolicy('res2', 'act1', true);
    expect(evaluate([p], 'res2', 'act1')).toBe(true);
  });

  it('evaluate single policy resource=res3 action=act2 allow=false (variant 78)', () => {
    const p = createPolicy('res3', 'act2', false);
    expect(evaluate([p], 'res3', 'act2')).toBe(false);
  });

  it('evaluate single policy resource=res4 action=act3 allow=true (variant 79)', () => {
    const p = createPolicy('res4', 'act3', true);
    expect(evaluate([p], 'res4', 'act3')).toBe(true);
  });

  it('evaluate single policy resource=res0 action=act0 allow=true (variant 80)', () => {
    const p = createPolicy('res0', 'act0', true);
    expect(evaluate([p], 'res0', 'act0')).toBe(true);
  });

  it('evaluate single policy resource=res1 action=act1 allow=false (variant 81)', () => {
    const p = createPolicy('res1', 'act1', false);
    expect(evaluate([p], 'res1', 'act1')).toBe(false);
  });

  it('evaluate single policy resource=res2 action=act2 allow=true (variant 82)', () => {
    const p = createPolicy('res2', 'act2', true);
    expect(evaluate([p], 'res2', 'act2')).toBe(true);
  });

  it('evaluate single policy resource=res3 action=act3 allow=true (variant 83)', () => {
    const p = createPolicy('res3', 'act3', true);
    expect(evaluate([p], 'res3', 'act3')).toBe(true);
  });

  it('evaluate single policy resource=res4 action=act0 allow=false (variant 84)', () => {
    const p = createPolicy('res4', 'act0', false);
    expect(evaluate([p], 'res4', 'act0')).toBe(false);
  });

});

describe('encodeClaims, decodeClaims, hasClaim', () => {
  it('encodeClaims produces a string', () => {
    expect(typeof encodeClaims({sub:'u1'})).toBe('string');
  });

  it('decodeClaims returns original object', () => {
    const token = encodeClaims({sub:'u1', role:'admin'});
    expect(decodeClaims(token)).toEqual({sub:'u1', role:'admin'});
  });

  it('decodeClaims returns null for invalid base64', () => {
    expect(decodeClaims('!!!not-valid-base64-json')).toBeNull();
  });

  it('decodeClaims returns null for base64 of non-object', () => {
    const token = Buffer.from(JSON.stringify([1,2,3])).toString('base64');
    expect(decodeClaims(token)).toBeNull();
  });

  it('decodeClaims returns null for base64 of null', () => {
    const token = Buffer.from('null').toString('base64');
    expect(decodeClaims(token)).toBeNull();
  });

  it('hasClaim returns true when key present', () => {
    const token = encodeClaims({role:'admin'});
    expect(hasClaim(token, 'role')).toBe(true);
  });

  it('hasClaim returns false when key absent', () => {
    const token = encodeClaims({sub:'u1'});
    expect(hasClaim(token, 'role')).toBe(false);
  });

  it('hasClaim with value checks equality', () => {
    const token = encodeClaims({role:'admin'});
    expect(hasClaim(token, 'role', 'admin')).toBe(true);
  });

  it('hasClaim with wrong value returns false', () => {
    const token = encodeClaims({role:'user'});
    expect(hasClaim(token, 'role', 'admin')).toBe(false);
  });

  it('hasClaim returns false on invalid token', () => {
    expect(hasClaim('!!!bad', 'role')).toBe(false);
  });

  it('encodeClaims round-trips numeric values', () => {
    const token = encodeClaims({exp: 9999, iat: 1000});
    expect(decodeClaims(token)).toEqual({exp:9999, iat:1000});
  });

  it('encodeClaims round-trips boolean values', () => {
    const token = encodeClaims({active: true});
    const d = decodeClaims(token);
    expect(d && d['active']).toBe(true);
  });

  it('encodeClaims round-trips null value in claims', () => {
    const token = encodeClaims({foo: null});
    const d = decodeClaims(token);
    expect(d && d['foo']).toBeNull();
  });

  it('hasClaim with numeric value check', () => {
    const token = encodeClaims({level: 5});
    expect(hasClaim(token, 'level', 5)).toBe(true);
    expect(hasClaim(token, 'level', 6)).toBe(false);
  });

  it('hasClaim without value only checks key presence', () => {
    const token = encodeClaims({x: false});
    expect(hasClaim(token, 'x')).toBe(true);
  });

  it("hasClaim round-trip for key 'claim_0' value 'value_0' (variant 0)", () => {
    const token = encodeClaims({ 'claim_0': 'value_0' });
    expect(hasClaim(token, 'claim_0', 'value_0')).toBe(true);
    expect(hasClaim(token, 'claim_0', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_1' value 'value_1' (variant 1)", () => {
    const token = encodeClaims({ 'claim_1': 'value_1' });
    expect(hasClaim(token, 'claim_1', 'value_1')).toBe(true);
    expect(hasClaim(token, 'claim_1', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_2' value 'value_2' (variant 2)", () => {
    const token = encodeClaims({ 'claim_2': 'value_2' });
    expect(hasClaim(token, 'claim_2', 'value_2')).toBe(true);
    expect(hasClaim(token, 'claim_2', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_3' value 'value_3' (variant 3)", () => {
    const token = encodeClaims({ 'claim_3': 'value_3' });
    expect(hasClaim(token, 'claim_3', 'value_3')).toBe(true);
    expect(hasClaim(token, 'claim_3', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_4' value 'value_4' (variant 4)", () => {
    const token = encodeClaims({ 'claim_4': 'value_4' });
    expect(hasClaim(token, 'claim_4', 'value_4')).toBe(true);
    expect(hasClaim(token, 'claim_4', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_5' value 'value_5' (variant 5)", () => {
    const token = encodeClaims({ 'claim_5': 'value_5' });
    expect(hasClaim(token, 'claim_5', 'value_5')).toBe(true);
    expect(hasClaim(token, 'claim_5', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_6' value 'value_6' (variant 6)", () => {
    const token = encodeClaims({ 'claim_6': 'value_6' });
    expect(hasClaim(token, 'claim_6', 'value_6')).toBe(true);
    expect(hasClaim(token, 'claim_6', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_7' value 'value_7' (variant 7)", () => {
    const token = encodeClaims({ 'claim_7': 'value_7' });
    expect(hasClaim(token, 'claim_7', 'value_7')).toBe(true);
    expect(hasClaim(token, 'claim_7', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_8' value 'value_8' (variant 8)", () => {
    const token = encodeClaims({ 'claim_8': 'value_8' });
    expect(hasClaim(token, 'claim_8', 'value_8')).toBe(true);
    expect(hasClaim(token, 'claim_8', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_9' value 'value_9' (variant 9)", () => {
    const token = encodeClaims({ 'claim_9': 'value_9' });
    expect(hasClaim(token, 'claim_9', 'value_9')).toBe(true);
    expect(hasClaim(token, 'claim_9', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_10' value 'value_10' (variant 10)", () => {
    const token = encodeClaims({ 'claim_10': 'value_10' });
    expect(hasClaim(token, 'claim_10', 'value_10')).toBe(true);
    expect(hasClaim(token, 'claim_10', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_11' value 'value_11' (variant 11)", () => {
    const token = encodeClaims({ 'claim_11': 'value_11' });
    expect(hasClaim(token, 'claim_11', 'value_11')).toBe(true);
    expect(hasClaim(token, 'claim_11', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_12' value 'value_12' (variant 12)", () => {
    const token = encodeClaims({ 'claim_12': 'value_12' });
    expect(hasClaim(token, 'claim_12', 'value_12')).toBe(true);
    expect(hasClaim(token, 'claim_12', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_13' value 'value_13' (variant 13)", () => {
    const token = encodeClaims({ 'claim_13': 'value_13' });
    expect(hasClaim(token, 'claim_13', 'value_13')).toBe(true);
    expect(hasClaim(token, 'claim_13', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_14' value 'value_14' (variant 14)", () => {
    const token = encodeClaims({ 'claim_14': 'value_14' });
    expect(hasClaim(token, 'claim_14', 'value_14')).toBe(true);
    expect(hasClaim(token, 'claim_14', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_15' value 'value_15' (variant 15)", () => {
    const token = encodeClaims({ 'claim_15': 'value_15' });
    expect(hasClaim(token, 'claim_15', 'value_15')).toBe(true);
    expect(hasClaim(token, 'claim_15', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_16' value 'value_16' (variant 16)", () => {
    const token = encodeClaims({ 'claim_16': 'value_16' });
    expect(hasClaim(token, 'claim_16', 'value_16')).toBe(true);
    expect(hasClaim(token, 'claim_16', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_17' value 'value_17' (variant 17)", () => {
    const token = encodeClaims({ 'claim_17': 'value_17' });
    expect(hasClaim(token, 'claim_17', 'value_17')).toBe(true);
    expect(hasClaim(token, 'claim_17', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_18' value 'value_18' (variant 18)", () => {
    const token = encodeClaims({ 'claim_18': 'value_18' });
    expect(hasClaim(token, 'claim_18', 'value_18')).toBe(true);
    expect(hasClaim(token, 'claim_18', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_19' value 'value_19' (variant 19)", () => {
    const token = encodeClaims({ 'claim_19': 'value_19' });
    expect(hasClaim(token, 'claim_19', 'value_19')).toBe(true);
    expect(hasClaim(token, 'claim_19', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_20' value 'value_20' (variant 20)", () => {
    const token = encodeClaims({ 'claim_20': 'value_20' });
    expect(hasClaim(token, 'claim_20', 'value_20')).toBe(true);
    expect(hasClaim(token, 'claim_20', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_21' value 'value_21' (variant 21)", () => {
    const token = encodeClaims({ 'claim_21': 'value_21' });
    expect(hasClaim(token, 'claim_21', 'value_21')).toBe(true);
    expect(hasClaim(token, 'claim_21', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_22' value 'value_22' (variant 22)", () => {
    const token = encodeClaims({ 'claim_22': 'value_22' });
    expect(hasClaim(token, 'claim_22', 'value_22')).toBe(true);
    expect(hasClaim(token, 'claim_22', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_23' value 'value_23' (variant 23)", () => {
    const token = encodeClaims({ 'claim_23': 'value_23' });
    expect(hasClaim(token, 'claim_23', 'value_23')).toBe(true);
    expect(hasClaim(token, 'claim_23', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_24' value 'value_24' (variant 24)", () => {
    const token = encodeClaims({ 'claim_24': 'value_24' });
    expect(hasClaim(token, 'claim_24', 'value_24')).toBe(true);
    expect(hasClaim(token, 'claim_24', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_25' value 'value_25' (variant 25)", () => {
    const token = encodeClaims({ 'claim_25': 'value_25' });
    expect(hasClaim(token, 'claim_25', 'value_25')).toBe(true);
    expect(hasClaim(token, 'claim_25', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_26' value 'value_26' (variant 26)", () => {
    const token = encodeClaims({ 'claim_26': 'value_26' });
    expect(hasClaim(token, 'claim_26', 'value_26')).toBe(true);
    expect(hasClaim(token, 'claim_26', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_27' value 'value_27' (variant 27)", () => {
    const token = encodeClaims({ 'claim_27': 'value_27' });
    expect(hasClaim(token, 'claim_27', 'value_27')).toBe(true);
    expect(hasClaim(token, 'claim_27', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_28' value 'value_28' (variant 28)", () => {
    const token = encodeClaims({ 'claim_28': 'value_28' });
    expect(hasClaim(token, 'claim_28', 'value_28')).toBe(true);
    expect(hasClaim(token, 'claim_28', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_29' value 'value_29' (variant 29)", () => {
    const token = encodeClaims({ 'claim_29': 'value_29' });
    expect(hasClaim(token, 'claim_29', 'value_29')).toBe(true);
    expect(hasClaim(token, 'claim_29', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_30' value 'value_30' (variant 30)", () => {
    const token = encodeClaims({ 'claim_30': 'value_30' });
    expect(hasClaim(token, 'claim_30', 'value_30')).toBe(true);
    expect(hasClaim(token, 'claim_30', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_31' value 'value_31' (variant 31)", () => {
    const token = encodeClaims({ 'claim_31': 'value_31' });
    expect(hasClaim(token, 'claim_31', 'value_31')).toBe(true);
    expect(hasClaim(token, 'claim_31', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_32' value 'value_32' (variant 32)", () => {
    const token = encodeClaims({ 'claim_32': 'value_32' });
    expect(hasClaim(token, 'claim_32', 'value_32')).toBe(true);
    expect(hasClaim(token, 'claim_32', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_33' value 'value_33' (variant 33)", () => {
    const token = encodeClaims({ 'claim_33': 'value_33' });
    expect(hasClaim(token, 'claim_33', 'value_33')).toBe(true);
    expect(hasClaim(token, 'claim_33', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

  it("hasClaim round-trip for key 'claim_34' value 'value_34' (variant 34)", () => {
    const token = encodeClaims({ 'claim_34': 'value_34' });
    expect(hasClaim(token, 'claim_34', 'value_34')).toBe(true);
    expect(hasClaim(token, 'claim_34', 'wrong')).toBe(false);
    expect(hasClaim(token, 'missing')).toBe(false);
  });

});


describe('edge cases and additional coverage', () => {
  it('grant edge case mask=13 perm=1 (variant 0)', () => {
    expect(grant(13, 1)).toBe(13);
  });

  it('grant edge case mask=44 perm=2 (variant 1)', () => {
    expect(grant(44, 2)).toBe(46);
  });

  it('grant edge case mask=75 perm=4 (variant 2)', () => {
    expect(grant(75, 4)).toBe(79);
  });

  it('grant edge case mask=106 perm=8 (variant 3)', () => {
    expect(grant(106, 8)).toBe(106);
  });

  it('grant edge case mask=137 perm=16 (variant 4)', () => {
    expect(grant(137, 16)).toBe(153);
  });

  it('grant edge case mask=168 perm=32 (variant 5)', () => {
    expect(grant(168, 32)).toBe(168);
  });

  it('grant edge case mask=199 perm=64 (variant 6)', () => {
    expect(grant(199, 64)).toBe(199);
  });

  it('grant edge case mask=230 perm=128 (variant 7)', () => {
    expect(grant(230, 128)).toBe(230);
  });

  it('grant edge case mask=5 perm=1 (variant 8)', () => {
    expect(grant(5, 1)).toBe(5);
  });

  it('grant edge case mask=36 perm=2 (variant 9)', () => {
    expect(grant(36, 2)).toBe(38);
  });

  it('revoke edge case mask=255 perm=1 (variant 0)', () => {
    expect(revoke(255, 1)).toBe(254);
  });

  it('revoke edge case mask=255 perm=2 (variant 1)', () => {
    expect(revoke(255, 2)).toBe(253);
  });

  it('revoke edge case mask=255 perm=4 (variant 2)', () => {
    expect(revoke(255, 4)).toBe(251);
  });

  it('revoke edge case mask=255 perm=8 (variant 3)', () => {
    expect(revoke(255, 8)).toBe(247);
  });

  it('revoke edge case mask=255 perm=16 (variant 4)', () => {
    expect(revoke(255, 16)).toBe(239);
  });

  it('revoke edge case mask=255 perm=32 (variant 5)', () => {
    expect(revoke(255, 32)).toBe(223);
  });

  it('revoke edge case mask=255 perm=64 (variant 6)', () => {
    expect(revoke(255, 64)).toBe(191);
  });

  it('revoke edge case mask=255 perm=128 (variant 7)', () => {
    expect(revoke(255, 128)).toBe(127);
  });

  it('revoke edge case mask=255 perm=1 (variant 8)', () => {
    expect(revoke(255, 1)).toBe(254);
  });

  it('revoke edge case mask=255 perm=2 (variant 9)', () => {
    expect(revoke(255, 2)).toBe(253);
  });

  it('has multi-bit mask contains target bit (variant 0)', () => {
    expect(has(3, 1)).toBe(true);
  });

  it('has multi-bit mask contains target bit (variant 1)', () => {
    expect(has(6, 2)).toBe(true);
  });

  it('has multi-bit mask contains target bit (variant 2)', () => {
    expect(has(12, 4)).toBe(true);
  });

  it('has multi-bit mask contains target bit (variant 3)', () => {
    expect(has(24, 8)).toBe(true);
  });

  it('has multi-bit mask contains target bit (variant 4)', () => {
    expect(has(48, 16)).toBe(true);
  });

  it('has multi-bit mask contains target bit (variant 5)', () => {
    expect(has(96, 32)).toBe(true);
  });

  it('has multi-bit mask contains target bit (variant 6)', () => {
    expect(has(192, 64)).toBe(true);
  });

  it('has multi-bit mask contains target bit (variant 7)', () => {
    expect(has(129, 128)).toBe(true);
  });

  it('has multi-bit mask contains target bit (variant 8)', () => {
    expect(has(3, 1)).toBe(true);
  });

  it('has multi-bit mask contains target bit (variant 9)', () => {
    expect(has(6, 2)).toBe(true);
  });

  it('combine(1,4)=5 intersection(1,4)=0 (variant 0)', () => {
    expect(combine(1,4)).toBe(5);
    expect(intersection(1,4)).toBe(0);
  });

  it('combine(2,8)=10 intersection(2,8)=0 (variant 1)', () => {
    expect(combine(2,8)).toBe(10);
    expect(intersection(2,8)).toBe(0);
  });

  it('combine(4,1)=5 intersection(4,1)=0 (variant 2)', () => {
    expect(combine(4,1)).toBe(5);
    expect(intersection(4,1)).toBe(0);
  });

  it('combine(8,2)=10 intersection(8,2)=0 (variant 3)', () => {
    expect(combine(8,2)).toBe(10);
    expect(intersection(8,2)).toBe(0);
  });

  it('combine(1,4)=5 intersection(1,4)=0 (variant 4)', () => {
    expect(combine(1,4)).toBe(5);
    expect(intersection(1,4)).toBe(0);
  });

  it('combine(2,8)=10 intersection(2,8)=0 (variant 5)', () => {
    expect(combine(2,8)).toBe(10);
    expect(intersection(2,8)).toBe(0);
  });

  it('combine(4,1)=5 intersection(4,1)=0 (variant 6)', () => {
    expect(combine(4,1)).toBe(5);
    expect(intersection(4,1)).toBe(0);
  });

  it('combine(8,2)=10 intersection(8,2)=0 (variant 7)', () => {
    expect(combine(8,2)).toBe(10);
    expect(intersection(8,2)).toBe(0);
  });

  it('combine(1,4)=5 intersection(1,4)=0 (variant 8)', () => {
    expect(combine(1,4)).toBe(5);
    expect(intersection(1,4)).toBe(0);
  });

  it('combine(2,8)=10 intersection(2,8)=0 (variant 9)', () => {
    expect(combine(2,8)).toBe(10);
    expect(intersection(2,8)).toBe(0);
  });

  it('getUserPermissions 3 roles combined = 7 (variant 0)', () => {
    const roles = [createRole('r1','R1',1), createRole('r2','R2',2), createRole('r3','R3',4)];
    const user = {id:'u0', roles:['r1','r2','r3']};
    expect(getUserPermissions(user, roles)).toBe(7);
  });

  it('getUserPermissions 3 roles combined = 7 (variant 1)', () => {
    const roles = [createRole('r1','R1',2), createRole('r2','R2',4), createRole('r3','R3',1)];
    const user = {id:'u1', roles:['r1','r2','r3']};
    expect(getUserPermissions(user, roles)).toBe(7);
  });

  it('getUserPermissions 3 roles combined = 7 (variant 2)', () => {
    const roles = [createRole('r1','R1',4), createRole('r2','R2',1), createRole('r3','R3',2)];
    const user = {id:'u2', roles:['r1','r2','r3']};
    expect(getUserPermissions(user, roles)).toBe(7);
  });

  it('getUserPermissions 3 roles combined = 7 (variant 3)', () => {
    const roles = [createRole('r1','R1',1), createRole('r2','R2',2), createRole('r3','R3',4)];
    const user = {id:'u3', roles:['r1','r2','r3']};
    expect(getUserPermissions(user, roles)).toBe(7);
  });

  it('getUserPermissions 3 roles combined = 7 (variant 4)', () => {
    const roles = [createRole('r1','R1',2), createRole('r2','R2',4), createRole('r3','R3',1)];
    const user = {id:'u4', roles:['r1','r2','r3']};
    expect(getUserPermissions(user, roles)).toBe(7);
  });

  it('getUserPermissions 3 roles combined = 7 (variant 5)', () => {
    const roles = [createRole('r1','R1',4), createRole('r2','R2',1), createRole('r3','R3',2)];
    const user = {id:'u5', roles:['r1','r2','r3']};
    expect(getUserPermissions(user, roles)).toBe(7);
  });

  it('getUserPermissions 3 roles combined = 7 (variant 6)', () => {
    const roles = [createRole('r1','R1',1), createRole('r2','R2',2), createRole('r3','R3',4)];
    const user = {id:'u6', roles:['r1','r2','r3']};
    expect(getUserPermissions(user, roles)).toBe(7);
  });

  it('getUserPermissions 3 roles combined = 7 (variant 7)', () => {
    const roles = [createRole('r1','R1',2), createRole('r2','R2',4), createRole('r3','R3',1)];
    const user = {id:'u7', roles:['r1','r2','r3']};
    expect(getUserPermissions(user, roles)).toBe(7);
  });

  it('getUserPermissions 3 roles combined = 7 (variant 8)', () => {
    const roles = [createRole('r1','R1',4), createRole('r2','R2',1), createRole('r3','R3',2)];
    const user = {id:'u8', roles:['r1','r2','r3']};
    expect(getUserPermissions(user, roles)).toBe(7);
  });

  it('getUserPermissions 3 roles combined = 7 (variant 9)', () => {
    const roles = [createRole('r1','R1',1), createRole('r2','R2',2), createRole('r3','R3',4)];
    const user = {id:'u9', roles:['r1','r2','r3']};
    expect(getUserPermissions(user, roles)).toBe(7);
  });

});
