for(let i=1;i<=50;i++){ lines.push("  it(\"Pipeline.compose static test \"+i+\"\", () => { const p=Pipeline.compose((x)=>x+\"\"+i); expect(p.run(\"v\")).toBe(\"v\"+i); });"); }
