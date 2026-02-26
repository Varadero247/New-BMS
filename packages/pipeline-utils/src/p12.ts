  map<U>(fn:(val:T)=>Promise<U>|U):AsyncPipeline<U> { return this.pipe(fn); }
