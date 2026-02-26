// Copyright (c) 2026 Nexara DMCC. All rights reserved.

import {
  createToken,
  createContainer,
  inject,
  isRegistered,
  createScope,
} from '../dependency-injection';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function freshContainer() { return createContainer(); }

describe('createToken', () => {
  it('token-unique-1: two tokens with same name are not equal', () => {
    const a = createToken<number>('t1');
    const b = createToken<number>('t1');
    expect(a).not.toBe(b);
  });
  it('token-unique-2: two tokens with same name are not equal', () => {
    const a = createToken<number>('t2');
    const b = createToken<number>('t2');
    expect(a).not.toBe(b);
  });
  it('token-unique-3: two tokens with same name are not equal', () => {
    const a = createToken<number>('t3');
    const b = createToken<number>('t3');
    expect(a).not.toBe(b);
  });
  it('token-unique-4: two tokens with same name are not equal', () => {
    const a = createToken<number>('t4');
    const b = createToken<number>('t4');
    expect(a).not.toBe(b);
  });
  it('token-unique-5: two tokens with same name are not equal', () => {
    const a = createToken<number>('t5');
    const b = createToken<number>('t5');
    expect(a).not.toBe(b);
  });
  it('token-unique-6: two tokens with same name are not equal', () => {
    const a = createToken<number>('t6');
    const b = createToken<number>('t6');
    expect(a).not.toBe(b);
  });
  it('token-unique-7: two tokens with same name are not equal', () => {
    const a = createToken<number>('t7');
    const b = createToken<number>('t7');
    expect(a).not.toBe(b);
  });
  it('token-unique-8: two tokens with same name are not equal', () => {
    const a = createToken<number>('t8');
    const b = createToken<number>('t8');
    expect(a).not.toBe(b);
  });
  it('token-unique-9: two tokens with same name are not equal', () => {
    const a = createToken<number>('t9');
    const b = createToken<number>('t9');
    expect(a).not.toBe(b);
  });
  it('token-unique-10: two tokens with same name are not equal', () => {
    const a = createToken<number>('t10');
    const b = createToken<number>('t10');
    expect(a).not.toBe(b);
  });
  it('token-unique-11: two tokens with same name are not equal', () => {
    const a = createToken<number>('t11');
    const b = createToken<number>('t11');
    expect(a).not.toBe(b);
  });
  it('token-unique-12: two tokens with same name are not equal', () => {
    const a = createToken<number>('t12');
    const b = createToken<number>('t12');
    expect(a).not.toBe(b);
  });
  it('token-unique-13: two tokens with same name are not equal', () => {
    const a = createToken<number>('t13');
    const b = createToken<number>('t13');
    expect(a).not.toBe(b);
  });
  it('token-unique-14: two tokens with same name are not equal', () => {
    const a = createToken<number>('t14');
    const b = createToken<number>('t14');
    expect(a).not.toBe(b);
  });
  it('token-unique-15: two tokens with same name are not equal', () => {
    const a = createToken<number>('t15');
    const b = createToken<number>('t15');
    expect(a).not.toBe(b);
  });
  it('token-unique-16: two tokens with same name are not equal', () => {
    const a = createToken<number>('t16');
    const b = createToken<number>('t16');
    expect(a).not.toBe(b);
  });
  it('token-unique-17: two tokens with same name are not equal', () => {
    const a = createToken<number>('t17');
    const b = createToken<number>('t17');
    expect(a).not.toBe(b);
  });
  it('token-unique-18: two tokens with same name are not equal', () => {
    const a = createToken<number>('t18');
    const b = createToken<number>('t18');
    expect(a).not.toBe(b);
  });
  it('token-unique-19: two tokens with same name are not equal', () => {
    const a = createToken<number>('t19');
    const b = createToken<number>('t19');
    expect(a).not.toBe(b);
  });
  it('token-unique-20: two tokens with same name are not equal', () => {
    const a = createToken<number>('t20');
    const b = createToken<number>('t20');
    expect(a).not.toBe(b);
  });
  it('token-unique-21: two tokens with same name are not equal', () => {
    const a = createToken<number>('t21');
    const b = createToken<number>('t21');
    expect(a).not.toBe(b);
  });
  it('token-unique-22: two tokens with same name are not equal', () => {
    const a = createToken<number>('t22');
    const b = createToken<number>('t22');
    expect(a).not.toBe(b);
  });
  it('token-unique-23: two tokens with same name are not equal', () => {
    const a = createToken<number>('t23');
    const b = createToken<number>('t23');
    expect(a).not.toBe(b);
  });
  it('token-unique-24: two tokens with same name are not equal', () => {
    const a = createToken<number>('t24');
    const b = createToken<number>('t24');
    expect(a).not.toBe(b);
  });
  it('token-unique-25: two tokens with same name are not equal', () => {
    const a = createToken<number>('t25');
    const b = createToken<number>('t25');
    expect(a).not.toBe(b);
  });
  it('token-desc-1: token description matches name', () => {
    const tk = createToken<string>('desc-token-1');
    expect((tk as unknown as symbol).description).toBe('desc-token-1');
  });
  it('token-desc-2: token description matches name', () => {
    const tk = createToken<string>('desc-token-2');
    expect((tk as unknown as symbol).description).toBe('desc-token-2');
  });
  it('token-desc-3: token description matches name', () => {
    const tk = createToken<string>('desc-token-3');
    expect((tk as unknown as symbol).description).toBe('desc-token-3');
  });
  it('token-desc-4: token description matches name', () => {
    const tk = createToken<string>('desc-token-4');
    expect((tk as unknown as symbol).description).toBe('desc-token-4');
  });
  it('token-desc-5: token description matches name', () => {
    const tk = createToken<string>('desc-token-5');
    expect((tk as unknown as symbol).description).toBe('desc-token-5');
  });
  it('token-desc-6: token description matches name', () => {
    const tk = createToken<string>('desc-token-6');
    expect((tk as unknown as symbol).description).toBe('desc-token-6');
  });
  it('token-desc-7: token description matches name', () => {
    const tk = createToken<string>('desc-token-7');
    expect((tk as unknown as symbol).description).toBe('desc-token-7');
  });
  it('token-desc-8: token description matches name', () => {
    const tk = createToken<string>('desc-token-8');
    expect((tk as unknown as symbol).description).toBe('desc-token-8');
  });
  it('token-desc-9: token description matches name', () => {
    const tk = createToken<string>('desc-token-9');
    expect((tk as unknown as symbol).description).toBe('desc-token-9');
  });
  it('token-desc-10: token description matches name', () => {
    const tk = createToken<string>('desc-token-10');
    expect((tk as unknown as symbol).description).toBe('desc-token-10');
  });
  it('token-desc-11: token description matches name', () => {
    const tk = createToken<string>('desc-token-11');
    expect((tk as unknown as symbol).description).toBe('desc-token-11');
  });
  it('token-desc-12: token description matches name', () => {
    const tk = createToken<string>('desc-token-12');
    expect((tk as unknown as symbol).description).toBe('desc-token-12');
  });
  it('token-desc-13: token description matches name', () => {
    const tk = createToken<string>('desc-token-13');
    expect((tk as unknown as symbol).description).toBe('desc-token-13');
  });
  it('token-desc-14: token description matches name', () => {
    const tk = createToken<string>('desc-token-14');
    expect((tk as unknown as symbol).description).toBe('desc-token-14');
  });
  it('token-desc-15: token description matches name', () => {
    const tk = createToken<string>('desc-token-15');
    expect((tk as unknown as symbol).description).toBe('desc-token-15');
  });
  it('token-desc-16: token description matches name', () => {
    const tk = createToken<string>('desc-token-16');
    expect((tk as unknown as symbol).description).toBe('desc-token-16');
  });
  it('token-desc-17: token description matches name', () => {
    const tk = createToken<string>('desc-token-17');
    expect((tk as unknown as symbol).description).toBe('desc-token-17');
  });
  it('token-desc-18: token description matches name', () => {
    const tk = createToken<string>('desc-token-18');
    expect((tk as unknown as symbol).description).toBe('desc-token-18');
  });
  it('token-desc-19: token description matches name', () => {
    const tk = createToken<string>('desc-token-19');
    expect((tk as unknown as symbol).description).toBe('desc-token-19');
  });
  it('token-desc-20: token description matches name', () => {
    const tk = createToken<string>('desc-token-20');
    expect((tk as unknown as symbol).description).toBe('desc-token-20');
  });
  it('token-desc-21: token description matches name', () => {
    const tk = createToken<string>('desc-token-21');
    expect((tk as unknown as symbol).description).toBe('desc-token-21');
  });
  it('token-desc-22: token description matches name', () => {
    const tk = createToken<string>('desc-token-22');
    expect((tk as unknown as symbol).description).toBe('desc-token-22');
  });
  it('token-desc-23: token description matches name', () => {
    const tk = createToken<string>('desc-token-23');
    expect((tk as unknown as symbol).description).toBe('desc-token-23');
  });
  it('token-desc-24: token description matches name', () => {
    const tk = createToken<string>('desc-token-24');
    expect((tk as unknown as symbol).description).toBe('desc-token-24');
  });
  it('token-desc-25: token description matches name', () => {
    const tk = createToken<string>('desc-token-25');
    expect((tk as unknown as symbol).description).toBe('desc-token-25');
  });
});

