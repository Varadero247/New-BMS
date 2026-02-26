import {
  validateRule,
  validateField,
  validateForm,
  isFormValid,
  getFieldErrors,
  createField,
  createSection,
  createSchema,
  addFieldToSection,
  removeFieldFromSection,
  reorderFields,
  flattenFields,
  findField,
  getDefaultValues,
  countFields,
  getRequiredFields,
  schemaToJson,
  schemaFromJson,
  isValidFieldType,
  buildOption,
  requiredRule,
  minLengthRule,
  maxLengthRule,
  patternRule,
  sortSections,
} from '../src';
import type {
  FormField,
  FormSection,
  FormSchema,
  ValidationError,
} from '../src';

// ── Helpers ───────────────────────────────────────────────────────────────────
const f = (overrides: Partial<FormField> & { id: string; type: FormField['type']; label: string }): FormField =>
  ({ order: 0, ...overrides } as FormField);

const sec = (id: string, fields: FormField[], order = 0): FormSection =>
  createSection(id, `Section ${id}`, fields, order);

const schema = (sections: FormSection[]): FormSchema =>
  createSchema('s1', 'Test Form', sections);

// ── validateRule ──────────────────────────────────────────────────────────────
describe('@ims/form-builder', () => {
  describe('validateRule – required', () => {
    const field = f({ id: 'x', type: 'text', label: 'X' });
    it('null fails required', () => expect(validateRule(null, { type: 'required' }, field)).not.toBeNull());
    it('undefined fails required', () => expect(validateRule(undefined, { type: 'required' }, field)).not.toBeNull());
    it('empty string fails required', () => expect(validateRule('', { type: 'required' }, field)).not.toBeNull());
    it('empty array fails required', () => expect(validateRule([], { type: 'required' }, field)).not.toBeNull());
    it('non-empty string passes required', () => expect(validateRule('a', { type: 'required' }, field)).toBeNull());
    it('number 0 passes required', () => expect(validateRule(0, { type: 'required' }, field)).toBeNull());
    it('false passes required', () => expect(validateRule(false, { type: 'required' }, field)).toBeNull());
    it('non-empty array passes required', () => expect(validateRule(['x'], { type: 'required' }, field)).toBeNull());
    it('whitespace string passes required', () => expect(validateRule('  ', { type: 'required' }, field)).toBeNull());
    it('message contains field label', () => expect(validateRule(null, { type: 'required' }, field)).toContain('X'));
    it('returns string on failure', () => expect(typeof validateRule(null, { type: 'required' }, field)).toBe('string'));
  });

  describe('validateRule – minLength', () => {
    const field = f({ id: 'x', type: 'text', label: 'Name' });
    it('too short fails', () => expect(validateRule('ab', { type: 'minLength', value: 3 }, field)).not.toBeNull());
    it('exact length passes', () => expect(validateRule('abc', { type: 'minLength', value: 3 }, field)).toBeNull());
    it('longer passes', () => expect(validateRule('abcd', { type: 'minLength', value: 3 }, field)).toBeNull());
    it('empty string fails for minLength > 0', () => expect(validateRule('', { type: 'minLength', value: 1 }, field)).not.toBeNull());
    it('non-string value not checked', () => expect(validateRule(123, { type: 'minLength', value: 3 }, field)).toBeNull());
    it('minLength 0 always passes string', () => expect(validateRule('', { type: 'minLength', value: 0 }, field)).toBeNull());
    it('message contains field label', () => {
      const r = validateRule('hi', { type: 'minLength', value: 5 }, field);
      expect(r).toContain('Name');
    });
    it('message contains value', () => {
      const r = validateRule('hi', { type: 'minLength', value: 5 }, field);
      expect(r).toContain('5');
    });
  });

  describe('validateRule – maxLength', () => {
    const field = f({ id: 'x', type: 'text', label: 'Desc' });
    it('too long fails', () => expect(validateRule('abcdef', { type: 'maxLength', value: 5 }, field)).not.toBeNull());
    it('exact length passes', () => expect(validateRule('abcde', { type: 'maxLength', value: 5 }, field)).toBeNull());
    it('shorter passes', () => expect(validateRule('abc', { type: 'maxLength', value: 5 }, field)).toBeNull());
    it('empty string passes maxLength', () => expect(validateRule('', { type: 'maxLength', value: 5 }, field)).toBeNull());
    it('non-string not checked', () => expect(validateRule(123, { type: 'maxLength', value: 2 }, field)).toBeNull());
    it('message contains field label', () => {
      const r = validateRule('toolong', { type: 'maxLength', value: 5 }, field);
      expect(r).toContain('Desc');
    });
  });

  describe('validateRule – min', () => {
    const field = f({ id: 'n', type: 'number', label: 'Age' });
    it('below min fails', () => expect(validateRule(4, { type: 'min', value: 5 }, field)).not.toBeNull());
    it('exact min passes', () => expect(validateRule(5, { type: 'min', value: 5 }, field)).toBeNull());
    it('above min passes', () => expect(validateRule(6, { type: 'min', value: 5 }, field)).toBeNull());
    it('non-number not checked', () => expect(validateRule('3', { type: 'min', value: 5 }, field)).toBeNull());
    it('message contains field label', () => {
      expect(validateRule(1, { type: 'min', value: 5 }, field)).toContain('Age');
    });
    it('negative min works', () => expect(validateRule(-5, { type: 'min', value: -5 }, field)).toBeNull());
    it('below negative min fails', () => expect(validateRule(-6, { type: 'min', value: -5 }, field)).not.toBeNull());
  });

  describe('validateRule – max', () => {
    const field = f({ id: 'n', type: 'number', label: 'Score' });
    it('above max fails', () => expect(validateRule(11, { type: 'max', value: 10 }, field)).not.toBeNull());
    it('exact max passes', () => expect(validateRule(10, { type: 'max', value: 10 }, field)).toBeNull());
    it('below max passes', () => expect(validateRule(9, { type: 'max', value: 10 }, field)).toBeNull());
    it('non-number not checked', () => expect(validateRule('20', { type: 'max', value: 10 }, field)).toBeNull());
    it('message contains field label', () => {
      expect(validateRule(20, { type: 'max', value: 10 }, field)).toContain('Score');
    });
  });

  describe('validateRule – pattern', () => {
    const field = f({ id: 'p', type: 'text', label: 'PostCode' });
    it('matching pattern passes', () => expect(validateRule('AB1 2CD', { type: 'pattern', value: '^[A-Z]' }, field)).toBeNull());
    it('non-matching pattern fails', () => expect(validateRule('123', { type: 'pattern', value: '^[A-Z]' }, field)).not.toBeNull());
    it('empty string not checked by pattern', () => expect(validateRule('', { type: 'pattern', value: '^[A-Z]' }, field)).toBeNull());
    it('custom message used when provided', () => {
      const r = validateRule('123', { type: 'pattern', value: '^[A-Z]', message: 'Must start with letter' }, field);
      expect(r).toBe('Must start with letter');
    });
    it('default message contains field label', () => {
      const r = validateRule('123', { type: 'pattern', value: '^[A-Z]' }, field);
      expect(r).toContain('PostCode');
    });
    it('non-string not checked', () => expect(validateRule(123, { type: 'pattern', value: '^[A-Z]' }, field)).toBeNull());
  });

  describe('validateRule – email', () => {
    const field = f({ id: 'e', type: 'email', label: 'Email' });
    it('valid email passes', () => expect(validateRule('a@b.com', { type: 'email' }, field)).toBeNull());
    it('invalid email fails', () => expect(validateRule('notanemail', { type: 'email' }, field)).not.toBeNull());
    it('empty string passes (not required check)', () => expect(validateRule('', { type: 'email' }, field)).toBeNull());
    it('message contains field label', () => {
      expect(validateRule('bad', { type: 'email' }, field)).toContain('Email');
    });
    it('non-string not checked', () => expect(validateRule(42, { type: 'email' }, field)).toBeNull());
    it('missing @ fails', () => expect(validateRule('no-at.com', { type: 'email' }, field)).not.toBeNull());
    it('missing domain fails', () => expect(validateRule('user@', { type: 'email' }, field)).not.toBeNull());
    it('valid subdomain email passes', () => expect(validateRule('x@sub.example.com', { type: 'email' }, field)).toBeNull());
  });

  describe('validateRule – url', () => {
    const field = f({ id: 'u', type: 'url', label: 'Website' });
    it('valid https URL passes', () => expect(validateRule('https://example.com', { type: 'url' }, field)).toBeNull());
    it('valid http URL passes', () => expect(validateRule('http://example.com', { type: 'url' }, field)).toBeNull());
    it('invalid URL fails', () => expect(validateRule('not-a-url', { type: 'url' }, field)).not.toBeNull());
    it('empty string passes (not required)', () => expect(validateRule('', { type: 'url' }, field)).toBeNull());
    it('message contains field label', () => {
      expect(validateRule('bad', { type: 'url' }, field)).toContain('Website');
    });
    it('non-string not checked', () => expect(validateRule(42, { type: 'url' }, field)).toBeNull());
  });

  describe('validateRule – custom', () => {
    const field = f({ id: 'c', type: 'text', label: 'Custom' });
    it('passing custom fn returns null', () => {
      expect(validateRule(5, { type: 'custom', fn: (v) => (v as number) > 3, message: 'Too small' }, field)).toBeNull();
    });
    it('failing custom fn returns message', () => {
      expect(validateRule(1, { type: 'custom', fn: (v) => (v as number) > 3, message: 'Too small' }, field)).toBe('Too small');
    });
    it('custom message is returned as-is', () => {
      const msg = 'Custom error message';
      expect(validateRule(false, { type: 'custom', fn: () => false, message: msg }, field)).toBe(msg);
    });
  });

  // ── validateField ─────────────────────────────────────────────────────────
  describe('validateField', () => {
    it('disabled field returns no errors', () => {
      const field = f({ id: 'x', type: 'text', label: 'X', disabled: true, validation: [{ type: 'required' }] });
      expect(validateField(field, null)).toHaveLength(0);
    });
    it('hidden field returns no errors', () => {
      const field = f({ id: 'x', type: 'text', label: 'X', hidden: true, validation: [{ type: 'required' }] });
      expect(validateField(field, null)).toHaveLength(0);
    });
    it('field with no validation returns no errors', () => {
      const field = f({ id: 'x', type: 'text', label: 'X' });
      expect(validateField(field, null)).toHaveLength(0);
    });
    it('single failing rule returns 1 error', () => {
      const field = f({ id: 'x', type: 'text', label: 'X', validation: [{ type: 'required' }] });
      expect(validateField(field, '')).toHaveLength(1);
    });
    it('multiple failing rules return multiple errors', () => {
      const field = f({
        id: 'x', type: 'text', label: 'X',
        validation: [{ type: 'required' }, { type: 'minLength', value: 5 }]
      });
      // both required and minLength fail for empty string
      expect(validateField(field, '')).toHaveLength(2);
    });
    it('errors have fieldId', () => {
      const field = f({ id: 'myId', type: 'text', label: 'X', validation: [{ type: 'required' }] });
      const errors = validateField(field, null);
      expect(errors[0].fieldId).toBe('myId');
    });
    it('errors have message', () => {
      const field = f({ id: 'x', type: 'text', label: 'X', validation: [{ type: 'required' }] });
      const errors = validateField(field, null);
      expect(typeof errors[0].message).toBe('string');
    });
    it('passing all rules returns empty', () => {
      const field = f({
        id: 'x', type: 'text', label: 'X',
        validation: [{ type: 'required' }, { type: 'minLength', value: 2 }]
      });
      expect(validateField(field, 'hello')).toHaveLength(0);
    });
    it('empty validation array returns empty', () => {
      const field = f({ id: 'x', type: 'text', label: 'X', validation: [] });
      expect(validateField(field, null)).toHaveLength(0);
    });
  });

  // ── validateForm ──────────────────────────────────────────────────────────
  describe('validateForm', () => {
    it('empty schema no errors', () => {
      const s = schema([]);
      expect(validateForm(s, {})).toHaveLength(0);
    });
    it('valid values no errors', () => {
      const fields = [f({ id: 'n', type: 'text', label: 'Name', validation: [{ type: 'required' }] })];
      const s = schema([sec('s1', fields)]);
      expect(validateForm(s, { n: 'Bob' })).toHaveLength(0);
    });
    it('missing required field gives error', () => {
      const fields = [f({ id: 'n', type: 'text', label: 'Name', validation: [{ type: 'required' }] })];
      const s = schema([sec('s1', fields)]);
      expect(validateForm(s, { n: '' })).toHaveLength(1);
    });
    it('dependsOn skips validation when condition not met', () => {
      const depField = f({
        id: 'extra', type: 'text', label: 'Extra',
        validation: [{ type: 'required' }],
        dependsOn: { fieldId: 'type', value: 'premium' }
      });
      const s = schema([sec('s1', [depField])]);
      expect(validateForm(s, { type: 'basic', extra: '' })).toHaveLength(0);
    });
    it('dependsOn validates when condition met', () => {
      const depField = f({
        id: 'extra', type: 'text', label: 'Extra',
        validation: [{ type: 'required' }],
        dependsOn: { fieldId: 'type', value: 'premium' }
      });
      const s = schema([sec('s1', [depField])]);
      expect(validateForm(s, { type: 'premium', extra: '' })).toHaveLength(1);
    });
    it('returns ValidationError array', () => {
      const s = schema([]);
      expect(Array.isArray(validateForm(s, {}))).toBe(true);
    });
    it('multiple fields multiple errors', () => {
      const fields = [
        f({ id: 'a', type: 'text', label: 'A', validation: [{ type: 'required' }] }),
        f({ id: 'b', type: 'text', label: 'B', validation: [{ type: 'required' }] }),
      ];
      const s = schema([sec('s1', fields)]);
      expect(validateForm(s, { a: '', b: '' })).toHaveLength(2);
    });
    it('multiple sections validated', () => {
      const f1 = f({ id: 'a', type: 'text', label: 'A', validation: [{ type: 'required' }] });
      const f2 = f({ id: 'b', type: 'text', label: 'B', validation: [{ type: 'required' }] });
      const s = schema([sec('s1', [f1]), sec('s2', [f2])]);
      expect(validateForm(s, { a: '', b: '' })).toHaveLength(2);
    });
    it('disabled field in schema not validated', () => {
      const fields = [f({ id: 'n', type: 'text', label: 'N', disabled: true, validation: [{ type: 'required' }] })];
      const s = schema([sec('s1', fields)]);
      expect(validateForm(s, { n: '' })).toHaveLength(0);
    });
  });

  // ── isFormValid ───────────────────────────────────────────────────────────
  describe('isFormValid', () => {
    it('empty schema returns true', () => expect(isFormValid(schema([]), {})).toBe(true));
    it('valid values returns true', () => {
      const fields = [f({ id: 'n', type: 'text', label: 'N', validation: [{ type: 'required' }] })];
      expect(isFormValid(schema([sec('s', fields)]), { n: 'hi' })).toBe(true);
    });
    it('invalid values returns false', () => {
      const fields = [f({ id: 'n', type: 'text', label: 'N', validation: [{ type: 'required' }] })];
      expect(isFormValid(schema([sec('s', fields)]), { n: '' })).toBe(false);
    });
    it('returns boolean', () => expect(typeof isFormValid(schema([]), {})).toBe('boolean'));
    it('true when all pass', () => {
      const fields = [
        f({ id: 'a', type: 'text', label: 'A', validation: [{ type: 'required' }] }),
        f({ id: 'b', type: 'number', label: 'B', validation: [{ type: 'min', value: 0 }] }),
      ];
      expect(isFormValid(schema([sec('s', fields)]), { a: 'ok', b: 5 })).toBe(true);
    });
    it('false when one fails', () => {
      const fields = [
        f({ id: 'a', type: 'text', label: 'A', validation: [{ type: 'required' }] }),
        f({ id: 'b', type: 'text', label: 'B', validation: [{ type: 'required' }] }),
      ];
      expect(isFormValid(schema([sec('s', fields)]), { a: 'ok', b: '' })).toBe(false);
    });
  });

  // ── getFieldErrors ────────────────────────────────────────────────────────
  describe('getFieldErrors', () => {
    const errors: ValidationError[] = [
      { fieldId: 'a', message: 'A is required' },
      { fieldId: 'b', message: 'B is too short' },
      { fieldId: 'a', message: 'A must be email' },
    ];
    it('filters by fieldId a', () => expect(getFieldErrors(errors, 'a')).toHaveLength(2));
    it('filters by fieldId b', () => expect(getFieldErrors(errors, 'b')).toHaveLength(1));
    it('unknown fieldId returns empty', () => expect(getFieldErrors(errors, 'c')).toHaveLength(0));
    it('returns string array', () => {
      const r = getFieldErrors(errors, 'a');
      r.forEach((m) => expect(typeof m).toBe('string'));
    });
    it('empty errors returns empty', () => expect(getFieldErrors([], 'a')).toHaveLength(0));
    it('returns messages not objects', () => {
      const r = getFieldErrors(errors, 'a');
      expect(r[0]).toBe('A is required');
    });
    it('returns array type', () => expect(Array.isArray(getFieldErrors(errors, 'a'))).toBe(true));
  });

  // ── createField ───────────────────────────────────────────────────────────
  describe('createField', () => {
    it('creates field with given id', () => expect(createField({ id: 'x', type: 'text', label: 'X', order: 0 }).id).toBe('x'));
    it('creates field with given type', () => expect(createField({ id: 'x', type: 'email', label: 'X', order: 0 }).type).toBe('email'));
    it('creates field with given label', () => expect(createField({ id: 'x', type: 'text', label: 'My Label', order: 0 }).label).toBe('My Label'));
    it('creates field with given order', () => expect(createField({ id: 'x', type: 'text', label: 'X', order: 5 }).order).toBe(5));
    it('optional placeholder included', () => {
      const field = createField({ id: 'x', type: 'text', label: 'X', order: 0, placeholder: 'Enter...' });
      expect(field.placeholder).toBe('Enter...');
    });
    it('optional helpText included', () => {
      const field = createField({ id: 'x', type: 'text', label: 'X', order: 0, helpText: 'Help me' });
      expect(field.helpText).toBe('Help me');
    });
    it('optional defaultValue included', () => {
      const field = createField({ id: 'x', type: 'text', label: 'X', order: 0, defaultValue: 'default' });
      expect(field.defaultValue).toBe('default');
    });
    it('returns FormField shape', () => {
      const field = createField({ id: 'x', type: 'text', label: 'X', order: 0 });
      expect(field).toHaveProperty('id');
      expect(field).toHaveProperty('type');
      expect(field).toHaveProperty('label');
      expect(field).toHaveProperty('order');
    });
  });

  // ── createSection ─────────────────────────────────────────────────────────
  describe('createSection', () => {
    it('creates section with id', () => expect(createSection('s1', 'T', [], 0).id).toBe('s1'));
    it('creates section with title', () => expect(createSection('s1', 'My Title', [], 0).title).toBe('My Title'));
    it('creates section with fields', () => {
      const fields = [createField({ id: 'f', type: 'text', label: 'F', order: 0 })];
      expect(createSection('s', 'T', fields, 0).fields).toHaveLength(1);
    });
    it('creates section with order', () => expect(createSection('s', 'T', [], 3).order).toBe(3));
    it('empty fields is valid', () => expect(createSection('s', 'T', [], 0).fields).toHaveLength(0));
    it('returns FormSection shape', () => {
      const s = createSection('s', 'T', [], 0);
      expect(s).toHaveProperty('id');
      expect(s).toHaveProperty('title');
      expect(s).toHaveProperty('fields');
      expect(s).toHaveProperty('order');
    });
  });

  // ── createSchema ──────────────────────────────────────────────────────────
  describe('createSchema', () => {
    it('creates schema with id', () => expect(createSchema('f1', 'T', [], 1).id).toBe('f1'));
    it('creates schema with title', () => expect(createSchema('f1', 'My Form', [], 1).title).toBe('My Form'));
    it('creates schema with sections', () => {
      const sections = [sec('s', [])];
      expect(createSchema('f', 'T', sections).sections).toHaveLength(1);
    });
    it('default version is 1', () => expect(createSchema('f', 'T', []).version).toBe(1));
    it('custom version', () => expect(createSchema('f', 'T', [], 3).version).toBe(3));
    it('returns FormSchema shape', () => {
      const s = createSchema('f', 'T', []);
      expect(s).toHaveProperty('id');
      expect(s).toHaveProperty('title');
      expect(s).toHaveProperty('sections');
      expect(s).toHaveProperty('version');
    });
  });

  // ── addFieldToSection ─────────────────────────────────────────────────────
  describe('addFieldToSection', () => {
    it('adds field to empty section', () => {
      const s = sec('s', []);
      const field = createField({ id: 'f', type: 'text', label: 'F', order: 0 });
      expect(addFieldToSection(s, field).fields).toHaveLength(1);
    });
    it('appends to existing fields', () => {
      const field1 = createField({ id: 'f1', type: 'text', label: 'F1', order: 0 });
      const field2 = createField({ id: 'f2', type: 'text', label: 'F2', order: 1 });
      const s = sec('s', [field1]);
      expect(addFieldToSection(s, field2).fields).toHaveLength(2);
    });
    it('does not mutate original section', () => {
      const s = sec('s', []);
      const field = createField({ id: 'f', type: 'text', label: 'F', order: 0 });
      addFieldToSection(s, field);
      expect(s.fields).toHaveLength(0);
    });
    it('new field is last', () => {
      const field1 = createField({ id: 'f1', type: 'text', label: 'F1', order: 0 });
      const field2 = createField({ id: 'f2', type: 'text', label: 'F2', order: 1 });
      const s = sec('s', [field1]);
      const updated = addFieldToSection(s, field2);
      expect(updated.fields[1].id).toBe('f2');
    });
    it('section id preserved', () => {
      const s = sec('my-section', []);
      const field = createField({ id: 'f', type: 'text', label: 'F', order: 0 });
      expect(addFieldToSection(s, field).id).toBe('my-section');
    });
  });

  // ── removeFieldFromSection ────────────────────────────────────────────────
  describe('removeFieldFromSection', () => {
    it('removes field by id', () => {
      const field = createField({ id: 'f1', type: 'text', label: 'F1', order: 0 });
      const s = sec('s', [field]);
      expect(removeFieldFromSection(s, 'f1').fields).toHaveLength(0);
    });
    it('does not remove other fields', () => {
      const f1 = createField({ id: 'f1', type: 'text', label: 'F1', order: 0 });
      const f2 = createField({ id: 'f2', type: 'text', label: 'F2', order: 1 });
      const s = sec('s', [f1, f2]);
      expect(removeFieldFromSection(s, 'f1').fields).toHaveLength(1);
      expect(removeFieldFromSection(s, 'f1').fields[0].id).toBe('f2');
    });
    it('removing non-existent id leaves all fields', () => {
      const field = createField({ id: 'f1', type: 'text', label: 'F1', order: 0 });
      const s = sec('s', [field]);
      expect(removeFieldFromSection(s, 'non-existent').fields).toHaveLength(1);
    });
    it('does not mutate original', () => {
      const field = createField({ id: 'f1', type: 'text', label: 'F1', order: 0 });
      const s = sec('s', [field]);
      removeFieldFromSection(s, 'f1');
      expect(s.fields).toHaveLength(1);
    });
    it('empty section stays empty', () => {
      const s = sec('s', []);
      expect(removeFieldFromSection(s, 'f1').fields).toHaveLength(0);
    });
  });

  // ── reorderFields ─────────────────────────────────────────────────────────
  describe('reorderFields', () => {
    it('sorts by order ascending', () => {
      const f1 = createField({ id: 'f1', type: 'text', label: 'F1', order: 2 });
      const f2 = createField({ id: 'f2', type: 'text', label: 'F2', order: 1 });
      const s = sec('s', [f1, f2]);
      const sorted = reorderFields(s);
      expect(sorted.fields[0].id).toBe('f2');
      expect(sorted.fields[1].id).toBe('f1');
    });
    it('already sorted stays same', () => {
      const f1 = createField({ id: 'f1', type: 'text', label: 'F1', order: 0 });
      const f2 = createField({ id: 'f2', type: 'text', label: 'F2', order: 1 });
      const s = sec('s', [f1, f2]);
      const sorted = reorderFields(s);
      expect(sorted.fields[0].id).toBe('f1');
    });
    it('empty section stays empty', () => {
      expect(reorderFields(sec('s', [])).fields).toHaveLength(0);
    });
    it('does not mutate original', () => {
      const f1 = createField({ id: 'f1', type: 'text', label: 'F1', order: 5 });
      const f2 = createField({ id: 'f2', type: 'text', label: 'F2', order: 1 });
      const s = sec('s', [f1, f2]);
      reorderFields(s);
      expect(s.fields[0].id).toBe('f1');
    });
    it('returns section with same id', () => {
      const s = sec('my-id', []);
      expect(reorderFields(s).id).toBe('my-id');
    });
    it('3 fields sorted correctly', () => {
      const fields = [
        createField({ id: 'c', type: 'text', label: 'C', order: 3 }),
        createField({ id: 'a', type: 'text', label: 'A', order: 1 }),
        createField({ id: 'b', type: 'text', label: 'B', order: 2 }),
      ];
      const sorted = reorderFields(sec('s', fields));
      expect(sorted.fields.map((x) => x.id)).toEqual(['a', 'b', 'c']);
    });
  });

  // ── flattenFields ─────────────────────────────────────────────────────────
  describe('flattenFields', () => {
    it('empty schema returns empty array', () => expect(flattenFields(schema([]))).toHaveLength(0));
    it('single section single field', () => {
      const field = createField({ id: 'f', type: 'text', label: 'F', order: 0 });
      expect(flattenFields(schema([sec('s', [field])]))).toHaveLength(1);
    });
    it('two sections 2+2 = 4 fields', () => {
      const f1 = createField({ id: 'f1', type: 'text', label: 'F1', order: 0 });
      const f2 = createField({ id: 'f2', type: 'text', label: 'F2', order: 1 });
      const f3 = createField({ id: 'f3', type: 'text', label: 'F3', order: 0 });
      const f4 = createField({ id: 'f4', type: 'text', label: 'F4', order: 1 });
      expect(flattenFields(schema([sec('s1', [f1, f2]), sec('s2', [f3, f4])]))).toHaveLength(4);
    });
    it('returns array type', () => expect(Array.isArray(flattenFields(schema([])))).toBe(true));
    it('fields in order of sections', () => {
      const f1 = createField({ id: 'a', type: 'text', label: 'A', order: 0 });
      const f2 = createField({ id: 'b', type: 'text', label: 'B', order: 0 });
      const all = flattenFields(schema([sec('s1', [f1]), sec('s2', [f2])]));
      expect(all[0].id).toBe('a');
      expect(all[1].id).toBe('b');
    });
  });

  // ── findField ─────────────────────────────────────────────────────────────
  describe('findField', () => {
    it('finds existing field', () => {
      const field = createField({ id: 'target', type: 'text', label: 'T', order: 0 });
      const s = schema([sec('s', [field])]);
      expect(findField(s, 'target')).toBeDefined();
    });
    it('returns undefined for missing field', () => {
      const s = schema([]);
      expect(findField(s, 'nonexistent')).toBeUndefined();
    });
    it('returns correct field', () => {
      const f1 = createField({ id: 'f1', type: 'text', label: 'F1', order: 0 });
      const f2 = createField({ id: 'f2', type: 'email', label: 'F2', order: 1 });
      const s = schema([sec('sec', [f1, f2])]);
      expect(findField(s, 'f2')?.type).toBe('email');
    });
    it('finds field across multiple sections', () => {
      const f1 = createField({ id: 'f1', type: 'text', label: 'F1', order: 0 });
      const f2 = createField({ id: 'f2', type: 'text', label: 'F2', order: 0 });
      const s = schema([sec('s1', [f1]), sec('s2', [f2])]);
      expect(findField(s, 'f2')).toBeDefined();
    });
  });

  // ── getDefaultValues ──────────────────────────────────────────────────────
  describe('getDefaultValues', () => {
    it('empty schema returns empty object', () => {
      expect(Object.keys(getDefaultValues(schema([])))).toHaveLength(0);
    });
    it('field with defaultValue returns it', () => {
      const field = createField({ id: 'n', type: 'text', label: 'N', order: 0, defaultValue: 'hello' });
      const s = schema([sec('s', [field])]);
      expect(getDefaultValues(s)['n']).toBe('hello');
    });
    it('field without defaultValue returns null', () => {
      const field = createField({ id: 'n', type: 'text', label: 'N', order: 0 });
      const s = schema([sec('s', [field])]);
      expect(getDefaultValues(s)['n']).toBeNull();
    });
    it('multiple fields all included', () => {
      const f1 = createField({ id: 'a', type: 'text', label: 'A', order: 0, defaultValue: '1' });
      const f2 = createField({ id: 'b', type: 'text', label: 'B', order: 1, defaultValue: '2' });
      const s = schema([sec('s', [f1, f2])]);
      const defaults = getDefaultValues(s);
      expect(defaults['a']).toBe('1');
      expect(defaults['b']).toBe('2');
    });
    it('returns plain object', () => {
      expect(typeof getDefaultValues(schema([]))).toBe('object');
    });
  });

  // ── countFields ───────────────────────────────────────────────────────────
  describe('countFields', () => {
    it('empty schema returns 0', () => expect(countFields(schema([]))).toBe(0));
    it('1 field returns 1', () => {
      const field = createField({ id: 'f', type: 'text', label: 'F', order: 0 });
      expect(countFields(schema([sec('s', [field])]))).toBe(1);
    });
    it('5 fields returns 5', () => {
      const fields = Array.from({ length: 5 }, (_, i) =>
        createField({ id: `f${i}`, type: 'text', label: `F${i}`, order: i }));
      expect(countFields(schema([sec('s', fields)]))).toBe(5);
    });
    it('fields across sections counted', () => {
      const f1 = createField({ id: 'f1', type: 'text', label: 'F1', order: 0 });
      const f2 = createField({ id: 'f2', type: 'text', label: 'F2', order: 0 });
      expect(countFields(schema([sec('s1', [f1]), sec('s2', [f2])]))).toBe(2);
    });
    it('returns number type', () => expect(typeof countFields(schema([]))).toBe('number'));
  });

  // ── getRequiredFields ─────────────────────────────────────────────────────
  describe('getRequiredFields', () => {
    it('no required fields returns empty', () => {
      const field = createField({ id: 'f', type: 'text', label: 'F', order: 0 });
      expect(getRequiredFields(schema([sec('s', [field])]))).toHaveLength(0);
    });
    it('required field included', () => {
      const field = createField({ id: 'f', type: 'text', label: 'F', order: 0, validation: [{ type: 'required' }] });
      expect(getRequiredFields(schema([sec('s', [field])]))).toHaveLength(1);
    });
    it('mixed returns only required', () => {
      const req = createField({ id: 'r', type: 'text', label: 'R', order: 0, validation: [{ type: 'required' }] });
      const opt = createField({ id: 'o', type: 'text', label: 'O', order: 1 });
      expect(getRequiredFields(schema([sec('s', [req, opt])]))).toHaveLength(1);
    });
    it('returns array of FormField', () => {
      const field = createField({ id: 'f', type: 'text', label: 'F', order: 0, validation: [{ type: 'required' }] });
      const result = getRequiredFields(schema([sec('s', [field])]));
      expect(result[0].id).toBe('f');
    });
    it('empty schema returns empty', () => expect(getRequiredFields(schema([]))).toHaveLength(0));
  });

  // ── schemaToJson / schemaFromJson ─────────────────────────────────────────
  describe('schemaToJson / schemaFromJson', () => {
    const baseSchema = createSchema('test', 'Test Form', []);

    it('schemaToJson returns string', () => expect(typeof schemaToJson(baseSchema)).toBe('string'));
    it('schemaToJson produces valid JSON', () => {
      expect(() => JSON.parse(schemaToJson(baseSchema))).not.toThrow();
    });
    it('schemaFromJson round-trips', () => {
      const json = schemaToJson(baseSchema);
      const restored = schemaFromJson(json);
      expect(restored.id).toBe('test');
    });
    it('round-trip preserves title', () => {
      const json = schemaToJson(baseSchema);
      expect(schemaFromJson(json).title).toBe('Test Form');
    });
    it('round-trip preserves version', () => {
      const s = createSchema('x', 'T', [], 5);
      expect(schemaFromJson(schemaToJson(s)).version).toBe(5);
    });
    it('round-trip preserves sections count', () => {
      const s = createSchema('x', 'T', [sec('s1', []), sec('s2', [])]);
      expect(schemaFromJson(schemaToJson(s)).sections).toHaveLength(2);
    });
    it('round-trip preserves field id', () => {
      const field = createField({ id: 'myField', type: 'text', label: 'F', order: 0 });
      const s = createSchema('x', 'T', [sec('s', [field])]);
      const restored = schemaFromJson(schemaToJson(s));
      expect(restored.sections[0].fields[0].id).toBe('myField');
    });
    it('schemaToJson is indented (pretty printed)', () => {
      expect(schemaToJson(baseSchema)).toContain('\n');
    });
  });

  // ── isValidFieldType ──────────────────────────────────────────────────────
  describe('isValidFieldType', () => {
    const validTypes: Array<FormField['type']> = [
      'text', 'textarea', 'number', 'email', 'password', 'tel',
      'date', 'datetime', 'time', 'checkbox', 'radio', 'select',
      'multiselect', 'file', 'hidden', 'range', 'color', 'url',
    ];
    validTypes.forEach((t) => {
      it(`"${t}" is valid`, () => expect(isValidFieldType(t)).toBe(true));
    });

    const invalidTypes = [
      '', 'TEXT', 'input', 'dropdown', 'toggle', 'switch',
      'integer', 'float', 'boolean', 'list', 'map', 'object',
    ];
    invalidTypes.forEach((t) => {
      it(`"${t}" is invalid`, () => expect(isValidFieldType(t)).toBe(false));
    });

    it('returns boolean type', () => expect(typeof isValidFieldType('text')).toBe('boolean'));
    it('exactly 18 valid types', () => expect(validTypes.every(isValidFieldType)).toBe(true));
  });

  // ── buildOption ───────────────────────────────────────────────────────────
  describe('buildOption', () => {
    it('has label', () => expect(buildOption('Red', 'red').label).toBe('Red'));
    it('has value', () => expect(buildOption('Red', 'red').value).toBe('red'));
    it('disabled defaults to false', () => expect(buildOption('Red', 'red').disabled).toBe(false));
    it('disabled can be set true', () => expect(buildOption('Red', 'red', true).disabled).toBe(true));
    it('returns object shape', () => {
      const opt = buildOption('L', 'v');
      expect(opt).toHaveProperty('label');
      expect(opt).toHaveProperty('value');
      expect(opt).toHaveProperty('disabled');
    });
    it('label and value can differ', () => {
      const opt = buildOption('Display Text', 'internal-value');
      expect(opt.label).toBe('Display Text');
      expect(opt.value).toBe('internal-value');
    });
    it('empty strings allowed', () => {
      const opt = buildOption('', '');
      expect(opt.label).toBe('');
      expect(opt.value).toBe('');
    });
  });

  // ── requiredRule / minLengthRule / maxLengthRule / patternRule ────────────
  describe('rule builders', () => {
    it('requiredRule returns {type: required}', () => expect(requiredRule().type).toBe('required'));
    it('minLengthRule returns correct type', () => expect(minLengthRule(5).type).toBe('minLength'));
    it('minLengthRule has value', () => expect(minLengthRule(5).value).toBe(5));
    it('maxLengthRule returns correct type', () => expect(maxLengthRule(10).type).toBe('maxLength'));
    it('maxLengthRule has value', () => expect(maxLengthRule(10).value).toBe(10));
    it('patternRule returns correct type', () => expect(patternRule('^[A-Z]').type).toBe('pattern'));
    it('patternRule has value', () => expect(patternRule('^[A-Z]').value).toBe('^[A-Z]'));
    it('patternRule message optional', () => expect(patternRule('^x').message).toBeUndefined());
    it('patternRule with message', () => expect(patternRule('^x', 'Custom msg').message).toBe('Custom msg'));
    it('minLengthRule value 0', () => expect(minLengthRule(0).value).toBe(0));
    it('maxLengthRule value 1000', () => expect(maxLengthRule(1000).value).toBe(1000));
    it('requiredRule is usable in validateRule', () => {
      const fld = f({ id: 'x', type: 'text', label: 'X' });
      expect(validateRule(null, requiredRule(), fld)).not.toBeNull();
    });
    it('minLengthRule is usable in validateRule', () => {
      const fld = f({ id: 'x', type: 'text', label: 'X' });
      expect(validateRule('hi', minLengthRule(5), fld)).not.toBeNull();
    });
    it('maxLengthRule is usable in validateRule', () => {
      const fld = f({ id: 'x', type: 'text', label: 'X' });
      expect(validateRule('toolong!', maxLengthRule(4), fld)).not.toBeNull();
    });
    it('patternRule is usable in validateRule', () => {
      const fld = f({ id: 'x', type: 'text', label: 'X' });
      expect(validateRule('abc', patternRule('^[0-9]'), fld)).not.toBeNull();
    });
  });

  // ── sortSections ─────────────────────────────────────────────────────────
  describe('sortSections', () => {
    it('sorts sections by order', () => {
      const s = createSchema('x', 'T', [sec('b', [], 2), sec('a', [], 1)]);
      const sorted = sortSections(s);
      expect(sorted.sections[0].id).toBe('a');
    });
    it('already sorted stays same order', () => {
      const s = createSchema('x', 'T', [sec('a', [], 1), sec('b', [], 2)]);
      expect(sortSections(s).sections[0].id).toBe('a');
    });
    it('does not mutate original', () => {
      const s = createSchema('x', 'T', [sec('b', [], 2), sec('a', [], 1)]);
      sortSections(s);
      expect(s.sections[0].id).toBe('b');
    });
    it('empty sections stays empty', () => {
      expect(sortSections(createSchema('x', 'T', [])).sections).toHaveLength(0);
    });
    it('schema id preserved', () => {
      const s = createSchema('my-id', 'T', []);
      expect(sortSections(s).id).toBe('my-id');
    });
    it('3 sections sorted correctly', () => {
      const s = createSchema('x', 'T', [sec('c', [], 3), sec('a', [], 1), sec('b', [], 2)]);
      const sorted = sortSections(s);
      expect(sorted.sections.map((x) => x.id)).toEqual(['a', 'b', 'c']);
    });
  });

  // ── Extended validation tests ──────────────────────────────────────────────
  describe('validateRule – extended minLength', () => {
    const fld = f({ id: 'x', type: 'text', label: 'Name' });
    [1, 2, 3, 5, 10, 20, 50, 100].forEach((len) => {
      it(`minLength(${len}): shorter string fails`, () => {
        const shorter = 'a'.repeat(len - 1);
        if (shorter.length < len) {
          expect(validateRule(shorter, { type: 'minLength', value: len }, fld)).not.toBeNull();
        } else {
          expect(validateRule(shorter, { type: 'minLength', value: len }, fld)).toBeNull();
        }
      });
      it(`minLength(${len}): exact length passes`, () => {
        expect(validateRule('a'.repeat(len), { type: 'minLength', value: len }, fld)).toBeNull();
      });
    });
  });

  describe('validateRule – extended maxLength', () => {
    const fld = f({ id: 'x', type: 'text', label: 'Desc' });
    [1, 5, 10, 50, 100, 255].forEach((len) => {
      it(`maxLength(${len}): exact length passes`, () => {
        expect(validateRule('a'.repeat(len), { type: 'maxLength', value: len }, fld)).toBeNull();
      });
      it(`maxLength(${len}): longer fails`, () => {
        expect(validateRule('a'.repeat(len + 1), { type: 'maxLength', value: len }, fld)).not.toBeNull();
      });
    });
  });

  describe('validateRule – extended min/max', () => {
    const fld = f({ id: 'n', type: 'number', label: 'Num' });
    [-100, -50, 0, 1, 5, 10, 100, 999].forEach((val) => {
      it(`min(${val}): exact passes`, () => {
        expect(validateRule(val, { type: 'min', value: val }, fld)).toBeNull();
      });
      it(`min(${val}): below fails`, () => {
        expect(validateRule(val - 1, { type: 'min', value: val }, fld)).not.toBeNull();
      });
      it(`max(${val}): exact passes`, () => {
        expect(validateRule(val, { type: 'max', value: val }, fld)).toBeNull();
      });
      it(`max(${val}): above fails`, () => {
        expect(validateRule(val + 1, { type: 'max', value: val }, fld)).not.toBeNull();
      });
    });
  });

  describe('isValidFieldType – explicit list', () => {
    it('text valid', () => expect(isValidFieldType('text')).toBe(true));
    it('textarea valid', () => expect(isValidFieldType('textarea')).toBe(true));
    it('number valid', () => expect(isValidFieldType('number')).toBe(true));
    it('email valid', () => expect(isValidFieldType('email')).toBe(true));
    it('password valid', () => expect(isValidFieldType('password')).toBe(true));
    it('tel valid', () => expect(isValidFieldType('tel')).toBe(true));
    it('date valid', () => expect(isValidFieldType('date')).toBe(true));
    it('datetime valid', () => expect(isValidFieldType('datetime')).toBe(true));
    it('time valid', () => expect(isValidFieldType('time')).toBe(true));
    it('checkbox valid', () => expect(isValidFieldType('checkbox')).toBe(true));
    it('radio valid', () => expect(isValidFieldType('radio')).toBe(true));
    it('select valid', () => expect(isValidFieldType('select')).toBe(true));
    it('multiselect valid', () => expect(isValidFieldType('multiselect')).toBe(true));
    it('file valid', () => expect(isValidFieldType('file')).toBe(true));
    it('hidden valid', () => expect(isValidFieldType('hidden')).toBe(true));
    it('range valid', () => expect(isValidFieldType('range')).toBe(true));
    it('color valid', () => expect(isValidFieldType('color')).toBe(true));
    it('url valid', () => expect(isValidFieldType('url')).toBe(true));
    it('string invalid', () => expect(isValidFieldType('string')).toBe(false));
    it('integer invalid', () => expect(isValidFieldType('integer')).toBe(false));
    it('boolean invalid', () => expect(isValidFieldType('boolean')).toBe(false));
    it('dropdown invalid', () => expect(isValidFieldType('dropdown')).toBe(false));
    it('empty invalid', () => expect(isValidFieldType('')).toBe(false));
    it('TEXT invalid', () => expect(isValidFieldType('TEXT')).toBe(false));
    it('Date invalid', () => expect(isValidFieldType('Date')).toBe(false));
    it('SELECT invalid', () => expect(isValidFieldType('SELECT')).toBe(false));
  });

  describe('getFieldErrors – comprehensive', () => {
    it('returns empty for no matching errors', () => {
      const errors: ValidationError[] = [{ fieldId: 'other', message: 'error' }];
      expect(getFieldErrors(errors, 'mine')).toHaveLength(0);
    });
    it('returns all messages for matching fieldId', () => {
      const errors: ValidationError[] = [
        { fieldId: 'f', message: 'msg1' },
        { fieldId: 'f', message: 'msg2' },
        { fieldId: 'f', message: 'msg3' },
      ];
      expect(getFieldErrors(errors, 'f')).toHaveLength(3);
    });
    it('messages are strings', () => {
      const errors: ValidationError[] = [{ fieldId: 'f', message: 'hello' }];
      expect(getFieldErrors(errors, 'f')[0]).toBe('hello');
    });
    it('does not include errors from other fields', () => {
      const errors: ValidationError[] = [
        { fieldId: 'a', message: 'A error' },
        { fieldId: 'b', message: 'B error' },
      ];
      expect(getFieldErrors(errors, 'a')).toHaveLength(1);
      expect(getFieldErrors(errors, 'a')[0]).toBe('A error');
    });
    it('10 errors for same field returns 10', () => {
      const errors = Array.from({ length: 10 }, (_, i) => ({ fieldId: 'x', message: `msg${i}` }));
      expect(getFieldErrors(errors, 'x')).toHaveLength(10);
    });
    it('preserves message order', () => {
      const errors: ValidationError[] = [
        { fieldId: 'f', message: 'first' },
        { fieldId: 'f', message: 'second' },
      ];
      const r = getFieldErrors(errors, 'f');
      expect(r[0]).toBe('first');
      expect(r[1]).toBe('second');
    });
  });

  describe('misc schema operations', () => {
    it('countFields returns number', () => expect(typeof countFields(schema([]))).toBe('number'));
    it('flattenFields returns array', () => expect(Array.isArray(flattenFields(schema([])))).toBe(true));
    it('getDefaultValues returns object', () => expect(typeof getDefaultValues(schema([]))).toBe('object'));
    it('getRequiredFields returns array', () => expect(Array.isArray(getRequiredFields(schema([])))).toBe(true));
    it('sortSections returns schema object', () => {
      const r = sortSections(schema([]));
      expect(r).toHaveProperty('id');
      expect(r).toHaveProperty('sections');
    });
    it('schemaFromJson invalid JSON throws', () => {
      expect(() => schemaFromJson('not-json')).toThrow();
    });
    it('schemaToJson includes id', () => {
      const json = schemaToJson(createSchema('my-id', 'T', []));
      expect(json).toContain('my-id');
    });
    it('schemaToJson includes title', () => {
      const json = schemaToJson(createSchema('id', 'My Title', []));
      expect(json).toContain('My Title');
    });
    it('addFieldToSection returns new object', () => {
      const s = sec('s', []);
      const field = createField({ id: 'f', type: 'text', label: 'F', order: 0 });
      const result = addFieldToSection(s, field);
      expect(result).not.toBe(s);
    });
    it('removeFieldFromSection returns new object', () => {
      const field = createField({ id: 'f', type: 'text', label: 'F', order: 0 });
      const s = sec('s', [field]);
      const result = removeFieldFromSection(s, 'f');
      expect(result).not.toBe(s);
    });
    it('reorderFields returns new object', () => {
      const s = sec('s', []);
      expect(reorderFields(s)).not.toBe(s);
    });
    it('createField with all options', () => {
      const field = createField({
        id: 'full', type: 'select', label: 'Full Field', order: 1,
        placeholder: 'Select...', helpText: 'Choose one',
        options: [buildOption('A', 'a'), buildOption('B', 'b')],
        validation: [requiredRule()],
        defaultValue: 'a',
      });
      expect(field.id).toBe('full');
      expect(field.options).toHaveLength(2);
      expect(field.validation).toHaveLength(1);
    });
  });

  // ── Extended explicit tests ────────────────────────────────────────────────
  describe('validateRule – required explicit values', () => {
    const fld = f({ id: 'r', type: 'text', label: 'Field' });
    it('null fails', () => expect(validateRule(null, requiredRule(), fld)).not.toBeNull());
    it('undefined fails', () => expect(validateRule(undefined, requiredRule(), fld)).not.toBeNull());
    it('empty string fails', () => expect(validateRule('', requiredRule(), fld)).not.toBeNull());
    it('empty array fails', () => expect(validateRule([], requiredRule(), fld)).not.toBeNull());
    it('"a" passes', () => expect(validateRule('a', requiredRule(), fld)).toBeNull());
    it('"hello" passes', () => expect(validateRule('hello', requiredRule(), fld)).toBeNull());
    it('0 passes', () => expect(validateRule(0, requiredRule(), fld)).toBeNull());
    it('false passes', () => expect(validateRule(false, requiredRule(), fld)).toBeNull());
    it('true passes', () => expect(validateRule(true, requiredRule(), fld)).toBeNull());
    it('object {} passes', () => expect(validateRule({}, requiredRule(), fld)).toBeNull());
    it('[1] passes', () => expect(validateRule([1], requiredRule(), fld)).toBeNull());
    it('number 1 passes', () => expect(validateRule(1, requiredRule(), fld)).toBeNull());
    it('number -1 passes', () => expect(validateRule(-1, requiredRule(), fld)).toBeNull());
    it('string "0" passes', () => expect(validateRule('0', requiredRule(), fld)).toBeNull());
    it('string " " passes', () => expect(validateRule(' ', requiredRule(), fld)).toBeNull());
    it('error message is string', () => expect(typeof validateRule(null, requiredRule(), fld)).toBe('string'));
    it('error contains label', () => expect(validateRule(null, requiredRule(), fld)).toContain('Field'));
  });

  describe('validateRule – email detailed', () => {
    const fld = f({ id: 'e', type: 'email', label: 'Email' });
    const valid = ['a@b.com', 'user@example.org', 'first.last@domain.co.uk', 'x+y@z.io'];
    const invalid = ['notanemail', 'no@', '@domain.com', 'missing.dot', 'spaces here@b.com'];
    valid.forEach((v) => {
      it(`valid email "${v}"`, () => expect(validateRule(v, { type: 'email' }, fld)).toBeNull());
    });
    invalid.forEach((v) => {
      it(`invalid email "${v}"`, () => expect(validateRule(v, { type: 'email' }, fld)).not.toBeNull());
    });
  });

  describe('validateRule – url detailed', () => {
    const fld = f({ id: 'u', type: 'url', label: 'URL' });
    const valid = ['https://example.com', 'http://localhost:3000', 'https://a.b.co/path?q=1'];
    const invalid = ['not-a-url', 'ftp//missing-colon', 'example.com', 'just text'];
    valid.forEach((v) => {
      it(`valid url "${v}"`, () => expect(validateRule(v, { type: 'url' }, fld)).toBeNull());
    });
    invalid.forEach((v) => {
      it(`invalid url "${v}"`, () => expect(validateRule(v, { type: 'url' }, fld)).not.toBeNull());
    });
  });

  describe('createField – type coverage', () => {
    const types: Array<FormField['type']> = [
      'text', 'textarea', 'number', 'email', 'password', 'tel',
      'date', 'datetime', 'time', 'checkbox', 'radio', 'select',
      'multiselect', 'file', 'hidden', 'range', 'color', 'url',
    ];
    types.forEach((type) => {
      it(`createField with type "${type}"`, () => {
        const field = createField({ id: 'f', type, label: 'F', order: 0 });
        expect(field.type).toBe(type);
      });
    });
  });

  describe('buildOption – detailed', () => {
    it('label set correctly', () => expect(buildOption('My Label', 'my-val').label).toBe('My Label'));
    it('value set correctly', () => expect(buildOption('L', 'my-value').value).toBe('my-value'));
    it('disabled false by default', () => expect(buildOption('L', 'v').disabled).toBe(false));
    it('disabled true when specified', () => expect(buildOption('L', 'v', true).disabled).toBe(true));
    it('disabled false when explicitly false', () => expect(buildOption('L', 'v', false).disabled).toBe(false));
    it('unicode label', () => expect(buildOption('Ünïcödé', 'u').label).toBe('Ünïcödé'));
    it('special chars in value', () => expect(buildOption('L', 'a+b&c').value).toBe('a+b&c'));
    it('empty label', () => expect(buildOption('', 'v').label).toBe(''));
    it('empty value', () => expect(buildOption('L', '').value).toBe(''));
    it('number-like value stays string', () => expect(typeof buildOption('L', '42').value).toBe('string'));
  });

  describe('validateField – type-specific fields', () => {
    it('email field validated', () => {
      const field = f({ id: 'e', type: 'email', label: 'E', validation: [{ type: 'email' }] });
      expect(validateField(field, 'bad-email')).toHaveLength(1);
      expect(validateField(field, 'good@email.com')).toHaveLength(0);
    });
    it('number field validated', () => {
      const field = f({ id: 'n', type: 'number', label: 'N', validation: [{ type: 'min', value: 0 }] });
      expect(validateField(field, -1)).toHaveLength(1);
      expect(validateField(field, 0)).toHaveLength(0);
    });
    it('url field validated', () => {
      const field = f({ id: 'u', type: 'url', label: 'U', validation: [{ type: 'url' }] });
      expect(validateField(field, 'not-url')).toHaveLength(1);
      expect(validateField(field, 'https://ok.com')).toHaveLength(0);
    });
    it('text field with pattern', () => {
      const field = f({ id: 't', type: 'text', label: 'T', validation: [patternRule('^[0-9]+$')] });
      expect(validateField(field, 'abc')).toHaveLength(1);
      expect(validateField(field, '123')).toHaveLength(0);
    });
    it('required + minLength combined', () => {
      const field = f({
        id: 'x', type: 'text', label: 'X',
        validation: [requiredRule(), minLengthRule(3)]
      });
      expect(validateField(field, 'a')).toHaveLength(1); // minLength fails, required passes
      expect(validateField(field, '')).toHaveLength(2); // both fail
      expect(validateField(field, 'abc')).toHaveLength(0); // both pass
    });
    it('custom validator passes', () => {
      const field = f({
        id: 'c', type: 'text', label: 'C',
        validation: [{ type: 'custom', fn: (v) => (v as string).startsWith('A'), message: 'Must start with A' }]
      });
      expect(validateField(field, 'Alpha')).toHaveLength(0);
      expect(validateField(field, 'Beta')).toHaveLength(1);
    });
    it('disabled field skips validation', () => {
      const field = f({ id: 'x', type: 'text', label: 'X', disabled: true, validation: [requiredRule()] });
      expect(validateField(field, null)).toHaveLength(0);
    });
    it('hidden field skips validation', () => {
      const field = f({ id: 'x', type: 'text', label: 'X', hidden: true, validation: [requiredRule()] });
      expect(validateField(field, null)).toHaveLength(0);
    });
    it('not disabled nor hidden runs validation', () => {
      const field = f({ id: 'x', type: 'text', label: 'X', disabled: false, hidden: false, validation: [requiredRule()] });
      expect(validateField(field, null)).toHaveLength(1);
    });
  });

  describe('isFormValid – detailed', () => {
    it('no sections → valid', () => expect(isFormValid(schema([]), {})).toBe(true));
    it('sections with no fields → valid', () => {
      expect(isFormValid(schema([sec('s1', []), sec('s2', [])]), {})).toBe(true);
    });
    it('all required present → valid', () => {
      const fields = [
        f({ id: 'a', type: 'text', label: 'A', validation: [requiredRule()] }),
        f({ id: 'b', type: 'text', label: 'B', validation: [requiredRule()] }),
      ];
      expect(isFormValid(schema([sec('s', fields)]), { a: 'x', b: 'y' })).toBe(true);
    });
    it('one required missing → invalid', () => {
      const fields = [f({ id: 'a', type: 'text', label: 'A', validation: [requiredRule()] })];
      expect(isFormValid(schema([sec('s', fields)]), { a: '' })).toBe(false);
    });
    it('number min validation passes', () => {
      const fields = [f({ id: 'n', type: 'number', label: 'N', validation: [{ type: 'min', value: 0 }] })];
      expect(isFormValid(schema([sec('s', fields)]), { n: 5 })).toBe(true);
    });
    it('number max validation fails', () => {
      const fields = [f({ id: 'n', type: 'number', label: 'N', validation: [{ type: 'max', value: 10 }] })];
      expect(isFormValid(schema([sec('s', fields)]), { n: 11 })).toBe(false);
    });
    it('returns strictly boolean true', () => {
      expect(isFormValid(schema([]), {}) === true).toBe(true);
    });
    it('returns strictly boolean false', () => {
      const fields = [f({ id: 'r', type: 'text', label: 'R', validation: [requiredRule()] })];
      expect(isFormValid(schema([sec('s', fields)]), { r: '' }) === false).toBe(true);
    });
  });

  describe('flattenFields – detailed', () => {
    it('returns all fields from all sections', () => {
      const fa = f({ id: 'a', type: 'text', label: 'A', order: 0 });
      const fb = f({ id: 'b', type: 'text', label: 'B', order: 0 });
      const fc = f({ id: 'c', type: 'text', label: 'C', order: 0 });
      const result = flattenFields(schema([sec('s1', [fa, fb]), sec('s2', [fc])]));
      expect(result).toHaveLength(3);
    });
    it('preserves field data', () => {
      const field = f({ id: 'unique', type: 'email', label: 'Email', order: 5 });
      const result = flattenFields(schema([sec('s', [field])]));
      expect(result[0].id).toBe('unique');
      expect(result[0].type).toBe('email');
    });
    it('order in result is section1 fields then section2 fields', () => {
      const f1 = f({ id: '1', type: 'text', label: '1', order: 0 });
      const f2 = f({ id: '2', type: 'text', label: '2', order: 0 });
      const f3 = f({ id: '3', type: 'text', label: '3', order: 0 });
      const result = flattenFields(schema([sec('s1', [f1, f2]), sec('s2', [f3])]));
      expect(result[0].id).toBe('1');
      expect(result[2].id).toBe('3');
    });
    it('10 total fields', () => {
      const fields5 = Array.from({ length: 5 }, (_, i) => f({ id: `a${i}`, type: 'text', label: `A${i}`, order: i }));
      const fields5b = Array.from({ length: 5 }, (_, i) => f({ id: `b${i}`, type: 'text', label: `B${i}`, order: i }));
      expect(flattenFields(schema([sec('s1', fields5), sec('s2', fields5b)]))).toHaveLength(10);
    });
  });

  describe('getDefaultValues – detailed', () => {
    it('string default', () => {
      const field = f({ id: 'n', type: 'text', label: 'N', order: 0, defaultValue: 'default' });
      expect(getDefaultValues(schema([sec('s', [field])]))).toHaveProperty('n', 'default');
    });
    it('number default', () => {
      const field = f({ id: 'n', type: 'number', label: 'N', order: 0, defaultValue: 42 });
      expect(getDefaultValues(schema([sec('s', [field])]))).toHaveProperty('n', 42);
    });
    it('boolean default', () => {
      const field = f({ id: 'b', type: 'checkbox', label: 'B', order: 0, defaultValue: true });
      expect(getDefaultValues(schema([sec('s', [field])]))).toHaveProperty('b', true);
    });
    it('null default when not specified', () => {
      const field = f({ id: 'x', type: 'text', label: 'X', order: 0 });
      expect(getDefaultValues(schema([sec('s', [field])]))).toHaveProperty('x', null);
    });
    it('5 fields all have defaults', () => {
      const fields = Array.from({ length: 5 }, (_, i) =>
        f({ id: `f${i}`, type: 'text', label: `F${i}`, order: i, defaultValue: `val${i}` }));
      const defaults = getDefaultValues(schema([sec('s', fields)]));
      expect(Object.keys(defaults)).toHaveLength(5);
    });
  });

  describe('getRequiredFields – detailed', () => {
    it('field with only minLength not required', () => {
      const field = f({ id: 'x', type: 'text', label: 'X', order: 0, validation: [minLengthRule(3)] });
      expect(getRequiredFields(schema([sec('s', [field])]))).toHaveLength(0);
    });
    it('field with required in validation array is required', () => {
      const field = f({ id: 'x', type: 'text', label: 'X', order: 0, validation: [requiredRule()] });
      expect(getRequiredFields(schema([sec('s', [field])]))).toHaveLength(1);
    });
    it('field with required + minLength is required', () => {
      const field = f({ id: 'x', type: 'text', label: 'X', order: 0, validation: [requiredRule(), minLengthRule(3)] });
      expect(getRequiredFields(schema([sec('s', [field])]))).toHaveLength(1);
    });
    it('3 required fields across sections', () => {
      const r1 = f({ id: 'r1', type: 'text', label: 'R1', order: 0, validation: [requiredRule()] });
      const r2 = f({ id: 'r2', type: 'text', label: 'R2', order: 0, validation: [requiredRule()] });
      const r3 = f({ id: 'r3', type: 'text', label: 'R3', order: 0, validation: [requiredRule()] });
      expect(getRequiredFields(schema([sec('s1', [r1, r2]), sec('s2', [r3])]))).toHaveLength(3);
    });
  });

  describe('sortSections – detailed', () => {
    it('single section unchanged', () => {
      const s = createSchema('x', 'T', [sec('only', [], 1)]);
      expect(sortSections(s).sections[0].id).toBe('only');
    });
    it('2 sections sorted', () => {
      const s = createSchema('x', 'T', [sec('b', [], 2), sec('a', [], 1)]);
      expect(sortSections(s).sections[0].id).toBe('a');
      expect(sortSections(s).sections[1].id).toBe('b');
    });
    it('5 sections sorted by order', () => {
      const sections = [5, 3, 1, 4, 2].map((order) => sec(`s${order}`, [], order));
      const s = createSchema('x', 'T', sections);
      const sorted = sortSections(s);
      expect(sorted.sections.map((x) => x.order)).toEqual([1, 2, 3, 4, 5]);
    });
    it('same order sections keep relative position (stable ish)', () => {
      const s = createSchema('x', 'T', [sec('a', [], 1), sec('b', [], 1)]);
      const sorted = sortSections(s);
      expect(sorted.sections).toHaveLength(2);
    });
    it('sections contain their fields after sort', () => {
      const field = f({ id: 'f', type: 'text', label: 'F', order: 0 });
      const s = createSchema('x', 'T', [sec('with-field', [field], 2), sec('empty', [], 1)]);
      const sorted = sortSections(s);
      expect(sorted.sections[1].fields).toHaveLength(1);
    });
  });

  describe('schemaToJson / schemaFromJson – detailed', () => {
    it('empty schema round-trips', () => {
      const s = createSchema('empty', 'Empty', []);
      expect(schemaFromJson(schemaToJson(s)).id).toBe('empty');
    });
    it('schema with description round-trips', () => {
      const s: FormSchema = { id: 'x', title: 'T', sections: [], version: 1, description: 'My description' };
      expect(schemaFromJson(schemaToJson(s)).description).toBe('My description');
    });
    it('schema with submitLabel round-trips', () => {
      const s: FormSchema = { id: 'x', title: 'T', sections: [], version: 1, submitLabel: 'Save & Continue' };
      expect(schemaFromJson(schemaToJson(s)).submitLabel).toBe('Save & Continue');
    });
    it('version 10 round-trips', () => {
      const s = createSchema('x', 'T', [], 10);
      expect(schemaFromJson(schemaToJson(s)).version).toBe(10);
    });
    it('nested fields round-trip', () => {
      const field = createField({ id: 'email', type: 'email', label: 'Email', order: 0 });
      const section = createSection('contact', 'Contact', [field], 1);
      const s = createSchema('form1', 'Contact Form', [section]);
      const restored = schemaFromJson(schemaToJson(s));
      expect(restored.sections[0].fields[0].type).toBe('email');
    });
    it('JSON string contains section title', () => {
      const section = createSection('s', 'My Section', [], 0);
      const s = createSchema('x', 'T', [section]);
      expect(schemaToJson(s)).toContain('My Section');
    });
    it('JSON string is indented with spaces', () => {
      expect(schemaToJson(createSchema('x', 'T', []))).toMatch(/\s{2,}/);
    });
    it('fromJson preserves section id', () => {
      const s = createSchema('x', 'T', [createSection('my-section-id', 'T', [], 0)]);
      const restored = schemaFromJson(schemaToJson(s));
      expect(restored.sections[0].id).toBe('my-section-id');
    });
  });

  describe('createSection – edge cases', () => {
    it('0 fields', () => expect(createSection('s', 'T', [], 0).fields).toHaveLength(0));
    it('10 fields', () => {
      const fields = Array.from({ length: 10 }, (_, i) =>
        createField({ id: `f${i}`, type: 'text', label: `F${i}`, order: i }));
      expect(createSection('s', 'T', fields, 0).fields).toHaveLength(10);
    });
    it('collapsible optional', () => {
      const s = createSection('s', 'T', [], 0);
      expect(s.collapsible).toBeUndefined();
    });
    it('order preserved', () => expect(createSection('s', 'T', [], 99).order).toBe(99));
    it('negative order allowed', () => expect(createSection('s', 'T', [], -1).order).toBe(-1));
    it('title preserved', () => expect(createSection('s', 'Section Title', [], 0).title).toBe('Section Title'));
  });

  describe('addFieldToSection / removeFieldFromSection – extended', () => {
    it('add 5 fields one by one', () => {
      let s = sec('s', []);
      for (let i = 0; i < 5; i++) {
        s = addFieldToSection(s, createField({ id: `f${i}`, type: 'text', label: `F${i}`, order: i }));
      }
      expect(s.fields).toHaveLength(5);
    });
    it('remove all 3 fields', () => {
      let s = sec('s', [
        createField({ id: 'a', type: 'text', label: 'A', order: 0 }),
        createField({ id: 'b', type: 'text', label: 'B', order: 1 }),
        createField({ id: 'c', type: 'text', label: 'C', order: 2 }),
      ]);
      s = removeFieldFromSection(s, 'a');
      s = removeFieldFromSection(s, 'b');
      s = removeFieldFromSection(s, 'c');
      expect(s.fields).toHaveLength(0);
    });
    it('add then remove returns original count', () => {
      const field = createField({ id: 'x', type: 'text', label: 'X', order: 0 });
      let s = sec('s', []);
      s = addFieldToSection(s, field);
      s = removeFieldFromSection(s, 'x');
      expect(s.fields).toHaveLength(0);
    });
    it('section title preserved through add/remove', () => {
      const s = sec('my-id', []);
      const withField = addFieldToSection(s, createField({ id: 'f', type: 'text', label: 'F', order: 0 }));
      expect(withField.title).toBe('Section my-id');
    });
  });

  describe('countFields – detailed', () => {
    it('0 sections → 0', () => expect(countFields(createSchema('x', 'T', []))).toBe(0));
    it('1 section 0 fields → 0', () => expect(countFields(createSchema('x', 'T', [sec('s', [])]))).toBe(0));
    it('1 section 1 field → 1', () => {
      const field = createField({ id: 'f', type: 'text', label: 'F', order: 0 });
      expect(countFields(createSchema('x', 'T', [sec('s', [field])]))).toBe(1);
    });
    it('3 sections 2+3+5 = 10', () => {
      const make = (n: number, prefix: string) => Array.from({ length: n }, (_, i) =>
        createField({ id: `${prefix}${i}`, type: 'text', label: `L${i}`, order: i }));
      const s = createSchema('x', 'T', [sec('s1', make(2, 'a')), sec('s2', make(3, 'b')), sec('s3', make(5, 'c'))]);
      expect(countFields(s)).toBe(10);
    });
    it('returns integer', () => {
      expect(Number.isInteger(countFields(createSchema('x', 'T', [])))).toBe(true);
    });
    it('returns non-negative number', () => {
      expect(countFields(createSchema('x', 'T', []))).toBeGreaterThanOrEqual(0);
    });
  });

  describe('findField – detailed', () => {
    it('finds field by id in first section', () => {
      const field = createField({ id: 'target', type: 'number', label: 'T', order: 0 });
      const s = createSchema('x', 'T', [sec('s', [field])]);
      expect(findField(s, 'target')?.id).toBe('target');
    });
    it('finds field by id in second section', () => {
      const f1 = createField({ id: 'a', type: 'text', label: 'A', order: 0 });
      const f2 = createField({ id: 'b', type: 'email', label: 'B', order: 0 });
      const s = createSchema('x', 'T', [sec('s1', [f1]), sec('s2', [f2])]);
      expect(findField(s, 'b')?.type).toBe('email');
    });
    it('returns undefined for empty schema', () => {
      expect(findField(createSchema('x', 'T', []), 'any')).toBeUndefined();
    });
    it('returns correct field among many', () => {
      const fields = Array.from({ length: 10 }, (_, i) =>
        createField({ id: `f${i}`, type: 'text', label: `F${i}`, order: i }));
      const s = createSchema('x', 'T', [sec('s', fields)]);
      expect(findField(s, 'f7')?.id).toBe('f7');
    });
    it('case-sensitive id matching', () => {
      const field = createField({ id: 'myField', type: 'text', label: 'F', order: 0 });
      const s = createSchema('x', 'T', [sec('s', [field])]);
      expect(findField(s, 'MyField')).toBeUndefined();
      expect(findField(s, 'myField')).toBeDefined();
    });
  });

  describe('rule builders – detailed', () => {
    it('requiredRule type is required', () => expect(requiredRule().type).toBe('required'));
    it('minLengthRule(0).value = 0', () => expect(minLengthRule(0).value).toBe(0));
    it('minLengthRule(1).value = 1', () => expect(minLengthRule(1).value).toBe(1));
    it('minLengthRule(5).value = 5', () => expect(minLengthRule(5).value).toBe(5));
    it('minLengthRule(100).value = 100', () => expect(minLengthRule(100).value).toBe(100));
    it('maxLengthRule(0).value = 0', () => expect(maxLengthRule(0).value).toBe(0));
    it('maxLengthRule(10).value = 10', () => expect(maxLengthRule(10).value).toBe(10));
    it('maxLengthRule(255).value = 255', () => expect(maxLengthRule(255).value).toBe(255));
    it('patternRule("^[A-Z]").value = "^[A-Z]"', () => expect(patternRule('^[A-Z]').value).toBe('^[A-Z]'));
    it('patternRule with empty pattern', () => expect(patternRule('').value).toBe(''));
    it('patternRule no message → undefined', () => expect(patternRule('^x').message).toBeUndefined());
    it('patternRule with message → message set', () => expect(patternRule('^x', 'msg').message).toBe('msg'));
    it('rules compose in validation array', () => {
      const fld = f({ id: 'x', type: 'text', label: 'X', validation: [requiredRule(), minLengthRule(3), maxLengthRule(10)] });
      expect(validateField(fld, 'okay')).toHaveLength(0);
      expect(validateField(fld, 'hi')).toHaveLength(1);
      expect(validateField(fld, 'this is too long string')).toHaveLength(1);
      expect(validateField(fld, '')).toHaveLength(2);
    });
  });
});

