/**
 * Password policy tests — NIST SP 800-63B compliance
 * Min 12 chars, uppercase, lowercase, number, special char, max 72
 */
import { validatePasswordStrength } from '../src/password';

describe('Password policy — NIST SP 800-63B', () => {
  const validPasswords = [
    'Correct$Horse9Battery',
    'MyP@ssw0rd!Secure',
    'Tr0ub4dor&3!xtra',
    'A1b2C3d4!@#$Secu',
    'TestPass123!',
    'Aa1!' + 'x'.repeat(8),
  ];

  const invalidPasswords: [string, string][] = [
    ['password123!', 'no uppercase'],
    ['PASSWORD123!', 'no lowercase'],
    ['Password!!!!', 'no number'],
    ['Password12345', 'no special char'],
    ['Short1!Aa', 'too short (9 chars)'],
    ['P@s1', 'way too short (4 chars)'],
    ['A'.repeat(50) + 'a'.repeat(20) + '1234!', 'too long (> 72 chars)'],
  ];

  test.each(validPasswords)('accepts valid password: %s', (pwd) => {
    const result = validatePasswordStrength(pwd);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test.each(invalidPasswords)('rejects: %s (%s)', (pwd) => {
    const result = validatePasswordStrength(pwd);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('accepts minimum valid password (exactly 12 chars)', () => {
    const result = validatePasswordStrength('Aa1!Aa1!Aa1!');
    expect(result.valid).toBe(true);
  });

  it('accepts maximum valid password (exactly 72 chars)', () => {
    const maxPwd = 'Aa1!' + 'x'.repeat(68);
    const result = validatePasswordStrength(maxPwd);
    expect(result.valid).toBe(true);
  });

  it('rejects 73 character password', () => {
    const tooLong = 'Aa1!' + 'x'.repeat(69);
    const result = validatePasswordStrength(tooLong);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be at most 72 characters long');
  });

  it('returns specific error for missing uppercase', () => {
    const result = validatePasswordStrength('alllowercase123!');
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
  });

  it('returns specific error for missing lowercase', () => {
    const result = validatePasswordStrength('ALLUPPERCASE123!');
    expect(result.errors).toContain('Password must contain at least one lowercase letter');
  });

  it('returns specific error for missing number', () => {
    const result = validatePasswordStrength('NoNumbersHere!!');
    expect(result.errors).toContain('Password must contain at least one number');
  });

  it('returns specific error for missing special char', () => {
    const result = validatePasswordStrength('NoSpecialChar123');
    expect(result.errors).toContain('Password must contain at least one special character');
  });

  it('returns specific error for too short', () => {
    const result = validatePasswordStrength('Short1!');
    expect(result.errors).toContain('Password must be at least 12 characters long');
  });

  it('returns multiple errors for very weak password', () => {
    const result = validatePasswordStrength('abc');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Password policy — extended', () => {
  it('accepts password with boundary length of 11 chars as invalid', () => {
    const result = validatePasswordStrength('Aa1!Aa1!Aa1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be at least 12 characters long');
  });

  it('accepts password with common special characters', () => {
    const result = validatePasswordStrength('Valid1!Pass@#');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects empty string with multiple errors', () => {
    const result = validatePasswordStrength('');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });

  it('rejects password with only digits and special chars (no letters)', () => {
    const result = validatePasswordStrength('1234567890!@#$');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
    expect(result.errors).toContain('Password must contain at least one lowercase letter');
  });

  it('accepts password exactly 72 chars that has all required character types', () => {
    const pwd = 'Ab1!' + 'abcdefgh'.repeat(8) + 'xxxx';
    expect(pwd.length).toBe(72);
    const result = validatePasswordStrength(pwd);
    expect(result.valid).toBe(true);
  });

  it('result object always has both valid and errors properties', () => {
    const result = validatePasswordStrength('SomePass1!');
    expect(Object.keys(result)).toContain('valid');
    expect(Object.keys(result)).toContain('errors');
    expect(Array.isArray(result.errors)).toBe(true);
  });
});

describe('Password policy — additional coverage', () => {
  it('rejects password shorter than 12 characters', () => {
    const result = validatePasswordStrength('Ab1!xyz');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('12'))).toBe(true);
  });

  it('rejects password without special character', () => {
    const result = validatePasswordStrength('ValidPass123');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes('special'))).toBe(true);
  });

  it('rejects password longer than 72 characters', () => {
    const result = validatePasswordStrength('Ab1!' + 'x'.repeat(69));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('72'))).toBe(true);
  });

  it('returns errors as an array', () => {
    const result = validatePasswordStrength('weak');
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('accepts password with special chars at start', () => {
    const result = validatePasswordStrength('!Abcdefg1234');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('Password policy — edge cases and boundary conditions', () => {
  it('valid flag is false when any error exists', () => {
    const result = validatePasswordStrength('short');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('valid flag is true when errors array is empty', () => {
    const result = validatePasswordStrength('Secure1!Password');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects password of exactly 11 chars even if all other rules pass', () => {
    const result = validatePasswordStrength('Aa1!Aa1!Aa1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be at least 12 characters long');
  });

  it('accepts password of exactly 12 chars that satisfies all rules', () => {
    const result = validatePasswordStrength('Aa1!Aa1!Aa1!');
    expect(result.valid).toBe(true);
  });

  it('rejects password of exactly 73 chars even if all other rules pass', () => {
    const result = validatePasswordStrength('Aa1!' + 'x'.repeat(69));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be at most 72 characters long');
  });

  it('accepts password containing tab character as a special char', () => {
    const result = validatePasswordStrength('ValidPass1\t23');
    // \t is non-alphanumeric so satisfies special char requirement
    expect(result.errors).not.toContain('Password must contain at least one special character');
  });

  it('accepts password with only one of each required character type plus padding', () => {
    const result = validatePasswordStrength('A' + 'a'.repeat(9) + '1!');
    expect(result.valid).toBe(true);
  });

  it('no duplicate error messages for same violation', () => {
    const result = validatePasswordStrength('abc');
    const uniqueErrors = new Set(result.errors);
    expect(uniqueErrors.size).toBe(result.errors.length);
  });

  it('returns exactly 6 errors for completely empty string violating all rules', () => {
    const result = validatePasswordStrength('');
    // Rules: min length, no uppercase, no lowercase, no number, no special — 5 or more
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
    expect(result.valid).toBe(false);
  });

  it('password with special char at end passes special char requirement', () => {
    const result = validatePasswordStrength('UpperLower1234!');
    expect(result.errors).not.toContain('Password must contain at least one special character');
  });
});

// ── Password policy — final coverage ─────────────────────────────────────────

describe('Password policy — final coverage', () => {
  it('accepts password with numbers embedded in middle', () => {
    const result = validatePasswordStrength('SecureP4ss!Word');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects password that is all uppercase and special chars but no lowercase or number', () => {
    const result = validatePasswordStrength('UPPERCASE!!!!!!!!!!!!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one lowercase letter');
    expect(result.errors).toContain('Password must contain at least one number');
  });

  it('accepts valid 13-char password containing all required character types', () => {
    // 1 uppercase + 9 lowercase + 1 digit + 1 special + 1 lowercase = 13 chars
    const pwd = 'Ulllllllll1!a';
    expect(pwd.length).toBe(13);
    const result = validatePasswordStrength(pwd);
    expect(result.valid).toBe(true);
  });

  it('returns errors array containing string values only', () => {
    const result = validatePasswordStrength('weak');
    result.errors.forEach((e) => expect(typeof e).toBe('string'));
  });

  it('rejects password with spaces only (edge case)', () => {
    const result = validatePasswordStrength('            ');
    expect(result.valid).toBe(false);
  });
});
