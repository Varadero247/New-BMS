for(let i=1;i<=100;i++){ lines.push("  it(\"pipe test \"+i+\": identity\", () => { expect((pipe((x)=>x+\"\"+i))(\"v\")).toBe(\"v\"+i); });"); }