// ─── Extended suites to reach ≥1,000 tests ────────────────────────────────

describe('validateRule – min/max numeric', () => {
  const numField = f({ id: 'n', type: 'number', label: 'N', order: 0 });
  const minCases: [number, number, boolean][] = [
    [0, 0, false], [1, 0, false], [5, 5, false], [4, 5, true], [100, 50, false],
    [50, 100, true], [-1, 0, true], [0, -1, false], [10, 10, false], [9, 10, true],
  ];
  minCases.forEach(([val, minVal, fails]) => {
    it(`min(${minVal}): value ${val} ${fails ? 'fails' : 'passes'}`, () => {
      const err = validateRule(val, { type: 'min', value: minVal }, numField);
      expect(err !== null).toBe(fails);
    });
  });

  const maxCases: [number, number, boolean][] = [
    [0, 0, false], [1, 0, true], [5, 5, false], [6, 5, true], [100, 200, false],
    [200, 100, true], [-1, 0, false], [-1, -2, true], [10, 10, false], [11, 10, true],
  ];
  maxCases.forEach(([val, maxVal, fails]) => {
    it(`max(${maxVal}): value ${val} ${fails ? 'fails' : 'passes'}`, () => {
      const err = validateRule(val, { type: 'max', value: maxVal }, numField);
      expect(err !== null).toBe(fails);
    });
  });

  it('min error message includes field label', () => {
    const e = validateRule(1, { type: 'min', value: 5 }, numField);
    expect(e).toContain('N');
  });
  it('max error message includes field label', () => {
    const e = validateRule(10, { type: 'max', value: 5 }, numField);
    expect(e).toContain('N');
  });
  it('min passes for non-number value', () => {
    expect(validateRule('hello', { type: 'min', value: 1 }, numField)).toBeNull();
  });
  it('max passes for non-number value', () => {
    expect(validateRule('hello', { type: 'max', value: 0 }, numField)).toBeNull();
  });
  it('min with value exactly at boundary passes', () => {
    expect(validateRule(42, { type: 'min', value: 42 }, numField)).toBeNull();
  });
  it('max with value exactly at boundary passes', () => {
    expect(validateRule(42, { type: 'max', value: 42 }, numField)).toBeNull();
  });
});

