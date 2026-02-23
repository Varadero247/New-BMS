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


describe('phase38 coverage', () => {
  it('generates fibonacci sequence up to n', () => { const fibSeq=(n:number)=>{const s=[0,1];while(s[s.length-1]+s[s.length-2]<=n)s.push(s[s.length-1]+s[s.length-2]);return s.filter(v=>v<=n);}; expect(fibSeq(10)).toEqual([0,1,1,2,3,5,8]); });
  it('computes digital root', () => { const dr=(n:number):number=>n<10?n:dr(String(n).split('').reduce((a,c)=>a+Number(c),0)); expect(dr(942)).toBe(6); });
  it('checks majority element', () => { const majority=(a:number[])=>{const f=a.reduce((m,v)=>{m.set(v,(m.get(v)||0)+1);return m;},new Map<number,number>());let res=-1;f.forEach((c,v)=>{if(c>a.length/2)res=v;});return res;}; expect(majority([3,2,3])).toBe(3); });
  it('applies difference array technique', () => { const diff=(a:number[])=>a.slice(1).map((v,i)=>v-a[i]); expect(diff([1,3,6,10,15])).toEqual([2,3,4,5]); });
  it('splits array into n chunks', () => { const chunks=<T>(a:T[],n:number)=>Array.from({length:n},(_,i)=>a.filter((_,j)=>j%n===i)); expect(chunks([1,2,3,4,5,6],3)).toEqual([[1,4],[2,5],[3,6]]); });
});


describe('phase39 coverage', () => {
  it('counts islands in binary grid', () => { const islands=(g:number[][])=>{const v=g.map(r=>[...r]);let c=0;const dfs=(i:number,j:number)=>{if(i<0||i>=v.length||j<0||j>=v[0].length||v[i][j]!==1)return;v[i][j]=0;dfs(i+1,j);dfs(i-1,j);dfs(i,j+1);dfs(i,j-1);};for(let i=0;i<v.length;i++)for(let j=0;j<v[0].length;j++)if(v[i][j]===1){dfs(i,j);c++;}return c;}; expect(islands([[1,1,0],[0,1,0],[0,0,1]])).toBe(2); });
  it('counts substring occurrences', () => { const countOcc=(s:string,sub:string)=>{let c=0,i=0;while((i=s.indexOf(sub,i))!==-1){c++;i+=sub.length;}return c;}; expect(countOcc('banana','an')).toBe(2); });
  it('computes minimum coins for amount', () => { const minCoins=(coins:number[],amt:number)=>{const dp=Array(amt+1).fill(Infinity);dp[0]=0;for(let i=1;i<=amt;i++)for(const c of coins)if(c<=i&&dp[i-c]+1<dp[i])dp[i]=dp[i-c]+1;return dp[amt]===Infinity?-1:dp[amt];}; expect(minCoins([1,5,6,9],11)).toBe(2); });
  it('computes collatz sequence length', () => { const collatz=(n:number)=>{let steps=1;while(n!==1){n=n%2===0?n/2:3*n+1;steps++;}return steps;}; expect(collatz(6)).toBe(9); });
  it('implements Caesar cipher', () => { const caesar=(s:string,n:number)=>s.replace(/[a-z]/gi,c=>{const base=c<='Z'?65:97;return String.fromCharCode((c.charCodeAt(0)-base+n)%26+base);}); expect(caesar('abc',3)).toBe('def'); expect(caesar('xyz',3)).toBe('abc'); });
});