describe('register + resolve', () => {
  it('reg-num-1: resolves number value 7', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-1');
    c.register(tk, () => 7);
    expect(c.resolve(tk)).toBe(7);
  });
  it('reg-num-2: resolves number value 14', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-2');
    c.register(tk, () => 14);
    expect(c.resolve(tk)).toBe(14);
  });
  it('reg-num-3: resolves number value 21', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-3');
    c.register(tk, () => 21);
    expect(c.resolve(tk)).toBe(21);
  });
  it('reg-num-4: resolves number value 28', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-4');
    c.register(tk, () => 28);
    expect(c.resolve(tk)).toBe(28);
  });
  it('reg-num-5: resolves number value 35', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-5');
    c.register(tk, () => 35);
    expect(c.resolve(tk)).toBe(35);
  });
  it('reg-num-6: resolves number value 42', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-6');
    c.register(tk, () => 42);
    expect(c.resolve(tk)).toBe(42);
  });
  it('reg-num-7: resolves number value 49', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-7');
    c.register(tk, () => 49);
    expect(c.resolve(tk)).toBe(49);
  });
  it('reg-num-8: resolves number value 56', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-8');
    c.register(tk, () => 56);
    expect(c.resolve(tk)).toBe(56);
  });
  it('reg-num-9: resolves number value 63', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-9');
    c.register(tk, () => 63);
    expect(c.resolve(tk)).toBe(63);
  });
  it('reg-num-10: resolves number value 70', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-10');
    c.register(tk, () => 70);
    expect(c.resolve(tk)).toBe(70);
  });
  it('reg-num-11: resolves number value 77', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-11');
    c.register(tk, () => 77);
    expect(c.resolve(tk)).toBe(77);
  });
  it('reg-num-12: resolves number value 84', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-12');
    c.register(tk, () => 84);
    expect(c.resolve(tk)).toBe(84);
  });
  it('reg-num-13: resolves number value 91', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-13');
    c.register(tk, () => 91);
    expect(c.resolve(tk)).toBe(91);
  });
  it('reg-num-14: resolves number value 98', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-14');
    c.register(tk, () => 98);
    expect(c.resolve(tk)).toBe(98);
  });
  it('reg-num-15: resolves number value 105', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-15');
    c.register(tk, () => 105);
    expect(c.resolve(tk)).toBe(105);
  });
  it('reg-num-16: resolves number value 112', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-16');
    c.register(tk, () => 112);
    expect(c.resolve(tk)).toBe(112);
  });
  it('reg-num-17: resolves number value 119', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-17');
    c.register(tk, () => 119);
    expect(c.resolve(tk)).toBe(119);
  });
  it('reg-num-18: resolves number value 126', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-18');
    c.register(tk, () => 126);
    expect(c.resolve(tk)).toBe(126);
  });
  it('reg-num-19: resolves number value 133', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-19');
    c.register(tk, () => 133);
    expect(c.resolve(tk)).toBe(133);
  });
  it('reg-num-20: resolves number value 140', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-20');
    c.register(tk, () => 140);
    expect(c.resolve(tk)).toBe(140);
  });
  it('reg-num-21: resolves number value 147', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-21');
    c.register(tk, () => 147);
    expect(c.resolve(tk)).toBe(147);
  });
  it('reg-num-22: resolves number value 154', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-22');
    c.register(tk, () => 154);
    expect(c.resolve(tk)).toBe(154);
  });
  it('reg-num-23: resolves number value 161', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-23');
    c.register(tk, () => 161);
    expect(c.resolve(tk)).toBe(161);
  });
  it('reg-num-24: resolves number value 168', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-24');
    c.register(tk, () => 168);
    expect(c.resolve(tk)).toBe(168);
  });
  it('reg-num-25: resolves number value 175', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-25');
    c.register(tk, () => 175);
    expect(c.resolve(tk)).toBe(175);
  });
  it('reg-num-26: resolves number value 182', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-26');
    c.register(tk, () => 182);
    expect(c.resolve(tk)).toBe(182);
  });
  it('reg-num-27: resolves number value 189', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-27');
    c.register(tk, () => 189);
    expect(c.resolve(tk)).toBe(189);
  });
  it('reg-num-28: resolves number value 196', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-28');
    c.register(tk, () => 196);
    expect(c.resolve(tk)).toBe(196);
  });
  it('reg-num-29: resolves number value 203', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-29');
    c.register(tk, () => 203);
    expect(c.resolve(tk)).toBe(203);
  });
  it('reg-num-30: resolves number value 210', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-30');
    c.register(tk, () => 210);
    expect(c.resolve(tk)).toBe(210);
  });
  it('reg-num-31: resolves number value 217', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-31');
    c.register(tk, () => 217);
    expect(c.resolve(tk)).toBe(217);
  });
  it('reg-num-32: resolves number value 224', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-32');
    c.register(tk, () => 224);
    expect(c.resolve(tk)).toBe(224);
  });
  it('reg-num-33: resolves number value 231', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-33');
    c.register(tk, () => 231);
    expect(c.resolve(tk)).toBe(231);
  });
  it('reg-num-34: resolves number value 238', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-34');
    c.register(tk, () => 238);
    expect(c.resolve(tk)).toBe(238);
  });
  it('reg-num-35: resolves number value 245', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-35');
    c.register(tk, () => 245);
    expect(c.resolve(tk)).toBe(245);
  });
  it('reg-num-36: resolves number value 252', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-36');
    c.register(tk, () => 252);
    expect(c.resolve(tk)).toBe(252);
  });
  it('reg-num-37: resolves number value 259', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-37');
    c.register(tk, () => 259);
    expect(c.resolve(tk)).toBe(259);
  });
  it('reg-num-38: resolves number value 266', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-38');
    c.register(tk, () => 266);
    expect(c.resolve(tk)).toBe(266);
  });
  it('reg-num-39: resolves number value 273', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-39');
    c.register(tk, () => 273);
    expect(c.resolve(tk)).toBe(273);
  });
  it('reg-num-40: resolves number value 280', () => {
    const c = freshContainer();
    const tk = createToken<number>('num-40');
    c.register(tk, () => 280);
    expect(c.resolve(tk)).toBe(280);
  });
  it('reg-str-1: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-1');
    c.register(tk, () => 'hello-1');
    expect(c.resolve(tk)).toBe('hello-1');
  });
  it('reg-str-2: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-2');
    c.register(tk, () => 'hello-2');
    expect(c.resolve(tk)).toBe('hello-2');
  });
  it('reg-str-3: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-3');
    c.register(tk, () => 'hello-3');
    expect(c.resolve(tk)).toBe('hello-3');
  });
  it('reg-str-4: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-4');
    c.register(tk, () => 'hello-4');
    expect(c.resolve(tk)).toBe('hello-4');
  });
  it('reg-str-5: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-5');
    c.register(tk, () => 'hello-5');
    expect(c.resolve(tk)).toBe('hello-5');
  });
  it('reg-str-6: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-6');
    c.register(tk, () => 'hello-6');
    expect(c.resolve(tk)).toBe('hello-6');
  });
  it('reg-str-7: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-7');
    c.register(tk, () => 'hello-7');
    expect(c.resolve(tk)).toBe('hello-7');
  });
  it('reg-str-8: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-8');
    c.register(tk, () => 'hello-8');
    expect(c.resolve(tk)).toBe('hello-8');
  });
  it('reg-str-9: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-9');
    c.register(tk, () => 'hello-9');
    expect(c.resolve(tk)).toBe('hello-9');
  });
  it('reg-str-10: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-10');
    c.register(tk, () => 'hello-10');
    expect(c.resolve(tk)).toBe('hello-10');
  });
  it('reg-str-11: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-11');
    c.register(tk, () => 'hello-11');
    expect(c.resolve(tk)).toBe('hello-11');
  });
  it('reg-str-12: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-12');
    c.register(tk, () => 'hello-12');
    expect(c.resolve(tk)).toBe('hello-12');
  });
  it('reg-str-13: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-13');
    c.register(tk, () => 'hello-13');
    expect(c.resolve(tk)).toBe('hello-13');
  });
  it('reg-str-14: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-14');
    c.register(tk, () => 'hello-14');
    expect(c.resolve(tk)).toBe('hello-14');
  });
  it('reg-str-15: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-15');
    c.register(tk, () => 'hello-15');
    expect(c.resolve(tk)).toBe('hello-15');
  });
  it('reg-str-16: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-16');
    c.register(tk, () => 'hello-16');
    expect(c.resolve(tk)).toBe('hello-16');
  });
  it('reg-str-17: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-17');
    c.register(tk, () => 'hello-17');
    expect(c.resolve(tk)).toBe('hello-17');
  });
  it('reg-str-18: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-18');
    c.register(tk, () => 'hello-18');
    expect(c.resolve(tk)).toBe('hello-18');
  });
  it('reg-str-19: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-19');
    c.register(tk, () => 'hello-19');
    expect(c.resolve(tk)).toBe('hello-19');
  });
  it('reg-str-20: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-20');
    c.register(tk, () => 'hello-20');
    expect(c.resolve(tk)).toBe('hello-20');
  });
  it('reg-str-21: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-21');
    c.register(tk, () => 'hello-21');
    expect(c.resolve(tk)).toBe('hello-21');
  });
  it('reg-str-22: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-22');
    c.register(tk, () => 'hello-22');
    expect(c.resolve(tk)).toBe('hello-22');
  });
  it('reg-str-23: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-23');
    c.register(tk, () => 'hello-23');
    expect(c.resolve(tk)).toBe('hello-23');
  });
  it('reg-str-24: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-24');
    c.register(tk, () => 'hello-24');
    expect(c.resolve(tk)).toBe('hello-24');
  });
  it('reg-str-25: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-25');
    c.register(tk, () => 'hello-25');
    expect(c.resolve(tk)).toBe('hello-25');
  });
  it('reg-str-26: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-26');
    c.register(tk, () => 'hello-26');
    expect(c.resolve(tk)).toBe('hello-26');
  });
  it('reg-str-27: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-27');
    c.register(tk, () => 'hello-27');
    expect(c.resolve(tk)).toBe('hello-27');
  });
  it('reg-str-28: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-28');
    c.register(tk, () => 'hello-28');
    expect(c.resolve(tk)).toBe('hello-28');
  });
  it('reg-str-29: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-29');
    c.register(tk, () => 'hello-29');
    expect(c.resolve(tk)).toBe('hello-29');
  });
  it('reg-str-30: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-30');
    c.register(tk, () => 'hello-30');
    expect(c.resolve(tk)).toBe('hello-30');
  });
  it('reg-str-31: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-31');
    c.register(tk, () => 'hello-31');
    expect(c.resolve(tk)).toBe('hello-31');
  });
  it('reg-str-32: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-32');
    c.register(tk, () => 'hello-32');
    expect(c.resolve(tk)).toBe('hello-32');
  });
  it('reg-str-33: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-33');
    c.register(tk, () => 'hello-33');
    expect(c.resolve(tk)).toBe('hello-33');
  });
  it('reg-str-34: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-34');
    c.register(tk, () => 'hello-34');
    expect(c.resolve(tk)).toBe('hello-34');
  });
  it('reg-str-35: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-35');
    c.register(tk, () => 'hello-35');
    expect(c.resolve(tk)).toBe('hello-35');
  });
  it('reg-str-36: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-36');
    c.register(tk, () => 'hello-36');
    expect(c.resolve(tk)).toBe('hello-36');
  });
  it('reg-str-37: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-37');
    c.register(tk, () => 'hello-37');
    expect(c.resolve(tk)).toBe('hello-37');
  });
  it('reg-str-38: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-38');
    c.register(tk, () => 'hello-38');
    expect(c.resolve(tk)).toBe('hello-38');
  });
  it('reg-str-39: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-39');
    c.register(tk, () => 'hello-39');
    expect(c.resolve(tk)).toBe('hello-39');
  });
  it('reg-str-40: resolves string value', () => {
    const c = freshContainer();
    const tk = createToken<string>('str-40');
    c.register(tk, () => 'hello-40');
    expect(c.resolve(tk)).toBe('hello-40');
  });
  it('reg-bool-1: resolves boolean value false', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-1');
    c.register(tk, () => false);
    expect(c.resolve(tk)).toBe(false);
  });
  it('reg-bool-2: resolves boolean value true', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-2');
    c.register(tk, () => true);
    expect(c.resolve(tk)).toBe(true);
  });
  it('reg-bool-3: resolves boolean value false', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-3');
    c.register(tk, () => false);
    expect(c.resolve(tk)).toBe(false);
  });
  it('reg-bool-4: resolves boolean value true', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-4');
    c.register(tk, () => true);
    expect(c.resolve(tk)).toBe(true);
  });
  it('reg-bool-5: resolves boolean value false', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-5');
    c.register(tk, () => false);
    expect(c.resolve(tk)).toBe(false);
  });
  it('reg-bool-6: resolves boolean value true', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-6');
    c.register(tk, () => true);
    expect(c.resolve(tk)).toBe(true);
  });
  it('reg-bool-7: resolves boolean value false', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-7');
    c.register(tk, () => false);
    expect(c.resolve(tk)).toBe(false);
  });
  it('reg-bool-8: resolves boolean value true', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-8');
    c.register(tk, () => true);
    expect(c.resolve(tk)).toBe(true);
  });
  it('reg-bool-9: resolves boolean value false', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-9');
    c.register(tk, () => false);
    expect(c.resolve(tk)).toBe(false);
  });
  it('reg-bool-10: resolves boolean value true', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-10');
    c.register(tk, () => true);
    expect(c.resolve(tk)).toBe(true);
  });
  it('reg-bool-11: resolves boolean value false', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-11');
    c.register(tk, () => false);
    expect(c.resolve(tk)).toBe(false);
  });
  it('reg-bool-12: resolves boolean value true', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-12');
    c.register(tk, () => true);
    expect(c.resolve(tk)).toBe(true);
  });
  it('reg-bool-13: resolves boolean value false', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-13');
    c.register(tk, () => false);
    expect(c.resolve(tk)).toBe(false);
  });
  it('reg-bool-14: resolves boolean value true', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-14');
    c.register(tk, () => true);
    expect(c.resolve(tk)).toBe(true);
  });
  it('reg-bool-15: resolves boolean value false', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-15');
    c.register(tk, () => false);
    expect(c.resolve(tk)).toBe(false);
  });
  it('reg-bool-16: resolves boolean value true', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-16');
    c.register(tk, () => true);
    expect(c.resolve(tk)).toBe(true);
  });
  it('reg-bool-17: resolves boolean value false', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-17');
    c.register(tk, () => false);
    expect(c.resolve(tk)).toBe(false);
  });
  it('reg-bool-18: resolves boolean value true', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-18');
    c.register(tk, () => true);
    expect(c.resolve(tk)).toBe(true);
  });
  it('reg-bool-19: resolves boolean value false', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-19');
    c.register(tk, () => false);
    expect(c.resolve(tk)).toBe(false);
  });
  it('reg-bool-20: resolves boolean value true', () => {
    const c = freshContainer();
    const tk = createToken<boolean>('bool-20');
    c.register(tk, () => true);
    expect(c.resolve(tk)).toBe(true);
  });
  it('reg-obj-1: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-1');
    c.register(tk, () => ({ id: 1 }));
    expect(c.resolve(tk)).toEqual({ id: 1 });
  });
  it('reg-obj-2: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-2');
    c.register(tk, () => ({ id: 2 }));
    expect(c.resolve(tk)).toEqual({ id: 2 });
  });
  it('reg-obj-3: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-3');
    c.register(tk, () => ({ id: 3 }));
    expect(c.resolve(tk)).toEqual({ id: 3 });
  });
  it('reg-obj-4: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-4');
    c.register(tk, () => ({ id: 4 }));
    expect(c.resolve(tk)).toEqual({ id: 4 });
  });
  it('reg-obj-5: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-5');
    c.register(tk, () => ({ id: 5 }));
    expect(c.resolve(tk)).toEqual({ id: 5 });
  });
  it('reg-obj-6: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-6');
    c.register(tk, () => ({ id: 6 }));
    expect(c.resolve(tk)).toEqual({ id: 6 });
  });
  it('reg-obj-7: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-7');
    c.register(tk, () => ({ id: 7 }));
    expect(c.resolve(tk)).toEqual({ id: 7 });
  });
  it('reg-obj-8: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-8');
    c.register(tk, () => ({ id: 8 }));
    expect(c.resolve(tk)).toEqual({ id: 8 });
  });
  it('reg-obj-9: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-9');
    c.register(tk, () => ({ id: 9 }));
    expect(c.resolve(tk)).toEqual({ id: 9 });
  });
  it('reg-obj-10: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-10');
    c.register(tk, () => ({ id: 10 }));
    expect(c.resolve(tk)).toEqual({ id: 10 });
  });
  it('reg-obj-11: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-11');
    c.register(tk, () => ({ id: 11 }));
    expect(c.resolve(tk)).toEqual({ id: 11 });
  });
  it('reg-obj-12: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-12');
    c.register(tk, () => ({ id: 12 }));
    expect(c.resolve(tk)).toEqual({ id: 12 });
  });
  it('reg-obj-13: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-13');
    c.register(tk, () => ({ id: 13 }));
    expect(c.resolve(tk)).toEqual({ id: 13 });
  });
  it('reg-obj-14: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-14');
    c.register(tk, () => ({ id: 14 }));
    expect(c.resolve(tk)).toEqual({ id: 14 });
  });
  it('reg-obj-15: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-15');
    c.register(tk, () => ({ id: 15 }));
    expect(c.resolve(tk)).toEqual({ id: 15 });
  });
  it('reg-obj-16: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-16');
    c.register(tk, () => ({ id: 16 }));
    expect(c.resolve(tk)).toEqual({ id: 16 });
  });
  it('reg-obj-17: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-17');
    c.register(tk, () => ({ id: 17 }));
    expect(c.resolve(tk)).toEqual({ id: 17 });
  });
  it('reg-obj-18: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-18');
    c.register(tk, () => ({ id: 18 }));
    expect(c.resolve(tk)).toEqual({ id: 18 });
  });
  it('reg-obj-19: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-19');
    c.register(tk, () => ({ id: 19 }));
    expect(c.resolve(tk)).toEqual({ id: 19 });
  });
  it('reg-obj-20: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-20');
    c.register(tk, () => ({ id: 20 }));
    expect(c.resolve(tk)).toEqual({ id: 20 });
  });
  it('reg-obj-21: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-21');
    c.register(tk, () => ({ id: 21 }));
    expect(c.resolve(tk)).toEqual({ id: 21 });
  });
  it('reg-obj-22: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-22');
    c.register(tk, () => ({ id: 22 }));
    expect(c.resolve(tk)).toEqual({ id: 22 });
  });
  it('reg-obj-23: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-23');
    c.register(tk, () => ({ id: 23 }));
    expect(c.resolve(tk)).toEqual({ id: 23 });
  });
  it('reg-obj-24: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-24');
    c.register(tk, () => ({ id: 24 }));
    expect(c.resolve(tk)).toEqual({ id: 24 });
  });
  it('reg-obj-25: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-25');
    c.register(tk, () => ({ id: 25 }));
    expect(c.resolve(tk)).toEqual({ id: 25 });
  });
  it('reg-obj-26: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-26');
    c.register(tk, () => ({ id: 26 }));
    expect(c.resolve(tk)).toEqual({ id: 26 });
  });
  it('reg-obj-27: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-27');
    c.register(tk, () => ({ id: 27 }));
    expect(c.resolve(tk)).toEqual({ id: 27 });
  });
  it('reg-obj-28: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-28');
    c.register(tk, () => ({ id: 28 }));
    expect(c.resolve(tk)).toEqual({ id: 28 });
  });
  it('reg-obj-29: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-29');
    c.register(tk, () => ({ id: 29 }));
    expect(c.resolve(tk)).toEqual({ id: 29 });
  });
  it('reg-obj-30: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-30');
    c.register(tk, () => ({ id: 30 }));
    expect(c.resolve(tk)).toEqual({ id: 30 });
  });
  it('reg-obj-31: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-31');
    c.register(tk, () => ({ id: 31 }));
    expect(c.resolve(tk)).toEqual({ id: 31 });
  });
  it('reg-obj-32: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-32');
    c.register(tk, () => ({ id: 32 }));
    expect(c.resolve(tk)).toEqual({ id: 32 });
  });
  it('reg-obj-33: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-33');
    c.register(tk, () => ({ id: 33 }));
    expect(c.resolve(tk)).toEqual({ id: 33 });
  });
  it('reg-obj-34: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-34');
    c.register(tk, () => ({ id: 34 }));
    expect(c.resolve(tk)).toEqual({ id: 34 });
  });
  it('reg-obj-35: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-35');
    c.register(tk, () => ({ id: 35 }));
    expect(c.resolve(tk)).toEqual({ id: 35 });
  });
  it('reg-obj-36: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-36');
    c.register(tk, () => ({ id: 36 }));
    expect(c.resolve(tk)).toEqual({ id: 36 });
  });
  it('reg-obj-37: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-37');
    c.register(tk, () => ({ id: 37 }));
    expect(c.resolve(tk)).toEqual({ id: 37 });
  });
  it('reg-obj-38: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-38');
    c.register(tk, () => ({ id: 38 }));
    expect(c.resolve(tk)).toEqual({ id: 38 });
  });
  it('reg-obj-39: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-39');
    c.register(tk, () => ({ id: 39 }));
    expect(c.resolve(tk)).toEqual({ id: 39 });
  });
  it('reg-obj-40: resolves object value', () => {
    const c = freshContainer();
    const tk = createToken<{ id: number }>('obj-40');
    c.register(tk, () => ({ id: 40 }));
    expect(c.resolve(tk)).toEqual({ id: 40 });
  });
  it('reg-transient-1: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-1');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-2: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-2');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-3: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-3');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-4: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-4');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-5: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-5');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-6: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-6');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-7: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-7');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-8: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-8');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-9: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-9');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-10: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-10');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-11: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-11');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-12: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-12');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-13: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-13');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-14: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-14');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-15: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-15');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-16: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-16');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-17: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-17');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-18: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-18');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-19: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-19');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-20: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-20');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-21: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-21');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-22: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-22');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-23: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-23');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-24: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-24');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-25: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-25');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-26: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-26');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-27: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-27');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-28: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-28');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-29: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-29');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-transient-30: factory called each resolve (transient)', () => {
    const c = freshContainer();
    const tk = createToken<object>('transient-30');
    c.register(tk, () => ({ ts: Date.now() }));
    const r1 = c.resolve(tk);
    const r2 = c.resolve(tk);
    expect(r1).not.toBe(r2);
  });
  it('reg-overwrite-1: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-1');
    c.register(tk, () => 1);
    c.register(tk, () => 100);
    expect(c.resolve(tk)).toBe(100);
  });
  it('reg-overwrite-2: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-2');
    c.register(tk, () => 2);
    c.register(tk, () => 200);
    expect(c.resolve(tk)).toBe(200);
  });
  it('reg-overwrite-3: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-3');
    c.register(tk, () => 3);
    c.register(tk, () => 300);
    expect(c.resolve(tk)).toBe(300);
  });
  it('reg-overwrite-4: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-4');
    c.register(tk, () => 4);
    c.register(tk, () => 400);
    expect(c.resolve(tk)).toBe(400);
  });
  it('reg-overwrite-5: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-5');
    c.register(tk, () => 5);
    c.register(tk, () => 500);
    expect(c.resolve(tk)).toBe(500);
  });
  it('reg-overwrite-6: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-6');
    c.register(tk, () => 6);
    c.register(tk, () => 600);
    expect(c.resolve(tk)).toBe(600);
  });
  it('reg-overwrite-7: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-7');
    c.register(tk, () => 7);
    c.register(tk, () => 700);
    expect(c.resolve(tk)).toBe(700);
  });
  it('reg-overwrite-8: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-8');
    c.register(tk, () => 8);
    c.register(tk, () => 800);
    expect(c.resolve(tk)).toBe(800);
  });
  it('reg-overwrite-9: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-9');
    c.register(tk, () => 9);
    c.register(tk, () => 900);
    expect(c.resolve(tk)).toBe(900);
  });
  it('reg-overwrite-10: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-10');
    c.register(tk, () => 10);
    c.register(tk, () => 1000);
    expect(c.resolve(tk)).toBe(1000);
  });
  it('reg-overwrite-11: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-11');
    c.register(tk, () => 11);
    c.register(tk, () => 1100);
    expect(c.resolve(tk)).toBe(1100);
  });
  it('reg-overwrite-12: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-12');
    c.register(tk, () => 12);
    c.register(tk, () => 1200);
    expect(c.resolve(tk)).toBe(1200);
  });
  it('reg-overwrite-13: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-13');
    c.register(tk, () => 13);
    c.register(tk, () => 1300);
    expect(c.resolve(tk)).toBe(1300);
  });
  it('reg-overwrite-14: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-14');
    c.register(tk, () => 14);
    c.register(tk, () => 1400);
    expect(c.resolve(tk)).toBe(1400);
  });
  it('reg-overwrite-15: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-15');
    c.register(tk, () => 15);
    c.register(tk, () => 1500);
    expect(c.resolve(tk)).toBe(1500);
  });
  it('reg-overwrite-16: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-16');
    c.register(tk, () => 16);
    c.register(tk, () => 1600);
    expect(c.resolve(tk)).toBe(1600);
  });
  it('reg-overwrite-17: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-17');
    c.register(tk, () => 17);
    c.register(tk, () => 1700);
    expect(c.resolve(tk)).toBe(1700);
  });
  it('reg-overwrite-18: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-18');
    c.register(tk, () => 18);
    c.register(tk, () => 1800);
    expect(c.resolve(tk)).toBe(1800);
  });
  it('reg-overwrite-19: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-19');
    c.register(tk, () => 19);
    c.register(tk, () => 1900);
    expect(c.resolve(tk)).toBe(1900);
  });
  it('reg-overwrite-20: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-20');
    c.register(tk, () => 20);
    c.register(tk, () => 2000);
    expect(c.resolve(tk)).toBe(2000);
  });
  it('reg-overwrite-21: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-21');
    c.register(tk, () => 21);
    c.register(tk, () => 2100);
    expect(c.resolve(tk)).toBe(2100);
  });
  it('reg-overwrite-22: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-22');
    c.register(tk, () => 22);
    c.register(tk, () => 2200);
    expect(c.resolve(tk)).toBe(2200);
  });
  it('reg-overwrite-23: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-23');
    c.register(tk, () => 23);
    c.register(tk, () => 2300);
    expect(c.resolve(tk)).toBe(2300);
  });
  it('reg-overwrite-24: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-24');
    c.register(tk, () => 24);
    c.register(tk, () => 2400);
    expect(c.resolve(tk)).toBe(2400);
  });
  it('reg-overwrite-25: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-25');
    c.register(tk, () => 25);
    c.register(tk, () => 2500);
    expect(c.resolve(tk)).toBe(2500);
  });
  it('reg-overwrite-26: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-26');
    c.register(tk, () => 26);
    c.register(tk, () => 2600);
    expect(c.resolve(tk)).toBe(2600);
  });
  it('reg-overwrite-27: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-27');
    c.register(tk, () => 27);
    c.register(tk, () => 2700);
    expect(c.resolve(tk)).toBe(2700);
  });
  it('reg-overwrite-28: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-28');
    c.register(tk, () => 28);
    c.register(tk, () => 2800);
    expect(c.resolve(tk)).toBe(2800);
  });
  it('reg-overwrite-29: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-29');
    c.register(tk, () => 29);
    c.register(tk, () => 2900);
    expect(c.resolve(tk)).toBe(2900);
  });
  it('reg-overwrite-30: second register overwrites first', () => {
    const c = freshContainer();
    const tk = createToken<number>('overwrite-30');
    c.register(tk, () => 30);
    c.register(tk, () => 3000);
    expect(c.resolve(tk)).toBe(3000);
  });
});