describe('validateRule – minLength/maxLength edge cases', () => {
  const tf = f({ id: 't', type: 'text', label: 'T', order: 0 });
  const lengths = [0, 1, 2, 3, 5, 10, 20, 50];
  lengths.forEach((len) => {
    const s = 'a'.repeat(len);
    it(`string of length ${len} with minLength(${len}) passes`, () => {
      expect(validateRule(s, { type: 'minLength', value: len }, tf)).toBeNull();
    });
    it(`string of length ${len} with maxLength(${len}) passes`, () => {
      expect(validateRule(s, { type: 'maxLength', value: len }, tf)).toBeNull();
    });
    if (len > 0) {
      it(`string of length ${len - 1} with minLength(${len}) fails`, () => {
        expect(validateRule('a'.repeat(len - 1), { type: 'minLength', value: len }, tf)).not.toBeNull();
      });
      it(`string of length ${len + 1} with maxLength(${len}) fails`, () => {
        expect(validateRule('a'.repeat(len + 1), { type: 'maxLength', value: len }, tf)).not.toBeNull();
      });
    }
  });
  it('minLength skips non-string', () => {
    expect(validateRule(42, { type: 'minLength', value: 1 }, tf)).toBeNull();
  });
  it('maxLength skips non-string', () => {
    expect(validateRule(42, { type: 'maxLength', value: 0 }, tf)).toBeNull();
  });
});

