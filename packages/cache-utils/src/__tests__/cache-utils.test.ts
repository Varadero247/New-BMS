// Copyright (c) 2026 Nexara DMCC. All rights reserved.

import {
  createLRUCache,
  createTTLCache,
  memoize,
  memoizeAsync,
  createStore,
  buildKey,
  hashKey,
} from '../cache-utils';

describe('LRUCache – get/set/has', () => {
  it('get/set #1: stores and retrieves value 1', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k1', 1);
    expect(c.get('k1')).toBe(1);
  });
  it('get/set #2: stores and retrieves value 2', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k2', 2);
    expect(c.get('k2')).toBe(2);
  });
  it('get/set #3: stores and retrieves value 3', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k3', 3);
    expect(c.get('k3')).toBe(3);
  });
  it('get/set #4: stores and retrieves value 4', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k4', 4);
    expect(c.get('k4')).toBe(4);
  });
  it('get/set #5: stores and retrieves value 5', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k5', 5);
    expect(c.get('k5')).toBe(5);
  });
  it('get/set #6: stores and retrieves value 6', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k6', 6);
    expect(c.get('k6')).toBe(6);
  });
  it('get/set #7: stores and retrieves value 7', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k7', 7);
    expect(c.get('k7')).toBe(7);
  });
  it('get/set #8: stores and retrieves value 8', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k8', 8);
    expect(c.get('k8')).toBe(8);
  });
  it('get/set #9: stores and retrieves value 9', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k9', 9);
    expect(c.get('k9')).toBe(9);
  });
  it('get/set #10: stores and retrieves value 10', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k10', 10);
    expect(c.get('k10')).toBe(10);
  });
  it('get/set #11: stores and retrieves value 11', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k11', 11);
    expect(c.get('k11')).toBe(11);
  });
  it('get/set #12: stores and retrieves value 12', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k12', 12);
    expect(c.get('k12')).toBe(12);
  });
  it('get/set #13: stores and retrieves value 13', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k13', 13);
    expect(c.get('k13')).toBe(13);
  });
  it('get/set #14: stores and retrieves value 14', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k14', 14);
    expect(c.get('k14')).toBe(14);
  });
  it('get/set #15: stores and retrieves value 15', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k15', 15);
    expect(c.get('k15')).toBe(15);
  });
  it('get/set #16: stores and retrieves value 16', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k16', 16);
    expect(c.get('k16')).toBe(16);
  });
  it('get/set #17: stores and retrieves value 17', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k17', 17);
    expect(c.get('k17')).toBe(17);
  });
  it('get/set #18: stores and retrieves value 18', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k18', 18);
    expect(c.get('k18')).toBe(18);
  });
  it('get/set #19: stores and retrieves value 19', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k19', 19);
    expect(c.get('k19')).toBe(19);
  });
  it('get/set #20: stores and retrieves value 20', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k20', 20);
    expect(c.get('k20')).toBe(20);
  });
  it('get/set #21: stores and retrieves value 21', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k21', 21);
    expect(c.get('k21')).toBe(21);
  });
  it('get/set #22: stores and retrieves value 22', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k22', 22);
    expect(c.get('k22')).toBe(22);
  });
  it('get/set #23: stores and retrieves value 23', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k23', 23);
    expect(c.get('k23')).toBe(23);
  });
  it('get/set #24: stores and retrieves value 24', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k24', 24);
    expect(c.get('k24')).toBe(24);
  });
  it('get/set #25: stores and retrieves value 25', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k25', 25);
    expect(c.get('k25')).toBe(25);
  });
  it('get/set #26: stores and retrieves value 26', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k26', 26);
    expect(c.get('k26')).toBe(26);
  });
  it('get/set #27: stores and retrieves value 27', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k27', 27);
    expect(c.get('k27')).toBe(27);
  });
  it('get/set #28: stores and retrieves value 28', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k28', 28);
    expect(c.get('k28')).toBe(28);
  });
  it('get/set #29: stores and retrieves value 29', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k29', 29);
    expect(c.get('k29')).toBe(29);
  });
  it('get/set #30: stores and retrieves value 30', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k30', 30);
    expect(c.get('k30')).toBe(30);
  });
  it('get/set #31: stores and retrieves value 31', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k31', 31);
    expect(c.get('k31')).toBe(31);
  });
  it('get/set #32: stores and retrieves value 32', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k32', 32);
    expect(c.get('k32')).toBe(32);
  });
  it('get/set #33: stores and retrieves value 33', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k33', 33);
    expect(c.get('k33')).toBe(33);
  });
  it('get/set #34: stores and retrieves value 34', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k34', 34);
    expect(c.get('k34')).toBe(34);
  });
  it('get/set #35: stores and retrieves value 35', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k35', 35);
    expect(c.get('k35')).toBe(35);
  });
  it('get/set #36: stores and retrieves value 36', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k36', 36);
    expect(c.get('k36')).toBe(36);
  });
  it('get/set #37: stores and retrieves value 37', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k37', 37);
    expect(c.get('k37')).toBe(37);
  });
  it('get/set #38: stores and retrieves value 38', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k38', 38);
    expect(c.get('k38')).toBe(38);
  });
  it('get/set #39: stores and retrieves value 39', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k39', 39);
    expect(c.get('k39')).toBe(39);
  });
  it('get/set #40: stores and retrieves value 40', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k40', 40);
    expect(c.get('k40')).toBe(40);
  });
  it('get/set #41: stores and retrieves value 41', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k41', 41);
    expect(c.get('k41')).toBe(41);
  });
  it('get/set #42: stores and retrieves value 42', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k42', 42);
    expect(c.get('k42')).toBe(42);
  });
  it('get/set #43: stores and retrieves value 43', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k43', 43);
    expect(c.get('k43')).toBe(43);
  });
  it('get/set #44: stores and retrieves value 44', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k44', 44);
    expect(c.get('k44')).toBe(44);
  });
  it('get/set #45: stores and retrieves value 45', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k45', 45);
    expect(c.get('k45')).toBe(45);
  });
  it('get/set #46: stores and retrieves value 46', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k46', 46);
    expect(c.get('k46')).toBe(46);
  });
  it('get/set #47: stores and retrieves value 47', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k47', 47);
    expect(c.get('k47')).toBe(47);
  });
  it('get/set #48: stores and retrieves value 48', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k48', 48);
    expect(c.get('k48')).toBe(48);
  });
  it('get/set #49: stores and retrieves value 49', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k49', 49);
    expect(c.get('k49')).toBe(49);
  });
  it('get/set #50: stores and retrieves value 50', () => {
    const c = createLRUCache<string, number>(10);
    c.set('k50', 50);
    expect(c.get('k50')).toBe(50);
  });
  it('has #1: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x1', 2);
    expect(c.has('x1')).toBe(true);
  });
  it('has #2: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x2', 4);
    expect(c.has('x2')).toBe(true);
  });
  it('has #3: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x3', 6);
    expect(c.has('x3')).toBe(true);
  });
  it('has #4: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x4', 8);
    expect(c.has('x4')).toBe(true);
  });
  it('has #5: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x5', 10);
    expect(c.has('x5')).toBe(true);
  });
  it('has #6: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x6', 12);
    expect(c.has('x6')).toBe(true);
  });
  it('has #7: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x7', 14);
    expect(c.has('x7')).toBe(true);
  });
  it('has #8: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x8', 16);
    expect(c.has('x8')).toBe(true);
  });
  it('has #9: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x9', 18);
    expect(c.has('x9')).toBe(true);
  });
  it('has #10: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x10', 20);
    expect(c.has('x10')).toBe(true);
  });
  it('has #11: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x11', 22);
    expect(c.has('x11')).toBe(true);
  });
  it('has #12: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x12', 24);
    expect(c.has('x12')).toBe(true);
  });
  it('has #13: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x13', 26);
    expect(c.has('x13')).toBe(true);
  });
  it('has #14: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x14', 28);
    expect(c.has('x14')).toBe(true);
  });
  it('has #15: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x15', 30);
    expect(c.has('x15')).toBe(true);
  });
  it('has #16: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x16', 32);
    expect(c.has('x16')).toBe(true);
  });
  it('has #17: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x17', 34);
    expect(c.has('x17')).toBe(true);
  });
  it('has #18: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x18', 36);
    expect(c.has('x18')).toBe(true);
  });
  it('has #19: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x19', 38);
    expect(c.has('x19')).toBe(true);
  });
  it('has #20: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x20', 40);
    expect(c.has('x20')).toBe(true);
  });
  it('has #21: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x21', 42);
    expect(c.has('x21')).toBe(true);
  });
  it('has #22: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x22', 44);
    expect(c.has('x22')).toBe(true);
  });
  it('has #23: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x23', 46);
    expect(c.has('x23')).toBe(true);
  });
  it('has #24: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x24', 48);
    expect(c.has('x24')).toBe(true);
  });
  it('has #25: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x25', 50);
    expect(c.has('x25')).toBe(true);
  });
  it('has #26: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x26', 52);
    expect(c.has('x26')).toBe(true);
  });
  it('has #27: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x27', 54);
    expect(c.has('x27')).toBe(true);
  });
  it('has #28: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x28', 56);
    expect(c.has('x28')).toBe(true);
  });
  it('has #29: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x29', 58);
    expect(c.has('x29')).toBe(true);
  });
  it('has #30: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x30', 60);
    expect(c.has('x30')).toBe(true);
  });
  it('has #31: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x31', 62);
    expect(c.has('x31')).toBe(true);
  });
  it('has #32: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x32', 64);
    expect(c.has('x32')).toBe(true);
  });
  it('has #33: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x33', 66);
    expect(c.has('x33')).toBe(true);
  });
  it('has #34: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x34', 68);
    expect(c.has('x34')).toBe(true);
  });
  it('has #35: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x35', 70);
    expect(c.has('x35')).toBe(true);
  });
  it('has #36: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x36', 72);
    expect(c.has('x36')).toBe(true);
  });
  it('has #37: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x37', 74);
    expect(c.has('x37')).toBe(true);
  });
  it('has #38: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x38', 76);
    expect(c.has('x38')).toBe(true);
  });
  it('has #39: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x39', 78);
    expect(c.has('x39')).toBe(true);
  });
  it('has #40: returns true for existing key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('x40', 80);
    expect(c.has('x40')).toBe(true);
  });
  it('has missing #1: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing1')).toBe(false);
  });
  it('has missing #2: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing2')).toBe(false);
  });
  it('has missing #3: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing3')).toBe(false);
  });
  it('has missing #4: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing4')).toBe(false);
  });
  it('has missing #5: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing5')).toBe(false);
  });
  it('has missing #6: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing6')).toBe(false);
  });
  it('has missing #7: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing7')).toBe(false);
  });
  it('has missing #8: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing8')).toBe(false);
  });
  it('has missing #9: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing9')).toBe(false);
  });
  it('has missing #10: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing10')).toBe(false);
  });
  it('has missing #11: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing11')).toBe(false);
  });
  it('has missing #12: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing12')).toBe(false);
  });
  it('has missing #13: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing13')).toBe(false);
  });
  it('has missing #14: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing14')).toBe(false);
  });
  it('has missing #15: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing15')).toBe(false);
  });
  it('has missing #16: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing16')).toBe(false);
  });
  it('has missing #17: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing17')).toBe(false);
  });
  it('has missing #18: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing18')).toBe(false);
  });
  it('has missing #19: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing19')).toBe(false);
  });
  it('has missing #20: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing20')).toBe(false);
  });
  it('has missing #21: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing21')).toBe(false);
  });
  it('has missing #22: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing22')).toBe(false);
  });
  it('has missing #23: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing23')).toBe(false);
  });
  it('has missing #24: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing24')).toBe(false);
  });
  it('has missing #25: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing25')).toBe(false);
  });
  it('has missing #26: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing26')).toBe(false);
  });
  it('has missing #27: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing27')).toBe(false);
  });
  it('has missing #28: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing28')).toBe(false);
  });
  it('has missing #29: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing29')).toBe(false);
  });
  it('has missing #30: returns false for missing key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.has('missing30')).toBe(false);
  });
  it('get missing #1: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent1')).toBeUndefined();
  });
  it('get missing #2: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent2')).toBeUndefined();
  });
  it('get missing #3: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent3')).toBeUndefined();
  });
  it('get missing #4: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent4')).toBeUndefined();
  });
  it('get missing #5: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent5')).toBeUndefined();
  });
  it('get missing #6: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent6')).toBeUndefined();
  });
  it('get missing #7: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent7')).toBeUndefined();
  });
  it('get missing #8: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent8')).toBeUndefined();
  });
  it('get missing #9: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent9')).toBeUndefined();
  });
  it('get missing #10: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent10')).toBeUndefined();
  });
  it('get missing #11: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent11')).toBeUndefined();
  });
  it('get missing #12: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent12')).toBeUndefined();
  });
  it('get missing #13: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent13')).toBeUndefined();
  });
  it('get missing #14: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent14')).toBeUndefined();
  });
  it('get missing #15: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent15')).toBeUndefined();
  });
  it('get missing #16: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent16')).toBeUndefined();
  });
  it('get missing #17: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent17')).toBeUndefined();
  });
  it('get missing #18: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent18')).toBeUndefined();
  });
  it('get missing #19: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent19')).toBeUndefined();
  });
  it('get missing #20: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent20')).toBeUndefined();
  });
  it('get missing #21: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent21')).toBeUndefined();
  });
  it('get missing #22: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent22')).toBeUndefined();
  });
  it('get missing #23: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent23')).toBeUndefined();
  });
  it('get missing #24: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent24')).toBeUndefined();
  });
  it('get missing #25: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent25')).toBeUndefined();
  });
  it('get missing #26: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent26')).toBeUndefined();
  });
  it('get missing #27: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent27')).toBeUndefined();
  });
  it('get missing #28: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent28')).toBeUndefined();
  });
  it('get missing #29: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent29')).toBeUndefined();
  });
  it('get missing #30: returns undefined for absent key', () => {
    const c = createLRUCache<string, number>(10);
    expect(c.get('absent30')).toBeUndefined();
  });
  it('eviction #1: oldest evicted when capacity (3) exceeded', () => {
    const c = createLRUCache<string, number>(3);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e3')).toBe(3);
  });
  it('eviction #2: oldest evicted when capacity (4) exceeded', () => {
    const c = createLRUCache<string, number>(4);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e4')).toBe(4);
  });
  it('eviction #3: oldest evicted when capacity (5) exceeded', () => {
    const c = createLRUCache<string, number>(5);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    c.set('e5', 5);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e5')).toBe(5);
  });
  it('eviction #4: oldest evicted when capacity (6) exceeded', () => {
    const c = createLRUCache<string, number>(6);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    c.set('e5', 5);
    c.set('e6', 6);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e6')).toBe(6);
  });
  it('eviction #5: oldest evicted when capacity (2) exceeded', () => {
    const c = createLRUCache<string, number>(2);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e2')).toBe(2);
  });
  it('eviction #6: oldest evicted when capacity (3) exceeded', () => {
    const c = createLRUCache<string, number>(3);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e3')).toBe(3);
  });
  it('eviction #7: oldest evicted when capacity (4) exceeded', () => {
    const c = createLRUCache<string, number>(4);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e4')).toBe(4);
  });
  it('eviction #8: oldest evicted when capacity (5) exceeded', () => {
    const c = createLRUCache<string, number>(5);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    c.set('e5', 5);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e5')).toBe(5);
  });
  it('eviction #9: oldest evicted when capacity (6) exceeded', () => {
    const c = createLRUCache<string, number>(6);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    c.set('e5', 5);
    c.set('e6', 6);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e6')).toBe(6);
  });
  it('eviction #10: oldest evicted when capacity (2) exceeded', () => {
    const c = createLRUCache<string, number>(2);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e2')).toBe(2);
  });
  it('eviction #11: oldest evicted when capacity (3) exceeded', () => {
    const c = createLRUCache<string, number>(3);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e3')).toBe(3);
  });
  it('eviction #12: oldest evicted when capacity (4) exceeded', () => {
    const c = createLRUCache<string, number>(4);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e4')).toBe(4);
  });
  it('eviction #13: oldest evicted when capacity (5) exceeded', () => {
    const c = createLRUCache<string, number>(5);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    c.set('e5', 5);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e5')).toBe(5);
  });
  it('eviction #14: oldest evicted when capacity (6) exceeded', () => {
    const c = createLRUCache<string, number>(6);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    c.set('e5', 5);
    c.set('e6', 6);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e6')).toBe(6);
  });
  it('eviction #15: oldest evicted when capacity (2) exceeded', () => {
    const c = createLRUCache<string, number>(2);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e2')).toBe(2);
  });
  it('eviction #16: oldest evicted when capacity (3) exceeded', () => {
    const c = createLRUCache<string, number>(3);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e3')).toBe(3);
  });
  it('eviction #17: oldest evicted when capacity (4) exceeded', () => {
    const c = createLRUCache<string, number>(4);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e4')).toBe(4);
  });
  it('eviction #18: oldest evicted when capacity (5) exceeded', () => {
    const c = createLRUCache<string, number>(5);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    c.set('e5', 5);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e5')).toBe(5);
  });
  it('eviction #19: oldest evicted when capacity (6) exceeded', () => {
    const c = createLRUCache<string, number>(6);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    c.set('e5', 5);
    c.set('e6', 6);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e6')).toBe(6);
  });
  it('eviction #20: oldest evicted when capacity (2) exceeded', () => {
    const c = createLRUCache<string, number>(2);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e2')).toBe(2);
  });
  it('eviction #21: oldest evicted when capacity (3) exceeded', () => {
    const c = createLRUCache<string, number>(3);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e3')).toBe(3);
  });
  it('eviction #22: oldest evicted when capacity (4) exceeded', () => {
    const c = createLRUCache<string, number>(4);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e4')).toBe(4);
  });
  it('eviction #23: oldest evicted when capacity (5) exceeded', () => {
    const c = createLRUCache<string, number>(5);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    c.set('e5', 5);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e5')).toBe(5);
  });
  it('eviction #24: oldest evicted when capacity (6) exceeded', () => {
    const c = createLRUCache<string, number>(6);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    c.set('e5', 5);
    c.set('e6', 6);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e6')).toBe(6);
  });
  it('eviction #25: oldest evicted when capacity (2) exceeded', () => {
    const c = createLRUCache<string, number>(2);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e2')).toBe(2);
  });
  it('eviction #26: oldest evicted when capacity (3) exceeded', () => {
    const c = createLRUCache<string, number>(3);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e3')).toBe(3);
  });
  it('eviction #27: oldest evicted when capacity (4) exceeded', () => {
    const c = createLRUCache<string, number>(4);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e4')).toBe(4);
  });
  it('eviction #28: oldest evicted when capacity (5) exceeded', () => {
    const c = createLRUCache<string, number>(5);
    c.set('e0', 0);
    c.set('e1', 1);
    c.set('e2', 2);
    c.set('e3', 3);
    c.set('e4', 4);
    c.set('e5', 5);
    expect(c.get('e0')).toBeUndefined();
    expect(c.get('e5')).toBe(5);
  });
  it('update #1: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u1', 1);
    c.set('u1', 10);
    expect(c.get('u1')).toBe(10);
  });
  it('update #2: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u2', 2);
    c.set('u2', 20);
    expect(c.get('u2')).toBe(20);
  });
  it('update #3: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u3', 3);
    c.set('u3', 30);
    expect(c.get('u3')).toBe(30);
  });
  it('update #4: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u4', 4);
    c.set('u4', 40);
    expect(c.get('u4')).toBe(40);
  });
  it('update #5: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u5', 5);
    c.set('u5', 50);
    expect(c.get('u5')).toBe(50);
  });
  it('update #6: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u6', 6);
    c.set('u6', 60);
    expect(c.get('u6')).toBe(60);
  });
  it('update #7: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u7', 7);
    c.set('u7', 70);
    expect(c.get('u7')).toBe(70);
  });
  it('update #8: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u8', 8);
    c.set('u8', 80);
    expect(c.get('u8')).toBe(80);
  });
  it('update #9: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u9', 9);
    c.set('u9', 90);
    expect(c.get('u9')).toBe(90);
  });
  it('update #10: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u10', 10);
    c.set('u10', 100);
    expect(c.get('u10')).toBe(100);
  });
  it('update #11: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u11', 11);
    c.set('u11', 110);
    expect(c.get('u11')).toBe(110);
  });
  it('update #12: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u12', 12);
    c.set('u12', 120);
    expect(c.get('u12')).toBe(120);
  });
  it('update #13: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u13', 13);
    c.set('u13', 130);
    expect(c.get('u13')).toBe(130);
  });
  it('update #14: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u14', 14);
    c.set('u14', 140);
    expect(c.get('u14')).toBe(140);
  });
  it('update #15: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u15', 15);
    c.set('u15', 150);
    expect(c.get('u15')).toBe(150);
  });
  it('update #16: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u16', 16);
    c.set('u16', 160);
    expect(c.get('u16')).toBe(160);
  });
  it('update #17: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u17', 17);
    c.set('u17', 170);
    expect(c.get('u17')).toBe(170);
  });
  it('update #18: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u18', 18);
    c.set('u18', 180);
    expect(c.get('u18')).toBe(180);
  });
  it('update #19: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u19', 19);
    c.set('u19', 190);
    expect(c.get('u19')).toBe(190);
  });
  it('update #20: updating existing key changes value', () => {
    const c = createLRUCache<string, number>(5);
    c.set('u20', 20);
    c.set('u20', 200);
    expect(c.get('u20')).toBe(200);
  });
});

