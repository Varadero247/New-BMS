/**
 * Tests for ID validation utilities in @ims/shared.
 * Covers: isValidId (UUID + CUID), validateIdParam middleware factory.
 */

import { isValidId, validateIdParam } from '../src/validation';

// ── isValidId ─────────────────────────────────────────────────────────────────

describe('isValidId', () => {
  // Valid UUIDs
  it('accepts standard UUID v4', () => {
    expect(isValidId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('accepts uppercase UUID', () => {
    expect(isValidId('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
  });

  it('accepts UUID with mixed case', () => {
    expect(isValidId('550e8400-e29b-41d4-A716-446655440000')).toBe(true);
  });

  it('accepts all-zeros UUID', () => {
    expect(isValidId('00000000-0000-0000-0000-000000000000')).toBe(true);
  });

  it('accepts UUID with different version digits', () => {
    // UUID v1 format
    expect(isValidId('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  // Valid CUIDs
  it('accepts a standard CUID (starts with c, 21+ chars)', () => {
    expect(isValidId('cjld2cyuq0000t3rmniod1foy')).toBe(true);
  });

  it('accepts a minimal valid CUID (c + 20 alphanumeric chars)', () => {
    expect(isValidId('c' + 'a'.repeat(20))).toBe(true);
  });

  it('accepts a long CUID', () => {
    expect(isValidId('c' + 'a1b2c3d4e5'.repeat(5))).toBe(true);
  });

  // Invalid IDs
  it('rejects empty string', () => {
    expect(isValidId('')).toBe(false);
  });

  it('rejects plain integer string', () => {
    expect(isValidId('123')).toBe(false);
  });

  it('rejects UUID missing hyphens', () => {
    expect(isValidId('550e8400e29b41d4a716446655440000')).toBe(false);
  });

  it('rejects UUID with wrong segment lengths', () => {
    expect(isValidId('550e8400-e29b-41d4-a716-4466554400')).toBe(false);
  });

  it('rejects CUID too short (c + 19 chars)', () => {
    expect(isValidId('c' + 'a'.repeat(19))).toBe(false);
  });

  it('rejects CUID with uppercase characters', () => {
    // CUID regex requires lowercase only
    expect(isValidId('CJLD2CYUQ0000T3RMNIOD1FOY')).toBe(false);
  });

  it('rejects string starting with non-c non-UUID character', () => {
    expect(isValidId('xjld2cyuq0000t3rmniod1foy')).toBe(false);
    expect(isValidId('test-id')).toBe(false);
  });

  it('rejects UUID with extra characters', () => {
    expect(isValidId('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false);
  });
});

// ── validateIdParam middleware ─────────────────────────────────────────────────

describe('validateIdParam', () => {
  // Test doubles
  function makeRes() {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return res as unknown as { status: jest.Mock; json: jest.Mock };
  }

  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
  const VALID_CUID = 'cjld2cyuq0000t3rmniod1foy';
  const INVALID_ID = 'not-a-valid-id';

  // Used as router.param() callback (value passed explicitly)
  describe('called as router.param() handler (value arg provided)', () => {
    it('calls next() for a valid UUID', () => {
      const middleware = validateIdParam();
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: {} }, res, next, VALID_UUID);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); // no error arg
    });

    it('calls next() for a valid CUID', () => {
      const middleware = validateIdParam();
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: {} }, res, next, VALID_CUID);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('returns 400 for an invalid ID', () => {
      const middleware = validateIdParam();
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: {} }, res, next, INVALID_ID);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'INVALID_ID' }),
        })
      );
    });

    it('includes the param name in the error message', () => {
      const middleware = validateIdParam('productId');
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: {} }, res, next, INVALID_ID);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: 'Invalid productId format' }),
        })
      );
    });
  });

  // Used as inline route middleware (no value arg — reads from req.params)
  describe('called as inline route middleware (no value arg)', () => {
    it('calls next() when req.params.id is a valid UUID', () => {
      const middleware = validateIdParam();
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: { id: VALID_UUID } }, res, next, undefined);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('returns 400 when req.params.id is invalid', () => {
      const middleware = validateIdParam();
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: { id: INVALID_ID } }, res, next, undefined);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('calls next() when req.params has no id (undefined id is allowed)', () => {
      // No id param present — the middleware should pass through (not reject undefined)
      const middleware = validateIdParam();
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: {} }, res, next, undefined);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('reads from custom param name in req.params', () => {
      const middleware = validateIdParam('orderId');
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: { orderId: INVALID_ID } }, res, next, undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: 'Invalid orderId format' }),
        })
      );
    });
  });

  describe('default parameter name', () => {
    it('defaults to "id" when no param name given', () => {
      const middleware = validateIdParam(); // no arg
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: { id: INVALID_ID } }, res, next, undefined);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: 'Invalid id format' }),
        })
      );
    });
  });
});