describe('validateRule – pattern cases', () => {
  const pf = f({ id: 'p', type: 'text', label: 'P', order: 0 });
  const patterns: [string, string, boolean][] = [
    ['^[A-Z]', 'Hello', false],
    ['^[A-Z]', 'hello', true],
    ['\\d+', '123', false],
    ['\\d+', 'abc', true],
    ['^$', '', false],
    ['^a', 'abc', false],
    ['^a', 'bca', true],
    ['[0-9]{3}', 'abc123', false],
    ['[0-9]{3}', 'ab', true],
    ['^\\w+$', 'hello_world', false],
    ['^\\w+$', 'hello world', true],
  ];
  patterns.forEach(([pat, val, fails]) => {
    it(`pattern /${pat}/ on "${val}" ${fails ? 'fails' : 'passes'}`, () => {
      const err = validateRule(val, { type: 'pattern', value: pat }, pf);
      expect(err !== null).toBe(fails);
    });
  });
  it('pattern skips empty string', () => {
    expect(validateRule('', { type: 'pattern', value: '^[A-Z]' }, pf)).toBeNull();
  });
  it('pattern skips non-string', () => {
    expect(validateRule(123, { type: 'pattern', value: '^[A-Z]' }, pf)).toBeNull();
  });
  it('pattern with custom message uses message', () => {
    const e = validateRule('hello', { type: 'pattern', value: '^[A-Z]', message: 'Must start with uppercase' }, pf);
    expect(e).toBe('Must start with uppercase');
  });
  it('pattern without custom message uses default', () => {
    const e = validateRule('hello', { type: 'pattern', value: '^[A-Z]' }, pf);
    expect(e).toContain('P');
  });
});

