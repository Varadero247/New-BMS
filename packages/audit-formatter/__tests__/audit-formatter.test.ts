import {
  AuditAction,
  AuditEntry,
  AuditSeverity,
  FieldChange,
  diffObjects,
  formatTimestamp,
  formatAction,
  formatChange,
  formatEntry,
  formatEntries,
  summarise,
  filterByAction,
  filterBySeverity,
  filterByUser,
  filterByDateRange,
  sortByTimestamp,
  makeEntry,
  isValidAction,
  isValidSeverity,
  changedFields,
  hasFieldChanged,
  recentEntries,
  entryCount,
} from '../src/index';

const actions: AuditAction[] = ['create','update','delete','view','export','login','logout','approve','reject'];
const severities: AuditSeverity[] = ['info','warning','critical'];

function makeTestEntry(overrides: Partial<AuditEntry> = {}): AuditEntry {
  return {
    id: 'e1', action: 'create', entityType: 'Risk', entityId: '42',
    userId: 'u1', timestamp: 1700000000000, severity: 'info',
    ...overrides,
  };
}

function makeEntries(n: number): AuditEntry[] {
  return Array.from({ length: n }, (_, i) => makeTestEntry({
    id: 'e' + i,
    userId: 'u' + (i % 3),
    action: actions[i % actions.length],
    severity: severities[i % severities.length],
    timestamp: 1700000000000 + i * 1000,
  }));
}

// --- 1. isValidAction ---
describe('isValidAction', () => {
  actions.forEach(a => {
    it('returns true for ' + a, () => expect(isValidAction(a)).toBe(true));
  });
  const invalids = ['CREATE','UPDATE','DELETE','VIEW','EXPORT','LOGIN','LOGOUT','APPROVE','REJECT',
    '','random','null','undefined','read','write','patch','post','get','put','head'];
  invalids.forEach(v => {
    it('returns false for invalid_' + (v||'empty'), () => expect(isValidAction(v)).toBe(false));
  });
});

// --- 2. isValidSeverity ---
describe('isValidSeverity', () => {
  severities.forEach(s => {
    it('returns true for ' + s, () => expect(isValidSeverity(s)).toBe(true));
  });
  const invalids = ['INFO','WARNING','CRITICAL','high','low','medium','','none','alert',
    'severe','danger','moderate','major','minor','unknown'];
  invalids.forEach(v => {
    it('returns false for invalid_' + (v||'empty'), () => expect(isValidSeverity(v)).toBe(false));
  });
});

// --- 3. formatAction ---
describe('formatAction', () => {
  const expected: Record<AuditAction, string> = {
    create: 'Created', update: 'Updated', delete: 'Deleted', view: 'Viewed',
    export: 'Exported', login: 'Logged in', logout: 'Logged out',
    approve: 'Approved', reject: 'Rejected',
  };
  actions.forEach(a => {
    it('maps ' + a, () => expect(formatAction(a)).toBe(expected[a]));
    it(a + ' non-empty', () => expect(formatAction(a).length).toBeGreaterThan(0));
    it(a + ' is string', () => expect(typeof formatAction(a)).toBe('string'));
  });
});

// --- 4. diffObjects 50 loop + 11 extras = 61 ---
describe('diffObjects', () => {
  for (let i = 0; i < 50; i++) {
    it('field' + i + ' change detected', () => {
      const b = { ['field' + i]: i };
      const a = { ['field' + i]: i + 1 };
      const ch = diffObjects(b, a);
      expect(ch.length).toBe(1);
      expect(ch[0].field).toBe('field' + i);
      expect(ch[0].oldValue).toBe(i);
      expect(ch[0].newValue).toBe(i + 1);
    });
  }
  it('identical objects => empty', () => expect(diffObjects({a:1},{a:1})).toHaveLength(0));
  it('added key detected', () => {
    const ch = diffObjects({}, {k:'v'});
    expect(ch).toHaveLength(1);
    expect(ch[0].field).toBe('k');
    expect(ch[0].oldValue).toBeUndefined();
  });
  it('removed key detected', () => {
    const ch = diffObjects({k:'v'}, {});
    expect(ch).toHaveLength(1);
    expect(ch[0].newValue).toBeUndefined();
  });
  it('multiple changes', () => {
    const ch = diffObjects({a:1,b:2,c:3},{a:10,b:2,c:30});
    expect(ch).toHaveLength(2);
    expect(ch.map(c=>c.field)).toContain('a');
    expect(ch.map(c=>c.field)).toContain('c');
  });
  it('null vs undefined is change', () => expect(diffObjects({x:null},{x:undefined})).toHaveLength(1));
  it('false vs 0 is change', () => expect(diffObjects({x:false},{x:0})).toHaveLength(1));
  it('nested object change', () => expect(diffObjects({o:{a:1}},{o:{a:2}})).toHaveLength(1));
  it('identical nested no change', () => expect(diffObjects({o:{a:1}},{o:{a:1}})).toHaveLength(0));
  it('array value change', () => expect(diffObjects({a:[1,2]},{a:[1,3]})).toHaveLength(1));
  it('both empty no change', () => expect(diffObjects({},{})).toHaveLength(0));
  for (let i = 0; i < 20; i++) {
    it('multi-field diff ' + i + ' changes', () => {
      const b: Record<string,unknown> = {};
      const a: Record<string,unknown> = {};
      for (let j = 0; j < i; j++) { b['k'+j]=j; a['k'+j]=j+100; }
      expect(diffObjects(b, a).length).toBe(i);
    });
  }
});

