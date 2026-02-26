for(let i=1;i<=100;i++){ lines.push("  it(\"Pipeline map test \"+i+\"\", () => { const p=new Pipeline<number>(); expect(p.map((x)=>x+\"\"+i).run(0)).toBe(\"0\"+i); });"); }