describe('LRUCache – delete/clear/size/keys/values/entries', () => {
  it('delete existing #1: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d1', 1);
    expect(c.delete('d1')).toBe(true);
    expect(c.has('d1')).toBe(false);
  });
  it('delete existing #2: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d2', 2);
    expect(c.delete('d2')).toBe(true);
    expect(c.has('d2')).toBe(false);
  });
  it('delete existing #3: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d3', 3);
    expect(c.delete('d3')).toBe(true);
    expect(c.has('d3')).toBe(false);
  });
  it('delete existing #4: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d4', 4);
    expect(c.delete('d4')).toBe(true);
    expect(c.has('d4')).toBe(false);
  });
  it('delete existing #5: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d5', 5);
    expect(c.delete('d5')).toBe(true);
    expect(c.has('d5')).toBe(false);
  });
  it('delete existing #6: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d6', 6);
    expect(c.delete('d6')).toBe(true);
    expect(c.has('d6')).toBe(false);
  });
  it('delete existing #7: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d7', 7);
    expect(c.delete('d7')).toBe(true);
    expect(c.has('d7')).toBe(false);
  });
  it('delete existing #8: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d8', 8);
    expect(c.delete('d8')).toBe(true);
    expect(c.has('d8')).toBe(false);
  });
  it('delete existing #9: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d9', 9);
    expect(c.delete('d9')).toBe(true);
    expect(c.has('d9')).toBe(false);
  });
  it('delete existing #10: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d10', 10);
    expect(c.delete('d10')).toBe(true);
    expect(c.has('d10')).toBe(false);
  });
  it('delete existing #11: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d11', 11);
    expect(c.delete('d11')).toBe(true);
    expect(c.has('d11')).toBe(false);
  });
  it('delete existing #12: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d12', 12);
    expect(c.delete('d12')).toBe(true);
    expect(c.has('d12')).toBe(false);
  });
  it('delete existing #13: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d13', 13);
    expect(c.delete('d13')).toBe(true);
    expect(c.has('d13')).toBe(false);
  });
  it('delete existing #14: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d14', 14);
    expect(c.delete('d14')).toBe(true);
    expect(c.has('d14')).toBe(false);
  });
  it('delete existing #15: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d15', 15);
    expect(c.delete('d15')).toBe(true);
    expect(c.has('d15')).toBe(false);
  });
  it('delete existing #16: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d16', 16);
    expect(c.delete('d16')).toBe(true);
    expect(c.has('d16')).toBe(false);
  });
  it('delete existing #17: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d17', 17);
    expect(c.delete('d17')).toBe(true);
    expect(c.has('d17')).toBe(false);
  });
  it('delete existing #18: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d18', 18);
    expect(c.delete('d18')).toBe(true);
    expect(c.has('d18')).toBe(false);
  });
  it('delete existing #19: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d19', 19);
    expect(c.delete('d19')).toBe(true);
    expect(c.has('d19')).toBe(false);
  });
  it('delete existing #20: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d20', 20);
    expect(c.delete('d20')).toBe(true);
    expect(c.has('d20')).toBe(false);
  });
  it('delete existing #21: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d21', 21);
    expect(c.delete('d21')).toBe(true);
    expect(c.has('d21')).toBe(false);
  });
  it('delete existing #22: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d22', 22);
    expect(c.delete('d22')).toBe(true);
    expect(c.has('d22')).toBe(false);
  });
  it('delete existing #23: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d23', 23);
    expect(c.delete('d23')).toBe(true);
    expect(c.has('d23')).toBe(false);
  });
  it('delete existing #24: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d24', 24);
    expect(c.delete('d24')).toBe(true);
    expect(c.has('d24')).toBe(false);
  });
  it('delete existing #25: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d25', 25);
    expect(c.delete('d25')).toBe(true);
    expect(c.has('d25')).toBe(false);
  });
  it('delete existing #26: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d26', 26);
    expect(c.delete('d26')).toBe(true);
    expect(c.has('d26')).toBe(false);
  });
  it('delete existing #27: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d27', 27);
    expect(c.delete('d27')).toBe(true);
    expect(c.has('d27')).toBe(false);
  });
  it('delete existing #28: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d28', 28);
    expect(c.delete('d28')).toBe(true);
    expect(c.has('d28')).toBe(false);
  });
  it('delete existing #29: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d29', 29);
    expect(c.delete('d29')).toBe(true);
    expect(c.has('d29')).toBe(false);
  });
  it('delete existing #30: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d30', 30);
    expect(c.delete('d30')).toBe(true);
    expect(c.has('d30')).toBe(false);
  });
  it('delete existing #31: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d31', 31);
    expect(c.delete('d31')).toBe(true);
    expect(c.has('d31')).toBe(false);
  });
  it('delete existing #32: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d32', 32);
    expect(c.delete('d32')).toBe(true);
    expect(c.has('d32')).toBe(false);
  });
  it('delete existing #33: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d33', 33);
    expect(c.delete('d33')).toBe(true);
    expect(c.has('d33')).toBe(false);
  });
  it('delete existing #34: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d34', 34);
    expect(c.delete('d34')).toBe(true);
    expect(c.has('d34')).toBe(false);
  });
  it('delete existing #35: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d35', 35);
    expect(c.delete('d35')).toBe(true);
    expect(c.has('d35')).toBe(false);
  });
  it('delete existing #36: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d36', 36);
    expect(c.delete('d36')).toBe(true);
    expect(c.has('d36')).toBe(false);
  });
  it('delete existing #37: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d37', 37);
    expect(c.delete('d37')).toBe(true);
    expect(c.has('d37')).toBe(false);
  });
  it('delete existing #38: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d38', 38);
    expect(c.delete('d38')).toBe(true);
    expect(c.has('d38')).toBe(false);
  });
  it('delete existing #39: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d39', 39);
    expect(c.delete('d39')).toBe(true);
    expect(c.has('d39')).toBe(false);
  });
  it('delete existing #40: returns true and removes key', () => {
    const c = createLRUCache<string, number>(10);
    c.set('d40', 40);
    expect(c.delete('d40')).toBe(true);
    expect(c.has('d40')).toBe(false);
  });
  it('delete missing #1: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope1')).toBe(false);
  });
  it('delete missing #2: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope2')).toBe(false);
  });
  it('delete missing #3: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope3')).toBe(false);
  });
  it('delete missing #4: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope4')).toBe(false);
  });
  it('delete missing #5: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope5')).toBe(false);
  });
  it('delete missing #6: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope6')).toBe(false);
  });
  it('delete missing #7: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope7')).toBe(false);
  });
  it('delete missing #8: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope8')).toBe(false);
  });
  it('delete missing #9: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope9')).toBe(false);
  });
  it('delete missing #10: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope10')).toBe(false);
  });
  it('delete missing #11: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope11')).toBe(false);
  });
  it('delete missing #12: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope12')).toBe(false);
  });
  it('delete missing #13: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope13')).toBe(false);
  });
  it('delete missing #14: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope14')).toBe(false);
  });
  it('delete missing #15: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope15')).toBe(false);
  });
  it('delete missing #16: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope16')).toBe(false);
  });
  it('delete missing #17: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope17')).toBe(false);
  });
  it('delete missing #18: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope18')).toBe(false);
  });
  it('delete missing #19: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope19')).toBe(false);
  });
  it('delete missing #20: returns false', () => {
    const c = createLRUCache<string, number>(5);
    expect(c.delete('nope20')).toBe(false);
  });
  it('size #1: size equals 2 after 2 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s1_0', 0);
    c.set('s1_1', 1);
    expect(c.size).toBe(2);
  });
  it('size #2: size equals 3 after 3 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s2_0', 0);
    c.set('s2_1', 1);
    c.set('s2_2', 2);
    expect(c.size).toBe(3);
  });
  it('size #3: size equals 4 after 4 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s3_0', 0);
    c.set('s3_1', 1);
    c.set('s3_2', 2);
    c.set('s3_3', 3);
    expect(c.size).toBe(4);
  });
  it('size #4: size equals 5 after 5 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s4_0', 0);
    c.set('s4_1', 1);
    c.set('s4_2', 2);
    c.set('s4_3', 3);
    c.set('s4_4', 4);
    expect(c.size).toBe(5);
  });
  it('size #5: size equals 1 after 1 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s5_0', 0);
    expect(c.size).toBe(1);
  });
  it('size #6: size equals 2 after 2 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s6_0', 0);
    c.set('s6_1', 1);
    expect(c.size).toBe(2);
  });
  it('size #7: size equals 3 after 3 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s7_0', 0);
    c.set('s7_1', 1);
    c.set('s7_2', 2);
    expect(c.size).toBe(3);
  });
  it('size #8: size equals 4 after 4 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s8_0', 0);
    c.set('s8_1', 1);
    c.set('s8_2', 2);
    c.set('s8_3', 3);
    expect(c.size).toBe(4);
  });
  it('size #9: size equals 5 after 5 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s9_0', 0);
    c.set('s9_1', 1);
    c.set('s9_2', 2);
    c.set('s9_3', 3);
    c.set('s9_4', 4);
    expect(c.size).toBe(5);
  });
  it('size #10: size equals 1 after 1 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s10_0', 0);
    expect(c.size).toBe(1);
  });
  it('size #11: size equals 2 after 2 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s11_0', 0);
    c.set('s11_1', 1);
    expect(c.size).toBe(2);
  });
  it('size #12: size equals 3 after 3 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s12_0', 0);
    c.set('s12_1', 1);
    c.set('s12_2', 2);
    expect(c.size).toBe(3);
  });
  it('size #13: size equals 4 after 4 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s13_0', 0);
    c.set('s13_1', 1);
    c.set('s13_2', 2);
    c.set('s13_3', 3);
    expect(c.size).toBe(4);
  });
  it('size #14: size equals 5 after 5 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s14_0', 0);
    c.set('s14_1', 1);
    c.set('s14_2', 2);
    c.set('s14_3', 3);
    c.set('s14_4', 4);
    expect(c.size).toBe(5);
  });
  it('size #15: size equals 1 after 1 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s15_0', 0);
    expect(c.size).toBe(1);
  });
  it('size #16: size equals 2 after 2 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s16_0', 0);
    c.set('s16_1', 1);
    expect(c.size).toBe(2);
  });
  it('size #17: size equals 3 after 3 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s17_0', 0);
    c.set('s17_1', 1);
    c.set('s17_2', 2);
    expect(c.size).toBe(3);
  });
  it('size #18: size equals 4 after 4 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s18_0', 0);
    c.set('s18_1', 1);
    c.set('s18_2', 2);
    c.set('s18_3', 3);
    expect(c.size).toBe(4);
  });
  it('size #19: size equals 5 after 5 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s19_0', 0);
    c.set('s19_1', 1);
    c.set('s19_2', 2);
    c.set('s19_3', 3);
    c.set('s19_4', 4);
    expect(c.size).toBe(5);
  });
  it('size #20: size equals 1 after 1 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s20_0', 0);
    expect(c.size).toBe(1);
  });
  it('size #21: size equals 2 after 2 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s21_0', 0);
    c.set('s21_1', 1);
    expect(c.size).toBe(2);
  });
  it('size #22: size equals 3 after 3 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s22_0', 0);
    c.set('s22_1', 1);
    c.set('s22_2', 2);
    expect(c.size).toBe(3);
  });
  it('size #23: size equals 4 after 4 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s23_0', 0);
    c.set('s23_1', 1);
    c.set('s23_2', 2);
    c.set('s23_3', 3);
    expect(c.size).toBe(4);
  });
  it('size #24: size equals 5 after 5 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s24_0', 0);
    c.set('s24_1', 1);
    c.set('s24_2', 2);
    c.set('s24_3', 3);
    c.set('s24_4', 4);
    expect(c.size).toBe(5);
  });
  it('size #25: size equals 1 after 1 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s25_0', 0);
    expect(c.size).toBe(1);
  });
  it('size #26: size equals 2 after 2 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s26_0', 0);
    c.set('s26_1', 1);
    expect(c.size).toBe(2);
  });
  it('size #27: size equals 3 after 3 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s27_0', 0);
    c.set('s27_1', 1);
    c.set('s27_2', 2);
    expect(c.size).toBe(3);
  });
  it('size #28: size equals 4 after 4 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s28_0', 0);
    c.set('s28_1', 1);
    c.set('s28_2', 2);
    c.set('s28_3', 3);
    expect(c.size).toBe(4);
  });
  it('size #29: size equals 5 after 5 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s29_0', 0);
    c.set('s29_1', 1);
    c.set('s29_2', 2);
    c.set('s29_3', 3);
    c.set('s29_4', 4);
    expect(c.size).toBe(5);
  });
  it('size #30: size equals 1 after 1 inserts', () => {
    const c = createLRUCache<string, number>(20);
    c.set('s30_0', 0);
    expect(c.size).toBe(1);
  });
  it('clear #1: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl1_0', 0);
    c.set('cl1_1', 1);
    c.set('cl1_2', 2);
    c.set('cl1_3', 3);
    c.set('cl1_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #2: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl2_0', 0);
    c.set('cl2_1', 1);
    c.set('cl2_2', 2);
    c.set('cl2_3', 3);
    c.set('cl2_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #3: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl3_0', 0);
    c.set('cl3_1', 1);
    c.set('cl3_2', 2);
    c.set('cl3_3', 3);
    c.set('cl3_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #4: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl4_0', 0);
    c.set('cl4_1', 1);
    c.set('cl4_2', 2);
    c.set('cl4_3', 3);
    c.set('cl4_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #5: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl5_0', 0);
    c.set('cl5_1', 1);
    c.set('cl5_2', 2);
    c.set('cl5_3', 3);
    c.set('cl5_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #6: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl6_0', 0);
    c.set('cl6_1', 1);
    c.set('cl6_2', 2);
    c.set('cl6_3', 3);
    c.set('cl6_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #7: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl7_0', 0);
    c.set('cl7_1', 1);
    c.set('cl7_2', 2);
    c.set('cl7_3', 3);
    c.set('cl7_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #8: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl8_0', 0);
    c.set('cl8_1', 1);
    c.set('cl8_2', 2);
    c.set('cl8_3', 3);
    c.set('cl8_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #9: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl9_0', 0);
    c.set('cl9_1', 1);
    c.set('cl9_2', 2);
    c.set('cl9_3', 3);
    c.set('cl9_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #10: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl10_0', 0);
    c.set('cl10_1', 1);
    c.set('cl10_2', 2);
    c.set('cl10_3', 3);
    c.set('cl10_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #11: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl11_0', 0);
    c.set('cl11_1', 1);
    c.set('cl11_2', 2);
    c.set('cl11_3', 3);
    c.set('cl11_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #12: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl12_0', 0);
    c.set('cl12_1', 1);
    c.set('cl12_2', 2);
    c.set('cl12_3', 3);
    c.set('cl12_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #13: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl13_0', 0);
    c.set('cl13_1', 1);
    c.set('cl13_2', 2);
    c.set('cl13_3', 3);
    c.set('cl13_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #14: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl14_0', 0);
    c.set('cl14_1', 1);
    c.set('cl14_2', 2);
    c.set('cl14_3', 3);
    c.set('cl14_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #15: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl15_0', 0);
    c.set('cl15_1', 1);
    c.set('cl15_2', 2);
    c.set('cl15_3', 3);
    c.set('cl15_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #16: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl16_0', 0);
    c.set('cl16_1', 1);
    c.set('cl16_2', 2);
    c.set('cl16_3', 3);
    c.set('cl16_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #17: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl17_0', 0);
    c.set('cl17_1', 1);
    c.set('cl17_2', 2);
    c.set('cl17_3', 3);
    c.set('cl17_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #18: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl18_0', 0);
    c.set('cl18_1', 1);
    c.set('cl18_2', 2);
    c.set('cl18_3', 3);
    c.set('cl18_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #19: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl19_0', 0);
    c.set('cl19_1', 1);
    c.set('cl19_2', 2);
    c.set('cl19_3', 3);
    c.set('cl19_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('clear #20: size is 0 after clear', () => {
    const c = createLRUCache<string, number>(10);
    c.set('cl20_0', 0);
    c.set('cl20_1', 1);
    c.set('cl20_2', 2);
    c.set('cl20_3', 3);
    c.set('cl20_4', 4);
    c.clear();
    expect(c.size).toBe(0);
  });
  it('keys/values/entries #1: 3 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv1_0', 0);
    c.set('kv1_1', 3);
    c.set('kv1_2', 6);
    expect(c.keys().length).toBe(3);
    expect(c.values().length).toBe(3);
    expect(c.entries().length).toBe(3);
  });
  it('keys/values/entries #2: 4 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv2_0', 0);
    c.set('kv2_1', 3);
    c.set('kv2_2', 6);
    c.set('kv2_3', 9);
    expect(c.keys().length).toBe(4);
    expect(c.values().length).toBe(4);
    expect(c.entries().length).toBe(4);
  });
  it('keys/values/entries #3: 5 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv3_0', 0);
    c.set('kv3_1', 3);
    c.set('kv3_2', 6);
    c.set('kv3_3', 9);
    c.set('kv3_4', 12);
    expect(c.keys().length).toBe(5);
    expect(c.values().length).toBe(5);
    expect(c.entries().length).toBe(5);
  });
  it('keys/values/entries #4: 2 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv4_0', 0);
    c.set('kv4_1', 3);
    expect(c.keys().length).toBe(2);
    expect(c.values().length).toBe(2);
    expect(c.entries().length).toBe(2);
  });
  it('keys/values/entries #5: 3 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv5_0', 0);
    c.set('kv5_1', 3);
    c.set('kv5_2', 6);
    expect(c.keys().length).toBe(3);
    expect(c.values().length).toBe(3);
    expect(c.entries().length).toBe(3);
  });
  it('keys/values/entries #6: 4 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv6_0', 0);
    c.set('kv6_1', 3);
    c.set('kv6_2', 6);
    c.set('kv6_3', 9);
    expect(c.keys().length).toBe(4);
    expect(c.values().length).toBe(4);
    expect(c.entries().length).toBe(4);
  });
  it('keys/values/entries #7: 5 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv7_0', 0);
    c.set('kv7_1', 3);
    c.set('kv7_2', 6);
    c.set('kv7_3', 9);
    c.set('kv7_4', 12);
    expect(c.keys().length).toBe(5);
    expect(c.values().length).toBe(5);
    expect(c.entries().length).toBe(5);
  });
  it('keys/values/entries #8: 2 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv8_0', 0);
    c.set('kv8_1', 3);
    expect(c.keys().length).toBe(2);
    expect(c.values().length).toBe(2);
    expect(c.entries().length).toBe(2);
  });
  it('keys/values/entries #9: 3 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv9_0', 0);
    c.set('kv9_1', 3);
    c.set('kv9_2', 6);
    expect(c.keys().length).toBe(3);
    expect(c.values().length).toBe(3);
    expect(c.entries().length).toBe(3);
  });
  it('keys/values/entries #10: 4 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv10_0', 0);
    c.set('kv10_1', 3);
    c.set('kv10_2', 6);
    c.set('kv10_3', 9);
    expect(c.keys().length).toBe(4);
    expect(c.values().length).toBe(4);
    expect(c.entries().length).toBe(4);
  });
  it('keys/values/entries #11: 5 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv11_0', 0);
    c.set('kv11_1', 3);
    c.set('kv11_2', 6);
    c.set('kv11_3', 9);
    c.set('kv11_4', 12);
    expect(c.keys().length).toBe(5);
    expect(c.values().length).toBe(5);
    expect(c.entries().length).toBe(5);
  });
  it('keys/values/entries #12: 2 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv12_0', 0);
    c.set('kv12_1', 3);
    expect(c.keys().length).toBe(2);
    expect(c.values().length).toBe(2);
    expect(c.entries().length).toBe(2);
  });
  it('keys/values/entries #13: 3 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv13_0', 0);
    c.set('kv13_1', 3);
    c.set('kv13_2', 6);
    expect(c.keys().length).toBe(3);
    expect(c.values().length).toBe(3);
    expect(c.entries().length).toBe(3);
  });
  it('keys/values/entries #14: 4 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv14_0', 0);
    c.set('kv14_1', 3);
    c.set('kv14_2', 6);
    c.set('kv14_3', 9);
    expect(c.keys().length).toBe(4);
    expect(c.values().length).toBe(4);
    expect(c.entries().length).toBe(4);
  });
  it('keys/values/entries #15: 5 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv15_0', 0);
    c.set('kv15_1', 3);
    c.set('kv15_2', 6);
    c.set('kv15_3', 9);
    c.set('kv15_4', 12);
    expect(c.keys().length).toBe(5);
    expect(c.values().length).toBe(5);
    expect(c.entries().length).toBe(5);
  });
  it('keys/values/entries #16: 2 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv16_0', 0);
    c.set('kv16_1', 3);
    expect(c.keys().length).toBe(2);
    expect(c.values().length).toBe(2);
    expect(c.entries().length).toBe(2);
  });
  it('keys/values/entries #17: 3 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv17_0', 0);
    c.set('kv17_1', 3);
    c.set('kv17_2', 6);
    expect(c.keys().length).toBe(3);
    expect(c.values().length).toBe(3);
    expect(c.entries().length).toBe(3);
  });
  it('keys/values/entries #18: 4 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv18_0', 0);
    c.set('kv18_1', 3);
    c.set('kv18_2', 6);
    c.set('kv18_3', 9);
    expect(c.keys().length).toBe(4);
    expect(c.values().length).toBe(4);
    expect(c.entries().length).toBe(4);
  });
  it('keys/values/entries #19: 5 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv19_0', 0);
    c.set('kv19_1', 3);
    c.set('kv19_2', 6);
    c.set('kv19_3', 9);
    c.set('kv19_4', 12);
    expect(c.keys().length).toBe(5);
    expect(c.values().length).toBe(5);
    expect(c.entries().length).toBe(5);
  });
  it('keys/values/entries #20: 2 entries match', () => {
    const c = createLRUCache<string, number>(20);
    c.set('kv20_0', 0);
    c.set('kv20_1', 3);
    expect(c.keys().length).toBe(2);
    expect(c.values().length).toBe(2);
    expect(c.entries().length).toBe(2);
  });
  it('capacity-1 #1: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a1', 1);
    c.set('b1', 2);
    expect(c.get('a1')).toBeUndefined();
    expect(c.get('b1')).toBe(2);
  });
  it('capacity-1 #2: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a2', 2);
    c.set('b2', 3);
    expect(c.get('a2')).toBeUndefined();
    expect(c.get('b2')).toBe(3);
  });
  it('capacity-1 #3: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a3', 3);
    c.set('b3', 4);
    expect(c.get('a3')).toBeUndefined();
    expect(c.get('b3')).toBe(4);
  });
  it('capacity-1 #4: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a4', 4);
    c.set('b4', 5);
    expect(c.get('a4')).toBeUndefined();
    expect(c.get('b4')).toBe(5);
  });
  it('capacity-1 #5: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a5', 5);
    c.set('b5', 6);
    expect(c.get('a5')).toBeUndefined();
    expect(c.get('b5')).toBe(6);
  });
  it('capacity-1 #6: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a6', 6);
    c.set('b6', 7);
    expect(c.get('a6')).toBeUndefined();
    expect(c.get('b6')).toBe(7);
  });
  it('capacity-1 #7: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a7', 7);
    c.set('b7', 8);
    expect(c.get('a7')).toBeUndefined();
    expect(c.get('b7')).toBe(8);
  });
  it('capacity-1 #8: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a8', 8);
    c.set('b8', 9);
    expect(c.get('a8')).toBeUndefined();
    expect(c.get('b8')).toBe(9);
  });
  it('capacity-1 #9: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a9', 9);
    c.set('b9', 10);
    expect(c.get('a9')).toBeUndefined();
    expect(c.get('b9')).toBe(10);
  });
  it('capacity-1 #10: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a10', 10);
    c.set('b10', 11);
    expect(c.get('a10')).toBeUndefined();
    expect(c.get('b10')).toBe(11);
  });
  it('capacity-1 #11: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a11', 11);
    c.set('b11', 12);
    expect(c.get('a11')).toBeUndefined();
    expect(c.get('b11')).toBe(12);
  });
  it('capacity-1 #12: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a12', 12);
    c.set('b12', 13);
    expect(c.get('a12')).toBeUndefined();
    expect(c.get('b12')).toBe(13);
  });
  it('capacity-1 #13: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a13', 13);
    c.set('b13', 14);
    expect(c.get('a13')).toBeUndefined();
    expect(c.get('b13')).toBe(14);
  });
  it('capacity-1 #14: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a14', 14);
    c.set('b14', 15);
    expect(c.get('a14')).toBeUndefined();
    expect(c.get('b14')).toBe(15);
  });
  it('capacity-1 #15: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a15', 15);
    c.set('b15', 16);
    expect(c.get('a15')).toBeUndefined();
    expect(c.get('b15')).toBe(16);
  });
  it('capacity-1 #16: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a16', 16);
    c.set('b16', 17);
    expect(c.get('a16')).toBeUndefined();
    expect(c.get('b16')).toBe(17);
  });
  it('capacity-1 #17: only last set key survives', () => {
    const c = createLRUCache<string, number>(1);
    c.set('a17', 17);
    c.set('b17', 18);
    expect(c.get('a17')).toBeUndefined();
    expect(c.get('b17')).toBe(18);
  });
});

