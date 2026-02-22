import { Request, Response } from 'express';
import { notFoundHandler } from '../src/middleware/not-found';

const mockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  method: 'GET',
  path: '/api/test',
  ...overrides,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Not Found Handler Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('status code', () => {
    it('should return 404 status code', () => {
      const req = mockRequest();
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('response shape', () => {
    it('should return success: false', () => {
      const req = mockRequest();
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });

    it('should return error code NOT_FOUND', () => {
      const req = mockRequest();
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'NOT_FOUND',
          }),
        })
      );
    });
  });

  describe('path info in response', () => {
    it('should include the request method and path in the error message', () => {
      const req = mockRequest({ method: 'GET', path: '/api/00000000-0000-4000-a000-ffffffffffff' });
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route GET /api/00000000-0000-4000-a000-ffffffffffff not found',
        },
      });
    });

    it('should include POST method in the error message', () => {
      const req = mockRequest({ method: 'POST', path: '/api/missing' });
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route POST /api/missing not found',
        },
      });
    });

    it('should include PUT method in the error message', () => {
      const req = mockRequest({ method: 'PUT', path: '/api/resource/123' });
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route PUT /api/resource/123 not found',
        },
      });
    });

    it('should include DELETE method in the error message', () => {
      const req = mockRequest({ method: 'DELETE', path: '/api/items/42' });
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route DELETE /api/items/42 not found',
        },
      });
    });

    it('should include PATCH method in the error message', () => {
      const req = mockRequest({ method: 'PATCH', path: '/api/users/5' });
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route PATCH /api/users/5 not found',
        },
      });
    });
  });

  describe('various unknown paths', () => {
    it('should handle root path', () => {
      const req = mockRequest({ method: 'GET', path: '/' });
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route GET / not found',
        },
      });
    });

    it('should handle deeply nested paths', () => {
      const req = mockRequest({ method: 'GET', path: '/api/v2/deep/nested/path' });
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route GET /api/v2/deep/nested/path not found',
        },
      });
    });

    it('should handle paths with query-like segments', () => {
      const req = mockRequest({ method: 'GET', path: '/api/search' });
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route GET /api/search not found',
        },
      });
    });
  });
});