describe('registerSingleton', () => {
  it('singleton-same-1: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-1');
    c.registerSingleton(tk, () => ({ id: 1 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-2: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-2');
    c.registerSingleton(tk, () => ({ id: 2 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-3: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-3');
    c.registerSingleton(tk, () => ({ id: 3 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-4: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-4');
    c.registerSingleton(tk, () => ({ id: 4 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-5: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-5');
    c.registerSingleton(tk, () => ({ id: 5 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-6: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-6');
    c.registerSingleton(tk, () => ({ id: 6 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-7: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-7');
    c.registerSingleton(tk, () => ({ id: 7 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-8: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-8');
    c.registerSingleton(tk, () => ({ id: 8 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-9: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-9');
    c.registerSingleton(tk, () => ({ id: 9 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-10: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-10');
    c.registerSingleton(tk, () => ({ id: 10 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-11: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-11');
    c.registerSingleton(tk, () => ({ id: 11 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-12: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-12');
    c.registerSingleton(tk, () => ({ id: 12 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-13: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-13');
    c.registerSingleton(tk, () => ({ id: 13 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-14: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-14');
    c.registerSingleton(tk, () => ({ id: 14 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-15: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-15');
    c.registerSingleton(tk, () => ({ id: 15 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-16: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-16');
    c.registerSingleton(tk, () => ({ id: 16 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-17: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-17');
    c.registerSingleton(tk, () => ({ id: 17 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-18: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-18');
    c.registerSingleton(tk, () => ({ id: 18 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-19: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-19');
    c.registerSingleton(tk, () => ({ id: 19 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-20: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-20');
    c.registerSingleton(tk, () => ({ id: 20 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-21: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-21');
    c.registerSingleton(tk, () => ({ id: 21 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-22: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-22');
    c.registerSingleton(tk, () => ({ id: 22 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-23: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-23');
    c.registerSingleton(tk, () => ({ id: 23 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-24: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-24');
    c.registerSingleton(tk, () => ({ id: 24 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-25: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-25');
    c.registerSingleton(tk, () => ({ id: 25 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-26: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-26');
    c.registerSingleton(tk, () => ({ id: 26 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-27: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-27');
    c.registerSingleton(tk, () => ({ id: 27 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-28: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-28');
    c.registerSingleton(tk, () => ({ id: 28 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-29: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-29');
    c.registerSingleton(tk, () => ({ id: 29 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-30: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-30');
    c.registerSingleton(tk, () => ({ id: 30 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-31: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-31');
    c.registerSingleton(tk, () => ({ id: 31 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-32: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-32');
    c.registerSingleton(tk, () => ({ id: 32 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-33: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-33');
    c.registerSingleton(tk, () => ({ id: 33 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-34: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-34');
    c.registerSingleton(tk, () => ({ id: 34 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-35: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-35');
    c.registerSingleton(tk, () => ({ id: 35 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-36: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-36');
    c.registerSingleton(tk, () => ({ id: 36 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-37: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-37');
    c.registerSingleton(tk, () => ({ id: 37 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-38: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-38');
    c.registerSingleton(tk, () => ({ id: 38 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-39: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-39');
    c.registerSingleton(tk, () => ({ id: 39 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-40: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-40');
    c.registerSingleton(tk, () => ({ id: 40 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-41: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-41');
    c.registerSingleton(tk, () => ({ id: 41 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-42: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-42');
    c.registerSingleton(tk, () => ({ id: 42 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-43: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-43');
    c.registerSingleton(tk, () => ({ id: 43 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-44: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-44');
    c.registerSingleton(tk, () => ({ id: 44 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-45: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-45');
    c.registerSingleton(tk, () => ({ id: 45 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-46: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-46');
    c.registerSingleton(tk, () => ({ id: 46 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-47: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-47');
    c.registerSingleton(tk, () => ({ id: 47 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-48: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-48');
    c.registerSingleton(tk, () => ({ id: 48 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-49: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-49');
    c.registerSingleton(tk, () => ({ id: 49 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-50: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-50');
    c.registerSingleton(tk, () => ({ id: 50 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-51: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-51');
    c.registerSingleton(tk, () => ({ id: 51 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-52: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-52');
    c.registerSingleton(tk, () => ({ id: 52 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-53: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-53');
    c.registerSingleton(tk, () => ({ id: 53 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-54: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-54');
    c.registerSingleton(tk, () => ({ id: 54 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-55: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-55');
    c.registerSingleton(tk, () => ({ id: 55 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-56: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-56');
    c.registerSingleton(tk, () => ({ id: 56 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-57: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-57');
    c.registerSingleton(tk, () => ({ id: 57 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-58: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-58');
    c.registerSingleton(tk, () => ({ id: 58 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-59: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-59');
    c.registerSingleton(tk, () => ({ id: 59 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-60: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-60');
    c.registerSingleton(tk, () => ({ id: 60 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-61: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-61');
    c.registerSingleton(tk, () => ({ id: 61 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-62: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-62');
    c.registerSingleton(tk, () => ({ id: 62 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-63: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-63');
    c.registerSingleton(tk, () => ({ id: 63 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-64: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-64');
    c.registerSingleton(tk, () => ({ id: 64 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-65: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-65');
    c.registerSingleton(tk, () => ({ id: 65 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-66: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-66');
    c.registerSingleton(tk, () => ({ id: 66 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-67: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-67');
    c.registerSingleton(tk, () => ({ id: 67 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-68: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-68');
    c.registerSingleton(tk, () => ({ id: 68 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-69: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-69');
    c.registerSingleton(tk, () => ({ id: 69 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-70: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-70');
    c.registerSingleton(tk, () => ({ id: 70 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-71: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-71');
    c.registerSingleton(tk, () => ({ id: 71 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-72: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-72');
    c.registerSingleton(tk, () => ({ id: 72 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-73: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-73');
    c.registerSingleton(tk, () => ({ id: 73 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-74: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-74');
    c.registerSingleton(tk, () => ({ id: 74 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-75: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-75');
    c.registerSingleton(tk, () => ({ id: 75 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-76: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-76');
    c.registerSingleton(tk, () => ({ id: 76 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-77: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-77');
    c.registerSingleton(tk, () => ({ id: 77 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-78: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-78');
    c.registerSingleton(tk, () => ({ id: 78 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-79: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-79');
    c.registerSingleton(tk, () => ({ id: 79 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-same-80: same instance returned each time', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-80');
    c.registerSingleton(tk, () => ({ id: 80 }));
    const a = c.resolve(tk);
    const b = c.resolve(tk);
    expect(a).toBe(b);
  });
  it('singleton-once-1: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-1');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 1; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-2: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-2');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 2; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-3: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-3');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 3; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-4: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-4');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 4; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-5: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-5');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 5; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-6: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-6');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 6; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-7: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-7');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 7; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-8: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-8');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 8; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-9: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-9');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 9; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-10: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-10');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 10; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-11: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-11');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 11; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-12: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-12');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 12; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-13: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-13');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 13; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-14: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-14');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 14; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-15: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-15');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 15; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-16: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-16');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 16; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-17: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-17');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 17; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-18: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-18');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 18; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-19: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-19');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 19; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-20: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-20');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 20; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-21: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-21');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 21; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-22: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-22');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 22; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-23: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-23');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 23; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-24: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-24');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 24; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-25: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-25');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 25; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-26: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-26');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 26; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-27: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-27');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 27; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-28: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-28');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 28; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-29: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-29');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 29; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-30: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-30');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 30; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-31: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-31');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 31; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-32: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-32');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 32; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-33: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-33');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 33; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-34: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-34');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 34; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-35: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-35');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 35; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-36: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-36');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 36; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-37: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-37');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 37; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-38: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-38');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 38; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-39: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-39');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 39; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-40: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-40');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 40; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-41: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-41');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 41; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-42: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-42');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 42; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-43: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-43');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 43; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-44: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-44');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 44; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-45: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-45');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 45; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-46: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-46');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 46; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-47: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-47');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 47; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-48: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-48');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 48; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-49: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-49');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 49; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-once-50: factory called exactly once', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-once-50');
    let count = 0;
    c.registerSingleton(tk, () => { count++; return 50; });
    c.resolve(tk);
    c.resolve(tk);
    c.resolve(tk);
    expect(count).toBe(1);
  });
  it('singleton-val-1: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-1');
    c.registerSingleton(tk, () => 3);
    expect(c.resolve(tk)).toBe(3);
  });
  it('singleton-val-2: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-2');
    c.registerSingleton(tk, () => 6);
    expect(c.resolve(tk)).toBe(6);
  });
  it('singleton-val-3: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-3');
    c.registerSingleton(tk, () => 9);
    expect(c.resolve(tk)).toBe(9);
  });
  it('singleton-val-4: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-4');
    c.registerSingleton(tk, () => 12);
    expect(c.resolve(tk)).toBe(12);
  });
  it('singleton-val-5: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-5');
    c.registerSingleton(tk, () => 15);
    expect(c.resolve(tk)).toBe(15);
  });
  it('singleton-val-6: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-6');
    c.registerSingleton(tk, () => 18);
    expect(c.resolve(tk)).toBe(18);
  });
  it('singleton-val-7: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-7');
    c.registerSingleton(tk, () => 21);
    expect(c.resolve(tk)).toBe(21);
  });
  it('singleton-val-8: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-8');
    c.registerSingleton(tk, () => 24);
    expect(c.resolve(tk)).toBe(24);
  });
  it('singleton-val-9: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-9');
    c.registerSingleton(tk, () => 27);
    expect(c.resolve(tk)).toBe(27);
  });
  it('singleton-val-10: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-10');
    c.registerSingleton(tk, () => 30);
    expect(c.resolve(tk)).toBe(30);
  });
  it('singleton-val-11: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-11');
    c.registerSingleton(tk, () => 33);
    expect(c.resolve(tk)).toBe(33);
  });
  it('singleton-val-12: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-12');
    c.registerSingleton(tk, () => 36);
    expect(c.resolve(tk)).toBe(36);
  });
  it('singleton-val-13: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-13');
    c.registerSingleton(tk, () => 39);
    expect(c.resolve(tk)).toBe(39);
  });
  it('singleton-val-14: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-14');
    c.registerSingleton(tk, () => 42);
    expect(c.resolve(tk)).toBe(42);
  });
  it('singleton-val-15: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-15');
    c.registerSingleton(tk, () => 45);
    expect(c.resolve(tk)).toBe(45);
  });
  it('singleton-val-16: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-16');
    c.registerSingleton(tk, () => 48);
    expect(c.resolve(tk)).toBe(48);
  });
  it('singleton-val-17: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-17');
    c.registerSingleton(tk, () => 51);
    expect(c.resolve(tk)).toBe(51);
  });
  it('singleton-val-18: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-18');
    c.registerSingleton(tk, () => 54);
    expect(c.resolve(tk)).toBe(54);
  });
  it('singleton-val-19: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-19');
    c.registerSingleton(tk, () => 57);
    expect(c.resolve(tk)).toBe(57);
  });
  it('singleton-val-20: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-20');
    c.registerSingleton(tk, () => 60);
    expect(c.resolve(tk)).toBe(60);
  });
  it('singleton-val-21: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-21');
    c.registerSingleton(tk, () => 63);
    expect(c.resolve(tk)).toBe(63);
  });
  it('singleton-val-22: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-22');
    c.registerSingleton(tk, () => 66);
    expect(c.resolve(tk)).toBe(66);
  });
  it('singleton-val-23: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-23');
    c.registerSingleton(tk, () => 69);
    expect(c.resolve(tk)).toBe(69);
  });
  it('singleton-val-24: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-24');
    c.registerSingleton(tk, () => 72);
    expect(c.resolve(tk)).toBe(72);
  });
  it('singleton-val-25: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-25');
    c.registerSingleton(tk, () => 75);
    expect(c.resolve(tk)).toBe(75);
  });
  it('singleton-val-26: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-26');
    c.registerSingleton(tk, () => 78);
    expect(c.resolve(tk)).toBe(78);
  });
  it('singleton-val-27: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-27');
    c.registerSingleton(tk, () => 81);
    expect(c.resolve(tk)).toBe(81);
  });
  it('singleton-val-28: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-28');
    c.registerSingleton(tk, () => 84);
    expect(c.resolve(tk)).toBe(84);
  });
  it('singleton-val-29: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-29');
    c.registerSingleton(tk, () => 87);
    expect(c.resolve(tk)).toBe(87);
  });
  it('singleton-val-30: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-30');
    c.registerSingleton(tk, () => 90);
    expect(c.resolve(tk)).toBe(90);
  });
  it('singleton-val-31: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-31');
    c.registerSingleton(tk, () => 93);
    expect(c.resolve(tk)).toBe(93);
  });
  it('singleton-val-32: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-32');
    c.registerSingleton(tk, () => 96);
    expect(c.resolve(tk)).toBe(96);
  });
  it('singleton-val-33: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-33');
    c.registerSingleton(tk, () => 99);
    expect(c.resolve(tk)).toBe(99);
  });
  it('singleton-val-34: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-34');
    c.registerSingleton(tk, () => 102);
    expect(c.resolve(tk)).toBe(102);
  });
  it('singleton-val-35: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-35');
    c.registerSingleton(tk, () => 105);
    expect(c.resolve(tk)).toBe(105);
  });
  it('singleton-val-36: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-36');
    c.registerSingleton(tk, () => 108);
    expect(c.resolve(tk)).toBe(108);
  });
  it('singleton-val-37: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-37');
    c.registerSingleton(tk, () => 111);
    expect(c.resolve(tk)).toBe(111);
  });
  it('singleton-val-38: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-38');
    c.registerSingleton(tk, () => 114);
    expect(c.resolve(tk)).toBe(114);
  });
  it('singleton-val-39: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-39');
    c.registerSingleton(tk, () => 117);
    expect(c.resolve(tk)).toBe(117);
  });
  it('singleton-val-40: singleton resolves correct value', () => {
    const c = freshContainer();
    const tk = createToken<number>('sing-val-40');
    c.registerSingleton(tk, () => 120);
    expect(c.resolve(tk)).toBe(120);
  });
  it('singleton-overwrite-1: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-1');
    c.registerSingleton(tk, () => ({ v: 1 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 10 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(10);
  });
  it('singleton-overwrite-2: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-2');
    c.registerSingleton(tk, () => ({ v: 2 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 20 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(20);
  });
  it('singleton-overwrite-3: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-3');
    c.registerSingleton(tk, () => ({ v: 3 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 30 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(30);
  });
  it('singleton-overwrite-4: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-4');
    c.registerSingleton(tk, () => ({ v: 4 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 40 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(40);
  });
  it('singleton-overwrite-5: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-5');
    c.registerSingleton(tk, () => ({ v: 5 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 50 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(50);
  });
  it('singleton-overwrite-6: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-6');
    c.registerSingleton(tk, () => ({ v: 6 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 60 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(60);
  });
  it('singleton-overwrite-7: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-7');
    c.registerSingleton(tk, () => ({ v: 7 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 70 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(70);
  });
  it('singleton-overwrite-8: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-8');
    c.registerSingleton(tk, () => ({ v: 8 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 80 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(80);
  });
  it('singleton-overwrite-9: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-9');
    c.registerSingleton(tk, () => ({ v: 9 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 90 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(90);
  });
  it('singleton-overwrite-10: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-10');
    c.registerSingleton(tk, () => ({ v: 10 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 100 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(100);
  });
  it('singleton-overwrite-11: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-11');
    c.registerSingleton(tk, () => ({ v: 11 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 110 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(110);
  });
  it('singleton-overwrite-12: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-12');
    c.registerSingleton(tk, () => ({ v: 12 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 120 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(120);
  });
  it('singleton-overwrite-13: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-13');
    c.registerSingleton(tk, () => ({ v: 13 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 130 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(130);
  });
  it('singleton-overwrite-14: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-14');
    c.registerSingleton(tk, () => ({ v: 14 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 140 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(140);
  });
  it('singleton-overwrite-15: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-15');
    c.registerSingleton(tk, () => ({ v: 15 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 150 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(150);
  });
  it('singleton-overwrite-16: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-16');
    c.registerSingleton(tk, () => ({ v: 16 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 160 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(160);
  });
  it('singleton-overwrite-17: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-17');
    c.registerSingleton(tk, () => ({ v: 17 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 170 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(170);
  });
  it('singleton-overwrite-18: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-18');
    c.registerSingleton(tk, () => ({ v: 18 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 180 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(180);
  });
  it('singleton-overwrite-19: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-19');
    c.registerSingleton(tk, () => ({ v: 19 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 190 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(190);
  });
  it('singleton-overwrite-20: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-20');
    c.registerSingleton(tk, () => ({ v: 20 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 200 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(200);
  });
  it('singleton-overwrite-21: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-21');
    c.registerSingleton(tk, () => ({ v: 21 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 210 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(210);
  });
  it('singleton-overwrite-22: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-22');
    c.registerSingleton(tk, () => ({ v: 22 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 220 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(220);
  });
  it('singleton-overwrite-23: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-23');
    c.registerSingleton(tk, () => ({ v: 23 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 230 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(230);
  });
  it('singleton-overwrite-24: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-24');
    c.registerSingleton(tk, () => ({ v: 24 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 240 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(240);
  });
  it('singleton-overwrite-25: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-25');
    c.registerSingleton(tk, () => ({ v: 25 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 250 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(250);
  });
  it('singleton-overwrite-26: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-26');
    c.registerSingleton(tk, () => ({ v: 26 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 260 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(260);
  });
  it('singleton-overwrite-27: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-27');
    c.registerSingleton(tk, () => ({ v: 27 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 270 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(270);
  });
  it('singleton-overwrite-28: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-28');
    c.registerSingleton(tk, () => ({ v: 28 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 280 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(280);
  });
  it('singleton-overwrite-29: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-29');
    c.registerSingleton(tk, () => ({ v: 29 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 290 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(290);
  });
  it('singleton-overwrite-30: re-registering singleton resets instance', () => {
    const c = freshContainer();
    const tk = createToken<object>('sing-ow-30');
    c.registerSingleton(tk, () => ({ v: 30 }));
    const first = c.resolve(tk);
    c.registerSingleton(tk, () => ({ v: 300 }));
    const second = c.resolve(tk);
    expect(second).not.toBe(first);
    expect((second as { v: number }).v).toBe(300);
  });
});

describe('registerValue', () => {
  it('val-num-1: resolves registered number 11', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-1');
    c.registerValue(tk, 11);
    expect(c.resolve(tk)).toBe(11);
  });
  it('val-num-2: resolves registered number 22', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-2');
    c.registerValue(tk, 22);
    expect(c.resolve(tk)).toBe(22);
  });
  it('val-num-3: resolves registered number 33', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-3');
    c.registerValue(tk, 33);
    expect(c.resolve(tk)).toBe(33);
  });
  it('val-num-4: resolves registered number 44', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-4');
    c.registerValue(tk, 44);
    expect(c.resolve(tk)).toBe(44);
  });
  it('val-num-5: resolves registered number 55', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-5');
    c.registerValue(tk, 55);
    expect(c.resolve(tk)).toBe(55);
  });
  it('val-num-6: resolves registered number 66', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-6');
    c.registerValue(tk, 66);
    expect(c.resolve(tk)).toBe(66);
  });
  it('val-num-7: resolves registered number 77', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-7');
    c.registerValue(tk, 77);
    expect(c.resolve(tk)).toBe(77);
  });
  it('val-num-8: resolves registered number 88', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-8');
    c.registerValue(tk, 88);
    expect(c.resolve(tk)).toBe(88);
  });
  it('val-num-9: resolves registered number 99', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-9');
    c.registerValue(tk, 99);
    expect(c.resolve(tk)).toBe(99);
  });
  it('val-num-10: resolves registered number 110', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-10');
    c.registerValue(tk, 110);
    expect(c.resolve(tk)).toBe(110);
  });
  it('val-num-11: resolves registered number 121', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-11');
    c.registerValue(tk, 121);
    expect(c.resolve(tk)).toBe(121);
  });
  it('val-num-12: resolves registered number 132', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-12');
    c.registerValue(tk, 132);
    expect(c.resolve(tk)).toBe(132);
  });
  it('val-num-13: resolves registered number 143', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-13');
    c.registerValue(tk, 143);
    expect(c.resolve(tk)).toBe(143);
  });
  it('val-num-14: resolves registered number 154', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-14');
    c.registerValue(tk, 154);
    expect(c.resolve(tk)).toBe(154);
  });
  it('val-num-15: resolves registered number 165', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-15');
    c.registerValue(tk, 165);
    expect(c.resolve(tk)).toBe(165);
  });
  it('val-num-16: resolves registered number 176', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-16');
    c.registerValue(tk, 176);
    expect(c.resolve(tk)).toBe(176);
  });
  it('val-num-17: resolves registered number 187', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-17');
    c.registerValue(tk, 187);
    expect(c.resolve(tk)).toBe(187);
  });
  it('val-num-18: resolves registered number 198', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-18');
    c.registerValue(tk, 198);
    expect(c.resolve(tk)).toBe(198);
  });
  it('val-num-19: resolves registered number 209', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-19');
    c.registerValue(tk, 209);
    expect(c.resolve(tk)).toBe(209);
  });
  it('val-num-20: resolves registered number 220', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-20');
    c.registerValue(tk, 220);
    expect(c.resolve(tk)).toBe(220);
  });
  it('val-num-21: resolves registered number 231', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-21');
    c.registerValue(tk, 231);
    expect(c.resolve(tk)).toBe(231);
  });
  it('val-num-22: resolves registered number 242', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-22');
    c.registerValue(tk, 242);
    expect(c.resolve(tk)).toBe(242);
  });
  it('val-num-23: resolves registered number 253', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-23');
    c.registerValue(tk, 253);
    expect(c.resolve(tk)).toBe(253);
  });
  it('val-num-24: resolves registered number 264', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-24');
    c.registerValue(tk, 264);
    expect(c.resolve(tk)).toBe(264);
  });
  it('val-num-25: resolves registered number 275', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-25');
    c.registerValue(tk, 275);
    expect(c.resolve(tk)).toBe(275);
  });
  it('val-num-26: resolves registered number 286', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-26');
    c.registerValue(tk, 286);
    expect(c.resolve(tk)).toBe(286);
  });
  it('val-num-27: resolves registered number 297', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-27');
    c.registerValue(tk, 297);
    expect(c.resolve(tk)).toBe(297);
  });
  it('val-num-28: resolves registered number 308', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-28');
    c.registerValue(tk, 308);
    expect(c.resolve(tk)).toBe(308);
  });
  it('val-num-29: resolves registered number 319', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-29');
    c.registerValue(tk, 319);
    expect(c.resolve(tk)).toBe(319);
  });
  it('val-num-30: resolves registered number 330', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-30');
    c.registerValue(tk, 330);
    expect(c.resolve(tk)).toBe(330);
  });
  it('val-num-31: resolves registered number 341', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-31');
    c.registerValue(tk, 341);
    expect(c.resolve(tk)).toBe(341);
  });
  it('val-num-32: resolves registered number 352', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-32');
    c.registerValue(tk, 352);
    expect(c.resolve(tk)).toBe(352);
  });
  it('val-num-33: resolves registered number 363', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-33');
    c.registerValue(tk, 363);
    expect(c.resolve(tk)).toBe(363);
  });
  it('val-num-34: resolves registered number 374', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-34');
    c.registerValue(tk, 374);
    expect(c.resolve(tk)).toBe(374);
  });
  it('val-num-35: resolves registered number 385', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-35');
    c.registerValue(tk, 385);
    expect(c.resolve(tk)).toBe(385);
  });
  it('val-num-36: resolves registered number 396', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-36');
    c.registerValue(tk, 396);
    expect(c.resolve(tk)).toBe(396);
  });
  it('val-num-37: resolves registered number 407', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-37');
    c.registerValue(tk, 407);
    expect(c.resolve(tk)).toBe(407);
  });
  it('val-num-38: resolves registered number 418', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-38');
    c.registerValue(tk, 418);
    expect(c.resolve(tk)).toBe(418);
  });
  it('val-num-39: resolves registered number 429', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-39');
    c.registerValue(tk, 429);
    expect(c.resolve(tk)).toBe(429);
  });
  it('val-num-40: resolves registered number 440', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-n-40');
    c.registerValue(tk, 440);
    expect(c.resolve(tk)).toBe(440);
  });
  it('val-str-1: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-1');
    c.registerValue(tk, 'value-1');
    expect(c.resolve(tk)).toBe('value-1');
  });
  it('val-str-2: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-2');
    c.registerValue(tk, 'value-2');
    expect(c.resolve(tk)).toBe('value-2');
  });
  it('val-str-3: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-3');
    c.registerValue(tk, 'value-3');
    expect(c.resolve(tk)).toBe('value-3');
  });
  it('val-str-4: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-4');
    c.registerValue(tk, 'value-4');
    expect(c.resolve(tk)).toBe('value-4');
  });
  it('val-str-5: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-5');
    c.registerValue(tk, 'value-5');
    expect(c.resolve(tk)).toBe('value-5');
  });
  it('val-str-6: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-6');
    c.registerValue(tk, 'value-6');
    expect(c.resolve(tk)).toBe('value-6');
  });
  it('val-str-7: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-7');
    c.registerValue(tk, 'value-7');
    expect(c.resolve(tk)).toBe('value-7');
  });
  it('val-str-8: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-8');
    c.registerValue(tk, 'value-8');
    expect(c.resolve(tk)).toBe('value-8');
  });
  it('val-str-9: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-9');
    c.registerValue(tk, 'value-9');
    expect(c.resolve(tk)).toBe('value-9');
  });
  it('val-str-10: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-10');
    c.registerValue(tk, 'value-10');
    expect(c.resolve(tk)).toBe('value-10');
  });
  it('val-str-11: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-11');
    c.registerValue(tk, 'value-11');
    expect(c.resolve(tk)).toBe('value-11');
  });
  it('val-str-12: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-12');
    c.registerValue(tk, 'value-12');
    expect(c.resolve(tk)).toBe('value-12');
  });
  it('val-str-13: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-13');
    c.registerValue(tk, 'value-13');
    expect(c.resolve(tk)).toBe('value-13');
  });
  it('val-str-14: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-14');
    c.registerValue(tk, 'value-14');
    expect(c.resolve(tk)).toBe('value-14');
  });
  it('val-str-15: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-15');
    c.registerValue(tk, 'value-15');
    expect(c.resolve(tk)).toBe('value-15');
  });
  it('val-str-16: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-16');
    c.registerValue(tk, 'value-16');
    expect(c.resolve(tk)).toBe('value-16');
  });
  it('val-str-17: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-17');
    c.registerValue(tk, 'value-17');
    expect(c.resolve(tk)).toBe('value-17');
  });
  it('val-str-18: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-18');
    c.registerValue(tk, 'value-18');
    expect(c.resolve(tk)).toBe('value-18');
  });
  it('val-str-19: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-19');
    c.registerValue(tk, 'value-19');
    expect(c.resolve(tk)).toBe('value-19');
  });
  it('val-str-20: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-20');
    c.registerValue(tk, 'value-20');
    expect(c.resolve(tk)).toBe('value-20');
  });
  it('val-str-21: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-21');
    c.registerValue(tk, 'value-21');
    expect(c.resolve(tk)).toBe('value-21');
  });
  it('val-str-22: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-22');
    c.registerValue(tk, 'value-22');
    expect(c.resolve(tk)).toBe('value-22');
  });
  it('val-str-23: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-23');
    c.registerValue(tk, 'value-23');
    expect(c.resolve(tk)).toBe('value-23');
  });
  it('val-str-24: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-24');
    c.registerValue(tk, 'value-24');
    expect(c.resolve(tk)).toBe('value-24');
  });
  it('val-str-25: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-25');
    c.registerValue(tk, 'value-25');
    expect(c.resolve(tk)).toBe('value-25');
  });
  it('val-str-26: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-26');
    c.registerValue(tk, 'value-26');
    expect(c.resolve(tk)).toBe('value-26');
  });
  it('val-str-27: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-27');
    c.registerValue(tk, 'value-27');
    expect(c.resolve(tk)).toBe('value-27');
  });
  it('val-str-28: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-28');
    c.registerValue(tk, 'value-28');
    expect(c.resolve(tk)).toBe('value-28');
  });
  it('val-str-29: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-29');
    c.registerValue(tk, 'value-29');
    expect(c.resolve(tk)).toBe('value-29');
  });
  it('val-str-30: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-30');
    c.registerValue(tk, 'value-30');
    expect(c.resolve(tk)).toBe('value-30');
  });
  it('val-str-31: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-31');
    c.registerValue(tk, 'value-31');
    expect(c.resolve(tk)).toBe('value-31');
  });
  it('val-str-32: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-32');
    c.registerValue(tk, 'value-32');
    expect(c.resolve(tk)).toBe('value-32');
  });
  it('val-str-33: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-33');
    c.registerValue(tk, 'value-33');
    expect(c.resolve(tk)).toBe('value-33');
  });
  it('val-str-34: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-34');
    c.registerValue(tk, 'value-34');
    expect(c.resolve(tk)).toBe('value-34');
  });
  it('val-str-35: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-35');
    c.registerValue(tk, 'value-35');
    expect(c.resolve(tk)).toBe('value-35');
  });
  it('val-str-36: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-36');
    c.registerValue(tk, 'value-36');
    expect(c.resolve(tk)).toBe('value-36');
  });
  it('val-str-37: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-37');
    c.registerValue(tk, 'value-37');
    expect(c.resolve(tk)).toBe('value-37');
  });
  it('val-str-38: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-38');
    c.registerValue(tk, 'value-38');
    expect(c.resolve(tk)).toBe('value-38');
  });
  it('val-str-39: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-39');
    c.registerValue(tk, 'value-39');
    expect(c.resolve(tk)).toBe('value-39');
  });
  it('val-str-40: resolves registered string', () => {
    const c = freshContainer();
    const tk = createToken<string>('val-s-40');
    c.registerValue(tk, 'value-40');
    expect(c.resolve(tk)).toBe('value-40');
  });
  it('val-same-1: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-1');
    const obj = { id: 1 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-2: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-2');
    const obj = { id: 2 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-3: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-3');
    const obj = { id: 3 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-4: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-4');
    const obj = { id: 4 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-5: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-5');
    const obj = { id: 5 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-6: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-6');
    const obj = { id: 6 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-7: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-7');
    const obj = { id: 7 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-8: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-8');
    const obj = { id: 8 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-9: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-9');
    const obj = { id: 9 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-10: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-10');
    const obj = { id: 10 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-11: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-11');
    const obj = { id: 11 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-12: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-12');
    const obj = { id: 12 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-13: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-13');
    const obj = { id: 13 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-14: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-14');
    const obj = { id: 14 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-15: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-15');
    const obj = { id: 15 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-16: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-16');
    const obj = { id: 16 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-17: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-17');
    const obj = { id: 17 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-18: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-18');
    const obj = { id: 18 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-19: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-19');
    const obj = { id: 19 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-20: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-20');
    const obj = { id: 20 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-21: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-21');
    const obj = { id: 21 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-22: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-22');
    const obj = { id: 22 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-23: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-23');
    const obj = { id: 23 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-24: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-24');
    const obj = { id: 24 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-25: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-25');
    const obj = { id: 25 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-26: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-26');
    const obj = { id: 26 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-27: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-27');
    const obj = { id: 27 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-28: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-28');
    const obj = { id: 28 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-29: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-29');
    const obj = { id: 29 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-30: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-30');
    const obj = { id: 30 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-31: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-31');
    const obj = { id: 31 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-32: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-32');
    const obj = { id: 32 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-33: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-33');
    const obj = { id: 33 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-34: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-34');
    const obj = { id: 34 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-35: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-35');
    const obj = { id: 35 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-36: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-36');
    const obj = { id: 36 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-37: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-37');
    const obj = { id: 37 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-38: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-38');
    const obj = { id: 38 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-39: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-39');
    const obj = { id: 39 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-same-40: same object reference returned', () => {
    const c = freshContainer();
    const tk = createToken<object>('val-ref-40');
    const obj = { id: 40 };
    c.registerValue(tk, obj);
    expect(c.resolve(tk)).toBe(obj);
    expect(c.resolve(tk)).toBe(obj);
  });
  it('val-null-1: null value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<null>('val-null-1');
    c.registerValue(tk, null);
    expect(c.resolve(tk)).toBeNull();
  });
  it('val-null-2: null value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<null>('val-null-2');
    c.registerValue(tk, null);
    expect(c.resolve(tk)).toBeNull();
  });
  it('val-null-3: null value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<null>('val-null-3');
    c.registerValue(tk, null);
    expect(c.resolve(tk)).toBeNull();
  });
  it('val-null-4: null value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<null>('val-null-4');
    c.registerValue(tk, null);
    expect(c.resolve(tk)).toBeNull();
  });
  it('val-null-5: null value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<null>('val-null-5');
    c.registerValue(tk, null);
    expect(c.resolve(tk)).toBeNull();
  });
  it('val-null-6: null value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<null>('val-null-6');
    c.registerValue(tk, null);
    expect(c.resolve(tk)).toBeNull();
  });
  it('val-null-7: null value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<null>('val-null-7');
    c.registerValue(tk, null);
    expect(c.resolve(tk)).toBeNull();
  });
  it('val-null-8: null value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<null>('val-null-8');
    c.registerValue(tk, null);
    expect(c.resolve(tk)).toBeNull();
  });
  it('val-null-9: null value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<null>('val-null-9');
    c.registerValue(tk, null);
    expect(c.resolve(tk)).toBeNull();
  });
  it('val-null-10: null value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<null>('val-null-10');
    c.registerValue(tk, null);
    expect(c.resolve(tk)).toBeNull();
  });
  it('val-null-11: null value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<null>('val-null-11');
    c.registerValue(tk, null);
    expect(c.resolve(tk)).toBeNull();
  });
  it('val-null-12: null value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<null>('val-null-12');
    c.registerValue(tk, null);
    expect(c.resolve(tk)).toBeNull();
  });
  it('val-null-13: null value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<null>('val-null-13');
    c.registerValue(tk, null);
    expect(c.resolve(tk)).toBeNull();
  });
  it('val-null-14: null value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<null>('val-null-14');
    c.registerValue(tk, null);
    expect(c.resolve(tk)).toBeNull();
  });
  it('val-null-15: null value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<null>('val-null-15');
    c.registerValue(tk, null);
    expect(c.resolve(tk)).toBeNull();
  });
  it('val-zero-1: zero value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-z-1');
    c.registerValue(tk, 0);
    expect(c.resolve(tk)).toBe(0);
  });
  it('val-zero-2: zero value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-z-2');
    c.registerValue(tk, 0);
    expect(c.resolve(tk)).toBe(0);
  });
  it('val-zero-3: zero value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-z-3');
    c.registerValue(tk, 0);
    expect(c.resolve(tk)).toBe(0);
  });
  it('val-zero-4: zero value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-z-4');
    c.registerValue(tk, 0);
    expect(c.resolve(tk)).toBe(0);
  });
  it('val-zero-5: zero value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-z-5');
    c.registerValue(tk, 0);
    expect(c.resolve(tk)).toBe(0);
  });
  it('val-zero-6: zero value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-z-6');
    c.registerValue(tk, 0);
    expect(c.resolve(tk)).toBe(0);
  });
  it('val-zero-7: zero value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-z-7');
    c.registerValue(tk, 0);
    expect(c.resolve(tk)).toBe(0);
  });
  it('val-zero-8: zero value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-z-8');
    c.registerValue(tk, 0);
    expect(c.resolve(tk)).toBe(0);
  });
  it('val-zero-9: zero value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-z-9');
    c.registerValue(tk, 0);
    expect(c.resolve(tk)).toBe(0);
  });
  it('val-zero-10: zero value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-z-10');
    c.registerValue(tk, 0);
    expect(c.resolve(tk)).toBe(0);
  });
  it('val-zero-11: zero value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-z-11');
    c.registerValue(tk, 0);
    expect(c.resolve(tk)).toBe(0);
  });
  it('val-zero-12: zero value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-z-12');
    c.registerValue(tk, 0);
    expect(c.resolve(tk)).toBe(0);
  });
  it('val-zero-13: zero value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-z-13');
    c.registerValue(tk, 0);
    expect(c.resolve(tk)).toBe(0);
  });
  it('val-zero-14: zero value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-z-14');
    c.registerValue(tk, 0);
    expect(c.resolve(tk)).toBe(0);
  });
  it('val-zero-15: zero value registered and resolved', () => {
    const c = freshContainer();
    const tk = createToken<number>('val-z-15');
    c.registerValue(tk, 0);
    expect(c.resolve(tk)).toBe(0);
  });
});

describe('has / isRegistered', () => {
  it('has-false-1: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-1');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-2: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-2');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-3: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-3');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-4: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-4');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-5: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-5');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-6: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-6');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-7: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-7');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-8: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-8');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-9: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-9');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-10: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-10');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-11: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-11');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-12: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-12');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-13: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-13');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-14: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-14');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-15: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-15');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-16: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-16');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-17: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-17');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-18: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-18');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-19: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-19');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-20: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-20');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-21: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-21');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-22: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-22');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-23: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-23');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-24: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-24');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-25: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-25');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-26: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-26');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-27: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-27');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-28: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-28');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-29: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-29');
    expect(c.has(tk)).toBe(false);
  });
  it('has-false-30: has() returns false before registration', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-pre-30');
    expect(c.has(tk)).toBe(false);
  });
  it('has-after-reg-1: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-1');
    c.register(tk, () => 1);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-2: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-2');
    c.register(tk, () => 2);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-3: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-3');
    c.register(tk, () => 3);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-4: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-4');
    c.register(tk, () => 4);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-5: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-5');
    c.register(tk, () => 5);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-6: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-6');
    c.register(tk, () => 6);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-7: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-7');
    c.register(tk, () => 7);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-8: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-8');
    c.register(tk, () => 8);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-9: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-9');
    c.register(tk, () => 9);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-10: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-10');
    c.register(tk, () => 10);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-11: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-11');
    c.register(tk, () => 11);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-12: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-12');
    c.register(tk, () => 12);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-13: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-13');
    c.register(tk, () => 13);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-14: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-14');
    c.register(tk, () => 14);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-15: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-15');
    c.register(tk, () => 15);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-16: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-16');
    c.register(tk, () => 16);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-17: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-17');
    c.register(tk, () => 17);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-18: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-18');
    c.register(tk, () => 18);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-19: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-19');
    c.register(tk, () => 19);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-20: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-20');
    c.register(tk, () => 20);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-21: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-21');
    c.register(tk, () => 21);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-22: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-22');
    c.register(tk, () => 22);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-23: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-23');
    c.register(tk, () => 23);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-24: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-24');
    c.register(tk, () => 24);
    expect(c.has(tk)).toBe(true);
  });
  it('has-after-reg-25: has() returns true after register', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-reg-25');
    c.register(tk, () => 25);
    expect(c.has(tk)).toBe(true);
  });
  it('isReg-1: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-1');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-2: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-2');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-3: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-3');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-4: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-4');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-5: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-5');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-6: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-6');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-7: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-7');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-8: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-8');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-9: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-9');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-10: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-10');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-11: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-11');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-12: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-12');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-13: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-13');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-14: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-14');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-15: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-15');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-16: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-16');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-17: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-17');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-18: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-18');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-19: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-19');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-20: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-20');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-21: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-21');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-22: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-22');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-23: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-23');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-24: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-24');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('isReg-25: isRegistered() is alias for has()', () => {
    const c = freshContainer();
    const tk = createToken<string>('isreg-25');
    expect(isRegistered(c, tk)).toBe(false);
    c.registerValue(tk, 'x');
    expect(isRegistered(c, tk)).toBe(true);
  });
  it('has-reset-1: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-1');
    c.register(tk, () => 1);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-2: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-2');
    c.register(tk, () => 2);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-3: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-3');
    c.register(tk, () => 3);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-4: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-4');
    c.register(tk, () => 4);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-5: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-5');
    c.register(tk, () => 5);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-6: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-6');
    c.register(tk, () => 6);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-7: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-7');
    c.register(tk, () => 7);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-8: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-8');
    c.register(tk, () => 8);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-9: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-9');
    c.register(tk, () => 9);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-10: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-10');
    c.register(tk, () => 10);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-11: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-11');
    c.register(tk, () => 11);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-12: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-12');
    c.register(tk, () => 12);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-13: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-13');
    c.register(tk, () => 13);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-14: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-14');
    c.register(tk, () => 14);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-15: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-15');
    c.register(tk, () => 15);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-16: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-16');
    c.register(tk, () => 16);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-17: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-17');
    c.register(tk, () => 17);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-18: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-18');
    c.register(tk, () => 18);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-19: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-19');
    c.register(tk, () => 19);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
  it('has-reset-20: has() returns false after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('has-rst-20');
    c.register(tk, () => 20);
    expect(c.has(tk)).toBe(true);
    c.reset();
    expect(c.has(tk)).toBe(false);
  });
});