// --- 5. formatTimestamp 30 loop + 5 extras = 35 ---
describe('formatTimestamp', () => {
  for (let i = 0; i < 30; i++) {
    const ts = 1700000000000 + i * 86400000;
    it('ts_' + i + ' is non-empty string', () => {
      expect(typeof formatTimestamp(ts)).toBe('string');
      expect(formatTimestamp(ts).length).toBeGreaterThan(0);
    });
  }
  it('epoch 0 no throw', () => expect(() => formatTimestamp(0)).not.toThrow());
  it('large ts is string', () => expect(typeof formatTimestamp(9999999999999)).toBe('string'));
  it('locale en-US accepted', () => expect(() => formatTimestamp(1700000000000,'en-US')).not.toThrow());
  it('en-GB returns string', () => expect(typeof formatTimestamp(1700000000000,'en-GB')).toBe('string'));
  it('en-US returns string', () => expect(typeof formatTimestamp(1700000000000,'en-US')).toBe('string'));
});

// --- 6. formatChange 30 loop + 7 extras = 37 ---
describe('formatChange', () => {
  for (let i = 0; i < 30; i++) {
    it('change_' + i + ' contains expected values', () => {
      const r = formatChange({ field:'field'+i, oldValue:i, newValue:i+1 });
      expect(r).toContain('field'+i);
      expect(r).toContain(String(i));
      expect(r).toContain(String(i+1));
    });
  }
  it('null oldValue => (empty)', () => {
    const r = formatChange({field:'x',oldValue:null,newValue:'new'});
    expect(r).toContain('(empty)');
    expect(r).toContain('new');
  });
  it('undefined newValue => (empty)', () => {
    const r = formatChange({field:'x',oldValue:'old',newValue:undefined});
    expect(r).toContain('(empty)');
    expect(r).toContain('old');
  });
  it('both null => two (empty)', () => {
    const r = formatChange({field:'y',oldValue:null,newValue:null});
    expect(r.split('(empty)').length - 1).toBe(2);
  });
  it('includes field name', () => {
    expect(formatChange({field:'myField',oldValue:'a',newValue:'b'})).toContain('myField');
  });
  it('handles booleans', () => {
    const r = formatChange({field:'active',oldValue:false,newValue:true});
    expect(r).toContain('false');
    expect(r).toContain('true');
  });
  it('result is non-empty string', () => {
    const r = formatChange({field:'f',oldValue:1,newValue:2});
    expect(typeof r).toBe('string');
    expect(r.length).toBeGreaterThan(0);
  });
  it('field name appears before arrow', () => {
    const r = formatChange({field:'myfield',oldValue:'a',newValue:'b'});
    expect(r.indexOf('myfield')).toBeLessThan(r.indexOf('\u2192'));
  });
});

// --- 7. formatEntry per-action + per-severity + extras = 9+3+12+6 = 30 ---
describe('formatEntry', () => {
  actions.forEach((action, i) => {
    it('action_' + action + '_formatted', () => {
      const e = makeTestEntry({id:'e'+i, action, entityType:'Doc', entityId:String(i)});
      const f = formatEntry(e);
      expect(f.id).toBe('e'+i);
      expect(f.action).toBe(formatAction(action));
      expect(f.description).toContain('Doc');
      expect(f.description).toContain(String(i));
      expect(typeof f.timestamp).toBe('string');
    });
  });
  severities.forEach(sev => {
    it('severity_' + sev + '_preserved', () => {
      expect(formatEntry(makeTestEntry({severity:sev})).severity).toBe(sev);
    });
  });
  it('uses userName', () => {
    const f = formatEntry(makeTestEntry({userId:'u99',userName:'Alice'}));
    expect(f.actor).toBe('Alice');
    expect(f.description).toContain('Alice');
  });
  it('falls back to userId', () => {
    expect(formatEntry(makeTestEntry({userId:'u99',userName:undefined})).actor).toBe('u99');
  });
  it('ip in details', () => {
    const f = formatEntry(makeTestEntry({ipAddress:'10.0.0.1'}));
    expect(f.details.some((d:string) => d.includes('10.0.0.1'))).toBe(true);
  });
  it('no ip line without ipAddress', () => {
    const f = formatEntry(makeTestEntry({ipAddress:undefined}));
    expect(f.details.every((d:string) => !d.startsWith('IP:'))).toBe(true);
  });
  it('changes appear in details', () => {
    const e = makeTestEntry({changes:[{field:'status',oldValue:'open',newValue:'closed'}]});
    expect(formatEntry(e).details.some((d:string)=>d.includes('status'))).toBe(true);
  });
  it('empty changes + no ip => 0 details', () => {
    const e = makeTestEntry({changes:[],ipAddress:undefined});
    expect(formatEntry(e).details).toHaveLength(0);
  });
  it('has all keys', () => {
    const f = formatEntry(makeTestEntry());
    ['id','description','timestamp','actor','action','severity','details'].forEach(k => {
      expect(f).toHaveProperty(k);
    });
  });
  it('details is always array', () => {
    expect(Array.isArray(formatEntry(makeTestEntry()).details)).toBe(true);
  });
  it('ip + 1 change = 2 details', () => {
    const e = makeTestEntry({
      changes:[{field:'title',oldValue:'A',newValue:'B'}],
      ipAddress:'192.168.1.1'
    });
    expect(formatEntry(e).details).toHaveLength(2);
  });
  for (let i = 0; i < 20; i++) {
    it('loop_' + i + '_id_preserved', () => {
      const e = makeTestEntry({id:'loop-'+i});
      expect(formatEntry(e).id).toBe('loop-'+i);
    });
  }
});

