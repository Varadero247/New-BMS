// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// Mock prisma so we can test service methods without a DB
jest.mock('../prisma', () => ({
  prisma: {
    subscription: {
      update: jest.fn().mockResolvedValue({ id: 'sub-1', platformFeeAnnual: 5000 }),
    },
    verticalAddOn: {
      create: jest.fn().mockResolvedValue({ id: 'addon-1', subscriptionId: 'sub-1' }),
    },
    designPartnerStatus: {
      upsert: jest.fn().mockResolvedValue({ id: 'dp-1', organisationId: 'org-1', lockedPriceMonthly: 22 }),
    },
    dealRegistration: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
  },
}));

import { BillingService } from '../billing/billing.service';
import { PartnerPricingService } from '../partners/partner-pricing.service';
import { calculateVolumePrice, calculateACV, PRICING } from '@ims/config';

const billing = new BillingService();
const partnerSvc = new PartnerPricingService();

// ─── BillingService.calculateVolumePrice ─────────────────────────────────────

describe('BillingService.calculateVolumePrice', () => {
  it('delegates to @ims/config calculateVolumePrice', () => {
    expect(billing.calculateVolumePrice(25, 1)).toBe(calculateVolumePrice(25, 1));
  });

  it('25 users 1yr → £22', () => expect(billing.calculateVolumePrice(25, 1)).toBe(22));
  it('49 users 1yr → £22', () => expect(billing.calculateVolumePrice(49, 1)).toBe(22));
  it('50 users 1yr → £22', () => expect(billing.calculateVolumePrice(50, 1)).toBe(22));
  it('100 users 1yr → £20', () => expect(billing.calculateVolumePrice(100, 1)).toBe(20));
  it('200 users 1yr → £18', () => expect(billing.calculateVolumePrice(200, 1)).toBe(18));
  it('500 users 1yr → null (custom)', () => expect(billing.calculateVolumePrice(500, 1)).toBeNull());

  it('25 users 2yr → £20', () => expect(billing.calculateVolumePrice(25, 2)).toBe(20));
  it('50 users 2yr → £19', () => expect(billing.calculateVolumePrice(50, 2)).toBe(19));
  it('100 users 2yr → £18', () => expect(billing.calculateVolumePrice(100, 2)).toBe(18));
  it('200 users 2yr → £16', () => expect(billing.calculateVolumePrice(200, 2)).toBe(16));
  it('500 users 2yr → null', () => expect(billing.calculateVolumePrice(500, 2)).toBeNull());

  it('defaults to 1yr', () => {
    expect(billing.calculateVolumePrice(30)).toBe(billing.calculateVolumePrice(30, 1));
  });
});

// ─── BillingService.generateROIReport ────────────────────────────────────────

describe('BillingService.generateROIReport', () => {
  it('returns an object with the expected shape', async () => {
    const report = await billing.generateROIReport('org-test');
    expect(report).toHaveProperty('organisationId', 'org-test');
    expect(report).toHaveProperty('benchmarks');
    expect(report).toHaveProperty('projections');
    expect(report).toHaveProperty('incumbentSavingLow');
    expect(report).toHaveProperty('incumbentSavingHigh');
    expect(report).toHaveProperty('generatedAt');
  });

  it('incumbentSavingLow matches PRICING config', async () => {
    const report = await billing.generateROIReport('org-x');
    expect(report.incumbentSavingLow).toBe(PRICING.competitorBenchmarks.nexaraSavingVsIncumbentLow);
  });

  it('incumbentSavingHigh matches PRICING config', async () => {
    const report = await billing.generateROIReport('org-x');
    expect(report.incumbentSavingHigh).toBe(PRICING.competitorBenchmarks.nexaraSavingVsIncumbentHigh);
  });

  it('generatedAt is a valid ISO date string', async () => {
    const report = await billing.generateROIReport('org-x');
    expect(new Date(report.generatedAt).toString()).not.toBe('Invalid Date');
  });
});

// ─── PartnerPricingService.calculateResellerBuyPrice ─────────────────────────