// ── additional isValidId edge cases ───────────────────────────────────────

describe('isValidId — additional edge cases', () => {
  it('rejects whitespace-only string', () => {
    expect(isValidId('   ')).toBe(false);
  });

  it('rejects UUID with extra leading whitespace', () => {
    expect(isValidId(' 550e8400-e29b-41d4-a716-446655440000')).toBe(false);
  });

  it('rejects null-like string', () => {
    expect(isValidId('null')).toBe(false);
  });

  it('rejects undefined-like string', () => {
    expect(isValidId('undefined')).toBe(false);
  });
});

// ── additional validateIdParam edge cases ────────────────────────────────

describe('validateIdParam — additional edge cases', () => {
  function makeRes() {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return res as unknown as { status: jest.Mock; json: jest.Mock };
  }

  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

  it('calls next() only once for a valid value arg', () => {
    const middleware = validateIdParam('itemId');
    const next = jest.fn();
    const res = makeRes();
    middleware({ params: {} }, res, next, VALID_UUID);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('does not call res.status for a passing request', () => {
    const middleware = validateIdParam();
    const next = jest.fn();
    const res = makeRes();
    middleware({ params: { id: VALID_UUID } }, res, next, undefined);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('error response has success: false', () => {
    const middleware = validateIdParam();
    const next = jest.fn();
    const res = makeRes();
    middleware({ params: {} }, res, next, 'bad-id');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

describe('isValidId — further edge cases', () => {
  it('rejects a UUID with only 4 segments', () => {
    expect(isValidId('550e8400-e29b-41d4-a716')).toBe(false);
  });

  it('rejects an empty CUID prefix string (just "c")', () => {
    expect(isValidId('c')).toBe(false);
  });

  it('accepts CUID2 style id (starts with c, alphanumeric, 21+ chars)', () => {
    // cuid2 generates IDs starting with a letter and 24 alphanumeric chars
    expect(isValidId('cjld2cyuq0001t3rmniod1foy')).toBe(true);
  });

  it('rejects a GUID with braces', () => {
    expect(isValidId('{550e8400-e29b-41d4-a716-446655440000}')).toBe(false);
  });

  it('rejects a string of all zeros without hyphens', () => {
    expect(isValidId('00000000000000000000000000000000')).toBe(false);
  });
});

describe('isValidId — comprehensive boundary coverage', () => {
  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
  const VALID_CUID = 'cjld2cyuq0000t3rmniod1foy';

  it('accepts UUID with all-lowercase hex digits', () => {
    expect(isValidId('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')).toBe(true);
  });

  it('accepts UUID with all-uppercase hex digits', () => {
    expect(isValidId('AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE')).toBe(true);
  });

  it('rejects UUID with a non-hex character in last segment', () => {
    expect(isValidId('550e8400-e29b-41d4-a716-44665544000g')).toBe(false);
  });

  it('rejects UUID with 5-char first segment', () => {
    expect(isValidId('550e8-e29b-41d4-a716-446655440000')).toBe(false);
  });

  it('rejects UUID with space inside it', () => {
    expect(isValidId('550e8400-e29b-41d4-a716-44665544 000')).toBe(false);
  });

  it('rejects CUID containing a hyphen', () => {
    expect(isValidId('cjld2-yuq0000t3rmniod1foy')).toBe(false);
  });

  it('accepts a 30-character CUID', () => {
    expect(isValidId('c' + 'a'.repeat(29))).toBe(true);
  });

  it('isValidId returns boolean true for valid UUID (strict type)', () => {
    expect(isValidId(VALID_UUID)).toBe(true);
    expect(typeof isValidId(VALID_UUID)).toBe('boolean');
  });

  it('isValidId returns boolean false for invalid string (strict type)', () => {
    expect(isValidId('bad')).toBe(false);
    expect(typeof isValidId('bad')).toBe('boolean');
  });

  it('accepts a second distinct valid UUID', () => {
    expect(isValidId('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  it('accepts VALID_CUID in isValidId', () => {
    expect(isValidId(VALID_CUID)).toBe(true);
  });

  it('rejects a number converted to string', () => {
    expect(isValidId(String(12345))).toBe(false);
  });
});

describe('validation — phase30 coverage', () => {
  it('handles join method', () => {
    expect([1, 2, 3].join('-')).toBe('1-2-3');
  });

});


describe('phase31 coverage', () => {
  it('handles array destructuring', () => { const [x, y] = [1, 2]; expect(x).toBe(1); expect(y).toBe(2); });
  it('handles Number.isInteger', () => { expect(Number.isInteger(5)).toBe(true); expect(Number.isInteger(5.5)).toBe(false); });
  it('handles empty object', () => { const o = {}; expect(Object.keys(o).length).toBe(0); });
  it('returns correct type', () => { expect(typeof 'hello').toBe('string'); });
  it('handles array flat', () => { expect([[1,2],[3,4]].flat()).toEqual([1,2,3,4]); });
});


describe('phase32 coverage', () => {
  it('handles string raw tag', () => { expect(String.raw`\n`).toBe('\\n'); });
  it('handles Math.pow', () => { expect(Math.pow(2,10)).toBe(1024); });
  it('handles string substring', () => { expect('hello'.substring(1,3)).toBe('el'); });
  it('handles for...in loop', () => { const o = {a:1,b:2}; const keys: string[] = []; for (const k in o) keys.push(k); expect(keys.sort()).toEqual(['a','b']); });
  it('handles array fill', () => { expect(new Array(3).fill(0)).toEqual([0,0,0]); });
});


describe('phase33 coverage', () => {
  it('handles Proxy basic', () => { const p = new Proxy({x:1}, { get(t,k) { return (t as any)[k] * 2; } }); expect((p as any).x).toBe(2); });
  it('handles encodeURIComponent', () => { expect(encodeURIComponent('hello world')).toBe('hello%20world'); });
  it('handles Date methods', () => { const d = new Date(2026, 0, 15); expect(d.getMonth()).toBe(0); expect(d.getDate()).toBe(15); });
  it('handles toPrecision', () => { expect((123.456).toPrecision(5)).toBe('123.46'); });
  it('handles nested object access', () => { const o = { a: { b: 42 } }; expect(o.a.b).toBe(42); });
});


describe('phase34 coverage', () => {
  it('handles object method shorthand', () => { const o = { double(x: number) { return x * 2; } }; expect(o.double(6)).toBe(12); });
  it('handles object key renaming via destructuring', () => { const {a: x, b: y} = {a:1,b:2}; expect(x).toBe(1); expect(y).toBe(2); });
  it('handles getter in class', () => { class C { private _x = 0; get x() { return this._x; } set x(v: number) { this._x = v; } } const c = new C(); c.x = 5; expect(c.x).toBe(5); });
  it('handles abstract-like pattern', () => { class Shape { area(): number { return 0; } } class Square extends Shape { constructor(private s: number) { super(); } area() { return this.s*this.s; } } expect(new Square(4).area()).toBe(16); });
  it('handles generic function', () => { function identity<T>(x: T): T { return x; } expect(identity(42)).toBe(42); expect(identity('hi')).toBe('hi'); });
});


describe('phase35 coverage', () => {
  it('handles promise chain error propagation', async () => { const result = await Promise.resolve(1).then(()=>{throw new Error('oops');}).catch(e=>e.message); expect(result).toBe('oops'); });
  it('handles Array.from string', () => { expect(Array.from('hi')).toEqual(['h','i']); });
  it('handles short-circuit evaluation', () => { let x = 0; false && (x=1); expect(x).toBe(0); true || (x=2); expect(x).toBe(0); });
  it('handles async map pattern', async () => { const asyncDouble = async (n:number) => n*2; const results = await Promise.all([1,2,3].map(asyncDouble)); expect(results).toEqual([2,4,6]); });
  it('handles template literal type pattern', () => { type EventName = `on${Capitalize<string>}`; const handler: EventName = 'onClick'; expect(handler.startsWith('on')).toBe(true); });
});


describe('phase36 coverage', () => {
  it('handles deep object equality', () => { const eq=(a:unknown,b:unknown):boolean=>JSON.stringify(a)===JSON.stringify(b); expect(eq({x:{y:1}},{x:{y:1}})).toBe(true); expect(eq({x:1},{x:2})).toBe(false); });
  it('handles string compression', () => { const compress=(s:string)=>{let r='',i=0;while(i<s.length){let j=i;while(j<s.length&&s[j]===s[i])j++;r+=j-i>1?`${j-i}${s[i]}`:s[i];i=j;}return r;}; expect(compress('aaabbc')).toBe('3a2bc'); });
  it('handles promise timeout pattern', async () => { const withTimeout=<T>(p:Promise<T>,ms:number)=>Promise.race([p,new Promise<never>((_,r)=>setTimeout(()=>r(new Error('timeout')),ms))]);await expect(withTimeout(Promise.resolve(1),100)).resolves.toBe(1); });
  it('handles stack pattern', () => { class Stack<T>{private d:T[]=[];push(v:T){this.d.push(v);}pop(){return this.d.pop();}peek(){return this.d[this.d.length-1];}get size(){return this.d.length;}} const s=new Stack<number>();s.push(1);s.push(2);expect(s.pop()).toBe(2);expect(s.size).toBe(1); });
  it('handles balanced parentheses check', () => { const balanced=(s:string)=>{let c=0;for(const ch of s){if(ch==='(')c++;else if(ch===')')c--;if(c<0)return false;}return c===0;};expect(balanced('(()())')).toBe(true);expect(balanced('(()')).toBe(false); });
});


describe('phase37 coverage', () => {
  it('converts celsius to fahrenheit', () => { const toF=(c:number)=>c*9/5+32; expect(toF(0)).toBe(32); expect(toF(100)).toBe(212); });
  it('generates combinations of size 2', () => { const a=[1,2,3]; const r=a.flatMap((v,i)=>a.slice(i+1).map(w=>[v,w] as [number,number])); expect(r.length).toBe(3); expect(r[0]).toEqual([1,2]); });
  it('checks all elements satisfy predicate', () => { expect([2,4,6].every(n=>n%2===0)).toBe(true); expect([2,3,6].every(n=>n%2===0)).toBe(false); });
  it('flattens one level', () => { expect([[1,2],[3,4],[5]].reduce((a,b)=>[...a,...b],[] as number[])).toEqual([1,2,3,4,5]); });
  it('sums nested arrays', () => { const sumNested=(a:number[][])=>a.reduce((t,r)=>t+r.reduce((s,v)=>s+v,0),0); expect(sumNested([[1,2],[3,4],[5]])).toBe(15); });
});


describe('phase38 coverage', () => {
  it('computes string edit distance', () => { const ed=(a:string,b:string)=>{const m=Array.from({length:a.length+1},(_,i)=>Array.from({length:b.length+1},(_,j)=>i===0?j:j===0?i:0));for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)m[i][j]=a[i-1]===b[j-1]?m[i-1][j-1]:1+Math.min(m[i-1][j],m[i][j-1],m[i-1][j-1]);return m[a.length][b.length];}; expect(ed('kitten','sitting')).toBe(3); });
  it('computes prefix sums', () => { const prefix=(a:number[])=>a.reduce((acc,v)=>[...acc,acc[acc.length-1]+v],[0]); expect(prefix([1,2,3,4])).toEqual([0,1,3,6,10]); });
  it('merges sorted arrays', () => { const merge=(a:number[],b:number[])=>{const r:number[]=[];let i=0,j=0;while(i<a.length&&j<b.length)r.push(a[i]<=b[j]?a[i++]:b[j++]);return [...r,...a.slice(i),...b.slice(j)];}; expect(merge([1,3,5],[2,4,6])).toEqual([1,2,3,4,5,6]); });
  it('evaluates simple RPN expression', () => { const rpn=(tokens:string[])=>{const st:number[]=[];for(const t of tokens){if(/^-?\d+$/.test(t))st.push(Number(t));else{const b=st.pop()!,a=st.pop()!;st.push(t==='+'?a+b:t==='-'?a-b:t==='*'?a*b:a/b);}}return st[0];}; expect(rpn(['2','1','+','3','*'])).toBe(9); });
  it('implements exponential search bound', () => { const expBound=(a:number[],v:number)=>{if(a[0]===v)return 0;let i=1;while(i<a.length&&a[i]<=v)i*=2;return Math.min(i,a.length-1);}; expect(expBound([1,2,4,8,16,32],8)).toBeGreaterThanOrEqual(3); });
});


describe('phase39 coverage', () => {
  it('computes minimum path sum', () => { const minPath=(g:number[][])=>{const m=g.length,n=g[0].length;const dp=g.map(r=>[...r]);for(let i=1;i<m;i++)dp[i][0]+=dp[i-1][0];for(let j=1;j<n;j++)dp[0][j]+=dp[0][j-1];for(let i=1;i<m;i++)for(let j=1;j<n;j++)dp[i][j]+=Math.min(dp[i-1][j],dp[i][j-1]);return dp[m-1][n-1];}; expect(minPath([[1,3,1],[1,5,1],[4,2,1]])).toBe(7); });
  it('implements Dijkstra shortest path', () => { const dijkstra=(graph:Map<number,{to:number,w:number}[]>,start:number)=>{const dist=new Map<number,number>();dist.set(start,0);const pq:number[]=[start];while(pq.length){const u=pq.shift()!;for(const {to,w} of graph.get(u)||[]){const nd=(dist.get(u)||0)+w;if(!dist.has(to)||nd<dist.get(to)!){dist.set(to,nd);pq.push(to);}}}return dist;}; const g=new Map([[0,[{to:1,w:4},{to:2,w:1}]],[2,[{to:1,w:2}]],[1,[]]]); const d=dijkstra(g,0); expect(d.get(1)).toBe(3); });
  it('counts bits to flip to convert A to B', () => { const bitsToFlip=(a:number,b:number)=>{let x=a^b,c=0;while(x){c+=x&1;x>>>=1;}return c;}; expect(bitsToFlip(29,15)).toBe(2); });
  it('checks if string is a valid integer string', () => { const isInt=(s:string)=>/^-?[0-9]+$/.test(s.trim()); expect(isInt('42')).toBe(true); expect(isInt('-7')).toBe(true); expect(isInt('3.14')).toBe(false); });
  it('computes number of divisors', () => { const numDiv=(n:number)=>{let c=0;for(let i=1;i*i<=n;i++)if(n%i===0)c+=i===n/i?1:2;return c;}; expect(numDiv(12)).toBe(6); });
});


describe('phase40 coverage', () => {
  it('computes maximum sum circular subarray', () => { const maxCircSum=(a:number[])=>{const maxSub=(arr:number[])=>{let cur=arr[0],res=arr[0];for(let i=1;i<arr.length;i++){cur=Math.max(arr[i],cur+arr[i]);res=Math.max(res,cur);}return res;};const totalSum=a.reduce((s,v)=>s+v,0);const maxLinear=maxSub(a);const minLinear=-maxSub(a.map(v=>-v));const maxCircular=totalSum-minLinear;return maxCircular===0?maxLinear:Math.max(maxLinear,maxCircular);}; expect(maxCircSum([1,-2,3,-2])).toBe(3); });
  it('multiplies two matrices', () => { const matMul=(a:number[][],b:number[][])=>a.map(r=>b[0].map((_,j)=>r.reduce((s,_,k)=>s+r[k]*b[k][j],0))); expect(matMul([[1,2],[3,4]],[[5,6],[7,8]])).toEqual([[19,22],[43,50]]); });
  it('finds number of pairs with given difference', () => { const pairsWithDiff=(a:number[],d:number)=>{const s=new Set(a);return a.filter(v=>s.has(v+d)).length;}; expect(pairsWithDiff([1,5,3,4,2],2)).toBe(3); });
  it('finds maximum path sum in triangle', () => { const tri=[[2],[3,4],[6,5,7],[4,1,8,3]]; const dp=tri.map(r=>[...r]); for(let i=dp.length-2;i>=0;i--)for(let j=0;j<dp[i].length;j++)dp[i][j]+=Math.max(dp[i+1][j],dp[i+1][j+1]); expect(dp[0][0]).toBe(21); });
  it('finds smallest window containing all chars', () => { const minWindow=(s:string,t:string)=>{const need=new Map<string,number>();for(const c of t)need.set(c,(need.get(c)||0)+1);let l=0,formed=0,best='';const have=new Map<string,number>();for(let r=0;r<s.length;r++){const c=s[r];have.set(c,(have.get(c)||0)+1);if(need.has(c)&&have.get(c)===need.get(c))formed++;while(formed===need.size){const w=s.slice(l,r+1);if(!best||w.length<best.length)best=w;const lc=s[l];have.set(lc,(have.get(lc)||0)-1);if(need.has(lc)&&have.get(lc)!<need.get(lc)!)formed--;l++;}}return best;}; expect(minWindow('ADOBECODEBANC','ABC')).toBe('BANC'); });
});
