for(let i=1;i<=50;i++){ lines.push("  it(\"retry success test \"+i+\"\", async () => { const result=await retry(()=>Promise.resolve(\"\"+i),3); expect(result).toBe(\"\"+i); });"); }