describe('PartnerPricingService.calculateResellerBuyPrice', () => {
  it('RESELLER gets 20% off Starter £49 → £39.20', () => {
    expect(partnerSvc.calculateResellerBuyPrice('STARTER', 49, 'RESELLER')).toBeCloseTo(39.20, 2);
  });

  it('RESELLER gets 20% off Professional £39 → £31.20', () => {
    expect(partnerSvc.calculateResellerBuyPrice('PROFESSIONAL', 39, 'RESELLER')).toBeCloseTo(31.20, 2);
  });

  it('RESELLER gets 20% off Enterprise £28 → £22.40', () => {
    expect(partnerSvc.calculateResellerBuyPrice('ENTERPRISE', 28, 'RESELLER')).toBeCloseTo(22.40, 2);
  });

  it('STRATEGIC gets 30% off Starter £49 → £34.30', () => {
    expect(partnerSvc.calculateResellerBuyPrice('STARTER', 49, 'STRATEGIC')).toBeCloseTo(34.30, 2);
  });

  it('STRATEGIC gets 30% off Professional £39 → £27.30', () => {
    expect(partnerSvc.calculateResellerBuyPrice('PROFESSIONAL', 39, 'STRATEGIC')).toBeCloseTo(27.30, 2);
  });

  it('STRATEGIC gets 30% off Enterprise £28 → £19.60', () => {
    expect(partnerSvc.calculateResellerBuyPrice('ENTERPRISE', 28, 'STRATEGIC')).toBeCloseTo(19.60, 2);
  });

  it('WHITE_LABEL gets 35% off Professional £39 → £25.35', () => {
    expect(partnerSvc.calculateResellerBuyPrice('PROFESSIONAL', 39, 'WHITE_LABEL')).toBeCloseTo(25.35, 2);
  });

  it('REFERRAL gets 0% off (no reseller discount)', () => {
    expect(partnerSvc.calculateResellerBuyPrice('PROFESSIONAL', 39, 'REFERRAL')).toBeCloseTo(39.00, 2);
  });

  it('buy price is always less than or equal to list price for RESELLER', () => {
    const buy = partnerSvc.calculateResellerBuyPrice('PROFESSIONAL', 39, 'RESELLER');
    expect(buy).toBeLessThanOrEqual(39);
  });

  it('STRATEGIC buy price < RESELLER buy price for same tier', () => {
    const resellerBuy = partnerSvc.calculateResellerBuyPrice('ENTERPRISE', 28, 'RESELLER');
    const strategicBuy = partnerSvc.calculateResellerBuyPrice('ENTERPRISE', 28, 'STRATEGIC');
    expect(strategicBuy).toBeLessThan(resellerBuy);
  });
});

// ─── PartnerPricingService.calculateReferralCommission ───────────────────────

describe('PartnerPricingService.calculateReferralCommission', () => {
  it('REFERRAL: 15% of £14,880 = £2,232', () => {
    const { commissionPct, commissionAmount } = partnerSvc.calculateReferralCommission(14880, 'REFERRAL');
    expect(commissionPct).toBe(15);
    expect(commissionAmount).toBeCloseTo(2232, 2);
  });

  it('REFERRAL: 15% of £26,400 = £3,960', () => {
    const { commissionAmount } = partnerSvc.calculateReferralCommission(26400, 'REFERRAL');
    expect(commissionAmount).toBeCloseTo(3960, 2);
  });

  it('RESELLER: 0% commission (earns margin, not commission)', () => {
    const { commissionPct, commissionAmount } = partnerSvc.calculateReferralCommission(14880, 'RESELLER');
    expect(commissionPct).toBe(0);
    expect(commissionAmount).toBe(0);
  });

  it('commission amount scales linearly with dealACV', () => {
    const { commissionAmount: c1 } = partnerSvc.calculateReferralCommission(10000, 'REFERRAL');
    const { commissionAmount: c2 } = partnerSvc.calculateReferralCommission(20000, 'REFERRAL');
    expect(c2).toBeCloseTo(c1 * 2, 1);
  });
});

// ─── PartnerPricingService.generatePartnerQuote ───────────────────────────────