// --- 8. formatEntries 30 loop + 2 extras = 32 ---
describe('formatEntries', () => {
  it('empty => empty', () => expect(formatEntries([])).toHaveLength(0));
  for (let n = 1; n <= 30; n++) {
    it('batch_' + n, () => {
      const entries = makeEntries(n);
      const result = formatEntries(entries);
      expect(result).toHaveLength(n);
      result.forEach((r,i) => expect(r.id).toBe(entries[i].id));
    });
  }
  it('all entries have required fields', () => {
    makeEntries(10).forEach(e => {
      const f = formatEntry(e);
      ['id','description','timestamp','actor','action','severity','details'].forEach(k => {
        expect(f).toHaveProperty(k);
      });
    });
  });
});

// --- 9. summarise ---
describe('summarise', () => {
  it('empty => zero totals', () => {
    const s = summarise([]);
    expect(s.totalEntries).toBe(0);
    expect(s.dateRange).toBeNull();
    actions.forEach(a => expect(s.byAction[a]).toBe(0));
    severities.forEach(sv => expect(s.bySeverity[sv]).toBe(0));
  });
  actions.forEach(action => {
    it('byAction_' + action + '_count', () => {
      const entries = [makeTestEntry({action}), makeTestEntry({id:'e2',action})];
      const s = summarise(entries);
      expect(s.byAction[action]).toBe(2);
      expect(s.totalEntries).toBe(2);
    });
  });
  severities.forEach(sev => {
    it('bySeverity_' + sev + '_count', () => {
      const entries = [
        makeTestEntry({severity:sev}),
        makeTestEntry({id:'e2',severity:sev}),
        makeTestEntry({id:'e3',severity:sev}),
      ];
      expect(summarise(entries).bySeverity[sev]).toBe(3);
    });
  });
  it('byUser counts', () => {
    const s = summarise([
      makeTestEntry({id:'e1',userId:'A'}),
      makeTestEntry({id:'e2',userId:'A'}),
      makeTestEntry({id:'e3',userId:'B'}),
    ]);
    expect(s.byUser['A']).toBe(2);
    expect(s.byUser['B']).toBe(1);
  });
  it('dateRange min/max', () => {
    const s = summarise([
      makeTestEntry({id:'e1',timestamp:1000}),
      makeTestEntry({id:'e2',timestamp:5000}),
      makeTestEntry({id:'e3',timestamp:3000}),
    ]);
    expect(s.dateRange!.from).toBe(1000);
    expect(s.dateRange!.to).toBe(5000);
  });
  it('single entry dateRange from==to', () => {
    const s = summarise([makeTestEntry({timestamp:9999})]);
    expect(s.dateRange!.from).toBe(9999);
    expect(s.dateRange!.to).toBe(9999);
  });
  for (let n = 1; n <= 20; n++) {
    it('totalEntries_' + n, () => expect(summarise(makeEntries(n)).totalEntries).toBe(n));
  }
});

// --- 10. filterByAction ---
describe('filterByAction', () => {
  actions.forEach(action => {
    it('filter_' + action + '_only', () => {
      filterByAction(makeEntries(20), action).forEach(e => expect(e.action).toBe(action));
    });
    it('count_' + action + '_in_9set_is_1', () => {
      const entries = actions.map((a,i) => makeTestEntry({id:'e'+i, action:a}));
      expect(filterByAction(entries, action)).toHaveLength(1);
    });
  });
  it('no match => empty', () => {
    expect(filterByAction([makeTestEntry({action:'create'})], 'delete')).toHaveLength(0);
  });
  it('preserves entry shape', () => {
    const r = filterByAction([makeTestEntry({action:'approve',id:'a1'})], 'approve');
    expect(r[0].id).toBe('a1');
  });
  it('empty input => empty', () => expect(filterByAction([], 'create')).toHaveLength(0));
  it('no mutation', () => {
    const e = makeEntries(10);
    const len = e.length;
    filterByAction(e, 'create');
    expect(e.length).toBe(len);
  });
});

