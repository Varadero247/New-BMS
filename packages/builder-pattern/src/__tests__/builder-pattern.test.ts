// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  createBuilder,
  createUrlBuilder,
  createQueryBuilder,
  createElementBuilder,
} from '../builder-pattern';

// ─── Section 1: createBuilder set/build ────────────────────────────────────
describe('createBuilder — set and build', () => {
  it('set string field builds correctly #1', () => {
    const b = createBuilder<{ name: string }>();
    const result = b.set('name', "Alice").build();
    expect(result.name).toBe('Alice');
  });

  it('set number field builds correctly #2', () => {
    const b = createBuilder<{ age: number }>();
    const result = b.set('age', 30).build();
    expect(result.age).toBe(30);
  });

  it('set boolean field builds correctly #3', () => {
    const b = createBuilder<{ active: boolean }>();
    const result = b.set('active', true).build();
    expect(result.active).toBe(true);
  });

  it('set zero field builds correctly #4', () => {
    const b = createBuilder<{ count: number }>();
    const result = b.set('count', 0).build();
    expect(result.count).toBe(0);
  });

  it('set negative field builds correctly #5', () => {
    const b = createBuilder<{ score: number }>();
    const result = b.set('score', -5).build();
    expect(result.score).toBe(-5);
  });

  it('set float field builds correctly #6', () => {
    const b = createBuilder<{ ratio: number }>();
    const result = b.set('ratio', 3.14).build();
    expect(result.ratio).toBe(3.14);
  });

  it('set empty string field builds correctly #7', () => {
    const b = createBuilder<{ label: string }>();
    const result = b.set('label', "").build();
    expect(result.label).toBe("");
  });

  it('set large number field builds correctly #8', () => {
    const b = createBuilder<{ big: number }>();
    const result = b.set('big', 999999).build();
    expect(result.big).toBe(999999);
  });

  it('set false boolean field builds correctly #9', () => {
    const b = createBuilder<{ flag: boolean }>();
    const result = b.set('flag', false).build();
    expect(result.flag).toBe(false);
  });

  it('set one field builds correctly #10', () => {
    const b = createBuilder<{ num: number }>();
    const result = b.set('num', 1).build();
    expect(result.num).toBe(1);
  });

  it('build user object rep=0 #11', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=1 #12', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=2 #13', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=3 #14', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=4 #15', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=5 #16', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=6 #17', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=7 #18', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=8 #19', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=9 #20', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=10 #21', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=11 #22', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=12 #23', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=13 #24', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=14 #25', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=15 #26', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=16 #27', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=17 #28', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=18 #29', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=19 #30', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=20 #31', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=21 #32', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=22 #33', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=23 #34', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=24 #35', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=25 #36', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=26 #37', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=27 #38', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=28 #39', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=29 #40', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=30 #41', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=31 #42', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=32 #43', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=33 #44', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=34 #45', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=35 #46', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=36 #47', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build user object rep=37 #48', () => {
    const b = createBuilder<{ name: string; age: number }>();
    b.set('name', "Bob");
    b.set('age', 25);
    const result = b.build();
    expect(result.name).toBe("Bob");
    expect(result.age).toBe(25);
  });

  it('build product object rep=0 #49', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=1 #50', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=2 #51', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=3 #52', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=4 #53', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=5 #54', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=6 #55', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=7 #56', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=8 #57', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=9 #58', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=10 #59', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=11 #60', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=12 #61', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=13 #62', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=14 #63', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=15 #64', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=16 #65', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=17 #66', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=18 #67', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=19 #68', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=20 #69', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=21 #70', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=22 #71', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=23 #72', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=24 #73', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=25 #74', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=26 #75', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=27 #76', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=28 #77', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=29 #78', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=30 #79', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=31 #80', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=32 #81', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=33 #82', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=34 #83', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=35 #84', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=36 #85', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build product object rep=37 #86', () => {
    const b = createBuilder<{ id: number; title: string }>();
    b.set('id', 1);
    b.set('title', "Widget");
    const result = b.build();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Widget");
  });

  it('build order object rep=0 #87', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=1 #88', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=2 #89', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=3 #90', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=4 #91', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=5 #92', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=6 #93', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=7 #94', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=8 #95', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=9 #96', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=10 #97', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=11 #98', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=12 #99', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=13 #100', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=14 #101', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=15 #102', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=16 #103', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=17 #104', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=18 #105', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=19 #106', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=20 #107', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=21 #108', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=22 #109', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=23 #110', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=24 #111', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=25 #112', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=26 #113', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=27 #114', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=28 #115', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=29 #116', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=30 #117', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=31 #118', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=32 #119', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=33 #120', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=34 #121', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=35 #122', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=36 #123', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build order object rep=37 #124', () => {
    const b = createBuilder<{ ref: string; total: number }>();
    b.set('ref', "ORD-001");
    b.set('total', 99.5);
    const result = b.build();
    expect(result.ref).toBe("ORD-001");
    expect(result.total).toBe(99.5);
  });

  it('build address object rep=0 #125', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=1 #126', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=2 #127', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=3 #128', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=4 #129', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=5 #130', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=6 #131', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=7 #132', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=8 #133', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=9 #134', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=10 #135', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=11 #136', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=12 #137', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=13 #138', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=14 #139', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=15 #140', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=16 #141', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=17 #142', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=18 #143', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=19 #144', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=20 #145', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=21 #146', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=22 #147', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=23 #148', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=24 #149', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=25 #150', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=26 #151', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=27 #152', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=28 #153', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=29 #154', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=30 #155', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=31 #156', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=32 #157', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=33 #158', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=34 #159', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=35 #160', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=36 #161', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build address object rep=37 #162', () => {
    const b = createBuilder<{ street: string; zip: string }>();
    b.set('street', "Main St");
    b.set('zip', "12345");
    const result = b.build();
    expect(result.street).toBe("Main St");
    expect(result.zip).toBe("12345");
  });

  it('build config object rep=0 #163', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=1 #164', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=2 #165', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=3 #166', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=4 #167', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=5 #168', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=6 #169', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=7 #170', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=8 #171', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=9 #172', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=10 #173', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=11 #174', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=12 #175', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=13 #176', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=14 #177', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=15 #178', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=16 #179', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=17 #180', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=18 #181', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=19 #182', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=20 #183', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=21 #184', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=22 #185', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=23 #186', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=24 #187', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=25 #188', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=26 #189', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=27 #190', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=28 #191', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=29 #192', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=30 #193', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=31 #194', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=32 #195', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=33 #196', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=34 #197', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=35 #198', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=36 #199', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

  it('build config object rep=37 #200', () => {
    const b = createBuilder<{ debug: boolean; retries: number }>();
    b.set('debug', true);
    b.set('retries', 3);
    const result = b.build();
    expect(result.debug).toBe(true);
    expect(result.retries).toBe(3);
  });

});