describe('child container', () => {
  it('child-inherit-1: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-1');
    parent.register(tk, () => 5);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(5);
  });
  it('child-inherit-2: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-2');
    parent.register(tk, () => 10);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(10);
  });
  it('child-inherit-3: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-3');
    parent.register(tk, () => 15);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(15);
  });
  it('child-inherit-4: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-4');
    parent.register(tk, () => 20);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(20);
  });
  it('child-inherit-5: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-5');
    parent.register(tk, () => 25);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(25);
  });
  it('child-inherit-6: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-6');
    parent.register(tk, () => 30);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(30);
  });
  it('child-inherit-7: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-7');
    parent.register(tk, () => 35);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(35);
  });
  it('child-inherit-8: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-8');
    parent.register(tk, () => 40);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(40);
  });
  it('child-inherit-9: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-9');
    parent.register(tk, () => 45);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(45);
  });
  it('child-inherit-10: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-10');
    parent.register(tk, () => 50);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(50);
  });
  it('child-inherit-11: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-11');
    parent.register(tk, () => 55);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(55);
  });
  it('child-inherit-12: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-12');
    parent.register(tk, () => 60);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(60);
  });
  it('child-inherit-13: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-13');
    parent.register(tk, () => 65);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(65);
  });
  it('child-inherit-14: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-14');
    parent.register(tk, () => 70);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(70);
  });
  it('child-inherit-15: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-15');
    parent.register(tk, () => 75);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(75);
  });
  it('child-inherit-16: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-16');
    parent.register(tk, () => 80);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(80);
  });
  it('child-inherit-17: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-17');
    parent.register(tk, () => 85);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(85);
  });
  it('child-inherit-18: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-18');
    parent.register(tk, () => 90);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(90);
  });
  it('child-inherit-19: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-19');
    parent.register(tk, () => 95);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(95);
  });
  it('child-inherit-20: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-20');
    parent.register(tk, () => 100);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(100);
  });
  it('child-inherit-21: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-21');
    parent.register(tk, () => 105);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(105);
  });
  it('child-inherit-22: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-22');
    parent.register(tk, () => 110);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(110);
  });
  it('child-inherit-23: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-23');
    parent.register(tk, () => 115);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(115);
  });
  it('child-inherit-24: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-24');
    parent.register(tk, () => 120);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(120);
  });
  it('child-inherit-25: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-25');
    parent.register(tk, () => 125);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(125);
  });
  it('child-inherit-26: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-26');
    parent.register(tk, () => 130);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(130);
  });
  it('child-inherit-27: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-27');
    parent.register(tk, () => 135);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(135);
  });
  it('child-inherit-28: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-28');
    parent.register(tk, () => 140);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(140);
  });
  it('child-inherit-29: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-29');
    parent.register(tk, () => 145);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(145);
  });
  it('child-inherit-30: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-30');
    parent.register(tk, () => 150);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(150);
  });
  it('child-inherit-31: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-31');
    parent.register(tk, () => 155);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(155);
  });
  it('child-inherit-32: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-32');
    parent.register(tk, () => 160);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(160);
  });
  it('child-inherit-33: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-33');
    parent.register(tk, () => 165);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(165);
  });
  it('child-inherit-34: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-34');
    parent.register(tk, () => 170);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(170);
  });
  it('child-inherit-35: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-35');
    parent.register(tk, () => 175);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(175);
  });
  it('child-inherit-36: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-36');
    parent.register(tk, () => 180);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(180);
  });
  it('child-inherit-37: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-37');
    parent.register(tk, () => 185);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(185);
  });
  it('child-inherit-38: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-38');
    parent.register(tk, () => 190);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(190);
  });
  it('child-inherit-39: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-39');
    parent.register(tk, () => 195);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(195);
  });
  it('child-inherit-40: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-40');
    parent.register(tk, () => 200);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(200);
  });
  it('child-inherit-41: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-41');
    parent.register(tk, () => 205);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(205);
  });
  it('child-inherit-42: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-42');
    parent.register(tk, () => 210);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(210);
  });
  it('child-inherit-43: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-43');
    parent.register(tk, () => 215);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(215);
  });
  it('child-inherit-44: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-44');
    parent.register(tk, () => 220);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(220);
  });
  it('child-inherit-45: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-45');
    parent.register(tk, () => 225);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(225);
  });
  it('child-inherit-46: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-46');
    parent.register(tk, () => 230);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(230);
  });
  it('child-inherit-47: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-47');
    parent.register(tk, () => 235);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(235);
  });
  it('child-inherit-48: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-48');
    parent.register(tk, () => 240);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(240);
  });
  it('child-inherit-49: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-49');
    parent.register(tk, () => 245);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(245);
  });
  it('child-inherit-50: child resolves parent registration', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-inh-50');
    parent.register(tk, () => 250);
    const child = parent.child();
    expect(child.resolve(tk)).toBe(250);
  });
  it('child-isolate-1: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-1');
    parent.register(tk, () => 1);
    const child = parent.child();
    child.register(tk, () => 999);
    expect(parent.resolve(tk)).toBe(1);
    expect(child.resolve(tk)).toBe(999);
  });
  it('child-isolate-2: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-2');
    parent.register(tk, () => 2);
    const child = parent.child();
    child.register(tk, () => 1998);
    expect(parent.resolve(tk)).toBe(2);
    expect(child.resolve(tk)).toBe(1998);
  });
  it('child-isolate-3: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-3');
    parent.register(tk, () => 3);
    const child = parent.child();
    child.register(tk, () => 2997);
    expect(parent.resolve(tk)).toBe(3);
    expect(child.resolve(tk)).toBe(2997);
  });
  it('child-isolate-4: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-4');
    parent.register(tk, () => 4);
    const child = parent.child();
    child.register(tk, () => 3996);
    expect(parent.resolve(tk)).toBe(4);
    expect(child.resolve(tk)).toBe(3996);
  });
  it('child-isolate-5: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-5');
    parent.register(tk, () => 5);
    const child = parent.child();
    child.register(tk, () => 4995);
    expect(parent.resolve(tk)).toBe(5);
    expect(child.resolve(tk)).toBe(4995);
  });
  it('child-isolate-6: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-6');
    parent.register(tk, () => 6);
    const child = parent.child();
    child.register(tk, () => 5994);
    expect(parent.resolve(tk)).toBe(6);
    expect(child.resolve(tk)).toBe(5994);
  });
  it('child-isolate-7: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-7');
    parent.register(tk, () => 7);
    const child = parent.child();
    child.register(tk, () => 6993);
    expect(parent.resolve(tk)).toBe(7);
    expect(child.resolve(tk)).toBe(6993);
  });
  it('child-isolate-8: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-8');
    parent.register(tk, () => 8);
    const child = parent.child();
    child.register(tk, () => 7992);
    expect(parent.resolve(tk)).toBe(8);
    expect(child.resolve(tk)).toBe(7992);
  });
  it('child-isolate-9: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-9');
    parent.register(tk, () => 9);
    const child = parent.child();
    child.register(tk, () => 8991);
    expect(parent.resolve(tk)).toBe(9);
    expect(child.resolve(tk)).toBe(8991);
  });
  it('child-isolate-10: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-10');
    parent.register(tk, () => 10);
    const child = parent.child();
    child.register(tk, () => 9990);
    expect(parent.resolve(tk)).toBe(10);
    expect(child.resolve(tk)).toBe(9990);
  });
  it('child-isolate-11: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-11');
    parent.register(tk, () => 11);
    const child = parent.child();
    child.register(tk, () => 10989);
    expect(parent.resolve(tk)).toBe(11);
    expect(child.resolve(tk)).toBe(10989);
  });
  it('child-isolate-12: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-12');
    parent.register(tk, () => 12);
    const child = parent.child();
    child.register(tk, () => 11988);
    expect(parent.resolve(tk)).toBe(12);
    expect(child.resolve(tk)).toBe(11988);
  });
  it('child-isolate-13: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-13');
    parent.register(tk, () => 13);
    const child = parent.child();
    child.register(tk, () => 12987);
    expect(parent.resolve(tk)).toBe(13);
    expect(child.resolve(tk)).toBe(12987);
  });
  it('child-isolate-14: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-14');
    parent.register(tk, () => 14);
    const child = parent.child();
    child.register(tk, () => 13986);
    expect(parent.resolve(tk)).toBe(14);
    expect(child.resolve(tk)).toBe(13986);
  });
  it('child-isolate-15: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-15');
    parent.register(tk, () => 15);
    const child = parent.child();
    child.register(tk, () => 14985);
    expect(parent.resolve(tk)).toBe(15);
    expect(child.resolve(tk)).toBe(14985);
  });
  it('child-isolate-16: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-16');
    parent.register(tk, () => 16);
    const child = parent.child();
    child.register(tk, () => 15984);
    expect(parent.resolve(tk)).toBe(16);
    expect(child.resolve(tk)).toBe(15984);
  });
  it('child-isolate-17: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-17');
    parent.register(tk, () => 17);
    const child = parent.child();
    child.register(tk, () => 16983);
    expect(parent.resolve(tk)).toBe(17);
    expect(child.resolve(tk)).toBe(16983);
  });
  it('child-isolate-18: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-18');
    parent.register(tk, () => 18);
    const child = parent.child();
    child.register(tk, () => 17982);
    expect(parent.resolve(tk)).toBe(18);
    expect(child.resolve(tk)).toBe(17982);
  });
  it('child-isolate-19: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-19');
    parent.register(tk, () => 19);
    const child = parent.child();
    child.register(tk, () => 18981);
    expect(parent.resolve(tk)).toBe(19);
    expect(child.resolve(tk)).toBe(18981);
  });
  it('child-isolate-20: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-20');
    parent.register(tk, () => 20);
    const child = parent.child();
    child.register(tk, () => 19980);
    expect(parent.resolve(tk)).toBe(20);
    expect(child.resolve(tk)).toBe(19980);
  });
  it('child-isolate-21: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-21');
    parent.register(tk, () => 21);
    const child = parent.child();
    child.register(tk, () => 20979);
    expect(parent.resolve(tk)).toBe(21);
    expect(child.resolve(tk)).toBe(20979);
  });
  it('child-isolate-22: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-22');
    parent.register(tk, () => 22);
    const child = parent.child();
    child.register(tk, () => 21978);
    expect(parent.resolve(tk)).toBe(22);
    expect(child.resolve(tk)).toBe(21978);
  });
  it('child-isolate-23: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-23');
    parent.register(tk, () => 23);
    const child = parent.child();
    child.register(tk, () => 22977);
    expect(parent.resolve(tk)).toBe(23);
    expect(child.resolve(tk)).toBe(22977);
  });
  it('child-isolate-24: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-24');
    parent.register(tk, () => 24);
    const child = parent.child();
    child.register(tk, () => 23976);
    expect(parent.resolve(tk)).toBe(24);
    expect(child.resolve(tk)).toBe(23976);
  });
  it('child-isolate-25: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-25');
    parent.register(tk, () => 25);
    const child = parent.child();
    child.register(tk, () => 24975);
    expect(parent.resolve(tk)).toBe(25);
    expect(child.resolve(tk)).toBe(24975);
  });
  it('child-isolate-26: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-26');
    parent.register(tk, () => 26);
    const child = parent.child();
    child.register(tk, () => 25974);
    expect(parent.resolve(tk)).toBe(26);
    expect(child.resolve(tk)).toBe(25974);
  });
  it('child-isolate-27: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-27');
    parent.register(tk, () => 27);
    const child = parent.child();
    child.register(tk, () => 26973);
    expect(parent.resolve(tk)).toBe(27);
    expect(child.resolve(tk)).toBe(26973);
  });
  it('child-isolate-28: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-28');
    parent.register(tk, () => 28);
    const child = parent.child();
    child.register(tk, () => 27972);
    expect(parent.resolve(tk)).toBe(28);
    expect(child.resolve(tk)).toBe(27972);
  });
  it('child-isolate-29: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-29');
    parent.register(tk, () => 29);
    const child = parent.child();
    child.register(tk, () => 28971);
    expect(parent.resolve(tk)).toBe(29);
    expect(child.resolve(tk)).toBe(28971);
  });
  it('child-isolate-30: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-30');
    parent.register(tk, () => 30);
    const child = parent.child();
    child.register(tk, () => 29970);
    expect(parent.resolve(tk)).toBe(30);
    expect(child.resolve(tk)).toBe(29970);
  });
  it('child-isolate-31: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-31');
    parent.register(tk, () => 31);
    const child = parent.child();
    child.register(tk, () => 30969);
    expect(parent.resolve(tk)).toBe(31);
    expect(child.resolve(tk)).toBe(30969);
  });
  it('child-isolate-32: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-32');
    parent.register(tk, () => 32);
    const child = parent.child();
    child.register(tk, () => 31968);
    expect(parent.resolve(tk)).toBe(32);
    expect(child.resolve(tk)).toBe(31968);
  });
  it('child-isolate-33: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-33');
    parent.register(tk, () => 33);
    const child = parent.child();
    child.register(tk, () => 32967);
    expect(parent.resolve(tk)).toBe(33);
    expect(child.resolve(tk)).toBe(32967);
  });
  it('child-isolate-34: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-34');
    parent.register(tk, () => 34);
    const child = parent.child();
    child.register(tk, () => 33966);
    expect(parent.resolve(tk)).toBe(34);
    expect(child.resolve(tk)).toBe(33966);
  });
  it('child-isolate-35: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-35');
    parent.register(tk, () => 35);
    const child = parent.child();
    child.register(tk, () => 34965);
    expect(parent.resolve(tk)).toBe(35);
    expect(child.resolve(tk)).toBe(34965);
  });
  it('child-isolate-36: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-36');
    parent.register(tk, () => 36);
    const child = parent.child();
    child.register(tk, () => 35964);
    expect(parent.resolve(tk)).toBe(36);
    expect(child.resolve(tk)).toBe(35964);
  });
  it('child-isolate-37: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-37');
    parent.register(tk, () => 37);
    const child = parent.child();
    child.register(tk, () => 36963);
    expect(parent.resolve(tk)).toBe(37);
    expect(child.resolve(tk)).toBe(36963);
  });
  it('child-isolate-38: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-38');
    parent.register(tk, () => 38);
    const child = parent.child();
    child.register(tk, () => 37962);
    expect(parent.resolve(tk)).toBe(38);
    expect(child.resolve(tk)).toBe(37962);
  });
  it('child-isolate-39: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-39');
    parent.register(tk, () => 39);
    const child = parent.child();
    child.register(tk, () => 38961);
    expect(parent.resolve(tk)).toBe(39);
    expect(child.resolve(tk)).toBe(38961);
  });
  it('child-isolate-40: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-40');
    parent.register(tk, () => 40);
    const child = parent.child();
    child.register(tk, () => 39960);
    expect(parent.resolve(tk)).toBe(40);
    expect(child.resolve(tk)).toBe(39960);
  });
  it('child-isolate-41: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-41');
    parent.register(tk, () => 41);
    const child = parent.child();
    child.register(tk, () => 40959);
    expect(parent.resolve(tk)).toBe(41);
    expect(child.resolve(tk)).toBe(40959);
  });
  it('child-isolate-42: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-42');
    parent.register(tk, () => 42);
    const child = parent.child();
    child.register(tk, () => 41958);
    expect(parent.resolve(tk)).toBe(42);
    expect(child.resolve(tk)).toBe(41958);
  });
  it('child-isolate-43: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-43');
    parent.register(tk, () => 43);
    const child = parent.child();
    child.register(tk, () => 42957);
    expect(parent.resolve(tk)).toBe(43);
    expect(child.resolve(tk)).toBe(42957);
  });
  it('child-isolate-44: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-44');
    parent.register(tk, () => 44);
    const child = parent.child();
    child.register(tk, () => 43956);
    expect(parent.resolve(tk)).toBe(44);
    expect(child.resolve(tk)).toBe(43956);
  });
  it('child-isolate-45: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-45');
    parent.register(tk, () => 45);
    const child = parent.child();
    child.register(tk, () => 44955);
    expect(parent.resolve(tk)).toBe(45);
    expect(child.resolve(tk)).toBe(44955);
  });
  it('child-isolate-46: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-46');
    parent.register(tk, () => 46);
    const child = parent.child();
    child.register(tk, () => 45954);
    expect(parent.resolve(tk)).toBe(46);
    expect(child.resolve(tk)).toBe(45954);
  });
  it('child-isolate-47: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-47');
    parent.register(tk, () => 47);
    const child = parent.child();
    child.register(tk, () => 46953);
    expect(parent.resolve(tk)).toBe(47);
    expect(child.resolve(tk)).toBe(46953);
  });
  it('child-isolate-48: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-48');
    parent.register(tk, () => 48);
    const child = parent.child();
    child.register(tk, () => 47952);
    expect(parent.resolve(tk)).toBe(48);
    expect(child.resolve(tk)).toBe(47952);
  });
  it('child-isolate-49: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-49');
    parent.register(tk, () => 49);
    const child = parent.child();
    child.register(tk, () => 48951);
    expect(parent.resolve(tk)).toBe(49);
    expect(child.resolve(tk)).toBe(48951);
  });
  it('child-isolate-50: child override does not affect parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('child-iso-50');
    parent.register(tk, () => 50);
    const child = parent.child();
    child.register(tk, () => 49950);
    expect(parent.resolve(tk)).toBe(50);
    expect(child.resolve(tk)).toBe(49950);
  });
  it('child-has-1: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-1');
    parent.registerValue(tk, 'p1');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-2: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-2');
    parent.registerValue(tk, 'p2');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-3: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-3');
    parent.registerValue(tk, 'p3');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-4: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-4');
    parent.registerValue(tk, 'p4');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-5: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-5');
    parent.registerValue(tk, 'p5');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-6: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-6');
    parent.registerValue(tk, 'p6');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-7: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-7');
    parent.registerValue(tk, 'p7');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-8: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-8');
    parent.registerValue(tk, 'p8');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-9: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-9');
    parent.registerValue(tk, 'p9');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-10: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-10');
    parent.registerValue(tk, 'p10');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-11: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-11');
    parent.registerValue(tk, 'p11');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-12: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-12');
    parent.registerValue(tk, 'p12');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-13: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-13');
    parent.registerValue(tk, 'p13');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-14: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-14');
    parent.registerValue(tk, 'p14');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-15: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-15');
    parent.registerValue(tk, 'p15');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-16: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-16');
    parent.registerValue(tk, 'p16');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-17: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-17');
    parent.registerValue(tk, 'p17');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-18: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-18');
    parent.registerValue(tk, 'p18');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-19: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-19');
    parent.registerValue(tk, 'p19');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-20: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-20');
    parent.registerValue(tk, 'p20');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-21: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-21');
    parent.registerValue(tk, 'p21');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-22: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-22');
    parent.registerValue(tk, 'p22');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-23: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-23');
    parent.registerValue(tk, 'p23');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-24: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-24');
    parent.registerValue(tk, 'p24');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-25: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-25');
    parent.registerValue(tk, 'p25');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-26: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-26');
    parent.registerValue(tk, 'p26');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-27: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-27');
    parent.registerValue(tk, 'p27');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-28: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-28');
    parent.registerValue(tk, 'p28');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-29: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-29');
    parent.registerValue(tk, 'p29');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-has-30: child has() is true for parent token', () => {
    const parent = freshContainer();
    const tk = createToken<string>('child-has-30');
    parent.registerValue(tk, 'p30');
    const child = parent.child();
    expect(child.has(tk)).toBe(true);
  });
  it('child-grand-1: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-1');
    gp.register(tk, () => 2);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(2);
  });
  it('child-grand-2: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-2');
    gp.register(tk, () => 4);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(4);
  });
  it('child-grand-3: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-3');
    gp.register(tk, () => 6);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(6);
  });
  it('child-grand-4: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-4');
    gp.register(tk, () => 8);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(8);
  });
  it('child-grand-5: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-5');
    gp.register(tk, () => 10);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(10);
  });
  it('child-grand-6: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-6');
    gp.register(tk, () => 12);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(12);
  });
  it('child-grand-7: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-7');
    gp.register(tk, () => 14);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(14);
  });
  it('child-grand-8: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-8');
    gp.register(tk, () => 16);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(16);
  });
  it('child-grand-9: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-9');
    gp.register(tk, () => 18);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(18);
  });
  it('child-grand-10: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-10');
    gp.register(tk, () => 20);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(20);
  });
  it('child-grand-11: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-11');
    gp.register(tk, () => 22);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(22);
  });
  it('child-grand-12: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-12');
    gp.register(tk, () => 24);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(24);
  });
  it('child-grand-13: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-13');
    gp.register(tk, () => 26);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(26);
  });
  it('child-grand-14: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-14');
    gp.register(tk, () => 28);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(28);
  });
  it('child-grand-15: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-15');
    gp.register(tk, () => 30);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(30);
  });
  it('child-grand-16: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-16');
    gp.register(tk, () => 32);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(32);
  });
  it('child-grand-17: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-17');
    gp.register(tk, () => 34);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(34);
  });
  it('child-grand-18: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-18');
    gp.register(tk, () => 36);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(36);
  });
  it('child-grand-19: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-19');
    gp.register(tk, () => 38);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(38);
  });
  it('child-grand-20: grandchild resolves grandparent registration', () => {
    const gp = freshContainer();
    const tk = createToken<number>('grand-20');
    gp.register(tk, () => 40);
    const child = gp.child();
    const grandchild = child.child();
    expect(grandchild.resolve(tk)).toBe(40);
  });
});