// --- 11. filterBySeverity ---
describe('filterBySeverity', () => {
  severities.forEach(sev => {
    it('filter_' + sev + '_only', () => {
      filterBySeverity(makeEntries(30), sev).forEach(e => expect(e.severity).toBe(sev));
    });
    it('count_' + sev + '_in_3set_is_1', () => {
      const entries = severities.map((s,i) => makeTestEntry({id:'e'+i, severity:s}));
      expect(filterBySeverity(entries, sev)).toHaveLength(1);
    });
  });
  it('no match => empty', () => {
    expect(filterBySeverity([makeTestEntry({severity:'info'})], 'critical')).toHaveLength(0);
  });
  it('no mutation', () => {
    const e = makeEntries(10); const len = e.length;
    filterBySeverity(e, 'info');
    expect(e.length).toBe(len);
  });
  it('empty input => empty', () => expect(filterBySeverity([], 'warning')).toHaveLength(0));
});

// --- 12. filterByUser 20 loop + extras ---
describe('filterByUser', () => {
  for (let i = 0; i < 20; i++) {
    it('user_loop_' + i, () => {
      const uid = 'u' + (i % 3);
      filterByUser(makeEntries(20), uid).forEach(e => expect(e.userId).toBe(uid));
    });
  }
  it('unknown user => empty', () => expect(filterByUser(makeEntries(10),'nobody')).toHaveLength(0));
  it('all same user => all returned', () => {
    const e = Array.from({length:5},(_,i)=>makeTestEntry({id:'e'+i,userId:'sameUser'}));
    expect(filterByUser(e,'sameUser')).toHaveLength(5);
  });
  it('empty input => empty', () => expect(filterByUser([],'u1')).toHaveLength(0));
});

// --- 13. filterByDateRange 20 loop + extras ---
describe('filterByDateRange', () => {
  for (let i = 0; i < 20; i++) {
    it('range_scenario_' + i, () => {
      const base = 1000000;
      const entries = Array.from({length:10},(_,j)=>makeTestEntry({id:'e'+j,timestamp:base+j*1000}));
      const from = base + i*100; const to = base + (i+5)*1000;
      filterByDateRange(entries, from, to).forEach(e => {
        expect(e.timestamp).toBeGreaterThanOrEqual(from);
        expect(e.timestamp).toBeLessThanOrEqual(to);
      });
    });
  }
  it('inclusive from', () => expect(filterByDateRange([makeTestEntry({timestamp:500})],500,1000)).toHaveLength(1));
  it('inclusive to', () => expect(filterByDateRange([makeTestEntry({timestamp:1000})],500,1000)).toHaveLength(1));
  it('before from => excluded', () => expect(filterByDateRange([makeTestEntry({timestamp:100})],500,1000)).toHaveLength(0));
  it('after to => excluded', () => expect(filterByDateRange([makeTestEntry({timestamp:2000})],500,1000)).toHaveLength(0));
  it('empty input => empty', () => expect(filterByDateRange([],0,9999999)).toHaveLength(0));
  it('from > to => empty', () => expect(filterByDateRange(makeEntries(5),9999999,0)).toHaveLength(0));
});

// --- 14. sortByTimestamp ---
describe('sortByTimestamp', () => {
  it('desc default', () => {
    const sorted = sortByTimestamp(makeEntries(5));
    for (let i=0;i<sorted.length-1;i++) expect(sorted[i].timestamp).toBeGreaterThanOrEqual(sorted[i+1].timestamp);
  });
  it('asc explicit', () => {
    const sorted = sortByTimestamp(makeEntries(5),'asc');
    for (let i=0;i<sorted.length-1;i++) expect(sorted[i].timestamp).toBeLessThanOrEqual(sorted[i+1].timestamp);
  });
  it('no mutation', () => {
    const e = makeEntries(5); const orig = e.map(x=>x.timestamp);
    sortByTimestamp(e,'asc');
    e.forEach((x,i) => expect(x.timestamp).toBe(orig[i]));
  });
  it('same entries reordered', () => {
    const e = makeEntries(10);
    const s = sortByTimestamp(e,'asc');
    expect(s.map(x=>x.id).sort()).toEqual(e.map(x=>x.id).sort());
  });
  for (let n=2;n<=20;n++) {
    it('length_' + n + '_preserved', () => expect(sortByTimestamp(makeEntries(n))).toHaveLength(n));
  }
  it('single entry ok', () => expect(sortByTimestamp([makeTestEntry({timestamp:999})])).toHaveLength(1));
  it('empty ok', () => expect(sortByTimestamp([])).toHaveLength(0));
  it('desc first has max ts', () => {
    const e = makeEntries(5);
    const maxTs = Math.max(...e.map(x=>x.timestamp));
    expect(sortByTimestamp(e,'desc')[0].timestamp).toBe(maxTs);
  });
  it('asc first has min ts', () => {
    const e = makeEntries(5);
    const minTs = Math.min(...e.map(x=>x.timestamp));
    expect(sortByTimestamp(e,'asc')[0].timestamp).toBe(minTs);
  });
  it('three items desc order', () => {
    const e = [
      makeTestEntry({id:'e1',timestamp:3000}),
      makeTestEntry({id:'e2',timestamp:1000}),
      makeTestEntry({id:'e3',timestamp:2000}),
    ];
    const s = sortByTimestamp(e,'desc');
    expect(s[0].id).toBe('e1');
    expect(s[2].id).toBe('e2');
  });
  it('three items asc order', () => {
    const e = [
      makeTestEntry({id:'e1',timestamp:3000}),
      makeTestEntry({id:'e2',timestamp:1000}),
      makeTestEntry({id:'e3',timestamp:2000}),
    ];
    const s = sortByTimestamp(e,'asc');
    expect(s[0].id).toBe('e2');
    expect(s[2].id).toBe('e1');
  });
});

