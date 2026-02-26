export function branch<T,U>(pred:(val:T)=>boolean,ifTrue:(val:T)=>U,ifFalse:(val:T)=>U):(val:T)=>U { return (val:T)=>(pred(val)?ifTrue(val):ifFalse(val)); }
