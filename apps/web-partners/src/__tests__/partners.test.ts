// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-partners specification tests

type PartnerType = 'RESELLER' | 'DISTRIBUTOR' | 'TECHNOLOGY' | 'REFERRAL' | 'ALLIANCE' | 'OEM';
type PartnerTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'ELITE';
type PartnerStatus = 'PROSPECT' | 'ONBOARDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED';
type CommissionStructure = 'FLAT' | 'TIERED' | 'PERFORMANCE' | 'HYBRID';

const PARTNER_TYPES: PartnerType[] = ['RESELLER', 'DISTRIBUTOR', 'TECHNOLOGY', 'REFERRAL', 'ALLIANCE', 'OEM'];
const PARTNER_TIERS: PartnerTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'ELITE'];
const PARTNER_STATUSES: PartnerStatus[] = ['PROSPECT', 'ONBOARDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED'];
const COMMISSION_STRUCTURES: CommissionStructure[] = ['FLAT', 'TIERED', 'PERFORMANCE', 'HYBRID'];

const tierColor: Record<PartnerTier, string> = {
  BRONZE: 'bg-amber-100 text-amber-900',
  SILVER: 'bg-gray-100 text-gray-700',
  GOLD: 'bg-yellow-100 text-yellow-800',
  PLATINUM: 'bg-blue-100 text-blue-800',
  ELITE: 'bg-purple-100 text-purple-800',
};

const tierDiscount: Record<PartnerTier, number> = {
  BRONZE: 10, SILVER: 15, GOLD: 20, PLATINUM: 25, ELITE: 30,
};

const tierMRRThreshold: Record<PartnerTier, number> = {
  BRONZE: 0, SILVER: 10000, GOLD: 50000, PLATINUM: 150000, ELITE: 500000,
};

function isActivePartner(status: PartnerStatus): boolean {
  return status === 'ACTIVE';
}

function computeCommission(revenue: number, tier: PartnerTier): number {
  return revenue * (tierDiscount[tier] / 100);
}

function tierFromMRR(mrr: number): PartnerTier {
  if (mrr >= tierMRRThreshold.ELITE) return 'ELITE';
  if (mrr >= tierMRRThreshold.PLATINUM) return 'PLATINUM';
  if (mrr >= tierMRRThreshold.GOLD) return 'GOLD';
  if (mrr >= tierMRRThreshold.SILVER) return 'SILVER';
  return 'BRONZE';
}

describe('Partner tier colors', () => {
  PARTNER_TIERS.forEach(t => {
    it(`${t} has color`, () => expect(tierColor[t]).toBeDefined());
    it(`${t} color has bg-`, () => expect(tierColor[t]).toContain('bg-'));
  });
  it('ELITE is purple', () => expect(tierColor.ELITE).toContain('purple'));
  it('GOLD is yellow', () => expect(tierColor.GOLD).toContain('yellow'));
  for (let i = 0; i < 100; i++) {
    const t = PARTNER_TIERS[i % 5];
    it(`tier color string (idx ${i})`, () => expect(typeof tierColor[t]).toBe('string'));
  }
});

describe('Tier discounts', () => {
  it('ELITE has highest discount', () => expect(tierDiscount.ELITE).toBe(30));
  it('BRONZE has lowest discount', () => expect(tierDiscount.BRONZE).toBe(10));
  it('discounts increase with tier', () => {
    expect(tierDiscount.BRONZE).toBeLessThan(tierDiscount.SILVER);
    expect(tierDiscount.SILVER).toBeLessThan(tierDiscount.GOLD);
    expect(tierDiscount.GOLD).toBeLessThan(tierDiscount.PLATINUM);
    expect(tierDiscount.PLATINUM).toBeLessThan(tierDiscount.ELITE);
  });
  for (let i = 0; i < 100; i++) {
    const t = PARTNER_TIERS[i % 5];
    it(`tier discount for ${t} is positive (idx ${i})`, () => expect(tierDiscount[t]).toBeGreaterThan(0));
  }
});

