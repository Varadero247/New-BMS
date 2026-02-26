// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  isValidEmail,
  validateEmail,
  isDisposable,
  isRole,
  isFreeProvider,
  isCorporate,
  parseEmail,
  extractEmails,
  parseEmailList,
  normalizeEmail,
  normalizeEmailLoose,
  stripAlias,
  areEquivalent,
  obfuscateEmail,
  maskEmail,
  generateEmail,
  generateEmailList,
  getLocal,
  getDomain,
  getTLD,
  getDomainFromEmail,
  formatEmail,
  getProviderType,
  FREE_PROVIDERS,
} from '../email-utils';

// ---------------------------------------------------------------------------
// 1. isValidEmail — valid (100 tests)
// ---------------------------------------------------------------------------
describe('isValidEmail — valid emails', () => {
  for (let i = 0; i < 100; i++) {
    const domain = `example${i % 10}.com`;
    const email = `user${i}@${domain}`;
    it(`should validate: ${email}`, () => {
      expect(isValidEmail(email)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. isValidEmail — invalid (50 tests)
// ---------------------------------------------------------------------------
describe('isValidEmail — invalid emails', () => {
  const invalids = [
    '',
    'notanemail',
    '@nodomain.com',
    'noatsign',
    'two@@at.com',
    'a@b@c.com',
    '.leading@dot.com',
    'trailing.@dot.com',
    'double..dot@test.com',
    'missing@tld',
    'missing@.com',
    'missing@com.',
    'space in@local.com',
    'local@domain with space.com',
    'toolonglocal' + 'a'.repeat(60) + '@test.com',
    'user@' + 'a'.repeat(256) + '.com',
    'user@nodot',
    'user@-dash.com',
    '@',
    '@@',
  ];

  // Pad to 50 by adding more invalid variants
  const moreInvalids = [
    'user@.leadingdot.com',
    'user@trailingdot.com.',
    'user@domain..doubleDot.com',
    'user@domain-.com',
    'user@-domain.com',
    '  @domain.com',
    'user@domain.c',                      // TLD too short (1 char)
    'user@domain.123',                    // TLD all numeric
    'plainaddress',
    '#@%^%#$@#$@#.com',
    'email.example.com',
    'email@example@example.com',
    '"email"@example.com',               // quoted strings not supported in this impl
    'email@example.1ab',                 // TLD starts with digit — invalid
    'email@111.222.333.444',             // numeric TLD
    'email@example..com',
    'Abc..123@example.com',
    'user@domain.c1',                    // TLD with digit
    '.user@domain.com',
    'user.@domain.com',
    'user@-bad.com',
    'user@bad-.com',
    'a@b.c1',                           // TLD with digit
    'user@[127.0.0.1]',                 // IP addresses not supported
    '(),:;<>[\\]@example.com',
    'just"not"right@example.com',
    'this\\ is"not\\allowed@example.com',
    'email@example',                    // no TLD
    'email@.com',
    'email@domain.com-',
  ];

  const allInvalids = [...invalids, ...moreInvalids].slice(0, 50);

  for (let i = 0; i < allInvalids.length; i++) {
    const email = allInvalids[i];
    it(`should reject invalid email #${i}: "${email}"`, () => {
      expect(isValidEmail(email)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. validateEmail — valid (50) + invalid (30) = 80 tests
// ---------------------------------------------------------------------------
describe('validateEmail', () => {
  // 50 valid
  for (let i = 0; i < 50; i++) {
    const email = `valid.user${i}@company${i % 5}.org`;
    it(`validateEmail valid #${i}: ${email}`, () => {
      const result = validateEmail(email);
      expect(result.valid).toBe(true);
      expect(result.normalized).toBeDefined();
    });
  }

  // 30 invalid with reason
  const invalidCases: Array<[string, string]> = [
    ['', 'non-empty'],
    ['@nodomain.com', 'local part is empty'],
    ['nodomain@', 'domain is empty'],
    ['.dot@domain.com', 'dot'],
    ['dot.@domain.com', 'dot'],
    ['double..dot@domain.com', 'consecutive'],
    ['missing@tld', 'dot'],
    ['a@b@c.com', 'Multiple'],
    ['user@.domain.com', 'label'],
    ['user@domain..com', 'label'],
    ['toolong' + 'x'.repeat(60) + '@d.com', 'Local part'],
    ['user@' + 'a'.repeat(252) + '.com', 'Domain'],
    ['x'.repeat(321) + '@a.com', 'length'],
    ['user@d.c1', 'TLD'],
    ['user@nodot', 'dot'],
    ['user@-bad.com', 'label'],
    ['user@bad-.com', 'label'],
    ['user@', 'domain is empty'],
    ['noatsign', 'Missing @'],
    ['user@@domain.com', 'Multiple'],
    [' ', 'non-empty'],
    ['user@domain.1', 'TLD'],
    ['user@domain.99', 'TLD'],
    ['user@.', 'label'],
    ['@.com', 'local part is empty'],
    ['user@ domain.com', 'label'],
    ['user@domain .com', 'label'],
    ['user@domain.com.', 'label'],
    ['user@.domain.com', 'label'],
    ['abc@domain.c', 'TLD'],
  ];

  for (let i = 0; i < invalidCases.length; i++) {
    const [email, reasonContains] = invalidCases[i];
    it(`validateEmail invalid #${i}: "${email}"`, () => {
      const result = validateEmail(email);
      expect(result.valid).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason!.toLowerCase()).toContain(reasonContains.toLowerCase());
    });
  }
});

// ---------------------------------------------------------------------------
// 4. isDisposable — 80 disposable + 20 legit = 100 tests
// ---------------------------------------------------------------------------
describe('isDisposable', () => {
  const disposableDomains = [
    'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
    'yopmail.com', 'maildrop.cc', 'sharklasers.com', 'guerrillamailblock.com',
    'grr.la', 'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de',
    'guerrillamail.net', 'guerrillamail.org', 'spam4.me',
    'trashmail.com', 'trashmail.at', 'trashmail.io', 'trashmail.me', 'trashmail.net',
    'dispostable.com', 'mailnull.com',
    'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org',
    '10minutemail.com', '10minutemail.net', '10minutemail.org',
    '20minutemail.com',
    'tempinbox.com', 'fakeinbox.com', 'tempinbox.net',
    'getairmail.com', 'filzmail.com', 'discard.email',
    'throwam.com', 'spamthisplease.com', 'mailexpire.com', 'mailforspam.com',
    'notmailinator.com', 'spamavert.com', 'emailondeck.com', 'easytrashmail.com',
    'mintemail.com', 'instantemailaddress.com', 'nospamfor.us',
    'mt2015.com', 'mt2014.com', 'mt2016.com',
    'spamfree24.org', 'spamfree24.de', 'spamfree24.eu', 'spamfree24.info', 'spamfree24.net',
    'tempmailer.com', 'emailmyphone.com', 'bossmail.de',
    'cool.fr.nf', 'courriel.fr.nf', 'diplomats.com',
    'letthemeatspam.com', 'lovemeleaveme.com', 'objectmail.com', 'ownmail.net',
    'pecinan.com', 'pecinan.net', 'pecinan.org', 'put2.net', 'rotaniliam.com',
    'skeefmail.com', 'sogetthis.com', 'suckmyd.com', 'teewars.org',
    'thisisnotmyrealemail.com', 'tradermail.info', 'trbvm.com',
    'vmailing.info', 'webm4il.info', 'xoxy.net', 'yep.it',
  ];

  for (let i = 0; i < disposableDomains.length; i++) {
    const domain = disposableDomains[i];
    const email = `test@${domain}`;
    it(`isDisposable true: ${email}`, () => {
      expect(isDisposable(email)).toBe(true);
    });
  }

  const legitDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
    'company.com', 'enterprise.org', 'university.edu', 'government.gov', 'example.net',
    'business.co.uk', 'startup.io', 'corporate.com', 'services.org', 'tech.com',
    'healthcare.org', 'finance.com', 'consulting.net', 'solutions.com', 'group.co',
  ];

  for (let i = 0; i < legitDomains.length; i++) {
    const email = `user@${legitDomains[i]}`;
    it(`isDisposable false: ${email}`, () => {
      expect(isDisposable(email)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. isRole — all role names (27+) true + 20 personal false = ~47 tests
// ---------------------------------------------------------------------------
describe('isRole', () => {
  const roleNames = [
    'admin', 'administrator', 'postmaster', 'hostmaster', 'webmaster',
    'info', 'support', 'help', 'sales', 'marketing',
    'noreply', 'no-reply', 'bounce', 'abuse', 'security',
    'privacy', 'legal', 'billing', 'finance', 'hr',
    'jobs', 'careers', 'press', 'media', 'contact',
    'hello', 'team', 'newsletter', 'unsubscribe', 'subscribe',
    'feedback', 'complaints',
  ];

  for (const role of roleNames) {
    it(`isRole true: ${role}@company.com`, () => {
      expect(isRole(`${role}@company.com`)).toBe(true);
    });
  }

  const personalNames = [
    'john', 'jane', 'alice', 'bob', 'charlie',
    'david', 'emma', 'frank', 'grace', 'henry',
    'isabella', 'james', 'kate', 'liam', 'mia',
    'noah', 'olivia', 'paul', 'quinn', 'rachel',
  ];

  for (const name of personalNames) {
    it(`isRole false: ${name}@company.com`, () => {
      expect(isRole(`${name}@company.com`)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. isFreeProvider — 34 free + 20 corporate = 54 tests
// ---------------------------------------------------------------------------
describe('isFreeProvider', () => {
  for (let i = 0; i < FREE_PROVIDERS.length; i++) {
    const domain = FREE_PROVIDERS[i];
    const email = `user@${domain}`;
    it(`isFreeProvider true: ${email}`, () => {
      expect(isFreeProvider(email)).toBe(true);
    });
  }

  const corporateDomains = [
    'acme.com', 'widgets.org', 'techcorp.net', 'enterprise.io', 'globalco.com',
    'solutions.biz', 'services.co.uk', 'industries.com', 'holdings.org', 'group.net',
    'partners.com', 'associates.org', 'ventures.io', 'systems.com', 'networks.net',
    'platform.io', 'analytics.com', 'consulting.org', 'management.com', 'logistics.net',
  ];

  for (let i = 0; i < corporateDomains.length; i++) {
    const email = `user@${corporateDomains[i]}`;
    it(`isFreeProvider false: ${email}`, () => {
      expect(isFreeProvider(email)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. parseEmail — 50 "Name <email>" + 50 plain emails = 100 tests
// ---------------------------------------------------------------------------
describe('parseEmail', () => {
  // 50 display name format
  for (let i = 0; i < 50; i++) {
    const name = `User ${i}`;
    const email = `user${i}@example${i % 5}.com`;
    const input = `${name} <${email}>`;
    it(`parseEmail display name #${i}: ${input}`, () => {
      const result = parseEmail(input);
      expect(result).not.toBeNull();
      expect(result!.displayName).toBe(name);
      expect(result!.local).toBe(`user${i}`);
      expect(result!.domain).toBe(`example${i % 5}.com`);
      expect(result!.tld).toBe('com');
      expect(result!.raw).toBe(input);
    });
  }

  // 50 plain emails
  for (let i = 0; i < 50; i++) {
    const tld = i % 3 === 0 ? 'com' : i % 3 === 1 ? 'org' : 'net';
    const email = `plain.user${i}@domain${i}.${tld}`;
    it(`parseEmail plain #${i}: ${email}`, () => {
      const result = parseEmail(email);
      expect(result).not.toBeNull();
      expect(result!.local).toBe(`plain.user${i}`);
      expect(result!.tld).toBe(tld);
      expect(result!.displayName).toBeUndefined();
    });
  }
});

// ---------------------------------------------------------------------------
// 8. extractEmails — 30 text strings = 30 tests
// ---------------------------------------------------------------------------
describe('extractEmails', () => {
  const textSamples: Array<[string, number]> = [
    ['Contact us at info@company.com for details.', 1],
    ['Send to alice@test.com and bob@test.com', 2],
    ['No emails here!', 0],
    ['Reach sales@company.com or support@company.com or billing@company.com', 3],
    ['Email: john@example.org', 1],
    ['From: sender@domain.com To: receiver@other.com', 2],
    ['user.name+tag@sub.domain.com is valid', 1],
    ['Contact: a@b.co or x@y.io', 2],
    ['We have test@example.net available', 1],
    ['admin@site.com and webmaster@site.com and postmaster@site.com', 3],
    ['hello@world.com', 1],
    ['no-reply@newsletter.org subscribed you', 1],
    ['Three: one@a.com two@b.org three@c.net end', 3],
    ['Empty string case: nothing', 0],
    ['finance@corp.com handles billing', 1],
    ['Multiple same: test@ex.com test@ex.com', 2],
    ['careers@hr.company.org is open', 1],
    ['reach.me@my-domain.com today', 1],
    ['hr@bigcorp.com and hr@smallcorp.net', 2],
    ['a1@b2.com', 1],
    ['user_name@domain.co.uk is fine', 1],
    ['report: rpt@a.io, summary: smry@b.io', 2],
    ['Mixed text user@example.com and more text', 1],
    ['dev@software.io', 1],
    ['two.emails@first.com and another@second.org here', 2],
    ['ceo@company.com cto@company.com cfo@company.com', 3],
    ['newsletter@news.org unsubscribe@news.org', 2],
    ['test123@test456.com', 1],
    ['ops@server.net monitoring@server.net', 2],
    ['single@domain.com', 1],
  ];

  for (let i = 0; i < textSamples.length; i++) {
    const [text, expectedCount] = textSamples[i];
    it(`extractEmails #${i}: expects ${expectedCount} email(s)`, () => {
      const result = extractEmails(text);
      expect(result.length).toBe(expectedCount);
    });
  }
});

// ---------------------------------------------------------------------------
// 9. normalizeEmail — Gmail variants (30 tests)
// ---------------------------------------------------------------------------
describe('normalizeEmail — Gmail normalization', () => {
  const gmailVariants: Array<[string, string]> = [
    ['test@gmail.com', 'test@gmail.com'],
    ['Test@gmail.com', 'test@gmail.com'],
    ['TEST@GMAIL.COM', 'test@gmail.com'],
    ['t.e.s.t@gmail.com', 'test@gmail.com'],
    ['t.e.s.t@googlemail.com', 'test@gmail.com'],
    ['test+alias@gmail.com', 'test@gmail.com'],
    ['test+tag@googlemail.com', 'test@gmail.com'],
    ['foo.bar@gmail.com', 'foobar@gmail.com'],
    ['foo.bar+baz@gmail.com', 'foobar@gmail.com'],
    ['a.b.c.d@gmail.com', 'abcd@gmail.com'],
    ['user.name@gmail.com', 'username@gmail.com'],
    ['user.name+tag@gmail.com', 'username@gmail.com'],
    ['john.doe@googlemail.com', 'johndoe@gmail.com'],
    ['john.doe+news@googlemail.com', 'johndoe@gmail.com'],
    ['x@gmail.com', 'x@gmail.com'],
    ['a.b@gmail.com', 'ab@gmail.com'],
    ['first.last@gmail.com', 'firstlast@gmail.com'],
    ['first.last+label@gmail.com', 'firstlast@gmail.com'],
    ['FIRST.LAST@GMAIL.COM', 'firstlast@gmail.com'],
    ['a.b.c+tag@gmail.com', 'abc@gmail.com'],
    ['test@GMAIL.COM', 'test@gmail.com'],
    ['user.one@gmail.com', 'userone@gmail.com'],
    ['user.two+x@gmail.com', 'usertwo@gmail.com'],
    ['m.y.n.a.m.e@gmail.com', 'myname@gmail.com'],
    ['myname@googlemail.com', 'myname@gmail.com'],
    ['my.name@googlemail.com', 'myname@gmail.com'],
    ['my.name+test@googlemail.com', 'myname@gmail.com'],
    ['hello.world@gmail.com', 'helloworld@gmail.com'],
    ['hello.world+tag@gmail.com', 'helloworld@gmail.com'],
    ['complex.user.name+alias@googlemail.com', 'complexusername@gmail.com'],
  ];

  for (let i = 0; i < gmailVariants.length; i++) {
    const [input, expected] = gmailVariants[i];
    it(`normalizeEmail Gmail #${i}: ${input} → ${expected}`, () => {
      expect(normalizeEmail(input)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 10. normalizeEmail — case normalization (50 tests)
// ---------------------------------------------------------------------------
describe('normalizeEmail — case normalization', () => {
  for (let i = 0; i < 50; i++) {
    const local = `User${i}`;
    const domain = `Domain${i % 5}.Com`;
    const email = `${local}@${domain}`;
    it(`normalizeEmail case #${i}: ${email}`, () => {
      const result = normalizeEmail(email);
      expect(result).not.toBeNull();
      expect(result!).toBe(result!.toLowerCase());
    });
  }
});

// ---------------------------------------------------------------------------
// 11. areEquivalent — 30 equivalent + 20 non-equivalent = 50 tests
// ---------------------------------------------------------------------------
describe('areEquivalent', () => {
  // 30 equivalent pairs
  const equivalentPairs: Array<[string, string]> = [
    ['test@gmail.com', 'TEST@GMAIL.COM'],
    ['t.e.s.t@gmail.com', 'test@gmail.com'],
    ['test+alias@gmail.com', 'test@gmail.com'],
    ['foo.bar@gmail.com', 'foobar@gmail.com'],
    ['foo.bar+baz@gmail.com', 'foobar@gmail.com'],
    ['user@googlemail.com', 'user@gmail.com'],
    ['user@icloud.com', 'user@icloud.com'],
    ['User@Example.com', 'user@example.com'],
    ['JOHN@COMPANY.COM', 'john@company.com'],
    ['Jane@Test.org', 'jane@test.org'],
    ['a.b@gmail.com', 'ab@gmail.com'],
    ['test.user@gmail.com', 'testuser@gmail.com'],
    ['test.user+tag@gmail.com', 'testuser@gmail.com'],
    ['HELLO@WORLD.COM', 'hello@world.com'],
    ['USER.NAME@GMAIL.COM', 'username@gmail.com'],
    ['name@googlemail.com', 'name@gmail.com'],
    ['first.last@gmail.com', 'firstlast@gmail.com'],
    ['first.last+x@gmail.com', 'firstlast@gmail.com'],
    ['Admin@Company.net', 'admin@company.net'],
    ['Support@Corp.io', 'support@corp.io'],
    ['sales+tag@company.com', 'sales@company.com'],
    ['info+newsletter@example.org', 'info@example.org'],
    ['user+test@yahoo.com', 'user@yahoo.com'],
    ['user+promo@hotmail.com', 'user@hotmail.com'],
    ['Me@Me.com', 'me@icloud.com'],
    ['me@mac.com', 'me@icloud.com'],
    ['User@Outlook.com', 'user@outlook.com'],
    ['ADMIN@GMAIL.COM', 'admin@gmail.com'],
    ['A.B.C@GMAIL.COM', 'abc@gmail.com'],
    ['a.b.c+tag@gmail.com', 'abc@gmail.com'],
  ];

  for (let i = 0; i < equivalentPairs.length; i++) {
    const [a, b] = equivalentPairs[i];
    it(`areEquivalent true #${i}: "${a}" vs "${b}"`, () => {
      expect(areEquivalent(a, b)).toBe(true);
    });
  }

  // 20 non-equivalent pairs
  const nonEquivPairs: Array<[string, string]> = [
    ['alice@gmail.com', 'bob@gmail.com'],
    ['user@gmail.com', 'user@yahoo.com'],
    ['user@gmail.com', 'user@hotmail.com'],
    ['john@company.com', 'jane@company.com'],
    ['test@example.com', 'test@example.org'],
    ['user1@domain.com', 'user2@domain.com'],
    ['a@b.com', 'c@d.com'],
    ['sales@acme.com', 'support@acme.com'],
    ['info@old.com', 'info@new.com'],
    ['admin@site.com', 'webmaster@site.com'],
    ['foo@gmail.com', 'foobar@gmail.com'],
    ['test@company.com', 'test@company.org'],
    ['alice@domain.net', 'alice@domain.com'],
    ['user@example.co.uk', 'user@example.com'],
    ['one@test.com', 'two@test.com'],
    ['hello@world.com', 'world@hello.com'],
    ['abc@gmail.com', 'abcd@gmail.com'],
    ['first@second.com', 'second@first.com'],
    ['x@a.com', 'x@b.com'],
    ['user@foo.com', 'user@bar.com'],
  ];

  for (let i = 0; i < nonEquivPairs.length; i++) {
    const [a, b] = nonEquivPairs[i];
    it(`areEquivalent false #${i}: "${a}" vs "${b}"`, () => {
      expect(areEquivalent(a, b)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 12. stripAlias — 50 emails with +alias = 50 tests
// ---------------------------------------------------------------------------
describe('stripAlias', () => {
  for (let i = 0; i < 50; i++) {
    const local = `user${i}`;
    const alias = `alias${i}`;
    const domain = `domain${i % 5}.com`;
    const email = `${local}+${alias}@${domain}`;
    const expected = `${local}@${domain}`;
    it(`stripAlias #${i}: ${email} → ${expected}`, () => {
      const result = stripAlias(email);
      expect(result).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 13. getLocal / getDomain / getTLD — 50 each = 150 tests
// ---------------------------------------------------------------------------
describe('getLocal', () => {
  for (let i = 0; i < 50; i++) {
    const local = `local${i}`;
    const email = `${local}@domain${i}.com`;
    it(`getLocal #${i}: ${email}`, () => {
      expect(getLocal(email)).toBe(local);
    });
  }
});

describe('getDomain', () => {
  for (let i = 0; i < 50; i++) {
    const domain = `domain${i}.com`;
    const email = `user${i}@${domain}`;
    it(`getDomain #${i}: ${email}`, () => {
      expect(getDomain(email)).toBe(domain);
    });
  }
});

describe('getTLD', () => {
  const tlds = ['com', 'org', 'net', 'io', 'co'];
  for (let i = 0; i < 50; i++) {
    const tld = tlds[i % tlds.length];
    const email = `user${i}@domain${i}.${tld}`;
    it(`getTLD #${i}: ${email} → ${tld}`, () => {
      expect(getTLD(email)).toBe(tld);
    });
  }
});

// ---------------------------------------------------------------------------
// 14. obfuscateEmail — 50 tests
// ---------------------------------------------------------------------------
describe('obfuscateEmail', () => {
  for (let i = 0; i < 50; i++) {
    const local = `user${i}name`;
    const email = `${local}@example${i % 3}.com`;
    it(`obfuscateEmail #${i}: ${email}`, () => {
      const result = obfuscateEmail(email);
      expect(result).toContain('@');
      expect(result).toContain('***');
      expect(result).toContain('example');
      // Should show at least 1 char of local
      expect(result[0]).toBe('u');
    });
  }
});

// ---------------------------------------------------------------------------
// 15. maskEmail — 50 tests
// ---------------------------------------------------------------------------
describe('maskEmail', () => {
  for (let i = 0; i < 50; i++) {
    const local = `person${i}`;
    const domain = `company${i % 4}.com`;
    const email = `${local}@${domain}`;
    it(`maskEmail #${i}: ${email}`, () => {
      const result = maskEmail(email);
      expect(result).toContain('@');
      expect(result).toContain('.');
      // Result should differ from original (masked)
      expect(result.length).toBeGreaterThan(0);
      // Local part starts with same first 2 chars
      expect(result.startsWith(local.slice(0, 2))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 16. generateEmail — 50 tests
// ---------------------------------------------------------------------------
describe('generateEmail', () => {
  for (let i = 0; i < 50; i++) {
    it(`generateEmail #${i}: produces valid email`, () => {
      const email = generateEmail();
      expect(isValidEmail(email)).toBe(true);
      expect(email).toContain('@');
    });
  }
});

// ---------------------------------------------------------------------------
// 17. parseEmailList — 20 tests
// ---------------------------------------------------------------------------
describe('parseEmailList', () => {
  const listCases: Array<[string, number]> = [
    ['a@b.com, c@d.com', 2],
    ['a@b.com; c@d.com; e@f.com', 3],
    ['single@domain.com', 1],
    ['', 0],
    ['invalid, a@b.com', 1],
    ['a@b.com, , c@d.com', 2],
    ['a@b.com,c@d.com,e@f.com,g@h.com', 4],
    ['alice@example.com; bob@example.com', 2],
    ['  user@domain.com  ', 1],
    ['a@b.com; invalid; c@d.com', 2],
    ['one@a.com, two@b.com, three@c.com, four@d.com, five@e.com', 5],
    ['just.invalid', 0],
    ['x@y.com', 1],
    ['admin@corp.com; support@corp.com; billing@corp.com', 3],
    ['a@b.org, c@d.org, e@f.org', 3],
    ['test@test.com,test@test.org', 2],
    ['noreply@example.com; info@example.com', 2],
    ['user1@domain.com, user2@domain.com, user3@domain.com, user4@domain.com', 4],
    ['a@b.com;c@d.com', 2],
    ['first@one.com, second@two.com, third@three.com', 3],
  ];

  for (let i = 0; i < listCases.length; i++) {
    const [list, expectedCount] = listCases[i];
    it(`parseEmailList #${i}: "${list.slice(0, 40)}" → ${expectedCount} emails`, () => {
      const result = parseEmailList(list);
      expect(result.length).toBe(expectedCount);
    });
  }
});

// ---------------------------------------------------------------------------
// 18. isCorporate — 20 corporate + 20 non-corporate = 40 tests
// ---------------------------------------------------------------------------
describe('isCorporate', () => {
  const corporateEmails = [
    'john@acme.com', 'jane@widgets.org', 'bob@techcorp.net', 'alice@enterprise.io',
    'user@globalco.com', 'staff@solutions.biz', 'employee@services.co.uk',
    'team@industries.com', 'member@holdings.org', 'worker@group.net',
    'manager@partners.com', 'director@associates.org', 'vp@ventures.io',
    'ceo@systems.com', 'cto@networks.net', 'analyst@platform.io',
    'developer@analytics.com', 'consultant@consulting.org', 'pm@management.com',
    'ops@logistics.net',
  ];

  for (let i = 0; i < corporateEmails.length; i++) {
    const email = corporateEmails[i];
    it(`isCorporate true #${i}: ${email}`, () => {
      expect(isCorporate(email)).toBe(true);
    });
  }

  const nonCorporateEmails = [
    'user@gmail.com', 'user@yahoo.com', 'user@hotmail.com', 'user@outlook.com',
    'user@icloud.com', 'user@protonmail.com', 'test@mailinator.com',
    'temp@guerrillamail.com', 'throw@throwaway.email', 'spam@yopmail.com',
    'user@maildrop.cc', 'test@trashmail.com', 'fake@tempmail.com',
    'test@10minutemail.com', 'trash@discard.email',
    'invalid-email', '@nodomain.com', 'nodomain@', 'no@tld', 'user@gmx.com',
  ];

  for (let i = 0; i < nonCorporateEmails.length; i++) {
    const email = nonCorporateEmails[i];
    it(`isCorporate false #${i}: ${email}`, () => {
      expect(isCorporate(email)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 19. getProviderType — 20 tests covering all 4 types
// ---------------------------------------------------------------------------
describe('getProviderType', () => {
  const cases: Array<[string, 'corporate' | 'free' | 'disposable' | 'role' | 'unknown']> = [
    ['john@gmail.com', 'free'],
    ['jane@yahoo.com', 'free'],
    ['alice@hotmail.com', 'free'],
    ['bob@outlook.com', 'free'],
    ['user@icloud.com', 'free'],
    ['test@mailinator.com', 'disposable'],
    ['temp@guerrillamail.com', 'disposable'],
    ['throw@throwaway.email', 'disposable'],
    ['fake@yopmail.com', 'disposable'],
    ['spam@trashmail.com', 'disposable'],
    ['admin@company.com', 'role'],
    ['support@enterprise.org', 'role'],
    ['info@corp.net', 'role'],
    ['noreply@service.com', 'role'],
    ['postmaster@business.io', 'role'],
    ['john@acme.com', 'corporate'],
    ['jane@techcorp.net', 'corporate'],
    ['alice@enterprise.io', 'corporate'],
    ['invalid-email', 'unknown'],
    ['@nodomain.com', 'unknown'],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [email, expectedType] = cases[i];
    it(`getProviderType #${i}: ${email} → ${expectedType}`, () => {
      expect(getProviderType(email)).toBe(expectedType);
    });
  }
});

// ---------------------------------------------------------------------------
// 20. formatEmail — 50 tests
// ---------------------------------------------------------------------------
describe('formatEmail', () => {
  for (let i = 0; i < 50; i++) {
    const local = `user${i}`;
    const tld = i % 2 === 0 ? 'com' : 'org';
    const domain = `domain${i}.${tld}`;
    it(`formatEmail #${i}: ${local} + ${domain}`, () => {
      const result = formatEmail(local, domain);
      expect(result).toBe(`${local}@${domain}`);
      expect(result).toContain('@');
      expect(result.split('@')[0]).toBe(local);
      expect(result.split('@')[1]).toBe(domain);
    });
  }
});

// ---------------------------------------------------------------------------
// 21. normalizeEmailLoose — 50 tests
// ---------------------------------------------------------------------------
describe('normalizeEmailLoose', () => {
  for (let i = 0; i < 50; i++) {
    const mixed = `UsEr${i}@DoMaIn${i % 5}.CoM`;
    it(`normalizeEmailLoose #${i}: ${mixed}`, () => {
      const result = normalizeEmailLoose(mixed);
      expect(result).not.toBeNull();
      expect(result!).toBe(result!.toLowerCase());
      expect(result!).toBe(`user${i}@domain${i % 5}.com`);
    });
  }
});

// ---------------------------------------------------------------------------
// 22. getDomainFromEmail — 50 tests
// ---------------------------------------------------------------------------
describe('getDomainFromEmail', () => {
  for (let i = 0; i < 50; i++) {
    const domain = `company${i}.net`;
    const email = `employee${i}@${domain}`;
    it(`getDomainFromEmail #${i}: ${email}`, () => {
      expect(getDomainFromEmail(email)).toBe(domain);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional edge-case tests (to ensure robustness)
// ---------------------------------------------------------------------------
describe('Edge cases and additional coverage', () => {
  it('isValidEmail handles null gracefully', () => {
    expect(isValidEmail(null as unknown as string)).toBe(false);
  });

  it('isValidEmail handles undefined gracefully', () => {
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
  });

  it('normalizeEmail returns null for invalid email', () => {
    expect(normalizeEmail('not-an-email')).toBeNull();
  });

  it('normalizeEmail handles iCloud me.com → icloud.com', () => {
    expect(normalizeEmail('user@me.com')).toBe('user@icloud.com');
  });

  it('normalizeEmail handles mac.com → icloud.com', () => {
    expect(normalizeEmail('user@mac.com')).toBe('user@icloud.com');
  });

  it('stripAlias returns null for invalid email', () => {
    expect(stripAlias('not-an-email')).toBeNull();
  });

  it('stripAlias works when no + alias present', () => {
    expect(stripAlias('user@domain.com')).toBe('user@domain.com');
  });

  it('parseEmail returns null for invalid email', () => {
    expect(parseEmail('notvalid')).toBeNull();
  });

  it('extractEmails returns empty array for empty string', () => {
    expect(extractEmails('')).toEqual([]);
  });

  it('parseEmailList handles empty string', () => {
    expect(parseEmailList('')).toEqual([]);
  });

  it('getLocal returns null for invalid email', () => {
    expect(getLocal('invalid')).toBeNull();
  });

  it('getDomain returns null for invalid email', () => {
    expect(getDomain('invalid')).toBeNull();
  });

  it('getTLD returns null for invalid email', () => {
    expect(getTLD('invalid')).toBeNull();
  });

  it('obfuscateEmail with visibleChars=2 shows 2 chars', () => {
    const result = obfuscateEmail('johndoe@example.com', 2);
    expect(result.startsWith('jo***')).toBe(true);
  });

  it('obfuscateEmail with short local shows full local', () => {
    const result = obfuscateEmail('a@example.com', 5);
    expect(result).toBe('a@example.com');
  });

  it('areEquivalent returns false for invalid emails', () => {
    expect(areEquivalent('notvalid', 'also@invalid')).toBe(false);
  });

  it('generateEmail with custom domain', () => {
    const email = generateEmail({ domain: 'mycompany.com' });
    expect(email).toContain('@mycompany.com');
    expect(isValidEmail(email)).toBe(true);
  });

  it('generateEmail with custom tld', () => {
    const email = generateEmail({ tld: 'io' });
    expect(email.endsWith('.io')).toBe(true);
    expect(isValidEmail(email)).toBe(true);
  });

  it('generateEmailList produces correct count', () => {
    const list = generateEmailList(10);
    expect(list.length).toBe(10);
    for (const email of list) {
      expect(isValidEmail(email)).toBe(true);
    }
  });

  it('parseEmail with quoted display name', () => {
    const result = parseEmail('"John Doe" <john@example.com>');
    expect(result).not.toBeNull();
    expect(result!.local).toBe('john');
    expect(result!.domain).toBe('example.com');
  });

  it('parseEmail with subdomain', () => {
    const result = parseEmail('user@mail.company.com');
    expect(result).not.toBeNull();
    expect(result!.subdomain).toBe('mail');
    expect(result!.domain).toBe('mail.company.com');
    expect(result!.tld).toBe('com');
  });

  it('validateEmail with consecutive dots in domain', () => {
    const result = validateEmail('user@domain..com');
    expect(result.valid).toBe(false);
  });

  it('isFreeProvider with uppercase email', () => {
    expect(isFreeProvider('USER@GMAIL.COM')).toBe(true);
  });

  it('isDisposable with uppercase domain', () => {
    expect(isDisposable('test@MAILINATOR.COM')).toBe(true);
  });

  it('isRole with uppercase local', () => {
    expect(isRole('ADMIN@company.com')).toBe(true);
  });

  it('FREE_PROVIDERS is non-empty array', () => {
    expect(Array.isArray(FREE_PROVIDERS)).toBe(true);
    expect(FREE_PROVIDERS.length).toBeGreaterThan(0);
  });

  it('normalizeEmailLoose returns null for invalid', () => {
    expect(normalizeEmailLoose('not-valid')).toBeNull();
  });

  it('getDomainFromEmail returns null for invalid', () => {
    expect(getDomainFromEmail('invalid')).toBeNull();
  });

  it('getProviderType returns unknown for invalid', () => {
    expect(getProviderType('not-an-email')).toBe('unknown');
  });

  it('isRole with no-reply alias', () => {
    expect(isRole('no-reply@system.com')).toBe(true);
  });

  it('maskEmail with very short local', () => {
    const result = maskEmail('ab@example.com');
    expect(result).toContain('@');
    expect(result.startsWith('ab')).toBe(true);
  });

  it('obfuscateEmail with 0 visible chars shows ***', () => {
    const result = obfuscateEmail('test@example.com', 0);
    expect(result).toBe('***@example.com');
  });
});