describe('reset', () => {
  it('reset-throw-1: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-1');
    c.register(tk, () => 1);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-2: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-2');
    c.register(tk, () => 2);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-3: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-3');
    c.register(tk, () => 3);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-4: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-4');
    c.register(tk, () => 4);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-5: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-5');
    c.register(tk, () => 5);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-6: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-6');
    c.register(tk, () => 6);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-7: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-7');
    c.register(tk, () => 7);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-8: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-8');
    c.register(tk, () => 8);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-9: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-9');
    c.register(tk, () => 9);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-10: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-10');
    c.register(tk, () => 10);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-11: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-11');
    c.register(tk, () => 11);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-12: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-12');
    c.register(tk, () => 12);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-13: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-13');
    c.register(tk, () => 13);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-14: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-14');
    c.register(tk, () => 14);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-15: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-15');
    c.register(tk, () => 15);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-16: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-16');
    c.register(tk, () => 16);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-17: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-17');
    c.register(tk, () => 17);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-18: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-18');
    c.register(tk, () => 18);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-19: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-19');
    c.register(tk, () => 19);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-20: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-20');
    c.register(tk, () => 20);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-21: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-21');
    c.register(tk, () => 21);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-22: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-22');
    c.register(tk, () => 22);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-23: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-23');
    c.register(tk, () => 23);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-24: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-24');
    c.register(tk, () => 24);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-throw-25: resolve throws after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-t-25');
    c.register(tk, () => 25);
    c.reset();
    expect(() => c.resolve(tk)).toThrow();
  });
  it('reset-rereg-1: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-1');
    c.register(tk, () => 1);
    c.reset();
    c.register(tk, () => 2);
    expect(c.resolve(tk)).toBe(2);
  });
  it('reset-rereg-2: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-2');
    c.register(tk, () => 2);
    c.reset();
    c.register(tk, () => 4);
    expect(c.resolve(tk)).toBe(4);
  });
  it('reset-rereg-3: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-3');
    c.register(tk, () => 3);
    c.reset();
    c.register(tk, () => 6);
    expect(c.resolve(tk)).toBe(6);
  });
  it('reset-rereg-4: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-4');
    c.register(tk, () => 4);
    c.reset();
    c.register(tk, () => 8);
    expect(c.resolve(tk)).toBe(8);
  });
  it('reset-rereg-5: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-5');
    c.register(tk, () => 5);
    c.reset();
    c.register(tk, () => 10);
    expect(c.resolve(tk)).toBe(10);
  });
  it('reset-rereg-6: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-6');
    c.register(tk, () => 6);
    c.reset();
    c.register(tk, () => 12);
    expect(c.resolve(tk)).toBe(12);
  });
  it('reset-rereg-7: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-7');
    c.register(tk, () => 7);
    c.reset();
    c.register(tk, () => 14);
    expect(c.resolve(tk)).toBe(14);
  });
  it('reset-rereg-8: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-8');
    c.register(tk, () => 8);
    c.reset();
    c.register(tk, () => 16);
    expect(c.resolve(tk)).toBe(16);
  });
  it('reset-rereg-9: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-9');
    c.register(tk, () => 9);
    c.reset();
    c.register(tk, () => 18);
    expect(c.resolve(tk)).toBe(18);
  });
  it('reset-rereg-10: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-10');
    c.register(tk, () => 10);
    c.reset();
    c.register(tk, () => 20);
    expect(c.resolve(tk)).toBe(20);
  });
  it('reset-rereg-11: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-11');
    c.register(tk, () => 11);
    c.reset();
    c.register(tk, () => 22);
    expect(c.resolve(tk)).toBe(22);
  });
  it('reset-rereg-12: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-12');
    c.register(tk, () => 12);
    c.reset();
    c.register(tk, () => 24);
    expect(c.resolve(tk)).toBe(24);
  });
  it('reset-rereg-13: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-13');
    c.register(tk, () => 13);
    c.reset();
    c.register(tk, () => 26);
    expect(c.resolve(tk)).toBe(26);
  });
  it('reset-rereg-14: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-14');
    c.register(tk, () => 14);
    c.reset();
    c.register(tk, () => 28);
    expect(c.resolve(tk)).toBe(28);
  });
  it('reset-rereg-15: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-15');
    c.register(tk, () => 15);
    c.reset();
    c.register(tk, () => 30);
    expect(c.resolve(tk)).toBe(30);
  });
  it('reset-rereg-16: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-16');
    c.register(tk, () => 16);
    c.reset();
    c.register(tk, () => 32);
    expect(c.resolve(tk)).toBe(32);
  });
  it('reset-rereg-17: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-17');
    c.register(tk, () => 17);
    c.reset();
    c.register(tk, () => 34);
    expect(c.resolve(tk)).toBe(34);
  });
  it('reset-rereg-18: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-18');
    c.register(tk, () => 18);
    c.reset();
    c.register(tk, () => 36);
    expect(c.resolve(tk)).toBe(36);
  });
  it('reset-rereg-19: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-19');
    c.register(tk, () => 19);
    c.reset();
    c.register(tk, () => 38);
    expect(c.resolve(tk)).toBe(38);
  });
  it('reset-rereg-20: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-20');
    c.register(tk, () => 20);
    c.reset();
    c.register(tk, () => 40);
    expect(c.resolve(tk)).toBe(40);
  });
  it('reset-rereg-21: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-21');
    c.register(tk, () => 21);
    c.reset();
    c.register(tk, () => 42);
    expect(c.resolve(tk)).toBe(42);
  });
  it('reset-rereg-22: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-22');
    c.register(tk, () => 22);
    c.reset();
    c.register(tk, () => 44);
    expect(c.resolve(tk)).toBe(44);
  });
  it('reset-rereg-23: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-23');
    c.register(tk, () => 23);
    c.reset();
    c.register(tk, () => 46);
    expect(c.resolve(tk)).toBe(46);
  });
  it('reset-rereg-24: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-24');
    c.register(tk, () => 24);
    c.reset();
    c.register(tk, () => 48);
    expect(c.resolve(tk)).toBe(48);
  });
  it('reset-rereg-25: can re-register after reset', () => {
    const c = freshContainer();
    const tk = createToken<number>('rst-r-25');
    c.register(tk, () => 25);
    c.reset();
    c.register(tk, () => 50);
    expect(c.resolve(tk)).toBe(50);
  });
});