// --- 15. makeEntry ---
describe('makeEntry', () => {
  actions.forEach((action,i) => {
    it('action_' + action + '_fields_correct', () => {
      const e = makeEntry('id-'+i, action, 'Entity', String(i), 'userX');
      expect(e.id).toBe('id-'+i);
      expect(e.action).toBe(action);
      expect(e.entityType).toBe('Entity');
      expect(e.entityId).toBe(String(i));
      expect(e.userId).toBe('userX');
      expect(e.severity).toBe('info');
      expect(typeof e.timestamp).toBe('number');
    });
  });
  severities.forEach(sev => {
    it('severity_' + sev + '_set', () => {
      expect(makeEntry('s1','create','T','1','u1',sev).severity).toBe(sev);
    });
  });
  for (let i=0;i<20;i++) {
    it('timestamp_recent_' + i, () => {
      const before = Date.now();
      const e = makeEntry('t'+i,'update','X','1','u1');
      const after = Date.now();
      expect(e.timestamp).toBeGreaterThanOrEqual(before);
      expect(e.timestamp).toBeLessThanOrEqual(after);
    });
  }
  it('default severity is info', () => expect(makeEntry('x','view','T','1','u1').severity).toBe('info'));
  it('no changes by default', () => expect(makeEntry('x','view','T','1','u1').changes).toBeUndefined());
});

// --- 16. changedFields 21 loop + extras ---
describe('changedFields', () => {
  for (let n=0;n<=20;n++) {
    it('n_' + n + '_field_names', () => {
      const ch: FieldChange[] = Array.from({length:n},(_,i)=>({field:'f'+i,oldValue:i,newValue:i+1}));
      const r = changedFields(ch);
      expect(r).toHaveLength(n);
      r.forEach((f,i) => expect(f).toBe('f'+i));
    });
  }
  it('empty => empty', () => expect(changedFields([])).toHaveLength(0));
  it('order preserved', () => {
    const ch: FieldChange[] = [{field:'z',oldValue:1,newValue:2},{field:'a',oldValue:1,newValue:2}];
    expect(changedFields(ch)).toEqual(['z','a']);
  });
  it('all strings', () => {
    changedFields([{field:'f',oldValue:1,newValue:2}]).forEach(f=>expect(typeof f).toBe('string'));
  });
});

// --- 17. hasFieldChanged 20 loop + extras ---
describe('hasFieldChanged', () => {
  for (let i=0;i<20;i++) {
    it('detects_f' + i, () => {
      expect(hasFieldChanged([{field:'f'+i,oldValue:0,newValue:1}],'f'+i)).toBe(true);
    });
  }
  it('absent field => false', () => {
    expect(hasFieldChanged([{field:'a',oldValue:1,newValue:2}],'b')).toBe(false);
  });
  it('empty => false', () => expect(hasFieldChanged([],'x')).toBe(false));
  it('field later in array => true', () => {
    const ch: FieldChange[] = [{field:'first',oldValue:1,newValue:2},{field:'target',oldValue:3,newValue:4}];
    expect(hasFieldChanged(ch,'target')).toBe(true);
  });
  it('empty field name not present => false', () => {
    expect(hasFieldChanged([{field:'real',oldValue:1,newValue:2}],'')).toBe(false);
  });
});

// --- 18. recentEntries 20 loop + extras ---
describe('recentEntries', () => {
  for (let count=1;count<=20;count++) {
    it('count_' + count + '_from_30', () => {
      expect(recentEntries(makeEntries(30), count)).toHaveLength(count);
    });
  }
  it('count >= length => all', () => expect(recentEntries(makeEntries(5),100)).toHaveLength(5));
  it('empty => empty', () => expect(recentEntries([],5)).toHaveLength(0));
  it('first has highest ts', () => {
    const r = recentEntries(makeEntries(10), 3);
    expect(r[0].timestamp).toBeGreaterThanOrEqual(r[1].timestamp);
  });
  it('result sorted desc', () => {
    const r = recentEntries(makeEntries(10), 10);
    for (let i=0;i<r.length-1;i++) expect(r[i].timestamp).toBeGreaterThanOrEqual(r[i+1].timestamp);
  });
  it('count 0 => empty', () => expect(recentEntries(makeEntries(5),0)).toHaveLength(0));
});