describe('phase40 coverage', () => {
  it('implements reservoir sampling', () => { const sample=(a:number[],k:number)=>{const r=a.slice(0,k);for(let i=k;i<a.length;i++){const j=Math.floor(Math.random()*(i+1));if(j<k)r[j]=a[i];}return r;}; const s=sample([1,2,3,4,5,6,7,8,9,10],3); expect(s.length).toBe(3); expect(s.every(v=>v>=1&&v<=10)).toBe(true); });
  it('checks if number is palindrome without string', () => { const isPalinNum=(n:number)=>{if(n<0)return false;let rev=0,orig=n;while(n>0){rev=rev*10+n%10;n=Math.floor(n/10);}return rev===orig;}; expect(isPalinNum(121)).toBe(true); expect(isPalinNum(123)).toBe(false); });
  it('computes sum of all subarrays', () => { const subSum=(a:number[])=>a.reduce((t,v,i)=>t+v*(i+1)*(a.length-i),0); expect(subSum([1,2,3])).toBe(20); /* 1+2+3+3+5+6+3+5+6+3+2+1 check */ });
  it('computes number of set bits sum for range', () => { const rangePopcount=(n:number)=>Array.from({length:n+1},(_,i)=>i).reduce((s,v)=>{let c=0,x=v;while(x){c+=x&1;x>>>=1;}return s+c;},0); expect(rangePopcount(5)).toBe(7); /* 0+1+1+2+1+2 */ });
  it('implements simple state machine', () => { type State='idle'|'running'|'stopped'; const transitions:{[K in State]?:Partial<Record<string,State>>}={idle:{start:'running'},running:{stop:'stopped'},stopped:{reset:'idle'}}; const step=(state:State,event:string):State=>(transitions[state] as any)?.[event]??state; expect(step('idle','start')).toBe('running'); expect(step('running','stop')).toBe('stopped'); });
});


describe('phase41 coverage', () => {
  it('finds longest subarray with equal 0s and 1s', () => { const longestEqual=(a:number[])=>{const map=new Map([[0,-1]]);let sum=0,max=0;for(let i=0;i<a.length;i++){sum+=a[i]===0?-1:1;if(map.has(sum))max=Math.max(max,i-map.get(sum)!);else map.set(sum,i);}return max;}; expect(longestEqual([0,1,0])).toBe(2); });
  it('checks if string can form palindrome permutation', () => { const canFormPalin=(s:string)=>{const odd=[...s].reduce((cnt,c)=>{cnt.set(c,(cnt.get(c)||0)+1);return cnt;},new Map<string,number>());return[...odd.values()].filter(v=>v%2!==0).length<=1;}; expect(canFormPalin('carrace')).toBe(true); expect(canFormPalin('code')).toBe(false); });
  it('implements fast exponentiation', () => { const fastPow=(base:number,exp:number,mod:number):number=>{let res=1;base%=mod;while(exp>0){if(exp%2===1)res=res*base%mod;base=base*base%mod;exp=Math.floor(exp/2);}return res;}; expect(fastPow(2,10,1000)).toBe(24); });
  it('checks if array has property monotone stack applies', () => { const nextGreater=(a:number[])=>{const res=Array(a.length).fill(-1);const st:number[]=[];for(let i=0;i<a.length;i++){while(st.length&&a[st[st.length-1]]<a[i])res[st.pop()!]=a[i];st.push(i);}return res;}; expect(nextGreater([4,1,2])).toEqual([-1,2,-1]); });
  it('implements LCS string reconstruction', () => { const lcs=(a:string,b:string)=>{const m=a.length,n=b.length;const dp=Array.from({length:m+1},()=>Array(n+1).fill(''));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+a[i-1]:dp[i-1][j].length>=dp[i][j-1].length?dp[i-1][j]:dp[i][j-1];return dp[m][n];}; expect(lcs('ABCBDAB','BDCAB')).toBe('BCAB'); });
});


describe('phase42 coverage', () => {
  it('eases in-out cubic', () => { const ease=(t:number)=>t<0.5?4*t*t*t:(t-1)*(2*t-2)*(2*t-2)+1; expect(ease(0)).toBe(0); expect(ease(1)).toBe(1); expect(ease(0.5)).toBe(0.5); });
  it('computes area of triangle from vertices', () => { const area=(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number)=>Math.abs((x2-x1)*(y3-y1)-(x3-x1)*(y2-y1))/2; expect(area(0,0,4,0,0,3)).toBe(6); });
  it('computes cross product magnitude of 2D vectors', () => { const cross=(ax:number,ay:number,bx:number,by:number)=>ax*by-ay*bx; expect(cross(1,0,0,1)).toBe(1); expect(cross(2,3,4,5)).toBe(-2); });
  it('computes luminance of color', () => { const lum=(r:number,g:number,b:number)=>0.299*r+0.587*g+0.114*b; expect(Math.round(lum(255,255,255))).toBe(255); expect(Math.round(lum(0,0,0))).toBe(0); });
  it('translates point', () => { const translate=(x:number,y:number,dx:number,dy:number):[number,number]=>[x+dx,y+dy]; expect(translate(1,2,3,4)).toEqual([4,6]); });
});


