  pipe<U>(fn:(val:T)=>Promise<U>|U):AsyncPipeline<U> { const p=new AsyncPipeline<U>(); p.steps=[...(this.steps as A[]),async(v:unknown)=>fn(v as T)]; return p; }
