  pipe<U>(fn:(val:T)=>U):Pipeline<U> { const p=new Pipeline<U>(); p.steps=[...(this.steps as S[]),fn as S]; return p; }