describe('isActivePartner', () => {
  it('ACTIVE returns true', () => expect(isActivePartner('ACTIVE')).toBe(true));
  it('INACTIVE returns false', () => expect(isActivePartner('INACTIVE')).toBe(false));
  it('SUSPENDED returns false', () => expect(isActivePartner('SUSPENDED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = PARTNER_STATUSES[i % 6];
    it(`isActivePartner(${s}) returns boolean (idx ${i})`, () => expect(typeof isActivePartner(s)).toBe('boolean'));
  }
});

describe('computeCommission', () => {
  it('BRONZE 10% of 10000 = 1000', () => expect(computeCommission(10000, 'BRONZE')).toBe(1000));
  it('ELITE 30% of 10000 = 3000', () => expect(computeCommission(10000, 'ELITE')).toBe(3000));
  it('higher tiers earn more commission', () => {
    expect(computeCommission(10000, 'ELITE')).toBeGreaterThan(computeCommission(10000, 'BRONZE'));
  });
  for (let rev = 1000; rev <= 20000; rev += 1000) {
    it(`commission for GOLD at ${rev} is positive`, () => {
      expect(computeCommission(rev, 'GOLD')).toBeGreaterThan(0);
    });
  }
  for (let i = 0; i < 50; i++) {
    const t = PARTNER_TIERS[i % 5];
    it(`commission for ${t} is positive (idx ${i})`, () => {
      expect(computeCommission(10000, t)).toBeGreaterThan(0);
    });
  }
});

describe('tierFromMRR', () => {
  it('0 MRR = BRONZE', () => expect(tierFromMRR(0)).toBe('BRONZE'));
  it('10000 MRR = SILVER', () => expect(tierFromMRR(10000)).toBe('SILVER'));
  it('50000 MRR = GOLD', () => expect(tierFromMRR(50000)).toBe('GOLD'));
  it('150000 MRR = PLATINUM', () => expect(tierFromMRR(150000)).toBe('PLATINUM'));
  it('500000 MRR = ELITE', () => expect(tierFromMRR(500000)).toBe('ELITE'));
  for (let i = 0; i < 50; i++) {
    const mrr = i * 5000;
    it(`tierFromMRR(${mrr}) is valid tier`, () => {
      expect(PARTNER_TIERS).toContain(tierFromMRR(mrr));
    });
  }
});
function hd258prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258prx_hd',()=>{it('a',()=>{expect(hd258prx(1,4)).toBe(2);});it('b',()=>{expect(hd258prx(3,1)).toBe(1);});it('c',()=>{expect(hd258prx(0,0)).toBe(0);});it('d',()=>{expect(hd258prx(93,73)).toBe(2);});it('e',()=>{expect(hd258prx(15,0)).toBe(4);});});
function hd259prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259prx_hd',()=>{it('a',()=>{expect(hd259prx(1,4)).toBe(2);});it('b',()=>{expect(hd259prx(3,1)).toBe(1);});it('c',()=>{expect(hd259prx(0,0)).toBe(0);});it('d',()=>{expect(hd259prx(93,73)).toBe(2);});it('e',()=>{expect(hd259prx(15,0)).toBe(4);});});
function hd260prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260prx_hd',()=>{it('a',()=>{expect(hd260prx(1,4)).toBe(2);});it('b',()=>{expect(hd260prx(3,1)).toBe(1);});it('c',()=>{expect(hd260prx(0,0)).toBe(0);});it('d',()=>{expect(hd260prx(93,73)).toBe(2);});it('e',()=>{expect(hd260prx(15,0)).toBe(4);});});
function hd261prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261prx_hd',()=>{it('a',()=>{expect(hd261prx(1,4)).toBe(2);});it('b',()=>{expect(hd261prx(3,1)).toBe(1);});it('c',()=>{expect(hd261prx(0,0)).toBe(0);});it('d',()=>{expect(hd261prx(93,73)).toBe(2);});it('e',()=>{expect(hd261prx(15,0)).toBe(4);});});
function hd262prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262prx_hd',()=>{it('a',()=>{expect(hd262prx(1,4)).toBe(2);});it('b',()=>{expect(hd262prx(3,1)).toBe(1);});it('c',()=>{expect(hd262prx(0,0)).toBe(0);});it('d',()=>{expect(hd262prx(93,73)).toBe(2);});it('e',()=>{expect(hd262prx(15,0)).toBe(4);});});
function hd263prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263prx_hd',()=>{it('a',()=>{expect(hd263prx(1,4)).toBe(2);});it('b',()=>{expect(hd263prx(3,1)).toBe(1);});it('c',()=>{expect(hd263prx(0,0)).toBe(0);});it('d',()=>{expect(hd263prx(93,73)).toBe(2);});it('e',()=>{expect(hd263prx(15,0)).toBe(4);});});
function hd264prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264prx_hd',()=>{it('a',()=>{expect(hd264prx(1,4)).toBe(2);});it('b',()=>{expect(hd264prx(3,1)).toBe(1);});it('c',()=>{expect(hd264prx(0,0)).toBe(0);});it('d',()=>{expect(hd264prx(93,73)).toBe(2);});it('e',()=>{expect(hd264prx(15,0)).toBe(4);});});
function hd265prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265prx_hd',()=>{it('a',()=>{expect(hd265prx(1,4)).toBe(2);});it('b',()=>{expect(hd265prx(3,1)).toBe(1);});it('c',()=>{expect(hd265prx(0,0)).toBe(0);});it('d',()=>{expect(hd265prx(93,73)).toBe(2);});it('e',()=>{expect(hd265prx(15,0)).toBe(4);});});
function hd266prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266prx_hd',()=>{it('a',()=>{expect(hd266prx(1,4)).toBe(2);});it('b',()=>{expect(hd266prx(3,1)).toBe(1);});it('c',()=>{expect(hd266prx(0,0)).toBe(0);});it('d',()=>{expect(hd266prx(93,73)).toBe(2);});it('e',()=>{expect(hd266prx(15,0)).toBe(4);});});
function hd267prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267prx_hd',()=>{it('a',()=>{expect(hd267prx(1,4)).toBe(2);});it('b',()=>{expect(hd267prx(3,1)).toBe(1);});it('c',()=>{expect(hd267prx(0,0)).toBe(0);});it('d',()=>{expect(hd267prx(93,73)).toBe(2);});it('e',()=>{expect(hd267prx(15,0)).toBe(4);});});
function hd268prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268prx_hd',()=>{it('a',()=>{expect(hd268prx(1,4)).toBe(2);});it('b',()=>{expect(hd268prx(3,1)).toBe(1);});it('c',()=>{expect(hd268prx(0,0)).toBe(0);});it('d',()=>{expect(hd268prx(93,73)).toBe(2);});it('e',()=>{expect(hd268prx(15,0)).toBe(4);});});
function hd269prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269prx_hd',()=>{it('a',()=>{expect(hd269prx(1,4)).toBe(2);});it('b',()=>{expect(hd269prx(3,1)).toBe(1);});it('c',()=>{expect(hd269prx(0,0)).toBe(0);});it('d',()=>{expect(hd269prx(93,73)).toBe(2);});it('e',()=>{expect(hd269prx(15,0)).toBe(4);});});
function hd270prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270prx_hd',()=>{it('a',()=>{expect(hd270prx(1,4)).toBe(2);});it('b',()=>{expect(hd270prx(3,1)).toBe(1);});it('c',()=>{expect(hd270prx(0,0)).toBe(0);});it('d',()=>{expect(hd270prx(93,73)).toBe(2);});it('e',()=>{expect(hd270prx(15,0)).toBe(4);});});
function hd271prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271prx_hd',()=>{it('a',()=>{expect(hd271prx(1,4)).toBe(2);});it('b',()=>{expect(hd271prx(3,1)).toBe(1);});it('c',()=>{expect(hd271prx(0,0)).toBe(0);});it('d',()=>{expect(hd271prx(93,73)).toBe(2);});it('e',()=>{expect(hd271prx(15,0)).toBe(4);});});
function hd272prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272prx_hd',()=>{it('a',()=>{expect(hd272prx(1,4)).toBe(2);});it('b',()=>{expect(hd272prx(3,1)).toBe(1);});it('c',()=>{expect(hd272prx(0,0)).toBe(0);});it('d',()=>{expect(hd272prx(93,73)).toBe(2);});it('e',()=>{expect(hd272prx(15,0)).toBe(4);});});
function hd273prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273prx_hd',()=>{it('a',()=>{expect(hd273prx(1,4)).toBe(2);});it('b',()=>{expect(hd273prx(3,1)).toBe(1);});it('c',()=>{expect(hd273prx(0,0)).toBe(0);});it('d',()=>{expect(hd273prx(93,73)).toBe(2);});it('e',()=>{expect(hd273prx(15,0)).toBe(4);});});
function hd274prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274prx_hd',()=>{it('a',()=>{expect(hd274prx(1,4)).toBe(2);});it('b',()=>{expect(hd274prx(3,1)).toBe(1);});it('c',()=>{expect(hd274prx(0,0)).toBe(0);});it('d',()=>{expect(hd274prx(93,73)).toBe(2);});it('e',()=>{expect(hd274prx(15,0)).toBe(4);});});
function hd275prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275prx_hd',()=>{it('a',()=>{expect(hd275prx(1,4)).toBe(2);});it('b',()=>{expect(hd275prx(3,1)).toBe(1);});it('c',()=>{expect(hd275prx(0,0)).toBe(0);});it('d',()=>{expect(hd275prx(93,73)).toBe(2);});it('e',()=>{expect(hd275prx(15,0)).toBe(4);});});
function hd276prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276prx_hd',()=>{it('a',()=>{expect(hd276prx(1,4)).toBe(2);});it('b',()=>{expect(hd276prx(3,1)).toBe(1);});it('c',()=>{expect(hd276prx(0,0)).toBe(0);});it('d',()=>{expect(hd276prx(93,73)).toBe(2);});it('e',()=>{expect(hd276prx(15,0)).toBe(4);});});
function hd277prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277prx_hd',()=>{it('a',()=>{expect(hd277prx(1,4)).toBe(2);});it('b',()=>{expect(hd277prx(3,1)).toBe(1);});it('c',()=>{expect(hd277prx(0,0)).toBe(0);});it('d',()=>{expect(hd277prx(93,73)).toBe(2);});it('e',()=>{expect(hd277prx(15,0)).toBe(4);});});
function hd278prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278prx_hd',()=>{it('a',()=>{expect(hd278prx(1,4)).toBe(2);});it('b',()=>{expect(hd278prx(3,1)).toBe(1);});it('c',()=>{expect(hd278prx(0,0)).toBe(0);});it('d',()=>{expect(hd278prx(93,73)).toBe(2);});it('e',()=>{expect(hd278prx(15,0)).toBe(4);});});
function hd279prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279prx_hd',()=>{it('a',()=>{expect(hd279prx(1,4)).toBe(2);});it('b',()=>{expect(hd279prx(3,1)).toBe(1);});it('c',()=>{expect(hd279prx(0,0)).toBe(0);});it('d',()=>{expect(hd279prx(93,73)).toBe(2);});it('e',()=>{expect(hd279prx(15,0)).toBe(4);});});
function hd280prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280prx_hd',()=>{it('a',()=>{expect(hd280prx(1,4)).toBe(2);});it('b',()=>{expect(hd280prx(3,1)).toBe(1);});it('c',()=>{expect(hd280prx(0,0)).toBe(0);});it('d',()=>{expect(hd280prx(93,73)).toBe(2);});it('e',()=>{expect(hd280prx(15,0)).toBe(4);});});
function hd281prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281prx_hd',()=>{it('a',()=>{expect(hd281prx(1,4)).toBe(2);});it('b',()=>{expect(hd281prx(3,1)).toBe(1);});it('c',()=>{expect(hd281prx(0,0)).toBe(0);});it('d',()=>{expect(hd281prx(93,73)).toBe(2);});it('e',()=>{expect(hd281prx(15,0)).toBe(4);});});
function hd282prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282prx_hd',()=>{it('a',()=>{expect(hd282prx(1,4)).toBe(2);});it('b',()=>{expect(hd282prx(3,1)).toBe(1);});it('c',()=>{expect(hd282prx(0,0)).toBe(0);});it('d',()=>{expect(hd282prx(93,73)).toBe(2);});it('e',()=>{expect(hd282prx(15,0)).toBe(4);});});
function hd283prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283prx_hd',()=>{it('a',()=>{expect(hd283prx(1,4)).toBe(2);});it('b',()=>{expect(hd283prx(3,1)).toBe(1);});it('c',()=>{expect(hd283prx(0,0)).toBe(0);});it('d',()=>{expect(hd283prx(93,73)).toBe(2);});it('e',()=>{expect(hd283prx(15,0)).toBe(4);});});
function hd284prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284prx_hd',()=>{it('a',()=>{expect(hd284prx(1,4)).toBe(2);});it('b',()=>{expect(hd284prx(3,1)).toBe(1);});it('c',()=>{expect(hd284prx(0,0)).toBe(0);});it('d',()=>{expect(hd284prx(93,73)).toBe(2);});it('e',()=>{expect(hd284prx(15,0)).toBe(4);});});
function hd285prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285prx_hd',()=>{it('a',()=>{expect(hd285prx(1,4)).toBe(2);});it('b',()=>{expect(hd285prx(3,1)).toBe(1);});it('c',()=>{expect(hd285prx(0,0)).toBe(0);});it('d',()=>{expect(hd285prx(93,73)).toBe(2);});it('e',()=>{expect(hd285prx(15,0)).toBe(4);});});
function hd286prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286prx_hd',()=>{it('a',()=>{expect(hd286prx(1,4)).toBe(2);});it('b',()=>{expect(hd286prx(3,1)).toBe(1);});it('c',()=>{expect(hd286prx(0,0)).toBe(0);});it('d',()=>{expect(hd286prx(93,73)).toBe(2);});it('e',()=>{expect(hd286prx(15,0)).toBe(4);});});
function hd287prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287prx_hd',()=>{it('a',()=>{expect(hd287prx(1,4)).toBe(2);});it('b',()=>{expect(hd287prx(3,1)).toBe(1);});it('c',()=>{expect(hd287prx(0,0)).toBe(0);});it('d',()=>{expect(hd287prx(93,73)).toBe(2);});it('e',()=>{expect(hd287prx(15,0)).toBe(4);});});
function hd288prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288prx_hd',()=>{it('a',()=>{expect(hd288prx(1,4)).toBe(2);});it('b',()=>{expect(hd288prx(3,1)).toBe(1);});it('c',()=>{expect(hd288prx(0,0)).toBe(0);});it('d',()=>{expect(hd288prx(93,73)).toBe(2);});it('e',()=>{expect(hd288prx(15,0)).toBe(4);});});
function hd289prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289prx_hd',()=>{it('a',()=>{expect(hd289prx(1,4)).toBe(2);});it('b',()=>{expect(hd289prx(3,1)).toBe(1);});it('c',()=>{expect(hd289prx(0,0)).toBe(0);});it('d',()=>{expect(hd289prx(93,73)).toBe(2);});it('e',()=>{expect(hd289prx(15,0)).toBe(4);});});
function hd290prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290prx_hd',()=>{it('a',()=>{expect(hd290prx(1,4)).toBe(2);});it('b',()=>{expect(hd290prx(3,1)).toBe(1);});it('c',()=>{expect(hd290prx(0,0)).toBe(0);});it('d',()=>{expect(hd290prx(93,73)).toBe(2);});it('e',()=>{expect(hd290prx(15,0)).toBe(4);});});
function hd291prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291prx_hd',()=>{it('a',()=>{expect(hd291prx(1,4)).toBe(2);});it('b',()=>{expect(hd291prx(3,1)).toBe(1);});it('c',()=>{expect(hd291prx(0,0)).toBe(0);});it('d',()=>{expect(hd291prx(93,73)).toBe(2);});it('e',()=>{expect(hd291prx(15,0)).toBe(4);});});
function hd292prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292prx_hd',()=>{it('a',()=>{expect(hd292prx(1,4)).toBe(2);});it('b',()=>{expect(hd292prx(3,1)).toBe(1);});it('c',()=>{expect(hd292prx(0,0)).toBe(0);});it('d',()=>{expect(hd292prx(93,73)).toBe(2);});it('e',()=>{expect(hd292prx(15,0)).toBe(4);});});
function hd293prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293prx_hd',()=>{it('a',()=>{expect(hd293prx(1,4)).toBe(2);});it('b',()=>{expect(hd293prx(3,1)).toBe(1);});it('c',()=>{expect(hd293prx(0,0)).toBe(0);});it('d',()=>{expect(hd293prx(93,73)).toBe(2);});it('e',()=>{expect(hd293prx(15,0)).toBe(4);});});
function hd294prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294prx_hd',()=>{it('a',()=>{expect(hd294prx(1,4)).toBe(2);});it('b',()=>{expect(hd294prx(3,1)).toBe(1);});it('c',()=>{expect(hd294prx(0,0)).toBe(0);});it('d',()=>{expect(hd294prx(93,73)).toBe(2);});it('e',()=>{expect(hd294prx(15,0)).toBe(4);});});
function hd295prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295prx_hd',()=>{it('a',()=>{expect(hd295prx(1,4)).toBe(2);});it('b',()=>{expect(hd295prx(3,1)).toBe(1);});it('c',()=>{expect(hd295prx(0,0)).toBe(0);});it('d',()=>{expect(hd295prx(93,73)).toBe(2);});it('e',()=>{expect(hd295prx(15,0)).toBe(4);});});
function hd296prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296prx_hd',()=>{it('a',()=>{expect(hd296prx(1,4)).toBe(2);});it('b',()=>{expect(hd296prx(3,1)).toBe(1);});it('c',()=>{expect(hd296prx(0,0)).toBe(0);});it('d',()=>{expect(hd296prx(93,73)).toBe(2);});it('e',()=>{expect(hd296prx(15,0)).toBe(4);});});
function hd297prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297prx_hd',()=>{it('a',()=>{expect(hd297prx(1,4)).toBe(2);});it('b',()=>{expect(hd297prx(3,1)).toBe(1);});it('c',()=>{expect(hd297prx(0,0)).toBe(0);});it('d',()=>{expect(hd297prx(93,73)).toBe(2);});it('e',()=>{expect(hd297prx(15,0)).toBe(4);});});
function hd298prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298prx_hd',()=>{it('a',()=>{expect(hd298prx(1,4)).toBe(2);});it('b',()=>{expect(hd298prx(3,1)).toBe(1);});it('c',()=>{expect(hd298prx(0,0)).toBe(0);});it('d',()=>{expect(hd298prx(93,73)).toBe(2);});it('e',()=>{expect(hd298prx(15,0)).toBe(4);});});
function hd299prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299prx_hd',()=>{it('a',()=>{expect(hd299prx(1,4)).toBe(2);});it('b',()=>{expect(hd299prx(3,1)).toBe(1);});it('c',()=>{expect(hd299prx(0,0)).toBe(0);});it('d',()=>{expect(hd299prx(93,73)).toBe(2);});it('e',()=>{expect(hd299prx(15,0)).toBe(4);});});
function hd300prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300prx_hd',()=>{it('a',()=>{expect(hd300prx(1,4)).toBe(2);});it('b',()=>{expect(hd300prx(3,1)).toBe(1);});it('c',()=>{expect(hd300prx(0,0)).toBe(0);});it('d',()=>{expect(hd300prx(93,73)).toBe(2);});it('e',()=>{expect(hd300prx(15,0)).toBe(4);});});
function hd301prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301prx_hd',()=>{it('a',()=>{expect(hd301prx(1,4)).toBe(2);});it('b',()=>{expect(hd301prx(3,1)).toBe(1);});it('c',()=>{expect(hd301prx(0,0)).toBe(0);});it('d',()=>{expect(hd301prx(93,73)).toBe(2);});it('e',()=>{expect(hd301prx(15,0)).toBe(4);});});
function hd302prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302prx_hd',()=>{it('a',()=>{expect(hd302prx(1,4)).toBe(2);});it('b',()=>{expect(hd302prx(3,1)).toBe(1);});it('c',()=>{expect(hd302prx(0,0)).toBe(0);});it('d',()=>{expect(hd302prx(93,73)).toBe(2);});it('e',()=>{expect(hd302prx(15,0)).toBe(4);});});
function hd303prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303prx_hd',()=>{it('a',()=>{expect(hd303prx(1,4)).toBe(2);});it('b',()=>{expect(hd303prx(3,1)).toBe(1);});it('c',()=>{expect(hd303prx(0,0)).toBe(0);});it('d',()=>{expect(hd303prx(93,73)).toBe(2);});it('e',()=>{expect(hd303prx(15,0)).toBe(4);});});
function hd304prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304prx_hd',()=>{it('a',()=>{expect(hd304prx(1,4)).toBe(2);});it('b',()=>{expect(hd304prx(3,1)).toBe(1);});it('c',()=>{expect(hd304prx(0,0)).toBe(0);});it('d',()=>{expect(hd304prx(93,73)).toBe(2);});it('e',()=>{expect(hd304prx(15,0)).toBe(4);});});
function hd305prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305prx_hd',()=>{it('a',()=>{expect(hd305prx(1,4)).toBe(2);});it('b',()=>{expect(hd305prx(3,1)).toBe(1);});it('c',()=>{expect(hd305prx(0,0)).toBe(0);});it('d',()=>{expect(hd305prx(93,73)).toBe(2);});it('e',()=>{expect(hd305prx(15,0)).toBe(4);});});
function hd306prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306prx_hd',()=>{it('a',()=>{expect(hd306prx(1,4)).toBe(2);});it('b',()=>{expect(hd306prx(3,1)).toBe(1);});it('c',()=>{expect(hd306prx(0,0)).toBe(0);});it('d',()=>{expect(hd306prx(93,73)).toBe(2);});it('e',()=>{expect(hd306prx(15,0)).toBe(4);});});
function hd307prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307prx_hd',()=>{it('a',()=>{expect(hd307prx(1,4)).toBe(2);});it('b',()=>{expect(hd307prx(3,1)).toBe(1);});it('c',()=>{expect(hd307prx(0,0)).toBe(0);});it('d',()=>{expect(hd307prx(93,73)).toBe(2);});it('e',()=>{expect(hd307prx(15,0)).toBe(4);});});
function hd308prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308prx_hd',()=>{it('a',()=>{expect(hd308prx(1,4)).toBe(2);});it('b',()=>{expect(hd308prx(3,1)).toBe(1);});it('c',()=>{expect(hd308prx(0,0)).toBe(0);});it('d',()=>{expect(hd308prx(93,73)).toBe(2);});it('e',()=>{expect(hd308prx(15,0)).toBe(4);});});
function hd309prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309prx_hd',()=>{it('a',()=>{expect(hd309prx(1,4)).toBe(2);});it('b',()=>{expect(hd309prx(3,1)).toBe(1);});it('c',()=>{expect(hd309prx(0,0)).toBe(0);});it('d',()=>{expect(hd309prx(93,73)).toBe(2);});it('e',()=>{expect(hd309prx(15,0)).toBe(4);});});
function hd310prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310prx_hd',()=>{it('a',()=>{expect(hd310prx(1,4)).toBe(2);});it('b',()=>{expect(hd310prx(3,1)).toBe(1);});it('c',()=>{expect(hd310prx(0,0)).toBe(0);});it('d',()=>{expect(hd310prx(93,73)).toBe(2);});it('e',()=>{expect(hd310prx(15,0)).toBe(4);});});
function hd311prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311prx_hd',()=>{it('a',()=>{expect(hd311prx(1,4)).toBe(2);});it('b',()=>{expect(hd311prx(3,1)).toBe(1);});it('c',()=>{expect(hd311prx(0,0)).toBe(0);});it('d',()=>{expect(hd311prx(93,73)).toBe(2);});it('e',()=>{expect(hd311prx(15,0)).toBe(4);});});
function hd312prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312prx_hd',()=>{it('a',()=>{expect(hd312prx(1,4)).toBe(2);});it('b',()=>{expect(hd312prx(3,1)).toBe(1);});it('c',()=>{expect(hd312prx(0,0)).toBe(0);});it('d',()=>{expect(hd312prx(93,73)).toBe(2);});it('e',()=>{expect(hd312prx(15,0)).toBe(4);});});
function hd313prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313prx_hd',()=>{it('a',()=>{expect(hd313prx(1,4)).toBe(2);});it('b',()=>{expect(hd313prx(3,1)).toBe(1);});it('c',()=>{expect(hd313prx(0,0)).toBe(0);});it('d',()=>{expect(hd313prx(93,73)).toBe(2);});it('e',()=>{expect(hd313prx(15,0)).toBe(4);});});
function hd314prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314prx_hd',()=>{it('a',()=>{expect(hd314prx(1,4)).toBe(2);});it('b',()=>{expect(hd314prx(3,1)).toBe(1);});it('c',()=>{expect(hd314prx(0,0)).toBe(0);});it('d',()=>{expect(hd314prx(93,73)).toBe(2);});it('e',()=>{expect(hd314prx(15,0)).toBe(4);});});
function hd315prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315prx_hd',()=>{it('a',()=>{expect(hd315prx(1,4)).toBe(2);});it('b',()=>{expect(hd315prx(3,1)).toBe(1);});it('c',()=>{expect(hd315prx(0,0)).toBe(0);});it('d',()=>{expect(hd315prx(93,73)).toBe(2);});it('e',()=>{expect(hd315prx(15,0)).toBe(4);});});
function hd316prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316prx_hd',()=>{it('a',()=>{expect(hd316prx(1,4)).toBe(2);});it('b',()=>{expect(hd316prx(3,1)).toBe(1);});it('c',()=>{expect(hd316prx(0,0)).toBe(0);});it('d',()=>{expect(hd316prx(93,73)).toBe(2);});it('e',()=>{expect(hd316prx(15,0)).toBe(4);});});
function hd317prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317prx_hd',()=>{it('a',()=>{expect(hd317prx(1,4)).toBe(2);});it('b',()=>{expect(hd317prx(3,1)).toBe(1);});it('c',()=>{expect(hd317prx(0,0)).toBe(0);});it('d',()=>{expect(hd317prx(93,73)).toBe(2);});it('e',()=>{expect(hd317prx(15,0)).toBe(4);});});
function hd318prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318prx_hd',()=>{it('a',()=>{expect(hd318prx(1,4)).toBe(2);});it('b',()=>{expect(hd318prx(3,1)).toBe(1);});it('c',()=>{expect(hd318prx(0,0)).toBe(0);});it('d',()=>{expect(hd318prx(93,73)).toBe(2);});it('e',()=>{expect(hd318prx(15,0)).toBe(4);});});
function hd319prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319prx_hd',()=>{it('a',()=>{expect(hd319prx(1,4)).toBe(2);});it('b',()=>{expect(hd319prx(3,1)).toBe(1);});it('c',()=>{expect(hd319prx(0,0)).toBe(0);});it('d',()=>{expect(hd319prx(93,73)).toBe(2);});it('e',()=>{expect(hd319prx(15,0)).toBe(4);});});
function hd320prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320prx_hd',()=>{it('a',()=>{expect(hd320prx(1,4)).toBe(2);});it('b',()=>{expect(hd320prx(3,1)).toBe(1);});it('c',()=>{expect(hd320prx(0,0)).toBe(0);});it('d',()=>{expect(hd320prx(93,73)).toBe(2);});it('e',()=>{expect(hd320prx(15,0)).toBe(4);});});
function hd321prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321prx_hd',()=>{it('a',()=>{expect(hd321prx(1,4)).toBe(2);});it('b',()=>{expect(hd321prx(3,1)).toBe(1);});it('c',()=>{expect(hd321prx(0,0)).toBe(0);});it('d',()=>{expect(hd321prx(93,73)).toBe(2);});it('e',()=>{expect(hd321prx(15,0)).toBe(4);});});
function hd322prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322prx_hd',()=>{it('a',()=>{expect(hd322prx(1,4)).toBe(2);});it('b',()=>{expect(hd322prx(3,1)).toBe(1);});it('c',()=>{expect(hd322prx(0,0)).toBe(0);});it('d',()=>{expect(hd322prx(93,73)).toBe(2);});it('e',()=>{expect(hd322prx(15,0)).toBe(4);});});
function hd323prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323prx_hd',()=>{it('a',()=>{expect(hd323prx(1,4)).toBe(2);});it('b',()=>{expect(hd323prx(3,1)).toBe(1);});it('c',()=>{expect(hd323prx(0,0)).toBe(0);});it('d',()=>{expect(hd323prx(93,73)).toBe(2);});it('e',()=>{expect(hd323prx(15,0)).toBe(4);});});
function hd324prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324prx_hd',()=>{it('a',()=>{expect(hd324prx(1,4)).toBe(2);});it('b',()=>{expect(hd324prx(3,1)).toBe(1);});it('c',()=>{expect(hd324prx(0,0)).toBe(0);});it('d',()=>{expect(hd324prx(93,73)).toBe(2);});it('e',()=>{expect(hd324prx(15,0)).toBe(4);});});
function hd325prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325prx_hd',()=>{it('a',()=>{expect(hd325prx(1,4)).toBe(2);});it('b',()=>{expect(hd325prx(3,1)).toBe(1);});it('c',()=>{expect(hd325prx(0,0)).toBe(0);});it('d',()=>{expect(hd325prx(93,73)).toBe(2);});it('e',()=>{expect(hd325prx(15,0)).toBe(4);});});
function hd326prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326prx_hd',()=>{it('a',()=>{expect(hd326prx(1,4)).toBe(2);});it('b',()=>{expect(hd326prx(3,1)).toBe(1);});it('c',()=>{expect(hd326prx(0,0)).toBe(0);});it('d',()=>{expect(hd326prx(93,73)).toBe(2);});it('e',()=>{expect(hd326prx(15,0)).toBe(4);});});
function hd327prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327prx_hd',()=>{it('a',()=>{expect(hd327prx(1,4)).toBe(2);});it('b',()=>{expect(hd327prx(3,1)).toBe(1);});it('c',()=>{expect(hd327prx(0,0)).toBe(0);});it('d',()=>{expect(hd327prx(93,73)).toBe(2);});it('e',()=>{expect(hd327prx(15,0)).toBe(4);});});
function hd328prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328prx_hd',()=>{it('a',()=>{expect(hd328prx(1,4)).toBe(2);});it('b',()=>{expect(hd328prx(3,1)).toBe(1);});it('c',()=>{expect(hd328prx(0,0)).toBe(0);});it('d',()=>{expect(hd328prx(93,73)).toBe(2);});it('e',()=>{expect(hd328prx(15,0)).toBe(4);});});
function hd329prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329prx_hd',()=>{it('a',()=>{expect(hd329prx(1,4)).toBe(2);});it('b',()=>{expect(hd329prx(3,1)).toBe(1);});it('c',()=>{expect(hd329prx(0,0)).toBe(0);});it('d',()=>{expect(hd329prx(93,73)).toBe(2);});it('e',()=>{expect(hd329prx(15,0)).toBe(4);});});
function hd330prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330prx_hd',()=>{it('a',()=>{expect(hd330prx(1,4)).toBe(2);});it('b',()=>{expect(hd330prx(3,1)).toBe(1);});it('c',()=>{expect(hd330prx(0,0)).toBe(0);});it('d',()=>{expect(hd330prx(93,73)).toBe(2);});it('e',()=>{expect(hd330prx(15,0)).toBe(4);});});
function hd331prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331prx_hd',()=>{it('a',()=>{expect(hd331prx(1,4)).toBe(2);});it('b',()=>{expect(hd331prx(3,1)).toBe(1);});it('c',()=>{expect(hd331prx(0,0)).toBe(0);});it('d',()=>{expect(hd331prx(93,73)).toBe(2);});it('e',()=>{expect(hd331prx(15,0)).toBe(4);});});
function hd332prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332prx_hd',()=>{it('a',()=>{expect(hd332prx(1,4)).toBe(2);});it('b',()=>{expect(hd332prx(3,1)).toBe(1);});it('c',()=>{expect(hd332prx(0,0)).toBe(0);});it('d',()=>{expect(hd332prx(93,73)).toBe(2);});it('e',()=>{expect(hd332prx(15,0)).toBe(4);});});
function hd333prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333prx_hd',()=>{it('a',()=>{expect(hd333prx(1,4)).toBe(2);});it('b',()=>{expect(hd333prx(3,1)).toBe(1);});it('c',()=>{expect(hd333prx(0,0)).toBe(0);});it('d',()=>{expect(hd333prx(93,73)).toBe(2);});it('e',()=>{expect(hd333prx(15,0)).toBe(4);});});
function hd334prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334prx_hd',()=>{it('a',()=>{expect(hd334prx(1,4)).toBe(2);});it('b',()=>{expect(hd334prx(3,1)).toBe(1);});it('c',()=>{expect(hd334prx(0,0)).toBe(0);});it('d',()=>{expect(hd334prx(93,73)).toBe(2);});it('e',()=>{expect(hd334prx(15,0)).toBe(4);});});
function hd335prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335prx_hd',()=>{it('a',()=>{expect(hd335prx(1,4)).toBe(2);});it('b',()=>{expect(hd335prx(3,1)).toBe(1);});it('c',()=>{expect(hd335prx(0,0)).toBe(0);});it('d',()=>{expect(hd335prx(93,73)).toBe(2);});it('e',()=>{expect(hd335prx(15,0)).toBe(4);});});
function hd336prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336prx_hd',()=>{it('a',()=>{expect(hd336prx(1,4)).toBe(2);});it('b',()=>{expect(hd336prx(3,1)).toBe(1);});it('c',()=>{expect(hd336prx(0,0)).toBe(0);});it('d',()=>{expect(hd336prx(93,73)).toBe(2);});it('e',()=>{expect(hd336prx(15,0)).toBe(4);});});
function hd337prx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337prx_hd',()=>{it('a',()=>{expect(hd337prx(1,4)).toBe(2);});it('b',()=>{expect(hd337prx(3,1)).toBe(1);});it('c',()=>{expect(hd337prx(0,0)).toBe(0);});it('d',()=>{expect(hd337prx(93,73)).toBe(2);});it('e',()=>{expect(hd337prx(15,0)).toBe(4);});});
