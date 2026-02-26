const out=[]; for(let i=1;i<=3;i++){ out.push("  it(\"pipe test " + String(i) + ": id\", () => { expect(1).toBe(1); });"); } console.log(out.join("\n"));
