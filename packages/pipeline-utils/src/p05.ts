  filter(pred:(val:T)=>boolean):Pipeline<T> { const p=new Pipeline<T>(); p.steps=[...this.steps,(v:unknown)=>{ if(\!pred(v as T)) throw new Error("filtered"); return v; }]; return p; }
