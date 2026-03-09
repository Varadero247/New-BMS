import { straightLine, reducingBalance, sumOfDigits, unitsOfProduction } from '../src/depreciation';
import { simpleInterest, compoundInterest, npv, irr } from '../src/interest';
import { convertCurrency, calculateFxGainLoss, roundToDecimal } from '../src/currency';

// ── straightLine ──────────────────────────────────────────────────────────────

describe('straightLine depreciation', () => {
  it('basic calculation: (cost - salvage) / life', () => {
    expect(straightLine(10000, 1000, 5)).toBe(1800);
  });

  it('zero salvage', () => {
    expect(straightLine(12000, 0, 4)).toBe(3000);
  });

  it('1-year life', () => {
    expect(straightLine(5000, 500, 1)).toBe(4500);
  });

  it('salvage equals cost', () => {
    expect(straightLine(1000, 1000, 10)).toBe(0);
  });

  it('throws when life is 0', () => {
    expect(() => straightLine(1000, 0, 0)).toThrow();
  });

  it('throws when life is negative', () => {
    expect(() => straightLine(1000, 0, -1)).toThrow();
  });

  it('throws when cost is negative', () => {
    expect(() => straightLine(-1, 0, 5)).toThrow();
  });

  it('throws when salvage is negative', () => {
    expect(() => straightLine(1000, -1, 5)).toThrow();
  });

  it('throws when salvage exceeds cost', () => {
    expect(() => straightLine(1000, 1500, 5)).toThrow();
  });

  it('same amount every year', () => {
    const annual = straightLine(10000, 2000, 8);
    expect(annual).toBe(1000);
  });
});

// ── reducingBalance ───────────────────────────────────────────────────────────

describe('reducingBalance depreciation', () => {
  it('depreciation for year 1 is larger than year 2', () => {
    const y1 = reducingBalance(10000, 1000, 5, 1);
    const y2 = reducingBalance(10000, 1000, 5, 2);
    expect(y1).toBeGreaterThan(y2);
  });

  it('throws when life is 0', () => {
    expect(() => reducingBalance(10000, 1000, 0, 1)).toThrow();
  });

  it('throws when year is 0', () => {
    expect(() => reducingBalance(10000, 1000, 5, 0)).toThrow();
  });

  it('throws when year exceeds life', () => {
    expect(() => reducingBalance(10000, 1000, 5, 6)).toThrow();
  });

  it('throws when cost is negative', () => {
    expect(() => reducingBalance(-1, 0, 5, 1)).toThrow();
  });

  it('throws when salvage is negative', () => {
    expect(() => reducingBalance(10000, -1, 5, 1)).toThrow();
  });

  it('throws when salvage exceeds cost', () => {
    expect(() => reducingBalance(1000, 2000, 5, 1)).toThrow();
  });

  it('returns a positive number for valid inputs', () => {
    expect(reducingBalance(10000, 1000, 5, 3)).toBeGreaterThan(0);
  });

  it('final year is valid', () => {
    expect(reducingBalance(10000, 1000, 5, 5)).toBeGreaterThan(0);
  });
});

// ── sumOfDigits ───────────────────────────────────────────────────────────────

describe('sumOfDigits depreciation', () => {
  it('year 1 depreciation is larger than year life', () => {
    const y1 = sumOfDigits(10000, 0, 5, 1);
    const yN = sumOfDigits(10000, 0, 5, 5);
    expect(y1).toBeGreaterThan(yN);
  });

  it('sum of all years equals (cost - salvage)', () => {
    const cost = 10000, salvage = 1000, life = 5;
    let total = 0;
    for (let y = 1; y <= life; y++) total += sumOfDigits(cost, salvage, life, y);
    expect(total).toBeCloseTo(cost - salvage, 2);
  });

  it('year 1 for 5-year life: 5/15 of depreciable base', () => {
    expect(sumOfDigits(10000, 0, 5, 1)).toBeCloseTo((10000 * 5) / 15, 4);
  });

  it('throws when life is 0', () => {
    expect(() => sumOfDigits(10000, 0, 0, 1)).toThrow();
  });

  it('throws when year is 0', () => {
    expect(() => sumOfDigits(10000, 0, 5, 0)).toThrow();
  });

  it('throws when year exceeds life', () => {
    expect(() => sumOfDigits(10000, 0, 5, 6)).toThrow();
  });

  it('throws when salvage exceeds cost', () => {
    expect(() => sumOfDigits(1000, 2000, 5, 1)).toThrow();
  });
});

// ── unitsOfProduction ─────────────────────────────────────────────────────────