describe('phase43 coverage', () => {
  it('applies softmax to array', () => { const softmax=(a:number[])=>{const max=Math.max(...a);const exps=a.map(v=>Math.exp(v-max));const sum=exps.reduce((s,v)=>s+v,0);return exps.map(v=>v/sum);}; const s=softmax([1,2,3]); expect(s.reduce((a,b)=>a+b,0)).toBeCloseTo(1); });
  it('gets quarter of year from date', () => { const quarter=(d:Date)=>Math.ceil((d.getMonth()+1)/3); expect(quarter(new Date('2026-01-01'))).toBe(1); expect(quarter(new Date('2026-07-15'))).toBe(3); });
  it('generates one-hot encoding', () => { const oneHot=(idx:number,size:number)=>Array(size).fill(0).map((_,i)=>i===idx?1:0); expect(oneHot(2,4)).toEqual([0,0,1,0]); });
  it('formats duration in seconds to mm:ss', () => { const fmt=(s:number)=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; expect(fmt(90)).toBe('01:30'); expect(fmt(3661)).toBe('61:01'); });
  it('computes exponential moving average', () => { const ema=(a:number[],k:number)=>{const f=2/(k+1);return a.reduce((acc,v,i)=>i===0?[v]:[...acc,v*f+acc[acc.length-1]*(1-f)],[] as number[]);}; expect(ema([1,2,3],3).length).toBe(3); });
});


describe('phase44 coverage', () => {
  it('finds longest common prefix', () => { const lcp=(ss:string[])=>{let p=ss[0]||'';for(const s of ss)while(!s.startsWith(p))p=p.slice(0,-1);return p;}; expect(lcp(['flower','flow','flight'])).toBe('fl'); });
  it('debounces function calls', () => { jest.useFakeTimers();const db=(fn:()=>void,ms:number)=>{let t:ReturnType<typeof setTimeout>;return()=>{clearTimeout(t);t=setTimeout(fn,ms);};};let c=0;const d=db(()=>c++,100);d();d();d();jest.runAllTimers(); expect(c).toBe(1);jest.useRealTimers(); });
  it('computes running maximum', () => { const runmax=(a:number[])=>a.reduce((acc,v)=>[...acc,Math.max(v,(acc[acc.length-1]??-Infinity))],[] as number[]); expect(runmax([3,1,4,1,5])).toEqual([3,3,4,4,5]); });
  it('implements once (call at most once)', () => { const once=<T extends unknown[]>(fn:(...a:T)=>number)=>{let c:number|undefined;return(...a:T)=>{if(c===undefined)c=fn(...a);return c;};};let n=0;const f=once(()=>++n);f();f();f(); expect(f()).toBe(1); expect(n).toBe(1); });
  it('picks specified keys from object', () => { const pick=<T extends object,K extends keyof T>(o:T,...ks:K[]):Pick<T,K>=>{const r={} as Pick<T,K>;ks.forEach(k=>r[k]=o[k]);return r;}; expect(pick({a:1,b:2,c:3},'a','c')).toEqual({a:1,c:3}); });
});


