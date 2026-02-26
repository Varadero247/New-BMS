for(let i=1;i<=100;i++){ lines.push("  it(\"compose test \"+i+\"\", () => { const f=compose((x)=>x+\"\"+i,(x)=>x); expect(f(\"v\")).toBe(\"v\"+i); });"); }
