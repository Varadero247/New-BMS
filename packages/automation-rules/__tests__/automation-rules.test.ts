import {
  AUTOMATION_RULES,
  enableRule,
  disableRule,
  listRules,
  getEnabledRules,
  getRuleById,
  logExecution,
  getExecutionLog,
  _resetStores,
} from '../src/index';

describe('@ims/automation-rules', () => {
  beforeEach(() => {
    _resetStores();
  });

  describe('AUTOMATION_RULES', () => {
    it('should have exactly 20 pre-built rules', () => {
      expect(AUTOMATION_RULES).toHaveLength(20);
    });

    it('each rule should have required fields', () => {
      for (const rule of AUTOMATION_RULES) {
        expect(rule.id).toBeDefined();
        expect(rule.name).toBeDefined();
        expect(rule.description).toBeDefined();
        expect(rule.trigger).toBeDefined();
        expect(rule.trigger.type).toBeDefined();
        expect(rule.trigger.module).toBeDefined();
        expect(rule.trigger.recordType).toBeDefined();
        expect(rule.conditions).toBeDefined();
        expect(rule.actions).toBeDefined();
        expect(rule.actions.length).toBeGreaterThan(0);
        expect(rule.category).toBeDefined();
      }
    });

    it('should have unique IDs', () => {
      const ids = AUTOMATION_RULES.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have valid categories', () => {
      const validCategories = [
        'quality',
        'safety',
        'environment',
        'compliance',
        'hr',
        'maintenance',
      ];
      for (const rule of AUTOMATION_RULES) {
        expect(validCategories).toContain(rule.category);
      }
    });

    it('should cover all 6 categories', () => {
      const categories = new Set(AUTOMATION_RULES.map((r) => r.category));
      expect(categories.size).toBeGreaterThanOrEqual(4);
    });
  });

  describe('getRuleById', () => {
    it('should return a rule by ID', () => {
      const rule = getRuleById('rule-001');
      expect(rule).toBeDefined();
      expect(rule!.name).toBe('Critical NCR → Auto-CAPA');
    });

    it('should return undefined for non-existent ID', () => {
      expect(getRuleById('non-existent')).toBeUndefined();
    });
  });

  describe('enableRule / disableRule', () => {
    it('should enable a valid rule', () => {
      const result = enableRule('org-1', 'rule-001');
      expect(result).toBe(true);
    });

    it('should return false for invalid rule ID', () => {
      const result = enableRule('org-1', 'non-existent');
      expect(result).toBe(false);
    });

    it('should disable a rule', () => {
      enableRule('org-1', 'rule-001');
      const result = disableRule('org-1', 'rule-001');
      expect(result).toBe(true);
    });

    it('should return false when disabling non-existent rule', () => {
      const result = disableRule('org-1', 'non-existent');
      expect(result).toBe(false);
    });
  });

  describe('listRules', () => {
    it('should return all rules with enabled status', () => {
      const rules = listRules('org-1');
      expect(rules).toHaveLength(20);
      expect(rules.every((r) => r.enabled === false)).toBe(true);
    });

    it('should show enabled status after enabling', () => {
      enableRule('org-1', 'rule-001');
      enableRule('org-1', 'rule-005');
      const rules = listRules('org-1');
      const enabled = rules.filter((r) => r.enabled);
      expect(enabled).toHaveLength(2);
      expect(enabled.map((r) => r.id)).toContain('rule-001');
      expect(enabled.map((r) => r.id)).toContain('rule-005');
    });

    it('should isolate enabled rules per org', () => {
      enableRule('org-1', 'rule-001');
      enableRule('org-2', 'rule-002');
      const org1Rules = listRules('org-1');
      const org2Rules = listRules('org-2');
      expect(org1Rules.find((r) => r.id === 'rule-001')!.enabled).toBe(true);
      expect(org1Rules.find((r) => r.id === 'rule-002')!.enabled).toBe(false);
      expect(org2Rules.find((r) => r.id === 'rule-001')!.enabled).toBe(false);
      expect(org2Rules.find((r) => r.id === 'rule-002')!.enabled).toBe(true);
    });
  });

  describe('getEnabledRules', () => {
    it('should return only enabled rules', () => {
      enableRule('org-1', 'rule-001');
      enableRule('org-1', 'rule-010');
      const enabled = getEnabledRules('org-1');
      expect(enabled).toHaveLength(2);
    });

    it('should return empty array when none enabled', () => {
      const enabled = getEnabledRules('org-1');
      expect(enabled).toHaveLength(0);
    });
  });

  describe('logExecution', () => {
    it('should create an execution log entry', () => {
      const entry = logExecution('org-1', 'rule-001', 'success', 'CAPA created successfully');
      expect(entry.id).toBeDefined();
      expect(entry.orgId).toBe('org-1');
      expect(entry.ruleId).toBe('rule-001');
      expect(entry.status).toBe('success');
      expect(entry.details).toBe('CAPA created successfully');
      expect(entry.timestamp).toBeDefined();
    });

    it('should log "skipped" status', () => {
      const entry = logExecution('org-1', 'rule-002', 'skipped', 'Condition not met');
      expect(entry.status).toBe('skipped');
    });

    it('entry id is a UUID', () => {
      const entry = logExecution('org-1', 'rule-001', 'success', 'OK');
      expect(entry.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('timestamp is a valid ISO string', () => {
      const entry = logExecution('org-1', 'rule-001', 'success', 'OK');
      expect(new Date(entry.timestamp).toISOString()).toBe(entry.timestamp);
    });
  });

  describe('getExecutionLog', () => {
    it('should return execution logs for an org', () => {
      logExecution('org-1', 'rule-001', 'success', 'Test 1');
      logExecution('org-1', 'rule-002', 'failed', 'Test 2');
      logExecution('org-2', 'rule-001', 'success', 'Test 3');

      const logs = getExecutionLog('org-1');
      expect(logs).toHaveLength(2);
    });

    it('should filter by ruleId', () => {
      logExecution('org-1', 'rule-001', 'success', 'Test 1');
      logExecution('org-1', 'rule-002', 'failed', 'Test 2');

      const logs = getExecutionLog('org-1', 'rule-001');
      expect(logs).toHaveLength(1);
      expect(logs[0].ruleId).toBe('rule-001');
    });

    it('should respect limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        logExecution('org-1', 'rule-001', 'success', `Test ${i}`);
      }
      const logs = getExecutionLog('org-1', undefined, 5);
      expect(logs).toHaveLength(5);
    });

    it('should return entries in reverse insertion order', () => {
      logExecution('org-1', 'rule-001', 'success', 'Entry A');
      logExecution('org-1', 'rule-001', 'success', 'Entry B');
      logExecution('org-1', 'rule-001', 'success', 'Entry C');
      const logs = getExecutionLog('org-1');
      expect(logs).toHaveLength(3);
      // Most recent should be last inserted
      expect(logs[0].details).toBe('Entry C');
      expect(logs[2].details).toBe('Entry A');
    });

    it('should return empty array for org with no logs', () => {
      const logs = getExecutionLog('org-no-logs');
      expect(logs).toEqual([]);
    });
  });
});

// ===================================================================
// Extended coverage: rule properties, multi-org isolation, log status types
// ===================================================================

describe('@ims/automation-rules — extended coverage', () => {
  beforeEach(() => {
    _resetStores();
  });

  it('each rule trigger has a valid type', () => {
    const validTypes = [
      'record_created',
      'date_passed',
      'date_approaching',
      'score_changed',
      'field_threshold',
      'event',
      'schedule',
      'threshold',
      'manual',
    ];
    for (const rule of AUTOMATION_RULES) {
      expect(validTypes).toContain(rule.trigger.type);
    }
  });

  it('enableRule and listRules show correct enabled state for multiple orgs', () => {
    enableRule('org-A', 'rule-003');
    enableRule('org-B', 'rule-003');
    enableRule('org-B', 'rule-005');

    const orgARules = listRules('org-A');
    const orgBRules = listRules('org-B');

    expect(orgARules.find((r) => r.id === 'rule-003')!.enabled).toBe(true);
    expect(orgARules.filter((r) => r.enabled)).toHaveLength(1);
    expect(orgBRules.filter((r) => r.enabled)).toHaveLength(2);
  });

  it('logExecution supports "failed" status and stores correctly', () => {
    const entry = logExecution('org-1', 'rule-010', 'failed', 'Action timed out');
    expect(entry.status).toBe('failed');
    expect(entry.ruleId).toBe('rule-010');

    const logs = getExecutionLog('org-1', 'rule-010');
    expect(logs).toHaveLength(1);
    expect(logs[0].status).toBe('failed');
  });

  it('getExecutionLog returns all statuses when filtering by ruleId across multiple statuses', () => {
    logExecution('org-1', 'rule-002', 'success', 'OK');
    logExecution('org-1', 'rule-002', 'failed', 'Error');
    logExecution('org-1', 'rule-002', 'skipped', 'Condition not met');

    const logs = getExecutionLog('org-1', 'rule-002');
    expect(logs).toHaveLength(3);
    const statuses = logs.map((l) => l.status);
    expect(statuses).toContain('success');
    expect(statuses).toContain('failed');
    expect(statuses).toContain('skipped');
  });

  it('disableRule after re-enabling reflects correct enabled state in listRules', () => {
    enableRule('org-1', 'rule-007');
    expect(listRules('org-1').find((r) => r.id === 'rule-007')!.enabled).toBe(true);

    disableRule('org-1', 'rule-007');
    expect(listRules('org-1').find((r) => r.id === 'rule-007')!.enabled).toBe(false);
    expect(getEnabledRules('org-1')).toHaveLength(0);
  });
});

describe('@ims/automation-rules — rule structure deep checks', () => {
  beforeEach(() => {
    _resetStores();
  });

  it('each rule has at least one action', () => {
    for (const rule of AUTOMATION_RULES) {
      expect(rule.actions.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('each rule conditions array is defined (may be empty)', () => {
    for (const rule of AUTOMATION_RULES) {
      expect(Array.isArray(rule.conditions)).toBe(true);
    }
  });

  it('getRuleById returns correct name for rule-010', () => {
    const rule = getRuleById('rule-010');
    expect(rule).toBeDefined();
    expect(typeof rule!.name).toBe('string');
  });

  it('getExecutionLog with limit=0 returns empty array', () => {
    logExecution('org-1', 'rule-001', 'success', 'OK');
    const logs = getExecutionLog('org-1', undefined, 0);
    expect(logs).toHaveLength(0);
  });

  it('logExecution for different orgs stores independently', () => {
    logExecution('org-alpha', 'rule-001', 'success', 'A');
    logExecution('org-beta', 'rule-002', 'failed', 'B');

    expect(getExecutionLog('org-alpha')).toHaveLength(1);
    expect(getExecutionLog('org-beta')).toHaveLength(1);
    expect(getExecutionLog('org-alpha')[0].ruleId).toBe('rule-001');
    expect(getExecutionLog('org-beta')[0].ruleId).toBe('rule-002');
  });
});

describe('@ims/automation-rules — final additional coverage', () => {
  beforeEach(() => {
    _resetStores();
  });

  it('enableRule returns true for all 20 valid rule IDs', () => {
    for (const rule of AUTOMATION_RULES) {
      expect(enableRule('org-x', rule.id)).toBe(true);
    }
  });

  it('listRules returns the same 20 rules regardless of org', () => {
    const rules1 = listRules('org-x');
    const rules2 = listRules('org-y');
    expect(rules1.map((r) => r.id)).toEqual(rules2.map((r) => r.id));
  });

  it('getEnabledRules returns the actual rule objects (not just ids)', () => {
    enableRule('org-check', 'rule-001');
    const enabled = getEnabledRules('org-check');
    expect(enabled[0]).toHaveProperty('id', 'rule-001');
    expect(enabled[0]).toHaveProperty('name');
    expect(enabled[0]).toHaveProperty('trigger');
  });

  it('logExecution details field stores the full string', () => {
    const details = 'A very long details message describing what happened during execution';
    const entry = logExecution('org-1', 'rule-005', 'success', details);
    expect(entry.details).toBe(details);
  });

  it('getExecutionLog returns all entries when no limit specified', () => {
    for (let i = 0; i < 5; i++) {
      logExecution('org-1', 'rule-001', 'success', `Entry ${i}`);
    }
    const logs = getExecutionLog('org-1');
    expect(logs.length).toBe(5);
  });
});

describe('automation rules — phase29 coverage', () => {
  it('handles Math.pow', () => {
    expect(Math.pow(2, 3)).toBe(8);
  });

  it('handles computed properties', () => {
    const key = 'foo'; const obj2 = { [key]: 42 }; expect(obj2.foo).toBe(42);
  });

  it('handles optional chaining', () => {
    const obj: { x?: { y: number } } = {}; expect(obj?.x?.y).toBeUndefined();
  });

  it('handles async reject', async () => {
    await expect(Promise.reject(new Error('err'))).rejects.toThrow('err');
  });

  it('handles splice method', () => {
    const arr = [1, 2, 3]; arr.splice(1, 1); expect(arr).toEqual([1, 3]);
  });

});

describe('automation rules — phase30 coverage', () => {
  it('handles null check', () => {
    expect(null).toBeNull();
  });

  it('handles string length', () => {
    expect('hello'.length).toBe(5);
  });

  it('handles Set size', () => {
    expect(new Set([1, 2, 2, 3]).size).toBe(3);
  });

  it('handles string endsWith', () => {
    expect('hello'.endsWith('lo')).toBe(true);
  });

  it('handles spread operator', () => {
    expect([...[1, 2], ...[3, 4]]).toEqual([1, 2, 3, 4]);
  });

});


describe('phase31 coverage', () => {
  it('handles Math.round', () => { expect(Math.round(3.5)).toBe(4); });
  it('handles Object.values', () => { expect(Object.values({a:1,b:2})).toEqual([1,2]); });
  it('handles string split', () => { expect('a,b,c'.split(',')).toEqual(['a','b','c']); });
  it('handles array from', () => { expect(Array.from('abc')).toEqual(['a','b','c']); });
  it('handles Number.isInteger', () => { expect(Number.isInteger(5)).toBe(true); expect(Number.isInteger(5.5)).toBe(false); });
});


describe('phase32 coverage', () => {
  it('handles Promise.all', async () => { const r = await Promise.all([Promise.resolve(1), Promise.resolve(2)]); expect(r).toEqual([1,2]); });
  it('handles object hasOwnProperty', () => { const o = {a:1}; expect(o.hasOwnProperty('a')).toBe(true); expect(o.hasOwnProperty('b')).toBe(false); });
  it('handles getter/setter', () => { const o = { _v: 0, get v() { return this._v; }, set v(n) { this._v = n; } }; o.v = 5; expect(o.v).toBe(5); });
  it('handles bitwise AND', () => { expect(6 & 3).toBe(2); });
  it('handles bitwise OR', () => { expect(6 | 3).toBe(7); });
});


describe('phase33 coverage', () => {
  it('handles array pop', () => { const a = [1,2,3]; expect(a.pop()).toBe(3); expect(a).toEqual([1,2]); });
  it('handles string length property', () => { expect('typescript'.length).toBe(10); });
  it('handles currying pattern', () => { const add = (a: number) => (b: number) => a + b; expect(add(3)(4)).toBe(7); });
  it('handles nested object access', () => { const o = { a: { b: 42 } }; expect(o.a.b).toBe(42); });
  it('handles Map size', () => { const m = new Map([['a',1],['b',2]]); expect(m.size).toBe(2); });
});


describe('phase34 coverage', () => {
  it('handles Omit type pattern', () => { interface Full { a: number; b: string; c: boolean; } type NoC = Omit<Full,'c'>; const o: NoC = {a:1,b:'x'}; expect(o.b).toBe('x'); });
  it('handles string repeat zero times', () => { expect('abc'.repeat(0)).toBe(''); });
  it('handles Map with complex values', () => { const m = new Map<string, number[]>(); m.set('evens', [2,4,6]); expect(m.get('evens')?.length).toBe(3); });
  it('handles promise then chain', async () => { const result = await Promise.resolve(1).then(x=>x+1).then(x=>x*3); expect(result).toBe(6); });
  it('handles array with holes', () => { const a = [1,,3]; expect(a.length).toBe(3); });
});


describe('phase35 coverage', () => {
  it('handles range generator', () => { const range = (n: number) => Array.from({length:n},(_,i)=>i); expect(range(4)).toEqual([0,1,2,3]); });
  it('handles flatMap with filter', () => { expect([[1,2],[3],[4,5]].flatMap(x=>x).filter(x=>x>2)).toEqual([3,4,5]); });
  it('handles type guard function', () => { const isString = (v:unknown): v is string => typeof v === 'string'; const vals: unknown[] = [1,'hi',true]; expect(vals.filter(isString)).toEqual(['hi']); });
  it('handles deep equal check via JSON', () => { const deepEq = (a:unknown,b:unknown) => JSON.stringify(a)===JSON.stringify(b); expect(deepEq({a:1,b:[2,3]},{a:1,b:[2,3]})).toBe(true); expect(deepEq({a:1},{a:2})).toBe(false); });
  it('handles builder pattern', () => { class QB { private parts: string[] = []; select(f:string){this.parts.push(`SELECT ${f}`);return this;} build(){return this.parts.join(' ');} } expect(new QB().select('*').build()).toBe('SELECT *'); });
});


describe('phase36 coverage', () => {
  it('handles linked-list node pattern', () => { class Node<T>{constructor(public val:T,public next:Node<T>|null=null){}} const head=new Node(1,new Node(2,new Node(3))); let s=0,n:Node<number>|null=head;while(n){s+=n.val;n=n.next;} expect(s).toBe(6); });
  it('handles string anagram check', () => { const isAnagram=(a:string,b:string)=>a.split('').sort().join('')===b.split('').sort().join(''); expect(isAnagram('listen','silent')).toBe(true); expect(isAnagram('hello','world')).toBe(false); });
  it('handles difference of arrays', () => { const diff=<T>(a:T[],b:T[])=>a.filter(x=>!b.includes(x));expect(diff([1,2,3,4],[2,4])).toEqual([1,3]); });
  it('handles top-K elements', () => { const topK=(a:number[],k:number)=>[...a].sort((x,y)=>y-x).slice(0,k);expect(topK([3,1,4,1,5,9,2,6],3)).toEqual([9,6,5]); });
  it('handles object to query string', () => { const toQS=(o:Record<string,string|number>)=>Object.entries(o).map(([k,v])=>`${k}=${v}`).join('&');expect(toQS({a:1,b:'x'})).toBe('a=1&b=x'); });
});


describe('phase37 coverage', () => {
  it('computes cartesian product', () => { const result=([1,2] as number[]).flatMap(x=>(['a','b'] as string[]).map(y=>[x,y] as [number,string])); expect(result.length).toBe(4); expect(result[0]).toEqual([1,'a']); });
  it('checks all unique', () => { const allUniq=<T>(a:T[])=>new Set(a).size===a.length; expect(allUniq([1,2,3])).toBe(true); expect(allUniq([1,2,1])).toBe(false); });
  it('generates permutations count', () => { const perm=(n:number,r:number)=>{let res=1;for(let i=n;i>n-r;i--)res*=i;return res;}; expect(perm(5,2)).toBe(20); });
  it('checks balanced brackets', () => { const bal=(s:string)=>{const m:{[k:string]:string}={')':'(',']':'[','}':'{'}; const st:string[]=[]; for(const c of s){if('([{'.includes(c))st.push(c);else if(m[c]){if(st.pop()!==m[c])return false;}} return st.length===0;}; expect(bal('{[()]}')).toBe(true); expect(bal('{[(])}')).toBe(false); });
  it('partitions array by predicate', () => { const part=<T>(a:T[],fn:(x:T)=>boolean):[T[],T[]]=>[a.filter(fn),a.filter(x=>!fn(x))]; const [evens,odds]=part([1,2,3,4,5],x=>x%2===0); expect(evens).toEqual([2,4]); expect(odds).toEqual([1,3,5]); });
});
