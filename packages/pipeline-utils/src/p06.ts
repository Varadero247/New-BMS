  tap(fn:(val:T)=>void):Pipeline<T> { const p=new Pipeline<T>(); p.steps=[...this.steps,(v:unknown)=>{ fn(v as T); return v; }]; return p; }