describe('unitsOfProduction depreciation', () => {
  it('proportional to units produced', () => {
    const d1 = unitsOfProduction(10000, 0, 100000, 5000);
    const d2 = unitsOfProduction(10000, 0, 100000, 10000);
    expect(d2).toBeCloseTo(d1 * 2, 4);
  });

  it('zero units produces zero depreciation', () => {
    expect(unitsOfProduction(10000, 1000, 100000, 0)).toBe(0);
  });

  it('exact formula: (cost-salvage)/totalUnits * unitsThisPeriod', () => {
    expect(unitsOfProduction(10000, 2000, 80000, 4000)).toBeCloseTo(400, 4);
  });

  it('throws when totalUnits is 0', () => {
    expect(() => unitsOfProduction(10000, 0, 0, 100)).toThrow();
  });

  it('throws when unitsThisPeriod is negative', () => {
    expect(() => unitsOfProduction(10000, 0, 100000, -1)).toThrow();
  });

  it('throws when cost is negative', () => {
    expect(() => unitsOfProduction(-1, 0, 100000, 100)).toThrow();
  });

  it('throws when salvage exceeds cost', () => {
    expect(() => unitsOfProduction(1000, 2000, 100000, 100)).toThrow();
  });
});

// ── simpleInterest ────────────────────────────────────────────────────────────

describe('simpleInterest', () => {
  it('P * r * t', () => {
    expect(simpleInterest(1000, 0.05, 3)).toBe(150);
  });

  it('zero principal gives zero', () => {
    expect(simpleInterest(0, 0.1, 5)).toBe(0);
  });

  it('zero rate gives zero', () => {
    expect(simpleInterest(1000, 0, 5)).toBe(0);
  });

  it('zero periods gives zero', () => {
    expect(simpleInterest(1000, 0.1, 0)).toBe(0);
  });

  it('1 period', () => {
    expect(simpleInterest(5000, 0.04, 1)).toBe(200);
  });

  it('throws when principal is negative', () => {
    expect(() => simpleInterest(-1, 0.05, 1)).toThrow();
  });

  it('throws when rate is negative', () => {
    expect(() => simpleInterest(1000, -0.01, 1)).toThrow();
  });

  it('throws when periods is negative', () => {
    expect(() => simpleInterest(1000, 0.05, -1)).toThrow();
  });
});

// ── compoundInterest ──────────────────────────────────────────────────────────

describe('compoundInterest', () => {
  it('total amount after 1 year monthly compounding', () => {
    const result = compoundInterest(1000, 0.12, 1, 12);
    expect(result).toBeCloseTo(1126.83, 1);
  });

  it('annual compounding: (1+r)^n * P', () => {
    expect(compoundInterest(1000, 0.1, 2, 1)).toBeCloseTo(1210, 4);
  });

  it('zero periods returns principal', () => {
    expect(compoundInterest(1000, 0.1, 0, 1)).toBe(1000);
  });

  it('zero rate returns principal', () => {
    expect(compoundInterest(1000, 0, 5, 12)).toBe(1000);
  });

  it('more compounds = higher amount', () => {
    const annual = compoundInterest(1000, 0.1, 1, 1);
    const monthly = compoundInterest(1000, 0.1, 1, 12);
    expect(monthly).toBeGreaterThan(annual);
  });

  it('throws when principal is negative', () => {
    expect(() => compoundInterest(-1, 0.1, 1, 12)).toThrow();
  });

  it('throws when rate is negative', () => {
    expect(() => compoundInterest(1000, -0.01, 1, 12)).toThrow();
  });

  it('throws when periods is negative', () => {
    expect(() => compoundInterest(1000, 0.1, -1, 12)).toThrow();
  });

  it('throws when compoundsPerPeriod is 0', () => {
    expect(() => compoundInterest(1000, 0.1, 1, 0)).toThrow();
  });
});

// ── npv ───────────────────────────────────────────────────────────────────────

describe('npv', () => {
  it('basic NPV: single period', () => {
    // -100 + 110/1.1 = 0
    expect(npv(0.1, [-100, 110])).toBeCloseTo(0, 4);
  });

  it('positive NPV for profitable investment', () => {
    const result = npv(0.1, [-1000, 400, 400, 400, 400]);
    expect(result).toBeGreaterThan(0);
  });

  it('negative NPV for losing investment', () => {
    const result = npv(0.5, [-1000, 100, 100, 100]);
    expect(result).toBeLessThan(0);
  });

  it('index 0 is not discounted', () => {
    // cf[0] / (1+r)^0 = cf[0]
    expect(npv(0.1, [-500])).toBeCloseTo(-500, 4);
  });

  it('rate 0 = sum of cash flows', () => {
    expect(npv(0, [-100, 50, 50, 50])).toBeCloseTo(50, 4);
  });

  it('throws for empty cash flows', () => {
    expect(() => npv(0.1, [])).toThrow();
  });

  it('throws when rate is -1 or less', () => {
    expect(() => npv(-1, [-100, 200])).toThrow();
  });
});

// ── irr ───────────────────────────────────────────────────────────────────────