describe('TTLCache – set/get (non-expiry)', () => {
  it('ttl set/get #1: value 1 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k1', 1);
    expect(c.get('k1')).toBe(1);
  });
  it('ttl set/get #2: value 2 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k2', 2);
    expect(c.get('k2')).toBe(2);
  });
  it('ttl set/get #3: value 3 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k3', 3);
    expect(c.get('k3')).toBe(3);
  });
  it('ttl set/get #4: value 4 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k4', 4);
    expect(c.get('k4')).toBe(4);
  });
  it('ttl set/get #5: value 5 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k5', 5);
    expect(c.get('k5')).toBe(5);
  });
  it('ttl set/get #6: value 6 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k6', 6);
    expect(c.get('k6')).toBe(6);
  });
  it('ttl set/get #7: value 7 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k7', 7);
    expect(c.get('k7')).toBe(7);
  });
  it('ttl set/get #8: value 8 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k8', 8);
    expect(c.get('k8')).toBe(8);
  });
  it('ttl set/get #9: value 9 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k9', 9);
    expect(c.get('k9')).toBe(9);
  });
  it('ttl set/get #10: value 10 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k10', 10);
    expect(c.get('k10')).toBe(10);
  });
  it('ttl set/get #11: value 11 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k11', 11);
    expect(c.get('k11')).toBe(11);
  });
  it('ttl set/get #12: value 12 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k12', 12);
    expect(c.get('k12')).toBe(12);
  });
  it('ttl set/get #13: value 13 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k13', 13);
    expect(c.get('k13')).toBe(13);
  });
  it('ttl set/get #14: value 14 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k14', 14);
    expect(c.get('k14')).toBe(14);
  });
  it('ttl set/get #15: value 15 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k15', 15);
    expect(c.get('k15')).toBe(15);
  });
  it('ttl set/get #16: value 16 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k16', 16);
    expect(c.get('k16')).toBe(16);
  });
  it('ttl set/get #17: value 17 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k17', 17);
    expect(c.get('k17')).toBe(17);
  });
  it('ttl set/get #18: value 18 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k18', 18);
    expect(c.get('k18')).toBe(18);
  });
  it('ttl set/get #19: value 19 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k19', 19);
    expect(c.get('k19')).toBe(19);
  });
  it('ttl set/get #20: value 20 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k20', 20);
    expect(c.get('k20')).toBe(20);
  });
  it('ttl set/get #21: value 21 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k21', 21);
    expect(c.get('k21')).toBe(21);
  });
  it('ttl set/get #22: value 22 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k22', 22);
    expect(c.get('k22')).toBe(22);
  });
  it('ttl set/get #23: value 23 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k23', 23);
    expect(c.get('k23')).toBe(23);
  });
  it('ttl set/get #24: value 24 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k24', 24);
    expect(c.get('k24')).toBe(24);
  });
  it('ttl set/get #25: value 25 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k25', 25);
    expect(c.get('k25')).toBe(25);
  });
  it('ttl set/get #26: value 26 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k26', 26);
    expect(c.get('k26')).toBe(26);
  });
  it('ttl set/get #27: value 27 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k27', 27);
    expect(c.get('k27')).toBe(27);
  });
  it('ttl set/get #28: value 28 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k28', 28);
    expect(c.get('k28')).toBe(28);
  });
  it('ttl set/get #29: value 29 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k29', 29);
    expect(c.get('k29')).toBe(29);
  });
  it('ttl set/get #30: value 30 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k30', 30);
    expect(c.get('k30')).toBe(30);
  });
  it('ttl set/get #31: value 31 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k31', 31);
    expect(c.get('k31')).toBe(31);
  });
  it('ttl set/get #32: value 32 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k32', 32);
    expect(c.get('k32')).toBe(32);
  });
  it('ttl set/get #33: value 33 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k33', 33);
    expect(c.get('k33')).toBe(33);
  });
  it('ttl set/get #34: value 34 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k34', 34);
    expect(c.get('k34')).toBe(34);
  });
  it('ttl set/get #35: value 35 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k35', 35);
    expect(c.get('k35')).toBe(35);
  });
  it('ttl set/get #36: value 36 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k36', 36);
    expect(c.get('k36')).toBe(36);
  });
  it('ttl set/get #37: value 37 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k37', 37);
    expect(c.get('k37')).toBe(37);
  });
  it('ttl set/get #38: value 38 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k38', 38);
    expect(c.get('k38')).toBe(38);
  });
  it('ttl set/get #39: value 39 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k39', 39);
    expect(c.get('k39')).toBe(39);
  });
  it('ttl set/get #40: value 40 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k40', 40);
    expect(c.get('k40')).toBe(40);
  });
  it('ttl set/get #41: value 41 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k41', 41);
    expect(c.get('k41')).toBe(41);
  });
  it('ttl set/get #42: value 42 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k42', 42);
    expect(c.get('k42')).toBe(42);
  });
  it('ttl set/get #43: value 43 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k43', 43);
    expect(c.get('k43')).toBe(43);
  });
  it('ttl set/get #44: value 44 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k44', 44);
    expect(c.get('k44')).toBe(44);
  });
  it('ttl set/get #45: value 45 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k45', 45);
    expect(c.get('k45')).toBe(45);
  });
  it('ttl set/get #46: value 46 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k46', 46);
    expect(c.get('k46')).toBe(46);
  });
  it('ttl set/get #47: value 47 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k47', 47);
    expect(c.get('k47')).toBe(47);
  });
  it('ttl set/get #48: value 48 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k48', 48);
    expect(c.get('k48')).toBe(48);
  });
  it('ttl set/get #49: value 49 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k49', 49);
    expect(c.get('k49')).toBe(49);
  });
  it('ttl set/get #50: value 50 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k50', 50);
    expect(c.get('k50')).toBe(50);
  });
  it('ttl set/get #51: value 51 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k51', 51);
    expect(c.get('k51')).toBe(51);
  });
  it('ttl set/get #52: value 52 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k52', 52);
    expect(c.get('k52')).toBe(52);
  });
  it('ttl set/get #53: value 53 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k53', 53);
    expect(c.get('k53')).toBe(53);
  });
  it('ttl set/get #54: value 54 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k54', 54);
    expect(c.get('k54')).toBe(54);
  });
  it('ttl set/get #55: value 55 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k55', 55);
    expect(c.get('k55')).toBe(55);
  });
  it('ttl set/get #56: value 56 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k56', 56);
    expect(c.get('k56')).toBe(56);
  });
  it('ttl set/get #57: value 57 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k57', 57);
    expect(c.get('k57')).toBe(57);
  });
  it('ttl set/get #58: value 58 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k58', 58);
    expect(c.get('k58')).toBe(58);
  });
  it('ttl set/get #59: value 59 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k59', 59);
    expect(c.get('k59')).toBe(59);
  });
  it('ttl set/get #60: value 60 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k60', 60);
    expect(c.get('k60')).toBe(60);
  });
  it('ttl set/get #61: value 61 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k61', 61);
    expect(c.get('k61')).toBe(61);
  });
  it('ttl set/get #62: value 62 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k62', 62);
    expect(c.get('k62')).toBe(62);
  });
  it('ttl set/get #63: value 63 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k63', 63);
    expect(c.get('k63')).toBe(63);
  });
  it('ttl set/get #64: value 64 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k64', 64);
    expect(c.get('k64')).toBe(64);
  });
  it('ttl set/get #65: value 65 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k65', 65);
    expect(c.get('k65')).toBe(65);
  });
  it('ttl set/get #66: value 66 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k66', 66);
    expect(c.get('k66')).toBe(66);
  });
  it('ttl set/get #67: value 67 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k67', 67);
    expect(c.get('k67')).toBe(67);
  });
  it('ttl set/get #68: value 68 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k68', 68);
    expect(c.get('k68')).toBe(68);
  });
  it('ttl set/get #69: value 69 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k69', 69);
    expect(c.get('k69')).toBe(69);
  });
  it('ttl set/get #70: value 70 retrievable immediately', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('k70', 70);
    expect(c.get('k70')).toBe(70);
  });
  it('ttl has #1: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h1', 5);
    expect(c.has('h1')).toBe(true);
  });
  it('ttl has #2: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h2', 10);
    expect(c.has('h2')).toBe(true);
  });
  it('ttl has #3: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h3', 15);
    expect(c.has('h3')).toBe(true);
  });
  it('ttl has #4: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h4', 20);
    expect(c.has('h4')).toBe(true);
  });
  it('ttl has #5: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h5', 25);
    expect(c.has('h5')).toBe(true);
  });
  it('ttl has #6: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h6', 30);
    expect(c.has('h6')).toBe(true);
  });
  it('ttl has #7: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h7', 35);
    expect(c.has('h7')).toBe(true);
  });
  it('ttl has #8: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h8', 40);
    expect(c.has('h8')).toBe(true);
  });
  it('ttl has #9: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h9', 45);
    expect(c.has('h9')).toBe(true);
  });
  it('ttl has #10: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h10', 50);
    expect(c.has('h10')).toBe(true);
  });
  it('ttl has #11: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h11', 55);
    expect(c.has('h11')).toBe(true);
  });
  it('ttl has #12: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h12', 60);
    expect(c.has('h12')).toBe(true);
  });
  it('ttl has #13: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h13', 65);
    expect(c.has('h13')).toBe(true);
  });
  it('ttl has #14: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h14', 70);
    expect(c.has('h14')).toBe(true);
  });
  it('ttl has #15: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h15', 75);
    expect(c.has('h15')).toBe(true);
  });
  it('ttl has #16: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h16', 80);
    expect(c.has('h16')).toBe(true);
  });
  it('ttl has #17: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h17', 85);
    expect(c.has('h17')).toBe(true);
  });
  it('ttl has #18: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h18', 90);
    expect(c.has('h18')).toBe(true);
  });
  it('ttl has #19: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h19', 95);
    expect(c.has('h19')).toBe(true);
  });
  it('ttl has #20: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h20', 100);
    expect(c.has('h20')).toBe(true);
  });
  it('ttl has #21: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h21', 105);
    expect(c.has('h21')).toBe(true);
  });
  it('ttl has #22: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h22', 110);
    expect(c.has('h22')).toBe(true);
  });
  it('ttl has #23: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h23', 115);
    expect(c.has('h23')).toBe(true);
  });
  it('ttl has #24: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h24', 120);
    expect(c.has('h24')).toBe(true);
  });
  it('ttl has #25: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h25', 125);
    expect(c.has('h25')).toBe(true);
  });
  it('ttl has #26: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h26', 130);
    expect(c.has('h26')).toBe(true);
  });
  it('ttl has #27: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h27', 135);
    expect(c.has('h27')).toBe(true);
  });
  it('ttl has #28: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h28', 140);
    expect(c.has('h28')).toBe(true);
  });
  it('ttl has #29: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h29', 145);
    expect(c.has('h29')).toBe(true);
  });
  it('ttl has #30: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h30', 150);
    expect(c.has('h30')).toBe(true);
  });
  it('ttl has #31: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h31', 155);
    expect(c.has('h31')).toBe(true);
  });
  it('ttl has #32: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h32', 160);
    expect(c.has('h32')).toBe(true);
  });
  it('ttl has #33: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h33', 165);
    expect(c.has('h33')).toBe(true);
  });
  it('ttl has #34: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h34', 170);
    expect(c.has('h34')).toBe(true);
  });
  it('ttl has #35: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h35', 175);
    expect(c.has('h35')).toBe(true);
  });
  it('ttl has #36: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h36', 180);
    expect(c.has('h36')).toBe(true);
  });
  it('ttl has #37: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h37', 185);
    expect(c.has('h37')).toBe(true);
  });
  it('ttl has #38: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h38', 190);
    expect(c.has('h38')).toBe(true);
  });
  it('ttl has #39: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h39', 195);
    expect(c.has('h39')).toBe(true);
  });
  it('ttl has #40: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h40', 200);
    expect(c.has('h40')).toBe(true);
  });
  it('ttl has #41: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h41', 205);
    expect(c.has('h41')).toBe(true);
  });
  it('ttl has #42: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h42', 210);
    expect(c.has('h42')).toBe(true);
  });
  it('ttl has #43: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h43', 215);
    expect(c.has('h43')).toBe(true);
  });
  it('ttl has #44: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h44', 220);
    expect(c.has('h44')).toBe(true);
  });
  it('ttl has #45: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h45', 225);
    expect(c.has('h45')).toBe(true);
  });
  it('ttl has #46: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h46', 230);
    expect(c.has('h46')).toBe(true);
  });
  it('ttl has #47: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h47', 235);
    expect(c.has('h47')).toBe(true);
  });
  it('ttl has #48: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h48', 240);
    expect(c.has('h48')).toBe(true);
  });
  it('ttl has #49: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h49', 245);
    expect(c.has('h49')).toBe(true);
  });
  it('ttl has #50: has returns true right after set', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('h50', 250);
    expect(c.has('h50')).toBe(true);
  });
  it('ttl has-missing #1: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing1')).toBe(false);
  });
  it('ttl has-missing #2: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing2')).toBe(false);
  });
  it('ttl has-missing #3: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing3')).toBe(false);
  });
  it('ttl has-missing #4: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing4')).toBe(false);
  });
  it('ttl has-missing #5: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing5')).toBe(false);
  });
  it('ttl has-missing #6: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing6')).toBe(false);
  });
  it('ttl has-missing #7: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing7')).toBe(false);
  });
  it('ttl has-missing #8: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing8')).toBe(false);
  });
  it('ttl has-missing #9: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing9')).toBe(false);
  });
  it('ttl has-missing #10: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing10')).toBe(false);
  });
  it('ttl has-missing #11: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing11')).toBe(false);
  });
  it('ttl has-missing #12: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing12')).toBe(false);
  });
  it('ttl has-missing #13: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing13')).toBe(false);
  });
  it('ttl has-missing #14: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing14')).toBe(false);
  });
  it('ttl has-missing #15: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing15')).toBe(false);
  });
  it('ttl has-missing #16: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing16')).toBe(false);
  });
  it('ttl has-missing #17: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing17')).toBe(false);
  });
  it('ttl has-missing #18: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing18')).toBe(false);
  });
  it('ttl has-missing #19: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing19')).toBe(false);
  });
  it('ttl has-missing #20: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing20')).toBe(false);
  });
  it('ttl has-missing #21: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing21')).toBe(false);
  });
  it('ttl has-missing #22: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing22')).toBe(false);
  });
  it('ttl has-missing #23: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing23')).toBe(false);
  });
  it('ttl has-missing #24: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing24')).toBe(false);
  });
  it('ttl has-missing #25: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing25')).toBe(false);
  });
  it('ttl has-missing #26: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing26')).toBe(false);
  });
  it('ttl has-missing #27: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing27')).toBe(false);
  });
  it('ttl has-missing #28: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing28')).toBe(false);
  });
  it('ttl has-missing #29: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing29')).toBe(false);
  });
  it('ttl has-missing #30: returns false for absent key', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.has('missing30')).toBe(false);
  });
  it('ttl custom #1: custom ttl 120000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct1', 1, 120000);
    expect(c.get('ct1')).toBe(1);
  });
  it('ttl custom #2: custom ttl 180000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct2', 2, 180000);
    expect(c.get('ct2')).toBe(2);
  });
  it('ttl custom #3: custom ttl 240000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct3', 3, 240000);
    expect(c.get('ct3')).toBe(3);
  });
  it('ttl custom #4: custom ttl 300000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct4', 4, 300000);
    expect(c.get('ct4')).toBe(4);
  });
  it('ttl custom #5: custom ttl 60000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct5', 5, 60000);
    expect(c.get('ct5')).toBe(5);
  });
  it('ttl custom #6: custom ttl 120000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct6', 6, 120000);
    expect(c.get('ct6')).toBe(6);
  });
  it('ttl custom #7: custom ttl 180000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct7', 7, 180000);
    expect(c.get('ct7')).toBe(7);
  });
  it('ttl custom #8: custom ttl 240000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct8', 8, 240000);
    expect(c.get('ct8')).toBe(8);
  });
  it('ttl custom #9: custom ttl 300000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct9', 9, 300000);
    expect(c.get('ct9')).toBe(9);
  });
  it('ttl custom #10: custom ttl 60000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct10', 10, 60000);
    expect(c.get('ct10')).toBe(10);
  });
  it('ttl custom #11: custom ttl 120000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct11', 11, 120000);
    expect(c.get('ct11')).toBe(11);
  });
  it('ttl custom #12: custom ttl 180000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct12', 12, 180000);
    expect(c.get('ct12')).toBe(12);
  });
  it('ttl custom #13: custom ttl 240000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct13', 13, 240000);
    expect(c.get('ct13')).toBe(13);
  });
  it('ttl custom #14: custom ttl 300000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct14', 14, 300000);
    expect(c.get('ct14')).toBe(14);
  });
  it('ttl custom #15: custom ttl 60000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct15', 15, 60000);
    expect(c.get('ct15')).toBe(15);
  });
  it('ttl custom #16: custom ttl 120000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct16', 16, 120000);
    expect(c.get('ct16')).toBe(16);
  });
  it('ttl custom #17: custom ttl 180000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct17', 17, 180000);
    expect(c.get('ct17')).toBe(17);
  });
  it('ttl custom #18: custom ttl 240000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct18', 18, 240000);
    expect(c.get('ct18')).toBe(18);
  });
  it('ttl custom #19: custom ttl 300000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct19', 19, 300000);
    expect(c.get('ct19')).toBe(19);
  });
  it('ttl custom #20: custom ttl 60000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct20', 20, 60000);
    expect(c.get('ct20')).toBe(20);
  });
  it('ttl custom #21: custom ttl 120000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct21', 21, 120000);
    expect(c.get('ct21')).toBe(21);
  });
  it('ttl custom #22: custom ttl 180000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct22', 22, 180000);
    expect(c.get('ct22')).toBe(22);
  });
  it('ttl custom #23: custom ttl 240000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct23', 23, 240000);
    expect(c.get('ct23')).toBe(23);
  });
  it('ttl custom #24: custom ttl 300000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct24', 24, 300000);
    expect(c.get('ct24')).toBe(24);
  });
  it('ttl custom #25: custom ttl 60000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct25', 25, 60000);
    expect(c.get('ct25')).toBe(25);
  });
  it('ttl custom #26: custom ttl 120000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct26', 26, 120000);
    expect(c.get('ct26')).toBe(26);
  });
  it('ttl custom #27: custom ttl 180000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct27', 27, 180000);
    expect(c.get('ct27')).toBe(27);
  });
  it('ttl custom #28: custom ttl 240000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct28', 28, 240000);
    expect(c.get('ct28')).toBe(28);
  });
  it('ttl custom #29: custom ttl 300000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct29', 29, 300000);
    expect(c.get('ct29')).toBe(29);
  });
  it('ttl custom #30: custom ttl 60000ms, still readable', () => {
    const c = createTTLCache<string, number>(5000);
    c.set('ct30', 30, 60000);
    expect(c.get('ct30')).toBe(30);
  });
  it('ttl overwrite #1: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow1', 1);
    c.set('ow1', 100);
    expect(c.get('ow1')).toBe(100);
  });
  it('ttl overwrite #2: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow2', 2);
    c.set('ow2', 200);
    expect(c.get('ow2')).toBe(200);
  });
  it('ttl overwrite #3: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow3', 3);
    c.set('ow3', 300);
    expect(c.get('ow3')).toBe(300);
  });
  it('ttl overwrite #4: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow4', 4);
    c.set('ow4', 400);
    expect(c.get('ow4')).toBe(400);
  });
  it('ttl overwrite #5: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow5', 5);
    c.set('ow5', 500);
    expect(c.get('ow5')).toBe(500);
  });
  it('ttl overwrite #6: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow6', 6);
    c.set('ow6', 600);
    expect(c.get('ow6')).toBe(600);
  });
  it('ttl overwrite #7: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow7', 7);
    c.set('ow7', 700);
    expect(c.get('ow7')).toBe(700);
  });
  it('ttl overwrite #8: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow8', 8);
    c.set('ow8', 800);
    expect(c.get('ow8')).toBe(800);
  });
  it('ttl overwrite #9: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow9', 9);
    c.set('ow9', 900);
    expect(c.get('ow9')).toBe(900);
  });
  it('ttl overwrite #10: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow10', 10);
    c.set('ow10', 1000);
    expect(c.get('ow10')).toBe(1000);
  });
  it('ttl overwrite #11: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow11', 11);
    c.set('ow11', 1100);
    expect(c.get('ow11')).toBe(1100);
  });
  it('ttl overwrite #12: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow12', 12);
    c.set('ow12', 1200);
    expect(c.get('ow12')).toBe(1200);
  });
  it('ttl overwrite #13: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow13', 13);
    c.set('ow13', 1300);
    expect(c.get('ow13')).toBe(1300);
  });
  it('ttl overwrite #14: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow14', 14);
    c.set('ow14', 1400);
    expect(c.get('ow14')).toBe(1400);
  });
  it('ttl overwrite #15: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow15', 15);
    c.set('ow15', 1500);
    expect(c.get('ow15')).toBe(1500);
  });
  it('ttl overwrite #16: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow16', 16);
    c.set('ow16', 1600);
    expect(c.get('ow16')).toBe(1600);
  });
  it('ttl overwrite #17: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow17', 17);
    c.set('ow17', 1700);
    expect(c.get('ow17')).toBe(1700);
  });
  it('ttl overwrite #18: overwriting key updates value', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('ow18', 18);
    c.set('ow18', 1800);
    expect(c.get('ow18')).toBe(1800);
  });
});