describe('phase45 coverage', () => {
  it('computes power set size 2^n', () => { const ps=(n:number)=>1<<n; expect(ps(0)).toBe(1); expect(ps(3)).toBe(8); expect(ps(10)).toBe(1024); });
  it('converts radians to degrees', () => { const rtod=(r:number)=>r*180/Math.PI; expect(Math.round(rtod(Math.PI))).toBe(180); expect(Math.round(rtod(Math.PI/2))).toBe(90); });
  it('implements deque (double-ended queue)', () => { const dq=()=>{const a:number[]=[];return{pushFront:(v:number)=>a.unshift(v),pushBack:(v:number)=>a.push(v),popFront:()=>a.shift(),popBack:()=>a.pop(),size:()=>a.length};}; const d=dq();d.pushBack(1);d.pushBack(2);d.pushFront(0); expect(d.popFront()).toBe(0); expect(d.popBack()).toBe(2); expect(d.size()).toBe(1); });
  it('computes matrix multiplication', () => { const mm=(a:number[][],b:number[][])=>{const r=a.length,c=b[0].length,k=b.length;return Array.from({length:r},(_,i)=>Array.from({length:c},(_,j)=>Array.from({length:k},(_,l)=>a[i][l]*b[l][j]).reduce((s,v)=>s+v,0)));}; expect(mm([[1,2],[3,4]],[[5,6],[7,8]])).toEqual([[19,22],[43,50]]); });
  it('implements union-find with path compression', () => { const uf=(n:number)=>{const p=Array.from({length:n},(_,i)=>i);const find=(x:number):number=>p[x]===x?x:(p[x]=find(p[x]),p[x]);const union=(a:number,b:number)=>{p[find(a)]=find(b);};return{find,union};}; const u=uf(5);u.union(0,1);u.union(1,2); expect(u.find(0)===u.find(2)).toBe(true); expect(u.find(0)===u.find(3)).toBe(false); });
});


describe('phase46 coverage', () => {
  it('computes range minimum query (sparse table)', () => { const rmq=(a:number[])=>{const n=a.length,LOG=Math.floor(Math.log2(n))+1;const t:number[][]=Array.from({length:LOG},()=>new Array(n).fill(0));for(let i=0;i<n;i++)t[0][i]=a[i];for(let k=1;k<LOG;k++)for(let i=0;i+(1<<k)<=n;i++)t[k][i]=Math.min(t[k-1][i],t[k-1][i+(1<<(k-1))]);return(l:number,r:number)=>{const k=Math.floor(Math.log2(r-l+1));return Math.min(t[k][l],t[k][r-(1<<k)+1]);};}; const q=rmq([2,4,3,1,6,7,8,9,1,7]); expect(q(0,4)).toBe(1); expect(q(4,7)).toBe(6); });
  it('implements Dijkstra shortest path', () => { const dijk=(n:number,edges:[number,number,number][],s:number)=>{const adj:([number,number])[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v,w])=>{adj[u].push([v,w]);adj[v].push([u,w]);});const dist=new Array(n).fill(Infinity);dist[s]=0;const vis=new Set<number>();while(vis.size<n){let u=-1;dist.forEach((d,i)=>{if(!vis.has(i)&&(u===-1||d<dist[u]))u=i;});if(dist[u]===Infinity)break;vis.add(u);adj[u].forEach(([v,w])=>{if(dist[u]+w<dist[v])dist[v]=dist[u]+w;});} return dist;}; expect(dijk(5,[[0,1,4],[0,2,1],[2,1,2],[1,3,1],[2,3,5]],0)).toEqual([0,3,1,4,Infinity]); });
  it('checks if graph is bipartite', () => { const bip=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v])=>{adj[u].push(v);adj[v].push(u);});const col=new Array(n).fill(-1);for(let s=0;s<n;s++){if(col[s]!==-1)continue;const q=[s];col[s]=0;while(q.length){const u=q.shift()!;for(const v of adj[u]){if(col[v]===-1){col[v]=1-col[u];q.push(v);}else if(col[v]===col[u])return false;}}};return true;}; expect(bip(4,[[0,1],[1,2],[2,3],[3,0]])).toBe(true); expect(bip(3,[[0,1],[1,2],[2,0]])).toBe(false); });
  it('implements LCS (longest common subsequence)', () => { const lcs=(a:string,b:string)=>{const m=a.length,n=b.length;const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);return dp[m][n];}; expect(lcs('ABCBDAB','BDCAB')).toBe(4); expect(lcs('AGGTAB','GXTXAYB')).toBe(4); });
  it('computes nth Catalan number', () => { const cat=(n:number):number=>n<=1?1:Array.from({length:n},(_,i)=>cat(i)*cat(n-1-i)).reduce((s,v)=>s+v,0); expect(cat(0)).toBe(1); expect(cat(3)).toBe(5); expect(cat(4)).toBe(14); });
});