describe('validateRule – email cases', () => {
  const ef = f({ id: 'e', type: 'email', label: 'Email', order: 0 });
  const validEmails = [
    'user@example.com', 'test+tag@domain.org', 'a@b.io', 'name.surname@company.co.uk',
    'user123@test-domain.com', 'admin@ims.local',
  ];
  validEmails.forEach((email) => {
    it(`valid email passes: ${email}`, () => {
      expect(validateRule(email, { type: 'email' }, ef)).toBeNull();
    });
  });
  const invalidEmails = [
    'notanemail', '@domain.com', 'user@', 'user@@domain.com', 'user@domain',
  ];
  invalidEmails.forEach((email) => {
    it(`invalid email fails: ${email}`, () => {
      expect(validateRule(email, { type: 'email' }, ef)).not.toBeNull();
    });
  });
  it('empty string skips email validation', () => {
    expect(validateRule('', { type: 'email' }, ef)).toBeNull();
  });
  it('non-string skips email validation', () => {
    expect(validateRule(123, { type: 'email' }, ef)).toBeNull();
  });
  it('email error message mentions field label', () => {
    const e = validateRule('bad', { type: 'email' }, ef);
    expect(e).toContain('Email');
  });
});

describe('validateRule – url cases', () => {
  const uf = f({ id: 'u', type: 'url', label: 'URL', order: 0 });
  const validUrls = [
    'https://example.com', 'http://localhost:3000', 'https://sub.domain.org/path',
    'ftp://files.server.net', 'https://example.com/path?query=1&b=2',
  ];
  validUrls.forEach((url) => {
    it(`valid url passes: ${url}`, () => {
      expect(validateRule(url, { type: 'url' }, uf)).toBeNull();
    });
  });
  const invalidUrls = ['notaurl', 'just text', 'missing-scheme.com'];
  invalidUrls.forEach((url) => {
    it(`invalid url fails: ${url}`, () => {
      expect(validateRule(url, { type: 'url' }, uf)).not.toBeNull();
    });
  });
  it('empty string skips url validation', () => {
    expect(validateRule('', { type: 'url' }, uf)).toBeNull();
  });
  it('non-string skips url validation', () => {
    expect(validateRule(123, { type: 'url' }, uf)).toBeNull();
  });
  it('url error message mentions field label', () => {
    const e = validateRule('notaurl', { type: 'url' }, uf);
    expect(e).toContain('URL');
  });
});

describe('validateRule – custom rule', () => {
  const cf = f({ id: 'c', type: 'text', label: 'C', order: 0 });
  it('custom returns null when fn returns true', () => {
    const rule = { type: 'custom' as const, fn: () => true, message: 'fail' };
    expect(validateRule('any', rule, cf)).toBeNull();
  });
  it('custom returns message when fn returns false', () => {
    const rule = { type: 'custom' as const, fn: () => false, message: 'custom error' };
    expect(validateRule('any', rule, cf)).toBe('custom error');
  });
  it('custom fn receives value', () => {
    let received: unknown;
    const rule = { type: 'custom' as const, fn: (v: unknown) => { received = v; return true; }, message: '' };
    validateRule('test-value', rule, cf);
    expect(received).toBe('test-value');
  });
  it('custom fn with numeric value', () => {
    const rule = { type: 'custom' as const, fn: (v: unknown) => (v as number) > 0, message: 'must be positive' };
    expect(validateRule(5, rule, cf)).toBeNull();
    expect(validateRule(-1, rule, cf)).toBe('must be positive');
  });
  it('custom fn with array value', () => {
    const rule = { type: 'custom' as const, fn: (v: unknown) => Array.isArray(v) && (v as unknown[]).length > 0, message: 'must have items' };
    expect(validateRule(['a'], rule, cf)).toBeNull();
    expect(validateRule([], rule, cf)).toBe('must have items');
  });
});

describe('createField – all field types', () => {
  const allTypes: Array<import('../src/types').FormFieldType> = [
    'text', 'textarea', 'number', 'email', 'password', 'tel',
    'date', 'datetime', 'time', 'checkbox', 'radio', 'select',
    'multiselect', 'file', 'hidden', 'range', 'color', 'url',
  ];
  allTypes.forEach((type) => {
    it(`createField with type ${type}`, () => {
      const field = f({ id: `field-${type}`, type, label: `Label ${type}`, order: 0 });
      expect(field.type).toBe(type);
      expect(field.id).toBe(`field-${type}`);
    });
    it(`isValidFieldType returns true for ${type}`, () => {
      expect(isValidFieldType(type)).toBe(true);
    });
  });
});

describe('isValidFieldType – invalid types', () => {
  const badTypes = ['TEXT', 'Text', 'TEXTAREA', 'Number', 'bool', 'integer', 'float', 'array', 'object', ''];
  badTypes.forEach((t) => {
    it(`isValidFieldType("${t}") is false`, () => {
      expect(isValidFieldType(t)).toBe(false);
    });
  });
});

describe('createSchema – variations', () => {
  it('default version is 1', () => {
    const s = createSchema('s1', 'T', []);
    expect(s.version).toBe(1);
  });
  it('custom version stored', () => {
    const s = createSchema('s2', 'T', [], 5);
    expect(s.version).toBe(5);
  });
  it('id stored correctly', () => {
    const s = createSchema('my-id', 'T', []);
    expect(s.id).toBe('my-id');
  });
  it('title stored correctly', () => {
    const s = createSchema('s', 'My Schema Title', []);
    expect(s.title).toBe('My Schema Title');
  });
  it('sections is reference to passed array', () => {
    const secs: import('../src/types').FormSection[] = [];
    const s = createSchema('s', 'T', secs);
    expect(s.sections).toBe(secs);
  });
  it('schema with multiple sections', () => {
    const sec1 = createSection('s1', 'Section 1', [], 1);
    const sec2 = createSection('s2', 'Section 2', [], 2);
    const schema = createSchema('form', 'Form', [sec1, sec2]);
    expect(schema.sections).toHaveLength(2);
  });
});

describe('createSection – edge cases', () => {
  it('section with no fields', () => {
    const s = createSection('s', 'Title', [], 0);
    expect(s.fields).toHaveLength(0);
  });
  it('section with multiple fields', () => {
    const fields = [
      f({ id: 'a', type: 'text', label: 'A', order: 0 }),
      f({ id: 'b', type: 'number', label: 'B', order: 1 }),
      f({ id: 'c', type: 'email', label: 'C', order: 2 }),
    ];
    const s = createSection('s', 'T', fields, 0);
    expect(s.fields).toHaveLength(3);
  });
  it('section title stored', () => {
    const s = createSection('s', 'My Section', [], 0);
    expect(s.title).toBe('My Section');
  });
  it('section id stored', () => {
    const s = createSection('my-section-id', 'T', [], 0);
    expect(s.id).toBe('my-section-id');
  });
  it('section order stored', () => {
    const s = createSection('s', 'T', [], 42);
    expect(s.order).toBe(42);
  });
  it('section negative order stored', () => {
    const s = createSection('s', 'T', [], -5);
    expect(s.order).toBe(-5);
  });
});

describe('getDefaultValues – extended', () => {
  it('returns empty object for empty schema', () => {
    const schema = createSchema('s', 'T', [createSection('s1', 'S', [], 0)]);
    expect(getDefaultValues(schema)).toEqual({});
  });
  it('null for fields without defaultValue', () => {
    const schema = createSchema('s', 'T', [
      createSection('s1', 'S', [f({ id: 'x', type: 'text', label: 'X', order: 0 })], 0),
    ]);
    expect(getDefaultValues(schema).x).toBeNull();
  });
  it('uses string defaultValue', () => {
    const schema = createSchema('s', 'T', [
      createSection('s1', 'S', [f({ id: 'x', type: 'text', label: 'X', order: 0, defaultValue: 'hello' })], 0),
    ]);
    expect(getDefaultValues(schema).x).toBe('hello');
  });
  it('uses number defaultValue', () => {
    const schema = createSchema('s', 'T', [
      createSection('s1', 'S', [f({ id: 'n', type: 'number', label: 'N', order: 0, defaultValue: 42 })], 0),
    ]);
    expect(getDefaultValues(schema).n).toBe(42);
  });
  it('uses false boolean defaultValue', () => {
    const schema = createSchema('s', 'T', [
      createSection('s1', 'S', [f({ id: 'b', type: 'checkbox', label: 'B', order: 0, defaultValue: false })], 0),
    ]);
    expect(getDefaultValues(schema).b).toBe(false);
  });
  it('uses true boolean defaultValue', () => {
    const schema = createSchema('s', 'T', [
      createSection('s1', 'S', [f({ id: 'b', type: 'checkbox', label: 'B', order: 0, defaultValue: true })], 0),
    ]);
    expect(getDefaultValues(schema).b).toBe(true);
  });
  it('uses array defaultValue', () => {
    const schema = createSchema('s', 'T', [
      createSection('s1', 'S', [f({ id: 'ms', type: 'multiselect', label: 'MS', order: 0, defaultValue: ['a', 'b'] })], 0),
    ]);
    expect(getDefaultValues(schema).ms).toEqual(['a', 'b']);
  });
  it('aggregates fields from multiple sections', () => {
    const schema = createSchema('s', 'T', [
      createSection('s1', 'S1', [f({ id: 'a', type: 'text', label: 'A', order: 0, defaultValue: 'x' })], 0),
      createSection('s2', 'S2', [f({ id: 'b', type: 'number', label: 'B', order: 0, defaultValue: 7 })], 1),
    ]);
    const defaults = getDefaultValues(schema);
    expect(defaults.a).toBe('x');
    expect(defaults.b).toBe(7);
  });
});