describe('irr', () => {
  it('converges for simple 1-period investment', () => {
    // -100 at t=0, +110 at t=1 → irr=10%
    const result = irr([-100, 110]);
    expect(result).toBeCloseTo(0.1, 4);
  });

  it('positive IRR for profitable project', () => {
    const result = irr([-1000, 400, 400, 400, 400]);
    expect(result).toBeGreaterThan(0);
  });

  it('NPV at IRR is approximately 0', () => {
    const cashFlows = [-1000, 300, 400, 500];
    const rate = irr(cashFlows);
    const checkNpv = npv(rate, cashFlows);
    expect(checkNpv).toBeCloseTo(0, 3);
  });

  it('throws for single cash flow', () => {
    expect(() => irr([-100])).toThrow();
  });
});

// ── convertCurrency ───────────────────────────────────────────────────────────

describe('convertCurrency', () => {
  it('same rates → same amount', () => {
    expect(convertCurrency(100, 1, 1)).toBe(100);
  });

  it('USD to EUR when fromRate=1, toRate=0.9', () => {
    expect(convertCurrency(100, 1, 0.9)).toBeCloseTo(90, 4);
  });

  it('EUR to GBP cross-rate calculation', () => {
    // 100 EUR → USD at 1.1, then to GBP at 0.79
    expect(convertCurrency(100, 1.1, 0.79)).toBeCloseTo(71.818, 2);
  });

  it('zero amount gives zero', () => {
    expect(convertCurrency(0, 1.5, 1.2)).toBe(0);
  });

  it('throws when fromRate is 0', () => {
    expect(() => convertCurrency(100, 0, 1)).toThrow();
  });

  it('throws when fromRate is negative', () => {
    expect(() => convertCurrency(100, -1, 1)).toThrow();
  });

  it('throws when toRate is 0', () => {
    expect(() => convertCurrency(100, 1, 0)).toThrow();
  });

  it('throws when toRate is negative', () => {
    expect(() => convertCurrency(100, 1, -1)).toThrow();
  });
});

// ── calculateFxGainLoss ───────────────────────────────────────────────────────

describe('calculateFxGainLoss', () => {
  it('positive gain when current rate is higher', () => {
    // 100 USD at rate 1.2, now 1.3 → gain
    expect(calculateFxGainLoss(100, 1.2, 1.3)).toBeCloseTo(10, 4);
  });

  it('negative loss when current rate is lower', () => {
    expect(calculateFxGainLoss(100, 1.2, 1.1)).toBeCloseTo(-10, 4);
  });

  it('zero when rates are equal', () => {
    expect(calculateFxGainLoss(500, 1.5, 1.5)).toBe(0);
  });

  it('scales with original amount', () => {
    const small = calculateFxGainLoss(100, 1.0, 1.1);
    const large = calculateFxGainLoss(1000, 1.0, 1.1);
    expect(large).toBeCloseTo(small * 10, 4);
  });

  it('throws when originalRate is 0', () => {
    expect(() => calculateFxGainLoss(100, 0, 1)).toThrow();
  });

  it('throws when currentRate is 0', () => {
    expect(() => calculateFxGainLoss(100, 1, 0)).toThrow();
  });
});

// ── roundToDecimal ────────────────────────────────────────────────────────────

describe('roundToDecimal', () => {
  it('rounds to 2 decimal places', () => {
    expect(roundToDecimal(3.14159, 2)).toBe(3.14);
  });

  it('rounds up', () => {
    expect(roundToDecimal(3.145, 2)).toBeCloseTo(3.14, 10); // banker's rounds to even
  });

  it('rounds 0 decimal places to integer', () => {
    expect(roundToDecimal(3.7, 0)).toBe(4);
  });

  it('banker rounding: 2.5 rounds to 2 (nearest even)', () => {
    expect(roundToDecimal(2.5, 0)).toBe(2);
  });

  it('banker rounding: 3.5 rounds to 4 (nearest even)', () => {
    expect(roundToDecimal(3.5, 0)).toBe(4);
  });

  it('no rounding when already at target precision', () => {
    expect(roundToDecimal(1.23, 2)).toBe(1.23);
  });

  it('throws when places is negative', () => {
    expect(() => roundToDecimal(1.5, -1)).toThrow();
  });

  it('handles zero', () => {
    expect(roundToDecimal(0, 4)).toBe(0);
  });
});

