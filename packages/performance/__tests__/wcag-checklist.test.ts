import { WCAG_22_AA_CHECKLIST, WcagCriterion } from '../src/accessibility/wcag-checklist';

describe('WCAG 2.2 AA Checklist', () => {
  it('should contain at least 50 criteria', () => {
    expect(WCAG_22_AA_CHECKLIST.length).toBeGreaterThanOrEqual(50);
  });

  it('should include both Level A and Level AA criteria', () => {
    const levelA = WCAG_22_AA_CHECKLIST.filter((c) => c.level === 'A');
    const levelAA = WCAG_22_AA_CHECKLIST.filter((c) => c.level === 'AA');

    expect(levelA.length).toBeGreaterThan(0);
    expect(levelAA.length).toBeGreaterThan(0);
  });

  it('should have no duplicate IDs', () => {
    const ids = WCAG_22_AA_CHECKLIST.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should cover all 4 WCAG principles', () => {
    const principles = new Set(WCAG_22_AA_CHECKLIST.map((c) => c.id.split('.')[0]));

    expect(principles.has('1')).toBe(true); // Perceivable
    expect(principles.has('2')).toBe(true); // Operable
    expect(principles.has('3')).toBe(true); // Understandable
    expect(principles.has('4')).toBe(true); // Robust
  });

  it('should have both automated and manual criteria', () => {
    const automated = WCAG_22_AA_CHECKLIST.filter((c) => c.automated);
    const manual = WCAG_22_AA_CHECKLIST.filter((c) => !c.automated);

    expect(automated.length).toBeGreaterThan(0);
    expect(manual.length).toBeGreaterThan(0);
  });

  it('should have required fields for every criterion', () => {
    for (const criterion of WCAG_22_AA_CHECKLIST) {
      expect(criterion.id).toBeTruthy();
      expect(criterion.level).toBeTruthy();
      expect(criterion.name).toBeTruthy();
      expect(criterion.description).toBeTruthy();
      expect(typeof criterion.automated).toBe('boolean');
    }
  });

  it('should have valid level values (A or AA only)', () => {
    for (const criterion of WCAG_22_AA_CHECKLIST) {
      expect(['A', 'AA']).toContain(criterion.level);
    }
  });

  it('should have valid ID format (X.Y.Z)', () => {
    const idPattern = /^\d+\.\d+\.\d+$/;
    for (const criterion of WCAG_22_AA_CHECKLIST) {
      expect(criterion.id).toMatch(idPattern);
    }
  });

  it('should include WCAG 2.2 specific criteria', () => {
    const ids = WCAG_22_AA_CHECKLIST.map((c) => c.id);

    // WCAG 2.2 new criteria
    expect(ids).toContain('2.4.11'); // Focus Not Obscured
    expect(ids).toContain('2.5.7'); // Dragging Movements
    expect(ids).toContain('2.5.8'); // Target Size (Minimum)
    expect(ids).toContain('3.2.6'); // Consistent Help
    expect(ids).toContain('3.3.7'); // Redundant Entry
    expect(ids).toContain('3.3.8'); // Accessible Authentication
  });

  it('should have descriptions of reasonable length', () => {
    for (const criterion of WCAG_22_AA_CHECKLIST) {
      expect(criterion.description.length).toBeGreaterThan(20);
      expect(criterion.description.length).toBeLessThan(500);
      expect(criterion.name.length).toBeGreaterThan(3);
      expect(criterion.name.length).toBeLessThan(100);
    }
  });
});
