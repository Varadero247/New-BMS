  run(input:unknown):T { return this.steps.reduce((acc,fn)=>fn(acc),input) as T; }