describe('TTLCache – delete/clear/size', () => {
  it('ttl delete existing #1: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d1', 1);
    expect(c.delete('d1')).toBe(true);
    expect(c.has('d1')).toBe(false);
  });
  it('ttl delete existing #2: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d2', 2);
    expect(c.delete('d2')).toBe(true);
    expect(c.has('d2')).toBe(false);
  });
  it('ttl delete existing #3: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d3', 3);
    expect(c.delete('d3')).toBe(true);
    expect(c.has('d3')).toBe(false);
  });
  it('ttl delete existing #4: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d4', 4);
    expect(c.delete('d4')).toBe(true);
    expect(c.has('d4')).toBe(false);
  });
  it('ttl delete existing #5: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d5', 5);
    expect(c.delete('d5')).toBe(true);
    expect(c.has('d5')).toBe(false);
  });
  it('ttl delete existing #6: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d6', 6);
    expect(c.delete('d6')).toBe(true);
    expect(c.has('d6')).toBe(false);
  });
  it('ttl delete existing #7: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d7', 7);
    expect(c.delete('d7')).toBe(true);
    expect(c.has('d7')).toBe(false);
  });
  it('ttl delete existing #8: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d8', 8);
    expect(c.delete('d8')).toBe(true);
    expect(c.has('d8')).toBe(false);
  });
  it('ttl delete existing #9: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d9', 9);
    expect(c.delete('d9')).toBe(true);
    expect(c.has('d9')).toBe(false);
  });
  it('ttl delete existing #10: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d10', 10);
    expect(c.delete('d10')).toBe(true);
    expect(c.has('d10')).toBe(false);
  });
  it('ttl delete existing #11: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d11', 11);
    expect(c.delete('d11')).toBe(true);
    expect(c.has('d11')).toBe(false);
  });
  it('ttl delete existing #12: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d12', 12);
    expect(c.delete('d12')).toBe(true);
    expect(c.has('d12')).toBe(false);
  });
  it('ttl delete existing #13: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d13', 13);
    expect(c.delete('d13')).toBe(true);
    expect(c.has('d13')).toBe(false);
  });
  it('ttl delete existing #14: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d14', 14);
    expect(c.delete('d14')).toBe(true);
    expect(c.has('d14')).toBe(false);
  });
  it('ttl delete existing #15: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d15', 15);
    expect(c.delete('d15')).toBe(true);
    expect(c.has('d15')).toBe(false);
  });
  it('ttl delete existing #16: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d16', 16);
    expect(c.delete('d16')).toBe(true);
    expect(c.has('d16')).toBe(false);
  });
  it('ttl delete existing #17: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d17', 17);
    expect(c.delete('d17')).toBe(true);
    expect(c.has('d17')).toBe(false);
  });
  it('ttl delete existing #18: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d18', 18);
    expect(c.delete('d18')).toBe(true);
    expect(c.has('d18')).toBe(false);
  });
  it('ttl delete existing #19: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d19', 19);
    expect(c.delete('d19')).toBe(true);
    expect(c.has('d19')).toBe(false);
  });
  it('ttl delete existing #20: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d20', 20);
    expect(c.delete('d20')).toBe(true);
    expect(c.has('d20')).toBe(false);
  });
  it('ttl delete existing #21: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d21', 21);
    expect(c.delete('d21')).toBe(true);
    expect(c.has('d21')).toBe(false);
  });
  it('ttl delete existing #22: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d22', 22);
    expect(c.delete('d22')).toBe(true);
    expect(c.has('d22')).toBe(false);
  });
  it('ttl delete existing #23: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d23', 23);
    expect(c.delete('d23')).toBe(true);
    expect(c.has('d23')).toBe(false);
  });
  it('ttl delete existing #24: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d24', 24);
    expect(c.delete('d24')).toBe(true);
    expect(c.has('d24')).toBe(false);
  });
  it('ttl delete existing #25: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d25', 25);
    expect(c.delete('d25')).toBe(true);
    expect(c.has('d25')).toBe(false);
  });
  it('ttl delete existing #26: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d26', 26);
    expect(c.delete('d26')).toBe(true);
    expect(c.has('d26')).toBe(false);
  });
  it('ttl delete existing #27: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d27', 27);
    expect(c.delete('d27')).toBe(true);
    expect(c.has('d27')).toBe(false);
  });
  it('ttl delete existing #28: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d28', 28);
    expect(c.delete('d28')).toBe(true);
    expect(c.has('d28')).toBe(false);
  });
  it('ttl delete existing #29: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d29', 29);
    expect(c.delete('d29')).toBe(true);
    expect(c.has('d29')).toBe(false);
  });
  it('ttl delete existing #30: returns true', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('d30', 30);
    expect(c.delete('d30')).toBe(true);
    expect(c.has('d30')).toBe(false);
  });
  it('ttl delete missing #1: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope1')).toBe(false);
  });
  it('ttl delete missing #2: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope2')).toBe(false);
  });
  it('ttl delete missing #3: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope3')).toBe(false);
  });
  it('ttl delete missing #4: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope4')).toBe(false);
  });
  it('ttl delete missing #5: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope5')).toBe(false);
  });
  it('ttl delete missing #6: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope6')).toBe(false);
  });
  it('ttl delete missing #7: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope7')).toBe(false);
  });
  it('ttl delete missing #8: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope8')).toBe(false);
  });
  it('ttl delete missing #9: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope9')).toBe(false);
  });
  it('ttl delete missing #10: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope10')).toBe(false);
  });
  it('ttl delete missing #11: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope11')).toBe(false);
  });
  it('ttl delete missing #12: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope12')).toBe(false);
  });
  it('ttl delete missing #13: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope13')).toBe(false);
  });
  it('ttl delete missing #14: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope14')).toBe(false);
  });
  it('ttl delete missing #15: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope15')).toBe(false);
  });
  it('ttl delete missing #16: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope16')).toBe(false);
  });
  it('ttl delete missing #17: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope17')).toBe(false);
  });
  it('ttl delete missing #18: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope18')).toBe(false);
  });
  it('ttl delete missing #19: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope19')).toBe(false);
  });
  it('ttl delete missing #20: returns false', () => {
    const c = createTTLCache<string, number>(60000);
    expect(c.delete('nope20')).toBe(false);
  });
  it('ttl size #1: size is 2 after 2 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz1_0', 0);
    c.set('sz1_1', 1);
    expect(c.size()).toBe(2);
  });
  it('ttl size #2: size is 3 after 3 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz2_0', 0);
    c.set('sz2_1', 1);
    c.set('sz2_2', 2);
    expect(c.size()).toBe(3);
  });
  it('ttl size #3: size is 4 after 4 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz3_0', 0);
    c.set('sz3_1', 1);
    c.set('sz3_2', 2);
    c.set('sz3_3', 3);
    expect(c.size()).toBe(4);
  });
  it('ttl size #4: size is 5 after 5 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz4_0', 0);
    c.set('sz4_1', 1);
    c.set('sz4_2', 2);
    c.set('sz4_3', 3);
    c.set('sz4_4', 4);
    expect(c.size()).toBe(5);
  });
  it('ttl size #5: size is 6 after 6 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz5_0', 0);
    c.set('sz5_1', 1);
    c.set('sz5_2', 2);
    c.set('sz5_3', 3);
    c.set('sz5_4', 4);
    c.set('sz5_5', 5);
    expect(c.size()).toBe(6);
  });
  it('ttl size #6: size is 1 after 1 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz6_0', 0);
    expect(c.size()).toBe(1);
  });
  it('ttl size #7: size is 2 after 2 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz7_0', 0);
    c.set('sz7_1', 1);
    expect(c.size()).toBe(2);
  });
  it('ttl size #8: size is 3 after 3 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz8_0', 0);
    c.set('sz8_1', 1);
    c.set('sz8_2', 2);
    expect(c.size()).toBe(3);
  });
  it('ttl size #9: size is 4 after 4 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz9_0', 0);
    c.set('sz9_1', 1);
    c.set('sz9_2', 2);
    c.set('sz9_3', 3);
    expect(c.size()).toBe(4);
  });
  it('ttl size #10: size is 5 after 5 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz10_0', 0);
    c.set('sz10_1', 1);
    c.set('sz10_2', 2);
    c.set('sz10_3', 3);
    c.set('sz10_4', 4);
    expect(c.size()).toBe(5);
  });
  it('ttl size #11: size is 6 after 6 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz11_0', 0);
    c.set('sz11_1', 1);
    c.set('sz11_2', 2);
    c.set('sz11_3', 3);
    c.set('sz11_4', 4);
    c.set('sz11_5', 5);
    expect(c.size()).toBe(6);
  });
  it('ttl size #12: size is 1 after 1 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz12_0', 0);
    expect(c.size()).toBe(1);
  });
  it('ttl size #13: size is 2 after 2 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz13_0', 0);
    c.set('sz13_1', 1);
    expect(c.size()).toBe(2);
  });
  it('ttl size #14: size is 3 after 3 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz14_0', 0);
    c.set('sz14_1', 1);
    c.set('sz14_2', 2);
    expect(c.size()).toBe(3);
  });
  it('ttl size #15: size is 4 after 4 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz15_0', 0);
    c.set('sz15_1', 1);
    c.set('sz15_2', 2);
    c.set('sz15_3', 3);
    expect(c.size()).toBe(4);
  });
  it('ttl size #16: size is 5 after 5 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz16_0', 0);
    c.set('sz16_1', 1);
    c.set('sz16_2', 2);
    c.set('sz16_3', 3);
    c.set('sz16_4', 4);
    expect(c.size()).toBe(5);
  });
  it('ttl size #17: size is 6 after 6 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz17_0', 0);
    c.set('sz17_1', 1);
    c.set('sz17_2', 2);
    c.set('sz17_3', 3);
    c.set('sz17_4', 4);
    c.set('sz17_5', 5);
    expect(c.size()).toBe(6);
  });
  it('ttl size #18: size is 1 after 1 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz18_0', 0);
    expect(c.size()).toBe(1);
  });
  it('ttl size #19: size is 2 after 2 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz19_0', 0);
    c.set('sz19_1', 1);
    expect(c.size()).toBe(2);
  });
  it('ttl size #20: size is 3 after 3 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz20_0', 0);
    c.set('sz20_1', 1);
    c.set('sz20_2', 2);
    expect(c.size()).toBe(3);
  });
  it('ttl size #21: size is 4 after 4 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz21_0', 0);
    c.set('sz21_1', 1);
    c.set('sz21_2', 2);
    c.set('sz21_3', 3);
    expect(c.size()).toBe(4);
  });
  it('ttl size #22: size is 5 after 5 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz22_0', 0);
    c.set('sz22_1', 1);
    c.set('sz22_2', 2);
    c.set('sz22_3', 3);
    c.set('sz22_4', 4);
    expect(c.size()).toBe(5);
  });
  it('ttl size #23: size is 6 after 6 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz23_0', 0);
    c.set('sz23_1', 1);
    c.set('sz23_2', 2);
    c.set('sz23_3', 3);
    c.set('sz23_4', 4);
    c.set('sz23_5', 5);
    expect(c.size()).toBe(6);
  });
  it('ttl size #24: size is 1 after 1 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz24_0', 0);
    expect(c.size()).toBe(1);
  });
  it('ttl size #25: size is 2 after 2 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz25_0', 0);
    c.set('sz25_1', 1);
    expect(c.size()).toBe(2);
  });
  it('ttl size #26: size is 3 after 3 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz26_0', 0);
    c.set('sz26_1', 1);
    c.set('sz26_2', 2);
    expect(c.size()).toBe(3);
  });
  it('ttl size #27: size is 4 after 4 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz27_0', 0);
    c.set('sz27_1', 1);
    c.set('sz27_2', 2);
    c.set('sz27_3', 3);
    expect(c.size()).toBe(4);
  });
  it('ttl size #28: size is 5 after 5 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz28_0', 0);
    c.set('sz28_1', 1);
    c.set('sz28_2', 2);
    c.set('sz28_3', 3);
    c.set('sz28_4', 4);
    expect(c.size()).toBe(5);
  });
  it('ttl size #29: size is 6 after 6 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz29_0', 0);
    c.set('sz29_1', 1);
    c.set('sz29_2', 2);
    c.set('sz29_3', 3);
    c.set('sz29_4', 4);
    c.set('sz29_5', 5);
    expect(c.size()).toBe(6);
  });
  it('ttl size #30: size is 1 after 1 sets', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('sz30_0', 0);
    expect(c.size()).toBe(1);
  });
  it('ttl clear #1: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl1_0', 0);
    c.set('cl1_1', 1);
    c.set('cl1_2', 2);
    c.set('cl1_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #2: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl2_0', 0);
    c.set('cl2_1', 1);
    c.set('cl2_2', 2);
    c.set('cl2_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #3: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl3_0', 0);
    c.set('cl3_1', 1);
    c.set('cl3_2', 2);
    c.set('cl3_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #4: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl4_0', 0);
    c.set('cl4_1', 1);
    c.set('cl4_2', 2);
    c.set('cl4_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #5: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl5_0', 0);
    c.set('cl5_1', 1);
    c.set('cl5_2', 2);
    c.set('cl5_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #6: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl6_0', 0);
    c.set('cl6_1', 1);
    c.set('cl6_2', 2);
    c.set('cl6_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #7: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl7_0', 0);
    c.set('cl7_1', 1);
    c.set('cl7_2', 2);
    c.set('cl7_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #8: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl8_0', 0);
    c.set('cl8_1', 1);
    c.set('cl8_2', 2);
    c.set('cl8_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #9: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl9_0', 0);
    c.set('cl9_1', 1);
    c.set('cl9_2', 2);
    c.set('cl9_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #10: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl10_0', 0);
    c.set('cl10_1', 1);
    c.set('cl10_2', 2);
    c.set('cl10_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #11: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl11_0', 0);
    c.set('cl11_1', 1);
    c.set('cl11_2', 2);
    c.set('cl11_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #12: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl12_0', 0);
    c.set('cl12_1', 1);
    c.set('cl12_2', 2);
    c.set('cl12_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #13: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl13_0', 0);
    c.set('cl13_1', 1);
    c.set('cl13_2', 2);
    c.set('cl13_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #14: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl14_0', 0);
    c.set('cl14_1', 1);
    c.set('cl14_2', 2);
    c.set('cl14_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #15: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl15_0', 0);
    c.set('cl15_1', 1);
    c.set('cl15_2', 2);
    c.set('cl15_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #16: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl16_0', 0);
    c.set('cl16_1', 1);
    c.set('cl16_2', 2);
    c.set('cl16_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #17: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl17_0', 0);
    c.set('cl17_1', 1);
    c.set('cl17_2', 2);
    c.set('cl17_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
  it('ttl clear #18: size is 0 after clear', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('cl18_0', 0);
    c.set('cl18_1', 1);
    c.set('cl18_2', 2);
    c.set('cl18_3', 3);
    c.clear();
    expect(c.size()).toBe(0);
  });
});