// ─── Section 2: setMany / clone / reset / hasField / getField ───────────────
describe('createBuilder — setMany, clone, reset, hasField, getField', () => {
  it('setMany sets multiple fields at once #1', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 1, y: 2, z: 3 });
    const r = b.build();
    expect(r.x).toBe(1);
    expect(r.y).toBe(2);
    expect(r.z).toBe(3);
  });

  it('setMany sets multiple fields at once #2', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 2, y: 4, z: 6 });
    const r = b.build();
    expect(r.x).toBe(2);
    expect(r.y).toBe(4);
    expect(r.z).toBe(6);
  });

  it('setMany sets multiple fields at once #3', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 3, y: 6, z: 9 });
    const r = b.build();
    expect(r.x).toBe(3);
    expect(r.y).toBe(6);
    expect(r.z).toBe(9);
  });

  it('setMany sets multiple fields at once #4', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 4, y: 8, z: 12 });
    const r = b.build();
    expect(r.x).toBe(4);
    expect(r.y).toBe(8);
    expect(r.z).toBe(12);
  });

  it('setMany sets multiple fields at once #5', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 5, y: 10, z: 15 });
    const r = b.build();
    expect(r.x).toBe(5);
    expect(r.y).toBe(10);
    expect(r.z).toBe(15);
  });

  it('setMany sets multiple fields at once #6', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 6, y: 12, z: 18 });
    const r = b.build();
    expect(r.x).toBe(6);
    expect(r.y).toBe(12);
    expect(r.z).toBe(18);
  });

  it('setMany sets multiple fields at once #7', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 7, y: 14, z: 21 });
    const r = b.build();
    expect(r.x).toBe(7);
    expect(r.y).toBe(14);
    expect(r.z).toBe(21);
  });

  it('setMany sets multiple fields at once #8', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 8, y: 16, z: 24 });
    const r = b.build();
    expect(r.x).toBe(8);
    expect(r.y).toBe(16);
    expect(r.z).toBe(24);
  });

  it('setMany sets multiple fields at once #9', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 9, y: 18, z: 27 });
    const r = b.build();
    expect(r.x).toBe(9);
    expect(r.y).toBe(18);
    expect(r.z).toBe(27);
  });

  it('setMany sets multiple fields at once #10', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 10, y: 20, z: 30 });
    const r = b.build();
    expect(r.x).toBe(10);
    expect(r.y).toBe(20);
    expect(r.z).toBe(30);
  });

  it('setMany sets multiple fields at once #11', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 11, y: 22, z: 33 });
    const r = b.build();
    expect(r.x).toBe(11);
    expect(r.y).toBe(22);
    expect(r.z).toBe(33);
  });

  it('setMany sets multiple fields at once #12', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 12, y: 24, z: 36 });
    const r = b.build();
    expect(r.x).toBe(12);
    expect(r.y).toBe(24);
    expect(r.z).toBe(36);
  });

  it('setMany sets multiple fields at once #13', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 13, y: 26, z: 39 });
    const r = b.build();
    expect(r.x).toBe(13);
    expect(r.y).toBe(26);
    expect(r.z).toBe(39);
  });

  it('setMany sets multiple fields at once #14', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 14, y: 28, z: 42 });
    const r = b.build();
    expect(r.x).toBe(14);
    expect(r.y).toBe(28);
    expect(r.z).toBe(42);
  });

  it('setMany sets multiple fields at once #15', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 15, y: 30, z: 45 });
    const r = b.build();
    expect(r.x).toBe(15);
    expect(r.y).toBe(30);
    expect(r.z).toBe(45);
  });

  it('setMany sets multiple fields at once #16', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 16, y: 32, z: 48 });
    const r = b.build();
    expect(r.x).toBe(16);
    expect(r.y).toBe(32);
    expect(r.z).toBe(48);
  });

  it('setMany sets multiple fields at once #17', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 17, y: 34, z: 51 });
    const r = b.build();
    expect(r.x).toBe(17);
    expect(r.y).toBe(34);
    expect(r.z).toBe(51);
  });

  it('setMany sets multiple fields at once #18', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 18, y: 36, z: 54 });
    const r = b.build();
    expect(r.x).toBe(18);
    expect(r.y).toBe(36);
    expect(r.z).toBe(54);
  });

  it('setMany sets multiple fields at once #19', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 19, y: 38, z: 57 });
    const r = b.build();
    expect(r.x).toBe(19);
    expect(r.y).toBe(38);
    expect(r.z).toBe(57);
  });

  it('setMany sets multiple fields at once #20', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 20, y: 40, z: 60 });
    const r = b.build();
    expect(r.x).toBe(20);
    expect(r.y).toBe(40);
    expect(r.z).toBe(60);
  });

  it('setMany sets multiple fields at once #21', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 21, y: 42, z: 63 });
    const r = b.build();
    expect(r.x).toBe(21);
    expect(r.y).toBe(42);
    expect(r.z).toBe(63);
  });

  it('setMany sets multiple fields at once #22', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 22, y: 44, z: 66 });
    const r = b.build();
    expect(r.x).toBe(22);
    expect(r.y).toBe(44);
    expect(r.z).toBe(66);
  });

  it('setMany sets multiple fields at once #23', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 23, y: 46, z: 69 });
    const r = b.build();
    expect(r.x).toBe(23);
    expect(r.y).toBe(46);
    expect(r.z).toBe(69);
  });

  it('setMany sets multiple fields at once #24', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 24, y: 48, z: 72 });
    const r = b.build();
    expect(r.x).toBe(24);
    expect(r.y).toBe(48);
    expect(r.z).toBe(72);
  });

  it('setMany sets multiple fields at once #25', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 25, y: 50, z: 75 });
    const r = b.build();
    expect(r.x).toBe(25);
    expect(r.y).toBe(50);
    expect(r.z).toBe(75);
  });

  it('setMany sets multiple fields at once #26', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 26, y: 52, z: 78 });
    const r = b.build();
    expect(r.x).toBe(26);
    expect(r.y).toBe(52);
    expect(r.z).toBe(78);
  });

  it('setMany sets multiple fields at once #27', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 27, y: 54, z: 81 });
    const r = b.build();
    expect(r.x).toBe(27);
    expect(r.y).toBe(54);
    expect(r.z).toBe(81);
  });

  it('setMany sets multiple fields at once #28', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 28, y: 56, z: 84 });
    const r = b.build();
    expect(r.x).toBe(28);
    expect(r.y).toBe(56);
    expect(r.z).toBe(84);
  });

  it('setMany sets multiple fields at once #29', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 29, y: 58, z: 87 });
    const r = b.build();
    expect(r.x).toBe(29);
    expect(r.y).toBe(58);
    expect(r.z).toBe(87);
  });

  it('setMany sets multiple fields at once #30', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 30, y: 60, z: 90 });
    const r = b.build();
    expect(r.x).toBe(30);
    expect(r.y).toBe(60);
    expect(r.z).toBe(90);
  });

  it('setMany sets multiple fields at once #31', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 31, y: 62, z: 93 });
    const r = b.build();
    expect(r.x).toBe(31);
    expect(r.y).toBe(62);
    expect(r.z).toBe(93);
  });

  it('setMany sets multiple fields at once #32', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 32, y: 64, z: 96 });
    const r = b.build();
    expect(r.x).toBe(32);
    expect(r.y).toBe(64);
    expect(r.z).toBe(96);
  });

  it('setMany sets multiple fields at once #33', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 33, y: 66, z: 99 });
    const r = b.build();
    expect(r.x).toBe(33);
    expect(r.y).toBe(66);
    expect(r.z).toBe(99);
  });

  it('setMany sets multiple fields at once #34', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 34, y: 68, z: 102 });
    const r = b.build();
    expect(r.x).toBe(34);
    expect(r.y).toBe(68);
    expect(r.z).toBe(102);
  });

  it('setMany sets multiple fields at once #35', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 35, y: 70, z: 105 });
    const r = b.build();
    expect(r.x).toBe(35);
    expect(r.y).toBe(70);
    expect(r.z).toBe(105);
  });

  it('setMany sets multiple fields at once #36', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 36, y: 72, z: 108 });
    const r = b.build();
    expect(r.x).toBe(36);
    expect(r.y).toBe(72);
    expect(r.z).toBe(108);
  });

  it('setMany sets multiple fields at once #37', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 37, y: 74, z: 111 });
    const r = b.build();
    expect(r.x).toBe(37);
    expect(r.y).toBe(74);
    expect(r.z).toBe(111);
  });

  it('setMany sets multiple fields at once #38', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 38, y: 76, z: 114 });
    const r = b.build();
    expect(r.x).toBe(38);
    expect(r.y).toBe(76);
    expect(r.z).toBe(114);
  });

  it('setMany sets multiple fields at once #39', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 39, y: 78, z: 117 });
    const r = b.build();
    expect(r.x).toBe(39);
    expect(r.y).toBe(78);
    expect(r.z).toBe(117);
  });

  it('setMany sets multiple fields at once #40', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 40, y: 80, z: 120 });
    const r = b.build();
    expect(r.x).toBe(40);
    expect(r.y).toBe(80);
    expect(r.z).toBe(120);
  });

  it('setMany sets multiple fields at once #41', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 41, y: 82, z: 123 });
    const r = b.build();
    expect(r.x).toBe(41);
    expect(r.y).toBe(82);
    expect(r.z).toBe(123);
  });

  it('setMany sets multiple fields at once #42', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 42, y: 84, z: 126 });
    const r = b.build();
    expect(r.x).toBe(42);
    expect(r.y).toBe(84);
    expect(r.z).toBe(126);
  });

  it('setMany sets multiple fields at once #43', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 43, y: 86, z: 129 });
    const r = b.build();
    expect(r.x).toBe(43);
    expect(r.y).toBe(86);
    expect(r.z).toBe(129);
  });

  it('setMany sets multiple fields at once #44', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 44, y: 88, z: 132 });
    const r = b.build();
    expect(r.x).toBe(44);
    expect(r.y).toBe(88);
    expect(r.z).toBe(132);
  });

  it('setMany sets multiple fields at once #45', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 45, y: 90, z: 135 });
    const r = b.build();
    expect(r.x).toBe(45);
    expect(r.y).toBe(90);
    expect(r.z).toBe(135);
  });

  it('setMany sets multiple fields at once #46', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 46, y: 92, z: 138 });
    const r = b.build();
    expect(r.x).toBe(46);
    expect(r.y).toBe(92);
    expect(r.z).toBe(138);
  });

  it('setMany sets multiple fields at once #47', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 47, y: 94, z: 141 });
    const r = b.build();
    expect(r.x).toBe(47);
    expect(r.y).toBe(94);
    expect(r.z).toBe(141);
  });

  it('setMany sets multiple fields at once #48', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 48, y: 96, z: 144 });
    const r = b.build();
    expect(r.x).toBe(48);
    expect(r.y).toBe(96);
    expect(r.z).toBe(144);
  });

  it('setMany sets multiple fields at once #49', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 49, y: 98, z: 147 });
    const r = b.build();
    expect(r.x).toBe(49);
    expect(r.y).toBe(98);
    expect(r.z).toBe(147);
  });

  it('setMany sets multiple fields at once #50', () => {
    const b = createBuilder<{ x: number; y: number; z: number }>();
    b.setMany({ x: 50, y: 100, z: 150 });
    const r = b.build();
    expect(r.x).toBe(50);
    expect(r.y).toBe(100);
    expect(r.z).toBe(150);
  });

  it('clone produces independent builder #1', () => {
    const b = createBuilder<{ v: number }>({ v: 1 });
    const c = b.clone();
    c.set('v', 101);
    expect(b.build().v).toBe(1);
    expect(c.build().v).toBe(101);
  });

  it('clone produces independent builder #2', () => {
    const b = createBuilder<{ v: number }>({ v: 2 });
    const c = b.clone();
    c.set('v', 102);
    expect(b.build().v).toBe(2);
    expect(c.build().v).toBe(102);
  });

  it('clone produces independent builder #3', () => {
    const b = createBuilder<{ v: number }>({ v: 3 });
    const c = b.clone();
    c.set('v', 103);
    expect(b.build().v).toBe(3);
    expect(c.build().v).toBe(103);
  });

  it('clone produces independent builder #4', () => {
    const b = createBuilder<{ v: number }>({ v: 4 });
    const c = b.clone();
    c.set('v', 104);
    expect(b.build().v).toBe(4);
    expect(c.build().v).toBe(104);
  });

  it('clone produces independent builder #5', () => {
    const b = createBuilder<{ v: number }>({ v: 5 });
    const c = b.clone();
    c.set('v', 105);
    expect(b.build().v).toBe(5);
    expect(c.build().v).toBe(105);
  });

  it('clone produces independent builder #6', () => {
    const b = createBuilder<{ v: number }>({ v: 6 });
    const c = b.clone();
    c.set('v', 106);
    expect(b.build().v).toBe(6);
    expect(c.build().v).toBe(106);
  });

  it('clone produces independent builder #7', () => {
    const b = createBuilder<{ v: number }>({ v: 7 });
    const c = b.clone();
    c.set('v', 107);
    expect(b.build().v).toBe(7);
    expect(c.build().v).toBe(107);
  });

  it('clone produces independent builder #8', () => {
    const b = createBuilder<{ v: number }>({ v: 8 });
    const c = b.clone();
    c.set('v', 108);
    expect(b.build().v).toBe(8);
    expect(c.build().v).toBe(108);
  });

  it('clone produces independent builder #9', () => {
    const b = createBuilder<{ v: number }>({ v: 9 });
    const c = b.clone();
    c.set('v', 109);
    expect(b.build().v).toBe(9);
    expect(c.build().v).toBe(109);
  });

  it('clone produces independent builder #10', () => {
    const b = createBuilder<{ v: number }>({ v: 10 });
    const c = b.clone();
    c.set('v', 110);
    expect(b.build().v).toBe(10);
    expect(c.build().v).toBe(110);
  });

  it('clone produces independent builder #11', () => {
    const b = createBuilder<{ v: number }>({ v: 11 });
    const c = b.clone();
    c.set('v', 111);
    expect(b.build().v).toBe(11);
    expect(c.build().v).toBe(111);
  });

  it('clone produces independent builder #12', () => {
    const b = createBuilder<{ v: number }>({ v: 12 });
    const c = b.clone();
    c.set('v', 112);
    expect(b.build().v).toBe(12);
    expect(c.build().v).toBe(112);
  });

  it('clone produces independent builder #13', () => {
    const b = createBuilder<{ v: number }>({ v: 13 });
    const c = b.clone();
    c.set('v', 113);
    expect(b.build().v).toBe(13);
    expect(c.build().v).toBe(113);
  });

  it('clone produces independent builder #14', () => {
    const b = createBuilder<{ v: number }>({ v: 14 });
    const c = b.clone();
    c.set('v', 114);
    expect(b.build().v).toBe(14);
    expect(c.build().v).toBe(114);
  });

  it('clone produces independent builder #15', () => {
    const b = createBuilder<{ v: number }>({ v: 15 });
    const c = b.clone();
    c.set('v', 115);
    expect(b.build().v).toBe(15);
    expect(c.build().v).toBe(115);
  });

  it('clone produces independent builder #16', () => {
    const b = createBuilder<{ v: number }>({ v: 16 });
    const c = b.clone();
    c.set('v', 116);
    expect(b.build().v).toBe(16);
    expect(c.build().v).toBe(116);
  });

  it('clone produces independent builder #17', () => {
    const b = createBuilder<{ v: number }>({ v: 17 });
    const c = b.clone();
    c.set('v', 117);
    expect(b.build().v).toBe(17);
    expect(c.build().v).toBe(117);
  });

  it('clone produces independent builder #18', () => {
    const b = createBuilder<{ v: number }>({ v: 18 });
    const c = b.clone();
    c.set('v', 118);
    expect(b.build().v).toBe(18);
    expect(c.build().v).toBe(118);
  });

  it('clone produces independent builder #19', () => {
    const b = createBuilder<{ v: number }>({ v: 19 });
    const c = b.clone();
    c.set('v', 119);
    expect(b.build().v).toBe(19);
    expect(c.build().v).toBe(119);
  });

  it('clone produces independent builder #20', () => {
    const b = createBuilder<{ v: number }>({ v: 20 });
    const c = b.clone();
    c.set('v', 120);
    expect(b.build().v).toBe(20);
    expect(c.build().v).toBe(120);
  });

  it('clone produces independent builder #21', () => {
    const b = createBuilder<{ v: number }>({ v: 21 });
    const c = b.clone();
    c.set('v', 121);
    expect(b.build().v).toBe(21);
    expect(c.build().v).toBe(121);
  });

  it('clone produces independent builder #22', () => {
    const b = createBuilder<{ v: number }>({ v: 22 });
    const c = b.clone();
    c.set('v', 122);
    expect(b.build().v).toBe(22);
    expect(c.build().v).toBe(122);
  });

  it('clone produces independent builder #23', () => {
    const b = createBuilder<{ v: number }>({ v: 23 });
    const c = b.clone();
    c.set('v', 123);
    expect(b.build().v).toBe(23);
    expect(c.build().v).toBe(123);
  });

  it('clone produces independent builder #24', () => {
    const b = createBuilder<{ v: number }>({ v: 24 });
    const c = b.clone();
    c.set('v', 124);
    expect(b.build().v).toBe(24);
    expect(c.build().v).toBe(124);
  });

  it('clone produces independent builder #25', () => {
    const b = createBuilder<{ v: number }>({ v: 25 });
    const c = b.clone();
    c.set('v', 125);
    expect(b.build().v).toBe(25);
    expect(c.build().v).toBe(125);
  });

  it('clone produces independent builder #26', () => {
    const b = createBuilder<{ v: number }>({ v: 26 });
    const c = b.clone();
    c.set('v', 126);
    expect(b.build().v).toBe(26);
    expect(c.build().v).toBe(126);
  });

  it('clone produces independent builder #27', () => {
    const b = createBuilder<{ v: number }>({ v: 27 });
    const c = b.clone();
    c.set('v', 127);
    expect(b.build().v).toBe(27);
    expect(c.build().v).toBe(127);
  });

  it('clone produces independent builder #28', () => {
    const b = createBuilder<{ v: number }>({ v: 28 });
    const c = b.clone();
    c.set('v', 128);
    expect(b.build().v).toBe(28);
    expect(c.build().v).toBe(128);
  });

  it('clone produces independent builder #29', () => {
    const b = createBuilder<{ v: number }>({ v: 29 });
    const c = b.clone();
    c.set('v', 129);
    expect(b.build().v).toBe(29);
    expect(c.build().v).toBe(129);
  });

  it('clone produces independent builder #30', () => {
    const b = createBuilder<{ v: number }>({ v: 30 });
    const c = b.clone();
    c.set('v', 130);
    expect(b.build().v).toBe(30);
    expect(c.build().v).toBe(130);
  });

  it('clone produces independent builder #31', () => {
    const b = createBuilder<{ v: number }>({ v: 31 });
    const c = b.clone();
    c.set('v', 131);
    expect(b.build().v).toBe(31);
    expect(c.build().v).toBe(131);
  });

  it('clone produces independent builder #32', () => {
    const b = createBuilder<{ v: number }>({ v: 32 });
    const c = b.clone();
    c.set('v', 132);
    expect(b.build().v).toBe(32);
    expect(c.build().v).toBe(132);
  });

  it('clone produces independent builder #33', () => {
    const b = createBuilder<{ v: number }>({ v: 33 });
    const c = b.clone();
    c.set('v', 133);
    expect(b.build().v).toBe(33);
    expect(c.build().v).toBe(133);
  });

  it('clone produces independent builder #34', () => {
    const b = createBuilder<{ v: number }>({ v: 34 });
    const c = b.clone();
    c.set('v', 134);
    expect(b.build().v).toBe(34);
    expect(c.build().v).toBe(134);
  });

  it('clone produces independent builder #35', () => {
    const b = createBuilder<{ v: number }>({ v: 35 });
    const c = b.clone();
    c.set('v', 135);
    expect(b.build().v).toBe(35);
    expect(c.build().v).toBe(135);
  });

  it('clone produces independent builder #36', () => {
    const b = createBuilder<{ v: number }>({ v: 36 });
    const c = b.clone();
    c.set('v', 136);
    expect(b.build().v).toBe(36);
    expect(c.build().v).toBe(136);
  });

  it('clone produces independent builder #37', () => {
    const b = createBuilder<{ v: number }>({ v: 37 });
    const c = b.clone();
    c.set('v', 137);
    expect(b.build().v).toBe(37);
    expect(c.build().v).toBe(137);
  });

  it('clone produces independent builder #38', () => {
    const b = createBuilder<{ v: number }>({ v: 38 });
    const c = b.clone();
    c.set('v', 138);
    expect(b.build().v).toBe(38);
    expect(c.build().v).toBe(138);
  });

  it('clone produces independent builder #39', () => {
    const b = createBuilder<{ v: number }>({ v: 39 });
    const c = b.clone();
    c.set('v', 139);
    expect(b.build().v).toBe(39);
    expect(c.build().v).toBe(139);
  });

  it('clone produces independent builder #40', () => {
    const b = createBuilder<{ v: number }>({ v: 40 });
    const c = b.clone();
    c.set('v', 140);
    expect(b.build().v).toBe(40);
    expect(c.build().v).toBe(140);
  });

  it('clone produces independent builder #41', () => {
    const b = createBuilder<{ v: number }>({ v: 41 });
    const c = b.clone();
    c.set('v', 141);
    expect(b.build().v).toBe(41);
    expect(c.build().v).toBe(141);
  });

  it('clone produces independent builder #42', () => {
    const b = createBuilder<{ v: number }>({ v: 42 });
    const c = b.clone();
    c.set('v', 142);
    expect(b.build().v).toBe(42);
    expect(c.build().v).toBe(142);
  });

  it('clone produces independent builder #43', () => {
    const b = createBuilder<{ v: number }>({ v: 43 });
    const c = b.clone();
    c.set('v', 143);
    expect(b.build().v).toBe(43);
    expect(c.build().v).toBe(143);
  });

  it('clone produces independent builder #44', () => {
    const b = createBuilder<{ v: number }>({ v: 44 });
    const c = b.clone();
    c.set('v', 144);
    expect(b.build().v).toBe(44);
    expect(c.build().v).toBe(144);
  });

  it('clone produces independent builder #45', () => {
    const b = createBuilder<{ v: number }>({ v: 45 });
    const c = b.clone();
    c.set('v', 145);
    expect(b.build().v).toBe(45);
    expect(c.build().v).toBe(145);
  });

  it('clone produces independent builder #46', () => {
    const b = createBuilder<{ v: number }>({ v: 46 });
    const c = b.clone();
    c.set('v', 146);
    expect(b.build().v).toBe(46);
    expect(c.build().v).toBe(146);
  });

  it('clone produces independent builder #47', () => {
    const b = createBuilder<{ v: number }>({ v: 47 });
    const c = b.clone();
    c.set('v', 147);
    expect(b.build().v).toBe(47);
    expect(c.build().v).toBe(147);
  });

  it('clone produces independent builder #48', () => {
    const b = createBuilder<{ v: number }>({ v: 48 });
    const c = b.clone();
    c.set('v', 148);
    expect(b.build().v).toBe(48);
    expect(c.build().v).toBe(148);
  });

  it('clone produces independent builder #49', () => {
    const b = createBuilder<{ v: number }>({ v: 49 });
    const c = b.clone();
    c.set('v', 149);
    expect(b.build().v).toBe(49);
    expect(c.build().v).toBe(149);
  });

  it('clone produces independent builder #50', () => {
    const b = createBuilder<{ v: number }>({ v: 50 });
    const c = b.clone();
    c.set('v', 150);
    expect(b.build().v).toBe(50);
    expect(c.build().v).toBe(150);
  });

  it('reset returns builder to defaults #1', () => {
    const b = createBuilder<{ k: number }>({ k: 1 });
    b.set('k', 10);
    b.reset();
    expect(b.build().k).toBe(1);
  });

  it('reset returns builder to defaults #2', () => {
    const b = createBuilder<{ k: number }>({ k: 2 });
    b.set('k', 20);
    b.reset();
    expect(b.build().k).toBe(2);
  });

  it('reset returns builder to defaults #3', () => {
    const b = createBuilder<{ k: number }>({ k: 3 });
    b.set('k', 30);
    b.reset();
    expect(b.build().k).toBe(3);
  });

  it('reset returns builder to defaults #4', () => {
    const b = createBuilder<{ k: number }>({ k: 4 });
    b.set('k', 40);
    b.reset();
    expect(b.build().k).toBe(4);
  });

  it('reset returns builder to defaults #5', () => {
    const b = createBuilder<{ k: number }>({ k: 5 });
    b.set('k', 50);
    b.reset();
    expect(b.build().k).toBe(5);
  });

  it('reset returns builder to defaults #6', () => {
    const b = createBuilder<{ k: number }>({ k: 6 });
    b.set('k', 60);
    b.reset();
    expect(b.build().k).toBe(6);
  });

  it('reset returns builder to defaults #7', () => {
    const b = createBuilder<{ k: number }>({ k: 7 });
    b.set('k', 70);
    b.reset();
    expect(b.build().k).toBe(7);
  });

  it('reset returns builder to defaults #8', () => {
    const b = createBuilder<{ k: number }>({ k: 8 });
    b.set('k', 80);
    b.reset();
    expect(b.build().k).toBe(8);
  });

  it('reset returns builder to defaults #9', () => {
    const b = createBuilder<{ k: number }>({ k: 9 });
    b.set('k', 90);
    b.reset();
    expect(b.build().k).toBe(9);
  });

  it('reset returns builder to defaults #10', () => {
    const b = createBuilder<{ k: number }>({ k: 10 });
    b.set('k', 100);
    b.reset();
    expect(b.build().k).toBe(10);
  });

  it('reset returns builder to defaults #11', () => {
    const b = createBuilder<{ k: number }>({ k: 11 });
    b.set('k', 110);
    b.reset();
    expect(b.build().k).toBe(11);
  });

  it('reset returns builder to defaults #12', () => {
    const b = createBuilder<{ k: number }>({ k: 12 });
    b.set('k', 120);
    b.reset();
    expect(b.build().k).toBe(12);
  });

  it('reset returns builder to defaults #13', () => {
    const b = createBuilder<{ k: number }>({ k: 13 });
    b.set('k', 130);
    b.reset();
    expect(b.build().k).toBe(13);
  });

  it('reset returns builder to defaults #14', () => {
    const b = createBuilder<{ k: number }>({ k: 14 });
    b.set('k', 140);
    b.reset();
    expect(b.build().k).toBe(14);
  });

  it('reset returns builder to defaults #15', () => {
    const b = createBuilder<{ k: number }>({ k: 15 });
    b.set('k', 150);
    b.reset();
    expect(b.build().k).toBe(15);
  });

  it('reset returns builder to defaults #16', () => {
    const b = createBuilder<{ k: number }>({ k: 16 });
    b.set('k', 160);
    b.reset();
    expect(b.build().k).toBe(16);
  });

  it('reset returns builder to defaults #17', () => {
    const b = createBuilder<{ k: number }>({ k: 17 });
    b.set('k', 170);
    b.reset();
    expect(b.build().k).toBe(17);
  });

  it('reset returns builder to defaults #18', () => {
    const b = createBuilder<{ k: number }>({ k: 18 });
    b.set('k', 180);
    b.reset();
    expect(b.build().k).toBe(18);
  });

  it('reset returns builder to defaults #19', () => {
    const b = createBuilder<{ k: number }>({ k: 19 });
    b.set('k', 190);
    b.reset();
    expect(b.build().k).toBe(19);
  });

  it('reset returns builder to defaults #20', () => {
    const b = createBuilder<{ k: number }>({ k: 20 });
    b.set('k', 200);
    b.reset();
    expect(b.build().k).toBe(20);
  });

  it('reset returns builder to defaults #21', () => {
    const b = createBuilder<{ k: number }>({ k: 21 });
    b.set('k', 210);
    b.reset();
    expect(b.build().k).toBe(21);
  });

  it('reset returns builder to defaults #22', () => {
    const b = createBuilder<{ k: number }>({ k: 22 });
    b.set('k', 220);
    b.reset();
    expect(b.build().k).toBe(22);
  });

  it('reset returns builder to defaults #23', () => {
    const b = createBuilder<{ k: number }>({ k: 23 });
    b.set('k', 230);
    b.reset();
    expect(b.build().k).toBe(23);
  });

  it('reset returns builder to defaults #24', () => {
    const b = createBuilder<{ k: number }>({ k: 24 });
    b.set('k', 240);
    b.reset();
    expect(b.build().k).toBe(24);
  });

  it('reset returns builder to defaults #25', () => {
    const b = createBuilder<{ k: number }>({ k: 25 });
    b.set('k', 250);
    b.reset();
    expect(b.build().k).toBe(25);
  });

  it('reset returns builder to defaults #26', () => {
    const b = createBuilder<{ k: number }>({ k: 26 });
    b.set('k', 260);
    b.reset();
    expect(b.build().k).toBe(26);
  });

  it('reset returns builder to defaults #27', () => {
    const b = createBuilder<{ k: number }>({ k: 27 });
    b.set('k', 270);
    b.reset();
    expect(b.build().k).toBe(27);
  });

  it('reset returns builder to defaults #28', () => {
    const b = createBuilder<{ k: number }>({ k: 28 });
    b.set('k', 280);
    b.reset();
    expect(b.build().k).toBe(28);
  });

  it('reset returns builder to defaults #29', () => {
    const b = createBuilder<{ k: number }>({ k: 29 });
    b.set('k', 290);
    b.reset();
    expect(b.build().k).toBe(29);
  });

  it('reset returns builder to defaults #30', () => {
    const b = createBuilder<{ k: number }>({ k: 30 });
    b.set('k', 300);
    b.reset();
    expect(b.build().k).toBe(30);
  });

  it('reset returns builder to defaults #31', () => {
    const b = createBuilder<{ k: number }>({ k: 31 });
    b.set('k', 310);
    b.reset();
    expect(b.build().k).toBe(31);
  });

  it('reset returns builder to defaults #32', () => {
    const b = createBuilder<{ k: number }>({ k: 32 });
    b.set('k', 320);
    b.reset();
    expect(b.build().k).toBe(32);
  });

  it('reset returns builder to defaults #33', () => {
    const b = createBuilder<{ k: number }>({ k: 33 });
    b.set('k', 330);
    b.reset();
    expect(b.build().k).toBe(33);
  });

  it('reset returns builder to defaults #34', () => {
    const b = createBuilder<{ k: number }>({ k: 34 });
    b.set('k', 340);
    b.reset();
    expect(b.build().k).toBe(34);
  });

  it('reset returns builder to defaults #35', () => {
    const b = createBuilder<{ k: number }>({ k: 35 });
    b.set('k', 350);
    b.reset();
    expect(b.build().k).toBe(35);
  });

  it('reset returns builder to defaults #36', () => {
    const b = createBuilder<{ k: number }>({ k: 36 });
    b.set('k', 360);
    b.reset();
    expect(b.build().k).toBe(36);
  });

  it('reset returns builder to defaults #37', () => {
    const b = createBuilder<{ k: number }>({ k: 37 });
    b.set('k', 370);
    b.reset();
    expect(b.build().k).toBe(37);
  });

  it('reset returns builder to defaults #38', () => {
    const b = createBuilder<{ k: number }>({ k: 38 });
    b.set('k', 380);
    b.reset();
    expect(b.build().k).toBe(38);
  });

  it('reset returns builder to defaults #39', () => {
    const b = createBuilder<{ k: number }>({ k: 39 });
    b.set('k', 390);
    b.reset();
    expect(b.build().k).toBe(39);
  });

  it('reset returns builder to defaults #40', () => {
    const b = createBuilder<{ k: number }>({ k: 40 });
    b.set('k', 400);
    b.reset();
    expect(b.build().k).toBe(40);
  });

  it('reset returns builder to defaults #41', () => {
    const b = createBuilder<{ k: number }>({ k: 41 });
    b.set('k', 410);
    b.reset();
    expect(b.build().k).toBe(41);
  });

  it('reset returns builder to defaults #42', () => {
    const b = createBuilder<{ k: number }>({ k: 42 });
    b.set('k', 420);
    b.reset();
    expect(b.build().k).toBe(42);
  });

  it('reset returns builder to defaults #43', () => {
    const b = createBuilder<{ k: number }>({ k: 43 });
    b.set('k', 430);
    b.reset();
    expect(b.build().k).toBe(43);
  });

  it('reset returns builder to defaults #44', () => {
    const b = createBuilder<{ k: number }>({ k: 44 });
    b.set('k', 440);
    b.reset();
    expect(b.build().k).toBe(44);
  });

  it('reset returns builder to defaults #45', () => {
    const b = createBuilder<{ k: number }>({ k: 45 });
    b.set('k', 450);
    b.reset();
    expect(b.build().k).toBe(45);
  });

  it('reset returns builder to defaults #46', () => {
    const b = createBuilder<{ k: number }>({ k: 46 });
    b.set('k', 460);
    b.reset();
    expect(b.build().k).toBe(46);
  });

  it('reset returns builder to defaults #47', () => {
    const b = createBuilder<{ k: number }>({ k: 47 });
    b.set('k', 470);
    b.reset();
    expect(b.build().k).toBe(47);
  });

  it('reset returns builder to defaults #48', () => {
    const b = createBuilder<{ k: number }>({ k: 48 });
    b.set('k', 480);
    b.reset();
    expect(b.build().k).toBe(48);
  });

  it('reset returns builder to defaults #49', () => {
    const b = createBuilder<{ k: number }>({ k: 49 });
    b.set('k', 490);
    b.reset();
    expect(b.build().k).toBe(49);
  });

  it('reset returns builder to defaults #50', () => {
    const b = createBuilder<{ k: number }>({ k: 50 });
    b.set('k', 500);
    b.reset();
    expect(b.build().k).toBe(50);
  });

  it('hasField returns true for set field #1', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 1);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #2', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 2);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #3', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 3);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #4', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 4);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #5', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 5);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #6', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 6);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #7', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 7);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #8', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 8);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #9', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 9);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #10', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 10);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #11', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 11);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #12', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 12);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #13', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 13);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #14', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 14);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #15', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 15);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #16', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 16);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #17', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 17);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #18', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 18);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #19', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 19);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #20', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 20);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #21', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 21);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #22', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 22);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #23', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 23);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #24', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 24);
    expect(b.hasField('m')).toBe(true);
  });

  it('hasField returns true for set field #25', () => {
    const b = createBuilder<{ m: number }>();
    b.set('m', 25);
    expect(b.hasField('m')).toBe(true);
  });

  it('getField returns correct value #1', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val1');
    expect(b.getField('p')).toBe('val1');
  });

  it('getField returns correct value #2', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val2');
    expect(b.getField('p')).toBe('val2');
  });

  it('getField returns correct value #3', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val3');
    expect(b.getField('p')).toBe('val3');
  });

  it('getField returns correct value #4', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val4');
    expect(b.getField('p')).toBe('val4');
  });

  it('getField returns correct value #5', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val5');
    expect(b.getField('p')).toBe('val5');
  });

  it('getField returns correct value #6', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val6');
    expect(b.getField('p')).toBe('val6');
  });

  it('getField returns correct value #7', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val7');
    expect(b.getField('p')).toBe('val7');
  });

  it('getField returns correct value #8', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val8');
    expect(b.getField('p')).toBe('val8');
  });

  it('getField returns correct value #9', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val9');
    expect(b.getField('p')).toBe('val9');
  });

  it('getField returns correct value #10', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val10');
    expect(b.getField('p')).toBe('val10');
  });

  it('getField returns correct value #11', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val11');
    expect(b.getField('p')).toBe('val11');
  });

  it('getField returns correct value #12', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val12');
    expect(b.getField('p')).toBe('val12');
  });

  it('getField returns correct value #13', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val13');
    expect(b.getField('p')).toBe('val13');
  });

  it('getField returns correct value #14', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val14');
    expect(b.getField('p')).toBe('val14');
  });

  it('getField returns correct value #15', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val15');
    expect(b.getField('p')).toBe('val15');
  });

  it('getField returns correct value #16', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val16');
    expect(b.getField('p')).toBe('val16');
  });

  it('getField returns correct value #17', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val17');
    expect(b.getField('p')).toBe('val17');
  });

  it('getField returns correct value #18', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val18');
    expect(b.getField('p')).toBe('val18');
  });

  it('getField returns correct value #19', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val19');
    expect(b.getField('p')).toBe('val19');
  });

  it('getField returns correct value #20', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val20');
    expect(b.getField('p')).toBe('val20');
  });

  it('getField returns correct value #21', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val21');
    expect(b.getField('p')).toBe('val21');
  });

  it('getField returns correct value #22', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val22');
    expect(b.getField('p')).toBe('val22');
  });

  it('getField returns correct value #23', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val23');
    expect(b.getField('p')).toBe('val23');
  });

  it('getField returns correct value #24', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val24');
    expect(b.getField('p')).toBe('val24');
  });

  it('getField returns correct value #25', () => {
    const b = createBuilder<{ p: string }>();
    b.set('p', 'val25');
    expect(b.getField('p')).toBe('val25');
  });

});