describe('error cases', () => {
  it('err-unreg-1: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-1');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-2: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-2');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-3: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-3');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-4: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-4');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-5: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-5');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-6: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-6');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-7: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-7');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-8: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-8');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-9: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-9');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-10: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-10');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-11: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-11');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-12: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-12');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-13: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-13');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-14: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-14');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-15: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-15');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-16: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-16');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-17: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-17');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-18: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-18');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-19: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-19');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-20: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-20');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-21: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-21');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-22: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-22');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-23: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-23');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-24: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-24');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-25: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-25');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-26: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-26');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-27: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-27');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-28: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-28');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-29: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-29');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-unreg-30: resolve unregistered token throws', () => {
    const c = freshContainer();
    const tk = createToken<number>('err-u-30');
    expect(() => c.resolve(tk)).toThrow();
  });
  it('err-msg-1: error message contains token description', () => {
    const c = freshContainer();
    const tk = createToken<number>('my-service-1');
    let msg = '';
    try { c.resolve(tk); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain('my-service-1');
  });
  it('err-msg-2: error message contains token description', () => {
    const c = freshContainer();
    const tk = createToken<number>('my-service-2');
    let msg = '';
    try { c.resolve(tk); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain('my-service-2');
  });
  it('err-msg-3: error message contains token description', () => {
    const c = freshContainer();
    const tk = createToken<number>('my-service-3');
    let msg = '';
    try { c.resolve(tk); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain('my-service-3');
  });
  it('err-msg-4: error message contains token description', () => {
    const c = freshContainer();
    const tk = createToken<number>('my-service-4');
    let msg = '';
    try { c.resolve(tk); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain('my-service-4');
  });
  it('err-msg-5: error message contains token description', () => {
    const c = freshContainer();
    const tk = createToken<number>('my-service-5');
    let msg = '';
    try { c.resolve(tk); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain('my-service-5');
  });
  it('err-msg-6: error message contains token description', () => {
    const c = freshContainer();
    const tk = createToken<number>('my-service-6');
    let msg = '';
    try { c.resolve(tk); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain('my-service-6');
  });
  it('err-msg-7: error message contains token description', () => {
    const c = freshContainer();
    const tk = createToken<number>('my-service-7');
    let msg = '';
    try { c.resolve(tk); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain('my-service-7');
  });
  it('err-msg-8: error message contains token description', () => {
    const c = freshContainer();
    const tk = createToken<number>('my-service-8');
    let msg = '';
    try { c.resolve(tk); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain('my-service-8');
  });
  it('err-msg-9: error message contains token description', () => {
    const c = freshContainer();
    const tk = createToken<number>('my-service-9');
    let msg = '';
    try { c.resolve(tk); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain('my-service-9');
  });
  it('err-msg-10: error message contains token description', () => {
    const c = freshContainer();
    const tk = createToken<number>('my-service-10');
    let msg = '';
    try { c.resolve(tk); } catch (e) { msg = (e as Error).message; }
    expect(msg).toContain('my-service-10');
  });
  it('err-child-1: child container throws for unregistered token', () => {
    const p = freshContainer();
    const child = p.child();
    const tk = createToken<number>('err-c-1');
    expect(() => child.resolve(tk)).toThrow();
  });
  it('err-child-2: child container throws for unregistered token', () => {
    const p = freshContainer();
    const child = p.child();
    const tk = createToken<number>('err-c-2');
    expect(() => child.resolve(tk)).toThrow();
  });
  it('err-child-3: child container throws for unregistered token', () => {
    const p = freshContainer();
    const child = p.child();
    const tk = createToken<number>('err-c-3');
    expect(() => child.resolve(tk)).toThrow();
  });
  it('err-child-4: child container throws for unregistered token', () => {
    const p = freshContainer();
    const child = p.child();
    const tk = createToken<number>('err-c-4');
    expect(() => child.resolve(tk)).toThrow();
  });
  it('err-child-5: child container throws for unregistered token', () => {
    const p = freshContainer();
    const child = p.child();
    const tk = createToken<number>('err-c-5');
    expect(() => child.resolve(tk)).toThrow();
  });
  it('err-child-6: child container throws for unregistered token', () => {
    const p = freshContainer();
    const child = p.child();
    const tk = createToken<number>('err-c-6');
    expect(() => child.resolve(tk)).toThrow();
  });
  it('err-child-7: child container throws for unregistered token', () => {
    const p = freshContainer();
    const child = p.child();
    const tk = createToken<number>('err-c-7');
    expect(() => child.resolve(tk)).toThrow();
  });
  it('err-child-8: child container throws for unregistered token', () => {
    const p = freshContainer();
    const child = p.child();
    const tk = createToken<number>('err-c-8');
    expect(() => child.resolve(tk)).toThrow();
  });
  it('err-child-9: child container throws for unregistered token', () => {
    const p = freshContainer();
    const child = p.child();
    const tk = createToken<number>('err-c-9');
    expect(() => child.resolve(tk)).toThrow();
  });
  it('err-child-10: child container throws for unregistered token', () => {
    const p = freshContainer();
    const child = p.child();
    const tk = createToken<number>('err-c-10');
    expect(() => child.resolve(tk)).toThrow();
  });
});

describe('inject helper', () => {
  it('inject-1: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-1');
    c.registerValue(tk, 13);
    expect(inject(c, tk)).toBe(13);
  });
  it('inject-2: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-2');
    c.registerValue(tk, 26);
    expect(inject(c, tk)).toBe(26);
  });
  it('inject-3: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-3');
    c.registerValue(tk, 39);
    expect(inject(c, tk)).toBe(39);
  });
  it('inject-4: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-4');
    c.registerValue(tk, 52);
    expect(inject(c, tk)).toBe(52);
  });
  it('inject-5: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-5');
    c.registerValue(tk, 65);
    expect(inject(c, tk)).toBe(65);
  });
  it('inject-6: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-6');
    c.registerValue(tk, 78);
    expect(inject(c, tk)).toBe(78);
  });
  it('inject-7: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-7');
    c.registerValue(tk, 91);
    expect(inject(c, tk)).toBe(91);
  });
  it('inject-8: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-8');
    c.registerValue(tk, 104);
    expect(inject(c, tk)).toBe(104);
  });
  it('inject-9: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-9');
    c.registerValue(tk, 117);
    expect(inject(c, tk)).toBe(117);
  });
  it('inject-10: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-10');
    c.registerValue(tk, 130);
    expect(inject(c, tk)).toBe(130);
  });
  it('inject-11: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-11');
    c.registerValue(tk, 143);
    expect(inject(c, tk)).toBe(143);
  });
  it('inject-12: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-12');
    c.registerValue(tk, 156);
    expect(inject(c, tk)).toBe(156);
  });
  it('inject-13: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-13');
    c.registerValue(tk, 169);
    expect(inject(c, tk)).toBe(169);
  });
  it('inject-14: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-14');
    c.registerValue(tk, 182);
    expect(inject(c, tk)).toBe(182);
  });
  it('inject-15: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-15');
    c.registerValue(tk, 195);
    expect(inject(c, tk)).toBe(195);
  });
  it('inject-16: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-16');
    c.registerValue(tk, 208);
    expect(inject(c, tk)).toBe(208);
  });
  it('inject-17: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-17');
    c.registerValue(tk, 221);
    expect(inject(c, tk)).toBe(221);
  });
  it('inject-18: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-18');
    c.registerValue(tk, 234);
    expect(inject(c, tk)).toBe(234);
  });
  it('inject-19: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-19');
    c.registerValue(tk, 247);
    expect(inject(c, tk)).toBe(247);
  });
  it('inject-20: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-20');
    c.registerValue(tk, 260);
    expect(inject(c, tk)).toBe(260);
  });
  it('inject-21: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-21');
    c.registerValue(tk, 273);
    expect(inject(c, tk)).toBe(273);
  });
  it('inject-22: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-22');
    c.registerValue(tk, 286);
    expect(inject(c, tk)).toBe(286);
  });
  it('inject-23: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-23');
    c.registerValue(tk, 299);
    expect(inject(c, tk)).toBe(299);
  });
  it('inject-24: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-24');
    c.registerValue(tk, 312);
    expect(inject(c, tk)).toBe(312);
  });
  it('inject-25: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-25');
    c.registerValue(tk, 325);
    expect(inject(c, tk)).toBe(325);
  });
  it('inject-26: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-26');
    c.registerValue(tk, 338);
    expect(inject(c, tk)).toBe(338);
  });
  it('inject-27: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-27');
    c.registerValue(tk, 351);
    expect(inject(c, tk)).toBe(351);
  });
  it('inject-28: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-28');
    c.registerValue(tk, 364);
    expect(inject(c, tk)).toBe(364);
  });
  it('inject-29: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-29');
    c.registerValue(tk, 377);
    expect(inject(c, tk)).toBe(377);
  });
  it('inject-30: inject() resolves registered value', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-30');
    c.registerValue(tk, 390);
    expect(inject(c, tk)).toBe(390);
  });
  it('inject-match-1: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-1');
    c.register(tk, () => 7);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-2: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-2');
    c.register(tk, () => 14);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-3: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-3');
    c.register(tk, () => 21);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-4: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-4');
    c.register(tk, () => 28);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-5: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-5');
    c.register(tk, () => 35);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-6: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-6');
    c.register(tk, () => 42);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-7: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-7');
    c.register(tk, () => 49);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-8: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-8');
    c.register(tk, () => 56);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-9: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-9');
    c.register(tk, () => 63);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-10: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-10');
    c.register(tk, () => 70);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-11: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-11');
    c.register(tk, () => 77);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-12: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-12');
    c.register(tk, () => 84);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-13: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-13');
    c.register(tk, () => 91);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-14: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-14');
    c.register(tk, () => 98);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-15: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-15');
    c.register(tk, () => 105);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-16: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-16');
    c.register(tk, () => 112);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-17: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-17');
    c.register(tk, () => 119);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-18: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-18');
    c.register(tk, () => 126);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-19: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-19');
    c.register(tk, () => 133);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
  it('inject-match-20: inject() equals resolve()', () => {
    const c = freshContainer();
    const tk = createToken<number>('inj-m-20');
    c.register(tk, () => 140);
    expect(inject(c, tk)).toBe(c.resolve(tk));
  });
});