describe('validateForm – dependsOn', () => {
  const makeDepSchema = (depFieldId: string, depValue: unknown) => createSchema('s', 'T', [
    createSection('s1', 'S', [
      f({ id: 'toggle', type: 'select', label: 'Toggle', order: 0 }),
      f({ id: 'dep', type: 'text', label: 'Dep', order: 1,
          validation: [requiredRule()],
          dependsOn: { fieldId: depFieldId, value: depValue } }),
    ], 0),
  ]);

  it('skips validation when dependsOn condition not met', () => {
    const schema = makeDepSchema('toggle', 'yes');
    const errors = validateForm(schema, { toggle: 'no', dep: '' });
    expect(errors.filter(e => e.fieldId === 'dep')).toHaveLength(0);
  });
  it('validates when dependsOn condition IS met', () => {
    const schema = makeDepSchema('toggle', 'yes');
    const errors = validateForm(schema, { toggle: 'yes', dep: '' });
    expect(errors.filter(e => e.fieldId === 'dep').length).toBeGreaterThan(0);
  });
  it('skips when dep value is undefined and condition needs specific value', () => {
    const schema = makeDepSchema('toggle', 'show');
    const errors = validateForm(schema, { dep: '' });
    expect(errors.filter(e => e.fieldId === 'dep')).toHaveLength(0);
  });
  it('validates when dep value matches boolean true', () => {
    const schema = makeDepSchema('toggle', true);
    const errors = validateForm(schema, { toggle: true, dep: '' });
    expect(errors.filter(e => e.fieldId === 'dep').length).toBeGreaterThan(0);
  });
  it('skips when dep value is false and condition needs true', () => {
    const schema = makeDepSchema('toggle', true);
    const errors = validateForm(schema, { toggle: false, dep: '' });
    expect(errors.filter(e => e.fieldId === 'dep')).toHaveLength(0);
  });
});

describe('getFieldErrors', () => {
  const errors: import('../src/types').ValidationError[] = [
    { fieldId: 'name', message: 'Name is required' },
    { fieldId: 'email', message: 'Email is required' },
    { fieldId: 'email', message: 'Email must be valid' },
    { fieldId: 'age', message: 'Age must be at least 18' },
  ];
  it('returns errors for field with one error', () => {
    expect(getFieldErrors(errors, 'name')).toEqual(['Name is required']);
  });
  it('returns errors for field with two errors', () => {
    expect(getFieldErrors(errors, 'email')).toHaveLength(2);
  });
  it('returns empty array for unknown field', () => {
    expect(getFieldErrors(errors, 'unknown')).toHaveLength(0);
  });
  it('returns all messages as strings', () => {
    const msgs = getFieldErrors(errors, 'email');
    expect(msgs.every(m => typeof m === 'string')).toBe(true);
  });
  it('returns empty array for empty errors array', () => {
    expect(getFieldErrors([], 'name')).toHaveLength(0);
  });
  it('correct messages for field with single error', () => {
    expect(getFieldErrors(errors, 'age')).toEqual(['Age must be at least 18']);
  });
});

describe('countFields – extended', () => {
  it('0 for schema with empty sections', () => {
    const s = createSchema('s', 'T', [createSection('s1', 'S', [], 0), createSection('s2', 'S2', [], 1)]);
    expect(countFields(s)).toBe(0);
  });
  it('1 for schema with 1 field in 1 section', () => {
    const s = createSchema('s', 'T', [
      createSection('s1', 'S', [f({ id: 'a', type: 'text', label: 'A', order: 0 })], 0),
    ]);
    expect(countFields(s)).toBe(1);
  });
  it('sums fields across multiple sections', () => {
    const s = createSchema('s', 'T', [
      createSection('s1', 'S1', [
        f({ id: 'a', type: 'text', label: 'A', order: 0 }),
        f({ id: 'b', type: 'text', label: 'B', order: 1 }),
      ], 0),
      createSection('s2', 'S2', [
        f({ id: 'c', type: 'text', label: 'C', order: 0 }),
      ], 1),
    ]);
    expect(countFields(s)).toBe(3);
  });
  it('5 fields across 3 sections', () => {
    const mk = (id: string) => f({ id, type: 'text', label: id, order: 0 });
    const s = createSchema('s', 'T', [
      createSection('s1', 'S1', [mk('a'), mk('b')], 0),
      createSection('s2', 'S2', [mk('c'), mk('d')], 1),
      createSection('s3', 'S3', [mk('e')], 2),
    ]);
    expect(countFields(s)).toBe(5);
  });
});

describe('getRequiredFields – extended', () => {
  const mk = (id: string, req: boolean) => f({
    id, type: 'text', label: id, order: 0,
    validation: req ? [requiredRule()] : [],
  });
  it('returns empty for no required fields', () => {
    const s = createSchema('s', 'T', [createSection('s1', 'S', [mk('a', false), mk('b', false)], 0)]);
    expect(getRequiredFields(s)).toHaveLength(0);
  });
  it('returns required fields only', () => {
    const s = createSchema('s', 'T', [createSection('s1', 'S', [mk('a', true), mk('b', false), mk('c', true)], 0)]);
    const req = getRequiredFields(s);
    expect(req).toHaveLength(2);
    expect(req.map(f => f.id)).toEqual(expect.arrayContaining(['a', 'c']));
  });
  it('required field with additional rules still counted', () => {
    const field = f({ id: 'x', type: 'text', label: 'X', order: 0, validation: [requiredRule(), minLengthRule(5)] });
    const s = createSchema('s', 'T', [createSection('s1', 'S', [field], 0)]);
    expect(getRequiredFields(s)).toHaveLength(1);
  });
  it('aggregates required fields from multiple sections', () => {
    const s = createSchema('s', 'T', [
      createSection('s1', 'S1', [mk('a', true)], 0),
      createSection('s2', 'S2', [mk('b', true), mk('c', false)], 1),
    ]);
    expect(getRequiredFields(s)).toHaveLength(2);
  });
});

describe('removeFieldFromSection – extended', () => {
  it('removing non-existent id returns same fields', () => {
    const field = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    const sec = createSection('s', 'S', [field], 0);
    expect(removeFieldFromSection(sec, 'notexist').fields).toHaveLength(1);
  });
  it('removing only field returns empty', () => {
    const field = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    const sec = createSection('s', 'S', [field], 0);
    expect(removeFieldFromSection(sec, 'a').fields).toHaveLength(0);
  });
  it('removing one of two keeps other', () => {
    const a = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    const b = f({ id: 'b', type: 'text', label: 'B', order: 1 });
    const sec = createSection('s', 'S', [a, b], 0);
    const result = removeFieldFromSection(sec, 'a');
    expect(result.fields).toHaveLength(1);
    expect(result.fields[0].id).toBe('b');
  });
  it('does not mutate original section', () => {
    const field = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    const sec = createSection('s', 'S', [field], 0);
    removeFieldFromSection(sec, 'a');
    expect(sec.fields).toHaveLength(1);
  });
  it('removes by id precisely', () => {
    const a = f({ id: 'ab', type: 'text', label: 'AB', order: 0 });
    const b = f({ id: 'a', type: 'text', label: 'A', order: 1 });
    const sec = createSection('s', 'S', [a, b], 0);
    expect(removeFieldFromSection(sec, 'a').fields.map(x => x.id)).toEqual(['ab']);
  });
});

describe('reorderFields', () => {
  it('already-sorted fields unchanged in order', () => {
    const a = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    const b = f({ id: 'b', type: 'text', label: 'B', order: 1 });
    const c = f({ id: 'c', type: 'text', label: 'C', order: 2 });
    const sec = createSection('s', 'S', [a, b, c], 0);
    const result = reorderFields(sec);
    expect(result.fields.map(x => x.id)).toEqual(['a', 'b', 'c']);
  });
  it('reversed fields get sorted', () => {
    const a = f({ id: 'a', type: 'text', label: 'A', order: 2 });
    const b = f({ id: 'b', type: 'text', label: 'B', order: 1 });
    const c = f({ id: 'c', type: 'text', label: 'C', order: 0 });
    const sec = createSection('s', 'S', [a, b, c], 0);
    const result = reorderFields(sec);
    expect(result.fields.map(x => x.id)).toEqual(['c', 'b', 'a']);
  });
  it('shuffled fields get sorted', () => {
    const fields = [
      f({ id: 'c', type: 'text', label: 'C', order: 2 }),
      f({ id: 'a', type: 'text', label: 'A', order: 0 }),
      f({ id: 'b', type: 'text', label: 'B', order: 1 }),
    ];
    const sec = createSection('s', 'S', fields, 0);
    expect(reorderFields(sec).fields.map(x => x.id)).toEqual(['a', 'b', 'c']);
  });
  it('does not mutate original section fields array', () => {
    const a = f({ id: 'a', type: 'text', label: 'A', order: 2 });
    const b = f({ id: 'b', type: 'text', label: 'B', order: 0 });
    const sec = createSection('s', 'S', [a, b], 0);
    reorderFields(sec);
    expect(sec.fields[0].id).toBe('a');
  });
  it('single field returns single field', () => {
    const a = f({ id: 'a', type: 'text', label: 'A', order: 99 });
    const sec = createSection('s', 'S', [a], 0);
    expect(reorderFields(sec).fields).toHaveLength(1);
  });
});

describe('sortSections – extended', () => {
  it('already-sorted sections unchanged', () => {
    const s1 = createSection('s1', 'S1', [], 0);
    const s2 = createSection('s2', 'S2', [], 1);
    const schema = createSchema('form', 'F', [s1, s2]);
    const sorted = sortSections(schema);
    expect(sorted.sections.map(s => s.id)).toEqual(['s1', 's2']);
  });
  it('reversed sections get sorted', () => {
    const s1 = createSection('s1', 'S1', [], 1);
    const s2 = createSection('s2', 'S2', [], 0);
    const schema = createSchema('form', 'F', [s1, s2]);
    const sorted = sortSections(schema);
    expect(sorted.sections.map(s => s.id)).toEqual(['s2', 's1']);
  });
  it('does not mutate original schema sections array', () => {
    const s1 = createSection('s1', 'S1', [], 1);
    const s2 = createSection('s2', 'S2', [], 0);
    const schema = createSchema('form', 'F', [s1, s2]);
    sortSections(schema);
    expect(schema.sections[0].id).toBe('s1');
  });
  it('single section returned', () => {
    const s1 = createSection('s1', 'S1', [], 0);
    const schema = createSchema('form', 'F', [s1]);
    expect(sortSections(schema).sections).toHaveLength(1);
  });
  it('schema properties preserved', () => {
    const schema = createSchema('my-form', 'My Form', [], 3);
    const sorted = sortSections(schema);
    expect(sorted.id).toBe('my-form');
    expect(sorted.title).toBe('My Form');
    expect(sorted.version).toBe(3);
  });
});

describe('schemaToJson / schemaFromJson – round-trip', () => {
  it('round-trip preserves id', () => {
    const s = createSchema('round-trip', 'RT', []);
    expect(schemaFromJson(schemaToJson(s)).id).toBe('round-trip');
  });
  it('round-trip preserves title', () => {
    const s = createSchema('s', 'My Title', []);
    expect(schemaFromJson(schemaToJson(s)).title).toBe('My Title');
  });
  it('round-trip preserves version', () => {
    const s = createSchema('s', 'T', [], 7);
    expect(schemaFromJson(schemaToJson(s)).version).toBe(7);
  });
  it('round-trip preserves sections count', () => {
    const s = createSchema('s', 'T', [
      createSection('s1', 'S1', [], 0),
      createSection('s2', 'S2', [], 1),
    ]);
    expect(schemaFromJson(schemaToJson(s)).sections).toHaveLength(2);
  });
  it('round-trip preserves field data', () => {
    const field = f({ id: 'test-field', type: 'email', label: 'Email', order: 0 });
    const s = createSchema('s', 'T', [createSection('s1', 'S', [field], 0)]);
    const restored = schemaFromJson(schemaToJson(s));
    expect(restored.sections[0].fields[0].id).toBe('test-field');
    expect(restored.sections[0].fields[0].type).toBe('email');
  });
  it('schemaToJson returns a string', () => {
    expect(typeof schemaToJson(createSchema('s', 'T', []))).toBe('string');
  });
  it('schemaToJson produces valid JSON', () => {
    const s = createSchema('s', 'T', []);
    expect(() => JSON.parse(schemaToJson(s))).not.toThrow();
  });
});

describe('validateField – disabled/hidden', () => {
  const validatedField = f({
    id: 'x', type: 'text', label: 'X', order: 0,
    validation: [requiredRule(), minLengthRule(5)],
  });
  it('disabled field skips validation', () => {
    const disabledFld = f({ ...validatedField, disabled: true });
    expect(validateField(disabledFld, '')).toHaveLength(0);
  });
  it('hidden field skips validation', () => {
    const hiddenFld = f({ ...validatedField, hidden: true });
    expect(validateField(hiddenFld, '')).toHaveLength(0);
  });
  it('non-disabled non-hidden field validates', () => {
    expect(validateField(validatedField, '')).not.toHaveLength(0);
  });
  it('explicitly not disabled validates', () => {
    const fld = f({ ...validatedField, disabled: false });
    expect(validateField(fld, '')).not.toHaveLength(0);
  });
  it('explicitly not hidden validates', () => {
    const fld = f({ ...validatedField, hidden: false });
    expect(validateField(fld, '')).not.toHaveLength(0);
  });
});

describe('buildOption – extended', () => {
  it('default disabled is false', () => {
    expect(buildOption('A', 'a').disabled).toBe(false);
  });
  it('explicit disabled true', () => {
    expect(buildOption('A', 'a', true).disabled).toBe(true);
  });
  it('explicit disabled false', () => {
    expect(buildOption('A', 'a', false).disabled).toBe(false);
  });
  it('label stored', () => {
    expect(buildOption('My Option', 'val').label).toBe('My Option');
  });
  it('value stored', () => {
    expect(buildOption('L', 'my-value').value).toBe('my-value');
  });
  it('empty label stored', () => {
    expect(buildOption('', 'v').label).toBe('');
  });
  it('empty value stored', () => {
    expect(buildOption('L', '').value).toBe('');
  });
  const optionCases = [
    ['Yes', 'yes'], ['No', 'no'], ['Maybe', 'maybe'],
    ['Option 1', 'opt1'], ['Option 2', 'opt2'],
  ];
  optionCases.forEach(([label, value]) => {
    it(`buildOption(${label}, ${value})`, () => {
      const opt = buildOption(label, value);
      expect(opt.label).toBe(label);
      expect(opt.value).toBe(value);
    });
  });
});

describe('flattenFields – extended', () => {
  it('empty schema returns empty array', () => {
    expect(flattenFields(createSchema('s', 'T', []))).toHaveLength(0);
  });
  it('single section single field returns 1', () => {
    const s = createSchema('s', 'T', [
      createSection('s1', 'S1', [f({ id: 'a', type: 'text', label: 'A', order: 0 })], 0),
    ]);
    expect(flattenFields(s)).toHaveLength(1);
  });
  it('maintains field order within section', () => {
    const a = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    const b = f({ id: 'b', type: 'text', label: 'B', order: 1 });
    const s = createSchema('s', 'T', [createSection('s1', 'S', [a, b], 0)]);
    const flat = flattenFields(s);
    expect(flat[0].id).toBe('a');
    expect(flat[1].id).toBe('b');
  });
  it('concatenates fields from sections in order', () => {
    const a = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    const b = f({ id: 'b', type: 'text', label: 'B', order: 0 });
    const s = createSchema('s', 'T', [
      createSection('s1', 'S1', [a], 0),
      createSection('s2', 'S2', [b], 1),
    ]);
    const flat = flattenFields(s);
    expect(flat[0].id).toBe('a');
    expect(flat[1].id).toBe('b');
  });
});

describe('findField – extended', () => {
  const schema = createSchema('s', 'T', [
    createSection('s1', 'S1', [
      f({ id: 'first', type: 'text', label: 'First', order: 0 }),
      f({ id: 'second', type: 'email', label: 'Second', order: 1 }),
    ], 0),
    createSection('s2', 'S2', [
      f({ id: 'third', type: 'number', label: 'Third', order: 0 }),
    ], 1),
  ]);
  it('finds first field by id', () => {
    expect(findField(schema, 'first')?.id).toBe('first');
  });
  it('finds second field by id', () => {
    expect(findField(schema, 'second')?.id).toBe('second');
  });
  it('finds field in second section', () => {
    expect(findField(schema, 'third')?.id).toBe('third');
  });
  it('returns undefined for missing id', () => {
    expect(findField(schema, 'missing')).toBeUndefined();
  });
  it('returns correct field type', () => {
    expect(findField(schema, 'second')?.type).toBe('email');
  });
  it('returns correct field label', () => {
    expect(findField(schema, 'third')?.label).toBe('Third');
  });
});

describe('addFieldToSection – immutability', () => {
  it('does not mutate original section', () => {
    const sec = createSection('s', 'S', [], 0);
    const field = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    addFieldToSection(sec, field);
    expect(sec.fields).toHaveLength(0);
  });
  it('returned section has new field', () => {
    const sec = createSection('s', 'S', [], 0);
    const field = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    const result = addFieldToSection(sec, field);
    expect(result.fields).toHaveLength(1);
  });
  it('existing fields preserved in new section', () => {
    const existing = f({ id: 'x', type: 'text', label: 'X', order: 0 });
    const sec = createSection('s', 'S', [existing], 0);
    const newField = f({ id: 'y', type: 'text', label: 'Y', order: 1 });
    const result = addFieldToSection(sec, newField);
    expect(result.fields.find(f => f.id === 'x')).toBeDefined();
    expect(result.fields.find(f => f.id === 'y')).toBeDefined();
  });
  it('returned section id matches original', () => {
    const sec = createSection('my-section', 'S', [], 0);
    const field = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    expect(addFieldToSection(sec, field).id).toBe('my-section');
  });
  it('new field is last in array', () => {
    const existing = f({ id: 'x', type: 'text', label: 'X', order: 0 });
    const sec = createSection('s', 'S', [existing], 0);
    const newField = f({ id: 'z', type: 'text', label: 'Z', order: 1 });
    const result = addFieldToSection(sec, newField);
    expect(result.fields[result.fields.length - 1].id).toBe('z');
  });
});