// --- 19. entryCount 21 loop + extras ---
describe('entryCount', () => {
  for (let n=0;n<=20;n++) {
    it('no_userId_returns_' + n, () => expect(entryCount(makeEntries(n))).toBe(n));
  }
  for (let i=0;i<3;i++) {
    it('userId_u' + i + '_in_30_pool', () => {
      const e = makeEntries(30);
      expect(entryCount(e,'u'+i)).toBe(e.filter(x=>x.userId==='u'+i).length);
    });
  }
  it('unknown userId => 0', () => expect(entryCount(makeEntries(10),'nobody')).toBe(0));
  it('no userId => total', () => expect(entryCount(makeEntries(15))).toBe(15));
  it('undefined userId => total', () => expect(entryCount(makeEntries(7),undefined)).toBe(7));
  it('matches filterByUser length', () => {
    const e = makeEntries(30);
    expect(entryCount(e,'u1')).toBe(filterByUser(e,'u1').length);
  });
});

// --- 20. Integration pipeline 50 tests ---
describe('integration pipeline', () => {
  for (let i=0;i<50;i++) {
    it('pipeline_' + i, () => {
      const action = actions[i % actions.length];
      const sev    = severities[i % severities.length];
      const e = makeEntry('pipe-'+i, action, 'Module', String(i), 'pipeUser', sev);
      const f = formatEntry(e);
      expect(f.id).toBe('pipe-'+i);
      expect(f.action).toBe(formatAction(action));
      expect(f.severity).toBe(sev);
      const s = summarise([e]);
      expect(s.totalEntries).toBe(1);
      expect(s.byAction[action]).toBe(1);
      expect(s.bySeverity[sev]).toBe(1);
    });
  }
});

// --- 21. summarise shape ---
describe('summarise shape', () => {
  it('all byAction keys present', () => {
    const s = summarise([]);
    actions.forEach(a => expect(s.byAction).toHaveProperty(a));
  });
  it('all bySeverity keys present', () => {
    const s = summarise([]);
    severities.forEach(sv => expect(s.bySeverity).toHaveProperty(sv));
  });
  it('byAction values are numbers', () => {
    const s = summarise(makeEntries(10));
    actions.forEach(a => expect(typeof s.byAction[a]).toBe('number'));
  });
  it('bySeverity values are numbers', () => {
    const s = summarise(makeEntries(10));
    severities.forEach(sv => expect(typeof s.bySeverity[sv]).toBe('number'));
  });
  it('byAction sum equals total', () => {
    const s = summarise(makeEntries(27));
    expect(actions.reduce((acc,a)=>acc+s.byAction[a],0)).toBe(s.totalEntries);
  });
  it('bySeverity sum equals total', () => {
    const s = summarise(makeEntries(27));
    expect(severities.reduce((acc,sv)=>acc+s.bySeverity[sv],0)).toBe(s.totalEntries);
  });
  it('byUser sum equals total', () => {
    const s = summarise(makeEntries(30));
    expect(Object.values(s.byUser).reduce((a,b)=>a+b,0)).toBe(s.totalEntries);
  });
  it('dateRange.from <= dateRange.to', () => {
    const s = summarise(makeEntries(10));
    expect(s.dateRange!.from).toBeLessThanOrEqual(s.dateRange!.to);
  });
  it('dateRange null for empty, non-null for non-empty', () => {
    expect(summarise([]).dateRange).toBeNull();
    expect(summarise(makeEntries(1)).dateRange).not.toBeNull();
  });
  it('totalEntries is number', () => {
    expect(typeof summarise(makeEntries(5)).totalEntries).toBe('number');
  });
});

// --- 22. diffObjects string stress 30 ---
describe('diffObjects string stress', () => {
  for (let i=0;i<30;i++) {
    it('string_change_k' + i, () => {
      const b: Record<string,unknown> = {['k'+i]:'before_'+i};
      const a: Record<string,unknown> = {['k'+i]:'after_'+i};
      const ch = diffObjects(b,a);
      expect(ch).toHaveLength(1);
      expect(ch[0].oldValue).toBe('before_'+i);
      expect(ch[0].newValue).toBe('after_'+i);
    });
  }
});

// --- 23. formatChange additional 20 ---
describe('formatChange additional', () => {
  for (let i=0;i<20;i++) {
    it('non-empty_' + i, () => {
      const r = formatChange({field:'col'+i,oldValue:'a'+i,newValue:'b'+i});
      expect(typeof r).toBe('string');
      expect(r.length).toBeGreaterThan(0);
    });
  }
});

// --- 24. Cross-function consistency 20 ---
describe('cross-function consistency', () => {
  for (let i=0;i<20;i++) {
    it('consistency_' + i, () => {
      const e = makeEntries(10);
      const bySev = filterBySeverity(e, severities[i%3]);
      const byAct = filterByAction(e, actions[i%9]);
      expect(entryCount(bySev)).toBe(bySev.length);
      expect(entryCount(byAct)).toBe(byAct.length);
    });
  }
});

