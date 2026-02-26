for(let i=1;i<=50;i++){ lines.push("  it(\"branch true test \"+i+\"\", () => { const b=branch((x)=>x>0,(x)=>\"pos\"+i,(x)=>\"neg\"+i); expect(b(1)).toBe(\"pos\"+i); });"); }