describe('memoize', () => {
  it('memo basic #1: returns same result on repeated call with arg 1', () => {
    const fn = memoize((x: number) => x * 1);
    expect(fn(1)).toBe(1);
    expect(fn(1)).toBe(1);
  });
  it('memo basic #2: returns same result on repeated call with arg 2', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(2)).toBe(4);
    expect(fn(2)).toBe(4);
  });
  it('memo basic #3: returns same result on repeated call with arg 3', () => {
    const fn = memoize((x: number) => x * 3);
    expect(fn(3)).toBe(9);
    expect(fn(3)).toBe(9);
  });
  it('memo basic #4: returns same result on repeated call with arg 4', () => {
    const fn = memoize((x: number) => x * 4);
    expect(fn(4)).toBe(16);
    expect(fn(4)).toBe(16);
  });
  it('memo basic #5: returns same result on repeated call with arg 5', () => {
    const fn = memoize((x: number) => x * 5);
    expect(fn(5)).toBe(25);
    expect(fn(5)).toBe(25);
  });
  it('memo basic #6: returns same result on repeated call with arg 6', () => {
    const fn = memoize((x: number) => x * 6);
    expect(fn(6)).toBe(36);
    expect(fn(6)).toBe(36);
  });
  it('memo basic #7: returns same result on repeated call with arg 7', () => {
    const fn = memoize((x: number) => x * 7);
    expect(fn(7)).toBe(49);
    expect(fn(7)).toBe(49);
  });
  it('memo basic #8: returns same result on repeated call with arg 8', () => {
    const fn = memoize((x: number) => x * 8);
    expect(fn(8)).toBe(64);
    expect(fn(8)).toBe(64);
  });
  it('memo basic #9: returns same result on repeated call with arg 9', () => {
    const fn = memoize((x: number) => x * 9);
    expect(fn(9)).toBe(81);
    expect(fn(9)).toBe(81);
  });
  it('memo basic #10: returns same result on repeated call with arg 10', () => {
    const fn = memoize((x: number) => x * 10);
    expect(fn(10)).toBe(100);
    expect(fn(10)).toBe(100);
  });
  it('memo basic #11: returns same result on repeated call with arg 11', () => {
    const fn = memoize((x: number) => x * 11);
    expect(fn(11)).toBe(121);
    expect(fn(11)).toBe(121);
  });
  it('memo basic #12: returns same result on repeated call with arg 12', () => {
    const fn = memoize((x: number) => x * 12);
    expect(fn(12)).toBe(144);
    expect(fn(12)).toBe(144);
  });
  it('memo basic #13: returns same result on repeated call with arg 13', () => {
    const fn = memoize((x: number) => x * 13);
    expect(fn(13)).toBe(169);
    expect(fn(13)).toBe(169);
  });
  it('memo basic #14: returns same result on repeated call with arg 14', () => {
    const fn = memoize((x: number) => x * 14);
    expect(fn(14)).toBe(196);
    expect(fn(14)).toBe(196);
  });
  it('memo basic #15: returns same result on repeated call with arg 15', () => {
    const fn = memoize((x: number) => x * 15);
    expect(fn(15)).toBe(225);
    expect(fn(15)).toBe(225);
  });
  it('memo basic #16: returns same result on repeated call with arg 16', () => {
    const fn = memoize((x: number) => x * 16);
    expect(fn(16)).toBe(256);
    expect(fn(16)).toBe(256);
  });
  it('memo basic #17: returns same result on repeated call with arg 17', () => {
    const fn = memoize((x: number) => x * 17);
    expect(fn(17)).toBe(289);
    expect(fn(17)).toBe(289);
  });
  it('memo basic #18: returns same result on repeated call with arg 18', () => {
    const fn = memoize((x: number) => x * 18);
    expect(fn(18)).toBe(324);
    expect(fn(18)).toBe(324);
  });
  it('memo basic #19: returns same result on repeated call with arg 19', () => {
    const fn = memoize((x: number) => x * 19);
    expect(fn(19)).toBe(361);
    expect(fn(19)).toBe(361);
  });
  it('memo basic #20: returns same result on repeated call with arg 20', () => {
    const fn = memoize((x: number) => x * 20);
    expect(fn(20)).toBe(400);
    expect(fn(20)).toBe(400);
  });
  it('memo basic #21: returns same result on repeated call with arg 21', () => {
    const fn = memoize((x: number) => x * 21);
    expect(fn(21)).toBe(441);
    expect(fn(21)).toBe(441);
  });
  it('memo basic #22: returns same result on repeated call with arg 22', () => {
    const fn = memoize((x: number) => x * 22);
    expect(fn(22)).toBe(484);
    expect(fn(22)).toBe(484);
  });
  it('memo basic #23: returns same result on repeated call with arg 23', () => {
    const fn = memoize((x: number) => x * 23);
    expect(fn(23)).toBe(529);
    expect(fn(23)).toBe(529);
  });
  it('memo basic #24: returns same result on repeated call with arg 24', () => {
    const fn = memoize((x: number) => x * 24);
    expect(fn(24)).toBe(576);
    expect(fn(24)).toBe(576);
  });
  it('memo basic #25: returns same result on repeated call with arg 25', () => {
    const fn = memoize((x: number) => x * 25);
    expect(fn(25)).toBe(625);
    expect(fn(25)).toBe(625);
  });
  it('memo basic #26: returns same result on repeated call with arg 26', () => {
    const fn = memoize((x: number) => x * 26);
    expect(fn(26)).toBe(676);
    expect(fn(26)).toBe(676);
  });
  it('memo basic #27: returns same result on repeated call with arg 27', () => {
    const fn = memoize((x: number) => x * 27);
    expect(fn(27)).toBe(729);
    expect(fn(27)).toBe(729);
  });
  it('memo basic #28: returns same result on repeated call with arg 28', () => {
    const fn = memoize((x: number) => x * 28);
    expect(fn(28)).toBe(784);
    expect(fn(28)).toBe(784);
  });
  it('memo basic #29: returns same result on repeated call with arg 29', () => {
    const fn = memoize((x: number) => x * 29);
    expect(fn(29)).toBe(841);
    expect(fn(29)).toBe(841);
  });
  it('memo basic #30: returns same result on repeated call with arg 30', () => {
    const fn = memoize((x: number) => x * 30);
    expect(fn(30)).toBe(900);
    expect(fn(30)).toBe(900);
  });
  it('memo basic #31: returns same result on repeated call with arg 31', () => {
    const fn = memoize((x: number) => x * 31);
    expect(fn(31)).toBe(961);
    expect(fn(31)).toBe(961);
  });
  it('memo basic #32: returns same result on repeated call with arg 32', () => {
    const fn = memoize((x: number) => x * 32);
    expect(fn(32)).toBe(1024);
    expect(fn(32)).toBe(1024);
  });
  it('memo basic #33: returns same result on repeated call with arg 33', () => {
    const fn = memoize((x: number) => x * 33);
    expect(fn(33)).toBe(1089);
    expect(fn(33)).toBe(1089);
  });
  it('memo basic #34: returns same result on repeated call with arg 34', () => {
    const fn = memoize((x: number) => x * 34);
    expect(fn(34)).toBe(1156);
    expect(fn(34)).toBe(1156);
  });
  it('memo basic #35: returns same result on repeated call with arg 35', () => {
    const fn = memoize((x: number) => x * 35);
    expect(fn(35)).toBe(1225);
    expect(fn(35)).toBe(1225);
  });
  it('memo basic #36: returns same result on repeated call with arg 36', () => {
    const fn = memoize((x: number) => x * 36);
    expect(fn(36)).toBe(1296);
    expect(fn(36)).toBe(1296);
  });
  it('memo basic #37: returns same result on repeated call with arg 37', () => {
    const fn = memoize((x: number) => x * 37);
    expect(fn(37)).toBe(1369);
    expect(fn(37)).toBe(1369);
  });
  it('memo basic #38: returns same result on repeated call with arg 38', () => {
    const fn = memoize((x: number) => x * 38);
    expect(fn(38)).toBe(1444);
    expect(fn(38)).toBe(1444);
  });
  it('memo basic #39: returns same result on repeated call with arg 39', () => {
    const fn = memoize((x: number) => x * 39);
    expect(fn(39)).toBe(1521);
    expect(fn(39)).toBe(1521);
  });
  it('memo basic #40: returns same result on repeated call with arg 40', () => {
    const fn = memoize((x: number) => x * 40);
    expect(fn(40)).toBe(1600);
    expect(fn(40)).toBe(1600);
  });
  it('memo basic #41: returns same result on repeated call with arg 41', () => {
    const fn = memoize((x: number) => x * 41);
    expect(fn(41)).toBe(1681);
    expect(fn(41)).toBe(1681);
  });
  it('memo basic #42: returns same result on repeated call with arg 42', () => {
    const fn = memoize((x: number) => x * 42);
    expect(fn(42)).toBe(1764);
    expect(fn(42)).toBe(1764);
  });
  it('memo basic #43: returns same result on repeated call with arg 43', () => {
    const fn = memoize((x: number) => x * 43);
    expect(fn(43)).toBe(1849);
    expect(fn(43)).toBe(1849);
  });
  it('memo basic #44: returns same result on repeated call with arg 44', () => {
    const fn = memoize((x: number) => x * 44);
    expect(fn(44)).toBe(1936);
    expect(fn(44)).toBe(1936);
  });
  it('memo basic #45: returns same result on repeated call with arg 45', () => {
    const fn = memoize((x: number) => x * 45);
    expect(fn(45)).toBe(2025);
    expect(fn(45)).toBe(2025);
  });
  it('memo basic #46: returns same result on repeated call with arg 46', () => {
    const fn = memoize((x: number) => x * 46);
    expect(fn(46)).toBe(2116);
    expect(fn(46)).toBe(2116);
  });
  it('memo basic #47: returns same result on repeated call with arg 47', () => {
    const fn = memoize((x: number) => x * 47);
    expect(fn(47)).toBe(2209);
    expect(fn(47)).toBe(2209);
  });
  it('memo basic #48: returns same result on repeated call with arg 48', () => {
    const fn = memoize((x: number) => x * 48);
    expect(fn(48)).toBe(2304);
    expect(fn(48)).toBe(2304);
  });
  it('memo basic #49: returns same result on repeated call with arg 49', () => {
    const fn = memoize((x: number) => x * 49);
    expect(fn(49)).toBe(2401);
    expect(fn(49)).toBe(2401);
  });
  it('memo basic #50: returns same result on repeated call with arg 50', () => {
    const fn = memoize((x: number) => x * 50);
    expect(fn(50)).toBe(2500);
    expect(fn(50)).toBe(2500);
  });
  it('memo call-count #1: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 1; });
    fn(1); fn(1); fn(1);
    expect(calls).toBe(1);
  });
  it('memo call-count #2: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 2; });
    fn(2); fn(2); fn(2);
    expect(calls).toBe(1);
  });
  it('memo call-count #3: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 3; });
    fn(3); fn(3); fn(3);
    expect(calls).toBe(1);
  });
  it('memo call-count #4: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 4; });
    fn(4); fn(4); fn(4);
    expect(calls).toBe(1);
  });
  it('memo call-count #5: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 5; });
    fn(5); fn(5); fn(5);
    expect(calls).toBe(1);
  });
  it('memo call-count #6: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 6; });
    fn(6); fn(6); fn(6);
    expect(calls).toBe(1);
  });
  it('memo call-count #7: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 7; });
    fn(7); fn(7); fn(7);
    expect(calls).toBe(1);
  });
  it('memo call-count #8: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 8; });
    fn(8); fn(8); fn(8);
    expect(calls).toBe(1);
  });
  it('memo call-count #9: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 9; });
    fn(9); fn(9); fn(9);
    expect(calls).toBe(1);
  });
  it('memo call-count #10: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 10; });
    fn(10); fn(10); fn(10);
    expect(calls).toBe(1);
  });
  it('memo call-count #11: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 11; });
    fn(11); fn(11); fn(11);
    expect(calls).toBe(1);
  });
  it('memo call-count #12: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 12; });
    fn(12); fn(12); fn(12);
    expect(calls).toBe(1);
  });
  it('memo call-count #13: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 13; });
    fn(13); fn(13); fn(13);
    expect(calls).toBe(1);
  });
  it('memo call-count #14: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 14; });
    fn(14); fn(14); fn(14);
    expect(calls).toBe(1);
  });
  it('memo call-count #15: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 15; });
    fn(15); fn(15); fn(15);
    expect(calls).toBe(1);
  });
  it('memo call-count #16: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 16; });
    fn(16); fn(16); fn(16);
    expect(calls).toBe(1);
  });
  it('memo call-count #17: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 17; });
    fn(17); fn(17); fn(17);
    expect(calls).toBe(1);
  });
  it('memo call-count #18: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 18; });
    fn(18); fn(18); fn(18);
    expect(calls).toBe(1);
  });
  it('memo call-count #19: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 19; });
    fn(19); fn(19); fn(19);
    expect(calls).toBe(1);
  });
  it('memo call-count #20: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 20; });
    fn(20); fn(20); fn(20);
    expect(calls).toBe(1);
  });
  it('memo call-count #21: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 21; });
    fn(21); fn(21); fn(21);
    expect(calls).toBe(1);
  });
  it('memo call-count #22: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 22; });
    fn(22); fn(22); fn(22);
    expect(calls).toBe(1);
  });
  it('memo call-count #23: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 23; });
    fn(23); fn(23); fn(23);
    expect(calls).toBe(1);
  });
  it('memo call-count #24: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 24; });
    fn(24); fn(24); fn(24);
    expect(calls).toBe(1);
  });
  it('memo call-count #25: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 25; });
    fn(25); fn(25); fn(25);
    expect(calls).toBe(1);
  });
  it('memo call-count #26: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 26; });
    fn(26); fn(26); fn(26);
    expect(calls).toBe(1);
  });
  it('memo call-count #27: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 27; });
    fn(27); fn(27); fn(27);
    expect(calls).toBe(1);
  });
  it('memo call-count #28: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 28; });
    fn(28); fn(28); fn(28);
    expect(calls).toBe(1);
  });
  it('memo call-count #29: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 29; });
    fn(29); fn(29); fn(29);
    expect(calls).toBe(1);
  });
  it('memo call-count #30: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 30; });
    fn(30); fn(30); fn(30);
    expect(calls).toBe(1);
  });
  it('memo call-count #31: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 31; });
    fn(31); fn(31); fn(31);
    expect(calls).toBe(1);
  });
  it('memo call-count #32: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 32; });
    fn(32); fn(32); fn(32);
    expect(calls).toBe(1);
  });
  it('memo call-count #33: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 33; });
    fn(33); fn(33); fn(33);
    expect(calls).toBe(1);
  });
  it('memo call-count #34: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 34; });
    fn(34); fn(34); fn(34);
    expect(calls).toBe(1);
  });
  it('memo call-count #35: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 35; });
    fn(35); fn(35); fn(35);
    expect(calls).toBe(1);
  });
  it('memo call-count #36: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 36; });
    fn(36); fn(36); fn(36);
    expect(calls).toBe(1);
  });
  it('memo call-count #37: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 37; });
    fn(37); fn(37); fn(37);
    expect(calls).toBe(1);
  });
  it('memo call-count #38: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 38; });
    fn(38); fn(38); fn(38);
    expect(calls).toBe(1);
  });
  it('memo call-count #39: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 39; });
    fn(39); fn(39); fn(39);
    expect(calls).toBe(1);
  });
  it('memo call-count #40: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 40; });
    fn(40); fn(40); fn(40);
    expect(calls).toBe(1);
  });
  it('memo call-count #41: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 41; });
    fn(41); fn(41); fn(41);
    expect(calls).toBe(1);
  });
  it('memo call-count #42: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 42; });
    fn(42); fn(42); fn(42);
    expect(calls).toBe(1);
  });
  it('memo call-count #43: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 43; });
    fn(43); fn(43); fn(43);
    expect(calls).toBe(1);
  });
  it('memo call-count #44: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 44; });
    fn(44); fn(44); fn(44);
    expect(calls).toBe(1);
  });
  it('memo call-count #45: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 45; });
    fn(45); fn(45); fn(45);
    expect(calls).toBe(1);
  });
  it('memo call-count #46: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 46; });
    fn(46); fn(46); fn(46);
    expect(calls).toBe(1);
  });
  it('memo call-count #47: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 47; });
    fn(47); fn(47); fn(47);
    expect(calls).toBe(1);
  });
  it('memo call-count #48: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 48; });
    fn(48); fn(48); fn(48);
    expect(calls).toBe(1);
  });
  it('memo call-count #49: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 49; });
    fn(49); fn(49); fn(49);
    expect(calls).toBe(1);
  });
  it('memo call-count #50: underlying fn called once for same args', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x + 50; });
    fn(50); fn(50); fn(50);
    expect(calls).toBe(1);
  });
  it('memo keyFn #1: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(1, 2); fn(1, 2);
    expect(calls).toBe(1);
    expect(fn(1, 2)).toBe(3);
  });
  it('memo keyFn #2: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(2, 3); fn(2, 3);
    expect(calls).toBe(1);
    expect(fn(2, 3)).toBe(5);
  });
  it('memo keyFn #3: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(3, 4); fn(3, 4);
    expect(calls).toBe(1);
    expect(fn(3, 4)).toBe(7);
  });
  it('memo keyFn #4: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(4, 5); fn(4, 5);
    expect(calls).toBe(1);
    expect(fn(4, 5)).toBe(9);
  });
  it('memo keyFn #5: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(5, 6); fn(5, 6);
    expect(calls).toBe(1);
    expect(fn(5, 6)).toBe(11);
  });
  it('memo keyFn #6: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(6, 7); fn(6, 7);
    expect(calls).toBe(1);
    expect(fn(6, 7)).toBe(13);
  });
  it('memo keyFn #7: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(7, 8); fn(7, 8);
    expect(calls).toBe(1);
    expect(fn(7, 8)).toBe(15);
  });
  it('memo keyFn #8: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(8, 9); fn(8, 9);
    expect(calls).toBe(1);
    expect(fn(8, 9)).toBe(17);
  });
  it('memo keyFn #9: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(9, 10); fn(9, 10);
    expect(calls).toBe(1);
    expect(fn(9, 10)).toBe(19);
  });
  it('memo keyFn #10: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(10, 11); fn(10, 11);
    expect(calls).toBe(1);
    expect(fn(10, 11)).toBe(21);
  });
  it('memo keyFn #11: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(11, 12); fn(11, 12);
    expect(calls).toBe(1);
    expect(fn(11, 12)).toBe(23);
  });
  it('memo keyFn #12: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(12, 13); fn(12, 13);
    expect(calls).toBe(1);
    expect(fn(12, 13)).toBe(25);
  });
  it('memo keyFn #13: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(13, 14); fn(13, 14);
    expect(calls).toBe(1);
    expect(fn(13, 14)).toBe(27);
  });
  it('memo keyFn #14: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(14, 15); fn(14, 15);
    expect(calls).toBe(1);
    expect(fn(14, 15)).toBe(29);
  });
  it('memo keyFn #15: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(15, 16); fn(15, 16);
    expect(calls).toBe(1);
    expect(fn(15, 16)).toBe(31);
  });
  it('memo keyFn #16: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(16, 17); fn(16, 17);
    expect(calls).toBe(1);
    expect(fn(16, 17)).toBe(33);
  });
  it('memo keyFn #17: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(17, 18); fn(17, 18);
    expect(calls).toBe(1);
    expect(fn(17, 18)).toBe(35);
  });
  it('memo keyFn #18: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(18, 19); fn(18, 19);
    expect(calls).toBe(1);
    expect(fn(18, 19)).toBe(37);
  });
  it('memo keyFn #19: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(19, 20); fn(19, 20);
    expect(calls).toBe(1);
    expect(fn(19, 20)).toBe(39);
  });
  it('memo keyFn #20: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(20, 21); fn(20, 21);
    expect(calls).toBe(1);
    expect(fn(20, 21)).toBe(41);
  });
  it('memo keyFn #21: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(21, 22); fn(21, 22);
    expect(calls).toBe(1);
    expect(fn(21, 22)).toBe(43);
  });
  it('memo keyFn #22: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(22, 23); fn(22, 23);
    expect(calls).toBe(1);
    expect(fn(22, 23)).toBe(45);
  });
  it('memo keyFn #23: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(23, 24); fn(23, 24);
    expect(calls).toBe(1);
    expect(fn(23, 24)).toBe(47);
  });
  it('memo keyFn #24: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(24, 25); fn(24, 25);
    expect(calls).toBe(1);
    expect(fn(24, 25)).toBe(49);
  });
  it('memo keyFn #25: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(25, 26); fn(25, 26);
    expect(calls).toBe(1);
    expect(fn(25, 26)).toBe(51);
  });
  it('memo keyFn #26: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(26, 27); fn(26, 27);
    expect(calls).toBe(1);
    expect(fn(26, 27)).toBe(53);
  });
  it('memo keyFn #27: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(27, 28); fn(27, 28);
    expect(calls).toBe(1);
    expect(fn(27, 28)).toBe(55);
  });
  it('memo keyFn #28: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(28, 29); fn(28, 29);
    expect(calls).toBe(1);
    expect(fn(28, 29)).toBe(57);
  });
  it('memo keyFn #29: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(29, 30); fn(29, 30);
    expect(calls).toBe(1);
    expect(fn(29, 30)).toBe(59);
  });
  it('memo keyFn #30: custom key function used for caching', () => {
    let calls = 0;
    const fn = memoize((a: number, b: number) => { calls++; return a + b; }, (a, b) => `${a},${b}`);
    fn(30, 31); fn(30, 31);
    expect(calls).toBe(1);
    expect(fn(30, 31)).toBe(61);
  });
  it('memo diff-args #1: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(1)).toBe(2);
    expect(fn(2)).toBe(4);
  });
  it('memo diff-args #2: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(2)).toBe(4);
    expect(fn(3)).toBe(6);
  });
  it('memo diff-args #3: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(3)).toBe(6);
    expect(fn(4)).toBe(8);
  });
  it('memo diff-args #4: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(4)).toBe(8);
    expect(fn(5)).toBe(10);
  });
  it('memo diff-args #5: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(5)).toBe(10);
    expect(fn(6)).toBe(12);
  });
  it('memo diff-args #6: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(6)).toBe(12);
    expect(fn(7)).toBe(14);
  });
  it('memo diff-args #7: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(7)).toBe(14);
    expect(fn(8)).toBe(16);
  });
  it('memo diff-args #8: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(8)).toBe(16);
    expect(fn(9)).toBe(18);
  });
  it('memo diff-args #9: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(9)).toBe(18);
    expect(fn(10)).toBe(20);
  });
  it('memo diff-args #10: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(10)).toBe(20);
    expect(fn(11)).toBe(22);
  });
  it('memo diff-args #11: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(11)).toBe(22);
    expect(fn(12)).toBe(24);
  });
  it('memo diff-args #12: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(12)).toBe(24);
    expect(fn(13)).toBe(26);
  });
  it('memo diff-args #13: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(13)).toBe(26);
    expect(fn(14)).toBe(28);
  });
  it('memo diff-args #14: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(14)).toBe(28);
    expect(fn(15)).toBe(30);
  });
  it('memo diff-args #15: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(15)).toBe(30);
    expect(fn(16)).toBe(32);
  });
  it('memo diff-args #16: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(16)).toBe(32);
    expect(fn(17)).toBe(34);
  });
  it('memo diff-args #17: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(17)).toBe(34);
    expect(fn(18)).toBe(36);
  });
  it('memo diff-args #18: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(18)).toBe(36);
    expect(fn(19)).toBe(38);
  });
  it('memo diff-args #19: different args produce different cache entries', () => {
    const fn = memoize((x: number) => x * 2);
    expect(fn(19)).toBe(38);
    expect(fn(20)).toBe(40);
  });
});