// ─── Section 3: UrlBuilder ───────────────────────────────────────────────────
describe('createUrlBuilder', () => {
  it('scheme=https host builds #1', () => {
    const url = createUrlBuilder().scheme('https').host('host1.example.com').build();
    expect(url).toBe('https://host1.example.com');
  });

  it('scheme=https host builds #2', () => {
    const url = createUrlBuilder().scheme('https').host('host2.example.com').build();
    expect(url).toBe('https://host2.example.com');
  });

  it('scheme=https host builds #3', () => {
    const url = createUrlBuilder().scheme('https').host('host3.example.com').build();
    expect(url).toBe('https://host3.example.com');
  });

  it('scheme=https host builds #4', () => {
    const url = createUrlBuilder().scheme('https').host('host4.example.com').build();
    expect(url).toBe('https://host4.example.com');
  });

  it('scheme=https host builds #5', () => {
    const url = createUrlBuilder().scheme('https').host('host5.example.com').build();
    expect(url).toBe('https://host5.example.com');
  });

  it('scheme=https host builds #6', () => {
    const url = createUrlBuilder().scheme('https').host('host6.example.com').build();
    expect(url).toBe('https://host6.example.com');
  });

  it('scheme=http host builds #7', () => {
    const url = createUrlBuilder().scheme('http').host('host1.example.com').build();
    expect(url).toBe('http://host1.example.com');
  });

  it('scheme=http host builds #8', () => {
    const url = createUrlBuilder().scheme('http').host('host2.example.com').build();
    expect(url).toBe('http://host2.example.com');
  });

  it('scheme=http host builds #9', () => {
    const url = createUrlBuilder().scheme('http').host('host3.example.com').build();
    expect(url).toBe('http://host3.example.com');
  });

  it('scheme=http host builds #10', () => {
    const url = createUrlBuilder().scheme('http').host('host4.example.com').build();
    expect(url).toBe('http://host4.example.com');
  });

  it('scheme=http host builds #11', () => {
    const url = createUrlBuilder().scheme('http').host('host5.example.com').build();
    expect(url).toBe('http://host5.example.com');
  });

  it('scheme=http host builds #12', () => {
    const url = createUrlBuilder().scheme('http').host('host6.example.com').build();
    expect(url).toBe('http://host6.example.com');
  });

  it('scheme=ftp host builds #13', () => {
    const url = createUrlBuilder().scheme('ftp').host('host1.example.com').build();
    expect(url).toBe('ftp://host1.example.com');
  });

  it('scheme=ftp host builds #14', () => {
    const url = createUrlBuilder().scheme('ftp').host('host2.example.com').build();
    expect(url).toBe('ftp://host2.example.com');
  });

  it('scheme=ftp host builds #15', () => {
    const url = createUrlBuilder().scheme('ftp').host('host3.example.com').build();
    expect(url).toBe('ftp://host3.example.com');
  });

  it('scheme=ftp host builds #16', () => {
    const url = createUrlBuilder().scheme('ftp').host('host4.example.com').build();
    expect(url).toBe('ftp://host4.example.com');
  });

  it('scheme=ftp host builds #17', () => {
    const url = createUrlBuilder().scheme('ftp').host('host5.example.com').build();
    expect(url).toBe('ftp://host5.example.com');
  });

  it('scheme=ftp host builds #18', () => {
    const url = createUrlBuilder().scheme('ftp').host('host6.example.com').build();
    expect(url).toBe('ftp://host6.example.com');
  });

  it('scheme=ws host builds #19', () => {
    const url = createUrlBuilder().scheme('ws').host('host1.example.com').build();
    expect(url).toBe('ws://host1.example.com');
  });

  it('scheme=ws host builds #20', () => {
    const url = createUrlBuilder().scheme('ws').host('host2.example.com').build();
    expect(url).toBe('ws://host2.example.com');
  });

  it('scheme=ws host builds #21', () => {
    const url = createUrlBuilder().scheme('ws').host('host3.example.com').build();
    expect(url).toBe('ws://host3.example.com');
  });

  it('scheme=ws host builds #22', () => {
    const url = createUrlBuilder().scheme('ws').host('host4.example.com').build();
    expect(url).toBe('ws://host4.example.com');
  });

  it('scheme=ws host builds #23', () => {
    const url = createUrlBuilder().scheme('ws').host('host5.example.com').build();
    expect(url).toBe('ws://host5.example.com');
  });

  it('scheme=ws host builds #24', () => {
    const url = createUrlBuilder().scheme('ws').host('host6.example.com').build();
    expect(url).toBe('ws://host6.example.com');
  });

  it('scheme=wss host builds #25', () => {
    const url = createUrlBuilder().scheme('wss').host('host1.example.com').build();
    expect(url).toBe('wss://host1.example.com');
  });

  it('scheme=wss host builds #26', () => {
    const url = createUrlBuilder().scheme('wss').host('host2.example.com').build();
    expect(url).toBe('wss://host2.example.com');
  });

  it('scheme=wss host builds #27', () => {
    const url = createUrlBuilder().scheme('wss').host('host3.example.com').build();
    expect(url).toBe('wss://host3.example.com');
  });

  it('scheme=wss host builds #28', () => {
    const url = createUrlBuilder().scheme('wss').host('host4.example.com').build();
    expect(url).toBe('wss://host4.example.com');
  });

  it('scheme=wss host builds #29', () => {
    const url = createUrlBuilder().scheme('wss').host('host5.example.com').build();
    expect(url).toBe('wss://host5.example.com');
  });

  it('scheme=wss host builds #30', () => {
    const url = createUrlBuilder().scheme('wss').host('host6.example.com').build();
    expect(url).toBe('wss://host6.example.com');
  });

  it('port=80 appended correctly #1', () => {
    const url = createUrlBuilder().scheme('https').host('srv0.local').port(80).build();
    expect(url).toBe('https://srv0.local:80');
  });

  it('port=80 appended correctly #2', () => {
    const url = createUrlBuilder().scheme('https').host('srv1.local').port(80).build();
    expect(url).toBe('https://srv1.local:80');
  });

  it('port=80 appended correctly #3', () => {
    const url = createUrlBuilder().scheme('https').host('srv2.local').port(80).build();
    expect(url).toBe('https://srv2.local:80');
  });

  it('port=80 appended correctly #4', () => {
    const url = createUrlBuilder().scheme('https').host('srv3.local').port(80).build();
    expect(url).toBe('https://srv3.local:80');
  });

  it('port=80 appended correctly #5', () => {
    const url = createUrlBuilder().scheme('https').host('srv4.local').port(80).build();
    expect(url).toBe('https://srv4.local:80');
  });

  it('port=443 appended correctly #6', () => {
    const url = createUrlBuilder().scheme('https').host('srv0.local').port(443).build();
    expect(url).toBe('https://srv0.local:443');
  });

  it('port=443 appended correctly #7', () => {
    const url = createUrlBuilder().scheme('https').host('srv1.local').port(443).build();
    expect(url).toBe('https://srv1.local:443');
  });

  it('port=443 appended correctly #8', () => {
    const url = createUrlBuilder().scheme('https').host('srv2.local').port(443).build();
    expect(url).toBe('https://srv2.local:443');
  });

  it('port=443 appended correctly #9', () => {
    const url = createUrlBuilder().scheme('https').host('srv3.local').port(443).build();
    expect(url).toBe('https://srv3.local:443');
  });

  it('port=443 appended correctly #10', () => {
    const url = createUrlBuilder().scheme('https').host('srv4.local').port(443).build();
    expect(url).toBe('https://srv4.local:443');
  });

  it('port=8080 appended correctly #11', () => {
    const url = createUrlBuilder().scheme('https').host('srv0.local').port(8080).build();
    expect(url).toBe('https://srv0.local:8080');
  });

  it('port=8080 appended correctly #12', () => {
    const url = createUrlBuilder().scheme('https').host('srv1.local').port(8080).build();
    expect(url).toBe('https://srv1.local:8080');
  });

  it('port=8080 appended correctly #13', () => {
    const url = createUrlBuilder().scheme('https').host('srv2.local').port(8080).build();
    expect(url).toBe('https://srv2.local:8080');
  });

  it('port=8080 appended correctly #14', () => {
    const url = createUrlBuilder().scheme('https').host('srv3.local').port(8080).build();
    expect(url).toBe('https://srv3.local:8080');
  });

  it('port=8080 appended correctly #15', () => {
    const url = createUrlBuilder().scheme('https').host('srv4.local').port(8080).build();
    expect(url).toBe('https://srv4.local:8080');
  });

  it('port=3000 appended correctly #16', () => {
    const url = createUrlBuilder().scheme('https').host('srv0.local').port(3000).build();
    expect(url).toBe('https://srv0.local:3000');
  });

  it('port=3000 appended correctly #17', () => {
    const url = createUrlBuilder().scheme('https').host('srv1.local').port(3000).build();
    expect(url).toBe('https://srv1.local:3000');
  });

  it('port=3000 appended correctly #18', () => {
    const url = createUrlBuilder().scheme('https').host('srv2.local').port(3000).build();
    expect(url).toBe('https://srv2.local:3000');
  });

  it('port=3000 appended correctly #19', () => {
    const url = createUrlBuilder().scheme('https').host('srv3.local').port(3000).build();
    expect(url).toBe('https://srv3.local:3000');
  });

  it('port=3000 appended correctly #20', () => {
    const url = createUrlBuilder().scheme('https').host('srv4.local').port(3000).build();
    expect(url).toBe('https://srv4.local:3000');
  });

  it('port=4000 appended correctly #21', () => {
    const url = createUrlBuilder().scheme('https').host('srv0.local').port(4000).build();
    expect(url).toBe('https://srv0.local:4000');
  });

  it('port=4000 appended correctly #22', () => {
    const url = createUrlBuilder().scheme('https').host('srv1.local').port(4000).build();
    expect(url).toBe('https://srv1.local:4000');
  });

  it('port=4000 appended correctly #23', () => {
    const url = createUrlBuilder().scheme('https').host('srv2.local').port(4000).build();
    expect(url).toBe('https://srv2.local:4000');
  });

  it('port=4000 appended correctly #24', () => {
    const url = createUrlBuilder().scheme('https').host('srv3.local').port(4000).build();
    expect(url).toBe('https://srv3.local:4000');
  });

  it('port=4000 appended correctly #25', () => {
    const url = createUrlBuilder().scheme('https').host('srv4.local').port(4000).build();
    expect(url).toBe('https://srv4.local:4000');
  });

  it('port=5432 appended correctly #26', () => {
    const url = createUrlBuilder().scheme('https').host('srv0.local').port(5432).build();
    expect(url).toBe('https://srv0.local:5432');
  });

  it('port=5432 appended correctly #27', () => {
    const url = createUrlBuilder().scheme('https').host('srv1.local').port(5432).build();
    expect(url).toBe('https://srv1.local:5432');
  });

  it('port=5432 appended correctly #28', () => {
    const url = createUrlBuilder().scheme('https').host('srv2.local').port(5432).build();
    expect(url).toBe('https://srv2.local:5432');
  });

  it('port=5432 appended correctly #29', () => {
    const url = createUrlBuilder().scheme('https').host('srv3.local').port(5432).build();
    expect(url).toBe('https://srv3.local:5432');
  });

  it('port=5432 appended correctly #30', () => {
    const url = createUrlBuilder().scheme('https').host('srv4.local').port(5432).build();
    expect(url).toBe('https://srv4.local:5432');
  });

  it('path segments joined correctly #1', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('api', 'v1', 'users').build();
    expect(url).toBe('https://example.com/api/v1/users');
  });

  it('path segments joined correctly #2', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('api', 'v1', 'users').build();
    expect(url).toBe('https://example.com/api/v1/users');
  });

  it('path segments joined correctly #3', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('api', 'v1', 'users').build();
    expect(url).toBe('https://example.com/api/v1/users');
  });

  it('path segments joined correctly #4', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('api', 'v1', 'users').build();
    expect(url).toBe('https://example.com/api/v1/users');
  });

  it('path segments joined correctly #5', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('api', 'v1', 'users').build();
    expect(url).toBe('https://example.com/api/v1/users');
  });

  it('path segments joined correctly #6', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('api', 'v1', 'users').build();
    expect(url).toBe('https://example.com/api/v1/users');
  });

  it('path segments joined correctly #7', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('api', 'v1', 'users').build();
    expect(url).toBe('https://example.com/api/v1/users');
  });

  it('path segments joined correctly #8', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('api', 'v1', 'users').build();
    expect(url).toBe('https://example.com/api/v1/users');
  });

  it('path segments joined correctly #9', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('app', 'dashboard').build();
    expect(url).toBe('https://example.com/app/dashboard');
  });

  it('path segments joined correctly #10', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('app', 'dashboard').build();
    expect(url).toBe('https://example.com/app/dashboard');
  });

  it('path segments joined correctly #11', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('app', 'dashboard').build();
    expect(url).toBe('https://example.com/app/dashboard');
  });

  it('path segments joined correctly #12', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('app', 'dashboard').build();
    expect(url).toBe('https://example.com/app/dashboard');
  });

  it('path segments joined correctly #13', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('app', 'dashboard').build();
    expect(url).toBe('https://example.com/app/dashboard');
  });

  it('path segments joined correctly #14', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('app', 'dashboard').build();
    expect(url).toBe('https://example.com/app/dashboard');
  });

  it('path segments joined correctly #15', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('app', 'dashboard').build();
    expect(url).toBe('https://example.com/app/dashboard');
  });

  it('path segments joined correctly #16', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('app', 'dashboard').build();
    expect(url).toBe('https://example.com/app/dashboard');
  });

  it('path segments joined correctly #17', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('health-safety', 'risks').build();
    expect(url).toBe('https://example.com/health-safety/risks');
  });

  it('path segments joined correctly #18', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('health-safety', 'risks').build();
    expect(url).toBe('https://example.com/health-safety/risks');
  });

  it('path segments joined correctly #19', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('health-safety', 'risks').build();
    expect(url).toBe('https://example.com/health-safety/risks');
  });

  it('path segments joined correctly #20', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('health-safety', 'risks').build();
    expect(url).toBe('https://example.com/health-safety/risks');
  });

  it('path segments joined correctly #21', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('health-safety', 'risks').build();
    expect(url).toBe('https://example.com/health-safety/risks');
  });

  it('path segments joined correctly #22', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('health-safety', 'risks').build();
    expect(url).toBe('https://example.com/health-safety/risks');
  });

  it('path segments joined correctly #23', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('health-safety', 'risks').build();
    expect(url).toBe('https://example.com/health-safety/risks');
  });

  it('path segments joined correctly #24', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('health-safety', 'risks').build();
    expect(url).toBe('https://example.com/health-safety/risks');
  });

  it('path segments joined correctly #25', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('api', 'auth', 'login').build();
    expect(url).toBe('https://example.com/api/auth/login');
  });

  it('path segments joined correctly #26', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('api', 'auth', 'login').build();
    expect(url).toBe('https://example.com/api/auth/login');
  });

  it('path segments joined correctly #27', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('api', 'auth', 'login').build();
    expect(url).toBe('https://example.com/api/auth/login');
  });

  it('path segments joined correctly #28', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('api', 'auth', 'login').build();
    expect(url).toBe('https://example.com/api/auth/login');
  });

  it('path segments joined correctly #29', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('api', 'auth', 'login').build();
    expect(url).toBe('https://example.com/api/auth/login');
  });

  it('path segments joined correctly #30', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('api', 'auth', 'login').build();
    expect(url).toBe('https://example.com/api/auth/login');
  });

  it('path segments joined correctly #31', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('api', 'auth', 'login').build();
    expect(url).toBe('https://example.com/api/auth/login');
  });

  it('path segments joined correctly #32', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('api', 'auth', 'login').build();
    expect(url).toBe('https://example.com/api/auth/login');
  });

  it('path segments joined correctly #33', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('docs', 'guide').build();
    expect(url).toBe('https://example.com/docs/guide');
  });

  it('path segments joined correctly #34', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('docs', 'guide').build();
    expect(url).toBe('https://example.com/docs/guide');
  });

  it('path segments joined correctly #35', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('docs', 'guide').build();
    expect(url).toBe('https://example.com/docs/guide');
  });

  it('path segments joined correctly #36', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('docs', 'guide').build();
    expect(url).toBe('https://example.com/docs/guide');
  });

  it('path segments joined correctly #37', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('docs', 'guide').build();
    expect(url).toBe('https://example.com/docs/guide');
  });

  it('path segments joined correctly #38', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('docs', 'guide').build();
    expect(url).toBe('https://example.com/docs/guide');
  });

  it('path segments joined correctly #39', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('docs', 'guide').build();
    expect(url).toBe('https://example.com/docs/guide');
  });

  it('path segments joined correctly #40', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').path('docs', 'guide').build();
    expect(url).toBe('https://example.com/docs/guide');
  });

  it('query param sort=asc appended #1', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('sort', 'asc').build();
    expect(url).toContain('sort=asc');
  });

  it('query param sort=asc appended #2', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('sort', 'asc').build();
    expect(url).toContain('sort=asc');
  });

  it('query param sort=asc appended #3', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('sort', 'asc').build();
    expect(url).toContain('sort=asc');
  });

  it('query param sort=asc appended #4', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('sort', 'asc').build();
    expect(url).toContain('sort=asc');
  });

  it('query param sort=asc appended #5', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('sort', 'asc').build();
    expect(url).toContain('sort=asc');
  });

  it('query param sort=asc appended #6', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('sort', 'asc').build();
    expect(url).toContain('sort=asc');
  });

  it('query param sort=asc appended #7', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('sort', 'asc').build();
    expect(url).toContain('sort=asc');
  });

  it('query param sort=asc appended #8', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('sort', 'asc').build();
    expect(url).toContain('sort=asc');
  });

  it('query param sort=asc appended #9', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('sort', 'asc').build();
    expect(url).toContain('sort=asc');
  });

  it('query param sort=asc appended #10', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('sort', 'asc').build();
    expect(url).toContain('sort=asc');
  });

  it('query param page=1 appended #11', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('page', '1').build();
    expect(url).toContain('page=1');
  });

  it('query param page=1 appended #12', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('page', '1').build();
    expect(url).toContain('page=1');
  });

  it('query param page=1 appended #13', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('page', '1').build();
    expect(url).toContain('page=1');
  });

  it('query param page=1 appended #14', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('page', '1').build();
    expect(url).toContain('page=1');
  });

  it('query param page=1 appended #15', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('page', '1').build();
    expect(url).toContain('page=1');
  });

  it('query param page=1 appended #16', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('page', '1').build();
    expect(url).toContain('page=1');
  });

  it('query param page=1 appended #17', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('page', '1').build();
    expect(url).toContain('page=1');
  });

  it('query param page=1 appended #18', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('page', '1').build();
    expect(url).toContain('page=1');
  });

  it('query param page=1 appended #19', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('page', '1').build();
    expect(url).toContain('page=1');
  });

  it('query param page=1 appended #20', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('page', '1').build();
    expect(url).toContain('page=1');
  });

  it('query param limit=10 appended #21', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('limit', '10').build();
    expect(url).toContain('limit=10');
  });

  it('query param limit=10 appended #22', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('limit', '10').build();
    expect(url).toContain('limit=10');
  });

  it('query param limit=10 appended #23', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('limit', '10').build();
    expect(url).toContain('limit=10');
  });

  it('query param limit=10 appended #24', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('limit', '10').build();
    expect(url).toContain('limit=10');
  });

  it('query param limit=10 appended #25', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('limit', '10').build();
    expect(url).toContain('limit=10');
  });

  it('query param limit=10 appended #26', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('limit', '10').build();
    expect(url).toContain('limit=10');
  });

  it('query param limit=10 appended #27', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('limit', '10').build();
    expect(url).toContain('limit=10');
  });

  it('query param limit=10 appended #28', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('limit', '10').build();
    expect(url).toContain('limit=10');
  });

  it('query param limit=10 appended #29', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('limit', '10').build();
    expect(url).toContain('limit=10');
  });

  it('query param limit=10 appended #30', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('limit', '10').build();
    expect(url).toContain('limit=10');
  });

  it('query param q=hello appended #31', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('q', 'hello').build();
    expect(url).toContain('q=hello');
  });

  it('query param q=hello appended #32', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('q', 'hello').build();
    expect(url).toContain('q=hello');
  });

  it('query param q=hello appended #33', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('q', 'hello').build();
    expect(url).toContain('q=hello');
  });

  it('query param q=hello appended #34', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('q', 'hello').build();
    expect(url).toContain('q=hello');
  });

  it('query param q=hello appended #35', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('q', 'hello').build();
    expect(url).toContain('q=hello');
  });

  it('query param q=hello appended #36', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('q', 'hello').build();
    expect(url).toContain('q=hello');
  });

  it('query param q=hello appended #37', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('q', 'hello').build();
    expect(url).toContain('q=hello');
  });

  it('query param q=hello appended #38', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('q', 'hello').build();
    expect(url).toContain('q=hello');
  });

  it('query param q=hello appended #39', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('q', 'hello').build();
    expect(url).toContain('q=hello');
  });

  it('query param q=hello appended #40', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('q', 'hello').build();
    expect(url).toContain('q=hello');
  });

  it('query param filter=active appended #41', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('filter', 'active').build();
    expect(url).toContain('filter=active');
  });

  it('query param filter=active appended #42', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('filter', 'active').build();
    expect(url).toContain('filter=active');
  });

  it('query param filter=active appended #43', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('filter', 'active').build();
    expect(url).toContain('filter=active');
  });

  it('query param filter=active appended #44', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('filter', 'active').build();
    expect(url).toContain('filter=active');
  });

  it('query param filter=active appended #45', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('filter', 'active').build();
    expect(url).toContain('filter=active');
  });

  it('query param filter=active appended #46', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('filter', 'active').build();
    expect(url).toContain('filter=active');
  });

  it('query param filter=active appended #47', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('filter', 'active').build();
    expect(url).toContain('filter=active');
  });

  it('query param filter=active appended #48', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('filter', 'active').build();
    expect(url).toContain('filter=active');
  });

  it('query param filter=active appended #49', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('filter', 'active').build();
    expect(url).toContain('filter=active');
  });

  it('query param filter=active appended #50', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').param('filter', 'active').build();
    expect(url).toContain('filter=active');
  });

  it('fragment top appended correctly #1', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('top').build();
    expect(url).toBe('https://example.com#top');
  });

  it('fragment top appended correctly #2', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('top').build();
    expect(url).toBe('https://example.com#top');
  });

  it('fragment top appended correctly #3', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('top').build();
    expect(url).toBe('https://example.com#top');
  });

  it('fragment top appended correctly #4', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('top').build();
    expect(url).toBe('https://example.com#top');
  });

  it('fragment top appended correctly #5', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('top').build();
    expect(url).toBe('https://example.com#top');
  });

  it('fragment section1 appended correctly #6', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('section1').build();
    expect(url).toBe('https://example.com#section1');
  });

  it('fragment section1 appended correctly #7', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('section1').build();
    expect(url).toBe('https://example.com#section1');
  });

  it('fragment section1 appended correctly #8', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('section1').build();
    expect(url).toBe('https://example.com#section1');
  });

  it('fragment section1 appended correctly #9', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('section1').build();
    expect(url).toBe('https://example.com#section1');
  });

  it('fragment section1 appended correctly #10', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('section1').build();
    expect(url).toBe('https://example.com#section1');
  });

  it('fragment footer appended correctly #11', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('footer').build();
    expect(url).toBe('https://example.com#footer');
  });

  it('fragment footer appended correctly #12', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('footer').build();
    expect(url).toBe('https://example.com#footer');
  });

  it('fragment footer appended correctly #13', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('footer').build();
    expect(url).toBe('https://example.com#footer');
  });

  it('fragment footer appended correctly #14', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('footer').build();
    expect(url).toBe('https://example.com#footer');
  });

  it('fragment footer appended correctly #15', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('footer').build();
    expect(url).toBe('https://example.com#footer');
  });

  it('fragment hero appended correctly #16', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('hero').build();
    expect(url).toBe('https://example.com#hero');
  });

  it('fragment hero appended correctly #17', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('hero').build();
    expect(url).toBe('https://example.com#hero');
  });

  it('fragment hero appended correctly #18', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('hero').build();
    expect(url).toBe('https://example.com#hero');
  });

  it('fragment hero appended correctly #19', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('hero').build();
    expect(url).toBe('https://example.com#hero');
  });

  it('fragment hero appended correctly #20', () => {
    const url = createUrlBuilder().scheme('https').host('example.com').fragment('hero').build();
    expect(url).toBe('https://example.com#hero');
  });

  it('combined url build #1', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app1.example.com')
      .port(443)
      .path('api', 'v1')
      .param('id', '1')
      .build();
    expect(url).toContain('https://app1.example.com:443/api/v1');
    expect(url).toContain('id=1');
  });

  it('combined url build #2', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app2.example.com')
      .port(443)
      .path('api', 'v2')
      .param('id', '2')
      .build();
    expect(url).toContain('https://app2.example.com:443/api/v2');
    expect(url).toContain('id=2');
  });

  it('combined url build #3', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app3.example.com')
      .port(443)
      .path('api', 'v3')
      .param('id', '3')
      .build();
    expect(url).toContain('https://app3.example.com:443/api/v3');
    expect(url).toContain('id=3');
  });

  it('combined url build #4', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app4.example.com')
      .port(443)
      .path('api', 'v4')
      .param('id', '4')
      .build();
    expect(url).toContain('https://app4.example.com:443/api/v4');
    expect(url).toContain('id=4');
  });

  it('combined url build #5', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app5.example.com')
      .port(443)
      .path('api', 'v5')
      .param('id', '5')
      .build();
    expect(url).toContain('https://app5.example.com:443/api/v5');
    expect(url).toContain('id=5');
  });

  it('combined url build #6', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app6.example.com')
      .port(443)
      .path('api', 'v6')
      .param('id', '6')
      .build();
    expect(url).toContain('https://app6.example.com:443/api/v6');
    expect(url).toContain('id=6');
  });

  it('combined url build #7', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app7.example.com')
      .port(443)
      .path('api', 'v7')
      .param('id', '7')
      .build();
    expect(url).toContain('https://app7.example.com:443/api/v7');
    expect(url).toContain('id=7');
  });

  it('combined url build #8', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app8.example.com')
      .port(443)
      .path('api', 'v8')
      .param('id', '8')
      .build();
    expect(url).toContain('https://app8.example.com:443/api/v8');
    expect(url).toContain('id=8');
  });

  it('combined url build #9', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app9.example.com')
      .port(443)
      .path('api', 'v9')
      .param('id', '9')
      .build();
    expect(url).toContain('https://app9.example.com:443/api/v9');
    expect(url).toContain('id=9');
  });

  it('combined url build #10', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app10.example.com')
      .port(443)
      .path('api', 'v10')
      .param('id', '10')
      .build();
    expect(url).toContain('https://app10.example.com:443/api/v10');
    expect(url).toContain('id=10');
  });

  it('combined url build #11', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app11.example.com')
      .port(443)
      .path('api', 'v11')
      .param('id', '11')
      .build();
    expect(url).toContain('https://app11.example.com:443/api/v11');
    expect(url).toContain('id=11');
  });

  it('combined url build #12', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app12.example.com')
      .port(443)
      .path('api', 'v12')
      .param('id', '12')
      .build();
    expect(url).toContain('https://app12.example.com:443/api/v12');
    expect(url).toContain('id=12');
  });

  it('combined url build #13', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app13.example.com')
      .port(443)
      .path('api', 'v13')
      .param('id', '13')
      .build();
    expect(url).toContain('https://app13.example.com:443/api/v13');
    expect(url).toContain('id=13');
  });

  it('combined url build #14', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app14.example.com')
      .port(443)
      .path('api', 'v14')
      .param('id', '14')
      .build();
    expect(url).toContain('https://app14.example.com:443/api/v14');
    expect(url).toContain('id=14');
  });

  it('combined url build #15', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app15.example.com')
      .port(443)
      .path('api', 'v15')
      .param('id', '15')
      .build();
    expect(url).toContain('https://app15.example.com:443/api/v15');
    expect(url).toContain('id=15');
  });

  it('combined url build #16', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app16.example.com')
      .port(443)
      .path('api', 'v16')
      .param('id', '16')
      .build();
    expect(url).toContain('https://app16.example.com:443/api/v16');
    expect(url).toContain('id=16');
  });

  it('combined url build #17', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app17.example.com')
      .port(443)
      .path('api', 'v17')
      .param('id', '17')
      .build();
    expect(url).toContain('https://app17.example.com:443/api/v17');
    expect(url).toContain('id=17');
  });

  it('combined url build #18', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app18.example.com')
      .port(443)
      .path('api', 'v18')
      .param('id', '18')
      .build();
    expect(url).toContain('https://app18.example.com:443/api/v18');
    expect(url).toContain('id=18');
  });

  it('combined url build #19', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app19.example.com')
      .port(443)
      .path('api', 'v19')
      .param('id', '19')
      .build();
    expect(url).toContain('https://app19.example.com:443/api/v19');
    expect(url).toContain('id=19');
  });

  it('combined url build #20', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app20.example.com')
      .port(443)
      .path('api', 'v20')
      .param('id', '20')
      .build();
    expect(url).toContain('https://app20.example.com:443/api/v20');
    expect(url).toContain('id=20');
  });

  it('combined url build #21', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app21.example.com')
      .port(443)
      .path('api', 'v21')
      .param('id', '21')
      .build();
    expect(url).toContain('https://app21.example.com:443/api/v21');
    expect(url).toContain('id=21');
  });

  it('combined url build #22', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app22.example.com')
      .port(443)
      .path('api', 'v22')
      .param('id', '22')
      .build();
    expect(url).toContain('https://app22.example.com:443/api/v22');
    expect(url).toContain('id=22');
  });

  it('combined url build #23', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app23.example.com')
      .port(443)
      .path('api', 'v23')
      .param('id', '23')
      .build();
    expect(url).toContain('https://app23.example.com:443/api/v23');
    expect(url).toContain('id=23');
  });

  it('combined url build #24', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app24.example.com')
      .port(443)
      .path('api', 'v24')
      .param('id', '24')
      .build();
    expect(url).toContain('https://app24.example.com:443/api/v24');
    expect(url).toContain('id=24');
  });

  it('combined url build #25', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app25.example.com')
      .port(443)
      .path('api', 'v25')
      .param('id', '25')
      .build();
    expect(url).toContain('https://app25.example.com:443/api/v25');
    expect(url).toContain('id=25');
  });

  it('combined url build #26', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app26.example.com')
      .port(443)
      .path('api', 'v26')
      .param('id', '26')
      .build();
    expect(url).toContain('https://app26.example.com:443/api/v26');
    expect(url).toContain('id=26');
  });

  it('combined url build #27', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app27.example.com')
      .port(443)
      .path('api', 'v27')
      .param('id', '27')
      .build();
    expect(url).toContain('https://app27.example.com:443/api/v27');
    expect(url).toContain('id=27');
  });

  it('combined url build #28', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app28.example.com')
      .port(443)
      .path('api', 'v28')
      .param('id', '28')
      .build();
    expect(url).toContain('https://app28.example.com:443/api/v28');
    expect(url).toContain('id=28');
  });

  it('combined url build #29', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app29.example.com')
      .port(443)
      .path('api', 'v29')
      .param('id', '29')
      .build();
    expect(url).toContain('https://app29.example.com:443/api/v29');
    expect(url).toContain('id=29');
  });

  it('combined url build #30', () => {
    const url = createUrlBuilder()
      .scheme('https')
      .host('app30.example.com')
      .port(443)
      .path('api', 'v30')
      .param('id', '30')
      .build();
    expect(url).toContain('https://app30.example.com:443/api/v30');
    expect(url).toContain('id=30');
  });

});