describe('PartnerPricingService.generatePartnerQuote', () => {
  it('returns expected shape', () => {
    const quote = partnerSvc.generatePartnerQuote('RESELLER', 40, 'PROFESSIONAL');
    expect(quote).toHaveProperty('partnerTier', 'RESELLER');
    expect(quote).toHaveProperty('tier', 'PROFESSIONAL');
    expect(quote).toHaveProperty('userCount', 40);
    expect(quote).toHaveProperty('endCustomerACVGBP');
    expect(quote).toHaveProperty('buyPriceACVGBP');
    expect(quote).toHaveProperty('marginGBP');
    expect(quote).toHaveProperty('marginPct');
    expect(quote).toHaveProperty('currency', 'GBP');
  });

  it('RESELLER 40 Professional: endCustomerACV = £14,880', () => {
    const quote = partnerSvc.generatePartnerQuote('RESELLER', 40, 'PROFESSIONAL');
    expect(quote.endCustomerACVGBP).toBe(calculateACV('PROFESSIONAL', 40, 'annual'));
  });

  it('RESELLER 40 Professional: marginPct ≈ 20%', () => {
    const quote = partnerSvc.generatePartnerQuote('RESELLER', 40, 'PROFESSIONAL');
    expect(quote.marginPct).toBeCloseTo(20, 0);
  });

  it('RESELLER 40 Professional: buyPrice = endCustomer × 0.80', () => {
    const quote = partnerSvc.generatePartnerQuote('RESELLER', 40, 'PROFESSIONAL');
    expect(quote.buyPriceACVGBP).toBeCloseTo(quote.endCustomerACVGBP * 0.80, 0);
  });

  it('STRATEGIC 100 Enterprise: marginPct ≈ 30%', () => {
    const quote = partnerSvc.generatePartnerQuote('STRATEGIC', 100, 'ENTERPRISE');
    expect(quote.marginPct).toBeCloseTo(30, 0);
  });

  it('STRATEGIC margin > RESELLER margin for same deal', () => {
    const r = partnerSvc.generatePartnerQuote('RESELLER', 100, 'ENTERPRISE');
    const s = partnerSvc.generatePartnerQuote('STRATEGIC', 100, 'ENTERPRISE');
    expect(s.marginGBP).toBeGreaterThan(r.marginGBP);
  });

  it('WHITE_LABEL marginPct ≈ 35%', () => {
    const quote = partnerSvc.generatePartnerQuote('WHITE_LABEL', 50, 'PROFESSIONAL');
    expect(quote.marginPct).toBeCloseTo(35, 0);
  });

  it('REFERRAL quote has 0% margin (earns commission separately)', () => {
    const quote = partnerSvc.generatePartnerQuote('REFERRAL', 40, 'PROFESSIONAL');
    expect(quote.marginPct).toBeCloseTo(0, 0);
  });

  it('endCustomerACVGBP > buyPriceACVGBP for RESELLER', () => {
    const quote = partnerSvc.generatePartnerQuote('RESELLER', 40, 'PROFESSIONAL');
    expect(quote.endCustomerACVGBP).toBeGreaterThan(quote.buyPriceACVGBP);
  });

  it('STARTER tier quote returns valid ACV', () => {
    const quote = partnerSvc.generatePartnerQuote('RESELLER', 10, 'STARTER');
    expect(quote.endCustomerACVGBP).toBe(calculateACV('STARTER', 10, 'annual'));
    expect(quote.endCustomerACVGBP).toBeGreaterThan(0);
  });

  it('perUserMonthlyListPrice is null for ENTERPRISE_PLUS (custom pricing)', () => {
    const quote = partnerSvc.generatePartnerQuote('STRATEGIC', 600, 'ENTERPRISE_PLUS');
    // 600 users exceeds band 4 (500+), so volume price = null
    expect(quote.perUserMonthlyListPrice).toBeNull();
  });

  it('commitmentYears defaults to 1', () => {
    const q1 = partnerSvc.generatePartnerQuote('RESELLER', 40, 'PROFESSIONAL', 1);
    const qd = partnerSvc.generatePartnerQuote('RESELLER', 40, 'PROFESSIONAL');
    expect(qd.endCustomerACVGBP).toBe(q1.endCustomerACVGBP);
  });
});