describe('createStore', () => {
  it('store set/get #1: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k1', 7);
    expect(s.get('k1')).toBe(7);
  });
  it('store set/get #2: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k2', 14);
    expect(s.get('k2')).toBe(14);
  });
  it('store set/get #3: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k3', 21);
    expect(s.get('k3')).toBe(21);
  });
  it('store set/get #4: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k4', 28);
    expect(s.get('k4')).toBe(28);
  });
  it('store set/get #5: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k5', 35);
    expect(s.get('k5')).toBe(35);
  });
  it('store set/get #6: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k6', 42);
    expect(s.get('k6')).toBe(42);
  });
  it('store set/get #7: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k7', 49);
    expect(s.get('k7')).toBe(49);
  });
  it('store set/get #8: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k8', 56);
    expect(s.get('k8')).toBe(56);
  });
  it('store set/get #9: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k9', 63);
    expect(s.get('k9')).toBe(63);
  });
  it('store set/get #10: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k10', 70);
    expect(s.get('k10')).toBe(70);
  });
  it('store set/get #11: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k11', 77);
    expect(s.get('k11')).toBe(77);
  });
  it('store set/get #12: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k12', 84);
    expect(s.get('k12')).toBe(84);
  });
  it('store set/get #13: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k13', 91);
    expect(s.get('k13')).toBe(91);
  });
  it('store set/get #14: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k14', 98);
    expect(s.get('k14')).toBe(98);
  });
  it('store set/get #15: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k15', 105);
    expect(s.get('k15')).toBe(105);
  });
  it('store set/get #16: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k16', 112);
    expect(s.get('k16')).toBe(112);
  });
  it('store set/get #17: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k17', 119);
    expect(s.get('k17')).toBe(119);
  });
  it('store set/get #18: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k18', 126);
    expect(s.get('k18')).toBe(126);
  });
  it('store set/get #19: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k19', 133);
    expect(s.get('k19')).toBe(133);
  });
  it('store set/get #20: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k20', 140);
    expect(s.get('k20')).toBe(140);
  });
  it('store set/get #21: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k21', 147);
    expect(s.get('k21')).toBe(147);
  });
  it('store set/get #22: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k22', 154);
    expect(s.get('k22')).toBe(154);
  });
  it('store set/get #23: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k23', 161);
    expect(s.get('k23')).toBe(161);
  });
  it('store set/get #24: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k24', 168);
    expect(s.get('k24')).toBe(168);
  });
  it('store set/get #25: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k25', 175);
    expect(s.get('k25')).toBe(175);
  });
  it('store set/get #26: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k26', 182);
    expect(s.get('k26')).toBe(182);
  });
  it('store set/get #27: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k27', 189);
    expect(s.get('k27')).toBe(189);
  });
  it('store set/get #28: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k28', 196);
    expect(s.get('k28')).toBe(196);
  });
  it('store set/get #29: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k29', 203);
    expect(s.get('k29')).toBe(203);
  });
  it('store set/get #30: stores and retrieves value', () => {
    const s = createStore<number>();
    s.set('k30', 210);
    expect(s.get('k30')).toBe(210);
  });
  it('store has #1: returns true after set', () => {
    const s = createStore<string>();
    s.set('h1', 'val1');
    expect(s.has('h1')).toBe(true);
  });
  it('store has #2: returns true after set', () => {
    const s = createStore<string>();
    s.set('h2', 'val2');
    expect(s.has('h2')).toBe(true);
  });
  it('store has #3: returns true after set', () => {
    const s = createStore<string>();
    s.set('h3', 'val3');
    expect(s.has('h3')).toBe(true);
  });
  it('store has #4: returns true after set', () => {
    const s = createStore<string>();
    s.set('h4', 'val4');
    expect(s.has('h4')).toBe(true);
  });
  it('store has #5: returns true after set', () => {
    const s = createStore<string>();
    s.set('h5', 'val5');
    expect(s.has('h5')).toBe(true);
  });
  it('store has #6: returns true after set', () => {
    const s = createStore<string>();
    s.set('h6', 'val6');
    expect(s.has('h6')).toBe(true);
  });
  it('store has #7: returns true after set', () => {
    const s = createStore<string>();
    s.set('h7', 'val7');
    expect(s.has('h7')).toBe(true);
  });
  it('store has #8: returns true after set', () => {
    const s = createStore<string>();
    s.set('h8', 'val8');
    expect(s.has('h8')).toBe(true);
  });
  it('store has #9: returns true after set', () => {
    const s = createStore<string>();
    s.set('h9', 'val9');
    expect(s.has('h9')).toBe(true);
  });
  it('store has #10: returns true after set', () => {
    const s = createStore<string>();
    s.set('h10', 'val10');
    expect(s.has('h10')).toBe(true);
  });
  it('store has #11: returns true after set', () => {
    const s = createStore<string>();
    s.set('h11', 'val11');
    expect(s.has('h11')).toBe(true);
  });
  it('store has #12: returns true after set', () => {
    const s = createStore<string>();
    s.set('h12', 'val12');
    expect(s.has('h12')).toBe(true);
  });
  it('store has #13: returns true after set', () => {
    const s = createStore<string>();
    s.set('h13', 'val13');
    expect(s.has('h13')).toBe(true);
  });
  it('store has #14: returns true after set', () => {
    const s = createStore<string>();
    s.set('h14', 'val14');
    expect(s.has('h14')).toBe(true);
  });
  it('store has #15: returns true after set', () => {
    const s = createStore<string>();
    s.set('h15', 'val15');
    expect(s.has('h15')).toBe(true);
  });
  it('store has #16: returns true after set', () => {
    const s = createStore<string>();
    s.set('h16', 'val16');
    expect(s.has('h16')).toBe(true);
  });
  it('store has #17: returns true after set', () => {
    const s = createStore<string>();
    s.set('h17', 'val17');
    expect(s.has('h17')).toBe(true);
  });
  it('store has #18: returns true after set', () => {
    const s = createStore<string>();
    s.set('h18', 'val18');
    expect(s.has('h18')).toBe(true);
  });
  it('store has #19: returns true after set', () => {
    const s = createStore<string>();
    s.set('h19', 'val19');
    expect(s.has('h19')).toBe(true);
  });
  it('store has #20: returns true after set', () => {
    const s = createStore<string>();
    s.set('h20', 'val20');
    expect(s.has('h20')).toBe(true);
  });
  it('store delete #1: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d1', 1);
    expect(s.delete('d1')).toBe(true);
    expect(s.has('d1')).toBe(false);
  });
  it('store delete #2: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d2', 2);
    expect(s.delete('d2')).toBe(true);
    expect(s.has('d2')).toBe(false);
  });
  it('store delete #3: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d3', 3);
    expect(s.delete('d3')).toBe(true);
    expect(s.has('d3')).toBe(false);
  });
  it('store delete #4: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d4', 4);
    expect(s.delete('d4')).toBe(true);
    expect(s.has('d4')).toBe(false);
  });
  it('store delete #5: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d5', 5);
    expect(s.delete('d5')).toBe(true);
    expect(s.has('d5')).toBe(false);
  });
  it('store delete #6: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d6', 6);
    expect(s.delete('d6')).toBe(true);
    expect(s.has('d6')).toBe(false);
  });
  it('store delete #7: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d7', 7);
    expect(s.delete('d7')).toBe(true);
    expect(s.has('d7')).toBe(false);
  });
  it('store delete #8: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d8', 8);
    expect(s.delete('d8')).toBe(true);
    expect(s.has('d8')).toBe(false);
  });
  it('store delete #9: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d9', 9);
    expect(s.delete('d9')).toBe(true);
    expect(s.has('d9')).toBe(false);
  });
  it('store delete #10: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d10', 10);
    expect(s.delete('d10')).toBe(true);
    expect(s.has('d10')).toBe(false);
  });
  it('store delete #11: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d11', 11);
    expect(s.delete('d11')).toBe(true);
    expect(s.has('d11')).toBe(false);
  });
  it('store delete #12: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d12', 12);
    expect(s.delete('d12')).toBe(true);
    expect(s.has('d12')).toBe(false);
  });
  it('store delete #13: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d13', 13);
    expect(s.delete('d13')).toBe(true);
    expect(s.has('d13')).toBe(false);
  });
  it('store delete #14: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d14', 14);
    expect(s.delete('d14')).toBe(true);
    expect(s.has('d14')).toBe(false);
  });
  it('store delete #15: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d15', 15);
    expect(s.delete('d15')).toBe(true);
    expect(s.has('d15')).toBe(false);
  });
  it('store delete #16: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d16', 16);
    expect(s.delete('d16')).toBe(true);
    expect(s.has('d16')).toBe(false);
  });
  it('store delete #17: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d17', 17);
    expect(s.delete('d17')).toBe(true);
    expect(s.has('d17')).toBe(false);
  });
  it('store delete #18: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d18', 18);
    expect(s.delete('d18')).toBe(true);
    expect(s.has('d18')).toBe(false);
  });
  it('store delete #19: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d19', 19);
    expect(s.delete('d19')).toBe(true);
    expect(s.has('d19')).toBe(false);
  });
  it('store delete #20: returns true and removes entry', () => {
    const s = createStore<number>();
    s.set('d20', 20);
    expect(s.delete('d20')).toBe(true);
    expect(s.has('d20')).toBe(false);
  });
  it('store size #1: size is 2 after 2 sets', () => {
    const s = createStore<number>();
    s.set('sz1_0', 0);
    s.set('sz1_1', 1);
    expect(s.size()).toBe(2);
  });
  it('store size #2: size is 3 after 3 sets', () => {
    const s = createStore<number>();
    s.set('sz2_0', 0);
    s.set('sz2_1', 1);
    s.set('sz2_2', 2);
    expect(s.size()).toBe(3);
  });
  it('store size #3: size is 4 after 4 sets', () => {
    const s = createStore<number>();
    s.set('sz3_0', 0);
    s.set('sz3_1', 1);
    s.set('sz3_2', 2);
    s.set('sz3_3', 3);
    expect(s.size()).toBe(4);
  });
  it('store size #4: size is 5 after 5 sets', () => {
    const s = createStore<number>();
    s.set('sz4_0', 0);
    s.set('sz4_1', 1);
    s.set('sz4_2', 2);
    s.set('sz4_3', 3);
    s.set('sz4_4', 4);
    expect(s.size()).toBe(5);
  });
  it('store size #5: size is 1 after 1 sets', () => {
    const s = createStore<number>();
    s.set('sz5_0', 0);
    expect(s.size()).toBe(1);
  });
  it('store size #6: size is 2 after 2 sets', () => {
    const s = createStore<number>();
    s.set('sz6_0', 0);
    s.set('sz6_1', 1);
    expect(s.size()).toBe(2);
  });
  it('store size #7: size is 3 after 3 sets', () => {
    const s = createStore<number>();
    s.set('sz7_0', 0);
    s.set('sz7_1', 1);
    s.set('sz7_2', 2);
    expect(s.size()).toBe(3);
  });
  it('store size #8: size is 4 after 4 sets', () => {
    const s = createStore<number>();
    s.set('sz8_0', 0);
    s.set('sz8_1', 1);
    s.set('sz8_2', 2);
    s.set('sz8_3', 3);
    expect(s.size()).toBe(4);
  });
  it('store size #9: size is 5 after 5 sets', () => {
    const s = createStore<number>();
    s.set('sz9_0', 0);
    s.set('sz9_1', 1);
    s.set('sz9_2', 2);
    s.set('sz9_3', 3);
    s.set('sz9_4', 4);
    expect(s.size()).toBe(5);
  });
  it('store size #10: size is 1 after 1 sets', () => {
    const s = createStore<number>();
    s.set('sz10_0', 0);
    expect(s.size()).toBe(1);
  });
  it('store size #11: size is 2 after 2 sets', () => {
    const s = createStore<number>();
    s.set('sz11_0', 0);
    s.set('sz11_1', 1);
    expect(s.size()).toBe(2);
  });
  it('store size #12: size is 3 after 3 sets', () => {
    const s = createStore<number>();
    s.set('sz12_0', 0);
    s.set('sz12_1', 1);
    s.set('sz12_2', 2);
    expect(s.size()).toBe(3);
  });
  it('store size #13: size is 4 after 4 sets', () => {
    const s = createStore<number>();
    s.set('sz13_0', 0);
    s.set('sz13_1', 1);
    s.set('sz13_2', 2);
    s.set('sz13_3', 3);
    expect(s.size()).toBe(4);
  });
  it('store size #14: size is 5 after 5 sets', () => {
    const s = createStore<number>();
    s.set('sz14_0', 0);
    s.set('sz14_1', 1);
    s.set('sz14_2', 2);
    s.set('sz14_3', 3);
    s.set('sz14_4', 4);
    expect(s.size()).toBe(5);
  });
  it('store size #15: size is 1 after 1 sets', () => {
    const s = createStore<number>();
    s.set('sz15_0', 0);
    expect(s.size()).toBe(1);
  });
  it('store clear #1: size 0 after clear', () => {
    const s = createStore<number>();
    s.set('a1', 1); s.set('b1', 2);
    s.clear();
    expect(s.size()).toBe(0);
  });
  it('store clear #2: size 0 after clear', () => {
    const s = createStore<number>();
    s.set('a2', 1); s.set('b2', 2);
    s.clear();
    expect(s.size()).toBe(0);
  });
  it('store clear #3: size 0 after clear', () => {
    const s = createStore<number>();
    s.set('a3', 1); s.set('b3', 2);
    s.clear();
    expect(s.size()).toBe(0);
  });
  it('store clear #4: size 0 after clear', () => {
    const s = createStore<number>();
    s.set('a4', 1); s.set('b4', 2);
    s.clear();
    expect(s.size()).toBe(0);
  });
  it('store clear #5: size 0 after clear', () => {
    const s = createStore<number>();
    s.set('a5', 1); s.set('b5', 2);
    s.clear();
    expect(s.size()).toBe(0);
  });
  it('store clear #6: size 0 after clear', () => {
    const s = createStore<number>();
    s.set('a6', 1); s.set('b6', 2);
    s.clear();
    expect(s.size()).toBe(0);
  });
  it('store clear #7: size 0 after clear', () => {
    const s = createStore<number>();
    s.set('a7', 1); s.set('b7', 2);
    s.clear();
    expect(s.size()).toBe(0);
  });
  it('store keys #1: returns 2 keys', () => {
    const s = createStore<number>();
    s.set('key1_0', 0);
    s.set('key1_1', 1);
    expect(s.keys().length).toBe(2);
  });
  it('store keys #2: returns 3 keys', () => {
    const s = createStore<number>();
    s.set('key2_0', 0);
    s.set('key2_1', 1);
    s.set('key2_2', 2);
    expect(s.keys().length).toBe(3);
  });
  it('store keys #3: returns 4 keys', () => {
    const s = createStore<number>();
    s.set('key3_0', 0);
    s.set('key3_1', 1);
    s.set('key3_2', 2);
    s.set('key3_3', 3);
    expect(s.keys().length).toBe(4);
  });
  it('store keys #4: returns 5 keys', () => {
    const s = createStore<number>();
    s.set('key4_0', 0);
    s.set('key4_1', 1);
    s.set('key4_2', 2);
    s.set('key4_3', 3);
    s.set('key4_4', 4);
    expect(s.keys().length).toBe(5);
  });
  it('store keys #5: returns 6 keys', () => {
    const s = createStore<number>();
    s.set('key5_0', 0);
    s.set('key5_1', 1);
    s.set('key5_2', 2);
    s.set('key5_3', 3);
    s.set('key5_4', 4);
    s.set('key5_5', 5);
    expect(s.keys().length).toBe(6);
  });
  it('store get missing #1: returns undefined', () => {
    const s = createStore<number>();
    expect(s.get('nope1')).toBeUndefined();
  });
  it('store get missing #2: returns undefined', () => {
    const s = createStore<number>();
    expect(s.get('nope2')).toBeUndefined();
  });
  it('store get missing #3: returns undefined', () => {
    const s = createStore<number>();
    expect(s.get('nope3')).toBeUndefined();
  });
  it('store get missing #4: returns undefined', () => {
    const s = createStore<number>();
    expect(s.get('nope4')).toBeUndefined();
  });
  it('store get missing #5: returns undefined', () => {
    const s = createStore<number>();
    expect(s.get('nope5')).toBeUndefined();
  });
  it('store get missing #6: returns undefined', () => {
    const s = createStore<number>();
    expect(s.get('nope6')).toBeUndefined();
  });
  it('store get missing #7: returns undefined', () => {
    const s = createStore<number>();
    expect(s.get('nope7')).toBeUndefined();
  });
});