// ─── Section 4: QueryBuilder ─────────────────────────────────────────────────
describe('createQueryBuilder', () => {
  it('SELECT * FROM users #1', () => {
    const sql = createQueryBuilder().from('users').build();
    expect(sql).toBe('SELECT * FROM users');
  });

  it('SELECT * FROM users #2', () => {
    const sql = createQueryBuilder().from('users').build();
    expect(sql).toBe('SELECT * FROM users');
  });

  it('SELECT * FROM users #3', () => {
    const sql = createQueryBuilder().from('users').build();
    expect(sql).toBe('SELECT * FROM users');
  });

  it('SELECT * FROM users #4', () => {
    const sql = createQueryBuilder().from('users').build();
    expect(sql).toBe('SELECT * FROM users');
  });

  it('SELECT * FROM users #5', () => {
    const sql = createQueryBuilder().from('users').build();
    expect(sql).toBe('SELECT * FROM users');
  });

  it('SELECT * FROM orders #6', () => {
    const sql = createQueryBuilder().from('orders').build();
    expect(sql).toBe('SELECT * FROM orders');
  });

  it('SELECT * FROM orders #7', () => {
    const sql = createQueryBuilder().from('orders').build();
    expect(sql).toBe('SELECT * FROM orders');
  });

  it('SELECT * FROM orders #8', () => {
    const sql = createQueryBuilder().from('orders').build();
    expect(sql).toBe('SELECT * FROM orders');
  });

  it('SELECT * FROM orders #9', () => {
    const sql = createQueryBuilder().from('orders').build();
    expect(sql).toBe('SELECT * FROM orders');
  });

  it('SELECT * FROM orders #10', () => {
    const sql = createQueryBuilder().from('orders').build();
    expect(sql).toBe('SELECT * FROM orders');
  });

  it('SELECT * FROM products #11', () => {
    const sql = createQueryBuilder().from('products').build();
    expect(sql).toBe('SELECT * FROM products');
  });

  it('SELECT * FROM products #12', () => {
    const sql = createQueryBuilder().from('products').build();
    expect(sql).toBe('SELECT * FROM products');
  });

  it('SELECT * FROM products #13', () => {
    const sql = createQueryBuilder().from('products').build();
    expect(sql).toBe('SELECT * FROM products');
  });

  it('SELECT * FROM products #14', () => {
    const sql = createQueryBuilder().from('products').build();
    expect(sql).toBe('SELECT * FROM products');
  });

  it('SELECT * FROM products #15', () => {
    const sql = createQueryBuilder().from('products').build();
    expect(sql).toBe('SELECT * FROM products');
  });

  it('SELECT * FROM incidents #16', () => {
    const sql = createQueryBuilder().from('incidents').build();
    expect(sql).toBe('SELECT * FROM incidents');
  });

  it('SELECT * FROM incidents #17', () => {
    const sql = createQueryBuilder().from('incidents').build();
    expect(sql).toBe('SELECT * FROM incidents');
  });

  it('SELECT * FROM incidents #18', () => {
    const sql = createQueryBuilder().from('incidents').build();
    expect(sql).toBe('SELECT * FROM incidents');
  });

  it('SELECT * FROM incidents #19', () => {
    const sql = createQueryBuilder().from('incidents').build();
    expect(sql).toBe('SELECT * FROM incidents');
  });

  it('SELECT * FROM incidents #20', () => {
    const sql = createQueryBuilder().from('incidents').build();
    expect(sql).toBe('SELECT * FROM incidents');
  });

  it('SELECT * FROM assets #21', () => {
    const sql = createQueryBuilder().from('assets').build();
    expect(sql).toBe('SELECT * FROM assets');
  });

  it('SELECT * FROM assets #22', () => {
    const sql = createQueryBuilder().from('assets').build();
    expect(sql).toBe('SELECT * FROM assets');
  });

  it('SELECT * FROM assets #23', () => {
    const sql = createQueryBuilder().from('assets').build();
    expect(sql).toBe('SELECT * FROM assets');
  });

  it('SELECT * FROM assets #24', () => {
    const sql = createQueryBuilder().from('assets').build();
    expect(sql).toBe('SELECT * FROM assets');
  });

  it('SELECT * FROM assets #25', () => {
    const sql = createQueryBuilder().from('assets').build();
    expect(sql).toBe('SELECT * FROM assets');
  });

  it('SELECT * FROM risks #26', () => {
    const sql = createQueryBuilder().from('risks').build();
    expect(sql).toBe('SELECT * FROM risks');
  });

  it('SELECT * FROM risks #27', () => {
    const sql = createQueryBuilder().from('risks').build();
    expect(sql).toBe('SELECT * FROM risks');
  });

  it('SELECT * FROM risks #28', () => {
    const sql = createQueryBuilder().from('risks').build();
    expect(sql).toBe('SELECT * FROM risks');
  });

  it('SELECT * FROM risks #29', () => {
    const sql = createQueryBuilder().from('risks').build();
    expect(sql).toBe('SELECT * FROM risks');
  });

  it('SELECT * FROM risks #30', () => {
    const sql = createQueryBuilder().from('risks').build();
    expect(sql).toBe('SELECT * FROM risks');
  });

  it('SELECT id, name columns #1', () => {
    const sql = createQueryBuilder().from('items').select('id', 'name').build();
    expect(sql).toContain('id, name');
  });

  it('SELECT id, name columns #2', () => {
    const sql = createQueryBuilder().from('items').select('id', 'name').build();
    expect(sql).toContain('id, name');
  });

  it('SELECT id, name columns #3', () => {
    const sql = createQueryBuilder().from('items').select('id', 'name').build();
    expect(sql).toContain('id, name');
  });

  it('SELECT id, name columns #4', () => {
    const sql = createQueryBuilder().from('items').select('id', 'name').build();
    expect(sql).toContain('id, name');
  });

  it('SELECT id, name columns #5', () => {
    const sql = createQueryBuilder().from('items').select('id', 'name').build();
    expect(sql).toContain('id, name');
  });

  it('SELECT id, name columns #6', () => {
    const sql = createQueryBuilder().from('items').select('id', 'name').build();
    expect(sql).toContain('id, name');
  });

  it('SELECT id, name columns #7', () => {
    const sql = createQueryBuilder().from('items').select('id', 'name').build();
    expect(sql).toContain('id, name');
  });

  it('SELECT id, name columns #8', () => {
    const sql = createQueryBuilder().from('items').select('id', 'name').build();
    expect(sql).toContain('id, name');
  });

  it('SELECT id, name columns #9', () => {
    const sql = createQueryBuilder().from('items').select('id', 'name').build();
    expect(sql).toContain('id, name');
  });

  it('SELECT id, name columns #10', () => {
    const sql = createQueryBuilder().from('items').select('id', 'name').build();
    expect(sql).toContain('id, name');
  });

  it('SELECT email, role columns #11', () => {
    const sql = createQueryBuilder().from('items').select('email', 'role').build();
    expect(sql).toContain('email, role');
  });

  it('SELECT email, role columns #12', () => {
    const sql = createQueryBuilder().from('items').select('email', 'role').build();
    expect(sql).toContain('email, role');
  });

  it('SELECT email, role columns #13', () => {
    const sql = createQueryBuilder().from('items').select('email', 'role').build();
    expect(sql).toContain('email, role');
  });

  it('SELECT email, role columns #14', () => {
    const sql = createQueryBuilder().from('items').select('email', 'role').build();
    expect(sql).toContain('email, role');
  });

  it('SELECT email, role columns #15', () => {
    const sql = createQueryBuilder().from('items').select('email', 'role').build();
    expect(sql).toContain('email, role');
  });

  it('SELECT email, role columns #16', () => {
    const sql = createQueryBuilder().from('items').select('email', 'role').build();
    expect(sql).toContain('email, role');
  });

  it('SELECT email, role columns #17', () => {
    const sql = createQueryBuilder().from('items').select('email', 'role').build();
    expect(sql).toContain('email, role');
  });

  it('SELECT email, role columns #18', () => {
    const sql = createQueryBuilder().from('items').select('email', 'role').build();
    expect(sql).toContain('email, role');
  });

  it('SELECT email, role columns #19', () => {
    const sql = createQueryBuilder().from('items').select('email', 'role').build();
    expect(sql).toContain('email, role');
  });

  it('SELECT email, role columns #20', () => {
    const sql = createQueryBuilder().from('items').select('email', 'role').build();
    expect(sql).toContain('email, role');
  });

  it('SELECT title, status columns #21', () => {
    const sql = createQueryBuilder().from('items').select('title', 'status').build();
    expect(sql).toContain('title, status');
  });

  it('SELECT title, status columns #22', () => {
    const sql = createQueryBuilder().from('items').select('title', 'status').build();
    expect(sql).toContain('title, status');
  });

  it('SELECT title, status columns #23', () => {
    const sql = createQueryBuilder().from('items').select('title', 'status').build();
    expect(sql).toContain('title, status');
  });

  it('SELECT title, status columns #24', () => {
    const sql = createQueryBuilder().from('items').select('title', 'status').build();
    expect(sql).toContain('title, status');
  });

  it('SELECT title, status columns #25', () => {
    const sql = createQueryBuilder().from('items').select('title', 'status').build();
    expect(sql).toContain('title, status');
  });

  it('SELECT title, status columns #26', () => {
    const sql = createQueryBuilder().from('items').select('title', 'status').build();
    expect(sql).toContain('title, status');
  });

  it('SELECT title, status columns #27', () => {
    const sql = createQueryBuilder().from('items').select('title', 'status').build();
    expect(sql).toContain('title, status');
  });

  it('SELECT title, status columns #28', () => {
    const sql = createQueryBuilder().from('items').select('title', 'status').build();
    expect(sql).toContain('title, status');
  });

  it('SELECT title, status columns #29', () => {
    const sql = createQueryBuilder().from('items').select('title', 'status').build();
    expect(sql).toContain('title, status');
  });

  it('SELECT title, status columns #30', () => {
    const sql = createQueryBuilder().from('items').select('title', 'status').build();
    expect(sql).toContain('title, status');
  });

  it('SELECT created_at columns #31', () => {
    const sql = createQueryBuilder().from('items').select('created_at').build();
    expect(sql).toContain('created_at');
  });

  it('SELECT created_at columns #32', () => {
    const sql = createQueryBuilder().from('items').select('created_at').build();
    expect(sql).toContain('created_at');
  });

  it('SELECT created_at columns #33', () => {
    const sql = createQueryBuilder().from('items').select('created_at').build();
    expect(sql).toContain('created_at');
  });

  it('SELECT created_at columns #34', () => {
    const sql = createQueryBuilder().from('items').select('created_at').build();
    expect(sql).toContain('created_at');
  });

  it('SELECT created_at columns #35', () => {
    const sql = createQueryBuilder().from('items').select('created_at').build();
    expect(sql).toContain('created_at');
  });

  it('SELECT created_at columns #36', () => {
    const sql = createQueryBuilder().from('items').select('created_at').build();
    expect(sql).toContain('created_at');
  });

  it('SELECT created_at columns #37', () => {
    const sql = createQueryBuilder().from('items').select('created_at').build();
    expect(sql).toContain('created_at');
  });

  it('SELECT created_at columns #38', () => {
    const sql = createQueryBuilder().from('items').select('created_at').build();
    expect(sql).toContain('created_at');
  });

  it('SELECT created_at columns #39', () => {
    const sql = createQueryBuilder().from('items').select('created_at').build();
    expect(sql).toContain('created_at');
  });

  it('SELECT created_at columns #40', () => {
    const sql = createQueryBuilder().from('items').select('created_at').build();
    expect(sql).toContain('created_at');
  });

  it('WHERE id = 1 #1', () => {
    const sql = createQueryBuilder().from('tbl').where("id = 1").build();
    expect(sql).toContain("WHERE id = 1");
  });

  it('WHERE id = 1 #2', () => {
    const sql = createQueryBuilder().from('tbl').where("id = 1").build();
    expect(sql).toContain("WHERE id = 1");
  });

  it('WHERE id = 1 #3', () => {
    const sql = createQueryBuilder().from('tbl').where("id = 1").build();
    expect(sql).toContain("WHERE id = 1");
  });

  it('WHERE id = 1 #4', () => {
    const sql = createQueryBuilder().from('tbl').where("id = 1").build();
    expect(sql).toContain("WHERE id = 1");
  });

  it('WHERE id = 1 #5', () => {
    const sql = createQueryBuilder().from('tbl').where("id = 1").build();
    expect(sql).toContain("WHERE id = 1");
  });

  it('WHERE id = 1 #6', () => {
    const sql = createQueryBuilder().from('tbl').where("id = 1").build();
    expect(sql).toContain("WHERE id = 1");
  });

  it('WHERE id = 1 #7', () => {
    const sql = createQueryBuilder().from('tbl').where("id = 1").build();
    expect(sql).toContain("WHERE id = 1");
  });

  it('WHERE id = 1 #8', () => {
    const sql = createQueryBuilder().from('tbl').where("id = 1").build();
    expect(sql).toContain("WHERE id = 1");
  });

  it('WHERE id = 1 #9', () => {
    const sql = createQueryBuilder().from('tbl').where("id = 1").build();
    expect(sql).toContain("WHERE id = 1");
  });

  it('WHERE id = 1 #10', () => {
    const sql = createQueryBuilder().from('tbl').where("id = 1").build();
    expect(sql).toContain("WHERE id = 1");
  });

  it('WHERE status = active #11', () => {
    const sql = createQueryBuilder().from('tbl').where("status = 'active'").build();
    expect(sql).toContain("WHERE status = 'active'");
  });

  it('WHERE status = active #12', () => {
    const sql = createQueryBuilder().from('tbl').where("status = 'active'").build();
    expect(sql).toContain("WHERE status = 'active'");
  });

  it('WHERE status = active #13', () => {
    const sql = createQueryBuilder().from('tbl').where("status = 'active'").build();
    expect(sql).toContain("WHERE status = 'active'");
  });

  it('WHERE status = active #14', () => {
    const sql = createQueryBuilder().from('tbl').where("status = 'active'").build();
    expect(sql).toContain("WHERE status = 'active'");
  });

  it('WHERE status = active #15', () => {
    const sql = createQueryBuilder().from('tbl').where("status = 'active'").build();
    expect(sql).toContain("WHERE status = 'active'");
  });

  it('WHERE status = active #16', () => {
    const sql = createQueryBuilder().from('tbl').where("status = 'active'").build();
    expect(sql).toContain("WHERE status = 'active'");
  });

  it('WHERE status = active #17', () => {
    const sql = createQueryBuilder().from('tbl').where("status = 'active'").build();
    expect(sql).toContain("WHERE status = 'active'");
  });

  it('WHERE status = active #18', () => {
    const sql = createQueryBuilder().from('tbl').where("status = 'active'").build();
    expect(sql).toContain("WHERE status = 'active'");
  });

  it('WHERE status = active #19', () => {
    const sql = createQueryBuilder().from('tbl').where("status = 'active'").build();
    expect(sql).toContain("WHERE status = 'active'");
  });

  it('WHERE status = active #20', () => {
    const sql = createQueryBuilder().from('tbl').where("status = 'active'").build();
    expect(sql).toContain("WHERE status = 'active'");
  });

  it('WHERE age > 18 #21', () => {
    const sql = createQueryBuilder().from('tbl').where("age > 18").build();
    expect(sql).toContain("WHERE age > 18");
  });

  it('WHERE age > 18 #22', () => {
    const sql = createQueryBuilder().from('tbl').where("age > 18").build();
    expect(sql).toContain("WHERE age > 18");
  });

  it('WHERE age > 18 #23', () => {
    const sql = createQueryBuilder().from('tbl').where("age > 18").build();
    expect(sql).toContain("WHERE age > 18");
  });

  it('WHERE age > 18 #24', () => {
    const sql = createQueryBuilder().from('tbl').where("age > 18").build();
    expect(sql).toContain("WHERE age > 18");
  });

  it('WHERE age > 18 #25', () => {
    const sql = createQueryBuilder().from('tbl').where("age > 18").build();
    expect(sql).toContain("WHERE age > 18");
  });

  it('WHERE age > 18 #26', () => {
    const sql = createQueryBuilder().from('tbl').where("age > 18").build();
    expect(sql).toContain("WHERE age > 18");
  });

  it('WHERE age > 18 #27', () => {
    const sql = createQueryBuilder().from('tbl').where("age > 18").build();
    expect(sql).toContain("WHERE age > 18");
  });

  it('WHERE age > 18 #28', () => {
    const sql = createQueryBuilder().from('tbl').where("age > 18").build();
    expect(sql).toContain("WHERE age > 18");
  });

  it('WHERE age > 18 #29', () => {
    const sql = createQueryBuilder().from('tbl').where("age > 18").build();
    expect(sql).toContain("WHERE age > 18");
  });

  it('WHERE age > 18 #30', () => {
    const sql = createQueryBuilder().from('tbl').where("age > 18").build();
    expect(sql).toContain("WHERE age > 18");
  });

  it('WHERE deleted_at IS NULL #31', () => {
    const sql = createQueryBuilder().from('tbl').where("deleted_at IS NULL").build();
    expect(sql).toContain("WHERE deleted_at IS NULL");
  });

  it('WHERE deleted_at IS NULL #32', () => {
    const sql = createQueryBuilder().from('tbl').where("deleted_at IS NULL").build();
    expect(sql).toContain("WHERE deleted_at IS NULL");
  });

  it('WHERE deleted_at IS NULL #33', () => {
    const sql = createQueryBuilder().from('tbl').where("deleted_at IS NULL").build();
    expect(sql).toContain("WHERE deleted_at IS NULL");
  });

  it('WHERE deleted_at IS NULL #34', () => {
    const sql = createQueryBuilder().from('tbl').where("deleted_at IS NULL").build();
    expect(sql).toContain("WHERE deleted_at IS NULL");
  });

  it('WHERE deleted_at IS NULL #35', () => {
    const sql = createQueryBuilder().from('tbl').where("deleted_at IS NULL").build();
    expect(sql).toContain("WHERE deleted_at IS NULL");
  });

  it('WHERE deleted_at IS NULL #36', () => {
    const sql = createQueryBuilder().from('tbl').where("deleted_at IS NULL").build();
    expect(sql).toContain("WHERE deleted_at IS NULL");
  });

  it('WHERE deleted_at IS NULL #37', () => {
    const sql = createQueryBuilder().from('tbl').where("deleted_at IS NULL").build();
    expect(sql).toContain("WHERE deleted_at IS NULL");
  });

  it('WHERE deleted_at IS NULL #38', () => {
    const sql = createQueryBuilder().from('tbl').where("deleted_at IS NULL").build();
    expect(sql).toContain("WHERE deleted_at IS NULL");
  });

  it('WHERE deleted_at IS NULL #39', () => {
    const sql = createQueryBuilder().from('tbl').where("deleted_at IS NULL").build();
    expect(sql).toContain("WHERE deleted_at IS NULL");
  });

  it('WHERE deleted_at IS NULL #40', () => {
    const sql = createQueryBuilder().from('tbl').where("deleted_at IS NULL").build();
    expect(sql).toContain("WHERE deleted_at IS NULL");
  });

  it('ORDER BY name ASC #1', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('name').build();
    expect(sql).toContain('ORDER BY name ASC');
  });

  it('ORDER BY name ASC #2', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('name').build();
    expect(sql).toContain('ORDER BY name ASC');
  });

  it('ORDER BY name ASC #3', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('name').build();
    expect(sql).toContain('ORDER BY name ASC');
  });

  it('ORDER BY name ASC #4', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('name').build();
    expect(sql).toContain('ORDER BY name ASC');
  });

  it('ORDER BY name ASC #5', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('name').build();
    expect(sql).toContain('ORDER BY name ASC');
  });

  it('ORDER BY name DESC #1', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('name', 'DESC').build();
    expect(sql).toContain('ORDER BY name DESC');
  });

  it('ORDER BY name DESC #2', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('name', 'DESC').build();
    expect(sql).toContain('ORDER BY name DESC');
  });

  it('ORDER BY name DESC #3', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('name', 'DESC').build();
    expect(sql).toContain('ORDER BY name DESC');
  });

  it('ORDER BY name DESC #4', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('name', 'DESC').build();
    expect(sql).toContain('ORDER BY name DESC');
  });

  it('ORDER BY name DESC #5', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('name', 'DESC').build();
    expect(sql).toContain('ORDER BY name DESC');
  });

  it('ORDER BY created_at ASC #6', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('created_at').build();
    expect(sql).toContain('ORDER BY created_at ASC');
  });

  it('ORDER BY created_at ASC #7', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('created_at').build();
    expect(sql).toContain('ORDER BY created_at ASC');
  });

  it('ORDER BY created_at ASC #8', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('created_at').build();
    expect(sql).toContain('ORDER BY created_at ASC');
  });

  it('ORDER BY created_at ASC #9', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('created_at').build();
    expect(sql).toContain('ORDER BY created_at ASC');
  });

  it('ORDER BY created_at ASC #10', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('created_at').build();
    expect(sql).toContain('ORDER BY created_at ASC');
  });

  it('ORDER BY created_at DESC #6', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('created_at', 'DESC').build();
    expect(sql).toContain('ORDER BY created_at DESC');
  });

  it('ORDER BY created_at DESC #7', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('created_at', 'DESC').build();
    expect(sql).toContain('ORDER BY created_at DESC');
  });

  it('ORDER BY created_at DESC #8', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('created_at', 'DESC').build();
    expect(sql).toContain('ORDER BY created_at DESC');
  });

  it('ORDER BY created_at DESC #9', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('created_at', 'DESC').build();
    expect(sql).toContain('ORDER BY created_at DESC');
  });

  it('ORDER BY created_at DESC #10', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('created_at', 'DESC').build();
    expect(sql).toContain('ORDER BY created_at DESC');
  });

  it('ORDER BY score ASC #11', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('score').build();
    expect(sql).toContain('ORDER BY score ASC');
  });

  it('ORDER BY score ASC #12', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('score').build();
    expect(sql).toContain('ORDER BY score ASC');
  });

  it('ORDER BY score ASC #13', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('score').build();
    expect(sql).toContain('ORDER BY score ASC');
  });

  it('ORDER BY score ASC #14', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('score').build();
    expect(sql).toContain('ORDER BY score ASC');
  });

  it('ORDER BY score ASC #15', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('score').build();
    expect(sql).toContain('ORDER BY score ASC');
  });

  it('ORDER BY score DESC #11', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('score', 'DESC').build();
    expect(sql).toContain('ORDER BY score DESC');
  });

  it('ORDER BY score DESC #12', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('score', 'DESC').build();
    expect(sql).toContain('ORDER BY score DESC');
  });

  it('ORDER BY score DESC #13', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('score', 'DESC').build();
    expect(sql).toContain('ORDER BY score DESC');
  });

  it('ORDER BY score DESC #14', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('score', 'DESC').build();
    expect(sql).toContain('ORDER BY score DESC');
  });

  it('ORDER BY score DESC #15', () => {
    const sql = createQueryBuilder().from('tbl').orderBy('score', 'DESC').build();
    expect(sql).toContain('ORDER BY score DESC');
  });

  it('LIMIT 5 appended #1', () => {
    const sql = createQueryBuilder().from('tbl').limit(5).build();
    expect(sql).toContain('LIMIT 5');
  });

  it('LIMIT 10 appended #2', () => {
    const sql = createQueryBuilder().from('tbl').limit(10).build();
    expect(sql).toContain('LIMIT 10');
  });

  it('LIMIT 15 appended #3', () => {
    const sql = createQueryBuilder().from('tbl').limit(15).build();
    expect(sql).toContain('LIMIT 15');
  });

  it('LIMIT 20 appended #4', () => {
    const sql = createQueryBuilder().from('tbl').limit(20).build();
    expect(sql).toContain('LIMIT 20');
  });

  it('LIMIT 25 appended #5', () => {
    const sql = createQueryBuilder().from('tbl').limit(25).build();
    expect(sql).toContain('LIMIT 25');
  });

  it('LIMIT 30 appended #6', () => {
    const sql = createQueryBuilder().from('tbl').limit(30).build();
    expect(sql).toContain('LIMIT 30');
  });

  it('LIMIT 35 appended #7', () => {
    const sql = createQueryBuilder().from('tbl').limit(35).build();
    expect(sql).toContain('LIMIT 35');
  });

  it('LIMIT 40 appended #8', () => {
    const sql = createQueryBuilder().from('tbl').limit(40).build();
    expect(sql).toContain('LIMIT 40');
  });

  it('LIMIT 45 appended #9', () => {
    const sql = createQueryBuilder().from('tbl').limit(45).build();
    expect(sql).toContain('LIMIT 45');
  });

  it('LIMIT 50 appended #10', () => {
    const sql = createQueryBuilder().from('tbl').limit(50).build();
    expect(sql).toContain('LIMIT 50');
  });

  it('LIMIT 55 appended #11', () => {
    const sql = createQueryBuilder().from('tbl').limit(55).build();
    expect(sql).toContain('LIMIT 55');
  });

  it('LIMIT 60 appended #12', () => {
    const sql = createQueryBuilder().from('tbl').limit(60).build();
    expect(sql).toContain('LIMIT 60');
  });

  it('LIMIT 65 appended #13', () => {
    const sql = createQueryBuilder().from('tbl').limit(65).build();
    expect(sql).toContain('LIMIT 65');
  });

  it('LIMIT 70 appended #14', () => {
    const sql = createQueryBuilder().from('tbl').limit(70).build();
    expect(sql).toContain('LIMIT 70');
  });

  it('LIMIT 75 appended #15', () => {
    const sql = createQueryBuilder().from('tbl').limit(75).build();
    expect(sql).toContain('LIMIT 75');
  });

  it('OFFSET 0 appended #1', () => {
    const sql = createQueryBuilder().from('tbl').offset(0).build();
    expect(sql).toContain('OFFSET 0');
  });

  it('OFFSET 10 appended #2', () => {
    const sql = createQueryBuilder().from('tbl').offset(10).build();
    expect(sql).toContain('OFFSET 10');
  });

  it('OFFSET 20 appended #3', () => {
    const sql = createQueryBuilder().from('tbl').offset(20).build();
    expect(sql).toContain('OFFSET 20');
  });

  it('OFFSET 30 appended #4', () => {
    const sql = createQueryBuilder().from('tbl').offset(30).build();
    expect(sql).toContain('OFFSET 30');
  });

  it('OFFSET 40 appended #5', () => {
    const sql = createQueryBuilder().from('tbl').offset(40).build();
    expect(sql).toContain('OFFSET 40');
  });

  it('OFFSET 50 appended #6', () => {
    const sql = createQueryBuilder().from('tbl').offset(50).build();
    expect(sql).toContain('OFFSET 50');
  });

  it('OFFSET 60 appended #7', () => {
    const sql = createQueryBuilder().from('tbl').offset(60).build();
    expect(sql).toContain('OFFSET 60');
  });

  it('OFFSET 70 appended #8', () => {
    const sql = createQueryBuilder().from('tbl').offset(70).build();
    expect(sql).toContain('OFFSET 70');
  });

  it('OFFSET 80 appended #9', () => {
    const sql = createQueryBuilder().from('tbl').offset(80).build();
    expect(sql).toContain('OFFSET 80');
  });

  it('OFFSET 90 appended #10', () => {
    const sql = createQueryBuilder().from('tbl').offset(90).build();
    expect(sql).toContain('OFFSET 90');
  });

  it('OFFSET 100 appended #11', () => {
    const sql = createQueryBuilder().from('tbl').offset(100).build();
    expect(sql).toContain('OFFSET 100');
  });

  it('OFFSET 110 appended #12', () => {
    const sql = createQueryBuilder().from('tbl').offset(110).build();
    expect(sql).toContain('OFFSET 110');
  });

  it('OFFSET 120 appended #13', () => {
    const sql = createQueryBuilder().from('tbl').offset(120).build();
    expect(sql).toContain('OFFSET 120');
  });

  it('OFFSET 130 appended #14', () => {
    const sql = createQueryBuilder().from('tbl').offset(130).build();
    expect(sql).toContain('OFFSET 130');
  });

  it('OFFSET 140 appended #15', () => {
    const sql = createQueryBuilder().from('tbl').offset(140).build();
    expect(sql).toContain('OFFSET 140');
  });

  it('combined query #1', () => {
    const sql = createQueryBuilder()
      .from('table1')
      .select('id', 'name')
      .where('id = 1')
      .orderBy('name', 'ASC')
      .limit(5)
      .offset(2)
      .build();
    expect(sql).toContain('SELECT id, name FROM table1');
    expect(sql).toContain('WHERE id = 1');
    expect(sql).toContain('LIMIT 5');
    expect(sql).toContain('OFFSET 2');
  });

  it('combined query #2', () => {
    const sql = createQueryBuilder()
      .from('table2')
      .select('id', 'name')
      .where('id = 2')
      .orderBy('name', 'ASC')
      .limit(10)
      .offset(4)
      .build();
    expect(sql).toContain('SELECT id, name FROM table2');
    expect(sql).toContain('WHERE id = 2');
    expect(sql).toContain('LIMIT 10');
    expect(sql).toContain('OFFSET 4');
  });

  it('combined query #3', () => {
    const sql = createQueryBuilder()
      .from('table3')
      .select('id', 'name')
      .where('id = 3')
      .orderBy('name', 'ASC')
      .limit(15)
      .offset(6)
      .build();
    expect(sql).toContain('SELECT id, name FROM table3');
    expect(sql).toContain('WHERE id = 3');
    expect(sql).toContain('LIMIT 15');
    expect(sql).toContain('OFFSET 6');
  });

  it('combined query #4', () => {
    const sql = createQueryBuilder()
      .from('table4')
      .select('id', 'name')
      .where('id = 4')
      .orderBy('name', 'ASC')
      .limit(20)
      .offset(8)
      .build();
    expect(sql).toContain('SELECT id, name FROM table4');
    expect(sql).toContain('WHERE id = 4');
    expect(sql).toContain('LIMIT 20');
    expect(sql).toContain('OFFSET 8');
  });

  it('combined query #5', () => {
    const sql = createQueryBuilder()
      .from('table5')
      .select('id', 'name')
      .where('id = 5')
      .orderBy('name', 'ASC')
      .limit(25)
      .offset(10)
      .build();
    expect(sql).toContain('SELECT id, name FROM table5');
    expect(sql).toContain('WHERE id = 5');
    expect(sql).toContain('LIMIT 25');
    expect(sql).toContain('OFFSET 10');
  });

  it('combined query #6', () => {
    const sql = createQueryBuilder()
      .from('table6')
      .select('id', 'name')
      .where('id = 6')
      .orderBy('name', 'ASC')
      .limit(30)
      .offset(12)
      .build();
    expect(sql).toContain('SELECT id, name FROM table6');
    expect(sql).toContain('WHERE id = 6');
    expect(sql).toContain('LIMIT 30');
    expect(sql).toContain('OFFSET 12');
  });

  it('combined query #7', () => {
    const sql = createQueryBuilder()
      .from('table7')
      .select('id', 'name')
      .where('id = 7')
      .orderBy('name', 'ASC')
      .limit(35)
      .offset(14)
      .build();
    expect(sql).toContain('SELECT id, name FROM table7');
    expect(sql).toContain('WHERE id = 7');
    expect(sql).toContain('LIMIT 35');
    expect(sql).toContain('OFFSET 14');
  });

  it('combined query #8', () => {
    const sql = createQueryBuilder()
      .from('table8')
      .select('id', 'name')
      .where('id = 8')
      .orderBy('name', 'ASC')
      .limit(40)
      .offset(16)
      .build();
    expect(sql).toContain('SELECT id, name FROM table8');
    expect(sql).toContain('WHERE id = 8');
    expect(sql).toContain('LIMIT 40');
    expect(sql).toContain('OFFSET 16');
  });

  it('combined query #9', () => {
    const sql = createQueryBuilder()
      .from('table9')
      .select('id', 'name')
      .where('id = 9')
      .orderBy('name', 'ASC')
      .limit(45)
      .offset(18)
      .build();
    expect(sql).toContain('SELECT id, name FROM table9');
    expect(sql).toContain('WHERE id = 9');
    expect(sql).toContain('LIMIT 45');
    expect(sql).toContain('OFFSET 18');
  });

  it('combined query #10', () => {
    const sql = createQueryBuilder()
      .from('table10')
      .select('id', 'name')
      .where('id = 10')
      .orderBy('name', 'ASC')
      .limit(50)
      .offset(20)
      .build();
    expect(sql).toContain('SELECT id, name FROM table10');
    expect(sql).toContain('WHERE id = 10');
    expect(sql).toContain('LIMIT 50');
    expect(sql).toContain('OFFSET 20');
  });

  it('combined query #11', () => {
    const sql = createQueryBuilder()
      .from('table11')
      .select('id', 'name')
      .where('id = 11')
      .orderBy('name', 'ASC')
      .limit(55)
      .offset(22)
      .build();
    expect(sql).toContain('SELECT id, name FROM table11');
    expect(sql).toContain('WHERE id = 11');
    expect(sql).toContain('LIMIT 55');
    expect(sql).toContain('OFFSET 22');
  });

  it('combined query #12', () => {
    const sql = createQueryBuilder()
      .from('table12')
      .select('id', 'name')
      .where('id = 12')
      .orderBy('name', 'ASC')
      .limit(60)
      .offset(24)
      .build();
    expect(sql).toContain('SELECT id, name FROM table12');
    expect(sql).toContain('WHERE id = 12');
    expect(sql).toContain('LIMIT 60');
    expect(sql).toContain('OFFSET 24');
  });

  it('combined query #13', () => {
    const sql = createQueryBuilder()
      .from('table13')
      .select('id', 'name')
      .where('id = 13')
      .orderBy('name', 'ASC')
      .limit(65)
      .offset(26)
      .build();
    expect(sql).toContain('SELECT id, name FROM table13');
    expect(sql).toContain('WHERE id = 13');
    expect(sql).toContain('LIMIT 65');
    expect(sql).toContain('OFFSET 26');
  });

  it('combined query #14', () => {
    const sql = createQueryBuilder()
      .from('table14')
      .select('id', 'name')
      .where('id = 14')
      .orderBy('name', 'ASC')
      .limit(70)
      .offset(28)
      .build();
    expect(sql).toContain('SELECT id, name FROM table14');
    expect(sql).toContain('WHERE id = 14');
    expect(sql).toContain('LIMIT 70');
    expect(sql).toContain('OFFSET 28');
  });

  it('combined query #15', () => {
    const sql = createQueryBuilder()
      .from('table15')
      .select('id', 'name')
      .where('id = 15')
      .orderBy('name', 'ASC')
      .limit(75)
      .offset(30)
      .build();
    expect(sql).toContain('SELECT id, name FROM table15');
    expect(sql).toContain('WHERE id = 15');
    expect(sql).toContain('LIMIT 75');
    expect(sql).toContain('OFFSET 30');
  });

  it('combined query #16', () => {
    const sql = createQueryBuilder()
      .from('table16')
      .select('id', 'name')
      .where('id = 16')
      .orderBy('name', 'ASC')
      .limit(80)
      .offset(32)
      .build();
    expect(sql).toContain('SELECT id, name FROM table16');
    expect(sql).toContain('WHERE id = 16');
    expect(sql).toContain('LIMIT 80');
    expect(sql).toContain('OFFSET 32');
  });

  it('combined query #17', () => {
    const sql = createQueryBuilder()
      .from('table17')
      .select('id', 'name')
      .where('id = 17')
      .orderBy('name', 'ASC')
      .limit(85)
      .offset(34)
      .build();
    expect(sql).toContain('SELECT id, name FROM table17');
    expect(sql).toContain('WHERE id = 17');
    expect(sql).toContain('LIMIT 85');
    expect(sql).toContain('OFFSET 34');
  });

  it('combined query #18', () => {
    const sql = createQueryBuilder()
      .from('table18')
      .select('id', 'name')
      .where('id = 18')
      .orderBy('name', 'ASC')
      .limit(90)
      .offset(36)
      .build();
    expect(sql).toContain('SELECT id, name FROM table18');
    expect(sql).toContain('WHERE id = 18');
    expect(sql).toContain('LIMIT 90');
    expect(sql).toContain('OFFSET 36');
  });

  it('combined query #19', () => {
    const sql = createQueryBuilder()
      .from('table19')
      .select('id', 'name')
      .where('id = 19')
      .orderBy('name', 'ASC')
      .limit(95)
      .offset(38)
      .build();
    expect(sql).toContain('SELECT id, name FROM table19');
    expect(sql).toContain('WHERE id = 19');
    expect(sql).toContain('LIMIT 95');
    expect(sql).toContain('OFFSET 38');
  });

  it('combined query #20', () => {
    const sql = createQueryBuilder()
      .from('table20')
      .select('id', 'name')
      .where('id = 20')
      .orderBy('name', 'ASC')
      .limit(100)
      .offset(40)
      .build();
    expect(sql).toContain('SELECT id, name FROM table20');
    expect(sql).toContain('WHERE id = 20');
    expect(sql).toContain('LIMIT 100');
    expect(sql).toContain('OFFSET 40');
  });

  it('combined query #21', () => {
    const sql = createQueryBuilder()
      .from('table21')
      .select('id', 'name')
      .where('id = 21')
      .orderBy('name', 'ASC')
      .limit(105)
      .offset(42)
      .build();
    expect(sql).toContain('SELECT id, name FROM table21');
    expect(sql).toContain('WHERE id = 21');
    expect(sql).toContain('LIMIT 105');
    expect(sql).toContain('OFFSET 42');
  });

  it('combined query #22', () => {
    const sql = createQueryBuilder()
      .from('table22')
      .select('id', 'name')
      .where('id = 22')
      .orderBy('name', 'ASC')
      .limit(110)
      .offset(44)
      .build();
    expect(sql).toContain('SELECT id, name FROM table22');
    expect(sql).toContain('WHERE id = 22');
    expect(sql).toContain('LIMIT 110');
    expect(sql).toContain('OFFSET 44');
  });

  it('combined query #23', () => {
    const sql = createQueryBuilder()
      .from('table23')
      .select('id', 'name')
      .where('id = 23')
      .orderBy('name', 'ASC')
      .limit(115)
      .offset(46)
      .build();
    expect(sql).toContain('SELECT id, name FROM table23');
    expect(sql).toContain('WHERE id = 23');
    expect(sql).toContain('LIMIT 115');
    expect(sql).toContain('OFFSET 46');
  });

  it('combined query #24', () => {
    const sql = createQueryBuilder()
      .from('table24')
      .select('id', 'name')
      .where('id = 24')
      .orderBy('name', 'ASC')
      .limit(120)
      .offset(48)
      .build();
    expect(sql).toContain('SELECT id, name FROM table24');
    expect(sql).toContain('WHERE id = 24');
    expect(sql).toContain('LIMIT 120');
    expect(sql).toContain('OFFSET 48');
  });

  it('combined query #25', () => {
    const sql = createQueryBuilder()
      .from('table25')
      .select('id', 'name')
      .where('id = 25')
      .orderBy('name', 'ASC')
      .limit(125)
      .offset(50)
      .build();
    expect(sql).toContain('SELECT id, name FROM table25');
    expect(sql).toContain('WHERE id = 25');
    expect(sql).toContain('LIMIT 125');
    expect(sql).toContain('OFFSET 50');
  });

  it('combined query #26', () => {
    const sql = createQueryBuilder()
      .from('table26')
      .select('id', 'name')
      .where('id = 26')
      .orderBy('name', 'ASC')
      .limit(130)
      .offset(52)
      .build();
    expect(sql).toContain('SELECT id, name FROM table26');
    expect(sql).toContain('WHERE id = 26');
    expect(sql).toContain('LIMIT 130');
    expect(sql).toContain('OFFSET 52');
  });

  it('combined query #27', () => {
    const sql = createQueryBuilder()
      .from('table27')
      .select('id', 'name')
      .where('id = 27')
      .orderBy('name', 'ASC')
      .limit(135)
      .offset(54)
      .build();
    expect(sql).toContain('SELECT id, name FROM table27');
    expect(sql).toContain('WHERE id = 27');
    expect(sql).toContain('LIMIT 135');
    expect(sql).toContain('OFFSET 54');
  });

  it('combined query #28', () => {
    const sql = createQueryBuilder()
      .from('table28')
      .select('id', 'name')
      .where('id = 28')
      .orderBy('name', 'ASC')
      .limit(140)
      .offset(56)
      .build();
    expect(sql).toContain('SELECT id, name FROM table28');
    expect(sql).toContain('WHERE id = 28');
    expect(sql).toContain('LIMIT 140');
    expect(sql).toContain('OFFSET 56');
  });

  it('combined query #29', () => {
    const sql = createQueryBuilder()
      .from('table29')
      .select('id', 'name')
      .where('id = 29')
      .orderBy('name', 'ASC')
      .limit(145)
      .offset(58)
      .build();
    expect(sql).toContain('SELECT id, name FROM table29');
    expect(sql).toContain('WHERE id = 29');
    expect(sql).toContain('LIMIT 145');
    expect(sql).toContain('OFFSET 58');
  });

  it('combined query #30', () => {
    const sql = createQueryBuilder()
      .from('table30')
      .select('id', 'name')
      .where('id = 30')
      .orderBy('name', 'ASC')
      .limit(150)
      .offset(60)
      .build();
    expect(sql).toContain('SELECT id, name FROM table30');
    expect(sql).toContain('WHERE id = 30');
    expect(sql).toContain('LIMIT 150');
    expect(sql).toContain('OFFSET 60');
  });

});