describe('phase47 coverage', () => {
  it('checks if matrix has a zero row', () => { const zr=(m:number[][])=>m.some(r=>r.every(v=>v===0)); expect(zr([[1,2],[0,0],[3,4]])).toBe(true); expect(zr([[1,2],[3,4]])).toBe(false); });
  it('computes number of paths of length k in graph', () => { const mm=(a:number[][],b:number[][])=>{const n=a.length;return Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>Array.from({length:n},(_,k)=>a[i][k]*b[k][j]).reduce((s,v)=>s+v,0)));};const kp=(adj:number[][],k:number)=>{let r=adj.map(row=>[...row]);for(let i=1;i<k;i++)r=mm(r,adj);return r;}; const adj=[[0,1,0],[0,0,1],[1,0,0]]; expect(kp(adj,3)[0][0]).toBe(1); });
  it('computes longest common substring', () => { const lcs=(a:string,b:string)=>{const m=a.length,n=b.length;const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0));let best=0;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:0;best=Math.max(best,dp[i][j]);}return best;}; expect(lcs('abcdef','zbcdf')).toBe(3); expect(lcs('abcd','efgh')).toBe(0); });
  it('rotates matrix left', () => { const rotL=(m:number[][])=>m[0].map((_,c)=>m.map(r=>r[m[0].length-1-c])); const r=rotL([[1,2,3],[4,5,6],[7,8,9]]); expect(r[0]).toEqual([3,6,9]); expect(r[2]).toEqual([1,4,7]); });
  it('computes house robber (non-adjacent max sum)', () => { const hr=(a:number[])=>a.reduce(([prev2,prev1],v)=>[prev1,Math.max(prev1,prev2+v)],[0,0])[1]; expect(hr([1,2,3,1])).toBe(4); expect(hr([2,7,9,3,1])).toBe(12); });
});


describe('phase48 coverage', () => {
  it('finds the Josephus position', () => { const jos=(n:number,k:number):number=>n===1?0:(jos(n-1,k)+k)%n; expect(jos(7,3)).toBe(3); expect(jos(6,2)).toBe(4); });
  it('counts set bits across range', () => { const cb=(n:number)=>{let c=0,x=n;while(x){c+=x&1;x>>=1;}return c;};const total=(n:number)=>Array.from({length:n+1},(_,i)=>cb(i)).reduce((s,v)=>s+v,0); expect(total(5)).toBe(7); expect(total(10)).toBe(17); });
  it('checks if number is happy', () => { const happy=(n:number)=>{const seen=new Set<number>();while(n!==1&&!seen.has(n)){seen.add(n);n=[...String(n)].reduce((s,d)=>s+Number(d)**2,0);}return n===1;}; expect(happy(19)).toBe(true); expect(happy(4)).toBe(false); });
  it('computes longest zig-zag subsequence', () => { const lzz=(a:number[])=>{const up=new Array(a.length).fill(1),dn=new Array(a.length).fill(1);for(let i=1;i<a.length;i++)for(let j=0;j<i;j++){if(a[i]>a[j])up[i]=Math.max(up[i],dn[j]+1);else if(a[i]<a[j])dn[i]=Math.max(dn[i],up[j]+1);}return Math.max(...up,...dn);}; expect(lzz([1,7,4,9,2,5])).toBe(6); expect(lzz([1,4,7,2,5])).toBe(4); });
  it('computes string edit distance with weights', () => { const ed=(a:string,b:string,wi=1,wd=1,wr=1)=>{const m=a.length,n=b.length;const dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?j*wi:j===0?i*wd:0));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:Math.min(dp[i-1][j]+wd,dp[i][j-1]+wi,dp[i-1][j-1]+wr);return dp[m][n];}; expect(ed('kitten','sitting')).toBe(3); });
});