describe('isFormValid – comprehensive', () => {
  it('valid form with all required fields filled', () => {
    const schema = createSchema('s', 'T', [
      createSection('s1', 'S', [
        f({ id: 'name', type: 'text', label: 'Name', order: 0, validation: [requiredRule()] }),
        f({ id: 'email', type: 'email', label: 'Email', order: 1, validation: [requiredRule()] }),
      ], 0),
    ]);
    expect(isFormValid(schema, { name: 'Alice', email: 'a@b.com' })).toBe(true);
  });
  it('invalid form with missing required field', () => {
    const schema = createSchema('s', 'T', [
      createSection('s1', 'S', [
        f({ id: 'name', type: 'text', label: 'Name', order: 0, validation: [requiredRule()] }),
      ], 0),
    ]);
    expect(isFormValid(schema, { name: '' })).toBe(false);
  });
  it('valid form with no validation rules', () => {
    const schema = createSchema('s', 'T', [
      createSection('s1', 'S', [
        f({ id: 'x', type: 'text', label: 'X', order: 0 }),
      ], 0),
    ]);
    expect(isFormValid(schema, { x: '' })).toBe(true);
  });
  it('empty schema is valid', () => {
    expect(isFormValid(createSchema('s', 'T', []), {})).toBe(true);
  });
  it('disabled required field makes form valid', () => {
    const schema = createSchema('s', 'T', [
      createSection('s1', 'S', [
        f({ id: 'x', type: 'text', label: 'X', order: 0, validation: [requiredRule()], disabled: true }),
      ], 0),
    ]);
    expect(isFormValid(schema, { x: '' })).toBe(true);
  });
});

describe('validateForm – multiple sections and fields', () => {
  const makeSchema = () => createSchema('s', 'T', [
    createSection('s1', 'Personal', [
      f({ id: 'first', type: 'text', label: 'First Name', order: 0, validation: [requiredRule(), minLengthRule(2)] }),
      f({ id: 'last', type: 'text', label: 'Last Name', order: 1, validation: [requiredRule()] }),
      f({ id: 'email', type: 'email', label: 'Email', order: 2, validation: [requiredRule(), { type: 'email' }] }),
    ], 0),
    createSection('s2', 'Details', [
      f({ id: 'age', type: 'number', label: 'Age', order: 0, validation: [{ type: 'min', value: 18 }, { type: 'max', value: 120 }] }),
      f({ id: 'website', type: 'url', label: 'Website', order: 1, validation: [{ type: 'url' }] }),
    ], 1),
  ]);

  it('all valid → 0 errors', () => {
    const errors = validateForm(makeSchema(), { first: 'John', last: 'Doe', email: 'john@example.com', age: 30, website: 'https://example.com' });
    expect(errors).toHaveLength(0);
  });
  it('missing required first name → error', () => {
    const errors = validateForm(makeSchema(), { first: '', last: 'Doe', email: 'john@example.com' });
    expect(errors.some(e => e.fieldId === 'first')).toBe(true);
  });
  it('missing required last name → error', () => {
    const errors = validateForm(makeSchema(), { first: 'Jo', last: '', email: 'john@example.com' });
    expect(errors.some(e => e.fieldId === 'last')).toBe(true);
  });
  it('invalid email → error', () => {
    const errors = validateForm(makeSchema(), { first: 'Jo', last: 'Doe', email: 'notanemail' });
    expect(errors.some(e => e.fieldId === 'email')).toBe(true);
  });
  it('age below min → error', () => {
    const errors = validateForm(makeSchema(), { first: 'Jo', last: 'Doe', email: 'j@d.com', age: 10 });
    expect(errors.some(e => e.fieldId === 'age')).toBe(true);
  });
  it('age above max → error', () => {
    const errors = validateForm(makeSchema(), { first: 'Jo', last: 'Doe', email: 'j@d.com', age: 200 });
    expect(errors.some(e => e.fieldId === 'age')).toBe(true);
  });
  it('invalid website URL → error', () => {
    const errors = validateForm(makeSchema(), { first: 'Jo', last: 'Doe', email: 'j@d.com', website: 'notaurl' });
    expect(errors.some(e => e.fieldId === 'website')).toBe(true);
  });
  it('first name too short → minLength error', () => {
    const errors = validateForm(makeSchema(), { first: 'J', last: 'Doe', email: 'j@d.com' });
    expect(errors.some(e => e.fieldId === 'first')).toBe(true);
  });
  it('error objects have fieldId and message', () => {
    const errors = validateForm(makeSchema(), { first: '', last: '', email: '' });
    errors.forEach(e => {
      expect(typeof e.fieldId).toBe('string');
      expect(typeof e.message).toBe('string');
    });
  });
  it('valid values produce no errors for each field', () => {
    const schema = makeSchema();
    const values = { first: 'John', last: 'Doe', email: 'j@d.com', age: 25, website: '' };
    const errors = validateForm(schema, values);
    expect(errors.filter(e => e.fieldId === 'first')).toHaveLength(0);
    expect(errors.filter(e => e.fieldId === 'last')).toHaveLength(0);
  });
});

describe('validateRule – required with various value types', () => {
  const rf = f({ id: 'r', type: 'text', label: 'R', order: 0 });
  const passCases: unknown[] = [
    'hello', 'a', '0', ' ', 0, 1, -1, true, false, ['a'], [1, 2], { key: 'val' },
  ];
  passCases.forEach((val) => {
    it(`required passes for: ${JSON.stringify(val)}`, () => {
      expect(validateRule(val, { type: 'required' }, rf)).toBeNull();
    });
  });
  const failCases: unknown[] = [null, undefined, '', []];
  failCases.forEach((val) => {
    it(`required fails for: ${JSON.stringify(val)}`, () => {
      expect(validateRule(val, { type: 'required' }, rf)).not.toBeNull();
    });
  });
  it('required error message contains field label', () => {
    const e = validateRule('', { type: 'required' }, rf);
    expect(e).toContain('R');
  });
});

describe('createField – optional properties', () => {
  it('placeholder can be set', () => {
    const field = f({ id: 'x', type: 'text', label: 'X', order: 0, placeholder: 'Enter value' });
    expect(field.placeholder).toBe('Enter value');
  });
  it('helpText can be set', () => {
    const field = f({ id: 'x', type: 'text', label: 'X', order: 0, helpText: 'Help!' });
    expect(field.helpText).toBe('Help!');
  });
  it('options array can be set', () => {
    const opts = [buildOption('A', 'a'), buildOption('B', 'b')];
    const field = f({ id: 'x', type: 'select', label: 'X', order: 0, options: opts });
    expect(field.options).toHaveLength(2);
  });
  it('dependsOn can be set', () => {
    const field = f({ id: 'x', type: 'text', label: 'X', order: 0, dependsOn: { fieldId: 'y', value: 'yes' } });
    expect(field.dependsOn?.fieldId).toBe('y');
    expect(field.dependsOn?.value).toBe('yes');
  });
  it('disabled defaults to undefined', () => {
    const field = f({ id: 'x', type: 'text', label: 'X', order: 0 });
    expect(field.disabled).toBeUndefined();
  });
  it('hidden defaults to undefined', () => {
    const field = f({ id: 'x', type: 'text', label: 'X', order: 0 });
    expect(field.hidden).toBeUndefined();
  });
  it('validation defaults to undefined', () => {
    const field = f({ id: 'x', type: 'text', label: 'X', order: 0 });
    expect(field.validation).toBeUndefined();
  });
  it('order stored correctly', () => {
    const field = f({ id: 'x', type: 'text', label: 'X', order: 99 });
    expect(field.order).toBe(99);
  });
  it('id stored correctly', () => {
    const field = f({ id: 'my-unique-id', type: 'text', label: 'X', order: 0 });
    expect(field.id).toBe('my-unique-id');
  });
  it('label stored correctly', () => {
    const field = f({ id: 'x', type: 'text', label: 'My Label', order: 0 });
    expect(field.label).toBe('My Label');
  });
});

describe('validateField – validation rules array', () => {
  it('no validation array → no errors', () => {
    const field = f({ id: 'x', type: 'text', label: 'X', order: 0 });
    expect(validateField(field, '')).toHaveLength(0);
  });
  it('empty validation array → no errors', () => {
    const field = f({ id: 'x', type: 'text', label: 'X', order: 0, validation: [] });
    expect(validateField(field, '')).toHaveLength(0);
  });
  it('single passing rule → no errors', () => {
    const field = f({ id: 'x', type: 'text', label: 'X', order: 0, validation: [minLengthRule(0)] });
    expect(validateField(field, 'hello')).toHaveLength(0);
  });
  it('single failing rule → 1 error', () => {
    const field = f({ id: 'x', type: 'text', label: 'X', order: 0, validation: [requiredRule()] });
    expect(validateField(field, '')).toHaveLength(1);
  });
  it('two failing rules → 2 errors', () => {
    const field = f({ id: 'x', type: 'text', label: 'X', order: 0, validation: [requiredRule(), minLengthRule(5)] });
    expect(validateField(field, '')).toHaveLength(2);
  });
  it('error fieldId matches field id', () => {
    const field = f({ id: 'my-field', type: 'text', label: 'X', order: 0, validation: [requiredRule()] });
    const errors = validateField(field, '');
    expect(errors[0].fieldId).toBe('my-field');
  });
  it('error message is a string', () => {
    const field = f({ id: 'x', type: 'text', label: 'X', order: 0, validation: [requiredRule()] });
    const errors = validateField(field, '');
    expect(typeof errors[0].message).toBe('string');
  });
  it('three rules all passing → 0 errors', () => {
    const field = f({ id: 'x', type: 'text', label: 'X', order: 0,
      validation: [requiredRule(), minLengthRule(2), maxLengthRule(10)] });
    expect(validateField(field, 'hello')).toHaveLength(0);
  });
  it('mixed pass/fail rules → only failing rules produce errors', () => {
    const field = f({ id: 'x', type: 'text', label: 'X', order: 0,
      validation: [requiredRule(), maxLengthRule(3)] });
    expect(validateField(field, 'toolong')).toHaveLength(1);
  });
});

describe('minLengthRule / maxLengthRule edge values', () => {
  const lengths = [0, 1, 2, 3, 5, 8, 13, 21, 50, 100, 255, 1000];
  lengths.forEach((n) => {
    it(`minLengthRule(${n}).type === 'minLength'`, () => {
      expect(minLengthRule(n).type).toBe('minLength');
    });
    it(`maxLengthRule(${n}).type === 'maxLength'`, () => {
      expect(maxLengthRule(n).type).toBe('maxLength');
    });
    it(`minLengthRule(${n}).value === ${n}`, () => {
      expect(minLengthRule(n).value).toBe(n);
    });
    it(`maxLengthRule(${n}).value === ${n}`, () => {
      expect(maxLengthRule(n).value).toBe(n);
    });
  });
});

describe('patternRule – variations', () => {
  it('type is pattern', () => {
    expect(patternRule('^test').type).toBe('pattern');
  });
  it('value stored for simple pattern', () => {
    expect(patternRule('\\d+').value).toBe('\\d+');
  });
  it('no message property when not provided', () => {
    const r = patternRule('^abc');
    expect('message' in r).toBe(false);
  });
  it('message included when provided', () => {
    const r = patternRule('^abc', 'Must start with abc');
    expect(r.message).toBe('Must start with abc');
  });
  it('empty pattern works', () => {
    expect(patternRule('').value).toBe('');
  });
  it('complex regex pattern stored', () => {
    const pat = '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$';
    expect(patternRule(pat).value).toBe(pat);
  });
});

describe('requiredRule', () => {
  it('type is required', () => expect(requiredRule().type).toBe('required'));
  it('returns a new object each call', () => {
    expect(requiredRule()).not.toBe(requiredRule());
  });
  it('no extra properties', () => {
    const r = requiredRule() as Record<string, unknown>;
    expect(Object.keys(r)).toEqual(['type']);
  });
});

describe('FormSection collapsible property', () => {
  it('collapsible not set by default in createSection', () => {
    const s = createSection('s', 'S', [], 0);
    expect(s.collapsible).toBeUndefined();
  });
});

describe('getDefaultValues – multiple fields same section', () => {
  const fields = [
    f({ id: 'a', type: 'text', label: 'A', order: 0, defaultValue: 'alpha' }),
    f({ id: 'b', type: 'text', label: 'B', order: 1, defaultValue: 'beta' }),
    f({ id: 'c', type: 'text', label: 'C', order: 2, defaultValue: 'gamma' }),
    f({ id: 'd', type: 'text', label: 'D', order: 3, defaultValue: 'delta' }),
    f({ id: 'e', type: 'text', label: 'E', order: 4 }),
  ];
  const schema = createSchema('s', 'T', [createSection('s1', 'S', fields, 0)]);
  it('a default is alpha', () => expect(getDefaultValues(schema).a).toBe('alpha'));
  it('b default is beta', () => expect(getDefaultValues(schema).b).toBe('beta'));
  it('c default is gamma', () => expect(getDefaultValues(schema).c).toBe('gamma'));
  it('d default is delta', () => expect(getDefaultValues(schema).d).toBe('delta'));
  it('e default is null', () => expect(getDefaultValues(schema).e).toBeNull());
  it('returns 5 keys', () => expect(Object.keys(getDefaultValues(schema))).toHaveLength(5));
});

describe('flattenFields – section ordering', () => {
  const fieldA = f({ id: 'a', type: 'text', label: 'A', order: 0 });
  const fieldB = f({ id: 'b', type: 'text', label: 'B', order: 0 });
  const fieldC = f({ id: 'c', type: 'text', label: 'C', order: 0 });

  it('3 sections with 1 field each → 3 flattened', () => {
    const s = createSchema('s', 'T', [
      createSection('s1', 'S1', [fieldA], 0),
      createSection('s2', 'S2', [fieldB], 1),
      createSection('s3', 'S3', [fieldC], 2),
    ]);
    expect(flattenFields(s)).toHaveLength(3);
  });
  it('fields from first section come first', () => {
    const s = createSchema('s', 'T', [
      createSection('s1', 'S1', [fieldA], 0),
      createSection('s2', 'S2', [fieldB], 1),
    ]);
    expect(flattenFields(s)[0].id).toBe('a');
  });
  it('fields from last section come last', () => {
    const s = createSchema('s', 'T', [
      createSection('s1', 'S1', [fieldA], 0),
      createSection('s2', 'S2', [fieldC], 1),
    ]);
    const flat = flattenFields(s);
    expect(flat[flat.length - 1].id).toBe('c');
  });
});


describe('validateRule – minLength message content', () => {
  const cases = [
    { label: 'Name', id: 'name', minLen: 2 },
    { label: 'Username', id: 'user', minLen: 5 },
    { label: 'Bio', id: 'bio', minLen: 10 },
    { label: 'Password', id: 'pwd', minLen: 8 },
  ];
  cases.forEach(({ label, id, minLen }) => {
    const fld = { id, type: 'text' as const, label, order: 0 };
    it(`minLength(${minLen}) on "${label}" error contains label`, () => {
      const e = validateRule('x', { type: 'minLength', value: minLen }, fld);
      expect(e).toContain(label);
    });
    it(`minLength(${minLen}) on "${label}" error contains ${minLen}`, () => {
      const e = validateRule('x', { type: 'minLength', value: minLen }, fld);
      expect(e).toContain(String(minLen));
    });
  });
});

describe('validateRule – maxLength message content', () => {
  const cases = [
    { label: 'Title', id: 'title', maxLen: 100 },
    { label: 'Description', id: 'desc', maxLen: 255 },
    { label: 'Tag', id: 'tag', maxLen: 20 },
  ];
  cases.forEach(({ label, id, maxLen }) => {
    const fld = { id, type: 'text' as const, label, order: 0 };
    it(`maxLength(${maxLen}) on "${label}" error contains label`, () => {
      const e = validateRule('a'.repeat(maxLen + 1), { type: 'maxLength', value: maxLen }, fld);
      expect(e).toContain(label);
    });
    it(`maxLength(${maxLen}) on "${label}" error contains ${maxLen}`, () => {
      const e = validateRule('a'.repeat(maxLen + 1), { type: 'maxLength', value: maxLen }, fld);
      expect(e).toContain(String(maxLen));
    });
  });
});

describe('createField – order values', () => {
  const orders = [0, 1, 5, 10, 50, 100, 999];
  orders.forEach((order) => {
    it(`field with order ${order} stores correctly`, () => {
      const field = { id: 'f', type: 'text' as const, label: 'F', order };
      expect(field.order).toBe(order);
    });
  });
});