// ─── Section 5: ElementBuilder ───────────────────────────────────────────────
describe('createElementBuilder', () => {
  it('tag div produces correct open/close #1', () => {
    const html = createElementBuilder().tag('div').build();
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('tag div produces correct open/close #2', () => {
    const html = createElementBuilder().tag('div').build();
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('tag div produces correct open/close #3', () => {
    const html = createElementBuilder().tag('div').build();
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('tag div produces correct open/close #4', () => {
    const html = createElementBuilder().tag('div').build();
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('tag div produces correct open/close #5', () => {
    const html = createElementBuilder().tag('div').build();
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('tag span produces correct open/close #6', () => {
    const html = createElementBuilder().tag('span').build();
    expect(html).toContain('<span');
    expect(html).toContain('</span>');
  });

  it('tag span produces correct open/close #7', () => {
    const html = createElementBuilder().tag('span').build();
    expect(html).toContain('<span');
    expect(html).toContain('</span>');
  });

  it('tag span produces correct open/close #8', () => {
    const html = createElementBuilder().tag('span').build();
    expect(html).toContain('<span');
    expect(html).toContain('</span>');
  });

  it('tag span produces correct open/close #9', () => {
    const html = createElementBuilder().tag('span').build();
    expect(html).toContain('<span');
    expect(html).toContain('</span>');
  });

  it('tag span produces correct open/close #10', () => {
    const html = createElementBuilder().tag('span').build();
    expect(html).toContain('<span');
    expect(html).toContain('</span>');
  });

  it('tag p produces correct open/close #11', () => {
    const html = createElementBuilder().tag('p').build();
    expect(html).toContain('<p');
    expect(html).toContain('</p>');
  });

  it('tag p produces correct open/close #12', () => {
    const html = createElementBuilder().tag('p').build();
    expect(html).toContain('<p');
    expect(html).toContain('</p>');
  });

  it('tag p produces correct open/close #13', () => {
    const html = createElementBuilder().tag('p').build();
    expect(html).toContain('<p');
    expect(html).toContain('</p>');
  });

  it('tag p produces correct open/close #14', () => {
    const html = createElementBuilder().tag('p').build();
    expect(html).toContain('<p');
    expect(html).toContain('</p>');
  });

  it('tag p produces correct open/close #15', () => {
    const html = createElementBuilder().tag('p').build();
    expect(html).toContain('<p');
    expect(html).toContain('</p>');
  });

  it('tag h1 produces correct open/close #16', () => {
    const html = createElementBuilder().tag('h1').build();
    expect(html).toContain('<h1');
    expect(html).toContain('</h1>');
  });

  it('tag h1 produces correct open/close #17', () => {
    const html = createElementBuilder().tag('h1').build();
    expect(html).toContain('<h1');
    expect(html).toContain('</h1>');
  });

  it('tag h1 produces correct open/close #18', () => {
    const html = createElementBuilder().tag('h1').build();
    expect(html).toContain('<h1');
    expect(html).toContain('</h1>');
  });

  it('tag h1 produces correct open/close #19', () => {
    const html = createElementBuilder().tag('h1').build();
    expect(html).toContain('<h1');
    expect(html).toContain('</h1>');
  });

  it('tag h1 produces correct open/close #20', () => {
    const html = createElementBuilder().tag('h1').build();
    expect(html).toContain('<h1');
    expect(html).toContain('</h1>');
  });

  it('tag section produces correct open/close #21', () => {
    const html = createElementBuilder().tag('section').build();
    expect(html).toContain('<section');
    expect(html).toContain('</section>');
  });

  it('tag section produces correct open/close #22', () => {
    const html = createElementBuilder().tag('section').build();
    expect(html).toContain('<section');
    expect(html).toContain('</section>');
  });

  it('tag section produces correct open/close #23', () => {
    const html = createElementBuilder().tag('section').build();
    expect(html).toContain('<section');
    expect(html).toContain('</section>');
  });

  it('tag section produces correct open/close #24', () => {
    const html = createElementBuilder().tag('section').build();
    expect(html).toContain('<section');
    expect(html).toContain('</section>');
  });

  it('tag section produces correct open/close #25', () => {
    const html = createElementBuilder().tag('section').build();
    expect(html).toContain('<section');
    expect(html).toContain('</section>');
  });

  it('tag article produces correct open/close #26', () => {
    const html = createElementBuilder().tag('article').build();
    expect(html).toContain('<article');
    expect(html).toContain('</article>');
  });

  it('tag article produces correct open/close #27', () => {
    const html = createElementBuilder().tag('article').build();
    expect(html).toContain('<article');
    expect(html).toContain('</article>');
  });

  it('tag article produces correct open/close #28', () => {
    const html = createElementBuilder().tag('article').build();
    expect(html).toContain('<article');
    expect(html).toContain('</article>');
  });

  it('tag article produces correct open/close #29', () => {
    const html = createElementBuilder().tag('article').build();
    expect(html).toContain('<article');
    expect(html).toContain('</article>');
  });

  it('tag article produces correct open/close #30', () => {
    const html = createElementBuilder().tag('article').build();
    expect(html).toContain('<article');
    expect(html).toContain('</article>');
  });

  it('attr id rendered correctly #1', () => {
    const html = createElementBuilder().tag('div').attr('id', 'main').build();
    expect(html).toContain('id="main"');
  });

  it('attr id rendered correctly #2', () => {
    const html = createElementBuilder().tag('div').attr('id', 'main').build();
    expect(html).toContain('id="main"');
  });

  it('attr id rendered correctly #3', () => {
    const html = createElementBuilder().tag('div').attr('id', 'main').build();
    expect(html).toContain('id="main"');
  });

  it('attr id rendered correctly #4', () => {
    const html = createElementBuilder().tag('div').attr('id', 'main').build();
    expect(html).toContain('id="main"');
  });

  it('attr id rendered correctly #5', () => {
    const html = createElementBuilder().tag('div').attr('id', 'main').build();
    expect(html).toContain('id="main"');
  });

  it('attr id rendered correctly #6', () => {
    const html = createElementBuilder().tag('div').attr('id', 'main').build();
    expect(html).toContain('id="main"');
  });

  it('attr id rendered correctly #7', () => {
    const html = createElementBuilder().tag('div').attr('id', 'main').build();
    expect(html).toContain('id="main"');
  });

  it('attr id rendered correctly #8', () => {
    const html = createElementBuilder().tag('div').attr('id', 'main').build();
    expect(html).toContain('id="main"');
  });

  it('attr id rendered correctly #9', () => {
    const html = createElementBuilder().tag('div').attr('id', 'main').build();
    expect(html).toContain('id="main"');
  });

  it('attr id rendered correctly #10', () => {
    const html = createElementBuilder().tag('div').attr('id', 'main').build();
    expect(html).toContain('id="main"');
  });

  it('attr href rendered correctly #11', () => {
    const html = createElementBuilder().tag('div').attr('href', 'https://example.com').build();
    expect(html).toContain('href="https://example.com"');
  });

  it('attr href rendered correctly #12', () => {
    const html = createElementBuilder().tag('div').attr('href', 'https://example.com').build();
    expect(html).toContain('href="https://example.com"');
  });

  it('attr href rendered correctly #13', () => {
    const html = createElementBuilder().tag('div').attr('href', 'https://example.com').build();
    expect(html).toContain('href="https://example.com"');
  });

  it('attr href rendered correctly #14', () => {
    const html = createElementBuilder().tag('div').attr('href', 'https://example.com').build();
    expect(html).toContain('href="https://example.com"');
  });

  it('attr href rendered correctly #15', () => {
    const html = createElementBuilder().tag('div').attr('href', 'https://example.com').build();
    expect(html).toContain('href="https://example.com"');
  });

  it('attr href rendered correctly #16', () => {
    const html = createElementBuilder().tag('div').attr('href', 'https://example.com').build();
    expect(html).toContain('href="https://example.com"');
  });

  it('attr href rendered correctly #17', () => {
    const html = createElementBuilder().tag('div').attr('href', 'https://example.com').build();
    expect(html).toContain('href="https://example.com"');
  });

  it('attr href rendered correctly #18', () => {
    const html = createElementBuilder().tag('div').attr('href', 'https://example.com').build();
    expect(html).toContain('href="https://example.com"');
  });

  it('attr href rendered correctly #19', () => {
    const html = createElementBuilder().tag('div').attr('href', 'https://example.com').build();
    expect(html).toContain('href="https://example.com"');
  });

  it('attr href rendered correctly #20', () => {
    const html = createElementBuilder().tag('div').attr('href', 'https://example.com').build();
    expect(html).toContain('href="https://example.com"');
  });

  it('attr data-role rendered correctly #21', () => {
    const html = createElementBuilder().tag('div').attr('data-role', 'button').build();
    expect(html).toContain('data-role="button"');
  });

  it('attr data-role rendered correctly #22', () => {
    const html = createElementBuilder().tag('div').attr('data-role', 'button').build();
    expect(html).toContain('data-role="button"');
  });

  it('attr data-role rendered correctly #23', () => {
    const html = createElementBuilder().tag('div').attr('data-role', 'button').build();
    expect(html).toContain('data-role="button"');
  });

  it('attr data-role rendered correctly #24', () => {
    const html = createElementBuilder().tag('div').attr('data-role', 'button').build();
    expect(html).toContain('data-role="button"');
  });

  it('attr data-role rendered correctly #25', () => {
    const html = createElementBuilder().tag('div').attr('data-role', 'button').build();
    expect(html).toContain('data-role="button"');
  });

  it('attr data-role rendered correctly #26', () => {
    const html = createElementBuilder().tag('div').attr('data-role', 'button').build();
    expect(html).toContain('data-role="button"');
  });

  it('attr data-role rendered correctly #27', () => {
    const html = createElementBuilder().tag('div').attr('data-role', 'button').build();
    expect(html).toContain('data-role="button"');
  });

  it('attr data-role rendered correctly #28', () => {
    const html = createElementBuilder().tag('div').attr('data-role', 'button').build();
    expect(html).toContain('data-role="button"');
  });

  it('attr data-role rendered correctly #29', () => {
    const html = createElementBuilder().tag('div').attr('data-role', 'button').build();
    expect(html).toContain('data-role="button"');
  });

  it('attr data-role rendered correctly #30', () => {
    const html = createElementBuilder().tag('div').attr('data-role', 'button').build();
    expect(html).toContain('data-role="button"');
  });

  it('attr aria-label rendered correctly #31', () => {
    const html = createElementBuilder().tag('div').attr('aria-label', 'Close').build();
    expect(html).toContain('aria-label="Close"');
  });

  it('attr aria-label rendered correctly #32', () => {
    const html = createElementBuilder().tag('div').attr('aria-label', 'Close').build();
    expect(html).toContain('aria-label="Close"');
  });

  it('attr aria-label rendered correctly #33', () => {
    const html = createElementBuilder().tag('div').attr('aria-label', 'Close').build();
    expect(html).toContain('aria-label="Close"');
  });

  it('attr aria-label rendered correctly #34', () => {
    const html = createElementBuilder().tag('div').attr('aria-label', 'Close').build();
    expect(html).toContain('aria-label="Close"');
  });

  it('attr aria-label rendered correctly #35', () => {
    const html = createElementBuilder().tag('div').attr('aria-label', 'Close').build();
    expect(html).toContain('aria-label="Close"');
  });

  it('attr aria-label rendered correctly #36', () => {
    const html = createElementBuilder().tag('div').attr('aria-label', 'Close').build();
    expect(html).toContain('aria-label="Close"');
  });

  it('attr aria-label rendered correctly #37', () => {
    const html = createElementBuilder().tag('div').attr('aria-label', 'Close').build();
    expect(html).toContain('aria-label="Close"');
  });

  it('attr aria-label rendered correctly #38', () => {
    const html = createElementBuilder().tag('div').attr('aria-label', 'Close').build();
    expect(html).toContain('aria-label="Close"');
  });

  it('attr aria-label rendered correctly #39', () => {
    const html = createElementBuilder().tag('div').attr('aria-label', 'Close').build();
    expect(html).toContain('aria-label="Close"');
  });

  it('attr aria-label rendered correctly #40', () => {
    const html = createElementBuilder().tag('div').attr('aria-label', 'Close').build();
    expect(html).toContain('aria-label="Close"');
  });

  it('class btn btn-primary rendered correctly #1', () => {
    const html = createElementBuilder().tag('div').class_('btn', 'btn-primary').build();
    expect(html).toContain('class="btn btn-primary"');
  });

  it('class btn btn-primary rendered correctly #2', () => {
    const html = createElementBuilder().tag('div').class_('btn', 'btn-primary').build();
    expect(html).toContain('class="btn btn-primary"');
  });

  it('class btn btn-primary rendered correctly #3', () => {
    const html = createElementBuilder().tag('div').class_('btn', 'btn-primary').build();
    expect(html).toContain('class="btn btn-primary"');
  });

  it('class btn btn-primary rendered correctly #4', () => {
    const html = createElementBuilder().tag('div').class_('btn', 'btn-primary').build();
    expect(html).toContain('class="btn btn-primary"');
  });

  it('class btn btn-primary rendered correctly #5', () => {
    const html = createElementBuilder().tag('div').class_('btn', 'btn-primary').build();
    expect(html).toContain('class="btn btn-primary"');
  });

  it('class btn btn-primary rendered correctly #6', () => {
    const html = createElementBuilder().tag('div').class_('btn', 'btn-primary').build();
    expect(html).toContain('class="btn btn-primary"');
  });

  it('class btn btn-primary rendered correctly #7', () => {
    const html = createElementBuilder().tag('div').class_('btn', 'btn-primary').build();
    expect(html).toContain('class="btn btn-primary"');
  });

  it('class btn btn-primary rendered correctly #8', () => {
    const html = createElementBuilder().tag('div').class_('btn', 'btn-primary').build();
    expect(html).toContain('class="btn btn-primary"');
  });

  it('class btn btn-primary rendered correctly #9', () => {
    const html = createElementBuilder().tag('div').class_('btn', 'btn-primary').build();
    expect(html).toContain('class="btn btn-primary"');
  });

  it('class btn btn-primary rendered correctly #10', () => {
    const html = createElementBuilder().tag('div').class_('btn', 'btn-primary').build();
    expect(html).toContain('class="btn btn-primary"');
  });

  it('class card shadow rendered correctly #11', () => {
    const html = createElementBuilder().tag('div').class_('card', 'shadow').build();
    expect(html).toContain('class="card shadow"');
  });

  it('class card shadow rendered correctly #12', () => {
    const html = createElementBuilder().tag('div').class_('card', 'shadow').build();
    expect(html).toContain('class="card shadow"');
  });

  it('class card shadow rendered correctly #13', () => {
    const html = createElementBuilder().tag('div').class_('card', 'shadow').build();
    expect(html).toContain('class="card shadow"');
  });

  it('class card shadow rendered correctly #14', () => {
    const html = createElementBuilder().tag('div').class_('card', 'shadow').build();
    expect(html).toContain('class="card shadow"');
  });

  it('class card shadow rendered correctly #15', () => {
    const html = createElementBuilder().tag('div').class_('card', 'shadow').build();
    expect(html).toContain('class="card shadow"');
  });

  it('class card shadow rendered correctly #16', () => {
    const html = createElementBuilder().tag('div').class_('card', 'shadow').build();
    expect(html).toContain('class="card shadow"');
  });

  it('class card shadow rendered correctly #17', () => {
    const html = createElementBuilder().tag('div').class_('card', 'shadow').build();
    expect(html).toContain('class="card shadow"');
  });

  it('class card shadow rendered correctly #18', () => {
    const html = createElementBuilder().tag('div').class_('card', 'shadow').build();
    expect(html).toContain('class="card shadow"');
  });

  it('class card shadow rendered correctly #19', () => {
    const html = createElementBuilder().tag('div').class_('card', 'shadow').build();
    expect(html).toContain('class="card shadow"');
  });

  it('class card shadow rendered correctly #20', () => {
    const html = createElementBuilder().tag('div').class_('card', 'shadow').build();
    expect(html).toContain('class="card shadow"');
  });

  it('class container mx-auto rendered correctly #21', () => {
    const html = createElementBuilder().tag('div').class_('container', 'mx-auto').build();
    expect(html).toContain('class="container mx-auto"');
  });

  it('class container mx-auto rendered correctly #22', () => {
    const html = createElementBuilder().tag('div').class_('container', 'mx-auto').build();
    expect(html).toContain('class="container mx-auto"');
  });

  it('class container mx-auto rendered correctly #23', () => {
    const html = createElementBuilder().tag('div').class_('container', 'mx-auto').build();
    expect(html).toContain('class="container mx-auto"');
  });

  it('class container mx-auto rendered correctly #24', () => {
    const html = createElementBuilder().tag('div').class_('container', 'mx-auto').build();
    expect(html).toContain('class="container mx-auto"');
  });

  it('class container mx-auto rendered correctly #25', () => {
    const html = createElementBuilder().tag('div').class_('container', 'mx-auto').build();
    expect(html).toContain('class="container mx-auto"');
  });

  it('class container mx-auto rendered correctly #26', () => {
    const html = createElementBuilder().tag('div').class_('container', 'mx-auto').build();
    expect(html).toContain('class="container mx-auto"');
  });

  it('class container mx-auto rendered correctly #27', () => {
    const html = createElementBuilder().tag('div').class_('container', 'mx-auto').build();
    expect(html).toContain('class="container mx-auto"');
  });

  it('class container mx-auto rendered correctly #28', () => {
    const html = createElementBuilder().tag('div').class_('container', 'mx-auto').build();
    expect(html).toContain('class="container mx-auto"');
  });

  it('class container mx-auto rendered correctly #29', () => {
    const html = createElementBuilder().tag('div').class_('container', 'mx-auto').build();
    expect(html).toContain('class="container mx-auto"');
  });

  it('class container mx-auto rendered correctly #30', () => {
    const html = createElementBuilder().tag('div').class_('container', 'mx-auto').build();
    expect(html).toContain('class="container mx-auto"');
  });

  it('class text bold rendered correctly #31', () => {
    const html = createElementBuilder().tag('div').class_('text', 'bold').build();
    expect(html).toContain('class="text bold"');
  });

  it('class text bold rendered correctly #32', () => {
    const html = createElementBuilder().tag('div').class_('text', 'bold').build();
    expect(html).toContain('class="text bold"');
  });

  it('class text bold rendered correctly #33', () => {
    const html = createElementBuilder().tag('div').class_('text', 'bold').build();
    expect(html).toContain('class="text bold"');
  });

  it('class text bold rendered correctly #34', () => {
    const html = createElementBuilder().tag('div').class_('text', 'bold').build();
    expect(html).toContain('class="text bold"');
  });

  it('class text bold rendered correctly #35', () => {
    const html = createElementBuilder().tag('div').class_('text', 'bold').build();
    expect(html).toContain('class="text bold"');
  });

  it('class text bold rendered correctly #36', () => {
    const html = createElementBuilder().tag('div').class_('text', 'bold').build();
    expect(html).toContain('class="text bold"');
  });

  it('class text bold rendered correctly #37', () => {
    const html = createElementBuilder().tag('div').class_('text', 'bold').build();
    expect(html).toContain('class="text bold"');
  });

  it('class text bold rendered correctly #38', () => {
    const html = createElementBuilder().tag('div').class_('text', 'bold').build();
    expect(html).toContain('class="text bold"');
  });

  it('class text bold rendered correctly #39', () => {
    const html = createElementBuilder().tag('div').class_('text', 'bold').build();
    expect(html).toContain('class="text bold"');
  });

  it('class text bold rendered correctly #40', () => {
    const html = createElementBuilder().tag('div').class_('text', 'bold').build();
    expect(html).toContain('class="text bold"');
  });

  it('text content rendered #1', () => {
    const html = createElementBuilder().tag('p').text('Hello World').build();
    expect(html).toContain('Hello World');
  });

  it('text content rendered #2', () => {
    const html = createElementBuilder().tag('p').text('Hello World').build();
    expect(html).toContain('Hello World');
  });

  it('text content rendered #3', () => {
    const html = createElementBuilder().tag('p').text('Hello World').build();
    expect(html).toContain('Hello World');
  });

  it('text content rendered #4', () => {
    const html = createElementBuilder().tag('p').text('Hello World').build();
    expect(html).toContain('Hello World');
  });

  it('text content rendered #5', () => {
    const html = createElementBuilder().tag('p').text('Hello World').build();
    expect(html).toContain('Hello World');
  });

  it('text content rendered #6', () => {
    const html = createElementBuilder().tag('p').text('Hello World').build();
    expect(html).toContain('Hello World');
  });

  it('text content rendered #7', () => {
    const html = createElementBuilder().tag('p').text('Click me').build();
    expect(html).toContain('Click me');
  });

  it('text content rendered #8', () => {
    const html = createElementBuilder().tag('p').text('Click me').build();
    expect(html).toContain('Click me');
  });

  it('text content rendered #9', () => {
    const html = createElementBuilder().tag('p').text('Click me').build();
    expect(html).toContain('Click me');
  });

  it('text content rendered #10', () => {
    const html = createElementBuilder().tag('p').text('Click me').build();
    expect(html).toContain('Click me');
  });

  it('text content rendered #11', () => {
    const html = createElementBuilder().tag('p').text('Click me').build();
    expect(html).toContain('Click me');
  });

  it('text content rendered #12', () => {
    const html = createElementBuilder().tag('p').text('Click me').build();
    expect(html).toContain('Click me');
  });

  it('text content rendered #13', () => {
    const html = createElementBuilder().tag('p').text('Loading...').build();
    expect(html).toContain('Loading...');
  });

  it('text content rendered #14', () => {
    const html = createElementBuilder().tag('p').text('Loading...').build();
    expect(html).toContain('Loading...');
  });

  it('text content rendered #15', () => {
    const html = createElementBuilder().tag('p').text('Loading...').build();
    expect(html).toContain('Loading...');
  });

  it('text content rendered #16', () => {
    const html = createElementBuilder().tag('p').text('Loading...').build();
    expect(html).toContain('Loading...');
  });

  it('text content rendered #17', () => {
    const html = createElementBuilder().tag('p').text('Loading...').build();
    expect(html).toContain('Loading...');
  });

  it('text content rendered #18', () => {
    const html = createElementBuilder().tag('p').text('Loading...').build();
    expect(html).toContain('Loading...');
  });

  it('text content rendered #19', () => {
    const html = createElementBuilder().tag('p').text('Error occurred').build();
    expect(html).toContain('Error occurred');
  });

  it('text content rendered #20', () => {
    const html = createElementBuilder().tag('p').text('Error occurred').build();
    expect(html).toContain('Error occurred');
  });

  it('text content rendered #21', () => {
    const html = createElementBuilder().tag('p').text('Error occurred').build();
    expect(html).toContain('Error occurred');
  });

  it('text content rendered #22', () => {
    const html = createElementBuilder().tag('p').text('Error occurred').build();
    expect(html).toContain('Error occurred');
  });

  it('text content rendered #23', () => {
    const html = createElementBuilder().tag('p').text('Error occurred').build();
    expect(html).toContain('Error occurred');
  });

  it('text content rendered #24', () => {
    const html = createElementBuilder().tag('p').text('Error occurred').build();
    expect(html).toContain('Error occurred');
  });

  it('text content rendered #25', () => {
    const html = createElementBuilder().tag('p').text('Welcome back').build();
    expect(html).toContain('Welcome back');
  });

  it('text content rendered #26', () => {
    const html = createElementBuilder().tag('p').text('Welcome back').build();
    expect(html).toContain('Welcome back');
  });

  it('text content rendered #27', () => {
    const html = createElementBuilder().tag('p').text('Welcome back').build();
    expect(html).toContain('Welcome back');
  });

  it('text content rendered #28', () => {
    const html = createElementBuilder().tag('p').text('Welcome back').build();
    expect(html).toContain('Welcome back');
  });

  it('text content rendered #29', () => {
    const html = createElementBuilder().tag('p').text('Welcome back').build();
    expect(html).toContain('Welcome back');
  });

  it('text content rendered #30', () => {
    const html = createElementBuilder().tag('p').text('Welcome back').build();
    expect(html).toContain('Welcome back');
  });

  it('child html inserted #1', () => {
    const inner = '<span>child1</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #2', () => {
    const inner = '<span>child2</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #3', () => {
    const inner = '<span>child3</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #4', () => {
    const inner = '<span>child4</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #5', () => {
    const inner = '<span>child5</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #6', () => {
    const inner = '<span>child6</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #7', () => {
    const inner = '<span>child7</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #8', () => {
    const inner = '<span>child8</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #9', () => {
    const inner = '<span>child9</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #10', () => {
    const inner = '<span>child10</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #11', () => {
    const inner = '<span>child11</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #12', () => {
    const inner = '<span>child12</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #13', () => {
    const inner = '<span>child13</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #14', () => {
    const inner = '<span>child14</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #15', () => {
    const inner = '<span>child15</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #16', () => {
    const inner = '<span>child16</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #17', () => {
    const inner = '<span>child17</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #18', () => {
    const inner = '<span>child18</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #19', () => {
    const inner = '<span>child19</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('child html inserted #20', () => {
    const inner = '<span>child20</span>';
    const html = createElementBuilder().tag('div').child(inner).build();
    expect(html).toContain(inner);
  });

  it('combined element build #1', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el1')
      .class_('box', 'row1')
      .text('Content 1')
      .build();
    expect(html).toContain('id="el1"');
    expect(html).toContain('class="box row1"');
    expect(html).toContain('Content 1');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #2', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el2')
      .class_('box', 'row2')
      .text('Content 2')
      .build();
    expect(html).toContain('id="el2"');
    expect(html).toContain('class="box row2"');
    expect(html).toContain('Content 2');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #3', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el3')
      .class_('box', 'row3')
      .text('Content 3')
      .build();
    expect(html).toContain('id="el3"');
    expect(html).toContain('class="box row3"');
    expect(html).toContain('Content 3');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #4', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el4')
      .class_('box', 'row4')
      .text('Content 4')
      .build();
    expect(html).toContain('id="el4"');
    expect(html).toContain('class="box row4"');
    expect(html).toContain('Content 4');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #5', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el5')
      .class_('box', 'row5')
      .text('Content 5')
      .build();
    expect(html).toContain('id="el5"');
    expect(html).toContain('class="box row5"');
    expect(html).toContain('Content 5');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #6', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el6')
      .class_('box', 'row6')
      .text('Content 6')
      .build();
    expect(html).toContain('id="el6"');
    expect(html).toContain('class="box row6"');
    expect(html).toContain('Content 6');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #7', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el7')
      .class_('box', 'row7')
      .text('Content 7')
      .build();
    expect(html).toContain('id="el7"');
    expect(html).toContain('class="box row7"');
    expect(html).toContain('Content 7');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #8', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el8')
      .class_('box', 'row8')
      .text('Content 8')
      .build();
    expect(html).toContain('id="el8"');
    expect(html).toContain('class="box row8"');
    expect(html).toContain('Content 8');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #9', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el9')
      .class_('box', 'row9')
      .text('Content 9')
      .build();
    expect(html).toContain('id="el9"');
    expect(html).toContain('class="box row9"');
    expect(html).toContain('Content 9');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #10', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el10')
      .class_('box', 'row10')
      .text('Content 10')
      .build();
    expect(html).toContain('id="el10"');
    expect(html).toContain('class="box row10"');
    expect(html).toContain('Content 10');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #11', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el11')
      .class_('box', 'row11')
      .text('Content 11')
      .build();
    expect(html).toContain('id="el11"');
    expect(html).toContain('class="box row11"');
    expect(html).toContain('Content 11');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #12', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el12')
      .class_('box', 'row12')
      .text('Content 12')
      .build();
    expect(html).toContain('id="el12"');
    expect(html).toContain('class="box row12"');
    expect(html).toContain('Content 12');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #13', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el13')
      .class_('box', 'row13')
      .text('Content 13')
      .build();
    expect(html).toContain('id="el13"');
    expect(html).toContain('class="box row13"');
    expect(html).toContain('Content 13');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #14', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el14')
      .class_('box', 'row14')
      .text('Content 14')
      .build();
    expect(html).toContain('id="el14"');
    expect(html).toContain('class="box row14"');
    expect(html).toContain('Content 14');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #15', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el15')
      .class_('box', 'row15')
      .text('Content 15')
      .build();
    expect(html).toContain('id="el15"');
    expect(html).toContain('class="box row15"');
    expect(html).toContain('Content 15');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #16', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el16')
      .class_('box', 'row16')
      .text('Content 16')
      .build();
    expect(html).toContain('id="el16"');
    expect(html).toContain('class="box row16"');
    expect(html).toContain('Content 16');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #17', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el17')
      .class_('box', 'row17')
      .text('Content 17')
      .build();
    expect(html).toContain('id="el17"');
    expect(html).toContain('class="box row17"');
    expect(html).toContain('Content 17');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #18', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el18')
      .class_('box', 'row18')
      .text('Content 18')
      .build();
    expect(html).toContain('id="el18"');
    expect(html).toContain('class="box row18"');
    expect(html).toContain('Content 18');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #19', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el19')
      .class_('box', 'row19')
      .text('Content 19')
      .build();
    expect(html).toContain('id="el19"');
    expect(html).toContain('class="box row19"');
    expect(html).toContain('Content 19');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #20', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el20')
      .class_('box', 'row20')
      .text('Content 20')
      .build();
    expect(html).toContain('id="el20"');
    expect(html).toContain('class="box row20"');
    expect(html).toContain('Content 20');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #21', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el21')
      .class_('box', 'row21')
      .text('Content 21')
      .build();
    expect(html).toContain('id="el21"');
    expect(html).toContain('class="box row21"');
    expect(html).toContain('Content 21');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #22', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el22')
      .class_('box', 'row22')
      .text('Content 22')
      .build();
    expect(html).toContain('id="el22"');
    expect(html).toContain('class="box row22"');
    expect(html).toContain('Content 22');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #23', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el23')
      .class_('box', 'row23')
      .text('Content 23')
      .build();
    expect(html).toContain('id="el23"');
    expect(html).toContain('class="box row23"');
    expect(html).toContain('Content 23');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #24', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el24')
      .class_('box', 'row24')
      .text('Content 24')
      .build();
    expect(html).toContain('id="el24"');
    expect(html).toContain('class="box row24"');
    expect(html).toContain('Content 24');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #25', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el25')
      .class_('box', 'row25')
      .text('Content 25')
      .build();
    expect(html).toContain('id="el25"');
    expect(html).toContain('class="box row25"');
    expect(html).toContain('Content 25');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #26', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el26')
      .class_('box', 'row26')
      .text('Content 26')
      .build();
    expect(html).toContain('id="el26"');
    expect(html).toContain('class="box row26"');
    expect(html).toContain('Content 26');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #27', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el27')
      .class_('box', 'row27')
      .text('Content 27')
      .build();
    expect(html).toContain('id="el27"');
    expect(html).toContain('class="box row27"');
    expect(html).toContain('Content 27');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #28', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el28')
      .class_('box', 'row28')
      .text('Content 28')
      .build();
    expect(html).toContain('id="el28"');
    expect(html).toContain('class="box row28"');
    expect(html).toContain('Content 28');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #29', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el29')
      .class_('box', 'row29')
      .text('Content 29')
      .build();
    expect(html).toContain('id="el29"');
    expect(html).toContain('class="box row29"');
    expect(html).toContain('Content 29');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #30', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el30')
      .class_('box', 'row30')
      .text('Content 30')
      .build();
    expect(html).toContain('id="el30"');
    expect(html).toContain('class="box row30"');
    expect(html).toContain('Content 30');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #31', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el31')
      .class_('box', 'row31')
      .text('Content 31')
      .build();
    expect(html).toContain('id="el31"');
    expect(html).toContain('class="box row31"');
    expect(html).toContain('Content 31');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #32', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el32')
      .class_('box', 'row32')
      .text('Content 32')
      .build();
    expect(html).toContain('id="el32"');
    expect(html).toContain('class="box row32"');
    expect(html).toContain('Content 32');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #33', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el33')
      .class_('box', 'row33')
      .text('Content 33')
      .build();
    expect(html).toContain('id="el33"');
    expect(html).toContain('class="box row33"');
    expect(html).toContain('Content 33');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #34', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el34')
      .class_('box', 'row34')
      .text('Content 34')
      .build();
    expect(html).toContain('id="el34"');
    expect(html).toContain('class="box row34"');
    expect(html).toContain('Content 34');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #35', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el35')
      .class_('box', 'row35')
      .text('Content 35')
      .build();
    expect(html).toContain('id="el35"');
    expect(html).toContain('class="box row35"');
    expect(html).toContain('Content 35');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #36', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el36')
      .class_('box', 'row36')
      .text('Content 36')
      .build();
    expect(html).toContain('id="el36"');
    expect(html).toContain('class="box row36"');
    expect(html).toContain('Content 36');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #37', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el37')
      .class_('box', 'row37')
      .text('Content 37')
      .build();
    expect(html).toContain('id="el37"');
    expect(html).toContain('class="box row37"');
    expect(html).toContain('Content 37');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #38', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el38')
      .class_('box', 'row38')
      .text('Content 38')
      .build();
    expect(html).toContain('id="el38"');
    expect(html).toContain('class="box row38"');
    expect(html).toContain('Content 38');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #39', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el39')
      .class_('box', 'row39')
      .text('Content 39')
      .build();
    expect(html).toContain('id="el39"');
    expect(html).toContain('class="box row39"');
    expect(html).toContain('Content 39');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

  it('combined element build #40', () => {
    const html = createElementBuilder()
      .tag('div')
      .attr('id', 'el40')
      .class_('box', 'row40')
      .text('Content 40')
      .build();
    expect(html).toContain('id="el40"');
    expect(html).toContain('class="box row40"');
    expect(html).toContain('Content 40');
    expect(html).toContain('<div');
    expect(html).toContain('</div>');
  });

});