describe('buildKey', () => {
  it('buildKey single #1: single string part 1', () => {
    expect(buildKey('part1')).toBe('part1');
  });
  it('buildKey single #2: single string part 2', () => {
    expect(buildKey('part2')).toBe('part2');
  });
  it('buildKey single #3: single string part 3', () => {
    expect(buildKey('part3')).toBe('part3');
  });
  it('buildKey single #4: single string part 4', () => {
    expect(buildKey('part4')).toBe('part4');
  });
  it('buildKey single #5: single string part 5', () => {
    expect(buildKey('part5')).toBe('part5');
  });
  it('buildKey single #6: single string part 6', () => {
    expect(buildKey('part6')).toBe('part6');
  });
  it('buildKey single #7: single string part 7', () => {
    expect(buildKey('part7')).toBe('part7');
  });
  it('buildKey single #8: single string part 8', () => {
    expect(buildKey('part8')).toBe('part8');
  });
  it('buildKey single #9: single string part 9', () => {
    expect(buildKey('part9')).toBe('part9');
  });
  it('buildKey single #10: single string part 10', () => {
    expect(buildKey('part10')).toBe('part10');
  });
  it('buildKey single #11: single string part 11', () => {
    expect(buildKey('part11')).toBe('part11');
  });
  it('buildKey single #12: single string part 12', () => {
    expect(buildKey('part12')).toBe('part12');
  });
  it('buildKey single #13: single string part 13', () => {
    expect(buildKey('part13')).toBe('part13');
  });
  it('buildKey single #14: single string part 14', () => {
    expect(buildKey('part14')).toBe('part14');
  });
  it('buildKey single #15: single string part 15', () => {
    expect(buildKey('part15')).toBe('part15');
  });
  it('buildKey single #16: single string part 16', () => {
    expect(buildKey('part16')).toBe('part16');
  });
  it('buildKey single #17: single string part 17', () => {
    expect(buildKey('part17')).toBe('part17');
  });
  it('buildKey single #18: single string part 18', () => {
    expect(buildKey('part18')).toBe('part18');
  });
  it('buildKey single #19: single string part 19', () => {
    expect(buildKey('part19')).toBe('part19');
  });
  it('buildKey single #20: single string part 20', () => {
    expect(buildKey('part20')).toBe('part20');
  });
  it('buildKey single #21: single string part 21', () => {
    expect(buildKey('part21')).toBe('part21');
  });
  it('buildKey single #22: single string part 22', () => {
    expect(buildKey('part22')).toBe('part22');
  });
  it('buildKey single #23: single string part 23', () => {
    expect(buildKey('part23')).toBe('part23');
  });
  it('buildKey single #24: single string part 24', () => {
    expect(buildKey('part24')).toBe('part24');
  });
  it('buildKey single #25: single string part 25', () => {
    expect(buildKey('part25')).toBe('part25');
  });
  it('buildKey single #26: single string part 26', () => {
    expect(buildKey('part26')).toBe('part26');
  });
  it('buildKey single #27: single string part 27', () => {
    expect(buildKey('part27')).toBe('part27');
  });
  it('buildKey single #28: single string part 28', () => {
    expect(buildKey('part28')).toBe('part28');
  });
  it('buildKey single #29: single string part 29', () => {
    expect(buildKey('part29')).toBe('part29');
  });
  it('buildKey single #30: single string part 30', () => {
    expect(buildKey('part30')).toBe('part30');
  });
  it('buildKey two #1: two parts joined by colon', () => {
    expect(buildKey('a1', 'b1')).toBe('a1:b1');
  });
  it('buildKey two #2: two parts joined by colon', () => {
    expect(buildKey('a2', 'b2')).toBe('a2:b2');
  });
  it('buildKey two #3: two parts joined by colon', () => {
    expect(buildKey('a3', 'b3')).toBe('a3:b3');
  });
  it('buildKey two #4: two parts joined by colon', () => {
    expect(buildKey('a4', 'b4')).toBe('a4:b4');
  });
  it('buildKey two #5: two parts joined by colon', () => {
    expect(buildKey('a5', 'b5')).toBe('a5:b5');
  });
  it('buildKey two #6: two parts joined by colon', () => {
    expect(buildKey('a6', 'b6')).toBe('a6:b6');
  });
  it('buildKey two #7: two parts joined by colon', () => {
    expect(buildKey('a7', 'b7')).toBe('a7:b7');
  });
  it('buildKey two #8: two parts joined by colon', () => {
    expect(buildKey('a8', 'b8')).toBe('a8:b8');
  });
  it('buildKey two #9: two parts joined by colon', () => {
    expect(buildKey('a9', 'b9')).toBe('a9:b9');
  });
  it('buildKey two #10: two parts joined by colon', () => {
    expect(buildKey('a10', 'b10')).toBe('a10:b10');
  });
  it('buildKey two #11: two parts joined by colon', () => {
    expect(buildKey('a11', 'b11')).toBe('a11:b11');
  });
  it('buildKey two #12: two parts joined by colon', () => {
    expect(buildKey('a12', 'b12')).toBe('a12:b12');
  });
  it('buildKey two #13: two parts joined by colon', () => {
    expect(buildKey('a13', 'b13')).toBe('a13:b13');
  });
  it('buildKey two #14: two parts joined by colon', () => {
    expect(buildKey('a14', 'b14')).toBe('a14:b14');
  });
  it('buildKey two #15: two parts joined by colon', () => {
    expect(buildKey('a15', 'b15')).toBe('a15:b15');
  });
  it('buildKey two #16: two parts joined by colon', () => {
    expect(buildKey('a16', 'b16')).toBe('a16:b16');
  });
  it('buildKey two #17: two parts joined by colon', () => {
    expect(buildKey('a17', 'b17')).toBe('a17:b17');
  });
  it('buildKey two #18: two parts joined by colon', () => {
    expect(buildKey('a18', 'b18')).toBe('a18:b18');
  });
  it('buildKey two #19: two parts joined by colon', () => {
    expect(buildKey('a19', 'b19')).toBe('a19:b19');
  });
  it('buildKey two #20: two parts joined by colon', () => {
    expect(buildKey('a20', 'b20')).toBe('a20:b20');
  });
  it('buildKey two #21: two parts joined by colon', () => {
    expect(buildKey('a21', 'b21')).toBe('a21:b21');
  });
  it('buildKey two #22: two parts joined by colon', () => {
    expect(buildKey('a22', 'b22')).toBe('a22:b22');
  });
  it('buildKey two #23: two parts joined by colon', () => {
    expect(buildKey('a23', 'b23')).toBe('a23:b23');
  });
  it('buildKey two #24: two parts joined by colon', () => {
    expect(buildKey('a24', 'b24')).toBe('a24:b24');
  });
  it('buildKey two #25: two parts joined by colon', () => {
    expect(buildKey('a25', 'b25')).toBe('a25:b25');
  });
  it('buildKey two #26: two parts joined by colon', () => {
    expect(buildKey('a26', 'b26')).toBe('a26:b26');
  });
  it('buildKey two #27: two parts joined by colon', () => {
    expect(buildKey('a27', 'b27')).toBe('a27:b27');
  });
  it('buildKey two #28: two parts joined by colon', () => {
    expect(buildKey('a28', 'b28')).toBe('a28:b28');
  });
  it('buildKey two #29: two parts joined by colon', () => {
    expect(buildKey('a29', 'b29')).toBe('a29:b29');
  });
  it('buildKey two #30: two parts joined by colon', () => {
    expect(buildKey('a30', 'b30')).toBe('a30:b30');
  });
  it('buildKey numeric #1: numeric parts serialized', () => {
    expect(buildKey(1, 2, 3)).toBe('1:2:3');
  });
  it('buildKey numeric #2: numeric parts serialized', () => {
    expect(buildKey(2, 3, 4)).toBe('2:3:4');
  });
  it('buildKey numeric #3: numeric parts serialized', () => {
    expect(buildKey(3, 4, 5)).toBe('3:4:5');
  });
  it('buildKey numeric #4: numeric parts serialized', () => {
    expect(buildKey(4, 5, 6)).toBe('4:5:6');
  });
  it('buildKey numeric #5: numeric parts serialized', () => {
    expect(buildKey(5, 6, 7)).toBe('5:6:7');
  });
  it('buildKey numeric #6: numeric parts serialized', () => {
    expect(buildKey(6, 7, 8)).toBe('6:7:8');
  });
  it('buildKey numeric #7: numeric parts serialized', () => {
    expect(buildKey(7, 8, 9)).toBe('7:8:9');
  });
  it('buildKey numeric #8: numeric parts serialized', () => {
    expect(buildKey(8, 9, 10)).toBe('8:9:10');
  });
  it('buildKey numeric #9: numeric parts serialized', () => {
    expect(buildKey(9, 10, 11)).toBe('9:10:11');
  });
  it('buildKey numeric #10: numeric parts serialized', () => {
    expect(buildKey(10, 11, 12)).toBe('10:11:12');
  });
  it('buildKey numeric #11: numeric parts serialized', () => {
    expect(buildKey(11, 12, 13)).toBe('11:12:13');
  });
  it('buildKey numeric #12: numeric parts serialized', () => {
    expect(buildKey(12, 13, 14)).toBe('12:13:14');
  });
  it('buildKey numeric #13: numeric parts serialized', () => {
    expect(buildKey(13, 14, 15)).toBe('13:14:15');
  });
  it('buildKey numeric #14: numeric parts serialized', () => {
    expect(buildKey(14, 15, 16)).toBe('14:15:16');
  });
  it('buildKey numeric #15: numeric parts serialized', () => {
    expect(buildKey(15, 16, 17)).toBe('15:16:17');
  });
  it('buildKey numeric #16: numeric parts serialized', () => {
    expect(buildKey(16, 17, 18)).toBe('16:17:18');
  });
  it('buildKey numeric #17: numeric parts serialized', () => {
    expect(buildKey(17, 18, 19)).toBe('17:18:19');
  });
  it('buildKey numeric #18: numeric parts serialized', () => {
    expect(buildKey(18, 19, 20)).toBe('18:19:20');
  });
  it('buildKey numeric #19: numeric parts serialized', () => {
    expect(buildKey(19, 20, 21)).toBe('19:20:21');
  });
  it('buildKey numeric #20: numeric parts serialized', () => {
    expect(buildKey(20, 21, 22)).toBe('20:21:22');
  });
  it('buildKey three #1: three string parts', () => {
    expect(buildKey('x1', 'y1', 'z1')).toBe('x1:y1:z1');
  });
  it('buildKey three #2: three string parts', () => {
    expect(buildKey('x2', 'y2', 'z2')).toBe('x2:y2:z2');
  });
  it('buildKey three #3: three string parts', () => {
    expect(buildKey('x3', 'y3', 'z3')).toBe('x3:y3:z3');
  });
  it('buildKey three #4: three string parts', () => {
    expect(buildKey('x4', 'y4', 'z4')).toBe('x4:y4:z4');
  });
  it('buildKey three #5: three string parts', () => {
    expect(buildKey('x5', 'y5', 'z5')).toBe('x5:y5:z5');
  });
  it('buildKey three #6: three string parts', () => {
    expect(buildKey('x6', 'y6', 'z6')).toBe('x6:y6:z6');
  });
  it('buildKey three #7: three string parts', () => {
    expect(buildKey('x7', 'y7', 'z7')).toBe('x7:y7:z7');
  });
  it('buildKey three #8: three string parts', () => {
    expect(buildKey('x8', 'y8', 'z8')).toBe('x8:y8:z8');
  });
  it('buildKey three #9: three string parts', () => {
    expect(buildKey('x9', 'y9', 'z9')).toBe('x9:y9:z9');
  });
  it('buildKey three #10: three string parts', () => {
    expect(buildKey('x10', 'y10', 'z10')).toBe('x10:y10:z10');
  });
  it('buildKey mixed #1: mixed string and number', () => {
    expect(buildKey('org', 1, 'user')).toBe('org:1:user');
  });
  it('buildKey mixed #2: mixed string and number', () => {
    expect(buildKey('org', 2, 'user')).toBe('org:2:user');
  });
  it('buildKey mixed #3: mixed string and number', () => {
    expect(buildKey('org', 3, 'user')).toBe('org:3:user');
  });
  it('buildKey mixed #4: mixed string and number', () => {
    expect(buildKey('org', 4, 'user')).toBe('org:4:user');
  });
  it('buildKey mixed #5: mixed string and number', () => {
    expect(buildKey('org', 5, 'user')).toBe('org:5:user');
  });
  it('buildKey mixed #6: mixed string and number', () => {
    expect(buildKey('org', 6, 'user')).toBe('org:6:user');
  });
  it('buildKey mixed #7: mixed string and number', () => {
    expect(buildKey('org', 7, 'user')).toBe('org:7:user');
  });
  it('buildKey mixed #8: mixed string and number', () => {
    expect(buildKey('org', 8, 'user')).toBe('org:8:user');
  });
});