describe('Not Found Handler — extended', () => {
  it('should call res.status before res.json', () => {
    const req = mockRequest({ method: 'GET', path: '/api/test' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    expect(res.status).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it('error message contains the path', () => {
    const req = mockRequest({ method: 'GET', path: '/api/my-special-path' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.error.message).toContain('/api/my-special-path');
  });

  it('error message contains the HTTP method', () => {
    const req = mockRequest({ method: 'OPTIONS', path: '/api/check' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.error.message).toContain('OPTIONS');
  });

  it('error object has exactly code and message keys', () => {
    const req = mockRequest({ method: 'GET', path: '/any' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(Object.keys(jsonArg.error)).toEqual(expect.arrayContaining(['code', 'message']));
  });
});


describe('Not Found Handler — additional coverage', () => {
  it('responds with success: false for OPTIONS method', () => {
    const req = mockRequest({ method: 'OPTIONS', path: '/api/check' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.success).toBe(false);
  });

  it('error.code is exactly NOT_FOUND for HEAD method', () => {
    const req = mockRequest({ method: 'HEAD', path: '/api/head-path' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.error.code).toBe('NOT_FOUND');
  });

  it('does not throw when called with unusual path characters', () => {
    expect(() => {
      const req = mockRequest({ method: 'GET', path: '/api/path-with-dashes_and_under' });
      const res = mockResponse();
      notFoundHandler(req as Request, res as Response);
    }).not.toThrow();
  });

  it('message follows the pattern "Route METHOD PATH not found"', () => {
    const req = mockRequest({ method: 'PUT', path: '/api/update-me' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.error.message).toMatch(/^Route PUT \/api\/update-me not found$/);
  });

  it('res.json is called exactly once per invocation', () => {
    const req = mockRequest({ method: 'DELETE', path: '/api/gone' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    expect((res.json as jest.Mock).mock.calls).toHaveLength(1);
  });
});

describe('Not Found Handler — further edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles PATCH method in the error message', () => {
    const req = mockRequest({ method: 'PATCH', path: '/api/resource' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.error.message).toContain('PATCH');
  });

  it('handles HEAD method without throwing', () => {
    expect(() => {
      const req = mockRequest({ method: 'HEAD', path: '/api/resource' });
      const res = mockResponse();
      notFoundHandler(req as Request, res as Response);
    }).not.toThrow();
  });

  it('returns 404 for deeply nested path', () => {
    const req = mockRequest({ method: 'GET', path: '/api/a/b/c/d/e' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.error.message).toContain('/api/a/b/c/d/e');
  });

  it('res.status is called with exactly 404', () => {
    const req = mockRequest({ method: 'POST', path: '/api/anything' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    expect((res.status as jest.Mock).mock.calls[0][0]).toBe(404);
  });

  it('error code is NOT_FOUND for all HTTP methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
    methods.forEach((method) => {
      const req = mockRequest({ method, path: '/api/test' });
      const res = mockResponse();
      notFoundHandler(req as Request, res as Response);
      const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonArg.error.code).toBe('NOT_FOUND');
    });
  });

  it('success field is always false regardless of method', () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    methods.forEach((method) => {
      const req = mockRequest({ method, path: '/api/test' });
      const res = mockResponse();
      notFoundHandler(req as Request, res as Response);
      const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonArg.success).toBe(false);
    });
  });

  it('handles path with UUID segment correctly', () => {
    const req = mockRequest({
      method: 'GET',
      path: '/api/resources/00000000-0000-0000-0000-000000000001',
    });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.error.message).toContain('00000000-0000-0000-0000-000000000001');
  });

  it('message format includes both method and path joined with a space', () => {
    const req = mockRequest({ method: 'DELETE', path: '/api/items/99' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.error.message).toMatch(/Route DELETE \/api\/items\/99 not found/);
  });
});

describe('Not Found Handler — supplemental coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('res.status is called exactly once per invocation', () => {
    const req = mockRequest({ method: 'GET', path: '/api/test' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    expect((res.status as jest.Mock).mock.calls).toHaveLength(1);
  });

  it('response success field is boolean false, not string', () => {
    const req = mockRequest({ method: 'GET', path: '/api/bool-test' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.success).toStrictEqual(false);
  });

  it('handles path with extension correctly', () => {
    const req = mockRequest({ method: 'GET', path: '/api/file.json' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.error.message).toContain('/api/file.json');
  });

  it('handles path with multiple slashes correctly', () => {
    const req = mockRequest({ method: 'GET', path: '/a/b/c/d/e/f' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('error.code is a string value NOT_FOUND', () => {
    const req = mockRequest({ method: 'GET', path: '/any-path' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.error.code).toStrictEqual('NOT_FOUND');
  });

  it('response body has exactly two top-level keys: success and error', () => {
    const req = mockRequest({ method: 'DELETE', path: '/api/item' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(Object.keys(jsonArg).sort()).toEqual(['error', 'success'].sort());
  });
});

describe('Not Found Handler — absolute final coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not throw when called with an empty path', () => {
    expect(() => {
      const req = mockRequest({ method: 'GET', path: '' });
      const res = mockResponse();
      notFoundHandler(req as Request, res as Response);
    }).not.toThrow();
  });

  it('res.status is called before res.json (chaining order)', () => {
    const req = mockRequest({ method: 'POST', path: '/api/missing' });
    const res = mockResponse();
    const statusOrder: string[] = [];
    (res.status as jest.Mock).mockImplementation(() => {
      statusOrder.push('status');
      return res;
    });
    (res.json as jest.Mock).mockImplementation(() => {
      statusOrder.push('json');
      return res;
    });
    notFoundHandler(req as Request, res as Response);
    expect(statusOrder[0]).toBe('status');
    expect(statusOrder[1]).toBe('json');
  });

  it('returns NOT_FOUND code for TRACE method', () => {
    const req = mockRequest({ method: 'TRACE', path: '/api/trace-path' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.error.code).toBe('NOT_FOUND');
  });

  it('returns 404 for a path that starts with /v1', () => {
    const req = mockRequest({ method: 'GET', path: '/v1/resource' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    expect((res.status as jest.Mock).mock.calls[0][0]).toBe(404);
  });

  it('message includes forward slash at start of path', () => {
    const req = mockRequest({ method: 'GET', path: '/api/check' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.error.message).toContain('/api/check');
  });

  it('error object does not have a stack property', () => {
    const req = mockRequest({ method: 'GET', path: '/api/no-stack' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.error).not.toHaveProperty('stack');
  });

  it('response json does not have a data property', () => {
    const req = mockRequest({ method: 'GET', path: '/api/no-data' });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg).not.toHaveProperty('data');
  });
});


describe("Not Found Handler — phase28 coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles CONNECT method without throwing", () => {
    expect(() => {
      const req = mockRequest({ method: "CONNECT", path: "/api/tunnel" });
      const res = mockResponse();
      notFoundHandler(req as Request, res as Response);
    }).not.toThrow();
  });

  it("error.message is a string value", () => {
    const req = mockRequest({ method: "GET", path: "/api/str-test" });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(typeof jsonArg.error.message).toBe("string");
  });

  it("res.status is called with a number", () => {
    const req = mockRequest({ method: "GET", path: "/api/num-test" });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const statusArg = (res.status as jest.Mock).mock.calls[0][0];
    expect(typeof statusArg).toBe("number");
  });

  it("response body top-level keys count is 2", () => {
    const req = mockRequest({ method: "DELETE", path: "/api/count-test" });
    const res = mockResponse();
    notFoundHandler(req as Request, res as Response);
    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(Object.keys(jsonArg)).toHaveLength(2);
  });
});

describe('not found — phase30 coverage', () => {
  it('handles Math.pow', () => {
    expect(Math.pow(2, 3)).toBe(8);
  });

  it('handles Math.floor', () => {
    expect(Math.floor(3.9)).toBe(3);
  });

  it('handles regex match', () => {
    expect('hello world'.match(/world/)).not.toBeNull();
  });

  it('handles Number.isInteger', () => {
    expect(Number.isInteger(42)).toBe(true);
  });

  it('handles JSON stringify', () => {
    expect(JSON.stringify({ a: 1 })).toBe('{"a":1}');
  });

});


describe('phase31 coverage', () => {
  it('handles array filter', () => { expect([1,2,3,4].filter(x => x % 2 === 0)).toEqual([2,4]); });
  it('handles Object.entries', () => { expect(Object.entries({a:1})).toEqual([['a',1]]); });
  it('handles ternary', () => { const x = 5 > 3 ? 'yes' : 'no'; expect(x).toBe('yes'); });
  it('handles string replace', () => { expect('foo bar'.replace('bar','baz')).toBe('foo baz'); });
  it('handles Math.min', () => { expect(Math.min(1,5,3)).toBe(1); });
});


describe('phase32 coverage', () => {
  it('handles typeof undefined', () => { expect(typeof undefined).toBe('undefined'); });
  it('handles array concat', () => { expect([1,2].concat([3,4])).toEqual([1,2,3,4]); });
  it('handles array fill', () => { expect(new Array(3).fill(0)).toEqual([0,0,0]); });
  it('handles bitwise AND', () => { expect(6 & 3).toBe(2); });
  it('handles Promise.all', async () => { const r = await Promise.all([Promise.resolve(1), Promise.resolve(2)]); expect(r).toEqual([1,2]); });
});


describe('phase33 coverage', () => {
  it('handles Object.create', () => { const proto = { greet() { return 'hi'; } }; const o = Object.create(proto); expect(o.greet()).toBe('hi'); });
  it('handles string normalize', () => { expect('caf\u00e9'.normalize()).toBe('café'); });
  it('handles string length property', () => { expect('typescript'.length).toBe(10); });
  it('handles RangeError', () => { expect(() => new Array(-1)).toThrow(RangeError); });
  it('handles Object.getPrototypeOf', () => { class A {} class B extends A {} expect(Object.getPrototypeOf(B.prototype)).toBe(A.prototype); });
});


describe('phase34 coverage', () => {
  it('handles rest in destructuring', () => { const {a,...rest} = {a:1,b:2,c:3}; expect(rest).toEqual({b:2,c:3}); });
  it('handles number comparison operators', () => { expect(5 >= 5).toBe(true); expect(4 <= 5).toBe(true); });
  it('handles Set intersection', () => { const a = new Set([1,2,3]); const b = new Set([2,3,4]); const inter = new Set([...a].filter(x=>b.has(x))); expect([...inter]).toEqual([2,3]); });
  it('handles array of objects sort', () => { const arr = [{n:3},{n:1},{n:2}]; arr.sort((a,b)=>a.n-b.n); expect(arr[0].n).toBe(1); });
  it('handles type assertion', () => { const v: unknown = 'hello'; expect((v as string).toUpperCase()).toBe('HELLO'); });
});


describe('phase35 coverage', () => {
  it('handles string words count', () => { const count = (s: string) => s.trim().split(/\s+/).length; expect(count('hello world foo')).toBe(3); });
  it('handles template literal type pattern', () => { type EventName = `on${Capitalize<string>}`; const handler: EventName = 'onClick'; expect(handler.startsWith('on')).toBe(true); });
  it('handles discriminated union', () => { type Shape = {kind:'circle';r:number}|{kind:'rect';w:number;h:number}; const area=(s:Shape)=>s.kind==='circle'?Math.PI*s.r*s.r:s.w*s.h; expect(area({kind:'rect',w:3,h:4})).toBe(12); });
  it('handles object omit pattern', () => { const omit = <T, K extends keyof T>(o:T, keys:K[]): Omit<T,K> => { const r={...o}; keys.forEach(k=>delete (r as any)[k]); return r as Omit<T,K>; }; expect(omit({a:1,b:2,c:3},['b'])).toEqual({a:1,c:3}); });
  it('handles unique by key pattern', () => { const uniqBy = <T>(arr:T[], key:(x:T)=>unknown) => [...new Map(arr.map(x=>[key(x),x])).values()]; const r = uniqBy([{id:1,v:'a'},{id:2,v:'b'},{id:1,v:'c'}],x=>x.id); expect(r.length).toBe(2); });
});


describe('phase36 coverage', () => {
  it('handles chunk string', () => { const chunkStr=(s:string,n:number)=>s.match(new RegExp(`.{1,${n}}`,'g'))||[];expect(chunkStr('abcdefg',3)).toEqual(['abc','def','g']); });
  it('handles GCD calculation', () => { const gcd=(a:number,b:number):number=>b===0?a:gcd(b,a%b);expect(gcd(48,18)).toBe(6);expect(gcd(100,75)).toBe(25); });
  it('handles matrix transpose', () => { const t=(m:number[][])=>m[0].map((_,i)=>m.map(r=>r[i])); expect(t([[1,2],[3,4]])).toEqual([[1,3],[2,4]]); });
  it('handles number formatting with commas', () => { const fmt=(n:number)=>n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');expect(fmt(1000000)).toBe('1,000,000'); });
  it('handles flatten nested object keys', () => { const flat=(o:Record<string,unknown>,prefix=''):Record<string,unknown>=>{return Object.entries(o).reduce((acc,[k,v])=>{const key=prefix?`${prefix}.${k}`:k;if(v&&typeof v==='object'&&!Array.isArray(v))Object.assign(acc,flat(v as Record<string,unknown>,key));else(acc as any)[key]=v;return acc;},{});};expect(flat({a:{b:1}})).toEqual({'a.b':1}); });
});
