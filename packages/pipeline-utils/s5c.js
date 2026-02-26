for(let i=1;i<=50;i++){ lines.push("  it(\"Pipeline filter throw test \"+i+\"\", () => { const p=new Pipeline<number>(); expect(()=>p.filter(()=>false).run(\"\"+i)).toThrow(\"filtered\"); });"); }