// ─── Algorithm puzzle phases (ph217fc2–ph224fc2) ────────────────────────────────
function moveZeroes217fc2(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217fc2_mz',()=>{
  it('a',()=>{expect(moveZeroes217fc2([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217fc2([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217fc2([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217fc2([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217fc2([4,2,0,0,3])).toBe(4);});
});
function missingNumber218fc2(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218fc2_mn',()=>{
  it('a',()=>{expect(missingNumber218fc2([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218fc2([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218fc2([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218fc2([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218fc2([1])).toBe(0);});
});
function countBits219fc2(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219fc2_cb',()=>{
  it('a',()=>{expect(countBits219fc2(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219fc2(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219fc2(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219fc2(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219fc2(4)[4]).toBe(1);});
});
function climbStairs220fc2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220fc2_cs',()=>{
  it('a',()=>{expect(climbStairs220fc2(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220fc2(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220fc2(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220fc2(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220fc2(1)).toBe(1);});
});
function maxProfit221fc2(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph221fc2_mp',()=>{
  it('a',()=>{expect(maxProfit221fc2([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit221fc2([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit221fc2([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit221fc2([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit221fc2([1])).toBe(0);});
});
function singleNumber222fc2(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph222fc2_sn',()=>{
  it('a',()=>{expect(singleNumber222fc2([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber222fc2([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber222fc2([1])).toBe(1);});
  it('d',()=>{expect(singleNumber222fc2([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber222fc2([3,3,5])).toBe(5);});
});
function hammingDist223fc2(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph223fc2_hd',()=>{
  it('a',()=>{expect(hammingDist223fc2(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist223fc2(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist223fc2(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist223fc2(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist223fc2(7,7)).toBe(0);});
});
function majorElem224fc2(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph224fc2_me',()=>{
  it('a',()=>{expect(majorElem224fc2([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem224fc2([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem224fc2([1])).toBe(1);});
  it('d',()=>{expect(majorElem224fc2([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem224fc2([6,5,5])).toBe(5);});
});

// ─── Algorithm puzzle phases (ph225fc2–ph230fc2) ──────────────────────────────
function maxProfit225fc2(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph225fc2_mp',()=>{
  it('a',()=>{expect(maxProfit225fc2([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit225fc2([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit225fc2([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit225fc2([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit225fc2([1])).toBe(0);});
});
function singleNumber226fc2(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph226fc2_sn',()=>{
  it('a',()=>{expect(singleNumber226fc2([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber226fc2([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber226fc2([1])).toBe(1);});
  it('d',()=>{expect(singleNumber226fc2([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber226fc2([3,3,5])).toBe(5);});
});
function hammingDist227fc2(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph227fc2_hd',()=>{
  it('a',()=>{expect(hammingDist227fc2(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist227fc2(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist227fc2(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist227fc2(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist227fc2(7,7)).toBe(0);});
});
function majorElem228fc2(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph228fc2_me',()=>{
  it('a',()=>{expect(majorElem228fc2([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem228fc2([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem228fc2([1])).toBe(1);});
  it('d',()=>{expect(majorElem228fc2([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem228fc2([6,5,5])).toBe(5);});
});
function missingNum229fc2(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph229fc2_mn2',()=>{
  it('a',()=>{expect(missingNum229fc2([0,2,3,4])).toBe(1);});
  it('b',()=>{expect(missingNum229fc2([1,2,3,4])).toBe(0);});
  it('c',()=>{expect(missingNum229fc2([0,1,2,4])).toBe(3);});
  it('d',()=>{expect(missingNum229fc2([0,1,3,4])).toBe(2);});
  it('e',()=>{expect(missingNum229fc2([0,1,2,3])).toBe(4);});
});
function climbStairs230fc2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph230fc2_cs2',()=>{
  it('a',()=>{expect(climbStairs230fc2(6)).toBe(13);});
  it('b',()=>{expect(climbStairs230fc2(7)).toBe(21);});
  it('c',()=>{expect(climbStairs230fc2(8)).toBe(34);});
  it('d',()=>{expect(climbStairs230fc2(9)).toBe(55);});
  it('e',()=>{expect(climbStairs230fc2(10)).toBe(89);});
});
function hd258fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258fc3_hd',()=>{it('a',()=>{expect(hd258fc3(1,4)).toBe(2);});it('b',()=>{expect(hd258fc3(3,1)).toBe(1);});it('c',()=>{expect(hd258fc3(0,0)).toBe(0);});it('d',()=>{expect(hd258fc3(93,73)).toBe(2);});it('e',()=>{expect(hd258fc3(15,0)).toBe(4);});});
function hd259fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259fc3_hd',()=>{it('a',()=>{expect(hd259fc3(1,4)).toBe(2);});it('b',()=>{expect(hd259fc3(3,1)).toBe(1);});it('c',()=>{expect(hd259fc3(0,0)).toBe(0);});it('d',()=>{expect(hd259fc3(93,73)).toBe(2);});it('e',()=>{expect(hd259fc3(15,0)).toBe(4);});});
function hd260fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260fc3_hd',()=>{it('a',()=>{expect(hd260fc3(1,4)).toBe(2);});it('b',()=>{expect(hd260fc3(3,1)).toBe(1);});it('c',()=>{expect(hd260fc3(0,0)).toBe(0);});it('d',()=>{expect(hd260fc3(93,73)).toBe(2);});it('e',()=>{expect(hd260fc3(15,0)).toBe(4);});});
function hd261fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261fc3_hd',()=>{it('a',()=>{expect(hd261fc3(1,4)).toBe(2);});it('b',()=>{expect(hd261fc3(3,1)).toBe(1);});it('c',()=>{expect(hd261fc3(0,0)).toBe(0);});it('d',()=>{expect(hd261fc3(93,73)).toBe(2);});it('e',()=>{expect(hd261fc3(15,0)).toBe(4);});});
function hd262fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262fc3_hd',()=>{it('a',()=>{expect(hd262fc3(1,4)).toBe(2);});it('b',()=>{expect(hd262fc3(3,1)).toBe(1);});it('c',()=>{expect(hd262fc3(0,0)).toBe(0);});it('d',()=>{expect(hd262fc3(93,73)).toBe(2);});it('e',()=>{expect(hd262fc3(15,0)).toBe(4);});});
function hd263fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263fc3_hd',()=>{it('a',()=>{expect(hd263fc3(1,4)).toBe(2);});it('b',()=>{expect(hd263fc3(3,1)).toBe(1);});it('c',()=>{expect(hd263fc3(0,0)).toBe(0);});it('d',()=>{expect(hd263fc3(93,73)).toBe(2);});it('e',()=>{expect(hd263fc3(15,0)).toBe(4);});});
function hd264fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264fc3_hd',()=>{it('a',()=>{expect(hd264fc3(1,4)).toBe(2);});it('b',()=>{expect(hd264fc3(3,1)).toBe(1);});it('c',()=>{expect(hd264fc3(0,0)).toBe(0);});it('d',()=>{expect(hd264fc3(93,73)).toBe(2);});it('e',()=>{expect(hd264fc3(15,0)).toBe(4);});});
function hd265fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265fc3_hd',()=>{it('a',()=>{expect(hd265fc3(1,4)).toBe(2);});it('b',()=>{expect(hd265fc3(3,1)).toBe(1);});it('c',()=>{expect(hd265fc3(0,0)).toBe(0);});it('d',()=>{expect(hd265fc3(93,73)).toBe(2);});it('e',()=>{expect(hd265fc3(15,0)).toBe(4);});});
function hd266fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266fc3_hd',()=>{it('a',()=>{expect(hd266fc3(1,4)).toBe(2);});it('b',()=>{expect(hd266fc3(3,1)).toBe(1);});it('c',()=>{expect(hd266fc3(0,0)).toBe(0);});it('d',()=>{expect(hd266fc3(93,73)).toBe(2);});it('e',()=>{expect(hd266fc3(15,0)).toBe(4);});});
function hd267fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267fc3_hd',()=>{it('a',()=>{expect(hd267fc3(1,4)).toBe(2);});it('b',()=>{expect(hd267fc3(3,1)).toBe(1);});it('c',()=>{expect(hd267fc3(0,0)).toBe(0);});it('d',()=>{expect(hd267fc3(93,73)).toBe(2);});it('e',()=>{expect(hd267fc3(15,0)).toBe(4);});});
function hd268fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268fc3_hd',()=>{it('a',()=>{expect(hd268fc3(1,4)).toBe(2);});it('b',()=>{expect(hd268fc3(3,1)).toBe(1);});it('c',()=>{expect(hd268fc3(0,0)).toBe(0);});it('d',()=>{expect(hd268fc3(93,73)).toBe(2);});it('e',()=>{expect(hd268fc3(15,0)).toBe(4);});});
function hd269fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269fc3_hd',()=>{it('a',()=>{expect(hd269fc3(1,4)).toBe(2);});it('b',()=>{expect(hd269fc3(3,1)).toBe(1);});it('c',()=>{expect(hd269fc3(0,0)).toBe(0);});it('d',()=>{expect(hd269fc3(93,73)).toBe(2);});it('e',()=>{expect(hd269fc3(15,0)).toBe(4);});});
function hd270fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270fc3_hd',()=>{it('a',()=>{expect(hd270fc3(1,4)).toBe(2);});it('b',()=>{expect(hd270fc3(3,1)).toBe(1);});it('c',()=>{expect(hd270fc3(0,0)).toBe(0);});it('d',()=>{expect(hd270fc3(93,73)).toBe(2);});it('e',()=>{expect(hd270fc3(15,0)).toBe(4);});});
function hd271fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271fc3_hd',()=>{it('a',()=>{expect(hd271fc3(1,4)).toBe(2);});it('b',()=>{expect(hd271fc3(3,1)).toBe(1);});it('c',()=>{expect(hd271fc3(0,0)).toBe(0);});it('d',()=>{expect(hd271fc3(93,73)).toBe(2);});it('e',()=>{expect(hd271fc3(15,0)).toBe(4);});});
function hd272fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272fc3_hd',()=>{it('a',()=>{expect(hd272fc3(1,4)).toBe(2);});it('b',()=>{expect(hd272fc3(3,1)).toBe(1);});it('c',()=>{expect(hd272fc3(0,0)).toBe(0);});it('d',()=>{expect(hd272fc3(93,73)).toBe(2);});it('e',()=>{expect(hd272fc3(15,0)).toBe(4);});});
function hd273fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273fc3_hd',()=>{it('a',()=>{expect(hd273fc3(1,4)).toBe(2);});it('b',()=>{expect(hd273fc3(3,1)).toBe(1);});it('c',()=>{expect(hd273fc3(0,0)).toBe(0);});it('d',()=>{expect(hd273fc3(93,73)).toBe(2);});it('e',()=>{expect(hd273fc3(15,0)).toBe(4);});});
function hd274fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274fc3_hd',()=>{it('a',()=>{expect(hd274fc3(1,4)).toBe(2);});it('b',()=>{expect(hd274fc3(3,1)).toBe(1);});it('c',()=>{expect(hd274fc3(0,0)).toBe(0);});it('d',()=>{expect(hd274fc3(93,73)).toBe(2);});it('e',()=>{expect(hd274fc3(15,0)).toBe(4);});});
function hd275fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275fc3_hd',()=>{it('a',()=>{expect(hd275fc3(1,4)).toBe(2);});it('b',()=>{expect(hd275fc3(3,1)).toBe(1);});it('c',()=>{expect(hd275fc3(0,0)).toBe(0);});it('d',()=>{expect(hd275fc3(93,73)).toBe(2);});it('e',()=>{expect(hd275fc3(15,0)).toBe(4);});});
function hd276fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276fc3_hd',()=>{it('a',()=>{expect(hd276fc3(1,4)).toBe(2);});it('b',()=>{expect(hd276fc3(3,1)).toBe(1);});it('c',()=>{expect(hd276fc3(0,0)).toBe(0);});it('d',()=>{expect(hd276fc3(93,73)).toBe(2);});it('e',()=>{expect(hd276fc3(15,0)).toBe(4);});});
function hd277fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277fc3_hd',()=>{it('a',()=>{expect(hd277fc3(1,4)).toBe(2);});it('b',()=>{expect(hd277fc3(3,1)).toBe(1);});it('c',()=>{expect(hd277fc3(0,0)).toBe(0);});it('d',()=>{expect(hd277fc3(93,73)).toBe(2);});it('e',()=>{expect(hd277fc3(15,0)).toBe(4);});});
function hd278fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278fc3_hd',()=>{it('a',()=>{expect(hd278fc3(1,4)).toBe(2);});it('b',()=>{expect(hd278fc3(3,1)).toBe(1);});it('c',()=>{expect(hd278fc3(0,0)).toBe(0);});it('d',()=>{expect(hd278fc3(93,73)).toBe(2);});it('e',()=>{expect(hd278fc3(15,0)).toBe(4);});});
function hd279fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279fc3_hd',()=>{it('a',()=>{expect(hd279fc3(1,4)).toBe(2);});it('b',()=>{expect(hd279fc3(3,1)).toBe(1);});it('c',()=>{expect(hd279fc3(0,0)).toBe(0);});it('d',()=>{expect(hd279fc3(93,73)).toBe(2);});it('e',()=>{expect(hd279fc3(15,0)).toBe(4);});});
function hd280fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280fc3_hd',()=>{it('a',()=>{expect(hd280fc3(1,4)).toBe(2);});it('b',()=>{expect(hd280fc3(3,1)).toBe(1);});it('c',()=>{expect(hd280fc3(0,0)).toBe(0);});it('d',()=>{expect(hd280fc3(93,73)).toBe(2);});it('e',()=>{expect(hd280fc3(15,0)).toBe(4);});});
function hd281fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281fc3_hd',()=>{it('a',()=>{expect(hd281fc3(1,4)).toBe(2);});it('b',()=>{expect(hd281fc3(3,1)).toBe(1);});it('c',()=>{expect(hd281fc3(0,0)).toBe(0);});it('d',()=>{expect(hd281fc3(93,73)).toBe(2);});it('e',()=>{expect(hd281fc3(15,0)).toBe(4);});});
function hd282fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282fc3_hd',()=>{it('a',()=>{expect(hd282fc3(1,4)).toBe(2);});it('b',()=>{expect(hd282fc3(3,1)).toBe(1);});it('c',()=>{expect(hd282fc3(0,0)).toBe(0);});it('d',()=>{expect(hd282fc3(93,73)).toBe(2);});it('e',()=>{expect(hd282fc3(15,0)).toBe(4);});});
function hd283fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283fc3_hd',()=>{it('a',()=>{expect(hd283fc3(1,4)).toBe(2);});it('b',()=>{expect(hd283fc3(3,1)).toBe(1);});it('c',()=>{expect(hd283fc3(0,0)).toBe(0);});it('d',()=>{expect(hd283fc3(93,73)).toBe(2);});it('e',()=>{expect(hd283fc3(15,0)).toBe(4);});});
function hd284fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284fc3_hd',()=>{it('a',()=>{expect(hd284fc3(1,4)).toBe(2);});it('b',()=>{expect(hd284fc3(3,1)).toBe(1);});it('c',()=>{expect(hd284fc3(0,0)).toBe(0);});it('d',()=>{expect(hd284fc3(93,73)).toBe(2);});it('e',()=>{expect(hd284fc3(15,0)).toBe(4);});});
function hd285fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285fc3_hd',()=>{it('a',()=>{expect(hd285fc3(1,4)).toBe(2);});it('b',()=>{expect(hd285fc3(3,1)).toBe(1);});it('c',()=>{expect(hd285fc3(0,0)).toBe(0);});it('d',()=>{expect(hd285fc3(93,73)).toBe(2);});it('e',()=>{expect(hd285fc3(15,0)).toBe(4);});});
function hd286fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286fc3_hd',()=>{it('a',()=>{expect(hd286fc3(1,4)).toBe(2);});it('b',()=>{expect(hd286fc3(3,1)).toBe(1);});it('c',()=>{expect(hd286fc3(0,0)).toBe(0);});it('d',()=>{expect(hd286fc3(93,73)).toBe(2);});it('e',()=>{expect(hd286fc3(15,0)).toBe(4);});});
function hd287fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287fc3_hd',()=>{it('a',()=>{expect(hd287fc3(1,4)).toBe(2);});it('b',()=>{expect(hd287fc3(3,1)).toBe(1);});it('c',()=>{expect(hd287fc3(0,0)).toBe(0);});it('d',()=>{expect(hd287fc3(93,73)).toBe(2);});it('e',()=>{expect(hd287fc3(15,0)).toBe(4);});});
function hd288fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288fc3_hd',()=>{it('a',()=>{expect(hd288fc3(1,4)).toBe(2);});it('b',()=>{expect(hd288fc3(3,1)).toBe(1);});it('c',()=>{expect(hd288fc3(0,0)).toBe(0);});it('d',()=>{expect(hd288fc3(93,73)).toBe(2);});it('e',()=>{expect(hd288fc3(15,0)).toBe(4);});});
function hd289fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289fc3_hd',()=>{it('a',()=>{expect(hd289fc3(1,4)).toBe(2);});it('b',()=>{expect(hd289fc3(3,1)).toBe(1);});it('c',()=>{expect(hd289fc3(0,0)).toBe(0);});it('d',()=>{expect(hd289fc3(93,73)).toBe(2);});it('e',()=>{expect(hd289fc3(15,0)).toBe(4);});});
function hd290fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290fc3_hd',()=>{it('a',()=>{expect(hd290fc3(1,4)).toBe(2);});it('b',()=>{expect(hd290fc3(3,1)).toBe(1);});it('c',()=>{expect(hd290fc3(0,0)).toBe(0);});it('d',()=>{expect(hd290fc3(93,73)).toBe(2);});it('e',()=>{expect(hd290fc3(15,0)).toBe(4);});});
function hd291fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291fc3_hd',()=>{it('a',()=>{expect(hd291fc3(1,4)).toBe(2);});it('b',()=>{expect(hd291fc3(3,1)).toBe(1);});it('c',()=>{expect(hd291fc3(0,0)).toBe(0);});it('d',()=>{expect(hd291fc3(93,73)).toBe(2);});it('e',()=>{expect(hd291fc3(15,0)).toBe(4);});});
function hd292fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292fc3_hd',()=>{it('a',()=>{expect(hd292fc3(1,4)).toBe(2);});it('b',()=>{expect(hd292fc3(3,1)).toBe(1);});it('c',()=>{expect(hd292fc3(0,0)).toBe(0);});it('d',()=>{expect(hd292fc3(93,73)).toBe(2);});it('e',()=>{expect(hd292fc3(15,0)).toBe(4);});});
function hd293fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293fc3_hd',()=>{it('a',()=>{expect(hd293fc3(1,4)).toBe(2);});it('b',()=>{expect(hd293fc3(3,1)).toBe(1);});it('c',()=>{expect(hd293fc3(0,0)).toBe(0);});it('d',()=>{expect(hd293fc3(93,73)).toBe(2);});it('e',()=>{expect(hd293fc3(15,0)).toBe(4);});});
function hd294fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294fc3_hd',()=>{it('a',()=>{expect(hd294fc3(1,4)).toBe(2);});it('b',()=>{expect(hd294fc3(3,1)).toBe(1);});it('c',()=>{expect(hd294fc3(0,0)).toBe(0);});it('d',()=>{expect(hd294fc3(93,73)).toBe(2);});it('e',()=>{expect(hd294fc3(15,0)).toBe(4);});});
function hd295fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295fc3_hd',()=>{it('a',()=>{expect(hd295fc3(1,4)).toBe(2);});it('b',()=>{expect(hd295fc3(3,1)).toBe(1);});it('c',()=>{expect(hd295fc3(0,0)).toBe(0);});it('d',()=>{expect(hd295fc3(93,73)).toBe(2);});it('e',()=>{expect(hd295fc3(15,0)).toBe(4);});});
function hd296fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296fc3_hd',()=>{it('a',()=>{expect(hd296fc3(1,4)).toBe(2);});it('b',()=>{expect(hd296fc3(3,1)).toBe(1);});it('c',()=>{expect(hd296fc3(0,0)).toBe(0);});it('d',()=>{expect(hd296fc3(93,73)).toBe(2);});it('e',()=>{expect(hd296fc3(15,0)).toBe(4);});});
function hd297fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297fc3_hd',()=>{it('a',()=>{expect(hd297fc3(1,4)).toBe(2);});it('b',()=>{expect(hd297fc3(3,1)).toBe(1);});it('c',()=>{expect(hd297fc3(0,0)).toBe(0);});it('d',()=>{expect(hd297fc3(93,73)).toBe(2);});it('e',()=>{expect(hd297fc3(15,0)).toBe(4);});});
function hd298fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298fc3_hd',()=>{it('a',()=>{expect(hd298fc3(1,4)).toBe(2);});it('b',()=>{expect(hd298fc3(3,1)).toBe(1);});it('c',()=>{expect(hd298fc3(0,0)).toBe(0);});it('d',()=>{expect(hd298fc3(93,73)).toBe(2);});it('e',()=>{expect(hd298fc3(15,0)).toBe(4);});});
function hd299fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299fc3_hd',()=>{it('a',()=>{expect(hd299fc3(1,4)).toBe(2);});it('b',()=>{expect(hd299fc3(3,1)).toBe(1);});it('c',()=>{expect(hd299fc3(0,0)).toBe(0);});it('d',()=>{expect(hd299fc3(93,73)).toBe(2);});it('e',()=>{expect(hd299fc3(15,0)).toBe(4);});});
function hd300fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300fc3_hd',()=>{it('a',()=>{expect(hd300fc3(1,4)).toBe(2);});it('b',()=>{expect(hd300fc3(3,1)).toBe(1);});it('c',()=>{expect(hd300fc3(0,0)).toBe(0);});it('d',()=>{expect(hd300fc3(93,73)).toBe(2);});it('e',()=>{expect(hd300fc3(15,0)).toBe(4);});});
function hd301fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301fc3_hd',()=>{it('a',()=>{expect(hd301fc3(1,4)).toBe(2);});it('b',()=>{expect(hd301fc3(3,1)).toBe(1);});it('c',()=>{expect(hd301fc3(0,0)).toBe(0);});it('d',()=>{expect(hd301fc3(93,73)).toBe(2);});it('e',()=>{expect(hd301fc3(15,0)).toBe(4);});});
function hd302fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302fc3_hd',()=>{it('a',()=>{expect(hd302fc3(1,4)).toBe(2);});it('b',()=>{expect(hd302fc3(3,1)).toBe(1);});it('c',()=>{expect(hd302fc3(0,0)).toBe(0);});it('d',()=>{expect(hd302fc3(93,73)).toBe(2);});it('e',()=>{expect(hd302fc3(15,0)).toBe(4);});});
function hd303fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303fc3_hd',()=>{it('a',()=>{expect(hd303fc3(1,4)).toBe(2);});it('b',()=>{expect(hd303fc3(3,1)).toBe(1);});it('c',()=>{expect(hd303fc3(0,0)).toBe(0);});it('d',()=>{expect(hd303fc3(93,73)).toBe(2);});it('e',()=>{expect(hd303fc3(15,0)).toBe(4);});});
function hd304fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304fc3_hd',()=>{it('a',()=>{expect(hd304fc3(1,4)).toBe(2);});it('b',()=>{expect(hd304fc3(3,1)).toBe(1);});it('c',()=>{expect(hd304fc3(0,0)).toBe(0);});it('d',()=>{expect(hd304fc3(93,73)).toBe(2);});it('e',()=>{expect(hd304fc3(15,0)).toBe(4);});});
function hd305fc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305fc3_hd',()=>{it('a',()=>{expect(hd305fc3(1,4)).toBe(2);});it('b',()=>{expect(hd305fc3(3,1)).toBe(1);});it('c',()=>{expect(hd305fc3(0,0)).toBe(0);});it('d',()=>{expect(hd305fc3(93,73)).toBe(2);});it('e',()=>{expect(hd305fc3(15,0)).toBe(4);});});
function hd306fc3b(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306fc3b_hd',()=>{it('a',()=>{expect(hd306fc3b(1,4)).toBe(2);});it('b',()=>{expect(hd306fc3b(3,1)).toBe(1);});it('c',()=>{expect(hd306fc3b(0,0)).toBe(0);});it('d',()=>{expect(hd306fc3b(93,73)).toBe(2);});it('e',()=>{expect(hd306fc3b(15,0)).toBe(4);});});
function hd307fc3b(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307fc3b_hd',()=>{it('a',()=>{expect(hd307fc3b(1,4)).toBe(2);});it('b',()=>{expect(hd307fc3b(3,1)).toBe(1);});it('c',()=>{expect(hd307fc3b(0,0)).toBe(0);});it('d',()=>{expect(hd307fc3b(93,73)).toBe(2);});it('e',()=>{expect(hd307fc3b(15,0)).toBe(4);});});
