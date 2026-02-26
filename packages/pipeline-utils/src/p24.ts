export function memoizePipe<T,U>(fn:(val:T)=>U):(val:T)=>U { const c=new Map<T,U>(); return (v:T):U=>{ if(c.has(v)) return c.get(v) as U; const r=fn(v); c.set(v,r); return r; }; }