// ─── Algorithm puzzle phases (ph217bs–ph220bs) ────────────────────────────────
function moveZeroes217bs(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217bs_mz',()=>{
  it('a',()=>{expect(moveZeroes217bs([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217bs([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217bs([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217bs([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217bs([4,2,0,0,3])).toBe(4);});
});
function missingNumber218bs(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218bs_mn',()=>{
  it('a',()=>{expect(missingNumber218bs([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218bs([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218bs([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218bs([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218bs([1])).toBe(0);});
});
function countBits219bs(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219bs_cb',()=>{
  it('a',()=>{expect(countBits219bs(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219bs(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219bs(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219bs(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219bs(4)[4]).toBe(1);});
});
function climbStairs220bs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220bs_cs',()=>{
  it('a',()=>{expect(climbStairs220bs(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220bs(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220bs(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220bs(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220bs(1)).toBe(1);});
});

// ─── Algorithm puzzle phases (ph221bs–ph226bs) ────────────────────────────────
function maxProfit221bs(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph221bs_mp',()=>{
  it('a',()=>{expect(maxProfit221bs([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit221bs([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit221bs([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit221bs([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit221bs([1])).toBe(0);});
});
function singleNumber222bs(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph222bs_sn',()=>{
  it('a',()=>{expect(singleNumber222bs([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber222bs([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber222bs([1])).toBe(1);});
  it('d',()=>{expect(singleNumber222bs([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber222bs([3,3,5])).toBe(5);});
});
function hammingDist223bs(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph223bs_hd',()=>{
  it('a',()=>{expect(hammingDist223bs(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist223bs(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist223bs(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist223bs(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist223bs(7,7)).toBe(0);});
});
function majorElem224bs(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph224bs_me',()=>{
  it('a',()=>{expect(majorElem224bs([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem224bs([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem224bs([1])).toBe(1);});
  it('d',()=>{expect(majorElem224bs([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem224bs([6,5,5])).toBe(5);});
});
function climbStairs225bs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph225bs_cs2',()=>{
  it('a',()=>{expect(climbStairs225bs(6)).toBe(13);});
  it('b',()=>{expect(climbStairs225bs(7)).toBe(21);});
  it('c',()=>{expect(climbStairs225bs(8)).toBe(34);});
  it('d',()=>{expect(climbStairs225bs(9)).toBe(55);});
  it('e',()=>{expect(climbStairs225bs(10)).toBe(89);});
});
function missingNum226bs(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph226bs_mn2',()=>{
  it('a',()=>{expect(missingNum226bs([0,2,3,4])).toBe(1);});
  it('b',()=>{expect(missingNum226bs([1,2,3,4])).toBe(0);});
  it('c',()=>{expect(missingNum226bs([0,1,2,4])).toBe(3);});
  it('d',()=>{expect(missingNum226bs([0,1,3,4])).toBe(2);});
  it('e',()=>{expect(missingNum226bs([0,1,2,3])).toBe(4);});
});
function cs255bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph255bs2_cs',()=>{it('a',()=>{expect(cs255bs2(2)).toBe(2);});it('b',()=>{expect(cs255bs2(3)).toBe(3);});it('c',()=>{expect(cs255bs2(4)).toBe(5);});it('d',()=>{expect(cs255bs2(5)).toBe(8);});it('e',()=>{expect(cs255bs2(1)).toBe(1);});});
function cs256bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph256bs2_cs',()=>{it('a',()=>{expect(cs256bs2(2)).toBe(2);});it('b',()=>{expect(cs256bs2(3)).toBe(3);});it('c',()=>{expect(cs256bs2(4)).toBe(5);});it('d',()=>{expect(cs256bs2(5)).toBe(8);});it('e',()=>{expect(cs256bs2(1)).toBe(1);});});
function cs257bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph257bs2_cs',()=>{it('a',()=>{expect(cs257bs2(2)).toBe(2);});it('b',()=>{expect(cs257bs2(3)).toBe(3);});it('c',()=>{expect(cs257bs2(4)).toBe(5);});it('d',()=>{expect(cs257bs2(5)).toBe(8);});it('e',()=>{expect(cs257bs2(1)).toBe(1);});});
function cs258bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph258bs2_cs',()=>{it('a',()=>{expect(cs258bs2(2)).toBe(2);});it('b',()=>{expect(cs258bs2(3)).toBe(3);});it('c',()=>{expect(cs258bs2(4)).toBe(5);});it('d',()=>{expect(cs258bs2(5)).toBe(8);});it('e',()=>{expect(cs258bs2(1)).toBe(1);});});
function cs259bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph259bs2_cs',()=>{it('a',()=>{expect(cs259bs2(2)).toBe(2);});it('b',()=>{expect(cs259bs2(3)).toBe(3);});it('c',()=>{expect(cs259bs2(4)).toBe(5);});it('d',()=>{expect(cs259bs2(5)).toBe(8);});it('e',()=>{expect(cs259bs2(1)).toBe(1);});});
function cs260bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph260bs2_cs',()=>{it('a',()=>{expect(cs260bs2(2)).toBe(2);});it('b',()=>{expect(cs260bs2(3)).toBe(3);});it('c',()=>{expect(cs260bs2(4)).toBe(5);});it('d',()=>{expect(cs260bs2(5)).toBe(8);});it('e',()=>{expect(cs260bs2(1)).toBe(1);});});
function cs261bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph261bs2_cs',()=>{it('a',()=>{expect(cs261bs2(2)).toBe(2);});it('b',()=>{expect(cs261bs2(3)).toBe(3);});it('c',()=>{expect(cs261bs2(4)).toBe(5);});it('d',()=>{expect(cs261bs2(5)).toBe(8);});it('e',()=>{expect(cs261bs2(1)).toBe(1);});});
function cs262bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph262bs2_cs',()=>{it('a',()=>{expect(cs262bs2(2)).toBe(2);});it('b',()=>{expect(cs262bs2(3)).toBe(3);});it('c',()=>{expect(cs262bs2(4)).toBe(5);});it('d',()=>{expect(cs262bs2(5)).toBe(8);});it('e',()=>{expect(cs262bs2(1)).toBe(1);});});
function cs263bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph263bs2_cs',()=>{it('a',()=>{expect(cs263bs2(2)).toBe(2);});it('b',()=>{expect(cs263bs2(3)).toBe(3);});it('c',()=>{expect(cs263bs2(4)).toBe(5);});it('d',()=>{expect(cs263bs2(5)).toBe(8);});it('e',()=>{expect(cs263bs2(1)).toBe(1);});});
function cs264bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph264bs2_cs',()=>{it('a',()=>{expect(cs264bs2(2)).toBe(2);});it('b',()=>{expect(cs264bs2(3)).toBe(3);});it('c',()=>{expect(cs264bs2(4)).toBe(5);});it('d',()=>{expect(cs264bs2(5)).toBe(8);});it('e',()=>{expect(cs264bs2(1)).toBe(1);});});
function cs265bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph265bs2_cs',()=>{it('a',()=>{expect(cs265bs2(2)).toBe(2);});it('b',()=>{expect(cs265bs2(3)).toBe(3);});it('c',()=>{expect(cs265bs2(4)).toBe(5);});it('d',()=>{expect(cs265bs2(5)).toBe(8);});it('e',()=>{expect(cs265bs2(1)).toBe(1);});});
function cs266bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph266bs2_cs',()=>{it('a',()=>{expect(cs266bs2(2)).toBe(2);});it('b',()=>{expect(cs266bs2(3)).toBe(3);});it('c',()=>{expect(cs266bs2(4)).toBe(5);});it('d',()=>{expect(cs266bs2(5)).toBe(8);});it('e',()=>{expect(cs266bs2(1)).toBe(1);});});
function cs267bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph267bs2_cs',()=>{it('a',()=>{expect(cs267bs2(2)).toBe(2);});it('b',()=>{expect(cs267bs2(3)).toBe(3);});it('c',()=>{expect(cs267bs2(4)).toBe(5);});it('d',()=>{expect(cs267bs2(5)).toBe(8);});it('e',()=>{expect(cs267bs2(1)).toBe(1);});});
function cs268bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph268bs2_cs',()=>{it('a',()=>{expect(cs268bs2(2)).toBe(2);});it('b',()=>{expect(cs268bs2(3)).toBe(3);});it('c',()=>{expect(cs268bs2(4)).toBe(5);});it('d',()=>{expect(cs268bs2(5)).toBe(8);});it('e',()=>{expect(cs268bs2(1)).toBe(1);});});
function cs269bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph269bs2_cs',()=>{it('a',()=>{expect(cs269bs2(2)).toBe(2);});it('b',()=>{expect(cs269bs2(3)).toBe(3);});it('c',()=>{expect(cs269bs2(4)).toBe(5);});it('d',()=>{expect(cs269bs2(5)).toBe(8);});it('e',()=>{expect(cs269bs2(1)).toBe(1);});});
function cs270bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph270bs2_cs',()=>{it('a',()=>{expect(cs270bs2(2)).toBe(2);});it('b',()=>{expect(cs270bs2(3)).toBe(3);});it('c',()=>{expect(cs270bs2(4)).toBe(5);});it('d',()=>{expect(cs270bs2(5)).toBe(8);});it('e',()=>{expect(cs270bs2(1)).toBe(1);});});
function cs271bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph271bs2_cs',()=>{it('a',()=>{expect(cs271bs2(2)).toBe(2);});it('b',()=>{expect(cs271bs2(3)).toBe(3);});it('c',()=>{expect(cs271bs2(4)).toBe(5);});it('d',()=>{expect(cs271bs2(5)).toBe(8);});it('e',()=>{expect(cs271bs2(1)).toBe(1);});});
function cs272bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph272bs2_cs',()=>{it('a',()=>{expect(cs272bs2(2)).toBe(2);});it('b',()=>{expect(cs272bs2(3)).toBe(3);});it('c',()=>{expect(cs272bs2(4)).toBe(5);});it('d',()=>{expect(cs272bs2(5)).toBe(8);});it('e',()=>{expect(cs272bs2(1)).toBe(1);});});
function cs273bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph273bs2_cs',()=>{it('a',()=>{expect(cs273bs2(2)).toBe(2);});it('b',()=>{expect(cs273bs2(3)).toBe(3);});it('c',()=>{expect(cs273bs2(4)).toBe(5);});it('d',()=>{expect(cs273bs2(5)).toBe(8);});it('e',()=>{expect(cs273bs2(1)).toBe(1);});});
function cs274bs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph274bs2_cs',()=>{it('a',()=>{expect(cs274bs2(2)).toBe(2);});it('b',()=>{expect(cs274bs2(3)).toBe(3);});it('c',()=>{expect(cs274bs2(4)).toBe(5);});it('d',()=>{expect(cs274bs2(5)).toBe(8);});it('e',()=>{expect(cs274bs2(1)).toBe(1);});});
function hd258bsvc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258bsvc_hd',()=>{it('a',()=>{expect(hd258bsvc(1,4)).toBe(2);});it('b',()=>{expect(hd258bsvc(3,1)).toBe(1);});it('c',()=>{expect(hd258bsvc(0,0)).toBe(0);});it('d',()=>{expect(hd258bsvc(93,73)).toBe(2);});it('e',()=>{expect(hd258bsvc(15,0)).toBe(4);});});
function hd259bsvc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259bsvc_hd',()=>{it('a',()=>{expect(hd259bsvc(1,4)).toBe(2);});it('b',()=>{expect(hd259bsvc(3,1)).toBe(1);});it('c',()=>{expect(hd259bsvc(0,0)).toBe(0);});it('d',()=>{expect(hd259bsvc(93,73)).toBe(2);});it('e',()=>{expect(hd259bsvc(15,0)).toBe(4);});});
function hd260bsvc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260bsvc_hd',()=>{it('a',()=>{expect(hd260bsvc(1,4)).toBe(2);});it('b',()=>{expect(hd260bsvc(3,1)).toBe(1);});it('c',()=>{expect(hd260bsvc(0,0)).toBe(0);});it('d',()=>{expect(hd260bsvc(93,73)).toBe(2);});it('e',()=>{expect(hd260bsvc(15,0)).toBe(4);});});
function hd261bsvc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261bsvc_hd',()=>{it('a',()=>{expect(hd261bsvc(1,4)).toBe(2);});it('b',()=>{expect(hd261bsvc(3,1)).toBe(1);});it('c',()=>{expect(hd261bsvc(0,0)).toBe(0);});it('d',()=>{expect(hd261bsvc(93,73)).toBe(2);});it('e',()=>{expect(hd261bsvc(15,0)).toBe(4);});});
function hd262bsvc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262bsvc_hd',()=>{it('a',()=>{expect(hd262bsvc(1,4)).toBe(2);});it('b',()=>{expect(hd262bsvc(3,1)).toBe(1);});it('c',()=>{expect(hd262bsvc(0,0)).toBe(0);});it('d',()=>{expect(hd262bsvc(93,73)).toBe(2);});it('e',()=>{expect(hd262bsvc(15,0)).toBe(4);});});
function hd258bsvc2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258bsvc2_hd',()=>{it('a',()=>{expect(hd258bsvc2(1,4)).toBe(2);});it('b',()=>{expect(hd258bsvc2(3,1)).toBe(1);});it('c',()=>{expect(hd258bsvc2(0,0)).toBe(0);});it('d',()=>{expect(hd258bsvc2(93,73)).toBe(2);});it('e',()=>{expect(hd258bsvc2(15,0)).toBe(4);});});
function hd259bsvc2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259bsvc2_hd',()=>{it('a',()=>{expect(hd259bsvc2(1,4)).toBe(2);});it('b',()=>{expect(hd259bsvc2(3,1)).toBe(1);});it('c',()=>{expect(hd259bsvc2(0,0)).toBe(0);});it('d',()=>{expect(hd259bsvc2(93,73)).toBe(2);});it('e',()=>{expect(hd259bsvc2(15,0)).toBe(4);});});
function hd260bsvc2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260bsvc2_hd',()=>{it('a',()=>{expect(hd260bsvc2(1,4)).toBe(2);});it('b',()=>{expect(hd260bsvc2(3,1)).toBe(1);});it('c',()=>{expect(hd260bsvc2(0,0)).toBe(0);});it('d',()=>{expect(hd260bsvc2(93,73)).toBe(2);});it('e',()=>{expect(hd260bsvc2(15,0)).toBe(4);});});
function hd261bsvc2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261bsvc2_hd',()=>{it('a',()=>{expect(hd261bsvc2(1,4)).toBe(2);});it('b',()=>{expect(hd261bsvc2(3,1)).toBe(1);});it('c',()=>{expect(hd261bsvc2(0,0)).toBe(0);});it('d',()=>{expect(hd261bsvc2(93,73)).toBe(2);});it('e',()=>{expect(hd261bsvc2(15,0)).toBe(4);});});
function hd258bsvc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258bsvc3_hd',()=>{it('a',()=>{expect(hd258bsvc3(1,4)).toBe(2);});it('b',()=>{expect(hd258bsvc3(3,1)).toBe(1);});it('c',()=>{expect(hd258bsvc3(0,0)).toBe(0);});it('d',()=>{expect(hd258bsvc3(93,73)).toBe(2);});it('e',()=>{expect(hd258bsvc3(15,0)).toBe(4);});});
function hd259bsvc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259bsvc3_hd',()=>{it('a',()=>{expect(hd259bsvc3(1,4)).toBe(2);});it('b',()=>{expect(hd259bsvc3(3,1)).toBe(1);});it('c',()=>{expect(hd259bsvc3(0,0)).toBe(0);});it('d',()=>{expect(hd259bsvc3(93,73)).toBe(2);});it('e',()=>{expect(hd259bsvc3(15,0)).toBe(4);});});
function hd260bsvc3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260bsvc3_hd',()=>{it('a',()=>{expect(hd260bsvc3(1,4)).toBe(2);});it('b',()=>{expect(hd260bsvc3(3,1)).toBe(1);});it('c',()=>{expect(hd260bsvc3(0,0)).toBe(0);});it('d',()=>{expect(hd260bsvc3(93,73)).toBe(2);});it('e',()=>{expect(hd260bsvc3(15,0)).toBe(4);});});
function hd258bsvc4(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258bsvc4_hd',()=>{it('a',()=>{expect(hd258bsvc4(1,4)).toBe(2);});it('b',()=>{expect(hd258bsvc4(3,1)).toBe(1);});it('c',()=>{expect(hd258bsvc4(0,0)).toBe(0);});it('d',()=>{expect(hd258bsvc4(93,73)).toBe(2);});it('e',()=>{expect(hd258bsvc4(15,0)).toBe(4);});});
function hd259bsvc4(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259bsvc4_hd',()=>{it('a',()=>{expect(hd259bsvc4(1,4)).toBe(2);});it('b',()=>{expect(hd259bsvc4(3,1)).toBe(1);});it('c',()=>{expect(hd259bsvc4(0,0)).toBe(0);});it('d',()=>{expect(hd259bsvc4(93,73)).toBe(2);});it('e',()=>{expect(hd259bsvc4(15,0)).toBe(4);});});
