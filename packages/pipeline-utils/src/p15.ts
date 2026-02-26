  async run(input:unknown):Promise<T> { let acc:unknown=input; for(const fn of this.steps){ acc=await fn(acc); } return acc as T; }
