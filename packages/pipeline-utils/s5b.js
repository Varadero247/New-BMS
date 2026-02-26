for(let i=1;i<=50;i++){ lines.push("  it(\"Pipeline filter pass test \"+i+\"\", () => { const p=new Pipeline<number>(); expect(p.filter((x)=>x>=0).run(\"\"+i)).toBe(\"\"+i); });"); }
