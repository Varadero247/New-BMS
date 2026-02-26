  static compose<T>(...fns:A[]):AsyncPipeline<T> { const p=new AsyncPipeline<T>(); p.steps=fns; return p; }
