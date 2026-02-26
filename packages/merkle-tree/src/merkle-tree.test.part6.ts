// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

import { MerkleTree, verifyMerkleProof } from './merkle-tree';

function makeLeaves(n: number): string[] {
  return Array.from({ length: n }, (_, i) => String.fromCharCode(96)+"leaf-"+i+String.fromCharCode(96));
}

describe('S11 single leaf root', () => {
  it("slr 0",()=>{const t=new MerkleTree(["L0"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 1",()=>{const t=new MerkleTree(["L1"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 2",()=>{const t=new MerkleTree(["L2"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 3",()=>{const t=new MerkleTree(["L3"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 4",()=>{const t=new MerkleTree(["L4"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 5",()=>{const t=new MerkleTree(["L5"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 6",()=>{const t=new MerkleTree(["L6"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 7",()=>{const t=new MerkleTree(["L7"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 8",()=>{const t=new MerkleTree(["L8"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 9",()=>{const t=new MerkleTree(["L9"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 10",()=>{const t=new MerkleTree(["L10"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 11",()=>{const t=new MerkleTree(["L11"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 12",()=>{const t=new MerkleTree(["L12"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 13",()=>{const t=new MerkleTree(["L13"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 14",()=>{const t=new MerkleTree(["L14"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 15",()=>{const t=new MerkleTree(["L15"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 16",()=>{const t=new MerkleTree(["L16"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 17",()=>{const t=new MerkleTree(["L17"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 18",()=>{const t=new MerkleTree(["L18"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 19",()=>{const t=new MerkleTree(["L19"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 20",()=>{const t=new MerkleTree(["L20"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 21",()=>{const t=new MerkleTree(["L21"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 22",()=>{const t=new MerkleTree(["L22"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 23",()=>{const t=new MerkleTree(["L23"]);expect(t.root).toBe(t.getLeafHash(0));});
  it("slr 24",()=>{const t=new MerkleTree(["L24"]);expect(t.root).toBe(t.getLeafHash(0));});
});
describe('S12 OOB throws', () => {
  it("lhoob 1",()=>{expect(()=>new MerkleTree(makeLeaves(1)).getLeafHash(1)).toThrow(RangeError);});
  it("lhoob 2",()=>{expect(()=>new MerkleTree(makeLeaves(2)).getLeafHash(2)).toThrow(RangeError);});
  it("lhoob 3",()=>{expect(()=>new MerkleTree(makeLeaves(3)).getLeafHash(3)).toThrow(RangeError);});
  it("lhoob 4",()=>{expect(()=>new MerkleTree(makeLeaves(4)).getLeafHash(4)).toThrow(RangeError);});
  it("lhoob 5",()=>{expect(()=>new MerkleTree(makeLeaves(5)).getLeafHash(5)).toThrow(RangeError);});
  it("lhoob 6",()=>{expect(()=>new MerkleTree(makeLeaves(6)).getLeafHash(6)).toThrow(RangeError);});
  it("lhoob 7",()=>{expect(()=>new MerkleTree(makeLeaves(7)).getLeafHash(7)).toThrow(RangeError);});
  it("lhoob 8",()=>{expect(()=>new MerkleTree(makeLeaves(8)).getLeafHash(8)).toThrow(RangeError);});
  it("lhoob 9",()=>{expect(()=>new MerkleTree(makeLeaves(9)).getLeafHash(9)).toThrow(RangeError);});
  it("lhoob 10",()=>{expect(()=>new MerkleTree(makeLeaves(10)).getLeafHash(10)).toThrow(RangeError);});
  it("lhoob 11",()=>{expect(()=>new MerkleTree(makeLeaves(11)).getLeafHash(11)).toThrow(RangeError);});
  it("lhoob 12",()=>{expect(()=>new MerkleTree(makeLeaves(12)).getLeafHash(12)).toThrow(RangeError);});
  it("lhoob 13",()=>{expect(()=>new MerkleTree(makeLeaves(13)).getLeafHash(13)).toThrow(RangeError);});
  it("lhoob 14",()=>{expect(()=>new MerkleTree(makeLeaves(14)).getLeafHash(14)).toThrow(RangeError);});
  it("lhoob 15",()=>{expect(()=>new MerkleTree(makeLeaves(15)).getLeafHash(15)).toThrow(RangeError);});
  it("lhoob 16",()=>{expect(()=>new MerkleTree(makeLeaves(16)).getLeafHash(16)).toThrow(RangeError);});
  it("lhoob 17",()=>{expect(()=>new MerkleTree(makeLeaves(17)).getLeafHash(17)).toThrow(RangeError);});
  it("lhoob 18",()=>{expect(()=>new MerkleTree(makeLeaves(18)).getLeafHash(18)).toThrow(RangeError);});
  it("lhoob 19",()=>{expect(()=>new MerkleTree(makeLeaves(19)).getLeafHash(19)).toThrow(RangeError);});
  it("lhoob 20",()=>{expect(()=>new MerkleTree(makeLeaves(20)).getLeafHash(20)).toThrow(RangeError);});
  it("lhoob 21",()=>{expect(()=>new MerkleTree(makeLeaves(21)).getLeafHash(21)).toThrow(RangeError);});
  it("lhoob 22",()=>{expect(()=>new MerkleTree(makeLeaves(22)).getLeafHash(22)).toThrow(RangeError);});
  it("lhoob 23",()=>{expect(()=>new MerkleTree(makeLeaves(23)).getLeafHash(23)).toThrow(RangeError);});
  it("lhoob 24",()=>{expect(()=>new MerkleTree(makeLeaves(24)).getLeafHash(24)).toThrow(RangeError);});
  it("lhoob 25",()=>{expect(()=>new MerkleTree(makeLeaves(25)).getLeafHash(25)).toThrow(RangeError);});
});
describe('S13 update OOB', () => {
  it("uoob 1",()=>{expect(()=>new MerkleTree(makeLeaves(1)).update(1,"x")).toThrow(RangeError);});
  it("uoob 2",()=>{expect(()=>new MerkleTree(makeLeaves(2)).update(2,"x")).toThrow(RangeError);});
  it("uoob 3",()=>{expect(()=>new MerkleTree(makeLeaves(3)).update(3,"x")).toThrow(RangeError);});
  it("uoob 4",()=>{expect(()=>new MerkleTree(makeLeaves(4)).update(4,"x")).toThrow(RangeError);});
  it("uoob 5",()=>{expect(()=>new MerkleTree(makeLeaves(5)).update(5,"x")).toThrow(RangeError);});
  it("uoob 6",()=>{expect(()=>new MerkleTree(makeLeaves(6)).update(6,"x")).toThrow(RangeError);});
  it("uoob 7",()=>{expect(()=>new MerkleTree(makeLeaves(7)).update(7,"x")).toThrow(RangeError);});
  it("uoob 8",()=>{expect(()=>new MerkleTree(makeLeaves(8)).update(8,"x")).toThrow(RangeError);});
  it("uoob 9",()=>{expect(()=>new MerkleTree(makeLeaves(9)).update(9,"x")).toThrow(RangeError);});
  it("uoob 10",()=>{expect(()=>new MerkleTree(makeLeaves(10)).update(10,"x")).toThrow(RangeError);});
  it("uoob 11",()=>{expect(()=>new MerkleTree(makeLeaves(11)).update(11,"x")).toThrow(RangeError);});
  it("uoob 12",()=>{expect(()=>new MerkleTree(makeLeaves(12)).update(12,"x")).toThrow(RangeError);});
  it("uoob 13",()=>{expect(()=>new MerkleTree(makeLeaves(13)).update(13,"x")).toThrow(RangeError);});
  it("uoob 14",()=>{expect(()=>new MerkleTree(makeLeaves(14)).update(14,"x")).toThrow(RangeError);});
  it("uoob 15",()=>{expect(()=>new MerkleTree(makeLeaves(15)).update(15,"x")).toThrow(RangeError);});
  it("uoob 16",()=>{expect(()=>new MerkleTree(makeLeaves(16)).update(16,"x")).toThrow(RangeError);});
  it("uoob 17",()=>{expect(()=>new MerkleTree(makeLeaves(17)).update(17,"x")).toThrow(RangeError);});
  it("uoob 18",()=>{expect(()=>new MerkleTree(makeLeaves(18)).update(18,"x")).toThrow(RangeError);});
  it("uoob 19",()=>{expect(()=>new MerkleTree(makeLeaves(19)).update(19,"x")).toThrow(RangeError);});
  it("uoob 20",()=>{expect(()=>new MerkleTree(makeLeaves(20)).update(20,"x")).toThrow(RangeError);});
  it("uoob 21",()=>{expect(()=>new MerkleTree(makeLeaves(21)).update(21,"x")).toThrow(RangeError);});
  it("uoob 22",()=>{expect(()=>new MerkleTree(makeLeaves(22)).update(22,"x")).toThrow(RangeError);});
  it("uoob 23",()=>{expect(()=>new MerkleTree(makeLeaves(23)).update(23,"x")).toThrow(RangeError);});
  it("uoob 24",()=>{expect(()=>new MerkleTree(makeLeaves(24)).update(24,"x")).toThrow(RangeError);});
  it("uoob 25",()=>{expect(()=>new MerkleTree(makeLeaves(25)).update(25,"x")).toThrow(RangeError);});
});
describe('S14 determinism', () => {
  it("det 1",()=>{const lv=makeLeaves(1);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 2",()=>{const lv=makeLeaves(2);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 3",()=>{const lv=makeLeaves(3);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 4",()=>{const lv=makeLeaves(4);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 5",()=>{const lv=makeLeaves(5);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 6",()=>{const lv=makeLeaves(6);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 7",()=>{const lv=makeLeaves(7);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 8",()=>{const lv=makeLeaves(8);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 9",()=>{const lv=makeLeaves(9);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 10",()=>{const lv=makeLeaves(10);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 11",()=>{const lv=makeLeaves(11);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 12",()=>{const lv=makeLeaves(12);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 13",()=>{const lv=makeLeaves(13);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 14",()=>{const lv=makeLeaves(14);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 15",()=>{const lv=makeLeaves(15);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 16",()=>{const lv=makeLeaves(16);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 17",()=>{const lv=makeLeaves(17);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 18",()=>{const lv=makeLeaves(18);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 19",()=>{const lv=makeLeaves(19);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 20",()=>{const lv=makeLeaves(20);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 21",()=>{const lv=makeLeaves(21);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 22",()=>{const lv=makeLeaves(22);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 23",()=>{const lv=makeLeaves(23);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 24",()=>{const lv=makeLeaves(24);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
  it("det 25",()=>{const lv=makeLeaves(25);expect(new MerkleTree(lv).root).toBe(new MerkleTree(lv).root);});
});
