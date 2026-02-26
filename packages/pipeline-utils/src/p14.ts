  tap(fn:(val:T)=>void|Promise<void>):AsyncPipeline<T> { const p=new AsyncPipeline<T>(); p.steps=[...this.steps,async(v:unknown)=>{ await fn(v as T); return v; }]; return p; }