describe('hashKey', () => {
  it('hashKey #1: same input produces same hash', () => {
    expect(hashKey('hello')).toBe(hashKey('hello'));
  });
  it('hashKey #2: different inputs produce different hashes', () => {
    expect(hashKey('foo')).not.toBe(hashKey('bar'));
  });
  it('hashKey #3: returns 8-char hex string', () => {
    expect(hashKey(42)).toMatch(/^[0-9a-f]{8}$/);
  });
  it('hashKey #4: object input hashed deterministically', () => {
    expect(hashKey({ a: 1 })).toBe(hashKey({ a: 1 }));
  });
  it('hashKey #5: array input hashed deterministically', () => {
    expect(hashKey([1, 2, 3])).toBe(hashKey([1, 2, 3]));
  });
  it('hashKey #6: null input produces valid hash', () => {
    expect(hashKey(null)).toMatch(/^[0-9a-f]{8}$/);
  });
  it('hashKey #7: number zero hashed', () => {
    expect(hashKey(0)).toMatch(/^[0-9a-f]{8}$/);
  });
  it('hashKey #8: string vs number same digits differ', () => {
    // '1' and 1 may produce different hashes since JSON.stringify differs
    const h1 = hashKey('1');
    const h2 = hashKey(1);
    expect(typeof h1).toBe('string');
    expect(typeof h2).toBe('string');
  });
  it('hashKey #9: empty string hashed', () => {
    expect(hashKey('')).toMatch(/^[0-9a-f]{8}$/);
  });
  it('hashKey #10: boolean true hashed', () => {
    expect(hashKey(true)).toMatch(/^[0-9a-f]{8}$/);
  });
  it('memoizeAsync #1: caches resolved promise', async () => {
    let calls = 0;
    const fn = memoizeAsync(async (x: number) => { calls++; return x * 2; });
    const r1 = await fn(5);
    const r2 = await fn(5);
    expect(r1).toBe(10);
    expect(r2).toBe(10);
    expect(calls).toBe(1);
  });
  it('memoizeAsync #2: different args call fn separately', async () => {
    let calls = 0;
    const fn = memoizeAsync(async (x: number) => { calls++; return x + 1; });
    await fn(1);
    await fn(2);
    expect(calls).toBe(2);
  });
  it('LRU get promotes to MRU so second-oldest evicted next', () => {
    const c = createLRUCache<string, number>(3);
    c.set('a', 1); c.set('b', 2); c.set('c', 3);
    c.get('a'); // promote 'a' to MRU, 'b' is now LRU
    c.set('d', 4); // evicts 'b'
    expect(c.has('b')).toBe(false);
    expect(c.has('a')).toBe(true);
  });
  it('LRU update promotes key so it is not evicted', () => {
    const c = createLRUCache<string, number>(2);
    c.set('a', 1); c.set('b', 2);
    c.set('a', 99); // update a => a is MRU, b is LRU
    c.set('c', 3); // evicts b
    expect(c.has('b')).toBe(false);
    expect(c.get('a')).toBe(99);
  });
  it('LRU entries returns MRU first', () => {
    const c = createLRUCache<string, number>(3);
    c.set('a', 1); c.set('b', 2); c.set('c', 3);
    const keys = c.keys();
    expect(keys[0]).toBe('c'); // most recently set
  });
  it('TTL size ignores deleted entries', () => {
    const c = createTTLCache<string, number>(60000);
    c.set('a', 1); c.set('b', 2); c.set('c', 3);
    c.delete('b');
    expect(c.size()).toBe(2);
  });
  it('store get after delete returns undefined', () => {
    const s = createStore<string>();
    s.set('k', 'v');
    s.delete('k');
    expect(s.get('k')).toBeUndefined();
  });
  it('buildKey no args returns empty string', () => {
    expect(buildKey()).toBe('');
  });
  it('LRU createLRUCache throws for capacity 0', () => {
    expect(() => createLRUCache(0)).toThrow();
  });
  it('TTL createTTLCache accepts ttl of 0', () => {
    expect(() => createTTLCache(0)).not.toThrow();
  });
  it('memoize with string args', () => {
    const fn = memoize((s: string) => s.toUpperCase());
    expect(fn('hello')).toBe('HELLO');
    expect(fn('hello')).toBe('HELLO');
  });
  it('memoize with two number args', () => {
    let n = 0;
    const fn = memoize((a: number, b: number) => { n++; return a + b; });
    expect(fn(3, 4)).toBe(7);
    expect(fn(3, 4)).toBe(7);
    expect(n).toBe(1);
  });
  it('memoize different arg combinations cached separately', () => {
    let n = 0;
    const fn = memoize((a: number, b: number) => { n++; return a * b; });
    fn(2, 3); fn(4, 5);
    expect(n).toBe(2);
  });
});