// --- 25. Edge cases 20 stability + 15 extra = 35 ---
describe('edge cases', () => {
  it('all 9 actions in 9-entry summarise', () => {
    const e = actions.map((a,i)=>makeTestEntry({id:'e'+i,action:a}));
    const s = summarise(e);
    actions.forEach(a=>expect(s.byAction[a]).toBe(1));
    expect(s.totalEntries).toBe(9);
  });
  it('all 3 severities in 3-entry summarise', () => {
    const e = severities.map((sv,i)=>makeTestEntry({id:'e'+i,severity:sv}));
    severities.forEach(sv=>expect(summarise(e).bySeverity[sv]).toBe(1));
  });
  it('changedFields from diffObjects', () => {
    const ch = diffObjects({a:1,b:2,c:3},{a:1,b:99,c:100});
    expect(changedFields(ch).sort()).toEqual(['b','c']);
  });
  it('hasFieldChanged end-to-end', () => {
    const ch = diffObjects({name:'old',status:'open'},{name:'old',status:'closed'});
    expect(hasFieldChanged(ch,'status')).toBe(true);
    expect(hasFieldChanged(ch,'name')).toBe(false);
  });
  it('entryCount matches filterByUser length', () => {
    const e = makeEntries(30);
    expect(entryCount(e,'u1')).toBe(filterByUser(e,'u1').length);
  });
  it('summarise byUser matches entryCount', () => {
    const e = makeEntries(30);
    const s = summarise(e);
    ['u0','u1','u2'].forEach(uid=>expect(s.byUser[uid]).toBe(entryCount(e,uid)));
  });
  for (let i=0;i<20;i++) {
    it('deterministic_' + i, () => {
      const e = makeTestEntry({id:'stable-'+i,timestamp:1700000000000+i});
      const f1=formatEntry(e); const f2=formatEntry(e);
      expect(f1.id).toBe(f2.id);
      expect(f1.description).toBe(f2.description);
      expect(f1.timestamp).toBe(f2.timestamp);
    });
  }
  it('diffObjects false vs "false" is change', () => {
    expect(diffObjects({x:false},{x:'false'})).toHaveLength(1);
  });
  it('filterByDateRange from>to is empty', () => {
    expect(filterByDateRange(makeEntries(5),9999999,0)).toHaveLength(0);
  });
  it('formatEntries empty => empty array', () => expect(formatEntries([])).toEqual([]));
  it('recentEntries count 0 => empty', () => expect(recentEntries(makeEntries(5),0)).toHaveLength(0));
  it('filterByUser empty => empty', () => expect(filterByUser([],'u1')).toHaveLength(0));
  it('sortByTimestamp asc three items', () => {
    const e=[makeTestEntry({id:'a',timestamp:3}),makeTestEntry({id:'b',timestamp:1}),makeTestEntry({id:'c',timestamp:2})];
    const s=sortByTimestamp(e,'asc');
    expect(s[0].id).toBe('b'); expect(s[2].id).toBe('a');
  });
});

// --- 26. large batch summarise 30 ---
describe('large batch summarise', () => {
  for (let n=10;n<=39;n++) {
    it('batch_' + n + '_total', () => expect(summarise(makeEntries(n)).totalEntries).toBe(n));
  }
});

// --- 27. formatEntries order 20 ---
describe('formatEntries order', () => {
  for (let n=2;n<=21;n++) {
    it('order_' + n, () => {
      const e = makeEntries(n);
      formatEntries(e).forEach((f,i)=>expect(f.id).toBe(e[i].id));
    });
  }
});

// --- 28. isValidAction type narrowing ---
describe('isValidAction narrowing', () => {
  it('valid narrows correctly', () => {
    const s: string = 'create';
    if (isValidAction(s)) {
      expect(formatAction(s)).toBe('Created');
    } else {
      throw new Error('Expected true');
    }
  });
  it('invalid blocked', () => expect(isValidAction('not-an-action')).toBe(false));
  for (let i=0;i<9;i++) {
    it('valid_action_' + i, () => expect(isValidAction(actions[i] as string)).toBe(true));
  }
});

// --- 29. changedFields + hasFieldChanged combined 20 ---
describe('changedFields and hasFieldChanged combined', () => {
  for (let i=0;i<20;i++) {
    it('combined_' + i, () => {
      const ch: FieldChange[] = [{field:'target'+i,oldValue:'old',newValue:'new'}];
      expect(changedFields(ch).includes('target'+i)).toBe(true);
      expect(hasFieldChanged(ch,'target'+i)).toBe(true);
    });
  }
});

// --- 30. entryCount final stress 30 ---
describe('entryCount final stress', () => {
  for (let i=0;i<30;i++) {
    it('stress_' + i, () => {
      const poolSize = 5 + (i % 10);
      const target = 'stressUser' + i;
      const e = Array.from({length:poolSize},(_,j)=>
        makeTestEntry({id:'se'+j, userId: j%2===0 ? target : 'other'})
      );
      expect(entryCount(e, target)).toBe(e.filter(x=>x.userId===target).length);
    });
  }
});

