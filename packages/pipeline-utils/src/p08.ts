  static compose<T>(...fns:S[]):Pipeline<T> { const p=new Pipeline<T>(); p.steps=[...fns]; return p; }
