export async function parallel<T>(value:T,...fns:S[]):Promise<unknown[]> { return Promise.all(fns.map((fn)=>fn(value))); }