// --- 31. diffObjects with numeric types 30 ---
describe('diffObjects numeric types', () => {
  for (let i = 0; i < 30; i++) {
    it('float_change_' + i, () => {
      const b: Record<string,unknown> = { v: i * 0.1 };
      const a: Record<string,unknown> = { v: i * 0.1 + 0.5 };
      const ch = diffObjects(b, a);
      expect(ch).toHaveLength(1);
      expect(ch[0].field).toBe('v');
    });
  }
});

// --- 32. filterByAction returns correct count 20 ---
describe('filterByAction count verification', () => {
  for (let i = 0; i < 20; i++) {
    it('action_count_' + i, () => {
      const target = actions[i % actions.length];
      const entries = makeEntries(18);
      const result = filterByAction(entries, target);
      const manual = entries.filter(e => e.action === target).length;
      expect(result).toHaveLength(manual);
    });
  }
});

// --- 33. filterBySeverity returns correct count 20 ---
describe('filterBySeverity count verification', () => {
  for (let i = 0; i < 20; i++) {
    it('severity_count_' + i, () => {
      const target = severities[i % severities.length];
      const entries = makeEntries(15);
      const result = filterBySeverity(entries, target);
      const manual = entries.filter(e => e.severity === target).length;
      expect(result).toHaveLength(manual);
    });
  }
});

// --- 34. recentEntries ids are the most recent 15 ---
describe('recentEntries id verification', () => {
  for (let i = 1; i <= 15; i++) {
    it('recent_' + i + '_ids_are_latest', () => {
      const entries = makeEntries(20);
      const sorted = sortByTimestamp(entries, 'desc');
      const recent = recentEntries(entries, i);
      recent.forEach((r, idx) => expect(r.id).toBe(sorted[idx].id));
    });
  }
});

// --- 35. summarise all actions pipeline 20 ---
describe('summarise multi-action pipeline', () => {
  for (let i = 0; i < 20; i++) {
    it('multi_action_pipeline_' + i, () => {
      const count = (i % 5) + 1;
      const action = actions[i % actions.length];
      const entries = Array.from({ length: count }, (_, j) =>
        makeTestEntry({ id: 'ma' + j, action })
      );
      const s = summarise(entries);
      expect(s.byAction[action]).toBe(count);
    });
  }
});

// --- 36. formatChange all severities with entry 10 ---
describe('formatEntry per severity with changes', () => {
  for (let i = 0; i < 10; i++) {
    it('entry_with_change_' + i, () => {
      const sev = severities[i % severities.length];
      const e = makeTestEntry({
        id: 'fc' + i,
        severity: sev,
        changes: [{ field: 'col' + i, oldValue: 'old' + i, newValue: 'new' + i }],
      });
      const f = formatEntry(e);
      expect(f.severity).toBe(sev);
      expect(f.details.length).toBeGreaterThan(0);
      expect(f.details[0]).toContain('col' + i);
    });
  }
});

// --- 37. sortByTimestamp with equal timestamps 10 ---
describe('sortByTimestamp equal timestamps', () => {
  for (let i = 0; i < 10; i++) {
    it('equal_ts_stable_' + i, () => {
      const ts = 1700000000000;
      const e = Array.from({ length: 5 }, (_, j) =>
        makeTestEntry({ id: 'eq' + j, timestamp: ts })
      );
      const sorted = sortByTimestamp(e, 'desc');
      expect(sorted).toHaveLength(5);
      sorted.forEach(x => expect(x.timestamp).toBe(ts));
    });
  }
});

// --- 38. isValidAction + isValidSeverity combined 20 ---
describe('isValidAction and isValidSeverity combined', () => {
  for (let i = 0; i < 20; i++) {
    it('valid_pair_' + i, () => {
      const a: string = actions[i % actions.length];
      const s: string = severities[i % severities.length];
      expect(isValidAction(a)).toBe(true);
      expect(isValidSeverity(s)).toBe(true);
    });
  }
});

// --- 39. entryCount after filterByAction 20 ---
describe('entryCount after filterByAction', () => {
  for (let i = 0; i < 20; i++) {
    it('entryCount_after_filterByAction_' + i, () => {
      const action = actions[i % actions.length];
      const entries = makeEntries(18);
      const filtered = filterByAction(entries, action);
      expect(entryCount(filtered)).toBe(filtered.length);
    });
  }
});

// --- 40. formatTimestamp consistent per locale 10 ---
describe('formatTimestamp consistent per locale', () => {
  for (let i = 0; i < 10; i++) {
    it('locale_consistent_' + i, () => {
      const ts = 1700000000000 + i * 3600000;
      const r1 = formatTimestamp(ts, 'en-GB');
      const r2 = formatTimestamp(ts, 'en-GB');
      expect(r1).toBe(r2);
    });
  }
});