describe('createScope', () => {
  it('scope-child-1: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-1');
    parent.registerValue(tk, 1);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(1);
  });
  it('scope-child-2: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-2');
    parent.registerValue(tk, 2);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(2);
  });
  it('scope-child-3: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-3');
    parent.registerValue(tk, 3);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(3);
  });
  it('scope-child-4: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-4');
    parent.registerValue(tk, 4);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(4);
  });
  it('scope-child-5: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-5');
    parent.registerValue(tk, 5);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(5);
  });
  it('scope-child-6: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-6');
    parent.registerValue(tk, 6);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(6);
  });
  it('scope-child-7: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-7');
    parent.registerValue(tk, 7);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(7);
  });
  it('scope-child-8: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-8');
    parent.registerValue(tk, 8);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(8);
  });
  it('scope-child-9: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-9');
    parent.registerValue(tk, 9);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(9);
  });
  it('scope-child-10: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-10');
    parent.registerValue(tk, 10);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(10);
  });
  it('scope-child-11: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-11');
    parent.registerValue(tk, 11);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(11);
  });
  it('scope-child-12: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-12');
    parent.registerValue(tk, 12);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(12);
  });
  it('scope-child-13: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-13');
    parent.registerValue(tk, 13);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(13);
  });
  it('scope-child-14: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-14');
    parent.registerValue(tk, 14);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(14);
  });
  it('scope-child-15: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-15');
    parent.registerValue(tk, 15);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(15);
  });
  it('scope-child-16: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-16');
    parent.registerValue(tk, 16);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(16);
  });
  it('scope-child-17: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-17');
    parent.registerValue(tk, 17);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(17);
  });
  it('scope-child-18: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-18');
    parent.registerValue(tk, 18);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(18);
  });
  it('scope-child-19: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-19');
    parent.registerValue(tk, 19);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(19);
  });
  it('scope-child-20: scope factory receives a child container', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-p-20');
    parent.registerValue(tk, 20);
    const result = createScope(parent, (c) => c.resolve(tk));
    expect(result).toBe(20);
  });
  it('scope-isolate-1: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-1');
    createScope(parent, (c) => { c.registerValue(tk, 1); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-2: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-2');
    createScope(parent, (c) => { c.registerValue(tk, 2); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-3: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-3');
    createScope(parent, (c) => { c.registerValue(tk, 3); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-4: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-4');
    createScope(parent, (c) => { c.registerValue(tk, 4); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-5: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-5');
    createScope(parent, (c) => { c.registerValue(tk, 5); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-6: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-6');
    createScope(parent, (c) => { c.registerValue(tk, 6); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-7: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-7');
    createScope(parent, (c) => { c.registerValue(tk, 7); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-8: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-8');
    createScope(parent, (c) => { c.registerValue(tk, 8); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-9: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-9');
    createScope(parent, (c) => { c.registerValue(tk, 9); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-10: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-10');
    createScope(parent, (c) => { c.registerValue(tk, 10); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-11: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-11');
    createScope(parent, (c) => { c.registerValue(tk, 11); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-12: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-12');
    createScope(parent, (c) => { c.registerValue(tk, 12); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-13: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-13');
    createScope(parent, (c) => { c.registerValue(tk, 13); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-14: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-14');
    createScope(parent, (c) => { c.registerValue(tk, 14); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-15: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-15');
    createScope(parent, (c) => { c.registerValue(tk, 15); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-16: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-16');
    createScope(parent, (c) => { c.registerValue(tk, 16); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-17: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-17');
    createScope(parent, (c) => { c.registerValue(tk, 17); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-18: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-18');
    createScope(parent, (c) => { c.registerValue(tk, 18); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-19: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-19');
    createScope(parent, (c) => { c.registerValue(tk, 19); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-isolate-20: scope registration does not leak to parent', () => {
    const parent = freshContainer();
    const tk = createToken<number>('scope-iso-20');
    createScope(parent, (c) => { c.registerValue(tk, 20); return null; });
    expect(parent.has(tk)).toBe(false);
  });
  it('scope-return-1: createScope returns factory return value', () => {
    const parent = freshContainer();
    const result = createScope(parent, (_c) => 'result-1');
    expect(result).toBe('result-1');
  });
  it('scope-return-2: createScope returns factory return value', () => {
    const parent = freshContainer();
    const result = createScope(parent, (_c) => 'result-2');
    expect(result).toBe('result-2');
  });
  it('scope-return-3: createScope returns factory return value', () => {
    const parent = freshContainer();
    const result = createScope(parent, (_c) => 'result-3');
    expect(result).toBe('result-3');
  });
  it('scope-return-4: createScope returns factory return value', () => {
    const parent = freshContainer();
    const result = createScope(parent, (_c) => 'result-4');
    expect(result).toBe('result-4');
  });
  it('scope-return-5: createScope returns factory return value', () => {
    const parent = freshContainer();
    const result = createScope(parent, (_c) => 'result-5');
    expect(result).toBe('result-5');
  });
  it('scope-return-6: createScope returns factory return value', () => {
    const parent = freshContainer();
    const result = createScope(parent, (_c) => 'result-6');
    expect(result).toBe('result-6');
  });
  it('scope-return-7: createScope returns factory return value', () => {
    const parent = freshContainer();
    const result = createScope(parent, (_c) => 'result-7');
    expect(result).toBe('result-7');
  });
  it('scope-return-8: createScope returns factory return value', () => {
    const parent = freshContainer();
    const result = createScope(parent, (_c) => 'result-8');
    expect(result).toBe('result-8');
  });
  it('scope-return-9: createScope returns factory return value', () => {
    const parent = freshContainer();
    const result = createScope(parent, (_c) => 'result-9');
    expect(result).toBe('result-9');
  });
  it('scope-return-10: createScope returns factory return value', () => {
    const parent = freshContainer();
    const result = createScope(parent, (_c) => 'result-10');
    expect(result).toBe('result-10');
  });
});

// Total it() blocks: 1050
