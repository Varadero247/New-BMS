export function pipe(...fns:S[]):S { return (val:unknown)=>fns.reduce((acc,fn)=>fn(acc),val); }