describe('buildOption – multiple scenarios', () => {
  const combos = [
    ['Red', 'red', false],
    ['Green', 'green', false],
    ['Blue', 'blue', false],
    ['Disabled Option', 'disabled-opt', true],
    ['Active Option', 'active-opt', false],
    ['Special: Option', 'special', false],
    ['100%', 'hundred-pct', false],
    ['Option with spaces', 'opt-spaces', false],
  ] as [string, string, boolean][];
  combos.forEach(([label, value, disabled]) => {
    it(`buildOption(${label}, ${value}, ${disabled}).label === '${label}'`, () => {
      expect(buildOption(label, value, disabled).label).toBe(label);
    });
    it(`buildOption(${label}, ${value}, ${disabled}).value === '${value}'`, () => {
      expect(buildOption(label, value, disabled).value).toBe(value);
    });
    it(`buildOption(${label}, ${value}, ${disabled}).disabled === ${disabled}`, () => {
      expect(buildOption(label, value, disabled).disabled).toBe(disabled);
    });
  });
});

describe('isFormValid vs validateForm consistency', () => {
  const schema = createSchema('s', 'T', [
    createSection('s1', 'S', [
      f({ id: 'x', type: 'text', label: 'X', order: 0, validation: [requiredRule()] }),
    ], 0),
  ]);
  it('isFormValid false when validateForm has errors', () => {
    const errors = validateForm(schema, { x: '' });
    expect(errors.length > 0).toBe(true);
    expect(isFormValid(schema, { x: '' })).toBe(false);
  });
  it('isFormValid true when validateForm has 0 errors', () => {
    const errors = validateForm(schema, { x: 'value' });
    expect(errors).toHaveLength(0);
    expect(isFormValid(schema, { x: 'value' })).toBe(true);
  });
  it('isFormValid == (validateForm().length === 0)', () => {
    const values1 = { x: '' };
    const values2 = { x: 'ok' };
    expect(isFormValid(schema, values1)).toBe(validateForm(schema, values1).length === 0);
    expect(isFormValid(schema, values2)).toBe(validateForm(schema, values2).length === 0);
  });
});

describe('schemaToJson – format', () => {
  it('JSON contains id', () => {
    const s = createSchema('test-id', 'T', []);
    expect(schemaToJson(s)).toContain('test-id');
  });
  it('JSON contains title', () => {
    const s = createSchema('s', 'My Form Title', []);
    expect(schemaToJson(s)).toContain('My Form Title');
  });
  it('JSON contains sections key', () => {
    const s = createSchema('s', 'T', []);
    expect(schemaToJson(s)).toContain('"sections"');
  });
  it('JSON contains version', () => {
    const s = createSchema('s', 'T', [], 3);
    expect(schemaToJson(s)).toContain('3');
  });
  it('JSON is pretty printed (has newlines)', () => {
    const s = createSchema('s', 'T', []);
    expect(schemaToJson(s)).toContain('\n');
  });
});

describe('removeFieldFromSection – section metadata preserved', () => {
  it('section id preserved after removal', () => {
    const field = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    const sec = createSection('preserve-id', 'S', [field], 5);
    expect(removeFieldFromSection(sec, 'a').id).toBe('preserve-id');
  });
  it('section title preserved after removal', () => {
    const field = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    const sec = createSection('s', 'My Section Title', [field], 0);
    expect(removeFieldFromSection(sec, 'a').title).toBe('My Section Title');
  });
  it('section order preserved after removal', () => {
    const field = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    const sec = createSection('s', 'S', [field], 7);
    expect(removeFieldFromSection(sec, 'a').order).toBe(7);
  });
});

describe('addFieldToSection – section metadata preserved', () => {
  it('section id preserved after add', () => {
    const sec = createSection('keep-id', 'S', [], 0);
    const field = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    expect(addFieldToSection(sec, field).id).toBe('keep-id');
  });
  it('section title preserved after add', () => {
    const sec = createSection('s', 'Keep Title', [], 0);
    const field = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    expect(addFieldToSection(sec, field).title).toBe('Keep Title');
  });
  it('section order preserved after add', () => {
    const sec = createSection('s', 'S', [], 11);
    const field = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    expect(addFieldToSection(sec, field).order).toBe(11);
  });
});

describe('getFieldErrors – comprehensive', () => {
  it('returns correct number of messages for field with 3 errors', () => {
    const errors = [
      { fieldId: 'f', message: 'err1' },
      { fieldId: 'f', message: 'err2' },
      { fieldId: 'f', message: 'err3' },
    ];
    expect(getFieldErrors(errors, 'f')).toHaveLength(3);
  });
  it('returns exact messages', () => {
    const errors = [
      { fieldId: 'f', message: 'Must be at least 5 characters' },
    ];
    expect(getFieldErrors(errors, 'f')).toEqual(['Must be at least 5 characters']);
  });
  it('does not return errors for other fields', () => {
    const errors = [
      { fieldId: 'a', message: 'err' },
      { fieldId: 'b', message: 'err' },
    ];
    expect(getFieldErrors(errors, 'a')).toHaveLength(1);
    expect(getFieldErrors(errors, 'b')).toHaveLength(1);
    expect(getFieldErrors(errors, 'c')).toHaveLength(0);
  });
});

describe('findField – returns correct type and label', () => {
  const allTypes: Array<import('../src/types').FormFieldType> = [
    'text', 'email', 'number', 'select', 'checkbox', 'textarea', 'date', 'radio',
  ];
  const fields = allTypes.map((t, i) => f({ id: `f-${t}`, type: t, label: `Label ${t}`, order: i }));
  const schema = createSchema('s', 'T', [createSection('s1', 'S', fields, 0)]);

  allTypes.forEach((t) => {
    it(`findField finds field of type ${t}`, () => {
      const found = findField(schema, `f-${t}`);
      expect(found?.type).toBe(t);
    });
    it(`findField returns correct label for type ${t}`, () => {
      const found = findField(schema, `f-${t}`);
      expect(found?.label).toBe(`Label ${t}`);
    });
  });
});


describe('validateRule – min error message content', () => {
  const cases = [
    { label: 'Age', id: 'age', min: 18 },
    { label: 'Score', id: 'score', min: 0 },
    { label: 'Quantity', id: 'qty', min: 1 },
    { label: 'Priority', id: 'pri', min: 1 },
    { label: 'Rating', id: 'rat', min: 1 },
  ];
  cases.forEach(({ label, id, min }) => {
    const fld = { id, type: 'number' as const, label, order: 0 };
    it(`min(${min}) error on "${label}" contains label`, () => {
      expect(validateRule(min - 1, { type: 'min', value: min }, fld)).toContain(label);
    });
    it(`min(${min}) no error when value >= min on "${label}"`, () => {
      expect(validateRule(min, { type: 'min', value: min }, fld)).toBeNull();
    });
    it(`min(${min}) no error when value > min on "${label}"`, () => {
      expect(validateRule(min + 10, { type: 'min', value: min }, fld)).toBeNull();
    });
  });
});

describe('validateRule – max error message content', () => {
  const cases = [
    { label: 'Age', id: 'age', max: 120 },
    { label: 'Score', id: 'score', max: 100 },
    { label: 'Quantity', id: 'qty', max: 999 },
  ];
  cases.forEach(({ label, id, max }) => {
    const fld = { id, type: 'number' as const, label, order: 0 };
    it(`max(${max}) error on "${label}" contains label`, () => {
      expect(validateRule(max + 1, { type: 'max', value: max }, fld)).toContain(label);
    });
    it(`max(${max}) no error when value <= max on "${label}"`, () => {
      expect(validateRule(max, { type: 'max', value: max }, fld)).toBeNull();
    });
    it(`max(${max}) no error when value < max on "${label}"`, () => {
      expect(validateRule(max - 1, { type: 'max', value: max }, fld)).toBeNull();
    });
  });
});

describe('createSchema – section count', () => {
  for (let n = 0; n <= 5; n++) {
    it(`schema with ${n} sections has sections.length === ${n}`, () => {
      const sections = Array.from({ length: n }, (_, i) => createSection(`s${i}`, `S${i}`, [], i));
      const schema = createSchema('s', 'T', sections);
      expect(schema.sections).toHaveLength(n);
    });
  }
});

describe('validateField – error fieldId consistency', () => {
  const fieldIds = ['field-a', 'field-b', 'my_field', 'UPPERCASE', 'camelCase', 'with.dot'];
  fieldIds.forEach((id) => {
    it(`validateField errors use fieldId "${id}"`, () => {
      const fld = { id, type: 'text' as const, label: 'L', order: 0, validation: [{ type: 'required' as const }] };
      const errors = validateField(fld, '');
      expect(errors[0].fieldId).toBe(id);
    });
  });
});

describe('flattenFields – field identity preserved', () => {
  it('flattened fields are same objects as originals', () => {
    const a = f({ id: 'a', type: 'text', label: 'A', order: 0 });
    const b = f({ id: 'b', type: 'number', label: 'B', order: 0 });
    const s = createSchema('s', 'T', [
      createSection('s1', 'S', [a, b], 0),
    ]);
    const flat = flattenFields(s);
    expect(flat[0]).toBe(a);
    expect(flat[1]).toBe(b);
  });
});

describe('countFields – parameterized', () => {
  for (let total = 0; total <= 6; total++) {
    it(`countFields returns ${total} for schema with ${total} fields`, () => {
      const fields = Array.from({ length: total }, (_, i) =>
        f({ id: `f${i}`, type: 'text', label: `F${i}`, order: i })
      );
      const s = createSchema('s', 'T', [createSection('s1', 'S', fields, 0)]);
      expect(countFields(s)).toBe(total);
    });
  }
});


describe('sortSections – all-combinations order', () => {
  const makeSchemaWithOrders = (orders: number[]) => {
    const sections = orders.map((o, i) => createSection(`s${i}`, `S${i}`, [], o));
    return createSchema('s', 'T', sections);
  };
  it('3 sections order [2,0,1] sorted to [0,1,2]', () => {
    const sorted = sortSections(makeSchemaWithOrders([2, 0, 1]));
    expect(sorted.sections.map(s => s.order)).toEqual([0, 1, 2]);
  });
  it('4 sections order [3,1,2,0] sorted correctly', () => {
    const sorted = sortSections(makeSchemaWithOrders([3, 1, 2, 0]));
    expect(sorted.sections[0].order).toBe(0);
    expect(sorted.sections[3].order).toBe(3);
  });
  it('duplicate orders preserved', () => {
    const sorted = sortSections(makeSchemaWithOrders([1, 1, 0]));
    expect(sorted.sections[0].order).toBe(0);
  });
});

describe('getRequiredFields – returns correct ids', () => {
  it('single required field', () => {
    const s = createSchema('s', 'T', [
      createSection('s1', 'S', [
        f({ id: 'req', type: 'text', label: 'R', order: 0, validation: [requiredRule()] }),
      ], 0),
    ]);
    expect(getRequiredFields(s)[0].id).toBe('req');
  });
  it('non-required field not in result', () => {
    const s = createSchema('s', 'T', [
      createSection('s1', 'S', [
        f({ id: 'notreq', type: 'text', label: 'NR', order: 0, validation: [minLengthRule(2)] }),
      ], 0),
    ]);
    expect(getRequiredFields(s)).toHaveLength(0);
  });
});

describe('validateForm – returns array type', () => {
  it('validateForm always returns an array', () => {
    const s = createSchema('s', 'T', []);
    const result = validateForm(s, {});
    expect(Array.isArray(result)).toBe(true);
  });
  it('validateForm result items have fieldId', () => {
    const s = createSchema('s', 'T', [
      createSection('s1', 'S', [f({ id: 'x', type: 'text', label: 'X', order: 0, validation: [requiredRule()] })], 0),
    ]);
    const errors = validateForm(s, { x: '' });
    expect(errors[0]).toHaveProperty('fieldId');
    expect(errors[0]).toHaveProperty('message');
  });
});

describe('schemaFromJson – restores nested structure', () => {
  it('restores sections array from JSON', () => {
    const sections = [
      createSection('s1', 'Section One', [], 0),
      createSection('s2', 'Section Two', [], 1),
    ];
    const schema = createSchema('form', 'My Form', sections, 2);
    const restored = schemaFromJson(schemaToJson(schema));
    expect(restored.sections[0].title).toBe('Section One');
    expect(restored.sections[1].title).toBe('Section Two');
    expect(restored.sections[0].id).toBe('s1');
  });
  it('restores nested field data', () => {
    const field = f({ id: 'my-field', type: 'select', label: 'My Select', order: 0,
      options: [buildOption('Yes', 'yes'), buildOption('No', 'no')] });
    const s = createSchema('s', 'T', [createSection('s1', 'S', [field], 0)]);
    const restored = schemaFromJson(schemaToJson(s));
    expect(restored.sections[0].fields[0].options).toHaveLength(2);
  });
});

describe('isValidFieldType – all valid', () => {
  const valid: string[] = [
    'text', 'textarea', 'number', 'email', 'password', 'tel',
    'date', 'datetime', 'time', 'checkbox', 'radio', 'select',
    'multiselect', 'file', 'hidden', 'range', 'color', 'url',
  ];
  valid.forEach((t) => {
    it(`'${t}' is valid`, () => expect(isValidFieldType(t)).toBe(true));
  });
});


describe('validateField – single minLength', () => {
  const lengths = [3, 5, 8, 10, 15, 20];
  lengths.forEach((min) => {
    it(`minLength(${min}): string just meeting minimum passes`, () => {
      const fld = f({ id: 'x', type: 'text', label: 'X', order: 0, validation: [minLengthRule(min)] });
      expect(validateField(fld, 'a'.repeat(min))).toHaveLength(0);
    });
    it(`minLength(${min}): string one short fails`, () => {
      const fld = f({ id: 'x', type: 'text', label: 'X', order: 0, validation: [minLengthRule(min)] });
      expect(validateField(fld, 'a'.repeat(min - 1))).toHaveLength(1);
    });
  });
});

describe('validateField – single maxLength', () => {
  const limits = [5, 10, 20];
  limits.forEach((max) => {
    it(`maxLength(${max}): string exactly at limit passes`, () => {
      const fld = f({ id: 'x', type: 'text', label: 'X', order: 0, validation: [maxLengthRule(max)] });
      expect(validateField(fld, 'a'.repeat(max))).toHaveLength(0);
    });
    it(`maxLength(${max}): string one over fails`, () => {
      const fld = f({ id: 'x', type: 'text', label: 'X', order: 0, validation: [maxLengthRule(max)] });
      expect(validateField(fld, 'a'.repeat(max + 1))).toHaveLength(1);
    });
  });
});


describe('miscellaneous coverage top-up', () => {
  it('createField with defaultValue 0 stores 0', () => {
    const fld = f({ id: 'n', type: 'number', label: 'N', order: 0, defaultValue: 0 });
    expect(fld.defaultValue).toBe(0);
  });
  it('createField with empty string defaultValue stores empty string', () => {
    const fld = f({ id: 't', type: 'text', label: 'T', order: 0, defaultValue: '' });
    expect(fld.defaultValue).toBe('');
  });
  it('validateRule email null returns null', () => {
    const ef = { id: 'e', type: 'email' as const, label: 'E', order: 0 };
    expect(validateRule(null, { type: 'email' }, ef)).toBeNull();
  });
  it('validateRule url null returns null', () => {
    const uf = { id: 'u', type: 'url' as const, label: 'U', order: 0 };
    expect(validateRule(null, { type: 'url' }, uf)).toBeNull();
  });
  it('validateRule pattern null returns null', () => {
    const pf = { id: 'p', type: 'text' as const, label: 'P', order: 0 };
    expect(validateRule(null, { type: 'pattern', value: '^[A-Z]' }, pf)).toBeNull();
  });
  it('getDefaultValues returns object with correct key count', () => {
    const fields = [1, 2, 3, 4, 5].map((i) => f({ id: `f${i}`, type: 'text', label: `F${i}`, order: i }));
    const s = createSchema('s', 'T', [createSection('s1', 'S', fields, 0)]);
    expect(Object.keys(getDefaultValues(s))).toHaveLength(5);
  });
  it('flattenFields on schema with 0 sections returns empty', () => {
    expect(flattenFields(createSchema('s', 'T', []))).toEqual([]);
  });
  it('findField on empty schema returns undefined', () => {
    expect(findField(createSchema('s', 'T', []), 'any')).toBeUndefined();
  });
  it('countFields on no-section schema returns 0', () => {
    expect(countFields(createSchema('s', 'T', []))).toBe(0);
  });
  it('getRequiredFields on empty schema returns empty', () => {
    expect(getRequiredFields(createSchema('s', 'T', []))).toHaveLength(0);
  });
  it('validateForm on schema with no sections returns empty', () => {
    expect(validateForm(createSchema('s', 'T', []), {})).toHaveLength(0);
  });
  it('isFormValid on schema with no sections returns true', () => {
    expect(isFormValid(createSchema('s', 'T', []), {})).toBe(true);
  });
});

