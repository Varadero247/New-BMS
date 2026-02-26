for(let i=1;i<=100;i++){ lines.push("  it(\"transform test \"+i+\"\", () => { expect(transform(i,(x)=>(x)+1)).toBe(i+1); });"); }
