export function compose(...fns:S[]):S { return (val:unknown)=>[...fns].reverse().reduce((acc,fn)=>fn(acc),val); }
