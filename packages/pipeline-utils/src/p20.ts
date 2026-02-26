export function transform<T>(value:T,...fns:S[]):unknown { return fns.reduce((acc,fn)=>fn(acc),value as unknown); }
